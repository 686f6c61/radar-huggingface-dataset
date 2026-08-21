# Mustafa5645344/insect-detection-yolov8

## Resumen

El modelo `insect-detection-yolov8` es un detector de objetos basado en YOLOv8m (variante media) fine-tuneado por Mustafa5645344 para la detección en tiempo real de plagas de insectos en entornos agrícolas. El autor lo ha entrenado sobre 50.000 imágenes aumentadas procedentes del dataset de Roboflow `specifly-3-rwm7i`, que incluye 18 clases de insectos comunes en campos e invernaderos. El modelo está pensado para integrarse en sistemas de monitorización de plagas, trampas inteligentes y aplicaciones de agricultura de precisión.

La relevancia de este modelo radica en su equilibrio entre precisión y velocidad: alcanza un mAP@50 de 85,72 % con una latencia de inferencia de 1,5 ms por imagen en una NVIDIA A100, lo que lo hace adecuado para despliegues en tiempo real. Al estar licenciado bajo MIT y basado en el ecosistema Ultralytics, su integración en pipelines existentes es directa. Sin embargo, hay que señalar que el repositorio de HuggingFace no contiene los pesos del modelo (el tamaño del repo es 0,0 GB), por lo que el acceso a los pesos reales no está confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (CNN de una etapa con backbone CSPDarknet y cabeza PAN-FPN) |
| Parametros totales | 23,23 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas de Ultralytics, pero no se documenta) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), se menciona `best.pt` pero no se confirma su presencia en el repo |

## Arquitectura y entrenamiento

YOLOv8m es un detector de objetos de una sola etapa basado en redes neuronales convolucionales. Su backbone emplea una variante de CSPDarknet con conexiones residuales, y la cabeza de detección utiliza una estructura PAN-FPN para fusionar características multiescala. El modelo fue fine-tuneado con el framework Ultralytics YOLOv8 (v8.3.0) sobre el dataset aumentado `specifly-3-rwm7i` de Roboflow, que contiene 50.000 imágenes agrícolas. El entrenamiento se realizó durante 50 épocas con un tamaño de lote de 56, resolución de 640×640 píxeles, optimizador AdamW con tasa de aprendizaje inicial de 0,0008 y decaimiento coseno hasta 0,00008. Se utilizó una NVIDIA A100-SXM4-40GB como hardware de entrenamiento. No se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a modelos de detección de objetos.

## Capacidades

- Detección de objetos en tiempo real: localiza y clasifica insectos en imágenes con una latencia de 1,5 ms por imagen en GPU de gama alta.
- Reconocimiento de 18 clases de insectos: taladro del tallo, saltahojas, mariquita, libélula, mariposa, gorgojo, chinche del arroz, abejas, grillo topo, saltamontes, saltahojas de plantas, araña, hormiga, cigarra, oruga, chinche apestosa, pulgón y mantis.
- Inferencia a alta velocidad: el autor reporta más de 400 FPS en NVIDIA A100, lo que permite procesamiento en streaming.
- Integración con el ecosistema Ultralytics: compatible con la API de Python y la CLI de YOLOv8, así como con herramientas de exportación a otros formatos (ONNX, TensorRT, etc.).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Monitorización de plagas en campos agrícolas: el modelo puede desplegarse en cámaras fijas o drones para detectar y contar insectos en tiempo real, permitiendo a los agricultores tomar decisiones informadas sobre tratamientos fitosanitarios.
- Trampas inteligentes para insectos: integrado en dispositivos de captura con cámara, el modelo identifica las especies capturadas y envía alertas automáticas cuando se superan umbrales de población.
- Agricultura de precisión: combinado con sistemas de riego o pulverización, el detector puede activar tratamientos localizados solo cuando se detecta una plaga, reduciendo el uso de pesticidas.
- Investigación entomológica: los investigadores pueden usar el modelo para automatizar el conteo y clasificación de especímenes en imágenes de campo o de laboratorio, acelerando el análisis de biodiversidad.
- Control de calidad en invernaderos: el modelo puede vigilar cultivos protegidos y detectar infestaciones tempranas, especialmente de pulgones y orugas, que suelen pasar desapercibidas.
- Educación y divulgación: aplicaciones didácticas que identifican insectos a partir de fotografías tomadas con el móvil, ayudando a estudiantes y agricultores a reconocer especies beneficiosas y perjudiciales.

## Benchmarks y rendimiento

Los resultados de validación reportados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mAP@50 (pico) | 85,72 % |
| mAP@50 (validacion) | 85,40 % |
| mAP@50-95 | 51,87 % |
| Precision | 83,46 % |
| Recall | 85,86 % |
| F1-Score | 82,40 % |
| Velocidad de inferencia | 1,5 ms/imagen (~400+ FPS en A100) |

Desglose por clase (mAP@50 en validacion):

| Clase | Precision | Recall | mAP@50 | mAP@50-95 |
|---|---|---|---|---|
| stem_borer | 0,957 | 0,978 | 0,992 | 0,794 |
| leafhopper | 0,942 | 0,949 | 0,976 | 0,681 |
| ladybug | 0,954 | 0,977 | 0,976 | 0,622 |
| dragonfly | 0,903 | 0,944 | 0,959 | 0,662 |
| butterfly | 0,915 | 0,918 | 0,950 | 0,629 |
| weevil | 0,889 | 0,934 | 0,946 | 0,521 |
| rice_bug | 0,931 | 0,916 | 0,937 | 0,595 |
| bees | 0,887 | 0,915 | 0,920 | 0,551 |
| mole_cricket | 0,882 | 0,854 | 0,890 | 0,471 |
| grasshopper | 0,882 | 0,852 | 0,885 | 0,510 |
| planthopper | 0,815 | 0,855 | 0,872 | 0,471 |
| spider | 0,767 | 0,821 | 0,858 | 0,572 |
| ant | 0,733 | 0,761 | 0,813 | 0,373 |
| cicada | 0,808 | 0,744 | 0,797 | 0,423 |
| caterpillar | 0,853 | 0,716 | 0,791 | 0,400 |
| stink_bug | 0,727 | 0,724 | 0,777 | 0,535 |
| aphid | 0,686 | 0,632 | 0,669 | 0,332 |
| mantis | 0,493 | 0,206 | 0,361 | 0,202 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 23,23 M de parametros y 67,9 GFLOPs. En FP32, el peso ocupa aproximadamente 93 MB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM. Con cuantizacion INT8, el requisito baja a unos 25 MB.
- GPU recomendadas: el autor uso una NVIDIA A100 para entrenamiento. Para inferencia en tiempo real, una RTX 3060 o superior es suficiente; en edge devices como Jetson Nano o Raspberry Pi con acelerador Coral, se puede ejecutar con cuantizacion.
- Compatibilidad con GPU de consumo: si, cualquier GPU NVIDIA con soporte CUDA (GTX 10xx o superior) puede ejecutar el modelo sin problemas.
- Opciones de despliegue: Ultralytics YOLOv8 (Python y CLI), exportacion a ONNX, TensorRT, CoreML, TFLite y formatos para edge. Tambien es compatible con servidores de inferencia como Triton o TorchServe.
- Latencia y throughput: 1,5 ms por imagen en A100 (~400 FPS). En una GPU de consumo como RTX 3080, se espera una latencia de 3-5 ms por imagen, y en CPU (por ejemplo, un i7 moderno) alrededor de 50-100 ms por imagen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de deteccion de insectos en la informacion proporcionada. Como referencia generica, se pueden considerar otras variantes de YOLOv8 (n, s, l, x) que difieren en tamano y velocidad, pero no se han evaluado en el mismo dataset. El modelo `Yolov8_InsectDetect` de CamThink (mencionado en la busqueda web) es un YOLOv8n para deteccion de insectos con licencia Apache-2.0, pero no se aportan metricas comparables. Por tanto, la comparativa directa no esta disponible.

## Limitaciones y advertencias

- El repositorio de HuggingFace no contiene los pesos del modelo (tamano del repo: 0,0 GB). El codigo de ejemplo descarga `best.pt`, pero no se confirma que el archivo exista realmente en el repositorio. Es posible que el autor no haya subido los pesos.
- El rendimiento por clase es muy desigual: la clase `mantis` tiene un mAP@50 de solo 0,361, y `aphid` de 0,669, lo que indica problemas de deteccion en clases con pocas instancias o alta variabilidad.
- El dataset de entrenamiento proviene de una unica fuente (Roboflow `specifly-3-rwm7i`), por lo que el modelo puede no generalizar bien a otros entornos, condiciones de iluminacion o especies no representadas.
- No se documentan sesgos especificos, pero es probable que el modelo tenga dificultades con insectos pequenos o camuflados, como pulgones, y con imagenes de baja resolucion.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre la calidad del modelo ni sobre la procedencia de los datos de entrenamiento.
- No se proporcionan instrucciones de entrenamiento reproducibles completas (no se indica el split exacto de train/val, ni el numero de imagenes por clase en el conjunto de validacion).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mustafa5645344/insect-detection-yolov8
- Proyecto similar en GitHub (deteccion de insectos con YOLOv8): https://github.com/shruthiprem4/insect-detection-using-yolo-v8
- Modelo YOLOv8n para deteccion de insectos en CamThink: https://www.camthink.ai/developer-center/models/yolov8-insectdetect/
- Articulo cientifico sobre YOLOv8x optimizado para plagas (Nature): https://www.nature.com/articles/s41598-025-97825-3
- Modelos YOLOv8 de Ultralytics: https://platform.ultralytics.com/ultralytics/yolov8
