# keptn/gemma4-31b-heretic-ara-i8g

## Resumen

keptn/gemma4-31b-heretic-ara-i8g es una cuantizacion int8 (W8A8) del modelo Gemma 4 31B-it, publicado por el usuario keptn en formato propietario `.rad` para el motor de inferencia radiance, orientado a GPUs AMD RDNA4. El modelo parte de trohrbaugh/gemma-4-31b-it-heretic-ara, una version "abliterated" (sin rechazos) del Gemma 4 31B-it-assistant de Google, obtenida mediante la herramienta Heretic de p-e-w. El resultado es un modelo multimodal (texto, imagen y video) de 31.000 millones de parametros con una ventana de contexto de 262.144 tokens y decodificacion especulativa mediante la cabeza asistente de Google.

La relevancia de esta ficha es doble. Por un lado, demuestra un flujo de cuantizacion int8 para Gemma 4 en hardware AMD, con metricas de fidelidad respecto al original bf16 (KL medio de 0,00249 en MT-Bench). Por otro, expone un caso de "decensoring": el modelo responde a peticiones que el original rechaza, con una tasa de rechazo del 0,6 % en OR-Bench-Hard-1K frente al 33,5 % del modelo de referencia. Es, por tanto, una pieza tecnica interesante para investigacion sobre alineamiento y seguridad, y no un modelo para despliegues de produccion convencionales.

El modelo no cabe en una sola GPU: los pesos ocupan 33,4 GiB y requiere dos o cuatro tarjetas de 32 GB. Esta empaquetado como un unico fichero de 33,37 GiB y depende de radiance 2.0.0 o superior, con soporte de vision, video y KV cache en fp8 o int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con cabeza asistente para decodificacion especulativa (MTP) y torre de vision |
| Parametros totales | 31.000 millones (31B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | int8 W8A8 (pesos int8 con escala bf16 por cada 128 pesos; activaciones int8 con escala por token y 128 valores; lm_head int8); KV cache en fp8 o int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario de radiance); tamano del fichero 33,37 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 31B-it de Google, un transformer denso de 31.000 millones de parametros con capacidades multimodales (texto, imagen y video) y una cabeza asistente ("assistant head") que actua como modelo borrador para decodificacion especulativa con 3 tokens draft. La version publicada aqui no reentrena el modelo: aplica una cuantizacion int8 simetrica por grupos de 128 pesos en todas las capas lineales del tronco, con redondeo al mas cercano, y mantiene la cabeza asistente y su lm_head tambien en int8. La torre de vision puede ubicarse en RAM (`vision-tower-placement: ram`).

El "decensoring" se realizo con Heretic (p-e-w), una herramienta de abliteracion que elimina la direccion de rechazo en el espacio de activaciones. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO adicionales sobre el modelo base de Google. La innovacion tecnica destacable es el formato `.rad` con soporte de decodificacion especulativa nativa y cuantizacion W8A8 optimizada para RDNA4, con un impacto de calidad medido (KL medio 0,00249, percentil 99 de 0,0324, 98,7 % de coincidencia en el token top y ratio de perplejidad de x1,006 frente al bf16 original).

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activable por peticion (`chat_template_kwargs: {"enable_thinking": true}`).
- Comprension de imagenes (evaluado en DocVQA y AI2D) y de video (evaluado en MVBench con 5 clips de 4 frames).
- Entrada multimodal de texto, imagen y video en un mismo pipeline (`image-text-to-text`).
- Decodificacion especulativa con la cabeza asistente de Google (3 tokens draft), lo que acelera la generacion.
- Ventana de contexto muy larga (262.144 tokens) con KV cache compartida entre secuencias.
- Respuestas sin rechazos: tasa de rechazo del 0,6 % en OR-Bench-Hard-1K y 0 % en XSTest (250 prompts seguros).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un Gemma 4 con la direccion de rechazo ablacionada, comparando tasas de rechazo (0,6 % frente a 33,5 % en OR-Bench-Hard-1K) con el original para analizar que se pierde y que se gana al eliminar los rechazos.
- Evaluacion de cuantizacion int8 en AMD: sirve como banco de pruebas para medir la fidelidad de W8A8 frente a bf16 con `--kld-ref` de radiance, con metricas reproducibles (KL 0,00249, perplejidad x1,006) utiles para validar pipelines de compresion en RDNA4.
- Procesamiento de documentos largos con imagen: con 262.144 tokens de contexto y entrada de imagen, puede ingerir expedientes escaneados y texto extenso en una sola pasada, aunque la calidad en vision es menor (KL 0,471 en imagenes frente a 0,00249 en texto).
- Analisis de video para prototipos: la entrada de video (evaluada en MVBench) permite resumir clips cortos o extraer descripciones, adecuado para pruebas de concepto en investigación, no para producción critica.
- Despliegue en infraestructura AMD de laboratorio: con dos Radeon AI PRO R9700 a 215 W se obtienen 89 tokens/s en decodificacion de un stream y 2.528 tokens/s de prefill a 24k, suficiente para experimentacion interactiva en un nodo de dos tarjetas.
- Generacion de contenido sin restricciones en entornos controlados: para estudios de sesgo, red teaming o analisis de contenido sensible donde se necesita un modelo que no rechace sistematicamente, asumiendo la responsabilidad legal y etica del uso.
- Servicio multi-stream de baja concurrencia: con 4 tarjetas y 4 streams se alcanzan 406 tokens/s agregados, util para un pequeño grupo de investigadores compartiendo un nodo.

## Benchmarks y rendimiento

Calidad frente al bf16 original (MT-Bench, 80 preguntas, ambos turnos, 42.283 tokens de respuesta, thinking off):

| Metrica | Este fichero (i8) | keptn/gemma4-31b-heretic-ara-w4a8 |
|---|---|---|
| KL medio | 0,00249 | 0,0529 |
| KL percentil 99 | 0,0324 | 0,732 |
| Token top coincidente | 98,7 % | 94,4 % |
| Ratio de perplejidad | x1,006 | x1,048 |

Rendimiento en Radeon AI PRO R9700 a 215 W (radiance main 248ecf5, fp8 KV, 3 tokens draft, thinking off, BetterBench 0.6.1, temperatura 0,7, mediana de tokens/s):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | no cabe | 89,0 | 143,0 |
| Prefill a 24k tokens | no cabe | 2.528 | 3.464 |
| 4 streams, total | no cabe | 262 | 406 |

Fidelidad multimodal (greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Misma respuesta | KL medio | Token top coincidente |
|---|---|---|---|---|
| Imagenes (DocVQA y AI2D) | 20 | 16/20 | 0,471 | 66/70 |
| Video (MVBench, 5 clips, 4 frames) | 5 | 4/5 | 0,0272 | 31/32 |

Rechazos (greedy, thinking off, sin system prompt):

| Benchmark | Este fichero | Build del original |
|---|---|---|
| XSTest, 250 prompts seguros, rechazos completos (string match) | 0 (0,0 %) | 3 (1,2 %) |
| XSTest, 250 prompts seguros, rechazos completos y parciales (juez LLM) | 0 (0,0 %) | 6 (2,4 %) |
| OR-Bench-Hard-1K, 1.319 prompts, tasa de rechazo (juez LLM) | 8 (0,6 %) | 442 (33,5 %) |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM: los pesos ocupan 33,4 GiB; no cabe en una sola tarjeta de 32 GB. Requiere 2 o 4 GPUs de 32 GB.
- GPUs probadas: Radeon AI PRO R9700 (RDNA4) en configuraciones de 2 y 4 tarjetas a 215 W.
- Configuracion de 3 tarjetas no funciona: los 32 cabezas de atencion no se dividen entre tres.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, etc.) por tamano de pesos.
- Despliegue: exclusivamente mediante el motor radiance 2.0.0 o superior (imagen Docker `stilldeadcode/radiance:2.0.0`); radiance 1.16.0 a 1.17.0 tambien lee el fichero con flags de linea de comandos. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- KV pool: a 262.144 tokens con fp8 KV, 2 tarjetas soportan 524.304 tokens con 2 secuencias, 765.328 con 4 y 721.968 con 8; 4 tarjetas soportan 524.352, 1.048.624 y 2.097.248 respectivamente.
- Throughput: 89 tokens/s de decode en un stream con 2 tarjetas y 143 con 4; 2.528 y 3.464 tokens/s de prefill a 24k; 262 y 406 tokens/s agregados con 4 streams.
- Parametros de sampling recomendados por Google: temperatura 1,0, top_p 0,95, top_k 64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| keptn/gemma4-31b-heretic-ara-i8g | 31B | 262.144 | `.rad` int8 W8A8 | Apache 2.0 | Solo radiance, AMD RDNA4, sin rechazos |
| keptn/gemma4-31b-heretic-ara-w4a8 | 31B | 262.144 | `.rad` W4A8 | Apache 2.0 | Misma base, menor precision (KL 0,0529) |
| trohrbaugh/gemma4-31b-it-heretic-ara | 31B | 262.144 | safetensors (bf16) | Apache 2.0 | Modelo base sin cuantizar, sin rechazos |
| google/gemma-4-31B-it-assistant | 31B | 262.144 | safetensors | Apache 2.0 | Original de Google con rechazos (33,5 % en OR-Bench-Hard-1K) |

## Limitaciones y advertencias

- No cabe en una sola GPU: requiere 2 o 4 tarjetas de 32 GB; la configuracion de 3 tarjetas no es viable.
- Dependencia total de radiance: el formato `.rad` no es portable a otros motores de inferencia; no hay versiones GGUF, safetensors ni ONNX de esta cuantizacion.
- Modelo abliterated: responde a peticiones que el original rechaza (0,6 % de rechazo en OR-Bench-Hard-1K). El autor advierte explicitamente que la responsabilidad del uso recae en el usuario.
- Calidad en vision degradada: KL medio de 0,471 en imagenes y 16/20 respuestas identicas al bf16, muy inferior a la fidelidad en texto (KL 0,00249).
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de sesgos en la informacion disponible.
- Idiomas soportados no documentados; no se puede confirmar cobertura multilingue.
- Sin datos de tool calling ni de razonamiento agentico; no asumir su disponibilidad en produccion.
- Licencia Apache 2.0 heredada del base model, pero el uso comercial de un modelo sin rechazos puede entrar en conflicto con politicas de plataforma y con la normativa aplicable en el Espacio Economico Europeo.
- Requiere radiance 2.0.0 o superior; versiones 1.16.0 a 1.17.0 funcionan solo con flags de linea de comandos, lo que complica la reproducibilidad.
- Sin resultados publicados de MMLU, HumanEval ni GSM8K: no hay evidencia de rendimiento en tareas de codigo o matematicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-heretic-ara-i8g
- Modelo base (abliterated): https://huggingface.co/trohrbaugh/gemma4-31b-it-heretic-ara
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it-assistant
- Version W4A8 del mismo autor: https://huggingface.co/keptn/gemma4-31b-heretic-ara-w4a8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Guia Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- PR #75 de soporte Gemma 4 en radiance: https://codeberg.org/StillDeadcode/radiance/pulls/75
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
