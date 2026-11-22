# BlurCue/rfdetr-large-704-face-plate-onnx

## Resumen

RF-DETR Large for BlurCue es un modelo de detección de objetos basado en la arquitectura RF-DETR (Real-Time Detection Transformer) en su variante Large, exportado a formato ONNX. Lo desarrolla el usuario BlurCue y está entrenado específicamente para detectar cinco clases de objetos: bicicleta, cara, persona, matrícula y vehículo. El modelo se presenta como el mejor checkpoint y exportación ONNX de la ejecución `rfdetr-large-v5-704-box-phase2`, una fase de 30 épocas con entrenamiento multi-escala a resolución nominal de 704 píxeles.

El modelo resuelve un problema concreto de detección de objetos en tiempo real con un conjunto de clases acotado y orientado a casos de uso como el desenfoque o censura automática de caras y matrículas (el nombre "BlurCue" sugiere este propósito). Al estar exportado a ONNX, está pensado para despliegue en producción con independencia del framework de entrenamiento original.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes, publicado en noviembre de 2026, sin model card extensa ni datos de benchmarks. La información disponible se limita a la arquitectura base (RF-DETR Large), la resolución de entrada (704 × 704), las cinco clases y los hashes de integridad de los artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Real-Time Detection Transformer), variante Large |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (exportación ONNX sin cuantización documentada) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`pack/rfdetr-large.onnx`) y checkpoint PyTorch (`checkpoint_best_total.pth`) |
| Resolucion de entrada | 704 × 704 RGB |
| Clases detectadas | bicycle, face, person, plate, vehicle |
| Tamano del repositorio | 0.3 GB |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR, un detector de objetos que combina un backbone transformer con un mecanismo de detección tipo DETR (Detection Transformer), caracterizado por eliminar la necesidad de anchors y de supresión no máxima (NMS) en la fase de post-proceso. La variante Large corresponde al mayor de los tamaños disponibles en la familia RF-DETR. No se dispone de información sobre el número de parámetros ni sobre la configuración exacta del backbone en la información proporcionada.

El entrenamiento documentado corresponde a la ejecución `rfdetr-large-v5-704-box-phase2`, una fase de 30 épocas con entrenamiento multi-escala y resolución nominal de 704 píxeles, inicializada a partir de la ejecución previa de 704 píxeles del modelo Large. No se especifica el volumen del dataset, su composición, ni si se aplicaron técnicas de aumento de datos más allá del multi-escala. Tampoco se documenta el uso de RLHF, DPO ni ninguna otra técnica de alineación, algo esperable en un modelo de visión. Los hashes SHA-256 de los artefactos (`checkpoint_best_total.pth` y `pack/rfdetr-large.onnx`) se proporcionan para verificación de integridad.

## Capacidades

- Detección de objetos en imágenes RGB de 704 × 704 píxeles con salida de cajas delimitadoras y clases.
- Detección de cinco clases específicas: bicicleta, cara, persona, matrícula y vehículo.
- Inferencia en tiempo real gracias a la arquitectura RF-DETR, orientada a baja latencia.
- Exportación ONNX que permite despliegue con ONNX Runtime y otros motores compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto: es exclusivamente un modelo de visión.
- No se documentan capacidades multilingües (no aplica) ni modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Desenfoque automático de caras y matrículas: el modelo detecta las clases `face` y `plate` en imágenes de vigilancia o fotografías para aplicar censura previa a su publicación, que es precisamente el propósito sugerido por el nombre del autor (BlurCue).
- Anonimización en datasets de vídeo o imagen: integrado en un pipeline de preprocesado, permite localizar caras y matrículas antes de almacenar o compartir material, reduciendo el riesgo de exposición de datos personales.
- Análisis de tráfico y aparcamiento: la detección conjunta de `vehicle`, `plate`, `person` y `bicycle` en una sola pasada permite contar vehículos, identificar presencia de personas y bicicletas en escenas urbanas.
- Moderación de contenido en plataformas: detección de personas y caras para aplicar políticas de privacidad o filtrar contenido antes de su revisión manual.
- Sistemas de control de acceso o aforo: la detección de `person` a 704 × 704 con arquitectura en tiempo real es adecuada para contar personas en entradas o zonas restringidas.
- Despliegue en el borde (edge): al estar exportado a ONNX, puede ejecutarse con ONNX Runtime en dispositivos con aceleración por GPU o CPU, integrándose en cámaras IP o equipos de bajo consumo.
- Preprocesado para pipelines de reconocimiento de matrículas (ALPR): el modelo actúa como etapa de detección que localiza la matrícula antes de pasarla a un OCR especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como mAP, precisión, recall ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no conocerse el número de parámetros ni el tamaño del grafo ONNX, no es posible estimar la VRAM con rigor.
- GPU recomendadas: no disponible. Al tratarse de un detector en tiempo real de resolución 704, es esperable que funcione en GPUs de gama media, pero no hay datos que lo confirmen.
- ¿Cabe en GPU de consumo? No disponible. El repositorio ocupa 0.3 GB, lo que sugiere un modelo de tamaño moderado, pero no se puede confirmar la VRAM necesaria.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto exportado). Otras opciones como TensorRT o OpenVINO requerirían conversión adicional no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion | Clases | Licencia | Formato |
|---|---|---|---|---|---|
| BlurCue/rfdetr-large-704-face-plate-onnx | RF-DETR Large | 704 × 704 | 5 (bicycle, face, person, plate, vehicle) | Apache 2.0 | ONNX + PyTorch |
| RF-DETR Large (base, Roboflow) | RF-DETR Large | configurable | COCO (80 clases) | Apache 2.0 | PyTorch |
| YOLOv8/v11 (Ultralytics) | CNN | configurable | COCO (80 clases) | AGPL-3.0 / comercial | PyTorch, ONNX, TensorRT |
| DETR / Deformable DETR | Transformer | configurable | COCO (80 clases) | Apache 2.0 | PyTorch |

La comparación se establece a nivel de familia de arquitectura, ya que no hay métricas publicadas para este checkpoint concreto. Frente a los detectores COCO genéricos, este modelo está especializado en cinco clases y no cubre las 80 de COCO. Frente a YOLO, la licencia Apache 2.0 es más permisiva para uso comercial que la AGPL de Ultralytics.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de uso en producción.
- No se publican métricas de rendimiento (mAP, precisión, recall), por lo que no es posible evaluar su calidad objetivamente.
- El conjunto de clases es fijo (cinco clases); no detecta objetos fuera de `bicycle`, `face`, `person`, `plate` y `vehicle`.
- El orden de las clases en la salida es el de entrenamiento (bicycle, face, person, plate, vehicle); cualquier integración debe respetar ese orden.
- No se documenta el dataset de entrenamiento, lo que impide conocer sesgos demográficos, geográficos o de iluminación.
- Riesgo de alucinación inherente a los detectores transformer: pueden generar cajas espurias en escenas ambiguas; no se documenta el umbral de confianza recomendado.
- La resolución de entrada está fija en 704 × 704; imágenes de otra resolución requerirán redimensionado, lo que puede afectar a la detección de objetos pequeños (por ejemplo, matrículas lejanas).
- Licencia Apache 2.0 permite uso comercial, pero al no haber validación ni documentación de entrenamiento, el riesgo de fallo en producción recae enteramente en el integrador.
- El repositorio se actualizó por última vez el mismo día de su creación (2026-11-22); no hay historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/BlurCue/rfdetr-large-704-face-plate-onnx
- Repositorio RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Documentación RF-DETR: https://github.com/roboflow/rf-detr
- ONNX Runtime: https://onnxruntime.ai/
