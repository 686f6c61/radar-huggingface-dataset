# kickking/omx_panda_pick_act_policy_bs8_ep10

## Resumen

`kickking/omx_panda_pick_act_policy_bs8_ep10` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para controlar un brazo robótico de tipo `omx_f` en una tarea de recogida (pick). El modelo aprende de datos teleoperados y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y suele mejorar la tasa de éxito en manipulación real.

Se trata de un modelo de robótica, no de un modelo de lenguaje: consume un estado propioceptivo de 6 dimensiones y una imagen RGB de 480x640, y produce una acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware modesto.

Es relevante como ejemplo de flujo de trabajo de aprendizaje por imitación reproducible con LeRobot: dataset público, configuración de entrenamiento documentada y licencia Apache 2.0. No obstante, la model card no reporta resultados de evaluación en robot real, por lo que su rendimiento efectivo no está validado de forma pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de chunking de acciones: en lugar de predecir una única acción por paso, el modelo predice una secuencia corta de acciones futuras, lo que mitiga el problema de la acumulación de errores en tareas de manipulación de horizonte largo. La entrada del modelo son features de observación: `observation.state` con forma `(6,)` y `observation.images.rgb.camera1` con forma `(3, 480, 640)`. La salida es `action` con forma `(6,)`.

El entrenamiento se realizó sobre el dataset `kickking/omx_panda_pick_1101`, con 30 episodios, 11.660 frames a 15 FPS y una única tarea etiquetada como "0". La configuración reportada es: 14.575 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.1. No se documenta en la model card el uso de RLHF, DPO ni otras fases de ajuste; se trata de aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control de manipulación robótica: genera comandos de acción de 6 dimensiones para un brazo `omx_f`.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de action chunks para reducir el error de composición.
- Fusión de estado propioceptivo (6 dimensiones) e imagen RGB (480x640) en una única política.
- Ejecución en tiempo real mediante `lerobot-rollout` con estrategia `base`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Recogida automatizada de objetos (pick): la política está entrenada específicamente para una tarea de pick sobre el robot `omx_f`; se ejecutaría con `lerobot-rollout` apuntando a la cámara y puerto del robot.
- Reproducción de flujos de aprendizaje por imitación: sirve como referencia para validar el pipeline `lerobot-train` con un dataset pequeño (30 episodios, 11.660 frames) y una configuración concreta.
- Prototipado en laboratorio: al tener 51,7 M de parámetros y 0,2 GB de pesos, permite iterar rápidamente en una estación de trabajo con GPU consumer.
- Docencia y formación: ejemplo didáctico de ACT con dataset público, configuración de entrenamiento documentada y comandos de ejecución.
- Benchmark interno de manipulación: punto de partida para comparar variantes de hiperparámetros (batch size, learning rate, número de pasos) sobre la misma tarea.
- Integración en pipelines de robótica con LeRobot: la política se puede cargar desde el Hub y desplegar con las herramientas estándar de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM libre, incluyendo el procesamiento de la imagen de entrada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para pruebas, aunque la latencia será mayor.
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) según la model card; el ecosistema LeRobot es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La frecuencia de entrenamiento fue de 15 FPS, pero no se reporta la latencia de inferencia en robot.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas comparables con datos de rendimiento, parámetros o contexto que permitan una comparación rigurosa. Como referencia metodológica, ACT se describe en el paper arXiv:2304.13705, pero no se aportan resultados de otras políticas en esta ficha.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot.
- Entrenada para una única tarea ("0") y un robot concreto (`omx_f`), con una sola cámara (`camera1`); no es generalizable a otras tareas sin reentrenamiento.
- Dataset muy pequeño (30 episodios, 11.660 frames), lo que limita la robustez ante variaciones de iluminación, posición de objetos o distractores.
- Riesgo de sobreajuste a las condiciones de recogida de datos; la model card no documenta aumentos de datos ni variabilidad controlada.
- No es un modelo de lenguaje: no procesa texto, no razona simbólicamente y no soporta tool calling ni agentes.
- Sesgos conocidos: no documentados por el autor; en robótica por imitación es habitual el sesgo hacia las trayectorias y posiciones presentes en las demostraciones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El comando de ejemplo de la model card contiene una errata en el identificador del modelo (`kickking/omx_panda_pick_act_pilicy_bs8_ep10` en lugar de `..._policy_...`); conviene verificar la ruta antes de ejecutar.
- La fecha de creación del repositorio (2026-11-10) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_panda_pick_act_policy_bs8_ep10
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_panda_pick_1101
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kickking/omx_panda_pick_1101
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
