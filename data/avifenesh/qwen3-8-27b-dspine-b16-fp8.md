# Avifenesh/Qwen3.8-27B-DSpine-b16-FP8

## Resumen

Qwen3.8-27B-DSpine-b16-FP8 es un modelo borrador (draft model) para decodificación especulativa, publicado por el usuario Avifenesh sobre el drafter DSpine de Tencent para Qwen3.8-27B. No es un modelo autónomo: genera bloques de 16 tokens que el modelo objetivo (nvidia/Qwen3.8-27B-NVFP4) verifica, de modo que la salida greedy coincide con el argmax del objetivo en cada posición. Su interés radica en que reduce el coste de memoria del borrador (de 4,05 GB a 2,32 GB) cuantizando a FP8 las cinco capas del decodificador y la capa `fc`, e incluye un plugin para SGLang que permite servir borrador y objetivo conjuntamente en un único DGX Spark (GB10, sm_121).

El modelo tiene 2.026.173.184 parámetros reales según los safetensors y un repositorio de 2,3 GB. Está pensado específicamente para acelerar la inferencia de un objetivo de 27B en hardware de una sola GPU con memoria unificada, un escenario donde el ancho de banda y la memoria son el cuello de botella. La licencia es Apache-2.0, heredada del modelo base de Tencent.

La relevancia actual es doble: por un lado, documenta con mediciones concretas el compromiso entre velocidad a un solo usuario (mejora del 16-19% frente a DFlash2) y degradación con alta concurrencia (pérdida del 15-16% a 8 y 32 usuarios); por otro, muestra un patrón de empaquetado (pesos FP8, cabecera de borrador tomada del objetivo, anchos de verificación por tamaño de lote) que puede replicarse en otros objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con estado GDN (familia DFlash/DSpine), borrador de decodificación especulativa; el modelo base se describe como denso multimodal nativo |
| Parametros totales | 2.026.173.184 (2,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (contexto del objetivo servido; el borrador opera dentro de esa ventana) |
| Tipos de cuantizacion | FP8 (e4m3, una escala fp32 por canal de salida) en las cinco capas del decodificador y `fc`; puente de código en BF16; soporte de re-cuantización FP8 en carga vía SGLang; el objetivo asociado usa NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa de la familia DSpine, construido sobre tencent/Qwen3.8-27B-DSpine-b16. La arquitectura combina capas de atención con estado GDN (Gated Delta Network) en BF16, lo que obliga a usar `--mamba-ssm-dtype bfloat16` y la estrategia de caché `extra_buffer_lazy` en el servidor. El borrador propone bloques de 16 tokens que el objetivo verifica; la cabeza de borrador no es una copia propia, sino que las candidatas gruesas provienen del `lm_head` NVFP4 del objetivo y el re-scoring top-16 y las tablas de transición usan una copia BF16 de esa misma cabeza, construida al cargar el checkpoint. Esto elimina la copia FP8 de 1,27 GB que traía el DSpine original.

Los cambios respecto al modelo base son de cuantización y empaquetado, no de entrenamiento: los pesos FP8 y sus escalas se generaron con el kernel de cuantización en línea de SGLang (`per_token_group_quant_fp8`, grupo = la fila) y el loader los convierte a BF16 para que `--speculative-draft-model-quantization fp8` los re-cuantice de forma bit-exacta. El autor verificó que la ruta empaquetada reproduce la ruta FP8 en línea en 8 prompts (mismos tokens greedy, logprobs y aceptación). Los anchos de verificación están perfilados en `sps-gb10.json` con el tuner SPS de Tencent para lotes de 1 a 7 (16, 16, 8, 8, 16, 16, 8) y 8 de 16 tokens a partir de lote 8. El plugin se portó de SGLang 0.5.22 al build nightly `c757c4b` y a sm_121, con atención de borrador FA4 (FA3 es solo Hopper), estado GDN en bf16, `extra_buffer_lazy`, hasta 32 peticiones en ejecución y una corrección de probabilidades NaN del objetivo en verificación muestreada.

## Capacidades

- Generación de texto asistida por decodificación especulativa: acelera la inferencia del objetivo Qwen3.8-27B sin alterar la distribución de salida en modo greedy.
- Verificación exacta: 0 de 1.580 tokens emitidos difieren del top-1 del objetivo en 8 prompts mixtos; salida idéntica a través de dos Sparks y de la ruta FP8 en línea.
- Reanudación desde caché de prefijo: 8 de 8 prompts idénticos en frío y desde caché, cada token igual al top-1 del objetivo.
- Verificación muestreada: 192 turnos de agente muestreados sin respuestas degeneradas con el paquete enviado (384 con las ejecuciones FP8 en línea).
- Contexto largo: prompt de 260.013 tokens pre-rellenado en 269 s con las dos agujas recuperadas y más de 8,6 GiB de memoria libre.
- Soporte de lotes concurrentes: hasta 32 peticiones en ejecución con anchos de verificación por tamaño de lote.
- No soporta tool calling, visión ni audio por sí mismo: esas capacidades dependen del objetivo Qwen3.8-27B, no del borrador.

## Casos de uso

- Aceleración de un asistente conversacional de un solo usuario en DGX Spark: con el objetivo NVFP4 y este borrador se obtienen 39,7 tok/s agregados frente a 33,2-34,2 tok/s de DFlash2, una mejora del 16-19% que se traduce directamente en menor latencia percibida.
- Despliegue en hardware de memoria unificada limitada: el borrador ocupa 2,32 GB en lugar de 4,05 GB, lo que deja más margen para el objetivo, la caché KV y el contexto largo (el paquete mantuvo más de 6,7 GiB libres durante las celdas de agente).
- Servicio de agentes con razonamiento activado: el perfil de referencia usa 48 turnos de agente registrados, thinking on, temperatura 1,0, top-p 0,95, top-k 20 y 768 tokens nuevos, con prefijos ya preparados; es el escenario donde la aceptación sube a 4,46 tokens por ronda con un usuario.
- Procesamiento de documentos largos en una sola pasada: con contexto de 262.144 tokens y pre-relleno de 260.013 tokens en 269 s, sirve para resumir o extraer información de contratos, informes o expedientes completos sin trocear.
- Evaluación comparativa de drafters: el repositorio incluye el perfil SPS y el script `tune_sps.py`, útil para medir DSpine frente a DFlash2 en el mismo objetivo y hardware antes de decidir un despliegue.
- Reproducción de investigación en decodificación especulativa: los datos de aceptación por número de usuarios (3,62-4,46 en este repositorio frente a 3,30-3,58 de DFlash2) permiten validar modelos analíticos de speedup especulativo.
- Servicio por lotes con hasta 4 usuarios concurrentes: en ese punto el rendimiento empata con DFlash2 (111,1 frente a 106,1-109,6 tok/s), por lo que es una opción razonable para equipos pequeños que comparten una instancia.

## Benchmarks y rendimiento

Rendimiento medido en un DGX Spark por ejecución, objetivo nvidia/Qwen3.8-27B-NVFP4 con KV en FP8, contexto de 262.144 y 32 peticiones en ejecución. La línea base es el launcher del autor con z-lab/Qwen3.8-27B-DFlash2, 8 tokens de borrador, FP8 en línea y ventana 2048, con tres ejecuciones en dos Sparks (se muestra el rango).

| Usuarios | DFlash2 (base) | DSpine BF16 publicado | DSpine BF16 con candidatas NVFP4 | Este repo (por defecto) |
|---|---|---|---|---|
| 1 | 33,2-34,2 | 33,2 | 34,3 | 39,7 |
| 4 | 106,1-109,6 | 97,0 | no disponible | 111,1 |
| 8 | 157,4-175,2 | 122,6 | 151,5 | 148,7 |
| 16 | 225,1-235,5 | 176,2 | no disponible | no disponible |
| 32 | 285,7-291,7 | 208,3 | no disponible | 240,5 |

| Usuarios | Aceptación DFlash2 | Aceptación este repo | tok/s por usuario DFlash2 | tok/s por usuario este repo |
|---|---|---|---|---|
| 1 | 3,47-3,58 | 4,46 | 36,9-37,9 | 46,7 |
| 4 | 3,41-3,52 | 3,99 | 30,8-31,4 | 30,8 |
| 8 | 3,30-3,57 | 3,68 | 24,5-26,0 | 24,2 |
| 32 | 3,33-3,57 | 3,62 | 14,0-14,5 | 12,3 |

Contexto largo con un usuario y borrador BF16 en la misma pila: primer token en 15,0 s con prompt de 32K y 91 s con 128K, igual que la línea base (el pre-relleno es del objetivo). La decodificación a 32K/128K de profundidad con thinking desactivado fue inferior a DFlash2 (22,6/18,0 frente a 27,2/21,2 tok/s).

## Requisitos de hardware

- VRAM estimada para el borrador: 2,32 GB en FP8 (frente a 4,05 GB del borrador BF16); el objetivo NVFP4 de 27B y la caché KV se suman aparte.
- GPU de referencia: DGX Spark (GB10, sm_121), una GPU por ejecución. El perfil `sps-gb10.json` está ajustado a ese hardware.
- GPU compatibles con el plugin: se requiere atención de borrador FA4 (FA3 es exclusivo de Hopper); el objetivo NVFP4 condiciona el resto de la pila.
- No cabe en GPU de consumo convencional como parte de un servicio completo: el borrador sí, pero el objetivo de 27B en NVFP4 y el contexto de 262.144 tokens requieren memoria unificada o GPU de centro de datos.
- Despliegue: SGLang nightly `c757c4b` con el plugin `sglang-dspine`, imagen propia vía `docker/Dockerfile`, flags `--speculative-algorithm DSPINE`, `--speculative-num-draft-tokens 16`, `--speculative-draft-attention-backend fa4`, `--speculative-draft-model-quantization fp8`, `--enable-linear-replayssm-spec`, `--mamba-ssm-dtype bfloat16` y `--mamba-radix-cache-strategy extra_buffer_lazy`.
- Throughput: 39,7 tok/s agregados con un usuario y 240,5 tok/s con 32; latencia de primer token dependiente del objetivo (15,0 s a 32K, 91 s a 128K).
- El perfil de verificación está atado a GB10; en otro hardware debe reajustarse con `sglang-dspine/scripts/tune_sps.py`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (1 usuario) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (DSpine FP8) | 2,03 B | 262.144 | 39,7 tok/s; aceptación 4,46 | Apache-2.0 | Hugging Face, requiere SGLang nightly y plugin |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | 262.144 (objetivo) | 33,2-34,2 tok/s; aceptación 3,47-3,58 | no disponible | Hugging Face, launcher propio del autor |
| tencent/Qwen3.8-27B-DSpine-b16 | 2 B | no disponible | 33,2 tok/s a 1 usuario; 208,3 a 32 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (objetivo) | 27 B | no disponible | no disponible | no disponible | Hugging Face, GitHub de Alibaba |

A un usuario este repositorio supera a DFlash2 entre un 16% y un 19%; a 4 usuarios empata; a 8 y 32 pierde entre un 15% y un 16%, porque la verificación de 16 tokens duplica las filas del objetivo por ronda y FlashInfer solo ofrece un ancho de verificación uniforme por tamaño de lote (el presupuesto irregular de Tencent para lote 8 necesita FA3/FA4 en el objetivo, que este modelo híbrido no puede usar en GB10).

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo Qwen3.8-27B y el plugin de SGLang no genera texto por sí mismo.
- Degradación con alta concurrencia: pierde un 15% a 8 usuarios y un 16% a 32 frente a DFlash2 en el mismo Spark.
- Decodificación más lenta en contexto largo: 22,6/18,0 tok/s a 32K/128K frente a 27,2/21,2 de DFlash2 con thinking desactivado.
- Dependencia de versiones: requiere SGLang nightly `c757c4b`, parches de servicio del autor (no incluidos en el repo) y el parche `sglang-patches/replay` para el estado GDN en bf16; el perfil está atado a GB10 y sm_121.
- Riesgo de alucinación: el borrador no introduce sesgo propio en modo greedy (exactitud verificada), pero hereda íntegramente los sesgos y alucinaciones del objetivo Qwen3.8-27B.
- Idiomas soportados no documentados en la información disponible; dependen del objetivo.
- Uso comercial permitido por Apache-2.0, con las obligaciones de atribución de LICENSE, NOTICE y `sglang-dspine/THIRD_PARTY_NOTICES.txt`.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/Qwen3.8-27B-DSpine-b16-FP8
- Modelo base DSpine de Tencent: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Repositorio DSpine: https://github.com/Tencent/DSpine
- Objetivo NVFP4: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Borrador de comparación DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
