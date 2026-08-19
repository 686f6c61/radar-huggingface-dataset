# pyaging/twelvecelldeconvolutebloodepiccd8nv

## Resumen

`twelvecelldeconvolutebloodepiccd8nv` es un modelo de deconvolución basada en referencias y con restricciones, desarrollado por el proyecto pyaging, que estima la proporción de células T CD8+ naive (naive CD8+ T cells) a partir de datos de metilación de ADN obtenidos con arrays EPIC en sangre periférica humana. A diferencia de los modelos de lenguaje, no genera texto ni razona: es un modelo estadístico de biología computacional que resuelve el problema de inferir la composición celular de una muestra de sangre a partir de su perfil de metilación, una tarea clave en inmunología y estudios de envejecimiento.

El modelo se publica bajo licencia BSD-3-Clause y se integra en la librería `pyaging` para su uso directo. Según la descripción del autor, emplea un conjunto de 240 CpGs (en lugar de los 1.200 del IDOL-Ext publicado) seleccionados para maximizar los contrastes de metilación entre tipos celulares, y no es un subconjunto de las sondas originales. Está diseñado específicamente para sangre periférica y para la estimación de la fracción de células T CD8+ naive, un subtipo relevante en inmunosenescencia y relojes epigenéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deconvolución basada en referencias con restricciones (constrained deconvolution) |
| Parametros totales | no disponible (modelo estadístico, no neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo realiza una deconvolución basada en referencias: dado un perfil de metilación de una muestra, estima la proporción de un tipo celular concreto (células T CD8+ naive) mediante una regresión restringida sobre una matriz de referencia de perfiles de metilación específicos de cada tipo celular. La referencia utilizada se deriva del trabajo de Salas et al. (2022), que publicó un panel de 1.200 CpGs optimizado para la recuperación de proporciones celulares en mezclas artificiales. Sin embargo, este modelo en particular hereda de Biolearn una versión alternativa no documentada de 240 CpGs, cuyas filas presentan 10 contrastes positivos y 10 negativos de metilación máxima entre cada tipo celular y el resto, y que no es un subconjunto de las 1.200 sondas publicadas.

No se dispone de detalles sobre el proceso de entrenamiento (número de muestras, algoritmo de optimización, validación) más allá de la descripción de la selección de CpGs. El modelo está pensado para datos de arrays EPIC (Illumina MethylationEPIC) y para sangre periférica purificada de leucocitos.

## Capacidades

- Estimación de la proporción de células T CD8+ naive a partir de datos de metilación de ADN (arrays EPIC).
- Deconvolución con restricciones, lo que garantiza que las proporciones estimadas sean no negativas y sumen 1 (si se combina con otros modelos del mismo catálogo).
- Integración directa con `pyaging` mediante la función `predict_age` (aunque el modelo no predice edad, sino proporción celular).
- Compatible con el flujo de trabajo de relojes epigenéticos y análisis de composición inmune en sangre.

## Casos de uso

- Investigación en inmunosenescencia: estimar la fracción de células T CD8+ naive en muestras de sangre de individuos de distintas edades para estudiar el declive inmunológico asociado al envejecimiento.
- Estudios de metilación de ADN: ajustar por composición celular en análisis de asociación entre metilación y fenotipos, ya que la variación en la mezcla celular puede confundir los resultados.
- Validación de biomarcadores epigenéticos: usar la proporción de células T CD8+ naive como covariable o variable de interés en modelos de riesgo de enfermedades relacionadas con la inmunidad.
- Análisis de datos de biobancos: procesar grandes cohortes con datos de metilación para caracterizar el perfil inmune periférico sin necesidad de citometría de flujo.
- Desarrollo de relojes epigenéticos de tejido sanguíneo: incorporar la estimación de subtipos celulares como entrada en modelos de predicción de edad biológica.
- Control de calidad en experimentos de metilación: detectar desviaciones inesperadas en la composición celular que puedan indicar problemas de muestreo o procesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (como correlación con citometría de flujo, error absoluto medio, etc.) ni comparaciones con otros métodos de deconvolución.

## Requisitos de hardware

- Al ser un modelo estadístico de deconvolución, no requiere GPU ni hardware especializado; puede ejecutarse en CPU con unos pocos cientos de megabytes de RAM.
- El coste computacional es bajo: la deconvolución se resuelve mediante optimización convexa sobre matrices pequeñas (240 CpGs × número de tipos celulares).
- Se integra en `pyaging`, que a su vez depende de `scanpy` y `anndata`; el despliegue típico es en entornos Python con Jupyter o scripts de análisis.
- No aplican opciones como vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el mismo repositorio o en la literatura citada. Otros métodos de deconvolución de metilación incluyen IDOL-Ext (Salas et al., 2022) y algoritmos como CIBERSORT o EpiDISH, pero no se proporcionan datos cuantitativos de comparación en la model card.

| Modelo | Tipo | Referencia | Proporción estimada | Disponibilidad |
|---|---|---|---|---|
| twelvecelldeconvolutebloodepiccd8nv | Deconvolución restringida | pyaging / Biolearn | Células T CD8+ naive | BSD-3-Clause |
| IDOL-Ext (Salas et al.) | Deconvolución restringida | Salas et al. 2022 | 12 tipos celulares | Publicado, no en HF |
| EpiDISH | Deconvolución | Teschendorff et al. | Múltiples tejidos | Código abierto |

## Limitaciones y advertencias

- El modelo está específicamente entrenado para sangre periférica y para el subtipo de células T CD8+ naive; no debe aplicarse a otros tejidos ni a otros tipos celulares sin validación.
- La selección de 240 CpGs no está documentada en la publicación original (Salas et al. usan 1.200), por lo que su reproducibilidad y robustez fuera de los datos de Biolearn es incierta.
- No se proporcionan métricas de rendimiento ni estudios de validación independientes; se recomienda evaluar el modelo en los propios datos antes de usarlo en producción.
- La licencia BSD-3-Clause permite uso comercial, pero la ausencia de documentación detallada del modelo puede dificultar su auditoría.
- El modelo asume que la mezcla celular es linealmente aditiva en la metilación, lo que puede no cumplirse en ciertos estados patológicos o muestras degradadas.
- No hay información sobre sesgos poblacionales (edad, sexo, etnia) ni sobre el rango de proporciones válido; la extrapolación fuera del rango de entrenamiento podría dar resultados poco fiables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepiccd8nv
- Catálogo de relojes pyaging: https://pyaging.readthedocs.io
- Publicación original (Salas et al., 2022): https://doi.org/10.1038/s41467-021-27864-7
