# psaegert/flash-ansr-v23.0-20M

## Resumen

Flash-ANSR es un modelo de regresión simbólica neuronal amortiguada (amortized neural symbolic regression) desarrollado por Saegert y Köthe, presentado en el artículo *Breaking the Simplification Bottleneck in Amortized Neural Symbolic Regression* (ICML 2026, arXiv:2602.08885). El modelo, identificado como `flash-ansr-v23.0-20M`, está diseñado para recuperar expresiones simbólicas a partir de datos tabulares mediante una llamada directa al modelo, sin necesidad de entrenamiento por muestra. Su relevancia radica en acelerar el descubrimiento de leyes científicas y la modelización de fenómenos físicos, superando el cuello de botella de la simplificación simbólica en enfoques anteriores.

El tamaño del repositorio es de 0.1 GB, lo que sugiere un modelo compacto de aproximadamente 20 millones de parámetros (según el nombre). La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas. La información pública es escasa: no se especifican detalles de arquitectura, contexto, idiomas ni benchmarks en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, según el nombre y el artículo, pero no confirmado) |
| Parametros totales | 20 millones (inferido del nombre, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre datos tabulares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto; trabaja con datos numéricos) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o binario, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Según el título del artículo y el nombre del repositorio, se trata de un enfoque de regresión simbólica neuronal amortiguada, probablemente basado en una arquitectura transformer que procesa pares de variables independientes (X) y dependientes (y) para generar expresiones simbólicas. El término "flash" sugiere un diseño optimizado para inferencia rápida. Los detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF no están disponibles en la documentación pública. El artículo menciona abordar el "cuello de botella de simplificación", lo que implica una innovación en la generación de expresiones simplificadas, posiblemente mediante un módulo específico de simplificación simbólica integrado en el pipeline.

## Capacidades

- Regresión simbólica: genera expresiones matemáticas (por ejemplo, fórmulas algebraicas) que ajustan datos tabulares (X, y).
- Inferencia amortiguada: una vez entrenado, el modelo produce expresiones simbólicas en una sola llamada (`fit` o `infer`), sin necesidad de optimización por muestra.
- Devolución de múltiples candidatos: según la documentación, `model.infer(X, y)` devuelve un `InferenceResult` con el mejor candidato, una lista ordenada por puntuación y un registro completo de candidatos.
- Integración con SimpliPy: el modelo se combina con una librería de simplificación simbólica para refinar las expresiones generadas.
- No es un modelo de lenguaje: no procesa texto, imágenes ni audio; su dominio es exclusivamente datos numéricos tabulares.

## Casos de uso

- Descubrimiento de leyes físicas: a partir de mediciones experimentales (por ejemplo, posición y tiempo), el modelo puede inferir la ecuación cinemática subyacente, como `s = v₀·t + ½·a·t²`.
- Modelado de procesos químicos: ajustar expresiones que relacionan concentraciones, temperaturas o velocidades de reacción a partir de datos de laboratorio.
- Análisis de datos financieros: identificar relaciones funcionales entre variables económicas (por ejemplo, elasticidad precio-demanda) para construir modelos predictivos simples.
- Ingeniería inversa de sistemas dinámicos: extraer ecuaciones diferenciales o algebraicas que describan el comportamiento de sistemas mecánicos o eléctricos a partir de series temporales.
- Generación de modelos interpretables para machine learning: sustituir modelos de caja negra (como redes neuronales) por expresiones simbólicas comprensibles en dominios donde la explicabilidad es crítica (medicina, energía, etc.).
- Automatización de tareas de ajuste de curvas en entornos científicos: el modelo puede usarse como backend en librerías de análisis de datos para ofrecer expresiones simbólicas de forma inmediata, reduciendo el tiempo de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de referencia (arXiv:2602.08885) podría contener evaluaciones comparativas, pero no se proporcionan datos concretos en la model card ni en los resultados de búsqueda. Por tanto, no se pueden presentar tablas de rendimiento sin riesgo de inventar números.

## Requisitos de hardware

- No se dispone de información específica sobre VRAM, GPUs recomendadas o latencia.
- Dado el tamaño del modelo (≈20M parámetros) y el peso del repositorio (0.1 GB), es probable que la inferencia sea viable en GPUs de consumo (por ejemplo, RTX 3060 o superiores) o incluso en CPU, pero no hay confirmación oficial.
- La documentación menciona que la librería está "built for fast, ready-to-use inference", lo que sugiere un diseño optimizado, pero sin datos cuantitativos.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama; el uso previsto es como librería Python (según el repositorio GitHub), cargando el modelo y llamando a `fit` o `infer`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (regresión simbólica neuronal amortiguada). Existen otros enfoques como EQL (Equation Learner) o SymbolicGPT, pero no se dispone de datos suficientes para una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado en datos sintéticos o científicos, podría presentar limitaciones en dominios muy alejados de los datos de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir expresiones simbólicas que ajusten los datos pero no reflejen una relación causal real; se recomienda validación externa.
- Limitaciones de contexto: el modelo opera sobre datos tabulares; no maneja texto, imágenes ni audio.
- Idiomas: no aplica, ya que no procesa lenguaje natural.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero el autor no ofrece garantías implícitas.
- Para producción, se recomienda verificar la calidad de las expresiones generadas mediante métricas de ajuste y validación cruzada, así como revisar la documentación completa del repositorio y el artículo antes de desplegarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psaegert/flash-ansr-v23.0-20M
- Repositorio GitHub: https://github.com/psaegert/flash-ansr
- Documentación: https://flash-ansr.readthedocs.io/en/
- Artículo arXiv: https://arxiv.org/abs/2602.08885
- Modelo relacionado (v23.2-120M): https://huggingface.co/psaegert/flash-ansr-v23.2-120M
