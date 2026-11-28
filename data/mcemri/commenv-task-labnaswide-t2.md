# mcemri/commenv-task-labnaswide-t2

## Resumen

`mcemri/commenv-task-labnaswide-t2` es un checkpoint de investigacion derivado de Qwen/Qwen3-4B, ajustado mediante aprendizaje por refuerzo (GRPO) para una tarea de comunicacion multiagente. El autor es `mcemri` y el modelo se publica como material de laboratorio, no como producto listo para produccion. Parte del checkpoint final de `mcemri/commenv-e1-t2-combined` y se entrena 30 pasos adicionales sobre un entorno donde tres copias del modelo colaboran para sintonizar una red neuronal.

La tarea consiste en evaluar 81 combinaciones de cuatro hiperparametros; cada agente arranca con 4 resultados, puede probar 3 combinaciones mas (una por turno) y solo ve los resultados de las que ejecuta. Los agentes se comunican mediante un tablero compartido durante un maximo de seis turnos y cada uno debe nombrar la mejor combinacion. Los resultados de cada ronda son reales: provienen de las tablas de NAS-Bench-201 (repositorio blackbox de Syne Tune).

La relevancia es acotada y experimental: sobre 400 rondas de NAS-Bench-201 reservadas, la tasa de acierto al nombrar la mejor combinacion pasa del 5 % antes del entrenamiento al 35 % despues. En 400 rondas construidas con tablas FCNet no vistas durante el entrenamiento, la mejora es marginal (5 % a 8 %), lo que sugiere memorizacion del espacio de busqueda entrenado mas que una capacidad general de seleccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B) |
| Parametros totales | 4 000 millones (aproximado, heredado de Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); checkpoint del entrenador en 4 shards |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B, un transformer decoder-only de aproximadamente 4 000 millones de parametros. Sobre ese punto de partida se aplica un ajuste con aprendizaje por refuerzo mediante GRPO durante 30 pasos, partiendo del checkpoint `mcemri/commenv-e1-t2-combined`, que a su vez se entreno sobre puzles logicos divididos, primero en solitario y luego en equipo.

El entorno de entrenamiento es una tarea multiagente de optimizacion de hiperparametros sobre NAS-Bench-201: tres instancias del modelo colaboran a traves de un tablero compartido, con acceso parcial a la informacion (cada agente solo conoce los resultados de las combinaciones que ejecuta). La recompensa se define por acertar la mejor combinacion entre 81 posibles. Como referencia del entorno, el autor indica que seleccionar nueve ejecuciones al azar acierta la mejor combinacion en el 13 % de las rondas, y una regla simple que agrega los resultados del equipo lo logra entre el 46 % y el 66 %. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Qwen3-4B.
- Participacion en entornos multiagente con comunicacion por tablero compartido.
- Razonamiento multi-paso limitado a la tarea de seleccion de hiperparametros entrenada.
- Seleccion de combinaciones de hiperparametros dentro del espacio de NAS-Bench-201 visto en entrenamiento.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no documentado.

## Casos de uso

- Investigacion en aprendizaje por refuerzo multiagente: sirve como checkpoint reproducible para estudiar como emerge (o no) la comunicacion entre agentes en tareas de optimizacion con informacion parcial.
- Estudio de generalizacion en entornos de AutoML: permite analizar la brecha entre rendimiento dentro del espacio de busqueda entrenado (NAS-Bench-201) y fuera de el (FCNet), con cifras concretas (35 % frente a 8 %).
- Reproduccion de experimentos de GRPO: el checkpoint del entrenador incluido (22,5 GB en 4 shards) permite continuar el entrenamiento y comparar curvas.
- Analisis de sesgos de memorizacion: util para medir si un modelo aprende a razonar sobre resultados o simplemente a recordar regiones del espacio de busqueda.
- Benchmark de protocolos de comunicacion entre agentes: el diseno de tablero compartido con seis turnos maximos y acceso parcial a resultados es un entorno controlado para evaluar estrategias de agregacion de informacion.
- Docencia y divulgacion: ejemplo concreto de como se evalua un modelo de investigacion con metricas de acierto antes y despues del ajuste.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la tarea de nombrar la mejor combinacion:

| Conjunto de evaluacion | Antes del run | Despues del run |
|---|---|---|
| 400 rondas NAS-Bench-201 reservadas | 5 % | 35 % |
| 400 rondas FCNet (no vistas) | 5 % | 8 % |
| Regla de agregacion simple del equipo (referencia) | 46 % - 66 % | 46 % - 66 % |
| Nueve ejecuciones aleatorias (referencia) | 13 % | 13 % |

Observacion del autor: la primera ejecucion de un agente es su mejor resultado y las ejecuciones posteriores aciertan la mejor combinacion con una frecuencia no superior al azar. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8-9 GB para los pesos (el export safetensors ocupa 8,8 GB), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB; en 4 bits, alrededor de 3 GB (estimaciones a partir del tamano de pesos, no verificadas por el autor).
- GPU recomendadas: A100 40 GB o H100 para entrenamiento y evaluacion por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en BF16 y en tarjetas con 8 GB si se cuantiza.
- Opciones de despliegue: Transformers (carga documentada con `AutoModelForCausalLM` y subfolder `export/global_step_30/policy`); vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint y requeririan conversion.
- Latencia y throughput: no disponibles.
- Almacenamiento: 33,7 GB de repositorio total (8,8 GB de pesos exportados y 22,5 GB de checkpoint del entrenador).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-task-labnaswide-t2 | ~4 000 M | no disponible | RL multiagente sobre Qwen3-4B | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B | ~4 000 M | no disponible en esta ficha | LLM generalista base | Apache-2.0 | Hugging Face |
| mcemri/commenv-e1-t2-combined | ~4 000 M | no disponible | Checkpoint previo del mismo linaje | Apache-2.0 (segun modelo base) | Hugging Face |

La comparacion con alternativas de la misma categoria (modelos de investigacion para RL multiagente) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigacion: el propio autor lo describe como material de laboratorio, no como producto.
- Generalizacion limitada: la mejora cae del 35 % al 8 % al pasar de NAS-Bench-201 a FCNet, lo que indica ajuste al espacio de busqueda entrenado.
- El modelo no aprende a elegir una ejecucion a partir de sus resultados; solo la primera ejecucion aporta senal util.
- Rendimiento muy por debajo de una regla de agregacion simple (46 %-66 %), por lo que no es competitivo como metodo de optimizacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un ajuste de RL sobre una tarea acotada, puede degradar capacidades generales de Qwen3-4B.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingue.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no esta pensado ni validado para produccion.
- El checkpoint del entrenador no incluye `trainer_state.pt`, lo que puede complicar la reanudacion exacta del entrenamiento.
- No hay variantes cuantizadas publicadas; el despliegue en llama.cpp u Ollama requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-labnaswide-t2
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint previo del linaje: https://huggingface.co/mcemri/commenv-e1-t2-combined
- NAS-Bench-201 (referencia del entorno, citada en la model card): no se proporciona URL directa en la informacion disponible
- Syne Tune blackbox repository (origen de las tablas, citado en la model card): no se proporciona URL directa en la informacion disponible
