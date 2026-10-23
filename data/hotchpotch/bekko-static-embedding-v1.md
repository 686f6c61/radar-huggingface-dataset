# hotchpotch/bekko-static-embedding-v1

## Resumen

bekko-static-embedding-v1 es un modelo de embeddings estáticos multilingüe publicado por el desarrollador hotchpotch (autor también de la familia bekko-embedding). No contiene capas Transformer: cada token se mapea a un vector fijo mediante una tabla de búsqueda y el embedding de la frase es la media de los vectores de sus tokens. Esto elimina por completo el coste de atención y permite ejecutar el modelo en cualquier CPU, sin GPU.

El modelo resuelve el cuello de botella de coste en recuperación de información a gran escala: ofrece una calidad de retrieval que, según la model card, supera a todos los modelos estáticos públicos comparados (43,76 en MNanoBEIR sobre 14 idiomas, unos 11 puntos por encima del resto de estáticos multilingües) y queda a cerca de 1 punto de multilingual-e5-small en MMTEB Retrieval (49,96 frente a 50,9) con cero capas Transformer. Genera embeddings de 1024 dimensiones con truncamiento Matryoshka a 512/256/128/64/32 y utiliza un tokenizador WordPiece propio de 200k tokens entrenado para 40 idiomas.

Es relevante ahora porque permite indexar corpus muy grandes o servir búsqueda semántica con presupuestos de latencia y CPU ajustados, con artefactos ONNX y OpenVINO en FP16/INT8 (el modelo INT8 de 512 dimensiones ocupa 103,2 MB) y licencia MIT, sin necesidad de prefijos ni instrucciones en las consultas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Static embedding: tabla de búsqueda token → vector fijo y mean pooling; 0 capas Transformer, sin atención |
| Parametros totales | 204.800.000 (tabla de embeddings de 200k tokens × 1024 dimensiones; la tabla es el modelo completo) |
| Longitud de contexto | no aplica (modelo de embeddings no generativo; el coste depende del número de tokens de la frase) |
| Tipos de cuantizacion | FP32 (pesos originales), FP16 e INT8 publicados en ONNX y OpenVINO |
| Idiomas soportados | 40 idiomas: multilingüe, en, ar, bg, bn, ca, cs, da, de, el, es, et, fa, fi, fr, he, hi, hr, hu, id, it, ja, ko, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, te, th, tr, uk, vi, yo, zh |
| Licencia | MIT |
| Formato de pesos | safetensors; ONNX y OpenVINO con pesos FP16 o INT8 por dimensión |
| Dimensiones de salida | 1024 (Matryoshka: 512, 256, 128, 64, 32) |
| Tokenizador | WordPiece propio de 200.000 tokens |
| Pipeline | sentence-similarity / feature-extraction |
| Dataset de entrenamiento | hotchpotch/bekko-embedding-v1-unsupervised |
| Tamano del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un modelo estático puro: no hay bloques Transformer ni mecanismo de atención. Existe una única matriz de embeddings de 200.000 × 1024 parámetros (204,8 M en total) en la que cada token del vocabulario WordPiece tiene asignado un vector; el embedding de una frase se obtiene promediando los vectores de sus tokens. Al no haber cómputo de atención, el coste de codificación es prácticamente el de una suma de vectores más la tokenización, lo que hace viable la inferencia en CPU.

El modelo se entrenó sobre el dataset hotchpotch/bekko-embedding-v1-unsupervised, con cobertura de 40 idiomas objetivo. La model card remite al blog del autor para la descripción completa del proceso de entrenamiento, la composición del dataset, el número de tokens vistos y el uso de RLHF/DPO; esos datos no están disponibles en la información proporcionada. Sí se documenta que el modelo no requiere prefijos ni instrucciones (a diferencia de los modelos de la familia E5) y que soporta truncamiento Matryoshka, con una pérdida de aproximadamente 0,9 puntos de retrieval al pasar de 1024 a 512 dimensiones (52,82 en NanoBEIR-en con 512 dimensiones).

## Capacidades

- Generación de embeddings de frase de 1024 dimensiones para similitud semántica y recuperación densa.
- Truncamiento Matryoshka a 512, 256, 128, 64 y 32 dimensiones sin reentrenar, lo que permite ajustar el compromiso entre calidad y tamaño de índice.
- Recuperación multilingüe y cross-lingual en 40 idiomas sin necesidad de prefijos, instrucciones ni plantillas de consulta.
- Similitud entre frases, clustering, deduplicación y clasificación por vecino más cercano.
- Compatibilidad con Sentence Transformers, ONNX Runtime y OpenVINO; artefactos cuantizados FP16 e INT8 listos para usar.
- Ejecución en CPU sin GPU, apta para entornos con recursos limitados o para despliegue en el dispositivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo generativo.
- No tiene capacidades de visión ni de audio.

## Casos de uso

- Búsqueda semántica sobre corpus masivos en CPU: al no existir capas Transformer, la codificación de millones de documentos se puede repartir en nodos de CPU sin GPU, y el índice puede almacenarse con truncamiento a 256 o 128 dimensiones para reducir memoria y latencia.
- Generación aumentada por recuperación (RAG) con presupuesto de latencia estricto: el modelo actúa como recuperador de primera etapa y sus embeddings de consulta se calculan en el mismo proceso que atiende la petición, con artefactos ONNX/OpenVINO.
- Deduplicación y near-duplicate detection a escala web: comparar embeddings de 128 o 64 dimensiones permite filtrar duplicados en pipelines de curación de datos de entrenamiento donde el coste por documento debe ser mínimo.
- Clasificación y enrutado de tickets de soporte multilingüe: con 40 idiomas cubiertos y sin prefijos, un clasificador k-NN o una regresión logística sobre los embeddings puede enrutar incidencias en castellano, inglés, japonés o árabe con el mismo modelo.
- Recuperación de dos etapas: uso como candidate generator barato antes de un reranker Transformer o de un cross-encoder, reduciendo el número de documentos que pasan a la etapa cara.
- Despliegue en el dispositivo o en el navegador: el artefacto INT8 de 512 dimensiones pesa 103,2 MB y se ejecuta con OpenVINO u ONNX Runtime, lo que permite búsqueda semántica local en portátiles o entornos sin conectividad.
- Recomendación de contenido por similitud: indexar artículos, productos o vídeos por su descripción y servir vecinos más próximos con un índice vectorial ligero, manteniendo el coste de codificación despreciable frente al de un modelo contextual.

## Benchmarks y rendimiento

Datos publicados en la model card. NanoBEIR-en son 13 tareas en inglés y MNanoBEIR 182 tareas en 14 idiomas (nDCG@10 × 100, media con el mismo peso por tarea, HAKARI-Bench). MMTEB corresponde a `MTEB(Multilingual, v2)`, 131 tareas, media × 100; Retrieval es su categoría de 18 tareas. Los valores del modelo fueron evaluados localmente; los de los modelos estáticos comparados usan resultados publicados de MMTEB promediados sobre las mismas 131 tareas.

Comparación con modelos de embeddings estáticos:

| Modelo | Idiomas | Dims | NanoBEIR-en | MNanoBEIR | MMTEB Retrieval | MMTEB Mean |
|---|---|---:|---:|---:|---:|---:|
| bekko-static-embedding-v1 | Multilingüe | 1024 | 53,71 | 43,76 | 49,96 | 50,18 |
| static-similarity-mrl-multilingual-v1 | Multilingüe | 1024 | 43,51 | 32,29 | 41,21 | 47,24 |
| potion-multilingual-128M | Multilingüe | 256 | 37,07 | 32,23 | 37,86 | 47,23 |
| static-retrieval-mrl-en-v1 | Inglés | 1024 | 50,35 | no disponible | no disponible | no disponible |
| stable-static-embedding-fast-retrieval-mrl-en-v2 | Inglés | 512 | 51,57 | no disponible | no disponible | no disponible |

Comparación con modelos contextuales:

| Modelo | Capas Transformer | Parámetros activos | NanoBEIR-en | MNanoBEIR | MMTEB Retrieval | MMTEB Mean |
|---|---:|---:|---:|---:|---:|---:|
| bekko-static-embedding-v1 | 0 | 0 | 53,71 | 43,76 | 49,96 | 50,18 |
| multilingual-e5-small | 12 | 21,6 M | 58,37 | 51,17 | 50,90 | 56,40 |
| bekko-embedding-v1-a8m | 4 | 7,7 M | 60,34 | 52,65 | 56,20 | 56,70 |

El modelo también se evalúa truncado a 512 dimensiones, con 52,82 en NanoBEIR-en (0,89 puntos por debajo de 1024 dimensiones). No se han publicado mediciones propias de throughput o latencia para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El modelo no requiere GPU y está diseñado para ejecutarse en CPU.
- Huella de memoria estimada a partir del número de parámetros: unos 819 MB en FP32, unos 410 MB en FP16 y unos 205 MB en INT8 para las 1024 dimensiones completas; el artefacto INT8 de 512 dimensiones publicado ocupa 103,2 MB.
- GPU recomendadas: no aplica; cualquier GPU es innecesaria. Si se dispone de ella, ONNX Runtime o OpenVINO pueden usarla, pero no hay datos publicados de ganancia.
- Cabe en cualquier equipo consumer: portátiles, contenedores sin GPU, Raspberry Pi y navegador (vía ONNX Runtime Web u OpenVINO), en función del artefacto elegido.
- Opciones de despliegue: Sentence Transformers, ONNX Runtime, OpenVINO. vLLM, TGI y llama.cpp no aplican porque no es un modelo generativo.
- Latencia y throughput: no disponible para este modelo. Como referencia externa, el blog de Sentence Transformers sobre modelos estáticos reporta codificaciones en CPU entre 100 y 400 veces más rápidas que modelos como multilingual-e5-small para sus propios modelos estáticos; el autor recomienda medir sobre la carga de trabajo real.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Dims | Idiomas | MMTEB Retrieval | Licencia | Disponibilidad |
|---|---|---:|---:|---|---:|---|---|
| bekko-static-embedding-v1 | Estático | 204,8 M | 1024 (Matryoshka) | 40 | 49,96 | MIT | HuggingFace, ONNX, OpenVINO |
| static-similarity-mrl-multilingual-v1 | Estático | no disponible | 1024 (Matryoshka) | Multilingüe | 41,21 | no disponible | HuggingFace |
| potion-multilingual-128M | Estático | 128 M (según nombre) | 256 | Multilingüe | 37,86 | no disponible | HuggingFace |
| multilingual-e5-small | Transformer (12 capas) | 21,6 M activos | 384 | Multilingüe | 50,90 | no disponible | HuggingFace |
| bekko-embedding-v1-a8m | Transformer (4 capas) | 7,7 M activos | no disponible | Multilingüe | 56,20 | no disponible | HuggingFace |

Regla de selección indicada por el autor: elegir bekko-static-embedding-v1 cuando el coste de codificación deba ser mínimo (corpus muy grandes en CPU o presupuestos de latencia ajustados); elegir bekko-embedding-v1-a8m cuando prime la calidad de retrieval y se pueda ejecutar un pequeño Transformer.

## Limitaciones y advertencias

- Al promediar vectores de tokens sin atención, el modelo no modela el orden de las palabras ni el contexto: no distingue negaciones, alteraciones de orden ni dependencias sintácticas, lo que penaliza en tareas de STS, BitextMining y Reranking (su MMTEB Mean es 50,18 frente a 56,40 de multilingual-e5-small).
- La calidad es inferior a la de modelos contextuales pequeños en los conjuntos Nano: 53,71 frente a 58,37 en NanoBEIR-en y 43,76 frente a 51,17 en MNanoBEIR.
- El rendimiento por idioma no está desglosado en la información disponible; los 40 idiomas declarados no implican calidad homogénea, por lo que conviene validar sobre el idioma y el dominio concretos.
- Riesgo de alucinación no aplica (no genera texto), pero sí existe riesgo de recuperación irrelevante cuando la consulta depende de orden, negación o composición semántica compleja.
- El truncamiento Matryoshka reduce calidad: 512 dimensiones cuestan aproximadamente 0,89 puntos en NanoBEIR-en, y el autor no publica la pérdida para 256, 128, 64 y 32 dimensiones.
- No se han publicado latencias ni throughput propios; las cifras de 100x–400x proceden de otro artículo y de otros modelos estáticos.
- El modelo tiene 0 descargas y 12 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy limitada.
- Los resultados de benchmarks son en buena parte evaluaciones locales del autor; conviene reproducirlos antes de tomar decisiones de producción.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar los términos del dataset de entrenamiento (hotchpotch/bekko-embedding-v1-unsupervised) antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Blog del autor con la descripción completa y comparativas: https://huggingface.co/blog/hotchpotch/bekko-static-embedding
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/bekko-embedding-v1-unsupervised
- Modelo contextual de la misma familia (bekko-embedding-v1-a8m): https://huggingface.co/hotchpotch/bekko-embedding-v1-a8m
- Artículo de Sentence Transformers sobre modelos de embeddings estáticos: https://huggingface.co/blog/static-embeddings
- Leaderboard HAKARI-Bench (NanoBEIR / MNanoBEIR): https://huggingface.co/spaces/hakari-bench/leaderboard
- Referencia arXiv indicada en las etiquetas del modelo: arxiv:2607.25180 (no se ha podido verificar el contenido en la información disponible)
- static-similarity-mrl-multilingual-v1: https://huggingface.co/sentence-transformers/static-similarity-mrl-multilingual-v1
- potion-multilingual-128M: https://huggingface.co/minishlab/potion-multilingual-128M
- static-retrieval-mrl-en-v1: https://huggingface.co/sentence-transformers/static-retrieval-mrl-en-v1
- stable-static-embedding-fast-retrieval-mrl-en-v2: https://huggingface.co/RikkaBotan/stable-static-embedding-fast-retrieval-mrl-en-v2
- multilingual-e5-small: https://huggingface.co/intfloat/multilingual-e5-small
