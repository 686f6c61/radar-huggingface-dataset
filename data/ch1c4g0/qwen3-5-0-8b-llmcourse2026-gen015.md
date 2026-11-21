# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen015

## Resumen

`Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen015` es un ajuste fino mediante LoRA del modelo base `Qwen/Qwen3.5-0.8B` de Alibaba Cloud, desarrollado por el usuario Ch1c4g0 en el contexto del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en una única tarea: generación de respuestas con atribución de fuentes dentro de un pipeline de RAG (Retrieval-Augmented Generation) sobre Wikipedia en japonés.

La tarea concreta consiste en recibir una pregunta junto con cinco fragmentos de documentación recuperados y emitir un objeto JSON con la respuesta y el identificador del fragmento que la respalda (`{"answer": ..., "chunk_id": ...}`). Se trata, por tanto, de un modelo de respuesta extractiva con citación, no de un asistente generalista.

Con 873 millones de parámetros y licencia Apache 2.0, el interés del modelo es acotado: sirve como referencia de un ejercicio docente de ajuste fino eficiente (LoRA sobre un modelo pequeño, entrenado íntegramente en Google Colab) y como componente de un sistema RAG japonés de bajo coste. No hay métricas publicadas ni descargas, y su ámbito lingüístico declarado es exclusivamente el japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con capas de atención que incluyen proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` (atención con compuerta, estilo Qwen3-Next) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene pesos safetensors en precisión original) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,8 GB |
| Modelo base | `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) |
| Pipeline declarado | question-answering |
| Fecha de publicación | 21 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura del base Qwen3.5-0.8B: estructura, `config`, tokenizador, chat template y nombres, formas y tipos de los tensores son idénticos al original. La única modificación es la fusión de los pesos LoRA en los pesos base. El ajuste LoRA se aplicó con r=16, alpha=32 y dropout de 0,05 sobre las capas lineales del modelo de lenguaje: `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj`, `v_proj` y las proyecciones específicas de atención `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z` y `out_proj`. El entrenamiento duró 3 épocas sobre 1.808 ejemplos y se ejecutó en Google Colab sin APIs externas ni otros LLM.

Los datos de entrenamiento combinan tres fuentes en japonés, todas con licencia CC BY-SA 4.0 y reformateadas al esquema JSON de salida: JEMHopQA (train, ver1.2), 1.000 preguntas muestreadas de JSQuAD (train, v1.3, parte de JGLUE) y 1.710 preguntas multi-salto construidas a partir de `auto-wiki-qa` mediante reglas de sustitución de cadenas entre artículos. Los fragmentos de contexto provienen de los chunks de Wikipedia japonesa distribuidos en el dataset del concurso `bumbuboon/llm-course-final-2026`. Se filtraron las preguntas sin respaldo en los documentos recuperados. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de respuestas extractivas en japonés a partir de un contexto documental proporcionado (cinco fragmentos por consulta).
- Salida estructurada en JSON con dos campos: `answer` (texto de la respuesta) y `chunk_id` (índice del fragmento que la respalda).
- Atribución de fuentes: el modelo aprende a señalar explícitamente qué documento justifica la respuesta.
- Razonamiento multi-salto limitado: parte del entrenamiento incluye preguntas que requieren encadenar dos artículos de Wikipedia.
- Manejo de preguntas sin respuesta en el contexto (el filtrado durante el entrenamiento excluyó estos casos, por lo que la cobertura de abstención es incierta).
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo de razonamiento explícito (thinking), visión ni audio.
- Capacidad multilingüe: no disponible; el modelo declara únicamente japonés.

## Casos de uso

- Respuesta con citación en un sistema RAG japonés: el modelo recibe la pregunta y los cinco fragmentos recuperados por el retriever y devuelve la respuesta junto al `chunk_id` de respaldo, lo que permite mostrar la fuente al usuario final y auditar la respuesta.
- Evaluación de pipelines de recuperación: al estar entrenado para identificar el fragmento correcto, el `chunk_id` predicho sirve como señal para medir la calidad del retriever de forma independiente del generador.
- Asistente de consulta sobre Wikipedia japonesa: integrado en un buscador interno o chatbot de documentación, responde preguntas factuales acotadas al corpus indexado.
- Prototipado docente y experimentación: al caber en una GPU de consumo y haberse entrenado en Colab, es un punto de partida reproducible para cursos de ajuste fino con LoRA.
- Extracción de respuestas en pipelines de datos: el formato JSON fijo facilita el parseo automático y la integración en flujos de procesamiento por lotes de preguntas-respuesta.
- Componente de bajo coste en sistemas multi-etapa: puede actuar como generador final de un pipeline donde un modelo mayor redacta y este modelo se encarga de la atribución o de la verificación de respaldo documental.
- Despliegue en entornos con recursos limitados: con menos de 1.000 millones de parámetros, es viable en CPU o en GPUs modestas para cargas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, EM ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV (estimación práctica de 3-4 GB para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB de pesos; en 4 bits, en torno a 0,5 GB (estimaciones, no verificadas con este modelo concreto).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. Cabe en GPUs de consumo.
- Despliegue: compatible con vLLM, TGI, llama.cpp y Ollama siempre que exista soporte para la arquitectura Qwen3.5; no se ha verificado la disponibilidad de conversión a GGUF para este checkpoint.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen015` | 873 M | no disponible | QA con citación en japonés (RAG) | Apache 2.0 | Hugging Face, 0 descargas |
| `Qwen/Qwen3.5-0.8B` (base) | ~0,8 B | no disponible | Modelo generalista multilingüe | Apache 2.0 | Hugging Face |
| Otros ajustes del mismo curso | no disponible | no disponible | QA RAG japonés | Apache 2.0 (presumible) | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación con el modelo base es la más relevante: este checkpoint sacrifica generalidad a cambio de un formato de salida JSON fijo y de la capacidad de citar fuentes en japonés.

## Limitaciones y advertencias

- Ámbito lingüístico restringido al japonés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Especialización estrecha: el modelo espera una pregunta más cinco fragmentos y produce JSON con `answer` y `chunk_id`; fuera de ese formato su comportamiento es impredecible.
- Riesgo de alucinación: al ser un modelo pequeño ajustado para responder, puede generar respuestas no respaldadas por los fragmentos o citar un `chunk_id` incorrecto.
- El entrenamiento excluyó preguntas sin respaldo documental, por lo que la capacidad de abstenerse ante contextos insuficientes no está garantizada.
- Sin métricas publicadas ni validación independiente; no hay evidencia cuantitativa de su calidad.
- Los datos de entrenamiento derivan de JEMHopQA, JSQuAD y auto-wiki-qa (CC BY-SA 4.0); aunque el modelo se distribuye con Apache 2.0, conviene revisar las obligaciones de atribución de las fuentes si se redistribuye o se usa comercialmente.
- Sin descargas ni likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- No se documenta la longitud de contexto efectiva, lo que impide planificar el tamaño de los fragmentos de entrada con precisión.
- El tamaño del repositorio (1,8 GB) para 873 M de parámetros sugiere pesos en fp32 o bf16; verificar el dtype antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen015
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset del concurso (chunks de Wikipedia japonesa): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
