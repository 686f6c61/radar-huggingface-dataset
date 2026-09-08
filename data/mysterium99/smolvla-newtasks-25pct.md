# mysterium99/smolvla-newtasks-25pct

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) diseñado para control robótico. Esta versión, desarrollada por mysterium99, es un fine-tune del modelo base `lerobot/smolvla_base`, entrenada sobre el dataset `new_task`, compuesto por 420 episodios y 424.832 frames a 30 FPS. El modelo resuelve el problema de generar acciones motoras de 6 dimensiones a partir de observaciones de estado y tres imágenes de cámaras, permitiendo que un robot manipulador realice tareas como empujar bloques o apretar una pelota. Su relevancia radica en su tamaño reducido (450.046.176 parámetros), que lo hace desplegable en hardware de consumo, y en el entrenamiento por imitación con datos de demostración. No se ha publicado información sobre la longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-Lenguaje-Acción (VLA) compacta basada en el diseño SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño SmolVLA presentado en el paper 2506.01844, un modelo VLA compacto y eficiente que combina codificadores visuales y un transformador de decisión para mapear observaciones a acciones. El modelo fue entrenado con el framework LeRobot (versión 0.6.1) mediante fine-tune del modelo base, con 5.147 pasos de entrenamiento, batch size 8, optimizador AdamW y tasa de aprendizaje 0,0001. El dataset `new_task` contiene 420 episodios grabados a 30 FPS con seis tareas etiquetadas, incluyendo manipulación de bloques y objetos. No se especifican técnicas de RLHF/DPO ni innovaciones adicionales más allá del diseño propio de SmolVLA.

## Capacidades

- Control robótico en bucle cerrado: genera vectores de acción de 6 dimensiones a partir del estado del robot y observaciones visuales.
- Visión multi-cámara: acepta tres entradas visuales de 256x256 píxeles, lo que permite robustez ante oclusiones parciales o puntos de vista distintos.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con LeRobot: compatible con el comando `lerobot-rollout` para ejecutar la política en robots reales.
- Operación a 30 FPS: el modelo se entrena con imágenes a 30 FPS, apto para control en tiempo real en hardware compatible.
- Sin soporte de tool calling ni generación de lenguaje: es un policy de acción pura, no un modelo de lenguaje conversacional.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios: el modelo puede mover bloques entre posiciones, lo que resulta útil para experimentos de robótica que requieren recolocar objetos de forma repetitiva.
- Embalaje y clasificación de objetos: gracias a las tareas de mover bloques a contenedores, puede adaptarse a sistemas de clasificación sencillos en almacenes.
- Asistencia en entornos de trabajo con objetos de tamaño pequeño: la tarea de apretar una pelota antiestrés demuestra capacidad para interacciones delicadas, aplicable en líneas de ensamblaje.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia para comparar políticas de control, ya que es compacto y su entrenamiento está documentado en LeRobot.
- Prototipado de nuevos comportamientos: al estar basado en un modelo preentrenado, se puede fine-tunear con pocos episodios para nuevas tareas de manipulación.
- Educación y demostraciones de robótica: la facilidad de uso con LeRobot y el tamaño reducido permiten ejecutarlo en GPUs de consumo en aulas o ferias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al no haber datos oficiales, se estima que los pesos en fp16 ocupan aproximadamente 0,9 GB; con activaciones y overhead del framework, se recomienda un mínimo de 2-3 GB de VRAM.
- GPU recomendadas: tarjetas consumer con al menos 4 GB de VRAM, como NVIDIA RTX 3060 o RTX 4060, o sistemas embebidos como Jetson Orin con GPU integrada.
- Despliegue en consumer GPU: sí, su tamaño de 450M parámetros lo hace apto para equipos de sobremesa.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, usando el comando `lerobot-rollout` o la API de Python. No aplican herramientas como vLLM, llama.cpp, Ollama o TGI por tratarse de un modelo de control robótico.
- Latencia y throughput: no disponibles; dependerán de la GPU y del hardware del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mysterium99/smolvla-newtasks-25pct | 450M | No disponible | Apache-2.0 | HuggingFace |
| lerobot/smolvla_base | No disponible | No disponible | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento para comparar el fine-tune con el base ni con otros modelos VLA de la misma categoría.

## Limitaciones y advertencias

- No se han publicado evaluaciones reales del robot: la model card indica explícitamente "No evaluation results have been provided".
- Generalización limitada: el modelo está entrenado para seis tareas específicas con una configuración concreta de robot (Follower) y cámaras; cambiar la distribución de objetos, iluminación o la presencia de distractores puede degradar su rendimiento, tal como advierte la propia model card.
- Dependencia de la configuración de observaciones: espera entradas exactas con claves `observation.state` de dimensión 6 e imágenes de 256x256 para tres cámaras; cualquier discrepancia en nombres o dimensiones hará fallar la inferencia.
- No es un modelo de lenguaje: no puede generar texto ni mantener diálogos, por lo que no debe usarse para tareas de NLP.
- Ausencia de información sobre cuantizaciones y contexto: no se proporcionan datos sobre soporte para cuantización ni longitud de contexto.
- Uso comercial permitido: la licencia Apache-2.0 lo permite, pero al no incluir garantías, el usuario debe validar el modelo en su propio entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mysterium99/smolvla-newtasks-25pct
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset new_task: https://huggingface.co/datasets/new_task
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
