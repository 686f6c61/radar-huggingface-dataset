# JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-reasoninggym-coolbengal-s300

## Resumen

El modelo `JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-reasoninggym-coolbengal-s300` es un ajuste fino por refuerzo (RL) del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains Research. Se trata de un experimento de investigación centrado en la "internalización de presupuesto": entrenar al modelo con un límite fijo de tokens de generación (2.048) para que aprenda a razonar dentro de esa restricción, en lugar de depender de un escalado de cómputo en tiempo de inferencia. El resultado se asocia al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo cuenta con 3.973.556.832 parámetros (~4B) en precisión F32 y un repositorio de 15,9 GB. La arquitectura declarada es `nemotron_h`, una variante propia de la familia Nemotron, y se distribuye en formato `safetensors` con código personalizado (`custom_code`), lo que exige confiar en la implementación remota para cargarlo con Transformers.

Su relevancia es fundamentalmente metodológica: demuestra un procedimiento de RL con GRPO sobre tareas de razonamiento proceduralmente generadas (Reasoning Gym) y verificación por respuesta en caja `\boxed{}`. Es un checkpoint de investigación (paso 300, ejecución `coolbengal`), no un modelo orientado a producción, y hereda la licencia del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (transformer, según tag de Hugging Face) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (F32), requiere `custom_code` |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 |
| Presupuesto de generacion entrenado | 2.048 tokens (`max_new_tokens`) |
| Algoritmo de RL | GRPO (leave-one-out, normalización de recompensa por grupo, pérdida a nivel de token) |
| Checkpoint | paso 300, ejecución `coolbengal` |
| Tamaño del repositorio | 15,9 GB |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y conserva su arquitectura, etiquetada como `nemotron_h` en Hugging Face. No se detalla en la información disponible la composición interna de esa arquitectura (número de capas, atención, posibles componentes híbridos ni dimensión de contexto), por lo que esos datos deben consultarse en la model card del modelo base.

El entrenamiento consiste en un ajuste fino con GRPO sobre tareas de Reasoning Gym, problemas de razonamiento generados proceduralmente con respuestas verificables en formato `\boxed{}`. La innovación central es el presupuesto fijo: cada respuesta se genera con `max_new_tokens = 2048` y aquellas que agotan el presupuesto reciben recompensa cero. La recompensa proviene del verificador de la tarea de Reasoning Gym aplicado a la respuesta en caja. Se emplean 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6, 10 pasos de calentamiento y un máximo de 3 épocas sobre los datos, durante 300 pasos en total. Los prompts son los propios de Reasoning Gym renderizados con la plantilla de chat del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas con respuesta verificable.
- Razonamiento matemático y lógico de tipo procedural, entrenado específicamente sobre el catálogo de tareas de Reasoning Gym.
- Producción de respuestas finales en formato `\boxed{}`, coherente con el esquema de verificación usado en el entrenamiento.
- Razonamiento bajo un presupuesto de tokens fijo de 2.048, con internalización de esa restricción durante el RL.
- Conversacional: la model card indica que los prompts se renderizan con la plantilla de chat del modelo base, por lo que conserva la interfaz conversacional de este.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en RL para razonamiento (RLVR): sirve como checkpoint de referencia para reproducir o comparar el efecto de internalizar un presupuesto fijo de generación frente al escalado en tiempo de inferencia.
- Evaluación de eficiencia en inferencia: permite medir la precisión alcanzable con un límite estricto de 2.048 tokens frente a modelos que gastan muchos más tokens por respuesta, útil para diseñar sistemas con coste acotado.
- Benchmarking de tareas de Reasoning Gym: al haberse entrenado sobre ese catálogo, es un punto de partida para analizar transferencia a tareas del mismo generador procedural.
- Estudio de robustez ante truncamiento: el modelo fue entrenado penalizando respuestas que agotan el presupuesto, lo que permite analizar el comportamiento en el límite exacto de tokens.
- Base para ablaciones de hiperparámetros de GRPO: el run documenta LR, tamaño de grupo, número de pasos y esquema de recompensa, lo que facilita replicar variantes (por ejemplo, otros presupuestos o pasos).
- Prototipado de asistentes de resolución de problemas con verificación automática: útil en entornos de investigación donde se pueda validar la respuesta con un verificador propio antes de usarla, dado el formato `\boxed{}`.
- Docencia y experimentación con Transformers: al publicarse en `safetensors` con `custom_code`, sirve para practicar la carga de arquitecturas personalizadas y pipelines de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos publicados en F32: el repositorio ocupa 15,9 GB, por lo que cargar el modelo en F32 requiere del orden de 16 GB solo para pesos, más memoria para activaciones y caché KV.
- VRAM estimada para inferencia: no disponible de forma oficial; en F32 se necesitan al menos ~16 GB de VRAM, y en cuantizaciones de 8 o 4 bits el requisito bajaría proporcionalmente, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: por tamaño (~4B), es viable en GPUs de consumo con suficiente VRAM; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 24 GB o más en F32 (por ejemplo, RTX 3090/4090), aunque no está confirmado por el autor.
- Opciones de despliegue: Transformers (librería declarada, con `custom_code`); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-nemotron3-nano-4b-2k-grpo-reasoninggym-coolbengal-s300 | ~4B | no disponible | RL con presupuesto fijo de 2.048 tokens sobre Reasoning Gym | nvidia-nemotron-open-model-license | Hugging Face (JetBrains-Research) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base sin el ajuste de presupuesto | nvidia-nemotron-open-model-license | Hugging Face (NVIDIA) |
| Alternativas de ~4B con RL para razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa y fiable es con su propio modelo base, del que se diferencia únicamente por el ajuste GRPO con presupuesto fijo. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint de investigación (paso 300 de un único run), sin validación publicada en benchmarks; no debe asumirse calidad de producción.
- El entrenamiento se limita a tareas de Reasoning Gym; el rendimiento fuera de ese dominio (conversación general, código, conocimiento factual) no está documentado y puede degradarse respecto al modelo base.
- El formato de respuesta esperado es `\boxed{}`; fuera de ese esquema, el comportamiento puede ser inconsistente.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo pequeño (~4B) y ajustado con RL sobre verificación automática, es esperable que produzca respuestas plausibles pero incorrectas en dominios no cubiertos.
- Sesgos conocidos: no documentados; hereda los del modelo base de NVIDIA, cuya model card no se incluye aquí.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe más allá de lo que herede del modelo base.
- Licencia: `nvidia-nemotron-open-model-license`, no es una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; conviene auditar la implementación antes de desplegarlo.
- Pesos en F32 con un repositorio de 15,9 GB: el despliegue es más costoso en memoria que una versión BF16 o cuantizada, y no se ofrecen variantes GGUF ni AWQ/GPTQ.
- No se documentan limitaciones de longitud de contexto del modelo base; no debe asumirse una ventana mayor que la del propio Nemotron-3-Nano-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-reasoninggym-coolbengal-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Artículo asociado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la información proporcionada)
- Repositorio de Reasoning Gym: no disponible en la información proporcionada
- Organización JetBrains Research en Hugging Face: https://huggingface.co/JetBrains-Research
