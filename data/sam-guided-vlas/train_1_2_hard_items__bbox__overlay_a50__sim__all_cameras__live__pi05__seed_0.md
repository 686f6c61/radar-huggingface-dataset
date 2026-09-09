# sam-guided-vlas/train_1_2_hard_items__bbox__overlay_a50__sim__all_cameras__live__pi05__seed_0

## Resumen

El modelo `sam-guided-vlas/train_1_2_hard_items__bbox__overlay_a50__sim__all_cameras__live__pi05__seed_0` es un ajuste fino del modelo de visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario `sam-guided-vlas`. Se ha entrenado y subido al Hub con la librería LeRobot de Hugging Face, y hereda las capacidades del checkpoint base `lerobot/pi05_base`, diseñado para la generalización en entornos abiertos. Este checkpoint concreto está especializado en un conjunto de tareas de manipulación de objetos "difíciles" en simulación, con anotaciones de cuadros delimitadores superpuestos (bbox overlay) y tres cámaras del robot Panda. Con 4.143.404.816 parámetros, el modelo recibe como entrada el estado del robot y tres imágenes RGB de 224×224, y genera una acción de control de 7 dimensiones. Resulta relevante para investigación en robótica manipuladora, especialmente para analizar cómo el ajuste fino sobre datos simulados afecta al comportamiento de una política VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en el modelo base pi05. Detalles de implementación no especificados en la información disponible. |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo no genera lenguaje natural; produce acciones de control) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `lerobot/pi05_base`. π₀.₅ (Pi05) es un modelo VLA (Vision-Language-Action) orientado a la generalización en entornos nunca vistos durante el entrenamiento, y la implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. El entrenamiento se ha realizado con el framework LeRobot sobre el dataset `sam-guided-vlas/train_1_2_hard_items__bbox__overlay_a50__sim__all_cameras__live`, que contiene 199 episodios y 31.073 fotogramas a 20 FPS. Las tareas incluidas en el dataset consisten en manipular objetos de geometría compleja, descritos por texto (por ejemplo, "smooth ball clasped by two flat curved arms", "barrel ringed by eight evenly spaced fat vertical ribs", "deep bowl with a wavy scalloped rim"). No se han proporcionado detalles sobre la composición exacta de los datos más allá del número de episodios y fotogramas, ni se menciona uso de RLHF o DPO; se trata de un ajuste supervisado para regresión de acciones.

## Capacidades

- Genera acciones de control en 7 dimensiones para el robot Panda a partir del estado del robot (9 dimensiones) y tres imágenes RGB de 224×224.
- Percepción multi-cámara: utiliza simultáneamente las cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`.
- Ajustado para tareas de manipulación de objetos "hard items" descritos en el dataset (esferas, cuencos, barriles, etc.), lo que apunta a la asociación de descripciones lingüísticas con acciones, aunque no se detalla en el README.
- No soporta tool calling ni function calling, ya que no es un modelo de lenguaje conversacional.
- No dispone de modo de razonamiento explícito (thinking mode) ni de capacidades de audio.
- Capacidades multilingües: no aplica.

## Casos de uso

- Evaluación comparativa de políticas de agarre en robótica: gracias al entrenamiento con 199 episodios y 31.073 frames, este checkpoint permite comparar el rendimiento de una política VLA de 4.1B parámetros frente a otras políticas (por ejemplo, basadas en MLP o CNN) en tareas de manipulación de objetos complejos en simulación.
- Aprendizaje por demostración para robots manipuladores: el modelo puede utilizarse como política base para aprender de demostraciones kinestésicas o teleoperadas, especialmente en entornos con tres cámaras y un robot Panda.
- Investigación en generalización de VLA: al partir de pi05, permite explorar el ajuste fino con datos específicos y medir si se conserva la capacidad de generalización open-world del modelo base.
- Estudio del efecto de anotaciones visuales en el aprendizaje: el nombre del checkpoint incluye "bbox overlay", lo que sugiere que las imágenes incorporan cuadros delimitadores superpuestos; este modelo facilita la comparación con variantes sin estas anotaciones.
- Automatización de pick-and-place en entornos simulados: el modelo produce acciones de 7 dimensiones directamente aplicables a un robot Panda simulado (por ejemplo, en MuJoCo o Isaac Sim) para tareas repetitivas de agarre.
- Generación de datos para robustez adversarial: al ser un modelo compacto de 4.1B parámetros y licencia Apache-2.0, puede integrarse en pipelines de simulación para generar estrategias de agarre en objetos difíciles y analizar fallos ante oclusiones o iluminación variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no hay requisitos oficiales. Para un modelo con 4.143.404.816 parámetros, el consumo de memoria de los pesos se estima en aproximadamente 16,6 GB en FP32 y 8,3 GB en FP16/BF16. El repositorio tiene un tamaño de 37,4 GB, lo que sugiere que los pesos podrían estar almacenados en FP32 e incluir estados de optimizador.
- GPU recomendadas: para inferencia en FP16, una RTX 4090 de 24 GB es suficiente; también son adecuadas A100 40 GB o H100.
- Compatibilidad con GPU de consumo: sí, con 24 GB de VRAM en FP16, aunque los requisitos exactos dependen del runtime.
- Opciones de despliegue: el modelo está publicado con LeRobot y puede cargarse con la librería `lerobot` desde Hugging Face. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano del repo | Dataset de ajuste | Licencia |
|---|---|---|---|---|
| Este checkpoint | 4.143.404.816 | 37.4 GB | train_1_2_hard_items__bbox__overlay_a50__sim__all_cameras__live | Apache-2.0 |
| lerobot/pi05_base | No disponible | No disponible | No disponible | No disponible (se recomienda verificar) |
| sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0 | No disponible | No disponible | train_1_2_pile__point__overlay_a25__sim__all_cameras__live | No disponible (se recomienda verificar) |

No se disponen de benchmarks para comparar el rendimiento entre estos modelos.

## Limitaciones y advertencias

- El checkpoint es un ajuste fino sobre un dataset de solo 199 episodios (31.073 frames), por lo que su rendimiento en escenarios fuera de la distribución de entrenamiento puede ser limitado.
- Depende de la configuración específica del robot (Panda) y de las tres cámaras; un cambio en la geometría o en las cámaras puede degradar la precisión de la acción.
- El modelo no es un sistema de lenguaje natural: no puede utilizarse para generación de texto ni para tareas de chatbot.
- Existe riesgo de "alucinación" de acciones si las observaciones visuales contienen objetos no vistos durante el entrenamiento, especialmente en el contexto de "hard items".
- La licencia declarada del checkpoint es Apache-2.0, lo que permite uso comercial, pero se recomienda verificar la licencia del modelo base pi05 y las condiciones de uso de los datos de entrenamiento.
- El repositorio tiene un tamaño de 37,4 GB, lo que puede implicar costes notables de almacenamiento y descarga.

## Enlaces

- Modelo en Hugging Face: [sam-guided-vlas/train_1_2_hard_items__bbox__overlay_a50__sim__all_cameras__live__pi05__seed_0](https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__bbox__overlay_a50__sim__all_cameras__live__pi05__seed_0)
- Modelo base: [lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- Dataset de entrenamiento: [sam-guided-vlas/train_1_2_hard_items__bbox__overlay_a50__sim__all_cameras__live](https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__bbox__overlay_a50__sim__all_cameras__live)
- Blog de Physical Intelligence sobre π₀.₅: [https://www.physicalintelligence.company/blog/pi05](https://www.physicalintelligence.company/blog/pi05)
- Repositorio LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Guía de pi05 en la documentación de LeRobot: [https://huggingface.co/docs/lerobot/main/en/pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
