# hugging-mac/yolov8-seg-coreml

## Resumen

El repositorio `hugging-mac/yolov8-seg-coreml` ofrece conversiones listas para usar del modelo YOLOv8 Seg de Ultralytics, especializado en detección de objetos y segmentación de instancias, en formato Core ML para su ejecución en dispositivos Apple Silicon (CPU, GPU y Neural Engine). El autor, bajo el perfil `hugging-mac`, publica tres variantes del modelo (`n`, `s` y `m`) como paquetes `.mlpackage`, pensadas para alimentar aplicaciones de visión por computador locales en macOS, como las desarrolladas en la plataforma Hugging Mac.

La relevancia de este modelo radica en su integración nativa con el ecosistema Apple: al estar convertido a Core ML, aprovecha el acelerador neuronal (ANE) y la GPU integrada de los chips M1/M2/M3, ofreciendo inferencia de baja latencia sin necesidad de conexión a la nube. La arquitectura subyacente es la de YOLOv8, un detector de una sola etapa basado en CNN que incorpora una cabeza de segmentación para generar máscaras de instancia a partir de coeficientes y prototipos. La entrada está fijada a 640×640 píxeles, con precisión FP16 y sin NMS embebido, por lo que el postprocesado debe realizarse externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 Seg (CNN de una sola etapa con cabeza de segmentación) |
| Parametros totales | No disponible (las variantes `n`, `s` y `m` tienen tamaños de paquete de 7.0 MB, 23.8 MB y 54.8 MB respectivamente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen fija 640×640) |
| Tipos de cuantizacion | FP16 (conversión a Core ML) |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | AGPL-3.0 (hereda la licencia de Ultralytics) |
| Formato de pesos | `.mlpackage` (Core ML) |

## Arquitectura y entrenamiento

El modelo base es YOLOv8 Seg de Ultralytics, un detector de una sola etapa que combina un backbone CSPDarknet con una cabeza de detección y una rama de segmentación. La rama de segmentación produce dos salidas: un tensor de coeficientes de máscara (`1 × 116 × 8400` donde 116 = 4 coordenadas de caja + 80 clases + 32 coeficientes) y un tensor de prototipos de máscara (`1 × 32 × 160 × 160`). Las máscaras de instancia se reconstruyen combinando ambos tensores mediante una operación de producto matricial y posterior aplicación de NMS y umbralizado.

El entrenamiento original se realizó sobre el conjunto de datos COCO con 80 clases, tal como se indica en la procedencia (assets de Ultralytics v8.2.0). La conversión a Core ML se hizo con `coremltools`, fijando la entrada a 640×640 píxeles y batch size 1, y utilizando precisión FP16. No se incluye NMS en el modelo convertido; el autor recomienda aplicar filtrado de confianza y NMS después de la inferencia. El repositorio proporciona checksums SHA-256 para verificar la integridad de cada paquete.

## Capacidades

- Detección de objetos y segmentación de instancias en imágenes, con 80 clases del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Inferencia en tiempo real en dispositivos Apple Silicon gracias a la ejecución en CPU, GPU y Neural Engine mediante Core ML.
- Salida de cajas delimitadoras, puntuaciones de clase y coeficientes de máscara, más prototipos de máscara para reconstrucción de segmentaciones.
- Entrada de imagen RGB fija de 640×640 píxeles, con letterboxing recomendado para mantener la relación de aspecto.
- No incluye NMS embebido; el postprocesado (filtrado, NMS, reconstrucción de máscaras y restauración de coordenadas) debe implementarse externamente, como se muestra en el SDK de Hugging Mac.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural; es exclusivamente un modelo de visión.

## Casos de uso

- **Aplicaciones de visión por computador en macOS**: el modelo puede integrarse en apps nativas de macOS para tareas como conteo de objetos, detección de anomalías o análisis de imágenes médicas, aprovechando la baja latencia del Neural Engine.
- **Edición de imágenes y vídeo**: la segmentación de instancias permite separar objetos del fondo para aplicar efectos, recortes o reemplazo de escenas en herramientas de edición locales.
- **Sistemas de vigilancia y seguridad**: detección y segmentación de personas o vehículos en tiempo real a partir de cámaras conectadas a un Mac, con procesamiento totalmente local para preservar la privacidad.
- **Robótica y automatización**: el modelo puede servir como módulo de percepción en robots o drones controlados desde un Mac, identificando y segmentando obstáculos u objetos de interés.
- **Asistentes de accesibilidad**: descripción de escenas para personas con discapacidad visual, generando máscaras de objetos que pueden convertirse en información de audio.
- **Investigación y prototipado**: al ser un modelo ligero (variante `n` de solo 7 MB), es ideal para experimentar con segmentación de instancias en entornos académicos o de desarrollo sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión (mAP, IoU) ni comparativas con otros modelos. Se recomienda consultar la documentación de Ultralytics para los resultados del modelo YOLOv8 original, aunque la conversión a Core ML puede introducir ligeras variaciones debidas a la cuantización FP16.

## Requisitos de hardware

- Diseñado para dispositivos Apple Silicon (M1, M2, M3 y posteriores). Los paquetes `.mlpackage` se ejecutan en CPU, GPU y Neural Engine mediante Core ML.
- Tamaños de paquete reducidos: 7.0 MB (variante `n`), 23.8 MB (`s`) y 54.8 MB (`m`), lo que permite su uso en entornos con almacenamiento limitado.
- No se requieren GPUs externas; la inferencia se acelera con el Neural Engine integrado en los chips Apple.
- No se dispone de datos de VRAM, latencia o throughput específicos. Al ser un modelo de visión con entrada fija 640×640, la latencia típica en Apple Silicon es de decenas de milisegundos, pero no se confirma en la documentación.
- Para el postprocesado (NMS, reconstrucción de máscaras) se recomienda usar el SDK de Hugging Mac, que ya implementa estos pasos de forma optimizada.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño (variante pequeña) | Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| `hugging-mac/yolov8-seg-coreml` | Core ML (.mlpackage) | 7.0 MB (`n`) | 640×640 | AGPL-3.0 | Conversión directa de YOLOv8 Seg, sin NMS embebido |
| `Ultralytics/YOLOv8` (original) | PyTorch, ONNX, etc. | ~6 MB (pesos `n`) | Variable (típicamente 640) | AGPL-3.0 | Modelo original con soporte de entrenamiento y exportación a múltiples formatos |
| `TheCluster/YOLOv8-CoreML` | Core ML | No disponible | No disponible | No disponible | Otra conversión de YOLOv8 a Core ML, sin detalles adicionales |

La comparativa se limita a la información pública encontrada. No se dispone de datos de rendimiento (mAP, FPS) para establecer una comparación cuantitativa. La principal diferencia con el modelo original es el formato Core ML, que facilita su uso en apps de Apple, pero requiere un paso de conversión adicional si se desea modificar el modelo.

## Limitaciones y advertencias

- **Licencia AGPL-3.0**: la licencia heredada de Ultralytics impone restricciones para uso comercial en productos cerrados o de código no abierto. Es obligatorio revisar los términos de Ultralytics antes de utilizarlo en producción.
- **NMS no incluido**: el modelo devuelve salidas brutas; sin un postprocesado adecuado (filtrado de confianza, NMS y reconstrucción de máscaras), los resultados serán inutilizables. El autor proporciona un SDK de referencia, pero su integración requiere desarrollo adicional.
- **Entrada fija**: la resolución de entrada está fijada a 640×640 píxeles, lo que puede degradar el rendimiento en imágenes de alta resolución si no se aplica letterboxing correctamente.
- **Precisión FP16**: la conversión a FP16 puede reducir ligeramente la precisión en comparación con el modelo original en FP32, especialmente en objetos pequeños o con bajo contraste.
- **Sesgos y alucinaciones**: al ser un modelo entrenado en COCO, puede presentar sesgos en clases subrepresentadas o en contextos no cubiertos por el dataset. No se dispone de información específica sobre sesgos en esta conversión.
- **Sin soporte multi-idioma**: al ser un modelo de visión, no procesa texto ni tiene capacidades multilingües.
- **Dependencia del ecosistema Apple**: el formato `.mlpackage` solo es ejecutable en plataformas Apple (macOS, iOS, iPadOS), lo que limita su portabilidad a otros sistemas.

## Enlaces

- [Repositorio HuggingFace: hugging-mac/yolov8-seg-coreml](https://huggingface.co/hugging-mac/yolov8-seg-coreml)
- [Hugging Mac (plataforma y SDK)](https://github.com/devilyouwei/hugging-mac)
- [SDK de YOLOv8 Seg en Hugging Mac](https://github.com/devilyouwei/hugging-mac/tree/main/packages/hugging_mac_sdk/src/hugging_mac_sdk/models/yolov8_seg)
- [Ultralytics YOLOv8 (modelo original)](https://github.com/ultralytics/yolov8)
- [Assets de Ultralytics v8.2.0](https://github.com/ultralytics/assets/releases/tag/v8.2.0)
- [Conversión alternativa: TheCluster/YOLOv8-CoreML](https://huggingface.co/TheCluster/YOLOv8-CoreML)
- [Roboflow: ultralytics-yolov8-seg-coreml-nms](https://github.com/roboflow/ultralytics-yolov8-seg-coreml-nms)
- [YOLOv8-Segmentation en Qualcomm AI Hub](https://aihub.qualcomm.com/models/yolov8_seg)
