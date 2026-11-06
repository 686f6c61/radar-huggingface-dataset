# mysterium99/smolvla_stage2c_complexity_2_to_ds1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_2_to_ds1`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds1`, orientado a una única tarea manipulativa: recoger hardware de un operario humano y depositarlo en una zona delimitada con cinta.

El modelo parte de la arquitectura SmolVLA presentada en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones (action expert) para generar trayectorias de control de 6 dimensiones a partir de tres cámaras y el estado de las articulaciones. Con 450 millones de parámetros totales, está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que necesitan prototipar políticas robóticas sin infraestructura de GPU de datacenter.

Este checkpoint en particular es un artefacto de investigación con fine-tuning específico sobre 50 episodios y 22.710 frames a 30 FPS, sin resultados de evaluación publicados. Su interés es principalmente como ejemplo reproducible del flujo de entrenamiento de LeRobot y como punto de partida para tareas de manipulación similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer con codificador visual, LM y action expert) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | `follow` |
| Camaras de entrada | `gripper`, `newtop`, `newside` (3 x 3x256x256) |
| Entrada de estado | `observation.state` (6,) |
| Salida | `action` (6,) |
| Tamano del repo | 0.9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que fusiona percepción visual multi-cámara con instrucciones en lenguaje natural para producir acciones motoras continuas. La arquitectura, descrita en arXiv:2506.01844, sigue el paradigma de los VLA modernos: un backbone visual procesa las imágenes de las cámaras, un modelo de lenguaje codifica la instrucción de tarea y un módulo de acciones (action expert) genera el vector de control de 6 dimensiones. El diseño prioriza la eficiencia computacional para permitir inferencia en hardware de consumo, a diferencia de VLA de mayor escala como OpenVLA o RT-2.

El fine-tuning documentado en esta model card se realizó sobre el dataset `ds1`, compuesto por 50 episodios y 22.710 frames a 30 FPS, con la tarea "Take hardware from human and put in taped area". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-4, semilla 0 y LeRobot 0.6.1. No se especifica en la información disponible si se aplicaron técnicas de RLHF, DPO ni detalles sobre la composición del dataset de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (posición/orientación del efector final y pinza) a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara simultánea: consume tres flujos de imagen de 256x256 píxeles (gripper, vista superior, vista lateral).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante un prompt textual ("Take hardware from human and put in taped area").
- Aprendizaje por imitación: política entrenada para replicar demostraciones humanas teleoperadas.
- Ejecución autónoma en bucle cerrado: el comando `lerobot-rollout` permite desplegar la política en tiempo real sobre el robot.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades conversacionales; no es un modelo de lenguaje de propósito general.
- Capacidades multilingües: no aplicables (la instrucción de tarea es un texto fijo en inglés).

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política está entrenada específicamente para recoger un objeto de la mano de un operario y depositarlo en una zona marcada, un escenario típico de transferencia humano-robot en líneas de montaje o entornos colaborativos.
- Prototipado rápido de políticas VLA: al estar construido sobre LeRobot 0.6.1 y `smolvla_base`, sirve como plantilla reproducible para que un equipo entrene su propia política sobre un dataset propio con `lerobot-train` en pocas horas de GPU.
- Validación de pipelines de aprendizaje por imitación: útil para verificar la cadena completa de grabación de datos, calibración de cámaras, entrenamiento y despliegue antes de invertir en datasets mayores.
- Investigación en eficiencia de VLA: con 450 M de parámetros y 0.9 GB de pesos, permite estudiar el equilibrio entre capacidad y coste computacional frente a VLA de mayor escala.
- Docencia y formación en robótica: su tamaño reducido y su integración con LeRobot lo hacen adecuado para cursos prácticos donde los estudiantes despliegan una política entrenada en un robot de bajo coste tipo SO-100/`follow`.
- Benchmarking de hardware de consumo para robótica: permite medir latencia de inferencia y throughput en GPUs de gama media, útil para dimensionar estaciones de trabajo robóticas.
- Base para fine-tuning en tareas análogas: punto de partida para tareas de transferencia de objetos en entornos con cinta delimitadora, ajustando con un dataset reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se ha medido la tasa de éxito en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros en fp32, los pesos ocupan aproximadamente 1,8 GB; en fp16/bf16, unos 0,9 GB. A ello hay que sumar el coste de los tres flujos visuales de 256x256 y del action expert, por lo que una estimación conservadora es de 2-4 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia; una RTX 3060, RTX 4060 o RTX 4090 son suficientes. Para entrenamiento con `lerobot-train` (batch 8, 20.000 pasos) se recomienda al menos una RTX 3090/4090 o una A100 para reducir tiempos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 6 GB o más de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de PyTorch/CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles en la información proporcionada. El control se ejecuta a 30 FPS según la frecuencia del dataset de entrenamiento, pero no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage2c_complexity_2_to_ds1` | 450 M | no disponible | Manipulación pick-and-place (ds1) | apache-2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | 450 M (misma familia) | no disponible | VLA base preentrenado, fine-tuneable | apache-2.0 | Hugging Face (modelo base oficial) |
| OpenVLA | ~7 B | no disponible en esta ficha | VLA generalista de manipulación | no disponible en esta ficha | Hugging Face |
| RT-2 (Google DeepMind) | no disponible | no disponible | VLA generalista | propietaria | no público |

La comparación con OpenVLA y RT-2 es orientativa: este checkpoint es un fine-tuning de una única tarea sobre 50 episodios, mientras que los otros son modelos generalistas de mayor escala. No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo está entrenada para la tarea "Take hardware from human and put in taped area" con un robot de tipo `follow` y tres cámaras concretas; no generaliza a otras tareas, objetos ni configuraciones de cámara.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset reducido: 50 episodios y 22.710 frames son insuficientes para una robustez alta; es probable que el modelo sea sensible a cambios de iluminación, posición de objetos y distractores.
- Dependencia de la configuración de hardware: los nombres y disposición de las cámaras (`gripper`, `newtop`, `newside`) deben coincidir exactamente con los usados en el entrenamiento.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitación, puede producir trayectorias erráticas fuera de la distribución de entrenamiento; requiere supervisión humana y paradas de emergencia.
- Sesgos: no evaluados; el dataset de demostraciones puede incorporar sesgos del operario humano (velocidad, posición inicial, estilo de agarre).
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base `lerobot/smolvla_base` y del dataset `ds1`.
- Idiomas: la instrucción de tarea está en inglés y es fija; no es un modelo multilingüe.
- Repositorio con 0 descargas y 0 likes: artefacto de investigación sin validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_2_to_ds1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset ds1: https://huggingface.co/datasets/ds1
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds1
