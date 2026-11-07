# loom-fun/unsloth-Qwen3-VL-4B-Instruct-loom

## Resumen

`loom-fun/unsloth-Qwen3-VL-4B-Instruct-loom` es un paquete de despliegue para el checkpoint GGUF `Qwen3-VL-4B-Instruct-Q4_K_M.gguf` de Unsloth, empaquetado por loom-fun para ejecutarse sobre el runtime Loom en hardware AMD. No es un modelo nuevo ni un fine-tune: los pesos son los del Qwen3-VL-4B-Instruct original (4B parametros, vision-lenguaje, familia Qwen3 de Alibaba), sin modificar. Lo que anade el repositorio es un formato propio (`.loom` y un `model.json`) generado con el flujo `loom-skills` en un AMD Ryzen AI Max+ 395 "Strix Halo".

El interes practico esta en el rendimiento del runtime frente a llama.cpp sobre el mismo GGUF: mejoras de +13 % a +16 % en decodificacion con contexto corto y +70 % a +96 % en prefill de documentos de 1k a 32k tokens, aunque con una perdida de -32 % en decodificacion a 32k de contexto. Incorpora decodificacion especulativa por n-gram prompt lookup (profundidad 2) activada por defecto y expone una API compatible con OpenAI (`/v1/chat/completions`) con soporte de tool calling e imagenes.

Es relevante para quien quiera servir un VLM de 4B en GPUs integradas AMD (gfx1151) con un motor alternativo a llama.cpp y metricas de correccion publicadas frente a la referencia. El modelo en si carece de modo razonamiento, audio y de una licencia declarada en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL); pesos GGUF Q4_K_M |
| Parametros totales | 4B (heredado de Qwen3-VL-4B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado); proyector de vision `mmproj-F16.gguf` |
| Idiomas soportados | no disponible en este repositorio |
| Licencia | no disponible en este repositorio |
| Formato de pesos | GGUF (empaquetado como `.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer denso de 4B parametros con torre de vision y proyector multimodal, en la linea Qwen3-VL de Alibaba. Este repositorio no aporta informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO; esos detalles corresponden a la model card original de Qwen3-VL y a la del checkpoint de Unsloth, no a este paquete.

La innovacion tecnica del paquete es de infraestructura, no de modelado: kernels generados y validados contra implementaciones de referencia (43/43 tests), decodificacion especulativa por n-gram prompt lookup con profundidad 2 y verificacion por pasada, y un servidor que reutiliza historial en bucles de tool calling. La correccion se valida con compuertas `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling` y `needle` frente a llama.cpp sobre el mismo GGUF; la compuerta `needle_full` (aguja en pajar a contexto completo) no tiene evidencia.

## Capacidades

- Generacion de texto y comprension de imagenes en un solo pipeline `image-text-to-text` (entrada via `image_url` estilo OpenAI).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, con bucle multi-turno validado en la compuerta `agent`.
- Contexto largo: 262.144 tokens por peticion, con prueba de aguja en pajar hasta la mitad del contexto.
- Concurrencia de 4 peticiones con salida identica a ejecuciones aisladas (compuerta `consistency`).
- Decodificacion especulativa n-gram activada por defecto, con salida identica a la decodificacion sin especulacion (compuerta `spec`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Sin modo razonamiento/thinking, sin reasoning effort y sin audio de entrada o salida.

## Casos de uso

- Atencion al cliente multimodal: el modelo acepta imagenes adjuntas (capturas, fotos de producto) y mantiene conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite arrastrar historial e imagenes previas sin truncar.
- Extraccion de datos de documentos escaneados: con prefill de 2.608 tok/s en documentos de 1k y 2.054 tok/s en 8k sobre Strix Halo, procesar lotes de facturas o formularios es viable en una GPU integrada.
- Agentes con herramientas: el soporte de `tool_calls` y la validacion de bucles multi-turno permiten orquestar agentes que consulten APIs o bases de datos y encadenen pasos.
- Asistente de soporte tecnico con capturas de pantalla: el usuario envia una imagen del error y el modelo responde en el mismo hilo; el proyector F16 mantiene la calidad visual.
- Servicio local en estaciones de trabajo AMD: el paquete se sirve con `loom-serve --device=amdgpu` en Ryzen AI Max+ 395, util para entornos sin GPU discreta NVIDIA.
- Procesamiento por lotes con concurrencia: 4 peticiones simultaneas con 159 tok/s agregados de decodificacion permiten atender varias sesiones ligeras por nodo.
- Clasificacion y resumen de imagenes en pipelines internos: la API compatible con OpenAI facilita sustituir el endpoint por este servidor sin cambiar el cliente.

## Benchmarks y rendimiento

Rendimiento del runtime Loom frente a llama.cpp sobre el mismo GGUF, en AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04, medido el 2026-11-07:

| Metrica | llama.cpp | Loom | Diferencia | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 59,8 | 69,4 | +16 % | 90,7 | 77 % |
| Decodificacion tok/s, contexto 2k | 49,6 | 56,2 | +13 % | 83,9 | 67 % |
| Decodificacion tok/s, contexto 32k | 28,4 | 19,2 | -32 % | 32,5 | 59 % |
| Prefill tok/s, documento 1k | 1643,2 | 2608,8 | +59 % | 7802,6 | 33 % |
| Prefill tok/s, documento 2k | 1366,0 | 2677,0 | +96 % | 7509,7 | 36 % |
| Prefill tok/s, documento 8k | 1152,2 | 2054,6 | +78 % | 6129,3 | 34 % |
| Prefill tok/s, documento 16k | 769,2 | 1507,4 | +96 % | 4922,7 | 31 % |
| Prefill tok/s, documento 32k | 481,2 | 819,1 | +70 % | 3532,1 | 23 % |
| 4 streams, decodificacion agregada tok/s | 116,6 | 159,0 | +36 % | 376,5 | 42 % |
| Tokens especulativos aceptados | — | 12 % | — | n/a | n/a |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores miden rendimiento del motor, no capacidad del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el ejemplo de arranque reserva 56.000.000.000 bytes (`--memory_bytes=56000000000`) en un Ryzen AI Max+ 395 con memoria unificada.
- GPU recomendadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) es el hardware validado; el runtime se invoca con `--device=amdgpu`.
- GPU de consumo: no hay datos de ejecucion en RTX 4090 u otras GPU NVIDIA; el paquete esta orientado a AMD.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve` como servidor en `127.0.0.1:8080`. No se documenta soporte de vLLM, Ollama ni TGI para este paquete; el GGUF base puede usarse con llama.cpp de forma independiente.
- Latencia y throughput: 69,4 tok/s de decodificacion con prompt corto y 2.608,8 tok/s de prefill en 1k; cae a 19,2 tok/s de decodificacion y 819,1 tok/s de prefill a 32k de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Motor / formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3-VL-4B-Instruct-loom | 4B | 262.144 | Loom, GGUF Q4_K_M | no disponible | Optimizado para AMD Strix Halo; +16 % decodificacion y +59 % prefill vs llama.cpp en contexto corto |
| unsloth/Qwen3-VL-4B-Instruct-GGUF | 4B | 262.144 (heredado) | GGUF, llama.cpp | no disponible en la informacion | Checkpoint base sin empaquetar; referencia de correccion |
| unsloth/Qwen3-VL-4B-Instruct-bnb-4bit | 4B | 262.144 (heredado) | safetensors 4-bit, transformers | no disponible en la informacion | Variante para carga con bitsandbytes, no orientada a inferencia GGUF |

## Limitaciones y advertencias

- Sin modo razonamiento ni reasoning effort: no apto para tareas que requieran cadenas de pensamiento explicitas.
- Decodificacion a 32k de contexto un 32 % mas lenta que llama.cpp; para cargas con contextos muy largos y generacion dominante, llama.cpp puede ser preferible.
- La compuerta `needle_full` (aguja en pajar a contexto completo) no tiene evidencia; el contexto maximo de 262.144 tokens no esta verificado en su totalidad.
- Solo 4 peticiones concurrentes y 4.096 tokens de salida maxima por defecto.
- Sin soporte de audio.
- Licencia no declarada en este repositorio: verificar la licencia del checkpoint original Qwen3-VL-4B-Instruct y del GGUF de Unsloth antes de uso comercial.
- Idiomas soportados no documentados en este repositorio.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; aplican los del modelo base.
- Hardware validado unicamente en AMD Ryzen AI Max+ 395; no hay evidencia de funcionamiento en otras GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3-VL-4B-Instruct-loom
- Checkpoint base GGUF: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-GGUF
- Modelo original Unsloth: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct
- Variante 4-bit: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-bnb-4bit
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch run 42387809942): https://github.com/loom-fun/loom-skills/actions/runs/42387809942
