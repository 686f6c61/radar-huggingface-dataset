# helen9975/pi05_telearms_v5_exp_random_50

## Resumen

`pi05_telearms_v5_exp_random_50` es un ajuste fino completo del modelo fundacional de robotica π₀.₅ (`lerobot/pi05_base`) realizado por el usuario helen9975 sobre el conjunto de datos simulado `mliu48/telearms-yam-cube-v5-exp-random-50`. El modelo resuelve el problema de control visomotor bimanual: dado un objetivo en lenguaje natural y las imagenes de tres camaras, genera secuencias de acciones para un robot YAM de dos brazos. Se distribuye como checkpoint de LeRobot en formato safetensors, con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y un repositorio de 18,7 GB.

Forma parte de una familia de ocho experimentos (Random-50/100/500/1000/1500, Elo-1500, Score-1500 y DemInf-1500) entrenados con la misma receta y el mismo presupuesto de 15,36 millones de muestras, lo que permite comparar el efecto del numero y del criterio de seleccion de demostraciones sobre el rendimiento final. Este checkpoint concreto corresponde al paso 30.000 de entrenamiento y es el resultado final de la variante Random-50.

Es relevante ahora porque documenta de forma reproducible una pregunta abierta en el aprendizaje por imitacion para robotica: cuanto importa la cantidad de datos frente a su calidad o diversidad. El autor publica la receta completa (hardware, hiperparametros, versiones de LeRobot y parches aplicados), aunque el modelo aun no ha sido evaluado en simulacion ni en hardware real, por lo que su utilidad practica esta por confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (vision-lenguaje-accion, base `lerobot/pi05_base`); detalles internos no disponibles |
| Parametros totales | 4.143.404.816 (LLM + vision + action expert) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idioma del dataset no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (carpeta `pretrained_model/` de LeRobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de π₀.₅, un modelo visomotor que combina un modelo de lenguaje, un codificador visual y un "action expert" especializado. Se entrenaron conjuntamente las tres partes (LLM + vision + action expert) en bf16 con gradient checkpointing. La salida son chunks de 50 acciones, con acciones relativas y pinzas en valores absolutos. Las observaciones consisten en tres camaras de 224×224 a 30 Hz, y las instrucciones se presentan con variantes de prompt por tarea (`meta/task_prompt_variants.json`).

El entrenamiento uso el dataset `mliu48/telearms-yam-cube-v5-exp-random-50` (revision `ad16b769`): 500 demostraciones simuladas de robot YAM bimanual, 10 tareas, 495.157 fotogramas a 30 Hz y sin domain randomization. La seleccion toma 50 demostraciones por tarea al azar entre todas las exitosas que tienen demo score y ELO de jugador, con conjuntos anidados (Random-50 ⊂ Random-100 ⊂ ... ⊂ Random-1500). Se emplearon 8 GPU H100 (un nodo), batch 64 por GPU (global 512), AdamW (β = 0,9/0,95, weight decay 0,01), LR pico 1e-4, 1.000 pasos de warmup y decaimiento coseno hasta 1e-5 en 30.000 pasos, equivalentes a 15,36 millones de muestras. La perdida de entrenamiento reciente es 0,006. No se reservaron episodios para validacion, por lo que no existe perdida de validacion. El codigo proviene de `helen9975/RoboEval-telearms` (rama `PI05_training`, commit `9dc9e9f`) con parches locales (protecciones NaN, correccion de logging PyAV para acelerar la carga de datos, minimo configurable de episodios por tarea) y LeRobot 0.6.1 (commit `e40b58a8`) con el parche del repositorio.

## Capacidades

- Control visomotor bimanual: genera trayectorias de accion para un robot YAM de dos brazos a partir de imagenes de tres camaras.
- Seguimiento de instrucciones en lenguaje natural por tarea, con variantes de prompt entrenadas.
- Generacion de chunks de accion de 50 pasos con acciones relativas y pinzas absolutas.
- Aprendizaje por imitacion a partir de demostraciones simuladas (no hay evidencia de RLHF ni DPO).
- Ejecucion de 10 tareas de manipulacion distintas dentro del dataset de entrenamiento.
- No disponible: soporte de tool calling, uso como agente multi-paso, capacidades multilingues, modo thinking, vision general, audio.

## Casos de uso

- Investigacion sobre seleccion de datos en imitacion: comparar este checkpoint con las variantes Random-100/500/1000/1500, Elo-1500, Score-1500 y DemInf-1500, entrenadas con el mismo presupuesto, para medir el efecto del numero y criterio de seleccion de demostraciones.
- Manipulacion bimanual simulada de cubos: usar el modelo como politica para las 10 tareas del dataset `telearms-yam-cube-v5` en un simulador con robot YAM, evaluando la tasa de exito por tarea.
- Reproduccion de experimentos: la receta completa (hardware, hiperparametros, versiones de LeRobot y parches) permite reentrenar o extender el ajuste fino sobre otros subconjuntos del mismo dataset.
- Base para ajuste fino adicional: al ser un fine-tune completo de π₀.₅, puede servir como punto de partida para dominios o tareas relacionadas con manipulacion bimanual.
- Estudio de prompts por tarea: el uso de `meta/task_prompt_variants.json` permite analizar la robustez del modelo ante variaciones de instruccion.
- Docencia y divulgacion: ejemplo reproducible de pipeline LeRobot completo (dataset, entrenamiento multi-GPU, checkpoint) para cursos de robotica e IA.
- No se recomienda su uso en produccion ni en robot real sin una evaluacion previa, dado que no se ha validado en simulacion ni en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo aun no ha sido evaluado en simulacion. El unico dato de rendimiento reportado es la perdida de entrenamiento reciente (0,006), que no equivale a una metrica de exito de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parametros, en bf16 los pesos ocupan unos 8,3 GB; en fp32, unos 16,6 GB. Hay que sumar el estado de inferencia y las activaciones, no cuantificadas en la informacion disponible.
- GPU de entrenamiento utilizadas: 8 × H100 en un nodo, batch 64 por GPU.
- GPU recomendadas para inferencia: no disponibles; por tamano, una GPU con 16-24 GB de VRAM (por ejemplo, RTX 4090 o A100) seria suficiente para los pesos, pero no se ha verificado.
- Cabe en GPU de consumo: probablemente si en tarjetas con 16 GB o mas en bf16, aunque no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 con el parche del repositorio (`tools/install_lerobot_patch.py`); soporte de vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Evaluacion |
|---|---|---|---|---|---|
| `pi05_telearms_v5_exp_random_50` (este) | 4,14 B | no disponible | 500 demos, 495.157 frames | no disponible | no evaluado |
| `helen9975/pi05_telearms_v5_exp_random_500` | no disponible (mismo base) | no disponible | 5.000 demos, 4.706.102 frames | no disponible | no disponible |
| `helen9975/pi05_telearms_v5_exp_random_1000` | no disponible (mismo base) | no disponible | no disponible | no disponible | no disponible |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |

Las tres variantes comparten receta y presupuesto de 15,36 millones de muestras, por lo que la comparacion controlada es directa en cuanto a datos, aunque no hay metricas publicadas para ninguna de ellas.

## Limitaciones y advertencias

- Sin evaluacion: el autor declara que el modelo no ha sido evaluado en simulacion; no hay evidencia de tasa de exito ni de generalizacion.
- Sin validacion: no se reservaron episodios, por lo que no existe perdida de validacion y el riesgo de sobreajuste al conjunto de entrenamiento no esta cuantificado.
- Dominio muy acotado: entrenado solo con 10 tareas de un dataset simulado concreto (cubos, robot YAM bimanual), sin domain randomization; es improbable que transfiera a otros objetos, robots o entornos reales.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: no se especifica el idioma de las instrucciones ni se documenta capacidad multilingue.
- Riesgo de alucinacion y sesgos: no documentados por el autor; en modelos visomotores, el fallo tipico es la ejecucion de acciones no validas o la deriva de la politica fuera de la distribucion de entrenamiento.
- Reproducibilidad dependiente de parches: requiere LeRobot 0.6.1 con un parche concreto y cambios locales en el codigo, lo que complica la replicacion exacta.
- Popularidad minima: 2 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_50
- Dataset: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-50
- Variante Random-500: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_500
- Variante Random-1000: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_1000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Codigo de entrenamiento: `helen9975/RoboEval-telearms`, rama `PI05_training`, commit `9dc9e9f` (no se dispone de URL directa en la informacion proporcionada)
- LeRobot 0.6.1: commit `e40b58a8` (no se dispone de URL directa en la informacion proporcionada)
