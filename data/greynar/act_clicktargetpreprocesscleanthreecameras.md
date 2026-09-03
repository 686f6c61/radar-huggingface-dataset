# Greynar/act_ClickTargetPreprocessCleanThreeCameras

## Resumen

El modelo `Greynar/act_ClickTargetPreprocessCleanThreeCameras` es una política de robótica basada en Action Chunking with Transformers (ACT), una arquitectura de aprendizaje por imitación presentada en el paper arXiv:2304.13705. Desarrollado por Greynar (Grégory Baltus) y entrenado con la librería LeRobot de Hugging Face, este modelo predice secuencias de acciones (chunks) a partir de observaciones visuales de tres cámaras, en lugar de predecir un único paso. Está diseñado para tareas de manipulación robótica teleoperadas, donde se busca imitar el comportamiento del operador con alta precisión.

El modelo cuenta con 51,7 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache-2.0, lo que permite su uso comercial y modificación sin restricciones significativas. Su tamaño reducido lo hace adecuado para experimentación en entornos con recursos limitados, aunque su rendimiento depende en gran medida de la calidad y cobertura del conjunto de datos de entrenamiento, que en este caso se denomina `Greynar/ClickTargetPreprocessCleanThreeCameras`. Aunque la model card es escueta y no proporciona detalles sobre el entrenamiento específico, la arquitectura subyacente es bien conocida y está documentada en la literatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador de imágenes (ResNet) y decodificador autoregresivo que predice chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica; el contexto es un historial de observaciones, sin especificar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura ACT se describe en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). Consiste en un codificador convolucional (típicamente ResNet) que procesa las imágenes de las cámaras, seguido de un transformador que genera una secuencia de acciones (un "chunk") de longitud fija mediante decodificación autoregresiva. En lugar de predecir acción a acción, el modelo predice un bloque completo de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El entrenamiento se realiza mediante aprendizaje por imitación a partir de demostraciones teleoperadas, y la política se optimiza con una pérdida de entropía cruzada sobre las acciones discretizadas (típicamente mediante el método de discretización de acción de ACT).

En este caso concreto, el modelo fue entrenado con LeRobot, la librería de robótica de Hugging Face, sobre el dataset `Greynar/ClickTargetPreprocessCleanThreeCameras`, que probablemente contiene demostraciones con tres cámaras distintas. No se especifican detalles como el número de tokens de entrenamiento, el tamaño del dataset o si se aplicaron técnicas adicionales como RLHF o DPO, ya que son irrelevantes para este tipo de modelo de imitación. La innovación principal de ACT es la predicción por chunks y el uso de un mecanismo de atención causal en el decodificador, que permite generar acciones coherentes a lo largo de un horizonte temporal.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones articulares o de efector final a partir de observaciones visuales.
- Manejo de múltiples cámaras: el modelo está entrenado con tres cámaras, lo que le permite integrar información visual de diferentes ángulos para una percepción más robusta.
- Generación de chunks de acciones: en lugar de un paso a la vez, genera bloques de acciones (típicamente de 10 a 100 pasos), mejorando la fluidez y reduciendo errores acumulativos.
- Ejecución en tiempo real: al ser un modelo pequeño (51,7 M de parámetros), puede ejecutarse en hardware modesto, incluso en tiempo real con una GPU de gama media.
- Integración con LeRobot: compatible con el ecosistema de LeRobot, lo que facilita su uso para entrenamiento, evaluación y despliegue en robots como SO-100 o Aloha.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo puede controlar un brazo robótico para tareas de agarre, colocación o apilamiento de objetos, imitando demostraciones humanas teleoperadas. Su capacidad de usar tres cámaras permite una percepción precisa de la posición y orientación de los objetos.
- Tareas de precisión en entornos controlados: por ejemplo, insertar una pieza en un hueco o atornillar, donde la predicción por chunks ayuda a mantener la coherencia del movimiento durante toda la secuencia.
- Automatización de procesos repetitivos en fábricas: si se dispone de demostraciones de un operario, el modelo puede replicar la tarea de forma autónoma, reduciendo la intervención humana en líneas de montaje simples.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos con ACT, ya que su tamaño reducido facilita el ajuste fino y la comparación con otras variantes.
- Teleoperación asistida: el modelo puede usarse como un "copiloto" que sugiere acciones durante la teleoperación, ayudando al operador a completar tareas con mayor suavidad.
- Evaluación de algoritmos de robótica en simulación: aunque el modelo se entrena con datos reales, puede transferirse a entornos simulados (por ejemplo, MuJoCo) para validar políticas antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. El rendimiento dependerá de la tarea específica y del dataset de evaluación utilizado. Para obtener una medida objetiva, sería necesario ejecutar evaluaciones en el entorno robótico correspondiente (por ejemplo, SO-100) y medir la tasa de éxito en episodios de prueba.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero dado el tamaño de 51,7 M de parámetros, la inferencia puede ejecutarse con menos de 1 GB de VRAM si se usa una cuantización de 8 bits. Sin cuantizar, en FP32 ocuparía unos 207 MB, y en FP16 unos 103 MB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti o superior). Para entrenamiento, se recomienda una GPU con 8 GB o más, como RTX 2070 o superior.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU moderna de consumo, incluso en CPUs con buen rendimiento si se usa cuantización.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación y grabación de episodios. Se puede ejecutar en Python con PyTorch. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos. Se espera una inferencia muy rápida (del orden de milisegundos) en GPU, dado el pequeño tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Greynar/act_ClickTargetPreprocessCleanThreeCameras | 51,7 M | ACT | Greynar/ClickTargetPreprocessCleanThreeCameras | Apache-2.0 | Hugging Face |
| Diffusion Policy (ejemplo genérico) | ~100 M | Diffusion sobre acciones | Varía según entrenamiento | MIT | Repos públicos |
| ACT original (T. Zhao et al.) | ~100 M (aprox.) | ACT | Diversos (Aloha) | MIT (paper) | Código en GitHub |

No se dispone de comparativas de rendimiento entre estos modelos, ya que no hay benchmarks públicos para este modelo concreto. La elección entre ACT y otras arquitecturas (como Diffusion Policy) depende de la tarea y de la calidad de los datos. ACT suele ser más estable en tareas de manipulación fina, mientras que Diffusion Policy puede ofrecer mayor diversidad en la generación de acciones.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo imita únicamente las demostraciones contenidas en el dataset de entrenamiento. Si estas son limitadas o contienen errores, el modelo los reproducirá.
- Riesgo de alucinación en acciones: en situaciones no vistas, el modelo puede generar acciones incoherentes o inseguras. Es necesario implementar mecanismos de seguridad (límites de posición, parada de emergencia) en entornos reales.
- Falta de generalización: el modelo está especializado en la tarea y el entorno para los que fue entrenado. Cambios en la iluminación, la posición de la cámara o la forma de los objetos pueden degradar su rendimiento.
- Dependencia de las tres cámaras: el modelo requiere las tres entradas visuales en el mismo orden y calibración que durante el entrenamiento. Una configuración diferente puede invalidar las predicciones.
- Sin capacidad de lenguaje: no procesa texto ni instrucciones, por lo que no es adecuado para tareas que requieran comprensión semántica.
- Documentación escasa: la model card no proporciona detalles sobre hiperparámetros, tamaño del dataset o métricas de entrenamiento, lo que dificulta la reproducibilidad y la evaluación rigurosa.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de atribuir correctamente la autoría.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Greynar/act_ClickTargetPreprocessCleanThreeCameras)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Greynar/ClickTargetPreprocessCleanThreeCameras)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
