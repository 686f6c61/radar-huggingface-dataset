# SimonPfaendler/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

DQN para SpaceInvadersNoFrameskip-v4 es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo Deep Q-Network (DQN) sobre el entorno de Atari Space Invaders, en su variante sin limitación de frames. Lo desarrolla SimonPfaendler y se distribuye a través de Hugging Face Hub como un artefacto de la librería Stable Baselines3, generado con el framework RL Zoo (RL Baselines3 Zoo) del grupo DLR-RM. No se trata de un modelo de lenguaje: es una política neuronal convolucional que mapea observaciones visuales del juego a acciones discretas.

El modelo resuelve la tarea de control a partir de píxeles: recibe capturas de pantalla apiladas y emite una de las acciones del espacio de acciones de Space Invaders. Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo reproducible de un pipeline completo de entrenamiento DQN con Atari, con hiperparámetros documentados y un flujo de carga y evaluación estandarizado mediante RL Zoo. El repositorio ocupa aproximadamente 0,1 GB.

El entrenamiento se realizó durante 1.000.000 de pasos de entorno, con una política CNN, un búfer de repetición de 100.000 transiciones y apilado de 4 frames. El resultado declarado por el autor es una recompensa media de 369,00 ± 186,14 en el entorno de evaluación, un valor no verificado de forma independiente. No hay información sobre idiomas, licencia ni formatos alternativos de pesos más allá de los artefactos nativos de Stable Baselines3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con política CNN (CnnPolicy de Stable Baselines3) sobre observaciones de píxeles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | artefactos nativos de Stable Baselines3 (`.zip`), cargables con RL Zoo |

## Arquitectura y entrenamiento

La arquitectura es un agente DQN clásico con una red Q parametrizada por una CNN que procesa observaciones visuales del entorno Atari. El preprocesado se realiza con `AtariWrapper` de Stable Baselines3, que aplica recorte, escala de grises y reducción de resolución, más apilado de 4 frames (`frame_stack=4`). El espacio de acciones es el discreto estándar de Space Invaders. La red se entrena con la pérdida de Bellman estándar de DQN, con actualización de la red objetivo cada 1.000 pasos y `train_freq=4` (una actualización cada cuatro pasos de entorno).

Los hiperparámetros documentados incluyen: `batch_size=32`, `buffer_size=100000`, `learning_rate=0.0003`, `learning_starts=100000`, `exploration_fraction=0.1`, `exploration_final_eps=0.01`, `gradient_steps=1`, `optimize_memory_usage=False` y `normalize=False`. El entrenamiento total fue de 1.000.000 de pasos (`n_timesteps`). No se documenta el uso de Double DQN, dueling networks, prioritized replay ni otras variantes; el nombre del modelo indica DQN estándar. No hay información sobre composición de datos más allá del propio entorno de entrenamiento ni sobre procesos de ajuste fino posteriores.

## Capacidades

- Control de política a partir de píxeles en el entorno SpaceInvadersNoFrameskip-v4: selecciona acciones discretas para maximizar la recompensa acumulada.
- Aprendizaje por refuerzo profundo con DQN: reproduce el pipeline de entrenamiento y evaluación de Stable Baselines3 y RL Zoo.
- Carga y evaluación reproducibles mediante `rl_zoo3.load_from_hub` y `rl_zoo3.enjoy`.
- Reentrenamiento documentado con `rl_zoo3.train` usando los hiperparámetros publicados.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión general, audio ni capacidades multilingües.
- No dispone de modo de razonamiento explícito (thinking mode) ni de generación de texto.

## Casos de uso

- Reproducción de experimentos de RL: cargar el agente con RL Zoo y verificar la recompensa media declarada en SpaceInvadersNoFrameskip-v4, útil como línea base en cursos y tutoriales de aprendizaje por refuerzo.
- Comparación de algoritmos: usar este DQN como referencia frente a PPO, A2C o variantes con Double DQN sobre el mismo entorno para medir diferencias de rendimiento y estabilidad.
- Estudio de hiperparámetros: partir de la configuración documentada (`buffer_size`, `learning_rate`, `exploration_fraction`, etc.) y realizar barridos para analizar su efecto en la curva de aprendizaje.
- Docencia de deep RL: ilustrar el flujo completo de un agente Atari, desde el preprocesado con `AtariWrapper` hasta la evaluación con vídeo, en asignaturas de aprendizaje automático.
- Pruebas de infraestructura de entrenamiento: validar pipelines de RL Zoo, seguimiento de experimentos y carga desde Hugging Face Hub con un modelo pequeño y rápido de ejecutar.
- Punto de partida para transferencia o ajuste fino: reentrenar el agente en variantes del entorno o en otros juegos Atari con arquitectura similar para estudiar la generalización de políticas visuales.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| DQN | SpaceInvadersNoFrameskip-v4 | mean_reward | 369,00 +/- 186,14 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni desgloses adicionales (longitud de episodio, tasa de victoria, curvas de aprendizaje).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio ocupa 0,1 GB y la política CNN es pequeña, por lo que cabe holgadamente en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU para evaluación.
- GPU recomendadas: no se especifican; para entrenamiento de 1M de pasos, una GPU consumer moderna es suficiente, y para evaluación basta con CPU.
- Cabe en GPU consumer: sí, sin restricciones prácticas conocidas.
- Opciones de despliegue: RL Zoo (`rl_zoo3.enjoy`), Stable Baselines3 directamente, y carga desde Hugging Face Hub con `rl_zoo3.load_from_hub`. No se documentan exportaciones a ONNX, TensorRT ni formatos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SimonPfaendler/dqn-SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | no disponible | no aplica | 369,00 +/- 186,14 | no disponible | Hugging Face Hub |
| Agentes DQN de referencia del RL Zoo (DLR-RM) | DQN | SpaceInvadersNoFrameskip-v4 | no disponible | no aplica | no disponible en esta ficha | MIT (RL Zoo) | GitHub / Hugging Face Hub |
| Agentes PPO de referencia del RL Zoo (DLR-RM) | PPO | Atari (varios) | no disponible | no aplica | no disponible en esta ficha | MIT (RL Zoo) | GitHub / Hugging Face Hub |

No se dispone de datos comparativos verificados en la información proporcionada; la comparativa se limita a señalar alternativas de la misma familia (agentes Atari de RL Zoo) sin cifras de rendimiento confirmadas.

## Limitaciones y advertencias

- La recompensa media declarada (369,00 ± 186,14) no está verificada (`verified: false`) y presenta una desviación típica muy alta, lo que indica una varianza considerable entre episodios y una fiabilidad limitada como métrica de rendimiento.
- El agente está entrenado exclusivamente para SpaceInvadersNoFrameskip-v4; no generaliza a otros entornos sin reentrenamiento.
- No es un modelo de lenguaje ni un modelo multimodal general: no procesa texto, audio ni imágenes fuera del dominio del juego.
- No se especifica licencia, por lo que el uso comercial queda sin garantías legales claras; se recomienda contactar con el autor antes de cualquier uso en producción.
- No hay información sobre sesgos, alucinaciones (no aplica en el sentido lingüístico) ni evaluación fuera de distribución.
- El entrenamiento de 1M de pasos es relativamente corto para estándares Atari; los resultados pueden mejorar sustancialmente con más pasos o variantes como Double DQN o prioritized replay.
- No se documentan semillas, número de ejecuciones de evaluación ni protocolo estadístico, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SimonPfaendler/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Baselines3 Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Stable Baselines3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + Jax): https://github.com/araffin/sbx
