# JayRobotics/ACT_demo_03

## Resumen

JayRobotics/ACT_demo_03 es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de observaciones de estado del robot y dos cámaras RGB (frontal y de muñeca), predice fragmentos cortos de acciones (action chunks) de 6 dimensiones en lugar de un único paso. El modelo tiene 51.669.638 parámetros y está empaquetado en safetensors, con un repositorio de apenas 0,2 GB.

Ha sido desarrollado por el usuario JayRobotics y entrenado con la librería LeRobot de Hugging Face, sobre el conjunto de datos data/SO101_servobox_100ep (100 episodios, 68.616 frames a 30 FPS). La tarea concreta es "Hold the servo motor box and put it in the transparent basket" (coger la caja de servomotores y colocarla en la cesta transparente), ejecutada sobre un brazo seguidor SO-101 (so_follower) con dos cámaras.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabar datos teleoperados, entrenar una política ACT y desplegarla en hardware real con el comando lerobot-rollout. Al estar bajo licencia Apache-2.0 y ser de tamaño reducido, sirve como referencia práctica para quien quiera replicar un pipeline de aprendizaje por imitación en robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con CVAE y encoders visuales para observaciones de imagen, segun el articulo arXiv:2304.13705 |
| Parametros totales | 51.669.638 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de un LLM; consume un state de 7 dimensiones y dos imagenes de 3x480x640) |
| Tipos de cuantizacion | no se documentan variantes de cuantizacion; pesos en safetensors |
| Idiomas soportados | no disponible (politica robotica, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo implementa el método ACT, un esquema de aprendizaje por imitacion que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE) y encoders visuales convolucionales para procesar las dos camaras. La entrada esta formada por observation.state (7,) y dos imagenes de 3x480x640 (camaras front y wrist); la salida es un vector action de (6,). La innovacion central de ACT es predecir chunks de acciones en lugar de pasos individuales, lo que reduce el error de composicion y mejora la estabilidad de las trayectorias, ademas de permitir tecnicas de ensemble temporal.

Segun la model card, el entrenamiento se realizo con LeRobot 0.6.2 durante 50.000 pasos, con batch size 16, optimizador adamw, learning rate 1e-05 y semilla 1000. El conjunto de datos data/SO101_servobox_100ep contiene 100 episodios y 68.616 frames a 30 FPS de datos teleoperados para la tarea de recoger la caja de servomotores y depositarla en la cesta. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo adicionales; se trata de aprendizaje supervisado a partir de demostraciones.

## Capacidades

- Control visuomotor de un brazo robotico so_follower a partir de estado propioceptivo e imagenes RGB.
- Prediccion de chunks de acciones de 6 dimensiones, orientada a tareas de manipulacion pick-and-place.
- Percepcion multimodal: fusiona el estado del robot (7 valores) con dos flujos visuales simultaneos (frontal y de muneca).
- Ejecucion de la tarea especifica de coger la caja de servomotores y colocarla en la cesta transparente.
- Inferencia en tiempo real sobre el robot mediante el comando lerobot-rollout de LeRobot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es una politica robotica, no un modelo generativo de texto.
- Entrenable y ajustable con el flujo lerobot-train para generar politicas equivalentes sobre otros datasets.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger la caja de servomotores y depositarla en la cesta, util como demostracion reproducible de un pipeline de aprendizaje por imitacion.
- Base para transferencia a tareas similares: partiendo de esta politica se puede reentrenar sobre un dataset propio con lerobot-train y el mismo tipo de robot SO-101.
- Banco de pruebas de LeRobot: sirve para validar la instalacion, la calibracion de camaras y el flujo de rollout en hardware real antes de escalar a proyectos mayores.
- Docencia y formacion en robotica: ejemplo completo, pequeno (0,2 GB) y con licencia permisiva para explicar ACT, aprendizaje por imitacion y despliegue edge.
- Prototipado de automatizacion de bajo coste: al ejecutarse sobre un brazo seguidor economico, permite evaluar tecnicas de imitacion sin GPU de gama alta.
- Evaluacion comparativa de politicas: sirve como referencia ACT dentro de LeRobot para contrastar con otras politicas (Diffusion Policy, SmolVLA, etc.) sobre la misma tarea y hardware.
- Recogida de datos y mejora iterativa: la politica puede desplegarse para generar episodios adicionales que alimenten un siguiente ciclo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet."), por lo que no se dispone de tasas de exito ni de comparaciones numericas verificadas con otras politicas.

## Requisitos de hardware

- VRAM estimada: con 51,7 M de parametros, los pesos en fp32 ocupan aproximadamente 0,2 GB; en fp16 alrededor de 0,1 GB. Sumando activaciones de los encoders visuales sobre imagenes de 480x640 y dos camaras, el consumo total se situa en el rango de 1 a 2 GB de VRAM (estimacion, no confirmada por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia comoda en tiempo real. Para entrenamiento, una GPU de gama media (RTX 3090/4090, A100, H100) acelera los 50.000 pasos del ciclo de entrenamiento.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos (GTX 1650 en adelante) y tambien en hardware embebido tipo Jetson, dado el tamano reducido del modelo.
- Opciones de despliegue: el flujo oficial es LeRobot (comandos lerobot-rollout y lerobot-train) sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a politicas roboticas.
- Latencia y throughput: no disponibles. La politica esta pensada para operar al ritmo de las camaras (30 FPS en el dataset), pero no se publican mediciones de latencia ni de frecuencia de control reales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JayRobotics/ACT_demo_03 | ACT (aprendizaje por imitacion) | 51,7 M | state (7,) + 2 imagenes 480x640 | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Otras politicas ACT en LeRobot | ACT | no disponible | depende del dataset | habitualmente apache-2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | politica generativa por difusion | no disponible | depende del dataset | no disponible | Hugging Face |
| SmolVLA (LeRobot) | vision-language-action | no disponible | depende del dataset | no disponible | Hugging Face |

No se dispone de cifras verificadas de rendimiento para establecer una comparacion cuantitativa con estas alternativas. La comparacion se limita al tipo de metodo, el tamano y la disponibilidad; consultese cada model card para los datos concretos.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real del modelo en el robot, en el mismo entorno o en entornos nuevos.
- Especificidad de tarea: la politica esta entrenada unicamente para la tarea de coger la caja de servomotores y colocarla en la cesta; fuera de ese objetivo no se garantiza un comportamiento util.
- Dependencia del hardware y del montaje: requiere el tipo de robot so_follower y camaras con nombres y calibracion coincidentes con los usados en el entrenamiento (front y wrist). Cambios de posicion de camaras, iluminacion o disposicion de objetos pueden degradar el rendimiento.
- Riesgo de fallo por sobreajuste al entorno de demostracion: al proceder de solo 100 episodios y un unico escenario, es probable una baja generalizacion a objetos, posiciones o condiciones de iluminacion distintas.
- Sin capacidades de lenguaje ni razonamiento: no puede interpretar instrucciones en lenguaje natural ni ejecutar tool calling; la tarea esta fijada en el entrenamiento.
- Sesgos y alucinacion: en el contexto de una politica robotica, el equivalente al sesgo es la reproduccion de los patrones de las demostraciones teleoperadas, incluidas posibles imperfecciones o colisiones del operador.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar en el hardware objetivo antes de cualquier despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JayRobotics/ACT_demo_03
- Articulo ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/data/SO101_servobox_100ep
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=data/SO101_servobox_100ep
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
