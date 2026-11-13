# iaac-maai/day4-group8-affordability-mlp

## Resumen

El modelo `iaac-maai/day4-group8-affordability-mlp` es un perceptrón multicapa (MLP) de muy pequeno tamano desarrollado por el grupo 8 del curso AI Methods I del IAAC MaAI (2026/27). Su tarea es la predicción tabular: estimar el cambio de asequibilidad de la vivienda de un país para el año siguiente (`year + 1`) a partir de 17 indicadores de vivienda y renta conocidos en el año actual. La arquitectura es una red `Linear(26, 32) → ReLU → Dropout(0.2) → Linear(32, 32) → ReLU → Dropout(0.2) → Linear(32, 1)`, con 1.953 parámetros entrenables, entrenada desde cero sobre 26 países y el periodo 1977–2009.

El modelo no predice el nivel absoluto de asequibilidad, sino el cambio estandarizado del logaritmo decimal de la asequibilidad, que se reconstruye mediante una transformación inversa con los parámetros de escalado almacenados en `scaler.joblib`. Está pensado como una herramienta de alerta temprana a un año vista para analistas de política de vivienda, y como contraparte neuronal del modelo Ridge lineal del mismo grupo (Day 2). Su relevancia es fundamentalmente didáctica y metodológica: sirve para comparar el rendimiento de una red neuronal frente a una regresión lineal en un problema tabular de series temporales cortas.

Los resultados publicados muestran que el MLP prácticamente empata con la regresión Ridge (MAE de 3,22 frente a 3,28 puntos de índice en el conjunto de test 2015–2024), sin superarla de forma clara, y que ambos baten ligeramente al baseline ingenuo de "el próximo año igual a este año" (3,74). El modelo es de código abierto bajo licencia MIT, pero su ámbito de aplicación está estrictamente acotado a los 26 países y al horizonte de un año.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP: `Linear(26, 32)` → ReLU → Dropout(0.2) → `Linear(32, 32)` → ReLU → Dropout(0.2) → `Linear(32, 1)` |
| Parametros totales | 1.953 (todos entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, sin contexto de secuencia) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos en `state_dict` de PyTorch) |
| Idiomas soportados | no disponible (no procesa texto; entrada tabular numérica) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (`state_dict` de PyTorch, ~10 kB) + `scaler.joblib` (preprocesador y parámetros de escalado) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa totalmente conectado con dos capas ocultas de 32 neuronas, activación ReLU y dropout de 0,2 tras cada capa oculta. La entrada es un vector de 26 dimensiones obtenido al aplicar un `ColumnTransformer` de scikit-learn (imputación por mediana y escalado estándar) sobre las 17 columnas originales; la columna `decade` se codifica de forma ordinal (0–5) sin escalar. La salida es un único escalar `z` que representa el cambio estandarizado del logaritmo decimal de la asequibilidad, y la predicción final se reconstruye como `10 ** (log10(affordability) + z × target_std + target_mean)`, usando la media y la desviación típica del objetivo almacenadas en `scaler.joblib`.

El entrenamiento se realizó desde cero sobre datos de 26 países entre 1977 y 2009, con un conjunto de test separado de los años 2015–2024 que, según la model card, se utilizó una sola vez. No se documenta el uso de RLHF, DPO ni ajuste por refuerzo (no aplica a regresión tabular). Las versiones de librerías declaradas son torch 2.14.1, scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3, joblib 1.6.0 y Python 3.12. No se especifica el número total de muestras de entrenamiento ni la composición exacta del dataset más allá de los 26 países y el rango temporal.

## Capacidades

- Regresión tabular: predicción de un valor numérico continuo (cambio de asequibilidad) a partir de 17 indicadores de entrada.
- Predicción a un año vista: estima el cambio de asequibilidad de `year` a `year + 1`.
- Manejo de valores ausentes en la entrada mediante imputación por mediana incluida en el preprocesador.
- Codificación ordinal de la variable categórica `decade`.
- Estandarización de entradas y reconstrucción del objetivo en escala original mediante parámetros almacenados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Alerta temprana de asequibilidad por país: un analista de política de vivienda introduce los 17 indicadores del año en curso y obtiene una estimación del cambio de asequibilidad para el año siguiente, antes de que se publiquen las estadísticas oficiales.
- Análisis de escenarios what-if: modificando variables como `real_hpi_change_pct` o `real_income_change_pct` se puede explorar cómo cambiaría la previsión de asequibilidad bajo supuestos alternativos de crecimiento de precios o rentas.
- Triangulación de previsiones: el modelo se usa junto al baseline ingenuo y al modelo Ridge del Day 2; cuando las tres previsiones discrepan, el analista identifica casos que merecen revisión manual.
- Docencia y comparación metodológica: sirve como ejemplo práctico de cuándo una red neuronal no supera a una regresión lineal en datos tabulares con pocas muestras.
- Investigación sobre series temporales cortas: permite estudiar el comportamiento de un MLP con regularización (dropout) en un problema de regresión con 26 países y ~30 años de datos.
- Reproducción de pipelines de ML: el repositorio de GitHub incluye el pipeline completo, útil para replicar el flujo de preprocesado, entrenamiento y evaluación en otros dominios tabulares.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test 2015–2024 (usado una sola vez):

| Modelo | MAE (puntos de índice) | R² (escala log) | Dentro de ±5% |
|---|---|---|---|
| Baseline: próximo año = este año | 3,74 | 0,770 | 75,4% |
| Baseline: Ridge (modelo Day 2) | 3,28 | 0,826 | **83,1%** |
| **Este modelo (MLP)** | **3,22** | **0,827** | 81,2% |

El MLP obtiene el MAE más bajo (3,22) y el R² ligeramente más alto (0,827), pero el Ridge supera al MLP en porcentaje de previsiones dentro del ±5% (83,1% frente a 81,2%). La model card concluye explícitamente que la red "empata" con el modelo lineal y no es claramente mejor. Los mayores errores corresponden a previsiones de 2023 realizadas con datos de 2022 y al boom pandémico de Canadá en 2021.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el `state_dict` ocupa unos 10 kB y el modelo completo cabe holgadamente en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. Funciona en cualquier GPU (A100, H100, RTX 4090, etc.) pero no se aprovecha.
- Cabe en cualquier GPU consumer y en entornos sin GPU (portátiles, Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: PyTorch nativo (carga de `state_dict` + `scaler.joblib` con joblib/scikit-learn). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a modelos tabulares).
- Latencia y throughput: no documentados; por el tamaño (1.953 parámetros) la inferencia es del orden de microsegundos a milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MAE test | R² (log) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (MLP) | 1.953 | no aplica | 3,22 | 0,827 | MIT | Hugging Face |
| Ridge Day 2 (mismo grupo) | no disponible | no aplica | 3,28 | 0,826 | no disponible | Hugging Face |
| Baseline ingenuo | 0 | no aplica | 3,74 | 0,770 | no aplica | no aplica |

No se dispone de información sobre otros modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Ámbito geográfico restringido: solo los 26 países presentes en los datos de entrenamiento; no válido para otros países, ciudades o regiones.
- Horizonte limitado: solo predice un año hacia delante; no es válido para previsiones a más largo plazo.
- No permite comparar niveles de asequibilidad entre países, ya que las entradas son índices con base 2024 = 100 por país.
- No apto para decisiones de inversión ni para decisiones sobre hogares o propiedades individuales.
- Falla ante shocks que las entradas no capturan (subidas de tipos de interés, pandemias): el modelo extrapola inercia y pierde los puntos de inflexión, como muestran los errores en 2023 y el boom pandémico de Canadá.
- Riesgo de sobreajuste por el tamaño reducido del conjunto de entrenamiento (26 países, 1977–2009) y el uso de dropout como única regularización documentada.
- No se documentan sesgos específicos, pero al entrenarse con datos históricos de 26 países puede reflejar patrones idiosincrásicos de esos mercados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y el ámbito de uso está acotado por la propia model card.
- No se documentan métricas de calibración ni intervalos de incertidumbre en las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day4-group8-affordability-mlp
- Repositorio GitHub del pipeline completo: https://github.com/iaac-maai/Group08_Day04_AI-Methods
- Modelo Ridge del Day 2 (mismo grupo): https://huggingface.co/iaac-maai/day2-group8-affordability
- Figura de comparación en test: https://huggingface.co/iaac-maai/day4-group8-affordability-mlp/resolve/main/06_test_comparison.png
- Figura de predicho vs real y distribución de errores: https://huggingface.co/iaac-maai/day4-group8-affordability-mlp/resolve/main/07_predicted_vs_actual.png
