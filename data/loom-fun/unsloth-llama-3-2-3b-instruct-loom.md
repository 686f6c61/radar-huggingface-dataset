# loom-fun/unsloth-Llama-3.2-3B-Instruct-loom

## Resumen

`loom-fun/unsloth-Llama-3.2-3B-Instruct-loom` no es un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) construido sobre el checkpoint GGUF sin modificar `unsloth/Llama-3.2-3B-Instruct-GGUF`, en su variante `Llama-3.2-3B-Instruct-Q4_K_M.gguf`. El autor es `loom-fun`, y el paquete se generó con el flujo de trabajo `loom-skills` sobre hardware AMD Ryzen AI Max+ 395 "Strix Halo" (iGPU Radeon 8060S, gfx1151).

El interés del repositorio no está en el modelo en sí, sino en el motor de inferencia que lo acompaña: Loom (`hrx-loom`), que expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, decodificación especulativa mediante n-gram prompt lookup con profundidad 2 y concurrencia de 4 peticiones. El autor publica una comparativa frente a llama.cpp sobre el mismo GGUF y el mismo equipo, con mejoras de throughput de decodificación que van del +36 % con prompt corto al +307 % con contexto de 32k.

Es relevante ahora porque documenta una alternativa de serving para GPUs integradas AMD (Strix Halo) con verificación de correctitud frente a llama.cpp (gates `golden`, `compare`, `consistency`, `spec`, `agent`, `needle`), un nicho donde el ecosistema de motores de inferencia optimizados es todavía escaso. El modelo base es Llama 3.2 3B Instruct, un transformer denso de Meta con 3.000 millones de parámetros y 131.072 tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2, modelo base de Meta) |
| Parametros totales | 3B (aproximado, segun familia Llama 3.2 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens por peticion (segun model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unica variante empaquetada) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | GGUF (`Llama-3.2-3B-Instruct-Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 3B Instruct de Meta: un transformer denso decoder-only con 3.000 millones de parámetros, ajustado con instrucciones. El paquete Loom no modifica los pesos; reutiliza el GGUF publicado por Unsloth y añade un `model.json` con ficheros fuente fijados por hash SHA-256 (verificado por `loom-fetch`) y programas `.loom` que implementan los kernels de inferencia para el backend AMD.

La innovación técnica del paquete es el motor Loom: decodificación especulativa con n-gram prompt lookup de profundidad 2 activada por defecto, kernels generados y validados contra implementaciones de referencia (37/37 tests de kernel superados), y un conjunto de gates de correctitud que comparan la salida greedy y las top-5 log-probs contra llama.cpp sobre el mismo GGUF, con prompts cortos y documentos de 1k a 32k tokens. No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional e instrucciones en formato chat (modelo Instruct).
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), validado por el gate `agent` con un bucle multi-turno de llamadas a herramientas.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Decodificación especulativa n-gram prompt lookup con profundidad 2, activada por defecto, con salida idéntica a la decodificación sin especulación (gate `spec`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`, con distribución del primer token validada frente a llama.cpp.
- Concurrencia de 4 peticiones simultáneas con consistencia de salida respecto a ejecuciones aisladas (gate `consistency`).
- Límite de salida de 4.096 tokens por petición (`max_tokens` predefinido).
- Modo razonamiento/thinking: no soportado.
- Entrada de imagen: no soportada. Entrada/salida de audio: no soportada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con iGPU AMD Strix Halo: el paquete se sirve con `loom-serve --device=amdgpu` y responde por API OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Automatización de agentes con herramientas: el soporte de `tool_calls` y el gate `agent` validado permiten construir bucles de razonamiento multi-paso que invocan APIs externas (calendario, shell, consultas a bases de datos) con renderizado de prompt exacto y reutilización de historial.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto por petición y prefill medido de 949,7 tok/s a 32k, es viable resumir o extraer información de contratos, informes o transcripciones sin salir del equipo.
- Servicio de chat para equipos pequeños: 4 peticiones concurrentes con 234,1 tok/s agregados en decodificación permiten atender a varios usuarios simultáneos en una única máquina.
- Prototipado y evaluación de pipelines RAG: la API OpenAI y el soporte de `seed` facilitan pruebas reproducibles de recuperación y generación antes de migrar a hardware mayor.
- Desarrollo y benchmarking de motores de inferencia: el repositorio sirve como referencia reproducible (gates, roofline, comparativa con llama.cpp) para validar kernels y estrategias de decodificación especulativa en GPUs AMD.
- Inferencia de código y tareas de instrucción general en entornos sin GPU dedicada: el modelo de 3B en Q4_K_M se ajusta al presupuesto de memoria de una iGPU y ofrece tool calling suficiente para asistentes de edición y automatización de scripts.

## Benchmarks y rendimiento

Rendimiento del motor Loom frente a llama.cpp sobre el mismo GGUF y el mismo equipo (AMD Ryzen AI Max+ 395, Radeon 8060S, Ubuntu 24.04; llama.cpp `b1369` con `-ngl 99 -cram 0 -c 35024 -kvu -np 4`; Loom `0.1.0` con decodificación especulativa n-gram, profundidad 2). Medición del 2026-11-07.

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 68,8 | 93,4 | +36 % | 118,5 | 79 % |
| Decode tok/s, contexto 2k | 47,3 | 88,3 | +87 % | 123,0 | 72 % |
| Decode tok/s, contexto 32k | 16,5 | 67,1 | +307 % | 98,5 | 68 % |
| Prefill tok/s, documento 1k | 2089,1 | 3092,7 | +48 % | 10156,3 | 30 % |
| Prefill tok/s, documento 2k | 1729,8 | 3096,6 | +79 % | 9864,2 | 31 % |
| Prefill tok/s, documento 8k | 1494,3 | 2423,1 | +62 % | 8412,5 | 29 % |
| Prefill tok/s, documento 16k | 974,4 | 1828,9 | +88 % | 7032,5 | 26 % |
| Prefill tok/s, documento 32k | 671,9 | 949,7 | +41 % | 5295,2 | 18 % |
| 4 streams, decode agregado tok/s | 86,7 | 234,1 | +170 % | 438,3 | 53 % |
| Decodificación especulativa, tokens aceptados | — | 8 % | — | n/a | n/a |

Tasa de aceptación del drafter medida por sesión: 5 % en decode corto, 14 % a 2k y 80 % a 32k. El roofline se calcula para este GGUF en Strix Halo (gfx1151) a 216 GB/s y 59 TFLOP/s con `loom-roofline`. No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de arranque usa `--memory_bytes=29000000000` (29 GB) con `--device=amdgpu`; el GGUF Q4_K_M de un modelo de 3B ocupa del orden de 2 GB, por lo que el presupuesto de 29 GB corresponde a la reserva del motor y la caché KV para contexto largo, no al peso del modelo.
- GPU recomendadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) es el hardware de referencia validado. Para otras GPU AMD no hay datos publicados en la información disponible.
- GPU de consumo: el modelo en Q4_K_M es manejable en GPUs de consumo por tamaño, pero el paquete Loom está orientado a `--device=amdgpu`; no se documenta soporte para NVIDIA ni para GPUs de escritorio concretas.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el paquete y `loom-serve` como servidor. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: 93,4 tok/s en decode con prompt corto, 67,1 tok/s a 32k de contexto, 3092,7 tok/s de prefill a 1k y 234,1 tok/s agregados con 4 streams (cifras del autor en el hardware de referencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Motor/empaquetado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun/unsloth-Llama-3.2-3B-Instruct-loom | 3B | 131.072 | Loom (`.loom` + `model.json`), GGUF Q4_K_M | no disponible | Hugging Face (0 descargas, 0 likes) |
| unsloth/Llama-3.2-3B-Instruct-GGUF | 3B | 131.072 (modelo base) | GGUF para llama.cpp y derivados | no disponible | Hugging Face (modelo base del paquete) |
| unsloth/Llama-3.2-3B-Instruct | 3B | 131.072 (modelo base) | Safetensors | no disponible | Hugging Face |

La comparación relevante es de motor, no de modelo: Loom reporta +36 % a +307 % en decode y +41 % a +88 % en prefill frente a llama.cpp sobre el mismo GGUF y hardware. No se dispone de comparativas con otros motores (vLLM, TGI, MLC) en la información proporcionada.

## Limitaciones y advertencias

- El paquete no incorpora un modelo nuevo: hereda sesgos, alucinaciones y limitaciones del Llama 3.2 3B Instruct de Meta, un modelo pequeño con conocimiento factual limitado.
- La licencia no está indicada en la información disponible; conviene verificar la licencia de Llama 3.2 (Llama Community License) antes de uso comercial.
- El gate `needle_full` (needle-in-the-haystack a contexto completo) figura como "sin evidencia"; solo se valida hasta la mitad del contexto.
- El gate `vision` y `agent_think_off` figuran como "no aplicable" porque el modelo no soporta imagen ni modo thinking.
- La tasa de aceptación del drafter especulativo en decode corto es solo del 5 %, por lo que la ganancia de la decodificación especulativa es menor en prompts cortos y mucho mayor en contextos largos (80 % a 32k).
- El hardware validado es exclusivamente AMD Strix Halo (gfx1151); no hay evidencia publicada de funcionamiento en otras GPU.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 2026-11-07, por lo que no cuenta con validación de la comunidad.
- La API expone 4 peticiones concurrentes y 4.096 tokens de salida por petición; cargas mayores requieren escalar horizontalmente.
- Los resultados de rendimiento son del autor y comparan tiempos de cliente (Loom) con tiempos de servidor (llama.cpp), lo que introduce un sesgo metodológico a tener en cuenta.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/unsloth-Llama-3.2-3B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF
- Modelo base en safetensors: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Repositorio del motor Loom: https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecución de referencia (DevLab Dispatch run 42354126547): https://github.com/loom-fun/loom-skills/actions/runs/42354126547
