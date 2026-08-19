# pyaging/replitali

## Resumen

RepliTali es un reloj epigenético basado en metilación de ADN que estima la historia replicativa relativa acumulada en células humanas primarias cultivadas. Fue desarrollado por el grupo de investigación liderado por Endicott, Nolte, Shen y Laird, y publicado en Nature Communications en 2022. El modelo utiliza regresión elastic net sobre datos de metilación en regiones parcialmente metiladas (PMD) para predecir el número normalizado de duplicaciones de población (PD) en cultivos celulares seriados.

A diferencia de los modelos de lenguaje, RepliTali es un modelo estadístico clásico, no una red neuronal, y se distribuye como parte de la librería `pyaging`, un ecosistema de relojes de envejecimiento para datos ómicos. Su relevancia radica en que permite cuantificar el desgaste replicativo de células primarias, un parámetro clave en estudios de envejecimiento, oncología y biología del desarrollo. El modelo está disponible bajo licencia BSD-3-Clause y se puede integrar fácilmente en pipelines de análisis de metilación con Python.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Elastic net regression |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (modelo biologico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente coeficientes del modelo, no se especifica) |

## Arquitectura y entrenamiento

RepliTali es un modelo de regresión elastic net, una técnica de regularización lineal que combina penalizaciones L1 y L2. Se entrenó sobre datos de metilación de ADN (probablemente arrays de Illumina) procedentes de células humanas primarias cultivadas de forma seriada, con el objetivo de predecir la historia replicativa relativa, normalizada a duplicaciones de población. La metodología se detalla en el artículo de Endicott et al. (2022), donde se demuestra que la pérdida de metilación en dominios parcialmente metilados de replicación tardía está asociada con la división celular.

El entrenamiento se realizó sobre un conjunto de muestras de cultivos primarios, con etiquetas de PD acumuladas. No se dispone de información pública sobre el número exacto de muestras, la composición del dataset ni si se aplicaron técnicas de validación cruzada específicas. El modelo está integrado en la librería `pyaging`, que facilita su uso mediante una API simple.

## Capacidades

- Predicción de historia replicativa relativa acumulada a partir de perfiles de metilación de ADN en células humanas primarias cultivadas.
- Estimación del número normalizado de duplicaciones de población (PD) como medida de envejecimiento replicativo.
- Compatible con datos de metilación de arrays de Illumina (formato estándar en epigenética).
- Integración sencilla en flujos de trabajo de `pyaging` mediante la función `predict_age`.
- No es un modelo generativo: no produce texto, código ni razonamiento; su salida es un valor numérico continuo.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Investigación en envejecimiento celular: permite cuantificar la historia replicativa de células primarias en cultivo, útil para estudiar la senescencia y la capacidad proliferativa.
- Control de calidad en cultivos celulares: evaluar la "edad" replicativa de lotes de células antes de usarlos en experimentos, asegurando consistencia entre pasajes.
- Estudios de oncología: analizar la relación entre división celular y alteraciones epigenéticas en células tumorales primarias, ayudando a entender la progresión tumoral.
- Biología del desarrollo: monitorizar la expansión de células madre o progenitoras en cultivo y su agotamiento replicativo.
- Validación de protocolos de expansión celular: comparar diferentes condiciones de cultivo (medios, factores de crecimiento) en términos de desgaste replicativo.
- Docencia y formación: como ejemplo de reloj epigenético en cursos de bioinformática o biología computacional, demostrando el uso de regresión regularizada en datos ómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Endicott et al., 2022) reporta métricas de rendimiento, pero no se incluyen en la model card de HuggingFace. Se recomienda consultar la publicación para obtener datos de exactitud, correlación y error absoluto medio.

## Requisitos de hardware

- Modelo extremadamente ligero: al ser una regresión elastic net, solo requiere almacenar un vector de coeficientes y un intercepto.
- Ejecución en CPU: no necesita GPU. Cualquier ordenador con Python y las dependencias de `pyaging` puede ejecutarlo.
- Memoria RAM: menos de 100 MB para cargar el modelo y los datos de entrada (típicamente una matriz de metilación).
- Despliegue: se integra en pipelines de Python con `pyaging`; no requiere servidores de inferencia especializados como vLLM u Ollama.
- Latencia: milisegundos por muestra, incluso con miles de CpGs de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros relojes epigenéticos (por ejemplo, el reloj de Horvath o PhenoAge) en términos de parámetros, contexto o rendimiento, ya que esos modelos tienen objetivos y metodologías diferentes. RepliTali se especializa en historia replicativa, mientras que otros relojes suelen predecir edad cronológica o riesgo de mortalidad. La comparativa queda, por tanto, no disponible.

## Limitaciones y advertencias

- Específico para células humanas primarias cultivadas: no es válido para tejidos in vivo sin validación adicional.
- Requiere datos de metilación de ADN en formato compatible con `pyaging`; no funciona con otros tipos de datos ómicos.
- La predicción es relativa y normalizada a duplicaciones de población, no una medida absoluta de edad cronológica.
- Posibles sesgos derivados del conjunto de entrenamiento: si las células de origen son de un tipo tisular concreto, la generalización a otros tipos celulares puede ser limitada.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la precisión en aplicaciones clínicas o de diagnóstico.
- No se han publicado métricas de rendimiento en la model card, por lo que se desconoce la exactitud en diferentes condiciones experimentales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/replitali
- Artículo original: Endicott, J.L., Nolte, P.A., Shen, H. & Laird, P.W. Cell division drives DNA methylation loss in late-replicating domains in primary human cells. Nature Communications 13, 6659 (2022). DOI: https://doi.org/10.1038/s41467-022-34268-8
- Documentación de pyaging: https://pyaging.readthedocs.io
