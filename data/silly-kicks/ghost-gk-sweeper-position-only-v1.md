# silly-kicks/ghost-gk-sweeper-position-only-v1

## Resumen

El modelo `ghost-gk-sweeper-position-only-v1` es un regresor tabular desarrollado por el usuario `silly-kicks` (autor: Karsten S. Nielsen) como parte de la librería de analítica de fútbol `silly-kicks`. Su función es estimar la posición óptima de un portero (el llamado "ghost goalkeeper" o portero fantasma) en situaciones de posesión del equipo contrario, es decir, dónde debería situarse un portero barrendero de altura ("high sweeper") para optimizar la defensa. Este modelo concreto es la variante "solo posición" (position-only) del `ghost-gk-sweeper-v1`: elimina las 5 características de velocidad de los jugadores y la pelota, lo que permite aplicarlo sobre *freeze-frames* de StatsBomb-360 que no incluyen historial temporal por jugador.

El modelo utiliza un `HistGradientBoostingRegressor` de scikit-learn con 500 árboles de profundidad máxima 8, entrenado sobre 179 partidos con licencia de tres proveedores de datos de tracking (Sportec/DFL, SkillCorner y Gradient Sports WC2022). Trabaja sobre una rejilla extendida de x ∈ [0, 52.5] m e y ∈ [18, 50] m con resolución de 0.5 m, superando así el límite de 30 m de los modelos originales de la librería, lo que le permite posicionar porteros muy adelantados (entre 30 y 45 m). El modelo es de punto estimado único (sin distribución de densidad) y está pensado para integrarse en pipelines de análisis táctico de la librería `silly-kicks`.

Su relevancia radica en que resuelve un problema concreto de la analítica de fútbol: la evaluación del comportamiento de porteros con vocación ofensiva y de la "rest-defense" (defensa en fase de posesión), un área poco cubierta por los modelos tradicionales que suelen limitarse a la fase defensiva. Al ser un modelo ligero (sin red neuronal, sin GPU) y con licencia MIT, es fácilmente reproducible y desplegable en entornos de análisis de datos deportivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingRegressor (árboles de decisión con gradiente boosting) |
| Parametros totales | No aplica (modelo de boosting; 500 árboles de profundidad 8) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (modelo tabular, sin secuencias) |
| Tipos de cuantizacion | No aplica (modelo de árboles, no requiere cuantización) |
| Idiomas soportados | Inglés (etiquetas y documentación; el modelo es numérico) |
| Licencia | MIT |
| Formato de pesos | npz + JSON + SHA-256 (parámetros sin pickle) |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingRegressor` de scikit-learn, una implementación de gradiente boosting sobre histogramas que acelera el entrenamiento en datasets tabulares de tamaño medio. Se entrenó con 500 árboles de decisión con profundidad máxima 8 y validación cruzada de 5 pliegues. La entrada son 21 características numéricas que describen el estado del juego en un instante dado: posiciones de los jugadores, de la pelota, línea defensiva, etc., todas normalizadas en coordenadas relativas a la portería (LTR, left-to-right). Las 5 características de velocidad (`ball_vx`, `ball_vy`, `ball_speed`, `defensive_line_speed`, `defending_centroid_vx`) se eliminan por diseño, no se rellenan con valores nulos: el contrato de características lanza un error si se recibe un valor no finito.

El entrenamiento se realizó sobre un corpus de 179 partidos con licencia de tres proveedores: Sportec/DFL, SkillCorner y Gradient Sports (Copa del Mundo 2022). El modelo solo almacena parámetros (sin datos crudos ni por muestra), cumpliendo el principio ADR-044 de la librería. La innovación principal frente a los modelos `default` y `position_only` de `silly-kicks` es la ampliación de la rejilla de x hasta 52.5 m (antes limitada a 30 m con saturación), lo que permite predecir posiciones de portero muy adelantadas, y la eliminación de las características de velocidad para ser compatible con *freeze-frames* estáticos.

## Capacidades

- Predicción de la posición óptima del portero (coordenadas `ghost_gk_x` y `ghost_gk_y`) en situaciones de posesión rival, asumiendo un rol de "sweeper" (portero barrendero) de alta presión.
- Funciona exclusivamente sobre *freeze-frames* sin velocidad (frames congelados de StatsBomb-360), gracias a la eliminación de las características de velocidad.
- Soporta una rejilla espacial extendida: x hasta 52.5 m, y entre 18 y 50 m, con resolución de 0.5 m.
- Integración nativa con la librería `silly-kicks` mediante `from_variant("sweeper_position_only")` y el método `compute_ghost_gk`.
- Validación de entrada con detección de no-finitos (los valores no finitos lanzan error, no se imputan).
- Genera una estimación puntual (media) sin distribución de densidad; `predict_density` no está soportado en la rejilla extendida.
- Compatible con normalización LTR (left-to-right) de los datos de tracking.

## Casos de uso

- Análisis de la "rest-defense" (defensa en fase de ataque): el modelo permite evaluar si un portero se posiciona correctamente para cubrir espacios detrás de la línea defensiva cuando su equipo tiene la posesión, usando datos de *freeze-frames* de StatsBomb-360.
- Evaluación de porteros barrenderos (sweeper-keepers): se puede medir la desviación entre la posición real del portero y la posición óptima predicha por el modelo en situaciones de posesión rival, cuantificando así su agresividad y su capacidad de lectura del juego.
- Scouting y análisis de equipos: los datos de posicionamiento del portero pueden combinarse con métricas de valor esperado (VAEP, xT) para identificar equipos que emplean una línea defensiva muy alta y cómo el portero se adapta a ella.
- Investigación en analítica de fútbol: el modelo sirve como referencia para estudios sobre la evolución táctica del rol del portero, especialmente en la cobertura de espacios largos (más de 30 m).
- Integración en pipelines de datos de tracking: al ser un modelo ligero y sin dependencias de GPU, puede ejecutarse en servidores de análisis de datos en tiempo casi real para generar métricas de posicionamiento por partido.
- Generación de informes de rendimiento individual: se pueden calcular métricas agregadas (por ejemplo, distancia media al óptimo, percentiles) para porteros de distintas ligas, siempre que los datos estén normalizados LTR y sean compatibles con la rejilla.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| MAE euclidiano en validación cruzada (hold-out) | 1.164 m |
| MAE por proveedor (Gradient Sports) | 1.095 m |
| MAE por proveedor (SkillCorner) | 1.217 m |
| MAE por proveedor (Sportec) | 1.742 m |
| MAE en estrato de portero alto (> 30 m) | ~2.03 m |
| Paridad de reconstrucción boosteada vs sklearn | 1.28e-13 (exacta) |

Nota: la cobertura de frames con portero a más de 30 m es del 11.5 % y está dominada por los datos de IDSSE/Sportec; SkillCorner contribuye solo un 0.24 % y Gradient Sports no aporta ninguna muestra por encima de 30 m (ver limitaciones).

No se han publicado resultados comparativos con otros modelos de posicionamiento de portero en la información disponible.

## Requisitos de hardware

- Modelo extremadamente ligero: no requiere GPU. La inferencia con 500 árboles de profundidad 8 es prácticamente instantánea en CPU (milisegundos por frame).
- Memoria RAM: menos de 100 MB para cargar los parámetros del modelo (npz + JSON).
- Puede ejecutarse en cualquier máquina con Python 3.8+ y scikit-learn (o la librería `silly-kicks` v4.105.0+).
- Opciones de despliegue: integración directa en scripts Python, uso como parte de la librería `silly-kicks`, o exportación a formato ONNX para servir en producción (aunque no está documentado oficialmente).
- No requiere servicios de inferencia como vLLM, Ollama o TGI, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Características | Grid / Alcance | MAE (CV) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ghost-gk-sweeper-position-only-v1` (este modelo) | 21 features, sin velocidad | x hasta 52.5 m | 1.164 m | MIT | HuggingFace |
| `ghost-gk-sweeper-v1` | 26 features, con velocidad | x hasta 52.5 m (presumiblemente) | No publicado | MIT | HuggingFace |
| Variantes `default` / `position_only` de `ghost-gk-v1` | 26 features (con o sin velocidad) | x hasta 30 m (saturación) | No publicado | MIT | HuggingFace |

No se dispone de datos de benchmarks comparativos con otros modelos externos (p. ej., modelos de posicionamiento de portero basados en redes neuronales). La comparación se limita a las variantes internas de la librería `silly-kicks`.

## Limitaciones y advertencias

- El modelo predice la posición media de un portero de liga, no el estilo individual de un portero concreto; no modela la capacidad de detener disparos ni otras habilidades específicas.
- No soporta estimación de densidad (KDE) en la rejilla extendida; solo proporciona la media puntual.
- Los datos de Gradient Sports presentan una limitación conocida: la posición del portero está limitada a un máximo de 27.5 m desde la portería (clamp duro en la fuente de datos). Cualquier análisis de profundidad del portero con datos de Gradient Sports más allá de 27.5 m es inválido. La librería emite una advertencia `GoalkeeperClampWarning` al detectar esta situación.
- El modelo requiere normalización LTR (left-to-right) de los datos de entrada; no funciona con datos en orientación contraria.
- Es una estimación estática por frame; no tiene en cuenta la dinámica temporal ni las trayectorias de los jugadores.
- Solo está diseñado para la fase de posesión rival (rest-defense); no es aplicable a otras fases del juego.
- Aunque la licencia es MIT, los datos de entrenamiento provienen de proveedores con licencia; el modelo solo distribuye parámetros, no datos crudos, por lo que su uso en producción requiere verificar que los datos de entrada cumplan las licencias de los proveedores originales.
- El modelo está documentado en inglés; no hay soporte oficial en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/silly-kicks/ghost-gk-sweeper-position-only-v1
- Modelo hermano con velocidad: https://huggingface.co/silly-kicks/ghost-gk-sweeper-v1
- Página del autor en HuggingFace: https://huggingface.co/silly-kicks
- Librería `silly-kicks` en PyPI: https://pypi.org/project/silly-kicks/
- Repositorio GitHub: https://github.com/karsten-s-nielsen/silly-kicks
- Referencias citadas en la model card:
  - Le et al. 2017 (MIT Sloan) — no se proporciona URL directa
  - Dutta et al. 2024, arXiv:2406.17220
  - Pospisil & Lee 2018, arXiv:1804.05753
