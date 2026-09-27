# izlley/h101-pi05-expert-v1

## Resumen

`izlley/h101-pi05-expert-v1` es un ajuste fino del modelo vision-language-action (VLA) `lerobot/pi05_base` (π0.5) orientado a control robotico bimanual sobre la plataforma SO-101 en el contexto del proyecto humanoid-101. Lo desarrolla el usuario `izlley` y su particularidad es que congela el codigo visual-linguistico (VLM) de PaliGemma y entrena unicamente el experto de acciones, usando la bandera `train_expert_only=true` de LeRobot. Se publica bajo licencia Apache 2.0 y en formato de pesos safetensors dentro de la libreria `lerobot`.

El modelo resuelve un problema muy concreto detectado por el autor: su experimento previo `izlley/h101-pi05-multi-v1`, un ajuste fino completo que incluia el VLM, ignoraba la instruccion de lenguaje en el robot real. Esta version es un contraexperimento que entrena solo el experto de acciones sobre exactamente los mismos datos (`izlley/h101_multi_v1_train`, 90 episodios, 3 instrucciones), para comprobar si asi se preserva mejor el grounding linguistico.

La relevancia actual es metodologica: el autor documenta que a 2.500 pasos el modelo ignora el lenguaje, mientras que a 5.000 pasos ya separa parcialmente la instruccion "ball" asignandola al brazo izquierdo (factor 4,3x), aunque "plush" todavia no se distingue. No se publican parametros totales, longitud de contexto ni resultados de benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) π0.5 sobre VLM PaliGemma con experto de acciones; VLM congelado durante el ajuste |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints publicados estan en bf16) |
| Idiomas soportados | no disponible; las instrucciones del dataset estan en ingles ("ball", "plush" y una tercera tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints de LeRobot organizados en carpetas por paso: `005000/`, `007500/`, `010000/`) |

Otros datos: tamano del repositorio 9,4 GB; pipeline declarado `robotics`; modelo base `lerobot/pi05_base`; dataset de entrenamiento `izlley/h101_multi_v1_train`; fecha de creacion 2026-09-27.

## Arquitectura y entrenamiento

Se trata de una arquitectura VLA de tipo transformer que combina un componente de vision-lenguaje (el VLM PaliGemma heredado de `lerobot/pi05_base`) con un modulo especifico de generacion de acciones, denominado "action expert" en la documentacion del autor. La innovacion de esta ficha no esta en la arquitectura, que se reutiliza tal cual, sino en la estrategia de ajuste: el VLM permanece congelado y solo se actualizan los pesos del experto de acciones (`train_expert_only=true`).

El entrenamiento usa el dataset `izlley/h101_multi_v1_train`, compuesto por 90 episodios y 3 instrucciones de lenguaje, sobre un robot SO-101 bimanual. La configuracion reportada es batch de 64, precision bf16 con gradient checkpointing, 10.000 pasos sobre una unica GPU H100. El autor publica checkpoints intermedios en carpetas separadas (`005000/`, `007500/`, `010000/`) para poder analizar la evolucion del aprendizaje. No se especifica en la informacion disponible si hubo RLHF, DPO ni tecnicas de decodificacion especulativa, ni el numero total de tokens de entrenamiento.

El hallazgo tecnico central es la sonda de lenguaje sobre episodios no vistos: a 2.500 pasos el modelo ignora la instruccion; a 5.000 pasos la instruccion "ball" provoca movimiento del brazo izquierdo con una preferencia 4,3x, mientras que "plush" aun no se separa. Esto sugiere que el experto de acciones puede adquirir cierto grounding linguistico sin reentrenar el VLM, aunque de forma incompleta y tardia.

## Capacidades

- Generacion de acciones motoras para un robot bimanual SO-101 a partir de observaciones visuales e instrucciones textuales.
- Seguimiento parcial de instrucciones de lenguaje para seleccionar el brazo que debe moverse (evidencia con "ball" a 5.000 pasos).
- Ejecucion de tres tareas de lenguaje distintas, correspondientes al dataset `h101_multi_v1_train`.
- Aprendizaje de politicas a partir de datos de demostracion (90 episodios), con capacidad aparente de generalizacion a episodios no vistos, segun la sonda de lenguaje reportada.
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, vision generalista fuera del bucle de control, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en grounding linguistico para robotica: permite comparar directamente contra un ajuste fino completo del VLM con los mismos datos, aislando el efecto de congelar el componente de vision-lenguaje sobre la capacidad de obedecer instrucciones.
- Manipulacion bimanual con seleccion de brazo por lenguaje: el modelo puede recibir una instruccion y decidir que brazo ejecuta la accion, util en tareas de recogida donde el objeto condiciona la eleccion de efector.
- Replicacion de experimentos en laboratorio: al publicarse checkpoints en los pasos 5.000, 7.500 y 10.000, se pueden estudiar curvas de adquisicion de habilidades sin repetir el entrenamiento completo.
- Base para ajustes especificos de tarea: un equipo puede partir de este checkpoint y entrenar solo el experto de acciones con sus propios datos de 50 a 100 episodios, con un coste de computo mucho menor que un ajuste completo.
- Evaluacion de politicas en robot real con SO-101: el pipeline LeRobot permite desplegar el modelo y medir tasas de exito por instruccion, como hace la sonda descrita por el autor.
- Docencia y divulgacion en robotica con IA: el par de modelos (experto congelado frente a ajuste completo) constituye un ejemplo reproducible de como la estrategia de congelacion afecta al comportamiento final.
- Analisis de fallos de grounding: sirve como caso de estudio de un modelo que a ciertos pasos de entrenamiento ignora por completo el lenguaje y solo mas tarde empieza a separarlo, util para disenar criterios de parada temprana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robotica como LIBERO o SimplerEnv) en la informacion disponible. El unico dato de evaluacion es una sonda de lenguaje sobre episodios no vistos del propio dataset:

| Checkpoint | Comportamiento observado |
|---|---|
| 2.500 pasos | Ignora la instruccion de lenguaje |
| 5.000 pasos | "ball" produce movimiento del brazo izquierdo con preferencia 4,3x; "plush" todavia no se separa |
| 7.500 pasos | no disponible en la informacion proporcionada |
| 10.000 pasos | no disponible en la informacion proporcionada |

La metrica de la sonda es la preferencia de brazo ante cada instruccion en episodios reservados; no se reportan tasas de exito de tarea, ni comparacion numerica con el modelo base.

## Requisitos de hardware

- Entrenamiento: el autor reporta un unico H100 para 10.000 pasos con batch 64, bf16 y gradient checkpointing. No se indica el tiempo total de entrenamiento.
- VRAM de inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 9,4 GB, pero incluye varios checkpoints; el conjunto de pesos de un unico paso es previsiblemente menor. Conviene medirlo antes de dimensionar el despliegue.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte de bf16 y suficiente memoria para los pesos y el bucle de control deberia poder ejecutar inferencia; no se confirma el comportamiento en GPUs de gama de consumo.
- Opciones de despliegue: la libreria declarada es `lerobot`, por lo que el despliegue natural es el stack de LeRobot sobre PyTorch. No hay evidencia de soporte de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. En robotica VLA la latencia del bucle de control es critica y debe medirse en el hardware objetivo antes de cualquier uso en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| izlley/h101-pi05-expert-v1 | no disponible | no disponible | Solo experto de acciones; VLM congelado; 90 episodios, 3 instrucciones | Apache 2.0 | Hugging Face (0 descargas, 0 likes en la fecha de la ficha) |
| lerobot/pi05_base | no disponible | no disponible | Modelo base π0.5 de LeRobot, sin ajuste a SO-101 | no disponible en la informacion proporcionada | Hugging Face |
| izlley/h101-pi05-multi-v1 | no disponible | no disponible | Ajuste fino completo, incluido el VLM; mismos 90 episodios y 3 instrucciones | no disponible en la informacion proporcionada | Hugging Face (contraexperimento de referencia) |

No se dispone de datos comparativos de rendimiento entre estas tres variantes, ni de otras alternativas VLA de la misma categoria. La comparacion relevante es metodologica: a igualdad de datos y receta, `expert-v1` congela el VLM mientras `multi-v1` lo reentrena, y el autor reporta que `multi-v1` ignoraba la instruccion de lenguaje en el robot real.

## Limitaciones y advertencias

- Grounding linguistico incompleto: en el checkpoint de 5.000 pasos solo una de las tres instrucciones ("ball") se separa de forma clara; "plush" no se distingue, y el modelo a 2.500 pasos ignora el lenguaje por completo.
- Sesgos: el modelo se ha entrenado con 90 episodios de un unico montaje, robot y conjunto reducido de objetos; es probable que generalice mal a objetos, iluminacion o disposicion distintos de los vistos.
- Riesgo de alucinacion motora: como cualquier politica VLA, puede generar trayectorias plausibles pero incorrectas; en robotica real esto implica riesgo fisico y requiere limites de par, paradas de emergencia y supervision humana.
- Idiomas: las instrucciones documentadas estan en ingles; no hay evidencia de soporte multilingue ni de castellano.
- Contexto y parametros: no se publican el numero de parametros, la longitud de contexto ni la composicion exacta del dataset de entrenamiento, lo que dificulta estimar costes y limites.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener sus propias condiciones que conviene verificar antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes en la fecha de la ficha, con pocos dias entre creacion y ultima actualizacion; se trata de un artefacto de investigacion, no de un modelo listo para produccion.
- Sin benchmarks estandar: no hay evidencia publicada de tasas de exito en tareas, por lo que cualquier decision de adopcion deberia apoyarse en una evaluacion propia en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izlley/h101-pi05-expert-v1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Contraexperimento (ajuste fino completo): https://huggingface.co/izlley/h101-pi05-multi-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/izlley/h101_multi_v1_train
- Repositorio con la receta y el analisis: https://github.com/izlley/Robotics
- Runbook del subproyecto humanoid-101: sub-project/humanoid-101/08_pi05-groot-runbook.md, seccion 5.2 (dentro del repositorio anterior)
