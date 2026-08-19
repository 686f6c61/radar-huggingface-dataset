# pyaging/pastamouse

## Resumen

pastamouse es un reloj de envejecimiento transcriptómico (aging clock) desarrollado por el equipo de pyaging, que predice la edad biológica de ratones (*Mus musculus*) a partir de datos de expresión génica. Se trata de una adaptación del modelo humano "Pasta" (Salignon et al., 2025) mediante transferencia de ortólogos uno a uno, transformación de rangos e imputación mediana de los genes faltantes. El modelo es una regresión logística con regularización ridge, una técnica estadística clásica que, a diferencia de los grandes modelos de lenguaje o redes profundas, ofrece interpretabilidad y bajo coste computacional.

Su relevancia radica en que permite trasladar a modelos murinos los hallazgos sobre determinantes químicos y genéticos del envejecimiento obtenidos en humanos, facilitando la investigación preclínica. Al ser multi-tejido, puede aplicarse a muestras de distintos órganos, lo que amplía su utilidad en estudios de intervenciones antienvejecimiento. El modelo está disponible bajo licencia BSD-3-Clause y se integra en la librería pyaging, que ofrece un catálogo de relojes de envejecimiento para análisis transcriptómicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística ridge (orthologue-transferred) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de expresión génica) |
| Tipos de cuantizacion | no aplica (modelo estadístico, no red neuronal) |
| Idiomas soportados | no aplica (datos biológicos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente serializado por pyaging) |

## Arquitectura y entrenamiento

pastamouse es una regresión logística con regularización ridge (L2), entrenada originalmente en datos transcriptómicos humanos (modelo Pasta) y posteriormente transferida a ratón mediante el mapeo de ortólogos uno a uno entre ambas especies. El proceso incluye una transformación de rangos de los valores de expresión y la imputación de la mediana para los genes que no están presentes en el conjunto de datos de entrada. No se trata de un modelo de aprendizaje profundo ni de un transformer; es un modelo lineal regularizado que pondera la contribución de cada gen a la predicción de la edad.

El entrenamiento original del modelo Pasta se describe en el preprint de Salignon et al. (2025), donde se utilizó una amplia colección de muestras transcriptómicas humanas para mapear los determinantes químicos y genéticos del envejecimiento. La transferencia a ratón se basa en la conservación evolutiva de los genes implicados, asumiendo que los ortólogos tienen funciones similares. No se dispone de detalles sobre el número de genes utilizados ni el tamaño del dataset de entrenamiento en la información proporcionada.

## Capacidades

- Predicción de edad transcriptómica en ratones (*Mus musculus*) a partir de datos de expresión génica (microarrays o RNA-seq).
- Funciona en múltiples tejidos (multi-tissue), lo que permite evaluar la edad biológica en distintos órganos.
- Integración con la librería pyaging mediante la función `pya.pred.predict_age(adata, ["pastamouse"])`, que acepta objetos AnnData.
- Capacidad de transferencia desde el modelo humano Pasta, lo que permite comparar relojes de envejecimiento entre especies.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling, ya que es un modelo puramente estadístico para datos tabulares.

## Casos de uso

- Investigación en biología del envejecimiento: permite cuantificar la edad biológica de ratones en estudios longitudinales, correlacionándola con intervenciones dietéticas, farmacológicas o genéticas.
- Evaluación de intervenciones antienvejecimiento: al ser multi-tejido, se puede medir el efecto de compuestos como la metformina o la rapamicina en la edad transcriptómica de distintos órganos.
- Estudios de rejuvenecimiento: el modelo puede detectar cambios en la edad biológica tras terapias de reprogramación celular o trasplantes de factores sanguíneos.
- Validación de modelos murinos de enfermedades relacionadas con la edad: permite comparar la edad transcriptómica de ratones knockout o transgénicos con la de controles sanos.
- Análisis de heterogeneidad tisular: se puede aplicar a datos de expresión de diferentes tejidos para identificar cuáles envejecen más rápido o más lento bajo condiciones específicas.
- Integración en pipelines de análisis bioinformático: al ser parte de pyaging, puede combinarse con otros relojes de envejecimiento para obtener una visión consensuada de la edad biológica en experimentos de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se describe en el preprint de Salignon et al. (2025), pero no se incluyen métricas de rendimiento (como correlación con edad cronológica, error absoluto medio, etc.) en la model card de HuggingFace.

## Requisitos de hardware

- Al ser una regresión logística con regularización ridge, el modelo es extremadamente ligero en comparación con redes neuronales. La inferencia se realiza en milisegundos en una CPU estándar.
- No requiere GPU. Cualquier ordenador moderno puede ejecutar la predicción sin problemas.
- La memoria RAM necesaria es mínima (menos de 100 MB para cargar los coeficientes del modelo).
- El despliegue puede hacerse directamente en Python con la librería pyaging, sin necesidad de servidores de inferencia como vLLM o TGI.
- Para datos de transcriptómica de gran tamaño (miles de muestras), el cuello de botella suele estar en el preprocesamiento de los datos de expresión, no en el modelo en sí.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar pastamouse con otros relojes de envejecimiento para ratón (como Horvath mouse clock, o los relojes de DNA metilación). La información proporcionada no incluye métricas de rendimiento ni detalles sobre el número de genes o tejidos cubiertos. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo se basa en la transferencia de ortólogos desde humanos, por lo que su precisión depende de la conservación evolutiva de los genes implicados. Genes sin ortólogos claros o con funciones divergentes pueden afectar negativamente a la predicción.
- La imputación de la mediana para genes faltantes introduce un sesgo potencial: si un gen relevante no se mide en el experimento, se sustituye por un valor promedio que puede no reflejar la expresión real.
- La transformación de rangos asume una distribución uniforme de la expresión, lo que puede no ser adecuado para todos los tejidos o plataformas de medición.
- No se especifican los tejidos concretos para los que el modelo ha sido validado; la etiqueta "multi-tissue" sugiere aplicabilidad amplia, pero sin datos de validación no se puede garantizar su fiabilidad en tejidos poco representados.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar el trabajo original (Salignon et al., 2025) en publicaciones.
- El modelo está pensado exclusivamente para datos de transcriptómica; no es aplicable a otros tipos de datos ómicos sin adaptación.
- No se han publicado benchmarks ni métricas de error, por lo que se desconoce su precisión absoluta. Se recomienda validar el modelo en cada nuevo conjunto de datos antes de usarlo en contextos críticos.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/pastamouse
- Paper original (Pasta): Salignon, J. et al. Pasta, a versatile transcriptomic clock, maps the chemical and genetic determinants of aging and rejuvenation. bioRxiv 2025.06.04.657785 (2025). https://doi.org/10.1101/2025.06.04.657785
- Documentación de pyaging: https://pyaging.readthedocs.io
