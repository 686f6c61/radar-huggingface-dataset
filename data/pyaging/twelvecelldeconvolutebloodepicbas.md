# pyaging/twelvecelldeconvolutebloodepicbas

## Resumen

`pyaging/twelvecelldeconvolutebloodepicbas` es un modelo de deconvolución celular restringida basada en referencia, diseñado para estimar la proporción de basófilos en sangre periférica a partir de datos de metilación de ADN obtenidos con arrays EPIC (Illumina). Lo desarrolla el ecosistema `pyaging`, una librería especializada en relojes epigenéticos y análisis de metilación. El modelo se publica bajo licencia BSD-3-Clause y está pensado para investigación biomédica, especialmente en el campo del envejecimiento y el inmunoperfilado.

A diferencia de la librería publicada de 1.200 CpGs (IDOL-Ext), este modelo utiliza una selección de 240 CpGs heredada de Biolearn, cuyas filas contienen 10 contrastes positivos y 10 negativos máximos de metilación entre cada tipo celular y el resto. Esta selección no es un subconjunto de los 1.200 probadores publicados, lo que introduce una variante metodológica relevante. El modelo predice exclusivamente la proporción de basófilos y se integra en el catálogo de relojes de `pyaging`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deconvolución restringida basada en referencia (reference-based constrained deconvolution) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, modelo no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolución celular restringida basada en referencia, un enfoque estadístico que estima la proporción de tipos celulares a partir de la señal de metilación en CpGs específicos. La referencia utilizada consiste en 240 CpGs seleccionados según contrastes máximos entre cada tipo celular y el resto (10 positivos y 10 negativos por subtipo). Esta selección proviene de Biolearn y no coincide con la librería publicada de 1.200 CpGs del estudio IDOL-Ext.

Los datos de entrenamiento provienen de muestras de leucocitos purificados de sangre periférica humana, con perfiles de metilación obtenidos mediante arrays EPIC. El modelo fue desarrollado en 2022 y se basa en la metodología descrita en Salas et al. (2022), aunque con la variante de los 240 CpGs. No se dispone de información pública sobre el proceso exacto de entrenamiento, hiperparámetros o validación interna.

## Capacidades

- Predicción de la proporción de basófilos en sangre periférica a partir de datos de metilación de ADN (arrays EPIC).
- Integración directa con la librería `pyaging` mediante la función `predict_age` (aunque el nombre sugiere edad, en este caso devuelve proporción celular).
- Diseñado para análisis de inmunoperfilado de alta resolución en estudios de envejecimiento y enfermedades relacionadas.
- Compatible con datos de metilación de Homo sapiens, específicamente de sangre periférica.

## Casos de uso

- Investigación en envejecimiento: estimar la proporción de basófilos en cohortes de edad avanzada para correlacionar cambios inmunológicos con biomarcadores epigenéticos.
- Estudios de inmunosenescencia: monitorizar variaciones en la fracción de basófilos como indicador de alteraciones del sistema inmune.
- Validación de otros modelos de deconvolución: comparar las estimaciones de este modelo con las de métodos basados en la librería IDOL-Ext de 1.200 CpGs.
- Análisis de datos de metilación existentes: aplicar el modelo a conjuntos de datos públicos (GEO, TCGA) para obtener proporciones celulares sin necesidad de nuevos experimentos.
- Control de calidad en estudios epigenéticos: detectar posibles contaminaciones o variaciones en la composición celular de muestras de sangre.
- Desarrollo de relojes epigenéticos: incorporar la proporción de basófilos como covariable en modelos de predicción de edad biológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas de rendimiento como correlación con proporciones reales, error absoluto medio o comparaciones con otros métodos de deconvolución.

## Requisitos de hardware

- Al ser un modelo de deconvolución basado en regresión lineal o similar, no requiere GPU. Se ejecuta eficientemente en CPU.
- Memoria RAM: típicamente inferior a 1 GB, ya que el modelo se reduce a una matriz de coeficientes para 240 CpGs.
- Compatible con cualquier entorno Python que soporte `pyaging` y sus dependencias (numpy, pandas, etc.).
- No se requieren opciones de despliegue especializadas como vLLM u Ollama; se usa directamente como función de librería.

## Comparativa con modelos similares

| Modelo | Método | CpGs | Predicción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `twelvecelldeconvolutebloodepicbas` | Deconvolución restringida | 240 (no publicados) | Proporción de basófilos | BSD-3-Clause | HuggingFace / pyaging |
| IDOL-Ext (Salas et al., 2022) | Deconvolución restringida | 1.200 | Proporciones de 12 tipos celulares | No especificada | Publicado en el paper |
| CIBERSORT | Deconvolución basada en soporte vectorial | Variable | Proporciones de múltiples tipos | Académica | Sitio web dedicado |

No se dispone de comparaciones cuantitativas directas entre estos métodos en la información proporcionada.

## Limitaciones y advertencias

- La selección de 240 CpGs no está documentada públicamente en detalle, lo que dificulta la reproducibilidad y la interpretación biológica de los resultados.
- El modelo predice únicamente la proporción de basófilos; no proporciona estimaciones para otros tipos celulares.
- No se han publicado métricas de validación externa ni estudios de robustez frente a variaciones en la preparación de muestras o en el tipo de array (EPIC vs. 450K).
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utilizan en aplicaciones clínicas.
- Al ser un modelo específico para sangre periférica, no es aplicable a otros tejidos sin recalibración.
- La integración con `pyaging` puede requerir una versión específica de la librería; se debe consultar la documentación para evitar incompatibilidades.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/pyaging/twelvecelldeconvolutebloodepicbas)
- [Documentación de pyaging](https://pyaging.readthedocs.io)
- [Publicación original: Salas et al., 2022, Nature Communications](https://doi.org/10.1038/s41467-021-27864-7)
