# pyaging/yingdamage

## Resumen

El modelo `pyaging/yingdamage` es un reloj epigenético (aging clock) desarrollado por el equipo de Ying et al. en 2024, publicado en *Nature Aging* bajo el título "Causality-enriched epigenetic age uncouples damage and adaptation". A diferencia de los relojes epigenéticos convencionales que estiman la edad biológica a partir de la metilación del ADN, este modelo se centra específicamente en los sitios CpG asociados a daño celular, ponderando su contribución mediante puntuaciones de causalidad obtenidas con *EWMR* (Epigenome-Wide Mendelian Randomization). El objetivo es separar el componente de daño del componente de adaptación en el envejecimiento, ofreciendo una métrica más precisa para estudiar procesos patológicos asociados a la edad.

El modelo está implementado como una regresión *elastic net* con penalizaciones ajustadas por los pesos de causalidad, y se distribuye a través de la librería `pyaging`, un ecosistema Python para relojes de envejecimiento. Está entrenado para tejido de sangre completa en *Homo sapiens*, utilizando datos de metilación de ADN. Su relevancia radica en que proporciona una herramienta para investigar el envejecimiento desde una perspectiva causal, con potenciales aplicaciones en epidemiología molecular y medicina preventiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net con penalización ponderada por scores de causalidad EWMR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de lenguaje) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos biológicos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo emplea una regresión *elastic net* sobre un conjunto restringido de sitios CpG asociados a daño. La selección de características se realiza mediante un análisis de causalidad *EWMR*, que identifica CpGs cuya metilación influye causalmente en fenotipos de envejecimiento. Estos sitios se ponderan en la función de pérdida según su score de causalidad, de modo que los CpGs con mayor evidencia causal tienen mayor influencia en la predicción. El entrenamiento se realizó sobre datos de metilación de sangre completa de *Homo sapiens*, aunque no se especifican en la información disponible el número exacto de muestras, el número de CpGs finales ni el procedimiento de validación. La innovación principal es la integración de información causal en la regularización, lo que permite distinguir entre daño acumulado y respuestas adaptativas del epigenoma.

## Capacidades

- Predicción de edad epigenética "dañina" (damaging epigenetic age) a partir de datos de metilación de ADN de sangre completa.
- Separación conceptual entre daño y adaptación en el proceso de envejecimiento.
- Uso integrado con la librería `pyaging` mediante una única llamada a `pya.pred.predict_age()`.
- Compatible con datos de metilación de tipo array (p. ej., Illumina 450K o EPIC) siempre que estén formateados según las convenciones de `pyaging`.
- No es un modelo generativo ni de lenguaje; no procesa texto ni imágenes.

## Casos de uso

- Investigación en biología del envejecimiento: permite cuantificar el componente de daño epigenético en cohortes de estudio, facilitando la identificación de factores que aceleran o retrasan el daño celular.
- Estudios epidemiológicos longitudinales: al aplicar el reloj a muestras de sangre de individuos seguidos en el tiempo, se puede monitorizar la progresión del daño epigenético y su asociación con enfermedades crónicas.
- Evaluación de intervenciones anti-envejecimiento: en ensayos clínicos o preclínicos, el modelo puede servir como biomarcador de eficacia para terapias dirigidas a reducir el daño molecular.
- Análisis de datos de metilación existentes: investigadores con datos de arrays de metilación pueden aplicar `yingdamage` sin necesidad de re-entrenar, gracias a la interfaz de `pyaging`.
- Medicina personalizada: la estimación de la edad epigenética dañina podría complementar otros biomarcadores para estratificar el riesgo de enfermedades relacionadas con la edad.
- Docencia y formación: como ejemplo de aplicación de métodos de regularización con ponderación causal en el campo de la epigenética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Ying et al., 2024) reporta métricas de rendimiento, pero no se incluyen en la model card ni en los datos proporcionados. Se recomienda consultar la publicación para obtener detalles sobre exactitud, correlación con edad cronológica y comparaciones con otros relojes.

## Requisitos de hardware

- Al ser un modelo de regresión lineal sobre un número limitado de CpGs (probablemente del orden de cientos), la inferencia es extremadamente ligera.
- No requiere GPU; puede ejecutarse en CPU en cuestión de milisegundos.
- Los requisitos de memoria son mínimos (menos de 100 MB de RAM), dependiendo del formato de los datos de entrada.
- La librería `pyaging` está diseñada para entornos Python estándar; no se requieren servicios de inferencia especializados como vLLM u Ollama.
- Para el preprocesado de datos de metilación (normalización, imputación) se necesitarán las herramientas habituales de bioinformática, pero no son parte del modelo.

## Comparativa con modelos similares

No se dispone de información comparativa en la model card. Existen otros relojes epigenéticos como Horvath (2013), Hannum (2013) o PhenoAge (2018), pero no se han proporcionado datos de comparación con `yingdamage`. Se recomienda consultar el artículo original para ver las comparaciones realizadas por los autores.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para sangre completa de *Homo sapiens*; su aplicación a otros tejidos o especies requiere validación adicional.
- La interpretación de la "edad epigenética dañina" debe hacerse con cautela, ya que el concepto de daño vs. adaptación es una construcción estadística basada en causalidad inferida, no en mecanismos biológicos directamente observados.
- La dependencia de los scores de causalidad EWMR puede introducir sesgos si los estudios de MR subyacentes tienen limitaciones (p. ej., pleiotropía, tamaño muestral).
- No se especifican los intervalos de confianza ni la incertidumbre de las predicciones; para uso clínico se requeriría una validación independiente.
- La licencia BSD-3-Clause permite uso comercial y modificación, pero el modelo debe citarse adecuadamente según la política de los autores.
- No se proporcionan pesos pre-entrenados descargables de forma independiente; el acceso se realiza a través de la librería `pyaging`, lo que implica una dependencia de su mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/yingdamage
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original: Ying, K., Liu, H., Tarkhov, A.E. et al. Causality-enriched epigenetic age uncouples damage and adaptation. *Nature Aging* 4, 231–246 (2024). DOI: https://doi.org/10.1038/s43587-023-00557-0
