# ianalloway/nba-game-predictor-xgboost

## Resumen

El modelo `ianalloway/nba-game-predictor-xgboost` es un clasificador tabular basado en XGBoost que estima la probabilidad de que el equipo local gane un enfrentamiento de estilo NBA. Lo desarrolla el usuario ianalloway y se distribuye en Hugging Face bajo licencia MIT. No es un modelo de lenguaje ni una red neuronal profunda: es un ensemble de árboles de decisión gradient boosting entrenado sobre datos tabulares sintéticos, lo que lo sitúa en la categoría de modelos de análisis deportivo y clasificación binaria.

El problema que aborda es acotado y académico: servir como ejemplo reproducible de ingeniería de características con ventanas móviles (rolling features) y evaluación cronológica en un contexto de predicción deportiva. El modelo se entrenó sobre 2.000 partidos simulados, de los cuales 1.980 quedaron etiquetados tras descartar los primeros 20 de cada equipo para poder calcular estadísticas previas. La relevancia actual es metodológica, no competitiva: ilustra cómo estructurar un pipeline de validación temporal y cómo evitar fugas de información en series temporales deportivas.

El modelo se publica en formato JSON nativo de XGBoost, con un tamaño de repositorio de 0,0 GB (pesos de pocos kilobytes), no tiene descargas ni likes en el momento de la consulta y su model card advierte explícitamente de que sus métricas describen el simulador, no partidos reales de la NBA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión (XGBoost, `XGBClassifier`) |
| Parametros totales | no disponible (ensemble de árboles; número de árboles y profundidad no publicados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de tokens) |
| Tipos de cuantizacion | no aplica (no se publican variantes cuantizadas; el formato JSON nativo no requiere cuantización) |
| Idiomas soportados | en (inglés; el modelo no procesa texto, la etiqueta se refiere a la documentación y nombres de características) |
| Licencia | MIT |
| Formato de pesos | JSON nativo de XGBoost (`model.json`), cargable con `XGBClassifier.load_model()` |
| Numero de caracteristicas de entrada | 11 (`home_win_pct`, `away_win_pct`, `home_ppg`, `away_ppg`, `home_opp_ppg`, `away_opp_ppg`, `home_point_diff`, `away_point_diff`, `win_pct_diff`, `point_diff_diff`, `home_advantage`) |
| Tarea | Clasificación binaria tabular (`predict_proba` devuelve probabilidad local/visitante) |
| Version de librería | `xgboost==3.4.1` (según la model card) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un `XGBClassifier` de XGBoost, es decir, un ensemble de árboles de decisión entrenados con gradient boosting sobre características tabulares agregadas. No hay transformer, atención ni embeddings: cada partido se representa como un vector de 11 dimensiones que resume el rendimiento reciente de ambos equipos. Las características incluyen porcentaje de victorias local y visitante, puntos anotados y recibidos por partido, diferencial de puntos, diferencias entre equipos y una variable indicadora de ventaja de campo (`home_advantage`).

El pipeline de datos construye, para cada equipo, un resumen de hasta diez partidos precedentes. Tras descartar los primeros 20 partidos de cada equipo (necesarios para poblar las ventanas móviles), quedan 1.980 enfrentamientos etiquetados. La evaluación es cronológica: 1.584 partidos para entrenamiento y 396 para holdout, más cinco folds de validación walk-forward que miden la capacidad de un modelo entrenado con partidos anteriores para predecir el siguiente bloque. Tras la evaluación, el modelo descargable se reentrena sobre los 1.980 enfrentamientos completos y se exporta en JSON nativo. No se documenta uso de RLHF, DPO ni ajuste fino adicional, algo esperable en un modelo tabular. La innovación metodológica destacable es el diseño de validación temporal y la separación entre datos de simulación y benchmark histórico real, publicado por separado.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de victoria del equipo local frente al visitante mediante `predict_proba`.
- Ingeniería de características con ventanas móviles: resume hasta diez partidos previos por equipo (porcentaje de victorias, puntos anotados, puntos recibidos, diferencial).
- Evaluación cronológica reproducible: soporta particiones holdout y walk-forward documentadas.
- Inferencia sobre lotes de enfrentamientos: acepta un `DataFrame` de pandas con múltiples filas y devuelve probabilidades por fila.
- Integración con el ecosistema Python de ciencia de datos: compatible con `pandas`, `scikit-learn` y `huggingface_hub`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje natural.
- Capacidad especial: ninguna más allá de la clasificación tabular; no dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Prototipado de pipelines de predicción deportiva: sirve como plantilla reproducible para construir características rolling y validar cronológicamente antes de invertir en datos reales de la NBA. Su licencia MIT y su reducido tamaño facilitan la experimentación.
- Docencia y formación en machine learning tabular: el repositorio incluye código de entrenamiento y evaluación, lo que permite ilustrar fugas de información, validación temporal y calibración de probabilidades con un caso concreto.
- Comparación de calibración de probabilidades: con log loss de 0,672 y Brier score de 0,238 en holdout, el modelo puede usarse como línea base para evaluar si un clasificador más complejo mejora la calibración en problemas binarios similares.
- Integración en dashboards de análisis: la model card enlaza un dashboard público en Streamlit que compara las probabilidades del modelo con las cuotas de tres enfrentamientos de muestra, un patrón reutilizable para visualización de probabilidades.
- Benchmark de infraestructura de inferencia tabular: al ser un modelo de pocos kilobytes en JSON, sirve para medir latencia de carga y predicción en entornos con `xgboost` y `pandas` antes de escalar a modelos mayores.
- Generación de datos sintéticos para pruebas: el uso de 2.000 partidos simulados lo convierte en un ejemplo de cómo entrenar y evaluar con datos sintéticos cuando no se dispone de un dataset real etiquetado, aplicable a otros dominios tabulares.
- No es adecuado para apuestas con dinero real ni para producción deportiva: la propia model card indica que se requiere una evaluación separada con partidos observados y precios de mercado.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a datos simulados y se recogen en la model card:

| Metrica (partidos simulados) | Resultado |
|---|---:|
| Accuracy en holdout | 61,1 % |
| Log loss en holdout | 0,672 |
| Brier score en holdout | 0,238 |
| Accuracy walk-forward, media ± desviación típica | 57,8 % ± 1,3 puntos porcentuales |

No se han publicado resultados de benchmarks en la información disponible para comparaciones con otros modelos ni para partidos reales de la NBA. El autor remite a un benchmark histórico separado en su repositorio de GitHub, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula en GPU; el modelo cabe en memoria RAM del orden de megabytes o menos, dado un repositorio de 0,0 GB.
- GPU recomendadas: no se requiere GPU. XGBoost puede ejecutarse en CPU con `tree_method="hist"` o `"exact"`; el uso de GPU (CUDA) es opcional y no aporta ventaja significativa para este tamaño.
- Cabe en cualquier GPU consumer: sí, y también en CPU de un portátil, Raspberry Pi o contenedor con 512 MB de RAM.
- Opciones de despliegue: `xgboost` nativo en Python, integración con `scikit-learn`, `pandas` para la construcción de características, y exposición mediante FastAPI, Flask o Streamlit (el autor publica un dashboard en Streamlit). No aplica `vLLM`, `llama.cpp`, `Ollama` ni `TGI`, que son servidores para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles de forma oficial; por la naturaleza del modelo (11 características, ensemble de árboles) se espera latencia de microsegundos a pocos milisegundos por predicción en CPU, pero no se publica medición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Como referencia cualitativa, cualquier `XGBClassifier` o `LightGBM` entrenado sobre las mismas 11 características y el mismo esquema de validación cronológica sería funcionalmente equivalente, pero no se han publicado resultados de benchmarks que permitan una comparación numérica.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ianalloway/nba-game-predictor-xgboost` | no disponible (ensemble de árboles) | no aplica | 61,1 % accuracy en holdout simulado | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos (2.000 partidos simulados): sus métricas no son extrapolables a partidos reales de la NBA ni a mercados de apuestas.
- La model card advierte explícitamente de que el uso previsto es explorar características rolling, estimaciones de probabilidad y evaluación cronológica; el uso con dinero real requiere evaluación separada con partidos observados y precios de mercado.
- Riesgo de sobreajuste al simulador: el accuracy walk-forward (57,8 % ± 1,3 pp) es inferior al de holdout (61,1 %), lo que sugiere variabilidad en la generalización temporal.
- Sesgos conocidos: no documentados, pero al derivarse de un simulador, cualquier sesgo del generador de datos se hereda en el modelo.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de predicciones mal calibradas fuera de la distribución de los datos simulados.
- Limitaciones de idioma: la etiqueta `en` se refiere a la documentación; el modelo no procesa texto y no tiene capacidades multilingües.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución y sin garantía; no obstante, la licencia no cubre la idoneidad del modelo para apuestas reales.
- Caveat para producción: el repositorio incluye un directorio `model/` con archivos de una versión anterior, y el modelo principal se sirve como `model.json`; conviene verificar la versión cargada antes de desplegar.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ianalloway/nba-game-predictor-xgboost
- Dashboard público (Streamlit): https://ian-sports-betting-ml.streamlit.app/
- Código de entrenamiento y evaluación: https://github.com/ianalloway/sports-betting-ml/blob/a847398545f719e5bf29532b780dd51933fb6a03/model/train.py
- Ejecución de build y evaluación (GitHub Actions): https://github.com/ianalloway/sports-betting-ml/actions/runs/44788869100
- Benchmark histórico: https://github.com/ianalloway/sports-betting-ml/blob/main/docs/historical-benchmark.md
