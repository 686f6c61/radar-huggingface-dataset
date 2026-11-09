# iaac-maai/day3-group7-house-typologies

## Resumen

`iaac-maai/day3-group7-house-typologies` es un pipeline de scikit-learn que asigna viviendas unifamiliares del condado de King (Washington, EE. UU.) a una de cuatro tipologias constructivas: bungalows de posguerra, casas de mediados de siglo con sotano, viviendas nuevas compactas de dos plantas y grandes casas suburbanas premium. El modelo utiliza exclusivamente variables fisicas del edificio (superficie habitable, superficie de parcela, plantas, dormitorios, banos, presencia de sotano, grado de construccion, estado de conservacion y antiguedad), sin emplear precio ni localizacion. Lo desarrollaron Ugo, Alvaro y Sneha (Team 7) como trabajo del curso AI Methods I del Master in Advanced Architecture (MaAI) del IAAC en el curso 2026/27.

Tecnicamente no es un modelo de lenguaje ni una red neuronal: es un agrupamiento no supervisado con K-Means (k = 4, `n_init=10`, `random_state=42`) precedido de un `StandardScaler`, ajustado sobre 21.418 viviendas vendidas en 2014-2015. Su relevancia es acotada pero concreta: ofrece una taxonomia reproducible del parque residencial unifamiliar para tareas de analisis urbano, priorizacion de rehabilitacion energetica o docencia, con un artefacto serializado (`model.joblib`) de tamano despreciable y licencia MIT.

No debe confundirse con un modelo generativo ni con un tasador: el precio se mantuvo fuera del entrenamiento y solo se uso a posteriori para interpretar los clusters. El ambito geografico y temporal esta explicitamente restringido al condado de King en ese periodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` + `KMeans` (k = 4, `n_init=10`, `random_state=42`) |
| Parametros totales | no disponible (modelo no parametrico en el sentido de red neuronal; 4 centroides en 9 dimensiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (serializacion `joblib`; no se documentan variantes) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (pipeline completo serializado con joblib) |
| Entradas | 9 columnas: `log_sqft_living`, `log_sqft_lot`, `floors`, `bedrooms`, `bathrooms`, `has_basement`, `grade`, `condition`, `age` |
| Salida | Etiqueta de cluster 0-3 |
| Version de librerias | Python 3.11.12, scikit-learn 1.9.1, pandas 3.0.6, numpy 2.4.6, joblib 1.6.0 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es un agrupamiento particional clasico. El pipeline aplica una estandarizacion z-score a las nueve variables de entrada y ejecuta K-Means con cuatro centroides e inicializacion multiple (`n_init=10`). Antes del pipeline, el usuario debe calcular el logaritmo en base 10 de la superficie habitable y de la parcela, ya que ambas distribuciones presentan una fuerte asimetria a la derecha. No hay etapa de aprendizaje supervisado, RLHF ni ajuste fino: los centroides se obtienen minimizando la inercia intra-cluster sobre el conjunto de entrenamiento.

Los datos proceden del dataset publico "House Sales in King County, USA" (licencia CC0 1.0), con 21.418 viviendas tras eliminar 18 filas con valores imposibles y conservar solo la ultima venta de las 177 casas vendidas dos veces. Se derivaron tres variables: `age`, `has_basement` y los logaritmos de superficie. El precio, la localizacion, la vista al agua, el waterfront y la reforma se reservaron para interpretar los clusters. La eleccion de k se exploro entre 2 y 10; el coeficiente de silueta resulto bajo y plano (0.21-0.26), lo que indica solapamiento entre grupos. Como validacion cruzada de metodo se comparo con clustering jerarquico Ward sobre una muestra de 5.000 viviendas con k = 4, obteniendo un ARI de 0.63: tres grupos coinciden casi uno a uno y Ward divide de forma distinta el grupo de casas nuevas grandes.

## Capacidades

- Asignacion de una vivienda unifamiliar a una de cuatro tipologias constructivas mediante `model.predict(X)`.
- Capacidad de asignacion de casos nuevos gracias a que K-Means expone `predict()` y asigna al centroide mas cercano (no requiere un clasificador adicional).
- Descripcion cuantitativa de un parque residencial por proporciones de tipologia (por ejemplo, porcentaje de bungalows de posguerra en un barrio).
- Interpretabilidad directa: cada cluster tiene medianas documentadas de superficie, plantas, banos, grado, antiguedad y presencia de sotano.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, vision, audio ni capacidades multilingues.
- No incorpora etiqueta de ruido: toda vivienda recibe un cluster.

## Casos de uso

- Priorizacion de rehabilitacion energetica: un ayuntamiento puede calcular la proporcion de bungalows de posguerra (cluster 1, mediana de 62 anos) en un barrio para decidir donde iniciar un programa de mejora de envolvente, ya que ese tipo concentra las viviendas mas antiguas y pequenas.
- Analisis de diversidad tipologica urbana: un planificador puede caracterizar un distrito por la mezcla de los cuatro clusters y compararlo con otro, usando las medianas documentadas para justificar la clasificacion.
- Estudios de mercado inmobiliario descriptivos: un analista puede segmentar la oferta de vivienda unifamiliar por tipologia fisica antes de cruzar con precios (que el modelo no usa) para estudiar diferencias de valoracion entre tipos.
- Docencia en metodos de IA para arquitectura: el pipeline sirve como ejemplo completo de preprocesado, escalado y clustering con validacion mediante ARI y silueta, reproducible con las versiones de libreria documentadas.
- Filtrado previo en catalogos de edificios: un arquitecto puede etiquetar rapidamente un inventario de viviendas con las nueve variables disponibles y agrupar las que comparten perfil constructivo para inspecciones de campo.
- Analisis de evolucion del stock construido: combinando `age` con los clusters se puede estimar que proporcion del parque corresponde a construccion reciente compacta (cluster 3, mediana de 11 anos) frente a construccion de mediados de siglo (cluster 0).
- Prototipado de sistemas de recomendacion de reformas: dado un perfil de vivienda, el cluster orienta que intervenciones tipicas aplicar (por ejemplo, sotano en cluster 0, ampliacion en cluster 1).

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Coeficiente de silueta | 0.21-0.26 | Exploracion de k = 2-10; valor bajo y plano |
| ARI frente a Ward (k = 4) | 0.63 | Muestra aleatoria de 5.000 viviendas |
| Tamano del conjunto de entrenamiento | 21.418 viviendas | Ventas 2014-2015 en King County |
| Reparto de clusters | 28.5 % / 29.8 % / 19.0 % / 22.7 % | Clusters 0, 1, 2 y 3 respectivamente |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no requiere GPU; el pipeline se ejecuta en CPU.
- Memoria RAM: inferior a 1 GB para cargar el `model.joblib` y predecir lotes de miles de viviendas.
- GPU recomendadas: ninguna; no aplica.
- Compatibilidad con GPU de consumo: irrelevante, no hay aceleracion GPU en el flujo documentado.
- Opciones de despliegue: script Python con `joblib.load` y scikit-learn 1.9.1; integrable en un servicio web (Flask, FastAPI) o en un notebook.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del algoritmo (producto punto contra 4 centroides en 9 dimensiones) la inferencia es del orden de microsegundos por fila en CPU.
- Dependencias fijadas: Python 3.11.12, scikit-learn 1.9.1, pandas 3.0.6, numpy 2.4.6, joblib 1.6.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iaac-maai/day3-group7-house-typologies` | K-Means tabular (k = 4) | 4 centroides en 9 dimensiones | no aplica | MIT | Hugging Face |
| Clustering jerarquico Ward (misma assignment) | Aglomerativo, k = 4 | no disponible | no aplica | no disponible | Referencia metodologica del propio autor (ARI 0.63) |
| K-Means generico sobre el dataset King County | K-Means sin pipeline documentado | no disponible | no aplica | CC0 1.0 (dataset) | Dataset publico en Kaggle |

No se dispone de comparativas con modelos de la misma categoria publicadas de forma independiente; la unica comparacion documentada es la del propio autor frente a Ward.

## Limitaciones y advertencias

- Ambito geografico restringido: solo viviendas unifamiliares del condado de King (Seattle, Bellevue, Redmond y suburbios) vendidas entre mayo de 2014 y mayo de 2015.
- Fuera de alcance: pisos, adosados, bloques residenciales, edificios comerciales o de uso mixto; el modelo solo vio ventas de vivienda unifamiliar.
- No es un tasador: el precio no fue una entrada y los clusters no son bandas de precio; no debe usarse para valorar inmuebles ni para decisiones sobre propietarios individuales.
- Riesgo de extrapolacion: entradas fuera de los rangos de entrenamiento (superficie habitable 370-13,540 sqft, parcela 520-1,651,359 sqft, plantas 1-3.5, dormitorios 1-10, banos 0.5-8, grado 3-13, condicion 1-5, edad -1-115 anos) reciben igualmente un cluster, pero la asignacion carece de significado.
- Calidad de agrupamiento limitada: silueta de 0.21-0.26, lo que indica solapamiento entre clusters y fronteras poco nitidas.
- Dependencia de versiones: el `joblib` esta serializado con scikit-learn 1.9.1, pandas 3.0.6 y numpy 2.4.6; cargarlo con versiones distintas puede producir avisos o errores.
- Preprocesado manual obligatorio: el usuario debe calcular `log10(sqft_living)` y `log10(sqft_lot)` antes de llamar a `predict`; omitirlo invalida la asignacion.
- Sin etiqueta de ruido: los valores atipicos se fuerzan a un cluster.
- Licencia MIT permite uso comercial, pero el dataset subyacente es CC0 1.0 y el modelo no incorpora garantias de exactitud.
- Sesgos potenciales derivados de la muestra: sobrerrepresentacion de viviendas vendidas en 2014-2015 y de determinadas areas suburbanas de King County.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day3-group7-house-typologies
- Dataset agrupado: https://huggingface.co/datasets/iaac-maai/day3-group7-king-county-house-typologies
- Repositorio GitHub del analisis completo: https://github.com/iaac-maai/group7_day3_assignment
- Dataset original en Kaggle: https://www.kaggle.com/datasets/harlfoxem/housesalesprediction
