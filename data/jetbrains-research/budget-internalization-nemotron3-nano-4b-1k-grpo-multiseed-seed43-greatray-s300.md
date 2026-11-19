# JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300

## Resumen

Este repositorio contiene un ajuste fino por aprendizaje por refuerzo de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, el modelo de lenguaje de 4 mil millones de parámetros de NVIDIA. Lo publica el equipo de investigación de JetBrains (JetBrains-Research) como parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia cómo internalizar un presupuesto fijo de generación en el propio modelo en lugar de gestionarlo externamente en tiempo de inferencia. El checkpoint corresponde al paso 300 de una receta GRPO con un presupuesto de 1.024 tokens de generación.

El problema que aborda es concreto: los modelos de razonamiento suelen mejorar su precisión gastando más tokens en la fase de "pensamiento", lo que encarece y ralentiza la inferencia. Este ajuste entrena al modelo para que produzca respuestas correctas dentro de un límite estricto de tokens, de modo que la calidad no dependa de un escalado en tiempo de test. El entrenamiento se realiza sobre el conjunto DeepScaleR (matemáticas) con recompensa binaria de corrección de la respuesta extraída de las etiquetas `\boxed{}`.

Se trata de un artefacto de investigación, no de un modelo listo para producción: forma parte de un ablation de semillas (42, 43 y 44) y este run usa la semilla 43. Su interés principal es reproducibilidad y estudio de la varianza del entrenamiento RL, más que su uso directo en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (transformer híbrido, tag `nemotron_h` en Hugging Face) |
| Parametros totales | 3.973.556.832 (aprox. 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; el modelo base está en BF16) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (heredada del modelo base) |
| Formato de pesos | safetensors (requiere `custom_code` / `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, un transformer híbrido de la familia Nemotron-H con aproximadamente 4B parámetros. El ajuste no modifica la arquitectura: se aplica GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de presupuesto se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a resolver dentro de la ventana disponible.

Los detalles de entrenamiento son: presupuesto de generación (`max_new_tokens`) de 1.024 tokens, datos de DeepScaleR (matemáticas) con hasta 3 épocas, lote de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno y LR pico de 2e-6, 10 pasos de warmup y 300 pasos totales. La recompensa es binaria según la corrección de la respuesta extraída de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso.
- Resolución de problemas con respuesta final delimitada en `\boxed{}`.
- Razonamiento bajo un presupuesto fijo de 1.024 tokens de generación (objetivo central del ajuste).
- Conversacional: usa la plantilla de chat del modelo base.
- Compatible con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Evaluación de investigación sobre internalización de presupuesto: comparar este checkpoint con los de las semillas 42 y 44 para medir la varianza del entrenamiento GRPO en precisión dentro de presupuesto.
- Reproducción de experimentos de RLVR: reutilizar la receta (GRPO, recompensa binaria, DeepScaleR, 300 pasos) como línea base en estudios de razonamiento matemático.
- Inferencia con latencia acotada: al estar entrenado para responder en 1.024 tokens, encaja en escenarios donde el coste por consulta debe ser predecible, como pipelines de corrección automática de ejercicios.
- Generación de soluciones matemáticas verificables: la salida en `\boxed{}` permite extracción automática y comprobación programática de la respuesta.
- Estudio de degradación por truncamiento: analizar cómo se comporta el modelo cuando la respuesta excede el presupuesto, ya que el entrenamiento puntúa las respuestas truncadas tal cual.
- Fine-tuning posterior controlado: servir como punto de partida para experimentos que añadan tool calling o datasets de otras disciplinas sobre una base ya alineada a presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en F32 (unos 15,9 GB de repositorio); en BF16 rondaría los 8 GB y en cuantización de 8 bits unos 4 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para BF16 sin cuantizar; RTX 4090 (24 GB) suficiente para BF16.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 y en GPUs de 16 GB con cuantización, aunque no hay datos oficiales de cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `custom_code`); no se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Este checkpoint (Nemotron-3-Nano-4B, GRPO 1k, seed 43) | ~4B | no disponible | Razonamiento matemático con presupuesto fijo | NVIDIA Nemotron Open Model License |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base sin ajuste RL específico de presupuesto | NVIDIA Nemotron Open Model License |
| Checkpoints semilla 42 y 44 de la misma receta | ~4B | no disponible | Misma receta, distinta semilla | NVIDIA Nemotron Open Model License |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: no hay benchmarks publicados ni validación fuera del conjunto DeepScaleR.
- Entrenado exclusivamente con datos de matemáticas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- El presupuesto de 1.024 tokens es fijo; respuestas más largas se truncan y se puntúan tal cual, lo que puede producir respuestas incompletas.
- Licencia NVIDIA Nemotron Open Model License: revisar sus términos antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por el código personalizado de la arquitectura Nemotron-H.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Idiomas soportados no especificados; la cobertura multilingüe no está garantizada.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint semilla 42 (paso 290): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Checkpoint semilla 42 (paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Checkpoint semilla 43 (paso 290): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Checkpoint semilla 44 (paso 240): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Checkpoint semilla 44 (paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin enlace disponible.
