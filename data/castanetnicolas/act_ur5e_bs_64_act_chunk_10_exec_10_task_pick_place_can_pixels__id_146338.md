# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS__ID_146338

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composicion y mejora la estabilidad en tareas de manipulacion robotica. Esta ficha corresponde a un checkpoint concreto entrenado y publicado por el usuario castanetnicolas mediante LeRobot, la libreria de Hugging Face para aprendizaje de robots del mundo real. El modelo resuelve una tarea de pick and place: "Pick up the can and place it in the matching bin" (coger una lata y depositarla en el contenedor correspondiente).

Se trata de una politica de robotica de 51.580.551 parametros (unos 51,6 M), almacenada en formato safetensors y con licencia Apache 2.0. El identificador del repositorio referencia un UR5e y una configuracion de chunk/ejecucion de 10 pasos, aunque la propia model card declara `robot type: panda`, una discrepancia que conviene verificar antes de usar el modelo en hardware real. Consume estado propioceptivo (9 dimensiones) y dos vistas de camara de 84x84x3 (agentview y eye-in-hand) a 20 FPS, y emite acciones de 7 dimensiones.

El modelo es relevante como ejemplo reproducible de entrenamiento de una politica ACT en simulacion (dataset robomimic) y como plantilla para experimentar con el flujo de LeRobot (`lerobot-train`, `lerobot-rollout`). No es un modelo de lenguaje ni de vision-lenguaje: es una politica de control de bajo nivel especifica para una tarea y una configuracion de sensores concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con componente CVAE para aprendizaje por imitacion |
| Parametros totales | 51.580.551 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de robotica; ventana de observacion de un solo paso, chunk de acciones de 10 pasos) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible (no genera texto; no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot (segun model card) | panda |
| Tipo de robot (segun ID del repo) | UR5e (discrepancia con la model card) |
| Camaras | agentview, robot0_eye_in_hand |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 84, 84), `observation.images.robot0_eye_in_hand` (3, 84, 84) |
| Salidas | `action` (7,) |
| Tamano del repo | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |
| Fecha de actualizacion | 2026-10-01 |

## Arquitectura y entrenamiento

ACT es un transformer que combina un autocodificador variacional condicional (CVAE) con un decodificador de acciones. El codificador CVAE toma la secuencia de observaciones y acciones de la demostracion, mientras que el decodificador genera un chunk de acciones futuras condicionado en el estado actual y en una variable latente. Esta formulacion (paper arXiv:2304.13705) permite modelar la multimodalidad de las demostraciones humanas y predecir bloques de acciones coherentes, lo que en la practica reduce la varianza y mejora la tasa de exito frente a politicas que emiten una accion por paso. En este checkpoint concreto, la nomenclatura del repositorio indica Act_Chunk_10_Exec_10, es decir, chunks de 10 acciones.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `castanetnicolas/robomimic_can_ph_image84`: 200 episodios, 23.207 frames, 20 FPS, correspondientes a la tarea de pick and place de una lata en simulacion robomimic con imagenes de 84x84. La configuracion reportada incluye 120.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan fases de RLHF, DPO ni ajuste con refuerzo; es aprendizaje por imitacion supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control de manipulacion robotica para una tarea especifica de pick and place (coger la lata y colocarla en el contenedor correspondiente).
- Prediccion de chunks de 10 acciones consecutivas, lo que permite un control mas suave y consistente que el control paso a paso.
- Percepcion visual desde dos camaras simultaneas (vista externa agentview y vista de muneca eye-in-hand) a resolucion 84x84.
- Fusion de estado propioceptivo (9 dimensiones) con observaciones visuales para generar acciones de 7 grados de libertad.
- Ejecucion en bucle cerrado a 20 FPS sobre el robot, con politica de tipo base en LeRobot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el pipeline completo de LeRobot (`lerobot-train` con `policy.type=act`) para comparar variantes de chunk y ejecucion sobre el mismo dataset.
- Evaluacion de generalizacion en simulacion: ejecutar la politica en un entorno robomimic con el objeto en distintas posiciones y luces para medir robustez, dado que la model card no reporta metricas.
- Baseline para comparativas: usar este checkpoint de 51,6 M de parametros como referencia frente a politicas mas recientes (Diffusion Policy, VLA) en la misma tarea de pick and place.
- Prototipado de pick and place industrial: adaptar la receta (dataset propio + ACT) a una celda real, usando este modelo como validacion del flujo de entrenamiento y despliegue antes de escalar.
- Docencia y formacion en robotica: ejemplo didactico de politica visomotora de bajo coste computacional que cabe en una GPU de consumo.
- Despliegue en hardware de laboratorio: integrar `lerobot-rollout` con una camara externa y una camara en la muneca para un demostrador de manipulacion.
- Automatizacion de tareas de recogida en bin picking: reentrenar el mismo esquema ACT sobre demostraciones propias de recogida y clasificacion de piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con el texto "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito en robot real ni en simulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB en precision completa por el tamano del modelo (51,6 M de parametros, ~0,2 GB en disco). Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4090, etc.) es mas que suficiente; tambien A100/H100 si se comparte con otros procesos, aunque no son necesarias.
- Ejecucion en CPU: plausible para inferencia dado el tamano, aunque la latencia dependera del preprocesado de imagen.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. El dataset de entrenamiento se capturo a 20 FPS, lo que orienta sobre la frecuencia de control esperada, pero no se reportan mediciones de latencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ACT UR5e/panda pick can) | 51,6 M | ACT (imitation learning) | chunk 10, exec 10 | Apache 2.0 | Hugging Face (castanetnicolas) |
| castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_50_Exec_50 | ~51,6 M (segun perfil del autor) | ACT (imitation learning) | chunk 50, exec 50 | Apache 2.0 | Hugging Face (mismo autor) |
| Diffusion Policy | no disponible | Politica generativa por difusion | no disponible | no disponible | Repositorio de investigacion |

No se dispone de datos de rendimiento comparables entre estos modelos. La principal diferencia documentada con el checkpoint hermano del mismo autor es el tamano de chunk y ejecucion (10 frente a 50), que afecta al horizonte de planificacion y a la reactividad del control.

## Limitaciones y advertencias

- No hay metricas de exito publicadas: se desconoce su rendimiento real en robot y en simulacion.
- Especificidad extrema: la politica esta entrenada para una unica tarea ("Pick up the can and place it in the matching bin."), un robot y unas camaras concretas. No es un modelo general.
- Discrepancia de robot: el ID del repositorio indica UR5e, pero la model card declara `panda`. Verificar el robot objetivo antes de desplegar.
- Dependencia de la interfaz de observacion: los nombres e indices de camara deben coincidir exactamente con `observation.images.agentview` y `observation.images.robot0_eye_in_hand`, y el estado debe tener shape (9,).
- Riesgo de fallo por cambios de dominio: iluminacion, posicion del objeto, distractores o una instancia distinta del mismo robot pueden degradar el comportamiento (caveat reconocido en la propia plantilla de la model card).
- Alucinacion: no aplica en el sentido linguistico, pero si existe el riesgo de acciones fisicamente invalidas o poco seguras fuera de la distribucion de entrenamiento.
- Sesgos: los sesgos provienen de las demostraciones teleoperadas del dataset robomimic; no se documenta analisis de sesgo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Sin datos de cuantizacion ni artefactos GGUF/ONNX publicados; el despliegue fuera del ecosistema LeRobot requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS__ID_146338
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_can_ph_image84
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_can_ph_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/castanetnicolas
- Checkpoint hermano (chunk 50 / exec 50): https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_50_Exec_50
