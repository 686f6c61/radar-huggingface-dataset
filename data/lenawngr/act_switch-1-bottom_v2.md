# lenawngr/ACT_switch-1-bottom_v2

## Resumen

El modelo `lenawngr/ACT_switch-1-bottom_v2` es una política de aprendizaje por imitación basada en la arquitectura ACT (Action Chunking with Transformers), desarrollada por el usuario `lenawngr` y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenado con el framework LeRobot de Hugging Face y el dataset `lenawngr/SWITCH-1-bottom`, que contiene demostraciones teleoperadas de un brazo robótico SO-100 realizando una tarea de manipulación de un interruptor en su parte inferior. El modelo predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de control continuo.

Con 51,6 millones de parámetros, este modelo es ligero y está pensado para ejecutarse en tiempo real sobre hardware de gama media, incluida una GPU de consumo. Su relevancia radica en que demuestra cómo se puede aplicar ACT a tareas de manipulación fina con datos de demostración limitados, y su publicación en el Hub facilita su reproducción y evaluación mediante LeRobot. No se dispone de información sobre el contexto de entrada (observaciones visuales o de estado) ni sobre el proceso de entrenamiento detallado.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.602.054 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones de estado y acciones, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
ACT (Action Chunking with Transformers) es una arquitectura de transformador que combina un codificador de vision (tipicamente un ResNet preentrenado) con un decodificador basado en transformers. En lugar de predecir una unica accion por paso, el modelo genera un "chunk" de acciones (por ejemplo, 50 o 100 pasos futuros) de forma autoregresiva. Esto reduce la acumulacion de errores y mejora la estabilidad en tareas de manipulacion. El entrenamiento se realiza mediante imitacion directa sobre datos teleoperados, sin pasos de RLHF ni DPO.

El modelo fue entrenado con el framework LeRobot de Hugging Face, que gestiona el dataset, el entrenamiento y la evaluacion. El dataset `lenawngr/SWITCH-1-bottom` contiene episodios de demostracion de un brazo SO-100 (un robot de bajo coste con 6 grados de libertad) interactuando con un interruptor en posicion inferior. No se han publicado detalles sobre el numero de tokens (no aplica), la composicion del dataset, ni si se aplicaron tecnicas de aumentacion de datos o regularizacion especificas.

## Capacidades
- Control de robotica: genera secuencias de acciones de alta frecuencia (posiciones de los motores) para ejecutar tareas de manipulacion.
- Imitacion de demostraciones: aprende a partir de teleoperacion humana o programada.
- Chunking de acciones: predice bloques de acciones futuras, lo que reduce la acumulacion de errores y mejora la suavidad del movimiento.
- Integracion con LeRobot: se puede cargar y ejecutar directamente con la libreria LeRobot para inferencia en robots SO-100.
- No tiene capacidades de lenguaje, vision generalista, tool calling, ni agentes.

## Casos de uso
- Control de un brazo robotico SO-100 en tareas de precision (p.ej., accionar un interruptor inferior). El modelo se cargaria con LeRobot y se ejecutaria en tiempo real sobre el robot.
- Evaluacion de politicas de imitacion en entornos de bajo coste: al ser ligero (51 M de parametros), puede ejecutarse en un GPU de consumo o incluso en CPU para pruebas rapidas.
- Investigacion en aprendizaje por imitacion: su codigo abierto y su publicacion en Hub facilitan la reproduccion de experimentos y la comparacion con otras politicas.
- Desarrollo de robots domesticos o educativos: su tamaño reducido y licencia Apache 2.0 permiten integrarlo en proyectos de robotica de hobby.
- Generacion de trayectorias para planificacion de movimiento: aunque no es su uso principal, el modelo puede generar secuencias de acciones que sirven como referencia para planificadores clasicos.
- Estudio de generalizacion a variaciones de la tarea: se puede evaluar la robustez del modelo ante cambios de posicion del interruptor o de la configuracion del robot.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre tasa de exito, precision de posicion, ni comparaciones con otros modelos. El autor no ha incluido metricas en la model card.

## Requisitos de hardware
- VRAM estimada: al ser un modelo de 51 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en float32 (aprox. 200 MB de pesos). Con cuantizacion (no disponible) podria bajar a ~100 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050 Ti, RTX 2060, integradas en algunos SoCs). El entrenamiento, sin embargo, se puede hacer en una GPU de 8 GB (ej. RTX 2070) con batch pequeno.
- Cabe en GPUs de consumo: si, perfectamente en cualquier GPU de los ultimos 8 años.
- Opciones de despliegue: LeRobot (recomendado), tambien se puede exportar a ONNX para inferencia en CPU o con otros frameworks.
- Latencia y throughput: no disponible, pero al ser un modelo pequeno, se espera inferencia en milisegundos en GPU moderna.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables en el contexto de esta ficha. Existen otras politicas ACT publicadas en Hugging Face (por ejemplo, `lerobot/act` o modelos de la comunidad), pero no se han encontrado datos especificos de comparacion. Se podria comparar con otros modelos de aprendizaje por imitacion como Diffusion Policy o RISE, pero no hay datos de rendimiento disponibles.

## Limitaciones y advertencias
- Sesgos: al ser un modelo entrenado con datos de un solo robot y una tarea especifica, puede no generalizar a otros robots o entornos sin reentrenamiento.
- Riesgo de alucinacion: no aplica (no es un modelo de lenguaje).
- Limitaciones de contexto: no se conoce la longitud de contexto; las observaciones son imagenes y estados, no texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se recomienda citar al autor original.
- Caveat de produccion: no se ha validado en entornos de produccion; requiere evaluacion adicional para garantizar seguridad en tareas reales de robotica.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_switch-1-bottom_v2
- Dataset: https://huggingface.co/datasets/lenawngr/SWITCH-1-bottom
- Paper de ACT: https://huggingface.co/papers/2304.13705 (Arxiv 2304.13705)
- LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index

Nota: la informacion sobre el modelo es limitada; se recomienda consultar el repositorio de LeRobot para entender el formato de datos y el proceso de entrenamiento.</think>## Resumen
El modelo `ACT_switch-1-bottom_v2` es una política de aprendizaje por imitación basada en la arquitectura ACT (Action Chunking with Transformers), desarrollada por el usuario `lenawngr` y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenada con el framework LeRobot de Hugging Face y el dataset `lenawngr/SWITCH-1-bottom`, que contiene demostraciones teleoperadas de un brazo robótico SO-100 realizando una tarea de manipulación de un interruptor en posición inferior. El modelo predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la precisión en tareas de control continuo.

Con 51.602.054 parámetros, es un modelo ligero diseñado para ejecutarse en tiempo real sobre hardware de bajo coste, incluidas GPU de consumo. Su relevancia radica en que demuestra cómo aplicar ACT a tareas de manipulación fina con datos de demostración limitados, y su publicación en el Hub facilita la reproducción, evaluación y extensión mediante LeRobot. No se dispone de información sobre la longitud de contexto, los detalles del dataset de entrenamiento ni métricas de rendimiento publicadas.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.602.054 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
ACT (Action Chunking with Transformers) es una arquitectura de aprendizaje por imitación que combina un codificador de visión (habitualmente un ResNet preentrenado) y un decodificador basado en transformers. En lugar de predecir una única acción por paso de control, el modelo genera un bloque de acciones futuras (por ejemplo, 8 o 100 pasos) de forma autorregresiva. Este diseño reduce la acumulación de errores y produce movimientos más suaves y coherentes. El entrenamiento se realiza mediante imitación directa sobre datos teleoperados, sin técnicas como RLHF o DPO.

El modelo fue entrenado con el framework LeRobot, que gestiona el dataset, el entrenamiento y la evaluación. El dataset `lenawngr/SWITCH-1-bottom` contiene episodios de un robot SO-100 (un brazo de bajo coste con 6 servomotores) interactuando con un interruptor en su parte inferior. No se han publicado datos sobre el número de demostraciones, la composición del dataset ni si se aplicaron técnicas de regularización o aumento de datos.

## Capacidades
- Generación de acciones de control para robots manipuladores (posición de motores).
- Aprendizaje de demostraciones teleoperadas para tareas de precisión (p.ej., accionar un interruptor).
- Predicción de secuencias de acciones (chunking) para mejorar la estabilidad y suavidad del movimiento.
- Integración directa con LeRobot para entrenamiento, evaluación e inferencia en robots SO-100.
- No dispone de capacidades de lenguaje natural, visión general, tool calling ni razonamiento agéntico.

## Casos de uso
- Control de un brazo robótico SO-100 en tareas de manipulación fina, como accionar un interruptor inferior. El modelo se cargaría con LeRobot y se ejecutaría en tiempo real sobre el robot.
- Evaluación de políticas de aprendizaje por imitación en entornos de bajo coste: al ser ligero, puede ejecutarse en GPU de consumo o incluso CPU para pruebas de laboratorio.
- Investigación en aprendizaje por imitación: su código abierto y su publicación permiten reproducir experimentos, modificar la arquitectura y comparar con otras políticas ACT.
- Desarrollo de plataformas robóticas domésticas o educativas: el tamaño reducido y la licencia Apache 2.0 facilitan su integración en proyectos de hobby o docencia.
- Generación de trayectorias de movimiento para planificación clásica: aunque no es su uso principal, el modelo puede predecir secuencias de acción que sirvan de referencia a planificadores.
- Estudio de generalización a variaciones de la tarea: se puede evaluar la robustez del modelo ante cambios de posición del interruptor o del entorno, usando el mismo framework LeRobot.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre tasa de éxito, error de posición, ni comparaciones con otros modelos. La model card no incluye métricas de evaluación.

## Requisitos de hardware
- VRAM estimada para inferencia: menos de 1 GB en float32 (aprox. 200 MB de pesos). Con cuantización (no disponible) podría reducirse a menos de 100 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p.ej., GTX 1660 Ti, RTX 3060, integradas modernas). El entrenamiento puede realizarse con GPU de 4 GB o más.
- Cabe en GPU de consumo: sí, incluso en GPU integradas de portátiles o SoC.
- Opciones de despliegue: LeRobot (Python), exportación a ONNX para inferencia en CPU o GPU, o integración con otros frameworks de robótica.
- Latencia y throughput: no disponible, pero por su tamaño se espera una latencia de milisegundos en GPU.

## Comparativa con modelos similares
No se ha encontrado información sobre modelos directamente comparables en la misma categoría (misma arquitectura y tarea). Existen otros modelos ACT en Hugging Face (por ejemplo, `lerobot/act` o políticas de la comunidad), pero no se dispone de datos de rendimiento para establecer una comparación objetiva. Por tanto, no se puede realizar una comparativa cuantitativa.

## Limitaciones y advertencias
- Sesgos conocidos: el modelo está entrenado con datos de un único robot (SO-100) y una tarea concreta; puede no generalizar a otros brazos, entornos o variaciones de la tarea sin reentrenamiento.
- Riesgo de alucinación: no aplica al no ser un modelo de lenguaje.
- Limitaciones de contexto: no se conoce la longitud de contexto; las observaciones de entrada son imágenes y estados, no texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se recomienda citar al autor y al framework LeRobot.
- Caveat de producción: no hay evidencia de robustez en entornos reales; requiere validación adicional antes de un despliegue en tareas críticas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_switch-1-bottom_v2
- Dataset: https://huggingface.co/datasets/lenawngr/SWITCH-1-bottom
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
