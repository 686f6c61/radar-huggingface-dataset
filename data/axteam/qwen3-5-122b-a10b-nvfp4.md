# axteam/Qwen3.5-122B-A10B-NVFP4

## Resumen

Qwen3.5-122B-A10B-NVFP4 es una cuantizacion de 4 bits (NVFP4, W4A4) del modelo multimodal Qwen/Qwen3.5-122B-A10B, publicada por el usuario axteam para servir el modelo de forma eficiente en vLLM. Se trata de un modelo de arquitectura hibrida que combina atencion lineal (GatedDeltaNet/SSM) con atencion completa, y un Mixture of Experts con 256 expertos mas uno compartido, del que se activan aproximadamente 10B de los 122B parametros totales. Incluye torre de vision y una cabeza MTP (multi-token prediction), lo que lo hace apto para tareas image-text-to-text.

La relevancia de esta ficha es practica: el repositorio documenta una cuantizacion post-entrenamiento (PTQ) con AWQ para proteger canales salientes antes del redondeo, manteniendo en BF16 el router del MoE, las RMSNorm, los embeddings, la cabeza LM, la torre de vision, la cabeza MTP y toda la ruta de atencion lineal. El autor publico una revision reconstruida el 2026-11-01 que corrige la compensacion del router y del gate de expertos compartidos, un detalle critico porque afecta al enrutamiento de tokens.

El modelo ocupa aproximadamente 81,5 GB en disco y esta pensado para despliegue en produccion con vLLM (probado con vLLM 0.32.0). La licencia es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial. No se dispone de informacion publicada sobre idiomas soportados en la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: atencion lineal (GatedDeltaNet/SSM) + atencion completa; MoE con 256 expertos + compartido; multimodal (vision); cabeza MTP |
| Parametros totales | 125.086.497.008 (~125B) |
| Parametros activos | ~10B (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1), pesos en grupo de 16 con escala FP8 E4M3 y escala global FP32 por tensor; activaciones FP4; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, `nvfp4-pack-quantized`), libreria transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que intercala capas de atencion lineal (GatedDeltaNet/SSM) con capas de atencion completa, lo que reduce el coste de atencion en contextos largos. La capa de alimentacion es un Mixture of Experts con 256 expertos mas un experto compartido, con enrutamiento por token y aproximadamente 10B parametros activos de 122B totales. Incorpora una torre de vision y un proyector para entrada image-text-to-text, ademas de una cabeza de prediccion multi-token (MTP). Esta es una cuantizacion PTQ: no hay reentrenamiento. AWQ se aplica con un conjunto de calibracion de 256 muestras (corpus mixto con predominio de coreano) para proteger canales salientes antes del redondeo a FP4. La revision del 2026-11-01 reconstruyo los ficheros para compensar el router del MoE (`mlp.gate`) y el gate del experto compartido durante el suavizado AWQ, y para excluir del escalado de normalizacion los canales con ganancia de norma cero. Segun el autor, la primera subida dejaba el router sin compensar, lo que desviaba tokens a expertos distintos de los del original, y perdiia precision de norma en la capa 27. Se mantienen en BF16 la torre y proyector de vision (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la cabeza LM, el router del MoE, el gate del experto compartido y toda la ruta de atencion lineal (`linear_attn.*`), que representa aproximadamente el 6% de los parametros. `linear_attn.A_log` se almacena en BF16 de forma sin perdida y la norma con los mismos valores que vLLM y Transformers cargan por defecto.

## Capacidades

- Generacion de texto conversacional y razonamiento general.
- Comprension de imagenes y texto (pipeline image-text-to-text) mediante torre de vision y proyector.
- Razonamiento matematico y resolucion de problemas de varios pasos.
- Generacion y comprension de codigo (segun benchmarks del modelo base, no detallados en esta model card).
- Capacidades multilingues: la model card no detalla idiomas; el corpus de calibracion es mixto con predominio de coreano, pero no se confirma cobertura oficial.
- Cabeza de prediccion multi-token (MTP), util para decodificacion especulativa y aceleracion de inferencia.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta imagen y texto y puede desplegarse en vLLM con cuantizacion NVFP4, reduciendo el espacio en disco a ~81,5 GB frente al modelo BF16, lo que abarata el coste por instancia en GPUs con soporte FP4.
- Asistencia sobre documentos con imagenes: extraccion y razonamiento combinado de texto e imagenes (facturas, capturas, diagramas) gracias a la torre de vision integrada y a la ventana de contexto del modelo base.
- Razonamiento matematico asistido: el modelo conserva el 95,3% del rendimiento GSM8K del original BF16 (80,52 frente a 84,46), adecuado para tutoria o verificacion de calculos donde no se requiere precision absoluta.
- Generacion de codigo en pipelines internos: al mantener la cabeza LM y los embeddings en BF16 y conservar el 99,6% en MMLU generativo, es viable para autocompletado y revision de codigo en entornos con GPUs FP4.
- Despliegue en clusters con GPUs Blackwell: NVFP4 esta disenado para aceleracion FP4 nativa; el formato compressed-tensors permite cargar el modelo directamente en vLLM 0.32 sin conversion manual.
- Evaluacion comparativa de cuantizaciones: el repositorio publica resultados medidos con lm-evaluation-harness y metricas de fidelidad (perplejidad y acuerdo top-1), lo que lo convierte en una referencia util para decidir entre NVFP4, FP8-dynamic, AWQ-8bit y AWQ-4bit.
- Investigacion sobre enrutamiento MoE: la documentacion detallada sobre la compensacion del router y del gate compartido sirve como caso de estudio para quienes cuantizan modelos MoE.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts estilo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con evaluaciones por log-likelihood. Porcentajes entre parentesis: recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 88,06 | 87,89 (99,8%) | 87,89 (99,8%) | 87,91 (99,8%) | 87,69 (99,6%) | 87,69 (99,6%) |
| GSM8K (5-shot, strict) | 84,46 | 83,93 (99,4%) | 84,23 (99,7%) | 84,84 (100,4%) | 80,52 (95,3%) | 83,78 (99,2%) |
| ARC-Challenge (0-shot) | 63,74 | 63,91 (100,3%) | 63,74 (100,0%) | 63,40 (99,5%) | 62,71 (98,4%) | 62,80 (98,5%) |
| Winogrande (5-shot) | 73,09 | 73,24 (100,2%) | 73,56 (100,6%) | 72,77 (99,6%) | 73,16 (100,1%) | 73,01 (99,9%) |
| KMMLU (5-shot, direct) | 71,72 | 71,72 (100,0%) | 71,67 (99,9%) | 71,35 (99,5%) | 70,80 (98,7%) | 71,20 (99,3%) |
| HAE-RAE (0-shot) | 82,31 | 81,39 (98,9%) | 81,76 (99,3%) | 81,48 (99,0%) | 80,20 (97,4%) | 80,93 (98,3%) |
| **Media** | **77,23** | **77,01 (99,7%)** | **77,14 (99,9%)** | **76,96 (99,7%)** | **75,85 (98,2%)** | **76,57 (99,1%)** |

Fidelidad respecto al original BF16 en un conjunto interno mixto ingles/coreano de 100 prompts (respuestas greedy del original BF16 puntuadas con cada build; medicion del 2026-11-02 con vLLM 0.32):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,3787 | 1,3258 (+4,0%) |
| Acuerdo top-1 en siguiente token | 92,9% | 98,4% |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa ~81,5 GB en disco; se necesita al menos esa cantidad de memoria para pesos, mas overhead de KV cache, activaciones y buffers de vLLM. Con contexto largo y batch grande, el consumo total puede superar ampliamente los 100 GB.
- GPUs recomendadas: NVIDIA con soporte nativo FP4, es decir, arquitectura Blackwell (B200, GB200, RTX 50xx). No se garantiza funcionamiento en Ampere, Hopper o Ada para NVFP4 nativo.
- Cabe en consumer GPU: no en GPUs de consumo convencionales por tamano (81,5 GB de pesos); solo en configuraciones con suficiente VRAM y soporte FP4.
- Opciones de despliegue: vLLM (runtime probado, vLLM 0.32.0; la arquitectura esta en vLLM >= 0.17.0). Requiere Python 3.11-3.14, torch 2.13 con build CUDA 13.0 (driver NVIDIA con soporte CUDA 13), transformers >= 5.16.1,< 5.20 y compressed-tensors 0.17.0. No se mencionan llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Media benchmarks (segun el autor) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B (BF16, original) | ~125B totales / ~10B activos | no disponible | BF16 | 77,23 | Apache-2.0 |
| Qwen3.5-122B-A10B-NVFP4 (este repo) | ~125B totales / ~10B activos | no disponible | NVFP4 W4A4 | 75,85 (98,2% del BF16) | Apache-2.0 |
| Qwen3.5-122B-A10B FP8-dynamic | ~125B totales / ~10B activos | no disponible | FP8 | 77,01 (99,7% del BF16) | Apache-2.0 |
| Qwen3.5-122B-A10B AWQ-8bit | ~125B totales / ~10B activos | no disponible | AWQ 8-bit | 77,14 (99,9% del BF16) | Apache-2.0 |
| Qwen3.5-122B-A10B AWQ-4bit | ~125B totales / ~10B activos | no disponible | AWQ 4-bit | 76,57 (99,1% del BF16) | Apache-2.0 |

## Limitaciones y advertencias

- La cuantizacion NVFP4 degrada GSM8K hasta el 95,3% del original (80,52 frente a 84,46); no es la mejor opcion si el razonamiento matematico estricto es critico. AWQ-8bit y FP8-dynamic conservan mejor este benchmark.
- Perplejidad un 4,0% superior al original BF16 y acuerdo top-1 del 92,9% frente al 98,4% del original: hay divergencia de generacion en una parte no trivial de los tokens.
- La revision del 2026-11-01 corrige un fallo de enrutamiento del MoE en la primera subida (revision `c96b64e`); quien haya descargado el repositorio antes de esa fecha debe volver a descargarlo.
- Requiere hardware Blackwell con soporte FP4 y un stack concreto (vLLM 0.32, torch 2.13 CUDA 13, transformers >= 5.16.1,< 5.20, compressed-tensors 0.17.0); no es portable a cualquier entorno.
- El conjunto de calibracion es pequeno (256 muestras) y con predominio de coreano; puede sesgar la calidad en otros idiomas o dominios.
- No se detallan sesgos conocidos, riesgos de alucinacion especificos ni cobertura idiomatica oficial en la model card del autor.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base enlazada en el repositorio.
- El modelo tiene 315 descargas y 1 like; es una cuantizacion de terceros (axteam), no oficial de Qwen, por lo que la validacion corre a cargo del usuario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-122B-A10B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
