# Haku-2004/act_subtask_k4_2_4seg

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la tasa de éxito en tareas de manipulación robótica. Este repositorio concreto, `Haku-2004/act_subtask_k4_2_4seg`, es una política entrenada con LeRobot sobre el robot `so_follower` (SO-100/SO-101 de bajo coste) para una tarea de manipulación de una caja de tareas ("taskbox").

El modelo no es un LLM ni un modelo de lenguaje: es una política visomotora que consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de imagen RGB de 480x640 (cámaras `front` y `side`), y produce un vector de acción de 6 dimensiones. Con 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real a 30 FPS en hardware de consumo.

Su relevancia es práctica para la comunidad de robótica open source: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento con ACT y despliegue en robot real) con licencia Apache 2.0, aunque con un dataset muy pequeño (15 episodios, 18.566 frames) y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; ventana de observación definida por la configuración de ACT, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (modelo visomotor, no procesa lenguaje natural como entrada principal; la tarea se pasa como cadena de texto en el rollout) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que combina un backbone visual (encoder de imágenes de las cámaras `front` y `side`) con un decoder que genera un chunk de acciones futuras en lugar de una sola acción por paso. Esta predicción por chunks mitiga el error de compounding y permite un control más suave. La entrada de estado es un vector de 6 dimensiones (`observation.state`) y la salida es un vector de acción de 6 dimensiones (`action`), adecuado para el robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.5.2 durante 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset `Haku-2004/k4_2_4seg` contiene 15 episodios y 18.566 frames a 30 FPS, con las tareas etiquetadas como "“taskbox”" y "taskbox". No se documenta el uso de RLHF, DPO ni otras fases de alineación; es aprendizaje por imitación supervisado a partir de datos de teleoperación. No se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor para manipulación robótica: predice chunks de acciones de 6 dimensiones a partir de estado articular e imágenes.
- Procesamiento de dos cámaras RGB simultáneas (`front` y `side`) a 480x640.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución en tiempo real a 30 FPS sobre el robot `so_follower`.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No es un modelo multilingüe ni de generación de texto; la cadena de tarea se usa solo como condicionamiento del rollout.

## Casos de uso

- Manipulación de una caja de tareas ("taskbox"): la política ejecuta la secuencia aprendida de recogida y colocación sobre el robot `so_follower`, usando las cámaras `front` y `side` para localizar el objeto.
- Prototipado rápido de políticas de imitación: sirve como plantilla para entrenar ACT con `lerobot-train` sobre datasets propios y validar el pipeline completo antes de escalar.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del tamaño del dataset (15 episodios) y del chunking de acciones en la tasa de éxito.
- Docencia y laboratorios de robótica: modelo ligero (0,2 GB, ~51,7 M parámetros) que cabe en una GPU de consumo y permite reproducir el flujo de LeRobot en aulas.
- Benchmark de referencia para SO-100/SO-101: punto de partida para comparar variantes de ACT, configuraciones de cámaras o hiperparámetros.
- Despliegue en robot de bajo coste: inferencia a 30 FPS con `lerobot-rollout --strategy.type=base` para pruebas de 60 segundos sin grabación de episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M parámetros en FP32 el peso ronda los 0,2 GB, por lo que el cuello de botella es el encoder visual y el procesamiento de dos imágenes de 480x640, no los pesos.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, incluyendo RTX 3060/4060 y superiores.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 o superiores; no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot), con `--policy.path=Haku-2004/act_subtask_k4_2_4seg`; requiere robot `so_follower` y dos cámaras OpenCV a 640x480 y 30 FPS.
- Latencia y throughput: no disponibles; el entrenamiento y la inferencia se plantean a 30 FPS, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_subtask_k4_2_4seg` | 51,7 M | No disponible | Manipulación "taskbox" en `so_follower` | Apache 2.0 | HuggingFace (0 descargas) |
| ACT (método original, paper 2304.13705) | No disponible | No disponible | Aprendizaje por imitación general | No disponible | Paper + código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | No disponible en esta ficha | No disponible | Manipulación robótica | No disponible | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 15 episodios y 18.566 frames, lo que limita la generalización a posiciones, iluminación o distracciones no vistas.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Etiquetas de tarea inconsistentes en la model card ("“taskbox”" con comillas tipográficas y "taskbox" sin ellas), lo que puede afectar al condicionamiento durante el rollout.
- Específico del robot `so_follower` y de la configuración de cámaras `front`/`side` a 480x640; no es transferible directamente a otros robots o montajes sin reentrenamiento.
- Riesgo de sobreajuste y de fallo ante cambios de entorno; el método ACT no incorpora mecanismos explícitos de robustez más allá del chunking.
- No procesa lenguaje natural como entrada principal ni soporta tool calling; la cadena de tarea es solo condicionamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el tamaño del dataset desaconsejan su uso en producción sin validación adicional.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas aplicables, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Haku-2004/act_subtask_k4_2_4seg
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k4_2_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k4_2_4seg
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
