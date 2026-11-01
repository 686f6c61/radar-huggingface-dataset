# pavannanjunda333/act_so101_sim_v2_dagger1

## Resumen

`act_so101_sim_v2_dagger1` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub a través de la librería LeRobot. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de dos cámaras (frontal y de pinza) y del estado de las articulaciones del robot, predice directamente comandos de acción para un brazo seguidor SO-101. Lo desarrolla el usuario `pavannanjunda333` y se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación: "put the blue cube in the blue box" (introducir el cubo azul en la caja azul). Se ha entrenado sobre un conjunto de 1.230 episodios y 535.450 fotogramas a 30 FPS, con una combinación de datos de simulación y reales, y con un proceso de DAgger indicado en el propio nombre del repositorio. La arquitectura ACT predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas de imitación en robots de bajo coste como el SO-101. Aun así, se trata de un modelo de nicho, con muy poca tracción (27 descargas, 0 likes) y sin resultados de evaluación publicados, por lo que debe considerarse un artefacto de experimentación más que una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

Especificaciones adicionales de entrada y salida:

| Elemento | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `front`, `gripper` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.front` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.gripper` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Frecuencia de datos | 30 FPS |
| Pasos de entrenamiento | 20.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (normalmente un backbone tipo ResNet) con un transformer que procesa la secuencia de observaciones y genera un chunk de acciones futuras. En lugar de predecir una única acción por paso, el modelo emite varios pasos de acción de golpe, lo que mitiga el problema de la acumulación de errores típico de las políticas reactivas y permite un control más suave. La variante DAgger (Dataset Aggregation) implica recoger datos adicionales con la política ya entrenada y corregir sus desviaciones con intervenciones humanas, refinando el comportamiento en estados que la política visita pero que no estaban bien cubiertos en la demostración inicial.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, batch de 16, AdamW y learning rate de 1e-05, sobre el dataset `pavannanjunda333/so101_sim_cube_real_dagger1` (1.230 episodios, 535.450 fotogramas, 30 FPS, tarea única "put the blue cube in the blue box"). El nombre del repositorio sugiere una mezcla de datos de simulación y reales con una ronda de DAgger, aunque la model card no detalla la proporción ni el procedimiento exacto de agregación. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal, ya que no aplican a este tipo de política.

## Capacidades

- Control visuomotor de un brazo robótico SO-101 a partir de dos cámaras RGB y del estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones, adecuada para control continuo a 30 FPS.
- Ejecución de una tarea de manipulación concreta: colocar un cubo azul en una caja azul.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, con refinamiento tipo DAgger.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de pick-and-place: la política puede ejecutar de forma autónoma la secuencia de aproximación, agarre y depósito del cubo en la caja, sustituyendo la teleoperación en tareas repetitivas de laboratorio.
- Banco de pruebas para investigación en imitación: sirve como política de referencia para comparar variantes de ACT, DAgger o aumentos de datos sobre el mismo dataset y robot.
- Validación de pipelines de sim-to-real: al haberse entrenado con datos que el nombre del repo indica como mixtos (simulación y real), permite estudiar la transferencia de una política entrenada en simulador al SO-101 físico.
- Prototipado rápido de robots de bajo coste: el SO-101 es una plataforma económica y LeRobot permite desplegar la política con un único comando, lo que facilita demostraciones y docencia.
- Generación de datos sintéticos para otras políticas: la política puede ejecutar rollouts que se graban y se reutilizan como datos de entrenamiento adicionales en un ciclo de DAgger.
- Evaluación de robustez ante cambios de iluminación, posición de objetos o distracciones: útil para medir la sensibilidad de ACT en condiciones fuera de distribución antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros y un repo de 0,2 GB; en FP32 ocupa aproximadamente 0,2 GB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más. La VRAM adicional depende del backbone visual y del tamaño de las imágenes de entrada (3×480×640 por cámara).
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090 o superiores; también A100/H100 si se integra en un pipeline de entrenamiento o evaluación a gran escala.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4-6 GB de VRAM para inferencia; para entrenamiento se recomienda 8 GB o más por el batch de 16 y las dos cámaras.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La política está pensada para control a 30 FPS, pero no se publican mediciones de latencia por paso ni de frecuencia efectiva de inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `act_so101_sim_v2_dagger1` | ACT | 51,7 M | 2 cámaras + estado (6) | Cubo azul en caja azul (SO-101) | Apache 2.0 | Hugging Face Hub, 27 descargas |
| Políticas ACT de referencia en LeRobot | ACT | variable | cámaras + estado | Tareas diversas (ALOHA, SO-100/101) | Apache 2.0 | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | variable | cámaras + estado | Manipulación diversa | Apache 2.0 | Hugging Face Hub |
| Políticas π0 / π0-FAST | VLA (vision-language-action) | miles de millones | cámaras + instrucción en lenguaje | Manipulación generalista | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot físico y en condiciones fuera de distribución.
- Es una política de tarea única ("put the blue cube in the blue box"); no generaliza a otras tareas sin reentrenamiento.
- Depende de la configuración exacta de cámaras (`front`, `gripper`), de su resolución (480×640) y de la frecuencia (30 FPS); cambios en la disposición o calibración pueden degradar el comportamiento.
- El nombre del repositorio sugiere datos de simulación y reales mezclados, pero la model card no detalla la proporción ni el procedimiento de DAgger, lo que dificulta reproducir el entrenamiento.
- Riesgo de sobreajuste al entorno de recogida de datos: posiciones de objetos, iluminación y fondo concretos.
- No es un modelo de lenguaje: no tiene capacidades de razonamiento, código, matemáticas ni multilingüismo, y no admite tool calling ni agentes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validar la seguridad del robot recae en el integrador.
- El modelo tiene muy poca tracción (0 likes, 27 descargas) y no se ha actualizado desde su creación; no hay evidencia de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavannanjunda333/act_so101_sim_v2_dagger1
- Dataset de entrenamiento: https://huggingface.co/datasets/pavannanjunda333/so101_sim_cube_real_dagger1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=pavannanjunda333/so101_sim_cube_real_dagger1
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
