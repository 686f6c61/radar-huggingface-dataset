# Raghav06123/Firstsubda3410

## Resumen

Raghav06123/Firstsubda3410 es un artefacto publicado en Hugging Face por el usuario Raghav06123 bajo licencia MIT, orientado a la clasificacion de enzimas mediante numeros EC (Enzyme Commission). A pesar de la nomenclatura habitual de los repositorios de modelos, no se trata de un modelo de lenguaje neuronal ni de una red profunda: la model card describe un pipeline de inferencia basado en recuperacion por similitud (kNN sobre k-mers con reordenamiento por alineamiento local Smith-Waterman) que asigna un numero EC a cada secuencia proteica transfiriendo la etiqueta de las enzimas de entrenamiento mas parecidas.

El sistema opera en tres fases: un prefiltrado con vectores TF-IDF de presencia de 5-mers y similitud coseno contra 186.000 secuencias unicas de entrenamiento (top 1.000 candidatas por consulta), un reordenamiento mediante alineamiento local Smith-Waterman con matriz BLOSUM62 implementado con `pyopal`, y una votacion ponderada por puntuacion de alineamiento entre los aciertos dentro del 10% del mejor hit. Incluye mecanismos de respaldo (fallback) al vecino mas cercano por k-mers si se agota un presupuesto temporal de 480 s, y a la EC mas frecuente si no hay candidatas.

Su relevancia radica en que ofrece una linea base reproducible y ligera (4 GB de RAM pico, 2 vCPU) para anotacion enzimatica, con validacion explicitamente disenada para evitar la fuga por homologia que infla las metricas en particiones aleatorias. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos (`weights/db.parquet`) no estan efectivamente alojados o no se han subido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperacion y votacion: indice disperso TF-IDF de 5-mers + reordenamiento por alineamiento local Smith-Waterman (BLOSUM62, gap open 11, extend 1) con `pyopal` + votacion ponderada por score |
| Parametros totales | no disponible (no es un modelo neuronal; el "estado" es una base de 186.000 secuencias unicas con sus EC) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entradas de longitud proteica arbitraria limitadas por el coste del alineamiento y el presupuesto de 480 s |
| Tipos de cuantizacion | no disponible (no aplica; no hay pesos neuronales que cuantizar) |
| Idiomas soportados | no disponible (la tarea es sobre secuencias proteicas, no texto natural) |
| Licencia | MIT |
| Formato de pesos | `weights/db.parquet` (tabla Parquet con secuencias unicas de entrenamiento y sus EC); codigo Python (`predict.py`, `kmer.py`, `train.py`, `inputs.py`) |

## Arquitectura y entrenamiento

El sistema no entrena parametros neuronales. La fase de "entrenamiento" (`train.py`) construye `weights/db.parquet` a partir de `train.parquet`: deduplica las secuencias de entrenamiento y conserva su anotacion EC, resultando en 186.000 secuencias unicas. En inferencia, `kmer.py` construye un indice disperso de presencia de 5-mers ponderado con TF-IDF y calcula similitud coseno mediante producto de matrices dispersas para seleccionar las 1.000 candidatas mas prometedoras por consulta.

Sobre ese conjunto reducido se aplica alineamiento local Smith-Waterman con la matriz de sustitucion BLOSUM62 (penalizacion de gap open 11, extension 1) usando la implementacion SIMD `pyopal`. La decision final combina las EC de todos los aciertos cuya puntuacion quede dentro del 10% del mejor hit, ponderando por score de alineamiento; si una secuencia candidata tiene multiples EC asignadas, su peso se reparte entre ellas. El diseno incorpora dos salvaguardas: fallback al vecino mas cercano por k-mers si se supera el presupuesto de 480 s, y fallback a la EC mas frecuente del corpus si no hay candidatas.

La validacion local es el aspecto metodologicamente mas destacable: el autor senala que una particion aleatoria es enganosa (coseno top-1 mediano de 0.65) porque las secuencias de validacion tendrian coincidencias exactas o casi exactas en entrenamiento. Por ello construye un hold-out de 4.915 secuencias del pool de baja similitud (coseno top-1 mediano de 0.05), las puntua contra las 181.000 restantes y aplica ponderacion por importancia para aproximar la distribucion de similitud de la validacion real, con un tamano de muestra efectivo de aproximadamente 2.300.

## Capacidades

- Prediccion de un unico numero EC por secuencia proteica, con resolucion hasta el cuarto nivel jerarquico (L1 a L4).
- Clasificacion por transferencia de etiquetas basada en homologia, adecuada para enzimas con parientes cercanos en el corpus de referencia.
- Manejo de ambiguedad mediante votacion ponderada cuando varios hits proximos apuntan a EC distintas, incluyendo reparto de peso en candidatas multi-EC.
- Degradacion controlada mediante dos niveles de fallback (kNN por k-mers y EC mayoritaria) para garantizar respuesta dentro de un presupuesto temporal.
- Ejecucion en CPU sin GPU: el pipeline completo procesa 11.367 entradas en 233 s con 4,0 GB de RAM pico en 2 vCPU.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto: no es un modelo generativo.
- No se documentan capacidades multilingues ni procesamiento de lenguaje natural.

## Casos de uso

- Anotacion masiva de metagenomas y catalogos proteicos: el pipeline procesa mas de 11.000 secuencias en menos de cuatro minutos en 2 vCPU, lo que permite anotar lotes de decenas de miles de proteinas en un nodo modesto antes de recurrir a herramientas mas costosas.
- Triaje previo a revision manual en curation de bases de datos enzimaticas: las predicciones con hits de alta puntuacion pueden aceptarse automaticamente, mientras que las que dependen del fallback se enrutan a revision humana.
- Linea base reproducible para competiciones o benchmarks de prediccion de EC: el codigo y la particion por baja similitud permiten comparar metodos neuronales contra un metodo de recuperacion bien calibrado sin fuga por homologia.
- Enriquecimiento funcional en estudios de genomica comparativa: asignar EC a proteinas hipoteticas de genomas recien secuenciados para orientar el analisis de vias metabolicas antes de validacion experimental.
- Filtrado de candidatas en pipelines de ingenieria de enzimas: descartar rapidamente secuencias cuya EC predicha no corresponde a la clase de interes antes de simulaciones o ensayos costosos.
- Docencia y prototipado en bioinformatica: implementacion compacta en Python (indice de k-mers, `pyopal`, Parquet) que sirve para ilustrar recuperacion por similitud, alineamiento local y evaluacion honesta bajo distribucion desplazada.
- Preanotacion en entornos con restricciones de hardware: al no requerir GPU ni pesos neuronales, puede desplegarse en contenedores pequenos o entornos air-gapped con solo CPU y 4 GB de RAM.

## Benchmarks y rendimiento

Resultados de la validacion local del autor sobre el hold-out ponderado por importancia (tamano efectivo ~2.300 secuencias, extraidas del pool de baja similitud):

| Metrica | Hold-out ponderado |
|---|---|
| Exactitud L1 | 0,943 |
| Exactitud L2 | 0,912 |
| Exactitud L3 | 0,899 |
| Exactitud L4 | 0,746 |

Rendimiento en tiempo de ejecucion declarado: 11.367 entradas de validacion procesadas en 233 s con 4,0 GB de RAM pico en 2 vCPU. No se han publicado comparaciones con otros modelos ni resultados en benchmarks externos estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el sistema se ejecuta en CPU.
- RAM: 4,0 GB pico medidos en la validacion de 11.367 entradas con 2 vCPU.
- GPU: no necesaria ni utilizada; no se documenta aceleracion por GPU.
- CPU: el autor reporta ejecucion con 2 vCPU; el rendimiento escala con el numero de nucleos disponible para `pyopal` (SIMD) y para el producto de matrices dispersas.
- Almacenamiento: el repositorio figura con 0.0 GB, por lo que `weights/db.parquet` (indice de 186.000 secuencias) no parece estar incluido; habria que regenerarlo con `train.py` a partir de `train.parquet`.
- Despliegue: scripts Python (`predict.py` como punto de entrada); no hay integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: aproximadamente 20 ms por secuencia en el entorno medido (233 s / 11.367 entradas), condicionado por la longitud de las secuencias y por el presupuesto de 480 s que dispara el fallback.

## Comparativa con modelos similares

| Sistema | Enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Raghav06123/Firstsubda3410 | kNN sobre 5-mers + Smith-Waterman + votacion | no aplica (base de 186k secuencias) | longitud proteica arbitraria | L1 0,943 / L4 0,746 (hold-out ponderado propio) | MIT | Hugging Face, 0 descargas, pesos aparentemente no incluidos |
| Herramientas de anotacion por homologia tipo BLAST + transferencia de EC | Alineamiento contra bases de referencia | no aplica | longitud proteica arbitraria | no disponible en esta ficha | variable segun herramienta y base | ampliamente disponibles |
| Modelos neuronales de prediccion de EC (familia CLEAN, ProteinBERT, ESM con cabeza de clasificacion) | Redes profundas sobre embeddings proteicos | millones a miles de millones | limitado por longitud maxima de secuencia | no disponible en esta ficha | variable (MIT, Apache-2.0, etc.) | Hugging Face y GitHub |

No se dispone de datos de benchmarks comparativos directos entre este artefacto y las alternativas citadas en la informacion proporcionada; la comparacion es cualitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural; cualquier uso fuera de clasificacion de secuencias proteicas es inadecuado.
- Dependencia critica de la base de referencia: la calidad de las predicciones esta acotada por la cobertura y correccion de las 186.000 secuencias de `weights/db.parquet`; enzimas sin parientes cercanos en el corpus degradaran hacia el fallback de EC mayoritaria.
- El repositorio figura con 0.0 GB de tamano y 0 descargas: es probable que los pesos no esten subidos y que sea necesario regenerarlos con `train.py`, lo que exige disponer de `train.parquet`.
- Las metricas reportadas (L1 0,943; L4 0,746) provienen de una validacion interna del autor con ponderacion por importancia y tamano efectivo de ~2.300 muestras; no han sido verificadas de forma independiente ni comparadas con benchmarks externos.
- Riesgo de sobreajuste al protocolo de evaluacion: aunque el hold-out se disena para baja similitud, la seleccion de candidatas y el umbral del 10% pueden haberse ajustado sobre esa misma distribucion.
- El presupuesto de 480 s introduce comportamiento no determinista en funcion de la carga: consultas que agotan el tiempo caen al kNN por k-mers, con precision potencialmente inferior y no cuantificada por separado en la model card.
- Sin documentacion sobre sesgos taxonomicos: no se indica la composicion taxonomica del corpus, por lo que la cobertura puede estar sesgada hacia organismos sobrerrepresentados en las bases de datos publicas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no se ofrece ninguna garantia sobre la exactitud de las anotaciones enzimaticas; no debe usarse como unica fuente en contextos regulatorios o clinicos.
- Ausencia de versionado de datos y de model card extendida: no se detallan procedencia de `train.parquet`, fecha de las anotaciones EC ni criterios de deduplicacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Raghav06123/Firstsubda3410
- `pyopal` (alineamiento Smith-Waterman con SIMD): no se proporciona enlace en la informacion disponible
- Documentacion de numeros EC (Enzyme Commission): no se proporciona enlace en la informacion disponible
- Paper, blog o demo asociados: no disponible
