# iaac-maai/day3-team6-building-types

## Resumen

`iaac-maai/day3-team6-building-types` no es un modelo de lenguaje ni una red neuronal: es un pipeline de scikit-learn que realiza clustering no supervisado mediante K-Means para asignar edificios existentes de Seattle a una de cuatro tipologias fisicas. Lo desarrollaron Chloe Hraibeh, Jeff El Khoury y Luca Obejdeanu como trabajo del curso AI Methods I del Master in Advanced Architecture (IAAC MaAI 2026/27), y se publica bajo licencia MIT.

El modelo resuelve un problema de politica urbana concreto: clasificar el parque construido de gran tamano para disenar paquetes de rehabilitacion energetica diferenciados por tipologia. Utiliza unicamente cuatro variables de forma y antiguedad (numero de plantas, superficie de planta, ano de construccion y proporcion de aparcamiento), lo que permite tipificar un edificio sin depender de datos de consumo energetico que a menudo no estan disponibles o son costosos de obtener.

Se entreno sobre 3.211 edificios del informe de benchmarking energetico de Seattle de 2016, con `n_clusters=4`, `n_init=10` y `random_state=42`. El artefacto distribuido es un unico fichero `model.joblib` que contiene el pipeline completo (imputacion por mediana, log10, `StandardScaler` y K-Means), por lo que la inferencia se reduce a llamar a `.predict()` sobre un DataFrame con las cuatro columnas esperadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: imputacion por mediana + log10 + StandardScaler + KMeans |
| Parametros totales | no disponible (no es una red neuronal; el modelo almacena centroides y estadisticos de escalado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular de clasificacion puntual, una fila por inferencia) |
| Tipos de cuantizacion | no aplica (artefacto joblib con floats de precision nativa) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (pipeline completo serializado con joblib) |
| Version de libreria | scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3, scipy 1.18.1, joblib 1.6.0, Python 3.12 |
| Hiperparametros clave | `n_clusters=4`, `n_init=10`, `random_state=42` |
| Variables de entrada | `number_of_floors`, `gfa_per_floor_m2`, `year_built`, `parking_share` |
| Salida | Etiqueta de cluster entera de 0 a 3 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es un pipeline determinista de scikit-learn sin componente neuronal. La fase de preprocesamiento imputa valores ausentes con la mediana del conjunto de entrenamiento, aplica logaritmo en base 10 a `number_of_floors` y `gfa_per_floor_m2` (para corregir la asimetria de las distribuciones de superficie y altura), y estandariza las cuatro columnas con `StandardScaler`. Sobre ese espacio transformado se ajusta un K-Means con cuatro clusters, inicializacion multiple (`n_init=10`) y semilla fija (`random_state=42`), lo que garantiza reproducibilidad del ajuste.

El conjunto de entrenamiento son 3.211 edificios del dataset publico 2016 Building Energy Benchmarking de la ciudad de Seattle (dominio publico), restringido a edificios no residenciales y multifamiliares de mas de 20.000 pies cuadrados (unos 1.860 m2). La limpieza previa, documentada en el repositorio del Day 1 del equipo, elimino 165 edificios marcados como no conformes por la ciudad, corrigio la ortografia de barrios y tipologias, sustituyo valores imposibles (0 plantas, 0 edificios, una iglesia de 99 plantas) por NaN y normalizo unidades a m2 y kWh.

La seleccion de `k=4` se justifica con tres criterios convergentes: el maximo de silueta (0,375), el codo de la curva de inercia y el mayor salto del dendrograma Ward. Se compararon tres algoritmos: K-Means (silueta 0,375, ARI 1,00 frente a si mismo), jerarquico Ward (silueta 0,336, ARI 0,65) y DBSCAN con `eps=0.6` y `min_samples=8` (silueta 0,311, ARI 0,36, 278 puntos etiquetados como ruido). La conclusion metodologica del equipo es que los datos forman una nube continua sin separaciones de densidad fuertes, de ahi la silueta moderada.

## Capacidades

- Asignacion de tipologia fisica: dado un edificio con sus cuatro variables de forma y antiguedad, devuelve una etiqueta de cluster de 0 a 3 mediante `.predict()`.
- Clasificacion determinista y reproducible: la semilla fija y el pipeline serializado garantizan resultados identicos entre ejecuciones.
- Manejo de valores ausentes: imputacion automatica por mediana de entrenamiento para cualquier NaN en las cuatro columnas.
- Interpretabilidad post-hoc: los clusters se validaron con columnas que el modelo nunca vio (uso, barrio, consumo energetico, emisiones, cuota de gas), lo que permite describir cada tipologia con evidencia externa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un clasificador tabular de una sola pasada.
- No dispone de modo de razonamiento ni de generacion de texto.

## Casos de uso

- Priorizacion de un programa municipal de rehabilitacion: el equipo de ciudad asigna cada edificio a una de las cuatro tipologias y redacta un paquete de medidas por tipo; el cluster 1 (naves de una planta) concentra el 33% de las emisiones con el 22% de la superficie, lo que orienta la decision de por donde empezar.
- Segmentacion previa a auditorias energeticas: al tipificar por forma y antiguedad sin usar datos de consumo, se puede estratificar la muestra de edificios a auditar antes de disponer de contadores o facturas.
- Enriquecimiento de un inventario municipal existente: aplicar `.predict()` sobre el registro de licencias de obra o el catastro para anadir una columna de tipologia fisica reutilizable en dashboards y analisis GIS.
- Analisis de equidad territorial: cruzar las tipologias con barrios (el cluster 1 se concentra en Greater Duwamish, el 2 en Downtown y Lake Union) para detectar donde se acumulan las tipologias con mayor intensidad de emisiones.
- Docencia y prototipado de pipelines de ML: sirve como ejemplo completo y reproducible de preprocesamiento, seleccion de `k`, comparacion de algoritmos de clustering y validacion con variables retenidas.
- Comunicacion con propietarios: traducir la tipologia asignada a recomendaciones genericas de retrofit (por ejemplo, envolvente en el cluster 3, que tiene la mayor emision por m2 con 12,4 kg CO2e/m2), sin emitir juicios sobre edificios concretos.
- Filtro de elegibilidad para subvenciones: usar la etiqueta de cluster como criterio de segmentacion en convocatorias dirigidas a tipologias especificas, siempre con revision humana.

## Benchmarks y rendimiento

| Algoritmo | Clusters | Ruido | Silueta | ARI frente a K-Means |
|---|---|---|---|---|
| K-Means (final) | 4 | 0 | 0,375 | 1,00 |
| Jerarquico (Ward) | 4 | 0 | 0,336 | 0,65 |
| DBSCAN (`eps=0.6`, `min_samples=8`) | 4 | 278 | 0,311 | 0,36 |

Varianza explicada por PCA sobre las cuatro columnas escaladas: 37%, 30%, 19% y 13%. Los tipos explican solo el 6% de las diferencias en logaritmo del consumo energetico, dato declarado por los autores en la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no requiere GPU; el pipeline se ejecuta en CPU.
- CPU: cualquier procesador moderno es suficiente; el coste de `.predict()` es despreciable frente a la carga del DataFrame.
- Memoria RAM: unos pocos MB para el artefacto `model.joblib` y el DataFrame de entrada.
- GPU recomendadas: no aplica.
- Cabe en cualquier portatil consumer sin restricciones.
- Opciones de despliegue: script Python con `joblib.load()`, API ligera con FastAPI o Flask, job por lotes en pandas, o integracion en un notebook de analisis. No procede vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados; por la naturaleza del modelo se espera un throughput de miles de filas por segundo en CPU, aunque no hay medicion oficial en la informacion disponible.
- Dependencias criticas: fijar scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3, scipy 1.18.1 y joblib 1.6.0 para evitar incompatibilidades al deserializar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iaac-maai/day3-team6-building-types` | K-Means sobre 4 variables tabulares | no aplica | no aplica | MIT | Hugging Face |
| Jerarquico Ward (mismo dataset) | Clustering aglomerativo | no aplica | no aplica | no disponible | Solo en el repositorio del equipo |
| DBSCAN (mismo dataset) | Clustering por densidad | no aplica | no aplica | no disponible | Solo en el repositorio del equipo |

No se dispone de modelos publicos comparables de tipificacion de edificios con la misma formulacion y dataset en la informacion proporcionada.

## Limitaciones y advertencias

- Los tipos explican solo el 6% de la variacion en el logaritmo del consumo energetico: no sirven para predecir el consumo de un edificio concreto.
- La silueta de 0,375 es modesta; los clusters se solapan y las fronteras entre tipologias no son nitidas.
- Sesgo geografico y temporal: entrenado solo con Seattle y solo con el ano 2016; no es extrapolable a otras ciudades ni a otros anos sin reajuste.
- Sesgo de tamano: el dataset solo incluye edificios de mas de 20.000 pies cuadrados (unos 1.860 m2); los edificios pequenos quedan fuera del dominio.
- Asignacion forzosa: no existe etiqueta de ruido, por lo que edificios atipicos (centros de datos, torres muy altas) reciben igualmente uno de los cuatro tipos aunque no se parezcan a ninguno.
- Uso previsto limitado: los autores prohiben explicitamente usar el modelo para clasificar o juzgar propietarios o edificios concretos, y lo describen como modelo docente.
- Riesgo de mala aplicacion: usar la etiqueta como criterio automatico de subvencion sin revision humana puede penalizar tipologias mal representadas.
- Dependencia de versiones: la deserializacion con versiones distintas de scikit-learn o pandas puede fallar o producir resultados distintos.
- Restricciones de licencia: MIT permite uso comercial, pero el dataset original es de dominio publico de la ciudad de Seattle y conviene citarlo.
- No hay validacion externa fuera del conjunto de Seattle 2016; la estabilidad del clustering solo se reporta internamente.

## Enlaces

- Hugging Face: https://huggingface.co/iaac-maai/day3-team6-building-types
- Repositorio GitHub con el analisis completo: https://github.com/iaac-maai/6-day3-assignment
- Repositorio del Day 1 con la limpieza de datos: https://github.com/iaac-maai/6-day1-assignment
- Dataset original (Kaggle, City of Seattle): https://www.kaggle.com/datasets/city-of-seattle/sea-building-energy-benchmarking
