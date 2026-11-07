# loom-fun/unsloth-Qwen3-VL-8B-Instruct-loom

## Resumen

`loom-fun/unsloth-Qwen3-VL-8B-Instruct-loom` es un paquete de despliegue para el motor Loom (runtime de inferencia para GPUs AMD, desarrollado en el repositorio `ROCm/hrx-system`) que empaqueta el checkpoint GGUF sin modificar `Qwen3-VL-8B-Instruct-Q4_K_M.gguf` de Unsloth, derivado a su vez del modelo Qwen3-VL-8B-Instruct de Alibaba. No se trata de un modelo nuevo ni de un fine-tuning: es una distribucion que incluye programas `.loom` y una tarjeta `model.json` para servir el modelo mediante `loom-serve` con una API compatible con OpenAI.

El interes practico esta en el objetivo de hardware: el paquete se genera y valida en un AMD Ryzen AI Max+ 395 "Strix Halo" con grafica Radeon 8060S (gfx1151), un SoC de memoria unificada que no encaja bien en los flujos habituales de CUDA. La model card reporta comparativas directas contra llama.cpp sobre el mismo GGUF, con ganancias de hasta el 71 % en prefill y del 15 % en decodificacion con prompt corto, aunque con una perdida del 26 % en decodificacion a 32k de contexto.

El modelo subyacente es multimodal (image-text-to-text) con 8B parametros, contexto declarado de 262.144 tokens por peticion, soporte de tool calling y decodificacion especulativa mediante n-gram prompt lookup. La ficha del repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas, por lo que su uso en produccion requiere verificar primero la licencia del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) del modelo base Qwen3-VL; el paquete es un artefacto de despliegue Loom sobre GGUF |
| Parametros totales | 8B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (checkpoint incluido); proyector de vision en F16 (`mmproj-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio del paquete; debe consultarse la del modelo base |
| Formato de pesos | GGUF (Q4_K_M) mas paquete Loom (`.loom` y `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | n-gram prompt lookup, profundidad 2, activada por defecto |
| API | OpenAI-style `/v1/chat/completions`, `tools` y `tool_calls` |
| Entrada de imagen | `image_url` estilo OpenAI, con proyector `mmproj-F16.gguf` |
| Audio | no soportado |
| Modo razonamiento / thinking | no soportado |

## Arquitectura y entrenamiento

El paquete no aporta entrenamiento propio: reutiliza el checkpoint `Qwen3-VL-8B-Instruct-Q4_K_M.gguf` publicado por Unsloth, que es una cuantizacion del modelo Qwen3-VL-8B-Instruct. La arquitectura, por tanto, es la del modelo base Qwen3-VL, un transformer multimodal que procesa texto e imagenes mediante un proyector de vision separado (`mmproj-F16.gguf` en esta distribucion). La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica del paquete esta en el runtime, no en los pesos. Loom genera kernels especificos para la GPU objetivo (gfx1151 en Strix Halo) y aplica decodificacion especulativa por n-gram prompt lookup con profundidad 2, activada por defecto. La model card documenta un conjunto de puertas de validacion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `needle`) que comparan la salida contra llama.cpp sobre el mismo GGUF: 39 de 39 tests de kernel superados y equivalencia token a token salvo empates cercanos en `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling` y `needle`. La puerta `needle_full` (needle-in-a-haystack a contexto completo) no presenta evidencia.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto declarado de hasta 262.144 tokens por peticion.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, con proyector de vision F16; tareas de image-text-to-text.
- Tool calling estilo OpenAI: acepta `tools` y emite `tool_calls`; la puerta `agent` valida el bucle multi-turno de llamadas a herramientas con renderizado exacto del prompt y reutilizacion de historial.
- Decodificacion especulativa n-gram integrada (profundidad 2), con la garantia de que la salida con especulacion activa es identica a la obtenida con ella desactivada (puerta `spec`).
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de 4 peticiones con consistencia verificada frente a ejecuciones aisladas (puerta `consistency`).
- Sin modo de razonamiento o thinking, sin control de esfuerzo de razonamiento y sin audio de entrada o salida.

## Casos de uso

- Asistente conversacional con documentos largos: con 262.144 tokens de contexto por peticion y prefill de 1.035 tok/s a 16k documentos, el modelo puede ingerir informes extensos y responder preguntas sobre ellos en una sola llamada.
- Procesamiento de documentos escaneados con imagen: al aceptar `image_url`, se puede enviar la pagina como imagen junto a la pregunta, util para extraccion de datos de facturas, formularios o capturas.
- Agente con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle de agente validado permiten construir asistentes que consultan APIs internas, bases de datos o sistemas de ticketing sin salir del equipo.
- Despliegue en estaciones de trabajo AMD sin CUDA: el paquete esta pensado para Strix Halo (Ryzen AI Max+ 395, Radeon 8060S), lo que permite servir el modelo en un equipo integrado con memoria unificada y 59 GB asignables (`--memory_bytes=59000000000`).
- Servicio interno compatible con OpenAI: al exponer `/v1/chat/completions`, se puede sustituir un endpoint remoto por `loom-serve` en `127.0.0.1:8080` sin reescribir los clientes existentes.
- Clasificacion y resumen de imagenes en lote: con 4 peticiones concurrentes y 116,8 tok/s agregados en decodificacion, es viable procesar lotes moderados de imagenes con descripciones o extraccion de campos.
- Prototipado de pipelines multimodales: la equivalencia verificada contra llama.cpp en `vision` y `compare` facilita migrar prototipos ya escritos para llama.cpp sin cambiar de comportamiento esperado.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04, hrx-loom 0.1.0, el 2026-11-07, sobre el mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 37,9 | 43,4 | +15 % | 48,2 | 90 % |
| Decode tok/s, contexto 2k | 33,6 | 38,6 | +15 % | 47,0 | 82 % |
| Decode tok/s, contexto 32k | 22,3 | 16,4 | -26 % | 24,6 | 67 % |
| Prefill tok/s, documento 1k | 1.022,5 | 1.438,2 | +41 % | 4.158,9 | 35 % |
| Prefill tok/s, documento 2k | 919,0 | 1.473,7 | +60 % | 4.074,2 | 36 % |
| Prefill tok/s, documento 8k | 814,9 | 1.248,4 | +53 % | 3.630,6 | 34 % |
| Prefill tok/s, documento 16k | 604,7 | 1.035,1 | +71 % | 3.170,3 | 33 % |
| Prefill tok/s, documento 32k | 410,5 | 663,8 | +62 % | 2.529,1 | 26 % |
| 4 streams, decode agregado tok/s | 87,7 | 116,8 | +33 % | 209,7 | 56 % |
| Tokens especulativos aceptados | no medido | 11 % | no aplica | no aplica | no aplica |

Notas de la model card: la aceptacion del draft en decodificacion fue del 2 % (prompt corto), 4 % (2k) y 3 % (32k), y del 11 % en la puerta `spec` usada para la fila de 4 streams. El roofline se calcula a 216 GB/s y 59 TFLOP/s. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de arranque usa `--memory_bytes=59000000000` (59 GB) sobre memoria unificada; el GGUF Q4_K_M de un modelo de 8B mas el proyector F16 ocupa bastante menos, pero el runtime reserva ese margen para cache KV y buffers con contexto largo.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" con Radeon 8060S (gfx1151), el unico dispositivo con mediciones publicadas. No hay datos para A100, H100 ni RTX 4090 en la informacion disponible.
- GPU de consumo: el paquete esta orientado a graficas integradas AMD con memoria unificada; no se documenta compatibilidad con GPUs NVIDIA ni con modelos concretos de consumo.
- Despliegue: `pip install "hrx-loom[hf]"`, descarga con `loom-fetch` y servicio con `loom-serve --model=... --device=amdgpu`; expone API OpenAI en `127.0.0.1:8080`. No se documenta soporte de vLLM, TGI, Ollama o llama.cpp dentro de este paquete (llama.cpp se usa solo como referencia de comparacion).
- Latencia y throughput: 43,4 tok/s en decodificacion con prompt corto, 38,6 tok/s a 2k y 16,4 tok/s a 32k; prefill entre 663,8 y 1.473,7 tok/s segun longitud; 116,8 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3-VL-8B-Instruct-loom | 8B | 262.144 | Si (imagen) | no disponible | GGUF Q4_K_M + paquete Loom |
| unsloth/Qwen3-VL-8B-Instruct-GGUF (base) | 8B | no disponible en la informacion | Si (imagen) | no disponible | GGUF |
| unsloth/Qwen3-VL-8B-Instruct | 8B | no disponible en la informacion | Si (imagen) | no disponible | safetensors y derivados |
| loom-fun/unsloth-Qwen3-8B-loom | 8B | no disponible en la informacion | No (solo texto) | no disponible | GGUF + paquete Loom |

La comparacion de rendimiento relevante es contra llama.cpp sobre el mismo GGUF, recogida en la tabla de benchmarks. No se dispone de datos de calidad comparada (benchmarks academicos) para ninguno de estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitacion de Qwen3-VL-8B-Instruct (sesgos, alucinacion, cobertura idiomatica) se hereda sin cambios.
- Licencia no declarada en el repositorio del paquete; antes de uso comercial hay que verificar la licencia del checkpoint base de Unsloth y la del modelo Qwen3-VL original.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue concreta sin comprobacion empirica.
- Perdida de rendimiento en decodificacion a contexto largo: -26 % frente a llama.cpp a 32k (16,4 frente a 22,3 tok/s), relevante para cargas de generacion larga sobre documentos extensos.
- La puerta `needle_full` (needle-in-a-haystack a contexto completo) no tiene evidencia; el contexto de 262.144 tokens no esta validado al maximo en la informacion disponible.
- La aceptacion del draft especulativo es baja (2-4 % en decodificacion, 11 % en la puerta `spec`), por lo que la ganancia de la decodificacion especulativa en este hardware es limitada.
- Sin modo de razonamiento o thinking y sin audio: no apto para tareas que dependan de cadenas de pensamiento explicitas o de entrada de voz.
- Salida maxima limitada a 4.096 tokens por preset; para respuestas muy largas hay que ajustar el preset o trocear la generacion.
- Validacion unicamente en un dispositivo (Ryzen AI Max+ 395, gfx1151) y una version del runtime (hrx-loom 0.1.0); el comportamiento en otro hardware AMD no esta documentado.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/unsloth-Qwen3-VL-8B-Instruct-loom
- Checkpoint GGUF base: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- Modelo base en formato original: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch run 42383420594): https://github.com/loom-fun/loom-skills/actions/runs/42383420594
- Paquete Loom equivalente solo texto: https://huggingface.co/loom-fun/unsloth-Qwen3-8B-loom
