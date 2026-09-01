# shadow-cann/hispark-modelzoo-yolo26s

## Resumen

YOLO26s es un modelo de detección de objetos de tamaño pequeño perteneciente a la familia YOLO26 desarrollada por Ultralytics. Está diseñado para realizar detección en tiempo real en dispositivos de borde, ofreciendo un equilibrio entre precisión y eficiencia computacional. Este repositorio concreto, publicado por el usuario shadow-cann, actúa como un espejo del modelo dentro del ecosistema HiSilicon, con soporte específico para las NPU de la serie Hi3403V100 y el sistema operativo OpenHarmony.

El modelo cuenta con aproximadamente 9,5 millones de parámetros y una carga computacional de 23,25 GFLOPs para entradas de 640x640 píxeles. Se distribuye tanto en formato ONNX (modelo fuente) como en formato OM compilado para NPU de HiSilicon, con cuantizaciones A8W8 y FP16. Su relevancia actual radica en la creciente demanda de soluciones de visión por computador desplegables en hardware de bajo consumo, especialmente en el contexto de dispositivos IoT y sistemas embebidos basados en OpenHarmony.

La documentación oficial del modelo está en chino, y el repositorio incluye además un paquete de recursos adicionales para el entorno de desarrollo SVP_NNN. Aunque no se proporcionan detalles sobre el entrenamiento, el modelo hereda las capacidades de la familia YOLO26 de Ultralytics, que soporta múltiples tareas de visión, aunque esta variante específica se centra en la detección de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para deteccion de objetos (familia YOLO26) |
| Parametros totales | 9.538M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | A8W8, FP16 (en formato OM compilado para NPU) |
| Idiomas soportados | No aplica (modelo de vision); documentacion en chino |
| Licencia | No disponible en la ficha; referencia a la licencia de Ultralytics (https://github.com/ultralytics/ultralytics/blob/main/LICENSE) |
| Formato de pesos | ONNX (modelo fuente), OM (compilado para NPU HiSilicon) |

## Arquitectura y entrenamiento

La arquitectura exacta de YOLO26s no se detalla en la informacion proporcionada. Se sabe que pertenece a la familia YOLO26 de Ultralytics, que segun la documentacion oficial ofrece modelos unificados, en tiempo real y de extremo a extremo para diversas tareas de vision. Esta variante concreta esta optimizada para deteccion de objetos con una entrada de 640x640 píxeles.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens (al ser un modelo de vision no aplica), ni sobre el uso de tecnicas como RLHF o DPO. El modelo se distribuye compilado para la NPU Hi3403V100 de HiSilicon, lo que indica un proceso de cuantizacion y optimizacion especifico para ese hardware. El repositorio incluye tanto el modelo ONNX original como el modelo OM compilado, ademas de un paquete de recursos para el entorno de desarrollo SVP_NNN.

## Capacidades

- Deteccion de objetos en tiempo real: el modelo identifica y localiza objetos dentro de imagenes de 640x640 píxeles, con una carga computacional de 23,25 GFLOPs.
- Compatibilidad con hardware de borde: esta compilado para NPU de HiSilicon (Hi3403V100) y tambien puede ejecutarse mediante ONNX en otros entornos.
- Soporte para OpenHarmony y Linux: el modelo esta preparado para desplegarse en sistemas operativos embebidos y de proposito general.
- Integracion con el ecosistema Ultralytics: al ser parte de la familia YOLO26, hereda la capacidad de ser utilizado con las herramientas de entrenamiento e inferencia de Ultralytics.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, ni procesamiento de lenguaje natural, ya que es un modelo puramente visual.

## Casos de uso

- Vigilancia perimetral en instalaciones industriales: el modelo puede detectar intrusiones o movimientos anomalos en tiempo real, ejecutandose en camaras con NPU de HiSilicon gracias a su bajo consumo y su compilacion para ese hardware.
- Control de calidad en lineas de produccion: permite identificar defectos o piezas ausentes en imagenes de productos, con una latencia adecuada para procesos de fabricacion automatizados.
- Conteo de personas o vehiculos en espacios publicos: su tamano reducido y su eficiencia computacional lo hacen apto para desplegarse en dispositivos de borde que procesan video continuo.
- Robotica movil y navegacion autonoma: el modelo puede usarse para detectar obstaculos u objetos relevantes en el entorno, integrándose en sistemas embebidos con OpenHarmony.
- Inspeccion de infraestructuras: deteccion de grietas, corrosión o elementos danados en imagenes capturadas por drones o camaras fijas, con la posibilidad de ejecutarse en el propio dispositivo.
- Agricultura de precision: identificacion de frutos, plagas o malezas en imagenes de cultivos, aprovechando la portabilidad del modelo a hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como mAP, precision, recall ni comparaciones con otros modelos en la ficha del repositorio ni en los enlaces consultados.

## Requisitos de hardware

- El modelo esta compilado para la NPU Hi3403V100 de HiSilicon, en sus variantes SVP_NNN y NNN, lo que permite su ejecucion en dispositivos con ese chip.
- Tambien se distribuye en formato ONNX, por lo que puede ejecutarse en GPUs, CPUs o aceleradores que soporten este formato, aunque no se especifican requisitos minimos de VRAM o memoria.
- Dado su tamano (9,5M parametros) y su carga computacional (23,25 GFLOPs), es razonable esperar que quepa en GPUs de consumo como una RTX 3060 o superiores, pero no se dispone de datos confirmados.
- Para despliegue, se puede utilizar el runtime de ONNX (ONNX Runtime) o el entorno de compilacion de HiSilicon para el formato OM. No se mencionan herramientas como vLLM, llama.cpp u Ollama, que son tipicas de modelos de lenguaje.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos en la documentacion proporcionada. Aunque YOLO26s pertenece a la familia YOLO de Ultralytics, no se ofrecen datos de rendimiento frente a YOLOv8s, YOLOv9s u otras variantes. Se recomienda consultar la documentacion oficial de Ultralytics para obtener comparativas actualizadas.

## Limitaciones y advertencias

- La documentacion del repositorio esta exclusivamente en chino, lo que puede dificultar su uso por parte de desarrolladores que no dominen ese idioma.
- El modelo esta especializado en deteccion de objetos; no soporta otras tareas como segmentacion, clasificacion o estimacion de pose, aunque la familia YOLO26 en general si las ofrece.
- No se especifica el dataset de entrenamiento, por lo que se desconocen posibles sesgos en la deteccion de ciertas clases o condiciones de iluminacion.
- La licencia no esta claramente indicada en la ficha; la referencia apunta a la licencia de Ultralytics, que suele ser AGPL-3.0, pero no se confirma su aplicacion a este mirror concreto. Es necesario verificar los terminos antes de un uso comercial.
- El modelo esta optimizado para la NPU Hi3403V100; su rendimiento en otros hardware puede variar y no se garantiza la misma eficiencia.
- No se proporcionan garantias de soporte ni mantenimiento por parte del autor del mirror.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shadow-cann/hispark-modelzoo-yolo26s
- Portal de HiSilicon (ficha original): https://gitbubble.github.io/hisilicon-developer-portal-mirror/model-detail.html?id=kmrpc00gts00
- Repositorio upstream en GitCode: https://gitcode.com/HiSpark/modelzoo/blob/master/samples/samples_GPL/built-in/yolo26s
- Documentacion oficial de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Repositorio GitHub de Ultralytics YOLO26: https://github.com/ultralytics/yolo26
- Pagina del modelo YOLO26s en Ultralytics Platform: https://platform.ultralytics.com/liaoyutao/yolo26/yolo26s
- Licencia de referencia (Ultralytics): https://github.com/ultralytics/ultralytics/blob/main/LICENSE
