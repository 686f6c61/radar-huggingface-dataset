# esncf/taxiRL

## Resumen

taxiRL es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular sobre el entorno Taxi-v3 de Gymnasium. Lo publica el usuario esncf en Hugging Face y no se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada en formato pickle que se carga con utilidades del ecosistema de Hugging Face (stable-baselines3 / huggingface_sb3) y se ejecuta contra el entorno original. El repositorio ocupa 0.0 GB y registra 0 descargas y 0 likes en el momento de la consulta, lo que indica un artefacto de experimentación personal más que una release mantenida.

El problema que resuelve es el clásico problema del taxi: un agente debe recoger a un pasajero en una de cuatro localizaciones y dejarlo en otra, navegando una rejilla de 5x5 con paredes, con 500 estados discretos (25 posiciones del taxi x 5 posiciones del pasajero x 4 destinos) y 6 acciones. Es un entorno de referencia habitual para validar implementaciones de Q-Learning, SARSA o Deep Q-Learning antes de pasar a problemas con espacios de estados continuos.

Su relevancia es, por tanto, didáctica y de verificación: sirve como línea base reproducible para comparar variantes de Q-Learning (con y sin decaimiento de epsilon, con distintos valores de alpha y gamma) y como ejemplo mínimo de publicación de agentes RL en el Hub. No compite con modelos generativos ni sustituye a ninguna herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre espacio de estados discreto) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones; el autor no declara el numero de entradas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno Taxi-v3 con 500 estados discretos) |
| Tipos de cuantizacion | no disponible (no aplica a una tabla Q en pickle) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible (el Hub no declara licencia) |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular, un método de diferencias temporales off-policy. El agente mantiene una tabla Q indexada por estado y accion, y actualiza cada entrada con la regla Q(s,a) <- Q(s,a) + alpha * [r + gamma * max_a' Q(s',a') - Q(s,a)]. El entorno Taxi-v3 tiene 500 estados discretos y 6 acciones (moverse en las cuatro direcciones, recoger pasajero y dejarlo), de modo que la tabla Q completa cabe en memoria con un coste despreciable.

No hay información publicada sobre hiperparámetros concretos (alpha, gamma, política de exploración epsilon-greedy, número de episodios ni semillas). El autor tampoco documenta si usó una implementación propia o una librería, aunque la etiqueta `custom-implementation` sugiere una implementación manual del bucle de entrenamiento. No hay RLHF, DPO ni ninguna fase de ajuste posterior: el artefacto es el resultado directo del bucle de Q-Learning.

## Capacidades

- Resolución del entorno Taxi-v3: el agente aprende una política que recoge al pasajero y lo entrega en el destino correcto dentro de la rejilla 5x5.
- Aprendizaje tabular off-policy: la tabla Q puede reutilizarse como inicialización para reentrenamientos o para comparar variantes del algoritmo.
- Reproducibilidad de experimentos: al ser un entorno determinista en su dinámica base (salvo la opción `is_slippery`), permite comparar configuraciones de hiperparámetros de forma controlada.
- Integración con Gymnasium: se carga con `load_from_hub` y se ejecuta con `gym.make(model["env_id"])`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento extendido. Es un agente de control discreto, no un modelo generativo.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto de Q-Learning tabular en un curso, mostrando la tabla Q y la política derivada para ilustrar la convergencia de valores.
- Línea base en experimentos de RL: comparar variantes de Q-Learning (SARSA, Q-Learning con eligibility traces, Double Q-Learning) contra este agente sobre el mismo entorno y la misma métrica de recompensa media.
- Validación de pipelines de evaluación: comprobar que un arnés de evaluación de agentes RL (por ejemplo, el de Stable-Baselines3 o el de RL Baselines3 Zoo) carga correctamente un artefacto desde el Hub y reproduce la recompensa declarada.
- Pruebas de robustez del entorno: reevaluar la política con `is_slippery=True` para medir la degradación del rendimiento cuando las transiciones son estocásticas, un caso habitual en robótica y logística simulada.
- Enseñanza de publicación de artefactos: servir de plantilla mínima para que estudiantes publiquen agentes RL en Hugging Face con model-index y métricas declaradas.
- Simulación de logística a pequeña escala: adaptar la lógica de recogida y entrega a un problema de reparto simplificado con estados discretos, usando la tabla Q como punto de partida para un reentrenamiento sobre un entorno propio.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados por Hugging Face):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.54 +/- 2.73 |

No se han publicado otros resultados de benchmarks en la información disponible. La recompensa media de 7.54 con desviación típica de 2.73 indica una política funcional pero con varianza apreciable; en Taxi-v3 el óptimo teórico ronda 8 puntos por episodio con la configuración estándar, por lo que el agente está cerca del rendimiento esperado para Q-Learning tabular bien ajustado, aunque la desviación sugiere episodios con penalizaciones por pasos y entregas fallidas.

## Requisitos de hardware

- VRAM: no aplica. La tabla Q es un objeto Python en memoria de tamaño despreciable (del orden de kilobytes para 500 estados x 6 acciones).
- GPU: no se necesita ninguna GPU; el entrenamiento y la inferencia corren en CPU.
- CPU: cualquier procesador moderno es suficiente; el cuello de botella es el bucle de simulación de Gymnasium, no el cálculo.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. La carga se hace con `load_from_hub` del paquete `huggingface_sb3` y la ejecución con `gym.make`.
- Latencia y throughput: no disponibles en la información proporcionada; en la práctica, la inferencia es una búsqueda en tabla con coste O(1) por paso.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Contexto / estados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esncf/taxiRL | Q-Learning tabular | Taxi-v3 | 500 estados discretos | no disponible | Hugging Face |
| Agentes Q-Learning de RL Baselines3 Zoo | Q-Learning tabular | Taxi-v3 | 500 estados discretos | MIT (el del proyecto SB3) | GitHub / Hub |
| Agentes DQN de RL Baselines3 Zoo | Deep Q-Network | CartPole, Atari, etc. | continuo o de alta dimensión | MIT | GitHub / Hub |
| Agentes PPO de RL Baselines3 Zoo | PPO | múltiples entornos | continuo o discreto | MIT | GitHub / Hub |

La comparación directa con modelos de lenguaje no tiene sentido: taxiRL no procesa texto. Frente a las implementaciones de referencia de Stable-Baselines3, la diferencia principal es la ausencia de licencia declarada y de documentación de hiperparámetros, no el rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Especificidad total al entorno Taxi-v3: la tabla Q solo es válida para ese espacio de estados y ese conjunto de acciones; no se transfiere a otros entornos sin reentrenamiento.
- Licencia no declarada: no hay información sobre permisos de uso comercial, modificación o redistribución. Antes de cualquier uso en producción conviene contactar con el autor.
- Métricas no verificadas: el model-index marca `verified: false`, por lo que la recompensa de 7.54 +/- 2.73 procede únicamente del autor y no ha sido reproducida de forma independiente.
- Varianza alta: la desviación típica de 2.73 sobre una media de 7.54 implica episodios con rendimiento claramente inferior; no es una política óptima estabilizada.
- Sin documentación de hiperparámetros ni semillas: la reproducibilidad exacta del resultado no está garantizada.
- Sin información sobre sesgos: al operar sobre un entorno sintético no hay sesgos sociales, pero tampoco hay auditoría alguna del comportamiento del agente.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esncf/taxiRL
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de Q-Learning tabular en el contexto de Taxi-v3: https://gymnasium.farama.org/tutorials/training_agents/blackjack_tutorial/
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- huggingface_sb3 (utilidad `load_from_hub`): https://github.com/huggingface/huggingface_sb3
- RL Baselines3 Zoo (implementaciones de referencia): https://github.com/DLR-RM/rl-baselines3-zoo
