# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. El objetivo del entrenamiento es internalizar un presupuesto fijo de generación de 4.096 tokens para razonamiento matemático, de forma que el modelo aprenda a producir respuestas correctas dentro de ese límite en lugar de depender del escalado en tiempo de inferencia (test-time scaling). Forma parte del paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo emplea GRPO (Group Relative Policy Optimization) con una recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. Se trata de un experimento de ablación de semillas: este repositorio corresponde a la semilla 44 de tres ejecuciones (42, 43 y 44) con la misma receta, y contiene el checkpoint final (paso 300), que también es el mejor por precisión de validación.

Con 4.539.265.536 parámetros totales y un tamaño de repositorio de 9,1 GB en BF16, es un modelo compacto orientado a tareas de razonamiento matemático. Su relevancia radica en estudiar si el RL con presupuesto fijo puede sustituir parcialmente las estrategias de escalado en inferencia, un área de interés creciente para reducir costes de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-4B); detalles especificos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generacion es de 4.096 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta mediante GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 4.096 tokens (`max_new_tokens`) se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a resolver dentro del límite en lugar de extenderse. La recompensa es binaria y se basa en la corrección de la respuesta extraída de las etiquetas `\boxed{}`.

El conjunto de datos es DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración de entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 300 pasos. Los pesos se publican en BF16. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento solicita razonamiento paso a paso y la respuesta dentro de `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos.
- Resolución de problemas matemáticos con formato de respuesta `\boxed{}`.
- Razonamiento bajo un presupuesto fijo de 4.096 tokens de generación (internalización del presupuesto).
- Pipeline declarado como `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base (no verificadas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Modo thinking explícito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluación de investigación sobre internalización de presupuesto: el modelo sirve para reproducir y comparar los resultados del paper sobre si el RL con presupuesto fijo mejora la precisión dentro del límite frente al escalado en inferencia.
- Razonamiento matemático con coste controlado: adecuado para entornos donde se necesita acotar estrictamente la longitud de generación (4.096 tokens) y mantener respuestas correctas en problemas de matemáticas.
- Ablación de semillas en experimentos de RL: al existir checkpoints de las semillas 42, 43 y 44, permite estudiar la varianza del entrenamiento y la robustez de la receta.
- Generación de soluciones con formato verificable: la salida en `\boxed{}` facilita la extracción automática de respuestas en pipelines de evaluación y corrección automática.
- Fine-tuning posterior como base de razonamiento: al ser un modelo de 4,5B parámetros con licencia Apache 2.0, puede servir como punto de partida para tareas matemáticas específicas de dominio.
- Despliegue en entornos con recursos limitados: su tamaño compacto permite inferencia en GPUs de gama alta consumer, útil para prototipos y pruebas de concepto.
- Investigación sobre truncamiento y recompensas: el diseño con respuestas truncadas y puntuadas permite estudiar el comportamiento del modelo cerca del límite de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 300 es el mejor de la ejecución, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 16-24 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3-3 GB para pesos.
- GPU recomendadas: A100, H100 para despliegue de producción; RTX 4090, RTX 3090 y GPUs con 24 GB o más para BF16.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en BF16, y en GPUs de 8-12 GB con cuantización (sujeto a disponibilidad de pesos cuantizados, no publicados).
- Opciones de despliegue: transformers (formato nativo); vLLM, llama.cpp, Ollama y TGI no están confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300 | 4.539.265.536 | no disponible | RL con presupuesto fijo de 4k tokens para matematicas | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | ~4B (segun modelo base) | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |
| Checkpoints de semillas 42 y 43 (misma receta) | 4.539.265.536 | no disponible | Misma receta, distinta semilla | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en razonamiento matemático; su rendimiento en otras tareas no está documentado y probablemente sea inferior al del modelo base.
- El entrenamiento usa recompensa binaria de corrección, lo que puede favorecer atajos y aumentar el riesgo de alucinación en problemas fuera de distribución.
- Las respuestas que alcanzan el presupuesto de 4.096 tokens se truncan y se puntúan tal cual; en producción, respuestas truncadas pueden quedar incompletas.
- No se documentan sesgos conocidos ni evaluación multilingüe; los idiomas soportados no están disponibles.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-4B; conviene verificar las condiciones del modelo base.
- Es un checkpoint de investigación (ablación de semillas, paso 300) sin citation publicada (TODO en la model card), por lo que su madurez para producción es limitada.
- No hay pesos cuantizados publicados en el repositorio; el despliegue en GPUs pequeñas requeriría cuantización propia.
- El pipeline declarado es `image-text-to-text`, pero no se detallan capacidades de visión ni su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint semilla 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Checkpoint semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Checkpoint semilla 43, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Checkpoint semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: enlace no disponible en la informacion proporcionada.
