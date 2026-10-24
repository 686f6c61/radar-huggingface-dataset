# RESMP-DEV/Flint-40B-A2.5B-RCO-224-MLX-GPTQ-MXFP4

## Resumen

Flint-40B-A2.5B-RCO-224-MLX-GPTQ-MXFP4 es una compilación de terceros del modelo de código abierto Flint de Recursive, un transformer decoder-only con mezcla de expertos (MoE) diseñado para agentes de programación que inspeccionan repositorios, corrigen errores, implementan funcionalidades y escriben tests. El artefacto lo publica RESMP-DEV, no Recursive, y aplica dos transformaciones sobre el modelo base `RecursiveSI/flint`: una poda de expertos enrutados de 256 a 224 por capa MoE y una cuantización MXFP4 calibrada con GPTQ, todo empaquetado en formato MLX para Apple Silicon.

El modelo base declara 39,8B de parámetros totales y unos 2,5B activos por token (top-6 sobre 256 expertos, más un experto compartido siempre activo). Tras la poda, este artefacto pesa 35.051.032.352 parámetros según los safetensors publicados, manteniendo el routing top-6 intacto. La arquitectura conserva las 49 capas del original (2 densas y 47 MoE), con atención deslizante de 513 tokens en 35 capas y atención completa en 14.

Su relevancia es doble. Por un lado, demuestra una metodología de compresión publicada con mediciones reproducibles: la poda se eligió con una búsqueda exacta leave-one-out bajo los pesos ya cuantizados, y la recalibración GPTQ se aplicó solo a las capas 25-36 tras comprobar por bisección que el resto de bloques empeoraba. Por otro, es un caso poco habitual de artefacto que documenta sus propios experimentos fallidos, con intervalos de confianza bootstrap sobre un corpus de código de casi 2 millones de tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `FlintForCausalLM` (transformer decoder-only con MoE): 49 capas, 2 densas seguidas de 47 MoE, routing top-6 con normalización sigmoid, 1 experto compartido siempre activo; atención deslizante de 513 tokens en 35 capas y atención completa en 14 capas |
| Parámetros totales | 35.051.032.352 (35,05B) en este artefacto podado; el modelo base declara 39,8B |
| Parámetros activos | El modelo base activa ~2,5B por token; no disponible la cifra exacta para el artefacto podado (el routing top-6 no cambia) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4: elementos E2M1 de 4 bits, tamaño de grupo 32, escalas E8M0 por grupo, búsqueda de escala segura; calibración GPTQ con 256 ventanas de 2.048 tokens (semilla 17). Router y experto compartido permanecen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base Apache-2.0; derivado de terceros) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`, `mlx-lm`); no se publican GGUF, ONNX ni versiones para CUDA |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 49 capas, de las cuales las dos primeras son densas y las 47 restantes son capas MoE. Cada capa MoE enruta con top-6 sobre un conjunto de expertos mediante normalización sigmoid y suma un experto compartido que permanece siempre activo, un esquema habitual para estabilizar el entrenamiento y dar capacidad común a todos los tokens. El layout de atención es híbrido: 35 capas usan atención deslizante de 513 tokens y 14 capas usan atención completa, lo que reduce el coste de memoria delKV cache en secuencias largas a costa de una ventana local estrecha en la mayoría de capas.

Este artefacto no entrena nada. Parte de `RecursiveSI/flint` (revisión `2a247be0c0aec895ccb0ac7ca92229ec6df37288`) y aplica dos post-procesos. Primero, una poda de expertos enrutados de 256 a 224 por capa, con una máscara seleccionada mediante búsqueda exacta leave-one-out bajo los pesos GPTQ-MXFP4 ya calibrados: cada capa se carga con sus pesos desquantizados por QDQ, las activaciones provienen de esos pesos y cada experto candidato se elimina dejando que el router promueva al siguiente bajo la normalización sigmoid desplegada. Las rondas voraces retiran 16/8/4/4 expertos por capa. El autor describe el método como una adaptación del objetivo de poda con presupuesto de Riemannian Constrained Optimization (RCO) a las 47 capas MoE de Flint, y aclara explícitamente que no ejecuta el optimizador Gumbel straight-through proyectado original.

Segundo, una cuantización MXFP4 calibrada con GPTQ (E2M1 de 4 bits, grupo 32, escalas E8M0 por grupo, 256 ventanas de calibración de 2.048 tokens, semilla 17) con una particularidad: la calibración es mixta. La mayoría de capas conserva la calibración GPTQ del modelo completo original, mientras que las capas 25-36 usan una recalibración GPTQ posterior a la poda, ejecutada sobre el checkpoint BF16 de 224 expertos materializado. La inyección parcial reemplazó 120 tensores y dejó 364 deliberadamente fuera de la banda seleccionada. Los detalles de datos de preentrenamiento del modelo base (número de tokens, composición del corpus, si hubo RLHF o DPO) no están disponibles en la información proporcionada; la model card de este derivado solo documenta el post-procesado y no se ha ejecutado QLoRA, CPT ni SFT sobre el artefacto.

## Capacidades

- Generación de texto y de código: el modelo base está orientado a tareas de ingeniería de software (investigar bases de código, corregir bugs, implementar funcionalidades, escribir tests).
- Conversación multi-turno: plantilla de chat con marcadores de rol `<|user|>`, `<|assistant|>` y `<|developer|>`.
- Razonamiento agéntico multi-paso: el modelo base se posiciona explícitamente como modelo para agentes de código locales.
- Muestreo recomendado por el proveedor: temperatura 1,0, top-p 0,95, top-k 20.
- Capacidades matemáticas, de visión o de audio: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no documentado en esta ficha; el marcador `<|developer|>` sugiere integración con instrucciones de sistema, pero no se confirma un protocolo de herramientas.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Agente de código en local sobre Mac: con ~19,5 GB de checkpoint cuantizado, el modelo cabe en un Apple Silicon de gama alta y permite ciclos de edición-ejecución sin salir del portátil, algo relevante para trabajo con repositorios privados que no pueden enviarse a una API.
- Investigación de bases de código desconocidas: el modelo base está entrenado para explorar repositorios y localizar la causa de un fallo; la ventana deslizante de 513 tokens en 35 capas mantiene el coste de KV cache contenido al recorrer muchos ficheros en una sesión larga.
- Reparación de bugs dirigida por tests: se le puede pasar el fallo, el test que lo reproduce y los ficheros implicados, y pedirle un parche verificable en un bucle de ejecución de tests.
- Generación de tests unitarios y de integración: el modelo está orientado explícitamente a escribir tests, lo que encaja en pipelines que exigen cobertura antes de aceptar un cambio.
- Revisión de pull requests asistida: con el rol `<|developer|>` se le pueden inyectar convenciones del repositorio y pedirle un análisis de diff con contexto de los ficheros afectados.
- Automatización de tareas de mantenimiento en CI: refactors mecánicos, migraciones de API o actualización de dependencias en lotes, ejecutados en hardware local para evitar coste por token.
- Evaluación de técnicas de compresión: como artefacto de investigación, sirve para reproducir el estudio de poda y recalibración parcial de GPTQ con las máscaras y semillas publicadas (SHA-256 de máscara y de tokens de calibración incluidos en el repo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (SWE-Bench, HumanEval, GSM8K) para este artefacto en la información disponible. El autor lo indica explícitamente: la evidencia de calidad es NLL y top-1 en modo teacher-forced sobre un corpus de código reservado. Las mediciones se hicieron en un M4 Max con `mlx==0.32.4` y el adaptador Flint de `RESMP-DEV/mlx-lm`, sobre 32 ventanas de código agéntico repartidas en un corpus reservado de 1.962.793 tokens, con 1.024 transiciones por ventana y bootstrap de 10.000 remuestras agrupadas por ventana (semilla 173).

| Modelo | PPL | NLL medio | Top-1 | Tamaño del checkpoint |
|---|---:|---:|---:|---:|
| Full 256 MXFP4 | 6,207109 | 1,825695 | 66,891% | 22.075.711.040 B |
| Sliced 224, calibración del modelo completo | 6,206095 | 1,825532 | 66,675% | 19.556.113.984 B |
| **Esta release, mixta capas 25-36** | **6,041248** | **1,798611** | **67,035%** | 19.556.113.984 B |
| Full post-poda con recalibración completa | 6,659809 | 1,896091 | 66,202% | 19.556.113.984 B |

Frente al baseline de 224 expertos con calibración del modelo completo, esta release mejora la NLL emparejada en -0,026921 nats con IC95% [-0,039068, -0,015124], diferencia significativa. Frente al modelo completo de 256 expertos mide -0,027085 nats con IC95% [-0,082272, +0,021674], no significativa en esta muestra. La mejora se replica por mitades: las ventanas 0-15 mejoran -0,021496 nats y las 16-31 mejoran -0,032347 nats.

El desglose por bloques de la recalibración completa justifica la decisión de calibración mixta:

| Bloque recalibrado | PPL | Delta NLL emparejado vs sliced 224 | IC95% | ¿Significativo? |
|---|---:|---:|---|---|
| Capas 2-12 | 6,405000 | +0,031547 | [+0,011517, +0,055056] | sí, peor |
| Capas 13-24 | 6,541808 | +0,052682 | [+0,032362, +0,074386] | sí, peor |
| Capas 25-36 | 6,041248 | -0,026921 | [-0,039068, -0,015124] | sí, mejor |
| Capas 37-48 | 6,269345 | +0,010140 | [+0,003301, +0,018619] | sí, peor |

En cuanto al modelo base, Recursive declara que Flint lidera los MoE por debajo de 50B en SWE-Bench Pro v2, Terminal-Bench 2.1 y SWE-Bench Verified, y que alcanza más de 125 tok/s en un M4 Pro de MacBook Pro. Son cifras del modelo original de 39,8B, no de este derivado podado y cuantizado, y no se han verificado de forma independiente en la información disponible. Un análisis de terceros cita una cifra de 54,9% sin especificar de forma inequívoca a qué benchmark corresponde.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos MXFP4 de 35,05B ocupan aproximadamente 17,5-19,5 GB (la model card reporta 19.556.113.984 B para el checkpoint de 224 expertos); hay que añadir el router y el experto compartido en BF16 y la KV cache, por lo que conviene disponer de 24 GB de memoria unificada como mínimo y 32-48 GB para contextos largos y trabajo agéntico sostenido. Cálculo estimado a partir del tamaño del checkpoint, no medido en la model card.
- GPU compatibles: no aplica a CUDA. El artefacto es MLX y requiere Apple Silicon (serie M). Las mediciones del autor se hicieron en un M4 Max.
- ¿Cabe en GPU de consumo? No en el sentido habitual: no hay kernels CUDA ni versión GGUF publicada. En Apple Silicon cabe en equipos con memoria unificada suficiente (M4 Max y configuraciones equivalentes de 36 GB o más).
- Opciones de despliegue: `mlx-lm` con el fork `RESMP-DEV/mlx-lm` (adaptador Flint) y `mlx_lm.generate`. No hay soporte publicado para vLLM, TGI, llama.cpp ni Ollama con estos pesos.
- Latencia y throughput: no disponibles para este artefacto. Como referencia del modelo base sin podar, Recursive declara más de 125 tok/s en un M4 Pro; el autor menciona además un kernel Metal personalizado en el ecosistema de inferencia de Flint, sin cifras asociadas a esta build.
- Espacio en disco: el repositorio ocupa 39,1 GB, por encima del tamaño del checkpoint cuantizado, así que hay que reservar ese espacio completo para la descarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / cuantización | PPL (corpus del autor) | Top-1 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Este artefacto (224 expertos, calibración mixta) | 35,05B (39,8B en el base) | MLX MXFP4 + GPTQ | 6,041248 | 67,035% | Apache-2.0 | público en HF, 0 descargas |
| `RESMP-DEV/Flint-40B-A2.5B-MLX-GPTQ-MXFP4` (256 expertos, sin poda) | 39,8B | MLX MXFP4 + GPTQ | 6,207109 | 66,891% | Apache-2.0 | público en HF |
| `RecursiveSI/flint` (modelo base) | 39,8B totales, ~2,5B activos | pesos originales del autor | no disponible | no disponible | Apache-2.0 | público en HF |
| Full post-poda con recalibración completa | 35,05B | MLX MXFP4 + GPTQ | 6,659809 | 66,202% | Apache-2.0 | variante experimental descrita en la model card |

La comparación útil aquí es interna al linaje Flint: este artefacto sacrifica 32 de 256 expertos por capa a cambio de un checkpoint un 11,4% más pequeño (19,56 GB frente a 22,08 GB) y, con la calibración mixta, una perplejidad inferior a la del modelo completo en el corpus medido. No se dispone de comparaciones con modelos de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- No se ejecutó ningún benchmark a nivel de tarea agéntica sobre este artefacto. Toda la evidencia de calidad son NLL y top-1 en modo teacher-forced sobre un único corpus reservado de código, lo que no predice directamente el éxito en SWE-Bench o en tareas reales de agente.
- La banda de capas 25-36 se eligió por bisección sobre el mismo holdout de 32 ventanas y luego se validó en sus dos mitades, no en un corpus disjunto. El propio autor advierte que debe tratarse como una decisión de ingeniería medida, no como una regla general sobre qué capas se benefician de recalibrar.
- La selección de la máscara de expertos es una adaptación del objetivo de RCO, no el optimizador RCO original; los resultados no son directamente comparables con los del paper.
- La decodificación greedy no es la configuración de muestreo validada por el proveedor (temperatura 1,0, top-p 0,95, top-k 20); usar greedy puede degradar la calidad de forma no medida.
- No se ha aplicado QLoRA, CPT ni SFT: el modelo no está ajustado para instrucciones específicas más allá de lo que traiga el base.
- La poda de expertos puede degradar capacidades poco frecuentes de forma desigual entre capas; el agregado de perplejidad no revela qué habilidades concretas se pierden.
- Riesgo de alucinación de APIs, ficheros y funciones inexistentes, habitual en modelos de código; en contextos agénticos conviene validar toda salida ejecutando tests.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés técnico habitual en código.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el artefacto es un derivado de terceros no respaldado por Recursive; conviene revisar la licencia y los términos del modelo base antes de desplegarlo en producción.
- Dependencia de un fork específico de `mlx-lm` (`RESMP-DEV/mlx-lm`): el artefacto no funcionará con `mlx-lm` estándar sin el adaptador Flint, lo que añade riesgo de mantenimiento.
- Longitud de contexto no documentada: no se puede planificar el tamaño de las ventanas de entrada sin medirla empíricamente.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace (este artefacto): https://huggingface.co/RESMP-DEV/Flint-40B-A2.5B-RCO-224-MLX-GPTQ-MXFP4
- HuggingFace (variante sin poda, 256 expertos): https://huggingface.co/RESMP-DEV/Flint-40B-A2.5B-MLX-GPTQ-MXFP4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Fork de mlx-lm con el adaptador Flint: https://github.com/RESMP-DEV/mlx-lm
- Paper de RCO (Helcig, 2026): https://arxiv.org/abs/2605.00649
- Paper de GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- Análisis de terceros, Recursive Flint: https://ai-tldr.dev/models/recursive-flint/
- Análisis de terceros, rendimiento local: https://www.orcarouter.ai/blog/flint-40b-a2-5b-local-coding
- Noticia de lanzamiento del modelo base: https://aicoder.com/news/news-20261022-recursive-flint-40b-a2-5b-open-weights-local-coding-model
- Ficha técnica de terceros: https://cellcog.ai/blog/recursive-flint/
