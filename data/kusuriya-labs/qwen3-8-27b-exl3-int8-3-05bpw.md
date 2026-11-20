# kusuriya-labs/Qwen3.8-27B-EXL3-INT8-3.05bpw

## Resumen

Qwen3.8-27B-EXL3-INT8-3.05bpw es una cuantizacion del modelo multimodal Qwen/Qwen3.8-27B publicada por kusuriya-labs. Se trata de un checkpoint EXL3-INT8 que comprime el decodificador del modelo de lenguaje a 3,05 bits por peso, manteniendo la cabeza LM y la torre de vision a 6 bits y el modulo MTP (multi-token prediction) a 4 bits. Los embeddings, las normas y los controles recurrentes permanecen sin cuantizar. El objetivo es reducir el peso en memoria para ejecutar un modelo multimodal de gran tamano en GPUs de consumo o en hardware AMD con ROCm.

El checkpoint no es compatible con Transformers estandar ni con vLLM, y el ExLlamaV3 original tampoco puede decodificarlo correctamente porque usa un codebook trellis `mul24` con marcador `.mul1` fijo (`0x00DCD12D`) que situa los pesos decodificados en una rejilla INT8 fija. El autor proporciona un runtime propio llamado `shelf`, compilado para `gfx1201` (Radeon AI PRO R9700), con el que se han realizado todas las mediciones publicadas.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion agresiva (3,05 bpw) aplicada a un modelo multimodal; por otro, expone con detalle las perdidas de calidad asociadas (KLD medio de 0,059 frente a 0,021 de la variante de 4 bpw) y las limitaciones de despliegue en hardware AMD. El repositorio ocupa 13,6 GB y los safetensors suman aproximadamente 12,69 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con cuantizacion EXL3-INT8 trellis; incluye torre de vision y modulo MTP |
| Parametros totales | 6.810.178.944 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 131.072 tokens medidos en el runtime `shelf` (dependiente de memoria) |
| Tipos de cuantizacion | EXL3-INT8 a 3,05 bpw en el decodificador LM; 6 bits en LM head y torre de vision; 4 bits en MTP; embeddings, normas y controles recurrentes sin cuantizar |
| Idiomas soportados | no disponible (la model card menciona prompts en japones e ingles para pruebas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3-INT8, requiere runtime `shelf`; no compatible con Transformers ni vLLM) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer multimodal con pipeline `image-text-to-text` que incluye torre de vision y un modulo de prediccion multi-token (MTP). Sobre esa base, kusuriya-labs aplica una cuantizacion post-entrenamiento EXL3-INT8 con trellis `mul24`: cada marcador `.mul1` de las capas lineales contiene el valor `0x00DCD12D`, lo que restringe los pesos decodificados a una rejilla INT8 fija. Esta variante no se obtiene modificando los metadatos de un checkpoint EXL3 estandar; requiere cuantizar con ese codebook concreto. El `config.json` conserva la etiqueta heredada `codebook: mul1`, mientras que `quantization_config.json` identifica el formato como `exl3-int8`.

La calibracion se realizo con 250 filas de 2.048 tokens. No se dispone de informacion sobre el dataset de calibracion mas alla de ese dato, ni sobre el proceso de entrenamiento del modelo base (tokens, composicion, RLHF/DPO) en la informacion proporcionada. La model card advierte explicitamente que las afirmaciones del `SOURCE_MODEL_CARD.md` describen el modelo base, no esta cuantizacion. La innovacion tecnica principal es la propia tecnica de cuantizacion: un esquema trellis INT8 que permite bajar a 3,05 bpw manteniendo un runtime de decodificacion propio (`shelf`) con soporte de KV cache en BF16 u `octave:c5v5`, prefijo cache configurable y chunk de prefill ajustable.

## Capacidades

- Generacion de texto conversacional: la model card reporta 64 tokens coherentes con prompts en japones e ingles.
- Procesamiento de imagen y texto (`image-text-to-text`): el pipeline declarado incluye torre de vision, aunque el autor indica que el comportamiento de vision no fue evaluado.
- Prediccion multi-token (MTP): el modulo MTP se conserva cuantizado a 4 bits, aunque su comportamiento no fue evaluado en las mediciones publicadas.
- Soporte de contexto largo: se han medido asignaciones de memoria hasta 131.072 tokens con KV `octave:c5v5` en una GPU de 32 GiB.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; solo se documentan pruebas en japones e ingles.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal de gran tamano en GPU de 16 GiB: segun las mediciones del autor, con KV `octave:c5v5` y una arena de 14,5 GiB el modelo cabe en una GPU de 16 GiB para contextos de hasta 65.536 tokens, lo que permite ejecutar un modelo de 27B en hardware de consumo.
- Inferencia local en hardware AMD con ROCm: el runtime `shelf` esta compilado para `gfx1201` (Radeon AI PRO R9700) y ROCm 10.2, por lo que es adecuado para entornos con GPUs AMD Radeon PRO en lugar de CUDA.
- Servicio de chat conversacional de baja concurrencia: con `--max-concurrent-requests 1` y decodificacion de ~29 tok/s en una R9700, encaja en prototipos o asistentes personales donde la latencia por token es aceptable.
- Procesamiento de documentos con contexto largo: la posibilidad de asignar hasta 131.072 tokens con KV `octave:c5v5` permite resumir o analizar documentos extensos en una sola pasada, siempre que se disponga de 20 GiB o mas de VRAM.
- Evaluacion comparativa de tecnicas de cuantizacion: el checkpoint incluye mediciones de KLD y acuerdos top-1 frente a BF16, lo que lo convierte en una referencia util para investigar el impacto de bajar de 4 bpw a 3,05 bpw en modelos multimodales.
- Experimentacion con cuantizacion trellis INT8: el formato `exl3-int8` con codebook `mul24` es un caso de estudio para quienes trabajan en compresion de pesos y quieren reproducir el pipeline de calibracion con 250 filas de 2.048 tokens.
- Integracion en pipelines de investigacion con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial y modificacion, lo que facilita su inclusion en proyectos internos o productos derivados.

## Benchmarks y rendimiento

Calidad frente a referencia BF16 (8 casos, 2.632 posiciones, vocabulario valido 248.077, KL en FP64, temperatura 1):

| Modelo | KLD medio | Acuerdo top-1 |
|---|---:|---:|
| Esta cuantizacion 3,05 bpw (run 1) | 0,059129 | 91,3374% |
| Esta cuantizacion 3,05 bpw (run 2) | 0,059129 | 91,3374% |
| EXL3-INT8 4 bpw (medicion previa) | 0,020745 | 94,8708% |

Rendimiento en una sola peticion (Radeon AI PRO R9700 32 GiB, ROCm 10.2, `shelf` revision `9f5bde32`, KV BF16, page size 16, prefill-chunk 4096, sin decodificacion especulativa):

| Carga | Mediana | Rango |
|---|---:|---:|
| Prefill, 2.048 tokens | 1.147,38 tok/s | 1.144,89–1.148,73 |
| Decode, contexto 2.048, 128 tokens | 29,09 tok/s | 29,07–29,11 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa unos 12,69 GiB en safetensors; con KV BF16 y contexto de 8.192 tokens, el pico medido es de 14,82 GiB (arena de 14,5 GiB). Con KV `octave:c5v5` y contexto de 65.536 tokens, el pico se mantiene en 14,82 GiB; con 131.072 tokens sube a 20,32 GiB (arena de 20 GiB).
- GPU recomendadas: Radeon AI PRO R9700 (32 GiB, `gfx1201`) es la unica GPU documentada. El autor advierte que no se ha verificado compatibilidad con otras GPUs.
- Cabe en GPU de consumo: segun el criterio de cribado del autor (pico de ~15 GiB o menos), deberia caber en GPUs de 16 GiB como la RX 9070 XT, aunque las mediciones se hicieron en una R9700 de 32 GiB y no en esa tarjeta.
- Opciones de despliegue: exclusivamente el runtime `shelf` (`shelf-server`). No es compatible con Transformers estandar, vLLM ni ExLlamaV3 upstream.
- Latencia y throughput: prefill de ~1.147 tok/s y decode de ~29 tok/s en una sola peticion sobre R9700; no se documentan mediciones con concurrencia ni con decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD vs BF16) | Licencia | Despliegue |
|---|---|---:|---:|---|---|
| kusuriya-labs/Qwen3.8-27B-EXL3-INT8-3.05bpw | 6,81 B (safetensors) | hasta 131.072 tokens | 0,059129 | Apache-2.0 | `shelf` (ROCm, `gfx1201`) |
| Qwen3.8-27B EXL3-INT8 4 bpw (referencia del autor) | no disponible | no disponible | 0,020745 | Apache-2.0 (base) | `shelf` |
| Qwen/Qwen3.8-27B (BF16 original) | no disponible | no disponible | referencia | Apache-2.0 | Transformers, vLLM, llama.cpp |

No se dispone de datos de benchmarks estandar para comparar con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible: el KLD medio de 0,059129 es casi el triple que el de la variante de 4 bpw (0,020745), y el acuerdo top-1 baja del 94,87% al 91,34%. En los casos de prosa en ingles y japones el acuerdo top-1 cae al 82,17%, por lo que el agregado no representa igual de bien todos los prompts.
- Compatibilidad limitada: no funciona con Transformers, vLLM ni ExLlamaV3 upstream. Requiere el runtime `shelf` compilado para `gfx1201`; el autor no garantiza compatibilidad con otras GPUs, NixOS u otros entornos.
- Vision y MTP no evaluados: las mediciones se hicieron solo con texto; el comportamiento de la torre de vision y del modulo MTP no fue verificado.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de alucinacion; al ser una cuantizacion agresiva, la degradacion puede amplificarse en tareas de razonamiento o generacion factual.
- Sesgos: no se proporciona informacion sobre sesgos conocidos del modelo base ni de esta cuantizacion.
- Idiomas: no se declara una lista oficial de idiomas soportados; solo se documentan pruebas en japones e ingles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las afirmaciones de la model card del modelo base no aplican a esta cuantizacion y deben verificarse por separado.
- Contexto en 16 GiB: los exitos con arenas grandes en la R9700 no establecen el contexto maximo real en una GPU de 16 GiB; los fallos con arena de 15 GiB tampoco fijan el limite exacto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-EXL3-INT8-3.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del runtime `shelf`: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
