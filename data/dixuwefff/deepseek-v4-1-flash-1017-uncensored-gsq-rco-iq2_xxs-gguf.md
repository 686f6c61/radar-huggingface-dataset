# DiXuWefff/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF es una compilación GGUF cuantizada y "abliterated" (sin censura) del modelo ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF, publicada por el usuario DiXuWefff. Se trata de una variante de la familia DeepSeek V4.1 Flash en la que se han eliminado los mecanismos de rechazo mediante la técnica de abliteration, es decir, la supresión de las direcciones residuales asociadas a la negativa a responder. El resultado es un modelo de generación de texto conversacional que mantiene prácticamente intactas las capacidades del original según las métricas de divergencia KL reportadas por el autor.

El modelo cuenta con aproximadamente 196.600 millones de parámetros totales y se distribuye en un formato GGUF fragmentado en seis shards, con un tamaño de repositorio de 250,1 GB. Está pensado para su ejecución en llama.cpp (build b11870 o superior) y en el runtime Strata, e incorpora soporte de visión mediante un proyector multimodal separado (mmproj). La cuantización combina capas de expertos en 1 bit (IQ1_M), una tabla de búsqueda Engram en IQ4_NL y tensores concretos promovidos a Q6_K para preservar la calidad tras la abliteration.

La relevancia de esta ficha radica en que documenta un caso de cuantización extrema (2 bits efectivos) sobre un modelo de escala grande, con un esfuerzo explícito por parte del autor de verificar empíricamente que la eliminación de la censura y la compresión no degradan significativamente la distribución de probabilidad del modelo base. Es un artefacto de interés para investigadores que estudian técnicas de abliteration, cuantización mixta y despliegue de modelos masivos en hardware limitado, aunque su naturaleza "uncensored" y su escasa adopción (0 descargas, 0 likes en el momento de la consulta) exigen cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia DeepSeek V4.1 Flash), con capas de expertos enrutados y tabla Engram; detalles completos no disponibles |
| Parametros totales | 196.613.849.600 (aprox. 196,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (build principal), IQ1_M (28 capas de expertos enrutados GSQ), IQ4_NL (tabla Engram de 110,6 GB), Q6_K (tensores abliterated: attn_output_b y ffn_down) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 00001-of-00006 a 00006-of-00006), más mmproj BF16 para visión |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia DeepSeek V4.1 Flash, un transformer con mezcla de expertos (MoE) enrutados y una estructura adicional denominada Engram, que en esta compilación se materializa como una tabla de búsqueda de 110,6 GB cuantizada en IQ4_NL. El modelo base procede de ISTA-DASLab, y esta variante aplica sobre él una cuantización mixta agresiva: 28 capas de expertos enrutados permanecen en IQ1_M calibradas con GSQ (preservando, según el autor, el 100% de la calibración AIME25/GPQA-D del original), mientras que los tensores implicados en la abliteration se elevan a Q6_K para reducir la pérdida de calidad.

La innovación técnica principal es la "weight-baked abliteration": los 86 tensores residuales de escritura (80 densos y 6 capas de expertos exactas de 2 bits) se han integrado directamente en los pesos cuantizados, de modo que no se requiere ningún adaptador LoRA en tiempo de ejecución. El autor reporta una auditoría con `llama-perplexity --kl-divergence` (build b12017) sobre las 40 capas y los 129.280 logits del vocabulario: correlación de log-perplejidad del 99,84%, acuerdo Top-1 del 98,425% ± 1,109%, KL-divergencia mediana de 0,000421 nats y similitud coseno del subespacio de no-rechazo de 0,999609. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat, con plantilla Jinja embebida.
- Razonamiento explícito mediante modo "reasoning" activable (`--reasoning on --reasoning-effort 50` en llama.cpp).
- Capacidades de visión a través del proyector multimodal `mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf`.
- Comportamiento "uncensored": ausencia de mecanismos de rechazo entrenados, lo que permite responder a solicitudes que el modelo base declinaría.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Ejecución nativa en llama.cpp (b11870+ / b12017+) y en el runtime Strata (familia `deepseek41`).

## Casos de uso

- Investigación sobre abliteration: el modelo sirve como artefacto de estudio para medir el impacto real de la supresión de direcciones de rechazo sobre la distribución de salida, gracias a las métricas de KL-divergencia y acuerdo Top-1 publicadas por el autor.
- Evaluación de cuantización extrema: permite analizar el comportamiento de un modelo de ~196,6 mil millones de parámetros comprimido a IQ2_XXS con capas IQ1_M, útil para estudiar los límites prácticos de la compresión de pesos en modelos MoE.
- Despliegue en llama.cpp con visión: mediante `llama-server` y el mmproj BF16 se puede montar un endpoint local que procese texto e imágenes, adecuado para prototipos de asistentes multimodales.
- Pruebas de robustez y seguridad: al carecer de mecanismos de rechazo, es útil en entornos controlados para auditar sesgos, generar contenido adversario y calibrar filtros externos.
- Experimentación con el runtime Strata: el autor documenta la ejecución en Strata 0.2.8 con una GPU NVIDIA de 12 GB o superior, lo que permite probar inferencia de modelos masivos en hardware de gama media mediante offloading.
- Estudio de layouts GGUF fragmentados: el esquema de 6 shards con enlace simbólico del fichero Engram como shard 6 es un caso práctico para quienes diseñan pipelines de descarga y verificación de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de fidelidad respecto al modelo base (auditoría de divergencia KL), no resultados en tareas estándar como MMLU, HumanEval o GSM8K.

| Metrica de fidelidad (vs. base) | Resultado |
|---|---|
| Tensores verificados | 1.043 / 1.043 |
| Tensores abliterated (blake2b) | 86 (80 densos + 6 expertos de 2 bits) |
| Capas IQ1_M GSQ preservadas | 28 / 28 (100%) |
| Correlación log-perplejidad | 99,84% |
| Acuerdo Top-1 (Same top p) | 98,425% ± 1,109% |
| KL-divergencia mediana | 0,000421 nats |
| KL-divergencia media | 0,009546 ± 0,001921 nats |
| Similitud coseno subespacio no-rechazo | 0,999609 |
| PPL(Q) vs. PPL(base) | 2,4857 ± 0,5017 vs. 2,3538 ± 0,4522 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 250,1 GB y el backbone cuantizado 138,58 GB; no cabe en VRAM de consumo, requiere offloading a RAM/disco o múltiples GPU.
- GPU recomendadas: no disponible de forma explícita; el autor menciona ejecución en Strata con 1 GPU NVIDIA de 12 GB o más mediante offloading.
- ¿Cabe en consumer GPU? No de forma completa; solo con offloading parcial (Strata) o mediante llama.cpp con `-ngl 99` y suficiente RAM del sistema.
- Opciones de despliegue: llama.cpp (b11870+ / v0.8.0+), llama-server con mmproj para visión, runtime Strata 0.2.8 (build 0.1.54) con `--family deepseek41 --model ist-das-2.00bpw`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS (este) | ~196,6 mil millones | no disponible | MIT | GGUF, 6 shards | Abliterated, cuantización mixta IQ2_XXS/IQ1_M/IQ4_NL/Q6_K |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF (base) | ~196,6 mil millones | no disponible | no disponible | GGUF | Modelo original sin abliteration; sirve de referencia de calidad |
| Otros modelos de la familia DeepSeek V4.1 Flash | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Naturaleza "uncensored": la abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sesgado sin filtros internos; no es apto para producción orientada al público sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; la cuantización extrema a 2 bits efectivos puede incrementar la degradación en tareas de razonamiento largo.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no reflejadas; verificar antes de desplegar.
- Compatibilidad frágil: requiere builds específicos de llama.cpp (b11870+) o Strata 0.2.8, y el autor advierte de que la comprobación de tamaño de Strata puede fallar por la diferencia de 0,34 GB respecto al modelo stock.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe adecuado.
- Longitud de contexto no disponible: limita la planificación de casos de uso con documentos largos.
- Procedencia: el modelo base proviene de ISTA-DASLab y esta variante de un usuario individual (DiXuWefff), sin auditoría de seguridad externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DiXuWefff/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Runtime Strata: no disponible en la información proporcionada
