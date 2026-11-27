# keptn/gemma4-31b-w5

## Resumen

keptn/gemma4-31b-w5 es una cuantizacion int5 (GPTQ) del modelo multimodal google/gemma-4-31B-it, empaquetada en un unico fichero de 23,36 GiB para el motor de inferencia radiance sobre GPUs AMD RDNA4. No es un modelo nuevo: es una distribucion de pesos optimizada para ejecutar Gemma 4 31B en hardware AMD con memoria limitada, manteniendo una fidelidad cercana al original en bf16. El autor, keptn, publica una familia de cuantizaciones para radiance (int8, int5, w4a8) dirigidas al mismo motor.

La relevancia de esta ficha es doble. Por un lado, documenta una ruta practica para servir un modelo de 31B con vision y contexto de 262.144 tokens en una o varias Radeon AI PRO R9700 de 32 GB. Por otro, el repositorio esta archivado desde el 2026-11-26 y el propio autor recomienda migrar a keptn/gemma4-31b-exl3, con ficheros mas pequenos para la misma calidad y compatibles con radiance 2.3.0 o superior. Cualquier despliegue nuevo deberia partir de esa alternativa.

La cuantizacion afecta solo a las capas lineales del tronco (int5 con punto cero y una escala f16 por cada 128 pesos); lm_head y la cabeza del asistente van en int8. El modelo conserva las capacidades multimodales del original (texto, imagen y video) y la decodificacion especulativa mediante la cabeza asistente de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tronco de Gemma 4 31B con torre de vision), pesos cuantizados int5 GPTQ |
| Parametros totales | 31B (modelo base google/gemma-4-31B-it) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | int5 GPTQ en capas lineales del tronco; activaciones f16 hasta 64 filas y int8 por encima; lm_head int8; cabeza asistente int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario de radiance), 23,36 GiB; incluye `config.json` |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-31B-it, un transformer multimodal de 31.000 millones de parametros con torre de vision que acepta texto, imagen y video. Esta publicacion no entrena ni ajusta el modelo: aplica cuantizacion GPTQ post-entrenamiento sobre las capas lineales del tronco, con pesos int5, un punto cero y una escala f16 por cada 128 pesos. Las activaciones se mantienen en f16 hasta 64 filas y pasan a int8 (una escala por token y 128 valores) en lotes mayores. El lm_head se cuantiza a int8 con escala bf16 por cada 128 pesos, y la cabeza del asistente tambien lleva su lm_head en int8.

La innovacion practica esta en el motor de destino: radiance implementa kernels w5a16 y w5a8i8 propios (via su libreria libquant) para RDNA4, ademas de decodificacion especulativa con la cabeza asistente de Gemma 4 en bf16 y 3 tokens de borrador. El soporte de Gemma 4 en radiance parte del trabajo inicial de sfjes en el PR #75 del proyecto. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre las fases de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con modo thinking activable por peticion mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada de imagen (image-text-to-text) y de video, con torre de vision integrada.
- Decodificacion especulativa con la cabeza asistente de Google (3 tokens de borrador), que acelera la generacion.
- Contexto largo de hasta 262.144 tokens, configurable en el motor.
- Servicio multi-stream: hasta 8 secuencias concurrentes segun configuracion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos con imagen: el modelo procesa DocVQA y AI2D con una fidelidad respecto al bf16 de 16/20 respuestas identicas y un KL medio de 0,471, suficiente para extraccion de datos de facturas, formularios o graficos en entornos AMD.
- Comprension de video: con 4/5 respuestas identicas al original en MVBench (5 clips, 4 fotogramas cada uno), es viable para resumen de clips cortos, moderacion de contenido audiovisual o indexacion de metadatos.
- Asistente conversacional de contexto largo: con 262.144 tokens y hasta 8 secuencias en 4 tarjetas (2.097.248 tokens de pool KV compartido), permite atender sesiones de atencion al cliente con historiales extensos y documentos adjuntos.
- Despliegue en infraestructura AMD existente: al ejecutarse en radiance sobre RDNA4, encaja en clusters con Radeon AI PRO R9700 donde no se quiere introducir GPUs NVIDIA; el escalado de 1 a 4 tarjetas multiplica el decode de 70,9 a 201,3 tokens/s.
- Procesamiento batch de imagenes y texto: con prefill de 1.421 tokens/s en una tarjeta y 4.214 en cuatro, es adecuado para pipelines de clasificacion o descripcion de imagenes a gran escala.
- Generacion asistida con decodificacion especulativa: los 3 tokens de borrador de la cabeza asistente reducen la latencia en tareas de redaccion interactiva, con un decode de 124,8 tokens/s en dos tarjetas.
- Prototipado e investigacion multimodal: el formato de 23,36 GiB cabe en una sola GPU de 32 GB, lo que simplifica la experimentacion con modelos de 31B multimodales sin infraestructura distribuida.

## Benchmarks y rendimiento

Calidad frente al original bf16 en las 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens de respuesta, thinking desactivado):

| Metrica | Este fichero (w5) | keptn/gemma4-31b-i8g | keptn/gemma4-31b-a4 v1.0 (w4a8) |
|---|---|---|---|
| KL medio | 0,00803 | 0,00236 | 0,0517 |
| KL percentil 99 | 0,107 | 0,0311 | 0,721 |
| Token top identico | 97,8% | 98,8% | 94,6% |
| Ratio de perplejidad | x1,010 | x1,004 | x1,056 |

Rendimiento en Radeon AI PRO R9700 a 215 W (radiance 1.13.0, KV fp8, 3 tokens de borrador, thinking off; BetterBench 0.6.1, temperatura 0,7, mediana de tokens/s):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | 70,9 | 124,8 | 201,3 |
| Prefill a 24k tokens | 1.421 | 2.559 | 4.214 |
| 4 streams, total | 198 | 333 | 525 |

Fidelidad multimodal frente al bf16 original (greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Respuesta identica | KL medio | Token top identico |
|---|---|---|---|---|
| Imagenes (DocVQA y AI2D) | 20 | 16/20 | 0,471 | 66/70 |
| Video (MVBench, 5 clips) | 5 | 4/5 | 0,0272 | 31/32 |

## Requisitos de hardware

- VRAM: el fichero ocupa 23,36 GiB; se necesita al menos una GPU de 32 GB para cargarlo con margen para KV cache.
- GPUs probadas: Radeon AI PRO R9700 de 32 GB, en configuraciones de 1, 2 y 4 tarjetas. No hay datos de otras GPUs en la informacion disponible.
- Consumer GPU: no disponible; el modelo esta orientado a RDNA4 profesional y no se documenta su ejecucion en tarjetas de consumo.
- Topologia: 3 tarjetas no funcionan porque las 32 cabezas de atencion no se dividen entre tres.
- Despliegue: exclusivamente mediante el motor radiance (imagen Docker `stilldeadcode/radiance:2.0.0` o superior; el fichero tambien se lee en 1.16.0-1.17.0 con flags de linea de comandos). No hay soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Configuracion recomendada: `tp: 2`, `p2p: on`, `kv-cache-dtype: i8`, `max-model-len: 65536`, `max-num-seqs: 8`, `num-speculative-tokens: 3`, `vision-tower-placement: ram`.
- Contexto completo: `max-model-len: 262144` con `max-num-seqs: 2`; el pool KV compartido alcanza 524.352 tokens en 2 tarjetas y 2.097.248 en 4 con 8 secuencias.
- Throughput: 70,9-201,3 tokens/s en decode segun numero de tarjetas; 1.421-4.214 tokens/s en prefill a 24k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL medio MT-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keptn/gemma4-31b-w5 | 31B | 262.144 | 0,00803 | Apache 2.0 | Archivado; motor radiance |
| keptn/gemma4-31b-i8g | 31B | no disponible | 0,00236 | Apache 2.0 | Activo; motor radiance |
| keptn/gemma4-31b-a4 (w4a8) | 31B | no disponible | 0,0517 | Apache 2.0 | Activo; motor radiance |
| keptn/gemma4-31b-exl3 | 31B | no disponible | no disponible | Apache 2.0 | Recomendado por el autor; radiance 2.3.0+ |

## Limitaciones y advertencias

- Repositorio archivado desde el 2026-11-26: no recibira actualizaciones. El autor recomienda keptn/gemma4-31b-exl3, con ficheros mas pequenos para la misma calidad.
- Dependencia total del motor radiance: el formato `.rad` no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y crea dependencia de un unico proyecto.
- Restriccion de hardware: solo RDNA4 documentado; sin soporte conocido en GPUs NVIDIA o en tarjetas de consumo.
- Topologia limitada: no se puede repartir en 3 tarjetas por la division de las 32 cabezas de atencion.
- Perdida de calidad medible: 97,8% de tokens top identicos y perplejidad x1,010 frente al bf16; superior a la variante int8 (98,8% y x1,004).
- Vision menos fiel que el texto: KL medio de 0,471 en imagenes frente a 0,00803 en texto, con 4 de 20 respuestas distintas al original.
- Sesgos, alucinacion y cobertura idiomatica: no disponible en la informacion proporcionada; deben evaluarse sobre el modelo base google/gemma-4-31B-it.
- Licencia Apache 2.0 heredada del modelo base, sin restricciones adicionales conocidas para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-w5
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Alternativa recomendada: https://huggingface.co/keptn/gemma4-31b-exl3
- Cuantizacion int8 comparable: https://huggingface.co/keptn/gemma4-31b-i8g
- Cuantizacion w4a8: https://huggingface.co/keptn/gemma4-31b-a4/tree/v1.0
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Guia Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- PR #75 (soporte inicial de Gemma 4 en radiance): https://codeberg.org/StillDeadcode/radiance/pulls/75
- Dataset MT-Bench human judgments: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
