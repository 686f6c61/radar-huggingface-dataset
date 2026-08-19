# psaegert/flash-ansr-v23.2-120M

## Resumen

flash-ansr-v23.2-120M es un modelo de regresión simbólica amortizada desarrollado por psaegert (Saegert y Köthe, ICML 2026). Dado un conjunto de datos tabulares `(X, y)`, el modelo devuelve una expresión simbólica en forma cerrada que aproxima la relación subyacente, evitando el coste de los métodos tradicionales de búsqueda simbólica. Se basa en la librería flash-ansr, que combina un encoder SetTransformer, un decoder Transformer y un refinador de constantes para mapear datos tabulares a expresiones matemáticas.

La versión v23.2, denominada "full Cauchy / wide inputs", es una variante de la v23.0-120M que modifica el prior de constantes y los extremos del rango de entrada a distribuciones Cauchy (colas pesadas) y elimina el clamp de magnitud de entrada de ±30. Esto mejora sustancialmente la recuperación de expresiones cuando los valores de entrada están fuera de la distribución de entrenamiento, con un incremento de +14 puntos en el benchmark OOD-magnitude FastSRB, sin pérdida medible en el rendimiento dentro de distribución.

Con 120 millones de parámetros, es un modelo compacto diseñado para inferencia rápida y lista para usar: se carga con una sola llamada y se entrena (ajusta) sobre los datos en cuestión de segundos. Su licencia MIT permite uso comercial sin restricciones. No es un modelo de lenguaje: su pipeline es `tabular-regression` y no maneja texto ni contexto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetTransformer encoder + Transformer decoder + constant refiner |
| Parametros totales | 120 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (formato propio de la libreria flash-ansr) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de flash-ansr: un encoder SetTransformer procesa el conjunto de pares `(X, y)` de tamaño variable y produce una representación invariante al orden; un decoder Transformer autoregresivo genera la expresión simbólica token a token; y un refinador de constantes ajusta los coeficientes numéricos de la expresión final para maximizar la precisión. La versión v23.2 introduce dos cambios clave respecto a la v23.0: el prior sobre las constantes y los extremos del rango de entrada siguen distribuciones Cauchy (colas pesadas) en lugar de uniformes, y se elimina el clamp que limitaba la magnitud de las entradas a ±30. Esto permite al modelo manejar valores de entrada mucho mayores o menores que los vistos durante el entrenamiento, mejorando la generalización fuera de distribución.

No se han publicado detalles sobre el conjunto de datos de entrenamiento (número de tokens, composición, método de entrenamiento como RLHF o DPO). El modelo se entrena de forma supervisada para predecir expresiones simbólicas a partir de datos tabulares generados sintéticamente, un enfoque común en regresión simbólica amortizada. La publicación asociada (arXiv:2602.08885) describe la metodología completa, pero no se incluye en la información disponible.

## Capacidades

- Regresión simbólica: dado un conjunto de datos `(X, y)`, devuelve una expresión matemática cerrada (por ejemplo, `x0**2 + x1`).
- Manejo de datos tabulares con dimensionalidad de entrada variable (el ejemplo usa 200 muestras y 2 variables).
- Inferencia rápida: el modelo está diseñado para ajuste y predicción en segundos, sin necesidad de entrenamiento adicional.
- Robustez a magnitudes fuera de distribución: la variante v23.2 mejora la recuperación de expresiones cuando los valores de entrada están fuera del rango típico.
- Generación de expresiones con constantes refinadas: el refinador de constantes ajusta los coeficientes numéricos para maximizar la precisión.
- Integración sencilla con la librería flash-ansr: instalación vía pip, carga con una línea de código y uso mediante `fit` y `predict`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües, al ser un modelo especializado en regresión simbólica.

## Casos de uso

- Descubrimiento de leyes físicas: a partir de mediciones experimentales (por ejemplo, datos de movimiento, circuitos eléctricos), el modelo puede inferir la ecuación que relaciona las variables, acelerando la formulación de hipótesis científicas.
- Modelado de procesos industriales: en ingeniería, se puede usar para extraer expresiones analíticas de datos de sensores (temperatura, presión, caudal) que sirvan para control predictivo o simulación sin necesidad de modelos de caja negra.
- Análisis financiero: dada una serie de variables económicas y una variable objetivo (por ejemplo, precio de un activo), el modelo puede sugerir una fórmula interpretable que explique la relación, útil para validación de modelos y comunicación con stakeholders.
- Generación de modelos sustitutos en optimización: cuando un simulador costoso debe evaluarse muchas veces, se puede entrenar el modelo sobre un conjunto limitado de evaluaciones y obtener una expresión simbólica rápida que sirva como aproximación para optimización o análisis de sensibilidad.
- Educación y divulgación: permite a estudiantes e investigadores obtener expresiones matemáticas a partir de datos experimentales de forma interactiva, facilitando la comprensión de relaciones subyacentes.
- Verificación de hipótesis en bioinformática: con datos de expresión génica o concentraciones de metabolitos, el modelo puede proponer ecuaciones que relacionen variables biológicas, ayudando a generar nuevas hipótesis comprobables.
- Automatización de tareas de ajuste de curvas: en laboratorios o entornos de producción, donde tradicionalmente se usa regresión polinómica o exponencial manual, el modelo puede encontrar la mejor forma funcional sin intervención humana.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la información disponible. La única métrica mencionada es la mejora de +14 puntos en el benchmark OOD-magnitude FastSRB (fuera de distribución en magnitud) respecto a la versión v23.0-120M, sin coste medible en rendimiento dentro de distribución. No se proporcionan valores absolutos ni comparaciones con otros modelos de regresión simbólica.

## Requisitos de hardware

- Al ser un modelo de 120M parámetros, la inferencia es ligera y puede ejecutarse en CPU con memoria RAM suficiente (se estima menos de 1 GB para los pesos, aunque no se especifica el formato).
- Para acelerar el ajuste y la generación, se recomienda una GPU con al menos 4 GB de VRAM, aunque no se han publicado requisitos oficiales.
- Es probable que funcione en GPUs consumer como NVIDIA GTX 1060, RTX 2060 o superiores, así como en Apple Silicon con Metal.
- La librería flash-ansr ofrece integración con PyTorch; el despliegue puede hacerse en entornos estándar de Python sin necesidad de infraestructura especializada.
- No se dispone de datos sobre latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (regresión simbólica amortizada) dentro de la documentación proporcionada. La comparativa queda pendiente hasta que se publiquen más detalles o se evalúe el modelo frente a alternativas como EQL, DSR o los modelos de la familia ANSR.

## Limitaciones y advertencias

- El modelo está especializado en regresión simbólica y no puede manejar texto, imágenes ni audio; no es un modelo de propósito general.
- La calidad de las expresiones generadas depende de la complejidad de la relación subyacente; relaciones muy complejas o con ruido elevado pueden producir expresiones inexactas o sobreajustadas.
- Aunque la variante v23.2 mejora el comportamiento con magnitudes fuera de distribución, no hay garantía de generalización a dominios muy alejados de los datos de entrenamiento.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos sintéticos, podría favorecer ciertos tipos de funciones (polinómicas, trigonométricas, etc.) sobre otras.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar la documentación de la librería flash-ansr para posibles dependencias de terceros.
- Para uso en producción, es necesario validar las expresiones generadas con datos de prueba independientes y considerar la posibilidad de expresiones múltiples igualmente válidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/psaegert/flash-ansr-v23.2-120M
- Repositorio GitHub de flash-ansr: https://github.com/psaegert/flash-ansr
- Documentación de flash-ansr: https://flash-ansr.readthedocs.io/en/latest/
- Paquete PyPI: https://pypi.org/project/flash-ansr/
- Paper en arXiv: https://arxiv.org/abs/2602.08885
