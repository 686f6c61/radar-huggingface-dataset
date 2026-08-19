# pyaging/reg

## Resumen

El modelo `pyaging/reg` es un reloj de envejecimiento (aging clock) basado en regresión ridge, desarrollado por el equipo de pyaging como parte del estudio Pasta. Su función es predecir la edad cronológica de muestras humanas a partir de datos de expresión génica multi-tejido, transformados mediante ranking. Se trata de un modelo baseline dentro del catálogo de relojes de la librería pyaging, diseñado para servir como referencia comparativa frente a otros métodos más complejos.

Este modelo resuelve el problema de estimar la edad biológica a partir de transcriptomas, una tarea clave en la investigación del envejecimiento y sus intervenciones. Su relevancia actual radica en que proporciona un punto de partida sencillo y reproducible para estudios de envejecimiento, integrado en el ecosistema pyaging, que facilita su uso en pipelines de análisis de datos ómicos. Al ser una regresión lineal regularizada, no requiere recursos computacionales significativos y puede ejecutarse en cualquier máquina con CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión ridge (modelo lineal regularizado L2) |
| Parametros totales | No disponible (modelo de regresión sobre características de expresión, número de coeficientes no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica (modelo numérico de regresión, no requiere cuantización) |
| Idiomas soportados | No aplica (trabaja con datos de expresión génica, no con texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (probablemente serialización de modelo de scikit-learn, no especificado) |

## Arquitectura y entrenamiento

El modelo es una regresión ridge, una técnica de regresión lineal con regularización L2. Se entrena sobre datos de expresión génica de múltiples tejidos humanos, transformados mediante ranking (rank-transformed). El objetivo es minimizar el error cuadrático entre la edad cronológica predicha y la real, controlando la complejidad del modelo con el término de penalización L2.

No se han publicado detalles sobre el número de muestras de entrenamiento, el número de genes utilizados como características, ni el proceso de validación. El modelo forma parte del estudio Pasta (Salignon et al., 2025), que propone un reloj transcriptómico versátil para mapear determinantes químicos y genéticos del envejecimiento y la rejuvenecimiento. No se indica si se emplearon técnicas de RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Predicción de edad cronológica a partir de perfiles de expresión génica multi-tejido.
- Funciona como baseline de referencia dentro del catálogo de relojes de pyaging.
- Integración sencilla con la librería pyaging mediante la función `predict_age`.
- Apto para datos de transcriptómica de Homo sapiens.
- No requiere GPU; puede ejecutarse en CPU con recursos mínimos.
- No soporta tool calling, agentes, ni capacidades multimodales (no es un LLM).

## Casos de uso

- **Investigación biomédica del envejecimiento**: permite estimar la edad biológica de muestras de tejido a partir de datos de expresión, facilitando estudios sobre la heterogeneidad del envejecimiento entre individuos.
- **Validación de intervenciones antienvejecimiento**: en experimentos con modelos celulares o animales (aunque el modelo está entrenado en humanos), puede usarse como referencia para comparar el efecto de fármacos o compuestos sobre la edad transcriptómica.
- **Análisis de datos de transcriptómica pública**: se puede aplicar a conjuntos de datos como GTEx o GEO para generar estimaciones de edad y correlacionarlas con variables clínicas.
- **Desarrollo de nuevos relojes de envejecimiento**: sirve como baseline para comparar el rendimiento de modelos más complejos (redes neuronales, modelos de supervivencia) en la misma tarea.
- **Control de calidad en estudios de expresión**: las predicciones de edad pueden usarse para detectar errores en el etiquetado de muestras o inconsistencias en los datos.
- **Educación y formación en bioinformática**: al ser un modelo sencillo y reproducible, es útil para enseñar conceptos de regresión aplicada a datos ómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas como correlación, error absoluto medio (MAE) o R². Tampoco se comparan sus resultados con otros relojes de envejecimiento conocidos (p. ej., Horvath clock, PhenoAge). Por tanto, no es posible evaluar su rendimiento cuantitativo a partir de los datos proporcionados.

## Requisitos de hardware

- **VRAM**: No requiere VRAM. Es un modelo de regresión lineal, se ejecuta completamente en CPU.
- **GPU recomendada**: No se necesita GPU. Cualquier CPU moderna es suficiente.
- **Compatibilidad con consumer GPU**: No aplica, no usa GPU.
- **Opciones de despliegue**: Se integra mediante la librería pyaging en Python. No requiere servidores de inferencia como vLLM o TGI; basta con cargar el modelo en memoria (probablemente un archivo pickle o joblib de scikit-learn).
- **Latencia y throughput**: Inferencia instantánea para una muestra individual (microsegundos). Para miles de muestras, el tiempo total es del orden de segundos, dependiendo de la dimensión de las características.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos dentro del mismo repositorio. En la literatura existen otros relojes de envejecimiento transcriptómicos, como:

- **Reloj de Horvath**: basado en metilación de ADN, no en expresión génica, por lo que no es directamente comparable.
- **PhenoAge**: también basado en biomarcadores clínicos, no en transcriptómica.
- **Otros relojes de expresión**: no se han encontrado en la información proporcionada.

Dado que no hay datos de rendimiento publicados para `pyaging/reg`, no es posible realizar una comparación cuantitativa. Se recomienda consultar el estudio Pasta (enlace abajo) para más detalles sobre su evaluación frente a otros métodos.

## Limitaciones y advertencias

- **Sesgos conocidos**: Al estar entrenado exclusivamente con datos humanos de múltiples tejidos, su aplicabilidad a otras especies o tejidos no contemplados puede ser limitada.
- **Riesgo de alucinación**: No aplica, no es un modelo generativo.
- **Limitaciones de contexto**: No maneja contexto secuencial; solo procesa vectores de expresión fijos. La transformación por ranking puede perder información de magnitud absoluta.
- **Restricciones de licencia**: Licencia BSD-3-Clause, permite uso comercial con atribución. No hay restricciones adicionales conocidas.
- **Caveat para producción**: Es un modelo baseline; para aplicaciones clínicas o de precisión se recomienda validar en la población y tejido de interés. La precisión predictiva puede ser baja comparada con modelos más complejos, aunque no se dispone de cifras concretas.

## Enlaces

- [HuggingFace: pyaging/reg](https://huggingface.co/pyaging/reg)
- [pyaging Clock Catalogue (documentación)](https://pyaging.readthedocs.io)
- [Artículo Pasta (bioRxiv)](https://doi.org/10.1101/2025.06.04.657785)
