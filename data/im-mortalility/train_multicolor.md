# Im-mortalility/train_multicolor

## Resumen

Im-mortalility/train_multicolor es un modelo de visión-lenguaje-acción (VLA) compacto, resultado del fine-tuning de SmolVLA sobre el dataset de robótica vraiRobotLab/multicolor_block_tiles. Desarrollado por el usuario Im-mortalility mediante el framework LeRobot, este modelo está especializado en tareas de manipulación robótica, concretamente en la colocación de bloques de colores (rojo, azul, verde) en una cuadrícula de nueve posiciones, a partir de instrucciones en lenguaje natural. SmolVLA destaca por su eficiencia computacional, lo que permite desplegar políticas robóticas en hardware de consumo, un avance significativo frente a modelos VLA de gran tamaño que requieren infraestructura de alto coste.

El modelo se basa en la arquitectura SmolVLA (paper arXiv:2506.01844), con 450 millones de parámetros en total, y ha sido entrenado con 20.000 pasos sobre un dataset de 181 episodios y 61.503 frames capturados a 30 FPS. Su entrada combina el estado del robot (6 dimensiones) con tres imágenes de cámaras (muñeca, superior y de profundidad) a resolución 256×256, y produce acciones de 7 dimensiones. Aunque el modelo es de tipo VLA, no se especifican idiomas soportados en la información proporcionada, pero la naturaleza de las tareas (instrucciones en inglés) sugiere un enfoque en el idioma inglés.

La relevancia de este modelo radica en demostrar el fine-tuning de SmolVLA para tareas específicas de manipulación con hardware asequible, lo que abre la puerta a la robótica de aprendizaje por imitación en entornos de investigación y pequeña industria. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas, y su integración con LeRobot facilita su despliegue en robots SO-101.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada visual de 3 imágenes 256×256 y estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción (VLA) que combina un codificador visual y un modelo de lenguaje con una cabeza de acción para generar comandos de control robótico. El modelo base, lerobot/smolvla_base, se ha fine-tuneado con el dataset vraiRobotLab/multicolor_block_tiles, que contiene 181 episodios y 61.503 frames (30 FPS) de manipulaciones de bloques de colores en una cuadrícula de 3×3. El entrenamiento se realizó con 20.000 pasos, batch size de 8, optimizador AdamW y learning rate de 1e-05, utilizando la versión 0.6.1 de LeRobot.

La innovación principal de SmolVLA es su eficiencia computacional: reduce el coste de entrenamiento e inferencia frente a VLA de gran escala, lo que permite su ejecución en hardware de consumo (GPUs como RTX 3090/4090). El modelo procesa tres flujos de imagen (cámara de muñeca, cámara superior y cámara de profundidad) junto con el estado del robot (posición de 6 DOF) y genera acciones de 7 dimensiones (posición y orientación del efector). No se mencionan técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Manipulación robótica: ejecuta tareas de pick-and-place de bloques de colores en una cuadrícula de 9 posiciones, siguiendo instrucciones en lenguaje natural.
- Integración multimodal: consume tres imágenes (256×256) y el estado del robot (6 dimensiones) para generar acciones de 7 dimensiones.
- Control en tiempo real: diseñado para ejecución en tiempo real a 30 FPS, adecuado para control de robots SO-101.
- Fine-tuning específico: capacidad de adaptación a tareas concretas mediante fine-tuning con datasets de imitación, como se demuestra en este modelo.
- Despliegue en hardware de consumo: gracias a su tamaño compacto (450M parámetros), puede ejecutarse en GPU de gama media, lo que facilita prototipado y experimentación.
- Integración con LeRobot: compatible con el ecosistema de HuggingFace LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Automatización de pick-and-place en almacenes: el modelo puede colocar objetos en posiciones definidas mediante comandos de voz o texto, reduciendo la necesidad de programación manual de trayectorias.
- Prototipado de políticas robóticas en investigación: investigadores pueden usar este modelo como base para estudiar el aprendizaje por imitación en manipulación, gracias a su eficiencia y facilidad de fine-tuning.
- Control de robots de bajo coste en entornos educativos: su compatibilidad con hardware de consumo permite su uso en laboratorios docentes con presupuestos limitados.
- Integración en sistemas de automatización flexible: el modelo puede adaptarse a nuevas tareas con datasets pequeños, lo que facilita el reentrenamiento en líneas de producción con cambios frecuentes.
- Evaluación de VLA en robótica: sirve como referencia para comparar el rendimiento de SmolVLA frente a otros modelos VLA en tareas de manipulación.
- Teleoperación asistida: el modelo puede generar acciones de control en tiempo real a partir de comandos de lenguaje, asistiendo a operadores en tareas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento en tareas de robótica, como tasas de éxito o precisión en la colocación de bloques. Se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) para métricas generales del modelo base, aunque no se han reportado resultados específicos para este fine-tuning.

## Requisitos de hardware

- Inferencia: el modelo tiene 450M parámetros, lo que requiere aproximadamente 1,8 GB de VRAM en FP32, y menos de 1 GB en cuantización FP16 (común en LeRobot). Puede ejecutarse en GPU con al menos 4 GB de VRAM.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 3090 (24 GB), RTX 4090 (24 GB) o superiores para mayor throughput. También es compatible con GPUs de menor capacidad si se reduce la resolución de las imágenes.
- Despliegue en consumer GPU: sí, el modelo está diseñado para ello. En una RTX 3090 se puede alcanzar una latencia de inferencia de menos de 50 ms por paso (estimación basada en el tamaño del modelo, no en datos publicados).
- Opciones de despliegue: LeRobot (herramienta principal), que ofrece scripts de rollout y entrenamiento. También se puede exportar a ONNX o TensorRT para optimización, aunque no se documenta en el README.
- Latencia y throughput: no disponible en la información proporcionada, pero el modelo está optimizado para operar a 30 FPS en hardware de consumo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. SmolVLA se puede comparar con otros VLA como OpenVLA o RT-2, pero no se han publicado datos de rendimiento de este fine-tuning específico, por lo que no se puede realizar una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo está entrenado solo con el dataset multicolor_block_tiles, que contiene tareas de colocación de bloques con tres colores y nueve posiciones. No generaliza a otras tareas o configuraciones de objetos sin reentrenamiento.
- Riesgo de alucinación en acciones: en robótica, las alucinaciones se manifiestan como acciones incorrectas o inestables, especialmente si el entorno difiere del dataset de entrenamiento (cambios de iluminación, posición de la cámara, etc.).
- Limitaciones de contexto visual: las imágenes de entrada son de 256×256 píxeles, lo que puede perder detalles finos en entornos complejos o con objetos pequeños.
- Idiomas soportados: el modelo de lenguaje subyacente (SmolVLA) puede soportar múltiples idiomas, pero el dataset de entrenamiento usa instrucciones en inglés; no se garantiza el rendimiento en otros idiomas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de uso de los modelos base y datasets asociados (por ejemplo, el dataset vraiRobotLab/multicolor_block_tiles puede tener sus propios términos).
- Dependencia de la configuración del robot: el modelo se ha entrenado para el robot SO-101 y con una disposición específica de cámaras (muñeca, superior y de profundidad). Cambios en la configuración física requerirán reentrenamiento o calibración.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Im-mortalility/train_multicolor
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/vraiRobotLab/multicolor_block_tiles
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
