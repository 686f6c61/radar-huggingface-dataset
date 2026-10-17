# itsmesonu47/food-delivery-time-estimator

## Resumen

Food Delivery Time Estimator es un modelo de regresion tabular publicado en HuggingFace por el usuario itsmesonu47. No es un modelo de lenguaje ni una red neuronal: es un `RandomForestRegressor` de scikit-learn serializado con joblib (`delivery_rf_model.pkl`, unos 209 MB) que predice el tiempo total de entrega de un pedido de comida, en minutos, a partir de 33 caracteristicas numericas y one-hot que describen al repartidor, la geografia del trayecto, la franja temporal, las condiciones meteorologicas, la densidad de trafico, el tipo de pedido, el vehiculo y la ciudad.

El problema que resuelve es acotado pero muy comun en logistica de ultima milla: estimar el ETA de un pedido antes de confirmarlo, para fijar expectativas al cliente y para alimentar heuristicas de asignacion de repartidores. El autor lo presenta explicitamente como un proyecto de aprendizaje ("food delivery learning project") y advierte de que no esta pensado para garantias comerciales ni para usos criticos para la seguridad. La licencia es MIT, lo que permite reutilizacion y modificacion, y el repositorio ocupa 0,2 GB en total.

Es relevante ahora sobre todo como referencia practica: un pipeline completo de regresion tabular con ingenieria de caracteristicas documentada (33 columnas en orden exacto), metricas de test publicadas (MAE de 3,12 minutos, R² de 0,833) y una funcion de descarga via `huggingface_hub` lista para usar. Como alternativa a un LLM para una tarea numerica estrecha, es ordenes de magnitud mas barato de ejecutar y de auditar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest de regresion (`sklearn.ensemble.RandomForestRegressor`), modelo de arboles sobre datos tabulares |
| Parametros totales | no disponible (el autor no publica numero de arboles, profundidad ni numero de nodos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un vector fijo de 33 caracteristicas tabulares |
| Tipos de cuantizacion | no disponible; no se publican pesos cuantizados. El autor sugiere una exportacion a ONNX como alternativa de despliegue |
| Idiomas soportados | no disponible (no procesa texto libre; las categorias del dataset estan en ingles: `Sunny`, `Stormy`, `Metropolitian`, etc.) |
| Licencia | MIT |
| Formato de pesos | pickle de scikit-learn / joblib (`delivery_rf_model.pkl`, ~209 MB) |
| Tarea (pipeline) | `tabular-regression` |
| Variable objetivo | `Time_taken (min)` (minutos) |
| Numero de caracteristicas de entrada | 33, en orden exacto |
| Tamano del repositorio | 0,2 GB |
| Libreria | scikit-learn |
| Fecha de creacion | 2026-10-17 |
| Ultima actualizacion | 2026-10-17 |

## Arquitectura y entrenamiento

La arquitectura es un bosque aleatorio de regresion, un ensemble de arboles de decision entrenados con bagging y seleccion aleatoria de subconjuntos de caracteristicas en cada division. El modelo se entrena con `RandomForestRegressor` de scikit-learn y se serializa con joblib. El autor no documenta hiperparametros (numero de estimadores, `max_depth`, `min_samples_leaf`), aunque si senala que el artefacto es grande "debido al numero y la profundidad de los arboles", lo que sugiere un bosque profundo y con muchos estimadores.

El conjunto de entrenamiento son 45.584 pedidos con 20 columnas originales, de los cuales se descartan los identificadores (`ID`, `Delivery_person_ID`). Las columnas se agrupan en courier (edad, valoracion, condicion del vehiculo, tipo de vehiculo, entregas multiples), localizacion (cuatro coordenadas y una `distance_km` derivada), tiempo (fecha, hora de pedido y hora de recogida), condiciones (meteorologia, densidad de trafico, festivo), tipo de pedido y objetivo. La ingenieria de caracteristicas incluye el calculo de la distancia entre restaurante y punto de entrega a partir de las cuatro coordenadas, la extraccion de dia de la semana y mes, y la codificacion one-hot de meteorologia (6 categorias), trafico (4), tipo de pedido (4), vehiculo (3), festivo (2) y ciudad (3). No se menciona ningun proceso de ajuste fino, RLHF ni entrenamiento por refuerzo, algo que no aplica a este tipo de modelo.

## Capacidades

- Regresion tabular: predice un valor continuo en minutos a partir de 33 entradas numericas y binarias.
- Modelado de interacciones no lineales entre variables (trafico, meteorologia, distancia, condicion del vehiculo) sin especificarlas manualmente.
- Entrada derivada de geolocalizacion: consume `distance_km`, que el usuario debe calcular previamente a partir de las coordenadas.
- Codificacion explicita de condiciones: meteorologia (Cloudy, Fog, Sandstorms, Stormy, Sunny, Windy), trafico (High, Jam, Low, Medium), tipo de pedido (Buffet, Drinks, Meal, Snack), vehiculo (electric_scooter, motorcycle, scooter).
- Carga directa desde el Hub mediante `hf_hub_download` + `joblib.load`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision ni audio. No tiene modo "thinking". No es un modelo conversacional ni multilingue en el sentido habitual: no procesa lenguaje natural.

## Casos de uso

- Estimacion de ETA en el checkout de una app de pedidos: se construye el vector de 33 caracteristicas con los datos del pedido en curso y se muestra al cliente una estimacion en minutos antes de confirmar; el modelo explica el 83 % de la varianza del tiempo de entrega en el conjunto de test.
- Asignacion y enrutado de repartidores: comparar el ETA predicho para distintos repartidores candidatos (edad, valoracion, condicion y tipo de vehiculo) y elegir el que minimiza el tiempo estimado en funcion del trafico previsto.
- Planificacion de capacidad por franjas horarias: agregar predicciones sobre los pedidos historicos de un dia de la semana y mes concretos para dimensionar turnos de cocina y flota.
- Simulacion de escenarios operativos: ejecutar el modelo con las mismas coordenadas y distancia pero variando `Road_traffic_density_*` y `Weather_conditions_*` para cuantificar el impacto en minutos de un dia de lluvia o de trafico denso.
- Deteccion de entregas anomalas: comparar el tiempo real de una entrega con la prediccion del modelo y marcar desviaciones grandes para revision operativa (repartidor bloqueado, incidencia en restaurante).
- Promesas de entrega en marketing: calibrar el rango de tiempo que se comunica al cliente (por ejemplo, "25-35 minutos") a partir de la distribucion de predicciones para una zona y condicion dadas.
- Analisis de sensibilidad de flota: evaluar si cambiar la composicion de vehiculos (scooter frente a motocicleta frente a electric_scooter) reduce el ETA medio en una ciudad concreta.
- Prototipado docente: ejemplo completo y reproducible de regresion tabular con scikit-learn, util para ensenar ingenieria de caracteristicas, codificacion one-hot y evaluacion con MAE, RMSE y R².

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test reservado:

| Metrica | Valor |
|---|---|
| MAE | 3,12 minutos |
| RMSE | 3,87 minutos |
| R² | 0,833 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (ni con alternativas de gradient boosting como XGBoost o LightGBM, ni con baselines lineales) sobre el mismo conjunto de datos. Tampoco se detalla el tamano del split de test ni el procedimiento de validacion.

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia de un `RandomForestRegressor` se ejecuta en CPU.
- RAM: el artefacto ocupa unos 209 MB en disco y el autor advierte de que la carga con joblib tarda y necesita RAM suficiente; como referencia practica, conviene reservar al menos 1 GB de memoria libre por proceso que cargue el modelo (estimacion, no dato publicado).
- GPU recomendadas: ninguna. Cualquier CPU moderna sirve; no hay soporte ni beneficio documentado de aceleracion por GPU.
- Cabe en cualquier maquina de desarrollo, portatil incluido; tambien en contenedores con poca memoria si se tiene en cuenta el punto anterior.
- Opciones de despliegue: carga directa con `joblib.load` dentro de un servicio Python (FastAPI, Flask), o exportacion a ONNX recomendada por el propio autor para reducir el peso y mejorar el despliegue web. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones; en la practica la latencia depende del numero y profundidad de los arboles, que el autor no documenta.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables con resultados publicados sobre el mismo dataset. La tabla recoge unicamente lo que consta para este modelo; las alternativas funcionales habituales para regresion tabular (XGBoost, LightGBM, CatBoost, regresion lineal regularizada) se listan como categorias, sin datos de rendimiento porque no hay mediciones disponibles para este conjunto de datos.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Food Delivery Time Estimator (este modelo) | no disponible | 33 caracteristicas tabulares | MAE 3,12 min; RMSE 3,87 min; R² 0,833 | MIT | HuggingFace, `itsmesonu47/food-delivery-time-estimator` |
| XGBoost / LightGBM (entrenados sobre el mismo dataset) | no disponible | mismas 33 caracteristicas | no disponible (no se han publicado resultados) | licencias propias de cada libreria | no disponible como modelo preentrenado para esta tarea |
| Regresion lineal como baseline | no disponible | mismas 33 caracteristicas | no disponible | no aplica | no disponible |

## Limitaciones y advertencias

- El propio autor la califica como herramienta para un proyecto de aprendizaje; no esta pensada para garantias comerciales de tiempos de entrega ni para usos criticos para la seguridad.
- No usa trafico en tiempo real ni el tiempo de preparacion del restaurante, dos de los factores que mas afectan al ETA real.
- Cobertura geografica y de condiciones limitada al dataset de origen: puede no generalizar a otras regiones, ciudades o patrones de reparto distintos.
- Las filas con coordenadas invalidas y valoraciones poco fiables se eliminaron o imputaron, lo que introduce sesgo de seleccion y reduce la representatividad frente a pedidos reales con datos sucios.
- La columna `City` incluye la categoria mal escrita `Metropolitian` en el dataset original; los nombres de las 33 caracteristicas deben coincidir exactamente, incluidos estos errores.
- El orden de las columnas es estricto; un reordenamiento o una columna one-hot ausente (sin rellenar con 0) produce predicciones incorrectas o errores.
- No admite categorias no vistas en el entrenamiento: cualquier valor nuevo de meteorologia, vehiculo o ciudad debe mapearse a una de las categorias existentes o quedara fuera del vector.
- Riesgo de alucinacion no aplica (no genera texto), pero si hay riesgo de extrapolacion silenciosa: el bosque devolvera una prediccion plausible incluso para entradas fuera del dominio de entrenamiento, sin avisar.
- El artefacto de 209 MB es pesado para servir en el navegador o en funciones serverless; el autor recomienda un modelo mas pequeno o una exportacion a ONNX.
- No se documentan analisis de sesgo por zona, repartidor o tipo de vehiculo; dado que la edad y la valoracion del repartidor son caracteristicas de entrada, conviene auditar posibles efectos discriminatorios antes de un uso real.
- Licencia MIT: permite uso comercial y modificacion con obligacion de conservar el aviso de copyright y la licencia; no hay garantia implicita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsmesonu47/food-delivery-time-estimator
- Perfil del autor: https://huggingface.co/itsmesonu47
- Imagen de evaluacion incluida en la model card: https://cdn-uploads.huggingface.co/production/uploads/689e0a595140d6d8303f3331/e2nytNR1HiB2ieqyzAles.png
- Dataset de origen: no disponible (la model card describe las 45.584 filas y 20 columnas, pero no enlaza la fuente)
- Paper, blog o repositorio adicional: no disponible
