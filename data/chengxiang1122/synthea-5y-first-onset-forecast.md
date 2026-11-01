# Chengxiang1122/synthea-5y-first-onset-forecast

## Resumen

El modelo `synthea-5y-first-onset-forecast` es un conjunto de artefactos de clasificación tabular entrenados para predecir la primera aparición de 40 condiciones clínicas en un horizonte de cinco años a partir de registros de salud electrónicos (EHR) sintéticos generados con Synthea. Lo desarrolla el usuario Chengxiang1122 como solución a una prueba técnica de investigación (research-intern coding test) y se publica bajo licencia CC BY 4.0. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un ensemble de gradient boosting (XGBoost y LightGBM) con pesos de combinación calculados por el método de Caruana.

El problema que aborda es la predicción de incidencia (first-onset) de enfermedades crónicas a partir de datos tabulares de historia clínica: demografía, códigos SNOMED, flags de diagnósticos previos, genómica y costes. El ensemble combina tres miembros con vistas de features distintas (filas person-period, filas ancla oficiales y un miembro sin tokens de historia) y produce una puntuación por cada uno de los 40 objetivos. La métrica principal es el macro AUROC, complementada con mAP.

Su relevancia es acotada: se trata de un artefacto de competición reproducible sobre datos sintéticos, no de un modelo listo para producción clínica. Resulta útil como referencia metodológica para pipelines de predicción tabular en EHR y para reproducir la evaluación, pero su valor fuera del conjunto Synthea es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de gradient boosting: XGBoost (miembro A) + LightGBM (miembros B y C), combinados con pesos de Caruana por objetivo |
| Parametros totales | no disponible (modelos de árboles; el número de árboles y profundidad varía por fold y objetivo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de árboles en el sentido habitual) |
| Idiomas soportados | no disponible (no procesa texto libre; opera sobre códigos SNOMED y features numéricas/categóricas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | JSON (XGBoost, miembro A) y TXT (LightGBM, miembros B y C), más matrices `.npy` de columnas y scores OOF/val/test |

## Arquitectura y entrenamiento

El sistema es un ensemble de tres miembros entrenados sobre features tabulares derivadas de registros Synthea. El miembro A usa XGBoost con profundidad 3 sobre filas person-period y columnas cribadas por objetivo. El miembro B usa LightGBM sobre filas ancla oficiales con columnas cribadas por objetivo. El miembro C usa LightGBM sobre un subconjunto reducido de features (edad, sexo, flags previos, genómica y costes) sin tokens de historia. Cada miembro se entrena con 5 folds para cada uno de los 40 objetivos, y la combinación final usa pesos de Caruana por objetivo calculados a partir de los scores OOF.

Los datos de entrenamiento son únicamente el split de train (2.791 pacientes); el split de validación (365 pacientes) se usó para monitorización y el de test solo como entrada de predicción. No se usaron datos externos ni pesos preentrenados. El pipeline incluye genómica opcional y campos de coste vital de `patients.csv`; la model card advierte que ambos se generan a partir del registro completo (incluida la ventana de predicción) y documenta el modelo con y sin esas features. La reproducibilidad está soportada por un repositorio de código con `reproduce.py` y `predict.py`, y por `meta.json` por miembro que registra orden exacto de columnas, hiperparámetros y rondas.

## Capacidades

- Clasificación tabular multiobjetivo: predice first-onset a 5 años para 40 condiciones codificadas en SNOMED.
- Ensemble heterogéneo con pesos por objetivo (Caruana), lo que permite adaptar la combinación a cada condición.
- Feature engineering determinista con vocabularios ajustados en train, reproducible vía script.
- Soporte de features genómicas y de coste (opcionales, con advertencia de fuga temporal).
- Evaluación reproducible con métricas macro AUROC y mAP sobre validación oficial.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión/audio.

## Casos de uso

- Reproducción de investigación: sirve para replicar el pipeline y las métricas del coding test, verificando el máximo |diff| frente a las predicciones enviadas mediante `predict.py`.
- Baseline metodológico en predicción tabular de EHR: útil como referencia para comparar enfoques de gradient boosting con cribado de columnas por objetivo en datos Synthea.
- Estudio de fuga de información: el bundle permite analizar el impacto de features derivadas del registro completo (genómica y costes) comparando el modelo con y sin ellas.
- Docencia en ML clínico: ejemplo completo de ensemble con validación cruzada, OOF y pesos de Caruana sobre datos sintéticos.
- Prototipado de scoring de riesgo: para explorar la viabilidad de modelos ligeros de árboles en la predicción de incidencia de 40 condiciones antes de invertir en datos reales.
- Auditoría de pipelines: los `meta.json` y las matrices OOF/val/test permiten auditar orden de columnas, hiperparámetros y calibración de la combinación.

## Benchmarks y rendimiento

| Split | macro AUROC | mAP |
|---|---:|---:|
| train, 5-fold cross-fitted OOF (2.791 pacientes) | 0.798 | 0.308 |
| official validation (365 pacientes) | 0.791 | 0.360 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en test ni desglose por condición.

## Requisitos de hardware

- VRAM: no aplica; son modelos de árboles que se ejecutan en CPU. El repo ocupa 0.0 GB.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo consumer: el coste es de CPU y memoria RAM, no de VRAM.
- Despliegue: ejecución directa con la librería `xgboost` y `lightgbm` en Python; no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del número de filas y de los 40 objetivos × 5 folds por miembro.

## Comparativa con modelos similares

| Modelo | Tipo | Objetivos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| synthea-5y-first-onset-forecast | Ensemble XGBoost + LightGBM | 40 condiciones, horizonte 5 años | no aplica | CC BY 4.0 | HuggingFace + GitHub |
| Baseline XGBoost único | Gradient boosting | Configurable | no aplica | según implementación | genérico |
| Baseline LightGBM único | Gradient boosting | Configurable | no aplica | según implementación | genérico |
| Modelos de lenguaje para EHR | Transformer | Variable | miles de tokens | variable | variable |

No se dispone de comparativas publicadas con métricas equivalentes sobre el mismo split en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos Synthea; el rendimiento en datos clínicos reales no está validado y probablemente no se transfiera.
- Riesgo de fuga temporal: la genómica y los costes vitales se generan a partir del registro completo, incluida la ventana de predicción; la model card lo advierte y reporta el modelo con y sin esas features.
- Conjunto de validación pequeño (365 pacientes), lo que limita la fiabilidad de las métricas.
- Sin información sobre sesgos demográficos ni calibración por subgrupos.
- Licencia CC BY 4.0 permite uso comercial con atribución, pero el modelo no está pensado ni validado para uso clínico.
- No procesa texto libre ni códigos fuera del vocabulario SNOMED del dataset de entrenamiento.
- Sin mantenimiento aparente (0 descargas, 0 likes) y publicado como artefacto de prueba técnica.

## Enlaces

- HuggingFace: https://huggingface.co/Chengxiang1122/synthea-5y-first-onset-forecast
- Repositorio de código: https://github.com/celestial1122/synthea-5y-first-onset-forecast
- Dataset Synthea (MITRE): no disponible enlace directo en la información proporcionada
- Paper o blog del autor: no disponible
