# guswjdddd/pick_n_place_v2_smolvla

## Resumen

`guswjdddd/pick_n_place_v2_smolvla` es un modelo de vision-lenguaje-accion (VLA) afinado a partir de `lerobot/smolvla_base`, la variante compacta de SmolVLA publicada por Hugging Face. El modelo resuelve una tarea de manipulacion robotica muy concreta: coger un cubo rojo y colocarlo sobre un cubo verde, usando un robot `so_follower` (SO-100/SO-101 de LeRobot) con tres camaras (`wrist`, `top`, `belly`). Con 450 millones de parametros y un repositorio de 1,2 GB, esta pensado para ejecutarse en hardware de consumo y en estaciones de trabajo modestas, no en clusters de GPU.

El modelo es relevante como ejemplo reproducible de flujo de imitacion end-to-end con LeRobot: se ha entrenado con 100 episodios y 45.282 fotogramas a 30 FPS, 30.000 pasos de entrenamiento y AdamW con learning rate 1e-4. No aporta innovaciones arquitectonicas propias; hereda la arquitectura SmolVLA del modelo base y solo cambia los pesos de la cabeza de accion y del adaptador visual al dominio especifico de la tarea.

Se trata de un artefacto de investigacion y prototipado, no de un modelo de produccion: no hay resultados de evaluacion publicados, cero descargas y cero likes en el momento de redactar esta ficha, y la model card conserva el texto plantilla de LeRobot sin rellenar la seccion de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto con encoder visual y experto de accion) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (las instrucciones de tarea se dan en ingles en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina un encoder visual (procesa tres flujos de imagen de 3x480x640) con un backbone de lenguaje y una cabeza de accion que emite un vector de 6 dimensiones por paso de control. La entrada de estado es `observation.state` con forma `(6,)` y la salida `action` con forma `(6,)`, lo que corresponde a las seis articulaciones del robot `so_follower`. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y descrito en el paper arXiv:2506.01844; este checkpoint solo anade un ajuste fino supervisado sobre el dataset `guswjdddd/pick_n_place_v2_20261118_135308`.

El entrenamiento se realizo con LeRobot 0.6.1: 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset consta de 100 episodios y 45.282 fotogramas grabados a 30 FPS con una unica instruccion en lenguaje natural ("Pick up the red cube and place it on the green cube"). No se documenta uso de RLHF, DPO ni decodificacion especulativa; es imitacion conductual pura sobre demostraciones teleoperadas. La innovacion tecnica relevante es la del modelo base: un VLA de 450 M de parametros disenado para inferencia en tiempo real en GPU de consumo, no una tecnica nueva introducida por este fine-tune.

## Capacidades

- Generacion de acciones de manipulacion robotica de 6 grados de libertad a partir de observaciones multimodales (tres camaras + estado articular).
- Seguimiento de una instruccion de tarea en lenguaje natural, aunque en este checkpoint la unica instruccion vista en entrenamiento es "Pick up the red cube and place it on the green cube".
- Percepcion visual multi-camara simultanea: vista de muneca, vista superior y vista frontal (`wrist`, `top`, `belly`).
- Control reactivo a 30 FPS, compatible con el bucle de `lerobot-rollout`.
- No soporta tool calling ni function calling: es un modelo de politica robotica, no un LLM conversacional.
- No soporta agentes multi-paso en el sentido de razonamiento simbolico; la "planificacion" es implicita en la politica.
- Capacidades multilingues: no disponibles; la instruccion de tarea esta fijada en ingles.
- No dispone de modo thinking, vision general, audio ni otras capacidades fuera del dominio robotico.

## Casos de uso

- Prototipo de pick-and-place en laboratorio: ejecutar la politica sobre un SO-100/SO-101 con las tres camaras calibradas para validar el pipeline completo de LeRobot antes de escalar a tareas mas complejas.
- Docencia y formacion en imitacion robotica: usar el checkpoint como referencia de como se ve un fine-tune de SmolVLA con 100 episodios y 30.000 pasos, comparando hiperparametros y curvas de entrenamiento.
- Base para experimentos de domain randomization: partir de estos pesos y reentrenar con variaciones de iluminacion, posicion de cubos y distractores para medir robustez.
- Benchmark interno de latencia: al ser un modelo de 450 M de parametros, sirve para medir throughput de `lerobot-rollout` en GPUs de consumo antes de invertir en modelos mayores.
- Recoleccion de datos asistida: desplegar la politica en modo `base` (sin grabar) para generar trayectorias iniciales que luego se corrigen por teleoperacion y se anaden al dataset.
- Prueba de concepto de despliegue en el borde: verificar si un robot de bajo coste con una Jetson o una RTX de gama media puede ejecutar un VLA compacto en tiempo real con tres camaras a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion sin rellenar y declara explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de exito en la tarea, ni de comparaciones con el modelo base u otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (450 M de parametros, pesos en fp32/bf16) se situa en el orden de 1-2 GB para los pesos, mas el coste de los tres flujos de imagen a 480x640 y el estado intermedio del encoder visual.
- GPU recomendadas: no especificadas por el autor. El paper del modelo base (SmolVLA) esta orientado a hardware de consumo; se espera que quepa en RTX 3060/4060 en adelante, aunque no hay medicion publicada para este checkpoint.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, pero sin confirmacion empirica en la model card.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), con `--policy.path=guswjdddd/pick_n_place_v2_smolvla`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. El bucle de control esta pensado para 30 FPS, pero no se aportan mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `guswjdddd/pick_n_place_v2_smolvla` | 450 M | no disponible | Pick-and-place cubo rojo sobre verde (SO-100) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | ~450 M (misma familia) | no disponible | VLA general preentrenado para fine-tune | Apache 2.0 (segun repositorio base) | Hugging Face, modelo base oficial |
| OpenVLA | ~7 B | no disponible en esta ficha | VLA general de mayor escala | no disponible en esta ficha | Hugging Face |
| pi0 (Physical Intelligence) | no disponible en esta ficha | no disponible | VLA general | no disponible en esta ficha | no disponible en esta ficha |

La comparacion cuantitativa con OpenVLA o pi0 no puede completarse con la informacion disponible; solo se confirma que SmolVLA pertenece a la categoria de VLA compactos y que este checkpoint es un fine-tune de tarea unica, no un modelo general.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo solo ha visto una tarea y un entorno; generalizara mal a objetos, colores, posiciones o instrucciones distintas de las del dataset de entrenamiento.
- Riesgo de alucinacion: en el sentido de ejecutar una trayectoria plausible pero incorrecta cuando la escena difiere de la distribucion de entrenamiento; no hay evaluacion que cuantifique este riesgo.
- Limitaciones de contexto e idioma: la instruccion de tarea esta fijada en ingles y no se documentan capacidades multilingues; el estado de entrada es de 6 dimensiones, acoplado al robot `so_follower`.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de `lerobot/smolvla_base`; conviene verificar la licencia y los terminos del modelo base y del dataset antes de un despliegue comercial.
- Caveat de produccion: cero descargas y cero likes, sin resultados de evaluacion; no debe considerarse validado para uso real sin una bateria de pruebas propia en el robot objetivo.
- Dependencia de calibracion: las tres camaras deben nombrarse y calibrarse exactamente como en el entrenamiento (`wrist`, `top`, `belly`), y el robot debe ser del tipo `so_follower`; cualquier desviacion invalida la politica.
- Sin cuantizaciones oficiales publicadas: no hay GGUF, AWQ ni variantes optimizadas, lo que limita el despliegue en hardware muy restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guswjdddd/pick_n_place_v2_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/guswjdddd/pick_n_place_v2_20261118_135308
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=guswjdddd/pick_n_place_v2_20261118_135308
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
