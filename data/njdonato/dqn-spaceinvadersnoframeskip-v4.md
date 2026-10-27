# njdonato/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un agente de aprendizaje por refuerzo profundo: una política DQN (deep Q-network) entrenada para jugar al entorno de Atari `SpaceInvadersNoFrameskip-v4`. Lo publica el usuario de Hugging Face `njdonato` utilizando stable-baselines3 y el RL Zoo, el marco de entrenamiento mantenido por el DLR-RM con optimización de hiperparámetros y agentes preentrenados. El problema que resuelve es acotado: aprender una política de control a partir de píxeles crudos en un único videojuego, sin supervisión humana y con recompensa escasa.

El interés práctico es el de una pieza de referencia reproducible: permite verificar el pipeline completo de RL Zoo (carga desde el Hub, evaluación con `enjoy`, generación de vídeo), sirve como línea base de DQN frente a otros algoritmos y como material docente para inspeccionar hiperparámetros reales de un entrenamiento Atari. No es un componente reutilizable para tareas de generación de texto, código o razonamiento, y su licencia no está declarada, lo que limita cualquier uso comercial.

Las cifras publicadas son modestas y poco verificadas: recompensa media de 1187,00 ± 420,49 en el entorno de evaluación, con marca `verified: false` en la model card y solo 1 millón de pasos de entrenamiento declarados. La desviación típica de 420,49 sobre una media de 1187 indica una varianza muy alta entre episodios, un dato relevante antes de tomar el agente como referencia estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN (deep Q-network) con política convolucional (`CnnPolicy` de stable-baselines3), sin mecanismo de atención ni arquitectura transformer |
| Parametros totales | no disponible (el autor no declara el recuento; la política es una CNN pequeña sobre observaciones de 84x84x4) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; cada observación es un apilado de 4 fotogramas de 84x84 píxeles en escala de grises (`frame_stack: 4`) |
| Tipos de cuantizacion | no aplica (no se distribuyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (el agente no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | archivo `.zip` de stable-baselines3 con la política PyTorch serializada; repositorio de 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un DQN clásico con aproximación de la función Q mediante una red convolucional que recibe el apilado de 4 fotogramas de 84x84 en grises y produce un valor Q por cada una de las acciones discretas del entorno. El preprocesado corre a cargo de `stable_baselines3.common.atari_wrappers.AtariWrapper`, que aplica recorte, conversión a escala de grises, redimensionado y repetición de acción. La política es `CnnPolicy`, el buffer de repetición tiene 100 000 transiciones, el tamaño de lote es 64, la tasa de aprendizaje 0,0001, `train_freq` y `gradient_steps` valen 4, `target_update_interval` es 1000, la exploración decae de ε inicial a 0,01 durante el 10 % del entrenamiento (`exploration_fraction: 0.1`) y `learning_starts` es 100 000 pasos. El entrenamiento declarado es de 1 000 000 de timesteps con 12 entornos en paralelo y `n_envs: 12`, usando `optimize_memory_usage: False` y sin normalización de observaciones (`normalize: False`).

No se documenta composición de dataset, número de semillas, número de episodios de evaluación ni proceso de ajuste fino con preferencias humanas o RLHF, algo que no aplica a este tipo de agente. La innovación técnica es la del algoritmo original (target network con actualización periódica y experience replay), sin modificaciones propias: no hay decodificación especulativa, atención lineal ni mecanismos híbridos SSM. El resultado se generó con el flujo estándar de RL Zoo (`rl_zoo3.train` más `rl_zoo3.push_to_hub`).

## Capacidades

- Control de política en un único entorno: juega a `SpaceInvadersNoFrameskip-v4` a partir de píxeles, con acciones discretas del conjunto de acciones del entorno.
- Aprendizaje por refuerzo off-policy con experience replay y target network, reproducible mediante los hiperparámetros publicados.
- Carga y evaluación directa con RL Zoo (`rl_zoo3.load_from_hub` y `rl_zoo3.enjoy`), incluida la posibilidad de generar vídeo cuando el entorno lo permite (`render_mode: rgb_array`).
- Entrenamiento adicional o reanudación sobre el mismo entorno con el mismo comando `rl_zoo3.train`, útil para experimentos de ajuste de hiperparámetros.
- No soporta tool calling ni function calling, agentes multi-paso fuera del bucle del entorno, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Línea base de DQN en Atari: sirve como referencia de recompensa media (1187,00 ± 420,49) contra la que comparar variantes propias del algoritmo en el mismo entorno y con los mismos wrappers.
- Docencia de aprendizaje por refuerzo: el repositorio incluye los hiperparámetros completos, de modo que un curso puede reproducir el entrenamiento paso a paso y discutir el efecto de `buffer_size`, `exploration_fraction` o `target_update_interval` sobre la curva de recompensa.
- Verificación de pipelines de RL Zoo: al cargar el modelo con `rl_zoo3.load_from_hub` se comprueba de extremo a extremo la integración con el Hub, la compatibilidad de versiones de stable-baselines3 y el funcionamiento de `enjoy`.
- Generación de demostraciones visuales: con `render_mode: rgb_array` se pueden producir clips de la política jugando, útiles para material divulgativo o para inspeccionar cualitativamente el comportamiento aprendido.
- Estudio de varianza y robustez: la desviación típica publicada de 420,49 sobre una media de 1187 hace del agente un caso de estudio sobre estabilidad entre episodios y sobre la conveniencia de reportar intervalos de confianza.
- Comparación de algoritmos con el mismo presupuesto: sirve como punto de partida para enfrentar DQN con PPO, A2C o Rainbow del RL Zoo bajo 1 millón de timesteps y 12 entornos, aislando el efecto del algoritmo.
- Pruebas de regresión en infraestructura de RL: un agente pequeño y de ejecución en CPU permite validar en CI que una actualización de dependencias no rompe la carga de políticas ni la API de Gymnasium.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`), sin información sobre número de episodios, semillas ni metodología de evaluación.

| Modelo | Tarea | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| DQN (njdonato) | reinforcement-learning | SpaceInvadersNoFrameskip-v4 | mean_reward | 1187,00 ± 420,49 | No |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a un agente de control. Tampoco se aportan curvas de aprendizaje, recompensa por episodio ni comparación con una línea base aleatoria.

## Requisitos de hardware

- VRAM: no aplica en la práctica. La política es una CNN de juguete sobre 84x84x4; la inferencia cabe holgadamente en memoria de CPU y en cualquier GPU con unos pocos cientos de MB.
- GPU recomendadas: ninguna en particular. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) acelera el reentrenamiento, pero no es necesaria para evaluar.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en iGPU; también funciona solo con CPU.
- Despliegue: stable-baselines3 y RL Zoo son la vía natural (`rl_zoo3.load_from_hub`, `rl_zoo3.enjoy`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto. El repositorio ocupa 0,1 GB.
- Latencia y throughput: no disponibles de forma oficial. Al ser una CNN pequeña con evaluación por fotograma, se espera una latencia del orden de milisegundos por paso en CPU, muy por debajo de los 60 FPS del emulador; esta cifra es una estimación, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DQN (njdonato) | DQN + CnnPolicy (SB3) | no disponible | no aplica (4 fotogramas 84x84) | SpaceInvadersNoFrameskip-v4 | no disponible | Hugging Face, repo 0,1 GB |
| DQN de referencia (Mnih et al., 2015) | DQN + CNN | no disponible en la información proporcionada | no aplica | suite Atari 2600 | publicación académica | paper, sin pesos oficiales en este repositorio |
| Agentes Atari del RL Zoo (PPO, A2C, Rainbow) | varios algoritmos SB3 | no disponible | no aplica | suite Atari, incluido SpaceInvaders | MIT (según el proyecto RL Zoo, no verificado aquí) | Hugging Face vía RL Zoo |
| DQN aleatorio / no entrenado | DQN sin entrenamiento | no disponible | no aplica | SpaceInvadersNoFrameskip-v4 | no aplica | línea base a generar localmente |

La comparación cuantitativa con alternativas no está disponible: la información proporcionada no incluye recompensas de otros agentes en el mismo entorno, por lo que no es posible afirmar si 1187,00 sitúa a este DQN por encima o por debajo de la media del RL Zoo para Space Invaders.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial, redistribución ni modificación. Antes de cualquier uso en producción hay que contactar con el autor.
- Resultados no verificados: la métrica 1187,00 ± 420,49 figura con `verified: false` y sin detalle de episodios, semillas ni versión del entorno, por lo que no es reproducible tal cual.
- Varianza muy elevada: una desviación de 420,49 sobre una media de 1187 implica que episodios individuales pueden quedar muy por debajo; no es una política fiable para demostraciones en directo sin selección de semilla.
- Presupuesto de entrenamiento corto: 1 millón de timesteps es un régimen reducido para Atari, donde las referencias clásicas emplean decenas de millones de fotogramas; es esperable un rendimiento por debajo del estado del arte.
- Una sola tarea y un solo entorno: no generaliza a otros juegos, a cambios de preprocesado ni a variantes del entorno; cualquier modificación de los wrappers invalida la política.
- Sin capacidades de lenguaje: no genera texto, no razona en lenguaje natural, no soporta tool calling ni agentes multi-paso. Emplearlo para esas tareas es un error de categoría.
- Dependencia de versiones: la carga del `.zip` requiere versiones compatibles de stable-baselines3 y Gymnasium; un cambio de API puede romper la deserialización.
- Riesgo de alucinación no aplica; el riesgo equivalente es la sobreestimación de valores Q propia de DQN, no medida en la información disponible.
- Sin información sobre sesgos: no se documenta análisis de comportamiento colateral, explotación de bugs del emulador ni robustez frente a perturbaciones de píxeles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/njdonato/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Baselines3 Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + JAX): https://github.com/araffin/sbx
- Nota: la búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
