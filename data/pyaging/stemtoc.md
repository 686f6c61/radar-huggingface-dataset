# pyaging/stemtoc

## Resumen

stemtoc es un reloj epigenético de edad mitótica relativa desarrollado por el equipo de pyaging, un proyecto de código abierto centrado en herramientas de biología computacional para el estudio del envejecimiento. El modelo se basa en la agregación del percentil 95 de los niveles de metilación del ADN en 371 sitios CpG mitóticos previamente filtrados por su comportamiento in vivo. Fue publicado en 2024 en *Nature Communications* por Zhu et al., y está diseñado específicamente para estimar la edad mitótica de células humanas a partir de datos de metilación.

A diferencia de los modelos de lenguaje o de visión, stemtoc no es una red neuronal ni un transformer; es un procedimiento estadístico determinista que calcula una puntuación a partir de la metilación en un conjunto fijo de CpGs. Su relevancia radica en que permite cuantificar el número de divisiones celulares acumuladas, un biomarcador clave en estudios de envejecimiento, cáncer y biología del desarrollo. El modelo está disponible bajo licencia BSD-3-Clause y se integra en la librería `pyaging`, lo que facilita su uso en pipelines de análisis de metilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregacion estadistica del percentil 95 sobre 371 CpGs mitoticos |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No aplica (implementado como funcion en pyaging) |

## Arquitectura y entrenamiento

El modelo stemtoc no emplea una arquitectura de aprendizaje profundo. Su funcionamiento es una agregación estadística: para cada muestra, se calcula el percentil 95 de los niveles de metilación (beta values) en los 371 CpGs seleccionados. Estos CpGs fueron identificados como "mitóticos" mediante un filtrado in vivo, es decir, se seleccionaron aquellos sitios cuya metilación cambia de forma consistente con el número de divisiones celulares en tejidos humanos. El valor resultante se interpreta como una edad mitótica relativa.

El entrenamiento, descrito en el artículo de Zhu et al. (2024), se realizó sobre datos de metilación de células humanas de múltiples tejidos, incluyendo sangre completa y células cultivadas. El proceso implicó la identificación de CpGs con variación asociada a proliferación celular y la validación de su comportamiento en contextos in vivo. No se utilizaron técnicas como RLHF o DPO, ya que no es un modelo generativo. La innovación principal reside en la selección rigurosa de los CpGs y en la simplicidad del agregado, que evita sobreajuste y mejora la interpretabilidad biológica.

## Capacidades

- Predicción de edad mitótica relativa en células humanas a partir de datos de metilación de ADN.
- Aplicable a múltiples tejidos, incluyendo sangre completa y células cultivadas.
- Funciona con datos de metilación de arrays de Illumina (450K, EPIC) o secuenciación bisulfito.
- Integración sencilla en pipelines de `pyaging` mediante una llamada a `predict_age`.
- No requiere entrenamiento adicional ni ajuste de hiperparámetros por parte del usuario.
- Es un modelo determinista y reproducible, sin componentes estocásticos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas.

## Casos de uso

- **Investigación en envejecimiento biológico**: estimar la edad mitótica de muestras de sangre o tejido para correlacionarla con otros biomarcadores de envejecimiento, como la edad epigenética de Horvath o la longitud de telómeros.
- **Estudios de cáncer**: cuantificar la proliferación celular acumulada en tumores o tejidos premalignos, lo que puede ayudar a estratificar el riesgo o a evaluar la agresividad tumoral.
- **Validación de cultivos celulares**: monitorizar el número de divisiones que ha sufrido una línea celular en cultivo, útil para controlar la senescencia o la estabilidad genética en experimentos de laboratorio.
- **Biología del desarrollo**: analizar la tasa de división celular en tejidos durante el desarrollo embrionario o en células madre, para entender procesos de diferenciación.
- **Farmacología y toxicología**: evaluar el efecto de compuestos sobre la proliferación celular en ensayos preclínicos, usando la edad mitótica como biomarcador de respuesta.
- **Medicina regenerativa**: caracterizar la expansión celular en terapias con células madre o CAR-T, donde el número de divisiones puede afectar la funcionalidad final del producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original de Zhu et al. (2024) incluye validaciones en múltiples conjuntos de datos, pero no se proporcionan métricas numéricas estandarizadas (como correlación o error absoluto) en la model card de HuggingFace. Se recomienda consultar la publicación para obtener detalles sobre la validación.

## Requisitos de hardware

- El cálculo del percentil 95 sobre 371 CpGs es computacionalmente trivial; se ejecuta en CPU en menos de un segundo para una muestra individual.
- No requiere GPU ni memoria VRAM específica.
- Puede ejecutarse en cualquier ordenador con Python y la librería `pyaging` instalada.
- Para procesar grandes cohortes (miles de muestras), un equipo con 8 GB de RAM es suficiente, ya que los datos de metilación suelen cargarse como matrices densas.
- No se han reportado requisitos de latencia o throughput, pero al ser una operación vectorial, el rendimiento es lineal con el número de muestras y no presenta cuellos de botella relevantes.

## Comparativa con modelos similares

| Modelo | Tipo | Tejidos | CpGs utilizados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stemtoc | Percentil 95 | Multi-tejido, sangre, cultivo | 371 | BSD-3-Clause | pyaging (HuggingFace) |
| Horvath clock (2013) | Regresión penalizada (Elastic Net) | Multi-tejido | 353 | No especificada | Varias implementaciones (R, Python) |
| Hannum clock (2013) | Regresión penalizada (Elastic Net) | Sangre | 71 | No especificada | Varias implementaciones |
| PhenoAge (2018) | Regresión de Cox + Elastic Net | Multi-tejido | 513 | No especificada | Varias implementaciones |

La principal diferencia de stemtoc es que no estima la edad cronológica, sino la edad mitótica (número de divisiones), lo que lo hace complementario a los relojes de edad epigenética clásicos. Además, su simplicidad estadística facilita la interpretación y evita problemas de sobreajuste típicos de modelos con miles de CpGs.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para Homo sapiens; no es aplicable a otras especies sin recalibración.
- Requiere datos de metilación de alta calidad y normalizados; variaciones en la plataforma de medición pueden afectar los resultados.
- La edad mitótica es una medida relativa, no absoluta; no debe interpretarse como un recuento exacto de divisiones celulares.
- No se han evaluado sesgos por edad, sexo o etnia en la información disponible; se recomienda precaución al aplicar en poblaciones diversas.
- La licencia BSD-3-Clause permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable de la validación en su contexto específico.
- No es un modelo de lenguaje ni de visión; no debe usarse para tareas fuera del ámbito de la metilación de ADN.
- La documentación disponible es limitada; para un uso riguroso, se debe consultar el artículo científico original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/stemtoc
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original: Zhu, Tianlei, et al. "An improved epigenetic counter to track mitotic age in cells." Nature Communications 15 (2024): 4211. DOI: https://doi.org/10.1038/s41467-024-48649-8
