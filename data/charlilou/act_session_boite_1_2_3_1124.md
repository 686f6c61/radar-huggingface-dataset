# charlilou/act_Session_boite_1_2_3_1124

## Resumen

`charlilou/act_Session_boite_1_2_3_1124` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está asociado al dataset `charlilou/Session_boite_1_2_3`.

Se trata de un modelo de investigación de autor individual, no de un modelo de lenguaje: su entrada son observaciones de estado del robot (6 dimensiones) y dos flujos de imágenes de cámara (cámara superior y de muñeca, 3x480x640 cada una), y su salida es un vector de acción de 6 dimensiones. El conjunto de entrenamiento consta de 45 episodios y 10.487 fotogramas a 30 FPS, con tres tareas de manipulación ("Entraînement sous boîte 3", "Entraînement sous boîte 2", "Entraînement sous boîte 1").

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB. Es relevante como ejemplo reproducible de entrenamiento de políticas ACT con LeRobot sobre un robot `so_follower`, útil para quien quiera evaluar el flujo completo de imitación (grabación de datos, entrenamiento y despliegue) con hardware de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `top`, `wrist` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.top` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Librería | lerobot |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suele lograr tasas de éxito elevadas en tareas de manipulación. La política consume observaciones multimodales (estado propioceptivo y dos imágenes de cámara) y produce un vector de acción de 6 dimensiones. El modelo se entrenó con LeRobot 0.7.1 sobre el dataset `charlilou/Session_boite_1_2_3`, compuesto por 45 episodios y 10.487 fotogramas a 30 FPS, con tres tareas de manipulación bajo cajas numeradas.

La configuración de entrenamiento documentada es: 3.900 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documentan en la información disponible detalles sobre aumento de datos, número de tokens (no aplica), ni etapas de RLHF o DPO (no aplica a este tipo de política). Tampoco se especifica la composición exacta del dataset más allá del número de episodios, fotogramas y tareas.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de estado propioceptivo e imágenes.
- Percepción visual multimodal: procesa simultáneamente cámara superior (`top`) y de muñeca (`wrist`) a resolución 480x640.
- Ejecución de tareas de manipulación específicas: entrenado para tres tareas concretas de entrenamiento bajo cajas ("boîte 1", "boîte 2", "boîte 3").
- Predicción de fragmentos de acción (action chunking), que mejora la estabilidad frente a políticas paso a paso.
- Despliegue mediante `lerobot-rollout` con `--strategy.type=base` para ejecución en robot real.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades lingüísticas: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: sirve como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento y despliegue) con un robot `so_follower` y dos cámaras.
- Manipulación de objetos bajo cajas: el modelo ejecuta las tareas "Entraînement sous boîte 1/2/3" para las que fue entrenado, útil en entornos controlados de laboratorio.
- Base para fine-tuning con nuevos datos: al ser una política ACT entrenada con LeRobot, puede reentrenarse con `lerobot-train --policy.type=act` sobre datasets propios para adaptarla a otras tareas de manipulación.
- Evaluación de hardware de bajo coste: permite probar el robot `so_follower` con cámaras OpenCV a 640x480 y 30 FPS, midiendo latencia y estabilidad en tiempo real.
- Docencia y formación en robótica: ejemplo didáctico de cómo se estructura un dataset de imitación (45 episodios, 10.487 fotogramas) y cómo se documenta una política en el Hub.
- Comparación de métodos de imitación: sirve como línea base ACT frente a otros métodos disponibles en LeRobot para tareas de manipulación similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 millones de parámetros y pesos safetensors, la huella es reducida, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, lo que implica una GPU NVIDIA compatible con CUDA.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por el tamaño del modelo es plausible, pero no se aporta dato oficial.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) para ejecución en robot real; `lerobot-train` para reentrenamiento. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se especifica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas ACT para robots `so_follower` con dos cámaras) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; se desconoce la tasa de éxito de las tres tareas.
- El modelo está entrenado exclusivamente para tres tareas concretas ("Entraînement sous boîte 1/2/3") y un robot `so_follower`; no es generalizable a otras tareas sin reentrenamiento.
- Las cámaras deben coincidir con los nombres de observación (`top`, `wrist`) y la resolución 480x640; un montaje distinto puede degradar el comportamiento.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- Dataset pequeño (45 episodios, 10.487 fotogramas) y autor individual: riesgo de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- No es un modelo de lenguaje: no admite prompts textuales libres, tool calling ni razonamiento multi-paso.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de una política robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlilou/act_Session_boite_1_2_3_1124
- Dataset de entrenamiento: https://huggingface.co/datasets/charlilou/Session_boite_1_2_3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlilou/Session_boite_1_2_3
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
