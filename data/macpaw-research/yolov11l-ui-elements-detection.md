# macpaw-research/yolov11l-ui-elements-detection

## Resumen

El modelo `macpaw-research/yolov11l-ui-elements-detection` es un detector de objetos basado en una puesta a punto de YOLO11, desarrollado por MacPaw Research. Su objetivo es localizar elementos de interfaz de usuario (UI) en capturas de pantalla de aplicaciones macOS, concretamente los componentes que suelen aparecer en el árbol de accesibilidad: botones, triángulos de divulgación, imágenes, enlaces y áreas de texto. Forma parte del proyecto Screen2AX, una iniciativa de investigación centrada en generar metadatos de accesibilidad de forma automática mediante visión por computador.

El modelo se ha entrenado sobre el dataset `macpaw-research/Screen2AX-Element`, que contiene anotaciones de elementos de UI en capturas de pantalla de macOS. Al ser una variante de YOLO11, hereda la arquitectura de detección de objetos en una sola pasada, optimizada para un equilibrio entre precisión y velocidad. La licencia es AGPL-3.0, lo que condiciona su uso en productos comerciales o servicios en red.

La relevancia de este modelo radica en su aplicación directa a la accesibilidad: permite automatizar la detección de componentes interactivos en interfaces gráficas, un paso previo para generar árboles de accesibilidad o auditar la usabilidad de aplicaciones. Es una pieza clave en el pipeline Screen2AX, que combina detección de elementos y de grupos para reconstruir la estructura semántica de una pantalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (variante large) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no aplica (deteccion de objetos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

YOLO11 es la ultima generacion de la familia YOLO de Ultralytics, un detector de objetos de una sola etapa basado en redes neuronales convolucionales. La variante "l" (large) ofrece un equilibrio entre capacidad y velocidad, con una backbone CSPDarknet y una cabeza de deteccion que predice cajas y clases directamente sobre la imagen. No se han publicado detalles especificos sobre el numero de parametros, la composicion exacta del dataset de entrenamiento ni el proceso de optimizacion (como aumentos de datos o hiperparametros) en la informacion disponible.

El entrenamiento se realizo sobre el dataset `Screen2AX-Element`, que contiene imagenes de capturas de pantalla de aplicaciones macOS con anotaciones de cinco clases de elementos de UI: `AXButton`, `AXDisclosureTriangle`, `AXImage`, `AXLink` y `AXTextArea`. El modelo se publica como un archivo `.pt` listo para cargar con la libreria Ultralytics, y se integra con el flujo de trabajo estandar de YOLO para inferencia y entrenamiento adicional.

## Capacidades

- Deteccion de objetos en imagenes, especificamente elementos de interfaz de usuario en capturas de pantalla de macOS.
- Reconoce cinco clases de elementos: botones, triangulos de divulgacion, imagenes, enlaces y areas de texto.
- Inferencia en una sola pasada, adecuada para procesamiento en tiempo real o casi real.
- Integracion sencilla con el ecosistema Ultralytics (carga con `YOLO` y prediccion directa).
- No incluye capacidades de generacion de texto, razonamiento, tool calling ni procesamiento de lenguaje natural; es exclusivamente un modelo de vision.

## Casos de uso

- Generacion automatica de arboles de accesibilidad: el modelo detecta los componentes interactivos en una captura de pantalla, lo que permite construir un arbol de accesibilidad preliminar sin intervencion manual. Es el caso de uso principal del proyecto Screen2AX.
- Auditoria de accesibilidad en aplicaciones macOS: se puede integrar en herramientas de testing para verificar que los elementos de UI estan presentes y son detectables, ayudando a cumplir con normativas de accesibilidad.
- Automatizacion de pruebas de interfaz: al localizar botones, enlaces y areas de texto, el modelo puede guiar a agentes de automatizacion para interactuar con la interfaz, por ejemplo, haciendo clic en un boton detectado.
- Documentacion de UI: generar inventarios visuales de los elementos de una aplicacion a partir de capturas de pantalla, util para documentacion tecnica o de producto.
- Clasificacion y organizacion de capturas: en repositorios de imagenes de aplicaciones, el modelo puede etiquetar automaticamente las capturas segun los elementos que contienen, facilitando la busqueda y el analisis.
- Investigacion en vision por computador para accesibilidad: sirve como punto de partida para experimentos sobre deteccion de componentes de UI en otros sistemas operativos o con clases adicionales.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| accuracy@0.5 | 0.65359 |
| precision | 0.49055 |
| recall | 0.43433 |
| f1 | 0.43776 |
| mAP@0.5 | 0.46644 |
| mAP@0.5-0.95 | 0.31295 |

Estas metricas corresponden al conjunto de validacion del dataset Screen2AX-Element. No se han publicado comparaciones con otros detectores de UI en la informacion disponible.

## Requisitos de hardware

No se han publicado requisitos especificos de hardware para este modelo. No obstante, al tratarse de un YOLO11l, se estima que:

- Para inferencia en tiempo real, una GPU de consumo con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) deberia ser suficiente.
- Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8 GB o mas de VRAM (como RTX 3060 o superior).
- El modelo es ligero (0.1 GB de tamano de repo) y puede ejecutarse en CPU, aunque con menor rendimiento.
- Opciones de despliegue: se puede usar directamente con la libreria Ultralytics, exportar a ONNX, TensorRT o CoreML, e integrar en servicios de inferencia como Triton o TorchServe.

Estas estimaciones son orientativas y no han sido confirmadas por el autor.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros detectores de elementos de UI en la informacion proporcionada. Modelos alternativos en el mismo ambito podrian ser otros fine-tunes de YOLO para deteccion de UI, o detectores genericos como DETR, pero no hay datos publicados que permitan una comparacion objetiva. Por tanto, esta seccion se considera no disponible.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial o en un servicio en red (incluso via API) requiere liberar el codigo fuente de la aplicacion integradora bajo AGPL-3.0, o adquirir una licencia comercial de Ultralytics.
- El modelo esta entrenado exclusivamente con capturas de pantalla de macOS; su rendimiento en otros sistemas operativos o en interfaces web puede degradarse.
- Solo detecta cinco clases de elementos; no cubre todos los componentes posibles de una interfaz (por ejemplo, barras de desplazamiento, menus desplegables o campos de formulario).
- Las metricas publicadas (mAP@0.5 de 0.46644 y mAP@0.5-0.95 de 0.31295) indican un rendimiento moderado; puede haber falsos positivos o negativos en escenarios complejos.
- No se ha verificado de forma independiente los resultados de los benchmarks; los valores son declarados por el autor.
- El modelo no es un sistema de vision general; su uso esta pensado para el dominio especifico de elementos de UI en macOS.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/macpaw-research/yolov11l-ui-elements-detection
- Dataset Screen2AX-Element: https://huggingface.co/datasets/macpaw-research/Screen2AX-Element
- Proyecto Screen2AX (GitHub): https://github.com/MacPaw/Screen2AX
- Coleccion Screen2AX en HuggingFace: https://huggingface.co/collections/macpaw-research/screen2ax
- Modelo de deteccion de grupos UI: https://huggingface.co/macpaw-research/yolov11l-ui-groups-detection
- Paper Screen2AX (arXiv): https://arxiv.org/abs/2507.16704
- Licencia comercial de Ultralytics: https://www.ultralytics.com/license
- Web de MacPaw Research: https://research.macpaw.com
