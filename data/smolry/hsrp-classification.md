# Smolry/HSRP-classification

## Resumen

El modelo HSRP-classification, desarrollado por Smolry, es un clasificador de imágenes diseñado para identificar placas de matrícula de alta seguridad (HSRP, por sus siglas en inglés) a partir de recortes de vehículos. Se basa en google/efficientnet-b0, un modelo CNN ligero de Google, y se ha ajustado finamente con el dataset propietario Smolry/HSRP_classification_data. Su propósito es apoyar aplicaciones de tráfico, cumplimiento normativo y seguridad vial.

El modelo resuelve un problema concreto: determinar si una imagen de un vehículo contiene una placa HSRP, lo que es relevante para sistemas de peaje automático, control policial y verificación de cumplimiento normativo en países donde estas placas son obligatorias. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Al estar basado en EfficientNet-B0, hereda una arquitectura eficiente de aproximadamente 5,3 millones de parámetros, lo que lo hace apto para despliegue en entornos con recursos limitados, incluida inferencia en CPU. El repositorio incluye etiquetas ONNX, lo que sugiere que el modelo está disponible en formato ONNX para despliegue multiplataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con bloques MBConv) |
| Parametros totales | ~5,3 millones (heredados del base model) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (según tags); safetensors no confirmado |

## Arquitectura y entrenamiento

El modelo parte de EfficientNet-B0, una arquitectura CNN desarrollada por Google que emplea bloques MBConv (inverted residual blocks con convoluciones en profundidad) y un escalado compuesto que equilibra profundidad, anchura y resolución. La entrada estándar es de 224x224 píxeles, aunque no se especifica si el ajuste fino modificó este tamaño.

El ajuste fino se realizó sobre el dataset Smolry/HSRP_classification_data, del que no se han publicado detalles sobre el número de imágenes, distribución de clases o proporción de datos de entrenamiento y validación. La model card indica que las métricas evaluadas son F1, precisión, recall y exactitud, lo que sugiere que se trata de una tarea de clasificación binaria (HSRP frente a no HSRP) o multiclase, aunque no se especifica el número de clases. Tampoco se menciona el uso de técnicas como data augmentation, transfer learning avanzado o métodos de regularización específicos.

## Capacidades

- Clasificación de imágenes de recortes de vehículos para identificar placas HSRP.
- Inferencia en tiempo real gracias a la ligereza de EfficientNet-B0 (5,3 millones de parámetros).
- Compatibilidad con formato ONNX, lo que facilita la integración en pipelines de visión por computador en múltiples frameworks (TensorRT, ONNX Runtime, OpenVINO).
- Funciona con entrada de imagen única (no soporta secuencias de vídeo ni múltiples frames de forma nativa).
- No soporta tool calling, generación de texto ni razonamiento multimodal; es exclusivamente un clasificador de visión.

## Casos de uso

- **Verificación de cumplimiento normativo en peajes**: el modelo puede integrarse en sistemas de peaje automático para detectar si un vehículo lleva placa HSRP y aplicar tarifas o penalizaciones según la normativa regional.
- **Control policial automatizado**: las cámaras de tráfico pueden capturar recortes de vehículos y enviarlos al modelo para verificar si el vehículo cumple con la normativa de placas de alta seguridad, reduciendo la inspección manual.
- **Sistema de gestión de aparcamientos**: integrado en barreras de aparcamiento, el modelo puede clasificar vehículos con HSRP para aplicar tarifas diferenciadas o validar acceso a zonas restringidas.
- **Análisis de flujo de tráfico**: en sistemas de videovigilancia urbana, el modelo puede etiquetar vehículos por tipo de placa para estadísticas de cumplimiento y estudios de movilidad.
- **Preprocesamiento en pipelines de reconocimiento de matrículas**: antes de un OCR de placas, el modelo puede filtrar imágenes que no contienen placas HSRP, evitando procesamiento innecesario en módulos de lectura de caracteres.
- **Integración en aplicaciones móviles de reporte ciudadano**: los usuarios pueden fotografiar vehículos y el modelo clasifica si la placa es HSRP, útil para denuncias de incumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas (F1, precisión, recall, exactitud) pero no incluye valores concretos. No hay datos comparativos con otros modelos de clasificación de HSRP en la documentación proporcionada.

## Requisitos de hardware

- **VRAM estimada**: al basarse en EfficientNet-B0 (~5,3 millones de parámetros), la inferencia en FP32 requiere aproximadamente 20-30 MB de memoria de pesos, más el overhead de activaciones. En ONNX cuantizado (INT8), el uso puede reducirse a unos 10 MB.
- **GPUs recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050, RTX 2060, etc.). En CPU, puede ejecutarse en tiempo real para imágenes individuales.
- **Compatibilidad con GPU consumer**: sí, funciona en cualquier GPU consumer moderna (serie GTX 10, RTX 20/30/40).
- **Opciones de despliegue**: ONNX Runtime, TensorRT, OpenVINO, TFLite, o directamente con PyTorch. No se confirma compatibilidad con vLLM u Ollama, ya que es un modelo de visión, no de texto.
- **Latencia estimada**: en GPU, la inferencia de una imagen de 224x224 suele completarse en menos de 5 ms; en CPU moderna, entre 10-50 ms según el hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Smolry/HSRP-classification | ~5,3 M | Clasificación HSRP | Apache-2.0 | HuggingFace |
| HSRP Detection (Prativ, Roboflow) | no disponible | Detección de objetos HSRP | no disponible | Roboflow Universe |
| HSRP-Scanner (aryan-arvind) | no disponible | Detección, tracking y reconocimiento de HSRP | no disponible | GitHub |

No se dispone de datos de rendimiento comparativos entre estos sistemas, ya que no se publican resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- **Dataset limitado**: el modelo se ha entrenado con un dataset sin detalles públicos de tamaño ni distribución de clases, lo que puede provocar un rendimiento insuficiente en escenarios con variabilidad real (iluminación, ángulos, condiciones climáticas).
- **Alcance restringido**: solo clasifica recortes de vehículos, no detecta ni localiza placas en imágenes completas. Para detección, se necesitaría un modelo de detección de objetos complementario.
- **Idioma**: la model card solo indica inglés, lo que no es un problema para una tarea de visión, pero limita la documentación y el soporte para otros idiomas.
- **Sesgo potencial**: no se ha publicado análisis de sesgo por tipo de vehículo, color, iluminación o región geográfica. El rendimiento puede variar significativamente fuera del dominio de entrenamiento.
- **Riesgo de alucinación**: en el contexto de clasificación de imágenes, el modelo puede producir falsos positivos (clasificar una placa normal como HSRP) o falsos negativos, lo que en aplicaciones de control normativo puede tener consecuencias legales.
- **Sin datos de validación externa**: no se han publicado resultados en conjuntos de datos independientes, por lo que el rendimiento en producción es incierto.
- **Formato de pesos**: aunque se etiqueta con ONNX, no se confirma si los pesos están disponibles en otros formatos (safetensors, PyTorch nativo), lo que puede limitar la integración en ciertos entornos.

## Enlaces

- [HuggingFace - Smolry/HSRP-classification](https://huggingface.co/Smolry/HSRP-classification)
- [Dataset - Smolry/HSRP_classification_data](https://huggingface.co/datasets/Smolry/HSRP_classification_data)
- [Modelo base - google/efficientnet-b0](https://huggingface.co/google/efficientnet-b0)
- [GitHub - HSRP-Scanner](https://github.com/aryan-arvind/HSRP-Scanner)
- [GitHub - Smart HSRP System](https://github.com/Guardian-22/smart-hsrp-system)
- [Roboflow - HSRP Detection Model](https://universe.roboflow.com/prativ/hsrp-detection)
- [ACM - HSRP Detection and Classification Using Federated Learning](https://dl.acm.org/doi/10.1016/j.procs.2025.03.298)
- [IJRPR - HSRP Number Plate Detection Using Machine Learning](https://ijrpr.com/uploads/V5ISSUE10/IJRPR33805.pdf)
