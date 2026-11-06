# amilliontries/race-pit-wall-ep16

## Resumen

`race-pit-wall-ep16` es un agente de política (policy) de refuerzo, no un modelo de lenguaje, publicado por el canal de YouTube A Million Tries como parte de su serie sobre estrategia de carrera en simulación de automovilismo. El modelo resuelve un problema muy acotado: decidir, una vez por vuelta y 600 metros antes de la entrada a boxes, si el coche debe parar o no y qué compuesto de neumático montar. Se trata de una red neuronal minúscula (1.352 parámetros) entrenada con estrategias de evolución (evolution strategies, ES) sobre un simulador propio, y se distribuye en formato safetensors para JAX.

La relevancia es divulgativa y de investigación aplicada a la toma de decisiones secuenciales en entornos con reglas duras (banderas, coche de seguridad, descalificaciones). El episodio 16 amplía el agente del episodio 15 con 8 entradas adicionales que describen el estado de control de carrera (VSC, Safety Car, bandera roja, cola del Safety Car, entrada a boxes cerrada, etc.), pasando de 25 a 33 números de observación. La generación 91 de una ejecución de 10 horas es la que se publica.

No es un modelo de propósito general: no genera texto, no razona en lenguaje natural y no tiene capacidades multilingües. Su interés está en el diseño del espacio de observación, la función de recompensa y la comparación contra una regla heurística de equipo, documentada en la model card con métricas de 256 carreras sobre 64 circuitos de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward 33 → 32 (tanh) → 4, con camino lineal directo (`lin`) |
| Parámetros totales | 1.352 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada fija de 33 números) |
| Tipos de cuantización | No disponible (pesos en safetensors, probablemente float32) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (JAX) |

## Arquitectura y entrenamiento

El agente es una política pequeña con dos caminos: una capa oculta de 32 unidades con activación tanh que procesa las 33 observaciones, y un camino lineal directo (`lin`) que se suma a la salida. La salida tiene 4 dimensiones que codifican la decisión de parar o no y el compuesto de neumático. Las 33 entradas combinan las 25 del episodio 15 (vueltas restantes, estado de neumáticos, combustible, paradas, daños, posición, huecos y neumáticos de los coches cercanos, longitud del circuito, decisión de parrilla) con 8 nuevas de control de carrera: VSC, Safety Car, bandera roja, vueltas desde su inicio, si ya ha usado dos compuestos, su posición en la cola del Safety Car, metros hasta la entrada a boxes y si la entrada está cerrada.

El entrenamiento usa estrategias de evolución con pares espejados (mirrored-pair evolution strategies) sobre posiciones de llegada, no gradientes de política. La generación 91 corresponde a una ejecución de 10 horas. El escenario de evaluación es exigente: 256 carreras en 64 circuitos de test, con control de carrera activo y dos averías por carrera (8 coches, media de 4,5). El agente compite contra una regla de equipo explícita ("parar cuando el peor neumático supere el 60 %, montar duros"). La model card indica que el agente aprendió a evitar descalificaciones (regla de dos compuestos secos por carrera), pero no aprendió a parar bajo Safety Car, porque en este simulador la parada bajo SC apenas compensa al congestionarse el pit lane.

## Capacidades

- Toma de decisión discreta por vuelta: parar o quedarse en pista, y elección de compuesto.
- Procesamiento de estado de control de carrera: VSC, Safety Car, bandera roja y cierre de entrada a boxes.
- Gestión de reglas duras: seguimiento del uso de dos compuestos secos para evitar descalificación.
- Razonamiento sobre tráfico: usa huecos y neumáticos de los coches cercanos y su posición en la cola del Safety Car.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- No tiene capacidades multilingües, de visión, audio ni modo thinking.
- Integración con JAX: los pesos se cargan como parámetros JAX para inferencia en el simulador.

## Casos de uso

- Investigación en estrategia de carrera simulada: usar el agente como baseline de política aprendida frente a reglas heurísticas de equipo en un simulador propio, comparando posiciones medias de llegada y número de paradas.
- Estudio de espacios de observación: el salto de 25 a 33 entradas entre episodios 15 y 16 sirve como caso práctico para analizar cómo añadir variables de control de carrera afecta al aprendizaje con ES.
- Evaluación de robustez ante reglas duras: el agente aprendió a evitar descalificaciones por la regla de dos compuestos; útil para estudiar cómo una recompensa basada en posición final penaliza infracciones.
- Docencia y divulgación: ejemplo mínimo (1.352 parámetros) de política de refuerzo entrenada con evolution strategies, adecuado para explicar el ciclo observación-decisión-recompensa sin la complejidad de un LLM.
- Reproducción de experimentos: el código está en el tag `episode-16` del repositorio de GitHub, con scripts `agents/es_strategist.py --race-control` y `scripts/strat_compare.py`, lo que permite replicar las 256 carreras de evaluación.
- Análisis de decisiones bajo Safety Car: dado que el agente no aprendió a parar bajo SC, sirve como caso de estudio de por qué una política óptima en un simulador concreto puede divergir de la intuición humana (el pit lane se congestiona).
- Comparación de metodologías de entrenamiento: ES con pares espejados frente a PPO (etiqueta presente en el repo) para problemas de decisión con recompensa escasa y episodios largos.

## Benchmarks y rendimiento

Resultados publicados en la model card (256 carreras, 64 circuitos de test, control de carrera activo, 2 averías por carrera):

| Pit wall | Posición media | Regla del equipo | Paradas por coche (suyas / regla) | Descalificaciones por carrera | Paradas bajo SC/VSC |
|---|---|---|---|---|---|
| Episodio 15, en control de carrera (generación 0) | P5,94 ± 0,04 | P3,06 | 0,79 / 1,39 | 2,01 | 0,09 de 3,00 |
| **Este modelo (generación 91)** | **P4,41 ± 0,06** | P4,59 | 1,12 / 1,37 | 0,03 | 0,05 de 2,86 |

La model card advierte de un hándicap de asiento: coches con regla idéntica en asientos 1-4 terminan P4,57 frente a P4,43, por lo que los coches 1-4 salen ~0,14 posiciones por detrás; la ganancia real de este pit wall sobre la regla es de aproximadamente 0,3 posiciones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; 1.352 parámetros en float32 ocupan ~5 KB, más el overhead del runtime JAX.
- GPU recomendadas: cualquier GPU compatible con JAX (incluidas integradas); no requiere acelerador dedicado.
- Cabe en cualquier GPU de consumo y en CPU; el cuello de botella es el simulador, no el agente.
- Opciones de despliegue: JAX (librería declarada), carga directa de safetensors; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; al ser una red de 33→32→4, la inferencia por decisión es del orden de microsegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `race-pit-wall-ep16` | 1.352 | 33 números | ES con pares espejados, control de carrera | MIT | Hugging Face + GitHub (tag `episode-16`) |
| `race-pit-wall-ep15` | No disponible en la información | 25 números | ES, sin control de carrera | MIT | Hugging Face |
| `race-control-driver-ep16` | No disponible en la información | No disponible | Conductor del simulador (referenciado en la model card) | No disponible | Referenciado, no verificado |
| Regla heurística del equipo | 0 (regla) | Estado de neumáticos | "Parar cuando el peor neumático supere el 60 %, montar duros" | No aplica | Documentada en la model card |

No se dispone de comparación con modelos de estrategia de carrera de otras fuentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no tiene capacidades de razonamiento general.
- El agente no aprendió a parar bajo Safety Car (solo el 5 % de las oportunidades); su comportamiento en esa situación puede ser subóptimo frente a la intuición humana.
- La métrica de posición media incluye un hándicap de asiento de ~0,14 posiciones; la ventaja real sobre la regla es de ~0,3 posiciones, no la diferencia bruta de la tabla.
- El rendimiento está medido en un simulador propio con supuestos concretos (congestión del pit lane, dos averías por carrera); no es extrapolable a otros simuladores o a la F1 real.
- Riesgo de sobreajuste a los 64 circuitos de test y a la dinámica del simulador; no hay datos de generalización a circuitos no vistos.
- Sesgos conocidos: no disponibles; al ser un agente entrenado por recompensa, puede heredar sesgos del diseño del simulador y de la función de recompensa.
- Licencia MIT: permite uso comercial y modificación, pero el código del simulador y los datos de entrenamiento no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de los resultados.
- Fecha de creación indicada como 2026-11-06, posterior a la fecha habitual de consulta; verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amilliontries/race-pit-wall-ep16
- Perfil del autor en Hugging Face: https://huggingface.co/amilliontries
- Modelo del episodio 15: https://huggingface.co/amilliontries/race-pit-wall-ep15
- Código (tag `episode-16`): https://github.com/backstab319/a-million-tries/tree/episode-16
- Canal de YouTube: https://www.youtube.com/@amilliontries
