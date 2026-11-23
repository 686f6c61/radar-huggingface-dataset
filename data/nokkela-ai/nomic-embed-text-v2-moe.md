# nokkela-ai/nomic-embed-text-v2-moe

## Resumen

nomic-embed-text-v2-moe es un modelo de embeddings de texto multilingüe basado en una arquitectura de mezcla de expertos (MoE), desarrollado originalmente por Nomic AI y redistribuido en Hugging Face por nokkela-ai como copia independiente del modelo base `nomic-ai/nomic-embed-text-v2-moe-unsupervised`. Resuelve el problema de la recuperación de información multilingüe (retrieval) en aplicaciones RAG, donde los modelos densos grandes imponen costes de memoria y latencia elevados durante la ingesta de corpus y en tiempo de consulta. La propuesta técnica consiste en aplicar un diseño MoE al embedding generalista: 475 M de parámetros totales con solo 305 M activos por token, lo que reduce el coste de inferencia sin sacrificar calidad.

El modelo se presenta en el artículo "Training Sparse Mixture Of Experts Text Embedding Models" (arXiv:2502.07972) como el primer modelo de embeddings generalista con arquitectura MoE. Emplea 8 expertos con enrutamiento top-2, dimensión de embedding flexible de 768 a 256 mediante Matryoshka Representation Learning y una longitud máxima de secuencia de 512 tokens. Está entrenado sobre más de 1.600 millones de pares y cubre aproximadamente 100 idiomas.

Su relevancia actual radica en que ofrece un rendimiento multilingüe de estado del arte (MIRACL 65,80) en la clase de 300 M de parámetros, competitivo con modelos del doble de tamaño, y se distribuye con licencia Apache 2.0 junto con pesos, código y datos de entrenamiento, lo que facilita su auditoría y despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 8 expertos con enrutamiento top-2; tipo `nomic_bert` |
| Parametros totales | 475.292.928 (475 M) |
| Parametros activos | 305 M por token en inferencia |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Aproximadamente 100 idiomas, entre ellos en, es, fr, de, it, pt, nl, pl, tr, ja, vi, ru, ar, zh, ko, hi, entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería sentence-transformers; requiere `trust_remote_code`) |
| Dimension de embedding | 768, reducible a 512, 256 mediante Matryoshka |
| Tamano del repositorio | 1,9 GB |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT adaptado a una capa de mezcla de expertos: 8 expertos con enrutamiento top-2, de modo que cada token activa únicamente dos expertos y el coste computacional efectivo corresponde a 305 M de parámetros aunque el modelo almacene 475 M. Esta es la innovación central del trabajo: trasladar el patrón de eficiencia de los modelos causales MoE al ámbito de los embeddings generalistas, donde el cuello de botella es tanto la memoria del índice como la latencia en tiempo de consulta.

El entrenamiento se realizó sobre más de 1.600 millones de pares de texto y el modelo base declarado es `nomic-ai/nomic-embed-text-v2-moe-unsupervised`, lo que indica una fase no supervisada seguida de ajuste. La model card no detalla la composición exacta del dataset ni si se emplearon RLHF o DPO; el repositorio de código `nomic-ai/contrastors` publica los datos y el pipeline de evaluación para reproducibilidad. El modelo incorpora Matryoshka Representation Learning, que permite truncar la dimensión del embedding de 768 a 512 o 256 con degradación mínima, reduciendo hasta tres veces el coste de almacenamiento del índice vectorial.

Un requisito operativo destacable: el texto debe incluir un prefijo de instrucción de tarea (`search_query: ` para consultas y `search_document: ` para documentos). Omitirlo degrada la calidad de la recuperación.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (pipeline `sentence-similarity` y `feature-extraction`).
- Recuperación multilingüe en aproximadamente 100 idiomas, incluyendo castellano, catalán, euskera y gallego.
- Embeddings de dimensión flexible (768, 512 o 256) mediante Matryoshka, para equilibrar precisión y coste de almacenamiento.
- Soporte de pooling medio sobre las representaciones del tokenizer para obtener el vector de frase.
- Integración con SentenceTransformers y con Transformers (`trust_remote_code=True`).
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints, según los tags del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de visión o audio: es un modelo exclusivamente de embeddings.

## Casos de uso

- Recuperación aumentada por generación (RAG) multilingüe: indexar un corpus documental con el prefijo `search_document:` y consultar con `search_query:`; el diseño MoE mantiene baja la latencia en tiempo de consulta aunque el índice crezca.
- Búsqueda semántica en catálogos de productos en varios idiomas: un mismo índice sirve consultas en castellano, inglés, francés o alemán sin modelos separados por idioma.
- Deduplicación y agrupación de documentos: calcular embeddings de 256 dimensiones con Matryoshka para clustering aproximado a bajo coste y reafinar con 768 dimensiones solo en los candidatos.
- Moderación y clasificación de contenido por similitud: comparar textos entrantes contra un conjunto de referencia de políticas mediante similitud coseno.
- Sistemas de preguntas y respuestas sobre base documental interna: el contexto de 512 tokens encaja con fragmentos de documento típicos en pipelines de chunking.
- Filtrado previo en motores de búsqueda híbridos: usar el embedding como primera etapa de recuperación y delegar el re-ranking a un cross-encoder.
- Análisis de datos no estructurados en la plataforma Atlas de Nomic, según indica la model card.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (modelo original Nomic Embed v2, 305 M activos, dimensión 768):

| Modelo | Parametros (M) | Dim. embedding | BEIR | MIRACL |
|---|---|---|---|---|
| Nomic Embed v2 | 305 | 768 | 52,86 | 65,80 |
| mE5 Base | 278 | 768 | 48,88 | 62,30 |
| mGTE Base | 305 | 768 | 51,10 | 63,40 |
| Arctic Embed v2 Base | 305 | 768 | 55,40 | 59,90 |
| BGE M3 | 568 | 1024 | 48,80 | 69,20 |
| Arctic Embed v2 Large | 568 | 1024 | 55,65 | 66,00 |
| mE5 Large | 560 | 1024 | 51,40 | 66,50 |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,9 GB de pesos, más overhead de activaciones; en fp16 alrededor de 1 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores.
- GPU de datacenter recomendadas para alto throughput: A100, H100, L40S.
- Opciones de despliegue: SentenceTransformers, Transformers con `trust_remote_code=True`, Text Embeddings Inference (TEI) y endpoints compatibles.
- Dependencias específicas: `torch`, `transformers`, `einops` y `megablocks` instalado desde el repositorio de Nomic.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BEIR | MIRACL | Licencia | Pesos y datos abiertos |
|---|---|---|---|---|---|---|
| nomic-embed-text-v2-moe | 475 M totales / 305 M activos | 512 | 52,86 | 65,80 | Apache 2.0 | Sí (pesos, código y datos) |
| mE5 Base | 278 M | no disponible | 48,88 | 62,30 | no disponible | No |
| mGTE Base | 305 M | no disponible | 51,10 | 63,40 | no disponible | No |
| Arctic Embed v2 Base | 305 M | no disponible | 55,40 | 59,90 | no disponible | No |
| BGE M3 | 568 M | no disponible | 48,80 | 69,20 | no disponible | No |

El modelo destaca en recuperación multilingüe (MIRACL) frente a alternativas de tamaño similar, mientras que Arctic Embed v2 Base le supera en BEIR monolingüe. Frente a modelos del doble de tamaño mantiene resultados competitivos con un coste de inferencia menor.

## Limitaciones y advertencias

- Longitud máxima de secuencia de 512 tokens: los documentos más largos deben fragmentarse, lo que puede perder contexto en textos extensos.
- Requiere prefijos de tarea (`search_query: ` y `search_document: `); su omisión degrada la recuperación y es un error frecuente en integraciones.
- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling.
- Riesgo de sesgo heredado de los datos de entrenamiento no supervisado; la model card no documenta evaluaciones de sesgo.
- La model card no especifica la composición del dataset ni detalles de la fase de ajuste, lo que limita la auditoría más allá del código publicado.
- Esta copia concreta es un fork de nokkela-ai con 0 descargas y 0 likes; para producción conviene verificar la integridad de los pesos frente al repositorio original de Nomic AI.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las licencias de las dependencias (`megablocks`).
- No se han publicado datos de cuantización; el soporte de GGUF u otros formatos no está confirmado.

## Enlaces

- Modelo en Hugging Face (copia nokkela-ai): https://huggingface.co/nokkela-ai/nomic-embed-text-v2-moe
- Modelo original: https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe
- Modelo base no supervisado: https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe-unsupervised
- Blog de Nomic AI: https://www.nomic.ai/blog/posts/nomic-embed-text-v2
- Informe técnico (arXiv:2502.07972): https://huggingface.co/papers/2502.07972
- Artículo Matryoshka (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Repositorio de código y datos: https://github.com/nomic-ai/contrastors
- Repositorio de megablocks: https://github.com/nomic-ai/megablocks
- Plataforma Atlas: https://atlas.nomic.ai
- AWS SageMaker: https://aws.amazon.com/marketplace/seller-profile?id=seller-tpqidcj54zawi
