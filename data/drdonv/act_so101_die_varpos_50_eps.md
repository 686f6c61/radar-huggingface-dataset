# drdonv/act_so101_die_varpos_50_eps

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `drdonv/act_so101_die_varpos_50_eps`, es una política entrenada con LeRobot sobre el robot `so_follower` (SO-101) para una única tarea: recoger un objeto y depositarlo en una zona objetivo.

La política consume el estado articular de 6 dimensiones y una imagen RGB de 480x640 procedente de una cámara cenital (`top`), y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó sobre el dataset `drdonv/so101_die_varpos`, compuesto por 50 episodios y 21.002 fotogramas a 30 FPS, durante 40.000 pasos con batch size 8 y optimizador AdamW.

Es relevante como ejemplo reproducible de un pipeline completo de imitación con LeRobot: dataset público, configuración de entrenamiento documentada y comando de despliegue listo para ejecutar en hardware real. No es un modelo de lenguaje ni un modelo multimodal general; es una política robótica específica de tarea con 51,7 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación de un frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.1 en entrenamiento) |
| Tipo de robot | so_follower (SO-101) |
| Camaras | top (1 camara, 480x640 RGB) |
| Entrada observation.state | STATE, shape (6,) |
| Entrada observation.images.top | VISUAL, shape (3, 480, 640) |
| Salida action | ACTION, shape (6,) |
| Tamano del repo | 6.8 GB |
| Descargas | 56 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT es un transformer que aprende una política de imitación mapeando observaciones (estado articular e imágenes) a chunks de acciones futuras. La predicción por chunks, en lugar de paso a paso, mitiga el problema de compounding error típico de las políticas reactivas y permite movimientos más suaves y consistentes. La arquitectura incorpora un codificador visual para la imagen cenital y un decodificador de acciones condicionado por el estado y la observación visual.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `drdonv/so101_die_varpos`: 50 episodios, 21.002 fotogramas a 30 FPS, tarea "Pick up the object and place it in the target zone". Configuración: 40.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado por imitación a partir de demostraciones teleoperadas.

## Capacidades

- Manipulación robótica de una sola tarea: recoger un objeto y colocarlo en una zona objetivo.
- Control de un robot SO-101 (`so_follower`) con 6 grados de libertad de acción.
- Percepción visual mediante una única cámara cenital a 480x640 y 30 FPS.
- Predicción de chunks de acción para movimientos suaves y estables.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea "Pick up the object and place it in the target zone" sobre un SO-101 con cámara cenital, adecuada para prototipos de manipulación repetitiva.
- Reproducción de experimentos de imitación: sirve como referencia para comparar configuraciones de ACT (pasos, batch, learning rate) sobre el mismo dataset de 50 episodios.
- Base para fine-tuning con nuevos datos: al estar en formato LeRobot y licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre datasets propios del mismo robot y tarea.
- Docencia y formación en robótica de imitación: ejemplo completo y reproducible de pipeline dataset → entrenamiento → despliegue con LeRobot.
- Validación de hardware SO-101: útil para verificar calibración de cámaras, puertos y cinemática antes de entrenar políticas propias.
- Benchmark interno de infraestructura: con 51,7 M de parámetros y una sola cámara, es ligero para probar latencias de inferencia en distintas GPUs y configuraciones de `lerobot-rollout`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors y una imagen de entrada de 480x640, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=drdonv/act_so101_die_varpos_50_eps`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política está pensada para ejecutarse a 30 FPS sobre el robot, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drdonv/act_so101_die_varpos_50_eps | 51.668.614 | ACT (imitación) | no aplica | apache-2.0 | Hugging Face, 56 descargas |
| Otras políticas ACT en LeRobot Hub | no disponible | ACT | no aplica | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | Diffusion Policy | no aplica | variable | Hugging Face |
| Políticas VQ-BeT en LeRobot | no disponible | VQ-BeT | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Política de una sola tarea: entrenada exclusivamente para "Pick up the object and place it in the target zone"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la cámara cenital: los nombres e índices de cámara deben coincidir con `observation.images.top`; cualquier cambio de montaje o iluminación puede degradar el comportamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Dataset pequeño: 50 episodios y 21.002 fotogramas limitan la robustez ante variaciones de posición, objetos o distractores.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero al ser una política de imitación hereda las distribuciones y posibles sesgos de las demostraciones teleoperadas.
- Riesgo de fallo silencioso: al no publicarse métricas, no hay garantía de comportamiento seguro ante objetos o entornos distintos a los del dataset.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No aplica a tareas de lenguaje, visión general, tool calling ni agentes; su uso fuera del dominio robótico no es viable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drdonv/act_so101_die_varpos_50_eps
- Dataset de entrenamiento: https://huggingface.co/datasets/drdonv/so101_die_varpos
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=drdonv/so101_die_varpos
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
