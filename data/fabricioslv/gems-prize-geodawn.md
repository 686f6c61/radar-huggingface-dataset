# fabricioslv/gems-prize-geodawn

## Resumen

`fabricioslv/gems-prize-geodawn` no es un modelo de lenguaje: es un mirror público del conjunto de datos GeoDAWN asociado al **GEMS Prize Challenge** (Geologic Enhanced Mapping System), una competición patrocinada por la Office of Geothermal del U.S. Department of Energy y alojada en DrivenData, con fecha límite en diciembre de 2026. El repositorio empaqueta las capas ráster de entrada y las etiquetas de fallas cuaternarias necesarias para entrenar y evaluar modelos de segmentación de fallas geológicas en la región del Great Basin (Nevada occidental).

El paquete contiene un GeoTIFF de 3292×3730 píxeles con 19 bandas en `float32` a resolución de 100 m en la proyección UTM 11N (EPSG:32611), que combina datos aeromagnéticos, aerorradiométricos, aerogravimétricos, topografía lidar/DEM, deformación geodésica GPS/InSAR, conductividad y sismicidad. Las etiquetas son un ráster binario `int8` derivado de la base de datos de fallas cuaternarias del USGS y del proyecto INGENIOUS. El tamaño total del repositorio es de aproximadamente 0,4 GB.

Su relevancia es práctica: facilita el entrenamiento en entornos como Kaggle o Colab sin tener que reconstruir el pipeline de descarga y rasterizado de las fuentes originales (USGS GeoDAWN, Great Basin Center for Geothermal Energy y USGS Quaternary Fault and Fold Database). No incluye pesos entrenados ni un pipeline de inferencia; es únicamente material de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un conjunto de datos ráster) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (datos geoespaciales, sin componente lingüístico) |
| Licencia | other (datos públicos USGS/DOE; reglas de la competición permiten datos externos con licencia compatible con el sponsor) |
| Formato de pesos | GeoTIFF (`float32` para features, `int8` para labels), JSON auxiliar |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado ni una arquitectura definida. Lo que sí define es la estructura del problema de aprendizaje automático que la competición plantea: segmentación binaria de fallas geológicas sobre un ráster multibanda de 19 canales a 100 m de resolución. Cada banda corresponde a una variable geofísica o geodésica concreta (anomalía magnética, campo reducido al polo, gradientes TMI horizontal y vertical, segundo invariante geodésico de deformación, pendiente gravimétrica isostática, curvatura/tilt, tasa de cizalla geodésica, tasa de dilatación, distancia a terremotos, intensidad/densidad sísmica, elevación sin tendencia y su pendiente, profundidad al basamento, conductividad superficial, entre otras).

Las etiquetas provienen de fallas cuaternarias mapeadas por el USGS y el proyecto INGENIOUS, rasterizadas a la misma rejilla. El mirror incluye además `tnm_items.json`, con URLs de teselas DEM de 1 m del USGS TNM para descarga bajo demanda, y `example_submission.tif` con el formato oficial de envío. No se documenta ningún proceso de entrenamiento, ajuste fino ni evaluación de modelos en la información disponible.

## Capacidades

- Segmentación binaria de fallas geológicas sobre ráster multibanda (19 bandas de entrada).
- Integración de datos geofísicos heterogéneos: magnetismo, gravimetría, radiometría, topografía, deformación geodésica y sismicidad.
- Evaluación con la métrica oficial de la competición: índice de Tversky ponderado por distancia, con kernel triangular de 300 m y parámetros α (falsos positivos) y β (falsos negativos).
- Generación de envíos en el formato oficial: GeoTIFF `float32` en rango 0-1, EPSG:32611, 100 m, con `nodata=nan` fuera del área de estudio.
- Descarga bajo demanda de teselas DEM de 1 m vía USGS TNM.
- No incluye pesos, inferencia, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Entrenamiento de modelos de segmentación semántica para detección de fallas: el ráster de 19 bandas sirve como entrada directa a arquitecturas tipo U-Net o SegFormer, con las etiquetas binarias como objetivo supervisado.
- Exploración geotérmica: la combinación de conductividad superficial, flujo magnético y gravimetría permite identificar estructuras favorables para recursos geotérmicos en el Great Basin.
- Evaluación de riesgo sísmico: las bandas de distancia a terremotos e intensidad sísmica permiten correlacionar fallas mapeadas con actividad reciente.
- Reproducción de la competición GEMS Prize: el mirror permite entrenar y validar localmente antes de enviar predicciones al leaderboard oficial de DrivenData.
- Prototipado rápido en Kaggle o Colab: al evitar el pipeline de descarga y rasterizado de las fuentes originales, reduce el tiempo de puesta en marcha.
- Investigación en aprendizaje geoespacial: útil para estudiar transferencia entre dominios geofísicos, aumento de datos ráster y pérdidas ponderadas por distancia.
- Docencia en teledetección y geociencia computacional: el conjunto es autocontenido y manejable (0,4 GB) para prácticas de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de ningún modelo entrenado ni resultados del leaderboard.

## Requisitos de hardware

- Almacenamiento: aproximadamente 0,4 GB para el repositorio completo; el GeoTIFF de features de 3292×3730×19 en `float32` ocupa en torno a 400 MB en disco.
- Memoria RAM: cargar el tensor completo en memoria requiere del orden de 1 GB en `float32`; el entrenamiento con parches reduce este requisito.
- GPU: no se especifican requisitos. Cualquier GPU consumer con 8 GB o más es suficiente para entrenar modelos de segmentación sobre parches del ráster; no hay datos de latencia ni throughput.
- Despliegue: no aplica (no hay pesos ni pipeline de inferencia). El acceso se realiza mediante bibliotecas geoespaciales como `rasterio`, `GDAL` o `rioxarray`.
- Entornos recomendados: Kaggle Notebooks, Google Colab o estaciones de trabajo locales con GDAL instalado.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros mirrors o conjuntos de datos comparables del GEMS Prize ni alternativas de la misma categoría con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo entrenado: no contiene pesos, arquitectura ni pipeline de inferencia; no puede usarse para predecir directamente.
- Cobertura geográfica restringida a la región del Great Basin (Nevada occidental) en EPSG:32611; no es extrapolable sin reentrenamiento.
- Las etiquetas dependen de la base de datos de fallas cuaternarias del USGS/INGENIOUS, con sesgos de muestreo y completitud propios del mapeo geológico.
- Licencia "other": el uso comercial y la redistribución están sujetos a las reglas de la competición y a las condiciones de los datos originales USGS/DOE; conviene verificar antes de cualquier uso fuera del contexto del reto.
- El mirror no es una afiliación oficial del GEMS Prize ni de DrivenData; el leaderboard y las reglas vigentes están únicamente en la plataforma oficial.
- El README está redactado en portugués y no documenta el preprocesado exacto aplicado a cada banda ni la fecha de corte de los datos.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fabricioslv/gems-prize-geodawn
- Competición GEMS Prize en DrivenData: https://www.drivendata.org/competitions/306/competition-doe-gems/
- USGS GeoDAWN (Geoscience Data Acquisition for Western Nevada): no disponible enlace directo en la información proporcionada
- USGS Quaternary Fault and Fold Database: no disponible enlace directo en la información proporcionada
- USGS TNM (teselas DEM 1 m): referenciado vía `tnm_items.json` en el repositorio
