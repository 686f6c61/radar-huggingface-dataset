# OluwafisayoIbrahim/solar-power-prediction

## Resumen

El repositorio `OluwafisayoIbrahim/solar-power-prediction` no contiene un modelo de lenguaje ni una red neuronal profunda de gran escala, sino un conjunto de modelos de regresión tabular orientados a estimar la potencia de salida de paneles solares en vatios a partir de mediciones ambientales y eléctricas. Lo publica el usuario OluwafisayoIbrahim como acompañamiento de un proyecto de reimplementación en Python de un trabajo previo realizado en MATLAB con redes neuronales artificiales. El paquete incluye regresión lineal, redes neuronales de scikit-learn con y sin ajuste de hiperparámetros, y redes en TensorFlow/Keras y PyTorch.

La relevancia del artefacto es metodológica y docente más que de producción: plantea dos pistas de entrada (una con corriente y tensión, otra solo con variables ambientales y hora del día) y evalúa con validación cruzada agrupada por día de origen de los ficheros. La pista A adolece de una fuga de información evidente, ya que la potencia es aproximadamente el producto de corriente por tensión, lo que convierte la tarea en casi una identidad física. La pista B es la interesante desde el punto de vista del aprendizaje, porque obliga al modelo a inferir potencia sin esas dos variables.

El conjunto de datos es muy pequeño: 189 observaciones procedentes de 21 grupos de ficheros fuente, con unas nueve mediciones por grupo tomadas entre las 08:00 y las 16:00 en la Universidad Olabisi Onabanjo. El autor advierte explícitamente de que los modelos no están validados para predicción futura, sino para estimación contemporánea bajo condiciones comparables a las de recogida. No hay información sobre licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal, perceptrón multicapa de una capa oculta (scikit-learn), y ANN de capas densas en TensorFlow/Keras y PyTorch |
| Parametros totales | no disponible (depende de la variante; las arquitecturas candidatas son `(10,)` y `(16, 8)` en las ANN profundas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, una fila de entrada por predicción) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los artefactos son Keras y joblib) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto, solo valores numéricos) |
| Licencia | no disponible |
| Formato de pesos | Keras (TensorFlow), joblib (scikit-learn), PyTorch; el repositorio ocupa 0.0 GB |

## Arquitectura y entrenamiento

El artefacto agrupa varias familias de modelos. La regresión lineal se entrena sobre entradas estandarizadas. La ANN sin ajustar de scikit-learn usa una capa oculta de 10 unidades con activación `tanh`, optimizador `lbfgs` y penalización L2 de `0.0001`. La ANN ajustada busca el tamaño de capa oculta en `{3, 10}` y la penalización L2 en `{0.1, 1, 10}` dentro de validación cruzada agrupada. Las variantes de TensorFlow/Keras y PyTorch emplean capas ocultas `(10,)` o `(16, 8)`, activación `tanh`, salida lineal, optimizador Adam con tasa de aprendizaje `0.01`, L2 `0.0001`, tamaño de lote 16 y un tope de 1000 épocas, con parada temprana basada en MAE de validación y paciencia 30.

El protocolo de evaluación usa siete particiones externas `GroupKFold` sobre grupos derivados del nombre de fichero, con tres grupos retenidos por partición, y semillas 0, 1 y 2 para los experimentos neuronales. Las métricas se calculan sobre predicciones fuera de partición agrupadas sobre las 189 filas y luego se promedian entre semillas. No se trata de una validación cronológica ni de una prueba independiente de los modelos finales, que se reajustan sobre todas las observaciones. La selección de arquitectura S2 se hizo mediante una regla declarada de cribado por tope de épocas, no por el menor error externo, y el proceso de investigación ya había inspeccionado resultados históricos, por lo que el autor reconoce que las comparaciones requieren confirmación independiente.

## Capacidades

- Regresión tabular: predice un único valor de potencia en vatios por fila de entrada.
- Dos modos de entrada: pista A con `solar_irradiance`, `current`, `voltage`, `temperature` y `humidity`; pista B con `solar_irradiance`, `temperature`, `humidity` y `hour`.
- Manejo de hora fraccionaria: acepta valores como `12.5` para las 12:30.
- Validación de entradas numéricas finitas; no se documenta tratamiento de valores faltantes o categóricos.
- Selección automática de columnas en los helpers de TensorFlow y PyTorch mediante metadatos guardados; en scikit-learn hay que preservar el orden de características manualmente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Docencia y formación en regresión tabular: sirve para ilustrar el flujo completo de un proyecto de aprendizaje automático con un conjunto pequeño, incluyendo estandarización, validación cruzada agrupada y comparación entre regresión lineal y redes neuronales.
- Estudio de fugas de información: la pista A permite demostrar de forma empírica cómo incluir variables que determinan casi algebraicamente el objetivo (`power = current * voltage`) infla las métricas y produce un atajo que no generaliza.
- Comparación de frameworks: el repositorio permite contrastar implementaciones equivalentes en scikit-learn, TensorFlow/Keras y PyTorch bajo un mismo protocolo de evaluación, útil para material didáctico o para verificar reproducibilidad entre librerías.
- Prototipado de sensórica solar en laboratorio: con mediciones de piranómetro, multímetro y panel bajo condiciones controladas, puede usarse como referencia preliminar para estimar potencia a partir de irradiancia, temperatura y humedad.
- Análisis de sensibilidad de variables ambientales: la pista B permite explorar cuánto aportan irradiancia, temperatura, humedad y hora del día a la estimación de potencia cuando no se dispone de medidas eléctricas directas.
- Reproducción de trabajos previos: sirve como reimplementación en Python de un proyecto MATLAB con ANN, útil para quienes necesiten migrar flujos antiguos a un stack moderno y comparar resultados.
- Ejercicio de auditoría de datos: el propio autor documenta duplicados entre ficheros (`solar_data_tue_21st.csv` y `solar_data_tue_28st.csv`) y lo usa como caso práctico de por qué hay que auditar particiones antes de confiar en métricas de validación.

## Benchmarks y rendimiento

Resultados agrupados fuera de partición sobre 189 filas, redondeados, según los informes del proyecto. No constituyen una prueba independiente de los modelos finales reajustados sobre todos los datos.

| Pista | Modelo | MAE (W) | RMSE (W) | MAPE (%) | R² |
|---|---|---:|---:|---:|---:|
| A | Física: corriente × tensión | 1.168 | 1.321 | 0.445 | 0.998 |
| A | Regresión lineal | 0.992 | 1.24 | no disponible en el extracto | no disponible en el extracto |
| B | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados completos de las variantes neuronales (scikit-learn ajustada, TensorFlow S2, PyTorch S2) ni de la pista B. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable. Las arquitecturas documentadas tienen como máximo dos capas ocultas de 16 y 8 unidades sobre 4 o 5 características de entrada; el modelo cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA o ROCm sirve para inferencia por lotes; una RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en placas integradas.
- Opciones de despliegue: inferencia directa con Keras/TensorFlow, PyTorch o scikit-learn cargando los artefactos del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño de las redes, se espera latencia de microsegundos a milisegundos por fila en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con el mismo conjunto de datos o el mismo protocolo. Como referencia conceptual, se puede comparar con la propia línea base física del proyecto:

| Modelo | Parametros | Contexto | MAE (W) pista A | Licencia | Disponibilidad |
|---|---|---|---|---|
| Física (corriente × tensión) | 0 | no aplica | 1.168 | no aplica | cálculo directo |
| Regresión lineal del repo | no disponible | no aplica | 0.992 | no disponible | Hugging Face |
| ANN scikit-learn / TF / PyTorch del repo | hasta decenas de unidades por capa | no aplica | no disponible en el extracto | no disponible | Hugging Face |

No disponible para el resto de alternativas.

## Limitaciones y advertencias

- Conjunto de datos minúsculo: 189 observaciones de 21 grupos, con intervalos de medición de 35 a 92 minutos, por lo que el muestreo es aproximadamente horario pero no uniforme.
- Duplicados documentados: la auditoría del 2026-11-05 identificó nueve registros repetidos entre dos ficheros, y los 21 grupos no están verificados como fechas de recogida únicas. Esto puede producir filas idénticas entre particiones de entrenamiento y prueba y contaminar las métricas.
- No validado para predicción futura: el propio autor indica que los modelos estiman potencia a partir de mediciones contemporáneas y no han sido validados para forecasting.
- Fuga de información en la pista A: incluir corriente y tensión convierte la tarea en casi una identidad física; las métricas de esa pista no deben interpretarse como capacidad predictiva real.
- Generalización limitada: no hay evidencia de validez para otras instalaciones, otras configuraciones de panel, condiciones nocturnas, despacho de red, controles de seguridad ni planificación financiera.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni redistribución de los pesos o de los datos.
- Idiomas: la etiqueta `en` es nominal; el modelo no procesa texto.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de extrapolación silenciosa fuera del rango de las variables de entrenamiento.
- Proceso de selección de modelo con posible sesgo: la arquitectura S2 se eligió con una regla de cribado por tope de épocas y tras haber inspeccionado resultados históricos, por lo que las comparaciones necesitan confirmación independiente.
- Sin métricas publicadas para varias variantes: no se pueden comparar todas las familias con los datos disponibles en el extracto.

## Enlaces

- Hugging Face: https://huggingface.co/OluwafisayoIbrahim/solar-power-prediction
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
