# prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF es una cuantizacion GGUF en formato MXFP4_MOE del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario prithivMLmods. Se trata de una variante "abliterated", es decir, con el comportamiento de rechazo mitigado mediante la modificacion de las direcciones de rechazo en los pesos, y cuantizada en FP4 microscaling para aprovechar los Tensor Cores FP4 nativos de la arquitectura NVIDIA Blackwell (SM120, GB202, B200, B300).

El modelo base es un Mixture-of-Experts multimodal de aproximadamente 177.000 millones de parametros totales, con 125.000 millones de parametros nucleo, 6.000 millones activados por token a traves de 10 expertos enrutados y 1 compartido de un total de 512, mas 51.000 millones de parametros de embeddings n-gram orientados a offload y una cabeza de prediccion multi-token (MTP) de 4.000 millones junto a un codificador de vision. Incorpora una ventana de contexto nativa de 262.144 tokens extensible a 1 millon mediante YaRN, y acepta entradas de texto, imagen y video de hasta horas de duracion.

La relevancia de esta publicacion es doble: por un lado, permite ejecutar un modelo MoE multimodal de gran tamano en hardware Blackwell consumer y profesional con un unico fichero de 124 GB; por otro, documenta metricas de inferencia reales con llama.cpp sobre dos RTX PRO 6000 Blackwell (192 GB de VRAM combinada), alcanzando 103,20 tokens/s de generacion. La licencia del modelo base es la Qwen Community 1.0, mientras que la model card de esta cuantizacion declara apache-2.0, una discrepancia que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida (Gated DeltaNet + Qwen Sparse Attention), Gated Residual y cabeza MTP |
| Parametros totales | 176.943.899.520 (aprox. 177B) |
| Parametros activos | 6B por token (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantizacion | MXFP4_MOE (pesos principales); mmproj en BF16 |
| Idiomas soportados | Ingles (segun metadatos de la model card) |
| Licencia | apache-2.0 declarada en esta cuantizacion; Qwen Community 1.0 en el modelo base |
| Formato de pesos | GGUF (MXFP4_MOE) + mmproj BF16 para vision |
| Tamano del repositorio | 125,0 GB |
| Parametros nucleo | 125B (mas 51B de embeddings n-gram y 4B de cabeza MTP) |
| Capas | 48 |
| Entradas multimodales | Texto, imagen y video de escala horaria |
| Hardware objetivo | NVIDIA Blackwell (SM120, GB202, RTX PRO 6000, RTX 50-series, B200, B300) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE multimodal de 48 capas con una disposicion de atencion hibrida que intercala Gated DeltaNet (atencion lineal con estado recurrente) con Qwen Sparse Attention (QSA) a nivel de bloque, con el objetivo de reducir la latencia en contextos largos. Incorpora ademas flujos Gated Residual multirrama para estabilidad del entrenamiento y una cabeza de prediccion multi-token (MTP) de 4.000 millones de parametros, habitual en estrategias de decodificacion especulativa. El codificador de vision se distribuye en un fichero mmproj separado en BF16 para su uso con llama.cpp.

La cuantizacion MXFP4_MOE aplica microescalado de bloque (microscaling) a los pesos del MoE, un formato soportado de forma nativa por los Tensor Cores FP4 de Blackwell. Esto permite reducir el peso del modelo a 124 GB manteniendo precisiones razonables en los expertos, mientras que las proyecciones multimodales se conservan en BF16. La variante "abliterated" implica que el autor ha modificado los pesos para reducir la tendencia al rechazo de peticiones, un proceso que suele realizarse mediante tecnicas de abliteracion sobre las direcciones de rechazo en el espacio de activaciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto nativo de 262.144 tokens.
- Razonamiento configurable mediante el modo `<think>`, con parametros `enable_thinking`, `preserve_thinking` y `reasoning_effort`.
- Comprension de imagenes y video de escala horaria a traves del codificador de vision y el fichero mmproj.
- Generacion de codigo y tareas de ingenieria de software, con soporte para agentes de codificacion (SWE-bench Pro, DeepSWE).
- Uso de ordenador y agentes interactivos (AndroidWorld, computer use).
- Razonamiento matematico y cientifico de nivel avanzado (GPQA Diamond, MathVision).
- Capacidades multilingues parciales segun los benchmarks del modelo base (SWE-bench Multilingual), aunque los metadatos solo declaran ingles.
- Prediccion multi-token (MTP) que habilita decodificacion especulativa interna.
- Compatibilidad con `Transformers`, `vLLM`, `SGLang` y `TokenSpeed` segun la model card del modelo base.
- Al ser una variante abliterated, reduce el rechazo ante peticiones que el modelo original declinaria.

## Casos de uso

- Asistencia de codificacion en produccion: el modelo puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests y refactorizacion, aprovechando su rendimiento en SWE-bench Pro (62,5) y LiveCodeBench v6 (91,9) y su soporte de tool calling.
- Agentes autonomos de navegacion y computer use: con 84,5 en AndroidWorld, es adecuado para automatizar flujos de interfaz grafica en entornos controlados, combinando vision y razonamiento multi-paso.
- Analisis de documentos largos y contratos: la ventana de 262.144 tokens permite procesar expedientes completos o bases de codigo extensas en una sola pasada, con extension a 1M mediante YaRN para casos extremos.
- Inspeccion de video de vigilancia o grabaciones de reunion: la entrada de video de escala horaria permite resumir, indexar y extraer eventos de grabaciones largas sin fragmentacion manual.
- Razonamiento cientifico y matematico asistido: con 91,7 en GPQA Diamond y 95,7 en MathVision con interprete de codigo, es util para tutoria tecnica, verificacion de derivaciones y resolucion de problemas con apoyo de herramientas.
- Despliegue on-premise en hardware Blackwell: el fichero MXFP4_MOE de 124 GB cabe en dos RTX PRO 6000 (192 GB) o en un B200/B300, permitiendo inferencia local sin dependencia de API para datos sensibles.
- Investigacion sobre alineacion y abliteracion: la variante permite estudiar el comportamiento del modelo sin rechazo, comparando respuestas frente al original en tareas de seguridad y evaluacion de sesgos.

## Benchmarks y rendimiento

Resultados del modelo base segun la model card (no especificos de esta cuantizacion):

| Benchmark | Resultado |
|---|---|
| DeepSWE 1.1 | 58,7 |
| SWE-bench Pro | 62,5 |
| SWE-bench Multilingual | 81,0 |
| AndroidWorld | 84,5 |
| GPQA Diamond | 91,7 |
| LiveCodeBench v6 | 91,9 |
| MathVision (con interprete de codigo) | 95,7 |

Metricas de inferencia de esta cuantizacion (llama.cpp, 2x RTX PRO 6000 Blackwell, contexto 16.384, KV cache q8_0, sin decodificacion especulativa, 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 123,64 tokens/s |
| Velocidad media de generacion | 103,20 tokens/s |
| Tiempo total de ejecucion | 87,6 s |
| VRAM pico combinada | 66,80 GiB (34,39 + 32,41 GiB) |
| Uso pico de GPU | 63% (GPU 1) / 48% (GPU 0) |
| Capas offloaded | Auto (`-ngl auto`) |

No se han publicado resultados de benchmarks especificos para la variante abliterated ni para la cuantizacion MXFP4 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF principal ocupa 124 GB, por lo que se necesita al menos esa capacidad mas overhead de KV cache. En la prueba documentada con contexto de 16.384 tokens y KV cache q8_0, el pico fue de 66,80 GiB combinados gracias al offload automatico de capas.
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 nativo, como RTX PRO 6000 Blackwell (96 GB), B200, B300 y RTX 50-series con VRAM suficiente. El formato MXFP4_MOE esta optimizado para SM120/GB202.
- Viabilidad en GPU consumer: no cabe en una unica GPU consumer de 24 GB. Requiere configuraciones multi-GPU o GPUs profesionales de 96 GB. En RTX 4090 o similares seria necesario offload masivo a RAM, con caida severa de rendimiento.
- Opciones de despliegue: llama.cpp (probado), y segun el modelo base, Transformers, vLLM, SGLang y TokenSpeed. El fichero mmproj BF16 es necesario para las capacidades de vision en llama.cpp.
- Latencia y throughput: 103,20 tokens/s de generacion y 123,64 tokens/s de procesamiento de prompt en la configuracion de dos RTX PRO 6000 con contexto de 16K. El rendimiento en contextos de 262K o 1M no esta documentado y previsiblemente sera mucho menor.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (abliterated MXFP4) | 177B | 6B | 262K (1M YaRN) | apache-2.0 / Qwen Community 1.0 | GGUF MXFP4 |
| Qwen3.8-Flash-Next (original) | 177B | 6B | 262K (1M YaRN) | Qwen Community 1.0 | safetensors |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos directos con otros modelos de la misma categoria, por lo que la comparativa se limita a las variantes del propio modelo base.

## Limitaciones y advertencias

- La variante abliterated elimina o reduce los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado sin filtros. No es adecuada para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion inherente a los modelos de gran escala, agravado potencialmente por la cuantizacion FP4 y la modificacion de pesos.
- Los metadatos solo declaran soporte de ingles; el rendimiento en castellano no esta verificado y podria degradarse.
- Discrepancia de licencia: la cuantizacion declara apache-2.0, pero el modelo base se distribuye bajo Qwen Community 1.0, que impone restricciones adicionales para uso comercial. Conviene verificar la licencia aplicable antes de producción.
- El formato MXFP4_MOE esta optimizado para Blackwell; en hardware anterior (Ampere, Hopper) el rendimiento y la compatibilidad pueden ser limitados.
- El contexto de 1M tokens via YaRN no esta validado en esta cuantizacion y el coste de memoria de KV cache a esa longitud es prohibitivo en configuraciones consumer.
- El modelo ocupa 124 GB, lo que limita su despliegue a infraestructura con multiples GPUs o GPUs profesionales de alta capacidad.
- No hay informacion sobre el proceso de cuantizacion, la perdida de calidad respecto al original ni evaluaciones de la variante abliterated.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fichero GGUF principal: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF/blob/main/Qwen3.8-Flash-Next-abliterated.MXFP4_MOE.gguf
- Fichero mmproj BF16: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF/blob/main/Qwen3.8-Flash-Next.mmproj-bf16.gguf
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
