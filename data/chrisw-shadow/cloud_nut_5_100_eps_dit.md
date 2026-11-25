# chrisw-shadow/cloud_nut_5_100_eps_dit

## Resumen

`cloud_nut_5_100_eps_dit` es una política de imitación robótica publicada por el usuario `chrisw-shadow` en Hugging Face, entrenada con la librería LeRobot y basada en la arquitectura Multi-Task Diffusion Transformer (DiT), descrita en el paper arXiv:2507.05331. El modelo resuelve una tarea concreta de manipulación: agarrar una tuerca y enroscarla en un tornillo orientado hacia arriba ("grasp the nut and then thread it onto the upwards facing bolt"). Se distribuye como un checkpoint de 238.312.213 parámetros (unos 238 M) en formato safetensors, con un repositorio de 1.0 GB.

La política consume el estado del robot (vector de 39 dimensiones) y tres cámaras RGB de 480x640 (una fija y dos en las muñecas del robot `ur10e_dexee`), y produce un vector de acción de 21 dimensiones. El entrenamiento se realizó sobre el dataset `chrisw-shadow/nut_5_subset_rel_2`, con 100 episodios, 93.078 fotogramas a 50 FPS, durante 75.000 pasos con batch de 64, optimizador Adam y tasa de aprendizaje 2e-5.

Es relevante como ejemplo práctico de aplicación de DiT a robótica de imitación multi-tarea con condicionamiento texto+visión, y como referencia reproducible del ecosistema LeRobot 0.7.0. No obstante, se trata de un modelo de nicho, sin métricas de evaluación publicadas, sin licencia declarada y con cero descargas en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto experimental más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento texto + visión; soporta objetivos de difusión y flow-matching |
| Parametros totales | 238.312.213 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación por paso; no aplica ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (condicionamiento por instrucción de tarea en texto; el dataset usa inglés) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es una política de imitación basada en Diffusion Policy extendida con un Diffusion Transformer (DiT) de gran tamaño, según la descripción del paper referenciado (arXiv:2507.05331). Acepta condicionamiento conjunto de texto (la instrucción de la tarea) y visión (tres cámaras), lo que permite aprendizaje multi-tarea sobre un mismo backbone. El paper indica que soporta tanto objetivos de difusión como de flow-matching y que alcanza alta destreza con aproximadamente 450 M de parámetros; este checkpoint concreto tiene 238 M, por lo que es una instancia más pequeña que la configuración de referencia del paper.

Los detalles de entrenamiento declarados en la model card son: 75.000 pasos, batch de 64, optimizador Adam, learning rate 2e-5, semilla 1000 y LeRobot 0.7.0. El dataset de entrenamiento (`chrisw-shadow/nut_5_subset_rel_2`) contiene 100 episodios y 93.078 fotogramas a 50 FPS de una única tarea de ensamblaje. No se documenta composición del dataset, número de tokens, ni si hubo RLHF/DPO (no aplica en el sentido habitual de LLM; es aprendizaje por imitación). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

Entradas y salidas declaradas:

| Feature | Tipo | Shape |
|---|---|---|
| `observation.state` | STATE | (39,) |
| `observation.images.fixed` | VISUAL | (3, 480, 640) |
| `observation.images.wrist_1` | VISUAL | (3, 480, 640) |
| `observation.images.wrist_2` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (21,) |

## Capacidades

- Control robótico de manipulación fina: agarre de una tuerca y enroscado sobre un tornillo orientado hacia arriba, con el robot `ur10e_dexee`.
- Política de imitación condicionada por instrucción de texto ("grasp the nut and then thread it onto the upwards facing bolt").
- Fusión de tres vistas RGB (cámara fija y dos cámaras de muñeca) con el estado propioceptivo del robot (39 dimensiones).
- Salida de acciones continuas de 21 dimensiones compatible con el stack LeRobot.
- Soporte de los objetivos de difusión y flow-matching a nivel de arquitectura (según el paper del método).
- Ejecución mediante `lerobot-rollout` con `--strategy.type=base` para despliegue en robot real.
- Reentrenamiento mediante `lerobot-train` con `--policy.type=multi_task_dit`.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, generación de código ni audio.

## Casos de uso

- Automatización de ensamblaje con tuerca y tornillo: la política ejecuta la secuencia completa de agarre y enroscado sobre el robot `ur10e_dexee`, adecuada para células de montaje repetitivas donde se dispone de la misma configuración de cámaras y efector.
- Reproducción de experimentos de imitación con DiT: sirve como checkpoint de referencia para comparar variantes de Diffusion Policy con condicionamiento texto+visión dentro de LeRobot 0.7.0.
- Base para fine-tuning en tareas de inserción: al estar entrenada en una tarea de precisión (threading), puede reutilizarse como inicialización para tareas similares de inserción de piezas con el mismo robot.
- Validación de pipelines de datos robóticos: el dataset asociado (100 episodios, 93.078 fotogramas a 50 FPS) y el checkpoint permiten probar el flujo completo de grabación, entrenamiento y rollout de LeRobot.
- Docencia e investigación en robótica de imitación: ejemplo reproducible de entrenamiento multi-tarea con condicionamiento de lenguaje sobre hardware UR10e + Dexee.
- Pruebas de despliegue en robot real: el comando `lerobot-rollout` permite ejecutar la política durante una duración fija (`--duration=60`) para evaluar comportamiento antes de integrarla en un lazo de control mayor.
- Benchmark interno de latencia y robustez visual: al usar tres cámaras, permite medir el coste de inferencia con múltiples flujos visuales en GPUs consumer o de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la nota explícita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 238 M de parámetros en fp32, los pesos ocupan aproximadamente 0,95 GB; en fp16, unos 0,48 GB. A ello hay que sumar el coste de procesar tres imágenes de 480x640 por paso, que domina el consumo de memoria frente a los pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder cargar los pesos; se recomienda una RTX 3090/4090 o superior para mantener frecuencia de control con tres cámaras.
- ¿Cabe en GPU consumer? Sí, por tamaño de parámetros; la viabilidad práctica depende del throughput de visión requerido por el lazo de control.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot), y el stack LeRobot 0.7.0 en general. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La model card no publica cifras de frecuencia de inferencia ni de tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cloud_nut_5_100_eps_dit` (este) | 238 M | Estado (39,) + 3 cámaras 480x640 | Ensamblaje tuerca-tornillo en `ur10e_dexee` | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy (referencia original) | no disponible | Estado + imágenes | Políticas de imitación visuomotoras | no disponible | Repositorio de investigación |
| Multi-Task DiT (paper arXiv:2507.05331) | ~450 M (según paper) | Texto + visión | Aprendizaje multi-tarea | no disponible | Paper + código de referencia |
| Otras políticas LeRobot en el Hub | variable | variable | Tareas diversas | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito en robot real que permitan estimar su fiabilidad.
- Tarea única y muy específica: entrenada exclusivamente para "grasp the nut and then thread it onto the upwards facing bolt" sobre el robot `ur10e_dexee`; no se garantiza generalización a otras piezas, posiciones o robots.
- Dependencia estricta de la configuración de sensores: requiere las tres cámaras (`fixed`, `wrist_1`, `wrist_2`) con los nombres y resolución exactos del entrenamiento; cualquier cambio invalida la política.
- Licencia no declarada: la model card indica "More Information Needed", por lo que el uso comercial es jurídicamente incierto y no recomendable sin aclaración del autor.
- Idiomas no declarados: el condicionamiento textual se ha entrenado con una instrucción en inglés; no hay evidencia de soporte multilingüe.
- Riesgo de sobreajuste al dataset: 100 episodios y 93.078 fotogramas de una sola tarea sugieren poca diversidad; la política puede degradarse ante cambios de iluminación, posición de objetos o distracciones.
- Sin cuantizaciones publicadas: no hay versiones GGUF u otras optimizadas para despliegue de baja latencia.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validación externa.
- Advertencia de seguridad: es una política de control físico; debe probarse en entornos con límites de par, paradas de emergencia y supervisión humana antes de cualquier uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrisw-shadow/cloud_nut_5_100_eps_dit
- Dataset de entrenamiento: https://huggingface.co/datasets/chrisw-shadow/nut_5_subset_rel_2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chrisw-shadow/nut_5_subset_rel_2
- Paper del método (Multi-Task DiT): https://huggingface.co/papers/2507.05331
- Guía LeRobot multi_task_dit: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
