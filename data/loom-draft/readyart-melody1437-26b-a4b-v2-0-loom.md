# loom-draft/ReadyArt-Melody1437-26B-A4B-v2.0-loom

## Resumen

ReadyArt-Melody1437-26B-A4B-v2.0-loom es un paquete de despliegue en formato `.loom` generado por el autor `loom-draft` para servir el checkpoint GGUF `ReadyArt/Melody1437-26B-A4B-v2.0-GGUF` (concretamente el fichero `Melody1437-26B-A4B-v2.0-HB16-Q4_K_M.gguf`) sobre GPUs AMD. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que contiene programas `.loom` y un `model.json` con los metadatos necesarios para que el runtime Loom cargue y ejecute los pesos sin modificarlos.

El interes del paquete es la integracion con el ecosistema Loom (`hrx-loom` 0.2.0), un stack de inferencia orientado a hardware AMD que expone una API compatible con OpenAI. El autor declara soporte explicito para dos plataformas: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (objetivo gfx1151) y la GPU AMD Radeon AI PRO R9700 (objetivo gfx1201, 32 GB). El paquete se genero con `loom-next`, el generador del proyecto, sin intervencion de un LLM en el bucle.

La relevancia es acotada pero concreta: ofrece una via llana para ejecutar un modelo de tipo MoE (la nomenclatura A4B sugiere parametros activos del orden de 4B sobre un total de 26B) en hardware AMD consumer y profesional, con un contexto declarado de 201.728 tokens por peticion y hasta 4 peticiones concurrentes. No obstante, la model card indica que las mediciones de rendimiento y las puertas de correccion no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se distribuye como GGUF; la nomenclatura A4B sugiere Mixture of Experts, sin confirmar) |
| Parametros totales | 26B (segun el nombre del modelo base) |
| Parametros activos | 4B (inferido del sufijo A4B; no confirmado en la informacion disponible) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico fichero referenciado: `Melody1437-26B-A4B-v2.0-HB16-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en formato `.loom` con `model.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. El paquete Loom no la altera: carga el GGUF `Melody1437-26B-A4B-v2.0-HB16-Q4_K_M.gguf` sin modificaciones, por lo que cualquier detalle sobre atencion, capas, composicion del dataset o proceso de alineamiento (RLHF/DPO) corresponde al autor original `ReadyArt`, cuya model card no se ha incluido en la informacion proporcionada.

Lo que si documenta el paquete es la capa de ejecucion. Loom genera kernels especificos para los objetivos AMD gfx1151 y gfx1201, y ofrece un modo de espera activa en las finalizaciones de GPU (`completion_spin_ns=4294967295`) que consume CPU mientras hay trabajo en vuelo, ademas de opciones de reserva de memoria (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). El paquete incluye dos presets de chat: `chat` para Strix Halo y `chat-r9700` para la R9700. No se declara decodificacion especulativa (marcada como "not applicable") ni ajuste de esfuerzo de razonamiento.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno segun la puerta de correccion `agent`.
- Modo de razonamiento (thinking) desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por respuesta (preset `max_tokens`).
- Contexto de 201.728 tokens por peticion.
- Entrada de imagen y audio: no soportadas por Loom, aunque la model card indica que el modelo upstream si las tiene.
- Decodificacion especulativa: no aplicable en este paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autohospedado en estacion de trabajo AMD: el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"` y se sirve con `loom-serve`, exponiendo un endpoint compatible con OpenAI que cualquier cliente existente puede consumir sin cambios.
- Procesamiento de documentos largos: con 201.728 tokens de contexto por peticion, encaja en tareas de resumen, extraccion o preguntas sobre contratos, informes o bases de codigo que superan ampliamente la ventana de modelos de 8k-32k.
- Automatizacion con herramientas en local: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs internas, bases de datos o sistemas de ficheros sin enviar datos a terceros, siempre que el flujo se mantenga dentro de las 4 peticiones concurrentes.
- Despliegue en hardware AMD profesional: la R9700 con 32 GB es el objetivo natural para servir el modelo Q4_K_M en un equipo de sobremesa o nodo de laboratorio, evitando depender de CUDA.
- Prototipado en APU Strix Halo: el preset `chat` para gfx1151 permite validar integraciones y prompts en un equipo compacto antes de mover la carga a una GPU dedicada.
- Evaluacion comparativa de runtimes: las puertas de correccion (`golden`, `compare`, `agent`, `sampling`, `logits`) estan disenadas para contrastar la salida de Loom contra llama.cpp sobre el mismo GGUF, lo que lo hace util como banco de pruebas de fidelidad numerica.
- Razonamiento opcional bajo demanda: activar `enable_thinking` solo en las peticiones que lo requieran permite separar cargas de baja latencia (chat directo) de cargas analiticas sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Una puerta sin ejecucion registrada no constituye evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El unico dato objetivo es que el paquete esta pensado para la Radeon AI PRO R9700 con 32 GB y para el APU Strix Halo, cuya memoria unificada se comparte con el sistema.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para objetivos AMD.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`) instalado via pipx, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como vias de ejecucion de este artefacto concreto, aunque llama.cpp se usa como referencia de correccion.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp estan pendientes de remedicion.
- Concurrencia maxima: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReadyArt-Melody1437-26B-A4B-v2.0-loom | 26B totales / 4B activos (inferido) | 201.728 tokens | Apache 2.0 | `.loom` + GGUF Q4_K_M | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| ReadyArt/Melody1437-26B-A4B-v2.0-GGUF | 26B totales / 4B activos (inferido) | no disponible | no disponible en la informacion proporcionada | GGUF | Modelo base; ejecutable con llama.cpp y derivados |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

La comparacion significativa es contra el propio GGUF de origen: el paquete Loom anade kernels especificos para AMD y una API OpenAI, pero no modifica los pesos ni documenta mejoras de rendimiento frente a llama.cpp.

## Limitaciones y advertencias

- Ausencia total de evidencia de rendimiento y correccion: todas las puertas de validacion y las comparativas frente a llama.cpp figuran como no remedidas para este paquete.
- El repositorio tiene 0.0 GB y 0 descargas, lo que sugiere que los ficheros pueden no estar materializados o que el artefacto no se ha distribuido aun.
- Soporte de hardware restringido a AMD gfx1151 y gfx1201; no hay soporte declarado para NVIDIA ni para otras arquitecturas.
- Sin soporte de imagen ni audio en Loom, pese a que el modelo upstream las tiene: se pierden capacidades del modelo original.
- Sin decodificacion especulativa, lo que limita las optimizaciones de latencia disponibles.
- Limite de 4 peticiones concurrentes y de 4.096 tokens de salida por respuesta, insuficiente para algunas cargas de generacion larga.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Sesgos y riesgo de alucinacion: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base `ReadyArt/Melody1437-26B-A4B-v2.0`.
- Licencia Apache 2.0 declarada en el paquete, pero la licencia del modelo base no se ha verificado en la informacion disponible; conviene comprobarla antes de un uso comercial.
- El paquete se genero automaticamente con `loom-next` sin LLM en el bucle; no hay garantia de validacion manual de los presets.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Melody1437-26B-A4B-v2.0-loom
- Modelo base GGUF: https://huggingface.co/ReadyArt/Melody1437-26B-A4B-v2.0-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
