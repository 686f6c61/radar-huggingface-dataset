# furde/nemotron-3.5-embed-8b-gguf

## Resumen

Nemotron 3.5 Embed 8B GGUF es una conversión a formato GGUF del modelo de embeddings multimodal `nvidia/Nemotron-3.5-Embed-8B-BF16`, publicada por el usuario independiente `furde`. El modelo base es un encoder de 8B parámetros (7.952.683.008 exactos en safetensors) desarrollado por NVIDIA, orientado a la generación de representaciones vectoriales densas de 4096 dimensiones para tareas de recuperación y búsqueda semántica, con soporte tanto de texto como de imagen. Esta conversión concreta no es una release oficial de NVIDIA ni de Mistral AI.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de embeddings de 8B parámetros mediante llama.cpp, sin necesidad de GPU de gran capacidad ni de infraestructura de inferencia propietaria. La conversión sigue un procedimiento reproducible documentado por el publicador W4D y emplea llama.cpp v1.1.0 en un commit concreto, generando dos artefactos: una torre de texto en Q6_K y un proyector multimodal (mmproj) en Q8_0.

Es importante señalar que el autor declara explícitamente que esta conversión no garantiza paridad con las puntuaciones de retrieval del modelo BF16 original de NVIDIA, y que el soporte de imagen requiere cargar el mmproj junto a la torre de texto Q6_K. El modelo base textual es, según NVIDIA, `Mistral AI Ministral-3-8B-Instruct-2512-BF16`, licenciado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de embeddings (base derivada de Ministral-3-8B-Instruct-2512) |
| Parametros totales | 7.952.683.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (torre de texto), Q8_0 (mmproj de vision), BF16 (referencia) |
| Idiomas soportados | no disponibles |
| Licencia | openmdw-1.1 (modelo base textual Apache-2.0) |
| Formato de pesos | GGUF (safetensors BF16 en el modelo base) |
| Dimension de embedding | 4096 |
| Tamano del repo | 7.0 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer encoder de 8B parámetros derivado de `Mistral AI Ministral-3-8B-Instruct-2512-BF16`, adaptado por NVIDIA como modelo de embeddings. La salida del encoder es un vector denso de 4096 dimensiones, normalizado, apto para búsqueda por similitud coseno. La variante multimodal incorpora un proyector de imagen (mmproj) que permite generar embeddings conjuntos de texto e imagen en el mismo espacio vectorial.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o entrenamiento contrastivo específico. La conversión a GGUF se realizó sin matriz de importancia (imatrix): los pesos BF16 se convirtieron primero a GGUF BF16 y luego a Q6_K para la torre de texto, mientras que el proyector de visión se cuantizó a Q8_0. Según el autor, las similitudes coseno entre los vectores de imagen BF16 y Q8_0 fueron de 0,99931 y 0,99865 en CPU, sobre dos pruebas sintéticas de forma y color, lo que constituye una verificación de humo de la API y no un benchmark de retrieval.

## Capacidades

- Generación de embeddings de texto de 4096 dimensiones para búsqueda semántica y recuperación de información.
- Generación de embeddings de imagen en el mismo espacio vectorial que el texto, cuando se carga el proyector mmproj Q8_0 junto a la torre de texto Q6_K.
- Soporte de prefijos de instrucción `query:` para consultas y `passage:` para documentos, según la convención documentada en la model card.
- Endpoint compatible con la API de embeddings (`POST /v1/embeddings`), con soporte de entrada multimodal mediante un objeto JSON con array `content` que incluye una parte de texto y una parte `image_url` (data URI).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica en bases documentales: indexar pasajes con el prefijo `passage:` y consultar con `query:`, almacenando los vectores de 4096 dimensiones en una base vectorial (Qdrant, Milvus, pgvector) para recuperación por similitud coseno.
- Recuperación aumentada por generación (RAG) local: desplegar el modelo con llama.cpp en una máquina sin GPU de datacenter para generar embeddings de chunks documentales en pipelines RAG que no pueden enviar datos a la nube.
- Búsqueda multimodal texto-imagen: cargar el mmproj Q8_0 junto a la torre Q6_K para indexar imágenes y recuperarlas mediante consultas textuales, útil en catálogos de producto o archivos fotográficos.
- Deduplicación y clustering de documentos: usar los embeddings normalizados para agrupar documentos similares o detectar duplicados en corpus grandes, aprovechando la ventana de contexto del modelo base.
- Moderación y clasificación semántica: calcular similitud entre textos de entrada y conjuntos de referencia etiquetados para tareas de clasificación zero-shot o few-shot mediante vecinos más cercanos.
- Prototipado e investigación en entornos con recursos limitados: al estar en GGUF, permite experimentar con un encoder de 8B en estaciones de trabajo consumer (CPU o GPU modesta) sin depender de infraestructura de NVIDIA.
- Evaluación comparativa de cuantizaciones: el repositorio incluye tanto la torre Q6_K como el proyector Q8_0 y un manifiesto `SHA256SUMS`, lo que facilita reproducir experimentos de degradación por cuantización en tareas de retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta conversión no reclama paridad con las puntuaciones de retrieval del BF16 de NVIDIA, y que las pruebas realizadas (cosenos de 0,99931 y 0,99865 entre vectores de imagen BF16 y Q8_0) son verificaciones de humo de la API, no benchmarks de recuperación.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 7,0 GB; la torre de texto Q6_K más el mmproj Q8_0 requieren del orden de 7-8 GB de memoria para cargarse en inferencia, aunque la cifra exacta no está documentada.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar funcionamiento en GPUs consumer de gama alta (RTX 4090, 24 GB) y en GPUs de datacenter (A100, H100), pero el autor no lo especifica.
- Cabe en GPU consumer: previsiblemente sí en tarjetas con 8 GB o más de VRAM para la torre de texto sola; el autor no confirma modelos concretos.
- Opciones de despliegue: llama.cpp v1.1.0 (commit `171527522610996f5f0acf12334e185156ca8f44`), con servidor compatible con el endpoint `/v1/embeddings`. El tag `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles. El autor menciona pruebas en CPU para la verificación de vectores de imagen, pero sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| furde/nemotron-3.5-embed-8b-gguf | 7.952.683.008 | no disponible | GGUF (Q6_K + mmproj Q8_0) | openmdw-1.1 | Conversión independiente, multimodal texto-imagen |
| nvidia/Nemotron-3.5-Embed-8B-BF16 | 7.952.683.008 | no disponible | safetensors BF16 | openmdw-1.1 | Modelo base oficial de NVIDIA, referencia de calidad |
| W4D/Nemotron-3.5-Embed-8B-GGUF | no disponible | no disponible | GGUF | no disponible | Conversión previa cuyo procedimiento sirve de referencia al autor |
| mistralai/Ministral-3-8B-Instruct-2512-BF16 | no disponible | no disponible | safetensors BF16 | Apache-2.0 | Modelo base textual identificado por NVIDIA, generativo, no encoder de embeddings |

## Limitaciones y advertencias

- El autor declara explícitamente que esta conversión no garantiza paridad con las puntuaciones de retrieval del BF16 original de NVIDIA; la cuantización Q6_K puede degradar la calidad de los embeddings.
- El mmproj no es un modelo de embeddings autónomo: debe cargarse junto a la torre de texto Q6_K para peticiones de imagen. El soporte de imagen no está implícito por el mero arranque del servidor.
- La verificación de visión realizada se limita a dos pruebas sintéticas de forma y color; no constituye evidencia de calidad en retrieval multimodal real.
- Licencia openmdw-1.1: es una licencia "other" que debe revisarse antes de uso comercial; el modelo base textual es Apache-2.0, pero la conversión y el proyector se distribuyen bajo OpenMDW 1.1.
- No es una release oficial de NVIDIA ni de Mistral AI; el autor es un publicador independiente y el repositorio no tiene descargas ni likes en el momento de la consulta.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin verificación.
- Longitud de contexto no documentada: debe determinarse empíricamente antes de usarlo con documentos largos.
- Riesgo de sesgos y alucinación: no se documentan evaluaciones de sesgo; al ser un encoder de embeddings, el riesgo de alucinación se traslada a la recuperación de pasajes irrelevantes si la cuantización degrada la separación semántica.
- La reproducibilidad depende de versiones concretas (llama.cpp v1.1.0, transformers 5.20.0, Python 3.12); desviarse de ellas puede romper la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furde/nemotron-3.5-embed-8b-gguf
- Modelo base oficial: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Revisión concreta del modelo base usada en la conversión: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16/tree/781e779ee4ca9c2d2a4f38321993556baeab49a1
- Conversión de referencia de W4D: https://huggingface.co/W4D/Nemotron-3.5-Embed-8B-GGUF
- llama.cpp v1.1.0: https://github.com/ggml-org/llama.cpp/releases/tag/v1.1.0
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Modelo base textual (Ministral-3-8B-Instruct-2512-BF16): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
