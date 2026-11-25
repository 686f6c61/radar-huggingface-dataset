# electroglyph/Inkling-2-Mini-uncensored

## Resumen

Inkling-2-Mini-uncensored es una variante "decensored" (abliterated) del modelo multimodal thinkingmachines/Inkling-2-Mini, desarrollada por el usuario electroglyph mediante la herramienta Heretic v2.2.0.dev0. El modelo base lo publicó Thinking Machines Lab el 20 de noviembre de 2026 bajo licencia Apache 2.0, y esta version elimina total o parcialmente el comportamiento de rechazo (refusals) mediante una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 1 a 19.

Arquitectonicamente es un transformer decoder-only de 24 capas con capas feed-forward de tipo Mixture-of-Experts disperso (8 de 128 expertos por token). Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token. Es nativamente multimodal: acepta texto e imagen y genera texto, con una ventana de contexto de hasta 1M tokens. Cuenta con 26.4B parametros totales y 3.4B activos por pasada, lo que resulta en unos 5.4B parametros efectivos activos por token dado el bucle de tres pasadas.

La relevancia de esta variante radica en que reduce los rechazos de 100/100 a 2/100 en la evaluacion del autor, con una divergencia KL de 0.0761 respecto al modelo original. Se distribuye en precisiones mixtas NVFP4 y MXFP8, en un unico checkpoint de unos 20 GB, lo que permite ejecucion en hardware local de consumo (DGX Spark, Apple Silicon con 32 GB o mas, GPUs con 32 GB de VRAM). El repositorio de Hugging Face ocupa 130.4 GB e incluye material para reproducir el proceso de ablacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y bucle de capas (looped transformer) |
| Parametros totales | 26.4B |
| Parametros activos | 3.4B por pasada; ~5.4B efectivos por token (tres pasadas) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint original); GGUF cuantizado disponible via Unsloth y llama.cpp |
| Idiomas soportados | Ingles y soporte multilingue general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible para llama.cpp/Ollama |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 24 capas con capas MoE dispersas: cada token se enruta a 8 de 128 expertos por capa. Las 12 capas centrales se reutilizan tres veces con pesos compartidos, generando 48 aplicaciones de capa por token; segun el autor, cada pasada adicional por las capas en bucle anade aproximadamente 1.0B de parametros activos efectivos. La atencion combina capas locales y globales. La multimodalidad es nativa: un vision transformer codifica las imagenes y proyecta las representaciones al mismo espacio oculto que el texto, procesandose conjuntamente por el decoder.

El entrenamiento del modelo base incluyo texto, imagenes y video, con datos de fuentes publicas de internet, terceros, generacion interna y datos sinteticos o aumentados. La model card no detalla el numero exacto de tokens ni si hubo RLHF o DPO. Esta variante concreta se obtiene aplicando Heretic v2.2.0.dev0 con ablacion de rango arbitrario sobre las capas 1 a 19, con parametros como `preserve_good_behavior_weight` 0.0694, `steer_bad_behavior_weight` 0.0008, `overcorrect_relative_weight` 1.0122, `neighbor_count` 13 y `loss_mode` relativo. El proceso es reproducible y el repositorio incluye instrucciones en `reproduce/README.md`.

## Capacidades

- Generacion de texto conversacional e instrucciones generales en ingles y otros idiomas.
- Razonamiento multimodal: acepta imagenes (dimensiones optimas entre 40 px y 4096 px) y texto de forma conjunta.
- Soporte para sistemas agénticos y de uso de herramientas (tool use), segun la model card del modelo base.
- Asistencia de codigo en multiples lenguajes de programacion.
- Generacion aumentada por recuperacion (RAG) gracias a la ventana de 1M tokens.
- Comportamiento "uncensored": rechazos reducidos a 2/100 en la evaluacion del autor frente a 100/100 del original.
- Capacidad de fine-tuning posterior mediante Tinker, Miles y SkyRL.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (hasta 1M tokens) e incorporar capturas o imagenes enviadas por el usuario para resolver incidencias.
- Generacion de codigo en produccion: su soporte de tool calling permite integrarlo en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores a partir de logs.
- Analisis de documentos extensos con imagenes: procesamiento conjunto de PDFs escaneados, diagramas y texto en una sola ventana para tareas de extraccion y resumen.
- Asistentes de investigacion: consulta de corpus grandes y sintesis de informacion con referencias visuales, aprovechando el contexto de 1M tokens.
- Agentes autonomos multi-paso: orquestacion de herramientas y razonamiento encadenado en entornos donde se requiere baja tasa de rechazo (por ejemplo, flujos creativos o de redaccion sin restricciones de contenido).
- Despliegue en hardware local: inferencia en Apple Silicon con 32 GB o mas, DGX Spark o GPUs consumer de gama alta, util para prototipado y entornos con requisitos de privacidad.
- Fine-tuning especializado: adaptacion a dominios concretos (legal, medico, tecnico) usando Tinker o Miles sobre los pesos abiertos.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible corresponde a la ablacion, no a benchmarks academicos estandar:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (refusals) | 2/100 | 100/100 |
| Divergencia KL | 0.0761 | 0 (por definicion) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Checkpoint original: unos 20 GB en precisiones mixtas NVFP4 y MXFP8; se recomienda un minimo de 32 GB de VRAM o memoria unificada.
- Plataformas soportadas oficialmente: 1x NVIDIA DGX Spark, Apple Silicon con 32 GB o mas (MacBook, Mac mini, Mac Studio) y otras GPUs con 32 GB o mas de VRAM.
- Cabe en GPUs consumer de gama alta con 32 GB (por ejemplo, RTX 5090) y en configuraciones Apple Silicon de 32 GB en adelante.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Ollama y Exo Labs en Apple Silicon.
- Fine-tuning posterior: Miles y SkyRL.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-uncensored | 26.4B totales / 3.4B activos | 1M | Si | Apache 2.0 | Variante abliterated, 2/100 rechazos |
| thinkingmachines/Inkling-2-Mini | 26.4B totales / 3.4B activos | 1M | Si | Apache 2.0 | Modelo base con rechazos 100/100 |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La ablacion elimina el comportamiento de rechazo, lo que implica un mayor riesgo de generar contenido danino, ilegal o inapropiado sin filtros; no es adecuado para aplicaciones sin moderacion adicional.
- La divergencia KL de 0.0761 respecto al original indica un cambio medible en la distribucion de salida que puede afectar a la calidad en tareas sensibles.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- El soporte multilingue se describe como "general", sin lista cerrada de idiomas ni evaluaciones por idioma.
- Aunque la licencia es Apache 2.0, el modelo base remite a una politica de uso aceptable de Thinking Machines Lab que conviene revisar antes de uso comercial.
- El contexto de 1M tokens puede degradar el rendimiento en recuperacion de informacion en posiciones intermedias; no hay datos publicados al respecto.
- La model card del modelo base no detalla composicion del dataset ni procesos de alineacion (RLHF/DPO), lo que limita la evaluacion de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/Inkling-2-Mini-uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Heretic: https://heretic-project.org
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
