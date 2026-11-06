# AlejandroLiberato/defiende-el-servidor-unsw-nb15

## Resumen

`defiende-el-servidor-unsw-nb15` es un clasificador binario tabular de conexiones de red (normal frente a ataque) entrenado sobre el dataset UNSW-NB15 y publicado en Hugging Face por AlejandroLiberato. No es un modelo de lenguaje ni una red neuronal: es un `sklearn.Pipeline` serializado con `joblib` que encadena imputación, codificación one-hot de tres variables categóricas (`proto`, `service`, `state`) y un `RandomForestClassifier` de 300 árboles. Su propósito es académico: sirve como artefacto de demostración de un flujo MLOps completo (versionado de código con Git, datos con DVC, experimentos con MLflow y modelo con Hugging Face Hub) dentro del curso de MLOps de la Universidad Externado de Colombia (2026-II).

La revisión v2 sustituye la regresión logística de v1 por un bosque aleatorio y eleva el umbral de decisión de 0,5 a 0,64, con el objetivo explícito de reducir la tasa de falsos positivos manteniendo un recall de ataque por encima de 0,95. El resultado en validación es un macro-F1 de 0,9442 con una FPR de 0,0493, aunque la evaluación final sobre el conjunto de test publicado revela una degradación notable (macro-F1 0,9009, FPR 0,1729) atribuida a un cambio en la distribución de tráfico normal entre particiones.

Es relevante ahora como ejemplo reproducible y honesto de ingeniería de ML aplicada a detección de intrusiones, con trazabilidad criptográfica (SHA-256 del modelo y de los datos) y una documentación inusualmente transparente sobre sus propias limitaciones. No debe confundirse con un IDS desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: imputación + one-hot encoding + RandomForestClassifier (300 árboles) |
| Parametros totales | no disponible (no aplica; modelo de árboles, no red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (entrada tabular de 42 variables por muestra) |
| Tipos de cuantizacion | no aplica (serialización `joblib`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | other (sin términos concretos especificados en la model card) |
| Formato de pesos | `model.joblib` (pickle de scikit-learn), SHA-256 `03d398894717439d1e4bc20112309bf0a6a10a5727e2af4349e3baca2ad38a81` |

## Arquitectura y entrenamiento

El modelo es un clasificador supervisado clásico, no una red neuronal. La tubería (`sklearn.Pipeline`) aplica imputación y codificación one-hot sobre las tres variables categóricas (`proto`, `service`, `state`) y alimenta un `RandomForestClassifier` de 300 árboles. La entrada son 42 variables predictoras (39 numéricas y 3 categóricas) derivadas de UNSW-NB15; se excluyen `id`, `attack_cat` (por fuga de etiqueta) y `label`. El preprocesamiento se ajusta únicamente con el conjunto de entrenamiento para evitar contaminación.

Los datos proceden de la partición publicada `UNSW_NB15_training-set.csv` (175.341 filas, SHA-256 `bec7dd5e…48fa`), dividida con `GroupShuffleSplit` por grupos de entradas idénticas en 140.145 filas de entrenamiento y 35.196 de validación (semilla 42, sin grupos compartidos entre ambas). El conjunto `UNSW_NB15_testing-set.csv` (82.332 filas) se reservó para una única evaluación final de la solución congelada. No se documenta uso de RLHF, DPO ni técnicas de aumentación de datos. La innovación metodológica destacable no está en el algoritmo sino en el proceso: selección de umbral sobre una rejilla 0,01–0,99 maximizando la reducción de FPR bajo la restricción de recall de ataque ≥ 0,95, y verificación del SHA-256 del modelo en tiempo de carga mediante `predict.py`.

## Capacidades

- Clasificación binaria de conexiones de red: `0 = normal`, `1 = ataque` (clase positiva).
- Salida de score de probabilidad de ataque (`score_attack`) y etiqueta predicha (`y_pred`) según el umbral 0,64.
- Ingesta directa de DataFrames con las mismas columnas que UNSW-NB15, sin requerir la columna `label`.
- Verificación de integridad del artefacto mediante SHA-256 en la carga.
- Configuración externalizada en `config.json` (umbral, variables de entrada, regla de decisión, referencias).
- Trazabilidad completa de código (Git, tags `code-v2`), datos (DVC) y experimentos (MLflow run `ef3b2eaf90874ea5ae5b4b867327f00d`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo tabular sin interfaz conversacional.

## Casos de uso

- Docencia y formación en MLOps: el repositorio sirve como caso completo y reproducible de versionado de código, datos y modelos, con artefactos verificables (SHA-256, DVC, MLflow) que los alumnos pueden auditar y replicar.
- Detección de anomalías en tráfico de red en entornos controlados: el modelo clasifica conexiones a partir de 42 features de flujo y puede integrarse en un laboratorio o banco de pruebas para comparar algoritmos de detección de intrusiones.
- Filtrado previo de alertas en un SOC simulado: con una FPR de 0,0493 en validación, reduce el volumen de alertas falsas frente a la versión v1 (FPR 0,1741), lo que permite demostrar el impacto operativo del ajuste de umbral.
- Evaluación comparativa de algoritmos supervisados: la model card documenta la transición de regresión logística a random forest con métricas antes/después, útil como referencia en estudios sobre selección de modelos en detección de intrusiones.
- Generación de pipelines de inferencia por lotes: el script `predict.py` permite procesar ficheros CSV de conexiones y obtener scores, integrable en flujos de validación automatizada.
- Auditoría de reproducibilidad: la cadena de referencias (commit de entrenamiento `ecbb4899…`, tag `code-v2`, md5 de `prepared.dvc` y `raw.dvc`, run de MLflow) permite reconstruir el experimento desde cero y verificar que el artefacto publicado corresponde al entrenamiento declarado.
- Análisis de deriva (data drift): la diferencia entre validación (FPR 0,0493) y test (FPR 0,1729) constituye un caso práctico para estudiar cómo los cambios en la proporción de tráfico normal (32 % frente a 45 %) afectan al rendimiento de un clasificador.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre UNSW-NB15, umbral 0,64:

| Conjunto | Recall ataque | Precision ataque | FPR | Macro-F1 | Accuracy |
|---|---|---|---|---|---|
| Validación (35.196 filas) | 0,9511 | 0,9766 | 0,0493 | 0,9442 | 0,9510 |
| Test (82.332 filas) | 0,9656 | 0,8725 | 0,1729 | 0,9009 | no disponible |

Matriz de confusión en validación (filas = real, columnas = predicho): `[[TN=10575, FP=548], [FN=1176, TP=22897]]`.
Matriz de confusión en test: `[[TN=30604, FP=6396], [FN=1558, TP=43774]]`.

Comparativa v1 frente a v2 en validación:

| Métrica | v1 (E1, umbral 0,5) | v2 (E4, umbral 0,64) |
|---|---|---|
| Recall de ataque | 0,9870 | 0,9511 |
| Precision de ataque | 0,9246 | 0,9766 |
| FPR | 0,1741 | 0,0493 |
| Macro-F1 | 0,9228 | 0,9442 |
| Falsos negativos | 314 | 1176 |
| Falsos positivos | 1937 | 548 |

No se han publicado comparaciones con otros modelos sobre el mismo dataset en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es sobre CPU. El artefacto `model.joblib` ocupa una fracción del repositorio de 0,2 GB.
- GPU: no necesaria ni soportada de forma nativa por el pipeline de scikit-learn.
- Cabe en cualquier equipo de consumo: el cuello de botella es la memoria RAM para cargar el bosque y el DataFrame de entrada, no la GPU.
- Despliegue: ejecución directa con Python 3.12 y las dependencias fijadas en `requirements.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos tabulares).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un random forest de 300 árboles sobre 42 features, la inferencia por muestra es de orden de microsegundos a milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia interna, la propia model card compara la revisión v2 (random forest, umbral 0,64) con la v1 (regresión logística, umbral 0,5) del mismo autor sobre el mismo dataset:

| Modelo | Algoritmo | Umbral | Macro-F1 (val) | FPR (val) | Licencia |
|---|---|---|---|---|---|
| v2 (este modelo) | Random forest, 300 árboles | 0,64 | 0,9442 | 0,0493 | other |
| v1 | Regresión logística | 0,5 | 0,9228 | 0,1741 | other |

Comparación con alternativas externas (por ejemplo, otros clasificadores publicados sobre UNSW-NB15): no disponible.

## Limitaciones y advertencias

- Dataset sintético e histórico (UNSW-NB15, banco de pruebas de 2015): no demuestra eficacia sobre tráfico de una red actual.
- Degradación en test: la FPR sube de 0,0493 (validación) a 0,1729 (test), atribuida a una mayor proporción de tráfico normal (45 % frente a 32 %) y a tráfico normal sin servicio identificado. Las métricas de validación no son representativas del rendimiento real esperado.
- Solapamiento de particiones: aproximadamente el 10 % de las filas de test tienen entradas idénticas a filas de entrenamiento o validación en las particiones publicadas.
- Etiquetas contradictorias: 229 grupos de entradas idénticas (940 filas) presentan etiquetas contradictorias en entrenamiento, lo que constituye un error irreducible.
- Sesgo de selección de umbral: el umbral 0,64 se eligió sobre la misma validación donde se reportan las métricas, por lo que estas pueden ser algo optimistas.
- Riesgo de seguridad en la carga: el pickle de scikit-learn solo debe cargarse desde fuentes de confianza y con las versiones de dependencias fijadas; un `joblib` manipulado puede ejecutar código arbitrario.
- Licencia `other` sin términos concretos: no se especifican condiciones de uso comercial, atribución ni redistribución. Es imprescindible contactar con el autor antes de cualquier uso fuera del ámbito académico.
- No es un IDS de producción, tal como declara explícitamente el autor.
- Sin soporte multilingüe, conversacional ni de agentes: cualquier uso fuera de la clasificación tabular de conexiones queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlejandroLiberato/defiende-el-servidor-unsw-nb15
- Repositorio de código (GitHub): https://github.com/alejobernalg/defiende-el-servidor
- Referencia del dataset: Moustafa, N., & Slay, J. (2015). UNSW-NB15: a comprehensive data set for network intrusion detection systems. MilCIS.
- Referencia de evaluación: Moustafa, N., & Slay, J. (2016). The evaluation of NIDS datasets. Information Security Journal.
- Run de MLflow: `ef3b2eaf90874ea5ae5b4b867327f00d` (exportado en `evidencias/mlflow/` del repositorio)
- Commit de entrenamiento: `ecbb4899184b23336917b40f32269aff490e89b5`; tag `code-v2`: `43878a7f4a57fa283de43b24ba990a197a7b5598`
- Revisión evaluada en test: `6282a4d6e05d473f37d0243f3bfa18b10116586e`
