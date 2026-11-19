# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a razonamiento matematico bajo un presupuesto fijo de generacion de 8.192 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia como el RL con recompensa verificable (RLVR) puede internalizar una restriccion de longitud en lugar de depender del escalado en tiempo de inferencia.

El checkpoint publicado corresponde al paso 290 de una ablacion de semillas; en concreto, la semilla 44 de tres ejecuciones (42, 43 y 44) de la misma receta. Se selecciono como el mejor checkpoint de esa ejecucion segun la precision de validacion medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

El modelo tiene 4.539.265.536 parametros en BF16, hereda la arquitectura multimodal de Qwen3.5-4B (pipeline `image-text-to-text`) y se distribuye con licencia Apache 2.0. Su relevancia radica en que permite estudiar la variabilidad entre semillas del RL aplicado a razonamiento matematico con presupuesto acotado, un aspecto poco documentado en la literatura de RLVR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generacion entrenado es de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de 4.539 millones de parametros. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el limite de 8.192 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a internalizar el presupuesto en lugar de aprender a evitarlo.

Los datos de entrenamiento son el dataset DeepScaleR (matematicas) con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. El entrenamiento se detuvo en el paso 290 (de un maximo de 300), seleccionado por precision de validacion sobre 480 problemas reservados. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`.

## Capacidades

- Razonamiento matematico con presupuesto de generacion fijo de 8.192 tokens, entrenado explicitamente para producir respuestas correctas dentro de ese limite.
- Generacion de cadenas de razonamiento paso a paso ("Let's think step-by-step") y extraccion de respuesta final en formato `\boxed{}`.
- Capacidades multimodales heredadas del modelo base (pipeline `image-text-to-text`), aunque el ajuste RL se centra en matematicas.
- Soporte de conversacion multi-turno mediante la plantilla de chat del modelo base.
- No se documenta soporte especifico de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de robustez de RLVR: comparar este checkpoint (semilla 44) con las semillas 42 y 43 del mismo recipe para medir la varianza entre semillas en precision matematica bajo presupuesto fijo.
- Investigacion sobre internalizacion de presupuesto: analizar si el modelo mantiene precision al truncar la generacion a 8.192 tokens frente al modelo base sin ajuste, midiendo la degradacion por truncamiento.
- Generacion de soluciones matematicas verificables: usar el modelo en pipelines que extraen la respuesta de `\boxed{}` y la comparan automaticamente con la solucion de referencia (evaluacion tipo pass@1).
- Baseline en estudios de test-time scaling: servir como referencia de "presupuesto interno" frente a tecnicas de escalado en inferencia (self-consistency, best-of-n) aplicadas al modelo base.
- Fine-tuning posterior con RL: reutilizar este checkpoint como punto de partida para experimentos con otros presupuestos (por ejemplo, 4k o 16k) y comparar curvas de aprendizaje.
- Analisis de eficiencia en inferencia: medir coste por consulta al limitar la generacion a 8.192 tokens en lugar de dejar que el modelo razone indefinidamente, util en entornos con latencia o coste acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la seleccion del checkpoint se baso en precision de validacion sobre 480 problemas reservados de DeepScaleR, sin proporcionar el valor numerico.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parametros × 2 bytes), mas overhead de activaciones y KV cache; en la practica se recomienda al menos 16-24 GB para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, aproximadamente 2,5-3 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en BF16, y en 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (formato nativo safetensors); vLLM, TGI, llama.cpp u Ollama requeririan conversion o soporte de la arquitectura Qwen3.5, no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B, 8k, GRPO, seed 44) | 4.539 M | no disponible | RLVR con presupuesto fijo de 8k | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4.539 M | no disponible | Modelo base multimodal sin RL especifico | Apache 2.0 (heredada) | Hugging Face |
| Mismo recipe, seed 42 (s290) | 4.539 M | no disponible | RLVR con presupuesto fijo de 8k | Apache 2.0 | Hugging Face |
| Mismo recipe, seed 43 (s160/s300) | 4.539 M | no disponible | RLVR con presupuesto fijo de 8k | Apache 2.0 | Hugging Face |

Las diferencias entre las tres semillas son de inicializacion y orden de datos; la comparacion relevante es la varianza de precision entre ellas, no diferencias arquitectonicas.

## Limitaciones y advertencias

- Especializado en matematicas: el ajuste RL se entrena exclusivamente con DeepScaleR, por lo que el rendimiento en otras tareas (codigo, vision, conversacion general) puede degradarse respecto al modelo base.
- Presupuesto fijo de 8.192 tokens: las respuestas que superan ese limite se truncan durante el entrenamiento, lo que puede producir respuestas incompletas o sin `\boxed{}` en problemas muy largos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir razonamientos plausibles con resultados incorrectos; la recompensa binaria no garantiza correccion fuera de la distribucion de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento es en ingles (prompt y dataset), lo que probablemente limita el rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-4B; conviene verificar los terminos de dicho modelo base.
- Checkpoint intermedio (paso 290, no el final de 300): no es necesariamente el de mayor rendimiento fuera de la validacion usada para seleccionarlo.
- Modelo de investigacion: sin descargas ni likes, sin demo ni resultados de benchmarks publicados; no recomendado como dependencia de produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint final del mismo run (paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Semilla 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Semilla 43, paso 160: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin enlace disponible.
