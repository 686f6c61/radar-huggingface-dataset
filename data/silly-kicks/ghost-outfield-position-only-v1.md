# silly-kicks/ghost-outfield-position-only-v1

## Resumen

`ghost-outfield-position-only-v1` es un modelo de regresión tabular desarrollado por `silly-kicks` (Karsten S. Nielsen) dentro de la librería de analítica de fútbol `silly-kicks`. Se trata de la variante *velocity-less* del modelo `ghost-outfield-v1`: predice la posición de la línea defensiva media de la liga (*rearguard*) por frame de tracking, equipo y slot lateral, utilizando un vector de 16 características del que se han eliminado las 4 variables de velocidad. Esta variante está diseñada específicamente para los *freeze-frames* de StatsBomb-360, que no incluyen velocidad por jugador.

El modelo resuelve el problema de estimar el posicionamiento defensivo esperado en situaciones de posesión y no posesión cuando no se dispone de datos temporales. Es relevante porque permite aplicar el concepto de *ghosting* (Le et al., 2017) a datos de tracking sin velocidad, evitando el uso incorrecto del modelo estándar. La arquitectura es un `HistGradientBoostingRegressor` con 500 árboles y profundidad máxima 8, entrenado a 1 fps sobre 179 partidos de fútbol profesional. El contexto no aplica al ser un modelo de regresión tabular.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingRegressor (bosque de gradiente) |
| Parametros totales | No disponible (modelo basado en árboles: 500 árboles, max depth 8) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de regresión tabular) |
| Tipos de cuantizacion | No aplica (no hay pesos de red neuronal; artefacto en NPZ + JSON) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | NPZ + JSON (parámetros de árboles, pickle-free, con checksums SHA-256) |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingRegressor` con 500 árboles de decisión, profundidad máxima 8 y validación cruzada de 5 pliegues. Se entrena con un vector de 16 características que excluye deliberadamente las 4 variables de velocidad del modelo `default` (componentes de velocidad del balón, velocidad del balón y velocidad del centroide del oponente), porque los *freeze-frames* de StatsBomb-360 no tienen historial temporal. La salida es un punto estimado (`ghost_gr_x/y`, coordenadas relativas a la portería defendida) que corresponde exactamente a la media del modelo boosteado, reconstruido sin `sklearn` en inferencia mediante `baseline + Σ_trees leaf_value`.

El entrenamiento se realizó sobre 179 partidos y aproximadamente 4,17 millones de filas por (frame, equipo, slot) a 1 fps, con datos de tracking profesional licenciados de Sportec/DFL Bundesliga, SkillCorner y Gradient Sports FIFA World Cup 2022. Solo se publican los parámetros aprendidos; no se redistribuye ningún dato de tracking crudo. El modelo está condicionado por posesión mediante una característica viva de `team_in_possession`, lo que permite servir tanto la línea defensiva en posesión (*rest-defense*) como la línea defensiva fuera de posesión con un único modelo, sin fugas de información hacia la coordenada objetivo. La carga es *fail-closed*: verifica SHA-256, quiralidad del comportamiento y contrato de características; si la región de rearguard no está suficientemente observada, devuelve `NaN` (`ghost_outfield_source="fov_cropped"`) en lugar de fabricar un *ghost*.

## Capacidades

- Predicción de la posición media de la línea defensiva (*rearguard*) por frame, equipo y slot lateral (slots 1 a 4).
- Soporte de entrada sin velocidad: funciona con *freeze-frames* de StatsBomb-360, que no incluyen velocidad por jugador.
- Condicionamiento por posesión: un solo modelo cubre tanto la *rest-defense* en posesión como la línea defensiva fuera de posesión.
- Estimación puntual exacta del `HistGradientBoostingRegressor`, sin dependencia de `sklearn` en inferencia.
- Detección de campo de visión insuficiente: devuelve `NaN` honesto cuando la región de rearguard no está suficientemente observada.
- Integración con la librería `silly-kicks` (v4.109.0+) mediante la API `tracking.serve_ghost_outfield_positions`.
- Normalización LTR requerida (el equipo local ataca hacia la derecha) y coordenadas relativas a la portería defendida.

## Casos de uso

- Análisis de *rest-defense* en posesión: el modelo predice la posición esperada de la línea defensiva cuando el equipo tiene el balón, permitiendo evaluar el riesgo de contraataque comparando la posición real con el *ghost* medio de la liga.
- Evaluación de posicionamiento defensivo fuera de posesión: en datos de StatsBomb-360, se puede medir la desviación de la defensa real respecto al posicionamiento medio de la liga, útil para identificar errores de cobertura o líneas demasiado adelantadas.
- Scouting de equipos y estilos: al analizar los slots laterales por separado, se pueden detectar asimetrías en el comportamiento defensivo (por ejemplo, un lateral que se adelanta más que el otro) y comparar equipos de diferentes ligas.
- Integración en pipelines de analítica de StatsBomb-360: al no requerir velocidad, es el modelo válido para *freeze-frames*; puede ejecutarse en lote sobre millones de frames y alimentar métricas agregadas de presión o cobertura.
- Simulación de escenarios de juego: el *ghost* se puede utilizar como referencia para generar posiciones defensivas esperadas en situaciones de contragolpe o transición, sirviendo como base para modelos de valoración de acciones.
- Investigación académica sobre *ghosting*: permite reproducir y extender el concepto de Le et al. (2017) con una variante de media boosteada, sin necesidad de estimación de densidad y con artefactos reproducibles (checksums, contrato de características).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MAE euclidiano CV (hold-out) | 6,07 m |
| MAE por proveedor | Gradient Sports 6,20 m / SkillCorner 5,99 m / Sportec 6,40 m |
| MAE CV por posesión | In-posesión 7,03 m / fuera de posesión 5,10 m |
| MAE CV por slot (slots 1–4) | 6,03 / 6,11 / 6,09 / 6,04 m |
| Coherencia de rearguard (orden de slots) | `ordering_fraction = 1,0` |
| Paridad de reconstrucción boosteada vs sklearn | Exacta (verificada por round-trip) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El MAE es ligeramente superior al de la variante `default` (que conserva las características de velocidad), como se espera al eliminar información. Se recomienda usar la variante `default` en datos de tracking con velocidad y esta variante solo en entrada sin velocidad.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la documentación del modelo.
- Por su naturaleza (regresión tabular con 500 árboles y 16 características), la inferencia se ejecuta en CPU sin necesidad de GPU. No se requiere VRAM.
- Es adecuado para procesamiento por lotes en CPU; la latencia por frame es del orden de milisegundos, aunque no se han publicado cifras oficiales de throughput.
- Opciones de despliegue: integración directa mediante la librería `silly-kicks` en Python; al ser un artefacto pickle-free en NPZ + JSON, puede cargarse sin `sklearn` y empaquetarse en servicios ligeros.
- No aplica el uso de vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Características | Uso principal | MAE CV | Licencia |
|---|---|---|---|---|
| `silly-kicks/ghost-outfield-position-only-v1` | 16 características, sin velocidad | StatsBomb-360 *freeze-frames* | 6,07 m | MIT |
| `silly-kicks/ghost-outfield-v1` (variante `default`) | 20 características, incluye velocidad | Tracking continuo (Sportec, SkillCorner, Gradient Sports) | No disponible en la información | MIT |
| `silly-kicks/ghost-gk-sweeper-v1` | Predice posición de portero, incluye régimen de *sweeper* alto | Análisis de posicionamiento del portero | No disponible en la información | MIT |

La comparativa se basa en las características documentadas en las model cards. La variante `default` es la opción recomendada cuando la velocidad está disponible; la variante `position_only` es la única válida para entrada sin velocidad. El modelo `ghost-gk-sweeper-v1` aborda una tarea distinta (portero) y no es directamente comparable en métricas.

## Limitaciones y advertencias

- El modelo predice posicionamiento medio de liga, no el estilo de un jugador o equipo específico. No captura variaciones tácticas individuales.
- Las características de velocidad se eliminan deliberadamente; el modelo solo debe usarse en entrada sin velocidad. Usarlo en datos con velocidad es incorrecto (la variante `default` es la adecuada).
- Es una estimación estática por frame, sin dependencia temporal; no modela trayectorias ni movimientos anticipados.
- Requiere normalización LTR (el equipo local ataca hacia la derecha) y coordenadas relativas a la portería defendida; una entrada mal normalizada produce resultados inválidos.
- En regiones de rearguard insuficientemente observadas, el modelo devuelve `NaN` en lugar de una estimación; esto puede reducir la cobertura en frames con campo de visión limitado.
- Los datos de entrenamiento proceden principalmente de la Bundesliga (Sportec/DFL) y la Copa Mundial FIFA 2022 (Gradient Sports), por lo que el modelo puede tener sesgos hacia estilos de juego europeos e internacionales.
- La licencia MIT permite uso comercial, pero los datos de tracking originales son licenciados y no se redistribuyen; el artefacto publicado contiene solo parámetros aprendidos.
- No se han publicado análisis de sesgos específicos ni pruebas de robustez ante cambios de proveedor o de formato de datos.

## Enlaces

- HuggingFace: https://huggingface.co/silly-kicks/ghost-outfield-position-only-v1
- Modelo `default` (variante con velocidad): https://huggingface.co/silly-kicks/ghost-outfield-v1
- Modelo `ghost-gk-sweeper-v1`: https://huggingface.co/silly-kicks/ghost-gk-sweeper-v1
- Librería `silly-kicks` en PyPI: https://pypi.org/project/silly-kicks/
- Repositorio GitHub: https://github.com/karsten-s-nielsen/silly-kicks
- Referencia académica: Le et al. 2017, *Data-Driven Ghosting* (MIT Sloan)
