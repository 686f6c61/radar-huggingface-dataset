# axteam/gemma-4-26B-A4B-NVFP4

## Resumen

axteam/gemma-4-26B-A4B-NVFP4 es una cuantizacion de 4 bits en formato NVFP4 (W4A4, FP4) del modelo base google/gemma-4-26B-A4B, publicada por el usuario axteam. El modelo original es un Mixture-of-Experts (MoE) de Gemma 4 con 25.805.936.206 parametros totales y una arquitectura de 8 expertos activos sobre 128 totales mas uno compartido, lo que lo situa en la categoria de modelos grandes con activacion dispersa. Esta version cuantizada ocupa aproximadamente 17,2 GB en disco, frente al peso en BF16 del original, y esta pensada especificamente para servir con vLLM.

El proposito de esta publicacion es ofrecer una variante de bajo coste computacional que mantenga una fidelidad razonable respecto al BF16 original, aprovechando el soporte nativo de FP4 en las GPU Blackwell (B200, GB200, B300, RTX 50xx y RTX PRO 6000). La cuantizacion se realizo mediante PTQ con AWQ sobre un conjunto de calibracion de 256 muestras, sin reentrenamiento, y conserva en BF16 el tower de vision, la proyeccion de vision, los embeddings, el router MoE, las normas y el MLP compartido (aproximadamente el 7% de los parametros).

Es relevante ahora porque permite desplegar un modelo multimodal de ~26B parametros totales con activacion de ~4B en hardware consumer de gama alta Blackwell, manteniendo cerca del 97% del rendimiento medio del BF16 en los benchmarks medidos. La licencia declarada es Apache-2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (8 activos / 128 totales + 1 compartido) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 8 de 128 expertos + 1 compartido (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1), pesos en grupo de 16 con escala FP8 E4M3 y escala global FP32 por tensor; activaciones FP4; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (calibracion con sesgo hacia coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors), 17,2 GB en disco |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de Gemma 4: 128 expertos totales con 8 activos por token mas un experto compartido, lo que reduce el coste de inferencia respecto a un denso equivalente. Incluye un tower de vision y una proyeccion multimodal, ya que el pipeline declarado es image-text-to-text. Esta version concreta es una cuantizacion post-entrenamiento (PTQ) con AWQ: se parte de los pesos BF16 liberados por Google (commit `24548b6`) y se cuantizan sin reentrenamiento, usando 256 muestras de calibracion (con predominio de coreano, incluyendo 32 respuestas autogeneradas en modo thinking para la variante -it).

La innovacion tecnica principal es el esquema NVFP4 (W4A4): pesos y activaciones en FP4 E2M1, con escalas por grupo de 16 en FP8 E4M3 y una escala global FP32 por tensor. Se mantienen en BF16 el tower de vision, la proyeccion de vision, los embeddings de tokens (atados con lm_head), el router MoE, todas las normas y el MLP compartido, aproximadamente el 7% de los parametros, para preservar calidad. El tokenizer, `processor_config` y `generation_config` son identicos byte a byte al original. Es un modelo base preentrenado sin plantilla de chat, por lo que debe usarse con completion de texto plano. El `config.json` es el original mas un bloque `quantization_config`.

## Capacidades

- Generacion de texto y completion de texto plano (modelo base, sin plantilla de chat).
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la model card indica que la entrada de imagen no se probo en esta build.
- Razonamiento y respuesta a preguntas en formato generativo (evaluado con MMLU generativo, ARC-Challenge, Winogrande).
- Razonamiento matematico basico (evaluado con GSM8K en modo strict).
- Capacidades multilingues parciales: evaluado en ingles (MMLU, GSM8K, ARC, Winogrande) y coreano (KMMLU, HAE-RAE).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: la calibracion de la variante -it incluye respuestas en modo thinking, pero esta build es base y no declara modo thinking explicito.
- Vision, audio u otras capacidades especiales: vision si (tower conservado en BF16); audio no disponible.

## Casos de uso

- Servicio de inferencia multimodal en produccion con vLLM: el modelo esta empaquetado en compressed-tensors `nvfp4-pack-quantized` y probado con vLLM 0.32.0, lo que permite desplegarlo como endpoint compatible con la API de vLLM en GPU Blackwell con throughput alto gracias a la activacion MoE de 8 expertos.
- Despliegue en GPU consumer Blackwell: al ocupar ~17,2 GB en disco y cuantizar a W4A4, cabe en RTX 50xx y RTX PRO 6000, lo que habilita prototipos y demos locales de un modelo de ~26B parametros totales sin infraestructura de datacenter.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran medir la degradacion de AWQ-NVFP4 frente a BF16, FP8-dynamic, AWQ-8bit, NVFP4A16 y AWQ-4bit con el mismo harness (lm-evaluation-harness sobre vLLM).
- Generacion de texto a gran escala en ingles y coreano: los benchmarks cubren MMLU, GSM8K, ARC-Challenge, Winogrande, KMMLU y HAE-RAE, lo que lo hace adecuado para tareas de QA y razonamiento en esos idiomas con la fidelidad medida (~97,1% de media respecto a BF16).
- Fine-tuning o destilacion sobre una base cuantizada: al ser un modelo base sin plantilla de chat, sirve como punto de partida para adaptaciones posteriores, aunque la cuantizacion PTQ puede limitar la calidad del ajuste fino.
- Investigacion sobre eficiencia de MoE con FP4: permite estudiar el equilibrio entre activacion dispersa (8/128) y precision FP4 en cargas de trabajo reales de vLLM.
- Despliegue en entornos con restricciones de VRAM: la reduccion de ~17,2 GB frente al BF16 facilita servir el modelo en una sola GPU cuando el original no cabe.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con MMLU por log-likelihood. Porcentajes entre parentesis: recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (esta repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 77,77 | 77,25 (99,3%) | 77,75 (100,0%) | 77,18 (99,2%) | 76,20 (98,0%) | 76,82 (98,8%) |
| GSM8K (5-shot, strict) | 70,89 | 71,34 (100,6%) | 71,49 (100,9%) | 69,98 (98,7%) | 67,17 (94,8%) | 69,98 (98,7%) |
| ARC-Challenge (0-shot) | 68,34 | 68,60 (100,4%) | 68,17 (99,8%) | 68,52 (100,2%) | 66,98 (98,0%) | 68,69 (100,5%) |
| Winogrande (5-shot) | 80,58 | 80,03 (99,3%) | 80,58 (100,0%) | 79,64 (98,8%) | 78,22 (97,1%) | 79,56 (98,7%) |
| KMMLU (5-shot, direct) | 60,03 | 60,07 (100,1%) | 60,15 (100,2%) | 59,41 (99,0%) | 58,14 (96,9%) | 58,99 (98,3%) |
| HAE-RAE (0-shot) | 77,27 | 76,99 (99,6%) | 76,90 (99,5%) | 77,18 (99,9%) | 75,44 (97,6%) | 75,80 (98,1%) |
| **Media** | **72,48** | **72,38 (99,9%)** | **72,51 (100,0%)** | **71,98 (99,3%)** | **70,36 (97,1%)** | **71,64 (98,8%)** |

Perplejidad medida frente al BF16 original en WikiText-2 (ingles) y una muestra de Wikipedia en coreano, en fragmentos de 2048 tokens: las builds de 8 bits (AWQ INT8, FP8) quedan dentro del 0,5% del BF16; las de 4 bits (AWQ INT4, NVFP4) entre un 2,0% y un 6,6% por encima. La concordancia top-1 del siguiente token no se midio para los modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa ~17,2 GB en disco en FP4, por lo que se requiere al menos esa cantidad mas overhead de activaciones y KV cache.
- GPU recomendadas: Blackwell con soporte FP4 nativo para maxima velocidad, es decir, B200/GB200 (sm100), B300 (sm103) y RTX 50xx / RTX PRO 6000 (sm120).
- GPU Turing-Hopper (sm75-sm90): caen a un camino alternativo (la model card se corta en ese punto); el rendimiento FP4 no es nativo.
- Cabe en GPU consumer: si, en RTX 50xx y RTX PRO 6000 (Blackwell), segun la model card.
- Opciones de despliegue: vLLM (probado con 0.32.0; la arquitectura esta en vLLM >= 0.19.0). No se mencionan llama.cpp, Ollama ni TGI para este formato NVFP4.
- Requisitos de software: Python 3.11-3.14, torch 2.13 (build CUDA 13.0, driver NVIDIA con soporte CUDA 13), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; el checkpoint se guardo con 0.19.0 y no debe actualizarse por separado).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/gemma-4-26B-A4B-NVFP4 (esta repo) | 25,8B totales, MoE 8/128+1 | no disponible | NVFP4 W4A4, safetensors compressed-tensors | Apache-2.0 (enlace a Gemma 4) | Hugging Face, 198 descargas |
| google/gemma-4-26B-A4B (BF16 original) | 25,8B totales, MoE 8/128+1 | no disponible | BF16 | Gemma 4 / Apache-2.0 | Hugging Face |
| Variantes AWQ-8bit, AWQ-4bit, NVFP4A16, FP8-dynamic del mismo base | 25,8B totales, MoE 8/128+1 | no disponible | INT8, INT4, FP8, NVFP4A16 | Apache-2.0 / Gemma 4 | Hugging Face (mismo autor) |

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada para una comparativa mas amplia.

## Limitaciones y advertencias

- Es un modelo base preentrenado sin plantilla de chat: no debe usarse como asistente conversacional sin un ajuste o prompt adecuado.
- La cuantizacion PTQ con AWQ introduce degradacion: la media de benchmarks baja al 97,1% del BF16 y GSM8K cae al 94,8%, con perplejidad entre un 2,0% y un 6,6% superior en textos de WikiText-2 y Wikipedia coreana.
- La calibracion tiene sesgo hacia el coreano (256 muestras, con 32 respuestas autogeneradas en modo thinking para la variante -it), lo que puede afectar la fidelidad en otros idiomas.
- La entrada de imagen no se probo en esta build; los benchmarks se ejecutaron con entrada de imagen deshabilitada.
- Requiere hardware Blackwell para aprovechar FP4; en Turing-Hopper se usa un camino alternativo con rendimiento no especificado.
- Dependencias estrictas de version (torch 2.13 CUDA 13, transformers >=5.16.1,<5.20, compressed-tensors 0.17.0) que limitan la portabilidad.
- Licencia: se declara Apache-2.0 pero se enlaza a la licencia Gemma 4 de Google; conviene verificar las condiciones de uso comercial antes de produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- Solo 198 descargas y 1 like en el momento de la consulta, lo que indica baja validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/axteam/gemma-4-26B-A4B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: no se proporciona enlace directo en la informacion disponible
- compressed-tensors: no se proporciona enlace directo en la informacion disponible
