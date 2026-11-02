# axteam/gemma-4-E2B-it-NVFP4

## Resumen

`axteam/gemma-4-E2B-it-NVFP4` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-E2B-it`, publicada por el usuario axteam y orientada especificamente al servicio de inferencia con vLLM. Emplea el esquema NVFP4 (W4A4, FP4 E2M1) en formato `compressed-tensors` `nvfp4-pack-quantized`, con pesos y activaciones en 4 bits y escalas FP8 por grupo de 16. El objetivo es reducir el espacio en disco y los requisitos de memoria del modelo original para despliegues de alto rendimiento en GPUs con soporte de FP4.

El modelo base es un Gemma 4 de arquitectura densa con capacidades de imagen-texto-a-texto (pipeline `image-text-to-text`), lo que implica que integra torre de visión y, segun la model card, tambien torre de audio. Los pesos cuantizados suman 5.104.297.539 parametros segun safetensors, aunque aproximadamente el 64% de ellos se mantienen en BF16 (torres de visión y audio, proyecciones, embeddings y normas). El repositorio ocupa 15,2 GB y el autor indica un tamano en disco de aproximadamente 7,6 GB para los pesos cuantizados.

La relevancia actual de esta ficha radica en que documenta una cuantización PTQ de baja fidelidad: la recuperacion media frente al BF16 original es del 89,1%, con caidas notables en GSM8K (73,9%). Es util para escenarios donde prima el ahorro de memoria y el throughput sobre la calidad, pero no es recomendable como sustituto del modelo original cuando la precision importa. La licencia declarada es Apache-2.0, con enlace a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 · Dense (transformer multimodal con torre de visión y audio) |
| Parametros totales | 5.104.297.539 (segun safetensors); ~64% mantenidos en BF16 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1), pesos por grupo de 16 con escala FP8 E4M3 y escala global FP32 por tensor; activaciones FP4 |
| Idiomas soportados | no disponible (calibracion con 128 muestras mayoritariamente en coreano; evaluacion interna mixta ingles/coreano) |
| Licencia | Apache-2.0 (enlace a licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors, `compressed-tensors` `nvfp4-pack-quantized`; compatible con transformers y vLLM |
| Tamano del repositorio | 15,2 GB |
| Tamano en disco (pesos) | ~7,6 GB |
| Modelo base | google/gemma-4-E2B-it |
| Metodo de cuantizacion | PTQ con AWQ (128 muestras de calibracion, sin gradiente) |
| Fecha de creacion | 2026-10-11 |
| Ultima actualizacion | 2026-11-01 (reconstruccion con AWQ aplicado correctamente) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 denso de Google, disenado para tareas de imagen-texto-a-texto. La cuantizacion no modifica la arquitectura: se aplica PTQ sobre los pesos BF16 publicados, sin reentrenamiento. El esquema NVFP4 cuantiza pesos y activaciones a FP4 (E2M1), con pesos agrupados en bloques de 16 y escalas FP8 E4M3 mas una escala global FP32 por tensor. Se mantienen en BF16 la torre de visión, la torre de audio, las proyecciones visión/audio, los embeddings de tokens (atados con `lm_head`), la tabla de embeddings por capa (`embed_tokens_per_layer`) y todas las normas, lo que representa aproximadamente el 64% de los parametros.

El autor indica que la revision del 2026-11-01 reconstruyo el modelo aplicando suavizado AWQ en las entradas de atención (q/k/v; q solo en las capas con KV compartida), en las entradas del MLP (gate/up) y en la entrada de la proyeccion down, con 128 muestras de calibracion. La primera subida (revision `5f18924`) era efectivamente round-to-nearest (RTN) pese a la etiqueta AWQ, por lo que se recomienda volver a descargar si se obtuvo antes de esa fecha. El tokenizador, `chat_template`, `processor_config` y `generation_config` son identicos a los del original, incluida la correccion de `chat_template` de julio de 2026.

## Capacidades

- Generacion de texto y conversacion multi-turno, con `chat_template` compatible con el original.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión mantenida en BF16.
- Procesamiento de audio, segun la model card, con torre de audio mantenida en BF16.
- Razonamiento y matematicas basicas, aunque con degradacion medible frente al BF16 original (GSM8K al 73,9% de recuperacion).
- Soporte multilingue limitado por la informacion disponible: evaluacion en ingles y coreano (KMMLU, HAE-RAE); no se detalla la lista completa de idiomas.
- Compatibilidad con vLLM y transformers; el autor menciona `endpoints_compatible` en los tags.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia multimodal de bajo coste en vLLM: el formato `nvfp4-pack-quantized` y el tamano de ~7,6 GB permiten desplegar el modelo en GPUs con soporte FP4 reduciendo memoria frente al BF16, adecuado para prototipos y entornos de pruebas.
- Clasificacion y descripcion de imagenes a gran escala: la torre de visión en BF16 conserva la calidad de representacion visual mientras el resto del modelo se sirve en 4 bits, lo que abarata el procesamiento por imagen.
- Transcripcion y analisis de audio en pipelines por lotes: la torre de audio en BF16 permite mantener la calidad de entrada mientras se reduce el coste del decodificador.
- Generacion de texto en ingles y coreano para tareas de resumen o respuesta a preguntas, dado que la calibracion y la evaluacion se centran en esos idiomas; adecuado para mercados coreano-parlantes.
- Entornos de desarrollo y CI con recursos limitados: el menor espacio en disco y memoria permite ejecutar pruebas de integracion del pipeline multimodal sin aprovisionar GPUs de gran capacidad.
- Experimentacion academica con cuantizacion NVFP4: sirve como referencia practica de PTQ AWQ frente a RTN y QAT, con metricas de fidelidad publicadas (perplejidad y acuerdo top-1).
- No recomendado para tareas de razonamiento matematico o precision alta: la caida en GSM8K (38,13 frente a 51,63 en BF16) desaconseja su uso en produccion cuando la exactitud es critica.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin chat template. Los porcentajes entre parentesis indican recuperacion frente al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 55,97 | 55,49 (99,1%) | 56,25 (100,5%) | 53,40 (95,4%) | 50,06 (89,4%) | 54,57 (97,5%) |
| GSM8K (5-shot, strict) | 51,63 | 48,82 (94,6%) | 53,98 (104,6%) | 48,52 (94,0%) | 38,13 (73,9%) | 40,03 (77,5%) |
| ARC-Challenge (0-shot) | 49,57 | 48,04 (96,9%) | 49,23 (99,3%) | 48,63 (98,1%) | 45,48 (91,7%) | 44,80 (90,4%) |
| Winogrande (5-shot) | 62,59 | 60,77 (97,1%) | 62,51 (99,9%) | 61,25 (97,9%) | 58,88 (94,1%) | 60,54 (96,7%) |
| KMMLU (5-shot, direct) | 40,72 | 40,70 (100,0%) | 40,69 (99,9%) | 39,51 (97,0%) | 37,95 (93,2%) | 39,45 (96,9%) |
| HAE-RAE (0-shot) | 62,14 | 62,05 (99,9%) | 62,24 (100,1%) | 59,67 (96,0%) | 57,01 (91,7%) | 60,59 (97,5%) |
| Media | 53,77 | 52,65 (97,9%) | 54,15 (100,7%) | 51,83 (96,4%) | 47,92 (89,1%) | 50,00 (93,0%) |

Fidelidad frente al original BF16 en un conjunto interno mixto ingles/coreano de 100 prompts (respuestas greedy del BF16 original puntuadas con cada build):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mas cercano) | 1,5280 | 1,1833 (+29,1%) |
| Acuerdo top-1 siguiente token | 85,4% | 99,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion; el autor indica ~7,6 GB de pesos en disco, por lo que se requiere al menos esa cantidad mas overhead de activaciones, cache KV y torres en BF16.
- GPU recomendadas: no disponible en la informacion proporcionada. El esquema NVFP4 requiere GPUs con soporte de FP4 (generaciones recientes de NVIDIA); el autor menciona vLLM 0.32 para la evaluacion.
- Cabe en GPU consumer: no confirmado en la informacion; depende del soporte FP4 del hardware concreto.
- Opciones de despliegue: vLLM (objetivo principal declarado), transformers; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparacion con otras variantes del mismo modelo base segun los datos de benchmark del autor:

| Modelo | Precision | MMLU | GSM8K | Media | Licencia |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it (BF16) | BF16 | 55,97 | 51,63 | 53,77 | Apache-2.0 / Gemma 4 |
| FP8-dynamic | FP8 | 55,49 | 48,82 | 52,65 | segun build |
| AWQ-8bit | 8 bits | 56,25 | 53,98 | 54,15 | segun build |
| NVFP4A16 | 4 bits pesos / 16 bits activaciones | 53,40 | 48,52 | 51,83 | segun build |
| **NVFP4 (este repo)** | W4A4 | 50,06 | 38,13 | 47,92 | Apache-2.0 |
| AWQ-4bit | 4 bits | 54,57 | 40,03 | 50,00 | segun build |

## Limitaciones y advertencias

- Degradacion de calidad notable: recuperacion media del 89,1% frente al BF16 original; GSM8K cae al 73,9% y MMLU al 89,4%.
- Perplejidad un 29,1% superior al original y acuerdo top-1 del 85,4% frente al 99,0% del BF16.
- Es PTQ, no QAT: no hay reentrenamiento con cuantizacion simulada, por lo que la fidelidad es inferior a los checkpoints QAT de Google, que no estan incluidos en este repositorio.
- Historial de revision: la primera subida (revision `5f18924`) era efectivamente RTN pese a la etiqueta AWQ; si se descargo antes del 2026-11-01 08:29:07 UTC, debe descargarse de nuevo.
- Calibracion con 128 muestras mayoritariamente en coreano y sin respuestas de modo thinking, lo que puede sesgar el comportamiento en otros idiomas o tareas de razonamiento.
- Idiomas soportados no documentados; la evaluacion se limita a ingles y coreano.
- Longitud de contexto no disponible en la informacion.
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por la cuantizacion de baja fidelidad.
- Restricciones de licencia: Apache-2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso comercial de Gemma 4 antes de desplegar en produccion.
- Requiere hardware con soporte FP4 para aprovechar el formato; no se documentan alternativas de despliegue en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-E2B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
