# loom-fun/bartowski-Qwen3.8-27B-loom

## Resumen

`loom-fun/bartowski-Qwen3.8-27B-loom` es un paquete de despliegue para el runtime Loom sobre GPUs AMD (ROCm), no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `Q4_K_M` de `bartowski/Qwen3.8-27B-GGUF` junto con su proyector de vision (`mmproj-Qwen3.8-27B-f16.gguf`) en forma de programas `.loom` y una tarjeta `model.json`, generados con el flujo `loom-skills` sobre un AMD Ryzen AI Max+ 395 "Strix Halo". El objetivo es ofrecer inferencia multimodal (texto e imagen) con decodificacion especulativa activada por defecto en hardware AMD de consumo o estaciones compactas.

La innovacion principal es el uso del bloque MTP (NextN) propio del GGUF como drafter especulativo de profundidad 3, verificado en la misma pasada y valido hasta la ventana completa de 262.144 tokens. Segun la model card, cada token aceptado es una eleccion del propio modelo (greedy o muestreo con la misma semilla), de modo que la salida es identica a la decodificacion sin drafting. El paquete ocupa 16,2 GiB de pesos mas 0,9 GB de proyector y se sirve con un presupuesto de memoria de dispositivo de 45 GB, que cubre un pool KV de 327.680 posiciones compartido por 4 peticiones concurrentes.

Es relevante ahora porque demuestra que la decodificacion especulativa con MTP funciona en un stack alternativo a llama.cpp sobre ROCm, con ganancias claras en prefill (hasta +27 % en documentos de 2k tokens) aunque con perdidas en decode (entre -25 % y -32 %) frente a llama.cpp b1355. El modelo base Qwen3.8-27B aporta vision, tool calling, modo thinking y niveles de `reasoning_effort`, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B (detalles internos no disponibles) con bloque MTP (NextN) para drafting especulativo |
| Parametros totales | 27B (segun denominacion del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (pool KV de 327.680 posiciones para 4 peticiones concurrentes) |
| Tipos de cuantizacion | Q4_K_M (pesos); proyector de vision en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos no incluidos en el repo; se descargan via `loom-fetch`); paquete en programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

El paquete no entrena pesos: reutiliza el checkpoint `Q4_K_M` de `bartowski/Qwen3.8-27B-GGUF` sin modificarlo y anade un proyector de vision f16 del mismo repositorio para entrada de imagenes. Sobre esa base, `loom-skills` genera programas compilados para el runtime Loom y una tarjeta `model.json` con el presupuesto de memoria, el pool KV y la configuracion del drafter. La decodificacion especulativa emplea el bloque MTP (NextN) integrado en el GGUF con profundidad 3: el modelo propone 3 tokens por paso y los verifica en la misma pasada, en cualquier posicion hasta el limite de contexto.

La seleccion del metodo y la profundidad se hizo por medicion: Loom probo sin drafting, profundidades MTP 1-4 y el drafter DFlash2 de z-lab a profundidades 3, 5 y 7; llama.cpp probo sin drafting, `draft-mtp` con n-max 1-4 y `draft-dflash` con el mismo drafter a n-max 3, 5 y 7. Loom descarto DFlash2 (21,9 tok/s a profundidad 3) porque fallaba la comprobacion de concurrencia. En la puerta de equivalencia se acepto el 74 % de las propuestas. No se dispone de informacion sobre datos de entrenamiento, composicion del dataset ni fases de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Niveles de `reasoning_effort` propios de Qwen3.8.
- Entrada de imagen en formato OpenAI (`image_url` con data URLs) mediante el proyector de vision incluido.
- Tool calling y function calling a traves de la API `/v1/chat/completions` estilo OpenAI.
- Flujos de agente y razonamiento multi-paso (la model card menciona una prueba `agent` dentro de `loom-benchmark`).
- Decodificacion especulativa integrada y activada por defecto, con salida identica a la decodificacion sin drafting.
- Streaming de respuestas en el servidor local.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- **Asistente documental con imagenes**: el modelo acepta capturas, graficos y documentos densos junto al texto, lo que permite construir un asistente que responda preguntas sobre PDFs escaneados o dashboards sin un pipeline OCR separado.
- **Atencion al cliente multi-turno**: con 262.144 tokens de contexto y un pool KV para 4 peticiones concurrentes, puede mantener conversaciones largas con historial extenso y adjuntos de imagen en un unico servidor local.
- **Generacion de codigo en produccion**: el soporte de tool calling y la API compatible con OpenAI permiten integrarlo en pipelines de CI/CD o en agentes que invocan herramientas externas, con modo thinking para tareas de razonamiento.
- **Analisis de documentos largos en local**: la prueba de aguja en 260.171 tokens (build solo texto) y la de 61.440 tokens en este paquete respaldan casos de extraccion de informacion en contratos, informes o expedientes que caben en una sola ventana.
- **Despliegue en estacion AMD compacta**: el presupuesto de 45 GB encaja en un Ryzen AI Max+ 395 "Strix Halo", lo que permite montar un servidor de inferencia multimodal en hardware de escritorio sin GPU de datacenter.
- **Evaluacion de decodificacion especulativa**: util como banco de pruebas para comparar MTP y DFlash2 frente a llama.cpp en ROCm, con metricas de prefill, decode y concurrencia ya publicadas.
- **Prototipado de agentes con vision**: combinando tool calling, thinking y entrada de imagen se pueden construir agentes que inspeccionan capturas de pantalla y ejecutan acciones sobre APIs.

## Benchmarks y rendimiento

Decodificacion especulativa (greedy, thinking off, peticiones intensivas en decode):

| Implementacion | Metodo | Decode tok/s sin drafting | Decode tok/s con drafting |
|---|---|---|---|
| Loom (este paquete) | MTP del GGUF, profundidad 3 | 12,9 | 21,3 |
| llama.cpp ROCm b1355, mismo GGUF | DFlash2, n-max 3 | 12,0 | 28,1 |

Comparativa Loom frente a llama.cpp ROCm b1355 (ambos con drafting, mismas cargas):

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s (prompt corto, thinking on) | 22,0 | 15,7 | -29 % |
| Decode tok/s a 2k de contexto | 21,5 | 16,2 | -25 % |
| Decode tok/s a 32k de contexto | 22,6 | 15,4 | -32 % |
| Prefill tok/s, documento de 1k | 309 | 369 | +19 % |
| Prefill tok/s, documento de 2k | 309 | 393 | +27 % |
| Prefill tok/s, documento de 8k | 320 | 367 | +15 % |
| Prefill tok/s, documento de 16k | 297 | 325 | +10 % |
| Prefill tok/s, documento de 32k (33,4k tokens) | 268 | 265 | -1 % |
| 4 streams, agregado sostenido tok/s | 41,7-47,7 (dos ejecuciones) | 37,2 | -11 a -22 % |

Puertas de correctitud (`loom-benchmark`, `LEVEL=quick`): golden, compare, vision, consistency, spec, agent, sampling y aguja a media contexto, todas superadas. En equivalencia, 16/16 completions identicas frente a `draft_depth 0` (greedy y muestreo con semilla, prompt de 1k, tool call, respuesta de razonamiento y tres preguntas con imagen). Frente a llama.cpp, 18 de 24 prompts coinciden token a token (hasta 33.421 tokens) y todas las divergencias son casi empates (diferencia maxima de log-prob de 0,39). En imagenes, los recuentos de tokens de prompt son identicos y las respuestas coinciden token a token salvo casi empates. La aguja a contexto completo (260.171 tokens) se midio en el build solo texto; la de 61.440 tokens se reejecuto en este paquete y pasa; un prompt por encima de capacidad devuelve HTTP 400 sin degradar el servidor.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Presupuesto de memoria de dispositivo recomendado: 45 GB (`--memory_bytes=45000000000`), con asignacion bajo demanda.
- Pesos: 16,2 GiB (Q4_K_M) mas 0,9 GB de proyector de vision.
- Hardware de referencia: AMD Ryzen AI Max+ 395 "Strix Halo" con `--device=amdgpu` (ROCm).
- Compatibilidad con GPUs de datacenter (A100, H100) o consumer NVIDIA (RTX 4090): no disponible; el paquete esta orientado a AMD/ROCm.
- Opciones de despliegue: `loom-serve` con la API OpenAI (`/v1/chat/completions`) en `127.0.0.1:8080`. La comparativa de la model card usa llama.cpp ROCm b1355 como referencia.
- Throughput medido: 21,3 tok/s en decode con drafting, hasta 393 tok/s de prefill en documentos de 2k y 37,2 tok/s agregados con 4 streams.
- El coste de verificacion es el cuello de botella: el paso objetivo para 3-4 tokens cuesta 130 ms frente a 91 ms para 2 y 79 ms para 1 (medido con streams concurrentes y sin drafting).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun/bartowski-Qwen3.8-27B-loom | 27B | 262.144 | Paquete Loom con MTP y vision para AMD | Apache 2.0 | Hugging Face (pesos via `loom-fetch`) |
| bartowski/Qwen3.8-27B-GGUF | 27B | no disponible | Checkpoint GGUF base, sin runtime asociado | Apache 2.0 (heredada) | Hugging Face |
| llama.cpp ROCm b1355 con el mismo GGUF | 27B | 262.144 | Runtime generico con DFlash2 o `draft-mtp` | MIT (llama.cpp) | GitHub |
| z-lab/Qwen3.8-27B-DFlash2-GGUF | 27B (drafter) | no disponible | Drafter especulativo alternativo | no disponible | Hugging Face |

## Limitaciones y advertencias

- El paquete no incluye los pesos: hay que descargarlos con `loom-fetch` y verificar `model.json.lock`.
- Dependencia fuerte del hardware: esta pensado para AMD ROCm y el presupuesto de memoria de 45 GB; no hay datos de funcionamiento en NVIDIA.
- El decode con drafting es entre un 25 % y un 32 % mas lento que llama.cpp b1355 en las mismas cargas; la ventaja se limita al prefill hasta 16k.
- La concurrencia agregada con 4 streams es entre un 11 % y un 22 % inferior a llama.cpp.
- DFlash2 se descarto por fallar la comprobacion de concurrencia, pese a ser mas rapido en decode.
- La aguja a contexto completo (260.171 tokens) se midio en el build solo texto, no en este paquete con vision.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion disponible.
- Idiomas soportados no especificados; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- El numero de descargas y likes es cero y el repositorio se creo el 4 de noviembre de 2026, por lo que no hay validacion de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y del proyector deben verificarse en sus repositorios de origen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/bartowski-Qwen3.8-27B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Runtime Loom: https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
