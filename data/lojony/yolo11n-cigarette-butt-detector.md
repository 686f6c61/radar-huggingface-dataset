# lojony/yolo11n-cigarette-butt-detector

## Resumen

Yolo11n-cigarette-butt-detector es un detector de objetos especializado en localizar colillas de cigarrillo sobre el asfalto en fotografías urbanas de alta resolución. Lo ha desarrollado lojony como parte de un proyecto open source orientado a construir un robot recolector de colillas, y se publica en Hugging Face con licencia AGPL-3.0.

El modelo se basa en YOLO11n de Ultralytics, la variante nano de la familia YOLO11, con 2,6 millones de parámetros. Se eligió esta versión frente a la YOLO11s porque su velocidad de inferencia es la más adecuada para ejecutarse en tiempo real sobre un robot. Trabaja sobre mosaicos de 640 píxeles recortados de fotografías completas de 4000×1800 píxeles, con solapamiento de 384 píxeles y fusión posterior de cajas mediante NMS.

Su relevancia reside en que aborda un problema concreto y poco cubierto: la detección de residuos pequeños (las colillas miden entre 25 y 254 píxeles en las fotos originales) en imágenes de alta resolución, algo que los detectores genéricos no resuelven bien. Incluye demo web, notebooks de entrenamiento y evaluación reproducibles, y el dataset de entrenamiento publicado en Kaggle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de objetos monopalabra (colillas) |
| Parametros totales | 2,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un YOLO11n, la versión nano de la arquitectura YOLO11 de Ultralytics, un detector de objetos en una sola etapa basado en transformer convolucional con cabeza de detección anclada. Se partió de un checkpoint preentrenado en COCO y se ajustó (fine-tuning) durante 100 épocas con Ultralytics 8.4.184, usando el aumento de datos por defecto y conservando la última época.

El conjunto de entrenamiento procede de una única sesión de captura en Valencia (España): 87 fotos de móvil con 217 colillas etiquetadas, tomadas a una altura aproximada a la de la cámara de un robot, a la luz del día y sin lluvia. Las fotos se recortaron en mosaicos de 640 px cada 384 px, contando una colilla en un mosaico cuando el 80 % de su superficie queda dentro. El pipeline incluye varias innovaciones de preparación de datos: las cajas dudosas se pintan en gris, el 10 % de los mosaicos de entrenamiento no contiene colillas (ejemplos negativos) y se añaden mosaicos extra centrados en objetos parecidos rechazados por el anotador (hojas, papel, piedras). La inferencia en producción usa los mismos mosaicos con NMS de IoU 0,3 para fusionar detecciones entre mosaicos.

## Capacidades

- Detección de colillas de cigarrillo en fotografías de aceras de alta resolución (4000×1800 px), con colillas de entre 25 y 254 px de longitud (90 % entre 35 y 170 px).
- Inferencia sobre mosaicos de 640 px con solapamiento de 384 px y fusión de cajas mediante NMS, evitando la pérdida de objetos pequeños que produce redimensionar la foto completa.
- Umbral de confianza ajustable: valores bajos (por ejemplo 0,25) aumentan el recall a costa de más falsos positivos.
- Procesamiento íntegro en CPU de portátil: 2,1 s por foto de 4000×1800 px en un i5-1145G7 (322 GFLOPs por foto).
- Demo web en navegador que se ejecuta localmente en el dispositivo del usuario, sin subir las fotos a ningún servidor.
- Pipeline reproducible: notebooks de entrenamiento y evaluación, receta de entrenamiento en JSON y dataset público en Kaggle.
- No incluye capacidades de texto, lenguaje, tool calling ni agentes: es exclusivamente un detector de objetos de una sola clase.

## Casos de uso

- Robótica de limpieza urbana: el objetivo original del proyecto. Un robot equipado con cámara puede ejecutar el modelo en tiempo real para localizar colillas y planificar su recogida; el tamaño nano del modelo está elegido precisamente para caber en el hardware de a bordo.
- Auditoría de limpieza en ciudades: un equipo municipal puede fotografiar aceras y cuantificar la densidad de colillas por zona para priorizar cuadrillas de limpieza o medir la eficacia de campañas.
- Vigilancia medioambiental ciudadana: proyectos de ciencia ciudadana pueden usar la demo web para estimar la contaminación por colillas en parques y calles sin infraestructura adicional.
- Anotación asistida de datasets: el modelo puede preetiquetar colillas en grandes colecciones de fotos urbanas, reduciendo el coste de anotación manual (aunque el propio proyecto etiquetó sus datos de evaluación sin asistencia del detector para evitar sesgos).
- Investigación en detección de objetos pequeños: el repositorio publica recetas, notebooks y curvas recall/falsos positivos, útil como base reproducible para estudiar detección de objetos diminutos en imágenes de alta resolución mediante tiling.
- Integración en pipelines de visión por lotes: el código de ejemplo en Python permite procesar carpetas de fotos completas con tiling y NMS, integrable en scripts de procesamiento geolocalizado de imágenes de flotas de vehículos o drones (con las cautelas de dominio indicadas).

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluación por foto completa, detección correcta si el centro cae dentro de la caja o IoU ≥ 0,3; entre corchetes, intervalos del 95 %):

| Metrica | Valor |
|---|---|
| Recall a umbral 0,25 (validacion, 19 fotos, 43 colillas) | 81,4 % (35 de 43; 67,4–90,3 %) |
| Falsos positivos por foto a 0,25 (validacion) | 0,74 (0,37–1,16) |
| Falsos positivos por foto a recall 72 % / 81 % / 86 % | 0,00 / 0,37 / 1,95 |
| Recall maximo alcanzado | 88,4 % |
| Test (19 fotos, 29 colillas, umbral 0,25) | recall 75,9 % (22 de 29; 57,9–87,8 %), 1,37 (0,63–2,21) FP/foto |
| Validacion cruzada 5-fold (106 fotos, 260 colillas, 0,25) | recall 81,9 % (76,8–86,1 %), 1,01 (0,77–1,22) FP/foto |
| Tiempo por foto 4000×1800 (50 mosaicos), CPU i5-1145G7 | 2,1 s |
| Computo por foto | 322 GFLOPs |

Comparativa del autor sobre las mismas 19 fotos de validacion:

| Modelo | Recall | FP/foto | Tiempo por foto |
|---|---|---|---|
| YOLO11n (este modelo) | 81,4 % | 0,74 | 2,1 s |
| YOLO11s (mismo entrenamiento) | 83,7 % | 0,84 | 6,5 s |
| OWLv2 (zero-shot) | 97,7 % | 7,3 | 119 s |

No se han publicado resultados de benchmarks estandarizados tipo MMLU o COCO mAP; las métricas anteriores son específicas del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor reporta ejecución en CPU de portátil (i5-1145G7), por lo que no requiere GPU.
- GPU recomendadas: no necesarias; cualquier GPU moderna (incluso integrada) aceleraría la inferencia vía ONNX Runtime, pero no hay datos publicados.
- Consumer GPU: no es requisito; el modelo de 2,6 M de parámetros en ONNX cabe con holgura en cualquier hardware actual.
- Opciones de despliegue: Ultralytics (librería nativa, con el ONNX incluido), ONNX Runtime, y demo web en navegador. No se menciona soporte específico de vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de detección de este tipo).
- Latencia y throughput: 2,1 s por foto de 4000×1800 px (50 mosaicos) en CPU de portátil i5-1145G7; 322 GFLOPs por foto. No hay cifras publicadas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Recall (mismo test del proyecto) | FP/foto | Tiempo/foto | Licencia |
|---|---|---|---|---|---|---|
| YOLO11n cigarette-butt (este) | 2,6 M | Colillas (especializado) | 81,4 % | 0,74 | 2,1 s | AGPL-3.0 |
| YOLO11s (mismo pipeline) | ~9,6 M (dato no confirmado en la ficha) | Colillas (especializado) | 83,7 % | 0,84 | 6,5 s | AGPL-3.0 |
| OWLv2 (zero-shot) | no disponible | Colillas (zero-shot) | 97,7 % | 7,3 | 119 s | no disponible |

Nota: el número de parámetros de YOLO11s no figura en la información disponible; se indica como referencia aproximada de la familia YOLO11. OWLv2 ofrece mayor recall pero a un coste de falsos positivos y latencia muy superior para este caso de uso.

## Limitaciones y advertencias

- Dominio de entrenamiento muy estrecho: una sola sesión de captura, un teléfono, una zona de una ciudad (Valencia), luz de día sin lluvia. El rendimiento en lugares nuevos no está medido y probablemente sea inferior.
- Las fotos de validación provienen del mismo paseo que las de entrenamiento (separación temporal, no espacial), lo que puede inflar las métricas.
- No probado en cámara de robot: las fotos son de móvil; el sensor, el desenfoque por movimiento y el montaje de un robot real no han sido evaluados, y ningún robot o placa con GPU ha ejecutado el modelo.
- Conjunto de datos pequeño: 87 fotos de entrenamiento y una única semilla de entrenamiento; los intervalos de confianza son amplios (una colilla equivale a ~2 puntos de recall en validación y ~3,5 en test).
- Falsos positivos dominados por objetos parecidos: hojas y papel son el mayor grupo según el análisis de errores del modelo YOLO11s entrenado igual; las colillas trituradas o aplastadas son el fallo más común, seguidas de las desenfocadas y pequeñas.
- Cigarrillos puros y puros pequeños (cigarillos) quedan fuera del alcance del modelo.
- Licencia AGPL-3.0: es una licencia copyleft fuerte; cualquier servicio que la use debe publicar el código fuente derivado, lo que puede ser restrictivo para uso comercial cerrado.
- Requiere el esquema de tiling descrito (640 px cada 384 px): redimensionar la foto completa a 640 px hace las colillas de pocos píxeles y el modelo las pierde.
- Descargas muy bajas (43) y proyecto reciente: escaso historial de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lojony/yolo11n-cigarette-butt-detector
- Demo web (en el navegador, sin subida de fotos): https://lorinc.github.io/litter-detection-pipeline/web_demo/
- Repositorio con código, entrenamiento y evaluación: https://github.com/lorinc/litter-detection-pipeline
- Dataset (Cigarette Litter Street Photo Dataset, CC BY 4.0): https://www.kaggle.com/datasets/lorinc/butt-field-2026-10-01
- Receta de entrenamiento: https://github.com/lorinc/litter-detection-pipeline/blob/main/pipeline/recipes/06-cv-yolo11n.json
- Curva interactiva recall/falsos positivos: https://lorinc.github.io/litter-detection-pipeline/docs/recall-fp-curve.html
