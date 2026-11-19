# protos-photos/Qwen3-Embedding-8B-4bit-DWQ

## Resumen

Qwen3-Embedding-8B-4bit-DWQ es una cuantización en 4 bits (formato DWQ, *distilled weight quantization*) del modelo de embeddings Qwen3-Embedding-8B de Alibaba Qwen, convertida al formato MLX para su ejecución en hardware Apple Silicon. El repositorio `protos-photos/Qwen3-Embedding-8B-4bit-DWQ` es un espejo sin modificaciones del original `mlx-community/Qwen3-Embedding-8B-4bit-DWQ`, mantenido por Protos para preservar la disponibilidad de la descarga. No se trata, por tanto, de un modelo nuevo, sino de un artefacto derivado que conserva la licencia Apache 2.0 y la autoría del original.

El modelo base es un transformer denso de aproximadamente 7.570 millones de parámetros (7,57 B según los pesos en safetensors) especializado en generación de representaciones vectoriales (*embeddings*). Su propósito es producir vectores densos de alta calidad para tareas de similitud semántica, búsqueda, recuperación de información (*retrieval*) y *feature extraction*. La cuantización a 4 bits reduce el peso del repositorio hasta los 4,3 GB, lo que permite ejecutar un modelo de 8B en equipos con memoria unificada modesta.

La relevancia de esta ficha radica en que combina un modelo de embeddings de referencia (Qwen3-Embedding-8B, uno de los mejor valorados en MTEB en su categoría) con un formato de despliegue específico para macOS (MLX). Es útil para desarrolladores que quieran hacer *retrieval* o búsqueda semántica local en un Mac sin depender de GPUs NVIDIA ni de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo de embeddings derivado de Qwen3), convertido a MLX |
| Parámetros totales | 7.567.295.488 (≈7,57 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-Embedding-8B soporta contexto largo, pero el dato exacto no consta) |
| Tipos de cuantización | 4 bits (DWQ), formato MLX |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), repositorio de 4,3 GB |
| Librería | MLX (`mlx-lm` ≥ 0.25.1) |
| Pipeline | `feature-extraction` |
| Modelo base | Qwen/Qwen3-Embedding-8B |
| Revisión del espejo | `885642d6b98742ea03b77a1673579c92ca961efd` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-8B, un transformer denso de la familia Qwen3 adaptado a la tarea de *embedding*. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF/DPO o entrenamiento contrastivo específico. Tampoco se documentan innovaciones arquitectónicas propias de esta variante más allá de las del modelo base.

La contribución específica de este repositorio es la conversión a MLX con cuantización de 4 bits (denominada DWQ en el nombre del artefacto), realizada con `mlx-lm` versión 0.25.1. La cuantización reduce el tamaño de los pesos de forma significativa (repositorio de 4,3 GB frente a los ~15 GB que ocuparía en precisión completa), a costa de una posible pérdida de precisión en los embeddings que no está cuantificada en la información disponible.

## Capacidades

- Generación de embeddings de texto densos para similitud semántica y *sentence-similarity*.
- *Feature extraction*: extracción de representaciones vectoriales de frases, párrafos y documentos.
- Recuperación de información (*retrieval*) y búsqueda semántica.
- Agrupamiento (*clustering*) y deduplicación semántica de textos.
- Ejecución local en hardware Apple Silicon mediante MLX.
- Soporte de *chat template* (el código de ejemplo aplica `apply_chat_template` si está disponible en el tokenizer).
- Capacidades multilingües: no confirmadas en la información proporcionada.
- *Tool calling*, agentes, visión, audio o *thinking mode*: no disponibles en esta variante (el pipeline es `feature-extraction`).

## Casos de uso

- Búsqueda semántica local en macOS: indexar un corpus de documentos y generar embeddings en un Mac con memoria unificada suficiente, gracias al formato MLX y a la cuantización de 4 bits que reduce el peso a 4,3 GB.
- Motor de RAG (*Retrieval-Augmented Generation*) en local: usar el modelo para recuperar pasajes relevantes antes de pasarlos a un LLM, evitando enviar datos a la nube.
- Deduplicación de datasets: calcular similitud entre registros de un corpus para eliminar duplicados semánticos, aprovechando la calidad del modelo base de 8B.
- Clasificación de textos por proximidad a prototipos: generar embeddings de ejemplos etiquetados y clasificar nuevos textos por vecino más cercano, sin necesidad de entrenamiento adicional.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario como vectores y calcular afinidad mediante similitud coseno.
- Evaluación de calidad de respuestas: comparar la similitud semántica entre respuestas generadas y respuestas de referencia en pipelines de evaluación automática.
- Prototipado en portátiles Apple: al ejecutarse con `mlx-lm`, permite iterar sobre pipelines de embeddings sin GPU dedicada, útil para investigación y desarrollo rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas de MTEB ni comparativas de precisión tras la cuantización a 4 bits.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 4,3 GB; se recomienda al menos 8 GB de memoria unificada libre para cargar los pesos y procesar lotes pequeños, y 16 GB o más para lotes mayores.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para GPUs NVIDIA.
- ¿Cabe en GPU de consumo? No aplica en el sentido habitual: el formato es MLX, no GGUF ni safetensors estándar para CUDA. En un Mac con 16 GB de memoria unificada debería cargar sin problemas.
- Opciones de despliegue: `mlx-lm` (versión 0.25.1 o superior) es la vía documentada. El tag `text-embeddings-inference` sugiere compatibilidad con TEI, pero la información no detalla su uso con este artefacto MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B-4bit-DWQ (este) | ≈7,57 B | No disponible | MLX 4-bit | Apache 2.0 | Hugging Face (espejo) |
| Qwen/Qwen3-Embedding-8B (base) | ≈7,57 B | No disponible | Safetensors | Apache 2.0 | Hugging Face |
| mlx-community/Qwen3-Embedding-8B-4bit-DWQ (original) | ≈7,57 B | No disponible | MLX 4-bit | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento ni de otros modelos de embeddings alternativos.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: cualquier problema del artefacto original (precisión tras cuantización, compatibilidad) se hereda.
- La cuantización a 4 bits puede degradar la calidad de los embeddings respecto al modelo en precisión completa; no se cuantifica esa pérdida en la información disponible.
- No es un modelo generativo: el pipeline es `feature-extraction`, por lo que el ejemplo de la model card con `generate` no representa su uso previsto.
- Idiomas soportados no confirmados; el rendimiento multilingüe no está verificado en esta variante.
- Longitud de contexto no documentada en la información disponible; conviene consultar la model card del modelo base antes de usarlo con textos largos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del artefacto original de `mlx-community`.
- Dependencia de ecosistema Apple: si se necesita desplegar en servidores Linux con GPU, este formato no es el adecuado.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí el riesgo de recuperar pasajes irrelevantes si los embeddings degradan.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/protos-photos/Qwen3-Embedding-8B-4bit-DWQ
- Modelo original cuantizado: https://huggingface.co/mlx-community/Qwen3-Embedding-8B-4bit-DWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
