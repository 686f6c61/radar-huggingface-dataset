# keptn/gemma4-31b-heretic-ara-a4

## Resumen

`keptn/gemma4-31b-heretic-ara-a4` es una cuantizacion en un unico fichero del modelo `trohrbaugh/gemma-4-31b-it-heretic-ara`, una variante de Gemma 4 31B-it de Google a la que se le han eliminado los rechazos mediante el metodo ARA (Arbitrary-Rank Ablation) de Heretic. El paquete lo publica el usuario keptn y esta empaquetado especificamente para el motor de inferencia radiance sobre GPUs AMD RDNA4, con pesos del tronco en int4 con punto cero (GPTQ) y activaciones en int8.

El modelo resuelve el problema de desplegar un modelo multimodal de 31B parametros con contexto de 262.144 tokens en hardware AMD de consumo profesional (Radeon AI PRO R9700 de 32 GB), algo que con pesos bf16 seria inviable en una sola tarjeta. El fichero `gemma4-31b-heretic-ara-a4.rad` ocupa 19,95 GiB e incluye la cabeza asistente de Gemma 4 para decodificacion especulativa con 3 tokens draft.

Es relevante ahora porque combina tres tendencias: cuantizacion agresiva W4A8 con GPTQ, soporte de vision y video, y un ecosistema de inferencia alternativo a CUDA (ROCm/RDNA4) con decodificacion especulativa. La licencia es Apache 2.0, aunque el modelo base es Gemma 4 de Google, lo que introduce matices legales que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tronco Gemma 4) con vision tower y cabeza asistente para decodificacion especulativa |
| Parametros totales | 31B (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | int4 con punto cero (GPTQ) en lineales del tronco; activaciones int8; lm_head int8; cabeza asistente bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.rad` (formato propietario de radiance), 19,95 GiB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `trohrbaugh/gemma-4-31b-it-heretic-ara`, que a su vez deriva de `google/gemma-4-31B-it-assistant`. La decensura se realizo con Heretic y su metodo ARA (Arbitrary-Rank Ablation), que elimina direcciones de rechazo del espacio de activaciones. Sobre ese checkpoint, keptn aplico GPTQ con un conjunto de calibracion propio (`keptn/quant-calibration`) para producir pesos int4 con punto cero, una escala f16 cada 128 pesos en todas las capas lineales del tronco. Las activaciones se cuantizan a int8 con una escala por token y 128 valores, y el `lm_head` usa int8 con escala bf16 cada 128 pesos.

La innovacion tecnica principal es el empaquetado con la cabeza asistente de Gemma 4 en bf16 para decodificacion especulativa con 3 tokens draft, integrada en radiance 2.0.0 o superior. El vision tower es byte-identico al de Google segun el autor. La version 2.0 (2026-11-16) sustituye a la 1.0 (w4a8 con SmoothQuant en q/k/v), reduciendo el KL medio a la mitad a costa de un 34 % mas de latencia de decode en cuatro tarjetas. No se documentan detalles sobre el dataset de preentrenamiento original de Gemma 4 ni sobre el proceso de RLHF/DPO, mas alla de que el checkpoint base es la variante `-it` (instruction-tuned).

## Capacidades

- Generacion de texto y razonamiento en modo chat con plantilla de Gemma 4.
- Modo thinking activable por peticion mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada multimodal: texto, imagen y video (pipeline `image-text-to-text`).
- Decodificacion especulativa con la cabeza asistente de Gemma 4 (3 tokens draft).
- Respuestas sin rechazos: el modelo contesta peticiones que el original rechazaria (segun el autor).
- Contexto largo de hasta 262.144 tokens (con `max-model-len: 262144`).
- Multi-turno con KV cache en int8.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones multi-turno sobre documentos extensos o transcripciones completas sin truncar, usando KV cache int8 para reducir memoria.
- Analisis de imagenes y video en local: al aceptar entradas de imagen y video, sirve para tareas de descripcion, extraccion de informacion o resumen de contenido visual en flujos donde no se quiere enviar datos a la nube.
- Despliegue en hardware AMD: pensado para Radeon AI PRO R9700 (RDNA4) con ROCm, permite montar inferencia en estaciones de trabajo AMD sin depender de CUDA, con configuracion de 1, 2 o 4 tarjetas.
- Servicio de inferencia con multiples streams: la configuracion documentada soporta `max-num-seqs: 8` y 4 streams concurrentes con hasta 477 tokens/s agregados en 4 tarjetas, adecuado para un pequeño equipo interno.
- Investigacion sobre alineacion y decensura: util para estudiar el efecto de ARA sobre el comportamiento de rechazo, comparando con el checkpoint bf16 heretic o con el Gemma 4 original.
- Generacion de contenido sin filtros editoriales: el modelo responde a peticiones que el original rechaza, lo que lo hace adecuado para entornos controlados de escritura creativa o investigacion, asumiendo la responsabilidad de uso.
- Prototipado rapido con decodificacion especulativa: la cabeza asistente incluida acelera el decode sin necesidad de un modelo draft externo, util para iterar en demos interactivas.

## Benchmarks y rendimiento

Calidad respecto al checkpoint heretic bf16 (no respecto al Gemma 4 original de Google), medida con `--kld-ref` sobre 42.283 tokens de respuesta a las 80 preguntas de MT-Bench (ambos turnos, thinking off):

| Metrica | Este fichero (v2.0) | v1.0 (w4a8) | keptn/gemma4-31b-heretic-ara-i8g |
|---|---|---|---|
| KL medio | 0,0248 | 0,0529 | 0,00249 |
| KL percentil 99 | 0,337 | 0,732 | 0,0324 |
| Top token coincidente | 95,9 % | 94,4 % | 98,7 % |
| Ratio de perplejidad | x0,985 | x1,048 | x1,006 |

Velocidad en Radeon AI PRO R9700 a 300 W, radiance 2.1.0, KV i8, 3 tokens draft, thinking off (BetterBench 0.6.1, temperatura 0,7, mediana de tokens por segundo):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | 82,5 | 128,8 | 183,2 |
| Prefill a 24k tokens | 1.705 | 2.770 | 4.328 |
| 4 streams, total | 138 | 356 | 477 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Tampoco se han medido rechazos con este fichero; la model card remite a los numeros XSTest y OR-Bench de la version 1.0.

## Requisitos de hardware

- VRAM: el fichero ocupa 19,95 GiB; con KV cache i8 y contexto de 65.536 tokens cabe en una tarjeta de 32 GB. El autor indica que la memoria no se midio con este fichero, sino que se asume igual a `keptn/gemma4-31b-a4` por formato, tamano y capas.
- GPU recomendadas: Radeon AI PRO R9700 (32 GB, RDNA4) probada en configuraciones de 1, 2 y 4 tarjetas. No se documenta soporte de GPUs NVIDIA ni de otras arquitecturas AMD.
- Configuracion de tensor parallel: `tp: 1`, `tp: 2` o `tp: 4`. Tres tarjetas no funcionan porque las 32 cabezas de atencion no se dividen entre tres.
- Contexto completo (262.144 tokens): requiere `max-model-len: 262144` y `max-num-seqs: 2`.
- Opciones de despliegue: exclusivamente radiance 2.0.0 o superior (imagen Docker `stilldeadcode/radiance:2.0.0`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato `.rad`.
- El vision tower puede colocarse en RAM (`vision-tower-placement: ram`) para liberar VRAM.
- Latencia y throughput: ver tabla de benchmarks (82,5 a 183,2 tokens/s en decode segun numero de tarjetas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| keptn/gemma4-31b-heretic-ara-a4 | 31B | 262.144 | `.rad`, int4 GPTQ + int8 act. | apache-2.0 | AMD RDNA4, radiance |
| keptn/gemma4-31b-heretic-ara-i8g | 31B | no disponible | `.rad`, int8 | apache-2.0 | AMD RDNA4, radiance |
| trohrbaugh/gemma-4-31b-it-heretic-ara | 31B | no disponible | bf16 (safetensors presumiblemente) | no disponible | GPUs con suficiente VRAM |
| google/gemma-4-31B-it-assistant | 31B | no disponible | bf16 | licencia Gemma (no Apache 2.0) | GPUs con suficiente VRAM |

Frente a la variante i8g del mismo autor, este fichero sacrifica precision (KL medio 0,0248 frente a 0,00249) a cambio de la mitad de tamano y menor coste de memoria. Frente al checkpoint heretic bf16, permite ejecutarlo en una sola tarjeta de 32 GB. No se dispone de datos para comparar con alternativas de otros ecosistemas (por ejemplo, cuantizaciones GGUF para llama.cpp) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensurado: responde a peticiones que el Gemma 4 original rechaza. El autor declara explicitamente que la responsabilidad de uso recae en el usuario.
- La licencia declarada es Apache 2.0, pero el modelo base es Gemma 4 de Google, cuya licencia original impone restricciones de uso (incluida una politica de uso aceptable). Conviene verificar la compatibilidad antes de uso comercial.
- La calidad se ha medido solo contra el checkpoint heretic bf16, no contra el Gemma 4 original de Google; no hay datos de degradacion respecto al modelo de referencia de Google.
- Imagenes y video no se han probado con este fichero, aunque el vision tower es byte-identico al de Google.
- La memoria real no se ha medido con este fichero; las estimaciones se heredan de `keptn/gemma4-31b-a4`.
- Los rechazos no se han medido en la version 2.0; los datos XSTest y OR-Bench corresponden a la version 1.0.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de 31B cuantizados a int4.
- Idiomas soportados no documentados.
- Dependencia exclusiva del motor radiance y del hardware AMD RDNA4; no hay portabilidad a otros stacks de inferencia.
- La configuracion de tres tarjetas no es valida por la division de cabezas de atencion.
- Sesgos conocidos: no documentados en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-heretic-ara-a4
- Version 1.0 (w4a8): https://huggingface.co/keptn/gemma4-31b-heretic-ara-a4/tree/v1.0
- Variante int8: https://huggingface.co/keptn/gemma4-31b-heretic-ara-i8g
- Modelo base heretic: https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Modelo base de Google: https://huggingface.co/google/gemma-4-31B-it-assistant
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Guia Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- PR de soporte Gemma 4 en radiance: https://codeberg.org/StillDeadcode/radiance/pulls/75
- Heretic: https://github.com/p-e-w/heretic
- Metodo ARA (PR de Heretic): https://github.com/p-e-w/heretic/pull/211
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
- Conjunto de calibracion: https://huggingface.co/keptn/quant-calibration
- Variante de referencia de memoria: https://huggingface.co/keptn/gemma4-31b-a4
