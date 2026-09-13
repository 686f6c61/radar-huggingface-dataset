# AcyLa/crypto-predictive-model

## Resumen

AcyLa/crypto-predictive-model es un repositorio publicado en Hugging Face que no contiene un modelo de lenguaje, sino un pipeline de aprendizaje automático para la predicción de precios de criptomonedas. El autor (AcyLa) lo presenta como una herramienta de grado producción construida sobre hasta 15 años de datos históricos OHLCV descargados de Yahoo Finance, con un conjunto de 207 indicadores técnicos causales como espacio de características y un esquema de etiquetado multi-horizonte (1, 3, 7, 14 y 30 días) que combina regresión, clasificación y triple barrera.

La arquitectura es un ensemble de dos componentes: LightGBM (gradient boosting sobre árboles) y una red LSTM con attention pooling. Según la model card, el repositorio incluye utilidades de entrenamiento, un motor de backtesting walk-forward con purgado para evitar look-ahead bias y una API de predicción en tiempo real con votación de consenso entre horizontes. El interés práctico declarado es su integración en sistemas de trading de alta frecuencia, con latencias declaradas inferiores a 1 ms en modo solo LightGBM y de aproximadamente 6-50 ms en CPU cuando se añade la LSTM.

Es relevante ahora porque ejemplifica una categoría distinta de la de los modelos generativos: artefactos de series temporales financieras empaquetados como repositorios reproducibles. Al mismo tiempo, conviene señalarlo con cautela: el repositorio fue generado automáticamente por ML Intern (un agente de Hugging Face), no declara licencia, no publica benchmarks, no tiene descargas ni likes, y su tamaño de repositorio figura como 0.0 GB, por lo que los pesos entrenados en formato joblib podrían no estar realmente incluidos en el Hub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de LightGBM (gradient boosting) + LSTM con attention pooling |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de series temporales; ventana de features no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | joblib (según las etiquetas del repositorio); el repositorio figura con 0.0 GB, por lo que no se confirma que los artefactos estén publicados |

Datos adicionales declarados por el autor:

| Parámetro | Valor |
|---|---|
| Fuente de datos | Yahoo Finance, OHLCV de hasta 15 años (BTC desde 2014) |
| Número de características | 207 indicadores técnicos causales (tendencia, momento, volatilidad, volumen, estructura de precio, régimen, calendario) |
| Horizontes de predicción | 1, 3, 7, 14 y 30 días |
| Tipos de etiqueta | regresión, clasificación y triple barrera |
| Validación | walk-forward cross-validation con purgado |
| Latencia declarada | < 1 ms (solo LightGBM); ~6-50 ms (LightGBM + LSTM en CPU) |
| Repositorio | https://huggingface.co/AcyLa/crypto-predictive-model |
| Fecha de creación / actualización | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El pipeline descrito sigue la secuencia «descarga de datos (yfinance) → características (207 indicadores) → etiquetas multi-horizonte → ensemble (LightGBM + LSTM) → API de predicción», con un backtester walk-forward con purgado alimentando el proceso de validación. El componente LightGBM opera sobre las características tabulares de los indicadores técnicos, mientras que la LSTM procesa secuencias con un mecanismo de attention pooling para agregar la información temporal. La predicción final se obtiene mediante votación de consenso entre los distintos horizontes, y el autor reporta un parámetro `use_lstm=False` para desactivar la red recurrente y quedarse con el camino de bajísima latencia.

No se especifican en la información disponible el número de tokens o muestras de entrenamiento, la composición exacta del dataset más allá de la fuente Yahoo Finance, el número de capas o unidades de la LSTM, los hiperparámetros del gradient boosting, ni si se aplicó algún tipo de ajuste por alineación con preferencias humanas (RLHF, DPO), algo que además no aplica a esta familia de modelos. La innovación técnica destacada por el autor es metodológica más que arquitectónica: el uso de validación walk-forward con purgado y triple barrera para evitar look-ahead bias en series financieras, junto con la separación en dos modos de latencia para distintos estilos de operación.

## Capacidades

- Predicción de precios de criptomonedas con múltiples horizontes temporales (1, 3, 7, 14 y 30 días), combinando regresión y clasificación.
- Generación de señales de consenso entre horizontes mediante votación, con un valor de confianza asociado (`consensus_confidence`).
- Cálculo de 207 indicadores técnicos causales a partir de datos OHLCV.
- Etiquetado con método de triple barrera, orientado a definir objetivos de beneficio y límites de pérdida de forma consistente.
- Backtesting walk-forward con purgado para evaluar la estrategia sin filtración de información futura.
- Modo de inferencia de baja latencia (solo LightGBM, < 1 ms) y modo de mayor coste computacional (LightGBM + LSTM en CPU, ~6-50 ms).
- Ejemplo de bucle de trading con gestión de posición, stop-loss y take-profit (`hft_integration.py`).
- Interfaz de predicción programática (`CryptoPredictor`) y CLI (`predict.py --ticker`) parametrizable por ticker.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües, ya que no es un modelo de lenguaje.
- No se documenta soporte de cuantización ni formatos alternativos de pesos.

## Casos de uso

- Señalización para trading algorítmico de criptoactivos: el modelo devuelve predicciones multi-horizonte y un consenso con confianza, de modo que una estrategia sistemática puede dimensionar posiciones según el horizonte con mayor convicción.
- Integración en sistemas de alta frecuencia de baja latencia: con el modo solo LightGBM (< 1 ms declarado) se puede invocar la predicción en cada tick o en cada actualización de libro sin convertir el modelo en el cuello de botella del bucle.
- Trading de swing con horizonte de días: el modo LightGBM + LSTM (~6-50 ms en CPU) puede emplearse en cierres de vela diaria o de 4 horas para decidir entradas y salidas con contexto secuencial.
- Investigación académica sobre validación de series temporales financieras: el repositorio incluye un backtester walk-forward con purgado y etiquetado de triple barrera que sirve como implementación de referencia para estudiar sesgos de look-ahead.
- Generación de características para otros modelos: el módulo `features.py` produce 207 indicadores causales reutilizables como entrada de modelos propios, incluidos transformadores de series temporales.
- Construcción de sistemas de gestión de riesgo: los ejemplos de stop-loss, take-profit y gestión de posición en `hft_integration.py` pueden adaptarse como capa de control independiente de la señal del modelo.
- Prototipado y comparación de enfoques de gradient boosting frente a redes recurrentes sobre el mismo conjunto de características, gracias a la posibilidad de activar o desactivar la LSTM.
- Análisis exploratorio por ticker en un mercado concreto (por ejemplo BTC-USD), útil para estudiar la estabilidad temporal de las señales antes de comprometer capital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error (MAE, RMSE), métricas de clasificación (accuracy, F1, AUC), Sharpe, drawdown máximo, ratio de aciertos ni comparaciones cuantitativas contra líneas base. Las únicas cifras de rendimiento declaradas son de latencia de inferencia: menos de 1 ms en modo solo LightGBM y aproximadamente 6-50 ms en CPU con LightGBM + LSTM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el tamaño de los pesos ni la arquitectura concreta de la LSTM, por lo que no puede estimarse con rigor.
- GPU recomendadas: no aplica según la documentación; el autor describe la inferencia en CPU (el modo LightGBM + LSTM se mide «en CPU»). No se menciona CUDA, A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no aplica para LightGBM, que es un modelo de árboles; la LSTM podría beneficiarse de una GPU, pero no se documenta ni se cuantifica.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de modelos de lenguaje. El despliegue previsto es mediante scripts de Python (`train.py`, `predict.py`, `hft_integration.py`) con dependencias `yfinance`, `pandas`, `numpy`, `scikit-learn`, `lightgbm`, `ta`, `torch`, `pyarrow` y `joblib`.
- Latencia y throughput: < 1 ms con solo LightGBM (uso declarado para HFT a nivel de tick); ~6-50 ms con LightGBM + LSTM en CPU (uso declarado para swing trading). No se especifica throughput en predicciones por segundo.
- Almacenamiento: los datos de hasta 15 años de OHLCV descargados de Yahoo Finance y los artefactos joblib requieren espacio en disco, pero no se publica una cifra. El repositorio en el Hub figura con 0.0 GB.

## Comparativa con modelos similares

No disponible. La búsqueda web realizada no ha devuelto información relevante sobre este repositorio ni sobre modelos comparables: los resultados obtenidos corresponden a hilos de foro sobre teléfonos móviles y no guardan relación con el modelo. En la información proporcionada tampoco se citan alternativas de la misma categoría (por ejemplo, otros ensembles de gradient boosting y redes recurrentes para predicción de criptoactivos) con datos verificables de parámetros, contexto, rendimiento o licencia.

| Criterio | AcyLa/crypto-predictive-model | Alternativa 1 | Alternativa 2 | Alternativa 3 |
|---|---|---|---|---|
| Parámetros | no disponible | no disponible | no disponible | no disponible |
| Contexto | no aplica | no disponible | no disponible | no disponible |
| Rendimiento | sin benchmarks publicados | no disponible | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible | no disponible |
| Disponibilidad | repo en HF, 0 descargas, 0.0 GB declarados | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo, robustez por régimen de mercado ni comportamiento en activos distintos de BTC. El conjunto de datos procede de una única fuente (Yahoo Finance), con la calidad y los huecos que ello implica.
- Riesgo de alucinación: no aplica en el sentido de un modelo de lenguaje, pero sí existe un riesgo equivalente de sobreajuste y de señales espurias, especialmente con 207 características sobre un único activo y sin métricas publicadas que respalden la capacidad de generalización.
- Limitaciones de contexto o idioma: no aplica el concepto de ventana de contexto de un LLM; el alcance se limita a los tickers disponibles en Yahoo Finance y a los horizontes definidos (1, 3, 7, 14 y 30 días).
- Restricciones de licencia: el repositorio no declara licencia. En ausencia de licencia explícita, no se conceden derechos de uso, modificación ni redistribución, por lo que el uso comercial no está autorizado de forma clara.
- Advertencia financiera explícita del autor: se trata de una herramienta de investigación, no de asesoramiento financiero, y recomienda hacer backtest con costes de transacción y no arriesgar más de lo que se puede permitir perder.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica de rendimiento; tampoco métricas financieras como Sharpe, drawdown o ratio de aciertos. Cualquier evaluación de utilidad real exigiría un backtest propio con costes, deslizamiento y liquidez realistas.
- Artefactos no verificables: el tamaño del repositorio figura como 0.0 GB y no se confirma la presencia de los modelos entrenados en `models/BTC-USD/`, de modo que los comandos de la model card podrían no ser reproducibles tal cual.
- Origen automatizado: el repositorio fue generado por ML Intern, un agente de Hugging Face, según la marca de procedencia incluida en la model card. No consta validación humana ni revisión por pares.
- Fragmento de uso incorrecto: la sección «Usage» de la model card propone cargar el modelo con `AutoModelForCausalLM` y `AutoTokenizer`, algo que no corresponde a un ensemble de LightGBM y LSTM exportado en joblib. Ese ejemplo debe ignorarse.
- Fechas anómalas: las marcas de creación y actualización (2026-09-12) son posteriores a la fecha habitual de publicación y no se explican en la documentación.
- Sin métricas de latencia reproducibles de forma independiente: las cifras de < 1 ms y ~6-50 ms provienen únicamente del autor y no se especifica el hardware exacto con el que se midieron.
- Riesgo de deriva de régimen: los modelos entrenados sobre datos históricos de criptoactivos pueden degradarse rápidamente ante cambios estructurales de mercado, algo que no se aborda en la documentación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AcyLa/crypto-predictive-model
- ML Intern (agente generador), repositorio: https://github.com/huggingface/ml-intern
- ML Intern, demo en Hugging Face Spaces: https://smolagents-ml-intern.hf.space
- yfinance (dependencia de descarga de datos): https://pypi.org/project/yfinance/
- LightGBM (dependencia del ensemble): https://github.com/microsoft/LightGBM
- PyTorch (dependencia de la LSTM): https://pytorch.org/
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a hilos de foro sobre dispositivos móviles y no se incluyen por no ser pertinentes.
