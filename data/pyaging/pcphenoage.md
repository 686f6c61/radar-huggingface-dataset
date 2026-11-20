# pyaging/pcphenoage

## Resumen

pcphenoage es un reloj epigenetico (aging clock) basado en metilacion de ADN que predice la edad fenotipica en sangre completa de Homo sapiens. Lo desarrolla el equipo de pyaging y se publico originalmente en el trabajo de Higgins-Chen et al. (Nature Aging, 2022) sobre soluciones computacionales para mejorar la fiabilidad de los relojes epigeneticos. No es un modelo de lenguaje: es un modelo estadistico de regresion que opera sobre datos de metilacion.

La innovacion principal frente a otros relojes epigeneticos es que se entrena directamente sobre puntuaciones de edad fenotipica en lugar de actuar como un proxy del reloj CpG original. Emplea un pipeline de analisis de componentes principales (PCA) seguido de regresion elastic net, una combinacion disenada para mitigar los problemas de fiabilidad test-retest que afectan a los relojes epigeneticos de primera generacion.

Es relevante para investigadores en envejecimiento, biomarcadores y ensayos clinicos longitudinales que necesitan estimaciones de edad biologica mas estables. El repositorio ocupa 1,6 GB y se distribuye bajo licencia MIT, aunque los pesos conservan los terminos de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresion elastic net |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de metilacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT (pesos sujetos a los terminos de los autores originales) |
| Formato de pesos | no disponible (integrados en la libreria pyaging) |

## Arquitectura y entrenamiento

El modelo sigue un pipeline en dos etapas: primero reduce la dimensionalidad de los datos de metilacion de ADN mediante analisis de componentes principales, y despues aplica una regresion elastic net sobre las componentes resultantes para predecir la edad fenotipica. Este diseno combina regularizacion L1 y L2, lo que permite seleccionar variables relevantes y controlar la colinealidad tipica de los datos de metilacion.

A diferencia de los relojes epigeneticos clasicos, que se entrenan para aproximar la salida de un reloj CpG previo, pcphenoage se entrena directamente sobre las puntuaciones de edad fenotipica. Este enfoque, descrito en Higgins-Chen et al. (2022), busca mejorar la fiabilidad test-retest, un problema conocido en relojes de primera generacion que limita su uso en seguimiento longitudinal y ensayos clinicos. No se dispone de informacion sobre el numero exacto de muestras, la composicion del dataset de entrenamiento ni el uso de tecnicas de validacion adicionales en la informacion proporcionada.

## Capacidades

- Prediccion de edad fenotipica a partir de datos de metilacion de ADN en sangre completa.
- Especifico para Homo sapiens; no aplicable a otras especies.
- Integracion con la libreria pyaging mediante `pya.pred.predict_age(adata, ["pcphenoage"])`.
- Orientado a datos de tipo array de metilacion (AnnData), no a texto ni imagenes.
- Disenado para mejorar la fiabilidad en comparaciones longitudinales frente a relojes epigeneticos convencionales.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Estudios longitudinales de envejecimiento: permite estimar la edad fenotipica en muestras repetidas de sangre con mayor estabilidad test-retest, reduciendo el ruido en la medicion del cambio biologico a lo largo del tiempo.
- Ensayos clinicos con biomarcadores de envejecimiento: sirve como endpoint intermedio para evaluar intervenciones (farmacologicas, dieteticas o de estilo de vida) que pretendan modificar la edad biologica.
- Cohorts epidemiologicas: aplicable a grandes bases de datos de metilacion en sangre para calcular edades fenotipicas de forma estandarizada mediante pyaging.
- Investigacion en biologia del envejecimiento: comparacion de trayectorias de envejecimiento entre individuos o grupos poblacionales usando una metrica entrenada directamente sobre fenotipo.
- Reproducibilidad y armonizacion de pipelines: al integrarse en pyaging, facilita la ejecucion uniforme del reloj junto con otros clocks del catalogo sobre el mismo objeto AnnData.
- Analisis de intervenciones de salud publica: evaluacion de diferencias de edad fenotipica asociadas a exposiciones o factores socioambientales en estudios observacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no requiere GPU para inferencia en el sentido habitual de redes neuronales.
- GPU recomendadas: no necesarias; la inferencia es una regresion sobre componentes principales y puede ejecutarse en CPU.
- Cabe en consumer GPU: si, aunque no es necesario; el cuello de botella es la carga y el preprocesado de los datos de metilacion.
- Opciones de despliegue: libreria pyaging en Python (`pya.pred.predict_age`), sobre objetos AnnData.
- Latencia y throughput estimados: no disponibles; dependen del tamano de la matriz de metilacion y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Especie/tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pcphenoage | PCA + elastic net | Edad fenotipica directa | Homo sapiens / sangre completa | MIT | Hugging Face (pyaging) |
| Relojes CpG de primera generacion (p. ej. PhenoAge original) | Regresion sobre CpG | Proxy del reloj original | Homo sapiens / sangre | segun autor original | Variable |
| Otros clocks del catalogo pyaging | Variable | Variable | Variable | Variable | Hugging Face (pyaging) |

No se dispone de datos numericos de rendimiento comparado en la informacion proporcionada; la comparativa se limita a caracteristicas metodologicas y de disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo reloj epigenetico, puede verse afectado por caracteristicas de la cohorte de entrenamiento (edad, etnia, estado de salud).
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero las predicciones pueden ser imprecisas fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: el modelo es especifico de Homo sapiens y de sangre completa; no es valido para otros tejidos o especies sin validacion.
- Restricciones de licencia: la libreria pyaging es MIT, pero los pesos conservan los terminos de los autores originales; es necesario revisar las condiciones para uso comercial.
- Caveats para produccion: requiere datos de metilacion correctamente normalizados y armonizados con el pipeline de pyaging; no es un modelo de proposito general ni sustituye una validacion clinica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/pcphenoage
- Catalogo de clocks de pyaging: https://pyaging.readthedocs.io
- Publicacion: Higgins-Chen, A. T., et al. "A computational solution for bolstering reliability of epigenetic clocks: implications for clinical trials and longitudinal tracking." Nature Aging 2 (2022): 644-661. https://doi.org/10.1038/s43587-022-00248-2
