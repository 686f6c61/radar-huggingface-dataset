# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen018

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen018 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 para el trabajo final del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa. El modelo está especializado en generación de respuestas para un sistema de RAG (Retrieval-Augmented Generation) sobre Wikipedia en japonés, resolviendo el problema de producir respuestas estructuradas con trazabilidad de la fuente.

El ajuste se realizó mediante LoRA (r=16, alpha=32, dropout=0.05) sobre las capas lineales del modelo, entrenado durante 2 épocas con 2.673 ejemplos, y posteriormente fusionado con los pesos originales. El modelo resultante conserva la arquitectura, configuración, tokenizador y chat template del modelo base, con 873.438.784 parámetros totales y un tamaño de repositorio de 1,8 GB.

Su relevancia radica en que demuestra un flujo completo de especialización de un LLM pequeño (sub-1000M) para una tarea concreta de question-answering con citación de fuentes, entrenado íntegramente en Google Colab sin APIs externas ni otros LLM, lo que lo convierte en un caso práctico reproducible para entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, arquitectura del modelo base; no se detalla más en la información disponible) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; no se especifican cuantizaciones publicadas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), un transformer de 873 millones de parámetros. El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0.05, aplicado a las capas lineales `down_proj`, `gate_proj`, `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj` y `v_proj`. El entrenamiento duró 2 épocas y, tras finalizar, los deltas de LoRA se integraron en los pesos originales, de modo que la estructura, config, tokenizador, chat template y nombres/formas/tipos de los pesos son idénticos al modelo base.

La tarea de entrenamiento consiste en recibir una pregunta junto con 5 documentos recuperados y generar un JSON con la forma `{"answer": ..., "chunk_id": ...}`, donde `chunk_id` identifica el documento que fundamenta la respuesta. El conjunto de entrenamiento (2.673 ejemplos) se construyó a partir de JEMHopQA (train, ver1.2), JSQuAD (train, v1.3, 1.000 preguntas muestreadas) y auto-wiki-qa (revisión `672dd0d496352282b4064e944a16e00315b796a8`), con preguntas multi-salto generadas por reglas de sustitución de cadenas y filtrado de ejemplos sin fundamento en los documentos recuperados. Los documentos de contexto provienen de los chunks de Wikipedia japonesa del dataset del concurso `bumbuboon/llm-course-final-2026`. Todo el proceso se ejecutó en Google Colab sin APIs externas ni otros LLM.

## Capacidades

- Generación de respuestas de question-answering en japonés fundamentadas en documentos recuperados.
- Producción de salida estructurada en JSON con dos campos: `answer` (texto de la respuesta) y `chunk_id` (identificador del documento que sirve de evidencia).
- Razonamiento multi-salto sobre hasta 5 documentos de contexto (capacidad inducida por el entrenamiento con JEMHopQA y las preguntas multi-artículo de auto-wiki-qa).
- Citación de fuentes: el modelo selecciona el chunk que respalda la respuesta entre los proporcionados.
- Especialización en el dominio de Wikipedia en japonés.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, modo thinking, visión o audio en la documentación proporcionada.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia japonesa con trazabilidad: el modelo recibe una pregunta y 5 chunks recuperados y devuelve la respuesta junto con el `chunk_id` de la evidencia, lo que permite auditar la fuente en un pipeline de RAG.
- Sistemas de RAG educativos o de investigación: sirve como generador de referencia en experimentos de recuperación y generación sobre Wikipedia en japonés, dado su bajo coste de despliegue (873M parámetros).
- Preguntas multi-salto: el entrenamiento con JEMHopQA y auto-wiki-qa lo hace adecuado para consultas que requieren combinar información de varios artículos (por ejemplo, "¿quién dirigió la película cuyo guionista nació en la ciudad X?").
- Prototipado en entornos con recursos limitados: al ser un modelo sub-1000M, puede ejecutarse en hardware modesto, lo que lo hace útil para demos y pruebas de concepto de RAG en japonés.
- Evaluación de pipelines de recuperación: al devolver el `chunk_id` de la evidencia, permite medir la calidad de la recuperación (si el modelo cita un chunk irrelevante, el retriever puede ser el problema).
- Fine-tuning incremental como caso de estudio: el modelo documenta un flujo completo de LoRA + fusión reproducible en Colab, útil como plantilla para especializar modelos pequeños en tareas de QA con citación.
- Generación de conjuntos de datos sintéticos de QA con evidencia: las salidas JSON pueden usarse para construir datasets de entrenamiento o evaluación con anotación de fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa basada en el tamaño (873M parámetros), los pesos en safetensors ocupan aproximadamente 1,8 GB en el repositorio; en fp16 serían ~1,7 GB y en cuantización de 8 bits ~0,9 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo podría ejecutarse en GPUs de consumo, pero no se especifican modelos concretos en la documentación.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por el número de parámetros es plausible en GPUs con suficiente VRAM, pero no se aportan datos de prueba.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen018 | 873.438.784 | No disponible | QA con citación sobre Wikipedia japonesa (RAG) | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B (no confirmado en la información) | No disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Otros modelos de ~1B para QA en japonés | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre benchmarks ni de otros modelos comparables en la documentación proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de datos de rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para japonés; no se garantiza un comportamiento correcto en otros idiomas.
- Especializado en una tarea muy concreta (QA con 5 documentos de contexto y salida JSON); fuera de ese formato puede degradarse respecto al modelo base.
- Riesgo de alucinación: aunque el entrenamiento filtra ejemplos sin fundamento en los documentos, el modelo puede generar respuestas no respaldadas por los chunks proporcionados o citar un `chunk_id` incorrecto.
- La longitud de contexto no está documentada, lo que impide garantizar el comportamiento con más de 5 documentos o documentos muy largos.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse sobre Wikipedia japonesa y datasets derivados (JEMHopQA, JSQuAD, auto-wiki-qa) hereda los sesgos de esas fuentes.
- Restricciones de licencia: el modelo es Apache 2.0, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad para uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Entrenado en Google Colab con 2.673 ejemplos y 2 épocas: el volumen de datos es reducido, lo que limita la generalización.
- No se documentan pruebas de robustez, evaluación cuantitativa ni comparación con el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen018
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset del concurso (chunks de Wikipedia japonesa): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
