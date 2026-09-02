# OneScience-Group/AlphaEarthFoundations

## Resumen

AlphaEarthFoundations es un modelo de campo de embeddings espacio-temporales multi-fuente para la observación global de la Tierra, desarrollado por los equipos de investigación de Google DeepMind y Google. El modelo integra datos asíncronos y dispersos procedentes de imágenes ópticas, radar, LiDAR, variables climáticas, elevación, cobertura del suelo y texto geográfico, y los codifica en embeddings de 64 dimensiones sobre una esfera unitaria. Estos embeddings sirven para tareas de clasificación, regresión y detección de cambios con un número reducido de etiquetas.

El modelo fue entrenado con más de tres mil millones de observaciones, utilizando series temporales de Sentinel-2, Sentinel-1 y Landsat-8/9 como entrada, y datos de PALSAR-2, ERA5-Land, GEDI, GRACE, Copernicus DEM, NLCD y texto geográfico como objetivos de aprendizaje. Su relevancia actual radica en que ofrece una representación unificada y continua del territorio que permite generar mapas y sistemas de monitorización a escalas local y global de forma precisa y eficiente, superando en precisión a métodos tradicionales y a otros sistemas de mapeo por IA según los resultados publicados.

El repositorio de HuggingFace incluye un marco de trabajo de ingeniería con datos sintéticos que preservan las dimensiones reales del paper (extensión de 1,28 km × 1,28 km, rejilla de 10 metros, 65 frames de Sentinel-2, 17 de Sentinel-1 y 21 de Landsat), pero no incluye los pesos entrenados del modelo v2.0/v2.1, que no han sido liberados por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Campo de embeddings espacio-temporales (embedding field) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo geoespacial, no de lenguaje) |
| Tipos de cuantizacion | s8² (int8 con signo) mencionado en el paper; float32 para inferencia |
| Idiomas soportados | en (documentacion; el modelo procesa datos geoespaciales, no texto natural) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

AlphaEarthFoundations se basa en un campo de embeddings que asimila simultaneamente contexto espacial, temporal y de medicion procedente de multiples fuentes de observacion de la Tierra. A diferencia de los modelos de lenguaje, no procesa tokens textuales sino observaciones geoespaciales asincronas, fusionandolas en una representacion vectorial continua de 64 dimensiones normalizada a la esfera unitaria. Esta representacion permite comparar directamente embeddings de diferentes ubicaciones y momentos temporales, lo que facilita tareas de clasificacion, regresion y deteccion de cambios.

El entrenamiento se realizo con mas de tres mil millones de observaciones, combinando series temporales de Sentinel-2 (65 frames), Sentinel-1 (17 frames) y Landsat-8/9 (21 frames) como entradas. Como objetivos de aprendizaje se utilizaron datos de PALSAR-2 (radar de apertura sintetica en banda L), ERA5-Land (reanalisis climatico), GEDI (LiDAR espacial), GRACE (gravedad y agua terrestre), Copernicus DEM (elevacion), NLCD (cobertura del suelo nacional de EE. UU.) y texto geografico. El modelo no emplea tecnicas de RLHF ni DPO; se trata de un aprendizaje de representacion supervisado por multiples objetivos. El paper describe el proceso completo en el articulo arxiv 2507.22291.

## Capacidades

- Generacion de embeddings de 64 dimensiones en esfera unitaria que integran informacion optica, radar, LiDAR, clima, elevacion y cobertura del suelo.
- Clasificacion tematica con etiquetas escasas: permite entrenar clasificadores kNN o lineales sobre los embeddings con un numero reducido de puntos etiquetados.
- Regresion de variables biofisicas continuas, como emisividad de la superficie terrestre y evapotranspiracion.
- Deteccion de cambios en la superficie terrestre comparando embeddings de diferentes periodos de validez, tanto de forma supervisada como no supervisada.
- Fusion de observaciones asincronas y dispersas de multiples satelites en una unica representacion coherente.
- Soporte para cuantizacion s8² (int8 con signo) de los embeddings, lo que reduce el coste de almacenamiento y transmision sin perdida significativa de precision.
- Capacidad de inferencia global: el modelo puede generar mapas continuos de grandes extensiones de terreno a partir de datos satelitales.

## Casos de uso

- Mapeo tematico con etiquetas escasas: un equipo de investigacion puede disponer de unos pocos cientos de puntos de campo etiquetados (por ejemplo, tipos de cultivo) y utilizar los embeddings de 64 dimensiones para entrenar un clasificador kNN o lineal que extrapole la clasificacion a toda una region, reduciendo drasticamente el trabajo de campo necesario.

- Estimacion de variables biofisicas: para monitorizar la emisividad superficial o la evapotranspiracion a escala regional, el modelo regresa estas variables continuas directamente desde los embeddings, ofreciendo una alternativa a los modelos fisicos basados en ecuaciones que requieren multiples parametros de entrada.

- Deteccion de cambios de cobertura del suelo: comparando embeddings generados en diferentes fechas para la misma ubicacion, es posible identificar areas donde ha ocurrido deforestacion, urbanizacion o cambios en masas de agua, tanto mediante umbrales no supervisados como con clasificadores supervisados.

- Validacion de flujos de ingenieria: el repositorio incluye datos sinteticos que preservan las dimensiones reales del paper, permitiendo a equipos de ingenieria validar pipelines de entrenamiento, inferencia, cuantizacion y evaluacion antes de desplegar el modelo completo en produccion.

- Entrenamiento distribuido multi-GPU: el codigo soporta lanzamiento con `torchrun` para paralelismo de datos, lo que permite escalar el entrenamiento a multiples nodos y GPUs para experimentos formales con datos completos.

- Monitorizacion ambiental a escala global: organizaciones gubernamentales o ambientales pueden utilizar el modelo para generar mapas de cobertura del suelo, detectar anomalias termicas o estimar recursos hidricos (via GRACE) en regiones extensas sin necesidad de etiquetas densas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de Google DeepMind indica que AlphaEarthFoundations fue consistentemente el mas preciso en comparaciones con metodos tradicionales y otros sistemas de mapeo por IA, pero no se proporcionan cifras concretas de metricas como exactitud, F1, MAE o R² en los materiales consultados. Los resultados cuantitativos estan disponibles en el paper de arxiv, aunque no se reproducen en la informacion suministrada.

## Requisitos de hardware

- Se recomienda una GPU o DCU (procesador de aceleracion de Habana o similar) para entrenamiento e inferencia a escala real.
- Una CPU puede utilizarse para verificar la conectividad y ejecutar la configuracion de muestra pequena incluida en el repositorio, pero no es adecuada para entrenamiento completo ni inferencia global.
- El entrenamiento completo y la inferencia a escala global requieren recursos de aceleracion a gran escala (no se especifican GPUs concretas como A100 o H100 en la documentacion).
- Los usuarios de DCU deben instalar DTK 25.04.2 o posterior, o la version recomendada por OneScience para su cluster.
- El repositorio incluye instrucciones de instalacion para entornos GPU y DCU mediante el paquete `onescience[earth-gpu]` o `onescience[earth-dcu]`.
- No se proporcionan datos de VRAM estimada, latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos alternativos de la misma categoria. Aunque existen otros modelos de embeddings geoespaciales como SatMAE o SSL4EO, no se han encontrado datos de rendimiento comparables en la informacion proporcionada. Se recomienda consultar el paper de arxiv para ver la comparacion con metodos tradicionales y otros sistemas de mapeo por IA.

## Limitaciones y advertencias

- El repositorio de HuggingFace no incluye los pesos entrenados del modelo v2.0/v2.1; solo proporciona un marco de trabajo con datos sinteticos para validacion de ingenieria. Google y Google DeepMind no han liberado los checkpoints oficiales.
- Los datos sinteticos incluidos reducen el numero de muestras y el ancho interno del modelo respecto a la configuracion real del paper, por lo que los resultados obtenidos con ellos no son representativos del rendimiento final.
- El modelo esta disenado para observacion de la Tierra y no procesa lenguaje natural; la etiqueta de idioma "en" se refiere a la documentacion, no a capacidades linguisticas.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero es necesario verificar que los datos de entrenamiento originales (Sentinel, Landsat, etc.) cumplen con las politicas de uso de cada agencia espacial.
- No se han documentado sesgos especificos, pero al entrenarse con datos de observacion de la Tierra, podria presentar limitaciones en regiones con baja cobertura satelital o condiciones atmosfericas adversas (nubes, nieve).
- El riesgo de alucinacion no aplica en el sentido de generacion de texto, pero los embeddings podrian producir predicciones erroneas en areas donde los datos de entrada son escasos o ruidosos.
- Para uso en produccion, se recomienda validar el modelo con datos reales de la region de interes antes de desplegarlo, dado que no se han publicado resultados de benchmarks independientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/AlphaEarthFoundations
- Paper en arxiv: https://arxiv.org/abs/2507.22291
- Blog de Google DeepMind: https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/
- Articulo en Onmine (copia del blog): https://onmine.io/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail-2/
- Articulo en AISckool (copia del blog): https://aisckool.com/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/
