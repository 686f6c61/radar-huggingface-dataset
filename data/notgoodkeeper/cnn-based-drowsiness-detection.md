# notgoodkeeper/cnn-based-drowsiness-detection

## Resumen

El modelo `notgoodkeeper/cnn-based-drowsiness-detection` es una red neuronal convolucional (CNN) exportada a formato ONNX que predice la somnolencia del conductor a partir de un recorte de rostro preprocesado. Ha sido desarrollado por el usuario notgoodkeeper como un proyecto de investigación y portafolio, entrenado con la herramienta Sony Neural Network Console (NNC). El modelo resuelve el problema de detectar estados de fatiga o somnolencia en tiempo real, un factor clave en la prevención de accidentes de tráfico.

La arquitectura consiste en una CNN profunda con múltiples bloques de capas Conv2D, BatchNorm y ReLU, seguidos de capas densas. Incorpora varias cabezas de salida que predicen simultáneamente una clase de somnolencia, un nivel de confianza y seis objetivos de regresión (puntuación de somnolencia, EAR, MAR, y ángulos de cabeza). El modelo acepta una imagen de entrada de 412x412x3 píxeles (crop facial preprocesado en escala de grises replicado a tres canales). El repositorio incluye el archivo ONNX, la definición de red en formato NNC y el resumen del entrenamiento.

La relevancia actual de este modelo radica en su formato ONNX ligero y portable, que permite su integración en sistemas de monitorización de conductores en dispositivos de bajo consumo. Sin embargo, es importante destacar que se trata de un proyecto académico con un conjunto de datos pequeño y etiquetas débiles, por lo que no debe considerarse un sistema de seguridad validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN profunda (bloques Conv2D + BatchNorm + ReLU, capas densas, múltiples cabezas de salida) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo `model.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN convolucional profunda que procesa imágenes de 412x412x3 píxeles. Se compone de varios bloques de capas Conv2D seguidas de BatchNorm y activación ReLU, que extraen características espaciales locales del rostro. Después de la parte convolucional, las características se aplanan y pasan por capas densas. El modelo tiene una estructura multi-cabeza: una salida para la clase de somnolencia (probablemente binaria), una salida para un nivel de confianza, y una salida de regresión con seis valores normalizados entre 0 y 1: `drowsiness_score`, `ear` (eye aspect ratio), `mar` (mouth aspect ratio), `head_roll`, `head_pitch` y `head_combined`.

El entrenamiento se realizó con Sony Neural Network Console sobre un dataset propio (`notgoodkeeper/cnn-based-drowsiness-detection-data`) que contiene aproximadamente 2.376 muestras etiquetadas (1.661 de entrenamiento, 356 de validación y 359 de prueba). La mejor pérdida de validación fue de 0,925, convergiendo en 18 épocas. Es importante señalar que las etiquetas son débiles o heurísticas, generadas automáticamente y no anotadas manualmente, lo que limita la calidad del aprendizaje. No se dispone de información sobre el número total de parámetros ni sobre técnicas de aumento de datos.

## Capacidades

- Detección de somnolencia en conductores a partir de un recorte facial preprocesado.
- Predicción de una clase de somnolencia (probablemente binaria: somnoliento/no somnoliento).
- Salida de un nivel de confianza asociado a la predicción.
- Regresión de seis métricas fisiológicas y de comportamiento: puntuación de somnolencia, eye aspect ratio (EAR), mouth aspect ratio (MAR), y tres medidas de orientación de cabeza (roll, pitch y combinada).
- Procesamiento de imágenes en escala de grises (el modelo espera una imagen de 412x412x3, con el canal de grises replicado a RGB).
- Inferencia en formato ONNX, compatible con múltiples runtimes (ONNX Runtime, etc.).

## Casos de uso

- Monitorización de conductores en tiempo real: el modelo puede integrarse en un sistema de cámara en el vehículo que detecte el rostro, lo preprocese y alimente el modelo para generar alertas de fatiga. Su formato ONNX permite ejecutarse en dispositivos embebidos o en un ordenador de bajo coste.
- Investigación académica en visión por computador: sirve como base de comparación para estudios sobre detección de somnolencia, ya que su código y datos están disponibles.
- Prototipado de sistemas de seguridad vial: se puede utilizar en demostraciones o pruebas de concepto para validar la viabilidad de algoritmos de detección de fatiga antes de pasar a soluciones comerciales.
- Desarrollo de sistemas de alerta temprana en flotas de transporte: combinado con otras señales (velocidad, tiempo de conducción), el modelo puede ayudar a prevenir accidentes en entornos profesionales.
- Aplicaciones de bienestar y salud: aunque el foco es la conducción, el modelo podría adaptarse para monitorizar la atención en otras tareas que requieren vigilancia sostenida (operadores de maquinaria, controladores aéreos).
- Formación y educación en deep learning: al ser un proyecto de código abierto con licencia MIT, es un recurso didáctico para aprender a entrenar y exportar modelos ONNX con Sony NNC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona la pérdida de validación (0,925) y el número de épocas, pero no se proporcionan métricas como precisión, recall o F1 sobre el conjunto de prueba. Tampoco hay comparaciones con otros modelos de detección de somnolencia.

## Requisitos de hardware

- Al ser un modelo ONNX de tamaño reducido (el repositorio ocupa 0.0 GB, lo que sugiere un archivo de pocos megabytes), puede ejecutarse en CPU sin problemas en tiempo real para una sola imagen.
- No se dispone de información sobre VRAM estimada ni GPU recomendadas. Dado el tamaño probable del modelo, una GPU integrada o una tarjeta básica (como una NVIDIA GTX 1650 o superior) sería más que suficiente.
- Es compatible con ONNX Runtime, por lo que puede desplegarse en CPU, GPU (CUDA, TensorRT) y dispositivos móviles (Android/iOS) mediante los runtimes correspondientes.
- No hay datos sobre latencia o throughput. Para una sola imagen, la inferencia debería ser de pocos milisegundos en CPU moderna.
- Opciones de despliegue: ONNX Runtime, OpenCV DNN, TensorRT, o incluso en navegador con ONNX.js.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. Existen otros proyectos de detección de somnolencia basados en CNN en GitHub (por ejemplo, `fedrik67/drowsiness_detection` o `nithin953/Real-Time-Driver-Drowsiness-Detection-using-Lightweight-CNN-Architecture-`), pero no se han publicado métricas comparables con el modelo de notgoodkeeper. Tampoco se han encontrado benchmarks que permitan situar este modelo frente a alternativas académicas como las revisadas en artículos de MDPI o Springer. Por tanto, la comparativa se limita a señalar que existen alternativas similares, pero sin datos concretos.

## Limitaciones y advertencias

- Conjunto de datos muy pequeño (2.376 muestras) y con etiquetas débiles generadas heurísticamente, no anotadas por humanos. Esto puede provocar un aprendizaje subóptimo y una baja generalización.
- No es un sistema de seguridad validado. La propia model card indica que es un proyecto de investigación/portafolio, no un sistema de seguridad fiable para uso real.
- La entrada requiere un preprocesamiento específico (detección facial, eliminación de fondo, CLAHE y escala de grises) que no está incluido en el modelo. El usuario debe implementar ese pipeline por separado.
- No se especifican los rangos de denormalización para las salidas de regresión; solo se menciona que están en `src/realtime_inference.py` del repositorio de código, lo que añade dependencia del código fuente.
- No hay información sobre la robustez ante variaciones de iluminación, oclusiones, gafas, etc.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni la seguridad.
- El modelo solo procesa imágenes de 412x412 píxeles; si se usa con otras resoluciones, se requiere redimensionado, lo que puede afectar a la precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notgoodkeeper/cnn-based-drowsiness-detection
- Dataset utilizado: https://huggingface.co/datasets/notgoodkeeper/cnn-based-drowsiness-detection-data
- Repositorio de código: https://github.com/not-good-keeper/cnn-based-drowsiness-detection
- Sony Neural Network Console: https://dl.sony.com/
