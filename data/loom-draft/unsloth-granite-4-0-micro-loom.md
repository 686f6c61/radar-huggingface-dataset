# loom-draft/unsloth-granite-4.0-micro-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `unsloth/granite-4.0-micro-GGUF`, en su cuantización `granite-4.0-micro-Q4_K_M.gguf`. El autor es `loom-draft` y el paquete está generado con la herramienta `loom-next` (sin LLM en el bucle), orientado a ejecutar el modelo en las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Granite 4.0 Micro de IBM, en su variante distribuida por Unsloth. Este paquete Loom añade una capa de servicio compatible con la API de OpenAI (`/v1/chat/completions`), soporte de tool calling, contexto de 131.072 tokens por petición, concurrencia de 4 peticiones y un límite de 4.096 tokens de salida por preset.

La relevancia de esta ficha es doble: por un lado documenta un formato de despliegue alternativo (Loom) para hardware AMD consumer y profesional; por otro, advierte que las métricas de rendimiento y las puertas de corrección del paquete no han sido re-medidas todavía, por lo que no hay evidencia publicada de paridad con llama.cpp en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente Granite 4.0 Micro; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`granite-4.0-micro-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El paquete no describe la arquitectura del modelo subyacente ni sus datos de entrenamiento; solo indica que se trata del checkpoint GGUF sin modificar de `unsloth/granite-4.0-micro-GGUF` en cuantización Q4_K_M. Por tanto, no hay información disponible sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas del modelo base.

La innovación técnica documentada corresponde al formato de despliegue Loom: programas `.loom` generados por `loom-next`, un `model.json` con los ficheros fuente fijados por sha256 (verificados por `loom-fetch`), un `llm_config.json` con la configuración de generación, y un `info.json` con medidas, evidencia de puertas de corrección y versiones. El servidor `loom-serve` expone una API estilo OpenAI con soporte de `tools` y `tool_calls`, y opciones de despliegue como `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).

## Capacidades

- Generación de texto vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI (`tools` y `tool_calls`), incluyendo bucles de tool calling multi-turno (según la descripción de la puerta `agent`).
- Concurrencia de hasta 4 peticiones simultáneas.
- Contexto de 131.072 tokens por petición y salida máxima de 4.096 tokens (preset `max_tokens`).
- Modo de razonamiento/thinking: no aplicable según la tabla de características del paquete.
- Decodificación especulativa: no aplicable.
- Entrada de imagen y entrada/salida de audio: no aplicable.
- Muestreo (sampling): estado "no determinado" en la tabla de características.

## Casos de uso

- Servicio de chat local en hardware AMD: desplegar `loom-serve` en una Radeon AI PRO R9700 o en un Ryzen AI Max+ 395 y exponer un endpoint compatible con OpenAI para aplicaciones cliente existentes, sin reescribir la capa de integración.
- Procesamiento de documentos largos: aprovechar los 131.072 tokens de contexto por petición para resumir, extraer entidades o responder preguntas sobre contratos, informes técnicos o expedientes extensos en una sola llamada.
- Agentes con herramientas: usar el soporte de `tools`/`tool_calls` para construir flujos multi-turno que consulten APIs internas, bases de datos o sistemas de tickets, con historial reutilizado entre turnos.
- Automatización de atención al cliente: gestionar conversaciones multi-turno con contexto largo y hasta 4 peticiones concurrentes por instancia para picos moderados de tráfico.
- Entornos de desarrollo con GPU AMD: validar pipelines de inferencia en gfx1151/gfx1201 antes de migrar a soluciones propietarias, usando el paquete como referencia de despliegue reproducible (ficheros fijados por sha256).
- Evaluación comparativa de runtimes: usar las puertas de corrección (`golden`, `compare`, `consistency`, `agent`, `logits`) como marco para contrastar la salida de Loom frente a la referencia de llama.cpp sobre el mismo GGUF.
- Prototipado en estaciones de trabajo con memoria unificada: ejecutar el modelo Q4_K_M en equipos con Ryzen AI Max+ 395, donde la memoria compartida permite cargar el modelo sin GPU dedicada de gran VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU. Una puerta sin ejecución registrada no constituye evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete está orientado a la Radeon AI PRO R9700 con 32 GB y al Ryzen AI Max+ 395 (memoria unificada). El tamaño exacto del GGUF Q4_K_M no se indica en la información proporcionada.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPU NVIDIA consumer (RTX 4090, etc.) ni con otras GPU AMD fuera de las dos arquitecturas citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete; llama.cpp aparece solo como referencia de corrección.
- Latencia y throughput: no disponibles (medidas pendientes de re-ejecución).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-granite-4.0-micro-loom | no disponible | 131.072 tokens | Apache 2.0 | GGUF empaquetado en Loom | Paquete de despliegue para GPU AMD gfx1151/gfx1201; métricas pendientes |
| unsloth/granite-4.0-micro-GGUF (modelo base) | no disponible | no disponible | Apache 2.0 | GGUF | Checkpoint sin modificar del que deriva el paquete |
| Granite 4.0 Micro (IBM, original) | no disponible | no disponible | Apache 2.0 (según el paquete) | no disponible | Modelo subyacente; specs no documentadas en esta información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de evidencia de corrección: todas las puertas de validación figuran como "not yet re-measured"; no hay garantía publicada de que la salida coincida con la referencia de llama.cpp en esta versión del paquete.
- Sin métricas de rendimiento: no hay datos de latencia ni throughput para ninguna de las dos GPU objetivo.
- Arquitectura y parámetros del modelo subyacente no documentados en el paquete; cualquier decisión de producción debe remitirse a la model card de Granite 4.0 Micro de IBM.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe desde esta ficha.
- Modo de razonamiento, visión, audio y decodificación especulativa marcados como no aplicables.
- Muestreo marcado como "no determinado": el comportamiento de `temperature`, `top_k` y `seed` no está confirmado.
- Concurrencia limitada a 4 peticiones y salida limitada a 4.096 tokens por preset.
- Compatibilidad de hardware restringida a gfx1151 y gfx1201 según la documentación; otras GPU no están cubiertas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de la cadena de derivación (Unsloth → IBM Granite).
- Riesgo de alucinación y sesgos: no documentados en esta información; deben evaluarse sobre el modelo base.
- El nombre "Loom" colisiona con la plataforma de grabación de vídeo homónima; los resultados de búsqueda web sobre "Loom" no guardan relación con este paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-granite-4.0-micro-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/granite-4.0-micro-GGUF
- Repositorio Loom / hrx-system (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
