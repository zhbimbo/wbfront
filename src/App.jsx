import React, { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, Loader, FileSpreadsheet } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  // Замените на URL вашего бэкенда на Render
  const API_BASE_URL = 'https://wb-report-api.onrender.com/';

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Пожалуйста, выберите файл формата .xlsx или .csv');
        setFile(null);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Пожалуйста, выберите файл формата .xlsx или .csv');
        setFile(null);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Пожалуйста, выберите файл для загрузки.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
      } else {
        setError(data.error || 'Ошибка при обработке файла на сервере.');
      }
    } catch (err) {
      console.error('Ошибка сети:', err);
      setError('Ошибка соединения с сервером обработки.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (uploadResult && uploadResult.result_filename) {
      const link = document.createElement('a');
      link.href = `${API_BASE_URL}${uploadResult.download_url}`;
      link.setAttribute('download', uploadResult.result_filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Анализ отчетов Wildberries
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Загрузите отчет и получите детализированный анализ
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".xlsx,.csv"
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Файл выбран
                  </h3>
                  <p className="text-gray-600 truncate max-w-xs">{file.name}</p>
                  <button
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-upload').click();
                    }}
                  >
                    Выбрать другой
                  </button>
                </div>
              ) : (
                <div>
                  <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Перетащите файл сюда
                  </h3>
                  <p className="text-gray-600 mb-4">или нажмите для выбора</p>
                  <p className="text-sm text-gray-500">
                    Поддерживаемые форматы: .xlsx, .csv
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={!file || isUploading}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                  !file || isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Обрабатываем...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Обработать отчет
                  </>
                )}
              </button>
            </div>

            {uploadResult && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        {uploadResult.message}
                      </h3>
                      <p className="text-sm text-green-600 mt-1">
                        Файл готов к скачиванию
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Скачать
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Анализ отчетов Wildberries</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
