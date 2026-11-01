# JSI123/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo tabular publicado en HuggingFace por el usuario JSI123 bajo el identificador `JSI123/q-Taxi-v3`. No es un modelo de lenguaje: se trata de una implementacion propia de Q-Learning entrenada desde cero con Python, NumPy y Gymnasium sobre el entorno Taxi-v3 de Gymnasium, un problema clasico de planificacion con espacio de estados discreto de 500 estados y 6 acciones. El repositorio contiene unicamente la tabla Q entrenada y los artefactos de evaluacion, sin pesos neuronales ni ficheros de modelo en el sentido habitual.

El interes de esta ficha es acotado: sirve como referencia para quien quiera reproducir un agente Q-Learning de juguete, comparar curvas de aprendizaje en Taxi-v3 o reutilizar el codigo de entrenamiento como plantilla docente. El rendimiento declarado es de una recompensa media de 7,54 con desviacion tipica de 2,74 sobre 100 episodios de evaluacion, por encima del umbral de 4,0 fijado por el curso del que parece provenir.

No hay informacion sobre licencia, idiomas ni arquitectura neuronal, y el tamano del repositorio es practicamente nulo (0,0 GB), lo que confirma que no aloja pesos de gran tamano sino una tabla discreta y metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre espacio de estados discreto) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones, sin pesos neuronales) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entorno con horizonte de episodio de Taxi-v3) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles (no aplica) |
| Licencia | no disponible |
| Formato de pesos | tabla Q serializada en `q-learning.pkl` (pickle); resultados en `results.json`; grabacion en `replay.mp4`; codigo en `taxi_q_learning.py` |

## Arquitectura y entrenamiento

El agente implementa Q-Learning tabular clasico: una tabla Q indexada por los 500 estados discretos de Taxi-v3 y las 6 acciones disponibles (moverse norte, sur, este, oeste, recoger pasajero y dejar pasajero). La actualizacion sigue la regla de Bellman con tasa de aprendizaje y factor de descuento, exploracion epsilon-greedy y entrenamiento desde cero sobre el entorno de Gymnasium. No hay red neuronal, ni funcion de aproximacion, ni mecanismo de attention, ni decodificacion especulativa; la "arquitectura" es puramente una estructura de datos con forma `(500, 6)`.

El entrenamiento se realizo en Python con NumPy y Gymnasium, y el repositorio incluye el script `taxi_q_learning.py` con el codigo fuente, lo que permite reproducir el proceso completo. No se documentan en la informacion disponible el numero de episodios de entrenamiento, los hiperparametros concretos (alpha, gamma, epsilon y su decaimiento) ni la semilla utilizada. La evaluacion se realizo sobre 100 episodios, con recompensa media de 7,5400, desviacion tipica de 2,7401 y un valor de recompensa media menos desviacion tipica de 4,7999.

## Capacidades

- Resolucion del entorno Taxi-v3: el agente recoge al pasajero en una de cuatro ubicaciones y lo deja en el destino correcto dentro de una cuadricula de 5x5.
- Politica determinista derivada de la tabla Q: selecciona la accion de mayor valor para cada estado.
- Aprendizado por refuerzo tabular con exploracion epsilon-greedy durante el entrenamiento.
- Reproducibilidad del entrenamiento mediante el script `taxi_q_learning.py` incluido en el repositorio.
- Grabacion de una partida en `replay.mp4` para inspeccion cualitativa del comportamiento.
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas, vision, tool calling, capacidades de agente multi-paso fuera del entorno ni soporte multilingue.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio sirve como ejemplo minimo y reproducible de Q-Learning tabular, con codigo, tabla entrenada y grabacion para ilustrar la convergencia de la politica.
- Verificacion de pipelines de RL: permite comprobar que un entorno de Gymnasium, un bucle de entrenamiento y una evaluacion con 100 episodios producen resultados coherentes antes de escalar a entornos mayores.
- Baseline en experimentos con Taxi-v3: sirve como referencia de recompensa media (7,54) frente a variantes como SARSA, Double Q-Learning o Deep Q-Network sobre el mismo entorno.
- Analisis de robustez de politicas tabulares: la desviacion tipica de 2,74 permite estudiar la varianza de la recompensa y detectar estados con politica fragil.
- Material de comparacion entre entornos discretos: util para contrastar el tamano del espacio de estados (500) y de acciones (6) con entornos como FrozenLake o CliffWalking.
- Demostracion de serializacion de agentes: el uso de `q-learning.pkl` y `results.json` ilustra como empaquetar un agente y sus metricas para publicacion o integracion en un registro de modelos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`model-index`), no verificados:

| Benchmark | Metrica | Valor | Episodios | Verificado |
|---|---|---|---|---|
| Taxi-v3 Q-Learning | mean_reward | 7,54 +/- 2,74 | 100 | no |
| Taxi-v3 Q-Learning | mean_reward - std | 4,7999 | 100 | no |
| Taxi-v3 Q-Learning | Umbral del curso | 4,0 | no disponible | no |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no requiere GPU, la inferencia es una consulta a una tabla de 500 x 6 valores.
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Compatibilidad con GPU de consumo: no aplica, el agente se ejecuta en CPU sin requisitos relevantes.
- Opciones de despliegue: ejecucion directa con Python, NumPy y Gymnasium cargando `q-learning.pkl`; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no hay pesos neuronales.
- Latencia y throughput estimados: no disponibles; por la naturaleza tabular, la latencia por paso es del orden de microsegundos en CPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Algoritmo | Espacio de estados | Espacio de acciones | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JSI123/q-Taxi-v3 | Q-Learning tabular | 500 | 6 | 7,54 +/- 2,74 | no disponible | HuggingFace |
| Alternativas SARSA sobre Taxi-v3 | SARSA tabular | 500 | 6 | no disponible | no disponible | no disponible |
| Alternativas DQN sobre Taxi-v3 | Deep Q-Network | 500 | 6 | no disponible | no disponible | no disponible |

No se dispone de resultados publicados de modelos comparables en la informacion proporcionada; la comparativa anterior solo identifica categorias alternativas sin cifras verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no debe evaluarse con metricas tipo MMLU, HumanEval o GSM8K.
- La politica esta sobreajustada a Taxi-v3; no generaliza a otros entornos sin reentrenamiento.
- La recompensa media de 7,54 con desviacion tipica de 2,74 indica una politica con varianza considerable; el margen sobre el umbral de 4,0 es limitado (4,7999 tras restar la desviacion).
- Los resultados estan marcados como no verificados en la model card; proceden exclusivamente del autor.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni de redistribucion del codigo o de la tabla Q.
- Idiomas no disponibles: no aplica, pero la ausencia de metadatos de licencia e idioma complica su integracion en registros y auditorias.
- No se documentan hiperparametros ni semillas, lo que reduce la reproducibilidad exacta del resultado declarado.
- El fichero `q-learning.pkl` es un pickle: debe cargarse con precaucion por el riesgo habitual de ejecucion de codigo arbitrario en ficheros pickle de origen no verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JSI123/q-Taxi-v3
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Gymnasium: https://gymnasium.farama.org/
- NumPy: https://numpy.org/
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos distintos de los ficheros incluidos en el propio repositorio (`q-learning.pkl`, `results.json`, `replay.mp4`, `taxi_q_learning.py`).
