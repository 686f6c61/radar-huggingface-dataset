# AdryanAzul/Football-Match-Prediction

## Resumen

Football Match Prediction es un modelo de clasificación tabular publicado por AdryanAzul en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un `RandomForestClassifier` de scikit-learn serializado como `modelo_rf.pkl`, entrenado para predecir el resultado de partidos de fútbol (victoria local, empate o victoria visitante) a partir de tres características agregadas. El modelo se complementa con un script de simulación de Monte Carlo que estima probabilidades de título en una liga nacional.

El problema que aborda es la predicción ternaria de resultados deportivos, un caso clásico de clasificación desbalanceada y con alta incertidumbre intrínseca. Se entrena sobre la European Soccer Database (25.979 partidos extraídos, 25.221 válidos tras eliminar nulos) que cubre 11 ligas europeas entre las temporadas 2008/2009 y 2015/2016. Las features son la media del `overall_rating` de los once titulares de cada equipo (procedente de las valoraciones de EA Sports FIFA) y el saldo de goles acumulado en enfrentamientos directos previos.

Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de pipeline de machine learning tabular con separación temporal estricta, validación cruzada y simulación estocástica de una liga. No compite con modelos fundacionales ni con sistemas de predicción deportiva comerciales; su valor es didáctico y de referencia para quien quiera replicar el flujo completo desde la base de datos SQLite hasta la estimación de probabilidades de campeón.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn `RandomForestClassifier`) |
| Parametros totales | 100 árboles, `max_depth=5`, `random_state=42` (número de nodos no publicado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada de 3 features numéricas) |
| Tipos de cuantizacion | no disponible (no aplica; serializado como `.pkl`) |
| Idiomas soportados | portugués (`pt`) en documentación y etiquetas |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle de scikit-learn); datos en CSV |
| Librería | scikit-learn |
| Pipeline | `tabular-classification` |
| Features de entrada | `home_overall_rating`, `away_overall_rating`, `hist_goal_diff` (float, en ese orden) |
| Variable objetivo | 3 clases: 0 local, 1 empate, 2 visitante |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio de 100 árboles con profundidad máxima 5, entrenado con `scikit-learn`. La entrada son tres variables numéricas: la media del `overall_rating` de los once titulares del equipo local, la del visitante y el saldo de goles histórico en enfrentamientos directos anteriores, siempre desde la perspectiva del local actual (0 en el primer enfrentamiento registrado). Las importancias reportadas son 0.3965, 0.3630 y 0.2405 respectivamente, lo que indica que el modelo se apoya principalmente en la diferencia de calidad de plantilla y solo marginalmente en el historial directo.

El preprocesamiento incluye eliminación de filas con nulos en los ratings (758 partidos descartados), ordenación cronológica y una división temporal estricta: entrenamiento con todas las temporadas anteriores a 2015/2016 (21.895 partidos) y test con la temporada 2015/2016 (3.326 partidos). El `StandardScaler` se ajusta exclusivamente sobre el conjunto de entrenamiento (medias `[70.5358, 70.4748, -0.2023]`, escalas `[5.3208, 5.3084, 5.7843]`) y se encapsula en un `Pipeline` durante la validación cruzada de 5 folds. El script `src/preProcess.py` también entrena un modelo de gradient boosting (XGBoost si está instalado, `HistGradientBoostingClassifier` como fallback) solo con fines comparativos; el artefacto publicado para inferencia es el Random Forest.

La innovación metodológica no está en el algoritmo sino en el flujo: separación temporal sin fuga de información, cálculo del saldo histórico solo con partidos anteriores y uso de las probabilidades predichas para alimentar una simulación de Monte Carlo de las últimas 10 jornadas de la Premier League 2015/2016 (100 partidos), partiendo de la puntuación real acumulada en las primeras 28 jornadas (280 partidos).

## Capacidades

- Clasificación ternaria de resultados de partidos de fútbol (local, empate, visitante) con probabilidades por clase vía `predict_proba`.
- Cálculo de la media de rating de los once titulares a partir de las tablas `Match` y `Player_Attributes` de la European Soccer Database.
- Cálculo del saldo de goles acumulado en enfrentamientos directos previos, con ajuste de signo según el mando de campo.
- Simulación de Monte Carlo de las jornadas finales de una liga para estimar la probabilidad de título de cada club.
- Comparación interna con un modelo de gradient boosting (XGBoost o `HistGradientBoostingClassifier`) para contrastar métricas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador tabular puro.
- Capacidad multilingüe: no aplica; la documentación está en portugués.

## Casos de uso

- Predicción de resultados para apuestas o análisis previo: dado el rating medio de los titulares de ambos equipos y el historial directo, el modelo devuelve `[P(local), P(empate), P(visitante)]` que puede usarse como señal cuantitativa, siempre con la cautela de su accuracy del 0,49.
- Simulación de final de temporada: alimentar las probabilidades del modelo en el script de Monte Carlo para estimar la probabilidad de que cada club gane la liga a falta de N jornadas, replicando el flujo descrito para la Premier League 2015/2016.
- Material docente para pipelines de ML tabular: sirve como ejemplo completo de separación temporal, `Pipeline` con `StandardScaler`, validación cruzada de 5 folds y evaluación out-of-time sin fuga de datos.
- Comparación de algoritmos en clasificación desbalanceada: el par Random Forest / gradient boosting incluido permite estudiar el comportamiento en la clase minoritaria (empates), donde ambos modelos fallan de forma notable.
- Prototipado de sistemas de scouting agregado: la ingeniería de features de rating medio por once titular puede reutilizarse para construir indicadores de fuerza de plantilla en otras competiciones si se dispone de datos equivalentes.
- Análisis retrospectivo de ligas europeas: con el CSV de 25.221 partidos se pueden estudiar patrones de ventaja local (45,79% de victorias locales en la muestra) y calibrar modelos alternativos.

## Benchmarks y rendimiento

| Modelo | Conjunto | Accuracy | F1 clase 0 (local) | F1 clase 1 (empate) | F1 clase 2 (visitante) |
|---|---|---|---|---|---|
| Random Forest (publicado) | CV 5-fold, entrenamiento | 0,5211 ± 0,0064 | no disponible | no disponible | no disponible |
| Random Forest (publicado) | Test 2015/2016 (3.326 partidos) | 0,49 | 0,63 (P=0,48, R=0,88) | 0,00 (P=0,00, R=0,00) | 0,39 (P=0,50, R=0,33) |
| XGBoost (comparación, no serializado) | Test 2015/2016 | 0,47 | no disponible | recall 0,08 | no disponible |

El modelo publicado no predice nunca la clase empate en test (precision y recall nulos), y su accuracy global (0,49) está por debajo de la tasa base de la clase mayoritaria (45,79% de victorias locales en la muestra completa). El XGBoost de comparación obtiene un `macro avg f1` de 0,38 y un recall de 0,08 en empates. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU. El artefacto `.pkl` y el CSV de ~2,32 MiB caben holgadamente en memoria RAM convencional.
- GPU recomendadas: ninguna; scikit-learn no aprovecha GPU para este modelo.
- Cabe en cualquier equipo de consumo: un portátil con 4 GB de RAM es suficiente para cargar el modelo y el dataset preparado.
- Opciones de despliegue: scripts Python con `scikit-learn` y `joblib`/`pickle`; no hay integración con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no publicados. Por la naturaleza del modelo (100 árboles de profundidad 5 sobre 3 features), la inferencia por partido es del orden de microsegundos a milisegundos en CPU, aunque el autor no reporta cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Features | Accuracy reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Football Match Prediction (AdryanAzul) | Random Forest (scikit-learn) | 3 (ratings medios + historial) | 0,49 en test 2015/2016 | no disponible | Hugging Face |
| XGBoost interno de comparación | Gradient boosting | 3 (mismas) | 0,47 en test 2015/2016 | no disponible | Solo en el script, no serializado |
| Modelos comerciales de predicción deportiva | No disponible | No disponible | No disponible | Propietaria | Comercial |

No se dispone de información sobre otros modelos públicos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no predice nunca la clase empate en test: precision y recall de 0,00, lo que invalida su uso para estimar esa probabilidad pese a que los empates representan el 25,39% de la muestra.
- Accuracy global de 0,49 en test, por debajo de la tasa base de victorias locales (45,79%), lo que cuestiona su valor predictivo frente a un clasificador trivial.
- Solo tres features, todas derivadas de ratings de EA Sports FIFA y del historial directo; no incorpora forma reciente, lesiones, alineaciones probables, contexto táctico ni cuotas de mercado.
- Sesgo hacia la clase local: recall de 0,88 en victorias locales frente a 0,33 en victorias visitantes, lo que sobreestima sistemáticamente al equipo de casa.
- Cobertura temporal limitada a 2008-2016 y a 11 ligas europeas; no hay garantía de validez fuera de ese período ni en otras competiciones.
- Dependencia de la base original: el `database.sqlite` (~298,6 MB) no está incluido en el repositorio, por lo que la reproducibilidad completa requiere descargarlo por separado.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución del artefacto o de los datos derivados.
- Riesgo de sobreajuste al período histórico: la validación out-of-time de una sola temporada no permite estimar la varianza del rendimiento en producción.
- El script de simulación de Monte Carlo está validado solo sobre la Premier League 2015/2016 (380 partidos), no sobre otras ligas.
- Documentación únicamente en portugués; no hay versión en castellano ni en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdryanAzul/Football-Match-Prediction
- European Soccer Database (Kaggle, Hugo Mathien): https://www.kaggle.com/datasets/hugomathien/soccer
- scikit-learn (`RandomForestClassifier`): https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
- scikit-learn (`Pipeline` y `StandardScaler`): https://scikit-learn.org/stable/modules/compose.html
- XGBoost: https://xgboost.readthedocs.io/
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos del autor.
