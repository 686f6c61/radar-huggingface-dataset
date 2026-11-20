# AlvaroGlez/brent-rnn-lstm-gru

## Resumen

El modelo `brent-rnn-lstm-gru` es una familia de redes neuronales recurrentes desarrollada por Álvaro González Fernández en el marco del Caso II de la asignatura de Aprendizaje Automático del Grado en Ingeniería Matemática de la Universidad Alfonso X el Sabio (UAX). Su objetivo no es predecir la dirección del precio del petróleo Brent, sino cuantificar la incertidumbre de su rentabilidad logarítmica a tres horizontes temporales: 5, 63 y 252 días hábiles (aproximadamente una semana, tres meses y un año), con un intervalo de confianza del 80 %.

Técnicamente se trata de tres arquitecturas recurrentes comparadas bajo idéntico protocolo experimental: una RNN simple con activación tanh, una LSTM y una GRU, todas con una única capa de 32 unidades, dropout y una capa lineal de salida con tres neuronas (una por horizonte). El modelo de producción es la RNN simple, con solo 1.635 parámetros, entrenada sobre ventanas de 60 días hábiles y 14 variables financieras diarias.

Su relevancia es fundamentalmente metodológica y educativa: ilustra un pipeline completo de forecasting financiero con validación walk-forward, purga temporal para evitar fugas de información y evaluación estadística mediante el test de Diebold-Mariano. Los resultados publicados por el autor muestran que ninguna de las tres redes supera de forma estadísticamente significativa al modelo ingenuo, lo que convierte al repositorio en un ejemplo honesto de los límites del deep learning aplicado a series financieras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente de una capa (RNN tanh, LSTM o GRU) de 32 unidades + dropout + capa lineal de 3 salidas |
| Parametros totales | RNN: 1.635; LSTM: 6.243; GRU: 4.707 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de entrada de 60 días hábiles (14 variables diarias por paso temporal) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | No aplica (modelo numérico de series temporales; la documentación está en español) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |

## Arquitectura y entrenamiento

Cada red consta de una única capa recurrente de 32 unidades seguida de dropout y una capa lineal que proyecta el estado oculto final a tres salidas escalares, una por horizonte de predicción. La entrada es una ventana deslizante de 60 días hábiles con 14 variables diarias: rentabilidades del Brent, WTI, futuro del WTI, gas natural, cobre, oro, índice del dólar, tipos de cambio USD/EUR y CNY/USD, logaritmo del VIX, tipo del BCE y su variación, volatilidad realizada a 20 días y distancia a la media móvil de 252 días del Brent. La RNN de producción tiene 1.635 parámetros; la LSTM, 6.243; y la GRU, 4.707.

El entrenamiento se realizó en PyTorch sobre CPU con el optimizador Adam (learning rate 0,001), función de pérdida MSE con máscara para gestionar los horizontes incompletos al final de la serie y early stopping. La validación emplea un esquema walk-forward sobre 2018–2021 con purga de 252 días para evitar contaminación entre ventanas solapadas, y el conjunto de test final (2023–2026) se utilizó una única vez. El modelo de producción se reentrena mensualmente con GitHub Actions usando todos los datos disponibles y tres semillas. Los intervalos de incertidumbre se derivan de los cuantiles 10 y 90 de los residuos de validación, almacenados en `intervalos.json`.

## Capacidades

- Predicción puntual de la rentabilidad logarítmica del Brent a 5, 63 y 252 días hábiles.
- Estimación de un intervalo de incertidumbre del 80 % por horizonte a partir de los cuantiles empíricos de los residuos de validación.
- Procesamiento de series multivariantes con 14 variables macrofinancieras y de mercado energético.
- Tres variantes arquitectónicas comparables (RNN, LSTM, GRU) bajo el mismo protocolo experimental, útiles para experimentación y docencia.
- Reentrenamiento automatizado mensual mediante GitHub Actions.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de lenguaje natural.

## Casos de uso

- Cuantificación del riesgo de precio a distintos plazos: un analista de riesgos puede usar los intervalos del 80 % para dimensionar coberturas o escenarios de estrés en carteras con exposición al crudo, sin depender de la predicción central.
- Docencia y formación en forecasting financiero: el repositorio sirve como ejemplo reproducible de validación walk-forward, purga temporal y test de Diebold-Mariano aplicados a series con fuerte autocorrelación.
- Benchmark interno de referencia: cualquier nuevo modelo de predicción del Brent puede compararse contra estas tres redes con el mismo particionado temporal y las mismas métricas de RMSE en dólares.
- Prototipado rápido de pipelines de series temporales: con 1.635 parámetros, la RNN de producción entrena en CPU en segundos, lo que permite iterar sobre ingeniería de características sin infraestructura GPU.
- Integración en aplicaciones web divulgativas: la demo pública en GitHub Pages consume el modelo de producción para mostrar rangos de precio esperados a una semana, tres meses y un año.
- Monitorización de deriva de modelos: el reentrenamiento mensual automatizado permite estudiar cómo evoluciona el error fuera de muestra a lo largo del tiempo en un mercado sometido a shocks geopolíticos.

## Benchmarks y rendimiento

Mejora del RMSE (en dólares) frente al modelo ingenuo («el precio futuro es el de hoy»), media de tres semillas, test 2023–2026:

| Red | 1 semana | 3 meses | 1 año |
|---|---|---|---|
| RNN | +0,8 % | +7,5 % | +9,9 % |
| LSTM | +0,8 % | −12,1 % | −50,4 % |
| GRU | −2,0 % | −1,9 % | −41,6 % |

Ninguna de las diferencias es estadísticamente significativa según el test de Diebold-Mariano (p > 0,10). El autor no reporta métricas absolutas de RMSE, MAE ni R² en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo de producción (1.635 parámetros) se ejecuta en cualquier CPU moderna en milisegundos; no requiere GPU.
- VRAM estimada: inferior a 10 MB en punto flotante de 32 bits; irrelevante en la práctica.
- GPU recomendadas: ninguna. El entrenamiento original se realizó íntegramente en CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, aunque no es necesario.
- Opciones de despliegue: PyTorch nativo con el código del repositorio de GitHub (`src/models.py` y `src/windows.py`); no hay exportación a GGUF, ONNX ni vLLM disponible en la información proporcionada.
- Latencia y throughput: no disponibles de forma explícita, pero por el tamaño del modelo se sitúan en el orden de microsegundos a pocos milisegundos por inferencia en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con el mismo alcance (predicción del Brent con intervalos de incertidumbre y validación walk-forward). La comparativa interna entre las tres arquitecturas del propio repositorio es la siguiente:

| Modelo | Parámetros | Contexto de entrada | Mejora RMSE 1 año | Licencia |
|---|---|---|---|---|
| RNN (producción) | 1.635 | 60 días × 14 variables | +9,9 % | MIT |
| LSTM | 6.243 | 60 días × 14 variables | −50,4 % | MIT |
| GRU | 4.707 | 60 días × 14 variables | −41,6 % | MIT |

## Limitaciones y advertencias

- El modelo no predice la dirección del precio del Brent mejor que el modelo ingenuo; su utilidad es la cuantificación del rango de riesgo, no la señal de trading.
- Las diferencias frente al baseline no son estadísticamente significativas (Diebold-Mariano, p > 0,10), por lo que no puede afirmarse superioridad predictiva.
- A un año, la cifra central es muy incierta y las sorpresas geopolíticas (decisiones de la OPEP+, conflictos armados) no se anticipan.
- Los intervalos del 80 % se derivan de residuos de validación históricos; en regímenes de mercado no vistos pueden infraestimar la incertidumbre real.
- El modelo está entrenado con datos hasta la fecha de reentrenamiento; no incorpora información en tiempo real entre ejecuciones mensuales.
- No es un consejo de inversión; el autor lo declara explícitamente en la model card.
- La licencia MIT permite uso comercial, pero el modelo carece de validación externa independiente y de auditoría de sesgos.
- Depende del código del repositorio de GitHub para cargarse; no es autónomo desde el punto de vista de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlvaroGlez/brent-rnn-lstm-gru
- Repositorio de código y documentación: https://github.com/AlvaroGlezFdez/oil_price_prediction
- Aplicación web de demostración: https://alvaroglezfdez.github.io/oil_price_prediction/
