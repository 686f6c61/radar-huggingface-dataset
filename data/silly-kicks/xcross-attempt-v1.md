# silly-kicks/xcross-attempt-v1

## Resumen

`xcross-attempt-v1` es un clasificador tabular basado en XGBoost determinista que estima la probabilidad de que el equipo en posesión intente un centro (cross) en el fútbol, condicionado al estado de tracking en un instante dado. Desarrollado por el proyecto silly-kicks, este modelo reformula el tratamiento a nivel de evento del trabajo de Cao et al. (arXiv:2505.11841) en un marco anclado al estado, incorporando 16 características con velocidad y coordenadas relativas a la portería. Su contribución principal es un bloque aislable de posición del portero, que cubre una laguna señalada en la literatura y que motiva su existencia dentro de la línea de investigación GKDV (TF-17 → TF-19).

La variante publicada en este repositorio, `sc_extended`, se entrena sobre un corpus restringido de nivel propietario (owner-tier) que incluye 98 partidos de SkillCorner adicionales, por lo que solo se distribuyen los parámetros aprendidos, no los datos brutos. Esto responde a una restricción de licencia, no a una limitación de calidad. El modelo está pensado para análisis deportivo, inferencia causal y evaluación de decisiones tácticas, y se integra mediante la librería `silly-kicks` (versión >= 4.74.0).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (clasificador determinista) |
| Parametros totales | no disponible (no se especifican número de árboles ni profundidad) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto secuencial) |
| Tipos de cuantizacion | no aplica (modelo de boosting, no red neuronal) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se indica el formato de serialización; probablemente JSON o binario de XGBoost) |

## Arquitectura y entrenamiento

El modelo es un clasificador XGBoost determinista con 16 características "fieles" (con velocidad) y coordenadas relativas a la portería, calculadas mediante el helper compartido `_geometry`. Aplica un filtro de dominio que restringe las predicciones a balón vivo y área amplia. Lleva 7 de los 8 factores de confusión del paper de Cao et al. (la posición del cruzador, #7, se omite por no tener un proxy fiel solo con tracking) y añade un bloque novedoso y aislable de posición del portero, que es la brecha principal que aborda.

El entrenamiento se realiza sobre el corpus propietario IDSSE + SkillCorner (incluyendo 98 partidos owner-tier), con una tasa base de positivos del 5.0%. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, al tratarse de un modelo supervisado clásico. La variante `sc_extended` se distingue de la variante pública `default` (entrenada con 17 partidos redistribuibles) y de la variante `sc_extended_position_only` (sin características de velocidad, 15 características, para frames sin velocidad como StatsBomb-360).

## Capacidades

- Clasificación tabular binaria: estima P(se intenta un centro en ~1 s) a partir de un frame de tracking.
- Inferencia causal: incorpora factores de confusión conocidos (7 de 8 del paper de referencia) y un bloque específico de posición del portero, lo que permite análisis de intervención.
- Soporte de variantes: `default` (pública, empaquetada), `sc_extended` (owner-tier, este repositorio) y `sc_extended_position_only` (sin velocidad, para freeze frames).
- Integración con la librería `silly-kicks` para conversión de tracking a SPADL, valoración VAEP/xT y características espaciales.
- Guardas de integridad: verificación SHA256SUMS y huella de quiralidad (ADR-040) que detectan pesos corruptos o incompatibles.
- Compatibilidad con la corrección de transformación goal-relative-2 (ADR-051), que elimina un defecto de espejo en la geometría.

## Casos de uso

- Análisis táctico de equipos: un analista puede usar el modelo para identificar en qué zonas del campo y con qué disposición de jugadores es más probable que un equipo intente un centro, ayudando a diseñar planes de partido.
- Evaluación de decisiones de portero: el bloque de posición del portero permite estudiar cómo la ubicación del guardameta influye en la propensión al centro, útil para entrenadores de porteros.
- Scouting de jugadores: al condicionar sobre el estado de tracking, se puede aislar la contribución individual de un cruzador o un defensor en la generación de centros.
- Investigación académica en causalidad deportiva: el modelo sirve como componente en pipelines de inferencia causal para estimar efectos de tratamiento (p. ej., el impacto de un centro en la probabilidad de gol).
- Integración en pipelines de análisis de datos en tiempo real: al ser XGBoost, es ligero y puede ejecutarse en CPU para procesar streams de tracking durante un partido.
- Validación de modelos de valoración de acciones (VAEP/xT): las probabilidades de centro pueden usarse como entrada para mejorar la valoración de pases y centros en el marco SPADL.

## Benchmarks y rendimiento

Se reportan métricas de validación cruzada (5 folds, out-of-fold) para la variante `sc_extended`:

| Metrica | Valor | Baseline |
|---|---|---|
| PR-AUC | 0.1888 (± 0.0108) | base rate 0.0500 |
| Brier | 0.0436 | base-rate Brier 0.0475 |
| Log loss | 0.1658 | — |

Las cuatro puertas de aceptación (suficientes folds utilizables, PR-AUC > base rate, Brier < base-rate Brier, log loss < uniforme) se superan. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo XGBoost con 16 características, la inferencia es extremadamente ligera y se ejecuta en CPU sin necesidad de GPU.
- VRAM estimada: no aplica (no requiere GPU).
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Compatible con despliegue en entornos embebidos o servidores de análisis sin aceleración.
- Opciones de despliegue: integración directa mediante la librería `silly-kicks` (pip install silly-kicks[xcross]); no se mencionan servidores de inferencia como vLLM u Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles, pero se espera que sea del orden de microsegundos por frame dado el tamaño del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de propensión a centro en fútbol). La variante `default` (pública) es la alternativa más cercana, pero no se publican sus métricas de rendimiento en la información proporcionada. Se puede considerar que el modelo es específico de dominio y no tiene equivalentes directos en el ecosistema de modelos de lenguaje.

## Limitaciones y advertencias

- No es el modelo empaquetado en la rueda de PyPI: la variante `sc_extended` se distribuye solo en Hugging Face por restricciones de licencia sobre datos owner-tier de SkillCorner; no puede redistribuirse dentro del paquete.
- Requiere la librería `silly-kicks` >= 4.74.0 (y >= 4.94.0 para la variante `sc_extended_position_only`); versiones anteriores rechazan los pesos con un `IntegrityError` debido a la corrección de quiralidad.
- El modelo está entrenado exclusivamente con datos de fútbol de alta competición (SkillCorner e IDSSE); su generalización a otras ligas, formatos o niveles de juego no está garantizada.
- La omisión del confounder de posición del cruzador (#7) puede introducir sesgo residual en contextos donde esa variable sea relevante.
- La tasa base de positivos es baja (5.0%), lo que implica que el modelo puede tener una precisión limitada en escenarios de desequilibrio de clases; se recomienda usar PR-AUC en lugar de accuracy.
- No se proporcionan datos sobre sesgos demográficos o geográficos; al ser un modelo de tracking, no aplican sesgos de lenguaje, pero sí posibles sesgos por la composición del corpus (mayoritariamente ligas europeas).
- Para uso en producción, se debe verificar el veredicto `tf19_ready` en `metrics.json` antes de construir sobre él, según el protocolo ADR-037.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/silly-kicks/xcross-attempt-v1
- Organización silly-kicks en Hugging Face: https://huggingface.co/silly-kicks
- Paquete PyPI: https://pypi.org/project/silly-kicks/
- Repositorio GitHub (karsten-s-nielsen/silly-kicks): https://github.com/karsten-s-nielsen/silly-kicks
- Paper de referencia (Cao et al., arXiv:2505.11841): https://arxiv.org/abs/2505.11841
