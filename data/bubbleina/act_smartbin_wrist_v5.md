# Bubbleina/act_smartbin_wrist_v5

## Resumen

El modelo `Bubbleina/act_smartbin_wrist_v5` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el autor Bubbleina y publicada en Hugging Face bajo licencia Apache-2.0. Está entrenado con la librería LeRobot de HuggingFace y utiliza el dataset `Bubbleina/act_smartbin_wrist_v1`, orientado a la manipulación de un brazo robótico para la clasificación automática de residuos (smart bin). El modelo predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite ejecutar movimientos suaves y coordinados a partir de datos teleoperados.

Con 51,7 millones de parámetros y un peso de solo 0,2 GB en formato safetensors, se trata de un modelo ligero diseñado para ser desplegado en hardware de bajo coste. Su relevancia actual radica en la creciente demanda de soluciones robóticas accesibles para automatización de tareas de manipulación, especialmente en el ámbito de la sostenibilidad y el reciclaje inteligente. Al ser entrenado con técnicas de imitación learning, no requiere programación explícita de movimientos, sino que aprende de demostraciones humanas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el método ACT, propuesto en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). ACT es una técnica de aprendizaje por imitación que utiliza un transformador para predecir una secuencia de acciones futuras (action chunk) a partir de la observación actual y de una variable de estilo o latente. Esta arquitectura permite generar movimientos coherentes y de baja frecuencia de error, especialmente adecuados para tareas de manipulación fina como la recogida y clasificación de objetos.

El entrenamiento se realizó con LeRobot, la librería de HuggingFace para robótica, sobre el dataset `Bubbleina/act_smartbin_wrist_v1`. No se han publicado detalles sobre el número de tokens, composición exacta del dataset o si se aplicaron técnicas de RLHF o DPO, ya que al ser un modelo de control robótico no utiliza procesamiento de lenguaje. Los pesos se almacenan en formato safetensors, y el entrenamiento puede reproducirse con los comandos proporcionados en la model card (por ejemplo, `lerobot-train`).

## Capacidades

- Control robótico de un brazo manipulador (tarea de muñeca para smart bin) mediante predicción de secuencias de acciones.
- Aprendizaje por imitación: reproduce movimientos teleoperados sin necesidad de programar trayectorias explícitas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de HuggingFace para robótica.
- Inferencia en tiempo real: al predecir chunks de acciones, reduce la frecuencia de decisión y permite ejecución suave.
- Soporte para hardware de bajo coste: diseñado para funcionar en robots tipo SO-100 u otros brazos de bajo presupuesto.
- No soporta tareas de lenguaje natural, visión general ni tool calling: es exclusivamente una política de control motor.

## Casos de uso

- **Clasificación automática de residuos**: el modelo puede controlar un brazo robótico que recoge objetos de una cinta y los deposita en contenedores de plástico, vidrio, metal o papel, basándose en la clasificación previa realizada por un sistema de visión (por ejemplo, YOLO).
- **Automatización de celdas de reciclaje**: en plantas de tratamiento de residuos, el modelo puede ejecutar tareas repetitivas de recogida y deposición, reduciendo la intervención humana.
- **Investigación en imitación learning**: sirve como punto de partida para probar variantes de ACT en entornos de manipulación de bajo coste.
- **Prototipos de robótica educativa**: permite a estudiantes y desarrolladores montar un brazo robótico que aprende tareas mediante demostración física, sin necesidad de escribir código de control.
- **Pruebas de integración con LeRobot**: como modelo de referencia para evaluar el flujo de entrenamiento y evaluación de políticas robóticas en la librería.
- **Despliegue en entornos de bajo consumo**: al ser ligero (51 M de parámetros), puede ejecutarse en placas tipo Raspberry Pi con acelerador de IA o en GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasa de error o comparativas con otros modelos. Para evaluar el rendimiento, se recomienda ejecutar el proceso de evaluación proporcionado por LeRobot (`lerobot-record` con `--policy.path`) sobre un conjunto de episodios de prueba.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 51,7 M de parámetros, los pesos en FP32 ocupan aproximadamente 207 MB. Con cuantización a int8 o FP16, el consumo sería aún menor. Se estima que puede ejecutarse en una GPU con al menos 1 GB de VRAM, aunque no se proporcionan datos oficiales.
- **GPU recomendada**: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1650, RTX 3060, A100) es suficiente. También puede funcionar en CPU para inferencia lenta.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: LeRobot permite cargar el modelo directamente con `--policy.path`. Puede usarse con `lerobot-record` para inferencia en el robot, o exportarse a otros formatos (por ejemplo, ONNX) si se necesita.
- **Latencia y throughput**: no disponible. Al ser un modelo pequeño, se espera una latencia de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay datos de comparativas con otros modelos en la información proporcionada. Existen otras políticas ACT entrenadas con LeRobot en HuggingFace (por ejemplo, `lerobot/act_*`), pero no se dispone de métricas de rendimiento para comparar directamente. En términos de parámetros, este modelo es significativamente más pequeño que los típicos modelos de lenguaje, pero no es comparable en tareas de NLP; la comparación debería hacerse con otros modelos de control robótico de la misma familia ACT.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un modelo de control robótico, no presenta alucinación textual, pero puede ejecutar movimientos incorrectos si los datos de entrenamiento contienen errores o ambigüedades en las demostraciones.
- **Dependencia de la teleoperación**: la calidad del comportamiento depende directamente de la calidad de las demostraciones; movimientos mal ejecutados se aprenderán como patrones.
- **Generalización limitada**: no se ha probado en tareas fuera del dominio de smart bin; no debe usarse para otras tareas de manipulación sin reentrenamiento.
- **Idioma y contexto**: no aplica, ya que no procesa lenguaje.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías de soporte.
- **Reproducibilidad**: el dataset `Bubbleina/act_smartbin_wrist_v1` está disponible, pero no se especifica el número de episodios ni la variabilidad de los datos, lo que puede afectar la replicabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bubbleina/act_smartbin_wrist_v5
- Dataset utilizado: https://huggingface.co/datasets/Bubbleina/act_smartbin_wrist_v1
- Paper de ACT: https://arxiv.org/abs/2304.13705
- LeRobot (librería de entrenamiento): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Noticia sobre act_smartbin_v5 (dataset): https://www.5radar.com/dataopensource/news/457012/bubbleina%E5%8F%91%E5%B8%83act-smartbin-v5%E6%9C%BA%E5%99%A8%E4%BA%BA%E4%B8%93%E7%94%A8%E6%95%B0%E6%8D%AE%E9%9B%86-%E7%A0%B4%E8%A7%A3%E6%93%8D%E4%BD%9C%E6%8E%A7%E5%88%B6%E4%B8%8E%E6%A8%A1%E4%BB%BF%E5%AD%A6%E4%B9%A0%E8%AE%AD%E7%BB%83%E6%95%B0%E6%8D%AE%E7%97%9B%E7%82%B9

Nota: los repos de GitHub encontrados (`AbdelhediMed05/Smartbin-AI` y `Shrushti7823/SmartBin-AI`) no están directamente relacionados con este modelo, sino con sistemas de clasificación de residuos basados en visión y sensores.</think>## Resumen

`Bubbleina/act_smartbin_wrist_v5` es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por Bubbleina y entrenada con la librería LeRobot de HuggingFace. El modelo se especializa en la manipulación de un brazo robótico tipo muñeca para la clasificación automática de residuos en un contenedor inteligente (smart bin), a partir de demostraciones teleoperadas. Con 51,7 millones de parámetros y un peso de 0,2 GB en formato safetensors, es un modelo ligero pensado para hardware de bajo coste y despliegue en entornos de robótica de investigación o prototipado.

La relevancia de este modelo radica en su enfoque práctico: en lugar de programar trayectorias explícitas, aprende a imitar movimientos humanos mediante aprendizaje por imitación, lo que reduce la barrera técnica para automatizar tareas de reciclaje y manipulación. Al estar publicado bajo licencia Apache-2.0 y ser compatible con el ecosistema LeRobot, se convierte en un recurso accesible para desarrolladores e investigadores que quieran experimentar con políticas robóticas de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa el método ACT (Action Chunking with Transformers), descrito en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). En lugar de predecir una única acción por paso, ACT utiliza un transformador para generar un bloque (chunk) de acciones futuras a partir de la observación actual y una variable de estilo o latencia. Este diseño reduce la acumulación de errores y produce movimientos más suaves y precisos, especialmente adecuados para tareas de manipulación fina como recoger objetos y depositarlos en contenedores.

El entrenamiento se ha realizado con LeRobot sobre el dataset `Bubbleina/act_smartbin_wrist_v1`, que contiene demostraciones teleoperadas de la tarea de clasificación de residuos. No se han publicado datos concretos sobre el número de episodios, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO, ya que se trata de un modelo de aprendizaje por imitación, no de lenguaje. El proceso de entrenamiento y evaluación puede reproducirse con los comandos estándar de LeRobot (`lerobot-train` y `lerobot-record`), tal y como se documenta en la model card.

## Capacidades

- Control robótico de brazo para tareas de clasificación de residuos (smart bin).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de programar trayectorias.
- Predicción de secuencias de acciones (action chunks) para movimientos suaves y coherentes.
- Integración completa con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante comandos CLI.
- Compatible con robots de bajo coste tipo SO100 follower, tal y como se indica en los ejemplos de la model card.
- No incluye capacidades de lenguaje natural, visión, tool calling, ni razonamiento simbólico: es exclusivamente un modelo de control motor.

## Casos de uso

- **Clasificación automática de residuos**: el modelo controla el brazo robótico para recoger objetos de una cinta y depositarlos en el contenedor correcto (plástico, vidrio, metal, papel), basándose en la clasificación previa realizada por un sistema de visión externo.
- **Automatización de celdas de reciclaje**: en plantas de residuos de pequeña escala, puede sustituir la recogida manual repetitiva, reduciendo la fatiga del trabajador y mejorando la consistencia.
- **Prototipado de robótica educativa**: permite a estudiantes y makers experimentar con aprendizaje por imitación en un brazo de bajo coste, sin requerir conocimientos avanzados de control.
- **Investigación en imitación learning**: sirve como punto de partida para comparar variantes de ACT o evaluar técnicas de chunking en tareas de manipulación.
- **Validación de pipelines de LeRobot**: al ser un modelo completo y funcional, puede usarse como referencia para probar flujos de entrenamiento, evaluación y despliegue en la librería.
- **Automatización de tareas de pick-and-place en entornos pequeños**: por ejemplo, en laboratorios o talleres que necesiten mover objetos entre posiciones fijas con un brazo robótico de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasa de error, ni comparativas con otros modelos. Para evaluar el rendimiento, se recomienda ejecutar el proceso de evaluación que proporciona LeRobot (`lerobot-record` con `--policy.path`) sobre un conjunto de episodios de prueba y medir la tasa de éxito en la tarea de clasificación.

## Requisitos de hardware

- **VRAM estimada**: con 51,7 millones de parámetros, los pesos en FP32 ocupan aproximadamente 207 MB. En FP16 o int8, el consumo es menor (unos 104 MB o 52 MB respectivamente). Se puede ejecutar en una GPU con al menos 1 GB de VRAM, aunque no hay datos oficiales de consumo.
- **GPU recomendadas**: cualquier GPU con soporte CUDA (por ejemplo, NVIDIA GTX 1650, RTX 3060, A100) es suficiente. También puede funcionar en CPU para inferencia lenta, pero la latencia será mayor.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU de consumo actual sin problemas.
- **Opciones de despliegue**: el modelo se carga directamente con LeRobot (`--policy.path`), y puede usarse con `lerobot-record` para inferencia en el robot. No se menciona compatibilidad con vLLM, llama.cpp u otros entornos de inferencia de lenguaje, ya que no es un modelo de texto.
- **Latencia y throughput**: no disponible. Al ser un modelo pequeño, se espera una latencia en el orden de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. Existen otras políticas ACT en HuggingFace entrenadas con LeRobot (por ejemplo, `lerobot/act_*`), pero no se han publicado especificaciones o resultados que permitan una comparación directa. En términos de parámetros, este modelo es significativamente más pequeño que los modelos de lenguaje, pero la comparación relevante sería con otras políticas de control robótico de la misma familia, para las que no se dispone de datos.

## Limitaciones y advertencias

- **Sesgo en los datos de entrenamiento**: el comportamiento del modelo depende de la calidad de las demostraciones; si las teleoperaciones contienen errores o movimientos inconsistentes, el modelo los aprenderá.
- **Riesgo de generalización**: no está probado fuera del dominio de smart bin; usarlo en otras tareas de manipulación sin reentrenamiento probablemente dé resultados pobres.
- **Ausencia de métricas**: no hay datos de éxito, robustez o tiempos de ejecución, lo que dificulta la evaluación objetiva del rendimiento.
- **Dependencia del ecosistema LeRobot**: para entrenar o evaluar el modelo, es necesario usar LeRobot, lo que limita su uso en otros frameworks.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- **No es un modelo de lenguaje**: no procesa texto, no tiene capacidades de conversación, y no se le puede aplicar herramientas de NLP.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Bubbleina/act_smartbin_wrist_v5)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Bubbleina/act_smartbin_wrist_v1)
- [Paper de ACT (arXiv:2304.13705)](https://arxiv.org/abs/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Noticia sobre el dataset act_smartbin_v5](https://www.5radar.com/dataopensource/news/457012/bubbleina%E5%8F%91%E5%B8%83act-smartbin-v5%E6%9C%BA%E5%99%A8%E4%BA%BA%E4%B8%93%E7%94%A8%E6%95%B0%E6%8D%AE%E9%9B%86-%E7%A0%B4%E8%A7%A3%E6%93%8D%E4%BD%9C%E6%8E%A7%E5%88%B6%E4%B8%8E%E6%A8%A1%E4%BB%BF%E5%AD%A6%E4%B9%A0%E8%AE%AD%E7%BB%83%E6%95%B0%E6%8D%AE%E7%97%9B%E7%82%B9)
