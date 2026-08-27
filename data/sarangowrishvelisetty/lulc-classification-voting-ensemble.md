# sarangowrishvelisetty/lulc-classification-voting-ensemble

## Resumen

El modelo `sarangowrishvelisetty/lulc-classification-voting-ensemble` es un clasificador de uso del suelo y cobertura terrestre (LULC, por sus siglas en inglés) basado en un ensemble de votación blanda implementado con scikit-learn. Desarrollado por el usuario sarangowrishvelisetty, el artefacto se distribuye como un archivo joblib (`ap_lulc_rf_voting_ensemble.joblib`) y está diseñado para clasificar observaciones en 13 clases de LULC a partir de características espectrales, índices, textura, elevación y distancia a la costa. El modelo combina tres estimadores base: un Random Forest, un Extra Trees y un HistGradientBoosting, con pesos de votación `[2, 1, 2]` respectivamente.

La relevancia de este modelo radica en su aplicación práctica para análisis geoespaciales, cartografía y restauración de tierras, ofreciendo una solución de clasificación multiclase con un rendimiento reportado de precisión global del 89,37 %. Aunque no es un modelo de lenguaje ni de visión, su enfoque de ensemble clásico sigue siendo útil en flujos de trabajo de teledetección donde se requiere interpretabilidad y bajo coste computacional. El repositorio tiene un tamaño de 0,3 GB y fue creado en agosto de 2026, aunque no se especifica la versión exacta de scikit-learn utilizada en el entrenamiento (se menciona 1.6.1 en el artefacto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Soft-voting `VotingClassifier` de scikit-learn con tres estimadores: Random Forest (200 árboles, `max_depth=30`), Extra Trees (200 árboles, `max_depth=30`, `class_weight="balanced"`) y HistGradientBoosting (`learning_rate=0.08`, `max_iter=300`, `l2_regularization=0.1`) |
| Parametros totales | No aplica (modelo clásico de árboles, no tiene parámetros neuronales) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica (los pesos se guardan en formato joblib/pickle) |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | No disponible |
| Formato de pesos | joblib/pickle (archivo `ap_lulc_rf_voting_ensemble.joblib`) |

## Arquitectura y entrenamiento

El modelo es un ensemble de votación blanda (soft voting) que combina las probabilidades predichas por tres algoritmos de aprendizaje automático clásicos: Random Forest, Extra Trees y HistGradientBoosting. Cada estimador se entrena de forma independiente sobre el mismo conjunto de características, y la predicción final se obtiene como una media ponderada de las probabilidades de cada clase, con pesos `[2, 1, 2]` para los tres modelos respectivamente. Esta estrategia busca reducir la varianza y mejorar la robustez frente a errores individuales de cada algoritmo.

El entrenamiento se realizó con 77 848 muestras de entrenamiento y 19 462 de prueba, con un tiempo registrado de 1,8 minutos. Se utilizó una semilla aleatoria de 42 donde fue posible y paralelización con `n_jobs=-1`. No se documentan detalles sobre el dataset de entrenamiento (composición, sensor, resolución espacial, sistema de coordenadas, preprocesamiento) ni sobre la estrategia de validación cruzada. El artefacto incluye métricas de evaluación embebidas, pero no se proporcionan matrices de confusión ni resultados por clase.

## Capacidades

- Clasificación multiclase de uso del suelo y cobertura terrestre en 13 clases: Forest, Cropland, Plantation, Fallow_Land, Shrubland_Scrub_Grassland, Barren_Rocky_Sandy, Salt_Affected_Land, Mining, Built_up, Water_Bodies, Inland_Wetlands, Coastal_Wetlands y Swamp_Mangroves.
- Generación de probabilidades por clase mediante la interfaz de soft voting de scikit-learn, lo que permite interpretar las salidas como puntuaciones de confianza (aunque no están calibradas).
- Inferencia sobre características tabulares: el modelo espera 9 variables de entrada (B3, B8, B11, NDVI, NDBI, B8_glcm_contrast, B8_glcm_energy, ELEVATION, DIST_COAST).
- Entrenamiento rápido y ligero: el ensemble completo se entrena en menos de 2 minutos en hardware convencional.
- Compatibilidad con el ecosistema scikit-learn, lo que facilita su integración en pipelines de procesamiento geoespacial existentes.

## Casos de uso

- Cartografía de cobertura terrestre para planificación territorial: el modelo puede clasificar píxeles o parcelas en las 13 categorías definidas, permitiendo generar mapas actualizados de uso del suelo a partir de imágenes satelitales y datos auxiliares.
- Análisis de restauración de tierras: al identificar clases como Barren_Rocky_Sandy, Salt_Affected_Land o Mining, los equipos de restauración pueden priorizar zonas degradadas y monitorizar cambios tras intervenciones.
- Detección de cambios en humedales y manglares: las clases Inland_Wetlands, Coastal_Wetlands y Swamp_Mangroves permiten rastrear la evolución de ecosistemas sensibles, aunque se requiere validación experta debido a la posible confusión entre estas categorías.
- Estudios de expansión urbana: la clase Built_up puede utilizarse para cuantificar el crecimiento de áreas construidas en series temporales, siempre que se disponga de imágenes de distintas fechas.
- Evaluación de impacto ambiental: el modelo puede alimentar sistemas de alerta temprana para detectar actividades mineras o cambios en la cobertura vegetal, combinando sus predicciones con datos de campo.
- Exploración de datos geoespaciales: como herramienta de preclasificación, el modelo puede reducir el trabajo manual de fotointerpretación, generando candidatos que luego son revisados por expertos.

## Benchmarks y rendimiento

Según las métricas embebidas en el artefacto, el modelo reporta los siguientes resultados:

| Metrica | Valor |
|---|---|
| Exactitud global (overall accuracy) | 0,8937 |
| Exactitud balanceada | 0,8768 |
| Precision macro | 0,8976 |
| Recall macro (TPR) | 0,8768 |
| F1 macro | 0,8850 |
| Precision ponderada | 0,8939 |
| Recall ponderado | 0,8937 |
| F1 ponderado | 0,8932 |
| ROC AUC macro | 0,9947 |
| Exactitud media en validacion cruzada | 0,8847 |
| Desviacion estandar de validacion cruzada | 0,0013 |

No se incluyen métricas por clase, matrices de confusión ni resultados sobre particiones geográficas independientes. La alta ROC AUC (0,9947) debe interpretarse con cautela, ya que no garantiza decisiones fiables ni probabilidades calibradas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo es extremadamente ligero: al ser un ensemble de árboles, no requiere GPU. Puede ejecutarse en cualquier CPU moderna con unos pocos GB de RAM.
- El archivo joblib ocupa aproximadamente 0,3 GB, por lo que su carga en memoria es trivial.
- Para inferencia en producción, se puede desplegar como un servicio REST usando frameworks como Flask o FastAPI, o integrarse en pipelines de procesamiento por lotes con Apache Spark o Dask.
- No se requieren bibliotecas especiales más allá de scikit-learn (versión 1.6.1 recomendada para reproducibilidad) y joblib.
- La latencia por predicción es del orden de milisegundos, incluso con miles de muestras, gracias a la implementación vectorizada de scikit-learn.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos dentro del mismo repositorio o en la literatura citada. Sin embargo, en el ámbito de clasificación LULC, los enfoques alternativos suelen incluir:

| Modelo | Tipo | Exactitud tipica | Licencia | Disponibilidad |
|---|---|---|---|---|
| Random Forest individual | Ensemble de árboles | 0,85-0,90 | Varias (BSD, MIT) | Amplia en scikit-learn, R, etc. |
| SVM con kernel RBF | Kernel-based | 0,80-0,88 | Varias | Amplia |
| Redes neuronales convolucionales (CNN) | Deep learning | 0,90-0,95 | Varias | Requiere GPU y datos de imagen |

El modelo aquí descrito se sitúa en la gama de los clasificadores clásicos, con una exactitud reportada de 0,8937, comparable a un Random Forest bien ajustado. Su ventaja es la simplicidad de despliegue y la interpretabilidad, aunque los modelos basados en deep learning suelen superarlo en precisión cuando se dispone de grandes volúmenes de datos de imagen.

## Limitaciones y advertencias

- El rendimiento puede variar significativamente según la geografía, la estación del año, las condiciones atmosféricas, las características del sensor, la resolución de la imagen y la prevalencia de cada clase.
- Las características espectrales y de textura son sensibles al preprocesamiento y a la definición de vecindarios; cualquier cambio en el pipeline de extracción puede degradar las predicciones.
- Las clases raras o fácilmente confundibles (humedales, manglares, barbechos, tierras estériles) pueden presentar errores que no se reflejan en las métricas agregadas.
- No se puede evaluar la posible fuga espacial o temporal entre los datos de entrenamiento y prueba a partir del artefacto guardado.
- Una ROC AUC alta no implica que las probabilidades sean calibradas ni que las decisiones por clase sean fiables.
- Los identificadores y nombres de clase deben preservarse exactamente al integrar las predicciones con productos geoespaciales posteriores.
- El archivo es un artefacto joblib/pickle; cargarlo ejecuta código de deserialización de Python, por lo que solo debe cargarse desde fuentes confiables.
- Se ha observado una advertencia de versión inconsistente al cargar el artefacto con scikit-learn 1.7.0 (el modelo fue entrenado con 1.6.1). Se recomienda reproducir o desplegar con las versiones de dependencia del entrenamiento y validar las predicciones tras cualquier actualización.
- No se documentan el sensor, la resolución espacial, el sistema de referencia de coordenadas, las unidades, el preprocesamiento ni el manejo de valores faltantes; estos deben coincidir con el pipeline de entrenamiento antes de la inferencia.
- El modelo no está destinado a tomar decisiones autónomas sobre personas, propiedades, cumplimiento ambiental o financiación de restauración. Las predicciones deben ser revisadas por expertos y contrastadas con imágenes actuales o verificaciones de campo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sarangowrishvelisetty/lulc-classification-voting-ensemble
- Artículo relacionado (Springer): "A Majority Voting Ensemble Approach for LULC Classification of Satellite Images" - https://link.springer.com/content/pdf/10.1007/s40031-023-00865-4.pdf
- Capítulo de libro (Springer): "Multisource Satellite Data Merge and Ensemble Machine Learning for LULC" - https://link.springer.com/chapter/10.1007/978-981-96-1344-1_14
- Artículo en ResearchGate (mismo título que el anterior) - https://www.researchgate.net/publication/367970501_A_Majority_Voting_Ensemble_Approach_for_LULC_Classification_of_Satellite_Images_httpsrdcubec4F06
- Artículo en ScienceDirect: "Machine learning in modelling land-use and land cover-change (LULCC)" - https://www.sciencedirect.com/science/article/pii/S0048969722006519
