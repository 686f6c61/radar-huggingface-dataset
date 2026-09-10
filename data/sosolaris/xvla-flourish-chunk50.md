# SoSolaris/xvla-flourish-chunk50

## Resumen

SoSolaris/xvla-flourish-chunk50 es una política robótica de tipo Vision-Language-Action (VLA) publicada en HuggingFace, obtenida por fine-tuning de lerobot/xvla-base, el modelo base del marco X-VLA. El autor es el usuario SoSolaris y el modelo está pensado para ejecutarse con la librería LeRobot sobre un brazo robótico SO-101 (tipo `so101_follower`) equipado con dos cámaras. No es un modelo de lenguaje: es una política de imitación que consume imágenes y estado de las articulaciones y produce comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación, "Grab the tape", aprendida a partir del dataset MrC4t/FlourishGrabTape (20 episodios, 7.071 fotogramas a 15 FPS). Se trata, por tanto, de un caso de fine-tuning de un único task sobre una base preentrenada multi-robot, con 20.000 pasos de entrenamiento, batch de 16 y learning rate de 1e-4.

Su relevancia es fundamentalmente práctica y de nicho: demuestra el flujo completo de LeRobot para adaptar una base VLA de ~880 millones de parámetros a hardware de bajo coste. No obstante, es un modelo recién publicado, con 0 descargas y 0 "likes", sin resultados de evaluación en robot real y sin benchmarks, por lo que debe tratarse como material experimental y no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en transformer con soft prompts y flow matching (marco X-VLA) |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (política VLA; la entrada son imágenes y estado, no una ventana de tokens declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la política recibe una instrucción de tarea en inglés, p. ej. "Grab the tape") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 1,8 GB) |
| Libreria / pipeline | lerobot / robotics |
| Modelo base | lerobot/xvla-base (fine-tuning) |
| Robot objetivo | so101_follower, camaras "right" y "up" |
| Entradas | observation.images.image (3, 256, 256); observation.images.image2 (3, 256, 256); observation.images.image3 (3, 224, 224); observation.state (8,) |
| Salidas | action (6,) |
| Dataset de fine-tuning | MrC4t/FlourishGrabTape (20 episodios, 7.071 fotogramas, 15 FPS) |
| Pasos de entrenamiento | 20.000 (batch 16, optimizador xvla-adamw, lr 0,0001, semilla 1000, LeRobot 0.6.2) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-10 (alta), 2026-09-10 (ultima actualizacion) |

## Arquitectura y entrenamiento

X-VLA, el marco descrito en el paper arXiv:2510.10274, se presenta como un framework Vision-Language-Action "soft-prompted" con flow matching. La idea central es tratar cada robot o configuración de hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles, de modo que un único modelo pueda reconciliar morfologías, sensores y espacios de acción distintos. El modelo card del repositorio incluye un diagrama de arquitectura enlazado desde las imágenes de documentación de HuggingFace, pero no detalla el backbone concreto, el número de tokens de entrenamiento ni la composición del dataset de preentrenamiento de la base.

Este repositorio concreto es un fine-tuning sobre lerobot/xvla-base con 20.000 pasos, batch de 16, optimizador `xvla-adamw`, learning rate 1e-4 y semilla 1000, ejecutado con LeRobot 0.6.2. El conjunto de datos de adaptación contiene únicamente 20 episodios (7.071 fotogramas a 15 FPS) de la tarea "Grab the tape". No se documenta en la información disponible si hubo RLHF, DPO ni ninguna etapa de refinamiento posterior; tampoco se especifica el método de cuantización, el tamaño de chunk de acciones ni la estrategia de decodificación, aunque el sufijo "chunk50" del nombre del repositorio sugiere un tamaño de chunk de 50 acciones (dato no confirmado en la model card).

## Capacidades

- Generación de acciones de manipulación: produce un vector de acción continuo de 6 dimensiones a partir de dos o tres imágenes y un estado de 8 dimensiones.
- Condicionamiento por instrucción de tarea en lenguaje natural: acepta un `--task` textual (por ejemplo, "Grab the tape") como parte de la política.
- Aprendizaje por imitación: reproduce la tarea demostrada en el dataset FlourishGrabTape.
- Fusión multimodal: combina tres flujos visuales (dos a 256x256 y uno a 224x224) con el estado del robot.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` con la estrategia `base` y se puede reentrenar con `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, thinking mode, audio ni visión generalista fuera del bucle de control. Cualquier otra capacidad no está documentada.

## Casos de uso

- Automatización de pick-and-place de precisión en banco de pruebas: la política ejecuta la tarea "Grab the tape" sobre un SO-101 con dos cámaras, útil para validar la repetibilidad de una pinza y una cinemática concretas antes de escalar a otras piezas.
- Investigación en aprendizaje por imitación: sirve como caso de estudio reproducible de fine-tuning de una base VLA en LeRobot con solo 20 episodios, útil para medir cuánto generaliza una política con tan pocos datos.
- Banco de comparación de recetas de entrenamiento: modificando pasos, batch y learning rate sobre el mismo dataset, se puede evaluar el impacto en la tasa de éxito en robot real.
- Docencia y prototipado en robótica de bajo coste: el SO-101 y LeRobot permiten montar un laboratorio de manipulación con hardware asequible, usando este checkpoint como punto de partida ya entrenado.
- Recolección de datos asistida: ejecutar la política con `--strategy.type=base` durante una sesión de teleoperación o de grabación para comparar trayectorias humanas frente a las generadas.
- Pruebas de integración de pipeline: verificar la cadena completa de percepción (nombres de cámara, índices, FPS, resolución) y de control (frecuencia de 15-30 Hz) antes de invertir en un fine-tuning propio.
- Referencia de adaptación cross-embodiment: al partir de xvla-base, permite experimentar con el mecanismo de soft prompts para trasladar la política a otro brazo de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", con la sección de evaluación vacía (sin tabla de tareas, ensayos, éxitos ni tasa de éxito). Tampoco se proporcionan métricas de pérdida de entrenamiento, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 879.687.256 parámetros, sin datos medidos por el autor): ~1,8 GB en BF16/FP16 solo para pesos y ~3,5 GB en FP32.
- Sumando buffers de imagen (tres resoluciones, dos de ellas a 256x256), activaciones y estado, se puede estimar un consumo real de aproximadamente 4-6 GB en BF16; cifra no verificada por el autor.
- GPU recomendadas para inferencia: cualquier GPU con 8 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. También es viable en A100, H100 o L40S si se comparte con otras cargas.
- Cabe en GPU de consumo: sí, previsiblemente en modelos de 8-12 GB o superiores, aunque el despliegue en CPU es posible pero difícilmente sostenible a la frecuencia de control requerida.
- Fine-tuning: con batch de 16 e imágenes a 256x256, se estima una necesidad de 16-24 GB de VRAM; encajan RTX 3090/4090 (24 GB), L40S (48 GB) y A100 (40/80 GB).
- Opciones de despliegue: LeRobot mediante `lerobot-rollout --strategy.type=base --policy.path=SoSolaris/xvla-flourish-chunk50`, con PyTorch y CUDA. No es aplicable a vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de generación de texto.
- Latencia y throughput: no disponibles. El dataset se grabó a 15 FPS y el ejemplo de rollout lanza las cámaras a 30 FPS, por lo que el lazo de control necesita sostener al menos 15 Hz en el robot real; no se publica ninguna medición de tiempo de inferencia.

## Comparativa con modelos similares

Los datos de la siguiente tabla para modelos distintos de este repositorio provienen de referencias públicas y no han podido verificarse con la búsqueda web proporcionada, que no devolvió resultados relevantes.

| Modelo | Desarrollador | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-flourish-chunk50 | SoSolaris (fine-tuning de lerobot/xvla-base) | 879.687.256 | VLA con soft prompts y flow matching | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/xvla-base | Autores de X-VLA / LeRobot | No disponible | VLA base multi-robot | No disponible | HuggingFace |
| SmolVLA | Hugging Face | ~450 M (referencia publica) | VLA compacta | Apache 2.0 (referencia publica) | HuggingFace |
| pi0 | Physical Intelligence | ~3.300 M (referencia publica) | VLA con flow matching | Apache 2.0 (referencia publica) | HuggingFace |
| OpenVLA | Consorcio academico (Stanford, UC Berkeley y otros) | ~7.000 M (referencia publica) | VLA sobre LLM | No disponible | HuggingFace |

Como referencia interna, este checkpoint es aproximadamente la mitad en parámetros que pi0 y ocho veces menor que OpenVLA, lo que lo sitúa en el segmento de políticas ligeras aptas para GPU de consumo.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Grab the tape") con 20 episodios y 7.071 fotogramas: la generalización a posiciones, iluminación, objetos o distractores distintos es previsiblemente muy limitada.
- Sin resultados de evaluación: no hay ninguna tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad incluso en la tarea objetivo.
- Riesgo de sobreajuste: 20.000 pasos con batch 16 sobre 7.071 fotogramas implica múltiples épocas sobre los mismos datos.
- Dependencia estricta del hardware: requiere un `so101_follower` y cámaras cuyos nombres coincidan con las claves de observación del entrenamiento (`observation.images.image`, `image2`, `image3`); cambiar la disposición o el número de cámaras invalida la política.
- Sin datos de sesgos, robustez, alucinación ni comportamiento fuera de distribución; en robótica, un fallo se traduce en movimientos físicos incorrectos, no en texto erróneo.
- Limitaciones de idioma: no hay especificación de idiomas soportados; la instrucción de tarea del ejemplo está en inglés.
- Licencia Apache 2.0 en el modelo, lo que permite uso comercial, pero la licencia del dataset MrC4t/FlourishGrabTape y del modelo base deben verificarse por separado antes de un uso en producción.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, y fechas de publicación/actualización de 2026-09-10 con apenas 44 segundos de diferencia entre alta y última modificación.
- No apto para operación desatendida sin barreras de seguridad físicas y sin un operador que supervise el brazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoSolaris/xvla-flourish-chunk50
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de fine-tuning: https://huggingface.co/datasets/MrC4t/FlourishGrabTape
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/FlourishGrabTape
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Diagrama de arquitectura: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot/xvla-architecture.png
- Busqueda web: no se encontraron resultados relevantes sobre este modelo; los enlaces devueltos correspondian a foros de soporte de Microsoft ajenos al tema.
