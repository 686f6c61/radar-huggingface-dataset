# Jeonminjun/omx_act_policy_test4_50k

## Resumen

`Jeonminjun/omx_act_policy_test4_50k` es una política de robótica entrenada con imitación mediante el método ACT (Action Chunking with Transformers) y publicada en Hugging Face Hub por el usuario Jeonminjun. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular del robot y tres flujos de imagen (frontal RGB, frontal de profundidad y de muñeca) y devuelve un vector de acción de 6 dimensiones. Está empaquetada en formato LeRobot, con 51.668.614 parámetros y 0,2 GB de repositorio.

El modelo se ha entrenado sobre un único conjunto de datos propio, `Jeonminjun/test_4_20260920_185331`, compuesto por 20 episodios y 20.960 fotogramas a 30 FPS, todos ellos correspondientes a una sola tarea: "Pick up Doll" (recoger un muñeco). El robot objetivo es un `omx_follower` con tres cámaras. La configuración de entrenamiento registrada es de 50.000 pasos, tamaño de lote 8, optimizador AdamW y tasa de aprendizaje 1e-05.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento y despliegue), como punto de partida para reentrenamiento en hardware `omx_follower` y como referencia para medir latencia de inferencia en control a 30 FPS. No hay resultados de evaluación publicados ni métricas de éxito en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con cuello de botella CVAE y extractor visual convolucional |
| Parámetros totales | 51.668.614 (≈51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje. Cada paso de inferencia consume un estado de 6 dimensiones y 3 imágenes de 480×640 |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos sin cuantizar en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible: la model card no indica que el modelo consuma lenguaje natural; las entradas documentadas son estado e imágenes |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de política LeRobot); repositorio de 0,2 GB |
| Biblioteca | lerobot (versión de entrenamiento registrada: 0.6.2) |
| Pipeline | robotics |
| Tipo de robot | `omx_follower` |
| Cámaras | `front` (RGB), `front_depth` (profundidad), `wrist` (RGB) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.front_depth` (1, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 20 de septiembre de 2026 (creado y actualizado el mismo día) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (action chunks) en lugar de un único paso, y que se apoya en un transformer encoder-decoder con un cuello de botella de autoencoder variacional condicional (CVAE) para modelar la variabilidad del comportamiento humano en los datos de teleoperación. El modelo está descrito en el artículo arXiv:2304.13705 (*Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*, Zhao, Kumar, Levine y Finn, RSS 2023), citado en las etiquetas del repositorio. La model card no detalla la dimensión oculta, el número de cabezas de atención, la longitud del chunk de acción ni la estrategia de ensamblado temporal empleada, por lo que esos hiperparámetros concretos no están disponibles.

Los datos de entrenamiento proceden de un único dataset propio: 20 episodios, 20.960 fotogramas a 30 FPS, una sola tarea ("Pick up Doll") y tres cámaras sincronizadas. No se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, lo cual es coherente con el paradigma de imitación supervisada de ACT. La configuración registrada es: 50.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.6.2.

## Capacidades

- Generación de acciones motoras: produce un vector de acción de 6 dimensiones a partir del estado del robot y de las tres cámaras.
- Ejecución de una única tarea de manipulación: "Pick up Doll", aprendida por imitación de demostraciones teleoperadas.
- Fusión visomotora multimodal: combina estado propioceptivo (6 valores) con dos vistas RGB y una vista de profundidad de 480×640.
- Predicción de fragmentos de acción en lugar de pasos aislados, lo que en ACT reduce el error de composición acumulado en tareas de manipulación fina.
- Generalización limitada a variaciones dentro de la distribución de las 20 demostraciones registradas (posiciones, iluminación y objetos similares a los del dataset).
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, capacidades multilingües ni cualquier otra función propia de un modelo generativo de texto.
- No dispone de modo de razonamiento explícito, visión para descripción de imágenes ni procesamiento de audio.

## Casos de uso

- Reproducción de la tarea demostrada: ejecutar `lerobot-rollout` con `--strategy.type=base`, `--robot.type=omx_follower` y `--task="Pick up Doll"` para replicar la tarea de recogida sobre el mismo tipo de robot y la misma disposición de cámaras.
- Punto de partida para reentrenamiento: usar los pesos como inicialización y afinar con un dataset propio de otra tarea sobre hardware `omx_follower`, aprovechando que el extractor visual ya está adaptado a ese montaje de tres cámaras.
- Validación de un pipeline de captura de datos: al proceder de 20 episodios y 20.960 fotogramas a 30 FPS, sirve para comprobar que la grabación, el formateo y el visionado del dataset (espacio de LeRobot en Hugging Face Spaces) funcionan de extremo a extremo antes de abordar un dataset mayor.
- Verificación de calibración de cámaras: dado que la política espera claves de observación concretas (`front`, `front_depth`, `wrist`) con resoluciones de 480×640, es útil para comprobar índices, sincronización y orientación de las tres cámaras antes de una campaña de entrenamiento.
- Medición de latencia de control: con 51,7 M de parámetros y tres imágenes de entrada por paso, permite medir si el equipo de control sostiene los 30 FPS a los que se grabaron los datos (33,3 ms por paso) con el ensamblado temporal que aplique LeRobot.
- Material docente y de prototipado: ejemplo mínimo y ligero de aprendizaje por imitación de extremo a extremo (grabar, entrenar, desplegar) para cursos o talleres de robótica con hardware de bajo coste.
- Comparación de arquitecturas de política: al ser un checkpoint ACT entrenado sobre un dataset pequeño y público, sirve como referencia para contrastar ACT frente a otras familias (por ejemplo, políticas de difusión) sobre exactamente los mismos datos y el mismo robot.
- Pruebas de agarre de objetos deformables o blandos: la tarea de recoger un muñeco es representativa de manipulaciones en las que la geometría del objeto no es rígida ni fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card incluye la sección de evaluación con la indicación textual de que no se han proporcionado resultados ("No evaluation results have been provided for this policy yet"), y no consta tasa de éxito, número de ensayos ni condiciones de evaluación en robot real o en simulación. Las búsquedas web realizadas no devolvieron información técnica relevante sobre este modelo.

## Requisitos de hardware

- Huella de pesos en memoria: 51.668.614 parámetros equivalen a aproximadamente 207 MB en fp32, 103 MB en fp16 o bf16 y 52 MB en int8 (cálculo derivado del recuento de parámetros; no confirmado por el autor).
- Entrada visual: las tres cámaras a 480×640 suman 7 canales por fotograma (3 + 1 + 3), es decir, unos 2,15 MB por paso en formato de 8 bits.
- Entrenamiento: con AdamW en fp32 hay que sumar gradientes (≈207 MB) y estado del optimizador (≈413 MB), más las activaciones de las tres imágenes por muestra con lote 8; el conjunto completo cabe holgadamente en una GPU de 8-12 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no requiere A100 ni H100. Para despliegue embarcado, una NVIDIA Jetson (Orin o similar) es una opción habitual en robótica, aunque el autor no especifica plataforma.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna (RTX serie 20/30/40, e incluso en iGPU con suficiente memoria compartida) y en CPU, dado el tamaño del modelo.
- El cuello de botella realista no es la memoria ni la capacidad de cómputo bruta, sino la latencia por paso: el dataset se grabó a 30 FPS, lo que fija un presupuesto de 33,3 ms por inferencia si se quiere mantener el mismo régimen temporal.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento) sobre PyTorch, con `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tiempo de inferencia ni de frecuencia de control alcanzada.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte de la información proporcionada, por lo que los campos cuantitativos se marcan como no disponibles y la comparación se limita a lo cualitativo.

| Modelo | Familia / enfoque | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeonminjun/omx_act_policy_test4_50k` | ACT (CVAE + transformer encoder-decoder) | 51.668.614 | Estado 6-D + 3 imágenes de 480×640 | apache-2.0 | Hugging Face Hub (LeRobot) |
| Otros checkpoints ACT publicados en LeRobot | ACT | no disponible | Estado + imágenes (varía por robot) | no disponible en esta búsqueda | Hugging Face Hub |
| Políticas de difusión (Diffusion Policy) | Difusión sobre secuencias de acción | no disponible | Estado + imágenes | no disponible en esta búsqueda | Repositorio de investigación |
| SmolVLA y otros VLA pequeños | Vision-Language-Action | no disponible | Estado + imágenes + instrucción en lenguaje | no disponible en esta búsqueda | Hugging Face Hub |

Diferencias cualitativas relevantes: ACT es más ligero y rápido de entrenar que las políticas de difusión, porque genera el chunk de acciones en un único paso hacia delante en lugar de iterar un proceso de eliminación de ruido. Frente a los modelos VLA, este checkpoint no acepta instrucciones en lenguaje natural y está atado a un robot, una tarea y una configuración de cámaras concretos, por lo que su reutilización directa fuera de ese entorno es limitada.

## Limitaciones y advertencias

- Sesgos y sobreajuste: entrenada con 20 episodios de una sola tarea ("Pick up Doll"), la política está fuertemente sesgada hacia las posiciones, la iluminación, el objeto y el entorno de esas demostraciones. Es esperable que falle ante cambios de disposición, objetos distintos o fondos nuevos.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones no verificadas fuera de la distribución de entrenamiento, con riesgo físico para el robot, el entorno y las personas presentes. Requiere parada de emergencia y límites de par/velocidad.
- Sin resultados de evaluación: no hay tasa de éxito publicada ni protocolo de evaluación reproducible, así que no es posible afirmar qué rendimiento tiene en robot real.
- Sin reproducibilidad de los datos: el dataset de entrenamiento es propio del autor; no se documenta su diversidad, método de teleoperación, ni criterios de filtrado de episodios.
- Limitaciones de idioma y de contexto: no aplica ningún procesamiento de lenguaje natural; el modelo no tiene ventana de contexto textual ni capacidad de seguir instrucciones escritas.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial y modificación, pero el usuario debe cumplir las obligaciones de atribución y conservar los avisos correspondientes. Conviene citar también el artículo de ACT y LeRobot, tal y como pide la model card.
- Dependencia de hardware y calibración: las entradas esperadas tienen formas y nombres exactos (`observation.state`, `observation.images.front`, `observation.images.front_depth`, `observation.images.wrist`); cualquier cambio de resolución, número de cámaras o índices invalida la política.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin demo en vídeo y sin historial de uso por terceros, lo que reduce la evidencia disponible sobre su comportamiento.
- Idoneidad para producción: por su alcance (una tarea, 20 episodios, sin evaluación publicada) debe tratarse como prototipo o material de investigación, no como componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeonminjun/omx_act_policy_test4_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/Jeonminjun/test_4_20260920_185331
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jeonminjun/test_4_20260920_185331
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Búsquedas web realizadas: no devolvieron enlaces relevantes sobre este modelo, su dataset o su evaluación.
