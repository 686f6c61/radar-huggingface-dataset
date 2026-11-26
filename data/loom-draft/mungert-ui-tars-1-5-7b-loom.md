# loom-draft/Mungert-UI-TARS-1.5-7B-loom

## Resumen

UI-TARS-1.5-7B para AMD Loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Mungert/UI-TARS-1.5-7B-GGUF`, concretamente el fichero `UI-TARS-1.5-7B-q4_k_m.gguf`. Lo publica el usuario `loom-draft` y esta pensado para ejecutarse sobre la GPU integrada AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU discreta AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next` (el generador solo, sin LLM en el bucle).

El modelo subyacente es UI-TARS-1.5-7B, un modelo de 7.000 millones de parametros orientado a interaccion con interfaces de usuario (GUI agents) y tool calling, del que este repositorio solo redistribuye una cuantizacion Q4_K_M en formato GGUF. La relevancia de esta ficha no esta en el modelo en si, sino en el formato de empaquetado: Loom es un runtime alternativo a llama.cpp para GPUs AMD, con API compatible con OpenAI, y este paquete permite servir el modelo en hardware AMD consumer y profesional sin depender de CUDA.

No se dispone de informacion sobre el pipeline, los idiomas soportados ni los resultados de benchmarks del modelo base en la informacion proporcionada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye mediciones de rendimiento propias: todas las tablas de rendimiento y de correctitud aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base UI-TARS-1.5-7B; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | 7B (segun el nombre del checkpoint) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (fichero `UI-TARS-1.5-7B-q4_k_m.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programas `.loom` y `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | si (formato OpenAI `tools` y `tool_calls`) |
| Entrada de imagen | no soportada por Loom (el modelo upstream si la tiene) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo base UI-TARS-1.5-7B (tipo de transformer, atencion, composicion del dataset de entrenamiento, numero de tokens, si hubo RLHF o DPO). Lo unico documentado es el proceso de empaquetado: `loom-next` genera programas `.loom` y `weights.loom` a partir del GGUF original y de un `llm_config.json`, y `loom-fetch` verifica los ficheros fuente mediante sha256 contra `model.json.lock`.

La innovacion tecnica de este repositorio no esta en el modelo sino en el runtime Loom: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, lectura de logits en host (`llm.logits`), decodificacion especulativa (marcada como no aplicable en este paquete) y un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida token a token contra una referencia de llama.cpp sobre el mismo GGUF. En la informacion disponible, todas estas puertas figuran como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de tool calling multi-turno (existe una puerta de correctitud `agent` especifica para este caso).
- Contexto largo: 128.000 tokens por peticion, suficiente para documentos extensos o historiales de agente largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por respuesta.
- Razonamiento o modo thinking: no aplicable en este paquete.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream UI-TARS-1.5-7B si la tiene.
- Entrada y salida de audio: no determinado.
- Muestreo (temperature, top_k, seed): no determinado, aunque existe una puerta de correctitud `sampling` que valida su comportamiento frente a llama.cpp.

## Casos de uso

- Automatizacion de agentes GUI: UI-TARS esta disenado para interactuar con interfaces de usuario; con 128.000 tokens de contexto el agente puede mantener el historial completo de una sesion larga de navegacion o de escritorio sin truncar.
- Servicio de chat compatible con OpenAI en hardware AMD: al exponer `/v1/chat/completions`, se puede apuntar cualquier cliente que hable el protocolo OpenAI (SDKs oficiales, LangChain, LlamaIndex) al endpoint local sin cambios de codigo.
- Orquestacion de herramientas en pipelines internos: el soporte de `tools` y `tool_calls` permite conectar el modelo a funciones propias (consultas a bases de datos, APIs internas, ejecucion de comandos) en un bucle multi-turno validado por la puerta `agent`.
- Despliegue en estaciones de trabajo con GPU AMD: el paquete esta preparado para Strix Halo y Radeon AI PRO R9700, lo que permite servir el modelo en equipos sin CUDA y sin depender de llama.cpp.
- Prototipado de agentes con contexto largo: 128.000 tokens por peticion permiten pasar documentos completos o transcripciones extensas como contexto en una sola llamada, util para tareas de extraccion y resumen sobre material largo.
- Evaluacion comparativa de runtimes: las puertas de correctitud (`golden`, `compare`, `logits`, `sampling`) permiten verificar que la salida de Loom coincide token a token con llama.cpp sobre el mismo GGUF, lo que sirve para validar el runtime antes de mover cargas de produccion.
- Batch de hasta 4 peticiones concurrentes: adecuado para entornos de desarrollo, pruebas internas o servicios de baja concurrencia donde no se necesita un servidor de inferencia a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp no se han vuelto a medir ("the results for this package are not yet re-measured") tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201). Del mismo modo, todas las puertas de correctitud aparecen como "not yet re-measured", por lo que no hay evidencia registrada de equivalencia con la referencia de llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El unico dato concreto es que la Radeon AI PRO R9700 tiene 32 GB y que el paquete esta pensado para ella; la cuantizacion Q4_K_M de un modelo de 7B suele situarse en el entorno de 4-5 GB de pesos, pero este dato no lo confirma la model card.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se indica compatibilidad con GPUs consumer AMD distintas de las dos anteriores; no hay datos para NVIDIA ni para otras Radeon.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Opciones de linea de comandos documentadas: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `--device=amdgpu://?completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (las mediciones no se han vuelto a realizar).
- Alternativa de despliegue: al ser un GGUF estandar, el mismo fichero puede servirse con llama.cpp u otros runtimes compatibles con GGUF, aunque la model card no lo documenta como opcion soportada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, por lo que no es posible establecer una comparacion cuantitativa fiable con otros modelos de 7B orientados a agentes GUI o con otras distribuciones GGUF del mismo checkpoint.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y esta creado y actualizado el mismo dia (2026-11-26): no hay evidencia de uso en produccion.
- Ninguna de las puertas de correctitud tiene mediciones registradas; no hay prueba publicada de que la salida coincida con llama.cpp.
- No hay mediciones de rendimiento propias: se desconoce la latencia y el throughput reales en Strix Halo y en Radeon AI PRO R9700.
- La entrada de imagen no esta soportada por Loom aunque el modelo upstream si la tiene; cualquier caso de uso que dependa de vision no funcionara con este paquete.
- El razonamiento o modo thinking figura como no aplicable, y el muestreo y el audio como no determinados.
- La licencia es MIT, lo que permite uso comercial, pero se hereda del checkpoint base; conviene verificar las condiciones del modelo UI-TARS-1.5-7B original antes de redistribuir o desplegar en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base, que no se detallan.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar un comportamiento correcto fuera del ingles.
- Dependencia de un runtime poco extendido (Loom, version 0.2.0) y de dos arquitecturas AMD concretas; no hay soporte declarado para otras GPUs.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/Mungert-UI-TARS-1.5-7B-loom
- Checkpoint base en Hugging Face: https://huggingface.co/Mungert/UI-TARS-1.5-7B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
