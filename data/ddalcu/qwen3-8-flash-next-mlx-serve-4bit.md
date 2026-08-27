# ddalcu/Qwen3.8-Flash-Next-MLX-Serve-4bit

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de codigo abierto desarrollado por Qwen, basado en la arquitectura Qwen4 (tipo `qwen4_exp`). Se trata de un MoE ultra-sparse de 125B parametros en el tronco principal, al que se anade una tabla de n-gram embedding de 51B parametros y una cabeza MTP de 4B, sumando 180B en total en bf16. Activa 6B parametros por token y soporta una ventana de contexto nativa de 262.144 tokens. El pack que nos ocupa, creado por ddalcu, es una conversion para mlx-serve con cuantizacion mixta (4-bit para expertos y atencion, 8-bit para lm_head) que permite ejecutar el modelo en un Mac con 128 GB de RAM unificada.

La relevancia de este modelo radica en su arquitectura innovadora: combina Gated DeltaNet (GDN) para compresion de historial, Qwen Sparse Attention (QSA) para recuperacion de largo alcance con coste de atencion constante, y un embedding por n-gramas que anade capacidad sin coste computacional. Ademas incluye una torre de vision para entrada de imagenes y video, y un modo de razonamiento (thinking) activado por defecto. Este pack concreto resuelve el problema de desplegar un modelo de 180B en hardware de consumo, reduciendo la huella de memoria a unos 75 GB residentes mediante cuantizacion y almacenamiento en mmap de la tabla n-gram.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), residual streams de 4 vias, n-gram embedding, MTP head, vision tower |
| Parametros totales | 180B en bf16 (125B trunk + 51B n-gram + 4B MTP); el pack cuantizado contiene 20.588.894.099 parametros en safetensors |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | 4-bit (expertos, atencion, GDN, hyper-connections, indexer, shared experts, embed_tokens, n-gram table), 8-bit (lm_head), bf16 (routers, inject gates, norms, convs, SSM state, vision tower) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (incluye `ngram_table.bin` en formato safetensors y `model-vision.safetensors` para la torre de vision) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next se aparta de los diseños MoE convencionales. El tronco principal usa 4 streams residuales de 2560 dimensiones cada uno; cada bloque lee una media sigmoide de los streams normalizados y escribe de vuelta mediante gates escalares por stream. Tres de cada cuatro capas emplean Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta utiliza Qwen Sparse Attention (QSA): pasados los primeros 2048 tokens, cada capa de atencion lee solo los 512 bloques de 4 tokens mas relevantes por query, mas su propio bloque parcial, lo que mantiene el coste de atencion plano con la longitud del contexto.

Adicionalmente, el modelo incorpora una tabla de n-gram embedding de 51B parametros, indexada por bigramas y trigramas hasheados de los token ids, con 16 cabezas de ~20M filas y 160 dimensiones por fila. Esta tabla se inyecta una vez antes de la capa 1 y actua como una consulta (lookup) sin coste computacional. Incluye tambien una cabeza MTP (Multi-Token Prediction) de 1 capa para decodificacion especulativa y una torre de vision estilo Qwen3-VL para entrada de imagenes y video. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineacion (RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento avanzado con modo "thinking" activado por defecto (desactivable con `"enable_thinking": false`).
- Entrada multimodal: procesa imagenes y video a traves de la torre de vision (model.visual.*) en bf16 denso.
- Tool calling / function calling con formato XML de Qwen3.8; mlx-serve parsea y coacciona el esquema automaticamente.
- Soporte de agentes y razonamiento multi-paso gracias al modo thinking y a la capacidad de llamar herramientas.
- Contexto largo de 262k tokens con atencion esparsa que mantiene el coste de atencion constante mas alla de 2048 tokens.
- Decodificacion especulativa mediante la cabeza MTP (aunque en la version actual de mlx-serve no es competitiva en velocidad).
- Capacidades multilingues: no especificadas en la documentacion disponible, aunque Qwen suele ofrecer soporte multilingue.

## Casos de uso

- Analisis de documentos extensos: con 262k tokens de contexto, puede procesar contratos, informes anuales o expedientes completos en una sola pasada, extrayendo clausulas, resumiendo secciones y respondiendo preguntas sobre cualquier parte del documento sin necesidad de dividirlo.
- Agentes autonomos con herramientas: el modo thinking combinado con tool calling permite construir agentes que planifican, ejecutan llamadas a APIs y razonan sobre los resultados en multiples pasos, por ejemplo para automatizar tareas de investigacion o gestion de datos.
- Asistente de codigo con contexto de repositorio: puede ingerir un repositorio completo (codigo, documentacion, tests) y generar parches, explicar arquitectura o detectar bugs, gracias a su ventana de contexto y a la atencion esparsa que prioriza los fragmentos relevantes.
- Busqueda y recuperacion en corpus grandes: la QSA permite que el modelo recupere informacion precisa en textos muy largos, como se demostro con la recuperacion de una aguja en la posicion 24.8k de un prompt de 25k tokens.
- Analisis multimodal de video e imagenes: la torre de vision permite transcribir, describir o responder preguntas sobre contenido visual, util para moderacion de contenido, generacion de subtitulos o asistencia a personas con discapacidad visual.
- Razonamiento cientifico y matematico: el modo thinking y la capacidad de razonamiento multi-paso lo hacen adecuado para resolver problemas complejos de matematicas, fisica o logica, con explicaciones detalladas del proceso.
- Chat conversacional con memoria larga: su contexto de 262k permite mantener conversaciones muy largas sin perder el hilo, adecuado para asistentes virtuales que necesitan recordar interacciones previas durante horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas mediciones publicadas corresponden al rendimiento en hardware Apple Silicon, obtenidas por el autor del pack en un M4 Max de 128 GB con mlx-serve:

| Metrica | Valor |
|---|---|
| Memoria residente | 67-69 GB (sin tuning) |
| Decode (serial) | 29-34 tok/s |
| Prefill (prompt de 25k tokens) | ~400 tok/s |
| Recuperacion de aguja (needle) | 24.8k tokens con sparse attention |
| MTP (decodificacion especulativa) | ~20 tok/s (no competitivo, desactivado por defecto) |

## Requisitos de hardware

- VRAM estimada: ~75 GB residentes mas KV cache en un Mac con 128 GB de RAM unificada. Con `--kv-quant 8` la cache se reduce a la mitad.
- GPU recomendadas: probado en Apple M4 Max de 128 GB. Para GPU NVIDIA, el modelo original (sin cuantizar) requiere al menos 360 GB en bf16, por lo que este pack cuantizado necesitaria una GPU con ~80 GB de VRAM (A100 80GB, H100 80GB) o varias GPU en paralelo.
- No cabe en GPU de consumo (24 GB o menos) debido al tamano del modelo y la tabla n-gram.
- Opciones de despliegue: mlx-serve (especifico para Apple Silicon) es el unico soportado para este pack. El modelo original puede ejecutarse con vLLM o SGLang, segun se menciona en la validacion de la conversion.
- Latencia y throughput: en M4 Max, decode serial de 29-34 tok/s y prefill de ~400 tok/s en prompts largos. No se han publicado datos para otros hardware.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos MoE de tamano similar (por ejemplo, Qwen3-235B-A22B o DeepSeek-V3) en terminos de benchmarks. A continuacion se presenta una comparacion cualitativa basada en parametros publicados:

| Modelo | Parametros totales | Activos por token | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (este pack) | 180B (125B trunk + 51B n-gram + 4B MTP) | 6B | 262k | qwen-community-1.0 |
| Qwen3-235B-A22B (referencia) | 235B | 22B | 32k (estimado) | apache-2.0 (segun ddalcu/Qwen3.8-27B) |
| Mixtral 8x22B (referencia) | 141B | 39B | 64k | apache-2.0 |

Nota: los datos de Qwen3-235B-A22B y Mixtral 8x22B son orientativos y no han sido verificados en la informacion proporcionada. La comparativa no incluye rendimiento por falta de benchmarks publicados.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgos para este modelo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han realizado evaluaciones especificas.
- Limitaciones de contexto: aunque la ventana es de 262k, la atencion esparsa puede perder informacion en ciertos patrones de recuperacion, aunque la prueba de aguja funciono a 24.8k tokens.
- Restricciones de licencia: la licencia qwen-community-1.0 debe revisarse para uso comercial; no es una licencia open source estandar.
- Limitaciones de mlx-serve: solo una peticion a la vez (sin batching), sin reutilizacion de prefix-cache entre turnos, sin PLD/DFlash speculation, y prompts muy largos (mas de ~64k) requieren reducir `--prefill-chunk`.
- MTP no es competitivo en velocidad en la version actual de mlx-serve; se recomienda dejarlo desactivado.
- Requiere hardware especifico: el pack esta disenado para Apple Silicon con al menos 128 GB de RAM unificada; no es portable a GPU NVIDIA sin reconversion.
- La tabla n-gram se almacena en un archivo separado (`ngram_table.bin`) y se accede via mmap; en prefill de prompts muy largos con cache fria puede anadir hasta ~1 segundo por cada 8k tokens de lecturas aleatorias en SSD.

## Enlaces

- Pack en HuggingFace: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Documentacion de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Tweet del autor sobre el rendimiento: https://x.com/ddalcu/status/2092652972845027444
- Repositorio de mlx-serve (mencionado en la model card, sin URL directa)
