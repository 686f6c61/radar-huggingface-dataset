# fromziro/JetonCount

## Resumen

JetonCount es un modelo de regresión basado en un perceptrón multicapa (MLP) de apenas 7.009 parámetros, desarrollado por fromziro (Paul Courneya y Jonathon Ly) para estimar el número de tokens que generaría un texto sin necesidad de ejecutar un tokenizador. A diferencia de los modelos de lenguaje convencionales, no procesa texto directamente, sino que recibe siete características numéricas del texto (número de caracteres, palabras, longitud media de palabra, etc.) y devuelve una predicción del recuento de tokens. Su objetivo es ofrecer una alternativa mucho más rápida que un tokenizador real, con una latencia de microsegundos, a costa de una precisión aproximada.

El modelo se entrenó sobre 22 millones de filas generadas con 28 tokenizadores distintos y nueve fuentes de datos (matemáticas, código, texto educativo, web general, redes sociales y datos de instrucción), lo que le permite generalizar a una amplia variedad de estilos de texto. Con un error absoluto medio (MAE) de 157 tokens en el conjunto de prueba, resulta útil para tareas donde la velocidad importa más que la exactitud, como la estimación de costes de API, el etiquetado masivo de datasets o la monitorización en tiempo real. Su tamaño reducido permite ejecutarlo en cualquier CPU, incluso en entornos con recursos mínimos.

La relevancia actual de JetonCount radica en el creciente coste de las APIs de modelos de lenguaje y la necesidad de estimar rápidamente el consumo de tokens antes de realizar llamadas. Aunque no sustituye a un tokenizador cuando se requiere precisión exacta, su velocidad lo convierte en una herramienta interesante para la investigación y la optimización de costes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con 8 capas ocultas de 32 unidades y activación SiLU |
| Parametros totales | 7.009 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica (modelo de regresión sobre características numéricas, no procesa texto secuencial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (entrenado principalmente con datos en inglés; las características son independientes del idioma) |
| Licencia | Apache-2.0 (ver enlace de licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

JetonCount es un MLP de 8 capas ocultas con 32 unidades por capa y activación SiLU, seguido de dropout con tasa 0.005. La entrada tiene una dimensión de 19, que combina las 7 características crudas (chars, words, avg_chars_per_word, longest_word_chars, symbol_ratio, punctuation_ratio, vocab_size) con características derivadas mediante transformación log1p. El modelo se entrenó en PyTorch con precisión float32, usando el optimizador AdamW (betas 0.9 y 0.95), tasa de aprendizaje con decaimiento de 6e-3 a 3e-6, 3 épocas, batch size de 32.000, gradiente acumulado en 1 paso y clipping de gradiente a 1.0. El conjunto de datos contiene 22 millones de filas generadas con 28 tokenizadores (vocabularios de 250 a 256.000) y 9 fuentes de texto (matemáticas, código, texto educativo, web general, Reddit y datos de instrucción). No se aplicaron técnicas de RLHF ni DPO; es un problema de regresión supervisada. La innovación principal es su tamaño extremadamente reducido, que permite una inferencia más rápida que un tokenizador real, especialmente en textos largos.

## Capacidades

- Regresión para estimar el número de tokens de un texto a partir de características numéricas.
- No es un modelo generativo: no produce texto, ni código, ni respuestas.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Puede aplicarse a cualquier texto siempre que se calculen las 7 características de entrada.
- Entrenado con una amplia variedad de tokenizadores, lo que le permite generalizar a distintos esquemas de tokenización.
- Inferencia en tiempo real con latencias del orden de microsegundos (0,24 ms a 5,3 ms según la longitud del texto).
- Capacidad de ejecución en CPU sin requisitos especiales de hardware.

## Casos de uso

- Estimación de costes de API: antes de enviar una solicitud a un LLM, se calculan las características del texto y se predice el número de tokens para estimar el coste de la llamada. Es útil para aplicaciones con presupuesto limitado o para optimizar el uso de APIs de pago.
- Etiquetado de datasets: al construir datasets de entrenamiento, se puede añadir una columna con el número estimado de tokens sin necesidad de tokenizar cada muestra, acelerando el proceso de preparación de datos.
- Investigación educativa: permite estudiar cómo diferentes características del texto (longitud, vocabulario, puntuación) se correlacionan con el recuento de tokens en distintos tokenizadores, lo que resulta útil para comprender el comportamiento de los tokenizadores.
- Optimización de prompts: comparar varias versiones de un prompt para elegir la que probablemente genere menos tokens, reduciendo costes en aplicaciones que dependen de APIs de pago.
- Filtrado de texto: en pipelines de procesamiento, descartar rápidamente textos que excedan un límite de tokens estimado antes de pasarlos a un modelo con contexto limitado, ahorrando tiempo y recursos.
- Monitorización en tiempo real: en aplicaciones de streaming de texto, estimar el consumo de tokens en tiempo real para controlar cuotas o facturación sin añadir latencia significativa.
- Experimentación y demostraciones: dado su tamaño mínimo, es fácil de integrar en proyectos de aprendizaje, demos o entornos con recursos muy limitados.

## Benchmarks y rendimiento

El modelo reporta las siguientes métricas en los conjuntos de entrenamiento, evaluación y prueba:

| Metrica | Train | Eval | Test |
|---|---|---|---|
| R² | 0,9513 | 0,9739 | 0,9718 |
| MSE | 938.621,65 | 480.722,18 | 388.793,84 |
| RMSE | 968,82 | 693,34 | 623,53 |
| MAE | 192,06 | 163,20 | 157,27 |
| MRE | 0,1378 | 0,1073 | 0,1051 |
| Varianza explicada | 0,9513 | 0,9739 | 0,9718 |

En cuanto a velocidad, el autor compara la latencia del modelo con la de un tokenizador real (FromZero/Er-Tiny-1.3M) para distintos tamaños de texto:

| Tokens reales | Latencia del modelo (ms) | Latencia del tokenizador (ms) |
|---|---|---|
| 197 | 0,2429 | 0,4134 |
| 1.333 | 0,3409 | 1,8775 |
| 5.973 | 0,9827 | 7,6504 |
| 18.569 | 5,2890 | 28,8244 |

En un ejemplo concreto, un texto de Wikipedia con 139 tokens reales fue predicho como 190,54 por el modelo, con una latencia de 0,2446 ms frente a 0,3174 ms del tokenizador. No se han publicado comparaciones con otros modelos de regresión similares.

## Requisitos de hardware

- Inferencia en CPU: cualquier CPU moderna es suficiente; el entrenamiento se realizó en un Ryzen 5 2600.
- No requiere GPU ni VRAM; el modelo tiene solo 7.009 parámetros.
- Tamaño del modelo: extremadamente ligero, ocupa unos pocos kilobytes en float32.
- Opciones de despliegue: PyTorch con la API de Transformers (AutoModel), exportación a ONNX o integración en aplicaciones web o móviles.
- Latencia: entre 0,24 ms y 5,3 ms según la longitud del texto (medida en el hardware de referencia).
- Throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se han identificado modelos comparables en el ecosistema de HuggingFace que realicen estimación de tokens mediante regresión. La alternativa natural es usar un tokenizador real, que ofrece una precisión exacta pero con una latencia mayor, especialmente en textos largos. JetonCount se posiciona como una opción de compromiso entre velocidad y precisión, sin rivales directos conocidos.

## Limitaciones y advertencias

- Es una aproximación, no un tokenizador real; el error puede ser significativo en textos fuera de la distribución de entrenamiento.
- La precisión depende de la correcta extracción de las características de entrada; errores en el cálculo de estas características degradan la predicción.
- Degradación del rendimiento con vocabularios de tokenizador superiores a 128.000 y con textos de menos de 32 tokens.
- No realiza tokenización real, por lo que no debe usarse cuando se requiere un recuento exacto de tokens.
- La licencia declarada es Apache-2.0, pero el enlace de licencia apunta al repositorio fromziro/Er-Tiny-1.3M, que debe revisarse antes de un uso comercial.
- No se documentan sesgos específicos, pero al estar entrenado con datos mayoritariamente en inglés, la precisión puede verse afectada en otros idiomas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/fromziro/JetonCount)
- [Space de demostración](https://huggingface.co/spaces/fromziro/JetonCount)
- [Dataset de entrenamiento](https://huggingface.co/datasets/fromziro/jetoncount_corpus)
- [Lista de tokenizadores utilizados](https://huggingface.co/fromziro/JetonCount/blob/main/tokenizers_used.txt)
- [Lista de datasets utilizados](https://huggingface.co/fromziro/JetonCount/blob/main/datasets_used.txt)
- [Licencia](https://huggingface.co/fromziro/Er-Tiny-1.3M/blob/main/LICENSE.txt)
