# ketiswp/mlcommons-ResNet8-CIFAR10-int8-onnx

## Resumen

El modelo `ketiswp/mlcommons-ResNet8-CIFAR10-int8-onnx` es una versión cuantizada a 8 bits en formato ONNX de la red neuronal ResNet8, diseñada para clasificación de imágenes sobre el dataset CIFAR-10. El autor, ketis, ha tomado el modelo de referencia del proyecto MLCommons Tiny (benchmark de entrenamiento para sistemas de bajo consumo) y lo ha convertido a ONNX con cuantización estática QDQ (Quantization-DeQuantization). Esto permite ejecutar inferencia con ONNX Runtime en dispositivos con recursos limitados, como microcontroladores o CPUs sin GPU, manteniendo un tamaño de modelo mínimo.

La relevancia de este modelo radica en su utilidad como ejemplo de despliegue de visión por computador en entornos edge, donde el consumo de memoria y la latencia son críticos. Al estar licenciado bajo Apache 2.0 y publicarse en formato ONNX, puede integrarse fácilmente en pipelines de producción con herramientas estándar del ecosistema. La arquitectura ResNet8 es una variante reducida de ResNet con pocas capas residuales, pensada para tareas simples como la clasificación de 10 clases de CIFAR-10. No se dispone en la información proporcionada del número exacto de parámetros ni de la longitud de contexto (no aplica a visión).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet8 (CNN con bloques residuales) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantización | INT8 estático (QDQ) |
| Idiomas soportados | no aplica (entrada de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a una ResNet de profundidad reducida, denominada ResNet8, que emplea bloques residuales con conexiones de atajo para facilitar el entrenamiento de redes profundas en tareas de clasificación de imágenes pequeñas como CIFAR-10. El modelo original fue entrenado por el proyecto MLCommons Tiny como parte de un benchmark de entrenamiento para dispositivos de bajo consumo, con el dataset CIFAR-10 (60 000 imágenes de 32×32 píxeles en 10 clases). El autor de la ficha realizó una conversión a ONNX y aplicó cuantización estática de 8 bits en formato QDQ, lo que reduce el tamaño del modelo y acelera la inferencia en hardware que soporta operaciones INT8. No se dispone de detalles sobre el proceso de entrenamiento (número de épocas, optimizador, técnicas de regularización) ni sobre la composición exacta del dataset más allá de CIFAR-10. La cuantización se realizó post-entrenamiento (PTQ) según se indica en el modelo pareado FP32.

## Capacidades

- Clasificación de imágenes en las 10 clases de CIFAR-10 (avión, coche, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en formato ONNX compatible con ONNX Runtime, OpenCV y otras herramientas que soporten este estándar.
- Ejecución eficiente en CPU gracias a la cuantización INT8, sin necesidad de GPU.
- Capacidad de integración en pipelines de visión artificial existentes mediante el uso de la API de ONNX Runtime.

## Casos de uso

- **Prototipado de visión por computador en entornos educativos**: el modelo es adecuado para demostrar el flujo completo de entrenamiento, cuantización y despliegue de un clasificador de imágenes, gracias a su tamaño reducido y a la disponibilidad de la versión FP32 pareada para comparar el impacto de la cuantización.
- **Despliegue en dispositivos embebidos**: al ser INT8 y en formato ONNX, puede ejecutarse en plataformas como Raspberry Pi, Jetson Nano o microcontroladores con soporte para ONNX Runtime, permitiendo clasificación de imágenes en tiempo real sin acelerador GPU.
- **Integración en sistemas de monitorización ambiental**: por ejemplo, clasificar tipos de vehículos (coche, camión, avión) en imágenes de cámaras de tráfico, con un modelo ligero que no requiere infraestructura potente.
- **Pruebas de concepto de MLOps**: sirve como ejemplo para practicar pipelines de conversión a ONNX, cuantización y evaluación de impacto en precisión, comparando con el modelo FP32 original.
- **Clasificación de objetos en robots autónomos pequeños**: en robots de bajo coste que necesitan identificar objetos simples (los 10 tipos de CIFAR-10) con latencia mínima y bajo consumo de memoria.
- **Educación en ingeniería de modelos**: herramienta didáctica para enseñar cómo la cuantización afecta al rendimiento y cómo se despliega un modelo de visión en formato estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, latencia o comparaciones con otras versiones. El único dato técnico adicional es la cuantización INT8 estática, pero se desconoce el impacto exacto en la precisión respecto al modelo FP32.

## Requisitos de hardware

- Al ser un modelo pequeño y cuantizado, se puede ejecutar en CPU de cualquier ordenador moderno sin necesidad de GPU. No se dispone del tamaño exacto del archivo (el repositorio indica 0.0 GB, probablemente menos de 1 MB).
- Para despliegue en producción, se recomienda usar ONNX Runtime con la ejecución de CPU y opcionalmente el proveedor de aceleración INT8 (por ejemplo, el backend de Intel o ARM) si está disponible.
- No se requiere VRAM porque el modelo puede cargarse en memoria principal; en caso de usarse GPU, la memoria necesaria es mínima (menos de 1 GB).
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), OpenCV DNN, o herramientas de servidor como Triton Inference Server (aunque el modelo es demasiado pequeño para justificar un servidor completo).
- No se han estimado latencias ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketis/ResNet8-CIFAR10-int8-onnx (este) | ResNet8 | ONNX | INT8 QDQ | Apache 2.0 | Hugging Face |
| ketis/ResNet8-CIFAR10-fp32-onnx (modelo pareado) | ResNet8 | ONNX | FP32 | Apache 2.0 | Hugging Face |
| EclipseAidge/resnet8 | ResNet8 | ONNX | No especificado | No disponible | Hugging Face |
| Floadia/resnet8 | ResNet8 | ONNX/PyTorch | PTQ (INT8) | No disponible | GitHub |

No se dispone de datos de rendimiento para comparar estos modelos. La comparativa se limita a la arquitectura y el formato, ya que la información proporcionada no incluye métricas de precisión ni de velocidad.

## Limitaciones y advertencias

- **Precisión**: la cuantización INT8 estática puede reducir la precisión respecto al modelo FP32, especialmente en clases con diferencias sutiles entre imágenes (por ejemplo, gato vs perro). Se recomienda evaluar el impacto antes de usar en producción.
- **Alcance limitado**: el modelo está entrenado exclusivamente para CIFAR-10, por lo que solo puede clasificar las 10 clases de ese dataset; no es válido para otras tareas de visión sin reentrenamiento.
- **Entrada de imagen**: se espera que la entrada sea una imagen de 32×32 píxeles en color (RGB), según el dataset original; cualquier otra resolución o formato requerirá preprocesamiento.
- **Sesgos**: no se ha documentado ningún estudio de sesgos, pero al ser un modelo pequeño y entrenado en un dataset sintético (CIFAR-10), es probable que no generalice bien a imágenes del mundo real fuera de esas categorías.
- **Riesgo de alucinación**: no aplica, al ser un modelo discriminativo de clasificación, no genera texto.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero se debe incluir el aviso de licencia correspondiente en los productos derivados.
- **Mantenimiento**: el modelo fue creado en 2026 y no se ha actualizado; no hay garantía de soporte.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ketiswp/mlcommons-ResNet8-CIFAR10-int8-onnx)
- [Modelo FP32 pareado](https://huggingface.co/ketiswp/mlcommons-ResNet8-CIFAR10-fp32-onnx)
- [Repositorio original de MLCommons Tiny](https://github.com/mlcommons/tiny/tree/4addd0fa08d216e20637637874e084895f289da4/benchmark/training/image_classification)
- [ONNX Model Zoo](https://github.com/onnx/models) (referencia general del formato)
- [Proyecto Floadia/resnet8 en GitHub](https://github.com/Floadia/resnet8/tree/main/) (ejemplo de conversión de ResNet8 a ONNX con PTQ)
