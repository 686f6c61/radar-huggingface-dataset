# Kimura-881014/cut_act_thesis_cam2_omly

## Resumen

`cut_act_thesis_cam2_omly` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot y publicada en Hugging Face por el usuario Kimura-881014. No es un modelo de lenguaje: es un controlador robótico que, a partir del estado articular de un brazo `so101_follower` y de dos cámaras (muñeca y lateral), predice directamente comandos de acción de 6 dimensiones. El modelo resuelve una tarea concreta de manipulación: cortar patatas o chips entrelazados ("cut entangle chips").

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducido con la versión 0.7.1 de LeRobot, con 51,67 millones de parámetros y 20.000 pasos de entrenamiento sobre 103 episodios teleoperados (72.725 fotogramas a 30 FPS). No hay resultados de evaluación publicados ni licencia declarada, por lo que no debe considerarse un componente listo para producción.

El interés técnico está en que ejemplifica el flujo completo de imitación visual-motora con ACT: entrada multimodal (estado + dos vistas RGB de 480x640), salida de acciones continuas y despliegue mediante `lerobot-rollout` sobre hardware SO-101. Es útil como referencia para quien entrene sus propias políticas con LeRobot, no como modelo general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con codificador visual y transformer |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica con la cadena `"cut entangle chips"`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La política consume `observation.state` con forma `(6,)` y dos imágenes RGB de `(3, 480, 640)` procedentes de las cámaras `wrist` y `side`, y produce una acción de forma `(6,)`. El checkpoint tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `Kimura-881014/cut_entangled_chips_after_deletion`: 103 episodios, 72.725 fotogramas a 30 FPS, una única tarea ("cut entangle chips"). La configuración declarada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset más allá del recuento de episodios, ni uso de RLHF/DPO (no aplicable en imitación supervisada), ni innovaciones adicionales sobre el método ACT original.

## Capacidades

- Control robótico de manipulación de 6 grados de libertad sobre un brazo `so101_follower`.
- Política visomotora: fusiona estado articular y dos vistas de cámara para generar acciones continuas.
- Predicción de *action chunks*, que mitiga el drift acumulado en horizontes largos.
- Ejecución de una tarea concreta de corte ("cut entangle chips") en el entorno para el que fue entrenada.
- Despliegue en tiempo real a 30 FPS mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como punto de partida para verificar el pipeline de LeRobot 0.7.1 (grabación, entrenamiento y rollout) antes de abordar tareas propias.
- Automatización de una celda de corte de laboratorio: el modelo ejecuta la secuencia de corte sobre el mismo tipo de objeto y montaje con el que fue entrenado, reduciendo el tiempo de programación manual de trayectorias.
- Docencia en robótica de manipulación: permite mostrar de extremo a extremo cómo una política ACT convierte observaciones visuales en acciones, con un coste computacional bajo (0,2 GB de pesos).
- Benchmark interno de hardware SO-101: al ser una política fija, facilita comparar latencias y repetibilidad entre distintas configuraciones de cámara o puerto del robot.
- Base para *fine-tuning*: al estar en formato LeRobot, puede reentrenarse con `lerobot-train --policy.type=act` sobre un dataset ampliado o con variaciones de iluminación y posición de objetos.
- Prueba de integración de visión estéreo: el uso de dos cámaras (`wrist` y `side`) sirve para validar la sincronización y calibración de un montaje multivista en tareas de precisión.
- Validación de pipelines de despliegue en el borde: con 51,7 M de parámetros, el modelo cabe en GPUs de consumo y permite probar inferencia local sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía), por lo que no existen tasas de éxito verificables para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros y 0,2 GB de pesos en safetensors), la huella en FP32 ronda los 0,2 GB y en FP16 los 0,1 GB, a lo que se suma el coste de los dos codificadores visuales y del buffer de imágenes.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el autor entrena con `--policy.device=cuda`. No se especifican modelos concretos.
- GPU de consumo: sí cabe en tarjetas consumer (por ejemplo, RTX 3060/4060/4090), dado el reducido número de parámetros; no se aportan mediciones.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La captura está fijada a 30 FPS y 640x480 por cámara, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cut_act_thesis_cam2_omly` (este) | 51,67 M | estado (6,) + 2 imágenes 480x640 | Corte de chips entrelazados en SO-101 | no disponible | Hugging Face, 0 descargas |
| ACT original (paper 2304.13705) | no disponible en la información | no disponible | Manipulación bimanual (referencia metodológica) | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible | no disponible | Manipulación genérica | según cada repo | Hub de Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a naturaleza del método y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posición de objetos o distracciones.
- Especialización extrema: entrenada para una única tarea ("cut entangle chips") y un único tipo de robot (`so101_follower`); no generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Dependencia del montaje de cámaras: los nombres `wrist` y `side` y sus índices deben coincidir exactamente con los usados en el entrenamiento; un cambio de calibración degrada el comportamiento.
- Dataset pequeño: 103 episodios y 72.725 fotogramas limitan la diversidad; el modelo puede sobreajustar a las condiciones de recogida.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación, puede ejecutar movimientos fuera de distribución sin señal de error explícita.
- Sin soporte de lenguaje natural real: la cadena de tarea es una etiqueta, no una instrucción interpretada; no admite comandos nuevos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- El nombre del repositorio (`cam2_omly`) sugiere una variante parcial del montaje de cámaras; conviene verificar que la configuración de inferencia coincide con la de entrenamiento antes de usarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kimura-881014/cut_act_thesis_cam2_omly
- Dataset de entrenamiento: https://huggingface.co/datasets/Kimura-881014/cut_entangled_chips_after_deletion
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kimura-881014/cut_entangled_chips_after_deletion
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
