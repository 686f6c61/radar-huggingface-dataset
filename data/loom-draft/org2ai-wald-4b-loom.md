# loom-draft/org2ai-Wald-4B-loom

## Resumen

Wald-4B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `org2ai/Wald-4B-GGUF`, en su cuantizacion Q4_K_M (`Wald-4B-v1.2-Q4_K_M.gguf`). Lo publica el usuario `loom-draft` y esta orientado especificamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No es un modelo nuevo: es un artefacto de empaquetado y compilacion para el runtime Loom, generado con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El modelo subyacente, Wald-4B, es un modelo multimodal de tipo image-text-to-text con 4 mil millones de parametros (el dato se deduce del nombre; la model card no detalla la arquitectura interna). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento activado por defecto y entrada de imagenes mediante el proyector `Wald-4B-v2-mmproj-F16.gguf`.

La relevancia de este artefacto es de infraestructura mas que de modelado: demuestra la compilacion de un GGUF existente a kernels nativos para GPUs AMD via ROCm, con una ventana de contexto declarada de 262.144 tokens por peticion y 4 peticiones concurrentes. La licencia del paquete es Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de correccion figuran como "not yet re-measured" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Wald-4B, multimodal image-text-to-text; detalles internos no publicados en la model card) |
| Parametros totales | 4B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en F16 (`Wald-4B-v2-mmproj-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas Loom (`.loom`) con `model.json` y `tokenizer.json` |

Otros datos operativos declarados en la model card:

| Parametro | Valor |
|---|---|
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | estilo OpenAI `/v1/chat/completions` |
| Tool calling | si (formato OpenAI `tools` / `tool_calls`) |
| Modo thinking | activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Decodificacion especulativa | no aplicable |
| Entrada de audio | no soportada |
| Muestreo (sampling) | no determinado ("not determined") |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Tamano del repo | 0.0 GB (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Wald-4B ni su proceso de entrenamiento: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo unico deducible es que se trata de un transformer multimodal con proyector de vision separado (mmproj), dado el pipeline `image-text-to-text` y la presencia del fichero `Wald-4B-v2-mmproj-F16.gguf`.

La innovacion tecnica de este repositorio no esta en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` (kernels compilados) a partir del GGUF original sin modificarlo, y `loom-serve` los ejecuta sobre ROCm en las GPU AMD indicadas. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`. La model card menciona opciones de despliegue como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host), y recomienda `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento con modo thinking activado por defecto, desactivable por peticion.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles de agente multi-turno segun las puertas de correccion descritas (`agent`, `agent_think_off`).
- Entrada de imagenes via `image_url` con el proyector `Wald-4B-v2-mmproj-F16.gguf`.
- Contexto largo: hasta 262.144 tokens por peticion.
- Concurrencia de 4 peticiones simultaneas con consistencia declarada entre ejecuciones concurrentes y aisladas (puerta `consistency`).
- Sin soporte de audio ni de salida de audio.
- Sin decodificacion especulativa ni ajuste de esfuerzo de razonamiento ("reasoning effort: not applicable").
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola pasada sin troceado, lo que simplifica pipelines de extraccion y resumen.
- Analisis de imagenes en flujos documentales: la entrada `image_url` con proyector F16 permite enviar capturas, diagramas o paginas escaneadas junto a instrucciones textuales para tareas de descripcion o extraccion de datos.
- Agentes con herramientas en local: el soporte de `tool_calls` en formato OpenAI y las puertas `agent`/`agent_think_off` lo hacen adecuado para orquestar llamadas a APIs internas o funciones del sistema en un bucle multi-turno.
- Despliegue en estaciones de trabajo AMD: al estar compilado para Strix Halo y Radeon AI PRO R9700, encaja en entornos con GPU AMD integradas o de escritorio donde no se dispone de CUDA, evitando la dependencia de hardware NVIDIA.
- Asistente conversacional con razonamiento explicito: el modo thinking por defecto resulta util en tareas de analisis paso a paso (clasificacion razonada, diagnostico de errores), y puede desactivarse para respuestas rapidas de baja latencia.
- Servicio de inferencia ligero con concurrencia moderada: con 4 peticiones simultaneas y salida maxima de 4.096 tokens, es viable como backend de un chatbot interno o de una herramienta de productividad para un equipo pequeno.
- Evaluacion y comparacion de runtimes: las puertas de correccion (`golden`, `compare`, `logits`, `sampling`) estan disenadas para verificar que la salida coincide con la referencia de llama.cpp, lo que lo convierte en un banco de pruebas para validar portabilidad de GGUF a ROCm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para ambas GPU ("Strix Halo (gfx1151)" y "Radeon AI PRO R9700 (gfx1201, 32 GB)") figuran como "not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas plataformas. Una puerta sin ejecucion registrada no aporta evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 4B, por lo que el peso de los pesos ronda los 2,5-3 GB, mas el proyector F16 y el pool de memoria del runtime. El paquete esta validado para una GPU de 32 GB (Radeon AI PRO R9700).
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se declara soporte para GPU NVIDIA ni para otras GPU AMD.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo; solo se listan las dos plataformas AMD anteriores.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete, aunque la referencia de correccion se toma contra llama.cpp sobre el mismo GGUF.
- Latencia y throughput: no disponibles; las mediciones comparativas con llama.cpp no se han vuelto a medir.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y el artefacto es especifico del runtime Loom y de dos GPU AMD concretas, lo que limita la comparacion directa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Wald-4B-loom | 4B (segun nombre) | 262.144 | Apache 2.0 | Loom (GGUF Q4_K_M empaquetado) | Solo GPU AMD Strix Halo y R9700 |
| org2ai/Wald-4B-GGUF | 4B (segun nombre) | no disponible | no disponible en esta ficha | GGUF | Checkpoint base sin empaquetar |
| Alternativas de 4B multimodales | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia de evidencia de correccion: todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured"; no hay datos publicados que confirmen la equivalencia con llama.cpp en esta version del paquete.
- Modelo base sin documentar: la model card no detalla arquitectura, datos de entrenamiento, idiomas ni sesgos del modelo Wald-4B subyacente, por lo que no se pueden evaluar riesgos de alucinacion o sesgo con la informacion disponible.
- Idiomas no declarados: no se especifica que idiomas soporta, lo que impide garantizar calidad en castellano u otras lenguas.
- Muestreo no determinado: el parametro de sampling aparece como "not determined", lo que anade incertidumbre sobre el comportamiento de generacion con temperatura y top_k.
- Hardware muy restringido: solo se declaran dos plataformas AMD (gfx1151 y gfx1201); no hay soporte documentado para NVIDIA, CPU u otras GPU AMD.
- Concurrencia limitada: 4 peticiones simultaneas y 4.096 tokens de salida maxima por peticion, insuficiente para cargas de produccion de alta concurrencia.
- Madurez del artefacto: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-19), sin historial de uso ni validacion externa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base `org2ai/Wald-4B-GGUF`, que no se detalla en esta ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/org2ai-Wald-4B-loom
- Modelo base: https://huggingface.co/org2ai/Wald-4B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
