# mim-chess-vlas/train_800_sparse__mask__blackout__sim__all_cameras__live__groot__seed_0

## Resumen

El modelo `train_800_sparse__mask__blackout__sim__all_cameras__live__groot__seed_0` es una política robótica de imitación (visuomotor policy) entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA. No es un modelo de lenguaje generalista, sino un modelo fundacional para robótica humanoide y manipulación que predice acciones motoras condicionadas por visión, lenguaje y propiocepción. Lo publica el usuario `mim-chess-vlas` como artefacto de entrenamiento reproducible (semilla 0) sobre un dataset propio de tareas de recogida y colocación.

La arquitectura combina un backbone vision-language Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching. El modelo tiene aproximadamente 3.144 millones de parámetros (dato extraído de los pesos en safetensors) y un repositorio de 12,6 GB. El contexto de texto no es aplicable en el sentido habitual de un LLM, ya que se trata de un modelo de política que consume observaciones multimodales en cada paso de control.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de políticas robóticas con modelos fundacionales abiertos: un dataset de demostraciones teleoperadas, un backbone VLM preentrenado y una cabeza de acciones con flow matching, todo empaquetado en LeRobot para poder replicarse y desplegarse con la CLI estándar. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de política por paso, no LLM de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional cross-embodiment para razonamiento y habilidades de robots humanoides. La arquitectura se compone de un backbone vision-language (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de cámara y la instrucción en lenguaje natural, y de un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. La política concreta de este repositorio está especializada en un robot `Panda` con nueve dimensiones de estado y tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a resolución 224x224, y produce un vector de acción de siete dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_sparse__mask__blackout__sim__all_cameras__live`, compuesto por 787 episodios y 195.184 fotogramas a 20 FPS. La configuración reportada es de 60.000 pasos, batch size 16, optimizador AdamW con learning rate 7e-05 y semilla 0. Las tareas del dataset son instrucciones del tipo "Pick the X and place it into the box" para 40 objetos distintos (jam, cereal, pear, sweet potato, scone, apple, etc.), lo que indica un entrenamiento multiobjeto de manipulación pick-and-place. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de imitación supervisada.

## Capacidades

- Manipulación robótica pick-and-place condicionada por instrucción en lenguaje natural.
- Percepción visual multi-cámara: tres vistas simultáneas (vista del agente y dos cámaras en la muñeca).
- Fusión de propiocepción (estado de 9 dimensiones) con visión y lenguaje para predecir acciones de 7 dimensiones.
- Generalización a 40 categorías de objetos distintos dentro de la misma tarea de recogida y colocación.
- Ejecución de políticas en tiempo real a la frecuencia del dataset (20 FPS) mediante la CLI de LeRobot.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de audio.
- Capacidades multilingües: no documentadas; las instrucciones del dataset están en inglés.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política puede ejecutarse sobre un robot Panda para recoger objetos cotidianos y depositarlos en una caja, usando las tres cámaras como entrada y la instrucción textual para seleccionar el objeto objetivo.
- Base para fine-tuning con nuevos objetos: al ser una política GR00T entrenada con LeRobot, sirve como punto de partida para añadir clases de objetos no presentes en el dataset original mediante demostraciones adicionales.
- Investigación en aprendizaje por imitación: el repositorio incluye semilla, hiperparámetros y dataset, lo que permite reproducir el entrenamiento y estudiar la variabilidad entre ejecuciones.
- Evaluación de modelos fundacionales robóticos: útil para comparar el rendimiento de GR00T N1.7 frente a otras políticas (ACT, Diffusion Policy, π0) en el mismo conjunto de tareas.
- Generación de datos sintéticos y simulación: la política puede desplegarse en entornos simulados compatibles con LeRobot para generar trayectorias adicionales o validar robustez antes del despliegue físico.
- Demostraciones educativas de VLA: sirve para ilustrar el pipeline completo de un modelo visión-lenguaje-acción, desde la grabación de demostraciones hasta el rollout en hardware real.
- Prototipado de asistentes domésticos de manipulación: con un robot de sobremesa y las cámaras adecuadas, puede integrarse en demostraciones de recogida de alimentos u objetos de cocina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 6-7 GB solo para los pesos de 3.144 millones de parámetros, más el overhead del backbone VLM y de las activaciones; en la práctica se recomienda reservar al menos 12-16 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción con baja latencia; RTX 4090 o RTX 6000 Ada para desarrollo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 8-12 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que es el método documentado; no se indica soporte explícito de vLLM, TGI, llama.cpp u Ollama (no aplicables a una política de acciones).
- Latencia y throughput: no disponibles; el dataset está grabado a 20 FPS, lo que sugiere que la política debe operar en el orden de decenas de milisegundos por paso para control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (GR00T N1.7, política Panda) | 3.144 M | 3 cámaras 224x224 + estado 9D + instrucción; salida 7D | Apache 2.0 | HuggingFace, vía LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | Backbone VLM + flow matching, cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot tipo ACT / Diffusion Policy | típicamente decenas de millones | Visión + estado; sin backbone VLM | Apache 2.0 en LeRobot | HuggingFace, vía LeRobot |
| π0 (Physical Intelligence) | no disponible en la información | VLM + flow matching, multi-robot | no disponible en la información | no disponible en la información |

La comparación cuantitativa con alternativas no puede realizarse porque el autor no publica métricas de éxito ni comparaciones directas.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para tareas pick-and-place sobre un robot Panda con una configuración concreta de tres cámaras; no es un modelo generalista.
- Dependencia del entorno: los resultados pueden degradarse fuera de la distribución del dataset (iluminación, disposición de objetos, fondo, tipo de robot).
- Riesgo de sobreajuste al dataset de 787 episodios y 40 objetos; la generalización a objetos no vistos no está validada.
- No hay benchmarks publicados, por lo que no se puede afirmar su calidad relativa frente a otras políticas.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados, pero al derivar de un backbone VLM pueden heredarse sesgos visuales y semánticos del preentrenamiento.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: cualquier despliegue físico requiere límites de par, paradas de emergencia y supervisión humana.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T y sus dependencias (Cosmos-Reason2/Qwen3-VL) pueden tener condiciones adicionales que conviene revisar antes de producción.
- Repositorio con pocas descargas (17) y sin likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask__blackout__sim__all_cameras__live__groot__seed_0
- Dataset: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__blackout__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__blackout__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
