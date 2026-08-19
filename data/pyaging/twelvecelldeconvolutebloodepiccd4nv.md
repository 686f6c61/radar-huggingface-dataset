# pyaging/twelvecelldeconvolutebloodepiccd4nv

## Resumen

El modelo `twelvecelldeconvolutebloodepiccd4nv`, desarrollado por el autor `pyaging`, es un modelo de deconvolución basada en referencia para estimar la proporción de células T CD4+ naive en sangre periférica a partir de datos de metilación de ADN obtenidos con el array EPIC (Illumina MethylationEPIC). Se integra en la librería `pyaging`, especializada en relojes de envejecimiento y análisis de metilación. Este modelo resuelve un problema concreto en inmunología computacional: cuantificar subtipos celulares a partir de datos de metilación sin necesidad de citometría de flujo, lo que permite reutilizar datasets epigenéticos existentes.

El modelo se basa en el método publicado por Salas et al. (2022) en *Nature Communications*, que originalmente utilizaba una selección de 1.200 CpGs para la deconvolución de células inmunitarias. Sin embargo, `pyaging` incorpora una variante con 240 CpGs (procedente de Biolearn) que no es un subconjunto de los 1.200 publicados, sino una selección propia con 10 contrastes positivos y 10 negativos por subtipo celular. Esta diferencia es relevante para la reproducibilidad y la interpretación de los resultados. El modelo está diseñado exclusivamente para tejido sanguíneo y para el array EPIC, y su salida es una proporción (valor entre 0 y 1) de células T CD4+ naive.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deconvolución basada en referencia con regresión restringida (constrained) |
| Parametros totales | No disponible (modelo estadístico, no red neuronal) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (datos numéricos de metilación) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en librería pyaging) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolución basada en referencia, un enfoque clásico en epigenética computacional. Consiste en una matriz de referencia que contiene los perfiles de metilación promedio de distintos tipos celulares (en este caso, células T CD4+ naive y otros subtipos). Dado un perfil de metilación de una muestra de sangre, se estima la proporción de cada tipo celular resolviendo un problema de regresión restringida (por ejemplo, mínimos cuadrados con restricciones de no negatividad y suma a 1). La versión publicada por Salas et al. utilizaba 1.200 CpGs seleccionadas mediante un algoritmo de optimización (IDOL). La implementación de `pyaging` emplea una selección de 240 CpGs heredada de Biolearn, cuyos detalles de selección no están documentados en la model card. El modelo fue desarrollado en 2022 y se entrena (o ajusta) sobre datos de metilación de sangre purificada de leucocitos, pero no se especifican los conjuntos de datos exactos ni el procedimiento de validación.

## Capacidades

- Estima la proporción de células T CD4+ naive en muestras de sangre periférica a partir de datos de metilación del array EPIC.
- Funciona como un componente de `pyaging`, permitiendo integrar la deconvolución en pipelines de análisis de envejecimiento y metilación.
- Proporciona una salida numérica continua (proporción) que puede usarse como variable en estudios de asociación o como entrada en relojes epigenéticos.
- Es específico para Homo sapiens y para tejido de sangre (leucocitos purificados).
- No requiere datos de expresión génica ni otros tipos de datos ómicos, solo la matriz de metilación.

## Casos de uso

- **Investigación en inmunología del envejecimiento**: estimar el porcentaje de células T CD4+ naive en cohortes de personas mayores para estudiar la relación entre inmunosenescencia y edad biológica.
- **Análisis de composición celular en biobancos**: reutilizar datos de metilación existentes (por ejemplo, de estudios de asociación de todo el epigenoma) para inferir la fracción de células T CD4+ naive sin realizar nuevos experimentos de citometría.
- **Control de calidad en estudios epigenéticos**: verificar si las proporciones celulares estimadas son consistentes con las esperadas en un tipo de muestra (por ejemplo, sangre completa vs. fracciones enriquecidas).
- **Estudios de respuesta inmune**: correlacionar la proporción de células T CD4+ naive con variables clínicas o de exposición en cohortes de pacientes.
- **Integración en relojes de envejecimiento**: usar la proporción celular como covariable o como componente en modelos de predicción de edad epigenética.
- **Validación de métodos de deconvolución**: comparar los resultados de este modelo con los de otras herramientas (p.ej., EpiDISH, CIBERSORT) en datasets de referencia con proporciones conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, correlación con citometría de flujo ni comparaciones con otros métodos de deconvolución. Se recomienda consultar el artículo original de Salas et al. (2022) para conocer la validación del enfoque con 1.200 CpGs, aunque la implementación de 240 CpGs de `pyaging` no ha sido evaluada públicamente en los documentos proporcionados.

## Requisitos de hardware

- **VRAM estimada**: No requiere GPU; el modelo es un conjunto de coeficientes y operaciones matriciales de bajo coste.
- **GPU recomendadas**: No aplica. Funciona correctamente en CPU.
- **Compatibilidad con hardware de consumo**: Sí, cualquier ordenador con Python y las dependencias de `pyaging` puede ejecutarlo.
- **Opciones de despliegue**: Se integra en la librería `pyaging` (pip install pyaging). No requiere servidores de inferencia ni herramientas como vLLM o llama.cpp.
- **Latencia y throughput**: No se han publicado datos, pero al ser una operación de regresión lineal con 240 CpGs, la inferencia es prácticamente instantánea (del orden de milisegundos) en una CPU moderna.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa con otros métodos de deconvolución en la información proporcionada. A continuación se presenta una comparación conceptual con dos alternativas comunes:

| Modelo/Método | Tipo | CpGs utilizados | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `twelvecelldeconvolutebloodepiccd4nv` (pyaging) | Deconvolución restringida | 240 (no documentado) | Sangre (EPIC) | BSD-3-Clause | Librería pyaging |
| EpiDISH (Teschendorff et al.) | Deconvolución robusta | Variable (según referencia) | Sangre, tejidos | GPL-3.0 | Paquete R/Bioconductor |
| CIBERSORT (Newman et al.) | Deconvolución por soporte vectorial | Variable (según firma) | Sangre, tumores | Académica (registro) | Web/standalone |

La principal diferencia es que `pyaging` está integrado en un ecosistema de relojes de envejecimiento y es de código abierto con licencia permisiva, mientras que EpiDISH y CIBERSORT son herramientas independientes con distintos enfoques de optimización. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Selección de CpGs no documentada**: la model card indica que la librería de 240 CpGs es una "reemplazo no documentado" de Biolearn, lo que dificulta la reproducibilidad y la interpretación biológica de los resultados.
- **Especificidad de tejido y plataforma**: el modelo solo es válido para sangre periférica y para datos generados con el array EPIC. No debe aplicarse a otros tejidos ni a plataformas como 450K o bisulfito-seq.
- **Dependencia de la calidad de la referencia**: la precisión de la deconvolución depende de que la matriz de referencia sea representativa de la población estudiada; variaciones étnicas o de preparación de muestras pueden introducir sesgos.
- **Riesgo de sobreajuste**: al ser una selección reducida de CpGs, podría no capturar toda la variabilidad biológica, especialmente en condiciones patológicas.
- **Sin validación independiente**: no se han publicado evaluaciones externas de esta implementación concreta, por lo que su rendimiento en la práctica es incierto.
- **Licencia**: aunque la licencia BSD-3-Clause permite uso comercial, se recomienda revisar los términos de la librería `pyaging` y las dependencias (Biolearn) para evitar conflictos.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/pyaging/twelvecelldeconvolutebloodepiccd4nv](https://huggingface.co/pyaging/twelvecelldeconvolutebloodepiccd4nv)
- Artículo original de Salas et al. (2022): [https://doi.org/10.1038/s41467-021-27864-7](https://doi.org/10.1038/s41467-021-27864-7)
- Documentación de pyaging (Clock Catalogue): [https://pyaging.readthedocs.io](https://pyaging.readthedocs.io)
