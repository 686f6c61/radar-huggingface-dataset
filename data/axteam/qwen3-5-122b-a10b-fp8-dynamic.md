# axteam/Qwen3.5-122B-A10B-FP8-dynamic

## Resumen

Qwen3.5-122B-A10B-FP8-dynamic es una cuantizacion post-entrenamiento (PTQ) en FP8 del modelo multimodal Qwen/Qwen3.5-122B-A10B, publicada por el usuario axteam para servir el modelo de forma eficiente con vLLM. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer hibrido que combina atencion lineal y atencion completa con una arquitectura de mezcla de expertos (MoE) de 256 expertos mas un experto compartido, con aproximadamente 10B de parametros activos sobre un total de 125.086.497.008 parametros (segun los safetensors del repositorio). Incluye ademas una torre de vision para entrada image-text-to-text y una cabeza de prediccion multi-token (MTP).

La relevancia de esta publicacion es practica: reduce el peso en disco a unos 129,8 GB manteniendo una fidelidad muy alta respecto al original en BF16. Segun las mediciones del autor, la media de seis benchmarks (MMLU, GSM8K, ARC-Challenge, Winogrande, KMMLU y HAE-RAE) cae solo un 0,3 % respecto al BF16, y la perplejidad en un conjunto interno mixto ingles/coreano aumenta un 0,6 %. La cuantizacion es W8A8 con pesos FP8 E4M3 (escala por canal de salida) y activaciones FP8 dinamicas por token, sin calibracion.

Una advertencia importante: la revision del 2 de noviembre de 2026 corrige un fallo de `config.json` que excluia incorrectamente la torre de vision de la cuantizacion, provocando respuestas erroneas ante entradas de imagen con vLLM 0.32. Quien descargase el repositorio antes del 1 de noviembre de 2026 a las 23:22:56 UTC debe volver a descargar `config.json`. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa), MoE con 256 expertos + experto compartido, multimodal (vision), cabeza MTP |
| Parametros totales | 125.086.497.008 (125,09B) |
| Parametros activos | ~10B (segun la model card: ~10B / 122B total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico W8A8 (pesos E4M3 con escala por canal de salida, activaciones FP8 dinamicas por token); formato compressed-tensors `float-quantized`, esquema `FP8_DYNAMIC`; sin calibracion (data-free) |
| Idiomas soportados | no disponible (las evaluaciones incluyen conjuntos en ingles y coreano: KMMLU, HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 129,8 GB en disco |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que alterna capas de atencion lineal con capas de atencion completa, lo que reduce el coste de atencion en contextos largos. Sobre esa columna vertebral se dispone una mezcla de expertos con 256 expertos mas un experto compartido, de modo que solo se activan aproximadamente 10B de parametros por token sobre los 122B (125B contando vision y otras partes) del total. El modelo es multimodal: incorpora una torre de vision y un proyector para tareas image-text-to-text, y anade una cabeza de prediccion multi-token (MTP), tipicamente empleada para decodificacion especulativa y aceleracion de inferencia. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

Esta publicacion concreta no reentrena nada: es una cuantizacion post-entrenamiento sin calibracion. Los pesos FP8 se generan con escalas estaticas por canal calculadas sin datos, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Se mantienen en BF16 la torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm salvo la `linear_attn.norm` con compuerta, los embeddings de tokens, la LM head, el router MoE (`mlp.gate`) y la compuerta del experto compartido, y las partes no lineales del SSM (`linear_attn.conv1d/dt_bias`). Se conservan en FP32, igual que en el original, `linear_attn.A_log` y la `linear_attn.norm` con compuerta. En total, cerca del 4 % de los parametros queda sin cuantizar para preservar calidad. El tokenizador, el `chat_template` y el `generation_config` son identicos al original; `config.json` es el original mas un bloque `quantization_config`.

## Capacidades

- Generacion de texto conversacional y razonamiento general, con resultados medidos en MMLU (87,89 en variante generativa 5-shot) y ARC-Challenge (63,91).
- Razonamiento matematico y resolucion de problemas aritmeticos: GSM8K 83,93 en modo estricto 5-shot.
- Comprension multimodal image-text-to-text: la torre de vision se mantiene en BF16 y describe correctamente imagenes sinteticas en la prueba del autor.
- Capacidades multilingues: evaluado en KMMLU (coreano, 71,72) y HAE-RAE (coreano, 81,39), ademas de los benchmarks en ingles.
- Decodificacion especulativa mediante la cabeza de prediccion multi-token (MTP) incluida en el modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia a gran escala con vLLM: el formato compressed-tensors FP8_DYNAMIC esta pensado para vLLM (probado con 0.32.0), lo que permite desplegar el modelo con tensor parallelism sobre varias GPU y aprovechar los kernels FP8 en Ada, Hopper y Blackwell.
- Asistentes multimodales de atencion al cliente: la torre de vision en BF16 permite procesar capturas, facturas o imagenes enviadas por el usuario junto con texto en la misma conversacion, manteniendo la calidad de percepcion visual del modelo original.
- Analisis de documentos con componentes visuales: extraccion y resumen de informacion a partir de imagenes y texto combinados, adecuado por la naturaleza image-text-to-text del pipeline.
- Razonamiento matematico asistido en entornos educativos o financieros: el 83,93 en GSM8K estricto respalda el uso en problemas aritmeticos de varios pasos, con una perdida minima frente al BF16.
- Procesamiento de lenguaje natural en coreano e ingles: los resultados en KMMLU (71,72) y HAE-RAE (81,39) lo hacen util para aplicaciones localizadas en esos idiomas, aunque no se documentan otros idiomas.
- Aceleracion de inferencia en produccion con decodificacion especulativa: la cabeza MTP integrada permite reducir la latencia por token en despliegues con vLLM que soporten esta tecnica.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica resultados frente a AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit con el mismo harness, lo que sirve como referencia para decidir el formato de despliegue.

## Benchmarks y rendimiento

Medidos con lm-evaluation-harness sobre vLLM, decodificacion greedy, prompts estilo completion sin chat template. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con puntuaciones obtenidas por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 88,06 | 87,89 (99,8 %) | 87,89 (99,8 %) | 87,91 (99,8 %) | 87,69 (99,6 %) | 87,69 (99,6 %) |
| GSM8K (5-shot, estricto) | 84,46 | 83,93 (99,4 %) | 84,23 (99,7 %) | 84,84 (100,4 %) | 80,52 (95,3 %) | 83,78 (99,2 %) |
| ARC-Challenge (0-shot) | 63,74 | 63,91 (100,3 %) | 63,74 (100,0 %) | 63,40 (99,5 %) | 62,71 (98,4 %) | 62,80 (98,5 %) |
| Winogrande (5-shot) | 73,09 | 73,24 (100,2 %) | 73,56 (100,6 %) | 72,77 (99,6 %) | 73,16 (100,1 %) | 73,01 (99,9 %) |
| KMMLU (5-shot, directo) | 71,72 | 71,72 (100,0 %) | 71,67 (99,9 %) | 71,35 (99,5 %) | 70,80 (98,7 %) | 71,20 (99,3 %) |
| HAE-RAE (0-shot) | 82,31 | 81,39 (98,9 %) | 81,76 (99,3 %) | 81,48 (99,0 %) | 80,20 (97,4 %) | 80,93 (98,3 %) |
| Media | 77,23 | 77,01 (99,7 %) | 77,14 (99,9 %) | 76,96 (99,7 %) | 75,85 (98,2 %) | 76,57 (99,1 %) |

Fidelidad al original BF16 sobre un conjunto interno mixto ingles/coreano de 100 prompts (respuestas greedy del BF16 original, puntuadas con el mismo codigo en cada build; este build medido con vLLM 0.32 el 2 de noviembre de 2026):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,3339 | 1,3258 (+0,6 %) |
| Acuerdo top-1 en el siguiente token | 96,7 % | 98,4 % |

## Requisitos de hardware

- VRAM para pesos: 129,8 GB. Hay que anadir la cache KV (crece con la longitud de contexto por peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPU compatibles: NVIDIA Turing (sm75, p. ej. T4) o superior. La aritmetica FP8 nativa requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automaticamente a FP8 solo de pesos. V100 (sm70) no esta soportado.
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no caben en una sola GPU; con 129,8 GB no cabe en ninguna GPU consumer individual (RTX 4090 tiene 24 GB), por lo que requiere varias GPU o un nodo con GPUs de datacenter.
- GPU de datacenter recomendadas: H100 (80 GB), B200 (probada por el autor), A100 (solo FP8 de pesos por ser Ampere). El autor solo ejecuto la prueba en B200.
- Despliegue: vLLM (arquitectura soportada desde vLLM >= 0.17.0; probado con 0.32.0). Requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con las otras cuantizaciones del mismo modelo base publicadas en la model card (misma arquitectura y parametros; difieren en formato y tamano de pesos):

| Modelo | Parametros | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B BF16 (original) | 125,09B (~10B activos) | no disponible | 77,23 | Apache-2.0 | Hugging Face |
| Este modelo (FP8-dynamic) | 125,09B (~10B activos) | no disponible | 77,01 (99,7 %) | Apache-2.0 | Hugging Face |
| AWQ-8bit | 125,09B (~10B activos) | no disponible | 77,14 (99,9 %) | Apache-2.0 | Hugging Face |
| NVFP4 | 125,09B (~10B activos) | no disponible | 75,85 (98,2 %) | Apache-2.0 | Hugging Face |
| AWQ-4bit | 125,09B (~10B activos) | no disponible | 76,57 (99,1 %) | Apache-2.0 | Hugging Face |

No se dispone de informacion sobre modelos de otros desarrolladores comparables en tamano o categoria.

## Limitaciones y advertencias

- Revision critica: las descargas anteriores al 1 de noviembre de 2026 a las 23:22:56 UTC (revision `4dc4728`) tienen un `config.json` que cuantizaba por error la torre de vision, produciendo respuestas erroneas ante imagenes con vLLM 0.32. Es obligatorio volver a descargar `config.json`.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican los riesgos habituales de un modelo de lenguaje de gran escala.
- Sesgos: no documentados en la informacion disponible.
- Idiomas: la model card no lista idiomas soportados; las evaluaciones solo cubren ingles y coreano, por lo que el rendimiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto: no especificada; la cache KV crece con el contexto y las peticiones concurrentes, lo que afecta al dimensionamiento de memoria.
- Compatibilidad estricta de dependencias: requiere vLLM 0.32.0 con transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0; actualizar compressed-tensors por separado puede romper la carga del checkpoint (guardado con 0.19.0).
- Precision: la cuantizacion FP8 pierde alrededor del 0,3 % de media en benchmarks y un 3,3 % de acuerdo top-1 en el siguiente token respecto al BF16; para tareas de altisima sensibilidad puede preferirse el original.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los terminos del modelo base enlazados en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-122B-A10B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
