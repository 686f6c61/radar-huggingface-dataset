# NeoQuasar/Kronos-small

## Resumen

Kronos-small es un modelo fundacional de código abierto para series temporales financieras desarrollado por NeoQuasar. Forma parte de la familia Kronos, presentada como la primera familia open source de modelos fundacionales entrenados específicamente sobre velas japonesas (K-lines) procedentes de más de 45 mercados bursátiles globales. El modelo resuelve el problema de predecir la evolución de precios, volatilidad y otros estadísticos de mercado a partir de secuencias OHLCV, un dominio tradicionalmente dominado por modelos estadísticos clásicos (ARIMA, GARCH) o por redes específicas por activo.

Kronos-small cuenta con 24,7 millones de parámetros y una longitud de contexto de 512 pasos de K-line, y sigue una arquitectura decoder-only autoregresiva combinada con un tokenizador especializado que discretiza datos continuos multidimensionales en tokens jerárquicos. Se entrenó sobre un corpus de más de 12.000 millones de registros de velas de 45 exchanges, lo que le permite operar en régimen zero-shot sobre tareas como forecasting de precios, forecasting de volatilidad o generación de datos sintéticos.

Su relevancia actual radica en que demuestra que el paradigma de preentrenamiento a gran escala de los LLM es trasladable a series temporales financieras con un modelo de apenas 24,7 M de parámetros, publicable bajo licencia MIT y ejecutable en hardware muy modesto. El checkpoint acumula más de 1,6 millones de descargas en Hugging Face desde su publicación en junio de 2025, lo que lo sitúa como una referencia práctica dentro de los modelos fundacionales de series temporales (TSFM).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo con tokenizador especializado de K-lines (esquema de dos etapas: tokenizador + transformer) |
| Parámetros totales | 24.741.696 (24,7 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 pasos de K-line |
| Tipos de cuantización | no disponible. Pesos distribuidos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ en la información disponible |
| Idiomas soportados | no disponible (modelo especializado en series temporales financieras, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tokenizador asociado | Kronos-Tokenizer-base |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Kronos sigue un esquema en dos etapas. Primero, un tokenizador especializado cuantiza los datos continuos y multidimensionales de cada vela (OHLCV: open, high, low, close, volume) en tokens discretos jerárquicos, preservando tanto la dinámica de precios como los patrones de actividad de negociación. Después, un transformer autoregresivo decoder-only se preentrena sobre esas secuencias de tokens con un objetivo de predicción del siguiente token, lo que le permite modelar la distribución conjunta de la evolución futura de la serie.

El preentrenamiento se realizó sobre un corpus multimercado de más de 12.000 millones de registros de K-line procedentes de 45 exchanges globales, lo que aporta cobertura cross-asset y multi-mercado. La model card no detalla la composición exacta del dataset ni si hubo fases de RLHF, DPO o ajuste supervisado posteriores; únicamente se especifica el objetivo autoregresivo y el régimen de evaluación zero-shot. La innovación técnica principal es el propio tokenizador de K-lines, que permite aplicar el paradigma de los LLM a datos financieros de alta relación señal-ruido sin recurrir a arquitecturas específicas por tarea.

## Capacidades

- Predicción de series de precios (price series forecasting) en régimen zero-shot sobre pares y activos no vistos durante el entrenamiento.
- Forecasting de volatilidad a partir de la secuencia histórica de velas.
- Generación de datos sintéticos de K-lines realistas, útil para aumentación de datos y simulación.
- Procesamiento de datos multidimensionales OHLCV con volumen y amount opcionales.
- Modelado cross-asset y multi-mercado gracias al entrenamiento sobre 45 exchanges.
- Aprendizaje de representaciones temporales y cross-asset que pueden reutilizarse en tareas cuantitativas downstream.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades de visión o audio: es un modelo puramente numérico-secuencial.

## Casos de uso

- Predicción de precios a corto plazo: el modelo recibe una ventana de hasta 512 velas históricas (open, high, low, close y, opcionalmente, volume y amount) y devuelve la distribución de precios futura para el horizonte solicitado, aprovechable como señal cuantitativa en estrategias sistemáticas.
- Forecasting de volatilidad: alimentando la serie histórica de velas se obtiene una estimación de la volatilidad futura, útil para dimensionar posiciones, fijar stops o calibrar modelos de riesgo tipo VaR.
- Generación de datos sintéticos para backtesting: al muestrear de la distribución aprendida se generan trayectorias de precios sintéticas que permiten aumentar el número de escenarios en simulaciones y pruebas de robustez de estrategias.
- Investigación cuantitativa: sirve como baseline fundacional zero-shot contra el que comparar modelos estadísticos clásicos y redes específicas por activo, reduciendo el coste de ingeniería de features por mercado.
- Detección de regímenes de mercado: las representaciones internas del modelo pueden emplearse para clasificar estados de volatilidad o liquidez y condicionar la exposición en carteras multi-activo.
- Prototipado rápido en FinTech: con 24,7 M de parámetros y pesos MIT, un equipo puede desplegar un servicio de forecasting en CPU o en una GPU de consumo en horas, sin depender de proveedores externos.
- Aumentación de datasets financieros: combinando generación sintética con datos reales para entrenar modelos downstream cuando se dispone de pocos activos o historiales cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia el paper arXiv:2508.02739 y una demo en vivo sobre BTC/USDT a 24 horas, pero no incluye tablas con métricas numéricas (MAE, RMSE, MASE, etc.) ni comparaciones cuantitativas con otros TSFM.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 100 MB en fp32 y en torno a 50 MB en fp16/bf16, dado el tamaño de 24,7 M de parámetros (el repositorio ocupa 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; funcionan RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad. El modelo también se ejecuta en CPU.
- Cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos de borde y en Apple Silicon (existe una conversión MLX comunitaria, gxcsoccer/kronos-mlx-small).
- Opciones de despliegue: el código oficial de GitHub (clases `Kronos`, `KronosTokenizer` y `KronosPredictor` sobre PyTorch) es la vía documentada, con `device="cuda:0"` o CPU. Al tratarse de una arquitectura con tokenizador propio, no se documenta soporte nativo en vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kronos-small | 24,7 M | 512 | Kronos-Tokenizer-base | MIT | Público en Hugging Face |
| Kronos-mini | 4,1 M | 2048 | Kronos-Tokenizer-2k | MIT | Público en Hugging Face |
| Kronos-base | 102,3 M | 512 | Kronos-Tokenizer-base | MIT | Público en Hugging Face |
| Kronos-large | 499,2 M | 512 | Kronos-Tokenizer-base | MIT | No publicado todavía |

Kronos-small se posiciona como el checkpoint intermedio de la familia: cuadruplica los parámetros de Kronos-mini y ofrece mayor capacidad, a costa de reducir el contexto de 2048 a 512 pasos. Frente a Kronos-base, ofrece una fracción del coste computacional (24,7 M frente a 102,3 M de parámetros) manteniendo el mismo tokenizador y contexto. No se dispone de datos cuantitativos para comparar con otras familias de TSFM como Chronos, TimesFM o Moirai en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en series temporales financieras: no procesa lenguaje natural, no responde a instrucciones y no soporta tool calling ni agentes.
- Longitud de contexto limitada a 512 pasos de K-line; entradas más largas se truncan automáticamente en `KronosPredictor`, lo que puede degradar la calidad del pronóstico en horizontes largos.
- Los pronósticos financieros no constituyen asesoramiento de inversión; el modelo puede producir predicciones plausibles pero incorrectas dado el alto ruido del dominio.
- No se documentan análisis de sesgo por mercado, activo o exchange; la cobertura de 45 exchanges no garantiza un rendimiento homogéneo en todos ellos.
- Riesgo de alucinación en el sentido de generar trayectorias sintéticas coherentes pero no respaldadas por la dinámica real del activo, especialmente en regímenes anómalos.
- No se detalla la composición exacta del dataset de entrenamiento ni posibles periodos de look-ahead; conviene validar empíricamente antes de usar en producción.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso.
- No se documentan cuantizaciones oficiales ni soporte en frameworks de serving estándar, lo que limita la integración directa en pipelines tipo vLLM o TGI.

## Enlaces

- Hugging Face: https://huggingface.co/NeoQuasar/Kronos-small
- Paper (arXiv:2508.02739): https://arxiv.org/abs/2508.02739
- Repositorio GitHub: https://github.com/shiyu-coder/Kronos
- Demo en vivo (BTC/USDT, 24 h): https://shiyu-coder.github.io/Kronos-demo/
- Tokenizador Kronos-Tokenizer-base: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base
- Tokenizador Kronos-Tokenizer-2k: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-2k
- Kronos-mini: https://huggingface.co/NeoQuasar/Kronos-mini
- Kronos-base: https://huggingface.co/NeoQuasar/Kronos-base
- Espejo en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/Kronos-small
- Conversión MLX comunitaria: https://huggingface.co/gxcsoccer/kronos-mlx-small
- Ficha en TSFM.ai: https://tsfm.ai/models/NeoQuasar/Kronos-small
