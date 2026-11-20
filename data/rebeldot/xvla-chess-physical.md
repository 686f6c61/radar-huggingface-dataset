# RebelDot/xvla-chess-physical

## Resumen

`xvla-chess-physical` es una política robótica (policy) obtenida por fine-tuning supervisado del modelo base `lerobot/xvla-base` mediante la librería LeRobot. El autor es RebelDot y el modelo está publicado en Hugging Face con el pipeline `robotics`. Su propósito es controlar un brazo robótico SO101 en una tarea concreta de manipulación física relacionada con el ajedrez, entrenada sobre un dataset local denominado `local/so101-chess-physical` que no está publicado en el repositorio.

Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a imitación: recibe observaciones multimodales (tres cámaras y el estado de las articulaciones) y emite secuencias de acciones de 30 pasos (chunk size 30). El entrenamiento se realizó durante 240.000 pasos con batch de 8 y learning rate de 1,5e-4, y el repositorio incluye 16 checkpoints intermedios cada 15.000 pasos, además de los estados del optimizador para reanudar el entrenamiento.

La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino una política específica de un robot y una tarea. Su interés para desarrolladores e investigadores reside en servir como ejemplo reproducible de fine-tuning VLA con LeRobot sobre hardware SO101, y en la disponibilidad de checkpoints intermedios para estudiar la evolución del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) `xvla`, implementada en LeRobot; detalles internos de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación con ventana de observación; no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no se documenta soporte lingüístico) |
| Licencia | no disponible |
| Formato de pesos | pesos LeRobot (`pretrained_model/` con pesos, config y pre/post-procesadores); formato de serialización concreto no disponible |
| Modelo base | `lerobot/xvla-base` |
| Pasos de entrenamiento | 240.000 |
| Batch size | 8 |
| Learning rate | 0,00015 |
| Chunk size / action steps | 30 / 30 |
| Semilla | 1000 |
| Entradas | `observation.images.image`, `observation.images.image2`, `observation.images.image3`, `observation.state` |
| Checkpoints | 015000 a 240000, cada 15.000 pasos (16 en total) |
| Tamaño del repo | 0.0 GB (según Hugging Face; posiblemente pesos aún no materializados o no contabilizados) |

## Arquitectura y entrenamiento

La arquitectura es una política VLA del ecosistema LeRobot, concretamente la variante `xvla`, inicializada desde `lerobot/xvla-base` y ajustada mediante aprendizaje por imitación supervisada sobre un dataset de demostraciones de un brazo SO101. La entrada combina tres flujos de imagen (`observation.images.image`, `observation.images.image2`, `observation.images.image3`) con el vector de estado de las articulaciones (`observation.state`); la salida es un chunk de 30 acciones consecutivas, lo que reduce la frecuencia de inferencia necesaria y suaviza el control.

El entrenamiento consistió en 240.000 pasos con batch de 8, learning rate 1,5e-4 y semilla 1000. No se documenta el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; en políticas de imitación como esta lo habitual es entrenamiento supervisado puro sobre pares observación-acción. El repositorio conserva el estado completo del optimizador, scheduler y RNG en `training_state/`, lo que permite reanudar el entrenamiento exactamente desde cualquier checkpoint. Los logs incluidos (`train.log` y un log de fallo de permisos) aportan trazabilidad del proceso.

## Capacidades

- Control robótico de un brazo SO101 mediante predicción de secuencias de acciones de 30 pasos.
- Fusión multimodal de tres cámaras y el estado articular como entrada.
- Ejecución de una tarea específica de manipulación física vinculada al ajedrez, aprendida por imitación.
- Reanudación de entrenamiento desde checkpoints intermedios con estado de optimizador y RNG.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de experimentos VLA: el repositorio permite cargar cualquiera de los 16 checkpoints y comparar el comportamiento de la política en distintas fases del entrenamiento, útil para estudiar curvas de aprendizaje en imitación.
- Base para fine-tuning en tareas de ajedrez robótico: sirve como punto de partida para ajustar la política a variantes de la misma tarea (distintas posiciones iniciales, piezas o tableros) reutilizando los pesos entrenados.
- Docencia y divulgación en robótica: ejemplo completo y autocontenido de entrenamiento con LeRobot sobre SO101, con configuración y logs incluidos, adecuado para cursos prácticos de VLA.
- Investigación en manipulación de precisión: la tarea de colocar o mover piezas de ajedrez exige control fino; la política puede emplearse como referencia en estudios de precisión y robustez.
- Evaluación de robustez ante cambios de cámara o iluminación: al depender de tres vistas, permite analizar la sensibilidad de políticas VLA a perturbaciones visuales.
- Integración en pipelines de simulación-a-realidad: los checkpoints pueden evaluarse en simuladores compatibles con LeRobot antes de desplegar en el brazo físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño real de los pesos de `xvla-base`, que no se documenta.
- GPU recomendadas: no disponible. Al ser una política VLA con tres cámaras, se recomienda una GPU con al menos 8-16 GB de VRAM para inferencia en tiempo real, aunque esta cifra es una estimación orientativa y no un dato del autor.
- Cabe en GPU de consumo: probablemente sí en modelos como RTX 3090 o RTX 4090, pero no confirmado por el autor.
- Opciones de despliegue: LeRobot mediante `get_policy_class("xvla").from_pretrained(...)`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RebelDot/xvla-chess-physical` | VLA fine-tuned (SO101, ajedrez) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| `lerobot/xvla-base` | VLA base | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Políticas LeRobot tipo ACT / Diffusion Policy | Políticas de imitación | no disponible | no disponible | no disponible | Ecosistema LeRobot |

La comparación cuantitativa con alternativas no es posible con la información disponible, ya que no se publican parámetros, benchmarks ni licencia para este modelo ni para el base.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot (SO101); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Dataset no publicado: el dataset `local/so101-chess-physical` no está disponible en el repositorio, lo que impide reproducir el entrenamiento exacto.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial es incierto y requiere contactar con el autor.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios en iluminación, posición de cámaras o fondo pueden degradar el rendimiento.
- Tamaño del repositorio reportado como 0.0 GB: conviene verificar que los pesos estén efectivamente subidos antes de intentar cargarlos.
- Sin datos de benchmarks ni de evaluación en el mundo real: no hay evidencia publicada de tasa de éxito.
- Sin soporte documentado de idiomas ni de texto: no debe emplearse como modelo de lenguaje.
- Sin garantías de seguridad física: al controlar un brazo real, es imprescindible implementar límites de par, paradas de emergencia y validación en simulación antes del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RebelDot/xvla-chess-physical
- Modelo base: https://huggingface.co/lerobot/xvla-base
- LeRobot (librería): https://github.com/huggingface/lerobot
