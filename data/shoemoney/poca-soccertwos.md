# shoemoney/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un checkpoint de política entrenada con el algoritmo MA-POCA (Multi-Agent POsthumous Credit Assignment) sobre el entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario shoemoney en Hugging Face y se distribuye como un artefacto de reinforcement learning multiagente con pesos exportados a ONNX, no como un modelo de lenguaje. El entrenamiento parte de inicialización aleatoria y se ejecuta con el entrenador oficial de ML-Agents sobre CPU gratuita de Google Colab, con un objetivo declarado de 200.000 pasos.

El interés del artefacto es fundamentalmente metodológico y reproducible: el autor incluye retornos por episodio, código de evaluación, configuración de entrenamiento, logs y checkpoints, además del hash SHA-256 del ONNX. El resultado declarado es un retorno medio de 0,0 +/- 0,0 sobre 128 episodios de agente evaluados con la misma política final en ambos equipos y acciones discretas deterministas, lo que indica que la política no supera el comportamiento de referencia en la métrica reportada.

No debe confundirse con un modelo generativo: no procesa lenguaje natural, no tiene ventana de contexto ni parámetros en el sentido habitual de un transformer. Su ámbito es la robótica simulada y el aprendizaje por refuerzo competitivo con auto-juego (self-play) en un campo de fútbol 2 contra 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para RL multiagente (Unity ML-Agents, algoritmo MA-POCA); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye un artefacto ONNX |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (hash SHA-256: 5b222de2772b28ea624d156fa9772ab76fa460c8d41d334ca6907e6ce072dccf) |
| Algoritmo | MA-POCA con self-play |
| Entorno | ML-Agents-SoccerTwos (Unity ML-Agents) |
| Pasos de entrenamiento | 200.000 (objetivo y último resumen de entrenamiento) |
| Episodios de evaluación | 128 |
| Tamaño del repositorio | 0,1 GB |
| Librería | ml-agents |

## Arquitectura y entrenamiento

El modelo se entrena con MA-POCA, un algoritmo de aprendizaje por refuerzo multiagente diseñado para asignar crédito a agentes individuales dentro de recompensas compartidas de equipo. El escenario es SoccerTwos de Unity ML-Agents, un entorno competitivo 2 contra 2 en el que dos equipos de agentes persiguen una pelota y tratan de marcar. El entrenamiento emplea auto-juego (self-play) desde inicialización aleatoria, con el entrenador oficial de ML-Agents ejecutado sobre CPU gratuita de Google Colab.

El checkpoint corresponde a un objetivo de 200.000 pasos, y el último resumen de entrenamiento registrado coincide con ese paso. La evaluación se realiza con la política final exportada a ONNX aplicada a ambos equipos, con acciones discretas deterministas, y agrega 128 episodios completados de agente. Cada episodio incluye recompensa individual y recompensa compartida de grupo. El autor publica además los retornos crudos por episodio, la media y desviación reales, el código de evaluación, la configuración de entrenamiento, los logs y los checkpoints, lo que permite auditar el resultado. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal ni fases de RLHF o DPO, que no aplican a este tipo de artefacto.

## Capacidades

- Control de políticas en un entorno de fútbol simulado 2 contra 2 (SoccerTwos) mediante observaciones del entorno y acciones discretas.
- Comportamiento multiagente derivado de MA-POCA, con asignación de crédito sobre recompensas individuales y compartidas.
- Auto-juego: la misma política puede desplegarse en ambos equipos, tal como se hizo en la evaluación.
- Exportación a ONNX para inferencia fuera del entrenador de ML-Agents.
- Reproducibilidad: incluye retornos por episodio, código de evaluación, configuración, logs y checkpoints.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode) ni de generación de texto.

## Casos de uso

- Reproducción de experimentos de RL multiagente: el paquete incluye configuración, logs y checkpoints, de modo que un investigador puede replicar el entrenamiento de 200.000 pasos y comparar curvas de retorno con las publicadas.
- Baseline para comparativas de algoritmos: sirve como referencia de MA-POCA con auto-juego en SoccerTwos frente a otros algoritmos de ML-Agents (PPO, self-play variantes) midiendo retorno medio por episodio de agente.
- Docencia en aprendizaje por refuerzo: el entorno SoccerTwos y la política ONNX permiten demostrar conceptos de recompensa compartida, crédito multiagente y evaluación determinista en un caso acotado.
- Pruebas de pipelines de exportación e inferencia ONNX: el artefacto permite validar flujos de exportación desde ML-Agents y de ejecución de inferencia con el hash SHA-256 como control de integridad.
- Investigación sobre evaluación honesta: el autor publica retornos crudos y una media de 0,0 +/- 0,0, lo que lo convierte en un ejemplo útil para discutir métricas de evaluación en RL y la diferencia entre pasos de entrenamiento y rendimiento real.
- Integración en entornos Unity para pruebas de sistema: la política puede cargarse en una build de Unity con ML-Agents para validar la comunicación entre el motor y el modelo ONNX antes de entrenar políticas propias.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Reinforcement Learning | ML-Agents-SoccerTwos | Retorno medio evaluado de agente en self-play (individual + grupo) | 0,0 +/- 0,0 | No |

Contexto de la medición: 128 episodios de agente completados, política final idéntica en ambos equipos, acciones discretas deterministas, tiempo de evaluación de 61,12 segundos. El retorno medio de 0,0 con desviación 0,0 indica que la política evaluada no obtiene recompensa acumulada en la métrica reportada.

## Requisitos de hardware

- El artefacto se distribuye como ONNX de 0,1 GB de repositorio, por lo que la inferencia cabe con holgura en CPU y en cualquier GPU consumer; no se dispone de cifras de VRAM específicas.
- El entrenamiento original se realizó sobre CPU gratuita de Google Colab, lo que confirma que el coste computacional del entrenamiento es bajo para el objetivo de 200.000 pasos.
- GPU recomendadas: no disponibles; al tratarse de una política pequeña para un entorno Unity, no requiere aceleración dedicada para inferencia.
- Despliegue: el runtime natural es Unity ML-Agents con el modelo ONNX; también puede ejecutarse con ONNX Runtime en Python para evaluación offline.
- Latencia y throughput: el autor reporta 61,12 segundos para 128 episodios de agente en la evaluación, lo que equivale aproximadamente a 0,48 segundos por episodio en el entorno usado; no se detalla el hardware de esa medición.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Retorno declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| poca-SoccerTwos (shoemoney) | Política RL multiagente | SoccerTwos | MA-POCA + self-play | 0,0 +/- 0,0 (128 episodios) | no disponible | Hugging Face |
| Políticas de referencia de Unity ML-Agents | Políticas RL | SoccerTwos y otros | PPO / self-play | no disponible | según ML-Agents | Repositorio oficial de Unity |
| Alternativas comparables en Hugging Face | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos de benchmarks de modelos comparables en la información proporcionada; la comparación con las políticas de referencia de Unity ML-Agents se limita a la categoría y al algoritmo, sin cifras verificables.

## Limitaciones y advertencias

- El retorno medio declarado es 0,0 +/- 0,0, lo que sugiere que la política no aprende un comportamiento útil en la métrica reportada; no debe usarse como política de producción.
- El resultado no está verificado de forma independiente (campo `verified: false` en la model card).
- El entrenamiento se detiene en 200.000 pasos, un objetivo bajo para auto-juego en SoccerTwos; es plausible que el rendimiento mejore con más pasos, pero no se aportan datos al respecto.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial ni la redistribución del artefacto.
- No hay información sobre sesgos, pero al tratarse de una política entrenada en un simulador, puede explotar comportamientos degenerados del entorno (por ejemplo, quedarse quieta) que no se reflejan en la métrica agregada.
- La evaluación usa la misma política en ambos equipos y acciones deterministas; no cubre robustness frente a oponentes distintos ni variaciones estocásticas.
- No aplica a tareas de lenguaje, visión, audio ni agentes conversacionales; su uso fuera de entornos ML-Agents requiere adaptación.
- El repositorio es pequeño (0,1 GB) y no incluye información sobre la topología de la red, lo que limita la reproducibilidad exacta de la arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoemoney/poca-SoccerTwos
- Documentación de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación del algoritmo MA-POCA: https://github.com/Unity-Technologies/ml-agents/blob/develop/docs/ML-Agents-Overview.md
- Entorno SoccerTwos: https://github.com/Unity-Technologies/ml-agents/tree/develop/Project/Assets/ML-Agents/Examples/Soccer
- Google Colab (entorno de entrenamiento citado por el autor): https://colab.research.google.com
