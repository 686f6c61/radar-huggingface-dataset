# Haku-2004/act_k5t_input_20

## Resumen

`act_k5t_input_20` es una política de imitación (imitation learning) para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario Haku-2004 y se distribuye a través del ecosistema LeRobot de Hugging Face, que es la librería de referencia para entrenamiento y despliegue de políticas robóticas en PyTorch. El modelo resuelve una tarea concreta de manipulación robótica denominada "taskbox" sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot) equipado con dos cámaras: `front` y `side`.

A diferencia de un LLM, este modelo no genera texto: es una política visomotora que consume el estado articular del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones. ACT predice "chunks" de acciones (secuencias cortas de pasos futuros) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad del control. El modelo tiene 51.671.174 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y apto para inferencia en tiempo real.

Es relevante ahora porque ejemplifica el flujo estándar de LeRobot para clonación de comportamiento con hardware de bajo coste: un dataset pequeño (20 episodios, 25.815 frames a 30 FPS) y 50.000 pasos de entrenamiento bastan para producir una política reutilizable. Su licencia Apache 2.0 permite uso comercial y modificación, aunque la ausencia de resultados de evaluación publicados limita su uso en producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.671.174 (51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume una observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantización para este modelo) |
| Idiomas soportados | no disponible (modelo visomotor, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Libreria | lerobot (version 0.5.2) |
| Tipo de robot | so_follower |
| Camaras | front, side |
| Entrada observation.state | STATE, shape (6,) |
| Entrada observation.images.front | VISUAL, shape (3, 480, 640) |
| Entrada observation.images.side | VISUAL, shape (3, 480, 640) |
| Salida action | ACTION, shape (6,) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que combina un codificador de imágenes (extrae características de las dos cámaras) con un codificador del estado articular y un decodificador que genera un chunk de acciones futuras. La innovación principal del método es precisamente predecir secuencias cortas de acciones en lugar de un solo paso, lo que mitiga el problema de compounding error típico de las políticas paso a paso y permite control a mayor frecuencia efectiva. El modelo incluye además el mecanismo de "temporal ensembling" descrito en el paper para suavizar las predicciones entre chunks solapados.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Haku-2004/k5_4seg`, compuesto por 20 episodios y 25.815 frames grabados a 30 FPS, con la tarea "taskbox". La configuración fue: 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ningún proceso de refinamiento posterior; se trata de clonación de comportamiento supervisada pura sobre datos de teleoperación. Tampoco se especifica el número total de tokens ni la composición detallada del dataset más allá de los episodios y frames indicados.

## Capacidades

- Control visomotor de un robot `so_follower` mediante imitación: mapea estado articular (6 dimensiones) e imágenes de dos cámaras a comandos de acción (6 dimensiones).
- Predicción de chunks de acciones, lo que aporta estabilidad temporal en comparación con políticas de un solo paso.
- Ejecución de la tarea concreta "taskbox" para la que fue entrenado; no se documenta generalización a otras tareas.
- Integración nativa con LeRobot: comandos `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de la tarea "taskbox" en un SO-100/SO-101: el modelo ejecuta la política entrenada mediante `lerobot-rollout` con `--strategy.type=base`, adecuado para demostraciones de manipulación repetitiva en laboratorio.
- Base para fine-tuning con nuevos datasets: al ser una política ACT estándar de LeRobot, se puede reentrenar con `lerobot-train --policy.type=act` sobre datos propios y comparar curvas de aprendizaje frente a este checkpoint.
- Prototipado rápido de pipelines de imitación: con solo 20 episodios y 25.815 frames como referencia, sirve para calibrar cuántos datos y pasos de entrenamiento hacen falta para una tarea de manipulación sencilla.
- Docencia y formación en robótica de bajo coste: el tamaño (51,7 M de parámetros, 0,2 GB) permite ejecutar la política en hardware modesto y explicar el flujo completo de teleoperación, grabación y entrenamiento.
- Benchmark interno de infraestructura LeRobot: útil para validar versiones de la librería, compatibilidad de `safetensors` y el comando `lerobot-rollout` antes de desplegar políticas más grandes.
- Recolección de datos asistida: la política puede usarse como punto de partida para teleoperar de forma semi-autónoma y generar nuevos episodios que amplíen el dataset `k5_4seg`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`, por lo que se espera compatibilidad con RTX 3060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650 en adelante) e incluso es viable en CPU para inferencia, aunque la latencia será mayor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La ejecución está pensada para correr a 30 FPS (frecuencia del dataset), pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5t_input_20 | 51,7 M | ACT (LeRobot) | no aplica | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | ACT | no aplica | Apache 2.0 | Hugging Face / docs LeRobot |
| Diffusion Policy (referencia del ecosistema LeRobot) | no disponible | Diffusion policy | no aplica | no disponible | Hugging Face / LeRobot |
| π0 (Physical Intelligence) | no disponible en la informacion | VLA | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para establecer una comparación cuantitativa con alternativas. La comparativa se limita a parámetros, licencia y disponibilidad según la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia de tasa de éxito en robot real, por lo que no debe desplegarse en producción sin validación propia.
- Dataset muy pequeño (20 episodios, 25.815 frames, una sola tarea "taskbox"): alta probabilidad de sobreajuste y escasa generalización a posiciones, iluminación u objetos distintos.
- Dependencia estricta del hardware: solo funciona con robot `so_follower` y cámaras `front` y `side` en las posiciones y resoluciones (480x640) del entrenamiento; cambios de calibración o montaje pueden degradar el rendimiento.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Riesgo de alucinación en sentido figurado: como política de imitación puede generar acciones fuera de distribución ante observaciones novedosas, sin mecanismo de seguridad explícito documentado.
- Licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- Fecha de creación y actualización del repositorio (2026-11-11) y 0 descargas: modelo reciente y sin adopción verificable en la comunidad.
- No se documentan sesgos ni limitaciones idiomáticas porque el modelo no opera sobre lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
