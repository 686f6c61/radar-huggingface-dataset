# Shockem/Signal-3.8-27B-NVFP4

## Resumen

Signal-3.8-27B-NVFP4 es una cuantizacion NVFP4 (W4A16) del modelo agentionai/Signal-3.8-27B, publicada por el usuario Shockem y generada con NVIDIA TensorRT Model Optimizer 0.45.0. El modelo original es un self-distill de Qwen/Qwen3.8-27B orientado a la "directness": se diferencia del checkpoint de Qwen unicamente en `lm_head.weight` y produce aproximadamente un 57% menos de tokens de respuesta y un 52% menos de tokens de pensamiento con una calidad de respuesta equivalente. Esta version comprime los pesos a 4 bits (NVFP4) manteniendo ese comportamiento, con un tamano de repositorio de 21 GB.

El problema que resuelve es doble: por un lado reduce el coste de inferencia por respuesta gracias a la verbosidad reducida del fine-tune; por otro, permite decodificacion acelerada en FP4 sobre GPUs NVIDIA Blackwell (RTX 50-series, DGX Spark, B100/B200), donde el formato NVFP4 dispone de kernels nativos. El checkpoint incluye la cabeza MTP de Qwen3.8 para decodificacion especulativa y una cabeza draft opcional con vocabulario truncado (40960 ids) que eleva la aceptacion del draft en torno a un 20%.

La arquitectura es un transformer decoder-only de la familia Qwen3.8 (etiquetado `qwen3_5` en los tags), con torre de vision y cabeza MTP. El dato real de safetensors indica 15.827.661.552 parametros, muy por debajo de los 27B que sugiere el nombre. La model card no declara longitud de contexto oficial: el ejemplo de despliegue usa `--max-model-len 65536` y las pruebas de calidad del autor se hicieron con 200k de contexto, FP8 KV cache y MTP 3 sobre 2x RTX 5060 Ti de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.8 (tag `qwen3_5`), con torre de vision y cabeza MTP; no se especifica si es denso o MoE |
| Parametros totales | 15.827.661.552 (~15,8 mil millones) segun safetensors; el nombre comercial indica 27B |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no declarada en la model card; el ejemplo de vLLM usa 65536 tokens y las pruebas del autor se hicieron a 200k |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos NVFP4 con escalas de bloque, activaciones BF16); KV cache en FP8 en las pruebas del autor; tag `8-bit` en HuggingFace |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model_mtp.safetensors` incluido, mas `mtp_draft_vocab_ids.pt` para la cabeza draft) |
| Modelo base | agentionai/Signal-3.8-27B (a su vez self-distill de Qwen/Qwen3.8-27B) |
| Tamano del repositorio | 21,0 GB |
| Pipeline | no disponible |
| Fecha de publicacion | 2026-09-11 (ultima actualizacion 2026-09-11) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un reentrenamiento: parte de agentionai/Signal-3.8-27B, un self-distill de Qwen/Qwen3.8-27B en el que solo `lm_head.weight` difiere del modelo original de Qwen. El objetivo declarado de ese fine-tune es la concision: respuestas y cadenas de pensamiento mas cortas con calidad equivalente, lo que se traduce en menor coste por respuesta. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; tampoco se detalla la arquitectura mas alla de la pertenencia a la familia Qwen3.8 y de la presencia de torre de vision y capa MTP.

La receta de cuantizacion si esta documentada: Model Optimizer 0.45.0, esquema NVFP4 W4A16 con escalas de bloque en los pesos y activaciones en BF16. Se cuantizaron aproximadamente 400 tensores lineales; quedaron en BF16 los embeddings, la torre de vision y las capas MTP. La similitud coseno de los pesos desquantizados frente a la fuente en BF16 es de 0,9955. El checkpoint conserva la cabeza MTP de Qwen3.8 para decodificacion especulativa y anade una cabeza draft opcional de vocabulario truncado (40960 ids, BF16, con mapeo en `mtp_draft_vocab_ids.pt`) que mejora la aceptacion del draft en torno a un 20% a igual calidad; su uso requiere un parche externo para vLLM.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; se desactiva enviando `"chat_template_kwargs": {"enable_thinking": false}`.
- Capacidades de vision heredadas del modelo base, con la opcion `--language-model-only` si solo se necesita texto.
- Modo "directness": aproximadamente un 57% menos de tokens de respuesta y un 52% menos de tokens de pensamiento a igual calidad declarada.
- Decodificacion especulativa nativa mediante la cabeza MTP incluida en el checkpoint, con cabeza draft truncada opcional (mejora de aceptacion en torno al 20%).
- Codigo y salidas estructuradas: el arnes de agentes del autor incluye suites de instrucciones, razonamiento, salida estructurada, codigo y compactacion, con medias entre el 93,6% y el 94,5%.
- Manejo de contextos largos: las pruebas del autor se ejecutaron con 200k de contexto y FP8 KV cache; la suite de compactacion forma parte del arnes evaluado.
- Tool calling / function calling: no documentado en la model card; el unico elemento relacionado es el parser de razonamiento recomendado (`--reasoning-parser qwen3`).
- Agentes multi-paso: no documentado explicitamente, aunque el arnes de evaluacion del autor se describe como agentico.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes de codigo en produccion: el modelo se ha evaluado con suites de codigo, instrucciones y salida estructurada dentro de un arnes agentico, con 139 de 140 tests superados en la suite "hard"; su verbosidad reducida rebaja el coste de cada ciclo de agente.
- Despliegue local en hardware Blackwell de gama consumer: la configuracion validada (2x RTX 5060 Ti 16 GB, TP=2, contexto 200k, FP8 KV, MTP 3) demuestra que el modelo es viable en dos GPUs de 16 GB, sin necesidad de nodos de datacenter.
- Asistentes conversacionales con respuestas concisas: al generar ~57% menos tokens de respuesta, reduce el tiempo hasta el ultimo token y el coste por consulta en servicios de alto volumen.
- Razonamiento con presupuesto controlado: el modo thinking puede desactivarse por peticion, lo que permite usar el mismo endpoint para consultas rapidas y para tareas que requieren cadena de pensamiento.
- Procesamiento de documentos con imagenes: la torre de vision se mantiene operativa en la cuantizacion, de modo que admite entradas multimodales sin desplegar un modelo aparte.
- Servicio de baja latencia con vLLM: la combinacion de NVFP4, cabeza MTP y decodificacion especulativa da 50-70 tok/s en la configuracion probada por el autor.
- Gestión de conversaciones largas y compactacion de contexto: la suite de compactacion del arnes y el contexto de 200k probado encajan con resumen y compresion de historiales extensos.
- Evaluacion y CI de pipelines de agentes: las suites estructuradas con 10 ejecuciones por caso permiten usar el modelo como sujeto de pruebas de regresion en herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Los unicos datos numericos son los del arnes interno del autor (suites de instrucciones, razonamiento, estructurado, codigo y compactacion), servidos con vLLM v0.28, TP=2 sobre 2x RTX 5060 Ti 16 GB, contexto de 200k, FP8 KV y MTP 3:

| Suite | Puntuacion media (10 ejecuciones) | Rango | Tests superados |
|---|---|---|---|
| easy | 94,5% | 94,5-94,5% | 40/40 |
| medium | 94,1% | 94,1-94,1% | 90/90 |
| hard | 93,6% | 83,2-94,8% | 139/140 |

Notas sobre los datos anteriores: 9 de las 10 ejecuciones de la suite "hard" obtuvieron 94,8%; la unica ejecucion con 83,2% fallo en un test de generacion de codigo para una LRU descrito como inestable, que pasa al repetirlo. Ademas, la similitud coseno de los pesos desquantizados frente a la fuente en BF16 es de 0,9955, y el tiempo total de resolucion se situa aproximadamente en la mitad que el de Qwen3.8-27B de serie gracias a la concision del modelo. Estos resultados proceden del propio autor y no de una evaluacion independiente.

## Requisitos de hardware

- GPU compatible: el autor indica que la cuantizacion esta pensada para NVIDIA Blackwell (RTX 50-series, DGX Spark, B100/B200); no se documenta soporte en generaciones anteriores (Ampere, Ada).
- Configuracion validada por el autor: 2x RTX 5060 Ti 16 GB (32 GB en total), tensor parallel 2, contexto 200k, KV cache FP8 y MTP 3, con 50-70 tok/s de decodificacion.
- VRAM estimada (derivada de los datos del repositorio, no declarada en la model card): los pesos de 15,83 mil millones de parametros a 4 bits equivalen a unos 8 GB mas escalas de bloque; a ello hay que sumar los componentes que se mantienen en BF16 (embeddings, torre de vision, capas MTP y cabeza draft) y la KV cache del contexto configurado, dado que el repositorio ocupa 21 GB en total.
- Cabe en GPU consumer: si, en GPUs Blackwell de 16 GB o mas, repartiendo el modelo con tensor parallel 2 como minimo para reproducir la configuracion probada; no se documenta una configuracion de una sola GPU.
- Opciones de despliegue: la model card solo documenta vLLM (`--quantization modelopt --dtype bfloat16 --reasoning-parser qwen3 --max-model-len 65536 --trust-remote-code`); no se mencionan llama.cpp, Ollama, TGI ni otros runners, y el formato NVFP4 de ModelOpt esta ligado al ecosistema NVIDIA.
- Decodificacion especulativa: la cabeza MTP incluida funciona sin cambios; la cabeza draft truncada requiere el parche `qwen3_5_mtp` de syv-ai para vLLM y, sin el, debe servirse sin `--speculative-config` o con el MTP estandar.
- Throughput y latencia: 50-70 tok/s de decodificacion en la configuracion indicada, con un tiempo total de resolucion aproximadamente la mitad que el de Qwen3.8-27B de serie.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shockem/Signal-3.8-27B-NVFP4 | 15,83 mil millones (safetensors) | no declarado; 65536 en el ejemplo de despliegue, 200k en pruebas | NVFP4 W4A16 | apache-2.0 | HuggingFace; solo despliegue documentado en vLLM sobre Blackwell |
| agentionai/Signal-3.8-27B | no disponible | no disponible | BF16 (sin cuantizar) | no disponible en la informacion proporcionada | HuggingFace; pesos ~4x mayores que la version NVFP4 |
| Qwen/Qwen3.8-27B | no disponible | no disponible | BF16 (sin cuantizar) | no disponible en la informacion proporcionada | HuggingFace; genera aproximadamente el doble de tokens totales que Signal a igual calidad declarada |

No se dispone de datos de benchmarks comparativos entre estos tres modelos, ni de otras alternativas de la misma categoria (cuantizaciones NVFP4 de modelos densos de ~15-30B) en la informacion proporcionada; cualquier comparacion de rendimiento entre ellos queda por tanto sin soporte numerico.

## Limitaciones y advertencias

- Parametros de muestreo obligatorios: temperatura 0,7, top_p 0,95 y top_k 20. El checkpoint original de Qwen trae `temperature: 1.0` en `generation_config.json`, valor con el que el modelo puede degenerar en prompts abiertos; el repositorio ya parchea ese fichero a 0,7, pero hay que asegurarse de que el servidor lo aplica (con `--generation-config vllm` hay que fijar los parametros manualmente).
- No usar decodificacion greedy: se observo un bucle de generacion con temperatura 0.
- Dependencia de hardware: NVFP4 requiere GPUs Blackwell para aprovechar los kernels nativos; en generaciones anteriores el comportamiento no esta documentado y se espera una penalizacion de rendimiento o la ausencia de soporte.
- La cabeza draft truncada no funciona sin el parche externo de vLLM; sin el, es inerte y hay que servir sin `--speculative-config` o con el MTP estandar.
- Perdida de cuantizacion no nula: la similitud coseno de los pesos desquantizados frente a la fuente en BF16 es 0,9955, no 1,0.
- Discrepancia de nomenclatura: el nombre indica 27B, pero los safetensors contienen 15.827.661.552 parametros; conviene verificar la arquitectura real (densa o MoE) antes de dimensionar infraestructura.
- Resultados no verificados de forma independiente: las unicas metricas proceden del arnes interno del autor, con 10 ejecuciones por suite y sin benchmarks estandar publicados. La varianza existe (una ejecucion de la suite "hard" cayo al 83,2%), aunque se atribuye a un test inestable.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y una model card como unica fuente de informacion.
- Idiomas soportados no documentados: no hay lista de idiomas ni evaluacion multilingue.
- Sesgos y alucinacion: no se publica ninguna evaluacion de sesgos ni de tasa de alucinacion para este checkpoint ni para su modelo base.
- Licencia: el repositorio se publica bajo apache-2.0, lo que en principio permite uso comercial, pero las licencias de agentionai/Signal-3.8-27B y de Qwen/Qwen3.8-27B no se detallan en la informacion proporcionada y deberian verificarse antes de un despliegue en produccion.
- Contexto largo costoso: aunque se probo a 200k, el ejemplo de despliegue usa 65536 tokens; ampliar la ventana incrementa el consumo de KV cache (FP8 en las pruebas) y puede reducir el throughput observado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shockem/Signal-3.8-27B-NVFP4
- Modelo base del fine-tune: https://huggingface.co/agentionai/Signal-3.8-27B
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Parche MTP para vLLM (syv-ai): https://github.com/syv-ai
- Busqueda web: no se encontraron resultados relevantes sobre este modelo; las consultas devolvieron foros y paginas sin relacion (Zhihu, DonanimHaber, Microsoft Community).
