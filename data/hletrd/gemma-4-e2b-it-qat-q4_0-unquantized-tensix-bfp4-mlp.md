# hletrd/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP

## Resumen

Esta ficha describe una cuantizacion especifica del modelo multimodal Gemma 4 E2B instruct, publicada por el usuario hletrd (bajo la organizacion Xylolabs en la model card original) para su ejecucion sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, un checkpoint de Google ya sometido a quantizacion consciente del entrenamiento (QAT) en formato Q4_0, que aqui se reempaqueta en los formatos de coma flotante por bloques propios de Tensix (`bfloat4_b` y `bfloat8_b`).

La motivacion es practica: los NPU Tensix no ejecutan directamente cuantizaciones tipo GGUF Q4_0, sino que trabajan con BFP4/BFP8 por bloques. Este repositorio traduce los pesos a esos formatos manteniendo el maximo de precision posible: las proyecciones MLP van a BFP4 (4 bits por bloque) y las proyecciones de atencion a BFP8, mientras que embeddings, LM head y normalizaciones permanecen en bf16.

El resultado es un modelo de 5.506.950.723 parametros totales con un peso empaquetado de 6.758 GB (frente a 9.26 GB en bf16), lo que lo hace viable en hardware Tensix de gama media. Es relevante para quienes despliegan Gemma 4 en infraestructura Tenstorrent y necesitan un equilibrio entre tamano y fidelidad respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con torres de vision y audio; cuantizacion por bloques Tensix |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP; BFP8 (`bfloat8_b`) en atencion; bf16 en embeddings, LM head, norms, vision_tower y audio_tower |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado Tensix, 6.758 GB); compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google (familia Gemma 4, variante E2B instruct) que procesa texto, imagen y audio (pipeline `any-to-any`). Incluye torres separadas de vision (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`), que en esta cuantizacion permanecen intactas en bf16. La capa de lenguaje consta de 35 capas con proyecciones de atencion q, o y MLP gate, up, down; las proyecciones k, v aparecen en 15 capas segun la tabla de formatos del autor.

La cuantizacion se realizo con la herramienta `tensix-bfp-gptq` (commit 5c52065): las matrices BFP4 se obtuvieron mediante GPTQ con busqueda de exponente por bloque, y las BFP8 mediante redondeo al mas cercano (round to nearest). El checkpoint base ya incorpora QAT en Q4_0 de Google, de modo que esta conversion parte de pesos ya adaptados a baja precision. No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens ni proceso de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional en modo instruct (chat template incluido).
- Procesamiento de imagen (image-text-to-text) mediante la torre de vision.
- Procesamiento de audio mediante la torre de audio.
- Salida multimodal (pipeline any-to-any).
- Soporte multilingue: la evaluacion cubre ingles y coreano; el conjunto completo de idiomas no esta documentado.
- Compatible con la API de `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`).
- Ejecucion en NPU Tensix mediante `ttnn` y kernels especificos (`tensix-kernels`, `tensix-runner`).
- Tool calling / function calling: no disponible en la informacion.
- Modo thinking explicito: no disponible en la informacion.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el modelo esta empaquetado para Wormhole y Blackhole, por lo que encaja en servidores con NPU Tensix donde no se puede usar CUDA ni GGUF; se carga con `ttnn.as_tensor` y los kernels de `tensix-runner`.
- Asistentes multimodales en el borde: al ocupar 6.758 GB empaquetado, permite servir un modelo any-to-any (texto, imagen, audio) en un unico acelerador de gama media sin recurrir a bf16.
- Prototipado de pipelines vision-lenguaje: la torre de vision en bf16 conserva la fidelidad original, adecuada para tareas de descripcion de imagenes o VQA en entornos de investigacion.
- Transcripcion y comprension de audio: la torre de audio intacta permite experimentar con tareas speech-to-text o audio-QA sobre el mismo checkpoint.
- Evaluacion de tecnicas de cuantizacion BFP: util como referencia para comparar GPTQ por bloques frente a Q4_0 de llama.cpp (KL medio 0.0601 frente a 0.0444).
- Chat multilingue (ingles/coreano): la evaluacion del autor valida el comportamiento en estos dos idiomas, por lo que es apto para asistentes en esos mercados.
- Integracion en `transformers` para pruebas de humo: el quickstart permite cargar el modelo en bf16 con `device_map="auto"` para validar salidas antes de empaquetar en Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (base Google) | 9.26 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 attn) | 6.758 | 0.06007 | 88.34 |
| Q4_0 (llama.cpp) | 3.350 | 0.04435 | 89.47 |

Las metricas de KL y top-1 se calculan sobre 7.968 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), aplicando el chat template. Q4_0 se genero desde el mismo checkpoint con llama.cpp v0.9.0 sin importance matrix. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 6.758 GB empaquetado para Tensix; 9.26 GB en bf16 si se carga con `transformers`.
- Aceleradores objetivo: NPU Tenstorrent Wormhole y Blackhole.
- GPU consumer: no es el objetivo del repositorio; en bf16 (9.26 GB) podria caber en GPUs con 12-16 GB de VRAM, pero no se documenta soporte oficial.
- Despliegue: `ttnn` (Tensix), `tensix-runner` v0.1.0, `tensix-kernels` v0.1.0; en `transformers` mediante `AutoModelForCausalLM`.
- Herramientas de empaquetado: `pack_tensix.py` y `verify_grid.py` incluidos en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 MLP) | 5.506.950.723 | no disponible | safetensors Tensix | Apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | 5.506.950.723 | no disponible | safetensors bf16 | Apache-2.0 (segun base) | Hugging Face |
| Q4_0 llama.cpp (mismo checkpoint) | 5.506.950.723 | no disponible | GGUF Q4_0 | Apache-2.0 | Generado localmente |

La comparativa se limita al mismo checkpoint en distintos formatos, ya que no se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad respecto a bf16: KL medio de 0.0601 (1.35 veces el de Q4_0) y top-1 del 88.34 %, inferior al 89.47 % de Q4_0.
- El modelo esta disenado especificamente para NPU Tensix; su uso en GPU o CPU requiere cargarlo en bf16 o reconvertirlo, y no se garantiza el rendimiento.
- Idiomas documentados limitados a ingles y coreano en la evaluacion; el resto no esta verificado.
- Riesgo de alucinacion inherente a modelos generativos de este tamano; no se documentan mitigaciones adicionales.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de produccion.
- No se documentan sesgos conocidos, longitud de contexto ni soporte de tool calling en la informacion disponible.
- El repositorio tiene muy poca traccion (197 descargas, 1 like) y una unica release (2026-11-11); no hay historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
