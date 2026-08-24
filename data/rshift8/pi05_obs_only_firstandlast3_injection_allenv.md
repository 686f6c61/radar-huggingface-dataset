# rshift8/pi05_obs_only_firstandlast3_injection_allenv

## Resumen

Este repositorio contiene los checkpoints completos en formato JAX/orbax de un fine-tune del modelo π₀.₅ (Pi05) de Physical Intelligence, adaptado específicamente para la tarea de atención a obstáculos en el entorno RoboPRO. El autor, rshift8, ha publicado los pesos completos del entrenamiento, incluyendo el estado del optimizador, las estadísticas de normalización y la configuración de entrenamiento, lo que permite reanudar el entrenamiento o ejecutar evaluaciones directamente.

El modelo base π₀.₅ es un Vision-Language-Action (VLA) de última generación desarrollado por Physical Intelligence, que mejora al π₀ original con mejor generalización en entornos abiertos mediante co-entrenamiento con datos heterogéneos. Este fine-tune concreto se centra en la inyección de observaciones de obstáculos, utilizando solo las primeras y últimas tres observaciones, una estrategia de diseño que probablemente busca reducir la carga computacional manteniendo la información relevante para la navegación con evitación de obstáculos.

La relevancia de este modelo radica en que proporciona un punto de partida para la investigación en control robótico con atención selectiva a obstáculos, aprovechando la arquitectura flow-based de π₀.₅. Sin embargo, al tratarse de un checkpoint de investigación sin documentación adicional, su uso práctico requiere conocimientos avanzados de JAX y del framework OpenPI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) flow-based (basada en π₀.₅) |
| Parametros totales | no disponible (el modelo base π₀.₅ tiene aproximadamente 3B, segun el paper) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precision completa JAX) |
| Idiomas soportados | no disponible (el modelo base soporta instrucciones en ingles, pero este checkpoint no lo especifica) |
| Licencia | no disponible |
| Formato de pesos | JAX/orbax checkpoints (params, train_state, assets) |

## Arquitectura y entrenamiento

El modelo base π₀.₅ es un VLA que combina un codificador de vision (tipo ViT) con un modelo de lenguaje y un cabezal de accion basado en flujos (flow matching). A diferencia de π₀, que usaba un tokenizador de acciones discreto, π₀.₅ emplea un enfoque de flujo continuo que permite una generacion de acciones mas suave y precisa. El entrenamiento del modelo base se realizo mediante co-entrenamiento con una mezcla heterogenea de datos roboticos, incluyendo teleoperacion, datos de demostracion y datos sinteticos, lo que le confiere capacidades de generalizacion open-world.

El fine-tune especifico de este repositorio, denominado `pi05_obs_only_firstandlast3_injection_allenv`, inyecta observaciones de obstaculos en el modelo, utilizando solo las tres primeras y las tres ultimas observaciones de la secuencia. Esta estrategia de "ventana recortada" reduce la complejidad temporal y permite que el modelo se centre en la informacion critica de los extremos de la trayectoria. El entrenamiento se realizo en el entorno RoboPRO, un simulador o framework de robotica, y los checkpoints incluyen el estado completo del optimizador, lo que indica que se puede reanudar el entrenamiento desde cualquier paso.

## Capacidades

- Control robotico end-to-end: el modelo genera acciones de control directamente a partir de observaciones visuales y de lenguaje, sin necesidad de pipelines modulares.
- Atencion a obstaculos: el fine-tune esta disenado para que el modelo priorice la informacion de obstaculos en sus decisiones de navegacion.
- Generalizacion open-world: hereda del modelo base π₀.₅ la capacidad de operar en entornos no vistos durante el entrenamiento, gracias al co-entrenamiento con datos diversos.
- Procesamiento de instrucciones en lenguaje natural: el modelo base acepta comandos en lenguaje natural para especificar tareas roboticas.
- Reanudacion de entrenamiento: los checkpoints incluyen el estado del optimizador, permitiendo continuar el entrenamiento o ajustar hiperparametros.
- Evaluacion reproducible: la configuracion de entrenamiento se incluye en el repositorio, facilitando la reproduccion de experimentos.

## Casos de uso

- Navegacion robotica con evitacion de obstaculos: el modelo puede integrarse en robots moviles para planificar trayectorias seguras en entornos con obstaculos dinamicos, utilizando las observaciones inyectadas para anticipar colisiones.
- Manipulacion en entornos desordenados: en tareas de recogida y colocacion, el modelo puede priorizar la atencion a obstaculos cercanos para evitar golpes con objetos adyacentes.
- Investigacion en VLA con atencion selectiva: los checkpoints permiten estudiar como la reduccion de observaciones (solo primeras y ultimas tres) afecta al rendimiento en tareas de navegacion, comparando con variantes que usan todas las observaciones.
- Desarrollo de politicas de control para robots de bajo coste: al reducir la carga de observaciones, el modelo podria ejecutarse en hardware con menos capacidad de procesamiento, aunque no se proporcionan datos de latencia.
- Fine-tuning adicional para tareas especificas: los checkpoints completos permiten a otros investigadores continuar el entrenamiento con nuevos datos o modificar la estrategia de inyeccion de observaciones.
- Benchmarking de VLA en simulacion: el modelo puede utilizarse como referencia para comparar el rendimiento de diferentes arquitecturas de atencion a obstaculos en el entorno RoboPRO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion, ni comparaciones con otros modelos. Para obtener datos de rendimiento, seria necesario ejecutar evaluaciones en el entorno RoboPRO o consultar el paper de π₀.₅ para conocer el rendimiento del modelo base.

## Requisitos de hardware

- Tamano del repositorio: 45.4 GB, lo que indica que los checkpoints completos requieren al menos esa cantidad de almacenamiento, y probablemente el doble en VRAM para cargar el modelo y el estado del optimizador.
- VRAM estimada para inferencia: no disponible, pero dado que el modelo base tiene ~3B parametros, se estima que una cuantizacion de 8 bits requeriria alrededor de 6-8 GB de VRAM, y en precision completa (fp32) unos 12-16 GB. Sin embargo, los checkpoints JAX no estan cuantizados, por lo que se necesitaria una GPU con al menos 16 GB para inferencia en fp32.
- GPU recomendadas: para entrenamiento o reanudacion, se recomienda una GPU con 24 GB o mas (RTX 3090/4090, A100, H100). Para inferencia, una RTX 4090 (24 GB) seria suficiente en precision mixta.
- Opciones de despliegue: al ser checkpoints JAX/orbax, el despliegue requiere el framework OpenPI (github.com/Physical-Intelligence/openpi). No se proporcionan conversiones a otros formatos como GGUF o safetensors.
- Latencia y throughput: no disponibles. El modelo base π₀.₅ tiene una latencia tipica de decenas de milisegundos por paso en GPUs de data center, pero este fine-tune no especifica datos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ (base) | ~3B | no disponible | VLA flow-based, generalizacion open-world | no disponible | HuggingFace (lerobot/pi05_base) |
| π₀ (base) | ~3B | no disponible | VLA con tokenizador de acciones discreto | no disponible | HuggingFace (Physical-Intelligence/pi0) |
| Este fine-tune (rshift8) | no disponible | no disponible | VLA con atencion a obstaculos (solo primeras y ultimas 3 obs) | no disponible | HuggingFace (rshift8/pi05_obs_only_firstandlast3_injection_allenv) |

La comparativa se limita a los modelos base de la familia π₀, ya que no se dispone de informacion sobre otros VLA comparables en el contexto de atencion a obstaculos. Este fine-tune se distingue por su estrategia de inyeccion de observaciones, pero carece de documentacion sobre rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion especifica, pero el modelo base π₀.₅ puede heredar sesgos de los datos de entrenamiento, que incluyen principalmente entornos de laboratorio y demostraciones humanas.
- Riesgo de alucinacion: como VLA, el modelo puede generar acciones incorrectas o inconsistentes en situaciones fuera de su distribucion de entrenamiento, especialmente en entornos con obstaculos no vistos.
- Limitaciones de contexto: la estrategia de usar solo las primeras y ultimas tres observaciones puede perder informacion critica de la parte media de la trayectoria, lo que podria degradar el rendimiento en tareas que requieren memoria a largo plazo.
- Restricciones de licencia: la licencia no esta especificada, por lo que se desconoce si el uso comercial esta permitido. Se recomienda contactar al autor antes de cualquier uso en produccion.
- Dependencia del framework: los checkpoints solo son utilizables con JAX y el framework OpenPI, lo que limita su portabilidad a otros entornos (PyTorch, TensorFlow, etc.).
- Falta de documentacion: la model card es minima y no incluye instrucciones de uso, requisitos de hardware ni ejemplos de inferencia, lo que dificulta su adopcion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rshift8/pi05_obs_only_firstandlast3_injection_allenv
- Repositorio OpenPI (framework base): https://github.com/Physical-Intelligence/openpi
- Documentacion de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Modelo base π₀.₅ en HuggingFace: https://huggingface.co/lerobot/pi05_base
- Paper de π₀.₅ (PDF): https://www.pi.website/download/pi05.pdf
- Repositorio de referencia para configuracion (mzxuan/robopro_jax_30000): https://huggingface.co/mzxuan/robopro_jax_30000
