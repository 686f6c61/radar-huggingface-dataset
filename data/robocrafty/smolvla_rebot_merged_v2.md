# RoboCrafty/smolvla_rebot_merged_V2

## Resumen

SmolVLA ReBot Merged V2 es un modelo visión-lenguaje-acción (VLA) compacto derivado de `lerobot/smolvla_base` y ajustado por RoboCrafty para control robótico de manipulación. Se trata de una política de imitación entrenada con LeRobot que consume el estado articular de un robot (6 dimensiones) y tres cámaras RGB de 256x256, y produce comandos de acción de 7 dimensiones. El modelo resuelve el problema de aprendizaje de políticas visomotoras directamente desde demostraciones humanas, sin necesidad de ingeniería de control manual.

La arquitectura subyacente SmolVLA (paper arXiv:2506.01844) es un VLA compacto diseñado para ejecutarse en hardware de consumo, con 450 millones de parámetros totales. Este ajuste concreto se ha entrenado sobre el dataset `RoboCrafty/rebot_sort_merged_V2`, compuesto por 137 episodios y 86.218 frames a 30 FPS, para dos tareas específicas de clasificación: recoger una botella y depositarla en un contenedor designado, y recoger una toalla y depositarla en el mismo contenedor.

Es relevante porque demuestra el flujo completo de ajuste fino de políticas VLA en robots de bajo coste (tipo `rebot_b601_follower`) con licencia Apache 2.0, lo que permite uso comercial y reproducción. No obstante, el modelo es altamente específico: no es un modelo de propósito general, sino una política entrenada para un robot, un conjunto de cámaras y dos tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un cabezal de acción (action expert) para generar comandos motores condicionados por observaciones visuales y una instrucción de tarea en lenguaje natural. El modelo base `lerobot/smolvla_base` está diseñado explícitamente para ser compacto y desplegable en hardware de consumo, según la model card del autor.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset `RoboCrafty/rebot_sort_merged_V2` (137 episodios, 86.218 frames, 30 FPS). La configuración de entrenamiento reportada es: 20.000 pasos, batch size 128, optimizador AdamW, learning rate 0,0001 y semilla 1000. El robot objetivo es `rebot_b601_follower`, con tres cámaras (`front_wide`, `gripper`, `high_oblique`). Las entradas son `observation.state` de forma (6,), tres imágenes de (3, 256, 256) y la salida es una acción de forma (7,). No se documentan detalles sobre la composición del dataset más allá de los dos tipos de tarea, ni sobre el uso de RLHF/DPO (no aplicable en aprendizaje por imitación de políticas).

## Capacidades

- Generación de acciones motoras de 7 dimensiones a partir de observaciones visuales multi-cámara y estado articular.
- Ejecución de dos tareas de manipulación específicas: recoger botella y depositarla en contenedor; recoger toalla y depositarla en contenedor.
- Condicionamiento por instrucción de tarea en lenguaje natural (task prompt), tal como se usa en el comando `lerobot-rollout` de ejemplo.
- Percepción visual con tres cámaras simultáneas (vista frontal amplia, pinza y vista oblicua elevada).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling ni razonamiento multi-paso general: es una política de imitación, no un agente conversacional.
- Capacidades multilingües: no disponibles; las instrucciones de tarea del dataset están en inglés.

## Casos de uso

- Clasificación automatizada de residuos en línea de recogida: el modelo puede ejecutar la secuencia de recogida y depósito de botellas y toallas en un contenedor designado, usando las tres cámaras para localizar el objeto y la pinza para el agarre.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible (Apache 2.0) para estudiar el ajuste fino de políticas VLA sobre datasets pequeños (137 episodios) y comparar hiperparámetros.
- Prototipado de robots de bajo coste: el tamaño de 450 M parámetros y el diseño compacto de SmolVLA permiten desplegar la política en hardware de consumo, reduciendo la barrera de entrada frente a VLA de mayor tamaño.
- Benchmark de manipulación en laboratorio: al estar entrenado para tareas concretas con un robot concreto (`rebot_b601_follower`), permite medir tasas de éxito y robustez ante cambios de posición, iluminación o distractores.
- Base para ajuste fino adicional: al derivar de `lerobot/smolvla_base`, puede reentrenarse con nuevos datasets para ampliar el repertorio de tareas o adaptarlo a otros objetos.
- Formación y docencia en robótica: el flujo `lerobot-train` y `lerobot-rollout` documentado permite reproducir el pipeline completo de grabación, entrenamiento y ejecución en un entorno controlado.
- Integración en pipelines de evaluación de políticas: el formato safetensors y la librería LeRobot facilitan la carga programática para pruebas automatizadas de éxito/fallo por episodio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros, la inferencia en precisión completa requiere aproximadamente 1,8 GB solo para pesos, más memoria para activaciones y tres flujos de imagen de 256x256.
- GPU recomendadas: no especificadas por el autor; el diseño de SmolVLA apunta a hardware de consumo, por lo que una GPU consumer con suficiente VRAM podría ser viable, aunque no se confirma un modelo concreto.
- Cabe en GPU consumer: probablemente sí según el diseño del modelo base, pero no hay confirmación oficial para este ajuste concreto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=RoboCrafty/smolvla_rebot_merged_V2`), según la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboCrafty/smolvla_rebot_merged_V2 | 450 M | no disponible | Política VLA para 2 tareas de clasificación | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | Modelo base VLA preentrenado | no disponible | Hugging Face (modelo base citado) |
| Alternativas VLA de mayor tamaño | no disponible | no disponible | Políticas VLA generales | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Especificidad extrema: la política está entrenada para un robot concreto (`rebot_b601_follower`), tres cámaras concretas y dos tareas concretas; no generaliza a otros robots, configuraciones de cámara u objetos sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, lo que impide estimar su fiabilidad en producción.
- Riesgo de sobreajuste al dataset: con solo 137 episodios y 86.218 frames, la diversidad de posiciones, iluminación y distractores es limitada; el comportamiento fuera de la distribución del dataset es incierto.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser una política visomotora, puede fallar de forma sistemática ante condiciones visuales no representadas.
- Dependencia del prompt de tarea: el modelo espera instrucciones de tarea en inglés tal como aparecen en el dataset; instrucciones distintas pueden degradar el comportamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sin variantes cuantizadas publicadas: no hay GGUF ni otras cuantizaciones, lo que limita el despliegue en entornos con restricciones de memoria no soportadas por LeRobot.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/smolvla_rebot_merged_V2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/rebot_sort_merged_V2
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/rebot_sort_merged_V2
