# akhil0238/Weapon_Detection

## Resumen

Weapon_Detection es un ajuste fino del modelo YOLOv8 Nano (yolov8n.pt) de Ultralytics, publicado por el usuario akhil0238 en HuggingFace, especializado en la detección de objetos potencialmente peligrosos en imágenes y flujos de vídeo. El modelo resuelve un problema de visión por computadora aplicado a seguridad y vigilancia: localizar y clasificar cuatro categorías de amenaza (arma de fuego, explosivo, granada y arma blanca) con bounding boxes y puntuaciones de confianza, en lugar de tareas de generación de lenguaje.

Se trata de una red convolucional (CNN) de aproximadamente 3,0 millones de parámetros (3.006.428 fusionados) y 8,1 GFLOPs, con 129 capas y una cabeza de detección (capa Detect #22) reconfigurada para 4 clases. El modelo se inicializó con pesos preentrenados en COCO y se entrenó durante 50 épocas a 640x640 píxeles con el optimizador AdamW, alcanzando según la model card un 81,3% de mAP@50 en validación y un 81,1% en test.

Su relevancia práctica radica en que es un detector de amenazas de tamano nano, pensado para inferencia en tiempo real sobre hardware modesto (CPU, GPU de consumo o dispositivos edge), y se publica bajo licencia MIT. No obstante, el repositorio tiene 0 descargas y 1 like, no hay publicación asociada ni datos de validación externos, por lo que debe considerarse un modelo experimental más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de detección de objetos en una etapa (YOLOv8 Nano, Ultralytics); 129 capas, cabeza Detect reconfigurada a 4 clases |
| Parametros totales | ~3,0 M (3.006.428 fusionados) |
| Longitud de contexto | No aplica: modelo de visión por computadora; entrada de imágenes a 640x640 px |
| Tipos de cuantizacion | No disponible en la model card; la librería ultralytics permite exportar a FP16, INT8 y formatos ONNX, TensorRT, OpenVINO, TFLite o CoreML |
| Idiomas soportados | en (único idioma declarado como etiqueta); en detección de objetos el idioma de la imagen no es un parámetro funcional |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) gestionado por la librería ultralytics; exportable a otros formatos mediante `model.export()` |
| Coste computacional | ~8,1 GFLOPs por imagen de 640x640 |
| Tarea (pipeline) | object-detection |
| Clases | 4: Gun (arma de fuego), Explosive (explosivos y escenas de fuego/explosión), Grenade (granada), Knife (arma blanca) |
| Modelo base | Ultralytics/YOLOv8 (yolov8n.pt) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8 Nano, un detector en una etapa con diseño anchor-free, bloques C2f y cabeza desacoplada, optimizado para latencia baja tanto en CPU como en GPU. El autor sustituyó la cabeza original de 80 clases (COCO) por una cabeza de 4 clases, conservando el resto del backbone y del cuello. El modelo final consta de 129 capas y 8,1 GFLOPs por imagen de 640x640.

El entrenamiento se realizó durante 50 épocas a 640x640 píxeles con AdamW, learning rate de 0,00125 y momentum 0,9 (ambos determinados automáticamente por el framework). Se aplicó aprendizaje por transferencia desde pesos preentrenados en COCO, transfiriendo 319 de las 355 capas originales, lo que aceleró la convergencia. La estrategia de aumento de datos usó mosaic durante las primeras 40 épocas y lo desactivó en las 10 finales para refinar sobre imágenes completas y sin alterar. No se especifica en la model card el número de imágenes del dataset, su composición exacta ni si se aplicó algún tipo de ajuste posterior (RLHF/DPO no aplica en este tipo de modelo). Las pérdidas reportadas (box_loss, cls_loss, dfl_loss) descienden de forma estable a lo largo de las 50 épocas.

## Capacidades

- Detección de objetos en imágenes y vídeo: devuelve bounding boxes, clase y confianza para 4 categorías (Gun, Explosive, Grenade, Knife).
- Inferencia en tiempo real: con ~3 M de parámetros y 8,1 GFLOPs, está disenado para procesar flujos de vídeo con latencia baja en CPU y GPU.
- Detección de múltiples instancias simultáneas en una misma imagen (detección densa en una sola pasada).
- Funcionamiento en resolución de entrada 640x640 píxeles; la librería ultralytics permite variar `imgsz` en inferencia.
- Integración sencilla con el ecosistema Ultralytics (API de Python, CLI, exportación a ONNX/TensorRT/OpenVINO/TFLite/CoreML).
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No dispone de modo "thinking", visión multimodal genérica, audio ni generación de lenguaje.

## Casos de uso

- Vigilancia CCTV en tiempo real: el modelo puede ejecutarse sobre un flujo RTSP en un servidor o dispositivo edge y emitir alertas cuando la confianza de detección supera un umbral, reduciendo el trabajo de monitorización continua en salas de control.
- Control de acceso en edificios y eventos: integrado en las cámaras de entrada, permite generar avisos cuando se detecta un arma blanca o de fuego, siempre con revisión humana antes de cualquier actuación.
- Análisis por lotes de grabaciones forenses: al ser un modelo ligero, se pueden procesar horas de vídeo ya almacenado para localizar los fotogramas con posibles amenazas y reducir el material a revisar por un analista.
- Detección temprana de fuego y explosiones en entorno industrial: la clase Explosive incluye escenas de fuego y explosión, de modo que puede usarse como complemento de los sistemas de alarma en plantas, almacenes o instalaciones con riesgo de incendio.
- Despliegue en dispositivos de bajos recursos: con ~3 M de parámetros cabe en placas como Jetson Nano o Raspberry Pi con acelerador, lo que permite vigilancia distribuida sin enviar vídeo a la nube.
- Pre-filtrado en moderación de contenido: en plataformas donde se sube vídeo generado por usuarios, el modelo puede marcar clips candidatos a revisión manual por presencia de armas, reduciendo el coste del filtrado previo.
- Investigación en visión por computadora: sirve como punto de partida (fine-tuning adicional o comparación de arquitecturas, tal como hace el repositorio de código asociado que compara YOLO con RF-DETR) para experimentos de detección de objetos en dominios de seguridad.
- Integración en pipelines de alerta con sistemas externos: la salida estructurada (cajas, clases, confianzas) se puede publicar vía MQTT, Kafka o una API REST para activar protocolos de seguridad automatizados.

## Benchmarks y rendimiento

Resultados de validación declarados en la model card:

| Metrica | Gun | Explosive | Grenade | Knife | Global |
|---|---|---|---|---|---|
| mAP@50:95 | 47,8% | 48,5% | 76,6% | 48,2% | 55,3% |
| mAP@50 | 78,3% | 74,1% | 92,1% | 80,9% | 81,3% |
| Precision | 83,3% | 77,8% | 96,5% | 79,7% | 84,3% |
| Recall | 69,0% | 68,2% | 89,9% | 78,1% | 76,3% |

Resultados de test declarados en la model card:

| Metrica | Gun | Explosive | Grenade | Knife | Global |
|---|---|---|---|---|---|
| mAP@50:95 | 65,3% | 35,7% | 83,2% | 49,8% | 58,5% |
| mAP@50 | 93,1% | 60,5% | 91,1% | 79,7% | 81,1% |
| Precision | 96,7% | 49,7% | 93,1% | 86,5% | 81,5% |
| Recall | 83,0% | 83,0% | 83,0% | 83,0% | 83,0% |

Observaciones sobre estos datos:

- La model card no incluye comparación con otros detectores de amenazas, ni resultados sobre conjuntos públicos de referencia (por ejemplo, MMLU, HumanEval o GSM8K no aplican a un modelo de visión).
- El rendimiento en la clase Explosive cae de forma notable en test (mAP@50 del 60,5% y precision del 49,7% frente al 74,1% y 77,8% en validación), lo que indica poca generalización en esa categoría.
- En la tabla de test, la columna Recall repite 83,0% en las cuatro clases, lo que sugiere que se trata de un valor agregado duplicado y no de un desglose real por clase.
- La model card numera las clases del 1 al 4 aunque el cabezal se describe como configurado para 4 clases; conviene verificar el mapeo de índices al integrar el modelo.
- No se han publicado resultados de benchmarks independientes ni validaciones por terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para lotes pequenos a 640x640, estimación derivada de los ~3,0 M de parámetros y 8,1 GFLOPs. Puede reducirse con exportación a FP16 o INT8. Es una estimación propia, no un dato publicado en la model card.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo está pensado para GTX 1650/RTX 3060 o superiores, así como para GPUs de datacenter (T4, L4, A100, H100) cuando se necesita procesar muchos flujos simultáneos. No requiere VRAM alta.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso puede ejecutarse solo en CPU para cargas ligeras.
- Hardware edge: adecuado para NVIDIA Jetson (Nano, Orin) y para SBC con acelerador (por ejemplo, Coral o Hailo) tras exportar el modelo.
- Opciones de despliegue: API de Python y CLI de ultralytics, ONNX Runtime, TensorRT, OpenVINO, TFLite, CoreML, TorchScript. La librería permite exportar directamente desde el peso .pt.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo indica "fast inference" sin cifras de FPS ni milisegundos por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Weapon_Detection (este modelo) | ~3,0 M | 640x640 px | 4 (Gun, Explosive, Grenade, Knife) | MIT (según el autor) | HuggingFace, 0 descargas |
| Ultralytics YOLOv8n (COCO, modelo base) | ~3 M | Configurable, 640x640 por defecto | 80 clases genéricas de COCO | AGPL-3.0 (Ultralytics) | Ampliamente disponible en el repositorio de Ultralytics |
| RT-DETR / RF-DETR | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | Referenciado por el autor en su repositorio de comparación |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparación relevante es cualitativa: frente a YOLOv8n estándar, este ajuste reduce las clases de 80 a 4 y especializa el detector en categorías de amenaza, a costa de perder toda capacidad de detección de objetos generales. El autor mantiene un repositorio de código que compara YOLO con RF-DETR, lo que sugiere que esa fue la alternativa evaluada durante el desarrollo.

## Limitaciones y advertencias

- Modelo de visión, no de lenguaje: no genera texto, no responde a preguntas y no dispone de razonamiento ni de llamadas a herramientas. Cualquier expectativa en ese sentido es incorrecta.
- Riesgo elevado de falsos positivos y negativos en un dominio crítico: una precision del 49,7% en la clase Explosive en el conjunto de test implica que aproximadamente la mitad de las detecciones de esa clase pueden ser erróneas. No debe automatizarse ninguna decisión de seguridad sin revisión humana.
- Degradación entre validación y test en varias clases: Gun sube en test (mAP@50 93,1%) mientras Explosive cae en picado (60,5%), lo que indica un conjunto de test poco representativo o un ajuste excesivo al conjunto de validación.
- Definición ambigua de la clase Explosive: la model card describe esta clase como "fuego, escenarios de explosión y dispositivos explosivos", mezclando detección de incendios con detección de explosivos, lo que puede generar confusión semántica y falsos positivos cruzados.
- Sesgos y cobertura del dataset: no se especifica el número de imágenes, su procedencia geográfica, las condiciones de iluminación ni la distribución demográfica. Es probable que el rendimiento caiga en dominios visuales distintos de los del conjunto de entrenamiento (cámaras térmicas, visión nocturna, ángulos poco habituales).
- Riesgo legal y ético en videovigilancia: el uso de detección de armas sobre personas está sujeto a normativa de protección de datos (RGPD y LOPDGDD en Espana), a las reglas sobre videovigilancia y, según el uso, a requisitos de evaluación de impacto. La etiqueta "en" y la ausencia de documentación de sesgos agravan este punto.
- Licencia del modelo base: el ajuste se publica como MIT, pero Ultralytics YOLOv8 se distribuye habitualmente bajo AGPL-3.0 (con licencia comercial alternativa). Es imprescindible verificar la compatibilidad antes de un uso comercial o de redistribuir los pesos, ya que la licencia MIT declarada puede no cubrir los pesos derivados del modelo base.
- Ausencia de validación externa: el repositorio tiene 0 descargas y 1 like, no hay paper asociado ni evaluación independiente. Los únicos números disponibles son los que aporta el propio autor.
- Sin información de cuantización ni de latencia: no se documentan versiones cuantizadas probadas ni cifras de rendimiento en producción, por lo que el coste real de despliegue debe medirse en el entorno objetivo.
- Mantenimiento incierto: no hay indicios de actualizaciones, soporte ni gobernanza del repositorio.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/akhil0238/Weapon_Detection
- Repositorio de Ultralytics (framework y modelo base YOLOv8): https://github.com/ultralytics/ultralytics
- Repositorio de código citado por el autor (comparación YOLO frente a RF-DETR): https://github.com/subh-775/Threat_Detection_YOLO-vs-RF-DETR
- Licencia MIT referenciada en la model card: https://opensource.org/licenses/MIT
- Distribución de clases del dataset de entrenamiento (imagen): https://cdn-uploads.huggingface.co/production/uploads/66c6048d0bf40704e4159a23/5t7k-SJfuZWXJTek_RPWh.png
- Ejemplos de anotaciones del dataset (imagen): https://cdn-uploads.huggingface.co/production/uploads/66c6048d0bf40704e4159a23/Mf65kxTEwfq9HPMlzwO5y.png

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces encontrados correspondían a foros sin relación con el tema. No se dispone de paper, blog técnico ni demo asociados.
