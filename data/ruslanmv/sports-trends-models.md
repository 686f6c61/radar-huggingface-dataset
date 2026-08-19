# ruslanmv/sports-trends-models

## Resumen

`sports-trends-models` es un conjunto de modelos de clasificación tabular desarrollados por Ruslan Magana (ruslanmv) para predecir el resultado de partidos deportivos. Cada deporte cuenta con un algoritmo específico: fútbol con `HistGradientBoostingClassifier`, baloncesto con `LogisticRegression`, tenis con `GradientBoostingClassifier`, cricket con `RandomForestClassifier` y un modelo Elo adicional para torneos internacionales. El objetivo es estimar probabilidades calibradas de victoria local, empate o victoria visitante, utilizando características como rating Elo, forma reciente, enfrentamientos directos, días de descanso y ventaja de campo.

El modelo resuelve el problema de generar predicciones fiables y transparentes para eventos deportivos, con un pipeline diseñado para evitar fugas de información (leakage) mediante división cronológica de los datos. Su relevancia radica en que produce probabilidades calibradas (una probabilidad publicada del 62% se comporta como tal en un gran número de partidos) y está integrado en un sistema que se reentrena automáticamente y publica resultados en un panel en vivo. Al ser modelos de scikit-learn, no requieren GPU y tienen un coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples modelos scikit-learn: HistGradientBoostingClassifier (fútbol), LogisticRegression (baloncesto), GradientBoostingClassifier (tenis), RandomForestClassifier (cricket), Elo + modelo de torneo (internacional) |
| Parametros totales | No disponible (modelos tabulares de pequeño tamaño) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica (modelos de sklearn, no requieren cuantización) |
| Idiomas soportados | Inglés (documentación y etiquetas; los datos de entrada son numéricos) |
| Licencia | MIT |
| Formato de pesos | No disponible (probablemente joblib/pickle, no especificado) |

## Arquitectura y entrenamiento

El sistema no es un único modelo sino un conjunto de clasificadores supervisados, cada uno seleccionado según la dinámica del deporte. Para fútbol se usa gradient boosting con histogramas (`HistGradientBoostingClassifier`) por su capacidad de capturar interacciones no lineales entre Elo y forma; baloncesto usa regresión logística por la ausencia de empates y la fuerte señal lineal del Elo; tenis emplea gradient boosting para modelar interacciones no lineales en historiales cortos; cricket usa random forest por su robustez ante resultados ruidosos; y los torneos internacionales combinan Elo con un modelo específico que añade ventaja de local, sede neutral, fuerza de la confederación e importancia de la fase.

El entrenamiento sigue un pipeline con división cronológica estricta (train → validación → test, nunca aleatoria) y verificaciones automáticas de fuga de información. Las características se calculan solo con datos disponibles antes del inicio del partido. Cada modelo se envuelve en calibración de probabilidad: isotónica para modelos basados en árboles y sigmoide para regresión logística, con un fallback al estimador crudo si el conjunto de datos es demasiado pequeño. No se especifican el número de tokens ni el volumen de datos de entrenamiento.

## Capacidades

- Predicción de resultados a 2 vías (local/visitante) para baloncesto, tenis y cricket, y a 3 vías (local/empate/visitante) para fútbol.
- Probabilidades calibradas: la salida es una distribución de probabilidad sobre los resultados posibles, ajustada para que sea fiable a largo plazo.
- Explicaciones en lenguaje natural: cada predicción incluye un texto breve que describe los factores que la motivan (Elo, forma, enfrentamientos directos, etc.).
- Soporte multi-deporte: fútbol, baloncesto, tenis, cricket y torneos internacionales (incluyendo fase de grupos y eliminatorias con capa adicional de "quién avanza").
- Actualización automática: los modelos se reentrenan periódicamente y se publican bajo la ruta `<sport>/latest/`.
- Fallback a heurística Elo: si no hay un modelo entrenado disponible para un partido concreto, se utiliza una heurística Elo transparente para evitar resultados vacíos.

## Casos de uso

- Análisis de apuestas deportivas: los usuarios pueden consultar las probabilidades calibradas para evaluar cuotas y detectar posibles value bets. El modelo no es consejo de apuestas, pero ofrece una base estadística.
- Generación de contenido para blogs y medios deportivos: los periodistas pueden usar las predicciones y sus explicaciones para crear artículos sobre los partidos más esperados.
- Paneles de predicción en vivo: el sistema publica predicciones actualizadas cada 30 minutos, útil para aplicaciones de seguimiento de resultados en tiempo real.
- Análisis de rendimiento de equipos: las características como Elo y forma reciente pueden extraerse para estudios de rendimiento y tendencias a lo largo de la temporada.
- Integración en aplicaciones de fantasy sports: las probabilidades de resultado pueden combinarse con estadísticas de jugadores para optimizar alineaciones.
- Investigación académica: el pipeline leakage-safe y la calibración de probabilidad sirven como caso de estudio para metodologías de predicción deportiva con modelos tabulares.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index son los siguientes:

| Metrica | Valor | Verificado |
|---|---|---|
| Accuracy (holdout, sport-dependent) | 0.55 | No |
| Log loss (calibrado) | 0.98 | No |

No se han publicado comparaciones con otros modelos de predicción deportiva en la información disponible. La accuracy de 0.55 indica un rendimiento moderado, ligeramente superior al azar en clasificación binaria (0.5) y con margen en la clasificación de 3 vías (0.33). El log loss de 0.98 sugiere que la calibración de probabilidades es mejorable, aunque el valor depende del deporte y del conjunto de datos.

## Requisitos de hardware

- Al ser modelos de scikit-learn, la inferencia se ejecuta en CPU sin necesidad de GPU.
- Requisitos mínimos: cualquier procesador moderno con 1-2 GB de RAM es suficiente para cargar y ejecutar los modelos.
- Despliegue sencillo: los modelos se serializan con joblib o pickle y pueden servirse mediante una API REST (Flask, FastAPI) o integrarse en pipelines existentes.
- Latencia: del orden de milisegundos por predicción, incluso en hardware modesto.
- No requiere cuantización ni optimización específica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se desconoce si existen alternativas públicas con el mismo enfoque multi-deporte y calibración de probabilidad.

## Limitaciones y advertencias

- La precisión declarada (0.55) y el log loss (0.98) indican un rendimiento limitado; las predicciones no deben considerarse fiables para decisiones de alto riesgo.
- El modelo está pensado para información y entretenimiento, no como consejo de apuestas. El propio autor incluye esta advertencia.
- La calidad de las predicciones depende directamente de la calidad y cobertura de los datos de entrada (resultados, fixtures, etc.).
- Los modelos se reentrenan automáticamente, por lo que el rendimiento puede variar entre versiones.
- Solo cubre los deportes especificados (fútbol, baloncesto, tenis, cricket y torneos internacionales); no hay soporte para otros deportes.
- Al no ser un modelo de lenguaje, no presenta riesgos de alucinación, pero sí puede haber sesgos en los datos históricos (por ejemplo, sobre-representación de ligas populares).
- No se especifican los formatos de serialización ni se ofrecen pesos descargables en el repositorio de Hugging Face, lo que dificulta la reproducibilidad fuera del pipeline original.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/ruslanmv/sports-trends-models)
- [Hugging Face - dataset](https://huggingface.co/datasets/ruslanmv/sports-trends-dataset)
- [GitHub - repositorio](https://github.com/ruslanmv/sports-trends)
- [Dashboard en vivo](https://ruslanmv.com/sports-trends/)
- [Página de predicciones](https://ruslanmv.com/sports-trends/sports/predictions/)
