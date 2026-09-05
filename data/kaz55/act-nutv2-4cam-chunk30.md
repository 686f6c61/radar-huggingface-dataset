# Kaz55/act-nutv2-4cam-chunk30

## Resumen

El modelo `Kaz55/act-nutv2-4cam-chunk30` es un checkpoint de política robótica de aprendizaje por imitación desarrollado por Kaz55. Se basa en la arquitectura Action Chunking with Transformers (ACT), descrita en el paper de 2023, y está entrenado para controlar un robot manipulador a partir de observaciones de cuatro cámaras. El modelo predice bloques de 30 acciones consecutivas, lo que reduce el error acumulado durante la ejecución y mejora la robustez frente a perturbaciones del entorno.

Este checkpoint está publicado a través de la librería LeRobot de Hugging Face, que facilita el entrenamiento, la evaluación y el despliegue de políticas de control robótico. La tarea concreta está vinculada al dataset `Kaz55/dg5f_ur5e_nutv2`, lo que sugiere que está especializada en la manipulación de piezas mecánicas (posiblemente tuercas, según el nombre). El modelo tiene un total de 51.637.914 parámetros, un tamaño de 0,2 GB y licencia Apache 2.0, lo que permite su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.637.914 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de vision-accion sin contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de control robotico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura utilizada es Action Chunking with Transformers, un modelo encoder-decoder basado en transformadores que procesa imagenes de multiples camaras y el estado del robot (posiciones articulares, fuerza, etc.) para generar acciones continuas. En lugar de predecir un unico paso de control, ACT predice un chunk de 30 acciones consecutivas, lo que permite mantener la coherencia temporal de la ejecucion y mitigar los efectos del error de acumulacion. El encoder integra informacion visual de las cuatro camaras mediante mecanismos de atencion cruzada, mientras que el decoder autoregresivo genera la secuencia de acciones.

El entrenamiento se realiza mediante aprendizaje por imitacion a partir de demonstraciones teleoperadas. No se ha informado sobre el uso de RLHF, DPO ni tecnicas de refuerzo posterior. El dataset de entrenamiento es `Kaz55/dg5f_ur5e_nutv2`, aunque no se han publicado detalles sobre su composicion, numero de episodios ni equivalentes en tokens. La herramienta de entrenamiento y evaluacion es la libreria LeRobot, que se encarga de la gestion de datos, el bucle de aprendizaje y la publicacion del checkpoint en el Hub.

## Capacidades

- Generacion de acciones de control continuo para robots manipuladores, incluyendo posiciones y velocidades objetivo del efector final.
- Procesamiento multimodal de imagenes de cuatro camaras simultaneas, util para la estimacion de poses y la deteccion de objetos desde distintos angulos.
- Prediccion de chunks de 30 acciones, lo que permite ejecutar secuencias de movimiento mas largas sin re-planificar en cada paso.
- Aprendizaje por imitacion a partir de demonstraciones humanas teleoperadas.
- Integracion nativa con LeRobot, lo que simplifica el reentrenamiento, la evaluacion en el mundo real y la publicacion de nuevas policies.
- No soporta generacion de texto, tool calling ni razonamiento simbolico; es un modelo puramente de control.

## Casos de uso

- Ensamblaje mecanico automatizado: el modelo puede aprender a colocar tuercas y pernos con precision mediante demonstraciones teleoperadas. Gracias al chunking de 30 acciones, mantiene la estabilidad durante operaciones de insercion complejas.
- Recogida y colocacion de piezas: la politica procesa datos de cuatro camaras, lo que permite localizar objetos en bandejas o superficies de trabajo y ejecutar maniobras de agarre repetibles.
- Investigacion en aprendizaje por imitacion: este checkpoint sirve como base para comparar variantes de ACT en tareas de manipulacion de precision, ya que esta publicado con LeRobot y es facilmente reentrenable.
- Automatizacion de ciclos cortos en produccion: el modelo puede integrarse en brazos robots UR5e para ejecutar tareas de ensamblaje que antes requerian operarios, con la ventaja de poder adaptarse a nuevas variantes mediante pocas demonstraciones.
- Validacion de controladores en simulacion y hardware: al ser un modelo de 51 millones de parametros, permite iterar rapidamente en el desarrollo de controladores para entornos con multiples camaras, sin necesidad de infraestructura de gran escala.
- Demostraciones educativas en robotica: el modelo puede utilizarse en laboratorios universitarios para ensenar el flujo completo de LeRobot, desde la recogida de datos hasta la ejecucion de una politica entrenada en el mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de valores de exito en tareas, ni comparativas con otros modelos de la misma categoria. El rendimiento real solo puede evaluarse mediante la ejecucion de la politica en el robot objetivo con el dataset propio.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM, latencia ni throughput por parte del autor.
- El modelo tiene 51,6 millones de parametros y un peso de 0,2 GB, por lo que es ligero para los estandares actuales de inferencia.
- Para la inferencia completa con LeRobot es necesario disponer de una GPU compatible con CUDA, ademas del brazo robotico con las cuatro camaras configuradas.
- No se dispone de informacion sobre si cabe en una GPU de consumo. Dado el tamano del checkpoint, es plausible que una GPU con al menos 8 GB de VRAM pueda ejecutar la política, pero no es un dato confirmado.
- Las opciones de despliegue se limitan al ecosistema de LeRobot: la evaluacion se realiza con `lerobot-record` y el reentrenamiento con `lerobot-train` (ver documentacion oficial). No hay soporte para vLLM, Ollama ni llama.cpp porque no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado benchmarks ni comparaciones directas con otras policies de la misma categoria en la informacion proporcionada. Sin embargo, existen otros checkpoints de ACT publicados por el mismo autor, como `Kaz55/act-newcable-combined-4cam-chunk30`, que comparten arquitectura y numero de parametros aproximados, aunque sin datos de rendimiento publicados.

## Limitaciones y advertencias

- El modelo esta especializado en la tarea y el entorno para los que fue entrenado. Cambios en la iluminacion, textura de los objetos, posicion de las camaras o calibracion del robot pueden degradar su rendimiento de forma significativa.
- Al ser una politica de aprendizaje por imitacion, hereda los sesgos del proceso de teleoperacion. Si las demonstraciones no cubren ciertos estados del robot o configuraciones de los objetos, la politica puede comportarse de forma impredecible.
- No se ha informado sobre tasas de fallo ni tests de seguridad. Su uso en entornos fisicos requiere supervision profesional y medidas de seguridad adecuadas, ya que no existe garantia de operacion segura en condiciones no contempladas en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye sin garantias. El usuario es responsable de validar el comportamiento en su propio despliegue.
- No es un modelo de lenguaje generativo ni de proposito general, por lo que no puede manejar tareas fuera del ambito de control robotico para el que fue disenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/act-nutv2-4cam-chunk30
- Paper de referencia de ACT: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo similar del mismo autor: https://huggingface.co/Kaz55/act-newcable-combined-4cam-chunk30
