# robosta-tr03/act_so101_pick_place

## Resumen

El modelo `robosta-tr03/act_so101_pick_place` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario robosta-tr03 y entrenado con el framework LeRobot de Hugging Face. El modelo está diseñado para controlar un brazo robótico SO-101 (tipo `so_follower`) en una tarea concreta de pick-and-place: recoger un cubo y colocarlo sobre un plato.

Con 51,6 millones de parámetros, el modelo procesa observaciones de estado (6 dimensiones) y dos imágenes de cámara (frontal y de muñeca, ambas a 480×640 píxeles) para generar comandos de acción de 6 dimensiones. Se entrenó sobre un dataset de 10 episodios teleoperados (11 278 fotogramas a 30 FPS) durante 20 000 pasos. Su relevancia radica en ser un ejemplo práctico de política de imitación para manipulación robótica, publicada bajo licencia Apache 2.0 y reproducible con las herramientas de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51 668 614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robotico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que, en lugar de predecir una sola accion por paso, genera un fragmento (chunk) de acciones futuras. Esto reduce el error de acumulacion y mejora la suavidad del movimiento. La arquitectura se basa en un transformer encoder-decoder que procesa observaciones visuales (dos camaras) y de estado del robot para producir secuencias de acciones. El modelo fue entrenado con LeRobot version 0.6.1, usando el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 8 y semilla 1000, durante 20 000 pasos. El dataset de entrenamiento, `robosta-tr03/so101_pick_place`, contiene 10 episodios teleoperados (11 278 fotogramas a 30 FPS) de la tarea "Pick up the cube and place it on the plate". No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; es un entrenamiento puramente de clonacion de comportamiento.

## Capacidades

- Generacion de acciones de control para un brazo robotico SO-101: el modelo produce comandos de 6 dimensiones (posicion y orientacion del efector final) a partir de observaciones de estado y vision.
- Percepcion visual multimodal: procesa simultaneamente dos flujos de imagen (camara frontal y camara de muñeca) a resolucion 480×640.
- Aprendizaje por imitacion: reproduce la tarea de pick-and-place aprendida de demostraciones teleoperadas.
- Ejecucion en tiempo real: al predecir chunks de acciones, permite un control mas fluido y menos reactivo que politicas paso a paso.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es un modelo puramente motor, sin interfaz textual.

## Casos de uso

- Automatizacion de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un brazo SO-101 para recoger objetos de una posicion fija y colocarlos en un destino, util para pruebas de manipulacion repetitiva.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del chunking de acciones en la precision y suavidad del movimiento, comparando con politicas que predicen paso a paso.
- Benchmarking de politicas ACT: al estar publicado con pesos safetensors y configuracion de entrenamiento completa, permite reproducir experimentos y comparar variantes (cambios de dataset, hiperparametros, arquitectura).
- Desarrollo de pipelines de robotica con LeRobot: el modelo demuestra el flujo completo de grabacion de datos, entrenamiento y despliegue con la herramienta `lerobot-rollout`, sirviendo de plantilla para nuevas tareas.
- Educacion en robotica y aprendizaje automatico: por su tamano reducido (51,6 M de parametros) y licencia permisiva, es adecuado para cursos que necesiten un ejemplo funcional de politica de manipulacion sin requerir hardware de altas prestaciones.
- Validacion de robustez en tareas de manipulacion: aunque el dataset es pequeno, el modelo puede usarse para probar la generalizacion a variaciones de posicion del objeto, iluminacion o distracciones, como se plantea en proyectos similares de la comunidad SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de exito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamano del modelo (51,6 M de parametros) y la entrada de dos imagenes 480×640, se estima que cabe en una GPU consumer con al menos 4-6 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: no hay especificacion oficial. Por el tamano, una RTX 3060 o superior deberia ser suficiente para inferencia en tiempo real; una RTX 4090 o A100 permitiria entrenamiento y evaluacion mas rapida.
- Compatibilidad con consumer GPU: probablemente si, dado el bajo numero de parametros, pero no hay confirmacion del autor.
- Opciones de despliegue: el modelo se ejecuta con LeRobot mediante `lerobot-rollout` (ver model card). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robosta-tr03/act_so101_pick_place | 51,7 M | no aplica | Pick-and-place SO-101 | apache-2.0 | Hugging Face |
| robosta-tr01/act_so101_pick_place | no disponible | no aplica | Pick-and-place SO-101 | no disponible | Hugging Face |
| RobotLearningProject/act_so101_pickplace_ft | no disponible | no aplica | Pick-and-place SO-101 (fine-tune) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. Los tres comparten la misma tarea y arquitectura ACT, pero no hay informacion publica sobre sus resultados en robot real.

## Limitaciones y advertencias

- Sin evaluacion en robot real: la model card no incluye resultados de pruebas fisicas, por lo que se desconoce la tasa de exito real y la robustez ante variaciones del entorno.
- Dataset de entrenamiento muy pequeno: solo 10 episodios, lo que limita la generalizacion a nuevas posiciones, iluminacion o distracciones. Es probable que el modelo falle fuera de las condiciones exactas de las demostraciones.
- Tarea especifica: el modelo solo sabe ejecutar la tarea de pick-and-place del cubo sobre el plato; no es reutilizable para otras tareas sin reentrenamiento.
- Sin soporte de lenguaje ni interaccion textual: no puede recibir instrucciones en lenguaje natural ni explicar sus decisiones.
- Riesgo de sobreajuste: con 20 000 pasos sobre 10 episodios, existe una alta probabilidad de que el modelo memorice las trayectorias de entrenamiento en lugar de aprender una politica generalizable.
- Restricciones de hardware: aunque el modelo es ligero, requiere un robot SO-101 y camaras compatibles para su despliegue; no es un modelo que se ejecute en un entorno simulado sin adaptacion.
- Licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias de funcionamiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robosta-tr03/act_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/robosta-tr03/so101_pick_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=robosta-tr03/so101_pick_place
- Modelo similar de robosta-tr01: https://huggingface.co/robosta-tr01/act_so101_pick_place
- Modelo similar de RobotLearningProject: https://huggingface.co/RobotLearningProject/act_so101_pickplace_ft
- Proyecto relacionado en GitHub (SO-101 tasks): https://github.com/Janarthsr/so101-robot-tasks
- Stack ROS 2 para SO-101: https://github.com/legalaspro/so101-ros-physical-ai
