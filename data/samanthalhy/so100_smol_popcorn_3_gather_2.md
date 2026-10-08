# samanthalhy/so100_smol_popcorn_3_gather_2

## Resumen

El modelo `samanthalhy/so100_smol_popcorn_3_gather_2` es una política de visión-lenguaje-acción (VLA) entrenada con LeRobot y afinada a partir de `lerobot/smolvla_base`. Se trata de un ajuste fino específico para controlar un robot manipulador SO-100 (configuración `so100_follower`) en la tarea denominada `popcorn_3_gather_2`, descrita en el dataset del mismo autor. Con 450.046.212 parámetros y un repositorio de 0,9 GB en formato safetensors, es un modelo compacto pensado para ejecutarse en hardware de consumo.

La arquitectura de partida, SmolVLA (paper arXiv:2506.01844), se define como un modelo VLA compacto y eficiente que busca rendimiento competitivo con coste computacional reducido. Este checkpoint concreto no es un modelo de propósito general, sino una política robótica especializada en una tarea de recogida o agrupación de objetos (popcorn) sobre una plataforma SO-100.

Su relevancia radica en demostrar el flujo de trabajo de ajuste fino de políticas VLA de bajo coste en LeRobot, publicadas directamente en el Hub de Hugging Face. Al estar bajo licencia Apache-2.0, es reutilizable tanto para investigación como para despliegue en entornos de robótica de bajo presupuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); ajuste fino de SmolVLA |
| Parametros totales | 450.046.212 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política de visión-lenguaje-acción derivada de `lerobot/smolvla_base`, la implementación de referencia de SmolVLA descrita en el paper arXiv:2506.01844. SmolVLA se presenta como una arquitectura VLA compacta y eficiente, orientada a obtener resultados competitivos con un coste computacional reducido y capaz de desplegarse en hardware de consumo. No se dispone de detalles adicionales sobre la composición interna de capas, el codificador visual o el mecanismo de acción en la información proporcionada.

El entrenamiento se ha realizado con la librería LeRobot sobre el dataset `samanthalhy/so100_popcorn_3_gather_2`, que define la tarea robótica concreta sobre un robot SO-100. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas de este ajuste fino más allá de las propias del modelo base SmolVLA.

## Capacidades

- Generación de acciones de control robótico para el robot SO-100 en configuración `so100_follower`.
- Ejecución de la tarea concreta `popcorn_3_gather_2`, aprendida por imitación a partir del dataset asociado.
- Procesamiento multimodal de visión y lenguaje como entrada para producir acciones (naturaleza VLA).
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación o inferencia (`lerobot-record`).
- Despliegue en hardware de consumo según las características del modelo base SmolVLA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Manipulación robótica de recogida de objetos: el modelo ejecuta la política `popcorn_3_gather_2` sobre un SO-100 para agrupar objetos tipo "popcorn", ideal como referencia de tarea de pick-and-place.
- Investigación en aprendizaje por imitación: sirve como ejemplo reproducible de ajuste fino de una política VLA con LeRobot sobre un dataset propio.
- Prototipado de robots de bajo coste: al derivar de SmolVLA y pesar 0,9 GB, permite experimentar con VLA en plataformas SO-100 sin GPU de gama alta.
- Evaluación de políticas robóticas: se puede usar con `lerobot-record` y `--policy.path` para medir el rendimiento en episodios reales sobre el robot físico.
- Comparación de checkpoints: útil como punto de partida frente a otros ajustes de `lerobot/smolvla_base` para la misma tarea u otras similares.
- Formación y docencia: sirve de ejemplo completo del ciclo train-record-inference en LeRobot para cursos de robótica.
- Automatización de tareas repetitivas de laboratorio: aplicar la política en un banco de pruebas con SO-100 para tareas de recogida controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de éxito de tarea, tasas de acierto ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parámetros, los pesos en bf16/fp16 ocupan aproximadamente 0,9 GB; sumando activaciones del codificador visual se estima un uso del orden de 2 a 4 GB, valor orientativo no confirmado en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; por las características de SmolVLA, se apunta a hardware de consumo (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Compatibilidad con GPU de consumo: sí, es uno de los objetivos declarados del modelo base SmolVLA.
- Opciones de despliegue: LeRobot (comandos `lerobot-train` y `lerobot-record`), con soporte de ejecución en dispositivo CUDA (`--policy.device=cuda`). No se documentan otros servidores de inferencia como vLLM, llama.cpp o TGI para esta política.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| samanthalhy/so100_smol_popcorn_3_gather_2 | 450.046.212 | no disponible | apache-2.0 | Hugging Face |
| lerobot/smolvla_base (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Otros ajustes de SmolVLA para tareas SO-100 | no disponible | no disponible | apache-2.0 (habitual) | Hugging Face |

No se dispone de datos de rendimiento comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una política especializada en una única tarea (`popcorn_3_gather_2`) y una única plataforma (SO-100 en configuración `so100_follower`); no es un modelo de propósito general.
- No hay datos publicados sobre sesgos, tasas de fallo ni robustez ante variaciones de iluminación, posición de objetos o cambios en el entorno.
- Riesgo de alucinación y errores de política: no evaluado en la información disponible; en robótica, una acción errónea puede tener consecuencias físicas.
- No se documentan idiomas soportados ni longitud de contexto, lo que dificulta evaluar su comportamiento ante instrucciones en lenguaje natural variables.
- Registro con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base `lerobot/smolvla_base` y del dataset utilizado.
- Para producción, se debe validar la política en el robot real y disponer de mecanismos de seguridad (paradas de emergencia, límites de par) dado el carácter físico de las acciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samanthalhy/so100_smol_popcorn_3_gather_2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset asociado: https://huggingface.co/datasets/samanthalhy/so100_popcorn_3_gather_2
