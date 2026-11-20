# ayanjawed/transitpulse-planning-model

## Resumen

TransitPulse planning model es un modelo de regresión tabular publicado por el usuario ayanjawed en Hugging Face, concebido como proyecto del curso CT-378 Machine Learning. Su funcion es predecir la afluencia horaria de pasajeros (riders por ruta-hora) en 24 rutas de autobus de la MTA de Nueva York, a partir de informacion conocida de antemano: ruta, distrito, fecha, hora, programacion GTFS y variables meteorologicas. No es un modelo de lenguaje ni una red neuronal: es un pipeline de scikit-learn que combina codificacion one-hot con un `HistGradientBoostingRegressor`.

El modelo resuelve un problema acotado de planificacion de transporte: dado un dia y una hora futuros, estimar cuantos pasajeros subiran a una ruta concreta. Su relevancia es limitada y muy contextual: sirve como herramienta de analisis what-if para planificadores dentro del periodo y las rutas cubiertas por los datos, y como ejemplo docente de pipeline completo (construccion de dataset, seleccion de modelo por MAE de validacion, evaluacion con split temporal). No esta pensado para produccion general ni para otras ciudades.

El repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB (peso inferior a 50 MB por restriccion de seleccion) y se creo el 20 de noviembre de 2026. La licencia figura como "other", sin texto adicional verificado. No se dispone de informacion sobre idiomas soportados porque el modelo no procesa texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: one-hot encoding de `bus_route` y `borough` + `HistGradientBoostingRegressor` (learning_rate 0.05, max_iter 500, max_leaf_nodes 63) |
| Parametros totales | No disponible (modelo de arboles, no aplica el concepto de parametros de red neuronal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de fila unica con 19 columnas) |
| Tipos de cuantizacion | No disponible (no se documentan; el artefacto es un fichero joblib) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | other |
| Formato de pesos | joblib (`planning_model.joblib`), requiere scikit-learn 1.9.1 |

## Arquitectura y entrenamiento

La arquitectura es un `sklearn.pipeline.Pipeline` con dos etapas: codificacion one-hot de las variables categoricas `bus_route` y `borough`, seguida de un `HistGradientBoostingRegressor` configurado con learning_rate 0.05, max_iter 500 y max_leaf_nodes 63. El modelo se selecciono por MAE de validacion entre candidatos cuyo fichero guardado no superase los 50 MB; un Random Forest obtuvo precision similar pero pesaba unos 110 MB, por lo que se descarto. Las 19 columnas de entrada son: `bus_route`, `borough`, `gtfs_n_stops`, `gtfs_max_stops_per_trip`, `sched_trips_hr`, `sched_headway_min`, `sched_trips_day`, `temperature_2m`, `precipitation`, `snowfall`, `wind_speed_10m`, `hour`, `day_of_week`, `is_weekend`, `hour_sin`, `hour_cos`, `is_am_peak`, `is_pm_peak`, `is_holiday` e `is_school_day`.

Los datos provienen de cuatro fuentes: MTA Bus Hourly Ridership Beginning 2025 (NY Open Data, dataset `gxb3-akrn`), agregado a una fila por ruta y hora; GTFS estatico de autobuses de la MTA (snapshot de 2026, no el servicio de 2025 que genero los conteos); meteorologia historica de Open-Meteo (un valor horario para toda la ciudad de Nueva York); y calendario de festivos federales de EE. UU. (paquete `holidays`) mas un calendario escolar de NYC aproximado y escrito a mano. El conjunto abarca ocho ventanas de dos semanas entre enero y septiembre de 2025, 24 rutas y 64.512 filas ruta-hora; las horas ausentes se rellenan con 0 pasajeros. La particion es temporal por dias completos: entrenamiento del 2025-01-13 al 2025-07-14, validacion del 2025-07-15 al 2025-09-04 y test del 2025-09-05 al 2025-09-28 (17 dias, evaluado una sola vez); el modelo final se reajusta sobre entrenamiento mas validacion antes del test. No se documenta RLHF, DPO ni tecnicas de decodificacion.

## Capacidades

- Prediccion de regresion tabular: estima pasajeros por ruta-hora para las 24 rutas de autobus de la MTA incluidas en el entrenamiento.
- Incorporacion de estacionalidad horaria y semanal mediante codificacion ciclica (`hour_sin`, `hour_cos`) y variables de dia de la semana y fin de semana.
- Modelado de picos de demanda mediante indicadores `is_am_peak` e `is_pm_peak`.
- Ajuste por calendario: festivos federales de EE. UU. y dias escolares de NYC.
- Uso de variables meteorologicas (temperatura, precipitacion, nieve, viento) como predictores.
- Uso de caracteristicas de la programacion GTFS (numero de paradas, maximo de paradas por viaje, viajes por hora y por dia, intervalo entre viajes).
- Analisis what-if sobre fechas dentro del periodo 2025-01-06 a 2025-09-28 y rutas vistas en entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Planificacion de frecuencias: un planificador puede introducir una ruta, una hora y una fecha futura dentro del periodo cubierto y obtener una estimacion de pasajeros para decidir si conviene reforzar el servicio en horas punta.
- Analisis what-if de escenarios meteorologicos: variando temperatura, precipitacion o nieve en la fila de entrada se puede observar el efecto estimado sobre la demanda, con la cautela de que el autor advierte que la meteorologia actua en parte como proxy de la estacion.
- Evaluacion de impacto de dias especiales: comparar la prediccion para un festivo o un dia escolar frente a un dia laborable equivalente permite dimensionar refuerzos o reducciones de servicio.
- Docencia y formacion: el pipeline completo (construccion del dataset, split temporal, seleccion por MAE, evaluacion unica en test) sirve como ejemplo reproducible de flujo de machine learning tabular aplicado a transporte.
- Prototipado de herramientas de planificacion: la demo en Hugging Face Spaces y la app Streamlit permiten integrar el modelo en un cuadro de mando interno para exploracion rapida sin infraestructura de GPU.
- Comparacion con baseline operativo: dado que supera al baseline de media historica por ruta, hora y tipo de dia (MAE 65.4 frente a 78.0), puede emplearse como referencia para validar heuristicas de planificacion existentes en las rutas cubiertas.
- Analisis de sensibilidad de la programacion: modificando `sched_trips_hr` o `sched_headway_min` se puede explorar como cambia la demanda estimada ante cambios de oferta, siempre dentro del rango observado en entrenamiento.

## Benchmarks y rendimiento

Evaluacion con split temporal por dias completos y test del 2025-09-05 al 2025-09-28 (17 dias):

| Modelo | MAE (pasajeros) | RMSE | R2 |
|---|---|---|---|
| Planning model (este modelo) | 65.4 | 113.3 | 0.92 |
| Baseline: media de entrenamiento por ruta, hora y dia laborable/fin de semana | 78.0 | 129.4 | 0.89 |

La media de pasajeros por ruta-hora en el periodo de test es de 450, por lo que el error representa aproximadamente el 14,5 %. Un modelo separado con historial reciente alcanza MAE 39.0, pero no se despliega porque requiere datos recientes. Otras comprobaciones: leave-one-window-out con MAE 53.0 frente a baseline 68.9; rutas no vistas con MAE 111 frente a baseline 132.

## Requisitos de hardware

- Inferencia en CPU: el artefacto es un fichero joblib de menos de 50 MB con un `HistGradientBoostingRegressor`; no requiere GPU.
- VRAM estimada: no aplica; el modelo no usa aceleracion grafica.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: basta con Python y scikit-learn 1.9.1; el limite practico es la memoria para cargar el pipeline, del orden de decenas de MB.
- Opciones de despliegue: carga directa con `joblib.load` en un servicio Python, la demo en Hugging Face Spaces o la app Streamlit enlazadas en la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MAE en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TransitPulse planning model | Pipeline sklearn (one-hot + HistGradientBoosting) | No aplica | No aplica | 65.4 (ruta-hora) | other | Hugging Face, menos de 50 MB |
| Baseline media por ruta, hora y tipo de dia | Heuristico estadistico | No aplica | No aplica | 78.0 (ruta-hora) | No aplica | Definido en la model card |
| Random Forest alternativo (descartado por tamano) | Ensemble de arboles sklearn | No aplica | No aplica | Precision similar segun el autor | No disponible | No publicado, unos 110 MB |
| Modelo de historial reciente (no desplegado) | No especificado | No disponible | No aplica | 39.0 (ruta-hora) | No disponible | No publicado |

No se dispone de comparacion con modelos publicos de prediccion de demanda de transporte en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura restringida: solo 24 rutas y ocho ventanas de dos semanas en un unico ano; el test son 17 dias, por lo que diferencias pequenas entre modelos no son significativas.
- Cambios de nivel de servicio no modelados: rutas como Q58, Q10 y Q65 cayeron alrededor del 35 % y Q25 subio cerca del 32 % desde el verano; el modelo no conoce cambios de servicio y su error en esas rutas es unas tres veces mayor.
- La meteorologia aporta poco y en parte como indicio de estacion; no es evidencia de causalidad sobre la demanda.
- La meteorologia es un unico valor horario para toda la ciudad y el test uso datos registrados, no previsiones, por lo que el error en uso real sera mayor.
- El GTFS es un snapshot de 2026, no el servicio de 2025 que genero los conteos; el calendario escolar es aproximado y la redaccion de la licencia no se verifico de forma independiente.
- Datos exclusivamente de Nueva York; el autor no hace ninguna afirmacion sobre Karachi.
- Fuera de alcance: otras rutas, otras ciudades y fechas fuera del periodo 2025-01-06 a 2025-09-28.
- Licencia "other" sin texto verificado: antes de cualquier uso comercial debe aclararse con el autor y revisarse los terminos de NY Open Data y de las fuentes GTFS y Open-Meteo.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones poco fiables fuera de la distribucion de entrenamiento.
- El modelo no procesa lenguaje natural ni admite instrucciones; cualquier uso conversacional requeriria una capa externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayanjawed/transitpulse-planning-model
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ayanjawed/TransitPulse
- Demo en Streamlit: https://ml-project-wuwhhjv3aqsnuxh5x5tdwi.streamlit.app/
- Codigo, constructor de datos y notebooks: https://github.com/ayanmirza99/ML-Project
- Dataset MTA Bus Hourly Ridership Beginning 2025 (NY Open Data, `gxb3-akrn`): https://data.ny.gov/Transportation/MTA-Bus-Hourly-Ridership-Beginning-2025/gxb3-akrn
- GTFS estatico de la MTA: https://www.mta.info/developers
- Meteorologia historica de Open-Meteo: https://open-meteo.com/
