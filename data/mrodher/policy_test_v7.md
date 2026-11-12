# mrodher/policy_test_V7

## Resumen

`mrodher/policy_test_V7` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y distribuida a través de la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje, sino de un controlador visomotor que consume el estado articular de un robot SO-101 (6 dimensiones) y dos cámaras (vista superior y muñeca, 3x480x640 cada una) para producir comandos de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB.

El modelo resuelve una tarea concreta de manipulación: "put the beige piece on the aruco" (colocar la pieza beige sobre el marcador ArUco). Fue entrenado con 160 episodios y 50.370 fotogramas a 30 FPS capturados por teleoperación sobre un robot `so_follower`. Su relevancia es la de un artefacto de referencia para el ecosistema LeRobot: demuestra el flujo completo de grabación de datos, entrenamiento con ACT y despliegue en hardware real.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de evaluación publicados. Debe interpretarse como una política experimental de un solo task, no como un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.2 |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `top`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | `mrodher/so101_dataset_test_V7_20261112_094339` (160 episodios, 50.370 fotogramas, 30 FPS) |
| Tarea | "put the beige piece on the aruco" |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso, el modelo predice un chunk de acciones futuras, lo que reduce el error de acumulación y estabiliza el control. La arquitectura combina un codificador de observaciones (estado articular más imágenes de las cámaras `top` y `wrist`) con un transformer que genera las secuencias de acción. El modelo tiene 51,7 millones de parámetros y pesos en formato safetensors.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, con batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. Los datos provienen de 160 episodios teleoperados (50.370 fotogramas a 30 FPS) sobre un robot SO-101 con dos cámaras. No se documenta el uso de RLHF, DPO ni ningún proceso de refinamiento posterior; se trata de imitación supervisada pura sobre un único task. No se especifica composición del dataset más allá de la tarea ni aumentos de datos.

## Capacidades

- Control visomotor de un robot SO-101 (`so_follower`) a partir de estado articular de 6 dimensiones y dos cámaras RGB de 480x640.
- Predicción de chunks de acción de 6 dimensiones para la tarea "put the beige piece on the aruco".
- Aprendizaje por imitación a partir de datos teleoperados, sin recompensa explícita.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con estrategia `base`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Replicación de la tarea de pick-and-place: el modelo coloca la pieza beige sobre el marcador ArUco en un entorno controlado con un SO-101, usando las cámaras `top` y `wrist` como única entrada visual.
- Validación de pipelines de LeRobot: sirve como referencia para comprobar que la instalación, la calibración del robot y la configuración de cámaras funcionan antes de entrenar políticas propias.
- Base para fine-tuning con nuevos datasets: al ser una política ACT ya entrenada, puede reutilizarse como punto de partida para tareas similares de manipulación sobre el mismo robot.
- Docencia y experimentación en aprendizaje por imitación: permite demostrar el ciclo completo teleoperación, entrenamiento y despliegue en hardware de bajo coste.
- Pruebas de integración de `lerobot-rollout`: útil para verificar el script de despliegue con estrategia `base`, duración limitada y nombres de cámara correctos.
- Benchmark interno de infraestructura: al tener un tamaño de 0,2 GB y 51,7 M de parámetros, permite medir latencia de inferencia y throughput en distintas GPUs sin coste elevado de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; cualquiera es suficiente, aunque para control en tiempo real se prioriza baja latencia sobre potencia bruta.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=mrodher/policy_test_V7`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La model card no reporta tiempos de inferencia ni frecuencia efectiva de control.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrodher/policy_test_V7` | ACT / LeRobot | 51.668.614 | no aplica | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT / LeRobot | no disponible | no aplica | según repositorio | Hugging Face / GitHub |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | no aplica | según repositorio | Hugging Face / GitHub |
| Políticas pi0 / pi0.5 | VLA | no disponible en esta consulta | no aplica | según repositorio | Hugging Face |

No se dispone de datos de rendimiento comparables para esta política concreta, por lo que la comparativa se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenada para una única tarea ("put the beige piece on the aruco"); no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sin resultados de evaluación publicados: no hay evidencia de tasa de éxito en robot real.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Depende de la configuración exacta de hardware: robot `so_follower`, cámaras `top` y `wrist` con resolución 480x640 y nombres de observación concretos.
- Riesgo de sobreajuste al entorno de captura (posiciones de objetos, iluminación, fondo); cambios en el setup pueden degradar el rendimiento.
- Sin información sobre sesgos, robustez ante distracciones o comportamiento ante fallos.
- Cero descargas y cero likes: no hay comunidad que valide su funcionamiento.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/mrodher/policy_test_V7
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/so101_dataset_test_V7_20261112_094339
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/so101_dataset_test_V7_20261112_094339
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
