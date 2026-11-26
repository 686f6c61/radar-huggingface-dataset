# loom-draft/ggml-org-Qwen3-Omni-30B-A3B-Thinking-loom

## Resumen

Este repositorio no contiene un modelo entrenado de nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `Qwen3-Omni-30B-A3B-Thinking-Q4_K_M.gguf`, publicado por `ggml-org`. El autor del paquete es `loom-draft` y la generacion se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle. El objetivo es ejecutar el modelo Qwen3-Omni (30B totales, 3B activos, arquitectura MoE y modo thinking) sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia practica esta en que ofrece una via de servicio con API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y razonamiento activable o desactivable, sobre hardware AMD consumer y profesional, sin depender de CUDA. El paquete fija un contexto de 65.536 tokens por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida.

Conviene subrayar que las capacidades multimodales del modelo original (entrada de imagen y audio de entrada/salida) no estan soportadas por Loom en esta version, y que las mediciones de rendimiento y las puertas de correccion aparecen marcadas como "not yet re-measured" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el nombre del modelo base (Qwen3-Omni-30B-A3B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 30B (segun denominacion del modelo base) |
| Parametros activos | 3B (segun denominacion del modelo base) |
| Longitud de contexto | 65.536 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint `Qwen3-Omni-30B-A3B-Thinking-Q4_K_M.gguf`), empaquetado como paquete Loom (`.loom` + `model.json`) |
| Peticiones concurrentes | 4 |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Backend de ejecucion | Loom (`loom-serve`, `hrx-loom[hf]==0.2.0`) sobre AMD ROCm |
| Plataformas objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo subyacente: no se detallan volumen de tokens, composicion del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. Lo unico verificable es que se parte del checkpoint GGUF publicado por `ggml-org` en cuantizacion Q4_K_M y que los pesos no se han modificado ("unmodified GGUF checkpoint"). La arquitectura corresponde a la familia Qwen3-Omni, un modelo MoE de 30B parametros totales con 3B activos y modo "thinking", pero la model card del paquete no describe capas, atencion ni modulos multimodales.

La innovacion tecnica del repositorio es el propio runtime: `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` expone el modelo con una API estilo OpenAI. La tarjeta documenta opciones de servicio relevantes para el rendimiento: `completion_spin_ns=4294967295` (espera activa de las completaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva por adelantado el pool de memoria del preset en lugar de crecimiento elastico) y `--parameter_mode=preload` (afecta solo a la carga de pesos en host). No se mencionan decodificacion especulativa ni atencion lineal; de hecho, la decodificacion especulativa figura como "not applicable".

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; se puede desactivar por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`, lo que habilita bucles de agente multi-turno.
- Servicio mediante API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de 4 peticiones simultaneas con contexto de 65.536 tokens por peticion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Entrada de imagen: no soportada por Loom en este paquete (el modelo upstream si la tiene).
- Entrada y salida de audio: no soportadas por Loom en este paquete (el modelo upstream si las tiene).
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de caracteristicas del paquete.
- Razonamiento con esfuerzo configurable ("reasoning effort"): no aplicable en esta implementacion.

## Casos de uso

- Asistente conversacional autoalojado en estacion de trabajo AMD: con 65.536 tokens de contexto por peticion y 4 peticiones concurrentes, permite mantener hilos largos de conversacion tecnica en una Radeon AI PRO R9700 de 32 GB sin salir del equipo local.
- Agente con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir agentes que consulten APIs internas, bases de datos o sistemas de ficheros, con la opcion de desactivar el modo thinking para reducir latencia en pasos mecanicos.
- Generacion y revision de codigo en entornos con requisitos de privacidad: al ejecutarse sobre hardware propio con licencia MIT, encaja en pipelines donde el codigo no puede enviarse a servicios externos; el limite de 4.096 tokens de salida acota el tamano de los parches generados por peticion.
- Analisis de documentos largos: el contexto de 65.536 tokens permite procesar informes, contratos o expedientes completos en una sola peticion, resumiendo o extrayendo datos estructurados.
- Prototipado de aplicaciones sobre Strix Halo: la APU Ryzen AI Max+ 395 permite desarrollar y probar integraciones con la API OpenAI sin GPU dedicada, usando el mismo contrato HTTP que en produccion.
- Evaluacion comparativa de runtimes AMD: el paquete incluye puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `logits`, etc.) pensadas para verificar la fidelidad frente a llama.cpp, lo que lo hace util como banco de pruebas de la pila ROCm/Loom.
- Servicio interno de soporte tecnico: con thinking desactivado y tool calling hacia el sistema de tickets, se puede desplegar un asistente de primera linea en una unica R9700.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB), "the results for this package are not yet re-measured". Todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas. No se dispone de cifras de throughput ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta orientado a la Radeon AI PRO R9700 con 32 GB y a la APU Strix Halo con memoria unificada. La cuantizacion Q4_K_M reduce el peso de los 30B parametros, pero no se publica la cifra exacta de memoria residente.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no disponible; el paquete solo declara soporte para las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch` y servicio con `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete; llama.cpp se usa como referencia de correccion, no como runtime del paquete.
- Opciones de servicio documentadas: `--materialize=copy`, `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Qwen3-Omni-30B-A3B-Thinking, Q4_K_M, Loom) | 30B totales / 3B activos | 65.536 tokens por peticion | GGUF empaquetado en Loom; solo AMD gfx1151 y gfx1201 | MIT | Hugging Face, 0 descargas |
| `ggml-org/Qwen3-Omni-30B-A3B-Thinking-GGUF` (modelo base) | 30B totales / 3B activos | no disponible en la informacion proporcionada | GGUF; ejecutable con llama.cpp y otras pilas GGUF | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del paquete ni de alternativas comparables verificables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Sin evidencia de correccion: todas las puertas de la model card estan sin re-medir, por lo que no hay verificacion publicada de que la salida coincida con la referencia de llama.cpp.
- Sin datos de rendimiento: no hay cifras de latencia ni throughput para ninguna de las dos plataformas objetivo.
- Multimodalidad deshabilitada: el modelo upstream acepta imagen y audio, pero Loom no los soporta en este paquete; no debe asumirse ninguna capacidad de vision o audio.
- Muestreo no determinado: el estado de la fila "sampling" es "?" ("not determined"), lo que introduce incertidumbre sobre el comportamiento de temperature, top_k y seed en produccion.
- Limites operativos fijos: 4.096 tokens de salida por peticion y 4 peticiones concurrentes; los flujos que necesiten mas deberan trocearse o encolarse.
- Plataformas muy restringidas: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para CUDA ni para otras GPU AMD.
- Madurez y adopcion: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (26 de noviembre de 2026), sin pipeline declarado ni idiomas declarados.
- Idiomas: no disponibles; no se puede garantizar calidad en castellano ni en otros idiomas concretos.
- Sesgos y alucinacion: no hay informacion especifica en la model card; al ser un derivado sin modificacion de pesos, hereda los sesgos y el riesgo de alucinacion del modelo Qwen3-Omni original, no documentados aqui.
- Licencia MIT declarada en el paquete; conviene verificar la licencia del checkpoint base antes de un uso comercial, ya que la informacion proporcionada no la detalla.
- Los resultados de busqueda web recibidos corresponden al producto de grabacion de pantalla Loom y a una marca de ropa homonima, no al runtime Loom para AMD; no aportan informacion tecnica util y no se han usado como fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3-Omni-30B-A3B-Thinking-loom
- Modelo base (GGUF): https://huggingface.co/ggml-org/Qwen3-Omni-30B-A3B-Thinking-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
