# imstevenpmwork/dit_super_chatton_main-ema

## Resumen

Este modelo es una política de robótica basada en Multi-Task Diffusion Transformer (DiT), desarrollada por Steven Palma (imstevenpmwork) y entrenada con la librería LeRobot de HuggingFace. Resuelve el problema de control de robots mediante aprendizaje por imitación, concretamente la manipulación de objetos con un brazo robótico de tipo `omx_follower`. La arquitectura extiende Diffusion Policy con un transformer de difusión de gran tamaño y condicionamiento por texto y visión, lo que permite abordar tareas multi-tarea en robótica.

El checkpoint contiene 248.855.302 parámetros (dato real de los safetensors) y el repositorio ocupa 1.0 GB. El modelo fue entrenado sobre el dataset `imstevenpmwork/super_chatton`, compuesto por 100 episodios y 73.842 frames a 30 FPS, con la tarea de recoger un cubo azul y uno amarillo y dejarlos en una caja verde. No se han publicado resultados de evaluación en la información disponible, por lo que su rendimiento real en robot no está documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) |
| Parametros totales | 248.855.302 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Multi-Task Diffusion Transformer (DiT), tal como se describe en el paper arxiv:2507.05331. Esta arquitectura extiende Diffusion Policy con un transformer de difusión de gran tamaño y condicionamiento por texto y visión para aprendizaje multi-tarea. Soporta tanto objetivos de diffusion como de flow-matching. El paper indica que el método alcanza alta destreza con aproximadamente 450M de parámetros; este checkpoint concreto es más pequeño, con 248,9M.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `super_chatton`, que contiene 100 episodios y 73.842 frames a 30 FPS. La configuración de entrenamiento incluye 30.000 pasos, batch size de 80, optimizador Adam con learning rate de 0.0001 y semilla 1000. Las entradas del modelo son el estado del robot (6 dimensiones) y dos imágenes de 480x640 (cámara frontal y cámara de muñeca), y la salida es una acción de 6 dimensiones.

## Capacidades

- Control robótico de bajo nivel: genera acciones de 6 dimensiones a partir de observaciones de estado y dos imágenes de 480x640.
- Condicionamiento por visión: utiliza dos cámaras, una frontal y otra en la muñeca, para percibir el entorno y la posición de los objetos.
- Condicionamiento por estado: recibe el estado del robot (6 dimensiones) como entrada, lo que permite acciones dependientes de la configuración actual.
- Aprendizaje por imitación multi-tarea: la arquitectura DiT está diseñada para soportar múltiples tareas, aunque este checkpoint fue entrenado para una tarea concreta.
- Soporte de objetivos de diffusion y flow-matching: según el paper, el modelo puede entrenarse con ambos objetivos.
- No es un modelo de lenguaje: no soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Manipulación de objetos en entornos industriales: el modelo puede controlar un brazo robótico para recoger y colocar piezas en una línea de montaje, gracias a su condicionamiento visual y de estado.
- Automatización de laboratorios: puede realizar tareas repetitivas como mover muestras o reactivos entre contenedores, reduciendo la intervención humana.
- Robótica de asistencia en el hogar: el modelo puede ejecutar tareas sencillas de recoger y depositar objetos, como ordenar cubos o juguetes, en un entorno doméstico controlado.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar algoritmos de políticas de robótica dentro del ecosistema LeRobot, especialmente para tareas de manipulación con visión.
- Teleoperación y control de robots humanoides: el autor del modelo también trabaja en robots humanoides de bajo coste, por lo que esta política puede adaptarse como componente de control para brazos robóticos.
- Educación y demostraciones en robótica: al ser un modelo Apache-2.0 y entrenado con LeRobot, puede utilizarse en cursos o talleres para enseñar aprendizaje por imitación con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 248,9M de parámetros en precisión fp32, los pesos ocupan aproximadamente 1 GB, por lo que una GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia, aunque no hay datos oficiales.
- GPU recomendadas: no disponibles oficialmente. El modelo es compatible con GPUs NVIDIA que soporten CUDA, dado que LeRobot utiliza PyTorch.
- Compatibilidad con GPUs de consumo: sí, probablemente. El tamaño de los pesos sugiere que puede ejecutarse en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: LeRobot (PyTorch). No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada con otros modelos. El mismo autor ha publicado otro checkpoint llamado `imstevenpmwork/super_chatton_smolvla`, que parece ser una política basada en SmolVLA, pero no se han publicado especificaciones ni benchmarks en la información disponible. Tampoco hay datos de rendimiento de este modelo para comparar.

## Limitaciones y advertencias

- Entrenado para una única tarea concreta: recoger un cubo azul y uno amarillo y dejarlos en una caja verde. Puede no generalizar a otras tareas, objetos o disposiciones del entorno.
- Sin resultados de evaluación publicados: el rendimiento real en robot es desconocido. Es necesario validar el modelo en el hardware objetivo antes de usarlo en producción.
- Dependencia del hardware y las cámaras: las entradas de visión esperan imágenes de 480x640 de dos cámaras específicas. Cambiar la configuración de las cámaras puede degradar el rendimiento.
- No es un modelo de lenguaje: no aplican sesgos lingüísticos, pero los datos de entrenamiento pueden contener sesgos en la distribución de objetos, iluminación o posiciones que afecten a la generalización.
- Licencia Apache-2.0: permite uso comercial, pero requiere mantener el aviso de licencia y atribución. No hay restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imstevenpmwork/dit_super_chatton_main-ema
- Paper del método: https://huggingface.co/papers/2507.05331
- Dataset de entrenamiento: https://huggingface.co/datasets/imstevenpmwork/super_chatton
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=imstevenpmwork/super_chatton
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de Multi-Task DiT en LeRobot: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Perfil del autor: https://huggingface.co/imstevenpmwork
