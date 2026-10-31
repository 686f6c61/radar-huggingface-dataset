# Jfish123/Qwen3.8-27B-16GB-GGUF

## Resumen

Qwen3.8-27B-16GB-GGUF es una cuantización de la comunidad, publicada por Jfish123, del modelo Qwen3.8-27B de Qwen, adaptada para funcionar íntegramente en una GPU de 16 GB de VRAM (probada en una RTX 5080). El repositorio no contiene pesos nuevos: reutiliza la cuantización dinámica `UD-IQ3_XXS` de Unsloth (verificando los 866 tensores byte a byte) y añade dos correcciones en la plantilla de chat embebida en el GGUF para hacerlo compatible con herramientas de agentes como Claude Code y OpenAI Codex a través de Ollama.

Su valor diferencial está en el contexto: 125.000 tokens con descarga completa a GPU (66/66 capas), posible gracias al diseño híbrido de Qwen3.8, donde solo 16 de las 64 capas mantienen caché KV (el resto usa Gated DeltaNet). El proyecto proyecta texto, elimina el proyector de visión (~0,9 GB) para dedicar esa VRAM al contexto y activa el modo thinking por defecto. Para desarrolladores que necesitan un modelo de código con contexto muy largo en hardware de consumo, esta ficha técnica es una de las pocas opciones documentadas con mediciones reales de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (64 capas: 16 con atención estándar y KV cache, 48 con Gated DeltaNet) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 125.000 tokens (con KV cache cuantizada q4_0; configurable, p. ej. 65.536) |
| Tipos de cuantizacion | UD-IQ3_XXS (dinámica, de Unsloth); KV cache q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (endpoints compatible; base safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo base, Qwen/Qwen3.8-27B, emplea una arquitectura híbrida que combina capas de atención transformer convencional con capas Gated DeltaNet (una variante de redes de estado/recurrencia lineal). De las 64 capas totales, solo 16 conservan caché KV, lo que reduce drásticamente el coste de memoria del contexto largo: 125.000 tokens con caché cuantizada q4_0 ocupan unos 2,1 GB, frente a lo que ocuparía con atención estándar. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

Sobre el modelo base, este repositorio aplica una cuantización dinámica IQ3_XXS ( Unsloth "UD"), que asigna bits de forma no uniforme según la importancia de cada tensor. Los pesos son idénticos byte a byte a los de Unsloth; la única modificación es la plantilla de chat Jinja embebida en el GGUF, reescrita como Go template compatible con el Modelfile de Ollama. Se descarta el proyector de visión (~0,9 GB), por lo que la variante es solo texto. El modo thinking viene activado por defecto, con muestreo recomendado por Qwen: temperature 1.0, top_p 0.95, top_k 20.

## Capacidades

- Generación de texto y conversación (pipeline text-generation), orientado especialmente a código (tag "coding").
- Modo thinking activado por defecto, con razonamiento paso a paso antes de la respuesta.
- Contexto muy largo: 125.000 tokens totalmente en GPU en una tarjeta de 16 GB.
- Compatibilidad con herramientas de agentes: plantilla corregida para funcionar con Claude Code (vía endpoint compatible con Anthropic `/v1/messages` de Ollama) y OpenAI Codex (razoning effort `max` mapeado a `xhigh`).
- Soporte de mensajes de sistema tardíos (tras el inicio de la conversación), necesarios para muchos frameworks de agentes.
- Sin capacidades de visión: el proyector multimodal se ha eliminado en esta cuantización.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada (la compatibilidad con agentes sugiere soporte, pero no se documenta).

## Casos de uso

- Asistente de código en local con Claude Code: la plantilla corregida permite usarlo como backend de Claude Code vía Ollama sin errores HTTP 500, con 125k tokens de contexto para repositorios completos.
- Agentes de codificación con OpenAI Codex CLI: acepta valores de reasoning effort no estándar (`max`, `ultra`), evitando el error `Unexpected reasoning effort max` de la plantilla original.
- Análisis de bases de código extensas: los ~125.000 tokens de contexto permiten cargar múltiples ficheros o un proyecto mediano en una sola petición, con procesamiento de prompts de 1.000–2.000 tokens/s en una RTX 5080.
- Chatbot conversacional en local: con Ollama, carga en ~5 s desde NVMe y generación de ~52 tokens/s, adecuado para uso interactivo en un portátil o sobremesa con GPU de 16 GB.
- Razonamiento con presupuesto de cómputo ajustado: el modo thinking por defecto permite tareas de razonamiento multi-paso en hardware de consumo sin depender de APIs de pago.
- Despliegue en servidores de inferencia ligeros: instrucciones listas para `llama-server` con flash attention y KV cache cuantizada, útil para exponer el modelo vía API OpenAI-compatible en una sola GPU.
- Reproducción de benchmarks de código: se incluye un harness (`benchmark/lcb_score.py`) para evaluar pass@1 sobre LiveCodeBench v6 con reanudación de ejecuciones.

## Benchmarks y rendimiento

Resultados medidos por el autor en una RTX 5080 (16 GB) con la cuantización UD-IQ3_XXS:

| Metrica | Valor |
|---|---|
| Contexto | 125.000 tokens |
| Capas en GPU | 66/66 (100 %) |
| VRAM pesos | ~10,2 GB |
| VRAM KV cache (q4_0) | ~2,1 GB |
| VRAM cómputo | ~0,7 GB |
| Velocidad de generación | ~52 tokens/s |
| Procesamiento de prompt | ~1.000–2.000 tokens/s |
| Tiempo de carga | ~5 s (NVMe) |

Referencias publicadas en LiveCodeBench v6 (pass@1, a precisión completa, de la model card de Qwen3.8-27B):

| Modelo | LiveCodeBench v6 (pass@1) |
|---|---|
| Qwen3.8-27B | 90,3 |
| Claude Opus 4.6 Max | 88,8 |

La puntuación de esta cuantización concreta estaba "en ejecución" en el momento de la model card, por lo que no hay dato publicado del quant; el autor advierte que su harness es cercano pero no idéntico al oficial, y que diferencias de pocos puntos deben tratarse como ruido. No se han publicado otros resultados de benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~13 GB en total (~10,2 GB pesos + ~2,1 GB KV cache q4_0 a 125k + ~0,7 GB cómputo), más 512 MB de overhead reservado; cabe en una GPU de 16 GB.
- GPU probada: RTX 5080 (16 GB). Por VRAM, deberían servir también RTX 4080/4090, RTX 5070 Ti/5080 o equivalentes con 16 GB; no hay pruebas publicadas en otras tarjetas.
- Consumer GPU: sí, diseñado explícitamente para 16 GB; con menos VRAM habría que reducir contexto (`/set parameter num_ctx 65536`) o descargar capas a CPU.
- Configuración requerida en Ollama: `OLLAMA_FLASH_ATTENTION=1`, `OLLAMA_KV_CACHE_TYPE=q4_0` (con f16 o q8_0 el contexto de 125k no cabe junto a los pesos) y `OLLAMA_GPU_OVERHEAD=536870912` (sin él, el backend CUDA puede fallar con `ptxas fatal: Memory allocation failure`).
- Despliegue: Ollama (vía registro `awakenedsniper78/qwen3.8-coder` o creando el modelo desde el Modelfile del repo) y llama.cpp (`llama-server -m ... -c 125000 -ngl 99 -fa on -ctk q4_0 -ctv q4_0`). No se menciona soporte directo de vLLM o TGI para GGUF.
- Rendimiento medido: ~52 tokens/s de generación y ~1.000–2.000 tokens/s de procesamiento de prompt en RTX 5080.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Jfish123/Qwen3.8-27B-16GB-GGUF | 27,3 B | GGUF UD-IQ3_XXS | 125.000 (KV q4_0) | Apache 2.0 | Plantilla corregida para Claude Code y Codex; mediciones en RTX 5080 |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | GGUF (varias cuantizaciones, incl. UD-IQ3_XXS) | no disponible | Apache 2.0 | Fuente de los pesos; plantilla con errores en herramientas de agentes |
| Qwen/Qwen3.8-27B | 27,3 B | safetensors (bf16) | no disponible | Apache 2.0 | Modelo original, multimodal, LiveCodeBench v6 90,3 |

No hay datos comparativos publicados frente a otros modelos de la misma clase de tamaño (p. ej. Qwen3-32B, Gemma 3 27B) en la información disponible.

## Limitaciones y advertencias

- Cuantización agresiva (IQ3_XXS, ~3,1 bits efectivos): puede degradar la calidad respecto al modelo a precisión completa, especialmente en razonamiento fino y código complejo; el benchmark del quant estaba pendiente de publicación.
- Solo texto: se ha eliminado el proyector de visión, por lo que no acepta imágenes aunque el modelo base sea multimodal.
- El contexto de 125.000 tokens solo es viable con KV cache q4_0; con f16 o q8_0 las capas se descargan a CPU y el rendimiento cae. Con el escritorio consumiendo mucha VRAM, conviene bajar a 65.536 tokens.
- Configuración frágil: sin `OLLAMA_GPU_OVERHEAD` puede producirse un fallo de carga de CUDA (`ptxas fatal: Memory allocation failure`).
- Riesgo de alucinación: inherente a todo LLM; no hay evaluaciones de veracidad publicadas para esta cuantización.
- Sesgos conocidos: no disponible; hereda los del modelo base Qwen3.8-27B, sin auditoría documentada en el repo.
- Idiomas soportados: no documentados en esta ficha de repositorio.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque la marca "Qwen" puede estar sujeta a las políticas de uso del equipo de Qwen.
- El harness de LiveCodeBench incluido no es idéntico al oficial, por lo que sus puntuaciones no son directamente comparables con las publicadas.
- Repositorio de comunidad con muy poca tracción (246 descargas, 1 like en el momento de los datos): conviene verificar los checksums y la plantilla modificada antes de uso en producción.

## Enlaces

- Repositorio: https://huggingface.co/Jfish123/Qwen3.8-27B-16GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de origen: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Dataset de benchmark (LiveCodeBench v6): https://huggingface.co/datasets/livecodebench/code_generation_lite
- Equipo Qwen: https://huggingface.co/Qwen
- Unsloth: https://huggingface.co/unsloth
- Modelo en el registro de Ollama: `awakenedsniper78/qwen3.8-coder` (vía `ollama run awakenedsniper78/qwen3.8-coder`)
- Paper, demo y blog: no disponibles
