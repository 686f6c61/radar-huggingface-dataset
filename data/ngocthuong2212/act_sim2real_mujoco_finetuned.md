# ngocthuong2212/act_sim2real_mujoco_finetuned

## Resumen

El modelo `act_sim2real_mujoco_finetuned` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por ngocthuong2212 (Trần Ngọc Thưởng) y entrenado con el framework LeRobot de Hugging Face. El modelo está diseñado para controlar un robot manipulador de tipo `so_follower` en la tarea de coger un objeto y colocarlo en una caja, utilizando dos cámaras (superior y frontal) como entrada visual junto con el estado del robot.

La relevancia de este modelo radica en su enfoque sim-to-real: el nombre indica que fue afinado en entornos MuJoCo, lo que sugiere un flujo de entrenamiento en simulación con transferencia a hardware real. Con aproximadamente 51,7 millones de parámetros, es una política compacta que puede ejecutarse en GPUs de consumo. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, lo que facilita su integración en pipelines de robótica con LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer que procesa observaciones multimodales (imágenes de dos cámaras y estado del robot) y genera una secuencia de acciones futuras. A diferencia de los métodos que predicen una sola acción, ACT predice un chunk de acciones, lo que mejora la estabilidad y la suavidad del control en tareas de manipulación. El modelo fue entrenado mediante aprendizaje por imitación sobre 200 episodios teleoperados (96.119 frames a 30 FPS) del dataset `vasco281204/so101_sim2real_baseline`, con la tarea de pick-and-place. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; el entrenamiento es puramente supervisado sobre demostraciones.

## Capacidades

- Control de robot manipulador: genera acciones de 6 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Percepción visual con dos cámaras: procesa imágenes de 480x640 píxeles desde vistas superior y frontal.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Tarea específica: pick-and-place de objetos en una caja, con generalización limitada a variaciones del entorno.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face para robótica.
- No soporta tool calling, agentes, razonamiento simbólico ni capacidades de lenguaje.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robótica para recoger objetos de una posición conocida y depositarlos en una caja, reduciendo la necesidad de programación manual.
- Investigación en sim-to-real: sirve como punto de partida para estudiar la transferencia de políticas entrenadas en MuJoCo a robots físicos, evaluando la brecha de simulación.
- Benchmarking de algoritmos de aprendizaje por imitación: al estar entrenado con LeRobot, puede compararse con otras políticas ACT o variantes (por ejemplo, con diferentes configuraciones de cámaras o datasets).
- Prototipado rápido de manipulación robótica: gracias a su tamaño compacto, puede desplegarse en estaciones de trabajo con GPU consumer para pruebas de concepto.
- Educación en robótica: útil para demostrar el flujo completo de grabación de demostraciones, entrenamiento y despliegue con LeRobot en cursos o talleres.
- Desarrollo de sistemas de control basados en visión: el modelo demuestra cómo combinar dos vistas de cámara con el estado del robot para generar comandos de control, un patrón reutilizable en otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 51,7M de parámetros, el modelo en FP32 ocupa aproximadamente 207 MB, y en FP16 unos 103 MB, por lo que es viable en GPUs con 4 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100). No se requieren GPUs de datacenter para inferencia.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: LeRobot (oficial), con soporte para rollout en robots reales mediante `lerobot-rollout`. También puede ejecutarse en entornos MuJoCo simulados.
- Latencia y throughput: no disponible. Depende del hardware y de la resolución de las cámaras (480x640).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. ACT es un método conocido en la literatura de robótica, y existen otras políticas entrenadas con LeRobot para tareas similares, pero no se han encontrado datos concretos de este repositorio para establecer una comparación cuantitativa. Se recomienda consultar el hub de Hugging Face para buscar políticas ACT alternativas con el mismo dataset o tarea.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card indica que no hay resultados de evaluación, por lo que el rendimiento en hardware físico es desconocido.
- Especialización limitada: el modelo está entrenado para una tarea concreta (pick-and-place) y puede fallar ante variaciones de iluminación, posición de objetos o cambios en el entorno.
- Dependencia de la configuración de cámaras: las observaciones requieren dos cámaras con nombres y posiciones específicas (`top` y `front`); cualquier cambio en la disposición afecta al rendimiento.
- Riesgo de sobreajuste: con solo 200 episodios, el modelo puede memorizar las demostraciones y generalizar mal a escenarios no vistos.
- Sin capacidades de razonamiento o lenguaje: no es un modelo multimodal general; solo procesa imágenes y estado del robot.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de verificar la procedencia de los datos de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ngocthuong2212/act_sim2real_mujoco_finetuned
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/vasco281204/so101_sim2real_baseline
- MuJoCo Playground (entornos sim-to-real): https://github.com/google-deepmind/mujoco_playground
