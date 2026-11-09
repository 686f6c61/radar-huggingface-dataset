# lsdyna/smolvla_orange

## Resumen

smolvla_orange es un modelo de visión-lenguaje-acción (VLA) compacto, resultado del ajuste fino de lerobot/smolvla_base sobre un conjunto de datos propio de demostraciones robóticas. Lo publica el usuario lsdyna en Hugging Face y está pensado para controlar un robot tipo `so_follower` (familia SO-100/SO-101 de bajo coste) equipado con dos cámaras (`hand` y `orbbec`). El modelo resuelve una única tarea de manipulación: entregar una naranja cuando se le da la instrucción "Give me an orange".

La relevancia de este modelo no está en su rendimiento generalista, sino en su tamaño: 450 millones de parámetros, un orden de magnitud por debajo de los VLA convencionales, lo que permite ejecutar la política en hardware de consumo. Es un ejemplo típico de flujo de trabajo de imitación con LeRobot: se parte de un modelo base preentrenado y se especializa con un dataset pequeño (17 episodios, 9290 fotogramas a 30 FPS) para una tarea concreta de laboratorio.

La arquitectura subyacente es SmolVLA, presentada en el artículo arXiv 2506.01844, que combina un codificador visual-lenguaje compacto con un decodificador de acciones. La licencia Apache 2.0 facilita su reutilización, aunque el alcance práctico del modelo está acotado al robot, las cámaras y la tarea con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset: "Give me an orange") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que procesa observaciones multimodales (estado articular de 6 dimensiones e imágenes de tres cámaras a 256x256) y emite un vector de acción de 6 dimensiones. El modelo parte de lerobot/smolvla_base, un checkpoint preentrenado de la familia SmolVLA descrita en el artículo arXiv 2506.01844, cuyo objetivo declarado es alcanzar rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo.

El ajuste fino se realizó con LeRobot 0.7.1 sobre el dataset lsdyna/GiveMeOrange: 17 episodios, 9290 fotogramas a 30 FPS, una sola tarea ("Give me an orange"). La configuración de entrenamiento fue de 4000 pasos, batch de 16, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta en la model card el número de tokens de preentrenamiento, la composición del corpus del modelo base ni si hubo etapas de RLHF o DPO; esa información correspondería al artículo de SmolVLA y no se detalla aquí.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad a partir de estado articular e imágenes.
- Percepción visual multimodal: consume tres cámaras simultáneas (`observation.images.camera1`, `camera2`, `camera3`, correspondientes a `hand` y `orbbec` según la model card).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("Give me an orange").
- Ejecución en bucle cerrado sobre robot real mediante `lerobot-rollout`.
- Especialización de una sola tarea: no es un modelo generalista de razonamiento ni de generación de texto.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni multilingüismo.

## Casos de uso

- Demostración de manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger y entregar una naranja sobre un `so_follower`, útil como banco de pruebas de bajo coste para validar pipelines de imitación antes de escalar a tareas más complejas.
- Docencia y formación en robótica: al requerir solo 17 episodios y 4000 pasos de entrenamiento, sirve como ejemplo completo del ciclo grabar-calibrar-entrenar-desplegar con LeRobot.
- Prototipado rápido de políticas VLA: permite medir latencia y viabilidad de SmolVLA en el hardware real del robot antes de invertir en datasets mayores.
- Pruebas de integración de sensórica: valida la configuración de dos cámaras (`hand`, `orbbec`) y la sincronización a 30 FPS en un robot SO-100/SO-101.
- Base para ajuste fino posterior: al derivar de `lerobot/smolvla_base` y ser Apache 2.0, puede reentrenarse con nuevos datasets manteniendo la misma interfaz de observación y acción.
- Evaluación comparativa de estrategias de imitación: sirve como referencia de línea base para comparar contra políticas entrenadas con más datos o con aumento de datos en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 millones de parámetros en safetensors (repo de 0,9 GB), la huella en FP32 ronda los 1,8 GB y en FP16 los 0,9 GB, más el coste de los codificadores visuales y del procesamiento de tres cámaras a 256x256.
- GPU recomendadas: no disponibles en la información proporcionada. El artículo de SmolVLA declara despliegue en hardware de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, aunque no se confirma en la documentación.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=lsdyna/smolvla_orange` y `--strategy.type=base`; el ecosistema LeRobot es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset y la ejecución están a 30 FPS, pero no se publica la frecuencia real de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lsdyna/smolvla_orange | 450 M | SmolVLA ajustado | Entrega de naranja con `so_follower` | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | SmolVLA base | Política VLA generalista preentrenada | no disponible en la información | Hugging Face |
| Políticas ACT de LeRobot | no disponible | Transformer de imitación | Manipulación diversa | no disponible en la información | Ecosistema LeRobot |
| OpenVLA | no disponible en la información | VLA | Manipulación generalista | no disponible en la información | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea y un único robot; no generaliza a otras instrucciones ni a otros objetos.
- Dataset muy pequeño: 17 episodios y 9290 fotogramas implican riesgo alto de sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento; un cambio de montaje o de calibración puede degradar el comportamiento.
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados, pero cabe esperar sesgo hacia las condiciones visuales y físicas del laboratorio donde se grabó el dataset.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitación, puede producir movimientos no previstos ante entradas fuera de distribución; requiere límites de seguridad en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lsdyna/smolvla_orange
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lsdyna/GiveMeOrange
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lsdyna/GiveMeOrange
