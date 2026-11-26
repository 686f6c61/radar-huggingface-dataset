# loom-draft/prithivMLmods-Surogate3.7-35B-A3B-loom

## Resumen

Surogate3.7-35B-A3B-loom es un paquete de despliegue en formato `.loom` (programas y una tarjeta `model.json`) generado por el proyecto Loom para ejecutar el checkpoint GGUF sin modificar `prithivMLmods/Surogate3.7-35B-A3B-GGUF` (variante `Surogate3.7-35B-A3B.Q4_K_M.gguf`) sobre GPUs AMD. El autor del paquete es el usuario `loom-draft`, y el modelo base es un finetune multimodal de tipo image-text-to-text con arquitectura MoE de 35B totales y 3B activos, según se deduce del sufijo `35B-A3B` del nombre. El paquete se ha generado con la herramienta `loom-next` (solo el generador, sin LLM en el bucle) y esta orientado a dos destinos de hardware concretos: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo resuelve el problema de servir un LLM multimodal de gran tamano en hardware AMD consumer y profesional sin depender de CUDA, mediante kernels generados especificamente para las arquitecturas gfx1151 y gfx1201. Incorpora decodificacion especulativa mediante MTP (Multi-Token Prediction) con profundidad 3, activada por defecto, y una API compatible con OpenAI (`/v1/chat/completions`) que soporta tool calling, modo de razonamiento (thinking) e entrada de imagenes a traves de un proyector multimodal separado (`Surogate3.7-35B-A3B.mmproj-bf16.gguf`).

La relevancia de este paquete es fundamentalmente practica: demuestra un pipeline de despliegue reproducible para modelos MoE multimodales sobre ROCm/AMD, con ventana de contexto de 262.144 tokens por peticion y concurrencia de 4 peticiones. No obstante, el repositorio de Hugging Face no contiene pesos (tamano 0.0 GB) y las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para esta version, por lo que debe considerarse un artefacto de despliegue en estado preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), multimodal image-text-to-text; detalles internos del modelo base no disponibles |
| Parametros totales | 35B (segun nomenclatura `35B-A3B`) |
| Parametros activos | 3B (segun nomenclatura `35B-A3B`) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en bf16 (`mmproj-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base); paquete de despliegue `.loom` con `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El paquete no incluye informacion sobre el entrenamiento del modelo base. Por la nomenclatura `35B-A3B` se trata de un transformer con mezcla de expertos (MoE) de 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, con capacidad multimodal de entrada de imagen y texto (pipeline `image-text-to-text`). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineamiento.

La innovacion tecnica del paquete reside en la capa de despliegue: Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, e integra decodificacion especulativa basada en MTP con profundidad 3 activada por defecto. El servidor expone una API estilo OpenAI, gestiona un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El modo de razonamiento (thinking) esta activado por defecto y puede desactivarse por peticion mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable o desactivable por peticion.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, procesadas por el proyector `Surogate3.7-35B-A3B.mmproj-bf16.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial y renderizado exacto del prompt (segun las puertas de correccion declaradas).
- Decodificacion especulativa MTP con profundidad 3, activada por defecto, disenada para producir exactamente la misma salida que sin decodificacion especulativa.
- Contexto largo de hasta 262.144 tokens por peticion.
- Servicio concurrente de hasta 4 peticiones.
- API compatible con OpenAI en `/v1/chat/completions`.
- Sin soporte de audio (entrada ni salida).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: la ventana de 262.144 tokens permite procesar informes, contratos o manuales completos junto con figuras y diagramas en una sola peticion, sin trocear el contenido.
- Automatizacion de soporte tecnico multimodal: el modelo puede recibir capturas de pantalla del usuario junto con texto y mantener conversaciones multi-turno, con tool calling para consultar sistemas internos (estado de pedidos, tickets, bases de conocimiento).
- Agentes de automatizacion con herramientas: el soporte de `tools`/`tool_calls` y de bucles multi-turno con historial reutilizado permite construir agentes que consultan APIs, ejecutan busquedas y encadenan pasos de razonamiento.
- Procesamiento por lotes en estaciones de trabajo AMD: el despliegue sobre Strix Halo (SoC con memoria unificada) permite ejecutar el modelo en un equipo compacto sin GPU dedicada CUDA, util para prototipado y demos locales.
- Extraccion de datos de documentos escaneados: combinando entrada de imagen y contexto largo, el modelo puede transcribir y estructurar informacion de facturas, formularios o articulos cientificos.
- Evaluacion comparativa de backends AMD: el paquete incluye puertas de correccion (`golden`, `compare`, `vision`, `spec`, `agent`, `sampling`, `logits`) que permiten validar la fidelidad del backend Loom frente a llama.cpp sobre el mismo GGUF, util para equipos que evaluan migraciones a ROCm.
- Servicio de chat interno con razonamiento controlado: activando o desactivando `enable_thinking` por peticion, se puede equilibrar latencia y calidad segun la tarea dentro de una misma instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Una puerta sin ejecucion registrada no constituye evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de un MoE de 35B, lo que en la practica requiere del orden de 20-25 GB para pesos, mas el proyector bf16 y las estructuras de contexto; el paquete esta disenado para ejecutarse en el Radeon AI PRO R9700 con 32 GB.
- GPU recomendadas segun el autor: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA ni para otras Radeon; el paquete incluye presets especificos solo para gfx1151 y gfx1201.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` (instalable con pipx) mediante `loom-fetch` y `loom-serve`; el modelo base esta en formato GGUF y es compatible con llama.cpp como referencia de correccion.
- Latencia y throughput: no disponibles; las mediciones de rendimiento frente a llama.cpp aun no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Surogate3.7-35B-A3B (paquete Loom) | 35B totales / 3B activos (MoE) | 262.144 tokens | Si (imagen) | MIT | Paquete `.loom`; pesos en el repo base GGUF |
| Surogate3.7-35B-A3B-GGUF (base) | 35B totales / 3B activos (MoE) | no disponible | Si (imagen) | MIT | GGUF en Hugging Face |
| llama.cpp (backend de referencia) | No aplica (runtime) | Depende del modelo | Si, con proyector compatible | MIT | Codigo abierto |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio de Hugging Face tiene un tamano de 0.0 GB: no contiene los pesos ni los ficheros del paquete, solo metadatos; es necesario descargar el GGUF base por separado.
- Rendimiento y correccion sin verificar: todas las puertas de correccion y las comparativas frente a llama.cpp figuran como "not yet re-measured" para ambas GPUs objetivo.
- Soporte de hardware muy restringido: solo se documentan presets para gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPUs AMD ni en NVIDIA.
- El modo thinking esta activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- Limite de salida de 4.096 tokens por peticion, lo que puede ser insuficiente para generacion de documentos largos.
- Concurrencia maxima de 4 peticiones, adecuada para uso personal o equipos pequenos pero no para servicio de alta carga.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue del modelo base; deben evaluarse empiricamente antes de un despliegue en produccion.
- La licencia MIT del paquete no necesariamente cubre todos los componentes del modelo base; conviene verificar la licencia del checkpoint original.
- El campo de muestreo figura como "not determined" en la model card, lo que anade incertidumbre sobre el comportamiento del servidor en configuraciones no probadas.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/prithivMLmods-Surogate3.7-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/prithivMLmods/Surogate3.7-35B-A3B-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
