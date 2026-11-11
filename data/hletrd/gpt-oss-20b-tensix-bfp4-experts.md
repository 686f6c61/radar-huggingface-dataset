# hletrd/gpt-oss-20b-Tensix-BFP4-Experts

## Resumen

`hletrd/gpt-oss-20b-Tensix-BFP4-Experts` es una cuantizacion del modelo `openai/gpt-oss-20b` de OpenAI, publicada por el usuario hletrd y elaborada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El checkpoint conserva los pesos en bf16, pero cada valor ya esta alineado a la rejilla de `ttnn.bfloat4_b` (BFP4) o `ttnn.bfloat8_b` (BFP8), de forma que TT-NN puede empaquetarlos sin un nuevo redondeo. No esta afiliado ni respaldado por Tenstorrent.

El modelo base es un transformer MoE de 20.914.757.184 parametros (aproximadamente 21 mil millones), con licencia Apache 2.0. Esta variante reduce el peso empaquetado de 41,83 GB (BF16) a 13,218 GB, con una media de 5,06 bits por peso, aplicando GPTQ solo a los expertos enrutados y redondeo al mas cercano a las capas de atencion y a la LM head.

Su relevancia es doble: por un lado, demuestra una via de despliegue de gpt-oss-20b en hardware de inferencia de Tenstorrent con una perdida de fidelidad medida frente a BF16 (KL medio de 0,0636); por otro, sirve como referencia de cuantizacion por bloques (block floating point) adaptada a un backend concreto, algo poco habitual en el ecosistema Hugging Face. El checkpoint es de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gpt_oss), pesos alineados a block floating point BFP4/BFP8 |
| Parametros totales | 20.914.757.184 (~21B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base; consultar la model card de `openai/gpt-oss-20b`) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) y BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso); media de 5,06 bits/peso; pesos almacenados en bf16 |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 41,9 GB; 13,22 GB empaquetados en BFP4/BFP8 |

Mapa de formatos por tensor:

| Tensores | Formato |
|---|---|
| Atencion q, k, v, o (24 capas) | `bfloat8_b`, 8,5 bits por peso |
| Expertos enrutados gate, up, down (24 capas) | `bfloat4_b`, 4,5 bits por peso, bloques de 16 a lo largo de las entradas |
| Router (24 capas) | bf16 |
| LM head | `bfloat8_b`, 8,5 bits por peso |
| Embedding, normalizaciones y resto | bf16, como en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de OpenAI, de aproximadamente 21 mil millones de parametros totales. Esta variante no reentrena el modelo: parte de los pesos de `openai/gpt-oss-20b` y transforma cada matriz lineal a un formato de coma flotante por bloques compatible con TT-NN. Los tensores de atencion (q, k, v, o) y la LM head se redondean al mas cercano a `bfloat8_b`; los expertos enrutados (gate, up, down) se cuantizan con GPTQ a `bfloat4_b` con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. GPTQ se aplica experto a experto, cada uno con su propia matriz de Hessian y bloques de 16 a lo largo de las entradas; los expertos con pocos tokens de calibracion se redondean al mas cercano. El router, el embedding y las normalizaciones permanecen en bf16.

La innovacion principal es el alineamiento exacto a la rejilla de block floating point de Tenstorrent: aunque los ficheros son bf16, cada valor ya ocupa una posicion valida de BFP4 o BFP8, por lo que TT-NN empaqueta sin redondear de nuevo. El repositorio incluye `quant4.json` (formato de cada proyeccion), `pack_tensix.py` (comprueba el empaquetado de cada matriz contra TT-NN) y `verify_grid.py` (verifica la rejilla solo con torch). El autor indica que el checkpoint se ha probado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent, y no sobre hardware real.

## Capacidades

- Generacion de texto conversacional mediante `transformers` con `AutoModelForCausalLM` y plantilla de chat (`apply_chat_template`).
- Razonamiento: la evaluacion incluye siete prompts de razonamiento ejecutados con thinking activado, lo que confirma que el modo de pensamiento del modelo base se conserva tras la cuantizacion.
- Capacidades del modelo base (heredadas, no verificadas de forma independiente en esta variante): generacion de codigo, matematicas, tool calling y razonamiento multi-paso. Consultar la model card de `openai/gpt-oss-20b` para el detalle.
- Multilingue: la calibracion y la evaluacion cubren ingles y coreano; el resto de idiomas no esta documentado en esta ficha.
- Despliegue en NPU Tensix mediante TT-NN, con empaquetado exacto de los pesos en BFP4/BFP8.

## Casos de uso

- Inferencia en NPU Tenstorrent: el caso principal. El checkpoint esta disenado para cargarse en Wormhole o Blackhole a traves de TT-NN, con los expertos en BFP4 y la atencion en BFP8, reduciendo el peso empaquetado a 13,22 GB frente a 41,83 GB en BF16.
- Validacion de pipelines de cuantizacion: `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado en TT-NN no altera ningun valor, util para integrar cuantizacion BFP en flujos de CI.
- Investigacion sobre fidelidad de cuantizacion: la tabla de evaluacion (KL medio y top-1 frente a BF16, con comparacion contra MXFP4 de llama.cpp) sirve como referencia metodologica para medir perdida de fidelidad en formatos de bloque.
- Despliegue en el simulador `ttsim`: permite desarrollar y depurar integraciones con TT-NN sin disponer de hardware Blackhole.
- Prototipado de asistentes conversacionales en hardware de bajo consumo: el modelo base de 21B con contexto largo (segun la model card de OpenAI) y el peso reducido a 13,22 GB lo hacen candidato para entornos con memoria limitada en NPU.
- Evaluacion comparativa de backends: util para contrastar el rendimiento y la fidelidad de BFP4/BFP8 de Tenstorrent frente a MXFP4 en llama.cpp sobre el mismo modelo base.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (fidelidad frente a BF16, no calidad de tarea):

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`openai/gpt-oss-20b`) | 16 | 41,83 | 0 | 100 | 40 de 40 | - |
| **este modelo** | 5,06 | 13,218 | 0,0636 | 81,90 | 39 de 40 | 0 |
| MXFP4 (llama.cpp) | 4,63 | 12,110 | 0,0678 | 82,65 | 39 de 40 | 0 |

Notas metodologicas del autor: KL y top-1 se calculan sobre 8.188 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano). Las respuestas corresponden a 33 prompts cortos con comprobacion automatica mas 7 de razonamiento con thinking activado (40 en total). MXFP4 es el GGUF de `ggml-org/gpt-oss-20b-GGUF` (commit `15dcfc7e`) leido con llama.cpp v0.9.0 (`cd959bae`); el BF16 de llama.cpp esta a 0,0435 de KL medio del BF16 de referencia, por lo que cada lado se mide contra su propio BF16. El criterio de aceptacion era un KL medio como maximo 1,5 veces el de MXFP4 y como maximo una respuesta perdida mas; se cumplio (0,94 veces y 0 perdidas frente a 0). No se midio velocidad en dispositivo.

## Requisitos de hardware

- VRAM/DRAM estimada: 13,22 GB empaquetados en BFP4/BFP8; el repo completo en bf16 ocupa 41,9 GB (41,83 GB segun la tabla de evaluacion).
- Hardware objetivo: NPU Tensix de Tenstorrent, en concreto Wormhole y Blackhole.
- La demo de gpt-oss de tt-metal (v0.81.1) ejecuta el modelo en cuatro chips Blackhole (QuietBox 2) o en Wormhole LoudBox y Galaxy; no en un solo chip. No se ha probado con este checkpoint y se desconoce si la demo lee un checkpoint bf16 como este y si su disposicion de expertos conserva estos valores.
- Simulador: probado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), no sobre hardware.
- tt-forge (tt-xla): no ejecutado con este checkpoint.
- GPU consumer: no hay datos publicados sobre ejecucion en GPU; el checkpoint esta pensado para TT-NN, no para CUDA. La carga en `transformers` con `device_map="auto"` es posible, pero requeriria aproximadamente los 41,9 GB del repo en bf16.
- Opciones de despliegue: TT-NN (tt-metal) y `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no medidos (el autor lo indica expresamente).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | KL medio a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (BFP4/BFP8, Tensix) | ~21B | no disponible | 5,06 | 13,218 GB | 0,0636 | Apache 2.0 | Hugging Face |
| `openai/gpt-oss-20b` (BF16) | ~21B | no disponible | 16 | 41,83 GB | 0 (referencia) | Apache 2.0 | Hugging Face |
| `ggml-org/gpt-oss-20b-GGUF` (MXFP4, llama.cpp) | ~21B | no disponible | 4,63 | 12,110 GB | 0,0678 | Apache 2.0 (modelo base) | Hugging Face |

Los tres comparten el mismo modelo base y licencia; la diferencia esta en el formato de cuantizacion y en el backend de destino. Este checkpoint es el unico de los tres orientado a NPU Tensix.

## Limitaciones y advertencias

- No probado en hardware real: la validacion se hizo sobre `ttsim` (simulador de Blackhole) con ttnn 0.81.1.
- La demo de gpt-oss de tt-metal no se ha probado con este checkpoint; se desconoce si acepta un checkpoint bf16 y si su disposicion de expertos conserva estos valores.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- No se han medido latencia ni throughput en dispositivo.
- Los numeros de evaluacion miden cercania a BF16, no calidad de tarea; el autor lo advierte explicitamente.
- Perdida de fidelidad: KL medio de 0,0636 y top-1 del 81,90 % frente a BF16, con una respuesta perdida de 40 en la evaluacion propia.
- Calibracion de GPTQ limitada a 65.536 tokens de WikiText-2 y Wikipedia en coreano; los expertos con pocos tokens de calibracion se redondearon al mas cercano.
- Idiomas soportados no documentados en esta ficha; la evaluacion solo cubre ingles y coreano.
- Sesgos y riesgo de alucinacion: no documentados en esta model card; heredados del modelo base, consultar `openai/gpt-oss-20b`.
- Licencia Apache 2.0, igual que el modelo base; los cambios se listan en `NOTICE`. Se distribuye "as is", sin garantia.
- Proyecto sin afiliacion ni respaldo de Tenstorrent; 0 descargas y 0 likes en el momento de redactar la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gpt-oss-20b-Tensix-BFP4-Experts
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Revision del modelo base citada en la evaluacion: https://huggingface.co/openai/gpt-oss-20b/tree/6cee5e81ee83917806bbde320786a8fb61efebee
- GGUF MXFP4 de referencia (llama.cpp): https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Demo de gpt-oss en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gpt_oss
- Paper del modelo base (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
