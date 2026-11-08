# namiciro/red-only-act-policy

## Resumen

`namiciro/red-only-act-policy` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv:2304.13705 y distribuido a través de la librería LeRobot de Hugging Face. El modelo ha sido entrenado por el usuario namiciro para controlar un robot de tipo `so_follower` (la variante seguidora del brazo SO-100/SO-101 de bajo coste) equipado con una única cámara frontal. Predice directamente comandos de acción de 6 dimensiones a partir del estado articular del robot y la imagen de la cámara.

Se trata de un modelo de escala muy reducida (51.668.614 parámetros, repo de 0,2 GB) y altamente especializado: no es un modelo de lenguaje, sino una política visuomotora entrenada sobre un dataset propio de 14 episodios y 6733 fotogramas a 30 FPS para dos tareas concretas de manipulación ("Put the red block in the right box" y "Put the blue block in the left box"). Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: recogida de datos con teleoperación, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.

Por su naturaleza, no compite con modelos fundacionales de robótica ni con LLM: es una política de imitación de propósito específico, pensada para demostrar el pipeline y para ser reentrenada o adaptada. La información pública es escasa: no hay resultados de evaluación, licencia ni idiomas declarados, y el repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. La arquitectura combina un encoder visual (procesa la imagen de la cámara frontal a 480x640) con un transformer que fusiona la observación del estado articular (vector de 6 dimensiones) y genera las acciones (vector de 6 dimensiones). El modelo se entrena con *behavior cloning* sobre datos teleoperados; el paper original de ACT incorpora además una técnica de regularización tipo CVAE para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.7.1 durante 20.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset `namiciro/red-to-right-v2` contiene 14 episodios y 6733 fotogramas a 30 FPS correspondientes a dos tareas de clasificación de bloques por color. No se especifica en la información disponible si se aplicó RLHF, DPO ni ninguna fase de ajuste posterior; en el pipeline estándar de ACT no se emplean.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` a partir de una única cámara frontal y del estado articular de 6 dimensiones.
- Generación de *action chunks*: predice secuencias de acciones en lugar de pasos aislados, lo que mejora la suavidad y la robustez del movimiento.
- Ejecución de dos tareas de manipulación entrenadas: colocar el bloque rojo en la caja derecha y el bloque azul en la caja izquierda.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere definición manual de recompensas.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la imagen de entrada de la cámara.

## Casos de uso

- **Manipulación de bloques por color en laboratorio docente**: el modelo sirve como ejemplo completo del ciclo de imitación (grabar, entrenar, desplegar) para cursos de robótica con SO-100/SO-101; su bajo coste computacional permite entrenar en una GPU de consumo en horas.
- **Prototipado rápido de políticas de picking**: con 14 episodios y 6733 fotogramas se obtiene una política funcional para una tarea de clasificación simple, lo que permite validar la infraestructura de captura de datos antes de escalar a tareas más complejas.
- **Base para *fine-tuning* en tareas de clasificación de objetos**: el checkpoint puede reentrenarse con `lerobot-train` sobre un dataset propio para añadir nuevos colores, posiciones o cajas, aprovechando que el pipeline de LeRobot permite sustituir el dataset sin cambiar el código.
- **Investigación en aprendizaje por imitación con action chunking**: útil para reproducir y comparar variantes de ACT (por ejemplo, con o sin CVAE) en un entorno controlado y de bajo coste.
- **Evaluación de robustez ante variaciones de iluminación y posiciones**: al ser una política de una sola cámara, permite estudiar cómo afectan cambios de escena al rendimiento y comparar con variantes multi-cámara como `namiciro/red-blue-act-policy-30k`.
- **Demostración de despliegue en robot real de bajo coste**: el comando `lerobot-rollout` permite ejecutar la política en el robot físico con una sola GPU de consumo, lo que facilita talleres y demos presenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 51,7 M de parámetros; en FP32 ocupa aproximadamente 0,2 GB de pesos, y en FP16 alrededor de 0,1 GB. Con activaciones y el encoder visual, la inferencia cabe holgadamente en cualquier GPU con 2-4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, una RTX 3060 o superior es suficiente dado el tamaño del modelo y el batch size de 8.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo moderna; incluso podría ejecutarse en CPU con latencia mayor, aunque no se documenta.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. La política opera a 30 FPS según el dataset de entrenamiento, pero no se publican mediciones de latencia real en el robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `namiciro/red-only-act-policy` | 51,7 M | Imagen 480x640 + estado (6,) | 2 tareas de clasificación de bloques | no disponible | Hugging Face (0 descargas) |
| `namiciro/red-blue-act-policy-30k` | no disponible | no disponible | Tareas rojo/azul (variante 30k pasos) | no disponible | Hugging Face |
| ACT (implementación de referencia LeRobot) | del orden de decenas de millones (según configuración) | Imagen + estado | Manipulación fina genérica | Apache 2.0 (LeRobot) | GitHub / docs LeRobot |

La comparativa se limita a variantes del mismo autor y a la implementación de referencia de ACT en LeRobot, ya que no se dispone de datos de otros modelos comparables en la información proporcionada. No se publican métricas de rendimiento para ninguno de ellos en esta ficha.

## Limitaciones y advertencias

- **Sin resultados de evaluación**: no hay tasas de éxito publicadas, por lo que se desconoce su fiabilidad real en el robot.
- **Dataset muy reducido**: 14 episodios y 6733 fotogramas son insuficientes para generalizar; es probable que el modelo falle ante cambios de iluminación, posición de objetos, fondo o robot.
- **Una sola cámara y una sola tarea por política**: la política está entrenada para dos tareas concretas y un robot concreto (`so_follower`); no es transferible sin reentrenamiento.
- **Licencia no declarada**: la model card indica "License: [More Information Needed]"; no se puede asumir uso comercial sin consultar al autor.
- **Riesgo de sobreajuste**: con tan pocos datos y 20.000 pasos de entrenamiento, es probable que memorice posiciones y trayectorias específicas.
- **Sin idiomas ni capacidades de lenguaje**: no es un modelo de texto; cualquier uso como LLM es inaplicable.
- **Sin garantías de producción**: al no haber evaluación ni versionado estable, no se recomienda su uso en entornos industriales sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namiciro/red-only-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/namiciro/red-to-right-v2
- Variante relacionada: https://huggingface.co/namiciro/red-blue-act-policy-30k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=namiciro/red-to-right-v2
