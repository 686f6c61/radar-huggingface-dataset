# IIIaHTu/komaru_embeddings

## Resumen

Komaru Embeddings es un modelo de embeddings de frases para ruso desarrollado por el usuario IIIaHTu y publicado en Hugging Face. Se trata de un fine-tuning del modelo LaBSE-ru-turbo (128.345.088 parámetros, arquitectura BERT) orientado a tareas de similitud semántica, búsqueda y clasificación de textos en ruso. El modelo produce vectores de 768 dimensiones con una longitud máxima de 512 tokens y emplea mean pooling con máscara seguido de normalización L2.

El modelo se entrenó mediante destilación de embeddings usando FRIDA (ai-forever) como modelo profesor, sobre una mezcla amplia de corpus rusos: Wikipedia, FineWeb-2, noticias, reseñas, pares pregunta-respuesta y datasets de paráfrasis y NLI. Posteriormente se realizó un ajuste fino supervisado con los splits de entrenamiento de las tareas de ruMTEB, incluyendo tareas de clasificación, STS, recuperación y reranking.

Su relevancia radica en que ofrece una alternativa compacta (0,5 GB de pesos en safetensors) y con licencia MIT para pipelines de recuperación aumentada (RAG) y búsqueda semántica en ruso, un nicho donde la mayoría de modelos multilingües no están optimizados específicamente. No obstante, en el momento de la consulta el repositorio registra 0 descargas y 0 likes, por lo que se trata de un modelo recién publicado y sin validación externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), fine-tuning de LaBSE-ru-turbo |
| Parametros totales | 128.345.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT (con materiales heredados bajo Apache 2.0 y condiciones de los modelos originales) |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 |
| Pooling | mean pooling con máscara + normalización L2 |
| Libreria | sentence-transformers |
| Tamano del repo | 0,5 GB |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo parte de LaBSE-ru-turbo, un encoder BERT de 128 millones de parámetros adaptado al ruso, y se entrena en dos fases. En la primera, se realiza destilación de embeddings tomando FRIDA (ai-forever) como profesor, sobre una mezcla de textos web (Wikipedia, FineWeb-2 en ruso y FineWeb en inglés), noticias rusas (Lenta, Gazeta, BBC vía XLSum, Telegram), reseñas y comentarios (Wildberries, Pikabu), pares pregunta-respuesta y recuperación (SberQuAD, mMARCO, WikiOmnia, Yandex-Q, Habr QnA, Stack Overflow en ruso, MIRACL, Mr.TyDi) y pares de paráfrasis y NLI (Leipzig NMT, ru_paraphraser, ru-HNP, ru-WANLI, ru_go_emotions). La model card indica que se usaron ejemplos seleccionados y filtrados, no copias completas de los datasets.

En la segunda fase, el modelo se ajusta con datos supervisados de las tareas de ruMTEB: los splits de entrenamiento de CEDR, Sensitive Topics, RuSciBench, RuSTSBenchmark y TERRa, y los splits de entrenamiento y validación de Georeview, Headline, Inappropriateness, RuReviews y Kinopoisk (evaluadas sobre test). Se aplicó filtrado de coincidencias con los textos de evaluación disponibles para mitigar la contaminación. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni hiperparámetros como batch size, learning rate o número de épocas.

## Capacidades

- Generación de embeddings de frases y documentos en ruso con 768 dimensiones y ventana de 512 tokens.
- Similitud semántica entre pares de textos (pipeline sentence-similarity).
- Búsqueda semántica y recuperación de pasajes (diseñado con datos de MIRACL, Mr.TyDi, mMARCO y SberQuAD).
- Clasificación de textos mediante embeddings (entrenado con CEDR, Sensitive Topics, RuSciBench, RuReviews, Kinopoisk, Georeview, Headline, Inappropriateness).
- Reranking y pair classification (entrenado con TERRa).
- Análisis de sentimiento y emociones mediante prompts con nombre, por ejemplo `prompt_name="categorize_sentiment"` (documentado en la model card).
- Soporte de `encode_query` y `encode_document` para pipelines asimétricos de recuperación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- Sin capacidades de visión, audio ni modo thinking.

## Casos de uso

- Búsqueda semántica en bases de conocimiento rusas: indexar documentos con `encode_document` y consultar con `encode_query`; los vectores normalizados permiten similitud coseno directa en FAISS, Qdrant o pgvector. Adecuado por su entrenamiento con MIRACL, Mr.TyDi y mMARCO.
- RAG sobre documentación técnica en ruso: recuperar pasajes relevantes de manuales o Stack Overflow en ruso antes de pasarlos a un LLM generador; el modelo está entrenado con ru_stackoverflow y Habr QnA.
- Clasificación de reseñas de producto: generar embeddings de reseñas de Wildberries y entrenar un clasificador lineal encima; el modelo se entrenó con wb-feedbacks y RuReviews.
- Moderación de contenido: detección de temas sensibles o contenido inapropiado mediante embeddings y un clasificador; se usaron sensitive-topics-classification e inappropriateness en el entrenamiento.
- Deduplicación y agrupación de noticias: calcular similitud entre titulares y cuerpos de noticia para agrupar coberturas del mismo evento; el modelo se entrenó con pares titular-articulo de Lenta, Gazeta y BBC.
- Análisis de sentimiento en atención al cliente: usar el prompt `categorize_sentiment` para clasificar tickets o mensajes de soporte en ruso sin entrenar un modelo adicional.
- Búsqueda de preguntas frecuentes: emparejar la consulta del usuario con la FAQ más cercana mediante similitud de embeddings; adecuado por el entrenamiento con Yandex-Q y ru-QnA-333K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se usaron splits de entrenamiento y validación de tareas de ruMTEB, pero no reporta puntuaciones MTEB ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos más overhead de activaciones; en la práctica cabe en cualquier GPU consumer con 2 GB o más.
- VRAM estimada en fp16: alrededor de 0,25 GB de pesos; cabe en GPUs integradas y en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o RTX 4090. Para desarrollo, RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 2060, etc.), e incluso en CPU para lotes pequeños.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` presente), endpoints compatibles de Hugging Face, y exportación a ONNX no documentada pero viable por ser un BERT estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (128 M de parámetros) se espera un throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Komaru Embeddings | 128,3 M | 512 | 768 | ru | MIT | Hugging Face, 0 descargas |
| sergeyzh/LaBSE-ru-turbo (base) | no disponible en la informacion | no disponible | no disponible | ru | no disponible | Hugging Face |
| ai-forever/FRIDA (profesor) | no disponible en la informacion | no disponible | no disponible | ru | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado (MTEB o ruMTEB) para ninguno de los modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. FRIDA se usa como modelo profesor en la destilación, lo que sugiere que Komaru busca aproximar su calidad con un tamaño menor, pero no se aportan métricas que lo confirmen.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ruso; no se garantiza un rendimiento aceptable en otros idiomas pese a heredar de LaBSE (multilingüe).
- Ventana de contexto de 512 tokens: los documentos más largos deben fragmentarse antes de generar embeddings.
- Riesgo de contaminación de evaluación: parte de los datos de entrenamiento provienen de splits de train de tareas de ruMTEB; aunque la model card indica filtrado de coincidencias con textos de evaluación, no se detalla la metodología ni se reportan métricas que permitan verificar la ausencia de fuga.
- Sin benchmarks publicados ni validación externa: 0 descargas y 0 likes en el repositorio en el momento de la consulta; no hay evidencia independiente de su calidad.
- Licencia MIT para la contribución de Komaru, pero los materiales heredados de LaBSE-ru-turbo mantienen condiciones Apache 2.0 y las de los modelos originales; conviene revisar NOTICE y LICENSE-APACHE antes de uso comercial.
- Riesgo de sesgos heredados de los corpus de entrenamiento (Wikipedia, noticias rusas, reseñas de marketplace), que pueden reflejar sesgos lingüísticos, geopolíticos o de género presentes en esas fuentes.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling; cualquier caso de uso que requiera generación necesita un LLM adicional.
- La model card está redactada en ruso; no hay documentación en castellano ni en inglés.
- No se documentan cuantizaciones GGUF ni ONNX, lo que limita el despliegue en llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IIIaHTu/komaru_embeddings
- Modelo base LaBSE-ru-turbo: https://huggingface.co/sergeyzh/LaBSE-ru-turbo
- Modelo profesor FRIDA: https://huggingface.co/ai-forever/FRIDA
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset MIRACL: https://huggingface.co/datasets/miracl/miracl
- Dataset Mr.TyDi: https://huggingface.co/datasets/castorini/mr-tydi
- Dataset RuSTSBenchmark: https://huggingface.co/datasets/ai-forever/ru-stsbenchmark-sts
- Dataset TERRa: https://huggingface.co/datasets/ai-forever/terra-pairclassification
- Dataset CEDR: https://huggingface.co/datasets/ai-forever/cedr-classification
