# Maiken1178/act_so101_pick_place_night

## Resumen

`act_so101_pick_place_night` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. La desarrolla el usuario Maiken1178 y resuelve una tarea de manipulación muy concreta: coger un bloque y depositarlo en un cuenco, sobre un robot de tipo `so_follower` (variante del SO-101) equipado con una única cámara en la muñeca. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones más una imagen RGB de 480x640) a comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros en formato safetensors y un repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware de consumo. Su relevancia es la de cualquier política ACT bien entrenada: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación (grabación de datos con teleoperación, entrenamiento con LeRobot y despliegue con `lerobot-rollout`) para quien quiera replicar el flujo en su propio robot.

Conviene subrayar que se trata de un artefacto de entrenamiento personal, sin licencia declarada, sin resultados de evaluación publicados y sin métricas de éxito en robot real. Su utilidad es, por tanto, la de ejemplo funcional y punto de partida, no la de componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observación por paso de control) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica con una cadena fija: "Pick up the block and place it in the bowl") |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` (una sola) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset de entrenamiento | Maiken1178/so101_pick_place_night_20261123_2122_20261123_212319 |
| Episodios / frames | 30 episodios, 10.294 frames a 30 FPS |
| Pasos de entrenamiento | 10.000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso, lo que reduce el error de compounding y estabiliza la ejecución. La arquitectura combina un codificador visual (procesa la imagen de la muñeca a 480x640), un codificador del estado propioceptivo de 6 dimensiones y un transformer que genera la secuencia de acciones de 6 dimensiones. El modelo se entrenó con el flujo estándar de LeRobot 0.6.2 sobre 30 episodios de teleoperación que suman 10.294 frames a 30 FPS, es decir, unos 343 segundos de datos efectivos. La configuración de entrenamiento fue de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000.

No hay información sobre el número de tokens de entrenamiento (no aplica), composición del dataset más allá de la tarea, ni sobre uso de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El valor técnico está en la receta reproducible: pocos datos, tarea única, una sola cámara y un entrenamiento corto, lo que lo convierte en un caso de estudio de ACT en condiciones realistas y modestas.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` con 6 grados de libertad a partir de una imagen de muñeca y el estado articular.
- Ejecución de una tarea de pick-and-place concreta: coger un bloque y colocarlo en un cuenco.
- Predicción de chunks de acción, lo que permite movimientos más suaves y menor acumulación de error que un controlador paso a paso.
- Funcionamiento en tiempo real a 30 FPS, alineado con la frecuencia de grabación del dataset.
- Despliegue mediante la CLI de LeRobot (`lerobot-rollout`) con `--strategy.type=base`.
- Reentrenamiento y ajuste con `lerobot-train` sobre nuevos datasets.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Replicación de un pipeline de aprendizaje por imitación: usar el repositorio como referencia para grabar datos con teleoperación, entrenar una política ACT y desplegarla, siguiendo la guía de LeRobot. Es adecuado porque la configuración completa (dataset, hiperparámetros y comando de rollout) está documentada.
- Prototipado de pick-and-place en un SO-101: servir como punto de partida para tareas de recogida y depósito de objetos pequeños en entornos controlados, gracias a que la política ya está entrenada para esa secuencia.
- Docencia y formación en robótica: ilustrar el ciclo completo de imitación con un modelo de 51,7 M de parámetros y 0,2 GB, manejable en aulas y laboratorios con hardware modesto.
- Comparación de métodos de imitación: usar esta política como línea base ACT frente a alternativas como Diffusion Policy o VQ-BeT en el mismo robot y tarea.
- Pruebas de robustez ante condiciones de iluminación: el sufijo "night" del dataset sugiere grabación en condiciones nocturnas, lo que permite estudiar la sensibilidad a la iluminación si se compara con políticas entrenadas con luz diurna.
- Integración en flujos de investigación con LeRobot: emplear el modelo como ejemplo de referencia para validar versiones de la librería, comandos CLI y formatos de dataset antes de entrenar políticas propias.
- Demostración de despliegue en robot real con una sola cámara: útil para equipos que quieran minimizar el hardware de percepción y evaluar si una única vista de muñeca basta para la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluyendo GTX 1650, RTX 3050 o superiores.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; para entrenamiento se recomienda al menos una RTX 3060 o superior, aunque el tamaño del modelo permite entrenar en GPUs de gama media.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales, dado el reducido tamaño del modelo.
- Opciones de despliegue: LeRobot con `lerobot-rollout` (flujo documentado); el formato safetensors es compatible con PyTorch, por lo que puede integrarse en scripts propios.
- Latencia y throughput estimados: no disponibles; el diseño apunta a 30 FPS, coincidiendo con la frecuencia del dataset, pero no se han publicado mediciones.
- Requisitos adicionales: robot `so_follower` calibrado, cámara con resolución 640x480 a 30 FPS y puerto serie configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_pick_place_night (este) | 51,7 M | Imagen 480x640 + estado (6,) | Pick-and-place en SO-101 | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | variable | Configurable | Múltiples tareas | según repo | Hugging Face / LeRobot |
| Diffusion Policy | no disponible | Configurable | Imitación visuomotora | según implementación | Repositorios de investigación |
| VQ-BeT | no disponible | Configurable | Imitación visuomotora | según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparables para este modelo concreto, por lo que la comparativa se limita a parámetros, formato y disponibilidad. Las alternativas citadas son marcos o métodos de la misma categoría (aprendizaje por imitación para manipulación), no modelos con benchmarks publicados en esta ficha.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir permiso para uso comercial; hay que contactar con el autor o tratar el modelo como no licenciado.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Entrenado con solo 30 episodios y 10.294 frames: alta probabilidad de sobreajuste y de fallo ante posiciones de objeto, iluminación o fondos distintos a los vistos.
- Una única cámara de muñeca: la percepción es limitada y puede fallar en oclusiones o cuando el objeto sale del campo de visión.
- Tarea única y fija: la cadena de tarea "Pick up the block and place it in the bowl" está codificada en el entrenamiento; no generaliza a otras instrucciones.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras en robot real; se recomienda supervisión y límites de par.
- Posible sensibilidad a condiciones nocturnas: el nombre del dataset sugiere entrenamiento con poca luz, lo que puede degradar el rendimiento con iluminación diurna.
- Sin información sobre sesgos demográficos o de otro tipo, al no tratar datos humanos.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Compatibilidad sujeta a la versión de LeRobot 0.6.2; cambios en la librería pueden romper el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maiken1178/act_so101_pick_place_night
- Dataset de entrenamiento: https://huggingface.co/datasets/Maiken1178/so101_pick_place_night_20261123_2122_20261123_212319
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Maiken1178/so101_pick_place_night_20261123_2122_20261123_212319
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
