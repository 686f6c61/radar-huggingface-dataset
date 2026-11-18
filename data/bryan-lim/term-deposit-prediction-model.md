# Bryan-Lim/term-deposit-prediction-model

## Resumen

El modelo `Bryan-Lim/term-deposit-prediction-model` es un clasificador binario tabular entrenado para predecir la probabilidad de que un cliente bancario contrate un depósito a plazo (term deposit) tras una campaña de telemarketing. Lo desarrolla Bryan Lim en el marco de la asignatura MN1135 Business Data Science del programa de Management, y se distribuye como artefactos serializados con `joblib` (modelo, escalador y lista de nombres de features), no como pesos de red neuronal.

No es un modelo de lenguaje ni un transformer: se trata de un pipeline clásico de scikit-learn (versión 1.6.1 declarada) sobre un dataset tabular de 32.942 filas tras deduplicación y 15 features de entrada que, tras one-hot encoding, se expanden a 48 columnas. La tarea es de clasificación binaria con etiquetas `yes`/`no` y el modelo se ha configurado con `class_weight='balanced'` para priorizar el recall de la clase minoritaria.

Su relevancia es acotada: es un artefacto académico reproducible, con licencia MIT y métricas declaradas (accuracy 0,85; recall macro 0,83; F1 macro 0,73), útil como ejemplo de pipeline de scoring de propensión en banca minorista, pero sin benchmarking frente a alternativas ni soporte multilingüe más allá del indonesio (`id`) en la documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de machine learning tabular sobre scikit-learn 1.6.1 (algoritmo concreto no especificado en la model card) |
| Parámetros totales | no disponible (no es un modelo neuronal; el repo ocupa 0.0 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantización | no disponible (artefactos `joblib`; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | indonesio (`id`) según la model card y los metadatos |
| Licencia | MIT |
| Formato de pesos | `joblib` (ficheros `model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`) |

## Arquitectura y entrenamiento

La model card no detalla el estimador concreto empleado (regresión logística, random forest, gradient boosting u otro). Lo que sí se documenta es el pipeline: un escalador serializado aparte (`scaler.joblib`), un conjunto de features codificadas mediante one-hot encoding (de 15 features originales a 48 columnas) y un clasificador binario con `class_weight='balanced'`. El artefacto se distribuye junto a `feature_names.joblib`, lo que permite reconstruir el orden de columnas esperado en inferencia.

El entrenamiento se realizó sobre el dataset público "Banking Dataset Classification" de Kaggle, con 32.942 filas tras eliminar duplicados. Las features incluyen variables demográficas (`age`, `job`, `marital`, `education`), financieras (`default`, `housing`, `loan`), de campaña (`campaign`, `previous`, `poutcome`, `contact`, `month`, `day_of_week`) y de la llamada (`duration`, `pdays`). No se documenta el número de épocas, la partición train/test exacta, ni si hubo calibración de probabilidades, búsqueda de hiperparámetros o validación cruzada.

## Capacidades

- Clasificación binaria de propensión: devuelve la probabilidad de que un cliente contrate (`1`) o rechace (`0`) un depósito a plazo.
- Procesamiento de datos tabulares mixtos: combina variables numéricas (`age`, `duration`, `campaign`, `pdays`, `previous`) y categóricas codificadas con one-hot encoding.
- Scoring por lotes: al ser un artefacto `joblib` cargable con `joblib.load`, se puede aplicar sobre un `DataFrame` de pandas con las 48 columnas esperadas.
- Integración con scikit-learn: al seguir la API estándar de `predict`/`predict_proba` (implícita en el pipeline), puede insertarse en `Pipeline` y `ColumnTransformer` propios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje natural, solo features estructuradas.

## Casos de uso

- Priorización de leads en campañas de telemarketing: ordenar la lista de clientes por `predict_proba` para que los agentes llamen primero a los de mayor propensión, reduciendo el coste por contacto.
- Segmentación de cartera para depósitos a plazo: aplicar el modelo a la base de clientes y agrupar por deciles de probabilidad para diseñar ofertas diferenciadas por segmento.
- Dimensionamiento de campañas: estimar cuántos clientes contactar para alcanzar un objetivo de captación, usando el recall del 81,13 % en la clase positiva como cota de detección.
- Análisis de sensibilidad de features: entrenar variantes del pipeline sin `duration` para evaluar el rendimiento en un escenario de scoring previo a la llamada (la model card advierte que `duration` solo se conoce al final).
- Material docente y reproducibilidad: servir como ejemplo de pipeline completo (escalado, one-hot, `class_weight='balanced'`, métricas por clase) en cursos de business data science.
- Prototipado de scoring de propensión en banca minorista: usar el artefacto como línea base antes de invertir en modelos propietarios o en features transaccionales más ricas.
- Auditoría de sesgo demográfico: analizar la tasa de positivos predicha por grupos de `age`, `job` o `education` para detectar disparidades antes de desplegar.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test reservado:

| Métrica | Clase 0 (No) | Clase 1 (Yes) | Media macro |
|---|---|---|---|
| Precision | 0,97 | 0,42 | 0,70 |
| Recall | 0,86 | 0,81 | 0,83 |
| F1-score | 0,91 | 0,55 | 0,73 |
| Accuracy | — | — | 0,85 |

No se han publicado comparaciones con otros modelos (regresión logística, XGBoost, LightGBM) sobre el mismo split en la información disponible. Tampoco se documenta la matriz de confusión completa ni el umbral de decisión utilizado.

## Requisitos de hardware

- Inferencia en CPU: suficiente para el tamaño del artefacto (repo de 0.0 GB); no requiere GPU.
- VRAM estimada: 0 GB; el modelo se ejecuta en memoria RAM del proceso Python.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica; cualquier CPU moderna sirve.
- Despliegue: carga directa con `joblib` + `pandas`, o empaquetado en un servicio REST (FastAPI, Flask) o en un job por lotes. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponibles; dependerán del estimador concreto y del tamaño del lote, no documentados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, en la literatura de propensión bancaria sobre el dataset "Bank" de UCI (origen del dataset de Kaggle empleado) son habituales la regresión logística, random forest y gradient boosting, pero no se han publicado métricas de este artefacto frente a ellos en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bryan-Lim/term-deposit-prediction-model | no disponible | no aplica | accuracy 0,85; recall clase 1 0,81 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Validez poblacional restringida: el modelo solo es aplicable a segmentos de clientes y condiciones macroeconómicas similares a las del dataset original; no se documenta la procedencia geográfica ni temporal de los datos.
- Correlación no implica causalidad: la relación entre `duration` larga y mayor interés es asociativa; no debe interpretarse como palanca de negocio.
- Fuga de información potencial: `duration` solo se conoce al finalizar la llamada, por lo que su uso en scoring previo a la llamada invalida el modelo. La model card lo advierte explícitamente.
- Tasa de falsos negativos del 18,87 % en la clase positiva: aproximadamente uno de cada cinco clientes potenciales no será detectado.
- Precisión baja en la clase positiva (0,42): más de la mitad de las predicciones positivas serán falsos positivos, lo que encarece las campañas si se contacta a todos los marcados.
- Sesgos demográficos no evaluados: no se reportan métricas de equidad por `age`, `job`, `education` ni `marital`, pese a ser variables sensibles en decisiones de crédito y marketing financiero.
- Idiomas: la documentación está en indonesio y el modelo no procesa texto libre; el tag `id` refleja el idioma de la model card, no una capacidad multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; el autor no ofrece soporte ni mantenimiento (repo con 0 descargas y 0 likes en el momento de la consulta).
- Ausencia de versionado de datos y de semilla: no se documenta el split train/test, lo que dificulta la reproducción exacta de las métricas.
- Fecha de creación futura en los metadatos (2026-11-18): conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Bryan-Lim/term-deposit-prediction-model
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/rashmiranu/banking-dataset-classification
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
- Documentación de huggingface_hub: https://huggingface.co/docs/huggingface_hub
