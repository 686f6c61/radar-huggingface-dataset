# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-overlong-penalty-awaretick-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-overlong-penalty-awaretick-s300` es un ajuste fino por aprendizaje por refuerzo (RL) de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a razonamiento matemático bajo un presupuesto fijo de generación de 4.096 tokens. El objetivo del trabajo, descrito en el paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, es que el modelo internalice la restricción de longitud en lugar de depender de mecanismos externos de control de presupuesto en tiempo de inferencia. La relevancia práctica radica en que permite desplegar razonamiento matemático con latencia y coste acotados, a cambio de renunciar al escalado de cómputo en test-time.

Se trata de un modelo multimodal (pipeline `image-text-to-text`) con 4.539.265.536 parámetros, derivado de la familia Qwen3.5, y entrenado con GRPO (Group Relative Policy Optimization) sobre el dataset de matemáticas DeepScaleR. El checkpoint publicado corresponde al paso 300 de entrenamiento, con pesos en BF16 y licencia Apache 2.0 heredada del modelo base.

Al estar publicado como checkpoint de investigación (0 descargas, 0 likes en el momento de la consulta) y sin model card completa ni resultados de benchmarks, debe tratarse como material experimental para reproducir o extender el estudio de internalización de presupuesto, no como un modelo listo para producción sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de 4B parámetros, y se ajusta mediante GRPO con la penalización soft overlong de DAPO: la recompensa se penaliza linealmente, hasta -1.0, en los últimos 512 tokens antes de alcanzar el presupuesto de 4.096 tokens de generación. La recompensa principal es binaria por corrección de la respuesta, extraída de las etiquetas `\boxed{}`. Los datos de entrenamiento son DeepScaleR (matemáticas), con un máximo de 3 épocas.

La configuración de entrenamiento incluye lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de calentamiento y 300 pasos totales. El prompt de entrenamiento (turno de usuario, renderizado con la plantilla de chat del modelo base) pide razonar paso a paso y emitir la respuesta dentro de `\boxed{}`. La innovación central no es arquitectónica sino de procedimiento: internalizar el presupuesto fijo en los pesos del modelo mediante RL con penalización de longitud, en lugar de gestionar el presupuesto externamente.

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos.
- Resolución de problemas de matemáticas con extracción de respuesta en formato `\boxed{}`.
- Razonamiento bajo presupuesto fijo de 4.096 tokens de generación, con penalización aprendida de respuestas excesivamente largas.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text` declarado en la model card).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de investigación sobre internalización de presupuesto: usar el checkpoint para reproducir el experimento del paper y comparar la precisión dentro del presupuesto frente a modelos que escalan cómputo en test-time. Es adecuado porque el entrenamiento está diseñado exactamente para ese eje de comparación.
- Razonamiento matemático con coste acotado: desplegar el modelo con `max_new_tokens=4096` para tareas de resolución de problemas donde la latencia y el coste por consulta deben ser predecibles, aprovechando que el modelo ha aprendido a no agotar el presupuesto.
- Generación de soluciones con formato verificable: integrar el modelo en pipelines que extraen la respuesta de `\boxed{}` para autoevaluación automática, dado que ese es el formato de recompensa usado en entrenamiento.
- Fine-tuning posterior con RLVR: emplear el checkpoint como punto de partida para nuevos experimentos de RL con verificación de recompensa sobre otros datasets matemáticos, ya que el pipeline GRPO está documentado en la model card.
- Investigación sobre penalizaciones de longitud: comparar la variante con penalización soft overlong de DAPO frente a otras estrategias de control de presupuesto, usando este checkpoint como referencia entrenada con esa penalización concreta.
- Prototipado de asistentes matemáticos con contexto multimodal: aprovechar el pipeline `image-text-to-text` para experimentar con problemas que incluyan entrada visual, siempre con validación propia dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539.265.536 parámetros, en BF16 se requieren aproximadamente 9,1 GB solo para pesos (tamaño del repo: 9,1 GB); en FP16, similar. En cuantización de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB, más overhead de activaciones y KV cache (estimaciones orientativas, no verificadas para este checkpoint).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de 16 GB o más en BF16 (por ejemplo, A100 40/80 GB, H100, L40S, RTX 4090 de 24 GB) y en GPUs de 8-12 GB con cuantización, aunque no hay datos del autor que lo confirmen.
- Cabe en consumer GPU: previsiblemente sí en RTX 4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantización, según el tamaño de pesos; sin confirmación del autor.
- Opciones de despliegue: transformers (librería declarada). vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (budget-internalization-qwen3.5-4b-4k-grpo-overlong-penalty-awaretick-s300) | 4.539.265.536 | no disponible (presupuesto de generación 4.096) | RL GRPO con penalización soft overlong, presupuesto fijo 4k | Apache 2.0 | Hugging Face, checkpoint de investigación |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo base multimodal sin ajuste RL específico de presupuesto | Apache 2.0 (heredada) | Hugging Face |
| Otros checkpoints de JetBrains-Research del mismo estudio | no disponible | no disponible | Variantes del experimento de internalización de presupuesto | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: no es posible afirmar su precisión en MMLU, GSM8K, MATH u otros conjuntos sin evaluación propia.
- Model card incompleta: la sección de citación está marcada como TODO y no se documentan idiomas, contexto máximo ni detalles de la arquitectura interna.
- Checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- Entrenado exclusivamente con DeepScaleR (matemáticas): el comportamiento fuera del dominio matemático no está caracterizado y puede degradarse respecto al modelo base.
- El formato de respuesta esperado es `\boxed{}`: fuera de ese formato, la extracción automática de respuestas puede fallar.
- Presupuesto de generación de 4.096 tokens: respuestas que requieran razonamientos más largos pueden verse truncadas o penalizadas por el comportamiento aprendido.
- Sesgos conocidos: no disponible en la información proporcionada; al heredar del modelo base, pueden persistir los sesgos de este.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas matemáticas, la recompensa binaria no garantiza calibración fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-4B y conviene verificar los términos de este último.
- Al ser un ajuste RL sobre un modelo multimodal, el pipeline declarado es `image-text-to-text`, pero no se documenta el rendimiento en tareas visuales tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-overlong-penalty-awaretick-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper citado en la model card (*Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*): enlace no disponible
- Repositorio de código: no disponible
- Demo: no disponible
