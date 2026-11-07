# loom-fun/ggml-org-Qwen3.6-27B-loom

## Resumen

Qwen3.6-27B es un modelo multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba). El checkpoint original se distribuye en formato GGUF a través de la organización ggml-org, y el artefacto que nos ocupa (`loom-fun/ggml-org-Qwen3.6-27B-loom`) es un paquete de despliegue para el runtime Loom, no un modelo nuevo. Se trata de la conversión del GGUF `Qwen3.6-27B-Q4_K_M.gguf` a un formato de programas `.loom` acompañado de una tarjeta `model.json`, generado sobre hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El interés de este paquete es doble. Por un lado, empaqueta un modelo de 27B parámetros (28B según la model card de Qwen) con capacidad de visión y ventana de contexto de 262.144 tokens en un formato listo para servir vía API compatible con OpenAI. Por otro, incorpora decodificación especulativa mediante un drafter DFlash (Anbeeld/Qwen3.6-27B-DFlash-GGUF) a profundidad 7, activada por defecto, con una tasa de aceptación del 51 % medida en el gate de evaluación.

La relevancia práctica radica en que el paquete está afinado para ejecutarse en GPUs integradas AMD de gran ancho de memoria (216 GB/s en Strix Halo) sin necesidad de GPUs discretas de datacenter, ofreciendo throughput competitivo frente a llama.cpp en prefill (hasta +31 % en documentos de 32k) aunque con pérdidas en decodificación a contexto largo (-24 % a 32k). Es, por tanto, una pieza de infraestructura más que un modelo: un artefacto de despliegue reproducible y verificado contra llama.cpp como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.6-27B; el paquete es un runtime Loom sobre GGUF) |
| Parametros totales | 27B (28B según la model card de Qwen/Qwen3.6-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF base); proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Qwen3.6-27B-Q4_K_M.gguf) empaquetado como programas `.loom` + `model.json` |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | `/v1/chat/completions` estilo OpenAI |
| Dispositivo de referencia | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Radeon 8060S |
| Memoria configurada en el ejemplo | 53.000.000.000 bytes (~53 GB) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base más allá de su procedencia (Qwen3.6-27B, multimodal image-text-to-text). Lo que sí detalla es la capa de despliegue: un conjunto de programas `.loom` generados con el flujo loom-skills que implementan kernels verificados contra implementaciones de referencia (37/37 tests superados), y un servidor `loom-serve` que expone la API. La decodificación especulativa se configura con DFlash a profundidad 7 sobre el drafter Anbeeld/Qwen3.6-27B-DFlash-GGUF en Q4_K_M, activada por defecto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable del paquete es la integración de decodificación especulativa con verificación de equivalencia exacta: el gate `spec` confirma que la salida con decodificación especulativa activada es idéntica a la salida con ella desactivada, y el gate `golden` valida contra log-probs top-5 de llama.cpp en prompts cortos y documentos de 1k a 32k.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imágenes vía partes `image_url` estilo OpenAI, con proyector `mmproj-Qwen3.6-27B-BF16.gguf`.
- Tool calling estilo OpenAI con campos `tools` y `tool_calls`.
- Bucles de agente multi-turno con reutilización de historial y renderizado exacto del prompt (validado en el gate `agent`).
- Decodificación especulativa DFlash a profundidad 7 con 51 % de tokens aceptados.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones con consistencia verificada (misma salida que en ejecución aislada).
- Sin soporte de audio (ni entrada ni salida).
- Sin soporte de "reasoning effort" (ajuste granular del esfuerzo de razonamiento).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal en local: el paquete permite servir un modelo de 27B con visión y 262k de contexto sobre una única APU Strix Halo, adecuado para prototipos de asistencia con capturas de pantalla o documentos escaneados sin depender de la nube.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y un prefill de 351,2 tok/s en documentos de 32k, resulta viable resumir o extraer información de contratos, informes o bases de conocimiento extensas en una sola pasada.
- Agente con herramientas en producción ligera: el soporte de `tools`/`tool_calls` y la validación del bucle agéntico multi-turno permiten construir asistentes que consultan APIs internas, con la garantía de que el renderizado del prompt coincide con la referencia de llama.cpp.
- Automatización de atención al cliente: la concurrencia de 4 peticiones y la consistencia verificada bajo carga permiten atender varias conversaciones simultáneas manteniendo respuestas deterministas con `seed` fijo.
- Análisis de imágenes en pipelines internos: la entrada `image_url` con proyector BF16 posibilita clasificación y descripción de imágenes en flujos de trabajo que ya consumen APIs estilo OpenAI, sin cambios de cliente.
- Evaluación y benchmarking de runtimes: al incluir gates de corrección (`golden`, `compare`, `vision`, `spec`, `consistency`, `needle`, `sampling`), el paquete sirve como banco de pruebas reproducible para comparar Loom frente a llama.cpp en el mismo GGUF.
- Despliegue en hardware de consumo de gama alta: con ~53 GB de memoria configurada en el ejemplo, encaja en equipos con memoria unificada grande (APUs Strix Halo, estaciones con RAM abundante) donde una GPU discreta de 80 GB no está disponible.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0, mismo GGUF en ambos motores:

| Métrica | llama.cpp | Loom | Margen | Roofline | % de roofline (Loom) |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 20,1 | 22,4 | +11 % | 53,7 | 42 % |
| Decode tok/s, contexto 2k | 17,6 | 20,1 | +14 % | 53,4 | 38 % |
| Decode tok/s, contexto 32k | 17,7 | 13,5 | -24 % | 48,2 | 28 % |
| Prefill tok/s, documento 1k | 343,2 | 420,4 | +22 % | 1206,5 | 35 % |
| Prefill tok/s, documento 2k | 341,3 | 418,9 | +23 % | 1201,7 | 35 % |
| Prefill tok/s, documento 8k | 343,0 | 418,2 | +22 % | 1173,5 | 36 % |
| Prefill tok/s, documento 16k | 307,7 | 392,8 | +28 % | 1137,9 | 35 % |
| Prefill tok/s, documento 32k | 268,3 | 351,2 | +31 % | 1072,8 | 33 % |
| 4 streams, decode agregado tok/s | 48,4 | 40,2 | -17 % | 213,1 | 19 % |
| Tokens draft aceptados (spec decoding) | — | 51 % | — | n/a | n/a |

Notas metodológicas de la model card: Loom mide en cliente, llama.cpp en servidor; runs por valor de 1 a 2 (media) para decode y prefill, y 1 (mediana) para 4 streams. El roofline se calcula para gfx1151 a 216 GB/s y 59 TFLOP/s. No se publican resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el ejemplo de arranque configura `--memory_bytes=53000000000` (~53 GB) para el GGUF Q4_K_M más el proyector BF16 y el drafter DFlash Q4_K_M.
- GPU/APU recomendada: AMD Ryzen AI Max+ 395 "Strix Halo" con Radeon 8060S (gfx1151), plataforma sobre la que se han medido todos los datos.
- GPU de consumo: no se documenta compatibilidad con GPUs NVIDIA de consumo; el paquete está orientado a `--device=amdgpu`. No disponible para RTX 4090, A100 o H100 en la información proporcionada.
- Despliegue: `loom-serve` con `loom-fetch` para materializar el paquete; requiere `pip install "hrx-loom[hf]"`. El servidor escucha en `127.0.0.1:8080`.
- Alternativa de despliegue: llama.cpp (build `llamacpp-rocm/b1369`) con `-ngl 99`, `--mmproj` y `--spec-type draft-dflash`.
- Latencia y throughput: decode de 22,4 tok/s en prompt corto y 13,5 tok/s a 32k; prefill de 420,4 tok/s a 1k y 351,2 tok/s a 32k; 40,2 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-27B (loom-fun, este paquete) | 27B (28B según Qwen) | 262.144 | Sí | no disponible | GGUF empaquetado `.loom` | Runtime Loom con spec decoding DFlash |
| ggml-org/Qwen3.6-27B-GGUF | 27B | no disponible | Sí (mmproj BF16) | no disponible | GGUF | Checkpoint base sin empaquetar; ejecutable con llama.cpp |
| Qwen/Qwen3.6-27B | 28B | no disponible | Sí (image-text-to-text) | no disponible | safetensors (presumible, no confirmado) | Checkpoint original de Qwen |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada; no puede confirmarse el uso comercial sin consultar la ficha del modelo base Qwen/Qwen3.6-27B y ggml-org/Qwen3.6-27B-GGUF.
- Los idiomas soportados no están documentados; no se puede garantizar calidad multilingüe.
- El gate `agent_think_off` (bucle de tool calling con thinking desactivado) no tiene evidencia de superación.
- El gate `needle_full` (needle-in-a-haystack a contexto completo) no tiene evidencia: solo se valida hasta la mitad del contexto.
- El gate `decision` no es aplicable, por lo que no hay verificación de respuestas de decisión frente a llama.cpp.
- La decodificación a contexto largo pierde rendimiento frente a llama.cpp (-24 % a 32k) y la concurrencia de 4 streams también (-17 %), lo que limita su uso en cargas de alta concurrencia.
- El máximo de tokens de salida está limitado a 4.096 por preset.
- Solo se soportan 4 peticiones concurrentes; no es adecuado para servir a muchos usuarios simultáneos.
- El rendimiento está medido exclusivamente en AMD Strix Halo; no hay datos para otras GPUs.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3.6-27B.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-07) sin validación comunitaria.

## Enlaces

- Paquete Loom: https://huggingface.co/loom-fun/ggml-org-Qwen3.6-27B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3.6-27B-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-27B
- Drafter DFlash: https://huggingface.co/Anbeeld/Qwen3.6-27B-DFlash-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Run de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42325903922
