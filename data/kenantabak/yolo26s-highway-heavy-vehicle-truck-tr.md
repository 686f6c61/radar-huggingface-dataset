# kenantabak/yolo26s-highway-heavy-vehicle-truck-tr

## Resumen

`yolo26s-highway-heavy-vehicle-truck-tr` es un modelo de detección de objetos basado en la arquitectura YOLO26S de Ultralytics, entrenado por Kenan Tabak en la plataforma EVREN (SSYZ, Turquía) para la detección de vehículos pesados y camiones en imágenes de carretera. El modelo resuelve la tarea de localizar y clasificar cuatro clases de objetos en escenarios de tráfico de autopista, con especial énfasis en vehículos de gran tonelaje.

El modelo se ha entrenado sobre un conjunto de datos de carretera a gran escala con 9.900 imágenes y más de 117.000 cajas anotadas, con resolución de entrada de 512×512 píxeles, 50 épocas y batch de 32. Alcanza un mAP@50 del 93,78 %, un mAP@50-95 del 67,33 % y un F1 del 88,97 % en el conjunto de validación. Los pesos ocupan 19,3 MB, lo que lo hace muy ligero para despliegue en producción.

Es relevante para desarrolladores que necesitan un detector de vehículos pesados específico para dominios de carretera, con licencia CC BY 4.0 y pesos compatibles con la librería Ultralytics. No obstante, la model card presenta inconsistencias en la nomenclatura de las clases (etiquetas numéricas sin descripción semántica), lo que limita su uso directo sin trabajo de mapeo previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26S (Ultralytics, detector de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tr, en (metadatos; el modelo no procesa lenguaje) |
| Licencia | CC BY 4.0 (componente Ultralytics bajo AGPL-3.0) |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |
| Tamaño de pesos | 19,3 MB |
| Resolucion de entrenamiento | 512×512 |
| Tarea | object-detection |
| Numero de clases | 4 |
| Fecha de publicacion | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26S de Ultralytics, un detector de objetos de una etapa basado en redes convolucionales con cabecera de predicción densa. Se entrenó con `imgsz=512`, `epochs=50`, `batch=32`, `patience=16` y `cos_lr=True`, alcanzando el mejor epoch en el 49 de 50. El coste de entrenamiento declarado es de 0,396 GPU-horas.

Las técnicas de aumento de datos aplicadas incluyen `mosaic=0.75`, `close_mosaic=12`, `fliplr=0.5`, `flipud=0.0`, `degrees=5.0`, `scale=0.35`, `erasing=0.0`, `hsv_h=0.01`, `hsv_s=0.25` y `hsv_v=0.3`. El conjunto de entrenamiento es el dataset "Geniş Ölçekli Karayolu Araç ve Kamyon Tespiti (4 Sınıf)" (EVREN, Grade A), con 9.900 imágenes y más de 117.000 cajas. No se documenta el uso de RLHF, DPO ni técnicas de destilación; tampoco se detalla la composición exacta del dataset ni el reparto train/val/test.

## Capacidades

- Detección de objetos en imágenes de carretera con cuatro clases activas, incluyendo vehículos pesados y camiones.
- Inferencia sobre imágenes individuales mediante `model.predict()` de Ultralytics.
- Soporte de umbrales configurables de confianza (`conf`) e IoU (`iou`).
- Ejecución en CPU y GPU a través del ecosistema Ultralytics (PyTorch).
- Capacidad multilingüe limitada a los metadatos (tr, en); el modelo no procesa texto.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un detector visual, no un modelo de lenguaje).
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Monitorización de tráfico pesado en autopistas: el modelo detecta camiones y vehículos de gran tonelaje en imágenes de cámaras de carretera, adecuado por su mAP@50 del 96,02 % en la clase `3 truck` y su bajo coste computacional (pesos de 19,3 MB).
- Peajes y control de accesos: clasificación y localización de vehículos pesados para tarificación o estadísticas de flujo, gracias a la precisión del 92,09 % y el recall del 88,84 % en la clase de camión.
- Análisis de aforos y estudios de movilidad: procesamiento por lotes de imágenes de carretera para contar vehículos por clase, con un F1 global del 88,97 %.
- Sistemas de alerta temprana en túneles y corredores logísticos: detección de vehículos pesados en tiempo casi real sobre GPUs de consumo, dado el reducido tamaño del modelo.
- Preprocesado para pipelines de visión artificial en vehículos autónomos o ADAS: el modelo sirve como detector de vehículos pesados en la etapa de percepción, con resolución de 512×512 y latencia baja esperada.
- Anotación asistida y control de calidad de datasets: uso del modelo para pre-etiquetar imágenes de carretera antes de la revisión humana, aprovechando su F1 cercano al 89 %.
- Investigación en visión por computador aplicada al transporte en Turquía: el modelo y su dataset asociado (EVREN, Grade A) permiten reproducir experimentos y comparar con otras variantes YOLO.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---:|
| mAP@50 | 93,78 % |
| mAP@50-95 | 67,33 % |
| Precision | 89,64 % |
| Recall | 88,64 % |
| F1 | 88,97 % |
| Mejor epoch / total | 49/50 |

Rendimiento por clase:

| Clase | mAP@50 | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| `3 truck` | 96,02 % | 92,09 % | 88,84 % | 90,44 % |
| `2 n` | 94,17 % | 89,37 % | 89,66 % | 89,52 % |
| `7` | 92,65 % | 85,86 % | 90,89 % | 88,30 % |
| `5` | 92,13 % | 90,40 % | 85,02 % | 87,63 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos de 19,3 MB, la huella en memoria es muy reducida (del orden de cientos de MB incluyendo activaciones a 512×512).
- GPU recomendadas: cualquier GPU con soporte CUDA; el modelo es lo bastante pequeño para GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090.
- Cabe en GPU de consumo: sí, con margen amplio, incluyendo GPUs de gama media y baja.
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX/TensorRT/OpenVINO mediante las utilidades de Ultralytics; no se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI (no aplicables a detección de objetos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolo26s-highway-heavy-vehicle-truck-tr` | no disponible (19,3 MB de pesos) | 512×512 | 93,78 % | CC BY 4.0 (Ultralytics AGPL-3.0) | Hugging Face |
| YOLO11s (Ultralytics, genérico) | no disponible en esta ficha | variable | no disponible | AGPL-3.0 | Ultralytics |
| YOLO26s (Ultralytics, genérico) | no disponible en esta ficha | variable | no disponible | AGPL-3.0 | Ultralytics |
| Otros detectores de tráfico en EVREN | no disponible | no disponible | no disponible | variable | EVREN |

No se dispone de datos de benchmarks comparativos directos en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Las etiquetas de clase en la model card son inconsistentes: `3 truck`, `2 n`, `7` y `5`. Solo la clase `3 truck` tiene una etiqueta semántica clara; las demás son numéricas, lo que impide conocer su significado sin consultar el dataset original.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden únicamente del autor; no han sido validados de forma independiente.
- El modelo se entrenó con 50 épocas y resolución de 512×512; no se documenta su comportamiento en condiciones de baja iluminación, lluvia, niebla u oclusiones.
- Riesgo de sesgo por el dataset de origen (carreteras turcas, EVREN Grade A); el rendimiento puede degradarse en otros países, tipos de vía o flotas de vehículos diferentes.
- No se documentan sesgos demográficos ni geográficos más allá del origen del dataset.
- Licencia CC BY 4.0 para los pesos, pero el componente Ultralytics está bajo AGPL-3.0; el uso comercial combinado requiere revisar las obligaciones de AGPL-3.0 (apertura del código que integre el modelo).
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje; los idiomas tr/en son solo metadatos.
- No se documenta el reparto train/val/test ni la composición exacta del dataset, lo que dificulta la reproducibilidad.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/kenantabak/yolo26s-highway-heavy-vehicle-truck-tr
- Pagina del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/genis-olcekli-karayolu-agir-vasita-ve-kamyon-tespiti-4-sinif
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/genis-olcekli-karayolu-arac-ve-kamyon-tespiti-4-sinif
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catalogo de datasets de vision por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
