# moshabann/egyptian-id-card-detector

## Resumen

El modelo `moshabann/egyptian-id-card-detector` es un detector de objetos especializado en localizar las cuatro esquinas estructurales y los límites de orientación de la tarjeta nacional de identidad egipcia, tanto en su anverso como en su reverso. Desarrollado por Mohamed Shaban Ibrahim, el modelo está diseñado como paso previo a un sistema de OCR: permite aplicar una transformación de perspectiva de cuatro puntos para corregir distorsiones geométricas, inclinaciones y deformaciones causadas por capturas no planas antes del reconocimiento de texto.

El modelo se basa en la arquitectura YOLO (no se especifica la variante exacta) y clasifica ocho puntos clave: cuatro correspondientes a la parte frontal de la tarjeta (superior, inferior, izquierda, derecha) y cuatro a la parte trasera. La licencia es Apache-2.0, lo que permite uso comercial y modificación. A pesar de su utilidad potencial, el repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos del modelo podrían no estar disponibles o que el archivo de pesos es muy pequeño (posiblemente un enlace externo). No se proporcionan detalles sobre el número de parámetros, el conjunto de entrenamiento ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (variante no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar (etiquetas del modelo; el modelo en si no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) segun el ejemplo de uso, aunque el repositorio parece vacio |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de detección de objetos basada en YOLO, orientada a localizar puntos clave (esquinas) en imágenes de tarjetas de identidad. No se especifica la variante de YOLO (n, s, m, l, x) ni el backbone utilizado. El entrenamiento se centra en imágenes de documentos de identidad egipcios, pero no se proporcionan datos sobre el volumen de imágenes, épocas, estrategia de aumento de datos ni configuración de hiperparámetros. Tampoco se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a un modelo de visión. La innovación principal del modelo reside en su integración con un pipeline de transformación de perspectiva (dewarping) que permite corregir distorsiones geométricas antes del OCR, aunque este paso se implementa externamente al modelo.

## Capacidades

- Detección de 8 clases de puntos estructurales: esquinas superior, inferior, izquierda y derecha tanto para el anverso como para el reverso de la tarjeta de identidad egipcia.
- Permite estimar la orientación de la tarjeta (si está boca arriba o boca abajo, y su rotación) a partir de la disposición de las esquinas detectadas.
- Facilita la corrección de perspectiva mediante transformación de 4 puntos, lo que mejora la precisión de sistemas OCR posteriores.
- Es un modelo puramente de visión; no incluye capacidades de generación de texto, razonamiento, tool calling, agentes ni procesamiento de lenguaje natural.
- Soporte de inferencia mediante la librería Ultralytics YOLO, con integración sencilla en Python.
- Etiquetas de idioma en, ar, aunque el modelo no procesa texto directamente; se refieren al contexto de los documentos (texto en inglés y árabe presente en el DNI egipcio).

## Casos de uso

- Preprocesado para OCR de documentos de identidad: el modelo detecta las esquinas de la tarjeta, se aplica una transformación de perspectiva y el resultado se envía a un motor OCR (por ejemplo, Tesseract o servicios cloud) para extraer los campos del DNI. Es adecuado porque corrige distorsiones que degradan la precisión del reconocimiento.
- Onboarding digital de clientes (KYC): en procesos de verificación de identidad para servicios financieros o telecomunicaciones, el modelo permite capturar la tarjeta con una cámara móvil en condiciones no ideales (ángulo, iluminación) y normalizarla antes de compararla con la base de datos oficial.
- Automatización de formularios administrativos: extracción de datos del DNI para rellenar formularios gubernamentales o privados sin intervención manual, reduciendo errores de transcripción.
- Control de acceso en hoteles o aeropuertos: el modelo puede integrarse en quioscos de registro que escanean el DNI egipcio y corrigen la perspectiva para validar la identidad en tiempo real.
- Archivado y digitalización de documentos: conversión de copias físicas o fotografías de tarjetas de identidad en imágenes normalizadas y listas para su almacenamiento en sistemas de gestión documental.
- Investigación en visión por computadora: el modelo sirve como punto de partida para el desarrollo de detectores de esquinas en otros documentos de identidad de la región, dado que su arquitectura YOLO es fácilmente adaptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión media (mAP), velocidad de inferencia, ni comparativas con otros detectores de esquinas o de documentos.

## Requisitos de hardware

- Al no conocerse el tamaño del modelo (número de parámetros), no es posible estimar la VRAM exacta necesaria. Los modelos YOLO de pequeña escala (YOLOv8n, YOLOv8s) requieren menos de 1 GB de VRAM para inferencia en GPU, mientras que versiones grandes (YOLOv8x) pueden necesitar entre 2 y 4 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) sería suficiente para versiones pequeñas. Para despliegue en servidor, una T4 o A10 es adecuada.
- El modelo puede ejecutarse en CPU, aunque con mayor latencia; para aplicaciones en tiempo real se recomienda GPU.
- Opciones de despliegue: la librería Ultralytics permite exportar a ONNX, TensorRT o CoreML. También puede integrarse con frameworks de servicio como TorchServe o FastAPI.
- Latencia y throughput estimados: no disponibles, dependen del tamaño del modelo y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de detección de esquinas de tarjetas de identidad. Existen soluciones genéricas de detección de documentos como DocTR o CRAFT, pero no se han encontrado datos concretos sobre su rendimiento relativo. Por tanto, la comparativa se limita a indicar que este modelo está especializado en el DNI egipcio, mientras que alternativas genéricas requieren adaptación.

## Limitaciones y advertencias

- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos del modelo podrían no estar realmente disponibles o que el archivo `detect_id_card.pt` no está subido. Es necesario verificar antes de su uso en producción.
- No se proporciona información sobre el conjunto de entrenamiento, por lo que se desconocen posibles sesgos en cuanto a condiciones de iluminación, tipos de cámara o variaciones del diseño de la tarjeta.
- El modelo solo detecta esquinas; no realiza OCR ni extracción de campos. Requiere un pipeline adicional para obtener datos legibles.
- Riesgo de bajo rendimiento en tarjetas deterioradas, con reflejos, o en condiciones extremas de perspectiva si no se incluyeron ejemplos similares en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir el autor original si se redistribuye el modelo o sus derivados.
- No se han publicado métricas de precisión, por lo que es recomendable evaluar el modelo con un conjunto propio de imágenes antes de integrarlo en un flujo crítico.

## Enlaces

- HuggingFace: https://huggingface.co/moshabann/egyptian-id-card-detector
- Perfil del autor en GitHub: https://github.com/m0shaban
- Paquete PyPI asociado (robovai-ocr): https://pypi.org/project/robovai-ocr/
- Sitio web del autor: https://msalatmani.org
