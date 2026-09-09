# sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_10k

## Resumen

Este modelo es un fine-tuning de π₀.₅ (Pi05), un modelo Vision-Language-Action desarrollado por Physical Intelligence para la generalización en robótica. El autor `sam-guided-vlas` lo ha entrenado con el framework LeRobot sobre el dataset `train_1_2_pile__no_mask`, compuesto por 200 episodios y 69.392 frames a 20 FPS, correspondientes a 20 tareas de manipulación de objetos (por ejemplo, recoger un limón, una jarra o una caja de cereales). El resultado es una política de control que consume observaciones multimodales (estado del robot y tres imágenes de cámara) y emite acciones continuas de 7 dimensiones para un brazo robótico Panda.

El modelo parte del checkpoint preentrenado `lerobot/pi05_base` y se ha ajustado durante 10.000 pasos con batch size 16, optimizador AdamW y una tasa de aprendizaje de 5e-05. Con 4.143.404.816 parámetros y una licencia Apache-2.0, está orientado a desarrolladores e investigadores que necesitan una política robótica lista para desplegar o reentrenar en nuevos entornos. La longitud de contexto no se especifica en la información disponible, lo cual es habitual en modelos de control continuo que no generan texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); detalles internos no disponibles |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada; el modelo produce acciones, no texto) |
| Tipos de cuantización | No disponible (los pesos se distribuyen en safetensors sin cuantización predefinida) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Vision-Language-Action de π₀.₅, diseñada para generalizar a entornos y situaciones no vistos durante el entrenamiento, evolucionando el modelo anterior π₀. La implementación utilizada proviene del framework LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. En la información disponible no se detallan los componentes internos de la arquitectura (número de capas, tipo de atención, etc.).

En cuanto al entrenamiento, este modelo se ha ajustado a partir de `lerobot/pi05_base` usando el dataset `sam-guided-vlas/train_1_2_pile__no_mask`, que contiene 200 episodios de demostraciones teleoperadas. La configuración del entrenamiento incluye 10.000 pasos, batch size 16, optimizador AdamW, learning rate de 5e-05 y semilla 0, con la versión 0.6.0 de LeRobot. El proceso consiste en un fine-tuning de imitación, sin indicios de RLHF ni DPO. El modelo está pensado para consumir el estado del robot junto con tres vistas de cámara (vista del agente y dos cámaras ojo-en-mano) de 224×224 píxeles, y producir una acción de 7 dimensiones.

## Capacidades

- Control robótico continuo: genera acciones de 7 dimensiones para un brazo Panda, a partir de observaciones de estado e imágenes.
- Percepción multimodal: procesa simultáneamente un vector de estado de 9 valores y tres imágenes RGB de 224×224 (vista del agente y dos cámaras ojo-en-mano).
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset, con tareas como manipular una cesta, una caja de comida, un pastel, una lata, un limón, una jarra o un pulverizador.
- Fine-tuning sobre nuevas tareas: el modelo puede reentrenarse con LeRobot (`lerobot-train`) sobre datasets adicionales, partiendo de este checkpoint.
- Ejecución en tiempo real: puede desplegarse en un robot real mediante `lerobot-rollout`, con soporte para ejecución indefinida si se omite el parámetro `--duration`.
- Generalización open-world: según la model card, π₀.₅ está diseñada para generalizar a entornos no vistos, aunque no se aportan resultados de evaluación que lo confirmen.
- No soporta generación de texto, tool calling, agents ni razonamiento simbólico, al tratarse de una política de acción y no de un modelo de lenguaje de propósito general.

## Casos de uso

- Despliegue en un brazo robótico Panda: mediante el comando `lerobot-rollout`, el modelo se conecta al robot y se le asigna una tarea (por ejemplo, `--task="basket"`). Es adecuado porque la política está entrenada para consumir exactamente las observaciones de un robot Panda con tres cámaras y emitir acciones de 7 dimensiones.

- Fine-tuning para una aplicación específica: un desarrollador puede tomar este modelo como punto de partida y reentrenarlo con `lerobot-train` sobre un nuevo dataset de demostraciones. Esto permite adaptar la política a objetos o entornos distintos sin partir de cero, aprovechando el preentrenamiento de π₀.₅.

- Investigación en generalización open-world: el modelo puede utilizarse como referencia para estudiar cómo se comporta ante configuraciones no vistas durante el entrenamiento. Dado que π₀.₅ evoluciona π₀ para generalizar, este fine-tuning del mismo autor es un punto de partida útil para experimentos comparativos.

- Recogida de datos para aprendizaje por imitación: si se dispone de un robot Panda, se puede ejecutar la política para generar demostraciones adicionales o para explorar comportamientos que luego se añadan al dataset. La ejecución indefinida facilita la recopilación de trayectorias.

- Evaluación en simulación: los investigadores pueden cargar este modelo en un entorno de simulación compatible con LeRobot y comparar su tasa de éxito en las tareas del dataset. La model card proporciona la lista de tareas y la configuración de entrenamiento, lo que facilita la reproducibilidad.

- Desarrollo de aplicaciones de asistencia en cocina o almacén: el modelo puede adaptarse a tareas de manipulación de objetos cotidianos (cajas de cereales, jarras, frutas, pulverizadores) para entornos de robótica asistencial. Su licencia Apache-2.0 permite uso comercial con la atribución correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se han publicado cifras oficiales. Con 4.143.404.816 parámetros, los pesos en bf16 o fp16 ocupan aproximadamente 8,3 GB, mientras que en fp32 ocuparían unos 16,6 GB. Para inferencia se recomienda al menos una GPU con 12 GB de VRAM; para entrenamiento, 24 GB o más.
- GPU recomendada: no especificada en la documentación. Dado el tamaño del modelo, una GPU NVIDIA con CUDA es obligatoria; una RTX 4090 (24 GB) sería adecuada para fine-tuning en bf16, aunque no es un dato oficial.
- Compatibilidad con GPUs de consumo: probablemente sí, al menos para inferencia en bf16 con 16 GB de VRAM; no obstante, no hay una lista oficial de compatibilidad.
- Opciones de despliegue: LeRobot es la vía documentada, con los comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No se recomienda usar vLLM, llama.cpp u Ollama, ya que el modelo produce acciones numéricas continuas y no texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se limita a otros modelos de la familia π₀.₅ disponibles en Hugging Face, ya que no se dispone de información sobre modelos de otras categorías.

| Modelo | Parámetros | Dataset | Pasos de entrenamiento | Licencia |
|---|---|---|---|---|
| `sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_10k` | 4.143.404.816 | `train_1_2_pile__no_mask` (200 episodios) | 10.000 | Apache-2.0 |
| `sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k` | No disponible | `train_1_2__no_mask` | 15.000 | No disponible |
| `lerobot/pi05_base` | No disponible | No disponible | No disponible | No disponible |

El modelo aquí descrito es el único del que se dispone de datos concretos de parámetros y configuración. Los otros dos son referencias de la misma familia, pero sus especificaciones no están incluidas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos, pero el modelo se ha entrenado con un dataset de solo 200 episodios y 20 tareas, por lo que su comportamiento puede estar limitado a esos objetos y entornos, y puede no generalizar a situaciones diferentes.
- Riesgo de alucinación: al ser un modelo de acción, el riesgo no es textual; pueden producirse acciones incorrectas o inseguras si la percepción falla. Es imprescindible usar supervisión humana y mecanismos de seguridad en el robot.
- Limitaciones de idioma y contexto: no se especifica soporte multilingüe, y el modelo no está diseñado para generación de lenguaje ni diálogo; es únicamente una política de control.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y redistribución, pero obliga a mantener las atribuciones originales.
- Caveats de producción: no se han publicado evaluaciones en robot real. Antes de usar el modelo en producción, debe validarse en el robot objetivo y con las tareas concretas.
- Dependencia de configuración: el modelo requiere un robot tipo Panda con las tres cámaras especificadas (vista del agente y dos ojo-en-mano) para funcionar correctamente; usar una configuración distinta puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_10k](https://huggingface.co/sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_10k)
- Dataset de entrenamiento: [https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__no_mask](https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__no_mask)
- Modelo base: [https://huggingface.co/lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- Blog de Physical Intelligence sobre π₀.₅: [https://www.physicalintelligence.company/blog/pi05](https://www.physicalintelligence.company/blog/pi05)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentación de pi05 en LeRobot: [https://huggingface.co/docs/lerobot/main/en/pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- Otro fine-tuning de la misma familia: [https://huggingface.co/sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k](https://huggingface.co/sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k)
