# axteam/gemma-4-26B-A4B-FP8-dynamic

## Resumen

`axteam/gemma-4-26B-A4B-FP8-dynamic` es una cuantización a FP8 del modelo `google/gemma-4-26B-A4B`, publicada por el equipo axteam. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con arquitectura Gemma 4, 25.805.936.206 parámetros totales y 8 expertos activos de 128 totales más uno compartido. El modelo base es multimodal (pipeline `image-text-to-text`) y esta versión mantiene la torre de visión en BF16 sin cuantizar. La cuantización está pensada específicamente para servir el modelo con vLLM de forma eficiente en memoria.

El interés de esta ficha radica en que ofrece una alternativa de despliegue de bajo coste para un modelo MoE multimodal de aproximadamente 26B parámetros: el checkpoint ocupa 27,2 GB en disco frente al peso en BF16, y la cuantización W8A8 con escalas dinámicas por token permite reducir el uso de memoria sin calibrar con datos. Según las mediciones del autor con lm-evaluation-harness sobre vLLM, la recuperación media frente al BF16 original es del 99,9% en un conjunto de seis benchmarks.

Es importante señalar que se trata de un modelo base preentrenado, sin plantilla de chat: está pensado para completación de texto, no para conversación. La licencia declarada es Apache-2.0, con enlace a la licencia de Gemma 4 de Google. El checkpoint se guarda en formato compressed-tensors (`FP8_DYNAMIC`) y requiere vLLM para su carga; Transformers no puede cargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (transformer multimodal) |
| Parámetros totales | 25.805.936.206 |
| Parámetros activos | 8 expertos activos de 128 totales + 1 compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 dinámico (W8A8, E4M3, escalas estáticas por canal de salida y dinámicas por token); visión, proyección de visión, embeddings, router MoE y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (enlace a licencia Gemma 4) |
| Formato de pesos | safetensors con compressed-tensors `float-quantized` (scheme `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts de la familia Gemma 4, con 128 expertos enrutados de los cuales se activan 8 por token, más un experto compartido. El checkpoint es multimodal: incluye torre de visión y proyección de visión, y el pipeline declarado es `image-text-to-text`. Esta versión cuantizada mantiene en BF16 la torre de visión, la proyección de visión, los embeddings de tokens (atados con `lm_head`), el router MoE y todas las normas, lo que representa aproximadamente el 5% de los parámetros del build. El resto de pesos se almacena en FP8 E4M3 con escala por canal de salida, y las activaciones se cuantizan dinámicamente por token en tiempo de ejecución.

La cuantización es post-entrenamiento (PTQ), sin reentrenamiento ni datos de calibración: las escalas de pesos son estáticas y sin datos (data-free). El autor distingue explícitamente este enfoque de AWQ y de QAT, y aclara que este repositorio no es un checkpoint QAT de Google. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. El tokenizador, el `processor_config` y el `generation_config` son idénticos byte a byte a los del original, y el `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto y completación: al ser un modelo base sin plantilla de chat, su uso previsto es la completación de texto plano.
- Procesamiento de imagen y texto: pipeline `image-text-to-text`, con torre de visión conservada en BF16.
- Razonamiento y conocimiento general: medido en MMLU (77,25 en la versión FP8) y ARC-Challenge (68,60).
- Razonamiento matemático: medido en GSM8K en modo estricto (71,34).
- Capacidades multilingües parciales: evaluado en KMMLU (coreano, 60,07) y HAE-RAE (coreano, 76,99); el resto de idiomas no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Servicio de completación de texto a gran escala: el modelo puede desplegarse en vLLM con cuantización FP8 para atender peticiones de completación con un coste de memoria de 27,2 GB de pesos, lo que permite usar GPUs de 40-48 GB en lugar de requerir el checkpoint BF16 completo.
- Procesamiento de documentos con imagen y texto: al conservar la torre de visión, puede usarse para tareas de image-text-to-text como descripción de imágenes o extracción de información de capturas y documentos escaneados, siempre mediante prompts de completación.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de FP8 dinámico frente a BF16, AWQ-8bit, NVFP4 y AWQ-4bit en un mismo harness (lm-evaluation-harness sobre vLLM).
- Investigación sobre MoE multimodal: el checkpoint permite estudiar el comportamiento de un MoE de 128 expertos con 8 activos en tareas de visión y lenguaje sin necesidad de infraestructura para BF16.
- Clasificación y extracción de conocimiento en coreano e inglés: los resultados en KMMLU y HAE-RAE indican un rendimiento aprovechable en tareas de conocimiento en coreano, útil para pipelines de análisis documental en ese idioma.
- Despliegue con tensor parallelism: cuando los 27,2 GB de pesos no caben en una sola GPU, el modelo admite `--tensor-parallel-size N` para repartir pesos y caché KV entre varias GPUs.
- Base para ajuste fino posterior: al ser un modelo base preentrenado, puede servir como punto de partida para tareas downstream, aunque la cuantización FP8 limita su uso directo en entrenamiento sin descomprimir.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, modo greedy, completación few-shot sin plantilla de chat. Los porcentajes entre paréntesis son la recuperación frente al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 77,77 | 77,25 (99,3%) | 77,75 (100,0%) | 77,18 (99,2%) | 76,20 (98,0%) | 76,82 (98,8%) |
| GSM8K (5-shot, strict) | 70,89 | 71,34 (100,6%) | 71,49 (100,9%) | 69,98 (98,7%) | 67,17 (94,8%) | 69,98 (98,7%) |
| ARC-Challenge (0-shot) | 68,34 | 68,60 (100,4%) | 68,17 (99,8%) | 68,52 (100,2%) | 66,98 (98,0%) | 68,69 (100,5%) |
| Winogrande (5-shot) | 80,58 | 80,03 (99,3%) | 80,58 (100,0%) | 79,64 (98,8%) | 78,22 (97,1%) | 79,56 (98,7%) |
| KMMLU (5-shot, direct) | 60,03 | 60,07 (100,1%) | 60,15 (100,2%) | 59,41 (99,0%) | 58,14 (96,9%) | 58,99 (98,3%) |
| HAE-RAE (0-shot) | 77,27 | 76,99 (99,6%) | 76,90 (99,5%) | 77,18 (99,9%) | 75,44 (97,6%) | 75,80 (98,1%) |
| **Media** | **72,48** | **72,38 (99,9%)** | **72,51 (100,0%)** | **71,98 (99,3%)** | **70,36 (97,1%)** | **71,64 (98,8%)** |

Además, el autor midió perplejidad frente al BF16 original sobre WikiText-2 (inglés) y una muestra de Wikipedia en coreano, en fragmentos de 2.048 tokens: los builds de 8 bits (AWQ INT8 y FP8) se mantuvieron dentro del 0,5% de BF16, mientras que los de 4 bits (AWQ INT4 y NVFP4) fueron entre un 2,0% y un 6,6% superiores. La concordancia top-1 del siguiente token no se midió para los modelos base.

## Requisitos de hardware

- VRAM estimada: 27,2 GB solo para pesos; hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs compatibles: NVIDIA Turing (sm75, p. ej. T4) o superior. La aritmética FP8 nativa requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automáticamente a FP8 solo de pesos. V100 (sm70) no está soportado.
- GPU consumer: no se indica explícitamente, pero con 27,2 GB de pesos no cabe en GPUs de 24 GB o menos sin tensor parallelism o sin caché KV muy reducida; una RTX 4090 (24 GB) no sería suficiente para el checkpoint completo en una sola unidad.
- Despliegue: vLLM, con la arquitectura disponible en vLLM ≥ 0.19.0. El build se evaluó en esa versión, no en vLLM 0.32.0. vLLM 0.32 requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Transformers sin vLLM: no es cargable por Transformers (comprobado hasta 5.22.1).
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no caben en una sola GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/gemma-4-26B-A4B-FP8-dynamic | 25,8B totales, 8/128 expertos activos | no disponible | FP8 dinámico W8A8 | Apache-2.0 | Hugging Face, vLLM ≥ 0.19.0 |
| google/gemma-4-26B-A4B (BF16) | 25,8B totales, misma arquitectura MoE | no disponible | BF16 | Gemma 4 / Apache-2.0 | Hugging Face |
| Variante AWQ-8bit del mismo base | 25,8B totales | no disponible | AWQ INT8 | no disponible | referenciada en benchmarks del autor |
| Variante NVFP4 del mismo base | 25,8B totales | no disponible | NVFP4 | no disponible | referenciada en benchmarks del autor |

La comparativa se limita a variantes de cuantización del mismo modelo base, ya que la información proporcionada no incluye otros modelos de la misma categoría. En rendimiento medido, FP8-dynamic alcanza una media de 72,38 frente a 72,48 de BF16 y 72,51 de AWQ-8bit; NVFP4 cae a 70,36 y AWQ-4bit a 71,64.

## Limitaciones y advertencias

- Es un modelo base preentrenado sin plantilla de chat: no debe usarse como asistente conversacional sin ajuste o sin un formato de prompt adecuado.
- No es cargable por Transformers; requiere vLLM y la pila de dependencias exacta indicada (torch 2.13, CUDA 13.0, compressed-tensors 0.17.0).
- La cuantización FP8 introduce una degradación pequeña pero medible: 99,9% de recuperación media, con caídas de hasta el 0,7% en MMLU y Winogrande.
- La perplejidad de los builds de 8 bits se mantiene dentro del 0,5% de BF16, pero no se midió la concordancia top-1 del siguiente token en los modelos base.
- La licencia Apache-2.0 se declara junto a un enlace a la licencia de Gemma 4 de Google; conviene revisar las condiciones de uso comercial de Gemma 4 antes de producción.
- Los idiomas soportados no están documentados; solo hay evaluaciones en inglés y coreano.
- No hay información sobre sesgos, riesgo de alucinación ni restricciones adicionales de uso.
- El checkpoint se guardó con compressed-tensors 0.19.0 pero vLLM fija 0.17.0; no actualizar compressed-tensors por separado.
- El modelo se evaluó en vLLM ≥ 0.19.0, no en vLLM 0.32.0, por lo que el soporte en versiones más recientes no está verificado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/axteam/gemma-4-26B-A4B-FP8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
