# NickKuijpers/act_test0_v8

## Resumen

El modelo `act_test0_v8` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por Nick Kuijpers utilizando la librería LeRobot de Hugging Face y está diseñado para controlar un robot manipulador SO-100, concretamente para la tarea de agarrar una cubierta negra. Este modelo representa un caso práctico de entrenamiento de políticas robóticas con datos teleoperados, y su relevancia radica en demostrar el flujo completo de LeRobot para entrenar y desplegar políticas de control en robótica real. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que procesa imágenes de dos cámaras y el estado del robot para generar comandos de acción de seis dimensiones.

El modelo se distribuye bajo licencia Apache-2.0 y los pesos se almacenan en formato safetensors. No se trata de un modelo de lenguaje ni de visión general, sino de una política específica para un robot concreto y una tarea muy acotada. La model card no incluye resultados de evaluación en robot real, por lo que su rendimiento efectivo no ha sido verificado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice un fragmento de acciones (action chunk) de longitud fija, en lugar de una única acción por paso. La arquitectura combina un codificador de visión (para procesar las imágenes de las cámaras) con un transformer que genera secuencias de acciones condicionadas al estado observado y a la tarea. En este modelo concreto, las observaciones incluyen el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara frontal y cámara de la pinza). La salida es un vector de acción de 6 dimensiones, típicamente correspondiente a la posición del efector final y la apertura de la pinza.

El entrenamiento se realizó con el dataset `NickKuijpers/test0`, que contiene 5 episodios teleoperados (2228 frames en total) grabados a 15 FPS para la tarea "Grab the black cover". Se ejecutaron 5000 pasos de entrenamiento con un batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5, con semilla fija 1000. La versión de LeRobot utilizada fue la 0.6.1. No se menciona el uso de técnicas de refuerzo ni de ajuste fino adicional; el entrenamiento es puramente de imitación supervisada.

## Capacidades

- Control robótico de precisión: genera acciones de 6 dimensiones para el robot SO-100, incluyendo el movimiento del brazo y la apertura/cierre de la pinza.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (frontal y de pinza) junto con el estado propioceptivo del robot.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de programación explícita de la tarea.
- Ejecución de tareas específicas: está entrenado para la tarea concreta de agarrar una cubierta negra, aunque la arquitectura ACT permite generalizar a otras tareas si se reentrena con datos adecuados.
- Compatibilidad con LeRobot: se integra nativamente con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de lenguaje natural, generación de texto, razonamiento simbólico ni tool calling, ya que es exclusivamente un modelo de control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede ejecutar la tarea de agarrar un objeto específico (la cubierta negra) de forma repetitiva, lo que resulta útil en entornos de investigación donde se necesita una manipulación consistente.
- Benchmarking de algoritmos de imitación: al ser un modelo entrenado con LeRobot, sirve como referencia para comparar el rendimiento de ACT frente a otros métodos de aprendizaje por imitación en el mismo robot y tarea.
- Prototipado rápido de políticas robóticas: los desarrolladores pueden utilizar este modelo como punto de partida para entrenar nuevas políticas con datasets propios, aprovechando la configuración de entrenamiento documentada.
- Validación de pipelines de entrenamiento de LeRobot: el modelo y su dataset asociado permiten verificar que la instalación y configuración de LeRobot funcionan correctamente antes de abordar tareas más complejas.
- Investigación en generalización de políticas: dado el pequeño tamaño del dataset (5 episodios), el modelo puede utilizarse para estudiar cómo afecta la cantidad de datos al rendimiento en tareas de manipulación.
- Demostraciones educativas de robótica con aprendizaje automático: por su tamaño reducido y licencia permisiva, es adecuado para cursos y talleres donde se enseñan conceptos de aprendizaje por imitación en robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no es posible comparar cuantitativamente el rendimiento de este modelo con otros.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~51,7 millones de parámetros. En precisión fp32 los pesos ocupan aproximadamente 207 MB, y en fp16 unos 103 MB. Considerando las activaciones y las imágenes de entrada (dos de 480x640), se estima un consumo total de VRAM inferior a 1 GB, por lo que cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 2 GB de VRAM (p. ej., GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090). También es posible ejecutar la inferencia en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, es totalmente factible en GPUs de gama baja y media. No requiere hardware de nivel centro de datos.
- Opciones de despliegue: el modelo se despliega mediante las herramientas de LeRobot, concretamente con el comando `lerobot-rollout`. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos oficiales. Dado el tamaño del modelo y la resolución de las imágenes, se espera una latencia de inferencia en el orden de decenas de milisegundos en una GPU moderna, suficiente para control en tiempo real a 15-30 FPS, aunque esto no ha sido verificado por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas ACT entrenadas con LeRobot) con datos públicos de rendimiento. La model card no proporciona comparativas. Se puede mencionar que el modelo ACT original (publicado en el paper arXiv:2304.13705) es la base, pero no hay métricas de este modelo concreto frente a otras implementaciones. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 5 episodios (2228 frames), lo que limita severamente la generalización a variaciones de posición, iluminación o presencia de objetos distractores.
- Tarea específica y no transferible: el modelo está entrenado únicamente para la tarea "Grab the black cover" y no funcionará para otras tareas sin reentrenamiento.
- Sin evaluación verificada: no hay resultados de éxito en robot real, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste: con tan pocas demostraciones, es probable que la política memorice las trayectorias y falle ante cambios en el entorno.
- Dependencia del hardware: el modelo asume el robot SO-100 y las cámaras específicas (frontal y pinza) con las que se entrenó; usarlo con otro hardware requiere adaptación.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías de funcionamiento ni soporte.
- No es un modelo de propósito general: no debe confundirse con modelos de lenguaje o visión; su único propósito es el control motor de un robot concreto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/NickKuijpers/act_test0_v8
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (librería): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/NickKuijpers/test0
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
