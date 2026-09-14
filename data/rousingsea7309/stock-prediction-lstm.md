# RousingSea7309/stock-prediction-lstm

## Resumen

Stock Prediction LSTM Model es un modelo de red neuronal recurrente publicado en HuggingFace por el usuario RousingSea7309 bajo licencia MIT. No es un modelo de lenguaje: se trata de un predictor de series temporales financieras construido con PyTorch que estima el retorno logaritmico del dia siguiente de una accion (`log(Close[t+1] / Close[t])`) a partir de una ventana de 30 dias de datos OHLCV y siete indicadores tecnicos. La arquitectura es una LSTM de 3 capas con tamano oculto 250 y dropout 0,092, con una capa de salida escalar.

El modelo se entrena exclusivamente con datos de Apple (AAPL) descargados de Yahoo Finance via `yfinance` desde el 1 de enero de 2015, con una division cronologica 70/15/15 (entrenamiento/validacion/test). El entrenamiento usa el optimizador AdamW con learning rate 1,09e-5, tamano de lote 16, 100 epocas con parada temprana y perdida MSE.

Su relevancia es limitada y de caracter practico: sirve como ejemplo reproducible de pipeline end-to-end (descarga de datos, ingenieria de caracteristicas, escalado, entrenamiento y publicacion) para investigadores y desarrolladores que quieran partir de una base minima funcional. El repositorio tiene 0 descargas y 0 likes, y un tamano declarado de 0,0 GB, por lo que no esta claro que los pesos entrenados esten efectivamente subidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM recurrente de 3 capas con capa de salida lineal escalar |
| Parametros totales | Aproximadamente 1,27 millones (estimacion calculada a partir de la configuracion publicada: input 12, hidden 250, 3 capas, salida 1) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 pasos temporales (ventana de entrada de 30 dias); no aplica contexto de tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo numerico de series temporales; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`model_AAPL.pt` segun la model card), acompanado de `scalers_AAPL.pkl` y `config_AAPL.json`; no se confirma que los pesos esten subidos al repositorio (tamano declarado 0,0 GB) |

## Arquitectura y entrenamiento

La red es una LSTM estandar de PyTorch con `input_size=12`, `hidden_size=250`, `num_layers=3` y `dropout=0,092` entre capas. La entrada son 12 caracteristicas por paso temporal: Open, High, Low, Close, Volume, SMA_10, SMA_30, EMA_10, RSI_14, MACD, MACD_signal y log_return. La salida es un unico valor continuo que representa el retorno logaritmico del dia siguiente. El entrenamiento emplea AdamW con learning rate 1,09e-5, tamano de lote 16, ventana de 30 dias, hasta 100 epocas con parada temprana y funcion de perdida MSE.

Los datos provienen de Yahoo Finance mediante `yfinance`, cubren el periodo desde el 1 de enero de 2015 hasta la fecha de generacion, y se dividen de forma cronologica en 70 % entrenamiento, 15 % validacion y 15 % test, lo que evita fuga de informacion futura hacia el pasado. El modelo card no documenta el numero de tokens ni de muestras, la composicion exacta del dataset mas alla de AAPL, ni procesos de ajuste por preferencias humanas (RLHF, DPO), que no aplican a un modelo de regresion. Tampoco se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal: es una LSTM convencional.

El pipeline de inferencia requiere los modulos `models.lstm.StockLSTM`, `data.pipeline.FEATURE_COLUMNS` y `app/prediction_service.py`, referenciados en la model card pero cuya presencia en el repositorio no se puede verificar con la informacion disponible.

## Capacidades

- Prediccion de un unico valor: el retorno logaritmico del dia siguiente para un activo, dado un historico de 30 dias con las 12 caracteristicas definidas.
- Ingenieria de caracteristicas integrada en el flujo de trabajo: el modelo asume caracteristicas tecnicas precalculadas (medias moviles simples y exponenciales, RSI de 14 periodos, MACD y su senal).
- Normalizacion mediante escaladores separados para entrada y salida (`scaler_x`, `scaler_y`), serializados en formato pickle.
- Configuracion parametrizable por JSON (`config_AAPL.json`), lo que permite ajustar `hidden_size`, `num_layers` y `dropout` en tiempo de carga.
- Evaluacion con multiples metricas declaradas: MSE, MAE, R², SMAPE y precision direccional (fraccion de predicciones correctas de signo).
- No dispone de generacion de texto, razonamiento, codigo, matematicas simbolicas, vision, audio, tool calling, function calling ni capacidades de agente. Tampoco tiene modo de razonamiento explicito ni capacidades multilingues.

## Casos de uso

- Backtesting de estrategias de trading de muy corto plazo: el modelo genera una prediccion de retorno logaritmico diario que puede usarse como senal de entrada o salida en un simulador historico, evaluando despues la precision direccional sobre el conjunto de test cronologico.
- Componente de un ensemble cuantitativo: combinado con modelos clasicos como ARIMA o gradient boosting sobre las mismas caracteristicas, la prediccion LSTM puede ponderarse junto a las otras senales para reducir la varianza del pronostico agregado.
- Investigacion academica en prediccion de series financieras: sirve como linea base reproducible (arquitectura, hiperparametros y particion documentados) frente a la que comparar variantes mas complejas como Temporal Fusion Transformer o arquitecturas con atencion.
- Prototipado de pipelines de datos financieros: el flujo yfinance -> indicadores tecnicos -> escalado -> ventana deslizante es reutilizable como esqueleto para incorporar otros activos o frecuencias temporales.
- Sistema de alertas de cambio direccional: usando la precision direccional como metrica objetivo, la salida del modelo puede alimentar avisos automaticos cuando la probabilidad estimada de subida supera un umbral configurable, siempre como senal auxiliar y no como recomendacion.
- Reentrenamiento y adaptacion a otros activos: la configuracion es generica (`config_AAPL.json` sugiere una configuracion por simbolo), por lo que sustituyendo los escaladores y reentrenando con los datos del nuevo ticker se obtiene un predictor equivalente para acciones o ETF.
- Material didactico: por su tamano reducido (aproximadamente 1,27 millones de parametros) y su dependencia minima de librerias, es adecuado para ensenar el ciclo completo de un proyecto de machine learning financiero, desde la descarga de datos hasta el guardado del `state_dict`.
- Paper trading y validacion en vivo: integrado en un servicio de inferencia que consuma datos recientes y recalcule los indicadores, permite medir el comportamiento del modelo en datos no vistos antes de plantear cualquier uso con capital real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define las metricas que deben calcularse (MSE, MAE, R², SMAPE y precision direccional) pero no incluye ningun valor numerico obtenido en el conjunto de validacion o de test. En consecuencia, no es posible comparar cuantitativamente este modelo con alternativas.

| Metrica | Valor publicado |
|---|---|
| MSE | No disponible |
| MAE | No disponible |
| R² | No disponible |
| SMAPE | No disponible |
| Precision direccional | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en fp32 ocupan aproximadamente 5 MB (1,27 millones de parametros x 4 bytes); el consumo real depende del framework, de la longitud de la ventana de 30 pasos y del tamano de lote.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. La carga es tan baja que no se aprovecharia la capacidad de las GPU de gama alta.
- Capacidad en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en graficas integradas. La ejecucion en CPU es perfectamente viable para inferencia individual.
- Opciones de despliegue: PyTorch nativo (carga directa del `state_dict`), TorchScript o exportacion a ONNX para servir desde runtimes ligeros (ONNX Runtime, TensorRT). vLLM, llama.cpp, Ollama y TGI no aplican porque estan orientados a modelos de lenguaje y este no lo es.
- Latencia y throughput estimados: no disponibles en la model card. Dado el tamano del modelo y la ventana de 30 pasos, se espera una latencia del orden de milisegundos por prediccion tanto en CPU como en GPU, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No hay datos de benchmarks publicados para este modelo, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RousingSea7309/stock-prediction-lstm | Aproximadamente 1,27 M (estimado) | 30 pasos temporales | No disponible | MIT | HuggingFace (0 descargas, pesos no confirmados) |
| Modelos estadisticos clasicos (ARIMA, GARCH) | No aplica | No aplica | No disponible | Variable segun implementacion | Amplia, multiples librerias |
| Modelos de gradient boosting (XGBoost, LightGBM) sobre indicadores tecnicos | No aplica | No aplica | No disponible | Apache 2.0 / MIT | Amplia |
| Arquitecturas profundas para series temporales (Temporal Fusion Transformer y similares) | Millones a decenas de millones | Ventanas configurables | No disponible | Variable | Repositorios publicos |

La comparacion de rendimiento queda pendiente de que el autor publique metricas de validacion y test, o de que un tercero las reproduzca con el pipeline descrito.

## Limitaciones y advertencias

- Entrenamiento sobre un unico activo: el modelo se entrena exclusivamente con datos de AAPL desde 2015, por lo que no se puede asumir su validez sobre otros tickers, sectores o mercados sin reentrenamiento.
- Predice retornos, no precios: la salida es `log(Close[t+1] / Close[t])`, no el precio de cierre. Cualquier uso que espere un precio debe reconstruirlo a partir del ultimo cierre observado y asumir el error acumulado.
- Sin metricas publicadas: la model card enumera las metricas de evaluacion pero no reporta ningun valor, de modo que no hay evidencia publica sobre la calidad real del modelo.
- Riesgo de sobreajuste y de deriva de regimen: las series financieras son ruidosas y no estacionarias; un modelo con 3 capas LSTM y ventana de 30 dias puede ajustar patrones historicos que no se repitan. La precision direccional en finanzas suele situarse cerca del 50 %, y no hay datos que indiquen lo contrario en este caso.
- Pesos posiblemente ausentes: el repositorio declarara 0,0 GB y la model card referencia ficheros (`model_AAPL.pt`, `scalers_AAPL.pkl`, `config_AAPL.json`) y modulos (`models.lstm`, `data.pipeline`) cuya presencia no se puede verificar. Sin ellos el modelo no es directamente utilizable.
- Dependencia de datos externos: el pipeline requiere descargar datos de Yahoo Finance, lo que introduce dependencia de un servicio de terceros y de la calidad y disponibilidad de sus datos.
- Ausencia de soporte multilingue o de texto: no es un modelo de lenguaje y no procesa instrucciones, documentos ni conversaciones.
- Licencia: MIT permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No se documentan restricciones adicionales, pero la licencia del codigo no cubre los datos de Yahoo Finance ni exime del cumplimiento de la normativa financiera aplicable.
- Advertencia explicita del autor: el propio modelo card indica que el rendimiento pasado no garantiza resultados futuros y que esto no constituye asesoramiento financiero. Cualquier uso en produccion con capital real exige validacion independiente, control de riesgo y supervision humana.
- Sesgo de seleccion temporal: la particion cronologica evita fuga de futuro, pero el modelo se entrena solo con el periodo 2015 en adelante, lo que limita su exposicion a crisis anteriores y a regimenes de volatilidad distintos.

## Enlaces

- HuggingFace: https://huggingface.co/RousingSea7309/stock-prediction-lstm
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por la busqueda corresponden a foros de operadores de television y proveedores de internet, sin ninguna relacion con el modelo, su arquitectura o sus datos de entrenamiento. No hay papers, blogs, repositorios auxiliares ni demos disponibles en la informacion proporcionada.
