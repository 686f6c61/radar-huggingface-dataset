# namiciro/red-only35-act-policy

## Resumen

`namiciro/red-only35-act-policy` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), un método presentado en el paper arXiv:2304.13705 que predice trozos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario namiciro en Hugging Face y se ha entrenado y distribuido con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Con 51.668.614 parámetros y un repositorio de 0,2 GB, no es un modelo de lenguaje: es un controlador visomotor que consume el estado de las articulaciones y una imagen de cámara frontal para emitir comandos de acción de 6 dimensiones.

La política está especializada en una tarea concreta de manipulación con un robot de tipo `so_follower` (brazo SO-100/SO-101 de bajo coste): colocar un bloque rojo en la caja derecha. Se entrenó sobre el dataset `namiciro/red-to-right-v2`, con 70 episodios teleoperados, 30.440 fotogramas a 30 FPS y dos tareas anotadas («Put the red block in the right box» y «Put the blue block in the left box»), aunque el nombre del repositorio sugiere que el entrenamiento se ha orientado a la tarea del bloque rojo. Es relevante ahora porque ilustra el flujo completo de imitation learning en robótica de bajo coste: grabar demostraciones con un brazo asequible, entrenar una política ACT y desplegarla con el comando `lerobot-rollout`.

El modelo no incluye resultados de evaluación en su model card, no declara licencia y no documenta idiomas. Es, por tanto, un artefacto experimental de un autor individual más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por fotograma) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica «[More Information Needed]») |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Camaras | 1 camara frontal (`observation.images.front`, 3x480x640) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de accion | `action` de forma (6,) |
| Frecuencia de datos | 30 FPS |
| Dataset de entrenamiento | `namiciro/red-to-right-v2` (70 episodios, 30.440 fotogramas) |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que combina un backbone visual (encoder de imágenes) con un transformer que genera un chunk de acciones futuras en cada paso de inferencia, en lugar de una única acción. Este diseño, descrito en el paper «Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware» (arXiv:2304.13705), mitiga el problema de la varianza temporal en las demostraciones teleoperadas y suele mejorar las tasas de éxito frente a políticas de un solo paso. En este caso el modelo toma una imagen frontal de 480x640 píxeles y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.1 durante 20.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. La política se entrenó sobre el dataset `namiciro/red-to-right-v2`, con 70 episodios teleoperados a 30 FPS que suman 30.440 fotogramas. No consta en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente en imitation learning robótico). Tampoco consta ninguna innovación técnica adicional más allá del propio método ACT.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir de una imagen frontal y el estado de las articulaciones.
- Ejecución de tareas de pick-and-place: la model card menciona las tareas «Put the red block in the right box» y «Put the blue block in the left box».
- Predicción de chunks de acciones: ACT genera secuencias cortas de acciones por inferencia, lo que aporta suavidad y reduce el ruido del teleoperador.
- Operación a 30 FPS: la política está entrenada con datos grabados a esa frecuencia, lo que condiciona el bucle de control.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión general, de audio ni de modo de razonamiento extendido.
- Despliegue mediante `lerobot-rollout` con `--strategy.type=base` para ejecución en bucle abierto de duración configurable.

## Casos de uso

- Manipulación pick-and-place con brazo SO-100/SO-101: el modelo está entrenado específicamente para mover un bloque rojo a una caja a la derecha; se desplegaría con `lerobot-rollout` sobre el robot físico, usando la misma disposición de cámara frontal y el mismo montaje que en el dataset.
- Reproducción de experimentos de imitation learning en entornos docentes o de investigación: sirve como referencia para comparar ACT frente a otras políticas (Diffusion Policy, SmolVLA) sobre un mismo dataset.
- Base para fine-tuning con nuevos objetos o posiciones: al estar entrenado con 30.440 fotogramas de una tarea concreta, se puede reentrenar con `lerobot-train` añadiendo episodios y ampliando la variabilidad del dataset.
- Prueba de concepto de pipelines de teleoperación a política: el dataset asociado permite validar el flujo completo (grabación, entrenamiento, rollout) antes de escalar a plataformas mayores.
- Investigación sobre robustez a cambios de iluminación o posición: el modelo permite medir la degradación de éxito cuando se alteran las condiciones del entorno, aunque no se han publicado esas evaluaciones.
- Automatización de tareas repetitivas en laboratorio con material de bajo coste: la exigencia de una única cámara frontal y un brazo económico lo hace viable para prototipos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: «No evaluation results have been provided for this policy yet».

## Requisitos de hardware

- VRAM estimada para inferencia: los 51,67 millones de parámetros en safetensors ocupan aproximadamente 0,2 GB en fp32; en la práctica la inferencia ACT requiere adicionalmente memoria para el encoder visual y los tensores intermedios, por lo que se estima un consumo en el rango de 1 a 3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para la inferencia; una RTX 3060, RTX 4060 o superior es más que adecuada. Para entrenamiento, la model card usa `--policy.device=cuda` con batch size 8.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con más de 4 GB de VRAM, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot; `lerobot-train` para reentrenamiento; la política se carga con la librería `lerobot` y pesos safetensors.
- Latencia y throughput: no disponible. El bucle de control está pensado para operar a 30 FPS, equivalente a 33 ms por paso, pero no se han publicado mediciones de latencia real en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Camaras | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `namiciro/red-only35-act-policy` | 51,67 M | ACT (imitation learning) | 1 frontal 480x640 | 70 episodios, 30.440 fotogramas | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy | no disponible | Diffusion (imitation learning) | variable | no disponible | MIT (código de referencia) | Implementado en LeRobot |
| SmolVLA | ~450 M | VLA (visión-lenguaje-acción) | variable | no disponible | Apache 2.0 (según publicación) | Hugging Face / LeRobot |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre estos modelos en la misma tarea. La comparación se limita a parámetros, tipo de método y disponibilidad.

## Limitaciones y advertencias

- La licencia no está declarada; no se puede asumir uso comercial sin confirmación del autor.
- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política, incluso en la tarea para la que fue entrenada.
- Sesgos de dominio: la política está entrenada con un único robot `so_follower`, una única cámara frontal y una disposición concreta de objetos y cajas; cualquier cambio de posición de cámara, iluminación, fondo u objetos puede degradar el rendimiento de forma significativa.
- Riesgo de sobreajuste al dataset: 70 episodios y 30.440 fotogramas son un volumen reducido, lo que limita la generalización a posiciones u orientaciones no vistas.
- Inconsistencia entre el nombre del repositorio (`red-only35`) y la model card: la model card menciona dos tareas (bloque rojo a la derecha y bloque azul a la izquierda), pero no se documenta si ambas están cubiertas con la misma calidad.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento simbólico.
- Idiomas no aplicables/no disponibles: la model card no documenta ningún idioma.
- Sin demo ni vídeo de funcionamiento: no hay evidencia visual del comportamiento del modelo en el robot.
- Dependencia de la versión de LeRobot 0.7.1: cambios en la API de `lerobot-rollout` o en el formato de observaciones pueden requerir adaptaciones.
- Cero descargas y cero likes en el momento de la consulta: no hay señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namiciro/red-only35-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/namiciro/red-to-right-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=namiciro/red-to-right-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
