# pyaging/systemsagelung

## Resumen

El modelo `pyaging/systemsagelung` es un reloj epigenético de envejecimiento específico para el sistema pulmonar, desarrollado por el equipo de pyaging como parte del proyecto Systems Age. Este sistema, descrito en el artículo de Sehgal et al. (2025) publicado en *Nature Aging*, utiliza la metilación del ADN en sangre periférica para estimar la edad biológica de once sistemas fisiológicos distintos. La versión pulmonar se entrena a partir de biomarcadores pulmonares y datos de mortalidad, y devuelve una puntuación en una escala similar a la edad cronológica.

A diferencia de los modelos de lenguaje, este no es un transformer ni una red neuronal profunda, sino un modelo de regresión basado en análisis de componentes principales (PCA) seguido de una regresión con regularización elastic net. Está diseñado para ser utilizado con la librería `pyaging` en Python, y se distribuye bajo licencia BSD-3-Clause. El repositorio ocupa 2.0 GB, aunque el modelo en sí es un conjunto de coeficientes de regresión de tamaño reducido; el peso del repositorio se debe probablemente a datos auxiliares y documentación.

La relevancia de este modelo radica en su capacidad para cuantificar la heterogeneidad del envejecimiento a nivel de sistemas, lo que permite identificar desviaciones entre la edad biológica pulmonar y la edad cronológica, con potenciales aplicaciones en medicina preventiva y estudios longitudinales de envejecimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible (coeficientes de regresion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (entrada: datos de metilacion de ADN) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente .npz o similar, no documentado) |

## Arquitectura y entrenamiento

El modelo emplea un pipeline de dos etapas. Primero se aplica un análisis de componentes principales (PCA) sobre las medidas de metilación de ADN en sangre periférica, reduciendo la dimensionalidad de las aproximadamente 850.000 sondas de metilación a un conjunto de componentes principales que capturan la varianza relevante para el fenotipo pulmonar. Posteriormente, se ajusta una regresión con regularización elastic net sobre estos componentes para predecir la edad biológica pulmonar, calibrada con datos de mortalidad y biomarcadores pulmonares. El entrenamiento se realizó con datos de cohortes humanas de sangre completa, y el modelo se validó internamente en el estudio Systems Age.

No se dispone de información pública sobre el número exacto de muestras de entrenamiento, la proporción de componentes principales retenidos o los hiperparámetros del elastic net. El modelo está implementado en la librería `pyaging`, que gestiona la carga de pesos y la predicción sobre matrices de metilación (formato AnnData).

## Capacidades

- Predicción de la edad biológica del sistema pulmonar a partir de datos de metilación de ADN en sangre completa.
- Salida en una escala de edad (años), comparable con la edad cronológica del individuo.
- Integración sencilla con flujos de trabajo de análisis de metilación mediante la función `pya.pred.predict_age()`.
- Forma parte de un conjunto más amplio de relojes de sistemas (Systems Age) que cubren once sistemas fisiológicos, lo que permite análisis multi-sistema.
- No incluye capacidades de generación de texto, razonamiento, visión ni tool calling, al ser un modelo de regresión especializado.

## Casos de uso

- Investigación en envejecimiento pulmonar: permite cuantificar la desviación entre la edad biológica pulmonar y la edad cronológica en cohortes de estudio, facilitando la identificación de individuos con envejecimiento acelerado o retardado del tejido pulmonar.
- Estudios epidemiológicos longitudinales: aplicable a biobancos con datos de metilación de sangre para analizar asociaciones entre factores de riesgo (tabaquismo, contaminación, enfermedades respiratorias) y la edad biológica pulmonar.
- Evaluación de intervenciones: puede utilizarse como biomarcador de respuesta en ensayos clínicos de terapias dirigidas a enfermedades pulmonares o intervenciones de estilo de vida, midiendo cambios en la edad biológica pulmonar antes y después del tratamiento.
- Medicina preventiva personalizada: integrable en paneles de análisis de metilación para ofrecer una estimación del estado de salud pulmonar en chequeos médicos, complementando pruebas funcionales como espirometría.
- Validación de otros relojes epigenéticos: sirve como referencia específica de sistema para comparar con relojes pan-tisulares como PhenoAge o GrimAge, ayudando a discernir contribuciones sistémicas frente a globales.
- Desarrollo de modelos multi-sistema: junto con los otros componentes de Systems Age, permite construir perfiles de envejecimiento heterogéneo y estudiar la interacción entre sistemas fisiológicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Sehgal et al., 2025) reporta métricas de validación interna y externa, pero esos datos no se incluyen en la model card de HuggingFace. No se proporcionan valores de correlación con edad cronológica, errores absolutos medios ni comparaciones con otros relojes en esta ficha.

## Requisitos de hardware

- El modelo es extremadamente ligero: un vector de coeficientes de regresión y una matriz de loadings de PCA, ocupando unos pocos megabytes.
- No requiere GPU. La inferencia se realiza en CPU en milisegundos para una muestra individual.
- El repositorio de 2.0 GB incluye probablemente datos de ejemplo, documentación y otros archivos, pero el modelo en sí no exige más de 256 MB de RAM.
- Para procesar grandes cohortes (miles de muestras), se recomienda un equipo con al menos 8 GB de RAM y un flujo de trabajo vectorizado (por ejemplo, usando NumPy o pandas).
- Se integra con la librería `pyaging`, que depende de `scanpy`, `anndata` y `numpy`. No se requieren servicios de inferencia como vLLM u Ollama.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros relojes epigenéticos en la información proporcionada. Existen relojes clásicos como Horvath's pan-tissue clock, PhenoAge, GrimAge o DunedinPoAm, pero todos son modelos de regresión sobre metilación y difieren en el fenotipo objetivo y el tejido. `systemsagelung` es específico para el sistema pulmonar, lo que lo distingue de los relojes globales. No hay datos de rendimiento comparativo en esta ficha.

## Limitaciones y advertencias

- Modelo específico para el sistema pulmonar: no debe utilizarse para estimar la edad biológica de otros sistemas o la edad global.
- Requiere datos de metilación de ADN de sangre completa obtenidos con plataformas de alta densidad (p. ej., Illumina EPIC o 450K). No funciona con datos de otros tejidos ni con tecnologías de secuenciación reducida.
- La calibración se realizó en poblaciones humanas de ascendencia mayoritariamente europea; su precisión en otras poblaciones puede verse reducida (sesgo de ascendencia).
- Riesgo de sobreajuste a las cohortes de entrenamiento: los relojes epigenéticos pueden perder precisión al aplicarse a poblaciones con características diferentes a las del entrenamiento.
- No es un modelo causal: la edad biológica pulmonar estimada refleja correlaciones con biomarcadores y mortalidad, pero no establece mecanismos causales.
- Licencia BSD-3-Clause permite uso comercial y modificación, pero se recomienda citar el artículo original en publicaciones científicas.
- La documentación pública no detalla los coeficientes ni los componentes principales, lo que limita la interpretabilidad directa del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyaging/systemsagelung
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. *Nature Aging*, 5, 1880–1896. DOI: https://doi.org/10.1038/s43587-025-00958-3
