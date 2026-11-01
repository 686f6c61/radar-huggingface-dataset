# rsundaraws/act_arm2_fill_wristonly

## Resumen

`act_arm2_fill_wristonly` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario rsundaraws en Hugging Face y entrenada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea robótica concreta de manipulación: coger un cubo y colocarlo en una caja naranja, empleando un robot tipo `so_follower` (familia SO-101) y una única cámara montada en la muñeca. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones e imagen RGB de 480x640) a comandos de acción de 6 dimensiones.

La arquitectura es un transformer ACT con 51.668.614 parámetros totales (aproximadamente 51,7 millones), que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, una técnica introducida en el paper de 2023 que mejora la estabilidad y la tasa de éxito en tareas de imitación. El entrenamiento se realizó sobre un dataset propio de 65 episodios y 22.621 fotogramas a 30 FPS, durante 30.000 pasos con batch de 32 y optimizador AdamW.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) para un robot de bajo coste, y como punto de partida para quien quiera replicar la tarea o adaptar el flujo a otro objeto o entorno. No dispone de evaluación publicada en robot real, por lo que su rendimiento efectivo no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer visuomotor |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) a partir de observaciones multimodales. La política combina un codificador visual para la imagen de muñeca (`observation.images.wrist`, tensor 3x480x640) con el estado articular (`observation.state`, vector de 6 componentes) y genera acciones de 6 dimensiones. El modelo se entrenó con LeRobot 0.6.1 durante 30.000 pasos, batch de 32, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni datos externos al dataset propio.

El dataset de entrenamiento (`rsundaraws/so101_arm2_fill_wrist`) contiene 65 episodios teleoperados, 22.621 fotogramas a 30 FPS y una única tarea: "Pick up the cube and place it in the orange box". Se trata, por tanto, de un modelo de política especializado y de dominio muy restringido, no de un modelo generalista. No se especifican innovaciones adicionales como decodificación especulativa o atención lineal; la contribución técnica es la propia formulación de action chunking del paper de referencia.

## Capacidades

- Control visuomotor de un robot `so_follower` con una cámara de muñeca.
- Predicción de acciones de 6 grados de libertad a partir de estado articular e imagen.
- Ejecución de una tarea única de pick-and-place: coger un cubo y depositarlo en una caja naranja.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Despliegue mediante CLI de LeRobot (`lerobot-rollout`) con estrategia base o con grabación de episodios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de visión general, audio ni modo de pensamiento (thinking); la visión se limita a la cámara de muñeca del robot.

## Casos de uso

- Replicación de la tarea pick-and-place en un SO-101: sirve como referencia funcional para validar que el hardware, la calibración y las cámaras están correctamente configurados antes de entrenar políticas propias.
- Docencia y formación en aprendizaje por imitación: el repo incluye comandos de entrenamiento y despliegue, lo que permite usarlo como ejemplo completo del ciclo LeRobot en un curso o taller.
- Base para fine-tuning con nuevos objetos: partiendo de esta política, se puede recoger un dataset adicional con otro objeto y reentrenar para adaptar la tarea manteniendo el mismo robot y cámara.
- Pruebas de pipeline de datos: con 65 episodios y 22.621 fotogramas, el dataset asociado es manejable para experimentar con aumentos de datos, filtrado de episodios o cambios en la frecuencia de muestreo.
- Evaluación comparativa de políticas ACT frente a otras (p. ej., Diffusion Policy) en una tarea de manipulación de dificultad baja, usando el mismo robot y dataset.
- Demostración de despliegue en robot real con `lerobot-rollout` durante una duración fija (`--duration=60`), útil para validar latencia y comportamiento del bucle de control a 30 FPS.
- Automatización de una celda de laboratorio sencilla: si la tarea y el entorno coinciden exactamente con los del entrenamiento, la política puede ejecutar el pick-and-place de forma autónoma, aunque sin garantías cuantificadas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros, los pesos en safetensors ocupan del orden de 0,1-0,2 GB en FP32, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 o superior es suficiente; el cuello de botella real será la captura de cámara y el bucle de control, no el modelo.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=rsundaraws/act_arm2_fill_wristonly`), que carga la política desde el Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS según el dataset de entrenamiento, pero no se publican mediciones de latencia de inferencia ni de tasa de éxito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rsundaraws/act_arm2_fill_wristonly` | 51,7 M | no aplica | Pick-and-place cubo en caja naranja, SO-101 con cámara de muñeca | Apache 2.0 | Hugging Face, 22 descargas |
| ACT (implementación de referencia LeRobot) | no disponible | no aplica | Aprendizaje por imitación genérico | Apache 2.0 | Repo de LeRobot |
| Diffusion Policy (alternativa habitual en manipulación) | no disponible | no aplica | Aprendizaje por imitación genérico | no disponible en esta ficha | Implementaciones en LeRobot y otros repos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea y un único montaje (robot `so_follower`, cámara de muñeca, cubo y caja naranja). Cambios de objeto, iluminación, posición o robot invalidan probablemente el comportamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no debe asumirse un rendimiento concreto en producción.
- Dependencia de la cámara de muñeca: la política no usa cámaras externas; si el montaje o la calibración difieren, las observaciones no coincidirán con las de entrenamiento.
- Dataset pequeño: 65 episodios y 22.621 fotogramas son insuficientes para generalización robusta; se espera sobreajuste al entorno de grabación.
- Sin capacidades de lenguaje ni razonamiento: no admite instrucciones en lenguaje natural, tool calling ni planificación; la tarea se pasa como cadena fija (`--task`).
- Riesgo de alucinación no aplica en el sentido textual, pero sí existe riesgo de acciones erráticas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; aun así, la responsabilidad sobre el comportamiento físico del robot recae en el integrador.
- Sin garantías de seguridad física: como toda política de control, requiere límites de par, paradas de emergencia y supervisión durante el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsundaraws/act_arm2_fill_wristonly
- Dataset de entrenamiento: https://huggingface.co/datasets/rsundaraws/so101_arm2_fill_wrist
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rsundaraws/so101_arm2_fill_wrist
