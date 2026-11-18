# hengki8-s/financial-fraud-detection-model

## Resumen

El modelo `hengki8-s/financial-fraud-detection-model` es un clasificador binario de tablas (tabular) entrenado para detectar transacciones financieras potencialmente fraudulentas. Lo desarrolla el usuario de Hugging Face hengki8-s como parte de un proyecto académico de la asignatura MN1135 - Business Data Science, y se distribuye con licencia MIT. No es un modelo de lenguaje ni una red neuronal: es un artefacto de scikit-learn serializado con `joblib` que contiene un Random Forest Classifier ajustado (tuned) junto con el escalador, la lista de nombres de características y metadatos auxiliares.

El modelo resuelve un problema clásico de clasificación binaria con clases extremadamente desbalanceadas (98,74 % de transacciones normales frente a 1,26 % de fraude) sobre un conjunto de datos sintético de 10.000 filas y 11 columnas originales, expandido a 21 características tras aplicar one-hot encoding y extracción temporal. Su relevancia es limitada y muy contextual: sirve como ejemplo didáctico de pipeline de detección de fraude, pero sus métricas sobre la clase minoritaria (recall del 8 % y precision del 11 %) lo inhabilitan para uso productivo real sin un sistema de verificación secundario.

El repositorio ocupa 0,0 GB, no registra descargas ni interacciones, y se publicó y actualizó el 18 de noviembre de 2026. El idioma declarado es indonesio (`id`), coherente con el origen académico del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Classifier (scikit-learn), no es una red neuronal |
| Parametros totales | no disponible (el número de árboles y su profundidad no se especifica en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica; el artefacto se serializa con `joblib` |
| Idiomas soportados | indonesio (`id`) en la documentación; las características de entrada son numéricas y categóricas, no texto libre |
| Licencia | MIT |
| Formato de pesos | `joblib` (artefactos `.joblib`: modelo, escalador, nombres de características y metadatos) |

## Arquitectura y entrenamiento

El modelo es un Random Forest Classifier de scikit-learn sometido a un proceso de ajuste de hiperparámetros (tuned) que la model card no detalla: no se especifican el número de estimadores, la profundidad máxima, los criterios de división ni la estrategia de búsqueda. El pipeline incluye un escalador (`scaler.joblib`) aplicado sobre las columnas numéricas, cuyos nombres se almacenan en `metadata.joblib` bajo la clave `kolom_numerik`. La entrada consta de 21 características: variables numéricas (`amount`, `risk_score`, `hour`, `day_of_week`, `month`, `day`) y variables categóricas codificadas mediante one-hot encoding (`account_type`, `category`, `payment_method`, `device_type`, `currency`).

El entrenamiento se realizó sobre el dataset público "Financial Transactions & Fraud Detection Dataset" de Kaggle, con 10.000 filas y 11 columnas originales, y una proporción de fraude del 1,26 %. La evaluación se hizo sobre un conjunto de prueba independiente de 2.000 transacciones. No se documenta ninguna técnica de remuestreo (SMOTE, class weighting, undersampling) ni de validación cruzada, lo que explica en parte el bajo recall obtenido. La versión de scikit-learn requerida es 1.6.1 y se asume Python 3.10 o superior.

## Capacidades

- Clasificación binaria de transacciones financieras en dos clases: fraude (1) y normal (0).
- Cálculo de probabilidad de fraude mediante `predict_proba`, lo que permite umbralizar la decisión según el apetito de riesgo.
- Procesamiento de características tabulares mixtas: numéricas continuas (`amount`, `risk_score`), temporales (`hour`, `day_of_week`, `month`, `day`) y categóricas nominales codificadas.
- Inferencia por lotes o por fila individual en Python, integrable en pipelines de scikit-learn.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- No es multilingüe en sentido estricto: no procesa lenguaje natural, solo variables estructuradas.

## Casos de uso

- Filtro preliminar en pasarelas de pago: el modelo puede puntuar cada transacción entrante y derivar a revisión manual aquellas con probabilidad superior a un umbral configurable, aprovechando su bajo false positive rate (1,97 %) para no bloquear en exceso a clientes legítimos.
- Priorización de alertas para analistas de fraude: dado su recall del 8 %, no detecta la mayoría de fraudes, pero puede usarse como una señal más dentro de un motor de reglas que combine `risk_score`, importe y hora para ordenar la cola de revisión.
- Prototipado y docencia: sirve como ejemplo reproducible de pipeline completo (carga de datos, escalado, one-hot encoding, entrenamiento y serialización con `joblib`) en cursos de ciencia de datos aplicada a negocio.
- Verificación secundaria con OTP: integrar la probabilidad del modelo como disparador de autenticación reforzada (SMS/OTP) en transacciones de importe elevado, aceptando que la cobertura sobre fraude real es baja.
- Análisis exploratorio de reglas de negocio: las importancias de características del Random Forest (no publicadas en la model card) podrían orientar qué variables monitorizar, aunque este uso requiere reentrenamiento y auditoría.
- Simulación de entornos de fraude en pruebas de integración: el artefacto permite generar respuestas deterministas para validar el cableado de sistemas de scoring antes de sustituirlo por un modelo en producción.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de prueba independiente de 2.000 transacciones (25 casos de fraude reales, 1.975 normales):

| Metrica | Resultado | Interpretacion |
|---|---|---|
| Accuracy global | 97,90 % | Elevada, pero dominada por la clase mayoritaria |
| Precision (fraude) | 11,00 % | De cada 100 alertas, solo 11 son fraude real |
| Recall (fraude) | 8,00 % | Detecta 2 de cada 25 fraudes reales |
| F1-Score (fraude) | 9,00 % | Equilibrio muy bajo en la clase minoritaria |
| False Positive Rate | 1,97 % | 39 de 1.975 transacciones legítimas bloqueadas temporalmente |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un Random Forest serializado con `joblib`; no requiere GPU y puede ejecutarse en cualquier máquina con Python 3.10+ y scikit-learn 1.6.1.
- VRAM estimada: no aplica (0 GB de VRAM; no usa aceleración por GPU).
- GPU recomendadas: no aplica; no hay soporte CUDA documentado.
- Cabe en cualquier portátil de consumo: el repositorio ocupa 0,0 GB y el artefacto es de tamaño reducido (no se especifica el tamaño exacto de los ficheros `.joblib`).
- Opciones de despliegue: scripts de Python con `joblib.load`, APIs REST envolviendo la inferencia (FastAPI, Flask), o integración directa en pipelines de scikit-learn. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; para un Random Forest de tamaño moderado se espera latencia de milisegundos por fila en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en fraude | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hengki8-s/financial-fraud-detection-model | Random Forest (scikit-learn) | no disponible | no aplica | Recall 8 %, precision 11 %, F1 9 % | MIT | Hugging Face, 0 descargas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Recall muy bajo (8 %): el modelo deja pasar aproximadamente el 92 % de los fraudes reales, por lo que no puede usarse como único mecanismo de protección.
- Precision baja (11 %): genera un volumen alto de falsos positivos relativos a las alertas emitidas, lo que puede saturar equipos de revisión manual.
- El modelo se entrenó sobre datos sintéticos en USD; no es válido para mercados con otras divisas, pagos en efectivo offline u otros patrones de circulación.
- Las correlaciones aprendidas (por ejemplo, `risk_score` alto asociado a `is_fraud`) son asociativas, no causales; cambios en la distribución de las transacciones degradarán el rendimiento sin aviso.
- No se documentan sesgos demográficos ni geográficos, pero al tratarse de un dataset sintético de origen desconocido no puede garantizarse la ausencia de sesgos en subpoblaciones.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de sobreconfianza en las probabilidades emitidas por un modelo con tan pocos positivos de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción exige auditoría propia.
- Dependencia de una versión concreta de scikit-learn (1.6.1); cambios de versión pueden romper la compatibilidad de los artefactos `joblib`.
- El proyecto es académico (UAS, asignatura MN1135), sin mantenimiento ni validación externa documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hengki8-s/financial-fraud-detection-model
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/greatcool/financial-transactions-and-fraud-detection-dataset
