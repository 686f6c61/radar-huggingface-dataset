# loom-draft/unsloth-Qwen3-VL-4B-Instruct-loom

## Resumen

`loom-draft/unsloth-Qwen3-VL-4B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3-VL-4B-Instruct-GGUF`, en concreto la cuantizacion `Qwen3-VL-4B-Instruct-Q4_K_M.gguf`. No es un modelo entrenado desde cero ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos de Qwen3-VL-4B-Instruct a programas ejecutables sobre el runtime Loom, orientado a GPUs AMD.

El modelo subyacente, Qwen3-VL-4B-Instruct, es un transformer multimodal de 4 mil millones de parametros de la familia Qwen3-VL de Alibaba, especializado en tareas image-text-to-text con soporte de tool calling y contexto largo. Este paquete concreto anade una capa de compatibilidad con hardware AMD: el SoC Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB), ambos con arquitectura RDNA y soporte ROCm.

Su relevancia es practica: permite servir un modelo vision-lenguaje de 4B en cuantizacion Q4_K_M sobre hardware AMD consumer y profesional mediante una API compatible con OpenAI (`/v1/chat/completions`), con soporte de imagenes via proyector `mmproj-BF16.gguf`, tool calling estilo OpenAI y una ventana de contexto declarada de 262.144 tokens por peticion. La licencia Apache 2.0 del modelo base facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) del modelo base Qwen3-VL-4B-Instruct; empaquetado como programas Loom |
| Parametros totales | 4B (modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom` y `weights.loom`; incluye `tokenizer.json` y `llm_config.json` |

## Arquitectura y entrenamiento

El paquete no define arquitectura propia: envuelve el checkpoint GGUF de Qwen3-VL-4B-Instruct, un transformer multimodal de 4B parametros que procesa texto e imagenes. La parte de vision se sirve mediante un proyector separado en BF16 (`mmproj-BF16.gguf`), y el paquete incluye el tokenizador y la configuracion (`llm_config.json`) con la que se generaron los programas Loom. La generacion del paquete se realizo con la herramienta `loom-next` (generador automatico, sin LLM en el bucle, segun la model card).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion; esos datos corresponden a la model card original de Qwen3-VL-4B-Instruct, que no se ha proporcionado. Tampoco se documentan innovaciones tecnicas del modelo base en la informacion disponible. La innovacion del paquete es de infraestructura: compilacion de kernels especificos para gfx1151 y gfx1201, pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`).

## Capacidades

- Generacion de texto y respuesta conversacional multimodal (image-text-to-text).
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, procesadas por el proyector `mmproj-BF16.gguf`.
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de tokens de salida configurado en 4.096 (`max_tokens` del preset).
- Ventana de contexto de 262.144 tokens por peticion.
- Modo de razonamiento/thinking: no aplicable en este paquete.
- Decodificacion especulativa: no aplicable en este paquete.
- Entrada/salida de audio: no soportada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente visual sobre documentos: procesar capturas, diagramas o paginas escaneadas y responder preguntas en una sola peticion gracias a la ventana de 262.144 tokens, util para analisis de contratos o informes extensos con imagenes intercaladas.
- Automatizacion de soporte tecnico con imagenes: el cliente adjunta una captura de error y el modelo la interpreta y responde; el soporte de tool calling permite escalar a un sistema de tickets mediante `tool_calls`.
- Extraccion estructurada de informacion de facturas y formularios: enviar la imagen y obtener JSON con los campos relevantes, integrable en pipelines de contabilidad.
- Agente multi-paso con herramientas: la model card documenta una puerta de validacion `agent` para bucles multi-turno de tool calling, lo que respalda su uso en asistentes que consultan APIs externas de forma iterativa.
- Despliegue local en estaciones de trabajo AMD: servir el modelo en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 con `loom-serve` y consumirlo desde herramientas que hablan la API de OpenAI, sin depender de la nube.
- Prototipado de aplicaciones de vision-lenguaje en cuantizacion Q4_K_M: el tamano de 4B en Q4_K_M permite iterar rapidamente en una GPU de 32 GB con margen para el proyector BF16 y el pool de memoria fijo.
- Moderacion o clasificacion de contenido visual: analizar imagenes enviadas por usuarios y devolver etiquetas o decisiones mediante la API de chat, con concurrencia de 4 peticiones para volumen moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp y de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`), pero todas aparecen marcadas como "not yet re-measured" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201). No hay cifras de latencia ni de throughput publicadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 4B, mas el proyector BF16, sobre un pool de memoria fijo configurable.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer NVIDIA: no documentada; el paquete esta generado para dispositivos AMD via ROCm.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete.
- Parametros de servicio relevantes: `--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (las mediciones del paquete no se han vuelto a realizar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Qwen3-VL-4B-Instruct-loom` (este paquete) | 4B | 262.144 tokens | Apache 2.0 | GGUF Q4_K_M empaquetado en Loom; runtime Loom sobre AMD | Paquete de despliegue, no modelo nuevo |
| `unsloth/Qwen3-VL-4B-Instruct-GGUF` (modelo base del paquete) | 4B | no disponible en la informacion | Apache 2.0 (heredada) | GGUF; ejecutable con llama.cpp y otros runtimes GGUF | Checkpoint original sin empaquetar |
| Qwen3-VL-4B-Instruct (modelo original) | 4B | no disponible en la informacion | Apache 2.0 | safetensors y GGUF | Modelo multimodal de referencia de la familia Qwen3-VL |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto declarado, licencia y formato de distribucion.

## Limitaciones y advertencias

- El paquete no ha sido re-medido: todas las puertas de correccion y las comparativas de rendimiento frente a llama.cpp figuran como "not yet re-measured", por lo que no hay evidencia publicada de equivalencia numerica con el checkpoint original.
- Ambito de hardware restringido: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para GPUs NVIDIA ni para otras AMD.
- Limite de salida de 4.096 tokens por peticion, muy inferior a la ventana de contexto de 262.144 tokens; las tareas de generacion larga quedan truncadas por el preset.
- Concurrencia maxima de 4 peticiones, lo que limita el throughput en produccion con carga alta.
- El modo de razonamiento y la decodificacion especulativa no estan disponibles en este paquete.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue mas alla de lo que ofrezca el modelo base.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible; al ser un modelo de 4B en Q4_K_M, cabe esperar mayor propension a errores que en variantes de mayor tamano, aunque no hay datos que lo cuantifiquen.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y del proyector de vision antes de redistribuir.
- El paquete usa un pool de memoria fijo (`--pool_backing=fixed`), lo que reserva VRAM por adelantado y puede impedir el servicio si el dispositivo no dispone de memoria suficiente.
- La model card esta generada por una herramienta automatica (`loom-next`) y no incluye resultados de validacion propios.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-4B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
