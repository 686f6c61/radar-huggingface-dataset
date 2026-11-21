# SamShumChun/lerobot_sayhi_pose_a

## Resumen

`lerobot_sayhi_pose_a` es una política de imitación para robótica entrenada con LeRobot y basada en el método ACT (Action Chunking with Transformers), publicado por Zhao et al. en 2023. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un robot `so_follower` (6 dimensiones) y una imagen frontal de 720x1280 píxeles, y emite comandos de acción de 6 dimensiones. El modelo lo ha entrenado y publicado el usuario SamShumChun en el Hub de Hugging Face bajo licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación: ejecutar el gesto "SaiHi" (un saludo) sobre un robot de bajo coste de la familia SO-100/SO-101 compatible con LeRobot. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un artefacto ligero pensado para inferencia en tiempo real a 30 FPS en hardware de consumo, no para despliegue en clúster.

Su relevancia es fundamentalmente práctica y educativa: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación (teleoperación, grabación de dataset, entrenamiento ACT y rollout), y como punto de partida para quien quiera entrenar sus propias políticas con LeRobot 0.6.2. No hay resultados de evaluación publicados ni benchmarks que permitan compararlo cuantitativamente con otras políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación definida por el chunking de acciones, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `front` (una sola camara) |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.front` | VISUAL, shape `(3, 720, 1280)` |
| Salida `action` | ACTION, shape `(6,)` |
| Frecuencia de datos | 30 FPS |
| Libreria | lerobot 0.6.2 |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un backbone transformer con atención sobre tokens visuales y de estado, y un decoder CVAE que modela la variabilidad de las demostraciones humanas. En este caso concreto, el modelo consume una imagen frontal de alta resolución (720x1280) y el vector de estado de 6 articulaciones del `so_follower`, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `SamShumChun/lerobot_sayhi_dataset_a_20261114_124837`, compuesto por 30 episodios teleoperados, 13.017 frames a 30 FPS y una única tarea etiquetada como "SaiHi". La configuración fue de 40.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta composición del dataset más allá de esos episodios, ni uso de RLHF/DPO (no aplica a imitación supervisada), ni técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor de un robot `so_follower` de 6 grados de libertad a partir de una imagen frontal y del estado articular.
- Ejecución de la tarea de saludo "SaiHi" mediante predicción de chunks de acción.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa ni entorno simulado).
- Inferencia en tiempo real a 30 FPS en hardware de consumo.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`, visualización de datasets).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Demostración educativa de un pipeline completo de imitación: grabar teleoperando con un SO-100/SO-101, entrenar ACT con `lerobot-train` y desplegar con `lerobot-rollout`; el modelo sirve como referencia funcional de principio a fin.
- Prototipado rápido de gestos sociales en robótica de bajo coste: el saludo "SaiHi" se puede reutilizar como bloque base en un robot de recepción o demo ferial.
- Base para fine-tuning con nuevos datasets: al ser Apache 2.0 y ligero (0,2 GB), se puede reentrenar con `--policy.type=act` y un dataset propio sin partir de cero.
- Validación de hardware y calibración: ejecutar la política durante 60 segundos con `--duration=60` permite comprobar que la cinemática, la cámara y los puertos del `so_follower` están correctamente configurados.
- Benchmark interno de latencia: con 51,7 M de parámetros y una sola cámara, es un candidato adecuado para medir throughput de inferencia en GPUs de consumo o incluso CPU antes de escalar a políticas mayores.
- Docencia en robótica e IA: ilustra de forma tangible conceptos como chunking de acciones, CVAE en imitación y el bucle observación-acción en un robot real.
- Recolección de datos asistida: usar el modelo como política inicial para generar trayectorias y ampliar el dataset con correcciones humanas (DAgger ligero).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para los 51,7 M de parámetros; en la práctica, el cuello de botella es el procesamiento de la imagen 720x1280, que añade algo de memoria de activaciones. Cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia cómoda a 30 FPS; A100/H100 no son necesarias y no aportan ventaja significativa para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (comando oficial), integración con el stack LeRobot en PyTorch. No se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, TGI ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma oficial; por el tamaño y la resolución de entrada, se espera inferencia en tiempo real a 30 FPS en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lerobot_sayhi_pose_a` (este) | 51,7 M | imagen 720x1280 + estado (6,) | saludo "SaiHi" en `so_follower` | Apache 2.0 | Hub de HF, 0 descargas |
| Políticas ACT de referencia en LeRobot | ~50 M (tipico) | imagen + estado | tareas de manipulación diversas | Apache 2.0 | Hub de HF / docs LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | imagen + estado | manipulación | Apache 2.0 | Hub de HF / docs LeRobot |
| Políticas SmolVLA (LeRobot) | no disponible en la informacion | imagen + estado + lenguaje | manipulación guiada por lenguaje | no disponible en la informacion | Hub de HF |

La comparación cuantitativa con alternativas no es posible porque no hay benchmarks publicados para este modelo ni datos de rendimiento en la información disponible. A nivel cualitativo, ACT destaca por su simplicidad y velocidad de entrenamiento frente a Diffusion Policy, y por ser más ligero que SmolVLA, a costa de no aceptar instrucciones en lenguaje natural.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay evidencia medida de tasa de éxito, robustez ni generalización; no debe asumirse que funciona fuera del entorno de grabación.
- Sesgo de dominio: entrenado con 30 episodios y 13.017 frames de una única tarea ("SaiHi"), en un robot y cámara concretos; es probable que falle ante cambios de iluminación, posición de cámara, fondo o robot.
- Sobreajuste esperado: 40.000 pasos con batch 8 sobre un dataset pequeño favorece la memorización de trayectorias.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento, tool calling ni agentes; cualquier uso en ese sentido es un error de categoría.
- Dependencia de hardware: requiere un `so_follower` calibrado y una cámara con el nombre de observación `front`; los nombres e índices de cámara deben coincidir con los del entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; para producción conviene auditar el dataset y el robot objetivo.
- Riesgo de seguridad física: una política de imitación sin evaluación puede ejecutar movimientos erráticos; deben establecerse límites de par, paradas de emergencia y supervisión humana.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamShumChun/lerobot_sayhi_pose_a
- Dataset de entrenamiento: https://huggingface.co/datasets/SamShumChun/lerobot_sayhi_dataset_a_20261114_124837
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamShumChun/lerobot_sayhi_dataset_a_20261114_124837
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
