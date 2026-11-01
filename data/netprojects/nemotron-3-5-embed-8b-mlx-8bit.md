# netprojects/Nemotron-3.5-Embed-8B-mlx-8bit

## Resumen
Nemotron-3.5-Embed-8B-mlx-8bit es una conversion a formato MLX del modelo de embeddings NVIDIA Nemotron-3.5-Embed-8B-BF16, realizada por NetProjects para su ejecucion en Apple Silicon. El modelo original es un encoder multimodal de NVIDIA que proyecta consultas de texto y documentos (texto o imagenes de pagina) en un mismo espacio vectorial, pensado para tareas de retrieval y sentence-similarity. Esta build cuantiza la torre de lenguaje a 8 bits (cuantizacion afina, group size 64) manteniendo el encoder de vision y el proyector en bf16.

La relevancia de esta ficha es doble: por un lado documenta el primer port conocido a MLX de un embedder multimodal de 8.381 millones de parametros, lo que permite ejecutar retrieval multimodal en local sobre hardware Apple; por otro, sirve como referencia de como se degrada (o no) la calidad al cuantizar un encoder de retrieval, con mediciones reproducibles frente al codigo original de NVIDIA en float32.

El modelo hereda la licencia OpenMDW 1.1 de NVIDIA y esta construido sobre mistralai/Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0). Solo soporta ingles segun la model card, y su ventana de contexto es de hasta 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje Mistral-3 + encoder de vision + proyector), encoder de embeddings con mean pooling y normalizacion L2 |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 8-bit affine, group size 64 (solo torre de lenguaje); vision encoder, proyector, norms, pooling y normalizacion en bf16/float32 |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (OpenMDW License Agreement v1.1) |
| Formato de pesos | safetensors (MLX), repositorio de 9,3 GB; build de 8,7 GB |

## Arquitectura y entrenamiento
El modelo base es un embedder multimodal construido sobre Ministral-3-8B-Instruct. La torre de lenguaje procesa consultas y documentos de texto; un encoder de vision y un proyector mapean imagenes de pagina al mismo espacio vectorial. Los embeddings se obtienen con mean pooling y se normalizan en L2 (calculado en float32), de modo que la similitud coseno es el producto escalar directo. Soporta embeddings Matryoshka, es decir, vectores truncados a 1024 o 512 dimensiones con perdida controlada de calidad.

La conversion a MLX no reentrena nada: solo cambia formato y precision. La torre de lenguaje se cuantiza a 8 bits con group size 64, mientras que el encoder de vision, el proyector, las normalizaciones y el pooling se mantienen en bf16 o float32 para preservar la fidelidad numerica. La tokenizacion es identica a la del original en todas las entradas probadas. La model card no detalla el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esa informacion corresponde al modelo original de NVIDIA y no se reproduce en esta build.

## Capacidades
- Generacion de embeddings de texto para retrieval y sentence-similarity (pipeline feature-extraction).
- Embeddings multimodales: consultas de texto contra documentos de texto o imagenes de pagina en el mismo espacio vectorial.
- Soporte de entrada mixta texto + imagen en un mismo documento (por ejemplo, `{"text": "Figure 3", "image": "chart.png"}`).
- Embeddings Matryoshka: truncado a 1024 o 512 dimensiones sin reentrenar.
- Interfaz de servidor local compatible con `/v1/embeddings` (estilo OpenAI) y `/v1/rerank` (estilo Cohere/Jina), con imagenes en data URL o base64.
- Procesamiento de documentos largos de hasta 32.768 tokens.
- No soporta tool calling, agentes, thinking mode ni generacion de texto: es exclusivamente un modelo de embeddings.

## Casos de uso
- Busqueda semantica en documentacion tecnica: indexar manuales y articulos en ingles y recuperar fragmentos relevantes mediante similitud coseno, aprovechando la ventana de 32.768 tokens para secciones largas sin trocear.
- Retrieval multimodal de documentos escaneados: indexar paginas como imagenes y consultar con texto, util para archivos historicos, informes en PDF o catalogos donde el OCR es costoso o poco fiable.
- Reranking de resultados de busqueda: el servidor incluido expone `/v1/rerank`, de modo que se puede insertar como segunda etapa sobre un retriever BM25 o denso de primera fase.
- Sistemas RAG en local sobre Mac: desplegar el embedder con MLX en un Mac con Apple Silicon para pipelines de recuperacion sin enviar datos a la nube, relevante en entornos con requisitos de privacidad.
- Busqueda visual en colecciones de figuras y graficos: combinar texto y descripcion de figura para localizar tablas o diagramas dentro de papers y reportes cientificos.
- Deduplicacion y clustering de documentos: generar embeddings normalizados y agrupar por similitud coseno para detectar duplicados o temas en corpus en ingles.
- Evaluacion de calidad de cuantizacion: usar esta build como referencia para medir el impacto de 8 bits frente al BF16 original en tareas de retrieval, dado que la model card publica comparativas de fidelidad.

## Benchmarks y rendimiento
Resultados medidos por el autor de la conversion frente al codigo original de NVIDIA en float32.

| Prueba | Entradas | Resultado |
|---|---|---|
| Similitud coseno vs NVIDIA (SciFact) | 200 | min 0,9997 / media 0,9998; top-1 40/40; solapamiento top-10 0,99 |
| Similitud coseno vs NVIDIA (documentos largos y paginas) | 52 (3 largos, 8 imagenes) | min 0,9990 / media 0,9998; top-1 10/10; solapamiento top-10 0,95 |
| ViDoRe v3 Computer Science, nDCG@10 | 1.360 paginas | 0,7730 (NVIDIA publicado: 0,7736) |
| ViDoRe v3, Recall@100 | 1.360 paginas | 0,9776 |
| ViDoRe v3, Matryoshka 1024-d | 1.360 paginas | 0,7459 |
| ViDoRe v3, Matryoshka 512-d | 1.360 paginas | 0,6688 |
| SciFact (BEIR) slice, nDCG@10 | 100 consultas, 1.000 docs | 0,9135 (original: 0,9134) |

Rendimiento de inferencia en texto (Apple M5 Max, 128 GB):

| Tokens por entrada | Batch | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 5,97 | 3.019 | 8,82 GB |
| 506 | 16 | 5,05 | 2.553 | 9,73 GB |
| 506 | 64 | 5,10 | 2.579 | 12,56 GB |
| 4.090 | 1 | 0,56 | 2.288 | 9,44 GB |
| 4.090 | 16 | 0,55 | 2.242 | 16,76 GB |
| 4.090 | 64 | 0,55 | 2.254 | 41,69 GB |

## Requisitos de hardware
- VRAM/memoria unificada estimada: 8,7 GB de pesos; en la practica la model card reporta entre 8,82 GB y 12,56 GB de pico con entradas de 506 tokens, y hasta 41,69 GB con batch 64 y entradas de 4.090 tokens.
- Hardware objetivo: Apple Silicon con MLX; probado en un M5 Max de 128 GB. No esta pensado para GPU NVIDIA ni CUDA.
- Cabe en Mac con memoria unificada de 16 GB para entradas cortas y batch 1; para documentos largos y batches grandes se recomienda 32 GB o mas.
- Opciones de despliegue: MLX y mlx-lm/mlx-vlm mediante el paquete `nemotron-retrieval-mlx`; servidor local con `python -m nemotron_mlx.server` que expone `/v1/embeddings` y `/v1/rerank`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en esta build.
- Throughput medido: 5,97 docs/s con entradas de 506 tokens y batch 1; 0,56 docs/s con entradas de 4.090 tokens. El throughput en tokens se mantiene estable en torno a 2.200-3.000 tokens/s independientemente del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-mlx-8bit (esta build) | 8.381 M | 32.768 | Si (texto + imagen) | openmdw-1.1 | MLX, Apple Silicon |
| nvidia/Nemotron-3.5-Embed-8B-BF16 (original) | 8.381 M | 32.768 | Si (texto + imagen) | openmdw-1.1 | safetensors, transformers/CUDA |
| Embedders de texto de 7-8B (familia no especificada) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas fiable es contra el modelo original de NVIDIA: esta build reproduce su comportamiento con una similitud coseno minima de 0,9990 y una diferencia de nDCG@10 en ViDoRe v3 de 0,0006 puntos (0,7730 frente a 0,7736). No se dispone de datos de benchmarks de otros embedders comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado ni documentado.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La cuantizacion a 8 bits introduce una degradacion pequena pero medible: la similitud coseno minima baja a 0,9990 en paginas e imagenes, y el truncado Matryoshka a 512 dimensiones reduce el nDCG@10 de 0,7730 a 0,6688.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero los embeddings pueden recuperar documentos semanticamente proximos pero factualmente irrelevantes; conviene validar con reranking.
- Licencia OpenMDW 1.1: no es una licencia permisiva tipo Apache o MIT; revisar los terminos antes de uso comercial. El modelo base Ministral-3-8B-Instruct es Apache-2.0, pero la licencia del modelo derivado es la de NVIDIA.
- Dependencia de Apple Silicon y del ecosistema MLX: no hay soporte documentado para CUDA, vLLM, llama.cpp u Ollama, lo que limita el despliegue en infraestructura tradicional.
- Un unico modelo de vision por documento y una sola imagen por documento; no se documenta soporte para multiples imagenes en una misma entrada.
- Repositorio con solo 27 descargas y 0 likes en el momento de la consulta: comunidad muy pequena, sin validacion externa independiente.
- El autor declara no estar afiliado a NVIDIA; los fallos de la conversion no deben atribuirse al modelo original.

## Enlaces
- HuggingFace (esta build): https://huggingface.co/netprojects/Nemotron-3.5-Embed-8B-mlx-8bit
- Modelo base original: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Modelo sobre el que se construye: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Codigo de conversion y servidor: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
