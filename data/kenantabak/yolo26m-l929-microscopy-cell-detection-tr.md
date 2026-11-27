# kenantabak/yolo26m-l929-microscopy-cell-detection-tr

## Resumen

YOLO26m L929 es un modelo de deteccion de objetos especializado en microscopia de fluorescencia para la identificacion y clasificacion de celulas L929 (fibroblastos de raton) en seis clases distintas. Lo desarrolla el autor independiente kenantabak bajo el paraguas del proyecto "Evren" y se distribuye como un unico fichero ONNX en precision FP32. El modelo parte de la arquitectura YOLO26m y ha sido ajustado sobre un conjunto de 626 imagenes de microscopia con una densidad media de aproximadamente 43 celulas por fotograma.

El modelo resuelve un problema acotado pero recurrente en laboratorios de biologia celular: la cuantificacion automatizada y la clasificacion morfologica de poblaciones celulares en cultivo, tarea que habitualmente se realiza de forma manual o con herramientas genericas de vision que no distinguen entre estados celulares. Al estar exportado a ONNX y no depender de frameworks de deep learning pesados en tiempo de inferencia, puede integrarse en pipelines de analisis con `onnxruntime` y NumPy, lo que facilita su despliegue en entornos de laboratorio sin GPU dedicada.

La relevancia del modelo es fundamentalmente practica: ofrece un artefacto ligero (76,53 MB), con licencia MIT permisiva, metricas de validacion publicadas y un tiempo de inferencia medido en CPU de referencia (497,5 ms por imagen a 640x640 con cuatro hilos). No obstante, se trata de un modelo de nicho, con un dataset de entrenamiento pequeno y sin validacion externa, por lo que debe considerarse una herramienta de apoyo y no un sistema de diagnostico clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26m (detector de objetos de la familia YOLO, variante "m" o medium) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | solo FP32 en el artefacto publicado; no se documentan variantes INT8, FP16 ni GGUF |
| Idiomas soportados | tr, en (etiquetas y documentacion del modelo; la tarea es de vision, no linguistica) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32), fichero `best.onnx` de 76,53 MB |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de una sola etapa basado en la arquitectura YOLO26m, con entrada fija de 640x640 pixeles y salida en formato ONNX compatible con `onnxruntime`. La model card no detalla la composicion interna de la red (numero de capas, modulos de atencion, mecanismo de asignacion de etiquetas ni funcion de perdida), por lo que estos extremos deben considerarse no disponibles. El modelo se entrena para predecir cajas delimitadoras y una de seis clases por celula detectada.

El ajuste se realizo sobre un dataset propio de 626 imagenes de microscopia de celulas L929, con aproximadamente 43 celulas por imagen y seis clases morfologicas, segun la model card. El entrenamiento se ejecuto durante 60 epocas en una unica NVIDIA H200 (141 GB HBM3e) con precision mixta automatica (AMP), con un tiempo total de 4,84 minutos y un pico de VRAM de 17,91 GB. No se documenta el uso de tecnicas de aumento de datos, destilacion, RLHF ni decodificacion especulativa; tampoco se especifica el numero de tokens ni la composicion exacta del dataset mas alla del recuento de imagenes y la densidad celular.

## Capacidades

- Deteccion de objetos en imagenes de microscopia con seis clases de celulas L929.
- Localizacion mediante cajas delimitadoras con coordenadas y puntuacion de confianza por instancia.
- Clasificacion morfologica de celulas en funcion de las seis categorias definidas en el dataset de entrenamiento.
- Inferencia en CPU mediante `onnxruntime` con el proveedor `CPUExecutionProvider`, sin necesidad de GPU.
- Integracion en pipelines de Python con OpenCV y NumPy para preprocesado y postprocesado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto; es exclusivamente un modelo de vision.
- No dispone de modo "thinking", capacidades de audio ni procesamiento de lenguaje natural.

## Casos de uso

- **Cuantificacion de cultivos celulares**: conteo automatizado de celulas L929 por fotograma a partir de imagenes de microscopia, sustituyendo el recuento manual en camara de Neubauer o el conteo asistido por software generico. La densidad media de 43 celulas por imagen y el recall del 77,88 % permiten estimar ordenes de magnitud con supervision humana.
- **Clasificacion morfologica en estudios de citotoxicidad**: uso de las seis clases para separar poblaciones celulares con morfologias distintas tras exposicion a un agente, facilitando el analisis de viabilidad y cambios de forma en placas de 96 pocillos.
- **Analisis de imagen en laboratorios sin GPU**: el modelo corre en CPU a ~2 FPS con cuatro hilos, suficiente para procesar lotes de imagenes de forma nocturna en estaciones de trabajo convencionales o servidores sin acelerador.
- **Integracion en pipelines de microscopia automatizada**: conexion del ONNX con software de adquisicion (Micro-Manager, Fiji/ImageJ via scripts) para disparar la inferencia tras cada captura y generar informes de conteo por pocillo.
- **Control de calidad de experimentos**: deteccion de imagenes anomalas (densidad celular fuera de rango, artefactos) comparando el numero de detecciones con el esperado, como paso previo a analisis mas costosos.
- **Prototipado rapido en investigacion**: al ser un artefacto ONNX ligero y con licencia MIT, sirve como base para experimentos de transferencia a otras lineas celulares o para comparar arquitecturas YOLO en el benchmark multiarquitectura publicado por el autor.
- **Docencia y formacion tecnica**: ejemplo reproducible de pipeline completo (descarga desde Hugging Face, preprocesado con OpenCV, inferencia ONNX, postprocesado) para cursos de vision por computador aplicada a biomedicina.

## Benchmarks y rendimiento

Los unicos datos publicados son los de validacion del propio autor sobre su conjunto de test, sin comparacion con otros modelos en la model card.

| Metrica | Valor |
|---|---|
| mAP@50 | 83,42 % |
| mAP@50-95 | 63,61 % |
| Precision | 85,52 % |
| Recall | 77,88 % |
| F1 | 81,27 % |
| Tamano ONNX (FP32) | 76,53 MB |
| Latencia CPU (Intel Xeon @ 2,20 GHz, 4 hilos) | 497,5 ms (2,01 FPS) |
| Epocas de entrenamiento | 60 |
| Tiempo de entrenamiento | 4,84 min en 1x NVIDIA H200 |
| Pico de VRAM en entrenamiento | 17,91 GB |

No se han publicado resultados comparativos frente a otros detectores (YOLOv8, YOLOv11, Faster R-CNN, etc.) en la informacion disponible.

## Requisitos de hardware

- **VRAM para inferencia**: el modelo es ONNX FP32 de 76,53 MB; en GPU la huella es minima (por debajo de 1 GB incluyendo buffers de activacion a 640x640), aunque no se publican mediciones de VRAM en inferencia.
- **GPU recomendadas**: cualquier GPU con soporte CUDA y `onnxruntime-gpu` es suficiente; no se requieren A100 ni H100. Una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real.
- **CPU**: funciona en CPU sin acelerador; la referencia publicada es de 497,5 ms por imagen en un Intel Xeon a 2,20 GHz con cuatro hilos (2,01 FPS).
- **Consumer GPU**: si, cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM; el cuello de botella es el preprocesado y el postprocesado, no el modelo.
- **Opciones de despliegue**: `onnxruntime` (CPU o GPU), `onnxruntime-gpu` con `CUDAExecutionProvider` o `TensorRTExecutionProvider`, OpenCV DNN, y servidores de inferencia compatibles con ONNX (Triton Inference Server). No se distribuye en formato GGUF, por lo que llama.cpp y Ollama no aplican.
- **Latencia y throughput**: 2,01 FPS en la CPU de referencia; en GPU se espera una mejora sustancial, pero no se publican cifras medidas.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo frente a alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Tipo | Entrada | Formato | Licencia | Contexto de uso |
|---|---|---|---|---|---|
| YOLO26m L929 (este modelo) | Detector YOLO26m ajustado a 6 clases de celulas L929 | 640x640 | ONNX FP32 | MIT | Microscopia de fluorescencia, 626 imagenes de entrenamiento |
| YOLOv8 / YOLO11 (genericos, Ultralytics) | Detectores de proposito general | 640x640 | PyTorch, ONNX, TensorRT | AGPL-3.0 (o licencia comercial) | Requieren ajuste fino sobre el mismo dataset para la tarea celular |
| Faster R-CNN (torchvision) | Detector de dos etapas | Variable | PyTorch | BSD-3-Clause | Mayor coste computacional, sin ajuste especifico a L929 |
| Cellpose | Segmentacion celular especializada | Variable | PyTorch | BSD-3-Clause | Segmentacion de instancias, no clasificacion en seis clases morfologicas |

La comparativa cuantitativa de mAP frente a estos modelos sobre el mismo conjunto de test no esta disponible.

## Limitaciones y advertencias

- **Dataset pequeno**: 626 imagenes de entrenamiento es un volumen reducido; el modelo puede generalizar mal a nuevas condiciones de iluminacion, aumentos, tinciones o lotes de microscopio distintos a los del conjunto original.
- **Sin validacion externa**: las metricas (mAP@50 83,42 %, recall 77,88 %) proceden de la validacion del propio autor sobre su dataset; no hay evaluacion independiente ni conjuntos de test publicos.
- **Recall limitado**: un 77,88 % de recall implica que aproximadamente una de cada cinco celulas puede no detectarse, lo que desaconseja su uso como unico metodo de cuantificacion en experimentos criticos.
- **Riesgo de falsos positivos**: la precision del 85,52 % indica que parte de las detecciones no corresponden a celulas reales; se recomienda umbral de confianza conservador y revision visual.
- **Alcance restringido a L929**: el modelo esta ajustado a fibroblastos L929; no se ha validado en otras lineas celulares ni en tejido, y su uso fuera de ese dominio no esta respaldado por datos.
- **Sin garantia clinica**: la propia model card advierte de que las metricas son observaciones de experimentos controlados y no constituyen garantia de diagnostico clinico ni de produccion.
- **Sesgos desconocidos**: no se documenta analisis de sesgo por tipo de microscopio, tincion, aumento ni condiciones de cultivo.
- **Licencia MIT**: permisiva para uso comercial, pero sin garantias implicitas; el autor no ofrece soporte ni mantenimiento documentado.
- **Formato unico**: solo se publica ONNX FP32; no hay variantes cuantizadas, lo que limita optimizaciones de latencia en hardware especifico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26m-l929-microscopy-cell-detection-tr
- Dataset asociado: https://huggingface.co/datasets/kenantabak/evren-l929-microscopy-cell-detection-tr
- Benchmark multiarquitectura CV y ONNX (GitHub): https://github.com/kenantabak/evren-multiarch-cv-onnx-benchmark
- Paquete de evaluacion y auditoria visual de errores (GitHub): https://github.com/kenantabak/evren-cv-eval-visual-audit
- Articulos tecnicos del autor (Dev.to): https://dev.to/kenantabak
