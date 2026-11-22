# ma-pmo/sprint-delivery-baseline

## Resumen

Sprint Delivery Baseline es un modelo de clasificación tabular publicado por el usuario ma-pmo en Hugging Face. Estima la probabilidad de que una incidencia comprometida al inicio de un sprint de Jira esté terminada cuando el sprint se cierre. No es un modelo de lenguaje: es un `HistGradientBoostingClassifier` de scikit-learn serializado con skops, entrenado sobre el dataset público `ma-pmo/jira-sprint-delivery`.

El modelo resuelve un problema acotado de gestión de proyectos: identificar desde el primer día qué compromisos de sprint tienen riesgo de no completarse. Según la model card, supera de forma clara a las reglas simples de referencia (tasa de finalización histórica del tablero, trabajo ya iniciado, arrastres previos), con un PR-AUC de 0,604 frente a 0,460 del mejor baseline.

Es relevante como referencia reproducible para investigación en analítica de desarrollo de software y como punto de partida para equipos que quieran construir señal de riesgo de entrega sobre sus propios datos de Jira. El autor advierte que la tarea es más difícil que predecir retrasos de release (ROC-AUC 0,73 frente a 0,87), porque lo que ocurre dentro de dos semanas depende de factores que el tracker no registra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (`HistGradientBoostingClassifier` de scikit-learn) con calibración isotónica |
| Parametros totales | no disponible (modelo de árboles; no se publica recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular, sin ventana de tokens) |
| Tipos de cuantizacion | no aplica (no es una red neuronal; no hay cuantización de pesos) |
| Idiomas soportados | no disponible (no procesa texto libre; los datos de entrenamiento no contienen texto libre) |
| Licencia | CC BY 4.0 (pesos); scripts del repositorio bajo AGPL-3.0-or-later |
| Formato de pesos | skops (`model.skops`) |

## Arquitectura y entrenamiento

El modelo es un ensemble de árboles con boosting por histogramas. La configuración declarada es: learning rate 0,05, 31 hojas, mínimo de 100 muestras por hoja, regularización L2 de 1,0 y 300 iteraciones. Sobre la salida se aplica calibración isotónica con 3 folds. Se entrenó con scikit-learn 1.9 y semilla 0, usando el 70% más antiguo de los sprints, y los hiperparámetros se fijaron antes de observar el split de test.

Los datos provienen del Public Jira Dataset (Montgomery, Lüders, Maalej; Zenodo v7), adaptado al dataset `ma-pmo/jira-sprint-delivery`. Las variables de entrada describen el estado de la incidencia al inicio del sprint y el historial de finalización del tablero. El conjunto de test cubre sprints iniciados entre mayo de 2020 y diciembre de 2021, nunca vistos en entrenamiento. El modelo no almacena filas ni identificadores, y los datos de entrenamiento no contienen identificadores de usuario ni texto libre.

## Capacidades

- Clasificación binaria tabular: probabilidad de que una incidencia comprometida se complete al cierre del sprint.
- Salida calibrada (`predict_proba`), apta para umbrales operativos y para ordenar incidencias por riesgo.
- Inferencia sobre features tabulares derivadas de Jira; requiere exactamente las columnas de `model.feature_names_in_`.
- Serialización con skops y carga con lista de tipos de confianza (`get_untrusted_types`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Triaje de compromisos en la planificación: al cerrar la reunión de planificación, puntuar cada incidencia comprometida y marcar las de mayor probabilidad de no completarse para revisar alcance o asignación.
- Alertas tempranas en el daily: recalcular la probabilidad con el estado actual y priorizar conversaciones sobre las incidencias con mayor riesgo, en lugar de revisar todo el tablero.
- Comparación entre equipos y tableros: usar el modelo como referencia común para detectar tableros cuyo patrón de entrega se desvía del esperado.
- Investigación en analítica de software: servir de baseline reproducible (configuración y semilla fijadas) para comparar nuevas features o modelos sobre el mismo dataset.
- Recalibración por organización: el autor documenta diferencias por organización (MongoDB 0,678 de PR-AUC, Red Hat 0,551, Qt 0,548), lo que permite ajustar el modelo a una instancia concreta con pocos sprints propios.
- Priorización de revisiones de alcance: ordenar las incidencias por probabilidad estimada para decidir cuáles se descomponen o se mueven a otro sprint.
- Señal auxiliar en dashboards de PMO: integrar la probabilidad como indicador adicional junto a métricas clásicas de velocidad y arrastres.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (sprints de 2020-05 a 2021-12). Intervalos de confianza bootstrap al 95% sobre sprints para PR-AUC.

| Scorer | PR-AUC [IC 95%] | ROC-AUC | Brier | ECE |
|---|---|---|---|---|
| Tasa base | 0,371 | 0,500 | 0,236 | 0,052 |
| Trabajo iniciado al inicio del sprint | 0,396 [0,382, 0,408] | 0,548 | 0,250 | 0,110 |
| Tasa de finalización histórica del tablero | 0,460 [0,447, 0,476] | 0,609 | 0,226 | 0,022 |
| Menos arrastres previos | 0,426 [0,412, 0,441] | 0,598 | 0,342 | 0,235 |
| Este modelo | 0,604 [0,592, 0,618] | 0,730 | 0,203 | 0,058 |

Frente al mejor baseline (histórico del tablero), comparación emparejada sobre los mismos sprints: PR-AUC +0,144 [+0,131, +0,156]. Desglose por organización en PR-AUC: MongoDB 0,678 (15.950 filas), Red Hat 0,551 (19.363), Qt 0,548 (5.934); el resto tiene menos de 1.000 filas de test y figura como «small» en `metrics.json`. Las métricas del model-index están marcadas como no verificadas.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un ensemble de árboles de pequeño tamaño; el repositorio ocupa 0,0 GB, por lo que cabe en cualquier máquina.
- VRAM: no requiere GPU.
- GPU recomendadas: no aplica.
- Cabe en hardware de consumo: sí, en cualquier portátil u ordenador de oficina.
- Despliegue: carga directa con `skops.io` en Python; también puede servirse como endpoint propio (por ejemplo, FastAPI o un job por lotes) sin necesidad de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada; para un ensemble de 300 iteraciones y 31 hojas se espera inferencia por lotes en milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | PR-AUC (test) | ROC-AUC | Licencia |
|---|---|---|---|---|---|
| Sprint Delivery Baseline (ma-pmo) | Gradient boosting calibrado | Entrega de sprint | 0,604 | 0,730 | CC BY 4.0 |
| Tasa de finalización histórica del tablero | Regla simple | Entrega de sprint | 0,460 | 0,609 | no aplica |
| Trabajo iniciado al inicio del sprint | Regla simple | Entrega de sprint | 0,396 | 0,548 | no aplica |
| Menos arrastres previos | Regla simple | Entrega de sprint | 0,426 | 0,598 | no aplica |

No se dispone de información sobre otros modelos publicados comparables de la misma categoría (predicción de entrega de sprint sobre datos de Jira); no disponible.

## Limitaciones y advertencias

- Tarea intrínsecamente difícil: ROC-AUC 0,73 frente a 0,87 en predicción de retraso de release, según el autor; parte del resultado depende de factores no registrados en el tracker (disponibilidad del equipo, por ejemplo).
- Calibración desplazada: el periodo de test completa menos que el de entrenamiento (37% frente a 42%), por lo que las probabilidades tienden a ser algo altas (ECE 0,058). El autor recomienda recalibrar con algunos sprints propios antes de confiar en ellas.
- Rendimiento desigual por organización: PR-AUC de 0,678 en MongoDB frente a 0,548 en Qt; varias organizaciones tienen menos de 1.000 filas de test y sus métricas se marcan como poco fiables.
- Sesgo de selección de datos: procede de instancias públicas de Jira del Public Jira Dataset; los patrones pueden no transferirse a equipos con prácticas de planificación distintas.
- Requiere ingeniería de features idéntica: el modelo espera las columnas exactas de `feature_names_in_`; cualquier cambio en la derivación de variables invalida la inferencia.
- Licencia: los pesos son CC BY 4.0 y exigen atribución; los scripts del repositorio son AGPL-3.0-or-later, con licencia comercial disponible por contacto (mjinttt@gmail.com). Verificar la compatibilidad antes de uso en producto propietario.
- Carga de skops: debe hacerse con la lista de tipos de confianza (`get_untrusted_types`); cargar ficheros skops de origen no verificado es un riesgo de seguridad.
- Sin soporte de texto libre ni de identificadores de usuario: no debe usarse para perfilado individual de personas.
- Métricas no verificadas de forma independiente: el model-index marca los resultados como `verified: false`.
- Idiomas soportados no disponibles: el modelo no procesa lenguaje, por lo que la etiqueta de idioma no es aplicable en la práctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ma-pmo/sprint-delivery-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/ma-pmo/jira-sprint-delivery
- Colección MA-PMO: https://huggingface.co/collections/ma-pmo/ma-pmo-all-datasets-and-models-6b00ecf0a34e42bafa2866a6
- Public Jira Dataset (Zenodo v7): https://doi.org/10.5281/zenodo.15719919
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Documentación de procedencia: DATA_PROVENANCE.md (en el repositorio del modelo)
- Política de privacidad: PRIVACY.md (en el repositorio del modelo)
