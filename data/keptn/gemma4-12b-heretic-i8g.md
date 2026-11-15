# keptn/gemma4-12b-heretic-i8g

## Resumen

keptn/gemma4-12b-heretic-i8g es una cuantización int8 del modelo Gemma 4 12B-it en su variante "heretic", es decir, con los mecanismos de rechazo (refusals) eliminados mediante la técnica de abliteration. El modelo parte de llmfan46/gemma-4-12B-it-uncensored-heretic, que a su vez deriva del modelo oficial google/gemma-4-12B-it-assistant. Lo publica el usuario keptn, que ya había publicado la versión equivalente del modelo original (keptn/gemma4-12b-i8g).

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de empaquetado optimizado para hardware AMD RDNA4 mediante el motor de inferencia radiance 2.0.0, con pesos int8, cabecera asistente de Google para decodificación especulativa y soporte multimodal de texto, imagen y audio. Por otro, es un caso de estudio de cuantización agresiva sobre un modelo ya modificado: la calidad se mide contra el original bf16 de Google, de modo que las métricas de divergencia reflejan conjuntamente el efecto del abliteration y del redondeo a 8 bits.

El archivo único ocupa 13,79 GiB y el repositorio completo 14,8 GB. La longitud de contexto declarada es de 262.144 tokens, con licencia Apache 2.0. El modelo está pensado para despliegue local en GPUs profesionales AMD (Radeon AI PRO R9700, una, dos o cuatro tarjetas) y no para entornos CUDA convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con cabecera asistente para decodificacion especulativa; pesos int8 con escalas bf16 |
| Parametros totales | 12B (segun el nombre del modelo base; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | int8 en todas las capas lineales del tronco (una escala bf16 por cada 128 pesos, redondeo al mas cercano); activaciones int8 (una escala por token y 128 valores); lm_head int8; lm_head de la cabecera asistente tambien int8; cabecera asistente en bf16 |
| Idiomas soportados | no disponible (la model card no detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), archivo unico de 13,79 GiB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento nuevo. El proceso documentado por el autor consiste en descargar llmfan46/gemma-4-12B-it-uncensored-heretic (revision cf3bb4a1), google/gemma-4-12B-it (revision 707f0a3b) y google/gemma-4-12B-it-assistant (revision 3b0b0a4a); sustituir config.json, la plantilla de chat, los ficheros del tokenizer y la configuracion de generacion por los de Google (el checkpoint original carecia de cuatro tamanos de vision y audio que radiance necesita, y su plantilla de chat era una version antigua); anadir la cabecera asistente de Google; y redondear a int8 todas las capas lineales del tronco con una escala bf16 cada 128 pesos. Los pesos y el vocabulario del checkpoint original se mantienen sin cambios.

La arquitectura subyacente es la de Gemma 4 12B, un transformer multimodal que acepta texto, imagen y audio, con una cabecera asistente independiente (tipo MTP) que actua como modelo borrador para decodificacion especulativa con 3 tokens de borrador. El componente "heretic" procede del modelo intermedio llmfan46, que aplico tecnicas de abliteration para eliminar los rechazos; el autor reporta una divergencia KL de 0,1215 respecto al original en el primer token de 100 prompts inocuos (mlabonne/harmless_alpaca, revision 02c6a92c), medida sobre el checkpoint bf16. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre la composicion del dataset original de Gemma 4 en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con plantilla de chat de Google y modo de pensamiento (thinking) activable por peticion mediante `chat_template_kwargs`.
- Entrada multimodal: texto, imagen y audio, segun el pipeline image-text-to-text y los tags vision y audio.
- Decodificacion especulativa mediante la cabecera asistente de Google (3 tokens de borrador), que acelera la generacion.
- Respuestas sin rechazo: el modelo contesta peticiones que el original rechaza (7/100 por coincidencia de palabras clave y 3/100 por clasificador frente a 99/100 y 97/100 del original).
- Soporte de contexto muy largo: hasta 262.144 tokens, con gestion de cache KV configurable (bf16 o i8).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni de agentes multi-paso; debe considerarse no confirmado.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un Gemma 4 con los rechazos eliminados, comparando sus respuestas con las del original bf16 y midiendo la divergencia con herramientas como `--kld-ref` de radiance.
- Evaluacion de cuantizacion int8 en hardware AMD: sirve para medir la perdida de calidad (KL media 0,0867, percentil 99 de 1,26, 92,2% de coincidencia en el token superior) y el impacto en velocidad (90,0 y 129,8 tokens por segundo en una tarjeta) frente al modelo sin cuantizar.
- Despliegue local en estaciones con GPUs RDNA4: con una o dos Radeon AI PRO R9700 de 32 GB se puede servir el modelo con contexto completo y hasta 8 secuencias, util para prototipos y demos internas.
- Procesamiento de documentos con imagen y audio: al aceptar image-text-to-text y audio, puede emplearse para transcripcion combinada con analisis de capturas o diagramas en un mismo flujo.
- Generacion de contenido sin restricciones de rechazo en entornos controlados de investigacion creativa o red teaming, asumiendo la responsabilidad de uso que indica el autor.
- Benchmarking de motores de inferencia: la comparacion directa con keptn/gemma4-12b-i8g (mismo formato, tamano y capas) permite aislar el coste del abliteration frente al de la cuantizacion en pruebas de rendimiento y calidad.

## Benchmarks y rendimiento

Calidad medida contra el original bf16 de Google (no contra el heretic bf16), sobre las respuestas a las 80 preguntas de MT-Bench de lmsys/mt_bench_human_judgments, ambos turnos, plantilla de chat del modelo y thinking desactivado; 42.283 tokens de respuesta evaluados con `--kld-ref` en radiance 2.0.0 con KV i8 y una tarjeta:

| Metrica | Este archivo | keptn/gemma4-12b-heretic-a4 | keptn/gemma4-12b-i8g (modelo de Google) |
|---|---|---|---|
| KL media | 0,0867 | 0,140 | 0,00542 |
| Percentil 99 de KL | 1,26 | 1,91 | 0,0659 |
| Token superior coincidente | 92,2% | 89,7% | 97,9% |
| Ratio de perplejidad | x1,021 | x1,013 | x1,000 |

Rechazos medidos sobre el checkpoint bf16 con 100 prompts de mlabonne/harmful_behaviors (revision 01cead01), por coincidencia de palabras clave y por el clasificador VINAY-UMRETHE/Refusal-Classifier (revision 5c525175):

| Metrica | Este modelo (bf16) | Original de Google (bf16) |
|---|---|---|
| Rechazos por palabras clave | 7/100 | 99/100 |
| Rechazos por clasificador | 3/100 | 97/100 |

Velocidad en una tarjeta con radiance 2.0.0, KV i8, 3 tokens de borrador, greedy y dos prompts: 90,0 y 129,8 tokens por segundo para este archivo, frente a 94,5 y 131,3 para keptn/gemma4-12b-i8g. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el archivo de pesos ocupa 13,79 GiB. La cache KV a 262.144 tokens y 8 secuencias requiere 18,12 GiB por tarjeta con una tarjeta (977.904 tokens de contexto en total, 3,7 sesiones completas) y 24,10 GiB por tarjeta con dos tarjetas (1.474.480 tokens, 5,6 sesiones completas), en bf16.
- GPU: probado en una y dos Radeon AI PRO R9700 (32 GB) con radiance 2.0.0; soporta 1, 2 o 4 tarjetas. Requiere AMD RDNA4 con ROCm; no hay soporte documentado para CUDA.
- GPU de consumo: no hay datos de ejecucion en GPUs consumer en la informacion disponible; el motor y el formato estan orientados a RDNA4 profesional.
- Despliegue: exclusivamente mediante radiance 2.0.0 o superior (imagen Docker stilldeadcode/radiance:2.0.0), con configuracion YAML; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 90,0 y 129,8 tokens por segundo en una tarjeta con los ajustes de prueba indicados; el autor remite a la model card de keptn/gemma4-12b-i8g para la tabla de velocidad completa.
- Memoria del sistema: el ejemplo de despliegue usa `--ulimit memlock=-1:-1` y acceso a `/dev/kfd` y `/dev/dri`, propios de ROCm.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL media vs. Google bf16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keptn/gemma4-12b-heretic-i8g | 12B | 262.144 | 0,0867 | Apache 2.0 | Hugging Face, formato .rad para radiance |
| keptn/gemma4-12b-heretic-a4 | 12B | no disponible | 0,140 | Apache 2.0 | Hugging Face, formato .rad |
| keptn/gemma4-12b-i8g (modelo de Google) | 12B | 262.144 | 0,00542 | Apache 2.0 | Hugging Face, formato .rad |
| llmfan46/gemma-4-12B-it-uncensored-heretic | 12B | no disponible | no disponible | no disponible | Hugging Face, bf16 |

La comparativa se limita a variantes del mismo linaje, ya que la informacion disponible no incluye alternativas de otros desarrolladores con especificaciones verificables. Frente a la version a4, este archivo tiene mayor KL media pero mejor percentil 99 y mayor coincidencia en el token superior; frente al modelo de Google cuantizado, la diferencia de calidad es atribuible al abliteration y no solo al redondeo.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los rechazos: responde a peticiones que el original bloquea. El autor declara que la responsabilidad de uso recae en el usuario.
- La calidad se degrada respecto al original: KL media de 0,0867 frente a 0,00542 del modelo de Google cuantizado, y ratio de perplejidad de x1,021. La mayor parte de esa divergencia procede del abliteration, no del int8.
- Las metricas de rechazo y de divergencia KL se midieron sobre el checkpoint bf16, no sobre el archivo int8 publicado.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de factualidad; el abliteration puede alterar el comportamiento en dominios sensibles.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base de Google y el intermedio heretic pueden imponer condiciones adicionales que no se detallan en la informacion disponible.
- Dependencia de hardware y software muy especificos: requiere radiance 2.0.0 o superior y GPUs AMD RDNA4 con ROCm; el formato .rad no es portable a otros motores.
- El modelo esta pensado para investigacion y despliegue controlado; no se recomienda en produccion orientada al publico sin filtros adicionales.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-12b-heretic-i8g
- Modelo intermedio heretic: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- Version cuantizada del modelo de Google: https://huggingface.co/keptn/gemma4-12b-i8g
- Version a4 del heretic: https://huggingface.co/keptn/gemma4-12b-heretic-a4
- Motor radiance (Codeberg): https://codeberg.org/StillDeadcode/radiance
- Hilo de Reddit sobre modelos sin censura para uso local: https://www.reddit.com/r/LocalLLM/comments/1u2re03/uncensored_llm_models_for_local_use/
- Repositorio de referencia mradermacher/gemma-4-12b-heretic: https://huggingface.co/mradermacher/gemma-4-12b-heretic-
