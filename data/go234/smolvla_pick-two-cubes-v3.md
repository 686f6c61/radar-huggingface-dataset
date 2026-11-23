# go234/smolvla_pick-two-cubes-v3

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación a partir de demostraciones. Esta ficha concreta, `go234/smolvla_pick-two-cubes-v3`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios y 29.610 fotogramas a 30 FPS, orientado a la tarea de recoger cubos de colores y depositarlos en una caja con un robot tipo `so_follower`.

El modelo consume el estado articular del robot (vector de 6 dimensiones) y tres cámaras RGB de 256×256 píxeles, y produce un vector de acción de 6 dimensiones. Con 450 millones de parámetros y un repositorio de solo 0,9 GB, está pensado para ejecutarse en hardware de consumo, lo que lo convierte en una alternativa práctica frente a VLA de mayor tamaño como OpenVLA o π0.

Su relevancia radica en la accesibilidad: cualquiera con un robot SO-100/SO-101 y un par de cámaras puede desplegar una política entrenada con `lerobot-rollout` en minutos, o reentrenar el modelo base con su propio dataset siguiendo el flujo de LeRobot. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, fine-tuning de SmolVLA (transformer multimodal con codificador visual y cabeza de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control por paso, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés: "Pick up the red cube and put it in the box.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones adicionales del pipeline:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `camera1`, `camera2`, `camera3` (3×256×256 RGB) |
| Estado de entrada | `observation.state` (6,) |
| Salida | `action` (6,) |
| Dataset de entrenamiento | `go234/pick-two-cubes_20261123_231046` (50 episodios, 29.610 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 4 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina un codificador visual (procesa las tres cámaras a 256×256), un codificador del estado propioceptivo (vector de 6 dimensiones) y un decodificador que genera acciones de 6 dimensiones condicionadas por una instrucción de tarea en lenguaje natural. El modelo base se preentrena sobre datos de robots heterogéneos y luego se especializa mediante fine-tuning supervisado sobre el dataset objetivo. En este caso, el autor ha realizado 20.000 pasos de entrenamiento con batch de 4 y AdamW a una tasa de aprendizaje de 1e-4, partiendo de `lerobot/smolvla_base`.

El dataset de entrenamiento contiene 50 episodios teleoperados con dos tareas explícitas: "Pick up the red cube and put it in the box." y "Pick up the blue cube and put it in the box.". No se documenta en la model card el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje por imitación puro (behavior cloning). Tampoco se especifica la composición completa del corpus de preentrenamiento del modelo base más allá de lo indicado en el paper de SmolVLA (arXiv:2506.01844).

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 grados de libertad a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: integra tres flujos RGB simultáneos de 256×256.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica en el prompt (`--task`), lo que permite cambiar el objetivo sin reentrenar.
- Ejecución en bucle cerrado: la política se ejecuta paso a paso con `lerobot-rollout`, reaccionando al estado observado en cada fotograma.
- Despliegue en hardware de consumo: 450 M de parámetros permiten inferencia en GPU modestas o incluso CPU en función de la latencia requerida.
- Fine-tuning accesible: se puede reentrenar con `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling, agentes multi-paso, visión general, audio ni modo thinking: es una política de control, no un modelo de lenguaje generalista.

## Casos de uso

- Recogida y clasificación de objetos en línea de montaje: el modelo identifica cubos de colores mediante las cámaras y ejecuta la secuencia de agarre y depósito, adecuado por su entrenamiento específico en esa tarea.
- Prototipado rápido de políticas robóticas: un investigador graba 50 episodios con LeRobot, lanza `lerobot-train` partiendo de este modelo o del base y obtiene una política funcional en horas, gracias al bajo coste computacional de 450 M de parámetros.
- Demostraciones educativas de VLA: sirve para enseñar el ciclo completo grabación-calibración-entrenamiento-despliegue en cursos de robótica, dado que cabe en una GPU de consumo y el repo pesa menos de 1 GB.
- Benchmark interno de manipulación: al ser un fine-tuning reproducible (semilla 1000, hiperparámetros documentados), permite comparar variantes de datasets o aumentos de datos manteniendo fija la receta.
- Automatización de tareas pick-and-place en laboratorio: con el robot `so_follower` y tres cámaras, se puede integrar en una celda de experimentación para tareas repetitivas de recogida de piezas.
- Base para fine-tuning en dominios similares: aunque entrenado para cubos, el modelo puede servir como inicialización para tareas de agarre con objetos de forma similar, reduciendo pasos de entrenamiento respecto al base.
- Validación de pipelines de inferencia LeRobot: útil para probar configuraciones de `lerobot-rollout`, latencias de cámara y calibración antes de pasar a políticas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas sobre este dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en precisión FP32 el peso ronda 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar activaciones y buffers de las tres cámaras de 256×256.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior debería ser suficiente; GPU de datacenter (A100, H100) no son necesarias para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4-8 GB de VRAM; también es viable en CPU para control a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) es el método documentado; el ecosistema LeRobot soporta el ciclo de inferencia sobre el robot `so_follower`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama (no aplicables a una política de control).
- Latencia y throughput: no disponibles. La frecuencia de control depende del hardware y de la política de ejecución; el dataset se grabó a 30 FPS, pero no se garantiza que la inferencia alcance esa tasa.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_pick-two-cubes-v3 (este) | 450 M | VLA fine-tuned para `so_follower` | 3 cámaras 256×256 + estado (6,) | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | ~450 M (no confirmado en la información) | VLA base preentrenada | multimodal, multi-robot | Apache 2.0 (según repositorio base) | Hugging Face (LeRobot) |
| OpenVLA | ~7 B (dato externo, no verificado en esta búsqueda) | VLA generalista | imagen + instrucción | no disponible en esta ficha | no disponible en esta ficha |
| π0 (pi-zero) | no disponible en esta ficha | VLA generalista | multimodal | no disponible en esta ficha | no disponible en esta ficha |

Nota: los datos de OpenVLA y π0 no provienen de la información proporcionada y se incluyen solo como referencia de categoría; no deben tomarse como cifras verificadas en esta ficha. La comparación cuantitativa de rendimiento no está disponible porque no se han publicado evaluaciones de esta política.

## Limitaciones y advertencias

- Sesgos y sobreajuste al dominio: entrenado con solo 50 episodios y dos instrucciones concretas ("red cube", "blue cube"); es probable que falle ante objetos, colores, posiciones o iluminaciones fuera de distribución.
- Riesgo de fallo silencioso: al no haber evaluación publicada, no se conoce la tasa de éxito real; desplegarlo en producción sin validación previa es arriesgado.
- Dependencia de calibración: requiere que el robot `so_follower` esté calibrado y que las tres cámaras estén en las posiciones e índices esperados; cambios en la configuración invalidan la política.
- Idioma: las instrucciones de tarea están en inglés y el modelo no se presenta como multilingüe; no se debe asumir comprensión de instrucciones en castellano.
- Sin soporte conversacional ni de herramientas: no es un LLM; no admite tool calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar también las licencias del modelo base y de LeRobot.
- Caveat de producción: la política ejecuta acciones de forma continua; es imprescindible implementar paradas de seguridad, límites de par y supervisión humana en entornos físicos.
- Ausencia de cuantizaciones documentadas: no se han publicado versiones GGUF/INT8 ni recetas de cuantización para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/go234/smolvla_pick-two-cubes-v3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/pick-two-cubes_20261123_231046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/pick-two-cubes_20261123_231046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
