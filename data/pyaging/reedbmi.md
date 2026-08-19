# pyaging/reedbmi

## Resumen

`reedbmi` es un reloj epigenético desarrollado por el grupo `pyaging` que calcula una puntuación ponderada de metilación de ADN en sangre asociada al índice de masa corporal (BMI). Se basa en los efectos estimados de estudios de asociación de epigenoma completo (EWAS) publicados y fue evaluado en la cohorte ARIES, que abarca el curso de vida. El modelo no es una red neuronal ni un transformador, sino una agregación lineal de valores de metilación en sitios CpG específicos, con coeficientes derivados de la literatura. Su relevancia radica en proporcionar un biomarcador epigenético del BMI concurrente, útil en estudios epidemiológicos y de biología del envejecimiento, aunque no ofrece una predicción calibrada en kilogramos.

El modelo está pensado para ser usado con la librería `pyaging`, que permite calcular esta puntuación directamente sobre matrices de metilación (por ejemplo, de arrays Illumina). Es una herramienta de investigación, no un producto clínico, y su licencia BSD-3-Clause facilita su integración en proyectos académicos y comerciales con atribución adecuada. Publicado originalmente en 2020 por Reed et al., representa un enfoque de "reloj" basado en metilación que complementa otros relojes de envejecimiento al centrarse en un rasgo metabólico específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregación ponderada de metilación (score lineal) |
| Parametros totales | No disponible (coeficientes por CpG, número no especificado) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (se distribuye a través de `pyaging` como parte de su catálogo de relojes) |

## Arquitectura y entrenamiento

El modelo es una puntuación de metilación ponderada, construida a partir de los coeficientes de regresión de un EWAS de BMI en sangre. Cada sitio CpG incluido recibe un peso que refleja su asociación con el BMI en los estudios originales. La puntuación final se calcula como la suma ponderada de los niveles de metilación (beta-values) en esos sitios. No hay un entrenamiento de red neuronal ni un proceso de optimización con backpropagation; los pesos provienen de meta-análisis o de estudios de asociación publicados.

La evaluación se realizó en la cohorte ARIES, que incluye muestras de sangre de diferentes edades (desde el nacimiento hasta la adultez). El modelo fue diseñado para ser un biomarcador del BMI concurrente, no una predicción causal ni un estimador calibrado. No se reportan detalles sobre el número exacto de CpGs ni sobre el procedimiento de selección de los mismos en la información disponible.

## Capacidades

- Calcula una puntuación de metilación asociada al BMI en sangre total y sangre de cordón umbilical.
- Proporciona un valor numérico que refleja la carga epigenética relacionada con el BMI, útil como variable continua en análisis estadísticos.
- Se integra con el ecosistema `pyaging`, permitiendo su uso junto con otros relojes de envejecimiento y biomarcadores.
- No tiene capacidades de generación de texto, razonamiento, tool calling, ni soporte para agentes.
- No es multilingüe ni maneja datos no epigenéticos.

## Casos de uso

- Estudios epidemiológicos de asociación entre metilación y obesidad: permite ajustar por el BMI epigenético en modelos de regresión para aislar efectos de otras variables.
- Análisis de mediación en cohortes longitudinales: se puede usar como variable intermedia entre exposiciones tempranas y resultados metabólicos posteriores.
- Control de confusores en estudios de metilación de enfermedades cardiometabólicas: al incluir la puntuación `reedbmi` como covariable, se reduce el sesgo por el estado de BMI.
- Validación de relojes de envejecimiento: comparar la puntuación de BMI con relojes como Horvath o PhenoAge para explorar la interacción entre envejecimiento y metabolismo.
- Investigación en biología del desarrollo: dado que se aplica a sangre de cordón, puede estudiar la huella epigenética del BMI materno o fetal.
- Desarrollo de biomarcadores compuestos: combinar `reedbmi` con otros scores para construir paneles predictivos de riesgo metabólico en investigación traslacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo fue evaluado en la cohorte ARIES, pero no se proporcionan métricas numéricas (correlación, AUC, etc.) en la model card. Se recomienda consultar el artículo original para detalles de validación.

## Requisitos de hardware

- No requiere GPU: la puntuación se calcula con operaciones lineales sobre matrices de metilación, ejecutables en CPU estándar.
- Memoria RAM: dependiente del tamaño del dataset de metilación (típicamente matrices de miles de muestras por cientos de miles de CpGs); se recomienda al menos 8 GB para manejar arrays completos de Illumina 450K o EPIC.
- No hay requisitos específicos de tarjetas gráficas ni de despliegue en servidores de inferencia.
- La integración con `pyaging` se realiza en Python, sin necesidad de contenedores especiales ni servicios de inferencia como vLLM u Ollama.

## Comparativa con modelos similares

Existen otros relojes epigenéticos que estiman el BMI o rasgos metabólicos, como el "BMI methylation score" de Wahl et al. (2017) o el "epigenetic BMI" de algunos estudios. Sin embargo, no se dispone de una comparación directa en la información proporcionada. La principal diferencia es que `reedbmi` se basa en efectos EWAS publicados y está optimizado para sangre, mientras que otros pueden usar enfoques de machine learning o incluir tejidos adicionales. No se proporcionan datos comparativos de rendimiento.

## Limitaciones y advertencias

- Es un biomarcador asociado al BMI concurrente, no una predicción calibrada en kilogramos; su interpretación debe ser cautelosa en contextos clínicos.
- Los coeficientes provienen de estudios EWAS que pueden tener sesgos poblacionales (principalmente europeos) y no generalizar a otras etnias.
- Solo validado en sangre total y sangre de cordón; su uso en otros tejidos requiere precaución.
- No hay información sobre la estabilidad de la puntuación a lo largo del tiempo ni sobre su respuesta a intervenciones (pérdida de peso, ejercicio).
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar el trabajo original.
- No se especifican los CpGs incluidos ni los pesos, lo que limita la reproducibilidad independiente fuera del paquete `pyaging`.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/reedbmi
- Documentación de pyaging (catálogo de relojes): https://pyaging.readthedocs.io
- Artículo original: Reed, Z. E., et al. "The association of DNA methylation with body mass index: distinguishing between predictors and biomarkers." Clinical Epigenetics 12 (2020): 50. DOI: https://doi.org/10.1186/s13148-020-00841-5
