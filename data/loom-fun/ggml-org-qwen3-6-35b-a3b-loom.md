# loom-fun/ggml-org-Qwen3.6-35B-A3B-loom

## Resumen

`loom-fun/ggml-org-Qwen3.6-35B-A3B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Qwen3.6-35B-A3B-Q4_K_M.gguf` de `ggml-org/Qwen3.6-35B-A3B-GGUF`. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado generado con el flujo `loom-skills` sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), pensado para ejecutarse con el servidor `loom-serve` del proyecto HRX de ROCm.

El modelo subyacente es Qwen3.6-35B-A3B, un transformer con arquitectura de mezcla de expertos (MoE) de 35 mil millones de parametros totales y 3 mil millones activos por token, con capacidades multimodales de entrada de imagen y una ventana de contexto de 262.144 tokens por peticion. El paquete anade decodificacion especulativa DFlash (profundidad 3) activada por defecto, con el drafter `magnitudedev/Qwen3.6-35B-A3B-DFlash-GGUF`, y expone una API compatible con OpenAI (`/v1/chat/completions`) con soporte de tool calling y modo de razonamiento.

Su relevancia es acotada pero concreta: demuestra una ruta de inferencia alternativa a llama.cpp sobre hardware AMD integrado (APU Strix Halo con memoria unificada), con ganancias medidas de hasta +120 % en prefill a 32k y +44 % en decodificacion con prompt corto, aunque con perdida de rendimiento (-4 %) en decodificacion a 32k de contexto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); multimodal (entrada de imagen) |
| Parametros totales | 35B (segun el nombre del checkpoint Qwen3.6-35B-A3B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint principal); drafter DFlash en Q8_0; proyector de vision mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa Loom con tarjeta `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto |
| Memoria reservada | `--memory_bytes=41000000000` (41 GB) en el ejemplo de arranque |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento del modelo base; toda la informacion de arquitectura disponible se refiere al artefacto de despliegue. El checkpoint subyacente es un MoE de 35B parametros totales con 3B activos, con torre de vision servida mediante el proyector `mmproj-Qwen3.6-35B-A3B-BF16.gguf`, el mismo que usa llama.cpp. El paquete Loom compila kernels especificos para gfx1151 y los valida contra implementaciones de referencia (32/32 tests de kernel superados), ademas de comparar la salida greedy token a token contra llama.cpp sobre el mismo GGUF.

La innovacion tecnica del paquete es la integracion de decodificacion especulativa DFlash con profundidad 3 y un drafter separado en Q8_0, con una tasa de aceptacion medida del 57 % de tokens propuestos. Segun la model card, la decodificacion especulativa activada produce exactamente la misma salida que desactivada (gate `spec` superado). El rendimiento se situa entre el 15 % y el 55 % del limite roofline calculado para el hardware (216 GB/s de ancho de banda y 59 TFLOP/s), lo que indica margen de optimizacion considerable en el motor.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes mediante partes `image_url` al estilo OpenAI, con el proyector mmproj BF16.
- Tool calling al estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno validado en el gate `agent`.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Procesamiento concurrente de hasta 4 peticiones con consistencia verificada frente a ejecuciones aisladas.
- Decodificacion especulativa DFlash activada por defecto.
- No soporta audio ni entrada/salida de voz. No soporta "reasoning effort" (niveles de esfuerzo de razonamiento).

## Casos de uso

- Asistente conversacional con documentos largos: la ventana de 262.144 tokens permite ingestas de decenas de miles de tokens en una sola peticion; el gate `needle` valida recuperacion de informacion hasta la mitad del contexto frente a llama.cpp.
- Procesamiento de documentacion tecnica con imagenes: diagramas, capturas de pantalla o tablas escaneadas pueden enviarse como `image_url` junto al texto para extraccion o explicacion.
- Agente con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle multi-turno validado permiten construir agentes que consulten APIs o ejecuten acciones sin salir de la maquina.
- Despliegue en estaciones de trabajo AMD sin GPU dedicada: el paquete esta optimizado para APU Strix Halo con memoria unificada, reservando 41 GB, lo que evita depender de VRAM discreta.
- Prototipado de pipelines RAG: el prefill medido a 8k documentos (2.154 tok/s) y 16k (1.993 tok/s) hace viable indexar y responder sobre lotes de fragmentos en una unica pasada.
- Evaluacion comparativa de motores de inferencia: sirve como banco de pruebas reproducible para medir Loom frente a llama.cpp con el mismo GGUF, mismo proyector y mismas condiciones de hardware.
- Generacion de codigo y razonamiento paso a paso en local, con el modo thinking activado por defecto y desactivable cuando se prioriza latencia.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-06 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 26.04, hrx-loom 0.1.0. Mismo GGUF en ambos motores; llama.cpp build `llamacpp-rocm/b1369`.

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 54,1 | 78,0 | +44 % | 140,6 | 55 % |
| Decode tok/s, contexto 2k | 48,4 | 61,7 | +27 % | 139,2 | 44 % |
| Decode tok/s, contexto 32k | 44,9 | 43,2 | -4 % | 121,5 | 36 % |
| Prefill tok/s, documento 1k | 1.103,2 | 1.753,6 | +59 % | 11.902,0 | 15 % |
| Prefill tok/s, documento 2k | 1.142,8 | 1.964,4 | +72 % | 11.708,5 | 17 % |
| Prefill tok/s, documento 8k | 1.164,4 | 2.154,5 | +85 % | 10.668,0 | 20 % |
| Prefill tok/s, documento 16k | 999,6 | 1.993,2 | +99 % | 9.537,8 | 21 % |
| Prefill tok/s, documento 32k | 813,0 | 1.787,5 | +120 % | 7.870,2 | 23 % |
| 4 streams, decode agregado tok/s | 124,0 | 133,6 | +8 % | 252,6 | 53 % |
| Tokens especulativos aceptados | — | 57 % | — | n/a | n/a |

Notas metodologicas de la model card: Loom usa temporizacion en cliente y llama.cpp en servidor; valores de decode y prefill son media de 1-2 ejecuciones, y 4 streams es mediana de 3. El roofline se calcula con `loom-roofline` a 216 GB/s y 59 TFLOP/s, aplicando un factor de ×2,71 tokens por pasada de verificacion (1 + 57 % aceptados × profundidad 3), sin contar el coste del drafter. No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de arranque reserva `--memory_bytes=41000000000` (41 GB). En APU con memoria unificada esa cifra se reparte entre memoria del sistema y grafica.
- GPU objetivo: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 (gfx1151, "Strix Halo"). El paquete esta compilado para `--device=amdgpu`.
- GPU dedicadas: no disponible; no se documenta compatibilidad con A100, H100 ni RTX 4090.
- Consumer GPU: no disponible; el artefacto esta orientado a APUs AMD, no a tarjetas discretas.
- Despliegue: `loom-serve` del paquete `hrx-loom[hf]` (instalacion via `pip install "hrx-loom[hf]"`), con descarga mediante `loom-fetch`. Alternativa de referencia: llama.cpp con ROCm (`-ngl 99`, `--mmproj`, `--spec-type draft-dflash`, `--spec-draft-n-max 7`, `-np 4`, `-c 35024`).
- Throughput: 78 tok/s en decode con prompt corto, 43,2 tok/s a 32k de contexto, 133,6 tok/s agregados con 4 streams.
- Prefill: entre 1.753 y 2.154 tok/s en documentos de 1k a 8k; 1.787 tok/s a 32k.
- Latencia: no disponible de forma explicita; puede derivarse de los tok/s anteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `loom-fun/ggml-org-Qwen3.6-35B-A3B-loom` | 35B | 3B | 262.144 | GGUF Q4_K_M + Loom | no disponible | Paquete de despliegue para AMD Strix Halo, con DFlash y vision |
| `ggml-org/Qwen3.6-35B-A3B-GGUF` | 35B | 3B | 262.144 (via runtime) | GGUF | no disponible | Checkpoint base sin empaquetar; referencia de correccion del paquete |
| `loom-fun/unsloth-Qwen3.6-35B-A3B-loom` | 35B | 3B | 262.144 | GGUF Q4_K_M + Loom | no disponible | Mismo flujo Loom sobre el checkpoint de unsloth en lugar del de ggml-org |
| `Qwen/Qwen3.6-35B-A3B` | 35B | 3B | no disponible | safetensors (pesos originales) | no disponible | Modelo original de Qwen; pesos de referencia para cuantizar |

## Limitaciones y advertencias

- El repositorio no declara licencia. No hay base explicita para uso comercial; debe verificarse la licencia del modelo base Qwen3.6-35B-A3B y del checkpoint ggml-org antes de cualquier despliegue en produccion.
- No se declaran idiomas soportados en la ficha de Hugging Face; el soporte multilingue real depende del modelo base y no esta documentado aqui.
- El gate `agent_think_off` (bucle de tool calling con thinking desactivado) figura como "sin evidencia": no hay validacion de ese modo de uso.
- El gate `needle_full` (recuperacion a contexto completo) figura como "sin evidencia": solo se valida hasta la mitad del contexto. Peticiones por encima de capacidad se rechazan.
- El rendimiento a 32k de contexto en decodificacion es un 4 % inferior a llama.cpp; el motor pierde ventaja a medida que crece el contexto.
- La tasa de aceptacion especulativa del 57 % y las cifras de roofline excluyen el coste del drafter, por lo que el rendimiento efectivo puede ser inferior al reportado.
- Las mediciones son de una unica maquina y una unica configuracion (Strix Halo, Ubuntu 26.04, hrx-loom 0.1.0); no hay datos de otras GPU.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base Qwen3.6-35B-A3B.
- La cuantizacion Q4_K_M introduce perdida de precision frente a los pesos originales; el paquete valida equivalencia con llama.cpp, no con el modelo en BF16.
- El proyecto Loom (HRX, ROCm) esta en version 0.1.0, lo que implica madurez limitada del runtime para produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/ggml-org-Qwen3.6-35B-A3B-loom
- Checkpoint base GGUF: https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Drafter DFlash: https://huggingface.co/magnitudedev/Qwen3.6-35B-A3B-DFlash-GGUF
- Paquete Loom alternativo (unsloth): https://huggingface.co/loom-fun/unsloth-Qwen3.6-35B-A3B-loom
- Repositorio HRX system (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
