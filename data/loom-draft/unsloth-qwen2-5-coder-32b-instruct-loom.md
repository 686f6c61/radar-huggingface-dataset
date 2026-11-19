# loom-draft/unsloth-Qwen2.5-Coder-32B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue para el runtime AMD Loom del checkpoint GGUF `Qwen2.5-Coder-32B-Instruct-Q4_K_M.gguf` publicado por unsloth, que a su vez deriva del modelo Qwen2.5-Coder-32B-Instruct de Alibaba. El artefacto lo genera `loom-next` (sin intervención de un LLM en el bucle) y lo publica el usuario `loom-draft` bajo licencia Apache 2.0. Su propósito es ejecutar el modelo en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer decoder-only de 32.000 millones de parámetros, especializado en código, con 32.768 tokens de contexto por petición según la ficha del paquete, soporte de tool calling estilo OpenAI y una API compatible con `/v1/chat/completions`. El paquete incluye programas `.loom` generados, `weights.loom`, tokenizer, `llm_config.json` y un `model.json` con los ficheros fuente fijados por hash sha256.

La relevancia es acotada pero clara: permite servir un modelo de código de 32B en hardware AMD de consumo o estación de trabajo sin depender de CUDA ni de llama.cpp, con un servidor HTTP compatible con OpenAI. No obstante, el propio autor indica que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, etc.) aún no se han re-medido para este paquete, por lo que no hay evidencia publicada de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-32B-Instruct); empaquetado como programas Loom para AMDGPU |
| Parametros totales | 32.000 millones (32B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por petición (según preset del paquete); contexto nativo del modelo base no disponible en la información |
| Tipos de cuantizacion | Q4_K_M (único peso incluido: `Qwen2.5-Coder-32B-Instruct-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como `weights.loom` + programas `.loom`; tokenizer en `tokenizer.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si (formato `tools` / `tool_calls` de OpenAI) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-Coder-32B-Instruct, es un transformer decoder-only denso de 32B parámetros desarrollado por Alibaba, orientado a generación y comprensión de código. La información disponible en este repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card original de Qwen y no se reproducen aquí.

Lo específico de este paquete es la capa de despliegue: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) a partir de `llm_config.json` y del GGUF, y `loom-serve` los ejecuta sobre AMDGPU con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parámetros (`--parameter_mode=preload`). El paquete fija los ficheros fuente mediante sha256 en `model.json.lock`, verificado por `loom-fetch`. No se documentan innovaciones de decodificación especulativa, attention linear ni modos de razonamiento: la tabla de características marca estas capacidades como no aplicables.

## Capacidades

- Generación de texto y código en un modelo de 32B especializado en programación (Qwen2.5-Coder-32B-Instruct).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, lo que habilita bucles de agente multi-turno.
- Servidor HTTP compatible con la API de chat completions de OpenAI, con hasta 4 peticiones concurrentes.
- Ventana de 32.768 tokens por petición, suficiente para ficheros de código medianos y conversaciones multi-turno largas.
- Salida máxima de 4.096 tokens por respuesta según el preset.
- Sin modo de razonamiento/thinking, sin decodificación especulativa, sin entrada de imagen y sin entrada/salida de audio (marcados como no aplicables en la ficha).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en IDE o CLI: servir el modelo en local sobre Strix Halo o R9700 y conectarlo a un cliente compatible con OpenAI para autocompletado y explicación de código, sin enviar el código fuente a un tercero.
- Revisión de parches en CI: desplegar `loom-serve` en un runner con GPU AMD y lanzar peticiones sobre diffs de hasta 32k tokens para detectar errores evidentes antes del merge.
- Agente de refactorización con herramientas: usar el soporte de `tools`/`tool_calls` para que el modelo invoque operaciones de lectura y escritura de ficheros en un bucle controlado, con historial reutilizado entre turnos.
- Generación de tests unitarios: alimentar con el fichero de implementación y el contexto del proyecto para producir casos de prueba, aprovechando la ventana de 32k tokens.
- Documentación técnica automatizada: generar docstrings y documentación de API a partir de módulos completos en una sola petición.
- Migración de código entre lenguajes o frameworks: procesar ficheros completos y producir la versión traducida, con la salida limitada a 4.096 tokens por respuesta (puede requerir trocear ficheros grandes).
- Despliegue en estación de trabajo AMD sin CUDA: servir el modelo en una Radeon AI PRO R9700 de 32 GB para un equipo pequeño, con 4 peticiones concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured", es decir, sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: el peso Q4_K_M de un modelo de 32B ocupa aproximadamente 19-20 GB; a ello hay que sumar la caché KV para 32.768 tokens de contexto y el pool de memoria fijo que reserva `loom-serve`, por lo que se recomienda un mínimo de 24 GB y, preferiblemente, 32 GB.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPUs NVIDIA (A100, H100, RTX 4090) no están contempladas por el runtime Loom, que apunta a AMDGPU; para esas tarjetas habría que usar llama.cpp u otro runtime con el GGUF original.
- Cabe en GPU de consumo AMD con 24-32 GB de VRAM; en tarjetas de 16 GB no cabe con Q4_K_M y contexto completo.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`. Alternativamente, el GGUF original es compatible con llama.cpp, Ollama y otros runtimes GGUF.
- Latencia y throughput: no disponibles; el autor no ha re-medido las cifras para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime / disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Qwen2.5-Coder-32B-Instruct Q4_K_M, Loom) | 32B | 32.768 por peticion | Q4_K_M | Apache 2.0 | Solo AMDGPU via Loom; 0 descargas, 0 likes |
| unsloth/Qwen2.5-Coder-32B-Instruct-GGUF (origen) | 32B | no disponible en la informacion | Multiples GGUF | Apache 2.0 | llama.cpp, Ollama y otros runtimes GGUF |
| Qwen2.5-Coder-32B-Instruct (original) | 32B | no disponible en la informacion | safetensors y derivados | Apache 2.0 | vLLM, TGI, transformers |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de código de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (2026-11-19): es un artefacto recién generado, sin validación de la comunidad.
- Ninguna de las puertas de corrección tiene evidencia registrada: no hay prueba publicada de que la salida coincida con la referencia de llama.cpp en kernels, logits, tool calling ni concurrencia.
- No hay mediciones de rendimiento para este paquete en ninguna de las dos GPUs objetivo.
- El runtime está atado a `hrx-loom==0.2.0` y a hardware AMDGPU concreto (gfx1151, gfx1201); no es portable a NVIDIA ni a otras arquitecturas sin trabajo adicional.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens, lo que restringe cargas de trabajo de alto volumen o generaciones largas.
- Sin modo de razonamiento, sin visión y sin audio; no apto para tareas multimodales.
- Idiomas soportados no documentados en este paquete; conviene consultar la model card original de Qwen2.5-Coder antes de asumir cobertura multilingüe.
- Riesgo de alucinación y sesgos: inherentes al modelo base; no se documentan evaluaciones específicas en este repositorio.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que las condiciones del modelo base y del GGUF de unsloth se mantienen; la información disponible no incluye términos adicionales.
- No usar en producción sin ejecutar previamente las puertas de corrección (`gates.sh`) en el hardware objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen2.5-Coder-32B-Instruct-loom
- Modelo base GGUF (unsloth): https://huggingface.co/unsloth/Qwen2.5-Coder-32B-Instruct-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Resultados de búsqueda web: no relevantes (corresponden a Loom Inc., la herramienta de grabación de vídeo, y a la marca de ropa Loom; no guardan relación con este paquete).
