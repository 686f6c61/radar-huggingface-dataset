# JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-reasoninggym-smartcamel-s300

## Resumen

`budget-internalization-gemma4-e2b-2k-grpo-reasoninggym-smartcamel-s300` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal `google/gemma-4-E2B-it`, desarrollado por el equipo de investigación de JetBrains. El modelo aplica GRPO (Group Relative Policy Optimization) sobre tareas de Reasoning Gym para que el modelo interiorice un presupuesto fijo de generación de 2.048 tokens: las respuestas que agotan ese límite reciben recompensa cero durante el entrenamiento. El objetivo es que el modelo aprenda a razonar dentro de un presupuesto acotado en lugar de depender del escalado en tiempo de inferencia.

El checkpoint publicado corresponde al paso 300 de un run identificado internamente como `smartcamel`. El modelo conserva la arquitectura multimodal any-to-any del Gemma 4 E2B original (entrada de imagen y texto, salida de texto) y sus 5.123.178.051 parámetros totales, con pesos en F32 y un tamaño de repositorio de 20,5 GB.

La relevancia de esta ficha es doble: por un lado, ejemplifica una línea de investigación activa sobre cómo el RL con recompensas verificables (RLVR) puede trasladar el coste del razonamiento desde el tiempo de inferencia al entrenamiento; por otro, es un artefacto experimental con cero descargas y sin datos publicados de benchmarks, por lo que debe tratarse como material de investigación y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any), base Gemma 4 E2B |
| Parámetros totales | 5.123.178.051 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base, con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de tipo any-to-any con aproximadamente 5.120 millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO usando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La innovación central es el presupuesto fijo de generación: `max_new_tokens` se fija en 2.048 y cualquier respuesta que alcanza ese límite recibe recompensa cero, lo que fuerza al modelo a internalizar la restricción en lugar de aprender a razonar indefinidamente.

Los datos de entrenamiento son tareas de Reasoning Gym, problemas de razonamiento generados de forma procedural con respuestas en formato `\boxed{}`, verificadas automáticamente por el validador de cada tarea. La configuración usa 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup, durante 300 pasos y un máximo de 3 épocas. Los prompts se renderizan con la plantilla de chat del modelo base. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de la fuente Reasoning Gym.

## Capacidades

- Generación de texto y razonamiento multi-paso bajo un presupuesto de tokens fijo de 2.048.
- Resolución de problemas de razonamiento procedural (Reasoning Gym) con respuestas verificables en formato `\boxed{}`.
- Entrada multimodal imagen-texto (hereda la capacidad any-to-any del Gemma 4 E2B base).
- Razonamiento con presupuesto interno: el modelo está entrenado para no agotar el límite de generación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en RLVR: reproducir o extender el experimento de internalización de presupuesto comparando este checkpoint con el Gemma 4 E2B base en tareas de razonamiento acotadas por tokens.
- Razonamiento con latencia acotada: escenarios donde el coste por consulta debe ser predecible, ya que el modelo está entrenado para responder dentro de 2.048 tokens en lugar de escalar en tiempo de inferencia.
- Evaluación de robustez ante restricciones de longitud: usar el checkpoint para estudiar cómo se degrada la precisión cuando se fuerza un límite de generación estricto.
- Benchmarking de métodos de RL: comparar GRPO con otras variantes (PPO, DPO) sobre el mismo modelo base y el mismo dataset de Reasoning Gym.
- Generación de soluciones paso a paso en dominios matemáticos y lógicos: el formato `\boxed{}` permite extraer y verificar respuestas de forma automática en pipelines de evaluación.
- Prototipado de asistentes multimodales con presupuesto de cómputo fijo: aprovechando la entrada imagen-texto del Gemma 4 E2B base en entornos donde el coste de inferencia está limitado por diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en F32: aproximadamente 20,5 GB solo para los pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para inferencia básica.
- VRAM estimada en BF16/FP16: alrededor de 10,3 GB para pesos, más overhead; viable en GPUs de 16-24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5,1 GB para pesos; viable en GPUs consumer de 8-12 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,6 GB para pesos; viable en GPUs consumer de 6-8 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para F32 sin cuantizar; RTX 4090 (24 GB) para BF16; RTX 3090/4080 para cuantización de 8 bits.
- Despliegue: compatible con `transformers` (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-2k-grpo-reasoninggym-smartcamel-s300 | 5.123 M | no disponible | GRPO sobre Reasoning Gym, presupuesto 2.048 tokens | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it | 5.123 M (mismo base) | no disponible | SFT + alineación del modelo base | Gemma 4 License | Hugging Face, modelo base oficial |
| Alternativas de razonamiento con RLVR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es contra el propio modelo base `google/gemma-4-E2B-it`, ya que este checkpoint es un ajuste fino del mismo. No se dispone de datos de benchmarks que permitan cuantificar la mejora o el deterioro respecto al base.

## Limitaciones y advertencias

- Modelo experimental de investigación: cero descargas y cero likes en Hugging Face en el momento de la ficha, sin señales de validación por parte de la comunidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base ni sobre alternativas.
- Sesgos: no documentados en la información proporcionada; al heredar el modelo base, arrastra los sesgos del Gemma 4 E2B.
- Riesgo de alucinación: no evaluado; el entrenamiento con recompensas verificables sobre Reasoning Gym no garantiza reducción de alucinaciones fuera de ese dominio.
- Especialización estrecha: el ajuste se realizó exclusivamente sobre tareas de Reasoning Gym, por lo que puede degradar el rendimiento en dominios generales respecto al modelo base.
- Restricción de presupuesto: el modelo está entrenado para operar dentro de 2.048 tokens; respuestas que requieran más longitud pueden verse truncadas o degradadas.
- Idiomas: no disponibles en la información proporcionada; no se confirma el soporte multilingüe más allá del heredado del base.
- Licencia: Apache 2.0 según los metadatos, pero la model card indica que hereda la licencia de Gemma 4, lo que puede introducir términos adicionales de uso comercial; conviene revisar el enlace a la licencia de Gemma 4 antes de un uso en producción.
- Citation pendiente: la model card marca la sección de citación como TODO, lo que dificulta la trazabilidad académica del experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-reasoninggym-smartcamel-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Organización JetBrains Research: https://huggingface.co/JetBrains-Research
- Reasoning Gym: no disponible en la información proporcionada
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible enlace en la información proporcionada
