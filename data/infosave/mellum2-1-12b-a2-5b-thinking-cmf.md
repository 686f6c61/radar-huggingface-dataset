# infosave/Mellum2.1-12B-A2.5B-Thinking-CMF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-CMF es una conversion cuantizada del checkpoint JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicada por el usuario infosave para su ejecucion en local con el runtime Cortiq. No es un modelo nuevo ni un ajuste fino: es el mismo modelo base empaquetado en un unico fichero `.cmf` de 6.884.556.163 bytes (6,41 GiB) que incluye tokenizer y plantilla de chat mapeados en memoria, con un perfil de cuantizacion mixto pensado para aprovechar la estructura dispersa de la arquitectura.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) de 28 capas, 64 expertos con enrutamiento top-8, 12,15 mil millones de parametros totales y 2,5 mil millones activos por token. La atencion es hibrida: 21 capas de ventana deslizante de 1.024 tokens y 7 capas de atencion completa con YaRN, con un contexto declarado de 131.072 tokens. Mellum2.1 es la revision de Mellum2 centrada en post-entrenamiento, principalmente aprendizaje por refuerzo sobre repositorios reales para codigo agentico, uso de herramientas, matematicas y razonamiento, e incorpora un modo de pensamiento que emite cadena de razonamiento antes de la respuesta final.

La relevancia de esta ficha concreta esta en el artefacto: es una via de inferencia local en CPU con metricas reproducibles publicadas por el autor, mas rutas opcionales Metal y Vulkan, sin depender de un stack CUDA ni de pesos BF16. La licencia Apache-2.0 del modelo base se mantiene en la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 28 capas, 64 expertos, enrutamiento top-8; atencion hibrida (21 capas sliding-window de 1.024 tokens + 7 capas full-attention con YaRN) |
| Parametros totales | 12,15 B |
| Parametros activos | 2,5 B por token |
| Longitud de contexto | 131.072 tokens declarados por la arquitectura upstream |
| Tipos de cuantizacion | Perfil CMF mixto: Q4TP en matrices de expertos; Q8_2f en atencion, embedding y capa de salida (siempre activas); F16 en router y normalizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (un unico fichero `.cmf` mapeado en memoria; `mellum2.1-12b-a2.5b-thinking-q4tp.cmf`) |
| Tamano del artefacto | 6.884.556.163 bytes (6,41 GiB) |
| SHA-256 del artefacto | `1734d8c585134547efa6eb60f092fd741135fe0f398fe9dc77ab4b97df6a7175` |
| Revision upstream fijada | `92ddae9fc7665e9f801d141d2e5a6b2caf2460c4` |
| Runtime | Cortiq CLI 0.8.14 (libreria `cortiq`) |
| Tensores validados | 5.631 hashes verificados con `cortiq verify` |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint JetBrains/Mellum2.1-12B-A2.5B-Thinking, sin cambios respecto a Mellum2: 28 capas de mezcla de expertos con 64 expertos y enrutamiento top-8, lo que da 12,15 B de parametros totales con solo 2,5 B activos por token. La atencion combina 21 capas de ventana deslizante de 1.024 tokens con 7 capas de atencion completa que emplean YaRN para extender el contexto hasta los 131.072 tokens declarados, y utiliza un esquema de doble RoPE (dual RoPE schedule). El repositorio de conversion incluye cobertura de regresion especifica para ese doble schedule de RoPE, los metadatos de atencion deslizante, el contrato top-8 del MoE y el perfil de cuantizacion mixto.

Segun la informacion disponible, el grueso del trabajo de la version 2.1 respecto a Mellum2 fue de post-entrenamiento, fundamentalmente aprendizaje por refuerzo ejecutado sobre repositorios reales y orientado a codigo agentico, uso de herramientas, matematicas y razonamiento. No se detalla en la documentacion consultada el numero de tokens de entrenamiento, la composicion del dataset ni si se usaron tecnicas adicionales como DPO. La contribucion tecnica de este artefacto concreto es la conversion CMF: se gasta precision donde cada token pasa (Q8_2f en atencion, embedding y salida; F16 en router y normalizaciones) y se comprime el banco de expertos dispersos a Q4TP, manteniendo tokenizer y plantilla de chat en el mismo fichero. El autor indica explicitamente que la conversion no es sin perdidas y que puede alterar logits y completaciones.

## Capacidades

- Generacion de texto y respuestas conversacionales con plantilla de chat embebida.
- Modo de pensamiento (thinking): emite cadena de razonamiento explicita antes de la respuesta final.
- Modo de respuesta directa mediante `--no-think`, que recurre a la plantilla de respuesta directa del modelo.
- Generacion de codigo, con soporte declarado para codigo agentico segun la documentacion de Mellum2.1.
- Uso de herramientas (tool use) segun la descripcion del post-entrenamiento con RL.
- Razonamiento matematico, tambien mencionado entre los objetivos del RL de la version 2.1.
- Razonamiento multi-paso orientado a agentes.
- Servidor local compatible con endpoints `/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz` y `/v1/cortiq/status`.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).

## Casos de uso

- Asistente de codigo en local sin GPU: el artefacto de 6,41 GiB se ejecuta en CPU con Cortiq y ofrece entre 40 y 41 tok/s de decodificacion sostenida en el hardware medido, lo que permite usarlo como ayudante de programacion en estaciones de trabajo sin acelerador dedicado.
- Revision y generacion de funciones con pruebas: pidiendo tareas acotadas como una funcion Python que parsee fechas ISO-8601, el modelo produce implementaciones autocontenidas; conviene reservar presupuesto de salida amplio porque el modo thinking consume tokens antes de la respuesta.
- Integracion en pipelines de CI/CD ligeros: el servidor local expone una API compatible con `/v1/chat/completions`, de modo que se puede invocar desde scripts de pre-commit o de revision de parches sobre loopback, sin enviar codigo a servicios externos.
- Agentes de codigo multi-paso: el post-entrenamiento con RL sobre repositorios reales y el soporte de uso de herramientas lo orientan a tareas de varios pasos, como localizar un fallo, editar ficheros y verificar el resultado.
- Despliegue en entornos con restricciones de red o de privacidad: al ser un unico fichero verificable con SHA-256 y ejecutarse en local con API en loopback, encaja en entornos donde el codigo no puede salir de la maquina.
- Prototipado rapido de funcionalidades sobre hardware Apple o con Vulkan: el fichero CMF puede usar rutas Metal y Vulkan, lo que abre la puerta a portatiles y equipos de escritorio sin CUDA.
- Tareas de razonamiento y matematicas con traza verificable: el modo thinking expone el razonamiento intermedio, util para depurar por que el modelo llego a una conclusion en ejercicios o calculos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes, ni comparaciones de calidad frente al checkpoint BF16. Lo unico publicado son mediciones de rendimiento en CPU y una comprobacion funcional de implementacion.

Rendimiento medido en CPU (cinco ejecuciones independientes del mismo artefacto 0.8.14 sobre un host RunPod compartido, AMD EPYC 7663, 112 CPUs logicas, ~251 GiB de RAM, cuota de contenedor 23,8 nucleos, con `CMF_GPU=0 cortiq bench ... --ctx 512 --tokens 256 --core --ignore-eos --json`):

| Contexto / generacion | Prefill, mediana | Decodificacion sostenida, mediana (rango) | TTFT, mediana (rango) |
|---:|---:|---:|---:|
| 512 / 256 tokens | 38,41 tok/s | 40,73 tok/s (40,62-41,23) | 13,53 s (13,43-13,77) |

Datos adicionales de la medicion: el estado KV observado en la secuencia 767 fue de 87.965.696 bytes (no es el RSS del proceso); una ejecucion corta de 16 tokens en CPU alcanzo un pico de 4.750 MiB de RSS. La politica automatica de workers selecciono 22 hilos, y un barrido acotado de 8, 12, 16, 20, 22, 24 y 28 workers confirmo 22 como el mas rapido para decodificacion sostenida (41,75 tok/s en una calibracion de 128 tokens). En una suite fija de cinco prompts con decodificacion greedy, la version CMF en CPU coincidio con cuatro de las cinco completaciones del modelo origen en BF16 sobre CUDA tras normalizar el marcador de fin upstream; el propio autor aclara que eso es una comprobacion de implementacion, no un benchmark de codigo.

## Requisitos de hardware

- Peso de los pesos: el fichero CMF ocupa 6,41 GiB, por lo que en VRAM el modelo necesita al menos esa cantidad mas el estado KV, las activaciones y el overhead del runtime.
- Estimacion orientativa en GPU: a partir del tamano del fichero, 8 GB de VRAM quedan muy justos y 12 GB o mas dan margen comodo para contexto corto y medio. No hay cifras de VRAM publicadas por el autor para GPU.
- Estado KV medido: 87.965.696 bytes en la secuencia 767. El autor no publica una cifra de memoria para contexto de 131K; las 21 capas de ventana deslizante de 1.024 tokens limitan el crecimiento por token mas alla de esa ventana a las 7 capas de atencion completa, pero no se ofrece una extrapolacion verificada.
- Memoria en CPU: una ejecucion corta de 16 tokens registro un pico de 4.750 MiB de RSS en el host descrito; es una observacion de prompt corto, no una cifra para contexto largo.
- CPU: funciona sin GPU. En el hardware medido (AMD EPYC 7663 con 22 hilos) rinde aproximadamente 40 tok/s de decodificacion y 38 tok/s de prefill con contexto de 512 tokens.
- GPU compatibles: no se publica throughput GPU de extremo a extremo. El artefacto puede usar rutas Metal y Vulkan, y el autor recomienda comprobar el adaptador seleccionado con `cortiq gpu` antes de tratar una ejecucion como acelerada por GPU. No se listan modelos concretos de GPU en la documentacion disponible.
- Despliegue: Cortiq CLI (`cortiq run`, `cortiq serve`, `cortiq bench`, `cortiq verify`) y su servidor HTTP local. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este formato CMF.
- Instalacion: `cargo install cortiq-cli --locked`; el modelo se descarga como un unico fichero desde HuggingFace y conviene verificar el SHA-256 antes de ejecutarlo.
- Seguridad del servidor: el autor recomienda mantener el servidor en loopback salvo que haya un proxy inverso con autenticacion delante.
- Latencia: TTFT mediana de 13,53 s con contexto de 512 tokens en CPU, segun las mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| infosave/Mellum2.1-12B-A2.5B-Thinking-CMF | 12,15 B totales / 2,5 B activos | 131.072 tokens (declarados) | CMF (6,41 GiB) | Apache-2.0 | HuggingFace, runtime Cortiq | Conversion cuantizada; rendimiento CPU medido y publicado |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking | 12,15 B totales / 2,5 B activos | 131.072 tokens (declarados) | Safetensors BF16 (no confirmado en la informacion disponible) | Apache-2.0 | HuggingFace | Modelo origen; sin datos de benchmark publicados en la informacion consultada |
| JetBrains/Mellum2-12B-A2.5B-Thinking-SFT | 12 B totales / 2,5 B activos | no disponible | no disponible | no disponible | HuggingFace | Variante SFT de la generacion anterior |
| Conversion GGUF de Mellum2-12B-A2.5B-Thinking (local-ai-zone) | 12 B totales / 2,5 B activos | no disponible | GGUF (7,09 GB) | no disponible | Repositorio de terceros | 3.425 descargas y 9 likes en el momento de la busqueda; corresponde a Mellum2, no a Mellum2.1 |

No se dispone de datos de benchmarks que permitan comparar calidad con alternativas de la misma categoria; la comparativa anterior es de formato, licencia y disponibilidad, no de rendimiento.

## Limitaciones y advertencias

- La cuantizacion no es sin perdidas: el autor advierte explicitamente de que puede cambiar los logits y las completaciones respecto al checkpoint BF16, aunque `cortiq verify` haya pasado correctamente sobre el contenedor CMF y los 5.631 tensores.
- Superar la verificacion de integridad no garantiza calidad de tarea, seguridad ni equivalencia byte a byte con el modelo original.
- El modo thinking consume presupuesto de salida: hay que reservar suficientes tokens de generacion para el razonamiento mas la respuesta, o usar `--no-think` cuando se quiera una respuesta directa.
- No se declaran idiomas soportados, por lo que no hay garantia documentada de cobertura multilingue mas alla del comportamiento del modelo base.
- No se publican resultados de benchmarks de calidad ni evaluaciones de seguridad; cualquier decision de produccion deberia apoyarse en evaluaciones propias.
- Memoria para contexto largo: el autor solo publica el estado KV a 767 tokens y advierte de que el dato de RSS de 4.750 MiB es una observacion de prompt corto y no una cifra para 131K de contexto.
- No hay cifras publicadas de throughput en GPU; el rendimiento en Metal o Vulkan es indeterminado hasta disponer de un registro de hardware reproducible.
- El servidor local expone endpoints sin autenticacion por defecto; debe mantenerse en loopback o protegerse con un proxy inverso autenticado.
- Riesgo de alucinacion y de codigo incorrecto: la prueba de humo de cinco prompts no sustituye a una revision del codigo generado.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial, pero la informacion disponible no aclara condiciones adicionales del autor de la conversion.
- Artefacto muy reciente y con cero descargas y cero likes en el momento de la consulta, por lo que su adopcion y soporte comunitario son todavia inexistentes.
- No se detallan sesgos conocidos del modelo en la informacion consultada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/Mellum2.1-12B-A2.5B-Thinking-CMF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Revision upstream fijada: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking/tree/92ddae9fc7665e9f801d141d2e5a6b2caf2460c4
- Repositorio de Cortiq: https://github.com/infosave2007/cmf
- Mediciones completas: https://huggingface.co/infosave/Mellum2.1-12B-A2.5B-Thinking-CMF/blob/main/BENCHMARKS.md
- Fichero de mediciones: https://huggingface.co/infosave/Mellum2.1-12B-A2.5B-Thinking-CMF/blob/main/measurements.json
- Variante SFT de Mellum2: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking-SFT
- Ficha de referencia de Mellum2.1 Thinking: https://www.llmreference.com/model/mellum2-1-12b-thinking
- Resumen del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mellum2-12b-a2.5b-thinking-jetbrains
- Conversion GGUF de terceros de Mellum2: https://local-ai-zone.github.io/models/mellum2-12b-a2-5b-thinking.html
