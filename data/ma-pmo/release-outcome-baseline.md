# ma-pmo/release-outcome-baseline

## Resumen

Release Outcome Baseline es un modelo de clasificación tabular desarrollado por el colectivo ma-pmo (proyecto MA-PMO) que predice, para un issue abierto de Jira, qué ocurrirá con él de aquí a la fecha de release. A diferencia de su predecesor `release-slip-baseline`, que estima únicamente si un issue se retrasará, este modelo distingue tres desenlaces operativamente distintos: `on_time` (resuelto en el release), `moved_out` (sacado del alcance) y `open` (mantenido en el release pero sin terminar). Esta distinción es relevante porque cada clase exige una acción diferente en una PMO: ninguna, una decisión de alcance temprana o una gestión de riesgo de entrega.

Técnicamente no es un modelo de lenguaje ni una red neuronal: es un `HistGradientBoostingClassifier` de scikit-learn con calibración isotónica, entrenado por separado para dos horizontes temporales (14 y 28 días antes del release) sobre las 29 características v1+v2 del dataset `ma-pmo/jira-release-slip`. Se distribuye en formato `.skops`, lo que exige revisar los tipos no confiables antes de cargarlo. Su tamaño es mínimo (repo de 0,0 GB) y su interés radica en ser una línea base reproducible y calibrada para investigación aplicada a gestión de proyectos software.

El modelo es relevante ahora porque ofrece una referencia cuantitativa honesta (con intervalos de confianza bootstrap y comparación contra priors de clase) para una tarea de predicción poco explorada en la literatura de ingeniería de software, y porque separa explícitamente el problema de "sacado del alcance" del de "no terminado", dos fallos que las herramientas de PMO suelen agregar bajo una única etiqueta de retraso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (`HistGradientBoostingClassifier` de scikit-learn) + calibración isotónica, 3 folds |
| Parametros totales | no disponible (no aplica; modelo de árboles, no red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 29 features) |
| Tipos de cuantizacion | no disponible (no aplica; modelo tabular serializado en `.skops`) |
| Idiomas soportados | no disponible (no procesa texto libre; opera sobre features tabulares) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.skops` (`outcome_k14.skops`, `outcome_k28.skops`) |

Hiperparámetros declarados: learning rate 0,03, 15 hojas, mínimo 200 muestras por hoja, regularización L2 de 1,0 y 400 iteraciones.

## Arquitectura y entrenamiento

El modelo es un ensamble de gradient boosting implementado con `HistGradientBoostingClassifier` de scikit-learn, con calibración isotónica aplicada sobre 3 folds. Se entrena una instancia independiente por horizonte temporal: `outcome_k14.skops` para predicción a 14 días del release y `outcome_k28.skops` para 28 días. La entrada son las 29 features v1+v2 del dataset `ma-pmo/jira-release-slip` y la salida es una distribución de probabilidad sobre tres clases (`on_time`, `moved_out`, `open`).

El entrenamiento se realizó sobre historial de Jira de código abierto, mayoritariamente de proyectos de Red Hat y Apache, donde mover issues a una versión posterior es una práctica habitual. El dataset de origen es el Public Jira Dataset (MSR 2022). El script `train_outcome.py` reproduce exactamente `metrics.json` con la versión 0.9.0 del paquete `ma-pmo`. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo tabular supervisado.

## Capacidades

- Clasificación multiclase tabular en tres categorías de desenlace de issue: `on_time`, `moved_out` y `open`.
- Predicción calibrada de probabilidades por clase (`predict_proba`), con calibración isotónica.
- Dos horizontes temporales de predicción: 14 y 28 días antes de la fecha de release.
- Derivación de una probabilidad de retraso agregada como `p_moved_out + p_open`, que ordena retrasos con PR-AUC superior a 0,93 en test, cercano al modelo binario v2.
- Entrenamiento y evaluación reproducibles mediante el paquete `ma-pmo` 0.9.0.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un clasificador tabular puro.

## Casos de uso

- Priorización de revisiones de alcance en una PMO: con 14 días de antelación, el modelo identifica issues con alta `p_moved_out`, permitiendo al equipo de producto decidir de forma temprana qué se saca del release en lugar de descubrirlo en la fecha de entrega.
- Detección de riesgo de entrega: la probabilidad `p_open` señala issues que probablemente sigan sin terminar el día del release, lo que permite activar planes de contingencia o renegociar la fecha.
- Alimentación de dashboards de salud de release: las probabilidades calibradas por clase se integran en informes de seguimiento para dar una estimación cuantitativa del estado del release en lugar de un semáforo cualitativo.
- Investigación en ingeniería de software empírica: sirve como línea base reproducible y calibrada para comparar nuevos modelos de predicción de resultados de issues sobre el dataset `jira-release-slip`.
- Ajuste de planificación de sprints: con el horizonte de 28 días, el equipo puede estimar la carga real que llegará a la release y dimensionar el trabajo pendiente con antelación.
- Auditoría de prácticas de gestión: analizar la distribución de `moved_out` frente a `open` en el histórico permite diagnosticar si el equipo tiende a recortar alcance o a acumular deuda de entrega.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test del dataset `ma-pmo/jira-release-slip` (métricas no verificadas de forma independiente):

| k (días antes) | Scorer | Log loss [IC 95%] | Brier | Macro-F1 [IC 95%] | PR-AUC on_time | PR-AUC moved_out | PR-AUC open |
|---|---|---|---|---|---|---|---|
| 14 | Class prior | 0,859 [0,820; 0,905] | 0,494 | 0,270 [0,261; 0,278] | 0,171 | 0,681 | 0,148 |
| 14 | Progress | 0,829 [0,790; 0,876] | 0,473 | 0,309 [0,295; 0,324] | 0,294 | 0,740 | 0,145 |
| 14 | **Este modelo** | **0,715** [0,676; 0,762] | **0,410** | **0,444** [0,428; 0,463] | **0,567** | **0,857** | **0,236** |
| 28 | Class prior | 0,860 [0,818; 0,913] | 0,501 | 0,266 [0,257; 0,274] | 0,218 | 0,665 | 0,117 |
| 28 | Progress | 0,834 [0,791; 0,885] | 0,479 | 0,309 [0,296; 0,321] | 0,333 | 0,719 | 0,117 |
| 28 | **Este modelo** | **0,744** [0,698; 0,804] | **0,429** | **0,415** [0,402; 0,425] | **0,600** | **0,799** | 0,119 |

Frente a la referencia `progress`, emparejada sobre los mismos releases: log loss −0,115 [−0,129; −0,101] y macro-F1 +0,135 [+0,115; +0,160] a k = 14; log loss −0,090 [−0,105; −0,069] y macro-F1 +0,106 [+0,093; +0,118] a k = 28. Distribución de clases en test a k = 14: `on_time` 17 %, `moved_out` 68 %, `open` 15 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y su tamaño es despreciable (repo de 0,0 GB).
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo consumer: cualquier CPU con memoria suficiente para cargar el dataset de test y scikit-learn.
- Opciones de despliegue: carga directa con `skops.io.load` en Python; integrable en servicios de inferencia basados en scikit-learn (por ejemplo, FastAPI o batch jobs). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo (400 iteraciones de boosting sobre 29 features) la inferencia es del orden de microsegundos a milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Release Outcome Baseline (este) | Gradient boosting tabular | Clasificación 3 clases de desenlace de issue | 29 features tabulares | CC BY 4.0 | Hugging Face |
| release-slip-baseline (ma-pmo) | Modelo tabular binario | Predicción de si un issue se retrasa | Features tabulares del mismo dataset | no disponible en la información | Hugging Face |
| Class prior (referencia) | Baseline estadístico | Frecuencias de clase de train | Sin features | no aplica | En el propio repo |
| Progress (referencia) | Baseline estadístico | Frecuencias por estado de progreso | Features de progreso | no aplica | En el propio repo |

No se dispone de información sobre otros modelos comparables de terceros para esta tarea concreta.

## Limitaciones y advertencias

- La clase `open` es difícil de distinguir: su PR-AUC es 0,236 frente a una tasa base de 0,148 a k = 14, y no mejora su tasa base a k = 28 (0,119 frente a 0,117). El modelo separa principalmente issues a tiempo de issues movidos fuera del alcance.
- Entrenado sobre historial de Jira de código abierto (mayoritariamente Red Hat y Apache), donde mover issues a una versión posterior es habitual; la calibración debe comprobarse en el tracker propio antes de usarlo en producción.
- El modelo predice, no explica causas; no debe interpretarse como diagnóstico de por qué un issue se retrasa.
- La licencia CC BY 4.0 exige atribución; el framework MA-PMO es AGPL-3.0 con licencia comercial disponible por contacto.
- La carga con `skops` requiere revisar los tipos no confiables (`get_untrusted_types`) antes de confiar en el archivo, por seguridad.
- No procesa texto libre ni lenguaje natural; solo features tabulares precalculadas del dataset de origen, por lo que su uso fuera de ese esquema requiere ingeniería de features adicional.
- Métricas declaradas por el autor y no verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ma-pmo/release-outcome-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/ma-pmo/jira-release-slip
- Modelo predecesor binario: https://huggingface.co/ma-pmo/release-slip-baseline
- Public Jira Dataset (MSR 2022): referencia citada en la model card, sin URL directa en la información disponible.
