# arelius/Inkling-2-Mini-Uncensored-Q2-3090-GGUF

## Resumen

Inkling-2-Mini-Uncensored-Q2-3090-GGUF es una cuantizacion GGUF de 2 bits orientada a velocidad del modelo Inkling 2 Mini de Thinking Machines Lab, en su variante "uncensored" producida por AtomicChat. El modelo original es un transformer con arquitectura MoE (mezcla de expertos) de 26.070.385.152 parametros totales, segun los pesos en safetensors. Esta version concreta la publica el usuario arelius y su proposito es permitir ejecutar el modelo en una unica GPU de consumo RTX 3090 con decodificacion de aproximadamente 200 tokens por segundo.

La relevancia de esta ficha radica en que demuestra una via practica para servir un MoE de 26B en hardware consumer de gama alta mediante una receta de cuantizacion por tensor: expertos en Q2_K y Q2_0 calibrado, capas superiores y proyecciones de atencion en IQ4_NL, embeddings en Q8_0 y componentes de control en F32. El resultado ocupa 9,25 GiB en disco y mantiene una perplexity cercana a la del modelo original de 4 bits.

Conviene subrayar que se trata de una cuantizacion de segundo orden: el punto de partida ya era un checkpoint de 4 bits de AtomicChat, por lo que el archivo ha pasado por dos rondas de cuantizacion. La edicion "uncensored" es un LoRA de rango 1 aplicado por AtomicChat sobre 49 puntos que escriben en el flujo residual, y elimina la direccion de rechazo de cada capa. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 24 capas, 48 pasadas de capa |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 65.536 tokens (flag `-c 65536` en la receta de ejecucion) |
| Tipos de cuantizacion | Q2_K, Q2_0 calibrado, IQ4_NL, Q8_0, F32 (mezcla por tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) organizado en 24 capas. La receta de cuantizacion revela la estructura interna: los expertos enrutados de las capas 0 a 19 usan tensores `ffn_gate_up_exps` y `ffn_down_exps`, mientras que las capas 20 a 23 se tratan como bloque diferenciado. Existen ademas componentes de control especificos del modelo, referidos en la documentacion como "router, loop controllers" y "loop controllers", lo que sugiere un mecanismo de control de bucle o iteracion interna, aunque no se detalla su funcionamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original de Thinking Machines Lab. La edicion uncensored de AtomicChat consiste en un LoRA de rango 1 aplicado sobre los 49 puntos que escriben en el flujo residual: la salida de atencion y los expertos enrutados de las 24 capas, mas el embedding de tokens. En cada capa se elimina la direccion de rechazo propia de esa capa. Esta cuantizacion, por su parte, no introduce cambios mas alla de la cuantizacion misma, segun declara el autor.

## Capacidades

- Generacion de texto conversacional en formato chat, con pipeline declarado `text-generation`.
- Razonamiento multi-paso y seguimiento de instrucciones, heredado del modelo base Inkling 2 Mini.
- Soporte de contexto largo de hasta 65.536 tokens, util para agentes de codigo y conversaciones extensas.
- Compatibilidad con API compatible con OpenAI a traves de llama-server, incluido el identificador de modelo `inkling-mini`.
- Integracion con OpenCode mediante la opcion `--opencode`, que genera la configuracion de proveedor.
- Comportamiento "uncensored": el modelo acepta peticiones que el original rechaza, por la edicion LoRA de AtomicChat.
- Solo texto: no incluye proyector de vision ni capacidades multimodales.
- No se documentan capacidades de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Agentes de codigo en local: con contexto de 16K a 48K tokens y una velocidad de 120-140 tok/s en esos rangos, el modelo es adecuado para bucles de agente que leen repositorios y editan archivos en una unica RTX 3090, integrándose en OpenCode mediante la configuracion que genera la herramienta.
- Servicio de chat con API compatible con OpenAI: el comando de arranque levanta un servidor en `127.0.0.1:8031/v1` con identificador `inkling-mini`, lo que permite sustituir un endpoint remoto por uno local sin cambiar el codigo cliente.
- Prototipado e investigacion de alineacion: al ser una variante uncensored, sirve para estudiar diferencias de comportamiento entre el modelo original y la edicion de AtomicChat, siempre con las salvaguardas adecuadas.
- Procesamiento de documentos largos: con 65.536 tokens de contexto se pueden resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Generacion de texto a alta velocidad para tareas por lotes: los 207,9 tok/s con contexto vacio permiten clasificar, etiquetar o reescribir grandes volumenes de texto en una sola GPU.
- Despliegue en estaciones de trabajo con una RTX 3090: el archivo de 9,25 GiB y las dependencias empaquetadas como wheels de CUDA permiten montar un servidor de inferencia sin toolkit de CUDA ni compilacion, usando `uvx`.
- Evaluacion de tecnicas de cuantizacion: la receta por tensor y las metricas de perplexity publicadas sirven como referencia para comparar estrategias de cuantizacion de MoE en hardware consumer.

## Benchmarks y rendimiento

| Modelo | Decodificacion tok/s, contexto vacio | a 1K de contexto | Prefill PPL (8x2048) | Decode PPL (2x1024, ubatch 1) |
|---|---:|---:|---:|---:|
| Inkling 2 Mini original, ggml-org IQ4_NL (referencia sin fusionar) | no disponible | no disponible | 2,9401 | 4,0660 |
| Build regular de 2 bits | 208,7 | 193,2 | 3,0530 | 4,1945 |
| Este modelo | 207,9 | 193,2 | 3,0571 | 4,1918 |

La velocidad cae a medida que se llena el contexto porque cada una de las 48 pasadas de capa relee la cache de atencion. El autor estima 120-140 tok/s en contextos de 16K a 48K. Las mediciones se realizaron con el fork `inkling-3090` de llama.cpp sobre una RTX 3090.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 9,25 GiB; con cache KV en q8_0 y 65.536 tokens de contexto se necesita margen adicional, por lo que una RTX 3090 de 24 GB es el objetivo declarado.
- GPU recomendadas: RTX 3090 (sm_86, Ampere); los kernels fusionados estan afinados para Ampere. Otras GPU no se documentan.
- Cabe en GPU consumer: si, en RTX 3090, que es el caso de uso disenado.
- Opciones de despliegue: llama.cpp con el fork `inkling-3090` (rama del repositorio de csaben), o llama.cpp estandar con soporte de Inkling 2 Mini (PR #32694), aunque mucho mas lento.
- Entorno: Linux con glibc >= 2.38, driver NVIDIA >= 570 y `uv`; no requiere toolkit de CUDA ni compilacion si se usa el comando `uvx`.
- Throughput: 207,9 tok/s con contexto vacio, 193,2 tok/s a 1K y 120-140 tok/s en contextos de 16K-48K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Q2, 3090) | 26.070.385.152 | 65.536 | GGUF, 2 bits mixto | Apache-2.0 | 207,9 tok/s en RTX 3090; PPL 3,0571 |
| Build regular de 2 bits (arelius) | 26.070.385.152 | 65.536 | GGUF, 2 bits mixto | Apache-2.0 | 208,7 tok/s; PPL 3,0530; cuantizado desde Q8_0 |
| Inkling 2 Mini original (ggml-org IQ4_NL) | 26.070.385.152 | no disponible | GGUF, IQ4_NL | Apache-2.0 | Referencia sin fusionar; PPL 2,9401 |
| AtomicChat Inkling-2-Mini-Uncensored-AD-Q4_K | 26.070.385.152 | no disponible | GGUF, Q4_K | Apache-2.0 | Fuente de esta cuantizacion; incluye la edicion uncensored |

## Limitaciones y advertencias

- Doble cuantizacion: el archivo parte de un checkpoint de 4 bits, por lo que la perplexity es aproximadamente un 4% superior a la del original de 4 bits. Conviene validarlo en las tareas propias.
- El comportamiento de rechazo proviene de la edicion de AtomicChat y el autor de esta cuantizacion no lo ha evaluado. El modelo cumplira peticiones que el original declina; la responsabilidad de uso recae en quien lo despliega.
- Solo texto: no hay proyector de vision.
- La velocidad depende de los kernels fusionados afinados para Ampere (sm_86) del fork; en otro hardware el rendimiento puede degradarse notablemente.
- La decodificacion se ralentiza con el contexto por las 48 pasadas de capa que releen la cache de atencion.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- Licencia Apache-2.0, que permite uso comercial, pero el caracter uncensored exige controles de contenido en produccion.
- El repositorio tiene 0 descargas y 1 like, por lo que no hay validacion comunitaria significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arelius/Inkling-2-Mini-Uncensored-Q2-3090-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Anuncio del modelo base: https://thinkingmachines.ai/news/inkling-2-mini/
- Edicion uncensored de AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Build regular de 2 bits: https://huggingface.co/arelius/Inkling-2-Mini-Q2-3090-GGUF
- Fork de llama.cpp: https://github.com/csaben/llama.cpp/tree/inkling-3090
- Commit del encoder Q2_0 calibrado: https://github.com/csaben/llama.cpp/commit/704a7da
- Release del servidor precompilado: https://github.com/csaben/llama.cpp/releases/tag/inkling-3090-v1
- Soporte de Inkling 2 Mini en llama.cpp estandar: https://github.com/ggml-org/llama.cpp/pull/32694
- llama.cpp: https://github.com/ggml-org/llama.cpp
