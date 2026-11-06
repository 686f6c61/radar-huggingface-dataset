# axteam/gemma-4-31B-NVFP4

## Resumen

`axteam/gemma-4-31B-NVFP4` es una cuantización de 4 bits en formato NVFP4 (W4A4, FP4 E2M1) del modelo multimodal `google/gemma-4-31B`, producida por el usuario axteam para servir el modelo de forma eficiente con vLLM. El modelo base es un transformer denso de la familia Gemma 4 de Google, con capacidad image-text-to-text, y esta cuantización conserva en BF16 la torre de visión, la proyección visual, los embeddings y todas las normalizaciones (aproximadamente el 6% de los parámetros), mientras que el resto de pesos y activaciones se almacenan en FP4.

El objetivo es reducir el espacio en disco y la memoria necesaria para inferencia (el checkpoint ocupa unos 20,4 GB) manteniendo una fidelidad cercana al original en BF16. Según las mediciones del autor, la media de benchmarks cae un 2,4% respecto al BF16 (76,79 frente a 78,71), un compromiso razonable para despliegues en producción donde la VRAM es el cuello de botella.

Es relevante ahora porque el formato NVFP4 está optimizado para la generación Blackwell de NVIDIA (B200/GB200, B300, RTX 50xx), donde se obtiene velocidad completa en W4A4; en arquitecturas anteriores (Turing a Hopper) el modelo funciona en modo weight-only FP4, más lento. La licencia declarada es Apache-2.0, con enlace a la licencia específica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), multimodal image-text-to-text |
| Parametros totales | 18.460.143.972 (según safetensors del repo cuantizado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor); vision tower, proyección visual, embeddings y norms en BF16 |
| Idiomas soportados | No disponible en la información proporcionada (la calibración fue mayoritariamente en coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B`, un transformer denso de la familia Gemma 4 con pipeline image-text-to-text. Esta release es una cuantización post-entrenamiento (PTQ) de tipo AWQ: se usaron 256 muestras de calibración (mayoritariamente en coreano, con 32 respuestas autogeneradas en modo thinking para la variante -it) para identificar los canales de peso que multiplican las activaciones más grandes y protegerlos mediante escalado por canal antes del redondeo. No hay reentrenamiento ni gradientes; el autor distingue explícitamente esta build de los checkpoints QAT que publica Google.

La cuantización aplica W4A4: pesos en FP4 (E2M1) agrupados de 16 en 16, con escala FP8 E4M3 por grupo y una escala global FP32 por tensor, y activaciones también en FP4. Se mantienen en BF16 la torre de visión, la proyección visual, los token embeddings (atados con lm_head) y todas las normalizaciones, lo que representa alrededor del 6% de los parámetros de esta build. El tokenizer, `processor_config` y `generation_config` son idénticos byte a byte al original. Es un modelo base preentrenado sin plantilla de chat: debe usarse con completion de texto plano, no en formato conversacional. El `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto y completion de texto plano (modelo base, sin chat template).
- Procesamiento multimodal image-text-to-text: entrada conjunta de imágenes y texto.
- Razonamiento y matemáticas (evaluado en GSM8K, ARC-Challenge y MMLU).
- Conocimiento multilingüe, con evaluaciones específicas en coreano (KMMLU, HAE-RAE).
- Capacidad de "thinking mode" referenciada en la calibración de la variante -it del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el checkpoint de 20,4 GB cabe en una GPU Blackwell de 80 GB con margen amplio para caché KV y peticiones concurrentes, lo que permite desplegar un modelo image-text-to-text con un solo tensor-parallel-size 1.
- Descripción y análisis de imágenes a gran escala: al conservar la torre de visión en BF16, la calidad de la codificación visual no se degrada por la cuantización, lo que lo hace adecuado para pipelines de etiquetado, moderación de contenido visual o extracción de información de documentos escaneados.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir la pérdida de fidelidad de NVFP4 frente a FP8 o AWQ-8bit en tareas de conocimiento (MMLU, ARC) y matemáticas (GSM8K) antes de adoptar 4 bits en producción.
- Razonamiento y resolución de problemas matemáticos en lote: con un 97,1% de recuperación en GSM8K respecto al BF16, es viable para generación de soluciones paso a paso en entornos de evaluación automática donde el throughput importa más que la precisión absoluta.
- Procesamiento de texto en coreano: las evaluaciones en KMMLU y HAE-RAE (96,8% y 97,6% de recuperación) lo respaldan para tareas de comprensión y clasificación en ese idioma, aunque la calibración sesgada a coreano debe tenerse en cuenta.
- Investigación sobre formatos FP4 en hardware Blackwell: útil para estudiar el comportamiento de kernels W4A4 en sm100/sm103/sm120 y comparar latencia y precisión frente a despliegues en FP8.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, greedy, sin chat template. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 84,59 | 84,71 (100,1%) | 84,52 (99,9%) | 83,70 (98,9%) | 83,09 (98,2%) | 84,02 (99,3%) |
| GSM8K (5-shot, strict) | 84,46 | 83,09 (98,4%) | 84,23 (99,7%) | 83,78 (99,2%) | 82,03 (97,1%) | 84,15 (99,6%) |
| ARC-Challenge (0-shot) | 69,62 | 68,94 (99,0%) | 69,11 (99,3%) | 68,43 (98,3%) | 67,49 (96,9%) | 69,11 (99,3%) |
| Winogrande (5-shot) | 83,90 | 84,29 (100,5%) | 84,29 (100,5%) | 84,45 (100,7%) | 82,64 (98,5%) | 83,58 (99,6%) |
| KMMLU (5-shot, direct) | 67,35 | 67,22 (99,8%) | 67,39 (100,1%) | 66,41 (98,6%) | 65,22 (96,8%) | 67,33 (100,0%) |
| HAE-RAE (0-shot) | 82,31 | 82,03 (99,7%) | 82,03 (99,7%) | 81,94 (99,6%) | 80,29 (97,6%) | 81,85 (99,4%) |
| Media | 78,71 | 78,38 (99,6%) | 78,60 (99,9%) | 78,12 (99,3%) | 76,79 (97,6%) | 78,34 (99,5%) |

Perplejidad medida frente al BF16 original sobre WikiText-2 (inglés) y una muestra de Wikipedia en coreano, en fragmentos de 2.048 tokens: las builds de 8 bits (AWQ INT8, FP8) quedaron dentro del 0,5% del BF16; las de 4 bits (AWQ INT4, NVFP4) entre un 2,0% y un 6,6% por encima (rango entre ambos modelos base y ambos formatos de 4 bits). No se midió la coincidencia top-1 de siguiente token en los modelos base.

## Requisitos de hardware

- VRAM estimada: pesos de 20,4 GB; hay que añadir caché KV (crece con longitud de contexto y peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPU recomendadas: B200/GB200 (sm100), B300 (sm103) y RTX 50xx / RTX PRO 6000 (sm120) para velocidad FP4 completa W4A4. Turing a Hopper (sm75–90) degradan a FP4 weight-only, más lento, con aviso de vLLM. V100 (sm70) no está soportado.
- Cabe en GPU consumer: sí, en RTX 50xx con suficiente VRAM (los pesos de 20,4 GB más caché KV y overhead exceden los 24 GB de las RTX 5090 en configuraciones de contexto largo, por lo que conviene ajustar la longitud de contexto o usar tensor parallelism).
- Opciones de despliegue: vLLM (arquitectura incluida desde vLLM ≥ 0.19.0; probado con vLLM 0.32.0), que requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0. Alternativa sin vLLM: transformers ≥5.5.0 (5.5.2+ recomendado, no probado aquí para el 31B). No se necesita `trust_remote_code`.
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Latencia y throughput: no disponibles en la información proporcionada (solo se ejecutó en B200 según el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmarks | Licencia | Formato |
|---|---|---|---|---|---|
| axteam/gemma-4-31B-NVFP4 | 18,46 B | No disponible | 76,79 | Apache-2.0 | NVFP4 W4A4, compressed-tensors |
| gemma-4-31B AWQ-4bit (misma comparativa) | No disponible | No disponible | 78,34 | Apache-2.0 | AWQ INT4 |
| gemma-4-31B AWQ-8bit (misma comparativa) | No disponible | No disponible | 78,60 | Apache-2.0 | AWQ INT8 |
| gemma-4-31B FP8-dynamic (misma comparativa) | No disponible | No disponible | 78,38 | Apache-2.0 | FP8 |

La comparativa se limita a las builds del mismo modelo base incluidas en la evaluación del autor; no se dispone de datos de modelos alternativos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base preentrenado sin plantilla de chat: no debe usarse como asistente conversacional sin un ajuste posterior o un prompt de completion adecuado.
- Pérdida de fidelidad medible: la media de benchmarks cae un 2,4% respecto al BF16 y la perplejidad sube entre un 2,0% y un 6,6% en las builds de 4 bits, con el mayor deterioro en GSM8K (97,1% de recuperación) y KMMLU (96,8%).
- La calibración AWQ se hizo con 256 muestras mayoritariamente en coreano, lo que puede introducir un sesgo de calibración hacia ese idioma; no se detallan los idiomas oficialmente soportados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado métricas específicas de factualidad para esta build.
- La licencia se declara Apache-2.0 pero enlaza a la licencia Gemma 4 de Google, que puede imponer condiciones adicionales de uso comercial; conviene revisar el texto enlazado antes de un despliegue en producción.
- El rendimiento completo W4A4 depende de hardware Blackwell; en GPUs Turing–Hopper el modelo funciona en modo weight-only FP4 con menor velocidad, y en V100 no está soportado.
- El entorno de ejecución está fuertemente fijado (torch 2.13 con CUDA 13.0, transformers <5.20, compressed-tensors 0.17.0); actualizar estas dependencias por separado puede romper la carga del checkpoint.
- Solo se probó en vLLM 0.32.0 sobre B200 según el autor; el comportamiento en otras GPU o versiones no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-31B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: no disponible enlace explícito en la información proporcionada
- compressed-tensors: no disponible enlace explícito en la información proporcionada
