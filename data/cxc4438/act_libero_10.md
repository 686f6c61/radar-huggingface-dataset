# cxc4438/act_libero_10

## Resumen

`cxc4438/act_libero_10` es una politica robotica de aprendizaje por imitacion basada en ACT (Action Chunking with Transformers), el metodo presentado en el paper arXiv:2304.13705 y empaquetado con la libreria LeRobot de Hugging Face. El modelo no es un modelo de lenguaje: es un controlador de vision-lenguaje-accion simplificado que, a partir de dos imagenes RGB de 256x256 (camara frontal y de muneca) y un vector de estado de 8 dimensiones, predice un vector de accion de 7 dimensiones para un brazo Franka Emika Panda. Su relevancia esta en que sirve como referencia reproducible de ACT sobre el benchmark LIBERO, entrenada y publicada integramente mediante el flujo de trabajo de LeRobot.

Con 51.671.687 parametros (unos 51,7 millones) y un repositorio de 0,2 GB, es un modelo ligero que cabe en cualquier GPU de consumo e incluso permite inferencia en CPU a la frecuencia de control del dataset (10 FPS). La prediccion se hace por chunks de acciones en lugar de paso a paso, lo que reduce el error de acumulacion tipico de las politicas reactivas.

El modelo fue entrenado sobre el dataset `lerobot/libero_10` (379 episodios, 101.469 fotogramas, 10 tareas de manipulacion) durante 500 pasos con batch de 16, una cifra muy baja que sugiere un ajuste de demostracion o un experimento exploratorio mas que un entrenamiento convergido. No se han publicado resultados de evaluacion en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con cabeza de accion tipo VAE, prediccion por chunks |
| Parametros totales | 51.671.687 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje; consume una ventana de observaciones (imagenes + estado) y emite un chunk de acciones. Tamano de chunk: no disponible |
| Tipos de cuantizacion | No disponible; pesos distribuidos en safetensors a precision completa |
| Idiomas soportados | No aplica (politica robotica). Las instrucciones de tarea del dataset estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `panda` (Franka Emika Panda) |
| Camaras | `image`, `wrist_image` |
| Entradas | `observation.images.image` (3, 256, 256), `observation.images.wrist_image` (3, 256, 256), `observation.state` (8,) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | `lerobot/libero_10` (379 episodios, 101.469 fotogramas, 10 FPS) |
| Pasos de entrenamiento | 500 |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot 0.6.1 |
| Fecha de publicacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un backbone transformer con una formulacion de autoencoder variacional condicionado (CVAE) sobre las acciones. En lugar de predecir una unica accion por paso, el modelo genera un chunk de acciones futuras a partir de las observaciones actuales; esto aporta consistencia temporal y mitiga el problema de parada y arranque de las politicas paso a paso. En la implementacion de LeRobot, el modelo consume las dos imagenes mediante codificadores visuales tipo ResNet y el vector de estado mediante una proyeccion, y produce la secuencia de acciones con un decoder transformer. El paper original asocia la tecnica a manipulacion bimanual de bajo coste, aunque aqui se aplica a un unico brazo Panda.

El entrenamiento se realizo con LeRobot 0.6.1 sobre `lerobot/libero_10`: 379 episodios teleoperados, 101.469 fotogramas a 10 FPS, con 10 tareas de manipulacion (colocar tazas, abrir cajones, encender el fogon, manipular botes de moka, colocar libros, etc.). La configuracion registrada es de 500 pasos, batch de 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el numero de tokens o muestras vistas, la composicion exacta de aumentos de datos, ni si hubo fases de RLHF o DPO (no aplicables en el sentido clasico a una politica de imitacion). Tampoco se indica si se uso ensamblado temporal (temporal ensembling) en la evaluacion.

## Capacidades

- Control de manipulacion robotica de un solo brazo: genera comandos de 7 grados de libertad (posicion y orientacion del efector final mas pinza) a partir de observaciones visuales y propioceptivas.
- Percepcion visual multimodal: procesa simultaneamente una vista frontal y una vista de muneca a 256x256.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de recompensas ni simulador.
- Prediccion por chunks: emite secuencias cortas de acciones coherentes, lo que mejora la suavidad del movimiento frente a politicas reactivas.
- Ejecucion en tiempo real a la frecuencia de control del dataset (10 FPS) sobre hardware modesto.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje ni un agente conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes basados en lenguaje; la planificacion es implicita en el chunk de acciones.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no incluye modo de razonamiento explicito, vision-lenguaje generativa, audio ni generacion de texto.

## Casos de uso

- Reproduccion de tareas LIBERO en laboratorio: desplegar la politica sobre un Franka Panda real mediante `lerobot-rollout` y ejecutar cualquiera de las 10 tareas del dataset (por ejemplo, colocar la taza blanca en el plato izquierdo) durante una duracion controlada.
- Linea base de comparacion en investigacion: usar esta politica como referencia ACT entrenada sobre LIBERO para medir la mejora de metodos alternativos (Diffusion Policy, SmolVLA, pi0) bajo el mismo dataset y la misma interfaz de observaciones.
- Fine-tuning con datos propios: partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset de teleoperacion propio, aprovechando que el coste de entrenamiento de 51,7 M de parametros es asumible en una sola GPU de consumo.
- Automatizacion de pick-and-place en entorno controlado: tareas repetitivas de recogida y deposito de objetos rigidos con posiciones y condiciones de iluminacion estables.
- Docencia y formacion en robotica: emplear el modelo como ejemplo end-to-end de aprendizaje por imitacion con LeRobot, desde la grabacion de datos hasta el despliegue, en cursos o practicas de laboratorio.
- Prototipado rapido en hardware de bajo coste: validar una arquitectura ACT completa en una estacion con GPU modesta antes de invertir en modelos de mayor tamano.
- Pruebas de robustez y analisis de fallos: ejecutar la politica con variaciones de posicion inicial, distractores o iluminacion para caracterizar su sensibilidad, dado que la model card no aporta evaluacion previa.
- Integracion en pipelines de recogida de datos: usar las ejecuciones del modelo para generar episodios adicionales con la herramienta de rollout de LeRobot y ampliar un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la nota explicita de que no se han proporcionado resultados para esta politica, y no se reportan tasas de exito por tarea, MMLU, HumanEval, GSM8K ni metricas equivalentes (que, por otra parte, no aplican a un modelo de control robotico).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los 51,7 M de parametros ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16, mas el espacio de activaciones de los dos codificadores visuales a 256x256.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Para entrenamiento o recopilacion de datos a mayor frecuencia se recomienda RTX 3060 12 GB, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1650, RTX 3050, RTX 4090). Tambien es viable en CPU para inferencia a 10 FPS y en plataformas embebidas tipo NVIDIA Jetson Orin para despliegue a bordo del robot.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout`, `lerobot-train`) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. La model card no reporta latencia ni frecuencia de inferencia; la referencia operativa es la frecuencia del dataset, 10 FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cxc4438/act_libero_10` (este) | ACT sobre LeRobot | 51,7 M | Chunk de acciones (tamano no disponible) | apache-2.0 | Hugging Face, via LeRobot |
| Diffusion Policy (Chi et al.) | Politica generativa por difusion | No disponible | Horizonte de prediccion configurable | No disponible | Implementacion en LeRobot y repositorios de investigacion |
| SmolVLA | VLA compacto de LeRobot | No disponible en la informacion proporcionada | No disponible | No disponible | Hugging Face |
| pi0 / pi0.5 | VLA de gran escala | No disponible en la informacion proporcionada | No disponible | No disponible | Hugging Face |

La comparacion cuantitativa no puede completarse con la informacion disponible: no hay cifras de exito ni de latencia publicadas para esta politica, y las alternativas citadas pertenecen a categorias de mayor tamano (VLA con componente de lenguaje) o a familias generativas distintas, por lo que no son estrictamente equivalentes.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito publicadas, por lo que el rendimiento real de la politica es desconocido.
- Entrenamiento muy corto: 500 pasos con batch de 16 equivalen a unas 8.000 muestras procesadas, una fraccion minima de los 101.469 fotogramas del dataset; es probable que el modelo no haya convergido.
- Especificidad de tarea: solo cubre las 10 tareas de `lerobot/libero_10`, con objetos, posiciones y condiciones de iluminacion concretos; el rendimiento fuera de esa distribucion no esta caracterizado.
- Dependencia del hardware: las claves de observacion (`observation.images.image`, `observation.images.wrist_image`, `observation.state`) y el tipo de robot (`panda`) deben coincidir exactamente con la configuracion de entrenamiento; otro robot o montaje de camaras invalida la politica.
- Sin condicionamiento por lenguaje demostrado: las entradas declaradas son unicamente imagenes y estado; no hay evidencia en la model card de que la instruccion textual module el comportamiento.
- Riesgo de fallo silencioso: como toda politica de imitacion, puede ejecutar movimientos plausibles pero incorrectos ante objetos o configuraciones no vistas; no existe mecanismo de deteccion de error ni de rechazo.
- Sesgos: no documentados; los sesgos del dataset de teleoperacion (posiciones, materiales y sesiones concretas) se trasladan directamente a la politica.
- Licencia: los pesos se publican bajo apache-2.0, lo que permite uso comercial, pero la licencia del dataset `lerobot/libero_10` no se especifica en la informacion disponible y conviene verificarla antes de un uso comercial.
- Idiomas: la politica no procesa lenguaje; las tareas del dataset estan descritas en ingles.
- Madurez del repositorio: cero descargas y cero likes, y fechas de creacion y actualizacion separadas por un minuto, lo que indica un artefacto recien subido sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cxc4438/act_libero_10
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero_10
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero_10
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
