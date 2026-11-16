# LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v15

## Resumen

Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v15 es una conversión de arquitectura del modelo DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2, publicada por LTM-Lab. No se ha entrenado, fusionado ni cuantizado ningún peso: los pesos son idénticos byte a byte a los del checkpoint original. Lo que añade esta versión es una arquitectura de memoria episódica (`Qwen3_5V15ForConditionalGeneration`) implementada en dos ficheros de código (`configuration_qwen_dense_v15.py` y `modeling_qwen_dense_v15.py`) más las opciones de memoria en `config.json`.

El modelo base es un fine-tune "abliterated" y "uncensored" derivado de la familia Qwen3.8, con 39.958.026.224 parámetros reales según los safetensors y un repositorio de 79,9 GB en bfloat16. La arquitectura subyacente es la de la conversión Qwen3.8-27B (Qwen3.5 dense, con capas Gated DeltaNet y capas de atención), escalada a 96 capas en lugar de 64, e incluye una cabeza MTP (multi-token prediction) para decodificación especulativa que ya venía en el checkpoint fuente.

La novedad relevante es la memoria persistente entre peticiones: los pares clave-valor que calculan las capas de atención se segmentan en eventos de hasta 128 tokens y se escriben en disco junto con un "engrama" de bajo rango del estado de las capas recurrentes. En una conversación posterior, esos eventos se recuperan por votación y se recomponen en el estado recurrente de la nueva petición, sin insertar texto en el prompt. Requiere servir el modelo con una imagen Docker modificada de SGLang (`lovewin10/sglang-v15`), lo que limita su portabilidad frente a un transformers estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 dense (Gated DeltaNet + capas de atención), 96 capas; clase `Qwen3_5V15ForConditionalGeneration` con memoria episódica |
| Parametros totales | 39.958.026.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configuración de servicio propuesta por el autor, no ejecutada) |
| Tipos de cuantizacion | no disponible (el repo publica pesos en bfloat16; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16), con `auto_map` y `custom_code` para transformers |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado en esta conversión: los pesos son los del checkpoint DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2, byte a byte, y la memoria episódica tampoco entrena nada. La arquitectura declarada es la de la conversión Qwen3.8-27B (Qwen3.5 dense con capas Gated DeltaNet y capas de atención) pero con 96 capas en lugar de 64. El checkpoint fuente incluye una cabeza MTP que se usa para el borrador de decodificación especulativa. El pipeline declarado es `image-text-to-text`, aunque la model card no detalla el codificador visual ni datos de entrenamiento multimodal.

La innovación técnica es el sistema de memoria en disco. Durante la lectura de un prompt, las claves y valores de atención se cortan en eventos de hasta 128 tokens y se almacenan con un engrama de bajo rango del estado recurrente. En una petición posterior, se lee el prompt una vez para determinar qué solicita, se recuperan por votación (una votación para todas las capas y cabezas) los eventos cuyas claves captarían su atención, se componen sus engramas en el estado recurrente y se relee el prompt con esas claves y valores fusionados en la atención. No se recupera texto ni se añade nada al prompt. El autor advierte que una pregunta que no solicita nada del almacén recupera poco o nada, pero un evento almacenado que solo se parezca a ella puede pasar la votación.

Sobre el almacén opera un proceso de "sueño" cuando el servidor lleva 10 minutos sin peticiones de usuario, usando el propio modelo servido a través de su API: reproducción de eventos, fusión de duplicados, corrección de hechos antiguos (retirada de eventos previos que solo se recuperan junto al nuevo), generación de "sueños" que proponen puentes entre notas de conversaciones distintas, creación de puentes cuando el modelo identifica un nombre presente en ambas notas, y reducción progresiva (factor 0,9 por sueño) de los puentes no usados. Los sueños y las decisiones no se escriben en la memoria y no se borra ningún evento. Los argumentos de servicio propuestos (65.536 tokens de contexto, dos peticiones simultáneas) están ajustados a una GPU de 96 GB a partir de la memoria usada por el modelo de 27B y, según el autor, no se han ejecutado.

## Capacidades

- Generación de texto y razonamiento con modos explícitos de "thinking": el autor declara 27 modos de razonamiento, 27 modos instruct y 9 modos de razonamiento "Xhigh".
- "Constructos" de comportamiento predefinidos: 15 AI Constructs y 5 Super AI Constructs, entre ellos Brainstorm AI Construct, Brainstorm Business AI Construct, Universal Teacher AI Construct, Agent AI Construct y Coder AI Construct.
- Generación de código, con etiquetas específicas de coder y Turbo-Brilliance.
- Escritura creativa: ficción, relato, poesía y roleplaying en "todos los géneros" según las etiquetas del autor.
- Memoria episódica persistente entre peticiones y entre reinicios del servidor (el almacén está en disco), con recuperación por atención y no por texto.
- Capacidad multimodal image-text-to-text declarada en el pipeline, sin detalle de resolución, número de imágenes ni tareas visuales soportadas.
- Multilingüismo en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Soporte de decodificación especulativa mediante la cabeza MTP del checkpoint fuente, junto con CUDA graph y caché de prefijos en el servidor SGLang modificado.
- Tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales con memoria entre sesiones: el almacén en disco permite que un dato mencionado en una conversación se recupere en otra conversación posterior y separada, sin reinyectar el historial en el prompt. Es el caso de uso central de esta conversión y el que justifica su existencia frente al modelo base.
- Atención al cliente multi-turno: con 65,3k tokens de contexto propuestos y recuperación de eventos pasados, un agente puede mantener el hilo de incidencias abiertas en días distintos y corregir datos obsoletos mediante el mecanismo de retirada de eventos del ciclo de sueño.
- Escritura creativa y roleplaying de larga duración: los "puentes" entre notas de distintas conversaciones permiten mantener la coherencia de personajes y escenarios a lo largo de sesiones, y los modos de escritura creativa del autor cubren ficción y relato.
- Generación de código en un asistente de desarrollo: las etiquetas de coder y los modos instruct permiten usarlo como asistente de programación, aunque la ausencia de datos de benchmarks impide cuantificar su calidad en HumanEval o SWE-bench.
- Enseñanza y tutoría: el Universal Teacher AI Construct está pensado para explicaciones y material didáctico; el contexto largo permite arrastrar el temario de una asignatura entre sesiones.
- Investigación sobre memoria en LLM: al ser una conversión de pesos sin entrenamiento, sirve como banco de pruebas reproducible para estudiar recuperación por atención, consolidación de recuerdos y olvido selectivo sin confundir el efecto con cambios en los pesos.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite, en principio, extraer y razonar sobre contenido visual, aunque el autor no documenta el rendimiento en tareas de OCR o VQA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona "resultados medidos y limitaciones conocidas" en la parte no incluida del documento, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 80 GB solo para pesos (39,96 mil millones de parámetros a 2 bytes), más KV cache y estados recurrentes; el repo ocupa 79,9 GB.
- Los argumentos de servicio del autor están ajustados a una GPU de 96 GB (por ejemplo, A100 80GB no bastaría con margen; H100 80GB queda justo; H100/H200 de 96 GB o A100 de 80 GB con cuantización no documentada).
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bfloat16; no se publican pesos GGUF ni cuantizaciones que permitan estimar una versión viable en 24 GB.
- Despliegue: la memoria episódica solo funciona con la imagen Docker `lovewin10/sglang-v15:nightly-dev-cu13-20260924-ffac53d7-v15` (SGLang modificado). Con transformers estándar y `custom_code` se cargaría la clase, pero el autor no documenta que la memoria opere fuera de ese servidor.
- Configuración propuesta por el autor: 65.536 tokens de contexto, dos peticiones concurrentes, CUDA graph, caché de prefijos y decodificación especulativa activados.
- Latencia y throughput: no disponibles. El autor indica que la configuración de servicio no se ha ejecutado, por lo que no hay cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria entre peticiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v15 | 39,96 B | 65.536 (propuesto, no ejecutado) | Sí, en disco, vía SGLang modificado | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2 (base) | 39,96 B | no disponible | No | apache-2.0 (según este repo) | Hugging Face |
| LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v14 | 39,96 B | no disponible | Sí, con modelo del mundo entrenado | apache-2.0 (según este repo) | Hugging Face |
| Conversión Qwen3.8-27B (referencia arquitectónica citada) | no disponible | no disponible | No | no disponible | no disponible |

La comparación se limita a la propia familia del autor porque la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de otros desarrolladores. No hay base para comparar rendimiento con Qwen3, Llama u otros modelos de tamaño similar.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored" y "abliterated": se ha eliminado total o parcialmente el rechazo ante contenidos dañinos, lo que lo hace inadecuado para aplicaciones de cara al público sin filtros externos y plantea riesgos de cumplimiento normativo.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados y el autor no documenta evaluaciones de fidelidad factual.
- La recuperación de memoria puede fallar por diseño: una pregunta que no solicita nada del almacén recupera poco o nada, pero un evento almacenado que solo se parezca a ella puede pasar la votación, introduciendo contexto irrelevante en la respuesta.
- La memoria solo se ha validado, según el autor, con la imagen Docker modificada de SGLang; no hay garantía de funcionamiento con transformers, vLLM, TGI, llama.cpp u Ollama.
- La configuración de servicio (65.536 tokens, dos peticiones) no se ha ejecutado: el rendimiento real y el consumo de memoria están sin verificar.
- El proceso de sueño consume el propio modelo servido cuando el servidor está inactivo, lo que puede competir con cargas de trabajo y generar coste en despliegues con facturación por uso.
- Los "constructos" y modos (27 reasoning, 27 instruct, 9 Xhigh, 15 AI Constructs) son etiquetas del autor sin documentación de comportamiento ni evaluación independiente.
- El pipeline declarado es image-text-to-text, pero no se detalla el codificador visual ni se aportan métricas multimodales; no debe asumirse un rendimiento visual equiparable al de modelos multimodales documentados.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, sin validación por parte de la comunidad.
- La licencia apache-2.0 se declara en este repo, pero conviene verificar las condiciones del checkpoint base y de los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets antes de un uso comercial.
- El contexto de 65.536 tokens es una propuesta de configuración, no un límite verificado del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v15
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2
- Versión anterior V14: https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v14
- Imagen Docker de SGLang modificada: https://hub.docker.com/r/lovewin10/sglang-v15
- Dataset Polar-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
