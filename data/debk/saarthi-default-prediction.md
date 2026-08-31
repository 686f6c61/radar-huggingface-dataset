# Debk/saarthi-default-prediction

## Resumen

SAARTHI es un sistema de predicción de impago (default prediction) para préstamos a pequeñas y medianas empresas (MSME), desarrollado por Debk para la competición IDBI Innovate 2026 (Track 04). El modelo se entrena exclusivamente con datasets públicos —no se usó ningún dato bancario interno— y su propuesta central es ofrecer modelos pre-entrenados que después se ajustan (fine-tuning) sobre la cartera propia de cada entidad prestamista, evitando el arranque en frío en cada despliegue.

La arquitectura combina un ensemble de tres algoritmos de gradient boosting —LightGBM, XGBoost y CatBoost— con calibración isotónica, más un codificador contrastivo estilo CoLES (GRU + InfoNCE) opcional para streams de transacciones. El repositorio contiene modelos especialistas por corpus, un modelo global agrupado (pooled) con vocabulario canónico de 15 campos, y un estudio de transferencia entre dominios. El tamaño del repositorio es de 0,1 GB y los artefactos se distribuyen en formato joblib.

La relevancia de SAARTHI reside en su hallazgo principal: el modelo agrupado no transfiere entre dominios de crédito distintos (AUC medio de 0,5486 en transferencia, cerca del azar), lo que cuestiona la viabilidad de un «modelo fundacional» único para riesgo de crédito. La arquitectura defensable, según los propios autores, es el entrenamiento con datos del dominio objetivo más fine-tuning sobre la cartera del prestamista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de gradient boosting (LightGBM + XGBoost + CatBoost) con calibración isotónica; codificador secuencial CoLES (GRU + InfoNCE) opcional |
| Parámetros totales | No disponible (modelo de boosting sobre datos tabulares; el número de árboles no se publica) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo tabular, no procesa secuencias de texto) |
| Tipos de cuantización | No aplicable (modelo tabular en formato joblib) |
| Idiomas soportados | No aplicable (datos tabulares numéricos) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

SAARTHI combina un ensemble de tres potenciadores de gradiente (LightGBM, XGBoost y CatBoost) con calibración isotónica. La metodología de evaluación usa una división estricta en tres partes: 60 % para entrenamiento (fit), 15 % para calibración (calibrate) y 25 % para test, de modo que el calibrador nunca ve los datos de test y el ECE reportado es una estimación real fuera de muestra, evitando el sesgo de medir calibración sobre el mismo pliegue usado para ajustar el calibrador.

El entrenamiento se realiza sobre siete corpus públicos: sba (préstamos de la Administración de Pequeños Negocios de EE. UU.), lending_club, home_credit, gmsc, taiwan, german y berka. Además se evaluó un codificador contrastivo estilo CoLES (GRU + InfoNCE sobre vistas disjuntas de subsecuencias de transacciones) que produce embeddings de 256 dimensiones, útil cuando el prestamista dispone de streams de transacciones brutos pero pocos campos curados.

El hallazgo más relevante es el estudio de transferencia leave-one-dataset-out: entrenar sobre todos los corpus excepto uno y puntuar el corpus excluido produce resultados en o por debajo del azar (AUC medio 0,5486). La normalización por rango percentil no rescata la transferencia (0,5377), lo que indica inversión relacional de las características entre dominios de crédito, no un problema de escala. En concreto, en sba (préstamos a pequeñas empresas) un plazo mayor y un principal garantizado mayor indican un préstamo mejor evaluado, lo contrario que en los corpus de crédito al consumo que dominan el entrenamiento agrupado.

## Capacidades

- Predicción de probabilidad de impago sobre datos tabulares de crédito, con calibración fiable (ECE entre 0,0011 y 0,0074 en la mayoría de corpus).
- Modelos especialistas por dataset con métricas publicadas: AUC de 0,7263 (lending_club) a 0,9800 (sba).
- Modelo agrupado (pooled) con vocabulario canónico de 15 campos, capaz de puntuar cualquier cartera que se mapee a ese esquema (AUC test 0,8605).
- Fine-tuning sobre la cartera propia del prestamista a partir de un modelo pre-entrenado, en lugar de arrancar desde cero.
- Embeddings de transacciones mediante codificador contrastivo CoLES (GRU + InfoNCE) para datos de transacciones brutos, con mejora de +0,0267 AUC en el corpus berka.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un modelo tabular, no un LLM.

## Casos de uso

- Evaluación de riesgo en originación de préstamos MSME: el modelo agrupado puede puntuar solicitudes de crédito usando las 15 características canónicas, con AUC de 0,8605 en test y ECE de 0,0018, lo que permite ordenar solicitudes por riesgo de impago de forma calibrada.
- Sistema de alerta temprana de impago: los modelos especialistas por corpus (p. ej., sba con AUC 0,9800) pueden integrarse en pipelines de monitorización de carteras para detectar préstamos en riesgo con antelación, como describe el repositorio del proyecto.
- Fine-tuning sobre cartera propia: una entidad prestamista puede tomar el modelo pre-entrenado y ajustarlo con su propio libro de préstamos, evitando el arranque en frío y adaptando las relaciones feature→outcome a su dominio concreto, que es precisamente lo que el estudio de transferencia demuestra necesario.
- Análisis de streams de transacciones sin ingeniería manual: el codificador CoLES genera embeddings de 256 dimensiones que sustituyen a la agregación manual de características cuando el prestamista tiene datos de transacciones brutos pero pocos campos curados, con una mejora de +0,0267 AUC sobre solo tabular en berka.
- Monitorización de carteras de crédito al consumo: los modelos especialistas para lending_club, taiwan y gmsc permiten puntuar carteras de consumo con calibración fiable (ECE inferior a 0,01 en los tres casos), adecuados para seguimiento periódico de deterioro crediticio.
- Investigación sobre transferibilidad entre dominios de crédito: el estudio leave-one-dataset-out documenta la no transferibilidad entre dominios con datos cuantitativos, lo que sirve como referencia empírica para diseñar arquitecturas de riesgo de crédito y evitar errores de despliegue.

## Benchmarks y rendimiento

Resultados publicados en la model card. Los valores de referencia provienen de la literatura y de ganadores de competiciones Kaggle, citados por el propio autor.

| Dataset | n | Tasa de impago | AUC test | PR-AUC | ECE | Referencia publicada |
|---|---:|---:|---:|---:|---:|---|
| sba | 897.167 | 0,1756 | 0,9800 | 0,9126 | 0,0015 | ~0,95 (literatura) |
| lending_club | 1.369.566 | 0,2124 | 0,7263 | 0,4104 | 0,0024 | ~0,70-0,73 (sin fugas) |
| home_credit | 307.511 | 0,0807 | 0,7632 | 0,2449 | 0,0011 | 0,805 (ganador Kaggle) |
| gmsc | 150.000 | 0,0668 | 0,8522 | 0,3629 | 0,0041 | ~0,87 (ganador Kaggle) |
| taiwan | 30.000 | 0,2212 | 0,7698 | 0,5243 | 0,0074 | ~0,78 (literatura) |
| german | 1.000 | 0,3000 | 0,7668 | 0,5505 | 0,0680 | ~0,79 (literatura) |
| berka | 682 | 0,1111 | 0,8558 | 0,5725 | 0,0295 | n/d |
| amex | 120.000 | 0,2598 | 0,9580 | 0,8858 | 0,0050 | ~0,96 AUC (ganadores; el 0,80 es otra métrica) |
| hc2024 | — | — | fallido | — | — | ~0,86 (ganador Kaggle) |

Modelo agrupado (pooled): AUC test 0,8605, PR-AUC 0,5795, ECE 0,0018, Brier 0,0868, 270.421 filas de test, 7 corpus agrupados.

Resultados de transferencia leave-one-dataset-out (AUC):

| Corpus excluido | n | Pooling crudo | Normalizado por rango |
|---|---:|---:|---:|
| berka | 682 | 0,4612 | 0,5155 |
| german | 1.000 | 0,4646 | 0,4022 |
| gmsc | 150.000 | 0,7786 | 0,7711 |
| home_credit | 300.000 | 0,4991 | 0,5785 |
| lending_club | 300.000 | 0,5228 | 0,5399 |
| sba | 300.000 | 0,4103 | 0,2574 |
| taiwan | 30.000 | 0,7038 | 0,6989 |
| **media** | | **0,5486** | **0,5377** |

Ablación del codificador secuencial:

| Corpus | Solo tabular | Solo secuencia | Tabular + secuencia | Mejora |
|---|---:|---:|---:|---:|
| berka | 0,8575 | 0,8097 | 0,8842 | +0,0267 |
| amex | 0,9590 | 0,9156 | 0,9585 | −0,0006 |

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, lo que indica artefactos ligeros.
- Al ser modelos de gradient boosting en formato joblib, la inferencia se ejecuta en CPU sin necesidad de GPU.
- VRAM estimada: no aplicable (no requiere GPU para inferencia).
- GPUs recomendadas: ninguna; CPU es suficiente para scoring en batch o en tiempo real.
- El codificador CoLES (GRU) sí es una red neuronal y podría beneficiarse de GPU durante el pre-entrenamiento, pero el repositorio no especifica requisitos de hardware para ello.
- Opciones de despliegue: integración en pipelines de datos con joblib, servicios de scoring en batch, o APIs REST con frameworks como FastAPI. No es compatible con vLLM, llama.cpp ni Ollama al no ser un LLM.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en el mismo repositorio. La model card cita referencias de la literatura y ganadores de Kaggle como puntos de comparación:

| Modelo | AUC (mejor corpus) | ECE | Transferencia entre dominios | Licencia |
|---|---|---|---|---|
| SAARTHI (este modelo) | 0,9800 (sba) | 0,0015 (sba) | No transfiere (media 0,5486) | Apache 2.0 |
| Ganador Kaggle Home Credit (referencia) | 0,805 | no disponible | no disponible | no disponible |
| Ganador Kaggle Amex (referencia) | ~0,96 | no disponible | no disponible | no disponible |

La comparativa directa con alternativas de la misma categoría (modelos tabulares de predicción de impago) no está disponible más allá de las referencias citadas en la model card.

## Limitaciones y advertencias

- No transfiere entre dominios de crédito: el estudio leave-one-dataset-out muestra que el modelo agrupado es anti-predictivo en corpus no vistos (AUC medio 0,5486, con sba degradándose a 0,2574 tras normalización por rango). No debe usarse para puntuar carteras de un dominio distinto al de entrenamiento sin fine-tuning previo.
- El corpus hc2024 (Home Credit 2024) falló
