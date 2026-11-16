# jasontread/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio —y combinaciones de estos— en un unico espacio vectorial compartido de 768 dimensiones. Con 740 millones de parametros totales, combina un backbone de texto de 270M (130M de transformer mas 140M de embedder) con encoders modulares de vision (170M) y audio (300M) que pueden cargarse de forma selectiva segun la modalidad necesaria.

El modelo esta disenado para ejecutarse en hardware de consumo, como moviles y portatiles, ofreciendo representaciones semanticas de baja latencia para busqueda, generacion aumentada por recuperacion (RAG), clasificacion y clustering en el propio dispositivo. Se apoya en la arquitectura de Gemma 4 y anade soporte nativo de Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256 o 512 dimensiones con una perdida minima de calidad.

La relevancia actual del modelo reside en su enfoque unificado: en lugar de mantener pipelines separados para cada modalidad, EmbeddingGemma 2 ofrece un unico espacio de 768 dimensiones, una ventana de contexto de 8.192 tokens y soporte para mas de 100 idiomas, todo bajo licencia Apache 2.0. El repositorio publicado por jasontread replica la model card oficial de Google DeepMind.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion GQA/MQA, ventana deslizante, pooling por media y proyeccion 512→768 |
| Parametros totales | 740M (744.371.512 segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (mas de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo emplea un backbone de texto de 24 capas con dimension de modelo 512, dimension oculta 2.048 y un vocabulario de 262.144 tokens. La atencion combina GQA y MQA con 4 cabezas de atencion y 2/1 cabezas KV (local/global) en una proporcion 5:1, con ventana deslizante de 1.024 tokens. La activacion es una FFN con compuerta y GELU. El pooling es por media y una capa de proyeccion transforma la salida de 512 a 768 dimensiones. Los encoders de modalidad son modulares: vision (170M) y audio (300M), cargables de forma selectiva.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es el soporte nativo de Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256 y 512 dimensiones con renaturalizacion, reduciendo hasta 6 veces el coste de almacenamiento vectorial. Tambien incorpora representaciones dirigidas por tarea mediante prefijos de instruccion de texto ligeros para optimizar los embeddings segun la tarea (busqueda, clasificacion, clustering, similitud semantica).

## Capacidades

- Generacion de embeddings multimodales nativos para texto (incluido codigo), imagenes, video y audio, y combinaciones de estos, en un unico espacio de 768 dimensiones.
- Similitud semantica y sentence-similarity multilingue en mas de 100 idiomas.
- Recuperacion y busqueda semantica (retrieval) sobre documentos, imagenes, video y audio.
- Representaciones dirigidas por tarea mediante prefijos de instruccion de texto.
- Truncamiento de embeddings via MRL a 128, 256 y 512 dimensiones con renaturalizacion.
- Extraccion de caracteristicas de imagen, audio y video (image-feature-extraction, audio-feature-extraction, video-feature-extraction).
- Procesamiento de minutos de audio o video gracias a la ventana de contexto de 8.192 tokens.
- No se menciona soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Busqueda semantica en aplicaciones moviles: el modelo cabe en hardware de consumo y genera embeddings de baja latencia, lo que permite indexar y consultar contenido localmente sin enviar datos a la nube.
- RAG multimodal en el dispositivo: al unificar texto, imagen, audio y video en un mismo espacio, se pueden recuperar fragmentos relevantes de cualquier modalidad para alimentar a un modelo generador.
- Clasificacion y clustering de documentos: los embeddings de 768 dimensiones y el truncamiento MRL a 256 dimensiones permiten agrupar grandes volumenes de texto con un coste de almacenamiento reducido.
- Busqueda de codigo: el modelo mejora un 14% en tareas de codigo respecto a su predecesor, con un MTEB code de 78,68, lo que lo hace util para recuperacion de fragmentos de codigo en repositorios.
- Recuperacion de documentos visuales: con MMEB v2 VisDoc de 67,84 NDCG@5, es adecuado para indexar y recuperar paginas escaneadas, capturas o presentaciones.
- Busqueda en archivos de audio y video: con MSEB Retrieval de 69,54 MRR@10 y MMEB v2 Video de 50,67 Hit@1, permite localizar fragmentos por contenido semantico en grabaciones.
- Deduplicacion y similitud semantica multilingue: el soporte de mas de 100 idiomas facilita comparar contenido entre idiomas en un unico espacio vectorial.

## Benchmarks y rendimiento

Resultados a 768 dimensiones con el checkpoint de precision completa, segun la model card:

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 65,67 | No disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | No disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | No disponible |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | No disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | No disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,87 | No disponible |

Resultados con truncamiento vectorial (MRL):

| Dimension | Ratio | MTEB multi v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d | 1:1 | 61,36 | 68,46 | 78,68 | 65,67 | 59,01 | 69,54 | 49,87 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 65,34 | 58,38 | 69,18 | 49,76 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 64,16 | 56,24 | 66,76 | 49,13 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,97 | 45,65 | 56,71 | 47,28 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,5 GB en safetensors; en precision completa se requiere aproximadamente 3 GB de VRAM (740M parametros a 16 bits mas overhead). Las cuantizaciones no estan documentadas.
- GPU recomendadas: el modelo esta disenado para hardware de consumo (moviles y portatiles), por lo que cabe en GPUs de gama media y en CPU. No se especifican modelos concretos de GPU en la informacion disponible.
- Cabe en GPU de consumo: si, dado su tamano de 740M parametros y su orientacion a dispositivos.
- Opciones de despliegue: la model card menciona la libreria sentence-transformers y transformers. No se detallan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card indica baja latencia para aplicaciones en dispositivo, pero no proporciona cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Multimodal | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8.192 tokens | 768 (MRL 128/256/512) | Si (texto, imagen, video, audio) | Apache 2.0 |
| EmbeddingGemma 1 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos sobre otros modelos de embeddings comparables (parametros, contexto, rendimiento o licencia) para ampliar la comparativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo.
- Riesgo de alucinacion: al ser un modelo de embeddings y no generativo, el riesgo se traslada a representaciones imprecisas o recuperaciones erroneas; no se detalla su magnitud.
- Los embeddings truncados a 128 dimensiones degradan notablemente el rendimiento multimodal (MMEB v2 cae de 59,01 a 45,65), por lo que la model card recomienda 128d solo para cargas de trabajo de solo texto.
- La ventana de contexto esta limitada a 8.192 tokens; no se especifica el comportamiento mas alla de ese limite.
- No se documentan restricciones de licencia para uso comercial mas alla de la licencia Apache 2.0 indicada.
- El repositorio analizado (jasontread/embeddinggemma-2) tiene 0 descargas y 0 likes, y replica la model card oficial de Google DeepMind; conviene verificar la procedencia de los pesos antes de usarlo en produccion.
- No se dispone de informacion sobre cuantizacion, opciones de despliegue distintas de sentence-transformers/transformers ni cifras de latencia o throughput.

## Enlaces

- Hugging Face (repositorio analizado): https://huggingface.co/jasontread/embeddinggemma-2
- Hugging Face (modelo oficial): https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.37364
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
