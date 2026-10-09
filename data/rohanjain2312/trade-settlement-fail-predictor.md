# rohanjain2312/trade-settlement-fail-predictor

## Resumen

Trade Settlement Fail Predictor es un paquete de modelos de clasificacion tabular publicado por Rohan Jain (usuario `rohanjain2312`) en HuggingFace. No es un modelo de lenguaje ni una red neuronal: se trata de un conjunto de clasificadores clasicos (regresion logistica L2, SVM lineal, SVM con kernel RBF y XGBoost) entrenados para predecir la probabilidad de que una operacion financiera falle en su liquidacion (settlement fail). El repositorio incluye multiples variantes de cada familia, tanto sin recalibrar como con calibracion Platt o isotonica, ademas de valores SHAP y artefactos de evaluacion.

El problema que aborda es real y relevante en el middle office de entidades financieras: la prediccion temprana de fallos de liquidacion permite actuar antes de que se materialice el incumplimiento. Sin embargo, el propio autor advierte de forma explicita que todo el entrenamiento se ha realizado con datos sinteticos generados por un script con semilla fija, y que los modelos no han sido validados con operaciones reales ni deben usarse para decisiones de liquidacion reales. Su valor, por tanto, es metodologico: demuestra un flujo de trabajo reproducible que cubre generacion de datos, ingenieria de caracteristicas sin fuga de etiquetas, tratamiento del desbalanceo, calibracion y explicabilidad.

El repositorio ocupa 0,1 GB, tiene licencia MIT y registra 0 descargas y 0 likes en el momento de la consulta. No se declaran idiomas soportados ni parametros de modelo en el sentido habitual, ya que las entradas son 20 columnas tabulares definidas en `feature_schema.json`, no texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Conjunto de clasificadores tabulares: regresion logistica L2, SVM lineal, SVM con kernel RBF y XGBoost (arboles con boosting de gradiente) |
| Parametros totales | No disponible (no aplica en el sentido de pesos de red; no se publica el numero de arboles ni de estimadores de cada variante) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular; la entrada son 20 columnas, no una secuencia de texto) |
| Tipos de cuantizacion | No aplica. Los artefactos se serializan en joblib y en formato nativo de XGBoost (JSON); no se publican versiones cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible / no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `joblib` para las variantes de scikit-learn y calibradas; `.json` (formato nativo de XGBoost) para `xgb_model.json` |

## Arquitectura y entrenamiento

El repositorio no contiene un unico modelo, sino varias familias entrenadas en paralelo sobre el mismo conjunto de caracteristicas. Las variantes publicadas son: `logreg.joblib` (regresion logistica L2 calibrada sobre validacion), `svm_linear_calibrated.joblib` (SVM lineal con SMOTENC embebido en el pipeline de entrenamiento y calibracion Platt), `svm_rbf_calibrated.joblib` (SVM RBF sobre una submuestra estratificada, calibrado con Platt; el autor indica que se ajusto con cuML en GPU cuando estaba disponible, por lo que su recarga requiere cuML) y `xgb_model.json` junto con `xgb_calibrated.joblib` (XGBoost en formato nativo y la misma variante con calibracion isotonica). Los directorios `models/` y `calibrated/` contienen todas las combinaciones de estrategia de remuestreo (ninguna, pesos de clase, SMOTENC).

Los datos de entrenamiento son integramente sinteticos y provienen de un generador con semilla publicado en el repositorio de GitHub del autor; el dataset asociado es `rohanjain2312/settlement-trades-synthetic`. Las entradas son las 20 columnas descritas en `feature_schema.json`, con las variables categoricas representadas como `pandas.Categorical` con los niveles listados. El diseno del pipeline presta especial atencion a la ausencia de fuga de informacion: segun la documentacion del repositorio, los campos `failed`, `fail_reason`, `scenario_mask`, identificadores, fechas y el notional bruto nunca se usan como entradas, existe un test especifico (`tests/test_no_label_leakage.py`) que lo verifica, y las caracteristicas de tipo rolling solo emplean resultados conocidos en la fecha de la operacion (fecha de liquidacion estrictamente anterior a la fecha de la operacion). La tasa de fallo del conjunto es del 3 por ciento, muy desbalanceada, lo que explica el uso de SMOTENC, pesos de clase y `scale_pos_weight`, y tambien el enfasis del autor en que la exactitud no es una metrica informativa (predecir siempre "liquida" daria en torno al 97 por ciento).

Como innovacion metodologica destacable, el autor incluye una comprobacion de la explicabilidad contra la "verdad plantada" en el generador: los valores SHAP alcanzan una correlacion de rango de 0,96 con la importancia real de las caracteristicas, y todas las caracteristicas etiquetadas como fuertes puntuan por encima de todas las etiquetadas como debiles. Tambien se incluye un experimento de escenario retenido (`heldout/`).

## Capacidades

- Clasificacion binaria tabular: estima la probabilidad de fallo de liquidacion de una operacion a partir de 20 caracteristicas.
- Salidas calibradas: las variantes `*_calibrated` aplican calibracion Platt o isotonica, de modo que la puntuacion puede interpretarse como probabilidad (Brier entre 0,0350 y 0,0427 en test sintetico).
- Tratamiento explicito del desbalanceo de clases: variantes con SMOTENC, pesos de clase y `scale_pos_weight`.
- Explicabilidad integrada: el directorio `shap/` incluye valores SHAP y la comprobacion contra la verdad plantada.
- Soporte de variables categoricas: mediante SMOTENC dentro del pipeline y `pandas.Categorical` con niveles declarados en el esquema.
- Inferencia en CPU para las variantes lineales y de arboles; la variante RBF puede requerir cuML si se recarga tal cual.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).

## Casos de uso

- Prototipado de un pipeline de prediccion de fallos de liquidacion: el repositorio sirve como esqueleto completo (generacion de datos, ingenieria de caracteristicas, validacion sin fuga de etiquetas, calibracion y SHAP) que un equipo de middle office puede replicar despues sustituyendo el generador sintetico por datos reales.
- Evaluacion comparativa de estrategias frente al desbalanceo: al publicar metricas para las combinaciones de modelo y remuestreo, permite medir con datos concretos que SMOTENC degrada el rendimiento en este problema (PR-AUC de 0,189 en XGBoost con SMOTE frente a 0,333 sin remuestreo) y justificar decisiones de diseno.
- Comparacion de tecnicas de calibracion: las variantes Platt e isotonica permiten estudiar el efecto de la calibracion sobre el Brier y sobre la precision a umbrales operativos, un paso critico cuando la puntuacion se usa para priorizar colas de trabajo.
- Auditoria y explicabilidad de modelos de riesgo: el material SHAP y la comprobacion contra la verdad plantada sirven como plantilla para demostrar a un comite de validacion que las variables relevantes son las que el negocio espera, y que no hay fuga de etiqueta.
- Docencia y formacion interna: es un caso de estudio autocontenido y de tamano reducido (0,1 GB) sobre clasificacion tabular desbalanceada, util para formar a analistas en metricas adecuadas (PR-AUC, recall en el top 2 por ciento) en lugar de exactitud.
- Referencia para seleccion de umbral operativo: las metricas "recall en el top 2 por ciento" y "recall con precision 0,5" permiten ilustrar como se elige un punto de corte segun la capacidad real de un equipo para revisar excepciones.
- Prueba de integracion de modelos tabulares en infraestructura de serving: al ser artefactos joblib y JSON de XGBoost, se pueden desplegar en servicios ligeros y usarse para validar el ciclo completo de carga, versionado y monitorizacion.

## Benchmarks y rendimiento

Metricas de test del periodo sintetico, con puntuaciones calibradas, tal como las publica el autor:

| Modelo | Remuestreo | PR-AUC | Recall en el top 2 % | Recall con precision 0,5 | Brier |
|---|---|---|---|---|---|
| logreg | ninguna | 0,305 | 0,210 | 0,175 | 0,0367 |
| logreg | class_weight | 0,288 | 0,198 | 0,134 | 0,0376 |
| logreg | smote | 0,244 | 0,172 | 0,069 | 0,0396 |
| svm_linear | smote | 0,245 | 0,172 | 0,071 | 0,0396 |
| svm_linear | ninguna | 0,296 | 0,203 | 0,151 | 0,0371 |
| svm_linear | class_weight | 0,290 | 0,199 | 0,139 | 0,0376 |
| svm_rbf | smote | 0,218 | 0,163 | 0,061 | 0,0387 |
| svm_rbf | class_weight | 0,319 | 0,218 | 0,202 | 0,0361 |
| svm_rbf | ninguna | 0,213 | 0,181 | 0,053 | 0,0427 |
| xgb | scale_pos_weight | 0,332 | 0,231 | 0,239 | 0,0350 |
| xgb | ninguna | 0,333 | 0,234 | 0,253 | 0,0350 |
| xgb | smote | 0,189 | 0,146 | 0,015 | 0,0393 |

Comprobacion de explicabilidad: correlacion de rango de SHAP frente a la verdad plantada de 0,96, y todas las caracteristicas fuertes por encima de todas las debiles (verdadero).

El autor senala expresamente que la exactitud no es una metrica titular: con una tasa de fallo del 3 por ciento, predecir siempre "liquida" ronda el 97 por ciento de exactitud. No hay resultados sobre datos reales ni comparaciones con sistemas externos.

## Requisitos de hardware

- El autor no publica requisitos de hardware, VRAM ni latencias.
- El repositorio completo ocupa 0,1 GB, por lo que el almacenamiento y la memoria necesarios son muy reducidos en comparacion con modelos de lenguaje.
- Las variantes de regresion logistica, SVM lineal y XGBoost con 20 caracteristicas son candidatas a inferencia en CPU sin GPU dedicada; es una estimacion orientativa derivada de la familia de modelos y del tamano del repositorio, no un dato publicado.
- La variante `svm_rbf_calibrated.joblib` se ajusto con cuML en GPU cuando estaba disponible, segun la model card; recargarla requiere cuML, lo que condiciona el entorno de despliegue de esa variante concreta.
- No cabe plantear sharding, tensor parallelism ni despliegue multi-GPU: el cuello de botella es el tamano de la submuestra del SVM RBF, no el computo por token.
- Opciones de despliegue razonables: un servicio Python con `joblib` y `xgboost`, o un contenedor ligero con el entorno de scikit-learn, imbalanced-learn, shap y, si se usa el SVM RBF, cuML. No aplica el uso de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables publicados por terceros (mismo problema, mismo enfoque o mismo origen de datos). La comparativa factible es interna, entre las cuatro familias del propio repositorio:

| Modelo | PR-AUC (mejor variante) | Recall con precision 0,5 | Brier | Calibracion | Requiere GPU/cuML |
|---|---|---|---|---|---|
| logreg | 0,305 (sin remuestreo) | 0,175 | 0,0367 | Sobre validacion | No |
| svm_linear | 0,296 (sin remuestreo) | 0,151 | 0,0371 | Platt | No |
| svm_rbf | 0,319 (class_weight) | 0,202 | 0,0361 | Platt | Si, para recargar |
| xgb | 0,333 (sin remuestreo) | 0,253 | 0,0350 | Ninguna / isotonica | No |

XGBoost es la familia con mejor PR-AUC, mejor recall a precision 0,5 y mejor Brier; el SVM RBF con pesos de clase es la mejor alternativa no basada en arboles. En todos los casos, aplicar SMOTE empeora el resultado.

## Limitaciones y advertencias

- Entrenamiento exclusivamente con datos sinteticos: el autor advierte de que los modelos no estan validados con operaciones reales y no deben usarse para decisiones de liquidacion reales.
- La distribucion de los datos sinteticos la define un generador con semilla; las relaciones aprendidas pueden no transferirse a datos de produccion, y no se publica una validacion en dominio real.
- Riesgo de sobreajuste al escenario simulado: el propio repositorio incluye un experimento de escenario retenido, lo que sugiere que el comportamiento fuera del escenario de entrenamiento es una preocupacion reconocida.
- Tasa de fallo del 3 por ciento: la exactitud es enganosa y cualquier evaluacion debe usar PR-AUC, recall en el top 2 por ciento o curvas de precision-recall.
- Sensibilidad al remuestreo: SMOTENC degrada sistematicamente las metricas en las cuatro familias; reutilizar esa estrategia sin revalidar es un riesgo.
- Dependencia de cuML para `svm_rbf_calibrated.joblib` si se recarga tal cual, lo que limita su portabilidad a entornos con GPU.
- Las variables de entrada deben presentarse con exactamente los 20 campos y los niveles categoricos de `feature_schema.json`; cualquier cambio de esquema invalida el modelo.
- Sin senales de adopcion: 0 descargas y 0 likes implican ausencia de validacion externa, de informes de errores y de mantenimiento por parte de terceros.
- No se declaran idiomas soportados porque el modelo no procesa texto; no es aplicable a tareas de lenguaje.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; la restriccion practica no es legal sino de idoneidad, dado el origen sintetico de los datos.
- El sesgo del generador sintetico se traslada al modelo; no se documenta ningun analisis de sesgo por contraparte, region o tipo de instrumento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohanjain2312/trade-settlement-fail-predictor
- Dataset sintetico: https://huggingface.co/datasets/rohanjain2312/settlement-trades-synthetic
- Repositorio de GitHub: https://github.com/Rohanjain2312/trade-settlement-fail-predictor
- Documentacion tecnica del repositorio (CLAUDE.md): https://github.com/Rohanjain2312/trade-settlement-fail-predictor/blob/main/CLAUDE.md
- Perfil del autor en GitHub: https://github.com/Rohanjain2312/Rohanjain2312
- Perfil del autor en HuggingFace: https://huggingface.co/rohanjain2312/models
- Referencia externa sobre flujos de prediccion de fallos de liquidacion (Inferensys): https://inferensys.com/automate/quant-trading-workflow-automation/ai-agentic-workflow-for-settlement-failure-prediction-and-resolution
- Referencia externa sobre prevencion predictiva de fallos de liquidacion (Chainscore Labs): https://chainscorelabs.com/use-cases/settlement-operations/exception-handling-and-investigations/predictive-settlement-fail-prevention
