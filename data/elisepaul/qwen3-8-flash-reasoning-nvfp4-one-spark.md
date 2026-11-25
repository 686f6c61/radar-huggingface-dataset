# elisepaul/Qwen3.8-Flash-Reasoning-NVFP4-One-Spark

## Resumen

Qwen3.8-Flash-Reasoning-NVFP4-One-Spark es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) heterogéneo publicado por el usuario elisepaul en Hugging Face. Se trata de una fusión experimental que combina la arquitectura del modelo de código `elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean` (448 expertos enrutados orientados a programación) con 64 expertos de razonamiento procedentes de `nvidia/DeepSeek-V4.1-Flash-1017-NVFP4`, dando lugar a un total de 512 expertos enrutados distribuidos en 40 capas MoE más 8 capas densas. El objetivo declarado es aunar la precisión en generación de código y ejecución de terminal con el razonamiento algorítmico de cadena de pensamiento (chain-of-thought).

El modelo está cuantizado de forma nativa en NVFP4 (FP4 E2M1 con escalas de bloque FP8 de 16 elementos) y está específicamente empaquetado para ejecutarse en un único nodo NVIDIA DGX Spark (GB10 Blackwell con 128 GiB de memoria unificada LPDDR5x). Incorpora una cabeza de predicción multi-token (MTP) de 4 tokens como drafter especulativo para acelerar la decodificación. El repositorio ocupa 83,4 GB y contiene 131.711.817.584 parámetros totales según los safetensors.

La relevancia de esta ficha radica en que documenta una técnica poco habitual: la transplante de expertos entre linajes arquitectónicos distintos mediante alineamiento de representación con Procrustes ortogonal y escalado de atenuación geométrica. Es un modelo de nicho, orientado a hardware concreto y con validación empírica limitada (un único benchmark declarado: 96,6 en MATH-500), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE heterogéneo (40 capas MoE + 8 capas densas), con MTP de 4 tokens |
| Parametros totales | 131.711.817.584 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 FP4 con escalas de bloque FP8 de 16 elementos); también se mencionan MXFP8 y FP8 en los tags |
| Idiomas soportados | en, zh, code |
| Licencia | nvidia-open-model-license (etiquetada como "other" en el repo) |
| Formato de pesos | safetensors (11 shards activos, 300.982 tensores indexados) |

## Arquitectura y entrenamiento

La arquitectura parte de un MoE de grano fino con 40 capas MoE (capas 00 a 39) y 8 capas densas de representación (capas 40 a 47). El modelo base aporta 448 expertos enrutados orientados a código con dimensiones d_model = 2560 y d_int = 640, además de 8 capas densas superiores, un experto compartido de backbone y conexiones residuales con HyperConnections de 4 flujos. Sobre esa topología se injertan 64 expertos de razonamiento procedentes de DeepSeek-V4.1-Flash-1017 (d_model = 5120, d_int = 2304), seleccionados mediante un protocolo de poda por saliencia REAP (Router-weighted Expert Activation Pruning) evaluado sobre 403 tareas de código, terminal y verificación algorítmica.

El punto técnico central es la integración de expertos de linajes distintos sin reentrenamiento: según la model card, el transplante directo (zero-shot) falla, y se resuelve mediante alineamiento de representación con Procrustes ortogonal para corregir la divergencia de bases de coordenadas, más un escalado de atenuación geométrica para evitar la explosión de ganancia residual. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La cuantización NVFP4 se realiza con NVIDIA ModelOpt, y el despliegue está pensado para vLLM con FlashInfer sobre hardware Blackwell.

## Capacidades

- Generación de texto conversacional y de propósito general en inglés y chino.
- Generación de código y comprensión de APIs, heredada de la rama Coder-Lean.
- Razonamiento algorítmico y de cadena de pensamiento (chain-of-thought, "deep-thinking") procedente de los expertos donantes de DeepSeek.
- Ejecución y verificación en terminal (el linaje donante se seleccionó con tareas de terminal y verificación algorítmica).
- Decodificación especulativa mediante cabeza MTP de 4 tokens, que acelera la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque los tags incluyen "agent".
- Capacidades multilingües: limitadas a inglés, chino y código.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia a la programación en entornos con restricciones de hardware: el modelo cabe en un único DGX Spark con 128 GiB de memoria unificada, lo que permite desplegar un asistente de código local sin depender de la nube, aprovechando los 448 expertos de código del linaje base.
- Razonamiento matemático y algorítmico: con un 96,6 declarado en MATH-500, puede emplearse para resolver problemas de matemáticas y verificación algorítmica en pipelines internos de evaluación o tutoría.
- Automatización de tareas de terminal y CI/CD: el linaje donante se seleccionó sobre tareas de terminal y verificación, por lo que encaja en agentes que ejecutan comandos, interpretan salidas y corrigen errores en pipelines.
- Prototipado de agentes de código multi-paso: la combinación de generación de código y razonamiento CoT permite construir agentes que planifican, escriben y revisan parches sobre repositorios, aunque requiere validación propia al no haber benchmarks de SWE-bench publicados.
- Investigación en fusión de modelos: sirve como caso de estudio reproducible de transplante de expertos entre arquitecturas distintas con Procrustes ortogonal, útil para grupos que investigan model merging y MoE heterogéneos.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse en un nodo local con licencia NVIDIA Open Model, puede usarse en organizaciones que no pueden enviar código a APIs externas, siempre que se respete la licencia.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| MATH-500 | Accuracy | 96,6 | No (declarado por el autor) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, SWE-bench) en la información disponible. El dataset SWE-bench_Lite aparece en los metadatos, pero no se aporta ninguna puntuación sobre él.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 83,4 GB en disco y el motor reporta 76,12 GiB residentes, 22,64 GiB de caché KV y 22,64 GiB de margen, sobre 121,63 GiB direccionables.
- Hardware objetivo: un único NVIDIA DGX Spark (GB10 Blackwell, 128 GiB de memoria unificada LPDDR5x, sin swap). No está pensado para GPUs discretas convencionales.
- GPU consumer: no cabe en GPUs consumer típicas (RTX 4090 con 24 GB, etc.) por el tamaño del modelo y la cuantización NVFP4, que requiere soporte Blackwell.
- Opciones de despliegue: vLLM con FlashInfer (librería declarada). No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La cabeza MTP de 4 tokens está orientada a acelerar la decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Reasoning-NVFP4-One-Spark | 131.711.817.584 | no disponible | nvidia-open-model-license | Hugging Face (vLLM) |
| elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean (base) | no disponible | no disponible | no disponible | Hugging Face |
| nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 (donante) | no disponible | no disponible | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash (donante original) | no disponible | no disponible | no disponible | Hugging Face |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada. La comparación se limita a la relación de linaje declarada en la model card.

## Limitaciones y advertencias

- Validación empírica muy limitada: solo se declara un resultado (MATH-500 = 96,6) y el propio autor lo marca como no verificado; no hay datos de SWE-bench, HumanEval ni MMLU.
- Modelo experimental de fusión: el transplante de expertos entre linajes con Procrustes ortogonal y atenuación geométrica es una técnica de investigación sin validación independiente conocida.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de razonamiento CoT, puede generar cadenas plausibles pero incorrectas.
- Idiomas limitados a inglés, chino y código; no hay soporte declarado de castellano.
- Longitud de contexto no especificada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de hardware: requiere un DGX Spark (GB10 Blackwell) y cuantización NVFP4; no es desplegable en GPUs consumer ni en arquitecturas anteriores.
- Licencia NVIDIA Open Model: debe revisarse antes de uso comercial; el repo la etiqueta como "other" y no se detallan las condiciones en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Al ser un modelo derivado de terceros (Qwen y DeepSeek), las obligaciones de atribución de las licencias upstream pueden aplicar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elisepaul/Qwen3.8-Flash-Reasoning-NVFP4-One-Spark
- Modelo base (Coder-Lean): https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Donante de razonamiento (NVFP4): https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Donante original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Dataset SWE-bench Lite: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Paper DeepSeek-V3 (arxiv:2412.19437): https://arxiv.org/abs/2412.19437
- Paper DeepSeek-V2 (arxiv:2409.19606): https://arxiv.org/abs/2409.19606
- Paper Qwen2 (arxiv:2404.19737): https://arxiv.org/abs/2404.19737
- Paper Qwen2.5 (arxiv:2412.15115): https://arxiv.org/abs/2412.15115
- Paper FlashAttention (arxiv:2307.08691): https://arxiv.org/abs/2307.08691
- Paper (arxiv:2312.06635): https://arxiv.org/abs/2312.06635
- Paper (arxiv:2403.13257): https://arxiv.org/abs/2403.13257
