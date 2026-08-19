# pyaging/systemsagehormone

## Resumen

`pyaging/systemsagehormone` es un reloj epigenético (aging clock) desarrollado por el equipo de pyaging y presentado en el artículo "Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems" (Sehgal et al., 2025, Nature Aging). Este modelo predice la edad biológica del sistema endocrino a partir de datos de metilación de ADN en sangre completa, devolviendo un valor en una escala similar a la edad cronológica. Forma parte de un conjunto más amplio de relojes que cubren distintos sistemas fisiológicos, con el objetivo de cuantificar la heterogeneidad del envejecimiento.

El modelo emplea una arquitectura de reducción de dimensionalidad (PCA) seguida de regresión con regularización elastic net. No es un modelo de lenguaje ni una red neuronal profunda; se trata de un modelo estadístico clásico calibrado con biomarcadores endocrinos y datos de mortalidad. Está diseñado para integrarse en el ecosistema `pyaging`, una librería Python especializada en relojes de envejecimiento. Su relevancia radica en permitir evaluar el envejecimiento específico del sistema endocrino a partir de un único análisis de metilación, lo que tiene aplicaciones en investigación biomédica y medicina de precisión.

El repositorio tiene un tamaño de 2.0 GB, lo que sugiere que incluye los pesos del modelo y posiblemente recursos auxiliares, aunque el contenido exacto no se detalla en la información disponible. La licencia es BSD-3-Clause, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net |
| Parametros totales | no disponible (modelo estadístico, no neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (entrada: matriz de metilación de CpGs) |
| Tipos de cuantizacion | no aplica (modelo no neuronal) |
| Idiomas soportados | no aplica (datos biológicos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (archivos internos de pyaging) |

## Arquitectura y entrenamiento

El modelo sigue el enfoque clásico de los relojes epigenéticos: primero se aplica un análisis de componentes principales (PCA) a los niveles de metilación de sitios CpG seleccionados en sangre completa, reduciendo la dimensionalidad del espacio de características. Sobre esos componentes se entrena una regresión elastic net, que combina regularización L1 y L2, para predecir un valor de edad biológica asociado al sistema endocrino. La variable objetivo se construye a partir de biomarcadores endocrinos y datos de mortalidad, de modo que el reloj refleja tanto el estado hormonal como el riesgo de mortalidad.

El entrenamiento se realizó con datos de metilación de sangre completa de humanos (Homo sapiens). No se especifican en la información disponible el número de muestras, la plataforma de microarrays utilizada ni el número de CpGs finales. La publicación original (Sehgal et al., 2025) describe el desarrollo de 11 relojes de sistemas, siendo este uno de ellos. No se indica si se emplearon técnicas de calibración adicionales como transformaciones de edad o ajustes por composición celular, aunque es habitual en este tipo de modelos.

## Capacidades

- Predicción de edad biológica del sistema endocrino a partir de datos de metilación de ADN en sangre completa.
- Integración directa con la librería `pyaging` mediante la función `pya.pred.predict_age(adata, ["systemsagehormone"])`.
- Salida en escala similar a la edad cronológica, interpretable como desviación del envejecimiento endocrino.
- Diseñado para ser usado junto con otros relojes de sistemas (sistemas cardiovascular, inmunológico, etc.) dentro del marco Systems Age.
- No tiene capacidades de generación de texto, razonamiento, código ni visión; es un modelo puramente biológico-estadístico.

## Casos de uso

- Investigación en envejecimiento: permite cuantificar la edad biológica del sistema endocrino en cohortes de estudio, correlacionándola con otros biomarcadores y con resultados de salud.
- Estudios longitudinales: monitorizar cambios en el envejecimiento endocrino a lo largo del tiempo en las mismas personas, evaluando el efecto de intervenciones (dieta, ejercicio, fármacos).
- Evaluación de intervenciones anti-envejecimiento: medir si una terapia concreta reduce la desviación de la edad endocrina respecto a la cronológica.
- Medicina personalizada: incorporar la edad biológica endocrina como factor de riesgo en la evaluación de pacientes, complementando los marcadores clínicos tradicionales.
- Análisis de datos de metilación existentes: aplicar el modelo a conjuntos de datos públicos (GEO, TCGA) para explorar asociaciones con enfermedades endocrinas como diabetes o síndrome metabólico.
- Desarrollo de relojes multi-sistema: combinar la predicción de este modelo con otros relojes de Systems Age para obtener un perfil de envejecimiento por sistemas en un mismo individuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Sehgal et al., 2025) reporta métricas de rendimiento para los 11 relojes de Systems Age, pero esos datos no se incluyen en la model card de HuggingFace. Se recomienda consultar la publicación para obtener valores de correlación, error absoluto medio y validación en cohortes independientes.

## Requisitos de hardware

- Al ser un modelo de regresión sobre componentes principales, no requiere GPU. La inferencia se puede realizar en CPU con recursos mínimos.
- El repositorio ocupa 2.0 GB, por lo que se necesita espacio en disco para descargarlo, pero la memoria RAM necesaria es modesta (típicamente menos de 1 GB para cargar los coeficientes).
- Se integra con `pyaging`, que depende de `scanpy` y `anndata`; estos requieren un entorno Python estándar (Python 3.8+).
- No se especifican requisitos de latencia ni throughput, pero al tratarse de una operación de álgebra lineal sobre una matriz de metilación, la ejecución es casi instantánea para muestras individuales.
- Para procesar grandes cohortes (miles de muestras), se recomienda un servidor con CPU multinúcleo, pero no se necesitan GPUs.

## Comparativa con modelos similares

Existen otros relojes epigenéticos ampliamente utilizados, aunque no se dispone de comparaciones cuantitativas en la información proporcionada:

| Modelo | Año | Tipo | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horvath clock | 2013 | Regresión elastic net sobre CpGs | Multi-tejido | No especificada (uso académico) | Scripts en línea |
| Hannum clock | 2013 | Regresión elastic net | Sangre | No especificada | Scripts en línea |
| PhenoAge | 2018 | Regresión elastic net sobre CpGs | Sangre | No especificada | Scripts en línea |
| GrimAge | 2019 | Regresión sobre marcadores de mortalidad | Sangre | No especificada | Scripts en línea |
| systemsagehormone | 2025 | PCA + elastic net | Sangre completa | BSD-3-Clause | HuggingFace / pyaging |

A diferencia de los relojes clásicos, `systemsagehormone` se centra específicamente en el sistema endocrino y forma parte de un conjunto más amplio de relojes de sistemas. La licencia BSD-3-Clause es más permisiva que las de muchos relojes anteriores, que suelen tener restricciones de uso académico.

## Limitaciones y advertencias

- Solo está validado para sangre completa humana; no debe aplicarse a otros tejidos sin recalibración.
- Requiere datos de metilación de alta calidad, preferiblemente obtenidos con la misma plataforma utilizada en el entrenamiento (no especificada en la información disponible).
- La predicción es un valor continuo interpretado como edad biológica, pero no establece causalidad; una desviación alta no implica necesariamente una enfermedad endocrina.
- No se han publicado métricas de rendimiento en la model card; los usuarios deben consultar el artículo original para evaluar la precisión.
- El modelo no contempla variables como sexo, edad cronológica o composición celular, que pueden influir en la interpretación de los resultados.
- Al ser un modelo estadístico, no captura interacciones no lineales complejas que podrían ser relevantes en el envejecimiento endocrino.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la publicación original para evitar conflictos de patentes o derechos de autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pyaging/systemsagehormone
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original (DOI): https://doi.org/10.1038/s43587-025-00958-3
