# muktha212/pi05_pick_up_candy

## Resumen

`muktha212/pi05_pick_up_candy` es un checkpoint de política viso-lenguaje-acción (VLA) obtenido por ajuste fino del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence en el ecosistema LeRobot. El modelo resuelve una tarea concreta de manipulación robótica —"Pick up the candy"— sobre un robot de tipo `so_follower` (familia SO-100/SO-101 de bajo coste) con una única cámara frontal. No es un modelo de propósito general publicable como asistente: es un artefacto de investigación reproducible que demuestra el flujo completo de imitación con LeRobot.

El interés técnico está en que π₀.₅ se plantea como una evolución de π₀ orientada a la generalización en entornos abiertos, y este repositorio muestra su aplicación práctica con un dataset pequeño (75 episodios, 20.939 fotogramas a 30 FPS) y un presupuesto de entrenamiento modesto (3.000 pasos, batch 32, learning rate 2,5e-5). El resultado es una política estrecha, especializada en una sola tarea y un solo montaje físico, útil como referencia de ajuste fino y como plantilla de despliegue.

El checkpoint tiene 4.143.404.816 parámetros en formato safetensors (9,4 GB de repositorio) y licencia Apache 2.0, lo que permite reutilización comercial sin restricciones adicionales más allá de las del modelo base. No se han publicado resultados de evaluación en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot de π₀.₅ (Pi05) de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a diálogo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` (ajuste fino) |
| Tipo de robot | `so_follower` |
| Cámaras | `front` (una sola vista) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.front`, shape `(3, 720, 1280)` |
| Salida | `action`, shape `(6,)` |
| Tamaño del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre la arquitectura π₀.₅ de Physical Intelligence, adaptada a LeRobot desde el repositorio OpenPI. La política consume un vector de estado propioceptivo de 6 dimensiones y una imagen RGB frontal de 720×1280, y emite un vector de acción de 6 dimensiones por paso de control. La model card no detalla la composición interna del backbone (visión, lenguaje, cabecera de acción), el número de tokens de entrenamiento del modelo base ni si hubo RLHF, DPO o etapas de preentrenamiento específicas; esa información corresponde al modelo base `lerobot/pi05_base` y no se reproduce aquí.

El ajuste fino se realizó con el dataset `muktha212/pick_up_candy_20261102_211841`: 75 episodios, 20.939 fotogramas a 30 FPS, una única instrucción de tarea ("Pick up the candy"). La configuración de entrenamiento fue de 3.000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-5, semilla 1000 y LeRobot 0.6.1. Es un régimen de imitación supervisada típico de LeRobot: no se documentan aumentos de datos, currículos ni regularización adicional.

## Capacidades

- Generación de acciones de manipulación de 6 grados de libertad a partir de una imagen frontal y del estado del robot.
- Ejecución de una tarea única y concreta: recoger un caramelo ("Pick up the candy").
- Control reactivo a partir de una sola cámara; no requiere configuración multi-cámara.
- Integración con el stack LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- Compatibilidad con robots `so_follower` (familia SO de bajo coste) y calibración estándar de LeRobot.
- No soporta tool calling, function calling, agentes multi-paso, diálogo multilingüe ni modos de razonamiento explícito: no es un modelo de lenguaje conversacional.
- No se documentan capacidades de visión general (VQA, OCR, grounding) más allá del uso de la imagen como entrada de política.

## Casos de uso

- Replicación de un experimento de imitación de referencia: sirve para validar una instalación de LeRobot de extremo a extremo (grabación, entrenamiento, rollout) con un dataset y una política ya publicados, antes de abordar tareas propias.
- Punto de partida para ajuste fino en una tarea de pick-and-place: el checkpoint puede reentrenarse con `--policy.path=lerobot/pi05_base` y un dataset propio, usando este repositorio como ejemplo de configuración de hiperparámetros (3.000 pasos, batch 32, lr 2,5e-5).
- Docencia y divulgación en robótica de bajo coste: un robot SO-100/SO-101 con una cámara y esta política permiten demostrar un pipeline VLA completo sin hardware de gama alta.
- Pruebas de integración de `lerobot-rollout`: el comando de la model card (`--strategy.type=base`, `--task="Pick up the candy"`, `--duration=60`) sirve como caso de prueba para verificar puertos, cámaras e índices de dispositivo en una máquina nueva.
- Benchmark interno de latencia y throughput en hardware consumer: al ser una política de 4,1 mil millones de parámetros en safetensors, permite medir tiempos de inferencia en GPU de gama media antes de escalar a tareas más complejas.
- Base para experimentos de generalización: al estar ajustada sobre un dataset pequeño y una sola vista, es un caso útil para estudiar sensibilidad a cambios de iluminación, posición de objetos y distractores, aunque el autor no haya publicado esa evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito, número de ensayos ni condiciones de prueba que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa de orden de magnitud, un checkpoint de 4,14 mil millones de parámetros en safetensors ocupa 9,4 GB en el repositorio; en FP16 serían aproximadamente 8,3 GB de pesos, a los que hay que sumar activaciones y el codificador visual, no cuantificados en la documentación.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento de LeRobot usa `--policy.device=cuda`, sin indicar modelo de GPU.
- Viabilidad en GPU consumer: no confirmada. Por tamaño de pesos, una GPU con 16 GB o más de VRAM es el umbral razonable para FP16, pero el dato no está verificado para esta política concreta.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) según la model card; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 30 FPS en la grabación del dataset, pero no se reporta la frecuencia de control efectiva en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `muktha212/pi05_pick_up_candy` | 4.143.404.816 | VLA (π₀.₅ vía LeRobot) | Pick up the candy, robot `so_follower` | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible en la información proporcionada | VLA (π₀.₅ base) | Base preentrenada para ajuste fino | no disponible en la información proporcionada | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible en la información proporcionada | VLA | Manipulación general | no disponible en la información proporcionada | Repositorio OpenPI |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados para este checkpoint ni cifras de parámetros o contexto del modelo base en la información proporcionada. La comparación relevante es cualitativa: este repositorio es un ajuste fino estrecho sobre `lerobot/pi05_base`, mientras que π₀.₅ se presenta como una evolución orientada a generalización en entornos no vistos.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única instrucción ("Pick up the candy") sobre un único montaje físico; no se espera que funcione en otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba, por lo que no puede afirmarse ningún nivel de fiabilidad en producción.
- Dataset pequeño: 75 episodios y 20.939 fotogramas son un volumen reducido; es probable sobreajuste a posiciones, iluminación y fondo del entorno de grabación.
- Una sola cámara frontal: sin vista lateral o de muñeca, la política carece de información para resolver oclusiones o estimar profundidad con robustez.
- Dependencia del hardware: requiere un robot `so_follower` calibrado y cámaras cuyos nombres e índices coincidan con las claves de observación (`observation.images.front`); un montaje distinto invalida el modelo.
- Sesgos: no documentados por el autor; en robótica de imitación los sesgos provienen del dataset (posiciones, objetos, entorno del demostrador) y no se han analizado.
- Riesgo de alucinación en el sentido de acciones erráticas: no cuantificado; al no haber evaluación, no puede acotarse la frecuencia de fallos.
- Licencia Apache 2.0 en este checkpoint, pero las condiciones del modelo base `lerobot/pi05_base` y del método π₀.₅ deben verificarse por separado antes de un uso comercial.
- Repositorio sin descargas ni likes y creado en noviembre de 2026: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muktha212/pi05_pick_up_candy
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/muktha212/pick_up_candy_20261102_211841
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=muktha212/pick_up_candy_20261102_211841
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía LeRobot de pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
