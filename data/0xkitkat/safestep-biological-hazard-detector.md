# 0xKitkat/safestep-biological-hazard-detector

## Resumen

SAFEstep biological-hazard detector es un modelo de detección de objetos basado en YOLO11n, desarrollado por 0xKitkat como parte del prototipo de seguridad SAFEstep para iPhone. El modelo está diseñado para funcionar completamente offline y detectar cinco grupos visuales gruesos: serpientes, setas, arañas, escorpiones y pegasas. No es un clasificador de especies, veneno, toxicidad ni comestibilidad, sino un detector de presencia de estos grupos biológicos en imágenes.

El modelo se ha ajustado a partir de la arquitectura YOLO11n de Ultralytics y se distribuye en tres formatos: pesos nativos de PyTorch (`best.pt`), exportación portable ONNX (`best.onnx`) y un paquete Core ML validado (`best.mlpackage`) para su integración en aplicaciones iOS. El entrenamiento se realizó sobre el dataset regional `0xKitkat/safestep-regional-bio-vision`, basado en registros de Open Images CC BY 2.0. Los resultados de evaluación muestran un mAP50 de 0.732 en el conjunto de test, aunque el autor advierte explícitamente que estos resultados a escala de hackathon no son suficientes para garantizar seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (detección de objetos) |
| Tipos de cuantizacion | no disponible (formatos nativos, ONNX y Core ML) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (best.pt), ONNX (best.onnx), Core ML ML Program (best.mlpackage) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO11n, una variante compacta de la familia YOLO11 de Ultralytics diseñada para despliegue en dispositivos con recursos limitados. La entrada es una imagen de 640×640 píxeles y la salida son cajas delimitadoras normalizadas con sus correspondientes puntuaciones de confianza para las cinco clases. La versión Core ML acepta además los parámetros `iouThreshold` y `confidenceThreshold` para ajustar el postprocesado NMS.

El entrenamiento se realizó mediante fine-tuning del checkpoint base YOLO11n sobre el dataset `0xKitkat/safestep-regional-bio-vision`, compuesto por registros de Open Images con licencia CC BY 2.0. El checkpoint final se seleccionó sobre 235 imágenes de validación y se evaluó una vez sobre 227 imágenes de test con 382 cajas anotadas. No se especifica el número de tokens de entrenamiento ni el uso de RLHF o DPO, dado que se trata de un detector de visión, no un modelo de lenguaje.

## Capacidades

- Detección de objetos en tiempo real para cinco clases: serpiente, seta, araña, escorpión y pegasas.
- Funcionamiento completamente offline, sin necesidad de conexión a red.
- Exportación a Core ML ML Program para integración nativa en iOS.
- Exportación ONNX para despliegue en otros entornos.
- Acepta parámetros de umbral de confianza y IoU en el formato Core ML.
- No es un clasificador de especies, veneno, toxicidad ni comedicibilidad.

## Casos de uso

- Aplicación de seguridad al aire libre: el modelo se integra en el prototipo SAFEstep para iPhone, permitiendo a excursionistas y senderistas detectar visualmente organismos potencialmente peligrosos en tiempo real sin conexión a internet. La ventana de 640×640 y la inferencia local permiten una respuesta inmediata en entornos remotos.
- Auditoría de seguridad en entornos industriales: aunque el modelo está entrenado para fauna y flora, la arquitectura YOLO11n puede reutilizarse con fine-tuning para detectar otros riesgos biológicos en instalaciones como almacenes o laboratorios.
- Educación y concienciación en biodiversidad: el modelo puede usarse en aplicaciones educativas para identificar visualmente organismos comunes en entornos naturales, siempre que se presenten las detecciones como “posible X detectado” y no como identificación segura.
- Prototipos de asistencia para personas con discapacidad visual: la detección de estos grupos biológicos puede integrarse en sistemas de asistencia que describan el entorno, avisando de posibles peligros cercanos.
- Vigilancia de áreas recreativas: desplegado en dispositivos móviles o cámaras con capacidad de inferencia local, puede alertar de presencia de organismos potencialmente peligrosos en parques, playas o zonas de acampada.
- Investigación en detección de organismos: el modelo sirve como base para experimentos de detección de clases biológicas en imágenes, con la posibilidad de ampliar el dataset y las clases para investigación académica.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación en la model card del autor. El checkpoint final se evaluó sobre un conjunto de test de 187 imágenes con 382 cajas.

| Split | Precision | Recall | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|
| Validación | 0.760 | 0.641 | 0.682 | 0.502 |
| Test | 0.790 | 0.662 | 0.732 | 0.528 |

mAP50-95 por clase en test: serpiente 0.414, seta 0.350, araña 0.766, escorpión 0.654 y pegasas 0.455.

El autor advierte que estos resultados a escala de hackathon no son suficientes para garantizar seguridad.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en iPhone mediante el paquete Core ML validado (`best.mlpackage`), por lo que cabe en dispositivos móviles con Neural Engine.
- La exportación ONNX permite ejecutarse en CPU y GPU de escritorio, así como en aceleradores compatibles con ONNX Runtime.
- El formato nativo `best.pt` requiere el entorno de ejecución de Ultralytics (PyTorch) y puede ejecutarse en GPUs de consumo como RTX 3060 o superiores.
- Para inferencia en producción, se puede servir mediante vLLM o TGI si se convierte el modelo a formato compatible, aunque no es el flujo previsto por el autor.
- El tamaño del repositorio es de 0.0 GB según HuggingFace, lo que sugiere que los pesos son ligeros, típico de un modelo YOLO11n.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares en la información proporcionada. El modelo es un fine-tuning específico de YOLO11n sobre un dataset propio, y no se han publicado comparaciones con otras arquitecturas de detección de objetos biológicos.

## Limitaciones y advertencias

- No es un clasificador de especies, veneno, toxicidad ni comedicidad; solo detecta grupos visuales gruesos.
- Los resultados en el conjunto de test muestran una mAP50-95 de 0.528, con una precisión baja para serpientes (0.414) y setas (0.350), lo que puede provocar falsos negativos.
- El autor advierte que una detección omitida no debe presentarse como prueba de que un área u organismo es seguro.
- La licencia AGPL-3.0 impone obligaciones de copyleft en la redistribución del modelo y sus derivados.
- Las imágenes de entrenamiento provienen de Open Images CC BY 2.0, pero el modelo base YOLO11 y la herramienta Ultralytics están sujetos a sus propias licencias; hay que revisar la disponibilidad de fuentes y licencias antes de redistribuir.
- No se especifican sesgos conocidos del modelo, pero el dataset regional puede introducir sesgos geográficos.
- El modelo no debe usarse para asesorar sobre acercarse, tocar, capturar, degustar o comer organismos basándose en sus detecciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xKitkat/safestep-biological-hazard-detector
- Dataset asociado: https://huggingface.co/datasets/0xKitkat/safestep-regional-bio-vision
- Colección de modelos de 0xKitkat: https://huggingface.co/collections/0xKitkat/models
- Proyecto SafeStep en Devpost: https://devpost.com/software/safestep-ai-hse-auditor-d5hcn2
- Repositorio GitHub del proyecto SafeStep (relacionado): https://github.com/AndyBDo/SafeStep
- Perfil de 0xKitkat en HuggingFace: https://huggingface.co/0xKitkat
