# alphabot2/14_Merged_RGB_ocr_ACT

## Resumen

El modelo `alphabot2/14_Merged_RGB_ocr_ACT` es una política de control robótico basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. El modelo ha sido entrenado sobre el dataset `alphabot2/14_Merged_RGB_ocr`, que contiene 54.6k filas de datos de teleoperación con modalidades de imagen RGB y series temporales, en formato parquet.

Con 51.6 millones de parámetros, es un modelo compacto diseñado para ejecutarse en sistemas robóticos embebidos o con recursos limitados. Su relevancia radica en que demuestra cómo los métodos de imitación con transformers pueden aplicarse a tareas de manipulación reales, y su licencia Apache 2.0 permite uso comercial sin restricciones. No se trata de un modelo de lenguaje, sino de una política de control que mapea observaciones visuales a comandos de articulación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.637.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de acción, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer encoder-decoder introducida en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). El encoder procesa observaciones visuales (imágenes RGB) y el decoder genera una secuencia de acciones futuras (chunk) de longitud fija, típicamente entre 8 y 64 pasos. Esto reduce el error de acumulación en comparación con políticas que predicen una sola acción por paso.

El modelo fue entrenado con LeRobot sobre el dataset `alphabot2/14_Merged_RGB_ocr`, que contiene demostraciones teleoperadas. No se dispone de información detallada sobre el número de épocas, el tamaño del batch, ni si se aplicaron técnicas de aumento de datos o regularización adicional. El dataset incluye imágenes RGB y series temporales de estados y acciones del robot, aunque no se especifica el tipo de robot utilizado (posiblemente un brazo SO-100 u otro compatible con LeRobot).

## Capacidades

- Control robótico por aprendizaje por imitación: predice secuencias de acciones de articulaciones a partir de observaciones visuales.
- Manejo de tareas de manipulación con visión RGB: el modelo procesa imágenes para decidir las acciones.
- Generación de chunks de acción: permite movimientos suaves y coordinados, reduciendo la acumulación de errores frente a políticas de un solo paso.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot (comandos `lerobot-train`, `lerobot-record`, etc.).
- No soporta tool calling, agentes ni capacidades de lenguaje: es un modelo puramente motor, sin interfaz de texto.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico para tareas como recoger y colocar objetos, utilizando demostraciones previas como guía. Su tamaño compacto permite ejecutarlo en una GPU modesta o incluso en CPU para pruebas.
- Automatización de tareas repetitivas en entornos controlados: una vez entrenado con demostraciones, puede replicar trayectorias de movimiento con alta repetibilidad, útil en líneas de montaje o estaciones de trabajo con configuraciones fijas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos con ACT, comparando variantes de arquitectura, datos o hiperparámetros en el framework LeRobot.
- Prototipado rápido de políticas robóticas: gracias a la integración con LeRobot, se puede entrenar y evaluar en pocos pasos, ideal para validar nuevas tareas o datasets antes de escalar a modelos más grandes.
- Control de robots educativos: el modelo puede desplegarse en plataformas como SO-100 o similares para fines docentes, demostrando conceptos de aprendizaje por refuerzo e imitación.
- Teleoperación asistida: combinado con un sistema de control humano, puede sugerir o completar acciones parciales, mejorando la eficiencia en tareas de teleoperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval u otras métricas, ya que no es un modelo de lenguaje. Para tareas robóticas, no se proporcionan tasas de éxito en entornos estándar como simulación o tareas reales.

## Requisitos de hardware

- VRAM estimada: con 51.6M parámetros, el modelo en FP32 ocupa aproximadamente 206 MB; en FP16, unos 103 MB. Esto permite inferencia en GPUs con 2 GB de VRAM o incluso en CPU, aunque con mayor latencia.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). Para entrenamiento, se recomienda al menos 8 GB de VRAM (RTX 3070, A100, etc.).
- Compatible con consumer GPU: sí, cabe en GPUs de gama media e incluso en integradas para inferencia simple.
- Opciones de despliegue: LeRobot ofrece scripts para evaluación y registro. También puede exportarse a ONNX o TensorRT para optimización, aunque no se documenta en el repo.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia de pocos milisegundos por predicción en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio o en la documentación. Existen otros modelos ACT entrenados con LeRobot en el Hub de Hugging Face, pero no se han encontrado referencias específicas a este dataset o configuración. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dependencia de la calidad de las demostraciones: el rendimiento está limitado por la diversidad y corrección de los datos de teleoperación. Si las demostraciones son poco variadas o contienen errores, la política aprenderá comportamientos subóptimos.
- Generalización limitada: al ser un modelo de imitación, no generaliza bien a entornos, objetos o configuraciones no vistas durante el entrenamiento. Cambios en la iluminación, posición de cámara o fondo pueden degradar el rendimiento.
- Sin capacidades de razonamiento o lenguaje: no puede interpretar instrucciones textuales ni adaptarse a tareas no previstas.
- Riesgo de sobreajuste al dataset: con 54.6k filas, el modelo podría memorizar trayectorias específicas en lugar de aprender una política general, especialmente si el dataset es homogéneo.
- No se han documentado sesgos específicos, pero al ser un modelo visual, puede verse afectado por sesgos en los datos de imagen (por ejemplo, colores o formas predominantes).
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de los datasets asociados (ambos Apache 2.0).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alphabot2/14_Merged_RGB_ocr_ACT)
- [Dataset de entrenamiento](https://huggingface.co/datasets/alphabot2/14_Merged_RGB_ocr)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
