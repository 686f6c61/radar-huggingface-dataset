# ma-pmo/release-slip-baseline

## Resumen

Release Slip Baseline es un conjunto de modelos de clasificación tabular desarrollados por ma-pmo para predecir la probabilidad de que una incidencia abierta de Jira no llegue a la release para la que está planificada. El modelo se entrena con el estado y el historial de la incidencia tal como se conocían 14 o 28 días antes de la fecha de release, lo que lo convierte en una herramienta de gestión de riesgos de planificación en lugar de un predictor retrospectivo. Es el modelo de referencia del dataset `ma-pmo/jira-release-slip` y la línea base aprendida que acompaña a las señales basadas en reglas del agente de riesgo A4 de MA-PMO.

Técnicamente no es un modelo de lenguaje: se trata de un `HistGradientBoostingClassifier` de scikit-learn envuelto en `CalibratedClassifierCV` con calibración isotónica, serializado en formato skops. La versión recomendada (v2) utiliza 29 características derivadas del tracker y se distribuye en dos variantes según el horizonte temporal (k14 y k28). Su relevancia radica en que las probabilidades están calibradas y pueden usarse directamente como puntuación de riesgo, con un error de calibración (ECE) de 0,021 en el horizonte de 14 días.

El proyecto está orientado a equipos de ingeniería que quieran anticipar desviaciones de calendario a partir de datos objetivos del gestor de incidencias, sin depender de juicios subjetivos del equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (`HistGradientBoostingClassifier`) con calibración isotónica (`CalibratedClassifierCV`, 3 folds) |
| Parametros totales | no disponible (modelo de árboles; no aplica recuento de parámetros neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular; entrada de 29 características en v2, 18 en v1) |
| Tipos de cuantizacion | no disponible (no aplica; serialización nativa skops) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.skops` (skops.io); scripts de entrenamiento en Python |
| Librería | scikit-learn 1.9 |
| Semilla | 0 |
| Variables de entrada (v2) | 29 características |
| Variables de entrada (v1) | 18 características |
| Horizontes de predicción | 14 días (k14) y 28 días (k28) antes de la release |
| Dataset de entrenamiento | `ma-pmo/jira-release-slip` |

## Arquitectura y entrenamiento

El modelo emplea un clasificador de gradient boosting sobre histogramas, una elección adecuada para datos tabulares con variables heterogéneas y relaciones no lineales, sin necesidad de escalado previo. La salida se calibra mediante validación cruzada isotónica con 3 folds, de modo que `predict_proba` devuelve probabilidades interpretables como puntuaciones de riesgo. La partición de datos es temporal y no aleatoria: se entrena con el 70 % de releases más antiguas (hasta 2017) y se evalúa con el 30 % más reciente (2017-2021), lo que simula un escenario real de previsión sobre releases futuras y evita fugas de información.

La versión v2 añade 11 características sobre las 18 de v1 y ajusta hiperparámetros mediante búsqueda en el 20 % más reciente del conjunto de entrenamiento, con 24 configuraciones evaluadas por PR-AUC y sin tocar el conjunto de test. La configuración final es: tasa de aprendizaje 0,03, 15 hojas, regularización L2 de 1,0, mínimo de 200 muestras por hoja para k14 y 50 para k28, y 400 iteraciones. La v1 usaba 300 iteraciones, tasa 0,05 y mínimo de 50 muestras por hoja. Las características más influyentes según importancia por permutación (v1, k14, caída de ROC-AUC) son `since_status_days` (0,128), `reschedules` (0,036), `release_open` (0,016) y `started` (0,013): una incidencia sin tocar durante mucho tiempo o ya movida de una release anterior tiende a moverse de nuevo.

## Capacidades

- Predicción binaria de riesgo de deslizamiento de release a partir de características tabulares del tracker.
- Dos horizontes temporales independientes: 14 y 28 días antes de la fecha de release.
- Probabilidades calibradas isotónicamente, utilizables directamente como puntuación de riesgo sin post-procesado.
- Dos versiones de features: v2 (29 características, recomendada) y v1 (18 características, conservada para comparación).
- Entrenamiento reproducible mediante scripts incluidos (`train_model.py`, `train_model_v2.py`) y el paquete `ma-pmo[benchmark]==0.9.0`.
- Integración con el ecosistema scikit-learn y con el agente de riesgo A4 de MA-PMO.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador tabular puro.

## Casos de uso

- Priorización de revisiones de planificación: el modelo asigna a cada incidencia abierta una probabilidad de deslizamiento 14 o 28 días antes de la release, permitiendo al equipo de gestión concentrar las revisiones en las incidencias con mayor riesgo en lugar de revisar todo el backlog.
- Alertas tempranas en el flujo de trabajo de Jira: integrado en un job programado que consulta la API del tracker, genera puntuaciones diarias y dispara avisos cuando una incidencia supera un umbral de riesgo calibrado, con la ventaja de que el ECE de 0,021 hace que un umbral de 0,7 corresponda aproximadamente a una probabilidad real del 70 %.
- Planificación de capacidad y compromisos con negocio: agregando las probabilidades por release se obtiene una estimación del número esperado de incidencias que no llegarán, útil para comunicar rangos de confianza a producto sin depender de estimaciones manuales.
- Detección de incidencias estancadas: la importancia de `since_status_days` y `reschedules` permite construir informes que identifiquen incidencias con patrones históricos de abandono o reubicación repetida, incluso si el equipo no las ha marcado como bloqueadas.
- Evaluación comparativa de herramientas de gestión de proyectos: al ser una línea base pública con métricas reproducibles, sirve para contrastar el rendimiento de otros modelos o heurísticas sobre el mismo dataset y la misma partición temporal.
- Investigación en analítica de software: el dataset y el modelo permiten estudiar qué señales del tracker (antigüedad del estado, reubicaciones, tiempo abierto en la release, tasa histórica de retraso del proyecto) son predictivas del deslizamiento, con scripts de entrenamiento y evaluación incluidos.
- Integración en paneles de riesgo de portafolio: para organizaciones con múltiples proyectos en Jira, el modelo puede aplicarse por colección (Red Hat, Apache, Qt, MongoDB son las cuatro colecciones grandes donde v2 supera a v1) y agregarse en un panel de riesgo de entrega.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test del dataset `ma-pmo/jira-release-slip` (no verificados de forma independiente). PR-AUC con intervalo de confianza bootstrap del 95 % sobre releases.

| k | Scorer | PR-AUC [IC 95 %] | ROC-AUC | Brier | ECE |
|---|---|---|---|---|---|
| 14 | all slip (referencia trivial) | 0,829 [0,811; 0,847] | 0,500 | 0,171 | 0,171 |
| 14 | A4 calibrado | 0,883 [0,870; 0,896] | 0,675 | 0,133 | 0,070 |
| 14 | v1 | 0,964 [0,956; 0,970] | 0,857 | 0,103 | 0,038 |
| 14 | **v2** | **0,968** [0,961; 0,973] | **0,868** | **0,099** | **0,021** |
| 28 | all slip (referencia trivial) | 0,782 [0,761; 0,800] | 0,500 | 0,218 | 0,218 |
| 28 | A4 calibrado | 0,833 [0,814; 0,847] | 0,639 | 0,161 | 0,060 |
| 28 | v1 | 0,936 [0,908; 0,950] | 0,825 | 0,129 | 0,055 |
| 28 | **v2** | **0,943** [0,921; 0,956] | **0,838** | **0,123** | **0,020** |

Desglose adicional de v2 por subconjunto (PR-AUC): en k14, 0,893 en releases informativas (10-90 % de incidencias deslizadas), 0,873 en incidencias ya iniciadas en T y 0,964 excluyendo incidencias arrastradas de releases de entrenamiento. En k28: 0,868, 0,852 y 0,942 respectivamente.

Comparación pareada v2 frente a v1 sobre las mismas releases de test (IC 95 %):

| k | PR-AUC | Brier | PR-AUC sin arrastradas |
|---|---|---|---|
| 14 | +0,004 [+0,002; +0,006] | −0,004 [−0,006; −0,002] | +0,004 [+0,002; +0,006] |
| 28 | +0,008 [+0,004; +0,014] | −0,007 [−0,008; −0,005] | +0,007 [+0,003; +0,011] |

La mejora en ranking es pequeña pero claramente superior a cero; el cambio principal está en la calibración (ECE de 0,038 a 0,021 en k14 y de 0,055 a 0,020 en k28). Por colección, v2 supera a v1 en las cuatro grandes (Red Hat, Apache, Qt, MongoDB); en las pequeñas (menos de 1.000 filas o 20 releases) los resultados van en ambas direcciones y están marcadas en `metrics_v2.json`.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un conjunto de árboles de gradient boosting serializado en skops; no requiere GPU y puede ejecutarse en cualquier máquina con Python y scikit-learn 1.9.
- VRAM: no aplica; consumo de memoria en RAM del orden de megabytes para el modelo y proporcional al tamaño del lote de inferencia.
- GPU recomendadas: no aplica. No se obtiene ventaja del uso de GPU para este tipo de modelo.
- Cabe en cualquier equipo consumer, incluidas máquinas sin GPU dedicada y contenedores con límites de memoria modestos.
- Opciones de despliegue: carga directa con `skops.io.load` en un servicio Python, empaquetado en una función serverless o en un job programado; no requiere vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos neuronales.
- Latencia y throughput: no se han publicado mediciones en la información disponible; para un modelo de árboles de este tamaño se espera latencia de milisegundos por lote en CPU, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Tipo | Horizonte | PR-AUC (k14 / k28) | Calibración (ECE k14 / k28) | Licencia |
|---|---|---|---|---|---|
| release-slip-baseline v2 | Gradient boosting calibrado (29 features) | 14 y 28 días | 0,968 / 0,943 | 0,021 / 0,020 | CC-BY-4.0 |
| release-slip-baseline v1 | Gradient boosting calibrado (18 features) | 14 y 28 días | 0,964 / 0,936 | 0,038 / 0,055 | CC-BY-4.0 |
| A4 calibrado (MA-PMO) | Señales basadas en reglas, calibradas | 14 y 28 días | 0,883 / 0,833 | 0,070 / 0,060 | no disponible en la información proporcionada |
| all slip | Referencia trivial (tasa base) | 14 y 28 días | 0,829 / 0,782 | 0,171 / 0,218 | no aplica |

No se dispone de otros modelos públicos comparables de predicción de deslizamiento de release sobre el mismo dataset en la información proporcionada.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo se entrena con releases de proyectos Jira de código abierto hasta 2017 y se evalúa con releases de 2017-2021; su comportamiento en organizaciones con prácticas de planificación distintas, otros trackers o releases muy cortas no está caracterizado.
- Rendimiento desigual por colección: en colecciones pequeñas (menos de 1.000 filas o 20 releases) v2 no supera sistemáticamente a v1 y los resultados van en ambas direcciones.
- Dependencia de la ingeniería de características: las 29 columnas de entrada deben calcularse exactamente como en el dataset y en el orden de `feature_names_in_`; un cálculo incorrecto de `since_status_days`, `reschedules` o `release_open` degrada la predicción sin aviso.
- Riesgo de arrastre: parte del rendimiento puede deberse a incidencias que aparecen también en releases de entrenamiento; el autor reporta el subconjunto "without carried-over" (0,964 en k14, 0,942 en k28), que es la referencia más conservadora.
- Calibración dependiente del tiempo: la calibración isotónica se ajustó con datos hasta 2017; cambios en las prácticas de planificación pueden desviar las probabilidades de su significado nominal.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos de atribución y la ausencia de garantías propia de la licencia.
- Carga de modelos skops: requiere revisar los tipos no confiables con `get_untrusted_types` antes de cargar; el autor indica que se esperan dos clases de scikit-learn.
- No es un modelo de lenguaje: no procesa texto libre, no soporta tool calling ni razonamiento, y no debe presentarse como sustituto de un LLM en flujos conversacionales.
- Resultados no verificados: todas las métricas proceden del model-index y de la model card del autor, marcadas como `verified: false`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ma-pmo/release-slip-baseline
- Dataset: https://huggingface.co/datasets/ma-pmo/jira-release-slip
- Repositorio MA-PMO: https://github.com/ma-pmo/ma-pmo-ext
