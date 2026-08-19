# pyaging/zhangblup

## Resumen

El modelo `pyaging/zhangblup` es un reloj epigenético de alta dimensionalidad que predice la edad cronológica en humanos a partir de datos de metilación de ADN. Fue desarrollado por Zhang, Vallerga, Walker y colaboradores en 2019, y publicado en *Genome Medicine* con el título "Improved precision of epigenetic clock estimates across tissues and its implication for biological ageing". El modelo emplea best linear unbiased prediction (BLUP) sobre un conjunto completo de 319.607 sondas de metilación, tras un control de calidad riguroso, lo que lo convierte en una herramienta de gran precisión para estimar la edad biológica en muestras de sangre total y saliva.

Su relevancia radica en que los relojes epigenéticos son una de las métricas más utilizadas en la investigación del envejecimiento biológico. A diferencia de los modelos de aprendizaje profundo o los LLM, este modelo es un estimador estadístico lineal, ligero y fácilmente reproducible, integrado en la librería `pyaging` para su uso directo en pipelines de análisis de datos ómicos. No requiere GPU y puede ejecutarse en cualquier máquina con Python, lo que facilita su adopción en laboratorios de biología computacional.

La ficha que sigue se centra en este modelo específico, adaptando la estructura general de fichas técnicas a un modelo que no es un transformer ni un LLM, sino un predictor estadístico para datos de metilación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Best linear unbiased prediction (BLUP) |
| Parametros totales | No aplicable (modelo estadístico lineal, no red neuronal) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No aplicable (datos biológicos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en la librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo utiliza best linear unbiased prediction (BLUP), un método estadístico clásico para estimar efectos aleatorios en modelos mixtos. En este caso, se aplica sobre un conjunto de 319.607 sondas de metilación de ADN que han pasado un control de calidad exhaustivo. La predicción de la edad cronológica se realiza como una combinación lineal ponderada de los niveles de metilación en esas sondas, donde los pesos se estiman mediante BLUP. Este enfoque difiere de los relojes epigenéticos anteriores que usaban métodos de regresión penalizada (como elastic net) sobre un número reducido de CpGs; aquí se aprovecha toda la información disponible del epigenoma.

Los datos de entrenamiento provienen de muestras de sangre total y saliva de individuos humanos, y el modelo fue publicado en 2019. No se dispone de información detallada sobre el número exacto de muestras ni la composición del dataset de entrenamiento en la información proporcionada. El entrenamiento se realizó con técnicas estadísticas convencionales, sin uso de RLHF, DPO ni otras técnicas de alineación propias de los LLM.

## Capacidades

- Predicción de edad cronológica en humanos a partir de datos de metilación de ADN.
- Funciona con muestras de sangre total y saliva.
- Alta dimensionalidad: utiliza 319.607 sondas de metilación, lo que permite capturar señales sutiles del epigenoma.
- Modelo estadístico ligero, no requiere GPU ni recursos computacionales elevados.
- Integrado en la librería `pyaging`, que ofrece una interfaz unificada para múltiples relojes epigenéticos.
- No tiene capacidades de generación de texto, razonamiento, código, visión ni tool calling, ya que es un predictor biológico especializado.

## Casos de uso

- Investigación en envejecimiento biológico: permite estimar la edad biológica de individuos a partir de muestras de sangre o saliva, facilitando estudios sobre la tasa de envejecimiento y su relación con enfermedades.
- Estudios de intervención: se puede usar para evaluar el efecto de tratamientos, dietas o cambios de estilo de vida sobre la edad epigenética, comparando mediciones antes y después.
- Análisis de cohortes epidemiológicas: integración en pipelines de análisis de datos de metilación para calcular edades epigenéticas en grandes cohortes, como UK Biobank o estudios longitudinales.
- Validación de biomarcadores: sirve como referencia para comparar otros relojes epigenéticos o nuevos biomarcadores de envejecimiento.
- Educación y divulgación: en cursos de biología computacional, se puede utilizar como ejemplo de modelo estadístico aplicado a datos ómicos.
- Control de calidad en laboratorios: verificar la consistencia de datos de metilación comparando la edad predicha con la edad cronológica conocida de muestras de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (Zhang et al., 2019) reporta mejoras en la precisión de las estimaciones de edad epigenética en comparación con relojes anteriores, pero no se incluyen métricas específicas (como correlación con edad cronológica o error absoluto medio) en la información proporcionada. Para obtener datos cuantitativos, se recomienda consultar la publicación original.

## Requisitos de hardware

- Modelo extremadamente ligero: al ser un modelo lineal, su tamaño en memoria es de unos pocos megabytes (aunque el número exacto no está disponible).
- No requiere GPU. Puede ejecutarse en cualquier CPU moderna.
- Memoria RAM mínima: menos de 1 GB para cargar el modelo y procesar una muestra individual.
- Despliegue sencillo: se usa a través de la librería `pyaging` en Python, sin necesidad de servidores de inferencia como vLLM, Ollama o TGI.
- Latencia: prácticamente instantánea para una muestra individual; el cálculo de la predicción es una operación de álgebra lineal simple.

## Comparativa con modelos similares

Existen otros relojes epigenéticos ampliamente utilizados, como el reloj de Horvath (2013), el de Hannum (2013) y PhenoAge (2018). Sin embargo, no se dispone de datos comparativos cuantitativos en la información proporcionada. La siguiente tabla resume las diferencias cualitativas conocidas:

| Modelo | Año | Tipo | Sondas utilizadas | Tejidos | Licencia |
|---|---|---|---|---|---|
| zhangblup | 2019 | BLUP | 319.607 | Sangre, saliva | BSD-3-Clause |
| Horvath | 2013 | Elastic net | 353 | Múltiples tejidos | No especificada |
| Hannum | 2013 | Elastic net | 71 | Sangre | No especificada |
| PhenoAge | 2018 | Elastic net | 513 | Sangre | No especificada |

Nota: los datos de Horvath, Hannum y PhenoAge provienen de conocimiento general; no se han verificado con la información proporcionada. Para una comparación rigurosa, se recomienda consultar la literatura original.

## Limitaciones y advertencias

- Modelo específico para Homo sapiens; no aplicable a otras especies sin reentrenamiento.
- Solo válido para muestras de sangre total y saliva; su rendimiento en otros tejidos puede verse degradado.
- Requiere datos de metilación de alta calidad (arrays de 450K o EPIC) con un control de calidad previo; el modelo se entrenó sobre 319.607 sondas tras filtrar las de baja calidad.
- No es un modelo causal: la edad epigenética es una correlación estadística, no implica causalidad.
- Uso exclusivamente para investigación; no está validado para diagnóstico clínico ni para uso médico sin supervisión profesional.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar adecuadamente el trabajo original.
- No se dispone de información sobre sesgos específicos del modelo (por ejemplo, en poblaciones no europeas), por lo que se recomienda precaución al aplicarlo a cohortes diversas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/zhangblup
- Paper original: Zhang, Q., Vallerga, C.L., Walker, R.M. et al. Improved precision of epigenetic clock estimates across tissues and its implication for biological ageing. Genome Medicine 11, 54 (2019). DOI: https://doi.org/10.1186/s13073-019-0667-1
- Documentación de pyaging: https://pyaging.readthedocs.io
