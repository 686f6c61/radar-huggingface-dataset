# hletrd/gemma-4-12B-it-Tensix-BFP8

## Resumen

`hletrd/gemma-4-12B-it-Tensix-BFP8` es una cuantizacion del modelo multimodal `google/gemma-4-12B-it` de Google, publicada por Xylolabs (usuario de Hugging Face `hletrd`). El modelo conserva la arquitectura y los pesos originales en bf16, pero las capas lineales de atencion y MLP (q, k, v, o, gate, up, down) de las 48 capas del transformer de lenguaje se han redondeado a la rejilla `bfloat8_b` (BFP8) propia de los aceleradores Tenstorrent Tensix mediante GPTQ. El objetivo no es reducir el modelo para GPUs convencionales, sino empaquetarlo de forma que TT-NN lo cargue directamente en las NPU Wormhole y Blackhole sin re-redondeo adicional.

El resultado ocupa 13,60 GB empaquetados (9,13 bits por peso de media) frente a los 23,81 GB del checkpoint BF16 original, con una divergencia respecto al modelo base muy baja: KL media de 0,00183 y 98,35 % de top-1 sobre 8.048 posiciones de texto en ingles y coreano. La licencia es Apache-2.0, lo que facilita su uso comercial. El repositorio tiene 12.966.363.184 parametros totales segun los safetensors.

Es relevante porque ejemplifica un flujo de cuantizacion especifico de hardware (block floating point sobre Tensix) y porque publica una metodologia de verificacion reproducible (round-trip bit a bit contra la rejilla BFP8) y una evaluacion comparativa frente a Q4_K_M de llama.cpp. Conviene senalar que, segun la propia model card, el modelo solo se ha probado en el simulador `ttsim` de Blackhole con ttnn 0.81.1, no en hardware fisico, y que unicamente se ha redondeado y evaluado el modelo de lenguaje, no las torres de vision ni audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, tipo `gemma4_unified`); capas lineales cuantizadas a BFP8 |
| Parametros totales | 12.966.363.184 (12,97 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en q/k/v/o y gate/up/down); LM head, embeddings, normas y `embed_audio`/`embed_vision`/`vision_embedder` en bf16. Media de 9,13 bits por peso. El repo incluye `quant4.json` con el formato de cada proyeccion (soporta `bfp4`/`bfp8`) |
| Idiomas soportados | no disponible en la informacion proporcionada (la evaluacion usa texto en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 en disco, con valores ya alineados a la rejilla BFP8); repo de 26,0 GB; 13,60 GB empaquetados |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer multimodal de tipo `gemma4_unified` con pipeline `any-to-any` (entrada y salida de imagen, texto y audio). Este repositorio no reentrena el modelo: aplica GPTQ para redondear las proyecciones lineales de atencion y MLP de las 48 capas del modelo de lenguaje a la rejilla block-floating-point `bfloat8_b` de Tenstorrent, en la que cada bloque comparte un exponente. El calibrado se hizo con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores se guardan en bf16 pero ya situados sobre la rejilla BFP8, de modo que el empaquetador de TT-NN no vuelve a redondear.

La innovacion tecnica principal es el acoplamiento entre el formato de pesos y el formato nativo del acelerador: TT-NN lee los pesos como `[in, out]`, por lo que el pipeline transpone antes de empaquetar. El repositorio incluye scripts de verificacion (`pack_tensix.py` y `verify_grid.py`) que comprueban, matriz a matriz, que el round-trip por `ttnn.as_tensor` con `bfloat8_b` devuelve exactamente los mismos valores que el tensor de origen. Para tt-metal se documenta una entrada de `precision_overrides.json` que empaqueta atencion y MLP en `bfp8` de forma exacta, incluidas las proyecciones fusionadas q|k|v y gate|up (verificado en las dos primeras capas). No se documentan fases de RLHF o DPO adicionales en este repositorio; esas etapas corresponden al modelo base de Google.

## Capacidades

- Generacion de texto y razonamiento conversacional, con modo de pensamiento (thinking) segun la evaluacion del autor, que repite 7 prompts de razonamiento con thinking activado.
- Procesamiento multimodal any-to-any: entrada de imagen y audio (tensores `embed_vision`, `embed_audio`, `vision_embedder` conservados en bf16), heredado de Gemma 4.
- Respuesta a instrucciones en formato chat mediante `apply_chat_template`.
- Capacidades multilingues heredadas del modelo base (la evaluacion cubre ingles y coreano; el resto de idiomas no esta detallado).
- Compatibilidad con el ecosistema Transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).
- Despliegue nativo en Tenstorrent Tensix via TT-NN (`ttnn.bfloat8_b`) y en TT-Forge/tt-xla (soporte de Gemma 4 aun no validado).
- Tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en aceleradores Tenstorrent: el caso principal. Cargar el modelo en una Blackhole P150 o en Wormhole usando TT-NN con los pesos ya alineados a BFP8, evitando el redondeo en tiempo de carga y reduciendo el espacio en DRAM de 23,81 a 13,60 GB.
- Despliegue multimodal en el borde o en servidores con NPU: al conservar las torres de vision y audio en bf16, permite tareas image-text-to-text y any-to-any en hardware Tensix sin reentrenar ni recuantizar esas torres.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` sirven como referencia para verificar bit a bit que un checkpoint GPTQ sobre rejilla BFP8 se empaqueta sin perdida adicional antes de llevarlo a produccion.
- Investigacion en formatos block-floating-point: util como punto de comparacion reproducible (KL 0,00183, top-1 98,35 % frente a BF16) para estudiar el impacto de BFP8 y BFP4 en calidad frente a esquemas como Q4_K_M.
- Prototipado de asistentes conversacionales en ingles y coreano: la evaluacion cubre ambos idiomas con 40 preguntas de respuesta automatica, lo que da una referencia de fidelidad para entornos de habla coreana.
- Benchmarking de precision en tt-metal: la entrada documentada para `precision_overrides.json` permite medir el rendimiento del demo Gemma 4 de tt-metal con pesos BFP8 exactos frente a la carga por defecto en bf16.
- Experimentacion con TT-Forge/tt-xla: util para evaluar la diferencia entre el empaquetado nativo `[in, out]` de este repo y la opcion `bfp_bf8` de tt-xla, que re-redondea entre el 8 % y el 25 % de los valores.

## Benchmarks y rendimiento

Datos publicados por el autor (evaluacion solo del modelo de lenguaje):

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-12B-it`) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP8)** | 9,13 | 13,596 | 0,00183 | 98,35 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp v0.9.0) | 4,95 | 7,381 | 0,16924 | 85,52 | 40 de 40 | 0 |

Metodologia: KL y top-1 sobre 8.048 posiciones de WikiText-2 (test) y Wikipedia en coreano, en plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica mas 7 de razonamiento con thinking activado (40 en total). Q4_K_M se genero desde el mismo checkpoint sin importance matrix (sha256 `94baa8b5f0f9601ebeb7e961be3dd7d39b3fb15f316902c914f89...`). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 13,60 GB empaquetados en BFP8; 26,0 GB de repositorio en disco. En BF16 de referencia, 23,81 GB.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole y Blackhole). El demo de tt-metal v0.81.1 ejecuta E2B, E4B y 12B en una sola Blackhole P150.
- Estado de validacion: probado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), **no en hardware fisico**.
- GPUs consumer: no es el objetivo del repositorio; para ejecucion en GPU convencional habria que recurrir al checkpoint BF16 original o a una cuantizacion GGUF/AWQ equivalente, no incluida aqui.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), TT-NN (`ttnn.as_tensor` con `bfloat8_b`), tt-metal (demo Gemma 4 v0.81.1 con `precision_overrides.json`), TT-Forge/tt-xla (Gemma 4 aun no ejecutado).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Calidad (KL vs BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este modelo (BFP8)** | 12,97 B | no disponible | BFP8 Tensix, 9,13 bits | 0,00183 | Apache-2.0 | Hugging Face |
| `google/gemma-4-12B-it` (BF16) | 12,97 B | no disponible | bf16, 16 bits | 0 (referencia) | Apache-2.0 (segun este repo) | Hugging Face |
| Q4_K_M (llama.cpp) del mismo checkpoint | 12,97 B | no disponible | GGUF, 4,95 bits | 0,16924 | Apache-2.0 | generado por el autor |

La comparativa se limita a variantes del mismo modelo base porque no se han proporcionado datos de modelos alternativos de tamano similar. Frente a Q4_K_M, este modelo ocupa casi el doble (13,60 GB frente a 7,38 GB) pero reduce la KL en dos ordenes de magnitud y recupera 12,8 puntos de top-1; a cambio, esta atado al ecosistema Tensix.

## Limitaciones y advertencias

- Solo se ha redondeado y evaluado el modelo de lenguaje; las torres de vision y audio se conservan en bf16 sin evaluacion publicada.
- No se ha ejecutado en hardware Tensix real: la validacion es sobre el simulador `ttsim` con ttnn 0.81.1. El rendimiento real en Wormhole/Blackhole no esta medido.
- TT-Forge/tt-xla no se ha probado con Gemma 4; su opcion `bfp_bf8` re-redondea entre el 8 % y el 25 % de los valores de este repositorio (medido en las dos primeras capas), lo que degrada la fidelidad.
- El calibrado GPTQ uso solo WikiText-2 y Wikipedia en coreano (65.536 tokens); el comportamiento en otros dominios o idiomas puede diferir.
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta cuantizacion; se heredan los del modelo base Gemma 4, no detallados en la informacion disponible.
- Longitud de contexto e idiomas soportados no se indican en la model card.
- La licencia declarada es Apache-2.0, pero conviene verificar los terminos del modelo base `google/gemma-4-12B-it` antes de un uso comercial, ya que las condiciones de Gemma pueden imponer restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-12B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Revision del checkpoint base citada: https://huggingface.co/google/gemma-4-12B-it/tree/43c9d014b231474fa7212dbb48a762566c2b255d
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia del repositorio: https://huggingface.co/hletrd/gemma-4-12B-it-Tensix-BFP8/blob/main/LICENSE
