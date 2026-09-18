# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-vs16

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-vs16` es un checkpoint de aprendizaje por refuerzo (RL) obtenido mediante GRPO con la librería OpenRLHF sobre el modelo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo entrenado desde cero ni un modelo final publicado: se trata de una instantánea intermedia guardada en el **paso global 4** de una ejecución de RL denominada internamente `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v3_vs16`, en la que el autor lo marca como "el mejor por pass@8" de la ejecución hasta ese momento.

El objetivo del entrenamiento es mejorar la **generación de código verificable**: la señal de recompensa es binaria (1.0 si el programa generado supera los tests del problema, 0.0 en caso contrario). El modelo se entrenó y validó sobre el llamado *frontier* `cobalt-train ≤2/64`, un subconjunto de problemas que el modelo base resolvía en como máximo 2 de cada 64 muestras, es decir, problemas deliberadamente difíciles para el modelo de partida (1833 problemas de entrenamiento y 112 de validación retenidos).

Se trata de una publicación de investigación reproducible (el autor documenta receta, logs y ruta del log local), con 0 descargas y 0 *likes* en el momento de la consulta, licencia no declarada y sin resultados de evaluación publicados en la model card. Su interés principal es metodológico: muestra una receta concreta de GRPO sin penalización KL, con penalizaciones anti-truncamiento (estilo ProRL y DAPO) aplicada directamente sobre un modelo instruct de 4,4 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B; detalles de configuracion no disponibles en la informacion proporcionada) |
| Parametros totales | 4.411.424.256 (~4,4 B), segun los safetensors del repositorio |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible: no se publican pesos GGUF, GPTQ ni AWQ. El sufijo `q4v3` del nombre forma parte del identificador de la ejecucion de RL, no implica una cuantizacion publicada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers; revision `main` con los pesos en la raiz del repositorio) |

Nota de tamano: el repositorio ocupa 17,7 GB, una cifra coherente con pesos almacenados en fp32 (4.411.424.256 parametros x 4 bytes ≈ 17,65 GB). El *dtype* exacto no se confirma en la model card, por lo que la conversion a bf16 o fp16 antes del despliegue puede ser necesaria o conveniente.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-4B-Instruct-2507`: un transformer decoder-only denso de aproximadamente 4,4 mil millones de parametros. Este checkpoint no modifica la arquitectura; lo que cambia son los pesos, ajustados mediante RL. Es importante subrayar que el entrenamiento **no parte de un SFT seed**: se aplica RL directamente sobre el modelo instruct de Qwen, segun indica el autor ("no SFT seed — RL applied directly to the base model").

La receta de RL esta documentada con detalle inusual. Se usa **GRPO** con ventajas normalizadas por grupo y **sin penalizacion KL** (no hay termino que ancle los pesos al modelo de referencia, lo que permite mayor deriva respecto al base). La recompensa es binaria por correccion de codigo. Se incorporan dos mecanismos de control de longitud y truncamiento: una *stop-properly penalty* de estilo ProRL que asigna recompensa **-1.0** a las muestras truncadas, y una penalizacion *overlong* de estilo DAPO que aplica un castigo aditivo creciente hasta **-0.25** a las respuestas situadas en los ultimos **1024** tokens antes del limite. El resto de hiperparametros: 8 muestras por prompt, tamano de lote de rollout 128, tamano de lote de entrenamiento 128, maximo de 4096 tokens nuevos por rollout, 2 episodios, tasa de aprendizaje del actor 1e-06 con schedule constante, y guardado en el paso global 4.

El conjunto de datos de entrenamiento es el *frontier* `cobalt-train ≤2/64`, derivado de una exploracion de dureza `iid_canonical@64`: problemas que el modelo base resolvia en 2 de 64 muestras como maximo (1833 de entrenamiento, 112 de validacion retenidos). Las evaluaciones de validacion se hacen con temperatura 1.0, igual que la evaluacion del frontier original. No se detalla la composicion tematica del dataset ni su procedencia mas alla de esta descripcion.

## Capacidades

- Generacion de texto y codigo: el ajuste por RL se orienta especificamente a producir programas que superen tests automatizados, con recompensa binaria de correccion.
- Razonamiento orientado a problemas de programacion dificiles: entrenado sobre problemas que el modelo base resolvia en ≤2 de 64 intentos, es decir, en la frontera de su capacidad.
- Generacion de soluciones largas: la ventana de rollout permite hasta 4096 tokens nuevos por respuesta, con gestion explicita de respuestas truncadas.
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (formato instruct, chat multi-turno, posible modo de razonamiento segun el modelo base): **no verificadas** en la informacion proporcionada para este checkpoint concreto.
- Tool calling / function calling: no documentado para este checkpoint; dependeria de lo preservado del modelo base tras el RL.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el entrenamiento es de un solo turno con verificacion por tests.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (vision, audio, *thinking mode* explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de codigo verificable en un dominio acotado: el modelo esta optimizado para tareas donde existe una bateria de tests que valida la solucion; se usaria en pipelines de evaluacion con ejecucion real del codigo generado, no en generacion de codigo "a ojo".
- Investigacion en RL para codigo: sirve como punto de comparacion reproducible en experimentos de GRPO, ya que el autor publica la receta completa (algoritmo, penalizaciones, lotes, tasa de aprendizaje) y la ubicacion de los logs.
- Estudio de penalizaciones anti-truncamiento: dado que implementa a la vez la *stop-properly penalty* (-1.0) y la penalizacion *overlong* de DAPO (rampa hasta -0.25 en los ultimos 1024 tokens), es util para analizar como afectan al comportamiento de longitud de las respuestas.
- Continual fine-tuning con RL: al ser un checkpoint intermedio del paso 4, puede utilizarse como inicializacion para seguir entrenando, aunque el autor no documenta ni garantiza la reanudacion del run.
- Analisis de deriva sin KL: la ausencia de penalizacion KL lo convierte en un caso de estudio para medir cuanto se aleja un modelo instruct de su distribucion original al aplicar RL puro.
- Evaluacion comparativa de checkpoints: dentro de la propia ejecucion, el autor lo identifica como el mejor por pass@8 hasta ese paso, por lo que es el candidato natural para comparar contra pasos posteriores o contra el modelo base.
- Reproduccion de experimentos en solitario: el modelo cabe en una GPU de consumo en precision reducida, lo que facilita replicar la receta con OpenRLHF en entornos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que las metricas de evaluacion de este checkpoint no estan disponibles en el *train log* ("Eval metrics at this checkpoint: not available in the train log"), y solo afirma que es el mejor checkpoint por **pass@8** de la ejecucion hasta ese paso, sin proporcionar la cifra. No hay datos de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra suite.

| Metrica | Resultado | Nota |
|---|---|---|
| pass@8 | No disponible (cifra no publicada) | El autor lo describe como el mejor checkpoint de la ejecucion hasta el momento, sin valor numerico |
| Tareas de validacion `cobalt-train ≤2/64` | No disponible | 112 problemas de validacion retenidos; resultado no publicado en la model card |
| MMLU / HumanEval / GSM8K / MBPP | No disponible | No se han publicado en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada en fp32 (estado tal cual se publica, segun el tamano del repositorio): aproximadamente 17,7 GB solo de pesos, mas cache KV y activaciones. Requiere GPU de 24 GB o mas, o bien conversion previa de precision.
- VRAM estimada en bf16/fp16 (tras conversion): aproximadamente 8,8 GB de pesos, mas cache KV. Se puede servir con holgura en GPUs de 16-24 GB.
- VRAM estimada en int8: aproximadamente 4,5 GB de pesos. Requiere cuantizacion propia, ya que el repositorio no publica variantes cuantizadas.
- VRAM estimada en int4: aproximadamente 2,5-3 GB de pesos. Requiere cuantizacion propia (GPTQ, AWQ o GGUF).
- GPUs recomendadas: A100 40/80 GB, H100, L40S o A6000 para fp32 sin conversiones y despliegue multiusuario; RTX 4090, RTX 3090, RTX 4080 o A6000 para bf16 tras conversion.
- Cabe en GPU de consumo: si. En bf16 o fp16 cabe en tarjetas de 12-16 GB o superiores; en int4 puede caber en GPUs de 6-8 GB, siempre que el usuario genere la cuantizacion.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (documentado por el autor, revision `main`, pesos en la raiz del repositorio) y **vLLM** (`vllm serve <repo> --revision main`, tambien documentado). El repositorio lleva la etiqueta `text-generation-inference`, por lo que TGI es una via razonable. llama.cpp u Ollama requeririan convertir previamente a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base declarado. El resto de alternativas de la misma categoria no pueden compararse con datos verificados, por lo que se indica "no disponible" en lugar de estimar valores.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`cobalt-seeded-rl-base-...-vs16`) | 4,4 B (4.411.424.256) | No disponible | No disponible | safetensors | Checkpoint RL en el paso global 4, mejor por pass@8 de su ejecucion, sin metricas publicadas |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 B (nominal; cifra exacta no confirmada en la informacion proporcionada) | No disponible | No disponible | safetensors | Modelo base declarado; aqui actua como punto de referencia sin RL |
| Otras alternativas de ~4 B orientadas a codigo | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Es un **checkpoint intermedio** (paso global 4) de una ejecucion de RL, no un modelo final validado. No deberia tratarse como un modelo de produccion sin evaluacion adicional.
- **No se publican metricas**: ni pass@8, ni resultados sobre los 112 problemas de validacion, ni benchmarks estandar. Cualquier afirmacion de rendimiento es, con la informacion disponible, indemostrable.
- **Dominio estrecho**: el entrenamiento se limita al frontier `cobalt-train ≤2/64`, es decir, problemas de codigo con verificacion por tests. Es probable un comportamiento degradado fuera de ese dominio, aunque no hay mediciones que lo confirmen.
- **Riesgo de reward hacking**: con recompensa binaria de correccion de codigo y sin penalizacion KL, el modelo puede especializarse en los patrones del verificador o de los tests en lugar de aprender a programar de forma general.
- **Sin anclaje al modelo base (no KL penalty)**: la deriva respecto a Qwen3-4B-Instruct-2507 no esta acotada ni medida; las capacidades conversacionales o de instrucciones podrian haberse deteriorado.
- **Licencia no disponible**: al no declararse licencia, el uso comercial queda en situacion juridica incierta; conviene verificar la licencia del modelo base antes de cualquier despliegue productivo.
- **Idiomas no declarados**: no hay lista de idiomas soportados; se desconoce el soporte real del castellano y de otras lenguas tras el RL.
- **Cuantizacion no publicada**: no hay GGUF, GPTQ ni AWQ; quien quiera desplegarlo en hardware limitado debe generar y validar su propia cuantizacion.
- **Sesgos**: no se documenta ningun analisis de sesgos ni de seguridad. Al heredar los datos del modelo base y del dataset de problemas de codigo, los sesgos son desconocidos.
- **Riesgo de alucinacion**: no evaluado en la informacion proporcionada; el ajuste por RL sobre correccion de codigo no aborda la veracidad factual en lenguaje natural.
- **Advertencia de reproducibilidad**: los logs se referencian por rutas locales y por un proyecto de Weights & Biases (`eaiexp-paper-final`) sin enlace directo, lo que dificulta la verificacion independiente.
- **Cero traccion comunitaria**: 0 descargas y 0 *likes* en el momento de la consulta, sin issues ni validaciones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-vs16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Logs de entrenamiento (Weights & Biases): proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_q4v3_vs16` (no se proporciona URL directa)
- Log local de entrenamiento (ruta indicada por el autor): `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v3_vs16/openrlhf_train.log`
- OpenRLHF (framework de entrenamiento empleado): no disponible en los resultados de busqueda proporcionados

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a contenidos sin relacion y se han omitido.
