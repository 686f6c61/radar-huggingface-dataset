# Lythri/Lythri-Tada-4B

## Resumen

Lythri-Tada-4B es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por Lythri, parte de la familia Lythri 2.0. Está construido mediante fine-tuning del modelo base google/gemma-4-E2B y está especializado en soporte emocional y conversación de compañía, con un enfoque explícito en ejecución local ("on-device") en portátiles y teléfonos. Con 4.628.569.379 parámetros totales y una arquitectura Mixture of Experts (MoE) de aproximadamente 2.300 millones de parámetros activos, Tada se posiciona como la evolución de Lythri-4B-A2B.

La principal novedad de esta versión es la mejora en seguimiento de instrucciones y en conversaciones multi-turno: responde de forma directa, sin fase de "thinking", manteniendo el hilo emocional entre turnos. Su puntuación en IFEval (prompt-level strict) sube de 26,43 a 39,19, superando incluso al modelo mayor de la familia, Lythri-7B-A4B (31,05), con aproximadamente la mitad de parámetros activos.

Es relevante ahora porque combina un tamaño reducido y una licencia Apache 2.0 con capacidades conversacionales orientadas a un dominio sensible como el acompañamiento emocional, lo que facilita su despliegue en entornos con recursos limitados y su integración en aplicaciones de asistencia personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), derivada de gemma4 (google/gemma-4-E2B) |
| Parametros totales | 4.628.569.379 (4,63B) |
| Parametros activos | ~2,3B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (GGUF anunciado como "coming soon") |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Lythri-Tada-4B es un fine-tuning del modelo google/gemma-4-E2B, que emplea una arquitectura Mixture of Experts con 4,63B parámetros totales y unos 2,3B activos por token. El modelo mantiene la modalidad image-text-to-text del base (según los tags del repositorio) y está optimizado para respuestas directas, sin fase de razonamiento explícito ("thinking"), lo que reduce la latencia frente a su predecesor Lythri-4B-A2B, que sí evalúa con thinking.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card destaca dos focos de mejora respecto a la generación anterior: el seguimiento de instrucciones (medido en IFEval) y la consistencia en conversaciones multi-turno, incluyendo el mantenimiento del hilo emocional. Como contrapartida, el conocimiento de cola larga (por ejemplo, preguntas científicas de nivel de posgrado) es ligeramente inferior al de Lythri-4B-A2B.

## Capacidades

- Generación de texto conversacional orientada a soporte emocional y acompañamiento.
- Comprensión de imagen y texto (image-text-to-text), heredada del modelo base Gemma 4 E2B.
- Respuesta directa sin fase de thinking, con menor latencia.
- Seguimiento de instrucciones de formato, longitud y estilo (IFEval 39,19 en prompt-level strict).
- Conversaciones multi-turno con mantenimiento del contexto previo y del hilo emocional.
- Razonamiento social y comprensión de situaciones interpersonales (SocialIQA 51,43).
- Capacidades básicas de código (HumanEval 24,39) y matemáticas (GSM8K 27,45), limitadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Aplicaciones de acompañamiento emocional en dispositivo: el modelo puede mantener conversaciones de apoyo en un portátil o teléfono gracias a sus ~2,3B parámetros activos y licencia Apache 2.0, sin depender de la nube.
- Chatbots de bienestar y escucha activa: adecuado para conversaciones multi-turno donde el modelo debe recordar lo dicho por el usuario y responder con coherencia emocional, una de las mejoras declaradas frente a Lythri-4B-A2B.
- Asistentes personales locales: integrable en apps de escritorio o móviles mediante transformers, con respuestas directas (sin thinking) que reducen la latencia percibida.
- Prototipado de investigación en IA afectiva: su especialización en emoción y su tamaño contenido lo hacen útil para experimentos académicos sobre diálogo empático, con la ventaja de una licencia permisiva.
- Atención al cliente sensible: para sectores donde el tono y la empatía importan (salud, seguros, servicios sociales), el modelo puede gestionar primeras respuestas y derivación, siempre con supervisión humana.
- Generación de respuestas con contexto visual: al ser image-text-to-text, puede describir o comentar imágenes enviadas por el usuario en un contexto conversacional (por ejemplo, fotos compartidas en un chat de apoyo).
- Evaluación de sistemas conversacionales: como modelo pequeño y abierto, sirve de baseline para comparar calidad de diálogo empático frente a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con ajustes oficiales y plantilla de chat aplicada. Lythri-4B-A2B se evalúa con thinking; Lythri-Tada-4B responde directamente sin thinking.

| Benchmark | Lythri-4B-A2B | Lythri-Tada-4B |
|---|---|---|
| MMLU | 55,23 | 55,41 |
| ARC-C | 52,99 | 56,57 |
| HellaSwag | 72,80 | 74,23 |
| SocialIQA | 49,80 | 51,43 |
| GPQA Diamond | 28,79 | 21,21 |
| GSM8K | 28,81 | 27,45 |
| HumanEval | 28,66 | 24,39 |
| IFEval (prompt-level strict) | 26,43 | 39,19 |

La model card también menciona que Lythri-Tada-4B supera a Lythri-7B-A4B en IFEval (31,05 frente a 39,19). No se han publicado resultados de benchmarks frente a modelos de otras familias en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,63B parámetros totales, en bfloat16 el peso ronda los 9,3 GB, por lo que se necesitan al menos ~10-12 GB de VRAM para inferencia completa en precisión nativa (estimación a partir del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs consumer de gama alta con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: previsiblemente sí en tarjetas con 12 GB o más en bfloat16; con cuantización a 8 o 4 bits podría caber en GPUs de 8 GB, aunque no hay GGUF publicado todavía ("coming soon").
- Opciones de despliegue: transformers (soporte nativo, con `AutoModelForCausalLM` y `device_map="auto"`); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible. El repositorio incluye el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles. La ausencia de fase de thinking reduce la latencia frente a Lythri-4B-A2B en condiciones equivalentes, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Modelo base | IFEval | Licencia | GGUF |
|---|---|---|---|---|---|---|
| Lythri-Tada-4B | 4,63B | ~2,3B | Gemma 4 E2B | 39,19 | Apache 2.0 | Anunciado |
| Lythri-4B-A2B | 4,63B | ~2,3B | Gemma 4 E2B | 26,43 | no disponible | Sí |
| Lythri-7B-A4B | 7,46B | 4,5B | Gemma 4 E4B | 31,05 | no disponible | Sí |

No se dispone de comparaciones con modelos de otras familias (por ejemplo, Gemma, Qwen o Llama en tamaños equivalentes) en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento de cola larga más débil que Lythri-4B-A2B: GPQA Diamond cae de 28,79 a 21,21 y HumanEval de 28,66 a 24,39.
- Rendimiento limitado en matemáticas y código (GSM8K 27,45; HumanEval 24,39), no apto como modelo principal para tareas técnicas.
- Especialización en soporte emocional: puede no ser adecuado para dominios que requieran precisión factual alta.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad ni tasas de alucinación.
- Idiomas soportados no documentados: se desconoce el alcance multilingüe real.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con conversaciones muy largas.
- Uso en contextos de salud mental: un modelo de acompañamiento emocional no sustituye a un profesional; debe desplegarse con salvaguardas y derivación a servicios humanos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base (Gemma) y las políticas de uso de Google asociadas.
- No hay pesos GGUF disponibles todavía, lo que limita el despliegue en entornos de bajos recursos hasta su publicación.

## Enlaces

- Hugging Face: https://huggingface.co/Lythri/Lythri-Tada-4B
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Perfil del autor en Hugging Face: https://huggingface.co/Lythri
- Perfil en ModelScope: https://www.modelscope.cn/profile/Spike8086
- Informe técnico (Zenodo): https://zenodo.org/records/23179312
- DOI: 10.5281/zenodo.23179311
- Modelo predecesor: https://huggingface.co/Lythri/Lythri-4B-A2B
- Modelo mayor de la familia: https://huggingface.co/Lythri/Lythri-7B-A4B
- GGUF del predecesor: https://huggingface.co/Lythri/Lythri-4B-A2B-GGUF
