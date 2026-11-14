# PerfectWin/georas2vec-model

## Resumen

GeoCarto model (identificador `PerfectWin/georas2vec-model`) es un modelo de segmentación de imágenes orientado a la vectorización de mapas geológicos rasterizados. Lo desarrolla el usuario PerfectWin y convierte un mapa geológico escaneado o rasterizado en un GeoPackage listo para abrir en QGIS o ArcGIS, con una capa de polígonos de unidades geológicas, una capa de líneas de fallas, la tabla de leyenda y estilos QGIS por defecto. Se presenta como una vista previa de investigación (v0.2).

Técnicamente es una red U-Net++ con backbone EfficientNet-B4 que recibe seis canales (RGB + CIE-Lab) y predice diez mapas de afinidad de píxeles más un mapa de fallas. El pipeline posterior aplica un watershed mutex para generar polígonos, esqueletiza el mapa de fallas para trazar líneas y usa EasyOCR junto con un ranker de gradient boosting para asignar códigos y nombres a las unidades a partir del texto impreso en el mapa y de la leyenda.

El modelo se entrenó sobre el dataset `PerfectWin/geocarto` v2.0, que combina escaneos reales del USGS Geologic Map of North America (GMNA) con mapas sintéticos realistas de cuatro continentes. Su relevancia radica en que automatiza una tarea de digitalización GIS habitualmente manual y costosa, aunque con limitaciones claras en unidades pequeñas, detección de fallas en escaneos reales y dependencia de etiquetas legibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net++ con backbone EfficientNet-B4 (segmentación) + watershed mutex + OCR (EasyOCR) + ranker gradient boosting |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana deslizante de 512 px con stride 384 y mezcla Hann |
| Tipos de cuantizacion | pesos en FP16 (`best_fp16.pt`); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (OCR entrenado para códigos en escritura latina) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), más pickles de scikit-learn (`.pkl`) para OCR-to-polygon y ranker de nombres |

## Arquitectura y entrenamiento

La etapa de segmentación es una U-Net++ con backbone EfficientNet-B4 que recibe seis canales de entrada (RGB más CIE-Lab) y produce diez mapas de afinidad de píxeles con desplazamientos entre 1 y 27 px, además de un mapa de fallas. La inferencia se hace por ventana deslizante de 512 px con stride 384 y mezcla Hann. Sobre las afinidades se aplica un watershed mutex a resolución completa con región mínima de 40 px, y la vectorización se realiza con rasterio. Las fallas se obtienen del esqueleto del mapa de fallas, trazado en líneas.

El nombrado de unidades combina EasyOCR sobre el mapa completo con un ranker de gradient boosting que puntúa cada par (polígono, código candidato) a partir de evidencia OCR, características de líneas guía, distancia a la muestra de leyenda relativa al resto de muestras y otras apariciones del código en el mapa. Solo se escribe un nombre con confianza ≥ 0,8; en caso contrario el polígono queda como `Unité non identifiée` con las tres mejores sugerencias. Los nombres provienen exclusivamente del texto impreso y de la leyenda, sin propagación entre polígonos visualmente similares. El entrenamiento usó el dataset `PerfectWin/geocarto` v2.0 (cuatro continentes, escaneos reales GMNA y mapas sintéticos realistas). La ablación documentada indica que la reponderación de pérdida para polígonos pequeños y OHEM se probaron y se descartaron porque sobre-segmentan mapas reales.

## Capacidades

- Segmentación de instancias de unidades geológicas en mapas rasterizados, con predicción de afinidades de píxeles y watershed mutex para separar polígonos.
- Detección y trazado de fallas como capas de líneas a partir de un mapa de fallas esqueletizado.
- Reconocimiento óptico de caracteres (EasyOCR) sobre el mapa completo para extraer códigos y etiquetas.
- Asignación de nombres a unidades mediante un ranker aprendido, con umbral de confianza y sugerencias alternativas.
- Exportación a GeoPackage con capas `unites_geologiques` y `failles`, tabla `legende` y estilos en `layer_styles`.
- Generación de estilos QGIS por defecto (`qml_*.xml`).
- Procesamiento de mapas georreferenciados en cualquier CRS.
- Verificación de resultados con PyQGIS mediante `qgis_test.py` (capas, estilos, validez geométrica, renderizado).

## Casos de uso

- Digitalización de cartografía geológica histórica: convertir escaneos de mapas en papel (por ejemplo, hojas del GMNA) en capas vectoriales editables en QGIS, reduciendo el trabajo manual de trazado de polígonos y fallas.
- Integración en flujos GIS de administraciones y servicios geológicos: el GeoPackage de salida se abre directamente en QGIS o ArcGIS con estilos aplicados, lo que facilita su incorporación a bases de datos corporativas.
- Actualización de bases de datos de unidades geológicas: la tabla de atributos incluye `code`, `nom`, `age`, `lithologie`, `source_nom`, `confiance`, `texte_lu`, `suggestions` y `surface_km2`, lo que permite revisar y corregir de forma selectiva solo los polígonos con baja confianza.
- Análisis espacial de fallas: la capa `failles` permite calcular proximidad a fallas, densidades lineales o cruces con otras capas en un SIG, aunque con la cautela de que la F1 en escaneos reales es de 0,63.
- Control de calidad cartográfico: comparar la superficie (`surface_km2`) y la geometría generada con la leyenda original para detectar omisiones o fusiones de unidades pequeñas.
- Investigación en visión por computador aplicada a geociencias: el pipeline y las métricas publicadas (`training/test_metrics.csv`, `training/lab_round4_ablation.csv`) sirven como referencia reproducible para experimentos de segmentación de instancias en dominios científicos.
- Preprocesado para modelos posteriores: los polígonos y atributos generados pueden alimentar sistemas de razonamiento geológico o bases de conocimiento espacial.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (608 teselas, nunca vistas en entrenamiento). Recall = proporción de polígonos de referencia recuperados con IoU ≥ 0,5; *small* < 1000 px, *large* ≥ 1000 px; *correct area* = proporción del área del mapa en polígonos correctamente recuperados.

| Grupo | ARAND ↓ | Recall small | Recall large | Área correcta | F1 fallas (2 px) |
|---|---|---|---|---|---|
| África (sintético) | 0,030 | 89,6 % | 97,9 % | 99,3 % | – |
| Europa (sintético) | 0,099 | 82,2 % | 90,4 % | 92,0 % | – |
| Norteamérica (todo) | 0,091 | 72,5 % | 90,5 % | 95,1 % | 0,95 |
| Oceanía (sintético) | 0,176 | 63,9 % | 75,6 % | 83,5 % | 0,99 |
| GMNA escaneos reales | 0,052 | 74,7 % | 93,4 % | 98,3 % | 0,63 |
| Conjunto de test completo | 0,107 | 70,5 % | 86,2 % | 92,1 % | 0,97 |
| Trampa: unidades vecinas del mismo color | 0,151 | 62,8 % | 76,9 % | 84,9 % | 0,97 |
| Trampa: unidades con patrón | 0,099 | 74,3 % | 89,8 % | 93,9 % | 0,98 |

Nombrado (escaneos reales GMNA, hoja norte, 9 ventanas de 2048 × 2048 px; ranker entrenado solo con la hoja sur):

| Métrica | Valor |
|---|---|
| Área que recibe nombre (confianza ≥ 0,8) | 30,0 % (por ventana 4 % – 57 %) |
| Nombre correcto sobre el área nombrada | 91,6 % (por ventana 76 % – 98 %) |
| Área correctamente nombrada sobre el mapa completo | 27,5 % |

En el benchmark entre hojas sobre polígonos de referencia (38 ventanas, ambas direcciones), los nombres con confianza ≥ 0,8 son correctos en el 94–96 % de los casos sobre aproximadamente un tercio del área.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. El modelo usa pesos FP16 y ventanas de 512 px, pero el autor no publica requisitos de hardware.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: el autor proporciona un CLI (`vectorize.py`) con dependencias en `requirements.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: no disponibles.
- Restricción operativa: los mapas grandes se procesan en una sola pieza para el watershed; se recomienda mantener entradas por debajo de ~6000 × 6000 px o dividirlas.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. El modelo card no menciona alternativas de segmentación de mapas geológicos ni referencias a SAM, Mask R-CNN u otros sistemas comparables. Los únicos datos de referencia son las ablaciones internas del propio autor (`training/lab_round4_ablation.csv`), que descartan reponderación de pérdida para polígonos pequeños y OHEM.

## Limitaciones y advertencias

- Unidades pequeñas: aproximadamente 1 de cada 4 polígonos pequeños en escaneos reales se pierde o se fusiona.
- El nombrado depende de que las etiquetas estén impresas y sean legibles; las unidades sin etiqueta quedan como `Unité non identifiée` con sugerencias, sin adivinar.
- El OCR está entrenado para códigos en escritura latina; otros alfabetos no están cubiertos.
- La validación en escaneos reales se limita por ahora al USGS Geologic Map of North America; el resto de continentes se evalúa sobre renderizados sintéticos realistas de mapas vectoriales oficiales.
- Detección de fallas en escaneos reales mucho más débil que en sintéticos (F1 0,63 frente a 0,95–0,99).
- Límite de tamaño de entrada: por debajo de ~6000 × 6000 px o dividir el mapa.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia; conviene revisar la compatibilidad con flujos propietarios.
- Los archivos `.pkl` son pickles de scikit-learn: solo deben cargarse desde este repositorio por riesgo de ejecución de código arbitrario.
- Es una vista previa de investigación (v0.2) con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Riesgo de alucinación en el sentido de asignación incorrecta de nombres: aunque el umbral de confianza ≥ 0,8 limita los falsos positivos, el 8,4 % del área nombrada resulta incorrecta en el test end-to-end.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PerfectWin/georas2vec-model
- Dataset de entrenamiento: https://huggingface.co/datasets/PerfectWin/geocarto
- Dataset card (fuentes a citar): https://huggingface.co/datasets/PerfectWin/geocarto
