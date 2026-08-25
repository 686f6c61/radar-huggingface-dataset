# Alkatt/SmolVLA_pickstacksort150_V3_2026_08_22

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, descrito en el artículo arXiv 2506.01844. Combina un modelo de lenguaje y visión (VLM) preentrenado con un experto de acciones entrenado mediante flow matching, de modo que a partir de varias imágenes y una instrucción en lenguaje natural genera un fragmento (chunk) de acciones de control para un robot. Su diseño ligero permite ejecutarlo en hardware de consumo, a diferencia de otros VLA de gran tamaño.

Este repositorio concreto, `Alkatt/SmolVLA_pickstacksort150_V3_2026_08_22`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` sobre el dataset `Alkatt/so101_pickstacksort150_V3_2026_08_22`, que contiene 150 episodios de una tarea de recogida, apilado y clasificación de objetos (pick-stack-sort) con el robot SO-101. El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

La relevancia de esta ficha radica en que ejemplifica cómo adaptar un VLA generalista a una tarea robótica específica mediante aprendizaje por imitación con la librería LeRobot, manteniendo un coste computacional reducido y una huella de memoria pequeña (1,2 GB en safetensors).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + experto de acciones con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente BF16/F32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un VLM preentrenado (de la familia SmolVLM) que procesa imágenes y texto, y de un experto de acciones que utiliza flow matching para predecir secuencias de acciones. El modelo recibe múltiples imágenes de cámaras y una instrucción en lenguaje, y emite un chunk de acciones que el robot puede ejecutar directamente. Esta arquitectura reduce significativamente el coste computacional frente a VLA de mayor tamaño, manteniendo un rendimiento competitivo en tareas de manipulación.

El ajuste fino se realizó con la librería LeRobot sobre el dataset `Alkatt/so101_pickstacksort150_V3_2026_08_22`, que contiene 150 episodios de demostración de la tarea pick-stack-sort en un robot SO-101. No se especifican en la información disponible los hiperparámetros de entrenamiento, el número de épocas ni la composición exacta del dataset. El modelo base `lerobot/smolvla_base` ya incorpora el conocimiento general de visión y lenguaje, y este fine-tuning lo especializa en la tarea concreta.

## Capacidades

- Control robótico: genera acciones de posición y orientación para el robot SO-101 a partir de observaciones visuales y una instrucción textual.
- Percepción visual: procesa imágenes de cámaras para entender la escena y localizar objetos.
- Comprensión de instrucciones en lenguaje natural: interpreta comandos como "apila el cubo rojo sobre el cubo azul" o "clasifica las piezas por color".
- Generación de chunks de acciones: produce secuencias de acciones de longitud fija, lo que permite un control suave y anticipatorio.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- Eficiencia computacional: al tener solo 450M parámetros, puede ejecutarse en GPUs de consumo sin necesidad de hardware especializado.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede controlar un brazo robótico SO-101 para recoger objetos de una posición y colocarlos en otra, guiado por instrucciones en lenguaje.
- Apilado de objetos (stacking): útil en entornos de investigación para estudiar estrategias de manipulación con requisitos de precisión, donde el modelo predice acciones que evitan colisiones y aseguran estabilidad.
- Clasificación y ordenación de piezas (sorting): el modelo puede separar objetos por color, forma o tamaño en una cinta transportadora o mesa de trabajo, a partir de una instrucción textual.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este fine-tuning como punto de partida para nuevas tareas, ajustándolo con pocos episodios adicionales gracias a su tamaño reducido.
- Educación en robótica y aprendizaje por imitación: sirve como ejemplo práctico para enseñar a estudiantes cómo entrenar y desplegar un VLA en hardware de bajo coste.
- Evaluación comparativa de algoritmos VLA: al ser un modelo pequeño y reproducible, permite comparar métricas de rendimiento y consumo de recursos frente a otros enfoques en tareas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la información disponible. El artículo original de SmolVLA (arXiv 2506.01844) reporta evaluaciones en tareas robóticas estándar, pero no se incluyen aquí los datos numéricos. Para este repositorio concreto, no hay métricas de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parámetros y pesos en BF16 (aproximadamente 900 MB), la inferencia puede realizarse en GPUs con al menos 4 GB de VRAM, aunque se recomienda 6-8 GB para margen y procesamiento de imágenes.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060, RTX 4060 o superiores son suficientes. También puede ejecutarse en GPUs de datacenter como A100, pero no es necesario.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, lo que facilita su uso en laboratorios con recursos limitados.
- Opciones de despliegue: el modelo se usa principalmente a través de LeRobot, que proporciona scripts de evaluación e inferencia con PyTorch. No está diseñado para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá de la GPU, el número de cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Alkatt/SmolVLA_pickstacksort150_V3 (este) | 450M | No disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M (aprox.) | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA (referencia) | 7B | No disponible | MIT (investigación) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información consultada. SmolVLA es significativamente más pequeño que OpenVLA, lo que implica menor coste de inferencia y mayor facilidad de despliegue, pero no se pueden cuantificar las diferencias de precisión sin benchmarks publicados para este fine-tuning.

## Limitaciones y advertencias

- Especialización limitada: el modelo se ha ajustado para una tarea concreta (pick-stack-sort) con solo 150 episodios, por lo que puede no generalizar a otras tareas, objetos o entornos no vistos durante el entrenamiento.
- Dependencia del robot: las acciones generadas están calibradas para el robot SO-100/SO-101; usarlo en otro hardware requeriría reentrenamiento o adaptación.
- Sin información sobre sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con demostraciones humanas, puede heredar sesgos en la forma de manipular objetos o en la interpretación de instrucciones.
- Riesgo de alucinación en instrucciones ambiguas: aunque no es un modelo de texto puro, puede malinterpretar comandos complejos o con referencias espaciales poco claras, generando acciones incorrectas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe mantener la atribución y no se ofrece garantía de rendimiento en entornos de producción.
- Ausencia de métricas de robustez: no hay datos sobre comportamiento ante cambios de iluminación, oclusiones o variaciones en la disposición de objetos, lo que exige pruebas adicionales antes de un despliegue real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Alkatt/SmolVLA_pickstacksort150_V3_2026_08_22
- Artículo de SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/Alkatt/so101_pickstacksort150_V3_2026_08_22
