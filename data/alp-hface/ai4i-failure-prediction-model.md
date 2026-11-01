# ALP-hface/ai4i-failure-prediction-model

## Resumen

El modelo `ai4i-failure-prediction-model` es un clasificador tabular de scikit-learn basado en `HistGradientBoostingClassifier` que predice fallos de maquinaria a partir de las condiciones de proceso de una operación de fresado. Lo desarrolla el usuario ALP-hface (ALP ATA) y se entrena sobre el conjunto de datos público AI4I 2020 Predictive Maintenance Dataset del repositorio UCI. No es un modelo de lenguaje: es un artefacto de machine learning clásico serializado con joblib, orientado a mantenimiento predictivo industrial.

El modelo resuelve un problema de clasificación binaria: dado un registro con el tipo de calidad del producto (L, M, H), temperatura del aire, temperatura del proceso, velocidad de rotación, par y desgaste de la herramienta, estima la probabilidad de fallo. La pipeline deriva además tres magnitudes físicas (diferencia de temperaturas, potencia mecánica y desgaste × par) antes de clasificar. Es relevante como ejemplo reproducible de un flujo completo de mantenimiento predictivo con métricas publicadas, aunque su utilidad práctica está limitada por la naturaleza sintética del dataset.

El tamaño del repositorio es de 0.0 GB, la licencia es MIT y la fecha de creación registrada es 2026-10-28. No dispone de descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (`HistGradientBoostingClassifier` de scikit-learn) con pipeline de ingeniería de características |
| Parametros totales | no disponible (modelo de árboles; el número de parámetros no aplica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de 6 columnas originales + 3 derivadas) |
| Tipos de cuantizacion | no disponible (no aplica; serialización joblib) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (modelo y código); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | joblib (serializado con scikit-learn 1.9.1, Python 3.12.3) |

## Arquitectura y entrenamiento

La arquitectura es un `HistGradientBoostingClassifier` de scikit-learn, un algoritmo de gradient boosting sobre árboles de decisión con binning histórico de características. La pipeline incorpora ingeniería de características manual: a partir de las seis variables de entrada (tipo de producto, temperatura del aire, temperatura del proceso, velocidad de rotación, par y desgaste de herramienta) calcula la diferencia proceso-aire, la potencia mecánica y el producto desgaste × par. El modelo se serializa con joblib y requiere el módulo `src/features.py` del repositorio en el `import path` para cargarse correctamente.

El entrenamiento utiliza el AI4I 2020 Predictive Maintenance Dataset (UCI Machine Learning Repository, licencia CC BY 4.0), un conjunto sintético de 10.000 filas según la documentación estándar del dataset. La evaluación se realizó sobre un conjunto de test retenido de 2.000 filas con 68 fallos reales, split estratificado y semilla 42. Se reporta además validación cruzada de 5 pliegues sobre el conjunto de entrenamiento con F1 de 0,853 ± 0,016. No se documenta el uso de RLHF, DPO ni técnicas de ajuste fino adicionales, algo esperable en un modelo de este tipo.

## Capacidades

- Clasificación binaria tabular: predice probabilidad de fallo (`predict_proba`) y etiqueta de fallo a partir de condiciones de proceso.
- Ingeniería de características integrada: deriva diferencia de temperaturas, potencia mecánica y desgaste × par automáticamente.
- Predicción calibrada como probabilidad, adecuada para umbralización según coste de falsos positivos y falsos negativos.
- Entrada tabular estructurada con seis columnas; no admite texto, imágenes ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de lenguaje.
- No dispone de modo de razonamiento explícito (thinking mode) ni visión.

## Casos de uso

- Monitorización de fresadoras en planta piloto: el modelo evalúa cada registro de sensores (temperatura, velocidad, par, desgaste) y emite una probabilidad de fallo que puede usarse para disparar alertas cuando supera un umbral configurable.
- Priorización de mantenimiento preventivo: con precisión del 94,9 % y recall del 82,4 % en el test sintético, permite ordenar las máquinas por riesgo y planificar intervenciones en las de mayor probabilidad.
- Prototipado de pipelines de mantenimiento predictivo: sirve como referencia reproducible (código, datos y métricas publicados) para validar la infraestructura de ingesta y scoring antes de sustituir el modelo por uno entrenado con datos reales.
- Docencia y experimentación con gradient boosting tabular: el repositorio y el demo en Hugging Face Spaces permiten ilustrar el flujo completo desde features físicas hasta evaluación con PR-AUC y matriz de confusión.
- Análisis de sensibilidad de umbrales: al exponer `predict_proba`, se puede ajustar el punto de corte para equilibrar los 12 fallos no detectados y las 3 falsas alarmas del test según el coste operativo.
- Integración en sistemas de alerta temprana vía API: el artefacto joblib puede servirse detrás de un endpoint que reciba lecturas de sensores y devuelva la probabilidad de fallo, con la salvedad de fijar la versión de scikit-learn.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test retenido (2.000 filas, 68 fallos reales, split estratificado, semilla 42):

| Metrica | Valor |
|---|---|
| Precision | 94,9 % |
| Recall | 82,4 % |
| F1 | 0,882 |
| PR-AUC | 0,901 |
| Fallos no detectados | 12 |
| Falsas alarmas | 3 |

Validación cruzada de 5 pliegues sobre el conjunto de entrenamiento: F1 de 0,853 ± 0,016. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un artefacto de árboles serializado con joblib y se ejecuta en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU es suficiente para inferencia.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB y el modelo es de tamaño reducido.
- Opciones de despliegue: carga directa con `joblib.load` en Python 3.12.3 con scikit-learn 1.9.1, o servicio HTTP propio (FastAPI, Flask) que envuelva la inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ALP-hface/ai4i-failure-prediction-model | HistGradientBoosting (scikit-learn) | no disponible | entrada tabular de 9 features | F1 0,882; PR-AUC 0,901 en test sintético | MIT | Hugging Face + GitHub + Space |
| Alternativas de gradient boosting (XGBoost, LightGBM, CatBoost) sobre AI4I 2020 | Gradient boosting tabular | no disponible | entrada tabular | no disponible en esta ficha | según librería | públicas |
| Modelos de clasificación tabular de referencia en UCI AI4I | varios (árboles, regresión logística) | no disponible | entrada tabular | no disponible en esta ficha | variable | públicas |

No se dispone de datos de comparación directa publicados en la información proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El dataset AI4I 2020 es sintético y sus fallos siguen reglas fijas; las métricas publicadas no se trasladan a datos reales de máquina, donde los límites no son nítidos y los sensores tienen ruido.
- Los fallos por desgaste de herramienta y los fallos aleatorios se asignan al azar en el dataset y no son predecibles por el modelo.
- Riesgo de sobreajuste a la distribución sintética: un F1 de 0,882 en test no implica rendimiento equivalente en producción.
- Dependencia estricta de versiones: el artefacto se guardó con scikit-learn 1.9.1 y Python 3.12.3; cargarlo con otras versiones puede fallar o producir resultados inconsistentes.
- Requiere el módulo `src/features.py` del repositorio en el `import path` para la carga correcta.
- Licencia MIT para modelo y código, con atribución requerida a los datos de entrenamiento bajo CC BY 4.0 (UCI).
- No procesa texto ni otros formatos; cualquier caso de uso fuera de la clasificación tabular de las seis variables descritas queda fuera de su alcance.
- No hay información sobre sesgos más allá de los derivados de la generación sintética del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ALP-hface/ai4i-failure-prediction-model
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ALP-hface/ai4i-failure-prediction
- Código fuente, datos y resultados: https://github.com/ALP-gthub/ai4i-predictive-maintenance
- Dataset AI4I 2020 (UCI): https://doi.org/10.24432/C5HS5C
