# loom-draft/MaziyarPanahi-Llama-3-8B-Instruct-32k-v0.1-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado a partir del checkpoint GGUF sin modificar `MaziyarPanahi/Llama-3-8B-Instruct-32k-v0.1-GGUF`, en su cuantización Q4_K_M. El autor del paquete es `loom-draft`, y el modelo subyacente es un fine-tune de Llama-3-8B-Instruct con ventana de contexto extendida a 32k, publicado por MaziyarPanahi. El paquete está pensado para ejecutarse sobre las GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `loom-serve`, que expone una API compatible con OpenAI.

La relevancia de este artefacto es de infraestructura más que de modelado: demuestra un flujo de empaquetado y servicio para aceleradores AMD vía ROCm, con kernels generados por `loom-next` (el generador, sin LLM en el bucle) y verificación contra `llama.cpp` como referencia. No hay pesos nuevos, ni dataset de entrenamiento propio, ni cambios en la arquitectura del transformer original de Llama 3.

Conviene subrayar que el paquete fija el contexto servido en 8.192 tokens por petición, muy por debajo de los 32k que sugiere el nombre del checkpoint base, y que el soporte de tool calling, modo razonamiento y decodificación especulativa figura explícitamente como no aplicable en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), servido mediante runtime Loom sobre ROCm |
| Parametros totales | 8.030 millones (8B, según el checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por petición en el preset servido; el checkpoint base declara 32k |
| Tipos de cuantizacion | Q4_K_M (GGUF) en el paquete; otras cuantizaciones del base no empaquetadas aquí |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (`Llama-3-8B-Instruct-32k-v0.1.Q4_K_M.gguf`) más programas `.loom` y `weights.loom` generados |

Otros datos del paquete: salida máxima de 4.096 tokens (preset `max_tokens`), concurrencia de 4 peticiones, API estilo OpenAI en `/v1/chat/completions`, versión del runtime `hrx-loom[hf]==0.2.0`.

## Arquitectura y entrenamiento

El modelo subyacente es Llama-3-8B-Instruct, un transformer decoder-only denso de 8B parámetros con atención causal estándar y RoPE, ajustado por instrucciones y posteriormente adaptado por MaziyarPanahi para extender el contexto a 32k. No se dispone en la información proporcionada de detalles sobre el dataset de ese fine-tune, el número de tokens de entrenamiento, ni si se emplearon técnicas como RLHF, DPO o continued pretraining con RoPE scaling; esos datos corresponden a la model card del checkpoint base, que no se ha incluido aquí.

La innovación del repositorio es el pipeline de despliegue: `loom-next` genera kernels y programas Loom específicos para las arquitecturas gfx1151 y gfx1201, y `loom-serve` los ejecuta con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parámetros (`--parameter_mode=preload`). La verificación se plantea mediante compuertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, entre otras) que comparan la salida greedy y las log-probs top-5 contra `llama.cpp` sobre el mismo GGUF, con prompts cortos y documentos de 1k a 32k. En la fecha de la model card, ninguna de esas compuertas tiene medición registrada para este paquete.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Llama 3 Instruct.
- Razonamiento y respuesta a instrucciones heredados del checkpoint base (no verificados en este paquete).
- Generación de código y matemáticas: capacidad esperable del base, sin benchmarks publicados en este repositorio.
- Servicio HTTP con API compatible con OpenAI (`/v1/chat/completions`), lo que facilita integración con clientes existentes.
- Concurrencia de hasta 4 peticiones simultáneas con consistencia entre peticiones concurrentes y aisladas (compuerta `consistency`, sin medición registrada).
- Tool calling: no aplicable según la model card.
- Modo razonamiento o thinking: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen y entrada/salida de audio: no determinado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: desplegar `loom-serve` en una Radeon AI PRO R9700 y exponer el endpoint `/v1/chat/completions` a una interfaz interna, aprovechando la API compatible con OpenAI para no reescribir clientes.
- Prototipado en hardware Strix Halo: validar flujos de inferencia local en un Ryzen AI Max+ 395 antes de mover cargas a GPU dedicadas, con el mismo paquete y los mismos comandos de arranque.
- Procesamiento de documentos de hasta 8k tokens: resumen y extracción de información de informes, contratos o hilos de correo que quepan en la ventana servida de 8.192 tokens, con salidas de hasta 4.096 tokens.
- Generación de código en entornos con requisitos de soberanía del dato: al ejecutarse en local y con licencia MIT, el paquete permite autocompletado y explicación de código sin enviar el repositorio a un proveedor externo.
- Evaluación comparativa de runtimes: usar las compuertas de corrección de `loom-benchmark` para medir la fidelidad de los kernels generados frente a `llama.cpp` en las mismas prompts, como paso previo a adoptar Loom en producción.
- Banchmarking de latencia y throughput en ROCm: servir cargas sintéticas con concurrencia 4 para caracterizar el rendimiento de gfx1151 y gfx1201 con un modelo de 8B en Q4_K_M.
- Educación e investigación: reproducir experimentos de inferencia cuantizada en GPUs AMD con un stack documentado y verificable token a token contra una referencia conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a `llama.cpp` para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201, 32 GB), y que las compuertas de corrección figuran sin ejecución registrada.

## Requisitos de hardware

- VRAM estimada: un GGUF Q4_K_M de 8B ocupa aproximadamente 4,9 GB de pesos; con overhead de contexto y pool fijo, el consumo real del runtime no está medido en la información disponible.
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU no soportadas o no verificadas: no hay datos para A100, H100, RTX 4090 ni otras tarjetas; el paquete está generado para arquitecturas AMD concretas vía ROCm.
- Cabe en GPU de consumo: no determinado; el paquete no declara soporte para Radeon de gama de consumo distintas de las listadas.
- Opciones de despliegue: `loom-serve` con `hrx-loom[hf]==0.2.0` (instalación vía pipx). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete; `llama.cpp` se usa únicamente como referencia de corrección.
- Latencia y throughput: no disponibles; la model card remite a mediciones pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este paquete (Llama-3-8B-Instruct-32k Q4_K_M para Loom) | 8B | 8.192 tokens servidos (32k en el base) | GGUF + `.loom` | MIT | `loom-serve` sobre gfx1151/gfx1201 |
| `MaziyarPanahi/Llama-3-8B-Instruct-32k-v0.1-GGUF` (base) | 8B | 32k declarados | GGUF | MIT | llama.cpp y otros runtimes GGUF |
| Llama-3-8B-Instruct original (Meta) | 8B | 8k | safetensors, GGUF | Llama 3 Community License | Amplia variedad de runtimes |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | safetensors, GGUF | Apache 2.0 | Amplia variedad de runtimes |

La comparación se limita a parámetros, contexto, formato y licencia: no hay datos de rendimiento publicados para este paquete que permitan contrastar calidad o velocidad con las alternativas.

## Limitaciones y advertencias

- El contexto efectivo servido es de 8.192 tokens por petición, cuatro veces menor que los 32k del checkpoint base; cargas que dependan de ventanas largas fallarán o se truncarán.
- No hay mediciones de corrección registradas: todas las compuertas (`golden`, `compare`, `sampling`, `logits`, `consistency`, etc.) aparecen como "not yet re-measured", por lo que la fidelidad frente a `llama.cpp` no está evidenciada en este paquete.
- Tool calling, modo razonamiento y decodificación especulativa están marcados como no aplicables; no debe asumirse soporte de agentes multi-paso.
- Soporte de imagen y audio figura como "no determinado"; no se debe tratar como modelo multimodal.
- El paquete está atado a dos arquitecturas AMD concretas (gfx1151 y gfx1201); no es portable a NVIDIA ni a otras Radeon sin regeneración.
- Riesgo de alucinación y sesgos: heredados del checkpoint base de Llama 3, sin evaluación específica en este repositorio; no hay datos de sesgo ni de idiomas soportados.
- Licencia MIT declarada en el paquete, pero el modelo base arrastra las condiciones de la Llama 3 Community License de Meta; conviene revisar ambas antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en la fecha de consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-26) es posterior a la de esta ficha; verificar la coherencia temporal de los metadatos antes de citarlos.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/MaziyarPanahi-Llama-3-8B-Instruct-32k-v0.1-loom
- Checkpoint base (GGUF): https://huggingface.co/MaziyarPanahi/Llama-3-8B-Instruct-32k-v0.1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
