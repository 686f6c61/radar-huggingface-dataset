# levin7/plantas-clasificador

## Resumen

El clasificador de plantas de `levin7` es un modelo de visión artificial diseñado para identificar seis categorías de plantas (falsa brecina, flor azul, oreja de Shrek, orquídea, planta panda y una clase "sin planta") en el contexto de un proyecto de robot cartesiano. Está construido sobre la arquitectura MobileNetV2 y se distribuye en formato TensorFlow Lite cuantizado a int8, lo que lo hace apto para despliegue en microcontroladores como el ESP32.

El modelo resuelve un problema acotado: la clasificación de imágenes en un entorno de robótica embebida con recursos muy limitados. Su relevancia radica en que demuestra un flujo completo de entrenamiento, cuantización y despliegue en hardware de bajo consumo, un patrón habitual en proyectos de robótica educativa y prototipado rápido.

Se trata de un modelo de nicho, con 34 descargas y sin métricas publicadas, por lo que debe evaluarse como un componente de un proyecto personal más que como un modelo de propósito general. La información disponible sobre su entrenamiento, datos y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN para clasificación de imágenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | int8 (archivo `plantas_int8.tflite`) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | TensorFlow Lite (`.tflite`) |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV2, una red convolucional profunda con bloques residuales invertidos y conexiones lineales de cuello de botella, optimizada para inferencia en dispositivos con recursos limitados. El modelo se distribuye cuantizado a int8, técnica que reduce el tamaño y acelera la inferencia en microcontroladores, a costa de una posible pérdida de precisión.

No se dispone de información sobre el dataset de entrenamiento (número de imágenes, composición, aumentos de datos), el proceso de entrenamiento (épocas, optimizador, función de pérdida) ni si se aplicaron técnicas de regularización o ajuste fino. La model card indica que el preprocesado está integrado dentro del modelo y que la entrada son píxeles en rango 0-255, lo que simplifica el pipeline de despliegue en el ESP32.

## Capacidades

- Clasificación de imágenes en seis clases: `falsa_brecina`, `flor_azul`, `oreja_de_shrek`, `orquidea`, `planta_panda` y `sin_planta`.
- Inferencia en microcontroladores (ESP32) gracias a la cuantización int8 y al formato TFLite.
- Preprocesado integrado: acepta píxeles en rango 0-255 sin normalización externa.
- Salida de etiquetas en el orden definido en `labels.txt`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni otras modalidades.
- Capacidades multilingües no aplicables (modelo exclusivamente visual).

## Casos de uso

- Clasificación en robot cartesiano: el modelo se integra en el lazo de percepción del robot para identificar la planta objetivo y decidir la acción de recogida o manipulación. Su tamaño reducido permite ejecutarlo en el propio ESP32 sin depender de un servidor.
- Prototipado de visión embebida: sirve como plantilla para proyectos que necesiten entrenar y cuantizar un MobileNetV2 para clasificación de imágenes en microcontroladores, replicando el flujo con un dataset propio.
- Clasificación de plantas en jardinería doméstica: con una cámara conectada a un ESP32, el modelo puede etiquetar imágenes de plantas de interior y mostrar el resultado en una pantalla o enviarlo por red.
- Control de presencia de planta: la clase `sin_planta` permite detectar si la planta está presente en el encuadre, útil en sistemas de riego automático que solo actúan cuando hay una planta en la maceta.
- Educación y talleres de TinyML: el modelo y sus archivos asociados (`plantas_int8.tflite` y `labels.txt`) son un ejemplo completo para enseñar el ciclo de vida de un modelo TinyML, desde el entrenamiento hasta el despliegue en hardware.
- Automatización de inventario vegetal: en un vivero o invernadero pequeño, el modelo puede clasificar imágenes tomadas por una cámara fija para contabilizar ejemplares de cada especie, siempre que las condiciones de iluminación y encuadre sean controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU o microcontrolador, no en GPU.
- GPU recomendadas: no aplica para el despliegue previsto; para reentrenamiento se puede usar cualquier GPU consumer (por ejemplo, RTX 3060 o superior), aunque no hay datos de entrenamiento publicados.
- Cabe en consumer GPU: sí, pero su destino es hardware embebido; no requiere GPU para inferencia.
- Opciones de despliegue: TensorFlow Lite Micro en ESP32, TensorFlow Lite en Raspberry Pi o similar, y el intérprete TFLite en Python para pruebas en escritorio.
- Latencia y throughput estimados: no disponibles. Dependen del microcontrolador y de la implementación del intérprete TFLite Micro.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| levin7/plantas-clasificador | MobileNetV2 | no disponible | no aplica | MIT | TFLite int8 | HuggingFace |
| MobileNetV2 (TF Hub, ImageNet) | MobileNetV2 | ~3,5 M | no aplica | Apache 2.0 | TFLite, SavedModel | TensorFlow Hub |
| EfficientNet-Lite0 (TFLite) | EfficientNet-Lite | ~4,7 M | no aplica | Apache 2.0 | TFLite | TensorFlow Hub |
| MobileNetV3-Small (TFLite) | MobileNetV3 | ~2,5 M | no aplica | Apache 2.0 | TFLite | TensorFlow Hub |

La comparativa se limita a modelos genéricos de clasificación de imágenes para dispositivos embebidos, ya que no se dispone de otros clasificadores de plantas comparables con la misma licencia y formato. Los modelos de TensorFlow Hub están entrenados sobre ImageNet y no incluyen las clases específicas de este proyecto.

## Limitaciones y advertencias

- El modelo está entrenado para seis clases concretas; cualquier imagen fuera de esas categorías se asignará a una de ellas o a `sin_planta`, con riesgo de falsos positivos.
- No se han publicado métricas de precisión, recall ni matrices de confusión, por lo que se desconoce su fiabilidad real.
- La cuantización int8 puede degradar la precisión respecto al modelo en punto flotante original; no se dispone de una comparación.
- El modelo card indica un tamaño de entrada "1x1 RGB", lo que probablemente sea un error de documentación; el tamaño real de entrada de MobileNetV2 suele ser 224x224, pero no se confirma en la información disponible.
- No hay información sobre sesgos del dataset (iluminación, fondo, ángulo de cámara), lo que puede limitar la generalización a entornos distintos del proyecto original.
- La licencia MIT permite uso comercial, pero al no haber datos de entrenamiento ni garantías de rendimiento, no se recomienda su uso en producción sin una validación previa con datos propios.
- El modelo no procesa texto ni audio; cualquier caso de uso fuera de la clasificación de imágenes queda fuera de su alcance.

## Enlaces

- [HuggingFace: levin7/plantas-clasificador](https://huggingface.co/levin7/plantas-clasificador)
