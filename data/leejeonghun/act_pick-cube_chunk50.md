# leejeonghun/act_pick-cube_chunk50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `leejeonghun/act_pick-cube_chunk50`, es una política entrenada con LeRobot sobre un dataset propio de 50 episodios para la tarea "Grab the black cube" con un robot `so_follower` (SO-100/SO-101) equipado con dos cámaras (overhead y wrist).

El modelo resuelve una tarea única y muy específica: recoger un cubo negro a partir de observaciones visuales de 480x640 píxeles y un vector de estado de 6 dimensiones, emitiendo a su vez un vector de acción de 6 dimensiones. No es un modelo de lenguaje ni un VLA generalista: es una política visuomotora de imitación, con 51,6 millones de parámetros y licencia Apache 2.0.

Su relevancia es la de un ejemplo reproducible de entrenamiento ACT end-to-end con LeRobot 0.6.0: 100.000 pasos de entrenamiento, batch size 8, AdamW con learning rate 1e-5. Sirve como referencia para quien quiera replicar el pipeline o adaptarlo a su propio robot de bajo coste, aunque no incluye evaluación en robot real publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por frame) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según checkpoint) |
| Idiomas soportados | no aplica (modelo robótico; tarea en inglés: "Grab the black cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que procesa conjuntamente las imágenes de las cámaras (`overhead` y `wrist`, ambas de 3x480x640) y el estado propioceptivo del robot (`observation.state`, 6 dimensiones) mediante un encoder visual (típicamente ResNet) y un encoder de estado. El decoder genera un chunk de acciones futuras (configurado aquí con chunk size 50, según el nombre del repositorio) en lugar de una sola acción, lo que aporta suavidad y robustez frente a errores de acumulación. La salida es un vector `action` de 6 dimensiones (típicamente 6 articulaciones del SO-100/SO-101).

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `leejeonghun/pick-cube_20261013_234552`: 50 episodios, 21.886 frames a 25 FPS, tarea "Grab the black cube". Configuración: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta composición del dataset, aumentos de datos, ni uso de RLHF/DPO (no aplica en aprendizaje por imitación). No se especifica la innovación de decodificación especulativa ni atención linear; ACT es un transformer estándar con chunking de acciones.

## Capacidades

- Control visuomotor de un robot `so_follower` (SO-100/SO-101) para la tarea de agarre de un cubo negro.
- Fusión de dos cámaras (overhead y wrist) con estado propioceptivo de 6 dimensiones.
- Predicción de chunks de acciones (chunk size 50) para movimiento suave y estable.
- Ejecución autónoma mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes multi-paso, ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Replicación de experimentos de imitación: sirve como punto de partida para validar el pipeline ACT de LeRobot con un robot SO-100/SO-101 y dos cámaras, comparando curvas de entrenamiento y comportamiento en simulación o banco de pruebas.
- Tarea de pick-and-place de un cubo: el modelo ejecuta "Grab the black cube" en un entorno controlado; útil para demostraciones docentes de aprendizaje por imitación en robótica de bajo coste.
- Base para fine-tuning con datos propios: al ser Apache 2.0 y safetensors, se puede reentrenar con `lerobot-train` sobre un dataset propio para adaptar la política a otros objetos o posiciones.
- Benchmark interno de infraestructura: permite medir latencia de inferencia y throughput de `lerobot-rollout` en GPUs consumer antes de escalar a políticas mayores.
- Educación y divulgación: ejemplo reproducible de entrenamiento ACT con 50 episodios y 21.886 frames, adecuado para talleres sobre LeRobot.
- Integración en pipelines de investigación: como política de referencia para comparar con otros métodos de imitación (Diffusion Policy, VQ-BeT) en la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros, el modelo cabe holgadamente en menos de 2 GB en fp32 y en torno a 1 GB en fp16, incluyendo los encoders visuales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para entrenamiento se recomienda al menos 8-12 GB por el batch de imágenes 480x640.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) y también en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), scripts Python con `lerobot`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la GPU y de la frecuencia de control del robot (dataset a 25 FPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick-cube_chunk50 (este) | 51,6 M | chunk 50 | Pick cube (SO-100/SO-101) | Apache 2.0 | Hugging Face (0 descargas) |
| Diffusion Policy (referencia metodológica) | no disponible | no disponible | Imitación visuomotora | MIT (repo original) | Repos públicos |
| VQ-BeT (referencia metodológica) | no disponible | no disponible | Imitación visuomotora | MIT (repo original) | Repos públicos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación es únicamente categórica (misma familia de métodos de imitación para manipulación robótica).

## Limitaciones y advertencias

- Política entrenada para una única tarea ("Grab the black cube") y un robot concreto (`so_follower`); no generaliza a otros objetos, posiciones o robots sin reentrenamiento.
- Sin evaluación en robot real publicada: no hay tasas de éxito verificadas, por lo que no debe asumirse un rendimiento concreto en producción.
- Dataset pequeño (50 episodios, 21.886 frames) y sin documentación de variabilidad (posiciones, iluminación, distractores), lo que aumenta el riesgo de sobreajuste al entorno de grabación.
- Dependencia de dos cámaras con nombres y resoluciones exactas (`overhead`, `wrist`, 480x640); cambios en la configuración invalidan la política.
- No es un modelo de lenguaje: no tiene sesgos lingüísticos, pero sí puede heredar sesgos visuales del dataset (posiciones, colores, fondos).
- Riesgo de fallo silencioso: al no haber métricas de incertidumbre, la política puede ejecutar acciones erróneas sin señal de alerta.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el dominio tan restringido desaconsejan su uso directo en producción sin validación propia.
- Sin garantías del autor sobre mantenimiento, versiones de LeRobot compatibles más allá de 0.6.0, ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leejeonghun/act_pick-cube_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/leejeonghun/pick-cube_20261013_234552
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leejeonghun/pick-cube_20261013_234552
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
