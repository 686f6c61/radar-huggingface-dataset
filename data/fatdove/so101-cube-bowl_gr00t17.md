# fatdove/so101-cube-bowl_GR00T17

## Resumen

El modelo `fatdove/so101-cube-bowl_GR00T17` es una política de robótica entrenada mediante aprendizaje por imitación con la librería LeRobot, basada en el modelo fundacional GR00T N1.7 de NVIDIA. Este modelo está diseñado para controlar un brazo robótico SO-101 (tipo `so_follower`) en una tarea concreta de manipulación: recoger un cubo azul y colocarlo en un plato. Se trata de un ejemplo de aplicación de modelos de visión-lenguaje-acción (VLA) a la robótica real, donde el sistema procesa imágenes de cámara frontal y de muñeca junto con el estado de las articulaciones para generar comandos de movimiento.

El modelo tiene 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 12,6 GB. Fue entrenado sobre un conjunto de datos de 50 episodios (29.881 fotogramas a 30 FPS) recopilados con el robot SO-101, y su licencia Apache 2.0 permite uso comercial y modificación. Aunque no se han publicado resultados de evaluación, su relevancia radica en demostrar el flujo completo de entrenamiento y despliegue de políticas robóticas con GR00T y LeRobot, una combinación cada vez más utilizada en la comunidad de robótica de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow-matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto largo) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el backbone Qwen3-VL soporta varios idiomas, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7, un modelo fundacional de NVIDIA para razonamiento y habilidades robóticas generalizadas. La arquitectura combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las cámaras y las instrucciones en lenguaje natural, con un transformer de acciones que utiliza flow-matching para predecir trayectorias de movimiento condicionadas a la observación visual, el lenguaje y la propiocepción (estado de las articulaciones). Esta combinación permite que el modelo aprenda políticas de control directamente de demostraciones humanas o teleoperadas.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset `fatdove/so101-cube-bowl`, que contiene 50 episodios de la tarea "coger el cubo azul y colocarlo en el plato". Se usaron 20.000 pasos de entrenamiento con un tamaño de lote de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001. Las observaciones incluyen el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara frontal y cámara de muñeca), mientras que la salida es un vector de acción de 6 dimensiones que controla las articulaciones del brazo. No se menciona el uso de RLHF o DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control de brazo robótico: genera comandos de articulación (6 grados de libertad) para ejecutar tareas de manipulación.
- Percepción visual: procesa dos flujos de imagen (frontal y muñeca) a 30 FPS para guiar la acción.
- Comprensión de instrucciones en lenguaje natural: el backbone Qwen3-VL permite interpretar comandos como "coge el cubo azul y ponlo en el plato".
- Aprendizaje por imitación: la política está entrenada para replicar las demostraciones del dataset, no para razonamiento general.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- Sin capacidades de tool calling ni agentes: es un modelo de control motor, no un asistente conversacional.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robótica para recoger objetos específicos (en este caso, un cubo azul) y depositarlos en una ubicación determinada (un plato). Es adecuado porque la política está entrenada exactamente para esta tarea y el robot SO-101 es de bajo coste, ideal para prototipado.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo se comporta un modelo GR00T N1.7 con un dataset pequeño (50 episodios) y qué ajustes son necesarios para mejorar la generalización.
- Base para fine-tuning en nuevas tareas: dado que el modelo ya ha aprendido representaciones visuales y de control, se puede reentrenar con un dataset más amplio para adaptarlo a otras manipulaciones (apilar bloques, insertar piezas, etc.) usando la infraestructura de LeRobot.
- Demostración de flujo completo sim-to-real: el modelo puede usarse en el taller de NVIDIA "Sim-to-Real SO-101" para validar el pipeline de entrenamiento en simulación y despliegue en el robot real.
- Evaluación de políticas en robótica educativa: en cursos o laboratorios que utilicen el SO-101, este modelo permite a los estudiantes ejecutar una tarea de manipulación sin necesidad de entrenar desde cero.
- Benchmarking de modelos VLA: al ser un modelo de tamaño medio (3,14B), puede compararse con otras políticas de LeRobot para medir el impacto del tamaño del modelo en tareas de manipulación real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 3,14 mil millones de parámetros en precisión FP32, el modelo ocuparía unos 12,6 GB solo en pesos; en FP16 serían ~6,3 GB. Para inferencia con LeRobot, se recomienda al menos 16 GB de VRAM para evitar swapping.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) sería suficiente para ejecutar el modelo sin cuantización. En GPUs con menos memoria (por ejemplo, RTX 3060 de 12 GB) podría ser necesario cuantizar o reducir la resolución de imagen.
- Compatibilidad con consumer GPU: sí, una RTX 3090 o 4090 puede ejecutar el modelo, aunque el rendimiento dependerá de la latencia de las cámaras y del bucle de control.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También se puede usar con vLLM o TGI si se adapta el modelo a un formato de servidor, pero no es el flujo estándar para robótica.
- Latencia y throughput: no se han publicado mediciones. En un robot SO-101 con cámaras USB, la latencia total dependerá de la captura de imágenes, la inferencia y el envío de comandos; se espera que sea inferior a 100 ms con una GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica basadas en GR00T con LeRobot). El modelo es específico para una tarea y un robot concretos, por lo que no hay alternativas directas en el repositorio de HuggingFace con las mismas características. Se podría comparar con otras políticas de LeRobot para tareas de pick-and-place, pero no se han encontrado datos suficientes.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo funciona para la tarea "coger el cubo azul y colocarlo en el plato" y con el robot SO-101. No generaliza a otros objetos, posiciones o robots sin reentrenamiento.
- Sin evaluación publicada: no hay métricas de éxito en el mundo real, por lo que se desconoce su fiabilidad en condiciones variables (iluminación, posición del cubo, etc.).
- Dataset pequeño: 50 episodios pueden no cubrir la variabilidad suficiente, lo que aumenta el riesgo de sobreajuste y fallos ante cambios en el entorno.
- Dependencia de cámaras específicas: las imágenes de entrada deben tener resolución 480x640 y las cámaras deben estar calibradas como en el entrenamiento; cambios en la posición o tipo de cámara degradarán el rendimiento.
- Riesgo de alucinación en acciones: al ser un modelo generativo, puede producir comandos de movimiento no seguros si las observaciones difieren mucho de las de entrenamiento. Se recomienda supervisión humana durante las primeras ejecuciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo incorpora componentes de NVIDIA (GR00T) que pueden tener términos adicionales; se debe revisar la documentación de NVIDIA para uso en productos comerciales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fatdove/so101-cube-bowl_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/fatdove/so101-cube-bowl
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Taller Sim-to-Real SO-101: https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop
