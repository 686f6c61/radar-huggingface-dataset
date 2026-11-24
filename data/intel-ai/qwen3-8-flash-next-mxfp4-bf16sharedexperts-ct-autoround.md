# intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16SharedExperts-CT-AutoRound

## Resumen

Qwen3.8-Flash-Next-MXFP4-BF16SharedExperts-CT-AutoRound es una version cuantizada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el equipo intel-ai mediante la herramienta AutoRound de Intel. La cuantizacion aplica MXFP4 (formato de coma flotante de 4 bits con escala compartida por bloque) exclusivamente a los expertos enrutados de la arquitectura, mientras que mantiene en BF16 el resto de componentes criticos: atencion, router, embeddings, lm_head, torre de vision, experto compartido, MTP y tabla PLE. El resultado es un checkpoint de aproximadamente 180 GB en formato safetensors y compressed-tensors, pensado para servir con vLLM.

El modelo base es un modelo multimodal image-text-to-text de la familia Qwen, con arquitectura de mezcla de expertos (MoE) segun se deduce de la presencia de expertos enrutados y un experto compartido. La relevancia de esta ficha radica en que demuestra una estrategia de cuantizacion selectiva: en lugar de comprimir todo el modelo, se aislan las capas mas sensibles (atencion, router, vision, experto compartido) en BF16 y solo se comprimen los expertos, lo que reduce el peso de forma agresiva manteniendo una recuperacion media del 99,52 % respecto al modelo en BF16 en los benchmarks publicados (GSM8K, MMLU, PIQA, HellaSwag).

La licencia es qwen-community-1.0 (etiquetada como "other" en Hugging Face), por lo que el uso comercial queda sujeto a los terminos del modelo original. El modelo esta fechado en octubre de 2026 y cuenta con 377 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados y experto compartido; incluye torre de vision, MTP y tabla PLE (no se detalla la configuracion exacta de capas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en expertos enrutados; MXFP8 en lineales; BF16 en atencion, router, embeddings, lm_head, vision tower, shared expert, MTP y PLE |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors + compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE) con un experto compartido, torre de vision (pipeline image-text-to-text), modulo MTP (multi-token prediction) y una tabla PLE. La model card no proporciona detalles sobre el numero de capas, dimension oculta, numero de expertos ni tokens de entrenamiento; esa informacion corresponde al modelo original y no se reproduce aqui.

La cuantizacion se realizo con AutoRound (intel/auto-round) usando RTN (round-to-nearest) para los expertos enrutados en formato MXFP4, mientras que las capas sensibles se mantienen en BF16. El comando de generacion documentado emplea `--scheme MXFP8` con `--layer_config "{mlp.experts:{bits:4,data_type:mx_fp}}"` y una lista de capas ignoradas (visual, lm_head, embed_tokens, mlp.gate, mlp.shared_expert_gate, in_proj_a, in_proj_b, block_inject_weight, ple, mtp, hyper_connection, indexer, shared_expert). No se documenta RLHF, DPO ni composicion del dataset de entrenamiento del modelo base en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, tags conversational).
- Procesamiento de imagen y texto (pipeline image-text-to-text, torre de vision en BF16).
- Razonamiento con modo de razonamiento: el despliegue en vLLM usa `--reasoning-parser qwen3`.
- Prediccion multi-token (MTP) integrada en la arquitectura.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles (los idiomas no se listan en los metadatos).
- Capacidad de vision: si, mediante torre de vision mantenida en BF16.

## Casos de uso

- Despliegue de inferencia multimodal en produccion: el checkpoint esta disenado para servirse con vLLM (`vllm serve ... --reasoning-parser qwen3`), lo que permite atender peticiones image-text-to-text con un peso reducido frente al modelo en BF16.
- Razonamiento asistido con modo thinking: el parser de razonamiento qwen3 permite separar el razonamiento interno de la respuesta final, util para asistentes tecnicos y de analisis.
- Procesamiento de documentos con imagenes: al conservar la torre de vision en BF16, el modelo puede extraer y razonar sobre contenido visual (capturas, diagramas, formularios) sin degradacion por cuantizacion en esa rama.
- Sustitucion de inferencia BF16 en infraestructura limitada: la cuantizacion MXFP4 de expertos reduce el footprint de pesos, permitiendo servir el modelo en nodos con menos memoria que la version original.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia para estudiar el impacto de cuantizar solo expertos frente a cuantizar el modelo completo, con recuperacion media del 99,52 % en los benchmarks publicados.
- Pipelines de investigacion en IA open source: el formato compressed-tensors y el script de generacion con AutoRound permiten reproducir y adaptar la receta de cuantizacion a otros checkpoints MoE.

## Benchmarks y rendimiento

| Benchmark | BF16 | MXFP4 | Recuperacion |
|---|---:|---:|---:|
| GSM8K | 96,74 | 96,66 | 99,92 % |
| MMLU | 86,52 | 86,43 | 99,90 % |
| PIQA | 81,94 | 81,45 | 99,40 % |
| HellaSwag | 69,27 | 68,32 | 98,63 % |
| Media | 83,62 | 83,22 | 99,52 % |

No se han publicado resultados de benchmarks adicionales (HumanEval, contexto largo, tareas multimodales) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 180,0 GB en safetensors; se requiere memoria suficiente para cargar los pesos cuantizados mas las capas BF16 y el estado de ejecucion. No se detalla el desglose exacto por componente.
- GPU recomendadas: no disponible en la informacion. Por el volumen de pesos, se orienta a aceleradores de datacenter (A100/H100 o superiores); no se confirma compatibilidad con GPUs consumer.
- Cabe en consumer GPU: no disponible; el tamano del checkpoint (180 GB) hace improbable su ajuste en GPUs consumer de 24 GB sin offloading o sharding.
- Opciones de despliegue: vLLM (version fijada `0.29.1rc1.dev528+g9815732c1` con parche `qwen38fn-ct-ple-dev528.patch`); no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16SharedExperts-CT-AutoRound | no disponible | no disponible | MXFP4 expertos / MXFP8 lineales / BF16 capas sensibles | qwen-community-1.0 | Hugging Face, vLLM con parche |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 | qwen-community-1.0 | Hugging Face |
| Alternativas de cuantizacion MXFP4 de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni especificaciones completas de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; no debe usarse como fuente de verdad sin verificacion.
- Riesgo de sesgos y contenido ofensivo heredado del modelo base y de los datasets de ajuste; se recomienda realizar pruebas de seguridad antes de desplegar.
- Los idiomas soportados no estan documentados, lo que impide garantizar cobertura multilingue.
- La licencia qwen-community-1.0 ("other") impone condiciones adicionales; el uso comercial requiere revisar los terminos del modelo original y, segun el propio aviso, consultar a un asesor legal.
- El despliegue exige una version concreta de vLLM y la aplicacion manual de un parche; no es un checkpoint listo para cualquier stack.
- La cuantizacion MXFP4 de expertos introduce una perdida pequena pero medible (recuperacion media del 99,52 %); HellaSwag es el benchmark con mayor degradacion (98,63 %).
- No se documentan parametros totales, contexto ni configuracion de expertos, lo que limita la planificacion de capacidad.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16SharedExperts-CT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- AutoRound (GitHub): https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper AutoRound (arXiv): https://arxiv.org/abs/2309.05516
