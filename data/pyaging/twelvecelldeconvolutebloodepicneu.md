# pyaging/twelvecelldeconvolutebloodepicneu

## Resumen

El modelo `twelvecelldeconvolutebloodepicneu`, publicado por el usuario `pyaging`, es un modelo de deconvolución celular basado en metilación de ADN, diseñado para estimar la proporción de neutrófilos en sangre periférica a partir de datos de microarrays EPIC (Illumina MethylationEPIC). Se trata de una herramienta de biología computacional, no de un modelo de lenguaje, y se integra en la librería `pyaging`, un catálogo de relojes de envejecimiento y modelos de deconvolución celular.

El modelo resuelve un problema clásico en epigenética: a partir de la metilación de ADN de una muestra de sangre, inferir la composición celular (en este caso, la fracción de neutrófilos) sin necesidad de citometría de flujo. La relevancia actual radica en su uso en estudios de envejecimiento, inmunología y biomedicina, donde la proporción de células inmunitarias es un biomarcador clave. A diferencia del método publicado IDOL-Ext, que usa 1.200 CpGs, este modelo emplea una selección de 240 CpGs heredada de la librería Biolearn, con contrastes de metilación específicos para cada subtipo celular.

El modelo está pensado para ser usado con la función `pya.pred.predict_age` de `pyaging`, y su licencia es BSD-3-Clause, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deconvolución celular basada en referencia con restricción de no negatividad (constrained deconvolution) |
| Parametros totales | No aplica (modelo estadístico con 240 CpGs seleccionados) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entrada: vector de metilación de 240 CpGs) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en la librería `pyaging` como objeto Python) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolución celular basada en referencia, un método matemático que estima las proporciones de tipos celulares a partir de un perfil de metilación observado, utilizando una matriz de referencia de perfiles de metilación específicos de cada tipo celular. La técnica emplea una regresión restringida (constrained least squares) que impone que las proporciones sean no negativas y sumen 1. El modelo concreto aquí usa una selección de 240 CpGs, heredada de la librería Biolearn, que no es un subconjunto de los 1.200 CpGs del método IDOL-Ext publicado por Salas et al. (2022). Según la descripción, estos 240 CpGs se eligieron para maximizar los contrastes de metilación entre cada tipo celular y el resto, con 10 CpGs positivos y 10 negativos por subtipo.

No se dispone de detalles sobre el conjunto de entrenamiento exacto, el número de muestras ni el procedimiento de validación, más allá de que se basa en el artículo de Salas et al. (2022), que describe el desarrollo de IDOL-Ext. El modelo está diseñado para datos de microarrays EPIC y para sangre periférica purificada (leucocitos). No se menciona el uso de RLHF, DPO u otras técnicas de ajuste, ya que no es un modelo generativo.

## Capacidades

- Predicción de la proporción de neutrófilos en sangre periférica a partir de datos de metilación de ADN (microarrays EPIC).
- Integración con la librería `pyaging` para el cálculo de relojes de envejecimiento y otros biomarcadores epigenéticos.
- Funciona como un componente en pipelines de análisis de metilación, permitiendo ajustar por composición celular en estudios de asociación.
- No es un modelo de lenguaje: no genera texto, código ni realiza razonamiento simbólico.
- No soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Investigación en envejecimiento: ajustar la proporción de neutrófilos en estudios de relojes epigenéticos para aislar el efecto de la edad biológica de la composición inmune.
- Estudios de inmunología clínica: estimar la fracción de neutrófilos en muestras de sangre de pacientes sin necesidad de citometría de flujo, reduciendo costes y tiempo.
- Control de calidad en biobancos: verificar la integridad de muestras de ADN metilado comprobando que las proporciones celulares estimadas son plausibles.
- Análisis de datos de microarrays EPIC en estudios de cohortes: corregir por heterogeneidad celular en análisis diferenciales de metilación.
- Desarrollo de biomarcadores: combinar la proporción de neutrófilos con otras variables clínicas para predecir riesgo de enfermedades inflamatorias o infecciosas.
- Educación y formación en epigenética computacional: como ejemplo práctico de deconvolución celular en la librería `pyaging`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de referencia (Salas et al., 2022) describe la validación del método IDOL-Ext con 1.200 CpGs, pero este modelo usa una selección diferente de 240 CpGs y no se aportan métricas específicas (correlación, error absoluto medio, etc.) en la model card.

## Requisitos de hardware

- El modelo es extremadamente ligero: solo requiere una matriz de 240 CpGs y una regresión lineal restringida, por lo que se ejecuta en CPU sin necesidad de GPU.
- Memoria RAM mínima: menos de 1 GB para la inferencia de una muestra.
- GPU recomendada: ninguna.
- Compatible con cualquier ordenador portátil o servidor estándar.
- Despliegue: se usa como función de Python dentro de la librería `pyaging`. No se proporcionan contenedores ni servicios de inferencia específicos.

## Comparativa con modelos similares

| Modelo | Tipo | CpGs | Método | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `twelvecelldeconvolutebloodepicneu` (pyaging) | Deconvolución basada en referencia | 240 | Constrained least squares | BSD-3-Clause | HuggingFace / pyaging |
| IDOL-Ext (Salas et al., 2022) | Deconvolución basada en referencia | 1.200 | Constrained least squares | No especificada | Código del artículo |
| CIBERSORTx | Deconvolución basada en firma | Variable (depende del set) | Support vector regression | No libre para uso comercial | Plataforma web |

Nota: la comparación se basa en características generales; no se dispone de datos de rendimiento directos para este modelo concreto.

## Limitaciones y advertencias

- El modelo está validado únicamente para sangre periférica (leucocitos purificados) y datos de microarrays EPIC. Su aplicación a otros tejidos o tecnologías (por ejemplo, secuenciación de metilación) no está garantizada.
- La selección de 240 CpGs no es un subconjunto de los 1.200 CpGs publicados por Salas et al., lo que puede implicar diferencias en la reproducibilidad entre laboratorios y plataformas.
- No se han publicado métricas de rendimiento (correlación, error, sesgo) para este modelo específico, por lo que su precisión clínica es incierta.
- La deconvolución asume que la matriz de referencia es representativa de la población estudiada; puede haber sesgos en poblaciones no europeas o con condiciones patológicas que alteren la metilación.
- La licencia BSD-3-Clause permite uso comercial, pero exige mantener el aviso de copyright y no usar los nombres de los contribuyentes para promocionar productos derivados sin permiso.
- El modelo no es un reloj de envejecimiento en sí mismo; solo estima la proporción de neutrófilos. Debe usarse como componente en pipelines más amplios.

## Enlaces

- [HuggingFace - pyaging/twelvecelldeconvolutebloodepicneu](https://huggingface.co/pyaging/twelvecelldeconvolutebloodepicneu)
- [Documentación de pyaging (Clock Catalogue)](https://pyaging.readthedocs.io)
- [Artículo original: Salas et al., Nature Communications 13, 761 (2022)](https://doi.org/10.1038/s41467-021-27864-7)
