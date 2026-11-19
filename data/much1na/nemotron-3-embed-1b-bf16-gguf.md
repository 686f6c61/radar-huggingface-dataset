# much1na/Nemotron-3-Embed-1B-BF16-GGUF

## Resumen

Nemotron-3-Embed-1B-BF16-GGUF es la conversión a formato GGUF del modelo de embeddings nvidia/Nemotron-3-Embed-1B-BF16, publicada por el usuario much1na. Se trata de un modelo de extracción de características (feature-extraction) orientado a similitud semántica de frases y recuperación de información, con 1.140.918.272 parámetros y pesos originales en BF16. El repositorio incluye tres variantes de cuantización (BF16, Q8_0 y Q6_K) empaquetadas para su uso con llama.cpp.

El modelo está pensado para tareas de recuperación (retrieval) y búsqueda semántica multilingüe: genera vectores de embedding que permiten comparar consultas y documentos mediante similitud de coseno. Su relevancia práctica radica en que, al estar en formato GGUF, puede ejecutarse en llama.cpp y llama-server sin necesidad de GPU dedicada, lo que facilita su despliegue en entornos con recursos limitados o en infraestructura propia.

La ficha se basa exclusivamente en la información disponible en el repositorio de Hugging Face y en la model card del autor; los datos no publicados se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings; pesos base en BF16) |
| Parámetros totales | 1.140.918.272 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de servidor usa `--ctx-size 512` |
| Tipos de cuantización | BF16, Q8_0, Q6_K (se puede generar Q4_K_M con `llama-quantize`) |
| Idiomas soportados | multilingüe |
| Licencia | nvidia-open-model-license (licencia "other" en la ficha de HF) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (tipo de transformer, mecanismo de atención, número de capas o dimensión de los embeddings) en la información proporcionada. El repositorio es una conversión a GGUF del modelo nvidia/Nemotron-3-Embed-1B-BF16, con 1.140.918.272 parámetros y pesos originales en BF16. El tamaño del repositorio es de 4,5 GB, coherente con las tres variantes de cuantización incluidas.

Tampoco se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si se emplearon técnicas de RLHF o DPO. El modelo está etiquetado como multilingüe y orientado a sentence-similarity y feature-extraction. Una innovación práctica destacable de esta conversión es la inclusión de prefijos obligatorios para retrieval: las consultas deben ir precedidas de `"query: "` y los documentos de `"passage: "`, sin los cuales la recuperación no funciona según advierte el autor.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información.
- Búsqueda semántica query-document mediante similitud de coseno.
- Soporte multilingüe (etiqueta `multilingual`).
- Compatibilidad con llama.cpp y llama-server, incluyendo la API compatible con OpenAI (`/v1/embeddings`).
- Pooling configurable mediante el flag `--pooling mean` en llama-server.
- Capacidad de generar cuantizaciones adicionales con `llama-quantize`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo está especializado en embeddings.

## Casos de uso

- Búsqueda semántica en documentación interna: indexar pasajes con el prefijo `"passage: "` y consultar con `"query: "`, comparando vectores por similitud de coseno para recuperar los fragmentos más relevantes.
- Construcción de sistemas RAG (retrieval-augmented generation): usar el modelo como recuperador de contexto para un LLM generador, desplegándolo en llama-server junto al modelo de generación.
- Deduplicación y agrupación de textos: calcular embeddings de un corpus y agrupar documentos por cercanía vectorial para detectar duplicados o temas similares.
- Clasificación zero-shot por similitud: comparar un texto con descripciones de categorías embebidas para asignar etiquetas sin entrenamiento adicional.
- Despliegue en entornos sin GPU: gracias a las cuantizaciones Q8_0 y Q6_K y al soporte de llama.cpp con `--gpu-layers 0`, puede ejecutarse en CPU para servicios de baja concurrencia.
- Búsqueda multilingüe: al estar etiquetado como multilingüe, permite consultas en un idioma contra documentos en otro, útil en bases de conocimiento con contenido en varios idiomas.
- Prototipado rápido de motores de recomendación de contenido: embeber artículos o productos y recomendar los más cercanos al vector de un ítem de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~1,14 mil millones de parámetros en BF16 ocupa aproximadamente 2,3 GB solo en pesos; en Q8_0 alrededor de 1,2 GB y en Q6_K algo menos. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados.
- GPU recomendadas: no se especifican en la información proporcionada. El ejemplo de la model card emplea `--gpu-layers 0`, es decir, ejecución en CPU.
- Compatibilidad con GPU de consumo: probable en GPUs con suficiente VRAM para el tamaño de la cuantización elegida, pero no confirmado por el autor.
- Opciones de despliegue: llama.cpp (llama-server, llama-quantize) y cualquier cliente compatible con la API OpenAI de embeddings.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El retrieval no funciona sin los prefijos `"query: "` y `"passage: "`; omitirlos degrada o invalida los resultados.
- La licencia nvidia-open-model-license debe revisarse antes de cualquier uso comercial; la ficha de Hugging Face la marca como "other".
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la conversión.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- El modelo es de embeddings: no genera texto ni responde preguntas directamente.
- El ejemplo de servidor usa `--ctx-size 512`, lo que sugiere que textos más largos pueden requerir ajuste y que la longitud de contexto real no está documentada.
- Al ser una conversión de terceros, la fidelidad respecto al modelo original de NVIDIA no está verificada de forma independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/much1na/Nemotron-3-Embed-1B-BF16-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
