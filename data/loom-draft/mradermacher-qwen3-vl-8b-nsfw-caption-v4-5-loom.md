# loom-draft/mradermacher-Qwen3-VL-8B-NSFW-Caption-V4.5-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (archivos `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` a partir del checkpoint GGUF `Qwen3-VL-8B-NSFW-Caption-V4.5.Q4_K_M.gguf` de mradermacher. El modelo subyacente es un Qwen3-VL-8B afinado para la generación de descripciones (captions) de imagenes, incluyendo contenido para adultos, y cuantizado a Q4_K_M. El paquete esta pensado para ejecutarse sobre las GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `hrx-loom`.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso concreto de la familia Qwen3-VL en tareas de vision-lenguaje sobre hardware AMD consumer y de estacion de trabajo, con soporte de API compatible con OpenAI, tool calling e imagenes de entrada. Por otro lado, ilustra el ecosistema Loom de paquetes precompilados para ROCm, que busca ofrecer una alternativa de despliegue a llama.cpp en GPUs AMD.

Conviene subrayar que el autor del paquete (loom-draft) no es el autor del modelo afinado (mradermacher) ni del modelo base (Qwen3-VL-8B de Alibaba). La mayoria de las especificaciones del modelo original no estan documentadas en esta model card, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3-VL-8B, familia vision-lenguaje de Qwen) |
| Parametros totales | no disponible (el nombre del checkpoint indica 8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en F16 (`mmproj-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en formato Loom `.loom` + `model.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. El checkpoint base es Qwen3-VL-8B, un modelo de la familia Qwen3-VL de Alibaba con capacidad de entrada de imagenes (pipeline `image-text-to-text`), y sobre el se ha aplicado un afinado especifico para generacion de captions, incluyendo contenido NSFW, por parte de mradermacher. No se detallan en esta model card el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO.

El paquete Loom en si no modifica los pesos: se trata del mismo GGUF cuantizado a Q4_K_M, acompanado de un proyector multimodal en F16 (`Qwen3-VL-8B-NSFW-Caption-V4.5.mmproj-f16.gguf`). La innovacion tecnica del repositorio es el propio runtime: kernels generados para las arquitecturas gfx1151 y gfx1201, servidor compatible con la API de OpenAI, soporte de tool calling estilo OpenAI, atencion a 4 peticiones concurrentes y un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp. En el momento de la publicacion, ninguna de estas puertas tiene mediciones registradas para este paquete concreto.

## Capacidades

- Generacion de texto e inferencia vision-lenguaje: acepta imagenes mediante partes `image_url` al estilo OpenAI y produce texto descriptivo.
- Generacion de captions de imagenes, con enfasis en contenido para adultos (el checkpoint esta marcado como `not-for-all-audiences`).
- Tool calling estilo OpenAI (`tools` y `tool_calls`).
- Soporte de agentes y bucles multi-turno de llamadas a herramientas (existe una puerta de correccion `agent` y `agent_think_off`, aunque sin mediciones publicadas).
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Modo de razonamiento/thinking: no aplicable segun la tabla de caracteristicas.
- Decodificacion especulativa: no aplicable.
- Entrada o salida de audio: no determinado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Etiquetado y descripcion automatica de imagenes en pipelines de datos: el modelo puede generar captions para grandes volumenes de imagenes, util para construir datasets de entrenamiento o para indexar bibliotecas multimedia. El contexto de 262.144 tokens permite procesar lotes de descripciones en una sola conversacion.
- Moderacion y clasificacion de contenido para adultos: dado su afinado especifico en contenido NSFW, puede emplearse para describir y clasificar imagenes en plataformas que necesiten inventariar o etiquetar material sensible, siempre con las salvaguardas legales y eticas correspondientes.
- Asistencia a creadores de contenido: generacion de descripciones y metadatos para galerias de imagenes, con soporte de tool calling para consultar o actualizar un CMS mediante funciones expuestas por el servidor.
- Agentes multimodales en local: el soporte de `tools`/`tool_calls` y la API compatible con OpenAI permiten integrar el modelo en frameworks de agentes (por ejemplo, orquestadores que encadenen vision y acciones) sobre hardware AMD sin depender de la nube.
- Despliegue en estacion de trabajo AMD: con una Radeon AI PRO R9700 de 32 GB o un Ryzen AI Max+ 395, el paquete Loom permite servir el modelo en local mediante `loom-serve`, util para entornos con requisitos de privacidad o sin conectividad.
- Prototipado de aplicaciones vision-lenguaje: al exponer un endpoint compatible con OpenAI, se puede sustituir un backend en la nube por este paquete sin reescribir el codigo cliente, lo que facilita pruebas de concepto y comparativas de calidad.
- Procesamiento por lotes de documentos escaneados o capturas: con 4 peticiones concurrentes y contexto largo, se pueden describir o resumir series de imagenes en un solo proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero ambas indican explicitamente que "the results for this package are not yet re-measured". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 8B, por lo que el peso de los parametros ronda los 5 GB, a lo que hay que sumar el proyector multimodal F16 y el pool de memoria del preset Loom.
- GPUs soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no se documenta soporte para RTX 4090, A100, H100 ni otras GPUs NVIDIA en esta model card; el paquete esta orientado a ROCm/AMD.
- Opciones de despliegue: `hrx-loom` (version 0.2.0) mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servir la API. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto (aunque las puertas de correccion usan llama.cpp como referencia).
- Parametros de servicio documentados: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| loom-draft/mradermacher-Qwen3-VL-8B-NSFW-Caption-V4.5-loom | 8B (segun nombre) | 262.144 tokens | Apache 2.0 | GGUF empaquetado en Loom, runtime `hrx-loom` | Paquete de despliegue para AMD Strix Halo y R9700; sin benchmarks publicados |
| mradermacher/Qwen3-VL-8B-NSFW-Caption-V4.5-GGUF | 8B (segun nombre) | no disponible | Apache 2.0 (heredada del modelo base) | GGUF | Checkpoint original del que deriva este paquete; desplegable con llama.cpp y otros runtimes GGUF |
| Qwen3-VL-8B (modelo base de Alibaba) | 8B (segun nombre) | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | Modelo vision-lenguaje original; esta ficha no dispone de sus especificaciones detalladas |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el checkpoint esta marcado como `not-for-all-adversaries`/`not-for-all-audiences` y afinado para captions NSFW; su uso en produccion exige controles de acceso, filtrado y cumplimiento normativo.
- Ausencia de benchmarks: no hay mediciones de rendimiento ni resultados de las puertas de correccion para este paquete, por lo que no se puede avalar su calidad frente a llama.cpp con evidencia publicada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y vision-lenguaje; las descripciones generadas pueden contener detalles no presentes en la imagen.
- Idiomas: no se documenta que idiomas soporta el modelo ni el afinado.
- Licencia: Apache 2.0 segun la model card, pero conviene verificar la licencia del checkpoint base y del modelo original Qwen3-VL-8B antes de un uso comercial, dado que esta ficha no la detalla.
- Hardware restringido: el paquete esta generado especificamente para gfx1151 y gfx1201; no se garantiza su funcionamiento en otras GPUs AMD ni en NVIDIA.
- Contexto y salida: aunque el contexto es de 262.144 tokens, la salida maxima por peticion es de 4.096 tokens (preset `max_tokens`), lo que limita respuestas largas.
- Concurrencia limitada a 4 peticiones simultaneas, insuficiente para cargas de alta demanda sin escalado horizontal.
- Madurez del ecosistema: `hrx-loom` 0.2.0 y el ecosistema Loom son recientes; el repositorio no registra descargas ni likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-Qwen3-VL-8B-NSFW-Caption-V4.5-loom
- Checkpoint base (GGUF): https://huggingface.co/mradermacher/Qwen3-VL-8B-NSFW-Caption-V4.5-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
