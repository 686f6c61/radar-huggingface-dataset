# budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por el grupo anónimo `budget-internalization-iclr2027` como parte de una submission a ICLR 2027. El objetivo concreto del entrenamiento es que el modelo aprenda a resolver problemas de razonamiento matemático operando bajo un presupuesto de generación estricto de 1.024 tokens (`max_new_tokens`). Es, por tanto, un artefacto de investigación sobre "internalización de presupuesto" (token-budget internalization) más que un modelo de propósito general listo para producción.

El modelo parte de la arquitectura Nemotron-3 Nano de 4B (identificada en los tags como `nemotron_h`), con 3.973.556.832 parámetros totales según los pesos en safetensors. Se ha entrenado con GRPO (Group Relative Policy Optimization) sobre el dataset de matemáticas DeepScaleR, con recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. Este repositorio concreto corresponde a la semilla 42 de una ablación de tres semillas (42, 43, 44) y al checkpoint final del paso 300.

Su relevancia es doble: por un lado, documenta un experimento reproducible de RL para razonamiento matemático en modelos pequeños; por otro, permite estudiar cómo se comporta un modelo de 4B cuando se le fuerza a razonar con un límite duro de tokens. No obstante, las descargas y likes son cero, no hay benchmarks publicados en la información disponible y la licencia es la de NVIDIA, lo que limita su uso comercial directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h`), transformer con código personalizado (`custom_code`) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (hereda la del modelo base) |
| Formato de pesos | safetensors (librería transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base NVIDIA Nemotron-3 Nano 4B, etiquetada como `nemotron_h` y distribuida con código personalizado (`custom_code`), por lo que requiere `trust_remote_code=True` tanto en el tokenizador como en el modelo. Los pesos de este checkpoint están en F32. No se dispone de información sobre el número de tokens de preentrenamiento del modelo base ni sobre la composición de su dataset original.

El ajuste fino se realizó con GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El presupuesto de generación se fijó en 1.024 tokens y las respuestas que alcanzan el límite se truncan y se puntúan tal cual, lo que constituye el mecanismo central del experimento. Los datos son DeepScaleR (matemáticas), con un máximo de 3 épocas; el batch es de 32 prompts × 8 rollouts por paso; el optimizador es Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de warmup; se entrenaron 300 pasos. La recompensa es binaria: corrección de la respuesta extraída de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, aunque no se publican los valores en la información disponible.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con salida de la respuesta final dentro de etiquetas `\boxed{}`.
- Razonamiento bajo restricción explícita de presupuesto de tokens (1.024 tokens de generación), que es la capacidad que el entrenamiento pretende internalizar.
- Generación conversacional (tag `conversational`) usando la plantilla de chat del modelo base.
- Entrenado específicamente para problemas de matemáticas tipo DeepScaleR; no hay evidencia de capacidades de código, visión, audio o tool calling en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el razonamiento multi-paso se limita al chain-of-thought matemático.
- Capacidades multilingües: no disponibles; los idiomas no están declarados.

## Casos de uso

- Investigación sobre internalización de presupuesto: usar el modelo para reproducir el experimento de la submission ICLR 2027 y analizar cómo varía la precisión matemática al forzar distintos límites de `max_new_tokens`.
- Ablación de semillas: comparar este checkpoint (semilla 42, paso 300) con los de las semillas 43 y 44 publicados por el mismo autor para estudiar la varianza del entrenamiento GRPO.
- Evaluación de robustez ante truncamiento: medir cuántas respuestas se truncan al alcanzar los 1.024 tokens y cómo afecta a la tasa de acierto en problemas de DeepScaleR.
- Generación de soluciones matemáticas con formato verificable: el modelo produce la respuesta en `\boxed{}`, lo que facilita su extracción automática en pipelines de evaluación.
- Baseline para comparativas de RL en modelos pequeños: servir como referencia de un modelo de 4B entrenado con GRPO frente a otros métodos de ajuste.
- Estudio de eficiencia computacional: analizar el coste de inferencia de un modelo de 4B con presupuesto fijo de generación en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos están en F32 (aproximadamente 15,9 GB de repo), por lo que en F32 se necesitan en torno a 16 GB solo para pesos, más overhead de activaciones y KV cache. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU de 24 GB o más (RTX 4090, A100 40 GB, H100) sería el punto de partida razonable para F32, aunque no está confirmado por el autor.
- ¿Cabe en consumer GPU? En F32 probablemente no en GPUs de 8-12 GB; requeriría cuantización, para la que no se documentan formatos soportados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y vLLM (`vllm serve ... --trust-remote-code`), según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, GRPO, seed 42) | 3,97 B | no disponible | GRPO sobre DeepScaleR, presupuesto 1k tokens | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 3,97 B (base) | no disponible | Preentrenamiento + ajuste de NVIDIA | nvidia-nemotron-open-model-license | Hugging Face (modelo base) |
| Otros checkpoints de la misma ablación (seed 43, seed 44) | 3,97 B | no disponible | Mismo recipe GRPO, distinta semilla | nvidia-nemotron-open-model-license | Hugging Face (mismo autor) |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación anónimo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Entrenado exclusivamente para matemáticas (DeepScaleR); su rendimiento fuera de ese dominio no está documentado y probablemente sea limitado.
- El truncamiento a 1.024 tokens puede degradar respuestas en problemas que requieran cadenas de razonamiento más largas.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Riesgo de alucinación inherente a un modelo de 4B ajustado con recompensa binaria; no hay evaluaciones de fidelidad publicadas.
- La licencia `nvidia-nemotron-open-model-license` impone condiciones propias de NVIDIA; es necesario revisar sus términos antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.
- No se publican cifras de validación ni benchmarks, por lo que no es posible verificar la mejora frente al modelo base.
- Pesos en F32: el repositorio ocupa 15,9 GB y el despliegue es más costoso en memoria que una versión BF16 o cuantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint seed 42, paso 290: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Checkpoint seed 43, paso 290: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Checkpoint seed 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Checkpoint seed 44, paso 240: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Checkpoint seed 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
