# keptn/ling-3.0-flash-sante-w4a8

## Resumen

Ling-3.0-flash-Sante w4a8 es una cuantización de 4 bits (w4a8) del modelo médico `inclusionAI/Ling-3.0-flash-Sante`, publicada por el usuario keptn para el motor de inferencia radiance sobre GPUs AMD RDNA4. El modelo original es un transformer de tipo Mixture-of-Experts con 124.000 millones de parámetros totales y 5.100 millones activos por token, afinado para el dominio médico. Esta versión comprime los pesos en un único fichero de 64,10 GiB que no cabe en una sola tarjeta y requiere dos o cuatro GPUs de 32 GB.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible servir un MoE de 124B con calidad casi idéntica al original bf16 (KL medio de 0,00461 frente al checkpoint de referencia) en hardware AMD de consumo profesional, algo hasta hace poco reservado a NVIDIA. Por otro, su contexto de 262.144 tokens y su cabecera MTP para decodificación especulativa lo hacen apto para tareas de razonamiento largo sobre documentación clínica.

El modelo está pensado para despliegues en producción sobre Radeon AI PRO R9700 y similares, con licencia MIT tanto en el original como en esta cuantización, lo que facilita su uso comercial. No obstante, la dependencia exclusiva del motor radiance y del hardware RDNA4 limita seriamente su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 512 expertos enrutados por capa, con cabecera MTP (multi-token prediction) |
| Parametros totales | 124.000 millones (124B) |
| Parametros activos | 5.100 millones (5,1B) por token |
| Longitud de contexto | 262.144 tokens (probado en velocidad y calidad a 65.536) |
| Tipos de cuantizacion | W4A8: expertos enrutados a 4 bits con codebook y escala FP8 cada 64 pesos; otras lineales grandes en IQ8R (int8 con rotación Hadamard sobre 128 y escala u8 cada 256 pesos); activaciones int8; embedding, lm_head, router y proyecciones pequeñas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 64,10 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 512 expertos enrutados por capa y 124B de parámetros totales, de los que solo 5,1B se activan por token. Incluye un experto compartido y una cabecera MTP (multi-token prediction) que se reutiliza aquí para decodificación especulativa con 3 tokens borrador. El checkpoint de partida es la revisión `f74bd27b` del modelo bf16 original de inclusionAI, afinado para el dominio médico (Sante).

La cuantización se realizó con la herramienta `rad-convert` y la receta `ling-3.0-flash-sante-w4a8.recipe`. Los expertos enrutados se comprimen a códigos de 4 bits sobre un codebook, con una escala FP8 por cada 64 pesos, redondeo al más cercano y búsqueda de escala. El resto de lineales grandes pasan a IQ8R (int8 con rotación Hadamard sobre 128 y una escala u8 cada 256 pesos bajo una escala bf16 por fila). El embedding, el lm_head, el router y algunas proyecciones pequeñas se mantienen en bf16. No se usó ningún dato de calibración: el directorio `CALIB` estaba vacío durante la conversión.

## Capacidades

- Generación de texto y razonamiento de dominio médico, al ser un fine-tune sobre Ling-3.0-flash-Sante.
- Razonamiento multi-paso con modo "thinking" activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}` (desactivado por defecto en la configuración recomendada).
- Tool calling / function calling: probado con una llamada en radiance 2.2.0 con resultado correcto.
- Decodificación especulativa nativa mediante la cabecera MTP del propio modelo, con 3 tokens borrador.
- Ventana de contexto larga de 262.144 tokens, apta para documentación clínica extensa o historiales multi-turno.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistencia clínica documental: resumen y extracción de entidades en historiales e informes médicos largos, aprovechando los 262.144 tokens de contexto para procesar un expediente completo en una sola petición.
- Razonamiento diagnóstico asistido: el modo thinking permite cadenas de razonamiento explícitas sobre síntomas y pruebas, útil como apoyo a profesionales (nunca como sustituto).
- Codificación clínica (CIE-10, SNOMED): clasificación y normalización de diagnósticos y procedimientos mediante tool calling contra catálogos externos.
- Atención al paciente automatizada: conversaciones multi-turno con contexto persistente, desplegando 4 u 8 secuencias concurrentes con el pool KV compartido documentado (hasta 6,4 sesiones completas de 262k en 4 tarjetas).
- Búsqueda aumentada sobre literatura médica: ingestión de guías clínicas y papers en el contexto largo y generación de respuestas citadas.
- Generación de informes estructurados: pipelines que convierten notas libres en informes con esquema fijo, integrándose vía API compatible con el motor radiance.
- Evaluación y anotación de datasets médicos: generación de respuestas de referencia a gran escala con throughput de 268,4 tok/s en decodificación de un solo stream sobre 4 tarjetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se documentan métricas de fidelidad frente al original bf16 y de velocidad:

| Metrica | Este fichero (v2.0) | Version 1.0 |
|---|---|---|
| KL medio (80 preguntas MT-Bench, ambos turnos) | 0,00461 | 0,00652 |
| KL percentil 99 | 0,0494 | 0,0725 |
| Token top idéntico | 98,0% | 97,6% |
| Ratio de perplejidad | ×1,001 | ×1,003 |

| Rendimiento (Radeon AI PRO R9700 300 W, radiance 2.1.0+PR #474, bf16 KV, 3 tokens borrador, thinking off) | 2 tarjetas | 4 tarjetas |
|---|---|---|
| Decodificación, un stream (tok/s, mediana) | 183,9 | 268,4 |
| Prefill a 24k tokens (tok/s) | 1.423 | 2.556 |
| 4 streams, total (tok/s) | 323 | 535 |

En una sola tarjeta el modelo no cabe.

## Requisitos de hardware

- VRAM: el fichero ocupa 64,10 GiB; no cabe en una GPU de 32 GB. Con 8 secuencias el pool KV consume 14,7 GiB por tarjeta en 4 tarjetas y 14,2 GiB por tarjeta en 2 tarjetas.
- GPUs recomendadas: 2 o 4 tarjetas AMD RDNA4 de 32 GB; probado en Radeon AI PRO R9700. No hay soporte documentado para NVIDIA ni para GPUs de consumo de 24 GB.
- Memoria host: en configuración de 2 tarjetas se requieren 32 GiB libres de RAM del sistema para los expertos (`placement: expert_tiered`, `host-pool-mib: 32768`).
- Despliegue: exclusivamente mediante el motor radiance (versión 2.2.0 o superior), distribuido como imagen Docker `stilldeadcode/radiance:2.2.0`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Configuración de referencia: `tp: 4`, `p2p: on`, `kv-cache-dtype: bf16`, `max-model-len: 262144`, `max-num-seqs: 8`, `num-speculative-tokens: 3`, `temp: 1.0`, `top-p: 0.95`.
- Latencia y throughput: ver tabla de benchmarks (183,9-268,4 tok/s en decodificación de un stream; 1.423-2.556 tok/s en prefill a 24k).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Hardware | Motor |
|---|---|---|---|---|---|---|
| Ling-3.0-flash-Sante w4a8 (este) | 124B | 5,1B | 262.144 | MIT | 2-4× AMD RDNA4 32 GB | radiance |
| inclusionAI/Ling-3.0-flash-Sante (bf16) | 124B | 5,1B | no disponible | MIT | Requiere más VRAM que esta cuantización | HF transformers / vLLM |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo funciona en GPUs AMD RDNA4 y exclusivamente con el motor radiance 2.2.0 o superior; no es portable a otros stacks de inferencia.
- El fichero no cabe en una sola tarjeta; como mínimo se necesitan dos GPUs de 32 GB y, en ese caso, 32 GiB de memoria host adicional para los expertos.
- Las métricas de velocidad, calidad y memoria se midieron con radiance 2.1.0 más el PR #474 y con `max-model-len: 65536`; el comportamiento a contexto completo de 262.144 no está validado en cuanto a velocidad.
- No se usó calibración en la conversión, lo que puede afectar a la fidelidad en dominios distintos del evaluado (MT-Bench).
- Tool calling: solo se ha probado una llamada, por lo que la robustez en flujos de agentes complejos no está garantizada.
- Riesgo de alucinación inherente a un modelo de lenguaje médico; no debe usarse como sustituto del criterio clínico profesional.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; la model card original puede detallarlos y debe consultarse antes de su uso.
- Licencia MIT permite uso comercial, pero la model card remite a las limitaciones adicionales del modelo original, que conviene revisar.
- El tamaño del repositorio (140,1 GB) implica una descarga considerable y espacio en disco acorde.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/keptn/ling-3.0-flash-sante-w4a8
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- Motor radiance (Codeberg): https://codeberg.org/StillDeadcode/radiance
- Guía Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- Versión 1.0 de esta cuantización: https://huggingface.co/keptn/ling-3.0-flash-sante-w4a8/tree/v1.0
