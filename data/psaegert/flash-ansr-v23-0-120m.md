# psaegert/flash-ansr-v23.0-120M

## Resumen

Flash-ANSR es un modelo de regresión simbólica amortizada desarrollado por Saegert y Köthe, presentado en el artículo *Breaking the Simplification Bottleneck in Amortized Neural Symbolic Regression* (ICML 2026). El modelo, en su versión v23.0 con 120 millones de parámetros, aprende a mapear datos tabulares a expresiones simbólicas de forma directa, sin necesidad de optimización iterativa por muestra. Esto lo diferencia de los métodos clásicos de regresión simbólica basados en búsqueda genética o programación genética, que requieren minutos u horas por conjunto de datos.

La arquitectura combina un codificador SetTransformer, un decodificador Transformer y un refinador de constantes, lo que permite procesar conjuntos de puntos (X, y) y generar una expresión simbólica cerrada. El modelo está disponible bajo licencia MIT y su repositorio incluye una librería Python para cargar el modelo preentrenado y usarlo con una sola llamada a `fit(X, y)`. Su relevancia actual radica en ofrecer una alternativa rápida y lista para producción para la extracción de leyes físicas, fórmulas empíricas o modelos interpretables a partir de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetTransformer encoder + Transformer decoder + constant refiner |
| Parametros totales | 120 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, procesa conjuntos de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura de Flash-ANSR se compone de tres módulos principales: un codificador SetTransformer que procesa el conjunto de puntos de entrada (X, y) de forma permutacionalmente invariante, un decodificador Transformer que autoregresivamente genera la secuencia de tokens de la expresión simbólica, y un refinador de constantes que ajusta los coeficientes numéricos de la expresión generada. El entrenamiento se realiza de forma amortizada, es decir, el modelo aprende a predecir expresiones para cualquier conjunto de datos sin necesidad de optimización específica por muestra. Según el artículo, el principal avance es superar el "cuello de botella de simplificación" que limitaba a los modelos anteriores, permitiendo generar expresiones más compactas y generalizables. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO, ya que no se mencionan en la información disponible.

## Capacidades

- Regresión simbólica: dado un conjunto de puntos (X, y), recupera una expresión simbólica cerrada que ajusta los datos.
- Generación de múltiples candidatos: la API `infer` devuelve todas las expresiones candidatas en una sola llamada, sin modificar el estado del modelo.
- Refinamiento de constantes: ajusta los coeficientes numéricos de las expresiones para mejorar el ajuste.
- Inferencia rápida: diseñado para uso inmediato con `fit(X, y)` y posterior lectura de la expresión con `get_expression`.
- Entrenamiento personalizado: la librería permite entrenar nuevos modelos sobre conjuntos de datos propios.
- Integración en pipelines: al ser una librería Python, puede integrarse en flujos de análisis de datos y automatización.

## Casos de uso

- Descubrimiento de leyes físicas: dado un conjunto de mediciones experimentales (por ejemplo, posición y tiempo), el modelo puede recuperar la ecuación cinemática que las relaciona, acelerando el análisis en laboratorios.
- Modelado empírico en ingeniería: para datos de sensores o procesos industriales, se puede obtener una fórmula interpretable que sirva como modelo de comportamiento sin necesidad de simulaciones complejas.
- Análisis exploratorio de datos: en ciencia de datos, se puede usar para generar hipótesis simbólicas sobre relaciones entre variables antes de aplicar modelos más complejos.
- Generación de modelos reducidos: en simulaciones numéricas, se pueden extraer expresiones simplificadas que aproximen el comportamiento de subsistemas, reduciendo coste computacional.
- Educación y divulgación: permite a estudiantes e investigadores obtener expresiones simbólicas a partir de datos experimentales de forma rápida, facilitando la comprensión de fenómenos.
- Automatización de informes científicos: integrado en pipelines de análisis, puede generar automáticamente ecuaciones que resuman los resultados de experimentos para su inclusión en publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo asociado (arXiv:2602.08885) podría contener comparaciones con otros métodos, pero no se ha accedido a su contenido completo.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en los datos proporcionados. Dado el tamaño del modelo (120M parámetros, 0.5 GB de repo), es plausible que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmación. Las opciones de despliegue incluyen la librería Python oficial (disponible en GitHub y readthedocs) que probablemente use PyTorch. No se conocen integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje generativo estándar.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de regresión simbólica amortizada. Existen alternativas clásicas como PySR, Eureqa o gplearn, pero no se tienen datos de rendimiento relativos en la información proporcionada. Se recomienda consultar el artículo para posibles comparaciones.

## Limitaciones y advertencias

- No se ha verificado el comportamiento del modelo en datos con ruido elevado o con relaciones no algebraicas; la regresión simbólica puede fallar si la expresión real no está dentro del espacio de expresiones que el modelo puede generar.
- El modelo está diseñado para datos tabulares (X, y); no procesa texto, imágenes ni otras modalidades.
- No se conocen sesgos específicos, pero como todo modelo entrenado con datos sintéticos, puede tener limitaciones en dominios muy alejados de la distribución de entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda revisar los términos del artículo y la librería para posibles patentes o restricciones adicionales.
- El tamaño del repositorio (0.5 GB) sugiere que el modelo puede requerir una cantidad moderada de memoria RAM/VRAM, pero no se han publicado requisitos mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psaegert/flash-ansr-v23.0-120M
- Repositorio GitHub: https://github.com/psaegert/flash-ansr
- Documentación: https://flash-ansr.readthedocs.io/en/latest/
- Artículo (arXiv): https://arxiv.org/abs/2602.08885
