# davideparisi/fi-forest

## Resumen

FI-FoRest v1 es un modelo de teledetección geoespacial desarrollado por davideparisi que reconstruye la estructura tridimensional del dosel forestal tras incendios en paisajes mediterráneos. No es un modelo de lenguaje, sino una red convolucional empaquetada en ONNX que fusiona 23 capas de satélite continuas para predecir la altura del dosel (`rh98`, `rh50`) y su incertidumbre (`sigma`, en metros) sobre una malla de 20 m, interpolando entre las dispersas huellas del lidar orbital GEDI de la NASA.

El modelo integra datos ópticos e índices de Sentinel-2 L2A, fenología invernal, estructura radar de Sentinel-1 RTC y geometría del terreno del DEM Copernicus GLO-30. Cada predicción combina parches contextuales de 300 m x 300 m (15 x 15 píxeles) calibrados sobre huellas GEDI de 25 m, lo que le permite generar mapas anuales continuos de altura de copa donde el muestreo lidar es escaso.

Su relevancia actual reside en la monitorización de la recuperación post-incendio y la estimación de combustible forestal en la cuenca mediterránea, con ventanas anuales de verano entre 2017 y 2026. El archivo ONNX pesa unos 15 MB (ensamble convolucional de cinco semillas) y alcanza aproximadamente 150 parches por segundo en CPU, lo que lo hace desplegable sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamble convolucional (5 semillas) sobre parches 2D; empaquetado en ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana espacial de 15 x 15 píxeles (300 m x 300 m a 20 m/píxel) |
| Tipos de cuantizacion | no disponible (pesos ONNX float32) |
| Idiomas soportados | no aplica (modelo geoespacial, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`fi_forest_v1.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un ensamble de cinco redes convolucionales entrenadas con distintas semillas, cuyo resultado se agrega para producir las predicciones medias (`rh98_mean_m`, `rh50_mean_m`) y la incertidumbre combinada epistémica y aleatoria (`rh98_sigma_m`). La entrada es un tensor `float32` de forma `(batch, 23, 15, 15)` denominado `raw_patch_23ch`, que codifica 23 capas continuas: 13 canales ópticos e índices de verano de Sentinel-2 (B02, B03, B04, B05, B06, B07, B08, B8A, B11, B12, NDVI, NBR, NDMI), 2 canales de fenología invernal (NDVI invernal y diferencia verano-invierno), 4 canales de estructura radar de Sentinel-1 RTC (VV, VH, VH-VV, RVI) y 4 canales de geometría del terreno del DEM GLO-30 (elevación, pendiente, seno y coseno del aspecto).

El entrenamiento se calibra sobre huellas de 25 m del lidar orbital GEDI de NASA/UMD, usando ventanas anuales de verano entre 2017 y 2026 y cinco sitios de estudio mediterráneos (Vesuvio, Monti Pisani, Montiferru, Aspromonte y North Evia). La salida se genera sobre una malla de 20 m alineada con Sentinel-2/Sentinel-1. No se detallan en la información disponible el número de tokens ni el volumen exacto del conjunto de entrenamiento, ni si se aplicaron técnicas de ajuste fino adicionales más allá del ensamble por semillas.

## Capacidades

- Predicción de altura del dosel: estima la altura de la parte superior de la copa (`rh98`, percentil 98) en metros.
- Predicción de altura mediana del dosel: estima `rh50` (percentil 50) en metros.
- Cuantificación de incertidumbre: devuelve `sigma` en metros, combinando incertidumbre epistémica y aleatoria.
- Fusión multisensor: integra 23 capas ópticas, radar, fenológicas y topográficas en una única inferencia.
- Reconstrucción espacial continua: interpola entre huellas GEDI dispersas para generar mapas de dosel de 20 m.
- Análisis temporal: genera mapas anuales de 2017 a 2026 para seguimiento de la evolución post-incendio.
- Inferencia en CPU: ejecutable con ONNX Runtime sin GPU, con throughput aproximado de 150 parches/s.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente geoespacial y regresivo.

## Casos de uso

- Monitorización de recuperación post-incendio: el modelo genera mapas anuales de altura de dosel en los cinco sitios mediterráneos, permitiendo comparar la estructura forestal antes y después de un incendio a lo largo de 2017-2026 y cuantificar la velocidad de rebrote.
- Evaluación de combustible forestal: la altura de copa (`rh98`, `rh50`) es un insumo directo para modelos de propagación de incendios; el modelo permite generar capas continuas de combustible donde GEDI no llega.
- Planificación de restauración forestal: los mapas de incertidumbre (`sigma`) permiten identificar zonas donde la predicción es menos fiable y priorizar muestreos de campo o vuelos lidar adicionales.
- Integración en pipelines de teledetección: al ser un ONNX de 15 MB con inferencia en CPU a ~6 ha/s, puede incrustarse en flujos automatizados de procesamiento de imágenes Sentinel sin infraestructura GPU.
- Análisis de estructura 3D en cuencas mediterráneas: combinando radar Sentinel-1 y DEM, el modelo estima la geometría del dosel en terrenos con pendiente, útil para estudios de erosión y balance hídrico.
- Validación cruzada con EFFIS: los polígonos oficiales de cicatrices de incendio de Copernicus EFFIS incluidos en el repositorio permiten cruzar las predicciones de altura con las áreas quemadas y evaluar la respuesta del dosel.
- Docencia y prototipado en ciencias ambientales: el bajo coste computacional y la licencia MIT facilitan su uso en cursos y proyectos de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de tablas de benchmark, ablación y throughput en `results/*.csv|json` dentro del repositorio de Hugging Face, pero no se proporcionan los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo ONNX pesa unos 15 MB y está pensado para CPU.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime podría usarse, pero no se documenta.
- Consumer GPU: sí cabe en cualquier GPU consumer, aunque el diseño apunta a inferencia en CPU.
- CPU de referencia: Intel Core i5-9400F (Windows 11) con ~150 parches/s, equivalente a ~6 ha/s.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (documentado); otros runtimes ONNX no se detallan.
- Latencia y throughput: ~150 parches/s en la CPU de referencia; no se documentan latencias en GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (regresión de altura de dosel con fusión Sentinel-1/2, GEDI y DEM) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ámbito geográfico restringido: calibrado y validado en cinco sitios mediterráneos (Vesuvio, Monti Pisani, Montiferru, Aspromonte, North Evia); su extrapolación a otros biomas o regiones no está documentada.
- Dependencia de GEDI: la calibración se basa en huellas lidar de 25 m, cuya cobertura es dispersa; la fiabilidad fuera de esas huellas depende de la interpolación y de la incertidumbre reportada.
- Ventana temporal limitada: cubre veranos de 2017 a 2026; no se documenta su comportamiento fuera de ese rango.
- Resolución de salida de 20 m: no apta para análisis subparcelarios o de vegetación de pequeña escala.
- Incertidumbre dependiente del contexto: `sigma` refleja la incertidumbre del ensamble, pero no se detalla su calibración estadística ni su cobertura empírica.
- Sin capacidades lingüísticas ni de agente: no debe emplearse para tareas de texto, código o razonamiento.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni responsabilidades del autor; los datos satelitales de terceros (NASA GEDI, ESA Copernicus, Microsoft Planetary Computer) tienen sus propias condiciones de uso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davideparisi/fi-forest
- Código fuente y pipelines reproducibles: https://github.com/parisid/fi-forest
- NASA/UMD GEDI: https://gedi.umd.edu/
- ESA Copernicus Sentinel-1: https://sentinel.esa.int/web/sentinel/missions/sentinel-1
- ESA Copernicus Sentinel-2: https://sentinel.esa.int/web/sentinel/missions/sentinel-2
- Copernicus DEM GLO-30: https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM
- Copernicus EFFIS: https://effis.jrc.ec.europa.eu/
- Microsoft Planetary Computer: https://planetarycomputer.microsoft.com/
