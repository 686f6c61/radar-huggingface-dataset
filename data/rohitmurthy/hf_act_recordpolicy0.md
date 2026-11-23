# rohitmurthy/hf_act_recordpolicy0

## Resumen

`rohitmurthy/hf_act_recordpolicy0` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705 (Zhao et al., 2023). El modelo lo ha entrenado y subido a Hugging Face el usuario `rohitmurthy` utilizando la librería LeRobot de Hugging Face (versión 0.7.1). No es un modelo de lenguaje: es una política de control visuomotor que consume una imagen de cámara y el estado articular del robot para producir acciones de control.

La tarea concreta para la que se ha entrenado es "Insert the peg into the socket" (insertar una clavija en un receptáculo), sobre el entorno de simulación ALOHA (`lerobot/aloha_sim_insertion_human`). El modelo recibe una observación visual de 3×480×640 píxeles y un vector de estado de 14 dimensiones, y emite un vector de acción de 14 dimensiones. Cuenta con 51.685.006 parámetros y un repositorio de 0,2 GB en formato safetensors.

Su relevancia es la de un ejemplo reproducible de entrenamiento de políticas ACT con LeRobot sobre un dataset público de simulación. No hay resultados de evaluación publicados ni licencia declarada, por lo que debe tratarse como un artefacto experimental o de demostración, no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.685.006 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador visual (procesa `observation.images.top`, 3×480×640) con un transformer que fusiona la representación visual y el estado del robot (`observation.state`, 14 dimensiones) para generar una secuencia de acciones de 14 dimensiones. La innovación principal del método es el *temporal ensembling* de los chunks predichos, que suaviza las transiciones entre predicciones consecutivas.

El entrenamiento se realizó sobre el dataset `lerobot/aloha_sim_insertion_human`: 50 episodios, 25.000 frames a 50 FPS, tarea "Insert the peg into the socket". La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.7.1. No se documenta el número de tokens ni composición del dataset más allá de lo indicado, ni si hubo etapas de RLHF/DPO (no aplica a una política de imitación). El robot de destino es `aloha` con una única cámara `top`.

## Capacidades

- Control visuomotor de un robot ALOHA para la tarea de inserción de clavija en receptáculo.
- Predicción de chunks de acción de 14 dimensiones a partir de imagen (3×480×640) y estado (14 dimensiones).
- Aprendizaje por imitación a partir de demostraciones teleoperadas (dataset `aloha_sim_insertion_human`).
- Ejecución autónoma mediante `lerobot-rollout` con `--strategy.type=base` durante un tiempo configurable.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo *thinking*, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción de experimentos ACT en simulación: sirve como referencia para validar un pipeline LeRobot completo (grabación, entrenamiento, rollout) sobre ALOHA sim antes de pasar a hardware real.
- Docencia y formación en aprendizaje por imitación: el modelo y su dataset asociado permiten mostrar el flujo end-to-end de una política ACT con 50 episodios y 25.000 frames.
- Punto de partida para *fine-tuning*: al estar en formato LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio de inserción u otra tarea de manipulación.
- Pruebas de integración de `lerobot-rollout`: útil para verificar la configuración de puertos, cámaras y claves de observación en un entorno ALOHA antes de desplegar políticas más críticas.
- Benchmark interno de infraestructura: permite medir latencia y throughput de inferencia de una política ACT de ~51,7 M de parámetros en la GPU disponible.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulación para producir trayectorias y analizar el comportamiento del controlador en condiciones variadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB de repo) la huella de pesos es reducida, pero el codificador visual a 480×640 y el *temporal ensembling* incrementan el uso de memoria en tiempo de ejecución.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder ejecutar la inferencia; se recomienda CUDA por la configuración `--policy.device=cuda` del ejemplo de entrenamiento.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial ni cifras de VRAM medidas.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), con integración en el ecosistema LeRobot; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rohitmurthy/hf_act_recordpolicy0` (este) | 51.685.006 | no aplica | Inserción clavija (ALOHA sim) | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación ALOHA | según repo LeRobot | Hugging Face / GitHub |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación diversa | según repo LeRobot | Hugging Face / GitHub |
| Políticas VQ-BeT / TDMPC (LeRobot) | no disponible | no aplica | Manipulación diversa | según repo LeRobot | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tarea y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "More Information Needed", por lo que el uso comercial no está autorizado de forma explícita.
- Sin resultados de evaluación: no hay tasas de éxito ni número de ensayos, así que no se puede afirmar que la política funcione de forma fiable.
- Entrenada solo en simulación (`aloha_sim_insertion_human`): no hay evidencia de transferencia a robot real (*sim-to-real gap*).
- Tarea única y muy acotada: "Insert the peg into the socket"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de una sola cámara `top` y de un robot ALOHA con estado de 14 dimensiones; cambiar la configuración de sensores invalida la política.
- Dataset pequeño (50 episodios, 25.000 frames): riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erráticas o inseguras en el robot cuando la observación se sale de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohitmurthy/hf_act_recordpolicy0
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_insertion_human
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
