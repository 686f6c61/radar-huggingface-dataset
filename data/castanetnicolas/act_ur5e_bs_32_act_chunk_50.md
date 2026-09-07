# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_50

## Resumen

El modelo `ACT_UR5e_BS_32_Act_Chunk_50` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado y entrenado con el framework LeRobot de Hugging Face, sobre un dataset de teleoperación de un brazo robótico UR5e realizando una tarea de ensamblaje: recoger una tuerca cuadrada y encajarla en un perno cuadrado.

El modelo tiene 51.621.511 parámetros y está diseñado para consumir el estado del robot y dos imágenes de cámara (de 256x256 píxeles) como entrada, generando una acción de 7 dimensiones como salida. Al ser un modelo de políticas robóticas, no se trata de un modelo de lenguaje: su relevancia radica en su capacidad para aprender tareas de manipulación complejas a partir de demostraciones humanas, con una arquitectura que permite planificar a corto plazo (chunks de 50 pasos) para reducir la acumulación de errores durante la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT), con encoder CVAE y decoder Transformer |
| Parametros totales | 51.621.511 |
| Parametros activos | No aplicable (no es un modelo de expertos mezclados) |
| Longitud de contexto | No aplicable (modelo de política robótica; predice chunks de 50 acciones) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repositorio) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo sigue el enfoque ACT presentado en el paper `arxiv:2304.13705`. Se trata de una arquitectura CVAE (Conditional Variational Autoencoder) en la que un encoder Transformer procesa las observaciones (estado del robot y dos imágenes) y un decoder Transformer genera un chunk de acciones futuro. Esta técnica de "action chunking" permite que el modelo prediga una secuencia de acciones de un solo paso, lo que reduce el error acumulado típico de las políticas que predicen una acción cada vez.

El modelo fue entrenado con el framework LeRobot, sobre el dataset `castanetnicolas/UR5e_nut_assembly_square`, compuesto por 100 episodios teleoperados y 20.211 frames a 20 FPS. La configuración de entrenamiento incluye 100.000 pasos, un tamaño de lote de 32, optimizador AdamW con tasa de aprendizaje de 1e-05 y semilla 1000. No se ha aplicado RLHF ni DPO; el entrenamiento es puramente de aprendizaje por imitación supervisada a partir de los datos teleoperados.

## Capacidades

- Aprendizaje por imitación: el modelo aprende políticas de control directamente de demostraciones teleoperadas, sin necesidad de modelar la dinámica del entorno.
- Predicción por chunks: genera secuencias de 50 acciones (según el nombre del repositorio), lo que permite planificar movimientos a corto plazo de forma coherente.
- Entrada multimodal: procesa simultáneamente el estado del robot (vector de 9 dimensiones) y dos imágenes de 256x256 píxeles de las cámaras `camera1` y `camera2`.
- Salida de acciones de 7 dimensiones, adecuada para el control del brazo UR5e (posiciones del efector final o articulaciones).
- Integración nativa con LeRobot: el modelo puede desplegarse mediante `lerobot-rollout` y entrenarse con `lerobot-train`.
- No incluye capacidades de lenguaje, razonamiento abstracto, tool calling ni generación de texto.

## Casos de uso

- Ensamblaje automatizado en celdas robóticas: el modelo puede ejecutar la tarea de insertar una tuerca cuadrada en un perno cuadrado en un brazo UR5e, guiándose por las dos cámaras para localizar el objeto y ajustar los movimientos.
- Manipulación de piezas en líneas de producción: se puede reentrenar con demostraciones de tareas similares (pick-and-place, apilado, inserción) y desplegar en entornos industriales con iluminación controlada.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia para comparar algoritmos de políticas dentro del ecosistema LeRobot, gracias a su implementación estándar y su tamaño reducido.
- Automatización de tareas de laboratorio: útil para tareas repetitivas de montaje de componentes en entornos de investigación, donde la variabilidad es baja y la precisión es crítica.
- Robótica educativa: el repositorio incluye instrucciones claras de entrenamiento y despliegue, lo que facilita su uso como ejemplo práctico en cursos de robótica y aprendizaje automático.
- Transferencia a tareas de ensamblaje similares: aunque está entrenado para una tarea concreta, el enfoque de action chunking permite reentrenar el modelo con nuevos datos teleoperados para adaptarlo a otras piezas o robots compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo ocupan aproximadamente 0.2 GB en el repositorio (formato safetensors). Para la inferencia en tiempo real, se estima que una GPU con al menos 4 GB de VRAM es suficiente, ya que además de los pesos hay que alojar las activaciones de las imágenes y los buffers de entrada.
- GPU recomendadas: cualquier GPU de las series NVIDIA RTX 30 o 40 con 6 GB de VRAM o más, como RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU, aunque el rendimiento en tiempo real con dos cámaras será limitado.
- Compatibilidad con GPUs de consumo: sí, el modelo es suficientemente pequeño como para ejecutarse en tarjetas de consumo de gama media.
- Opciones de despliegue: el modelo se despliega a través del framework LeRobot, usando `lerobot-rollout` para inferencia en el robot. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información de modelos comparables en los datos proporcionados. Aunque existen otras políticas de aprendizaje por imitación en el ecosistema LeRobot (como Diffusion Policy o TDMPC), no se han proporcionado especificaciones ni resultados para realizar una comparación rigurosa en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Pick up the square nut and fit it onto the square peg" sobre un brazo UR5e y con dos cámaras concretas. Su rendimiento fuera de esta configuración no está garantizado.
- No se han publicado resultados de evaluación en el repositorio, por lo que se desconoce la tasa de éxito real en la tarea.
- Al ser un modelo de aprendizaje por imitación, hereda los sesgos y limitaciones del dataset de teleoperación. Cambios en la iluminación, posición de objetos, o la aparición de distracciones pueden degradar significativamente su rendimiento.
- No es un modelo de lenguaje, por lo que no ofrece capacidades de comprensión textual ni generación de texto. Las advertencias habituales sobre alucinación o sesgos lingüísticos no aplican.
- La licencia Apache 2.0 permite el uso comercial, pero se debe mantener la atribución y las condiciones de la licencia.

## Enlaces

- Repositorio en Hugging Face: [https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_50](https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_50)
- Paper de ACT (Action Chunking with Transformers): [https://huggingface.co/papers/2304.13705](https://huggingface.co/papers/2304.13705)
- Dataset de entrenamiento: [https://huggingface.co/datasets/castanetnicolas/UR5e_nut_assembly_square](https://huggingface.co/datasets/castanetnicolas/UR5e_nut_assembly_square)
- Framework LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentación de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
- Perfil del autor: [https://huggingface.co/castanetnicolas](https://huggingface.co/castanetnicolas)
