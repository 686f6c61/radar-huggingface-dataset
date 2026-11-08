# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen001

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen001 es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 como parte del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa. El modelo está especializado en una tarea muy concreta: la generación de respuestas en un sistema de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés, emitiendo la respuesta junto con el identificador del fragmento de documento que la respalda.

El modelo parte de la arquitectura Qwen3.5 de 0.8B parámetros (873.438.784 parámetros reales según los pesos en safetensors) y se ha adaptado mediante LoRA con rango 16 sobre las capas lineales del transformer, fusionando posteriormente los pesos resultantes en el modelo original. La estructura, configuración, tokenizador y plantilla de chat se mantienen idénticas a las del modelo base, por lo que es un reemplazo directo del mismo.

Su relevancia es acotada: no es un modelo de propósito general, sino una demostración de ajuste fino para una competición académica concreta, con solo 1.062 ejemplos de entrenamiento y salida en formato JSON estructurado. Resulta útil como referencia para quienes quieran replicar un pipeline de RAG con atribución de fuentes sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen3.5), sin datos detallados de capas en la información disponible |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información del modelo ajustado; el modelo base dispone de versiones GGUF (1,68 GB) según fuentes externas |
| Idiomas soportados | Japonés (ja); el modelo base Qwen3.5 es multilingüe según Qualcomm AI Hub |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-0.8B original: un transformer denso de aproximadamente 873 millones de parámetros. Sobre él se aplicó un LoRA con rango 16, alpha 32 y dropout 0,05, conectado a las capas lineales del modelo de lenguaje: down_proj, gate_proj, in_proj_a, in_proj_b, in_proj_qkv, in_proj_z, k_proj, o_proj, out_proj, q_proj, up_proj y v_proj. El entrenamiento se realizó durante una única época y, posteriormente, la diferencia de pesos del LoRA se fusionó en los ficheros del modelo original, de modo que el checkpoint final no requiere adaptadores separados.

La tarea de entrenamiento consiste en recibir una pregunta junto con tres documentos recuperados y generar un objeto JSON con dos campos: `answer` (la respuesta) y `chunk_id` (el número del documento que sirve de evidencia). Se usaron 1.062 ejemplos construidos a partir de JEMHopQA (train, ver1.2) y JSQuAD (train, v1.3, 1.000 preguntas muestreadas aleatoriamente), ambos bajo licencia CC BY-SA 4.0, combinados con fragmentos de Wikipedia en japonés del conjunto de datos de la competición. Se descartaron las preguntas sin respaldo en los documentos recuperados. Todo el proceso, incluida la creación de datos y el entrenamiento, se ejecutó en Google Colab sin APIs externas ni otros LLM.

## Capacidades

- Generación de respuestas extractivas y abstractivas en japonés a partir de documentos de contexto.
- Atribución de fuentes: devuelve el identificador del fragmento (`chunk_id`) que respalda la respuesta.
- Salida estructurada en JSON con el esquema `{"answer": ..., "chunk_id": ...}`.
- Procesamiento de múltiples documentos de contexto (tres fragmentos por consulta en el entrenamiento).
- Capacidad multilingüe heredada del modelo base Qwen3.5, aunque el ajuste fino está orientado al japonés.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- **Sistemas de preguntas y respuestas sobre Wikipedia en japonés**: el modelo está entrenado específicamente para recibir una pregunta y tres fragmentos recuperados, y devolver una respuesta con la referencia al fragmento correcto, lo que facilita la verificación de la respuesta.
- **RAG con atribución de fuentes en atención al cliente**: en un chatbot documental en japonés, el `chunk_id` de salida permite enlazar cada respuesta con el pasaje exacto de la base de conocimiento, reduciendo el riesgo de respuestas sin respaldo.
- **Evaluación de pipelines de recuperación**: al devolver el identificador del fragmento utilizado, sirve para medir la calidad del recuperador (retriever) en un sistema RAG, comparando el `chunk_id` predicho con el esperado.
- **Prototipado educativo y académico**: es un ejemplo reproducible de ajuste fino con LoRA sobre un modelo pequeño de 0,8B, útil para cursos y talleres sobre RAG y fine-tuning.
- **Despliegue en entornos con recursos limitados**: con menos de 900 millones de parámetros, puede ejecutarse en GPU de consumo y en dispositivos edge, como sugiere la disponibilidad del modelo base en Qualcomm AI Hub.
- **Generación de conjuntos de datos anotados**: la salida JSON estructurada permite usar el modelo para preanotar pares pregunta-respuesta-fuente en corpus japoneses, que luego se revisan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en precisión completa (fp32) el modelo ocupa aproximadamente 3,5 GB; en fp16/bf16, unos 1,75 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB (estimaciones a partir del número de parámetros, no verificadas con el checkpoint).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para fp16; para cuantizaciones de 4-8 bits bastan GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- **Cabe en GPU de consumo**: sí, con holgura en fp16 en tarjetas de 8 GB o más; en cuantización 4 bits podría ejecutarse incluso en iGPU o dispositivos edge.
- **Opciones de despliegue**: al conservar la arquitectura y el tokenizador del modelo base, es compatible con las herramientas habituales para Qwen3.5 (transformers, vLLM, llama.cpp/Ollama mediante conversión a GGUF, TGI). El modelo base dispone de versiones GGUF publicadas.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen001 | 873 M | No disponible | RAG QA en japones con atribucion | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | Proposito general, multilingue | Apache 2.0 | Hugging Face, Qualcomm AI Hub, GGUF |
| Modelos QA japoneses de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación más directa es con el modelo base Qwen3.5-0.8B, del que este checkpoint hereda arquitectura, tokenizador y licencia, y al que añade la especialización en RAG con salida JSON atribuida. No se dispone de datos de benchmarks que permitan comparar su rendimiento con alternativas especializadas en QA japonés.

## Limitaciones y advertencias

- **Alcance muy restringido**: el ajuste fino se entrenó con solo 1.062 ejemplos y para una tarea concreta (pregunta + tres documentos → JSON). Fuera de ese formato, su comportamiento puede degradarse respecto al modelo base.
- **Idioma**: está orientado al japonés; aunque el modelo base es multilingüe, no hay garantías de calidad en castellano u otros idiomas tras el ajuste fino.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir respuestas no respaldadas por los documentos, o asignar un `chunk_id` incorrecto. El campo de atribución debe validarse en producción.
- **Sesgos**: no se documentan análisis de sesgo; los datos de entrenamiento provienen de Wikipedia, JEMHopQA y JSQuAD, con los sesgos propios de esas fuentes.
- **Licencia**: Apache 2.0 permite uso comercial, pero los datos de entrenamiento (JEMHopQA, JSQuAD, Wikipedia) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre derivados de esos datos.
- **Madurez**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026 como entrega de un curso; no hay evidencia de uso en producción ni de mantenimiento.
- **Contexto**: no se dispone de la longitud de contexto del modelo base en la información proporcionada, lo que impide garantizar el manejo de documentos largos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen001)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Qwen3.5-0.8B en Qualcomm AI Hub](https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b)
- [Qwen3.5 0.8B GGUF (local-ai-zone)](https://local-ai-zone.github.io/models/qwen3-5-0-8b.html)
- [JEMHopQA (GitHub)](https://github.com/aiishii/JEMHopQA)
- [JGLUE / JSQuAD (GitHub)](https://github.com/yahoojapan/JGLUE)
- [Conjunto de datos de la competición](https://huggingface.co/datasets/bumbuboon/llm-course-final-2026)
- [Wikipedia en japonés](https://ja.wikipedia.org/)
- [Licencia CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
