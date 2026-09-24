# hqfang/groot-so100_101

## Resumen

`hqfang/groot-so100_101` es un checkpoint de política robótica (LeRobot policy checkpoint) publicado por el usuario hqfang, resultado de un ajuste fino completo del modelo fundacional `nvidia/GR00T-N1.7-3B` sobre brazos robóticos SO-100 y SO-101. No es un modelo de lenguaje: es un modelo visión-lenguaje-acción (VLA) que recibe una instrucción de tarea, el estado articular de 6 dimensiones del robot y entre 1 y 4 vistas RGB reales, y devuelve una secuencia de acciones de robot con un horizonte de 40 pasos.

El entrenamiento se realizó durante 150.000 pasos de optimizador con batch global de 256 sobre 1.209 datasets LeRobot v3 de SO100/101, que suman 19.227.195 fotogramas, y finalizó el 23 de septiembre de 2026. El proceso usó parámetros maestros, gradientes y momentos de Adam en FP32 con cómputo en BF16. La pérdida final del último batch de entrenamiento fue de 0,00721034, un valor que el propio autor aclara que no constituye una métrica de evaluación, ya que no se han publicado resultados de despliegue real sobre robot.

El modelo pesa 3.144.016.000 parámetros (3,14 B) y ocupa 12,6 GB en el repositorio, en formato safetensors. Es relevante para la comunidad de robótica open source porque ofrece una política ya entrenada sobre un corpus amplio y homogéneo de tareas con el brazo SO-101 (diseño abierto de bajo coste de TheRobotStudio y Hugging Face), aunque su adopción es todavía nula: 0 descargas y 0 likes en el momento de la consulta, y sin licencia ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) heredado del modelo base `nvidia/GR00T-N1.7-3B`; la model card del checkpoint no detalla la arquitectura interna |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible; el horizonte de acción (action chunk) es de 40 pasos |
| Tipos de cuantizacion | No disponible; el repositorio distribuye safetensors de ~12,6 GB, un tamaño coherente con pesos en FP32 |
| Idiomas soportados | No disponible; acepta instrucciones de tarea en lenguaje natural a través del procesador VLM incluido |
| Licencia | No disponible; el autor remite a los términos aplicables del modelo base `nvidia/GR00T-N1.7-3B` |
| Formato de pesos | safetensors (LeRobot policy checkpoint), junto con configuración de política, pre/postprocesadores, tensores de normalización y assets de tokenizer/procesador VLM |

## Arquitectura y entrenamiento

Se trata de un checkpoint de inferencia final de un ajuste fino completo (full fine-tuning) del modelo `nvidia/GR00T-N1.7-3B`, una base VLA de NVIDIA de 3 B de parámetros. El autor no describe en la model card la arquitectura interna del modelo base, por lo que la ficha no puede detallar la composición de capas, el mecanismo de atención ni el reparto de parámetros entre módulos. Sí se especifica que es un checkpoint de política LeRobot y no un checkpoint Isaac-GR00T en crudo: para cargarlo hay que instanciar la política guardada junto con sus pre y postprocesadores, y el cargador actual inicializa primero desde `nvidia/GR00T-N1.7-3B`, de modo que se requiere acceso a ese modelo upstream.

El entrenamiento se ejecutó durante 150.000 pasos de optimizador con batch global 256 sobre 1.209 datasets LeRobot v3 de SO100/101 que totalizan 19.227.195 fotogramas, con parámetros maestros, gradientes y momentos de Adam en FP32 y cómputo en BF16. El entorno usó Python 3.12, PyTorch 2.11 y Transformers 5.5.4, y la revisión del modelo base empleada fue `2fc962b973bccdd5d8ce4f67cc63b264d6886495`. La pérdida final del batch de entrenamiento fue 0,00721034. El autor indica explícitamente que no se realizó evaluación mediante rollout en robot. Entre las particularidades de la integración destacan la eliminación del padding de cámaras antes de la tokenización del VLM (mediante máscaras `<camera_key>_is_pad`), la serialización del procesador VLM dentro del checkpoint (con SHA256 de implementación requerido `cf0b69e95280414b1fea5ff8caac2f58ff9de949318d833fc06f856e774339a8`) y una normalización pooled q01/q99 compartida y sin recorte.

## Capacidades

- Generación de acciones de robot de 6 dimensiones a partir de observaciones visuales y del estado articular, con un horizonte de acción de 40 pasos.
- Interpretación de instrucciones de tarea en lenguaje natural gracias al procesador VLM incluido en el checkpoint.
- Procesamiento de entre 1 y 4 vistas RGB reales, con mapeo a `observation.images.camera_0` hasta `camera_3`.
- Gestión de ranuras de cámara con padding: las entradas rellenas se marcan con la máscara booleana `<camera_key>_is_pad` y el procesador las elimina antes de la tokenización del VLM.
- Salida de acciones en los seis canales originales, aplicando normalización pooled q01/q99 compartida y sin recorte.
- Independencia del orden de cámaras por episodio en entrenamiento (el orden se aleatorizó por episodio), siempre que se mantenga un orden consistente durante un mismo episodio de inferencia.
- No soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-step conversacional y no ofrece capacidades multilingües declaradas: es una política de control robótico, no un asistente de texto.

## Casos de uso

- Manipulación robótica con SO-100/SO-101 en laboratorio: el modelo convierte instrucciones textuales y hasta cuatro vistas de cámara en secuencias de 40 acciones, lo que permite ejecutar tareas de pick-and-place sobre el brazo abierto sin diseñar un controlador específico por tarea.
- Investigación en modelos visión-lenguaje-acción: sirve como punto de partida reproducible (con revisión de modelo base fijada y SHA256 del procesador documentado) para comparar políticas VLA sobre el mismo conjunto de 1.209 datasets LeRobot v3.
- Ajuste fino posterior sobre tareas concretas: al ser un checkpoint completo de 3,14 B con configuración y procesadores exportados, se puede partir de él para especializar comportamientos con datasets propios más pequeños.
- Recogida y aumento de datos con teleoperación: el mapeo explícito de cámaras y el uso de máscaras de padding facilitan integrar configuraciones variables de sensores (una sola cámara o hasta cuatro) en pipelines de grabación y reentrenamiento.
- Evaluación de robustez multicámara: permite probar cómo cambia el comportamiento al pasar de 1 a 4 vistas, dado que el modelo se entrenó con orden de cámara aleatorizado por episodio.
- Prototipado educativo con hardware de bajo coste: el brazo SO-101 está diseñado para funcionar con LeRobot y está documentado en abierto, por lo que este checkpoint encaja en cursos y talleres de robótica con presupuesto reducido.
- Automatización de celdas de clasificación o limpieza de mesa: el modelo puede integrarse en una celda con cámara fija para ejecutar tareas repetitivas de manipulación, aunque sin métricas de rollout publicadas debe validarse primero en el montaje real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que "no robot rollout evaluation is reported here" y que la pérdida final de batch de entrenamiento (0,00721034) no es una puntuación de evaluación.

| Metrica | Valor | Nota |
|---|---|---|
| Pérdida final de batch de entrenamiento | 0,00721034 | No es una métrica de evaluación según el autor |
| Evaluación mediante rollout en robot | No disponible | El autor declara que no se reporta |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica / no disponible | Modelo de política robótica, no de texto |
| Benchmarks de manipulación (por ejemplo, tasa de éxito por tarea) | No disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 13-16 GB si se cargan los pesos en FP32 tal como se distribuyen, y aproximadamente 8-11 GB si se convierten a BF16. Estas cifras son estimaciones a partir del tamaño del repositorio (12,6 GB) y no están confirmadas por el autor.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S (48 GB) o RTX A6000 (48 GB) para trabajar en FP32 con margen y varias cámaras.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 o RTX 4080 (24 GB o menos) si se usa BF16; en FP32 en una GPU de 24 GB el margen es muy ajustado una vez se suman activaciones y vistas de cámara.
- Opciones de despliegue: la implementación actualizada de LeRobot GR00T N1.7 del proyecto de entrenamiento, cargando la política guardada junto con sus pre y postprocesadores y con acceso al modelo base `nvidia/GR00T-N1.7-3B`. El ZIP de inferencia de pi05 no es compatible como runtime para este checkpoint. vLLM, TGI o llama.cpp no son aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. El autor no publica tiempos de inferencia ni frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Modelo base | Parametros | Datos de entrenamiento | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `hqfang/groot-so100_101` | nvidia/GR00T-N1.7-3B | 3,14 B | 1.209 datasets SO100/101, 19.227.195 fotogramas, 150.000 pasos | Horizonte de acción de 40; contexto no disponible | No disponible | Hugging Face, 0 descargas |
| `Pushpakcc/gr00t-so100_dualcam-finetuned` | nvidia/GR00T-N1.5-3B | No disponible (base de 3 B) | 80 episodios, 47.513 fotogramas, tarea de limpieza de mesa con doble cámara | No disponible | No disponible | Hugging Face |
| `H2Ozone/groot_so101_aug` | No disponible | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| `nvidia/GR00T-N1.7-3B` (modelo base) | — | 3 B | No disponible | No disponible | No disponible en esta búsqueda | Hugging Face |

La comparativa se limita a los datos recuperados en la búsqueda web; no se dispone de cifras de rendimiento comparables entre estas políticas.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación mediante rollout real en robot, por lo que el rendimiento de la política en tareas físicas es desconocido.
- La licencia no está declarada en la ficha. El propio autor remite a los términos del modelo base `nvidia/GR00T-N1.7-3B`, de modo que el uso comercial queda sujeto a las condiciones de NVIDIA y debe verificarse antes de cualquier despliegue en producción.
- Es un checkpoint de política LeRobot, no un checkpoint Isaac-GR00T en crudo: cargarlo con un runtime distinto (por ejemplo, el ZIP de inferencia de pi05) no está soportado y puede producir resultados incorrectos.
- Requiere acceso al modelo base `nvidia/GR00T-N1.7-3B` durante la inicialización, lo que añade una dependencia externa y un paso adicional de descarga.
- El orden de las cámaras se aleatorizó por episodio durante el entrenamiento; usar órdenes distintos dentro de un mismo episodio de inferencia puede degradar la política.
- Es obligatorio preservar el orden y las unidades de las articulaciones del entrenamiento; cualquier cambio en la convención de ejes o de escala invalida las acciones generadas.
- La normalización guardada es pooled q01/q99 sin recorte, por lo que valores atípicos en las entradas pueden propagarse sin acotar.
- La pérdida de entrenamiento reportada (0,00721034) corresponde a un único batch final y no debe interpretarse como indicador de calidad.
- Riesgo de sesgo de dominio: el modelo se ha entrenado sobre 1.209 datasets de SO100/101, por lo que su generalización a otros brazos, morfologías o entornos de iluminación distintos no está documentada.
- No hay información sobre sesgos sociales, toxicidad o comportamientos indeseados, ni sobre idiomas soportados en las instrucciones de tarea.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), sin señales de la comunidad sobre su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hqfang/groot-so100_101
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/MolmoAct2-SO100_101-Dataset
- Repositorio SO-ARM100 (TheRobotStudio): https://github.com/TheRobotStudio/SO-ARM100
- Documentación DeepWiki de SO-ARM100: https://deepwiki.com/TheRobotStudio/SO-ARM100
- Modelos de simulación SO-ARM100 (URDF y MuJoCo): https://deepwiki.com/TheRobotStudio/SO-ARM100/4.2-simulation-models
- Política comparable `H2Ozone/groot_so101_aug`: https://huggingface.co/H2Ozone/groot_so101_aug
- Política comparable `Pushpakcc/gr00t-so100_dualcam-finetuned`: https://huggingface.co/Pushpakcc/gr00t-so100_dualcam-finetuned
