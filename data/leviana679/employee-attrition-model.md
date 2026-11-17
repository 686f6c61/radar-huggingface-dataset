# Leviana679/employee-attrition-model

## Resumen

`Leviana679/employee-attrition-model` es un modelo de clasificación tabular binaria publicado en Hugging Face por el usuario Leviana679. Su objetivo declarado es predecir la rotación de empleados (employee attrition) a partir de variables tabulares, presumiblemente del conocido dataset IBM HR Employee Attrition. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un artefacto de scikit-learn serializado con joblib, concretamente un Random Forest con ajuste de hiperparámetros según la model card.

El modelo tiene un tamaño de repositorio de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026. La información técnica disponible es muy limitada: la model card solo aporta métricas de evaluación y una descripción de una línea. No se documentan el número de árboles, la profundidad, el conjunto de features de entrada, el proceso de preprocesado ni la composición del dataset de entrenamiento.

La relevancia práctica de este artefacto es escasa tal como está publicado. Las métricas reportadas en la propia model card (F1, recall y precision iguales a 0.0, ROC-AUC de 0.545) indican un rendimiento prácticamente equivalente a un clasificador aleatorio o a un modelo que predice siempre la clase mayoritaria. Cualquier evaluación seria de este modelo para producción debería partir de una reproducción independiente de las métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn), clasificación tabular binaria |
| Parametros totales | no disponible (no aplica; modelo de árboles, no red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (entrada tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (artefacto joblib de scikit-learn) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es un Random Forest de scikit-learn con ajuste de hiperparámetros, según indica la model card. No se especifican el número de estimadores, la profundidad máxima, los criterios de split, el balanceo de clases ni las técnicas de validación cruzada empleadas. Tampoco se documenta el pipeline de preprocesado (codificación de variables categóricas, escalado, tratamiento de nulos) ni el conjunto exacto de features de entrada.

El problema abordado es la predicción de rotación de empleados, típicamente formulado sobre el dataset IBM HR Employee Attrition, que contiene 1.470 registros y 35 variables (edad, departamento, satisfacción laboral, años en la empresa, salario, etc.). La clase positiva suele representar aproximadamente el 16 % de los casos, lo que hace del desbalanceo un factor crítico. La model card no confirma la procedencia del dataset ni describe si se aplicaron técnicas de remuestreo, ponderación de clases o ajuste de umbral. No se menciona ningún proceso de RLHF, DPO ni entrenamiento por refuerzo, algo por otra parte ajeno a este tipo de modelo.

## Capacidades

- Clasificación binaria tabular: predice la probabilidad de rotación (attrition) a partir de un vector de features numéricas y categóricas.
- Integración con el ecosistema scikit-learn: al ser un artefacto joblib, puede cargarse con `joblib.load` y usarse con la API estándar `predict` / `predict_proba`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo thinking ni de capacidades especiales adicionales.

## Casos de uso

- Prototipado de un pipeline de RR. HH. predictivo: serviría como punto de partida para construir un clasificador de rotación, aunque con las métricas reportadas requeriría reentrenamiento y validación antes de cualquier uso real.
- Docencia y demostración de clasificación tabular desbalanceada: útil como ejemplo de artefacto joblib y de los problemas típicos de métricas degeneradas (F1 = 0.0 con ROC-AUC cercana a 0.5).
- Baseline de comparación: puede emplearse como referencia mínima frente a modelos más elaborados (XGBoost, LightGBM, regresión logística calibrada) en experimentos internos.
- Integración en notebooks de análisis exploratorio: cargar el modelo y aplicar `predict_proba` sobre el dataset IBM HR para inspeccionar la distribución de probabilidades.
- Pruebas de infraestructura de serving tabular: validar el despliegue de artefactos joblib en un endpoint interno (por ejemplo, con FastAPI o BentoML) antes de sustituirlo por un modelo en producción.
- Reproducción de experimentos académicos: serviría para verificar la afirmación de la model card sobre el Random Forest ajustado, aunque las métricas publicadas hacen dudosa su utilidad como referencia positiva.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card:

| Metrica | Valor reportado |
|---|---|
| F1-score | 0.0 |
| Recall | 0.0 |
| Precision | 0.0 |
| ROC-AUC | 0.545 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores de F1, recall y precision iguales a 0.0 son incompatibles con un clasificador funcional y sugieren un problema en el cálculo de métricas, un umbral de decisión mal ajustado o un fallo en el pipeline de evaluación. El ROC-AUC de 0.545 indica una capacidad discriminativa apenas superior al azar.

## Requisitos de hardware

- VRAM: no aplica; es un modelo de árboles ejecutado en CPU.
- GPU recomendadas: no aplica; no se beneficia de aceleración por GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y un Random Forest de este tipo suele pesar entre unos pocos cientos de kilobytes y unos pocos megabytes.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio con FastAPI, Flask, BentoML o MLflow; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; en cualquier caso, la inferencia de un Random Forest sobre un único registro es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leviana679/employee-attrition-model | Random Forest (scikit-learn) | no disponible | no aplica | MIT | Hugging Face |
| Baseline de regresión logística sobre IBM HR | Modelo lineal | no disponible | no aplica | variable | Implementación propia |
| XGBoost / LightGBM sobre IBM HR | Gradient boosting | no disponible | no aplica | Apache 2.0 / MIT | Librerías estándar |

No se dispone de datos de rendimiento comparables publicados para este modelo frente a alternativas de la misma categoría. La comparación se limita al tipo de artefacto y la licencia.

## Limitaciones y advertencias

- Métricas degeneradas: F1, recall y precision de 0.0 y ROC-AUC de 0.545 indican que el modelo, tal como se evalúa, no discrimina de forma útil; no debe usarse en producción sin reentrenamiento y validación.
- Sesgos potenciales: los modelos de rotación entrenados sobre IBM HR heredan sesgos del dataset sintético original (edad, género, departamento, nivel salarial); no se documenta ningún análisis de equidad.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones sobreconfiadas si se usa `predict_proba` sin calibración.
- Limitaciones de contexto e idioma: no procesa texto; solo acepta vectores tabulares con el esquema exacto de features usado en el entrenamiento, que no está documentado.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución; no obstante, la falta de documentación del dataset subyacente puede plantear dudas sobre la procedencia de los datos.
- Caveat para producción: no se documentan versiones de scikit-learn ni de sus dependencias, lo que puede provocar incompatibilidades al cargar el artefacto joblib en entornos con versiones distintas.
- Ausencia de model card completa: no se especifican features de entrada, pipeline de preprocesado, semilla, hiperparámetros ni procedimiento de evaluación, lo que impide reproducir los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Leviana679/employee-attrition-model
- Dataset IBM HR Employee Attrition (referencia habitual, no confirmada por el autor): https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
