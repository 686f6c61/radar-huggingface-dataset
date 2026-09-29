# AxionML/Laguna-S-2.1-NVFP4

## Resumen

AxionML/Laguna-S-2.1-NVFP4 es una version cuantizada en NVFP4 de poolside/Laguna-S-2.1, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Poolside y orientado a codificacion agentica y razonamiento de horizonte largo. El repositorio lo publica AxionML como espejo (mirror) sin modificaciones de los pesos originales cuantizados por Poolside, con el objetivo de ofrecer un artefacto listo para servir en infraestructura estandar. Se trata, por tanto, de una redistribucion, no de un modelo nuevo ni de una cuantizacion propia.

El modelo base tiene 117.561.977.600 parametros totales y 8,5 mil millones de parametros activos por token, con 256 expertos enrutados mas uno compartido repartidos en 48 capas. Soporta una ventana de contexto de 1.048.576 tokens, lo que lo situa en el rango de los modelos pensados para tareas de agente sobre repositorios completos y sesiones de razonamiento extensas. La cuantizacion NVFP4 reduce el checkpoint a aproximadamente 100 GB (99,7 GB de repositorio), un tamano que permite desplegarlo en un solo equipo de alta memoria.

Su relevancia actual reside en la combinacion de un MoE de gran tamano con un formato de 4 bits de NVIDIA (NVFP4) que aprovecha los Tensor Cores de las GPU Blackwell para mantener precision numerica util, ademas de un KV cache en FP8 y soporte de decodificacion especulativa DFlash. Esto lo convierte en una opcion practica para servir cargas de trabajo de codigo y agentes en produccion, siempre que se disponga de hardware compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer; 48 capas (12 de atencion global + 36 de ventana deslizante con ventana de 512), atencion con puerta softplus |
| Parametros totales | 117.561.977.600 (117,6B) |
| Parametros activos | 8,5B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (compressed-tensors `nvfp4-pack-quantized`, group size 16) en `gate_proj` / `up_proj` / `down_proj` de los expertos enrutados; KV cache en FP8 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (campo `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors, formato compressed-tensors |

Datos adicionales: 256 expertos enrutados mas 1 compartido, tamano de checkpoint ~100 GB, pipeline `text-generation`, libreria `transformers` con codigo personalizado (`custom_code`), revision del modelo upstream NVFP4 `826aacdf6d8b2699d4e367def6f17c83b06044c2`.

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso de tipo Mixture-of-Experts con 48 capas. Se combinan 12 capas de atencion global con 36 capas de atencion de ventana deslizante de 512 tokens, un patron que busca reducir el coste del mecanismo de atencion en secuencias muy largas manteniendo acceso global en puntos concretos de la red. La atencion incorpora una puerta softplus. El enrutado dispone de 256 expertos mas un experto compartido, y solo 8,5B parametros se activan por token, lo que permite un coste de inferencia muy inferior al que sugeriria el total de 117,6B.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion posteriores al preentrenamiento. La model card del espejo tampoco detalla innovaciones de entrenamiento. Si se documenta el uso de decodificacion especulativa DFlash opcional, con un modelo borrador dedicado (poolside/Laguna-S-2.1-DFlash-NVFP4) y 7 tokens especulativos por paso, asi como el calibrado de la cuantizacion NVFP4 en la configuracion de contexto de 1M.

El formato NVFP4 asocia un codebook E2M1 de 4 bits con escalas FP8 (E4M3) por microbloques de 16 elementos, lo que permite escalas fraccionarias y una seleccion de escala orientada a minimizar el error. En los Tensor Cores de Blackwell los multiplicadores FP4 nativos se combinan con acumulacion en FP32.

## Capacidades

- Generacion de texto conversacional y razonamiento extendido, con modos de pensamiento (thinking) y sin pensamiento (no-thinking).
- Codificacion agentica: resolucion de tareas sobre repositorios, edicion multiarchivo y comprension de bases de codigo.
- Soporte de tool calling y function calling, con parser de herramientas dedicado (`--tool-call-parser poolside_v1`).
- Soporte de agentes y razonamiento multi-paso, con parser de razonamiento especifico (`--reasoning-parser poolside_v1`).
- Contexto de hasta 1M tokens, adecuado para analisis de repositorios completos o sesiones de agente de larga duracion.
- Capacidades multilingues: no disponible (no se especifica el conjunto de idiomas soportados).
- Capacidades de vision o audio: no disponibles.
- Compatible con decodificacion especulativa DFlash para acelerar la generacion.

## Casos de uso

- Agente de codificacion autonomo: el modelo puede ejecutar ciclos de edicion, prueba y correccion sobre un repositorio real. Su contexto de 1M tokens permite mantener en memoria varios ficheros y el historial de la sesion sin truncar, y el soporte de tool calling encaja con arneses de agente tipo Harbor.
- Resolucion de incidencias en produccion: dado un fallo con traza y codigo asociado, el modelo puede proponer y aplicar un parche. Los resultados en SWE-bench Multilingual (78,5) y SWE-Bench Pro (59,4) indican capacidad para tareas de reparacion sobre bases de codigo.
- Analisis y QnA de bases de codigo: con 1M de tokens de contexto es viable indexar un proyecto mediano-grande en una sola ventana y responder preguntas sobre su estructura (SWE Atlas Codebase QnA, 46,2).
- Automatizacion de tareas en terminal: el modelo esta evaluado en Terminal-Bench 2.1 (70,2), por lo que es adecuado para agentes que operan shells, ejecutan comandos y validan resultados paso a paso.
- Integracion en pipelines de CI/CD: mediante tool calling y el servidor vLLM, se puede exponer como servicio interno para revision automatica de pull requests, generacion de tests o triaje de errores de build.
- Orquestacion de herramientas externas: el resultado en Toolathlon Verified (49,7) apunta a un uso viable en agentes que combinan multiples API y herramientas encadenadas.
- Asistente de razonamiento de horizonte largo: el modo thinking permite tareas de planificacion y descomposicion de problemas extensos, con la posibilidad de desactivarlo para reducir latencia en tareas simples.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la model card de Laguna S 2.1 (modelo base sin cuantizar); no se han publicado mediciones especificas de la version NVFP4.

| Benchmark | Laguna S 2.1 |
|---|---|
| Terminal-Bench 2.1 | 70,2 |
| SWE-bench Multilingual | 78,5 |
| SWE-Bench Pro (Public) | 59,4 |
| DeepSWE | 40,4 |
| SWE Atlas (Codebase QnA) | 46,2 |
| Toolathlon Verified | 49,7 |

Notas metodologicas indicadas por el autor: la evaluacion se realizo con el framework Harbor del Laude Institute, con arnes de agente propio, un maximo de 500 pasos y ejecucion en sandbox, reportando pass@1 medio sobre multiples intentos. No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM para pesos (estimacion aritmetica sobre 117,6B parametros en FP4): en torno a 59 GB solo para los pesos, a los que hay que sumar el KV cache en FP8, estados de activacion y buffers del runtime. El repositorio ocupa 99,7 GB, por lo que se debe prever espacio en disco suficiente para la descarga.
- Aceleracion NVFP4: requiere GPU Blackwell (serie B200/GB200, RTX 50) para aprovechar los multiplicadores FP4 nativos. En generaciones anteriores el formato puede descomprimirse o ejecutarse sin aceleracion dedicada, con penalizacion de rendimiento.
- GPU recomendadas: NVIDIA B200 o GB200 para produccion con NVFP4 nativo; H100 o A100 de 80 GB como minimo para pesos y contexto moderado; multiples GPU para contexto cercano a 1M tokens.
- GPU de consumo: no cabe en GPU de consumo de 24 GB (RTX 4090, 3090) por el tamano de pesos; seria necesario repartir en varias GPU o recurrir a una cuantizacion mas agresiva no incluida en este repositorio.
- Opciones de despliegue: vLLM >= 0,25.0 (deteccion automatica de la cuantizacion, recomendado por el autor), Ollama (tag `laguna-s-2.1:nvfp4`) y transformers con codigo personalizado. SGLang aparece etiquetado en el repositorio, pero el autor advierte de que NVFP4 no funciona correctamente en SGLang actualmente.
- Configuracion de servicio sugerida: `vllm serve AxionML/Laguna-S-2.1-NVFP4 --enable-auto-tool-choice --tool-call-parser poolside_v1 --reasoning-parser poolside_v1 --max-model-len 262144`, con la decodificacion especulativa DFlash opcional (`--speculative-config '{"model":"poolside/Laguna-S-2.1-DFlash-NVFP4","num_speculative_tokens":7,"method":"dflash"}' --max-num-seqs 32`) y los valores de muestreo de `generation_config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AxionML/Laguna-S-2.1-NVFP4 | 117,6B | 8,5B | 1.048.576 tokens | NVFP4 (KV cache FP8) | OpenMDW-1.1 | HuggingFace, Ollama |
| poolside/Laguna-S-2.1-NVFP4 | 117,6B | 8,5B | 1.048.576 tokens | NVFP4 (KV cache FP8) | OpenMDW-1.1 | HuggingFace (upstream, identico) |
| poolside/Laguna-S-2.1 | 117,6B | 8,5B | 1.048.576 tokens | bf16 (sin cuantizar) | OpenMDW-1.1 | HuggingFace |
| poolside/Laguna XS 2.1 | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

El modelo es identico byte a byte al artefacto NVFP4 publicado por Poolside; la unica diferencia frente al upstream es el repositorio de distribucion. Frente a la version sin cuantizar, la ganancia es de huella de memoria (aproximadamente 100 GB frente a los ~235 GB que ocuparian los pesos en bf16), con una perdida de precision que no ha sido cuantificada publicamente. Laguna XS 2.1 es el hermano menor de la familia, pensado para un perfil de memoria mas reducido, pero no se dispone de sus especificaciones ni resultados.

## Limitaciones y advertencias

- Modelo espejo: AxionML no ha cuantizado ni modificado los pesos; la responsabilidad tecnica de la cuantizacion es de Poolside. Para incidencias de calidad conviene referirse al repositorio upstream.
- Sesgos: el modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales, que la version cuantizada hereda. Puede generar contenido inexacto, sesgado u ofensivo.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad. En tareas de codigo y agentes conviene validar las salidas con tests y ejecucion real en sandbox.
- Cobertura de idiomas: no disponible. No hay confirmacion publica de un rendimiento multilingue equilibrado; el enfoque declarado es codificacion y razonamiento, predominantemente en ingles.
- Contexto: aunque se declaran 1M tokens, la configuracion de servicio de ejemplo limita `--max-model-len` a 262.144, lo que sugiere un coste de memoria considerable para explotar la ventana completa.
- Rendimiento degradado de la cuantizacion: no se han publicado comparativas NVFP4 frente a bf16 en los benchmarks, por lo que la perdida de calidad no esta caracterizada.
- Compatibilidad: SGLang no ejecuta correctamente NVFP4 segun el propio autor; la via soportada es vLLM >= 0,25.0. La aceleracion nativa NVFP4 depende de hardware Blackwell.
- Licencia: OpenMDW-1.1 permite uso comercial y no comercial, pero esta supeditada a la politica de uso aceptable de Poolside. Es responsabilidad del integrador revisar ambas antes de desplegar en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion.

## Enlaces

- Repositorio del espejo: https://huggingface.co/AxionML/Laguna-S-2.1-NVFP4
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Cuantizacion upstream de Poolside: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4
- Blog de presentacion de Laguna S 2.1: https://poolside.ai/blog/introducing-laguna-s-2-1
- Pagina de modelos de Poolside: https://poolside.ai/models
- Trayectorias de evaluacion: https://trajectories.poolside.ai/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Politica de uso aceptable de Poolside: https://poolside.ai/legal/acceptable-use-policy
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Tag en Ollama: https://ollama.com/library/laguna-s-2.1:nvfp4
