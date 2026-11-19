# loom-draft/unsloth-granite-4.0-1b-loom

## Resumen

`loom-draft/unsloth-granite-4.0-1b-loom` es un paquete de despliegue para AMD Loom, no un modelo entrenado desde cero. Consiste en un conjunto de programas `.loom` generados automáticamente con la herramienta `loom-next` (sin intervención de un LLM en el bucle) junto con una tarjeta `model.json`, que envuelven el checkpoint GGUF `granite-4.0-1b-Q4_K_M.gguf` de Unsloth, derivado a su vez del modelo IBM Granite 4.0 de 1.000 millones de parámetros. El objetivo es permitir la inferencia de ese modelo sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Granite 4.0 1B, es un transformer denso de 1B parámetros con licencia Apache 2.0, pensado para tareas de generación de texto, razonamiento ligero, código y tool calling en entornos con recursos limitados. Este paquete concreto no modifica los pesos: solo proporciona kernels y programas de ejecución adaptados a la arquitectura AMD, expuestos mediante una API compatible con OpenAI (`/v1/chat/completions`).

La relevancia de esta ficha es doble: por un lado, documenta una vía de despliegue alternativa a llama.cpp en hardware AMD (ROCm, gfx1151 y gfx1201); por otro, advierte de que el paquete es un borrador (`loom-draft`) sin mediciones de rendimiento ni evidencias de corrección publicadas en la fecha de creación (19 de noviembre de 2026), con 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Granite 4.0 1B); paquete de ejecución Loom sobre GGUF |
| Parámetros totales | 1.000 millones (1B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens por petición (según la tarjeta del paquete) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponibles en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`granite-4.0-1b-Q4_K_M.gguf`) más programas `.loom` y `weights.loom` generados |
| Modelo base | unsloth/granite-4.0-1b-GGUF |
| Concurrencia | 4 peticiones simultáneas |
| Máximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Sí, estilo OpenAI (`tools` y `tool_calls`) |

## Arquitectura y entrenamiento

El modelo subyacente es IBM Granite 4.0 1B, un transformer denso de 1B parámetros distribuido por Unsloth en formato GGUF con cuantización Q4_K_M. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, SSM híbrido) para esta variante de 1B.

La capa aportada por este repositorio es el paquete Loom: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) y un `weights.loom` a partir del GGUF y de `llm_config.json`, junto con `tokenizer.json`. El paquete se sirve con `loom-serve` sobre ROCm, con opciones como `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU). La tarjeta declara explícitamente que no aplica decodificación especulativa, ni modo de razonamiento, ni entrada de imagen o audio.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling / function calling en formato OpenAI (`tools`, `tool_calls`), con soporte de bucle agéntico multi-turno según la puerta `agent` de la tarjeta.
- Contexto de hasta 131.072 tokens por petición, adecuado para documentos largos.
- Concurrencia de 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por respuesta (preset `max_tokens`).
- Sin modo de razonamiento (thinking): la tarjeta marca "not applicable".
- Sin decodificación especulativa: "not applicable".
- Sin entrada de imagen ni audio: "not applicable".
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tarjeta.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: desplegar `loom-serve` sobre una Radeon AI PRO R9700 o Strix Halo para servir un chatbot con API OpenAI en `127.0.0.1:8080`, sin depender de CUDA ni de servicios en la nube, gracias a la integración con ROCm.
- Automatización de soporte técnico con contexto largo: el límite de 131.072 tokens permite adjuntar manuales, históricos de tickets y transcripciones extensas en una sola petición, manteniendo la conversación multi-turno dentro de la ventana.
- Agentes con tool calling en pipelines internos: el soporte de `tools`/`tool_calls` y la puerta `agent` de la tarjeta permiten construir bucles de razonamiento multi-paso que invoquen APIs internas (consulta de bases de datos, envío de correos, gestión de incidencias) desde un modelo de 1B ejecutado en local.
- Prototipado y evaluación de la cadena Loom: usar este paquete como banco de pruebas para validar `loom-next`, `loom-fetch` y `loom-serve` en gfx1151 y gfx1201 antes de migrar a modelos de mayor tamaño.
- Generación de código asistida en entornos con GPU AMD: el modelo base Granite está orientado a tareas de código; con 4 peticiones concurrentes y 4.096 tokens de salida se puede integrar en un servidor de autocompletado o revisión de parches en CI, siempre que se validen las salidas.
- Procesamiento por lotes de documentos con contexto largo: resúmenes, extracción de entidades o clasificación de contratos e informes de hasta ~128k tokens por petición, ejecutados en local para mantener los datos dentro de la infraestructura.
- Despliegue en hardware de consumo profesional AMD: al tratarse de una cuantización Q4_K_M de 1B, el paquete está pensado para APUs y GPUs AMD con memoria unificada o 32 GB de VRAM, lo que facilita entornos de desarrollo sin GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del paquete indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" ("not yet re-measured"), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente sin evidencia registrada. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser una cuantización Q4_K_M de 1B parámetros, el peso de los pesos ronda el orden de 1 GB, aunque el pool de memoria configurado por Loom (`--pool_backing=fixed`) puede reservar más.
- GPUs soportadas según la tarjeta: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no se documenta soporte para RTX 4090, A100, H100 ni otras GPUs NVIDIA; el paquete está generado para ROCm y arquitecturas AMD concretas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete, aunque llama.cpp se usa como referencia de corrección.
- Latencia y throughput: no disponibles; la tarjeta indica que las mediciones aún no se han repetido.
- Concurrencia máxima configurada: 4 peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Observaciones |
|---|---|---|---|---|---|
| loom-draft/unsloth-granite-4.0-1b-loom | 1B | 131.072 | GGUF Q4_K_M + programas `.loom` sobre ROCm (gfx1151, gfx1201) | Apache 2.0 | Paquete de borrador, sin benchmarks ni puertas de corrección medidas |
| unsloth/granite-4.0-1b-GGUF | 1B | no disponible en la información | GGUF para llama.cpp y similares | Apache 2.0 | Checkpoint base del que deriva este paquete |
| IBM Granite 4.0 1B (original) | 1B | no disponible en la información | safetensors y otros formatos | Apache 2.0 | Modelo original de IBM; datos de entrenamiento no detallados aquí |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes (Llama 3.2 1B, Qwen2.5 1.5B, Gemma 3 1B) en términos de rendimiento o contexto verificado; cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Paquete en estado de borrador (`loom-draft`): 0 descargas, 0 likes y sin evidencias de corrección registradas en ninguna de las puertas (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits`, etc.).
- Sin mediciones de rendimiento publicadas frente a llama.cpp en Strix Halo ni en Radeon AI PRO R9700; no se puede afirmar paridad de latencia o throughput.
- El muestreo aparece como "not determined": el comportamiento de temperature, top_k y seed no está verificado.
- El estado de las capacidades de razonamiento, decodificación especulativa, visión y audio es "not applicable" en la tarjeta, por lo que no deben asumirse.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado.
- Riesgo de alucinación inherente a un modelo de 1B parámetros; no se han publicado evaluaciones de fidelidad.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de puertas de corrección y de benchmarks desaconseja producción sin una validación propia previa.
- Dependencia de la cadena Loom (`hrx-loom==0.2.0`, `loom-next`, `loom-fetch`, `loom-serve`) y de ROCm; no es portable a CUDA sin trabajo adicional.
- La tarjeta menciona `REPORT.md` truncado en la información disponible ("how the val..."), por lo que parte de la metodología de validación no es consultable.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-draft/unsloth-granite-4.0-1b-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/granite-4.0-1b-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
