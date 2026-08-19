# pyaging/systemsagebrain

## Resumen

systemsagebrain es un reloj epigenético (aging clock) desarrollado por el equipo de pyaging como componente del sistema "Systems Age", un score de metilación de ADN en sangre completa que cuantifica la heterogeneidad del envejecimiento en 11 sistemas fisiológicos. Este modelo concreto predice la edad biológica del sistema cerebral a partir de datos de metilación de ADN (DNAm) obtenidos de sangre periférica, devolviendo un resultado en una escala similar a la edad cronológica.

El modelo emplea una arquitectura de reducción de dimensionalidad (PCA) seguida de una regresión elastic net, una combinación clásica en el campo de los relojes epigenéticos por su eficiencia computacional y su interpretabilidad. Fue entrenado con datos de mortalidad y biomarcadores funcionales, lo que le permite asociar el estado de metilación con el envejecimiento del cerebro a nivel sistémico. Su relevancia radica en que ofrece una medida no invasiva del envejecimiento cerebral a partir de una simple muestra de sangre, con aplicaciones en investigación biomédica y potencial uso clínico.

El modelo está disponible bajo licencia BSD-3-Clause y se integra en la librería `pyaging`, que facilita su uso mediante una única llamada. El repositorio tiene un tamaño de 2.0 GB, aunque el modelo en sí es un conjunto de coeficientes de regresión, por lo que su huella computacional es mínima. Fue publicado en 2025 y descrito en el artículo de Nature Aging citado en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible (modelo de regresión sobre componentes principales; no es una red neuronal) |
| Parametros activos | no aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplicable (no procesa texto) |
| Tipos de cuantizacion | no disponible (no es un modelo de pesos en formato de red neuronal) |
| Idiomas soportados | no aplicable (entrada: datos de metilación de ADN) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (se distribuye a través de la librería pyaging; probablemente archivos de coeficientes, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo se basa en un pipeline de dos etapas. Primero, se aplica un análisis de componentes principales (PCA) sobre los niveles de metilación de ADN en sitios CpG seleccionados de sangre completa, reduciendo la dimensionalidad del espacio de características. Segundo, se ajusta una regresión elastic net sobre esos componentes principales, con un objetivo de entrenamiento basado en la mortalidad y biomarcadores funcionales del sistema cerebral. Esta combinación permite capturar la varianza relevante del epigenoma asociada al envejecimiento cerebral y proyectarla en una escala de edad biológica.

El entrenamiento se realizó sobre datos de metilación de sangre completa de Homo sapiens, integrando información de mortalidad y funcionalidad del sistema nervioso. No se dispone de detalles sobre el número de muestras, el número de sitios CpG utilizados ni las hiperparámetros exactas de la elastic net (alfa, lambda) en la información proporcionada. El modelo no utiliza técnicas de aprendizaje profundo ni refuerzo; es un método estadístico clásico, lo que le confiere alta interpretabilidad y bajo coste computacional.

## Capacidades

- Predicción de la edad biológica del sistema cerebral a partir de datos de metilación de ADN en sangre completa.
- Devolución de un valor en escala de edad (años), comparable a la edad cronológica del individuo.
- Integración con la librería `pyaging` para su uso directo sobre objetos AnnData (estructura de datos estándar en single-cell).
- Compatible con el ecosistema de relojes epigenéticos de `pyaging`, permitiendo comparaciones entre múltiples sistemas fisiológicos.
- No soporta generación de texto, razonamiento, código, visión ni tool calling; es un modelo puramente predictivo para datos tabulares de metilación.

## Casos de uso

- Investigación en envejecimiento: el modelo permite cuantificar la edad biológica del cerebro en cohortes de estudio, facilitando la asociación con factores de riesgo, estilo de vida o intervenciones terapéuticas.
- Estudios longitudinales de salud: al usar sangre completa, se puede monitorizar el envejecimiento cerebral de forma no invasiva en estudios de seguimiento a largo plazo, sin necesidad de biopsias cerebrales.
- Evaluación de intervenciones anti-envejecimiento: en ensayos clínicos de fármacos o cambios de hábitos, el modelo puede servir como biomarcador de eficacia, midiendo cambios en la edad biológica cerebral antes y después de la intervención.
- Análisis de heterogeneidad del envejecimiento: al ser parte de Systems Age, permite comparar el envejecimiento del sistema cerebral con otros 10 sistemas, identificando desincronías entre órganos.
- Medicina de precisión: en contextos clínicos, podría ayudar a estratificar pacientes según su riesgo de deterioro cognitivo o enfermedades neurodegenerativas, basándose en el estado epigenético de la sangre.
- Validación de otros biomarcadores: el modelo puede usarse como referencia para comparar nuevas métricas de envejecimiento cerebral derivadas de otras ómicas (proteómica, transcriptómica) o de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo original (Sehgal et al., 2025) describe la validación del modelo completo de Systems Age, pero no se incluyen métricas específicas de systemsagebrain en la model card. Se recomienda consultar la publicación para obtener datos de precisión (error absoluto medio, correlación con edad cronológica, etc.) si están disponibles.

## Requisitos de hardware

- El modelo es una regresión lineal sobre componentes principales, por lo que no requiere GPU. Puede ejecutarse en cualquier CPU moderna.
- La memoria necesaria es mínima: solo se cargan los coeficientes de la elastic net y las cargas de los componentes principales (típicamente unos pocos cientos de MB, aunque el repositorio completo ocupa 2.0 GB por incluir datos auxiliares).
- No se requieren GPUs específicas (A100, H100, RTX 4090) ni hardware especializado.
- El despliegue se realiza a través de la librería `pyaging` en Python, que maneja la carga del modelo y la predicción sobre objetos AnnData.
- La latencia es de milisegundos por muestra, ya que solo implica una multiplicación matricial y una transformación lineal.
- El throughput está limitado por la lectura de los datos de metilación, no por el modelo en sí.

## Comparativa con modelos similares

El campo de los relojes epigenéticos incluye varios modelos comparables, aunque no se dispone de datos de rendimiento específicos para esta comparación:

| Modelo | Tipo | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|
| systemsagebrain | PCA + elastic net | Sangre completa | BSD-3-Clause | pyaging (HuggingFace) |
| Reloj de Horvath (2013) | Elastic net sobre CpGs | Multi-tejido | Uso académico | Scripts públicos |
| PhenoAge (2018) | Elastic net sobre CpGs | Sangre | Uso académico | Scripts públicos |
| GrimAge (2019) | Elastic net sobre CpGs | Sangre | Uso académico | Scripts públicos |

Nota: los modelos clásicos (Horvath, PhenoAge, GrimAge) no son directamente comparables en arquitectura ni en objetivo (edad biológica general vs. sistema cerebral específico). systemsagebrain se distingue por su enfoque en un sistema fisiológico concreto y su integración en el ecosistema Systems Age.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para Homo sapiens y sangre completa; no es aplicable a otros tejidos o especies sin reentrenamiento.
- No se han documentado sesgos específicos, pero como todo modelo estadístico entrenado con datos poblacionales, puede presentar sesgos según la composición étnica, de edad o de sexo de la cohorte de entrenamiento, que no se detalla en la información disponible.
- La interpretación clínica debe ser cautelosa: la edad biológica cerebral predicha no equivale a un diagnóstico de enfermedades neurodegenerativas; es un biomarcador de investigación.
- La licencia BSD-3-Clause permite uso comercial y modificación, pero se recomienda revisar los términos de la publicación original para posibles restricciones adicionales sobre los datos utilizados.
- No se proporcionan intervalos de confianza ni medidas de incertidumbre en la model card, por lo que en producción se debe considerar la variabilidad de las predicciones.
- El tamaño del repositorio (2.0 GB) puede deberse a datos de entrenamiento o pesos auxiliares; el modelo en sí es ligero, pero la descarga completa puede ser pesada para entornos con ancho de banda limitado.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/systemsagebrain
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. Nature Aging, 5, 1880–1896. https://doi.org/10.1038/s43587-025-00958-3
