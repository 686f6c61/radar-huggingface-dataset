# davidafrica/e2h-polaris-gemma-4-e4b-it-full-mixed

## Resumen

e2h-polaris-gemma-4-e4b-it-full-mixed es un checkpoint de ajuste fino mediante GRPO (Group Relative Policy Optimization) sobre el modelo multimodal google/gemma-4-E4B-it de Google DeepMind. Lo desarrolla el usuario davidafrica en el contexto de las ejecuciones E2H (easy-to-hard) del proyecto Polaris, orientadas a mejorar el razonamiento matematico. El entrenamiento se realizo con verl 0.9.1 (entrenador v0, FSDP2) sobre el dataset Polaris-Dataset-53K, dividiendo los problemas segun la tasa de acierto del propio modelo base en 16 muestras.

La particularidad del entrenamiento es la estrategia de dificultad escalonada: los problemas faciles (resueltos entre 10 y 15 veces de 16) usan una recompensa basada en reglas contra la respuesta de referencia, mientras que los problemas dificiles (resueltos entre 1 y 9 veces de 16) usan voto mayoritario entre las 8 muestras generadas, sin consultar nunca la referencia. Este checkpoint corresponde al paso 200 de 200 de la ronda de split completo, en la que los conjuntos de entrenamiento contienen todos los problemas de cada banda.

El modelo conserva la arquitectura completa de Gemma 4 E4B, con 7.996.156.490 parametros, y solo se entreno el modelo de lenguaje: las torres de vision y audio son las del checkpoint base. Los pesos se publican en bf16, fusionados a partir de los shards FSDP de verl, con licencia Apache 2.0. Es relevante para quienes investigan tecnicas de RL aplicadas a matematicas y para quien necesite un modelo con modo de razonamiento explicito afinado especificamente en problemas de dificultad calibrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con atencion K/V compartida en las ultimas 18 capas |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un checkpoint multimodal completo que incluye torres de vision y audio ademas del modelo de lenguaje. En este ajuste solo se entreno el componente de lenguaje; las torres de vision y audio se mantienen intactas respecto al base. Gemma 4 comparte claves y valores (K/V) en sus ultimas 18 capas, de modo que sus propias k_proj, v_proj y k_norm nunca se utilizan en la practica; en este checkpoint se copian sin cambios desde el base para que los nombres de tensor coincidan.

El entrenamiento uso GRPO con verl 0.9.1 (entrenador v0, FSDP2) sobre Polaris-Dataset-53K. Los problemas se dividieron por la tasa de acierto del modelo base en 16 muestras: banda facil (10-15 de 16) y banda dificil (1-9 de 16). La recompensa es basada en reglas (correccion frente a la respuesta de referencia) en los problemas faciles, y voto mayoritario entre las 8 muestras de cada problema en los dificiles, sin usar la referencia. Se ejecutaron 200 pasos de 64 prompts x 8 muestras, con learning rate 1e-6, perdida KL de 0.001 (low_var_kl) y respuestas de 2048 tokens con el modo thinking activado. El conjunto train_all (train_easy + train_hard) suma 29.394 problemas. La evaluacion se realizo cada 50 pasos sobre eval_all (5.304 problemas de todas las tasas de acierto) y eval_hard (10.765 problemas que el base no resolvio ninguna vez en 16 intentos).

## Capacidades

- Generacion de texto y razonamiento con modo thinking explicito, entrenado con respuestas de hasta 2048 tokens.
- Razonamiento matematico afinado especificamente sobre problemas de dificultad calibrada (Polaris-Dataset-53K).
- Capacidades multimodales heredadas del base: procesamiento de vision y audio mediante las torres del checkpoint google/gemma-4-E4B-it.
- Carga mediante AutoModelForImageTextToText y vLLM, con acceso a cada paso intermedio como revision independiente (step-200 en main, y ramas cada 50 pasos).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en RL para matematicas: reproducir o comparar la estrategia E2H (easy-to-hard) de Polaris cargando las distintas revisiones (step-50, step-100, step-150, step-200) y midiendo la evolucion sobre eval_all y eval_hard.
- Evaluacion de recompensas por voto mayoritario: analizar como afecta entrenar problemas dificiles sin respuesta de referencia, comparando este checkpoint con la variante all_rb del mismo autor.
- Generacion de soluciones matematicas con traza de razonamiento: usar el modo thinking para obtener desarrollos paso a paso en problemas de competicion o de nivel avanzado.
- Servicio de inferencia con vLLM: desplegar el checkpoint con vllm.LLM apuntando a la revision step-200 para obtener respuestas de hasta 2048 tokens con razonamiento extendido.
- Destilacion o generacion de datos sinteticos: producir soluciones razonadas de alta dificultad para ampliar datasets de entrenamiento matematico.
- Experimentos multimodales: al conservar las torres de vision y audio del base, permite estudiar la transferencia del ajuste matematico sobre entradas de imagen o audio sin reentrenar dichas torres.
- Fine-tuning posterior: partir de este checkpoint como inicializacion para nuevos ciclos GRPO o SFT, dado que los pesos estan en bf16 y la licencia Apache 2.0 permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones internas sobre eval_all (5.304 problemas) y eval_hard (10.765 problemas) cada 50 pasos, pero no se incluyen cifras concretas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (7.996 millones de parametros), mas overhead de activaciones y cache KV, lo que situa el requisito practico en torno a 18-24 GB segun longitud de contexto y batch.
- Cuantizacion: no se publican pesos GGUF ni cuantizaciones oficiales; seria necesario generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con batches pequenos; RTX 3090 (24 GB) es el minimo consumer viable en bf16.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y modelos con 24 GB o mas, siempre que se limite el contexto y el batch.
- Opciones de despliegue: vLLM (soportado explicitamente via vllm.LLM con revision step-200), AutoModelForImageTextToText de Transformers, y conversiones a llama.cpp/Ollama previa cuantizacion (no verificadas en la informacion disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-gemma-4-e4b-it-full-mixed | 7.996.156.490 | no disponible | GRPO matematico E2H sobre Gemma 4 E4B | Apache 2.0 | Hugging Face (revisiones por paso) |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo base multimodal (texto, vision, audio) | Gemma (terminos de Google) | Hugging Face |
| davidafrica/e2h-polaris-gemma-4-e4b-it-all_rb | aproximadamente 8B | no disponible | Variante GRPO con recompensa basada en reglas en todas las bandas | no disponible | Hugging Face |

La comparativa con modelos de otros desarrolladores (por ejemplo, otros ajustes matematicos de 7-8B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de su calidad.
- No se publican cifras de benchmarks ni tasas de acierto, por lo que el rendimiento real frente al base es desconocido.
- El ajuste se limita al modelo de lenguaje: las torres de vision y audio no se entrenaron y conservan el comportamiento del base.
- El entrenamiento se realizo exclusivamente sobre problemas matematicos de Polaris-Dataset-53K; es previsible una degradacion en tareas generales de lenguaje respecto al base, aunque no se documenta.
- La recompensa por voto mayoritario en problemas dificiles puede reforzar razonamientos incorrectos pero consistentes entre muestras, un riesgo conocido de este tipo de RL sin referencia.
- No se especifican los idiomas soportados; la cobertura multilingue debe asumirse igual a la del base, sin verificacion.
- Las capas con K/V compartida conservan tensores k_proj, v_proj y k_norm del base que no se usan; herramientas que inspeccionen pesos deben tenerlo en cuenta.
- Licencia Apache 2.0 declarada en la model card, pero el modelo base google/gemma-4-E4B-it tiene sus propios terminos de uso que conviene revisar antes de un despliegue comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse antes de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-full-mixed
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante all_rb del mismo autor: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-all_rb
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Repositorio de verl (framework de entrenamiento): no disponible como enlace en la informacion proporcionada
- Paper de GRPO: no disponible como enlace en la informacion proporcionada
- Dataset Polaris-Dataset-53K: no disponible como enlace en la informacion proporcionada
