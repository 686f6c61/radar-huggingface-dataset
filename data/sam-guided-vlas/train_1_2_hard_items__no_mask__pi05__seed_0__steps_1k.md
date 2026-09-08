# sam-guided-vlas/train_1_2_hard_items__no_mask__pi05__seed_0__steps_1k

## Resumen

El modelo `sam-guided-vlas/train_1_2_hard_items__no_mask__pi05__seed_0__steps_1k` es una política de robótica de tipo Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), desarrollada por Physical Intelligence y adaptada al ecosistema LeRobot. Se trata de un fine-tuning del modelo base `lerobot/pi05_base` sobre un dataset de manipulación de objetos con geometrías complejas, diseñado para probar la capacidad de generalización del modelo a entornos y situaciones no vistas durante el entrenamiento.

La arquitectura consume observaciones multimodales: el estado del robot (9 dimensiones) y tres imágenes de 224x224 píxeles procedentes de cámaras montadas en el robot y en el entorno. Produce acciones de 7 dimensiones para el control de un brazo robótico Panda. El modelo tiene aproximadamente 4.143 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, implementada con LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política VLA que hereda la arquitectura de π₀.₅, un modelo de Physical Intelligence orientado a la generalización en mundo abierto. Según la información disponible, π₀.₅ evoluciona a π₀ para generalizar a entornos y situaciones completamente nuevos. La implementación utilizada es la adaptación de LeRobot del repositorio open-source OpenPI.

El entrenamiento se realizó sobre el dataset `sam-guided-vlas/train_1_2_hard_items__no_mask`, compuesto por 199 episodios y 31.073 frames a 20 FPS. Las tareas descritas en el dataset consisten en la manipulación de objetos con formas irregulares y complejas (esferas con brazos curvos, cuencos con bordes ondulados, formas lobuladas, etc.), lo que sugiere un enfoque en el agarre y la interacción con objetos difíciles de modelar geométricamente. No se especifica si se utilizaron técnicas como RLHF o DPO durante el entrenamiento.

## Capacidades

- Control robótico de bajo nivel: genera acciones continuas de 7 dimensiones para un brazo robótico Panda.
- Percepción visual multimodal: procesa simultáneamente tres imágenes de 224x224 píxeles (vista del agente, cámara en la mano y segunda cámara en la mano) junto con el estado del robot.
- Generalización a entornos nuevos: hereda la capacidad declarada de π₀.₅ para adaptarse a situaciones no vistas durante el entrenamiento.
- Integración con LeRobot: el modelo está entrenado y empaquetado para su uso directo con la biblioteca LeRobot de Hugging Face.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de texto o lenguaje: no disponibles; el modelo no está orientado a generación de texto.

## Casos de uso

- Manipulación de objetos con geometrías complejas: el modelo puede controlar un brazo Panda para agarrar objetos con formas irregulares, como esferas con brazos curvos o cuencos con bordes ondulados, gracias a su entrenamiento específico en este tipo de piezas.
- Tareas de agarre y colocación en entornos de laboratorio: adecuado para experimentos de robótica que requieren una política visual que se adapte a objetos no predefinidos.
- Evaluación de políticas en simulación o con robots reales: al estar empaquetado con LeRobot, permite reproducir experimentos de manipulación con un flujo de trabajo estándar.
- Investigación en generalización de políticas VLA: sirve como punto de partida para estudiar cómo un modelo de este tipo se comporta ante objetos "difíciles" no vistos en el entrenamiento.
- Benchmarking de fine-tuning en robótica: el modelo es una instancia de fine-tuning con un número concreto de pasos (1k), lo que permite comparar el efecto de la duración del entrenamiento en el rendimiento.
- Integración en pipelines de datos de robots: puede utilizarse como política de referencia en sistemas de recogida de datos para entrenar nuevos modelos o evaluar la calidad de un dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 4.143 millones de parámetros, pero no se especifica la arquitectura exacta ni el formato de precisión, por lo que no es posible calcular la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot. No se mencionan otros frameworks como vLLM, llama.cpp, Ollama o TGI, que son específicos para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sam-guided-vlas/train_1_2_hard_items__no_mask__pi05__seed_0__steps_1k | 4.143.404.816 | no disponible | Apache 2.0 | HuggingFace |
| lerobot/pi05_base | no disponible | no disponible | no disponible | HuggingFace |
| sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones completas para los modelos comparables. La variante `steps_15k` del mismo autor es un fine-tuning con más pasos de entrenamiento sobre el mismo modelo base, pero no se conocen sus características técnicas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al estar entrenado sobre un dataset específico de manipulación de objetos, el modelo puede estar sesgado hacia las tareas y configuraciones de cámara presentes en ese dataset.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto, pero existe riesgo de que la política produzca acciones no deseadas en situaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: el modelo no soporta lenguaje natural como entrada ni salida; no se han especificado idiomas.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y distribución, siempre que se mantenga el aviso de licencia. Sin embargo, no se ofrecen garantías de seguridad ni de rendimiento.
- Limitaciones de hardware: al ser un modelo de visión con múltiples entradas de imagen, requiere un sistema con capacidad para procesar tres flujos de vídeo simultáneamente. Los requisitos exactos no se han especificado.
- Dependencia de LeRobot: el modelo está pensado para ejecutarse con la biblioteca LeRobot; su uso fuera de este ecosistema puede requerir adaptaciones no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__no_mask__pi05__seed_0__steps_1k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__no_mask
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Variante con 15k pasos: https://huggingface.co/sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k
