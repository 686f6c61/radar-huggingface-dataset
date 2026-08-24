# limved/tiny-forecaster

## Resumen

TinyForecaster es un modelo de forecasting de series temporales puramente educativo, desarrollado por Vedant Limaye (usuario limved) como proyecto de aprendizaje para comprender cómo funcionan los modelos fundacionales de series temporales a pequeña escala. Con aproximadamente 72.000 parámetros, emplea una arquitectura transformer basada en parches (patch-based) que recibe un contexto de 96 pasos temporales y predice los siguientes 42. El modelo fue entrenado exclusivamente con 6.000 series sintéticas (tendencia, estacionalidad, ruido y escala aleatorizados) durante 20 épocas en un único núcleo de CPU, y posteriormente evaluado en zero-shot sobre datos reales de ventas minoristas.

El autor es explícito en que no se trata de un modelo de producción ni competitivo con alternativas reales como Chronos, TimesFM o t0-alpha. Su valor reside en el ejercicio didáctico: documenta de forma honesta un benchmark zero-shot contra métodos clásicos (SARIMA, Prophet, Holt-Winters) y un modelo fundacional real, obteniendo un MAPE de 24,87% frente al 6,53% de t0-alpha. La relevancia actual de esta ficha radica en que ejemplifica las limitaciones de los modelos entrenados solo con datos sintéticos y sirve como referencia para quienes estudian arquitecturas de forecasting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en parches (patch-based), 2 capas encoder, 4 cabezas de atencion, embeddings de 32 dimensiones |
| Parametros totales | ~72.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 pasos de entrada, 42 pasos de salida |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (fichero .pt, no safetensors) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer encoder con tokenización por parches. La secuencia de entrada de 96 pasos se normaliza por su propia media y desviación estándar, y se divide en 12 parches de 8 pasos cada uno. Cada parche se proyecta a un espacio de 32 dimensiones y se procesa con un encoder de 2 capas y 4 cabezas de atención. Una cabeza lineal final proyecta la representación a una predicción de 42 pasos, que se desnormaliza para devolverla a la escala original.

El entrenamiento se realizó sobre 6.000 series sintéticas generadas con tendencia, estacionalidad, ruido y escala aleatorizados, durante 20 épocas en un solo núcleo de CPU. No se empleó RLHF ni DPO, ni ningún ajuste fino con datos reales. La innovación técnica principal es la demostración de que un transformer diminuto puede aprender patrones básicos de series temporales, pero también evidencia la fragilidad de generalizar a patrones no vistos en el entrenamiento, como caídas periódicas a cero en datos reales de ventas.

## Capacidades

- Predicción de series temporales univariantes: dado un contexto de 96 observaciones, genera un pronóstico de 42 pasos.
- Funcionamiento zero-shot: evaluado directamente sobre datos reales sin reentrenamiento.
- Normalización interna por media y desviación estándar de cada serie, lo que permite manejar escalas variables.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural.
- Capacidad multilingüe: no aplica, al ser un modelo numérico.

## Casos de uso

- Proyecto educativo de arquitecturas de forecasting: permite a estudiantes e investigadores comprender el flujo completo de un modelo fundacional de series temporales, desde la tokenización por parches hasta la evaluación zero-shot, con un coste computacional mínimo.
- Benchmark docente de métodos clásicos vs. aprendizaje profundo: el repositorio incluye una comparación honesta con SARIMA, Prophet y Holt-Winters, útil para ilustrar cuándo los modelos estadísticos superan a los neuronales en datos con patrones estacionales marcados.
- Experimentación con datos sintéticos: sirve como banco de pruebas para estudiar el efecto de la distribución de entrenamiento en la generalización, por ejemplo, añadiendo patrones de caídas a cero y observando cómo mejora el MAPE.
- Demostración de despliegue en entornos con recursos limitados: al tener solo 72.000 parámetros, puede ejecutarse en una Raspberry Pi o incluso en microcontroladores, aunque no se ha probado oficialmente.
- Análisis de errores en forecasting: el fallo documentado (no predecir caídas periódicas a cero) es un caso de estudio valioso para enseñar a diagnosticar sesgos de datos sintéticos.
- Comparativa de frameworks de inferencia: al ser un modelo PyTorch estándar, puede utilizarse para probar pipelines de serialización, cuantización o exportación a ONNX en contextos académicos.

## Benchmarks y rendimiento

El autor publica un único resultado de evaluación zero-shot sobre un conjunto real de ventas minoristas retenido (42 días). No se han realizado benchmarks formales adicionales. La siguiente tabla resume los datos disponibles:

| Modelo | MAPE zero-shot (ventas minoristas) |
|---|---|
| TinyForecaster | 24,87% |
| t0-alpha | 6,53% |
| SARIMA | mejor que TinyForecaster (valor exacto no publicado) |
| Prophet | mejor que TinyForecaster (valor exacto no publicado) |
| Holt-Winters | mejor que TinyForecaster (valor exacto no publicado) |

No se dispone de resultados en MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje, ya que el modelo no está diseñado para tareas de texto.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB (el modelo ocupa aproximadamente 288 KB en float32, 72.000 parámetros × 4 bytes).
- GPU recomendada: ninguna; se ejecuta sin problemas en CPU, incluso en un solo núcleo.
- Compatibilidad con hardware de consumo: total, incluyendo portátiles básicos, Raspberry Pi y microcontroladores con soporte PyTorch.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX posible, aunque no se ha documentado. No hay soporte oficial para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo de 72.000 parámetros, la inferencia es del orden de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa técnica completa con otros modelos de forecasting (Chronos, TimesFM, t0-alpha) en cuanto a parámetros, contexto o licencia. El propio autor reconoce que TinyForecaster no es competitivo. La única comparación cuantitativa disponible es el MAPE mencionado anteriormente. Se recomienda consultar las fichas de los modelos fundacionales reales para obtener especificaciones detalladas.

## Limitaciones y advertencias

- Modelo exclusivamente educativo: no debe utilizarse en producción ni para tomar decisiones reales de negocio.
- Entrenado solo con datos sintéticos: no generaliza a patrones no incluidos en la distribución de entrenamiento, como caídas periódicas a cero en ventas minoristas.
- Rendimiento inferior a métodos clásicos: SARIMA, Prophet y Holt-Winters superan al modelo en el benchmark publicado.
- Sin soporte para series multivariantes, exógenas o con missing values.
- No se han documentado sesgos adicionales, pero al ser un modelo numérico, no presenta sesgos lingüísticos o culturales.
- Licencia MIT permite uso comercial, pero el autor desaconseja explícitamente su uso en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/limved/tiny-forecaster
- Repositorio GitHub: https://github.com/Vedantl39/tiny-timeseries-foundation-model
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/geoffrey-negiar (mencionado en la model card como mentor, no como autor)
