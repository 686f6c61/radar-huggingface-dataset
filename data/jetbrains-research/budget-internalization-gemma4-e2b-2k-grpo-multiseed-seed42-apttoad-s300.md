# JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research, orientado a razonamiento matemático bajo un presupuesto fijo de generación de 2.048 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia cómo internalizar la restricción de longitud en el propio modelo en lugar de aplicarla externamente en tiempo de inferencia. El checkpoint publicado corresponde al paso 300 de la ejecución con semilla 42, que además es el mejor por precisión de validación.

La relevancia práctica es concreta: en lugar de dejar que el modelo genere cadenas de razonamiento largas y esperar a que converjan, este ajuste le enseña a producir respuestas correctas dentro de un límite estricto de tokens, lo que reduce coste de inferencia y latencia en escenarios de producción con SLA. El modelo mantiene la pipeline `any-to-any` del Gemma 4 multimodal original, aunque el entrenamiento se centró exclusivamente en matemáticas.

El tamaño real de pesos es de 5.123.178.051 parámetros (unos 5,12 mil millones) según safetensors, sobre una arquitectura Gemma 4 con variante E2B. La licencia declarada es Apache-2.0, aunque la model card remite a la licencia propia de Gemma 4 de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, variante E2B); detalles internos no disponibles |
| Parámetros totales | 5.123.178.051 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con remisión a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con pipeline `any-to-any` (entrada y salida imagen-texto). El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`. Las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntúan tal cual, lo que empuja al modelo a internalizar el límite en lugar de ignorarlo.

El entrenamiento usa el dataset DeepScaleR (matemáticas) con un máximo de 3 épocas, lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento, durante 300 pasos. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El experimento forma parte de una ablación de semillas (42, 43 y 44) con checkpoints publicados en repositorios hermanos.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso bajo un presupuesto fijo de 2.048 tokens.
- Resolución de problemas de matemáticas con formato de respuesta `\boxed{}`.
- Interno de presupuesto: el modelo aprende a ajustar la longitud de su cadena de razonamiento al límite impuesto.
- Pipeline multimodal `any-to-any` heredada del modelo base (imagen-texto), aunque el ajuste se centró en matemáticas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el razonamiento paso a paso está orientado a matemáticas.
- Capacidades multilingües: no documentadas.
- Modo thinking: no documentado como tal; el prompt de entrenamiento induce razonamiento paso a paso.

## Casos de uso

- Evaluación de razonamiento matemático con coste acotado: el modelo permite medir precisión en problemas de competición con un techo estricto de 2.048 tokens, útil para comparar recetas de RL frente a decodificación libre.
- Sistemas de tutoría matemática con SLA de latencia: al internalizar el presupuesto, las respuestas no se alargan indefinidamente, lo que facilita estimar coste por consulta y cumplir tiempos de respuesta en un servicio educativo.
- Generación de soluciones verificables en pipelines de corrección automática: el formato `\boxed{}` permite extraer y validar la respuesta final de forma programática en un corrector automático.
- Investigación en RLVR (RL with verifiable rewards): sirve como checkpoint de referencia en ablaciones de semillas y de presupuesto para estudiar varianza de entrenamiento.
- Prototipado de asistentes de resolución de problemas en entornos con GPU limitada: con unos 5,1 mil millones de parámetros, es viable en hardware de gama alta de consumo tras cuantización, aunque el repo publica F32.
- Base para experimentos de destilación o ajuste adicional: al ser un fine-tune de Gemma 4 E2B-it con licencia permisiva, se puede reutilizar como punto de partida en dominios STEM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 300 es el mejor de esta ejecución, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo de pesos (coherente con el tamaño del repo), más overhead de activaciones y contexto.
- VRAM estimada en BF16/FP16: en torno a 10-11 GB de pesos; en cuantización de 8 bits, unos 5-6 GB; en 4 bits, unos 3 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para F32 sin cuantizar; RTX 4090 (24 GB) para BF16; GPUs de consumo con 8-12 GB tras cuantización.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-8 bits, siempre que se use un runtime compatible con Gemma 4.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-2k-grpo (este) | 5,12 B | no disponible | RLVR con presupuesto fijo de 2.048 tokens | Apache-2.0 | Hugging Face (JetBrains-Research) |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo base multimodal instruct | Licencia Gemma 4 | Hugging Face (Google) |
| DeepSeek-R1-Distill (variantes pequeñas) | ~1,5-7 B según variante | no disponible | Destilación de razonamiento | MIT / otras | Hugging Face |

La comparación con alternativas de razonamiento matemático de tamaño similar (por ejemplo, variantes destiladas de R1 o Qwen Math) no puede completarse con datos verificables en la información proporcionada; los datos de rendimiento de este checkpoint no se han publicado.

## Limitaciones y advertencias

- El ajuste se limita a matemáticas (DeepScaleR); el rendimiento en otros dominios puede degradarse respecto al modelo base.
- El truncado a 2.048 tokens durante el entrenamiento puede producir respuestas cortadas en problemas que requieran cadenas de razonamiento más largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recompensa binaria por corrección no elimina errores de razonamiento.
- No hay información sobre sesgos, cobertura idiomática ni evaluación de seguridad de este checkpoint.
- La licencia declarada es Apache-2.0, pero la model card remite a la licencia de Gemma 4 de Google; conviene revisar las condiciones de uso comercial de la licencia base antes de desplegar en producción.
- Es un checkpoint de investigación (paso 300 de una ablación de semillas), sin garantías de robustez ni de mantenimiento.
- Los pesos se publican en F32, lo que incrementa los requisitos de almacenamiento y memoria frente a versiones cuantizadas.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint hermano (semilla 43, paso 170): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Checkpoint hermano (semilla 43, paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Checkpoint hermano (semilla 44, paso 230): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Checkpoint hermano (semilla 44, paso 300): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
