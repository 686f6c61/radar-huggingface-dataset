# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen002

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen002 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 en el contexto del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa. El modelo está especializado en generación de respuestas para un sistema de RAG (Retrieval-Augmented Generation) sobre Wikipedia en japonés, y se presenta como la solución de generación de respuestas para el concurso final del curso.

El modelo parte de Qwen3.5-0.8B, un transformer de aproximadamente 873 millones de parámetros, y ha sido adaptado mediante LoRA (r=16, alpha=32, dropout=0.05) aplicado a las capas lineales del modelo, con una época de entrenamiento sobre 1.998 ejemplos. La tarea aprendida es concreta: recibir una pregunta y tres documentos recuperados como contexto, y producir un JSON con la respuesta y el identificador del fragmento que la respalda (`{"answer": ..., "chunk_id": ...}`).

Su relevancia radica en que ejemplifica el patrón de especialización de modelos pequeños para tareas de recuperación aumentada con salida estructurada y trazabilidad de fuentes, un caso de uso muy habitual en pipelines de question answering sobre documentación. El modelo está publicado bajo licencia Apache 2.0 y solo declara soporte para japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-0.8B; no se detalla en la informacion disponible) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la estructura, configuración, tokenizador, chat template y nombres/formas/tipos de los pesos del modelo base Qwen/Qwen3.5-0.8B. La modificación consiste en un ajuste LoRA con r=16, alpha=32 y dropout=0.05 aplicado a las capas lineales (`down_proj`, `gate_proj`, `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj`, `v_proj`), entrenado durante una época y posteriormente fusionado (merge) en los pesos originales. No se ha alterado la arquitectura subyacente.

El entrenamiento se realizó sobre 1.998 ejemplos construidos a partir de JEMHopQA (train, ver1.2) y JSQuAD (train, v1.3, 3.000 preguntas muestreadas), ambos bajo licencia CC BY-SA 4.0, combinados con fragmentos de Wikipedia en japonés del dataset del concurso. Cada ejemplo tiene el formato de entrada pregunta + tres documentos recuperados y salida JSON con respuesta y `chunk_id`. Todo el proceso se ejecutó en Google Colab, sin uso de APIs externas ni otros LLM. No se documentan fases de RLHF o DPO.

## Capacidades

- Generación de respuestas extractivas y abstractivas en japonés a partir de contexto documental.
- Salida estructurada en JSON con dos campos: `answer` (respuesta) y `chunk_id` (identificador del fragmento que respalda la respuesta).
- Question answering con recuperación aumentada: integración de hasta tres documentos de contexto por consulta.
- Trazabilidad de fuentes: el modelo indica qué fragmento de los proporcionados sustenta la respuesta.
- Manejo de preguntas multihop (procedentes de JEMHopQA) y de preguntas de comprensión lectora (procedentes de JSQuAD).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- **Sistemas de RAG sobre Wikipedia en japonés**: el modelo está entrenado exactamente para recibir una pregunta y tres fragmentos recuperados y devolver respuesta más `chunk_id`, por lo que encaja directamente como etapa de generación en un pipeline de búsqueda + generación sobre la enciclopedia.
- **Question answering con citación de fuentes**: al emitir el `chunk_id` del documento que respalda la respuesta, permite construir interfaces que muestren al usuario la evidencia concreta, útil en entornos donde se exige verificabilidad.
- **Asistentes de documentación interna**: con el mismo formato de entrada (pregunta + fragmentos), puede adaptarse a bases de conocimiento corporativas en japonés, siempre que se reformateen los documentos al esquema de entrenamiento.
- **Evaluación y prototipado de pipelines RAG**: al ser un modelo de 0,87 mil millones de parámetros y 1,8 GB de repositorio, permite iterar rápidamente sobre la etapa de recuperación midiendo la calidad de la respuesta generada sin grandes costes de cómputo.
- **Investigación educativa sobre fine-tuning eficiente**: sirve como referencia reproducible de un ajuste LoRA fusionado sobre un modelo pequeño, con hiperparámetros y composición de datos documentados, útil para cursos y experimentos de especialización.
- **Extracción estructurada de respuestas**: el formato JSON de salida puede aprovecharse en pipelines que necesiten respuestas parseables con referencia a la fuente, por ejemplo para poblar bases de datos de preguntas y respuestas verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: alrededor de 1,8 GB para pesos, más overhead; en la práctica, unos 3-4 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16; para entrenamiento o lotes grandes se recomienda A100 o H100.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 0,87 mil millones de parámetros.
- Opciones de despliegue: los pesos están en safetensors, por lo que se puede servir con vLLM, TGI o Transformers; para llama.cpp/Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Especializacion |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen002 | 873 M | No disponible | Japones | Apache 2.0 | QA con RAG y salida JSON con `chunk_id` |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingue (segun modelo base) | Apache 2.0 | Modelo generalista |
| Otros ajustes del mismo curso (no disponibles) | No disponible | No disponible | Japones | No disponible | QA sobre Wikipedia |

La comparación con alternativas de la misma categoría (modelos pequeños especializados en QA con RAG en japonés) no está disponible en la información proporcionada. El único punto de referencia documentado es el modelo base Qwen3.5-0.8B, del que este modelo hereda arquitectura, tokenizador y licencia.

## Limitaciones y advertencias

- **Idioma restringido**: solo declara soporte para japonés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- **Especialización estrecha**: entrenado únicamente para el formato pregunta + tres documentos + JSON de salida; usarlo fuera de ese esquema puede degradar la calidad de forma significativa.
- **Riesgo de alucinación**: aunque emite un `chunk_id`, no hay garantía de que la respuesta esté realmente respaldada por el fragmento citado; el `chunk_id` es una predicción del modelo, no una verificación.
- **Datos de entrenamiento limitados**: 1.998 ejemplos y una sola época; la cobertura de dominios y estilos de pregunta es acotada.
- **Sesgos**: no se documentan análisis de sesgo; los datos provienen de Wikipedia y de JEMHopQA/JSQuAD, con los sesgos propios de esas fuentes.
- **Contexto**: la longitud máxima de contexto no está publicada, lo que impide garantizar el comportamiento con documentos largos o más de tres fragmentos.
- **Licencia**: Apache 2.0 permite uso comercial, pero los datos de entrenamiento (JEMHopQA y JSQuAD) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos.
- **Madurez**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni resultados de benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen002
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset del concurso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Wikipedia en japonés: https://ja.wikipedia.org/
