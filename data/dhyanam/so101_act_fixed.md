# dhyanam/so101_act_fixed

## Resumen

`dhyanam/so101_act_fixed` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un controlador entrenado para mapear observaciones (imágenes de cámara e información de estado del robot) a secuencias cortas de acciones motrices. El autor, el usuario de Hugging Face `dhyanam`, lo ha entrenado y publicado mediante la librería LeRobot de Hugging Face.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en la gama de políticas ligeras capaces de ejecutarse en hardware modesto. Está asociado al dataset `dhyanam_local/main_task_10`, lo que sugiere un ajuste específico sobre una tarea concreta y no un modelo de propósito general. Su relevancia actual radica en que forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas de imitación en robots de bajo coste.

La ficha se apoya en la model card oficial y en los metadatos del repositorio. Cualquier dato no presente en esa información se marca explícitamente como no disponible, ya que el autor no ha publicado detalles de entrenamiento, benchmarks ni especificaciones de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación basada en transformer con componente generativo de acciones; detalles internos no disponibles en la información proporcionada |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors) |
| Idiomas soportados | no aplica / no disponible (modelo de robótica, no de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | dhyanam_local/main_task_10 |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

ACT, el método que da nombre al modelo, es una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso de acción. Esta formulación, descrita en el artículo arXiv:2304.13705, está pensada para tareas de manipulación fina a partir de datos de teleoperación. El modelo se ha entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. La información proporcionada no detalla la composición exacta del dataset, el número de episodios de teleoperación, la resolución de las cámaras ni los hiperparámetros concretos del entrenamiento.

No se especifica en la model card si se aplicaron etapas de ajuste por refuerzo, DPO u otras técnicas posteriores al entrenamiento supervisado. Tampoco se detalla si se empleó decodificación especulativa, atención lineal u otras optimizaciones de inferencia. El nombre del repositorio (`so101`) apunta a las plataformas de brazo robótico de bajo coste de la familia SO, aunque el ejemplo de evaluación incluido en la model card utiliza el tipo `so100_follower`; no se aclara en la documentación si existe una diferencia funcional entre ambas referencias.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones a partir de observaciones del entorno, siguiendo el enfoque de action chunking del método ACT.
- Manipulación de una tarea concreta: al estar entrenado sobre `dhyanam_local/main_task_10`, el modelo está especializado en la tarea recogida en ese dataset, no en un repertorio general de habilidades.
- Entrada multimodal: las políticas ACT combinan imágenes de cámara con el estado propioceptivo del robot; la model card no detalla el número ni la resolución de las cámaras utilizadas.
- Integración con LeRobot: se puede entrenar desde cero y evaluar con los comandos `lerobot-train` y `lerobot-record`.
- Ejecución en bucle cerrado: el ejemplo de evaluación usa `--episodes=10` con `--policy.path`, lo que indica uso en evaluación episódica sobre robot real.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües, ya que no es un modelo de lenguaje.
- No se documentan capacidades de visión general, audio, ni modos de pensamiento.

## Casos de uso

- Automatización de una tarea de manipulación concreta: el modelo puede desplegarse sobre un brazo de la familia SO para repetir la tarea para la que fue entrenado, aprovechando que ACT predice fragmentos de acciones que suavizan la ejecución.
- Recolección de datos de evaluación con LeRobot: mediante `lerobot-record` con `--robot.type=so100_follower` y `--episodes=10` se pueden generar datasets de test etiquetados como `eval_*` para medir la tasa de éxito de la política.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar ACT frente a otras políticas del ecosistema LeRobot sobre el mismo robot y dataset.
- Ajuste fino sobre nuevas tareas: al ser un checkpoint pequeño (51,7 M de parámetros), es viable reentrenarlo con `lerobot-train` sobre un dataset propio sin requerir clústeres de GPU.
- Prototipado en robótica de bajo coste: su tamaño permite ejecutar la política en un equipo con GPU de gama media o incluso en CPU, adecuado para laboratorios con presupuesto limitado.
- Docencia y formación: permite ilustrar el flujo completo de teleoperación, entrenamiento y evaluación de una política de imitación dentro de un curso de robótica o aprendizaje automático.
- Validación de infraestructura: útil como política de referencia para verificar que un pipeline de LeRobot (entrenamiento, checkpoints, reproducción) funciona de extremo a extremo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas. El artículo de ACT referenciado (arXiv:2304.13705) reporta sus propios resultados, pero no se dispone de los valores concretos de este checkpoint en la información proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51.668.614 parámetros, los pesos en precisión fp32 ocupan aproximadamente 207 MB, y cerca de 104 MB en fp16. La memoria adicional depende del tamaño del lote, de las imágenes de entrada y de la caché de acciones; no se han publicado mediciones concretas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente (por ejemplo, GTX 1650, RTX 3050, RTX 4090, A100, H100); no hay requisito documentado de GPU de centro de datos.
- Cabe en GPU de consumo: sí, previsiblemente en la práctica totalidad de GPU de consumo modernas, dado el reducido tamaño del modelo.
- Ejecución en CPU: probablemente viable para inferencia básica, aunque se desconoce la latencia resultante.
- Opciones de despliegue: la librería LeRobot es la vía documentada (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluación). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a políticas de robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dhyanam/so101_act_fixed | ACT (LeRobot) | 51.668.614 | no disponible | apache-2.0 | Hugging Face, 12 descargas |
| Otras politicas ACT en LeRobot (`lerobot/act_*`) | ACT (LeRobot) | no disponible | no disponible | habitualmente apache-2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | Aprendizaje por imitacion basado en difusion | no disponible | no disponible | no disponible | Hugging Face / repo de referencia |
| SmolVLA | Vision-lenguaje-accion | no disponible | no disponible | no disponible | Hugging Face |

La comparación cuantitativa no es posible con la información disponible: no se han publicado para este checkpoint parámetros comparables de rendimiento, contexto ni tasas de éxito frente a las alternativas. La diferencia principal observable es que `so101_act_fixed` es un ajuste específico sobre una única tarea local (`dhyanam_local/main_task_10`), mientras que los checkpoints oficiales de LeRobot suelen cubrir tareas de referencia publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un dataset local concreto, es previsible que herede las particularidades del operador, del entorno y del montaje físico usados durante la teleoperación.
- Riesgo de alucinacion: no aplica en el sentido lingüístico; en robótica el equivalente es la generación de acciones inválidas o fuera de distribución cuando el entorno difiere del visto en entrenamiento.
- Generalización limitada: el nombre del dataset (`main_task_10`) sugiere una única tarea; no hay evidencia de que la política funcione en escenarios distintos.
- Limitaciones de contexto e idioma: no aplica el concepto de contexto textual ni de idioma, al no ser un modelo de lenguaje.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia correspondientes.
- Discrepancia de nomenclatura: el repositorio se llama `so101` pero el ejemplo de evaluación usa `so100_follower`; conviene verificar la compatibilidad real con el robot objetivo antes de desplegar.
- Datos de entrenamiento no auditables: el dataset es local (`dhyanam_local/main_task_10`) y no se detalla su contenido, tamaño ni condiciones de captura.
- Trazabilidad escasa: 12 descargas y 0 likes indican que el modelo no ha sido ampliamente validado por la comunidad.
- Fechas del repositorio: los metadatos indican creación y actualización el 26 de septiembre de 2026, un dato que conviene contrastar con la fecha real de consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhyanam/so101_act_fixed
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
