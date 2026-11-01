# Ninja66666/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio —y combinaciones de ellos— en un único espacio vectorial compartido de 768 dimensiones. Con 740 millones de parámetros totales, combina un backbone de texto de 270M (130M de transformer más 140M de embedder) con encoders modulares de visión (170M) y audio (300M) que se pueden cargar de forma selectiva, de modo que el desarrollador solo paga el coste computacional de las modalidades que realmente necesita.

El modelo está diseñado para ejecutarse en hardware de consumo (móviles, portátiles) y ofrece representaciones semánticas de baja latencia para búsqueda, RAG, clasificación y clustering en dispositivo. Incorpora Matryoshka Representation Learning (MRL) con soporte nativo de truncado a 128, 256, 512 y 768 dimensiones, lo que permite reducir hasta 6 veces el almacenamiento de vectores con un impacto mínimo en calidad, y utiliza prefijos de instrucción ligeros para orientar las representaciones a tareas concretas.

La relevancia actual del modelo radica en su enfoque multimodal unificado: en lugar de mantener pipelines separados para texto, imagen y audio, ofrece un único espacio de embeddings de 768d que permite búsqueda cruzada entre modalidades con una ventana de contexto de 8.192 tokens. Se publica bajo licencia Apache 2.0, lo que facilita su uso comercial, y esta ficha concreta corresponde a la réplica alojada por el usuario Ninja66666 en HuggingFace (28 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención GQA/MQA, ventana deslizante y proporción local:global 5:1; encoders multimodales modulares |
| Parametros totales | 744.371.512 (≈740M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (100+ idiomas según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

Otros datos técnicos relevantes: 24 capas, dimensión de modelo 512, dimensión oculta 2048, vocabulario de 262.144 tokens, 4 cabezas de atención, 2/1 KV-heads (local/global), activación Gated FFN con GELU, mean pooling y capa de proyección 512→768. Dimensión nativa de salida 768, con truncado MRL a 128, 256 y 512.

## Arquitectura y entrenamiento

EmbeddingGemma 2 se construye sobre los avances arquitectónicos de Gemma 4. El backbone de texto es un transformer de 24 capas con dimensión de modelo 512 y dimensión oculta 2048, que emplea atención con query grouping (GQA) y multi-query (MQA), con 4 cabezas de atención y 2/1 KV-heads en capas locales/globales. Usa una ventana deslizante de 1.024 tokens con una proporción local:global de 5:1, activación Gated FFN con GELU, mean pooling sobre las representaciones y una capa de proyección final de 512 a 768 dimensiones. El backbone de texto se descompone en 130M de transformer y 140M de embedder.

A este backbone se le acoplan de forma modular un encoder de visión de 170M parámetros y un encoder de audio de 300M, que se pueden cargar selectivamente según la modalidad requerida. El modelo soporta Matryoshka Representation Learning de forma nativa, lo que permite truncar las representaciones a 128d, 256d, 512d o 768d y renormalizarlas. También incorpora representaciones guiadas por tarea mediante prefijos de instrucción de texto ligeros, que optimizan los embeddings para búsqueda, clasificación, clustering o similitud semántica. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de embeddings de texto, incluido código, en un espacio vectorial de 768 dimensiones.
- Embeddings de imagen y extracción de características visuales.
- Embeddings de vídeo, con capacidad de procesar minutos de vídeo gracias a la ventana de 8.192 tokens.
- Embeddings de audio y extracción de características de audio.
- Embeddings multimodales combinados: permite mezclar texto, imagen, vídeo y audio en un mismo espacio vectorial para búsqueda cruzada entre modalidades.
- Multilingüismo: comprensión de más de 100 idiomas.
- Soporte de truncado MRL a 128d, 256d y 512d para reducir almacenamiento.
- Representaciones guiadas por tarea mediante prefijos de instrucción (búsqueda, clasificación, clustering, similitud semántica).
- Mejora de aproximadamente un 14% en tareas de código respecto a su predecesor, según la model card.
- No se ha documentado soporte de tool calling ni de razonamiento multi-paso, ya que se trata de un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica en dispositivo: el modelo puede indexar y consultar documentos localmente en portátiles y móviles gracias a su tamaño de 740M parámetros y su baja latencia, sin necesidad de infraestructura GPU en la nube.
- RAG (retrieval-augmented generation): genera embeddings de fragmentos de texto y de consultas para recuperar contexto relevante que alimente a un LLM generativo, con la ventaja de que el truncado MRL a 256d reduce el coste de almacenamiento del índice vectorial.
- Búsqueda multimodal cruzada: permite buscar imágenes a partir de una consulta de texto, o audio a partir de una descripción textual, al compartir un único espacio de 768 dimensiones entre modalidades.
- Clasificación y clustering de contenido: los embeddings sirven para agrupar documentos, imágenes o clips de audio por similitud semántica, útil en sistemas de moderación, deduplicación o organización de catálogos.
- Recuperación de código: con una mejora del ~14% en tareas de código respecto a EmbeddingGemma 1, es adecuado para construir índices de repositorios y motores de búsqueda de fragmentos de código en herramientas de desarrollo.
- Procesamiento de vídeo y audio a escala: la ventana de 8.192 tokens permite embeber minutos de audio o vídeo para sistemas de búsqueda dentro de archivos multimedia, transcripción semántica o detección de contenido similar.
- Sistemas de recomendación: la combinación de texto, imagen y audio en un mismo espacio vectorial permite calcular similitud entre ítems de distinta naturaleza para generar recomendaciones.

## Benchmarks y rendimiento

Resultados publicados en la model card (checkpoint en precisión completa, 768d):

| Modalidad | Benchmark | Métrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | No disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | No disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | No disponible |
| Vídeo | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | No disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | No disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,39 | No disponible |

Resultados con truncado vectorial (MRL):

| Dimensión | Compresión | MTEB multilingual v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 overall | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,5 GB en safetensors, lo que corresponde a los pesos en precisión completa (fp32) o bf16 según el checkpoint; en bf16 el modelo rondaría 1,5 GB de VRAM, y con cuantización a 8 bits o 4 bits podría reducirse aproximadamente a la mitad o a un cuarto, aunque no se han publicado cifras oficiales de cuantización.
- GPU recomendadas: al estar diseñado para hardware de consumo, cabe en GPUs de gama media y en dispositivos móviles; para cargas de producción con alto throughput se recomendarían GPUs de centro de datos como A100 o H100, aunque no hay datos oficiales de throughput.
- Cabe en GPU de consumo: sí, por su tamaño de 740M parámetros es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores, y para ejecución en CPU.
- Opciones de despliegue: la model card indica el uso de la librería `sentence-transformers` y `transformers`; no se documentan explícitamente otras opciones como vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo de embeddings con pesos safetensors es compatible con el ecosistema transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card menciona "baja latencia" para aplicaciones en dispositivo sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Rendimiento MTEB (multilingual v2) |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8.192 | Texto, imagen, vídeo, audio | Apache 2.0 | 61,36 |
| EmbeddingGemma 1 | No disponible | No disponible | Texto | Apache 2.0 | 61,15 |
| Otros modelos de embeddings multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con EmbeddingGemma 1, su predecesor, que obtiene 61,15 en MTEB multilingual v2 frente a 61,36 del modelo actual, y 68,76 en MTEB code v1 frente a 78,68. No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un modelo multilingüe entrenado por Google DeepMind, es previsible que herede sesgos de los datos de entrenamiento, pero no hay datos concretos.
- Riesgo de alucinación: al ser un modelo de embeddings y no generativo, no produce texto libre; el riesgo se traslada a los sistemas que consumen sus representaciones (por ejemplo, un RAG que recupere documentos irrelevantes si la similitud no es fiable).
- Limitaciones de contexto: la ventana es de 8.192 tokens, insuficiente para documentos muy largos; además, la ventana deslizante de 1.024 tokens condiciona el alcance de la atención local.
- Limitaciones de idioma: aunque se declaran más de 100 idiomas, no se detalla el rendimiento por idioma ni se garantiza la paridad entre ellos.
- Restricciones de licencia: la licencia es Apache 2.0, lo que permite uso comercial; sin embargo, esta ficha corresponde a una réplica no oficial alojada por el usuario Ninja66666, por lo que conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Caveats para producción: el modelo es una réplica con solo 28 descargas y 0 likes, sin verificación de integridad documentada; además, el truncado a 128d degrada notablemente el rendimiento multimodal (MMEB v2 overall cae de 59,01 a 45,65) y solo es recomendable para cargas de trabajo exclusivamente de texto, según la propia model card.
- No se documentan procesos de RLHF/DPO ni detalles del dataset de entrenamiento, lo que limita la evaluación de su comportamiento en dominios especializados.

## Enlaces

- HuggingFace (réplica): https://huggingface.co/Ninja66666/embeddinggemma-2
- HuggingFace (modelo original de Google): https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentación: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Google DeepMind Gemma: https://deepmind.google/models/gemma/
