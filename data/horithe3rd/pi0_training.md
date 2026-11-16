# HoriThe3rd/pi0_training

## Resumen

`HoriThe3rd/pi0_training` es un ajuste fino (fine-tuning) del modelo fundacional robótico π₀ (Pi0) de Physical Intelligence, publicado por el usuario HoriThe3rd a través de la librería LeRobot de Hugging Face. Se trata de una política visión-lenguaje-acción (VLA) generalista que recibe observaciones visuales e instrucciones en lenguaje natural y emite comandos motores de bajo nivel. En este caso concreto, el modelo ha sido especializado para una única tarea de manipulación sobre un robot SO-101: introducir un cubo verde en una taza negra.

El modelo parte de `lerobot/pi0_base` y se ha entrenado sobre un dataset propio de 50 episodios y 36.410 fotogramas a 30 FPS, con 10.000 pasos de entrenamiento, batch de 8 y una tasa de aprendizaje de 2,5e-5. El resultado es una política de imitación altamente específica, no un modelo de propósito general: hereda la arquitectura y el conocimiento previo del modelo base, pero su comportamiento queda restringido a la tarea y al montaje físico con el que se recogieron los datos.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`). Por otro, ilustra el estado actual del fine-tuning robótico de bajo coste: con 4.028 millones de parámetros y un repositorio de 8,9 GB, es viable entrenarlo y ejecutarlo en hardware de gama alta para consumidores, algo impensable hace pocos años.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ de Physical Intelligence; implementación de LeRobot adaptada de OpenPI |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, pero no se documenta cobertura multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi0_base`, la implementación en LeRobot del modelo π₀ de Physical Intelligence, cuyo código procede del repositorio OpenPI. π₀ es una política VLA que combina un codificador visual, un modelo de lenguaje que interpreta la instrucción y un decodificador de acciones que genera trayectorias motoras continuas. La model card no detalla la composición interna de bloques, el mecanismo de atención ni el esquema exacto de difusión o regresión de acciones, por lo que esos extremos deben considerarse no disponibles en la información proporcionada.

El entrenamiento se realizó con 10.000 pasos, batch size de 8, optimizador AdamW, learning rate de 2,5e-5 y semilla 1000, usando LeRobot 0.6.1. El dataset consta de 50 episodios y 36.410 fotogramas a 30 FPS sobre el robot `so_follower`, con dos cámaras (`gripper` y `top`) a 480x640 y una única instrucción: "Move the green cube into the black cup." No se documenta el uso de RLHF, DPO ni de un corpus de texto adicional; se trata de aprendizaje por imitación supervisado sobre demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (`action`) a partir de un estado de 6 dimensiones y dos vistas de cámara.
- Comprensión de instrucciones en lenguaje natural: acepta una tarea textual en el momento de la ejecución (`--task`), aunque en la práctica está especializado en una sola frase.
- Política visomotora: integra percepción visual (cámara de pinza y cámara cenital) con la predicción de acciones continuas.
- Ejecución en tiempo real a 30 FPS, coherente con la frecuencia de captura del dataset.
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documenta soporte de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger el cubo verde y depositarlo en la taza negra sobre un SO-101, útil como banco de pruebas para validar montajes y calibraciones antes de escalar a tareas más complejas.
- Reproducción de experimentos de imitación: sirve como referencia para comparar hiperparámetros (pasos, batch, learning rate) frente a otros fine-tunings sobre el mismo dataset.
- Docencia y formación en robótica: permite mostrar de extremo a extremo el ciclo de LeRobot (grabación, entrenamiento, rollout) con un modelo pequeño y una tarea acotada.
- Base para fine-tuning posterior: al derivar de `lerobot/pi0_base` y publicarse en safetensors con licencia Apache 2.0, puede reutilizarse como punto de partida para nuevas tareas con datasets propios.
- Pruebas de integración de hardware: valida cámaras, puertos y calibración del SO-101 mediante `lerobot-rollout` antes de invertir en datasets mayores.
- Evaluación de robustez visomotora: al fijar una única tarea, permite medir cómo afectan cambios de iluminación, posición de objetos o distractores a una política VLA concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.028 millones de parámetros, en fp32 los pesos ocupan aproximadamente 16 GB, en bf16 unos 8 GB y en int8 unos 4 GB, sin contar activaciones ni los codificadores visuales.
- GPU recomendadas: no disponible en la documentación; por tamaño, se requiere al menos una GPU con 16-24 GB para bf16 y se recomienda A100 o H100 para entrenamiento.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB solo con cuantización agresiva, aunque no se documenta soporte de cuantización.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=HoriThe3rd/pi0_training`; entrenamiento con `lerobot-train`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas robóticas.
- Latencia y throughput: no disponibles; el sistema opera a 30 FPS según la frecuencia del dataset, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoriThe3rd/pi0_training | 4.028 M | no disponible | Manipulación SO-101 (una tarea) | apache-2.0 | Hugging Face |
| lerobot/pi0_base | no disponible | no disponible | Política VLA generalista | no disponible en la información | Hugging Face |
| π₀ original (Physical Intelligence) | no disponible | no disponible | Política VLA generalista multi-robot | no disponible en la información | Blog y OpenPI |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado con una sola instrucción y 50 episodios, no generaliza a otras tareas, objetos ni disposiciones sin reentrenamiento.
- Dependencia del montaje: asume robot `so_follower`, cámaras `gripper` y `top` a 480x640 y 30 FPS; cambios de cámara, resolución o calibración degradan el comportamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad.
- Riesgo de sobreajuste: 10.000 pasos con batch 8 sobre 36.410 fotogramas puede producir memorización de posiciones y apariencias del dataset.
- Sesgos: no documentados, pero inherentes a un dataset reducido de un único entorno, iluminación y operador.
- Alucinación motora: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante situaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi0_base` y el modelo π₀ original deben verificarse por separado antes de producción.
- Idiomas: no se documenta cobertura multilingüe de las instrucciones; la tarea de entrenamiento está en inglés.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoriThe3rd/pi0_training
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HoriThe3rd/SO101-simple-pnp_20260818_151444
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HoriThe3rd/SO101-simple-pnp_20260818_151444
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Guía de LeRobot para pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de imitación en robots: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
