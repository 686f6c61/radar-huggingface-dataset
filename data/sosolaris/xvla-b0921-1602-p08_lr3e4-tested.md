# SoSolaris/xvla-b0921-1602-p08_lr3e4-TESTED

## Resumen

SoSolaris/xvla-b0921-1602-p08_lr3e4-TESTED es una política (policy) de robótica basada en X-VLA, un framework de visión-lenguaje-acción con soft prompts y flow matching desarrollado dentro del ecosistema LeRobot de Hugging Face. Se trata de un ajuste fino de lerobot/xvla-base realizado por el usuario SoSolaris sobre el dataset FlourishGrabTape para una única tarea de manipulación: coger cinta («Grab the tape») con un robot SO-101 follower.

El modelo tiene 879.687.256 parámetros (unos 880 millones) y ocupa 1,8 GB en el repositorio en formato safetensors. No es un modelo generativo de texto: su entrada son imágenes de cámara y el estado del robot, y su salida es un vector de acción de 6 dimensiones que controla directamente el brazo robótico. Su relevancia es doble: por un lado, sirve como ejemplo reproducible del flujo de ajuste fino de políticas VLA en LeRobot sobre hardware asequible; por otro, ilustra la propuesta de X-VLA de unificar morfologías, sensores y espacios de acción distintos mediante embeddings de soft prompt aprendibles.

Al estar entrenado sobre un dataset muy pequeño (20 episodios, 7071 fotogramas) y para una sola tarea, es un modelo de laboratorio o de investigación más que una solución lista para producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | X-VLA: framework de visión-lenguaje-acción con soft prompts y flow matching |
| Parámetros totales | 879.687.256 (~880 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; repo de 1,8 GB, compatible con bf16/fp16) |
| Idiomas soportados | no disponible; acepta una instrucción de tarea en texto (por ejemplo, «Grab the tape») |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Robot objetivo | so101_follower |
| Cámaras | right, up (más una tercera vista de 224×224 usada como entrada) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA que combina un modelo de visión-lenguaje con un decodificador de acciones basado en flow matching. Su innovación principal es el uso de «soft prompts»: cada configuración de robot o hardware se representa como una tarea codificada mediante un conjunto reducido de embeddings de prompt aprendibles. Esto permite que un único modelo reconcilie morfologías, sensores y espacios de acción diferentes sin necesidad de reentrenar toda la red, y que el ajuste fino sobre un robot concreto consista esencialmente en aprender el soft prompt adecuado junto con la cabeza de acción.

En este caso concreto, la política consume tres entradas visuales de 256×256, 256×256 y 224×224 píxeles más un vector de estado de 8 dimensiones, y produce un vector de acción de 6 dimensiones. El ajuste fino se realizó durante 4000 pasos con tamaño de lote 32, optimizador «xvla-adamw» y tasa de aprendizaje 0,0003, con semilla 1000, sobre LeRobot 0.6.2. El dataset de entrenamiento, SoSolaris/FlourishGrabTape, contiene 20 episodios (7071 fotogramas) a 15 FPS, todos ellos de la tarea «Grab the tape». No se documenta en la información disponible si hubo etapas de RLHF, DPO u otro tipo de alineamiento, ni la composición completa del dataset de preentrenamiento del modelo base.

## Capacidades

- Control de un brazo robótico SO-101 follower para ejecutar la tarea de manipulación «Grab the tape».
- Generación de acciones continuas de 6 dimensiones a partir de observaciones multimodales (tres cámaras y estado de 8 dimensiones).
- Aprendizaje por imitación de una política de manipulación a partir de demostraciones (behavior cloning con flow matching).
- Reutilización del mecanismo de soft prompts del modelo base para adaptarse a la configuración concreta de robot, cámaras y espacio de acción.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni un agente conversacional.
- No genera texto, no mantiene conversaciones y no tiene capacidades de razonamiento simbólico ni matemático.
- No se documentan capacidades multilingües; la única entrada textual es la cadena que describe la tarea.

## Casos de uso

- Reproducción de la tarea «Grab the tape» en un robot SO-101: el modelo ejecuta la política de manipulación mediante el comando `lerobot-rollout`, adecuado para validar la cadena hardware-software completa en un laboratorio.
- Punto de partida para ajuste fino adicional: al derivar de lerobot/xvla-base, puede reentrenarse con `lerobot-train` sobre nuevos datasets para tareas relacionadas de pick-and-place.
- Investigación en aprendizaje por imitación: sirve como referencia de cómo un dataset pequeño (20 episodios) condiciona la calidad de una política VLA entrenada con flow matching.
- Docencia en robótica y LeRobot: ejemplo práctico, con instrucciones reproducibles, para enseñar el flujo grabación de datos → entrenamiento → despliegue.
- Comparación de variantes de entrenamiento: el sufijo `lr3e4` y el identificador `b0921-1602-p08` permiten contrastar hiperparámetros frente a otros checkpoints de la misma familia.
- Automatización de una operación concreta de recogida de objetos planos (cinta) en un entorno controlado, siempre que las condiciones coincidan con las del dataset de entrenamiento.
- Evaluación de la transferencia entre configuraciones robóticas: útil para estudiar hasta qué punto los soft prompts de X-VLA generalizan a variaciones de cámara, iluminación o posición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que no se han proporcionado resultados de evaluación («No evaluation results have been provided for this policy yet»), por lo que no existen tasas de éxito ni métricas reproducibles sobre la tarea.

## Requisitos de hardware

- Tamaño de pesos: ~880 M parámetros, es decir, aproximadamente 1,76 GB en bf16/fp16 y ~3,5 GB en fp32.
- VRAM estimada para inferencia: en torno a 2-4 GB en precisión media, más el consumo adicional de los búferes de imagen y las activaciones; un umbral práctico de 8 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB, como RTX 3060, RTX 4060, RTX 4070, RTX 4090 o superiores; también cabe en GPUs de datacenter como A100 o H100, aunque resultan sobredimensionadas para este tamaño.
- ¿Cabe en GPU de consumo? Sí, con holgura, en cualquier GPU moderna con 8 GB o más de VRAM.
- Opciones de despliegue: el flujo previsto es LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento); la inferencia se lanza con `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El sistema opera a 15 FPS en el dataset de entrenamiento y las cámaras de la configuración de despliegue se capturan a 30 FPS, pero no se publican cifras de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-b0921-1602-p08_lr3e4-TESTED | ~880 M | no aplica | Manipulación, tarea única «Grab the tape» | apache-2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no aplica | Modelo base generalista de X-VLA para ajuste fino | apache-2.0 | Hugging Face |
| Otras políticas VLA (OpenVLA, pi0, etc.) | no disponible | no disponible | Manipulación robótica | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de parámetros, contexto, rendimiento o licencia de otras familias VLA, por lo que la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Modelo de tarea única: está ajustado exclusivamente para «Grab the tape»; fuera de esa tarea no se puede esperar un comportamiento fiable.
- Dataset de entrenamiento muy reducido: 20 episodios y 7071 fotogramas limitan la generalización ante cambios de posición, iluminación, distracciones u objetos distintos.
- Dependencia del hardware: la política asume un robot `so101_follower` con las cámaras y claves de observación concretas (`observation.images.image`, `observation.images.image2`, `observation.images.image3`, `observation.state`) con las que fue entrenada; usar otra configuración invalida el modelo.
- Ausencia total de evaluación: no hay tasas de éxito publicadas, por lo que no se puede estimar su fiabilidad en producción.
- Sin validación por la comunidad: el repositorio registra 0 descargas y 0 «likes», lo que indica que no ha sido probado ni contrastado por terceros.
- Riesgo de sobreajuste y de alucinación de acciones: al ser un modelo de imitación, puede producir trayectorias incorrectas o inseguras ante entradas fuera de la distribución.
- Sin capacidades lingüísticas, de razonamiento general, de código ni de visión descriptiva: no debe utilizarse como modelo de lenguaje o de propósito general.
- Licencia apache-2.0: permite uso comercial y modificación, siempre que se conserven los avisos de copyright y atribución correspondientes; conviene revisar también los términos del modelo base y del dataset utilizados.
- Datos de los metadatos: la fecha de creación registrada (2026-09-21) es posterior a la información de la búsqueda, un detalle a verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/xvla-b0921-1602-p08_lr3e4-TESTED
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/FlourishGrabTape
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/FlourishGrabTape
- Paper de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv 2510.10274)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de despliegue e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
