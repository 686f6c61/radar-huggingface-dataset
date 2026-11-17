# nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG-GGUF

## Resumen

MonkeyGrab-Qwen3-0.6B-RAG-GGUF es la versión cuantizada en formato GGUF de un modelo de respuesta especializado en generación aumentada por recuperación (RAG) sobre documentos PDF. Lo desarrolla nadiva1243 como destilación de `qwen3:4b-instruct-2507` sobre Qwen3-0.6B, entrenado con los prompts exactos de MonkeyGrab, una aplicación local de RAG para PDFs que combina recuperación híbrida BM25 más embeddings y generación con Ollama. El modelo resuelve un problema concreto: permitir RAG de calidad aceptable en GPUs con tan solo 4 GB de VRAM, donde el modelo profesor de 4B no cabe.

Con 596.049.920 parámetros y un tamaño de repositorio de 1,5 GB, el modelo está pensado como modelo de respuesta por defecto del perfil `rag-lite` de MonkeyGrab. La cuantización Q4_K_M ocupa 397 MB y consume 1,52 GB de VRAM en Ollama, frente a los 3,90 GB del profesor. La relevancia actual reside en que demuestra que la destilación con pérdida combinada de entropía cruzada y divergencia KL sobre logits del profesor permite a un modelo de 0,6B acercarse sustancialmente al rendimiento de un 4B en una tarea acotada de extracción de respuestas.

El modelo soporta inglés, español y catalán, y está liberado bajo licencia Apache-2.0. No es un modelo de propósito general: está entrenado y evaluado sobre el formato de prompt y contexto de MonkeyGrab, por lo que fuera de ese entorno se comporta como un Qwen3-0.6B con sesgo hacia respuestas extractivas cortas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste LoRA fusionado |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; evaluado a 16k tokens en la puerta de evaluación |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | en, es, ca |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se ajusta mediante LoRA de rango 32 (alpha 64) sobre todas las proyecciones de atención y MLP. La pérdida se calcula únicamente sobre los tokens de respuesta, con secuencias de hasta 14336 tokens, 2 épocas, learning rate 2e-4 con decaimiento coseno, batch efectivo de 8 y precisión bf16. Sobre el ajuste supervisado se aplica destilación de logits: se usan las top-32 log-probabilidades del profesor `qwen3:4b-instruct-2507` en cada posición de respuesta, con una pérdida combinada `0.5 * CE + 0.5 * KL(teacher || student)`.

Los datos de entrenamiento constan de 3364 filas sobre 65 documentos (artículos de arXiv y de Wikipedia en inglés, español y catalán), disjuntos del corpus de evaluación. Incluyen preguntas extractivas generadas por el profesor sobre fragmentos indexados y respondidas a través de la recuperación y el prompt propios de MonkeyGrab, filtradas por el grader de la puerta de evaluación; respuestas juzgadas por Claude Haiku contra una rúbrica y reescritas por Claude Sonnet cuando eran corregibles, con auditoría de una muestra por Claude Opus; pares pregunta-respuesta orientados a tablas y números escritos por Claude Sonnet y verificados uno a uno por Claude Haiku; y artefactos de estudio del profesor (resumen, esquema, cuestionario) para cada documento e idioma. El entrenamiento completo requirió 4 h 37 min en una RTX 4060 Laptop con un pico de 5,9 GB. La exportación se realizó fusionando el LoRA, convirtiendo con llama.cpp b11669 y cuantizando.

Se probaron alternativas que no superaron al modelo final, todas medidas sobre la misma puerta: DPO sobre muestras on-policy calificadas (empate), un peso del profesor de 0,8 (10 casos perdidos), una tercera época (un caso por detrás), y pesos Q5_K_M y Q8_0 (dentro de un caso de diferencia).

## Capacidades

- Generación de texto extractivo: responde preguntas factuales (números, nombres, fechas) leyendo el contexto recuperado.
- Modos de estudio: genera resúmenes, esquemas y cuestionarios a partir de los documentos, evaluados por estructura y fuentes.
- Multilingüe: entrenado y evaluado en inglés, español y catalán.
- Integración con RAG: diseñado para funcionar con el prompt de sistema y el formato de contexto de MonkeyGrab (recuperación híbrida BM25 más embeddings).
- Compatibilidad con Ollama: incluye plantilla ChatML y parámetros de muestreo (temperatura 0,6, top_k 20, top_p 0,95).
- Sin modo de razonamiento: debe invocarse con `think=false`; fue entrenado sin bloque de razonamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Asistente de preguntas sobre PDFs en local: el modelo responde preguntas factuales extrayendo datos del contexto recuperado, adecuado para equipos con GPUs de 4 GB donde el profesor de 4B no cabe.
- Despliegue en el perfil `rag-lite` de MonkeyGrab: es el modelo por defecto de ese perfil (`MONKEYGRAB_PROFILE=lite`), por lo que se integra sin configuración adicional en esa aplicación.
- Generación de resúmenes de documentos: produce resúmenes estructurados de artículos y páginas de Wikipedia en los tres idiomas soportados, evaluados por estructura y fuentes.
- Creación de esquemas y cuestionarios de estudio: genera artefactos de estudio a partir de documentos, útil para herramientas de aprendizaje sobre corpus propios.
- Extracción de datos de tablas: entrenado específicamente con pares orientados a tablas y números, adecuado para consultas que requieren leer valores numéricos de tablas en documentos.
- Atención al cliente sobre base documental: puede gestionar consultas multi-turno sobre documentación indexada, siempre que se respete el formato de contexto de MonkeyGrab y se mantenga la caché KV en q8_0 o superior.
- Evaluación de pipelines RAG en hardware modesto: al consumir 1,52 GB de VRAM, permite iterar sobre recuperación y prompts en portátiles con GPU de 8 GB sin depender de servidores.

## Benchmarks y rendimiento

La puerta de evaluación de MonkeyGrab (`tests/eval/run_eval.py`) consta de 136 preguntas verificadas manualmente con respuesta esperada comprobada, sobre 17 artículos y páginas de Wikipedia por idioma en inglés, español y catalán. 124 casos son factuales y 12 son modos de estudio, calificados por estructura y fuentes. Todos los modelos de una fila se compararon en la misma ejecución y con la misma recuperación. Hardware: RTX 4060 Laptop (8 GB), Ollama 0.40, contexto de 16k, caché KV q8_0. La VRAM es el pico de `size_vram` reportado por Ollama.

| Modelo | Respondidas /136 | Estudio /12 | Mediana s/caso | VRAM en Ollama |
|---|---|---|---|---|
| `qwen3:0.6b`, stock | 104 a 105 | 10 | 6,5 | no disponible |
| **este modelo, Q4_K_M** | **126 a 127** (seis ejecuciones) | **12** | 6,2 | **1,52 GB** |
| `qwen3:4b-instruct-2507`, profesor | 135 | 12 | 9,6 | 3,90 GB |

Ninguno de los documentos de la puerta se usó para entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,52 GB en Ollama con Q4_K_M (medido); Q5_K_M ocupa 444 MB en disco y Q8_0 639 MB, con consumo de VRAM no especificado pero superior.
- GPU recomendadas: RTX 4060 Laptop (8 GB) fue el hardware de entrenamiento y evaluación; cualquier GPU con al menos 4 GB de VRAM es suficiente para Q4_K_M.
- Cabe en GPU de consumo: sí, en GPUs con 4 GB o más, que es precisamente el objetivo del perfil `rag-lite`.
- Opciones de despliegue: Ollama (`ollama pull hf.co/nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG-GGUF:Q4_K_M`), llama.cpp (formato GGUF nativo), y cualquier runtime compatible con GGUF.
- Latencia y throughput: mediana de 6,2 s por caso en la puerta de evaluación con RTX 4060 Laptop, contexto de 16k y caché KV q8_0.
- Caché KV: debe mantenerse en q8_0 o f16; q4_0 degrada gravemente el modelo en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en puerta /136 | VRAM | Licencia |
|---|---|---|---|---|---|
| MonkeyGrab-Qwen3-0.6B-RAG (Q4_K_M) | 596 M | 16k (evaluado) | 126 a 127 | 1,52 GB | Apache-2.0 |
| `qwen3:0.6b` stock | 596 M | no disponible | 104 a 105 | no disponible | Apache-2.0 |
| `qwen3:4b-instruct-2507` (profesor) | 4B (aprox.) | no disponible | 135 | 3,90 GB | Apache-2.0 |

El modelo se sitúa a 8-9 casos del profesor de 4B en la puerta, consumiendo un 61 % menos de VRAM y con una mediana de latencia inferior (6,2 s frente a 9,6 s). Frente al Qwen3-0.6B stock, gana 21-23 casos, lo que cuantifica el efecto de la destilación sobre la tarea específica.

## Limitaciones y advertencias

- Entrenado y medido sobre el prompt de sistema y el formato de contexto de MonkeyGrab; en otros prompts RAG se comporta como un Qwen3-0.6B con sesgo hacia respuestas extractivas cortas.
- Los errores residuales son mayoritariamente números leídos incorrectamente de una tabla.
- Con contexto vacío inventa una respuesta en lugar de declinar, igual que el modelo stock.
- Una caché KV en q4_0 rompe el modelo en contextos largos (57/136 en la puerta): las respuestas degeneran y se alargan. Usar q8_0 o f16.
- Debe invocarse con `think=false`; no fue entrenado con bloque de razonamiento.
- Los datos de entrenamiento no se publican porque sus contextos son pasajes literales de artículos de arXiv, algunos sin permiso de redistribución; los scripts los reconstruyen desde las fuentes.
- Riesgo de alucinación en preguntas fuera del contexto recuperado o cuando la recuperación no devuelve el pasaje relevante.
- Licencia Apache-2.0, igual que Qwen3-0.6B y el profesor, sin restricciones conocidas para uso comercial.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG-GGUF
- Modelo base en safetensors: https://huggingface.co/nadiva1243/MonkeyGrab-Qwen3-0.6B-RAG
- Qwen3-0.6B original: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio MonkeyGrab: https://github.com/iDiagoValeta/localOllamaRAG
- Código de entrenamiento y registro del experimento: https://github.com/iDiagoValeta/localOllamaRAG/tree/develop/training
