# loom-fun-staging/unsloth-Ornith-1.0-9B-loom

## Resumen

Ornith-1.0-9B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-fun-staging` a partir del checkpoint GGUF sin modificar `unsloth/Ornith-1.0-9B-GGUF` (concretamente el fichero `Ornith-1.0-9B-Q4_K_M.gguf`). No se trata de un modelo entrenado desde cero ni de un fine-tune, sino de un artefacto de empaquetado que permite servir un modelo multimodal de 9B parametros con cuantizacion Q4_K_M sobre GPUs AMD mediante el runtime `loom-serve` del ecosistema HRX Loom.

El objetivo del paquete es ofrecer una via de inferencia optimizada para hardware AMD de consumo y estaciones de trabajo: el AMD Ryzen AI Max+ 395 "Strix Halo" (iGPU gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es de tipo image-text-to-text, es decir, acepta imagenes y texto y genera texto, con soporte de razonamiento (thinking mode activado por defecto) y de tool calling estilo OpenAI.

La relevancia actual del paquete reside en que demuestra un stack alternativo a llama.cpp ROCm sobre GPUs AMD, con servidor compatible con la API `/v1/chat/completions` de OpenAI, contexto de hasta 262.144 tokens por peticion y concurrencia de 4 peticiones. La informacion publicada sobre el modelo base (arquitectura, datos de entrenamiento, benchmarks de calidad) es muy limitada en la model card, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; familia y detalles de transformer no documentados en la informacion proporcionada) |
| Parametros totales | 9B (segun el nombre del checkpoint `Ornith-1.0-9B`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (fichero `Ornith-1.0-9B-Q4_K_M.gguf`); proyector de vision `mmproj-F16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) + proyector multimodal GGUF F16; paquete Loom con `model.json` y programas `.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria configurada en ejemplo | 22.000.000.000 bytes (`--memory_bytes=22000000000`) |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base `Ornith-1.0-9B`: no se especifica si es un transformer denso, un MoE, un modelo hibrido ni el numero exacto de capas, cabezas de atencion o dimension del estado oculto. Lo unico confirmado es que se trata de un modelo multimodal de tipo image-text-to-text con 9B parametros, que emplea un proyector de vision separado (`mmproj-F16.gguf`) y que incorpora un modo de razonamiento (thinking) activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) ni innovaciones tecnicas del modelo base. Respecto al paquete Loom, la innovacion relevante es de infraestructura: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, servidor con API compatible con OpenAI, y un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`) que comparan la salida contra una referencia de llama.cpp token a token. En esta version del paquete esas puertas no se han vuelto a ejecutar (el ultimo pase fue sobre un build anterior, sha256 `622e7eb`).

## Capacidades

- Generacion de texto y razonamiento: modo thinking activado por defecto, desactivable por peticion.
- Entrada de imagenes: soporte de partes `image_url` estilo OpenAI, con proyector `mmproj-F16.gguf`.
- Tool calling: soporte de `tools` y `tool_calls` en formato OpenAI, con bucle de llamadas multi-turno validado por la puerta `agent`.
- Servidor compatible con `/v1/chat/completions` de OpenAI en `127.0.0.1:8080`.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Contexto largo: hasta 262.144 tokens por peticion.
- Concurrencia: 4 peticiones simultaneas con consistencia verificada frente a ejecuciones aisladas.
- Sin soporte de audio (entrada ni salida).
- Sin decodificacion especulativa (no hay cabeza MTP en el GGUF ni drafter publicado para este modelo).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con documentos e imagenes adjuntas gracias a la ventana de 262.144 tokens y al soporte de `image_url`, lo que permite adjuntar capturas o facturas en la conversacion.
- Analisis de documentos extensos con soporte visual: procesos de prefill de documentos de 1k a 32k tokens medidos en la roofline (4.243 tok/s a 1k, 3.702 tok/s a 32k en Strix Halo), adecuado para resumir contratos o informes con graficos embebidos.
- Agentes con tool calling: el paquete valida un bucle de tool calling multi-turno (`agent`) y expone `tools`/`tool_calls` estilo OpenAI, por lo que puede integrarse en orquestadores de agentes que consulten APIs externas.
- Asistente de razonamiento por pasos: el modo thinking por defecto permite tareas de analisis que requieren cadena de razonamiento, con la opcion de desactivarlo para respuestas de baja latencia.
- Despliegue en estacion de trabajo AMD: servir el modelo en una Radeon AI PRO R9700 de 32 GB con `loom-serve` y `--memory_bytes=22000000000` para entornos de desarrollo locales sin GPU NVIDIA.
- Procesamiento por lotes con concurrencia limitada: 4 peticiones simultaneas con salida identica a la ejecucion aislada (puerta `consistency`), util para pipelines de clasificacion o extraccion de datos con imagenes.
- Evaluacion comparativa de runtimes: usar el paquete como banco de pruebas para comparar Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento frente a llama.cpp, pero las columnas de llama.cpp y Loom estan sin medir (marcadas con `—`); solo se publican los valores de roofline (techo teorico del hardware) para Strix Halo. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

Roofline en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, 216 GB/s, 59 TFLOP/s):

| Metrica | Roofline |
|---|---|
| Decode tok/s, prompt corto | 42,2 |
| Decode tok/s, contexto 2k | 41,7 |
| Decode tok/s, contexto 32k | 35,0 |
| Prefill tok/s, documento 1k | 4.243,3 |
| Prefill tok/s, documento 2k | 4.223,4 |
| Prefill tok/s, documento 8k | 4.107,8 |
| Prefill tok/s, documento 16k | 3.963,1 |
| Prefill tok/s, documento 32k | 3.702,4 |
| 4 streams, decode agregado tok/s | 166,3 |
| Decodificacion especulativa, tokens aceptados | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" segun la model card. La comparacion directa con llama.cpp no aporta cifras porque ambas columnas estan vacias.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de servicio configura `--memory_bytes=22000000000` (22 GB) para el GGUF Q4_K_M de 9B mas el proyector de vision.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- En consumer GPU: no se documenta soporte para GPUs de consumo AMD o NVIDIA; el paquete esta generado especificamente para las arquitecturas AMD indicadas.
- Despliegue: runtime `loom-serve` del paquete `hrx-loom[hf]==0.1.0`; descarga con `loom-fetch`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: solo disponibles como roofline en Strix Halo (ver seccion anterior); las mediciones reales de Loom y llama.cpp no se registraron.

## Comparativa con modelos similares

No se dispone de datos de rendimiento medidos de este paquete ni de especificaciones detalladas de su modelo base, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. La unica comparacion documentada es de infraestructura: Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, pero las celdas de resultados estan sin medir.

| Aspecto | Ornith-1.0-9B-loom | llama.cpp ROCm (mismo GGUF) |
|---|---|---|
| Modelo | Ornith-1.0-9B Q4_K_M | Ornith-1.0-9B Q4_K_M |
| API | OpenAI `/v1/chat/completions` | servidor propio de llama.cpp |
| Contexto | 262.144 tokens | no disponible |
| Rendimiento medido | no registrado | no registrado |
| Hardware | gfx1151, gfx1201 | ROCm (build no registrado) |
| Licencia | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta la licencia del modelo base ni del paquete; no se puede confirmar el uso comercial.
- No se especifican los idiomas soportados ni la calidad multilingue.
- No hay benchmarks de calidad publicados (MMLU, HumanEval, GSM8K u otros); el rendimiento real de Loom frente a llama.cpp no esta medido en esta version.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`) no se han vuelto a ejecutar sobre este paquete; el ultimo pase corresponde a un build anterior (sha256 `622e7eb`).
- En Radeon AI PRO R9700 los resultados no se han vuelto a medir.
- Sin decodificacion especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.
- Salida maxima limitada a 4.096 tokens por peticion y concurrencia limitada a 4 peticiones.
- Sin soporte de audio.
- El repositorio tiene 0 descargas y 0 likes, y el autor es `loom-fun-staging` (entorno de staging); no hay evidencia de uso en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- El paquete esta atado a las arquitecturas AMD gfx1151 y gfx1201; no se garantiza su funcionamiento en otro hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Ornith-1.0-9B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Ornith-1.0-9B-GGUF
- Runtime Loom (ROCm HRX system): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
