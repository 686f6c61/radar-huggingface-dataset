# Ggghoney/pick_and_place_act_kaggle

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Ggghoney/pick_and_place_act_kaggle`, es una política entrenada con LeRobot sobre un robot de tipo `omx_follower` para la tarea específica de recoger un bolígrafo rojo y colocarlo en un estuche. No es un modelo de lenguaje generalista, sino un controlador viso-motor especializado.

El modelo consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de imagen de 480x640 píxeles procedentes de cámaras frontal y superior, y produce un vector de acción de 6 dimensiones. Con 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto.

Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento y despliegue) y como punto de partida para quien quiera replicar la tarea o adaptar la receta a su propio robot. No dispone de resultados de evaluación publicados ni de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `omx_follower` |
| Cámaras | `front`, `top` (480x640, 3 canales) |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida de acción | `action`, shape (6,) |
| Biblioteca | lerobot 0.6.2 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación viso-motora que predice un chunk de acciones futuras a partir de observaciones multimodales. La política combina un codificador de imágenes (procesa las dos cámaras, `front` y `top`) con el estado propioceptivo del robot, y un decodificador que genera la secuencia de acciones. La predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación.

El entrenamiento se realizó sobre el dataset `Ggghoney/pick_and_place`, compuesto por 30 episodios y 23.878 frames a 30 FPS, todos correspondientes a la tarea "Pick up the red pen and place it in the pencil case". La configuración reportada es de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni otras fases de refinamiento; se trata de aprendizaje supervisado por imitación a partir de demostraciones teleoperadas.

## Capacidades

- Control viso-motor de un brazo robótico de 6 grados de libertad (`omx_follower`) para una tarea de pick-and-place.
- Fusión de dos vistas de cámara (frontal y superior) con el estado articular para generar acciones.
- Predicción de chunks de acción, lo que aporta suavidad y reduce el drift acumulado.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con la estrategia `base`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia de recogida y colocación del bolígrafo en el estuche sobre un `omx_follower`, sirviendo como base para tareas de manipulación similares.
- Reproducción de un pipeline de imitación con LeRobot: útil para validar la instalación, la calibración de cámaras y el flujo `lerobot-train` / `lerobot-rollout` antes de escalar a tareas propias.
- Punto de partida para fine-tuning: con 51,6 M de parámetros y 0,2 GB, se puede reentrenar sobre un dataset propio de 30 episodios en hardware de consumo.
- Docencia y divulgación en robótica: ejemplo compacto y reproducible de ACT con configuración de entrenamiento explícita.
- Benchmark interno de hardware robótico: permite medir latencia de inferencia y estabilidad de una política ACT en un robot concreto.
- Prototipado de tareas de manipulación con dos cámaras: la configuración `front` + `top` sirve de plantilla para tareas que requieran percepción desde múltiples ángulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM libre, incluyendo las cámaras y buffers.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente. Para entrenamiento con batch size 8 y dos cámaras a 480x640 se recomienda al menos 8-12 GB de VRAM.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ggghoney/pick_and_place_act_kaggle | 51,6 M | no aplica | Pick-and-place con `omx_follower` | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación genérica | según repositorio | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación viso-motora | según repositorio | Hugging Face / LeRobot |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas, ya que no hay evaluación publicada.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar su fiabilidad.
- Dataset muy reducido: 30 episodios y una única tarea; la política probablemente generaliza mal a nuevas posiciones de objetos, iluminación o distractores.
- Especialización extrema: solo ejecuta la tarea "Pick up the red pen and place it in the pencil case" sobre un `omx_follower` con cámaras `front` y `top`.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin información sobre sesgos: al ser un modelo de robótica no aplican sesgos lingüísticos, pero sí posibles sesgos de dataset (posiciones, colores y condiciones de iluminación limitadas).
- Riesgo de fallo silencioso: al no haber métricas, un despliegue en producción requiere validación manual extensiva.
- Dependencia de la versión de LeRobot (0.6.2) y de la configuración exacta de cámaras y robot; cambios en el hardware invalidan la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ggghoney/pick_and_place_act_kaggle
- Dataset de entrenamiento: https://huggingface.co/datasets/Ggghoney/pick_and_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ggghoney/pick_and_place
