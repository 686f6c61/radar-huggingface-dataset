# loom-draft/unsloth-Qwen3-VL-30B-A3B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF `Qwen3-VL-30B-A3B-Instruct-Q4_K_M.gguf` de Unsloth, que a su vez es una cuantizacion del modelo Qwen3-VL-30B-A3B-Instruct de Alibaba Qwen. El autor, `loom-draft`, publica los programas `.loom` generados con la herramienta `loom-next` (sin LLM en el bucle) junto con un `model.json` que actua como tarjeta del paquete. El objetivo es ejecutar el modelo en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la tarjeta Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia es de nicho pero clara: permite servir un modelo vision-lenguaje de 30B totales en arquitectura MoE (3B activos) sobre hardware AMD mediante el runtime Loom, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y una ventana de contexto de 262.144 tokens por peticion. No obstante, el paquete no incluye imagen como entrada (aunque el modelo original si la soporta), no implementa modo de razonamiento y no publica mediciones de rendimiento ni resultados de las puertas de correccion en esta version.

Conviene subrayar que la informacion disponible es escasa y procede casi toda de la model card del propio paquete. Los datos sobre el modelo subyacente (parametros, contexto, licencia) se infieren del identificador y de la ficha del checkpoint base, no de una model card detallada incluida en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el identificador del modelo base; detalles no disponibles |
| Parametros totales | 30B (segun el identificador `30B-A3B`) |
| Parametros activos | 3B (segun el identificador `A3B`) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base), empaquetado en programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Entrada de imagen | No soportada por Loom (el modelo original si la soporta) |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Modo razonamiento | No aplicable |
| Decodificacion especulativa | No aplicable |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-30B-A3B-Instruct, un transformer con mezcla de expertos de 30B parametros totales y 3B activos por token, con capacidades de vision y lenguaje. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si describe el repositorio es la capa de despliegue: los programas `.loom` generados por `loom-next` implementan los kernels y el grafo de ejecucion para las GPUs AMD objetivo. La model card menciona puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, pero en esta version todas aparecen como "not yet re-measured", es decir, sin evidencia registrada. El paquete incluye `tokenizer.json`, `llm_config.json`, `model.json` y `model.json.lock` con los hashes sha256 de los ficheros fuente.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI, con soporte de `tools` y `tool_calls`, segun la tabla de caracteristicas.
- Contexto largo: hasta 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Capacidad multimodal de vision presente en el modelo original, pero no expuesta por este paquete (la entrada de imagen figura como no soportada).
- Modo de razonamiento o thinking: no aplicable en este paquete.
- Entrada y salida de audio: no aplicable.
- Decodificacion especulativa: no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat sobre hardware AMD de consumo profesional: el paquete esta pensado para servir el modelo en Strix Halo o en una Radeon AI PRO R9700 mediante `loom-serve`, con API compatible con OpenAI, lo que permite sustituir un endpoint remoto por uno local.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion, encaja en tareas de resumen, extraccion y preguntas sobre contratos, informes o bases de codigo extensas.
- Agentes con tool calling: la tabla de caracteristicas confirma soporte de `tools` y `tool_calls`, y la puerta `agent` describe un bucle multi-turno de llamadas a herramientas, adecuado para asistentes que consultan APIs o bases de datos.
- Despliegue en estaciones de trabajo con GPU AMD: al estar empaquetado para gfx1151 y gfx1201, permite montar entornos de inferencia en equipos con esas arquitecturas sin depender de CUDA.
- Prototipado de asistentes con contexto largo y concurrencia moderada: las 4 peticiones simultaneas y los 4.096 tokens de salida por defecto sirven para equipos pequenos o demos internas.
- Evaluacion comparativa frente a llama.cpp: las puertas de correccion del paquete estan disenadas para contrastar token a token la salida de Loom con la referencia de llama.cpp sobre el mismo GGUF, util para validar el runtime antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo y para la Radeon AI PRO R9700 "are not yet re-measured", y que todas las puertas de correccion aparecen sin evidencia registrada.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 30B parametros, y la tarjeta R9700 tiene 32 GB, lo que sugiere que el paquete esta dimensionado para caber en ese limite.
- Cabe en GPU de consumo: si, en el APU Strix Halo y en la Radeon AI PRO R9700, segun los presets incluidos.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Opciones de servido: `--pool_backing=fixed` y `--parameter_mode=preload`, con `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este paquete (Qwen3-VL-30B-A3B-Instruct Q4_K_M, Loom) | 30B | 3B | 262.144 | `.loom` / GGUF | Apache 2.0 | Solo AMD gfx1151 y gfx1201; sin imagen; sin benchmarks publicados |
| unsloth/Qwen3-VL-30B-A3B-Instruct-GGUF | 30B | 3B | no disponible en esta ficha | GGUF | Apache 2.0 | Checkpoint base sin modificar; sirve como referencia de correccion |
| Qwen3-VL-30B-A3B-Instruct (original) | 30B | 3B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo completo con vision; este paquete no expone la entrada de imagen |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no expone la entrada de imagen aunque el modelo original sea vision-lenguaje; la tabla de caracteristicas marca `image input` como no soportado por Loom.
- No hay modo de razonamiento ni decodificacion especulativa en este paquete.
- Todas las puertas de correccion y las mediciones de rendimiento aparecen como "not yet re-measured": no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- El repositorio tiene 0 descargas y 0 likes, y se creo y actualizo el mismo dia (2026-11-19), lo que indica un artefacto recien generado y sin validacion externa.
- Dependencia de hardware muy concreta: solo se documentan presets para gfx1151 y gfx1201; no se garantiza funcionamiento en otras GPUs.
- La licencia Apache 2.0 permite uso comercial, pero el paquete depende del runtime Loom (`hrx-loom`) y de sus propios terminos, no detallados aqui.
- Riesgo de alucinacion y sesgos del modelo subyacente: no documentados en la informacion proporcionada.
- Los resultados de la busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa), por lo que no aportan informacion tecnica sobre este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-30B-A3B-Instruct-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/Qwen3-VL-30B-A3B-Instruct-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
