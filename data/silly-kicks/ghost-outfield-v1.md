# silly-kicks/ghost-outfield-v1

## Resumen

El modelo Ghost-Outfield v1, desarrollado por silly-kicks, es un modelo de regresión tabular que predice dónde se posicionaría un defensor de la línea trasera (rearguard) de nivel medio de la liga en cada frame de seguimiento, por equipo y slot lateral. Es la variante de campo del modelo Ghost-GK v1, concebido para el análisis de "rest-defense" (la defensa que mantiene el equipo en posesión para frenar el contraataque). Se trata de una estimación puntual de las coordenadas relativas a la portería defendida (`ghost_gr_x/y`) basada en la media exacta de un `HistGradientBoostingRegressor` boosteado, reconstruida sin dependencias de sklearn.

El modelo resuelve la necesidad de obtener un baseline de posicionamiento defensivo promedio de la liga contra el que comparar la forma real de un equipo. Forma parte de la librería silly-kicks (v4.109.0+) y se basa en el concepto de "ghosting" de Le et al. (2017), pero en su variante de media puntual, sin estimación de densidad. Es relevante para analistas de fútbol, investigadores y desarrolladores de modelos de valoración que necesitan una referencia robusta para evaluar la organización defensiva en transición.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingRegressor (boosting de gradiente basado en histogramas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de regresión tabular, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye como npz con parámetros boosteados, sin cuantización neuronal) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | NPZ (dos conjuntos boosteados x/y + baselines) con JSON metadata y SHA-256 checksums |

## Arquitectura y entrenamiento

El modelo utiliza un `HistGradientBoostingRegressor` con 500 árboles, profundidad máxima 8 y validación cruzada de 5 pliegues. Se entrenó a 1 frame por segundo (1 fps) en lugar de 25 fps para reducir la autocorrelación y eliminar filas casi duplicadas sin pérdida significativa de señal para un modelo de posicionamiento medio. El conjunto de datos de entrenamiento comprende 179 partidos y aproximadamente 4,17 millones de filas por (frame, equipo, slot), procedentes de sistemas de tracking profesional licenciado: Sportec/DFL Bundesliga, SkillCorner y Gradient Sports (FIFA World Cup 2022). Solo se publican los parámetros aprendidos; no se redistribuyen datos crudos de tracking (ADR-011/044).

La arquitectura está diseñada para ser segura frente a fugas de información (leakage-safe) por construcción: ninguna entrada codifica las coordenadas del propio rearguard del equipo modelado, que es el objetivo de predicción. El vector de características incluye estado del balón, geometría de la amenaza de contraataque del oponente, contexto del juego y el rango del slot lateral. Además, el modelo incorpora una huella de quiralidad (chirality fingerprint) para rechazar modelos espejados y un contrato de características (feature-contract fingerprint) para validar la integridad de la carga. No se aplicó RLHF ni DPO, ya que es un modelo de regresión supervisada.

## Capacidades

- Predicción de posición del rearguard: genera coordenadas relativas a la portería (`ghost_gr_x/y`) para los defensores más profundos de un equipo, rankeados de izquierda a derecha por `slot_index`.
- Condicionado por posesión: un único modelo sirve tanto para el rearguard del equipo en posesión como para la línea defensiva que enfrenta un ataque, mediante la feature `team_in_possession`.
- Sin fuga de datos: el vector de características no incluye las coordenadas del propio rearguard, lo que evita que el modelo memorice el objetivo.
- Variantes de features: `default` con 20 features (incluye velocidad) y `position_only` con 16 features (sin velocidad) para fotogramas congelados de StatsBomb-360.
- Punto estimado exacto: la salida es la media exacta del conjunto de árboles boosteados, reconstruida sin sklearn en inferencia.
- FOV honest-NaN: para datos de StatsBomb-360, si la región del rearguard no está suficientemente observada, devuelve NaN en lugar de fabricar una posición.
- Verificación de integridad: SHA-256 y la huella de quiralidad garantizan que el modelo cargado es el correcto y no está espejado.
- Reconstrucción sin pickle: los pesos se sirven como npz + JSON, sin necesidad de pickle ni sklearn en producción.

## Casos de uso

- Análisis táctico de rest-defense: el modelo permite comparar la forma real de la línea defensiva de un equipo con la media de la liga en cada frame, identificando desviaciones tácticas y posibles vulnerabilidades al contraataque.
- Scouting de equipos: los analistas pueden evaluar si un equipo deja más espacio de lo normal en la transición defensiva, usando el ghost como referencia de rearguard promedio.
- Normalización de datos de tracking: al predecir la posición esperada, se pueden crear métricas de desviación que sean comparables entre proveedores de datos (Sportec, SkillCorner, Gradient Sports).
- Integración en pipelines de valoración de acciones (VAEP/xT): el ghost sirve como baseline para calcular el impacto de la posición real del rearguard en la probabilidad de gol del oponente.
- Visualización en dashboards de análisis de partido: se pueden dibujar las posiciones fantasma del rearguard en mapas de campo, facilitando la interpretación táctica en tiempo real.
- Investigación en análisis de fútbol: el modelo proporciona una implementación reproducible y sin pickle del concepto de ghosting, útil para estudios académicos sobre rest-defense.
- Análisis de contraataques: al conocer dónde estaría el rearguard promedio, se puede cuantificar la exposición de un equipo a pérdidas de balón y transiciones rápidas.

## Benchmarks y rendimiento

El modelo no presenta benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. Se han publicado métricas de evaluación propias de la tarea de regresión tabular:

| Métrica | Valor |
|---|---|
| Held-out CV euclidean MAE | 6,00 m (por proveedor: Gradient Sports 6,14 / SkillCorner 5,92 / Sportec 6,33) |
| Per-possession CV MAE | in-possession 6,97 m / out-of-possession 5,04 m |
| Per-slot CV MAE (slots 1-4) | 5,96 / 6,05 / 6,02 / 5,98 m |
| Rearguard coherence (slot ordering) | ordering_fraction = 1,0 (los slots independientes se ordenan como una línea) |
| Reconstrucción boosteada vs sklearn | exacta (verificado round-trip) |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo es un conjunto de árboles de decisión boosteados, no una red neuronal, por lo que no requiere GPU ni VRAM dedicada.
- Se ejecuta eficientemente en CPU; el tamaño del repositorio es 0,0 GB (solo parámetros aprendidos).
- Para cargar el modelo se necesita Python con la librería silly-kicks (v4.109.0+) y numpy; no se requiere hardware especializado.
- La inferencia es de baja latencia al ser un modelo de 500 árboles con profundidad máxima 8, aunque no se han publicado medidas de throughput.
- El despliegue se realiza integrando el modelo en pipelines Python de análisis de datos (pandas, numpy), no mediante servidores de inferencia como vLLM o llama.cpp.

## Comparativa con modelos similares

| Modelo | Tipo | Features | Uso | MAE (CV) | Licencia |
|---|---|---|---|---|---|
| Ghost-Outfield v1 (default) | HistGradientBoostingRegressor | 20 (con velocidad) | Tracking continuo (Sportec, SkillCorner, Gradient) | 6,00 m | MIT |
| Ghost-Outfield position-only v1 | HistGradientBoostingRegressor | 16 (sin velocidad) | Freeze-frames de StatsBomb-360 | no disponible | MIT |
| Ghost-GK v1 | HistGradientBoostingRegressor | no disponible | Posicionamiento de portero | no disponible | MIT |

El modelo Ghost-Outfield v1 es la variante de campo del Ghost-GK v1. La variante position-only es la misma arquitectura pero sin las 4 features de velocidad, pensada para datos sin velocidad. No se dispone de métricas comparables para Ghost-GK v1 en la información proporcionada.

## Limitaciones y advertencias

- El modelo predice posicionamiento promedio de liga, no el estilo táctico de un jugador o equipo específico.
- Es una estimación estática por frame; hereda el ruido del sistema de tracking utilizado.
- Requiere normalización LTR (home ataca a la derecha) en los frames de entrada; de lo contrario, las predicciones son inválidas.
- No es un modelo de lenguaje ni de visión; no ofrece tool calling, generación de texto, razonamiento simbólico ni capacidades de agente.
- Para fotogramas de StatsBomb-360, puede devolver NaN si la región del rearguard no está suficientemente observada (FOV cropped), lo que debe gestionarse en el pipeline.
- No incluye estimación de densidad; solo un punto estimado, lo que limita el análisis de incertidumbre.
- Si los frames no tienen features de velocidad, se debe usar la variante position_only; usar la variante default con frames sin velocidad produce NaN honesto.
- No aplica el riesgo de alucinación en el sentido de modelos generativos de texto; las predicciones son numéricas y están sujetas a error de regresión (MAE de 6,00 m).
- El modelo no redistribuye datos crudos de tracking; solo parámetros aprendidos, lo que limita la reproducibilidad en el sentido de reentrenamiento con los datos originales.
- La licencia MIT permite uso comercial, pero el modelo está diseñado específicamente para datos de fútbol con formato de la librería silly-kicks; la integración con otros formatos requiere adaptación.
- Las métricas de error varían según el proveedor de datos (Gradient Sports 6,14 m, SkillCorner 5,92 m, Sportec 6,33 m), lo que sugiere un posible sesgo dependiente del sistema de tracking.

## Enlaces

- HuggingFace: https://huggingface.co/silly-kicks/ghost-outfield-v1
- Organización silly-kicks en HuggingFace: https://huggingface.co/silly-kicks
- Variante position_only: https://huggingface.co/silly-kicks/ghost-outfield-position-only-v1
- Ghost-GK v1: https://huggingface.co/silly-kicks/ghost-gk-v1
- Repositorio GitHub: https://github.com/karsten-s-nielsen/silly-kicks
- Paquete PyPI: https://pypi.org/project/silly-kicks/
- Referencia: Le et al. 2017 (Data-Driven Ghosting, MIT Sloan) - citado en la model card.
