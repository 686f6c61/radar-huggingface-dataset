# iaac-maai/day3-group2-house-typologies

## Resumen

`iaac-maai/day3-group2-house-typologies` es un pipeline de scikit-learn que asigna una vivienda unifamiliar a una de cuatro tipologias fisicas a partir de ocho caracteristicas del edificio y de su parcela. No es un modelo de lenguaje ni una red neuronal: es un `KMeans` con `k=4` precedido de una transformacion logaritmica de las areas y un `StandardScaler`, empaquetado como `Pipeline` completo en un fichero `model.joblib`. Lo desarrolla el Grupo 2 del curso AI Methods I del master MaAI del IAAC (Instituto de Arquitectura Avanzada de Cataluna) para el curso 2026/27.

El modelo resuelve un problema de tipificacion del parque residencial: dado un conjunto de viviendas descritas por superficie habitable, superficie de parcela, numero de dormitorios y banos, numero de plantas, grado de construccion, antiguedad y proporcion de sotano, devuelve la etiqueta de cluster mas cercana. El objetivo declarado es que un departamento de vivienda o planificacion pueda disenar programas diferenciados (rehabilitacion, envejecimiento en el lugar, densificacion suave) segun el tipo de casa.

Su relevancia es acotada y de caracter docente: se entrena sobre 20.555 casas vendidas en el condado de King (Washington, EE. UU.) entre 2014 y 2015, con cero descargas y cero likes en el momento de la consulta, y no publica benchmarks de rendimiento ni metricas de calidad del clustering. Debe tratarse como una herramienta de analisis exploratorio reproducible, no como un componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: `ColumnTransformer` (log10 de `sqft_living` y `sqft_lot`) + `StandardScaler` sobre 8 features + `KMeans` |
| Parametros totales | No aplica (modelo no parametrico basado en centroides); 4 centroides en 8 dimensiones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de una fila por vivienda) |
| Tipos de cuantizacion | No disponible (no aplica a scikit-learn; serializacion via joblib) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (pipeline completo serializado con joblib) |

## Arquitectura y entrenamiento

El modelo es un `KMeans` de scikit-learn con `n_clusters=4`, `n_init=10` y `random_state=42`; el resto de hiperparametros quedan en los valores por defecto de la libreria. El preprocesado aplica `log10` a `sqft_living` y `sqft_lot` mediante un `FunctionTransformer` dentro de un `ColumnTransformer`, y despues un `StandardScaler` sobre las ocho variables de entrada. La asignacion de nuevas viviendas se hace con `.predict()`, que asigna cada fila al centroide mas cercano; no hay clasificador posterior.

El entrenamiento usa 20.555 viviendas del dataset publico House Sales in King County (Kaggle, licencia CC0) tras un proceso de limpieza que elimino valores imposibles o extremos (precios, areas, numero de dormitorios) y descarto las columnas `waterfront` y `view`. Los rangos resultantes son: hasta 4.970 sqft de superficie habitable, entre 2 y 6 dormitorios, entre 4 y 13 de grado de construccion y entre 1 y 3,5 plantas. Las versiones de libreria declaradas son scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3 y joblib 1.6.0.

## Capacidades

- Asignacion de una vivienda unifamiliar a una de cuatro tipologias fisicas (clusters 0 a 3) mediante `model.predict(X)`.
- Procesamiento de un `pandas.DataFrame` con exactamente ocho columnas en unidades originales: `sqft_living`, `sqft_lot`, `bedrooms`, `bathrooms`, `floors`, `grade`, `house_age` y `basement_share`.
- Preprocesado interno de las areas (log10) y escalado de todas las variables, de modo que el usuario no necesita transformar los datos.
- Interpretacion cualitativa de los grupos: Large Modern Family Homes (23,0 %), Postwar Single-Storey Homes (31,5 %), Contemporary Compact Homes (19,2 %) y Mid-Century Basement Homes (26,4 %).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo tabular de clustering.

## Casos de uso

- Segmentacion de parque residencial para planificacion: clasificar un censo de viviendas unifamiliares en los cuatro tipos y estimar cuantas alcanzaria cada programa publico (rehabilitacion, ayudas a la eficiencia energetica), ya que el modelo devuelve una etiqueta interpretable por vivienda.
- Diseno de programas de envejecimiento en el lugar: identificar el cluster 1 (Postwar Single-Storey Homes, 31,5 % del stock, 1.320 sqft y una planta en el 79 % de los casos) como poblacion objetivo de actuaciones de accesibilidad, por su tipologia de una sola planta.
- Analisis de densificacion suave: localizar el cluster 2 (Contemporary Compact Homes, parcela mediana de 4.084 sqft y dos plantas) como el tipo con mayor potencial de ampliacion o subdivision de parcela.
- Estudios comparativos de precio y localizacion entre tipologias: el equipo verifico con variables no usadas en el entrenamiento que la mediana de precio va de unos 350.000 USD (cluster 1) a 695.000 USD (cluster 0), y que los clusters 1 y 3 estan a unos 15 km del centro de Seattle frente a 21 km del cluster 0.
- Investigacion academica y docencia: servir de ejemplo reproducible de pipeline de clustering con preprocesado y serializacion completos, citando las versiones exactas de las librerias.
- Analisis de condicion del parque: cruzar la etiqueta de cluster con la valoracion de condicion (aproximadamente la mitad de los clusters 1 y 3 tienen condicion 4 o 5, frente al 8 % del cluster 2) para priorizar inspecciones.
- Filtrado y triaje en flujos de datos inmobiliarios: asignar tipologia a listados nuevos dentro de los rangos de entrenamiento antes de un analisis manual mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad del clustering (inercia, silhouette, Davies-Bouldin) ni comparaciones cuantitativas con otros metodos.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y el repositorio ocupa 0,0 GB.
- GPU: no necesaria ni soportada por el pipeline.
- Memoria RAM: suficiente con unos pocos cientos de MB para cargar scikit-learn, pandas, numpy y el `model.joblib`.
- Despliegue: ejecucion directa en Python con `joblib.load()` y las versiones de libreria declaradas (scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3, joblib 1.6.0).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser `KMeans` con 4 centroides y 8 dimensiones, la inferencia es de coste despreciable por fila.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iaac-maai/day3-group2-house-typologies` | KMeans (k=4) sobre 8 features tabulares | 4 centroides | No aplica | MIT | Hugging Face, 0 descargas |
| `iaac-maai/day3-group2-king-county-house-typologies` (dataset) | Dataset etiquetado con los clusters | No aplica | No aplica | CC BY 4.0 | Hugging Face |
| Modelos de regresion de precios sobre King County | Aprendizaje supervisado (regresion) | No disponible | No aplica | Variable | Multiples en Kaggle/HuggingFace |

No se dispone de comparaciones cuantitativas con alternativas de clustering sobre el mismo dataset en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito geografico y temporal restringido: las tipologias reflejan la historia constructiva del condado de King entre 2014 y 2015; no son extrapolables a otras regiones ni a otros periodos.
- Solo viviendas unifamiliares: el dataset no contiene apartamentos, condominios ni edificios no residenciales.
- Fuera de rango: viviendas con mas de 4.970 sqft de superficie habitable o mas de 6 dormitorios fueron eliminadas en la limpieza y no estan representadas.
- No predice precio, comportamiento energetico, seguridad estructural ni valor: solo indica el grupo de casas fisicamente similares mas cercano.
- No debe usarse para decisiones sobre hogares individuales: los grupos describen edificios, no personas.
- Riesgo de asignacion espuria fuera de la distribucion de entrenamiento, ya que `KMeans` siempre asigna el centroide mas cercano sin umbral de distancia ni deteccion de anomalias.
- Sesgos derivados del dataset original: refleja el mercado de compraventa del condado de King, con la composicion y los sesgos socioeconomicos de ese mercado.
- Dependencia estricta de versiones: el `joblib` se serializo con scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3 y joblib 1.6.0; cargarlo con otras versiones puede producir avisos o errores.
- Licencia MIT permisiva para uso comercial, pero el dataset original es CC0 y la version clusterizada es CC BY 4.0, lo que exige atribucion al reutilizar los datos etiquetados.
- Sin metricas de calidad publicadas ni validacion externa mas alla de la comprobacion cualitativa con precio, distancia y condicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day3-group2-house-typologies
- Dataset clusterizado: https://huggingface.co/datasets/iaac-maai/day3-group2-king-county-house-typologies
- Repositorio GitHub del analisis completo: https://github.com/iaac-maai/Group2_Day3_Assignment
- Dataset original en Kaggle: https://www.kaggle.com/datasets/harlfoxem/housesalesprediction
- Perfil de clusters (imagen): https://huggingface.co/datasets/iaac-maai/day3-group2-king-county-house-typologies/resolve/main/09_cluster_profiles.png
