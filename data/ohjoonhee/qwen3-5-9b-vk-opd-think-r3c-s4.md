# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3c-s4

## Resumen

Qwen3.5-9B-VK-OPD-think-R3c-s4 es un checkpoint de investigación derivado del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario ohjoonhee en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino completo (full fine-tune) de las capas del modelo de lenguaje y de la normalización final, almacenado en bf16, que aplica una técnica de destilación on-policy (OPD, on-policy distillation) orientada a resolver conflictos de conocimiento entre lo que muestra una imagen y lo que es cierto en el mundo real.

El modelo forma parte de una línea de experimentos denominada VK-OPD (probablemente "Visual Knowledge On-Policy Distillation") y corresponde a la ronda 3, ejecución R3c, semilla 4, en el paso 60, seleccionado sobre el split de desarrollo. Su propósito es que el modelo aprenda a distinguir cuándo debe responder según lo que aparece literalmente en la imagen y cuándo debe responder según el conocimiento general del mundo, incluso si la imagen contradice ese conocimiento. Es, por tanto, un modelo de investigación sobre grounding visual y consistencia factual, no un modelo de producción.

Con 9.409.813.744 parámetros totales (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB, el checkpoint se distribuye en formato safetensors y es compatible con la librería transformers. La licencia es Apache 2.0, heredada del modelo base. Su relevancia actual radica en que aborda un problema poco explorado en modelos multimodales: el conflicto entre percepción visual y conocimiento previo, un fenómeno crítico para aplicaciones donde la fidelidad a la imagen y la veracidad factual deben coexistir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5; el checkpoint ajusta las capas del modelo de lenguaje y la normalización final |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), un transformer multimodal de tipo image-text-to-text. El ajuste es un full fine-tune de las capas del modelo de lenguaje y de la normalización final, en bf16, y no incluye la cabeza MTP (multi-token prediction) del modelo base. No se especifica la longitud de contexto ni detalles adicionales de la arquitectura del backbone.

El entrenamiento emplea destilación on-policy (OPD): los profesores son el propio modelo base congelado con contexto privilegiado, y la ventaja por token se calcula como log π_teacher − log π_student sobre las muestras generadas por el estudiante. Los datos combinan un 30% de preguntas simples y un 17,5% de cada una de cuatro familias de señales (frase factual kf, frase de inspección li, instrucción de conocimiento ki, persona/formato pf), con una proporción prefijo/sufijo de 75%/25%. Solo se usan pares de imágenes cuyo profesor respondió correctamente a todos los ítems en 2 de 2 muestras (280 imágenes con conflicto y 80 ordinarias). El entrenamiento duró 80 pasos con lr 3e-6 (5 de warmup), 8 pares de imágenes (16 prompts) × 4 rollouts por paso, rollouts de hasta 4.096 tokens, sobre 4× H100. La innovación principal de esta ejecución (R3c) es una rejilla de señales equilibrada por objetivo: cada señal se adjunta tanto a la pregunta sobre la foto como a la pregunta de conocimiento de la misma imagen.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa pares imagen-texto y responde preguntas sobre el contenido visual.
- Modo "thinking" (razonamiento explícito) activado durante la evaluación, según la model card.
- Distinción entre respuesta perceptiva (lo que se ve en la imagen) y respuesta de conocimiento general (lo que es cierto en el mundo), mediante instrucciones de sistema específicas.
- Manejo de conflictos de conocimiento: responde correctamente cuando la imagen contradice hechos del mundo real.
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Verificación de fidelidad visual en asistentes de accesibilidad: el modelo puede describir lo que realmente aparece en una imagen aunque contradiga expectativas típicas, útil para personas con discapacidad visual que necesitan una descripción literal y no una interpretación basada en estereotipos.
- Moderación de contenido y detección de desinformación visual: permite distinguir entre una imagen manipulada o atípica y el conocimiento factual, ayudando a marcar contenidos donde la imagen induce a error.
- Investigación en grounding visual y conflicto de conocimiento: sirve como checkpoint de referencia para estudiar cómo los modelos multimodales resuelven la tensión entre percepción y conocimiento previo, comparándolo con el modelo base y otras rondas.
- Evaluación de sistemas de razonamiento multimodal: al estar entrenado con señales explícitas de inspección y conocimiento, es adecuado para probar pipelines que requieren respuestas condicionadas por instrucciones de sistema.
- Docencia y experimentación académica: su licencia Apache 2.0 y formato safetensors facilitan su uso en laboratorios que quieran reproducir o extender experimentos de destilación on-policy.
- Prototipado de asistentes que responden preguntas sobre imágenes con doble modo (descriptivo vs. factual): útil en dominios como educación o divulgación científica, donde conviene separar "lo que se ve" de "lo que se sabe".
- Análisis de imágenes en entornos donde lo mostrado difiere de lo habitual (fotografía artística, imágenes sintéticas, ilustraciones): el modelo puede mantener la coherencia factual sin perder la referencia visual.

## Benchmarks y rendimiento

Evaluación en test privado v3 (imágenes naturales, n = 1.186, thinking activado, muestreo de la model card, 1 muestra):

| Modelo | CV | CK | NV | NK | All-4 | KT |
|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 80,2 | 67,7 | 84,0 | 90,7 | 43,5 | 93,0 |
| VK-OPD-think (ronda 1) | 83,2 | 93,8 | 83,1 | 93,2 | 65,6 | 92,9 |
| **Este modelo (R3c-s4)** | 80,9 | 95,1 | 83,8 | 90,6 | 62,4 | 94,0 |

La mejora de All-4 frente al modelo base es de +18,9 puntos porcentuales (IC 95% por bootstrap de pares: [+15,9, +22,1]). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9,4 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 18,8 GB, por lo que se necesita al menos esa cantidad de VRAM más overhead para el contexto y las activaciones.
- GPU recomendadas: el entrenamiento se realizó en 4× H100; para inferencia se requieren GPU con al menos 24 GB de VRAM en bf16 (por ejemplo, RTX 4090, A100 40 GB, H100) o cuantización para reducir requisitos.
- ¿Cabe en GPU de consumo? En bf16 no cabe en GPU de consumo de 16 GB; con cuantización (no especificada en la información) podría intentarse en GPUs de 24 GB, aunque no hay datos oficiales.
- Opciones de despliegue: transformers (librería indicada); compatibilidad con endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (All-4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | ~9,4 B | no disponible | 43,5 | Apache 2.0 | Público |
| VK-OPD-think (ronda 1) | ~9,4 B | no disponible | 65,6 | Apache 2.0 | Público |
| **Este modelo (R3c-s4)** | ~9,4 B | no disponible | 62,4 | Apache 2.0 | Público (checkpoint privado de investigación) |
| VK-OPD-think-R3c (semilla 3) | ~9,4 B | no disponible | no disponible | Apache 2.0 | Público |
| VK-OPD-think-R3d | ~9,4 B | no disponible | no disponible | Apache 2.0 | Público |

La comparación se limita a la propia familia de checkpoints, ya que no se dispone de datos de otros modelos multimodales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación privado, compartido para comparación dentro de la ronda 3; el autor indica explícitamente que "no es un release".
- No se han publicado datos sobre sesgos conocidos; al derivar de Qwen3.5-9B, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo thinking y la destilación pueden producir respuestas plausibles pero incorrectas en dominios no cubiertos.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin validación de producción, se recomienda precaución.
- Caveats para producción: no incluye la cabeza MTP del modelo base; el entrenamiento se realizó con un conjunto de datos muy específico (pares de imágenes con conflicto de conocimiento) y 80 pasos, por lo que su generalización a otros dominios no está garantizada.
- La evaluación se realizó con una sola muestra y en un test privado, lo que limita la robustez de las conclusiones.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3c-s4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint de la ronda 1: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
- Checkpoint R3c (semilla 3): https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3c
- Checkpoint R3d: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3d
