# allez-ale/act_pod_to_container_v1_50k

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `allez-ale/act_pod_to_container_v1_50k`, es una política entrenada con LeRobot 0.6.2 sobre un conjunto de datos propio de teleoperación y publicada en Hugging Face Hub bajo licencia Apache 2.0.

El modelo resuelve una tarea muy específica: recoger un "coffe pod" amarillo y depositarlo en un contenedor. Se ha entrenado con 50 episodios (26.472 fotogramas a 30 FPS) capturados con un robot `so_follower` y dos cámaras (vista superior y vista de muñeca). La política consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de robótica de bajo coste. No es un modelo de lenguaje: es una política visuomotora, por lo que las secciones de benchmarks de NLP, requisitos de VRAM para LLM y comparativas con modelos de texto no aplican y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural como tarea principal) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras a partir de observaciones visuales y propioceptivas. El modelo combina un codificador de imágenes (para las dos cámaras, `top` y `wrist`) con un codificador del estado articular y un decodificador que genera la secuencia de acciones de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación central del método y mitiga el drift acumulado típico de las políticas reactivas.

El entrenamiento se realizó con LeRobot 0.6.2 durante 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset `allez-ale/so101_pod_to_container_v1` contiene 50 episodios y 26.472 fotogramas a 30 FPS de la tarea "Pick up the yellow coffe pod and put it in the container". No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Procesamiento de dos flujos visuales simultáneos (`observation.images.top` y `observation.images.wrist`) con resolución 480x640 y 3 canales.
- Predicción de chunks de acciones, lo que permite ejecutar secuencias cortas de movimiento con mayor estabilidad que políticas paso a paso.
- Aprendizaje por imitación: reproduce comportamientos demostrados en teleoperación, sin necesidad de recompensas explícitas.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de recoger el coffe pod y depositarlo en el contenedor sobre un robot `so_follower`, útil como base para experimentos de manipulación reproducibles.
- Prototipado rápido de políticas de imitación: sirve como referencia para comparar configuraciones de ACT (número de pasos, batch size, learning rate) en nuevas tareas con datasets pequeños.
- Benchmark interno de hardware robótico: al ser una tarea acotada y con dos cámaras, permite medir latencia de inferencia y estabilidad de control en distintas GPUs o configuraciones de brazos.
- Educación y formación: ejemplo completo y ligero (0,2 GB) para enseñar el flujo LeRobot de grabación, entrenamiento y despliegue de una política visuomotora.
- Base para fine-tuning en tareas similares: al estar bajo Apache 2.0 y entrenado con 50 episodios, es un punto de partida razonable para adaptar la política a variantes de la misma tarea (otros objetos, posiciones o contenedores).
- Investigación en robustez visual: permite evaluar cómo afectan cambios de iluminación, posición de cámara o distracciones a una política ACT entrenada con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella en memoria es reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente. Una RTX 4090, RTX 3090 o incluso GPUs de gama media son adecuadas.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs consumer modernas; no se documenta una VRAM mínima exacta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=allez-ale/act_pod_to_container_v1_50k`), con soporte de PyTorch/CUDA según la configuración del usuario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pod_to_container_v1_50k (este) | 51.668.614 | ACT, política visuomotora | no aplica | apache-2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot Hub | variable | ACT | no aplica | variable | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | variable | diffusion policy | no aplica | variable | Hugging Face Hub |
| Políticas VLA (p. ej. RT-2, OpenVLA) | cientos de millones a miles de millones | VLA | variable | variable | variable |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas concretas en la información proporcionada; la comparativa se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Entrenado con solo 50 episodios y una única tarea; la generalización a otros objetos, posiciones o entornos es muy limitada.
- Sin resultados de evaluación en robot real publicados; el éxito de la política en producción no está verificado por el autor.
- Depende de la configuración exacta de cámaras (`top`, `wrist`) y del robot `so_follower`; cambios en montaje, calibración o iluminación pueden degradar el rendimiento.
- Riesgo de sobreajuste al dataset de demostración, con comportamiento frágil ante distracciones visuales o variaciones de la escena.
- No procesa lenguaje natural ni soporta tool calling; no debe presentarse como un modelo de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento en su contexto y la procedencia de los datos de entrenamiento.
- No se documentan sesgos, cuantizaciones soportadas ni límites de contexto; cualquier despliegue en producción requiere validación empírica propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allez-ale/act_pod_to_container_v1_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/allez-ale/so101_pod_to_container_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=allez-ale/so101_pod_to_container_v1
