# silly-kicks/xcross-attempt-position-only-v1

## Resumen

xCrossAttempt v1 (`sc_extended_position_only`) es un modelo de clasificación tabular desarrollado por silly-kicks, una librería Python de análisis de fútbol basada en datos de tracking. El modelo estima la probabilidad de que el equipo en posesión del balón intente un centro (cross) en aproximadamente un segundo a partir de un frame de tracking, utilizando únicamente características posicionales (coordenadas de jugadores y balón) y descartando las derivadas de velocidad. Esta variante concreta está entrenada sobre un corpus propietario de nivel "owner-tier" que incluye datos de IDSSE y SkillCorner, y se distribuye exclusivamente a través de Hugging Face por restricciones de licencia de los datos subyacentes.

El modelo se basa en un booster XGBoost con 15 características, coordenadas relativas a la portería, y un filtro de dominio que selecciona balones en juego en zonas amplias del campo. La tasa base de positivos es del 5,0%. Su relevancia radica en que permite puntuar frames de tracking que carecen de datos de velocidad, como los freeze-frames de StatsBomb-360, manteniendo un marco de inferencia causal anclado en el estado del juego (Cao et al., arXiv:2505.11841). Es una alternativa más débil que el modelo con velocidad (`sc_extended`), pero la única opción viable cuando no se dispone de velocidades por jugador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (booster, pickle-free) |
| Parametros totales | no disponible (no se especifican arboles ni profundidad) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica (modelo tabular, no requiere cuantizacion) |
| Idiomas soportados | ingles (etiquetas y documentacion; los datos son numericos) |
| Licencia | MIT |
| Formato de pesos | model.json (XGBoost booster), metadata.json, metrics.json, SHA256SUMS |

## Arquitectura y entrenamiento

El modelo es un clasificador binario basado en XGBoost, entrenado con 15 características posicionales (coordenadas x/y de jugadores y balón, normalizadas respecto a la portería mediante un helper geométrico compartido). Las características derivadas de velocidad se eliminan por completo, no se rellenan con NaN, de modo que el modelo puede puntuar frames que no contienen velocidades por jugador. El entrenamiento se realizó sobre un corpus propietario de nivel "owner-tier" que combina datos de IDSSE y SkillCorner, incluyendo 98 partidos de SkillCorner con acceso restringido. El marco metodológico sigue el enfoque de propensión a centro anclado en el estado (STATE-anchored) descrito en Cao et al. (2025), con un bloque aislable de confusión por posición del portero. No se aplicaron técnicas de RLHF ni DPO; es un modelo supervisado clásico.

## Capacidades

- Clasificación de propensión a centro: estima P(centro en ~1 s) a partir de un frame de tracking.
- Funciona con frames sin velocidad: acepta exclusivamente características posicionales, sin requerir imputación de velocidades.
- Inferencia causal: incorpora un bloque de confusión por posición del portero y un marco de preguntas causales para análisis deportivo.
- Integración con la librería silly-kicks: se carga mediante `XCrossAttemptModel.from_variant("sc_extended_position_only")`.
- Validación de integridad: verificación SHA256SUMS y huella de quiralidad en tiempo de carga.
- Multilingüe: no aplica, los datos son numéricos y las etiquetas están en inglés.

## Casos de uso

- Análisis táctico de equipos: evaluar la propensión a centrar de un equipo en diferentes fases del juego, usando datos de tracking sin velocidad (por ejemplo, StatsBomb-360 freeze-frames).
- Scouting de jugadores y equipos: comparar la frecuencia esperada de centros entre rivales o en contextos específicos (marcador, zona del campo, presión).
- Evaluación de decisiones de entrenador: medir el impacto de cambios tácticos en la probabilidad de centrar, controlando por la posición del portero.
- Investigación académica en análisis deportivo: servir como modelo de referencia para estudios de inferencia causal en fútbol, replicando el marco de Cao et al.
- Desarrollo de métricas avanzadas: integrar la propensión a centro como covariable en modelos de valoración de acciones (VAEP) o modelos de expected threat.
- Automatización de informes de rendimiento: generar reportes periódicos de tendencias de ataque por equipo o liga, usando datos de tracking de bajo coste (sin necesidad de velocidades).

## Benchmarks y rendimiento

La model card reporta métricas de validación cruzada (5 folds, out-of-fold) para esta variante:

| Metrica | Valor | Linea base |
|---|---|---|
| PR-AUC | 0.1297 (± 0.0087) | tasa base 0.0500 |
| Brier | 0.0454 | Brier de tasa base 0.0475 |
| Log loss | 0.1771 | — |

El modelo supera los cuatro umbrales de aceptación internos. La discriminación es inferior a la del modelo con velocidad (`sc_extended`), que alcanza un PR-AUC de 0.189, pero esta variante es la única que puede operar sobre frames sin velocidad. No se han publicado comparaciones con otros modelos de propensión a centro en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo XGBoost con solo 15 características, la inferencia es extremadamente ligera (del orden de microsegundos por frame).
- VRAM: no requiere GPU; puede ejecutarse en cualquier máquina con Python y la librería silly-kicks instalada.
- GPU recomendada: ninguna; el modelo no se beneficia de aceleración por GPU.
- Opciones de despliegue: integración directa en pipelines de análisis con la librería silly-kicks; no requiere servidores de inferencia como vLLM u Ollama.
- Latencia: despreciable en lote; puede procesar miles de frames por segundo en un CPU moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables de propensión a centro en la información proporcionada. La propia librería ofrece dos variantes relacionadas:

| Variante | Corpus | Ubicacion | Uso recomendado |
|---|---|---|---|
| `position_only` (bundled) | corpus publico | incluida en la rueda de instalacion | frames sin velocidad sin acceso owner-tier |
| `sc_extended_position_only` (este modelo) | IDSSE + SkillCorner con 98 partidos owner-tier | repositorio HF | frames sin velocidad con acceso owner-tier |
| `sc_extended` (con velocidad) | IDSSE + SkillCorner owner-tier | repositorio HF (`silly-kicks/xcross-attempt-v1`) | frames con velocidad |

La comparativa con el modelo con velocidad muestra una pérdida de PR-AUC de 0.189 a 0.130 al eliminar las características de velocidad, lo que cuantifica el coste de operar sin datos de velocidad.

## Limitaciones y advertencias

- No es el modelo empaquetado por defecto: su distribución está restringida por la licencia de los datos owner-tier de SkillCorner; solo se publican los parámetros aprendidos, no los datos brutos.
- Rendimiento inferior al modelo con velocidad: la eliminación de características de velocidad reduce la discriminación (PR-AUC 0.130 vs 0.189).
- Confusión por club/estilo: el corpus de entrenamiento está fuertemente sesgado hacia un solo club, lo que puede introducir sesgos no cuantificados en la estimación.
- Las métricas reportadas son de validación cruzada, no de un test retenido del ajuste final; pueden no reflejar el rendimiento exacto del modelo publicado.
- No apto para frames con velocidad: si los datos incluyen velocidades, se debe usar el modelo `sc_extended` con velocidad.
- Requiere la versión de librería `silly-kicks >= 4.94.0` y el cumplimiento del contrato de características (fail-closed en la carga).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/silly-kicks/xcross-attempt-position-only-v1
- Modelo con velocidad (variante faithful): https://huggingface.co/silly-kicks/xcross-attempt-v1
- Repositorio GitHub de silly-kicks: https://github.com/karsten-s-nielsen/silly-kicks
- Paquete PyPI: https://pypi.org/project/silly-kicks/
- Paper de referencia: Cao et al. "Framing Causal Questions in Sports Analytics: A Case Study of Crossing in Soccer." arXiv:2505.11841 (2025).
