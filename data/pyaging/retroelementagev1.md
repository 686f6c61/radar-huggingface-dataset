# pyaging/retroelementagev1

## Resumen

`retroelementagev1` es un reloj epigenético de envejecimiento desarrollado por el grupo de Lishomwa C. Ndhlovu y publicado en *Aging Cell* en 2024. A diferencia de los relojes de metilación clásicos (como Horvath o Hannum), este modelo se centra exclusivamente en la metilación de ADN de retroelementos, concretamente en CpGs anotados a elementos HERV (retrovirus endógenos humanos) y elementos LINE activos. El modelo predice la edad cronológica en sangre completa humana a partir de datos de metilación obtenidos con el array EPIC v1.0.

Técnicamente, se trata de una regresión *elastic net* entrenada con validación cruzada de 10 pliegues, lo que lo convierte en un modelo estadístico ligero y fácilmente interpretable, no en una red neuronal. Su relevancia radica en que ofrece una perspectiva distinta del envejecimiento biológico: los retroelementos son secuencias repetitivas que se activan con la edad y su estado de metilación puede servir como biomarcador único. Está disponible bajo licencia BSD-3-Clause y se integra en la librería `pyaging`, lo que facilita su uso en pipelines de análisis de datos ómicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión *elastic net* (modelo lineal regularizado) |
| Parametros totales | no disponible (número de CpGs seleccionados no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo no secuencial) |
| Tipos de cuantizacion | no aplica (modelo estadístico, no neuronal) |
| Idiomas soportados | no aplica (entrada: matriz de metilación) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente coeficientes en archivo de texto o pickle, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo es una regresión *elastic net*, una combinación de regularización L1 y L2 sobre un modelo lineal. Se entrena sobre los valores de metilación (betas) de un subconjunto de CpGs del array EPIC v1.0 que están anotados a retroelementos (HERV y elementos LINE activos). El entrenamiento se realizó con validación cruzada de 10 pliegues, lo que permite seleccionar el hiperparámetro de regularización y estimar el error de generalización. No se dispone de información sobre el número de muestras utilizadas, el número exacto de CpGs seleccionados ni el procedimiento de preprocesamiento de los datos de metilación. La predicción es la edad cronológica, expresada en años.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN de sangre completa humana.
- Específicamente diseñado para capturar la señal de envejecimiento en retroelementos (HERV y LINE), complementando a los relojes basados en genes codificantes.
- Salida numérica continua (edad en años), interpretable como biomarcador de envejecimiento.
- Integración sencilla con la librería `pyaging` mediante la función `pya.pred.predict_age`.
- No requiere GPU ni hardware especializado; puede ejecutarse en CPU con una matriz de metilación como entrada.

## Casos de uso

- Investigación biomédica sobre envejecimiento: el modelo permite estudiar la contribución de los retroelementos al envejecimiento biológico en cohortes de sangre completa, complementando relojes clásicos.
- Validación de intervenciones antienvejecimiento: se puede usar para medir cambios en la edad epigenética tras tratamientos (fármacos, cambios de estilo de vida) en estudios longitudinales.
- Análisis de datos de metilación existentes: al estar diseñado para EPIC v1.0, puede aplicarse a conjuntos de datos públicos (GEO, TCGA) para reanalizar la edad biológica desde una perspectiva de retroelementos.
- Estudios de asociación entre envejecimiento y enfermedades relacionadas con la edad: el reloj puede correlacionarse con fenotipos clínicos en biobancos.
- Control de calidad en estudios epigenéticos: la predicción de edad puede usarse para verificar la integridad de las muestras (por ejemplo, detectar errores de etiquetado de edad).
- Docencia y divulgación: como ejemplo de aplicación de regresión regularizada en datos ómicos, sirve para ilustrar la construcción de relojes epigenéticos en cursos de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Ndhlovu et al., 2024) reporta métricas de rendimiento (como correlación con la edad cronológica y error absoluto medio), pero no se incluyen en la model card de HuggingFace. No se pueden presentar cifras sin riesgo de inventar datos.

## Requisitos de hardware

- Modelo extremadamente ligero: al ser una regresión lineal, solo necesita almacenar los coeficientes de las CpGs seleccionadas (probablemente del orden de cientos o miles de valores).
- Inferencia en CPU: cualquier ordenador moderno puede ejecutar la predicción en milisegundos.
- Sin necesidad de GPU ni memoria VRAM.
- Despliegue: se integra en `pyaging` (Python), por lo que basta con un entorno Python con las dependencias de la librería. No requiere servidores de inferencia como vLLM o llama.cpp.
- Latencia: despreciable; el coste principal es el preprocesamiento de los datos de metilación (normalización, filtrado de CpGs), que depende del pipeline del usuario.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros relojes epigenéticos en la información proporcionada. Como referencia conceptual, existen otros relojes de metilación como el reloj de Horvath (multitejido), el de Hannum (sangre) o PhenoAge, pero no se han encontrado datos comparativos específicos de `retroelementagev1` frente a ellos. La diferencia clave es que este modelo se centra exclusivamente en retroelementos, mientras que los clásicos usan CpGs de todo el genoma. No se puede afirmar cuál es más preciso sin datos.

## Limitaciones y advertencias

- Específico de tejido: solo está entrenado para sangre completa; su aplicación a otros tejidos puede producir predicciones inexactas.
- Dependiente de la plataforma: requiere datos de metilación del array EPIC v1.0; no es directamente aplicable a otros arrays (450K, etc.) sin reentrenamiento o adaptación.
- Alcance limitado: predice edad cronológica, no edad biológica per se, aunque se use como proxy de envejecimiento.
- Sin información sobre el rendimiento en poblaciones diversas: no se indica si el entrenamiento incluyó múltiples etnias o rangos de edad amplios, lo que puede introducir sesgos.
- Riesgo de sobreajuste: al ser un modelo lineal con regularización, es robusto, pero la validación cruzada interna no garantiza generalización a cohortes externas.
- Licencia BSD-3-Clause permite uso comercial, pero se recomienda citar el artículo original en publicaciones.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/retroelementagev1
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original: Ndhlovu, Lishomwa C., et al. "Retro-age: A unique epigenetic biomarker of aging captured by DNA methylation states of retroelements." Aging Cell 23 (2024): e14288. DOI: https://doi.org/10.1111/acel.14288
