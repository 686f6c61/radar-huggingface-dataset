# Byounghan/safeguardrail-qwen3-4b-refusal

## Resumen

Safeguardrail Qwen3-4B — refusal es un modelo guardián especializado que clasifica si una respuesta de asistente constituye un rechazo (`refusal`) o una conformidad (`compliance`) respecto al prompt del usuario. Lo desarrolla el usuario de Hugging Face Byounghan como parte de la familia Safeguardrail, compuesta por tres modelos especialistas en tareas de seguridad: detección de daño en el prompt, detección de daño en la respuesta y, este, clasificación de rechazo. Se construye sobre Qwen/Qwen3-4B mediante aprendizaje por refuerzo con GRPO, sin fase previa de SFT.

El modelo resuelve un problema concreto en pipelines de moderación: determinar de forma automática si un LLM ha declinado atender una petición potencialmente dañina o si, por el contrario, ha respondido afirmativamente. Emite una justificación breve en etiquetas `<think>` seguida de un veredicto estricto y, cuando procede, una categoría de riesgo del estándar MLCommons S1–S14. Es bilingüe inglés-coreano y está pensado como checkpoint de investigación, no como producto listo para producción.

Con 4.022.468.096 parámetros y licencia Apache 2.0 en los pesos, su interés actual reside en el enfoque de entrenamiento (RL con recompensas basadas en reglas y compuertas multiplicativas duras sobre formato y corrección) y en su especialización coreana, un idioma con menos recursos en el ecosistema de modelos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); no se detalla configuración interna en la información disponible |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros, y se ajusta mediante GRPO (Group Relative Policy Optimization) con la librería verl 0.8.0. No hay SFT de arranque en frío: el entrenamiento es directamente de refuerzo, en la ejecución especializada `qwen3_4b_grpo_v13_refusal`, con el checkpoint final en el paso 39. La recompensa es basada en reglas, con compuertas multiplicativas duras que penalizan el incumplimiento del formato de salida, la incorrección del veredicto y la longitud excesiva del razonamiento.

Los datos de entrenamiento suman 9.852 ejemplos (8.069 en coreano y 1.783 en inglés), construidos a partir de polyguardmix (EN y KO) y wildguardmix-ko. El coreano combina datasets nativos de seguridad con traducciones automáticas de datasets de guardrails en inglés. Todas las fuentes se mapearon a un esquema único basado en las categorías MLCommons S1–S14, con la regla de que la blasfemia sin objetivo explícito se etiqueta como segura. La salida esperada es un bloque `<think>` con razonamiento conciso seguido de `Answer: <veredicto>` y, solo para veredictos inseguros, `Category: S#`.

## Capacidades

- Clasificación binaria de rechazo frente a conformidad en respuestas de asistentes, con formato de salida estricto y parseable.
- Razonamiento breve explícito en etiquetas `<think>` antes del veredicto, útil para auditoría y depuración de pipelines.
- Asignación de categoría de riesgo MLCommons S1–S14 cuando el veredicto es inseguro.
- Bilingüe inglés-coreano, con mayor peso de datos coreanos en el entrenamiento.
- Evaluación de pares prompt–respuesta individuales; no está diseñado para conversaciones multi-turno.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso más allá del `<think>` interno.
- No dispone de capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Moderación de salidas de LLM en producción: insertar el modelo como clasificador posterior a la generación para detectar si el asistente ha rechazado o cumplido una petición sensible, usando el veredicto `refusal`/`compliance` para enrutar revisiones humanas.
- Auditoría de políticas de rechazo: medir la tasa de rechazo real de un sistema desplegado sobre un conjunto de prompts de riesgo y comparar con la política esperada, aprovechando la salida estructurada y el razonamiento en `<think>`.
- Construcción de datasets de preferencia en seguridad: etiquetar pares prompt–respuesta con el veredicto y la categoría S1–S14 para alimentar entrenamientos posteriores o evaluaciones de alineamiento.
- Filtrado previo en pipelines de RLHF: descartar o marcar respuestas que el modelo clasifique como conformidades ante prompts dañinos antes de que lleguen a anotadores humanos.
- Moderación específica para coreano: cubrir el hueco de herramientas de seguridad en este idioma, donde el ecosistema de guardrails es más limitado, combinándolo con los otros dos especialistas de la familia.
- Investigación en RL para seguridad: reproducir o extender el esquema de recompensas basadas en reglas con compuertas multiplicativas sobre formato, corrección y longitud del razonamiento, usando el checkpoint como referencia.
- Evaluación de robustez de guardrails: emplear el modelo como clasificador base y someterlo a ataques adaptativos para estudiar su comportamiento, dado que el autor advierte que no se ha evaluado frente a este tipo de ataques.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión de rechazo en conjunto reservado (held-out refusal accuracy) | 0,902 |

Evaluación interna del panel del autor, evaluación completa de 2026-08. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10–12 GB en una GPU consumer de gama alta.
- Cuantización a 8 bits: alrededor de 4–5 GB de pesos; a 4 bits: alrededor de 2,5–3 GB. No se publican variantes GGUF oficiales, por lo que habría que generarlas.
- GPU recomendadas: A100 40 GB u H100 para despliegue con concurrencia alta; RTX 4090 (24 GB) o RTX 3090 para inferencia individual sin problemas; GPUs de 8 GB solo con cuantización agresiva.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y superiores con fp16; en GPUs de 8 GB requiere cuantización.
- Opciones de despliegue: vLLM (el ejemplo de la model card usa `LLM.chat` con `SamplingParams`), transformers, text-generation-inference (etiqueta `text-generation-inference` presente) y endpoints compatibles. llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponible. Al ser un modelo de 4B con salida corta (razonamiento conciso más veredicto), se espera baja latencia por petición, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safeguardrail Qwen3-4B — refusal | 4,02 B | no disponible | Clasificación rechazo/conformidad, EN/KO | Apache 2.0 (pesos); datos de entrenamiento con posibles restricciones | Hugging Face |
| Safeguardrail Qwen3-4B — prompt-harm | 4 B (base) | no disponible | Detección de daño en el prompt | Apache 2.0 (pesos) | Hugging Face |
| Safeguardrail Qwen3-4B — response-harm | 4 B (base) | no disponible | Detección de daño en la respuesta | Apache 2.0 (pesos) | Hugging Face |
| Qwen3-4B (base) | 4 B | no disponible | Modelo generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con guardrails externos (por ejemplo, clasificadores de moderación de terceros) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo 39 pasos de GRPO sobre unos 10.000 ejemplos, mayoritariamente coreanos; el autor lo describe explícitamente como checkpoint de investigación.
- La línea `Category:` del formato compartido no es significativa para esta tarea concreta; no debe interpretarse como una clasificación de riesgo fiable.
- Evalúa únicamente prompts o pares prompt–respuesta individuales; no se ha evaluado en conversaciones multi-turno.
- No se ha evaluado frente a ataques adaptativos dirigidos al propio clasificador, por lo que su robustez frente a adversarios no está caracterizada.
- Riesgo de alucinación en el razonamiento `<think>`: el veredicto puede ser correcto con una justificación inconsistente, o viceversa; conviene validar el formato de salida en producción.
- Sesgos potenciales derivados de la composición del dataset (traducciones automáticas al coreano, mezcla de fuentes con distintos criterios de etiquetado) y de la regla de etiquetar como segura la blasfemia sin objetivo.
- Licencia de pesos Apache 2.0, pero algunas fuentes de entrenamiento están bajo términos no comerciales (por ejemplo CC-BY-NC-4.0) o con licencias no confirmadas; el autor recomienda revisar los términos de los datasets subyacentes antes de un uso comercial.
- Cobertura lingüística limitada a inglés y coreano; el rendimiento en otros idiomas no está documentado.
- Sin variantes cuantizadas oficiales publicadas; el despliegue en entornos con poca VRAM requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-refusal
- Modelo hermano prompt-harm: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-prompt-harm
- Modelo hermano response-harm: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-response-harm
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Librería verl: https://github.com/volcengine/verl
- Paper: en preparación (no disponible)
