# luokelabs/embeddinggemma-2-bf16

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio, así como combinaciones de estas modalidades, en un único espacio vectorial compartido de 768 dimensiones. Con 740 millones de parámetros totales, combina un backbone de texto de 270 millones (130M de transformer más 140M de embedder) con encoders modulares de visión (170M) y audio (300M) que pueden cargarse de forma selectiva según la necesidad de cada aplicación.

El modelo está diseñado para ejecutarse en hardware de consumo, como portátiles y dispositivos móviles, ofreciendo representaciones semánticas de baja latencia para búsqueda, generación aumentada por recuperación (RAG), clasificación y agrupamiento. Hereda las innovaciones arquitectónicas de Gemma 4 e incorpora Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256 o 512 dimensiones con una pérdida mínima de calidad.

Su relevancia actual radica en la unificación de cuatro modalidades en un solo espacio de embeddings con una ventana de contexto de 8192 tokens, lo que habilita la recuperación cruzada entre texto, imagen, vídeo y audio en un único índice vectorial, con una licencia Apache 2.0 que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención GQA/MQA, ventana deslizante local/global 5:1, activación Gated FFN con GELU, mean pooling y capa de proyección 512→768 |
| Parametros totales | 740M (backbone de texto 130M + embedder 140M + encoder de visión 170M + encoder de audio 300M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (el checkpoint publicado es bf16) |
| Idiomas soportados | Multilingüe (más de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura se basa en un transformer de 24 capas con dimensión de modelo de 512 y dimensión oculta de 2048, con 4 cabezas de atención y 2/1 cabezas KV locales/globales, combinando atención GQA y MQA con una relación local:global de 5:1 y ventana deslizante de 1024 tokens. El vocabulario es de 262 144 tokens. La salida se obtiene mediante mean pooling seguida de una proyección de 512 a 768 dimensiones, y el modelo admite truncamiento MRL a 128, 256 y 512 dimensiones.

El modelo combina un backbone de texto con encoders de modalidad cargables de forma selectiva, lo que permite desplegar únicamente las modalidades necesarias. Incorpora representaciones dirigidas por tareas mediante prefijos de instrucción de texto ligeros que optimizan los embeddings para búsqueda, clasificación, agrupamiento o similitud semántica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de embeddings de texto, incluido código, en un espacio vectorial de 768 dimensiones.
- Embeddings de imagen, vídeo y audio, y de combinaciones multimodales de estas entradas.
- Espacio de embeddings unificado para las cuatro modalidades, lo que permite recuperación cruzada entre texto, imagen, vídeo y audio.
- Soporte multilingüe con más de 100 idiomas.
- Mejora de aproximadamente el 14 % en tareas de código respecto a su predecesor.
- Representaciones dirigidas por tareas mediante prefijos de instrucción (búsqueda, clasificación, agrupamiento, similitud semántica).
- Truncamiento MRL nativo a 128, 256 y 512 dimensiones con re-normalización.
- Procesamiento de minutos de audio o vídeo gracias a la ventana de contexto de 8192 tokens.
- No se menciona soporte de tool calling, function calling ni razonamiento multi-paso, ya que es un modelo de extracción de características, no generativo.

## Casos de uso

- Búsqueda semántica multilingüe: el modelo indexa documentos en más de 100 idiomas en un único espacio vectorial de 768 dimensiones, lo que permite consultas en un idioma y recuperación en otro sin índices separados.
- RAG multimodal: se pueden indexar documentos, imágenes de páginas escaneadas, vídeos y fragmentos de audio en un mismo índice vectorial, de modo que una consulta textual recupere evidencias de cualquier modalidad.
- Búsqueda visual de documentos: con el encoder de visión y las capacidades de VisDoc, se pueden recuperar páginas de PDF o capturas de pantalla relevantes a partir de una consulta textual, útil en gestores documentales.
- Clasificación y agrupamiento de contenidos: usando prefijos de instrucción para clasificación y clustering, el modelo genera embeddings que alimentan clasificadores ligeros o algoritmos de agrupamiento sobre grandes volúmenes de texto y medios.
- Recuperación de código: con la mejora del 14 % en tareas de código, se puede construir búsqueda semántica sobre repositorios y documentación técnica para asistentes de desarrollo.
- Búsqueda en audio y vídeo: con la ventana de 8192 tokens y el encoder de audio, se pueden indexar minutos de audio o vídeo para recuperación por similitud semántica en archivos multimedia.
- Despliegue en dispositivo: al caber en hardware de consumo, permite búsqueda y RAG local en portátiles y móviles sin conexión a servicios en la nube.
- Reducción de costes de almacenamiento vectorial: el truncamiento MRL a 256 dimensiones reduce el almacenamiento hasta 3 veces con una pérdida mínima de calidad en MTEB multilingüe (60,41 frente a 61,36).

## Benchmarks y rendimiento

Resultados con checkpoint de precisión completa a 768 dimensiones:

| Modalidad | Benchmark | Métrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB multilingüe v2 | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB code v1 | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB lite | Mean(TaskType), Multiple | 64,64 | no disponible |
| Imagen | MMEB v2 Image | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 VisDoc | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Vídeo | MMEB v2 Video | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB Retrieval | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB | Mean(Task), Multiple | 49,39 | no disponible |

Resultados con truncamiento vectorial MRL:

| Dimensión | Ratio de compresión | MTEB multilingüe v2 | MTEB inglés v2 | MTEB code v1 | MIEB lite | MMEB v2 global | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

## Requisitos de hardware

- El modelo tiene 740M parámetros; en bf16 el checkpoint ocupa aproximadamente 1,5 GB en disco, según el tamaño del repositorio.
- En bf16, la VRAM estimada para inferencia ronda los 2-3 GB, incluyendo pesos y activaciones para secuencias de contexto moderadas; en fp32 se duplicaría.
- Diseñado explícitamente para hardware de consumo como portátiles y dispositivos móviles, por lo que cabe en GPUs de consumo (por ejemplo, RTX 4090, RTX 3060 o superiores) y en muchos casos en CPU.
- No se especifican GPUs de centro de datos recomendadas (A100, H100) en la información disponible; el modelo está orientado a despliegue ligero.
- Opciones de despliegue: transformers y sentence-transformers según la model card; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | MTEB multilingüe v2 | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8192 | Texto, imagen, vídeo, audio | 61,36 | Apache 2.0 |
| EmbeddingGemma 1 | No disponible | No disponible | Texto | 61,15 | No disponible en la información |
| Otros modelos de embeddings multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada más allá del predecesor EmbeddingGemma 1, por lo que la comparativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Al ser un modelo de embeddings y no generativo, no produce texto ni razona; su uso se limita a representaciones vectoriales.
- Riesgo de alucinación no aplica directamente, pero los embeddings pueden recuperar contenido semánticamente próximo pero factualmente incorrecto en tareas de RAG.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos multilingües a gran escala, pueden persistir sesgos culturales y lingüísticos.
- El truncamiento a 128 dimensiones degrada notablemente el rendimiento multimodal (MMEB v2 global cae a 45,65 frente a 59,01 a 768d) y solo se recomienda para cargas de solo texto.
- La longitud de contexto de 8192 tokens limita el tamaño de los documentos o clips de audio y vídeo procesados en una sola pasada.
- Aunque la licencia es Apache 2.0, conviene verificar los términos del enlace de licencia de Gemma 4 referenciado en la model card antes de un uso comercial.
- El repositorio analizado (luokelabs/embeddinggemma-2-bf16) es una republicación con 0 descargas y 0 likes; para producción se recomienda usar el checkpoint oficial de Google.
- No se dispone de información sobre cuantizaciones oficiales ni sobre soporte en motores de inferencia de alto rendimiento.

## Enlaces

- [Hugging Face: luokelabs/embeddinggemma-2-bf16](https://huggingface.co/luokelabs/embeddinggemma-2-bf16)
- [Hugging Face: google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2)
- [GitHub: google-gemma](https://github.com/google-gemma)
- [Blog de lanzamiento](https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2)
- [Documentación](https://ai.google.dev/gemma/docs/embeddinggemma)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Google DeepMind: Gemma](https://deepmind.google/models/gemma/)
