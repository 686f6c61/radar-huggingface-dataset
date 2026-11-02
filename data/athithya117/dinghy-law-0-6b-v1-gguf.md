# Athithya117/dinghy-law-0.6b-v1-gguf

## Resumen

dinghy-law-0.6b-v1-gguf es la conversión al formato GGUF del modelo de embeddings legales `Hanno-Labs/dinghy-law-0.6b-v1`, un fine-tune contrastivo de `Qwen/Qwen3-Embedding-0.6B` con 595.776.512 parámetros (aproximadamente 0,6B). Lo publica el usuario Athithya117 en HuggingFace y su propósito es permitir la generación de embeddings legales en entornos basados en llama.cpp, sin depender de PyTorch ni de la pila de sentence-transformers.

El modelo resuelve un problema concreto: desplegar búsqueda semántica y recuperación de documentos jurídicos en infraestructura ligera (CPU, contenedores pequeños, edge) manteniendo la fidelidad del modelo original. La conversión conserva únicamente el backbone del transformer (pooling de último token más normalización L2) y descarta la cabeza densa `2_Dense`, que según el autor es una rotación casi ortogonal y por tanto irrelevante para el ranking por similitud coseno.

Es relevante ahora porque los embeddings legales de dominio específico suelen publicarse solo en safetensors, lo que complica su uso en pipelines de recuperación aumentada (RAG) con llama.cpp o servidores de embeddings ligeros. Esta build ofrece tres cuantizaciones (f16, Q8_0 y Q6_K) con métricas de fidelidad publicadas y una licencia Apache 2.0 permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-Embedding-0.6B) con pooling de último token y normalización L2 |
| Parámetros totales | 595.776.512 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune contrastivo de `Qwen/Qwen3-Embedding-0.6B`, un transformer decoder-only de 0,6B parámetros especializado en representaciones vectoriales. La pipeline original de sentence-transformers es `Transformer -> last-token pooling -> Dense -> L2 Normalize`. La conversión a GGUF conserva el backbone (`Transformer -> last-token pool -> L2 norm`) y elimina la capa `2_Dense`, que el autor describe como una rotación casi ortogonal (defecto de ortogonalidad normalizado de 0,00103, normas de fila unitarias y sesgo cercano a cero). Dado que la similitud coseno es invariante bajo rotación, la omisión no altera el ranking de recuperación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus jurídico ni si se aplicaron técnicas de RLHF o DPO. El autor reporta que la revisión de origen es `8f63ca78b621eb9c242429ea2472389d23f8902f` y que la cuantización se realizó con `llama.cpp/convert_hf_to_gguf.py` (f16) y `llama-quantize` (Q8_0, Q6_K). La innovación técnica destacable es la verificación de fidelidad: el f16 reproduce el embedding del backbone de HuggingFace con coseno 1.00000 sobre sondas legales.

## Capacidades

- Generación de embeddings de texto para recuperación semántica y búsqueda por similitud, no generación de texto.
- Especialización en dominio legal: entrenado para discriminar entre textos jurídicos y consultas sobre estatutos, obligaciones y situaciones legales.
- Pooling de último token con normalización L2, compatible con `llama-embedding` mediante `--pooling last --embd-normalize 2`.
- Soporte de prefijo de instrucción de Qwen3-Embedding para consultas (`Instruct: {task_instruction}\nQuery: {query}`), mientras los documentos se embeben en crudo.
- Compatible con endpoints de la API de HuggingFace (`endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo de feature extraction.

## Casos de uso

- Búsqueda semántica de jurisprudencia y estatutos: indexar un corpus de sentencias y leyes con el modelo y recuperar los fragmentos más relevantes ante una consulta en lenguaje natural, usando el prefijo de instrucción adecuado para la consulta.
- RAG sobre contratos y expedientes: generar embeddings de cláusulas y documentos internos para que un LLM generativo recupere el contexto legal pertinente antes de responder, con despliegue en llama.cpp sobre CPU.
- Asistencia a revisión de cumplimiento normativo: comparar políticas internas con textos regulatorios y detectar pasajes con obligaciones aplicables mediante similitud coseno.
- Deduplicación y agrupación de documentos legales: calcular embeddings de expedientes y agrupar por cercanía para detectar duplicados o familias de casos similares.
- Enrutamiento de consultas legales: clasificar consultas entrantes hacia el área de práctica adecuada (laboral, civil, fiscal) comparando su embedding con prototipos por categoría.
- Despliegue en entornos con recursos limitados: servir el modelo Q6_K (0,49 GB) en contenedores pequeños o dispositivos edge para búsqueda legal offline, sin dependencia de PyTorch.
- Evaluación de similitud entre versiones de un texto normativo: comparar embeddings de redacciones sucesivas de un artículo para cuantificar cambios semánticos.

## Benchmarks y rendimiento

El autor reporta el rendimiento del modelo completo (no de la build GGUF) en MTEB(Law, v1):

| Métrica | Valor |
|---|---|
| MTEB(Law, v1) Mean(Task) nDCG@10 | 65,83 |

Fidelidad de la cuantización respecto al backbone de HuggingFace sobre sondas legales:

| Archivo | Coseno medio | Coseno mínimo |
|---|---|---|
| f16 | 1,00000 | 1,00000 |
| Q8_0 | 0,99911 | 0,99896 |
| Q6_K | 0,99313 | 0,99009 |

No se han publicado resultados comparativos con otros modelos de embeddings legales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para f16, 0,7 GB para Q8_0 y 0,55 GB para Q6_K, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y quedan sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más, e incluso en iGPU con memoria unificada.
- Despliegue: llama.cpp (`llama-embedding`), servidores compatibles con llama.cpp y Ollama; el modelo base puede servirse con sentence-transformers o Text Embeddings Inference (TEI).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (0,6B) se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| dinghy-law-0.6b-v1 (esta build) | 595,8M | No disponible | Legal | Apache 2.0 | f16, Q8_0, Q6_K |
| Qwen/Qwen3-Embedding-0.6B (base) | 0,6B | No disponible | General | Apache 2.0 | Disponible en la comunidad |
| Hanno-Labs/dinghy-law-0.6b-v1 (original) | 595,8M | No disponible | Legal | Apache 2.0 | No (safetensors) |

La comparativa con otros modelos de embeddings legales de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto ni responde preguntas por sí mismo.
- La cabeza `2_Dense` se ha eliminado; aunque el autor argumenta invariancia bajo rotación, cualquier uso que dependa de la salida exacta del modelo original (por ejemplo, comparar vectores con los de sentence-transformers sin renormalizar) puede verse afectado.
- El prefijo de instrucción de Qwen3-Embedding debe aplicarse solo a las consultas, no a los documentos; un uso incorrecto degrada la recuperación.
- No hay información publicada sobre sesgos, idiomas soportados ni comportamiento fuera del dominio legal.
- Riesgo de alucinación no aplica directamente, pero sí de recuperación irrelevante si el corpus difiere del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Embedding-0.6B y del fine-tune original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de las métricas de fidelidad reportadas.
- No se especifica la longitud máxima de contexto soportada en la build GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Athithya117/dinghy-law-0.6b-v1-gguf
- Modelo base original: https://huggingface.co/Hanno-Labs/dinghy-law-0.6b-v1
- Modelo Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- llama.cpp: https://github.com/ggml-org/llama.cpp
