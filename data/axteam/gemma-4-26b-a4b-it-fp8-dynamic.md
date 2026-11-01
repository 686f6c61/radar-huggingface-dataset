# axteam/gemma-4-26B-A4B-it-FP8-dynamic

## Resumen

`axteam/gemma-4-26B-A4B-it-FP8-dynamic` es una cuantización de 8 bits en FP8 dinámico del modelo `google/gemma-4-26B-A4B-it`, publicada por el usuario axteam. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) de la familia Gemma 4, con 25.805.936.206 parámetros totales (25,8 mil millones) y una arquitectura de 8 expertos activos de 128 totales más un experto compartido. La cuantización tiene como objetivo el despliegue eficiente en vLLM y reduce el peso en disco a aproximadamente 27,2 GB.

El interés de esta ficha es doble: por un lado, permite evaluar el modelo Gemma 4 26B-A4B en su variante instructiva y multimodal (pipeline `image-text-to-text`); por otro, documenta con detalle el proceso de cuantización PTQ (post-training quantization) y su impacto medido sobre el rendimiento respecto al original en BF16. Es relevante para equipos que necesitan servir un modelo multimodal de ~26B parámetros con vLLM en GPUs con soporte FP8, manteniendo una fidelidad alta respecto al original.

La licencia declarada es Apache-2.0, con enlace a la licencia específica de Gemma 4 de Google. El repositorio fue creado el 10 de octubre de 2026 y actualizado el 1 de noviembre de 2026, con 116 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), Gemma 4; 8 expertos activos de 128 totales + 1 compartido |
| Parametros totales | 25.805.936.206 (25,8B) |
| Parametros activos | 8 expertos activos de 128 + 1 compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (W8A8, E4M3, escala estática por canal de salida y escala dinámica por token en activaciones); pesos en compressed-tensors `float-quantized` (esquema `FP8_DYNAMIC`); capas en BF16: torre de visión, proyección de visión, embeddings de tokens (atados con lm_head), router MoE y todas las normas (~5% de los parámetros) |
| Idiomas soportados | no disponible en la información proporcionada (la evaluación interna usa un conjunto mixto inglés/coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, `FP8_DYNAMIC`) |
| Modelo base | google/gemma-4-26B-A4B-it (commit `4d7ae49`) |
| Tamaño en disco | ~27,2 GB |
| Runtime recomendado | vLLM ≥ 0.19.0 (arquitectura soportada); no cargable por Transformers (probado hasta 5.22.1) |
| GPUs soportadas | NVIDIA Turing (sm75, p. ej. T4) o superior; FP8 nativo en Ada/Hopper/Blackwell (sm89+); en Turing y Ampere vLLM pasa automáticamente a FP8 weight-only; V100 (sm70) no soportada |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts de la familia Gemma 4, con 128 expertos enrutados más un experto compartido y 8 expertos activos por token. La variante publicada aquí no entrena el modelo: aplica una cuantización post-entrenamiento (PTQ) sin recalibración ni reentrenamiento sobre los pesos BF16 liberados por Google. El esquema es W8A8 con pesos FP8 E4M3 y escala estática por canal de salida, y activaciones FP8 dinámicas por token. El 5% de los parámetros se mantiene en BF16 para preservar la calidad: torre de visión, proyección de visión, embeddings de tokens (atados con lm_head), router MoE y todas las normas.

La model card describe con detalle la diferencia entre métodos de cuantización (RTN, AWQ y QAT) y aclara que este build es FP8 dinámico, una PTQ sin datos de calibración. No se especifican en la información proporcionada los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), ni innovaciones técnicas del entrenamiento original más allá de la propia arquitectura MoE. El tokenizador, la `chat_template`, el `processor_config` y el `generation_config` son idénticos byte a byte a los del original, incluida la plantilla de chat corregida por Google en julio de 2026.

## Capacidades

- Generación de texto conversacional en modo instructivo (`-it`), con plantilla de chat compatible con el original.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`), gracias a la torre de visión conservada en BF16.
- Razonamiento y respuesta multi-turno, al ser una variante instructiva del modelo base.
- Capacidades multilingües: no se detallan en la información disponible; la evaluación interna emplea un conjunto mixto inglés/coreano, lo que sugiere cobertura al menos de esos idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de un modelo multimodal de ~26B parámetros en producción con vLLM: el checkpoint está empaquetado en compressed-tensors y pensado para vLLM ≥ 0.19.0, lo que permite desplegarlo con tensor parallelism cuando los 27,2 GB de pesos no caben en una sola GPU.
- Descripción y análisis de imágenes en flujos de trabajo por lotes: la torre de visión se mantiene en BF16, por lo que tareas de image-to-text (etiquetado, extracción de información visual, respuesta a preguntas sobre imágenes) conservan la fidelidad del modelo original.
- Asistente conversacional multi-turno: la plantilla de chat corregida de julio de 2026 y el formato instructivo permiten integrarlo en interfaces de chat con historial de conversación.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica métricas de fidelidad (perplejidad, acuerdo top-1, benchmarks) frente a BF16, AWQ-8bit, NVFP4A16 y NVFP4, lo que lo convierte en una referencia útil para decidir el esquema de cuantización en un pipeline de despliegue.
- Despliegue en GPUs Ada/Hopper/Blackwell con FP8 nativo: en sm89+ el modelo ejecuta matemática FP8 completa (W8A8), lo que reduce el uso de memoria y aprovecha los kernels FP8 de vLLM.
- Despliegue en GPUs Turing o Ampere (p. ej. T4 o A100): vLLM cambia automáticamente a FP8 weight-only, lo que permite servir el modelo en hardware sin soporte FP8 nativo, a costa de no aprovechar la aceleración de activaciones FP8.
- Investigación sobre fidelidad de cuantización: los datos medidos (perplejidad 1,1531 frente a 1,1284 del BF16, +2,2%; acuerdo top-1 del 96,3% frente al 98,7%) permiten estudiar el impacto de FP8 dinámico en modelos MoE multimodales.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 |
|---|---|---|---|---|---|
| MMLU (5-shot) | 40,23 | 35,77 (88,9%) | 38,72 (96,2%) | 30,44 (75,7%) | 31,39 (78,0%) |
| GSM8K (5-shot, strict) | 66,19 | 67,70 (102,3%) | 67,10 (101,4%) | 50,42 (76,2%) | 60,88 (92,0%) |
| ARC-Challenge (0-shot) | 45,39 | 45,82 (100,9%) | 44,88 (98,9%) | 44,62 (98,3%) | 44,28 (97,6%) |
| Winogrande (5-shot) | 58,48 | 60,22 (103,0%) | 59,91 (102,4%) | 58,64 (100,3%) | 57,77 (98,8%) |
| KMMLU (5-shot, direct) | 36,52 | 34,81 (95,3%) | 35,84 (98,1%) | 33,42 (91,5%) | 34,37 (94,1%) |
| HAE-RAE (0-shot) | 76,17 | 75,62 (99,3%) | 75,99 (99,8%) | 73,60 (96,6%) | 72,87 (95,7%) |
| **Media** | **53,83** | **53,32 (99,1%)** | **53,74 (99,8%)** | **48,53 (90,1%)** | **50,26 (93,4%)** |

Evaluación de fidelidad frente al BF16 original sobre un conjunto interno mixto inglés/coreano:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1531 | 1,1284 (+2,2%) |
| Acuerdo top-1 en siguiente token | 96,3% | 98,7% |

## Requisitos de hardware

- VRAM estimada para inferencia: pesos de 27,2 GB; hay que añadir KV cache (crece con la longitud de contexto y el número de peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Ada, Hopper o Blackwell (sm89+) para FP8 nativo W8A8; Turing (sm75, p. ej. T4) y Ampere funcionan en modo FP8 weight-only; V100 (sm70) no está soportada.
- Cabe en GPU consumer: no disponible la lista concreta; por tamaño de pesos (27,2 GB) no cabe en GPUs de 16 GB o menos sin tensor parallelism ni offload.
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Opciones de despliegue: vLLM ≥ 0.19.0 (runtime recomendado y único soportado); no cargable por Transformers (probado hasta 5.22.1, sin regla de conversión para checkpoints por experto).
- Dependencias de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/gemma-4-26B-A4B-it-FP8-dynamic (este) | 25,8B totales (MoE 8/128 + 1 compartido) | no disponible | FP8 dinámico W8A8 | Apache-2.0 | HuggingFace, vLLM |
| google/gemma-4-26B-A4B-it (BF16) | 25,8B totales | no disponible | BF16 | Apache-2.0 / Gemma 4 | HuggingFace, modelo base |
| Variante AWQ-8bit del mismo modelo base | 25,8B totales | no disponible | AWQ 8 bits | no disponible | referenciada en benchmarks |
| Variante NVFP4A16 del mismo modelo base | 25,8B totales | no disponible | NVFP4A16 | no disponible | referenciada en benchmarks |
| Variante NVFP4 del mismo modelo base | 25,8B totales | no disponible | NVFP4 | no disponible | referenciada en benchmarks |

No se dispone de datos de modelos comparables de otros desarrolladores (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 dinámica introduce una pérdida medible de fidelidad: perplejidad +2,2% y acuerdo top-1 del 96,3% frente al 98,7% del BF16; en MMLU la recuperación es del 88,9%, la más baja de los benchmarks publicados.
- No es cargable por Transformers (probado hasta 5.22.1): el uso está restringido a vLLM, lo que limita la portabilidad a otros stacks.
- La arquitectura requiere vLLM ≥ 0.19.0; el build se evaluó con esa versión y no se ha probado con vLLM 0.32.0 (otros builds del mismo modelo sí).
- La licencia Apache-2.0 remite a la licencia Gemma 4 de Google; conviene revisar las condiciones de uso comercial de Gemma 4 antes de desplegar en producción.
- No se detallan los idiomas soportados ni sesgos conocidos en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos y debe evaluarse en el dominio de aplicación.
- La evaluación de fidelidad se realizó sobre un conjunto interno mixto inglés/coreano, por lo que los resultados pueden no extrapolarse a otros idiomas.
- Los pesos en BF16 de capas críticas (visión, embeddings, router, normas) representan ~5% de los parámetros; el resto opera en FP8, lo que puede afectar a tareas sensibles a la precisión numérica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-26B-A4B-it-FP8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: no se proporciona enlace directo en la información disponible
- compressed-tensors: no se proporciona enlace directo en la información disponible
