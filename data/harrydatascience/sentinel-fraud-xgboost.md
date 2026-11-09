# HarryDataScience/sentinel-fraud-xgboost

## Resumen

SENTINEL fraud classifier es un modelo de clasificación tabular basado en XGBoost, desarrollado por HarryDataScience, diseñado para la detección de fraude en transacciones con tarjeta. No es un modelo de lenguaje ni una red neuronal: es un conjunto de árboles de decisión potenciados por gradiente que opera sobre características tabulares (componentes PCA anonimizados V1-V28, importe logarítmico estandarizado y hora del día codificada de forma cíclica). Su propósito es ordenar y marcar transacciones para revisión humana en entornos de demostración o investigación.

El modelo se entrenó sobre el conjunto de datos público Credit Card Fraud Detection de Kaggle (ULB / Worldline), con 284.807 filas y 492 casos de fraude, y se evaluó con una partición temporal (train/val/test) que refleja deriva temporal. La innovación principal no reside en la arquitectura, sino en el tratamiento riguroso del desequilibrio de clases (scale_pos_weight seleccionado por validación cruzada), la calibración de probabilidades mediante un calibrador sigmoideo ajustado en validación y una regla de decisión basada en costes asimétricos (coste de falso negativo 111,58 frente a coste de falso positivo 5,00).

Es relevante ahora como ejemplo reproducible de buenas prácticas en machine learning aplicado a fraude: separación temporal de datos, intervalos de confianza bootstrap, calibración de probabilidades, códigos de razón por transacción mediante TreeSHAP y advertencias explícitas sobre limitaciones regulatorias (GDPR Art. 22, EU AI Act). Su licencia MIT y su formato de serialización sin pickle facilitan la auditoría y la reutilización como bloque técnico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient-boosted decision trees) |
| Parametros totales | no disponible (modelo de árboles; el número de parámetros no es aplicable del mismo modo que en redes neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 31 características por transacción) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el modelo se distribuye en formato nativo XGBoost) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `xgb_model.json` (nativo XGBoost), `preprocess.json`, `calibrator.json`, `metadata.json`; sin pickle |

## Arquitectura y entrenamiento

El modelo es un conjunto de árboles de decisión potenciados por gradiente implementado con XGBoost 3.4.1. La entrada consta de 31 características: las 28 componentes PCA anonimizadas (V1-V28) del conjunto de datos original, el importe logarítmico estandarizado (escalador ajustado únicamente sobre el conjunto de entrenamiento) y la hora del día codificada como seno y coseno para preservar la ciclicidad. El desequilibrio de clases se abordó con `scale_pos_weight`, estrategia seleccionada mediante validación cruzada de 5 pliegues sobre el split de entrenamiento, comparando con ausencia de tratamiento y con SMOTE: PR-AUC media de 0,878 ± 0,034 para scale_pos_weight, frente a 0,876 ± 0,032 sin tratamiento y 0,866 ± 0,026 con SMOTE.

La partición de datos es temporal: 170.884 filas de entrenamiento (360 fraudes), 56.961 de validación (57 fraudes) y 56.962 de test (75 fraudes). La calibración sigmoidea se ajustó sobre el split de validación, reduciendo el Brier score en test de 0,00071 (bruto) a 0,00038 (calibrado) y alineando la tasa media predicha de fraude (0,0013) con la observada (0,0013). El umbral de decisión de 0,0717 se eligió minimizando la función de coste `FN × 111,58 + FP × 5,00` sobre validación. La explicabilidad se implementa mediante TreeSHAP, con V4 (1,721), V14 (1,527) y V12 (1,222) como características de mayor impacto medio en log-odds.

## Capacidades

- Clasificación binaria de transacciones (fraude / no fraude) con probabilidades calibradas.
- Ordenación por riesgo mediante probabilidad calibrada, útil para priorizar colas de revisión.
- Bandas de riesgo discretas: LOW (< umbral/2), MEDIUM (entre umbral/2 y umbral) y HIGH (≥ umbral).
- Códigos de razón por transacción mediante valores TreeSHAP, que explican la contribución de cada característica en log-odds.
- Regla de decisión configurable por costes asimétricos (umbral óptimo dependiente de los costes de FN y FP configurados).
- Monitorización de deriva de características mediante PSI (population stability index) sobre entradas en vivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo tabular puro.
- No procesa texto, imagen ni audio.

## Casos de uso

- Priorización de colas de revisión humana en equipos de prevención de fraude: el modelo ordena transacciones por probabilidad calibrada y asigna bandas de riesgo, de modo que los analistas concentran su esfuerzo en las marcadas como HIGH y MEDIUM, reduciendo el coste esperado frente a umbrales fijos (2.098 frente a 2.140 con umbral 0,5 en el conjunto de test).
- Generación de códigos de razón para disputas y auditoría interna: los valores TreeSHAP por transacción permiten documentar qué características (V4, V14, V12, etc.) elevaron o redujeron el riesgo, lo que facilita la revisión por parte de equipos de cumplimiento.
- Prototipado e investigación en detección de fraude: sirve como línea base reproducible con partición temporal, intervalos bootstrap y comparación de estrategias de desequilibrio, útil para validar nuevas aproximaciones antes de invertir en modelos más complejos.
- Simulación de políticas de decisión con costes variables: al reentrenar con costes distintos en `config/train.yaml`, se puede explorar el compromiso entre falsos negativos y falsos positivos para distintos segmentos de negocio.
- Monitorización de deriva en producción: el endpoint `/monitoring/drift` calcula PSI sobre las entradas en vivo, lo que permite detectar cambios en la distribución de características antes de que el rendimiento se degrade.
- Docencia y formación en ML aplicado a fraude: el proyecto ilustra calibración, selección de umbral por costes, evaluación con intervalos de confianza y advertencias regulatorias, con código y artefactos serializados de forma legible.
- Integración como bloque en pipelines de decisión existentes: al distribuirse en JSON nativo y sin pickle, se puede cargar con `ModelBundle.load()` desde el repositorio fuente e incorporar a servicios de scoring con controles de seguridad sobre los artefactos.

## Benchmarks y rendimiento

Resultados en el split de test reservado, media [IC bootstrap del 95%]:

| Metrica | Valor |
|---|---|
| PR-AUC (principal) | 0,790 [0,692, 0,870] |
| ROC-AUC | 0,981 [0,968, 0,992] |
| Recall con precision >= 80% | 0,760 [0,656, 0,848] |
| Precision en el umbral | 0,760 [0,662, 0,851] |
| Recall en el umbral | 0,760 [0,656, 0,848] |
| F1 en el umbral | 0,760 [0,681, 0,828] |
| Coste esperado en test | 2.098 [1.236, 3.098] |

Matriz de confusión en el umbral: TN 56.869, FP 18, FN 18, TP 57. Líneas base de coste en test: no marcar nada = 8.368; umbral fijo 0,5 = 2.140; umbral elegido = 2.098.

Validación cruzada de 5 pliegues sobre el split de entrenamiento (selección de modelo):

| Estrategia | PR-AUC (media ± sd) | Recall con precision >= 80% |
|---|---|---|
| ninguna | 0,876 ± 0,032 | 0,867 |
| scale_pos_weight (seleccionada) | 0,878 ± 0,034 | 0,875 |
| SMOTE | 0,866 ± 0,026 | 0,861 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo de árboles se ejecuta en CPU y su huella en memoria es de megabytes, no de gigabytes.
- GPU recomendadas: no necesarias; XGBoost puede usar GPU opcionalmente, pero el tamaño del modelo no lo justifica.
- Cabe en cualquier GPU de consumo y en entornos sin GPU; también en contenedores con recursos mínimos.
- Opciones de despliegue: carga mediante `ModelBundle.load()` del repositorio fuente; el artefacto es JSON nativo de XGBoost, por lo que puede servirse con cualquier runtime que soporte XGBoost 3.4.1 o compatible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput: no disponibles en la información proporcionada. El autor advierte que la monitorización y el rate limiting son de un solo proceso en memoria y no aptos para despliegue multi-réplica tal cual.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | PR-AUC en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SENTINEL fraud classifier | XGBoost tabular | no aplica | no aplica | 0,790 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada; el autor solo compara internamente variantes de tratamiento del desequilibrio (sin tratamiento, scale_pos_weight, SMOTE) sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- El conjunto de test contiene solo 75 casos de fraude, por lo que los intervalos de confianza son amplios (por ejemplo, PR-AUC entre 0,692 y 0,870).
- La partición temporal refleja deriva, pero solo en el intervalo del conjunto de datos (aproximadamente 2 días para el conjunto de Kaggle); no hay garantía de generalización a otros periodos ni a otras poblaciones.
- Los patrones de fraude cambian; el modelo se degradará sin reentrenamiento. La monitorización de deriva por PSI detecta cambios en las entradas, pero no deriva de etiquetas.
- Las características son componentes PCA anonimizadas, por lo que los códigos de razón describen el comportamiento del modelo, no causas del mundo real.
- El umbral depende de los costes configurados (FN 111,58; FP 5,00); si los costes reales difieren, hay que reentrenar o recalibrar el umbral.
- La monitorización y el rate limiting son de un solo proceso en memoria; no es apto para despliegue multi-réplica tal cual.
- No es posible evaluar sesgos ni equidad: el conjunto de datos no contiene atributos demográficos.
- El modelo no está validado para bloqueo automático, decisiones de crédito ni uso regulado en producción; su uso previsto es la marca para revisión humana en demostración o investigación.
- No satisface por sí mismo el Art. 22 del GDPR ni los requisitos del EU AI Act; es un bloque técnico, no una afirmación de cumplimiento.
- No se documentan sesgos conocidos más allá de la ausencia de atributos demográficos que permitan medirlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarryDataScience/sentinel-fraud-xgboost
- Repositorio fuente (referenciado en la model card como GitHub del proyecto, con `src/model_bundle.py`): no disponible la URL exacta en la información proporcionada
- Conjunto de datos de origen (Kaggle Credit Card Fraud Detection, ULB / Worldline, DbCL v1.0): no disponible la URL exacta en la información proporcionada
- Figura de fiabilidad de calibración (`docs/figures/reliability.png`): referenciada en la model card, sin URL pública en la información proporcionada
- Endpoint de monitorización de deriva (`/monitoring/drift`): referenciado en la model card, sin URL pública en la información proporcionada
