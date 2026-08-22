# Atharva1232/cleanrl-ppo-LunarLander-v2

## Resumen

El modelo `Atharva1232/cleanrl-ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo (RL) entrenado mediante el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno `LunarLander-v2` de Gymnasium. Ha sido desarrollado por el usuario Atharva1232 como parte del curso de Deep Reinforcement Learning de Hugging Face (Unidad 8), utilizando la implementación de CleanRL en PyTorch. El agente aprende a controlar un módulo de aterrizaje lunar, ajustando los propulsores para aterrizar suavemente en la plataforma designada.

Se trata de un modelo pequeño, con una arquitectura de red neuronal simple (no se especifican detalles exactos en la documentación) y un total de 50.000 pasos de entrenamiento. El rendimiento reportado en la evaluación (media de recompensa de -182.76 ± 119.89 sobre 10 episodios) es claramente insuficiente para la tarea, ya que en este entorno una recompensa positiva (típicamente > 200) indica una solución aceptable. El modelo sirve principalmente como ejemplo educativo de cómo aplicar PPO con CleanRL, no como un agente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor (MLP) para RL, entrenada con PPO. No se detallan capas o neuronas en la documentación. |
| Parámetros totales | No disponible (no se informa; el repositorio tiene 0.0 GB, probablemente menos de 1 M de parámetros) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible (no se aplica cuantización a este tipo de modelo) |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | No disponible (probablemente PyTorch `.pt` o `.pth`, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura típica de un agente PPO: una red neuronal que recibe el estado del entorno (8 variables continuas que describen la posición, velocidad, ángulo, etc.) y produce una política de acción (discreta con 4 acciones: no hacer nada, encender propulsor izquierdo, derecho o principal) y una estimación del valor del estado. La implementación es la de CleanRL, una librería de RL de código abierto que proporciona archivos únicos y legibles.

El entrenamiento se realizó con el entorno `LunarLander-v2` de Gymnasium, durante 50.000 pasos totales con 8 entornos paralelos, usando una tasa de aprendizaje de 0.00025, factor de descuento gamma=0.99, lambda GAE=0.95, 4 minibatches por actualización, 4 épocas de actualización y otros hiperparámetros típicos de PPO (clip_coef=0.2, ent_coef=0.01, etc.). No se informa de técnicas como RLHF o DPO; es un entrenamiento estándar de RL.

## Capacidades

- **Control de un entorno de aterrizaje lunar**: el agente recibe el estado del entorno (posición, velocidad, ángulo, etc.) y produce una acción discreta (4 acciones) para controlar los propulsores.
- **Aprendizaje por refuerzo**: el modelo ha sido entrenado para maximizar la recompensa acumulada en el entorno, aunque el resultado obtenido es muy bajo.
- **No aplica a tareas de lenguaje, visión, tool calling o agentes generales**: es un modelo específico para un entorno de RL.

## Casos de uso

- **Educación y aprendizaje de RL**: este modelo es útil para estudiantes que quieren ver cómo se entrena un agente PPO con CleanRL, cómo se evalúa y cómo se interpretan los resultados (incluso cuando son malos). Se puede usar en notebooks de Jupyter o en scripts de Python para inspeccionar el comportamiento del agente en el entorno.
- **Comparación de hiperparámetros**: sirve como punto de referencia para experimentos en los que se modifican hiperparámetros (learning rate, número de steps, etc.) y se observa el efecto en el rendimiento final.
- **Depuración de código de RL**: al ser un modelo pequeño y de entrenamiento rápido, se puede usar para verificar que una implementación de PPO funciona correctamente antes de escalar a entornos más complejos.
- **Demostración de fallos de entrenamiento**: el resultado negativo muestra claramente un caso de convergencia deficiente, útil para analizar por qué un agente no aprende (falta de timesteps, mal ajuste de hiperparámetros, etc.).
- **Prueba de infraestructura**: se puede usar para validar que un entorno de ejecución (CPU/GPU) y las librerías (Gymnasium, PyTorch) están correctamente instaladas.
- **No recomendado para aplicaciones de producción**: el rendimiento es demasiado bajo para cualquier uso práctico en control real o simulación avanzada.

## Benchmarks y rendimiento

Según el modelo-index de la model card, el autor reporta la siguiente métrica:

| Métrica | Valor | Verificado |
|---|---|---|
| Recompensa media (mean_reward) | -182.76 ± 119.89 | No verificado |

La evaluación se realizó sobre 10 episodios. Este resultado está muy por debajo del umbral de éxito para `LunarLander-v2` (típicamente se considera que un agente resuelve el entorno si obtiene una recompensa media superior a 200). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo es muy pequeño y puede ejecutarse en CPU con memoria mínima (menos de 100 MB).
- **GPU recomendada**: ninguna, aunque se puede usar cualquier GPU para acelerar el entrenamiento si se desea, pero no es necesario.
- **Compatibilidad**: funciona en cualquier máquina con Python y PyTorch instalados.
- **Opciones de despliegue**: al ser un modelo de RL, no se despliega con vLLM, llama.cpp u Ollama. Se usa directamente con la librería de entorno (Gymnasium) y el cargador de PyTorch.
- **Latencia y throughput**: en inferencia, cada paso de acción requiere una pasada de red neuronal trivial (milisegundos en CPU). No se han medido valores exactos.

## Comparativa con modelos similares

No se dispone de otros modelos de la misma categoría (agentes PPO para LunarLander) con datos públicos comparables en la información proporcionada. Sin embargo, se puede señalar que un agente entrenado correctamente con más timesteps (por ejemplo, 500.000 pasos) suele obtener una recompensa media superior a 200, mientras que este modelo solo alcanza -182.76. La comparativa no está disponible formalmente.

## Limitaciones y advertencias

- **Rendimiento insuficiente**: el agente no ha aprendido a resolver el entorno (recompensa media negativa). No debe usarse en ningún escenario real.
- **Sesgos y alucinación**: no aplica al ser un modelo de RL, pero su comportamiento es errático y no fiable.
- **Limitaciones de contexto**: solo funciona en el entorno `LunarLander-v2`, no generaliza a otros entornos o tareas.
- **Restricciones de licencia**: la licencia no está disponible; se debe consultar al autor antes de cualquier uso comercial.
- **Caveat de producción**: no es un modelo apto para producción, solo para demostración y aprendizaje.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Atharva1232/cleanrl-ppo-LunarLander-v2)
- [Repositorio CleanRL](https://github.com/vwxyzjn/cleanrl)
- [Curso de Deep RL - Unidad 8](https://huggingface.co/deep-rl-course/unit8/introduction)
- [Entorno LunarLander-v2 en Gymnasium](https://www.gymlibrary.dev/environments/box2d/lunar_lander/) (enlace de referencia)
