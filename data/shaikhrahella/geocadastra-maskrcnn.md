# shaikhrahella/geocadastra-maskrcnn

## Resumen

GeoCadastra Mask R-CNN es un checkpoint de segmentación de instancias de edificios publicado por el usuario shaikhrahella en HuggingFace. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un peso entrenado de la arquitectura Mask R-CNN, un detector de dos etapas con rama de segmentación, que el autor describe como el checkpoint de producción utilizado por la plataforma GeoCadastra. El repositorio contiene únicamente el fichero `best.pth`, alojado aparte porque supera el límite de tamaño por fichero de GitHub, y está vinculado al proyecto principal GEO-CADASTRA-DRONE-PROJECT.

El modelo resuelve un problema concreto de teledetección: extraer la huella (máscara) de cada edificio presente en una imagen aérea capturada por dron, de forma que pueda alimentar flujos de trabajo catastrales, de inventario de activos o de análisis territorial. Frente a la detección con cajas delimitadoras, la salida de máscara permite medir superficie construida y separar instancias adyacentes, algo crítico en cascos urbanos densos.

La relevancia del repositorio es limitada pero práctica: no hay resultados de benchmarks, licencia declarada, idiomas ni pipeline definidos, y acumula cero descargas en el momento de redactar esta ficha. Su interés radica en que es un ejemplo de checkpoint de segmentación orientado a dominio vertical (catastro sobre imagery de dron), distribuido de forma separada del código de inferencia. El tamaño del repositorio es de 0,2 GB, lo que sitúa el checkpoint en el rango de las decenas de millones de parámetros; el dato exacto no está publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN (detector de dos etapas con rama de segmentación de instancias) |
| Parámetros totales | no disponible (tamaño del repositorio: 0,2 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa secuencias de texto) |
| Tipos de cuantización | no disponible (se distribuye un único checkpoint `best.pth`) |
| Idiomas soportados | no aplica (modelo de visión; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`) |
| Tarea | Segmentación de instancias de edificios |
| Backbone | no disponible (no especificado por el autor) |
| Resolución de entrada | no disponible |
| Framework de inferencia | no disponible (el autor indica que el checkpoint se usa junto al proyecto GeoCadastra) |
| Autor | shaikhrahella |
| Fecha de creación | 28 de septiembre de 2026 |
| Última actualización | 28 de septiembre de 2026 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

Mask R-CNN es una familia de arquitecturas de visión por computador que extiende Faster R-CNN añadiendo una tercera rama de predicción de máscaras binarias por región propuesta, en paralelo a la clasificación y a la regresión de cajas. El esquema habitual combina un backbone convolucional (típicamente ResNet) con una red piramidal de características (FPN), una etapa de propuesta de regiones (RPN) y una alineación de características tipo RoIAlign que evita la cuantización de coordenadas y mejora la precisión de las máscaras. El tamaño del checkpoint (0,2 GB) es coherente con una configuración de ese tipo en el rango de las decenas de millones de parámetros, pero el autor no especifica backbone, profundidad ni framework de origen, por lo que cualquier detalle adicional es una inferencia y no un dato confirmado.

No hay información publicada sobre el proceso de entrenamiento: no se indica el número de imágenes, la composición del dataset, la resolución de las ortofotos, la procedencia geográfica de los datos, el número de épocas ni si se aplicaron aumentos de datos o ajuste fino desde pesos preentrenados en COCO. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal o similar), algo esperable porque no se trata de un modelo generativo. El autor únicamente declara que `best.pth` es el checkpoint de producción de la plataforma GeoCadastra, lo que sugiere que fue seleccionado por su rendimiento en el conjunto de validación interno del proyecto, sin que se publiquen las métricas correspondientes.

## Capacidades

- Segmentación de instancias: genera una máscara binaria por cada edificio detectado, además de la clase y la caja delimitadora asociada.
- Detección de objetos: la rama de clasificación y regresión permite localizar construcciones en la imagen antes de segmentarlas.
- Procesamiento de imágenes aéreas: el modelo está entrenado para el dominio de imagery de dron según la descripción del proyecto GeoCadastra.
- Salida apta para medición: la máscara por instancia permite calcular huella construida por edificio, a diferencia de la segmentación semántica, que fusiona construcciones contiguas.
- Tool calling / function calling: no disponible; no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión-lenguaje, audio): no disponibles; el modelo no acepta texto como entrada.

## Casos de uso

- Generación de máscaras de edificios sobre ortofotos para catastro: el modelo se ejecuta sobre teselas de imagen aérea y produce una máscara por construcción, que después se vectoriza a polígonos y se carga en un SIG (QGIS, PostGIS) para actualizar la cartografía de edificaciones.
- Detección de construcciones no declaradas: comparando las máscaras generadas con la huella catastral vigente se identifican edificaciones nuevas o ampliaciones no registradas, un flujo habitual en inspección urbanística.
- Cálculo de superficie construida y análisis de densidad urbana: al disponer de máscara por instancia se puede medir el área de cada edificio y agregarla por manzana o sección censal, alimentando indicadores de ocupación del suelo.
- Inventario y auditoría de activos inmobiliarios: una entidad con cartera de inmuebles puede cruzar las máscaras detectadas con su inventario para verificar que todas las construcciones de una parcela están registradas.
- Monitorización de cambios territoriales: ejecutando el modelo sobre vuelos de distintas fechas y comparando las máscaras resultantes se obtienen series temporales de crecimiento urbano o de modificación de parcelas.
- Planificación urbana y estudios de sostenibilidad: la huella por edificio extraída permite estimar superficie de cubierta disponible para instalaciones fotovoltaicas o analizar la compactación del tejido urbano.
- Evaluación de daños tras un evento extremo: aplicado sobre imagery post-evento, el modelo ayuda a localizar edificaciones afectadas cuando se dispone de un modelo ajustado a ese tipo de escena.
- Integración en pipelines de teledetección: el checkpoint puede invocarse por lotes desde código Python sobre un repositorio de teselas, generando GeoJSON o GeoPackage como salida para consumo posterior por otras herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de segmentación (mIoU, AP de máscara, F1 por píxel), ni comparaciones con otros modelos, ni detalles del conjunto de evaluación empleado. Tampoco se documentan cifras de latencia o de rendimiento por imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: en el rango de 2 a 4 GB para un checkpoint de 0,2 GB con backbone de tipo ResNet-50 y FPN a resoluciones típicas de 800-1333 px; estimación orientativa no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (GTX 1660, RTX 3060, RTX 4060, T4, L4) es suficiente para inferencia en precisión simple. Para entrenamiento o ajuste fino se recomiendan 12-24 GB (RTX 4090, A5000, A100 40 GB).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 6 GB o más de VRAM, dado el tamaño del checkpoint. No hay requisitos oficiales publicados.
- Opciones de despliegue: PyTorch nativo es la vía natural, ya que el repositorio solo distribuye `best.pth`. Según el framework con el que se entrenó (no especificado), podría cargarse mediante torchvision, Detectron2 o MMDetection. Para producción es habitual exportar a TorchScript, ONNX o TensorRT, o servirlo con NVIDIA Triton. vLLM, llama.cpp, Ollama y TGI no aplican: son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. No se publican tiempos de inferencia ni capacidad de procesamiento por segundo.

## Comparativa con modelos similares

Los valores de los modelos de referencia proceden de su documentación pública y pueden variar según la variante concreta. Para el modelo objeto de esta ficha no se dispone de parámetros, licencia ni métricas declaradas.

| Modelo | Tarea | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| GeoCadastra Mask R-CNN | Segmentación de instancias de edificios (dominio dron) | no disponible (repo de 0,2 GB) | no disponible | HuggingFace, 0 descargas |
| Mask R-CNN (torchvision / Detectron2, ResNet-50-FPN) | Detección y segmentación de instancias genéricas (COCO) | ~44 M, dato aproximado de la implementación de referencia | BSD-3-Clause / Apache-2.0 según implementación | Pesos y código públicos |
| YOLOv8-seg / YOLO11-seg | Segmentación de instancias en tiempo real | 3-60 M según variante, dato aproximado | AGPL-3.0 o licencia comercial de Ultralytics | Repositorio y pesos públicos |
| Segment Anything (SAM) | Segmentación promptable de propósito general | 90 M a 1,2 B según variante, dato aproximado | Apache-2.0 | Pesos y código públicos |

La diferencia principal no está en la arquitectura, sino en la especialización: los modelos de referencia son genéricos o de propósito general, mientras que GeoCadastra Mask R-CNN se presenta como ajustado al dominio de edificaciones sobre imagery de dron. Esa ventaja potencial no puede cuantificarse porque no hay métricas publicadas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifica si se permite uso comercial, redistribución o modificación del checkpoint. Cualquier uso en producción conlleva riesgo legal hasta que el autor lo aclare.
- Cero descargas y un único like: no hay evidencia de validación por parte de la comunidad ni de reproducibilidad independiente.
- Sin métricas publicadas: no se puede saber la precisión real del modelo, su tasa de falsos positivos o su comportamiento en imágenes fuera del dominio de entrenamiento.
- Dataset de entrenamiento no documentado: se desconoce la procedencia geográfica, la resolución (GSD) y la estacionalidad de las imágenes, lo que impide estimar el sesgo geográfico y la capacidad de generalización a otras regiones o sensores.
- Sensibilidad a la resolución y al sensor: los modelos de segmentación de edificios degradan su rendimiento cuando cambian la altitud de vuelo, el ángulo de captura o las condiciones de iluminación respecto a los datos de entrenamiento.
- Riesgo de error en tejido urbano denso: edificaciones adosadas, cubiertas con vegetación o estructuras atípicas pueden fusionarse o fragmentarse en las máscaras, afectando a la medición de superficies.
- Dependencia del código del proyecto: la model card indica que el checkpoint se asocia al repositorio GEO-CADASTRA-DRONE-PROJECT; sin ese código no se documenta el preprocesado de imagen ni el posprocesado de máscaras necesario para reproducir los resultados.
- Sin soporte de texto ni de instrucciones: no admite prompts, tool calling ni razonamiento multi-paso; cualquier flujo agéntico requiere envolverlo externamente con otro componente.
- Riesgo de alucinación en el sentido de falsos positivos: el modelo puede generar máscaras sobre elementos que no son edificios (piscinas, naves, sombras) si el entrenamiento no cubrió esas clases negativas, sin que exista documentación al respecto.
- Fecha de publicación atípica en los metadatos (septiembre de 2026): conviene verificar el estado real del repositorio antes de integrarlo en cualquier flujo.

## Enlaces

- HuggingFace: https://huggingface.co/shaikhrahella/geocadastra-maskrcnn
- Proyecto principal en GitHub: https://github.com/alimaqsoodshaikh325-dotcom/GEO-CADASTRA-DRONE-PROJECT
