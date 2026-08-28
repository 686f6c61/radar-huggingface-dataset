# sayyidfareed/GLM-5.3-Flash-Spark-Q2XL-MTP

## Resumen

GLM-5.3-Flash-Spark-Q2XL-MTP es una cuantización GGUF de alta calidad del modelo GLM-5.3-Flash de Z.ai, diseñada específicamente para ejecutarse por completo en una NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada. El autor, sayyidfareed, ha aplicado una estrategia de cuantización mixta que conserva mayor precisión en las rutas sensibles (atención, normas, control recurrente) mientras comprime agresivamente los tensores de los expertos enrutados, logrando un tamaño total de unos 105 GiB en ocho shards.

El modelo base es un MoE de 320 mil millones de parámetros totales con solo 18 mil millones activos, el primero de la serie GLM-5 en ser nativamente multimodal, aunque esta versión cuantizada solo ha sido evaluada para generación de texto y código. La cuantización incorpora soporte nativo para decodificación especulativa MTP (Multi-Token Prediction), lo que permite velocidades de generación de alrededor de 22 tokens por segundo en el hardware objetivo, con una tasa de aceptación del 54,3% para los tokens especulados.

La relevancia de este modelo radica en que demuestra que es posible ejecutar un LLM de 320B en un equipo de escritorio de gama alta (DGX Spark) con una pérdida de calidad mínima en tareas de programación, manteniendo una licencia MIT que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención recurrente/SSM |
| Parametros totales | 320.759.404.382 |
| Parametros activos | 18.000.000.000 (18B) |
| Longitud de contexto | 32.768 tokens (configuración probada) |
| Tipos de cuantizacion | IQ3_XXS (expertos down), IQ2_XS (expertos gate/up), Q6_K (expertos compartidos), Q8_0 (atención), BF16/F32 (normas y controles) |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (8 shards, ~105 GiB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura de mezcla de expertos (MoE) con 320B parámetros totales y 18B activos por token, incorporando mecanismos de atención recurrente y control SSM (State Space Model) que permiten manejar secuencias largas de forma eficiente. El proceso de cuantización de este Spark Q2XL no es uniforme: los tensores de los expertos enrutados (que constituyen la mayor parte del peso) se comprimen a 2-3 bits, mientras que las matrices de atención se mantienen en Q8_0 y los componentes críticos como normas, controles de enrutamiento y tensores sensibles a MTP se conservan en BF16/F32. La calibración se realizó mediante importance-matrix, una técnica que pondera la importancia de cada peso según su contribución a la salida.

El modelo se sirve mediante un fork de llama.cpp (GLM5-Next, commit `ea37b8bb0`) que implementa decodificación especulativa nativa MTP, donde un pequeño modelo auxiliar predice varios tokens futuros que son verificados por el modelo principal. Esta técnica reduce la latencia efectiva y mejora el throughput en hardware con memoria unificada como el GB10.

## Capacidades

- Generación de texto y código en inglés y chino, con razonamiento de varios pasos.
- Soporte de decodificación especulativa MTP nativa, que acelera la generación sin pérdida de calidad.
- Capacidad de ejecución completa en memoria unificada de 128 GB (DGX Spark / GB10).
- Compatible con el ecosistema llama.cpp (llama-server, llama-cli) y con la API de servidor estándar.
- El modelo base es multimodal, pero esta cuantización solo ha sido validada para texto y código; no se reclama comportamiento de visión.
- No se ha verificado soporte de tool calling o function calling en esta versión cuantizada.

## Casos de uso

- Desarrollo de código asistido en local: el modelo alcanza un 97% de pass@1 en HumanEval, lo que lo hace adecuado para autocompletado y generación de funciones en entornos de desarrollo sin conexión a la nube.
- Evaluación de calidad de cuantizaciones: sirve como referencia para comparar el impacto de diferentes estrategias de compresión en modelos MoE de gran escala.
- Investigación en decodificación especulativa: su soporte MTP nativo permite estudiar el equilibrio entre velocidad y calidad en hardware de memoria unificada.
- Generación de documentación técnica y comentarios de código en entornos con requisitos estrictos de privacidad, al ejecutarse íntegramente en local.
- Prototipado de agentes de razonamiento que requieren contexto largo (hasta 32K tokens) sin depender de APIs externas.
- Benchmarking de hardware: su perfil de memoria y velocidad lo convierten en una carga de trabajo representativa para validar el rendimiento de estaciones de trabajo con 128 GB de RAM unificada.

## Benchmarks y rendimiento

Resultados medidos en una DGX Spark / GB10 con una sola muestra por tarea, temperatura 0, top-p 0.95, `reasoning_effort=low`, límite de 768 tokens de completado y EvalPlus 0.3.1 con HumanEvalPlus v0.1.10.

| Test | Resultado |
|---|---|
| HumanEval pass@1 | 159/164 (97,0%) |
| HumanEval+ Mini pass@1 | 153/164 (93,3%) |
| Microbenchmark de código (34 puntos) | 29/34 (85,3%) |
| Fallos de generación | 0/164 |
| Tiempo total de generación (164 tareas) | 1.025 s (una sola secuencia) |

Velocidad de generación (cinco completados de código, 512 tokens de salida cada uno):

| Métrica | Valor |
|---|---|
| Decodificación mediana | 22,504 tok/s |
| Decodificación media | 22,083 tok/s |
| Decodificación mínima | 17,176 tok/s |
| Completado efectivo mediano | 21,660 tok/s |
| TTFT mediano | 0,807 s |
| TTFT del primer intento | 0,930 s |
| Aceptación MTP nativa mediana | 54,3% |

En comparación, el quant Unsloth UD-Q2_K_XL del mismo modelo obtuvo 155/164 en HumanEval y 148/164 en HumanEval+ Mini, con una velocidad de decodificación mediana de 25,414 tok/s. Spark sacrifica aproximadamente un 11% de velocidad a cambio de cinco aciertos adicionales en HumanEval+.

## Requisitos de hardware

- Memoria necesaria: aproximadamente 105 GiB de VRAM o memoria unificada para cargar los ocho shards completos.
- GPU recomendada: NVIDIA DGX Spark / GB10 con 128 GB de memoria unificada (plataforma de validación).
- No cabe en GPUs de consumo convencionales (RTX 4090, 3090, etc.) por su tamaño; se necesitarían múltiples GPUs con al menos 48 GB cada una o memoria unificada de 128 GB.
- Opciones de despliegue: llama.cpp (fork GLM5-Next) con `llama-server`, activando `--flash-attn on`, `--cache-type-k q8_0`, `--cache-type-v q8_0` y `--spec-type draft-mtp`.
- Configuración probada: `--ctx-size 32768`, `--n-gpu-layers 999`, `--parallel 1`, `--spec-draft-n-max 3`, `--cache-ram 512`.
- Se recomienda limitar la caché de prompt a 512 MiB para evitar agotar la memoria en el entorno de servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash (original) | 320B totales, 18B activos | 32K+ | no disponible | MIT | safetensors |
| GLM-5.3-Flash-Spark-Q2XL-MTP | 320B totales, 18B activos | 32K (probado) | 97,0% | MIT | GGUF |
| Unsloth UD-Q2_K_XL (GLM-5.3-Flash) | 320B totales, 18B activos | 32K (probado) | 94,5% (155/164) | MIT | GGUF |

La comparativa se limita a las variantes cuantizadas del mismo modelo base, ya que no se dispone de datos de otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- La cuantización agresiva de los expertos enrutados (IQ2_XS e IQ3_XXS) puede degradar el rendimiento en tareas que dependen fuertemente de la precisión de esos pesos, aunque los benchmarks de código muestran una pérdida mínima.
- El modelo solo ha sido evaluado para generación de texto y código; no se garantiza el comportamiento multimodal (visión) del modelo base en esta versión cuantizada.
- La velocidad de generación depende críticamente de la tasa de aceptación MTP, que puede variar según la tarea y el idioma.
- Requiere hardware con al menos 128 GB de memoria unificada; no es viable en GPUs de consumo estándar.
- El runtime utilizado es un fork específico de llama.cpp; la compatibilidad con versiones oficiales de llama.cpp u otros servidores (vLLM, TGI) no está verificada.
- El contexto se probó a 32K tokens; no se han validado longitudes mayores.
- Aunque la licencia es MIT, el modelo base tiene atribuciones y limitaciones descritas en su model card original que deben respetarse.

## Enlaces

- [HuggingFace - sayyidfareed/GLM-5.3-Flash-Spark-Q2XL-MTP](https://huggingface.co/sayyidfareed/GLM-5.3-Flash-Spark-Q2XL-MTP)
- [Modelo base - zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [OpenLM.ai - GLM-5.3](https://openlm.ai/glm-5.5/)
- [Wikipedia - GLM (AI)](https://en.wikipedia.org/wiki/GLM_(AI))
- [Blog sobre GLM-5.3-Flash en chips chinos](https://kingy.ai/blog/glm-5-3-flash-chinese-chip-inference/)
- [Artículo sobre Ox Alpha = GLM-5.3-Flash](https://www.orcarouter.ai/blog/ox-alpha-stealth-model-what-we-know)
