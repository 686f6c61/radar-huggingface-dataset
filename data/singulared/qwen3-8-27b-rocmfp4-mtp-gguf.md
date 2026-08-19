# singulared/Qwen3.8-27B-ROCmFP4-MTP-GGUF

## Resumen

Esta build es una cuantización ROCmFP4 del modelo Qwen3.8-27B, publicada por el usuario singulared, diseñada específicamente para hardware AMD de la serie Strix Halo (APU Ryzen AI MAX+ 395 con iGPU Radeon 8060S, arquitectura RDNA 3.5, target `gfx1151`). El repositorio incluye además un drafter de predicción multi-token (MTP) en cinco precisiones distintas (FP2, FP3, FP4, FP6 y FP8) para habilitar decodificación especulativa, con datos de rendimiento medidos y verificables.

La relevancia de esta publicación radica en que no se limita a ofrecer ficheros GGUF cuantizados, sino que documenta exhaustivamente el comportamiento del modelo en función de la profundidad de borrador (`--spec-draft-n-max`), la precisión del drafter, el preset de cuantización (STRIX vs COHERENT) y la versión de ROCm (7.2 vs 10.1). El autor advierte explícitamente que, en la misma máquina, una build mainline de llama.cpp con Vulkan y cuantización `Q4_K_M` supera en prefill a esta versión FP4, pero que el formato ROCmFP4 reduce el footprint en memoria residente en 1,7 GiB, lo que resulta útil cuando se desea co-alojar dos modelos. El modelo base es Qwen3.8-27B, un transformer denso con capacidades multimodales (entrada de imagen y vídeo) y contexto de 262K tokens, publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision (modelo base Qwen3.8-27B) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K, dato del modelo base) |
| Tipos de cuantizacion | ROCmFP4: `Q4_0_ROCMFP4_STRIX` (13,75 GiB) y `Q4_0_ROCMFP4_COHERENT` (14,41 GiB); drafter MTP en FP2, FP3, FP4, FP6 y FP8 |
| Idiomas soportados | No disponible (la model card no lo especifica; el modelo base soporta multiples idiomas, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere build ROCmFPX de llama.cpp; los tensores `Q4_0_ROCMFP4_*` no son reconocidos por mainline) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parametros con un encoder de vision integrado, capaz de procesar imagenes y video ademas de texto. La build ROCmFP4 no es un reentrenamiento, sino una cuantizacion del modelo original: los pesos se convierten al formato de tensor en runtime `Q4_0_ROCMFP4_*`, que solo existe en el fork ROCmFPX de llama.cpp. El autor verifica la procedencia de los pesos mediante hashes sha256 de los ficheros BF16 de `ggml-org/Qwen3.8-27B-GGUF` antes de cuantizar.

La innovacion principal de este repositorio es el drafter MTP (multi-token prediction), una cabeza auxiliar que predice varios tokens a la vez y se usa en esquemas de decodificacion especulativa. El drafter se ofrece en cinco precisiones (FP2, FP3, FP4, FP6, FP8) para estudiar el equilibrio entre tamaño, velocidad y tasa de aceptacion. Los experimentos documentados muestran que la precision del drafter actua como una palanca de ancho de banda, no de calidad: la tasa de aceptacion se mantiene plana entre 89% y 92% para precisiones de Q4_K_M a Q8_0, mientras que el rendimiento de decode varia un 13%. El drafter FP2, sin embargo, degrada severamente la aceptacion (64%) porque su codebook no tiene cero exacto.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Qwen3.8-27B.
- Procesamiento multimodal: entrada nativa de imagen y video (segun las guias publicadas del modelo base).
- Decodificacion especulativa mediante drafter MTP, con tasas de aceptacion medidas (hasta 98,1% con drafter FP3 y target FP4).
- Soporte de tool calling y function calling probablemente heredado del modelo base, aunque no se documenta en esta model card.
- Capacidades multilingues: no confirmadas en la informacion proporcionada.
- Modo de razonamiento (thinking mode): no documentado en esta build; el modelo base puede incluirlo, pero no se verifica aqui.

## Casos de uso

- Ejecucion local en APUs AMD Strix Halo (Ryzen AI MAX+ 395) con footprint reducido: la cuantizacion ROCmFP4 ocupa 13,75-14,41 GiB, frente a 17,3 GiB de una Q4_K_M, lo que permite co-residir dos modelos en los 124 GiB de memoria unificada de la APU.
- Investigacion de decodificacion especulativa: los datos de aceptacion y rendimiento por profundidad de borrador permiten calibrar el parametro `--spec-draft-n-max` para cada backend (Vulkan vs ROCmFP4) y precision de drafter.
- Desarrollo de aplicaciones de IA en edge con AMD: esta build es un punto de partida para integrar Qwen3.8-27B en entornos donde solo se dispone de hardware Radeon con soporte ROCm, usando el fork ROCmFPX.
- Evaluacion comparativa de presets de cuantizacion: los datos de prefill con ROCm 7.2 vs 10.1 muestran que el preset STRIX pasa de 151,8 a 272,0 tokens/s (un +79%) al actualizar el runtime, lo que sirve para decidir que version de ROCm usar en produccion.
- Optimizacion de prefill en servidores locales: el barrido del parametro `-ub` (micro-batch) demuestra que valores pequenos como 256 mejoran el prefill un 27% respecto a 2048, un dato util para tunear llama-server en cargas de trabajo con prompts largos.
- Despliegue de asistentes de codigo o chat local con contexto largo (262K) en equipos de escritorio con APU AMD, aprovechando la memoria unificada para evitar transferencias PCIe.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.), pero si mediciones exhaustivas de rendimiento de inferencia en hardware AMD Strix Halo. Se presentan los datos mas relevantes.

**Tabla 1. Barrido de profundidad de borrador (`--spec-draft-n-max`) en decode (tokens/s) y tasa de aceptacion**

| n-max | Vulkan Q4_K_M decode | aceptacion | FP4 decode | aceptacion |
|---:|---:|---:|---:|---:|
| 3 | — | — | 33,42 | 100,0% |
| 4 | 35,80 | 88,1% | 35,16 | 98,7% |
| 5 | 38,94 | 91,6% | 38,67 | 98,1% |
| 6 | 38,47 | 86,5% | 38,04 | 97,5% |
| 7 | 37,84 | 82,0% | 39,26 | 94,7% |
| 8 | 28,56 | 78,1% | 32,36 | 95,2% |
| 10 | 25,47 | 59,4% | — | — |

**Tabla 2. Precision del drafter (target fijo, Vulkan, n=5)**

| Drafter | Tamano | Decode (tokens/s) | Aceptacion |
|---|---|---:|---:|
| Q4_K_M | 1,89 GiB | 39,16 | 91,6% |
| Q6_K | 2,28 GiB | 38,28 | 92,1% |
| Q5_K_M | 2,08 GiB | 36,93 | 89,0% |
| Q8_0 | 2,95 GiB | 34,74 | 89,0% |

**Tabla 3. Precision del drafter FPX (target STRIX, ROCm 10.1, n=5)**

| Drafter | Decode (tokens/s) | Aceptacion |
|---|---:|---:|
| FP4-STRIX | 37,03 | 97,4% |
| FP3 | 36,07 | 98,1% |
| FP6 | 30,92 | 96,6% |
| FP8 | 29,76 | 96,6% |
| FP2 | 22,07 | 64,0% |

**Tabla 4. Prefill (pp2048, tokens/s) segun preset y version de ROCm**

| Preset | ROCm 7.2.4 | ROCm 10.1 nightly |
|---|---:|---:|
| COHERENT | 205,7 | 208,6 (+1%) |
| STRIX | 151,8 | 272,0 (+79%) |

**Tabla 5. Efecto del micro-batch (`-ub`) en prefill (pp2048, tokens/s)**

| `-ub` | Vulkan | FP4 (ROCm 10.1) |
|---:|---:|---:|
| 256 | 370,6 | 300,3 |
| 512 | 360,9 | 267,3 |
| 1024 | 343,7 | 236,5 |
| 2048 | 332,0 | 235,8 |

Ademas, el autor reporta que en la misma maquina, mainline llama.cpp con Vulkan y `Q4_K_M` ofrece 330 tokens/s de prefill frente a 227 de FP4 (+43%), con decode empatado. No se proporcionan resultados de calidad del modelo (tareas de razonamiento, codigo, etc.).

## Requisitos de hardware

- Hardware de referencia: AMD Ryzen AI MAX+ 395 con iGPU Radeon 8060S (`gfx1151`, RDNA 3.5), 124 GiB de memoria unificada (GTT), Debian sid con kernel 7.2.
- VRAM estimada: 13,75 GiB para el fichero principal STRIX, 14,41 GiB para COHERENT; el drafter anade entre 1,48 y 2,86 GiB segun precision. El footprint residente medido es de 15,6 GiB (FP4 + drafter) frente a 17,3 GiB de una Q4_K_M con drafter.
- GPU recomendadas: cualquier GPU AMD compatible con ROCm y target `gfx1151` (RDNA 3.5). No se menciona soporte para otras arquitecturas (NVIDIA, Intel).
- No cabe en GPUs consumer tipicas de 8-16 GiB si se quiere usar con contexto largo; en una RTX 4090 (24 GiB) cabria la cuantizacion sin drafter, pero el formato ROCmFP4 no es compatible con CUDA.
- Opciones de despliegue: exclusivamente con el fork ROCmFPX de llama.cpp (llama-server, llama-bench). No es compatible con mainline llama.cpp, Ollama, vLLM ni TGI sin modificaciones.
- Latencia y throughput: en el hardware de referencia, decode entre 29,76 y 39,26 tokens/s segun configuracion; prefill entre 235,8 y 300,3 tokens/s con FP4 y ROCm 10.1, o hasta 370,6 con Vulkan.

## Comparativa con modelos similares

La comparativa se centra en otras formas de ejecutar Qwen3.8-27B en el mismo hardware, ya que no hay modelos de tamano equivalente con soporte ROCmFP4 documentado.

| Configuracion | Prefill (pp2048) | Decode (n=5) | Footprint residente | Requisito de software |
|---|---|---:|---:|---:|---|
| ROCmFP4 STRIX + drafter FP4 (ROCm 10.1) | 300,3 | 38,67 | 15,6 GiB | ROCmFPX fork |
| ROCmFP4 COHERENT + drafter FP4 (ROCm 7.2) | 205,7 | — | ~16,3 GiB | ROCmFPX fork |
| Mainline llama.cpp Vulkan + Q4_K_M + drafter Q4_K_M | 330,0 | 38,94 | 17,3 GiB | Mainline llama.cpp |

Otras cuantizaciones de Qwen3.8-27B publicadas por terceros (p. ej. `bg-digitalservices/Qwen3.8-27B-ROCmFP4-STRIX-GGUF` o `kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF`) existen, pero no incluyen los datos de rendimiento ni los barridos de parametros de este repositorio. En cuanto a modelos de tamano similar con soporte AMD, no se dispone de datos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El drafter FP2 esta roto: su codebook no tiene cero exacto, lo que colapsa la tasa de aceptacion al 64% y reduce el decode a 22,07 tokens/s. No debe usarse para modelos de borrador.
- No es la opcion mas rapida: mainline llama.cpp con Vulkan y Q4_K_M supera a esta build en prefill (+43%) y empata en decode. La ventaja de ROCmFP4 es solo el ahorro de 1,7 GiB de memoria residente.
- Dependencia critica de la version de ROCm: el preset STRIX rinde un 79% mejor con ROCm 10.1 que con 7.2, mientras que COHERENT apenas varia. Cualquier comparativa entre presets debe indicar la version de ROCm usada.
- Requiere el fork ROCmFPX de llama.cpp; los ficheros no son utilizables con mainline, lo que limita la portabilidad a otros entornos.
- No se documentan sesgos, alucinaciones ni limitaciones de idioma especificas de esta build. El modelo base puede presentar los sesgos tipicos de los LLM entrenados con datos web, pero no hay evaluacion de seguridad en este repositorio.
- El parametro `-ub 256` es obligatorio para obtener el mejor prefill; valores mayores (2048) penalizan el rendimiento hasta un 27% en FP4.
- La tasa de aceptacion del drafter decae monotonamente con la profundidad; el valor optimo de `--spec-draft-n-max` es 5 para Vulkan y 7 para FP4, y no debe extrapolarse de otros modelos (p. ej. DeepSeek-V4 usa n=2).
- Los datos de rendimiento se obtuvieron con una unica maquina (Ryzen AI MAX+ 395, 124 GiB GTT) y una unica configuracion de prompt (~8K tokens, temperatura 0). Los resultados pueden variar en otros equipos o cargas de trabajo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/singulared/Qwen3.8-27B-ROCmFP4-MTP-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficheros GGUF de origen: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Repositorio similar de otro autor: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF
- Blog de AMD sobre soporte Day 0 de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de despliegue local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guia completa del modelo base: https://lovableapp.org/blog/qwen3-8-27b
