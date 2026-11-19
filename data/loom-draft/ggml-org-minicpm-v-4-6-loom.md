# loom-draft/ggml-org-MiniCPM-V-4.6-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue en formato Loom (archivos `.loom` y una tarjeta `model.json`) generado automáticamente con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `MiniCPM-V-4.6-Q4_K_M.gguf` de `ggml-org/MiniCPM-V-4.6-GGUF`. El modelo subyacente es MiniCPM-V 4.6, un modelo multimodal de la familia MiniCPM (OpenBMB) distribuido en cuantización Q4_K_M, pero el paquete Loom solo expone la ruta de texto: la entrada de imagen no está soportada por el runtime Loom, aunque el modelo original sí la tenga.

El objetivo del paquete es ejecutar el modelo en GPUs AMD concretas: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el servidor `loom-serve` con una API compatible con OpenAI (`/v1/chat/completions`). Es relevante para quien quiera servir MiniCPM-V 4.6 sobre ROCm sin pasar por llama.cpp, a cambio de renunciar a la visión y de asumir que las mediciones de rendimiento y las puertas de corrección de este paquete aún no se han vuelto a medir.

El repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB en el momento de la consulta, y se publicó el 19 de noviembre de 2026. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM-V 4.6; el paquete Loom solo documenta la ruta de texto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición (según la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete no ofrece otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`MiniCPM-V-4.6-Q4_K_M.gguf`) más programas Loom generados (`program/*.loom`, `weights.loom`) y `tokenizer.json` |

Otros parámetros operativos declarados: máximo de 4.096 tokens de salida por petición (preset `max_tokens`), 4 peticiones concurrentes, tool calling estilo OpenAI, modo de razonamiento desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`, sin decodificación especulativa y sin *reasoning effort*.

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna ni sobre el entrenamiento del modelo base en la información proporcionada: el paquete Loom no reproduce la model card de MiniCPM-V 4.6, solo referencia el GGUF de `ggml-org`. Lo que sí se documenta es la capa de despliegue: `loom-next` genera kernels y programas Loom a partir del GGUF sin intervención de un LLM en el bucle, y `loom-serve` los ejecuta sobre ROCm con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`).

La tarjeta incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) comparadas contra llama.cpp sobre el mismo GGUF, pero para este paquete todas figuran como "not yet re-measured" en ambas GPUs, es decir, no hay evidencia registrada de que la implementación coincida con la referencia.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y emite `tool_calls`, con soporte de bucles multi-turno de llamadas a herramientas según las puertas `agent` y `agent_think_off`.
- Modo de razonamiento opcional (`enable_thinking`), desactivado por defecto.
- Contexto de 262.144 tokens por petición.
- Concurrencia de 4 peticiones simultáneas.
- Salida limitada a 4.096 tokens por petición en el preset.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tiene.
- Entrada y salida de audio: no aplicable.
- Decodificación especulativa: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens por petición se pueden enviar documentos extensos o historiales de conversación completos sin trocear, útil para análisis de contratos, informes o bases de código.
- Automatización con herramientas en pipelines internos: el soporte de `tools`/`tool_calls` permite encadenar el modelo con APIs internas (consulta de bases de datos, ticketing, ejecución de comandos controlados) en bucles multi-turno.
- Despliegue sobre hardware AMD sin NVIDIA: el paquete está pensado para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB), lo que permite montar inferencia local en estaciones de trabajo con ROCm.
- Servicio de chat interno de baja concurrencia: con 4 peticiones concurrentes encaja en equipos de trabajo pequeños o entornos de desarrollo y pruebas, no en servicios de alta demanda.
- Sustitución de llama.cpp en entornos ROCm: al mantener la API de OpenAI, se puede apuntar un cliente existente al endpoint de `loom-serve` cambiando solo la URL base.
- Evaluación comparativa de runtimes: las puertas de corrección (`golden`, `compare`, `logits`, `sampling`) están diseñadas para verificar token a token la equivalencia con llama.cpp, lo que sirve para validar el runtime antes de adoptarlo.
- Prototipado de agentes con razonamiento opcional: activar `enable_thinking` solo en las peticiones que lo requieran permite alternar entre respuestas rápidas y cadenas de razonamiento más largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La tarjeta indica explícitamente que los resultados de rendimiento frente a llama.cpp "no se han vuelto a medir" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que las puertas de corrección no tienen ejecuciones registradas. No hay datos de latencia, throughput ni comparativas numéricas.

## Requisitos de hardware

- GPUs soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documentan otras.
- VRAM estimada: no disponible. El paquete se distribuye en Q4_K_M y el preset usa pool de memoria fijo, pero la tarjeta no publica el consumo medido.
- GPU de consumo: no disponible; las dos GPUs mencionadas no son de gama consumer convencional.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalación con `pipx`), `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Comando de servicio: `loom-serve --model=minicpm-v-4.6 '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada de imagen | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Este paquete (MiniCPM-V 4.6 Q4_K_M sobre Loom) | no disponible | 262.144 tokens | No (sí en el modelo upstream) | Apache 2.0 | GGUF + programas Loom, `loom-serve` sobre ROCm |
| ggml-org/MiniCPM-V-4.6-GGUF (modelo base) | no disponible | no disponible en la información | Sí (según la tarjeta del paquete, el upstream la tiene) | Apache 2.0 | GGUF, ejecutable con llama.cpp |
| llama.cpp como referencia de corrección | no aplicable | no aplicable | no disponible | MIT (no confirmado en la información) | Runtime de referencia usado en las puertas `golden` y `compare` |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete no soporta entrada de imagen, pese a que el modelo base es multimodal; quien necesite visión debe usar el GGUF original con otro runtime.
- No hay mediciones de rendimiento ni de corrección registradas para este paquete: todas las puertas figuran como "not yet re-measured". No hay evidencia publicada de equivalencia con llama.cpp.
- El repositorio tiene 0 descargas y 0 likes y un tamaño de 0.0 GB, lo que sugiere que los artefactos pueden no estar materializados o que el paquete es un borrador (`loom-draft`).
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por petición en el preset; no es adecuado para servicios de alta demanda sin ajustar la configuración.
- Solo se documentan dos GPUs AMD; no hay información sobre funcionamiento en otras GPUs o en CPU.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones del repositorio `ggml-org/MiniCPM-V-4.6-GGUF` antes de producción.
- Dependencia de una versión concreta del runtime (`hrx-loom[hf]==0.2.0`) y de los archivos fijados por sha256 en `model.json.lock`; actualizar el runtime puede invalidar el paquete.
- Los resultados de búsqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa) y no aportan información técnica sobre este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-MiniCPM-V-4.6-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/MiniCPM-V-4.6-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
