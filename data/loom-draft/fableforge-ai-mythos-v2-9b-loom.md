# loom-draft/fableforge-ai-Mythos-V2-9B-loom

## Resumen

Mythos-V2-9B-loom es un paquete de despliegue publicado por el usuario `loom-draft` para el runtime AMD Loom, no un modelo entrenado de nuevo. Empaqueta el checkpoint GGUF sin modificar `mythos-v2-9b-Q4_K_M.gguf` del modelo base `fableforge-ai/Mythos-V2-9B-GGUF` en forma de programas `.loom` y un fichero `model.json`, generados con la herramienta `loom-next` (sin intervención de un LLM en el proceso de generación). El objetivo es ejecutar ese GGUF de 9B parámetros sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el servidor `loom-serve`, que expone una API compatible con OpenAI.

El interés técnico del paquete reside en el backend: kernels generados para ROCm, decodificación especulativa MTP con profundidad 3 activada por defecto, soporte de tool calling estilo OpenAI, modo de razonamiento (thinking) activable y una ventana de contexto declarada de 262.144 tokens por petición con hasta 4 peticiones concurrentes. La licencia es Apache 2.0 y el repositorio ocupa 0,0 GB en el momento de la consulta, con cero descargas y cero likes.

La información disponible es limitada: el autor no ha publicado resultados de rendimiento ni de corrección para este paquete (todas las celdas de las tablas de performance y de gates de correctitud figuran como "not yet re-measured"), no se detallan los idiomas soportados y no hay ficha técnica del modelo base en los datos proporcionados. Cualquier cifra de benchmarks o de arquitectura interna del modelo subyacente debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Mythos-V2-9B; el paquete solo aporta kernels y runtime Loom) |
| Parametros totales | 9B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mythos-v2-9b-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Modelo base | fableforge-ai/Mythos-V2-9B-GGUF |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| GPU objetivo | AMD Ryzen AI Max+ 395 Strix Halo (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Tool calling | si, estilo OpenAI (`tools` / `tool_calls`) |
| Entrada de imagen | no soportada por Loom (el modelo upstream sí la tiene) |
| Entrada/salida de audio | no aplicable |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica pesos: toma el GGUF Q4_K_M del modelo base y genera, mediante `loom-next`, un conjunto de programas `.loom` (incluido `weights.loom`) más un `model.json` con los ficheros fuente fijados por hash SHA-256, que `loom-fetch` verifica. La arquitectura del transformer subyacente, el número de tokens de entrenamiento, la composición del dataset y si hubo RLHF o DPO no se detallan en la información proporcionada.

La innovación destacable está en el runtime: kernels generados específicamente para las arquitecturas AMD gfx1151 y gfx1201, decodificación especulativa basada en MTP con profundidad 3, un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El autor declara gates de correctitud frente a llama.cpp (tokens greedy, top-5 log-probs, consistencia bajo concurrencia, equivalencia de la decodificación especulativa, bucles de tool calling), pero ninguno tiene medición registrada en esta versión del paquete.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Bucles de agente multi-turno con reutilización de historial (gate `agent` definido, sin medición publicada).
- Contexto largo: hasta 262.144 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Decodificación especulativa MTP (profundidad 3) para acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: el modelo upstream la soporta, pero Loom no la implementa en este paquete.
- Audio: no aplicable.

## Casos de uso

- Despliegue local en estaciones con Strix Halo: el paquete permite servir el modelo en un Ryzen AI Max+ 395 sin depender de CUDA, usando `loom-serve` con API OpenAI y contexto de 262.144 tokens para asistentes de escritorio o laboratorio.
- Servicio en GPU de 32 GB: en una Radeon AI PRO R9700 el GGUF Q4_K_M de 9B cabe holgadamente, lo que permite atender hasta 4 peticiones concurrentes con decodificación especulativa MTP activa.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` y el modo thinking permiten construir asistentes que consultan APIs, ejecutan búsquedas o encadenan pasos, con la salvedad de que los gates de agente no están medidos en esta versión.
- Procesado de documentos largos: la ventana de 262.144 tokens admite resumir, extraer o responder preguntas sobre contratos, informes o bases de código extensas en una sola petición.
- Evaluación comparativa de backends AMD: el paquete está pensado para contrastar su rendimiento y corrección frente a llama.cpp sobre el mismo GGUF, útil en laboratorios que validan stacks ROCm.
- Integración en pipelines internos vía HTTP: al exponer una API compatible con OpenAI en `127.0.0.1:8080`, se puede conectar a clientes existentes (SDKs de OpenAI, orquestadores de agentes) sin adaptadores propios.
- Prototipado de asistentes con razonamiento conmutable: activar o desactivar thinking por petición permite equilibrar latencia y calidad según la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las tablas de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) figuran explícitamente como "not yet re-measured", y todos los gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen sin medición registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de 9B ocupa típicamente en torno a 5-6 GB de pesos, pero el autor no publica la cifra ni el overhead del pool de memoria de Loom.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se confirma compatibilidad con GPUs de consumo; solo se documentan las dos plataformas AMD anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Flags relevantes: `--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Mythos-V2-9B-loom (este paquete) | 9B | 262.144 | Loom (ROCm, gfx1151/gfx1201) | Apache 2.0 | Paquete de despliegue, sin benchmarks publicados |
| fableforge-ai/Mythos-V2-9B-GGUF (base) | 9B | no disponible | llama.cpp y otros | no disponible | Checkpoint GGUF original; soporta visión según la model card |
| llama.cpp sobre el mismo GGUF | 9B | no disponible | llama.cpp | según el modelo base | Referencia de corrección usada por los gates de Loom |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni de correctitud: todas las tablas del autor están pendientes de re-medición, por lo que no hay evidencia publicada de que los kernels generados coincidan con llama.cpp.
- La entrada de imagen no está soportada por Loom aunque el modelo upstream sí la tenga; no se puede usar visión a través de este paquete.
- Solo se documentan dos plataformas AMD (gfx1151 y gfx1201); no hay garantía de funcionamiento en otras GPUs.
- El límite de salida está fijado en 4.096 tokens por preset, muy por debajo de la ventana de contexto de 262.144 tokens.
- Solo 4 peticiones concurrentes, lo que limita el uso como servicio multiusuario.
- Idiomas soportados no disponibles; no se puede evaluar la calidad en castellano sin pruebas propias.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (2026-11-19), sin historial de validación por la comunidad.
- La licencia Apache 2.0 se aplica al paquete, pero conviene verificar la licencia del modelo base antes de uso comercial.
- El modelo base y el generador `loom-next` son dependencias externas cuyo estado de mantenimiento no se detalla.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/fableforge-ai-Mythos-V2-9B-loom
- Modelo base GGUF: https://huggingface.co/fableforge-ai/Mythos-V2-9B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
