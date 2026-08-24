# MKSHRESTHA/rtdetr-l_carparts-seg

## Resumen

El modelo `MKSHRESTHA/rtdetr-l_carparts-seg` es un detector de objetos basado en la arquitectura RT-DETR-L, afinado para reconocer 23 clases de piezas de automóvil a partir de imágenes o vídeo. El autor, MKSHRESTHA, ha exportado el modelo al formato ONNX (`best.onnx`) para facilitar su despliegue en entornos de inferencia con `onnxruntime`, tanto en CPU como en GPU. El modelo resuelve el problema de la detección de componentes de vehículos (paragolpes, puertas, faros, espejos, capó, ruedas, etc.) y es relevante para aplicaciones de visión artificial en el sector automotriz, como inspección de daños, control de calidad o inventario de piezas.

La arquitectura RT-DETR-L (Real-Time Detection Transformer) combina un encoder de visión con un decodificador basado en transformers, optimizado para lograr una detección en tiempo real con alta precisión. El modelo está fijado a una resolución de entrada de 640x640 píxeles y el repositorio incluye un script de inferencia que permite procesar imágenes, vídeos, carpetas o una cámara web. Aunque no se especifican los parámetros exactos ni la licencia, el tamaño del repositorio (0.1 GB) sugiere un modelo ligero y adecuado para despliegues en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETR-L (Real-Time Detection Transformer) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (tarea de detección de imágenes) |
| Tipos de cuantización | no disponible (el archivo ONNX puede tener precisión FP32 o FP16, no se indica) |
| Idiomas soportados | no aplica (modelo visual) |
| Licencia | no disponible |
| Formato de pesos | ONNX (archivo `best.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en RT-DETR-L, un detector de objetos que emplea un encoder de visión basado en transformers y un decodificador de detección sin anclas (anchor-free). A diferencia de los detectores convolucionales clásicos, RT-DETR utiliza un mecanismo de atención para predecir directamente las cajas delimitadoras y las clases, lo que permite una inferencia más rápida y una mejor precisión en escenarios con objetos superpuestos. El modelo ha sido afinado con un conjunto de datos de piezas de coche (Carparts Seg Dataset) que contiene imágenes de vehículos a nivel de calle con anotaciones de 23 componentes. No se dispone de información sobre el número de tokens de entrenamiento, el tipo de optimización (RLHF, DPO, etc.) ni otras innovaciones técnicas adicionales en el repositorio.

## Capacidades

- Detección de objetos en imágenes y vídeo con 23 clases de piezas de coche: paragolpes (trasero y delantero), puertas (traseras, delanteras, laterales), cristales, luces (traseras, delanteras, laterales), espejos, capó, portón trasero, maletero, ruedas, y una clase genérica "objeto".
- Inferencia en tiempo real gracias a la arquitectura RT-DETR, optimizada para velocidad sin sacrificar precisión.
- Soporte para procesamiento de vídeo y webcam mediante el script `infer.py` incluido en el repositorio.
- Funciona con `onnxruntime` en CPU y con `onnxruntime-gpu` en entornos con CUDA.
- Permite ajustar el umbral de confianza y el valor de IoU para NMS (supresión de no-máximos) para adaptar la salida a las necesidades de la aplicación.
- El modelo está exportado a ONNX, lo que facilita su integración en pipelines de producción y su despliegue en plataformas como ONNX Runtime, TensorRT o OpenVINO.

## Casos de uso

- Inspección de daños en vehículos: el modelo puede identificar y localizar piezas afectadas en fotos de accidentes, permitiendo a las aseguradoras o talleres evaluar el alcance de los daños de forma automatizada.
- Control de calidad en fabricación: en líneas de montaje, el modelo detecta si las piezas están presentes o correctamente posicionadas, ayudando a reducir errores y tiempos de inspección.
- Inventario de piezas en concesionarios o almacenes: mediante fotografías de estanterías o vehículos, el modelo puede enumerar y clasificar los componentes disponibles.
- Asistencia a la reparación de vehículos: los técnicos pueden capturar una imagen del coche y obtener una lista de las piezas visibles, agilizando el diagnóstico y la solicitud de repuestos.
- Análisis de tráfico y seguridad vial: el modelo puede detectar partes específicas de vehículos en imágenes de cámaras de tráfico para estudios de comportamiento o identificación de vehículos.
- Automatización de procesos de desmontaje en desguaces: al detectar piezas concretas en un vehículo, se puede planificar el desmontaje y el reciclaje de componentes de forma eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como mAP, precisión o velocidad de inferencia para este modelo afinado. La model card únicamente indica que las puntuaciones de confianza del modelo son bajas (máximo típico ≈ 0.16) y que el umbral de confianza debe ajustarse a 0.1 o incluso 0.05, lo que es una característica de calibración de DETR y no un indicador de baja calidad.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 0.1 GB (100 MB) en formato ONNX, lo que lo hace adecuado para entornos con memoria limitada.
- CPU: funciona con `onnxruntime` en CPU; es recomendable un procesador moderno con al menos 4 núcleos para una velocidad de inferencia razonable.
- GPU: con `onnxruntime-gpu` se puede acelerar la inferencia en GPUs NVIDIA con CUDA. Cualquier GPU con al menos 2 GB de VRAM debería ser suficiente, pero no se proporcionan requisitos específicos.
- El modelo es ligero y puede ejecutarse en hardware de consumo, como una NVIDIA GTX 1650 o una RTX 3060, sin problemas.
- Opciones de despliegue: `onnxruntime` (CPU/GPU), `onnxruntime-gpu` para CUDA, y se puede integrar en frameworks como OpenCV, TensorRT o ONNX Runtime Web.
- Latencia y throughput: no se han publicado estimaciones oficiales. Para un modelo de este tamaño, se espera una inferencia en el orden de decenas de milisegundos en GPU, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|--------|--------------|------------|----------|----------|----------------|
| RT-DETR-L (original) | Transformer detector | ~32M (aprox.) | no aplica | Apache-2.0 | Ultralytics |
| YOLOv8 (variantes) | CNN (anchor-free) | 3.2M - 68M | no aplica | AGPL-3.0 | Ultralytics |
| DETR (original) | Transformer | ~41M | no aplica | Apache-2.0 | Facebook Research |

No se dispone de datos de rendimiento comparativo para el modelo afinado de MKSHRESTHA. La comparación se limita a características generales de las arquitecturas; los resultados específicos no están publicados.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para detectar 23 clases específicas de piezas de coche; no reconoce otros objetos ni contextos fuera de ese dominio.
- Las puntuaciones de confianza son bajas (máximo típico ≈ 0.16), por lo que es necesario ajustar el umbral de confianza a valores inferiores a 0.25. Un umbral demasiado alto puede provocar que no se detecten objetos, mientras que un umbral demasiado bajo puede generar falsos positivos.
- No se ha publicado información sobre sesgos o posibles errores sistemáticos. El modelo puede fallar en condiciones de iluminación adversas, oclusiones o ángulos inusuales.
- La licencia no está especificada en el repositorio de HuggingFace, por lo que su uso comercial no está garantizado sin autorización del autor.
- El modelo está exportado a ONNX con una entrada fija de 640x640 píxeles; otras resoluciones se adaptan mediante letterboxing, lo que puede afectar la precisión en imágenes con proporciones muy diferentes.
- No se proporcionan datos sobre el proceso de entrenamiento (dataset exacto, número de épocas, etc.), lo que limita la capacidad de evaluar su robustez en producción.

## Enlaces

- [HuggingFace - MKSHRESTHA/rt-detr-l_carparts-seg](https://huggingface.co/MKSHRESTHA/rtdetr-l_carparts-seg)
- [Documentación de RT-DETR en Ultralytics](https://docs.ultralytics.com/models/rtdetr)
- [Carparts Seg Dataset (GitHub)](https://github.com/shreejalt/ultralytics-rtdetr-obb/blob/main/docs/en/datasets/segment/carparts-seg.md)
- [Carparts Seg Dataset en Ultralytics](https://platform.ultralytics.com/jesusgarza/datasets/carparts-seg)
- [Repositorio RT-DETR en GitHub](https://github.com/yhs-code/rt-detr/blob/main/docs/en/datasets/segment/carparts-seg.md)
