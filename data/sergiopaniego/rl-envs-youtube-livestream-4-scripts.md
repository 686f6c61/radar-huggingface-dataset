# sergiopaniego/rl-envs-youtube-livestream-4-scripts

## Resumen

Este repositorio, publicado por sergiopaniego, no contiene un modelo de inteligencia artificial propiamente dicho, sino un conjunto de scripts de entrenamiento para agentes mediante aprendizaje por refuerzo (RL). Forma parte del material de la clase 4 del curso "Training Agents", centrada en entornos de RL con las bibliotecas TRL y OpenEnv. Incluye dos demostraciones: una integración "white-box" con el entorno Wordle mediante `environment_factory`, y un arnés "black-box" para agentes de codificación con OpenCode en sandboxes de Hugging Face.

La relevancia de este repositorio radica en que ilustra metodologías prácticas para entrenar agentes con RL, un área de creciente interés en la comunidad de IA. Al ser scripts, no se pueden extraer especificaciones de arquitectura, parámetros o contexto de modelo, ya que no es un modelo en sí. La licencia Apache 2.0 permite su uso y modificación libre, incluso con fines comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de scripts, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los scripts son independientes del idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No procede. Este repositorio no define una arquitectura de modelo ni un proceso de entrenamiento de pesos. Contiene scripts que orquestan el entrenamiento de agentes con RL utilizando TRL (Transformer Reinforcement Learning) y OpenEnv. El script `train_wordle_whitebox.py` muestra cómo entrenar un modelo base (por ejemplo, Qwen/Qwen3-1.7B) con el algoritmo GRPO sobre el entorno Wordle, mientras que el arnés OpenCode se apoya en el script `opencode_hf_sandbox.py` disponible en el repositorio principal de TRL.

## Capacidades

- No es un modelo, por lo que no posee capacidades de generación, razonamiento, código, etc.
- Proporciona scripts para entrenar agentes en entornos de RL (Wordle y OpenCode).
- Incluye ejemplos de integración "white-box" (el entrenador controla cada paso del entorno) y "black-box" (el agente interactúa con un entorno externo).
- Facilita el lanzamiento de trabajos de entrenamiento en la infraestructura de Hugging Face mediante `hf jobs uv run`.
- Permite el seguimiento del entrenamiento mediante dashboards de Trackio.

## Casos de uso

- **Aprendizaje de metodologías RL**: los scripts sirven como material didáctico para desarrolladores que quieran aprender a implementar entrenamiento de agentes con TRL y OpenEnv.
- **Entrenamiento de agentes en entornos personalizados**: el ejemplo de Wordle muestra cómo conectar un entorno arbitrario a un pipeline de RL usando `environment_factory`.
- **Evaluación de algoritmos de RL**: al modificar el modelo base o los hiperparámetros, se pueden comparar diferentes configuraciones (por ejemplo, GRPO frente a otros métodos).
- **Desarrollo de agentes de codificación**: el arnés OpenCode permite entrenar agentes que interactúan con repositorios de código en sandboxes de HF, útil para tareas de generación y edición de código.
- **Integración con infraestructura cloud**: los comandos `hf jobs` muestran cómo ejecutar entrenamientos en GPUs A100 de Hugging Face sin gestión manual de recursos.
- **Reproducción de experimentos**: al estar publicados los scripts y los dashboards, otros investigadores pueden replicar los entrenamientos y verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene métricas de rendimiento de modelos, sino scripts de entrenamiento.

## Requisitos de hardware

- Los scripts requieren una GPU con suficiente VRAM para el modelo base elegido. En el ejemplo se usa `--flavor a100-large` (A100 de 80 GB) en la infraestructura de Hugging Face.
- Para el ejemplo de Wordle con Qwen3-1.7B, una GPU con al menos 16 GB de VRAM podría ser suficiente en cuantización ligera, pero el comando oficial solicita una A100.
- El arnés OpenCode puede ejecutarse en sandboxes de HF, que ofrecen recursos limitados pero adecuados para tareas de agente.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Al no ser un modelo, no existe comparación directa con otras arquitecturas. Los scripts son específicos de TRL/OpenEnv y no tienen equivalente directo en el ecosistema de modelos.

## Limitaciones y advertencias

- No es un modelo desplegable; los scripts requieren un entorno de entrenamiento y no sirven para inferencia directa.
- La documentación es escasa: solo se incluyen comandos de ejemplo y enlaces, sin explicaciones detalladas de cada parámetro.
- Depende de bibliotecas externas (TRL, OpenEnv, VLLM) que pueden cambiar sus interfaces.
- El uso de `hf jobs` implica costes asociados a la infraestructura de Hugging Face.
- La licencia Apache 2.0 permite uso comercial, pero los modelos base utilizados (por ejemplo, Qwen) tienen sus propias licencias que deben respetarse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sergiopaniego/rl-envs-youtube-livestream-4-scripts
- Lista de reproducción del curso: https://www.youtube.com/playlist?list=PLo2EIpI_JMQvQZm-kVlz4wY1vWF0LBcf5
- Dashboard de Trackio (Wordle): https://huggingface.co/spaces/sergiopaniego/trackio-training-agents-4
- Modelo entrenado (Wordle GRPO): https://huggingface.co/sergiopaniego/qwen3-1.7b-wordle-grpo
- Blog sobre el arnés OpenCode: https://huggingface.co/blog/sergiopaniego/trl-openenv-harness-training
- Script de OpenCode en TRL: https://github.com/huggingface/trl/blob/main/examples/scripts/openenv/opencode_hf_sandbox.py
- Dashboard de OpenCode: https://huggingface.co/spaces/sergiopaniego/opencode-hf-sandbox
