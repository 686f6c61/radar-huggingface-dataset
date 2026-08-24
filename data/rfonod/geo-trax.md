# rfonod/geo-trax

## Resumen

Geo-trax es un modelo de detección de objetos basado en YOLOv8s, desarrollado por el REAL Lab (rfonod), especializado en la detección de vehículos en imágenes aéreas de drones con vista cenital (bird's-eye view, BEV). Forma parte de un pipeline más amplio llamado Geo-trax que extrae trayectorias de vehículos georreferenciadas a partir de vídeo aéreo de alta altitud, orientado al análisis de tráfico urbano a gran escala.

El modelo resuelve el problema de detectar vehículos en imágenes aéreas de alta resolución (1920×1920 píxeles), un escenario donde los detectores estándar entrenados con imágenes a nivel de calle suelen fallar por la escala reducida de los objetos y la perspectiva cenital. Con 11,1 millones de parámetros, alcanza un mAP@50 de 0,951 y un mAP@50-95 de 0,711 en el conjunto de test de Songdo Vision v1, con un rendimiento casi saturado en coches y autobuses.

La relevancia actual del modelo radica en que aborda un caso de uso creciente: la monitorización de tráfico mediante drones para estudios de movilidad urbana, planificación de infraestructuras y análisis de seguridad vial. Su licencia CC-BY-4.0 permite uso comercial con atribución, y su integración con el ecosistema Ultralytics facilita su adopción en proyectos existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (horizontal bounding boxes, HBB) |
| Parametros totales | 11.137.922 (11,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato nativo Ultralytics; compatible con exportacion a ONNX, TensorRT, etc.) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Ultralytics (PyTorch), ONNX disponible en el repo |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv8s de Ultralytics, una red neuronal convolucional de una sola etapa (one-stage detector) que predice cajas delimitadoras horizontales y probabilidades de clase directamente desde la imagen de entrada. La variante "s" (small) es la versión ligera de la familia YOLOv8, con 11,1 millones de parámetros, diseñada para equilibrar precisión y velocidad de inferencia.

El entrenamiento se realizó en múltiples etapas sobre un total de 19.339 imágenes aéreas anotadas, con 679.306 instancias etiquetadas. Los datos provienen de una combinación de conjuntos públicos: Songdo Vision (rfonod/songdo-vision), VisDrone2019-DET y COCO (detection-datasets/coco). El proceso de entrenamiento multi-etapa se detalla en la publicación asociada (doi:10.1016/j.trc.2025.105205). La resolución de entrada es de 1920×1920 píxeles, notablemente superior a los 640×640 habituales en YOLOv8, lo que permite detectar vehículos pequeños en imágenes aéreas de alta altitud.

El modelo distingue 6 clases, de las cuales 4 son evaluadas oficialmente (Car, Bus, Truck, Motorcycle) y 2 auxiliares no evaluadas (Pedestrian, Bicycle). La validación se realizó sobre el conjunto de test de Songdo Vision v1, con 1.084 imágenes y 55.124 instancias de vehículos.

## Capacidades

- Detección de vehículos en imágenes aéreas cenitales: coches, autobuses, camiones y motocicletas, con alta precisión en coches (mAP@50 de 0,992) y autobuses (0,988).
- Detección de peatones y bicicletas como clases auxiliares, aunque no evaluadas oficialmente en los benchmarks publicados.
- Manejo de imágenes de alta resolución (1920×1920 píxeles), adecuado para detectar objetos pequeños en escenas aéreas densas.
- Integración con el pipeline Geo-trax para extracción de trayectorias georreferenciadas, que combina detección con multi-objeto tracking y georreferenciación.
- Compatible con el ecosistema Ultralytics (version ≥ 8.4.64), lo que permite fine-tuning, exportacion a ONNX/TensorRT y despliegue con herramientas estándar.
- Exportacion a formato ONNX disponible en el repositorio, facilitando la inferencia en produccion con diferentes backends.

## Casos de uso

- Monitorización de tráfico urbano con drones: el modelo detecta vehículos en vídeo aéreo de alta altitud, permitiendo contar flujos de tráfico, medir densidades y analizar patrones de congestión en tiempo real o diferido.
- Extracción de trayectorias de vehículos para estudios de movilidad: integrado en el pipeline Geo-trax, convierte detecciones en trayectorias georreferenciadas que pueden usarse para calibrar modelos de simulación de tráfico o validar políticas de movilidad.
- Análisis de seguridad vial: las trayectorias extraídas permiten identificar comportamientos de riesgo (cambios de carril bruscos, velocidades anómalas, conflictos entre vehículos) en intersecciones y tramos urbanos.
- Planificación de infraestructuras: los datos de volumen y composición del tráfico (proporción de camiones, autobuses, motocicletas) sirven para dimensionar carriles, semáforos y rotondas con datos empíricos.
- Generación de datos de entrenamiento para otros modelos: el detector puede anotar automáticamente grandes volúmenes de imágenes aéreas, reduciendo el coste de anotación manual en proyectos de visión por computador.
- Investigación académica en visión aérea: sirve como baseline sólido para experimentos de detección de objetos en imágenes de drones, con pesos públicos y métricas reproducibles sobre Songdo Vision v1.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de Songdo Vision v1 (1.084 imágenes, 55.124 instancias):

| Metrica | Valor |
|---|---|
| mAP@0.5 | 0,951 |
| mAP@0.5:0.95 | 0,711 |
| Precision | 0,911 |
| Recall | 0,935 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | Precision | Recall | mAP@50 | mAP@50-95 |
|---|---|---|---|---|
| Car | 0,979 | 0,981 | 0,992 | 0,835 |
| Bus | 0,952 | 0,977 | 0,988 | 0,826 |
| Truck | 0,887 | 0,916 | 0,935 | 0,722 |
| Motorcycle | 0,827 | 0,866 | 0,888 | 0,463 |

Nota: las métricas se midieron sobre Songdo Vision v1. La version v2 del dataset corrige anotaciones y añade instancias, por lo que los resultados no son directamente comparables entre versiones.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 11,1 M de parámetros y un tamaño de archivo de aproximadamente 66 MB (formato Ultralytics). En FP32, los pesos ocupan unos 44 MB, por lo que caben en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB o superior, RTX 3060, RTX 4090) es suficiente para inferencia. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB de VRAM.
- Inferencia en CPU: posible con llama.cpp no aplica (modelo de vision); se puede usar OpenVINO o ONNX Runtime con CPU, aunque la latencia será mayor. Para vídeo en tiempo real se recomienda GPU.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX para TensorRT o ONNX Runtime, integracion con pipelines de tracking como ByteTrack o DeepSORT dentro del framework Geo-trax.
- Latencia estimada: no disponible en la informacion proporcionada. Como referencia, YOLOv8s a 640×640 suele inferir en 1-5 ms en GPU moderna; a 1920×1920 la latencia sera mayor, estimable en 10-30 ms en GPU de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion entrada | mAP@50 (Songdo v1) | Licencia | Notas |
|---|---|---|---|---|---|
| rfonod/geo-trax (YOLOv8s) | 11,1 M | 1920×1920 | 0,951 | CC-BY-4.0 | Especializado en imagenes aereas BEV |
| Ultralytics/YOLOv8s (base) | 11,1 M | 640×640 | no evaluado en Songdo | AGPL-3.0 | Modelo generico, no entrenado para imagenes aereas |
| Ultralytics/YOLOv8m | 25,9 M | 640×640 | no evaluado en Songdo | AGPL-3.0 | Mayor capacidad, mayor coste computacional |

No se dispone de comparaciones directas con otros detectores especializados en imagenes aereas (como VisDrone baselines) en la informacion proporcionada. La comparativa con YOLOv8s base es orientativa: el modelo Geo-trax ha sido fine-tuneado especificamente para el dominio aereo, lo que justifica su ventaja en este escenario pese a compartir arquitectura.

## Limitaciones y advertencias

- El modelo solo ha sido validado en el dominio de imagenes aereas cenitales de alta altitud; su rendimiento en otros dominios (camaras de trafico a nivel de calle, imagenes satelitales de muy alta resolucion) no esta garantizado.
- Las clases Pedestrian y Bicycle no fueron evaluadas oficialmente; su rendimiento real es desconocido y probablemente inferior al de las clases principales.
- La deteccion de motocicletas es significativamente peor (mAP@50-95 de 0,463), debido a su tamano reducido y baja frecuencia en el conjunto de test.
- Los resultados se midieron sobre Songdo Vision v1. La version v2 del dataset corrige errores de anotacion y anade instancias; este modelo no ha sido re-evaluado en v2, y comparar metricas entre versiones puede llevar a conclusiones erroneas.
- El conjunto de test de Songdo Vision v2 contiene anotaciones generadas con un detector Geo-trax y confirmadas por humanos, lo que introduce un sesgo favorable al evaluar esta familia de modelos en v2.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero es recomendable revisar los terminos de las licencias de los datasets de entrenamiento (VisDrone, COCO) si se redistribuyen derivados.
- El modelo no soporta deteccion de objetos orientados (oriented bounding boxes, OBB); solo produce cajas horizontales, lo que puede ser suboptimo para vehiculos muy alargados en ciertos angulos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rfonod/geo-trax
- Repositorio GitHub: https://github.com/rfonod/geo-trax
- Paper (arXiv): https://arxiv.org/abs/2411.02136
- Publicacion en revista (Transportation Research Part C): https://doi.org/10.1016/j.trc.2025.105205
- Dataset Songdo Vision: https://huggingface.co/datasets/rfonod/songdo-vision
- Dataset Songdo Traffic: https://huggingface.co/datasets/rfonod/songdo-traffic
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/rfonod/geo-trax
- Pagina del proyecto (REAL Lab): https://www.real-lab.ch/geo-trax
- Video demo en YouTube: https://youtu.be/gOGivL9FFLk
- DOI del modelo: https://doi.org/10.57967/hf/9296
