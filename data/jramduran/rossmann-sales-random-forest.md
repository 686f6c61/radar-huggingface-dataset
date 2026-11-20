# jramduran/rossmann-sales-random-forest

## Resumen

`rossmann-sales-random-forest` es un modelo de regresión tabular publicado por el usuario jramduran en Hugging Face, orientado a la previsión de ventas diarias de las 1.115 farmacias de la cadena Rossmann. No es un modelo de lenguaje ni una red neuronal: se trata de un `RandomForestRegressor` de scikit-learn serializado con joblib, entrenado sobre el conocido dataset de Kaggle "Rossmann Store Sales" (2013-2015). Predice las ventas diarias en euros a partir de variables conocidas de antemano (tienda, fecha, promoción, festivos), sin usar el número de clientes del día.

El modelo resuelve un problema clásico de forecasting minorista: estimar la demanda por tienda y día para planificación de personal, stock y promociones. Su interés práctico radica en que sirve como baseline reproducible y bien documentado: la model card reporta métricas de validación temporal estricta (últimas 6 semanas nunca vistas) y compara contra un baseline naive de media por día de la semana.

Técnicamente es un ensemble de 60 árboles de decisión con profundidad máxima 20, entrenado sobre `log1p(sales)` con 21 características de calendario, promoción, festivos y estadísticas agregadas por tienda. El repositorio ocupa 0,1 GB y se distribuye como `model.joblib` más un CSV de estadísticas por tienda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest (scikit-learn `RandomForestRegressor`), 60 árboles, profundidad máxima 20 |
| Parametros totales | no disponible (modelo basado en árboles, no aplica recuento de parámetros neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 21 características por fila) |
| Tipos de cuantizacion | no disponible (serialización joblib; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model.joblib`) + CSV auxiliar (`store_stats.csv`) |
| Version de scikit-learn requerida | 1.9.1 |
| Tamano del repositorio | 0,1 GB |
| Numero de caracteristicas de entrada | 21 |
| Target | `log1p(sales)`, revertido con `expm1` |
| Numero de tiendas cubiertas | 1.115 |
| Periodo de entrenamiento | 2013-01-01 a 2015-06-19 (804.056 registros tienda-día) |
| Periodo de test | 2015-06-20 a 2015-07-31 (40.282 registros tienda-día) |

## Arquitectura y entrenamiento

El modelo es un `RandomForestRegressor` de scikit-learn con 60 árboles de regresión, cada uno con profundidad máxima 20 y entrenado sobre una muestra aleatoria del 50 % de las filas y del 50 % de las características (bagging y feature subsampling). La variable objetivo es el logaritmo de las ventas (`log1p`), una transformación habitual para estabilizar la varianza y reducir el efecto de outliers; las predicciones se revierten a euros con `expm1`.

Las 21 características de entrada se agrupan en cuatro bloques: (1) calendario (día de la semana, día, mes, año, semana del año, día del año, inicio y fin de mes); (2) indicadores de promoción y festivos (promoción del día, festivo estatal, festivo escolar); (3) metadatos de tienda (tipo de tienda, surtido, distancia y antigüedad de la competencia, estado y mes de Promo2); y (4) cuatro estadísticas agregadas por tienda calculadas solo sobre el periodo de entrenamiento (`store_mean_log_sales`, `store_dow_log_sales`, `store_promo_lift`, `store_mean_log_customers`). El modelo se entrena exclusivamente con días abiertos y con ventas registradas, y no utiliza el número de clientes del día a predecir (evitando fuga de información).

No se documenta uso de validación cruzada, búsqueda de hiperparámetros, regularización adicional ni técnicas de calibración. La partición train/test es temporal (últimas 6 semanas reservadas), lo que constituye una evaluación honesta para series temporales. La construcción de características depende de un módulo externo (`forecast/features.py`) del repositorio del proyecto, lo que introduce un acoplamiento fuerte entre el artefacto y el código de preprocesado.

## Capacidades

- Regresión tabular supervisada: predice ventas diarias en euros para una tienda y fecha dadas.
- Forecasting de series temporales de retail con horizonte corto (días/semanas), usando solo información conocida de antemano.
- Modelado de estacionalidad semanal, mensual y anual mediante características de calendario.
- Incorporación de efectos de promoción (promoción del día y Promo2) y de festivos (estatales y escolares).
- Uso de estadísticas históricas por tienda como features (media de ventas, media por día de la semana, lift promocional, media de clientes).
- Manejo de heterogeneidad entre tiendas mediante tipo de tienda, surtido y variables de competencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No procesa texto, imágenes ni audio; la entrada es exclusivamente un vector de 21 características numéricas/categóricas codificadas.

## Casos de uso

- **Planificación de personal por tienda y día**: el modelo permite estimar la carga de trabajo esperada en cada una de las 1.115 tiendas para la semana siguiente, usando solo calendario, promociones y festivos conocidos; con un MAE de 684 EUR sobre días abiertos, sirve para dimensionar turnos con antelación.
- **Previsión de demanda para reposición de stock**: integrado en un pipeline diario que genere las 21 features por tienda y fecha, el modelo produce una estimación de ventas que puede traducirse a unidades esperadas y alimentar órdenes de compra a proveedores.
- **Evaluación de promociones**: la feature `store_promo_lift` y el flag de promoción permiten simular escenarios "con promoción" vs. "sin promoción" por tienda y día, comparando la predicción del modelo para estimar el impacto esperado de una campaña antes de lanzarla.
- **Baseline para modelos más complejos**: por su simplicidad y métricas documentadas (R² 0,891, RMSPE 0,142), es un punto de partida reproducible contra el que comparar modelos de gradient boosting (XGBoost, LightGBM) o redes neuronales temporales en el mismo dataset.
- **Detección de anomalías en ventas reales**: comparando la predicción del modelo con las ventas observadas al cierre del día, se pueden marcar desviaciones significativas (por ejemplo, caídas superiores al MAE) para revisión operativa.
- **Docencia y reproducción de experimentos**: el par modelo + `store_stats.csv` + código de features permite reproducir un flujo completo de forecasting tabular con partición temporal, útil en cursos de machine learning aplicado a retail.
- **Análisis de sensibilidad por tienda**: al ser un modelo de árboles, permite extraer importancia de características y estudiar qué variables (competencia, promoción, día de la semana) dominan la predicción en cada tienda.

## Benchmarks y rendimiento

Métricas reportadas por el autor sobre el conjunto de test temporal (2015-06-20 a 2015-07-31, n = 40.282 registros tienda-día):

| Metrica | Random forest (este modelo) | Baseline media por dia de la semana |
|---|---|---|
| R² | 0,891 | 0,696 |
| RMSPE (metrica Kaggle) | 0,142 | 0,224 |
| RMSE | 1.007 EUR | no disponible |
| MAE | 684 EUR | no disponible |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparación con gradient boosting o con el modelo ganador de la competición de Kaggle) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica; el modelo no requiere GPU. La inferencia es CPU pura vía scikit-learn.
- **Memoria RAM**: el repositorio ocupa 0,1 GB; la carga del `model.joblib` y del CSV de estadísticas cabe holgadamente en menos de 1 GB de RAM.
- **GPU recomendadas**: ninguna. Cualquier CPU moderna es suficiente.
- **¿Cabe en hardware consumer?**: sí, en cualquier portátil o equipo de sobremesa, incluso en Raspberry Pi para inferencia puntual.
- **Opciones de despliegue**: script Python con `joblib.load` + `scikit-learn==1.9.1`; servicio HTTP ligero (FastAPI, Flask) envolviendo la función de predicción; batch offline con pandas; no es compatible con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- **Latencia y throughput**: no se documentan cifras oficiales. Para referencia orientativa, un random forest de 60 árboles de profundidad 20 sobre 21 features suele responder en el orden de milisegundos por fila en CPU, permitiendo miles de predicciones por segundo en batch; estas cifras no están verificadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / tamano | Contexto / entrada | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `jramduran/rossmann-sales-random-forest` | Random forest (scikit-learn) | 60 árboles, prof. 20; repo 0,1 GB | 21 features tabulares | R² 0,891; RMSPE 0,142; MAE 684 EUR | no disponible | Hugging Face |
| Baseline media por día de la semana | Estadístico naive | no aplica | 1 feature (día de la semana) | R² 0,696; RMSPE 0,224 | no disponible | Referencia interna del autor |
| XGBoost / LightGBM sobre el mismo dataset | Gradient boosting | no disponible | tabular | no disponible en esta información | no disponible | Genérico |
| Modelo ganador de la competición Kaggle Rossmann Store Sales | Ensemble diverso | no disponible | tabular + series | no disponible en esta información | no disponible | Kaggle |

No se dispone de comparaciones numéricas con alternativas de gradient boosting o con el modelo ganador de Kaggle en la información proporcionada; la única comparación documentada es contra el baseline naive de media por día de la semana.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no indica licencia. No se puede asumir uso comercial permitido sin contactar con el autor.
- **Acoplamiento a código externo**: las features se construyen con `forecast/features.py` del repositorio `JTiiz/iron-kaggle`; sin ese módulo el artefacto no es utilizable directamente. Además, exige `scikit-learn==1.9.1`, lo que puede romper la carga del pickle con otras versiones.
- **Riesgo de seguridad del formato**: `model.joblib` es un pickle de Python; cargarlo ejecuta código. Solo debe cargarse desde fuentes de confianza, como advierte el propio autor.
- **Dependencia de `store_stats.csv`**: las cuatro estadísticas por tienda se calcularon solo sobre el periodo de entrenamiento; si se aplican a fechas muy posteriores o a tiendas nuevas no cubiertas, la calidad de la predicción puede degradarse.
- **Horizonte limitado**: la evaluación cubre 6 semanas; no hay evidencia de comportamiento a horizontes más largos ni de robustez ante cambios estructurales (nuevas tiendas, cierres, cambios de surtido).
- **Sin modelado de clientes del día**: al excluir el número de clientes del día a predecir, el modelo no captura efectos de tráfico no explicados por calendario, promoción o festivos.
- **Sesgo de selección**: se entrena solo con días abiertos y con ventas registradas; no modela cierres ni días con ventas cero, lo que puede sesgar predicciones en tiendas con patrones de cierre atípicos.
- **Riesgo de alucinación**: no aplica en el sentido de modelos generativos, pero sí existe riesgo de predicciones poco realistas (negativas o extremas) fuera del rango de fechas y tiendas vistas en entrenamiento.
- **Sin datos de idioma ni multilingüismo**: no procede.
- **Reproducibilidad**: sin semilla documentada, los resultados pueden variar ligeramente entre reentrenamientos.
- **Cero tracción comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/rossmann-sales-random-forest
- Dataset utilizado: https://huggingface.co/datasets/AiiN-aini/rossmann-store-sales
- Repositorio del proyecto (código de features): https://github.com/JTiiz/iron-kaggle
- Competición original de Kaggle "Rossmann Store Sales": https://www.kaggle.com/c/rossmann-store-sales
- Documentación de scikit-learn `RandomForestRegressor`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html
