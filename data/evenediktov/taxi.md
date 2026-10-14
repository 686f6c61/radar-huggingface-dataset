# evenediktov/taxi

## Resumen

`evenediktov/taxi` es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno `Taxi-v3` de Gym/Gymnasium. Lo publica el usuario de Hugging Face evenediktov (Evgenii Venediktov) bajo la etiqueta `custom-implementation`, es decir, con una implementación propia de Q-Learning y no con una librería estándar como Stable-Baselines3 o el RL Zoo.

No se trata de un modelo de lenguaje ni de una red neuronal: es una tabla Q que asigna un valor a cada par estado-accion del entorno discreto Taxi-v3. El repositorio ocupa 0.0 GB y contiene un fichero de pesos `q-learning.pkl` junto con un vídeo de repetición (`replay.mp4`). El pipeline declarado en Hugging Face es `reinforcement-learning`.

Su relevancia es fundamentalmente docente y experimental: sirve como ejemplo mínimo y reproducible de un agente Q-Learning, útil como baseline para comparar con algoritmos más complejos (DQN, PPO, SARSA) sobre el mismo entorno. No tiene aplicación en producción de lenguaje natural ni en tareas generativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente tabular de Q-Learning (tabla Q, sin red neuronal) |
| Parámetros totales | Hasta 3000 valores Q (500 estados x 6 acciones según la definición estándar de Taxi-v3); el autor no publica el recuento exacto |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (el agente consume una observación discreta de Taxi-v3, no una ventana de tokens) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pickle (fichero `q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico: una tabla que mapea cada estado discreto del entorno Taxi-v3 a un valor Q por acción, con una política de exploración durante el entrenamiento (habitualmente epsilon-greedy) y una actualización tipo Bellman. El espacio de estados de Taxi-v3 es discreto y finito (500 estados) y el de acciones también (6 acciones: norte, sur, este, oeste, recoger pasajero y dejar pasajero), por lo que no se necesita approximación de función ni red neuronal.

No hay información disponible sobre el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, el esquema de decaimiento de epsilon, la composición del dataset (inexistente en RL) ni si se aplicaron técnicas de RLHF, DPO o similares. El autor etiqueta la implementación como `custom-implementation`, pero no documenta los hiperparámetros ni el código de entrenamiento en la model card.

## Capacidades

- Resolución del entorno Taxi-v3: el agente aprende una política para recoger y dejar pasajeros en las paradas correctas del mapa.
- Control discreto con 6 acciones sobre 500 estados.
- Inferencia determinista a partir de la tabla Q aprendida (política greedy sobre los valores almacenados).
- Carga y evaluación mediante utilidades tipo `load_from_hub` y `gym.make`, según el ejemplo de la model card.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso general ni planificación fuera de Taxi-v3.
- No tiene capacidades multilingües, de visión, de audio ni modo de razonamiento explícito.
- No genera texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: permite ilustrar el ciclo completo de Q-Learning (exploración, explotación, actualización de la tabla Q) con un entorno de estado discreto y coste computacional mínimo.
- Baseline experimental: sirve como referencia contra la que medir DQN, SARSA o PPO sobre Taxi-v3 en trabajos académicos o prácticas.
- Validación de pipelines de RL: útil para comprobar que un sistema de carga de agentes (`load_from_hub`), creación de entorno (`gym.make`) y evaluación de episodios funciona de extremo a extremo antes de pasar a modelos mayores.
- Pruebas de integración en CI: al ocupar Kilobytes y ejecutarse en CPU, puede incorporarse a tests automáticos que verifiquen que un agente se carga y completa episodios sin error.
- Reproducción de visualizaciones: el `replay.mp4` del repositorio permite demostrar el comportamiento del agente en charlas o material didáctico.
- Comparación de esquemas de discretización de acciones: al ser un agente tabular pequeño, sirve para estudiar cómo afectan los cambios en la representación del estado al retorno medio.
- No es adecuado para ningún caso de uso en producción real de negocio (chatbots, generación de código, atención al cliente, conducción autónoma fuera del entorno simulado).

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Verificado |
|---|---|---|---|
| Taxi-v3 | mean_reward | 7.54 +/- 2.71 | No |

El único dato disponible es el declarado por el autor en el `model-index`: un retorno medio de 7.54 con desviación típica de 2.71 sobre Taxi-v3. La métrica aparece marcada como `verified: false`, por lo que no está validada por Hugging Face. No se han publicado resultados de benchmarks comparativos en la información disponible.

Como referencia general del entorno (no como dato del modelo), en Taxi-v3 una política aleatoria obtiene retornos muy negativos y una política óptima ronda los 8-10 puntos por episodio, de modo que un 7.54 queda por debajo de la zona habitualmente considerada como "resuelto". Esta referencia no procede de la model card y debe tratarse con cautela.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo es una tabla de valores en CPU (fichero pickle de pocos Kilobytes).
- GPU recomendadas: ninguna; no requiere aceleración por GPU.
- Cabe en cualquier equipo: funciona en CPU de portátil, Raspberry Pi o contenedores con recursos mínimos.
- Opciones de despliegue: ejecución directa en Python con `gym`/`gymnasium` y las utilidades de carga del Hub; no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la documentación; al ser una consulta a tabla, la latencia por paso es del orden de microsegundos y el cuello de botella real es el bucle del entorno.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evenediktov/taxi | Q-Learning tabular | Taxi-v3 | mean_reward 7.54 +/- 2.71 (no verificado) | no disponible | Hugging Face |
| Agentes Q-Learning del RL Zoo / Stable-Baselines3 | Q-Learning tabular | Taxi-v3 y otros | no disponible | MIT (librería) | Hugging Face / repositorio |
| Agentes DQN (p. ej. evenediktov/dqn-SpaceInvadersNoFrameskip-v4) | DQN con red neuronal | Atari SpaceInvaders | no disponible | no disponible | Hugging Face |
| Algoritmos SARSA o PPO sobre Taxi-v3 | Tabular / policy gradient | Taxi-v3 | no disponible | depende de la implementación | varios repositorios |

No hay datos públicos suficientes en la información proporcionada para comparar rendimiento numérico con alternativas; los valores de los competidores aparecen como "no disponible".

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no tiene ventana de contexto, no soporta tool calling ni tareas generativas.
- Alucinación: concepto no aplicable; el riesgo equivalente es tomar acciones subóptimas por una tabla Q mal convergida.
- Rendimiento limitado: el retorno medio de 7.54 queda por debajo del umbral típico de resolución del entorno (en torno a 8-10) y presenta una desviación típica alta (2.71).
- Métrica no verificada: el `model-index` marca el resultado como `verified: false`.
- Específico del entorno: la política solo es válida para Taxi-v3; no generaliza a otros entornos ni a variantes con cambios en el mapa o en las reglas.
- Licencia no disponible: no se puede asumir permiso de uso comercial; conviene contactar con el autor antes de cualquier utilización más allá de la experimentación.
- Formato pickle: deserializar un `.pkl` de origen no confiable puede ejecutar código arbitrario; cargar solo desde el repositorio original y en entornos aislados.
- Falta de reproducibilidad: no se documentan hiperparámetros, número de episodios, dependencias ni versiones de Gym/Gymnasium.
- Adopción nula: 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Metadatos atípicos: la fecha de creación declarada (2026-10-14) es posterior a la fecha de actualización habitual de los repositorios y resulta inusual.
- Los resultados de la búsqueda web no aportan información técnica relevante sobre el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evenediktov/taxi
- Perfil del autor: https://huggingface.co/evenediktov
- Vídeo de repetición del agente: https://huggingface.co/evenediktov/taxi/resolve/main/replay.mp4
- Otro modelo del mismo autor (referencia de estilo): https://huggingface.co/evenediktov/dqn-SpaceInvadersNoFrameskip-v4
- No se han encontrado enlaces adicionales relevantes (papers, blogs o repos) en la búsqueda web.
