# Azharkhan79/nem-forecast-vic1

## Resumen

nem-forecast-vic1 es un modelo de prediccion de demanda electrica a corto plazo para la region VIC1 (Victoria) del Mercado Electrico Nacional de Australia (NEM). No es un modelo de lenguaje: es un conjunto de modelos de regresion cuantilica implementados con LightGBM, uno por grupo de horizontes, que estima la demanda operativa cada media hora desde 30 minutos hasta 24 horas vista, entregando la mediana (q50) junto con un intervalo del percentil 10 al 90.

Lo desarrolla el autor Azharkhan79 como parte del proyecto nem-forecast, cuyo codigo de entrenamiento, evaluacion y servicio vive en un repositorio publico de GitHub. Su proposito declarado es servir como demostracion de portafolio de un sistema de prediccion de estilo productivo sobre datos reales de AEMO, y el propio autor advierte que no esta pensado para pujas de mercado, trading ni decisiones de despacho operativo.

La relevancia radica en su enfoque de evaluacion: un backtest walk-forward con ventana expansiva y reentrenamiento cada 30 dias que supera a varias lineas base (persistencia, naive estacional, medias intra-semana) en los 48 horizontes de media hora evaluados, con un MAE global de 351 MW frente a los 506 MW del naive estacional. El modelo se distribuye con licencia MIT y el pipeline mide cada feature en el origen del pronostico para evitar fugas de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (LightGBM) con regresion cuantilica en q0.1/q0.5/q0.9; un modelo por grupo de horizontes; no es una red neuronal |
| Parametros totales | no disponible (no se indica el numero de arboles ni de hojas por booster) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular de series temporales, sin ventana de contexto autoregresiva) |
| Tipos de cuantizacion | no aplica (modelos de arboles en texto plano; no hay pesos flotantes que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | LightGBM booster en texto plano (`group_*.txt`) mas metadatos en `model.json`; nada serializado con pickle |

## Arquitectura y entrenamiento

El sistema es un conjunto de seis boosters de LightGBM, uno por grupo de horizontes: 1, 2-3, 4-6, 7-12, 13-24 y 25-48 medias horas. Cada booster produce tres cuantiles (0.1, 0.5 y 0.9), de modo que la prediccion se entrega como mediana con intervalo p10-p90. Las features son doce y todas ellas calculables en el origen del pronostico, condicion que el pipeline verifica fila a fila: horizonte, media hora del dia, dia de la semana, mes, indicador de festivo, demanda en el origen, mismo tramo del dia anterior, mismo tramo de la semana anterior, media del mismo tramo en 4 semanas, media movil de 24 horas, desviacion tipica movil de 24 horas y media movil de 7 dias.

El entrenamiento usa datos publicos de AEMO: despacho de NEMWeb y el archivo mensual de precio y demanda. La variable objetivo es la demanda operativa de VIC1 (`TOTALDEMAND`), con valores de 5 minutos promediados a medias horas. La salida fotovoltaica en tejados no se incluye en la demanda operativa. El rango de datos va del 1 de octubre de 2023 a las 00:30 al 13 de octubre de 2026 a las 23:00, en hora de mercado AEMO (UTC+10).

La evaluacion es un backtest walk-forward sobre el periodo 13 de octubre de 2025 a 13 de octubre de 2026, con ventana expansiva, reentrenamiento cada 30 dias y un pronostico desde cada origen de media hora. Los mismos pronosticos se generaron con todas las lineas base, lo que permite una comparacion homogenea. No se menciona uso de RLHF, DPO ni tecnicas de aprendizaje por refuerzo, algo coherente con la naturaleza no generativa del modelo. El modelo checkpoint corresponde al commit `fa90c4b4c9a356a0394d9fee9149d3f9665711e1` del repositorio.

## Capacidades

- Prediccion de demanda operativa de VIC1 cada media hora, con horizontes desde 30 minutos hasta 24 horas.
- Prediccion probabilistica mediante regresion cuantilica: devuelve mediana e intervalo p10-p90 (con la salvedad de calibracion indicada mas abajo).
- Manejo de estacionalidad multiple: patron intradiario, diario, semanal y estacional anual, mediante features de mismo tramo previo y medias moviles.
- Incorporacion de festivos publicos de Victoria a traves de un indicador binario.
- Cobertura de los 48 horizontes de media hora del dia, con entrega de un pronostico por horizonte.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues; no genera texto.
- No dispone de modo de pensamiento, vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Demostracion de portafolio tecnico: sirve para mostrar un pipeline completo de prediccion de series temporales (ingesta de datos publicos, ingenieria de features sin fuga, backtest walk-forward y servicio) sobre datos reales de AEMO.
- Analisis exploratorio de la curva de demanda de Victoria: permite comparar la demanda prevista con la observada por tramo horario y detectar patrones estacionales o anomalias, dado que el modelo cubre los 48 horizontes.
- Evaluacion de metodologias de backtesting: el proyecto incluye lineas base (persistencia, naive estacional, medias intra-semana) evaluadas sobre los mismos pronosticos, lo que lo convierte en un banco de pruebas para probar tecnicas alternativas de validacion temporal.
- Base para sistemas mas completos: al ser codigo abierto con MIT y estar estructurado en features computables en origen, puede extenderse anadiendo entradas meteorologicas, que es precisamente la carencia que explica su mayor error en las horas centrales del dia.
- Investigacion sobre prediccion probabilistica: los cuantiles q10/q50/q90 permiten estudiar la calibracion de intervalos en series de demanda y comparar perdidas tipo pinball frente a otros enfoques.
- Cuadros de mando y visualizacion educativa: los pronosticos por horizonte y su intervalo pueden alimentar dashboards para explicar como se comporta la demanda de un mercado electrico, sin uso operativo.
- Generacion de conjuntos de pronosticos etiquetados para entrenar o comparar modelos posteriores, siempre que se respete la advertencia de no usar los resultados para despacho o pujas.

## Benchmarks y rendimiento

Backtest walk-forward del 13 de octubre de 2025 al 13 de octubre de 2026, con reentrenamiento cada 30 dias. MAE en MW por horizonte:

| Modelo | 30 min | 1 h | 2 h | 3 h | 6 h | 12 h | 24 h | Global |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| lightgbm_quantile | 103 | 162 | 246 | 289 | 360 | 370 | 387 | 351 |
| persistence | 170 | 324 | 600 | 830 | 1.181 | 996 | 506 | 970 |
| same_weekday_mean_4w | 502 | 502 | 502 | 502 | 502 | 502 | 502 | 502 |
| seasonal_naive | 507 | 507 | 507 | 507 | 507 | 506 | 506 | 506 |
| weekly_seasonal_naive | 592 | 592 | 592 | 592 | 592 | 592 | 593 | 592 |

Perdida pinball, promedio de q10/q50/q90 en MW, por horizonte:

| Modelo | 30 min | 1 h | 2 h | 3 h | 6 h | 12 h | 24 h | Global |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| lightgbm_quantile | 36 | 54 | 80 | 94 | 117 | 121 | 126 | 114,3 |
| persistence | 53 | 101 | 186 | 255 | 359 | 307 | 179 | 300,0 |
| same_weekday_mean_4w | 178 | 178 | 178 | 178 | 178 | 178 | 178 | 177,8 |
| seasonal_naive | 179 | 179 | 179 | 179 | 179 | 179 | 179 | 179,0 |
| weekly_seasonal_naive | 210 | 210 | 210 | 210 | 210 | 210 | 210 | 209,8 |

Segun la model card, el modelo supera al naive estacional en los 48 horizontes y a la mejor linea base de cada horizonte en los 48 horizontes.

## Requisitos de hardware

- Inferencia en CPU: al ser boosters de LightGBM, no requiere GPU. Cualquier CPU moderna sirve para el calculo.
- VRAM: no aplica; no hay uso de memoria de GPU en inferencia.
- Memoria RAM: no disponible de forma explicita, aunque por la naturaleza de los modelos de arboles en texto plano es previsiblemente reducida; el autor no publica cifras.
- GPU recomendadas: no aplica (no se necesita GPU).
- Encaje en hardware de consumo: si, el sistema esta pensado para ejecutarse en CPU convencional; no se especifican requisitos minimos.
- Opciones de despliegue: el autor no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo); la carga se realiza mediante el paquete del proyecto, con `snapshot_download` de HuggingFace y la funcion `load_model` de `nem_forecast.models.catalog`.
- Latencia y throughput: no disponible (no se publican cifras).

## Comparativa con modelos similares

Comparativa con las lineas base evaluadas en la propia model card sobre los mismos pronosticos:

| Modelo | Tipo | MAE global (MW) | Pinball global (MW) | Licencia / disponibilidad |
|---|---|--:|--:|---|
| nem-forecast-vic1 (lightgbm_quantile) | Gradient boosting cuantilico | 351 | 114,3 | MIT, pesos en HuggingFace |
| persistence | Linea base trivial | 970 | 300,0 | No aplica |
| same_weekday_mean_4w | Media movil intra-semana | 502 | 177,8 | No aplica |
| seasonal_naive | Naive estacional | 506 | 179,0 | No aplica |
| weekly_seasonal_naive | Naive estacional semanal | 592 | 209,8 | No aplica |

No se dispone de comparacion con otros modelos publicados de prediccion de demanda del NEM (por ejemplo, aproximaciones con gradient boosting con entradas meteorologicas o redes recurrentes) en la informacion proporcionada, por lo que la unica referencia cuantitativa disponible son estas lineas base internas.

## Limitaciones y advertencias

- Ausencia de entradas meteorologicas: el error es maximo en el tramo solar de 10-16 h (597 MW de MAE) frente al tramo nocturno de 00-06 h (171 MW). La generacion fotovoltaica en tejados depende de la nubosidad y la demanda de la temperatura, y el modelo no ve ninguna de las dos.
- Calibracion de intervalos: el intervalo p10-p90 contuvo el 68,5 % de la demanda real en el backtest, frente al 80 % nominal. El intervalo es demasiado estrecho, por lo que p10 y p90 deben tratarse como cotas optimistas, no calibradas.
- Costuras entre grupos de horizontes: al usar un modelo por grupo (1, 2-3, 4-6, 7-12, 13-24, 25-48 medias horas), el error puede dar un salto leve en las transiciones entre grupos.
- Dias raros: Victoria tiene unos 13 festivos publicos al ano, de modo que el comportamiento en festivos se apoya en pocos ejemplos; en eventos inusuales (olas de calor, tormentas, intervenciones de mercado) hay aun menos.
- Cambio estructural: el crecimiento de la fotovoltaica en tejados y de las baterias remodela continuamente la curva de demanda. El modelo refleja su ventana de entrenamiento y necesita reentrenamiento periodico; el proyecto monitoriza error en vivo y deriva por este motivo.
- Datos revisados: AEMO revisa los valores publicados. El modelo aprendio de los valores tal como estaban en el momento del entrenamiento, lo que puede introducir discrepancias frente a las series corregidas.
- Restriccion de uso: la model card advierte explicitamente que no esta destinado a pujas de mercado, trading ni decisiones de despacho operativo, y que no ha sido validado para ninguna region distinta de VIC1.
- Licencia: MIT permite uso comercial y modificacion, pero debe respetarse la atribucion correspondiente a los datos de AEMO, que se rigen por su propia licencia CC BY 4.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Azharkhan79/nem-forecast-vic1
- Repositorio del proyecto: https://github.com/proxykhan/nem-forecast
- Version del codigo de entrenamiento: https://github.com/proxykhan/nem-forecast/tree/fa90c4b4c9a356a0394d9fee9149d3f9665711e1
- Definiciones de features y backtesting: https://github.com/proxykhan/nem-forecast#features-and-backtesting
- Grafico de pronosticos VIC1: https://nem.redaxe.com/chart/VIC1
- Datos de precio y demanda de VIC1 (proyecto de terceros): https://github.com/Samanali-J/vic-nem-price-demand
- Monitor de pronosticos de Victoria (proyecto de terceros): https://github.com/spgg224/vic-forecast-monitor
