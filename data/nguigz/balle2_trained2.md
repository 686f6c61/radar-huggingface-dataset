# nguigz/balle2_trained2

## Resumen

`nguigz/balle2_trained2` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers), una técnica presentada en el paper arXiv:2304.13705 que predice bloques de acciones (action chunks) en lugar de pasos individuales para mejorar la estabilidad y la tasa de éxito en tareas de manipulación. El modelo lo publica el usuario `nguigz` en Hugging Face y se ha entrenado y exportado con la librería LeRobot de Hugging Face, que estandariza el pipeline de aprendizaje por imitación para robots reales.

Se trata de una política específica para una tarea concreta: introducir una pelota en el contenedor "bac2" ("mettre la balle dans le bac2"). Consume el estado articular del robot (vector de 6 dimensiones) y una imagen de una cámara cenital de 240x320 píxeles, y produce un vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y un peso de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware modesto.

Su relevancia es práctica para quien trabaja con el robot `so_follower` (SO-100/SO-101 de LeRobot): sirve como ejemplo reproducible de un pipeline completo de grabación de datos, entrenamiento ACT y despliegue con `lerobot-rollout`. No es un modelo de lenguaje ni un modelo fundacional generalista; es un controlador de política visual-motora entrenado con solo 15 episodios y 4.973 fotogramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (la tarea está descrita en francés: "mettre la balle dans le bac2") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes) con un transformer que, a partir de la observación actual (imagen cenital y estado articular), predice un chunk de acciones futuras en lugar de una sola acción. Esta predicción por bloques reduce el error de acumulación y la varianza temporal típica de las políticas paso a paso, y es la razón por la que ACT alcanza tasas de éxito altas en tareas de manipulación con datos de teleoperación. La entrada visual tiene forma `(3, 240, 320)` y el estado `(6,)`; la salida es una acción de `(6,)`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `nguigz/balle2`: 15 episodios, 4.973 fotogramas a 30 FPS, una única tarea y una única cámara (`top`). La configuración reportada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número de tokens de entrenamiento (no aplica en el sentido de LLM), ni composición del dataset más allá de los episodios citados, ni uso de RLHF/DPO; es aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control visual-motor para una tarea de manipulación concreta: colocar una pelota en el contenedor "bac2".
- Predicción de chunks de acciones (action chunking) para suavizar la ejecución y reducir el error acumulado.
- Entrada multimodal: imagen RGB cenital (3x240x320) y estado articular de 6 dimensiones.
- Salida de acciones de 6 dimensiones compatible con el robot `so_follower` de LeRobot.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, código ni visión generalista; es una política robótica especializada.
- Capacidades multilingües: no aplica; la única referencia lingüística es la etiqueta de tarea en francés.

## Casos de uso

- Demostración reproducible de aprendizaje por imitación: usar el modelo como referencia para validar un pipeline completo de LeRobot (grabación, entrenamiento y despliegue) antes de escalar a tareas propias.
- Automatización de una celda de pick-and-place sencilla: el modelo ejecuta la secuencia de recogida y depósito de la pelota en el contenedor, adecuado para prototipos de laboratorio con el robot SO-100/SO-101.
- Base para fine-tuning con nuevos datos: al ser una política ACT pequeña (51,7 M de parámetros), se puede reentrenar con `lerobot-train` sobre un dataset ampliado o con variaciones de posición y iluminación.
- Evaluación de robustez de políticas visuales: sirve para medir cómo afectan cambios de cámara, iluminación o posición de objetos a una política entrenada con solo 15 episodios.
- Docencia y formación en robótica de imitación: ejemplo mínimo y ligero (0,2 GB) para explicar action chunking, teleoperación y evaluación en robot real.
- Pruebas de integración de hardware: validar la cadena cámara-robot-controlador con `lerobot-rollout` y la estrategia `base` sin grabación de episodios, con una duración controlada (por ejemplo, 60 s).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, cabe holgadamente en GPUs de consumo. Una estimación conservadora en FP32 ronda los 0,2-0,3 GB de pesos, más el overhead del codificador visual y del runtime.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100). Para inferencia en tiempo real a 30 FPS, una GPU de gama media es suficiente; también puede ejecutarse en CPU para pruebas no críticas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; el cuello de botella real es la captura de cámara y la latencia del bus del robot, no la memoria.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento; el formato safetensors es compatible con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el dataset y la política operan a 30 FPS, pero no se reportan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguigz/balle2_trained2` (ACT) | 51,7 M | imagen 3x240x320 + estado (6,) | meter pelota en bac2 con `so_follower` | Apache 2.0 | Hugging Face, 30 descargas |
| Otras políticas ACT de LeRobot | variable | variable según dataset | tareas de manipulación diversas | habitualmente Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy | no disponible | no disponible | manipulación visual-motora | no disponible | no disponible |
| Políticas VLA (vision-language-action) | cientos de millones a miles de millones | contexto multimodal amplio | instrucciones en lenguaje natural | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, formato de observación y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política solo está entrenada para la tarea "mettre la balle dans le bac2"; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Dataset muy pequeño: 15 episodios y 4.973 fotogramas, lo que implica alta sensibilidad a cambios de posición, iluminación, fondo o cámara.
- Sin evaluación publicada: no hay tasas de éxito medidas, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia de hardware concreto: robot `so_follower` y una única cámara `top`; los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento.
- Riesgo de sobreajuste y de fallo ante distribuciones fuera de entrenamiento (objetos nuevos, distracciones, otra instancia del mismo robot).
- Sesgos: no se documentan sesgos sociales, pero sí un sesgo de dominio claro hacia el entorno de grabación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código, razonamiento ni tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguigz/balle2_trained2
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/balle2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/balle2
