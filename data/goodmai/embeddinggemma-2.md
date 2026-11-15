# goodmai/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio, asi como combinaciones de estas modalidades, en un unico espacio vectorial compartido de 768 dimensiones. Con 744 millones de parametros totales, combina un backbone de texto de 270M (130M de transformer mas 140M de embedder) con encoders modulares de vision (170M) y audio (300M) que pueden cargarse de forma selectiva segun la modalidad necesaria.

El modelo esta disenado para ejecutarse en hardware de consumo, como moviles y portatiles, ofreciendo representaciones semanticas de baja latencia para aplicaciones on-device: busqueda, generacion aumentada por recuperacion (RAG), clasificacion y clustering. Soporta mas de 100 idiomas y una ventana de contexto de 8.192 tokens, suficiente para procesar varios minutos de audio o video.

Su relevancia actual radica en la unificacion nativa de cuatro modalidades en un solo espacio de embeddings, algo poco comun en modelos de este tamano, junto con soporte nativo de Matryoshka Representation Learning (MRL) que permite truncar los vectores a 128, 256 o 512 dimensiones con una perdida de calidad minima, reduciendo hasta 6 veces el coste de almacenamiento vectorial. Esta publicacion corresponde a la replica `goodmai/embeddinggemma-2` en Hugging Face del modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con encoders multimodales; atencion GQA/MQA con ventana deslizante local:global 5:1 |
| Parametros totales | 744.371.512 (~740M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (100+ idiomas segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

EmbeddingGemma 2 se construye sobre los avances arquitectonicos de Gemma 4. El backbone de texto consta de 24 capas con dimension de modelo 512, dimension oculta 2048, 4 cabezas de atencion y 2/1 cabezas KV locales/globales, con atencion GQA/MQA y una ventana deslizante de 1024 tokens en una proporcion local:global de 5:1. La activacion es una FFN con compuerta y GELU. El pooling es de tipo mean pooling y una capa de proyeccion transforma la salida de 512 a 768 dimensiones. El vocabulario es de 262.144 tokens.

Los encoders de modalidad son modulares y cargables de forma selectiva: vision con 170M de parametros y audio con 300M. El modelo incorpora Matryoshka Representation Learning (MRL) de forma nativa, permitiendo truncar los embeddings a 128, 256 y 512 dimensiones y renormalizarlos. Ademas, emplea prefijos de instruccion ligeros en texto para orientar las representaciones hacia tareas concretas (busqueda, clasificacion, clustering, similitud semantica). No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de embeddings multimodales nativos para texto (incluido codigo), imagenes, video y audio, y combinaciones de estas modalidades, en un espacio compartido de 768 dimensiones.
- Extraccion de caracteristicas de imagen (`image-feature-extraction`), audio (`audio-feature-extraction`) y video (`video-feature-extraction`).
- Similitud semantica de frases (`sentence-similarity`) y busqueda/recuperacion de informacion.
- Soporte multilingue en mas de 100 idiomas.
- Mejora de aproximadamente el 14% en tareas de codigo respecto a su predecesor (EmbeddingGemma 1).
- Representaciones dirigidas por tarea mediante prefijos de instruccion de texto.
- Truncamiento de embeddings via MRL a 128, 256 y 512 dimensiones.
- Procesamiento de varios minutos de audio o video gracias a la ventana de contexto de 8.192 tokens.
- Carga selectiva de encoders de modalidad para ajustar el consumo de recursos.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso agentico en la informacion disponible (es un modelo de embeddings, no generativo).

## Casos de uso

- Busqueda semantica on-device: el modelo puede generar embeddings de consultas y documentos en moviles o portatiles con baja latencia, gracias a su tamano de 740M y su backbone de texto de 270M, permitiendo busqueda local sin conexion.
- RAG (generacion aumentada por recuperacion): indexacion de bases de conocimiento multimodales (texto, imagenes, audio) en un unico espacio vectorial de 768 dimensiones, con truncamiento MRL a 256d para reducir costes de almacenamiento manteniendo calidad.
- Clasificacion y clustering de contenido: agrupacion de documentos, imagenes o fragmentos de audio por similitud semantica usando los prefijos de instruccion para orientar las representaciones hacia la tarea de clustering.
- Recuperacion de documentos visuales: busqueda de capturas de pantalla, PDFs escaneados o presentaciones mediante el encoder de vision y el benchmark MMEB VisDoc, adecuado para sistemas de gestion documental.
- Busqueda en archivos de audio y video: indexacion de podcasts, reuniones o videotecas usando el encoder de audio (300M) y la ventana de 8.192 tokens, que cubre varios minutos de contenido por fragmento.
- Deteccion de duplicados y similitud entre modalidades: comparacion de una imagen con su descripcion textual o de un fragmento de audio con una transcripcion, gracias al espacio vectorial unificado.
- Filtrado y moderacion de contenido: clasificacion semantica de textos e imagenes con embeddings truncados a 128d para minimizar latencia y almacenamiento en pipelines de alto volumen.
- Busqueda de codigo: recuperacion de fragmentos de codigo relevantes en repositorios, con una mejora de aproximadamente el 14% en tareas de codigo respecto a la version anterior.

## Benchmarks y rendimiento

Resultados de evaluacion con el checkpoint de precision completa y embeddings de 768 dimensiones:

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingue, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 65,67 | - |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | - |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | - |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | - |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | - |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,87 | - |

Resultados con truncamiento de vectores (MRL):

| Dimension | Ratio de compresion | MTEB multilingue v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 global | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completo) | 1:1 | 61,36 | 68,46 | 78,68 | 65,67 | 59,01 | 69,54 | 49,87 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 65,34 | 58,38 | 69,18 | 49,76 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 64,16 | 56,24 | 66,76 | 49,13 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,97 | 45,65 | 56,71 | 47,28 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. El tamano del repositorio es de 1,5 GB, lo que da una referencia del peso en precision completa (safetensors).
- GPU recomendadas: no disponible. El modelo esta disenado para hardware de consumo (moviles y portatiles) segun la model card.
- Cabe en GPU de consumo: si, segun el diseno declarado para hardware de consumo; no se especifican modelos concretos de GPU.
- Opciones de despliegue: la libreria indicada es `transformers`; la model card menciona `sentence-transformers` para el arranque rapido. No se detallan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | MTEB multilingue v2 | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | ~740M | 8.192 tokens | Texto, imagen, video, audio | 61,36 | Apache 2.0 |
| EmbeddingGemma 1 | No disponible | No disponible | Texto | 61,15 | No disponible en la informacion |

No se dispone de datos de otros modelos comparables (por ejemplo, otros modelos de embeddings multimodales de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, codigo ni respuestas, solo representaciones vectoriales.
- Riesgo de alucinacion no aplica en el sentido generativo, pero las representaciones pueden producir recuperaciones irrelevantes en dominios muy especializados.
- El truncamiento a 128 dimensiones degrada notablemente el rendimiento multimodal (MMEB v2 global cae a 45,65 frente a 59,01 en 768d); la model card recomienda 128d solo para cargas de trabajo de solo texto.
- La calidad en audio y video es inferior a la de texto e imagen (MAEB 49,87 y MMEB Video 50,67 frente a MTEB code 78,68), lo que limita su uso en tareas exigentes de estas modalidades.
- No se documentan sesgos conocidos en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los terminos exactos en la documentacion oficial de Gemma.
- Esta ficha corresponde a la replica `goodmai/embeddinggemma-2`, con 0 descargas y 0 likes en el momento de la consulta; no es el repositorio oficial de Google.
- No se dispone de informacion sobre cuantizaciones soportadas ni sobre rendimiento en produccion.

## Enlaces

- Repositorio en Hugging Face (replica): https://huggingface.co/goodmai/embeddinggemma-2
- Modelo original en Hugging Face: https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.37364
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
