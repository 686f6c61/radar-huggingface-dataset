# shng2025/EDUtech-Recon-Drone-YOLOv11

## Resumen

EDUtech-Recon-Drone-YOLOv11 es un detector de objetos obtenido por ajuste fino (fine-tuning) del modelo YOLO11 en su variante L, desarrollado por el equipo Recon Drone del Marlborough College Malaysia para el reto Planet Protectors Challenge de Google EDUtech Asia 2024, celebrado en Marina Bay Sands (Singapur), donde obtuvo el primer puesto. El modelo resuelve una tarea concreta: localizar y clasificar residuos en imágenes aéreas y de videovigilancia, con el objetivo de alimentar una plataforma de analítica de residuos que representa geográficamente su distribución sobre un mapa de calor.

El sistema completo combina un dron DJI programado mediante el SDK de DJI, un backend en Flask que lee coordenadas GPS y marcas de tiempo de los metadatos EXIF de cada imagen, el modelo YOLO11l ajustado para detectar ocho clases de residuos, almacenamiento en Google Firebase y una aplicación web en React que dibuja las detecciones sobre Google Maps. El prototipo se desplegó en un campus escolar de 90 acres.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de aplicación de visión artificial a la gestión de residuos con recursos limitados; por otro, advierte de que se trata de un ajuste fino corto (9 épocas) con métricas modestas (0,381 mAP50) y de un repositorio sin validación comunitaria (0 descargas, 0 likes en el momento de la consulta). Es un modelo de visión, no un modelo de lenguaje: no genera texto, no soporta tool calling y no procesa contexto conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11l: detector de objetos de una sola etapa basado en CNN, familia Ultralytics YOLO11 |
| Parámetros totales | no disponible en la información proporcionada |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa secuencias de texto) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en punto flotante (`.pt`) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase no se documentan) |
| Licencia | MIT, según declaración del autor |
| Formato de pesos | PyTorch `.pt` (`weights/best.pt`) más checkpoints históricos en `archive/` |
| Tarea | Detección de objetos (`pipeline_tag: object-detection`) |
| Clases detectadas | 8 clases de residuos (los nombres no se detallan en la información disponible) |
| Librería / framework | Ultralytics |
| Modelo base | Ultralytics/YOLO11 (fine-tune) |
| Tamaño del repositorio | 1,9 GB (incluye todos los checkpoints anteriores en `archive/`) |
| Fecha de creación / actualización | 2024-10-23 / 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es YOLO11 en su variante L, un detector de una sola etapa que predice cajas delimitadoras y clases en una única pasada hacia delante sobre la imagen. El autor no documenta ni el número de parámetros ni la resolución de entrada, y no se describe ningún cambio estructural respecto al modelo base de Ultralytics: se trata de un ajuste fino supervisado (SFT) sobre los pesos preentrenados de YOLO11l.

El conjunto de entrenamiento se construyó agregando 300.000 imágenes procedentes de 25 datasets open source relacionados con la clasificación de residuos, fusionados en Roboflow. El ajuste fino se ejecutó durante 9 épocas sobre instancias spot de NVIDIA H100 en Google Cloud, tras validar el código de entrenamiento en GPUs NVIDIA L4 de Google Colab; las curvas y métricas se registraron en Weights & Biases y cada checkpoint se subió a Hugging Face. El peso final corresponde a la época 8 (indexación desde cero) de la ejecución denominada `fluent-morning-79`. Antes de llegar a YOLO11, el autor probó un clasificador basado en ViT y una CNN entrenada desde cero, y descartó ambas opciones por coste de servicio a escala y por falta de datos y cómputo, respectivamente.

## Capacidades

- Detección de residuos con cajas delimitadoras y clasificación en 8 categorías sobre imágenes individuales.
- Procesamiento de imágenes aéreas capturadas por dron y de cámaras de videovigilancia (CCTV), según el caso de uso descrito por el autor.
- Integración con un pipeline geoespacial: el backend asociado lee coordenadas GPS y marcas de tiempo de los metadatos de la imagen y almacena las detecciones para su representación en mapas de calor.
- Inferencia rápida: aproximadamente 0,015 s por imagen en una NVIDIA L4, lo que habilita procesamiento casi en tiempo real en flujo simple.
- Ejecución autónoma mediante el script `inference.py` incluido, que procesa una carpeta de imágenes con `weights/best.pt`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No genera texto, código ni contenido multimodal: es exclusivamente un detector visual.
- No se documentan capacidades multilingües ni un modo de razonamiento (thinking mode).

## Casos de uso

- Cartografiado de residuos con dron en playas, plantaciones y zonas rurales sin infraestructura: el modelo detecta y clasifica los residuos en cada fotografía aérea y el sistema asocia cada detección a coordenadas GPS para dibujar la distribución sobre un mapa.
- Vigilancia de espacios con CCTV: al aceptar imágenes de cualquier fuente con marca temporal y ubicación, puede conectarse a cámaras fijas de un campus o de una vía pública para inventariar residuos de forma periódica.
- Análisis temporal de acumulación: al conservar la fecha de cada imagen, permite comparar mes a mes el volumen de residuos por zona y detectar puntos negros recurrentes.
- Priorización de recursos de limpieza: los mapas de calor generados a partir de las detecciones permiten a los gestores concentrar medios humanos y materiales donde se acumula la basura.
- Investigación de causas de vertidos: la evolución geográfica de las detecciones ayuda a correlacionar la acumulación con actividades concretas (mercados, accesos, cursos de agua) y a identificar el origen.
- Educación y concienciación ambiental: el pipeline se desplegó en un campus escolar de 90 acres, de modo que el modelo puede utilizarse en actividades docentes para cuantificar la generación de residuos del propio centro.
- Integración en aplicaciones web de terceros: el backend Flask más Firebase y el frontend React documentados sirven de plantilla para añadir detección de residuos a un panel de analítica existente mediante una llamada al script de inferencia.
- Auditoría rápida de lotes de imágenes históricas: `inference.py` permite reprocesar carpetas completas de fotografías ya existentes para reconstruir series temporales sin necesidad de nuevos vuelos.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto / condiciones |
|---|---|---|
| mAP50 | 0,381 | Conjunto de validación propio |
| mAP50-95 | 0,264 | Conjunto de validación propio |
| Épocas de ajuste fino | 9 | Ejecución `fluent-morning-79` |
| Imágenes de entrenamiento | 300.000 | 25 datasets open source fusionados en Roboflow |
| Latencia de inferencia | ~0,015 s por imagen | NVIDIA L4, flujo simple |
| Throughput | ~66 imágenes/s (derivado de la latencia) | NVIDIA L4, sin batching documentado |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible, ni métricas desagregadas por clase, matriz de confusión o resultados de precisión y recuerdo.

## Requisitos de hardware

- Inferencia medida por el autor: aproximadamente 0,015 s por imagen en una NVIDIA L4, equivalentes a unas 66 imágenes por segundo en flujo simple; no se documenta el throughput con batching.
- Entrenamiento: instancias spot de NVIDIA H100 en Google Cloud; las pruebas de código se hicieron en NVIDIA L4 de Google Colab.
- VRAM estimada: no disponible. El autor no publica consumo de memoria. Como referencia cualitativa, YOLO11l es un detector compacto de una sola etapa y en la práctica se ejecuta en GPUs de consumo tipo RTX 3060 o superiores, además de en CPU a baja cadencia; estas cifras son estimaciones generales de la familia y no han sido verificadas en este repositorio.
- Despliegue: el repositorio incluye `inference.py` para ejecutar `weights/best.pt` sobre una carpeta de imágenes; también es utilizable mediante la API de Python y la CLI de Ultralytics.
- Exportación: la librería Ultralytics permite exportar a formatos como ONNX, TensorRT u OpenVINO, pero el autor no documenta ninguna exportación ni artefacto alternativo en este repositorio.
- Despliegue en edge (Jetson, dispositivos embebidos): plausible por el tipo de modelo, no probado ni documentado por el autor.
- Tamaño en disco: el repositorio completo ocupa 1,9 GB por la acumulación de checkpoints históricos en `archive/`; el peso final `weights/best.pt` es un único archivo dentro de ese conjunto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este fine-tune (YOLO11l + 8 clases de residuos) | Detector de una etapa | no disponible | no aplica | 0,381 (validación propia) | MIT declarada por el autor | Pesos en Hugging Face, 0 descargas |
| Ultralytics YOLO11l (modelo base) | Detector de una etapa | no disponible | no aplica | no disponible en esta información | AGPL-3.0 por defecto en Ultralytics | Pública, ampliamente adoptada |
| YOLOv8l (generación anterior de Ultralytics) | Detector de una etapa | no disponible | no aplica | no disponible en esta información | AGPL-3.0 por defecto en Ultralytics | Pública |
| Clasificador basado en ViT (alternativa evaluada y descartada por el autor) | Clasificador de imagen | no disponible | no aplica | no disponible | no disponible | Descartado por coste de servicio a escala |
| CNN entrenada desde cero (alternativa evaluada y descartada) | Clasificador de imagen | no disponible | no aplica | no disponible | no disponible | Descartado por falta de datos y cómputo |

La comparación cuantitativa con otros detectores no es posible con la información disponible: el autor solo reporta métricas de su propio conjunto de validación y no ofrece una línea base del YOLO11l sin ajustar ni resultados de terceros.

## Limitaciones y advertencias

- Rendimiento modesto en términos absolutos: 0,381 mAP50 y 0,264 mAP50-95 sobre validación propia indican una precisión baja para producción exigente; solo 9 épocas de ajuste fino sugieren un modelo infraentrenado.
- Dataset heterogéneo: 300.000 imágenes agregadas de 25 fuentes distintas fusionadas en Roboflow, sin documentación sobre equilibrio de clases, limpieza de etiquetas ni solapamiento entre particiones; el riesgo de ruido de etiquetas y de fuga entre entrenamiento y validación es real.
- Ocho clases de residuos cuyos nombres no se publican, lo que impide evaluar la taxonomía ni reutilizar el modelo sin inspeccionar los pesos.
- Generalización desconocida: el sistema se validó en un campus de 90 acres en Malasia; no hay evidencia sobre otros climas, tipos de residuo, ángulos de cámara o resoluciones.
- Dependencia de la calidad de la imagen: oclusión, residuos pequeños, sombras, reflejos o baja iluminación pueden degradar la detección; no se documentan análisis por subgrupos.
- Solo detecta residuos visibles; no estima volumen, peso ni composición química de los mismos.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de terceros.
- Riesgo de licencia: el autor declara MIT, pero los pesos derivan de Ultralytics YOLO11, cuyo régimen por defecto es AGPL-3.0; conviene verificar la compatibilidad con el uso comercial previsto antes de desplegarlo en producción.
- Sesgos geográficos y de dominio: al haberse entrenado y evaluado con datos de un entorno concreto, el modelo puede infrarrepresentar patrones de residuos de otras regiones.
- Repositorio pensado como entrega de competición: incluye 1,9 GB de checkpoints históricos, pero no se documentan scripts de evaluación, matrices de confusión ni protocolos de reproducción más allá de `inference.py`.
- El pipeline completo depende de metadatos GPS y de fecha en las imágenes; si estos faltan, la capa de analítica geográfica deja de funcionar aunque el detector siga operando.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shng2025/EDUtech-Recon-Drone-YOLOv11
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Página del proyecto: https://sienarindustries.com/project/edutech
- Código en GitHub: https://github.com/Ice-Citron/Edutech-Recon-Drone
- Informe de Weights & Biases: https://forge.coreweave.com/wandb/marlborough-college-malaysia/Edutech/reports/Recon-Drone-MCM-Edutech-Asia--VmlldzoxODE0OTE0OA
- Informe de entrenamiento (PDF): https://huggingface.co/shng2025/EDUtech-Recon-Drone-YOLOv11/blob/main/docs/recon-drone-training-report.pdf
- Póster (PDF): https://huggingface.co/shng2025/EDUtech-Recon-Drone-YOLOv11/blob/main/docs/recon-drone-poster.pdf
- Vídeo del proyecto: https://youtube.com/shorts/AQ2-JziMWtg
- Presentación final del equipo: https://youtu.be/nM7g6zC_H5I
- Keynote en el escenario principal: https://youtu.be/0D65uZaONBg
- Instagram del equipo: https://www.instagram.com/mcmedutech/
- Artículo del centro educativo: https://www.marlboroughcollegemalaysia.org/mcm-success-at-edutech-asias-planet-protectors-challenge/
