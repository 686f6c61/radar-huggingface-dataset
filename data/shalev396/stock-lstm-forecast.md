# shalev396/stock-lstm-forecast

## Resumen

Stock Price LSTM (identificador `shalev396/stock-lstm-forecast`) es un modelo de prediccion de series temporales publicado por el usuario shalev396 dentro del proyecto educativo ml-lab. No es un modelo de lenguaje: es una red LSTM pequena (16.961 parametros) entrenada con TensorFlow/Keras para predecir el precio de cierre diario de Apple (AAPL) a partir de los 60 log-retornos diarios anteriores, con generacion recursiva de hasta 60 dias bursatiles. Se distribuye junto a una copia congelada del historico de precios (`prices.csv`, 2.911 cierres entre 2015-01-02 y 2026-07-31), de modo que la inferencia no requiere ninguna API de datos de mercado.

Su relevancia no esta en el rendimiento, sino en la honestidad metodologica: el propio autor documenta que el error cuadratico medio (RMSE) a un dia del modelo en el periodo de test es de 4,48 dolares, frente a 4,47 dolares del predictor trivial "manana = hoy". Es decir, el modelo no supera a la persistencia, lo que ilustra de forma cuantificada el caracter de paseo aleatorio de los precios diarios. Esto lo convierte en un artefacto util como referencia negativa y como ejemplo reproducible de pipeline de forecasting con splits cronologicos.

El modelo se publica bajo licencia MIT, con la arquitectura LSTM(64) sobre log-retornos estandarizados y ventana de 60 dias, en formato Keras 3 nativo (float32), y se puede ejecutar en CPU tanto en local como en la Space de HuggingFace asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM apilada minima: `Input(60, 1) -> LSTM(64) -> Dropout(0.2) -> Dense(1)` |
| Parametros totales | 16.961 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 60 pasos temporales (60 log-retornos diarios); horizonte de prediccion de 1 a 60 dias bursatiles |
| Tipos de cuantizacion | no disponible; los pesos se publican en float32, sin cuantizaciones GGUF/AWQ/GPTQ |
| Idiomas soportados | no aplica (modelo numerico univariante de series temporales, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.keras` (Keras 3), float32; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La red es un LSTM univariante clasico: recibe una secuencia de 60 log-retornos diarios `r_t = ln(C_t / C_(t-1))`, estandarizados con la media (0,000827) y la desviacion tipica (0,018858) calculadas exclusivamente sobre el split de entrenamiento (ambos valores se guardan en `config.json`), y produce el siguiente log-retorno estandarizado. La prediccion se desnormaliza y los precios se reconstruyen como `C_cutoff x exp(retornos acumulados)`. Para un horizonte de `h` dias, el modelo se ejecuta `h` veces de forma recursiva, realimentando cada prediccion como entrada mas reciente. La capa `Dropout(0.2)` actua como unica regularizacion explicita.

Los datos proceden de AAPL (OHLCV diario de yfinance, descargado el 2026-08-01, rango 2015-01-02 a 2026-07-31). Se descartan los primeros 14 dias como calentamiento de RSI, quedando 2.897 dias. El split es cronologico 70/15/15 y cada ventana de 60 dias pertenece al split del dia que predice, de modo que ninguna ventana cruza fronteras: entrenamiento con 1.966 ventanas (2015-04-22 a 2023-02-09), validacion con 435 (2023-02-10 a 2024-11-01) y test con 435 (2024-11-04 a 2026-07-31). La receta de entrenamiento usa Adam con tasa 1e-3, perdida MSE sobre el objetivo escalado, lote de 32 y hasta 40 epocas, con early stopping (paciencia 6) y reduccion de la tasa de aprendizaje a la mitad vigilando la perdida de validacion, restaurando los pesos de la mejor epoca. Entre los modelos univariantes que la Space puede ejecutar de forma recursiva se despliega el de menor RMSE de validacion; las metricas de test se calculan una sola vez. El entrenamiento completo de las cuatro redes se ejecuto en CPU: 575,3 s en una maquina compartida y 71,8 s en una ejecucion previa sin contencion (datos del `results.json` heredado). No se documenta uso de RLHF, DPO ni fine-tuning posterior.

## Capacidades

- Prediccion univariante de series temporales: genera el siguiente log-retorno diario y lo realimenta para producir pronosticos recursivos de hasta 60 dias bursatiles.
- Reconstruccion de precios: devuelve la serie de precios implicita (`C_cutoff x exp(retornos acumulados)`) en la misma escala que el historico.
- Evaluacion integrada contra baseline: la funcion `predict(cutoff, horizon)` devuelve `forecast`, `naive`, `actual`, `mae` y `naiveMae`, de modo que el error se compara siempre con la persistencia en dolares.
- Gestion de fechas de corte: acepta fechas en formato `YYYY-MM-DD`, las limita al rango valido (2015-03-31 a 2026-07-31) y las ajusta al dia bursatil anterior.
- Inferencia sin conectividad: funciona con el `prices.csv` congelado incluido en el repositorio, sin dependencia de APIs de mercado.
- Despliegue multiplataforma: carga via `snapshot_download` + `model.load(path, device="cpu")`, API de Space (`POST /gradio_api/call/predict`) y `handler.py` compatible con Inference Endpoints.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente, modo "thinking" ni soporte multilingue.

## Casos de uso

- Material didactico sobre forecasting recursivo: el modelo permite mostrar en clase, en menos de dos minutos de CPU (71,8 s para cuatro redes en la ejecucion sin contencion), como se encadena una prediccion de un paso en un horizonte de 60 dias y como se degrada el error.
- Referencia negativa en evaluacion de modelos: sirve como suelo de comparacion frente a la persistencia naive, ya que el repositorio publica simultaneamente RMSE, MAE y MAPE del modelo y del baseline en el mismo periodo de test (435 dias).
- Validacion de infraestructura de despliegue: su `handler.py` y su Space con Gradio permiten probar rutas de Inference Endpoints y de Spaces para modelos Keras de series temporales sin coste de GPU, con un artefacto de apenas 0,0 GB de repositorio.
- Prototipado de paneles de visualizacion financiera: la respuesta JSON incluye `history` (hasta 120 dias bursatiles), `forecast`, `naive` y `actual`, lo que facilita construir dashboards que muestren la prediccion junto al escenario trivial y al valor real observado.
- Reproducibilidad de experimentos academicos: la receta completa (Adam 1e-3, MSE, lote 32, 40 epocas, early stopping con paciencia 6, escaladores ajustados solo en train) y la delimitacion exacta de los splits cronologicos permiten auditar el pipeline y replicar el resultado.
- Ensenanza de prevencion de fuga de datos: el diseno de ventanas que no cruzan fronteras de split y el ajuste de la estandarizacion unicamente con filas de entrenamiento son un ejemplo concreto de buenas practicas en series temporales.
- Demo interactiva divulgativa: la Space permite al publico general comprobar de forma empirica por que un LSTM pequeno no bate al paseo aleatorio en precios diarios, con cifras reales en dolares.
- Prueba de regresion en pipelines de CI: al ser determinista, ligero y con metricas publicadas (`metrics.json`), resulta util como caso de prueba rapido para verificar que un pipeline de entrenamiento o de serving no se ha roto.

## Benchmarks y rendimiento

Resultados declarados por el autor en `model-index` (no verificados, `verified: false`) sobre el split de test de AAPL daily closes (yfinance), 435 dias, 2024-11-04 a 2026-07-31. La comparacion con el baseline naive de persistencia procede de la tabla de experimentos de la model card.

| Modelo | RMSE test ($) | MAE test ($) | MAPE test (%) | RMSE validacion ($) |
|---|---|---|---|---|
| LSTM(64) sobre log-retornos (desplegado) | 4,4831 | 3,0255 | 1,2368 | no disponible |
| naive_persistence (tomorrow = today) | 4,469 | 3,020 | 1,23 | 2,583 |

Conclusion documentada por el autor: el modelo **no** supera al baseline naive en test (4,4831 frente a 4,469 de RMSE). La model card indica que el modelo ha aprendido poco mas que la deriva diaria media. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada: practicamente nula; los 16.961 parametros en float32 ocupan aproximadamente 66 KB de pesos, por lo que el modelo reside en memoria RAM/VRAM sin dificultad.
- GPU recomendadas: ninguna especifica. El autor entreno e infiere en CPU; cualquier GPU consumer (incluso integradas) es sobredimensionada para esta carga.
- Compatibilidad con GPU consumer: si, en cualquier GPU o en CPU pura; no requiere CUDA.
- Opciones de despliegue: ejecucion local con TensorFlow/Keras 3 (`snapshot_download` + `model.load(path, device="cpu")`), HuggingFace Space con `ui_kind: timeseries` y runtime `cpu-basic`, e Inference Endpoint mediante `handler.py` con entrada `{"inputs": {"cutoff": ..., "horizon": ...}}`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer decoder ni se publican pesos GGUF.
- Latencia y throughput: no disponibles para inferencia. Como referencia de coste de computo, el entrenamiento de las cuatro redes de la familia tardo 575,3 s en CPU compartida y 71,8 s en una ejecucion sin contencion.

## Comparativa con modelos similares

| Modelo / referencia | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shalev396/stock-lstm-forecast | 16.961 | 60 log-retornos, horizonte 1-60 dias | RMSE test 4,4831 $ (no bate al naive, 4,469 $) | MIT | HuggingFace (modelo, Space, handler de Inference Endpoints) |
| naive_persistence (baseline incluido en el propio repo) | 0 | repite el ultimo cierre | RMSE test 4,469 $; RMSE validacion 2,583 $ | no aplica (implementado en el repo) | dentro del repositorio |
| jinglescode/time-series-forecasting-pytorch (demo LSTM) | no disponible | no disponible | no disponible | no disponible | Colab publico |
| Pitnon/stock-prediction-ai (LSTM multi-ticker) | no disponible | no disponible | no disponible | no disponible | GitHub |
| gianlucamazza/lstm_forecast (LSTM con CLI) | no disponible | no disponible | no disponible | no disponible | GitHub |
| Modelos estadisticos clasicos (ARIMA, Prophet) | no disponible | no disponible | no disponible | no disponible | librerias independientes |

La comparacion estricta de rendimiento solo es posible frente al baseline naive del propio repositorio, porque el resto de alternativas encontradas en la busqueda web no publican metricas comparables en el mismo conjunto de datos.

## Limitaciones y advertencias

- No supera al baseline trivial: el RMSE en test (4,4831 $) es ligeramente peor que el de la persistencia (4,469 $), por lo que su valor predictivo sobre precios diarios es practicamente nulo.
- Naturaleza de paseo aleatorio: el autor senala que los precios diarios se comportan casi como un paseo aleatorio y que el modelo solo ha aprendido la deriva diaria media; en consecuencia, el riesgo de extrapolacion equivocada en regimenes de mercado distintos al periodo de entrenamiento es alto.
- Ambito limitado a un unico activo: entrenado exclusivamente con AAPL (yfinance, `Close` ajustado por splits y no por dividendos) entre 2015-01-02 y 2026-07-31; no se garantiza su transferencia a otros tickers, mercados o frecuencias temporales.
- Datos congelados: `prices.csv` no se actualiza; las predicciones posteriores a 2026-07-31 no estan soportadas y el campo `actual` queda vacio para la ultima fecha disponible.
- Evaluacion no verificada: las metricas del `model-index` figuran con `verified: false`, es decir, son declaraciones del autor y no han sido replicadas de forma independiente.
- Sin componentes de lenguaje: no hay generacion de texto, razonamiento, tool calling ni capacidades de agente; cualquier uso conversacional es ajeno al modelo.
- Sesgos y alucinacion: no aplican en el sentido de sesgo linguistico, pero si existe el riesgo analogo de producir series plausibles sin base predictiva, especialmente al alimentar recursivamente 60 pasos.
- Uso financiero: el modelo no constituye asesoramiento financiero ni una herramienta de trading; su propio autor documenta que no bate a la persistencia.
- Licencia: MIT permite uso comercial y modificacion, pero sin garantia alguna; conviene conservar el aviso de copyright y no presentar el modelo como sistema de prediccion fiable.
- Produccion: sin resultados publicados de latencia, throughput ni pruebas de estres; al ser un modelo didactico de un solo activo, no es adecuado para decisiones economicas reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shalev396/stock-lstm-forecast
- Space de demostracion: https://huggingface.co/spaces/shalev396/stock-lstm-forecast
- Repositorio GitHub (proyecto ml-lab, subcarpeta stock-lstm-forecast): https://github.com/shalev396/ml-lab/tree/main/stock-lstm-forecast
- Codigo de entrenamiento: https://github.com/shalev396/ml-lab/tree/main/stock-lstm-forecast/training
- Cuaderno de Colab: https://colab.research.google.com/github/shalev396/ml-lab/blob/main/stock-lstm-forecast/training/notebook.ipynb
- Demo de prediccion de precios con LSTM (jinglescode, PyTorch): https://colab.research.google.com/github/jinglescode/time-series-forecasting-pytorch/blob/main/demo-predicting-stock-prices.ipynb
- Repositorio Pitnon/stock-prediction-ai: https://github.com/Pitnon/stock-prediction-ai
- Repositorio gianlucamazza/lstm_forecast: https://github.com/gianlucamazza/lstm_forecast
- Guia practica de predictor de precios en tiempo real con LSTM (GUVI): https://www.guvi.in/blog/building-a-real-time-stock-price-predictor/
- Ficha del proyecto Stock LSTM Forecasting en AIBase: https://www.aibase.com/repos/project/stock-lstm-forecasting
