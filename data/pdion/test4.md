# pdion/test4

## Resumen

`pdion/test4` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario pdion y publicado en Hugging Face mediante la librería LeRobot de Hugging Face, que es el framework de referencia para entrenar y desplegar políticas de control robótico en PyTorch.

El modelo resuelve el problema de control de un robot seguidor de tipo `so_follower` (brazo tipo SO-100/SO-101) a partir de dos cámaras (`claw` y `workspace`) y un vector de estado de 6 dimensiones, produciendo comandos de acción de 6 dimensiones. Se trata de una política de imitación entrenada sobre un dataset propio de 10 episodios y 4.148 frames a 30 FPS, con el objetivo de ejecutar la tarea "test1".

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de consumo. Su relevancia es práctica: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento con ACT y despliegue con `lerobot-rollout`) para robótica de bajo coste. No obstante, al ser un modelo de prueba con un dataset mínimo, sus capacidades de generalización son limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación basada en imágenes y estado, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador visual (procesa las dos cámaras de 3×480×640) con un transformer que fusiona las observaciones visuales y el estado del robot, y un decodificador que genera un chunk de acciones de forma (6,) por paso. La predicción por chunks reduce el error de acumulación y mejora la estabilidad frente al control paso a paso, y el método incorpora una técnica de ensamblado temporal (temporal ensembling) para suavizar las transiciones entre chunks.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `pdion/test4_10x1_20261101_213708`: 10 episodios, 4.148 frames a 30 FPS, tarea "test1". La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se especifica en la información disponible el número de tokens ni la composición detallada del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en un contexto de imitación supervisada). El robot objetivo es `so_follower` con cámaras `claw` y `workspace`.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de dos vistas de cámara y el estado articular.
- Predicción de action chunks: emite secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad del movimiento.
- Percepción visual multimodal: procesa simultáneamente las cámaras `claw` (vista de la pinza) y `workspace` (vista del espacio de trabajo) a resolución 3×480×640.
- Ejecución de una tarea concreta: la política está entrenada para la tarea "test1" del dataset asociado.
- Despliegue en tiempo real: compatible con `lerobot-rollout` para inferencia sobre el robot físico a 30 FPS.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües; es un modelo puramente de control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en un brazo SO-100/SO-101: la política recibe las imágenes de las cámaras `claw` y `workspace` y emite comandos articulares de 6 dimensiones para ejecutar la tarea "test1" de forma autónoma durante un tiempo configurable con `--duration`.
- Prototipado rápido de flujos de imitación con LeRobot: sirve como ejemplo reproducible del pipeline completo (grabación con `lerobot-record`, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) para equipos que se inician en robótica de bajo coste.
- Validación de hardware y calibración: al ser un modelo pequeño (51,7 M de parámetros) y con dos cámaras, permite comprobar la cadena de percepción y control (puertos, índices de cámara, FPS, calibración) antes de entrenar políticas más complejas.
- Benchmark interno de políticas ACT: sirve como línea base para comparar el efecto de aumentar episodios, frames o variaciones de hiperparámetros en tareas de manipulación simples.
- Investigación en aprendizaje por imitación con datasets reducidos: útil para estudiar el comportamiento de ACT con 10 episodios y 4.148 frames, y analizar sobreajuste y generalización.
- Demostraciones educativas de robótica con IA: adecuado para talleres y cursos que muestran cómo una red transformer puede controlar un robot real a partir de datos de teleoperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en precisión FP32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo moderna (estimación orientativa a partir del tamaño del repo).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior es suficiente; también es viable en CPU para pruebas, aunque la latencia a 30 FPS requiere GPU para cumplir el ritmo de control.
- Cabe en GPU de consumo: sí, con margen amplio (el repositorio completo ocupa 0,2 GB).
- Opciones de despliegue: `lerobot-rollout` (inferencia sobre robot), `lerobot-train` (reentrenamiento); la librería LeRobot es el único camino documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de control).
- Latencia y throughput: no disponibles; el modelo está pensado para operar a 30 FPS según la tasa del dataset, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pdion/test4 (ACT) | 51,7 M | 2 cámaras 480×640 + estado (6,) | Control `so_follower`, tarea "test1" | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | variables | Manipulación genérica | según repo | Hugging Face / LeRobot |
| Diffusion Policy (LeRobot) | no disponible | variables | Manipulación genérica | según repo | Hugging Face / LeRobot |
| SmolVLA (Hugging Face) | no disponible en esta ficha | variables | Manipulación generalista | según repo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a categoría, formato y disponibilidad.

## Limitaciones y advertencias

- Dataset muy reducido: 10 episodios y 4.148 frames, lo que limita severamente la generalización a posiciones de objetos, iluminación o distractores no vistos durante el entrenamiento.
- Tarea única: la política está entrenada exclusivamente para la tarea "test1"; no es un modelo generalista y no debe esperarse que funcione en otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Licencia no disponible: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue comercial.
- Dependencia de hardware concreto: requiere un robot `so_follower` y dos cámaras con los nombres `claw` y `workspace` y la resolución exacta de entrenamiento (640×480 a 30 FPS); cualquier desviación degrada el rendimiento.
- Riesgo de sobreajuste y alucinación motora: al predecir chunks de acciones, errores de percepción pueden propagarse durante varios pasos; el ensamblado temporal mitiga pero no elimina este riesgo.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje; no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Modelo de prueba: el identificador "test4" y la tarea "test1" sugieren un experimento de validación, no un modelo listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdion/test4
- Dataset de entrenamiento: https://huggingface.co/datasets/pdion/test4_10x1_20261101_213708
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=pdion/test4_10x1_20261101_213708
