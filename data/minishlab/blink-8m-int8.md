# minishlab/blink-8M-int8

## Resumen

blink-8M-int8 es la versión cuantizada a 8 bits de blink-8M, un modelo de embeddings estáticos en inglés desarrollado por Minish (minishlab). No es un modelo generativo: se trata de una única tabla de embeddings de tokens de 30.000 × 256 (7,68 millones de parámetros) con mean pooling, orientada a similitud semántica, recuperación de información y extracción de características. Su relevancia radica en que ofrece calidad cercana a modelos estáticos mucho mayores con un coste computacional mínimo: al no tener parámetros activos, el cálculo de embeddings es órdenes de magnitud más rápido que el de un transformer.

La versión int8 reduce el tamaño a aproximadamente 7,7 MB (4 veces menos que el modelo float32) con una puntuación prácticamente idéntica en los benchmarks del autor. Sustituye por completo a potion-base-8M, del mismo tamaño pero peor en todas las tareas evaluadas. Está pensada para despliegues de recuperación y búsqueda semántica de baja latencia, incluidos entornos en CPU y edge.

La licencia MIT y el formato de pesos safetensors facilitan su integración en producción, aunque con una limitación importante: solo carga con model2vec y model2vec-rs, ya que Sentence Transformers no admite pesos int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (tabla de embeddings de tokens con mean pooling, model2vec) |
| Parametros totales | 7.680.000 (7,68 M) |
| Parametros activos | No aplica (modelo sin parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (esta versión); el modelo base blink-8M está en float32 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (int8); librería model2vec |
| Dimensiones del embedding | 256 |
| Vocabulario | 30.000 tokens |
| Tamaño del repositorio | 0,0 GB (aprox. 7,7 MB en int8) |
| Modelo base | minishlab/blink-8M |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

blink-8M es un modelo de embeddings estáticos construido con la metodología model2vec: no contiene capas de atención ni parámetros activos, sino una única tabla de embeddings de 30.000 × 256 tokens sobre la que se aplica mean pooling para producir el vector de la frase. Esta estructura elimina el coste de la inferencia tipo transformer y permite calcular embeddings con una latencia muy inferior.

Los datos de entrenamiento declarados incluyen los conjuntos minishlab/tokenlearn-c4-en-bge-base-en-v1.5, lightonai/embeddings-pre-training-curated y lightonai/embeddings-fine-tuning-filtered-en. El modelo deriva de la destilación de un modelo transformer (bge-base-en-v1.5) hacia una representación estática, con una fase de preentrenamiento y otra de ajuste fino sobre datos de embeddings filtrados en inglés. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni detalles sobre RLHF o DPO, que no aplican a este tipo de modelo. La cuantización int8 se aplica sobre los pesos del modelo base sin reentrenamiento.

## Capacidades

- Generación de embeddings de frases y documentos en inglés para similitud semántica (sentence-similarity).
- Extracción de características (feature-extraction) para pipelines de NLP.
- Recuperación de información (retrieval) y reranking de candidatos.
- Clasificación de pares de frases (pair classification) y clustering de documentos.
- Evaluación de similitud textual (STS) y resumen extractivo basado en similitud.
- Inferencia extremadamente rápida al no tener parámetros activos, apta para CPU y entornos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo exclusivamente de embeddings.
- Sin capacidades multimodales (visión, audio) ni modo de razonamiento.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de documentación en inglés y recuperar los más relevantes para una consulta mediante similitud coseno, con latencia mínima gracias a sus 7,68 M de parámetros estáticos.
- Deduplicación de contenidos: comparar embeddings de artículos o registros para detectar duplicados o near-duplicates en grandes corpus, donde el throughput del modelo estático supera ampliamente al de un transformer.
- Clasificación de tickets de soporte: generar embeddings de tickets y agruparlos por similitud para enrutarlos al equipo adecuado, usando clustering sobre los vectores de 256 dimensiones.
- Reranking ligero en pipelines RAG: reordenar los candidatos recuperados por un retriever inicial calculando similitud entre la consulta y cada fragmento, con un coste computacional despreciable.
- Filtrado de contenido en edge: ejecutar el modelo en dispositivos con poca memoria (7,7 MB en int8) para tareas de similitud y moderación aproximada sin GPU.
- Análisis de similitud en investigación: calcular matrices de similitud entre frases para estudios de STS o validación de datasets, aprovechando la velocidad del modelo para corpus grandes.
- Detección de temas en corpus: agrupar documentos por embeddings y aplicar clustering para descubrir temáticas, adecuado por su bajo coste en CPU.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo float32 blink-8M; el autor indica que la versión int8 puntúa prácticamente igual. Evaluación en MTEB(eng, v2), 41 tareas, todos los modelos a 256 dimensiones:

| Modelo | Mean (task) | Retrieval | Reranking | PairCls | Cls | Clust | STS | Summ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| blink-8M | 55,35 | 38,86 | 43,12 | 78,42 | 67,88 | 41,49 | 73,56 | 22,48 |
| lattice-retrieval | 55,24 | 38,01 | 42,96 | 77,51 | 68,25 | 42,11 | 73,41 | 22,56 |
| bekko-static-embedding-v1 | 55,21 | 37,62 | 42,54 | 78,32 | 68,42 | 40,77 | 74,60 | 22,24 |
| potion-base-32M | 54,02 | 31,94 | 42,52 | 77,33 | 70,48 | 41,49 | 73,17 | 24,14 |
| potion-retrieval-32M | 53,70 | 34,64 | 41,95 | 75,94 | 66,67 | 41,76 | 72,89 | 19,95 |
| potion-base-8M | 53,30 | 31,22 | 41,79 | 76,62 | 70,41 | 39,88 | 72,45 | 25,14 |
| static-retrieval-mrl-en-v1 | 52,00 | 33,87 | 41,57 | 74,68 | 63,16 | 39,98 | 71,35 | 18,95 |

En RTEB (retrieval en dominios especializados: legal, finanzas, salud y código, 15 tareas públicas en inglés), blink-8M obtiene un mean nDCG@10 de 30,84, el mejor de la comparativa según el autor. No se han publicado resultados específicos para la versión int8 en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en int8 (7,7 MB de pesos), despreciable en cualquier GPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU (A100, H100, RTX 4090, incluso integradas) lo ejecuta sin problema.
- Cabe en cualquier GPU consumer y en dispositivos edge con memoria mínima.
- Opciones de despliegue: model2vec (Python) y model2vec-rs (Rust). Sentence Transformers no admite los pesos int8; para ese ecosistema debe usarse blink-8M en float32.
- Latencia y throughput: no se publican cifras concretas, pero al no tener parámetros activos la inferencia es órdenes de magnitud más rápida que la de un transformer estático equivalente en dimensiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Vocabulario | MTEB mean | Licencia | Idiomas |
|---|---|---:|---:|---:|---|---|
| blink-8M-int8 | 7,68 M | 256 | 30k | 55,35 (float32) | MIT | Inglés |
| potion-base-8M | ~8 M | 256 | 30k | 53,30 | MIT | Inglés |
| potion-base-32M | ~32 M | 512 (truncado a 256) | 65k | 54,02 | MIT | Inglés |
| bekko-static-embedding-v1 | No disponible | 1024 (truncado a 256) | 200k | 55,21 | No disponible | Multilingüe |
| lattice-retrieval | No disponible | 1024 (truncado a 256) | 30k | 55,24 | No disponible | Inglés |

blink-8M-int8 ofrece el mejor mean de MTEB de la comparativa con el menor tamaño y una licencia permisiva, a costa de un rendimiento inferior en clasificación y resumen frente a potion-base-8M y potion-base-32M.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para textos en castellano u otros idiomas.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Al ser un modelo estático, no captura contexto dependiente del orden de las palabras más allá del mean pooling; puede fallar en tareas que requieran composicionalidad sintáctica.
- Riesgo de similitudes espurias en frases con vocabulario compartido pero significado distinto; conviene validar umbrales en producción.
- Solo carga con model2vec y model2vec-rs; Sentence Transformers no admite pesos int8, lo que limita la integración con ese ecosistema.
- Los benchmarks publicados corresponden al modelo float32; la equivalencia de la versión int8 se afirma en la model card pero no se detalla por tarea.
- No se documentan sesgos específicos del dataset de entrenamiento en la información disponible.
- La licencia MIT permite uso comercial sin restricciones, pero debe verificarse la licencia de los datasets de entrenamiento subyacentes si se redistribuye el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minishlab/blink-8M-int8
- Modelo base blink-8M: https://huggingface.co/minishlab/blink-8M
- potion-base-8M: https://huggingface.co/minishlab/potion-base-8M
- potion-base-32M: https://huggingface.co/minishlab/potion-base-32M
- potion-retrieval-32M: https://huggingface.co/minishlab/potion-retrieval-32M
- static-retrieval-mrl-en-v1: https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1
- bekko-static-embedding-v1: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- lattice-retrieval: https://huggingface.co/erikkaum/lattice-retrieval
- Repositorio model2vec: https://github.com/MinishLab/model2vec
- Repositorio model2vec-rs: https://github.com/MinishLab/model2vec-rs
- Blog de RTEB: https://huggingface.co/blog/rteb
- Sitio de Minish: https://minish.ai
