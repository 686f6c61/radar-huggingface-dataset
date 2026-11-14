# LeeJun12/act_pick-cube-2cam_chunk10

## Resumen

`act_pick-cube-2cam_chunk10` es una política de imitación (policy) entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras (muñeca y cenital) y del estado de las articulaciones, genera comandos de acción para un robot manipulador. El autor es el usuario LeeJun12 y el modelo se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea concreta y única: "Pick up the cube and put it in the box" (coger el cubo y meterlo en la caja). Se entrenó con un dataset de 50 episodios y 15.000 fotogramas grabados a 30 FPS sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot). La arquitectura ACT predice "chunks" de acciones de corto horizonte en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control.

Es relevante ahora porque ejemplifica el flujo completo de imitación en robótica de bajo coste: grabar demostraciones con teleoperación, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` sobre hardware asequible. Con 51,6 millones de parámetros y un repo de 0,2 GB, es un modelo pequeño y ligero, pensado para inferencia en tiempo real en el propio puesto de trabajo, no para servidores de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.576.454 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija por observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de una acción por paso. La política recibe como entrada el estado articular (`observation.state`, vector de 6 dimensiones) y dos imágenes RGB de 480x640 (cámara de muñeca y cámara cenital), y produce un vector de acción de 6 dimensiones. El nombre del modelo indica un chunk de 10 pasos de acción por inferencia.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `LeeJun12/pick-cube-2cam_20261028_193431`: 50 episodios, 15.000 fotogramas a 30 FPS, una única tarea. La configuración fue de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni refuerzo; es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` para la tarea de recoger un cubo y depositarlo en una caja.
- Fusión de dos vistas de cámara (muñeca y cenital) con el estado articular de 6 dimensiones.
- Predicción de chunks de acción de 10 pasos, lo que suaviza la trayectoria y reduce la acumulación de error.
- Ejecución en tiempo real a 30 FPS sobre hardware de bajo coste.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.
- No soporta múltiples tareas: está especializado en un único objetivo entrenado.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger el cubo y dejarlo en la caja, útil como base reproducible para experimentos de imitación con LeRobot.
- Prototipado rápido de políticas con SO-100/SO-101: sirve como plantilla para validar el pipeline `lerobot-train` / `lerobot-rollout` antes de escalar a tareas propias.
- Docencia y formación en robótica de imitación: al ser pequeño (51,6 M parámetros) y de licencia Apache 2.0, se puede usar en cursos para enseñar ACT de extremo a extremo.
- Benchmark interno de hardware: permite medir latencia y estabilidad de un brazo de bajo coste con dos cámaras a 30 FPS en una tarea acotada.
- Reentrenamiento con datos propios (fine-tuning): el checkpoint se puede reajustar con `lerobot-train` sobre un dataset nuevo para adaptar la política a objetos o posiciones distintas.
- Base para comparativas de métodos de imitación: al ser una política ACT estándar, sirve como referencia frente a Diffusion Policy o VQ-BeT en el mismo entorno y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 51,6 M parámetros, el modelo en fp32 ocupa aproximadamente 0,2 GB de pesos. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para inferencia en tiempo real a 30 FPS, una GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para pruebas no críticas, aunque con mayor latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma medida. El diseño apunta a control a 30 FPS (33 ms por paso) sobre el robot `so_follower`, pero no se publican cifras de latencia real.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LeeJun12/act_pick-cube-2cam_chunk10` | ACT | 51,6 M | pick-cube (1 tarea) | apache-2.0 | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | ACT | no disponible | múltiples tareas | apache-2.0 | Hugging Face Hub / LeRobot |
| Diffusion Policy (LeRobot) | difusión | no disponible | múltiples tareas | no disponible | LeRobot |
| VQ-BeT (LeRobot) | transformer discreto | no disponible | múltiples tareas | no disponible | LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a método, tamaño y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: solo funciona para la tarea "Pick up the cube and put it in the box" en el entorno y robot con los que se entrenó.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que el rendimiento en producción es desconocido.
- Sensible al dominio: cambios de iluminación, posición de objetos, fondo, cámara o robot pueden degradar gravemente el comportamiento.
- Dataset pequeño: 50 episodios y 15.000 fotogramas son una base limitada; la política puede sobreajustar a las trayectorias demostradas.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: al ser un modelo de control, puede generar comandos erróneos ante entradas fuera de distribución; requiere supervisión y paradas de seguridad.
- Sin capacidades de lenguaje ni multilingües: no procesa texto ni instrucciones en lenguaje natural; la tarea es fija.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna; el autor no asume responsabilidad por fallos en entornos reales.
- No se documentan sesgos de datos más allá de los propios del dataset de demostración (un operador, un entorno, un objeto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeJun12/act_pick-cube-2cam_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/LeeJun12/pick-cube-2cam_20261028_193431
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LeeJun12/pick-cube-2cam_20261028_193431
