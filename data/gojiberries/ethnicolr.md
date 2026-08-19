# gojiberries/ethnicolr

## Resumen

Ethnicolr es un conjunto de modelos neuronales diseñados para estimar la categoría de raza o etnia a partir de apellidos y nombres completos, desarrollado por el equipo de appeler. El repositorio `gojiberries/ethnicolr` en Hugging Face actúa como almacén de artefactos del paquete Python `ethnicolr`, que proporciona la API pública, la validación de entradas, la calibración y el comportamiento de abstención. El modelo resuelve un problema de clasificación demográfica basado en la secuencia de caracteres de un nombre, con aplicaciones en investigación social y estudios de sesgo.

Los modelos utilizan una arquitectura LSTM (Long Short-Term Memory) que codifica bigramas de caracteres superpuestos, con una longitud máxima de secuencia de 20 para apellidos y 25 para nombres completos. El repositorio incluye nueve variantes de modelo entrenadas con diferentes fuentes de datos: tablas de apellidos del censo de EE. UU. (2000, 2010 y 2020), registros de votantes de Florida y Carolina del Norte, y biografías de Wikipedia/Wikidata. Cada variante tiene su propio vocabulario, etiquetas y estadísticas de calibración, lo que permite seleccionar el modelo adecuado según la fuente de referencia deseada.

La relevancia de este modelo radica en que aborda una tarea sensible con un enfoque metodológico riguroso: los artefactos incluyen estadísticas de calibración mediante escalado de temperatura y conjuntos de predicción conformales adaptativos, y el paquete se abstiene de predecir en entradas sin características conocidas o con escrituras no soportadas. No se trata de un modelo de lenguaje generativo, sino de un clasificador especializado para investigación demográfica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM con codificacion de bigramas de caracteres superpuestos |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 20 caracteres para apellidos; 25 para nombres completos |
| Tipos de cuantizacion | no disponible (pesos en punto flotante estandar de PyTorch) |
| Idiomas soportados | no disponible (diseñado para nombres en escritura latina; el paquete se abstiene en escrituras no soportadas) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dictionary (`.pt`) |

## Arquitectura y entrenamiento

Los modelos de Ethnicolr emplean una arquitectura LSTM que procesa secuencias de bigramas de caracteres superpuestos. La codificación de bigramas captura patrones morfológicos y ortográficos del nombre, lo que permite generalizar más allá de listas fijas de nombres. Las secuencias de apellidos tienen una longitud máxima de 20 caracteres, mientras que las de nombres completos llegan a 25. El vocabulario se aprende exclusivamente de las filas de entrenamiento, evitando la fuga de información del conjunto de validación.

El entrenamiento se realiza con diferentes fuentes de datos según la variante: tablas de apellidos del censo de EE. UU. (2000, 2010, 2020), registros de votantes de Florida y Carolina del Norte, y biografías de Wikipedia/Wikidata. Los conjuntos de Florida y Carolina del Norte se dividen antes del balanceo para evitar la superposición de fuentes que existía en versiones anteriores. Tras el entrenamiento, se aplica escalado de temperatura y predicción conformal adaptativa, utilizando mitades separadas de los datos de validación para cada técnica. Las estadísticas resultantes (temperatura, ECE, puntuación Brier multiclase, cobertura observada y tamaño medio del conjunto de predicción) se almacenan en archivos JSON junto a cada modelo.

Una innovación metodológica destacable es el comportamiento de abstención: el paquete rechaza predecir en entradas con escrituras no soportadas o sin características conocidas, lo que reduce el riesgo de predicciones erróneas en casos ambiguos. Además, el repositorio se fija por un SHA completo de commit, garantizando la reproducibilidad de los artefactos descargados.

## Capacidades

- Clasificación de raza o etnia a partir de apellidos con 4 categorías (modelos Census 2000, 2010, 2020) con precisión top-1 de 0.833, 0.808 y 0.807 respectivamente.
- Clasificación de raza o etnia a partir de apellidos con 5 categorías (modelo Florida voter) con precisión top-1 de 0.588.
- Clasificación de raza o etnia a partir de nombre completo con 5 categorías (modelo Florida voter full name) con precisión top-1 de 0.677.
- Clasificación de raza o etnia a partir de nombre completo con 12 categorías (modelo North Carolina voter) con precisión top-1 de 0.425.
- Clasificación de raza o etnia a partir de apellidos con 13 categorías (modelo Wikipedia/Wikidata surname) con precisión top-1 de 0.775.
- Clasificación de raza o etnia a partir de nombre completo con 13 categorías (modelo Wikipedia/Wikidata full name) con precisión top-1 de 0.863.
- Clasificación de origen de nombre con 90 categorías (modelo Wikipedia/Wikidata origin) con precisión top-1 de 0.626.
- Calibración mediante escalado de temperatura y conjuntos de predicción conformales adaptativos.
- Comportamiento de abstención en entradas no soportadas o sin características conocidas.
- Salida de distribución de probabilidad completa sobre todas las categorías.

## Casos de uso

- Investigación sociodemográfica: los modelos permiten estimar la distribución de categorías raciales o étnicas en grandes conjuntos de datos nominales, por ejemplo, para estudiar la representación de grupos en registros públicos o encuestas. Se usaría el modelo Census 2020 con apellidos para obtener probabilidades por categoría y agregarlas a nivel de población.
- Auditoría de sesgos en sistemas de contratación: las organizaciones pueden analizar si sus procesos de selección producen resultados desiguales entre grupos demográficos aplicando el modelo a los nombres de los candidatos y comparando las tasas de avance por categoría estimada. El modelo Florida voter full name ofrece mayor precisión cuando se dispone de nombre y apellido.
- Estudios de segregación residencial: los investigadores pueden cruzar registros de votantes o padrones con datos geográficos para analizar patrones de segregación por origen étnico, utilizando el modelo North Carolina voter que distingue 12 categorías.
- Análisis de representación en medios: se puede aplicar el modelo Wikipedia/Wikidata a los nombres de periodistas, actores o figuras públicas para estudiar la diversidad en la cobertura mediática. La variante con 13 categorías ofrece un equilibrio entre granularidad y precisión.
- Validación de datos históricos: los modelos Census 2000, 2010 y 2020 permiten comparar cómo cambian las distribuciones estimadas a lo largo del tiempo, útil para estudios longitudinales sobre cambios demográficos en EE. UU.
- Investigación en lingüística computacional: el modelo de origen con 90 categorías puede utilizarse para estudiar la relación entre la ortografía de los nombres y su origen geográfico, complementando análisis etimológicos tradicionales.

## Benchmarks y rendimiento

Los resultados de precisión provienen de poblaciones de evaluación reservadas, documentadas en los archivos de estadísticas de cada modelo. Florida y Carolina del Norte utilizan divisiones disjuntas por fuente, y los resultados de Carolina del Norte se ponderan según la frecuencia de votantes previa a la deduplicación. Las métricas no son directamente comparables entre fuentes de datos.

| Modelo | Entrada | Categorias | Top-1 | Top-3 |
| --- | --- | ---: | ---: | ---: |
| Census 2000 | apellido | 4 | 0.833 | 0.993 |
| Census 2010 | apellido | 4 | 0.808 | 0.984 |
| Census 2020 | apellido | 4 | 0.807 | 0.988 |
| Florida voter | apellido | 5 | 0.588 | 0.947 |
| Florida voter | nombre completo | 5 | 0.677 | 0.948 |
| North Carolina voter | nombre completo | 12 | 0.425 | 0.896 |
| Wikipedia/Wikidata | apellido | 13 | 0.775 | 0.907 |
| Wikipedia/Wikidata | nombre completo | 13 | 0.863 | 0.954 |
| Wikipedia/Wikidata origin | nombre completo | 90 | 0.626 | 0.809 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Los modelos son pequeños (redes LSTM con vocabularios de bigramas) y pueden ejecutarse en CPU sin problemas.
- La memoria necesaria es mínima: cada archivo de pesos `.pt` ocupa unos pocos megabytes, muy por debajo de los modelos de lenguaje modernos.
- No se requiere GPU para inferencia; una CPU moderna ejecuta las nueve variantes en menos de un segundo.
- El paquete Python `ethnicolr` gestiona la descarga de pesos a través de la caché de Hugging Face y permite especificar un directorio de caché propio con la variable de entorno `ETHNICOLR_MODEL_CACHE`.
- No se han publicado datos de latencia o throughput, pero dado el tamaño de los modelos, son adecuados para procesamiento por lotes de millones de nombres en cuestión de minutos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Categorias | Licencia | Disponibilidad |
| --- | --- | --- | ---: | --- | --- |
| Ethnicolr (este repositorio) | LSTM con bigramas | apellido o nombre completo | 4 a 90 segun variante | MIT | Hugging Face + PyPI |
| Ethnicolr2 | LSTM (implementacion moderna) | apellido o nombre completo | 5 (censo y Florida) | MIT | GitHub + PyPI |
| naampy | no disponible | nombres (listas electorales indias) | no disponible | no disponible | GitHub |

Ethnicolr2 es una implementación más reciente con modelos que hacen supuestos diferentes (por ejemplo, entrenados con nombres únicos) y se centra en datos del censo de EE. UU. y Florida. `naampy` se orienta a listas electorales indias, un dominio geográfico distinto. La principal ventaja de Ethnicolr es su variedad de fuentes de datos y categorías, que cubren desde 4 hasta 90 clases, además de su enfoque en calibración y abstención.

## Limitaciones y advertencias

- Los modelos estiman patrones de nombres asociados a una población de referencia, no evidencia de la identidad, ascendencia, ciudadanía, raza o etnia de una persona.
- No deben utilizarse para perfiles individuales ni para decisiones sobre empleo, educación, crédito, vivienda, actuación policial, atención sanitaria, elegibilidad o acceso a servicios.
- Las fuentes de datos (censo de EE. UU., registros de votantes, Wikipedia/Wikidata) representan poblaciones diferentes y codifican sus propias opciones de medición y sesgos históricos.
- La ciudadanía en Wikipedia es solo un proxy del origen del nombre, no una medida directa.
- Las categorías y la cobertura de los registros de votantes no representan a la población completa.
- Los nombres son ambiguos y la transliteración cambia la información; el rendimiento puede variar según la época, la geografía, el idioma y los subgrupos.
- Las métricas de precisión no son comparables entre fuentes de datos debido a las diferencias en las poblaciones de evaluación.
- Se recomienda utilizar la distribución de probabilidad completa o un conjunto de predicción calibrado en lugar de una única etiqueta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gojiberries/ethnicolr
- Repositorio GitHub (codigo fuente, scripts de adquisicion, model cards): https://github.com/appeler/ethnicolr
- Paquete PyPI: https://pypi.org/project/ethnicolr/
- Implementacion alternativa (ethnicolr2): https://github.com/appeler/ethnicolr2
- Documentacion de ethnicolr2: https://appeler.github.io/ethnicolr2/index.html
- Articulo academico "Predicting Race and Ethnicity From the Sequence of Characters in a Name": https://arxiv.org/pdf/1805.02109
