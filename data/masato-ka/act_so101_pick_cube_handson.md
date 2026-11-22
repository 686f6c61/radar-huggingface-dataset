# masato-ka/act_so101_pick_cube_handson

## Resumen

`masato-ka/act_so101_pick_cube_handson` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) sobre el ecosistema LeRobot de Hugging Face. No se trata de un modelo de lenguaje, sino de un modelo de control visuomotor que consume el estado articular de un brazo robótico SO-101 (6 dimensiones) y una imagen de cámara frontal (3x480x640) para producir comandos de acción de 6 dimensiones. El modelo lo publica el usuario `masato-ka` como artefacto de un taller práctico ("handson") de recogida de un cubo.

El modelo resuelve una tarea muy concreta: "Pick up the red cube and place it in the box". Se entrenó con 10 episodios de teleoperación (4134 frames a 30 FPS) durante 20000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5. Su relevancia es la de un ejemplo reproducible de entrenamiento de políticas ACT con LeRobot, útil para quien quiera replicar el flujo completo de grabación de datos, entrenamiento y despliegue en un robot de bajo coste.

La arquitectura es un transformer con codificador visual y decodificador de acciones que predice *chunks* de acciones (varias acciones futuras de una vez) en lugar de pasos individuales, lo que reduce el error de composición y estabiliza la ejecución. El repo ocupa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación definida por la arquitectura ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo visuomotor, sin entrada de texto libre) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.7.1 durante el entrenamiento) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front` (3x480x640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de un único paso. La arquitectura combina un backbone transformer que procesa la observación visual junto con el estado propioceptivo del robot y un decodificador que genera el chunk de acciones. Esta formulación mitiga el problema de acumulación de error típico de las políticas paso a paso y permite ejecutar movimientos más suaves y consistentes. El método se describe en el paper arXiv:2304.13705, referenciado en la model card.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `masato-ka/so101_pick_cube_handson_20261122_110348`, compuesto por 10 episodios y 4134 frames a 30 FPS de una única tarea de manipulación. La configuración reportada es de 20000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan detalles sobre aumentos de datos, composición exacta del dataset más allá de la tarea, ni si se aplicaron técnicas adicionales de regularización.

## Capacidades

- Control visuomotor de un brazo SO-101 a partir de una imagen frontal de 480x640 y el estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones para ejecución continua en bucle de control a 30 FPS.
- Ejecución de la tarea específica de recoger un cubo rojo y depositarlo en una caja.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbólico ni agentes basados en texto.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la observación visual de control.

## Casos de uso

- Reproducción de un taller de imitación robótica: el modelo sirve como referencia para que estudiantes comparen su propia política entrenada con una ya publicada sobre el mismo dataset y robot, usando `lerobot-rollout` con `--policy.path=masato-ka/act_so101_pick_cube_handson`.
- Validación de pipelines de entrenamiento con LeRobot: permite comprobar que la instalación, la calibración del SO-101 y las cámaras están correctamente configuradas antes de grabar datos propios, ejecutando la política durante 60 segundos sobre la tarea de recogida del cubo.
- Punto de partida para *fine-tuning*: al estar entrenada sobre una tarea sencilla de pick-and-place, puede servir como inicialización para tareas relacionadas con el mismo robot y cámara, reduciendo el número de episodios necesarios.
- Docencia en aprendizaje por imitación: ilustra de forma concreta el efecto del *action chunking* frente a políticas paso a paso, con una configuración de entrenamiento documentada y reproducible (20000 pasos, batch 8, lr 1e-5, semilla 1000).
- Pruebas de integración hardware-software: útil para verificar la latencia del bucle de control a 30 FPS con una cámara OpenCV de 640x480 y el puerto serie del robot antes de desplegar políticas más complejas.
- Benchmark interno de referencia: sirve como línea base de éxito en la tarea "Pick up the red cube and place it in the box" para comparar nuevas políticas entrenadas con más episodios o con variaciones de la arquitectura ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito en robot real, ni número de ensayos, ni condiciones de evaluación (posiciones de objetos, iluminación, distracciones).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors en fp32, la huella del modelo es de aproximadamente 0,2 GB, por lo que cualquier GPU consumer con 4 GB o más debería poder alojarlo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060, RTX 4060 o superior es suficiente; para entrenamiento se recomienda una GPU con al menos 8 GB para acomodar el batch size 8 y el codificador visual.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4-6 GB de VRAM para inferencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el flujo de entrenamiento usa `lerobot-train` con `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El bucle de control opera a 30 FPS según el dataset de entrenamiento, pero no se reportan métricas de latencia de inferencia ni de throughput en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `masato-ka/act_so101_pick_cube_handson` | 51,7 M | imagen 3x480x640 + estado (6,) | Pick cubo rojo en caja (SO-101) | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | variable | imagen + estado | Tareas de manipulación diversas | según repo | Hub de Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | imagen + estado | Manipulación visuomotora | según repo | Hub de Hugging Face |
| Políticas π0 / π0-fast (openpi) | ~3 B | imagen + estado + lenguaje | Manipulación generalista | según repo | Hugging Face / GitHub |

La comparación cuantitativa de rendimiento no está disponible porque este modelo no publica evaluación. Frente a alternativas como Diffusion Policy o π0, ACT destaca por su simplicidad y bajo coste computacional, pero carece de generalización a instrucciones en lenguaje natural y de evaluación pública en este caso concreto.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con solo 10 episodios de un único operador, por lo que hereda los sesgos de trayectoria, velocidad y estilo de ese demostrador.
- Riesgo de sobreajuste y alucinación motora: con 4134 frames y 20000 pasos de entrenamiento, es probable que la política funcione solo en condiciones muy próximas a las del dataset (posición inicial del cubo, iluminación, fondo) y falle ante variaciones.
- Limitaciones de contexto y percepción: una única cámara frontal de 480x640 y estado de 6 dimensiones; no hay percepción 3D explícita ni detección de objetos.
- Sin evaluación publicada: no hay tasa de éxito reportada, por lo que no se puede recomendar para producción sin validación propia en robot real.
- Restricciones de licencia: la licencia figura como "[More Information Needed]" en la model card; no se puede asumir uso comercial sin contactar con el autor.
- Caveat de reproducibilidad: depende de la versión de LeRobot (0.7.1) y de la calibración exacta del robot y las cámaras; cambios de hardware o de índices de cámara pueden invalidar el comportamiento.
- Sin soporte de lenguaje natural: la tarea se fija en el prompt `--task="Pick up the red cube and place it in the box"`; el modelo no interpreta instrucciones nuevas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masato-ka/act_so101_pick_cube_handson
- Dataset de entrenamiento: https://huggingface.co/datasets/masato-ka/so101_pick_cube_handson_20261122_110348
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=masato-ka/so101_pick_cube_handson_20261122_110348
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
