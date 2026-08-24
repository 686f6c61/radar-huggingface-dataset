# learner1119/posco_act_square_260822_left_c20

## Resumen

Este modelo es una política de control robótico basada en ACT (Action-Chunking Transformer), entrenada con la librería LeRobot 0.4.3 por el usuario `learner1119` (doyoung kim) para la tarea de pick-and-place con el brazo izquierdo de un robot. El modelo aprende a imitar demostraciones humanas y genera secuencias de acciones de 20 pasos (1 segundo a 20 Hz) para controlar el brazo y el gripper. Con 51,6 millones de parámetros, está diseñado para ejecutarse en tiempo real en sistemas robóticos con una cámara y el estado del brazo como entrada. Su relevancia radica en ser un ejemplo práctico de clonación de comportamiento aplicada a la manipulación robótica, con un enfoque en la simplificación de la observación al eliminar dimensiones constantes del brazo derecho.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action-Chunking Transformer) |
| Parametros totales | 51.590.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 20 pasos de accion (ventana de chunking, equivale a 1 segundo a 20 Hz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se puede usar FP32/FP16) |
| Idiomas soportados | no aplica (modelo de control robotico, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, un transformer que genera secuencias de acciones (chunking) a partir de observaciones. En este caso, la observación consiste en una imagen de cámara (480x640 píxeles) y el estado del brazo (posición de las articulaciones y del gripper). El entrenamiento se realizó mediante clonación de comportamiento (behavioral cloning) con el dataset `square_260822_left`, que contiene 150 episodios y 73.529 fotogramas. Se eliminaron las dimensiones del brazo derecho porque eran constantes en las grabaciones, reduciendo el espacio de acción a 8 dimensiones (7 articulaciones del brazo izquierdo + 1 del gripper). El proceso incluye 50.000 pasos de entrenamiento con tamaño de lote 64 y una tasa de aprendizaje de 1e-05. No se aplicó RLHF ni DPO; el aprendizaje es puramente supervisado a partir de demostraciones.

## Capacidades

- Control de brazo robótico de 7 grados de libertad más el gripper (8 acciones).
- Aprendizaje por imitación de demostraciones humanas para tareas de pick-and-place.
- Generación de secuencias de acciones de 20 pasos (1 segundo) a una frecuencia de control de 20 Hz.
- Uso de observaciones multimodales: imagen de cámara y estado del brazo.
- Compatible con el ecosistema LeRobot para carga, preprocesado y ejecución.

## Casos de uso

- **Automatización de pick-and-place en líneas de ensamblaje**: el modelo puede controlar un brazo robótico para recoger y colocar piezas en posiciones fijas, reduciendo el tiempo de ciclo en tareas repetitivas.
- **Robótica de laboratorio**: en entornos de investigación, se puede usar para reproducir experimentos de manipulación con alta consistencia, por ejemplo, mover muestras entre placas.
- **Entrenamiento en simulación**: el modelo puede servir como referencia para simular el comportamiento de un brazo en entornos virtuales antes de desplegarlo en el mundo real.
- **Integración en sistemas de control existentes**: al ser compatible con LeRobot, se puede integrar en pipelines de robótica que ya utilizan esta librería, facilitando la sustitución de políticas de control.
- **Investigación en aprendizaje por imitación**: sirve como ejemplo de una política entrenada con datos reales, útil para comparar algoritmos de clonación de comportamiento.
- **Control de brazos de bajo coste**: al requerir solo una cámara y el estado del brazo, es adecuado para prototipos o robots educativos con hardware sencillo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo se entrenó con todos los episodios disponibles sin un conjunto de validación separado, por lo que no se puede proporcionar una métrica honesta de generalización. La pérdida de entrenamiento se puede consultar en el repositorio, pero no es un indicador de rendimiento en el mundo real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 millones de parámetros, en FP32 se necesitan aproximadamente 206 MB; en FP16, unos 103 MB. Esto es compatible con cualquier GPU moderna, incluso tarjetas de consumo de 4 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 3090, A100). También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (PyTorch), vLLM no es aplicable, pero se puede usar con TorchScript o ONNX para optimización. La librería LeRobot ofrece una API sencilla para cargar el modelo y ejecutar inferencia.
- Latencia y throughput: no se dispone de datos medidos. Dado el pequeño tamaño del modelo y el chunk de 20 acciones, se espera una latencia baja (menos de 10 ms por inferencia en GPU), pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa objetiva con otras políticas de control robótico sin datos adicionales.

## Limitaciones y advertencias

- **Entrenamiento sin validación**: el modelo no se evaluó con un conjunto de validación separado, por lo que no hay garantía de generalización a entornos o situaciones no vistas.
- **Dependencia de la configuración**: está entrenado para una cámara específica (posición y resolución) y un brazo concreto; cambios en estos parámetros degradarán el rendimiento.
- **Riesgo de alucinación**: al ser un modelo de control, puede generar acciones inapropiadas si la observación no coincide con las condiciones de entrenamiento.
- **Licencia no especificada**: no se indica la licencia de uso, lo que limita su uso comercial sin clarificación previa.
- **Dimensiones eliminadas**: el brazo derecho se excluye del espacio de acción, por lo que el modelo no puede controlar ese brazo, incluso si se necesita en la tarea.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/learner1119/posco_act_square_260822_left_c20)
- [Perfil del autor (doyoung kim)](https://huggingface.co/learner1119)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
