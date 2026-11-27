# loom-draft/ggml-org-GLM-4.6V-Flash-loom

## Resumen

`loom-draft/ggml-org-GLM-4.6V-Flash-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/GLM-4.6V-Flash-GGUF`, en su cuantización `GLM-4.6V-Flash-Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que adapta los pesos originales de GLM-4.6V-Flash al runtime Loom para GPUs AMD, concretamente el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador del ecosistema Loom (sin LLM en el bucle). Su relevancia es acotada pero específica: ofrece una vía de servir un modelo multimodal GLM-4.6V-Flash cuantizado en hardware AMD de consumo y de estación de trabajo, con un servidor compatible con la API de OpenAI (`/v1/chat/completions`) y con métricas comparativas frente a llama.cpp ROCm publicadas por el autor.

La información disponible sobre el modelo subyacente (arquitectura, número de parámetros, contexto, datos de entrenamiento) no está incluida en la model card; esta se limita al empaquetado, los comandos de despliegue y las mediciones de rendimiento en Strix Halo. Todo lo que no figure en esa documentación se marca como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-4.6V-Flash; arquitectura no detallada en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible como especificación; las pruebas de rendimiento usan contextos de hasta 32k tokens y llama.cpp se configura con `-c 65536` |
| Tipos de cuantización | Q4_K_M (checkpoint `GLM-4.6V-Flash-Q4_K_M.gguf`); otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF dentro de un paquete Loom (`.loom` + `model.json`); pesos base en GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) de GLM-4.6V-Flash en la documentación proporcionada. El artefacto de este repositorio no modifica los pesos: empaqueta el GGUF original en Q4_K_M para el runtime Loom, que expone un servidor HTTP con API estilo OpenAI.

La innovación técnica documentada es de infraestructura, no de modelado: el paquete incluye presets de ejecución para dos GPUs AMD, con opciones como `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elástico), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295`, que activa espera activa de las finalizaciones de GPU consumiendo CPU mientras hay trabajo en vuelo. Según la metodología del autor, no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificación especulativa no está disponible (`n/a`).

## Capacidades

- Generación de texto conversacional mediante `/v1/chat/completions` con esquema compatible con OpenAI.
- Modo de razonamiento/thinking activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Capacidad multimodal implícita por el nombre del modelo base (GLM-4.6V-Flash), aunque la model card no detalla el soporte de imagen en este paquete.
- Tool calling: marcado como "not applicable" en la tabla de características del autor.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Servicio multi-stream: las mediciones incluyen 4 peticiones en paralelo con decodificación agregada.

## Casos de uso

- Despliegue local en AMD Strix Halo: servir GLM-4.6V-Flash Q4_K_M en un Ryzen AI Max+ 395 con los comandos `loom-fetch` y `loom-serve` documentados, útil para prototipos en hardware integrado AMD sin GPU discreta.
- Inferencia en Radeon AI PRO R9700: el paquete incluye preset para gfx1201 con 32 GB de VRAM; el autor indica que las mediciones en esta GPU aún no se han repetido, por lo que el caso de uso es válido pero sin cifras de rendimiento publicadas.
- Procesamiento de documentos largos: con prefilling medido de hasta 32k tokens (781,9 tok/s en Loom frente a 621,7 tok/s en llama.cpp en Strix Halo), adecuado para resumir o extraer información de documentos extensos.
- Asistente conversacional con razonamiento explícito: el modo thinking activado por defecto permite obtener trazas de razonamiento; desactivarlo reduce latencia en respuestas simples.
- Servicio multi-cliente ligero: con 138 tok/s agregados en 4 streams (frente a 113 tok/s de llama.cpp), sirve para pequeños equipos o demos concurrentes en una sola máquina.
- Integración en pipelines con API OpenAI: al exponer `/v1/chat/completions`, se puede conectar a clientes y frameworks que ya hablan el protocolo de OpenAI sin adaptadores adicionales.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151), Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374`, mismo GGUF y mismas peticiones; mediana de 3 sesiones, medida el 2026-11-26:

| Métrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 34,4 | 36,5 | +6 % |
| Decode tok/s, contexto 2k | 33,7 | 34,0 | +1 % |
| Decode tok/s, contexto 32k | 28,3 | 21,8 | -23 % |
| Prefill tok/s, documento 1k | 1118,9 | 1299,3 | +16 % |
| Prefill tok/s, documento 2k | 1111,7 | 1323,6 | +19 % |
| Prefill tok/s, documento 8k | 988,6 | 1189,9 | +20 % |
| Prefill tok/s, documento 16k | 836,4 | 1016,0 | +21 % |
| Prefill tok/s, documento 32k | 621,7 | 781,9 | +26 % |
| 4 streams, decode agregado tok/s | 113,0 | 138,0 | +22 % |
| Decodificación especulativa | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) el autor indica que los resultados aún no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible de forma explícita; el preset de R9700 asume 32 GB y llama.cpp se ejecuta con `-ngl 99 -cram 0 -c 65536 -np 1`.
- Cabe en GPU de consumo integrada AMD (Strix Halo) según las mediciones del autor; en NVIDIA no hay soporte documentado en este paquete.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp para este paquete concreto, aunque el GGUF base es de `ggml-org`.
- Throughput medido en Strix Halo: 36,5 tok/s de decode en prompt corto (1 stream) y 138 tok/s agregados con 4 streams; prefill de 1299,3 tok/s en documentos de 1k tokens.
- Latencia: no se publican cifras de latencia por petición (TTFT); solo tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/despliegue | Notas |
|---|---|---|---|---|---|
| GLM-4.6V-Flash (este paquete, Q4_K_M) | no disponible | no disponible (pruebas hasta 32k) | MIT | Loom, GPUs AMD gfx1151/gfx1201 | Paquete de despliegue; rendimiento medido frente a llama.cpp en Strix Halo |
| GLM-4.6V-Flash-GGUF (ggml-org) | no disponible | no disponible | no disponible en la información | GGUF, genérico (llama.cpp y otros) | Checkpoint base sin empaquetar |
| llama.cpp ROCm (runtime, no modelo) | n/a | configurable (`-c 65536` en la prueba) | MIT (proyecto) | llama.cpp | Referencia de rendimiento: 34,4 tok/s decode corto, 1118,9 tok/s prefill 1k en Strix Halo |

No se dispone de datos de benchmarks de calidad ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado (26 de noviembre de 2026) sin validación comunitaria.
- El paquete está generado automáticamente con `loom-next` (sin LLM en el bucle); no implica una revisión manual de los pesos ni del comportamiento del modelo.
- Solo cubre hardware AMD gfx1151 y gfx1201; no hay soporte documentado para NVIDIA u otras GPUs.
- En contexto de 32k, el decode es un 23 % más lento que llama.cpp en Strix Halo: penalización relevante para cargas con ventanas largas y generación extensa.
- Tool calling marcado como "not applicable"; no apto para flujos de agentes que dependan de function calling.
- Sin decodificación especulativa disponible (sin cabeza MTP en el GGUF ni drafter publicado).
- Los resultados de R9700 no se han re-medido; no hay cifras de rendimiento para esa GPU.
- No hay información sobre sesgos, tasas de alucinación, cobertura idiomática ni comportamiento multimodal en la documentación; deben evaluarse sobre el modelo base GLM-4.6V-Flash.
- Licencia MIT declarada en el paquete; conviene verificar las condiciones del checkpoint base `ggml-org/GLM-4.6V-Flash-GGUF` antes de uso comercial en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/ggml-org-GLM-4.6V-Flash-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/GLM-4.6V-Flash-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45895804470
