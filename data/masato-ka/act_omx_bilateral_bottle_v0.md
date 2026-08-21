# masato-ka/act_omx_bilateral_bottle_v0

## Resumen

El modelo `masato-ka/act_omx_bilateral_bottle_v0` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por el autor masato-ka y entrenada con el framework LeRobot. ACT es un método de imitación que predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que permite a un robot ejecutar tareas de manipulación con alta tasa de éxito a partir de demostraciones teleoperadas. Este modelo concreto está entrenado para la tarea de recoger una botella con un robot seguidor OMX bilateral, usando una cámara cenital como única fuente visual.

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero diseñado para ejecutarse en tiempo real en hardware robótico. Fue entrenado con un conjunto de datos propio de 10 episodios (9967 frames a 30 FPS) y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ser un ejemplo práctico de cómo aplicar ACT con LeRobot a tareas de manipulación bimanual, aunque su utilidad se limita al escenario específico de la tarea entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer encoder-decoder |
| Parametros totales | 51.673.734 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de acciones, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer con codificador de visión y decodificador de acciones. El modelo recibe como entrada el estado del robot (vector de 11 dimensiones) y una imagen de cámara cenital (480x640 píxeles RGB), y produce una secuencia de acciones de 6 dimensiones. La arquitectura se basa en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), que introduce el mecanismo de "action chunking" para mejorar la consistencia temporal de las acciones generadas.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 10 episodios teleoperados, con un total de 9967 frames a 30 FPS. La configuración de entrenamiento incluye 20.000 pasos, tamaño de lote 8, optimizador AdamW y una tasa de aprendizaje de 1e-05 con semilla 1000. No se ha aplicado RLHF ni DPO; es un entrenamiento puramente de imitación supervisada.

## Capacidades

- Ejecución de la tarea específica de recoger una botella con un robot OMX seguidor.
- Procesamiento de imágenes de cámara central (RGB, 480x640) para percibir el entorno.
- Generación de acciones de control de 6 dimensiones (posición y orientación del efector final).
- Control basado en observación de estado (vector de 11 dimensiones) y visión.
- Inferencia a 30 Hz, adecuada para control en tiempo real.

No soporta tool calling, agentes ni razonamiento simbólico. No es un modelo de lenguaje ni multimodal en el sentido tradicional.

## Casos de uso

- Manipulación robótica de objetos pequeños en entornos de laboratorio: el modelo puede ser utilizado para automatizar tareas de pick-and-place en investigaciones de robótica, donde se requiere una política de control precisa y robusta a partir de demostraciones.
- Prototipado de políticas de imitación con LeRobot: sirve como ejemplo de referencia para desarrolladores que quieren entrenar y desplegar políticas ACT con el framework LeRobot, mostrando la configuración completa de datos, entrenamiento e inferencia.
- Investigación en aprendizaje por imitación: se puede usar como baseline para comparar variantes de ACT o para estudiar el efecto del tamaño del dataset en la tasa de éxito.
- Despliegue en robots OMX de bajo coste: el modelo es ligero (51M parámetros) y puede ejecutarse en hardware embebido o GPU de consumo, permitiendo su uso en entornos educativos o de investigación con recursos limitados.
- Automatización de tareas repetitivas en líneas de montaje: la capacidad de predecir secuencias de acciones estables puede aplicarse a tareas de ensamblaje sencillas, siempre que se reentrene con datos específicos del entorno.
- Evaluación de políticas en simulación: dado que el modelo es compatible con el ecosistema LeRobot, puede integrarse en simuladores como MuJoCo para validar el comportamiento antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado evaluaciones en robot real. No hay datos de éxito de la tarea.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51M parámetros, la inferencia requiere menos de 1 GB de VRAM en precisión FP32. En CPU también es viable, aunque con latencia mayor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060) es suficiente. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, A4000).
- Cabe en GPU de consumo: sí, incluso en integradas con suficiente memoria compartida.
- Opciones de despliegue: se puede ejecutar con el CLI de LeRobot (`lerobot-rollout`), o integrarse en un pipeline de Python usando la API de LeRobot. No hay soporte nativo para vLLM, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia: no hay datos medidos, pero al ser un modelo pequeño y con inferencia a 30 Hz durante el entrenamiento, se espera que la inferencia sea de unos pocos milisegundos en GPU.

## Comparativa con modelos similares

No hay datos de otros modelos de la misma categoría en la información proporcionada. La comparativa no está disponible. Se podría comparar con otros modelos de ACT publicados en el Hub de HuggingFace, pero no se dispone de sus métricas.

## Limitaciones y advertencias

- Dataset muy pequeño: solo 10 episodios de entrenamiento, lo que puede provocar sobreajuste y baja generalización a variaciones del entorno (posición de la botella, iluminación, etc.).
- Tarea específica: el modelo solo es válido para la tarea de recoger una botella en el entorno concreto donde se recogieron los datos. No es transferible a otras tareas sin reentrenamiento.
- Sin evaluación real: no se han publicado resultados de éxito en robot real, por lo que el rendimiento real es desconocido.
- Dependencia de la cámara cenital: el modelo requiere una cámara fija con la misma posición y orientación que la del entrenamiento; cambios de perspectiva degradan el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero no se incluyen garantías de idoneidad para producción.
- Riesgo de alucinación no aplica (no es un modelo de texto), pero la predicción de acciones puede ser inestable si el estado del robot se desvía de lo visto en entrenamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/masato-ka/act_omx_bilateral_bottle_v0)
- [Dataset de entrenamiento](https://huggingface.co/datasets/masato-ka/omx_bilateral_bottle_v0)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
