# pyaging/pcgrimage

## Resumen

pcgrimage es un reloj epigenético (aging clock) publicado en el ecosistema pyaging que reproduce la puntuación de riesgo de mortalidad del GrimAge original de DNAm. No es un modelo de lenguaje ni una red neuronal profunda: es un proxy basado en componentes principales (PCA) seguido de una regresión elastic net, entrenado para aproximar el score GrimAge a partir de datos de metilación de ADN en sangre completa de Homo sapiens. El paquete incluye edad y sexo como entradas adicionales del modelo, tal como requiere la formulación original.

La relevancia de este modelo es metodológica: el GrimAge original es un predictor de mortalidad compuesto por varios estimadores intermedios (proteínas plasmáticas y un estimador de tabaquismo), lo que lo hace frágil frente al ruido técnico de los arrays de metilación. La propuesta de Higgins-Chen et al. (Nature Aging, 2022) sustituye esa arquitectura por una representación de componentes principales más una regresión regularizada, mejorando la fiabilidad test-retest y la estabilidad en seguimiento longitudinal, algo crítico para ensayos clínicos.

El repositorio pesa 4,9 GB y se distribuye con licencia MIT para el software, aunque la model card advierte explícitamente que los pesos conservan los términos de los autores originales y no quedan relicenciados por la licencia de pyaging. El modelo está pensado para su uso dentro de la librería pyaging, no como un artefacto autónomo de inferencia general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de metilación) |
| Tipos de cuantizacion | no disponible (no aplica; modelo estadístico, no red neuronal) |
| Idiomas soportados | no disponible (no aplica; entrada numérica de metilación) |
| Licencia | MIT para el software; pesos sujetos a los términos de los autores originales |
| Formato de pesos | no disponible (empaquetado para pyaging; tamaño de repo 4,9 GB) |

## Arquitectura y entrenamiento

El modelo sigue un pipeline en dos etapas: primero proyecta las betas de metilación (típicamente cientos de miles de CpGs en arrays Illumina) sobre un conjunto de componentes principales, y después aplica una regresión elastic net sobre esas componentes junto con edad y sexo para predecir el score GrimAge. Esta sustitución del ensemble de estimadores intermedios del GrimAge original por una representación PCA + elastic net es la innovación central del trabajo: reduce la dimensionalidad efectiva, atenúa el ruido técnico CpG a CpG y mejora la correlación test-retest.

La model card indica que el modelo predice riesgo de mortalidad en sangre completa humana y data el método en 2022, coincidiendo con la publicación en Nature Aging. No se especifican en la información disponible el número de componentes principales retenidos, el valor de los hiperparámetros de la elastic net, el tamaño exacto del conjunto de entrenamiento ni la composición detallada del dataset. Tampoco se documenta si hubo ajuste por covariables adicionales (IMC, tabaquismo, etc.) más allá de edad y sexo.

## Capacidades

- Predicción de riesgo de mortalidad a partir de perfiles de metilación de ADN en sangre completa humana.
- Reproducción del score GrimAge original mediante un proxy PCA + elastic net.
- Integración de edad cronológica y sexo como entradas adicionales del modelo.
- Ejecución dentro del ecosistema pyaging mediante la llamada `pya.pred.predict_age(adata, ["pcgrimage"])`.
- Compatible con el formato AnnData habitual en flujos de análisis de célula única y epigenómica en Python.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No tiene capacidades multilingües, de visión ni de audio.

## Casos de uso

- Ensayos clínicos con seguimiento longitudinal: el proxy PCA + elastic net está diseñado para mejorar la fiabilidad test-retest frente al GrimAge original, lo que lo hace adecuado para medir cambios en el riesgo de mortalidad entre visitas sucesivas de un mismo sujeto.
- Estudios epidemiológicos a gran escala: permite calcular un proxy de GrimAge sobre cohortes con metilación de sangre completa sin necesidad de replicar el pipeline completo de estimadores intermedios del score original.
- Análisis de envejecimiento acelerado: comparando la predicción con la edad cronológica se obtiene una medida de desviación de edad útil en estudios de intervención sobre estilo de vida o fármacos.
- Control de calidad de datos epigenéticos: al ser un modelo estadístico ligero, sirve como referencia para evaluar la estabilidad de lotes y la reproducibilidad de arrays de metilación entre plataformas.
- Reproducibilidad de la literatura: al estar empaquetado en pyaging, permite recomputar el score citado en Higgins-Chen et al. (2022) sobre datasets públicos sin reimplementar el método.
- Docencia y formación en bioinformática epigenética: el pipeline PCA + elastic net es interpretable y didáctico para explicar cómo se construyen y validan relojes epigenéticos.
- Integración en pipelines de investigación clínica traslacional: combinado con otros clocks del catálogo de pyaging para construir paneles multivariantes de envejecimiento biológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de correlación, error absoluto medio (MAE) ni comparaciones numéricas con el GrimAge original u otros relojes epigenéticos. Se recomienda consultar el artículo de Higgins-Chen et al. (2022) para los resultados de validación reportados por los autores.

## Requisitos de hardware

- No requiere GPU: es un modelo de PCA + elastic net ejecutable en CPU.
- VRAM estimada para inferencia: no aplica (no es un modelo neuronal).
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: el cuello de botella es la memoria RAM necesaria para cargar la matriz de metilación del sujeto o cohorte, no el modelo.
- Despliegue: mediante la librería pyaging en Python (`pya.pred.predict_age`), sobre objetos AnnData.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño de la cohorte y del número de CpGs de entrada.
- Espacio en disco: el repositorio ocupa 4,9 GB, por lo que conviene prever ese espacio antes de la descarga.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Predice | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pcgrimage | PCA + elastic net | Metilación, edad, sexo | Riesgo de mortalidad (proxy GrimAge) | MIT (software); pesos con términos de los autores | Hugging Face (pyaging) |
| GrimAge original (DNAm GrimAge) | Ensemble de estimadores intermedios | Metilación | Riesgo de mortalidad | Términos de los autores originales | Implementaciones en varios paquetes de relojes epigenéticos |
| Otros clocks de pyaging (p. ej. Horvath, Hannum) | Regresión elastic net sobre CpGs | Metilación | Edad epigenética | Según cada clock | Catálogo de pyaging |

No se dispone en la información proporcionada de datos numéricos comparativos de rendimiento (correlación, MAE) entre pcgrimage y los clocks alternativos, por lo que la comparativa se limita a tipo de modelo, entradas y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre sangre completa, los resultados pueden no generalizar a otros tejidos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir predicciones poco fiables fuera de la distribución de entrenamiento (otras plataformas de array, poblaciones no representadas).
- Limitaciones de contexto o idioma: no aplica; la entrada es numérica y el modelo no procesa texto.
- Restricciones de licencia: la licencia MIT cubre el software de pyaging, pero la model card advierte que los pesos conservan los términos de los autores originales; verificar antes de uso comercial.
- Es un proxy, no el GrimAge original: las predicciones aproximan el score, pero no son idénticas a él; para aplicaciones regulatorias o clínicas conviene validar contra la implementación de referencia.
- Solo validado en Homo sapiens y sangre completa; no usar en otras especies o tejidos sin revalidación.
- La información pública no detalla hiperparámetros, número de componentes ni composición del dataset de entrenamiento, lo que dificulta la auditoría independiente.
- No es un dispositivo médico ni sustituye una evaluación clínica del riesgo de mortalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/pcgrimage
- Catálogo de clocks de pyaging: https://pyaging.readthedocs.io
- Artículo de referencia: Higgins-Chen, A. T., et al. "A computational solution for bolstering reliability of epigenetic clocks: implications for clinical trials and longitudinal tracking." Nature Aging 2 (2022): 644–661. https://doi.org/10.1038/s43587-022-00248-2
