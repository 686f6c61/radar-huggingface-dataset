# silly-kicks/ghost-gk-sweeper-v1

## Resumen

Ghost-GK Sweeper v1 es un modelo de regresión tabular desarrollado por silly-kicks (Ministry of Silly Kicks) para el ecosistema de analítica de fútbol de la librería homónima. Su objetivo es predecir la posición que adoptaría un portero de nivel medio de la liga en situaciones de "rest-defense" — es decir, cuando su equipo tiene la posesión y el guardameta se adelanta para frenar un posible contraataque. A diferencia del modelo base Ghost-GK v1, que limita la predicción a un grid fijo de 30 metros desde la portería, esta variante amplía el rango hasta 52,5 metros, permitiendo representar el régimen de "sweeper" (portero barredor) que el modelo original satura.

El modelo es un `HistGradientBoostingRegressor` con 500 árboles de profundidad máxima 8, entrenado con validación cruzada de 5 pliegues sobre aproximadamente 1,05 millones de frames procedentes de 179 partidos de tracking profesional (Sportec/DFL Bundesliga, SkillCorner y Gradient Sports FIFA World Cup 2022). Publica únicamente los parámetros aprendidos en formato npz (sin datos de tracking crudos), con reconstrucción de predicciones libre de pickle, lo que facilita su integración en entornos de producción. Su licencia MIT permite uso comercial sin restricciones.

La relevancia actual del modelo reside en que cubre un hueco funcional en la analítica de fútbol: los modelos de "ghosting" tradicionales se centran en el posicionamiento dentro del área, pero no modelan la conducta del portero cuando se aleja de su línea para participar en la construcción del juego. Este modelo aporta una herramienta específica para evaluar decisiones tácticas en el tercio defensivo, con métricas de error publicadas y una advertencia explícita sobre la limitación de datos de Gradient Sports.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingRegressor (ensemble de 500 árboles, profundidad máxima 8) |
| Parametros totales | No disponible (modelo de árboles, no se reportan parámetros numéricos) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | No aplicable (inferencia sin cuantización; los pesos se guardan como npz) |
| Idiomas soportados | en (aunque el modelo es numérico, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | npz (ensembles + baselines) + JSON metadata + checksums SHA-256 |

## Arquitectura y entrenamiento

El modelo emplea un `HistGradientBoostingRegressor` de scikit-learn, configurado con 500 árboles, profundidad máxima 8 y validación cruzada de 5 pliegues. La arquitectura es deliberadamente simple: se trata de un ensemble de árboles de decisión que aprenden una función de regresión desde 26 características (variante `sweeper`) o 21 características (variante `sweeper_position_only`, que elimina las 5 variables de velocidad). La salida son dos coordenadas continuas — `ghost_gk_x` y `ghost_gk_y` — que representan la posición esperada del portero en un grid goal-relative con resolución de 0,5 metros: el eje x abarca [0, 52,5] metros y el eje y [18, 50] metros, dando lugar a una malla de 105×64 celdas.

El entrenamiento se realizó con datos de tracking profesional de tres proveedores: Sportec (DFL Bundesliga), SkillCorner y Gradient Sports (FIFA World Cup 2022). Se utilizaron 179 partidos y ~1,05 millones de frames. El dataset está dominado por IDSSE/Sportec en el estrato de alta profundidad (>30 m), que representa el 11,5 % del corpus, mientras que SkillCorner solo aporta un 0,24 % y Gradient Sports un 0,0 % (debido a un clampado del proveedor que limita la posición del portero a 27,5 m). El modelo se publica como artefacto de solo parámetros: no se redistribuyen datos crudos de tracking (ADR-044) y las predicciones se reconstruyen sin usar sklearn en inferencia, mediante la suma de `baseline + Σ_árboles leaf_value`, lo que garantiza una paridad exacta con la implementación original (error de 1,21e-13).

## Capacidades

- Predicción de posicionamiento de portero en régimen de "rest-defense", incluyendo el rango de 30 a 52,5 metros desde la portería, que el modelo base no puede representar.
- Salida de punto estimado (`ghost_gk_x/y`) como media exacta del ensemble, sin necesidad de librerías de boosting en tiempo de inferencia.
- Soporte de dos variantes: `sweeper` (con características de velocidad, para tracking continuo) y `sweeper_position_only` (sin velocidad, para freeze-frames de StatsBomb-360).
- Normalización LTR (home ataca a la derecha) y coordenadas goal-relative, lo que permite comparar entre partidos y proveedores.
- Integración nativa con la librería silly-kicks (v4.105.0+), mediante `GhostGkModel.from_variant("sweeper")` y `compute_ghost_gk`.

No se reportan capacidades de generación de texto, visión, tool calling ni agentes: es un modelo puramente tabular de regresión.

## Casos de uso

- Análisis táctico de rest-defense: un analista puede usar el modelo para evaluar si un portero se posiciona de forma óptima cuando su equipo tiene el balón y el rival presiona alto. Por ejemplo, comparar la posición real del guardameta en un partido con la predicción del modelo en cada frame.
- Evaluación de porteros en contraataques: el modelo permite cuantificar cuánto se adelanta un portero en situaciones de alta presión y si esa decisión es consistente con el promedio de la liga, ayudando a detectar estilos de juego arriesgados o conservadores.
- Integración en pipelines de analítica de fútbol: al ser un artefacto pickle-free y ligero (peso total 0,0 GB según el repo), puede incorporarse a flujos de datos en tiempo real o batch sin dependencias pesadas. Por ejemplo, en un servicio que procesa tracking de Sportec en directo.
- Validación de datos de tracking: la advertencia sobre el clampado de Gradient Sports (posición del portero limitada a 27,5 m) se puede usar como control de calidad: si un proveedor entrega posiciones de portero más allá de ese límite, el modelo puede señalarlo como un posible error de datos.
- Investigación académica en analítica deportiva: el modelo sirve como baseline reproducible para estudios sobre comportamiento de porteros, dado que publica sus hiperparámetros y métricas de validación.
- Comparativa entre proveedores de datos: dado que el modelo reporta MAE por proveedor (Sportec 1,734 m, SkillCorner 1,167 m, Gradient Sports 1,078 m), puede usarse para evaluar la consistencia de distintas fuentes de tracking.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| MAE euclidiano (validación cruzada, held-out) | 1,142 m |
| MAE por proveedor — Gradient Sports | 1,078 m |
| MAE por proveedor — SkillCorner | 1,167 m |
| MAE por proveedor — Sportec | 1,734 m |
| MAE en estrato de alta profundidad (>30 m) | ~2,06 m |
| Paridad de reconstrucción vs sklearn | 1,21e-13 |

No se han publicado resultados comparativos con otros modelos de ghosting en la información disponible. Los valores anteriores provienen de la model card del autor.

## Requisitos de hardware

- Es un modelo de árboles de boosting, no una red neuronal: la inferencia es ligera y corre en CPU sin necesidad de GPU.
- El paquete `silly-kicks` requiere Python y las dependencias típicas de ciencia de datos (numpy, pandas, etc.), pero la reconstrucción de predicciones no usa sklearn en runtime.
- No se dispone de mediciones de latencia o throughput publicadas; dado el tamaño (500 árboles de profundidad 8), se estima que la inferencia por frame es del orden de milisegundos en un procesador moderno.
- Para procesar grandes volúmenes de frames (por ejemplo, un partido completo con ~30 fps), se recomienda un entorno con al menos 4 GB de RAM, aunque el modelo en sí ocupa menos de 100 MB en memoria.
- Opciones de despliegue: integración directa en Python mediante la librería silly-kicks, o exportación a otros formatos (por ejemplo, ONNX) si se requiere servir en otros lenguajes.

## Comparativa con modelos similares

| Modelo | Grid (x máx) | Características | Uso principal | MAE euclidiano |
|---|---|---|---|---|
| Ghost-GK Sweeper v1 (este modelo) | 52,5 m | 26 (con velocidad) | Rest-defense, alta profundidad | 1,142 m |
| Ghost-GK v1 (modelo base) | 30 m | No especificado | Posicionamiento en área | No disponible |
| Ghost-GK Sweeper Position-Only v1 | 52,5 m | 21 (sin velocidad) | Freeze-frames sin velocidad | No disponible |

El modelo base Ghost-GK v1 satura a 30 m y no puede representar porteros adelantados; esta variante amplía el rango. La variante `position_only` comparte el grid extendido pero elimina las características de velocidad, lo que la hace adecuada para datos estáticos. No se dispone de comparativas con modelos de ghosting de otros dominios (por ejemplo, NFL Ghosts) en la información proporcionada.

## Limitaciones y advertencias

- El modelo predice la posición de un portero promedio de la liga, no el estilo de un portero específico; no modela habilidades de parada de tiros.
- No soporta la salida de densidad KDE en el grid extendido: `predict_density` lanza una excepción (ADR-083). Solo está disponible la ruta de media/servicio.
- Los datos de Gradient Sports tienen un clampado del proveedor que limita la posición del portero a 27,5 m de la portería; cualquier análisis de profundidad del portero con datos de Gradient Sports más allá de ese límite es inválido. El modelo lo señala mediante `GoalkeeperClampWarning`.
- El estrato de alta profundidad (>30 m) está dominado por datos de Sportec (11,5 % del corpus), con muy poca representación de SkillCorner (0,24 %) y ninguna de Gradient Sports, lo que puede introducir sesgo hacia el estilo de juego de la Bundesliga.
- Requiere normalización LTR (home ataca a la derecha) y coordenadas goal-relative; si los datos de entrada no cumplen esta condición, las predicciones serán incorrectas.
- Es una estimación estática por frame; no modela la evolución temporal de la posición del portero ni las interacciones con otros jugadores.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye como artefacto de solo parámetros; los datos de entrenamiento originales no se redistribuyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/silly-kicks/ghost-gk-sweeper-v1
- Modelo base Ghost-GK v1: https://huggingface.co/silly-kicks/ghost-gk-v1
- Variante position-only: https://huggingface.co/silly-kicks/ghost-gk-sweeper-position-only-v1
- Organización silly-kicks en HuggingFace: https://huggingface.co/silly-kicks
- Repositorio GitHub de silly-kicks: https://github.com/karsten-s-nielsen/silly-kicks
- Paquete PyPI: https://pypi.org/project/silly-kicks/
- Referencia: Le et al. 2017 (Data-Driven Ghosting, MIT Sloan) — no disponible en línea en los resultados
- Referencia: Dutta et al. 2024 (NFL Ghosts, arXiv:2406.17220): https://arxiv.org/abs/2406.17220
- Referencia: Pospisil & Lee 2018 (RFCDE, arXiv:1804.05753): https://arxiv.org/abs/1804.05753
