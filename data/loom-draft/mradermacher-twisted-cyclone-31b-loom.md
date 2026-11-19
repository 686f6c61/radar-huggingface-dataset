# loom-draft/mradermacher-Twisted-Cyclone-31B-loom

## Resumen

Twisted-Cyclone-31B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `mradermacher/Twisted-Cyclone-31B-GGUF`, concretamente la variante `Twisted-Cyclone-31B.Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado a su ejecucion en las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo: es un artefacto de empaquetado generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle.

El proposito del paquete es permitir servir el modelo sobre hardware AMD mediante `hrx-loom` (version 0.2.0), exponiendo una API compatible con OpenAI (`/v1/chat/completions`). El modelo subyacente tiene 31 mil millones de parametros y se distribuye en cuantizacion Q4_K_M; el paquete declara una ventana de contexto de 53.248 tokens por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, un tamano de 0,0 GB y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured" en la propia model card. Por tanto, la informacion disponible es escasa y procede casi exclusivamente de la tarjeta del autor y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 31B; arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | 31 mil millones (31B, segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 53.248 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (checkpoint base); paquete Loom con `model.json` y programas `.loom` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Twisted-Cyclone-31B (tipo de transformer, atencion, capas, etc.) ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). La model card del paquete Loom unicamente identifica el checkpoint GGUF de origen (`mradermacher/Twisted-Cyclone-31B-GGUF`, variante Q4_K_M) y describe el empaquetado, no el entrenamiento.

Lo que si se documenta es el proceso de generacion del paquete: se produce con `loom-next`, el generador del ecosistema Loom, a partir del GGUF sin modificaciones. El paquete incluye `model.json` y `model.json.lock` con los ficheros de origen fijados y verificados por sha256 mediante `loom-fetch`. Las innovaciones tecnicas descritas pertenecen al runtime, no al modelo: espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de pesos en host (`--parameter_mode=preload`). En la tabla de caracteristicas se indica que la decodificacion especulativa y el "reasoning effort" no son aplicables.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno de llamadas a herramientas segun las puertas de correccion descritas (`agent`, `agent_think_off`).
- Modo de razonamiento/thinking opcional: desactivado por defecto y se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Concurrencia de 4 peticiones simultaneas y ventana de 53.248 tokens por peticion.
- Entrada de imagen y audio: no soportadas por Loom, aunque la model card indica que el modelo de origen las tiene.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (sampling): estado "no determinado" en la tabla de caracteristicas.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: servir el paquete con `loom-serve` en una Radeon AI PRO R9700 (32 GB) y consumir la API `/v1/chat/completions` desde una aplicacion interna, aprovechando la ventana de 53.248 tokens para conversaciones largas.
- Automatizacion de agentes con herramientas: el soporte de `tools`/`tool_calls` permite construir bucles de razonamiento multi-paso que invocan funciones externas (consultas a bases de datos, APIs internas) con historial reutilizado entre turnos.
- Generacion de codigo asistida en entornos AMD: usar el endpoint compatible con OpenAI como backend de plugins de IDE o pipelines de CI/CD que necesiten completar o revisar codigo, con thinking opcional para tareas que requieran razonamiento explicito.
- Procesamiento de documentos largos en local: con 53.248 tokens de contexto por peticion se pueden resumir o extraer informacion de documentos extensos sin salir de la maquina, evitando enviar datos a servicios en la nube.
- Despliegue en hardware consumer/workstation AMD sin CUDA: el paquete esta especificamente preparado para Strix Halo (gfx1151) y R9700 (gfx1201), lo que permite ejecutar un modelo de 31B en Q4_K_M en equipos AMD de gama alta.
- Evaluacion comparativa frente a llama.cpp: las puertas `golden`, `compare` y `logits` estan disenadas para contrastar la salida del runtime Loom con la referencia de llama.cpp sobre el mismo GGUF, lo que hace del paquete una base para validar fidelidad numerica en produccion.
- Servicio interno con concurrencia moderada: 4 peticiones concurrentes y 4.096 tokens de salida por preset encajan en escenarios de equipo pequeno o prototipado, no en servicios de alta carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es un modelo de 31B en Q4_K_M; el paquete esta pensado para la Radeon AI PRO R9700 con 32 GB y para Strix Halo (Ryzen AI Max+ 395), cuya memoria unificada permite alojar el modelo.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete esta orientado a hardware AMD; no se documenta compatibilidad con GPU consumer NVIDIA ni con CUDA.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete, aunque llama.cpp se usa como referencia de correccion.
- Latencia y throughput: no disponibles; las mediciones estan pendientes de re-medicion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas del modelo base que permitan una comparacion fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y un tamano de 0,0 GB; se trata de un artefacto recien creado (19 de noviembre de 2026) sin evidencia de uso.
- Ninguna de las puertas de correccion ni de las mediciones de rendimiento ha sido re-medida; no hay evidencia publicada de fidelidad numerica frente a llama.cpp en este paquete.
- El muestreo aparece como "no determinado" en la tabla de caracteristicas, lo que limita la confianza en el comportamiento de temperatura, top_k y semilla.
- Entrada de imagen y audio no soportadas por Loom pese a que el modelo de origen las tiene; no debe asumirse capacidad multimodal en este despliegue.
- La decodificacion especulativa no es aplicable en este paquete.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica del modelo base.
- Licencia Apache-2.0 declarada en el paquete; conviene verificar las condiciones del checkpoint base `mradermacher/Twisted-Cyclone-31B-GGUF` antes de uso comercial.
- El contexto efectivo esta limitado a 53.248 tokens por peticion y la concurrencia a 4 peticiones, con 4.096 tokens de salida por preset; no es adecuado para cargas de alta concurrencia.
- Dependencia de hardware AMD especifico (gfx1151 y gfx1201) y del runtime `hrx-loom` 0.2.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-Twisted-Cyclone-31B-loom
- Checkpoint base GGUF: https://huggingface.co/mradermacher/Twisted-Cyclone-31B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
