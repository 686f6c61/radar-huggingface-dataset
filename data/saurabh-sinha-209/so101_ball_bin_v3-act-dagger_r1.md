# Saurabh-sinha-209/so101_ball_bin_v3-act-dagger_r1

## Resumen

`so101_ball_bin_v3-act-dagger_r1` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario Saurabh-sinha-209 en Hugging Face Hub. No se trata de un modelo de lenguaje, sino de un modelo de control robótico entrenado con la librería LeRobot de Hugging Face que, dado el estado articular de un brazo SO-101 y dos flujos de imagen (cámara de banco y cámara de muñeca), predice comandos de acción de 6 dimensiones. El modelo resuelve una única tarea concreta: coger una pelota verde con pinchos y depositarla en un contenedor blanco.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real y reproducible de cómo se empaqueta y despliega una política ACT en el ecosistema LeRobot (versión 0.6.0), incluyendo el esquema exacto de entradas y salidas y los comandos de `lerobot-rollout` y `lerobot-train`. Por otro, sirve como referencia de las limitaciones de las políticas de imitación de un solo task: el modelo no es generalista, no entiende lenguaje natural y su validación depende de la recogida de datos en el robot físico.

El modelo tiene 51.617.414 parámetros (dato extraído de los pesos safetensors) y un repositorio de 2,5 GB. El entrenamiento se realizó sobre un dataset de 195 episodios y 64.547 fotogramas a 30 FPS, con 10.000 pasos, batch de 32, optimizador AdamW y tasa de aprendizaje de 1e-5. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el horizonte es el chunk de acción de ACT) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,5 GB) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición y suaviza la ejecución en robots reales. La política consume `observation.state` con forma `(6,)` y dos imágenes RGB de `(3, 240, 320)` procedentes de las cámaras `bench` y `wrist`, y produce una acción de `(6,)`. El modelo se entrenó con LeRobot 0.6.0 durante 10.000 pasos, batch de 32, AdamW, learning rate 1e-5 y semilla 1000.

El dataset de entrenamiento (`Saurabh-sinha-209/so101_ball_bin_v3_dagger_r1`) contiene 195 episodios y 64.547 fotogramas a 30 FPS para la tarea "pick up the green spiky ball and place it in the white bin". El sufijo `dagger` del nombre sugiere una recogida de datos con agregación iterativa de políticas (DAgger), aunque la model card no detalla el procedimiento de recogida ni la composición exacta de los episodios. No se documenta el uso de RLHF, DPO ni aumentos de datos.

## Capacidades

- Control robótico de imitación para un brazo SO-101 (`so101_follower`) con dos cámaras.
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular e imágenes.
- Ejecución autónoma de la tarea "coger la pelota verde con pinchos y dejarla en el contenedor blanco".
- Integración con el CLI de LeRobot (`lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación simbólica.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del par de cámaras de entrada.

## Casos de uso

- Automatización de picking en laboratorio: el modelo se despliega con `lerobot-rollout` sobre un SO-101 para recoger la pelota verde y colocarla en el contenedor, sirviendo como base para tareas de manipulación de objetos pequeños.
- Banco de pruebas de aprendizaje por imitación: útil para reproducir el flujo completo de LeRobot (grabación, entrenamiento, rollout) y comparar hiperparámetros sin partir de cero.
- Reentrenamiento con DAgger: el nombre del dataset sugiere un pipeline de agregación iterativa; el modelo puede usarse como política inicial para recoger nuevos episodios correctivos y mejorar la robustez.
- Evaluación de robustez visual: al depender de las cámaras `bench` y `wrist`, permite estudiar el efecto de cambios de iluminación, posiciones de objeto y distractores en la tasa de éxito.
- Docencia y divulgación en robótica: ejemplo compacto (51,6 M de parámetros) y de código abierto para explicar ACT, chunks de acción y despliegue en hardware real.
- Integración en pipelines de investigación: al ser una política LeRobot estándar, se puede insertar en scripts de evaluación automatizada que midan tiempo de ejecución y éxito por episodio.
- Base para transferencia a otras tareas de bin picking: con un dataset nuevo y el mismo esquema de observaciones, se puede reentrenar con `--policy.type=act` para objetos o contenedores distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y dos imágenes de 240x320, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publica una cifra exacta.
- GPU recomendadas: no disponible; LeRobot permite `--policy.device=cuda`, por lo que se espera compatibilidad con GPUs NVIDIA con CUDA.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del modelo, pero no hay confirmación oficial ni lista de modelos probados.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout` con `--strategy.type=base`), y entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La ejecución está limitada por la frecuencia de control del robot y por el frame rate de las cámaras (30 FPS en el dataset).

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_ball_bin_v3-act-dagger_r1 | 51,6 M | Estado (6,) + 2 imágenes 240x320 | Tarea única de bin picking | Apache 2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot | no disponible | no disponible | Tareas diversas | variable | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | no disponible | no disponible | Tareas diversas | variable | Hugging Face Hub |
| Políticas VLA generalistas | no disponible | no disponible | Múltiples tareas | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para "coger la pelota verde con pinchos y dejarla en el contenedor blanco"; no generaliza a otras instrucciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni ensayos documentados, por lo que el rendimiento real en el robot es desconocido.
- Dependencia del hardware: requiere un SO-101 (`so101_follower`) y dos cámaras con los nombres `bench` y `wrist`; cualquier cambio de montaje, calibración o resolución puede degradar el comportamiento.
- Sensibilidad a condiciones visuales: cambios de iluminación, posición de objetos o distractores no están cubiertos por la documentación.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de imitación, puede producir comandos erróneos fuera de la distribución de entrenamiento.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no admite instrucciones en lenguaje natural ni tool calling.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, y la model card no incluye vídeo de demostración ni resultados de evaluación; validar en hardware propio antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saurabh-sinha-209/so101_ball_bin_v3-act-dagger_r1
- Dataset de entrenamiento: https://huggingface.co/datasets/Saurabh-sinha-209/so101_ball_bin_v3_dagger_r1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Saurabh-sinha-209/so101_ball_bin_v3_dagger_r1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
