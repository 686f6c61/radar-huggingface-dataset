# JackPickett/act_keys2

## Resumen

`JackPickett/act_keys2` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario JackPickett en Hugging Face mediante la librería LeRobot de Hugging Face, y está diseñado para controlar un robot seguidor de tipo `so_follower` (familia SO-100/SO-101) equipado con una cámara en la muñeca.

La política está especializada en una única tarea: introducir un llavero en un bol. Se entrenó con el dataset `JackPickett/keys50_wrist`, compuesto por 50 episodios de teleoperación y 24.148 fotogramas grabados a 30 FPS. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo convierte en un artefacto ligero, ejecutable en hardware modesto.

Su relevancia es acotada: no es un modelo de propósito general, sino un ejemplo reproducible de un flujo completo de aprendizaje por imitación con LeRobot, útil para desarrolladores que quieran replicar el pipeline (grabación de datos, entrenamiento con ACT, despliegue en robot real) o como punto de partida para tareas de manipulación similares. No se han publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Camaras | `wrist` (una cámara de muñeca) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset de entrenamiento | `JackPickett/keys50_wrist` |
| Episodios / fotogramas | 50 / 24.148 |
| Frecuencia de grabacion | 30 FPS |
| Pasos de entrenamiento | 30.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política combina un backbone visual (codificador de imágenes de la cámara de muñeca a resolución 480x640) con un transformer que fusiona la observación visual y el estado propioceptivo del robot (vector de 6 dimensiones) para predecir un chunk de acciones de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, reduce el error de acumulación y mejora la estabilidad frente a la variabilidad de la política.

El entrenamiento se realizó con LeRobot 0.7.1 durante 30.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000. El dataset contiene 50 episodios teleoperados de la tarea "Put the keys in the bowl", con 24.148 fotogramas a 30 FPS. No se especifica en la información disponible si hubo aumentos de datos, regularización adicional ni fine-tuning posterior. Tampoco se detalla la composición exacta del dataset más allá del número de episodios y la tarea.

## Capacidades

- Control robótico de manipulación para una tarea concreta: introducir un llavero en un bol.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (50 episodios).
- Predicción de chunks de acción de 6 dimensiones a partir de estado propioceptivo de 6 dimensiones y una imagen de muñeca de 480x640.
- Ejecución en robot real de tipo `so_follower` mediante el comando `lerobot-rollout`.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es una política de control motor, no un modelo de lenguaje.

## Casos de uso

- Replicación de un pipeline completo de aprendizaje por imitación: sirve como referencia para grabar un dataset propio con LeRobot, entrenar una política ACT y desplegarla en un robot SO-100/SO-101, validando cada etapa del flujo con un caso real.
- Automatización de una tarea de pick-and-place sencilla: el modelo puede ejecutar la secuencia de coger un llavero y depositarlo en un bol en un entorno controlado, útil como demostración de manipulación básica.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT ligero (51,7 M de parámetros), se puede reentrenar con un dataset propio de otra tarea de manipulación con un coste computacional bajo.
- Docencia y formación en robótica: permite a estudiantes ejecutar una política entrenada en hardware asequible y comparar el comportamiento con el de sus propios entrenamientos.
- Evaluación de infraestructura de inferencia robótica: útil para medir latencia y throughput de LeRobot en GPUs de consumo antes de escalar a tareas más complejas.
- Pruebas de integración de cámaras y calibración: el comando de rollout permite verificar la configuración de la cámara de muñeca y del puerto del robot, sirviendo como test de humo del montaje hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors, la huella de memoria es muy reducida (del orden de cientos de MB incluyendo buffers de imagen), por lo que cabe en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con PyTorch; el entrenamiento se realizó con `--policy.device=cuda`. No se especifica el modelo de GPU usado.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo; no se detalla una lista concreta de GPUs verificadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) porque no aplican a una política de robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JackPickett/act_keys2` | 51.668.614 | no aplica | Manipulacion (llavero en bol) | no disponible | Hugging Face, via LeRobot |
| Otras politicas ACT en LeRobot Hub | no disponible | no aplica | Manipulacion variable | variable | Hugging Face |
| Politicas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulacion variable | variable | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con modelos alternativos en la información proporcionada. La comparación cualitativa se limita al método (ACT frente a Diffusion Policy u otras políticas disponibles en el ecosistema LeRobot), sin cifras de rendimiento verificables.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Put the keys in the bowl" con un robot `so_follower` y una cámara de muñeca; no generaliza a otras tareas, objetos ni configuraciones de hardware.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su tasa de acierto y su robustez.
- Dependencia de la configuración hardware: los nombres de cámara y el puerto del robot deben coincidir con los usados en el entrenamiento; cualquier cambio de calibración o de posición de cámara puede degradar el comportamiento.
- Licencia no especificada: la model card indica "More Information Needed"; no se puede confirmar el uso comercial sin contactar con el autor.
- Riesgo de sobreajuste al dataset: con solo 50 episodios y 24.148 fotogramas, la variabilidad de posiciones, iluminación y distractores está limitada.
- Sin soporte de lenguaje ni razonamiento: no es adecuado para tareas cognitivas, tool calling ni agentes; su salida es exclusivamente un vector de acciones.
- Fecha de creación futura en los metadatos (2026-11-16): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackPickett/act_keys2
- Dataset de entrenamiento: https://huggingface.co/datasets/JackPickett/keys50_wrist
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JackPickett/keys50_wrist
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
