# psaegert/flash-ansr-v23.0-3M

## Resumen

Flash-ANSR v23.0-3M es un modelo de regresión simbólica neural amortizada desarrollado por Saegert y Köthe, presentado en el artículo *Breaking the Simplification Bottleneck in Amortized Neural Symbolic Regression* (ICML 2026). El modelo está diseñado para mapear datos tabulares (pares X, y) a expresiones simbólicas de forma directa y rápida, sin necesidad de entrenamiento específico por problema. Su nombre indica una versión con aproximadamente 3 millones de parámetros, lo que lo convierte en una opción ligera y adecuada para entornos con recursos limitados.

La arquitectura combina un codificador SetTransformer, un decodificador Transformer y un refinador de constantes, lo que permite recuperar expresiones matemáticas cerradas a partir de datos numéricos. El modelo se distribuye bajo licencia MIT y se acompaña de una biblioteca Python (`flash-ansr`) que facilita su uso mediante una API simple: cargar el modelo preentrenado y llamar a `fit(X, y)`. Su relevancia actual radica en la creciente demanda de herramientas de descubrimiento científico automatizado y análisis simbólico de datos, donde la velocidad y la interpretabilidad son críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetTransformer encoder + Transformer decoder + constant refiner |
| Parametros totales | 3 millones (según nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (trabaja con datos numéricos tabulares, no con lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida específica para regresión simbólica: un codificador SetTransformer procesa los datos tabulares de entrada (conjuntos de pares X, y) y genera una representación latente invariante al orden; un decodificador Transformer autoregresivo genera la secuencia de tokens que componen la expresión simbólica; y un refinador de constantes ajusta los coeficientes numéricos de la expresión para mejorar la precisión. Esta combinación permite que el modelo aprenda a simplificar expresiones de manera implícita durante el entrenamiento, abordando el cuello de botella de simplificación mencionado en el título del artículo.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset o si se emplearon técnicas como RLHF o DPO. El artículo arXiv (2602.08885) es la fuente principal, pero su contenido completo no está disponible en la información proporcionada. La biblioteca `flash-ansr` permite tanto usar modelos preentrenados como entrenar nuevos modelos, lo que sugiere que el entrenamiento es reproducible con la infraestructura publicada.

## Capacidades

- Regresión simbólica amortizada: dado un conjunto de datos tabulares (X, y), el modelo devuelve una expresión simbólica que aproxima la relación subyacente.
- Inferencia rápida: al ser un modelo pequeño (3M parámetros), la inferencia es ligera y apta para aplicaciones en tiempo real o integración en pipelines de análisis.
- Refinamiento de constantes: incluye un paso de optimización de constantes para mejorar la precisión numérica de las expresiones generadas.
- Entrenamiento personalizado: la biblioteca permite entrenar nuevos modelos con datos propios, adaptando la regresión simbólica a dominios específicos.
- Sin dependencia de lenguaje natural: opera directamente sobre datos numéricos, lo que lo hace independiente del idioma.
- Interfaz simple: API `fit(X, y)` que abstrae todo el proceso de generación y simplificación.

## Casos de uso

- Descubrimiento de leyes físicas: investigadores pueden alimentar el modelo con mediciones experimentales (por ejemplo, posición y tiempo) y obtener una ecuación candidata que describa el fenómeno, acelerando la formulación de hipótesis.
- Análisis de datos científicos: en biología, química o economía, el modelo puede extraer relaciones funcionales entre variables a partir de datos observacionales, facilitando la interpretación de modelos complejos.
- Ingeniería inversa de sistemas: dado un conjunto de entradas y salidas de un sistema (por ejemplo, un circuito o un proceso industrial), el modelo puede reconstruir una fórmula aproximada que sirva como modelo sustituto.
- Generación de features simbólicas para machine learning: las expresiones obtenidas pueden usarse como características interpretables en modelos de mayor escala, mejorando la transparencia.
- Validación de simulaciones numéricas: comparar expresiones simbólicas generadas por el modelo con ecuaciones conocidas de simulaciones para detectar errores o simplificaciones excesivas.
- Educación y divulgación: como herramienta didáctica para explorar relaciones matemáticas en datos, mostrando cómo los datos pueden resumirse en fórmulas compactas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (arXiv:2602.08885) podría contener métricas comparativas, pero no se incluyen en la model card ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 3 millones de parámetros, el uso de memoria es mínimo: en FP32 ocuparía unos 12 MB, y en cuantización de 8 bits unos 3 MB.
- Puede ejecutarse en CPU sin problemas; una GPU no es estrictamente necesaria para inferencia.
- En caso de usar GPU, cualquier modelo moderno con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) es más que suficiente.
- Para entrenamiento personalizado, se recomienda una GPU con al menos 8 GB de VRAM para mayor comodidad, aunque el tamaño del modelo permite entrenar incluso en CPU con datasets pequeños.
- Opciones de despliegue: la biblioteca `flash-ansr` es la vía principal; también puede exportarse a formatos estándar (ONNX, etc.) si se desea integrar en otros entornos, aunque no se documenta explícitamente.
- No se dispone de datos oficiales de latencia o throughput; dada la arquitectura ligera, se espera una inferencia en milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de regresión simbólica (por ejemplo, EQL, AI Feynman, PySR). El modelo se presenta como una solución amortizada y rápida, pero no hay datos públicos de rendimiento relativo en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o limitaciones específicas del modelo; al ser un modelo entrenado para datos numéricos, su comportamiento depende del dominio de entrenamiento.
- Riesgo de alucinación simbólica: como cualquier modelo generativo, puede producir expresiones que se ajustan a los datos pero no representan la verdadera relación subyacente, especialmente con ruido o datos insuficientes.
- Limitaciones de contexto: no se especifica la longitud máxima de datos de entrada; es probable que conjuntos muy grandes requieran submuestreo o particionado.
- Licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar el artículo para conocer las condiciones de atribución si se utiliza en publicaciones.
- La versión v23.0-3M es específica; existen otras versiones (por ejemplo, v23.2-120M) que pueden ofrecer mayor capacidad pero con mayores requisitos.
- No se proporcionan garantías de precisión en dominios fuera de los datos de entrenamiento; es recomendable validar las expresiones generadas con datos de prueba.

## Enlaces

- HuggingFace: https://huggingface.co/psaegert/flash-ansr-v23.0-3M
- GitHub: https://github.com/psaegert/flash-ansr
- Documentación: https://flash-ansr.readthedocs.io/en/latest/
- Artículo arXiv: https://arxiv.org/abs/2602.08885
- Modelo relacionado (v23.2-120M): https://huggingface.co/psaegert/flash-ansr-v23.2-120M
