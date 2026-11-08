# loom-fun/ggml-org-Qwen3-Coder-30B-A3B-Instruct-loom

## Resumen

El repositorio `loom-fun/ggml-org-Qwen3-Coder-30B-A3B-Instruct-loom` no es un modelo nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` más una tarjeta `model.json`) para el checkpoint GGUF `Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf` de `ggml-org`. El modelo subyacente es Qwen3-Coder-30B-A3B-Instruct, desarrollado por Qwen (Alibaba), un transformer de tipo Mixture-of-Experts con 31B parámetros totales y aproximadamente 3B activos por token, especializado en generación de código, razonamiento y uso de herramientas.

El paquete está generado específicamente para hardware AMD Ryzen AI Max+ 395 "Strix Halo" (iGPU gfx1151) mediante el flujo `loom-skills`, e incluye decodificación especulativa DFlash con profundidad 3 y un drafter externo (`Anbeeld/Qwen3-Coder-30B-A3B-DFlash-GGUF`). Su relevancia radica en que ofrece una alternativa de inferencia nativa ROCm/Loom frente a llama.cpp sobre el mismo GGUF, con mejoras medidas en prefill y decodificación en ese hardware concreto.

El servidor expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y hasta 4 peticiones concurrentes, con una ventana de contexto declarada de 262.144 tokens por petición. La licencia del paquete es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Qwen3-Coder-30B-A3B-Instruct) |
| Parametros totales | 31B (según model card de Qwen) |
| Parametros activos | ~3B por token (MoE, según nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens por petición (declarado en el paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como `.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer Mixture-of-Experts de Qwen con 31B parámetros totales y ~3B activos por token, orientado a tareas de código y agentes. El paquete Loom no modifica los pesos: empaqueta el GGUF `Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf` de `ggml-org` y añade programas Loom y una tarjeta `model.json` que describen cómo servirlo en hardware AMD Strix Halo. La innovación del paquete es de despliegue, no de entrenamiento: kernels generados y validados contra implementaciones de referencia (26/26 tests de kernel superados) y decodificación especulativa DFlash con profundidad 3 activada por defecto.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada. El paquete incluye una puerta de verificación `golden` que compara tokens greedy y top-5 log-probs contra una referencia de llama.cpp sobre el mismo GGUF, y una puerta `spec` que comprueba que la decodificación especulativa produce exactamente la misma salida que sin ella, ambas superadas.

## Capacidades

- Generación de texto y código: el modelo base está especializado en código, razonamiento y matemáticas (según la model card de Qwen referenciada).
- Tool calling: soporte de `tools` y `tool_calls` al estilo OpenAI, validado por la puerta `agent` con un bucle multi-turno de llamadas a herramientas que supera la comparación contra llama.cpp.
- Agentes y razonamiento multi-paso: la puerta `agent` verifica el renderizado exacto del prompt, la reutilización del historial y la validez de las llamadas a herramientas.
- Sampling configurable: `temperature`, `top_p`, `top_k` y `seed`, con distribución del primer token validada contra llama.cpp.
- Concurrencia: hasta 4 peticiones simultáneas (aunque la puerta `consistency` falla, ver limitaciones).
- Contexto largo: 262.144 tokens por petición, con prueba needle-in-a-haystack superada hasta la mitad del contexto.
- Sin modo thinking: `reasoning`/`thinking` y `reasoning effort` no están soportados en este paquete.
- Sin visión ni audio: entrada de imagen y audio no soportadas.

## Casos de uso

- Asistente de código en IDE o CLI: el modelo base está especializado en generación y edición de código; el servidor OpenAI-compatible permite conectarlo a clientes tipo Continue, Cline o Aider apuntando a `127.0.0.1:8080`.
- Agentes de automatización con herramientas: el soporte validado de `tool_calls` y el bucle multi-turno lo hacen adecuado para orquestadores que consultan APIs, ejecutan comandos o leen ficheros en varios pasos.
- Análisis de repositorios grandes: la ventana de 262.144 tokens permite incluir varios ficheros o documentación extensa en una sola petición; la puerta `needle` confirma recuperación de información hasta la mitad del contexto.
- Despliegue local en estaciones Strix Halo: el paquete está pensado para ejecutarse en un Ryzen AI Max+ 395 con iGPU Radeon 8060S, sin GPU dedicada, usando `loom-serve --device=amdgpu --memory_bytes=62000000000`.
- Procesamiento por lotes de documentos: el prefill medido (1.901,9 tok/s en documentos de 1k y 916,8 tok/s en 32k) permite indexar o resumir lotes de textos con latencia razonable en ese hardware.
- Servicio interno multiusuario ligero: con 4 peticiones concurrentes y agregado de decodificación de 74,6 tok/s, puede atender a un equipo pequeño en tareas de asistencia de código.
- Evaluación comparativa de motores de inferencia: útil para equipos que quieran medir Loom frente a llama.cpp sobre el mismo GGUF y hardware, con métricas reproducibles del flujo DevLab.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151, 216 GB/s, 59 TFLOP/s), mismo GGUF en ambos motores, 2026-11-07:

| Métrica | llama.cpp (DevLab) | Loom (DevLab) | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | 34,5 | 53,8 | 110,7 |
| Decode tok/s, contexto 2k | 39,2 | 45,4 | 106,5 |
| Decode tok/s, contexto 32k | 24,3 | 7,3 | 68,2 |
| Prefill tok/s, documento 1k | 1.176,4 | 1.901,9 | 10.078,2 |
| Prefill tok/s, documento 2k | 1.031,7 | 1.806,4 | 9.443,9 |
| Prefill tok/s, documento 8k | 873,4 | 1.719,6 | 6.855,1 |
| Prefill tok/s, documento 16k | 584,7 | 1.322,5 | 5.020,2 |
| Prefill tok/s, documento 32k | 371,0 | 916,8 | 3.269,8 |
| 4 streams, decode agregado tok/s | 50,3 | 74,6 | 185,2 |
| Tokens especulativos aceptados | n/a | 53 % | n/a |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son de rendimiento de inferencia, no de calidad.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de arranque usa `--memory_bytes=62000000000` (62 GB) sobre memoria unificada del Ryzen AI Max+ 395; el GGUF Q4_K_M de un MoE de 31B ocupa aproximadamente 18-19 GB de pesos, pero el paquete reserva memoria adicional para contexto y buffers.
- GPU recomendadas: el paquete está generado y validado para AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151). No hay datos de funcionamiento en A100, H100 o RTX 4090 en la información disponible.
- Consumer GPU: no hay evidencia en la información proporcionada de que funcione en GPUs de consumo NVIDIA; el soporte declarado es ROCm/Loom sobre Strix Halo.
- Despliegue: `hrx-loom` (`pip install "hrx-loom[hf]"`), `loom-fetch` para materializar y `loom-serve --device=amdgpu`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp aparece solo como referencia de comparación.
- Latencia y throughput: ver tabla de benchmarks. Destaca la caída de Loom a 32k de contexto (7,3 tok/s frente a 24,3 de llama.cpp), mientras que en prefill Loom supera a llama.cpp en todos los tamaños medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Este paquete (Qwen3-Coder-30B-A3B-Instruct Q4_K_M, Loom) | 31B | ~3B | 262.144 | Apache 2.0 | GGUF + Loom, ROCm Strix Halo |
| Qwen3-Coder-30B-A3B-Instruct (original) | 31B | ~3B | no disponible en la información | Apache 2.0 | Transformers/safetensors |
| Qwen3-Coder-30B-A3B-Instruct-GGUF (lmstudio-community) | 31B | ~3B | no disponible en la información | Apache 2.0 | GGUF para LM Studio/llama.cpp |
| ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF | 31B | ~3B | no disponible en la información | Apache 2.0 | GGUF genérico |

La comparación relevante es de empaquetado y motor: este repositorio añade kernels Loom, decodificación especulativa DFlash y validación contra llama.cpp sobre el mismo GGUF. Los datos de calidad del modelo son idénticos al base, al no modificarse los pesos.

## Limitaciones y advertencias

- La puerta `consistency` falla: peticiones concurrentes no producen la misma salida que ejecutadas en solitario, lo que es un riesgo para producción con concurrencia.
- La puerta `needle_full` no tiene evidencia: no se ha demostrado recuperación de información al contexto completo de 262.144 tokens, solo hasta la mitad.
- Sin modo thinking ni `reasoning effort`: no apto para flujos que dependan de razonamiento explícito del modelo.
- Sin visión ni audio.
- Rendimiento degradado a contexto largo en decodificación: 7,3 tok/s a 32k frente a 24,3 de llama.cpp en el mismo hardware.
- El paquete está validado únicamente en AMD Ryzen AI Max+ 395 (gfx1151); no hay evidencia de funcionamiento en otras GPUs.
- Riesgo de alucinación y sesgos: no disponibles en la información proporcionada; aplican los del modelo base Qwen3-Coder.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del drafter DFlash de Anbeeld por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/ggml-org-Qwen3-Coder-30B-A3B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- GGUF de la comunidad (LM Studio): https://huggingface.co/lmstudio-community/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Drafter de decodificación especulativa: https://huggingface.co/Anbeeld/Qwen3-Coder-30B-A3B-DFlash-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecución DevLab de referencia: https://github.com/loom-fun/loom-skills/actions/runs/42415159875
