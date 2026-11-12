# minishlab/blink-8M

## Resumen

blink-8M es un modelo de embeddings estáticos en inglés desarrollado por Minish (minishlab). Se trata de una única tabla de embeddings de tokens de 30.000 × 256 dimensiones (7,68 millones de parámetros, 31 MB en float32) con mean pooling, sin parámetros activos más allá de la propia tabla de embeddings. Su objetivo es ofrecer representaciones vectoriales de frases y documentos con una latencia y un coste computacional varios órdenes de magnitud inferiores a los de un transformer, manteniendo una calidad competitiva en tareas de similitud semántica y recuperación de información.

El modelo se construye sobre la técnica model2vec y sustituye por completo a potion-base-8M: mismo tamaño, pero mejor en todas las tareas evaluadas. Según la model card, supera a todos los modelos estáticos de su tamaño y, según la tarea, a modelos mucho mayores. En MTEB(eng, v2) con 41 tareas alcanza un mean de 55,35, por delante de lattice-retrieval (55,24) y bekko-static-embedding-v1 (55,21), y muy por encima de potion-base-8M (53,30).

Es relevante ahora porque permite desplegar búsqueda semántica, deduplicación y clasificación ligera a gran escala sobre CPU, sin GPU, con un consumo de memoria mínimo. Su licencia MIT y su compatibilidad con model2vec, model2vec-rs y Sentence Transformers facilitan la integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec): tabla de embeddings de tokens 30.000 × 256 con mean pooling, sin capas transformer ni parámetros activos |
| Parametros totales | 7.680.000 |
| Parametros activos | No aplica (modelo estático, sin parámetros activos) |
| Longitud de contexto | No disponible (modelo de embeddings por pooling; no se especifica ventana de contexto) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en float32; 31 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería model2vec) |

## Arquitectura y entrenamiento

blink-8M no es un transformer: es un modelo estático de embeddings en el que todos los parámetros son parámetros de embedding. La arquitectura consiste en una única tabla de embeddings de tokens de 30.000 entradas por 256 dimensiones, sobre la que se aplica mean pooling para obtener el vector de la frase o documento. Al no haber cómputo de atención ni capas profundas, la inferencia es varios órdenes de magnitud más rápida que la de un transformer y puede ejecutarse en CPU con un coste de memoria mínimo (31 MB en float32).

El entrenamiento sigue el paradigma model2vec (destilación de un modelo transformer a una tabla de embeddings estática) y utiliza los datasets `minishlab/tokenlearn-c4-en-bge-base-en-v1.5`, `lightonai/embeddings-pre-training-curated` y `lightonai/embeddings-fine-tuning-filtered-en`. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO. La model card destaca que blink-8M sustituye a potion-base-8M con el mismo tamaño y mejores resultados en todas las tareas.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica (sentence-similarity).
- Extracción de características (feature-extraction) y representaciones vectoriales de 256 dimensiones.
- Recuperación de información (retrieval) y reranking, con buen rendimiento relativo en tareas de recuperación.
- Clasificación de pares de frases (pair classification) y clasificación de textos.
- Clustering de documentos y análisis de similitud a gran escala.
- Evaluación de similitud semántica textual (STS).
- Capacidades multilingües: no, es un modelo monolingüe en inglés.
- Tool calling / function calling: no aplica (no es un modelo generativo).
- Agentes y razonamiento multi-step: no aplica.
- Capacidades especiales: inferencia extremadamente rápida en CPU, sin GPU, gracias a su naturaleza estática.

## Casos de uso

- Búsqueda semántica a gran escala: indexar millones de documentos y consultar por similitud vectorial en CPU, ya que el modelo ocupa 31 MB y no requiere GPU, lo que permite desplegar el servicio de embeddings junto al índice sin coste de acelerador.
- Deduplicación de contenido: calcular embeddings de artículos, reseñas o registros y detectar duplicados o casi duplicados mediante similitud coseno, aprovechando el bajo coste por documento.
- Clasificación de textos ligera: usar los embeddings como entrada de un clasificador supervisado (regresión logística, SVM) para enrutamiento de tickets o etiquetado de contenido, con inferencia en milisegundos.
- Reranking de resultados de búsqueda: reordenar candidatos recuperados por un motor léxico (BM25) usando la similitud del embedding, adecuado por su rapidez en la fase de reranking.
- Filtrado y moderación de contenido: comparar la similitud de mensajes con un conjunto de referencia de contenido permitido o prohibido, con latencia muy baja para pipelines en tiempo real.
- Agrupación y análisis de corpus: clustering de documentos o consultas para descubrir temas, con un coste computacional mínimo incluso en corpus grandes.
- Detección de similitud en atención al cliente: comparar la consulta entrante con una base de preguntas frecuentes para sugerir respuestas, sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

MTEB(eng, v2), 41 tareas, todos los modelos evaluados a 256 dimensiones:

| Modelo | Mean (task) | Retrieval | Reranking | PairCls | Cls | Clust | STS | Summ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **blink-8M** | **55,35** | **38,86** | **43,12** | **78,42** | 67,88 | 41,49 | 73,56 | 22,48 |
| lattice-retrieval | 55,24 | 38,01 | 42,96 | 77,51 | 68,25 | **42,11** | 73,41 | 22,56 |
| bekko-static-embedding-v1 | 55,21 | 37,62 | 42,54 | 78,32 | 68,42 | 40,77 | **74,60** | 22,24 |
| potion-base-32M | 54,02 | 31,94 | 42,52 | 77,33 | **70,48** | 41,49 | 73,17 | 24,14 |
| potion-retrieval-32M | 53,70 | 34,64 | 41,95 | 75,94 | 66,67 | 41,76 | 72,89 | 19,95 |
| potion-base-8M | 53,30 | 31,22 | 41,79 | 76,62 | 70,41 | 39,88 | 72,45 | **25,14** |
| static-retrieval-mrl-en-v1 | 52,00 | 33,87 | 41,57 | 74,68 | 63,16 | 39,98 | 71,35 | 18,95 |

En RTEB (dominios especializados: legal, finanzas, salud y código), blink-8M obtiene un mean nDCG@10 de 30,84, el mejor de la comparativa. En las tareas públicas mostradas, por ejemplo AILACasedocs (legal) alcanza 26,81 y AILAStatutes (legal) 25,10, el mejor resultado de esta última.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el modelo ocupa 31 MB en float32 y se ejecuta en CPU.
- GPU recomendadas: no necesarias. Cualquier CPU moderna es suficiente; una GPU solo aportaría ventajas marginales en lotes muy grandes.
- Cabe en cualquier GPU consumer, pero no la requiere; también cabe en dispositivos de baja memoria y entornos sin acelerador.
- Opciones de despliegue: librería `model2vec` (Python), `model2vec-rs` (Rust) y `sentence-transformers` (SentenceTransformer).
- Latencia y throughput: la model card indica que los modelos estáticos son varios órdenes de magnitud más rápidos que los transformers; no se publican cifras concretas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Mean MTEB(eng, v2) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| **blink-8M** | 7,68 M | 256 | No disponible | 55,35 | MIT | Hugging Face (model2vec) |
| potion-base-8M | ~8 M (30k vocab) | 256 | No disponible | 53,30 | No disponible | Hugging Face (model2vec) |
| potion-base-32M | ~32 M (65k vocab) | 512 (evaluado a 256) | No disponible | 54,02 | No disponible | Hugging Face (model2vec) |
| lattice-retrieval | No disponible (30k vocab) | 1024 (evaluado a 256) | No disponible | 55,24 | No disponible | Hugging Face |
| bekko-static-embedding-v1 | No disponible (200k vocab) | 1024 (evaluado a 256) | No disponible | 55,21 | No disponible | Hugging Face |

blink-8M lidera el mean de MTEB(eng, v2) frente a los modelos estáticos comparados, con ventaja clara en retrieval (38,86 frente a 31,22 de potion-base-8M) y en reranking y pair classification, aunque potion-base-32M y potion-base-8M son mejores en clasificación y potion-base-8M en summarization.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no soporta otros idiomas, incluido el castellano.
- Al ser un modelo estático con mean pooling, no modela el orden de las palabras ni dependencias de largo alcance; su calidad en tareas que requieren composición semántica compleja es inferior a la de un transformer.
- Riesgo de alucinación: no aplica en el sentido generativo (no genera texto), pero los embeddings pueden producir similitudes engañosas en textos ambiguos o de dominio muy específico.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre corpus web (C4 y datasets de embeddings), puede heredar sesgos presentes en esos datos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; conviene revisar los términos de los datasets de entrenamiento si se requiere un análisis de procedencia.
- En producción: el rendimiento en dominios especializados (legal, finanzas, salud, código) es inferior al de modelos transformer grandes; para tareas de alta precisión puede requerirse un modelo de embeddings mayor o un reranker adicional.
- No se especifica la longitud máxima de entrada ni el comportamiento con textos largos; conviene validar el truncado en el pipeline propio.

## Enlaces

- Hugging Face: https://huggingface.co/minishlab/blink-8M
- Minish: https://minish.ai
- Repositorio model2vec: https://github.com/MinishLab/model2vec
- Repositorio model2vec-rs: https://github.com/MinishLab/model2vec-rs
- Sentence Transformers: https://www.sbert.net
- potion-base-8M: https://huggingface.co/minishlab/potion-base-8M
- potion-base-32M: https://huggingface.co/minishlab/potion-base-32M
- potion-retrieval-32M: https://huggingface.co/minishlab/potion-retrieval-32M
- static-retrieval-mrl-en-v1: https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1
- bekko-static-embedding-v1: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- lattice-retrieval: https://huggingface.co/erikkaum/lattice-retrieval
- Blog RTEB: https://huggingface.co/blog/rteb
