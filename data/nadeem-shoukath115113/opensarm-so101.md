# Nadeem-Shoukath115113/opensarm-so101

## Resumen

OpenSARM SO-101 es un proyecto de entrenamiento de un modelo de recompensa (reward model) denominado SARM2, diseñado específicamente para la tarea de plegado de tela bimanual con el brazo robótico SO-101 (también conocido como SO-ARM100). El repositorio contiene el código, la configuración y un checkpoint de la primera etapa de entrenamiento, junto con las instrucciones para entrenar la segunda etapa. El modelo no es un modelo de lenguaje ni un sistema de IA generativa, sino un componente de un pipeline de aprendizaje por refuerzo para robótica.

El proyecto se apoya en LeRobot v2.1 (biblioteca de robótica de Hugging Face) y utiliza un enfoque en dos etapas: una primera etapa con un ActionTransformer que clasifica 22 primitivas de acción, y una segunda etapa con un RewardTransformer basado en mezcla de expertos (MoE) que predice una recompensa de progreso de tarea en el intervalo [0, 1]. El checkpoint incluido corresponde a la primera etapa (act_pri) con una pérdida de validación de 0.538. El dataset de entrenamiento consta de 162 episodios, 72 000 fotogramas y 3 cámaras.

La relevancia de este proyecto radica en que aborda un problema abierto en robótica: la estimación de recompensas densas para tareas de manipulación deformable (como plegar tela) sin necesidad de supervisión humana explícita. Al ser un proyecto de código abierto, permite a otros investigadores reproducir y extender el entrenamiento de reward models para tareas similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ActionTransformer (etapa 1) y MoE RewardTransformer (etapa 2) |
| Parametros totales | no disponible (el checkpoint de etapa 1 pesa 163 MB) |
| Parametros activos | no disponible (arquitectura MoE en etapa 2, sin detalle de expertos) |
| Longitud de contexto | no aplica (modelo de vision-robotica, no procesa texto) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch .pt, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El proyecto define dos etapas de entrenamiento. La primera etapa utiliza un ActionTransformer que clasifica 22 primitivas de acción a partir de observaciones visuales (3 cámaras) y posiblemente estados del robot. El checkpoint incluido (`act_pri_step_002000_loss_0.538.pt`) corresponde a esta etapa, con una pérdida de validación de 0.538. La segunda etapa entrena un RewardTransformer con arquitectura de mezcla de expertos (MoE) que predice una recompensa de progreso de tarea en el intervalo [0, 1]. Esta recompensa se utilizaría para guiar el aprendizaje por refuerzo del policy de plegado.

El entrenamiento se realiza con el framework LeRobot v2.1 (vendido en el repositorio). Los datos provienen de dos datasets separados (`so101_act_pri_v2` y `so101_sarm2_v2`) que deben descargarse de Hugging Face. El dataset total contiene 162 episodios, 72 000 fotogramas y 3 cámaras. No se especifican detalles sobre el número total de parámetros, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal reside en el diseño del reward model basado en MoE para estimar progreso en tareas de manipulación deformable.

## Capacidades

- Predicción de recompensa de progreso de tarea (valor continuo en [0, 1]) para tareas de plegado de tela bimanual.
- Clasificación de primitivas de acción (22 clases) a partir de observaciones visuales y posiblemente estados del robot.
- Procesamiento de datos visuales de múltiples cámaras (3 cámaras en el dataset).
- Integración con el ecosistema LeRobot para entrenamiento y evaluación de políticas robóticas.
- Soporte de entrenamiento en GPU con 20 GB o más de VRAM (RTX 3090, 4090, A5000, etc.).
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente ni soporta tool calling.

## Casos de uso

- Aprendizaje por refuerzo para manipulación robótica deformable: el reward model SARM2 proporciona una señal de recompensa densa para entrenar políticas de plegado de tela, evitando la necesidad de diseñar funciones de recompensa manuales.
- Evaluación automática de progreso en tareas robóticas: el modelo puede usarse para monitorizar el avance de un episodio de plegado en tiempo real, útil para sistemas de control basados en recompensas.
- Entrenamiento de políticas con aprendizaje por imitación: la etapa 1 (ActionTransformer) puede servir para inicializar políticas de acción a partir de demostraciones humanas.
- Investigación en reward models para robótica: el código y los checkpoints permiten reproducir y extender el enfoque MoE para otras tareas de manipulación.
- Benchmarking de algoritmos de RL en robótica: el modelo puede integrarse en entornos de simulación (por ejemplo, Isaac Sim) para comparar algoritmos de aprendizaje por refuerzo.
- Desarrollo de sistemas de plegado autónomo: el modelo puede formar parte de un pipeline completo que incluya percepción, planificación y control para robots domésticos o industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida de validación de la etapa 1 (0.538) para la clasificación de 22 primitivas de acción. No hay comparaciones con otros modelos de recompensa ni métricas estándar de LLM (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: 20 GB o más para entrenamiento (según la documentación del proyecto). Para inferencia no se especifica, pero al ser un modelo de visión relativamente pequeño (checkpoint de 163 MB), podría ejecutarse en GPUs con menos VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A5000 o similares con 20 GB+ de VRAM.
- RAM: 16 GB o más.
- Opciones de despliegue: el proyecto proporciona scripts de entrenamiento (`train.py`) y evaluación (`eval.py`). No se mencionan herramientas de inferencia como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El entrenamiento de la etapa 2 tarda entre 2 y 4 horas en una GPU rápida.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos de recompensa comparables en la información proporcionada. El proyecto es específico para la tarea de plegado de tela con el robot SO-101 y no se dispone de datos sobre alternativas equivalentes.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para la tarea de plegado de tela bimanual con el robot SO-101; no es generalizable a otras tareas sin reentrenamiento.
- Los datasets necesarios para el entrenamiento deben descargarse por separado; el repositorio no los incluye.
- La licencia no está especificada, por lo que el uso comercial puede estar restringido o requerir contacto con el autor.
- El checkpoint incluido corresponde solo a la etapa 1; la etapa 2 (MoE RewardTransformer) debe entrenarse con los datos y configuraciones proporcionados.
- No se proporcionan métricas de rendimiento en tareas reales de plegado, solo la pérdida de validación de la etapa 1.
- El proyecto depende de LeRobot v2.1 y de la biblioteca `pyav` para el backend de video; pueden existir problemas de compatibilidad con otros sistemas.
- No es un modelo de lenguaje: no puede utilizarse para generación de texto, razonamiento simbólico ni tareas de NLP.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nadeem-Shoukath115113/opensarm-so101
- Perfil del autor: https://huggingface.co/Nadeem-Shoukath115113
- Datasets del autor: https://huggingface.co/Nadeem-Shoukath115113/datasets
- Documentación de SO-101 en LeRobot: https://huggingface.co/docs/lerobot/so101
- Repositorio del robot SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
- Especificaciones del SO-101: https://www.roboticscenter.ai/hardware/so-101/specs
- Taller Sim-to-Real SO-101 (DeepWiki): https://deepwiki.com/isaac-sim/Sim-to-Real-SO-101-Workshop/3.1-so-arm101-robot-model
