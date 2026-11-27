# hletrd/gpt-oss-20b-Tensix-BFP4-Experts

## Resumen

gpt-oss-20b-Tensix-BFP4-Experts es una cuantizacion del modelo openai/gpt-oss-20b realizada por hletrd (Xylolabs) especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer MoE de OpenAI con 20.914.757.184 parametros totales, disenado para generacion de texto y conversacion. Esta version reduce el peso de 41,83 GB en bf16 a 13,218 GB empaquetados para Tensix mediante cuantizacion de punto flotante por bloques (block floating point, BFP).

La innovacion principal reside en el esquema de cuantizacion mixta: las proyecciones de los expertos enrutados se cuantizan a `bfloat4_b` (BFP4) con GPTQ y busqueda de exponente por bloque, mientras que las proyecciones de atencion y la LM head se cuantizan a `bfloat8_b` (BFP8) por redondeo al mas cercano. El router, los embeddings y las normas permanecen en bf16. Esto permite ejecutar el modelo en hardware Tensix con una perdida de fidelidad respecto a bf16 (KL media de 0,0636) ligeramente inferior a la de la cuantizacion MXFP4 de llama.cpp (0,0678).

Es relevante para quienes despliegan modelos en aceleradores Tenstorrent, ya que proporciona pesos ya empaquetados en el formato nativo de la NPU (ttnn.bfloat4_b / bfloat8_b), junto con las herramientas de empaquetado y verificacion. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gpt_oss) |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en expertos enrutados; BFP8 (`bfloat8_b`) en atencion y LM head; bf16 en router, embeddings y normas |
| Idiomas soportados | no disponible (evaluacion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetados para Tensix; repo de 41,9 GB, 13,218 GB empaquetados) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del gpt-oss-20b de OpenAI: un transformer con mezcla de expertos (MoE) en el que las proyecciones de los expertos enrutados (gate, up, down) se distribuyen en 24 capas. Esta version no reentrena el modelo; aplica cuantizacion post-entrenamiento sobre los pesos del modelo base. Las proyecciones de atencion q, k, v y o de las 24 capas se cuantizan a `bfloat8_b` por redondeo al mas cercano. Las proyecciones de los expertos enrutados se cuantizan a `bfloat4_b` con GPTQ y una busqueda de exponente por bloque (bloques de 16 a lo largo de las entradas); los expertos que vieron pocos tokens de calibracion se cuantizaron por redondeo al mas cercano. El router se mantiene en bf16, la LM head en `bfloat8_b` y los embeddings y normas en bf16.

La innovacion tecnica es el empaquetado directo en los formatos de bloque de Tenstorrent (`ttnn.bfloat4_b`, `ttnn.bfloat8_b`), verificado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim). El repositorio incluye `quant4.json`, que lista el formato de cada proyeccion, y las herramientas `pack_tensix.py` y `verify_grid.py` (de Xylolabs) para empaquetar y verificar matrices. No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composicion del dataset del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, uso con `apply_chat_template`).
- Razonamiento y generacion de codigo heredados del modelo base gpt-oss-20b (no se detallan capacidades especificas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la evaluacion cubre texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), pero no se declara una lista de idiomas soportados.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Ejecucion en NPU Tensix (Wormhole, Blackhole) mediante kernels y runner propios (tensix-kernels, tensix-runner).

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo se empaqueta directamente en `ttnn.bfloat4_b` y `bfloat8_b`, lo que permite cargar las matrices en DRAM de la NPU sin conversion adicional, reduciendo el peso a 13,218 GB frente a 41,83 GB en bf16.
- Inferencia de texto en entornos con memoria limitada: la reduccion de tamano permite alojar el modelo en dispositivos Tensix con menos DRAM, manteniendo una fidelidad cercana a bf16 (KL media de 0,0636).
- Sustitucion de cuantizaciones GGUF/MXFP4 en pipelines Tensix: ofrece una alternativa nativa al GGUF de llama.cpp con precision comparable (top-1 del 81,90 % frente al 82,65 % de MXFP4) y menor KL media.
- Verificacion y validacion de formatos de cuantizacion: las herramientas `pack_tensix.py` y `verify_grid.py` permiten comprobar cada matriz empaquetada y su ida y vuelta por DRAM del dispositivo, util en pipelines de CI para hardware Tensix.
- Prototipado en simulador: se ha validado con ttnn 0.81.1 sobre ttsim (simulador Blackhole), lo que permite desarrollar y depurar kernels sin hardware fisico.
- Generacion de texto conversacional: el modelo se usa con la plantilla de chat del tokenizer y `generate`, adecuado para asistentes y respuestas de texto en ingles y coreano.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (openai/gpt-oss-20b) | 41,83 | 0 | 100 |
| Este modelo (BFP4 experts / BFP8 attention) | 13,218 | 0,0636 | 81,90 |
| MXFP4 (llama.cpp, ggml-org/gpt-oss-20b-GGUF) | 12,110 | 0,0678 | 82,65 |

Las metricas de KL y top-1 se calculan sobre 8.188 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), como texto plano. El BF16 de llama.cpp presenta una KL media de 0,0435 respecto al de este modelo, por lo que cada lado se mide contra su propio BF16. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 13,218 GB empaquetados para Tensix; el repo completo ocupa 41,9 GB (incluye pesos en bf16 y empaquetados).
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole). Validado con ttnn 0.81.1 sobre ttsim (simulador Blackhole).
- GPU consumer: no disponible; el modelo esta orientado a NPU Tensix, no a GPU convencionales.
- Despliegue: ttnn (tt-metal), tensix-kernels v0.1.0 y tensix-runner v0.1.0; carga en transformers con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL media a BF16 | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Este modelo (BFP4/BFP8) | 20.914.757.184 | no disponible | 13,218 GB | 0,0636 | Apache 2.0 | Tensix |
| MXFP4 (llama.cpp GGUF) | 20.914.757.184 (base) | no disponible | 12,110 GB | 0,0678 | Apache 2.0 | CPU/GPU (llama.cpp) |
| BF16 (openai/gpt-oss-20b) | 20.914.757.184 | no disponible | 41,83 GB | 0 | Apache 2.0 | GPU/CPU |

La comparativa se limita a las variantes del mismo modelo base presentes en la informacion disponible; no se aportan datos de otros modelos de tamano o tarea similares.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad: KL media de 0,0636 y top-1 del 81,90 % frente al 100 % de bf16.
- El modelo esta empaquetado para Tensix; su uso fuera de hardware Tenstorrent requiere las herramientas de conversion o el modelo base.
- Los expertos con pocos tokens de calibracion se cuantizaron por redondeo al mas cercano, lo que puede degradar su precision de forma desigual.
- No se declara una lista de idiomas soportados; la evaluacion solo cubre ingles y coreano.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; heredados del modelo base gpt-oss-20b.
- Licencia Apache 2.0 con la politica de uso del modelo base (`USAGE_POLICY`); revisar `NOTICE` para los cambios introducidos.
- No se dispone de datos de benchmarks de tareas ni de latencia/throughput en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/gpt-oss-20b-Tensix-BFP4-Experts
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release v0.1.0 (cuantizacion y verificacion): https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels Tensix v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner Tensix v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- GGUF MXFP4 de referencia: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Paper referenciado: arXiv:2508.10925
