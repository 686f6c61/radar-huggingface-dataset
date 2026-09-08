# ismailtasdelen/tvta-vision

# TVTA-Vision: Dataset de análisis técnico de TradingView

## Resumen

TVTA-Vision es un dataset multimodal de investigación para entrenar y evaluar modelos de lenguaje visual (VLM) en la comprensión de gráficos financieros estilo TradingView y análisis técnico estructurado. Lo desarrolla Ismail Tasdelen (ismailtasdelen) y resuelve el problema de la escasez de datos anotados para que los VLM interpreten gráficos de velas y generen análisis técnico. El dataset incluye imágenes de gráficos, anotaciones estructuradas de indicadores técnicos, estructura de mercado, patrones, soporte/resistencia, clasificación de tendencia, rendimiento forward (calculado solo con velas futuras para evitar sesgo de hindsight), pares pregunta-respuesta y análisis en lenguaje natural. No es un modelo, por lo que no dispone de arquitectura ni parámetros. El subconjunto publicado contiene 80 muestras (50 de entrenamiento, 15 de validación y 15 de prueba), que cubren 61 activos y 10 marcos temporales. La pipeline de generación soporta la creación escalable de más de 50.000 muestras, pero el dataset actual es una demostración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (dataset multimodal de visión-lenguaje) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplica (imágenes PNG y archivos JSONL) |
| Tipo de recurso | Dataset |
| Tamaño del dataset | 80 muestras (50 train, 15 validation, 15 test) |
| Activos cubiertos | 61 (15 criptomonedas, 15 acciones EE.UU., 4 índices, 7 forex, 4 materias primas) |
| Timeframes | 10 (1m, 5m, 15m, 30m, 1h, 4h, 12h, 1d, 1wk, 1mo) |
| Anotaciones | Indicadores, estructura de mercado, patrones, soporte/resistencia, rendimiento forward, QA, análisis en lenguaje natural |
| Fuente de datos | OHLCV real de Binance y yfinance, imágenes generadas estilo TradingView |
| Escalabilidad | Pipeline soporta generación de 50.000+ muestras |

## Arquitectura y entrenamiento

TVTA-Vision no es un modelo, sino un dataset generado mediante un pipeline de creación de datos. El pipeline (`generate_dataset.py`) obtiene datos OHLCV reales de Binance y yfinance, calcula indicadores técnicos (RSI, MACD, EMA, ADX, análisis de volumen), genera imágenes de gráficos de velas estilo TradingView, detecta patrones y estructura de mercado, calcula el rendimiento forward usando exclusivamente velas futuras y produce pares QA y resúmenes en lenguaje natural. La metodología está documentada en `metadata/methodology.json`. No se aplica RLHF/DPO, ya que no hay un modelo entrenado; el objetivo es proporcionar datos de supervisión para entrenar VLM.

## Capacidades

- Comprensión de gráficos de velas estilo TradingView: el dataset proporciona imágenes de gráficos con velas realistas y condiciones de mercado variadas.
- Anotaciones estructuradas: indicadores técnicos (RSI, MACD, EMA, ADX, volumen), estructura de mercado (tendencia, secuencia HH/HL, breaks), patrones de velas y figuras técnicas, niveles de soporte y resistencia.
- Datos de rendimiento forward: retornos a 1, 5, 10 y 20 velas, máximo favorable/adverso y drawdown máximo, calculados solo con velas futuras para evitar sesgo de hindsight.
- Pares QA: múltiples preguntas y respuestas por gráfico para ajuste por instrucciones.
- Análisis en lenguaje natural: resúmenes legibles por humanos del análisis técnico.
- Cobertura de activos: 15 criptomonedas (BTCUSDT, ETHUSDT, etc.), 15 acciones de EE.UU. (AAPL, MSFT, NVDA, etc.), 4 índices (S&P 500, Nasdaq 100, Dow Jones, Russell 2000), 7 pares de forex y 4 materias primas (oro, plata, petróleo WTI y Brent).
- Timeframes: 10 marcos temporales, desde 1 minuto hasta 1 mes, con pesos específicos.
- Escalabilidad: el pipeline soporta la generación de 50.000+ muestras, aunque el dataset publicado es un subconjunto de demostración.

## Casos de uso

- Entrenamiento de VLM para análisis técnico automatizado: el dataset puede usarse para ajustar un modelo de visión-lenguaje que reciba una imagen de gráfico y genere un análisis técnico estructurado con indicadores, tendencia y patrones. Es adecuado porque las anotaciones son completas y siguen un esquema JSONL consistente.
- Evaluación de VLM en comprensión de gráficos financieros: los pares QA y las anotaciones de referencia permiten medir la precisión de un modelo para identificar patrones, niveles de soporte/resistencia y clasificaciones de tendencia. El dataset incluye un split de test separado.
- Generación de informes de análisis técnico automatizados: un VLM entrenado con este dataset puede producir resúmenes en lenguaje natural de las condiciones del mercado, lo que facilita la automatización de informes para traders.
- Asistencia a decisiones de trading: el modelo puede usarse en herramientas de soporte a decisiones que analicen gráficos en tiempo real y señalen indicadores relevantes, patrones y posibles rupturas. Los datos de rendimiento forward permiten contextualizar la fiabilidad de las señales.
- Investigación en fintech y análisis cuantitativo: el dataset proporciona datos estructurados para estudiar la relación entre patrones técnicos y resultados futuros. Las anotaciones de rendimiento forward permiten validar hipótesis sin sesgo de hindsight.
- Desarrollo de agentes conversacionales financieros: los pares QA pueden usarse para entrenar chatbots que respondan preguntas sobre gráficos, indicadores y análisis técnico, integrándose en plataformas de trading o atención al cliente.
- Backtesting de estrategias basadas en análisis técnico: las anotaciones de estructura de mercado, patrones y rendimiento forward permiten probar hipótesis sobre la eficacia de señales técnicas en distintos activos y marcos temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El dataset no incluye métricas de rendimiento de modelos entrenados con él.

## Requisitos de hardware

- Almacenamiento: el tamaño exacto de las imágenes y archivos no está especificado, pero al ser un dataset multimodal con imágenes PNG y archivos JSONL, se requiere espacio en disco suficiente para el subconjunto publicado y para la generación de nuevas muestras.
- Generación de datos: para ejecutar el pipeline se necesita una máquina con acceso a internet para obtener datos OHLCV de Binance y yfinance, y las librerías de Python indicadas en `src/`. No se especifican requisitos de GPU.
- Entrenamiento de VLM: no hay datos de VRAM estimada. La GPU necesaria dependerá del modelo de visión-lenguaje elegido, no del dataset.
- Opciones de despliegue: el dataset puede utilizarse con frameworks de aprendizaje automático como PyTorch y Hugging Face Transformers. No es aplicable a vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo.

## Comparativa con modelos similares

No disponible. No se han identificado datasets comparables en la información proporcionada.

## Limitaciones y advertencias

- El dataset publicado es un subconjunto de demostración con solo 80 muestras; no es suficiente para entrenar modelos robustos a escala.
- La pipeline soporta la generación de más de 50.000 muestras, pero estas no se incluyen en el repositorio actual.
- Las imágenes son generadas con estilo TradingView, no capturas reales; pueden existir diferencias con gráficos de plataformas reales.
- Los datos de rendimiento forward se limitan a un horizonte máximo de 20 velas; no se proporciona información sobre rendimiento a largo plazo.
- No se ha especificado la licencia del dataset, lo que puede restringir su uso comercial.
- Los idiomas soportados no están documentados; el análisis en lenguaje natural parece estar en inglés, pero no se confirma.
- La cobertura de activos se centra en criptomonedas, acciones de EE.UU., índices, forex y materias primas, lo que limita la generalización a otros mercados o clases de activos.
- No se han publicado evaluaciones de calidad ni benchmarks que validen la fiabilidad de las anotaciones.

## Enlaces

- HuggingFace: https://huggingface.co/ismailtasdelen/tvta-vision
- Perfil del autor: https://huggingface.co/ismailtasdelen
- Otro dataset del autor: https://huggingface.co/datasets/ismailtasdelen/FaceAesthetic-HumanAI
