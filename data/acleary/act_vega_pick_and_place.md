# acleary/act_vega_pick_and_place

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice bloques cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. Este repositorio concreto, `acleary/act_vega_pick_and_place`, es una política entrenada con LeRobot sobre el robot `vega_1p_follower` para la tarea de recoger y colocar objetos ("pick_and_place").

El modelo consume observaciones multimodales (estado articular de 24 dimensiones, tres cámaras RGB, una cámara de profundidad, dos cámaras frontales y una IMU de 10 dimensiones) y produce un vector de acción de 23 dimensiones. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware robótico, no a despliegue en servidores de gran escala.

Es relevante porque ejemplifica el flujo actual de políticas de imitación publicadas en el Hub de Hugging Face mediante LeRobot: entrenamiento reproducible desde un dataset teleoperado, pesos en safetensors y ejecución directa con la CLI `lerobot-rollout`. No obstante, carece de evaluación publicada y de datos de benchmarks, por lo que su utilidad práctica debe validarse empíricamente en el robot objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.704.471 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer que combina un codificador de imágenes (procesa las cinco cámaras de entrada) con un transformer codificador-decodificador que genera un chunk de acciones futuras a partir del estado y las observaciones visuales. La predicción por chunks, en lugar de paso a paso, es la innovación central del método: reduce el horizonte efectivo de decisión y mitiga el compounding error típico de las políticas de imitación.

El entrenamiento se realizó sobre el dataset `acleary/vega_pick_and_place`, con 80 episodios, 79.540 frames a 20 FPS y la tarea única "pick_and_place". La configuración reportada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.2. No se documenta composición del dataset más allá de la tarea, ni si hubo aumento de datos, regularización o variaciones de la receta estándar de ACT.

## Capacidades

- Control robótico por imitación: genera acciones de 23 dimensiones para el robot `vega_1p_follower`.
- Fusión multimodal de entrada: integra estado articular (24 dimensiones), IMU (10 dimensiones) y cinco flujos visuales (tres RGB, una profundidad y dos frontales).
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados.
- Ejecución en tiempo real mediante `lerobot-rollout` con la estrategia `base`.
- Entrenamiento reproducible con `lerobot-train` y `--policy.type=act`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política se ejecuta sobre el robot `vega_1p_follower` con `lerobot-rollout` para recoger y colocar objetos en entornos controlados, aprovechando la fusión de cámaras RGB y profundidad.
- Base para fine-tuning en tareas similares: al estar entrenada sobre 80 episodios y 79.540 frames, sirve como punto de partida para reentrenar con `lerobot-train` en variantes de la misma tarea con nuevos objetos o posiciones.
- Investigación en aprendizaje por imitación: permite reproducir el pipeline ACT de LeRobot de extremo a extremo (grabación, entrenamiento, despliegue) con una configuración documentada y semilla fija.
- Prototipado de manipulación con múltiples cámaras: útil para validar arquitecturas de fusión visual con cinco flujos simultáneos (tres RGB, profundidad y dos frontales) en un robot de tipo follower.
- Docencia y demostraciones: el tamaño compacto (0,2 GB, 51,7 M de parámetros) y la licencia Apache 2.0 facilitan su uso en cursos y talleres de robótica.
- Integración en pipelines LeRobot: se puede encadenar con las herramientas de visualización de datasets y de rollout para evaluar el comportamiento antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,7 M de parámetros en safetensors, el peso de los pesos ronda los 100-200 MB en fp32/fp16, pero el consumo real depende del codificador visual y de las cinco cámaras de entrada.
- GPU recomendadas: no disponible. La configuración de entrenamiento usa `--policy.device=cuda`, lo que implica una GPU NVIDIA, pero no se especifica modelo.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de parámetros sería viable en GPUs de consumo, pero no hay datos de memoria pico ni de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), librería `lerobot` 0.6.2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 20 FPS y el ejemplo de rollout usa cámaras a 30 FPS, pero no se reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| acleary/act_vega_pick_and_place | 51,7 M | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Políticas ACT de LeRobot (otras) | variable | no aplica | variable según dataset | variable | Hugging Face |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada; la comparación se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar su fiabilidad.
- Dataset pequeño y de una sola tarea: 80 episodios y una única tarea ("pick_and_place") limitan la generalización a otros objetos, posiciones o entornos.
- Dependencia del hardware: la política está entrenada para el robot `vega_1p_follower` con cinco cámaras específicas; usar otro robot o configuración de cámaras invalida las observaciones esperadas.
- Sin datos de sesgos: no se documentan sesgos, pero al ser una política de imitación hereda los sesgos y la distribución del dataset teleoperado.
- Riesgo de fallo silencioso: al no haber evaluación, no se conocen los modos de fallo (colisiones, agarres fallidos, deriva) en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin capacidades de lenguaje ni de razonamiento: no debe emplearse como modelo de texto, código o agentes.
- Idiomas no disponibles: no aplica como modelo multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acleary/act_vega_pick_and_place
- Dataset: https://huggingface.co/datasets/acleary/vega_pick_and_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=acleary/vega_pick_and_place
