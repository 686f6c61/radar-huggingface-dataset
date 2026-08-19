# pyaging/zhangen

## Resumen

El modelo `pyaging/zhangen` es un reloj epigenético basado en regresión elastic net que predice la edad cronológica de un individuo a partir de datos de metilación de ADN. Fue desarrollado por Zhang et al. en 2019 y publicado en Genome Medicine, siendo entrenado con el mayor conjunto de datos multi-cohorte disponible hasta la fecha, utilizando 514 sitios CpG seleccionados principalmente de sangre total y saliva. Este modelo pertenece a la categoría de "aging clocks", herramientas que estiman la edad biológica a partir de marcas epigenéticas, con aplicaciones en investigación del envejecimiento y epidemiología.

A diferencia de los modelos de lenguaje o visión, este no es un sistema de IA generativa, sino un modelo estadístico clásico de regresión penalizada. Su relevancia radica en su precisión mejorada frente a relojes anteriores, gracias al uso de una cohorte de entrenamiento amplia y diversa, y a la selección de un número reducido de CpGs que facilita su aplicación en plataformas de metilación de bajo coste. Está disponible bajo licencia BSD-3-Clause y se integra en la librería `pyaging`, que permite predecir la edad con una sola línea de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net (lineal) |
| Parametros totales | 514 coeficientes (uno por CpG seleccionado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (datos de metilación de ADN) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo emplea regresión elastic net, una técnica de regularización lineal que combina las penalizaciones L1 y L2 para seleccionar características y evitar sobreajuste. A partir de un conjunto de miles de sitios CpG medidos en plataformas de metilación, el entrenamiento identificó 514 CpGs con poder predictivo para la edad cronológica. El conjunto de entrenamiento incluyó múltiples cohortes independientes, predominantemente de sangre total y saliva, lo que mejora la generalización frente a relojes entrenados en una sola cohorte. No se utilizaron técnicas de RLHF ni DPO, ya que no es un modelo generativo. La innovación principal reside en el tamaño y diversidad del dataset de entrenamiento y en la selección parsimoniosa de marcadores, lo que reduce costes y facilita su uso en estudios poblacionales.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN (valores beta) en muestras de sangre total y saliva.
- Estimación de la desviación entre edad epigenética y edad cronológica, útil como proxy de envejecimiento biológico acelerado o retardado.
- Funciona con datos de plataformas comunes de metilación (p. ej., Illumina 450K o EPIC), siempre que los CpGs seleccionados estén presentes.
- Integración sencilla en flujos de análisis bioinformáticos mediante la librería `pyaging`.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Investigación del envejecimiento: el modelo permite cuantificar la edad epigenética en cohortes de estudio y correlacionarla con factores de estilo de vida, enfermedades o exposición ambiental.
- Estudios epidemiológicos de mortalidad y morbilidad: la aceleración de la edad epigenética se asocia con riesgo de mortalidad y enfermedades crónicas; este reloj puede aplicarse a biobancos con datos de metilación.
- Validación de intervenciones antienvejecimiento: en ensayos clínicos que evalúan fármacos o dietas, se puede medir el cambio en la edad epigenética antes y después de la intervención.
- Medicina de precisión: estimar la edad biológica de pacientes para ajustar tratamientos o evaluar el riesgo de enfermedades relacionadas con la edad.
- Análisis de tejidos accesibles: al estar entrenado en sangre y saliva, es adecuado para estudios no invasivos en humanos, donde estos tejidos son fáciles de obtener.
- Control de calidad en estudios de metilación: comparar la edad epigenética predicha con la edad cronológica conocida puede detectar errores de muestreo o procesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original reporta mejoras en precisión frente a relojes previos, pero no se incluyen métricas numéricas en la model card ni en el repositorio de HuggingFace.

## Requisitos de hardware

- El modelo es extremadamente ligero: solo requiere almacenar 514 coeficientes y una operación de producto escalar.
- Puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- La memoria RAM necesaria es inferior a 10 MB.
- No requiere cuantización ni despliegue especializado; se usa directamente mediante la librería `pyaging` en Python.
- Latencia despreciable (menos de 1 ms por muestra) incluso en miles de muestras.

## Comparativa con modelos similares

No disponible. Existen otros relojes epigenéticos como el de Horvath (2013) o Hannum (2013), pero la información proporcionada no incluye datos comparativos cuantitativos con estos modelos. Se recomienda consultar el artículo original para comparaciones detalladas.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente en sangre y saliva; su precisión puede degradarse en otros tejidos (p. ej., cerebro, músculo) aunque el artículo original sugiere cierta transferibilidad.
- Los 514 CpGs seleccionados pueden no estar presentes en todas las plataformas de metilación, especialmente en arrays antiguos o personalizados.
- La predicción de edad cronológica no es una medida directa de envejecimiento biológico; la interpretación debe hacerse con cautela y en contexto epidemiológico.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda citar el artículo original en publicaciones.
- No se dispone de información sobre sesgos por etnia o sexo; los datos de entrenamiento pueden tener desequilibrios que afecten a ciertas poblaciones.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/zhangen
- Artículo original: Zhang, Q., Vallerga, C.L., Walker, R.M. et al. Improved precision of epigenetic clock estimates across tissues and its implication for biological ageing. Genome Medicine 11, 54 (2019). DOI: https://doi.org/10.1186/s13073-019-0667-1
- Documentación de pyaging: https://pyaging.readthedocs.io
