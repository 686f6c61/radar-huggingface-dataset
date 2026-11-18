# felisahdestnty/sports-footwear-revenue-model

## Resumen
El modelo `sports-footwear-revenue-model` es un regresor de tipo Random Forest implementado con scikit-learn, publicado por el usuario felisahdestnty en Hugging Face. Su objetivo es predecir el ingreso total (`revenue_usd`) de transacciones de venta de calzado deportivo a escala global, a partir de 24 variables tabulares que incluyen precio final, unidades vendidas, descuento aplicado, valoracion del cliente y variables categoricas codificadas mediante one-hot encoding (marca, categoria, genero, metodo de pago, canal de venta y nivel de ingresos del cliente).

Se trata de un artefacto academico desarrollado como proyecto de fin de asignatura (Business Data Science, MN1135) en la Universidad Universal, no de un modelo de lenguaje ni de un modelo fundacional. El repositorio ocupa aproximadamente 0,1 GB y contiene los pesos serializados en formato joblib junto con el escalador y la lista de nombres de columnas necesarios para la inferencia.

Su relevancia es limitada fuera del ambito docente: las metricas reportadas (R² = 1,0000, MAE de 0,0128 USD, RMSE de 0,0363 USD) son sospechosamente perfectas y el propio autor las atribuye a una fuga de informacion estructural, ya que la variable objetivo se reconstruye casi exactamente a partir de `units_sold` y `final_price_usd`. No hay pipeline definido, licencia declarada ni idiomas especificados en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (scikit-learn), ensemble de arboles de decision |
| Parametros totales | no disponible (no aplicable a modelos de arboles; hiperparametros: n_estimators = 200, max_depth = None, min_samples_leaf = 1) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo tabular, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no aplica; serializacion en joblib) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (`model_regresi.joblib`, `scaler.joblib`, `feature_names.joblib`) |

## Arquitectura y entrenamiento
El modelo es un Random Forest Regressor con 200 estimadores, profundidad maxima ilimitada (`max_depth = None`) y `min_samples_leaf = 1`, hiperparametros seleccionados mediante Randomized Search CV con validacion cruzada de 5 folds. La entrada consta de 24 caracteristicas numericas y binarias derivadas de un dataset tabular denominado "Global Sports Footwear Sales (2018-2026)", compuesto por 30.000 transacciones, de las cuales 6.000 se reservaron para test.

No se documenta el numero de tokens de entrenamiento (no aplica), ni el uso de RLHF, DPO u otras tecnicas de alineacion. El preprocesamiento incluye escalado (artefacto `scaler.joblib`) y one-hot encoding de seis variables categoricas. No se describe ninguna innovacion tecnica destacable mas alla del pipeline clasico de scikit-learn.

## Capacidades
- Prediccion de ingresos brutos (`revenue_usd`) a partir de variables transaccionales tabulares.
- Regresion sobre datos estructurados con 24 caracteristicas de entrada.
- Inferencia determinista y reproducible mediante serializacion joblib.
- No dispone de generacion de texto, razonamiento, codigo, matematicas simbolicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No incorpora modo de pensamiento, audio ni ninguna capacidad multimodal.

## Casos de uso
- Analisis retrospectivo de ingresos por transaccion: dado un registro historico con precio final, unidades vendidas y atributos del cliente, el modelo estima el ingreso bruto correspondiente; util como ejercicio de validacion de pipelines de regresion en entornos docentes.
- Prototipado de sistemas de forecasting comercial: sirve como baseline rapido en notebooks para comparar tecnicas de regresion tabular antes de migrar a modelos mas robustos.
- Material didactico de Business Data Science: permite ilustrar el ciclo completo de entrenamiento, tuning con Randomized Search CV, evaluacion con R²/MAE/RMSE y serializacion con joblib.
- Generacion de informes academicos de simulacion de ventas: el modelo puede integrarse en scripts que reconstruyan escenarios hipoteticos de ingresos a partir de combinaciones de marca, canal y descuento.
- Pruebas de integracion de artefactos joblib en Hugging Face Hub: util para verificar flujos de `hf_hub_download` y carga de dependencias en entornos de CI.
- Demostracion de deteccion de fuga de datos: el propio modelo documenta el fenomeno, por lo que puede emplearse como caso de estudio sobre variables objetivo derivadas matematicamente.

## Benchmarks y rendimiento
Resultados reportados por el autor sobre el conjunto de test (6.000 transacciones):

| Metrica | Valor |
|---|---|
| R-squared (R²) | 1,0000 |
| MAE (USD) | 0,0128 |
| RMSE (USD) | 0,0363 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los valores practicamente perfectos deben interpretarse con cautela por la fuga de informacion descrita en la model card.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; innecesaria para un Random Forest de 200 arboles sobre 24 caracteristicas.
- Cabe en cualquier equipo consumer, incluidos portatiles modestos y entornos con poca RAM (el repositorio completo pesa 0,1 GB).
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio HTTP envolviendo scikit-learn (por ejemplo con FastAPI o Flask) o integracion en pipelines de datos batch.
- Latencia y throughput: no disponibles; para un Random Forest de este tamano se espera latencia de milisegundos por muestra en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares
No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (regresores tabulares especificos para ingresos de calzado deportivo) ni se aportan datos de alternativas como Gradient Boosting, XGBoost o LightGBM sobre el mismo dataset.

## Limitaciones y advertencias
- Fuga de informacion estructural: la variable objetivo se deriva casi exactamente de `units_sold` y `final_price_usd`, lo que explica el R² = 1,0000 y invalida el modelo como predictor realista de ingresos futuros.
- Predice ingresos brutos, no beneficio neto, por lo que no sirve para decisiones de margen operativo.
- No contempla factores externos como tendencias virales en redes sociales, inflacion regional o promociones de competidores.
- Licencia no declarada: no hay autorizacion explicita de uso comercial, lo que desaconseja su empleo en produccion.
- Idiomas no especificados y ausencia de pipeline en la ficha de Hugging Face.
- Sesgos conocidos: no documentados; al operar sobre datos tabulares sinteticos o historicos, podria heredar sesgos de muestreo del dataset original.
- Riesgo de sobreajuste severo por `max_depth = None` y `min_samples_leaf = 1`.
- Sin mantenimiento aparente: creado y actualizado el mismo dia (18 de noviembre de 2026), sin descargas ni interacciones.

## Enlaces
- Hugging Face: https://huggingface.co/felisahdestnty/sports-footwear-revenue-model
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
