# castanetnicolas/ACT_UR5e_BS_256_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS_84_ID_146276

## Resumen

Este repositorio contiene una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers), desarrollada por el usuario castanetnicolas y publicada en Hugging Face con la librería LeRobot. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice fragmentos cortos de acciones (action chunks), lo que reduce el error de acumulación y produce trayectorias más suaves y estables. El modelo resuelve una tarea concreta de manipulación: recoger una lata y depositarla en la papelera correspondiente.

Se trata de un modelo pequeño, de unos 51,6 millones de parámetros, con pesos en formato safetensors y un tamaño de repositorio de 0,2 GB. Consume tres entradas: el estado del robot (vector de 9 dimensiones) y dos cámaras con imágenes de 84x84 píxeles (una vista general del entorno, `agentview`, y una vista de muñeca, `robot0_eye_in_hand`). Produce como salida un vector de acción de 7 dimensiones, típico de un brazo robótico de 6 grados de libertad más pinza.

Su relevancia es la de un artefacto reproducible de investigación: está entrenado sobre un conjunto de datos público de 200 episodios y 23.207 fotogramas a 20 FPS, con una configuración de entrenamiento completamente documentada (100.000 pasos, batch de 256, AdamW, learning rate 1e-5). No obstante, no se han publicado resultados de evaluación, y existe una discrepancia entre el nombre del repositorio (que menciona un UR5e) y la model card (que declara un robot tipo `panda`), lo que conviene tener en cuenta antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador CVAE para el entrenamiento, segun el paper arXiv:2304.13705 |
| Parametros totales | 51.580.551 (aproximadamente 51,6 M), dato real de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de LLM; el nombre del repositorio sugiere un horizonte de chunk de 10 acciones, sin confirmar en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones GGUF, AWQ ni similares) |
| Idiomas soportados | No aplica (politica robotica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el metodo ACT presentado en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). Se compone de un autoencoder variacional condicional (CVAE) que codifica la secuencia de acciones objetivo durante el entrenamiento y un transformer que, en inferencia, predice un fragmento de acciones futuras a partir de las observaciones. Este enfoque de action chunking mitiga el problema de la acumulacion de errores de las politicas paso a paso y permite movimientos mas coherentes.

Los datos de entrenamiento provienen del conjunto `castanetnicolas/robomimic_can_ph_image84`: 200 episodios, 23.207 fotogramas a 20 FPS, para la tarea "Pick up the can and place it in the matching bin.". El nombre del dataset apunta al ecosistema robomimic, de modo que es probable que se trate de datos de simulacion, aunque la model card no lo declara explicitamente. La configuracion de entrenamiento reportada incluye 100.000 pasos, tamano de lote 256, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se indica el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo esperable en aprendizaje por imitacion.

## Capacidades

- Generacion de acciones motoras: produce un vector de accion de 7 dimensiones compatible con un brazo manipulador de 6 grados de libertad mas pinza.
- Percepcion visual multimodal: procesa simultaneamente dos flujos de imagen de 84x84 (vista general y vista de muneca) junto con el estado propioceptivo del robot de 9 dimensiones.
- Action chunking: predice secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la estabilidad de la ejecucion.
- Ejecucion de una tarea especifica de pick-and-place: recoger una lata y colocarla en la papelera correspondiente.
- Aprendizaje por imitacion a partir de datos teleoperados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de los agentes basados en LLM.
- No dispone de capacidades multilingues, ni de vision semantica general, ni de audio.
- No dispone de modo de razonamiento explicito (thinking mode).

## Casos de uso

- Automatizacion de pick-and-place en simulacion: la politica ejecuta la secuencia completa de recoger una lata y depositarla en la papelera correspondiente, con entrada visual de dos camaras y estado del robot, lo que permite validar el pipeline completo sin hardware fisico.
- Punto de partida para fine-tuning: al estar entrenada con LeRobot y publicada con su configuracion completa, sirve como inicializacion para reentrenar con datos propios de otra tarea o de otro brazo robotico.
- Estudio comparativo de hiperparametros: el repositorio documenta un batch de 256, y el propio autor publica variantes con batch 8 y chunk 50, lo que facilita analisis controlados del efecto del chunk y del lote sobre la tasa de exito.
- Benchmarking de frameworks de imitacion: permite medir el coste de entrenamiento y de inferencia de ACT frente a alternativas como Diffusion Policy dentro de un mismo pipeline LeRobot.
- Investigacion en transferencia sim-to-real: si los datos proceden de robomimic, la politica es un candidato natural para estudiar la brecha entre simulacion y robot real y las tecnicas de domain randomization necesarias.
- Docencia y formacion: por su tamano reducido (51,6 M de parametros) y su licencia permisiva, es adecuado para cursos o talleres donde se ensene el ciclo completo de recogida de datos, entrenamiento y despliegue con LeRobot.
- Despliegue en hardware de borde: al caber en memoria de una GPU de consumo o incluso en CPU, puede ejecutarse en un equipo embebido junto al controlador del robot para tareas de demostracion.
- Evaluacion de robustez ante variaciones: permite probar como se comporta una politica de imitacion ante cambios de iluminacion, posicion del objeto o distractores, aunque no se han publicado resultados de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia, con la nota explicita de que no se han proporcionado resultados para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,2 GB de pesos; en FP16, en torno a 0,1 GB. El repositorio ocupa 0,2 GB en total.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere hardware de gama alta. Una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes y quedan sobredimensionadas para el tamano del modelo.
- Ejecucion en GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo actual e incluso en iGPU.
- Ejecucion en CPU: viable, dado el reducido numero de parametros, aunque la latencia puede limitar el control en tiempo real a 20 FPS.
- Plataformas embebidas: Jetson Orin o similares son candidatos razonables para ejecutar la politica junto al robot, sin datos confirmados de latencia.
- Opciones de despliegue: la via documentada es LeRobot, mediante el comando `lerobot-rollout` con `--policy.path` apuntando a este repositorio. No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El bucle de control de la tarea original es de 20 FPS, pero la model card no reporta cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_UR5e_BS_256_Act_Chunk_10_Exec_10 (este) | ACT, imitacion | 51,6 M | Chunk de 10 acciones segun el nombre del repositorio (sin confirmar) | Apache 2.0 | Hugging Face, libreria LeRobot |
| castanetnicolas/ACT_UR5e_BS_8_Act_Chunk_50 | ACT, imitacion | 51,6 M | Chunk de 50 acciones segun el nombre del repositorio | No disponible en la informacion consultada | Hugging Face |
| castanetnicolas/act_ur5e_pick_place | ACT, imitacion | No disponible | No disponible | No disponible en la informacion consultada | Hugging Face |
| Diffusion Policy | Politica de difusion, imitacion | No disponible | No disponible | No disponible | Implementacion disponible en LeRobot |

Las cifras de parametros de las alternativas deben verificarse en sus respectivas fichas; en la informacion consultada solo se confirma el dato de este modelo. No se dispone de comparativas de rendimiento entre estas politicas porque no hay resultados de evaluacion publicados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no reporta tasa de exito ni numero de ensayos, por lo que no hay evidencia cuantitativa de que la politica funcione de forma fiable.
- Discrepancia de robot: el nombre del repositorio indica UR5e, mientras que la model card declara `robot type: panda`. Es imprescindible verificar en que plataforma se recogieron los datos antes de desplegarla.
- Origen probablemente simulado: el dataset parece provenir de robomimic, por lo que el rendimiento en un robot real puede degradarse de forma notable por la brecha sim-to-real.
- Tarea unica y estrecha: la politica esta entrenada exclusivamente para "Pick up the can and place it in the matching bin." y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno visual: las entradas son imagenes de 84x84 píxeles, una resolucion muy baja que limita la robustez ante cambios de iluminacion, texturas o posiciones no vistas en entrenamiento.
- Dependencia de la configuracion de camaras: los nombres y la ubicacion de las camaras deben coincidir exactamente con los del entrenamiento (`agentview` y `robot0_eye_in_hand`), o la politica fallara.
- Cero adopcion verificable: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de sobreajuste al conjunto de datos: 200 episodios y 23.207 fotogramas son un volumen modesto para aprendizaje por imitacion.
- Licencia Apache 2.0: permisiva y apta para uso comercial, aunque conviene revisar la licencia del dataset asociado y del propio paper de ACT al redistribuir derivados.
- Fecha de creacion inusual: la ficha indica 2026-10-01 como fecha de creacion, dato a contrastar si la cronologia es relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_256_Act_Chunk_10_Exec_10_TASK_pick_place_can_PIXELS_84_ID_146276
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_can_ph_image84
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_can_ph_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Perfil del autor: https://huggingface.co/castanetnicolas
- Modelo relacionado del mismo autor: https://huggingface.co/castanetnicolas/act_ur5e_pick_place
- Modelo relacionado con otro chunk y batch: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_8_Act_Chunk_50
