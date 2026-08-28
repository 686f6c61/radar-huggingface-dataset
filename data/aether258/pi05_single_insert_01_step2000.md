# Aether258/pi05_single_insert_01_step2000

## Resumen

El modelo `pi05_single_insert_01_step2000` es un checkpoint de la familia `pi05_single` de openpi, entrenado específicamente para una tarea de inserción con un solo brazo robótico y entrada únicamente visual (una cámara). Fue desarrollado por el usuario Aether258 y publicado bajo licencia Apache-2.0. El modelo se basa en la arquitectura pi0 (Physical Intelligence), un modelo de visión-lenguaje-acción (VLA) preentrenado con más de 10 000 horas de datos robóticos, y se ha ajustado finamente con el dataset `KaiyueChen/insert_01` (500 episodios, 252 795 fotogramas). Este checkpoint concreto corresponde al paso 2000 de entrenamiento (1,13 épocas) y presenta la mejor pérdida de validación en el conjunto no visto (0,1063), aunque a partir de ese punto el modelo muestra signos claros de sobreajuste.

La relevancia de este modelo radica en que demuestra el ajuste fino de un VLA de última generación para una tarea de manipulación específica con una configuración de sensores reducida (una sola cámara, sin retroalimentación táctil), lo que permite evaluar el impacto de la reducción del espacio de observación en el rendimiento y la generalización. El repositorio incluye los pesos de inferencia, el estado del optimizador para reanudar el entrenamiento y las estadísticas de normalización calculadas sobre el split de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0 (VLA basado en transformer, con experto de acción y flujo de matching) |
| Parametros totales | no disponible (el tamaño del repo es 9,3 GB, pero no se indica el número exacto de parámetros) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (no se indica en la documentación) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones) |
| Idiomas soportados | inglés (etiqueta `en` en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (implícito por el uso de LeRobot y openpi; no se especifica explícitamente) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0 de Physical Intelligence, un modelo de visión-lenguaje-acción que combina un transformer multimodal con un experto de acción dedicado. En esta variante `pi05_single`, la configuración se simplifica respecto a los modelos `pi05_bi`: utiliza una sola cámara (`camera0`) como entrada visual, descartando la segunda cámara y los cuatro sensores táctiles disponibles en el dataset. La dimensión de estado/acción es de 7/10 (frente a las dimensiones bimanuales de los modelos `pi05_bi`). El entrenamiento se realizó con 2 GPUs A100-80GB usando FSDP, con un tamaño de lote de 128 y una tasa de aprendizaje constante de 2e-4 tras 1000 pasos de calentamiento. Se aplicó LoRA con rango 16 en el LLM y rango 32 en el experto de acción, mientras que la torre de visión se ajustó completamente (el filtro de congelación solo afecta a las capas `.*llm.*`). El entrenamiento total duró 6000 pasos (3,40 épocas) en 4 horas y 8 minutos, con un tiempo de 2,4 segundos por iteración.

Un aspecto destacable del proceso de preparación de datos es que se eliminó un fotograma por episodio (500 en total, 0,2% del dataset) porque el vector de acción del fotograma terminal contenía ceros que, tras la normalización por cuantiles, producían valores extremos (~-10 000) y degradaban la pérdida inicial de entrenamiento de 193 510 a 0,74. Las estadísticas de normalización (cuantiles q01/q99) se calcularon solo sobre el split de entrenamiento.

## Capacidades

- Ejecución de tareas de manipulación robótica de un solo brazo, específicamente inserción de objetos, a partir de observaciones visuales de una cámara.
- Generación de acciones de control continuo (10 dimensiones) mediante flujo de matching, condicionadas por el estado actual y la imagen observada.
- Ajuste fino sobre un dataset específico (insert_01) con 500 episodios y 252 295 fotogramas válidos, lo que permite especializar el modelo en una tarea concreta.
- Integración con el ecosistema LeRobot (librería `lerobot`), lo que facilita su uso en pipelines de robótica existentes.
- Soporte para reanudar el entrenamiento gracias a la inclusión del estado del optimizador en el checkpoint.
- Capacidad de inferencia con una sola cámara, lo que reduce los requisitos de sensores en despliegue real.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede controlar un brazo robótico para insertar componentes en ranuras o conectores, utilizando únicamente una cámara para la percepción. Su entrenamiento específico en la tarea de inserción lo hace adecuado para líneas de producción con geometrías conocidas.
- Robótica de laboratorio: en entornos de investigación donde se requiere repetir tareas de inserción con alta precisión (por ejemplo, montaje de placas de circuitos o manipulación de muestras), el modelo puede servir como política de control lista para usar.
- Evaluación de políticas VLA con sensores reducidos: este checkpoint permite estudiar cómo se degrada el rendimiento al eliminar la entrada táctil y la segunda cámara, sirviendo como referencia para decidir qué sensores son imprescindibles en una aplicación real.
- Prototipado rápido de tareas de manipulación: gracias a su integración con LeRobot, un desarrollador puede cargar el modelo y probarlo en un simulador o en un robot real con mínimas modificaciones de código.
- Benchmarking de generalización: el modelo incluye splits de validación vistos y no vistos, lo que permite medir la capacidad de generalización a nuevas configuraciones de la misma tarea.
- Formación y educación en robótica: al ser un modelo de código abierto con licencia Apache-2.0, puede utilizarse en cursos y talleres para enseñar ajuste fino de VLA y evaluación de políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de flujo de matching en los splits de validación, que se resume a continuación:

| Paso | Pérdida train | Pérdida val_seen | Pérdida val_unseen | Gap (val_unseen - train) |
|---:|---:|---:|---:|---:|
| 0 | 0,7447 | 0,7284 | 0,7377 | +0,0093 |
| 2000 | 0,0987 | 0,0860 | 0,1063 | +0,0203 |
| 4000 | 0,0881 | 0,0750 | 0,1164 | +0,0414 |
| 5999 | 0,0813 | 0,0673 | 0,1192 | +0,0519 |

El autor señala que la pérdida en val_unseen alcanza su mínimo en el paso 2000 y empeora después, mientras que val_seen mejora monótonamente, lo que indica un claro sobreajuste a partir de ese punto. No se proporcionan métricas de éxito de tarea (tasa de inserción correcta) ni comparaciones con otros modelos.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPUs A100-80GB usando FSDP, con un tamaño de lote de 128. Para reproducir el entrenamiento se necesitaría hardware similar.
- Para inferencia, no se especifican requisitos de VRAM. Dado que el repositorio ocupa 9,3 GB (incluyendo pesos y estado del optimizador), se estima que los pesos de inferencia en precisión fp32 o bf16 podrían ocupar entre 2 y 4 GB, lo que permitiría ejecutarlo en GPUs de consumo como una RTX 3060 o superior, aunque no hay confirmación oficial.
- El modelo está diseñado para usarse con la librería LeRobot, que soporta despliegue en robots reales y simuladores. No se mencionan opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput no están documentados; dependerán del hardware y de la implementación de inferencia utilizada.

## Comparativa con modelos similares

El propio autor compara este modelo con sus variantes `pi05_bi` (dos tubos, task2, bread) en términos de configuración y pérdida de validación, aunque advierte que las pérdidas no son directamente comparables debido a diferencias en dimensiones de estado/acción, número de flujos de imagen y programación de la tasa de aprendizaje. La siguiente tabla resume las diferencias clave:

| Modelo | Entradas | Dimensión estado/acción | LR schedule | Mejor val_unseen (paso) | Gap final |
|---|---|---|---|---|---|
| `pi05_single` (este) | 1 cámara | 7/10 | constante 2e-4 | 0,1063 (paso 2000) | +0,0519 |
| `pi05_bi` two_tubes | 6 flujos (2 RGB + 4 táctiles) | bimanual | coseno 2.5e-5 -> 2.5e-6 | ~0,0220 (paso ~2,5 épocas) | +0,0220 |
| `pi05_bi` task2 | 6 flujos | bimanual | coseno | ~0,0041 (paso ~2 épocas) | +0,0041 |
| `pi05_bi` bread | 6 flujos | bimanual | coseno | ~-0,0037 (paso ~2,4 épocas) | -0,0037 |

No se dispone de comparaciones con otros modelos VLA de la literatura (por ejemplo, OpenVLA, RT-2) en la información proporcionada.

## Limitaciones y advertencias

- Sobreajuste evidente: la pérdida en el split no visto empeora a partir del paso 2000, mientras que la pérdida en el split visto sigue mejorando. Esto indica que el modelo memoriza las trayectorias de entrenamiento en lugar de aprender una política generalizable, probablemente debido a la reducción del espacio de observación (una sola cámara, sin táctil).
- Sin retroalimentación táctil: la tarea de inserción es sensible al contacto, y la ausencia de sensores táctiles puede limitar el rendimiento en escenarios donde se requiere ajuste fino por fuerza.
- Dependencia de una única cámara: el modelo ignora la segunda cámara y los cuatro sensores táctiles del dataset, lo que reduce su robustez ante oclusiones o cambios de iluminación.
- Datos de validación limitados: la evaluación se realiza sobre 20 lotes fijos por split, lo que puede no reflejar la variabilidad completa del dataset.
- Sin métricas de éxito de tarea: no se reportan tasas de éxito en la inserción, solo pérdida de flujo de matching, que es una métrica indirecta.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y no se especifican restricciones adicionales.
- El checkpoint es un punto intermedio del entrenamiento (paso 2000 de 6000); el autor recomienda este paso como el mejor, pero el modelo no ha sido validado en un robot real en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aether258/pi05_single_insert_01_step2000
- Modelos relacionados del mismo autor: https://huggingface.co/Aether258/pi05_bi_bread_all_step8000 y https://huggingface.co/Aether258/pi05_bi_bread_all3_step8000
- OpenPI (librería de modelos VLA de Physical Intelligence): https://www.openpi.net/english.html
- Paper de Aether (no directamente relacionado, pero del mismo autor): https://arxiv.org/html/2503.18945v1
