# hletrd/gemma-4-E2B-it-Tensix-BFP4-MLP

## Resumen

gemma-4-E2B-it-Tensix-BFP4-MLP es una cuantizacion del modelo multimodal google/gemma-4-E2B-it, publicada por el usuario hletrd (con codigo y formato de Xylolabs), especificamente empaquetada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la estructura del Gemma 4 E2B instruct original, pero reduce el peso de las proyecciones MLP a `bfloat4_b` (block floating point de 4 bits) y las proyecciones de atencion a `bfloat8_b`, manteniendo en bf16 el LM head, los embeddings, las normas y las torres de vision y audio.

El problema que resuelve es la brecha entre los formatos de cuantizacion convencionales (GGUF, GPTQ en enteros) y el hardware Tensix, que opera de forma nativa con block floating point. El resultado es un artefacto de 6,796 GB empaquetado para Tensix, frente a los 9,29 GB en bf16, con una divergencia KL media respecto a bf16 de 0,12669 (frente a 0,29329 de un Q4_K_M de llama.cpp) y un top-1 del 86,22 % en la evaluacion del autor.

Es relevante porque demuestra que es posible cuantizar a 4 bits efectivos con GPTQ y busqueda de exponente por bloque preservando mas fidelidad que una cuantizacion de enteros de 4 bits convencional, y porque abre la puerta a desplegar un modelo multimodal de 5.525 millones de parametros en aceleradores de inferencia de bajo consumo. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, imagen, audio) con atencion y MLP; cuantizado para Tensix |
| Parametros totales | 5.525.831.235 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atencion q/o y k/v; bf16 en LM head, embeddings, normas, torres de vision y audio |
| Idiomas soportados | no disponible (la evaluacion usa ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (packed para Tensix; compatible con transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo any-to-any que integra una torre de vision (`vision_tower`, `embed_vision`), una torre de audio (`audio_tower`, `embed_audio`) y un cuerpo de lenguaje. La model card indica que la atencion se distribuye en 35 capas con proyecciones q/o y 15 capas con proyecciones k/v, y que el MLP se compone de gate, up y down en 35 capas. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO.

La innovacion tecnica de esta publicacion es el pipeline de cuantizacion: las proyecciones MLP se cuantizan a `bfloat4_b` mediante GPTQ con busqueda de exponente por bloque, mientras que las proyecciones de atencion se cuantizan a `bfloat8_b` con redondeo al mas cercano. El empaquetado se realiza con las herramientas `pack_tensix.py` y `verify_grid.py` del repositorio tensix-bfp-gptq, que verifican la equivalencia bit a bit de cada matriz empaquetada contra la representacion en torch. La model card indica que los mismos valores tambien se empaquetan de forma exacta en `ttnn.bfloat8_b`, lo que permite un modo de respaldo en bf8.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen a texto (image-text-to-text) mediante la torre de vision en bf16.
- Procesamiento de audio a texto mediante la torre de audio en bf16.
- Razonamiento y respuesta a preguntas generales, heredado del modelo instruct base.
- Capacidad multilingue (la evaluacion cubre ingles y coreano; el resto de idiomas no esta documentado).
- Ejecucion en NPU Tensix (Wormhole, Blackhole) mediante ttnn, con kernels y runner propios.
- Inferencia estandar en transformers con `device_map="auto"` y `dtype="bfloat16"`.
- Soporte de tool calling y agentes: no documentado en la informacion disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo esta empaquetado para Wormhole y Blackhole y puede cargarse con ttnn 0.81.1, lo que permite ejecutar un modelo multimodal de 5,5B en hardware de inferencia de bajo consumo sin recurrir a GPU convencionales.
- Asistentes multimodales en el borde: al conservar las torres de vision y audio en bf16, puede gestionar entradas de imagen y audio en aplicaciones de asistencia en tiempo real donde el espacio de memoria es limitado (6,796 GB empaquetados).
- Procesamiento de documentos con imagen: la combinacion de vision y lenguaje permite extraer y resumir informacion de capturas, formularios o graficos en un pipeline de digitalizacion.
- Transcripcion y analisis de audio: la torre de audio permite convertir voz a texto y responder preguntas sobre el contenido, util en actas de reunion o atencion telefonica.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la fidelidad de BFP4 frente a Q4_K_M, con metricas KL y top-1 publicadas, en laboratorios que investigan formatos de cuantizacion para NPU.
- Prototipado en simulador: la model card verifica el empaquetado en `ttsim`, el simulador de Blackhole, lo que permite validar kernels y flujos sin hardware fisico.
- Chat multilingue ligero: con soporte documentado en ingles y coreano, puede integrarse en servicios de atencion al cliente que operen en esos idiomas con requisitos de memoria reducidos.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-E2B-it) | 9,29 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atencion) | 6,796 | 0,12669 | 86,22 |
| Q4_K_M (llama.cpp) | 3,428 | 0,29329 | 80,25 |

Las metricas KL y top-1 se calculan sobre 7.968 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con la plantilla de chat. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. No se han publicado resultados en benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en transformers: el repo ocupa 11,1 GB; en bf16 el modelo pesa 9,29 GB, por lo que se recomienda al menos 12 GB de VRAM para cargarlo completo en GPU.
- GPU recomendadas para transformers: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB); cabe en consumer GPU de gama alta como la RTX 4090.
- NPU objetivo: Tenstorrent Wormhole y Blackhole, con ttnn 0.81.1; verificado en el simulador ttsim.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`; ttnn para Tensix con `tensix-runner v0.1.0`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 MLP) | 5.525.831.235 | no disponible | safetensors Tensix | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (bf16) | 5.525.831.235 | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 5.525.831.235 | no disponible | GGUF | Apache 2.0 | generado por el autor |

La comparativa se limita al mismo checkpoint en distintos formatos, ya que la informacion disponible no incluye datos de modelos alternativos de otros desarrolladores. Frente a bf16, este modelo reduce el tamano un 26,8 % (9,29 a 6,796 GB) a costa de un top-1 del 86,22 %; frente a Q4_K_M, es un 98,2 % mas grande (6,796 frente a 3,428 GB) pero con menos de la mitad de divergencia KL (0,12669 frente a 0,29329).

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce perdida de fidelidad: el top-1 cae al 86,22 % respecto a bf16, lo que puede degradar tareas sensibles a la precision numerica.
- El repositorio tiene 0 likes y 199 descargas, y fue creado en noviembre de 2026; no hay evidencia de validacion independiente fuera del autor.
- La evaluacion se limita a 7.968 posiciones de ingles y coreano; el comportamiento en otros idiomas no esta documentado.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto en la informacion disponible.
- El modelo esta empaquetado para Tensix; el uso en GPU requiere cargarlo con transformers en bf16, lo que anula la ventaja de tamano del formato BFP.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base no incluye fichero LICENSE en su repositorio; el autor aporta el texto estandar y un NOTICE con los cambios.
- El soporte de tool calling y agentes no esta documentado, por lo que no debe asumirse en produccion sin verificacion.
- La verificacion en hardware real se realizo en el simulador ttsim, no necesariamente en silicio Wormhole o Blackhole.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-E2B-it-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arxiv:2607.02770
