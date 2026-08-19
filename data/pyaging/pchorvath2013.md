# pyaging/pchorvath2013

## Resumen

El modelo `pchorvath2013` es un reloj epigenético basado en metilación de ADN, desarrollado por el equipo de Higgins-Chen et al. en 2022 como parte del paquete `pyaging`. Se trata de un proxy de componente principal (PCA) del reloj pan-tejido de Horvath de 2013, entrenado para predecir la edad cronológica en muestras humanas multi-tejido. A diferencia de un modelo de lenguaje, este es un modelo estadístico de regresión que opera sobre datos de metilación de ADN (matrices de beta-values) y devuelve una estimación de edad biológica.

Su relevancia radica en que ofrece una alternativa computacionalmente más estable y reproducible al reloj original de Horvath, que requería una normalización compleja de los datos. Al utilizar PCA seguida de regresión elastic net, el modelo reduce la dimensionalidad de los datos de metilación y mejora la fiabilidad en estudios longitudinales y ensayos clínicos, donde la consistencia de las mediciones es crítica. El modelo está disponible bajo licencia BSD-3-Clause y se integra en el ecosistema `pyaging` para análisis de envejecimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net |
| Parametros totales | no disponible (modelo estadístico, no neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (entrada: matriz de metilación de ADN) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (datos biológicos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo `pchorvath2013` se construye mediante un enfoque de dos etapas. Primero, se aplica un análisis de componentes principales (PCA) a los datos de metilación de ADN de múltiples tejidos humanos, reduciendo la alta dimensionalidad de las CpG (sitios de metilación) a un conjunto de componentes principales. Posteriormente, se entrena una regresión elastic net sobre estos componentes para predecir la edad cronológica, utilizando como variable objetivo la puntuación del reloj original de Horvath 2013. Este procedimiento se conoce como "proxy" del reloj original, ya que no se entrena directamente contra la edad, sino contra la salida del reloj de referencia, lo que permite imitar su comportamiento sin necesidad de los datos normalizados originales.

El entrenamiento se realizó con conjuntos de datos multi-tejido sustituidos (substituted multi-tissue datasets), según se indica en la documentación. No se dispone de información detallada sobre el número de muestras, el número de CpG utilizadas ni el proceso de validación interna. El modelo fue publicado en 2022 en el artículo de Higgins-Chen et al. en *Nature Aging*.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN.
- Soporte multi-tejido: funciona en muestras de distintos tejidos humanos.
- Específico para Homo sapiens.
- Integración con la librería `pyaging` mediante la función `predict_age`.
- No requiere GPU ni hardware especializado; es un modelo ligero que se ejecuta en CPU.
- No genera texto, no procesa lenguaje natural ni tiene capacidades de razonamiento.

## Casos de uso

- Estudios de envejecimiento biológico: el modelo permite estimar la edad biológica de individuos a partir de muestras de sangre, tejido o células, facilitando la investigación sobre los mecanismos del envejecimiento.
- Ensayos clínicos de intervenciones anti-envejecimiento: al ser un proxy estable del reloj de Horvath, puede utilizarse para monitorizar cambios en la edad epigenética a lo largo del tiempo en ensayos longitudinales, como se describe en el artículo original.
- Medicina de precisión: evaluación del riesgo de enfermedades relacionadas con la edad, como cáncer o enfermedades cardiovasculares, mediante la comparación entre edad cronológica y edad epigenética.
- Análisis de datos de metilación en biobancos: procesamiento de grandes cohortes para calcular relojes epigenéticos de forma estandarizada.
- Validación de nuevas plataformas de secuenciación: al ser un proxy computacional, puede aplicarse a datos generados con diferentes tecnologías de microarrays o secuenciación, siempre que se ajusten a la misma normalización.
- Investigación en longevidad: comparación de tasas de envejecimiento entre poblaciones, sexos o condiciones genéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible. El artículo asociado (Higgins-Chen et al., 2022) reporta mejoras en fiabilidad y reproducibilidad en comparación con el reloj original de Horvath, pero no se proporcionan métricas numéricas concretas en la model card. No se dispone de comparaciones con otros relojes epigenéticos (p. ej., Hannum, PhenoAge) en términos de precisión o correlación con la edad.

## Requisitos de hardware

- El modelo es extremadamente ligero: consiste en coeficientes de regresión y componentes PCA, por lo que no requiere GPU.
- Se ejecuta en cualquier CPU moderna (incluso en portátiles o entornos de nube sin aceleración).
- Memoria RAM: menos de 1 GB, ya que el repositorio ocupa 0.1 GB y los datos de entrada (matrices de metilación) suelen ser los que dominan el consumo.
- No requiere despliegue especializado: se usa directamente como función de Python dentro de `pyaging`.
- Latencia: del orden de milisegundos para una muestra individual, dependiendo del número de CpG.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Los relojes epigenéticos más conocidos son el reloj de Horvath (2013), el reloj de Hannum (2013) y PhenoAge (Levine, 2018). `pchorvath2013` es un proxy del primero, por lo que su comportamiento debería ser similar, pero no se ofrecen métricas de comparación. Se recomienda consultar el artículo original para obtener detalles sobre la validación relativa.

## Limitaciones y advertencias

- Es un modelo de investigación, no clínico: no debe utilizarse para diagnóstico médico individual sin validación adicional.
- Requiere datos de metilación de ADN preprocesados según el formato esperado por `pyaging`; una normalización incorrecta puede invalidar las predicciones.
- Al ser un proxy del reloj de Horvath, hereda sus limitaciones, como una menor precisión en edades extremas o en tejidos poco representados.
- No se especifican sesgos demográficos (edad, sexo, etnia) en la información disponible; es posible que el rendimiento varíe entre poblaciones.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos exactos y citar el artículo original.
- No hay garantías de soporte técnico ni mantenimiento del modelo por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/pchorvath2013
- Documentación de `pyaging`: https://pyaging.readthedocs.io
- Artículo original: Higgins-Chen, A. T. et al. "A computational solution for bolstering reliability of epigenetic clocks: implications for clinical trials and longitudinal tracking." Nature Aging 2 (2022): 644–661. DOI: https://doi.org/10.1038/s43587-022-00248-2
