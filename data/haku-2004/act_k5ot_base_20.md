# Haku-2004/act_k5ot_base_20

## Resumen
El modelo `Haku-2004/act_k5ot_base_20` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. Lo desarrolla el usuario Haku-2004 y se ha entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo está pensado para controlar robots manipuladores a partir de datos de teleoperación, y su relevancia radica en que ACT consigue tasas de éxito elevadas en tareas de manipulación con relativamente pocos datos.

Con 51.668.614 parámetros, se trata de un modelo compacto que puede ejecutarse en hardware modesto. El repositorio ocupa 0,2 GB y los pesos están en formato safetensors. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. No obstante, la información pública disponible es muy limitada: no se especifican idiomas, benchmarks ni detalles del dataset de entrenamiento más allá de su identificador.

Es importante subrayar que este no es un modelo de lenguaje: es una política de control robótico. No genera texto ni responde a prompts en lenguaje natural. Su función es mapear observaciones (típicamente imágenes de cámaras y estado de las articulaciones) a comandos de acción para un robot concreto. Por tanto, las secciones de esta ficha adaptan los criterios habituales de evaluación de modelos de IA al contexto de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (política robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador visual (habitualmente ResNet) con un transformer que procesa la secuencia de observaciones y genera un chunk de acciones futuras de forma conjunta. Predecir varios pasos de acción a la vez reduce el error de acumulación y mitiga el problema de las paradas intermitentes típico de las políticas que predicen un solo paso. El modelo incorpora además una cabeza de estilo CVAE (autoencoder variacional condicional) que modela la variabilidad de las demostraciones humanas durante el entrenamiento.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202`, cuyo contenido, número de episodios, tareas y composición no están documentados en la información disponible. No se especifica el número de tokens ni de frames de entrenamiento, ni si se aplicaron técnicas de aumento de datos. Tampoco hay información sobre el robot objetivo concreto, aunque el comando de evaluación de la model card hace referencia a un `so100_follower`, lo que sugiere que el modelo está pensado para el brazo robótico SO-100 (o una variante compatible).

## Capacidades
- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos: adecuado para tareas de pick-and-place, empuje, inserción y otras manipulaciones aprendidas de demostraciones teleoperadas.
- Ejecución de políticas entrenadas end-to-end: no requiere ingeniería de reglas ni planificación simbólica.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación e inferencia mediante los comandos `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No procesa lenguaje natural ni mantiene conversaciones.
- Capacidades multilingües: no aplicable.
- No dispone de modo de pensamiento (thinking), visión general, audio ni otras capacidades multimodales más allá de la percepción visual propia de la política.

## Casos de uso
- Manipulación robótica en laboratorio: el modelo puede controlar un brazo SO-100 para ejecutar tareas de recogida y colocación aprendidas de demostraciones, aprovechando la predicción de chunks de acción para movimientos más suaves y estables.
- Automatización de tareas repetitivas de pick-and-place: en líneas de montaje o clasificación de piezas, la política puede replicar la secuencia demostrada por un operador humano sin necesidad de programación explícita.
- Investigación en aprendizaje por imitación: sirve como política base para comparar variantes de ACT, estudiar el efecto del tamaño de dataset o evaluar técnicas de aumento de datos en robótica.
- Prototipado rápido de aplicaciones robóticas: gracias a su tamaño compacto (51,7 M de parámetros) y a LeRobot, se puede entrenar y desplegar en pocas horas sobre un robot de bajo coste.
- Evaluación de generalización: útil para medir cómo se comporta una política entrenada con un dataset concreto ante variaciones de posición, iluminación o disposición de objetos.
- Educación y docencia en robótica: permite a estudiantes entrenar y ejecutar políticas de imitación con hardware asequible y flujos de trabajo reproducibles.
- Despliegue en entornos con recursos limitados: al ser un modelo pequeño, puede ejecutarse en GPUs de consumo o incluso en CPU para inferencia, lo que facilita su integración en robots con cómputo embebido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para los 51,7 M de parámetros; en la práctica, el consumo depende del codificador visual y del tamaño de las imágenes de entrada, pero debería mantenerse por debajo de 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede usar una NVIDIA RTX 3060, RTX 4090, A100 o H100 sin problemas. Para entrenamiento, se recomienda una GPU con 8 GB o más.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas (GTX 1650 en adelante), e incluso es viable la inferencia en CPU.
- Opciones de despliegue: LeRobot (comandos `lerobot-record` y `lerobot-train`), integración con PyTorch. No se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo pequeño, se espera una latencia baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5ot_base_20 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | variable (típicamente 20-80 M) | no disponible | variable según dataset | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy | variable (mayor que ACT) | no disponible | competitivo en manipulación | MIT / Apache 2.0 según implementación | Hugging Face / repositorios de investigación |
| RT-1 / RT-2 (Google) | cientos de millones a miles de millones | no disponible | alto en tareas generales | no disponible públicamente en su mayoría | no disponible |

La comparación es limitada porque no se han publicado métricas de rendimiento para este modelo concreto. Frente a Diffusion Policy, ACT suele ser más ligero y rápido de entrenar, aunque puede ser menos robusto en tareas multimodales complejas. Frente a modelos tipo RT-2, ACT es mucho más pequeño y especializado, y no pretende generalizar a tareas no vistas.

## Limitaciones y advertencias
- Sesgos conocidos: al entrenarse con un dataset concreto de teleoperación, la política hereda los sesgos de las demostraciones humanas (posiciones, velocidades, estilos de agarre) y puede fallar ante configuraciones no representadas.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de acciones incorrectas o inseguras cuando el estado del robot se sale de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; su "contexto" es la ventana de observaciones y el horizonte de predicción de acciones, cuyos valores no se documentan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios.
- Caveats para producción: no se documentan el dataset de entrenamiento, las tasas de éxito, el robot exacto ni las condiciones de evaluación. Antes de desplegar en producción, es imprescindible validar el modelo en el robot y el entorno reales, y establecer mecanismos de parada de seguridad.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día, lo que sugiere que es un experimento reciente sin validación comunitaria.
- No se especifican los idiomas soportados ni la composición del dataset, lo que dificulta evaluar su reproducibilidad.

## Enlaces
- Hugging Face: https://huggingface.co/Haku-2004/act_k5ot_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
