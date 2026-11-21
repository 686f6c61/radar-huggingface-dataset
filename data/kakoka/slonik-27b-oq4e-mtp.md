# kakoka/Slonik-27B-oQ4e-mtp

## Resumen

Slonik-27B-oQ4e-mtp es una cuantizacion de 4 bits del checkpoint Slonik 27B, un modelo de lenguaje especializado en codigo desarrollado por Postgres Professional y entrenado especificamente en tareas que implican modificar el codigo fuente de PostgreSQL. Esta version concreta la publica el usuario kakoka y esta pensada para ejecutar el modelo en local sobre Macs con Apple Silicon mediante MLX, la libreria de computacion tensorial de Apple.

El modelo base cuenta con 27.320.697.856 parametros (unos 27,3 mil millones) y se distribuye en formato safetensors con cuantizacion afin de 4 bits y grupo de tamano 64, manteniendo en BF16 los tensores de punto flotante restantes y preservando los 15 tensores nativos de MTP (multi-token prediction). El repositorio ocupa 16,6 GB en disco, lo que lo hace viable en equipos con memoria unificada de gama alta.

Su relevancia actual radica en dos factores: por un lado, ataca un nicho muy concreto (ingenieria del codigo de PostgreSQL en C y SQL) con resultados verificados sobre un arbol real de PostgreSQL 18.6; por otro, demuestra un flujo de cuantizacion con decodificacion especulativa nativa (Lightning MTP) que acelera la inferencia en hardware Apple. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles), con cabezas MTP nativas |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en perfil Chat; 65.536 tokens en perfil Research (contexto cargado en runtime) |
| Tipos de cuantizacion | oQ4e (base 4 bits con precision superior en tensores seleccionados, group size 64, calibracion con importance matrix); existen tambien oQ6e y oQ8 del mismo autor |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los ejemplos y validaciones son en ingles y ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards), libreria mlx |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que es un transformer de 27,3 mil millones de parametros con cabezas de multi-token prediction (MTP) nativas, de las cuales se preservan las 15 en esta cuantizacion. El modelo base, Slonik, procede de Postgres Professional y fue entrenado sobre tareas que implican cambiar el codigo fuente de PostgreSQL; no se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta ficha es el proceso de cuantizacion: se genero con oMLX 0.7.4.dev1 en modo Text Only a partir del checkpoint BF16 del directorio `27B/` (revision `321d879c39a809057f324a8133c9484e4c192c06`), aplicando cuantizacion afin con base de 4 bits, precision superior en tensores seleccionados, calibracion mediante importance matrix y grupo de 64. Ademas, el runtime oMLX permite activar "Lightning MTP", que explota las cabezas MTP para decodificacion especulativa y multiplica el throughput (de 27,92 a 61,88 tok/s en oQ8, segun la tabla del autor).

## Capacidades

- Generacion de texto y codigo, con especializacion en C y SQL del ecosistema PostgreSQL.
- Razonamiento con modo "thinking" opcional: desactivado por defecto; se activa con `enable_thinking=true` y un `reasoning_effort` explicito (`low`, `medium` o `xhigh`).
- Perfiles preconfigurados: Slonik Chat (sin thinking, contexto de 32.768 tokens) y Slonik Research (thinking con `xhigh`, contexto de 65.536 tokens).
- Generacion de parches de codigo C y pruebas de regresion sobre el arbol de PostgreSQL (validado con un bug de planner introducido deliberadamente en PostgreSQL 18.6).
- Generacion y validacion de consultas SQL complejas (el autor reporta 72 comprobaciones con coincidencia en el resultado `queued`, incluido el orden de filas).
- Capacidades conversacionales multi-turno segun el pipeline declarado (`text-generation`, `conversational`).
- Capacidades multilingues: no disponibles de forma declarada; hay material de validacion en ingles y ruso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: el modelo se uso dentro de un agente de codificacion interno de Postgres Professional con aprobacion automatica de shell; no se documenta un protocolo de agentes estandar.

## Casos de uso

- Mantenimiento del codigo fuente de PostgreSQL: el modelo puede recibir un fragmento del arbol de PostgreSQL 18.6, localizar la causa de un fallo en el planner y proponer un parche en C junto con una prueba de regresion; el autor valido un parche que supero 15 comprobaciones de resultados y planes de consulta y las 231 pruebas de regresion del core.
- Generacion y revision de SQL de produccion: dada una tarea de negocio (por ejemplo, sondeo de una cola), el modelo produce sentencias SQL y explica el plan; encaja en revisiones de migraciones o en asistentes internos de bases de datos.
- Asistente de codificacion integrado en agentes: al soportar contextos de 32K-64K tokens y ejecucion dentro de un agente con acceso a shell, sirve para tareas de varios pasos como reproducir un bug, aplicar un parche y volver a compilar.
- Analisis de planes de consulta y optimizacion: el modelo razona sobre `EXPLAIN` y estructuras de particionado (se mencionan indices GiST y particiones `DEFAULT`), util para equipos de DBA que revisan regresiones de rendimiento.
- Desarrollo local en Mac: con 16,6 GB de pesos y MLX, permite a un desarrollador con un Mac Studio o un MacBook Pro de gama alta trabajar con un modelo de 27B sin GPU dedicada ni conexion a la nube.
- Prototipado de herramientas internas sobre PostgreSQL: al ser Apache-2.0, se puede embeber en productos comerciales de consultoria o plataformas de gestion de bases de datos sin obligaciones de copyleft.
- Educacion y formacion en internals de PostgreSQL: el modo Research con thinking `xhigh` y 64K de contexto permite explicar decisiones de diseno del planner y del optimizador con trazabilidad de razonamiento.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de throughput en un Mac Studio M5 Ultra con 256 GiB de memoria unificada, en oMLX, con un prompt en ingles sobre PostgreSQL, 437 tokens de entrada, 256 tokens generados, sin cache de entrada y thinking desactivado (mediana de tres ejecuciones calentadas):

| Cuantizacion | Tamano de pesos | Lightning MTP | Decodificacion mediana |
|---|---:|---:|---:|
| oQ8 | 29,08 GB | On | 61,88 tok/s |
| oQ6e | 22,94 GB | On | 57,71 tok/s |
| oQ4e | 16,60 GB | On | 78,98 tok/s |
| oQ8 | 29,08 GB | Off | 27,92 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La validacion funcional reportada incluye 24 respuestas primarias mas dos comprobaciones de override de razonamiento en oMLX y LM Studio, y 72 comprobaciones de coincidencia de resultados SQL en una tarea de sondeo de cola.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,6 GB solo para pesos en oQ4e; anade margen para KV cache y contexto (32K-64K tokens), por lo que se recomienda un minimo practico de 24-32 GB de memoria unificada.
- Hardware validado: Mac Studio M5 Ultra con 256 GiB de memoria unificada, 78,98 tok/s de decodificacion con Lightning MTP activado.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; la cuantizacion esta en formato MLX y esta pensada para Apple Silicon, no para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no se documenta soporte para GPUs NVIDIA de consumo.
- Opciones de despliegue: oMLX (con Lightning MTP), LM Studio (perfiles Slonik Chat y Slonik Research desde LM Studio Hub, o instalacion offline con el archivo de perfiles), y MLX como libreria. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 78,98 tok/s de decodificacion mediana en el hardware indicado; no se publican cifras de prefill ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slonik-27B-oQ4e-mtp (esta ficha) | 27,3 B | 32K / 64K en runtime | Codigo PostgreSQL (C/SQL) | Apache-2.0 | MLX, LM Studio, oMLX |
| dglhf/Slonik (BF16) | 27,3 B | no disponible | Codigo PostgreSQL (C/SQL) | Apache-2.0 | Hugging Face (checkpoint original) |
| Slonik-27B-oQ6e / oQ8 (mismo autor) | 27,3 B | 32K / 64K | Codigo PostgreSQL (C/SQL) | Apache-2.0 | MLX, LM Studio, oMLX |
| Modelos de codigo generalistas de ~27B | no disponible | no disponible | Codigo general | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar el rendimiento de Slonik con modelos de codigo generalistas de tamano similar.

## Limitaciones y advertencias

- Es una cuantizacion de 4 bits: puede degradar la precision frente al checkpoint BF16 original, especialmente en tareas de razonamiento largo o generacion de codigo C complejo.
- El propio autor advierte que en la validacion de API la respuesta de Chat sobre GiST contiene una imprecision tecnica sobre indexacion sin perdida, y no reclama calidad de respuesta equivalente entre perfiles.
- La validacion cubierta es limitada: contexto largo, concurrencia y cargas PostgreSQL ejecutadas quedaron fuera de la serie de pruebas publicada.
- El modo thinking esta desactivado por defecto; en runtimes que no aceptan argumentos de plantilla de chat no se puede activar sin actualizar `chat_template.jinja` y `tokenizer_config.json`.
- `reasoning: low` no esta soportado en la integracion de LM Studio probada; solo `off` y `on` a nivel nativo.
- Cargar la carpeta HF en crudo no anade automaticamente los perfiles de razonamiento; hay que instalar los perfiles desde LM Studio Hub o el archivo offline.
- El modelo esta especializado en PostgreSQL: su rendimiento en dominios ajenos (frontend, movil, ciencia de datos general) no esta documentado y probablemente sea inferior al de modelos de codigo generalistas.
- No se declara lista de idiomas soportados; el material de validacion es en ingles y ruso, por lo que el soporte de castellano no esta verificado.
- Riesgo de alucinacion: el autor documenta que el primer intento de parche agoto el limite de salida antes de escribir el parche, y que las explicaciones escritas contenian errores pese a que los planes SQL medidos eran correctos.
- Sesgos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con atribucion; deben conservarse LICENSE, NOTICE y las licencias upstream incluidas en el repositorio.
- Requiere hardware Apple Silicon: no es desplegable en GPUs NVIDIA con los runtimes documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kakoka/Slonik-27B-oQ4e-mtp
- Checkpoint base (BF16): https://huggingface.co/dglhf/Slonik/tree/321d879c39a809057f324a8133c9484e4c192c06/27B
- Paper de Slonik: https://huggingface.co/dglhf/Slonik/blob/main/Slonik.pdf
- Resultados de validacion de API: https://huggingface.co/kakoka/Slonik-27B-oQ4e-mtp/blob/387d14221ddb5206fc9733676f2b97baaa1c97e3/API-VALIDATION.md
- Configuracion de perfiles de runtime: https://huggingface.co/kakoka/Slonik-27B-oQ4e-mtp/blob/387d14221ddb5206fc9733676f2b97baaa1c97e3/RUNTIME-PROFILES.md
- Benchmarks y metricas por prueba: https://huggingface.co/kakoka/Slonik-27B-oQ4e-mtp/blob/387d14221ddb5206fc9733676f2b97baaa1c97e3/BENCHMARK.md
- Articulo sobre el parche a PostgreSQL (ingles): https://huggingface.co/kakoka/Slonik-27B-oQ4e-mtp/blob/387d14221ddb5206fc9733676f2b97baaa1c97e3/ARTICLE.md
- Articulo sobre el parche a PostgreSQL (ruso): https://huggingface.co/kakoka/Slonik-27B-oQ4e-mtp/blob/387d14221ddb5206fc9733676f2b97baaa1c97e3/ARTICLE.ru.md
- Parche C generado: https://github.com/pkonotopov/slonik-llm-tests/blob/a7092b5ba81bc9767906599ac459aaf4b81061e5/patches/oq4e.patch
- Documentacion de cuantizacion oQ de oMLX: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Perfil Slonik Chat en LM Studio Hub: https://lmstudio.ai/kakoka/slonik-27b-chat
- Perfil Slonik Research en LM Studio Hub: https://lmstudio.ai/kakoka/slonik-27b-research
