# abir71/bd-weather-forecast-models

## Resumen

`abir71/bd-weather-forecast-models` es un conjunto de modelos de aprendizaje automatico supervisado publicados por Abir Hosen Ashik (Noakhali Science and Technology University) para la prediccion mensual de temperatura media, humedad relativa media y precipitacion total en 24 estaciones del Bangladesh Meteorological Department (BMD). No es un modelo de lenguaje ni una red neuronal profunda: son pipelines de scikit-learn con escalado estandar, donde la temperatura y la humedad se predicen con XGBoost y la precipitacion con regresion de vectores de soporte (kernel RBF). El repositorio incluye ademas la climatologia estacional por estacion y mes, usada como predictor y como referencia de skill.

El problema que aborda es la prediccion a un mes vista con control estricto de fuga de informacion ("leakage controlled"): para predecir el mes *t* solo se emplean observaciones hasta el final del mes *t*−1, con validacion por origen movil y reajuste anual. La relevancia practica esta en que ofrece una linea base estadistica reproducible y bien documentada para benchmarking de predicciones estacionales a escala de estacion, con intervalos de prediccion conformales al 90 % y metricas publicadas frente a la climatologia.

Los modelos se distribuyen en dos carpetas: `models/test_origin_2018/` (entrenados con 1982-2017, usados para evaluar 2018-2022) y `models/full_2022/` (entrenados hasta 2022 para pronosticar desde observaciones mas recientes). El tamano del repositorio es practicamente nulo (0.0 GB), coherente con modelos tabulares de arboles y SVR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipelines de scikit-learn: XGBoost (temperatura, humedad) y SVR con kernel RBF (precipitacion), con StandardScaler |
| Parametros totales | No disponible (modelos tabulares; el numero de parametros no es una magnitud significativa) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; requiere 12 meses previos por estacion (t-12 a t-1) y el mes previo de las estaciones vecinas |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos cuantizados; artefactos `.joblib`) |
| Idiomas soportados | Ingles (documentacion y etiquetas); los datos son numericos |
| Licencia | MIT (modelos y codigo); las observaciones originales pertenecen al BMD |
| Formato de pesos | `.joblib` (pipeline serializado de scikit-learn), mas `climatology.csv` y `metadata.json` por carpeta |

## Arquitectura y entrenamiento

Cada objetivo tiene su propio estimador supervisado sobre caracteristicas tabulares derivadas de series temporales mensuales. Los predictores incluyen: retardos 1, 2, 3 y 12 del objetivo y su media trimestral; valores del mes anterior del resto de variables (presion, velocidad y direccion del viento codificada como seno y coseno, punto de rocio) y la depresion del punto de rocio; codificacion ciclica del mes (seno y coseno); coordenadas de la estacion; valor del mes anterior en las 4 estaciones mas cercanas ponderado por distancia inversa; y la climatologia estacion-mes del objetivo. El modulo `bdweather.py` construye todas estas caracteristicas a partir de un panel mensual.

Los hiperparametros se seleccionaron mediante validacion cruzada de origen movil con ventana expansiva, usando unicamente datos hasta 2017. La evaluacion del paper emplea un esquema de test por origen movil con reajuste anual sobre 2018-2022 (24 estaciones x 60 meses). Los intervalos de prediccion son conformales de particion estratificados por estacion al 90 %, con cobertura empirica observada de 0,90 a 0,94. El conjunto de datos de entrenamiento es el panel de calidad controlada `abirhosenashik/bangladesh-bmd-station-weather-data-19812022-qc` (1981-2022).

## Capacidades

- Prediccion del proximo mes de temperatura media (grados Celsius) mediante XGBoost.
- Prediccion del proximo mes de humedad relativa media (porcentaje) mediante XGBoost.
- Prediccion del proximo mes de precipitacion total (milimetros) mediante SVR con kernel RBF.
- Generacion de intervalos de prediccion conformales al 90 % (limites inferior y superior) junto con el valor climatologico y, si esta disponible, el valor observado.
- Uso de informacion espacial: interpolacion por distancia inversa de las 4 estaciones vecinas.
- Uso de informacion estacional: climatologia estacion-mes y codificacion ciclica del mes.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Cobertura limitada a las 24 estaciones del panel de entrenamiento y a datos hasta diciembre de 2022.

## Casos de uso

- Benchmarking de metodos de prediccion estacional: sirve como linea base reproducible (XGBoost/SVR con climatologia) frente a la que comparar modelos mas complejos, gracias a sus metricas publicadas y a su esquema de validacion por origen movil documentado.
- Investigacion sobre control de fuga de informacion: el diseno "leakage controlled" y el reajuste anual permiten estudiar como afecta la construccion de caracteristicas al skill aparente en series climaticas mensuales.
- Docencia en series temporales tabulares: el paquete incluye `bdweather.py` para construir retardos, codificaciones ciclicas y vecinos espaciales, lo que facilita ejercicios practicos de ingenieria de caracteristicas.
- Planificacion agricola de baja frecuencia: la prediccion de precipitacion mensual total y temperatura media puede informar decisiones de calendario de siembra a escala estacional, siempre que se respete la advertencia de que no sirve para alertas.
- Analisis exploratorio de variabilidad climatica regional: las predicciones por estacion y los intervalos conformales permiten estudiar que divisiones (por ejemplo, Chittagong) y estaciones concentran el skill del modelo.
- Complemento estadistico a la prediccion numerica del tiempo: el propio autor lo plantea como complemento, no sustituto, de los modelos NWP para horizontes mensuales.
- Evaluacion comparativa con SARIMA: util para reproducir el hallazgo de que un SARIMA por estacion supera a los modelos ML en precipitacion (RMSE 126,5 mm) y humedad (3,79 %), lo que orienta la eleccion de metodo.

## Benchmarks y rendimiento

Evaluacion del paper sobre 2018-2022 (24 estaciones x 60 meses), test por origen movil con reajuste anual. MSESS es la puntuacion de skill del error cuadratico medio respecto a la climatologia (mayor que 0 indica mejor que la climatologia).

| Objetivo | Modelo | MAE | RMSE | R² | MSESS | RMSE climatologia |
|---|---|---|---|---|---|---|
| Temperatura | XGBoost | 0,61 °C | 0,74 °C | 0,963 | +0,32 | 0,90 °C |
| Precipitacion | SVR | 79,7 mm | 132,1 mm | 0,664 | +0,21 | 148,4 mm |
| Humedad | XGBoost | 3,05 % | 4,35 % | 0,842 | +0,56 | 6,58 % |

Comparacion interna citada en la model card: un SARIMA por estacion obtuvo mejor RMSE que todos los modelos ML en precipitacion (126,5 mm) y humedad (3,79 %). La cobertura empirica de los intervalos conformales al 90 % fue de 0,90 a 0,94.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU.
- GPU: no necesaria. Cualquier CPU moderna es suficiente para XGBoost y SVR sobre paneles de 24 estaciones.
- Memoria RAM: unos pocos cientos de MB para cargar los pipelines `.joblib` y el panel mensual; no disponible una cifra exacta.
- Despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI (no son modelos de lenguaje). El uso previsto es mediante `huggingface_hub.snapshot_download` y el modulo `bdweather.py`, o serializando los pipelines en un servicio Python propio.
- Dependencias fijadas en la model card: `scikit-learn==1.9.1`, `xgboost==3.4.1`, `pandas`, `numpy`, `joblib`, `huggingface_hub`.
- Latencia y throughput: no disponibles; por la naturaleza del modelo (arboles y SVR sobre decenas de filas) se espera del orden de milisegundos por estacion y mes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bd-weather-forecast-models | XGBoost + SVR tabular | No disponible | 12 meses previos; horizonte 1 mes | RMSE temp. 0,74 °C; precip. 132,1 mm; hum. 4,35 % | MIT | Hugging Face, repo publico |
| SARIMA por estacion (referencia del paper) | Serie temporal estadistica | No disponible | Horizonte 1 mes | RMSE precip. 126,5 mm; hum. 3,79 % | No disponible | Implementacion propia, no publicada como artefacto |
| Climatologia estacion-mes | Linea base estadistica | No aplica | Horizonte 1 mes | RMSE temp. 0,90 °C; precip. 148,4 mm; hum. 6,58 % | No disponible | Incluida en el repositorio (`climatology.csv`) |

No se dispone de comparacion con otros modelos publicados de prediccion mensual especificos para Bangladesh en la informacion proporcionada.

## Limitaciones y advertencias

- No apto para alertas: los meses de precipitacion extrema estan fuertemente subestimados, con un sesgo relativo de aproximadamente -40 % por encima del percentil 95 de la estacion. No debe usarse para avisos de inundacion ni de desastres.
- Skill modesto y variable: la mejora sobre la climatologia es limitada y el skill en precipitacion procede casi por completo de la division de Chittagong y de la temporada de monzon.
- Cambio de nivel en humedad: se observa un desplazamiento de nivel despues de 2014 que podria reflejar cambios de instrumentacion.
- Cobertura de datos restringida: solo las 24 estaciones del panel de entrenamiento; los datos terminan en diciembre de 2022 y los pronosticos posteriores requieren nuevas observaciones en el mismo formato.
- Requisitos de entrada estrictos: hacen falta 12 meses previos de ocho variables por estacion y el mes previo de las estaciones vecinas; el panel debe incluir las columnas `Station, Year, Month, Temperature, Humidity, Rainfall, Pressure, Wind_speed, Wind_dir_sin, Wind_dir_cos, Dew_Point`.
- Dependencias de version fijadas: la model card especifica versiones concretas de scikit-learn y xgboost, lo que puede generar incompatibilidades al deserializar los `.joblib` con otras versiones.
- Licencia: los modelos y el codigo son MIT, pero las observaciones originales pertenecen al BMD; conviene revisar las condiciones de uso de esos datos antes de un uso comercial o de redistribucion.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si existe riesgo de extrapolacion silenciosa si se alimenta el modelo con estaciones o periodos fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abir71/bd-weather-forecast-models
- Codigo del paper: https://github.com/abir-hosen-ashik/bd-monthly-weather-forecast-ml-paper
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/abirhosenashik/bangladesh-bmd-station-weather-data-19812022-qc
- Dataset en Hugging Face: https://huggingface.co/datasets/abirhosenashik/bangladesh-bmd-station-weather-data-19812022-qc
- Demo interactiva: Space enlazado desde la model card (no se proporciona URL directa)
- Paper: Das JR, Khan MAR, Ahammad I, Hosen A. "Leakage controlled machine learning forecasting of monthly rainfall temperature and humidity across Bangladesh", *Discover Environment* (en revision)
