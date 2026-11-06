# axteam/gemma-4-26B-A4B-it-NVFP4A16

## Resumen

`axteam/gemma-4-26B-A4B-it-NVFP4A16` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-26B-A4B-it` (commit `4d7ae49`), publicada por el usuario axteam para servir el modelo de forma eficiente con vLLM. Emplea el esquema NVFP4A16 (W4A16: pesos en FP4 E2M1 con grupo de 16, escala FP8 E4M3 más escala global FP32 por tensor, y activaciones en BF16), almacenado en el formato `nvfp4-pack-quantized` de compressed-tensors. El resultado ocupa 17,2 GB en disco frente al checkpoint BF16 original.

El modelo base es un Mixture-of-Experts de la familia Gemma 4 con 25.805.936.206 parámetros totales y 8 expertos activos de 128 totales más uno compartido, con capacidades de imagen-a-texto (pipeline `image-text-to-text`). La cuantización se realizó mediante PTQ con AWQ sobre un conjunto de calibración de 256 muestras, mayoritariamente en coreano e incluyendo respuestas en modo thinking del modelo instruct. Se mantienen en BF16 el torre de visión, la proyección de visión, los embeddings (atados con lm_head), el router MoE, todas las normas y el MLP compartido, lo que representa aproximadamente el 7% de los parámetros.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un MoE multimodal de ~26B parámetros con solo 17,2 GB de pesos, lo que reduce los requisitos de VRAM frente al BF16; por otro, la propia model card documenta una degradación medible y notable de la calidad (90,1% de recuperación media frente al original en su batería de benchmarks), lo que convierte a este checkpoint en una opción a considerar solo cuando la memoria es el factor limitante y no la fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (8 activos / 128 totales + 1 compartido) con torre de visión |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 8 expertos de 128 + 1 compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible en la informacion proporcionada (calibración mayoritariamente en coreano e inglés) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors), 17,2 GB en disco |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 128 expertos en total, de los cuales 8 se activan por token, más un experto compartido. Incluye además una torre de visión y una proyección multimodal que lo habilitan para tareas de imagen-a-texto. El checkpoint aquí descrito no es un modelo entrenado desde cero, sino una cuantización post-entrenamiento (PTQ) del checkpoint BF16 publicado por Google; no hay reentrenamiento ni ajuste fino involucrado.

La cuantización se realizó con AWQ (activation-aware weight quantization) sobre 256 muestras de calibración, mayoritariamente en coreano e incluyendo respuestas en modo thinking del modelo instruct. AWQ identifica los canales de peso que multiplican las activaciones de mayor magnitud y los protege mediante escalado por canal, plegado en capas adyacentes (por ejemplo, LayerNorm hacia q/k/v) antes del redondeo. El tokenizador, `chat_template`, `processor_config` y `generation_config` son idénticos byte a byte al original, incluida la corrección del `chat_template` de Google de julio de 2026; `config.json` es el original más un bloque `quantization_config`. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto conversacional e instruccional, al ser un checkpoint `-it` del modelo base.
- Procesamiento de imagen y texto de entrada con salida de texto (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y tareas multimodales.
- Razonamiento en modo thinking: la calibración incluye respuestas de este modo, lo que indica que el modelo base lo soporta.
- Capacidades multilingües: no detalladas en la información disponible; la calibración sugiere cobertura al menos de coreano e inglés.
- Tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Inferencia eficiente en vLLM con pesos FP4 y activaciones BF16, sin necesidad de tensor cores FP4 (compatible con NVIDIA Turing sm75 o superior).

## Casos de uso

- Servicio de un MoE multimodal de ~26B parámetros en una sola GPU: con 17,2 GB de pesos, el checkpoint cabe en GPUs de 24 GB (por ejemplo, RTX 4090 o L4) dejando margen para caché KV y activaciones, algo imposible con el BF16 original.
- Despliegue de alto rendimiento con vLLM: el formato compressed-tensors `nvfp4-pack-quantized` está soportado nativamente por vLLM ≥ 0.19.0 (probado con 0.32.0), lo que permite servir el modelo con batching continuo y tensor parallelism cuando los pesos no caben en una GPU.
- Procesamiento de documentos con imagen: al aceptar entradas de imagen y texto, puede emplearse para extracción de información de capturas, formularios o gráficos en pipelines de digitalización.
- Asistentes conversacionales con razonamiento visible: el modo thinking del modelo base permite generar cadenas de razonamiento antes de la respuesta final, útil en atención al cliente técnica o soporte interno.
- Prototipado e investigación en entornos con VRAM limitada: permite evaluar el comportamiento de un MoE multimodal grande antes de invertir en hardware para el BF16 o en un checkpoint QAT de Google.
- Comparación de esquemas de cuantización: al publicar la model card métricas de fidelidad frente al BF16 y frente a FP8-dynamic, AWQ-8bit y NVFP4, sirve como referencia para decidir el esquema de cuantización en producción.
- Evaluación de calidad en coreano: la calibración y los benchmarks incluyen KMMLU y HAE-RAE, por lo que es útil para experimentos en ese idioma, aunque con la degradación documentada.

## Benchmarks y rendimiento

Medidos con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin chat template. Los porcentajes entre paréntesis indican recuperación frente al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 |
|---|---|---|---|---|---|
| MMLU (5-shot) | 40,23 | 35,77 (88,9%) | 38,72 (96,2%) | 30,44 (75,7%) | 31,39 (78,0%) |
| GSM8K (5-shot, strict) | 66,19 | 67,70 (102,3%) | 67,10 (101,4%) | 50,42 (76,2%) | 60,88 (92,0%) |
| ARC-Challenge (0-shot) | 45,39 | 45,82 (100,9%) | 44,88 (98,9%) | 44,62 (98,3%) | 44,28 (97,6%) |
| Winogrande (5-shot) | 58,48 | 60,22 (103,0%) | 59,91 (102,4%) | 58,64 (100,3%) | 57,77 (98,8%) |
| KMMLU (5-shot, direct) | 36,52 | 34,81 (95,3%) | 35,84 (98,1%) | 33,42 (91,5%) | 34,37 (94,1%) |
| HAE-RAE (0-shot) | 76,17 | 75,62 (99,3%) | 75,99 (99,8%) | 73,60 (96,6%) | 72,87 (95,7%) |
| **Media** | **53,83** | **53,32 (99,1%)** | **53,74 (99,8%)** | **48,53 (90,1%)** | **50,26 (93,4%)** |

Evaluación de fidelidad frente al original BF16 sobre un conjunto interno mixto inglés/coreano (vLLM 0.32, 2026-11-01):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2101 | 1,1284 (+7,2%) |
| Acuerdo top-1 en siguiente token | 93,2% | 98,7% |

## Requisitos de hardware

- Pesos: 17,2 GB. Hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU: NVIDIA Turing (sm75) o superior. No requiere tensor cores FP4 al ser weight-only. V100 (sm70) no está soportado. La propia model card indica que solo se probó en B200.
- Cabe en GPUs de consumo con 24 GB (RTX 4090, RTX 3090) para contextos moderados; en 16 GB no es viable sin reducir contexto o usar tensor parallelism.
- Para no caber en una sola GPU, usar `--tensor-parallel-size N` en vLLM.
- Despliegue: exclusivamente vLLM. La arquitectura está en vLLM ≥ 0.19.0 y se probó con 0.32.0, que requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Transformers sin vLLM no puede cargar el checkpoint (comprobado hasta 5.22.1: no hay regla de conversión para checkpoints por experto y los expertos quedan sin inicializar).
- No requiere `trust_remote_code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (media benchmarks de la card) | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| NVFP4A16 (este repo) | 25,8B totales (MoE) | no disponible | 48,53 (90,1% del BF16) | Apache-2.0 | compressed-tensors, solo vLLM |
| NVFP4 (referencia en la card) | 25,8B totales (MoE) | no disponible | 50,26 (93,4% del BF16) | Apache-2.0 | compressed-tensors, vLLM |
| AWQ-8bit (referencia en la card) | 25,8B totales (MoE) | no disponible | 53,74 (99,8% del BF16) | Apache-2.0 | compressed-tensors, vLLM |
| FP8-dynamic (referencia en la card) | 25,8B totales (MoE) | no disponible | 53,32 (99,1% del BF16) | Apache-2.0 | compressed-tensors, vLLM |
| BF16 original (`google/gemma-4-26B-A4B-it`) | 25,8B totales (MoE) | no disponible | 53,83 (referencia) | Gemma 4 / Apache-2.0 | safetensors, transformers/vLLM |

## Limitaciones y advertencias

- Degradación de calidad documentada: recuperación media del 90,1% frente al BF16, con caídas severas en MMLU (75,7%) y GSM8K (76,2%). La propia model card recomienda un build de 8 bits si la calidad es prioritaria.
- Perplejidad un 7,2% superior al original y acuerdo top-1 del 93,2% frente al 98,7% del BF16, medido en un conjunto interno mixto inglés/coreano.
- Solo cargable con vLLM; Transformers no puede inicializar los expertos del checkpoint.
- Dependencias muy específicas: vLLM 0.32.0, torch 2.13 con CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 fijado. Actualizar compressed-tensors por separado puede romper la carga.
- No soportado en V100 (sm70); requiere Turing o superior.
- Calibración sesgada hacia coreano: el rendimiento en castellano u otros idiomas no está medido y podría diferir del original.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de sesgo en esta cuantización.
- Licencia Apache-2.0 con enlace a la licencia Gemma 4 de Google: conviene revisar los términos de uso comercial de Gemma antes de desplegar en producción.
- Modelo con pocas descargas (120) y 2 likes en el momento de la consulta: no es un checkpoint oficial de Google y no ha pasado por el mismo proceso de validación que los QAT oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/axteam/gemma-4-26B-A4B-it-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
