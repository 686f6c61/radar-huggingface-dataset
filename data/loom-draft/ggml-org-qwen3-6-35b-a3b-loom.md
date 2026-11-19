# loom-draft/ggml-org-Qwen3.6-35B-A3B-loom

## Resumen

El repositorio `loom-draft/ggml-org-Qwen3.6-35B-A3B-loom` no contiene un modelo entrenado por su autor, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/Qwen3.6-35B-A3B-GGUF`, en su cuantización `Q4_K_M`. El paquete lo publica el usuario `loom-draft` y está orientado a dos aceleradores AMD concretos: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se realizó con la herramienta `loom-next`, sin LLM en el bucle.

El modelo subyacente es un Qwen3.6 de 35 000 millones de parámetros totales con arquitectura MoE y aproximadamente 3 000 millones de parámetros activos por token (el sufijo `A3B` así lo indica), con soporte de entrada de imagen mediante el proyector `mmproj-Qwen3.6-35B-A3B-BF16.gguf`. El paquete declara una ventana de contexto de 262 144 tokens por petición, hasta 4 peticiones concurrentes y un máximo de 4096 tokens de salida en el preset.

Su relevancia es acotada pero específica: ofrece una vía empaquetada para servir un modelo multimodal grande en hardware AMD consumer y de estación de trabajo con ROCm, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y modo de razonamiento. No obstante, el propio autor indica que las mediciones de rendimiento y las puertas de corrección todavía no se han vuelto a medir para este paquete.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (modelo base Qwen3.6-35B-A3B); paquete de despliegue Loom sobre GGUF |
| Parámetros totales | 35 000 millones (según nomenclatura del modelo base) |
| Parámetros activos | aproximadamente 3 000 millones (sufijo A3B) |
| Longitud de contexto | 262 144 tokens por petición |
| Tipos de cuantización | Q4_K_M (checkpoint incluido); proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.6-35B-A3B-Q4_K_M.gguf`) más proyector `mmproj-Qwen3.6-35B-A3B-BF16.gguf`; artefactos Loom (`program/*.loom`, `weights.loom`, `model.json`) |
| Pipeline | image-text-to-text |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones simultáneas |
| Máximo de tokens de salida | 4096 (preset `max_tokens`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de 35 000 millones de parámetros totales y unos 3000 millones activos por token, según la nomenclatura `35B-A3B` del checkpoint original. El paquete Loom no modifica los pesos: envuelve el GGUF `Q4_K_M` en kernels generados para las arquitecturas AMD gfx1151 y gfx1201, y añade el proyector multimodal BF16 para la entrada de imagen. La generación del paquete se hizo con `loom-next`, el generador del ecosistema Loom, sin intervención de un LLM en el bucle.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) del modelo base, ya que la model card del paquete Loom no las documenta. Tampoco se documentan innovaciones de decodificación: la tabla de características marca la decodificación especulativa como «not applicable» y el ajuste de esfuerzo de razonamiento («reasoning effort») también como no aplicable.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen en formato OpenAI (`image_url`) mediante el proyector `mmproj-Qwen3.6-35B-A3B-BF16.gguf`, con pipeline image-text-to-text.
- Tool calling estilo OpenAI, con campos `tools` y `tool_calls` en la API.
- Bucles de agente multiturno con reutilización de historial, según la puerta de corrección `agent` definida por el autor.
- API compatible con OpenAI en `/v1/chat/completions`, servida localmente en el puerto 8080.
- Concurrencia de hasta 4 peticiones simultáneas con contexto de 262 144 tokens por petición.
- Sin soporte de audio ni de salida de audio (marcado como «not applicable»).
- Sin decodificación especulativa (marcada como «not applicable»).
- Comportamiento de muestreo (temperatura, top_k, semilla) marcado como «not determined» en la tabla de características.

## Casos de uso

- Asistente multimodal local sobre Strix Halo: un equipo con Ryzen AI Max+ 395 puede servir el paquete con `loom-serve` y atender consultas que combinan texto e imágenes sin depender de la nube, gracias al proyector de visión incluido y a la API compatible con OpenAI.
- Automatización de agentes con herramientas: el soporte de `tools` y `tool_calls` permite construir flujos donde el modelo decide invocar funciones externas (consulta de bases de datos, APIs internas) y encadenar varios pasos con historial reutilizado.
- Procesamiento de documentos largos: la ventana de 262 144 tokens por petición permite analizar contratos, informes o expedientes completos en una sola llamada, algo relevante para tareas de extracción y resumen sobre corpus extensos.
- Despliegue en estación de trabajo con Radeon AI PRO R9700: los 32 GB de memoria de la GPU permiten alojar el GGUF Q4_K_M con el proyector BF16 y servir hasta 4 peticiones concurrentes en un equipo de sobremesa.
- Prototipado de aplicaciones con API OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente (SDK de OpenAI, LangChain, etc.) al servidor local cambiando solo la URL base, lo que acelera la validación de ideas sin coste de API.
- Evaluación de cuantizaciones en hardware AMD: el paquete sirve como banco de pruebas para comparar el comportamiento del GGUF Q4_K_M frente a la referencia de llama.cpp mediante las puertas `golden`, `compare` y `logits` definidas por el autor.
- Moderación o clasificación de imágenes con texto: la combinación de entrada visual y generación de texto permite etiquetar, describir o clasificar imágenes dentro de un pipeline local, siempre que se validen antes las puertas de corrección de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured». No se ofrecen cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el GGUF Q4_K_M de un modelo de 35 000 millones de parámetros ronda los 20-22 GB de pesos, a lo que se suma el proyector BF16 y el pool de memoria fijado con `--pool_backing=fixed`. El autor no publica la cifra exacta.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con GPU NVIDIA ni con GPU AMD de gama consumer distintas de las citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Opciones relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; el autor no ha vuelto a medir el rendimiento de este paquete frente a llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este paquete Loom) | 35B totales / ~3B activos | 262 144 | Apache 2.0 | GGUF Q4_K_M + artefactos Loom | Solo AMD gfx1151 y gfx1201; rendimiento no remedido |
| ggml-org/Qwen3.6-35B-A3B-GGUF (modelo base) | 35B totales / ~3B activos | no disponible en la información | Apache 2.0 (heredada) | GGUF | Checkpoint original sin empaquetar; sirve como referencia de corrección para las puertas del paquete Loom |
| llama.cpp (runtime) | no aplica | según modelo | MIT (runtime) | GGUF | Referencia frente a la que el autor compara las salidas; no es un modelo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este paquete con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete no ha superado ninguna de las puertas de corrección declaradas por el autor: todas figuran como «not yet re-measured», por lo que no hay evidencia registrada de equivalencia con llama.cpp en kernels, tokens greedy, visión, concurrencia, tool calling ni muestreo.
- Las mediciones de rendimiento frente a llama.cpp tampoco se han vuelto a realizar para este paquete en ninguna de las dos GPU objetivo.
- El soporte de hardware está restringido a AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se documenta funcionamiento en otras GPU.
- El comportamiento de muestreo (temperatura, top_k, semilla) figura como «not determined», lo que impide garantizar reproducibilidad de salidas no greedy.
- No se documentan los idiomas soportados por el modelo base, ni sus sesgos, ni su tasa de alucinación; estos riesgos deben evaluarse sobre el modelo Qwen3.6-35B-A3B original.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base `ggml-org/Qwen3.6-35B-A3B-GGUF` antes de desplegar en producción.
- El paquete tiene 0 descargas y 0 «likes» en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-19), lo que indica que no ha pasado por validación comunitaria.
- El límite de 4096 tokens de salida del preset puede ser insuficiente para tareas de generación larga, a pesar de la ventana de contexto de 262 144 tokens.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3.6-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
