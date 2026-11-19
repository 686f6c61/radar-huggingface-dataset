# loom-draft/unsloth-Ministral-3-14B-Instruct-2512-loom

## Resumen

Ministral-3-14B-Instruct-2512-loom es un paquete de despliegue en formato `.loom` para el checkpoint GGUF `Ministral-3-14B-Instruct-2512-Q4_K_M.gguf` de Unsloth, derivado a su vez del modelo Ministral-3-14B-Instruct-2512 de Mistral AI. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original sin modificar. Lo que aporta este repositorio es un conjunto de programas Loom generados con `loom-next` (sin intervención de un LLM en el bucle) que permiten servir el modelo en GPUs AMD concretas mediante el runtime `hrx-loom`.

El objetivo del paquete es ofrecer una ruta de inferencia nativa para hardware AMD que no depende de llama.cpp: el runtime Loom ejecuta kernels generados específicamente para las arquitecturas gfx1151 (Ryzen AI Max+ 395 "Strix Halo") y gfx1201 (Radeon AI PRO R9700, 32 GB). El repositorio expone una API compatible con OpenAI en `/v1/chat/completions`, con un tamaño de contexto configurado de 108.544 tokens por petición, concurrencia de 4 peticiones y un límite de 4.096 tokens de salida por preset.

La relevancia es acotada pero clara: cubre el nicho de despliegue local de un modelo de 14B en cuantización Q4_K_M sobre aceleradores AMD de consumo y workstation, con verificación de correctitud frente a llama.cpp prevista mediante gates (aunque en esta revisión ninguna medición está registrada todavía). El repositorio no tiene descargas ni likes en el momento de la consulta y su model card está incompleta (el bloque de archivos se corta a mitad de `llm_config.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint Ministral-3-14B-Instruct-2512; el paquete Loom no la documenta) |
| Parametros totales | 14B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 108.544 tokens por petición (configuración del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) + programas `.loom` y `weights.loom` generados |
| Salida maxima por peticion | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |
| Generador | `loom-next` (sin LLM en el bucle) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. El checkpoint subyacente es Ministral-3-14B-Instruct-2512 de Mistral AI, distribuido en formato GGUF por Unsloth; el paquete Loom no incluye información sobre número de capas, tipo de atención, composición del dataset de entrenamiento, número de tokens vistos ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación técnica del modelo original (por ejemplo, si emplea atención con ventana deslizante, decodificación especulativa u otros mecanismos).

Lo que sí describe el repositorio es la capa de ejecución: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF, junto con `tokenizer.json`, `llm_config.json` y un `model.json` con los ficheros fuente fijados por hash SHA-256 (verificado por `loom-fetch`). El runtime `loom-serve` ejecuta esos programas sobre AMDGPU mediante el esquema `amdgpu://`, con opciones como `completion_spin_ns=4294967295` (espera activa de completaciones en GPU), `--pool_backing=fixed` (reserva del pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). La model card indica explícitamente que no hay decodificación especulativa, tool calling ni modo de razonamiento en esta integración.

## Capacidades

- Generación de texto conversacional multi-turno a través de una API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 108.544 tokens por petición, adecuado para documentos largos o historiales extensos.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (configurable vía preset).
- Tool calling: no aplicable en esta integración Loom (la model card lo marca como "not applicable").
- Razonamiento / thinking mode: no aplicable en esta integración.
- Reasoning effort: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tiene según la propia model card.
- Entrada/salida de audio: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: servir el modelo con `loom-serve` sobre una Radeon AI PRO R9700 (32 GB) para un chatbot interno con contexto de hasta 108.544 tokens, sin depender de CUDA ni de llama.cpp.
- Procesamiento de documentos largos en local: resumen y extracción de información sobre contratos, informes o expedientes que quepan en la ventana de contexto configurada, manteniendo los datos en la máquina.
- Despliegue en equipos con Ryzen AI Max+ 395 "Strix Halo": prototipos de inferencia en un mini-PC o portátil con GPU integrada AMD, usando el preset `chat` del paquete.
- Evaluación comparativa de runtimes: usar los gates de correctitud (`golden`, `compare`, `consistency`) para contrastar la salida de Loom frente a la referencia de llama.cpp sobre el mismo GGUF, una vez se registren las mediciones.
- Backend de API interna compatible con OpenAI: integrar el endpoint `/v1/chat/completions` en herramientas que ya hablan el protocolo de OpenAI, con concurrencia de 4 peticiones para cargas ligeras de equipo.
- Reproducibilidad de despliegues: `loom-fetch` verifica los SHA-256 de los ficheros fuente, lo que permite fijar una versión exacta del paquete en pipelines internos.
- Pruebas de portabilidad AMD: validar el comportamiento de un modelo de 14B en cuantización Q4_K_M sobre gfx1151 y gfx1201 antes de comprometerse con un stack de inferencia propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Tampoco hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

Los gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todos como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 14B y el preset está pensado para GPUs de 32 GB (R9700) y para la memoria unificada del Strix Halo.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPUs NVIDIA ni otras AMD.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el hardware objetivo declarado son las dos plataformas AMD anteriores.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete (llama.cpp solo se usa como referencia de correctitud).
- Latencia y throughput: no disponibles; las tablas de rendimiento están pendientes de medición.
- Memoria: el preset permite `--pool_backing=fixed` para reservar el pool por adelantado y `--parameter_mode=preload` para precargar pesos en host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512-loom (este) | 14B | 108.544 tokens (preset Loom) | GGUF + `.loom` | Apache 2.0 | Solo AMD gfx1151 / gfx1201; sin tool calling ni visión en Loom |
| unsloth/Ministral-3-14B-Instruct-2512-GGUF | 14B | no disponible | GGUF | Apache 2.0 (heredada) | Checkpoint base sin modificar; portable a llama.cpp y otros runtimes GGUF |
| Ministral-3-14B-Instruct-2512 (original) | 14B | no disponible | safetensors (presumible) | Apache 2.0 | Modelo upstream de Mistral AI; incluye capacidades de visión según la model card |
| Alternativas de 14B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene pesos nuevos: es un paquete de despliegue sobre el GGUF de Unsloth. Cualquier limitación del modelo base (sesgos, alucinaciones, calidad en idiomas distintos del inglés) se hereda sin cambios.
- La model card está incompleta: el listado de archivos se corta a mitad de `llm_config.json`, y no se documentan arquitectura, idiomas ni datos de entrenamiento.
- Tool calling, modo de razonamiento, reasoning effort, decodificación especulativa y muestreo figuran como no aplicables o no determinados en esta integración, lo que descarta su uso en pipelines de agentes.
- La entrada de imagen no está soportada por Loom aunque el modelo upstream sí la tenga; no se puede usar como modelo multimodal en este paquete.
- Ningún gate de correctitud tiene mediciones registradas: no hay evidencia publicada de que la salida coincida con llama.cpp en esta versión.
- El soporte de hardware está restringido a gfx1151 y gfx1201; no se declara compatibilidad con otras GPUs AMD ni con NVIDIA.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-19): madurez y mantenimiento no verificables.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base de Mistral AI y del GGUF de Unsloth antes de desplegar en producción.
- El límite de 4.096 tokens de salida por petición puede ser insuficiente para tareas de generación larga sin ajustar el preset.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Ministral-3-14B-Instruct-2512-loom
- Checkpoint GGUF base (Unsloth): https://huggingface.co/unsloth/Ministral-3-14B-Instruct-2512-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
