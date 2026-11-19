# loom-draft/unsloth-Qwen3.5-2B-loom

## Resumen

`loom-draft/unsloth-Qwen3.5-2B-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Qwen3.5-2B-Q4_K_M.gguf` de `unsloth/Qwen3.5-2B-GGUF` junto con programas `.loom` generados por `loom-next` (el generador, sin LLM en el bucle) y una tarjeta `model.json`. El objetivo es servir el modelo multimodal Qwen3.5-2B sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Qwen3.5-2B, un transformer de 2 000 millones de parametros con capacidad de vision (pipeline `image-text-to-text`), contexto declarado de 262 144 tokens por peticion y modo de razonamiento opcional. La relevancia de este paquete es que ofrece una via de inferencia nativa en ROCm/HIP para hardware AMD de consumo y profesional, con API compatible con OpenAI, soporte de tool calling e imagenes, y validacion cruzada contra llama.cpp mediante un conjunto de puertas de correctitud.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamano de 0.0 GB y fue creado el 2026-11-19. La licencia declarada es Apache 2.0. No se han publicado resultados de rendimiento ni de correctitud para este paquete concreto: la model card indica explicitamente que las mediciones "no se han vuelto a medir todavia" en ambas GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B); paquete de runtime Loom sobre GGUF |
| Parametros totales | 2 000 millones (2B, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262 144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-2B-Q4_K_M.gguf`) + programas `.loom` + `tokenizer.json` + `llm_config.json` |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reutiliza el checkpoint GGUF de `unsloth/Qwen3.5-2B-GGUF` sin modificaciones. La arquitectura del modelo subyacente es un transformer de 2B parametros con torre de vision separada, materializada en un proyector `mmproj-BF16.gguf`. El paquete Loom anade programas `.loom` generados automaticamente por `loom-next` que implementan los kernels de inferencia para las arquitecturas gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), junto con `model.json` y `model.json.lock` que fijan los ficheros fuente con verificacion sha256 mediante `loom-fetch`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. Tampoco se documentan innovaciones de decodificacion especulativa: la tabla de caracteristicas indica explicitamente "not applicable" para speculative decoding y para reasoning effort. El modo de razonamiento (thinking) esta desactivado por defecto y se activa con `chat_template_kwargs: {"enable_thinking": true}`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking opcional (desactivado por defecto).
- Entrada de imagenes en estilo OpenAI (`image_url`), con proyector BF16.
- Tool calling en formato OpenAI (`tools` y `tool_calls`).
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de 4 peticiones simultaneas.
- Limite de salida de 4 096 tokens por peticion (preset `max_tokens`).
- Contexto de 262 144 tokens por peticion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio (entrada o salida): no soportado.
- Decodificacion especulativa: no aplicable.

## Casos de uso

- Despliegue local en Strix Halo: servir Qwen3.5-2B en un Ryzen AI Max+ 395 mediante `loom-serve` con API OpenAI, util para prototipos de asistentes en hardware AMD integrado sin depender de CUDA.
- Inferencia en Radeon AI PRO R9700: usar los 32 GB de VRAM de la GPU profesional para servir el modelo Q4_K_M con proyector de vision y hasta 4 peticiones concurrentes, por ejemplo en un nodo de laboratorio.
- Procesamiento de documentos con imagenes: enviar capturas o escaneos como `image_url` y obtener descripciones o extraccion de texto, aprovechando el pipeline `image-text-to-text` y el contexto largo de 262k tokens.
- Agentes con tool calling: construir bucles multi-turno que invoquen funciones externas mediante `tools`/`tool_calls`, con el modo thinking desactivado para reducir latencia en produccion.
- Evaluacion comparativa frente a llama.cpp: usar las puertas de correctitud (`golden`, `compare`, `vision`, `agent`, `sampling`, `logits`) para verificar que la salida del runtime Loom coincide con la referencia de llama.cpp sobre el mismo GGUF.
- Integracion en pipelines de CI: ejecutar `loom-fetch` con verificacion sha256 de los ficheros fuente para garantizar reproducibilidad del artefacto desplegado.
- Analisis de imagenes en contexto largo: combinar documentos de hasta 262k tokens con imagenes intercaladas para tareas de resumen o respuesta a preguntas sobre material mixto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir todavia" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 2B parametros, mas el proyector BF16, por lo que el peso en memoria es reducido, pero no se publica una cifra concreta.
- Compatibilidad con GPUs NVIDIA (A100, H100, RTX 4090): no disponible; el paquete esta orientado a AMD via ROCm.
- Despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; opciones de linea de comandos documentadas: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`, `--materialize=copy`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp se usa unicamente como referencia de correctitud.
- Latencia y throughput: no disponibles (mediciones pendientes de re-ejecucion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Qwen3.5-2B (este paquete, Loom) | 2B | 262 144 | Si | Si | Apache 2.0 | Loom (ROCm, AMD) |
| unsloth/Qwen3.5-2B-GGUF | 2B | no disponible | no disponible | no disponible | no disponible | llama.cpp y otros |
| Modelos comparables de 2B con vision | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del paquete Loom ni de alternativas equivalentes en la informacion proporcionada, por lo que la comparativa se limita a parametros y capacidades declaradas.

## Limitaciones y advertencias

- Paquete sin mediciones publicadas: rendimiento y correctitud figuran como "not yet re-measured" en ambas GPUs objetivo; no hay evidencia registrada de las puertas de validacion.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Modelo base de 2B parametros: capacidad de razonamiento y conocimiento limitada en comparacion con modelos mayores; riesgo de alucinacion inherente a ese tamano.
- Limite de salida de 4 096 tokens por peticion, lo que restringe tareas de generacion larga.
- Concurrencia maxima de 4 peticiones; no apto para cargas de alta concurrencia sin escalado horizontal.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano.
- Dependencia de hardware AMD especifico (gfx1151, gfx1201) y de la version `hrx-loom[hf]==0.2.0`; no se documenta compatibilidad con otras GPUs.
- Sin soporte de audio ni decodificacion especulativa.
- La licencia Apache 2.0 aplica al paquete; las condiciones del checkpoint base deben verificarse en `unsloth/Qwen3.5-2B-GGUF`.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa) y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3.5-2B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
