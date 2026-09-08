# Kaz55/act-combined-gs0-4cam-chunk60

## Resumen

El modelo `Kaz55/act-combined-gs0-4cam-chunk60` es un modelo de robótica basado en ACT (Action Chunking with Transformers), desarrollado por Kaz55 y entrenado con la librería LeRobot. Forma parte de un estudio de ablación sobre la resolución del sensor táctil GelSight en la tarea de clasificación de cables con un brazo robótico UR5e y una pinza DG-5F. En concreto, este modelo corresponde a la configuración sin sensor GelSight (resolución "none"), por lo que sus entradas se limitan a información de estado y a dos cámaras RealSense.

El modelo resuelve el problema de generar secuencias de acciones de control para un robot manipulador a partir de observaciones visuales y de estado. Su relevancia radica en que permite evaluar de forma aislada el impacto de la resolución táctil en el rendimiento de la política, ya que todos los demás parámetros del barrido experimental se mantienen idénticos. La arquitectura es un transformer con codificador CVAE, con un total de 51.668.634 parámetros, y una ventana de acciones de 60 pasos (chunk_size=60). No es un modelo de lenguaje, por lo que no aplican conceptos como longitud de contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.634 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk_size=60 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, que combina un codificador de tipo CVAE (Conditional Variational Autoencoder) con un transformer para predecir bloques de acciones futuras. En esta configuracion, el modelo genera 60 pasos de accion por prediccion (chunk_size=60, n_action_steps=60). Las entradas son `observation.state` (26 dimensiones) y dos imagenes de camaras RealSense a resolucion 640x480. Las senales de `observation.velocity` y `observation.effort` existen en el dataset pero se excluyen deliberadamente para mantener la coherencia con el baseline de 500x375.

El entrenamiento se realizo sobre el dataset `Kaz55/dg5f_ur5e_combined_gs0`, compuesto por 180 episodios y 208.933 frames. Se ejecutaron 200.000 pasos de entrenamiento con batch size 8 y semilla 1000. Este modelo es un punto de un barrido de ablacion en el que la unica variable que cambia entre ejecuciones es la resolucion del sensor GelSight; en este caso, el sensor no se utiliza en absoluto. Esto permite atribuir cualquier diferencia de rendimiento exclusivamente a la resolucion tactil.

## Capacidades

- Generacion de secuencias de acciones de control para un brazo robotico UR5e, con una ventana de 60 pasos.
- Percepcion visual basada en dos camaras RealSense a 640x480.
- Aprendizaje por imitacion a partir de demostraciones humanas, dentro del marco de LeRobot.
- No soporta tool calling, razonamiento simbolico ni generacion de texto.
- No tiene capacidades de vision de lenguaje, audio ni procesamiento multimodal mas alla de las entradas de estado y camaras.
- No es un modelo de lenguaje, por lo que no aplica soporte multilingue.

## Casos de uso

- Clasificacion y ordenacion de cables en entornos industriales: el modelo puede generar trayectorias de agarre y manipulacion para separar cables de distintos tipos sobre una mesa, utilizando la pinza DG-5F y el brazo UR5e.
- Investigacion en ablacion de sensores tactiles: permite comparar el rendimiento de una politica ACT con y sin sensor GelSight, manteniendo constantes el resto de variables, para cuantificar la contribucion del tacto.
- Automatizacion de tareas de ensamblaje repetitivas: el modelo puede aprender gestos precisos a partir de demostraciones y ejecutarlos de forma autonoma, siendo adecuado para tareas que requieren precision y consistencia.
- Desarrollo de politicas de control para robots colaborativos: al generar chunks de 60 acciones, el modelo puede integrarse en sistemas de control de bajo nivel para brazos robotizados en entornos de laboratorio.
- Benchmarking de arquitecturas ACT con diferentes configuraciones de percepcion: sirve como referencia para evaluar como afecta la eliminacion de una modalidad sensorial al exito de la tarea.
- Investigacion en aprendizaje por imitacion con LeRobot: el modelo es un ejemplo reproducible de entrenamiento de una politica ACT sobre un dataset propio, util para validar pipelines de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque el modelo card describe un barrido de ablacion con varias resoluciones de GelSight, no se proporcionan metricas de exito, tasas de completacion ni comparativas numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51,7 millones de parametros, en precision FP32 ocupa aproximadamente 207 MB; en FP16, unos 104 MB. La VRAM necesaria depende mas del procesamiento de las dos camaras que de los pesos del modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para ejecutar la inferencia. Para tiempo real con dos flujos de camaras, se recomienda una RTX 3060 o superior.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de gama baja como la RTX 3050 o incluso en una GTX 1660 con cuantizacion, aunque el rendimiento en tiempo real puede ser limitado.
- Opciones de despliegue: el modelo esta disenado para usarse con la libreria LeRobot en PyTorch; puede integrarse en sistemas ROS para control robotico. No es compatible con vLLM, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Resolucion GelSight | Parametros | Arquitectura | Notas |
|---|---|---|---|---|
| act-combined-gs0-4cam-chunk60 | none | 51.668.634 | ACT | Este modelo |
| act-newcable-combined-4cam-chunk60 | 500x375 | no disponible | ACT | Baseline del barrido |
| act-combined-gs320-4cam-chunk60 | 320x240 | no disponible | ACT | Punto intermedio de la ablacion |
| act-combined-gs200-4cam-chunk60 | 200x150 | no disponible | ACT | Punto intermedio de la ablacion |
| act-combined-gs120-4cam-chunk60 | 120x90 | no disponible | ACT | Punto intermedio de la ablacion |
| act-combined-gs64-4cam-chunk60 | 64x48 | no disponible | ACT | Punto intermedio de la ablacion |
| act-combined-gs32-4cam-chunk60 | 32x24 | no disponible | ACT | Punto intermedio de la ablacion |

Todos los modelos de la tabla comparten arquitectura, tamano de chunk y configuracion de entrenamiento. La unica diferencia es la resolucion del sensor tactil, por lo que son directamente comparables entre si. No se dispone de datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El modelo se ha entrenado sobre un dataset de 180 episodios, por lo que puede estar sesgado hacia los escenarios y objetos presentes en esas demostraciones.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede producir acciones incorrectas en situaciones no vistas durante el entrenamiento, lo que en robotica es equivalente a una prediccion erronea.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje. La ventana de acciones esta limitada a 60 pasos, lo que puede ser insuficiente para tareas de larga duracion que requieran replanificacion frecuente.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede garantizar su uso comercial sin autorizacion explicita del autor.
- Caveat importante para produccion: este modelo es un punto de un estudio de ablacion y no ha sido validado en entornos reales de produccion. Al excluir deliberadamente `observation.velocity` y `observation.effort`, puede perder informacion relevante para el control fino del robot. Ademas, al no usar GelSight, es previsible que su rendimiento sea inferior al de los modelos con resoluciones tactiles mas altas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/act-combined-gs0-4cam-chunk60
- Dataset utilizado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_combined_gs0
- Modelo baseline del barrido: https://huggingface.co/Kaz55/act-newcable-combined-4cam-chunk60
