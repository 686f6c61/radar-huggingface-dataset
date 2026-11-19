# loom-draft/unsloth-DeepSeek-R1-0528-Qwen3-8B-loom

## Resumen

DeepSeek-R1-0528-Qwen3-8B es un modelo de lenguaje de 8.000 millones de parametros derivado de DeepSeek-R1-0528 y destilado sobre la base arquitectonica de Qwen3-8B. El checkpoint original lo publica Unsloth en formato GGUF, y este repositorio (`loom-draft/unsloth-DeepSeek-R1-0528-Qwen3-8B-loom`) no contiene pesos nuevos: es un paquete de despliegue para la plataforma Loom de AMD, generado con la herramienta `loom-next` a partir del GGUF `DeepSeek-R1-0528-Qwen3-8B-Q4_K_M.gguf` sin modificarlo.

El paquete incluye programas `.loom` compilados, una tarjeta `model.json` con los ficheros de origen fijados por sha256, el tokenizador y la configuracion del modelo. Su objetivo es servir el modelo en GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el servidor `loom-serve` con una API compatible con OpenAI.

Es relevante ahora porque demuestra un flujo de despliegue especifico para hardware AMD integrado y de escritorio, un nicho donde las pilas habituales (CUDA, vLLM) no cubren bien estos aceleradores. Conviene subrayar que el repositorio no aporta mediciones de rendimiento ni evidencia de correccion: todas las puertas de validacion figuran como "no re-medidas" y no hay resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B, destilado de DeepSeek-R1-0528); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 8.000 millones (aproximado, segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF en el checkpoint de origen; empaquetado como programas `.loom` y `weights.loom` en este repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de 8.000 millones de parametros construido sobre Qwen3-8B, ajustado como destilacion de razonamiento a partir de DeepSeek-R1-0528. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron RLHF o DPO en esta variante destilada; tampoco se documentan innovaciones de atencion o decodificacion especulativa.

Este repositorio, en cambio, si documenta su propia capa tecnica: los programas `.loom` y `weights.loom` se generan a partir de `llm_config.json` con `loom-next`, y el servidor `loom-serve` expone un endpoint `/v1/chat/completions` de estilo OpenAI. El preset fija 40.960 tokens de contexto por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida. Segun la tabla de capacidades de la model card, el tool calling, el modo de razonamiento explicito, la decodificacion especulativa y las entradas de imagen o audio figuran como "no aplicable" en este paquete.

## Capacidades

- Generacion de texto conversacional mediante una API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento y cadenas de pensamiento heredados del linaje DeepSeek-R1-0528, aunque el paquete Loom marca el modo de razonamiento como "no aplicable" a nivel de servidor.
- Contexto largo: 40.960 tokens por peticion, suficiente para documentos extensos y conversaciones multi-turno.
- Concurrencia de 4 peticiones simultaneas declarada en el preset.
- Limite de 4.096 tokens de salida por respuesta (`max_tokens` del preset).
- Tool calling y function calling: no disponible en este paquete (marcado como "no aplicable").
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el modelo se sirve con `loom-serve` en Strix Halo o R9700 y responde por HTTP, lo que permite integrarlo en herramientas internas sin depender de servicios en la nube.
- Analisis de documentos largos: con 40.960 tokens de contexto por peticion, cabe procesar informes, contratos o transcripciones extensas en una sola pasada sin truncar.
- Generacion de codigo y explicaciones tecnicas: el linaje Qwen3-8B y la destilacion de razonamiento lo hacen util para tareas de programacion asistida en entornos de desarrollo locales.
- Prototipado de aplicaciones sobre hardware AMD: al exponer una API compatible con OpenAI, cualquier cliente existente (SDK de OpenAI, LangChain, etc.) puede apuntar a `http://127.0.0.1:8080` sin cambios de codigo.
- Evaluacion de la pila Loom frente a llama.cpp: el paquete incluye puertas de correccion (golden, compare, consistency) pensadas para comparar salidas token a token contra la referencia de llama.cpp sobre el mismo GGUF.
- Despliegue en equipos con GPU de 32 GB: la Radeon AI PRO R9700 dispone de 32 GB de VRAM, margen suficiente para un modelo de 8.000 millones en Q4_K_M junto con el contexto configurado.
- Servicio de 4 conversaciones concurrentes en pequenos equipos: la concurrencia declarada permite atender a varios usuarios simultaneamente en un unico nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que ninguna de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) dispone de evidencia registrada.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 8.000 millones de parametros; el peso en VRAM ronda los 5 GB, a lo que se suma la memoria del contexto (hasta 40.960 tokens) y el pool fijado por `--pool_backing=fixed`. La cifra exacta no esta documentada en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no disponible; la informacion solo valida las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete.
- Opciones de servicio recomendadas en la model card: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de completaciones), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este paquete (DeepSeek-R1-0528-Qwen3-8B Q4_K_M para Loom) | 8.000 millones | 40.960 tokens por peticion | MIT | Hugging Face, solo para gfx1151 y gfx1201 | Sin benchmarks ni puertas de correccion medidas |
| unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF (checkpoint de origen) | 8.000 millones | no disponible | MIT | Hugging Face, GGUF generico | Mismo modelo, sin empaquetado especifico para AMD |
| Qwen3-8B (base arquitectonica) | 8.000 millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face | Modelo base sobre el que se construye la destilacion |
| DeepSeek-R1-0528 (modelo profesor) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face | Origen del linaje de razonamiento destilado |

La comparacion con alternativas de la misma categoria en hardware AMD no esta disponible: no se han identificado en la informacion proporcionada otros paquetes Loom equivalentes ni mediciones cruzadas.

## Limitaciones y advertencias

- Ausencia total de evidencia de calidad: todas las puertas de correccion y las mediciones de rendimiento figuran como "no re-medidas"; no hay garantia documentada de que la salida coincida con la referencia de llama.cpp.
- Sesgos conocidos: no documentados en la informacion proporcionada; al ser una destilacion de DeepSeek-R1-0528 sobre Qwen3-8B, hereda los sesgos de ambos, pero no hay analisis publicado en este repositorio.
- Riesgo de alucinacion: no evaluado en este paquete; los modelos de razonamiento destilados de 8.000 millones tienden a producir cadenas de pensamiento plausibles pero incorrectas, y aqui no hay puertas de validacion ejecutadas.
- Contexto limitado a 40.960 tokens por peticion y salida limitada a 4.096 tokens; no se documenta comportamiento mas alla de ese limite.
- Idiomas soportados no declarados; no hay evidencia de calidad multilingue.
- Tool calling, modo de razonamiento explicito, decodificacion especulativa y multimodalidad marcados como "no aplicable" en el servidor Loom, aunque el modelo subyacente podria soportar parte de estas funciones por otras vias.
- Licencia MIT permisiva para uso comercial, pero el paquete solo esta validado para dos plataformas AMD concretas; su uso en otro hardware no esta respaldado por la documentacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validacion comunitaria.
- La decodificacion por muestreo figura como "no determinada" (`sampling: ?`), lo que limita la reproducibilidad de la generacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-DeepSeek-R1-0528-Qwen3-8B-loom
- Checkpoint GGUF de origen: https://huggingface.co/unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF
- Proyecto Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
