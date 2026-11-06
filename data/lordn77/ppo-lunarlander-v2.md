# LordN77/ppo-LunarLander-v2

## Resumen

`LordN77/ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno `LunarLander-v2` de Gymnasium. No es un modelo de lenguaje: es una política neuronal que controla la nave del simulador Box2D con el objetivo de aterrizar de forma segura en la plataforma designada. Lo desarrolla el usuario LordN77 como parte del curso práctico de Deep Reinforcement Learning de Hugging Face (Unidad 1) y se publica con la librería Stable-Baselines3.

El entrenamiento se realizó desde cero durante 1.015.808 pasos de tiempo, empleando Gymnasium 0.29.1 y Stable-Baselines3 2.3.2. La política alcanza una recompensa media de 247,41 ± 20,43 en 10 episodios de evaluación deterministas (semilla 1000), lo que supera el umbral de resolución del entorno (200 puntos) y la puntuación del curso (226,98). El repositorio tiene un tamaño de 0,0 GB, coherente con un checkpoint de una red pequeña.

Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo reproducible de un pipeline completo de RL (entrenamiento PPO, evaluación determinista y publicación en el Hub). No debe confundirse con un modelo fundacional ni usarse para tareas de generación de texto, visión o razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO (MLP de actor-crítico, según Stable-Baselines3) |
| Parametros totales | no disponible (checkpoint de 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observación de 8 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.zip` (checkpoint de Stable-Baselines3) |

## Arquitectura y entrenamiento

El agente utiliza PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (clipped surrogate objective) que estabiliza las actualizaciones. La implementación corresponde a Stable-Baselines3 2.3.2, que emplea por defecto una política `MlpPolicy` con dos capas ocultas de 64 unidades y una cabeza de valor compartida o separada según configuración. La observación del entorno `LunarLander-v2` tiene 8 dimensiones (posición, velocidad, ángulo y contacto de las patas) y la acción es discreta con 4 opciones (no hacer nada, encender motor izquierdo, principal o derecho).

El entrenamiento se ejecutó durante 1.015.808 timesteps con Gymnasium 0.29.1 y Box2D. No se documenta en la model card el uso de RLHF, DPO ni técnicas de decodificación especulativa, ya que no aplican a este dominio. La evaluación se realizó con 10 episodios deterministas y semilla 1000, reportando recompensa media y desviación típica. No se especifican hiperparámetros (learning rate, tamaño de rollout, número de épocas) ni la composición del dataset, porque en RL el "dataset" es la experiencia generada por interacción con el simulador.

## Capacidades

- Control de un agente en el entorno `LunarLander-v2`: aterrizaje de una nave en una plataforma con gravedad y física Box2D.
- Toma de decisiones secuenciales con acciones discretas (4 acciones posibles).
- Política determinista evaluable con `model.predict(obs, deterministic=True)`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step fuera del propio bucle del entorno.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio.
- Compatible con el ecosistema Stable-Baselines3 y Gymnasium para carga e inferencia.

## Casos de uso

- Docencia de RL: reproducción del flujo completo de la Unidad 1 del curso de Hugging Face, cargando el checkpoint y evaluándolo con `PPO.load`.
- Baseline de comparación: referencia de recompensa media (247,41) para comparar con otros agentes PPO entrenados en `LunarLander-v2`.
- Pruebas de infraestructura de evaluación: validar pipelines de evaluación determinista y semillas reproducibles en entornos Gymnasium con Box2D.
- Demostración de despliegue en el Hub: ejemplo de publicación de un checkpoint `.zip` con `hf_hub_download` y carga en CPU.
- Investigación de estabilidad de PPO: análisis de la varianza de recompensa (±20,43) en 10 episodios para estudiar robustez de la política.
- Integración en notebooks educativos: uso en Google Colab o Kaggle para visualizar episodios de aterrizaje y comparar políticas.
- Pruebas de inferencia ligera: ejecución en CPU sin GPU, útil para entornos con recursos limitados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | 247,41 ± 20,43 |
| reinforcement-learning | LunarLander-v2 | Puntuación del curso (media − desviación) | 226,98 |

No se han publicado otros resultados de benchmarks en la información disponible. El umbral de resolución de `LunarLander-v2` es 200 puntos; este agente lo supera tanto en media como en la puntuación del curso.

## Requisitos de hardware

- VRAM estimada: no aplica; el checkpoint es de 0,0 GB y se carga en CPU (`device="cpu"` en el ejemplo de la model card).
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente para inferencia.
- Cabe en GPU consumer: sí, aunque no es necesario; también funciona en CPU.
- Opciones de despliegue: Stable-Baselines3 con Gymnasium 0.29.1 y Box2D; carga mediante `huggingface_hub.hf_hub_download`.
- Latencia y throughput: no disponibles; al ser una MLP pequeña, la inferencia por paso es del orden de microsegundos a milisegundos en CPU, pero no se documentan cifras.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LordN77/ppo-LunarLander-v2 | LunarLander-v2 | PPO (SB3) | 247,41 ± 20,43 | no disponible | Hugging Face |
| janvi-ai/ppo-LunarLander-v2 | LunarLander-v2 | PPO (SB3) | no disponible en la información | no disponible | Hugging Face |
| poplolioi11/deep-rl-unit1-ppo-LunarLander-v2-20261105 | LunarLander-v2 | PPO (SB3) | no disponible en la información | no disponible | Hugging Face |

Los dos modelos alternativos aparecen en la búsqueda web como agentes PPO para el mismo entorno y la misma librería, pero no se dispone de sus métricas de recompensa ni de sus licencias en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un agente de RL en un simulador físico, no hay sesgos lingüísticos, pero la política puede sobreajustarse a la distribución de estados vista durante el entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje; sin embargo, la política puede tomar acciones subóptimas en estados no visitados durante el entrenamiento.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje natural; su dominio se restringe a `LunarLander-v2`.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Caveats para producción: el modelo no está verificado (`verified: false` en el model-index), el repositorio tiene 0 descargas y 0 likes, y no se documentan hiperparámetros ni semillas de entrenamiento, lo que dificulta la reproducibilidad exacta.
- Dependencia de versiones: requiere Gymnasium 0.29.1 con Box2D y Stable-Baselines3 2.3.2; otras versiones pueden romper la carga del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/LordN77/ppo-LunarLander-v2
- Curso de Deep RL, Unidad 1: https://huggingface.co/learn/deep-rl-course/unit1/hands-on
- Modelo comparable (janvi-ai): https://huggingface.co/janvi-ai/ppo-LunarLander-v2
- Modelo comparable (poplolioi11): https://huggingface.co/poplolioi11/deep-rl-unit1-ppo-LunarLander-v2-20261105
