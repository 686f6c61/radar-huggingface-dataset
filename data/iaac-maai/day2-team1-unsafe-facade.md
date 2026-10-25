# iaac-maai/day2-team1-unsafe-facade

## Resumen

`iaac-maai/day2-team1-unsafe-facade` es un clasificador tabular binario que predice si la próxima inspección de fachada de un edificio de Nueva York (programa FISP, Local Law 11) resultará **UNSAFE**. Lo firma el equipo iaac-maai (Amelia, Jerome, Kazuko y Sahil) como trabajo del curso AI Methods I del IAAC MaAI 2026/27, y se publica bajo licencia MIT con un repositorio de 0,1 GB. No es un modelo de lenguaje: es un pipeline de scikit-learn compuesto por imputación por moda, codificación one-hot y un `RandomForestClassifier` de 200 árboles y profundidad máxima 12, envuelto en `TunedThresholdClassifierCV` con umbral de decisión ajustado a 0,30.

El problema que resuelve es de priorización operativa: dado lo que se sabe *antes* de inspeccionar (resultado del ciclo anterior, distrito, ciclo FISP y materiales o tipos de muro de la fachada), ordenar los edificios por riesgo para que el Department of Buildings de Nueva York o un consultor de fachadas decidan qué inmuebles revisar primero. Se entrenó con 43.239 expedientes iniciales de fachada procedentes de NYC Open Data, transformando 19 columnas de entrada en 31 características.

Su relevancia es acotada pero clara: demuestra un flujo completo de machine learning aplicado a datos públicos de entorno construido, con decisiones de diseño explícitas (umbral optimizado para F2, `class_weight="balanced"`, tratamiento del ciclo como categoría y no como magnitud). La salida recomendada por los autores es la probabilidad, no la etiqueta binaria, porque el umbral de 0,30 hace que la clase positiva se marque en la mayoría de los edificios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: imputación por valor más frecuente + codificación one-hot (`handle_unknown="ignore"`) + `RandomForestClassifier` (bagged decision trees) envuelto en `TunedThresholdClassifierCV` |
| Parametros totales | No disponible (no se publica el número de nodos ni el tamaño efectivo del bosque; el repositorio completo ocupa 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada tabular fija de 19 columnas que se expanden a 31 características) |
| Tipos de cuantizacion | No aplica; el artefacto se serializa con `joblib`, sin variantes cuantizadas |
| Idiomas soportados | No aplica como modelo de lenguaje; las variables categóricas usan etiquetas en inglés (`MANHATTAN`, `SAFE`, `NO PRIOR CYCLE`, etc.) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (objeto completo: preprocesado + bosque + umbral) |
| Hiperparámetros clave | `n_estimators=200`, `max_depth=12`, `max_features=0.5`, `min_samples_leaf=1`, `class_weight="balanced"`, `random_state=42`, umbral de decisión 0,295–0,30 |
| Versiones de librerías | scikit-learn 1.9.1, pandas 3.1.0, numpy 2.5.4, joblib 1.6.0, Python 3.14 |
| Tipo de problema | Clasificación binaria (`IS_UNSAFE`: 1 = UNSAFE, 0 = SAFE o SWARMP) |

## Arquitectura y entrenamiento

La arquitectura es un ensamblado de árboles de decisión con bagging sobre datos tabulares, no una red neuronal. El preprocesado trata las columnas nominales (`PRIOR_STATUS`, `BOROUGH`, `CYCLE`) con imputación por moda y one-hot encoding tolerante a categorías desconocidas; las columnas de materiales y tipos de muro, que ya son binarias 1/0, solo pasan por imputación por moda. `CYCLE` se codifica como categoría aunque se almacene como número, de modo que el ciclo 7 no queda "entre" el 6 y el 8. No hay escalado porque todas las entradas resultantes son 0/1, y las 19 columnas originales pasan a ser 31 características. Un edificio puede tener varios materiales y varios tipos de muro simultáneamente (varias columnas a 1).

El entrenamiento usa 43.239 expedientes iniciales de fachada del conjunto DOB NOW: Safety – Facades Compliance Filings de NYC Open Data, con la etiqueta `IS_UNSAFE` y `class_weight="balanced"` para compensar el desequilibrio entre clases. Sobre el bosque se aplica `TunedThresholdClassifierCV`, que selecciona el umbral de decisión mediante validación cruzada con el objetivo declarado de maximizar F2, lo que prioriza el recall sobre la precisión; el valor final es 0,30. La model card no documenta el número exacto de tokens o muestras de validación, la partición temporal, ni si hubo calibración de probabilidades posterior.

## Capacidades

- Clasificación binaria tabular: devuelve 1 (UNSAFE) o 0 (SAFE o SWARMP) a partir de 19 columnas con el esquema exacto exigido.
- Puntuación de riesgo continua: `model.estimator_.predict_proba(X)[:, 1]` ofrece la probabilidad de UNSAFE, que es la salida recomendada para ordenar edificios.
- Tolerancia a datos incompletos: acepta `NaN` en las entradas y los imputa con el valor más frecuente visto en entrenamiento.
- Tolerancia a categorías nuevas o mal escritas en las columnas nominales gracias a `handle_unknown="ignore"` en el codificador one-hot.
- Representación multi-etiqueta de fachada: modela la coexistencia de varios materiales y varios tipos de muro por edificio.
- Integración directa en Python: al ser un objeto `joblib` completo, el preprocesado y el umbral viajan con el modelo y la inferencia es una sola llamada.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; el modelo no procesa lenguaje natural.

## Casos de uso

- Priorización de inspecciones FISP en el Department of Buildings: ordenar las 43.239 y sucesivas fichas del parque por probabilidad de UNSAFE al inicio de cada ciclo de cinco años, de modo que los inspectores empiecen por los edificios con mayor puntuación en lugar de recorrer el listado por orden administrativo.
- Planificación de carga de trabajo de un consultor de fachadas: aplicar el modelo a la cartera de clientes y asignar primero las cuadrillas a los inmuebles con probabilidad alta, dejando los de riesgo bajo para el final del ciclo sin incumplir el plazo legal.
- Triaje previo a la inspección física: usar la probabilidad como filtro para decidir qué edificios requieren una inspección en profundidad y cuáles bastan con una revisión documental, reduciendo horas de campo donde el modelo da riesgo bajo.
- Análisis histórico de materiales: explotar la importancia de variables del bosque para estudiar qué combinaciones de material y tipo de muro (terra cotta, mampostería portante, muro de cavidad) se asocian con resultados UNSAFE, útil para guías técnicas internas.
- Integración en un panel GIS municipal: servir el modelo como endpoint de un servicio Python que, alimentado desde la base de datos de licencias, devuelva la probabilidad por edificio y la pinte en un mapa de calor de riesgo.
- Docencia y reproducción metodológica: el pipeline completo (one-hot + random forest + umbral ajustado a F2) sirve como ejemplo reproducible de clasificación tabular desbalanceada con datos públicos, incluido el contraste entre usar la etiqueta y usar la probabilidad.
- Auditoría de equidad sobre resultados de inspección: cruzar la probabilidad predicha con el distrito (`BOROUGH`) para detectar si el modelo reproduce patrones históricos de desigualdad en la aplicación de la ley de fachadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara las métricas `f1`, `recall` y `precision` en los metadatos y una sección de evaluación que no se incluye en la información proporcionada, por lo que no se dispone de valores numéricos. Tampoco hay comparaciones publicadas con otros modelos sobre este conjunto de datos.

El único dato de comportamiento documentado es cualitativo: el umbral de 0,30 hace que la salida binaria marque la mayoría de los edificios, razón por la cual los autores recomiendan usar la probabilidad para ordenar y no la etiqueta para decidir.

## Requisitos de hardware

- GPU: no necesaria. El modelo es un bosque de 200 árboles de profundidad máxima 12; la inferencia se ejecuta íntegramente en CPU.
- VRAM estimada: 0 GB. El consumo relevante es memoria RAM del proceso Python, no memoria de vídeo.
- Huella en disco: el repositorio completo de HuggingFace ocupa 0,1 GB, incluyendo el `model.joblib` y los artefactos asociados.
- Cabe en cualquier equipo: portátil de consumo, contenedor pequeño, función serverless o incluso un servicio compartido con otros modelos.
- Opciones de despliegue: script de Python con `joblib.load`, API REST con FastAPI o Flask, servicio por lotes sobre tablas de base de datos, registro en MLflow o BentoML. vLLM, llama.cpp, TGI y Ollama no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Al no haber GPU ni atención cuadrática, y con un preprocesado limitado a imputación y one-hot, el coste dominante en producción será el acceso a datos, no el cálculo del modelo.
- Reproducibilidad: conviene fijar las versiones declaradas (scikit-learn 1.9.1, pandas 3.1.0, numpy 2.5.4, joblib 1.6.0, Python 3.14) en un entorno aislado, ya que un `joblib` serializado es sensible a cambios de versión de scikit-learn.

## Comparativa con modelos similares

No se dispone de resultados publicados de este modelo ni de alternativas evaluadas sobre el mismo conjunto de datos, por lo que la comparación de rendimiento figura como no disponible. La tabla recoge alternativas algorítmicas plausibles para el mismo problema tabular, no modelos publicados comparables.

| Alternativa | Tipo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `iaac-maai/day2-team1-unsafe-facade` | Random forest + umbral ajustado a F2 | 200 árboles, profundidad 12 | 19 columnas de entrada | No disponible | MIT |
| Gradient boosting (XGBoost o LightGBM) sobre las mismas 31 características | Ensamblado de árboles con boosting | Configurable | Mismas 19 columnas | No disponible | Licencia de la librería (Apache-2.0 / MIT) |
| Regresión logística sobre las mismas 31 características | Modelo lineal con baseline interpretable | Coeficientes por característica | Mismas 19 columnas | No disponible | Licencia de la librería (BSD-3-Clause, scikit-learn) |
| Random forest sin ajuste de umbral (corte en 0,5) | Mismo bosque, decisión por defecto | Idénticos | Mismas 19 columnas | No disponible | MIT |

No se conocen modelos públicos comparables entrenados específicamente para predecir resultados de inspección FISP en Nueva York.

## Limitaciones y advertencias

- No sustituye a una inspección: la model card excluye explícitamente su uso como evidencia de que una fachada concreta es segura.
- La salida binaria con umbral 0,30 marca la mayoría de los edificios; usarla como decisión directa produce una tasa de positivos poco útil para priorizar. Hay que consumir la probabilidad.
- Cobertura geográfica y normativa limitada a Nueva York y al programa FISP; no es trasladable a otras ciudades sin reentrenamiento.
- No cubre edificios de seis plantas o menos, que quedan fuera de FISP y no están en los datos de entrenamiento.
- Los ciclos no vistos en entrenamiento (por ejemplo, el ciclo 11) se codifican como todo ceros en el one-hot, lo que degrada la predicción sin aviso explícito.
- Solo se entrenó con expedientes iniciales; no modela enmiendas ni presentaciones posteriores, de modo que su comportamiento sobre ese tipo de registro es desconocido.
- Riesgo de sesgo geográfico: al usar `BOROUGH` y el estado del ciclo anterior como predictoras, el modelo puede reproducir patrones históricos de desigualdad en la aplicación de la normativa y en el estado de conservación del parque edificado.
- Riesgo de alucinación no aplica (no genera texto), pero sí de sobreconfianza: no se documenta calibración de probabilidades, así que los valores de `predict_proba` deben tratarse como puntuaciones de orden, no como probabilidades calibradas.
- Desequilibrio de clases gestionado con `class_weight="balanced"` y umbral orientado a F2: el modelo favorece el recall y penaliza la precisión, lo que implica falsos positivos frecuentes.
- Sin validación temporal documentada en la información disponible; si el reparto de entrenamiento y prueba es aleatorio, las métricas pueden ser optimistas respecto a un uso prospectivo en ciclos futuros.
- Restricciones de licencia: el código y el modelo son MIT, pero los datos de origen son de NYC Open Data con sus propios términos de uso, que deben respetarse en cualquier redistribución.
- Dependencia estricta del esquema de 19 columnas con nombres exactos; un cambio de nombre o de codificación en el origen de datos rompe la inferencia.
- Fragilidad de reproducibilidad por versiones muy concretas de scikit-learn, pandas, numpy y Python en el artefacto `joblib`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iaac-maai/day2-team1-unsafe-facade
- Repositorio GitHub con el pipeline completo: https://github.com/iaac-maai/group1_day2_assignment
- Conjunto de datos de origen (DOB NOW: Safety – Facades Compliance Filings, NYC Open Data): https://data.cityofnewyork.us/d/xubg-57si
- Términos de uso de NYC Open Data: https://www.nyc.gov/home/terms-of-use.page
