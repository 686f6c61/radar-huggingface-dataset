# marianopsa/pitch-aleph-1.2

## Resumen

PitchAleph 1.2, publicado por el usuario marianopsa en Hugging Face, no es un modelo de lenguaje, sino un motor de aprendizaje automático calibrado para simulación táctica de fútbol en tiempo real y asignación de capital. El modelo predice la probabilidad de los tres resultados de un partido (victoria local, empate, victoria visitante) a partir del estado del encuentro: minuto de juego, diferencia de goles, tiros, posesión y ratings Elo previos al partido.

Arquitectónicamente combina un clasificador XGBoost de gradiente boosting multiclase con una capa de calibración por regresión isotónica (`CalibratedClassifierCV` con `FrozenEstimator`), cuyo objetivo declarado es eliminar la compresión de probabilidades y el sesgo hacia favoritos. Se distribuye con licencia MIT en formato joblib, entrenado sobre datos de StatsBomb, y su tamaño es mínimo (0,0 GB en el repositorio), por lo que puede ejecutarse en CPU sin hardware especializado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XGBoost multiclase (gradiente boosting) + calibración isotónica (`CalibratedClassifierCV` con `FrozenEstimator`) |
| Parámetros totales | no disponible (modelo de árboles; número de árboles y profundidad no publicados) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | no aplicable (pesos nativos de scikit-learn/XGBoost) |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (fichero `model.joblib`) |
| Tarea | Clasificación multiclase 1X2 (victoria local, empate, victoria visitante) |
| Dataset de entrenamiento | StatsBomb (etiqueta `dataset:statsbomb`) |
| Métrica declarada | log_loss (sin valores numéricos publicados) |
| Tamaño del repositorio | 0,0 GB |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

El núcleo del modelo es un booster de gradiente XGBoost multiclase con tres clases de salida. El vector de entrada documentado en la model card consta de 16 variables: `match_time_ratio`, `shot_differential`, `team_A_possession_share`, `goal_differential`, `team_A_prematch_elo`, `team_B_prematch_elo`, `prematch_elo_diff`, `event_seconds` y ocho indicadores binarios del tipo de último evento (duelo, falta, pase, parada, balón parado, tiro, interrupción y toque). Este diseño permite puntuar el estado del partido evento a evento, lo que lo hace apto para consumo en directo.

Sobre el booster se aplica una envoltura de calibración mediante `CalibratedClassifierCV` con regresión isotónica y `FrozenEstimator`, que el autor presenta como mecanismo para evitar la compresión de probabilidades y el sesgo hacia favoritos típico de modelos de retail. El entrenamiento se realizó sobre datos de StatsBomb, aunque no se publican hiperparámetros, número de partidos o muestras, ligas cubiertas, rango temporal de los datos ni partición train/test. La métrica declarada en los metadatos es log_loss, sin valor asociado.

## Capacidades

- Predicción de probabilidades calibradas 1X2 (local, empate, visitante) en cualquier instante del partido a partir del estado actual: marcador, tiros, posesión y Elo prepartido.
- Salida de probabilidad por clase mediante `predict_proba`, con calibración isotónica orientada a evitar la compresión de probabilidades.
- Scoring sensible al evento: admite el tipo de la última acción del partido (duelo, falta, pase, parada, balón parado, tiro, interrupción, toque) como variable de entrada.
- Carga y despliegue sencillos en Python o Colab mediante `joblib` y `hf_hub_download`.
- Diseño orientado a trading cuantitativo deportivo: los tags incluyen `kelly-criterion` y `quantitative-trading`, indicando que las probabilidades calibradas están pensadas como entrada para asignación de capital.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso, ni entradas multimodales.

## Casos de uso

- Trading en vivo de cuotas deportivas: scoring continuo del estado del partido para comparar la probabilidad calibrada del modelo con las cuotas implícitas del mercado y detectar discrepancias de valor; el criterio de Kelly permite dimensionar la posición a partir de esa ventaja estimada.
- Alertas tácticas en directo: integración con feeds de eventos (tipo StatsBomb) para disparar notificaciones cuando un evento concreto (gol, tiro, cambio de posesión) desplace la probabilidad de resultado más allá de un umbral definido.
- Backtesting de estrategias de trading deportivo: reconstrucción de estados históricos con datos StatsBomb y evaluación de log_loss y PnL simulado antes de arriesgar capital real.
- Análisis táctico para cuerpos técnicos: cuantificación del impacto marginal de acciones (incrementar posesión, generar tiros) sobre la probabilidad de ganar, útil para decisiones durante el partido.
- APIs de probabilidad en tiempo real: al ser un modelo tabular ligero de CPU, puede exponerse tras FastAPI o embeberse en un consumer de Kafka para servir probabilidades por evento con latencia baja.
- Investigación en calibración de probabilidades: caso práctico de `CalibratedClassifierCV` con `FrozenEstimator` y regresión isotónica sobre un problema real de clasificación deportiva.
- Gestión de riesgo en carteras de apuestas: uso de probabilidades calibradas como entrada para modelos de dimensionamiento y límites de exposición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara log_loss como métrica, pero no incluye ningún valor numérico ni comparación con líneas base (por ejemplo, probabilidades implícitas de mercado o un modelo basado solo en Elo).

## Requisitos de hardware

- No requiere GPU ni VRAM: la inferencia es puramente de CPU al tratarse de un modelo de árboles serializado con joblib.
- Memoria mínima: el repositorio completo ocupa 0,0 GB, por lo que cualquier máquina con Python 3 y las dependencias (scikit-learn, xgboost, pandas, joblib, huggingface_hub) es suficiente; no se publica una cifra exacta de RAM.
- Ejecutable en portátiles convencionales, instancias cloud básicas y Google Colab; no aplican aceleradores tipo A100, H100 o RTX 4090.
- Despliegue: carga directa con `joblib` + `hf_hub_download`; no aplican runtimes de LLM como vLLM, llama.cpp, Ollama o TGI. Alternativas razonables: microservicio Python (FastAPI/Flask) o integración en pipelines batch.
- Latencia: no publicada; el scoring de una fila en un booster de árboles es típicamente del orden de milisegundos en CPU, adecuado para consumo evento a evento en directo.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos directamente comparables publicados en Hugging Face (motores de probabilidad 1X2 en vivo con calibración isotónica). Como referencia cualitativa frente a enfoques clásicos del sector:

| Enfoque | Tipo | Calibración explícita | Entradas | Licencia |
|---|---|---|---|---|
| PitchAleph 1.2 | Gradient boosting (XGBoost) + isotónica | Sí, vía `CalibratedClassifierCV` | Eventos en juego + Elo prepartido | MIT |
| Dixon-Coles / Poisson bivariado | Estadístico paramétrico | No intrínseca | Marcadores históricos | Método académico (sin pesos publicados) |
| Modelos basados solo en Elo | Rating dinámico | No | Resultados históricos | Varias implementaciones abiertas |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo: no sirve para tareas de PLN y no soporta tool calling, agentes ni multimodalidad.
- Adopción mínima: 0 descargas y 2 likes registrados; no existe validación independiente de su rendimiento.
- Transparencia limitada: no se publican el valor de log_loss, los hiperparámetros, el número de árboles, el tamaño del conjunto de entrenamiento, las ligas cubiertas ni la partición train/test, lo que impide auditar la calidad declarada.
- Riesgo de sobreajuste al dataset StatsBomb y de degradación de la calibración fuera de la distribución de entrenamiento (otras ligas, categorías inferiores o competiciones con reglamentos distintos).
- Uso en apuestas: el tag `kelly-criterion` implica aplicación en asignación de capital; probabilidades mal calibradas combinadas con Kelly agresivo pueden amplificar pérdidas. La ficha no constituye asesoramiento financiero y el juego conlleva riesgos legales y económicos según jurisdicción.
- Conjunto de características reducido (16 variables en el ejemplo publicado): no incorpora alineaciones, lesiones, xG por jugador ni contexto de competición, salvo que el fichero joblib incluya variables adicionales no documentadas.
- La licencia MIT cubre el modelo, pero los datos de StatsBomb están sujetos a su propia licencia de uso; verificar los términos antes de cualquier explotación comercial.
- Sin pipeline declarado en Hugging Face ni model card con detalles de mantenimiento o versión de las dependencias (scikit-learn, xgboost), lo que puede complicar la reproducibilidad de la carga del joblib.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marianopsa/pitch-aleph-1.2
- No se han encontrado enlaces adicionales relevantes (paper, repositorio de código o demo) en la búsqueda web.
