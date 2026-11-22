# hjw2385/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno Taxi-v4 de Gymnasium. Lo publica el usuario hjw2385 en Hugging Face y no constituye un modelo de lenguaje ni una red neuronal profunda: es una tabla Q serializada en un fichero `q-learning.pkl` que se carga junto con los metadatos del entorno para reproducir la política aprendida.

El problema que resuelve es el clásico entorno Taxi: un agente debe recoger y dejar pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones posibles, gestionando un estado discreto de 500 observaciones y seis acciones. Su relevancia es didáctica y de referencia: sirve como ejemplo mínimo y reproducible de un pipeline de RL con Q-Learning, útil para validar infraestructura de entrenamiento, comparar hiperparámetros o como baseline en cursos y tutoriales.

No hay información sobre arquitectura neuronal, tamaño de parámetros, contexto, idiomas ni licencia. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta, lo que confirma su carácter de artefacto de ejemplo más que de modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q discreta, sin red neuronal) |
| Parametros totales | no disponible (tabla Q sobre 500 estados x 6 acciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno episódico de Taxi-v4) |
| Tipos de cuantizacion | no disponible (no aplica a una tabla Q) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un método de diferencias temporales off-policy que actualiza una tabla Q indexada por pares estado-acción. En Taxi-v4 el espacio de observaciones es discreto (500 estados) y el de acciones es de 6 movimientos, por lo que la tabla Q es de tamaño reducido y no requiere aproximación funcional. La model card indica que se trata de una implementación personalizada ("custom-implementation") y que el artefacto se carga con `load_from_hub`, lo que sugiere el uso del ecosistema de Stable-Baselines3 o de un wrapper compatible con el Hub de Hugging Face.

No se especifican en la información disponible el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, la política de exploración (epsilon-greedy u otra) ni la composición del dataset, porque en RL tabular no hay dataset de entrenamiento en el sentido supervisado: el agente aprende interactuando con el simulador. Tampoco se documenta si se aplicó alguna variante como Double Q-Learning o SARSA.

## Capacidades

- Resolución del entorno Taxi-v4 de Gymnasium: recogida y entrega de pasajeros en una cuadrícula 5x5 con cuatro paradas.
- Política greedy derivada de la tabla Q aprendida, aplicable en inferencia determinista.
- Carga reproducible mediante `load_from_hub` con el identificador `hjw2385/q-Taxi-v4` y el fichero `q-learning.pkl`.
- Compatibilidad con el wrapper de Gymnasium indicado en la model card (`gym.make(model["env_id"])`), incluyendo la posibilidad de fijar `is_slippery=False` si el entorno lo permite.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de generación de texto: su salida es una acción discreta.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente sirve como ejemplo canónico de Q-Learning tabular para explicar diferencias temporales, exploración y convergencia en un entorno con espacio de estados finito y verificable.
- Baseline en experimentos de RL: permite comparar variantes (SARSA, Double Q-Learning, DQN) contra una política de referencia con recompensa media declarada de 7.54 ± 2.73.
- Validación de pipelines de entrenamiento: al ser un artefacto pequeño (repo de 0.0 GB) y de carga rápida, es útil para probar integraciones con el Hub, `load_from_hub` y entornos Gymnasium antes de escalar a modelos mayores.
- Pruebas de regresión en infraestructura de RL: se puede incluir en suites de CI para detectar roturas en la carga de políticas serializadas o en cambios de versión de Gymnasium.
- Demostraciones interactivas: integrar el agente en un notebook o visualizador de Taxi para mostrar la política aprendida paso a paso a una audiencia no técnica.
- Reproducción de resultados: al estar publicado con un `model-index` que declara métricas, permite replicar la evaluación con el mismo entorno y comprobar la recompensa media reportada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.54 +/- 2.73 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es una tabla Q en pickle que se carga en memoria RAM del proceso Python (típicamente unos pocos kilobytes).
- GPU: no requiere GPU; funciona en CPU en cualquier máquina capaz de ejecutar Python y Gymnasium.
- Consumer GPU: irrelevante; cabe en cualquier equipo, incluidos Raspberry Pi y entornos sin acelerador.
- Despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje. El despliegue se hace cargando el pickle con `load_from_hub` y ejecutando el bucle de interacción con Gymnasium.
- Latencia y throughput: no disponibles; al ser una consulta a tabla, la latencia por paso es del orden de microsegundos y el throughput está limitado por el simulador, no por el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| q-Taxi-v4 (hjw2385) | Q-Learning tabular | Taxi-v4 | Tabla Q (500x6) | no aplica | no disponible | Hugging Face |
| Agentes Q-Learning de referencia en Stable-Baselines3 | Q-Learning tabular | Taxi-v3/v4 | Tabla Q equivalente | no aplica | MIT (SB3) | Repositorio público |
| DQN sobre Taxi-v4 | Red neuronal profunda | Taxi-v4 | Órdenes de 10^4-10^5 | no aplica | depende de implementación | Múltiples repos |
| Otros agentes RL publicados en el Hub para entornos clásicos | Q-Learning / SARSA | CartPole, FrozenLake, etc. | Variable | no aplica | variable | Hugging Face |

La comparación es limitada porque no se dispone de métricas verificadas de alternativas en el mismo entorno dentro de la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no aplica en el sentido de sesgos sociales, pero la política está sobreajustada a la dinámica exacta de Taxi-v4; no generaliza a otros entornos ni a variantes con `is_slippery=True` sin reentrenamiento.
- Alucinación: no aplica; el agente no genera texto. El riesgo equivalente es una política que ejecute acciones subóptimas en estados poco visitados durante el entrenamiento.
- Contexto e idioma: sin soporte de lenguaje ni de contexto largo; no es un modelo de propósito general.
- Licencia: no disponible en la información proporcionada; conviene contactar con el autor antes de cualquier uso comercial.
- Reproducibilidad: la métrica declarada (7.54 ± 2.73) no está verificada (`verified: false`) y depende de la semilla, la versión de Gymnasium y la configuración del entorno.
- Producción: no es un modelo adecuado para despliegues reales; su valor es didáctico y como baseline. El formato pickle conlleva riesgos de seguridad si se carga de fuentes no confiables.

## Enlaces

- Hugging Face: https://huggingface.co/hjw2385/q-Taxi-v4
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Stable-Baselines3 (ecosistema habitual para `load_from_hub`): https://github.com/DLR-RM/stable-baselines3
- Documentación de `load_from_hub` en SB3: https://stable-baselines3.readthedocs.io/en/master/guide/save_format.html
