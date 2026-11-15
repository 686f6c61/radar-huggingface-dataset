# fei1887415157/LeRobot_SO-101_Retract_ACT_224x224

## Resumen

LeRobot_SO-101_Retract_ACT_224x224 es una política de imitación basada en Action Chunking with Transformers (ACT) entrenada con la librería LeRobot de Hugging Face para el robot `so_follower` (familia SO-101). El modelo resuelve una tarea concreta de manipulación robótica: mover una pistola de armado ("rebar gun moving"). En lugar de predecir acciones paso a paso, ACT genera fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y suele aumentar la tasa de éxito en tareas de manipulación reales.

La política consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de vídeo de 224x224 píxeles procedentes de dos cámaras (`rebar gun` y `overhead`), y produce un vector de acción de 6 dimensiones. Con 51.627.654 parámetros, es un modelo compacto que puede ejecutarse en tiempo real a 30 FPS sobre hardware de consumo.

Es relevante como ejemplo práctico de entrenamiento de políticas de imitación con LeRobot 0.6.1 sobre un dataset pequeño (76 episodios, 61.547 frames), y sirve como referencia para quien quiera reproducir el flujo completo de grabación de datos, entrenamiento y despliegue en un robot SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.627.654 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (encoder CNN sobre las imágenes de cámara) con un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales. La entrada son dos imágenes de 224x224 (cámaras `rebar gun` y `overhead`) y el estado del robot de 6 dimensiones; la salida es una acción de 6 dimensiones. El modelo se entrenó con LeRobot 0.6.1 durante 1000 pasos, con batch size 1024, optimizador AdamW, learning rate 1e-4 y semilla 1000.

El dataset de entrenamiento (`fei1887415157/LeRobot_SO-101_Retract_224x224`) contiene 76 episodios y 61.547 frames grabados a 30 FPS, con la tarea "rebar gun moving". No se especifica en la información disponible si hubo aumento de datos, RLHF/DPO ni otras técnicas de refinamiento; ACT es un método puramente supervisado sobre datos de teleoperación.

## Capacidades

- Generación de acciones de control robótico de 6 dimensiones para el robot `so_follower`.
- Percepción visual multimodal a partir de dos cámaras simultáneas (vista de la pistola y vista cenital).
- Predicción de chunks de acciones, lo que permite movimientos más suaves y menor error acumulado que políticas paso a paso.
- Ejecución en tiempo real a 30 FPS (coincidiendo con la tasa del dataset de entrenamiento).
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere recompensas ni entorno simulado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es una política motora especializada.

## Casos de uso

- Automatización de tareas de atornillado o armado con pistola: la política reproduce el movimiento "rebar gun moving" sobre el robot SO-101, adecuada para prototipos de líneas de montaje ligeras.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible de ACT con un dataset pequeño y configuración documentada (1000 pasos, batch 1024) para comparar con otras políticas.
- Reproducción de pipelines de LeRobot: útil para validar el flujo completo `lerobot-train` → `lerobot-rollout` en hardware SO-101 antes de escalar a tareas propias.
- Docencia y formación en robótica: ejemplo didáctico de cómo dos cámaras y un estado articular de 6 dimensiones bastan para entrenar una política de manipulación.
- Prototipado rápido de células robotizadas: al ser un modelo de 51,6 M de parámetros, se puede desplegar en un PC con GPU de consumo junto al robot, sin infraestructura de servidor.
- Pruebas de generalización con variaciones de iluminación o posición de objetos: la política puede servir de punto de partida y reentrenarse con datos adicionales para evaluar robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que en la práctica cabe en cualquier GPU con 2 GB o más (estimación a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) es suficiente; también podría ejecutarse en CPU para inferencia a baja frecuencia.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que carga los pesos safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles; el modelo se entrenó y se espera ejecutar a 30 FPS, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeRobot_SO-101_Retract_ACT_224x224 | 51,6 M | 2 imágenes 224x224 + estado (6,) | Manipulación SO-101 ("rebar gun moving") | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| ACT original (paper 2304.13705) | no disponible | imágenes + estado | Manipulación genérica (ALOHA) | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible | imágenes + estado (+ lenguaje en SmolVLA) | Manipulación genérica | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "rebar gun moving" y el robot `so_follower`; no generaliza a otras tareas ni robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 76 episodios y 61.547 frames; puede presentar sobreajuste a posiciones, iluminación y disposición concretas de las cámaras.
- Dependencia de la configuración de cámaras: los nombres de cámara (`rebar gun`, `overhead`) y sus índices deben coincidir exactamente con los usados en el entrenamiento.
- Sin capacidades lingüísticas ni de razonamiento: no es un LLM ni un VLM; no admite tool calling, agentes ni instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante estados visuales no vistos.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento en el robot objetivo antes de desplegarlo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fei1887415157/LeRobot_SO-101_Retract_ACT_224x224
- Dataset de entrenamiento: https://huggingface.co/datasets/fei1887415157/LeRobot_SO-101_Retract_224x224
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fei1887415157/LeRobot_SO-101_Retract_224x224
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
