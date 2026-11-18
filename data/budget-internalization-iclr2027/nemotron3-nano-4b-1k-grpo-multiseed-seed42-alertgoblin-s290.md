# budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, desarrollado por el grupo anónimo `budget-internalization-iclr2027` en el marco de una submission a ICLR 2027. El objetivo del trabajo es estudiar la "internalización de presupuesto": entrenar al modelo para que razone problemas de matemáticas produciendo la respuesta dentro de un límite estricto de 1.024 tokens de generación. El modelo resuelve, por tanto, el problema de controlar la longitud del razonamiento en modelos de razonamiento (reasoning models), donde las cadenas de pensamiento pueden crecer sin control y encarecer la inferencia.

Técnicamente se trata de un transformer de 3.973.556.832 parámetros (aproximadamente 4B), derivado del Nemotron-3-Nano-4B de NVIDIA, con arquitectura declarada como `nemotron_h` en los tags del repositorio. El ajuste se realizó con GRPO (Group Relative Policy Optimization) sobre el dataset DeepScaleR (matemáticas), con recompensa binaria basada en la corrección de la respuesta extraída de etiquetas `\boxed{}`. Las respuestas que alcanzan el límite de 1.024 tokens se truncan y se puntúan tal cual.

Este repositorio concreto es un punto de control intermedio (step 290) de una ablación de semillas: es la mejor checkpoint de la semilla 42 según precisión de validación sobre 480 problemas retenidos de DeepScaleR. Su relevancia es fundamentalmente de investigación: permite reproducir y auditar el efecto del presupuesto de tokens y de la semilla en el rendimiento de razonamiento matemático, más que un uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformer, según tags del repo) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 y se ajusta con GRPO, una variante de optimización de política con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Se entrena sobre el dataset agentica-org/DeepScaleR-Preview-Dataset (matemáticas), con un máximo de 3 épocas, lote de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de warmup. La recompensa es binaria: se extrae la respuesta de las etiquetas `\boxed{}` y se comprueba su corrección. Las respuestas que agotan el presupuesto de 1.024 tokens se truncan y se evalúan en ese estado.

La innovación central no es arquitectónica sino de procedimiento: el entrenamiento impone un presupuesto de generación fijo (`max_new_tokens` = 1.024) y mide la precisión de validación cada 10 pasos sobre 480 problemas retenidos de DeepScaleR. Este repositorio corresponde al paso 290, seleccionado como mejor checkpoint de la semilla 42. Los pesos se publican en F32, lo que explica el tamaño de 15,9 GB del repositorio. El prompt de entrenamiento es explícito: "Think step-by-step to solve the following problem. Output your answer inside of \boxed{} tags." seguido del problema y "Let's think step-by-step".

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, orientado a problemas de competición del tipo DeepScaleR.
- Razonamiento bajo presupuesto de tokens: el modelo está entrenado para producir la respuesta dentro de 1.024 tokens de generación.
- Extracción de respuesta estructurada mediante etiquetas `\boxed{}`.
- Formato conversacional (usa la plantilla de chat del modelo base).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del razonamiento matemático: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no se declaran).
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Investigación sobre internalización de presupuesto: sirve para reproducir el experimento de ICLR 2027 y comparar el efecto de 1.024 tokens frente a otros presupuestos en la precisión matemática.
- Ablación de semillas: al existir checkpoints equivalentes para las semillas 42, 43 y 44, permite medir la varianza del entrenamiento GRPO en tareas de matemáticas.
- Evaluación de robustez de reasoning models: útil para estudiar cómo se comporta el modelo cuando se le fuerza a responder con truncamiento a 1.024 tokens.
- Generación de soluciones matemáticas con formato verificable: el modelo emite la respuesta en `\boxed{}`, lo que facilita la evaluación automática en pipelines de corrección.
- Baseline para ajustes finos posteriores: al ser un finetune del Nemotron-3-Nano-4B, puede servir como punto de partida para experimentos de RL con otros datasets o presupuestos.
- Estudio de eficiencia en inferencia: permite analizar el coste computacional de un modelo de 4B con cadenas de razonamiento acotadas, relevante para despliegues con latencia y coste controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas retenidos de DeepScaleR y que este checkpoint (paso 290) es el mejor de la semilla 42, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de la propia precisión de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en F32 (~15,9 GB), por lo que en precisión completa se necesitan al menos ~16 GB de VRAM solo para pesos, más memoria para el contexto y el estado de la KV cache. En BF16 serían ~8 GB; en cuantización de 8 bits, ~4 GB; en 4 bits, ~2-3 GB (estimaciones orientativas, no confirmadas en la información).
- GPU recomendadas: A100, H100 o L40S para inferencia en F32/BF16 con contexto amplio; RTX 4090 (24 GB) es suficiente para BF16 y probablemente para F32 con contexto corto.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en BF16; en 8-12 GB sería necesario cuantizar.
- Opciones de despliegue: transformers con `trust_remote_code=True` (documentado), vLLM con `--trust-remote-code` (documentado). Otras opciones como llama.cpp, Ollama o TGI no se mencionan y requerirían verificar compatibilidad con la arquitectura `nemotron_h`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, GRPO 1k, seed 42, s290) | ~4B | no disponible | GRPO sobre DeepScaleR | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base de NVIDIA | nvidia-nemotron-open-model-license | Hugging Face |
| Checkpoints hermanos de la ablación (seed 43, seed 44) | ~4B | no disponible | Mismo recetario, distinta semilla | nvidia-nemotron-open-model-license | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de razonamiento matemático de tamaño similar (por ejemplo, Qwen2.5-Math o DeepSeek-R1-Distill) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint intermedio (paso 290) de una ablación de semillas, no un modelo final optimizado para producción.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse solo con DeepScaleR (matemáticas), es probable que su rendimiento fuera de ese dominio sea limitado, aunque esto no se documenta explícitamente.
- Riesgo de alucinación: inherente a los modelos de razonamiento; el entrenamiento con recompensa binaria no elimina respuestas plausibles pero incorrectas.
- Limitación de presupuesto: el modelo está entrenado para responder en 1.024 tokens; las respuestas que exceden ese límite se truncan, lo que puede degradar la calidad en problemas que requieren cadenas más largas.
- Idiomas: no se declaran idiomas soportados; el prompt de entrenamiento está en inglés, por lo que el soporte multilingüe es incierto.
- Licencia: hereda la nvidia-nemotron-open-model-license, que puede imponer restricciones al uso comercial; es necesario revisar los términos antes de un despliegue productivo.
- Requiere `trust_remote_code=True` por el código personalizado de la arquitectura `nemotron_h`, lo que implica ejecutar código del repositorio.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint paso 300 de la misma semilla: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Checkpoint seed 43 (paso 290): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Checkpoint seed 43 (paso 300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Checkpoint seed 44 (paso 240): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Checkpoint seed 44 (paso 300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
