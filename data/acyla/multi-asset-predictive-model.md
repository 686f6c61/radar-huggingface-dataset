# AcyLa/multi-asset-predictive-model

## Resumen

Multi-Asset Predictive Model es un pipeline de aprendizaje automatico en forma de ensemble que combina LightGBM (arboles con boosting por gradiente) y una red LSTM con atencion para generar predicciones direccionales y de retorno sobre 14 activos financieros: ETFs de renta variable estadounidense, materias primas y mercados internacionales. Lo publica el usuario AcyLa en Hugging Face bajo el identificador AcyLa/multi-asset-predictive-model. No se trata de un modelo de lenguaje, sino de un sistema de forecasting de series temporales financieras orientado a la investigacion cuantitativa.

El modelo cubre activos como SPY, QQQ, GLD, SLV, USO, EEM, EFA, EWJ, EWG, EWU, FXI, INDA, EWZ y KWEB, con horizontes de prediccion de 1, 5 y 21 dias. Se entrena sobre mas de 15 anos de datos historicos de Yahoo Finance y 202 caracteristicas de ingenieria por activo, entre las que destacan el envolvente de Nadaraya-Watson, sistemas de bandas de Bollinger multi-ventana, indicadores de tendencia, momentum, volatilidad, volumen, estructura de precio, calendario y correlaciones entre activos.

Su relevancia actual es limitada: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no especifica idiomas ni pipeline, y las metricas publicadas proceden de una particion rapida 70/15/15 (no de un backtest walk-forward puro). Aun asi, resulta un ejemplo didactico y reproducible de pipeline completo de feature engineering financiero mas ensemble de modelos tabulares y secuenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de LightGBM (gradient-boosted trees) + LSTM de 2 capas con atencion |
| Parametros totales | no disponible (LightGBM: 300 estimadores, 127 hojas; LSTM: 2 capas, hidden=128, longitud de secuencia=60) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (longitud de secuencia de entrada de 60 pasos para la LSTM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico sobre series temporales financieras) |
| Licencia | no disponible |
| Formato de pesos | joblib |
| Activos cubiertos | 14 (SPY, QQQ, GLD, SLV, USO, EEM, EFA, EWJ, EWG, EWU, FXI, INDA, EWZ, KWEB) |
| Horizontes de prediccion | 1 dia, 5 dias, 21 dias |
| Tamano del repositorio | 0.1 GB |
| Fecha de creacion (metadato) | 2026-09-12 |

## Arquitectura y entrenamiento

El pipeline sigue la secuencia: descarga de datos desde Yahoo Finance, ingenieria de caracteristicas (202+ indicadores por activo), generacion de etiquetas multi-horizonte, ensemble LightGBM + LSTM y API de prediccion. LightGBM procesa las caracteristicas tabulares con 300 estimadores, 127 hojas y feature_fraction=0.7. La LSTM consta de 2 capas con hidden=128, pooling por atencion, LayerNorm y una cabeza con activacion GELU, sobre secuencias de 60 pasos. El ensemble es una media ponderada de ambos componentes, con pesos ajustados automaticamente sobre el conjunto de validacion.

Las 202+ caracteristicas se organizan en nueve categorias: envolvente de Nadaraya-Watson (10), bandas de Bollinger multi-ventana (45, con deteccion de squeeze y band-walk), tendencia (EMA, SMA, MACD, ADX, Ichimoku; 30+), momentum (RSI, Stochastic, Williams %R, ROC, CCI, Awesome Oscillator; 20+), volatilidad (ATR, Keltner, Donchian, volatilidad historica; 20+), volumen (OBV, MFI, CMF, VWAP, ratio de volumen; 10+), estructura de precio (retornos multi-horizonte, patrones de velas, drawdown, HH/LL; 40+), calendario (10) y correlacion entre activos (beta y correlacion rodante con SPY y GLD; 15+). El etiquetado admite tres enfoques: regresion del retorno futuro, clasificacion direccional (BUY >+2%, SELL <-2%, HOLD intermedio) y triple barrera segun el metodo de Lopez de Prado.

No se documenta en la informacion disponible el numero total de tokens de entrenamiento (concepto no aplicable aqui), la composicion exacta del dataset mas alla de Yahoo Finance, ni procesos de RLHF o DPO, dado que no es un modelo de lenguaje.

## Capacidades

- Prediccion de retorno futuro y direccion (BUY/SELL/HOLD) a horizontes de 1, 5 y 21 dias para 14 activos.
- Generacion de senales de consenso multi-horizonte (por ejemplo, "BUY (2/3)" cuando coincide un subconjunto de los horizontes).
- Ingenieria de caracteristicas financieras automatizada, incluyendo envolvente de Nadaraya-Watson, bandas de Bollinger multi-ventana y correlaciones cruzadas.
- Etiquetado con triple barrera (metodo de Lopez de Prado) para problemas de clasificacion financiera.
- Modo rapido de inferencia (solo LightGBM, sin LSTM) para reducir latencia.
- Reentrenamiento por activo o para todos los activos, con opcion de backtest walk-forward.
- API en Python mediante la clase AssetPredictor y el metodo get_multi_horizon.
- Soporte de cache en parquet para los datos descargados.
- No dispone de tool calling, capacidades de agente, vision, audio ni funciones de lenguaje natural.

## Casos de uso

- Investigacion cuantitativa y generacion de senales: el modelo produce una prediccion direccional y de retorno por activo y horizonte, util como senal base en un pipeline de estudio de factores. Su cobertura de 14 activos permite analizar senales transversales.
- Backtesting de estrategias: con el flag --backtest en train.py se puede ejecutar una validacion walk-forward sobre el historico, comparando la senal del ensemble con retornos realizados antes de considerar cualquier despliegue.
- Screener multi-activo: mediante predict.py --all se obtiene la direccion consensuada de los 14 activos en una sola ejecucion, lo que sirve como filtro preliminar para seleccionar candidatos a analisis mas profundo.
- Prototipado educativo: el pipeline es un ejemplo completo de feature engineering financiero mas ensemble tabular/secuencial, adecuado para ensenar tecnicas como triple barrera, atencion o boosting en un contexto de series temporales.
- Reentrenamiento periodico automatizado: el comando train.py --all permite reintroducir datos actualizados, de forma que un sistema programado pueda recalibrar los modelos por activo de manera recurrente.
- Analisis de regimenes de volatilidad: el uso combinado de ATR, Keltner, Donchian y volatilidad historica permite estudiar como cambia la predictibilidad entre regimenes, algo observable en la diferencia de resultados entre renta variable estadounidense y materias primas.
- Comparacion de tecnicas de suavizado y envolventes: la implementacion del envolvente de Nadaraya-Watson y de bandas de Bollinger multi-ventana permite evaluar el impacto de distintos suavizados sobre la calidad de la senal.

## Benchmarks y rendimiento

Los unicos resultados disponibles son las metricas de la particion rapida 70/15/15 reportadas por el autor. No son benchmarks estandar (MMLU, HumanEval, GSM8K), sino exactitud direccional y ratio de Sharpe sobre datos historicos.

| Activo | Precision dir. 1d | Precision dir. 5d | Precision dir. 21d | Mejor Sharpe |
|---|---|---|---|---|
| SPY | 56.8% | 62.5% | 72.0% | 7.23 |
| QQQ | 54.3% | 59.4% | 68.7% | 6.25 |
| EFA | 52.7% | 57.7% | 67.9% | 5.93 |
| EWU | 53.2% | 59.2% | 67.5% | 6.80 |
| EWJ | 49.9% | 51.1% | 69.4% | 5.60 |
| EEM | 46.5% | 57.3% | 64.1% | 5.74 |
| EWG | 54.2% | 54.7% | 52.3% | 2.34 |
| EWZ | 49.6% | 55.5% | 55.7% | 1.98 |
| FXI | 51.1% | 53.0% | 53.5% | 3.45 |
| USO | 46.0% | 48.8% | 50.6% | 1.44 |
| GLD | 47.8% | 40.6% | 40.4% | -0.19 |
| SLV | 49.4% | 44.4% | 36.8% | -0.13 |
| INDA | 48.5% | 44.2% | 49.5% | 0.22 |
| KWEB | 46.7% | 50.9% | 47.6% | -0.26 |

Conclusiones declaradas por el autor: los ETFs de renta variable estadounidense (SPY, QQQ) muestran la mayor predictibilidad a 21 dias (69-72% de exactitud direccional, Sharpe de 6 a 7); los mercados desarrollados no estadounidenses (EFA, EWU, EWJ, EWG) ofrecen senales fuertes a 21 dias; los mercados emergentes (EEM, EWZ) muestran predictibilidad moderada a 5-21 dias; las materias primas (GLD, SLV, USO) y los activos de India y China (INDA, KWEB) se acercan al 50% (azar) en la mayoria de horizontes; y las predicciones a 1 dia estan cerca del 50% para la mayoria de activos, lo que el autor atribuye a la hipotesis de eficiencia de mercado a corto plazo.

## Requisitos de hardware

- Carga del modelo: los pesos estan en formato joblib; el repositorio ocupa 0.1 GB, por lo que la huella de memoria es muy reducida.
- El componente LightGBM (300 arboles, 127 hojas) y la LSTM (2 capas, hidden=128, secuencia 60) son modelos pequenos; la inferencia puede ejecutarse en CPU sin GPU dedicada.
- VRAM estimada para inferencia: no disponible de forma oficial, pero por el tamano descrito cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU.
- GPU recomendadas: no disponibles; no se requieren para el tamano indicado.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU; no se ha publicado una estimacion cuantitativa de VRAM.
- Opciones de despliegue: scripts de Python incluidos (predict.py, train.py) y la API AssetPredictor. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Extensiones en el modelo: la prediccion completa integra LightGBM y LSTM; el modo --no-lstm permite inferencia solo con LightGBM para reducir coste.
- Latencia y throughput: no disponibles en la informacion proporcionada. Requiere descarga previa de datos desde Yahoo Finance, salvo que exista cache en parquet.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables con datos verificables (parametros, contexto, rendimiento y licencia) de la misma categoria. La busqueda web realizada no devolvio resultados relacionados con el modelo ni con modelos financieros alternativos, sino contenidos sin relacion. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, lo que genera incertidumbre legal sobre cualquier uso comercial o redistribucion.
- Validacion limitada: las metricas proceden de una particion rapida 70/15/15, no de un backtest walk-forward puro ni de datos fuera de muestra en tiempo real.
- Riesgo de sobreajuste o fuga de datos: los resultados publicados (por ejemplo, Sharpe de 6 a 7 y exactitud direccional del 72% a 21 dias en SPY) son implausiblemente altos para trading real y deben interpretarse con cautela extrema.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin revision independiente ni replicacion conocida.
- Bajo rendimiento en varias clases de activos: materias primas (GLD, SLV, USO) y activos de India y China (INDA, KWEB) se situan cerca del azar, con Sharpe negativo en GLD, SLV y KWEB.
- Horizonte corto poco informativo: a 1 dia la mayoria de activos ronda el 50%, consistente con la eficiencia de mercado a corto plazo.
- Dependencia de datos de Yahoo Finance: la calidad, la cobertura y los ajustes (dividendos, splits) de esa fuente condicionan el modelo.
- No estacionariedad: los mercados financieros cambian de regimen; un modelo entrenado con 15 anos de historia puede degradarse fuera del periodo de entrenamiento.
- No es asesoramiento financiero: las salidas son predicciones estadisticas, no recomendaciones de inversion.
- Ambito restringido: solo cubre 14 activos y no admite lenguaje natural, tool calling, agentes ni otras modalidades.
- Metadatos incompletos o inconsistentes: pipeline, idiomas, licencia e idiomas no disponibles, y la fecha de creacion registrada (2026) no aporta informacion util sobre el ciclo de vida real del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/AcyLa/multi-asset-predictive-model
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
