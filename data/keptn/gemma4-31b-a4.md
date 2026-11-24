# keptn/gemma4-31b-a4

## Resumen

keptn/gemma4-31b-a4 es una cuantizacion de 4 bits del modelo multimodal google/gemma-4-31B-it, empaquetada en un unico fichero de 19,95 GiB en formato propietario `.rad` para el motor de inferencia radiance sobre GPUs AMD RDNA4 (Radeon AI PRO R9700). El modelo lee texto, imagenes y video, mantiene una ventana de contexto de 262.144 tokens e incluye la cabeza asistente de Google para decodificacion especulativa con 3 tokens de borrador.

La relevancia de esta ficha es doble: por un lado, demuestra que un modelo de 31.000 millones de parametros puede servirse en una sola GPU de consumo profesional de 32 GB con cuantizacion w4a8 (pesos int4 con punto cero y escalas f16 cada 128 pesos via GPTQ, activaciones int8 con escala por token y 128 valores); por otro lado, cuantifica con rigor la perdida de calidad frente al original bf16 mediante KL divergence sobre MT-Bench (KL media 0,0251, percentil 99 de 0,331, 96,1% de coincidencia en el token top y ratio de perplejidad de 0,993).

El modelo base es Gemma 4 31B-it de Google, con licencia Apache 2.0, y esta pensado para despliegues en produccion sobre hardware AMD con ROCm, un nicho historicamente peor cubierto que el ecosistema CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con torre de vision y cabeza asistente para decodificacion especulativa |
| Parametros totales | 31.000 millones (31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos int4 con punto cero y una escala f16 cada 128 pesos (GPTQ, todas las capas lineales del tronco); activaciones int8 con escala por token y 128 valores; copia f16 de las capas int4 en decode; lm_head int8 con escala bf16 cada 128 pesos; lm_head de la cabeza asistente tambien int8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero unico de 19,95 GiB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-4-31B-it: un transformer multimodal que procesa texto, imagenes y video, con una torre de vision separada que puede ubicarse en RAM (`vision-tower-placement: ram`) para liberar VRAM. Incluye ademas la cabeza asistente de Google (google/gemma-4-31B-it-assistant), un modelo de borrador en bf16 que genera 3 tokens especulativos por paso de decode para acelerar la inferencia.

La cuantizacion es obra de keptn y se apoya en el motor radiance y su libreria libquant: los pesos se cuantizan a int4 con punto cero y una escala f16 por cada 128 pesos mediante GPTQ, calibrado sobre el dataset keptn/quant-calibration. Las activaciones se cuantizan a int8 con una escala por token y por cada 128 valores. Durante el decode se mantiene una copia en f16 de las capas int4 para reducir el coste de descompresion. La version 2.0 (4 de noviembre de 2026) introduce el punto cero y GPTQ, lo que reduce la KL media a aproximadamente la mitad respecto a la version 1.0 (w4a8 sin punto cero) a cambio de un 1,6% mas de latencia en decode con una tarjeta y un 7,5% con dos. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de texto, imagen y video en el mismo pipeline (`image-text-to-text`).
- Modo thinking activable por peticion mediante `"chat_template_kwargs": {"enable_thinking": true}`.
- Comprension de documentos e imagenes: evaluado sobre DocVQA y AI2D.
- Comprension de video: evaluado sobre MVBench con clips de 4 frames.
- Decodificacion especulativa integrada con la cabeza asistente de Google (3 tokens de borrador), que acelera el decode sin cambiar la distribucion objetivo.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: la model card menciona un encoder de audio en la seccion de evaluacion, pero no detalla su soporte como entrada en la tabla de inputs (que lista solo texto, imagen y video).

## Casos de uso

- Analisis de documentos escaneados y formularios: el modelo acepta imagenes y mantiene 262.144 tokens de contexto, por lo que puede procesar lotes de paginas de DocVQA o facturas en una sola sesion y responder preguntas sobre su contenido.
- Inspeccion de video para monitorizacion: con soporte de video y contexto largo, puede resumir clips de vigilancia o extraer eventos de grabaciones de varias camaras en una misma ventana.
- Asistencia tecnica sobre manuales extensos: la ventana de 262.144 tokens permite cargar manuales completos y mantener conversaciones multi-turno con el usuario sin truncar el contexto.
- Despliegue en estaciones de trabajo AMD: al caber en una Radeon AI PRO R9700 de 32 GB y escalar a 2 o 4 tarjetas con tensor parallelism (`tp: 2`, `p2p: on`), es adecuado para equipos que ya operan hardware RDNA4 y quieren evitar CUDA.
- Generacion de codigo en pipelines internos: aunque no se documenta tool calling, el modelo base es un instruct de proposito general; la cuantizacion w4a8 mantiene el 96,1% de coincidencia en el token top frente a bf16, lo que permite usarlo en autocompletado y revision de codigo donde la latencia importa.
- Servicio de inferencia multi-usuario: con `max-num-seqs: 8` y 4 tarjetas alcanza 516 tokens/s agregados en 4 streams y un pool KV de 2.097.248 tokens, suficiente para atender varias conversaciones concurrentes con contexto largo.
- Procesamiento por lotes de imagenes medicas o industriales: la torre de vision puede residir en RAM, dejando la VRAM libre para el tronco y el KV cache, lo que abarata el coste por imagen en lotes grandes.

## Benchmarks y rendimiento

Calidad frente al original bf16 en las 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens de respuesta, thinking desactivado):

| Modelo | KL media | KL percentil 99 | Token top coincidente | Ratio de perplejidad |
|---|---|---|---|---|
| keptn/gemma4-31b-a4 (2.0) | 0,0251 | 0,331 | 96,1% | x0,993 |
| keptn/gemma4-31b-a4 v1.0 (w4a8) | 0,0517 | 0,721 | 94,6% | x1,056 |
| keptn/gemma4-31b-i8g | 0,00236 | 0,0311 | 98,8% | x1,004 |
| keptn/gemma4-31b-w5 | 0,00803 | 0,107 | 97,8% | x1,010 |

Rendimiento en Radeon AI PRO R9700 a 215 W, radiance 1.16.0, KV en fp8, 3 tokens de borrador, thinking desactivado, BetterBench 0.6.1, temperatura 0,7 (tokens por segundo, mediana):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | 78,4 | 132,3 | 202,0 |
| Prefill a 24k tokens | 1.463 | 2.657 | 4.318 |
| 4 streams, total | 130 | 349 | 516 |

Fidelidad multimodal frente al original bf16 (greedy, thinking desactivado, 2 tarjetas):

| Entrada | Casos | Misma respuesta | KL media | Token top coincidente |
|---|---|---|---|---|
| Imagenes (DocVQA y AI2D) | 20 | 16/20 | 0,268 | 66/70 |
| Video (MVBench, 5 clips de 4 frames) | 5 | 4/5 | 0,0556 | 31/32 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el fichero pesa 19,95 GiB; con KV cache fp8 y contexto de 65.536 tokens cabe en una sola GPU de 32 GB. El pool KV a 262.144 tokens alcanza 298.848 tokens con 2 secuencias en una tarjeta y 2.097.248 tokens con 8 secuencias en 4 tarjetas.
- GPU recomendadas: Radeon AI PRO R9700 (32 GB, RDNA4) probada con 1, 2 y 4 tarjetas. No se documenta soporte para otras GPU.
- Configuracion de 3 tarjetas no valida: los 32 cabezas de atencion no se dividen entre tres.
- Cabe en GPU de consumo profesional de 32 GB; no se confirma su funcionamiento en GPUs de consumo de 24 GB o menos.
- Despliegue: exclusivamente mediante el motor radiance (imagen Docker `stilldeadcode/radiance:2.0.0` o superior), con configuracion YAML. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 78,4 tokens/s en decode de un stream con una tarjeta, 202,0 con cuatro; prefill de 1.463 a 4.318 tokens/s a 24k tokens segun numero de tarjetas.
- La torre de vision puede colocarse en RAM (`vision-tower-placement: ram`) para reducir el uso de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Calidad (KL media MT-Bench) | Licencia | Hardware |
|---|---|---|---|---|---|---|
| keptn/gemma4-31b-a4 | 31B | 262.144 | `.rad` int4/int8 | 0,0251 | Apache 2.0 | AMD RDNA4, radiance |
| keptn/gemma4-31b-i8g | 31B | No disponible | int8 | 0,00236 | Apache 2.0 | AMD RDNA4, radiance |
| keptn/gemma4-31b-w5 | 31B | No disponible | 5 bits | 0,00803 | Apache 2.0 | AMD RDNA4, radiance |
| google/gemma-4-31B-it (bf16) | 31B | 262.144 | safetensors bf16 | Referencia | Apache 2.0 | Multiples backends |

La comparativa con alternativas de otros fabricantes (Qwen, Llama, Mistral) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor radiance: el formato `.rad` no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad del despliegue.
- Solo soportado en GPUs AMD RDNA4; no hay evidencia de funcionamiento en CUDA ni en generaciones anteriores de AMD.
- Las configuraciones de 3 tarjetas fallan por incompatibilidad en el reparto de las 32 cabezas de atencion.
- Perdida de calidad medible frente a bf16: KL media de 0,0251 y 3,9% de discrepancia en el token top en MT-Bench; en imagenes la KL media sube a 0,268 y 4 de 20 respuestas difieren del original.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion puede amplificarlo en tareas de razonamiento largo no cubiertas por la evaluacion.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del ingles sin evaluacion previa.
- El modo thinking debe activarse por peticion; los benchmarks publicados se hicieron con thinking desactivado, por lo que el rendimiento en modo razonamiento no esta caracterizado.
- La licencia Apache 2.0 del artefacto de cuantizacion no exime de verificar los terminos del modelo base de Google para uso comercial.
- El soporte de tool calling, agentes y audio no esta documentado, lo que desaconseja asumirlo en produccion sin pruebas.
- La version 1.0 del repositorio (antiguo `keptn/gemma4-31b-w4a8`) tiene peor calidad (KL media 0,0517) y requiere radiance 1.5.0 o superior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-a4
- Version 1.0 (w4a8): https://huggingface.co/keptn/gemma4-31b-a4/tree/v1.0
- Cuantizacion int8: https://huggingface.co/keptn/gemma4-31b-i8g
- Cuantizacion de 5 bits: https://huggingface.co/keptn/gemma4-31b-w5
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset de calibracion: https://huggingface.co/datasets/keptn/quant-calibration
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Guia Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- PR de soporte de Gemma 4 en radiance: https://codeberg.org/StillDeadcode/radiance/pulls/75
