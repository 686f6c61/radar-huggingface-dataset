# shin0624/bridgesense-segformer

## Resumen

BridgeSense DT es un modelo de segmentación semántica de imágenes desarrollado por shin0624 para la inspección visual de puentes. Se trata de un SegFormer MiT-B2 (`nvidia/mit-b2`) fine-tuneado sobre el dataset AI-Hub de inspección de puentes de Corea del Sur, y posteriormente exportado a formato ONNX (opset 18) para su integración en el motor de inferencia Unity Sentis dentro del proyecto BridgeSense DT, presentado en la competición de desarrolladores open source de 2026.

El modelo resuelve el problema de detectar y localizar defectos superficiales en infraestructuras de puentes mediante máscaras de píxeles, distinguiendo nueve tipos de daño más la clase de fondo. Su relevancia radica en ofrecer una alternativa ligera y desplegable en entornos de realidad aumentada o aplicaciones de campo, donde la inferencia debe ejecutarse en dispositivos con recursos limitados. El peso exportado ocupa aproximadamente 112 MB y trabaja con una resolución de entrada de 512×512 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer MiT-B2 (encoder Transformer jerárquico + decoder all-MLP) |
| Parametros totales | no disponible (base MiT-B2: ~24.6 M, pero el fine-tune no especifica el conteo final) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (solo se distribuye en ONNX fp32 o fp16, no se especifica) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX (opset 18, exportado con `dynamo=True`) |

## Arquitectura y entrenamiento

El modelo se basa en SegFormer, una arquitectura de segmentación semántica compuesta por un encoder Transformer jerárquico (MiT-B2) y un decoder ligero completamente MLP. El encoder produce características multiescala que el decoder combina para generar máscaras de segmentación sin necesidad de módulos de atención complejos ni posprocesado adicional. Esta elección permite un equilibrio entre precisión y eficiencia computacional, adecuado para inferencia en dispositivos embebidos o móviles.

El fine-tune se realizó sobre el dataset AI-Hub de inspección de puentes, que contiene aproximadamente 420.074 imágenes, con una distribución de clases de 41,6% de defectos en hormigón, 34,9% en asfalto, 23,4% de imágenes normales y 0,1% de defectos en acero. Las etiquetas originales se convirtieron a formato COCO para el entrenamiento. No se especifica el número de épocas, la configuración de hiperparámetros ni si se aplicaron técnicas de aumento de datos. El modelo se exportó a ONNX con `dynamo=True`, lo que sugiere un grafo dinámico optimizado para inferencia.

## Capacidades

- Segmentación semántica de defectos en imágenes de puentes, generando máscaras píxel a píxel.
- Detección de nueve clases de daño: grietas en hormigón, desconchado en hormigón, eflorescencias, filtraciones, exposición de armaduras, grietas en asfalto, hundimientos en asfalto, corrosión en acero y desprendimiento de pintura en acero.
- Clasificación de fondo (superficie normal) como clase adicional.
- Inferencia a resolución fija de 512×512 píxeles.
- Exportación a ONNX, lo que permite ejecución en múltiples backends (CPU, GPU, NPU) y en motores como Unity Sentis, ONNX Runtime o TensorRT.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento multimodal más allá de la entrada de imagen.

## Casos de uso

- Inspección visual de puentes en campo: el modelo puede ejecutarse en una tablet o smartphone con Unity Sentis para segmentar defectos en tiempo real durante la inspección, ayudando al ingeniero a localizar daños sin necesidad de análisis posterior en servidor.
- Generación de informes automatizados de mantenimiento: las máscaras de segmentación se pueden procesar para calcular áreas afectadas por cada tipo de defecto y generar automáticamente reportes de condición estructural.
- Integración en sistemas de gestión de activos de infraestructura: los resultados de segmentación pueden alimentar bases de datos de inventario de puentes, permitiendo el seguimiento temporal de la evolución de grietas o corrosión.
- Asistencia a la navegación de drones de inspección: el modelo puede procesar imágenes capturadas por drones y resaltar regiones defectuosas para que el operador enfoque la cámara en zonas críticas.
- Entrenamiento de personal técnico: las máscaras generadas sirven como material didáctico para identificar visualmente distintos tipos de daño en estructuras de hormigón y acero.
- Investigación en visión por computador aplicada a infraestructuras: el modelo proporciona una línea base de segmentación de defectos que puede compararse con otros enfoques o utilizarse para transferir aprendizaje a otros dominios de inspección (túneles, carreteras, edificios).

## Benchmarks y rendimiento

El autor reporta un mean IoU de aproximadamente 0,47 en el conjunto de validación. No se proporcionan resultados desglosados por clase ni comparaciones con otros modelos en la misma tarea. En el proyecto, el modelo de segmentación mostró un comportamiento más estable que el modelo de detección RT-DETR v2 (mAP 0,05), por lo que se adoptó como fuente principal para localizar defectos mediante análisis de componentes conexos sobre las máscaras.

| Metrica | Valor |
|---|---|
| mean IoU (validación) | ~0,47 |
| mAP del modelo de detección alternativo (RT-DETR v2) | 0,05 |

No se dispone de datos de benchmarks adicionales (mIoU por clase, precisión, recall, F1) en la información proporcionada.

## Requisitos de hardware

- El modelo ONNX pesa aproximadamente 112 MB, lo que lo hace adecuado para dispositivos con memoria moderada.
- Al ser un modelo de visión con entrada 512×512, la inferencia puede ejecutarse en CPU con tiempos de procesamiento de varios cientos de milisegundos por imagen, dependiendo del hardware.
- En GPU, una tarjeta de gama media como una RTX 3060 o superior puede procesar múltiples imágenes por segundo.
- Para despliegue en dispositivos móviles, Unity Sentis permite ejecutar el modelo en GPU integrada o NPU de smartphones modernos.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), Unity Sentis, TensorRT, OpenVINO.
- No se especifican requisitos mínimos de VRAM ni latencias concretas en la documentación del modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de segmentación de defectos en puentes. El modelo se basa en SegFormer MiT-B2, que en benchmarks generales de segmentación (ADE20K, Cityscapes) alcanza un mIoU de 37,0 y 78,5 respectivamente, pero estos valores no son directamente comparables con el fine-tune específico de este proyecto. Alternativas genéricas de segmentación como DeepLabV3, U-Net o Mask2Former podrían adaptarse a la misma tarea, pero no se han publicado resultados comparativos en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de puentes coreanos (AI-Hub), por lo que su rendimiento puede degradarse en infraestructuras con características diferentes (clima, materiales, iluminación, ángulos de cámara).
- La distribución de clases está muy desequilibrada: los defectos en acero representan solo el 0,1% del dataset, lo que probablemente conlleva una baja precisión en esas clases.
- El mean IoU de 0,47 indica que aproximadamente la mitad de los píxeles de defecto no se segmentan correctamente; no es adecuado para decisiones críticas de seguridad sin supervisión humana.
- La resolución fija de 512×512 puede perder detalles finos de grietas muy delgadas o defectos pequeños.
- No se especifican técnicas de mitigación de sesgos ni evaluación de robustez ante condiciones adversas (niebla, lluvia, sombras).
- La licencia Apache 2.0 permite uso comercial, pero el dataset AI-Hub puede tener restricciones de uso que deben verificarse antes de explotar el modelo en producción.
- El modelo solo acepta imágenes de entrada; no incluye capacidades de procesamiento de vídeo ni de múltiples vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shin0624/bridgesense-segformer
- Repositorio del proyecto BridgeSense DT: https://github.com/shin0624/BridgeSense_DT
- Especificación de entrada/salida del modelo: https://github.com/shin0624/BridgeSense_DT/blob/main/ai/export/model_io_spec.md
- Documentación de SegFormer en Hugging Face: https://huggingface.co/docs/transformers/v4.50.0/model_doc/segformer
- Paper de SegFormer (referencia): https://arxiv.org/abs/2105.15203 (no verificado en la búsqueda, pero es la referencia estándar)
