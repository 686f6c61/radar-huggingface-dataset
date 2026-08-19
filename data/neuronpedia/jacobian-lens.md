# neuronpedia/jacobian-lens

## Resumen

El repositorio `neuronpedia/jacobian-lens` no contiene un modelo de lenguaje generativo, sino un conjunto de lentes jacobianas preajustadas para distintos modelos de IA, desarrollado por Neuronpedia en colaboración con la librería Jacobian Lens de Anthropic. Estas lentes son herramientas de interpretabilidad que permiten inspeccionar cómo un modelo transforma sus representaciones internas a lo largo de las capas, mediante el análisis de las matrices jacobianas entre capas consecutivas.

El objetivo es facilitar a investigadores y desarrolladores el estudio de la mecánica interna de modelos como Llama 3.1 8B, Qwen 3.6 27B u otros, sin necesidad de entrenar sus propias sondas. La relevancia actual radica en el creciente interés por la interpretabilidad mecanicista y la seguridad de los modelos, donde este tipo de herramientas se ha convertido en un estándar de facto para visualizar y entender el flujo de información.

El repositorio incluye subcarpetas por modelo (por ejemplo, `llama3.1-8b/jlens`), cada una con los pesos de la lente ya ajustados. La licencia es MIT, lo que permite uso comercial y académico sin restricciones significativas. El tamaño total del repositorio es de aproximadamente 58,2 GB, aunque cada lente individual ocupa alrededor de 1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente jacobiana (no es un modelo generativo; es una sonda de interpretabilidad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del modelo al que se aplica la lente) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica en la documentacion) |

## Arquitectura y entrenamiento

Las lentes jacobianas se basan en el cálculo de la matriz jacobiana entre las activaciones de capas consecutivas de un modelo transformer. Para cada par de capas, se entrena una transformación lineal que aproxima el jacobiano, lo que permite visualizar cómo se propaga la información y qué características se conservan o transforman. El entrenamiento se realiza con la librería oficial de Anthropic `jacobian-lens`, que proporciona utilidades para ajustar estas lentes sobre modelos ya entrenados.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que la documentación del repositorio se limita a indicar que las lentes fueron preajustadas con dicha librería. La innovación técnica principal es la propia metodología de la lente jacobiana, que ofrece una alternativa a los autoencoders dispersos (SAE) para el análisis de representaciones.

## Capacidades

- Interpretabilidad mecanicista: permite visualizar la transformación de representaciones entre capas de un modelo.
- Análisis de flujo de información: facilita el estudio de cómo se combinan características a lo largo de la red.
- Compatibilidad con múltiples modelos: el repositorio incluye lentes para varios modelos populares (Llama 3.1 8B, Qwen 3.6 27B, entre otros).
- Integración con Neuronpedia: las lentes se pueden explorar interactivamente en la plataforma web, con visualizaciones locales mediante la librería de Anthropic.
- No es un modelo generativo: no genera texto, código ni respuestas; es una herramienta de análisis.

## Casos de uso

- Investigación en interpretabilidad: los investigadores pueden cargar una lente preajustada para estudiar cómo un modelo específico procesa conceptos abstractos, como la negación o la composicionalidad, sin tener que entrenar sus propias sondas.
- Depuración de comportamientos indeseados: al visualizar los jacobianos, se pueden identificar capas donde se introducen sesgos o errores, ayudando a diseñar intervenciones o ajustes.
- Comparación entre arquitecturas: al disponer de lentes para distintos modelos, se pueden comparar las estrategias internas de representación entre familias como Llama y Qwen.
- Educación en IA: sirve como material didáctico para explicar conceptos de interpretabilidad mecanicista en cursos avanzados de machine learning.
- Desarrollo de herramientas de seguridad: los equipos de alineación pueden usar las lentes para auditar modelos antes de su despliegue, detectando posibles rutas de razonamiento no deseadas.
- Validación de hipótesis teóricas: los teóricos pueden contrastar predicciones sobre la dinámica de capas con las visualizaciones reales obtenidas de las lentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una herramienta de interpretabilidad y no de un modelo generativo, no aplican métricas como MMLU, HumanEval o GSM8K. El rendimiento se mide en términos de fidelidad de la lente (capacidad de aproximar el jacobiano real), pero no se proporcionan métricas cuantitativas en la documentación.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación del repositorio.
- Cada lente individual (por ejemplo, la de Llama 3.1 8B) ocupa aproximadamente 1 GB en disco, por lo que es factible cargarla en GPUs de consumo medio (8 GB de VRAM) si se usa junto con el modelo base.
- El repositorio completo pesa 58,2 GB, pero no es necesario descargarlo entero; se puede acceder a subcarpetas específicas.
- Para la visualización local se recomienda usar la librería `jacobian-lens` de Anthropic, que requiere un entorno Python con soporte para PyTorch.
- No se dispone de datos sobre latencia o throughput, ya que no es un modelo de inferencia en producción.

## Comparativa con modelos similares

No disponible. Las lentes jacobianas son una herramienta específica de interpretabilidad y no existen alternativas directas comparables en el mismo repositorio. Otras técnicas como los autoencoders dispersos (SAE) o las activaciones por características (feature visualization) cumplen funciones similares, pero no son equivalentes y no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no se puede utilizar para tareas de texto, código o razonamiento; su único propósito es el análisis.
- Dependencia del modelo base: la lente solo es válida para el modelo con el que fue entrenada; no es transferible a otras arquitecturas.
- Información limitada: la documentación no detalla el proceso de entrenamiento, los hiperparámetros ni las métricas de fidelidad, lo que dificulta evaluar su calidad.
- Posibles sesgos heredados: al ser una sonda sobre un modelo existente, puede reflejar los sesgos del modelo subyacente, aunque no se han documentado casos concretos.
- Requisitos de almacenamiento: aunque cada lente es pequeña, el repositorio completo es pesado; se recomienda descargar solo las subcarpetas necesarias.
- Sin garantías de producción: es una herramienta de investigación, no un componente listo para entornos de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neuronpedia/jacobian-lens
- Explorador en Neuronpedia: https://neuronpedia.org/jlens
- Librería Jacobian Lens de Anthropic: https://github.com/anthropics/jacobian-lens
- Ejemplo de lente para Llama 3.1 8B: https://huggingface.co/neuronpedia/jacobian-lens/tree/main/llama3.1-8b/jlens
