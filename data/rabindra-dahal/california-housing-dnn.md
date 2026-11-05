# rabindra-dahal/california-housing-dnn

## Resumen

California Housing DNN Regressor es una red neuronal densa (MLP) implementada en PyTorch que predice el valor mediano de viviendas en bloques censales de California. El modelo, publicado por el autor rabindra-dahal en HuggingFace, transforma un vector de 8 características tabulares (procedentes del dataset clásico California Housing de scikit-learn) en un único escalar continuo que representa el precio mediano de la vivienda, expresado en unidades de 100.000 dólares. No es un modelo de lenguaje: es un regresor tabular de propósito muy específico, pensado como referencia educativa y como base para modelos de valoración automatizada (AVM).

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de modelo tabular de tamaño minúsculo (apenas unos miles de parámetros) que se distribuye con licencia MIT y tags de `tabular`, `regression` y `pytorch`. Por otro, sirve como ejemplo de cómo la model card y el model-index de HuggingFace pueden declarar métricas de regresión (MSE y MAE) sin verificación independiente, algo que conviene tener presente al evaluar cualquier modelo de este tipo.

Al tratarse de un MLP de tres capas (8 → 64 → 32 → 1) entrenado sobre datos del censo estadounidense de 1990, sus usos realistas quedan acotados a análisis de tendencias históricas, docencia y experimentación con pipelines tabulares, no a producción comercial de valoración inmobiliaria actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (multilayer perceptron) denso con activaciones ReLU |
| Parametros totales | no disponible (arquitectura 8-64-32-1; el autor no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada de 8 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (el modelo no procesa texto; el tag `en` se refiere al idioma de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el autor no especifica safetensors, GGUF ni checkpoint PyTorch en la información proporcionada) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa totalmente conectado con una capa de entrada de 8 dimensiones, dos capas ocultas de 64 y 32 neuronas respectivamente (ambas con activación ReLU) y una capa de salida de una neurona con activación lineal, adecuada para regresión. La entrada son las 8 características normalizadas del dataset California Housing de scikit-learn (ingresos medianos, antigüedad de la vivienda, ocupación media, número medio de habitaciones, población, latitud y longitud, entre otras), y la salida es el valor mediano de la vivienda escalado en unidades de 100.000 USD.

El entrenamiento se realizó durante 2.000 épocas con descenso de gradiente a batch completo y optimizador Adam con tasa de aprendizaje 0,01. No se documenta en la información disponible el número de tokens (no aplica), la composición del dataset más allá de la referencia a `california_housing`, ni si hubo regularización, dropout, early stopping o ajuste fino adicional. El autor sí publica las magnitudes medias absolutas de los pesos de la matriz de entrada como proxy de importancia de características: `AveOccup` (0,6873), `Latitude` (0,3908), `Longitude` (0,3143) y `AveRooms` (0,2797).

## Capacidades

- Regresión tabular sobre 8 características numéricas del dataset California Housing.
- Predicción de un escalar continuo (valor mediano de vivienda en unidades de 100.000 USD).
- Inferencia rápida y de bajo coste computacional, apta para CPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión, audio ni ninguna capacidad multimodal.
- No ofrece generación de texto, código ni matemáticas simbólicas.

## Casos de uso

- Análisis de tendencias inmobiliarias históricas: el modelo permite estimar valores medianos de vivienda sobre datos del censo de 1990 y comparar la evolución de precios por zona geográfica, siempre con la advertencia de sesgo temporal que el propio autor señala.
- Modelo base para valoración automatizada (AVM): sirve como punto de partida para construir pipelines de valoración inmobiliaria que luego se reentrenen con datos de mercado actuales y features adicionales.
- Docencia y tutoriales de deep learning tabular: al ser un MLP pequeño con arquitectura explícita (8-64-32-1), es un ejemplo didáctico para enseñar normalización de features, entrenamiento con Adam y evaluación con MSE/MAE.
- Benchmark de referencia para pipelines tabulares: útil para comparar el rendimiento de modelos más complejos (gradient boosting, random forest) frente a una red neuronal sencilla sobre el mismo dataset.
- Experimentación con importancia de características: las magnitudes de pesos publicadas permiten estudiar qué variables dominan la predicción y contrastarlas con métodos como SHAP o permutation importance.
- Pruebas de integración en entornos de inferencia: al ser un modelo minúsculo, se puede desplegar en servicios de inferencia ligeros (por ejemplo, endpoints REST con PyTorch o ONNX) para validar pipelines de CI/CD antes de escalar a modelos mayores.
- Investigación sobre sesgos geográficos: las coordenadas de latitud y longitud acotan las predicciones a California, lo que permite estudiar cómo el modelo falla fuera de su dominio de entrenamiento.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index (no verificados de forma independiente) son los siguientes:

| Metrica | Valor | Verificado |
|---|---|---|
| Test MSE | 0,2697 | No |
| Test MAE | 0,35397 | No |

El autor indica además una pérdida final de entrenamiento (MSE) de 0,2210 y una MAE media de 35.397,36 USD en valor real. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un regresor tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo es un MLP de tres capas que cabe en memoria de CPU y en cualquier GPU consumer.
- GPU recomendadas: innecesarias; cualquier CPU moderna es suficiente. Si se desea GPU, una GTX 1650 o superior basta.
- Cabe en consumer GPU: sí, en cualquier GPU consumer, e incluso en CPU y en dispositivos de baja potencia.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX, TorchScript o integración en servicios ligeros (FastAPI, Flask). No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño del modelo, la latencia esperada es de microsegundos a milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| California Housing DNN Regressor | MLP tabular | no disponible (8-64-32-1) | no aplica | MSE 0,2697; MAE 0,35397 (declarados) | MIT | HuggingFace |
| Regresión lineal (scikit-learn) | Modelo lineal | 8 coeficientes | no aplica | no disponible | BSD-3-Clause | scikit-learn |
| Random Forest Regressor (scikit-learn) | Ensemble de árboles | no disponible | no aplica | no disponible | BSD-3-Clause | scikit-learn |
| Gradient Boosting (scikit-learn) | Ensemble de árboles | no disponible | no aplica | no disponible | BSD-3-Clause | scikit-learn |

No se dispone de resultados de benchmarks comparables publicados en la información proporcionada para estos modelos alternativos sobre el mismo split del dataset California Housing.

## Limitaciones y advertencias

- Sesgo temporal: el modelo se entrenó con datos del censo estadounidense de 1990; las salidas de precio absoluto no reflejan las condiciones de mercado actuales sin ajuste por inflación y recalibración.
- Sesgo geográfico: las predicciones están ligadas a coordenadas de California; coordenadas fuera de esa región producen salidas poco fiables debido a los límites del escalado estándar.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir predicciones erróneas o extrapolaciones no válidas fuera de su dominio de entrenamiento.
- Limitaciones de contexto e idioma: no procesa texto ni contexto conversacional; el tag `en` se refiere únicamente al idioma de la documentación.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y aviso de copyright; conviene revisar los términos exactos del dataset California Housing, que tiene su propia licencia.
- Caveat para producción: las métricas declaradas (MSE y MAE) no están verificadas de forma independiente; antes de usar el modelo en producción, conviene reproducir la evaluación sobre un split propio y comprobar la calibración de las salidas.
- Ausencia de información sobre formato de pesos y cuantización: dificulta la integración directa en pipelines que esperan safetensors, GGUF u ONNX sin conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rabindra-dahal/california-housing-dnn
- Dataset California Housing (scikit-learn): https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html
- PyTorch: https://pytorch.org/
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales asociados a este modelo.
