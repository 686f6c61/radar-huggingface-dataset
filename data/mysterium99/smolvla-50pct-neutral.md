# mysterium99/smolvla-50pct-neutral

## Resumen

SmolVLA-50pct-neutral es un modelo de visión-lenguaje-acción (VLA) publicado por el usuario `mysterium99` y ajustado a partir del modelo base `lerobot/smolvla_base`. Se trata de un checkpoint de 450 millones de parámetros que, a partir de imágenes de tres cámaras y del estado del robot, predice acciones de control de seis dimensiones para un brazo robótico tipo Follower. El modelo está diseñado para ejecutarse en hardware de consumo, una característica que destaca la documentación de SmolVLA.

El modelo fue entrenado con el dataset `default_merged`, que contiene 150 episodios y 83.987 frames a 30 FPS, con tareas de manipulación como empujar bloques, recoger cubos y clasificar objetos por color. Su relevancia radica en que combina percepción visual y control motor en un paquete pequeño y con licencia Apache 2.0, lo que facilita experimentar con aprendizaje por imitación en entornos de investigación y docencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) transformer, basado en SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion documentada) |
| Idiomas soportados | No disponible (las tareas del dataset estan definidas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La familia SmolVLA se presenta como modelos visión-lenguaje-acción compactos que buscan un rendimiento competitivo con un coste computacional reducido y la posibilidad de desplegarse en hardware de consumo. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado con la librería LeRobot. La arquitectura interna no se detalla en la documentación disponible; se sabe que consume tres observaciones visuales de 256x256 píxeles, un vector de estado de 6 dimensiones y produce un vector de acción de 6 dimensiones. No se proporcionan especificaciones sobre el encoder visual ni sobre la capa de lenguaje.

El entrenamiento se realizó durante 20.000 pasos con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje de 0.0001 y semilla 0. El dataset de entrenamiento, `default_merged`, está compuesto por 150 episodios que suman 83.987 frames grabados a 30 FPS. Las tareas descritas son: empujar un bloque hasta una zona marcada con cinta, recoger un cubo y meterlo en una taza, y colocar todos los bloques amarillos en un contenedor. No se mencionan técnicas de RLHF, DPO ni otras fases de alineación del lenguaje.

## Capacidades

- Control de robot con retroalimentación visual: genera acciones de 6 dimensiones a partir del estado del robot y de tres imágenes de cámara.
- Percepción multi-cámara: procesa simultáneamente tres entradas visuales de 256x256 píxeles, lo que permite cobertura del espacio de trabajo.
- Seguimiento de tareas de manipulación: está entrenado para empujar, recoger y colocar objetos según instrucciones expresadas en inglés.
- Aprendizaje por imitación: la política modela el comportamiento de un operador a partir de las demostraciones del dataset.
- No dispone de capacidades de generación de texto, tool calling, agencia autónoma ni razonamiento simbólico; su función es exclusivamente de control motor.

## Casos de uso

- Pick-and-place en entornos controlados: el modelo puede controlar un brazo Follower para recoger cubos de una mesa y colocarlos en una taza o contenedor, gracias a las cámaras superior y lateral.
- Clasificación de objetos por color: aprovechando la tarea de colocar bloques amarillos en un contenedor, el modelo puede utilizarse en una célula robótica que separe objetos por color.
- Automatización de empuje de piezas: la tarea de empujar un bloque hasta una zona marcada con cinta permite implementar operaciones de posicionado de piezas en ensamblajes sencillos.
- Investigación en aprendizaje por imitación: los investigadores pueden usar este checkpoint como referencia para estudiar el rendimiento de VLA pequeños en tareas de manipulación, o como punto de partida para fine-tuning en nuevos datasets.
- Docencia y demostración de robótica: al ser un modelo compacto y con licencia Apache 2.0, es adecuado para laboratorios de universidades y talleres donde el hardware disponible es limitado.
- Prototipado rápido con LeRobot: dado que la librería LeRobot incluye integración directa, se puede ejecutar el modelo con el comando `lerobot-rollout` y evaluar en minutos el comportamiento de una política entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no se ha proporcionado ninguna evaluación para esta política, por lo que no se dispone de tasas de éxito ni comparativas numéricas frente a otros modelos VLA.

## Requisitos de hardware

- Tamaño de los pesos: 0.9 GB en formato safetensors. Con 450.046.176 parámetros, la VRAM necesaria para cargar el modelo en precisión float32 es de aproximadamente 1.8 GB, y en bfloat16 o float16, unos 0.9 GB, sin contar el overhead de activaciones.
- El model card afirma que SmolVLA está diseñado para hardware de consumo, por lo que una GPU consumer con 2-4 GB de VRAM debería ser suficiente para la inferencia en la práctica.
- No se especifican GPUs concretas recomendadas. No hay datos de latencia ni de throughput.
- Despliegue: se puede ejecutar con `lerobot-rollout` usando la estrategia base (`--strategy.type=base`), siempre que se disponga de un robot tipo Follower, puerto serie y cámaras compatibles. El entrenamiento se realiza con `lerobot-train` a partir del modelo base.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El único modelo directamente relacionado es `lerobot/smolvla_base`, del cual este checkpoint es un fine-tuning. No se han encontrado en la documentación datos sobre parámetros, contexto o rendimiento del modelo base que permitan construir una tabla comparativa completa. Por lo tanto, esta sección se limita a indicar que el modelo pertenece a la familia SmolVLA y que la comparación con otros VLA no está documentada.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado con tres tareas específicas y un dataset pequeño de 150 episodios; su generalización a otros objetos, posiciones, iluminación o robots no está evaluada.
- No existen resultados de evaluación en el model card, por lo que no hay evidencia de la tasa de éxito real en el robot.
- Al ser un modelo de aprendizaje por imitación, puede presentar comportamientos erráticos en escenarios no vistos o con distracciones.
- Las tareas están definidas en inglés; no se documenta soporte para otros idiomas.
- El modelo no genera texto ni responde a prompts; es un modelo de control motor, no un LLM.
- No se proporcionan detalles sobre sesgos, aunque por la naturaleza del dataset puede heredar los sesgos de comportamiento del operador que realizó las demostraciones.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe conservar la atribución y declarar los cambios realizados. No incluye garantía.
- El despliegue requiere hardware físico: un robot tipo Follower y cámaras calibradas. El modelo no funciona de manera autónoma sin la infraestructura robótica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mysterium99/smolvla-50pct-neutral
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset default_merged: https://huggingface.co/datasets/default_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=default_merged
