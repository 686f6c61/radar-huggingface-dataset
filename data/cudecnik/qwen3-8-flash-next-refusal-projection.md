# Cudecnik/Qwen3.8-Flash-Next-refusal-projection

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un **vector de control** en formato GGUF (480 KB) que elimina la direccion de rechazo (*refusal*) del modelo Qwen3.8-Flash-Next proyectandola fuera del *residual stream* durante la inferencia. Lo publica el usuario Cudecnik bajo licencia `qwen-community-1.0` y va acompanado de dos parches MIT para llama.cpp que anaden soporte de *control vectors* con modo proyeccion a la arquitectura `qwen4exp`, ademas de un `AGENTS.md` con instrucciones de instalacion paso a paso. El repositorio no aloja pesos: el vector se aplica en tiempo de carga sobre cualquier cuantizacion del modelo base.

La innovacion tecnica es el operador: en lugar de la suma aditiva habitual de llama.cpp (`h += s · v`), aplica una proyeccion `h -= s · (h·v) v` por capa. Segun los datos del autor, esto reduce los rechazos en prompts daninos de 50/50 (modelo original) a 1/50 con una divergencia KL de 0,186 nats sobre texto neutro, frente a 1,376 nats del modo aditivo, y mantiene el 93% de la velocidad de decodificacion del modelo original. El vector se genera como diferencia media de activaciones entre prompts inofensivos y daninos en todas las posiciones, con una direccion unitaria por capa para las capas 4 a 44 de 48.

Su relevancia es doble: por un lado, es una herramienta de investigacion sobre mecanismos de rechazo y alineacion; por otro, es un ejemplo de publicacion de *abliterations* como artefactos desacoplados del modelo, con un coste de almacenamiento practicamente nulo. Conviene advertir que las cifras y los identificadores proceden exclusivamente de la model card del autor y no se han podido verificar de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: vector de control GGUF aplicado sobre la arquitectura `qwen4exp` del modelo base Qwen3.8-Flash-Next (detalle de la arquitectura del base: no disponible) |
| Parametros totales | 120.320 (dato de los metadatos del repositorio, sin unidad y no verificable; el repositorio no contiene pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo de `llama-server` para el modelo base) |
| Tipos de cuantizacion | El vector se distribuye sin cuantizar (GGUF de 480 KB) y es compatible con cualquier cuantizacion del base; medido con Unsloth UD-Q2_K_XL. En el ejemplo se usa cache `-ctk q4_0 -ctv q4_0` |
| Idiomas soportados | No disponible |
| Licencia | `qwen-community-1.0` (los parches de llama.cpp son MIT) |
| Formato de pesos | GGUF (formato de control vector de ggml); no contiene pesos del modelo |
| Modo de aplicacion | `project` (`h -= s·(h·v)v`); existe tambien `add` (aditivo) |
| Escala | 1.0 (modo proyeccion) |
| Capas afectadas | 4 a 44 (de 48) |
| Tamano del artefacto | 480 KB |
| Tamano del repositorio | 0,0 GB |
| Autor | Cudecnik |
| Fecha de creacion | 2026-09-17 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un *control vector* en formato GGUF con una direccion unitaria por capa, calculada como la diferencia media entre activaciones de prompts inofensivos y daninos, agregada sobre todas las posiciones del prompt. La aplicacion es una proyeccion por capa sobre el *residual stream* (`h -= s · (h·v) v`), con escala 1.0 y el rango de capas 4 a 44 de un total de 48. No hay entrenamiento de pesos ni ajuste fino: el modelo base permanece intacto y el efecto se activa o desactiva anadiendo o quitando un flag en la linea de comandos.

La parte de ingenieria es tan relevante como el vector. llama.cpp estandar ignora silenciosamente `--control-vector*` en esta arquitectura porque el grafo `qwen4exp` nunca invoca `build_cvec`, y ademas carece de modo proyeccion; los dos parches del repositorio (`01-qwen4exp-cvec-hooks.patch` y `02-cvec-projection-mode.patch`) anaden ambos, contra el master `159b74142` de llama.cpp. La rama `cvec-hooks` de `Cudila/llama.cpp` ya los incorpora. El autor declara que el modo aditivo requiere el fichero `Qwen3.8-Flash-Next-refusal-additive.gguf` con escala 0,05-0,15 sobre las capas 16 a 32, un rango distinto del usado en proyeccion.

## Capacidades

- Eliminacion de rechazos: reduce las negativas del modelo base ante prompts daninos de 50/50 a 1/50 en la evaluacion del autor, manteniendo 2/50 en el conjunto de prompts inofensivos (las mismas cifras que el modelo original).
- Aplicacion no destructiva: funciona sobre cualquier cuantizacion de Qwen3.8-Flash-Next, incluida UD-Q2_K_XL de Unsloth, y se desactiva eliminando un flag sin tocar los pesos.
- Bajo coste de almacenamiento: 480 KB adicionales frente a los GB de una publicacion de pesos abliterados completa.
- Menor deriva que el modo aditivo: 0,186 nats de divergencia KL frente a 1,376 nats, medidos token a token contra los logits del modelo original sobre texto neutro.
- Compatibilidad con llama.cpp y llama-server: se integra mediante `--control-vector-scaled`, `--control-vector-layer-range`, `--cvec-mode project` y `--cvec-dir per-layer`, y admite despliegue detras de llama-swap como segunda entrada junto al modelo sin modificar.
- Automatizacion de la instalacion: el repositorio incluye `AGENTS.md`, un guion de configuracion paso a paso con verificacion tras cada etapa para Linux y Windows, pensado para asistentes tipo Claude Code, Codex, Cursor o aider.
- No se declaran capacidades propias del modelo base (vision, audio, tool calling, agentes o multilingueismo) en la informacion disponible; el vector no anade ninguna de ellas.

## Casos de uso

- Investigacion sobre mecanismos de rechazo: el vector permite activar y desactivar la direccion de rechazo sobre un mismo modelo y cuantizacion, aislando el efecto de la intervencion frente a las diferencias de pesos, lo que facilita experimentos controlados de interpretabilidad.
- Evaluacion de seguridad y *red teaming*: sirve para comprobar como responde un modelo con el alineamiento de seguridad suprimido, con una metrica de deriva (KL de 0,186 nats) que acota cuanto del comportamiento observado se debe a la intervencion y no a un cambio general del modelo.
- Investigacion comparativa de tecnicas de *steering*: al publicar el mismo concepto en modo proyeccion y modo aditivo (con rangos de capas y escalas distintos), permite comparar dos familias de intervencion bajo identicas condiciones de hardware y cuantizacion.
- Analisis de degradacion de calidad: la medicion de divergencia KL token a token y de velocidad de decodificacion (93% del original) da una base cuantitativa para estudiar el coste de eliminar una direccion del *residual stream* a lo largo de 40 capas.
- Generacion de datos y prompts de contraste: util para construir conjuntos de respuestas con y sin rechazo partiendo del mismo modelo base, manteniendo constante el resto de variables.
- Entornos locales con restricciones de memoria extrema: al ocupar 480 KB y aplicarse sobre una cuantizacion UD-Q2_K_XL con 37 capas descargadas a CPU (`-ncmoe 37`), encaja en configuraciones de 32 GB de VRAM y 96 GB de RAM descritas por el autor, sin anadir disco ni VRAM.
- Despliegue experimental en llama-swap: se puede mantener una instancia con el vector y otra sin el, con distinto `ttl`, para comparar respuestas en tiempo de ejecucion desde la misma maquina.

## Benchmarks y rendimiento

| Metrica | Proyeccion (este repositorio) | Vector de control aditivo | Modelo original |
|---|---|---|---|
| Divergencia KL (media en texto neutro, nats) | 0,186 | 1,376 | 0 (por definicion) |
| Rechazos en 50 prompts daninos | 1/50 | 0/50 | 50/50 |
| Rechazos en 50 prompts inofensivos | 2/50 | 0/50 | 2/50 |
| Velocidad de decodificacion | 93% del original | 93% | 100% |

Notas sobre la evaluacion segun el autor: se puntua sobre 50 prompts daninos y 50 inofensivos reservados, con el modo *thinking* desactivado (256 tokens) y activado (2048 tokens, juzgando el cuerpo posterior a `</think>` y excluyendo respuestas truncadas). Las salidas rotas o vacias cuentan como no conformes. El unico rechazo restante en el conjunto danino es una advertencia de capacidad ("no puedo verificar..."), contabilizada en contra. Los dos rechazos del conjunto inofensivo no corresponden a los mismos prompts en ambas columnas: uno es compartido (una peticion de noticias del ultimo mes) y el otro es una declinacion por corte de conocimiento en el modelo original y una declinacion por "no tengo experiencia personal" con el vector. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no se aportan datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para el vector: practicamente nula (480 KB), pero la aplicacion exige el modelo base completo, cuyo consumo depende de la cuantizacion elegida; no se proporcionan cifras de VRAM para el base.
- Configuracion de referencia del autor: tarjeta de 32 GB de VRAM con 96 GB de RAM, usando UD-Q2_K_XL y descargando 37 capas a CPU con `-ncmoe 37 -ot per_layer_token_embd=CPU`.
- *Consumer GPU*: el autor afirma explicitamente que, sin `-ncmoe` y `-ot`, este modelo no cabe en ninguna tarjeta de consumo; con esos flags la configuracion descrita (32 GB + 96 GB de RAM) es la minima publicada. No se indican modelos concretos de GPU (RTX 4090, A100, H100) en la informacion disponible.
- Contexto amplio: el ejemplo usa `-c 262144`, `-fa on`, `-ub 1024` y cache KV cuantizada a `q4_0` tanto para K como para V.
- Concurrencia: `-np 1` es obligatorio; el *lightning indexer* de `qwen4exp` lanza un assert en atencion por lotes, con o sin el vector aplicado.
- Opciones de despliegue: solo llama.cpp/llama-server parcheado (parches del repositorio o rama `cvec-hooks` de `Cudila/llama.cpp`), y llama-swap para gestionar instancias. vLLM, TGI, Ollama y otras pilas no soportan este mecanismo segun la informacion disponible.
- Latencia y throughput: la decodificacion se mantiene al 93% de la velocidad del modelo original, tanto en modo proyeccion como aditivo. No se publican valores absolutos de tokens por segundo.
- Verificacion en arranque: el servidor debe imprimir `apply: control vector mode = project, dir = per-layer, layers 4..44`; si esa linea no aparece, los flags se han descartado y se esta ejecutando el modelo sin modificar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada. La comparacion relevante es entre las tres configuraciones descritas por el autor, ya que el artefacto es una intervencion sobre Qwen3.8-Flash-Next y no un modelo independiente:

| Configuracion | Modo | Capas y escala | Deriva (KL) | Rechazos daninos | Licencia |
|---|---|---|---|---|---|
| Este repositorio | Proyeccion (`h -= s·(h·v)v`) | 4-44, escala 1.0 | 0,186 nats | 1/50 | `qwen-community-1.0` (+ parches MIT) |
| Vector aditivo (`refusal-additive.gguf`) | Aditivo (`h += s·v`) | 16-32, escala 0,05-0,15 | 1,376 nats | 0/50 | `qwen-community-1.0` |
| Qwen3.8-Flash-Next original | Sin intervencion | No aplica | 0 nats | 50/50 | `qwen-community-1.0` |

No se dispone de comparacion con otros modelos de la misma categoria (por ejemplo, otras publicaciones *abliterated* o *uncensored* de la misma familia o tamano), ni de datos de parametros, contexto o rendimiento del modelo base que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje: es un vector de control de 480 KB. Cualquier evaluacion de calidad, razonamiento o conocimiento depende integramente del modelo base, del que no se aportan datos.
- La finalidad es suprimir el mecanismo de rechazo del modelo. Esto elimina barreras de seguridad y puede facilitar la generacion de contenido danino, ilegal o inseguro; su uso en produccion orientada a usuarios finales conlleva riesgo legal y reputacional.
- La licencia `qwen-community-1.0` impone condiciones de uso sobre el modelo base; el autor remite al fichero LICENSE del repositorio de Qwen. No se detallan aqui las restricciones de uso comercial, que deben consultarse antes de cualquier despliegue. Los parches de llama.cpp son MIT.
- Las cifras (1/50 rechazos, KL de 0,186 nats, 93% de velocidad) proceden unicamente del autor, sobre 50+50 prompts reservados y con criterios de evaluacion definidos por el propio autor; no se han replicado de forma independiente y el unico rechazo restante se contabiliza en su contra, lo que sugiere un sesgo de autoexigencia no cuantificable.
- Deriva no nula: pese a ser menor que la del modo aditivo, 0,186 nats de divergencia KL implican cambios en la distribucion de salida del modelo sobre texto neutro en 40 capas. No se documenta su efecto sobre tareas de razonamiento, codigo o matematicas.
- Restricciones operativas: `-np 1` obligatorio, necesidad de compilar llama.cpp con parches sobre una revision concreta del master (`159b74142`), y dependencia de una rama de terceros (`Cudila/llama.cpp`) si no se aplican los parches a mano.
- La fecha de creacion registrada (2026-09-17) y el identificador del modelo base no se han podido verificar de forma independiente; el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Riesgo de alucinacion: no se aportan mediciones de veracidad ni de tasas de alucinacion para el modelo base ni para el modelo con el vector aplicado.
- Idiomas soportados: no disponible. No hay informacion sobre comportamiento multilingue.
- La busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo ni con Qwen3.8-Flash-Next; los enlaces obtenidos corresponden a productos sin relacion y se han descartado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Cudecnik/Qwen3.8-Flash-Next-refusal-projection
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizaciones GGUF de referencia (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Rama de llama.cpp con los parches: https://github.com/Cudila/llama.cpp
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Especificacion del formato GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
- Resultados de busqueda web: sin enlaces relevantes sobre este modelo o su modelo base.
