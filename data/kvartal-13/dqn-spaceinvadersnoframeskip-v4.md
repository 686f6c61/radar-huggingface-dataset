# kvartal-13/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

DQN aplicado a SpaceInvadersNoFrameskip-v4 es un agente de aprendizaje por refuerzo profundo entrenado con la librería Stable Baselines3 y el framework RL Zoo, ambos mantenidos por el grupo DLR-RM. El modelo resuelve la tarea de control a partir de píxeles del entorno Atari Space Invaders, uno de los benchmarks clásicos de la suite ALE (Arcade Learning Environment), y ha sido publicado por el usuario kvartal-13 en Hugging Face.

No se trata de un modelo de lenguaje ni de un transformer generativo: es una política neuronal convolucional (CnnPolicy) que mapea observaciones visuales apiladas en cuatro fotogramas a una de las acciones discretas del juego. El repositorio ocupa aproximadamente 0,1 GB y contiene los pesos en el formato propio de Stable Baselines3 (archivo `.zip`), no en safetensors ni GGUF.

Su relevancia es fundamentalmente didáctica y de reproducibilidad: sirve como referencia de un agente DQN entrenado con hiperparámetros estándar del RL Zoo (2,5 millones de pasos, buffer de 100.000 transiciones, 64 entornos en paralelo) y permite validar pipelines de RL, comparar variantes de DQN o servir de línea base en experimentos con Atari.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DQN con política convolucional (CnnPolicy) sobre observaciones de píxeles apiladas (frame_stack=4) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL; observación de 4 fotogramas apilados) |
| Tipos de cuantización | no disponible (pesos en formato nativo de Stable Baselines3) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | archivo `.zip` de Stable Baselines3 (cargable con `rl_zoo3.load_from_hub`) |

## Arquitectura y entrenamiento

El agente implementa Deep Q-Network (DQN) con una red convolucional que procesa la observación visual del entorno Atari. El preprocesado se realiza con `AtariWrapper` de Stable Baselines3, que aplica recorte, escala a 84x84, conversión a escala de grises y apilado de 4 fotogramas (`frame_stack=4`). La política es `CnnPolicy`, la arquitectura convolucional estándar de SB3 para observaciones de imagen.

Los hiperparámetros de entrenamiento, tomados de la model card, son: `batch_size=32`, `buffer_size=100000`, `exploration_final_eps=0.01`, `exploration_fraction=0.1`, `gradient_steps=64`, `learning_rate=0.0001`, `learning_starts=100000`, `n_envs=64`, `n_timesteps=2500000`, `target_update_interval=1000`, `train_freq=4` y `optimize_memory_usage=False`. El entrenamiento se ejecutó con el RL Zoo (`rl_zoo3.train`), que aplica la configuración por defecto del algoritmo para el entorno. No se documentan innovaciones técnicas adicionales (ni RLHF, ni decodificación especulativa, ni atención lineal), ya que no aplican a este tipo de modelo.

## Capacidades

- Control de política en el entorno Atari SpaceInvadersNoFrameskip-v4 mediante acciones discretas.
- Procesamiento de observaciones visuales en bruto (píxeles) con red convolucional.
- Aprendizaje por refuerzo off-policy con replay buffer y red objetivo (target network).
- Entrenamiento paralelizado con 64 entornos simultáneos.
- Carga y evaluación reproducibles mediante RL Zoo (`load_from_hub` y `enjoy`).
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Línea base en investigación de RL: sirve como referencia de rendimiento DQN en Space Invaders para comparar con variantes como Double DQN, Dueling DQN o Rainbow, usando el mismo entorno y wrapper.
- Docencia y formación: permite demostrar el ciclo completo de entrenamiento, evaluación y carga de un agente Atari con Stable Baselines3 y RL Zoo en un notebook.
- Validación de pipelines de RL: útil para comprobar que la instalación de `rl_zoo3`, SB3 y las dependencias de Atari (ALE, gymnasium) funciona correctamente antes de lanzar entrenamientos más costosos.
- Reproducibilidad de experimentos: al fijar hiperparámetros y semilla, permite replicar el resultado declarado (682,50 ± 168,51 de recompensa media) y verificar la variabilidad entre ejecuciones.
- Generación de vídeos de evaluación: con `render_mode='rgb_array'` se pueden capturar frames del agente jugando para análisis cualitativo o material divulgativo.
- Punto de partida para fine-tuning: los pesos pueden reutilizarse como inicialización en experimentos con entornos similares o con modificaciones del propio Space Invaders.
- Integración en pruebas de regresión de librerías: sirve como caso de prueba end-to-end para cambios en SB3, RL Zoo o en los wrappers de Atari.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| DQN | SpaceInvadersNoFrameskip-v4 | mean_reward | 682,50 ± 168,51 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la red convolucional es pequeña y la inferencia cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la práctica).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para entrenamiento, una GPU consumer (RTX 3060 o superior) acelera notablemente los 2,5 millones de pasos.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia.
- Opciones de despliegue: Stable Baselines3 + RL Zoo (`rl_zoo3.enjoy`), o carga directa del `.zip` con `DQN.load()`. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kvartal-13/dqn-SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | 682,50 ± 168,51 | no disponible | Hugging Face |
| Agentes DQN del RL Zoo (DLR-RM) | DQN | SpaceInvadersNoFrameskip-v4 | no disponible | MIT (RL Zoo) | GitHub / Hugging Face |
| Variantes Double/Dueling DQN (SB3 Contrib) | Double/Dueling DQN | SpaceInvadersNoFrameskip-v4 | no disponible | MIT (SB3 Contrib) | GitHub |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada; la comparación se limita a algoritmo, entorno y disponibilidad.

## Limitaciones y advertencias

- El resultado de recompensa media (682,50 ± 168,51) está marcado como no verificado (`verified: false`) y presenta una desviación estándar elevada, lo que indica alta varianza entre episodios.
- El agente está especializado exclusivamente en SpaceInvadersNoFrameskip-v4; no generaliza a otros entornos ni tareas.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de razonamiento simbólico.
- La licencia no está declarada, por lo que el uso comercial queda en una zona gris y requiere contactar con el autor.
- El formato de pesos (`.zip` de SB3) obliga a usar Stable Baselines3 y versiones compatibles de gymnasium/ALE; cambios de versión pueden romper la carga.
- Riesgo de sobreajuste a la configuración de entrenamiento (64 entornos, 2,5 millones de pasos); los resultados pueden no reproducirse exactamente en otro hardware o versión de librerías.
- No se documentan sesgos específicos, pero como agente de RL puede exhibir comportamientos degenerados o poco robustos ante variaciones del entorno no vistas durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kvartal-13/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + Jax): https://github.com/araffin/sbx
