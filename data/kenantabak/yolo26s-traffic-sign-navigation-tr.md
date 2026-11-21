# kenantabak/yolo26s-traffic-sign-navigation-tr

## Resumen

`yolo26s-traffic-sign-navigation-tr` es un modelo de detección de objetos basado en la arquitectura YOLO26S, desarrollado por Kenan Tabak y publicado en la plataforma EVREN (SSYZ). Su tarea concreta es detectar y clasificar tres tipos de señalización vial con orientación direccional: señal de stop (`Stop-sign`), giro a la izquierda (`Turn-left-sign`) y giro a la derecha (`Turn-right-sign`). Resuelve un problema específico de los sistemas de asistencia a la conducción (ADAS): la confusión entre señales de giro izquierda y derecha cuando se aplican aumentos de datos con volteo horizontal.

El modelo se entrenó sobre un conjunto de datos propio de tres clases, con resolución de entrada de 768×768 y sin aumentos de espejo (`fliplr=0.0`, `flipud=0.0`, `degrees=0.0`), lo que elimina la ambigüedad direccional que en la versión anterior provocaba un mAP@50 del 66,86 % y una confusión severa entre las clases de giro (en torno al 49 %). El resultado declarado es de 99,26 % mAP@50 y 94,75 % mAP@50-95 sobre el conjunto de validación.

Se distribuye como pesos `.pt` compatibles con la librería Ultralytics, con un tamaño de fichero de 19,4 MB, lo que lo hace desplegable en hardware de borde y en GPUs de consumo. Está etiquetado para turco e inglés, con licencia CC BY 4.0 para los pesos y AGPL-3.0 para el framework Ultralytics subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26S (detector de objetos de la familia YOLO, framework Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato `.pt` de precisión completa) |
| Idiomas soportados | tr, en (etiquetas y documentación) |
| Licencia | CC BY 4.0 (pesos); AGPL-3.0 para el framework Ultralytics |
| Formato de pesos | `.pt` (PyTorch / Ultralytics) |
| Tarea | object-detection |
| Resolución de entrada | 768×768 (entrenamiento); ejemplo de inferencia a 640 |
| Clases | 3 (`Stop-sign`, `Turn-left-sign`, `Turn-right-sign`) |
| Tamaño del fichero | 19,4 MB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26S, un detector de objetos de una sola etapa perteneciente a la familia YOLO mantenida por Ultralytics. La información disponible no detalla la composición interna de la red (backbone, neck, cabeza de detección) ni el número de parámetros o capas; únicamente se confirma la variante `s` (small) y el framework de referencia, que permite cargarlo mediante `ultralytics.YOLO`.

El entrenamiento se realizó durante 75 épocas (mejor época en la 74) con `imgsz=768`, `batch=24`, `patience=20` y `cos_lr=True`, con un coste declarado de 0,112 horas-GPU. La innovación técnica principal es la eliminación de los aumentos de espejo y rotación (`fliplr=0.0`, `flipud=0.0`, `degrees=0.0`): al tratarse de señales direccionales, el volteo horizontal convertía giros a la izquierda en giros a la derecha y viceversa, degradando el aprendizaje. Se mantuvieron otros aumentos como `mosaic=0.7` con `close_mosaic=15`, `scale=0.35`, `hsv_h=0.005`, `hsv_s=0.2` y `hsv_v=0.3`. No se documenta el número de tokens ni la composición exacta del dataset más allá de su nombre y su calificación como «Grade A» en la plataforma EVREN.

## Capacidades

- Detección de objetos en imágenes con tres clases de señalización vial: stop, giro a la izquierda y giro a la derecha.
- Discriminación direccional fiable entre señales de giro izquierda y derecha, sin confusión por espejo.
- Inferencia sobre imágenes individuales o lotes mediante la API `model.predict()` de Ultralytics.
- Salida con cajas delimitadoras, clases y puntuaciones de confianza, configurable mediante umbrales `conf` e `iou`.
- Soporte de resolución de inferencia ajustable (el ejemplo de la model card usa `imgsz=640`, aunque el entrenamiento fue a 768).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multimodalidad de lenguaje; es exclusivamente un detector visual.
- Etiquetas y documentación en turco e inglés.

## Casos de uso

- Asistencia a la conducción (ADAS) en intersecciones: el modelo identifica en tiempo real si la señalización indica stop, giro a la izquierda o giro a la derecha, y puede alimentar un módulo de decisión que ajuste la velocidad o la trayectoria del vehículo. Su resolución de 768×768 y su tamaño de 19,4 MB permiten ejecución en unidades de a bordo.
- Navegación autónoma en entornos urbanos turcos: al estar entrenado sobre señalización local y documentado en turco, es adecuado para vehículos o robots que operen en carreteras de Turquía donde la orientación de las señales condiciona la maniobra.
- Sistemas de aviso al conductor: integrado en un pipeline de cámara frontal, puede emitir alertas cuando detecta un stop no respetado o una señal de giro contraria a la ruta planificada.
- Cartografiado y auditoría de infraestructuras viales: procesamiento por lotes de imágenes de vehículos de flota para inventariar la presencia y orientación de señales en un tramo de carretera.
- Robots móviles y vehículos de logística en recintos: interpretación de señalización direccional en almacenes o campus para corregir la ruta de navegación.
- Prototipado rápido en investigación: al cargarse con `YOLO("...pt")` y requerir solo 0,112 horas-GPU de entrenamiento, sirve como base para experimentos de detección de señalización o para fine-tuning con clases adicionales.
- Filtrado previo en pipelines de visión: como primera etapa de un sistema mayor que recorte la región de la señal y la envíe a un clasificador o a un lector OCR especializado.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de validación «Yol ve Trafik İşareti Tespiti (3 Sınıf)» (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 99,26 % |
| mAP@50-95 | 94,75 % |
| F1 Score | 98,19 % |
| Precision | 97,18 % |
| Recall | 99,32 % |
| Mejor época / total | 74/75 |

Rendimiento por clase:

| Clase | mAP@50 | Precision | Recall | F1 |
|---|---|---|---|---|
| `Turn-right-sign` | 99,50 % | 98,32 % | 100,00 % | 99,15 % |
| `Stop-sign` | 99,49 % | 100,00 % | 98,11 % | 99,05 % |
| `Turn-left-sign` | 99,15 % | 92,98 % | 100,00 % | 96,36 % |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un fichero de pesos de 19,4 MB y resolución de entrada de 640-768, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo es apto para RTX 3060/4060 y superiores. Para entrenamiento o inferencia por lotes de alta resolución se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, por tamaño y resolución; también es viable en CPU para inferencia puntual, aunque con mayor latencia.
- Opciones de despliegue: Ultralytics (`ultralytics.YOLO`), exportación a ONNX, TensorRT, OpenVINO u otros formatos soportados por Ultralytics; no se documenta integración directa con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Resolución | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `yolo26s-traffic-sign-navigation-tr` | YOLO26S | 3 (señalización direccional) | 768 | 99,26 % (declarado, no verificado) | CC BY 4.0 (pesos) / AGPL-3.0 (framework) | Hugging Face, EVREN |
| YOLO11 (variante small, genérica) | YOLO11 | 80 (COCO) | variable | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| YOLOv8 (variante small, genérica) | YOLOv8 | 80 (COCO) | variable | no disponible en esta ficha | AGPL-3.0 | Ultralytics |

No se dispone de datos de benchmarks de alternativas evaluadas sobre el mismo conjunto de tres clases, por lo que la comparación de rendimiento no es posible con la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para tres clases de señalización vial; no detecta otras señales, peatones, vehículos ni objetos generales.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model-index).
- El conjunto de validación es propio y de dominio turco; el rendimiento puede degradarse en otros países, condiciones de iluminación, climatología adversa u oclusiones no representadas en el entrenamiento.
- La supresión de aumentos de espejo y rotación mejora la discriminación direccional, pero reduce la robustez frente a señales vistas en ángulos o perspectivas no cubiertos por el dataset.
- Riesgo de falsos positivos y negativos en escenas con señales parcialmente ocluidas o de pequeño tamaño; el umbral de confianza debe calibrarse para cada aplicación.
- La licencia CC BY 4.0 permite uso comercial de los pesos con atribución, pero el framework Ultralytics está bajo AGPL-3.0, lo que impone obligaciones adicionales de código abierto si se integra en productos derivados.
- No se documentan sesgos demográficos ni geográficos más allá del origen turco del dataset; la ausencia de información al respecto no implica ausencia de sesgo.
- Para uso en producción en vehículos reales se requiere validación funcional de seguridad (ISO 26262 u equivalentes); este modelo no está certificado para tal fin.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-traffic-sign-navigation-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/yol-ve-trafik-isareti-yon-tespiti-dur-sola-donus-saga-donus-v2
- Dataset de entrenamiento (EVREN): https://evren.ssyz.org.tr/datasets/u19979974710e/yol-ve-trafik-isareti-tespiti-3-sinif
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Framework Ultralytics: https://github.com/ultralytics/ultralytics
