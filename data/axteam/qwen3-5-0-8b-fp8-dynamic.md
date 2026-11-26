# axteam/Qwen3.5-0.8B-FP8-dynamic

## Resumen

Qwen3.5-0.8B-FP8-dynamic es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.5-0.8B, publicada por el usuario axteam. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de aproximadamente 873 millones de parámetros con arquitectura híbrida (atención lineal combinada con atención completa), capacidad de visión y una cabeza de predicción multi-token (MTP). Esta versión cuantizada emplea el esquema FP8_DYNAMIC de compressed-tensors con pesos FP8 E4M3 y activaciones FP8 dinámicas por token, pensada específicamente para servir el modelo con vLLM.

El objetivo de esta ficha es evaluar el modelo cuantizado como artefacto de despliegue: reduce el peso en disco a unos 1,3 GB y mantiene, según las mediciones del autor, un 97,3 % de recuperación media frente al original en BF16 en un conjunto de benchmarks. Es relevante para desarrolladores que necesitan un modelo multimodal pequeño, con licencia Apache-2.0 y apto para GPUs de consumo, sin renunciar a la precisión del original en tareas de texto.

La revisión del 2 de noviembre de 2026 corrigió un fallo en `config.json` que excluía incorrectamente el torre de visión de la cuantización: con vLLM 0.32 las capas visuales se construían en FP8 y cargaban pesos BF16, produciendo respuestas erróneas ante imágenes. El fallo solo afectaba a la entrada de imagen; el texto no se veía afectado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (dynamic), esquema FP8_DYNAMIC de compressed-tensors; W8A8 (pesos FP8 E4M3 con escala por canal de salida, activaciones FP8 dinámicas por token) |
| Idiomas soportados | No disponible (la model card menciona evaluación en inglés y coreano, pero no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `float-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura híbrida que combina capas de atención lineal con capas de atención completa, e incorpora una torre de visión y un proyector multimodal para entrada image-text-to-text. Incluye además una cabeza de predicción multi-token (MTP) y componentes propios de atención lineal (convolución 1D, sesgo dt, matriz A_log y una normalización con compuerta). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos no están en la información proporcionada.

Esta versión concreta es una cuantización post-entrenamiento (PTQ) sin reentrenamiento ni calibración: las escalas estáticas de pesos son data-free y las activaciones se cuantizan dinámicamente por token. Se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm excepto la normalización con compuerta de atención lineal, los embeddings de tokens, la LM head y las partes no lineales del SSM (`linear_attn.conv1d`, `dt_bias`). Se conservan en FP32, igual que en el original, `linear_attn.A_log` y la normalización con compuerta. En total, aproximadamente el 43 % de los parámetros quedan sin cuantizar.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Comprensión de imágenes (image-text-to-text) mediante torre de visión y proyector multimodal.
- Razonamiento matemático básico y resolución de problemas tipo GSM8K.
- Capacidades multilingües parciales: la evaluación del autor incluye KMMLU (coreano) y HAE-RAE, además de benchmarks en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cabeza de predicción multi-token (MTP), que puede habilitar decodificación especulativa en runtimes compatibles.
- No se documentan capacidades de audio ni modo thinking explícito.

## Casos de uso

- Asistente conversacional ligero en local: con 873 millones de parámetros y 1,3 GB de pesos, puede ejecutarse en una GPU de consumo y atender conversaciones multi-turno en aplicaciones de escritorio o embebidas, con licencia Apache-2.0 para uso comercial.
- Descripción y clasificación de imágenes: la torre de visión en BF16 permite generar descripciones de imágenes o etiquetas en pipelines de catalogación, moderación o accesibilidad, siempre que se use la revisión corregida del `config.json`.
- Extracción de información de documentos escaneados: combinando entrada de imagen y texto, el modelo puede transcribir o resumir contenido visual en flujos de digitalización.
- Prototipado rápido de aplicaciones multimodales: su reducido tamaño permite iterar en una sola GPU (incluso T4) con vLLM, sin necesidad de infraestructura multi-GPU.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye mediciones frente a AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit, lo que lo convierte en una referencia útil para estudiar la degradación por cuantización en modelos pequeños.
- Servicio de bajo coste con alta concurrencia: el formato W8A8 y la integración con vLLM permiten desplegar múltiples réplicas en GPUs modestas, con KV cache ajustable según la longitud de contexto.
- Tareas educativas y de investigación: modelo pequeño y abierto para experimentar con arquitecturas híbridas de atención y cabezas MTP sin grandes presupuestos de cómputo.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, greedy y prompts estilo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable directamente con evaluaciones por log-likelihood. Entre paréntesis, la recuperación frente al original en BF16.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 50,56 | 50,50 (99,9 %) | 50,31 (99,5 %) | 48,39 (95,7 %) | 46,36 (91,7 %) | 48,55 (96,0 %) |
| GSM8K (5-shot, estricto) | 32,68 | 29,80 (91,2 %) | 32,30 (98,8 %) | 29,49 (90,3 %) | 22,82 (69,8 %) | 28,20 (86,3 %) |
| ARC-Challenge (0-shot) | 37,54 | 36,52 (97,3 %) | 37,46 (99,8 %) | 35,07 (93,4 %) | 33,11 (88,2 %) | 35,15 (93,6 %) |
| Winogrande (5-shot) | 56,27 | 55,49 (98,6 %) | 56,67 (100,7 %) | 55,80 (99,2 %) | 55,64 (98,9 %) | 55,88 (99,3 %) |
| KMMLU (5-shot, directo) | 34,54 | 34,22 (99,1 %) | 34,20 (99,0 %) | 35,02 (101,4 %) | 33,51 (97,0 %) | 35,74 (103,5 %) |
| HAE-RAE (0-shot) | 37,03 | 35,29 (95,3 %) | 36,30 (98,0 %) | 34,10 (92,1 %) | 27,31 (73,8 %) | 34,28 (92,6 %) |
| **Media** | **41,44** | **40,30 (97,3 %)** | **41,21 (99,4 %)** | **39,65 (95,7 %)** | **36,46 (88,0 %)** | **39,63 (95,6 %)** |

Fidelidad frente al original en un conjunto interno mixto inglés/coreano de 100 prompts (respuestas BF16 greedy puntuadas con cada build):

| Métrica | Este modelo | Original BF16 |
|---|---|---|
| Perplejidad (menor = más cercano) | 2,0506 | 2,0174 (+1,6 %) |
| Acuerdo top-1 en siguiente token | 93,3 % | 98,7 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 1,3 GB solo de pesos; hay que añadir la KV cache (crece con la longitud de contexto y las peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Turing (sm75, como la T4) o superior. La aritmética FP8 real requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automáticamente a FP8 solo de pesos. V100 (sm70) no está soportada. El autor solo probó en B200.
- GPU de consumo: cabe holgadamente en RTX 4090 y en tarjetas con 8 GB o más; en T4 funciona con FP8 solo de pesos.
- Opciones de despliegue: vLLM (arquitectura disponible desde vLLM ≥ 0.17.0; probado con 0.32.0). Sin vLLM, requiere transformers ≥ 5.2.0 y compressed-tensors ≥ 0.15.0. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Entorno de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, driver con soporte CUDA 13), transformers ≥ 5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Tensor parallelism: usar `--tensor-parallel-size N` si los pesos no caben en una GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con las cuantizaciones alternativas del mismo modelo base, según los datos del autor (media de benchmarks y licencia):

| Modelo | Parámetros | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-FP8-dynamic (este) | 873 M | No disponible | 40,30 (97,3 %) | Apache-2.0 | Hugging Face, vLLM |
| Qwen3.5-0.8B AWQ-8bit | 873 M | No disponible | 41,21 (99,4 %) | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B NVFP4 | 873 M | No disponible | 36,46 (88,0 %) | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B AWQ-4bit | 873 M | No disponible | 39,63 (95,6 %) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La revisión anterior a `819e1e7` (antes del 1 de noviembre de 2026, 23:17:16 UTC) tiene un `config.json` defectuoso que produce respuestas erróneas con entrada de imagen en vLLM 0.32; es necesario descargar de nuevo `config.json`.
- La cuantización degrada GSM8K hasta un 91,2 % de recuperación (29,80 frente a 32,68), la mayor pérdida entre los benchmarks medidos; para tareas matemáticas exigentes conviene valorar AWQ-8bit.
- El acuerdo top-1 en siguiente token es del 93,3 % frente al 98,7 % del original, y la perplejidad sube un 1,6 %: hay divergencia respecto al BF16 en la distribución de salida.
- No se declara lista de idiomas soportados; la evaluación solo cubre inglés y coreano.
- No se dispone de información sobre sesgos, riesgo de alucinación específico ni limitaciones de contexto del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo cuantizado en producción.
- El modelo base no incluye `generation_config.json`, por lo que esta versión tampoco lo aporta; los parámetros de generación deben configurarse manualmente.
- Requiere versiones muy concretas de vLLM, transformers y compressed-tensors; mezclar versiones puede romper la carga del checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-0.8B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
