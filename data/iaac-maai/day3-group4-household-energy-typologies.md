# iaac-maai/day3-group4-household-energy-typologies

## Resumen

Este "modelo" es en realidad un pipeline de scikit-learn para clustering no supervisado, publicado por el grupo 4 del curso AI Methods I del máster IAAC MaAI (2026/27). No se trata de un modelo de lenguaje ni de una red neuronal: es un `StandardScaler` seguido de un `KMeans` con k = 4, serializado en un fichero `model.joblib`. Su función es asignar un hogar con calefacción de gas en Inglaterra o Gales a uno de cuatro grupos de comportamiento energético, a partir de su consumo reciente de gas y electricidad y de cómo ha evolucionado ese consumo entre 2005 y 2024.

El modelo se entrenó sobre 29.390 hogares del conjunto anonimizado UK NEED (DESNZ, Open Government Licence v3.0), filtrados a partir de una muestra de 40.445 viviendas con calefacción de gas y lecturas válidas en las tres ventanas temporales consideradas (2005-08, 2019-21 y 2022-24). La entrada son cinco variables derivadas (dos logaritmos de consumo reciente y tres ratios logarítmicos de cambio), y la salida es un entero de 0 a 3 con una etiqueta descriptiva asociada.

Es relevante como ejemplo docente de un flujo completo de aprendizaje no supervisado aplicado a datos energéticos reales, con evaluación explícita de la ausencia de estructura natural en los datos (silhouette ≤ 0,22 para todos los valores de k) y de la estabilidad del agrupamiento (ARI 0,98 entre semillas). No es un modelo generativo ni un sistema de IA de propósito general; su utilidad está acotada a la segmentación de parques de vivienda para programas de eficiencia energética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` + `KMeans` (k = 4, n_init = 10, random_state = 42) |
| Parametros totales | No aplica (modelo de clustering; 4 centroides en un espacio de 5 dimensiones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 5 columnas por instancia) |
| Tipos de cuantizacion | No aplica (serializacion `joblib`; no hay pesos en coma flotante de red neuronal) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT (modelo); datos bajo Open Government Licence v3.0 (UK DESNZ, NEED) |
| Formato de pesos | `model.joblib` (pipeline scikit-learn completo serializado con pickle) |
| Libreria | scikit-learn 1.9.1, pandas 3.1.0, numpy 2.5.4, Python 3.14 |
| Tamano del repo | 0,0 GB |
| Tarea | Clustering no supervisado |
| Numero de clusters | 4 |
| Variables de entrada | 5 (`log_gas_recent`, `log_elec_recent`, `gas_change_long`, `gas_change_crisis`, `elec_change_long`) |
| Salida | Entero 0-3 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas: un `StandardScaler` que estandariza las cinco variables de entrada y un `KMeans` con cuatro centroides. Las transformaciones logarítmicas (`log10` para los consumos recientes, `log2` para los ratios de cambio) se aplican fuera del pipeline, antes de la entrada al modelo. El asignador es el propio `KMeans.predict`, sin necesidad de un clasificador adicional.

El entrenamiento se realizó sobre 29.390 hogares con calefacción de gas del dataset UK NEED, con lecturas válidas (marcadas como `V`) en las tres ventanas temporales. El equipo comparó PCA, t-SNE y UMAP para explorar la estructura de los datos, y K-Means (k de 2 a 10), clustering jerárquico de Ward y DBSCAN para el agrupamiento. La elección de k = 4 se justificó por interpretabilidad y por la caída del índice Davies-Bouldin (de 1,62 a 1,50), no por la existencia de clusters naturales: el silhouette es ≤ 0,22 para todos los valores de k, el dendrograma no muestra fusiones dominantes y DBSCAN encuentra un único cluster denso más un 7 % de ruido. La estabilidad es alta: ARI de 0,98 entre 10 semillas y ≥ 0,94 entre 10 submuestras del 80 %. La concordancia con Ward (k = 4) es baja (ARI 0,27), lo que confirma que la partición es una convención interpretativa más que una estructura latente fuerte.

## Capacidades

- Asignación de un hogar a uno de cuatro grupos de comportamiento energético mediante `.predict()` sobre un `pandas.DataFrame` con las cinco columnas especificadas.
- Segmentación de parques de vivienda para priorizar intervenciones de eficiencia energética (aislamiento, sustitución de calderas).
- Identificación de hogares con reducciones profundas de consumo en el periodo de crisis (cluster 1), útil como señal preliminar de pobreza energética.
- Distinción entre hogares de alto consumo con electricidad al alza (cluster 0) y hogares de alto consumo de gas con reducción lenta (cluster 3).
- Detección de hogares que ya redujeron su consumo de gas antes de la crisis y están mayoritariamente aislados (cluster 2).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es un modelo tabular de clustering.

## Casos de uso

- Priorización de programas de aislamiento: un ayuntamiento puede pasar los datos de consumo de su parque de viviendas por el pipeline y usar el cluster 3 ("high gas, slow reducers", 36 % de los hogares) como objetivo inicial de ofertas de aislamiento, ya que concentra el mayor consumo de gas con la menor proporción de certificados EPC A-C.
- Detección preliminar de pobreza energética: el cluster 1 ("low users, deep crisis cuts") agrupa hogares con recortes del 40 % en gas durante 2022 y la mayor concentración en zonas desfavorecidas; puede servir como filtro para derivar casos a revisión social, siempre con verificación humana.
- Segmentación de campañas de comunicación: los cuatro grupos permiten adaptar el mensaje (por ejemplo, ahorro económico para el cluster 0, protección frente a la infrafacturación para el cluster 1) en campañas de eficiencia energética.
- Evaluación de la evolución de una cartera de vivienda: aplicar el modelo a los mismos hogares en distintos momentos permite observar transiciones entre grupos y dimensionar el impacto de políticas pasadas.
- Investigación académica y docencia: el pipeline sirve como referencia reproducible de un flujo de clustering con evaluación de estabilidad y comparación de algoritmos, reutilizable en cursos de ciencia de datos aplicada.
- Análisis de políticas públicas a escala local: cruzar la asignación de clusters con datos de certificados EPC o de renta permite estudiar la relación entre tipología de consumo y características del parque residencial.
- Filtro previo en modelos predictivos: la etiqueta de cluster puede usarse como variable categórica en modelos posteriores de predicción de consumo o de elegibilidad para subvenciones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Silhouette (k = 4) | 0,18 |
| Silhouette maxima (cualquier k entre 2 y 10) | ≤ 0,22 |
| Davies-Bouldin (k = 4) | 1,50 (frente a 1,62 en la alternativa previa) |
| Estabilidad entre 10 semillas (ARI) | 0,98 |
| Estabilidad entre 10 submuestras del 80 % (ARI) | ≥ 0,94 |
| Concordancia con Ward k = 4 (ARI) | 0,27 |
| Ruido detectado por DBSCAN | 7 % |
| Tamano del cluster minoritario | 17 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y su huella en memoria es del orden de kilobytes (cuatro centroides en cinco dimensiones más los parámetros del escalador).
- GPU: no necesaria. Cualquier CPU moderna ejecuta la inferencia en microsegundos por instancia.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos sin GPU.
- Despliegue: carga directa con `joblib.load` en Python; también puede servirse mediante FastAPI, Flask o un notebook. No requiere vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del algoritmo (distancia a cuatro centroides) se espera un coste despreciable frente al de la carga del fichero y la preparación del `DataFrame`.
- Dependencias: scikit-learn 1.9.1, pandas 3.1.0, numpy 2.5.4 y Python 3.14, según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iaac-maai/day3-group4-household-energy-typologies | KMeans (k = 4) sobre 5 variables | No aplica | No aplica | MIT | Hugging Face, joblib |
| Clustering jerarquico de Ward (evaluado en el mismo trabajo) | Aglomerativo, k = 4 | No aplica | No aplica | No disponible | Solo como comparación interna (ARI 0,27 con KMeans) |
| DBSCAN (evaluado en el mismo trabajo) | Basado en densidad | No aplica | No aplica | No disponible | Solo como comparación interna (1 cluster denso + 7 % ruido) |
| Alternativas de segmentación energética con modelos generativos | LLM con contexto largo | Miles de millones | Decenas de miles de tokens | Variable | No disponible |

No se dispone de comparaciones publicadas con otros modelos de segmentación de consumo energético en la informacion proporcionada. Las alternativas internas (Ward y DBSCAN) se evaluaron en el mismo estudio y no se distribuyen como artefactos independientes.

## Limitaciones y advertencias

- Los grupos son un corte reproducible de un continuo, no clusters naturales: el silhouette máximo es 0,22 y muchos hogares quedan cerca de las fronteras entre grupos.
- Las lecturas anuales no permiten distinguir mejoras de eficiencia de cambios en la ocupación; los "recortes profundos en la crisis" del cluster 1 pueden reflejar infrafacturación, no una mejora real.
- Sesgo de selección: se excluyen hogares conectados después de 2008 y aquellos sin lecturas válidas suficientes, lo que favorece a hogares antiguos y estables.
- Fuera de alcance: viviendas sin calefacción de gas, fuera de Inglaterra y Gales, periodos fuera de 2005-2024, predicción de consumo futuro y cualquier decisión que afecte a derechos o tarifas de un hogar.
- No debe usarse para juicios individuales sobre un hogar concreto; los grupos se solapan fuertemente.
- Los datos NEED redondean las lecturas y las lecturas marcadas fueron eliminadas, lo que introduce ruido adicional.
- Riesgo de seguridad: `model.joblib` es un pickle y puede ejecutar código al cargarse; solo debe cargarse desde fuentes de confianza.
- Licencia MIT para el modelo, pero los datos subyacentes están sujetos a la Open Government Licence v3.0; conviene verificar las condiciones de atribución en un uso comercial.
- No es un modelo de lenguaje: no procesa texto, no admite instrucciones en lenguaje natural y no tiene capacidades de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day3-group4-household-energy-typologies
- Dataset asociado: https://huggingface.co/datasets/iaac-maai/day3-group4-household-energy-trajectories
- Repositorio GitHub con el análisis completo: https://github.com/iaac-maai/Group4-day3-assignment
- Dataset original UK NEED (DESNZ): no disponible en la informacion proporcionada
