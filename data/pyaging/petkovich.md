# pyaging/petkovich

## Resumen

El modelo `petkovich` es un reloj epigenético de envejecimiento (aging clock) desarrollado por Daniel A. Petkovich y colaboradores en 2017, y publicado en *Cell Metabolism*. Se trata de un modelo de regresión de elastic net que estima la edad cronológica de ratones (*Mus musculus*) a partir de perfiles de metilación de ADN obtenidos mediante secuenciación de bisulfito reducida (RRBS) en sangre total. El reloj fue validado demostrando que su predicción de edad biológica se ralentiza en intervenciones que extienden la vida, como la restricción calórica y el enanismo.

A diferencia de los modelos de lenguaje de gran escala, este no es un transformer ni un modelo generativo: es un modelo estadístico clásico de aprendizaje supervisado que asigna pesos a sitios CpG específicos del genoma para predecir la edad. Su relevancia actual reside en su uso dentro de la librería `pyaging`, que integra múltiples relojes de envejecimiento para análisis biológicos en investigación de longevidad. El repositorio en HuggingFace actúa como un paquete de distribución del modelo entrenado, listo para ser utilizado con la API de `pyaging`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion de elastic net (penalizacion L1+L2) |
| Parametros totales | No disponible (modelo de regresion con coeficientes para CpGs seleccionados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (pesos en punto flotante estandar) |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en la libreria pyaging, probablemente archivos binarios o pickle) |

## Arquitectura y entrenamiento

El modelo se basa en una regresión de elastic net, que combina las penalizaciones L1 (lasso) y L2 (ridge) para seleccionar un subconjunto de sitios CpG relevantes y regularizar los coeficientes. El entrenamiento se realizó sobre datos de metilación de ADN de sangre completa de ratones, obtenidos mediante reducción representativa de secuenciación con bisulfito (RRBS). La variable objetivo es la edad cronológica del animal en el momento del muestreo.

El proceso de entrenamiento implicó la selección de características (CpGs) mediante validación cruzada y la optimización del hiperparámetro de mezcla entre L1 y L2. El modelo resultante produce una predicción de edad biológica que correlaciona con la edad real y que responde a intervenciones de longevidad, como se demostró en el estudio original. No se dispone de detalles adicionales sobre el número de CpGs seleccionados ni sobre el tamaño del conjunto de entrenamiento en la información proporcionada.

## Capacidades

- Predicción de edad cronológica en ratones a partir de perfiles de metilación de ADN en sangre total.
- Estimación de edad biológica, útil como biomarcador de envejecimiento.
- Sensibilidad a intervenciones que alteran la velocidad de envejecimiento (restricción calórica, enanismo).
- Integración con la librería `pyaging` para análisis de múltiples relojes simultáneamente.
- No es un modelo generativo ni de lenguaje; no admite entrada de texto ni genera contenido.

## Casos de uso

- Investigación en biología del envejecimiento: permite cuantificar el efecto de fármacos, dietas o manipulaciones genéticas sobre la edad biológica en modelos murinos, comparando la edad epigenética predicha frente a la edad cronológica.
- Evaluación de intervenciones de longevidad: en estudios preclínicos, se puede usar para medir si una intervención (p. ej., metformina, rapamicina) ralentiza el reloj epigenético en sangre de ratón.
- Control de calidad en estudios de metilación: sirve como referencia para validar la calidad de los datos de RRBS, comprobando que las predicciones de edad se comportan de manera esperada en muestras control.
- Desarrollo de biomarcadores traslacionales: aunque está entrenado en ratón, su metodología sirve como plantilla para construir relojes similares en otras especies, y su uso en investigación básica informa el diseño de estudios en humanos.
- Análisis de datos de secuenciación en laboratorios de genómica: integrado en pipelines de `pyaging`, permite procesar matrices de metilación y obtener predicciones de edad sin necesidad de implementar el modelo desde cero.
- Docencia y formación: útil como ejemplo práctico de regresión penalizada aplicada a datos ómicos, mostrando cómo se construye y evalúa un biomarcador predictivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original de Petkovich et al. (2017) reporta métricas de error (como el error absoluto medio entre edad predicha y cronológica) y la correlación con intervenciones de longevidad, pero estos datos no se incluyen en la model card de HuggingFace. Se recomienda consultar la publicación original para obtener valores cuantitativos.

## Requisitos de hardware

- Al ser un modelo de regresión lineal con un número reducido de coeficientes, no requiere GPU. La inferencia se ejecuta en CPU en cuestión de milisegundos.
- Memoria RAM: menos de 100 MB para cargar el modelo y los datos de entrada típicos (una matriz de metilación de cientos de muestras).
- No se requieren GPUs específicas (A100, H100, etc.) ni hardware especializado.
- El despliegue se realiza mediante la librería `pyaging`, que gestiona la carga del modelo y la predicción. No es compatible con frameworks como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

Existen otros relojes epigenéticos para ratón y humano, como el reloj de Horvath (2013) para múltiples tejidos humanos, el reloj de Hannum (2013) para sangre humana, y el reloj de Stubbs (2017) para ratón. Sin embargo, no se dispone de una comparativa cuantitativa con estos modelos en la información proporcionada. Las diferencias principales radican en la especie, el tejido, el tipo de datos de metilación (arrays de Illumina vs. RRBS) y el método de regresión. El modelo `petkovich` se distingue por estar específicamente entrenado en sangre de ratón con datos RRBS, lo que lo hace adecuado para estudios preclínicos de intervenciones.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en sangre total de ratón; no es aplicable a otras especies ni a otros tejidos sin reentrenamiento.
- La precisión de la predicción depende de la calidad y el tipo de datos de metilación (RRBS). Si se usan datos de arrays de metilación (p. ej., Illumina Mouse Methylation BeadChip), el modelo no funcionará correctamente porque los CpGs seleccionados son específicos del contexto RRBS.
- No se han documentado sesgos específicos, pero como todo modelo entrenado con una muestra limitada, puede presentar errores sistemáticos en poblaciones de ratones con antecedentes genéticos distintos a los del conjunto de entrenamiento.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo.
- La licencia BSD-3-Clause permite uso comercial y modificación, pero se recomienda citar el artículo original en publicaciones científicas.
- El modelo no está diseñado para uso clínico en humanos; es una herramienta de investigación básica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pyaging/petkovich
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Publicación original: Petkovich, D. A., et al. "Using DNA methylation profiling to evaluate biological age and longevity interventions." *Cell Metabolism* 25.4 (2017): 954-960. DOI: https://doi.org/10.1016/j.cmet.2017.03.016
