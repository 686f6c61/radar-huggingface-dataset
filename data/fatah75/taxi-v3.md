# fatah75/Taxi-v3

## Resumen

`fatah75/Taxi-v3` es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno `Taxi-v3` de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: el artefacto publicado es una tabla Q serializada en formato pickle (`q-learning.pkl`) que se carga mediante `load_from_hub` y se evalúa contra el entorno original. El autor es el usuario de Hugging Face `fatah75` y el repositorio no ocupa espacio apreciable (0.0 GB reportados), lo que es coherente con una tabla de estados-acciones de pequeñas dimensiones.

La relevancia de este tipo de publicaciones es fundamentalmente didáctica y de referencia: sirve como ejemplo mínimo reproducible de un pipeline de RL clásico (entorno discreto, política greedy sobre tabla Q, métrica de recompensa media) dentro del ecosistema de Hugging Face, que habitualmente aloja modelos neuronales. El entorno `Taxi-v3` tiene un espacio de observaciones discreto de 500 estados y 6 acciones, por lo que la política aprendida es interpretable y el coste computacional de inferencia es despreciable.

No hay información sobre arquitectura neuronal, tamaño de parámetros, contexto, idiomas ni licencia. Cualquier uso en producción fuera del propio entorno de simulación no está soportado por los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores estado-acción), sin red neuronal |
| Parametros totales | no disponible (tabla Q de dimensiones no especificadas; el entorno Taxi-v3 tiene 500 estados y 6 acciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Markoviano discreto, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning tabular, un método de diferencias temporales off-policy que actualiza una tabla `Q(s, a)` mediante la regla de Bellman con tasa de aprendizaje y factor de descuento (los valores concretos de estos hiperparámetros no se detallan en la información disponible). La política resultante es presumiblemente epsilon-greedy durante el entrenamiento y greedy en evaluación, dado el esquema estándar de la librería que genera este tipo de repositorios.

No se especifican el número de episodios de entrenamiento, la política de exploración final, la semilla ni la composición del dataset (en RL, la distribución de episodios muestreados). Tampoco hay información sobre técnicas avanzadas como Double Q-Learning, SARSA o aproximación de funciones. El entorno `Taxi-v3` es determinista por defecto salvo que se configure `is_slippery=True`, extremo que la model card advierte verificar al cargar el entorno.

## Capacidades

- Resolución del entorno `Taxi-v3`: recoger y dejar pasajeros en las cuatro ubicaciones del mapa con la política aprendida.
- Toma de decisiones discreta sobre 6 acciones (movimiento en cuatro direcciones, recogida y dejada).
- Inferencia por consulta directa a tabla Q, sin coste de cómputo significativo.
- Carga mediante `load_from_hub` con el identificador `fatah75/Taxi-v3` y fichero `q-learning.pkl`.
- No soporta tool calling, function calling, agentes multi-paso fuera del bucle del entorno, ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Docencia de RL clásico: usar el agente como referencia funcional de Q-Learning tabular en un curso introductorio, comparando la política aprendida con la óptima teórica del entorno.
- Baseline en experimentos de RL: servir como punto de partida (mean_reward 7.40) frente a variantes como SARSA, Double Q-Learning o DQN sobre el mismo entorno.
- Test de integración de pipelines de Hugging Face: validar flujos de `load_from_hub`, carga de pickles y ejecución de episodios en `gym.make("Taxi-v3")`.
- Reproducción de resultados: verificar la métrica declarada ejecutando episodios de evaluación con la misma configuración de entorno (atención a `is_slippery`).
- Comparación de entornos discretos: emplear el agente como ejemplo de referencia al migrar de `Taxi-v3` a otros entornos tabulares (FrozenLake, CliffWalking).
- Material de auditoría de model cards: analizar qué información mínima falta (licencia, hiperparámetros, semilla) en publicaciones de RL de bajo perfil.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.40 +/- 2.85 | No |

No se han publicado otros resultados de benchmarks en la información disponible. La recompensa media de 7.40 con desviación de 2.85 indica una política funcional pero con varianza apreciable; el óptimo teórico del entorno (sin slip) se sitúa en torno a 8 puntos por episodio, por lo que el agente queda ligeramente por debajo.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es una consulta a tabla en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier CPU consumer; el cuello de botella es el bucle del entorno de Gymnasium, no el agente.
- Opciones de despliegue: script Python con `gym`/`gymnasium` y `huggingface_hub`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: dominados por el paso del entorno (microsegundos por acción); no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Enfoque | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fatah75/Taxi-v3 | Q-Learning tabular | Taxi-v3 | 7.40 +/- 2.85 | no disponible | Hugging Face |
| Agentes DQN sobre Taxi-v3 | Red neuronal profunda | Taxi-v3 | no disponible | variable | Repositorios de RL |
| SARSA tabular sobre Taxi-v3 | On-policy TD | Taxi-v3 | no disponible | variable | Repositorios de RL |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Específico del entorno `Taxi-v3`: la política no es transferible a otros entornos ni a tareas del mundo real.
- La recompensa media (7.40) queda por debajo del óptimo teórico del entorno, con desviación de 2.85, lo que sugiere episodios fallidos ocasionales.
- Dependencia de la configuración del entorno: si se carga con `is_slippery=True` y el agente fue entrenado sin deslizamiento (o viceversa), el rendimiento puede degradarse sin aviso.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- El formato pickle plantea riesgos de seguridad al deserializar ficheros de origen no verificado; conviene auditar el contenido antes de cargarlo.
- No hay información sobre semilla, hiperparámetros ni número de episodios, lo que dificulta la reproducibilidad estricta.
- No apto para producción fuera del contexto de simulación; no es un modelo de lenguaje ni soporta tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fatah75/Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `load_from_hub`: https://huggingface.co/docs/huggingface_hub
- Repositorio de referencia de RL en Hugging Face: https://github.com/huggingface/deep-rl-class
