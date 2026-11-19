# JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de NVIDIA Nemotron-3-Nano-4B, desarrollado por JetBrains-Research para el razonamiento matemático bajo un presupuesto de generación fijo de 1.024 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, cuyo objetivo es que el modelo aprenda a razonar de forma eficiente dentro de un límite de tokens predefinido, en lugar de depender de cadenas de razonamiento largas en tiempo de inferencia.

El modelo parte de la base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, con 3.973.556.832 parámetros, y se entrena con GRPO sobre el conjunto de datos DeepScaleR (matemáticas). La receta emplea una recompensa binaria de corrección de respuesta extraída de las etiquetas `\boxed{}`, y trunca las respuestas que alcanzan el presupuesto, puntuándolas tal cual. Este repositorio concreto corresponde a la semilla 44 de un ablation de tres semillas (42, 43, 44) y contiene el mejor checkpoint por precisión de validación (paso 240) de esa ejecución, apodada `pickedguppy`.

La relevancia actual reside en la internalización del presupuesto: en lugar de escalar el cómputo en test-time con cadenas de razonamiento más largas, el modelo aprende a producir respuestas correctas dentro de un límite fijo, lo que reduce latencia y coste en despliegues de producción con restricciones estrictas de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (transformer híbrido, tag `nemotron_h` en transformers) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Nemotron-H del modelo base NVIDIA-Nemotron-3-Nano-4B-BF16, etiquetada como `nemotron_h` en la librería transformers y con código personalizado (`custom_code`). No se dispone de detalles adicionales sobre la composición interna de capas, atención o mecanismos híbridos en la información proporcionada.

El ajuste fino se realiza con GRPO (leave-one-out baseline, normalización de recompensa por grupo y pérdida a nivel de token). El presupuesto de generación es de 1.024 tokens (`max_new_tokens`); las respuestas que alcanzan el límite se truncan y se puntúan tal cual. Se entrena sobre DeepScaleR (matemáticas) hasta 3 épocas, con lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de warmup. La recompensa es binaria según corrección de la respuesta extraída de `\boxed{}`. Este checkpoint corresponde al paso 240 y es el mejor de la ejecución por precisión de validación, medida cada 10 pasos sobre 480 problemas de DeepScaleR reservados. Los pesos se publican en F32.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con formato de respuesta en `\boxed{}`.
- Razonamiento bajo presupuesto fijo de tokens (1.024 tokens de generación), internalizado durante el entrenamiento.
- Entrenamiento con RL (GRPO) orientado a maximizar precisión dentro del presupuesto, no a escalar en test-time.
- Soporte de conversación mediante plantilla de chat del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad específica; el entrenamiento se centra en problemas matemáticos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos con latencia acotada: el modelo está entrenado para producir respuestas dentro de 1.024 tokens, lo que permite desplegarlo en entornos donde el coste por consulta debe ser predecible y bajo.
- Evaluación de razonamiento en pipelines de investigación: sirve como checkpoint de referencia en estudios de internalización de presupuesto y ablations de semillas, comparando con los checkpoints de las semillas 42 y 43.
- Generación de soluciones paso a paso para datasets educativos: el formato de prompt y la extracción de `\boxed{}` facilitan el parseo automático de respuestas en corpus de matemáticas.
- Benchmarking de eficiencia en test-time: útil para medir la relación entre precisión y tokens generados frente a modelos que escalan cadenas de razonamiento largas.
- Reproducción de experimentos de RLVR: la receta GRPO, los hiperparámetros y los datos (DeepScaleR) están documentados, lo que permite reproducir o extender el entrenamiento.
- Filtrado y verificación de soluciones matemáticas en pipelines de datos: el modelo puede generar respuestas candidatas acotadas en tokens para su posterior validación con un verificador simbólico.
- Estudio de ablations de semillas: al publicarse tres semillas con checkpoints intermedios y finales, se puede analizar la varianza del entrenamiento RL en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.973.556.832 parámetros en F32, los pesos ocupan aproximadamente 15,9 GB; en BF16 serían unos 7,9 GB y en cuantización de 8 bits unos 4 GB (estimaciones a partir del recuento de parámetros, no datos oficiales).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 16 GB o más en BF16 (por ejemplo, RTX 4090), y en 8-12 GB con cuantización; no confirmado por el autor.
- Opciones de despliegue: transformers con `trust_remote_code` (requerido por `custom_code`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, 1k budget, GRPO, seed 44) | 3.973.556.832 | no disponible | GRPO sobre DeepScaleR, presupuesto 1.024 tokens | nvidia-nemotron-open-model-license | Hugging Face (JetBrains-Research) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base, sin RL específico de presupuesto | nvidia-nemotron-open-model-license | Hugging Face (NVIDIA) |
| Checkpoints de las semillas 42 y 43 (misma receta) | ~4B | no disponible | GRPO, presupuesto 1.024 tokens, semillas 42/43 | nvidia-nemotron-open-model-license | Hugging Face (JetBrains-Research) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento se limita a matemáticas (DeepScaleR); el rendimiento en otras tareas no está caracterizado.
- El modelo está optimizado para un presupuesto de 1.024 tokens; fuera de ese régimen su comportamiento puede degradarse y no está documentado.
- Las respuestas que alcanzan el presupuesto se truncan durante el entrenamiento y se puntúan tal cual, lo que puede introducir sesgos hacia soluciones incompletas en problemas que requieren razonamientos más largos.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el prompt de entrenamiento está en inglés.
- Licencia: hereda la nvidia-nemotron-open-model-license, cuyos términos deben revisarse antes de uso comercial.
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica ejecutar código del repositorio.
- La model card indica "Citation: TODO", por lo que la referencia bibliográfica del paper no está completa en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint final de la misma semilla (paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Semilla 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Semilla 43, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
