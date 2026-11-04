# mysterium99/smolvla_stage2a_base_to_ds1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado en el ecosistema LeRobot de Hugging Face, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Esta ficha concreta, `mysterium99/smolvla_stage2a_base_to_ds1`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds1`, que contiene 50 episodios y 22.710 fotogramas a 30 FPS de una tarea de manipulación concreta: "Take hardware from human and put in taped area".

El modelo consume tres cámaras RGB de 256x256 píxeles más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Con 450.046.176 parámetros (aproximadamente 450 millones) y un tamaño de repositorio de 0,9 GB en formato safetensors, está pensado para inferencia en tiempo real en robots de tipo `follow` con la librería LeRobot.

Su relevancia radica en que demuestra el flujo completo de especialización de un VLA preentrenado a una tarea concreta con recursos modestos: 20.000 pasos de entrenamiento, batch de 8 y una única GPU. Es un ejemplo práctico de cómo adaptar un modelo fundacional robótico a un entorno de laboratorio o prototipo sin necesidad de infraestructura de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; detalles internos no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico; instrucciones en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. El modelo recibe tres flujos de imagen de 256x256 píxeles (cámaras `gripper`, `newtop` y `newside`) junto con un vector de estado propioceptivo de 6 dimensiones, y emite un vector de acción de 6 dimensiones. La información disponible no detalla la composición interna del transformer ni el mecanismo de fusión multimodal.

Este checkpoint concreto se ha obtenido por fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds1`, con 50 episodios y 22.710 fotogramas a 30 FPS. La configuración de entrenamiento fue: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 0 y LeRobot 0.6.1. No se especifica si hubo RLHF, DPO ni el número total de tokens de entrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado para la tarea "Take hardware from human and put in taped area".
- Percepción multimodal: procesa simultáneamente tres cámaras RGB de 256x256 píxeles.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto en el comando de rollout.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- Despliegue en hardware de consumo: según la model card del modelo base, está pensado para ejecutarse en hardware asequible.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio para este checkpoint.

## Casos de uso

- Automatización de una celda de manipulación: el modelo ejecuta la tarea de recoger hardware de un operario humano y depositarlo en una zona delimitada, integrándose en un puesto de trabajo con robot de tipo `follow`.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para equipos que quieran validar un pipeline de imitación con LeRobot antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: permite reproducir un experimento completo de fine-tuning de un VLA con 50 episodios y 20.000 pasos, útil para estudios comparativos de recetas de entrenamiento.
- Docencia y formación: ejemplo didáctico de extremo a extremo (grabación de datos, entrenamiento, rollout) con un modelo de 450 millones de parámetros y un repositorio de 0,9 GB.
- Benchmark interno de hardware: al ser un modelo pequeño, permite medir latencia y throughput de inferencia en distintas GPU de consumo antes de invertir en modelos mayores.
- Base para fine-tuning en tareas similares: equipos con tareas de pick-and-place pueden reutilizar este checkpoint como inicialización en lugar de partir del modelo base genérico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (0,9 GB), la inferencia en FP32 requeriría del orden de 1,8 GB solo para pesos, más activaciones y buffers de las tres cámaras.
- GPU recomendadas: no especificadas en la información disponible. La model card del modelo base afirma que puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: probable según la afirmación del modelo base, pero sin cifras concretas publicadas para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=mysterium99/smolvla_stage2a_base_to_ds1`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2a_base_to_ds1 | 450.046.176 | no disponible | Manipulación robótica (tarea única) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA generalista preentrenado | no disponible en la información proporcionada | Hugging Face |
| Alternativas VLA de mayor escala (p. ej. familias tipo OpenVLA) | no disponible | no disponible | Manipulación robótica general | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en esta búsqueda.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea ("Take hardware from human and put in taped area") y un único robot de tipo `follow`; no generalizará a otras tareas sin nuevo fine-tuning.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`gripper`, `newtop`, `newside`), lo que limita la portabilidad entre montajes.
- Dataset pequeño: 50 episodios y 22.710 fotogramas implican un riesgo alto de sobreajuste al entorno, iluminación y posiciones de objeto del dataset original.
- Sesgos: no documentados; en robótica por imitación, los sesgos provienen de las demostraciones humanas y de las condiciones de recogida de datos.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones fuera de distribución ante objetos, posiciones o iluminación no vistas durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas: no se documenta soporte multilingüe; las instrucciones del dataset están en inglés.
- Sin datos de cuantización: no se han publicado versiones GGUF ni cuantizadas para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2a_base_to_ds1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/ds1
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
