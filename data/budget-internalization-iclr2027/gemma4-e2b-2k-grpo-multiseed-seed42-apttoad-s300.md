# budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300

## Resumen

El modelo `gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300` es un ajuste fino por refuerzo (GRPO) del modelo multimodal `google/gemma-4-E2B-it` de Google, desarrollado por el grupo anónimo `budget-internalization-iclr2027` en el marco de una submission a ICLR 2027. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas de razonamiento matemático operando bajo un presupuesto de generación restringido a 2.048 tokens, de modo que trunque sus cadenas de razonamiento y las adapte a esa restricción en lugar de fallar o desbordar la ventana.

Se trata de un modelo de 5.123.178.051 parámetros (según los pesos en safetensors), con arquitectura derivada de Gemma 4 y pipeline `any-to-any`, lo que implica que conserva las capacidades de entrada multimodal (image-text-to-text) del modelo base. El ajuste se realizó con GRPO sobre el dataset DeepScaleR (matemáticas), con recompensa binaria de corrección de respuesta y un total de 300 pasos de entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de investigación sobre "internalización de presupuesto" de tokens (cómo un modelo RL aprende a razonar dentro de un límite duro); por otro, forma parte de un ablation multi-semilla (semillas 42, 43 y 44) que permite evaluar la estabilidad del procedimiento. Es un checkpoint de investigación, no un modelo orientado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Gemma 4 (modelo base `google/gemma-4-E2B-it`); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; compatible con cuantización vía transformers/vLLM, pero no se documentan formatos) |
| Idiomas soportados | no disponibles (heredados del modelo base; no declarados en la model card) |
| Licencia | apache-2.0 (hereda la licencia de Gemma 4) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo multimodal (image-text-to-text, pipeline `any-to-any`) de aproximadamente 5.123 millones de parámetros. El ajuste no modifica la arquitectura base; se aplica un entrenamiento de refuerzo con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a internalizar la restricción.

Los datos de entrenamiento son el dataset `agentica-org/DeepScaleR-Preview-Dataset` (problemas de matemáticas), con un máximo de 3 épocas. La configuración es: batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6, 10 pasos de warmup y 300 pasos totales. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento es explícito: pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR; este checkpoint (paso 300) es también el mejor por precisión de validación de su semilla.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento (chain-of-thought) ajustadas a un presupuesto de 2.048 tokens.
- Generación de texto y razonamiento paso a paso con formato de respuesta `\boxed{}`.
- Capacidades multimodales heredadas del modelo base (image-text-to-text, pipeline `any-to-any`).
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo está entrenado para razonamiento matemático de un solo turno.
- Capacidades multilingües: no declaradas; dependen del modelo base.
- Modo "thinking": implícito en el prompt de entrenamiento ("Think step-by-step", "Let's think step-by-step"), pero no se documenta un modo de pensamiento separado.

## Casos de uso

- Evaluación de investigación sobre internalización de presupuesto: usar este checkpoint junto con las otras semillas (43, 44) para medir la varianza entre semillas del mismo recipe GRPO en tareas de matemáticas.
- Razonamiento matemático con límite duro de tokens: en pipelines donde el coste por respuesta está acotado (por ejemplo, 2.048 tokens máximo), el modelo está entrenado para producir respuestas correctas dentro de ese límite sin desbordar.
- Generación de soluciones matemáticas verificables: el formato `\boxed{}` permite extracción automática de la respuesta y validación programática en entornos educativos o de evaluación.
- Estudio de truncamiento en RL: analizar cómo el modelo aprende a comprimir cadenas de razonamiento cuando las respuestas que exceden el presupuesto se truncan y puntúan como están.
- Base para experimentos de destilación o comparación de recetas RL: al ser un finetune de un modelo multimodal pequeño (~5,1B), sirve como punto de partida para ablations sobre datos, recompensa o presupuesto.
- Reproducción de experimentos académicos: el repositorio documenta run ID, semilla, paso y configuración completa, lo que facilita la replicación en entornos de investigación con transformers o vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en F32 (~20,5 GB de repo), por lo que en F32 se necesitan al menos ~21 GB de VRAM solo para pesos, más overhead de activaciones. En BF16/FP16 el peso sería de ~10,2 GB; en cuantizaciones de 8 bits ~5,1 GB y en 4 bits ~2,6 GB (estimaciones teóricas, no documentadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para F32 sin cuantizar; RTX 4090 (24 GB) podría alojar los pesos en F32 pero con poco margen para contexto largo, y en BF16/FP16 sería viable con holgura.
- Cabe en GPU consumer: sí, en cuantizaciones de 8 o 4 bits en GPUs de 8-16 GB; en BF16 en GPUs de 16-24 GB.
- Opciones de despliegue: `transformers` (con `AutoModelForCausalLM` y `device_map="auto"`) y `vLLM` (`vllm serve`). No se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300 (este) | 5.123.178.051 | no disponible (presupuesto 2.048) | GRPO sobre DeepScaleR, 300 pasos | apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it | no disponible en la informacion | no disponible | SFT/RLHF del modelo base | licencia Gemma 4 | Hugging Face |
| gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300 | mismo base | no disponible (presupuesto 2.048) | GRPO, semilla 43 | apache-2.0 | Hugging Face |
| gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300 | mismo base | no disponible (presupuesto 2.048) | GRPO, semilla 44 | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación de una submission anónima a ICLR 2027; no está validado para producción.
- El entrenamiento se limita a matemáticas (DeepScaleR) con recompensa binaria; el rendimiento en otras tareas no está evaluado y puede degradarse respecto al modelo base.
- El presupuesto de 2.048 tokens es una restricción de entrenamiento; las respuestas que exceden ese límite se truncan, lo que puede producir soluciones incompletas o incorrectas en problemas que requieran razonamientos más largos.
- Riesgo de alucinación: no evaluado; el modelo base puede alucinar y el ajuste RL no lo corrige fuera del dominio matemático.
- Sesgos: no documentados; heredados del modelo base y del dataset DeepScaleR.
- Idiomas: no declarados; el prompt de entrenamiento está en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia: apache-2.0 según la model card, pero se indica que hereda la licencia de `google/gemma-4-E2B-it`; conviene revisar los términos de la licencia Gemma 4 para uso comercial.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint semilla 43 (paso 170): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Checkpoint semilla 43 (paso 300): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Checkpoint semilla 44 (paso 230): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Checkpoint semilla 44 (paso 300): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
