# khanhromvn/waste-detection-yolo11

## Resumen

Waste Detection YOLO11 es un modelo de detección de objetos especializado en la clasificación de residuos, desarrollado por KhanhRomVN y publicado en HuggingFace bajo licencia MIT. Se trata de un fine-tuning del modelo base `yolo11m.pt` de Ultralytics, la familia YOLO11 de detección de objetos en tiempo real, adaptado para identificar y localizar tres categorías de residuos: orgánico, reciclable y residual. A diferencia de los clasificadores de imagen completa, el modelo devuelve múltiples cajas delimitadoras por imagen, cada una etiquetada con su clase y nivel de confianza.

El modelo resuelve el problema de la separación automática de residuos en flujos de reciclaje, un caso de uso con demanda creciente en aplicaciones de sostenibilidad, domótica y sistemas de visión industrial. Su relevancia radica en que combina un tamaño moderado (20,06 millones de parámetros, 38,6 MB en pesos) con un rendimiento razonable para una tarea de tres clases, lo que lo hace desplegable en hardware de consumo y en entornos con recursos limitados.

La arquitectura subyacente es la de YOLO11m de Ultralytics, un detector de una sola etapa basado en una red troncal convolucional con conexiones de agregación de características. El modelo se entrenó sobre un conjunto de datos agregado de 12.602 imágenes provenientes de nueve fuentes distintas, con un total de 19.986 cajas en el split de entrenamiento. La longitud de contexto no aplica en este caso, ya que se trata de un modelo de visión por computador y no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (detector de objetos de una sola etapa, CNN) |
| Parametros totales | 20,06 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch; cuantización INT8/FP16 posible vía exportación de Ultralytics, no documentada por el autor) |
| Idiomas soportados | en, vi (etiquetas de clase en inglés; documentación en inglés y vietnamita) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, 38,6 MB) |
| Tarea | object-detection |
| Framework | Ultralytics 8.4.182, PyTorch 2.11.0 |
| Clases | 3: `organic`, `recyclable`, `residual` |
| Resolución de entrada | 640×640 (imgsz 640) |
| Umbral de confianza recomendado | 0,25 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `yolo11m.pt`, el checkpoint medio de la familia YOLO11 de Ultralytics. YOLO11 es una arquitectura de detección de objetos de una sola etapa que emplea una red troncal convolucional con bloques C3k2 y un cuello de agregación de características multi-escala, seguido de cabeceras de detección que predicen cajas y clases directamente. El fine-tuning se realizó con Ultralytics 8.4.182 sobre PyTorch 2.11.0, con entrada de 640×640 píxeles, optimizador automático, `lr0` de 0,01, `lrf` de 0,01, warmup de 3 épocas y weight decay de 0,0005. Se aplicaron aumentos de datos que incluyen mosaic (1.0, desactivado en las últimas 10 épocas), mixup (0.1), variaciones HSV (0.015/0.7/0.4), volteo horizontal (0.5), rotación de 5 grados, traslación de 0.1 y escala de 0.5, con AMP activado y semilla fija 42.

El conjunto de entrenamiento consta de 12.602 imágenes (11.771 train / 441 val / 390 test) agregadas de nueve fuentes: fruits360, g10v2, g12, Open Images v7, realwaste, synth, taco, techsash y trashnet. Las cajas se generaron de forma automática para las fuentes que solo tenían etiquetas de clase, mientras que taco y Open Images v7 aportaron cajas reales; estas últimas se sobremuestrearon ×2 durante el entrenamiento. El preprocesamiento incluyó deduplicación, verificación zero-shot con CLIP de etiquetas ruidosas (las bolsas de plástico se reasignaron de `recyclable` a `residual`) y generación de composites sintéticos. El split de validación y test proviene exclusivamente de las dos fuentes con cajas reales. El entrenamiento se ejecutó en Google Colab Free con una Tesla T4, batch 16, paciencia 20 y un límite de 4 horas, deteniéndose en la época 32 (mejor época 24).

## Capacidades

- Detección de objetos con múltiples cajas delimitadoras por imagen, cada una con clase y confianza.
- Clasificación en tres categorías de residuos: `organic` (restos de comida, fruta, verdura, pan, pizza, cáscaras de huevo), `recyclable` (botellas de plástico, latas, vidrio, cartón, papel, tapas metálicas) y `residual` (bolsas de plástico, envoltorios, poliestireno, vasos y cubiertos desechables, pañuelos, pilas, colillas, vidrio roto).
- Inferencia sobre imágenes individuales en formato estándar (JPG, PNG) a 640×640.
- Integración con el ecosistema Ultralytics: API de Python (`YOLO`), CLI (`yolo detect predict`) y scripts propios (`predict.py`).
- Exportación a otros formatos (ONNX, TensorRT, CoreML, etc.) mediante las utilidades de Ultralytics, aunque el autor no documenta este flujo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje; es exclusivamente un modelo de visión.
- Capacidades multilingües limitadas a las etiquetas de clase en inglés; la model card está en inglés con referencias en vietnamita.

## Casos de uso

- **Clasificación automática en plantas de reciclaje**: el modelo puede procesar imágenes de cintas transportadoras y generar cajas delimitadoras por residuo, permitiendo a un brazo robótico o a un operario separar orgánico, reciclable y residual. Su latencia de 24 ms por imagen en T4 lo hace viable para flujos continuos.
- **Aplicaciones móviles de reciclaje doméstico**: integrado en una app de móvil, el usuario fotografía un residuo y el modelo devuelve la categoría con la caja delimitadora, ayudando a decidir en qué contenedor depositarlo. El tamaño de 38,6 MB y la licencia MIT facilitan su empaquetado en apps comerciales.
- **Sistemas de visión en contenedores inteligentes**: cámaras montadas en contenedores de residuos pueden usar el modelo para detectar y contar objetos por categoría, generando estadísticas de uso y detectando contaminación cruzada (por ejemplo, residuos orgánicos en el contenedor amarillo).
- **Auditoría de flujos de residuos en edificios**: despliegue en dispositivos edge (Raspberry Pi con acelerador Coral, Jetson Nano) para monitorizar la composición de los residuos generados y optimizar la logística de recogida.
- **Educación y concienciación ambiental**: aplicaciones interactivas que muestran al usuario qué partes de una imagen son reciclables, orgánicas o residuales, con visualizaciones de cajas y confianza, útiles en talleres y campañas de sensibilización.
- **Preprocesado en pipelines de datos de sostenibilidad**: uso del modelo para etiquetar automáticamente grandes volúmenes de imágenes de residuos y generar datasets anotados que alimenten modelos posteriores o informes de análisis.
- **Prototipado rápido en investigación**: al estar fine-tuneado desde YOLO11m y disponible con licencia MIT, sirve como punto de partida para experimentos de detección de residuos con nuevas clases o dominios específicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Validación sobre 441 imágenes y 1.159 cajas, conf 0,001, IoU 0,6.

| Modelo | Params (M) | Tamano | Epocas | Mejor epoca | mAP50 | mAP50-95 | Precision | Recall | ms/img (T4) | Entrenamiento (min) |
|---|---|---|---|---|---|---|---|---|---|---|
| **yolo11m (este modelo)** | 20,06 | 38,6 MB | 32 | 24 | 0,495 | 0,388 | 0,606 | 0,463 | 24,0 | 241 |
| yolo11s | 9,43 | 18,3 MB | 54 | 34 | 0,481 | 0,373 | 0,602 | 0,450 | 8,5 | 206 |
| yolo11n | 2,61 | 5,2 MB | 55 | 40 | 0,455 | 0,349 | 0,541 | 0,453 | 3,8 | 181 |

Rendimiento por clase (yolo11m, validación):

| Clase | Cajas | AP50 | AP50-95 | Precision | Recall |
|---|---|---|---|---|---|
| organic | 396 | 0,519 | 0,398 | 0,606 | 0,446 |
| recyclable | 462 | 0,515 | 0,407 | 0,671 | 0,465 |
| residual | 301 | 0,450 | 0,357 | 0,540 | 0,478 |

Rendimiento por fuente (yolo11m, validación):

| Fuente | Imagenes | mAP50 | mAP50-95 | Nota |
|---|---|---|---|---|
| oi (Open Images v7) | 160 | 0,600 | 0,532 | etiquetas incompletas, solo 3 cajas residual |
| taco | 281 | 0,345 | 0,272 | solo 6 cajas orgánicas |

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 1-2 GB en FP32 para el modelo de 20,06 M de parámetros a 640×640; menos de 1 GB en FP16 o INT8.
- **GPU recomendadas**: Tesla T4 (referencia del autor, 24 ms/imagen), RTX 3060, RTX 4060, RTX 4090, A100, H100. Cualquier GPU con al menos 2 GB de VRAM puede ejecutar la inferencia.
- **GPU de consumo**: sí, cabe en GTX 1650, RTX 3050, RTX 3060 y superiores. También es viable en CPU para inferencia puntual, aunque con mayor latencia.
- **Dispositivos edge**: Jetson Nano, Jetson Orin Nano, Raspberry Pi 5 con acelerador Coral o Hailo, gracias a los 38,6 MB de pesos y la posibilidad de exportar a ONNX/TensorRT.
- **Opciones de despliegue**: Ultralytics (Python API y CLI), exportación a ONNX, TensorRT, OpenVINO, CoreML, TFLite y TorchScript mediante `model.export()`. No se documenta integración directa con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: 24 ms por imagen en Tesla T4 (unos 41 FPS teóricos); 8,5 ms en yolo11s y 3,8 ms en yolo11n. En RTX 4090 se espera una latencia significativamente menor, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **waste-detection-yolo11m** (este) | 20,06 M | 640×640 | 0,495 | MIT | HuggingFace |
| yolo11s (fine-tune del autor) | 9,43 M | 640×640 | 0,481 | MIT (Ultralytics AGPL-3.0 para el código) | HuggingFace |
| yolo11n (fine-tune del autor) | 2,61 M | 640×640 | 0,455 | MIT (Ultralytics AGPL-3.0 para el código) | HuggingFace |
| YOLO11m base (COCO) | 20,06 M | 640×640 | no disponible en esta ficha | AGPL-3.0 | Ultralytics |

La comparativa se limita a las variantes del mismo autor porque no se dispone de datos de otros modelos de detección de residuos en la información proporcionada. El modelo base YOLO11m de Ultralytics se distribuye bajo AGPL-3.0, lo que conviene verificar antes de un uso comercial del fine-tune, aunque el autor declare MIT para sus pesos.

## Limitaciones y advertencias

- **Rendimiento moderado**: mAP50 de 0,495 y mAP50-95 de 0,388 sobre validación indican una precisión limitada; el recall de 0,463 implica que aproximadamente la mitad de los objetos presentes no se detectan.
- **Desbalance por fuente**: el rendimiento cae notablemente en el subconjunto taco (mAP50 0,345) frente a Open Images (0,600), y las etiquetas de Open Images están incompletas (solo 3 cajas residual), lo que puede inflar artificialmente las métricas de esa fuente.
- **Etiquetas auto-generadas**: la mayoría de las fuentes de entrenamiento usan cajas generadas automáticamente, lo que introduce ruido y puede degradar la generalización a dominios reales.
- **Clases gruesas**: solo tres categorías, sin distinción fina entre tipos de plástico, vidrio o metal; insuficiente para flujos de reciclaje que requieran separación por material.
- **Riesgo de alucinación**: como todo detector, puede generar cajas falsas positivas en imágenes con texturas u objetos ambiguos; el umbral de confianza de 0,25 es una recomendación del autor, no un valor calibrado para producción.
- **Licencia**: los pesos se declaran MIT, pero el código de Ultralytics es AGPL-3.0; el autor advierte de verificar las licencias de los datasets originales (taco, Open Images, trashnet, etc.) antes de un uso comercial.
- **Idiomas**: las etiquetas de clase solo están en inglés; no hay soporte multilingüe más allá de la documentación.
- **Sin benchmarks independientes**: todas las métricas son declaradas por el autor y no han sido verificadas por terceros.
- **Entrenamiento limitado**: 32 épocas con un tope de 4 horas en Colab Free; un entrenamiento más largo o con más datos reales podría mejorar el rendimiento.
- **Sesgos de dominio**: el dataset combina imágenes de interiores, exteriores y composites sintéticos; el rendimiento en condiciones de iluminación, oclusión o ángulos no representados en el entrenamiento es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khanhromvn/waste-detection-yolo11
- Repositorio relacionado del autor: https://huggingface.co/khanhromvn/waste_classification
- Ultralytics YOLO11 (documentación): https://docs.ultralytics.com/models/yolo11/
- Ultralytics (GitHub): https://github.com/ultralytics/ultralytics
- Dataset TACO: http://tacodataset.org/
- Open Images v7: https://storage.googleapis.com/openimages/web/index.html
- TrashNet: https://github.com/garythung/trashnet
- Contacto del autor: khanhromvn@gmail.com
