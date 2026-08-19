# pyaging/pipekfilteredh

## Resumen

El modelo `pipekfilteredh` es un reloj epigenético desarrollado por Orsolya Anna Pipek y István Csabai, presentado en 2022 y publicado formalmente en 2023. Se trata de un modelo de regresión elastic net que predice la edad cronológica de un individuo a partir de los niveles de metilación del ADN en múltiples tejidos. Es una revisión del reloj original de Horvath (2013), restringiendo el conjunto de CpGs a los 308 originales que están presentes en el estudio, de los cuales 272 retienen coeficientes no nulos tras el ajuste penalizado.

Este modelo pertenece a la categoría de los denominados "aging clocks" o relojes de envejecimiento, herramientas bioinformáticas que estiman la edad biológica a partir de marcadores epigenéticos. Su relevancia radica en que ofrece una alternativa refinada al clásico reloj de Horvath, con una selección más parsimoniosa de CpGs y un rendimiento comparable en datos de metilación de arrays. Está integrado en la librería `pyaging`, lo que facilita su uso en pipelines de análisis de datos de metilación.

El modelo no es un sistema de IA generativa ni un LLM, sino un modelo estadístico de aprendizaje supervisado. Su arquitectura es una regresión lineal penalizada (elastic net), y su tamaño es reducido: únicamente 272 coeficientes de regresión. No requiere hardware especializado y puede ejecutarse en cualquier equipo con Python y la librería `pyaging`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net (lineal penalizada) |
| Parametros totales | 272 coeficientes no nulos (de 308 CpGs candidatos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular) |
| Tipos de cuantizacion | No aplica (modelo estadístico, no neuronal) |
| Idiomas soportados | No aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo es una regresión elastic net, que combina penalizaciones L1 y L2 para seleccionar variables y regularizar los coeficientes. Se entrenó sobre datos de metilación de ADN de múltiples tejidos humanos, utilizando los 308 CpGs del reloj original de Horvath que estaban presentes en el conjunto de datos del estudio. Tras el ajuste penalizado, 272 CpGs conservaron coeficientes distintos de cero. El objetivo es predecir la edad cronológica (en años) a partir de los niveles de metilación beta-valores.

Los detalles exactos del conjunto de entrenamiento (número de muestras, plataformas de arrays, distribución por edad y tejido) no se especifican en la documentación disponible. El modelo fue publicado en 2022 y la metodología se describe en el artículo de Pipek y Csabai (2023). No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN (beta-valores) en humanos.
- Funciona en múltiples tejidos (multi-tissue), lo que permite aplicarlo a muestras de sangre, tejido epitelial, etc.
- Modelo parsimonioso: solo 272 CpGs, lo que reduce el riesgo de sobreajuste y facilita la interpretación biológica.
- Integrado en la librería `pyaging`, que proporciona una interfaz unificada para cargar y ejecutar relojes epigenéticos.
- No soporta tool calling, agentes, ni procesamiento de lenguaje natural. Tampoco tiene capacidades multimodales.

## Casos de uso

- Investigación en envejecimiento biológico: estimar la edad epigenética de cohortes de pacientes y correlacionarla con enfermedades relacionadas con la edad.
- Estudios longitudinales: monitorizar cambios en la edad epigenética a lo largo del tiempo en estudios de intervención (dieta, ejercicio, fármacos).
- Análisis de datos de metilación en biobancos: aplicar el reloj a grandes conjuntos de datos públicos (GEO, TCGA) para calcular edades epigenéticas sin necesidad de reentrenar.
- Validación de biomarcadores: comparar la edad epigenética predicha con otros marcadores de envejecimiento (longitud de telómeros, proteínas séricas).
- Control de calidad en experimentos de metilación: detectar errores de etiquetado de muestras (si la edad predicha difiere mucho de la edad registrada).
- Educación y divulgación: como ejemplo de modelo de regresión aplicado a datos ómicos en cursos de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como correlación con la edad cronológica, error absoluto medio (MAE) o comparación con otros relojes. El artículo original (Pipek y Csabai, 2023) podría contener dichos datos, pero no se proporcionan en el repositorio de HuggingFace.

## Requisitos de hardware

- Al ser un modelo de regresión con solo 272 coeficientes, la inferencia es trivial: se realiza una multiplicación matriz-vector.
- No requiere GPU. Funciona en cualquier CPU, incluso en un Raspberry Pi.
- El consumo de memoria es despreciable (menos de 1 MB).
- Se puede desplegar en cualquier entorno con Python 3.8+ y la librería `pyaging` instalada.
- No aplican opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia es del orden de microsegundos por muestra.

## Comparativa con modelos similares

| Modelo | Año | Tipo | Nº CpGs | Tejidos | Licencia |
|---|---|---|---|---|---|
| pipekfilteredh | 2022 | Elastic net | 272 | Multi-tejido | BSD-3-Clause |
| Horvath (2013) | 2013 | Elastic net | 353 | Multi-tejido | No especificada (uso académico) |
| Hannum (2013) | 2013 | Elastic net | 71 | Sangre | No especificada |

Nota: La comparativa se basa en el conocimiento general de los relojes epigenéticos. Los datos concretos de rendimiento (correlación, MAE) no están disponibles en la documentación del modelo.

## Limitaciones y advertencias

- La model card no documenta limitaciones específicas. Sin embargo, como todo reloj epigenético, puede presentar sesgos según la población (etnia, edad, sexo) y el tipo de tejido analizado.
- El modelo fue entrenado con datos de metilación de arrays; su aplicación a datos de secuenciación (bisulfito) puede requerir normalización adicional.
- No se especifica el rango de edades para el que es válido; es probable que tenga menor precisión en edades extremas (niños o ancianos) si el entrenamiento no los cubrió adecuadamente.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar el artículo original para conocer restricciones adicionales sobre los datos utilizados.
- No hay garantía de que las predicciones sean clínicamente accionables; el modelo es una herramienta de investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyaging/pipekfilteredh
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original: Pipek, Orsolya Anna, and István Csabai. "A revised multi-tissue, multi-platform epigenetic clock model for methylation array data." Journal of Mathematical Chemistry 61 (2023): 376–388. DOI: https://doi.org/10.1007/s10910-022-01381-4
