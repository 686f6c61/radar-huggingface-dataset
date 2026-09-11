# josch15366/Qwen3.8-Flash-Next-NVFP4-LocalHessian-Experts

## Resumen

Este repositorio no es un modelo completo, sino un checkpoint parcial publicado por el usuario josch15366 que contiene exclusivamente los tensores de los expertos enrutados (routed experts) de Qwen3.8-Flash-Next, cuantizados en NVFP4 con activaciones de 4 bits (W4A4) y calibrados con un metodo de Hessiano local. Ocupa 63,3 GiB y se distribuye como complemento de RadixArk/Qwen3.8-Flash-Next-NVFP4, del que se reutilizan sin modificar el resto de componentes (PLE, atencion, drafter MTP y capas densas). No es servible por si solo: requiere combinarse con el checkpoint base para formar un modelo desplegable en vLLM estandar, sin parches.

Su relevancia es fundamentalmente metodologica dentro del campo de la cuantizacion de modelos MoE. El autor documenta que la mejora de calidad no proviene del metodo de calibracion (Hessiano local), sino de la granularidad del parametro `weight_scale_2`: mientras el checkpoint base deriva una escala por bloque de 128 expertos, esta version deriva una escala por experto. Ese cambio, medido sobre 59 pasajes de Wikipedia en 11 idiomas (70.734 tokens puntuados), reduce la NLL/token de 1,7379 a 1,7227, con una mejora especialmente marcada en escritura devanagari. El autor indica ademas que una build equivalente con escala simple `max` por experto, sin datos de calibracion, capturo el 69 % de la mejora global, lo que rebaja el papel del metodo de calibracion a un incremento marginal.

El artefacto se enmarca en un trabajo mas amplio de despliegue de Qwen3.8-Flash-Next en una unica DGX Spark de 128 GB, documentado en abierto. Entre sus advertencias destacan un defecto de generacion libre en tailandes que comparte con el checkpoint base sin modificar, y la retirada de una build anterior por dos errores de contrato de exportacion que corrompian esa misma lengua.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo tensores de expertos enrutados de un modelo MoE; el conjunto de exclusiones del checkpoint base incluye `*.linear_attn.*`, `*.self_attn.*`, `*.ple.*`, `*.mlp.gate*`, `mtp.*`, `lm_head` y embeddings) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con calibracion por Hessiano local para los expertos enrutados; el drafter MTP se excluye de la cuantizacion y permanece en BF16; existe por separado un `lm_head` en FP8 blockwise (606 MiB, otro repositorio) |
| Idiomas soportados | no disponible como lista oficial; la evaluacion publicada cubre 11 idiomas, con grupos destacados en devanagari, tailandes, cirilico, ingles y hebreo |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio declara `library_name: Model Optimizer` y etiquetas ModelOpt / NVFP4; el repositorio ocupa 68,0 GB) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Contenido exacto | `model.language_model.layers.*.mlp.experts.<e>.{gate_proj,up_proj,down_proj}.*` |
| Tamano de los expertos enrutados | 63,3 GiB |
| Repositorio | 68,0 GB |
| Modelos base declarados | Qwen/Qwen3.8-Flash-Next y RadixArk/Qwen3.8-Flash-Next-NVFP4 |
| Libreria | Model Optimizer |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-11 |
| Referencia citada en etiquetas | arxiv:2608.28113 (no verificada en la informacion disponible) |

## Arquitectura y entrenamiento

El objeto publicado es un subconjunto de pesos, no una arquitectura nueva. Los tensores corresponden a las proyecciones `gate_proj`, `up_proj` y `down_proj` de cada experto enrutado de cada capa del bloque MoE, almacenados en NVFP4 con cuantizacion de pesos y activaciones a 4 bits (W4A4). El resto del modelo no se reescribe ni se modifica: segun el autor, todos los demas componentes son identicos bit a bit a los de RadixArk/Qwen3.8-Flash-Next-NVFP4 y no se redistribuyen en este repositorio. El reparto de tamanos declarado es: expertos enrutados 63,3 GiB (este repositorio), PLE 47,7 GiB, atencion 5,1 GiB, expertos del drafter MTP 4,7 GiB en BF16 y 5,0 GiB repartidos entre capas densas, embeddings y `lm_head`, todos ellos procedentes del checkpoint de RadixArk.

No hay entrenamiento ni ajuste fino: es un proceso de optimizacion de pesos. La innovacion tecnica descrita es la granularidad de `weight_scale_2`. El checkpoint base deriva una escala por bloque de 128 expertos (4 por capa, uniforme en todas las capas censadas), mientras que esta build deriva una escala por experto. El autor aisla esa variable: al reconstruir con la granularidad del base y sin cambiar nada mas (escala `max` simple, `--scale2-block 128`), la ventaja global desaparece. Una build `max` simple por experto, sin datos de calibracion, capturo el 69 % de la mejora global y el 87 % de la mejora en devanagari sobre un conjunto de 15 pasajes, superando el incremento del Hessiano solo en 0,0054 (t = -1,18, no concluyente). La conclusion explicita del autor es priorizar la escala por experto antes que el metodo de calibracion.

El checkpoint base emplea ademas un drafter MTP (multi-token prediction) para decodificacion especulativa, excluido de la cuantizacion, y el conjunto de exclusiones sugiere capas de atencion lineal (`*.linear_attn.*`) junto a atencion estandar (`*.self_attn.*`) y embeddings por capa (`*.ple.*`). Los detalles de composicion del dataset de entrenamiento original, numero de tokens y fases de RLHF o DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto multilingue: la evaluacion del autor cubre 11 idiomas con 59 pasajes y 70.734 tokens puntuados, con mejora medida en devanagari, tailandes, cirilico e ingles.
- Inferencia de modelos MoE en produccion: al contener los expertos enrutados cuantizados a 4 bits, reduce el coste de memoria del componente de mayor tamano del modelo.
- Despliegue sin parches: funciona sobre vLLM estandar, a diferencia del `lm_head` FP8 del mismo autor, que requiere vLLM parcheado y TP=1.
- Decodificacion especulativa mediante el drafter MTP del checkpoint base, que se conserva en BF16 y no forma parte de este repositorio.
- Cuantizacion NVFP4 W4A4 reproducible: el pipeline esta documentado en notas abiertas, con verificadores que cubren los contratos de exportacion.
- Combinacion con artefactos complementarios: este checkpoint y el `lm_head` FP8 son independientes entre si y se pueden componer.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio en la informacion proporcionada; corresponden al modelo base, cuya model card no se incluye.

## Casos de uso

- Despliegue autoalojado de un MoE grande en hardware limitado: sustituir los expertos originales por esta version NVFP4 permite alojar el modelo completo en una unica DGX Spark de 128 GB de memoria unificada, que es precisamente el escenario documentado por el autor. El resto de componentes se toma sin cambios del checkpoint de RadixArk.
- Servicio multilingue con scripts indicos: al concentrar la mejora en devanagari (-0,0891 de NLL/token, t = -19,08 sobre 6 pasajes), es util en productos dirigidos a hindi, marati o nepalí, donde la cuantizacion agresiva suele degradar mas la calidad.
- Investigacion en cuantizacion de MoE: sirve como punto de comparacion controlado para estudiar el efecto de la granularidad de escalas (`weight_scale_2`) por experto frente a por bloque, con metodologia y datos publicados en abierto.
- Reduccion de coste de inferencia en pipelines de generacion de texto: bajar de pesos de mayor precision a NVFP4 W4A4 en el componente dominante reduce el ancho de banda de memoria requerido durante la decodificacion, que es el cuello de botella tipico en este regimen.
- Evaluacion de calidad antes de migrar a produccion: los 59 pasajes y 70.734 tokens con NLL/token por idioma permiten reproducir la comparacion contra el checkpoint base antes de adoptar la cuantizacion.
- Ajuste de despliegues multi-GPU: los expertos no imponen la restriccion de TP=1 que si exige el `lm_head` FP8, de modo que se pueden usar en configuraciones con paralelismo de tensor mientras se decide por separado que cabeza de salida servir.
- Auditoria de artefactos de cuantizacion: el historial de la build retirada y los verificadores de contrato de exportacion (`input_scale` con `amax/6` en lugar de `amax/2688`, y `weight_scale_2` no compartida entre `gate` y `up`) sirven como caso de estudio de control de calidad en publicacion de pesos.

## Benchmarks y rendimiento

El autor publica una evaluacion de verosimilitud sobre un conjunto retenido, no benchmarks de tareas. Los datos son NLL/token (menor es mejor) sobre 59 pasajes de Wikipedia, 70.734 tokens puntuados, en 11 idiomas, con los offsets tomados mas alla del corpus de calibracion.

| Comparativa | NLL/token | Diferencia | Estadistico |
|---|---|---|---|
| Esta build (escala por experto) | 1,7227 | -0,0152 frente al base | t = -3,92 (40/59 pasajes a favor) |
| Checkpoint base | 1,7379 | referencia | no aplica |
| Esta build, sin devanagari (n=53) | no disponible | -0,0069 | t = -2,99 |
| Esta build, devanagari (n=6) | no disponible | -0,0891 | t = -19,08 |
| Reconstruccion con granularidad del base (bloque de 128) | no disponible | -0,0012 global | t = -0,72 |
| Reconstruccion con granularidad del base, sin devanagari | no disponible | +0,0002 | t = +0,12 |
| Reconstruccion con granularidad del base, devanagari | no disponible | -0,0133 | t = -2,44 |

Desglose por grupo linguistico de la mejora en NLL/token de esta build frente al base:

| Idioma o grupo | Diferencia de NLL/token |
|---|---|
| Devanagari (6 pasajes) | -0,0891 |
| Tailandes | -0,0249 |
| Cirilico | -0,0104 |
| Ingles | -0,0096 |
| Resto de idiomas | por debajo de 0,006 |
| Hebreo | +0,0021 (unica regresion) |

Otras mediciones declaradas:

| Prueba | Resultado |
|---|---|
| Canary de marcas combinantes | 0/48 corruptos, 48/48 exactos (igual que el base) |
| Generacion libre en tailandes (temp 1,0 / top_p 0,95 / top_k 20) | 5,97 frente a 5,68 por 1000 caracteres tailandeses (z = +0,28, p ≈ 0,78; 30 muestras emparejadas por brazo) |
| Build `max` simple por experto (15 pasajes) | 69 % de la mejora global y 87 % de la de devanagari; incremento del Hessiano solo 0,0054 (t = -1,18) |
| `lm_head` FP8 blockwise (otro repositorio) | +11 % de velocidad de decodificacion, sin coste de calidad medible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos cuantizados: los expertos enrutados de este repositorio ocupan 63,3 GiB (68,0 GB de repositorio). El modelo completo, sumando los componentes no republicados (PLE 47,7 GiB, atencion 5,1 GiB, drafter MTP 4,7 GiB, densas + embeddings + `lm_head` 5,0 GiB), ronda los 125,8 GiB de pesos, sin contar cache KV ni activaciones. Calcule a partir de las cifras declaradas por el autor; no es una medicion de pico de memoria.
- Escenario de referencia: una unica NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada, que es la plataforma sobre la que el autor realizo todas las mediciones.
- GPU de centro de datos: los pesos superan los 80 GB de una H100 o A100 en una sola tarjeta, por lo que el despliegue requiere varias GPU con paralelismo de tensor. No se especifican configuraciones validades en la informacion disponible.
- GPU de consumo: no cabe en tarjetas de consumo. Una RTX 4090 con 24 GB no puede alojar ni una fraccion util del modelo completo, y este repositorio por si solo no es servible.
- Opciones de despliegue: vLLM estandar sin parches es el unico runtime mencionado de forma explicita. No hay informacion sobre soporte en llama.cpp, Ollama, TGI u otros.
- Decodificacion especulativa: el drafter MTP se conserva en BF16 y no forma parte de este repositorio; su uso requiere el checkpoint base.
- Latencia y throughput: no disponibles para esta build. El unico dato de velocidad publicado corresponde al repositorio separado del `lm_head` en FP8 (+11 % de decodificacion), artefacto distinto y con requisitos distintos (vLLM parcheado y TP=1).

## Comparativa con modelos similares

La comparacion relevante no es con otros modelos, sino con otras variantes del mismo modelo, ya que este repositorio es un componente parcial.

| Artefacto | Contenido | Tamano | Granularidad de `weight_scale_2` | NLL/token retenida | Requisitos especiales |
|---|---|---|---|---|---|
| Este repositorio | Solo expertos enrutados, NVFP4 W4A4 con Hessiano local | 63,3 GiB (68,0 GB de repo) | Por experto | 1,7227 | vLLM estandar, sin parches |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | Checkpoint completo NVFP4 (PLE, atencion, MTP, densas, expertos) | alrededor de 125,8 GiB en total segun el reparto declarado | Por bloque de 128 expertos | 1,7379 | no disponible |
| Qwen/Qwen3.8-Flash-Next | Modelo base original | no disponible | no aplica | no disponible | no disponible |
| josch15366/Qwen3.8-Flash-Next-FP8-lm_head | Solo la cabeza de salida, FP8 blockwise | 606 MiB | no aplica | sin coste de calidad medible; +11 % de decodificacion | vLLM parcheado y TP=1 |

No se dispone de datos sobre otras alternativas de cuantizacion (GGUF, AWQ, GPTQ) ni sobre modelos de tamano comparable de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo servible por si solo. Contiene unicamente los tensores de los expertos enrutados; requiere el resto de componentes de RadixArk/Qwen3.8-Flash-Next-NVFP4 para funcionar.
- Licencia `other`. No se detallan los terminos, por lo que la viabilidad de uso comercial no esta determinada en la informacion disponible y debe consultarse antes de cualquier despliegue en produccion.
- Defecto de generacion libre en tailandes. Bajo muestreo temp 1,0 / top_p 0,95 / top_k 20, esta build presenta el defecto descrito en vllm#54739 a un ritmo de 5,97 por 1000 caracteres, frente a 5,68 del base sin modificar (z = +0,28, p ≈ 0,78). El autor senala que el fallo no lo introduce la cuantizacion, pero sigue presente.
- Cobertura limitada de la verificacion. El canary de marcas combinantes (0/48 corruptos) es una tarea de copia a temperatura 0 y, segun el propio autor, no cubre la generacion libre.
- Regresion en hebreo. Es el unico grupo linguistico con empeoramiento medido (+0,0021 de NLL/token).
- Causa mal atribuida en lecturas rapidas. La mejora publicada proviene de la granularidad de `weight_scale_2`, no del metodo de calibracion por Hessiano local; el autor lo demuestra aislando la variable. Una build `max` simple por experto sin datos de calibracion alcanza el 69 % de la mejora global.
- Historial de errores de exportacion. Una build anterior fue retirada tras detectarse que corrompia tailandes por dos fallos de contrato (`input_scale` escrita como `amax/6` en lugar de `amax/2688`, y `weight_scale_2` no compartida entre `gate` y `up`). Aunque no se publicaron pesos y ambos fallos estan corregidos con verificadores, ilustra el riesgo de estos pipelines.
- Estadistica agregada, no por tarea. Los datos de calidad son NLL/token sobre pasajes de Wikipedia; no hay MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento, codigo o agentes. La NLL no garantiza el comportamiento en tareas generativas.
- Adopcion nula. El repositorio registra 0 descargas y 0 likes, sin validacion independiente por terceros.
- Idiomas soportados no declarados oficialmente y metadatos incompletos (pipeline no disponible, idiomas no disponibles).
- Riesgo de alucinacion, sesgos y comportamiento conversacional: no evaluados en la informacion proporcionada, ya que corresponden al modelo base y no se incluye su model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/josch15366/Qwen3.8-Flash-Next-NVFP4-LocalHessian-Experts
- Checkpoint base completo (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio separado del `lm_head` en FP8: https://huggingface.co/josch15366/Qwen3.8-Flash-Next-FP8-lm_head
- Notas abiertas del proyecto: https://github.com/jschmied/qwen38-flash-next-gb10
- Historial de la regresion del canary de marcas combinantes: https://github.com/jschmied/qwen38-flash-next-gb10/blob/main/notes/combining-mark-regression.md
- Incidencia de vLLM sobre generacion en tailandes: https://github.com/vllm-project/vllm/issues/54739
- Mapa de cuantizacion de Flash-Next (artefacto del autor): https://claude.ai/code/artifact/3534a530-5e94-4ce2-abac-f1c70ee204e3
- Referencia citada en las etiquetas del repositorio: arxiv:2608.28113 (identificador no verificado en la informacion disponible)

Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (corresponden a direcciones en Moscu) y no aportan informacion adicional.
