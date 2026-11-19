# JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains-Research. El objetivo del entrenamiento es internalizar un presupuesto fijo de generación de 2.048 tokens, de modo que el modelo aprenda a resolver problemas de razonamiento matemático dentro de ese límite en lugar de depender de test-time scaling (generar cadenas de razonamiento cada vez más largas). El modelo se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo pertenece a la familia Nemotron-3 Nano de NVIDIA, con aproximadamente 3.970 millones de parámetros (3,97 B) y pesos en formato safetensors. Se trata de un checkpoint final (paso 300) de un ablation de semillas; en concreto, la semilla 43 de la receta, con nombre interno `squareman`. El entrenamiento se realizó con GRPO sobre el dataset de matemáticas DeepScaleR-Preview, con una recompensa binaria de corrección de la respuesta extraída de las etiquetas `\boxed{}`.

Es relevante porque aborda un problema práctico de despliegue: los modelos de razonamiento que escalan en tiempo de inferencia consumen muchos tokens y encarecen la producción. Este modelo demuestra que el RL con presupuesto fijo puede trasladar parte de esa capacidad de razonamiento al propio modelo, reduciendo la necesidad de generar secuencias largas y mejorando la precisión dentro del presupuesto. Es un modelo de investigación, no un modelo de propósito general listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (según tag `nemotron_h` de Hugging Face; no se detalla en la model card) |
| Parametros totales | 3.973.556.832 (3,97 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (hereda la del modelo base) |
| Formato de pesos | safetensors (librería transformers, código personalizado `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, etiquetada como `nemotron_h` en Hugging Face. La model card no detalla la composición interna (número de capas, atención, posible hibridación con SSM ni dimensión de contexto), por lo que esos datos deben consultarse en la ficha del modelo base. Los pesos se publican en F32 y el repositorio ocupa 15,9 GB, coherente con un modelo de ~4 B en precisión completa.

El ajuste fino se realizó con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de 2.048 tokens se truncan y se puntúan tal cual, lo que penaliza implícitamente las cadenas que no terminan dentro del presupuesto. Se entrenó sobre DeepScaleR (matemáticas) hasta 3 épocas, con lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de warmup, durante 300 pasos. La recompensa es binaria según la corrección de la respuesta extraída de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con formato de respuesta en `\boxed{}`.
- Razonamiento bajo presupuesto fijo: el modelo está entrenado para producir soluciones dentro de 2.048 tokens de generación.
- Ajuste por RL con recompensa binaria de corrección, orientado a precisión in-budget más que a cadenas largas.
- Soporte de conversación mediante la plantilla de chat del modelo base (tag `conversational`).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning más allá del razonamiento matemático: no disponibles.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Evaluación de investigación en RLVR: reproducir el ablation de semillas (42, 43, 44) y comparar checkpoints (pasos 240, 280, 290, 300) para estudiar la varianza del entrenamiento y la internalización del presupuesto.
- Razonamiento matemático con coste controlado: desplegar el modelo con `max_new_tokens=2048` en pipelines de resolución de problemas donde el coste por consulta está acotado y se prioriza la precisión dentro del límite.
- Benchmarking de test-time scaling: comparar la precisión del modelo con presupuesto fijo frente a variantes que generan cadenas más largas, para cuantificar el intercambio entre tokens y acierto.
- Generación de soluciones con formato verificable: usar la extracción de `\boxed{}` para integrar las respuestas en sistemas de corrección automática o evaluación de exámenes.
- Fine-tuning posterior sobre dominios matemáticos específicos: partir de este checkpoint como inicialización para tareas de razonamiento acotado en producción.
- Estudio de robustez y alucinación en razonamiento: analizar cómo se comporta el modelo cuando se le fuerza a responder dentro de un presupuesto y qué tipos de errores aparecen por truncamiento.
- Prototipado en investigación académica: servir el modelo con transformers y código personalizado para experimentos de RL y evaluación de reasoning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos en la información suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,97 B de parámetros, una estimación orientativa sería de ~8 GB en FP16/BF16 y ~2-3 GB en cuantización de 4 bits, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar ejecución en GPUs de consumo con suficiente VRAM, pero no se especifica.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño (4 B), pero no se confirma ni se indican modelos concretos.
- Opciones de despliegue: transformers (librería indicada), con soporte de `custom_code` y `endpoints_compatible`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, GRPO 2k, seed 43) | 3,97 B | no disponible | RL con presupuesto fijo de 2.048 tokens | nvidia-nemotron-open-model-license | Hugging Face |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4 B | no disponible | Modelo base sin ajuste RL de presupuesto | nvidia-nemotron-open-model-license | Hugging Face |
| Checkpoints del mismo ablation (seeds 42 y 44, pasos 240-300) | 3,97 B | no disponible | Misma receta, distinta semilla y paso | nvidia-nemotron-open-model-license | Hugging Face |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de un ablation de semillas, no un modelo pulido para producción general.
- Entrenado exclusivamente en matemáticas (DeepScaleR): su rendimiento fuera de ese dominio no está caracterizado.
- Presupuesto fijo de 2.048 tokens: las respuestas que superan el límite se truncan, lo que puede producir respuestas incompletas o incorrectas.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni de calibración.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no especificados; se desconoce el comportamiento multilingüe.
- Licencia: hereda la NVIDIA Nemotron Open Model License, con posibles restricciones para uso comercial; debe revisarse antes de desplegar.
- Requiere `trust_remote_code` por el uso de `custom_code` en transformers.
- Pesos en F32: el repositorio ocupa 15,9 GB, lo que aumenta los requisitos de almacenamiento frente a versiones cuantizadas.
- Sin datos de benchmarks publicados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint seed 42, paso 240: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Checkpoint seed 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Checkpoint seed 43, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Checkpoint seed 44, paso 280: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Checkpoint seed 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper (referenciado en la model card, sin enlace disponible): *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*
