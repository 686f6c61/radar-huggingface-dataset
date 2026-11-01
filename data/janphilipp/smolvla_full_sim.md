# JanPhilipp/smolvla_full_sim

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto, `JanPhilipp/smolvla_full_sim`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset de simulación de tareas de manipulación con tres herramientas (alicates, martillo y destornillador), entrenado por el usuario JanPhilipp y publicado el 29 de octubre de 2026.

El modelo resuelve el problema de traducir instrucciones como "Move the pliers from the green area to the red area" en secuencias de acciones de 6 dimensiones para un robot tipo `so_follower`, consumiendo dos cámaras RGB de 480x640 píxeles y un vector de estado de 6 dimensiones. Con 450 millones de parámetros, se posiciona como una alternativa ligera a los VLA de gran escala, pensada para desplegarse en hardware de consumo.

Su relevancia radica en la combinación de un tamaño reducido (repo de 1,2 GB), licencia Apache 2.0 permisiva y una integración directa con las herramientas CLI de LeRobot, lo que facilita tanto la reproducción del entrenamiento como el despliegue en robots reales o simulados sin infraestructura de GPU de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacto, según paper SmolVLA (arXiv 2506.01844) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un cabezal de política que produce acciones continuas. El modelo base `lerobot/smolvla_base` se ajustó durante 40.000 pasos con un batch size de 64, optimizador AdamW, learning rate 0,0001 y semilla 1000, usando LeRobot 0.6.2. El repositorio no detalla la composición exacta del corpus de preentrenamiento del modelo base ni si hubo fases de RLHF o DPO; esa información debe consultarse en el paper asociado.

El ajuste fino específico se realizó sobre el dataset `maxmeyer/three_tool_opt_sim_r4_hybrid_planned_20261029_104146`, compuesto por 246 episodios y 195.781 fotogramas a 30 FPS, con cuatro tareas de manipulación: mover alicates, martillo, destornillador o todas las herramientas de la zona verde a la zona roja. Las entradas son un vector de estado de 6 dimensiones y dos imágenes RGB de 3x480x640; la salida es un vector de acción de 6 dimensiones. El nombre del dataset sugiere datos de simulación con planificación híbrida, aunque la model card no describe la técnica de generación de trayectorias ni el simulador utilizado.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad a partir de observaciones visuales y estado propioceptivo.
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea (mover alicates, martillo, destornillador o todos).
- Percepción visual multi-cámara: procesa dos flujos de imagen simultáneos de 480x640 a 30 FPS.
- Ejecución de políticas de imitación entrenadas por comportamiento clonado sobre demostraciones.
- Despliegue en hardware de consumo, según la descripción del paper.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación de herramientas en simulación: el modelo ejecuta las cuatro tareas del dataset (mover alicates, martillo, destornillador o todos) en un entorno simulado, sirviendo como banco de pruebas para algoritmos de imitación antes de transferir a hardware real.
- Prototipado de políticas VLA en robótica de bajo coste: con 450 M de parámetros y 1,2 GB de pesos, permite iterar sobre un robot `so_follower` en un laboratorio con una sola GPU de consumo, sin necesidad de clústeres.
- Evaluación de técnicas de generación de datos sintéticos: al estar entrenado sobre un dataset de simulación con planificación híbrida, es útil para comparar la calidad de distintas estrategias de recolección de demostraciones.
- Reproducción de experimentos de investigación: la configuración de entrenamiento completa (pasos, batch, LR, semilla, versión de LeRobot) permite replicar el ajuste fino y medir la sensibilidad a hiperparámetros.
- Base para ajuste fino en tareas específicas: al derivar de `lerobot/smolvla_base` con licencia Apache 2.0, se puede reentrenar sobre nuevos datasets propios de manipulación con `lerobot-train`.
- Docencia y formación en VLA: el tamaño reducido y la integración con LeRobot lo hacen adecuado para cursos prácticos de aprendizaje por imitación y control robótico.
- Pruebas de robustez visual: las dos cámaras a 480x640 permiten estudiar cómo afectan cambios de iluminación, oclusiones o posiciones de objetos a la tasa de éxito de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito reportadas para las tareas del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en precisión nativa (fp32) los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de las dos cámaras.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 con 8 GB o superior debería ser suficiente para inferencia, y una RTX 4090 o A100 para reentrenamiento con batch 64.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más, aunque el dato no está confirmado en la model card.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA mediante `--policy.device=cuda` en entrenamiento. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se reporta latencia medida por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JanPhilipp/smolvla_full_sim | 450 M | no disponible | VLA para manipulación con 3 herramientas en simulación | Apache 2.0 | Hugging Face, 27 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para ajuste fino | no disponible en la información | Hugging Face |
| Otros VLA de gran escala (p. ej. RT-2, OpenVLA) | no disponible en la información | no disponible | VLA generalistas | no disponible en la información | no disponible |

La comparación con alternativas de la misma categoría no puede completarse con los datos proporcionados; solo se conoce el modelo base del que deriva y su licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un dataset de simulación con cuatro tareas concretas; no hay evidencia de transferencia a robots reales ni a objetos fuera del conjunto de herramientas.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real de la política, incluso en el propio entorno simulado.
- Dependencia estricta de la configuración de entrada: dos cámaras con nombres `camera1` y `camera2`, resolución 480x640, vector de estado de 6 dimensiones y robot `so_follower`. Cambiar cualquiera de estos elementos invalida la política.
- Riesgo de sobreajuste al dataset de 246 episodios y 195.781 fotogramas, con posibles problemas de generalización ante variaciones de iluminación, posiciones u oclusiones.
- Idiomas: las instrucciones de entrenamiento están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluación de robustez para producción.
- No se detallan sesgos conocidos ni limitaciones de contexto; la información disponible es escasa más allá de la configuración de entrenamiento.
- El repositorio tiene 27 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria mínima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JanPhilipp/smolvla_full_sim
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/maxmeyer/three_tool_opt_sim_r4_hybrid_planned_20261029_104146
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=maxmeyer/three_tool_opt_sim_r4_hybrid_planned_20261029_104146
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
