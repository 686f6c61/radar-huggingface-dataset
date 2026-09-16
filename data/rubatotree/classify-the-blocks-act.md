# rubatotree/classify-the-blocks-act

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales, y que se entrena a partir de datos de teleoperación. Este repositorio concreto, `rubatotree/classify-the-blocks-act`, es una política visomotora entrenada con LeRobot para ejecutar la tarea "classify the blocks" sobre un brazo robótico `so_follower` (familia SO-100), tomando como entrada imágenes de cámara y el estado articular del robot.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB, con pesos en formato safetensors y licencia Apache-2.0. No es un modelo de lenguaje: es una política de control robótico que consume `observation.images.front` con forma (3, 480, 640) y `observation.state` con forma (6,), y produce un vector `action` de forma (6,). Se publica bajo el pipeline `robotics` y la librería `lerobot`.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue en robot real) para una tarea de clasificación de bloques. Por otro, sus cifras de entrenamiento publicadas son extremadamente reducidas (3 pasos de optimización), lo que lo convierte en un artefacto de prueba o demostración más que en una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT), encoder-decoder con componente CVAE según el paper de referencia |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT opera sobre observaciones actuales y predice chunks de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | so_follower |
| Camaras declaradas | front, side |
| Entradas | observation.images.front: VISUAL (3, 480, 640); observation.state: STATE (6,) |
| Salidas | action: ACTION (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política sigue el método ACT descrito en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv 2304.13705), citado explícitamente en la model card. ACT combina un autocodificador variacional condicional (CVAE) con un transformer encoder-decoder: el encoder procesa la observación (imágenes y estado) y el decoder genera un chunk de acciones de longitud fija, con entrenamiento supervisado por imitación. La innovación principal del método es precisamente predecir chunks en lugar de pasos individuales, lo que reduce el error de compounding y permite altas tasas de éxito con datos de teleoperación.

Los datos de entrenamiento provienen del dataset `rubatotree/classify_the_blocks`: 120 episodios, 31.602 frames a 15 FPS y una única tarea ("classify the blocks"). Eso equivale a unos 2.106 segundos de datos teleoperados, es decir, aproximadamente 35 minutos de demostraciones, con una media de unos 17,5 segundos por episodio. No se ha publicado información sobre composición demográfica del dataset, aumento de datos, uso de RLHF o DPO, ni sobre si se aplicó decodificación especulativa o temporal ensembling en inferencia.

La configuración de entrenamiento declarada es: 3 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot versión 0.6.1. Con solo 3 pasos de optimización y un batch de 8, el modelo ha visto un máximo de 24 muestras, lo que indica claramente que se trata de un entrenamiento de prueba o de un artefacto de demostración del pipeline, no de una política convergida.

## Capacidades

- Control robótico visomotor: traduce imágenes RGB de 480x640 junto con un estado articular de 6 dimensiones en un vector de acción de 6 dimensiones para un brazo `so_follower`.
- Predicción de chunks de acción: genera secuencias cortas de acciones en lugar de pasos aislados, siguiendo el método ACT.
- Ejecución de una tarea concreta: "classify the blocks", aprendida por imitación a partir de 120 episodios teleoperados.
- Despliegue mediante CLI de LeRobot (`lerobot-rollout`) con estrategia `base` o con grabación de episodios.
- Reentrenamiento y ajuste fino mediante `lerobot-train` con `--policy.type=act`.
- Compatibilidad con flujos de visualización de datos de LeRobot (visor de datasets en Spaces).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-step en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, de audio ni de generación de texto.
- No dispone de modo "thinking" ni de ninguna capacidad cognitiva declarada.

## Casos de uso

- Clasificación de bloques en laboratorio: la política se ejecuta sobre un `so_follower` con las cámaras `front` y `side` para separar o clasificar bloques físicos; es su tarea de entrenamiento declarada y la única para la que existen datos.
- Plantilla de referencia para pipelines de imitación: sirve como ejemplo completo de extremo a extremo en LeRobot (dataset, entrenamiento, pesos en el Hub y comando de rollout), útil para equipos que quieran replicar el flujo con sus propios datos.
- Punto de partida para ajuste fino: al ser un modelo ACT de 51,7 M de parámetros y licencia Apache-2.0, puede usarse como inicialización para reentrenar con `lerobot-train` en tareas de manipulación similares.
- Docencia y robótica educativa: el tamaño reducido (0,2 GB) y los requisitos de hardware mínimos lo hacen adecuado para cursos y talleres donde se enseñe aprendizaje por imitación en robots de bajo coste.
- Validación de hardware SO-100: permite comprobar la cadena completa de teleoperación, calibración de cámaras y control articular antes de invertir en la grabación de un dataset mayor.
- Investigación en action chunking: su configuración conocida (batch, learning rate, semilla, pasos) permite reproducir experimentos controlados sobre el efecto del número de pasos de entrenamiento y del tamaño del dataset.
- Demostraciones y pruebas de integración de la CLI: útil para verificar que `lerobot-rollout` y `lerobot-train` funcionan correctamente en una máquina antes de desplegar políticas mayores.
- Clasificación de piezas en líneas de montaje simples (con reservas): conceptualmente aplicable a tareas de *pick and sort* de objetos rígidos con una sola cámara frontal, siempre que se reentrene con datos del entorno real de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la sección de evaluación vacía con la nota textual de que no se han proporcionado resultados de evaluación para esta política. No hay datos de tasas de éxito en robot real, ni comparaciones con otras políticas en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp32, los 51.668.614 parámetros ocupan aproximadamente 207 MB; con activaciones y buffers de imagen, el consumo total se mantiene por debajo de 1 GB, por lo que cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 ejecutarían la política sin cuello de botella por memoria. El modelo es pequeño incluso para iGPU o CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 4 GB de VRAM; también es viable la inferencia en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot con PyTorch (`lerobot-rollout`), con soporte de CUDA mediante `--policy.device=cuda`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje sino una política de control.
- Latencia y throughput: no disponible. La única referencia temporal es la frecuencia de grabación del dataset (15 FPS) y el hecho de que las cámaras del ejemplo de rollout se configuran a 30 FPS.
- Almacenamiento: el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

La información proporcionada solo contiene datos verificables de esta política. Se incluyen como referencia otras políticas disponibles en el ecosistema LeRobot, marcando como "no disponible" todo dato que no figure en la información consultada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rubatotree/classify-the-blocks-act (ACT) | 51.668.614 | no disponible | apache-2.0 | HuggingFace, librería lerobot | Entrenado con 3 pasos sobre 120 episodios; sin evaluación publicada |
| Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | no disponible | Método alternativo de imitación basado en difusión, citado como opción en el ecosistema LeRobot |
| SmolVLA (LeRobot) | no disponible | no disponible | no disponible | no disponible | Política visión-lenguaje-acción del ecosistema LeRobot; no comparable en tamaño con ACT |
| ACT genérico del paper 2304.13705 | no disponible | no disponible | no disponible | no disponible | Método original orientado a manipulación bimanual con hardware de bajo coste |

## Limitaciones y advertencias

- Entrenamiento insuficiente: la model card declara 3 pasos de optimización con batch size 8, lo que implica que el modelo ha visto como máximo 24 muestras. Es altamente improbable que la política haya convergido o que funcione de forma fiable en robot real.
- Dataset muy reducido: 120 episodios y 31.602 frames (unos 35 minutos de teleoperación) para una única tarea, sin variaciones declaradas de posiciones, iluminación o distractores.
- Ausencia de evaluación: no hay tasas de éxito publicadas, ni número de ensayos, ni condiciones de prueba. No se puede afirmar ningún nivel de rendimiento.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que indica que la política no ha sido reproducida ni verificada por terceros.
- Inconsistencia en la model card: la sección de detalles declara las cámaras `front` y `side`, pero la tabla de entradas solo lista `observation.images.front`. Conviene verificar qué flujo de imagen espera realmente el checkpoint antes de desplegarlo.
- Riesgo de sobreajuste al entorno: al tratarse de una política de imitación entrenada con pocos episodios, es esperable que falle ante cambios de posición de los objetos, iluminación, fondo o un robot del mismo tipo pero con calibración distinta.
- Sin capacidades de lenguaje: no debe evaluarse con métricas de LLM (MMLU, HumanEval, GSM8K) ni usarse para tareas de texto, tool calling o agentes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No se declaran restricciones adicionales.
- Advertencia para producción: no recomendable su uso directo en entornos productivos sin reentrenamiento con datos del entorno objetivo y una evaluación sistemática de tasas de éxito y modos de fallo.
- Sesgos: no hay información sobre la composición del dataset ni sobre sesgos de los datos teleoperados (por ejemplo, sesgo del operador humano en las trayectorias).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubatotree/classify-the-blocks-act
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/classify_the_blocks
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rubatotree/classify_the_blocks
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de una política: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
