# alphabot2/19_Aug_Niranjan_Pick_ACT

## Resumen

El modelo `alphabot2/19_Aug_Niranjan_Pick_ACT` es una política de aprendizaje por imitación basada en la arquitectura Action Chunking with Transformers (ACT), entrenada para controlar un robot en una tarea de recogida de objetos (pick). Ha sido desarrollado y publicado por el usuario alphabot2 utilizando el framework LeRobot de Hugging Face, una librería open source especializada en robótica y aprendizaje por imitación.

El modelo resuelve el problema de generar secuencias de acciones motoras a partir de observaciones visuales y de estado, aprendiendo de demostraciones teleoperadas. ACT predice "chunks" de acciones (secuencias de varios pasos) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación frente a métodos que predicen paso a paso. Con 51,6 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware de consumo.

La relevancia de este modelo radica en que forma parte del ecosistema LeRobot, que democratiza el acceso a la robótica basada en aprendizaje. Al estar publicado con licencia Apache 2.0, cualquier desarrollador puede descargarlo, evaluarlo y adaptarlo a sus propios robots, lo que lo convierte en un recurso valioso para la comunidad de robótica open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.637.904 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión completa) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir secuencias de acciones futuras, denominadas "action chunks". A diferencia de los métodos que predicen una única acción por paso de tiempo, ACT genera un bloque de acciones que el robot ejecuta de forma consecutiva, lo que reduce la acumulación de errores y mejora la consistencia del movimiento. La arquitectura fue propuesta en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `alphabot2/19_Aug_Niranjan_Pick`, que contiene demostraciones teleoperadas de la tarea de recogida. El modelo fue entrenado con el robot SO-100 (un brazo robótico de bajo coste) y sigue la configuración estándar de ACT implementada en LeRobot. No se dispone de información detallada sobre el número de tokens de entrenamiento, composición exacta del dataset o uso de técnicas como RLHF, ya que no se ha publicado en la model card. La política se entrena mediante comportamiento clonado (behavior cloning) sobre las demostraciones.

## Capacidades

- Control de robot para tareas de manipulación: el modelo genera secuencias de acciones motoras (posición de articulaciones) que permiten al robot ejecutar la tarea de recogida de objetos.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de programación explícita de la tarea.
- Predicción por chunks de acciones: genera bloques de acciones futuras (por defecto en ACT, típicamente 10-100 pasos) que el robot ejecuta de forma continua, mejorando la fluidez del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo los robots SO-100 y Koch.
- Inferencia en tiempo real: al ser un modelo de solo 51,6M de parámetros, puede ejecutarse en tiempo real en una GPU de consumo o incluso en CPU para tareas simples.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de investigación: el modelo puede integrarse en un setup con brazo robótico SO-100 para recoger objetos de una posición fija y depositarlos en otra, sirviendo como base para experimentos de manipulación.
- Prototipado rápido de políticas robóticas: los investigadores pueden usar este modelo como punto de partida para fine-tuning en nuevas tareas, reduciendo el tiempo de entrenamiento desde cero.
- Educación en robótica: el modelo puede utilizarse en cursos de robótica o aprendizaje automático para demostrar conceptos de aprendizaje por imitación, transformers aplicados a control y pipelines de entrenamiento con LeRobot.
- Evaluación de algoritmos de imitación: al ser un modelo de referencia entrenado con ACT, puede compararse contra otras arquitecturas (Diffusion Policy, etc.) en el mismo dataset para evaluar rendimiento relativo.
- Despliegue en robots de bajo coste: gracias a su tamaño reducido y a que está entrenado para el robot SO-100, puede ejecutarse en configuraciones hardware de bajo presupuesto, típicas en laboratorios académicos.
- Generación de datos para simulación: el modelo puede usarse para generar trayectorias de referencia que alimenten simuladores o para aumentar datasets de entrenamiento mediante ejecución en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparativas con otros modelos. Se desconoce el rendimiento cuantitativo del modelo en la tarea de recogida.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6M de parámetros en FP32, el modelo ocupa aproximadamente 206 MB de memoria. En FP16, unos 103 MB. Puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, o incluso en CPU para inferencia a baja frecuencia.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (GTX 1060 o superior, RTX series, etc.). Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumo actual, incluidas las integradas en portátiles con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia (`lerobot-record`, `lerobot-eval`). También puede exportarse a ONNX para despliegue en otros entornos.
- Latencia y throughput: no se dispone de datos publicados. Con un modelo de este tamaño, la inferencia en GPU debería ser del orden de milisegundos por chunk de acciones, permitiendo control en tiempo real.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. ACT es una arquitectura específica para robótica, y aunque existen alternativas como Diffusion Policy o RT-1, no hay datos públicos que permitan una comparación cuantitativa con este modelo concreto. El modelo es específico para la tarea de recogida con el robot SO-100, por lo que la comparación con otros modelos dependería del dataset y la tarea.

## Limitaciones y advertencias

- Sesgos y generalización: el modelo ha sido entrenado para una tarea específica (recogida de objetos) en un entorno concreto. No generalizará a otras tareas, objetos o configuraciones del robot sin fine-tuning.
- Dependencia del dataset: el rendimiento depende directamente de la calidad y variedad de las demostraciones del dataset `alphabot2/19_Aug_Niranjan_Pick`. Si las demostraciones son limitadas, el modelo puede fallar en situaciones no vistas.
- Riesgo de alucinación motora: como todo modelo de imitación, puede generar acciones erróneas o inseguras si se enfrenta a estados fuera de la distribución de entrenamiento. Es necesario implementar supervisión de seguridad en entornos reales.
- Sin capacidad de razonamiento ni lenguaje: es un modelo puramente motor, no tiene capacidades de lenguaje, visión semántica ni planificación de alto nivel.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe asegurarse de cumplir los términos de la licencia, incluyendo la atribución correspondiente.
- Sin información sobre cuantización: no se proporcionan versiones cuantizadas, por lo que el despliegue en hardware muy limitado puede requerir conversión manual a formatos como ONNX o TensorRT.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alphabot2/19_Aug_Niranjan_Pick_ACT)
- [Dataset de entrenamiento](https://huggingface.co/datasets/alphabot2/19_Aug_Niranjan_Pick)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Framework LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
