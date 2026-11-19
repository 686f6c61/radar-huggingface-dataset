# loom-draft/bartowski-maritaca-ai_S5-nano-loom

## Resumen

`loom-draft/bartowski-maritaca-ai_S5-nano-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/maritaca-ai_S5-nano-GGUF`, concretamente la cuantizacion `maritaca-ai_S5-nano-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de empaquetado orientado a ejecutar el modelo original sobre GPUs AMD mediante el runtime `loom-serve`, generado con la herramienta `loom-next` (solo el generador, sin LLM en el bucle).

El modelo subyacente es `maritaca-ai/S5-nano`, un modelo multimodal de tipo image-text-to-text de Maritaca AI, del que esta ficha solo puede confirmar los datos expuestos en la model card del paquete: contexto de 262.144 tokens por peticion, soporte de entrada de imagen mediante el proyector `mmproj-maritaca-ai_S5-nano-bf16.gguf`, tool calling estilo OpenAI y modo de razonamiento activado por defecto. El paquete esta pensado para dos aceleradores concretos: el AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de este artefacto es operativa: permite servir el modelo en hardware AMD con decodificacion especulativa MTP (profundidad 3, activada por defecto), concurrencia de 4 peticiones y una API compatible con OpenAI. No obstante, el propio autor indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `agent`, etc.) aun no se han vuelto a medir para este paquete ni en Strix Halo ni en R9700, por lo que no hay evidencia publicada de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente `maritaca-ai/S5-nano`; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint `maritaca-ai_S5-nano-Q4_K_M.gguf`); proyector de vision en bf16 (`mmproj-maritaca-ai_S5-nano-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json` / `model.json.lock`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-serve` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo subyacente `maritaca-ai/S5-nano` (no se confirma si es un transformer denso, un MoE o un modelo hibrido), ni el volumen o composicion de los datos de entrenamiento, ni si hubo fases de RLHF o DPO. Lo que si documenta la model card es la capa de ejecucion: el paquete Loom incluye kernels generados y un preset de servicio con decodificacion especulativa basada en MTP (multi-token prediction) con profundidad 3, activada por defecto. Segun la documentacion, la decodificacion especulativa esta disenada para producir exactamente la misma salida que con ella desactivada (puerta `spec`).

El paquete tambien define un pool de memoria de respaldo fijo (`--pool_backing=fixed`) que se compromete por adelantado en lugar de crecer de forma elastica, y un modo de carga de pesos en host (`--parameter_mode=preload`). El ajuste `completion_spin_ns=4294967295` habilita espera activa de las finalizaciones de GPU consumiendo CPU mientras hay trabajo en vuelo; segun el autor, las mediciones de rendimiento de la tarjeta usan esa configuracion. La generacion del paquete se realizo con `loom-next` sin intervencion de un LLM en el bucle.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imagen en formato `image_url` estilo OpenAI, con proyector de vision bf16 dedicado (pipeline image-text-to-text).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Decodificacion especulativa MTP con profundidad 3, activada por defecto.
- Ventana de contexto de 262.144 tokens por peticion.
- Servicio concurrente de hasta 4 peticiones.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Soporte de audio: no disponible.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Muestreo (temperature, top_k, seed): el autor lo marca como no determinado (`?`).

## Casos de uso

- Asistente conversacional con documentos largos: la ventana de 262.144 tokens permite enviar contratos, informes o bases de codigo extensas en una sola peticion sin trocear, manteniendo coherencia multi-turno dentro del limite de 4.096 tokens de respuesta.
- Analisis de imagenes en soporte tecnico: el modelo acepta `image_url` y puede describir capturas de pantalla, errores de interfaz o diagramas enviados por el usuario, combinando vision y texto en la misma conversacion.
- Agentes con herramientas en produccion: el soporte de `tools`/`tool_calls` estilo OpenAI permite integrarlo en bucles multi-paso (consulta de APIs, busqueda en bases de datos, ejecucion de acciones) usando el cliente OpenAI estandar sin adaptadores propietarios.
- Despliegue on-premise en hardware AMD: el paquete esta optimizado para Strix Halo y Radeon AI PRO R9700, lo que permite servir el modelo en estaciones de trabajo con GPU AMD sin depender de CUDA ni de servicios en la nube.
- Razonamiento con traza visible: el modo thinking activado por defecto es util en tareas de analisis (clasificacion de tickets, extraccion de datos) donde se quiere auditar el razonamiento; puede desactivarse para respuestas de baja latencia.
- Prototipado rapido de aplicaciones LLM: al exponer una API compatible con OpenAI, se puede apuntar cualquier SDK o framework existente al endpoint local y cambiar despues a otro backend sin reescribir el codigo.
- Evaluacion comparativa frente a llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `vision`, `agent`, `spec`) pensadas para verificar que la salida coincide token a token con la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y que todas las puertas de correccion aparecen como «not yet re-measured». No hay datos de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el proyector de vision es bf16, pero el autor no publica el consumo de memoria del preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no confirmada; el paquete esta generado especificamente para las dos plataformas AMD citadas.
- Despliegue: runtime `loom-serve` del proyecto `hrx-loom[hf]==0.2.0`, instalable via `pipx`; descarga del paquete con `loom-fetch`.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el checkpoint GGUF de origen (`bartowski/maritaca-ai_S5-nano-GGUF`) es la via para usar llama.cpp u otros runtimes GGUF.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp figuran como pendientes de re-medicion en ambas GPUs.
- Configuracion de servicio recomendada: `--pool_backing=fixed --parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo subyacente (`maritaca-ai/S5-nano`) que permitan una comparacion rigurosa con alternativas de la misma categoria. Como referencia de ecosistema, el paquete se apoya en el GGUF de `bartowski/maritaca-ai_S5-nano-GGUF` y en el runtime Loom, pero no se ofrecen cifras comparativas con otros modelos.

## Limitaciones y advertencias

- Ausencia de evidencia de rendimiento: el autor declara que las mediciones de rendimiento y las puertas de correccion no se han vuelto a medir para este paquete en ninguna de las dos GPUs objetivo; no hay garantia publicada de que la salida coincida con llama.cpp.
- Paquete de despliegue, no modelo: no aporta pesos nuevos ni mejoras de calidad; cualquier limitacion del modelo subyacente `maritaca-ai/S5-nano` se hereda intacta.
- Hardware restringido: generado para gfx1151 y gfx1201; no se documenta funcionamiento en otras GPUs AMD ni en NVIDIA.
- Limite de salida: 4.096 tokens por peticion (preset `max_tokens`), lo que puede ser insuficiente para generacion larga aunque el contexto de entrada sea de 262.144 tokens.
- Concurrencia baja: 4 peticiones simultaneas, adecuado para uso individual o equipos pequenos, no para servicio de alta carga.
- Muestreo no determinado: el autor marca el soporte de sampling como `?`; las puertas `sampling` y `logits` no tienen medicion registrada.
- Idiomas: no disponibles en la informacion; no se puede confirmar el soporte multilingue mas alla de lo que ofrezca el modelo base.
- Sesgos y alucinacion: no documentados en la informacion proporcionada; deben evaluarse sobre el modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `maritaca-ai/S5-nano` y del GGUF de `bartowski`.
- Resultados de busqueda web no relevantes: las busquedas sobre «Loom» devuelven el producto de grabacion de pantalla y la marca de ropa, no el runtime Loom de AMD; no deben confundirse.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-maritaca-ai_S5-nano-loom
- GGUF de origen: https://huggingface.co/bartowski/maritaca-ai_S5-nano-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
