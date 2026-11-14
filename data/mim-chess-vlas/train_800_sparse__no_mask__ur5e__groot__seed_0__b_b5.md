# mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__b_b5

## Resumen

El modelo `train_800_sparse__no_mask__ur5e__groot__seed_0__b_b5` es una política de imitación robótica publicada por el usuario mim-chess-vlas en Hugging Face, entrenada con la librería LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA. No se trata de un modelo de lenguaje generalista, sino de un modelo visión-lenguaje-acción (VLA) especializado en una tarea concreta de manipulación: recoger objetos y depositarlos en una caja con un brazo robótico UR5e. El identificador del repositorio codifica la configuración del experimento: 800 episodios de entrenamiento, muestreo disperso (sparse), sin máscara, robot UR5e, arquitectura GR00T y semilla 0.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de fine-tuning de GR00T N1.7 sobre un dataset reducido de demostraciones teleoperadas, lo que resulta útil para quien quiera replicar el flujo de trabajo de LeRobot con robots industriales tipo UR5e. Por otro, permite evaluar el coste computacional y de almacenamiento de una política de este tipo: 3.144 millones de parámetros y un repositorio de 50,3 GB, con pesos en safetensors.

El modelo consume tres cámaras (una vista de agente y dos cámaras en la muñeca del robot) más el estado propioceptivo de 9 dimensiones, y produce un vector de acción de 7 dimensiones. Está entrenado sobre 739 episodios y 182.078 fotogramas a 20 FPS, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow-matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de control robótico; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de cámara y la instrucción de tarea en lenguaje natural, acoplado a un transformer de acciones entrenado con flow-matching que predice las acciones condicionadas por visión, lenguaje y propiocepción. Esta separación permite reutilizar un modelo visión-lenguaje preentrenado a gran escala y especializar únicamente el cabezal de acciones sobre datos de robot, lo que reduce la cantidad de demostraciones necesarias frente a entrenar un VLA desde cero.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_sparse__no_mask__ur5e`, compuesto por 739 episodios y 182.078 fotogramas capturados a 20 FPS con un UR5e y tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). La configuración reportada es de 60.000 pasos, batch size 16, optimizador AdamW, learning rate 7e-05 y semilla 0. El dataset cubre 40 instrucciones de tarea del tipo "Pick the X and place it into the box", con objetos domésticos variados (alimentos, utensilios, menaje). No se documenta en la información disponible el número de tokens de entrenamiento del backbone ni si hubo etapas de RLHF o DPO; al tratarse de aprendizaje por imitación supervisado, lo habitual es que no las haya.

## Capacidades

- Control robótico de manipulación: predice acciones de 7 dimensiones (típicamente 6 grados de libertad más pinza) para un brazo UR5e a partir de observaciones visuales y propioceptivas.
- Seguimiento de instrucciones en lenguaje natural: acepta tareas del estilo "Pick the jam and place it into the box" y las ejecuta sobre el objeto correspondiente.
- Percepción multivista: integra tres flujos de imagen simultáneos (vista global y dos cámaras en la muñeca) para localizar y agarrar objetos.
- Condicionamiento por propiocepción: utiliza un vector de estado de 9 dimensiones como entrada adicional.
- Generalización dentro de la distribución del dataset: cubre 40 categorías de objetos domésticos distintos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explícito, modo thinking, visión genérica, audio ni capacidades multilingües más allá de las instrucciones en inglés del dataset.

## Casos de uso

- Automatización de picking and placing en laboratorio: el modelo ejecuta la tarea de recoger un objeto y dejarlo en una caja con un UR5e, lo que permite montar una celda de manipulación reproducible con hardware comercial y un solo comando `lerobot-rollout`.
- Investigación en aprendizaje por imitación: sirve como referencia de fine-tuning de GR00T N1.7 sobre un dataset pequeño (739 episodios), útil para estudiar el efecto del número de demostraciones y del muestreo sparse en el rendimiento final.
- Benchmark de VLAs sobre robots industriales: al estar entrenado específicamente para UR5e, permite comparar políticas GR00T contra otros enfoques (ACT, Diffusion Policy, π0) sobre el mismo robot y dataset.
- Prototipado de celdas logísticas: la tarea de clasificar objetos en una caja es análoga a operaciones de bin picking y consolidación de pedidos, por lo que el modelo puede servir de base para pilotos en entornos controlados.
- Docencia y formación en robótica: el flujo completo de LeRobot (grabación, entrenamiento, despliegue) con un modelo preentrenado disponible facilita prácticas de laboratorio sin necesidad de entrenar desde cero.
- Evaluación de robustez ante variación de objetos: las 40 categorías de objetos del dataset permiten medir la generalización del modelo a formas, tamaños y materiales distintos dentro de la misma tarea.
- Reutilización como inicialización: los pesos pueden servir de punto de partida para fine-tuning en tareas de manipulación relacionadas con el mismo robot, reduciendo el coste frente a entrenar un GR00T desde el checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.144 millones de parámetros, en precisión completa (FP32) se necesitan aproximadamente 12,6 GB solo para los pesos, más memoria para activaciones y los tres flujos de imagen; en BF16/FP16 el peso ronda los 6,3 GB. No se dispone de cifras oficiales de memoria total en la información proporcionada.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una GPU con al menos 16-24 GB de VRAM (RTX 4090, L40S, A100) es un punto de partida razonable para inferencia en BF16, aunque no está confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 24 GB (RTX 3090/4090) en BF16, siempre que el resto del pipeline (cámaras, preprocesado) no consuma memoria adicional significativa; no confirmado.
- Opciones de despliegue: LeRobot con el comando `lerobot-rollout` y la política `--policy.path=mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__b_b5`; el soporte de vLLM, llama.cpp, Ollama o TGI no está documentado para esta política.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a la frecuencia del bucle de la política; el dataset se grabó a 20 FPS, pero no se especifica la frecuencia de inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned, UR5e) | 3.144 M | VLA para manipulación | no aplica | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | VLA fundacional cross-embodiment | no aplica | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas de imitación tipo ACT / Diffusion Policy (LeRobot) | típicamente decenas de millones | Políticas específicas por tarea | no aplica | Apache 2.0 en LeRobot | Hugging Face, LeRobot |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada. La diferencia principal frente a ACT o Diffusion Policy es el uso de un backbone visión-lenguaje preentrenado, que aporta condicionamiento por instrucción en lenguaje natural y mayor capacidad de generalización, a cambio de un tamaño de modelo dos órdenes de magnitud superior.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado únicamente para la tarea "Pick the X and place it into the box" con un UR5e y un conjunto concreto de cámaras; no se espera que funcione con otro robot, otra disposición de cámaras u otras tareas sin fine-tuning.
- Dependencia del entorno: cambios en iluminación, fondo, posición de la caja o del objeto pueden degradar el rendimiento; no se documentan evaluaciones de robustez fuera de la distribución del dataset.
- Dataset pequeño: 739 episodios y 182.078 fotogramas es un volumen modesto para un VLA de 3.144 millones de parámetros, lo que aumenta el riesgo de sobreajuste a los objetos y posiciones vistos.
- Idiomas: las instrucciones de tarea del dataset están en inglés; no hay evidencia de soporte multilingüe.
- Sesgos: no se documentan análisis de sesgo; al tratarse de un modelo robótico, el riesgo se traslada a la selección de objetos y a las condiciones del entorno de entrenamiento.
- Alucinación: en un VLA el fallo se manifiesta como acciones incorrectas o intentos de agarre sobre objetos inexistentes, no como texto inventado; no se han publicado métricas de tasa de fallo.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad de validar la seguridad del despliegue físico recae en el integrador.
- Producción: no hay datos publicados de latencia, throughput ni fiabilidad en tiempo real, por lo que un despliegue en producción requeriría una validación propia.
- El repositorio ocupa 50,3 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__no_mask__ur5e__groot__seed_0__b_b5
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__no_mask__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__no_mask__ur5e
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
