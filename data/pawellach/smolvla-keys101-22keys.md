# PawelLach/smolvla-keys101-22keys

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Esta ficha concreta, `PawelLach/smolvla-keys101-22keys`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset propio de 755 episodios de un robot SO-101 que pulsa teclas concretas de un teclado (22 teclas distintas, de D3 a G#4). Es, por tanto, una política de imitación especializada en una tarea muy acotada, no un modelo de propósito general.

El modelo resuelve el problema de mapear directamente píxeles de cámara y el estado de las articulaciones del robot a comandos de acción de 6 dimensiones, sin necesidad de planificación simbólica ni de un pipeline clásico de percepción-planificación-control. Su relevancia radica en que demuestra que un VLA de 450 millones de parámetros puede ejecutarse en hardware de consumo y ajustarse con pocos miles de pasos a tareas concretas de manipulación.

Arquitectura VLA compacta (transformer multimodal con codificador visual y decodificador de acciones), 450.046.176 parámetros totales, tres cámaras de entrada a 256×256, estado de 6 dimensiones y salida de acción de 6 dimensiones. Licencia Apache 2.0, pesos en safetensors, librería LeRobot 0.7.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, transformer multimodal con codificador visual y cabeza de acciones (smolvla) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto textual; ventana de observación multi-cámara + estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés: "press D4", etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación de tipo VLA que combina un codificador visual (procesa tres cámaras a 256×256 píxeles), un codificador de lenguaje para la instrucción de tarea y un decodificador que emite directamente un vector de acción de 6 dimensiones correspondiente al estado de las articulaciones del robot. El modelo base `lerobot/smolvla_base` se distribuye dentro de LeRobot y está pensado para ajuste fino por tarea; esta versión concreta parte de él y se especializa en una única habilidad.

El ajuste fino se realizó sobre el dataset `PawelLach/so101-keys101-22keys`: 755 episodios, 39.790 fotogramas a 30 FPS, con 22 tareas de pulsación de tecla ("press D4", "press E3", "press A4", etc.). La configuración de entrenamiento reportada es de 6.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000, ejecutado con LeRobot 0.7.1. No se documentan detalles sobre composición del dataset más allá del número de episodios y tareas, ni sobre uso de RLHF/DPO (no aplica en este tipo de política de imitación).

## Capacidades

- Control robótico de imitación: genera comandos de acción de 6 dimensiones para un robot SO-101 (`so_follower`) a partir de observaciones.
- Percepción visual multi-cámara: consume tres flujos de imagen (`front`, `ears`, y una tercera cámara) a 256×256 píxeles.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("press D4", "press E3", etc.) y el modelo la ejecuta.
- Fusión de estado propioceptivo: integra `observation.state` de 6 dimensiones con las imágenes.
- Ejecución en hardware de consumo: el tamaño de 450 M de parámetros permite despliegue en GPU de gama media/consumo.
- Especialización en 22 teclas concretas (D3–G#4), no generalización a teclados arbitrarios.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo "thinking": es una política de control, no un LLM conversacional.

## Casos de uso

- Automatización de pulsación de teclas en un teclado musical o de entrada: el modelo ejecuta la instrucción "press X" sobre un teclado físico con el robot SO-101, adecuado para tareas repetitivas de disparo de notas o comandos.
- Banco de pruebas de imitación visual-motora: sirve para reproducir el pipeline completo de LeRobot (grabación, entrenamiento, rollout) con un caso concreto y pequeño.
- Investigación en VLA de bajo coste: permite estudiar el comportamiento de un VLA de 450 M en tareas de manipulación fina sin necesidad de clústeres grandes.
- Evaluación de robustez ante variaciones de iluminación y posición: al ser una política visual pura, es útil para medir degradación al cambiar condiciones del entorno.
- Docencia y demostraciones: ejemplo reproducible de ajuste fino de `smolvla_base` con 6.000 pasos y dataset de 755 episodios.
- Base para extensiones: punto de partida para añadir más teclas o tareas mediante nuevos datasets y fine-tuning con `lerobot-train`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito por tarea, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en fp32 el peso ronda 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, más overhead de activaciones y tres flujos de imagen a 256×256.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo tipo RTX 3060/4060/4090; para entrenamiento se recomienda al menos una GPU con 8–16 GB.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de RTX modernas; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con backend CUDA (`--policy.device=cuda`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se reportan métricas de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PawelLach/smolvla-keys101-22keys | 450 M | VLA de imitación (SO-101, 22 teclas) | 3 cámaras 256×256 + estado (6,) → acción (6,) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | VLA base para fine-tuning | no disponible | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información | Políticas de imitación | no disponible | no disponible | LeRobot |

No se dispone de datos suficientes en la información proporcionada para comparar rendimiento numérico con alternativas. La comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: solo ejecuta 22 tareas de pulsación de tecla sobre un robot SO-101 concreto; no generaliza a otras tareas ni objetos.
- Sin evaluación publicada: no hay tasas de éxito, por lo que se desconoce su fiabilidad real en producción.
- Dependencia de la configuración de cámaras: los nombres y posiciones de cámara (`front`, `ears`, tercera cámara) deben coincidir exactamente con los del entrenamiento; cambios invalidan la política.
- Sensibilidad a condiciones del entorno: iluminación, posición del teclado y del robot pueden degradar el comportamiento (no cuantificado por el autor).
- Riesgo de sobreajuste al dataset de 755 episodios y 6.000 pasos; no se reportan métricas de validación.
- Idiomas: instrucciones de tarea en inglés; no hay soporte multilingüe documentado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especialización limitan su aplicabilidad directa en producción.
- No es un LLM: no debe usarse para generación de texto, razonamiento, código ni conversación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawelLach/smolvla-keys101-22keys
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/PawelLach/so101-keys101-22keys
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=PawelLach/so101-keys101-22keys
