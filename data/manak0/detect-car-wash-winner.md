# manak0/Detect-car-wash-winner

## Resumen

El modelo `manak0/Detect-car-wash-winner` es un detector de objetos basado en YOLO, publicado como resultado ganador de un concurso de minería de modelos en la plataforma ScoreVision. El autor, `manak0`, ha convertido el modelo ganador en un elemento de biblioteca reutilizable, con runtime ONNX para su integración en aplicaciones de visión por computador. Está especializado en la detección de cuatro clases de objetos relacionadas con el entorno de un lavadero de coches: escoba (`broom`), rejilla de drenaje (`drainage gate`), boquilla (`nozzle`) y pista o carril (`track`).

El modelo se distribuye en formato ONNX, con un tamaño de repositorio de 0.6 GB y un peso del archivo de aproximadamente 9.78 MB según la nota de la model card. Aunque no se especifica la arquitectura exacta, el tag `yolov11-nano` presente en el repositorio hermano `manak0/Detect-car-wash` sugiere que se trata de una variante YOLOv11 nano, optimizada para inferencia ligera. La relevancia de este modelo radica en su aplicación directa en sistemas de automatización y supervisión de lavaderos de vehículos, donde la detección precisa de estos elementos permite controlar procesos de limpieza, mantenimiento y seguridad.

La información pública es escasa: no se indican parámetros totales, licencia, idiomas soportados ni datos de entrenamiento. Sin embargo, al tratarse de un modelo de detección de objetos, su uso principal es la inferencia sobre imágenes o vídeo, y su formato ONNX facilita su despliegue en entornos de producción con frameworks como ONNX Runtime.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11 nano (según tag del repositorio hermano, no confirmado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX, posiblemente FP32 o FP16) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (runtime `onnxruntime`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es presumiblemente una red neuronal convolucional basada en YOLO (You Only Look Once), concretamente la variante YOLOv11 nano según los tags del repositorio asociado. YOLO es una familia de detectores de una sola pasada que divide la imagen en una cuadrícula y predice cajas delimitadoras y probabilidades de clase directamente, ofreciendo un equilibrio entre velocidad y precisión. La versión nano está diseñada para ser ligera y ejecutarse en dispositivos con recursos limitados.

Los detalles de entrenamiento no se han publicado. La model card indica que el modelo proviene de un repositorio ganador (`yevheniiapopova/ScoreVisionRoadSign` o `Cargile/carwash1` según las fuentes), y que fue convertido a un elemento de biblioteca por `manak0`. No se dispone de información sobre el dataset de entrenamiento, el número de épocas, ni si se aplicaron técnicas como aumento de datos o preentrenamiento. El formato de salida es un modelo ONNX, lo que sugiere que el entrenamiento original se realizó con PyTorch o Ultralytics y posteriormente se exportó a ONNX para su distribución.

## Capacidades

- Detección de objetos en imágenes: identifica y localiza escobas, rejillas de drenaje, boquillas y pistas/carriles dentro de una imagen.
- Inferencia en tiempo real: al ser un modelo YOLO nano, puede procesar vídeo a velocidades adecuadas para aplicaciones en directo, aunque no se especifican FPS concretos.
- Compatibilidad con ONNX Runtime: puede ejecutarse en múltiples plataformas (CPU, GPU, edge devices) mediante el runtime de ONNX.
- Integración en pipelines de visión: al ser un elemento de biblioteca, puede combinarse con otros módulos de detección o seguimiento.
- No soporta procesamiento de texto, audio ni razonamiento multimodal; es exclusivamente un modelo de detección visual.

## Casos de uso

- Automatización de lavaderos de coches: el modelo puede integrarse en un sistema de cámaras para detectar si una escoba, una boquilla o una rejilla de drenaje están en la posición correcta durante el ciclo de lavado, permitiendo alertas o ajustes automáticos.
- Control de calidad en instalaciones de lavado: supervisión de que las rejillas de drenaje no estén obstruidas o que las boquillas de agua estén operativas, mediante detección visual periódica.
- Mantenimiento predictivo: al detectar la presencia o ausencia de estos objetos, se pueden generar órdenes de mantenimiento cuando un elemento no se encuentra en su ubicación esperada.
- Seguridad en zonas de lavado: identificación de objetos abandonados (escobas, boquillas) en áreas de paso para evitar accidentes.
- Inventario automatizado: conteo de escobas o boquillas almacenadas en un inventario mediante análisis de imágenes de estanterías.
- Investigación académica: como modelo de referencia para tareas de detección de objetos en dominios específicos (objetos de limpieza), útil para comparar arquitecturas YOLO en escenarios de pocas clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una métrica `E=0.06135768 (map50=0.600000, size_mb=9.778727)`, que sugiere un mAP50 de 0.6 sobre el conjunto de validación del concurso, pero no se detalla el dataset ni se comparan con otros modelos. No hay datos adicionales de rendimiento (latencia, throughput, precisión por clase) en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo YOLO nano (~10 MB de pesos), la inferencia puede ejecutarse en CPU con bajo consumo de memoria, o en GPU con menos de 1 GB de VRAM si se usa FP16.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (GTX 10xx o superior) es suficiente; también funciona en iGPUs mediante ONNX Runtime con ejecución CPU.
- Compatibilidad con hardware de consumo: sí, cabe en Raspberry Pi (con limitaciones de FPS) y en la mayoría de portátiles con CPU moderna.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), también puede convertirse a TensorRT para aceleración en NVIDIA, o a OpenVINO para Intel.
- Latencia y throughput: no disponibles; en una CPU moderna se puede esperar entre 10-30 ms por imagen para una resolución de 640x640, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un detector YOLO nano específico para cuatro clases, y no se han publicado resultados frente a otros detectores como YOLOv8, SSD o Faster R-CNN en el mismo dominio. Se puede indicar que, por su naturaleza, es comparable a otros modelos YOLO nano en cuanto a tamaño y velocidad, pero sin datos de rendimiento no es posible realizar una tabla comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo entrenado para un dominio muy específico (lavaderos de coches), su rendimiento en otros contextos será deficiente.
- Riesgo de alucinación: en detección de objetos, el riesgo de falsos positivos o negativos depende del umbral de confianza configurado; no se han reportado tasas de error.
- Limitaciones de contexto: solo detecta las cuatro clases definidas; no reconoce otros objetos ni escenas generales.
- Restricciones de licencia: la licencia no está especificada, por lo que se desconoce si es de uso libre o restringido para fines comerciales.
- Caveat para producción: la ausencia de documentación sobre el dataset de entrenamiento y las métricas de validación dificulta evaluar su robustez. Se recomienda validar exhaustivamente en el entorno real antes de desplegarlo.

## Enlaces

- [HuggingFace - manak0/Detect-car-wash-winner](https://huggingface.co/manak0/Detect-car-wash-winner)
- [HuggingFace - manak0/Detect-car-wash (repositorio hermano)](https://huggingface.co/manak0/Detect-car-wash)
- [ScoreVision Dashboard - manak0/Detect-car-wash](https://console.scorevision.io/elements/manak0%2FDetect-car-wash)
- [Repositorio fuente original (yevheniiapopova/ScoreVisionRoadSign)](https://huggingface.co/yevheniiapopova/ScoreVisionRoadSign) (referenciado en la model card)
- [Repositorio fuente alternativo (Cargile/carwash1)](https://huggingface.co/Cargile/carwash1) (mencionado en resultados de búsqueda)
