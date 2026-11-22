# sachinkum0009/act_policy_trash

## Resumen

`act_policy_trash` es una política de imitación (imitation learning) para robótica basada en el método Action Chunking with Transformers (ACT), publicado por Zhao et al. en 2023 (arXiv:2304.13705). El modelo ha sido entrenado y publicado por el usuario sachinkum0009 mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es una política visomotora que consume el estado articular del robot y dos cámaras (frontal y de muñeca) y produce comandos de acción de 6 dimensiones, pensada para ejecutarse sobre un robot tipo `so_follower` (SO-100/SO-101 de The Robot Studio).

La tarea concreta para la que fue entrenada es "Pick up the candy wrapper and put it in the bin" (recoger un envoltorio de caramelo y depositarlo en una papelera). El entrenamiento se realizó sobre un dataset propio de 20 episodios y 14.395 fotogramas a 30 FPS, con 10.000 pasos de optimización. El modelo tiene 51.668.614 parámetros y un peso de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware de consumo.

Su relevancia es acotada pero ilustrativa: es un ejemplo canónico de cómo LeRobot permite entrenar y compartir políticas ACT de extremo a extremo con un dataset pequeño, y sirve como referencia para quien quiera replicar el flujo de trabajo de imitación en robots de bajo coste. No obstante, al carecer de evaluación real publicada, de licencia declarada y de resultados de benchmarks, debe tratarse como un artefacto de demostración más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora por paso de control) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este repo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `wrist` (3×480×640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | `hakami1024/wrappers_to_bin_v9_20261122_013059` (20 episodios, 14.395 frames, 30 FPS) |
| Pasos de entrenamiento | 10.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Seed | 1000 |
| Version de LeRobot | 0.7.0 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice secuencias cortas de acciones (action chunks) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un encoder visual (procesa las dos imágenes de cámara a 480×640), un encoder del estado articular de 6 dimensiones y un decoder transformer que genera el chunk de acciones de 6 dimensiones. El modelo se entrena con aprendizaje supervisado sobre demostraciones teleoperadas, sin refuerzo ni RLHF; la pérdida es de regresión sobre las acciones y, típicamente en ACT, se añade una pérdida auxiliar de reconstrucción de imagen estilo CVAE.

El entrenamiento se realizó con LeRobot 0.7.0 durante 10.000 pasos, batch de 8, AdamW con learning rate 1e-5 y semilla 1000, sobre un dataset de 20 episodios y 14.395 fotogramas a 30 FPS de la tarea "Pick up the candy wrapper and put it in the bin". No se documenta composición del dataset más allá del número de episodios ni si hubo aumentos de datos, variaciones de iluminación o posiciones de objetos. Tampoco se especifica la configuración exacta del chunk size ni de la dimensión latente del CVAE, que son hiperparámetros habituales de ACT y que la model card no detalla.

## Capacidades

- Control visomotor de un robot `so_follower` a partir de dos cámaras (frontal y de muñeca) y del estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones para tareas de manipulación de corto horizonte.
- Ejecución de una tarea específica de pick-and-place: recoger un envoltorio y depositarlo en una papelera.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere definición explícita de recompensas).
- Integración con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión general, audio ni capacidades multilingües: es una política robótica, no un modelo de lenguaje.

## Casos de uso

- **Automatización de recogida de residuos en entornos controlados**: el modelo ejecuta la secuencia de pick-and-place de un envoltorio a una papelera; es adecuado para demostraciones de laboratorio o células de trabajo con posiciones de objeto y papelera fijas, dado el reducido dataset de entrenamiento (20 episodios).
- **Base para fine-tuning en tareas de clasificación de residuos**: al ser una política ACT entrenada con LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio ampliado para distinguir tipos de residuos y contenedores, reutilizando la arquitectura y el pipeline.
- **Prototipado rápido de imitación en robots de bajo coste**: el modelo cabe en 0,2 GB y 51,7 M de parámetros, por lo que se puede desplegar en un PC con GPU de consumo conectado a un SO-100/SO-101 para validar flujos de teleoperación y despliegue en horas.
- **Generación de datos sintéticos de evaluación**: sirve como política de referencia para comparar la calidad de nuevos datasets de demostración o para generar rollouts que alimenten un pipeline de evaluación de políticas.
- **Docencia y formación en robótica de imitación**: es un ejemplo completo y reproducible de entrenamiento ACT con LeRobot, útil en cursos y talleres para ilustrar el ciclo teleoperación → dataset → entrenamiento → rollout.
- **Investigación en robustez de políticas visomotoras**: al ser un modelo pequeño y con dataset conocido, permite estudiar sensibilidad a cambios de iluminación, posición de cámara o distractores sin la complejidad de políticas más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de pérdida de entrenamiento reportadas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 51,7 M de parámetros en safetensors (0,2 GB de repo), la inferencia en fp32 requiere del orden de 0,2-0,3 GB de VRAM para los pesos, más el coste de procesar dos imágenes de 480×640 por paso; en la práctica, cualquier GPU con 4 GB o más es suficiente.
- **GPU recomendadas**: no hay recomendación oficial. Por tamaño, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100; el cuello de botella real será el pipeline de cámaras y la latencia de control, no la GPU.
- **Cabe en GPU de consumo**: sí, en cualquier GPU de consumo moderna con al menos 4 GB de VRAM; también es viable en CPU para inferencia, aunque con mayor latencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--strategy.type=base`) es la vía documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica de este tipo.
- **Latencia y throughput estimados**: no disponibles. La model card no reporta frecuencia de control alcanzada ni latencia por chunk; el dataset fue grabado a 30 FPS, pero no se especifica si la política se ejecuta a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sachinkum0009/act_policy_trash` | 51,7 M | chunk de acciones (tamano no documentado) | Pick-and-place de envoltorio | no disponible | Hugging Face (LeRobot) |
| ACT original (Zhao et al., 2023) | no disponible en la informacion | chunk de acciones | Manipulacion general (ALOHA) | codigo abierto (repo oficial) | arXiv:2304.13705, repo oficial |
| Diffusion Policy (Chi et al., 2023) | no disponible en la informacion | horizonte de acciones | Manipulacion visomotora | codigo abierto | repo oficial |
| Otras politicas LeRobot del Hub | variable | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparativa se limita a categoria, tamano y disponibilidad.

## Limitaciones y advertencias

- **Sin evaluacion publicada**: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera de las condiciones exactas del dataset de entrenamiento.
- **Dataset muy reducido**: 20 episodios y 14.395 fotogramas son insuficientes para generalizar a nuevas posiciones de objeto, iluminaciones o configuraciones de cámara; se espera un sobreajuste notable al entorno de grabación.
- **Tarea única y específica**: el modelo solo ha sido entrenado para "Pick up the candy wrapper and put it in the bin"; no es un modelo generalista ni multicomponente.
- **Licencia no declarada**: la model card indica "More Information Needed" en el campo de licencia, por lo que no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- **Dependencia de hardware concreto**: requiere un robot `so_follower` y dos cámaras con nombres `front` y `wrist` que coincidan con las claves de observación; cambios de cámara o de montaje invalidan la política.
- **Riesgo de alucinación en el sentido robótico**: como toda política de imitación, puede generar acciones fuera de distribución ante estados no vistos, con riesgo de colisiones o daños; se recomienda supervisión humana y límites de par/velocidad en el robot.
- **Sesgos de los datos de demostración**: el operador humano que teleoperó los 20 episodios introduce sesgos de trayectoria, velocidad y estrategia de agarre que la política reproducirá.
- **Sin soporte multilingüe ni de texto**: no debe confundirse con un LLM; no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea usada en el rollout.
- **Versionado de LeRobot**: entrenado con LeRobot 0.7.0; cambios de API en versiones posteriores pueden requerir adaptaciones en el script de rollout.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachinkum0009/act_policy_trash
- Dataset de entrenamiento: https://huggingface.co/datasets/hakami1024/wrappers_to_bin_v9_20261122_013059
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hakami1024/wrappers_to_bin_v9_20261122_013059
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
