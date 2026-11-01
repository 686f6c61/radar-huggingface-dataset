# netprojects/Nemotron-3.5-Embed-1B-mlx-bf16

## Resumen

Nemotron-3.5-Embed-1B-mlx-bf16 es la conversion a MLX del modelo de embeddings multimodal Nemotron-3.5-Embed-1B-BF16 desarrollado por NVIDIA. Lo publica el usuario netprojects (NetProjects), que no tiene vinculacion con NVIDIA y solo cambia el formato para que el modelo pueda ejecutarse de forma nativa en Apple Silicon. El modelo original esta pensado para recuperacion de informacion (retrieval): proyecta consultas de texto y documentos (texto o imagenes de pagina) en un mismo espacio vectorial, de modo que una pregunta textual puede recuperar tanto pasajes escritos como paginas escaneadas o capturas.

Arquitectonicamente deriva de mistralai/Ministral-3-3B-Instruct-2512-BF16 (Apache-2.0) y se presenta como un modelo de tipo mistral3 con torre de lenguaje, codificador de vision y proyector. Cuenta con 1.554.710.528 parametros totales segun los pesos safetensors, una ventana de hasta 32.768 tokens y soporte de embeddings Matryoshka (vectores truncables a 1024 o 512 dimensiones sin reentrenar). Su relevancia ahora radica en que ofrece retrieval multimodal de calidad competitiva (nDCG@10 de 0.7645 en ViDoRe v3 Computer Science) con una huella de memoria moderada (2,64 GB en inferencia de texto) y una fidelidad numerica practicamente identica a la implementacion de referencia de NVIDIA en float32.

Esta build concreta esta orientada a equipos Apple Silicon: usa la libreria MLX, mantiene la torre de lenguaje en bf16, conserva el codificador de vision y el proyector en bf16 y calcula pooling y normalizacion L2 en float32. El repositorio ocupa 3,1 GB y la licencia es OpenMDW 1.1, la misma del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo mistral3 (torre de lenguaje + codificador de vision + proyector) |
| Parametros totales | 1.554.710.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (esta build); no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un encoder de embeddings multimodal construido sobre Ministral-3-3B-Instruct-2512-BF16. Incorpora una torre de lenguaje, un codificador de vision y un proyector que alinea ambas modalidades en un unico espacio vectorial; las consultas se formatean con el prefijo `query: …` y los documentos con `passage: …` a traves de la plantilla de chat de NVIDIA. El pooling es de tipo mean pooling seguido de normalizacion L2, calculados en float32 en esta build para preservar la precision. Admite una imagen por documento y hasta 32.768 tokens de entrada. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion practica de esta publicacion es la conversion a MLX con fidelidad numerica verificada: la similitud coseno frente al codigo de referencia de NVIDIA en float32 es de 0.9999 (minimo) y 1.0000 (media) tanto en SciFact como en documentos largos y paginas de imagen, con coincidencia total en top-1 y top-10. Ademas, el modelo soporta embeddings Matryoshka, lo que permite truncar los vectores a 1024 o 512 dimensiones manteniendo buena parte del rendimiento (nDCG@10 de 0.7561 y 0.7286 respectivamente en ViDoRe v3 CS).

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion (sentence-similarity, retrieval).
- Embeddings multimodales: procesa texto e imagenes de pagina en el mismo espacio vectorial, permitiendo consultas de texto contra documentos escaneados.
- Soporte de documentos compuestos: acepta entradas con texto e imagen simultaneamente (por ejemplo, una figura con su pie de foto).
- Embeddings Matryoshka: truncado a 1024 o 512 dimensiones para reducir coste de almacenamiento y busqueda.
- Normalizacion L2 de los vectores, de modo que la similitud coseno se obtiene con un simple producto escalar.
- Servidor local compatible con la API `/v1/embeddings` (estilo OpenAI) y `/v1/rerank` (estilo Cohere/Jina).
- Capacidades multilingues: solo ingles segun la model card.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento (thinking), al tratarse de un modelo de embeddings y no generativo.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y articulos como `passage:` y consultar con `query:`, aprovechando la ventana de 32.768 tokens para pasajes largos sin trocear en exceso.
- Recuperacion sobre PDFs escaneados: al aceptar imagenes de pagina, permite buscar directamente sobre paginas renderizadas sin necesidad de OCR previo, util en archivos historicos o documentos con maquetacion compleja.
- RAG multimodal: alimentar un pipeline de generacion aumentada con contexto recuperado tanto de texto como de figuras y tablas, usando el endpoint `/v1/embeddings` del servidor incluido.
- Reranking de resultados: emplear el endpoint `/v1/rerank` para reordenar candidatos de un buscador previo y mejorar la precision final.
- Clasificacion y deduplicacion de documentos: calcular similitudes entre embeddings para agrupar documentos casi identicos o detectar duplicados en corpus grandes.
- Busqueda en bases de conocimiento cientificas: el rendimiento medido en SciFact (nDCG@10 de 0.7501) lo hace adecuado para recuperacion de literatura cientifica en ingles.
- Prototipado local en Mac: desarrollar y validar pipelines de retrieval en un portatil con Apple Silicon antes de desplegar en infraestructura con GPU, gracias a que la build MLX corre de forma nativa.
- Indexacion con vectores reducidos: usar dimensiones Matryoshka de 512 para reducir el almacenamiento del indice vectorial a costa de una perdida moderada de calidad (0.7286 frente a 0.7645 en ViDoRe v3 CS).

## Benchmarks y rendimiento

Resultados medidos en esta build frente a la implementacion de referencia de NVIDIA en float32:

| Test | Entradas | Coseno a NVIDIA (min / media) | Mismo top-1 | Solapamiento top-10 |
|---|---|---|---|---|
| SciFact (consultas y abstracts) | 200 | 0.9999 / 1.0000 | 40/40 | 1.00 |
| Documentos largos (4K+ tokens) y paginas de imagen | 52 (3 largos, 8 imagen) | 0.9999 / 1.0000 | 10/10 | 1.00 |

Recuperacion sobre imagenes de pagina, ViDoRe v3 Computer Science (ingles, 1.360 imagenes, nDCG@10 segun MTEB):

| Configuracion | nDCG@10 | Recall@100 |
|---|---|---|
| Esta build | 0.7645 | 0.9717 |
| Puntuacion publicada por NVIDIA (modelo original) | 0.7642 | no disponible |
| Esta build, Matryoshka 1024 d | 0.7561 | no disponible |
| Esta build, Matryoshka 512 d | 0.7286 | no disponible |

Recuperacion de texto, SciFact (BEIR), conjunto de test completo (300 consultas, 5.183 abstracts): nDCG@10 de 0.7501 y Recall@100 de 0.96.

Rendimiento de inferencia de texto (documentos por segundo):

| Tokens por entrada | Batch | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 46.7 | 23.629 | 2.64 GB |
| 506 | 16 | 59.2 | 29.956 | 3.16 GB |
| 506 | 64 | 56.25 | 28.462 | 4.47 GB |
| 4090 | 1 | 3.94 | 16.124 | 2.95 GB |
| 4090 | 16 | 3.99 | 16.307 | 6.7 GB |
| 4090 | 64 | 3.93 | 16.087 | 19.97 GB |

## Requisitos de hardware

- VRAM/memoria estimada: alrededor de 2,64 GB de memoria pico en inferencia de texto con batch 1 y entradas de 506 tokens; sube a 4,47 GB con batch 64. Con entradas de 4.096 tokens la memoria pico alcanza 2,95 GB (batch 1) y 19,97 GB (batch 64).
- GPU recomendadas: el modelo esta pensado para Apple Silicon (probado en Apple M5 Max de 128 GB); los datos de la tabla con entradas de 4.096 tokens corresponden a una RTX 4090.
- Cabe en GPU de consumo: si, tanto en Apple Silicon como en una RTX 4090 para las configuraciones medidas.
- Opciones de despliegue: MLX con el paquete `nemotron_mlx` (`pip install git+https://github.com/internet-projects/nemotron-retrieval-mlx`), servidor local incluido con endpoints `/v1/embeddings` y `/v1/rerank`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 46,7 documentos/s (23.629 tokens/s) con batch 1 en Apple Silicon; 59,2 documentos/s (29.956 tokens/s) con batch 16. En RTX 4090, 3,94 documentos/s con batch 1 y 3,99 con batch 16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-mlx-bf16 (esta build) | 1.554.710.528 | 32.768 tokens | Texto + imagen de pagina | OpenMDW 1.1 | HuggingFace (netprojects) |
| nvidia/Nemotron-3.5-Embed-1B-BF16 | no disponible en la informacion | 32.768 tokens | Texto + imagen de pagina | OpenMDW 1.1 | HuggingFace (nvidia) |
| Ministral-3-3B-Instruct-2512-BF16 (modelo base) | no disponible en la informacion | no disponible | Texto | Apache-2.0 | HuggingFace (mistralai) |

No se dispone de datos de benchmarks de modelos comparables de terceros en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan capacidades multilingues.
- Es un modelo de embeddings, no generativo: no produce texto, razonamiento ni codigo.
- Admite una sola imagen por documento; no se documenta soporte de multiples imagenes por pasaje.
- La licencia OpenMDW 1.1 es distinta de Apache-2.0 y debe revisarse antes de uso comercial; el repositorio incluye el acuerdo completo en `LICENSE`.
- Esta build esta pensada exclusivamente para MLX y Apple Silicon; no es portable directamente a otros runtimes sin conversion.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible (al no ser generativo, el riesgo de alucinacion se traslada al sistema que consuma los embeddings).
- La calidad en documentos muy largos o idiomas distintos del ingles no esta medida en la informacion disponible.
- El autor de la conversion no esta afiliado a NVIDIA; cualquier incidencia debe contrastarse con el modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netprojects/Nemotron-3.5-Embed-1B-mlx-bf16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Codigo de conversion y servidor: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
- Modelo base Ministral: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
