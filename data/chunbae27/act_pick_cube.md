# chunbae27/act_pick_cube

## Resumen

`chunbae27/act_pick_cube` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub por el usuario chunbae27 y entrenada con el framework LeRobot de Hugging Face. El modelo resuelve una tarea robótica concreta de manipulación: coger un cubo y colocarlo a la derecha ("Pick up the cube and place it on the right"). No es un modelo de lenguaje generativo, sino un controlador visomotor que mapea observaciones (estado del robot y dos cámaras) a comandos de acción de 6 dimensiones.

La arquitectura ACT, descrita en el paper arXiv:2304.13705, predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y la varianza temporal en tareas de imitación. El modelo cuenta con 51.576.454 parámetros y un repositorio de 0,6 GB en formato safetensors, lo que lo hace ligero y desplegable en hardware modesto.

Es relevante ahora porque ejemplifica el ecosistema LeRobot para robótica de bajo coste (robot `so_follower`, también conocido como SO-100/SO-101), donde políticas pequeñas entrenadas con pocos datos (50 episodios, 18.472 frames) permiten reproducir experimentos de imitación en laboratorios y entornos educativos sin grandes recursos de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.576.454 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de observaciones según configuración ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de "chunking" de acciones: en lugar de predecir una acción por paso, predice una secuencia corta de acciones futuras, lo que mitiga el error compounding típico de las políticas de imitación autorregresivas. La política consume dos flujos visuales (`observation.images.overhead` y `observation.images.wrist`, ambos de 3×480×640) y un vector de estado de 6 dimensiones (`observation.state`), y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `chunbae27/pick-cube`, compuesto por 50 episodios y 18.472 frames a 30 FPS de teleoperación sobre un robot `so_follower`. La configuración reportada es: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre demostraciones.

## Capacidades

- Control visomotor de manipulación robótica: mapea imágenes de dos cámaras y estado articular a comandos de acción de 6 dimensiones.
- Ejecución de la tarea específica "Pick up the cube and place it on the right" sobre el robot `so_follower`.
- Aprendizaje por imitación a partir de teleoperación (50 episodios, 18.472 frames).
- Predicción de chunks de acciones (múltiples pasos por inferencia), lo que aporta suavidad temporal.
- Integración nativa con el ecosistema LeRobot (CLI `lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política robótica, no un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: sirve como política de referencia para validar el pipeline LeRobot con el robot `so_follower` y dos cámaras (overhead y wrist) en un montaje de laboratorio o aula.
- Docencia en aprendizaje por imitación: permite a estudiantes entrenar y desplegar una política ACT completa en pocas horas de GPU, comparando hiperparámetros (pasos, batch size, learning rate) sobre el mismo dataset.
- Benchmark interno de manipulación pick-and-place: al ser una tarea acotada (coger un cubo y colocarlo a la derecha), se puede usar como baseline para medir mejoras de nuevas políticas o de cambios en la configuración de cámaras.
- Prototipado de pipelines de teleoperación a política: el dataset asociado (50 episodios a 30 FPS) ejemplifica el flujo completo de grabación, entrenamiento y rollout documentado por LeRobot.
- Base para fine-tuning en tareas similares: al tener licencia Apache 2.0 y pesos safetensors, se puede reentrenar sobre datasets propios de pick-and-place con objetos o posiciones distintas.
- Validación de infraestructura de inferencia robótica: con 51,6 M de parámetros y 0,6 GB de repositorio, es adecuado para probar latencias y tasas de control en GPUs de consumo o incluso CPU antes de escalar a políticas mayores (p. ej., diffusion policies o VLA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors, el peso en FP32 ronda los 206 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para la política; el cuello de botella real serán las dos cámaras a 640×480 y 30 FPS y el proceso de inferencia en tiempo real.
- ¿Cabe en consumer GPU? Sí, por tamaño de parámetros; no hay confirmación oficial de latencias ni de GPUs concretas probadas (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado; el formato safetensors permite cargarlo con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. La política está pensada para ejecutarse a 30 FPS (frecuencia del dataset), pero no se reportan métricas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| chunbae27/act_pick_cube | 51.576.454 | Pick-and-place de cubo, robot `so_follower`, 2 cámaras | apache-2.0 | Hugging Face Hub (LeRobot) |
| Otras políticas ACT en LeRobot Hub | no disponible | Tareas de manipulación variables | variable | Hugging Face Hub |
| Diffusion Policy (referencia metodológica) | no disponible | Manipulación visomotora con acciones por difusión | variable | Repositorios de investigación |
| Políticas VLA (p. ej., OpenVLA) | varios miles de millones | Instrucciones en lenguaje + control robótico | variable | Hugging Face Hub |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas; la comparación anterior es meramente cualitativa y de categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con 50 episodios de un único operador y montaje, la política probablemente está sobreajustada a posiciones, iluminación y objetos del dataset `pick-cube`.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento (objetos distintos, posiciones nuevas, cambios de iluminación).
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural. La tarea está fijada por el dataset y debe pasarse como cadena en `--task`.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; el uso en robot real conlleva riesgos físicos que deben evaluarse independientemente.
- Caveats para producción: no hay evaluación publicada de tasa de éxito; el modelo está entrenado para un robot y montaje concretos (`so_follower`, cámaras `overhead` y `wrist`); cambios en la configuración de cámaras o en el robot requieren reentrenamiento. El repositorio es pequeño (0,6 GB) y ligero, pero la robustez en entornos reales no está validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chunbae27/act_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/chunbae27/pick-cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chunbae27/pick-cube
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
