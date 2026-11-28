# netprojects/Nemotron-3.5-Embed-8B-mlx-8bit

## Resumen

Nemotron-3.5-Embed-8B-MLX-8bit es la conversion a formato MLX del modelo de embeddings NVIDIA Nemotron-3.5-Embed-8B-BF16, realizada por NetProjects para su ejecucion en Apple Silicon. Se trata de un modelo de recuperacion (retrieval) que proyecta consultas de texto y documentos (texto o imagenes de pagina) en un mismo espacio vectorial, lo que permite busqueda semantica multimodal con un unico modelo. La torre de lenguaje se ha cuantizado a 8 bits con cuantizacion afin y tamano de grupo 64, mientras que el codificador de vision, el proyector, las normalizaciones y el pooling se mantienen en su precision original (bf16 o float32).

El modelo resuelve el problema de la recuperacion de informacion en entornos Apple Silicon, donde las herramientas habituales de inferencia (vLLM, TGI) no estan disponibles o no estan optimizadas. Al ofrecer pesos MLX nativos, permite ejecutar un modelo de embeddings de 8.381 millones de parametros en un Mac con memoria unificada, manteniendo una fidelidad practicamente identica a la implementacion de referencia de NVIDIA en float32 (coseno minimo de 0,9990 en documentos largos e imagenes de pagina, 0,9997 en SciFact).

La relevancia actual radica en que combina tres tendencias: modelos de embeddings de gran tamano con soporte Matryoshka (vectores truncables de 512 o 1024 dimensiones), recuperacion multimodal texto-imagen, y despliegue local en hardware de consumo Apple. El contexto de hasta 32.768 tokens permite indexar documentos largos sin trocear. La licencia es OpenMDW 1.1, heredada del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje Mistral3 + codificador de vision + proyector), basada en Ministral-3-8B-Instruct-2512 |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 8-bit affine, group size 64 (torre de lenguaje); vision encoder, proyector, normas y pooling en bf16/float32 |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX), tamano del repo 9,3 GB; build de 8,7 GB |

## Arquitectura y entrenamiento

El modelo es un encoder multimodal construido sobre Ministral-3-8B-Instruct-2512 (Apache-2.0) como torre de lenguaje, con un codificador de vision y un proyector que alinean imagenes de pagina con el espacio de texto. La salida se obtiene mediante mean pooling y normalizacion L2 calculadas en float32, lo que garantiza que las similitudes coseno sean estables independientemente de la cuantizacion. Soporta vectores Matryoshka, de modo que se pueden truncar las representaciones a 1024 o 512 dimensiones con perdida controlada de rendimiento.

La conversion a MLX solo modifica el formato y la precision: la torre de lenguaje pasa a 8 bits con cuantizacion afin (grupo de 64), mientras que el resto de componentes se preserva. El autor declara que la tokenizacion es identica a la original en todas las entradas probadas y que la fidelidad respecto a la implementacion de referencia de NVIDIA en float32 es muy alta (coseno medio de 0,9998). No se dispone de informacion sobre el dataset de entrenamiento original (numero de tokens, composicion, uso de RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica y similitud de frases (pipeline feature-extraction).
- Embeddings multimodales: consultas de texto contra documentos de texto o imagenes de pagina en el mismo espacio vectorial.
- Soporte de Matryoshka: truncado de vectores a 1024 o 512 dimensiones para reducir coste de almacenamiento y busqueda.
- Manejo de documentos largos: hasta 32.768 tokens por entrada, sin necesidad de trocear en la mayoria de casos.
- Formato de entrada especifico: consultas con prefijo `query: …` y documentos con prefijo `passage: …` a traves de la plantilla de chat de NVIDIA.
- Una imagen por documento (ruta, bytes, imagen PIL o data URL).
- Servidor local compatible con API estilo OpenAI (`/v1/embeddings`) y estilo Cohere/Jina (`/v1/rerank`).
- Capacidades multilingues: limitadas a ingles segun la model card.
- No se documentan tool calling, agentes ni modo thinking en la informacion disponible.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y articulos largos (hasta 32.768 tokens) y recuperar fragmentos relevantes mediante similitud coseno, aprovechando que el modelo mantiene coherencia en documentos de 4K+ tokens.
- Recuperacion sobre documentos escaneados: indexar imagenes de pagina (PDFs escaneados, informes) y consultar con texto, usando el codificador de vision integrado sin OCR previo.
- RAG local en Mac: montar un pipeline de retrieval-augmented generation completamente en Apple Silicon, usando el servidor `/v1/embeddings` como backend compatible con clientes OpenAI.
- Reranking de resultados: emplear el endpoint `/v1/rerank` para reordenar candidatos de un buscador de primera fase, mejorando la precision en dominios cientificos (SciFact nDCG@10 de 0,9135 en la muestra medida).
- Busqueda multimodal en repositorios de informes: combinar consultas textuales con indices de paginas con graficos o tablas, como muestra el ejemplo de la model card con "Figure 3" y una imagen de grafico.
- Prototipado de investigacion en recuperacion: evaluar estrategias Matryoshka (512 vs 1024 dimensiones) con un modelo de 8B en hardware de consumo, comparando la perdida de nDCG (0,7730 a 512 dimensiones frente a 0,7730 completo en ViDoRe v3 CS).
- Clasificacion y clustering de documentos: usar los embeddings normalizados como features para agrupamiento o deduplicacion de corpus en ingles.

## Benchmarks y rendimiento

Resultados medidos por el autor de la conversion (build MLX 8-bit) frente a la implementacion de referencia de NVIDIA en float32:

| Test | Metrica | Este build | Referencia NVIDIA |
|---|---|---|---|
| SciFact (200 consultas y abstracts) | Coseno min / medio vs NVIDIA | 0,9997 / 0,9998 | — |
| Documentos largos 4K+ e imagenes | Coseno min / medio vs NVIDIA | 0,9990 / 0,9998 | — |
| ViDoRe v3 Computer Science (ingles) | nDCG@10 | 0,7730 | 0,7736 |
| ViDoRe v3 CS, vectores 1024-d | nDCG@10 | 0,7459 | — |
| ViDoRe v3 CS, vectores 512-d | nDCG@10 | 0,6688 | — |
| ViDoRe v3 CS | Recall@100 | 0,9776 | — |
| SciFact (BEIR), 100 consultas | nDCG@10 | 0,9135 | 0,9134 |

Rendimiento de velocidad en texto (medido en Apple M5 Max de 128 GB):

| Tokens por entrada | Batch | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 5,97 | 3.019 | 8,82 GB |
| 506 | 16 | 5,05 | 2.553 | 9,73 GB |
| 506 | 64 | 5,10 | 2.579 | 12,56 GB |
| 4090 | 1 | 0,56 | 2.288 | 9,44 GB |
| 4090 | 16 | 0,55 | 2.242 | 16,76 GB |
| 4090 | 64 | 0,55 | 2.254 | 41,69 GB |

## Requisitos de hardware

- Memoria: aproximadamente 8,7-9,8 GB para inferencia con batch pequeno (medido: 8,82 GB de pico con batch 1 y entradas de 506 tokens). Con batch 64 y documentos de 4K+ tokens la memoria pico sube a 41,69 GB.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada, donde se obtienen 5,97 docs/s con batch 1.
- Cabe en Mac con memoria unificada de 16 GB o superior para uso con batch pequeno; para lotes grandes o documentos largos se recomienda 32-64 GB.
- No esta pensado para GPU NVIDIA: el formato es MLX, exclusivo de Apple Silicon. Para CUDA habria que usar los pesos originales de NVIDIA.
- Despliegue: libreria `nemotron_mlx` (instalable desde GitHub), servidor local con endpoints `/v1/embeddings` y `/v1/rerank`. Construido sobre MLX, mlx-lm y mlx-vlm.
- Throughput: 5,97 docs/s (batch 1) y 5,05-5,10 docs/s (batch 16-64) con entradas de 506 tokens; 0,55-0,56 docs/s con entradas de 4.090 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato | Licencia |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-MLX-8bit (este) | 8,38B | 32.768 | Si (texto + imagen de pagina) | MLX safetensors 8-bit | OpenMDW 1.1 |
| nvidia/Nemotron-3.5-Embed-8B-BF16 | 8,38B | 32.768 | Si | safetensors bf16 | OpenMDW 1.1 |
| Modelos de embeddings tipo BGE-M3 | no disponible en la informacion | no disponible | texto | safetensors/GGUF | MIT |
| Modelos de embeddings tipo E5-large | no disponible en la informacion | no disponible | texto | safetensors/GGUF | MIT |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la unica comparacion publicada es contra el propio modelo original de NVIDIA.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Es un modelo de embeddings, no generativo: no produce texto, solo vectores. No admite tool calling ni razonamiento multi-paso.
- La cuantizacion a 8 bits introduce una desviacion pequena pero medible (nDCG@10 de 0,7730 frente a 0,7736 en ViDoRe v3 CS; coseno minimo de 0,9990 en imagenes de pagina).
- El truncado Matryoshka a 512 dimensiones degrada notablemente el rendimiento (nDCG@10 de 0,6688 frente a 0,7730), por lo que no se recomienda para recuperacion de precision.
- Requiere el prefijo `query:` / `passage:` y la plantilla de chat de NVIDIA; omitirlos puede degradar la calidad de los embeddings.
- Solo admite una imagen por documento.
- Licencia OpenMDW 1.1: es necesario revisar los terminos del acuerdo antes de uso comercial; no es una licencia permisiva tipo Apache o MIT. El modelo base Ministral-3-8B-Instruct-2512 es Apache-2.0, pero el modelo derivado de NVIDIA se rige por OpenMDW 1.1.
- El proyecto no esta afiliado a NVIDIA; el soporte y mantenimiento dependen de NetProjects.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero los embeddings pueden producir falsos positivos en recuperacion con dominios muy especializados.
- Solo funciona en Apple Silicon; no hay version CUDA de esta conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Nemotron-3.5-Embed-8B-mlx-8bit
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Codigo de conversion y servidor: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
- Licencia OpenMDW 1.1: https://huggingface.co/netprojects/Nemotron-3.5-Embed-8B-mlx-8bit/blob/main/LICENSE
