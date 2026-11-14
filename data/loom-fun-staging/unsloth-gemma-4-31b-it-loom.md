# loom-fun-staging/unsloth-gemma-4-31B-it-loom

## Resumen

`loom-fun-staging/unsloth-gemma-4-31B-it-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF `gemma-4-31B-it-Q4_K_M.gguf` del repositorio `unsloth/gemma-4-31B-it-GGUF`. No se trata de un modelo entrenado por el autor del repositorio, sino de una distribucion precompilada (ficheros `.loom` y un `model.json`) generada con el flujo `loom-skills` para ejecutar el modelo base sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes practico esta en el rendimiento y las capacidades de servicio que anade Loom sobre el GGUF sin modificar: decodificacion especulativa DFlash con profundidad 3 activada por defecto (drafter `Anbeeld/gemma-4-31B-it-DFlash-GGUF`), API compatible con OpenAI en `/v1/chat/completions`, soporte de tool calling, modo de razonamiento opcional y una ventana de contexto por peticion de 53.248 tokens (36.864 en la R9700 por limite de memoria). El modelo base es un transformer de 31.000 millones de parametros con contexto nativo de 262.144 tokens, aunque Loom no expone vision ni audio.

El repositorio es un staging con 0 descargas y 0 likes en el momento de la consulta, con un tamano de 0,0 GB (los pesos se referencian desde el GGUF base, no se duplican). La model card incluye una tabla de rendimiento roofline para Strix Halo, pero las columnas de medidas reales de Loom y llama.cpp estan vacias ("— not measured"), por lo que no hay cifras de throughput publicadas. La licencia no se declara en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4); runtime Loom sobre GGUF |
| Parametros totales | 31 000 millones (31B, segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; 53.248 tokens por peticion en Loom (Strix Halo); 36.864 en Radeon AI PRO R9700 |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como programa `.loom` + `model.json` |
| Modelo base | `unsloth/gemma-4-31B-it-GGUF` |
| Drafter especulativo | `Anbeeld/gemma-4-31B-it-DFlash-GGUF` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Tokens de salida maximos | 4096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 31B en variante instruct (`it`), del que no se proporcionan detalles de arquitectura interna, composicion del dataset ni proceso de alineacion (RLHF/DPO) en la informacion disponible. El checkpoint empaquetado es la cuantizacion Q4_K_M publicada por Unsloth, sin modificaciones: Loom no altera los pesos, solo genera kernels y un manifiesto de despliegue especificos para las GPU AMD objetivo.

La innovacion tecnica del paquete reside en el runtime. Loom compila kernels para gfx1151 y gfx1201 y activa por defecto decodificacion especulativa DFlash con profundidad 3, usando un drafter separado del mismo modelo. La model card documenta tasas de aceptacion de tokens borrador del 46 % en decodificacion de contexto corto, 36 % a 2k tokens y 44 % a 32k tokens, medidas en la sesion de la propia prueba. El servidor usa espera activa (`completion_spin_ns=4294967295`) y limita el pool de memoria con `--memory_bytes` (80 GB en Strix Halo, 34 GB en la R9700), lo que determina el contexto maximo por peticion.

## Capacidades

- Generacion de texto conversacional e instructiva mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling y function calling con el esquema `tools` / `tool_calls` de OpenAI.
- Modo de razonamiento (thinking) desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificacion especulativa DFlash (profundidad 3) activada por defecto, con drafter dedicado.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con decodificacion agregada.
- Contexto por peticion de 53.248 tokens en Strix Halo y 36.864 en Radeon AI PRO R9700.
- Salida limitada a 4096 tokens por peticion (preset `max_tokens`).
- Vision: no soportada por Loom, aunque el modelo upstream la tenga.
- Audio de entrada y salida: no soportado por Loom, aunque el modelo upstream lo tenga.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable en esta integracion.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete se sirve en `127.0.0.1:8080` con API OpenAI, lo que permite conectar clientes existentes (SDK de OpenAI, LangChain, Continue) sin adaptadores, sobre una unica GPU Radeon AI PRO R9700 o un equipo Strix Halo.
- Procesamiento de documentos largos: con 53.248 tokens por peticion en Strix Halo se pueden analizar contratos, informes o expedientes completos en una sola pasada, sin troceado ni recuperacion externa.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` permite construir agentes que consulten bases de datos, APIs internas o el sistema de ficheros, manteniendo los datos en la maquina del usuario.
- Generacion de codigo asistida en IDE: el modelo instruct de 31B con contexto largo es adecuado para autocompletado y refactorizacion sobre repositorios medianos, integrable mediante la API compatible con OpenAI que consumen la mayoria de extensiones.
- Razonamiento paso a paso bajo demanda: activando `enable_thinking` se obtienen cadenas de razonamiento para tareas de matematicas, logica o analisis, y se desactiva para respuestas de baja latencia.
- Servicio multiusuario ligero: con 4 peticiones concurrentes y decodificacion agregada, el paquete sirve a un equipo pequeno en una sola GPU sin infraestructura de cluster.
- Evaluacion y prototipado de inferencia en ROCm: al incluir gates de correccion (`kernel_tests`, `golden`, `compare`) contra la referencia de llama.cpp, sirve para validar pipelines antes de migrar a produccion.

## Benchmarks y rendimiento

La model card publica una tabla de rendimiento para Strix Halo (gfx1151) con techos roofline calculados a 216 GB/s de ancho de banda y 59 TFLOP/s, pero las columnas de medidas reales de Loom y llama.cpp estan marcadas como "— not measured". Los unicos valores numericos son los techos teoricos:

| Metrica | Techo roofline (Strix Halo) | Loom medido | llama.cpp medido |
|---|---|---|---|
| Decodificacion, prompt corto (tok/s) | 27,9 | no medido | no medido |
| Decodificacion, contexto 2k (tok/s) | 23,3 | no medido | no medido |
| Decodificacion, contexto 32k (tok/s) | 22,9 | no medido | no medido |
| Prefill, documento 1k (tok/s) | 987,9 | no medido | no medido |
| Prefill, documento 2k (tok/s) | 969,3 | no medido | no medido |
| Prefill, documento 8k (tok/s) | 938,4 | no medido | no medido |
| Prefill, documento 16k (tok/s) | 900,8 | no medido | no medido |
| Prefill, documento 32k (tok/s) | 834,1 | no medido | no medido |
| 4 streams, decodificacion agregada (tok/s) | 42,2 | no medido | no medido |
| Tokens borrador aceptados | n/a | 46 % (corto), 36 % (2k), 44 % (32k) | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados "no se han vuelto a medir". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el paquete se sirve con `--memory_bytes=80000000000` (80 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en Radeon AI PRO R9700. El checkpoint Q4_K_M de 31B ocupa aproximadamente 18-19 GB de pesos, pero el pool incluye cache KV para contexto largo.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU AMD ni para NVIDIA.
- GPU de consumo: no disponible; no se menciona compatibilidad con Radeon RX de consumo ni con iGPU distintas de Strix Halo.
- Contexto maximo por memoria: 53.248 tokens en Strix Halo; 36.864 en R9700 por el limite de 34 GB del pool.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch` y servicio con `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete.
- Latencia y throughput: no medidos; solo techos roofline teoricos (ver seccion de benchmarks).
- Concurrencia: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-fun-staging/unsloth-gemma-4-31B-it-loom` | 31B | 262.144 nativo; 53.248 por peticion en Loom | GGUF Q4_K_M + `.loom` | no disponible | Solo GPU AMD Strix Halo y R9700; decodificacion especulativa DFlash |
| `unsloth/gemma-4-31B-it-GGUF` | 31B | 262.144 | GGUF | no disponible | Checkpoint upstream sin empaquetar; ejecutable con llama.cpp y otros runtimes GGUF |
| `Anbeeld/gemma-4-31B-it-DFlash-GGUF` | no disponible | no disponible | GGUF | no disponible | Drafter especulativo usado por el paquete Loom |

No se dispone de datos de rendimiento medidos para ninguno de los tres, por lo que la comparativa se limita a formato, contexto expuesto y compatibilidad de hardware.

## Limitaciones y advertencias

- Repositorio en staging: 0 descargas, 0 likes y creado el 2026-11-14, sin historial de uso en produccion.
- Licencia no declarada en el repositorio; antes de uso comercial debe verificarse la licencia del modelo base `unsloth/gemma-4-31B-it-GGUF`.
- Sin resultados de rendimiento medidos: todas las celdas de Loom y llama.cpp en la tabla de rendimiento estan vacias; no hay cifras de throughput reales.
- Gates de correccion no reejecutados en este paquete: `kernel_tests`, `golden` y `compare` pasaron en una build anterior (sha256 `ddfbe90`), no en esta.
- Vision y audio no soportados por Loom aunque el modelo upstream los tenga; el gate `vision` figura como no aplicable.
- Contexto efectivo reducido: 53.248 tokens en Strix Halo y 36.864 en R9700 frente a los 262.144 nativos del modelo.
- Salida limitada a 4096 tokens por peticion.
- Solo hardware AMD especifico (gfx1151 y gfx1201); no hay soporte documentado para NVIDIA ni para GPU de consumo.
- Concurrencia maxima de 4 peticiones, insuficiente para cargas multiusuario altas.
- Riesgo de alucinacion y sesgos del modelo base: no evaluados ni documentados en la informacion disponible.
- Idiomas soportados no declarados; no se puede confirmar cobertura multilingue mas alla de lo que ofrezca el modelo base.
- El resultado de la busqueda web sobre "Loom" corresponde a la herramienta de grabacion de pantalla y a una marca de ropa, sin relacion con este runtime; no se ha usado como fuente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-gemma-4-31B-it-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-4-31B-it-GGUF
- Drafter especulativo DFlash: https://huggingface.co/Anbeeld/gemma-4-31B-it-DFlash-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
