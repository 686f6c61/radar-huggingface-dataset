# Deviant65/pi0.5_rebot6

## Resumen

`Deviant65/pi0.5_rebot6` es un ajuste fino (fine-tune) del modelo visión-lenguaje-acción (VLA) π₀.₅ de Physical Intelligence, adaptado al framework LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, implementa la arquitectura π₀.₅ orientada a la generalización en entornos abiertos: parte de π₀ y se entrena para operar en situaciones y entornos no vistos durante el entrenamiento. Este repositorio concreto especializa el modelo para una tarea de manipulación robótica sobre un brazo `rebot_b601_follower` equipado con dos cámaras Intel RealSense (D415 y D405).

El modelo consume el estado articular del robot (vector de 7 dimensiones) y dos flujos de imagen RGB de 480×640 píxeles, y produce un vector de acción de 7 dimensiones. Se ha entrenado mediante imitación (imitation learning) sobre un dataset propio de 55 episodios y 54.291 fotogramas a 30 FPS, con una única tarea: recoger una caja azul y devolver el brazo a la posición de reposo.

Es relevante como ejemplo práctico de cómo el ecosistema LeRobot permite a un usuario individual ajustar un VLA de base (con aproximadamente 4.140 millones de parámetros) para un robot y una tarea concretos con un coste de datos relativamente bajo. No obstante, se trata de un modelo experimental con cero descargas y cero valoraciones en el momento de redactar esta ficha, sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (implementación LeRobot, adaptada de OpenPI) |
| Parámetros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `rebot_b601_follower` |
| Cámaras | `d415`, `d405` (Intel RealSense) |
| Entrada de estado | `observation.state`, shape `(7,)` |
| Entradas visuales | `observation.images.d415` y `observation.images.d405`, shape `(3, 480, 640)` |
| Salida | `action`, shape `(7,)` |
| Tamaño del repositorio | 9,4 GB |
| Modelo base | `lerobot/pi05_base` |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA de Physical Intelligence que evoluciona π₀ con el objetivo de generalizar a entornos y situaciones completamente nuevos. La implementación utilizada proviene del repositorio OpenPI y ha sido portada al ecosistema LeRobot. La arquitectura combina un backbone visión-lenguaje con un cabezal de acciones que mapea observaciones (estado + imágenes) a comandos motores de 7 dimensiones. No se dispone en la información proporcionada de detalles sobre el número de capas, el mecanismo de atención ni la composición exacta del backbone.

El ajuste fino se realizó sobre el dataset `Deviant65/rebot_6_20261112_150133`, compuesto por 55 episodios y 54.291 fotogramas a 30 FPS, todos ellos de la tarea "Pick up the blue box, then return the arm to the home position". La configuración de entrenamiento fue: 20.000 pasos, batch size de 16, optimizador AdamW, learning rate de 2,5e-05, semilla 1000 y LeRobot versión 0.7.1. No se indica en la model card si se emplearon técnicas de RLHF, DPO ni otras fases de alineación; el paradigma es de imitación supervisada sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 grados de libertad a partir del estado articular y dos vistas de cámara.
- Percepción visual multimodal: procesa simultáneamente dos flujos RGB (D415 y D405) de 480×640.
- Ejecución de una tarea específica de pick-and-place: recoger una caja azul y volver a la posición home.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con `lerobot-train`.
- Ajuste fino adicional: puede reentrenarse a partir de `lerobot/pi05_base` con nuevos datasets.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas ni generación de lenguaje natural en la información disponible.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la secuencia de recogida de una caja y retorno a home sobre un brazo `rebot_b601_follower`, adecuado para tareas repetitivas de alimentación de piezas en una célula de fabricación.
- Prototipado rápido de políticas robóticas: un equipo puede grabar 55 episodios con dos cámaras y ajustar π₀.₅ en 20.000 pasos para validar una tarea antes de invertir en un sistema industrial, gracias al flujo estándar de LeRobot.
- Investigación en imitación visual-motora: sirve como referencia reproducible de un fine-tune de π₀.₅ con configuración de entrenamiento documentada (AdamW, lr 2,5e-05, batch 16), útil para comparar variantes.
- Base para experimentos de generalización: al derivar de π₀.₅, diseñado para generalizar a entornos nuevos, permite estudiar la transferencia a posiciones de objeto o iluminación distintas de las del dataset.
- Docencia y formación en robótica con IA: el repositorio incluye comandos de ejecución y entrenamiento que permiten montar prácticas de laboratorio con hardware asequible (brazo rebot + RealSense).
- Evaluación de robustez ante cambios de cámara: al depender de dos vistas concretas (D415 y D405), permite medir la sensibilidad de un VLA a la sustitución o recolocación de sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,14 mil millones de parámetros, una estimación orientativa en FP16 rondaría los 8-9 GB solo para pesos, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta en la información disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Deviant65/pi0.5_rebot6` | 4,14 mil M | no disponible | Manipulación robótica (pick-and-place) | gemma | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base para generalización | no disponible | Hugging Face (modelo base) |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA predecesor | no disponible | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo ni de otros fine-tunes públicos de π₀.₅ en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una única tarea ("Pick up the blue box, then return the arm to the home position") y un único robot (`rebot_b601_follower`); no se espera que funcione en otras tareas sin reentrenamiento.
- Dataset pequeño: 55 episodios y 54.291 fotogramas, lo que limita la robustez ante variaciones de posición, iluminación o distracciones.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de hardware concreto: requiere las cámaras D415 y D405 con los nombres de observación exactos; cambiar de sensor o de montaje invalida la política.
- Licencia `gemma`: impone las condiciones de la licencia Gemma, que deben revisarse antes de cualquier uso comercial.
- Riesgo de sobreajuste y de fallo silencioso: al ser imitación supervisada sobre pocas demostraciones, puede reproducir sesgos de las trayectorias grabadas y fallar sin aviso en estados fuera de distribución.
- Sin datos de sesgos lingüísticos ni de alucinación textual: el modelo no genera lenguaje, por lo que esas categorías no aplican, pero sí puede producir acciones incorrectas o inseguras.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/pi0.5_rebot6
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/rebot_6_20261112_150133
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/rebot_6_20261112_150133
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
