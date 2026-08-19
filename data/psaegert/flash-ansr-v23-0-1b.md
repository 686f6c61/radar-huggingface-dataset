# psaegert/flash-ansr-v23.0-1B

## Resumen

Flash-ANSR v23.0-1B es un modelo de regresión simbólica neuronal amortizada desarrollado por Saegert y Köthe, presentado en el artículo *Breaking the Simplification Bottleneck in Amortized Neural Symbolic Regression* (ICML 2026). El modelo está diseñado para recuperar expresiones simbólicas (ecuaciones matemáticas) a partir de datos tabulares (X, y) de forma rápida y directa, sin necesidad de optimización iterativa costosa. Combina un codificador SetTransformer, un decodificador Transformer y un refinador de constantes para mapear conjuntos de puntos a expresiones algebraicas.

Con 1.000 millones de parámetros, este modelo se posiciona como una herramienta de propósito específico para la regresión simbólica, un campo con aplicaciones en descubrimiento científico, modelado físico y análisis de datos. Su licencia MIT permite uso comercial y modificación sin restricciones. Aunque la información pública es limitada, el repositorio y la documentación asociada indican que está pensado para ser cargado y utilizado directamente mediante una llamada `fit(X, y)`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetTransformer encoder + Transformer decoder + constant refiner |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamano del repo: 3.8 GB) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de regresión simbólica amortizada: en lugar de buscar una expresión mediante algoritmos genéticos o búsqueda guiada, un modelo neuronal aprende a predecir directamente la expresión simbólica a partir de un conjunto de pares (X, y). La arquitectura consta de tres componentes principales:

- Un **SetTransformer** como codificador, que procesa los datos tabulares de entrada (conjunto de puntos) y genera una representación invariante al orden de las filas.
- Un **decoder Transformer** autorregresivo que genera la secuencia de tokens de la expresión simbólica (operadores, variables, constantes).
- Un **refinador de constantes** que ajusta numéricamente los coeficientes de la expresión generada para minimizar el error de ajuste.

No se han publicado detalles específicos sobre el conjunto de entrenamiento (número de tokens, composición de datos, uso de RLHF o DPO). El artículo asociado (arXiv:2602.08885) aborda el problema del "cuello de botella de simplificación", lo que sugiere que el entrenamiento incorpora técnicas para mejorar la calidad de las expresiones generadas y evitar soluciones excesivamente complejas o sobreajustadas.

## Capacidades

- Regresión simbólica: recupera expresiones matemáticas cerradas (polinomios, funciones trigonométricas, exponenciales, logaritmos, etc.) a partir de datos tabulares.
- Ajuste de constantes: refina los coeficientes numéricos de la expresión generada para mejorar la precisión.
- Inferencia rápida: al ser un modelo amortizado, la predicción es directa (un solo paso de inferencia) en lugar de una búsqueda iterativa.
- Entrada flexible: acepta conjuntos de puntos de tamaño variable (gracias al SetTransformer).
- Sin soporte de tool calling, agentes, visión ni procesamiento de lenguaje natural: es un modelo especializado en datos numéricos.

## Casos de uso

- Descubrimiento de leyes físicas: dado un conjunto de mediciones experimentales (por ejemplo, posición frente a tiempo), el modelo puede proponer una ecuación que relacione las variables, acelerando la formulación de hipótesis en laboratorios.
- Modelado de fenómenos económicos: ajuste de curvas de demanda, oferta o crecimiento a partir de datos históricos, obteniendo expresiones interpretables para análisis y predicción.
- Ajuste de curvas en ingeniería: calibración de sensores o caracterización de componentes electrónicos donde se necesita una función matemática explícita a partir de datos de prueba.
- Análisis de datos biomédicos: identificación de relaciones entre dosis y respuesta, o entre biomarcadores y progresión de enfermedad, generando ecuaciones utilizables en modelos clínicos.
- Generación de modelos sustitutos: en simulaciones computacionales costosas, el modelo puede aprender una expresión simbólica que aproxime la salida de un simulador, permitiendo evaluaciones rápidas en optimización o análisis de sensibilidad.
- Enseñanza de matemáticas aplicadas: los estudiantes pueden usar el modelo para explorar qué tipo de función se ajusta a un conjunto de datos, fomentando la comprensión de la regresión simbólica.
- Automatización de informes científicos: integrado en pipelines de análisis de datos, el modelo puede generar automáticamente ecuaciones candidatas que luego se validan estadísticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo (arXiv:2602.08885) podría contener evaluaciones, pero no se proporcionan datos concretos en la documentación accesible.

## Requisitos de hardware

- El tamaño del repositorio es de 3.8 GB, lo que sugiere que los pesos del modelo en precisión completa (probablemente FP32 o BF16) ocupan aproximadamente ese espacio. Para inferencia, se necesitaría al menos esa cantidad de memoria VRAM, más overhead de activaciones.
- Con 1B parámetros, el modelo podría ejecutarse en GPUs consumer de gama alta (por ejemplo, RTX 3090, RTX 4090) si se aplica cuantización, aunque no se han publicado versiones cuantizadas.
- No se dispone de datos de latencia ni throughput. Se recomienda usar bibliotecas como PyTorch o el propio repositorio flash-ansr para inferencia.
- Opciones de despliegue: el repositorio GitHub proporciona una API simple (`fit(X, y)`), lo que facilita su integración en entornos Python. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (regresión simbólica neuronal amortizada). Alternativas tradicionales como EQL (Equation Learner) o DSR (Deep Symbolic Regression) existen, pero no se han encontrado datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en regresión simbólica; no es un modelo de propósito general y no puede procesar texto, imágenes ni audio.
- No se han documentado sesgos específicos, pero al ser un modelo numérico, los riesgos de sesgo son limitados. Sin embargo, puede producir expresiones incorrectas o sobreajustadas si los datos de entrada son ruidosos o insuficientes.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir expresiones que se ajustan bien a los datos de entrenamiento pero que no generalizan a nuevos datos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantías de precisión o idoneidad para aplicaciones críticas.
- No se especifican limitaciones de contexto ni de tamaño de entrada, pero el SetTransformer puede manejar conjuntos de puntos de tamaño variable, aunque con un límite práctico dependiente de la memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psaegert/flash-ansr-v23.0-1B
- Repositorio GitHub: https://github.com/psaegert/flash-ansr
- Documentación: https://flash-ansr.readthedocs.io/en/latest/
- Artículo (arXiv): https://arxiv.org/abs/2602.08885
