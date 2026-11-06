# JSI123/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

DQN-SpaceInvadersNoFrameskip-v4 es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo Deep Q-Network (DQN) para el entorno SpaceInvadersNoFrameskip-v4 de Atari, tal como lo distribuye la librería Gymnasium. Lo publica el usuario JSI123 en Hugging Face como parte de las prácticas del curso de deep reinforcement learning (deep-rl-course), reutilizando el flujo de trabajo del RL Zoo de Stable Baselines3. No es un modelo de lenguaje ni un modelo generativo: es una política neuronal convolucional que asigna valores Q a las acciones del juego a partir de observaciones de imagen.

El modelo se entrenó durante 1.000.000 de pasos de entorno con una política `CnnPolicy`, un búfer de repetición de 100.000 transiciones y un tamaño de lote de 32. El resultado declarado por el autor es una recompensa media de 536,50 con una desviación estándar de 209,83 en el entorno de evaluación, un valor que refleja una política funcional pero con alta varianza entre episodios.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible de un agente DQN sobre Atari con hiperparámetros estándar del RL Zoo, y como punto de partida para comparar variantes (Double DQN, Dueling DQN, Rainbow) sobre el mismo entorno. Al tener cero descargas y carecer de licencia declarada, no debe considerarse un artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con política convolucional (`CnnPolicy` de Stable Baselines3) sobre observaciones de imagen apiladas (frame_stack=4) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 4 frames apilados del entorno Atari |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (agente de control sobre píxeles, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la información proporcionada; el repositorio usa la librería `stable-baselines3` (habitualmente `.zip` con pesos PyTorch) |

## Arquitectura y entrenamiento

El agente implementa el algoritmo DQN clásico (Mnih et al., 2015) con una red Q parametrizada por una `CnnPolicy` de Stable Baselines3, que procesa observaciones de 4 frames apilados y produce un valor Q por cada una de las acciones discretas del entorno SpaceInvaders. El entrenamiento emplea un búfer de repetición de 100.000 transiciones, `learning_starts=100000`, `train_freq=4`, `gradient_steps=1` y actualización de la red objetivo cada 1.000 pasos. La exploración sigue un esquema epsilon-greedy con decaimiento durante el 10 % inicial del entrenamiento hasta `exploration_final_eps=0.01`, con tasa de aprendizaje de 1e-4 y tamaño de lote de 32.

El preprocesado del entorno se realiza con `AtariWrapper`, que aplica recorte y escalado de recompensas, conversión a escala de grises, redimensionado a 84x84 y apilado de 4 frames. No se documenta el uso de Double DQN, Dueling, prioritised replay, n-step returns ni otras extensiones; tampoco se especifica el número total de tokens ni composición de datos, ya que no aplica. La innovación técnica es nula por diseño: se trata de una configuración de referencia del RL Zoo para el curso de deep RL.

## Capacidades

- Control de política discreta en el entorno Atari SpaceInvadersNoFrameskip-v4: selecciona acciones a partir de observaciones de píxeles.
- Aprendizaje por refuerzo off-policy con repetición de experiencias y red objetivo.
- Exploración epsilon-greedy configurable.
- Integración con el ecosistema Stable Baselines3 y RL Zoo para carga, evaluación y reentrenamiento.
- Compatible con `rl_zoo3.load_from_hub` y `rl_zoo3.enjoy` para reproducir la evaluación.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general ni de audio: la "visión" se limita a los frames del juego.

## Casos de uso

- Reproducción de resultados del curso de deep RL: cargar el agente con `rl_zoo3.load_from_hub` y verificar la recompensa media declarada (536,50 ± 209,83) como línea base del ejercicio.
- Comparación de algoritmos sobre Atari: usar este DQN como referencia frente a variantes Double DQN, Dueling o Rainbow entrenadas con los mismos hiperparámetros para medir mejoras en recompensa media.
- Estudio de hiperparámetros: modificar `learning_rate`, `buffer_size` o `exploration_fraction` y reentrenar con `rl_zoo3.train` para analizar el impacto en la varianza de la recompensa.
- Docencia de RL profundo: ilustrar el pipeline completo (AtariWrapper, CnnPolicy, búfer de repetición, red objetivo) en un entorno con espacio de acciones discreto y observaciones visuales.
- Evaluación de estabilidad de políticas: analizar la desviación estándar de 209,83 para discutir la varianza entre episodios y la necesidad de múltiples semillas.
- Punto de partida para fine-tuning: inicializar un agente con estos pesos y continuar el entrenamiento con `optimize_memory_usage` o `frame_stack` distintos para experimentar con eficiencia de memoria.
- Generación de vídeos de evaluación: usar `render_mode='rgb_array'` y `rl_zoo3.push_to_hub` para producir clips del agente jugando, útil en materiales docentes.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| DQN | SpaceInvadersNoFrameskip-v4 | mean_reward | 536,50 ± 209,83 |

No se han publicado otros resultados de benchmarks en la información disponible. No se dispone de comparaciones con otras semillas, variantes de DQN ni agentes de referencia en el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la `CnnPolicy` de SB3 para Atari es una CNN pequeña (del orden de pocos millones de parámetros), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2-4 GB de VRAM.
- GPU recomendadas: no se requiere GPU para inferencia; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este agente. Para reentrenar 1M de pasos, una GPU consumer (RTX 3060/4060 o superior) es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también puede ejecutarse en CPU con latencia aceptable para evaluación.
- Opciones de despliegue: `stable-baselines3` con `rl_zoo3` (carga y evaluación); no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El coste por paso depende del renderizado del entorno Atari, no del modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Contexto / observación | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JSI123/dqn-SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | 4 frames apilados 84x84 | 536,50 ± 209,83 | no disponible | Hugging Face, 0 descargas |
| Agentes de referencia del RL Zoo (SB3) | DQN / PPO / A2C | SpaceInvadersNoFrameskip-v4 | 4 frames apilados 84x84 | no disponible en la información | MIT (SB3/RL Zoo) | GitHub DLR-RM/rl-baselines3-zoo |
| Variantes Double/Dueling DQN (literatura) | Double/Dueling DQN | Atari 2600 | 4 frames apilados 84x84 | no disponible en la información | según implementación | Papers y repos académicos |

No se dispone de datos numéricos de los modelos comparables en la información proporcionada; la comparación se limita a categoría, entorno y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: DQN sobreestima los valores Q (sesgo de maximización); no se aplican Double DQN ni correcciones equivalentes en esta configuración.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero la política puede ejecutar acciones subóptimas con alta varianza (desviación estándar de 209,83 sobre una media de 536,50).
- Limitaciones de contexto o idioma: no aplica; el agente solo opera sobre el entorno SpaceInvadersNoFrameskip-v4 y no generaliza a otros juegos ni tareas sin reentrenamiento.
- Restricciones de licencia: la licencia no está declarada, por lo que el uso comercial es incierto y no recomendable sin aclaración previa del autor.
- Caveat para producción: cero descargas y cero likes; el artefacto es de carácter didáctico, sin verificación independiente de los resultados declarados (`verified: false`).
- Entrenamiento limitado a 1M de pasos, por debajo de los 10M habituales en referencias Atari del RL Zoo; la recompensa media es modesta en comparación con agentes más entrenados.
- No se documentan semillas, número de episodios de evaluación ni protocolo de medida, lo que dificulta la reproducibilidad exacta del valor declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JSI123/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo (rl-baselines3-zoo): https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + Jax): https://github.com/araffin/sbx
