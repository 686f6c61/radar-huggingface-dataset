# alejandrobarreche/oil-rnn

## Resumen

oil-rnn es una familia de cuatro modelos de redes neuronales recurrentes (RNN) publicados por el usuario alejandrobarreche en Hugging Face, diseñados para predecir el rendimiento logarítmico del precio spot del Brent y su intervalo de confianza del 80 %. Cada modelo cubre un horizonte distinto (5, 21, 63 y 252 días hábiles) y emplea una arquitectura recurrente diferente según el horizonte: GRU para 5 y 63 días, LSTM para 21 días y RNN simple para 252 días.

El modelo resuelve un problema acotado de previsión de series temporales financieras: dado un conjunto de 15 variables macroeconómicas y de mercado (Brent, WTI, Henry Hub, tipos del BCE, tipos de cambio, VIX, futuros del WTI, cobre, oro e índice del dólar), genera una predicción puntual y un intervalo calibrado mediante conformal prediction. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de forecasting especializado, empaquetado tanto en PyTorch como en ONNX para su ejecución en navegador.

Su relevancia es limitada y muy específica: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0,0 GB (probablemente pesos muy pequeños) y las métricas publicadas muestran que, en la mayoría de horizontes, el modelo no supera a la referencia de persistencia (precio de hoy) en error absoluto medio. Es, por tanto, un experimento reproducible más que una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes recurrentes: GRU (h=5, h=63), LSTM (h=21), RNN simple (h=252) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 20 días (h=5, h=63, h=252) y 60 días (h=21) |
| Tipos de cuantizacion | no disponible (exportación ONNX y pesos PyTorch en punto flotante; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`), ONNX (`onnx/h<h>.onnx`), preprocesador en joblib (`preprocessor.joblib`) |

## Arquitectura y entrenamiento

El modelo se compone de cuatro redes recurrentes independientes, una por horizonte temporal. Para h=5 se usa una GRU con ventana de 20 días; para h=21, una LSTM con ventana de 60 días; para h=63, una GRU con ventana de 20 días; y para h=252, una RNN simple con ventana de 20 días. La entrada son 15 features numéricas (Brent, WTI, Henry Hub, tipo de depósito del BCE, USD/EUR, CNY/USD, VIX, OHLC y volumen de futuros del WTI, cobre, oro e índice del dólar) y el objetivo es el rendimiento logarítmico del Brent spot (serie EIA `DCOILBRENTEU`). El preprocesador se ajusta únicamente con el conjunto de entrenamiento, lo que evita fuga de información.

El entrenamiento emplea splits cronológicos train → val → test, con datos diarios cortados en la última observación real del Brent. La innovación técnica destacable es la calibración de intervalos mediante conformal prediction, que produce una cobertura empírica del 80 % (aunque en la tabla de test se observan coberturas entre 0,78 y 0,97, es decir, el intervalo no siempre está bien calibrado). No se documenta el número de tokens ni la composición exacta del dataset de entrenamiento más allá de las 15 features y el periodo de test (2023-01-25 a 2026-11-03). No se menciona RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de forecasting.

## Capacidades

- Predicción puntual del rendimiento logarítmico del Brent spot a 5, 21, 63 y 252 días hábiles.
- Generación de intervalos de predicción al 80 % calibrados con conformal prediction.
- Clasificación implícita de dirección del precio (acierto reportado entre 0,33 y 0,54 según horizonte).
- Ejecución en navegador mediante ONNX Runtime Web, gracias a los artefactos `onnx/h<h>.onnx` y `onnx/manifest.json`.
- Integración en pipelines de Python vía PyTorch (`model.pt`) y joblib (`preprocessor.joblib`).
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni capacidades multilingües: es un modelo numérico de series temporales.

## Casos de uso

- Previsión de precios del crudo en investigación académica: el modelo sirve como baseline reproducible para comparar arquitecturas recurrentes (GRU, LSTM, RNN) en horizontes de 5 a 252 días, con métricas de error y cobertura publicadas.
- Análisis de riesgo de cartera: el intervalo del 80 % permite construir bandas de incertidumbre sobre el Brent para escenarios de stress, aunque la cobertura observada (0,78–0,97) debe validarse antes de usarlo en producción.
- Dashboards web de seguimiento del Brent: los artefactos ONNX y el manifiesto permiten ejecutar la inferencia directamente en el navegador sin backend, útil para demos y prototipos.
- Investigación sobre calibración conformal: el modelo es un ejemplo aplicado de conformal prediction en series financieras, útil para estudiar la fiabilidad de los intervalos en horizontes largos.
- Docencia en forecasting con redes recurrentes: el repositorio de GitHub incluye código, datos y método, lo que facilita reproducir el pipeline completo (preprocesado, entrenamiento, evaluación).
- Experimentación con features macroeconómicas: el conjunto de 15 variables (VIX, tipos del BCE, cobre, oro, índice del dólar) puede reutilizarse para probar otras arquitecturas o seleccionar features.
- Prototipado de estrategias de cobertura: la predicción de dirección a 21 días (acierto 0,54 frente a 0,51 de referencia) podría explorarse como señal débil en simulaciones, nunca como recomendación de inversión.

## Benchmarks y rendimiento

Periodo de test: 2023-01-25 a 2026-11-03, en $/barril. Referencia de error y cobertura: persistencia (precio de hoy). Referencia de acierto de dirección: mejor constante de train.

| h | Red | n | MAE | MAE ref. | RMSE | RMSE ref. | Cob. 80 % | Cob. ref. | Acierto | Acierto ref. |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | GRU | 955 | 3,73 | 3,62 | 5,46 | 5,36 | 0,78 | 0,79 | 0,49 | 0,50 |
| 21 | LSTM | 955 | 7,42 | 7,00 | 11,56 | 10,69 | 0,86 | 0,84 | 0,54 | 0,51 |
| 63 | GRU | 955 | 12,93 | 11,44 | 19,57 | 17,54 | 0,83 | 0,86 | 0,53 | 0,56 |
| 252 | RNN | 955 | 16,72 | 16,72 | 22,71 | 22,71 | 0,97 | 0,92 | 0,33 | 0,67 |

Lectura de los datos: en h=5, h=21 y h=63 el modelo tiene MAE y RMSE superiores a la persistencia (peor error). En h=252 el error coincide exactamente con la persistencia, lo que sugiere que la red no aporta señal predictiva a ese horizonte. El acierto de dirección solo supera la referencia en h=21 (0,54 frente a 0,51); en h=252 es muy inferior (0,33 frente a 0,67). La cobertura del 80 % se acerca al objetivo en h=5, h=21 y h=63, pero se dispara a 0,97 en h=252 (intervalos demasiado anchos o mal calibrados).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero al tratarse de redes recurrentes con ventanas de 20–60 pasos y 15 features, el consumo es del orden de megabytes, no de gigabytes. Cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es sobredimensionada. CPU es suficiente para inferencia en tiempo real.
- Cabe en consumer GPU: sí, en todas, incluida la gama de entrada.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), PyTorch nativo, y joblib para el preprocesador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Por la naturaleza del modelo (recurrente, ventanas cortas, pocas features), la latencia esperada es de milisegundos en CPU y sub-milisegundo en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no cita alternativas ni benchmarks frente a otros modelos de forecasting del Brent. Como referencia metodológica, la propia model card usa la persistencia (precio de hoy) como baseline, y el modelo no la supera en error en ninguno de los cuatro horizontes. No se identifican en la información disponible otros modelos públicos de forecasting del Brent con los que comparar parámetros, contexto, rendimiento o licencia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oil-rnn (h=5, GRU) | no disponible | ventana 20 días | MAE 3,73 vs 3,62 persistencia | no disponible | Hugging Face |
| oil-rnn (h=21, LSTM) | no disponible | ventana 60 días | MAE 7,42 vs 7,00 persistencia | no disponible | Hugging Face |
| oil-rnn (h=63, GRU) | no disponible | ventana 20 días | MAE 12,93 vs 11,44 persistencia | no disponible | Hugging Face |
| oil-rnn (h=252, RNN) | no disponible | ventana 20 días | MAE 16,72 vs 16,72 persistencia | no disponible | Hugging Face |

## Limitaciones y advertencias

- Rendimiento inferior a la persistencia: en h=5, h=21 y h=63 el MAE y el RMSE son peores que usar el precio de hoy como predicción. En h=252 el error es idéntico a la persistencia, lo que indica ausencia de señal predictiva.
- Acierto de dirección bajo: en h=252 el acierto es 0,33 frente a 0,67 de la referencia, es decir, el modelo falla más de lo que acierta al predecir la dirección del precio.
- Calibración irregular de los intervalos: la cobertura del 80 % varía entre 0,78 y 0,97 según el horizonte, por lo que los intervalos no son fiables de forma uniforme.
- Riesgo de sobreajuste y de fuga temporal: aunque se usan splits cronológicos y el preprocesador se ajusta solo con train, el periodo de test (2023-2026) es corto y las métricas podrían no generalizar a otros regímenes de mercado.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Antes de cualquier uso en producción debe contactarse con el autor.
- Carga insegura de artefactos: `preprocessor.joblib` y `model.pt` se cargan con pickle; solo deben abrirse si se confía en el origen.
- Idiomas no aplicables: es un modelo numérico, no procesa texto.
- Sesgos conocidos: no documentados, pero al entrenarse con datos históricos del Brent y de variables macroeconómicas, puede heredar sesgos de régimen (por ejemplo, comportamiento distinto en crisis energéticas).
- Advertencia financiera: las predicciones no constituyen asesoramiento de inversión y no deben usarse para tomar decisiones de trading sin validación independiente.
- Repositorio sin tracción: 0 descargas y 0 likes, sin revisión por pares ni validación externa documentada.

## Enlaces

- Hugging Face: https://huggingface.co/alejandrobarreche/oil-rnn
- Repositorio GitHub (código, datos y método): https://github.com/alejandrobarreche/oil-rnn
- Serie EIA del Brent spot (`DCOILBRENTEU`): no se proporciona URL directa en la información disponible; se cita como fuente de datos en la model card.
