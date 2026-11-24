# netprojects/Nemotron-3.5-Embed-1B-mlx-bf16

## Resumen

Nemotron-3.5-Embed-1B-mlx-bf16 es la conversion a MLX del modelo de embeddings multimodal nvidia/Nemotron-3.5-Embed-1B-BF16, desarrollado originalmente por NVIDIA y adaptado para Apple Silicon por NetProjects. El modelo resuelve el problema de recuperacion de informacion (retrieval) en un espacio vectorial unificado: consultas de texto y documentos que pueden ser texto o imagenes de pagina se proyectan en el mismo espacio, lo que permite busqueda semantica sobre corpus mixtos sin pipelines separados.

La arquitectura deriva de mistralai/Ministral-3-3B-Instruct-2512-BF16 (Apache-2.0) e incorpora una torre de lenguaje de 1.554.710.528 parametros totales, un encoder de vision y un proyector, con pooling de media y normalizacion L2 calculados en float32. Soporta contexto de hasta 32.768 tokens, embeddings Matryoshka (dimensiones reducidas como 512 o 1024) y un unico formato de entrada por documento (texto o imagen de pagina).

La relevancia actual radica en que es una de las pocas builds MLX de un modelo de embeddings multimodal de NVIDIA, lo que permite ejecutar retrieval con imagenes de pagina en hardware Apple Silicon sin depender de CUDA. El repositorio mantiene precision bf16 en la torre de lenguaje y en el encoder de vision, con un tamano de 3,0 GB, y declara fidelidad numerica practicamente identica al codigo original de NVIDIA en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje derivada de Ministral-3-3B-Instruct-2512, encoder de vision y proyector) |
| Parametros totales | 1.554.710.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (esta build); no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | en |
| Licencia | OpenMDW License Agreement version 1.1 (openmdw-1.1); modelo base construido sobre Ministral-3-3B-Instruct-2512 (Apache-2.0) |
| Formato de pesos | safetensors (MLX, bf16) |

## Arquitectura y entrenamiento

El modelo es un encoder de retrieval multimodal construido sobre Ministral-3-3B-Instruct-2512-BF16. La torre de lenguaje se mantiene en bf16, mientras que el encoder de vision y el proyector tambien se conservan en bf16; las normas, el mean pooling y la normalizacion L2 se calculan en float32. La salida son vectores L2-normalizados, de modo que la similitud coseno se obtiene con un producto escalar. Soporta embeddings Matryoshka, lo que permite truncar la dimension del vector (por ejemplo a 512 o 1024) con perdida controlada de rendimiento.

Las entradas siguen el chat template de NVIDIA: las consultas se prefijan con `query: …` y los documentos con `passage: …`. Cada documento admite un unico elemento, ya sea texto o una imagen de pagina. La build se convirtio desde la revision upstream `e24ca1e346bcc53572bd7bdc02b3e8ebf66c197c` y no documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card original de NVIDIA, que no se incluye aqui.

La innovacion tecnica destacable de esta build es la fidelidad numerica respecto al codigo de referencia: la tokenizacion es identica en todas las entradas y la similitud coseno minima medida frente a NVIDIA en float32 es de 0,9999, con coincidencia total en top-1 y top-10 en los conjuntos de prueba.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion (pipeline `feature-extraction`, tarea `sentence-similarity`).
- Embeddings multimodales: consultas de texto contra documentos de texto o imagenes de pagina en el mismo espacio vectorial.
- Retrieval de documentos largos, con soporte de hasta 32.768 tokens por entrada.
- Embeddings Matryoshka: truncado de dimensiones (por ejemplo 512 o 1024) para reducir coste de almacenamiento y busqueda.
- Servidor local con endpoints estilo OpenAI `/v1/embeddings` y estilo Cohere/Jina `/v1/rerank`, con imagenes en data URL o base64.
- Soporte de un unico formato de entrada por documento (texto o imagen), no combinaciones multiples en la misma entrada.
- Capacidades multilingues limitadas al ingles (`en`) segun la informacion disponible.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni generacion de texto.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica: el modelo indexa fragmentos de hasta 32.768 tokens y permite consultas en lenguaje natural con similitud coseno directa, adecuado para bases de conocimiento internas en ingles.
- Recuperacion sobre paginas escaneadas: al aceptar imagenes de pagina como documentos, se puede construir un indice de PDFs escaneados sin OCR previo, usando el encoder de vision para proyectar la pagina al mismo espacio que las consultas de texto.
- Reranking en pipelines RAG: el servidor local expone `/v1/rerank` estilo Cohere/Jina, de modo que se puede insertar como segunda etapa tras un retrieval inicial por BM25 o embeddings ligeros.
- Busqueda multimodal en informes y articulos cientificos: mezcla de abstracts de texto y figuras o tablas como imagenes en un unico indice, util para revisiones de literatura en ingles.
- Deduplicacion y clustering de documentos: los vectores L2-normalizados y las dimensiones Matryoshka reducidas (512) permiten agrupar grandes volumenes con coste de almacenamiento bajo.
- Despliegue en estaciones de trabajo Apple Silicon: la build MLX permite ejecutar el modelo en local sin GPU NVIDIA, con un pico de memoria medido de 2,64 GB en inferencia de texto por lotes de 1.
- Prototipado de sistemas de recomendacion basados en contenido: similitud entre descripciones de texto e imagenes de catalogo dentro del mismo espacio vectorial.

## Benchmarks y rendimiento

Resultados medidos en esta build MLX, comparados con el codigo de referencia de NVIDIA en float32 y con las puntuaciones publicadas por NVIDIA.

| Prueba | Metrica | Esta build | Referencia NVIDIA |
|---|---|---|---|
| SciFact (200 consultas y abstracts) | Coseno minimo / medio vs NVIDIA | 0,9999 / 1,0000 | — |
| SciFact (200 consultas y abstracts) | Top-1 coincidente | 40/40 | — |
| SciFact (200 consultas y abstracts) | Solapamiento top-10 | 1,00 | — |
| Documentos largos (4K+ tokens) e imagenes de pagina (52 entradas) | Coseno minimo / medio vs NVIDIA | 0,9999 / 1,0000 | — |
| Documentos largos e imagenes de pagina | Top-1 coincidente | 10/10 | — |
| ViDoRe v3 Computer Science (ingles), 1.360 imagenes de pagina | nDCG@10 | 0,7645 | 0,7642 (publicado por NVIDIA en MTEB) |
| ViDoRe v3 Computer Science, vectores Matryoshka 1024-d | nDCG@10 | 0,7561 | — |
| ViDoRe v3 Computer Science, vectores Matryoshka 512-d | nDCG@10 | 0,7286 | — |
| ViDoRe v3 Computer Science | Recall@100 | 0,9717 | — |
| SciFact (BEIR), 300 consultas y 5.183 abstracts | nDCG@10 | 0,7501 | — |
| SciFact (BEIR) | Recall@100 | 0,96 | — |

Rendimiento de inferencia de texto (documentos por segundo, con otros servidores de modelos detenidos):

| Tokens por entrada | Lote | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 46,7 | 23.629 | 2,64 GB |
| 506 | 16 | 59,2 | 29.956 | 3,16 GB |
| 506 | 64 | 56,25 | 28.462 | 4,47 GB |
| 4090 | 1 | 3,94 | 16.124 | 2,95 GB |
| 4090 | 16 | 3,99 | 16.307 | 6,7 GB |
| 4090 | 64 | 3,93 | 16.087 | 19,97 GB |

Las mediciones de velocidad se realizaron en un Apple M5 Max de 128 GB. No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible, dado que el modelo es un encoder de embeddings y no un modelo generativo.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 2,64 GB de pico con lote de 1 y entradas de 506 tokens; 3,16 GB con lote de 16; 4,47 GB con lote de 64. Para entradas de 4.096 tokens el pico sube a 2,95 GB con lote de 1 y hasta 19,97 GB con lote de 64.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada, plataforma sobre la que se midieron los resultados.
- Cabe en GPU de consumo: si, en tarjetas con al menos 5 GB de VRAM efectiva para lotes pequenos en bf16; no se documentan pruebas en RTX 4090, A100 ni H100 en la informacion disponible.
- Opciones de despliegue: libreria MLX mediante el paquete `nemotron_mlx` (instalable desde `git+https://github.com/internet-projects/nemotron-retrieval-mlx`), y servidor local integrado con `python -m nemotron_mlx.server --embed netprojects/Nemotron-3.5-Embed-1B-mlx-bf16 --port 8095`, que expone `/v1/embeddings` y `/v1/rerank`.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI para esta build MLX en la informacion disponible.
- Throughput medido: 46,7 docs/s con lote de 1 y entradas de 506 tokens; 59,2 docs/s con lote de 16; 56,25 docs/s con lote de 64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-mlx-bf16 (esta build) | 1.554.710.528 | 32.768 tokens | Texto e imagen de pagina | OpenMDW 1.1 | safetensors MLX bf16 |
| nvidia/Nemotron-3.5-Embed-1B-BF16 | no disponible en la informacion proporcionada | 32.768 tokens | Texto e imagen de pagina | OpenMDW 1.1 | safetensors (transformers) |
| Ministral-3-3B-Instruct-2512-BF16 | no disponible en la informacion proporcionada | no disponible | Texto | Apache-2.0 | safetensors |

La comparacion con alternativas de la misma categoria (modelos de embeddings multimodales de ~1B parametros) no esta disponible en la informacion proporcionada. El modelo base de NVIDIA es la referencia directa y comparte arquitectura y pesos, diferenciandose unicamente en el formato y la libreria de ejecucion.

## Limitaciones y advertencias

- Idioma: el modelo declara soporte unicamente de ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Entrada por documento: cada documento admite un unico elemento, texto o imagen, no combinaciones de texto e imagen en la misma entrada.
- No es un modelo generativo: no produce texto, codigo ni respuestas; solo vectores de embedding. No dispone de tool calling ni de razonamiento multi-paso.
- Fidelidad numerica: aunque la similitud coseno frente a NVIDIA es de 0,9999 en las pruebas, no es una igualdad exacta; en produccion con umbrales muy ajustados conviene validar con el conjunto propio.
- Licencia: OpenMDW 1.1 no es una licencia permisiva tipo Apache o MIT; es necesario revisar el archivo `LICENSE` del repositorio antes de un uso comercial. El modelo base Ministral-3-3B-Instruct-2512 es Apache-2.0, segun el aviso `NOTICE`.
- Sesgos: no se documentan en la informacion disponible evaluaciones de sesgo del modelo original ni de esta build.
- Alucinacion: al ser un encoder de retrieval, el riesgo se traslada al pipeline aguas abajo; un retrieval con recall imperfecto (Recall@100 de 0,96 en SciFact) puede omitir documentos relevantes.
- Dependencia de plataforma: la build esta pensada para Apple Silicon y la libreria MLX; no se garantiza su funcionamiento en CUDA ni en CPU sin MLX.
- Repositorio con 0 likes y 389 descargas en el momento de la consulta: comunidad pequena, sin soporte documentado mas alla del repositorio de codigo.
- No afiliado a NVIDIA: el mantenimiento corre a cargo de NetProjects y la responsabilidad sobre el modelo original recae en NVIDIA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Nemotron-3.5-Embed-1B-mlx-bf16
- Modelo base en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Codigo de conversion y servidor: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
