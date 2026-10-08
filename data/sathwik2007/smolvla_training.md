# Sathwik2007/smolvla_training

## Resumen

Sathwik2007/smolvla_training es un checkpoint de política robótica basado en SmolVLA (Small Vision-Language-Action), el modelo fundacional ligero de Hugging Face para robótica, ajustado con la librería LeRobot sobre el conjunto de datos omy_pnp. Se trata de un modelo visión-lenguaje-acción de aproximadamente 450 millones de parámetros que consume dos vistas de cámara (frontal y de muñeca), el estado propioceptivo del robot y una instrucción en lenguaje natural, y produce un vector de acción de 7 grados de libertad. A diferencia de un LLM conversacional, su salida no es texto sino comandos motores.

Este checkpoint concreto se ha entrenado durante 3000 pasos con un tamaño de lote de 8 sobre un dataset muy reducido: 5 episodios y 542 fotogramas a 20 FPS de una única tarea de manipulación ("Put mug cup on the plate") con un robot de tipo omy. Es, por tanto, una demostración de ajuste fino por imitación más que un modelo de propósito general, y no incluye resultados de evaluación en robot real.

Su relevancia radica en que SmolVLA, según el artículo asociado (arXiv:2506.01844), logra un rendimiento comparable al de modelos VLA diez veces mayores con un coste computacional mucho menor, lo que permite desplegarlo en hardware de consumo. Este repositorio ilustra precisamente ese flujo de trabajo: ajustar un VLA compacto sobre datos propios de LeRobot y ejecutarlo en un robot de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): codificador visión-lenguaje + experto de acción con flow matching |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de acción, no de texto) |
| Tipos de cuantización | no disponible (solo pesos safetensors, sin variantes GGUF, AWQ o GPTQ publicadas) |
| Idiomas soportados | no disponible (la instrucción de la tarea está en inglés: "Put mug cup on the plate") |
| Licencia | no disponible (la model card indica «More Information Needed») |
| Formato de pesos | safetensors (repositorio de 1,2 GB) |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visión-lenguaje que procesa las imágenes de cámara junto con la instrucción textual, y un experto de acción que genera las trayectorias motoras. La información de entrada (múltiples vistas de cámara, estado sensoriomotor del robot e instrucción en lenguaje natural) se codifica en rasgos contextuales que condicionan al experto de acción. El artículo describe además una pila de inferencia asíncrona orientada a mejorar la capacidad de reacción en tareas de manipulación reales. El modelo base está diseñado para ajuste fino sobre datasets de LeRobot.

Este checkpoint se ha entrenado por imitación (aprendizaje supervisado de demostraciones) con los siguientes hiperparámetros: 3000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y versión de LeRobot 0.6.2. El dataset de entrenamiento (omy_pnp) contiene 5 episodios, 542 fotogramas a 20 FPS y una única tarea. Las entradas son `observation.image` (3, 256, 256), `observation.wrist_image` (3, 256, 256) y `observation.state` (6,); la salida es `action` (7,). No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores.

## Capacidades

- Manipulación robótica por imitación: genera comandos de acción de 7 dimensiones para un robot de tipo omy.
- Condicionamiento por lenguaje natural: acepta una instrucción textual que modula el comportamiento (en este checkpoint, la tarea "Put mug cup on the plate").
- Entrada multi-cámara: procesa simultáneamente una vista frontal (`observation.image`) y una de muñeca (`observation.wrist_image`) a 256x256 píxeles.
- Integración de estado propioceptivo: consume un vector de estado de 6 dimensiones del robot.
- Inferencia en tiempo real: la pila de inferencia asíncrona de SmolVLA está pensada para mejorar la respuesta en manipulación real.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso tipo agente en el sentido de un LLM.
- No genera texto ni mantiene conversaciones.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión general, audio): no disponible; solo visión como entrada sensorial para la política.

## Casos de uso

- Recogida y colocación de objetos (pick and place) en laboratorio: el modelo reproduce la tarea "Put mug cup on the plate" usando la vista frontal y la de muñeca para localizar el objeto y la posición de la pinza, y emite acciones de 7 grados de libertad.
- Punto de partida para ajuste fino con más datos: dado que se apoya en LeRobot y en SmolVLA, se puede reentrenar con `lerobot-train` añadiendo episodios para ampliar la variedad de posiciones y objetos.
- Investigación en aprendizaje por imitación y VLA: sirve como referencia reproducible de un ajuste fino de SmolVLA sobre un dataset pequeño, útil para estudiar sobreajuste y generalización.
- Evaluación de SmolVLA en hardware de consumo: al tener ~450 M de parámetros, permite medir latencia y tasa de éxito en GPUs asequibles o en dispositivos embebidos tipo Jetson.
- Prototipado de pipelines de robótica con LeRobot: el repositorio incluye el comando `lerobot-rollout` para ejecutar la política directamente sobre el robot, lo que facilita validar la cadena completa de captura, inferencia y actuación.
- Docencia y demostraciones de robótica de bajo coste: con un robot de tipo omy y dos cámaras, se puede mostrar un ciclo completo de teleoperación, grabación de datos y entrenamiento de una política.
- Reproducción de experimentos de manipulación de una sola tarea: útil para comparar variaciones de hiperparámetros (pasos, lote, semilla) manteniendo fijo el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. El artículo asociado afirma que SmolVLA alcanza un rendimiento comparable al de modelos VLA diez veces mayores, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni de tasa de éxito en robot en la información facilitada.

## Requisitos de hardware

- Inferencia en precisión completa (FP32): aproximadamente 1,8 GB solo para los pesos.
- Inferencia en BF16/FP16: aproximadamente 0,9 GB para los pesos; con activaciones de dos imágenes de 256x256 y estado, el consumo total estimado es de 2 a 4 GB de VRAM.
- El repositorio ocupa 1,2 GB, lo que sugiere que incluye varios checkpoints además de los pesos finales.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores; también es plausible en dispositivos embebidos con memoria unificada (no confirmado en la información disponible).
- GPU recomendadas según disponibilidad: RTX 4090 o A100/H100 para entrenamiento rápido; para inferencia basta una GPU de gama media.
- Opciones de despliegue: la librería LeRobot con PyTorch, mediante los comandos `lerobot-rollout` (ejecución) y `lerobot-train` (entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles como métrica publicada. El dataset de entrenamiento está grabado a 20 FPS y SmolVLA incorpora una pila de inferencia asíncrona, pero no se proporcionan cifras de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sathwik2007/smolvla_training | ~450 M | VLA (política de imitación) | no disponible | Hugging Face, 0 descargas, 1 like |
| SmolVLA (base) | ~450 M | VLA | no disponible en la información proporcionada | Hugging Face / LeRobot |
| OpenVLA | ~7 B | VLA | no disponible en la información proporcionada | Hugging Face |
| pi0 | ~3,3 B | VLA con flow matching | no disponible en la información proporcionada | Hugging Face / openpi |

Nota: los datos de OpenVLA y pi0 proceden de conocimiento público general y no han sido verificados en la información proporcionada; deben confirmarse antes de usarse en una decisión técnica. SmolVLA es el único modelo de la tabla con un tamaño que permite despliegue directo en GPU de consumo.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente pequeño: 5 episodios y 542 fotogramas para una sola tarea elevan el riesgo de sobreajuste y de escasa generalización a nuevas posiciones, iluminaciones o distractores.
- Ausencia de evaluación: no hay resultados de tasa de éxito en robot real ni en simulación para este checkpoint.
- Licencia sin especificar: la model card indica «More Information Needed», por lo que no hay base clara para uso comercial. Se debe aclarar antes de cualquier despliegue en producción.
- Dependencia de hardware concreto: la política espera un robot de tipo omy, dos cámaras con nombres concretos y un estado de 6 dimensiones; no funcionará sin adaptación en otra plataforma.
- Una única tarea e instrucción en inglés: no hay evidencia de generalización a otras tareas ni a otros idiomas.
- Riesgo de fallo fuera de distribución: en robótica, una política sobreajustada puede generar acciones erráticas o inseguras ante objetos o entornos no vistos.
- Idiomas soportados no disponibles: no se puede asumir multilingüismo.
- Métricas de latencia y throughput no publicadas: conviene medirlas en el hardware objetivo antes de integrar en un bucle de control.
- Advertencia de seguridad: cualquier despliegue sobre hardware físico debe contar con límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sathwik2007/smolvla_training
- Artículo SmolVLA (arXiv): https://arxiv.org/html/2506.01844v1
- Artículo SmolVLA (Hugging Face Papers): https://huggingface.co/papers/2506.01844
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento omy_pnp: https://huggingface.co/datasets/omy_pnp
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Documentación de SmolVLA (espejo): https://dctx-team.github.io/lerobot-zh/en/smolvla/
- Resumen en ScienceStack: https://www.sciencestack.ai/paper/2506.01844
- Resumen en Emergent Mind: https://www.emergentmind.com/papers/2506.01844
