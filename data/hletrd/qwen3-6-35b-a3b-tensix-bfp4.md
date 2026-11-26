# hletrd/Qwen3.6-35B-A3B-Tensix-BFP4

## Resumen

Qwen3.6-35B-A3B-Tensix-BFP4 es una cuantizacion del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario hletrd (bajo la marca Xylolabs) y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer de tipo Mixture-of-Experts (MoE) con 35.951.822.704 parametros totales, de los cuales 3.000 millones estan activos por token (de ahi el sufijo A3B), y con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text).

El problema que resuelve esta version es el despliegue eficiente del modelo en hardware de aceleracion no-GPU de Tenstorrent: la cuantizacion reduce el peso de 69,32 GB en bf16 a 20,991 GB empaquetados, manteniendo el LM head, los embeddings y las normas en bf16. La cuantizacion se aplica en formato block-floating-point de 4 bits (`bfloat4_b`), con GPTQ y busqueda de exponente por bloque, sobre las proyecciones de atencion, las proyecciones del Gated DeltaNet y los expertos enrutados y compartidos.

Es relevante ahora porque permite ejecutar un modelo MoE multimodal de 35B en aceleradores Tensix con una perdida de fidelidad medida (KL medio a bf16 de 0,0501 frente a 0,0404 de Q4_K_M de llama.cpp) y un top-1 del 89,62 %. La licencia Apache 2.0 facilita su uso comercial, y el ecosistema de herramientas (tt-metal, ttnn, tt-forge) esta publicado como codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Gated DeltaNet y atencion (hibrida); base Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000 millones (aproximado, segun el sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) para proyecciones; bf16 para LM head, embeddings y normas; compatible tambien con `bfloat8_b` |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix, 20,991 GB; repo de 71,9 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura hibrida que combina capas de atencion clasica (10 capas) con capas de Gated DeltaNet (30 capas), ademas de una capa MoE con expertos enrutados y compartidos (40 capas). Esta variante cuantizada mantiene intactos en bf16 el LM head, los embeddings, las normas, el modulo `mtp` (multi-token prediction) y el modulo `visual`. Las proyecciones q, k, v, o de atencion, las proyecciones q, k, v, z, a, b y output del Gated DeltaNet, y las proyecciones gate, up, down de los expertos enrutados y compartidos se cuantizan a `bfloat4_b` mediante GPTQ con busqueda de exponente por bloque. El gate del experto compartido se mantiene en bf16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base dentro de la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es el formato de cuantizacion block-floating-point de 4 bits alineado con las operaciones Tensix, verificado mediante `pack_tensix.py` y `verify_grid.py` (round-trip exacto a traves de DRAM del dispositivo con ttnn 0.81.1 sobre el simulador Blackhole ttsim). El mismo conjunto de valores tambien se empaqueta de forma exacta en `ttnn.bfloat8_b`.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con el modulo `visual` conservado en bf16.
- Generacion de codigo y matematicas (el modelo base se presenta como "agentic coding power").
- Capacidad de multi-token prediction (modulo `mtp` incluido en bf16).
- Soporte multilingue parcial verificado en la evaluacion (ingles y coreano); el resto de idiomas no esta documentado en esta ficha.
- Despliegue en hardware Tensix (Wormhole, Blackhole) mediante tt-metal, ttnn y tt-forge.
- Compatibilidad con el stack de transformers (`AutoModelForCausalLM`, `AutoTokenizer`) para inferencia estandar.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de pensamiento (thinking mode) especificos de esta variante.

## Casos de uso

- Inferencia en aceleradores Tenstorrent: el modelo esta empaquetado para NPU Wormhole y Blackhole, de modo que equipos con hardware Tensix pueden ejecutar un MoE de 35B en 20,991 GB de memoria en lugar de 69,32 GB en bf16, reduciendo los requisitos de memoria del acelerador.
- Procesamiento de documentos con imagen y texto: al conservar el modulo `visual` en bf16, puede emplearse en tareas de descripcion de imagenes, extraccion de informacion de capturas o formularios y respuesta a preguntas sobre contenido visual.
- Asistente conversacional multilingue: la evaluacion cubre ingles y coreano, por lo que es adecuado para atencion al cliente o asistentes en esos idiomas, con la salvedad de que el resto de idiomas no esta documentado.
- Generacion de codigo asistida: el modelo base esta orientado a "agentic coding", lo que permite integrarlo en entornos de desarrollo para autocompletado, explicacion de codigo y generacion de parches.
- Investigacion en cuantizacion: sirve como referencia reproducible para estudiar el impacto de BFP4 frente a Q4_K_M (KL medio de 0,0501 frente a 0,0404) en un modelo MoE multimodal.
- Despliegue en simulador: con ttnn 0.81.1 sobre ttsim (simulador Blackhole) se puede validar el pipeline completo antes de disponer de hardware fisico, util para desarrollo y CI.
- Prototipado de bajo coste en GPU consumer: aunque el objetivo principal es Tensix, los pesos safetensors pueden cargarse con transformers en `bfloat16` y `device_map="auto"`, lo que permite probar el modelo en estaciones con GPU de gran memoria.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen3.6-35B-A3B) | 69,32 | 0 | 100 |
| **Este modelo (BFP4)** | 20,991 | 0,05013 | 89,62 |
| Q4_K_M (llama.cpp) | 21,713 | 0,0404 | 90,80 |

La evaluacion de KL y top-1 cubre 8.188 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano. Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21 GB en el formato BFP4 empaquetado para Tensix; en bf16 el modelo base ocupa 69,32 GB.
- GPU recomendadas: no se especifican en la model card; el destino principal son las NPU Tensix de Tenstorrent (Wormhole, Blackhole). Para ejecucion en GPU con transformers se requiere al menos una GPU con capacidad para el formato cargado (por encima de 70 GB en bf16, o bien cuantizaciones adicionales no documentadas).
- Cabe en GPU consumer: no en bf16; en el formato BFP4 empaquetado (20,991 GB) podria caber en GPU con 24 GB o mas, aunque el formato esta pensado para Tensix y no para CUDA.
- Opciones de despliegue: tt-metal v0.81.1 con ttnn, tt-forge y el runner tensix-runner; tambien transformers con `AutoModelForCausalLM` y `device_map="auto"`. No se documenta soporte de vLLM, llama.cpp u Ollama para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. La validacion se realizo sobre el simulador Blackhole (ttsim), no sobre hardware fisico con cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (bf16) | 35,95B (3B activos) | no disponible | bf16, 69,32 GB | Apache 2.0 | Hugging Face |
| **Este modelo (BFP4)** | 35,95B (3B activos) | no disponible | BFP4 Tensix, 20,991 GB | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | 35,95B (3B activos) | no disponible | GGUF Q4_K_M, 21,713 GB | Apache 2.0 | Generado desde el mismo checkpoint |
| BFP8 (mismo pipeline) | 35,95B (3B activos) | no disponible | `bfloat8_b` | Apache 2.0 | Empaquetado exacto segun la model card |

La comparativa se limita a variantes del mismo checkpoint porque no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una perdida de fidelidad medible: KL medio de 0,0501 frente a 0,0404 de Q4_K_M (1,24 veces peor) y top-1 del 89,62 % frente al 90,80 % de Q4_K_M.
- El formato esta disenado para NPU Tensix (Wormhole, Blackhole); no es un formato GGUF ni esta optimizado para CUDA, por lo que su uso en GPU requiere cargar los safetensors con transformers en bf16 y suficiente memoria.
- La validacion publicada se realizo sobre el simulador Blackhole (ttsim), no sobre hardware fisico; el rendimiento real en dispositivo puede diferir.
- La evaluacion de calidad cubre solo ingles y coreano; el comportamiento en castellano y otros idiomas no esta documentado.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas de esta variante; deben asumirse los del modelo base Qwen3.6-35B-A3B, no detallados en la informacion disponible.
- La longitud de contexto no se especifica en la model card; debe consultarse la del modelo base antes de usarla en produccion.
- Licencia Apache 2.0, que permite uso comercial; el aviso NOTICE lista los cambios respecto al modelo base. El autor declara no estar afiliado a Tenstorrent.
- El repositorio tiene 71,9 GB, muy superior al peso empaquetado de 20,991 GB, lo que implica un coste de almacenamiento y descarga considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.6-35B-A3B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo base (revision citada): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/345d467b117d1fd5eda9b879a5988de9ae5f47a7
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Codigo en revision concreta: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
