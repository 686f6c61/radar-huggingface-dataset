# pyaging/pipekretrainedh

## Resumen

`pipekretrainedh` es un reloj epigenético (aging clock) desarrollado por el equipo de pyaging, un paquete de Python para análisis de envejecimiento a partir de datos biológicos. Se trata de un modelo de regresión lineal que predice la edad cronológica de un individuo a partir de los niveles de metilación de ADN en 308 sitios CpG concretos, originalmente identificados por Horvath. A diferencia de otras variantes del mismo reloj, este modelo fue reajustado sin validación cruzada, utilizando todos los CpGs compartidos entre las plataformas de micromatrices 27K, 450K y EPIC.

El modelo está diseñado para uso en investigación biomédica, especialmente en estudios de envejecimiento, epidemiología epigenética y medicina de precisión. Su relevancia radica en que proporciona una estimación de la edad biológica a partir de un perfil de metilación, lo que permite investigar la aceleración del envejecimiento y su asociación con enfermedades, estilos de vida o exposiciones ambientales. Al ser un modelo lineal sobre un número reducido de CpGs, es computacionalmente ligero y fácilmente interpretable, lo que lo hace adecuado para integración en pipelines de análisis existentes.

La arquitectura es una regresión lineal estándar, sin capas ocultas ni mecanismos de atención. El tamaño del modelo es mínimo (un vector de coeficientes para 308 CpGs más un intercepto), y no aplica el concepto de longitud de contexto. La licencia es BSD-3-Clause, lo que permite uso comercial y modificación con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (penalizacion nula, refit sin validacion cruzada) |
| Parametros totales | 309 (308 coeficientes para CpGs + 1 intercepto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (pesos en punto flotante, sin cuantizacion) |
| Idiomas soportados | no aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en la libreria pyaging, probablemente en formato interno de Python) |

## Arquitectura y entrenamiento

El modelo es una regresion lineal multiple que utiliza como caracteristicas los niveles de metilacion (valores beta) en 308 sitios CpG especificos. Estos CpGs fueron seleccionados originalmente por Horvath en su reloj epigenetico multi-tejido de 2013, y aqui se reajustan los coeficientes sin ninguna penalizacion (unpenalized refit) y sin realizar validacion cruzada. El entrenamiento se realizo sobre datos de metilacion de micromatrices de tres plataformas distintas (27K, 450K y EPIC), compartiendo los 308 CpGs comunes a todas ellas. El objetivo es minimizar el error cuadratico medio entre la edad cronologica y la edad predicha.

No se emplearon tecnicas de aprendizaje profundo ni refuerzo; es un modelo clasico de estadistica. La innovacion principal radica en la revision del reloj de Horvath para hacerlo compatible con multiples plataformas de micromatrices, mejorando su aplicabilidad en estudios retrospectivos donde se han usado distintos chips. El modelo fue publicado en 2022 (articulo de 2023) por Pipek y Csabai.

## Capacidades

- Prediccion de edad cronologica a partir de datos de metilacion de ADN (valores beta).
- Funciona en multiples tejidos (multi-tissue), lo que permite su uso en sangre, tejido, etc.
- Compatible con datos de plataformas 27K, 450K y EPIC, siempre que esten presentes los 308 CpGs.
- Integracion sencilla en Python mediante la funcion `pya.pred.predict_age` de la libreria pyaging.
- No requiere GPU; la inferencia es inmediata incluso en CPU.
- No soporta tool calling, agentes, vision ni procesamiento de lenguaje natural.

## Casos de uso

- Estudios de envejecimiento biologico: calcular la edad epigenetica de una cohorte para comparar la aceleracion del envejecimiento entre grupos (p. ej., fumadores vs. no fumadores). El modelo devuelve una edad estimada a partir de los datos de metilacion, permitiendo calcular la diferencia con la edad cronologica.
- Analisis de datos de micromatrices retrospectivos: dado que es compatible con 27K, 450K y EPIC, se puede aplicar a conjuntos de datos historicos sin necesidad de re-medir, siempre que los CpGs requeridos esten presentes.
- Validacion de nuevos biomarcadores epigeneticos: usar la edad predicha como variable dependiente o covariada en modelos de riesgo para enfermedades relacionadas con la edad.
- Control de calidad en estudios de metilacion: detectar anomalias en las muestras comparando la edad predicha con la edad reportada, lo que puede indicar errores de etiquetado o problemas de calidad de datos.
- Investigacion en gerociencia: evaluar el efecto de intervenciones (dieta, ejercicio, farmacos) sobre la edad epigenetica en estudios longitudinales.
- Docencia y formacion en bioinformatica: como ejemplo de modelo de regresion aplicado a datos omicos, facil de ejecutar y de interpretar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento como correlacion con la edad cronologica o error absoluto medio. Se recomienda consultar el articulo original de Pipek y Csabai (2023) para obtener datos de validacion.

## Requisitos de hardware

- VRAM estimada: 0 GB (el modelo es un conjunto de coeficientes, no requiere GPU).
- GPU recomendada: ninguna, se ejecuta en CPU.
- Compatible con cualquier ordenador con Python 3.8+ y la libreria pyaging instalada.
- Opciones de despliegue: integracion directa en scripts de Python; no requiere servidores de inferencia ni frameworks especializados como vLLM o llama.cpp.
- Latencia: inferior a 1 milisegundo por muestra (calculo de una combinacion lineal de 308 valores).

## Comparativa con modelos similares

| Modelo | Tipo | Numero de CpGs | Plataformas | Validacion cruzada | Licencia |
|---|---|---|---|---|---|
| `pipekretrainedh` | Regresion lineal | 308 | 27K, 450K, EPIC | No | BSD-3-Clause |
| Horvath (2013) | Regresion lineal | 353 | 27K, 450K | Si | No especificada (uso academico) |
| Hannum (2013) | Regresion lineal | 71 | 450K | Si | No especificada |
| PhenoAge (Levine 2018) | Regresion lineal (elastic net) | 513 | 27K, 450K, EPIC | Si | No especificada |

Nota: la informacion sobre Horvath, Hannum y PhenoAge se basa en conocimiento general; no se ha verificado en la busqueda web para esta ficha. `pipekretrainedh` se distingue por su refit sin penalizacion y su compatibilidad con tres plataformas, ademas de una licencia permisiva.

## Limitaciones y advertencias

- No se realizo validacion cruzada durante el entrenamiento, lo que puede llevar a una sobreestimacion del rendimiento en datos nuevos.
- El modelo se limita a los 308 CpGs de Horvath; si el conjunto de datos no contiene todos esos sitios, la prediccion no es posible.
- Es un modelo lineal, por lo que no captura interacciones no lineales entre CpGs que podrian mejorar la precision.
- La edad predicha es una estimacion; no debe utilizarse como diagnostico clinico ni para tomar decisiones medicas.
- La licencia BSD-3-Clause permite uso comercial, pero requiere incluir el aviso de copyright en redistribuciones.
- El modelo esta pensado para Homo sapiens; no es aplicable a otras especies.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyaging/pipekretrainedh
- Documentacion de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Articulo original: Pipek, Orsolya Anna, and István Csabai. "A revised multi-tissue, multi-platform epigenetic clock model for methylation array data." Journal of Mathematical Chemistry 61 (2023): 376–388. DOI: https://doi.org/10.1007/s10910-022-01381-4
