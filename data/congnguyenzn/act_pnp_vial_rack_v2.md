# congnguyenzn/act_pnp_vial_rack_v2

## Resumen

`congnguyenzn/act_pnp_vial_rack_v2` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705 y popularizado por la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo robótico y dos imágenes de cámara, y emite comandos de acción de 6 dimensiones para ejecutar una tarea física concreta. El autor es el usuario de Hugging Face `congnguyenzn` y la licencia es Apache 2.0.

El modelo resuelve una única tarea de manipulación: "Pick the vial and place into the rack" (coger un vial y colocarlo en una gradilla). Está entrenado sobre el dataset `congnguyenzn/pnp_vial_rack`, con 119 episodios y 66 638 fotogramas grabados a 30 FPS mediante teleoperación. El robot objetivo es el tipo `so_follower` (brazo seguidor de la familia SO de bajo coste) con dos cámaras, `wrist` y `front`.

Su relevancia es la habitual de este tipo de publicaciones: sirve como ejemplo reproducible de extremo a extremo del flujo de LeRobot (grabar datos, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) y como punto de partida para fine-tuning en tareas de pick-and-place. Con 28 034 182 parámetros y 0,1 GB de repositorio, es un modelo muy ligero que puede ejecutarse en hardware de consumo. No tiene descargas ni valoraciones registradas en el Hub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT); codificador CVAE y decodificador transformer según el método del paper arXiv:2304.13705 |
| Parámetros totales | 28 034 182 |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; la observación es de un único paso con historial gestionado por la política) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea está definida por una cadena de instrucción fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot (versión de entrenamiento 0.6.1) |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist`, `front` (640x480, 30 FPS en el dataset) |
| Entradas | `observation.state` (6,); `observation.images.wrist` (3, 480, 640); `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice bloques cortos de acciones futuras (action chunks). El modelo combina un codificador de autoencoder variacional condicional (CVAE) que captura la variabilidad de las demostraciones humanas y un transformer que genera la secuencia de acciones, con agregación temporal en inferencia para suavizar las transiciones entre chunks. En esta ficha no se detalla la configuración interna de capas o dimensiones porque la model card no la documenta.

El entrenamiento se realizó con LeRobot 0.6.1 sobre 119 episodios (66 638 fotogramas a 30 FPS) del dataset `congnguyenzn/pnp_vial_rack`, todos correspondientes a la misma tarea. La configuración registrada es: 20 000 pasos de entrenamiento, batch de 64, optimizador AdamW, learning rate 6e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni otras fases de ajuste por preferencias, algo esperable en una política de imitación pura.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir del estado articular y de dos vistas de cámara.
- Ejecución de la tarea específica "Pick the vial and place into the rack" con el robot `so_follower`.
- Predicción por chunks de acciones, lo que reduce el error de composición típico de las políticas paso a paso.
- Funcionamiento con dos cámaras simultáneas (muñeca y frontal), lo que aporta información tanto de la escena global como de la zona de agarre.
- Despliegue mediante el flujo estándar de LeRobot (`lerobot-rollout`) con la estrategia `base`.
- Reentrenamiento y fine-tuning mediante `lerobot-train` con `--policy.type=act`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo de pensamiento. Es un controlador especializado, no un modelo de propósito general.

## Casos de uso

- Automatización de pick-and-place en laboratorio: colocar viales en gradillas sin intervención manual en flujos repetitivos de preparación de muestras, aprovechando que la política ya está entrenada exactamente para esa tarea.
- Base para fine-tuning en variantes de la tarea: reentrenar sobre un dataset propio con viales de otro tamaño, otra gradilla u otra disposición de cámaras, partiendo de un checkpoint ya adaptado a la morfología `so_follower`.
- Banco de pruebas de aprendizaje por imitación: usar el modelo como referencia base en experimentos que comparen ACT con otros métodos (por ejemplo, políticas de difusión) bajo el mismo dataset y el mismo robot.
- Formación y divulgación: demostrar el ciclo completo de LeRobot (teleoperar, grabar, entrenar, desplegar) en cursos o talleres con hardware de bajo coste, dado que el modelo ocupa 0,1 GB y 28 M de parámetros.
- Validación de robustez: ejecutar la política repetidamente con variaciones controladas de iluminación, posición inicial de la pieza o presencia de distractores para caracterizar la degradación de la tasa de éxito.
- Generación de datos de política para investigación: producir rollouts etiquetados que alimenten estudios de análisis de fallos, estimación de incertidumbre o aprendizaje por refuerzo offline.
- Prototipado de celdas robotizadas de bajo presupuesto: validar la viabilidad de una estación automatizada con un brazo SO antes de invertir en un manipulador industrial.
- Integración en pipelines de evaluación continua: ejecutar la política en cada versión del firmware o del calibrado del robot para detectar regresiones de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla vacía y la indicación explícita de que no se han proporcionado resultados en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito, número de ensayos ni condiciones de prueba documentados. Tampoco se han publicado métricas de MMLU, HumanEval, GSM8K ni similares, ya que el modelo no es un modelo de lenguaje.

| Tarea | Ensayos | Éxitos | Tasa de éxito |
|---|---|---|---|
| Pick the vial and place into the rack | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los 28 034 182 parámetros ocupan aproximadamente 112 MB en fp32 y 56 MB en fp16/bf16. El consumo real lo dominan el contexto de CUDA, los búferes de las dos cámaras a 640x480 y el resto del proceso de LeRobot, no los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; no se requiere A100, H100 ni VRAM de gama alta. Una RTX 3060, RTX 4060 o incluso una GTX 1650 cubren la inferencia con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con CUDA; también es viable la ejecución en CPU, aunque la latencia será mayor.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` es la vía documentada; también el ecosistema PyTorch de LeRobot para carga manual del checkpoint. vLLM, llama.cpp, Ollama y TGI no son aplicables: son servidores de modelos de lenguaje y esta política no expone una interfaz de generación de texto.
- Latencia y throughput: no disponible. El dataset se grabó a 30 FPS, por lo que la política debe ejecutarse a una frecuencia compatible con ese régimen de control, pero no se documenta la latencia medida.
- Hardware robótico necesario: brazo `so_follower`, dos cámaras (muñeca y frontal) a 640x480 y 30 FPS, y el puerto serie correspondiente.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. La búsqueda web asociada no devolvió resultados relacionados con robótica ni con LeRobot. La comparación siguiente es cualitativa y se limita a lo que puede afirmarse con la información disponible; los campos sin datos se marcan como no disponibles.

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pnp_vial_rack_v2 (este modelo) | 28 034 182 | ACT, aprendizaje por imitación | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT publicadas en LeRobot | no disponible | ACT | no aplica | no disponible | no disponible |
| Políticas de difusión (Diffusion Policy) | no disponible | aprendizaje por imitación generativo | no aplica | no disponible | no disponible |
| Modelos visión-lenguaje-acción (por ejemplo, SmolVLA) | no disponible | VLA | no disponible | no disponible | no disponible |

Diferencias esperables frente a un modelo VLA: este checkpoint no acepta instrucciones en lenguaje natural, está especializado en una sola tarea y su espacio de acción está fijado a 6 dimensiones para el robot `so_follower`. Frente a métodos de difusión, ACT es más ligero en cómputo de inferencia, aunque ambas familias comparten el enfoque de aprendizaje por imitación a partir de demostraciones teleoperadas.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en el robot, incluso en las condiciones exactas del dataset.
- Especialización extrema: está entrenada para una única tarea ("Pick the vial and place into the rack") y no generaliza a otras instrucciones ni a otros objetos sin reentrenamiento.
- Dependencia del hardware: la política espera un robot `so_follower` y dos cámaras concretas; los nombres de las cámaras deben coincidir exactamente con las claves de observación (`observation.images.wrist` y `observation.images.front`) o el despliegue fallará.
- Dataset reducido: 119 episodios y 66 638 fotogramas son suficientes para una tarea simple, pero limitan la robustez ante variaciones de posición, iluminación, color del vial o presencia de distractores.
- Sensibilidad al calibrado y a la configuración del entorno: cualquier cambio en la posición de las cámaras, la mesa o la iluminación respecto a las condiciones de grabación puede degradar el comportamiento de forma significativa.
- Riesgo de fallos por error de composición: aunque el chunking mitiga el problema, una política de imitación puede acumular desviaciones en ejecuciones largas y no dispone de mecanismos de recuperación explícitos.
- Sin modelo de incertidumbre ni de rechazo: el modelo no indica cuándo no está seguro, por lo que en producción conviene añadir supervisión externa o paradas de seguridad.
- Sin capacidades lingüísticas ni multimodales generales: no procesa texto, no responde a preguntas y no puede reutilizarse como asistente o generador de contenido.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial y modificación con atribución; conviene revisar igualmente las licencias de LeRobot y de las dependencias utilizadas en el despliegue.
- Fecha de creación registrada en el Hub: 2026-09-14, posterior a la fecha habitual de consulta; se reproduce tal cual aparece en los metadatos.
- Sin descargas ni valoraciones: no existe evidencia de uso por terceros que permita validar la reproducibilidad del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/congnguyenzn/act_pnp_vial_rack_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/congnguyenzn/pnp_vial_rack
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=congnguyenzn/pnp_vial_rack
- Paper de ACT (referencia de Hugging Face): https://huggingface.co/papers/2304.13705
- Paper de ACT (arXiv): https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre robótica; los enlaces anteriores provienen de la información del Hub y de la model card.
