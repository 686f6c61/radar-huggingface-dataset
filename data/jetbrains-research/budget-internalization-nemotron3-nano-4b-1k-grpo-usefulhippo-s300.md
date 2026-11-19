# JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-usefulhippo-s300

## Resumen

El modelo `budget-internalization-nemotron3-nano-4b-1k-grpo-usefulhippo-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por el grupo de investigación de JetBrains (JetBrains-Research). Su objetivo es internalizar un presupuesto fijo de generación de 1.024 tokens para tareas de razonamiento matemático, de modo que el modelo aprenda a resolver problemas dentro de ese límite en lugar de depender de un escalado de cómputo en tiempo de inferencia (test-time scaling). Se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo conserva la arquitectura del base Nemotron-3 Nano, con aproximadamente 3.970 millones de parámetros (3,97 B) en precisión BF16, y se distribuye en formato safetensors con pesos en F32 tras el entrenamiento. El ajuste se realizó con GRPO sobre el conjunto de datos DeepScaleR (matemáticas), con una recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`.

Es relevante porque aborda un problema práctico de producción: reducir la longitud de las cadenas de razonamiento sin sacrificar precisión, lo que disminuye coste de inferencia y latencia. El checkpoint publicado corresponde al paso 300 de un run identificado con el apodo `usefulhippo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-3 Nano (transformer, familia `nemotron_h`; detalles internos no disponibles) |
| Parametros totales | 3.973.556.832 (≈3,97 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (heredada del modelo base) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a producir razonamientos completos dentro de ese límite. La recompensa es binaria: corrección de la respuesta final extraída de las etiquetas `\boxed{}`.

El entrenamiento usó el conjunto DeepScaleR (matemáticas) durante un máximo de 3 épocas, con lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento. Se ejecutaron 300 pasos. El prompt de entrenamiento pide razonamiento paso a paso y salida dentro de `\boxed{}`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo que aporte el modelo base.

## Capacidades

- Generación de texto y razonamiento matemático con cadenas de razonamiento acotadas a 1.024 tokens.
- Resolución de problemas matemáticos con formato de respuesta `\boxed{}`.
- Razonamiento paso a paso (chain-of-thought) internalizado bajo presupuesto fijo.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información.
- Capacidades de agente y multi-step reasoning más allá del razonamiento matemático: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Evaluación de razonamiento matemático con presupuesto controlado: útil para comparar precisión cuando se limita la generación a 1.024 tokens, midiendo la degradación frente a modelos sin restricción.
- Inferencia de bajo coste en producción: al internalizar el presupuesto, se reducen tokens generados por consulta, lo que baja latencia y coste en servicios de resolución de problemas matemáticos.
- Tutoría automática de matemáticas: el modelo puede generar soluciones paso a paso acotadas, adecuadas para respuestas en interfaces con límite de longitud.
- Generación de soluciones verificables: el formato `\boxed{}` facilita la extracción automática y validación de la respuesta final en pipelines de corrección.
- Investigación en RLVR (RL con recompensa verificable): sirve como checkpoint de referencia para estudiar la internalización de presupuestos frente al escalado en tiempo de inferencia.
- Integración en entornos compatibles con endpoints de Hugging Face: despliegue directo para experimentos de razonamiento con límite de tokens.
- Base para nuevos ajustes por RL: punto de partida para experimentos con otros presupuestos o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/F32: los pesos en F32 ocupan aproximadamente 15,9 GB (tamaño del repo); en BF16 se reduciría a unos 8 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cabría en GPUs con 16 GB o más en BF16 (por ejemplo, RTX 4090, A100 40 GB, H100).
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en BF16; en F32 requeriría más de 16 GB y podría no caber en GPUs de 16 GB.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no se mencionan en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Presupuesto de generación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-nemotron3-nano-4b-1k-grpo-usefulhippo-s300 | ≈3,97 B | no disponible | 1.024 tokens (entrenado) | nvidia-nemotron-open-model-license | Hugging Face |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ≈4 B | no disponible | sin restricción específica | nvidia-nemotron-open-model-license | Hugging Face |
| Alternativas de razonamiento matemático de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado en matemáticas (DeepScaleR) y su rendimiento en otros dominios no está documentado.
- El presupuesto de 1.024 tokens se internaliza durante el entrenamiento; fuera de ese régimen el comportamiento puede degradarse.
- Las respuestas que alcanzan el presupuesto se truncan durante el entrenamiento, lo que puede introducir sesgos hacia soluciones incompletas en problemas largos.
- Riesgo de alucinación en razonamientos matemáticos no verificado más allá de la recompensa binaria de respuesta.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; probablemente heredados del base, sin confirmación.
- Licencia `nvidia-nemotron-open-model-license`: revisar términos para uso comercial antes de desplegar.
- Pesos en F32: mayor consumo de memoria y almacenamiento que una versión BF16.
- No hay benchmarks publicados ni citación formal (la model card indica "TODO" en la sección de cita).

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-usefulhippo-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (enlace no proporcionado)
