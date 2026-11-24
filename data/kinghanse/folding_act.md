# kinghanse/folding_act

## Resumen

`kinghanse/folding_act` es una política de robótica basada en el método Action Chunking with Transformers (ACT), publicada por el usuario kinghanse en Hugging Face a través de la librería LeRobot. No es un modelo de lenguaje: es una política de imitación entrenada para controlar un robot bimanual en la tarea concreta de doblar toallas ("folding towels"). Con 51.685.006 parámetros (unos 51,7 millones), se sitúa en el rango de los modelos compactos de robótica, muy lejos de los LLM, y su objetivo es predecir secuencias cortas de acciones (action chunks) a partir de observaciones visuales y propioceptivas.

El modelo consume una observación de estado de 14 dimensiones (la posición articular de los dos brazos) y una imagen RGB de 480x640 píxeles procedente de una única cámara cenital (`cam_top`), y produce una acción de 14 dimensiones. Fue entrenado sobre el dataset `kinghanse/folding`, que contiene 30 episodios y 23.780 fotogramas a 30 FPS de teleoperación. La relevancia de este tipo de políticas radica en que demuestra el flujo completo de imitación en robots reales con LeRobot: grabar datos, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`.

Se trata de un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados y sin model card extendida más allá de la plantilla de LeRobot. Su utilidad práctica está acotada al robot `bi_so102_client` y a la tarea de doblar toallas, por lo que debe considerarse una política específica de tarea y no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea son cadenas de texto fijas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un backbone visual (encoder de imágenes) con un transformer que procesa la secuencia de observaciones y genera un chunk de acciones; el modelo incluye además una cabeza de estilo CVAE para modelar la variabilidad de las demostraciones humanas. La entrada es una imagen de 3x480x640 y un vector de estado de 14 dimensiones; la salida es una acción de 14 dimensiones, coherente con un robot bimanual de dos brazos SO-102.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `kinghanse/folding` (30 episodios, 23.780 fotogramas, 30 FPS), con 50.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se documenta el número de tokens ni la composición del dataset más allá de la tarea "folding towels", ni si hubo RLHF/DPO (no aplica en imitación). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal; el método base es el descrito en el paper arXiv:2304.13705.

## Capacidades

- Control robótico de manipulación bimanual: genera acciones de 14 dimensiones para un robot `bi_so102_client` a partir de estado propioceptivo e imagen cenital.
- Predicción de action chunks: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la suavidad y la tasa de éxito en tareas de imitación.
- Percepción visual monocámara: procesa imágenes RGB de 480x640 desde `cam_top`.
- Ejecución de una tarea concreta: "folding towels" (doblar toallas), condicionada por la instrucción de tarea.
- Integración con LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Automatización de doblado de toallas en un banco de pruebas: la política se ejecuta con `lerobot-rollout` sobre el robot `bi_so102_client` y la cámara `cam_top`, reproduciendo la tarea aprendida de 30 episodios de teleoperación.
- Reproducción de experimentos de imitación: sirve como referencia para validar el pipeline de LeRobot 0.6.0 (grabación, entrenamiento con ACT y despliegue) en un robot bimanual SO-102.
- Base para fine-tuning con nuevos datos: al ser un checkpoint ACT de 51,7 M de parámetros y licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre datasets propios de tareas similares de manipulación de tejidos.
- Docencia y demostraciones de aprendizaje por imitación: su tamaño reducido (0,2 GB) y su naturaleza específica lo hacen adecuado para talleres prácticos de robótica con hardware asequible.
- Evaluación comparativa de políticas ACT: permite medir la variabilidad de resultados entre checkpoints entrenados con distintos hiperparámetros sobre el mismo dataset.
- Prototipado de control bimanual: útil para estudiar la coordinación de dos brazos en tareas de plegado, aunque sin garantías de éxito fuera del entorno de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors, la huella en memoria es del orden de cientos de MB, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponibles; el entrenamiento se realizó con `--policy.device=cuda`, sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmada en la documentación.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robótica.
- Latencia y throughput: no disponibles; la ejecución se realiza a 30 FPS según el dataset, pero no se publican métricas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kinghanse/folding_act | 51.685.006 | no aplica | Doblar toallas (bi_so102_client) | apache-2.0 | Hugging Face (0 descargas) |
| Otros checkpoints ACT en LeRobot | no disponible | no aplica | Manipulación variable | apache-2.0 (habitual) | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación variable | variable | Hugging Face / repositorios de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "folding towels" y el robot `bi_so102_client`; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que se desconoce su fiabilidad.
- Dataset pequeño: 30 episodios y 23.780 fotogramas son una base limitada, lo que aumenta el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Dependencia de una única cámara cenital: la percepción se limita a `cam_top`, lo que reduce la información visual disponible frente a configuraciones multicámara.
- Sesgos y alucinaciones: no aplican en el sentido de los LLM, pero existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía sobre el comportamiento del modelo en producción.
- Sin soporte multilingüe ni de instrucciones en lenguaje natural más allá de la cadena de tarea fija.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinghanse/folding_act
- Dataset de entrenamiento: https://huggingface.co/datasets/kinghanse/folding
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kinghanse/folding
