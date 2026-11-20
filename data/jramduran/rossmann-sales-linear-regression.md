# jramduran/rossmann-sales-linear-regression

## Resumen

`rossmann-sales-linear-regression` es un modelo de regresión tabular publicado en Hugging Face por el usuario `jramduran` que predice las ventas diarias en euros de las 1.115 farmacias de la cadena alemana Rossmann. No es un modelo de lenguaje ni una red neuronal: se trata de una regresión lineal por mínimos cuadrados ordinarios (OLS) implementada con scikit-learn y serializada con joblib, orientada a la previsión de series temporales en el ámbito minorista.

El modelo resuelve un problema clásico de forecasting con información exógena conocida de antemano: identidad de la tienda, fecha, promociones activas y festivos. Deliberadamente excluye variables no observables en el momento de la predicción, como el número de clientes del día, lo que lo hace apto para planificación anticipada. La salida es una predicción puntual en euros, obtenida tras modelar `log1p(sales)` y revertir la transformación con `expm1`.

Su relevancia es fundamentalmente práctica y metodológica: sirve como línea base interpretable frente a modelos más complejos (gradient boosting, redes recurrentes) sobre el mismo conjunto de datos del reto de Kaggle "Rossmann Store Sales", y demuestra que un modelo lineal con ingeniería de características cuidadosa alcanza un R² de 0,860 en un horizonte de seis semanas. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión lineal por mínimos cuadrados ordinarios (OLS), scikit-learn |
| Parámetros totales | no disponible (21 coeficientes más intercepto, estimado a partir de las 21 características) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 21 características por instancia) |
| Tipos de cuantización | no aplica; serialización en joblib |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model.joblib`) más `store_stats.csv` con estadísticos por tienda |
| Librería | scikit-learn 1.9.1 (versión requerida explícitamente) |
| Pipeline | tabular-regression |
| Dataset de entrenamiento | `AiiN-aini/rossmann-store-sales` (Kaggle Rossmann Store Sales) |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es una regresión lineal múltiple estándar sin regularización (OLS) sobre 21 características. Las variables categóricas de calendario y de tienda se codifican en one-hot, mientras que las numéricas se estandarizan. La variable objetivo es `log1p(sales)`, una transformación logarítmica que estabiliza la varianza y mitiga el efecto de los picos de venta; las predicciones se devuelven a euros con `expm1`. No hay capas ocultas, atención ni componentes secuenciales: la dimensión temporal se captura exclusivamente mediante características derivadas de la fecha (día de la semana, día del mes, mes, año, semana del año, día del año e indicadores de inicio y fin de mes).

El entrenamiento utiliza los datos del reto de Kaggle "Rossmann Store Sales" (`train.csv` y `store.csv`) leídos desde el dataset de Hugging Face `AiiN-aini/rossmann-store-sales`, restringido a días abiertos con ventas registradas. El conjunto de entrenamiento abarca del 1 de enero de 2013 al 19 de junio de 2015, con 804.056 registros tienda-día. El conjunto de prueba corresponde a las últimas seis semanas (20 de junio a 31 de julio de 2015), con 40.282 registros tienda-día, nunca vistos ni por el modelo ni por el cálculo de los estadísticos por tienda. Las 21 características incluyen cuatro estadísticos por tienda calculados solo sobre el periodo de entrenamiento (`store_mean_log_sales`, `store_dow_log_sales`, `store_promo_lift`, `store_mean_log_customers`), almacenados en `store_stats.csv`. No se documenta uso de validación cruzada, regularización, RLHF ni técnicas de aumento de datos.

## Capacidades

- Predicción puntual de ventas diarias en euros para cada una de las 1.115 tiendas Rossmann.
- Forecasting con información exógena conocida de antemano: tienda, fecha, promoción en curso, festivo estatal y festivo escolar.
- Modelado de estacionalidad múltiple mediante características de calendario (día de la semana, semana del año, día del año, inicio y fin de mes).
- Incorporación de efectos específicos por tienda a través de estadísticos agregados del periodo de entrenamiento (media logarítmica de ventas, media por día de la semana, lift promocional, media de clientes).
- No requiere variables contemporáneas al día predicho (como el número de clientes), lo que permite su uso en planificación anticipada.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.
- Inferencia determinista y de coste computacional despreciable (una multiplicación matricial de 21 dimensiones por instancia).

## Casos de uso

- Planificación de stock y reposición: el modelo permite generar previsiones de ventas por tienda y día con hasta seis semanas de antelación, usando solo el calendario y las promociones programadas, lo que facilita el aprovisionamiento antes de conocer la demanda real.
- Dimensionamiento de personal: al predecir ventas diarias por tienda y día de la semana, los responsables de operaciones pueden ajustar turnos y horas de caja en función del volumen esperado, incorporando el efecto de promociones y festivos.
- Evaluación de promociones: el estadístico `store_promo_lift` y la variable `promotion` permiten estimar el incremento de ventas atribuible a una promoción concreta por tienda, útil para comparar campañas y decidir su repetición.
- Línea base para modelos complejos: por su simplicidad e interpretabilidad, sirve como referencia contra la que medir gradient boosting, redes neuronales o modelos de series temporales sobre el mismo dataset, tal como el autor hace explícito al comparar con la predicción por media de día de la semana (R² 0,696 frente a 0,860).
- Análisis de sensibilidad a festivos: los indicadores `state_holiday` y `school_holiday` permiten cuantificar el impacto de cada tipo de festivo en las ventas por tienda y planificar campañas específicas en torno a ellos.
- Previsión presupuestaria agregada: sumando las predicciones por tienda se obtiene una estimación de ingresos a nivel de cadena para el horizonte de seis semanas, útil para planificación financiera y fijación de objetivos.
- Detección de desviaciones operativas: comparar las ventas reales con la predicción del modelo puede señalar tiendas con comportamiento anómalo (caída de tráfico, problemas de suministro) que requieran revisión.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el conjunto de prueba retenido (últimas seis semanas, 20 de junio a 31 de julio de 2015, n = 40.282 registros tienda-día):

| Métrica | Valor |
|---|---|
| R² | 0,860 |
| RMSPE (métrica de Kaggle) | 0,159 |
| RMSE | 1.141 EUR |
| MAE | 795 EUR |

Referencia comparativa incluida por el autor (predicción de la media de cada tienda para ese día de la semana):

| Modelo | R² | RMSPE |
|---|---|---|
| Regresión lineal (este modelo) | 0,860 | 0,159 |
| Media por tienda y día de la semana | 0,696 | 0,224 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo es una regresión lineal de 21 coeficientes y puede ejecutarse en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. No se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (portátiles, contenedores pequeños, funciones serverless).
- Opciones de despliegue: carga directa con `joblib.load` en Python con scikit-learn 1.9.1; integración en pipelines de pandas; servicio HTTP ligero con FastAPI o Flask; no aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo (una multiplicación matricial de 21 dimensiones) se espera latencia en el orden de microsegundos a milisegundos por instancia en CPU, aunque el autor no publica cifras.
- Dependencia crítica: la versión de scikit-learn debe ser exactamente 1.9.1 para cargar el pickle sin incompatibilidades, según indica el autor.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos publicados en Hugging Face con el mismo pipeline (`tabular-regression`) y el mismo dataset que permitan una comparativa directa con parámetros, contexto y licencia. La única comparación documentada es la que el propio autor incluye frente a una línea base trivial (media por tienda y día de la semana), recogida en la sección de benchmarks.

| Modelo | Tipo | R² | RMSPE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (regresión lineal) | OLS con 21 características | 0,860 | 0,159 | no disponible | Hugging Face |
| Media por tienda y día de la semana | Línea base estadística | 0,696 | 0,224 | no aplica | Referencia del autor |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo predice ventas para las 1.115 tiendas Rossmann del dataset original; no generaliza a otras cadenas, países ni periodos con cambios estructurales en el negocio.
- Excluye deliberadamente el número de clientes del día, lo que limita su capacidad para capturar picos puntuales de tráfico no explicados por calendario o promociones.
- Los cuatro estadísticos por tienda se calculan solo sobre el periodo de entrenamiento (2013 a junio de 2015); si el modelo se aplica a fechas muy posteriores, esos estadísticos pueden quedar desactualizados y sesgar las predicciones.
- La licencia no está declarada en la información disponible, por lo que no puede confirmarse la viabilidad de uso comercial sin consultar al autor.
- El formato de pesos es un pickle de joblib, lo que implica riesgo de seguridad al cargarlo: solo debe hacerse desde fuentes de confianza, tal como advierte el propio autor en la model card.
- Requiere scikit-learn 1.9.1 exactamente y el módulo `forecast.features` del repositorio del proyecto para construir las características; sin ese código auxiliar el modelo no es utilizable de forma directa.
- Al ser un modelo lineal, no captura interacciones no lineales entre variables (por ejemplo, efectos combinados de promoción y festivo) salvo las codificadas explícitamente en las características.
- No se documentan análisis de sesgo, calibración por intervalos de confianza ni evaluación fuera del periodo de prueba de seis semanas.
- El repositorio no registra descargas ni likes, y su tamaño es de 0,0 GB, lo que sugiere un uso muy limitado y ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/rossmann-sales-linear-regression
- Dataset de entrenamiento: https://huggingface.co/datasets/AiiN-aini/rossmann-store-sales
- Repositorio del proyecto (código de características): https://github.com/JTiiz/iron-kaggle
- Reto original de Kaggle "Rossmann Store Sales": no disponible como enlace en la información proporcionada
