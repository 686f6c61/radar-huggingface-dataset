# alexhegit/so101-simstudio-lab01-pnp-molmoact2-agent193-20k

## Resumen

El modelo `alexhegit/so101-simstudio-lab01-pnp-molmoact2-agent193-20k` es un ajuste fino de tipo vision-lenguaje-accion (VLA) del modelo base `lerobot/MolmoAct2-SO100_101-LeRobot`, desarrollado por el usuario alexhegit. Esta especializado en tareas de pick-and-place (recogida y colocacion) sobre el brazo robotico SO-101 dentro del entorno de simulacion SimStudio (laboratorio Lab01), y se distribuye a traves de la libreria LeRobot. El problema que resuelve es el control de manipulacion robotica a partir de observaciones visuales y del estado de las articulaciones, generando secuencias de acciones (action chunks) para completar una tarea concreta.

El modelo cuenta con 5.591.928.368 parametros (unos 5,59 mil millones) y se publica con licencia apache-2.0 en formato safetensors. Se obtuvo en dos fases: un primer ajuste sobre un conjunto de 193 episodios de la tarea agent-yaw, y una continuacion desde los pesos del checkpoint de 10K pasos durante otros 20.000 pasos adicionales, dando lugar al checkpoint `020000` que se distribuye en este repositorio. El entrenamiento aplico LoRA unicamente sobre el VLM, dejando el experto de accion sin LoRA (`enable_lora_action_expert=false`).

Su relevancia es acotada pero clara: es un ejemplo reproducible de especializacion de un VLA generalista para una tarea robotica concreta y de bajo coste, con una evaluacion publicada que compara de forma explicita el rendimiento del checkpoint de 10K frente al de 20K. Esto lo hace util para desarrolladores que trabajan con LeRobot y el robot SO-101 y quieren estudiar el efecto de escalar pasos de entrenamiento en una tarea de pick-and-place.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) MolmoAct2, con VLM y experto de accion; detalles internos completos no disponibles |
| Parametros totales | 5.591.928.368 (~5,59 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion (pesos en safetensors; evaluacion realizada en bf16) |
| Idiomas soportados | no disponible (modelo orientado a control robotico, no a dialogo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un MolmoAct2, es decir, un modelo de vision-lenguaje-accion construido sobre un VLM y un experto de accion. El ajuste fino se hizo exclusivamente con LoRA sobre el VLM (`enable_lora_action_expert=false`), lo que implica que el experto de accion se mantiene tal como estaba en el modelo base y solo se adapta la parte de vision-lenguaje. El modelo emplea action chunking, ya que la model card indica "chunk 30", es decir, predice secuencias de 30 acciones. Se usan dos camaras de entrada, `camera_top` y `camera_wrist`, mapeadas a `cam0` y `cam1` respectivamente, mientras que `camera_front` no se utiliza. El estado de entrada corresponde a las seis primeras posiciones articulares.

El entrenamiento se realizo en dos etapas. Primero se ajusto el modelo base `lerobot/MolmoAct2-SO100_101-LeRobot` sobre el conjunto de datos `alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2`, compuesto por 193 episodios de la tarea agent-yaw. Despues, partiendo de los pesos obtenidos a 10.000 pasos, se continuo el entrenamiento durante otros 20.000 pasos, generando el checkpoint `020000` que se publica. No se especifican en la informacion proporcionada el numero total de tokens, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos quedan como no disponibles.

## Capacidades

- Control robotico de manipulacion: genera acciones (action chunks de longitud 30) para el brazo SO-101 en la tarea de pick-and-place del laboratorio Lab01.
- Fusion de vision y estado: procesa dos flujos de camara (`camera_top` y `camera_wrist`) junto con las seis primeras posiciones articulares como estado de entrada.
- Ejecucion de tareas pick-and-place: recoger un cubo y colocarlo, incluyendo la liberacion (release) tras el levantamiento, segun los resultados de evaluacion publicados.
- Especializacion mediante LoRA en el VLM: la adaptacion se concentra en la parte de vision-lenguaje, manteniendo el experto de accion del modelo base.
- Integracion con LeRobot: se carga como `MolmoAct2Policy` a traves de la API de LeRobot.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (la model card no lo menciona; el modelo esta orientado a una tarea de control concreta).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): se emplea vision como entrada; no se documentan otras capacidades especiales.

## Casos de uso

- Automatizacion de pick-and-place en simulacion: el modelo ejecuta ciclos completos de recogida y colocacion sobre el brazo SO-101 en SimStudio, sirviendo para evaluar politicas VLA antes de trasladarlas a hardware.
- Estudio del escalado de pasos de entrenamiento: comparar el checkpoint de 10K con el de 20K permite analizar el retorno marginal de anadir pasos sobre un mismo conjunto de datos, con datos de exito publicados (36/60 frente a 39/60).
- Base para nuevos ajustes en tareas similares: al ser un fine-tune ligero (LoRA en el VLM), puede reutilizarse como punto de partida para variar la tarea, las posiciones de objeto o la configuracion de camaras.
- Generacion de datos sinteticos y aumento de episodios: usar las trayectorias del modelo en simulacion para ampliar conjuntos de entrenamiento de manipulacion.
- Validacion de pipelines de LeRobot: probar la carga de `MolmoAct2Policy.from_pretrained` y la integracion con el ecosistema LeRobot en entornos de investigacion.
- Benchmarking de politicas roboticas en simulacion: emplear la tarea Lab01-PnP-Home20 como referencia reproducible para medir tasa de exito de distintos checkpoints o configuraciones de camaras.
- Analisis de fallos en el cierre fino: las seis poses de cubo lejanas que casi nunca se cierran dentro de 4 cm constituyen un caso de estudio util para investigar limites de precision en tareas de agarre.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la evaluacion `Lab01-PnP-Home20` en bf16, con tres tandas de 20 rollouts (60 en total) por checkpoint.

| Evaluacion | Checkpoint | Resultado | Tasa de exito |
|---|---|---|---|
| Lab01-PnP-Home20 (bf16) | 10K pasos | 36/60 | 60,0% |
| Lab01-PnP-Home20 (bf16) | 20K pasos (este repositorio) | 13/20, 13/20, 13/20 = 39/60 | 65,0% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con un modelo de control robotico y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de los 5,59 mil millones de parametros; no confirmadas en la informacion): aproximadamente 11-12 GB en bf16/fp16, unos 22 GB en fp32 y en torno a 3-6 GB con cuantizacion de 4 u 8 bits.
- El repositorio ocupa 22,4 GB, lo que sugiere que puede contener los pesos en precision alta o mas de una copia; conviene verificar el contenido antes de desplegar.
- GPU recomendadas: no disponibles de forma explicita en la informacion. Por tamano, encajaria en GPUs con 16 GB o mas (por ejemplo, RTX 4090 en bf16) y en GPUs de datacenter como A100 o H100 para mayor margen; estas son estimaciones, no datos confirmados.
- Cabe en GPU de consumo: probablemente si en bf16 con 16 GB o mas (por ejemplo, RTX 4080/4090), y con mas holgura mediante cuantizacion; no confirmado en la informacion.
- Opciones de despliegue: se carga a traves de LeRobot (`MolmoAct2Policy`). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada ni es esperable para un modelo de accion robotica de este tipo; se indica como no disponible.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (agent193-20k) | 5,59 mil millones | no disponible | 39/60 (65,0%) en Lab01-PnP-Home20 | apache-2.0 | HuggingFace |
| `lerobot/MolmoAct2-SO100_101-LeRobot` (modelo base) | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion | HuggingFace |
| Checkpoint intermedio de 10K pasos (mismo ajuste) | 5,59 mil millones (misma arquitectura) | no disponible | 36/60 (60,0%) en Lab01-PnP-Home20 | apache-2.0 | no distribuido en este repositorio |

No se dispone de datos comparativos con otras politicas de la misma categoria (por ejemplo, SmolVLA, ACT u otras alternativas para SO-101) en la informacion proporcionada, por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Especializacion estrecha: esta entrenado para una unica tarea (pick-and-place del laboratorio Lab01) y un unico robot (SO-101); no es un modelo generalista.
- Fallos de precision documentados: seis poses de cubo lejanas casi nunca se cierran dentro de 4 cm, segun la propia model card.
- Retorno marginal limitado: pasar de 10K a 20K pasos solo mejoro de 36/60 a 39/60; el autor indica que "mas pasos sobre este mismo conjunto no es la palanca siguiente".
- Dependencia de camaras concretas: solo se usan `camera_top` y `camera_wrist`; `camera_front` no se emplea, por lo que la configuracion sensorial es fija.
- Riesgo de sobreajuste a la simulacion: al proceder de un entorno SimStudio, el comportamiento en hardware real no esta validado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion.
- Riesgo de alucinacion: no aplica en el sentido textual habitual; el riesgo equivalente es generar acciones incorrectas o inestables, cuya magnitud no esta cuantificada fuera de la evaluacion citada.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia apache-2.0, que permite uso comercial; conviene revisar igualmente las condiciones del modelo base `lerobot/MolmoAct2-SO100_101-LeRobot` por si anaden restricciones.
- Repositorio con 0 descargas y 0 "likes" en el momento del registro, por lo que no tiene validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-molmoact2-agent193-20k
- Modelo base: https://huggingface.co/lerobot/MolmoAct2-SO100_101-LeRobot
- Dataset de entrenamiento: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2
