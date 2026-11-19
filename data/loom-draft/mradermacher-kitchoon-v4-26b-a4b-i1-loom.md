# loom-draft/mradermacher-Kitchoon-V4-26B-A4B-i1-loom

## Resumen

El repositorio `loom-draft/mradermacher-Kitchoon-V4-26B-A4B-i1-loom` no es un modelo de lenguaje en sentido estricto, sino un paquete de despliegue en formato `.loom` para el ecosistema Loom, una pila de inferencia orientada a GPUs AMD. Empaqueta el checkpoint GGUF `Kitchoon-V4-26B-A4B.i1-Q4_K_M.gguf` del autor `mradermacher` (a su vez una cuantizacion del modelo base Kitchoon-V4-26B-A4B) junto con un fichero `model.json` que describe la configuracion de servicio. El generador empleado es `loom-next`, sin intervencion de un LLM en el proceso de creacion del paquete.

El interes practico del repositorio es acotado: sirve para ejecutar el modelo cuantizado en dos aceleradores AMD concretos, la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB), mediante `loom-fetch` y `loom-serve` a traves de una API compatible con OpenAI. El paquete no aporta pesos nuevos ni modificaciones del modelo, y su repo tiene 0 GB y 0 descargas en el momento de la consulta.

La relevancia de esta ficha es, por tanto, documentar el paquete y sus condiciones de uso, no las capacidades intrinsecas del modelo subyacente, sobre el que la informacion disponible es practicamente nula. Cualquier dato sobre arquitectura, parametros reales, entrenamiento o benchmarks del modelo Kitchoon-V4-26B-A4B queda fuera del alcance de esta informacion y se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no describe la arquitectura del modelo subyacente) |
| Parametros totales | 26B segun el nombre del checkpoint; no verificado en la informacion disponible |
| Parametros activos | 4B segun el sufijo A4B del nombre; no verificado en la informacion disponible |
| Longitud de contexto | 201.728 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF empaquetado en `.loom` (programas `.loom` + `model.json`) |
| Modelo base | mradermacher/Kitchoon-V4-26B-A4B-i1-GGUF |
| Aceleradores soportados | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Thinking mode | Si, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}` |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Decodificacion especulativa | No aplicable en este paquete |
| Entrada de imagen | No soportada por Loom (el modelo upstream si la tiene) |
| Entrada/salida de audio | No soportada por Loom (el modelo upstream si la tiene) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo Kitchoon-V4-26B-A4B. El nombre sugiere un transformer con mezcla de expertos (MoE) de 26.000 millones de parametros totales y 4.000 millones activos, pero no hay confirmacion en la model card ni en los metadatos. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias.

Lo que si documenta el paquete es la capa de ejecucion: Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF sin modificar, y expone el modelo mediante un servidor compatible con OpenAI. El paquete incluye un fichero `model.json` con los ficheros fuente fijados por sha256 y un `model.json.lock`. La model card menciona puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, pero todas aparecen como "not yet re-measured" en esta version, por lo que no hay evidencia publicada de correccion numerica.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI, con soporte de `tools` y `tool_calls`, orientado a bucles de agente multi-turno.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable por peticion.
- Contexto de hasta 201.728 tokens por peticion, adecuado para documentos largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Capacidades multimodales (imagen, audio) presentes en el modelo upstream pero no expuestas por Loom en este paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin decodificacion especulativa en este paquete.

## Casos de uso

- Analisis de documentos extensos: con 201.728 tokens de contexto por peticion, el paquete permite cargar contratos, informes o bases de codigo completas en una sola llamada sin trocear, algo poco habitual en despliegues sobre GPU de consumo.
- Asistentes con tool calling sobre hardware AMD: el soporte de `tools` y `tool_calls` permite construir agentes que consulten APIs o bases de datos, ejecutandose en una Radeon AI PRO R9700 de 32 GB o en una APU Strix Halo sin depender de CUDA.
- Prototipado en estaciones de trabajo con grafica integrada: Strix Halo permite servir el modelo Q4_K_M en un equipo compacto, util para demos locales y entornos de desarrollo sin GPU dedicada.
- Despliegue de un endpoint compatible con OpenAI en infraestructura AMD: al exponer `/v1/chat/completions`, se puede integrar con clientes y frameworks que ya hablan el protocolo de OpenAI sin adaptadores adicionales.
- Razonamiento por lotes con thinking opcional: activando `enable_thinking` por peticion, se pueden enviar consultas que requieran cadena de razonamiento y dejar el modo desactivado para el trafico de baja latencia.
- Evaluacion comparativa frente a llama.cpp: las puertas de correccion del paquete estan disenadas para verificar que la salida coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace util en tareas de validacion de la pila Loom.
- Servicio de chat interno con concurrencia limitada: con 4 peticiones simultaneas y 4.096 tokens de salida maxima, encaja en equipos pequenos o entornos de investigacion con carga moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para la Radeon AI PRO R9700 con 32 GB y para la APU Strix Halo con memoria unificada. Un GGUF Q4_K_M de un modelo de 26B totales ronda los 15-16 GB de pesos, pero esta cifra es una estimacion por tamano y cuantizacion, no un dato publicado en la informacion.
- GPUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPUs NVIDIA ni otras AMD.
- GPU de consumo: no hay confirmacion de soporte para Radeon de consumo ni para GPUs NVIDIA en este paquete; el soporte documentado se limita a los dos aceleradores citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue: el paquete esta atado a Loom; para llama.cpp, Ollama, vLLM o TGI habria que usar directamente el GGUF de `mradermacher/Kitchoon-V4-26B-A4B-i1-GGUF`, no este repositorio.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card no estan re-medidas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones verificadas del modelo subyacente que permitan una comparacion rigurosa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kitchoon-V4-26B-A4B-i1 (este paquete) | 26B totales / 4B activos segun nombre, no verificado | 201.728 tokens (preset Loom) | apache-2.0 | GGUF Q4_K_M en `.loom` | Solo AMD gfx1151 y gfx1201 |
| Alternativas | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion |

## Limitaciones y advertencias

- El repositorio no contiene pesos propios ni un modelo nuevo: es un paquete de despliegue generado con `loom-next` sobre un GGUF de terceros. La licencia apache-2.0 del paquete no sustituye a la del modelo base, que debe verificarse en `mradermacher/Kitchoon-V4-26B-A4B-i1-GGUF`.
- Solo se documenta soporte para dos aceleradores AMD (gfx1151 y gfx1201); no hay evidencia de funcionamiento en NVIDIA ni en otras Radeon.
- Las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured": no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp ni de throughput o latencia reales.
- La cuantizacion disponible es unicamente Q4_K_M; no se ofrecen variantes Q5, Q6, Q8 ni FP16 en este paquete.
- Limite de 4 peticiones concurrentes y 4.096 tokens de salida por peticion, insuficiente para cargas de produccion medias o altas.
- Las capacidades de imagen y audio del modelo upstream no estan disponibles a traves de Loom.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni calidad del ajuste del modelo subyacente; deben evaluarse directamente sobre el modelo base.
- El repositorio tiene 0 descargas y 0 likes, y 0 GB de tamano declarado en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- Los resultados de busqueda web sobre "Loom" corresponden a la herramienta de grabacion de pantalla y a una marca de ropa, no al ecosistema de inferencia; no aportan informacion tecnica relevante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Kitchoon-V4-26B-A4B-i1-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/Kitchoon-V4-26B-A4B-i1-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
