# acai7/so101_cube_50ep_finetune

## Resumen

so101_cube_50ep_finetune es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face por el usuario acai7 mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras (una frontal y otra en la muñeca) y del estado articular del robot, predice directamente comandos de acción de 6 dimensiones para un brazo SO-101. Su única tarea es recoger un cubo y depositarlo en una caja.

El modelo se ha entrenado sobre un dataset propio de 50 episodios de teleoperación (31.908 fotogramas a 30 FPS) y consta de 51.668.614 parámetros en formato safetensors, con un repositorio de 0,2 GB. La relevancia de este tipo de políticas radica en que demuestran el flujo completo de imitación de bajo coste en robótica de sobremesa: grabar demostraciones, entrenar con LeRobot y desplegar con `lerobot-rollout` sobre hardware asequible.

Se trata de un artefacto muy específico y de nicho: un fine-tuning de 32.500 pasos sobre una única tarea, sin resultados de evaluación publicados y sin licencia declarada. Resulta útil como referencia reproducible del pipeline ACT/LeRobot, pero no como componente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo robótico; la instrucción de tarea es una cadena de texto fija) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Robot | `so_follower` (SO-101) |
| Cámaras | `front`, `handeye` (entradas `observation.images.top` y `observation.images.wrist`, 3x480x640) |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida de acción | `action`, forma (6,) |
| Dataset de entrenamiento | swapnilpaul/so101_cube_pickplace_pilot_20261120_174602 (50 episodios, 31.908 fotogramas, 30 FPS) |
| Tarea | "Pick up the cube and place it in the box." |
| Pasos de entrenamiento | 32.500 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La política combina un codificador de imágenes (procesa las dos vistas de 3x480x640) con un transformer que, condicionado por el estado articular de 6 dimensiones, genera secuencias de acciones de 6 dimensiones. El modelo se entrenó con 32.500 pasos, batch de 16, AdamW y learning rate 1e-05, con semilla 1000, sobre 50 episodios de teleoperación a 30 FPS (31.908 fotogramas) de una única tarea de pick-and-place.

No se documenta en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset más allá de los episodios y la tarea, ni si hubo etapas de RLHF/DPO (no procede en imitación supervisada). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal; el interés técnico reside en el propio esquema de action chunking y en la integración con LeRobot 0.7.1.

## Capacidades

- Control visomotor de un brazo SO-101 para una tarea concreta: recoger un cubo y colocarlo en una caja.
- Fusión de dos vistas de cámara (frontal y muñeca) con el estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones para ejecución continua a 30 FPS.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución mediante CLI de LeRobot (`lerobot-rollout`) con estrategia base o grabación de episodios.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, código, visión general, audio ni capacidades multilingües.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un cubo y depositarlo en una caja sobre un SO-101, útil para validar montajes y calibraciones antes de escalar a tareas más complejas.
- Reproducción de experimentos de imitación: sirve como referencia reproducible del pipeline ACT + LeRobot con hiperparámetros documentados (32.500 pasos, batch 16, lr 1e-05), facilitando comparaciones entre configuraciones.
- Base para fine-tuning de nuevas tareas: al estar entrenado con LeRobot 0.7.1, puede reentrenarse con `lerobot-train` sobre datasets propios de tareas similares, reutilizando la arquitectura y el flujo de trabajo.
- Docencia y formación en robótica de bajo coste: permite mostrar el ciclo completo de grabación de demostraciones, entrenamiento y despliegue en hardware asequible tipo SO-101.
- Pruebas de integración de hardware: el modelo ayuda a verificar cámaras, puertos y calibración del brazo mediante `lerobot-rollout` con `--duration` acotado.
- Evaluación de robustez de políticas de imitación: al ser una política de una sola tarea con 50 episodios, es un caso de estudio útil para medir sensibilidad a cambios de iluminación, posiciones de objeto y distractores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real (la tabla de éxito por tarea está vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors y dos imágenes de 480x640, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publica una cifra concreta.
- GPU recomendadas: no disponible; LeRobot permite `--policy.device=cuda`, por lo que se asume ejecución en GPU NVIDIA, sin modelo concreto especificado.
- ¿Cabe en GPU de consumo? Sí, por el tamaño del modelo (51,7 M de parámetros) y el repo de 0,2 GB; no se detalla una GPU mínima.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la ejecución está pensada a 30 FPS según el dataset, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| acai7/so101_cube_50ep_finetune | ACT (LeRobot) | 51,7 M | Pick-and-place de cubo en SO-101 | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT (LeRobot) | variable | Tareas diversas | según repositorio | Hugging Face / LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | variable | Manipulación diversa | según repositorio | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) en la información proporcionada, por lo que la comparación se limita a tipo de método, tamaño y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para "Pick up the cube and place it in the box."; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez.
- Dataset pequeño: 50 episodios y 31.908 fotogramas; alta sensibilidad probable a cambios de iluminación, posición del objeto, fondo y variaciones del robot.
- Dependencia de hardware y calibración: requiere un SO-101 calibrado, cámaras con nombres e índices coincidentes con las claves de observación (`observation.images.top`, `observation.images.wrist`) y resolución 640x480 a 30 FPS.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe tratarse como restricción hasta confirmación del autor.
- Riesgo de sobreajuste a la configuración de captura del dataset original; no se documentan sesgos ni alucinaciones en el sentido de modelos de lenguaje, pero sí riesgo de fallos de ejecución fuera de distribución.
- Sin datos de cuantización ni de despliegue en entornos de producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acai7/so101_cube_50ep_finetune
- Dataset de entrenamiento: https://huggingface.co/datasets/swapnilpaul/so101_cube_pickplace_pilot_20261120_174602
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=swapnilpaul/so101_cube_pickplace_pilot_20261120_174602
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
