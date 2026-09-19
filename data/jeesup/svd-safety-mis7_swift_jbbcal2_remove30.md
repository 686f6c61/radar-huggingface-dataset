# Jeesup/svd-safety-mis7_swift_jbbcal2_remove30

## Resumen

svd-safety-mis7_swift_jbbcal2_remove30 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2 comprimido mediante SVD-LLM hasta el 70,03 % de sus parametros densos (se elimina el 30,00 % de los parametros), con un presupuesto de restauracion de componentes SVD del 0,000 %, es decir, cero componentes restaurados y cero componentes sustituidos. Lo publica el usuario Jeesup en HuggingFace como artefacto de investigacion, no como modelo de proposito general. Forma parte de una rejilla experimental que cruza reglas de seleccion de componentes SVD con distintos presupuestos de restauracion, y su objetivo es medir como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado, y que regla de seleccion repara mejor ese dano.

El problema que aborda es acotado pero relevante: la compresion de modelos es una practica habitual para reducir coste de inferencia, y existe evidencia de que puede degradar los mecanismos de rechazo aprendidos durante el alineamiento. Este checkpoint sirve como sujeto experimental con metricas de ataque y de sobrerrechazo publicadas, lo que permite comparar celdas de la rejilla y estudiar el compromiso entre seguridad y utilidad. La ficha del autor advierte explicitamente de que varias celdas del estudio estan deliberadamente degradadas en seguridad y que cualquiera de ellas debe tratarse como sujeto experimental, no como asistente desplegable.

El modelo conserva la arquitectura transformer decoder-only de Mistral-7B, con 7.241.732.096 parametros segun los pesos safetensors del repositorio (una cifra que coincide con el modelo base sin comprimir y que conviene contrastar con la fraccion densa declarada de 0,7003). Se publica bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks de capacidad general mas alla de las metricas de seguridad y perplejidad que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia MistralForCausalLM), sin mezcla de expertos; pesos derivados por compresion SVD-LLM |
| Parametros totales | 7.241.732.096 segun los safetensors del repositorio; la ficha del autor declara una fraccion de parametros densos resultante de 0,7003 tras eliminar el 30,00 % |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base Mistral-7B-Instruct-v0.2 declara 32.768 tokens con atencion de ventana deslizante, dato no verificado en este repositorio |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo: el checkpoint se obtiene aplicando SVD-LLM sobre mistralai/Mistral-7B-Instruct-v0.2, un transformer decoder-only con atencion causal. La compresion elimina el 30,00 % de los parametros densos mediante factorizacion de bajo rango, y despues la regla de seleccion `unknown` decide que componentes SVD se restauran con un presupuesto del 0,000 % de los parametros densos, lo que en la practica deja el modelo sin restauracion alguna. La semilla utilizada es 42. La ficha no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en esta etapa, porque no existe etapa de entrenamiento adicional: es una transformacion post-hoc de los pesos.

La innovacion tecnica del artefacto es metodologica, no arquitectonica. La rejilla experimental permite aislar el efecto de la regla de seleccion de componentes SVD y del presupuesto de restauracion sobre dos ejes medibles: la tasa de exito de ataque (attack success rate) y el sobrerrechazo (over-refusal). Las metricas publicadas son AdvBench ASR de 0,2558 y StrongREJECT ASR de 0,2556, ambas evaluadas con el juez HarmBench, un sobrerrechazo macro de 0,1555 medido con WildGuard y una perplejidad de 8,4120 en WikiText-2. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni modificaciones del mecanismo de atencion.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Mistral-7B-Instruct-v0.2; la ficha del autor no documenta otros idiomas.
- Comportamiento conversacional basico derivado del ajuste de instrucciones del modelo base, aunque el autor insiste en que no es un modelo de chat de proposito general.
- Generacion de completaciones utilizables en tareas de evaluacion automatizada: las metricas publicadas indican que el modelo sigue produciendo texto coherente tras la compresion, con una perplejidad de 8,4120 en WikiText-2.
- Sirve como sujeto experimental para medir tasas de exito de ataque: AdvBench 0,2558 y StrongREJECT 0,2556 con juez HarmBench.
- Sirve como sujeto experimental para medir sobrerrechazo: 0,1555 macro con WildGuard.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no declaradas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El repositorio solo declara text-generation.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como celda de referencia con presupuesto de restauracion cero, y comparar sus ASR contra otras celdas de la misma rejilla para cuantificar cuanto dano introduce la compresion SVD por si sola.
- Evaluacion de jueces de seguridad: las metricas AdvBench y StrongREJECT se obtuvieron con el juez HarmBench, de modo que el checkpoint permite auditar la estabilidad de ese juez frente a un modelo comprimido que genera respuestas atipicas.
- Estudio del sobrerrechazo: el valor de 0,1555 medido con WildGuard sirve como punto de partida para analizar si la compresion aumenta los rechazos innecesarios en peticiones benignas.
- Analisis de perplejidad como proxy de utilidad: replicar la medicion de 8,4120 en WikiText-2 para comprobar la degradacion de fluidez frente al modelo base sin comprimir.
- Pruebas de reproducibilidad: verificar con semilla 42 que la pipeline SVD-LLM y la regla de seleccion `unknown` reproducen el mismo checkpoint, algo util para validar implementaciones propias de compresion.
- Auditoria de artefactos publicados: dado que la ficha declara una fraccion densa de 0,7003 mientras que los safetensors suman 7.241.732.096 parametros, el modelo sirve como caso practico para disenar comprobaciones que detecten discrepancias entre metadatos declarados y pesos reales.
- Docencia y divulgacion tecnica: ilustrar en un curso o taller como una transformacion de pesos sin entrenamiento adicional altera propiedades de seguridad medibles.

## Benchmarks y rendimiento

| Metrica | Valor | Metodo de evaluacion |
|---|---|---|
| AdvBench ASR | 0,2558 | Juez HarmBench |
| StrongREJECT ASR | 0,2556 | Juez HarmBench |
| Sobrerrechazo macro | 0,1555 | WildGuard |
| Perplejidad WikiText-2 | 8,4120 | WikiText-2 |
| MMLU, HumanEval, GSM8K y otros benchmarks de capacidad | no disponible | no disponible |

No se han publicado resultados de benchmarks de capacidad general en la informacion disponible, ni valores comparativos del modelo base sin comprimir bajo los mismos jueces, por lo que no es posible calcular la delta exacta de degradacion con los datos proporcionados.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 15-16 GB para pesos, mas el coste de la cache KV, que depende de la longitud de contexto efectiva.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB, condicionada a que se genere una version cuantizada, ya que el repositorio no la publica.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB, igualmente condicionada a conversion propia.
- GPU recomendadas para fp16: NVIDIA A100 40 GB, H100 80 GB, L40S o cualquier GPU con 24 GB o mas (RTX 3090, RTX 4090).
- GPU de consumo: el modelo cabe en una RTX 4090 o RTX 3090 en fp16, con margen ajustado; en 4 bits cabria tambien en GPUs de 8-12 GB previa cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente en el repositorio) y vLLM como servidor compatible con pesos safetensors de Mistral. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad, y la compresion SVD no garantiza por si sola una aceleracion proporcional, ya que depende de si las matrices factorizadas se materializan o no.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas publicadas |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_jbbcal2_remove30 | 7,24 B en los safetensors; fraccion densa declarada 0,7003 | no disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | AdvBench ASR 0,2558; StrongREJECT ASR 0,2556; sobrerrechazo 0,1555; ppl WikiText-2 8,4120 |
| mistralai/Mistral-7B-Instruct-v0.2 (modelo base) | 7,24 B, denso | 32.768 tokens segun la documentacion del modelo base, no verificado aqui | Apache 2.0 | HuggingFace | no disponible en la informacion proporcionada; el autor afirma que la compresion eleva la tasa de exito de ataque, pero no publica los valores del base |
| Otras celdas de la rejilla del mismo estudio (reglas de seleccion y presupuestos distintos) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de 7-8 B de la misma categoria (Llama 3 8B Instruct, Zephyr 7B, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con los datos proporcionados: faltan las metricas del modelo base bajo los mismos jueces y no se han recogido resultados de modelos equivalentes.

## Limitaciones y advertencias

- No es un modelo de proposito general. La propia ficha indica que es un artefacto de investigacion y que no debe desplegarse como asistente.
- Degradacion deliberada de seguridad: el autor advierte de que varias celdas de la rejilla estan degradadas en seguridad respecto a Mistral-7B-Instruct-v0.2, y que la compresion por si sola eleva la tasa de exito de ataque. Tratarlo como sujeto experimental.
- Riesgo elevado de respuestas daninas: la tasa de exito de ataque publicada es de 0,2558 en AdvBench y 0,2556 en StrongREJECT, valores que indican que aproximadamente uno de cada cuatro intentos adversarios tiene exito segun el juez HarmBench.
- Sobrerrechazo no despreciable: 0,1555 macro con WildGuard implica que rechaza peticiones benignas con una frecuencia relevante, lo que degrada la utilidad en conversacion.
- Perplejidad de 8,4120 en WikiText-2: es un valor de fluidez degradado respecto a lo esperable en un modelo de 7 B sin comprimir, coherente con la perdida de parametros.
- Discrepancia de metadatos: la ficha declara una fraccion de parametros densos de 0,7003, pero los safetensors del repositorio suman 7.241.732.096 parametros, cifra identica a la del modelo base sin comprimir. Conviene verificar la configuracion antes de asumir la reduccion efectiva de tamano o de coste de inferencia.
- Sesgos conocidos: no disponibles. El autor no documenta analisis de sesgos y el modelo hereda los del modelo base, que no se detallan en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la ficha. La longitud de contexto efectiva y el conjunto de idiomas soportados no se declaran, aunque el modelo base esta orientado principalmente al ingles.
- Licencia: Apache 2.0 para este derivado. El autor senala que el repositorio del modelo base no incluye fichero de licencia para redistribuir, lo que introduce incertidumbre sobre la base legal de la redistribucion de pesos derivados.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.
- Uso en produccion: desaconsejado. No hay pesos cuantizados publicados, no hay mediciones de latencia y no existe garantia de que la compresion no haya alterado el formato o la estabilidad numerica del estado del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbcal2_remove30
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper de SVD-LLM (tecnica de compresion citada en la ficha): no disponible en la informacion proporcionada
- Repositorio o demo del autor: no disponible
- Los resultados de la busqueda web no aportaron enlaces relevantes sobre este modelo, la tecnica o el estudio asociado.
