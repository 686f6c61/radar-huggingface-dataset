# charlieK123/gripper_rgb_depth_ACT

## Resumen

`charlieK123/gripper_rgb_depth_ACT` es una politica de robotica basada en Action Chunking with Transformers (ACT), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. El modelo lo publica el usuario charlieK123 en Hugging Face mediante la libreria LeRobot de Hugging Face, y esta entrenado para la tarea concreta "picking up forceps and sorting the forceps" sobre un brazo `so_follower` con cuatro camaras (tres RGB y una de profundidad asociada al gripper).

El modelo ocupa 51.668.614 parametros (unos 0,2 GB en el repositorio) y consume como entrada un vector de estado de 6 dimensiones junto con cuatro flujos visuales de 480x640 a 30 FPS, produciendo como salida un vector de accion de 6 dimensiones. Es relevante como ejemplo practico de politica visual-motora RGB-D reproducible en hardware de bajo coste, ya que ACT alcanza tasas de exito altas en tareas de manipulacion fina con datos de teleoperacion, y todo el flujo de entrenamiento e inferencia es abierto bajo licencia Apache 2.0.

No es un modelo de lenguaje ni un modelo generativo de texto: es una politica de control entrenada de forma supervisada a partir de demostraciones humanas, por lo que conceptos como contexto de tokens o soporte multilingue no son aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT): transformer encoder-decoder con CVAE, segun el metodo del paper 2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (politica de imitacion; observaciones por fotograma y chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplicable (modelo de control robotico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | `so_follower` |
| Camaras | `gripperCam`, `isoCam`, `baseCam`, `gripperCam_depth` |
| Entrada (observacion) | `observation.state` (6,), cuatro imagenes (3, 480, 640) |
| Salida (accion) | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion descrito en el paper 2304.13705 que combina un backbone visual con un transformer encoder-decoder para predecir un *chunk* de varias acciones futuras a partir de las observaciones actuales. La formulacion incluye un componente CVAE (autoencoder variacional condicional) que modela la variabilidad de las trayectorias humanas y ayuda a mitigar el error de compounding que aparece cuando se predicen acciones paso a paso. El recuento de 51.668.614 parametros es coherente con un backbone visual convolucional mas una cabeza transformer. El detalle exacto de capas, dimensiones y tamano de chunk no se especifica en la informacion disponible.

Los datos de entrenamiento provienen del dataset `charlieK123/depth_dataSet_act_rgbd`: 50 episodios, 20.755 fotogramas grabados a 30 FPS, correspondientes a la tarea "picking up forceps and sorting the forceps". La configuracion de entrenamiento reportada es de 50.000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.1. No se indica en la informacion disponible si se aplico RLHF, DPO ni ninguna otra fase de ajuste por preferencias; en el contexto de ACT el entrenamiento es puramente supervisado por imitacion.

## Capacidades

- Control visual-motor para manipulacion robotica: genera comandos de accion de 6 grados de libertad a partir del estado del robot y de cuatro camaras.
- Fusion de informacion RGB y de profundidad: la camara `gripperCam_depth` aporta informacion de profundidad junto a las tres vistas RGB.
- Prediccion por chunks: emite secuencias cortas de acciones coherentes en el tiempo, lo que reduce el temblor y mejora la suavidad respecto a politicas paso a paso.
- Ejecucion de una tarea concreta aprendida por imitacion: "picking up forceps and sorting the forceps".
- Inferencia a la frecuencia de los datos de entrenamiento (30 FPS), compatible con el bucle de control de un brazo `so_follower`.
- Soporte de tool calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision, audio, lenguaje): no aplicable; el modelo solo consume estado e imagenes y devuelve acciones.

## Casos de uso

- Automatizacion de tareas de picking y clasificacion de instrumentos: el modelo puede recoger pinzas y ordenarlas en un laboratorio o banco de trabajo, reproduciendo la tarea demostrada por teleoperacion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para comparar variantes de ACT, cambios en el numero de camaras o la incorporacion de profundidad.
- Prototipado rapido en robotica de bajo coste: al usar el tipo de robot `so_follower` y LeRobot, permite montar un banco de pruebas economico con un brazo y varias camaras OpenCV.
- Fine-tuning sobre nuevos datasets: puede reentrenarse con `lerobot-train` sobre otras tareas de manipulacion fina para adaptar la politica a objetos o entornos distintos.
- Evaluacion de politicas RGB-D frente a politicas solo RGB: la presencia de una camara de profundidad permite estudiar la contribucion de la informacion 3D a la tasa de exito en tareas de agarre.
- Demostraciones educativas de robotica con IA: util para cursos y talleres que ensenen el ciclo completo de teleoperacion, grabacion de datos, entrenamiento y despliegue en un robot real.
- Despliegue en bucle cerrado con `lerobot-rollout`: permite ejecutar la politica en el robot durante un tiempo determinado (`--duration`) o de forma indefinida para pruebas de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet." No hay tabla de exito por tarea, numero de ensayos ni tasa de acierto en robot real.

## Requisitos de hardware

- VRAM para inferencia: el modelo tiene 51.668.614 parametros, aproximadamente 0,21 GB en fp32 y 0,10 GB en fp16. Sumando las activaciones de cuatro imagenes de 480x640 por fotograma, se estima un consumo del orden de 1-2 GB de VRAM en fp32, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para la politica en si. Se puede usar desde una GTX 1650 o RTX 3060 hasta A100 o H100; las GPU de gama alta no aportan ventaja por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en hardware integrado con suficiente memoria.
- Hardware adicional obligatorio: el robot `so_follower` con sus camaras (`gripperCam`, `isoCam`, `baseCam`, `gripperCam_depth`) conectado por el puerto correspondiente, ya que la politica requiere observaciones reales del entorno.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=charlieK123/gripper_rgb_depth_ACT`. No se documentan en la informacion disponible exportaciones a vLLM, TGI, llama.cpp, Ollama u ONNX, que en cualquier caso no son aplicables a una politica de control.
- Latencia y throughput: se espera una inferencia por fotograma a 30 FPS para seguir el ritmo de los datos de entrenamiento, pero no se proporcionan cifras medidas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charlieK123/gripper_rgb_depth_ACT | ACT (politica) | 51.668.614 | Estado (6) + 4 camaras (RGB + profundidad) | apache-2.0 | Hugging Face / LeRobot |
| charlieK123/gripper_Top_Base_Camera_Views_ACT | ACT (politica) | no disponible | Vistas de camara superior y base | no disponible | Hugging Face / LeRobot |
| Diffusion Policy | Politica por difusion | no disponible | Observaciones visuales y de estado | no disponible | Implementaciones abiertas en la literatura |
| Modelos VLA (por ejemplo, pi0 / pi0-FAST) | Vision-Language-Action | no disponible | Imagenes + instrucciones en lenguaje | no disponible | Hugging Face / LeRobot |

La comparacion se limita a la categoria: todas son politicas de manipulacion entrenadas por imitacion. Los datos de parametros, contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada, salvo el recuento de parametros del modelo descrito.

## Limitaciones y advertencias

- Especificidad de tarea: la politica esta entrenada unicamente para "picking up forceps and sorting the forceps"; fuera de ese contexto se espera un rendimiento muy pobre.
- Dependencia del montaje: los nombres de las camaras y sus indices deben coincidir exactamente con las claves de observacion del entrenamiento (`gripperCam`, `isoCam`, `baseCam`, `gripperCam_depth`), y la posicion fisica de las camaras debe ser la misma o similar.
- Sin resultados de evaluacion: no se ha reportado ninguna tasa de exito en robot real, por lo que no se puede garantizar su funcionamiento ni cuantificar su fiabilidad.
- Dataset reducido: solo 50 episodios y 20.755 fotogramas, lo que limita la diversidad de objetos, posiciones, iluminacion y distractores vistos durante el entrenamiento.
- Sensibilidad a cambios de entorno: variaciones de iluminacion, fondo, posicion inicial de los objetos o un robot fisicamente distinto pueden degradar el comportamiento.
- Riesgo de fallo por compounding de errores: aunque ACT mitiga este problema mediante la prediccion por chunks, la politica puede desviarse y acumular error en ejecuciones largas.
- Sesgos: al derivar de demostraciones de una sola persona o configuracion, la politica hereda los sesgos de esas trayectorias (posiciones preferidas, velocidades, orden de manipulacion).
- Idioma y texto: no procesa lenguaje natural, por lo que no admite instrucciones verbales ni cambio de tarea en tiempo de ejecucion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y la atribucion; conviene revisar tambien las condiciones del dataset asociado.
- Uso en produccion: por el momento se trata de un artefacto de investigacion con 0 descargas y sin evaluacion publica, no de una politica validada para entornos industriales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlieK123/gripper_rgb_depth_ACT
- Dataset de entrenamiento: https://huggingface.co/datasets/charlieK123/depth_dataSet_act_rgbd
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlieK123/depth_dataSet_act_rgbd
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo relacionado del mismo autor: https://huggingface.co/charlieK123/gripper_Top_Base_Camera_Views_ACT
- Guia sobre Action Chunking Transformers: https://www.roboticscenter.ai/guides/action-chunking-transformers
