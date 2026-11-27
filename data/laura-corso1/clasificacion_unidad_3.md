# laura-corso1/Clasificacion_Unidad_3

## Resumen

`laura-corso1/Clasificacion_Unidad_3` es un repositorio de Hugging Face que no contiene un modelo de lenguaje en el sentido habitual. El contenido publicado es un cuaderno de analisis de datos en Python (NumPy, pandas, scikit-learn, seaborn) orientado a la construccion de un clasificador de *churn* (abandono de clientes) sobre un conjunto de datos sintetico de 5.000 registros generado con una semilla fija. El repositorio no incluye pesos, configuracion de arquitectura ni artefactos de inferencia.

El material describe la generacion de variables simuladas de un cliente de financiacion (edad, ciudad, ingreso mensual en COP, antiguedad, monto financiado, plazo, cuota, relacion cuota/ingreso, mora, NPS, interacciones digitales, apertura de correos, visitas al portal y contactos comerciales) y una regla de negocio latente que determina la probabilidad de abandono. Sobre esos datos se entrenan y comparan tres clasificadores clasicos: regresion logistica, Random Forest y Gradient Boosting, evaluados con validacion cruzada estratificada de 5 pliegues y AUC-ROC sobre un conjunto de prueba del 30 %.

Por tanto, no se trata de un modelo fundacional ni de un LLM: no hay arquitectura transformer, no hay parametros entrenados publicados, no hay tokenizador ni ventana de contexto. La ficha se completa a continuacion reflejando esta naturaleza y marcando como "no disponible" todo aquello que el repositorio no aporta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica como modelo neuronal; el repositorio contiene un cuaderno de clasificacion tabular con regresion logistica, Random Forest y Gradient Boosting (scikit-learn) |
| Parametros totales | No disponible (no se publican pesos; los clasificadores se entrenan en el propio cuaderno) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible como modelo; el cuaderno y los datos estan en castellano |
| Licencia | No disponible |
| Formato de pesos | No disponible (no se publican safetensors, GGUF ni checkpoints) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal profunda. El flujo descrito en la model card genera un DataFrame sintetico de 5.000 filas y 17 columnas mediante `numpy.random.default_rng(SEED)`, con distribuciones explicitas para cada variable (por ejemplo, `ingreso_mensual` lognormal con media en el logaritmo de 7.000.000 COP y sigma 0,45; `monto_financiado` normal de media 95.000.000 COP y desviacion 30.000.000, recortada entre 35 y 250 millones; `plazo_meses` categorial con probabilidades 0,15/0,30/0,35/0,20 para 36/48/60/72 meses). La variable objetivo `churn` se muestrea de una binomial con probabilidad logistica derivada de una regla de negocio latente que combina relacion cuota/ingreso, apertura de correos, NPS, pagos atrasados, antiguedad, contactos comerciales, interacciones digitales y ausencia de creditos previos, mas ruido gaussiano de desviacion 0,6.

El preprocesamiento consiste en `StandardScaler` para las variables numericas y `OneHotEncoder(handle_unknown='ignore')` para `ciudad`, empaquetados en un `ColumnTransformer` dentro de un `Pipeline`. La particion es 70/30 estratificada por la variable objetivo. Se entrenan tres modelos: `LogisticRegression(max_iter=1000, class_weight='balanced')`, `RandomForestClassifier(n_estimators=300, min_samples_leaf=10, class_weight='balanced')` y `GradientBoostingClassifier()` por defecto. La evaluacion usa `StratifiedKFold(n_splits=5, shuffle=True)` con metrica `roc_auc`, y se reporta tambien AUC sobre el conjunto de prueba junto con curvas ROC. No se describe ningun proceso de RLHF, DPO ni ajuste fino neuronal.

## Capacidades

- Generacion de un dataset tabular sintetico de 5.000 registros con 17 columnas y una tasa de churn controlada por una regla latente.
- Analisis exploratorio: histogramas de la variable objetivo, churn por tramo de relacion cuota/ingreso, churn por NPS y matriz de correlacion con anotaciones.
- Entrenamiento y comparacion de tres clasificadores binarios supervisados sobre datos tabulares.
- Validacion cruzada estratificada y calculo de AUC-ROC en validacion y prueba.
- Calculo de una linea base ingenua ("nadie abandona") para contextualizar la exactitud.
- Trazabilidad reproducible mediante semilla fija (`SEED`) en generacion de datos, particion y modelos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo *thinking*: no es un modelo de lenguaje.

## Casos de uso

- Prototipado de un pipeline de churn en banca o financiacion de consumo: el cuaderno sirve como plantilla reproducible para generar datos sinteticos con una regla de negocio conocida y validar que un clasificador recupera la senal antes de aplicarlo a datos reales.
- Docencia y formacion en ciencia de datos: el flujo cubre generacion de datos, EDA, preprocesamiento con `ColumnTransformer`, comparacion de modelos y evaluacion con ROC-AUC, lo que lo hace util como material de practicas de clasificacion tabular.
- Pruebas de infraestructura de MLOps: al ser un pipeline scikit-learn ligero y determinista, puede usarse como *smoke test* en CI/CD para verificar versiones de scikit-learn, pandas y numpy, o para validar el empaquetado de pipelines con `joblib`.
- Analisis de sensibilidad de metricas: permite estudiar como varia el AUC entre regresion logistica, Random Forest y Gradient Boosting sobre una misma distribucion de datos y con desbalanceo moderado.
- Benchmark interno de preprocesamiento: comparar el efecto de escalado estandar y codificacion one-hot frente a alternativas (por ejemplo, codificadores con manejo de categorias desconocidas) sobre la misma particion estratificada.
- Material de referencia para definir reglas de negocio simuladas: la formula logistica documentada en la model card puede reutilizarse como generador de etiquetas para experimentos de interpretabilidad o de deteccion de *data leakage*.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El cuaderno calcula AUC de validacion cruzada y de prueba para los tres modelos, pero los valores concretos no aparecen en la model card; solo se describe el procedimiento (`roc_auc_score`, `cross_val_score` con `StratifiedKFold` de 5 pliegues) y la metrica de referencia ingenua (exactitud del clasificador "nadie abandona", que equivale a 1 menos la tasa de churn en prueba).

## Requisitos de hardware

- No requiere GPU: los tres clasificadores (regresion logistica, Random Forest de 300 arboles, Gradient Boosting) se entrenan en CPU en cuestion de segundos sobre 5.000 filas y 17 columnas.
- Memoria RAM estimada: por debajo de 1 GB para el dataset y los modelos en memoria; el cuaderno completo con graficos puede requerir 1-2 GB.
- CPU: cualquier procesador moderno de portatil es suficiente; el Random Forest usa `n_jobs=-1` para paralelizar.
- Despliegue: no aplica servidor de inferencia tipo vLLM, TGI u Ollama. En su caso, el artefacto desplegable seria un pipeline de scikit-learn serializado con `joblib` o `pickle`, servido via FastAPI o similar.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo, la inferencia por registro seria del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo entrenado con el que comparar parametros, contexto o rendimiento, y no se identifican en la informacion proporcionada alternativas equivalentes de clasificacion de churn tabular en Hugging Face con las que establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Los datos son completamente sinteticos y la etiqueta `churn` se genera a partir de una regla logistica explicita; cualquier modelo entrenado sobre ellos aprende esa regla, no el comportamiento real de clientes.
- No se publican pesos, artefactos ni version del modelo: el repositorio es un cuaderno, no un modelo reutilizable directamente.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial o redistribucion.
- El desbalanceo de clases y la tasa de churn dependen de la semilla y de los parametros de la regla latente; los resultados no son extrapolables a otros dominios.
- Riesgo de *data leakage* si se reutiliza la formula generadora como caracteristica en lugar de como etiqueta.
- No hay evaluacion de sesgos, calibracion, *fairness* por subgrupos (ciudad, edad) ni analisis de deriva.
- No apto para produccion en decision crediticia real sin reentrenamiento con datos observados y validacion regulatoria.
- El repositorio no incluye tokenizador, plantilla de chat ni instrucciones de uso como modelo generativo; no debe tratarse como un LLM.

## Enlaces

- Hugging Face: https://huggingface.co/laura-corso1/Clasificacion_Unidad_3
