# keptn/gemma4-31b-i8g

## Resumen

keptn/gemma4-31b-i8g es una cuantización int8 (w8a8) del modelo multimodal google/gemma-4-31B-it, empaquetada en un único fichero de 33,37 GiB para el motor de inferencia radiance sobre GPUs AMD RDNA4. No es un modelo nuevo: es una distribución de pesos optimizada para hardware AMD, con las capas lineales del tronco en int8 con redondeo al más cercano y una escala bf16 por cada 128 pesos. Incluye además la cabeza asistente de Gemma 4 (en bf16) para decodificación especulativa con 3 tokens de borrador.

El modelo base es un transformer multimodal de Google con 31 000 millones de parámetros, ventana de contexto de 262 144 tokens y entradas de texto, imagen y vídeo. Esta versión concreta resuelve el problema de desplegar un modelo de ese tamaño en clústeres de GPUs de consumo profesional AMD (Radeon AI PRO R9700 de 32 GB), donde no cabe en una sola tarjeta pero sí en dos o cuatro mediante tensor parallelism.

Es relevante ahora porque demuestra que el ecosistema de inferencia para RDNA4 empieza a tener formatos cuantizados propios (el formato `.rad` con w8a8 e i8a8) con métricas de fidelidad publicadas frente al original en bf16. El repositorio está archivado desde el 26 de noviembre de 2026 y el autor redirige a keptn/gemma4-31b-exl3, de menor tamaño y misma calidad, para radiance 2.3.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), tronco con capas lineales int8; cabeza asistente para decodificación especulativa |
| Parametros totales | 31 000 millones (modelo base gemma-4-31B-it) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | int8 w8a8: pesos int8 con una escala bf16 por 128 pesos; activaciones int8 con una escala por token y 128 valores; lm_head int8; KV cache fp8 o i8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero `gemma4-31b-i8g.rad` de 33,37 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google con 31 000 millones de parámetros, torre de visión y capacidad de procesar texto, imagen y vídeo. Esta distribución no reentrena nada: aplica cuantización post-entrenamiento int8 con redondeo al más cercano sobre todas las capas lineales del tronco, mantiene el lm_head en int8 y conserva la cabeza asistente de Gemma 4 en bf16 para decodificación especulativa con 3 tokens de borrador. El formato i8a8 procede del soporte previo de Gemma 3 en radiance.

La innovación técnica principal es el empaquetado para tensor parallelism en RDNA4: el fichero se reparte entre 2 o 4 GPUs (32 cabezas de atención no se dividen en tres tarjetas), con soporte de p2p, KV cache en fp8 o i8 y decodificación especulativa. El autor publica métricas de fidelidad frente al original en bf16 con aritmética fp32: KL medio de 0,00236, percentil 99 de 0,0311, 98,8 % de coincidencia en el token top y ratio de perplejidad de ×1,004 sobre 42 283 tokens de respuesta de MT-Bench. No se detallan datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno con plantilla de chat propia de Gemma.
- Procesamiento de imagen (image-text-to-text) con torre de visión; pruebas publicadas sobre DocVQA y AI2D.
- Procesamiento de vídeo: 4 fotogramas por clip en las pruebas del autor (MVBench).
- Modo thinking activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificación especulativa con la cabeza asistente de Google (3 tokens de borrador), integrada en el motor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente documental con imágenes: el modelo acepta páginas escaneadas o capturas y responde preguntas sobre su contenido; la ventana de 262 144 tokens permite adjuntar documentos extensos junto con el historial de conversación.
- Análisis de vídeo por muestreo de fotogramas: extracción de 4 fotogramas por clip e interrogación en lenguaje natural, útil para moderación de contenido o resumen de grabaciones.
- Despliegue on-premise en clústeres AMD: dos Radeon AI PRO R9700 de 32 GB ofrecen 89,6 tokens/s en decodificación de un solo stream, suficiente para asistentes internos con requisitos de soberanía de datos.
- Servicio multi-usuario de baja concurrencia: con 4 secuencias simultáneas y KV cache fp8, dos tarjetas sostienen 264 tokens/s agregados; adecuado para equipos pequeños o entornos de investigación.
- Evaluación comparativa de cuantizaciones: las métricas KL publicadas permiten usar este fichero como referencia int8 al medir el impacto de cuantizaciones más agresivas (w4a8, w5) sobre el mismo modelo base.
- Prototipado de pipelines multimodales sobre ROCm: al ejecutarse en radiance vía Docker con imagen `stilldeadcode/radiance:2.0.0`, sirve para validar flujos de imagen y vídeo antes de migrar a producción con el formato sucesor exl3.

## Benchmarks y rendimiento

Rendimiento medido por el autor en Radeon AI PRO R9700 a 215 W, radiance main 248ecf5, fp8 KV, 3 tokens de borrador, thinking desactivado, BetterBench 0.6.1, temperatura 0,7, mediana de tokens por segundo:

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decodificación, un stream | no cabe | 89,6 | 142,6 |
| Prefill a 24k tokens | no cabe | 2 534 | 3 451 |
| 4 streams, total | no cabe | 264 | 404 |

Fidelidad frente al bf16 original (MT-Bench, 80 preguntas, ambos turnos, 42 283 tokens de respuesta):

| Version | KL medio | KL p99 | Token top coincidente | Ratio de perplejidad |
|---|---|---|---|---|
| Este fichero (int8) | 0,00236 | 0,0311 | 98,8 % | ×1,004 |
| keptn/gemma4-31b-a4 v1.0 (w4a8) | 0,0517 | 0,721 | 94,6 % | ×1,056 |
| keptn/gemma4-31b-w5 | 0,00803 | 0,107 | 97,8 % | ×1,010 |

Calidad multimodal (greedy, thinking off, 2 tarjetas): imágenes DocVQA y AI2D, 16/20 respuestas idénticas, KL medio 0,471, 66/70 tokens top coincidentes; vídeo MVBench (5 clips, 4 fotogramas), 4/5 respuestas idénticas, KL medio 0,0272, 31/32 tokens top coincidentes. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: los pesos ocupan 33,37 GiB, por lo que una sola tarjeta de 32 GB no es suficiente. Mínimo dos GPUs de 32 GB.
- GPUs probadas: Radeon AI PRO R9700 (RDNA4) en configuraciones de 2 y 4 tarjetas. No se documenta soporte en otras GPU AMD ni en NVIDIA.
- Consumer GPU: no cabe en ninguna tarjeta de consumo de 24 GB o menos; requiere al menos dos GPUs de 32 GB.
- Tensor parallelism: `tp: 2` o `tp: 4`. Tres tarjetas no funcionan porque las 32 cabezas de atención no se dividen entre tres.
- Pool KV a contexto completo (262 144 tokens, fp8): 524 304 tokens con 2 secuencias en 2 tarjetas; hasta 2 097 248 tokens con 8 secuencias en 4 tarjetas.
- Despliegue: exclusivamente mediante el motor radiance (versión 2.0.0 o superior; 1.16.0–1.17.0 también leen el fichero con flags de línea de comandos), distribuido como imagen Docker `stilldeadcode/radiance:2.0.0`. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- La torre de visión puede colocarse en RAM (`vision-tower-placement: ram`) para liberar VRAM.
- Throughput y latencia: ver tabla de benchmarks (89,6 tokens/s en un stream con 2 tarjetas; 2 534 tokens/s de prefill a 24k).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| keptn/gemma4-31b-i8g | 31B | 262 144 | `.rad` int8 w8a8 | Apache 2.0 | Archivado (26-11-2026) |
| keptn/gemma4-31b-exl3 | 31B (base Gemma 4) | no disponible | exl3, menor tamaño | Apache 2.0 | Activo, requiere radiance 2.3.0+ |
| keptn/gemma4-31b-w5 | 31B (base Gemma 4) | no disponible | `.rad` w5 | Apache 2.0 | Disponible; peor fidelidad (KL 0,00803) |
| keptn/gemma4-31b-a4 v1.0 | 31B (base Gemma 4) | no disponible | `.rad` w4a8 | Apache 2.0 | Disponible; peor fidelidad (KL 0,0517) |

Las tres alternativas comparten el mismo modelo base y licencia; la diferencia está en el compromiso tamaño/fidelidad y en la versión mínima del motor. El autor recomienda exl3 por su menor tamaño con igual calidad.

## Limitaciones y advertencias

- Repositorio archivado: no recibirá actualizaciones; el autor redirige a keptn/gemma4-31b-exl3.
- Dependencia total del motor radiance y de GPUs AMD RDNA4; no hay soporte documentado para CUDA ni para otros runtimes.
- No cabe en una sola GPU: requiere infraestructura de al menos dos tarjetas de 32 GB, lo que limita su uso en estaciones de trabajo convencionales.
- La cuantización int8 introduce desviación frente al bf16 original (KL medio 0,00236, 1,2 % de tokens top distintos); aceptable para uso general, pero conviene validar en tareas sensibles.
- En imágenes la fidelidad cae de forma notable (KL medio 0,471 y 4 de 20 respuestas distintas en DocVQA/AI2D), por lo que no es recomendable para extracción documental crítica sin verificación.
- Riesgo de alucinación y sesgos del modelo base: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Idiomas soportados no especificados; no se garantiza cobertura multilingüe más allá del comportamiento del modelo base.
- Licencia Apache 2.0 heredada del modelo base, sin restricciones comerciales adicionales indicadas por el autor de la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-i8g
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo sucesor recomendado: https://huggingface.co/keptn/gemma4-31b-exl3
- Cuantización w5: https://huggingface.co/keptn/gemma4-31b-w5
- Cuantización w4a8: https://huggingface.co/keptn/gemma4-31b-a4/tree/v1.0
- Motor radiance (código): https://codeberg.org/StillDeadcode/radiance
- Guía Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- PR de soporte de Gemma 4 en radiance: https://codeberg.org/StillDeadcode/radiance/pulls/75
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
