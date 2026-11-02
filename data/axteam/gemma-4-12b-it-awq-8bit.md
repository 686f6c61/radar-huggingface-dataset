# axteam/gemma-4-12B-it-AWQ-8bit

## Resumen

`axteam/gemma-4-12B-it-AWQ-8bit` es una cuantizacion de 8 bits del modelo multimodal `google/gemma-4-12B-it`, publicada por el equipo axteam. Se trata de un checkpoint PTQ (post-training quantization) con el metodo AWQ en esquema W8A16 —pesos INT8 simetricos con grupo de tamano 32 y activaciones en BF16—, empaquetado con `compressed-tensors` en formato `pack-quantized` y pensado especificamente para servir el modelo con vLLM. El objetivo es reducir la huella en VRAM del modelo original (13,7 GB en disco) manteniendo una fidelidad casi identica al BF16.

El modelo base es un transformer denso de la familia Gemma 4, con 11.959.730.224 parametros y capacidad image-text-to-text (procesa imagenes y texto de entrada para generar texto). La cuantizacion mantiene en BF16 el embedder de parches de vision, las proyecciones de vision y audio, los token embeddings (atados con `lm_head`) y todas las normalizaciones, aproximadamente el 9 % de los parametros totales, para preservar la calidad multimodal.

Su relevancia practica es doble: por un lado, permite desplegar un modelo multimodal de ~12 B en una sola GPU con menos memoria que el BF16 original; por otro, la model card publica mediciones comparativas frente a BF16, FP8, NVFP4 y AWQ-4bit con el mismo arnes (lm-evaluation-harness sobre vLLM), lo que facilita la decision de que variante cuantizada usar en produccion. La licencia declarada es Apache-2.0, con enlace a la licencia especifica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (modelo unificado sin encoder de vision separado) |
| Parametros totales | 11.959.730.224 (~12 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simetricos, grupo 32, activaciones BF16); formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible en la informacion proporcionada (calibracion con 224 muestras de predominio coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized); compatible con transformers y vLLM |
| Tamano en disco | ~13,7 GB |
| Modalidad | image-text-to-text |
| Modelo base | google/gemma-4-12B-it (commit 707f0a3) |
| Metodo de cuantizacion | PTQ con AWQ (224 muestras de calibracion, sin reentrenamiento) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4. A diferencia de las arquitecturas multimodales clasicas con encoder de vision independiente, esta variante es un modelo "Unified": no tiene encoder de vision separado, de modo que los tokens de imagen y audio pasan directamente por el decodificador. Esto explica que la cuantizacion deje en BF16 el `vision_embedder` (embedder de parches), las proyecciones de vision y audio, los token embeddings y las normas: si se cuantizaran esas piezas se degradaria la calidad de la entrada multimodal.

Sobre el entrenamiento original (numero de tokens, composicion del dataset, si hubo RLHF/DPO) no se aporta informacion en la documentacion disponible; solo se indica que el checkpoint base es `google/gemma-4-12B-it` en el commit `707f0a3`. La innovacion tecnica documentada en este repositorio es la propia cuantizacion: AWQ protege los canales de pesos que multiplican a las activaciones mas grandes mediante escalado por canal, plegado en las capas adyacentes (por ejemplo, LayerNorm hacia q/k/v) antes del redondeo. El tokenizer, el `chat_template` (incluida la correccion de Google de julio de 2026), el `processor_config` y el `generation_config` son identicos byte a byte al original; solo se anade un bloque `quantization_config` al `config.json`. Nota: Google reemplazo `tokenizer.json` el 2026-10-30 (correccion de glitch-token) y este repositorio aun no lo incluye.

## Capacidades

- Generacion de texto conversacional (pipeline `image-text-to-text`, tag `conversational`).
- Comprension de imagenes combinadas con texto: al ser un modelo Unified, los tokens visuales se procesan en el mismo decodificador.
- Procesamiento de audio: la model card menciona proyecciones de audio mantenidas en BF16, lo que implica soporte de entrada de audio en el modelo base.
- Razonamiento y matematicas: medido en GSM8K (5-shot, strict) con 65,05 en esta variante cuantizada.
- Conocimiento general y multilingue: medido en MMLU, ARC-Challenge, Winogrande, KMMLU (coreano) y HAE-RAE (coreano).
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking: la calibracion se hizo sin respuestas de modo thinking (no se generaron para este modelo), por lo que no hay evidencia de su comportamiento en ese modo.
- Capacidades multilingues: no hay lista oficial de idiomas; los benchmarks incluyen evaluaciones en ingles y coreano.

## Casos de uso

- Servicio de chat multimodal en produccion: el checkpoint esta disenado para vLLM y ocupa 13,7 GB de pesos, de modo que con una GPU de 24 GB (por ejemplo, RTX 4090 o L4 con margen limitado) o una A100/H100 se puede servir con cache KV para peticiones concurrentes; la fidelidad medida frente a BF16 (perplejidad +0,2 %) hace que sea una sustitucion directa del original.
- Descripcion y analisis de imagenes en pipelines internos: al aceptar image-text-to-text, se puede usar para generar alt-text, clasificar capturas o extraer informacion de documentos escaneados enviando la imagen junto al prompt de texto.
- Asistente de atencion al cliente con entradas mixtas: conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o fotos de productos; el modelo mantiene el contexto conversacional y procesa la imagen en el mismo decodificador.
- Evaluacion comparativa de variantes cuantizadas: el repositorio publica resultados con lm-evaluation-harness sobre vLLM para BF16, FP8, NVFP4 y AWQ-4bit, lo que permite usar este checkpoint como referencia de calidad al decidir el nivel de cuantizacion en un despliegue propio.
- Razonamiento aritmetico y tareas de conocimiento en ingles y coreano: con GSM8K al 102,6 % de recuperacion frente a BF16 y KMMLU al 100,7 %, es adecuado para asistentes de soporte tecnico o educativos en esos idiomas.
- Despliegue con tensor parallelism en varias GPU: cuando los pesos no caben en una sola GPU, vLLM permite `--tensor-parallel-size N`; util para servir el modelo en clústeres con GPUs mas pequenas (por ejemplo, varias L4 o A10G).
- Prototipado e investigacion: al estar en formato compressed-tensors y ser compatible con transformers ≥5.10.1, se puede cargar en scripts de evaluacion sin montar un servidor vLLM completo.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts estilo completion sin chat template. Los porcentajes entre parentesis son la recuperacion frente al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 65,40 | 65,90 (100,8 %) | 65,80 (100,6 %) | 67,00 (102,4 %) | 62,78 (96,0 %) | 63,42 (97,0 %) |
| GSM8K (5-shot, strict) | 63,38 | 68,99 (108,9 %) | 65,05 (102,6 %) | 64,59 (101,9 %) | 60,42 (95,3 %) | 63,46 (100,1 %) |
| ARC-Challenge (0-shot) | 42,32 | 41,64 (98,4 %) | 39,59 (93,5 %) | 37,63 (88,9 %) | 40,96 (96,8 %) | 40,61 (96,0 %) |
| Winogrande (5-shot) | 61,80 | 61,56 (99,6 %) | 62,75 (101,5 %) | 60,14 (97,3 %) | 58,72 (95,0 %) | 61,17 (99,0 %) |
| KMMLU (5-shot, direct) | 43,28 | 42,59 (98,4 %) | 43,60 (100,7 %) | 39,00 (90,1 %) | 33,66 (77,8 %) | 34,01 (78,6 %) |
| HAE-RAE (0-shot) | 64,62 | 64,62 (100,0 %) | 65,08 (100,7 %) | 62,51 (96,7 %) | 58,75 (90,9 %) | 59,30 (91,8 %) |
| Media | 56,80 | 57,55 (101,3 %) | 56,98 (100,3 %) | 55,15 (97,1 %) | 52,55 (92,5 %) | 53,66 (94,5 %) |

Evaluacion de fidelidad frente al BF16 original en un conjunto interno mixto ingles/coreano:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1508 | 1,1488 (+0,2 %) |
| Acuerdo top-1 en siguiente token | 98,8 % | 99,2 % |

## Requisitos de hardware

- VRAM para pesos: 13,7 GB. Hay que sumar la cache KV (crece con la longitud de contexto por el numero de peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Turing (sm75) o superior. Probado por el autor solo en B200. V100 (sm70) no esta soportado. Para servicio con contexto largo y concurrencia, A100 (40/80 GB) o H100 son las opciones comodas; una RTX 4090 (24 GB) puede alojar los pesos pero deja poco margen para cache KV.
- Cabe en GPU de consumo: si, en RTX 4090 de 24 GB con contexto y concurrencia moderados; en GPUs de 16 GB no cabe sin cuantizacion adicional o offload.
- Multi-GPU: `--tensor-parallel-size N` en vLLM cuando los pesos no caben en una sola GPU.
- Despliegue: vLLM (arquitectura incluida desde vLLM ≥ 0.23.0; probado con vLLM 0.32.0). Requisitos de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Sin vLLM: transformers ≥5.10.1 junto con compressed-tensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparacion con las otras variantes cuantizadas del mismo modelo base, que son las alternativas reales evaluadas en la model card:

| Variante | Metodo | Media de benchmarks | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AWQ-8bit (este repo) | AWQ PTQ, W8A16 | 56,98 (100,3 %) | 1,1508 | Apache-2.0 | HuggingFace, vLLM |
| FP8-dynamic | FP8 | 57,55 (101,3 %) | no disponible | Apache-2.0 (modelo base) | no disponible en esta ficha |
| NVFP4A16 | NVFP4 | 55,15 (97,1 %) | no disponible | Apache-2.0 (modelo base) | no disponible en esta ficha |
| NVFP4 | NVFP4 | 52,55 (92,5 %) | no disponible | Apache-2.0 (modelo base) | no disponible en esta ficha |
| AWQ-4bit | AWQ PTQ, 4 bits | 53,66 (94,5 %) | no disponible | Apache-2.0 (modelo base) | no disponible en esta ficha |

Comparacion con modelos de otros autores: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion PTQ sin reentrenamiento: la fidelidad al BF16 es alta (media 100,3 %, perplejidad +0,2 %) pero no perfecta; ARC-Challenge cae al 93,5 % de recuperacion, el peor resultado de la tabla.
- La calibracion AWQ uso 224 muestras de predominio coreano y sin respuestas de modo thinking; el comportamiento en otros idiomas o en modo thinking puede desviarse mas respecto al BF16 de lo que sugieren las metricas.
- El repositorio no incluye el `tokenizer.json` corregido por Google el 2026-10-30 (commit `43c9d01`, correccion de glitch-token); conviene verificar si afecta al caso de uso.
- No se documentan sesgos conocidos, riesgo de alucinacion ni lista de idiomas soportados en la informacion disponible; al ser una cuantizacion, hereda los del modelo base `google/gemma-4-12B-it`.
- La licencia declarada es Apache-2.0, pero el enlace de licencia apunta a los terminos de Gemma 4 de Google; conviene revisar esos terminos antes de un uso comercial, ya que pueden imponer restricciones adicionales de uso aceptable.
- Requiere vLLM ≥ 0.23.0 (probado con 0.32.0) y una version concreta de compressed-tensors (0.17.0); actualizar esa dependencia por separado puede romper la carga del checkpoint.
- No soportado en V100 (sm70); requiere Turing (sm75) o superior.
- El checkpoint se guardo con compressed-tensors 0.19.0 pero se lee con 0.17.0; es una combinacion validada por el autor, no una garantia general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-12B-it-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: no se proporciona enlace en la informacion disponible
- Paper de AWQ: no se proporciona enlace en la informacion disponible
