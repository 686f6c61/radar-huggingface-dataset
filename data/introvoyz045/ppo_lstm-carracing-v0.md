# introvoyz045/ppo_lstm-CarRacing-v0

## Resumen

El modelo `introvoyz045/ppo_lstm-CarRacing-v0` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo RecurrentPPO (PPO con memoria LSTM) para resolver el entorno `CarRacing-v0` de Gymnasium. El agente aprende a conducir un coche en un circuito a partir de observaciones visuales (píxeles), controlando aceleración, freno y dirección. Fue desarrollado por el usuario `introvoyz045` utilizando la librería `stable-baselines3` y el framework de entrenamiento RL Zoo, que permite reproducir el entrenamiento y cargar el agente preentrenado.

Este modelo es relevante como ejemplo de aplicación de RL con políticas recurrentes (CnnLstmPolicy) sobre un entorno de control continuo con observaciones de imagen. Aunque no se trata de un modelo de lenguaje, su interés radica en demostrar cómo la memoria recurrente mejora el rendimiento en tareas que requieren integración temporal de información visual. El repositorio contiene únicamente la model card y los metadatos; no se han subido los pesos del modelo (tamaño del repo: 0.0 GB), por lo que la reproducibilidad depende de la descarga desde el repositorio original de SB3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CnnLstmPolicy (red convolucional + LSTM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente RL, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo no contiene archivos de pesos) |

## Arquitectura y entrenamiento

El agente utiliza una política `CnnLstmPolicy` de stable-baselines3, que combina una red convolucional para procesar observaciones de imagen (reescaladas a 64x64 en escala de grises, con `frame_stack=2`) con una capa LSTM de 128 unidades para capturar dependencias temporales. La política incluye una función de activación GELU y `log_std_init=-2`, con `ortho_init=False`. El crítico no usa LSTM (`enable_critic_lstm=False`).

El entrenamiento se realizó con el algoritmo PPO (Proximal Policy Optimization) durante 4 millones de timesteps, usando 8 entornos paralelos, `batch_size=128`, `n_steps=512`, `n_epochs=10`, `gamma=0.99`, `gae_lambda=0.95` y `clip_range=0.2`. Se empleó exploración basada en SDE (State-Dependent Exploration) con `sde_sample_freq=4` y normalización de recompensas (`norm_reward=True`). El aprendizaje se configuró con una tasa lineal decreciente desde 1e-4.

## Capacidades

- Conducción autónoma en el entorno `CarRacing-v0`: controla aceleración, freno y dirección (acciones continuas).
- Procesamiento de observaciones visuales: imágenes en escala de grises de 64x64 píxeles, apiladas en 2 frames.
- Memoria recurrente: la capa LSTM permite al agente recordar información a lo largo de la secuencia de observaciones, mejorando el manejo de curvas y la planificación de trayectorias.
- Rendimiento declarado: recompensa media de 880.39 ± 31.90 en el entorno, superando el umbral de 900 puntos que se considera "resolver" el entorno en muchas referencias (aunque el valor está ligeramente por debajo).
- No tiene capacidades de lenguaje, generación de texto, tool calling ni visión general; es un agente especializado en una tarea de control.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el efecto de la recurrencia en políticas PPO sobre entornos de control visual.
- Benchmark de algoritmos: permite comparar el rendimiento de RecurrentPPO frente a otras variantes (PPO estándar, A2C, etc.) en `CarRacing-v0`.
- Demostración educativa: útil para cursos y tutoriales de RL, mostrando cómo entrenar y evaluar agentes con stable-baselines3 y RL Zoo.
- Reproducción de experimentos: al estar basado en RL Zoo, se puede reentrenar con los hiperparámetros publicados y verificar la reproducibilidad.
- Prueba de infraestructura de inferencia: aunque no hay pesos subidos, el modelo puede descargarse desde el repositorio original de SB3 para probar pipelines de despliegue de agentes RL.
- Estudio de exploración con SDE: el uso de SDE en el entrenamiento puede analizarse para entender su impacto en la estabilidad del aprendizaje.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card (no verificado de forma independiente):

| Entorno | Algoritmo | Metrica | Valor |
|---|---|---|---|
| CarRacing-v0 | RecurrentPPO | mean_reward | 880.39 ± 31.90 |

No se han publicado comparaciones con otros agentes en la información disponible. El valor de recompensa media está cerca del umbral de 900 puntos que suele considerarse como "resolver" el entorno, aunque no lo alcanza de forma consistente.

## Requisitos de hardware

- Inferencia: al ser un agente RL con una red pequeña (CNN + LSTM de 128), la inferencia es ligera y puede ejecutarse en CPU sin problemas. No se requieren GPUs para evaluar el agente.
- Entrenamiento: el entrenamiento original usó 8 entornos paralelos y 4 millones de timesteps; en una GPU moderna (por ejemplo, RTX 3060 o superior) puede completarse en horas, pero no se especifican requisitos exactos.
- Despliegue: el modelo se carga mediante stable-baselines3 (`PPO.load`) o a través de RL Zoo (`rl_zoo3.load_from_hub`). No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia: no disponible; depende del hardware y del número de entornos en paralelo.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros agentes en la información proporcionada. El modelo más similar es el original `sb3/ppo_lstm-CarRacing-v0` de Stable Baselines3, que probablemente sirvió de base para esta re-subida. Ambos comparten la misma arquitectura y entorno, pero no se han publicado métricas comparativas entre ellos.

| Modelo | Autor | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|
| introvoyz045/ppo_lstm-CarRacing-v0 | introvoyz045 | 880.39 ± 31.90 | no disponible | Repo sin pesos |
| sb3/ppo_lstm-CarRacing-v0 | SB3 | no disponible | MIT (stable-baselines3) | Pesos disponibles |

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo (tamaño 0.0 GB); solo la model card. Para usar el agente es necesario descargar los pesos desde el repositorio original de SB3.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- El modelo está especializado exclusivamente en el entorno `CarRacing-v0`; no es generalizable a otras tareas de conducción o control.
- El rendimiento declarado (880.39) no está verificado de forma independiente y proviene de una única ejecución de entrenamiento.
- El entorno `CarRacing-v0` tiene una recompensa máxima teórica de 1000 puntos, pero el agente no la alcanza de forma consistente; puede fallar en circuitos complejos.
- Al ser un agente RL, no tiene capacidades de lenguaje ni interacción con texto; cualquier uso fuera del entorno simulado no es aplicable.
- La fecha de creación (2026-08-28) es futura, lo que sugiere que el modelo puede ser una subida reciente o una copia con metadatos alterados; se recomienda verificar la autenticidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/introvoyz045/ppo_lstm-CarRacing-v0
- Modelo original de SB3: https://huggingface.co/sb3/ppo_lstm-CarRacing-v0
- Repositorio de stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- Repositorio de RL Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Documentación de PPO en stable-baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
