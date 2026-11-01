# BrownieSundae/ppo-LunarLander-v2

## Resumen

`BrownieSundae/ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno `LunarLander-v2` de Gymnasium, usando la librería stable-baselines3. No se trata de un modelo de lenguaje ni de un transformer generativo: es una política neuronal que controla la nave del módulo lunar en un simulador físico 2D, con el objetivo de aterrizar de forma segura entre dos banderas.

El repositorio lo publica el usuario BrownieSundae y sigue la plantilla estándar de model cards de stable-baselines3, con la sección de uso marcada como "TODO" y sin código de inferencia completo. El tamaño del repositorio es de 0.0 GB según HuggingFace, lo que sugiere pesos de red muy pequeños (coherente con una política MLP de pocas capas), aunque no se especifica la arquitectura exacta.

Su relevancia es limitada fuera del ámbito educativo y de experimentación: sirve como ejemplo de entrenamiento PPO y como artefacto reproducible para el entorno LunarLander, pero no es un modelo apto para tareas de producción. El resultado declarado en la model card (mean_reward de -181.60 +/- 55.77) indica un rendimiento pobre y no verificado, por debajo del umbral de resolución del entorno (habitualmente considerado en torno a 200 de recompensa media).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de PPO; presumiblemente MLP, no declarado) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de stable-baselines3, presumiblemente `.zip` de SB3; no confirmado) |

## Arquitectura y entrenamiento

El modelo es un agente de refuerzo entrenado con PPO, un algoritmo actor-crítico con recorte de la ratio de probabilidad (clipped surrogate objective) que estabiliza las actualizaciones de política. La implementación procede de stable-baselines3, por lo que la política y la función de valor son redes neuronales feed-forward (MLP) cuyas capas y tamaños no se detallan en la información disponible. El entorno `LunarLander-v2` proporciona observaciones continuas de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con patas) y un espacio de acciones discreto de 4 opciones (no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho).

No se especifican hiperparámetros de entrenamiento (número de timesteps, learning rate, tamaño de batch, coeficiente de entropía, número de entornos paralelos), ni la composición del dataset (en RL no hay dataset estático, sino experiencia recolectada por interacción). Tampoco se documenta si hubo ajuste fino, curriculum learning o evaluación con múltiples semillas. La model card no incluye ninguna innovación técnica destacable: es una ejecución estándar de PPO con la plantilla por defecto.

## Capacidades

- Control de política en el entorno `LunarLander-v2` de Gymnasium: selecciona una de las 4 acciones discretas en cada paso a partir de observaciones continuas de 8 dimensiones.
- Aprendizaje por refuerzo profundo: política entrenada con PPO de stable-baselines3.
- Reproducibilidad parcial: puede cargarse con `huggingface_sb3.load_from_hub` y la API de stable-baselines3 (aunque el código de ejemplo de la model card está incompleto).
- No soporta tool calling ni function calling.
- No soporta agentes multi-step en el sentido de LLM; su "razonamiento" se limita a la política de control.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo mínimo de agente PPO entrenado con stable-baselines3 para ilustrar el flujo `entrenar -> subir a HuggingFace -> cargar con huggingface_sb3` en un curso o taller.
- Reproducción de experimentos: permite comparar una ejecución concreta de PPO frente a otras semillas o hiperparámetros en LunarLander-v2, dado que el entorno es determinista en su dinámica y barato de simular.
- Baseline de referencia negativa: con un `mean_reward` de -181.60, es útil como ejemplo de política que no converge o converge a un óptimo local, para discutir en clase por qué PPO puede fallar con ciertos hiperparámetros.
- Pruebas de infraestructura de evaluación: sirve para validar pipelines de `evaluate` de stable-baselines3 y el registro de `model-index` en HuggingFace antes de entrenar agentes más costosos.
- Integración en tutoriales de `huggingface_sb3`: como artefacto de ejemplo para demostrar la carga desde el Hub en notebooks educativos.
- Benchmarking de entornos Gymnasium: útil para comprobar que la instalación de `gymnasium[box2d]` y `swig` funciona correctamente antes de lanzar entrenamientos reales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| PPO | LunarLander-v2 | mean_reward | -181.60 +/- 55.77 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con otros agentes ni desglose por semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, inferior a 1 GB; una política MLP para observaciones de 8 dimensiones y 4 acciones ocupa del orden de kilobytes a pocos megabytes en memoria.
- GPU recomendadas: no es necesario GPU; el entorno LunarLander-v2 y la política se ejecutan en CPU sin problema.
- Cabe en cualquier GPU consumer, e incluso en CPU y en entornos sin aceleración.
- Opciones de despliegue: stable-baselines3 (carga directa del `.zip`), `huggingface_sb3` para descarga desde el Hub, y `gymnasium` con el extra `box2d` para el entorno.
- Latencia y throughput: no disponibles; en CPU la inferencia por paso es del orden de microsegundos a pocos milisegundos, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BrownieSundae/ppo-LunarLander-v2 | PPO | LunarLander-v2 | no disponible | no aplica | no disponible | HuggingFace |
| sb3/ppo-LunarLander-v2 (referencia de la comunidad) | PPO | LunarLander-v2 | no disponible | no aplica | no disponible | HuggingFace |
| sb3/dqn-LunarLander-v2 | DQN | LunarLander-v2 | no disponible | no aplica | no disponible | HuggingFace |
| sb3/a2c-LunarLander-v2 | A2C | LunarLander-v2 | no disponible | no aplica | no disponible | HuggingFace |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La comparación se limita a la familia de algoritmos y al entorno.

## Limitaciones y advertencias

- Rendimiento pobre: el `mean_reward` declarado (-181.60 +/- 55.77) está lejos del umbral de resolución del entorno y sugiere una política que no aterriza de forma fiable.
- Métrica no verificada: el campo `verified` es `false` en el model-index; no hay evidencia independiente del resultado.
- Model card incompleta: la sección de uso contiene "TODO" y el código de ejemplo está truncado, por lo que la reproducibilidad no está garantizada.
- Licencia no declarada: no se especifica licencia, lo que impide un uso comercial claro y genera incertidumbre legal.
- Sin información de arquitectura ni hiperparámetros: no se puede auditar el entrenamiento ni replicarlo con fidelidad.
- Ámbito muy restringido: solo aplica al entorno LunarLander-v2; no es transferible a otras tareas sin reentrenamiento.
- Sin sesgos lingüísticos ni de alucinación en el sentido de LLM, pero sí riesgo de sobreajuste al entorno y de comportamiento frágil ante variaciones de la dinámica.
- No apto para producción: es un artefacto educativo, no un componente de sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrownieSundae/ppo-LunarLander-v2
- stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- huggingface_sb3: https://github.com/huggingface/huggingface_sb3
- Entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Paper de PPO: https://arxiv.org/abs/1707.06347
