# CarolinePascal/grabette-red-cube-green-box-glannuzel-pi05-25_step10000

## Resumen

`CarolinePascal/grabette-red-cube-green-box-glannuzel-pi05-25_step10000` es un policy de robótica de tipo Vision-Language-Action (VLA) obtenido por fine-tuning del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence en LeRobot. El modelo consume una imagen de cámara y el estado de las articulaciones del robot `grabette` y produce directamente un vector de acción de 11 dimensiones; no es un modelo de lenguaje general, sino una política de imitación entrenada para una única tarea física: colocar un cubo rojo dentro de una caja verde.

El checkpoint corresponde al paso 10.000 de entrenamiento sobre un dataset local de 177 episodios y 31.496 fotogramas grabados a 30 FPS, con un batch size de 32 y learning rate de 2,5e-5. El repositorio ocupa 244,8 GB y contiene 4.143.404.816 parámetros en formato safetensors, lo que refleja que se trata del modelo completo de π₀.₅ adaptado, no de una versión destilada o cuantizada.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de fine-tuning de un VLA de gran tamaño sobre hardware asequible y como punto de partida para quien quiera replicar el flujo de LeRobot con el robot `grabette`. No hay resultados de evaluación publicados ni métricas de éxito en la model card, por lo que su rendimiento real en el mundo físico no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | grabette |
| Camaras | cam0 |
| Entrada visual | observation.images.cam0, shape (3, 360, 480) |
| Entrada de estado | observation.state, shape (2,) |
| Salida de accion | action, shape (11,) |
| Pasos de entrenamiento | 10.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2,5e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 244,8 GB |
| Descargas | 29 |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

El modelo es un VLA π₀.₅, la evolución de π₀ de Physical Intelligence orientada a generalización en entornos abiertos. La implementación concreta es la de LeRobot, adaptada del repositorio OpenPI, y se distribuye como policy de imitación con `library_name: lerobot`. La entrada combina una observación visual de resolución 360×480 con tres canales y un vector de estado de dos dimensiones; la salida es un vector de acción continuo de 11 dimensiones que el robot `grabette` ejecuta a 30 FPS. No se detalla en la información disponible la composición interna del transformer, el número de capas, la dimensionalidad oculta ni el mecanismo exacto de fusión visión-lenguaje-acción.

El entrenamiento es un fine-tuning supervisado sobre el dataset `local/red-cube-green-box-norm_graspproj`, compuesto por 177 episodios y 31.496 fotogramas a 30 FPS de la tarea "put the red cube in the green box". Se usaron 10.000 pasos con batch size 32, AdamW, learning rate 2,5e-5 y semilla 1000 sobre LeRobot 0.6.1. No se especifica en la model card si hubo RLHF, DPO, aumento de datos o alguna innovación técnica adicional más allá del propio preentrenamiento de π₀.₅.

## Capacidades

- Control robótico de imitación: genera acciones de 11 dimensiones a partir de una imagen y el estado del robot para ejecutar la tarea de recogida y colocación.
- Percepción visual monocámara: procesa una única cámara (`cam0`) a 360×480 píxeles.
- Ejecución de una tarea concreta y fija: "put the red cube in the green box".
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- Compatibilidad con el robot `grabette` y su configuración de 2 dimensiones de estado y 11 de acción.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas, código, visión general, audio ni modo thinking; el modelo está especializado en control motor.

## Casos de uso

- Reproducción de la tarea de pick-and-place: ejecutar el policy con `lerobot-rollout` sobre un `grabette` calibrado para depositar el cubo rojo en la caja verde, sirviendo como referencia de funcionamiento del pipeline completo.
- Base para fine-tuning en nuevas tareas: partir de este checkpoint o de `lerobot/pi05_base` con `lerobot-train` para entrenar variantes sobre otros datasets de manipulación, aprovechando que el flujo está documentado y es reproducible.
- Docencia y formación en VLA: usar el modelo como ejemplo tangible de policy de imitación con entradas y salidas explícitas (imagen, estado, acción) en cursos de robótica o aprendizaje por imitación.
- Benchmark interno de hardware: medir latencia y throughput de inferencia de un VLA de 4,1B parámetros en distintas GPU antes de invertir en modelos mayores.
- Validación de pipelines de datos: comprobar que un dataset propio (episodios, FPS, resolución de cámara, dimensionalidad de estado y acción) es compatible con el formato LeRobot antes de escalar el entrenamiento.
- Pruebas de robustez visual: evaluar cómo se degrada la política ante cambios de iluminación, posición del cubo o presencia de distractores, ya que la model card no reporta resultados de evaluación y estos experimentos serían el punto de partida natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita de que no se han proporcionado resultados para esta policy.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,14B parámetros en precisión completa (fp32) se necesitarían aproximadamente 16,6 GB solo para pesos, más activaciones y buffers de imagen; en bf16/fp16 bajaría a unos 8,3 GB, aunque estos cálculos son estimaciones y no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100) sería el punto de partida razonable para inferencia en precisión reducida.
- ¿Cabe en GPU consumer? No confirmado. Con cuantización a 8 bits podría ajustarse en GPU de 12-16 GB, pero no se han publicado pesos cuantizados ni requisitos oficiales.
- Opciones de despliegue: `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento, según la documentación de LeRobot. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este policy.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se especifica si el modelo alcanza esa frecuencia en inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 fine-tuned) | 4.143.404.816 | no disponible | Pick-and-place de cubo rojo en caja verde sobre `grabette` | Apache 2.0 | Hugging Face, 29 descargas |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA base para fine-tuning en tareas de manipulación | no disponible en la informacion | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible en la informacion | no disponible | VLA predecesor de π₀.₅ | no disponible en la informacion | OpenPI |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para la tarea "put the red cube in the green box" con el robot `grabette`; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real reportadas, por lo que su fiabilidad en producción es desconocida.
- Dependencia de hardware concreto: requiere un `grabette` calibrado, una cámara `cam0` con la resolución e índices correctos y un estado de 2 dimensiones; cualquier desviación invalida la política.
- Sensibilidad a condiciones visuales: al entrenarse con 177 episodios en un entorno concreto, es probable que se degrade con cambios de iluminación, fondo, posición de objetos o presencia de distractores, aunque esto no está cuantificado en la información disponible.
- Riesgo de sobreajuste al dataset: 31.496 fotogramas y 10.000 pasos de entrenamiento sobre una única tarea sugieren poca diversidad; no se documentan técnicas de aumento de datos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base `lerobot/pi05_base` y el método π₀.₅ de Physical Intelligence deben citarse y verificarse sus condiciones por separado.
- Tamaño del repositorio: 244,8 GB dificulta la descarga y el almacenamiento en entornos con recursos limitados.
- Idiomas: no aplica, pero conviene señalar que no es un modelo de lenguaje y no debe usarse para generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarolinePascal/grabette-red-cube-green-box-glannuzel-pi05-25_step10000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/local/red-cube-green-box-norm_graspproj
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/red-cube-green-box-norm_graspproj
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
