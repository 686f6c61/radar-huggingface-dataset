# khanhnd61/octo_so101_tape

## Resumen

`khanhnd61/octo_so101_tape` es un modelo de política robótica (vision-language-action, VLA) desarrollado por Khanh Nguyen, que ajusta el modelo base `rail-berkeley/octo-small-1.5` (27M parámetros) sobre un dataset de 10 episodios de la tarea SO-101 "put the tape into the box". El modelo está convertido de JAX a LeRobot y entrenado con 20.000 pasos (93 épocas sobre 3.434 frames) en una RTX 3060, alcanzando una pérdida final de 0.028. Su propósito es ejecutar la tarea de recoger una cinta y colocarla en una caja usando un brazo robótico SO-101, condicionado por lenguaje natural y dos cámaras (frontal y de muñeca).

La relevancia de este modelo radica en que demuestra un flujo completo de conversión y fine-tuning de un checkpoint de Octo (originalmente en JAX) al ecosistema LeRobot, con una arquitectura de difusión para generar acciones. Es un ejemplo práctico de cómo adaptar modelos VLA preentrenados a tareas específicas con pocos datos, aunque el autor advierte explícitamente que los resultados son consistentes con memorización de las demostraciones y no implican generalización a nuevas posiciones de la cinta. El modelo usa un encoder de lenguaje T5-base congelado que no se almacena en el repositorio, sino que se descarga del Hub al instanciar la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Octo-Small 1.5 (transformer con cabeza de difusión, 20 pasos DDPM) |
| Parametros totales | 27.040.008 (27M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación de 2 pasos, chunk de 4 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | inglés (instrucciones de tarea, condicionamiento por texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

El modelo se basa en Octo-Small 1.5, una arquitectura transformer de 27M parámetros diseñada para robótica, que procesa observaciones de dos cámaras (`front` a 256x256 y `wrist` a 128x128) junto con una instrucción textual. La política genera un chunk de 4 acciones mediante una cabeza de difusión con 20 pasos DDPM. No consume propriocepción: Octo-1.5 no tiene tokenizador de estado, por lo que `observation.state` no se utiliza. El encoder de lenguaje es un `google-t5/t5-base` congelado que se descarga del Hub en el momento de instanciar la política, lo que explica que el repositorio pese solo 104 MB en lugar de ~550 MB.

El entrenamiento se realizó con LeRobot sobre el dataset `khanhnd61/so101-tape_20260804_224429`, que contiene 10 episodios de la tarea SO-101. Se ejecutaron 20.000 pasos con batch size 16 (límite en una GPU de 12 GB, 6.9 GB usados; batch 32 provoca OOM), durante 2 horas y 58 minutos en una RTX 3060, a ~30 muestras por segundo. Dado que SO-101 tiene 6 dimensiones de acción y la cabeza preentrenada tiene 7, las capas `reverse_network.linear1.weight`, `linear2.weight` y `linear2.bias` se reinicializaron al cargar; el resto de pesos cargó estrictamente. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el ajuste es supervisado sobre las demostraciones.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones (articulaciones del brazo SO-101) a partir de observaciones visuales y una instrucción textual.
- Condicionamiento por lenguaje natural: la tarea se especifica mediante una cadena de texto (p. ej., "Put the tape into the box") que debe mantenerse idéntica a la usada en el entrenamiento.
- Procesamiento multimodal con dos cámaras: frontal (256x256) y de muñeca (128x128), con historial de observación de 2 pasos.
- Generación de acciones en chunk de 4 pasos mediante una cabeza de difusión (20 pasos DDPM).
- Inferencia en tiempo real en GPU: 24 ms por chunk de 4 acciones en una RTX 3060.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico; es una política de control directo.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede controlar un brazo SO-101 para recoger una cinta y depositarla en una caja, una operación repetitiva típica en entornos de investigación o montaje.
- Prototipado rápido de políticas VLA con LeRobot: sirve como referencia de cómo convertir un checkpoint de Octo de JAX a LeRobot y ajustarlo con pocos episodios, útil para desarrolladores que quieran replicar el flujo con otras tareas.
- Evaluación de memorización vs. generalización en robótica: el autor documenta explícitamente que el modelo memoriza las demostraciones, por lo que es un caso de estudio para medir los límites del fine-tuning con datasets pequeños.
- Benchmark de latencia en hardware de gama media: con 24 ms por chunk en RTX 3060, puede usarse para validar requisitos de tiempo real en control a 30 fps (necesita respuesta cada 133 ms).
- Educación en robótica y aprendizaje por imitación: el modelo y su dataset asociado permiten a estudiantes e investigadores experimentar con entrenamiento y rollout de políticas en el ecosistema LeRobot sin necesidad de un clúster de GPUs.
- Integración en pipelines de sim-to-real: aunque no se valida en simulación, el flujo de entrenamiento y despliegue documentado puede adaptarse a entornos como NVIDIA Isaac Sim para tareas similares de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque es un modelo de control robótico, no de lenguaje general. La model card reporta métricas de entrenamiento y precisión en open-loop:

| Paso de entrenamiento | 100 | 1.000 | 5.000 | 10.000 | 15.000 | 20.000 |
|---|---|---|---|---|---|---|
| Pérdida | 5.645 | 0.991 | 0.349 | 0.169 | 0.065 | 0.028 |

Precisión open-loop (60 frames de los 10 episodios, con reset de historial, comparando contra acciones grabadas):

| Métrica | Valor |
|---|---|
| MAE por articulación | [0.558, 1.937, 1.481, 0.755, 0.456, 0.293] |
| Magnitud media de acciones por articulación | [51.9, 53.1, 51.2, 60.3, 147.3, 4.2] |
| MAE global | 0.9133 (1.49% de la media de |acción|) |

El autor advierte que estos números son consistentes con una política que ha memorizado las demostraciones (93 épocas sobre 10 episodios sin split de validación) y no indican capacidad de generalización a nuevas posiciones de la cinta.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6.9 GB en GPU (según el uso reportado durante entrenamiento con batch 16 en una RTX 3060 de 12 GB).
- GPU recomendada: RTX 3060 (12 GB) o superior; el entrenamiento con batch 32 provoca OOM en 12 GB, por lo que para inferencia con batch 1 la VRAM necesaria es menor.
- Cabe en GPUs de consumo: sí, en tarjetas con al menos 8 GB de VRAM (la inferencia usa menos que el entrenamiento).
- Opciones de despliegue: LeRobot (política registrada como `octo`), con comandos `lerobot-rollout` para ejecución en el robot SO-101. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia: 24 ms por chunk de 4 acciones en RTX 3060; 170 ms en CPU (i5-12400F con torch). A 30 fps se necesita una respuesta cada 133 ms, por lo que la inferencia en CPU no es suficiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `khanhnd61/octo_so101_tape` | 27M | 2 cámaras, 2 pasos de historial, chunk de 4 acciones | SO-101 pick-and-place (cinta en caja) | MIT | Hugging Face (LeRobot) |
| `rail-berkeley/octo-small-1.5` (base) | 27M | 2 cámaras, historial variable, chunk de acciones | Tareas robóticas generales (lenguaje condicionado) | MIT | Hugging Face (JAX) |
| `khanhnd61/smolvla_so101_tape_prune10` | no disponible | no disponible | SO-101 (variante podada de SmolVLA) | no disponible | Hugging Face (LeRobot) |

El modelo base Octo-Small 1.5 es la referencia directa: el fine-tuning aquí presentado lo especializa en una única tarea con 10 episodios, sacrificando generalidad por precisión en esa tarea concreta. No se dispone de datos comparativos de rendimiento con SmolVLA u otros modelos VLA en la misma tarea.

## Limitaciones y advertencias

- Memorización de demostraciones: el entrenamiento con 93 épocas sobre solo 10 episodios sin split de validación produce una política que probablemente ha memorizado las trayectorias; no hay evidencia de generalización a nuevas posiciones de la cinta o variaciones de la escena.
- Dependencia de la instrucción textual: la tarea debe especificarse con la cadena exacta usada en el entrenamiento ("Put the tape into the box"); cualquier variación puede degradar el rendimiento.
- Sin propriocepción: el modelo no utiliza el estado de las articulaciones, lo que limita su robustez ante perturbaciones externas o cambios en la dinámica del brazo.
- Requisito de dos cámaras: la política exige imágenes de cámara frontal y de muñeca con las resoluciones especificadas; no funciona con una sola cámara ni con otras configuraciones.
- Latencia en CPU insuficiente: a 30 fps, la inferencia en CPU (170 ms por chunk) no cumple el requisito de 133 ms por paso; se necesita GPU para control en tiempo real.
- El encoder T5-base no está incluido en el repositorio: se descarga del Hub al instanciar la política, lo que requiere conexión a internet y puede fallar en entornos aislados.
- Sin evaluación en el mundo real: la model card no reporta resultados de rollouts físicos, solo métricas open-loop sobre datos grabados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la seguridad del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhnd61/octo_so101_tape
- Modelo base (Octo-Small 1.5): https://huggingface.co/rail-berkeley/octo-small-1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-tape_20260804_224429
- Variante relacionada (SmolVLA podado): https://huggingface.co/khanhnd61/smolvla_so101_tape_prune10
- Repositorio de LeRobot para SO-101: https://github.com/AriRyo/lerobot-so101
- Documentación de NVIDIA sobre sim-to-real con SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
