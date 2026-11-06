# 0x3/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio, así como combinaciones de estas modalidades, en un único espacio vectorial compartido de 768 dimensiones. Con 740M parámetros totales, combina un backbone de texto de 270M parámetros con encoders modulares de visión (170M) y audio (300M) que pueden cargarse de forma selectiva, lo que permite desplegar únicamente las modalidades necesarias para cada caso de uso.

El modelo está diseñado para ejecutarse en hardware de consumo, como portátiles y dispositivos móviles, ofreciendo representaciones semánticas de baja latencia para aplicaciones en el dispositivo como búsqueda, generación aumentada por recuperación (RAG), clasificación y agrupamiento (clustering). Hereda las innovaciones arquitectónicas de Gemma 4 y sustituye a EmbeddingGemma 1, con mejoras notables en tareas de código (aproximadamente un 14 %).

Es relevante ahora porque unifica cuatro modalidades en un solo espacio de embeddings con una ventana de contexto de 8.192 tokens y soporte nativo de Matryoshka Representation Learning (MRL), que permite truncar los vectores a 128, 256 o 512 dimensiones con una degradación mínima de calidad, reduciendo hasta 6 veces el coste de almacenamiento vectorial. La licencia Apache 2.0 facilita su adopción tanto en investigación como en producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención GQA/MQA, ventana deslizante local/global 5:1, pooling medio y capa de proyección 512→768 |
| Parametros totales | 744.371.512 (740M según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (más de 100 idiomas, incluido código) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un transformer con 24 capas, dimensión de modelo de 512 y dimensión oculta de 2.048, con 4 cabezas de atención y 2/1 cabezas KV locales/globales, usando una proporción local:global de 5:1 y una ventana deslizante de 1.024 tokens. La atención emplea GQA/MQA y la activación es una FFN con compuertas y GELU. El modelo aplica pooling medio sobre las representaciones y una capa de proyección de 512 a 768 dimensiones para producir el vector final. El vocabulario es de 262.144 tokens.

La arquitectura se descompone en un backbone de texto de 130M parámetros más un embedder de 140M (270M en total para texto), a los que se añaden encoders modulares de visión (170M) y audio (300M) que pueden cargarse selectivamente. El modelo soporta Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings nativos de 768 dimensiones a 128, 256 o 512 dimensiones y renormalizarlos. También incorpora representaciones guiadas por tarea mediante prefijos de instrucción de texto ligeros que optimizan los embeddings para búsqueda, clasificación, clustering o similitud semántica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de embeddings multimodales nativos para texto, imágenes, vídeo y audio en un espacio vectorial compartido de 768 dimensiones.
- Procesamiento de texto incluyendo código, con una mejora de aproximadamente el 14 % en tareas de código respecto a su predecesor.
- Extracción de características de imagen, audio y vídeo (image-feature-extraction, audio-feature-extraction, video-feature-extraction).
- Similitud semántica de frases (sentence-similarity) y búsqueda semántica.
- Soporte multilingüe de más de 100 idiomas.
- Representaciones guiadas por tarea mediante prefijos de instrucción de texto.
- Truncamiento MRL nativo a 128, 256 y 512 dimensiones.
- Carga selectiva de encoders de modalidad para ajustar el consumo de recursos.
- Compatibilidad con la librería sentence-transformers y transformers.
- No se especifican capacidades de tool calling, agentes ni modo de razonamiento (thinking mode); el modelo es de extracción de características, no generativo.

## Casos de uso

- Búsqueda semántica en el dispositivo: el modelo puede generar embeddings de consultas y documentos en portátiles o móviles gracias a su tamaño de 740M parámetros y su ventana de 8.192 tokens, permitiendo búsqueda local sin conexión.
- RAG (generación aumentada por recuperación): indexar documentos de texto y código en 768 dimensiones (o truncadas a 256d para ahorrar almacenamiento) y recuperar pasajes relevantes para alimentar un LLM, con soporte de prefijos de instrucción para optimizar la recuperación.
- Búsqueda multimodal de imágenes y vídeo: indexar fotogramas de vídeo o imágenes con el encoder de visión y recuperarlas mediante consultas de texto en el mismo espacio vectorial, útil en bibliotecas de medios o catálogos visuales.
- Clasificación y clustering de contenido: agrupar noticias, reseñas o publicaciones por similitud semántica usando los embeddings truncados a 128d o 256d para reducir costes de almacenamiento y cómputo.
- Búsqueda y recuperación de audio: indexar fragmentos de audio con el encoder de audio y recuperarlos por similitud, aplicable a archivos de podcasts, grabaciones o música.
- Deduplicación y detección de near-duplicates en corpus multilingües: comparar embeddings de documentos en más de 100 idiomas para identificar contenido repetido o casi idéntico.
- Sistemas de recomendación basados en contenido: representar ítems (texto, imagen, audio) en un espacio común y calcular similitudes para sugerir contenido relacionado.
- Análisis de documentos visuales (VisDoc): extraer embeddings de documentos escaneados o capturas para tareas de recuperación de documentos con NDCG@5.

## Benchmarks y rendimiento

Resultados publicados en la model card con el checkpoint de precisión completa (768d):

| Modalidad | Benchmark | Métrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 65,67 | no disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Vídeo | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,87 | no disponible |

Resultados con truncamiento vectorial (MRL):

| Dimensión | Ratio de compresión | MTEB multilingual v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 overall | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 65,67 | 59,01 | 69,54 | 49,87 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 65,34 | 58,38 | 69,18 | 49,76 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 64,16 | 56,24 | 66,76 | 49,13 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,97 | 45,65 | 56,71 | 47,28 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,5 GB en safetensors; con 740M parámetros en precisión completa (fp32) se requieren aproximadamente 3 GB, en fp16/bf16 unos 1,5 GB, y en cuantizaciones de 8 o 4 bits menos de 1 GB (estimación orientativa; no se publican cifras oficiales de cuantización).
- GPU recomendadas: al estar diseñado para hardware de consumo, funciona en portátiles y dispositivos móviles; para servidores se puede usar cualquier GPU con al menos 2-4 GB de VRAM (por ejemplo, RTX 3060, RTX 4090, A100, H100) según la precisión y las modalidades cargadas.
- Cabe en GPU de consumo: sí, incluso en GPUs de gama baja y en CPU, dado el reducido tamaño del backbone de texto (270M) y la carga selectiva de encoders.
- Opciones de despliegue: transformers y sentence-transformers de forma nativa; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no se publican cifras concretas; la model card indica baja latencia para aplicaciones en el dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | MTEB multilingual v2 |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M (270M texto + 170M visión + 300M audio) | 8.192 tokens | Texto, imagen, vídeo, audio | Apache 2.0 | 61,36 |
| EmbeddingGemma 1 | no disponible (predecesor) | no disponible | Texto | no disponible | 61,15 |
| Otros modelos de embeddings multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al ser un modelo multilingüe entrenado con datos web, es previsible que herede sesgos de esos datos, pero no se aportan detalles.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, no generativo; sin embargo, la calidad de la recuperación depende de la representación y puede producir falsos positivos en similitud semántica.
- El truncamiento a 128d degrada notablemente el rendimiento multimodal (MMEB overall cae de 59,01 a 45,65); la model card recomienda 128d solo para cargas de trabajo de texto.
- La ventana de contexto es de 8.192 tokens, suficiente para minutos de audio o vídeo, pero limitada para documentos muy largos.
- Aunque la licencia es Apache 2.0, conviene verificar los términos de la licencia Gemma 4 enlazada en la model card para usos comerciales concretos.
- No se especifican tipos de cuantización soportados ni cifras de latencia, lo que dificulta planificar el despliegue en producción.
- El modelo tiene muy pocas descargas (28) y ningún like en el momento de la ficha, lo que sugiere una adopción temprana y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/0x3/embeddinggemma-2
- Modelo original en Hugging Face: https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentación: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma: https://deepmind.google/models/gemma/
