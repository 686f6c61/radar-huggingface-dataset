# doth4580/Naive-N0.5-Flash-EXL3-3.5bpw

## Resumen

Naive-N0.5-Flash-EXL3-3.5bpw es una cuantizacion del modelo Naive-N0.5-Flash (desarrollado por el equipo NaiveAI) publicada por el usuario doth4580 en HuggingFace. Se trata de un modelo de lenguaje de tipo mezcla de expertos (MoE) con 309.000 millones de parametros totales y 15.500 millones de parametros activos por token, con una ventana de contexto nativa de 1.048.576 tokens. El artefacto no es un modelo nuevo, sino un empaquetado de pesos modificados mediante cuantizacion EXL3 (trellis de ExLlamaV3) a 3,5 bits por peso de media, lo que reduce el peso en disco desde los ~315 GB del original en FP8 hasta aproximadamente 137 GB.

La relevancia de este artefacto es puramente practica: un modelo MoE de 309B con contexto de un millon de tokens no cabe en hardware convencional, y esta cuantizacion es lo que permite ejecutarlo en un par de maquinas con memoria unificada de 128 GB (por ejemplo, 2x DGX Spark GB10) mediante vLLM con el plugin out-of-tree vllm-exl3 y ExLlamaV3. El modelo hereda la licencia MIT del original, lo que facilita su uso comercial, pero requiere toolchain especifico: ni transformers ni vLLM estandar pueden cargar los pesos EXL3.

La arquitectura combina atencion de ventana deslizante (SWA) y DeepSeek Sparse Attention (DSA) en todas las capas (39 SWA + 9 DSA), sin capas de atencion completa, con GQA de 4 grupos KV, 256 expertos enrutados (8 por token) y un vocabulario de 152.576 tokens. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens ni las tecnicas de alineacion (RLHF/DPO) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts con atencion hibrida Sliding-Window + DeepSeek Sparse Attention (39 capas SWA + 9 capas DSA, sin capas de atencion completa), GQA con 4 grupos KV, 48 capas |
| Parametros totales | 309.000 millones (309B) |
| Parametros activos | 15.500 millones (15,5B) por token |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | EXL3 trellis, codebook `mul1`; 3,5 bpw de media en expertos enrutados; 3 bpw en lineales no enrutados (q/k/v/o_proj, lineales del indexer DSA, gate/up/down densos); `lm_head` a 6 bits; embeddings y normas sin cuantizar (bfloat16) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; vocabulario de 152.576 tokens) |
| Licencia | MIT (heredada del modelo original NaiveAI/Naive-N0.5-Flash) |
| Formato de pesos | safetensors en formato `exl3` (24 shards), con `quantization_config.json` y variantes `.native` para ExLlamaV3 |

Detalles adicionales de arquitectura: hidden size 4096, 64 cabezas de atencion, 4 cabezas KV, head_dim 192; ventana SWA de 128 tokens; seleccion DSA top-2048 tokens; 256 expertos enrutados con tamano intermedio de 2048.

## Arquitectura y entrenamiento

Naive-N0.5-Flash es un transformer disperso de tipo MoE con 48 capas. Su atencion es completamente hibrida: ninguna capa usa atencion densa completa. De las 48 capas, 39 emplean sliding-window attention con ventana de 128 tokens y 9 emplean DeepSeek Sparse Attention con seleccion de los 2048 tokens mas relevantes. El componente MoE dispone de 256 expertos enrutados de los que se activan 8 por token, con tamano intermedio de 2048, lo que explica la gran diferencia entre parametros totales (309B) y activos (15,5B). La configuracion de atencion usa GQA con 4 grupos KV y head_dim 192.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO: estos datos no aparecen en la model card proporcionada. La innovacion tecnica documentada en este artefacto es la cuantizacion: se aplico EXL3 trellis (herramienta exllamav3 1.5.1.post1, adaptada especificamente para esta arquitectura, ejecutada sobre 8x H100) usando 250 filas x 2048 columnas de calibracion, con escalas de salida siempre almacenadas y esquema de activacion dinamico heredado de la fuente FP8. El pack soporta dos layouts de pesos simultaneamente: uno para vLLM (via el mapa `non_routed_exl3` en `config.json`) y otro nativo para ExLlamaV3 (ficheros `.native`).

## Capacidades

- Generacion de texto conversacional: el repositorio incluye `chat_template.jinja` y `tokenizer_config.json` sin modificar respecto al original, y una `generation_config.json` con muestreo recomendado (temperature 1.0, top-p 0.95), lo que indica un modelo orientado a uso instruct/chat.
- Procesamiento de contexto muy largo: ventana nativa de 1.048.576 tokens, con atencion hibrida SWA + DSA disenada para reducir el coste del contexto extenso.
- Decodificacion especulativa: soporta el drafter NaiveAI/Naive-N0.5-Flash-FP8-Draft mediante `--speculative-config` con metodo `dspark` y 3 tokens especulativos, lo que aumenta el throughput de decodificacion en la configuracion validada.
- Servicio distribuido: soporta tensor parallel y expert parallel (TP=2 + EP=2) con backend Ray en vLLM, con backend MoE Triton.
- Capacidades de tool calling, function calling, agentes, vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas soportados.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto nativo, el modelo puede ingerir bases de codigo extensas o documentacion tecnica completa en una sola pasada sin necesidad de chunking agresivo, lo que resulta util para auditoria, generacion de documentacion o respuesta a preguntas sobre el codigo.
- Resumen y extraccion de informacion en corpus largos: informes anuales, expedientes legales, historiales clinicos o libros tecnicos que exceden la ventana de modelos convencionales de 128K tokens.
- Asistente conversacional multi-turno de contexto extenso: al mantener una ventana de ~1M tokens, puede conservar el historial completo de una conversacion larga sin resumir ni truncar, reduciendo la perdida de informacion entre turnos.
- RAG con contexto masivo: en lugar de recuperar unos pocos fragmentos, se pueden inyectar cientos de documentos relevantes en el prompt y dejar que la atencion dispersa seleccione lo relevante.
- Despliegue on-premise en hardware de memoria unificada: su tamano cuantizado (~137 GB) permite ejecutarlo en dos nodos DGX Spark GB10 con TP=2, lo que habilita casos donde no se puede enviar datos a la nube por requisitos de privacidad.
- Generacion de codigo asistida en pipelines internos: si el modelo base tiene capacidades de codigo (no documentadas en la model card de esta cuantizacion, pero plausibles en un modelo instruct), puede integrarse como servicio vLLM con decodificacion especulativa para tareas de autocompletado o refactorizacion.
- Evaluacion de tecnicas de cuantizacion: este artefacto sirve como caso de estudio practico para comparar el rendimiento (throughput, calidad) de EXL3 3,5 bpw frente al original FP8 en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo incluye mediciones preliminares de servicio, obtenidas en 2x DGX Spark (GB10), concurrencia 1, decodificacion greedy, contexto de 2048 tokens y prompts de chat mixtos. El propio autor advierte que son numeros de un port de serving en desarrollo y que cambiaran.

| Configuracion | Decodificacion |
|---|---:|
| Sin especulacion, modo eager | ~21,5 tok/s |
| Sin especulacion, CUDA graphs | ~23,5 tok/s |
| CUDA graphs + DSpark, 3 tokens especulativos | ~24,4 tok/s |

- Prefill: ~950 tok/s a 2048 tokens de contexto (~2,1 s de TTFT).
- Contexto largo: no caracterizado todavia segun el autor.
- Desglose por etapa del paso de decodificacion (sin especulacion, eager): kernel MoE de expertos enrutados ~55%, all-reduce NCCL ~17%, GEMV denso EXL3 ~14%.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el pack ocupa ~137 GB en disco en 24 shards (la ficha de HuggingFace reporta un tamano de repositorio de 87,6 GB; existe una discrepancia entre ambos datos). Para inferencia se necesita capacidad equivalente o superior, distribuida entre dispositivos.
- Hardware validado: 2x DGX Spark (GB10) con memoria unificada de 128 GB por nodo, en dos nodos, con TP=2 + EP=2 sobre Ray, `--gpu-memory-utilization 0.80`, `--max-model-len 131072`, `--max-num-seqs 1`, `--dtype bfloat16`, backend MoE `triton`.
- No cabe en GPU de consumo: el tamano de pesos (~137 GB) excede la memoria de cualquier GPU consumer actual (RTX 4090 con 24 GB, etc.). Se necesita hardware con >100 GB agregados y soporte para paralelismo tensorial y de expertos.
- Cuantizacion/carga: para producir la cuantizacion se usaron 8x H100, pero eso corresponde al proceso de cuantizacion, no al de inferencia.
- Opciones de despliegue: vLLM 0.29.0 con el plugin out-of-tree vllm-exl3 y una build de ExLlamaV3 (1.5.1.post1); alternativamente, el layout nativo `.native` para ExLlamaV3. No es cargable por vLLM estandar ni por transformers.
- Arranque: varios minutos en el hardware validado; el primer arranque tambien compila kernels (carga limitada por I/O).
- Latencia y throughput: ~21,5 a ~24,4 tok/s de decodificacion segun configuracion, ~950 tok/s de prefill y ~2,1 s de TTFT a 2K tokens.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros para comparar directamente. La comparacion mas util es contra el propio modelo original en FP8 y su version sin cuantizar, dado que este artefacto solo cambia la precision de los pesos.

| Modelo | Parametros | Contexto | Precision de pesos | Tamano en disco | Formato | Requisitos de carga | Licencia |
|---|---|---|---|---|---|---|---|
| Naive-N0.5-Flash (original) | 309B / 15,5B activos | 1.048.576 | no disponible (sin cuantizar) | no disponible | safetensors | no disponible | MIT |
| Naive-N0.5-Flash-FP8 | 309B / 15,5B activos | 1.048.576 | FP8 | ~315 GB | safetensors | vLLM/transformers estandar | MIT |
| Naive-N0.5-Flash-EXL3-3.5bpw (este) | 309B / 15,5B activos | 1.048.576 | EXL3 trellis 3,5 bpw (expertos), 3 bpw (no enrutados), 6-bit lm_head | ~137 GB | safetensors `exl3` | vLLM + vllm-exl3 + ExLlamaV3 | MIT |

La ventaja del artefacto es la reduccion de tamano (de ~315 GB a ~137 GB) a cambio de perdida de precision y de la necesidad de un toolchain especifico. Otros modelos comparables de la misma categoria (MoE de ~300B con contexto de 1M) no estan identificados en la informacion disponible.

## Limitaciones y advertencias

- Toolchain restringido: los pesos EXL3 no son cargables por vLLM estandar ni por transformers; requieren el plugin vllm-exl3 (out-of-tree) y una build compatible de ExLlamaV3 (validado con vLLM 0.29.0 y exllamav3 1.5.1.post1). Esto limita la portabilidad y el soporte a largo plazo.
- Rendimiento preliminar: los numeros de throughput provienen de un port en desarrollo, con concurrencia 1 y contexto de 2048 tokens; el autor advierte explicitamente que cambiaran y que el contexto largo no esta caracterizado.
- Perdida de calidad por cuantizacion: la cuantizacion a 3,5 bpw en expertos y 3 bpw en lineales no enrutados introduce degradacion respecto al FP8 original. No se han publicado evaluaciones de calidad que cuantifiquen esa perdida.
- Sin datos de alineacion ni de datos de entrenamiento: se desconoce el regimen de entrenamiento (tokens, dataset, RLHF/DPO), lo que dificulta anticipar sesgos y comportamientos.
- Idiomas no declarados: la model card no especifica que idiomas soporta el modelo, asi que no se puede garantizar un rendimiento adecuado en castellano u otras lenguas.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones de factualidad publicadas para este artefacto.
- Restriccion practica de hardware: no es ejecutable en GPU de consumo ni en nodos unicos de 80 GB; requiere memoria agregada de mas de 100 GB y paralelismo TP/EP.
- Licencia: MIT, heredada del modelo original, permite uso comercial, pero el artefacto contiene pesos modificados por cuantizacion y el aviso de copyright del autor original debe conservarse.
- Inconsistencia de tamano: HuggingFace reporta 87,6 GB de repositorio mientras la model card indica ~137 GB en disco; conviene verificar el contenido real del repositorio antes de planificar el despliegue.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y actualizacion el 2026-09-28; se trata de un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doth4580/Naive-N0.5-Flash-EXL3-3.5bpw
- Modelo original: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Fuente directa FP8: https://huggingface.co/NaiveAI/Naive-N0.5-Flash-FP8
- Drafter para decodificacion especulativa: https://huggingface.co/NaiveAI/Naive-N0.5-Flash-FP8-Draft
- Licencia del modelo original: https://huggingface.co/NaiveAI/Naive-N0.5-Flash/blob/main/LICENSE
- Herramienta de cuantizacion ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Plugin vLLM para EXL3: https://github.com/vcruz305/vllm-exl3
