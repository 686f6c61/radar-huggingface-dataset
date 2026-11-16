# gostar77/muse-glimmer-30b-iq4r-s-v4-radiance

## Resumen

Muse Glimmer 30B IQ4R-S-V4 — Radiance es una cuantizacion agresiva del modelo base Meta Muse Glimmer 30B, publicada por el usuario gostar77 en formato nativo de Radiance (contenedores `.rad`), no en Transformers, GGUF ni safetensors. El repositorio contiene dos variantes que comparten tronco y drafter: una con torre de vision en BF16 (21,05 GB) y otra con torre de vision en block-FP8 (19,13 GB). El objetivo es ofrecer el modelo completo, incluyendo vision y decodificacion especulativa DFlash2, en un punto de tamano de aproximadamente 18-21 GB.

La cuantizacion combina trellises U4 para la atencion del tronco, U3 GPTQ para las capas MLP (calibrado con Hessians RADGRAM2 sobre 2,5 millones de tokens con plantilla de Muse) y un drafter DFlash2 cuantizado a U3/U2. Las embeddings de tokens y la cabeza de salida se mantienen en BF16. La fidelidad medida frente a la referencia BF16 sobre el corpus KLD de Muse (271.810 posiciones) es de KL medio 0,026803 y acuerdo top-1 del 94,236 %, con una perplejidad de 4,1975 frente a 4,2099 del modelo BF16.

El interes practico esta en el rendimiento: 2.313 tok/s de prefill y 70,78 tok/s de decodificacion en una sola Radeon AI PRO R9700 con KV en i8 y DFlash2 activo, con un tamano de almacenamiento inferior al de la variante IQ4R-V4 de mayor calidad. Es un artefacto muy especializado, orientado a despliegues Radiance sobre AMD RDNA4, y no un checkpoint de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificacion especulativa (drafter DFlash2); tronco multimodal texto+vision |
| Parametros totales | no disponible (modelo base de 30B segun nomenclatura) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4R-S-V4: atencion U4 `fwht128` con trellises computed-MAD (tcq=16, act-order); MLP U3 GPTQ trellis; drafter U3 trellis + cabeza U2 (`codes=u2 zero=u8 group=128 scale=f16`); embeddings y cabeza de salida en BF16; vision en BF16 o E4M3 block-FP8 con escalas BF16 128x128 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con Muse Glimmer Usage Policy de Meta) |
| Formato de pesos | Contenedores Radiance `.rad` (no Transformers, no GGUF, no safetensors) |

## Arquitectura y entrenamiento

El modelo base es Meta Muse Glimmer 30B, un transformer multimodal con torre de vision de 50 capas y adaptador. Sobre el se aplica una cuantizacion post-entrenamiento especifica de Radiance: la atencion del tronco usa trellises U4 con transformada `fwht128` y una escala f32 por fila, recurriendo al fallback de redondeo mas cercano sin Gram porque la captura no incluye Hessians de atencion. Las capas MLP gate/up y down usan trellises U3 GPTQ ajustados sobre Hessians RADGRAM2 TP2 capturados con 2,5 millones de tokens con plantilla de Muse. El drafter DFlash2 emplea trellises U3 en las lineales densas y una cabeza copiada en U2.

La innovacion principal es el empaquetado conjunto de tronco, drafter y torre de vision en un unico contenedor Radiance, con soporte de decodificacion especulativa nativa y KV cache en i8 (Muse no admite KV E4M3/fp8). La variante fp8vision se construyo con `--reuse` a partir de la bf16vision, de modo que las 2.182 superficies no visuales son byte a byte identicas; solo difieren las lineales de vision. El dataset de calibracion publico contiene los Hessians MLP finales, no los prompts crudos.

## Capacidades

- Generacion de texto autoregresiva con decodificacion especulativa DFlash2 (aceptacion de 1.622 de 5.010 tokens de draft en la medicion publicada).
- Procesamiento de imagen: la torre de vision de 50 capas permite entrada multimodal; se validaron pruebas funcionales de campo de color y OCR de imagen local.
- Razonamiento y generacion de codigo: heredados del modelo base de 30B, aunque no se publican evaluaciones de tarea especificas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Inferencia con KV cache en i8 y sin cache de prefijo en las pruebas publicadas.

## Casos de uso

- Despliegue de inferencia de texto de alta velocidad en hardware AMD RDNA4: el modelo alcanza 70,78 tok/s de decodificacion en una Radeon AI PRO R9700, adecuado para servicios interactivos con requisitos de latencia estrictos en un unico acelerador.
- Procesamiento de documentos con OCR: la torre de vision permite extraer texto de imagenes locales; se valido con prompts de OCR sobre imagen, util para digitalizacion de facturas o formularios.
- Servicio multimodal ligero en produccion: el contenedor fp8vision reduce el almacenamiento a 19,13 GB manteniendo la misma calidad de texto, apropiado para entornos con presupuesto de VRAM ajustado.
- Evaluacion comparativa de tecnicas de cuantizacion: los recipes y Hessians publicados permiten reproducir la conversion y medir fidelidad KL frente a BF16, util para investigadores que estudian GPTQ y trellis quantization.
- Generacion de texto con contexto largo: el prefill de 2.313 tok/s sobre un prompt unico de 32.495 tokens lo hace viable para resumir o analizar documentos extensos, aunque la longitud maxima de contexto no se especifica.
- Investigacion en decodificacion especulativa: el drafter DFlash2 integrado y las metricas de aceptacion publicadas sirven para estudiar el equilibrio entre velocidad y calidad en decodificacion especulativa.
- Prototipado de pipelines Radiance: sirve como referencia funcional para validar el plugin `museglimmer_ct` y los kernels `libr4d` antes de desplegar la variante IQ4R-V4 de mayor calidad.

## Benchmarks y rendimiento

| Metrica | IQ4R-S-V4 | IQ4R-V4 (24,40 GiB) | Baseline RTN FP8 + MXFP4 |
|---|---:|---:|---:|
| KL medio vs BF16 | 0,026803 | 0,012134 | 0,054073 |
| Acuerdo top-1 | 94,236 % | 96,099 % | 92,767 % |
| Perplejidad del modelo | 4,1975 | 4,2289 | 4,1215 |
| Perplejidad referencia BF16 | 4,2099 | 4,2099 | 4,2099 |
| Prefill (tok/s) | 2.313 | 2.295 | no disponible |
| Decodificacion (tok/s) | 70,78 | 70,24 | no disponible |
| Almacenamiento | 21,05 GB (bf16vision) / 19,13 GB (fp8vision) | 24,40 GiB | no disponible |

Mediciones sobre el corpus KLD de Muse (271.810 posiciones, 568 documentos con plantilla de Muse, 512 tokens top de referencia mas cola). La velocidad se midio en TP1 sobre una Radeon AI PRO R9700, KV i8, DFlash2 activo, sin cache de prefijo, prompt unico de 32.495 tokens y 2.048 tokens generados. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21 GB para la variante bf16vision y 19 GB para fp8vision en inferencia, segun el tamano del contenedor; el KV cache i8 anade consumo adicional no cuantificado.
- GPU recomendadas: Radeon AI PRO R9700 (validada, TP1); se requiere soporte AMD RDNA4 y el plugin `museglimmer_ct` con kernels `libr4d`.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de 19-21 GB queda al limite de GPUs consumer de 24 GB, pero no se documenta validacion en RTX 4090 ni similares.
- Opciones de despliegue: exclusivamente runtime Radiance con `museglimmer_ct` y `libr4d`; no compatible con vLLM, llama.cpp, Ollama ni TGI al no ser GGUF ni safetensors.
- Latencia y throughput: 2.313 tok/s de prefill y 70,78 tok/s de decodificacion en la configuracion descrita; la variante fp8vision requiere soporte de Muse FP8-vision (PR #467 de Radiance).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Calidad (KL vs BF16) | Almacenamiento |
|---|---|---|---:|---|---:|---:|
| Muse Glimmer 30B IQ4R-S-V4 (este) | 30B (base) | no disponible | `.rad` | Apache-2.0 | 0,026803 | 19,13-21,05 GB |
| Muse Glimmer 30B IQ4R-V4 | 30B (base) | no disponible | `.rad` | Apache-2.0 | 0,012134 | 24,40 GiB |
| Baseline RTN FP8 + MXFP4 (no publicado) | 30B (base) | no disponible | no disponible | no disponible | 0,054073 | no disponible |

No se dispone de comparaciones con modelos de otros ecosistemas (Llama, Qwen, Mistral) en la informacion proporcionada, ya que el formato Radiance es especifico de este runtime.

## Limitaciones y advertencias

- Formato propietario de runtime: los contenedores `.rad` no son compatibles con el ecosistema estandar (Transformers, GGUF, safetensors), lo que limita su portabilidad y requiere el stack Radiance.
- Dependencia de hardware AMD RDNA4: la validacion se realizo unicamente en Radeon AI PRO R9700; no hay evidencia de funcionamiento en NVIDIA u otras arquitecturas.
- La variante fp8vision requiere soporte especifico de Muse FP8-vision (PR #467), no incluido en todas las builds de Radiance.
- Fidelidad inferior a la variante IQ4R-V4: el KL medio es aproximadamente 2,2 veces mayor, con menor acuerdo top-1 (94,236 % frente a 96,099 %).
- Las metricas de calidad son especificas del corpus KLD de Muse y no constituyen evaluaciones de tarea amplias; no se han publicado benchmarks de MMLU, HumanEval o GSM8K.
- No se ha ejecutado ninguna prueba de calidad de imagen a gran escala; solo pruebas funcionales de humo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero aplicables por herencia del modelo base.
- Idiomas soportados no especificados.
- Licencia Apache-2.0 en el modelo base, sujeta ademas a la Muse Glimmer Usage Policy de Meta; el repositorio no concede derechos mas alla de los terminos upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gostar77/muse-glimmer-30b-iq4r-s-v4-radiance
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Variante de mayor calidad IQ4R-V4: https://huggingface.co/gostar77/muse-glimmer-30b-iq4r-v4-radiance
- Dataset de calibracion: https://huggingface.co/datasets/gostar77/muse-glimmer-30b-iq4r-v4-calibration
- PR de soporte FP8-vision en Radiance: https://codeberg.org/StillDeadcode/radiance/pulls/467
