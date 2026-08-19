# OrderDraconis/pi05_pickplace_leo

## Resumen

El modelo `OrderDraconis/pi05_pickplace_leo` es un fine-tuning del modelo base `lerobot/pi05_base`, que a su vez es una implementación en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence, un Vision-Language-Action (VLA) diseñado para generalización en entornos abiertos. Este fine-tuning ha sido entrenado específicamente para la tarea de recoger una pieza de tela superior y colocarla en un cuadrado objetivo, utilizando un robot bi-manual tipo `bi_so_follower` con tres cámaras.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0. Fue entrenado con el framework LeRobot sobre un dataset de 122 episodios y 96.339 frames, con 20.000 pasos de entrenamiento. Es relevante porque demuestra cómo un VLA preentrenado puede adaptarse a tareas de manipulación específicas mediante fine-tuning con pocos datos, un enfoque práctico para la robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción visual, sin generación de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina visión, lenguaje y acción para control robótico. La implementación en LeRobot está adaptada del repositorio OpenPI. El fine-tuning se realizó sobre el modelo base `lerobot/pi05_base` utilizando el dataset `Pink-Viking/pick_and_place_combined`, que contiene 122 episodios de una tarea de pick and place de tela. El entrenamiento se ejecutó con 20.000 pasos, batch size de 32, optimizador AdamW y learning rate de 2,5e-05, con semilla 1000. No se dispone de información sobre el preentrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, etc.).

## Capacidades

- Control de robot bi-manual tipo `bi_so_follower` con 12 grados de libertad (acción de 12 dimensiones).
- Percepción visual multi-cámara: tres cámaras (izquierda-mandíbula, derecha-mandíbula y superior) con resolución 480x640.
- Ejecución de tareas de manipulación de precisión, específicamente recoger y colocar piezas de tela.
- Aprendizaje por imitación: el modelo reproduce comportamientos demostrados en el dataset de entrenamiento.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso fuera del contexto robótico.

## Casos de uso

- Automatización de tareas de pick and place en entornos de fabricación textil: el modelo puede manipular piezas de tela con precisión, reduciendo la intervención manual en líneas de producción.
- Investigación en robótica de bajo coste: al ser un fine-tuning de un VLA base, sirve como punto de partida para experimentos con otros datasets o tareas similares.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede desplegar el modelo en un robot real en minutos, ideal para validar conceptos en laboratorio.
- Benchmarking de VLA en tareas de manipulación: permite comparar el rendimiento de π₀.₅ fine-tuneado frente a otras arquitecturas (ACT, Diffusion Policy) en la misma tarea.
- Educación y formación en robótica: el modelo y su pipeline de entrenamiento están documentados y son accesibles, facilitando el aprendizaje práctico de aprendizaje por imitación.
- Integración en sistemas de control de robots colaborativos: puede usarse como componente de un sistema más amplio que combine percepción, planificación y ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, GPU recomendadas o latencia.
- Dado el tamaño del modelo (4,14 mil millones de parámetros), se estima que la inferencia requiere al menos 16-24 GB de VRAM en precisión FP32, aunque no hay confirmación oficial.
- El despliegue se realiza mediante el framework LeRobot, que soporta inferencia en GPU con CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para entrenamiento, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090 o A5000), aunque no se especifica en la documentación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo es un fine-tuning específico de `pi05_base`, y no se han publicado comparaciones con alternativas como ACT o Diffusion Policy en la misma tarea. Se recomienda consultar la documentación de LeRobot para ver ejemplos de otras políticas.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (recoger tela y colocarla en un cuadrado) y no generaliza a otras tareas sin reentrenamiento.
- Requiere el robot específico `bi_so_follower` y las tres cámaras con las mismas posiciones y calibración que en el entrenamiento.
- No se han reportado evaluaciones en robot real, por lo que el rendimiento en condiciones reales es desconocido.
- El dataset de entrenamiento es pequeño (122 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posiciones o texturas.
- No se dispone de información sobre sesgos o alucinaciones, ya que no es un modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `pi05_base` y del dataset utilizado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OrderDraconis/pi05_pickplace_leo)
- [Modelo base pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Pink-Viking/pick_and_place_combined)
- [Blog de π₀.₅ de Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
