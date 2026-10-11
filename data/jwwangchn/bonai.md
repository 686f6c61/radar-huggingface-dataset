# jwwangchn/BONAI

## Resumen

BONAI (LOFT) es un modelo de extracción de huellas de edificios (*building footprint extraction*, BFE) en imágenes aéreas oblicuas (*off-nadir*), desarrollado por Jinwang Wang y colaboradores en el marco del proyecto BONAI y publicado en el artículo *Learning to Extract Building Footprints from Off-Nadir Aerial Images* (IEEE TPAMI, 2022). El repositorio de HuggingFace distribuye exclusivamente los pesos preentrenados oficiales del modelo LOFT: un único checkpoint de 651.220.024 bytes denominado `BONAI-LOFT-ROA-F1Score-64.31.pth`.

El problema que resuelve es específico del ámbito de la teledetección: en imágenes aéreas tomadas con inclinación (no cenitales), el techo del edificio aparece desplazado respecto a su huella real en el suelo. LOFT aprende a extraer simultáneamente el contorno del techo y la huella proyectada, aprovechando el vector de desplazamiento (*offset*) anotado para cada instancia. Se entrenó sobre el conjunto de datos BONAI, compuesto por 3.300 imágenes aéreas de seis ciudades chinas (Shanghái, Pekín, Harbin, Jinan, Chengdu y Xi'an) con 268.958 instancias de edificios anotadas a nivel de instancia.

Es relevante porque aborda un sesgo sistemático que degrada los métodos convencionales de segmentación aplicados a imágenes oblicuas, y porque publica pesos, código y dataset de forma abierta bajo licencia MIT. No se trata de un modelo de lenguaje: es un modelo de visión por computador orientado a detección y segmentación de instancias, implementado sobre MMDetection y consumido a través de la base de código oficial en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LOFT, red de detección y segmentación de instancias implementada sobre MMDetection (no se detalla la topología interna en la información disponible) |
| Parámetros totales | no disponible (el checkpoint ocupa 651.220.024 bytes) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; la entrada son imágenes aéreas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT para el código; checkpoint distribuido por los autores para investigación con el código oficial |
| Formato de pesos | `.pth` (state_dict de PyTorch) |

## Arquitectura y entrenamiento

La información disponible no desglosa la topología interna del modelo LOFT más allá de indicar que se implementa en la base de código oficial basada en MMDetection, orientada a detección y segmentación de instancias con PyTorch. El pipeline declarado en HuggingFace es `object-detection`, con etiquetas adicionales de `instance-segmentation` y `remote-sensing`.

El entrenamiento se realizó sobre el conjunto de datos BONAI, que contiene 268.958 instancias de edificios distribuidas en 3.300 imágenes aéreas oblicuas de seis ciudades chinas. Cada edificio cuenta con anotación a nivel de instancia del techo y de la huella, además del vector de desplazamiento correspondiente. No se especifican en la información proporcionada el número de tokens (no aplica), el número de iteraciones, la composición exacta del dataset más allá de su procedencia geográfica, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables a este dominio). La innovación técnica destacable es el propio objetivo de aprendizaje: modelar la relación entre techo y huella a partir de imágenes no cenitales, en lugar de asumir una proyección vertical como hacen los enfoques convencionales.

## Capacidades

- Detección de edificios en imágenes aéreas oblicuas mediante el pipeline de object-detection.
- Segmentación de instancias a nivel de edificio, con etiquetas diferenciadas para techo y huella.
- Extracción de huellas de edificios (*building footprint extraction*) compensando el desplazamiento por perspectiva de la imagen no cenital.
- Estimación implícita del vector de desplazamiento entre techo y huella por instancia, según la formulación del dataset.
- Evaluación integrada mediante `tools/bonai/bonai_evaluation.py` en el repositorio oficial.
- Soporte de tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no aplica (no es un modelo de lenguaje).
- Capacidades de visión general, audio o modo de razonamiento (*thinking mode*): no disponible.

## Casos de uso

- Cartografía de edificios a partir de ortofotografías oblicuas: el modelo extrae la huella de cada edificio en lugar del contorno del techo, lo que permite generar capas vectoriales georreferenciadas más precisas cuando la imagen no es estrictamente cenital.
- Actualización de bases de datos catastrales: integrado en un pipeline con MMDetection, puede procesar lotes de imágenes aéreas de una ciudad y producir geometrías de edificio comparables con registros previos para detectar construcciones nuevas o modificadas.
- Planificación urbana y análisis de densidad edificatoria: al producir segmentación de instancias, permite calcular número de edificios, superficie de huella y distribución espacial por barrio sobre imágenes de vuelos no cenitales.
- Respuesta ante catástrofes: la extracción rápida de huellas permite estimar superficie construida afectada tras un evento, trabajando con imágenes oblicuas captadas en vuelos de emergencia que no cumplen condiciones cenitales.
- Monitorización de expansión urbana en series temporales: aplicar el mismo modelo a vuelos de distintas fechas permite comparar huellas por instancia y detectar crecimiento periurbano.
- Generación de datos de entrenamiento para otros modelos de segmentación: las salidas del modelo sobre imágenes no anotadas pueden emplearse como pseudoetiquetas, dado que su objetivo incluye explícitamente la huella y no solo el techo.
- Investigación en teledetección: reproducción de los resultados del artículo TPAMI mediante el checkpoint oficial y el script de evaluación, útil como línea base en trabajos de BFE sobre imágenes oblicuas.

## Benchmarks y rendimiento

El único dato de rendimiento presente en la información proporcionada es el que aparece en el nombre del archivo del checkpoint, que indica un F1 de 64,31 (etiqueta `ROA`). No se dispone de otros resultados de benchmarks en la información disponible, por lo que no se presenta tabla comparativa de métricas.

| Métrica | Valor | Fuente |
|---|---|---|
| F1 (etiqueta `ROA` del nombre del checkpoint) | 64,31 | `BONAI-LOFT-ROA-F1Score-64.31.pth` |
| Otras métricas (mIoU, AP, precisión, recall) | no disponible | — |

## Requisitos de hardware

- Los pesos ocupan aproximadamente 651 MB, por lo que el checkpoint en sí es manejable en cualquier GPU con al menos 2-3 GB de VRAM libre, siempre que se procesen recortes de imagen moderados.
- Las estimaciones de VRAM dependen del tamaño de entrada y del backbone, no especificado en la información disponible. Como referencia orientativa, la inferencia con MMDetection sobre recortes de 512-1024 px suele requerir entre 2 y 8 GB de VRAM; no se dispone de mediciones oficiales para LOFT.
- GPU recomendadas: no disponible de forma oficial. Por el tamaño del modelo, cabe esperar que funcione en GPUs de consumo como RTX 3060, RTX 4060, RTX 3080 o RTX 4090, así como en A100 o H100 para procesamiento por lotes a gran escala.
- Ejecución en CPU: técnicamente posible con PyTorch, pero con latencias muy superiores; no se publican cifras.
- Opciones de despliegue: el modelo se ejecuta a través de la base de código oficial basada en MMDetection. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se proporcionan en la información datos de rendimiento de modelos comparables, por lo que la comparación se limita a características estructurales conocidas del ámbito de la segmentación aplicada a teledetección. Los valores de rendimiento se marcan como no disponibles.

| Modelo | Tipo | Datos de entrenamiento | Contexto/entrada | Licencia | Rendimiento |
|---|---|---|---|---|---|
| BONAI (LOFT) | Detección y segmentación de instancias sobre MMDetection | Dataset BONAI (3.300 imágenes, 268.958 instancias, 6 ciudades) | Imágenes aéreas oblicuas | MIT (código) | F1 64,31 (etiqueta `ROA` del checkpoint) |
| Mask R-CNN (línea base genérica) | Segmentación de instancias | COCO y otros; no específico de BFE | Imágenes RGB | Apache 2.0 (implementaciones de referencia) | no disponible para BFE oblicuo |
| U-Net (línea base genérica) | Segmentación semántica | Variable; no específico de BFE | Imágenes RGB | variable según implementación | no disponible para BFE oblicuo |
| SAM (Segment Anything) | Segmentación promptable genérica | SA-1B | Imágenes RGB con prompts | Apache 2.0 | no disponible para BFE oblicuo |

Las líneas base genéricas no modelan explícitamente el desplazamiento entre techo y huella en imágenes no cenitales, que es precisamente la aportación de LOFT. No se dispone de cifras comparativas directas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con imágenes de seis ciudades chinas, por lo que su generalización a otras regiones, tipologías constructivas y condiciones de captura no está documentada.
- No se especifican en la información las condiciones de adquisición (resolución, altitud, sensor) bajo las que el modelo mantiene su rendimiento, lo que dificulta prever su comportamiento fuera de ese dominio.
- El nombre del checkpoint indica un F1 de 64,31, lo que sugiere margen de error apreciable en la extracción de huellas; conviene validar sobre datos propios antes de usarlo en producción.
- Riesgo de alucinación o falsos positivos: como todo modelo de detección, puede generar instancias espurias en texturas que recuerdan a edificios (sombras, cubiertas, infraestructuras).
- El rendimiento depende de que la imagen de entrada sea efectivamente oblicua; la información no indica cómo se comporta con imágenes cenitales ni con ángulos extremos.
- No se documentan sesgos demográficos o sociales, pero sí un sesgo geográfico y arquitectónico derivado del conjunto de entrenamiento.
- Licencia: el código es MIT, pero la model card indica que el checkpoint se distribuye para uso en investigación con el código oficial; conviene revisar el repositorio de GitHub antes de un uso comercial.
- No se especifican requisitos de preprocesado, normalización ni postprocesado más allá de lo que define la base de código MMDetection, lo que implica dependencia de esa herramienta.
- El repositorio muestra 0 descargas y 0 *likes* en el momento de la consulta, señal de adopción muy limitada y de escasa validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jwwangchn/BONAI
- Dataset BONAI: https://huggingface.co/datasets/jwwangchn/BONAI
- Repositorio de código oficial: https://github.com/jwwangchn/BONAI
- Artículo (arXiv): https://arxiv.org/abs/2204.13637
- Artículo (DOI IEEE TPAMI): https://doi.org/10.1109/TPAMI.2022.3162583
