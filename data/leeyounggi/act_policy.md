# Leeyounggi/act_policy

## Resumen

`Leeyounggi/act_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo no es un LLM ni un modelo de lenguaje: es un controlador visomotor que consume el estado articular de un robot y una imagen de cámara de muñeca, y produce comandos de acción de 7 dimensiones. Está empaquetado en formato LeRobot y se ejecuta mediante las herramientas de Hugging Face LeRobot.

El modelo lo desarrolla el usuario Leeyounggi y está entrenado sobre el dataset `Leeyounggi/pnp_bluecube_20261121_172350`, compuesto por 30 episodios de teleoperación (17.162 fotogramas a 30 FPS) para la tarea concreta "Pick up the cube and place it on the plate" sobre un robot `so102_follower` con una única cámara de muñeca. Con 51.670.663 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real en hardware modesto.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`). No es un modelo generalista; su validez está restringida a la tarea, el robot y la configuración de cámara con los que fue entrenado. No se han publicado resultados de evaluación ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación definida por el chunking de acciones, no documentada) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo visomotor, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador de imagen (procesa `observation.images.cam_wrist`, tensor de 3×480×640), un codificador del estado articular (`observation.state`, vector de 7 dimensiones) y un decodificador transformer que genera secuencias de acciones de 7 dimensiones. El modelo está implementado en LeRobot 0.6.0.

El entrenamiento se realizó durante 40.000 pasos con batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre 30 episodios teleoperados (17.162 fotogramas a 30 FPS). No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de demostraciones. No se especifica el número total de tokens ni la composición detallada del dataset más allá de la tarea y el robot empleados.

## Capacidades

- Control visomotor de un robot `so102_follower` a partir de una imagen de muñeca y el estado articular.
- Predicción de chunks de acción de 7 dimensiones (típicamente posición y orientación del efector más pinza).
- Ejecución de la tarea específica "Pick up the cube and place it on the plate".
- Inferencia en tiempo real a 30 FPS según la frecuencia del dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (*thinking*), visión general, audio ni otras capacidades multimodales más allá del par imagen-estado.

## Casos de uso

- **Automatización de pick-and-place en laboratorio:** el modelo ejecuta la tarea de recoger un cubo y colocarlo en un plato sobre el robot `so102_follower`, adecuado para prototipos de manipulación en entornos controlados con posiciones de objeto similares a las del entrenamiento.
- **Reproducción de pipelines de aprendizaje por imitación:** sirve como referencia para validar el flujo completo de LeRobot (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de escalar a tareas propias.
- **Docencia y formación en robótica:** su tamaño reducido (51,7 M de parámetros, 0,2 GB) y su licencia Apache 2.0 lo hacen apto para cursos y talleres donde se enseña ACT sin necesidad de infraestructura pesada.
- **Base para *fine-tuning* en tareas análogas:** puede reentrenarse sobre datasets propios con el mismo formato de observación (estado de 7 dimensiones más imagen de muñeca) para tareas de manipulación parecidas.
- **Investigación en chunking de acciones:** permite experimentar con el tamaño de chunk, la frecuencia de control y la robustez frente a variaciones de iluminación o posición, comparando contra la configuración original.
- **Validación de hardware y calibración:** útil para comprobar la cadena de captura (cámara OpenCV a 640×480 y 30 FPS), la calibración del robot y la latencia del bucle de control antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el modelo tiene 51,7 M de parámetros; en fp32 ocupa aproximadamente 0,2 GB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más. La memoria dominante será la del codificador visual y los buffers de imagen (3×480×640).
- **GPU recomendadas:** cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para tiempo real a 30 FPS, una RTX 3060 o superior es suficiente; una A100 o H100 no aporta ventaja significativa por el tamaño del modelo.
- **Cabe en GPU consumer:** sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout` con `--policy.path=Leeyounggi/act_policy`), con soporte de PyTorch en CPU o CUDA. No hay variantes GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- **Latencia y throughput:** no disponibles de forma medida. El dataset está grabado a 30 FPS, lo que sugiere un objetivo de control en torno a esa frecuencia, pero no se documenta latencia real ni éxito en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leeyounggi/act_policy | 51,7 M | ACT (LeRobot) | Pick-and-place sobre `so102_follower` | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia de LeRobot | no disponible | ACT (LeRobot) | Tareas de manipulación diversas | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | no disponible | Política de difusión | Manipulación visomotora | según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- **Sobreajuste a la tarea y al robot:** entrenado exclusivamente para "Pick up the cube and place it on the plate" sobre `so102_follower` con una cámara de muñeca; no generaliza a otras tareas, robots ni configuraciones de cámara sin reentrenamiento.
- **Dataset pequeño:** 30 episodios y 17.162 fotogramas son una base limitada; la robustez frente a variaciones de posición, iluminación o distracciones no está documentada y probablemente sea baja.
- **Sin evaluación publicada:** no hay tasas de éxito ni resultados en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- **Riesgo de alucinación en el sentido robótico:** puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento, con riesgo de colisiones o fallos de agarre.
- **Sin capacidades lingüísticas:** no procesa instrucciones en lenguaje natural; la tarea está fijada en el entrenamiento.
- **Licencia Apache 2.0:** permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- **Dependencia de LeRobot 0.6.0:** cambios de versión en la librería pueden romper la compatibilidad del checkpoint o de los comandos de despliegue.
- **Sin cuantizaciones alternativas:** solo se distribuyen pesos safetensors; no hay versiones optimizadas para CPU o edge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Leeyounggi/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Leeyounggi/pnp_bluecube_20261121_172350
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Leeyounggi/pnp_bluecube_20261121_172350
