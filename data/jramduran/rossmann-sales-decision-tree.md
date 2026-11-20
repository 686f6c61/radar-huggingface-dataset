# jramduran/rossmann-sales-decision-tree

## Resumen

`jramduran/rossmann-sales-decision-tree` es un modelo de regresión tabular publicado en Hugging Face por el usuario jramduran. No es una red neuronal ni un modelo de lenguaje: es un único árbol de decisión de regresión entrenado con scikit-learn sobre el conocido dataset de Kaggle "Rossmann Store Sales", que contiene el histórico diario de ventas de 1.115 droguerías de la cadena alemana Rossmann. El modelo predice las ventas diarias en euros de cada tienda a partir de información disponible con antelación (tienda, fecha, promociones y festivos), sin utilizar el número de clientes del día, que es una variable no observable en el momento de la previsión.

El problema que resuelve es la previsión de series temporales de retail a nivel de tienda-día, un caso clásico de demanda con estacionalidad semanal, efectos de promoción y festivos. La propuesta del autor es deliberadamente simple: un solo árbol de profundidad máxima 18 con al menos 20 observaciones tienda-día por hoja, entrenado sobre 804.056 registros entre el 1 de enero de 2013 y el 19 de junio de 2015, y evaluado sobre las últimas seis semanas del dataset (40.282 tienda-días) que nunca vio durante el entrenamiento.

La relevancia es la de un baseline reproducible y ligero para forecasting de retail: sirve como referencia frente a la que comparar modelos más complejos (gradient boosting, redes recurrentes, modelos de series temporales) y como ejemplo de ingeniería de características tabulares con estadísticas agregadas por tienda. El repositorio ocupa 0,0 GB y las descargas y likes registrados son 0 en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Árbol de decisión de regresión (scikit-learn), profundidad máxima 18, mínimo 20 muestras por hoja |
| Parámetros totales | No disponible (modelo no neuronal; número de nodos no publicado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular; 21 características de entrada) |
| Tipos de cuantización | No disponible (serializado en joblib, sin cuantización) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | joblib (`model.joblib`) más `store_stats.csv` con estadísticas por tienda |

## Arquitectura y entrenamiento

El modelo es un árbol de decisión de regresión de scikit-learn, sin ensamblado ni boosting, con profundidad máxima 18 y un mínimo de 20 observaciones tienda-día por hoja. La variable objetivo es `log1p(sales)`, y las predicciones se revierten a euros con `expm1`, una transformación habitual para estabilizar la varianza en series de ventas con cola larga. La entrada son 21 características construidas por el script `forecast/features.py` del repositorio del proyecto: variables de calendario (día de la semana, día, mes, año, semana del año, día del año, inicio y fin de mes), indicadores de promoción y festivos, tipo de tienda, surtido, distancia y antigüedad de la competencia, estado de Promo2 y cuatro estadísticas agregadas por tienda calculadas sobre el periodo de entrenamiento (`store_mean_log_sales`, `store_dow_log_sales`, `store_promo_lift`, `store_mean_log_customers`).

Los datos provienen del dataset de Kaggle "Rossmann Store Sales" (`train.csv` y `store.csv`), leído desde el repositorio de Hugging Face `AiiN-aini/rossmann-store-sales`. Solo se usan días abiertos con ventas registradas. El conjunto de entrenamiento cubre del 1 de enero de 2013 al 19 de junio de 2015 (804.056 tienda-días) y el de test las seis semanas siguientes, del 20 de junio al 31 de julio de 2015, que no fueron vistas ni por el modelo ni por el cálculo de las estadísticas por tienda. No se documenta ningún proceso de regularización, validación cruzada ni ajuste de hiperparámetros más allá de los valores indicados.

## Capacidades

- Regresión tabular: predice las ventas diarias en euros de una tienda Rossmann a partir de 21 características.
- Previsión de series temporales de retail con estacionalidad semanal, efectos de promoción y festivos.
- Uso de estadísticas agregadas por tienda calculadas en entrenamiento (media de ventas, media por día de la semana, lift promocional, media de clientes).
- No requiere el número de clientes del día, lo que permite usarlo en escenarios de previsión ex ante.
- Inferencia determinista y de coste muy bajo (un solo árbol, sin GPU).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Baseline de referencia en proyectos de forecasting de retail: sirve para fijar un suelo de rendimiento (R² 0,842, RMSPE 0,176) antes de invertir en modelos más complejos como LightGBM o redes temporales.
- Planificación de personal por tienda y día: con la previsión de ventas y el histórico de clientes por tienda se puede dimensionar el turno con antelación, ya que el modelo solo necesita calendario y promociones.
- Gestión de promociones: la característica `store_promo_lift` y el indicador de promoción permiten estimar el impacto esperado de una campaña en cada tienda antes de lanzarla.
- Previsión de demanda para aprovisionamiento: agregando las predicciones diarias por tienda se obtiene una estimación de volumen para planificar stock, aunque con las limitaciones de precisión del modelo.
- Detección de anomalías operativas: comparar las ventas reales con la predicción del modelo para una tienda-día concreta puede señalar caídas o picos anómalos que requieran revisión.
- Docencia y prototipado de feature engineering tabular: el par `model.joblib` + `store_stats.csv` con `forecast/features.py` es un ejemplo completo y reproducible de construcción de características de calendario y agregados por entidad.
- Evaluación comparativa de modelos de series temporales: el split temporal fijo (entrenamiento hasta 2015-06-19, test hasta 2015-07-31) permite comparar metodologías sobre exactamente los mismos 40.282 tienda-días.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test retenido (últimas 6 semanas, n = 40.282 tienda-días):

| Métrica | Árbol de decisión | Baseline (media por tienda y día de la semana) |
|---|---|---|
| R² | 0,842 | 0,696 |
| RMSPE (métrica de Kaggle) | 0,176 | 0,224 |
| RMSE | 1.216 EUR | No disponible |
| MAE | 844 EUR | No disponible |

No se han publicado comparaciones con otros modelos (gradient boosting, redes neuronales) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU.
- VRAM estimada: 0 GB (el modelo es un árbol serializado en joblib y el repositorio ocupa 0,0 GB).
- GPU recomendadas: ninguna; cualquier CPU es suficiente.
- Cabe en cualquier equipo, incluidos portátiles de gama baja y entornos serverless.
- Opciones de despliegue: carga directa con `joblib.load` en Python con scikit-learn 1.9.1 (versión exigida por el autor); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos generativos.
- Latencia y throughput: no publicados; por la naturaleza del modelo (un solo árbol de profundidad 18) se espera latencia del orden de microsegundos a milisegundos por predicción en CPU, aunque esta cifra no está documentada por el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Métrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jramduran/rossmann-sales-decision-tree | Árbol de decisión (sklearn) | 21 features tabulares | R² 0,842; RMSPE 0,176 | No disponible | Hugging Face, joblib |
| Baseline media por tienda y día de la semana | Estadístico | Tienda y día de la semana | R² 0,696; RMSPE 0,224 | No aplica | Referencia incluida en la model card |
| Otros modelos sobre Rossmann Store Sales | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de información sobre alternativas comparables (por ejemplo, soluciones de gradient boosting o redes sobre el mismo dataset) en la documentación consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un árbol único, puede infraajustar relaciones no lineales complejas y es sensible a la distribución concreta de las 1.115 tiendas del dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir predicciones poco fiables fuera del rango de fechas y tiendas vistas en entrenamiento (extrapolación no soportada por los árboles).
- Limitación temporal: entrenado solo hasta el 19 de junio de 2015; no incorpora cambios posteriores en surtido, competencia ni comportamiento del consumidor.
- Dependencia de features externas: requiere ejecutar `forecast/features.py` del repositorio del proyecto y la versión exacta de scikit-learn 1.9.1; discrepancias en la construcción de características invalidan las predicciones.
- Dependencia de `store_stats.csv`: las cuatro estadísticas por tienda se calcularon sobre el periodo de entrenamiento; tiendas nuevas o con histórico distinto no están cubiertas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de utilizarlo en producción.
- Seguridad: el modelo se distribuye como pickle (`joblib`), que puede ejecutar código arbitrario al cargarse; el propio autor advierte de cargar solo pickles de confianza.
- Idiomas: no aplica, pero el modelo está entrenado exclusivamente con datos de Alemania y no es trasladable sin reentrenamiento a otros mercados.
- Sin descargas ni likes registrados: no hay evidencia de uso en producción ni de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/rossmann-sales-decision-tree
- Dataset utilizado: https://huggingface.co/datasets/AiiN-aini/rossmann-store-sales
- Repositorio del proyecto (features y pipeline): https://github.com/JTiiz/iron-kaggle
- Dataset original de Kaggle "Rossmann Store Sales": no disponible en la información proporcionada (referenciado por nombre en la model card)
