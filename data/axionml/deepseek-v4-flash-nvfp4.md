# AxionML/DeepSeek-V4-Flash-NVFP4

## Resumen

AxionML/DeepSeek-V4-Flash-NVFP4 es un espejo (mirror) del checkpoint cuantizado nvidia/DeepSeek-V4-Flash-NVFP4, publicado por el usuario AxionML para facilitar su despliegue en entornos de servido open source. El modelo original es DeepSeek-V4-Flash, un Mixture-of-Experts (MoE) de 284.000 millones de parametros totales y 13.000 millones de parametros activos por token, desarrollado por DeepSeek dentro de la familia DeepSeek-V4. Esta variante ha sido cuantizada por NVIDIA con NVIDIA Model Optimizer v0.44.0 en formato NVFP4, manteniendo la atencion y los expertos compartidos en FP8.

El problema que resuelve es el de la huella de memoria: un modelo de 284B en precision completa resulta prohibitivo para servir con latencia razonable, de modo que el paso a NVFP4 reduce el checkpoint a unos 168 GB y permite ejecutarlo en GPUs Blackwell con aceleracion nativa de multiplicadores FP4 en los Tensor Cores. La relevancia actual viene dada por dos factores: el contexto de 1.000.000 de tokens, que habilita tareas de razonamiento sobre documentos completos, y la licencia MIT, que permite uso comercial sin restricciones adicionales.

La arquitectura combina MoE con atencion hibrida (Compressed Sparse Attention y Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections. El modelo expone tres modos de razonamiento (Non-think, Think High y Think Max) y esta publicado unicamente en safetensors con configuracion de cuantizacion NVFP4/FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida (Compressed Sparse Attention + Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections |
| Parametros totales | 284B segun la model card; 290.944.616.402 parametros segun los safetensors |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas de bloque FP8 E4M3 sobre micro-bloques de 16 elementos) en los expertos MoE enrutados; FP8 en atencion, expertos compartidos, router head y MTP; KV-cache en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con hf_quant_config.json para NVFP4) |
| Modos de razonamiento | Non-think / Think High / Think Max |
| Tamano del checkpoint | ~168 GB |
| Libreria declarada | transformers |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture-of-Experts con atencion hibrida. Segun la model card, combina Compressed Sparse Attention y Heavily Compressed Attention, junto con Manifold-Constrained Hyper-Connections. El modelo activa 13B de sus 284B parametros por token, lo que reduce el coste computacional de inferencia a cambio de mantener la capacidad total de almacenamiento. Se declara una longitud de contexto de 1.000.000 de tokens, coherente con el resto de la familia DeepSeek-V4.

En cuanto al proceso de cuantizacion, NVIDIA aplico NVIDIA Model Optimizer v0.44.0 sobre el checkpoint original. El esquema NVFP4 asocia un codebook E2M1 de FP4 con escalas FP8 (E4M3) por bloques de 16 elementos; el uso de escalas FP8 en lugar de potencias de dos puras (E8M0) permite escalas fraccionarias y una seleccion de escala que minimiza el error. En Blackwell, los Tensor Cores ejecutan multiplicadores FP4 nativos con acumulacion en FP32. La calibracion se realizo con cnn_dailymail y Nemotron-Post-Training-Dataset-v2. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en tres modos configurables: Non-think, Think High y Think Max, lo que permite ajustar el coste de computo al tipo de tarea.
- Razonamiento cientifico y de nivel experto, reflejado en los benchmarks GPQA Diamond (89,1) y SciCode (48,1) del checkpoint cuantizado.
- Seguimiento de instrucciones complejas, con 79,5 en IFBench en la version NVFP4.
- Razonamiento de largo contexto, con evaluacion en AA-LCR (65,5) y ventana de 1M de tokens.
- Uso de herramientas y agentes conversacionales, con 94,2 en τ²-Bench Telecom, un benchmark de agentes con uso de herramientas.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Soporte de decodificacion con MTP (multi-token prediction), que se mantiene en FP8 tras la cuantizacion.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 1M de tokens de contexto, el modelo puede ingerir repositorios de codigo completos, normativas o libros tecnicos en una sola pasada y responder preguntas cruzadas sin fragmentacion.
- Atencion al cliente automatizada con agentes: el resultado de 94,2 en τ²-Bench Telecom indica un comportamiento solido en dialogos multi-turno con llamadas a herramientas, adecuado para resolver incidencias con acceso a sistemas internos.
- Asistente de investigacion cientifica: los resultados en GPQA Diamond y SciCode lo hacen util para revisar hipotesis, resolver problemas de dominio especifico y generar codigo de simulacion.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD como revisor de cambios, generador de tests o asistente de refactorizacion, aprovechando el contexto largo para considerar el repositorio entero.
- Procesamiento de expedientes legales o administrativos: la ventana de 1M tokens permite comparar contratos, extraer clausulas y detectar contradicciones entre documentos sin chunking.
- Agentes autonomos de varios pasos: combinado con tool calling, puede orquestar tareas de investigacion, extraccion y sintesis sobre fuentes externas, con modos Think High o Think Max para los pasos que requieren mas razonamiento.
- Analisis de series de logs y trazas: con contexto largo puede correlacionar eventos distribuidos en ficheros de gran tamano para diagnostico de incidentes.
- Destilacion y generacion de datos sinteticos: el modo Non-think permite generar grandes volumenes de texto a menor coste computacional que los modos de razonamiento extendido.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA para este checkpoint, con temperature=1.0, top_p=1.0 y un maximo de 384.000 tokens:

| Benchmark | Baseline (FP8) | NVFP4 |
|---|---:|---:|
| GPQA Diamond | 89,4 | 89,1 |
| AA-LCR | 65,8 | 65,5 |
| τ²-Bench Telecom | 94,3 | 94,2 |
| SciCode | 48,1 | 48,1 |
| IFBench | 78,8 | 79,5 |

La degradacion por la cuantizacion NVFP4 es marginal en todos los casos (entre 0,3 y 0,0 puntos a la baja en cuatro benchmarks, y una mejora de 0,7 puntos en IFBench). No se han publicado en la informacion disponible resultados para otros benchmarks habituales como MMLU, HumanEval o GSM8K, ni comparativas directas con modelos de la competencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 168 GB, por lo que la inferencia requiere al menos ese volumen mas el espacio para la KV-cache. Con contexto de 1M tokens y KV-cache en FP8, el consumo adicional puede ser muy elevado y depende del tensor parallelism configurado.
- GPU compatibles: la cuantizacion NVFP4 requiere GPUs Blackwell (serie B200/GB200/GB300 y generaciones equivalentes) con soporte de multiplicadores FP4 en Tensor Cores. vLLM ha sido validado en GB300 con tensor parallelism 4.
- No cabe en GPU de consumo. Las RTX 4090 (Ada Lovelace) no disponen de soporte NVFP4 nativo y quedan descartadas para este checkpoint; no se dispone de datos sobre su comportamiento en GPUs consumer Blackwell.
- Despliegue con SGLang: `python3 -m sglang.launch_server --model-path AxionML/DeepSeek-V4-Flash-NVFP4 --tensor-parallel-size 8 --trust-remote-code`. SGLang detecta NVFP4 automaticamente a partir de hf_quant_config.json (sgl-project/sglang#25820).
- Despliegue con vLLM: `vllm serve AxionML/DeepSeek-V4-Flash-NVFP4 --tensor-parallel-size 4 --trust-remote-code --kv-cache-dtype fp8`.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| AxionML/DeepSeek-V4-Flash-NVFP4 | 284B / 13B | 1M | NVFP4 + FP8 | MIT | Mirror del checkpoint de NVIDIA; TP8 en SGLang, TP4 en vLLM |
| nvidia/DeepSeek-V4-Flash-NVFP4 | 284B / 13B | 1M | NVFP4 + FP8 | MIT | Checkpoint original cuantizado; misma procedencia |
| deepseek-ai/DeepSeek-V4-Flash | 284B / 13B | 1M | FP8 | MIT | Modelo base sin cuantizar |
| deepseek-ai/DeepSeek-V4-Pro | 1.6T / 49B | 1M | no disponible | no disponible | Version de mayor tamano de la familia DeepSeek-V4 |
| AxionML/DeepSeek-V4-Flash-0731-NVFP4 | 284B / 13B | 1M | NVFP4 + FP8 | MIT | Sustituye a este checkpoint segun la model card |

No se dispone de datos de rendimiento comparativo entre DeepSeek-V4-Flash y modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base fue entrenado con datos que pueden contener lenguaje toxico y sesgos sociales; el checkpoint cuantizado hereda esas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion para este checkpoint. Como en cualquier modelo generativo, las respuestas deben verificarse en dominios sensibles.
- La cuantizacion NVFP4 introduce una perdida de precision pequena pero medible respecto al baseline FP8 en GPQA Diamond, AA-LCR y τ²-Bench Telecom (0,2-0,3 puntos), por lo que en casos que exijan maxima fidelidad puede preferirse el checkpoint original.
- Restriccion de hardware: al requerir GPUs Blackwell con soporte NVFP4, el modelo no es desplegable en infraestructura Ada, Ampere o Hopper sin recurrir a otra variante.
- Idiomas soportados: no disponibles en la informacion proporcionada, por lo que no se puede garantizar la calidad en castellano ni en otros idiomas distintos del ingles.
- Este checkpoint esta marcado como reemplazado (superseded) por AxionML/DeepSeek-V4-Flash-0731-NVFP4, lo que sugiere que no recibira mantenimiento.
- El repositorio es un mirror sin modificaciones del checkpoint de NVIDIA; los problemas de soporte deben dirigirse a los repositorios upstream.
- Requiere `--trust-remote-code`, lo que implica ejecutar codigo del repositorio y anade superficie de riesgo en entornos no controlados.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, siempre que se conserve el aviso de copyright original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AxionML/DeepSeek-V4-Flash-NVFP4
- Checkpoint original cuantizado por NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Variante posterior: https://huggingface.co/AxionML/DeepSeek-V4-Flash-0731-NVFP4
- Variante del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Pull request de SGLang para deteccion de NVFP4: https://github.com/sgl-project/sglang/pull/25820
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/DeepSeek-V4-Flash
- Referencia en NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash
- Receta de vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://opensource.org/license/mit
