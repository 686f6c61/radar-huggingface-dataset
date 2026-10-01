# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_40_Exec_40_TASK_pick_place_can_PIXELS_84

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y permite ejecutar maniobras más suaves y coherentes. Este repositorio concreto, publicado por el usuario `castanetnicolas`, contiene una política entrenada con LeRobot para un brazo robótico Universal Robots UR5e en la tarea "Pick up the can and place it in the correct bin." ("Coge la lata y colócala en el contenedor correcto").

El modelo tiene 51.611.271 parámetros (unos 51,6 millones) y consume observaciones multimodales: el estado del robot (vector de 9 dimensiones) y dos cámaras RGB de 84x84 píxeles con 3 canales cada una. Produce como salida un vector de acción de 7 dimensiones, típico de un manipulador de 6 grados de libertad más pinza. Se distribuye en formato `safetensors` bajo licencia Apache 2.0 y se ejecuta con la librería LeRobot.

Se trata de un modelo de robótica de nicho, con 0 descargas y 0 *likes* en el momento de la consulta, y sin resultados de evaluación publicados. Su interés es principalmente práctico y reproducible: demuestra el flujo completo de LeRobot para grabar un *dataset* teleoperado, entrenar una política ACT y desplegarla en un robot real con un único comando de CLI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de visión y decoder de acciones sobre espacio latente tipo CVAE (según el paper arXiv:2304.13705) |
| Parametros totales | 51.611.271 (51,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la condición es la observación actual más el estado latente de la política) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible; la política no procesa lenguaje natural, solo observaciones de estado y píxeles. La cadena de tarea usada en el entrenamiento está en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Robot objetivo | ur5e (Universal Robots UR5e) |
| Cámaras | camera1, camera2 |
| Entrada `observation.state` | STATE, forma (9,) |
| Entrada `observation.images.camera1` | VISUAL, forma (3, 84, 84) |
| Entrada `observation.images.camera2` | VISUAL, forma (3, 84, 84) |
| Salida `action` | ACTION, forma (7,) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-30 |

## Arquitectura y entrenamiento

La política sigue el método ACT descrito en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705), citado en la propia model card. ACT es un esquema de aprendizaje por imitación (behavior cloning) que, en lugar de regresar una única acción por paso, predice un *chunk* de acciones futuras; en este caso, el nombre del repositorio indica `Act_Chunk_40_Exec_40`, es decir, un horizonte de predicción de 40 acciones del que se ejecutan 40 antes de volver a inferir. El método incorpora un componente de autoencoder variacional condicional (CVAE) para modelar la variabilidad de las demostraciones humanas, junto con un encoder que procesa las observaciones (estado proprioceptivo e imágenes) y un decoder transformer que genera la secuencia de acciones. En la implementación de LeRobot, las imágenes de 84x84 se procesan con un backbone de visión convolucional y se fusionan con el vector de estado antes de entrar en el transformer.

El entrenamiento se realizó sobre el dataset `castanetnicolas/UR5e_CAN_100_absolute_OSC_POS_SIZE_84`, compuesto por 100 episodios teleoperados, 13.120 fotogramas a 20 FPS, con una única tarea: coger una lata y depositarla en el contenedor correcto. La configuración declarada es de 100.000 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se especifica en la información disponible si se aplicaron fases de RLHF, DPO u otro tipo de ajuste posterior; en ACT el entrenamiento es puramente supervisado sobre demostraciones.

## Capacidades

- Generación de acciones de control continuo para un manipulador UR5e: devuelve un vector de 7 dimensiones por paso de inferencia.
- Ejecución de *action chunking*: predice bloques de 40 acciones, lo que mejora la coherencia temporal frente a políticas paso a paso.
- Percepción visual multimodal: consume simultáneamente dos flujos de imagen RGB de 84x84 píxeles.
- Fusión de visión y propriocepción: combina las imágenes con un vector de estado de 9 dimensiones.
- Ejecución de una tarea concreta de *pick and place*: "Pick up the can and place it in the correct bin."
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-rollout`.
- No dispone de *tool calling*, *function calling*, capacidades de agente, razonamiento multi-paso simbólico ni procesamiento de lenguaje natural; no es un modelo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Automatización de *pick and place* en línea de montaje: la política puede coger latas u objetos cilíndricos similares y depositarlos en un contenedor, reduciendo la programación manual de trayectorias en el UR5e.
- Base para *fine-tuning* en tareas de clasificación de residuos: partiendo de este *checkpoint* y grabando nuevos episodios con LeRobot, se puede adaptar la política a distintos contenedores o materiales.
- Banco de pruebas para investigación en aprendizaje por imitación: sirve como referencia reproducible de ACT sobre un UR5e con dos cámaras y 100 episodios, útil para comparar hiperparámetros o variantes de *chunk size*.
- Validación de *pipelines* de robótica en simulación o gemelo digital: al ser un modelo pequeño (51,6 M de parámetros), es viable ejecutarlo en bucle cerrado dentro de entornos simulados para estudiar robustez ante cambios de iluminación o posición.
- Docencia y formación en robótica: el flujo `lerobot-rollout` con `--strategy.type=base` permite demostrar en vivo una política entrenada sin necesidad de anotar episodios.
- Prototipado rápido de células robotizadas: al ocupar 0,2 GB y requerir solo dos cámaras y un UR5e, el coste de integración inicial es bajo frente a soluciones de programación explícita.
- Generación de datos sintéticos de evaluación: ejecutando la política de forma indefinida (omitiendo `--duration`) se pueden recopilar trayectorias para analizar el comportamiento del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación, distractores) documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 206 MB y en fp16 unos 103 MB. Sumando activaciones y *buffers* de los dos encoders de imagen, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para hardware de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU o en CPU, dado el reducido tamaño. También es candidato natural para NVIDIA Jetson (Orin Nano, Orin NX, AGX Orin) en despliegue embarcado sobre el robot.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch es la vía documentada por el autor. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de robótica.
- Latencia y throughput: no disponibles de forma explícita. Como referencia de contexto, el dataset se grabó a 20 FPS y el *chunk* de 40 acciones a 20 FPS implicaría una nueva inferencia cada 2 segundos si se ejecuta el *chunk* completo.
- Almacenamiento: el repositorio ocupa 0,2 GB, por lo que el despliegue no requiere infraestructura de almacenamiento relevante.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_UR5e_BS_32_Act_Chunk_40_Exec_40 (este modelo) | ACT sobre UR5e, tarea pick and place | 51,6 M | chunk 40, exec 40, 2 cámaras 84x84 | apache-2.0 | HuggingFace, vía LeRobot |
| Diffusion Policy (Chi et al.) | Política de difusión para manipulación | no disponible | no disponible | no disponible | Implementación disponible en LeRobot; *checkpoints* concretos no disponibles en la información proporcionada |
| SmolVLA (HuggingFace) | VLA ligero para robótica | no disponible | no disponible | no disponible | Disponible en el ecosistema LeRobot; datos concretos no disponibles en la información proporcionada |
| Otras políticas ACT del Hub de LeRobot | ACT para distintos robots y datasets | variable | variable | habitualmente apache-2.0 | HuggingFace; datos concretos no disponibles en la información proporcionada |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada, ya que este modelo no publica evaluación y las alternativas citadas no se han consultado con cifras verificables en esta búsqueda.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito en robot real, ni número de ensayos, ni descripción de condiciones. No se puede afirmar que la política funcione de forma fiable sin validarla.
- Especialización extrema: está entrenada para una única tarea ("coger la lata y colocarla en el contenedor correcto") sobre un UR5e concreto. Cambiar el objeto, el contenedor, la iluminación o la cinemática del robot degradará el rendimiento.
- Dependencia de la configuración de cámaras: las observaciones esperadas son exactamente `camera1` y `camera2` a 84x84 píxeles. Los nombres e índices de cámara deben coincidir con los del entrenamiento; cualquier desviación invalida la política.
- Sesgos y sobreajuste a las demostraciones: al ser behavior cloning sobre 100 episodios y 13.120 fotogramas de un único operador, la política hereda las trayectorias, velocidades y posibles sesgos posicionales del teleoperador.
- Riesgo de fallo silencioso: una política de imitación puede producir acciones plausibles pero incorrectas ante situaciones fuera de distribución, sin señal de incertidumbre ni mecanismo de rechazo.
- Idiomas: no aplica; el prompt de tarea es una cadena en inglés y no existe procesamiento multilingüe.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, siempre que se conserve el aviso de licencia y la atribución. Se recomienda citar también LeRobot y el paper de ACT.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta, sin *issues* ni comunidad asociada. Es un artefacto de investigación, no un componente validado para producción.
- Fechas del repositorio: la fecha de creación indicada (2026-09-30) es posterior a la fecha de consulta disponible en los datos, lo que conviene verificar antes de referenciarlo.
- Despliegue: no se documentan requisitos de seguridad física, paradas de emergencia ni límites de par del UR5e; cualquier uso real debe integrarse con las salvaguardas del controlador del robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_40_Exec_40_TASK_pick_place_can_PIXELS_84
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_CAN_100_absolute_OSC_POS_SIZE_84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/UR5e_CAN_100_absolute_OSC_POS_SIZE_84
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la búsqueda web: los resultados devueltos corresponden a WikiMasters, un juego de cartas en línea basado en Wikipedia (wiki-masters.com, jvflux.fr, ouest-france.fr, echoesofgeeks.fr). No guardan ninguna relación con este modelo ni aportan información adicional sobre ACT, el UR5e o LeRobot, por lo que se descartan.
