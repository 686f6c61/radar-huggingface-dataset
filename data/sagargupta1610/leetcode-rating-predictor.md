# Sagargupta1610/leetcode-rating-predictor

## Resumen

LeetCode Rating Predictor es un modelo de regresión tabular publicado en HuggingFace por Sagar Gupta (usuario `Sagargupta1610`) que estima cuánto variará el rating de un usuario de LeetCode tras un concurso, a partir de su posición en la clasificación y de su historial reciente. No es un modelo de lenguaje: es una red neuronal densa de cuatro capas (`15 → 128 → 64 → 32 → 1`) con 12.417 parámetros entrenables y activaciones ReLU, exportada además a JSON y a arrays NumPy para poder servirse sin ningún framework de machine learning.

El problema que resuelve es concreto: la fórmula de rating de LeetCode es de estilo Elo y una réplica exacta exige conocer el rating de todos los participantes del concurso, lo que implica scrapear ranklists de más de 30.000 filas por competición. Este modelo aproxima el resultado usando únicamente el historial del propio usuario, de modo que una predicción puede responderse con una sola llamada GraphQL. Esa ligereza es la que permite integrarlo en una extensión de navegador que anota directamente las páginas de ranking.

Es relevante ahora por su perfil de despliegue, no por su escala: 12.417 parámetros en float32 ocupan unos 48,5 KiB y la inferencia cabe en una pasada de NumPy o en JavaScript en el cliente, sin GPU. El autor reporta un MAE de 14,14 en usuarios no vistos y de 9,11 en un backtest sobre 173 concursos reales, frente a un baseline trivial de 27,79 y 29,34 respectivamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa denso `15 → 128 → 64 → 32 → 1`, activación ReLU en capas ocultas y salida lineal |
| Parámetros totales | 12.417 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de texto) |
| Tipos de cuantización | no disponible; se distribuye en float32 (Keras y NumPy) y con los pesos serializados en JSON |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.keras` (Keras), `weights.npz` (NumPy), `model.json` (red + escalador en un único JSON), `scaler.json` |
| Tarea (pipeline) | `tabular-regression` |
| Entradas | 15 features numéricas por registro de concurso |
| Salida | Un escalar: variación de rating estimada (puntos) |
| Framework de entrenamiento | Keras / TensorFlow |
| Tamaño del repositorio | 0,0 GB |
| Fecha de publicación | 2026-10-24 |

Las 15 features, en orden, son: `rating_before`, `rank`, `participants`, `rank_percent`, `contest_index`, `avg_solve_rate`, `avg_finish_time`, `recent_solve_rate`, `recent_finish_time`, `rating_trend`, `max_rating`, `log_rank`, `rating_x_rank_share`, `solve_rate_x_rating` y `finish_time_share`.

## Arquitectura y entrenamiento

La arquitectura es una red totalmente conectada de tres capas ocultas (128, 64 y 32 unidades) con activación ReLU y una neurona de salida lineal, precedida de un escalador que normaliza cada feature mediante `x * scale + min`. El recuento de parámetros cuadra con esa topología: 2.048 + 8.256 + 2.080 + 33 = 12.417. El modelo se entrenó con Keras y se exportó después a tres representaciones equivalentes: el `.keras` original, un `.npz` con kernels y sesgos y un `model.json` que incluye red y escalador, pensado para cargarse en el navegador. La model card incluye un snippet que reproduce la inferencia completa en NumPy puro, sin dependencias de TensorFlow.

El conjunto de entrenamiento procede de los registros recopilados por `scripts/update_data.py`: 295.899 registros de concurso de 8.182 usuarios. El split se hizo por usuario, de forma que ningún usuario aparece a la vez en entrenamiento y evaluación (242.108 registros de entrenamiento, 26.093 de validación y 27.698 de test). Se usó pérdida Huber, semilla 42, 62 épocas con early stopping y fecha de entrenamiento 2026-10-18. La pérdida Huber es una elección coherente con la distribución de la variable objetivo, donde los primeros concursos de un usuario pueden mover el rating más de 100 puntos y generan los residuos más grandes.

No se documenta ninguna innovación técnica más allá de la ingeniería de features (ratios, logs y productos cruzados como `rating_x_rank_share` o `solve_rate_x_rating`) y de la exportación portable. Un detalle importante: la feature `participants` no es el número real de inscritos, sino `max(rank * 1.5, 10000)`, la forma con la que se construyeron los datos de entrenamiento.

## Capacidades

- Regresión tabular: estima un único valor continuo, la variación de rating en puntos, a partir de 15 entradas numéricas.
- Inferencia sin framework: la red puede ejecutarse con NumPy (Python) o con JavaScript en el navegador cargando `model.json`.
- Generalización a usuarios no vistos: el split por usuario permite evaluar la predicción sobre perfiles nunca vistos en entrenamiento.
- Baja latencia estructural: una pasada directa supone del orden de 12.400 multiplicaciones-acumulaciones por muestra.
- Integración en cliente: pensado para extensiones de navegador que anotan páginas de ranking bajo demanda.
- Generación de texto: no soporta.
- Razonamiento, código y matemáticas: no soporta (no es un modelo generativo).
- Tool calling / function calling: no soporta.
- Agentes y razonamiento multi-paso: no soporta.
- Capacidades multilingües: no aplica.
- Visión, audio, modo thinking: no soporta.

## Casos de uso

- Extensión de navegador para rankings de LeetCode: la extensión carga `model.json` desde el repositorio y añade una columna «Predicted» a las páginas de clasificación, calculando la variación esperada de cada usuario visible sin llamadas adicionales al servidor.
- API de predicción bajo demanda: un backend FastAPI puede responder a la consulta de un usuario con una sola llamada GraphQL para recuperar su historial, aplicar el escalador y ejecutar la red en NumPy, con un coste de infraestructura mínimo.
- Planificación previa al concurso: dado un rating actual y un objetivo de subida, invertir la predicción para estimar qué posición relativa (`rank_percent`) haría falta, útil para herramientas de entrenamiento personal.
- Seguimiento de progreso en clubes o comunidades: agregar las predicciones de los miembros antes de cada concurso y compararlas con el delta real para construir paneles de evolución con una referencia cuantitativa.
- Detección de resultados atípicos: con un MAE de 9-14 puntos, desviaciones muy superiores al error típico entre el delta real y el predicho pueden señalarse como anomalías y revisarse manualmente en rankings de concursos internos.
- Bots de comunidad (Discord, Telegram): responder a comandos del tipo «¿cuánto subiré si quedo en el puesto X?» sin necesidad de GPU ni de servicios de inferencia externos.
- Material docente de regresión tabular: ejemplo completo y reproducible de red densa pequeña, con exportación a formatos portables, evaluación por grupos y backtest temporal.

## Benchmarks y rendimiento

Evaluación en usuarios reservados (818 usuarios, 27.698 registros de concurso no vistos en entrenamiento; modelo entrenado el 2026-10-18):

| Métrica | Valor |
|---|---|
| MAE | 14,14 |
| RMSE | 22,01 |
| MAE del baseline «predecir siempre 0» | 27,79 |

Backtest sobre concursos reales recientes de usuarios fuera del conjunto de entrenamiento (`scripts/backtest.py`, 2026-10-19):

| Métrica | Valor |
|---|---|
| Concursos evaluados | 173 |
| MAE | 9,11 |
| Acierto de dirección (subida vs bajada) | 90,8 % |
| MAE del baseline «predecir siempre 0» | 29,34 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje en la información disponible, y no resultan aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Los 12.417 parámetros en float32 ocupan unos 48,5 KiB, más el escalador; el modelo completo cabe holgadamente en menos de 50 MB de memoria, incluyendo el runtime de Python.
- GPU recomendadas: ninguna. El modelo está diseñado para ejecutarse en CPU, y el autor lo sirve en un servicio web (Render) y en el navegador del cliente.
- GPU de consumo: no es necesaria ninguna; funcionaría en cualquier RTX, e incluso en un Raspberry Pi, pero no aporta ventaja.
- Opciones de despliegue: NumPy puro (sin TensorFlow), JavaScript en el navegador con `model.json`, Keras/TensorFlow si se quiere cargar `model.keras`, y un backend HTTP tipo FastAPI delante de cualquiera de las anteriores. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado medidas. Por la topología (una multiplicación matriz-vector de 12.417 parámetros), la inferencia es del orden de microsegundos o pocos milisegundos en CPU, incluyendo la sobrecarga de serialización; el cuello de botella realista es la llamada GraphQL a LeetCode, no el modelo.

## Comparativa con modelos similares

No se dispone de otros modelos publicados de predicción de rating de LeetCode con métricas comparables en la información proporcionada. La comparación más informativa es contra enfoques alternativos para el mismo problema:

| Enfoque | Parámetros | Contexto | MAE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 12.417 | no aplica | 14,14 (test) / 9,11 (backtest) | MIT | HuggingFace, portable a NumPy y JS |
| Réplica exacta de la fórmula Elo de LeetCode | no aplica (cálculo determinista) | no aplica | no disponible (exacta por construcción si se dispone de la ranklist completa) | no disponible | Requiere scrape de 30.000+ filas por concurso |
| Baseline «predecir siempre 0» | 0 | no aplica | 27,79 (test) / 29,34 (backtest) | no aplica | Trivial |
| Otros modelos de regresión tabular sobre las mismas features | no disponible | no aplica | no disponible | no disponible | No identificados en la información disponible |

## Limitaciones y advertencias

- Los primeros concursos de un usuario pueden mover el rating más de 100 puntos; la model card reconoce que esos casos concentran los errores más grandes y la métrica global no refleja ese régimen.
- La feature `participants` es sintética (`max(rank * 1.5, 10000)`), por lo que el modelo no conoce el tamaño real del concurso; esto puede degradar la predicción en concursos atípicamente grandes o pequeños.
- Dependencia de la fórmula de rating de LeetCode: si la plataforma la modifica, las predicciones dejan de ser válidas. El autor reejecuta el backtest semanalmente para detectar deriva, lo que implica que la validez debe verificarse de forma continua.
- Específico de una única plataforma y de una única variable objetivo; no es transferible a Codeforces, AtCoder ni a otros sistemas de rating sin reentrenamiento.
- MAE de 9-14 puntos: para decisiones individuales conviene comunicar la predicción como un intervalo, no como un valor exacto. El modelo no proporciona cuantificación de incertidumbre.
- No hay resultados publicados de calibración por segmento (por ejemplo, por rango de rating o por antigüedad del usuario), solo agregados.
- Discrepancia menor en la documentación: la descripción del repositorio de GitHub menciona «7 engineered features», mientras que la model card documenta 15 entradas. Conviene tomar la model card como referencia y verificar `app/services/features.py` antes de reutilizar las features.
- Licencia MIT: permite uso comercial y modificación, pero obliga a incluir el aviso de copyright y de permiso en las copias o distribuciones sustanciales del software.
- El modelo no genera texto ni admite instrucciones: cualquier interfaz conversacional debe construirse por encima, fuera del modelo.
- Metadatos de publicación y de entrenamiento con fecha de octubre de 2026; conviene verificar que los artefactos del repositorio corresponden a la versión evaluada antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sagargupta1610/leetcode-rating-predictor
- Repositorio en GitHub (código, entrenamiento y features): https://github.com/Sagargupta16/LeetCode_Rating_Predictor
- Extensión de navegador (sección del README): https://github.com/Sagargupta16/LeetCode_Rating_Predictor#browser-extension
- Aplicación web (Render): https://leetcode-rating-predictor.onrender.com
- Aplicación web alternativa (Vercel): https://leetcode-predictor.vercel.app/
- Perfil del autor en GitHub: https://github.com/Sagargupta16
- Perfil del autor en LeetCode: https://leetcode.com/u/Sagargupta1610/
- Recopilatorio de repositorios del autor: https://gist.github.com/Sagargupta16/ef2f64c28b4dfbfe3d240f506d69c4c7
- Paper o informe técnico: no disponible
