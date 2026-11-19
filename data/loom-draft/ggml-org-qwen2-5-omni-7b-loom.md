# loom-draft/ggml-org-Qwen2.5-Omni-7B-loom

## Resumen

`loom-draft/ggml-org-Qwen2.5-Omni-7B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/Qwen2.5-Omni-7B-GGUF`, concretamente la cuantizacion `Qwen2.5-Omni-7B-Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado y compilacion de kernels orientado a ejecutar el modelo base de Qwen sobre GPUs AMD, generado con la herramienta `loom-next` (solo el generador, sin LLM en el bucle).

El modelo subyacente es Qwen2.5-Omni-7B, un modelo multimodal de la familia Qwen de Alibaba que acepta texto, imagen y audio y puede generar texto y audio. Sin embargo, esta variante Loom solo expone la ruta de texto a traves de una API compatible con OpenAI (`/v1/chat/completions`); la entrada de imagen y la entrada/salida de audio estan explicitamente marcadas como no soportadas por Loom en la tarjeta, aunque el modelo original si las tenga.

Su relevancia es de infraestructura mas que de modelado: demuestra un pipeline de generacion automatica de kernels y empaquetado para aceleradores AMD concretos (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201 con 32 GB), con verificacion criptografica de los ficheros fuente (sha256 mediante `loom-fetch`) y una bateria de puertas de correccion frente a llama.cpp. El repositorio tiene 0 descargas y 0 likes, y las mediciones de rendimiento y correccion figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal del modelo base Qwen2.5-Omni-7B (detalles internos no disponibles en la informacion proporcionada); el paquete Loom contiene kernels generados en programas `.loom` |
| Parametros totales | 7B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | `other` (heredada del modelo base; terminos concretos no disponibles) |
| Formato de pesos | GGUF (`Qwen2.5-Omni-7B-Q4_K_M.gguf`) empaquetado como `weights.loom` + `program/*.loom` + `tokenizer.json` + `llm_config.json` |

## Arquitectura y entrenamiento

El paquete no aporta entrenamiento propio: reutiliza el checkpoint GGUF `Qwen2.5-Omni-7B-Q4_K_M.gguf` de `ggml-org` sin modificarlo. La capa Loom consiste en programas `.loom` generados a partir de `llm_config.json`, un tokenizador (`tokenizer.json`) y un fichero de pesos (`weights.loom`), acompanados de `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`. El generador empleado es `loom-next`, ejecutado sin intervencion de un LLM.

El runtime Loom expone un servidor con API estilo OpenAI, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La tarjeta declara puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida con una referencia de llama.cpp registrada sobre el mismo GGUF, pero todas aparecen como "not yet re-measured" para ambas GPUs, por lo que no hay evidencia registrada de correccion en la informacion disponible. Tampoco se documentan datos de entrenamiento, composicion del dataset ni fases de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno mediante `/v1/chat/completions` con esquema compatible con OpenAI.
- Contexto de 32.768 tokens por peticion y hasta 4.096 tokens de salida (preset `max_tokens`).
- Concurrencia de 4 peticiones simultaneas.
- Tool calling: no aplicable segun la tarjeta.
- Razonamiento / thinking mode: no aplicable segun la tarjeta.
- Razonamiento con esfuerzo configurable (reasoning effort): no aplicable.
- Decodificacion especulativa: no aplicable en este paquete.
- Entrada de imagen: no soportada por Loom (el modelo original si la tiene).
- Entrada y salida de audio: no soportadas por Loom (el modelo original si las tiene).
- Muestreo (temperature, top_k, seed): estado "not determined" en la tarjeta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat de texto en hardware AMD de escritorio o estacion de trabajo: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite sustituir un backend de chat existente sin cambiar el cliente.
- Prototipado y evaluacion de la pila Loom frente a llama.cpp: las puertas de correccion (`golden`, `compare`, `logits`, `sampling`) estan disenadas para comparar token a token la salida con una referencia de llama.cpp sobre el mismo GGUF, util para validar kernels generados.
- Despliegue en entornos con GPU AMD Radeon AI PRO R9700 (32 GB): el empaquetado fija el pool de memoria por adelantado (`--pool_backing=fixed`), lo que facilita reservar VRAM de forma determinista en un servidor dedicado.
- Procesamiento por lotes de documentos de hasta 32k tokens: el contexto de 32.768 tokens permite resumir, extraer o clasificar textos largos en una sola peticion, con 4 peticiones concurrentes por instancia.
- Integracion en pipelines internos que ya hablan el protocolo de OpenAI: el endpoint `/v1/chat/completions` permite reutilizar SDKs y orquestadores existentes apuntando a `http://127.0.0.1:8080`.
- Evaluacion de la viabilidad de modelos multimodales en modo solo texto: aunque el modelo base soporta imagen y audio, este paquete permite medir el coste y el rendimiento de la ruta de texto antes de abordar las modalidades adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 7B y la tarjeta fija pools de memoria con `--pool_backing=fixed`, pero no se publica el tamano del pool.
- GPU soportadas segun la tarjeta: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo; las dos plataformas objetivo son APU de gama alta y GPU profesional AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch huggingface:loom-draft/ggml-org-Qwen2.5-Omni-7B-loom:chat --materialize=copy` y servicio con `loom-serve --model=qwen2.5-omni-7b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; la referencia de comparacion interna es llama.cpp.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/ggml-org-Qwen2.5-Omni-7B-loom` (este paquete) | 7B | 32.768 tokens | solo texto en Loom (imagen y audio no soportados) | `other` | Hugging Face, 0 descargas |
| `ggml-org/Qwen2.5-Omni-7B-GGUF` (base) | 7B | no disponible en la informacion proporcionada | texto, imagen y audio | no disponible | Hugging Face (checkpoint de origen) |
| llama.cpp sobre el mismo GGUF | 7B | no disponible en la informacion proporcionada | segun el modelo base | no disponible | referencia de correccion citada por la tarjeta |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La tarjeta no registra ninguna medicion de rendimiento ni evidencia de correccion: todas las puertas y las comparaciones con llama.cpp figuran como "not yet re-measured".
- La entrada de imagen y la entrada/salida de audio del modelo base no estan soportadas por Loom en este paquete, por lo que se pierden las capacidades multimodales del checkpoint original.
- Tool calling, thinking mode, reasoning effort y decodificacion especulativa estan marcados como "not applicable".
- El estado del muestreo (temperature, top_k, seed) figura como "not determined".
- La licencia es `other`; no se detallan en la informacion proporcionada los terminos exactos ni las restricciones de uso comercial, que dependen del modelo base.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-19), sin historial de uso.
- El despliegue esta ligado a dos plataformas AMD concretas (gfx1151 y gfx1201) y a la version `hrx-loom[hf]==0.2.0`; no se documenta portabilidad a otras GPUs.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen2.5-Omni-7B-loom
- Checkpoint base en Hugging Face: https://huggingface.co/ggml-org/Qwen2.5-Omni-7B-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
