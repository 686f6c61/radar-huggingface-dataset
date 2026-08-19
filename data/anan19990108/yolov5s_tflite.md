# anan19990108/yolov5s_tflite

## Resumen

El modelo `anan19990108/yolov5s_tflite` es una exportación a TensorFlow Lite del detector de objetos YOLOv5s de Ultralytics, preparada específicamente para su despliegue en dispositivos de borde (edge AI). El autor, Andrew Chiao, ha convertido los pesos originales de YOLOv5s a formato TFLite en dos resoluciones de entrada (320×320 y 640×640) y en dos precisiones (FP32 y cuantizado INT8), ofreciendo cuatro variantes listas para usar. El objetivo principal es facilitar la integración de detección de objetos en aplicaciones Android, sistemas embebidos y prototipos con aceleración por hardware (Qualcomm QNN HTP).

La arquitectura subyacente es la red neuronal convolucional YOLOv5s, con backbone CSPDarknet, cuello PANet y tres cabezas de detección. El modelo tiene aproximadamente 7,2 millones de parámetros (según la especificación estándar de YOLOv5s), aunque este dato no se detalla en la documentación del repositorio. La ventana de contexto no aplica al ser un modelo de visión. La relevancia actual radica en la creciente demanda de modelos de detección de objetos ligeros y cuantizados que puedan ejecutarse en tiempo real en dispositivos móviles y de bajo consumo, sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv5s (CSPDarknet backbone, PANet neck, 3 detection heads) |
| Parametros totales | No disponible en la informacion proporcionada (aprox. 7,2 M segun especificacion YOLOv5s) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (full precision), INT8 (entrada UINT8, salidas FP32, tensores internos mayormente INT8) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | AGPL-3.0 (con aviso de licencia comercial separada de Ultralytics) |
| Formato de pesos | TensorFlow Lite (.tflite) |

## Arquitectura y entrenamiento

El modelo base es YOLOv5s de Ultralytics, una red neuronal convolucional de una sola pasada (single-stage) diseñada para detección de objetos. La arquitectura combina un backbone CSPDarknet (Cross Stage Partial Darknet) que extrae características multiescala, un cuello PANet (Path Aggregation Network) que fusiona características de diferentes niveles, y tres cabezas de detección que producen mapas de anclas para objetos de pequeño, mediano y gran tamaño. Los pesos originales fueron entrenados por Ultralytics en el conjunto de datos COCO (80 clases), aunque el repositorio no especifica el proceso de entrenamiento ni los hiperparámetros.

La contribución principal de este repositorio es la conversión a TensorFlow Lite. Se generaron dos resoluciones de entrada (320×320 y 640×640) para equilibrar latencia y precisión. Las variantes cuantizadas utilizan cuantización de pesos y activaciones a INT8, con tensores de entrada UINT8 (escala 1/255, punto cero 0) y tensores de salida FP32. La cuantización reduce el tamaño del modelo de ~29 MB a ~7,7 MB, una reducción de aproximadamente el 74%. No se incluyen operaciones de post-procesado ni supresión de no máximos (NMS); el usuario debe implementarlas externamente. La verificación de tensores, formas, tipos de datos y hashes se realizó con TensorFlow Lite, pero no se proporcionan benchmarks de precisión ni latencia en el repositorio.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica objetos de 80 categorías del conjunto COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Múltiples resoluciones de entrada: 320×320 para baja latencia y 640×640 para mayor precisión.
- Dos precisiones: FP32 para máxima fidelidad numérica y INT8 cuantizado para despliegue eficiente en hardware de borde.
- Compatibilidad con TensorFlow Lite: puede ejecutarse en CPU, GPU y aceleradores NPU/DSP mediante delegados (XNNPACK, NNAPI, QNN).
- Integración con Android: soporte explícito para el delegado Qualcomm QNN HTP, permitiendo inferencia en el Hexagon Tensor Processor.
- Salidas estandarizadas: tres tensores de detección con forma `[1, grid_h, grid_w, 255]` (para 80 clases y 3 anclas por celda), listos para decodificación con los anclajes y zancadas correspondientes.
- Verificación de integridad: cada archivo incluye su hash SHA-256, lo que permite comprobar la autenticidad del modelo.

## Casos de uso

- Inspección visual en líneas de producción: el modelo puede detectar defectos o piezas faltantes en imágenes de productos. Con la variante INT8 a 320×320, puede ejecutarse en un PLC con módulo de IA o en un dispositivo Raspberry Pi con acelerador Coral, permitiendo control de calidad en tiempo real sin conexión a la nube.

- Aplicación móvil de conteo de personas o vehículos: integrando el modelo en una app Android mediante TensorFlow Lite, se puede contar el flujo de personas en un local o vehículos en un parking. La cuantización INT8 reduce el consumo de batería y permite operación continua en dispositivos de gama media.

- Robot de servicio autónomo: el modelo sirve para que un robot de limpieza o entrega detecte obstáculos y objetos en su camino. La baja latencia de la variante 320×320 permite una frecuencia de inferencia suficiente para navegación reactiva, y el soporte QNN HTP aprovecha el NPU de los SoC Qualcomm.

- Vigilancia perimetral con cámaras IP: desplegando el modelo en un gateway con NPU (por ejemplo, un dispositivo basado en Qualcomm QCS610), se puede analizar el flujo de video en el borde y enviar alertas solo cuando se detectan intrusiones, reduciendo el ancho de banda y los costos de almacenamiento.

- Asistente de accesibilidad para personas con discapacidad visual: una app que usa la cámara del teléfono para identificar objetos del entorno (sillas, mesas, puertas) y proporcionar retroalimentación por voz. La variante FP32 a 640×640 ofrece mayor precisión para entornos interiores complejos, y el modelo puede ejecutarse en un smartphone moderno con GPU.

- Prototipado de sistemas de detección en investigación: el repositorio sirve como punto de partida para comparar el rendimiento de FP32 frente a INT8 en diferentes hardware, o para experimentar con delegados de TensorFlow Lite. Su estructura clara y los hashes verificados facilitan la reproducibilidad en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión (mAP, IoU) ni mediciones de latencia en dispositivos concretos. La model card indica explícitamente que no se realizan afirmaciones de rendimiento en QCS8550. Para evaluar el modelo, el usuario debería ejecutar sus propias pruebas con el conjunto de datos COCO o un dataset propio.

## Requisitos de hardware

- Memoria: el modelo FP32 ocupa ~29 MB en disco; el modelo INT8 ~7,7 MB. En tiempo de inferencia, la memoria necesaria depende del runtime de TensorFlow Lite, pero es del orden de decenas de MB, muy inferior a los requisitos de un modelo de visión en PyTorch.
- GPU: no es imprescindible. Puede ejecutarse en CPU con XNNPACK o en GPU móvil mediante delegado GPU de TensorFlow Lite. En PC, cualquier GPU moderna es suficiente, pero no se aprovecha al máximo.
- CPU: funciona en cualquier CPU con soporte para operaciones TFLite. Para tiempo real en CPU, se recomienda la variante INT8 a 320×320.
- Aceleradores dedicados: soporta NNAPI en Android y el delegado QNN HTP para Qualcomm Hexagon. También es compatible con Coral Edge TPU mediante conversión adicional (no incluida).
- Opciones de despliegue: TensorFlow Lite Runtime (Python, C++, Java), LiteRT (anteriormente TFLite), Android Interpreter, QNN delegate para Qualcomm. No se mencionan vLLM, llama.cpp u Ollama porque no son aplicables a modelos de visión.
- Latencia estimada: no disponible. Depende del hardware y de la resolución. En un SoC móvil de gama media (p. ej., Snapdragon 7-series), la variante INT8 a 320×320 podría alcanzar decenas de FPS, pero esto es una estimación no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Resolucion | Precision | Licencia | Uso |
|---|---|---|---|---|---|---|
| `anan19990108/yolov5s_tflite` | TFLite | ~7,2 M (no confirmado) | 320/640 | FP32/INT8 | AGPL-3.0 | Edge, Android, QNN |
| Ultralytics/YOLOv5s (original) | PyTorch | ~7,2 M | Variable | FP32 | AGPL-3.0 | Entrenamiento, investigación |
| Ultralytics/YOLOv8n | PyTorch | ~3,2 M | Variable | FP32 | AGPL-3.0 | Detección ligera, exportable a TFLite |
| MediaPipe Object Detector (EfficientDet-Lite) | TFLite | ~4,3 M | Variable | INT8 | Apache 2.0 | Móvil, producción |

La comparativa muestra que este repositorio ofrece una ventaja específica: la integración con Qualcomm QNN HTP y la verificación de tensores, algo que no viene de serie en los modelos de Ultralytics. Sin embargo, YOLOv8n es más ligero y puede exportarse a TFLite con herramientas oficiales. El modelo de MediaPipe tiene licencia más permisiva (Apache 2.0) y está optimizado para móviles, aunque no es YOLO.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial o integración en un servicio cerrado requiere considerar la licencia AGPL, que obliga a divulgar el código fuente si se ofrece como servicio en red. Ultralytics ofrece una licencia comercial separada; el autor del repositorio no la otorga.
- Sin post-procesado: el modelo solo produce las cabezas de detección crudas. El usuario debe implementar la decodificación de anclas, filtrado de confianza y NMS, lo que añade complejidad al pipeline.
- Cuantización no completa: las variantes INT8 tienen entradas UINT8 y salidas FP32, y algunos tensores internos pueden no estar cuantizados. Esto puede limitar la aceleración en hardware que espera modelos totalmente cuantizados.
- Sin benchmarks de precisión: no se ha verificado la pérdida de mAP tras la cuantización. Es posible que la variante INT8 tenga una precisión inferior a la FP32, especialmente en objetos pequeños.
- Sesgos del conjunto COCO: el modelo hereda los sesgos del dataset COCO, que está dominado por imágenes de contextos occidentales y puede tener un rendimiento deficiente en escenarios no representados (por ejemplo, objetos específicos de otras culturas o condiciones de iluminación extremas).
- Riesgo de alucinación en detección: como todo detector, puede producir falsos positivos o no detectar objetos en condiciones adversas (oclusión, desenfoque, iluminación baja). No debe usarse en aplicaciones de seguridad crítica sin validación adicional.
- Sin soporte de contexto largo ni lenguaje: es un modelo de visión, no un LLM. No admite instrucciones de texto ni razonamiento multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anan19990108/yolov5s_tflite
- Árbol de archivos: https://huggingface.co/anan19990108/yolov5s_tflite/tree/main
- Proyecto YOLOv5 de Ultralytics (base): https://github.com/ultralytics/yolov5
- Guía de conversión a TFLite de MediaTek (referencia externa): https://genio.mediatek.com/doc/iot-aihub/ai_hub/model_zoo/litert_analytical/YOLOv5s.html
- Ejemplo de YOLOv5 TFLite en GitHub (neso613): https://github.com/neso613/yolo-v5-tflite-model
