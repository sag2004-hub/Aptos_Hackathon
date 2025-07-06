<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Menu, X, Play, Users, Clock, Eye, Search, Bell, ChevronRight, Tv, Radio, Globe, Star, ExternalLink, Coins, CheckCircle, Wallet, AlertCircle } from "lucide-react";
import thumbnail from "../../assets/thumbnail.png";
import thumbnail1 from "../../assets/thumbnail1.png";
import thumbnail2 from "../../assets/thumbnail2.png";
import thumbnail3 from "../../assets/thumbnail3.png";
import thumbnail4 from "../../assets/thumbnail4.png";
import logo from "../../assets/logo.png";
export default function News() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [watchStartTime, setWatchStartTime] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [showRewardMessage, setShowRewardMessage] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rewardedVideos, setRewardedVideos] = useState(new Set());

  // Token reward settings
  const WATCH_TIME_THRESHOLD = 5 * 60; // 5 minutes in seconds
  const REWARD_AMOUNT = 100000; // 0.1 NICE tokens (considering 6 decimals)
  const TOKEN_DECIMALS = 6;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-slide for hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % liveStreams.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide for trending news
  useEffect(() => {
    const interval = setInterval(() => {
      setTrendingIndex((prev) => (prev + 1) % trendingNews.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Watch time tracking
  useEffect(() => {
    let interval;
    if (isWatching && watchStartTime && activeVideo) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const timeWatched = Math.floor((currentTime - watchStartTime) / 1000);
        setWatchTime(timeWatched);
        
        // Check if user has watched for 5 minutes and hasn't been rewarded for this video yet
        if (timeWatched >= WATCH_TIME_THRESHOLD && 
            !rewardedVideos.has(activeVideo.id) && 
            isWalletConnected) {
          mintTokenReward();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWatching, watchStartTime, activeVideo, rewardedVideos, isWalletConnected]);

  // Check if Aptos wallet is available
  const checkWalletAvailability = () => {
    if (typeof window !== 'undefined' && window.aptos) {
      return true;
    }
    return false;
  };

  // Connect to Aptos wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!checkWalletAvailability()) {
        throw new Error("Aptos wallet not detected. Please install Petra or Martian wallet.");
      }

      const response = await window.aptos.connect();
      setWalletAddress(response.address);
      setIsWalletConnected(true);
      
      // Fetch user balance
      await fetchUserBalance(response.address);
      
      console.log("Wallet connected successfully:", response.address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError(error.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      if (window.aptos) {
        await window.aptos.disconnect();
      }
      setIsWalletConnected(false);
      setWalletAddress("");
      setUserBalance(0);
      setEarnedTokens(0);
      setRewardedVideos(new Set());
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  // Fetch user token balance
  const fetchUserBalance = async (address) => {
    try {
      // Mock API call to fetch balance
      // In a real implementation, you would query the blockchain for the token balance
      const mockBalance = 500000; // Mock balance
      setUserBalance(mockBalance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  // Mint token reward
  const mintTokenReward = async () => {
    try {
      if (!isWalletConnected || !activeVideo) {
        throw new Error("Wallet not connected or no active video");
      }

      setIsLoading(true);
      
      // Prepare transaction payload
      const payload = {
        type: "entry_function_payload",
        function: "0x1::coin::mint", // Replace with your actual contract address and function
        type_arguments: ["0x1::nice_token::NiceToken"], // Replace with your token type
        arguments: [walletAddress, REWARD_AMOUNT.toString()]
      };

      // Sign and submit transaction
      const response = await window.aptos.signAndSubmitTransaction(payload);
      
      // Wait for transaction confirmation
      await window.aptos.waitForTransactionWithResult(response.hash);
      
      // Update local state
      const newTokens = REWARD_AMOUNT;
      setEarnedTokens(prev => prev + newTokens);
      setUserBalance(prev => prev + newTokens);
      setRewardedVideos(prev => new Set([...prev, activeVideo.id]));
      setShowRewardMessage(true);
      
      // Hide reward message after 5 seconds
      setTimeout(() => setShowRewardMessage(false), 5000);
      
      console.log(`Successfully minted ${newTokens} NICE tokens. Transaction hash: ${response.hash}`);
    } catch (error) {
      console.error("Failed to mint tokens:", error);
      
      // For demo purposes, if the transaction fails, simulate the reward locally
      const newTokens = REWARD_AMOUNT;
      setEarnedTokens(prev => prev + newTokens);
      setUserBalance(prev => prev + newTokens);
      setRewardedVideos(prev => new Set([...prev, activeVideo.id]));
      setShowRewardMessage(true);
      
      setTimeout(() => setShowRewardMessage(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video play
  const handleVideoPlay = (video) => {
    setActiveVideo(video);
    setWatchStartTime(Date.now());
    setIsWatching(true);
    setWatchTime(0);
  };

  // Handle video close
  const handleVideoClose = () => {
    setActiveVideo(null);
    setIsWatching(false);
    setWatchStartTime(null);
    setWatchTime(0);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format token amount
  const formatTokens = (amount) => {
    return (amount / Math.pow(10, TOKEN_DECIMALS)).toFixed(2);
  };

  // Format wallet address
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Mock data
  const liveStreams = [
    {
      id: 1,
      title: "NDTV 24x7 Live News",
      channel: "NDTV",
      viewers: 45200,
      category: "Breaking News",
      thumbnail: thumbnail,
      isLive: true,
      duration: "LIVE",
      youtubeId: "S6os3EgrzMk",
      youtubeUrl: "https://www.youtube.com/watch?v=S6os3EgrzMk"
    },
    {
      id: 2,
      title: "India Today Live TV",
      channel: "India Today",
      viewers: 28900,
      category: "News",
      thumbnail: thumbnail1,
      isLive: true,
      duration: "LIVE",
      youtubeId: "sYZtOFzM78M",
      youtubeUrl: "https://www.youtube.com/watch?v=sYZtOFzM78M"
    },
    {
      id: 3,
      title: "Times Now Live",
      channel: "Times Now",
      viewers: 35600,
      category: "Breaking News",
      thumbnail: thumbnail2,
      isLive: true,
      duration: "LIVE",
      youtubeId: "k-zqIlD1B_E",
      youtubeUrl: "https://www.youtube.com/watch?v=k-zqIlD1B_E"
    },
    {
      id: 4,
      title: "Republic TV Live",
      channel: "Republic TV",
      viewers: 42300,
      category: "Politics",
      thumbnail: thumbnail3,
      isLive: true,
      duration: "LIVE",
      youtubeId: "1b8bBvoIFHY",
      youtubeUrl: "https://www.youtube.com/watch?v=1b8bBvoIFHY"
    },
    {
      id: 5,
      title: "Zee News Live",
      channel: "Zee News",
      viewers: 31200,
      category: "Hindi News",
      thumbnail: "https://i.ytimg.com/vi/MN8p-Vrn6G0/maxresdefault.jpg",
      isLive: true,
      duration: "LIVE",
      youtubeId: "MN8p-Vrn6G0",
      youtubeUrl: "https://www.youtube.com/watch?v=MN8p-Vrn6G0"
    },
    {
      id: 6,
      title: "ABP Ananda Live",
      channel: "ABP Ananda",
      viewers: 67800,
      category: "National",
      thumbnail: thumbnail4,
      isLive: true,
      duration: "LIVE",
      youtubeId: "PKwLsAu-z10",
      youtubeUrl: "https://www.youtube.com/watch?v=PKwLsAu-z10"
    }
  ];

  const channels = [
    {
      id: 1,
      name: "NDTV",
      logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
      category: "News",
      subscribers: "2.3M",
      isVerified: true,
      liveNow: true,
      youtubeChannel: "https://www.youtube.com/@ndtv"
    },
    {
      id: 2,
      name: "India Today",
      logo: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop",
      category: "Breaking News",
      subscribers: "1.8M",
      isVerified: true,
      liveNow: true,
      youtubeChannel: "https://www.youtube.com/@indiatoday"
    },
    {
      id: 3,
      name: "Times Now",
      logo: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=100&h=100&fit=crop",
      category: "News",
      subscribers: "890K",
      isVerified: true,
      liveNow: true,
      youtubeChannel: "https://www.youtube.com/@timesnow"
    },
    {
      id: 4,
      name: "Republic TV",
      logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop",
      category: "Politics",
      subscribers: "1.2M",
      isVerified: true,
      liveNow: true,
      youtubeChannel: "https://www.youtube.com/@republictv"
    },
    {
      id: 5,
      name: "Zee News",
      logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
      category: "Hindi News",
      subscribers: "654K",
      isVerified: true,
      liveNow: true,
      youtubeChannel: "https://www.youtube.com/@zeenews"
    },
    {
      id: 6,
      name: "CNN",
      logo: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop",
      category: "International",
      subscribers: "2.1M",
      isVerified: true,
      liveNow: true,
      youtubeChannel: "https://www.youtube.com/@cnn"
    }
  ];

  const trendingNews = [
    "Breaking: New policy announced for economic reform",
    "Stock market hits record high amid positive sentiment",
    "Weather alert issued for coastal areas - heavy rainfall expected",
    "Tech giant launches revolutionary AI-powered platform",
    "Parliament session discusses climate change initiatives",
    "International trade agreement signed with major nations"
  ];

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&showinfo=0&modestbranding=1`;
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Token Reward Notification */}
      {showRewardMessage && (
        <div className="fixed top-32 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-bold">Reward Earned!</p>
            <p className="text-sm">You earned {formatTokens(REWARD_AMOUNT)} NICE tokens for watching!</p>
=======
import React, { useEffect, useState } from 'react';

// --- SVG Icons (Replacement for lucide-react) ---
const MenuIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Custom Carousel (Replacement for react-responsive-carousel) ---
const CustomCarousel = ({ children, autoPlay = true, interval = 4500 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = React.Children.toArray(children);

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const slideInterval = setInterval(next, interval);
    return () => clearInterval(slideInterval);
  }, [items.length]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((child, index) => (
          <div className="flex-shrink-0 w-full" key={index}>
            {child}
          </div>
        ))}
      </div>
       {/* Navigation Buttons */}
      <button onClick={prev} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition">
        &#10094;
      </button>
      <button onClick={next} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition">
        &#10095;
      </button>
       {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};


// --- Main App Component ---
export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const liveNews = [
    {
      title: "Flood Alert in Assam",
      description: "Heavy rain causes flooding in 12 districts of Assam.",
      image: "https://i.ytimg.com/vi/9x48Ag-TtP8/maxresdefault.jpg"
    },
    {
      title: "Election Results 2025",
      description: "Live counting updates from key constituencies.",
      image: "https://images.indianexpress.com/2025/02/Feb1-64.jpg"
    },
    {
      title: "India Wins Cricket Final",
      description: "Historic win by India in the ICC tournament.",
      image: "https://i.ytimg.com/vi/-Vf0JbkPV6s/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCFCxwcg5_5itK-YWxGHZq_DGi2MA"
    }
  ];

  // Placeholder for the logo import
  const logoUrl = "https://placehold.co/128x128/f97316/FFFFFF?text=B1&font=sans";

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-xl font-semibold text-orange-400 hidden sm:block">BartaOne News</span>
>>>>>>> f515f4718db48f6503615b3448ecf93066dd58a1
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Error Notification */}
      {error && (
        <div className="fixed top-32 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError("")}
            className="ml-2 text-white hover:text-red-200"
          >
            <X className="w-4 h-4" />
=======
          <nav className="hidden md:flex space-x-8 text-sm font-medium items-center">
            <a href="/dashboard" className="hover:text-orange-400 transition-colors">Home</a>
            <a href="#" className="hover:text-orange-400 transition-colors">News</a>
            <a href="#" className="hover:text-orange-400 flex items-center gap-1.5">
              Live <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
            </a>
            <a href="#">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full hover:shadow-lg transition">
                Sign In
              </button>
            </a>
          </nav>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
>>>>>>> f515f4718db48f6503615b3448ecf93066dd58a1
          </button>
        </div>
      )}

<<<<<<< HEAD
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? " backdrop-blur-md border-b border-slate-200 shadow-lg" 
            : "bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">NewsStream</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="/dashboard" className={`font-medium hover:text-orange-500 transition ${isScrolled ? 'text-white' : 'text-white'}`}>
                Home
              </a>
              <a href="#" className={`font-medium hover:text-orange-500 transition ${isScrolled ? 'text-white' : 'text-white'}`}>
                News
              </a>
              <a href="#" className={`font-medium hover:text-orange-500 transition flex items-center gap-2 ${isScrolled ? 'text-white' : 'text-white'}`}>
                Live
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </a>
              <a href="#" className={`font-medium hover:text-orange-500 transition ${isScrolled ? 'text-white' : 'text-white'}`}>
                Channels
              </a>
              
              <div className="flex items-center gap-3">
                {isWalletConnected && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm">
                    <Coins className="w-4 h-4" />
                    {formatTokens(userBalance)} NICE
                  </div>
                )}
                <button className={`p-2 rounded-full hover:bg-slate-100 transition ${isScrolled ? 'text-white' : 'text-white'}`}>
                  <Search className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-full hover:bg-slate-100 transition ${isScrolled ? 'text-white' : 'text-white'}`}>
                  <Bell className="w-5 h-5" />
                </button>
                {!isWalletConnected ? (
                  <button 
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm">
                      {formatAddress(walletAddress)}
                    </div>
                    <button 
                      onClick={disconnectWallet}
                      className="bg-red-500 text-white px-3 py-2 rounded-full hover:bg-red-600 transition text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </nav>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`md:hidden ${isScrolled ? 'text-slate-700' : 'text-white'}`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4 space-y-4">
            <a href="#" className="block text-slate-700 hover:text-orange-500 font-medium">Home</a>
            <a href="#" className="block text-slate-700 hover:text-orange-500 font-medium">News</a>
            <a href="#" className="block text-slate-700 hover:text-orange-500 font-medium">Live</a>
            <a href="#" className="block text-slate-700 hover:text-orange-500 font-medium">Channels</a>
            <button 
              onClick={isWalletConnected ? disconnectWallet : connectWallet}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : (isWalletConnected ? 'Disconnect' : 'Connect Wallet')}
            </button>
=======
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50">
            <div className="px-6 py-4 space-y-4 text-white">
              <a href="#" className="block hover:text-orange-400">Home</a>
              <a href="#" className="block hover:text-orange-400">News</a>
              <a href="#" className="block hover:text-orange-400">Live</a>
              <a href="#">
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full">
                  Sign In
                </button>
              </a>
            </div>
>>>>>>> f515f4718db48f6503615b3448ecf93066dd58a1
          </div>
        )}
      </header>

<<<<<<< HEAD
      {/* Trending Bar */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 shadow-lg mt-5">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-bold text-sm">TRENDING NOW:</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${trendingIndex * 100}%)` }}
            >
              {trendingNews.map((news, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full"
                >
                  <span className="text-sm font-medium">{news}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {trendingNews.map((_, index) => (
              <button
                key={index}
                onClick={() => setTrendingIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === trendingIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-36 space-y-16 mt-4">
        
        {/* Hero Live Stream */}
        <section className="px-6 max-w-7xl mx-auto">
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-video relative">
              <img 
                src={liveStreams[currentSlide].thumbnail} 
                alt={liveStreams[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Live Badge */}
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
              
              {/* Token Reward Info */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Earn 0.1 NICE for 5min watch
              </div>
              
              {/* Watch Progress */}
              {isWatching && activeVideo?.id === liveStreams[currentSlide].id && (
                <div className="absolute top-16 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {formatTime(watchTime)} / {formatTime(WATCH_TIME_THRESHOLD)}
                </div>
              )}
              
              {/* Play Button */}
              <button 
                onClick={() => handleVideoPlay(liveStreams[currentSlide])}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </button>
              
              {/* Stream Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-white text-2xl font-bold mb-2">{liveStreams[currentSlide].title}</h2>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {liveStreams[currentSlide].viewers.toLocaleString()} watching
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {liveStreams[currentSlide].duration}
                  </span>
                  <span className="bg-orange-500 px-2 py-1 rounded text-sm">
                    {liveStreams[currentSlide].category}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {liveStreams.slice(0, 3).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="bg-slate-950 min-h-screen text-white">
          <main className="py-12 space-y-20">
            {/* Live Streams */}
            <section className="px-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Tv className="w-8 h-8 text-orange-500" />
                  Live News
                </h2>
                <button className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveStreams.map((stream) => (
                  <div
                    key={stream.id}
                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition group"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onClick={() => setActiveVideo(stream)}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-slate-800">{stream.title}</h3>
                      <p className="text-slate-600 mb-3">{stream.channel}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {stream.viewers.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {stream.duration}
                          </span>
                        </div>
                        <button
                          onClick={() => openInNewTab(stream.youtubeUrl)}
                          className="text-orange-500 hover:text-orange-600 transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-3">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                          {stream.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Popular Channels */}
            <section className="px-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-500" />
                  Popular Channels
                </h2>
                <button className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-slate-800">
                            {channel.name}
                          </h3>
                          {channel.isVerified && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-slate-600 text-sm">{channel.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-500 text-sm">
                        {channel.subscribers} subscribers
                      </span>
                      {channel.liveNow && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition font-medium">
                        Subscribe
                      </button>
                      <button
                        onClick={() => openInNewTab(channel.youtubeChannel)}
                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </main>
    </div>
    );
}
=======
      {/* Carousel Section */}
      <div className="pt-[80px]">
        <CustomCarousel>
          {liveNews.map((news, idx) => (
            <div key={idx} className="relative h-[420px] md:h-[500px]">
              <img src={news.image} alt={news.title} className="w-full h-full boject-fit" />
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-6">
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text">
                  {news.title}
                </h2>
                <p className="mt-4 text-lg md:text-xl max-w-2xl text-slate-300">{news.description}</p>
              </div>
            </div>
          ))}
        </CustomCarousel>
      </div>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-orange-400">Never Miss Breaking News</h2>
          <p className="text-xl text-slate-300 mb-6">Subscribe for real-time alerts on regional and national updates tailored to your interests.</p>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-white font-semibold rounded-full hover:scale-105 transition transform">
            Enable Notifications
          </button>
        </div>
      </section>
    </div>
  );
}
>>>>>>> f515f4718db48f6503615b3448ecf93066dd58a1
