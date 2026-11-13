# ranjith3567/smolvla_pick_black_yellow_cubes_combined_v2

## Resumen

SmolVLA es una familia de modelos visión-lenguaje-acción (VLA) compactos desarrollada por Hugging Face dentro del ecosistema LeRobot, diseñados para control robótico mediante imitación y desplegables en hardware de consumo. Esta ficha concreta, `ranjith3567/smolvla_pick_black_yellow_cubes_combined_v2`, es un fine-tuning de un policy SmolVLA entrenado por un usuario independiente para una tarea específica de manipulación: recoger cubos negros o amarillos y depositarlos en una caja marrón, usando un robot SO-100/SO-101 (tipo `so_follower`).

El modelo resuelve el problema de la política de control end-to-end en robótica de bajo coste: recibe observaciones multimodales (estado de las articulaciones de 6 dimensiones y hasta cuatro flujos de cámara) y emite directamente un vector de acción de 6 dimensiones a 30 FPS. Con 450 millones de parámetros y un repositorio de 0,9 GB en safetensors, está pensado para ejecutarse en GPUs de consumo, algo relevante para laboratorios y aficionados que no disponen de clústeres de entrenamiento.

Su relevancia actual radica en que demuestra el flujo completo de LeRobot: grabación de datos con un brazo barato, entrenamiento de un policy VLA compacto y despliegue en el robot real mediante `lerobot-rollout`. No obstante, es un modelo de nicho, sin métricas de evaluación publicadas y con licencia no declarada, por lo que su uso en producción requiere validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con codificador visual y de lenguaje y cabeza de acciones |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.2 |
| Pipeline | robotics |
| Tipo de robot | `so_follower` (SO-100/SO-101) |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256), `observation.images.empty_camera_0` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de control | 30 FPS |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual (procesa las imágenes de las cámaras a 256x256 y 480x640), un codificador de lenguaje (procesa la instrucción de tarea en texto) y una cabeza de predicción de acciones que genera un vector de 6 dimensiones correspondiente a las articulaciones del robot `so_follower`. La arquitectura sigue el diseño descrito en el paper arXiv:2506.01844, orientado a reducir el coste computacional frente a VLAs de mayor tamaño manteniendo un rendimiento competitivo en tareas de manipulación.

El entrenamiento se realizó por imitación (behavior cloning) sobre el dataset `ranjith3567/pick_black_yellow_cubes_combined_v2`, compuesto por 400 episodios y 256.985 frames a 30 FPS, con cuatro variantes de instrucción de tarea (recoger cubo amarillo o negro y colocarlo en la caja marrón). La configuración reportada incluye 150.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, ni el número total de tokens o composición del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación end-to-end: genera acciones de 6 dimensiones para un brazo `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa hasta cuatro flujos de imagen (tres cámaras de 256x256 y una de 480x640), lo que permite cubrir vistas superior y lateral.
- Condicionamiento por instrucción en lenguaje natural: acepta tareas como "pick the yellow block and place it in brown box" o "pick the black cube and place it in brown box".
- Ejecución en tiempo real a 30 FPS, compatible con el bucle de control de LeRobot.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, audio ni modo "thinking".

## Casos de uso

- Clasificación y recogida de piezas en línea de montaje: el policy puede distinguir entre cubos negros y amarillos mediante las cámaras y depositarlos en una caja designada, integrándose en una célula de manipulación con un SO-100/SO-101.
- Investigación en imitación robótica: sirve como punto de partida para estudiar el efecto del número de episodios, la composición del dataset o la variación de instrucciones en el rendimiento de un VLA compacto.
- Prototipado rápido en laboratorios con hardware de bajo coste: al caber en GPUs de consumo, permite iterar sobre nuevas tareas sin infraestructura dedicada.
- Educación y formación en robótica: el flujo completo de LeRobot (grabación, entrenamiento, despliegue) es reproducible con este modelo como ejemplo documentado.
- Benchmark interno de políticas VLA: puede usarse como referencia base para comparar fine-tunings propios sobre la misma tarea y robot.
- Automatización de tareas de pick-and-place en entornos controlados: con iluminación y posiciones de objeto estables, el modelo puede ejecutar ciclos repetidos de recogida y colocación.
- Generación de datos sintéticos o aumentados: las trayectorias generadas pueden servir para análisis de comportamiento o para preentrenar políticas relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 450 millones de parámetros en safetensors (aproximadamente 1,8 GB en FP32 o 0,9 GB en FP16/BF16); con overhead de activaciones y procesamiento de imágenes, se estima un consumo de 2-4 GB de VRAM, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; se espera compatibilidad con RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque no se documentan pruebas específicas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 o superiores, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=ranjith3567/smolvla_pick_black_yellow_cubes_combined_v2`), con soporte de CUDA mediante `--policy.device=cuda` en entrenamiento. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el modelo opera a 30 FPS en el bucle de control, pero no se reportan cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/smolvla_pick_black_yellow_cubes_combined_v2` | 450 M | no disponible | VLA para `so_follower` | no disponible | Hugging Face, 0 descargas |
| SmolVLA base (Hugging Face) | ~450 M (familia) | no disponible | VLA generalista | no disponible en esta ficha | Hugging Face |
| Otros policies LeRobot (ACT, Diffusion Policy) | variable (decenas de millones) | no aplica | Políticas de imitación | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, tipo de tarea y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo con cubos negros y amarillos sobre una caja marrón, el modelo puede fallar ante objetos, colores o posiciones no vistas.
- Riesgo de alucinación: en robótica se traduce en acciones erróneas o inseguras; no hay evaluación de robustez ante perturbaciones (iluminación, distractores, cambios de posición).
- Limitaciones de contexto e idioma: las instrucciones de tarea están en inglés y limitadas a cuatro variantes; no se documenta soporte multilingüe.
- Restricciones de licencia: la licencia no está declarada, lo que impide confirmar si el uso comercial está permitido.
- Caveats para producción: sin métricas de éxito publicadas, sin validación en robot real reportada, con 0 descargas y 0 likes (modelo no validado por la comunidad), y dependiente de la versión 0.6.2 de LeRobot.
- Dependencia de hardware específico: diseñado para `so_follower` con una configuración concreta de cámaras; trasladarlo a otro robot requiere reentrenamiento.
- Fecha de creación futura (2026-11-13) en los metadatos, lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/smolvla_pick_black_yellow_cubes_combined_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_black_yellow_cubes_combined_v2
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_black_yellow_cubes_combined_v2
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
