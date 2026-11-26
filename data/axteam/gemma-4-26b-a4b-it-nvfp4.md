# axteam/gemma-4-26B-A4B-it-NVFP4

## Resumen

Gemma 4 26B A4B IT NVFP4 es una versión cuantizada a 4 bits del modelo multimodal `google/gemma-4-26B-A4B-it` de Google, publicada por el equipo axteam. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 25.805.936.206 parámetros totales (8 expertos activos de 128 totales más 1 compartido) y pipeline `image-text-to-text`, es decir, acepta entradas de imagen y texto y genera texto. Esta build concreta aplica cuantización NVFP4 (W4A4, FP4 E2M1) mediante PTQ con AWQ y un conjunto de calibración de 256 muestras, y está empaquetada en formato `compressed-tensors` `nvfp4-pack-quantized` para servir con vLLM.

La relevancia de esta ficha es práctica: reduce el peso en disco a unos 17,2 GB y permite servir el modelo en GPUs con soporte de FP4 nativo (arquitectura Blackwell) con throughput notablemente superior al BF16. Sin embargo, la propia model card advierte de una degradación medible: la recuperación media frente al original BF16 es del 93,4% en los benchmarks medidos, con caídas acusadas en MMLU (78,0%) y GSM8K (92,0%). Es, por tanto, una opción de despliegue orientada a coste y latencia, no a máxima fidelidad.

La licencia declarada en el repo es Apache-2.0, con enlace a la licencia específica de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. El modelo se publicó en octubre de 2026 y se actualizó en noviembre de 2026, con 259 descargas y 2 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (8 activos / 128 totales + 1 compartido) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 8 expertos de 128 (+1 compartido); número exacto de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1), pesos en grupo de 16 con escala FP8 E4M3 y escala global FP32 por tensor; activaciones FP4; visión, proyección visual, embeddings, router MoE, normas y MLP compartido en BF16 (~7% de parámetros) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors, `compressed-tensors` `nvfp4-pack-quantized` |
| Tamano en disco | ~17,2 GB |
| Modelo base | google/gemma-4-26B-A4B-it (commit 4d7ae49) |
| Metodo de cuantizacion | PTQ con AWQ, calibración de 256 muestras (mayoritariamente coreano, con 32 respuestas de thinking-mode autogeneradas) |
| Libreria / runtime | transformers; servido con vLLM ≥ 0.19.0 (probado con 0.32.0) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de Gemma 4: 128 expertos totales de los que se activan 8 por token, más un experto compartido, con un router MoE que se mantiene en BF16 en esta build. La cuantización no altera la topología: se conservan íntegras la torre de visión, la proyección visual, los embeddings de tokens (atados con el `lm_head`), el router, todas las normas y el MLP compartido, que en conjunto representan aproximadamente el 7% de los parámetros y permanecen sin cuantizar para preservar calidad.

El proceso de cuantización es PTQ (post-training quantization) con AWQ: no hay reentrenamiento ni gradientes. Un conjunto de calibración de 256 muestras identifica los canales de peso que multiplican las activaciones de mayor magnitud y los protege mediante escalado por canal, plegado en capas adyacentes antes del redondeo. La model card distingue explícitamente este enfoque de RTN (más rápido pero peor a 4 bits) y de QAT (mejor fidelidad a bajo bit, pero requiere fine-tuning completo); esta build es AWQ, no QAT. El tokenizador, `chat_template`, `processor_config` y `generation_config` son idénticos byte a byte al original, incluida la corrección de julio de 2026 del `chat_template` de Google; `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica a la del modelo original.
- Entrada multimodal imagen-texto: el pipeline es `image-text-to-text` y la torre de visión se conserva en BF16.
- Razonamiento en modo thinking: la calibración incluye respuestas autogeneradas de thinking-mode y el modelo base es la variante `-it` (instruction-tuned).
- Razonamiento matemático y de sentido común, medido en GSM8K, ARC-Challenge y Winogrande.
- Conocimiento multilingüe, con benchmarks específicos de coreano (KMMLU, HAE-RAE) en la evaluación publicada.
- Servicio de alto rendimiento con vLLM, incluido soporte de FP4 nativo en GPUs Blackwell.
- Tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo acepta imagen y texto y genera respuestas conversacionales; con ~17,2 GB en disco y FP4 nativo en Blackwell, permite desplegar un MoE de 26B en una sola GPU con mayor throughput que la versión BF16.
- Descripción y análisis de imágenes a escala: la torre de visión permanece en BF16, por lo que tareas de captioning o extracción de información visual mantienen la fidelidad del original mientras el resto del modelo se sirve a 4 bits.
- Asistentes con conocimiento de coreano: los benchmarks KMMLU (94,1% de recuperación) y HAE-RAE (95,7%) indican que la cuantización degrada poco el rendimiento en coreano, lo que lo hace apto para productos dirigidos a ese mercado.
- Razonamiento matemático de coste contenido: con un 92,0% de recuperación en GSM8K, es utilizable en pipelines de resolución de problemas aritméticos donde el coste por token prima sobre la precisión máxima.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir el impacto real de NVFP4 frente a FP8-dynamic, AWQ-8bit o AWQ-4bit en el mismo harness (lm-evaluation-harness sobre vLLM).
- Prototipado e investigación con restricciones de VRAM: al reducir el peso a ~17,2 GB, permite experimentar con un MoE de 26B en hardware que no admitiría la versión BF16, a cambio de asumir la pérdida de fidelidad documentada.
- Despliegue en clústeres con vLLM: la integración con `compressed-tensors` 0.17.0 y vLLM 0.32.0 facilita incorporarlo a infraestructuras de serving existentes sin cambiar el stack.

## Benchmarks y rendimiento

Medidos con lm-evaluation-harness sobre vLLM, greedy, prompts completion-style sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-likelihood. Porcentajes entre paréntesis: recuperación frente al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 40,23 | 35,77 (88,9%) | 38,72 (96,2%) | 30,44 (75,7%) | 31,39 (78,0%) | 33,21 (82,5%) |
| GSM8K (5-shot, strict) | 66,19 | 67,70 (102,3%) | 67,10 (101,4%) | 50,42 (76,2%) | 60,88 (92,0%) | 55,12 (83,3%) |
| ARC-Challenge (0-shot) | 45,39 | 45,82 (100,9%) | 44,88 (98,9%) | 44,62 (98,3%) | 44,28 (97,6%) | 44,62 (98,3%) |
| Winogrande (5-shot) | 58,48 | 60,22 (103,0%) | 59,91 (102,4%) | 58,64 (100,3%) | 57,77 (98,8%) | 58,48 (100,0%) |
| KMMLU (5-shot, direct) | 36,52 | 34,81 (95,3%) | 35,84 (98,1%) | 33,42 (91,5%) | 34,37 (94,1%) | 33,91 (92,9%) |
| HAE-RAE (0-shot) | 76,17 | 75,62 (99,3%) | 75,99 (99,8%) | 73,60 (96,6%) | 72,87 (95,7%) | 70,76 (92,9%) |
| Media | 53,83 | 53,32 (99,1%) | 53,74 (99,8%) | 48,53 (90,1%) | 50,26 (93,4%) | 49,35 (91,7%) |

Evaluación de fidelidad frente al original BF16 en un conjunto interno mixto inglés/coreano (variante de cuantización: AWQ atención + por experto completo):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2802 | 1,1284 (+13,4%) |
| Acuerdo top-1 en siguiente token | 91,0% | 98,7% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el peso en disco es de ~17,2 GB, por lo que se requiere al menos esa cifra más overhead de KV cache y activaciones.
- GPU recomendadas: se necesita una GPU NVIDIA con soporte de FP4 nativo (arquitectura Blackwell) para obtener la velocidad completa W4A4; la model card no detalla modelos concretos más allá de "Blackwell".
- GPU de consumo: no disponible; la información no confirma si cabe en RTX 4090 u otras GPU consumer, y la aceleración FP4 no estaría disponible en arquitecturas anteriores a Blackwell.
- Despliegue: vLLM ≥ 0.19.0, probado con 0.32.0. Requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible con CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; el checkpoint se guardó con 0.19.0, no actualizar por separado).
- Latencia y throughput: no disponibles como cifras concretas; la model card solo indica que se obtiene "velocidad completa FP4 (W4A4)" en Blackwell.

## Comparativa con modelos similares

Comparación con las otras cuantizaciones del mismo modelo base, según los datos publicados por axteam:

| Modelo | Parámetros | Contexto | Media benchmarks | Licencia | Formato |
|---|---|---|---|---|---|
| Este repo (NVFP4 W4A4) | 25,8B totales | no disponible | 50,26 (93,4% de recuperación) | Apache-2.0 / Gemma 4 | safetensors, compressed-tensors |
| AWQ-8bit | 25,8B totales | no disponible | 53,74 (99,8%) | Apache-2.0 / Gemma 4 | no disponible |
| FP8-dynamic | 25,8B totales | no disponible | 53,32 (99,1%) | Apache-2.0 / Gemma 4 | no disponible |
| AWQ-4bit | 25,8B totales | no disponible | 49,35 (91,7%) | Apache-2.0 / Gemma 4 | no disponible |
| BF16 original (google/gemma-4-26B-A4B-it) | 25,8B totales | no disponible | 53,83 | Gemma 4 | safetensors |

Comparación con modelos de otras familias: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible: la recuperación media es del 93,4% frente al BF16; MMLU cae al 78,0% y GSM8K al 92,0%. La propia model card recomienda una build de 8 bits si la calidad es prioritaria.
- Perplejidad un 13,4% superior al original (1,2802 frente a 1,1284) y acuerdo top-1 del 91,0% frente al 98,7% del BF16.
- Es PTQ con AWQ, no QAT: no hay adaptación de pesos mediante gradientes, por lo que la fidelidad a bajo bit es inferior a la de un checkpoint QAT de Google.
- La calibración es mayoritariamente coreana (256 muestras), lo que puede sesgar el comportamiento de la cuantización hacia ese idioma en perjuicio de otros.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo inherente al modelo base, no evaluado aquí.
- Idiomas soportados: no disponibles de forma explícita; los benchmarks cubren inglés y coreano.
- Licencia: el repo declara Apache-2.0 pero enlaza a la licencia Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma 4 antes de desplegar en producción.
- Dependencia estricta del stack: requiere vLLM 0.32.0 con transformers y compressed-tensors en versiones fijadas; actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- La aceleración FP4 completa exige hardware Blackwell; en GPUs anteriores el rendimiento y posiblemente el soporte quedan limitados.
- Contexto máximo no documentado en la información proporcionada, lo que impide planificar cargas de contexto largo con precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-26B-A4B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
