# loom-fun-staging/bartowski-MiniCPM-V-4.7-35B-A3B-loom

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) que empaqueta el checkpoint GGUF `MiniCPM-V-4.7-35B-A3B-Q4_K_M.gguf` publicado por bartowski, a su vez derivado del modelo MiniCPM-V 4.7 35B-A3B. El paquete lo genera el flujo de trabajo `loom-skills` y lo publica la cuenta `loom-fun-staging` para ejecutarlo con el runtime Loom sobre GPUs AMD: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es un Mixture-of-Experts con 35 mil millones de parametros totales y 3 mil millones activos por token, cuantizado en Q4_K_M.

El problema que resuelve este paquete es la portabilidad: permite servir el mismo GGUF con una API compatible con OpenAI (`/v1/chat/completions`) en hardware AMD mediante ROCm, sin depender de llama.cpp. La model card reporta cifras de rendimiento frente a llama.cpp ROCm en Strix Halo, aunque la mayoria de las celdas de la tabla comparativa estan vacias y solo se publican los techos de roofline, no las mediciones reales.

Es relevante ahora porque el ecosistema Loom esta intentando ofrecer una alternativa de inferencia nativa para GPUs AMD con soporte de tool calling, modo de razonamiento y contexto de 262.144 tokens por peticion. Conviene tener en cuenta que el repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB en el momento de la consulta, y que la propia model card indica que varias puertas de validacion no se han vuelto a ejecutar sobre este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un MoE; la model card no detalla la arquitectura interna) |
| Parametros totales | 35B (segun el nombre del modelo base) |
| Parametros activos | 3B (segun el nombre del modelo base, sufijo A3B) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF dentro de un paquete Loom (`.loom` + `model.json`) |
| Modelo base | bartowski/MiniCPM-V-4.7-35B-A3B-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria configurada | 36.000.000.000 bytes (Strix Halo); 34.000.000.000 bytes (R9700) |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Entrada de imagen | no soportada por Loom (el modelo upstream si la tiene) |
| Entrada/salida de audio | no aplicable |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. El nombre `MiniCPM-V-4.7-35B-A3B` indica un transformer con mezcla de expertos (MoE) de 35B parametros totales y 3B activos por token, y el sufijo `-V` sugiere capacidades de vision en el modelo original. Sin embargo, la model card de este paquete no aporta detalles sobre el numero de capas, el numero de expertos, la dimension oculta ni el mecanismo de atencion.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Lo unico verificable es el proceso de empaquetado: el checkpoint GGUF de bartowski se ha convertido a un paquete Loom con kernels generados para las arquitecturas gfx1151 y gfx1201, y se sirve con espera activa (`completion_spin_ns=4294967295`). La model card menciona que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no esta disponible.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en formato compatible con OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Bucles de agente multi-turno con reutilizacion de historial, validados por la puerta `agent` de la model card.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Contexto de 262.144 tokens por peticion, adecuado para documentos largos.
- Concurrencia de 4 peticiones simultaneas.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: el modelo upstream la soporta, pero Loom no la implementa en este paquete (`image input: not supported by Loom`).
- Audio: no aplicable.
- Decodificacion especulativa: no aplicable (sin cabeza MTP ni drafter).
- Ajuste de esfuerzo de razonamiento: no aplicable.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens por peticion se puede cargar un manual tecnico completo o un historial extenso de conversacion y mantener coherencia sin truncar. Adecuado para soporte documental interno.
- Automatizacion de agentes con herramientas: el soporte de `tools` y `tool_calls` en formato OpenAI permite conectar el modelo a APIs internas, bases de datos o sistemas de ticketing dentro de un bucle multi-turno validado por la puerta `agent`.
- Procesamiento por lotes en estaciones AMD: al ejecutarse sobre Strix Halo o R9700 mediante ROCm, encaja en equipos de desarrollo sin GPU NVIDIA, con 4 peticiones concurrentes para tareas de clasificacion o resumen.
- Razonamiento con traza visible: el modo thinking activado por defecto sirve para depurar cadenas de razonamiento en tareas de analisis, y se puede desactivar para reducir latencia en produccion.
- Servicio local con API compatible con OpenAI: al exponer `/v1/chat/completions`, se puede apuntar cualquier cliente existente (SDKs de OpenAI, LangChain, etc.) al endpoint `127.0.0.1:8080` sin cambiar codigo.
- Evaluacion de la pila Loom frente a llama.cpp: util para equipos que quieran medir el rendimiento de kernels generados en gfx1151 o gfx1201 con el mismo GGUF y las mismas peticiones.
- Despliegue en estaciones de trabajo con 32 GB de VRAM: la configuracion de la R9700 reserva 34.000.000.000 bytes, por lo que encaja en tarjetas de 32 GB con el reparto indicado por el autor.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a llama.cpp ROCm en Strix Halo, pero las columnas de llama.cpp y Loom estan marcadas como no medidas (`—`). Solo se publican los techos de roofline calculados por `loom-roofline` para este GGUF sobre el Ryzen AI Max+ 395 (216 GB/s de ancho de banda y 59 TFLOP/s):

| Metrica | llama.cpp | Loom | Roofline | Loom % del roofline |
|---|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 78,5 | no disponible |
| Decode tok/s, contexto 2k | no medido | no medido | 77,4 | no disponible |
| Decode tok/s, contexto 32k | no medido | no medido | 63,4 | no disponible |
| Prefill tok/s, documento 1k | no medido | no medido | 11.902,0 | no disponible |
| Prefill tok/s, documento 2k | no medido | no medido | 11.708,5 | no disponible |
| Prefill tok/s, documento 8k | no medido | no medido | 10.668,0 | no disponible |
| Prefill tok/s, documento 16k | no medido | no medido | 9.537,8 | no disponible |
| Prefill tok/s, documento 32k | no medido | no medido | 7.870,2 | no disponible |
| 4 streams, decode agregado tok/s | no medido | no medido | 308,6 | no disponible |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a |

En la Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados "no se han vuelto a medir". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la configuracion de referencia usa `--memory_bytes=36000000000` (36 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en la Radeon AI PRO R9700 de 32 GB. El checkpoint es Q4_K_M, por lo que el peso de los pesos ronda los 20 GB y el resto corresponde a cache KV y buffers de contexto.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Son los dos objetivos declarados por el autor.
- GPU de consumo: no hay informacion sobre compatibilidad con GPUs de consumo AMD o NVIDIA. El runtime Loom de este paquete esta generado especificamente para gfx1151 y gfx1201.
- Opciones de despliegue: `loom-serve` con el runtime `hrx-loom[hf]==0.1.0`; el modelo se materializa con `loom-fetch` y se sirve con `--device=amdgpu://?completion_spin_ns=4294967295`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no medidos en la model card. Solo se dispone de los techos de roofline (78,5 tok/s de decode en prompt corto y 11.902 tok/s de prefill en documento de 1k en Strix Halo).
- Concurrencia maxima soportada: 4 peticiones simultaneas.

## Comparativa con modelos similares

No hay datos de rendimiento medidos que permitan una comparativa cuantitativa. La unica referencia directa es el propio GGUF de bartowski del que deriva este paquete.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun-staging/bartowski-MiniCPM-V-4.7-35B-A3B-loom | 35B totales / 3B activos | 262.144 tokens | Paquete Loom (GGUF Q4_K_M) | no disponible | Hugging Face, 0 descargas |
| bartowski/MiniCPM-V-4.7-35B-A3B-GGUF | 35B totales / 3B activos | no disponible en la informacion | GGUF | no disponible | Hugging Face (modelo base) |
| MiniCPM-V 4.7 35B-A3B (upstream) | 35B totales / 3B activos | no disponible en la informacion | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de licencia de las alternativas, por lo que no es posible establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- La entrada de imagen no esta soportada por Loom en este paquete, aunque el modelo upstream sea multimodal. Cualquier caso de uso con vision queda fuera.
- La decodificacion especulativa no esta disponible: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.
- El maximo de tokens de salida esta limitado a 4.096 por el preset `max_tokens`.
- La concurrencia esta limitada a 4 peticiones simultaneas.
- La licencia no esta disponible en la informacion proporcionada; no se puede confirmar el uso comercial sin consultar el repositorio del modelo base.
- Los idiomas soportados no estan documentados.
- La model card indica que las puertas de validacion `kernel_tests`, `golden`, `compare`, `consistency` y `agent` no se han vuelto a ejecutar sobre este paquete; el ultimo pase fue sobre una build anterior (sha256 `3996663`). En la R9700 no se ha vuelto a medir ninguna.
- Las cifras de rendimiento de la tabla comparativa estan vacias en las columnas de llama.cpp y Loom; solo se publican techos de roofline, no mediciones reales.
- El repositorio tiene 0 descargas, 0 likes y 0.0 GB de tamano en el momento de la consulta, lo que sugiere que el paquete puede no estar completamente subido o es un staging.
- El runtime esta generado para gfx1151 y gfx1201; no hay garantia de funcionamiento en otras arquitecturas AMD o NVIDIA.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El modelo base se distribuye como GGUF de bartowski; cualquier cambio de licencia o de pesos en el upstream afecta a este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-MiniCPM-V-4.7-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/MiniCPM-V-4.7-35B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
