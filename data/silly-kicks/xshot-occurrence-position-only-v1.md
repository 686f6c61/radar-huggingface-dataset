# silly-kicks/xshot-occurrence-position-only-v1

## Resumen

`xshot-occurrence-position-only-v1` es un modelo de clasificación tabular desarrollado por el autor `silly-kicks` dentro del ecosistema de la librería homónima, un sucesor independiente de `socceraction` para análisis de fútbol con datos de tracking y eventos. Este modelo concreto estima la probabilidad de que el equipo en posesión intente un disparo en un intervalo de aproximadamente 1 segundo a partir de un frame de tracking, utilizando únicamente características posicionales (26 features) y descartando por completo las derivadas de velocidad. Está pensado para puntuar snapshots que carecen de velocidad por jugador, como los freeze-frames de StatsBomb-360.

La variante publicada en este repositorio de Hugging Face corresponde al nivel `sc_extended_position_only`, entrenada sobre un corpus restringido de 115 partidos (7 de IDSSE y 108 de SkillCorner, de los cuales 98 son owner-tier). No se distribuye dentro del paquete de la librería por restricciones de licencia de los datos de entrenamiento; solo se publican los parámetros aprendidos. El modelo se basa en XGBoost, es ligero, corre en CPU y está pensado para integrarse en pipelines de análisis táctico donde los datos de velocidad no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting, booster pickle-free) |
| Parametros totales | no disponible (modelo de boosting, no se reporta numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadata y documentacion en ingles; el modelo opera sobre datos numericos) |
| Licencia | MIT |
| Formato de pesos | model.json (XGBoost booster), metadata.json, metrics.json, SHA256SUMS |

## Arquitectura y entrenamiento

El modelo es un clasificador XGBoost que consume 26 características posicionales, todas ellas expresadas en coordenadas relativas a la portería mediante un helper geométrico compartido. Las 5 características derivadas de velocidad se eliminan por completo (no se rellenan con NaN), de modo que el modelo puede puntuar frames que no contienen ninguna información de velocidad por jugador. El dominio de aplicación se restringe a balón en juego y a la zona del tercio atacante.

El entrenamiento se realizó sobre un corpus de 964.263 filas, de las cuales 182.517 son positivas (tasa positiva del 18,9%), procedente de 115 partidos de dos proveedores (IDSSE y SkillCorner). No se aplicaron técnicas de RLHF ni DPO, al tratarse de un modelo supervisado clásico. La innovación principal es la variante position-only, que permite operar sobre datos sin velocidad a costa de una pérdida de discriminación frente al modelo faithful con velocidad (PR-AUC 0,585 → 0,528). La carga del modelo es fail-closed: verifica SHA256SUMS, un fingerprint de quiralidad y un guard de `base_score` para la serialización de xgboost 3.x.

## Capacidades

- Clasificación binaria de propensión de disparo: devuelve la probabilidad de que el equipo en posesión intente un disparo en ~1 segundo desde el frame de tracking.
- Entrada tabular de 26 features posicionales, sin necesidad de datos de velocidad.
- Compatible con freeze-frames de StatsBomb-360 y otros snapshots sin velocidad por jugador.
- Integración con la librería `silly-kicks` mediante `from_variant("sc_extended_position_only")`, que descarga el modelo desde Hugging Face.
- Guardas de integridad en tiempo de carga: verificación de checksum, fingerprint de quiralidad y contrato de features.
- No es generativo: no produce texto, código ni razonamiento; no soporta tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Análisis de ocasiones de gol en datos de tracking sin velocidad: el modelo puntúa cada frame del tercio atacante y permite identificar momentos de alta propensión de disparo, útil para resúmenes automáticos de partidos.
- Evaluación de rendimiento de equipos: agregando las probabilidades por partido o por jugador, se puede cuantificar la generación de ocasiones de un equipo sin depender de datos de velocidad, que a menudo no están disponibles en ligas menores o datasets públicos.
- Scouting de jugadores: las puntuaciones por frame pueden asociarse a acciones individuales para valorar la contribución ofensiva de un jugador en contextos de presión o recepción en el área.
- Análisis táctico de transiciones: al filtrar por tercio atacante y balón en juego, el modelo ayuda a estudiar cómo los equipos generan disparos tras recuperaciones o en jugadas a balón parado.
- Integración en pipelines de datos de StatsBomb-360: los freeze-frames de esta fuente carecen de velocidad, por lo que este modelo es la opción adecuada frente al modelo faithful que requiere velocidad.
- Validación de modelos de valoración de acciones (VAEP/xT): las probabilidades de disparo pueden combinarse con métricas de valor esperado para calibrar modelos de impacto de acciones en la librería `silly-kicks`.

## Benchmarks y rendimiento

Validación cruzada de 5 pliegues (out-of-fold) reportada en la model card:

| Metrica | Valor | Baseline |
|---|---|---|
| PR-AUC | 0,5276 (± 0,0345) | tasa base 0,1893 |
| Brier | 0,1213 | Brier de tasa base 0,1534 |
| Log loss | 0,3919 | no disponible |

Los cuatro criterios de aceptación del proyecto se superan. Las estimaciones son de validación cruzada, no de un test held-out del ajuste final. Comparado con el modelo faithful con velocidad (`sc_extended`), la pérdida de PR-AUC es de 0,585 a 0,528, un coste esperado por eliminar las características de velocidad.

## Requisitos de hardware

- Modelo XGBoost de tamaño reducido: no requiere GPU, inferencia en CPU con latencia de milisegundos por frame.
- VRAM: no aplica (no es un modelo de red neuronal; no se reporta uso de memoria gráfica).
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Despliegue: requiere `pip install silly-kicks[xshot]` y versión de la librería `silly-kicks >= 4.94.0` (la que introduce la clave de variante). El modelo se descarga desde Hugging Face mediante `from_variant`.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Throughput: no se reportan cifras oficiales, pero al ser un booster XGBoost con 26 features, puede procesar miles de frames por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Corpus | Velocidad | PR-AUC | Distribucion | Uso recomendado |
|---|---|---|---|---|---|
| `sc_extended_position_only` (este) | 115 partidos (7 IDSSE + 108 SkillCorner, 98 owner-tier) | No | 0,528 | Solo Hugging Face | Frames sin velocidad con acceso owner-tier |
| `position_only` (bundled) | corpus publico | No | no disponible | Incluido en la rueda de `silly-kicks` | Frames sin velocidad sin acceso owner-tier |
| `sc_extended` (faithful, `xshot-occurrence-v1`) | mismo corpus owner-tier | Si | 0,585 | Hugging Face | Frames con velocidad |

La comparativa se limita a las variantes del mismo modelo dentro de la librería `silly-kicks`; no se dispone de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es el modelo bundled: su corpus de entrenamiento está restringido por licencia y no puede redistribuirse en la rueda de la librería; solo se publican los parámetros.
- Más débil que el modelo faithful `sc_extended` por construcción, al eliminar las características de velocidad; debe usarse únicamente cuando los frames carecen de velocidad.
- No existe medición de goalkeeper (GK) para el brazo xS; la sonda TF-19 xS está bloqueada, por lo que la validación de porteros no está disponible.
- Entrenado en 115 partidos con fuerte sesgo hacia un solo club; el confounding por club/estilo es real y no está cuantificado.
- Las métricas reportadas son de validación cruzada, no de un test held-out del ajuste final; el rendimiento en producción puede variar.
- El contrato de features position-only lanza un error si se proporciona una columna de velocidad con valores no finitos (NaN-filled); el modelo espera que esas columnas estén ausentes, no imputadas.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento subyacentes (SkillCorner owner-tier) tienen restricciones que impiden su redistribución; el usuario debe verificar sus propios acuerdos con el proveedor de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/silly-kicks/xshot-occurrence-position-only-v1
- Modelo faithful (con velocidad): https://huggingface.co/silly-kicks/xshot-occurrence-v1
- Organización en Hugging Face: https://huggingface.co/silly-kicks
- Repositorio GitHub: https://github.com/karsten-s-nielsen/silly-kicks
- Paquete en PyPI: https://pypi.org/project/silly-kicks/
- Referencia academica: arXiv:2512.00203 (atribucion segun NOTICE)
