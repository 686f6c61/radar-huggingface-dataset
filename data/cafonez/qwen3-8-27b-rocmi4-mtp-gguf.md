# cafonez/Qwen3.8-27B-ROCmI4-MTP-GGUF

## Resumen

Qwen3.8-27B-ROCmI4-MTP-GGUF es una conversión y cuantización del modelo Qwen/Qwen3.8-27B de Alibaba, adaptada por el usuario cafonez para ejecutarse en GPUs AMD Strix Halo mediante el backend experimental ROCmFPX. No se trata de un modelo reentrenado, sino de un artefacto de inferencia optimizado que combina pesos en formato int4 propietario (ROCmI4) con la cabecera de Multi-Token Prediction (MTP) integrada, lo que permite decodificación especulativa sin necesidad de un modelo borrador externo.

El modelo mantiene las capacidades originales de Qwen3.8-27B: es multimodal (imagen, video y texto), con una ventana de contexto nativa de 262.144 tokens y arquitectura densa tipo `qwen35`. Su relevancia actual radica en que ofrece una ruta de inferencia W4A4 (pesos y activaciones en int4) exclusiva para hardware AMD `gfx1151`, un escenario que el llama.cpp estándar no cubre. El repositorio incluye además un proyector multimodal en BF16 (`mmproj-BF16.gguf`) opcional para entrada de imágenes y vídeo.

La licencia es Apache-2.0, igual que la del modelo base, y el artefacto está disponible únicamente como GGUF. No se han publicado resultados de benchmarks específicos para esta cuantización, y su uso requiere el fork ROCmFPX de llama.cpp con una compilación HIP dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35` (Qwen 3.5, densa, no MoE) |
| Parámetros totales | 27.320.697.856 (~27,32 B) |
| Parámetros activos | no aplicable (arquitectura densa) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantización | Q4_0_ROCMI4 (GGML tipo 108, pesos int4), W4A4 opcional (activaciones int4) |
| Idiomas soportados | No especificados en la model card; el modelo base Qwen3.8-27B es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal `Qwen3.8-27B-Q4_0_ROCMI4.gguf` de 14,5 GB, más `mmproj-BF16.gguf` de 0,93 GB) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del Qwen3.8-27B original, por lo que su arquitectura corresponde a la serie `qwen35`: un transformer denso con atención completa, diseñado para tareas multimodales y de agente. La novedad técnica reside en el formato de pesos ROCmI4, que empaqueta códigos int4 con signo (dos por byte) junto con escalas de bloque, y en la ruta de ejecución W4A4 que cuantiza también las activaciones a una malla de 4 bits durante la multiplicación de matrices acelerada. Esta cuantización dual es opcional y solo se activa si el backend la habilita; si no, se usa un fallback int8 MMQ.

Además, el GGUF integra el head MTP de una capa (`qwen35.nextn_predict_layers = 1`), con tensores dedicados (`nextn.eh_proj`, `nextn.enorm`, `nextn.hnorm`, `nextn.shared_head_norm`). Esto permite decodificación especulativa self-speculative en el propio modelo, sin necesidad de un modelo de borrador separado. La configuración recomendada incluye `--spec-type draft-mtp` y `--spec-mtp-strict-qwen` para mantener las decisiones greedy del camino objetivo.

El entrenamiento original del Qwen3.8-27B (datos, tokens, RLHF/DPO) no se detalla en esta model card; la conversión no altera los pesos, solo su representación.

## Capacidades

- Generación de texto general y razonamiento multi-turno, heredadas del modelo base Qwen3.8-27B.
- Entrada multimodal: procesamiento de imágenes y vídeo mediante el proyector `mmproj-BF16.gguf` (opcional para uso solo texto).
- Tool calling y function calling, diseñado para cargas de trabajo agénticas.
- Contexto largo de hasta 262.144 tokens, útil para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa MTP integrada, que acelera la generación en cargas de trabajo predecibles (código, datos estructurados).
- Soporte de servidor OpenAI-compatible (`llama-server`) con `--jinja` para templates de chat.

## Casos de uso

- **Inferencia local en AMD Strix Halo**: el caso principal es ejecutar un modelo de 27 B en una APU con memoria unificada, aprovechando la ruta W4A4 para reducir el uso de memoria y mejorar el throughput. El modelo está calibrado para `gfx1151`.
- **Servidor OpenAI-compatible en local**: con `llama-server` se puede montar un endpoint `/v1/chat/completions` que recibe peticiones estándar, útil para integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- **Procesamiento multimodal en entornos con GPU AMD**: el proyector BF16 permite enviar imágenes o vídeo como entrada, lo que habilita tareas de descripción visual o VQA en hardware que no soporta CUDA.
- **Agentes con tool calling**: al ser un modelo de agente, puede gestionar conversaciones multi-turno y llamadas a funciones externas, adecuado para asistentes virtuales y automatización de flujos de trabajo.
- **Análisis de documentos de contexto largo**: con 262K tokens de ventana, puede resumir o extraer información de libros, informes técnicos o codebases completas sin truncamiento.
- **Desarrollo y pruebas de decodificación especulativa**: el MTP integrado sirve como banco de pruebas para evaluar el rendimiento de self-speculative decoding en `llama-bench` con hardware AMD, comparando perfiles de `n_max` y `p_min`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de throughput para este artefacto concreto. Se recomienda ejecutar `llama-bench` localmente para medir la velocidad de generación en el hardware objetivo.

## Requisitos de hardware

- **GPU**: AMD Strix Halo con arquitectura `gfx1151` (obligatorio para la ruta W4A4). Otras GPUs AMD no tienen soporte para el tipo ROCmI4.
- **VRAM**: el archivo GGUF principal pesa 14,5 GB. Con cuantización int4 y contexto reducido, cabe en 16 GB de memoria unificada; para la ventana completa de 262K se necesita memoria adicional para el KV-cache (tipo f16).
- **CPU**: no se especifica, pero se recomienda al menos 16 hilos (`-t 16` en los ejemplos).
- **Software**: compilación de ROCmFPX con `GGML_HIP=ON`, `GGML_VULKAN=OFF` y `CMAKE_HIP_ARCHITECTURES=gfx1151`. Requiere la variable `HSA_OVERRIDE_GFX_VERSION=11.5.1` si ROCm no detecta el chip.
- **Despliegue**: `llama-cli`, `llama-server` y `llama-bench` desde el build de ROCmFPX. No compatible con llama.cpp estándar ni con Ollama.
- **Latencia/throughput**: no disponible en la documentación; depende de la configuración MTP y del contenido generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Hardware soportado | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-ROCmI4-MTP-GGUF (este) | 27,32 B | Q4_0_ROCMI4 (int4) | 262K | Solo AMD gfx1151 (con ROCmFPX) | Apache-2.0 |
| Qwen3.8-27B-GGUF (unsloth) | 27,32 B | Q4_K_M, IQ4_XS, etc. | 262K | NVIDIA, AMD, Apple (llama.cpp estándar) | Apache-2.0 |
| Qwen3.8-27B-MTP-GGUF (barozp) | 27,32 B | Cuantizaciones estándar | 262K | Multiplataforma (llama.cpp) | Apache-2.0 |
| Qwen3.8-27B (modelo base) | 27,32 B | BF16 | 262K | Cualquier hardware con suficiente VRAM | Apache-2.0 |

La diferencia clave está en la cuantización propietaria ROCmI4 y la ruta W4A4, que solo funcionan en el fork ROCmFPX para gfx1151. Las alternativas de unsloth y barozp son más portables, pero no aprovechan la aceleración específica de AMD.

## Limitaciones y advertencias

- **Dependencia de un fork experimental**: el modelo solo funciona con ROCmFPX en el commit indicado; llama.cpp estándar no reconoce el tipo GGML 108 ni la ruta MTP.
- **Soporte de hardware muy restringido**: la ruta W4A4 está calificada únicamente para AMD Strix Halo `gfx1151`. En otras GPU AMD o NVIDIA no se puede usar la aceleración int4.
- **Pérdida de precisión**: la cuantización W4A4 (activaciones int4) es aproximada y puede degradar la calidad de generación frente a la ruta int8. La model card indica que el MTP estricto preserva las decisiones greedy del camino objetivo, pero no elimina esta pérdida.
- **Acceso al repositorio**: es un repositorio privado; se necesita autorización del autor y autenticación con `hf auth login` para descargar.
- **Sin benchmarks publicados**: no hay datos de rendimiento ni de calidad para esta configuración, por lo que las expectativas deben validarse con pruebas locales.
- **Idiomas no especificados**: la model card no detalla los idiomas soportados, aunque el modelo base de Qwen suele ser multilingüe.
- **Contexto largo con memoria**: la ventana de 262K tokens requiere una cantidad considerable de memoria unificada para el KV cache; en hardware con menos de 64 GB puede ser necesario reducir `-c`.

## Enlaces

- Repositorio HuggingFace del artefacto: [cafonez/Qwen3.8-27B-ROCmI4-MTP-GGUF](https://huggingface.co/cafonez/Qwen3.8-27B-ROCmI4-MTP-GGUF)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Fork ROCmFPX: [github.com/charlie12345/ROCmFPX](https://github.com/charlie12345/ROCmFPX)
- Commit requerido: [c49ebdbd5c9f01ec242369f9e7f7967855f80cba](https://github.com/charlie12345/ROCmFPX/commit/c49ebdbd5c9f01ec242369f9e7f7967855f80cba)
- Guía de cuantizaciones GGUF de Qwen3.8-27B: [orcarouter.ai/blog/qwen-3-8-27b-gguf](https://www.orcarouter.ai/blog/qwen-3-8-27b-gguf)
- Documentación de Cloudflare Workers AI sobre Qwen3.8-27B: [developers.cloudflare.com/workers-ai/models/qwen3.8-27b](https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/)
- GGUF de unsloth: [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- GGUF con MTP de barozp: [barozp/Qwen3.8-27B-MTP-GGUF](https://huggingface.co/barozp/Qwen3.8-27B-MTP-GGUF)
