# JiaqiLeee/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo (Q-Learning tabular) entrenado para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario JiaqiLeee en Hugging Face bajo la etiqueta `custom-implementation`, lo que indica que no se ha generado con las utilidades estándar de la librería `stable-baselines3` ni con el flujo de `rl-zoo`, sino con una implementación propia del algoritmo. El artefacto resultante es una tabla Q serializada en formato pickle, no una red neuronal con pesos en safetensors.

El modelo resuelve un problema discreto y de pequeño tamaño: el entorno Taxi-v3 tiene 500 estados posibles y 6 acciones, y el objetivo es recoger a un pasajero en una de las cuatro paradas y dejarlo en su destino con el menor coste de recompensa posible. Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo mínimo de un agente Q-Learning entrenado y evaluado sobre un benchmark clásico de RL. No es un modelo de lenguaje ni un transformer, por lo que las comparativas con LLM no aplican.

El rendimiento declarado por el autor es de una recompensa media de 7,46 con una desviación típica de 2,81 sobre Taxi-v3, una métrica no verificada (`verified: false`) y con un resultado que, como se detalla en la sección de benchmarks, está muy por debajo del óptimo teórico del entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (implementacion propia, no neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |
| Entorno | Taxi-v3 (Gymnasium) |
| Espacio de estados | 500 estados discretos |
| Espacio de acciones | 6 acciones discretas |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

Se trata de un agente de Q-Learning tabular, el algoritmo de control off-policy mas basico del aprendizaje por refuerzo. Mantiene una tabla Q que asigna un valor a cada par (estado, accion) y la actualiza mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento. Al ser un entorno con espacio de estados finito y pequeno (500 estados), la tabla Q es perfectamente representable sin necesidad de aproximacion funcional, redes neuronales ni function approximators.

La model card no documenta hiperparametros de entrenamiento (tasa de aprendizaje, factor de descuento, politica epsilon-greedy, numero de episodios), ni la composicion del dataset de interacciones, ni si se aplico algun esquema de exploracion con decaimiento. Tampoco se especifica el numero de episodios de entrenamiento ni la semilla utilizada. La etiqueta `custom-implementation` sugiere que el autor escribio el bucle de entrenamiento a mano en lugar de usar `stable-baselines3`.

## Capacidades

- Resolucion del entorno Taxi-v3: el agente aprende una politica que recoge y deja pasajeros en las cuatro paradas del mapa.
- Toma de decisiones discreta en 500 estados con 6 acciones posibles.
- Inferencia determinista a partir de la tabla Q aprendida (politica greedy).
- No soporta tool calling, function calling ni agentes multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues ni procesa texto.
- No dispone de modo thinking, vision ni audio.
- No es un modelo generativo: no produce texto, codigo ni matematicas.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente sirve como ejemplo minimo y reproducible de Q-Learning tabular para explicar la ecuacion de Bellman, la exploracion epsilon-greedy y la convergencia de la tabla Q en un entorno de juguete.
- Baseline de comparacion: util como referencia de partida para comparar con variantes mas avanzadas (DQN, Double Q-Learning, SARSA) sobre el mismo entorno Taxi-v3.
- Test de infraestructura de RL: permite validar pipelines de evaluacion (`evaluate` de la libreria de RL de Hugging Face), carga de entornos Gymnasium y registro de metricas de recompensa media.
- Reproduccion de experimentos: al ser un artefacto pequeno (pickle en un repo de 0,0 GB), se puede cargar y evaluar rapidamente en cualquier maquina sin GPU.
- Demostracion de despliegue de agentes en Hugging Face Hub: ejemplifica el flujo `load_from_hub` con un agente entrenado y su model card con `model-index`.
- Analisis de robustez y varianza: la desviacion tipica de 2,81 en la recompensa permite estudiar la estabilidad de la politica aprendida frente a la estocasticidad del entorno (deslizamiento del taxi).

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,46 +/- 2,81 |

No se han publicado otros resultados de benchmarks en la informacion disponible. Cabe senalar que la recompensa media declarada (7,46) es notablemente inferior al optimo del entorno Taxi-v3 (en torno a 8-9 de recompensa media con una politica casi optima y sin penalizaciones excesivas), lo que sugiere una politica suboptima o un numero limitado de episodios de entrenamiento.

## Requisitos de hardware

- VRAM estimada: 0 GB. El agente es una tabla Q tabular serializada en un pickle de tamano despreciable; no requiere GPU.
- GPU recomendadas: ninguna. Se ejecuta en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluida una Raspberry Pi.
- Opciones de despliegue: carga directa con `load_from_hub` de la libreria de RL de Hugging Face y `gym.make(model["env_id"])`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una consulta a tabla, la latencia por paso es de orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-Taxi-v3 (JiaqiLeee) | Q-Learning tabular | Taxi-v3 | 7,46 +/- 2,81 (no verificado) | no disponible | Hugging Face |
| Agentes Q-Learning de referencia en RL Zoo | Q-Learning tabular | Taxi-v3 | no disponible | MIT (tipica de RL Zoo) | Hugging Face / stable-baselines3 |
| Agentes DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | no disponible | no disponible | Implementaciones de terceros |

No se dispone de datos de benchmarks comparables verificados en la informacion proporcionada para establecer una comparativa cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- El resultado de recompensa media (7,46) no esta verificado (`verified: false`) y es inferior al optimo del entorno, lo que indica una politica suboptima.
- La model card no documenta hiperparametros, numero de episodios ni semilla, lo que impide reproducir el entrenamiento con exactitud.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial ni la redistribucion del artefacto.
- El agente solo funciona en el entorno Taxi-v3; no generaliza a otros entornos ni tareas.
- La referencia del codigo de uso en la model card apunta a `BichengW/q-Taxi-v3` en lugar de `JiaqiLeee/q-Taxi-v3`, lo que puede provocar errores de carga si se copia literalmente.
- No es un modelo de lenguaje: no debe evaluarse con metricas de NLP ni compararse con LLM.
- Riesgo de alucinacion: no aplica; el agente no genera texto.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/JiaqiLeee/q-Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Libreria de RL de Hugging Face: https://github.com/huggingface/stable-baselines3
- Documentacion de Q-Learning en stable-baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/qlearning.html
