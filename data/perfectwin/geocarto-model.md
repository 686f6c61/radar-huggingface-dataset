# PerfectWin/geocarto-model

## Resumen

GeoCarto model es un modelo de segmentación de imágenes especializado en cartografía geológica, desarrollado por el usuario PerfectWin. Su función es convertir mapas geológicos rasterizados o escaneados en un GeoPackage listo para abrir en QGIS o ArcGIS, con una capa de polígonos de unidades geológicas (con código, nombre, edad y litología cuando son legibles), una capa de líneas de fallas, la tabla de leyenda y estilos QGIS por defecto. Se distribuye como una investigación en fase de vista previa (v0.2).

El modelo combina una red U-Net++ con backbone EfficientNet-B4 que recibe 6 canales (RGB + CIE-Lab) y predice 10 mapas de afinidad de píxeles más un mapa de fallas, seguido de un watershed mutex para generar polígonos a resolución completa y un pipeline de OCR (EasyOCR) con un ranker de gradient boosting para asignar nombres a las unidades. El repositorio tiene un tamaño de 0.0 GB según Hugging Face, por lo que los pesos no están disponibles en el momento de la consulta.

Es relevante para equipos de geología, GIS y teledetección que necesitan digitalizar cartografía geológica en papel o raster de forma semiautomática, con un enfoque conservador en el etiquetado: solo asigna nombre cuando la confianza es ≥ 0,8 y, en caso contrario, marca la unidad como no identificada con sugerencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net++ con backbone EfficientNet-B4; entrada de 6 canales (RGB + CIE-Lab); predicción de 10 afinidades de píxeles (offsets 1–27 px) y mapa de fallas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); ventana deslizante de 512 px con stride 384 y mezcla Hann |
| Tipos de cuantizacion | pesos en FP16 (`best_fp16.pt`); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (OCR entrenado para códigos en escritura latina) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), además de pickles de scikit-learn (`.pkl`) para los modelos de naming |

## Arquitectura y entrenamiento

El pipeline se compone de cinco etapas. Primero, una red U-Net++ con backbone EfficientNet-B4 procesa parches de 512 px con stride 384 y mezcla Hann, tomando RGB + CIE-Lab (6 canales) y produciendo 10 mapas de afinidad de píxeles (desplazamientos de 1 a 27 px) más un mapa de fallas. Segundo, se aplica un watershed mutex sobre las afinidades a resolución completa, con región mínima de 40 px, y se vectoriza con rasterio. Tercero, las fallas se extraen esqueletizando el mapa de fallas y trazando líneas. Cuarto, se ejecuta EasyOCR sobre el mapa completo. Quinto, un ranker de gradient boosting puntúa cada par (polígono, código candidato) usando evidencia OCR, características de líneas guía, distancia al swatch de leyenda relativa al resto de swatches y la posición donde aparece el código en el mapa; solo se escribe nombre si la confianza es ≥ 0,8.

El entrenamiento se realizó sobre el dataset PerfectWin/geocarto v2.0, que cubre 4 continentes con escaneos reales del USGS GMNA y mapas sintéticos realistas. El checkpoint indicado es el paso 22 500. La ablación documentada en `training/lab_round4_ablation.csv` indica que la reponderación de pérdida para polígonos pequeños y OHEM se probaron y se rechazaron porque sobre-segmentan mapas reales. No se documenta el número total de tokens ni composición detallada del dataset en la información disponible.

## Capacidades

- Segmentación de instancias de unidades geológicas en mapas raster, con 10 mapas de afinidad y watershed mutex para generar polígonos.
- Detección y trazado de fallas como líneas a partir de un mapa de fallas dedicado.
- Reconocimiento óptico de caracteres (EasyOCR) sobre el mapa completo para extraer códigos y etiquetas.
- Asignación de nombres a unidades mediante un ranker de gradient boosting que combina evidencia OCR, líneas guía, distancia a swatches de leyenda y repetición del código en el mapa.
- Exportación a GeoPackage con capas `unites_geologiques`, `failles`, tabla `legende` y estilos QGIS en `layer_styles`.
- Atributos por polígono: `id`, `code`, `nom`, `age`, `lithologie`, `source_nom`, `confiance`, `texte_lu`, `suggestions`, `couleur_hex`, `couleur_carte`, `surface_km2`.
- Procesamiento de mapas georreferenciados en cualquier CRS.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Digitalización de cartografía geológica en papel: a partir de un escaneo georreferenciado y un CSV de leyenda, el pipeline genera un GeoPackage con polígonos de unidades y fallas, reduciendo el trabajo manual de vectorización en QGIS.
- Actualización de bases de datos GIS institucionales: el modelo permite incorporar mapas históricos escaneados (por ejemplo, del USGS GMNA) a un SIG corporativo con atributos de código, edad y litología cuando son legibles.
- Control de calidad de leyendas: la tabla `legende` y la columna `suggestions` permiten revisar qué unidades no alcanzaron confianza ≥ 0,8 y priorizar la revisión humana sobre esas áreas.
- Análisis de riesgo geológico: la capa `failles` permite calcular proximidad de infraestructuras a fallas y cruzar con otras capas vectoriales en QGIS.
- Docencia e investigación en geología estructural: la exportación con estilos QGIS por defecto facilita la creación de materiales didácticos y la comparación entre mapas vectorizados y originales.
- Integración en pipelines de publicación cartográfica: el comando `vectorize.py` y el script de verificación `qgis_test.py` permiten automatizar la generación y validación de GeoPackages antes de su publicación.
- Extracción de superficies por unidad (`surface_km2`) para estudios de distribución de litologías a escala regional.

## Benchmarks y rendimiento

Resultados en el split de test retenido (608 teselas), según la model card:

| Grupo | ARAND ↓ | Recall pequeño | Recall grande | Área correcta | F1 fallas (2 px) |
|---|---|---|---|---|---|
| África (sintético) | 0,030 | 89,6 % | 97,9 % | 99,3 % | – |
| Europa (sintético) | 0,099 | 82,2 % | 90,4 % | 92,0 % | – |
| Norteamérica (todo) | 0,091 | 72,5 % | 90,5 % | 95,1 % | 0,95 |
| Oceanía (sintético) | 0,176 | 63,9 % | 75,6 % | 83,5 % | 0,99 |
| GMNA escaneos reales | 0,052 | 74,7 % | 93,4 % | 98,3 % | 0,63 |
| Test completo | 0,107 | 70,5 % | 86,2 % | 92,1 % | 0,97 |
| Trampa: unidades vecinas del mismo color | 0,151 | 62,8 % | 76,9 % | 84,9 % | 0,97 |
| Trampa: unidades con patrón | 0,099 | 74,3 % | 89,8 % | 93,9 % | 0,98 |

Naming end-to-end en 9 ventanas reales de 2048 × 2048 px del GMNA north sheet (ranker entrenado solo con el south sheet):

| Métrica | Valor |
|---|---|
| Área que recibe nombre (confianza ≥ 0,8) | 30,0 % (por ventana 4 %–57 %) |
| Nombre correcto sobre el área nombrada | 91,6 % (por ventana 76 %–98 %) |
| Área correctamente nombrada sobre el mapa completo | 27,5 % |

Benchmark cruzado entre hojas sobre polígonos de referencia (38 ventanas, ambas direcciones): los nombres con confianza ≥ 0,8 son correctos en el 94–96 % de los casos sobre aproximadamente un tercio del área.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint se distribuye en FP16 (`best_fp16.pt`), lo que reduce el requisito frente a FP32, pero no se indica el tamaño del modelo.
- GPU recomendadas: no disponible. La arquitectura U-Net++ / EfficientNet-B4 con ventana deslizante de 512 px es compatible con GPUs de consumo, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el uso de FP16 y parches de 512 px sugiere que podría ejecutarse en GPUs de gama media-alta, pero no hay datos publicados.
- Opciones de despliegue: ejecución mediante `python vectorize.py` con PyTorch; verificación con `qgis_test.py` y PyQGIS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de segmentación).
- Latencia y throughput: no disponibles.
- Límite de tamaño de entrada: mapas de hasta aproximadamente 6000 × 6000 px en una sola pieza para el watershed; mapas mayores deben dividirse.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de vectorización de mapas geológicos en la información proporcionada. Como referencia de categoría, se puede comparar con:

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoCarto model | U-Net++ / EfficientNet-B4 + watershed + OCR + ranker | Raster georreferenciado + CSV de leyenda | GeoPackage (polígonos, fallas, leyenda, estilos) | CC BY-SA 4.0 | Hugging Face (repo de 0.0 GB) |
| Segment Anything (SAM) | Segmentación de propósito general | Imagen RGB | Máscaras | Apache 2.0 | Pública |
| Modelos de segmentación geológica específicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos con alternativas en la información disponible.

## Limitaciones y advertencias

- Unidades pequeñas: aproximadamente 1 de cada 4 polígonos pequeños en escaneos reales se pierde o se fusiona.
- El naming depende de que las etiquetas estén impresas y sean legibles; las unidades sin etiqueta se dejan como "Unité non identifiée" con sugerencias, sin adivinar.
- El reconocimiento de texto está entrenado para códigos en escritura latina; otras escrituras no están soportadas según la model card.
- La validación en escaneos reales se limita al USGS Geologic Map of North America; otros continentes se evalúan sobre renderizados sintéticos realistas de mapas vectoriales oficiales.
- La detección de fallas en escaneos reales (F1 0,63) es mucho más débil que en mapas sintéticos.
- Mapas grandes deben procesarse por debajo de ~6000 × 6000 px o dividirse, por el coste del watershed a resolución completa.
- Los ficheros `.pkl` son pickles de scikit-learn; solo deben cargarse desde este repositorio por motivos de seguridad.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia.
- El repositorio figura con 0.0 GB y 0 descargas, por lo que la disponibilidad efectiva de los pesos no está confirmada.
- Riesgo de alucinación en el naming mitigado por el umbral de confianza ≥ 0,8, pero no eliminado; se recomienda revisión humana en producción.
- No se documentan sesgos demográficos ni lingüísticos más allá de la limitación a escritura latina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PerfectWin/geocarto-model
- Dataset: https://huggingface.co/datasets/PerfectWin/geocarto
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
