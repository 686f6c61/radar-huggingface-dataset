# mvdelibas/turkey-cemetery-seg-sentinel2-yolo11s

## Resumen

El modelo `mvdelibas/turkey-cemetery-seg-sentinel2-yolo11s` es un modelo de segmentación de instancias basado en Ultralytics YOLO11s-seg, ajustado para detectar y segmentar cementerios en imágenes satelitales Sentinel-2 L2A de 10 metros de resolución sobre Turquía. Lo desarrolla el usuario de Hugging Face mvdelibas y resuelve un problema de teledetección aplicada: identificar cementerios cartografiados y sugerir posibles cementerios no cartografiados a partir de su firma espectral y morfológica.

El modelo parte de los pesos preentrenados oficiales de yolo11s-seg y se afina sobre un conjunto de datos derivado de polígonos de OpenStreetMap (etiquetas `landuse=cemetery` y `amenity=grave_yard`) combinados con composites multitemporales de Sentinel-2. La tarea es de segmentación de instancias: para cada objeto predice tanto caja delimitadora como máscara. Cuenta con una única clase, `mezarlik` (cementerio en turco), y los nombres de clase internos están en turco.

Es relevante por su carácter de ejemplo práctico de adaptación de un detector genérico de visión a un dominio geoespacial muy específico con datos abiertos (Copernicus y OSM), y por documentar de forma explícita sus métricas de validación, su procedencia de datos y sus limitaciones. El repositorio tiene un tamaño declarado de 0,0 GB y, en el momento de la consulta, cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-seg (segmentación de instancias, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 320 px durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`; compatible con exportación de Ultralytics a otros formatos, no confirmado en la model card) |
| Idiomas soportados | en, tr (etiquetas de la model card; los nombres de clase internos están en turco) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, vía Ultralytics); nombre de fichero `tr-mezarlik-seg-sentinel2-yolo11s-seg.pt` |

## Arquitectura y entrenamiento

La arquitectura es YOLO11s-seg de Ultralytics, una red convolucional de una etapa para detección y segmentación de instancias que produce simultáneamente cajas y máscaras por objeto. El modelo se inicializa desde los pesos preentrenados oficiales de yolo11s-seg y se afina sobre el conjunto de datos "Türkiye Mezarlık Segmentasyonu - Sentinel-2 çok zamanlı (OSM)".

El entrenamiento se realizó a 320 px de resolución de entrada, durante 60 épocas (mejor época en la 43), con un coste declarado de 2,50 CR. Los datos de imagen son composites Sentinel-2 L2A de 10 m obtenidos vía Microsoft Planetary Computer, con hasta tres fechas reales de distintas estaciones por localización (se excluyen imágenes de invierno). Las etiquetas provienen de polígonos de OpenStreetMap (extracto de Geofabrik para Turquía, licencia ODbL 1.0). No se documenta en la model card el número de tokens ni el volumen exacto del conjunto de entrenamiento, ni si hubo etapas de RLHF/DPO (no aplicables a este tipo de modelo). El split de validación empleado para las métricas reportadas consta de 540 imágenes según la sección en turco.

## Capacidades

- Segmentación de instancias de cementerios en imágenes Sentinel-2 L2A de 10 m sobre Turquía, con salida de caja delimitadora y máscara por objeto.
- Detección de una única clase, `mezarlik`, con nombres de clase internos en turco.
- Sugerencia de posibles cementerios no cartografiados en OpenStreetMap para revisión humana.
- Procesamiento de composites multitemporales (hasta tres fechas de distintas estaciones por localización).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente visual.
- No soporta generación de texto, código, matemáticas, audio ni modo "thinking".
- Capacidades multilingües limitadas a los metadatos (en, tr); la inferencia no procesa lenguaje.

## Casos de uso

- Auditoría de cobertura cartográfica: ejecutar el modelo sobre teselas Sentinel-2 de Turquía y comparar las detecciones con los polígonos de OSM para identificar cementerios potencialmente no mapeados y priorizar trabajo de campo o edición en OSM.
- Planificación urbanística y de suelo: inventariar cementerios en áreas periurbanas donde el catastro es incompleto, usando las máscaras para estimar superficies y proximidad a núcleos urbanos.
- Estudios de cambio de uso del suelo: aplicar el modelo a composites de distintas fechas para detectar ampliaciones o nuevos cementerios, aprovechando que el entrenamiento incluyó imágenes multitemporales.
- Investigación en teledetección: servir como línea base reproducible para experimentos de segmentación de clases de uso del suelo poco representadas, con métricas y procedencia de datos documentadas.
- Validación cruzada de fuentes de datos: contrastar inventarios oficiales o catastrales con las detecciones del modelo para localizar discrepancias y priorizar revisiones.
- Filtrado previo en pipelines de anotación: usar las detecciones de alta confianza como propuestas iniciales para anotadores humanos, reduciendo el coste de etiquetado de nuevos conjuntos de datos.
- Docencia y prototipado: ejemplo completo de ajuste fino de YOLO11-seg sobre datos abiertos geoespaciales, útil para demostrar el flujo Copernicus + OSM + Ultralytics.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de validación (540 imágenes según la sección en turco):

| Métrica | Máscara | Caja |
|---|---:|---:|
| mAP@50 | 68,1% | 71,1% |
| mAP@50-95 | 24,9% | 30,0% |
| Precisión | 0,774 | 0,798 |
| Recalls | 0,638 | 0,673 |

Rendimiento por clase (AP@50, caja): `mezarlik` 67,4%, con precisión 0,75 y recall 0,66.

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de validación. El autor advierte que el rendimiento en otros sensores, regiones o estilos de imagen será inferior y que el split de test no se midió en esta model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. Por el tamaño de la variante "s" de YOLO11-seg, es esperable que quepa en GPU de consumo, pero no se confirma con datos del autor.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento a 320 px con 60 épocas, una GPU de consumo moderna o una GPU de datacenter de gama media sería suficiente en la práctica, aunque no se aportan medidas.
- Compatibilidad con GPU de consumo: probable por la variante "s", pero no confirmada en la información proporcionada.
- Opciones de despliegue: la model card solo documenta inferencia con `ultralytics` y `YOLO.predict`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo). La exportación a otros formatos de Ultralytics no se confirma.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, el propio autor indica que el modelo se afina desde los pesos oficiales de yolo11s-seg de Ultralytics, pero no se aportan métricas de esa línea base ni de alternativas como otros detectores de teledetección o segmentadores de uso del suelo.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turkey-cemetery-seg-sentinel2-yolo11s | no disponible | no aplica | mAP@50 máscara 68,1%; caja 71,1% | AGPL-3.0 | Hugging Face |
| yolo11s-seg (Ultralytics, preentrenado) | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 | Ultralytics / Hugging Face |
| Alternativas de segmentación de uso del suelo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los cementerios pequeños (por debajo de 0,8 hectáreas) no se detectan: a 10 m de resolución ocupan pocos píxeles.
- Confusión espectral con parques arbolados y jardines, que pueden parecerse a cementerios en Sentinel-2.
- Entrenado exclusivamente para Sentinel-2 L2A de 10 m sobre Turquía y sin imágenes de invierno; no es fiable en otros sensores, resoluciones o regiones.
- Las etiquetas provienen de OpenStreetMap y están incompletas, por lo que las métricas de validación pueden ser optimistas o pesimistas según el caso.
- Modelo de investigación: no debe usarse como única fuente para decisiones oficiales.
- Licencia AGPL-3.0 derivada de Ultralytics YOLO11; el uso comercial o la redistribución exigen cumplir la AGPL-3.0. Además, se mantiene la atribución de los datos de entrenamiento: datos modificados de Copernicus Sentinel y © colaboradores de OpenStreetMap (ODbL 1.0).
- Riesgo de alucinación en sentido figurado: detecciones falsas positivas en zonas con vegetación o ajardinamiento similar; requiere revisión humana antes de incorporar hallazgos a bases de datos cartográficas.
- Sin métricas en el split de test en esta model card; el rendimiento real en producción puede diferir del reportado en validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/turkey-cemetery-seg-sentinel2-yolo11s
- Ultralytics YOLO11 (arquitectura base): https://docs.ultralytics.com/models/yolo11/
- Copernicus Sentinel-2 (datos de imagen): https://sentinel.esa.int/web/sentinel/missions/sentinel-2
- Microsoft Planetary Computer (proveedor de los composites): https://planetarycomputer.microsoft.com/
- OpenStreetMap (etiquetas): https://www.openstreetmap.org/
- Geofabrik, extracto de Turquía: https://download.geofabrik.de/europe/turkey.html
- Licencia ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
