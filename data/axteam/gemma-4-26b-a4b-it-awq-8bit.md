# axteam/gemma-4-26B-A4B-it-AWQ-8bit

## Resumen

`axteam/gemma-4-26B-A4B-it-AWQ-8bit` es una cuantización de 8 bits del modelo multimodal `google/gemma-4-26B-A4B-it` (commit `4d7ae49`), publicada por el usuario axteam. El modelo base es un transformer de tipo Mixture-of-Experts de la familia Gemma 4, con 128 expertos más uno compartido y 8 expertos activos por token, orientado a tareas de imagen-texto-a-texto (image-text-to-text) y conversación. Esta versión concreta aplica cuantización AWQ INT8 con esquema W8A16 y formato `compressed-tensors` `pack-quantized`, pensada específicamente para servir el modelo con vLLM de forma eficiente en memoria.

El problema que resuelve esta build es el coste de servir un MoE multimodal de gran tamaño: los pesos cuantizados ocupan aproximadamente 29,2 GB en disco, frente a los ~52 GB que ocuparía una build BF16 equivalente (dato derivado del tamaño del repo, no publicado explícitamente en la model card). La model card reporta una fidelidad muy alta respecto al original: perplejidad de 1,1296 frente a 1,1284 del BF16 (+0,1%) y una recuperación media del 99,8% en el conjunto de benchmarks medidos.

Es relevante ahora porque el ecosistema de serving de modelos MoE multimodales con cuantización INT8 en vLLM se ha estabilizado (la arquitectura está soportada desde vLLM ≥ 0.19.0), y esta build permite desplegar un modelo de 26B totales con 4B activos en GPUs de gama alta pero no necesariamente de datacenter masivo, siempre que se cumplan los requisitos de driver y versión de librerías que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (8 expertos activos / 128 totales + 1 compartido) |
| Parámetros totales | 8.593.213.462 (según safetensors del repo); la nomenclatura del modelo base indica 26B totales / 4B activos, discrepancia no aclarada en la información disponible |
| Parámetros activos | 4B (según nomenclatura `A4B` del modelo base); no verificado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ INT8 W8A16 (pesos INT8 simétricos, group size 32, activaciones BF16); visión, proyección visual, embeddings, router MoE, normas y MLP compartido se mantienen en BF16 (~7% de los parámetros) |
| Idiomas soportados | no disponible (la calibración fue mayoritariamente en coreano) |
| Licencia | Apache-2.0, con enlace a la licencia Gemma 4 de Google |
| Formato de pesos | safetensors con `compressed-tensors` `pack-quantized`; no cargable por Transformers, requiere vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts de la familia Gemma 4, con 128 expertos más uno compartido y 8 expertos activos por token. Es multimodal: incluye una torre de visión y una proyección visual que, en esta build cuantizada, se mantienen en BF16 junto con los embeddings de tokens (atados con `lm_head`), el router MoE, todas las normas y el MLP compartido, lo que representa aproximadamente el 7% de los parámetros totales de esta build. El pipeline declarado es `image-text-to-text`, y la model card menciona que el `chat_template` de Google corregido en julio de 2026 se conserva byte a byte, incluyendo un modo de razonamiento (thinking mode) del que se generaron 32 respuestas de calibración.

Esta build concreta no ha sido reentrenada: es una cuantización post-entrenamiento (PTQ) con AWQ sobre los pesos BF16 publicados, con un conjunto de calibración de 256 muestras mayoritariamente en coreano. La model card describe la diferencia entre RTN, AWQ y QAT, y aclara explícitamente que este repo no es un checkpoint QAT de Google. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO, más allá de la mención al modo de razonamiento incluido en el `chat_template`.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `conversational`).
- Procesamiento de imagen y texto de entrada (`image-text-to-text`), con torre de visión en BF16.
- Modo de razonamiento (thinking mode) heredado del modelo base, tal como refleja el `chat_template` y la mención a respuestas de calibración en ese modo.
- Capacidades multilingües: no detalladas en la información disponible; la calibración fue mayoritariamente en coreano y los benchmarks incluyen KMMLU y HAE-RAE, lo que sugiere cobertura al menos de inglés y coreano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Servicio de chat multimodal en producción con vLLM: el modelo puede desplegarse con `vllm serve axteam/gemma-4-26B-A4B-it-AWQ-8bit` y atender conversaciones que combinen imagen y texto, aprovechando la cuantización INT8 para reducir la huella de pesos a ~29,2 GB y liberar memoria para la caché KV.
- Asistentes sobre documentos escaneados o capturas: al aceptar entrada imagen-texto, puede extraer y razonar sobre contenido visual en flujos de atención al cliente o back-office, con la torre de visión intacta en BF16 para preservar calidad.
- Razonamiento con modo thinking en tareas de análisis: el `chat_template` conserva el modo de razonamiento del modelo base, útil para pipelines que necesiten trazas de razonamiento antes de la respuesta final.
- Evaluación comparativa de cuantizaciones: sirve como referencia AWQ-8bit frente a FP8-dynamic, NVFP4A16 y NVFP4 en el mismo harness (lm-evaluation-harness sobre vLLM), útil para decidir el formato de despliegue en un clúster existente.
- Despliegue en GPUs NVIDIA Turing (sm75) o superiores sin tensor cores especiales: al ser weight-only INT8, no requiere hardware de nueva generación, lo que permite reutilizar flotas con RTX 20xx/30xx o A-series.
- Servicio con tensor parallelism: cuando los 29,2 GB de pesos no caben en una sola GPU, la model card indica usar `--tensor-parallel-size N`, lo que habilita despliegues multi-GPU en nodos con varias tarjetas.
- Fine-tuning o adaptación posterior: no recomendado directamente sobre esta build cuantizada; la información disponible no documenta soporte para entrenamiento sobre pesos AWQ.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin chat template. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 |
|---|---|---|---|---|---|
| MMLU (5-shot) | 40,23 | 35,77 (88,9%) | 38,72 (96,2%) | 30,44 (75,7%) | 31,39 (78,0%) |
| GSM8K (5-shot, strict) | 66,19 | 67,70 (102,3%) | 67,10 (101,4%) | 50,42 (76,2%) | 60,88 (92,0%) |
| ARC-Challenge (0-shot) | 45,39 | 45,82 (100,9%) | 44,88 (98,9%) | 44,62 (98,3%) | 44,28 (97,6%) |
| Winogrande (5-shot) | 58,48 | 60,22 (103,0%) | 59,91 (102,4%) | 58,64 (100,3%) | 57,77 (98,8%) |
| KMMLU (5-shot, direct) | 36,52 | 34,81 (95,3%) | 35,84 (98,1%) | 33,42 (91,5%) | 34,37 (94,1%) |
| HAE-RAE (0-shot) | 76,17 | 75,62 (99,3%) | 75,99 (99,8%) | 73,60 (96,6%) | 72,87 (95,7%) |
| **Media** | **53,83** | **53,32 (99,1%)** | **53,74 (99,8%)** | **48,53 (90,1%)** | **50,26 (93,4%)** |

Evaluación de fidelidad frente al BF16 original en un conjunto interno mixto inglés/coreano:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1296 | 1,1284 (+0,1%) |
| Acuerdo top-1 siguiente token | 98,5% | 98,7% |

## Requisitos de hardware

- VRAM estimada para inferencia: pesos ~29,2 GB; añadir caché KV (crece con longitud de contexto × peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Turing (sm75) o superior; V100 (sm70) no está soportada. La model card no especifica modelos concretos (A100, H100, RTX 4090) más allá de la arquitectura mínima.
- Cabe en consumer GPU: no en tarjetas de 24 GB con una sola instancia completa; sí en configuraciones multi-GPU o en GPUs de 40-80 GB. No se detalla en la información disponible.
- Opciones de despliegue: vLLM (obligatorio en la práctica; la arquitectura está en vLLM ≥ 0.19.0). Transformers no puede cargarlo (comprobado hasta 5.22.1: sin regla de conversión para checkpoints por experto, los expertos quedan sin inicializar). No se mencionan llama.cpp, Ollama ni TGI.
- Versiones: vLLM 0.32 requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). Esta build se evaluó con vLLM ≥ 0.19.0, no con 0.32.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (AWQ-8bit) | 8,59B en safetensors (nomenclatura base 26B/4B activos) | no disponible | compressed-tensors INT8 W8A16 | Apache-2.0 / Gemma 4 | Media de benchmarks 53,74 (99,8% del BF16) |
| google/gemma-4-26B-A4B-it (BF16) | 26B totales / 4B activos | no disponible | safetensors BF16 | Gemma 4 / Apache-2.0 | Referencia de calidad; ~52 GB de pesos |
| Build FP8-dynamic del mismo base | 26B / 4B activos | no disponible | FP8 | Gemma 4 / Apache-2.0 | Media 53,32 (99,1%); MMLU 88,9% de recuperación |
| Build NVFP4 del mismo base | 26B / 4B activos | no disponible | NVFP4 | Gemma 4 / Apache-2.0 | Media 50,26 (93,4%); requiere hardware con soporte NVFP4 |

No se dispone de información sobre modelos de otras familias comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es cargable con Transformers: los checkpoints por experto no tienen regla de conversión y los expertos quedan sin inicializar; el despliegue debe hacerse con vLLM.
- Requiere versiones muy concretas de librerías (torch 2.13 con CUDA 13.0, transformers ≥5.16.1,<5.20, compressed-tensors 0.17.0); mezclar versiones puede romper la carga.
- No soporta V100 (sm70); el hardware mínimo es Turing (sm75).
- La cuantización es PTQ con AWQ, no QAT: la fidelidad es alta pero no idéntica al BF16 (perplejidad +0,1%, acuerdo top-1 98,5% frente a 98,7%).
- El conjunto de calibración es de 256 muestras mayoritariamente en coreano, lo que puede sesgar la fidelidad de la cuantización hacia ese idioma frente a otros.
- La model card no documenta sesgos del modelo base, riesgo de alucinación ni limitaciones idiomáticas específicas; deben evaluarse por separado antes de producción.
- La licencia se declara Apache-2.0 pero enlaza a la licencia Gemma 4 de Google; conviene revisar los términos de Gemma 4 para uso comercial, ya que pueden imponer restricciones adicionales.
- El número de descargas (69) y likes (1) es bajo, y la build se evaluó solo con vLLM ≥ 0.19.0, no con 0.32.0; la validación en producción es limitada.
- No se dispone de datos de latencia ni throughput, por lo que el dimensionamiento debe hacerse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-26B-A4B-it-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
