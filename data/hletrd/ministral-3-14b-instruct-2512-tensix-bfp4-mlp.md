# hletrd/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP

## Resumen

Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP es una cuantizacion del modelo de texto Ministral-3-14B-Instruct-2512-BF16 de Mistral AI, publicada por el usuario hletrd (Xylolabs) para su ejecucion en aceleradores Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa de 13.506.073.600 parametros del original, pero redondea sus capas lineales a formatos de coma flotante por bloques nativos del hardware: `ttnn.bfloat4_b` (BFP4) para las proyecciones MLP y `ttnn.bfloat8_b` (BFP8) para las proyecciones de atencion. El resultado es un checkpoint de 10,58 GB empaquetado con una media de 6,26 bits por peso.

La relevancia de esta ficha es doble. Por un lado, demuestra un flujo de cuantizacion orientado a un backend especifico de NPU (TT-NN de tt-metal), en lugar de los formatos GGUF o GPTQ convencionales para GPU. Por otro, elimina la torre de vision del modelo multimodal original, dejando unicamente el submodelo de lenguaje como `Ministral3ForCausalLM`. El checkpoint esta pensado para cargarse en un unico chip Blackhole P150 mediante tt-transformers y no requiere re-redondeo en el momento del empaquetado, ya que todos los valores ya descansan sobre la rejilla BFP4/BFP8.

Se trata de un modelo instructivo, conversacional y multilingue (once idiomas declarados), con licencia Apache 2.0 heredada del modelo base. No obstante, el autor advierte que las pruebas de ejecucion se han hecho sobre el simulador `ttsim` con ttnn 0.81.1 y no sobre hardware fisico, y que tt-forge (tt-xla) aun no se ha probado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Ministral 3, `Ministral3ForCausalLM`), solo texto |
| Parametros totales | 13.506.073.600 (13,5 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base aplica query scaling mas alla de 16.384 tokens) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atencion; bf16 en embeddings, LM head y normas; media de 6,26 bits/peso |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores ya sobre rejilla BFP4/BFP8), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del checkpoint BF16 de Mistral AI. Mantiene las 40 capas del transformer original con atencion multi-cabeza y MLP de tres proyecciones (gate, up, down). La innovacion tecnica no esta en la arquitectura, sino en el esquema de compresion: cada matriz lineal se redondea a un formato de coma flotante por bloques con exponente compartido por bloque, de modo que TT-NN puede empaquetar los pesos directamente en la NPU sin volver a redondear. Las proyecciones q, k, v y o de las 40 capas usan BFP8 (8,5 bits por peso) y las proyecciones gate, up y down de las 40 capas usan BFP4 (4,5 bits por peso). El resto de tensores (embeddings, LM head, normas) permanece en bf16.

El proceso de cuantizacion emplea GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El autor no documenta el entrenamiento original del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO), por lo que esos datos deben consultarse en la model card de Mistral AI. El checkpoint publicado es exclusivamente de texto: la torre de vision y su proyector se han eliminado y el `config.json` corresponde al `text_config` del modelo base adaptado a `Ministral3ForCausalLM`.

## Capacidades

- Generacion de texto conversacional e instructiva, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas en once idiomas: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base Ministral 3 Instruct, aunque no se documentan resultados especificos en esta ficha.
- Soporte de tool calling y function calling: heredado del modelo base, no verificado de forma independiente en esta cuantizacion.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, no verificadas en esta cuantizacion.
- Sin capacidades de vision: la torre de vision y el proyector han sido eliminados explicitamente.
- Sin modo thinking explicito documentado en la informacion disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso de uso principal es ejecutar el modelo en NPU Wormhole o Blackhole mediante tt-metal y tt-transformers, con un unico chip Blackhole P150 para el checkpoint completo de 10,58 GB empaquetados.
- Investigacion en cuantizacion por bloques: sirve como referencia reproducible para estudiar el impacto de BFP4/BFP8 en la fidelidad respecto a BF16, con scripts `pack_tensix.py` y `verify_grid.py` que permiten comprobar que ningun valor cambia al empaquetar.
- Asistentes conversacionales multilingues: el soporte de once idiomas y la plantilla de chat permiten construir bots de atencion al cliente en espanol, frances, aleman, arabe o japones sobre hardware de bajo consumo energetico.
- Generacion de codigo en pipelines internos: al conservar las capacidades instructivas del base, puede integrarse en flujos de autocompletado o revision de codigo, siempre que se valide la calidad tras la cuantizacion BFP4 en las capas MLP.
- Procesamiento de documentos en entornos con restricciones de memoria: los 10,58 GB empaquetados frente a los 27,01 GB del BF16 facilitan el despliegue en nodos con DRAM limitada, a costa de una perdida media de KL de 0,01849.
- Evaluacion comparativa de backends: util para contrastar el rendimiento de TT-NN frente a llama.cpp (Q4_K_M) en terminos de fidelidad al BF16, ya que el autor publica ambas metricas sobre el mismo conjunto de 12.104 posiciones.
- Prototipado de agentes con tool calling en hardware no-GPU: permite explorar arquitecturas de agentes sobre NPU, aunque el soporte de herramientas debe validarse empiricamente en esta cuantizacion.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 27,01 | 0 | 100 | 30 de 33 | - |
| **Este modelo (BFP4/BFP8)** | 6,26 | 10,576 | 0,01849 | 93,78 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,88 | 8,239 | 0,01473 | 93,89 | 29 de 33 | 0 |

Las metricas de KL y top-1 cubren 12.104 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. Las 33 respuestas corresponden a prompts cortos con comprobacion automatica. El autor aclara que estas cifras miden cercania al BF16, no calidad de tarea, y que no se ha medido velocidad en dispositivo. El criterio de aceptacion fijado (KL medio como maximo 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional) se cumple: 1,26 veces y cero perdidas frente a cero.

## Requisitos de hardware

- VRAM/DRAM estimada: 10,58 GB empaquetados en BFP4/BFP8; el repositorio en disco ocupa 27,0 GB porque los safetensors se almacenan en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent, modelos Wormhole y Blackhole. El autor indica que el checkpoint se carga en un unico Blackhole P150 con tt-transformers (tt-metal v0.81.1).
- GPU consumer: no es el objetivo del checkpoint; puede cargarse en GPU mediante `transformers` con `device_map="auto"` y `dtype="bfloat16"`, requiriendo al menos 27 GB de VRAM en bf16, lo que excluye la mayoria de tarjetas consumer.
- Opciones de despliegue: tt-metal v0.81.1 con tt-transformers (demo `simple_text_demo.py`), y `transformers` estandar para inferencia en GPU/CPU. tt-forge (tt-xla) aun no se ha probado con este checkpoint. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato BFP.
- Latencia y throughput: no disponibles. El autor declara explicitamente que no se ha medido velocidad en dispositivo y que las pruebas se hicieron sobre el simulador `ttsim`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP | 13,5 B | no disponible | 6,26 | 10,58 GB | Apache 2.0 | Hugging Face, orientado a Tensix |
| Ministral-3-14B-Instruct-2512-BF16 (base) | 13,5 B | no disponible | 16 | 27,01 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 13,5 B | no disponible | 4,88 | 8,239 GB | Apache 2.0 | Generado por el autor, no publicado como repo independiente en la informacion disponible |

La comparativa se limita al modelo base y a la cuantizacion Q4_K_M generada por el propio autor, ya que no se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada. Frente al BF16, este checkpoint reduce el tamano un 60,8 % con una perdida de KL de 0,01849 y sin respuestas perdidas en el conjunto de 33 prompts. Frente a Q4_K_M, ocupa un 28,4 % mas pero mantiene una respuesta correcta adicional en la evaluacion del autor.

## Limitaciones y advertencias

- Solo texto: la torre de vision y su proyector han sido eliminados, por lo que no puede procesar imagenes.
- No probado en hardware fisico: las pruebas se realizaron sobre el simulador `ttsim` con ttnn 0.81.1; el rendimiento real en Wormhole o Blackhole no esta verificado.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- En tt-transformers es obligatorio pasar `--use_hf_rope`; sin ello, el QKV fusionado se re-redondea y los resultados difieren.
- El demo de tt-transformers empaqueta la LM head en bfloat8_b, por lo que la cabeza no es exacta en ese entorno.
- tt-transformers no aplica el query scaling de Ministral 3 mas alla de 16.384 tokens, de modo que las salidas largas difieren de la referencia BF16.
- La cuantizacion BFP4 en las capas MLP introduce un sesgo de redondeo medible: KL medio de 0,01849 frente a BF16, con top-1 del 93,78 %.
- Riesgo de alucinacion: inherente al modelo base; no se documentan evaluaciones de veracidad en esta cuantizacion.
- Sesgos: no documentados en la informacion proporcionada; deben consultarse en la model card de Mistral AI.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara no estar afiliado ni respaldado por Tenstorrent ni por Mistral AI.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Revision del modelo base citada por el autor: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16/tree/3cea74c1ebaf5ce5f5a2553de470e2ceab825142
- Repositorio tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Documentacion de instalacion de tt-metal: `INSTALLING.md` dentro del repositorio tt-metal
- Demo de referencia: `models/tt_transformers/demo/simple_text_demo.py` dentro de tt-metal
- Scripts incluidos en el repo: `pack_tensix.py`, `verify_grid.py`, `quant4.json`, `model.safetensors.index.json`
