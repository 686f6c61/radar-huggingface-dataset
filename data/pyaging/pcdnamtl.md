# pyaging/pcdnamtl

## Resumen

`pyaging/pcdnamtl` es un reloj epigenético basado en metilación de ADN diseñado para predecir la longitud de los telómeros en leucocitos de sangre completa humana. Fue desarrollado por el equipo de pyaging como una implementación del reloj DNAmTL original, utilizando un enfoque de análisis de componentes principales (PCA) combinado con regresión elastic net. El modelo reproduce la puntuación del reloj DNAmTL en la escala de pares de bases, lo que permite estimar la edad biológica relacionada con el acortamiento telomérico.

A diferencia de los modelos de lenguaje, este es un modelo estadístico clásico aplicado a datos de metilación de ADN. Su relevancia radica en que proporciona una herramienta computacional para estudios de envejecimiento, permitiendo evaluar la edad biológica a partir de perfiles epigenéticos sin necesidad de medir directamente la longitud de los telómeros. El modelo se distribuye bajo licencia BSD-3-Clause y está integrado en la librería `pyaging`, facilitando su uso en pipelines de análisis de datos ómicos.

El tamaño del repositorio es de 0.4 GB, lo que sugiere un modelo compacto y ligero, adecuado para ejecutarse en entornos con recursos limitados. Su año de publicación es 2022, basado en el trabajo de Higgins-Chen et al. en Nature Aging.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresion elastic net |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo biologico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente safetensors o pickle) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de dos etapas: primero, una reduccion de dimensionalidad mediante analisis de componentes principales (PCA) sobre los niveles de metilacion de sitios CpG especificos; segundo, una regresion elastic net sobre los componentes principales resultantes para predecir la longitud telomerica. Esta combinacion permite capturar la variabilidad epigenetica relevante para el envejecimiento celular mientras se controla la multicolinealidad y se seleccionan caracteristicas de forma regularizada.

El entrenamiento se realizo con datos de metilacion de ADN de sangre completa humana, siguiendo la metodologia descrita por Higgins-Chen et al. (2022). No se dispone de detalles sobre el numero exacto de muestras ni de sitios CpG utilizados en la informacion proporcionada. El modelo devuelve la puntuacion en la escala de pares de bases del reloj DNAmTL original, lo que facilita la comparacion directa con otras mediciones de longitud telomerica. No se menciona el uso de tecnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Prediccion de la longitud de telomeros en leucocitos a partir de datos de metilacion de ADN.
- Reproduccion del score del reloj DNAmTL en la escala de pares de bases.
- Integracion con la libreria `pyaging` para su uso directo en pipelines de analisis de datos epigeneticos.
- Compatibilidad con datos de tipo array de metilacion (Illumina 450K o EPIC, presumiblemente).
- Funcionamiento como reloj epigenetico para estudios de envejecimiento biologico.
- Capacidad de inferencia rapida al ser un modelo estadistico ligero (0.4 GB de pesos).

## Casos de uso

- Investigacion en envejecimiento: el modelo permite estimar la edad biologica basada en telomeros en cohortes de estudio, facilitando la correlacion con fenotipos de salud y longevidad.
- Estudios longitudinales: al predecir la longitud telomerica a partir de metilacion, se puede hacer seguimiento del envejecimiento en muestras almacenadas sin necesidad de nuevas mediciones de telomeros.
- Evaluacion de intervenciones: en ensayos clinicos de terapias antienvejecimiento, el modelo puede servir como biomarcador de eficacia midiendo cambios en la longitud telomerica estimada.
- Analisis de datos epigeneticos existentes: investigadores que ya dispongan de perfiles de metilacion pueden aplicar el modelo sin necesidad de experimentos adicionales.
- Control de calidad en estudios de metilacion: la prediccion de longitud telomerica puede usarse como variable de validacion cruzada con mediciones directas.
- Desarrollo de relojes epigeneticos personalizados: el codigo y la metodologia pueden adaptarse para crear relojes especificos de tejido o poblacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas de rendimiento como correlacion con la longitud telomerica medida experimentalmente, error absoluto medio ni comparaciones con otros relojes epigeneticos en la documentacion proporcionada.

## Requisitos de hardware

- El tamaño del repositorio es de 0.4 GB, por lo que la carga en memoria es reducida.
- Puede ejecutarse en CPU sin necesidad de GPU, ya que la inferencia consiste en una transformacion PCA y una regresion lineal, operaciones de bajo coste computacional.
- Requisito minimo de RAM: se estima inferior a 2 GB para cargar los pesos y los datos de entrada (matrices de metilacion).
- Compatible con entornos de escritorio estandar, portatiles y servidores sin aceleracion dedicada.
- Despliegue sencillo mediante la libreria `pyaging` en Python, sin necesidad de frameworks de inferencia como vLLM o llama.cpp.
- Latencia de inferencia: del orden de milisegundos para una muestra individual, aunque depende del numero de sitios CpG en la entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Especie | Tejido | Prediccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pcdnamtl (este) | PCA + elastic net | Homo sapiens | Sangre completa | Longitud de telomeros | BSD-3-Clause | HuggingFace |
| HorvathClock | Regresion elastic net | Homo sapiens | Multiples tejidos | Edad cronologica | GPL-3.0 | Diversos repos |
| HannumClock | Regresion elastic net | Homo sapiens | Sangre completa | Edad cronologica | GPL-3.0 | Diversos repos |
| PhenoAge | Regresion elastic net | Homo sapiens | Sangre completa | Edad fenotipica | GPL-3.0 | Diversos repos |

La comparativa se basa en la categoria de relojes epigeneticos. No se dispone de datos de rendimiento comparativo en la informacion proporcionada. pcdnamtl se distingue por predecir especificamente longitud telomerica, mientras que los otros relojes predicen edad cronologica o fenotipica.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente con datos de sangre completa humana; su aplicacion a otros tejidos o especies puede producir resultados invalidos.
- La prediccion se basa en la correlacion entre metilacion y longitud telomerica, no en una medicion directa; puede haber discrepancias en individuos con condiciones geneticas o patologicas que afecten la metilacion.
- No se ha documentado la composicion demografica de los datos de entrenamiento, por lo que podria existir sesgo hacia poblaciones especificas (probablemente de ascendencia europea, dado el origen del estudio original).
- La licencia BSD-3-Clause permite uso comercial y modificacion, pero se debe atribuir la fuente original.
- No se proporcionan garantias de exactitud para uso clinico; el modelo es una herramienta de investigacion.
- La falta de documentacion sobre el numero exacto de sitios CpG y la metodologia de preprocesamiento limita la reproducibilidad en entornos no estandarizados.
- No es un modelo generativo ni de lenguaje; no debe utilizarse para tareas de procesamiento de texto o razonamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyaging/pcdnamtl
- Documentacion de pyaging: https://pyaging.readthedocs.io
- Paper de referencia: Higgins-Chen, Albert T., et al. "A computational solution for bolstering reliability of epigenetic clocks: implications for clinical trials and longitudinal tracking." Nature Aging 2 (2022): 644-661. DOI: https://doi.org/10.1038/s43587-022-00248-2
