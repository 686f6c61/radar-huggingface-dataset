# sachinkum0009/act_policy_trash_100_ep

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Esta ficha concreta, `sachinkum0009/act_policy_trash_100_ep`, es una política entrenada con LeRobot sobre un robot `so_follower` para la tarea "Pick up the candy wrapper and put it in the bin" (recoger un envoltorio de caramelo y depositarlo en una papelera).

El modelo consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de imagen RGB de 480x640 (cámaras frontal y de muñeca), y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de robot de bajo coste.

Es relevante como ejemplo de política de imitación reproducible y desplegable con el stack LeRobot, aunque se trata de un artefacto de entrenamiento concreto (101 episodios, 65.300 frames a 30 FPS) y no de un modelo generalista. No hay resultados de evaluación publicados ni licencia declarada, lo que limita su uso en producción sin verificación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no gestiona contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que, en lugar de predecir una acción por paso, predice un chunk de acciones futuras. La arquitectura combina un codificador visual (para las dos cámaras, `front` y `wrist`, a 480x640 y 3 canales) con un transformer que fusiona las observaciones visuales y el estado articular (`observation.state`, 6 dimensiones) para generar la secuencia de acciones (`action`, 6 dimensiones). El método se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `hakami1024/wrappers_to_bin_v10_20261122_124023`: 101 episodios, 65.300 frames a 30 FPS, tarea "Pick up the candy wrapper and put it in the bin". La configuración reportada es de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número total de tokens ni si hubo etapas de RLHF/DPO (no aplica en este paradigma de imitación supervisada). No se reportan innovaciones adicionales más allá del propio action chunking.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa simultáneamente las cámaras frontal y de muñeca a 480x640.
- Ejecución de una tarea específica de pick-and-place: recoger un envoltorio y depositarlo en una papelera.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Inferencia en tiempo real con el stack LeRobot (`lerobot-rollout`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Automatización de recogida de residuos en entornos controlados: la política ejecuta la tarea de recoger un envoltorio y depositarlo en una papelera sobre un robot `so_follower`, adecuada para demostraciones de laboratorio o prototipos de limpieza.
- Base para fine-tuning con datos propios: al ser una política ACT entrenada con LeRobot, puede reentrenarse con `lerobot-train` sobre un dataset propio para adaptar la tarea (por ejemplo, otros objetos o contenedores).
- Benchmark de referencia para pipelines de imitación: sirve como ejemplo reproducible de extremo a extremo (grabación, entrenamiento, rollout) para validar una instalación de LeRobot y el hardware asociado.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del action chunking y de la configuración de entrenamiento (10.000 pasos, lr 1e-05) en la tasa de éxito de tareas de manipulación.
- Pruebas de integración hardware-software: útil para verificar la calibración de cámaras, el puerto del robot y la correspondencia de claves de observación antes de desplegar políticas más complejas.
- Educación y demos de robótica: por su tamaño reducido (51,7 M de parámetros, 0,2 GB) y su inferencia ligera, es apta para talleres y demostraciones en robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; LeRobot permite `--policy.device=cuda`, por lo que se puede usar cualquier GPU NVIDIA compatible con PyTorch.
- ¿Cabe en GPU de consumo? Sí, por tamaño (0,2 GB de pesos); se puede ejecutar en GPUs consumer, aunque el rendimiento real depende del robot y de las cámaras.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.path` apuntando al repositorio de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La captura de datos es a 30 FPS y la tarea se ejecuta con `--duration=60` en el ejemplo de la model card, pero no se reportan métricas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_policy_trash_100_ep (este) | 51,7 M | no aplica | Pick-and-place de residuos con `so_follower` | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Manipulación según dataset | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | Manipulación por difusión de acciones | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento (tasas de éxito) entre esta política y alternativas, por lo que la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasa de éxito reportada, por lo que no se puede afirmar su fiabilidad en el mundo real.
- Sesgos de dataset: entrenada con 101 episodios de una única tarea y un único tipo de robot (`so_follower`); probablemente no generaliza a otros objetos, posiciones, iluminación o robots.
- Riesgo de sobreajuste: 10.000 pasos con batch size 8 sobre 65.300 frames; el rendimiento fuera de la distribución de entrenamiento no está caracterizado.
- Licencia no declarada: la model card indica "More Information Needed", lo que impide confirmar el uso comercial.
- Dependencia de hardware y calibración: requiere que los nombres de cámara (`front`, `wrist`) y el puerto del robot coincidan con los usados en el entrenamiento.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de propósito general; cualquier uso fuera de control robótico de imitación no está soportado.
- Sin cuantizaciones documentadas ni métricas de latencia/throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachinkum0009/act_policy_trash_100_ep
- Dataset de entrenamiento: https://huggingface.co/datasets/hakami1024/wrappers_to_bin_v10_20261122_124023
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hakami1024/wrappers_to_bin_v10_20261122_124023
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
