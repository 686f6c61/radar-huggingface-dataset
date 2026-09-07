# castanetnicolas/ACT_UR5e_BS_16_Act_Chunk_50

## Resumen

El modelo ACT_UR5e_BS_16_Act_Chunk_50 es una política de aprendizaje por imitación desarrollada por castanetnicolas sobre la librería LeRobot de Hugging Face. Utiliza el método Action Chunking with Transformers (ACT), presentado en el paper arxiv:2304.13705, que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que reduce la acumulación de errores y genera movimientos más suaves en robots manipuladores.

El modelo está entrenado para controlar un brazo robótico UR5e en la tarea de recoger una tuerca cuadrada y encajarla en un pasador cuadrado. Cuenta con 51.621.511 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Aunque su tamaño es reducido, está diseñado para operar en entornos de robótica real, procesando observaciones de estado y dos cámaras RGB para generar acciones de control de 7 dimensiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.621.511 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ACT, un transformer que en lugar de predecir una única acción por paso, predice un bloque de acciones de longitud fija (action chunking). Esta técnica permite que la política mantenga consistencia temporal y reduzca el error de acumulación típico de los métodos que predicen acciones de forma independiente. La entrada del modelo está compuesta por el estado del robot (9 dimensiones) y dos imágenes RGB de 256x256 píxeles procedentes de las cámaras camera1 y camera2. La salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con el dataset castanetnicolas/UR5e_nut_assembly_square, que contiene 100 episodios y 20.211 fotogramas grabados a 20 FPS mediante teleoperación. La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, usando la versión 0.6.1 de LeRobot. No se indica si se aplicó RLHF o DPO, ya que es un modelo de política robótica y no un modelo de lenguaje.

## Capacidades

- Generación de acciones de control para el brazo robótico UR5e, con salida de 7 dimensiones (posición, orientación, etc.).
- Predicción de bloques de acciones (action chunking) de longitud fija, lo que permite movimientos más suaves y consistentes.
- Percepción visual a partir de dos cámaras RGB de 256x256, combinadas con el estado del robot.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de modelos de recompensa.
- Entrenado específicamente para la tarea de ensamblaje: recoger una tuerca cuadrada y encajarla en un pasador cuadrado.
- Integración con la librería LeRobot, lo que facilita su despliegue y reentrenamiento.
- No soporta tool calling, agentes, razonamiento simbólico ni capacidades multilingües, al ser un modelo de política robótica.

## Casos de uso

- Ensamblaje automatizado de piezas en producción: el modelo puede ejecutar la inserción de una tuerca cuadrada en un pasador cuadrado en una célula robótica con un UR5e. Es adecuado porque está entrenado específicamente para esta tarea y genera acciones suaves.
- Automatización de tareas repetitivas en laboratorios de investigación: se puede usar para montar componentes pequeños en experimentos, aprovechando la capacidad de aprendizaje por imitación.
- Desarrollo de nuevas tareas de manipulación mediante fine-tuning: partiendo de este modelo, se puede reentrenar con datos teleoperados de nuevas tareas, ya que la arquitectura ACT es modular y está soportada por LeRobot.
- Demostración de la librería LeRobot: sirve como ejemplo práctico de cómo entrenar y desplegar una política ACT en un robot real, útil para docencia o formación.
- Control de robots colaborativos en entornos de ensamblaje: el modelo puede integrarse en un sistema de control de un UR5e para tareas de ensamblaje de precisión, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del action chunking en la suavidad y robustez de las políticas robóticas, comparando con métodos de predicción de acciones individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño de 51,6 millones de parámetros, el modelo es ligero, pero no se proporcionan requisitos oficiales.
- GPU recomendadas: no se especifica oficialmente.
- Compatibilidad con GPU de consumo: probablemente sí, dada la baja cantidad de parámetros, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout`. No es compatible con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El modelo es específico para la tarea de ensamblaje con un UR5e y no se aportan datos de otros modelos ACT.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no hay datos específicos, pero al ser un modelo de política robótica, puede producir acciones incorrectas si las observaciones difieren del entrenamiento.
- Limitaciones de contexto o idioma: no aplica, ya que no procesa lenguaje natural.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, modificación y distribución, siempre que se mantenga el aviso de licencia y se cite la fuente.
- Caveat importante: el modelo está entrenado para un robot UR5e y una tarea concreta, con dos cámaras específicas. No generaliza a otros robots, tareas o configuraciones de cámaras sin reentrenamiento. Además, no se han publicado resultados de evaluación, por lo que su rendimiento real en el robot no está verificado.

## Enlaces

- HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_16_Act_Chunk_50
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper original en arXiv: https://arxiv.org/abs/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_nut_assembly_square
- LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
