# puterlad/smart-donation-box

## Resumen

Smart Donation Box es un modelo de segmentación de instancias basado en la arquitectura YOLO11, desarrollado por el usuario puterlad para Green Rider Technologies. Su funcion es detectar, clasificar y segmentar en tiempo real los billetes de rupia india (₹) que se depositan en un buzón de donaciones inteligente, resolviendo el problema de la verificacion y el conteo automatico de efectivo en entornos de recaudacion fisica.

El modelo se distribuye como un unico fichero de pesos `best.pt` en formato PyTorch/Ultralytics, con un tamano de repositorio de 1,4 GB, y opera sobre imagenes de entrada de 640x640 pixeles. Reconoce ocho clases de billetes (₹0 de muestra o deteriorado, ₹5, ₹10, ₹20, ₹50, ₹100, ₹200 y ₹500), lo que lo hace util para cualquier sistema de kiosco o buzón que necesite identificar el valor depositado sin intervencion humana.

Es relevante ahora porque demuestra el uso de modelos de vision de ultima generacion (la familia YOLO11 de Ultralytics) aplicados a un dominio muy concreto y de bajo coste computacional, con licencia MIT, lo que permite integrarlo en productos comerciales de hardware embebido o de borde sin restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (segmentacion de instancias) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | MIT |
| Formato de pesos | `best.pt` (PyTorch, cargable con Ultralytics) |
| Resolucion de entrada | 640x640 |
| Framework | PyTorch / Ultralytics |
| Tamano del repositorio | 1,4 GB |
| Clases | 8 denominaciones de rupia india (₹0, ₹5, ₹10, ₹20, ₹50, ₹100, ₹200, ₹500) |
| Pipeline | image-segmentation |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11 en su variante de segmentacion de instancias, que combina un backbone de extraccion de caracteristicas con una cabeza que predice simultaneamente cajas delimitadoras, mascaras poligonales y clases. La tarea es de segmentacion panoptica por instancia: cada billete detectado recibe una mascara poligonal propia, lo que permite separar billetes solapados o parcialmente ocultos en la imagen.

El entrenamiento se realizo sobre un dataset propio anotado en formato YOLO Polygon Segmentation (`<class_id> <x1> <y1> <x2> <y2> ...`), con particiones de entrenamiento, validacion y prueba, y un fichero `data.yaml` que define rutas y etiquetas. La model card no especifica el numero de imagenes, la composicion del dataset ni si se aplicaron tecnicas de aumento de datos o ajuste fino adicional; tampoco documenta el numero de epocas ni la funcion de perdida empleada. No se menciona el uso de RLHF ni de tecnicas de alineacion, algo esperable en un modelo puramente perceptivo.

## Capacidades

- Segmentacion de instancias en tiempo real de billetes de rupia india sobre imagenes de 640x640.
- Clasificacion de ocho denominaciones distintas, incluida una clase para billetes de muestra, falsos o deteriorados (₹0).
- Deteccion de multiples billetes en una misma imagen, con mascaras poligonales independientes por instancia.
- Salida estructurada con cajas delimitadoras (`result.boxes`) y mascaras (`result.masks`), apta para post-procesado programatico.
- Inferencia por lotes o sobre fuentes de video mediante la API `model.predict` de Ultralytics.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un modelo exclusivamente de vision por computador.

## Casos de uso

- Buzones de donacion inteligentes: el modelo identifica y segmenta el billete depositado en tiempo real, permitiendo registrar el importe y validar la donacion sin intervencion humana, gracias a su inferencia de baja latencia sobre imagenes de 640x640.
- Conteo y verificacion automatica de efectivo: en cajas de recaudacion, el modelo puede procesar capturas de la camara interna para contar y clasificar los billetes acumulados, reduciendo errores manuales.
- Herramientas de asistencia para personas con discapacidad visual: un dispositivo movil o wearable puede capturar un billete y usar la salida del modelo para anunciar su denominacion por voz.
- Clasificacion y separacion en maquinas de manipulacion de efectivo: la mascara poligonal permite estimar la posicion y orientacion del billete para que un mecanismo de transporte lo clasifique en el compartimento correcto.
- Kioscos de pago o recarga en entornos con conectividad limitada: al ser un modelo ligero de vision, puede ejecutarse en hardware de borde (Jetson, Raspberry Pi con acelerador) sin depender de la nube.
- Auditoria y trazabilidad de donaciones: almacenar las mascaras y cajas generadas junto con la imagen original permite generar registros visuales verificables de cada deposito.
- Prototipado rapido de sistemas de vision para efectivo: la licencia MIT y la API de Ultralytics permiten integrar el modelo en pipelines de investigacion o productos comerciales con minimo esfuerzo de ingenieria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, precision, recall ni curvas de perdida, ni comparaciones con otros modelos de segmentacion.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; al tratarse de un modelo YOLO11 en formato PyTorch, la huella tipica de esta familia se situa en el rango de 1 a 4 GB segun la variante concreta (n, s, m, l o x), dato que la model card no especifica.
- GPU recomendadas: no documentadas por el autor; para inferencia en tiempo real se suelen emplear GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090, o aceleradores de borde como NVIDIA Jetson Orin.
- Compatibilidad con GPU de consumo: probable, dado el caracter ligero de la familia YOLO11, aunque el autor no lo confirma.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX, TensorRT o TorchScript mediante las utilidades de Ultralytics; no se documentan variantes GGUF ni integracion con Ollama o vLLM, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles; dependen del hardware y del tamano concreto de la variante YOLO11 empleada.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smart Donation Box (puterlad) | Segmentacion de instancias de billetes ₹ | no disponible | no aplica | MIT | Hugging Face |
| YOLOv8-seg (Ultralytics) | Segmentacion de instancias generica | no disponible | no aplica | AGPL-3.0 / comercial | GitHub, Hugging Face |
| YOLO11-seg (Ultralytics) | Segmentacion de instancias generica | no disponible | no aplica | AGPL-3.0 / comercial | GitHub, Hugging Face |
| Mask R-CNN (Detectron2) | Segmentacion de instancias generica | ~44 M (ResNet-50 FPN) | no aplica | Apache 2.0 | GitHub |

La comparativa se limita a modelos genericos de segmentacion, ya que no se han identificado en la informacion disponible otros modelos especializados en reconocimiento de billetes de rupia india. La ventaja diferencial del modelo de puterlad es su especializacion en denominaciones concretas y su licencia MIT, mas permisiva que la AGPL de Ultralytics.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con billetes de rupia india; no reconoce otras divisas ni denominaciones no incluidas en las ocho clases.
- La model card no documenta el tamano ni la diversidad del dataset de entrenamiento, por lo que se desconoce su robustez ante condiciones de iluminacion adversas, billetes arrugados, girados o parcialmente ocultos.
- No se han publicado metricas de rendimiento (mAP, precision, recall), lo que impide evaluar su fiabilidad en produccion sin una validacion propia.
- La clase ₹0 agrupa billetes de muestra, falsos o deteriorados; el modelo no esta disenado para autenticacion forense de billetes.
- Riesgo de confusion entre denominaciones visualmente similares (por ejemplo, ₹10 y ₹100) en imagenes de baja resolucion o con desenfoque de movimiento.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el integrador.
- El repositorio tiene un tamano de 1,4 GB, lo que sugiere la inclusion de artefactos de entrenamiento o datasets parciales; conviene revisar el contenido antes de desplegarlo.
- No se documenta el sesgo demografico ni geografico del dataset, aunque al tratarse de billetes de una unica divisa el sesgo geografico es intrinseco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puterlad/smart-donation-box
- Documentacion de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Green Rider Technologies: no disponible
