# lookarooka/aloha-bimanual-act-policy

## Resumen

El modelo `lookarooka/aloha-bimanual-act-policy` es una política de imitación (imitation learning) basada en la arquitectura ACT (Action Chunking with Transformers), desarrollada para controlar un robot bimanual ALOHA de 14 grados de libertad (7 por brazo). Está entrenado específicamente para la tarea de transferencia y entrega de un cubo entre ambos brazos, incluyendo alineación, sujeción y entrega. El modelo se publica bajo licencia Apache 2.0 y se integra con el framework LeRobot de Hugging Face, lo que facilita su carga y uso en entornos de robótica.

A diferencia de los modelos de lenguaje, esta política no procesa texto, sino observaciones visuales y de posición articular para generar secuencias de acciones. El tamaño reportado en safetensors es de 539.150 parámetros, significativamente menor que el ACT original (~80M), lo que sugiere que podría tratarse de un modelo de demostración o una variante compacta. Aunque el repositorio no incluye pesos completos (tamaño 0.0 GB), la model card describe su uso previsto y su integración con LeRobot.

La relevancia de este modelo radica en su aplicación al campo de la inteligencia física (physical AI) y la manipulación bimanual, un área activa de investigación. Al estar basado en ACT, hereda las ventajas de la predicción por chunks de acciones, que reduce la acumulación de errores y mejora la estabilidad en tareas de precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - decoder de CVAE con transformer encoder-decoder |
| Parametros totales | 539.150 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (aunque no procesa lenguaje, la card indica inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT propuesta en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (Zhao et al.). ACT se basa en un Conditional Variational Autoencoder (CVAE) donde el decoder es un transformer que, dado un estilo latente z, imágenes de múltiples cámaras y posiciones articulares, predice una secuencia de acciones (action chunking) en lugar de una sola acción. Esto permite que el modelo capture la variabilidad multimodal de las demostraciones humanas y genere trayectorias suaves y coherentes.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de demostraciones, ni el proceso de optimización (si se usó RLHF, DPO u otro). La model card solo indica que está entrenado para la tarea de transferencia bimanual de cubo. Dado el bajo número de parámetros, es probable que sea un modelo de prueba o una versión reducida para validar el pipeline de LeRobot, no una implementación completa del ACT original.

## Capacidades

- Control de robot bimanual ALOHA de 14 DOF (7 por brazo) mediante predicción de secuencias de acciones.
- Ejecución de la tarea específica de transferencia de cubo: alineación, sujeción (clamping) y entrega entre brazos.
- Integración con el framework LeRobot de Hugging Face, permitiendo cargar el modelo con `ACTPolicy.from_pretrained()` y usarlo con `select_action()`.
- Procesamiento de observaciones multimodales: imágenes RGB de múltiples vistas y posiciones articulares.
- Generación de acciones en chunks, lo que reduce la acumulación de errores en tareas de manipulación fina.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje; su "razonamiento" es implícito en la generación de trayectorias.

## Casos de uso

- Investigación en manipulación bimanual: el modelo sirve como punto de partida para estudiar políticas de imitación en robots de bajo coste, permitiendo reproducir experimentos del paper ALOHA.
- Desarrollo de habilidades robóticas en entornos de laboratorio: se puede usar para transferir demostraciones humanas a acciones robóticas en tareas de ensamblaje o manipulación de objetos pequeños.
- Validación de pipelines de LeRobot: al ser un modelo pequeño, es útil para probar la integración de políticas ACT en el framework sin necesidad de grandes recursos computacionales.
- Benchmarking de algoritmos de imitación: comparar el rendimiento de esta política compacta frente a versiones completas de ACT u otros métodos (diffusion policies, etc.).
- Educación en robótica: como ejemplo didáctico de cómo se entrena y despliega una política de imitación con transformadores.
- Prototipado rápido en robótica asistida: si se dispone del hardware ALOHA, se puede evaluar la viabilidad de la tarea de transferencia de cubo antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de error ni comparaciones con otros modelos. Dado que el repositorio no contiene pesos (tamaño 0.0 GB), no es posible evaluar el rendimiento real del modelo en la tarea descrita.

## Requisitos de hardware

- Al ser un modelo de solo 539.150 parámetros, la inferencia es extremadamente ligera. Puede ejecutarse en CPU sin problemas, y en GPU solo se necesitaría para acelerar el procesamiento de imágenes si se usan múltiples cámaras.
- VRAM estimada: menos de 1 GB, incluso con las imágenes de entrada (dependiendo de la resolución y el número de vistas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti o superior) sería suficiente; también funciona en hardware integrado.
- Opciones de despliegue: LeRobot (Python), y potencialmente exportación a ONNX o TensorRT para despliegue en tiempo real, aunque no se documenta en el repositorio.
- Latencia: no disponible, pero dado el tamaño, se espera una latencia de milisegundos en CPU moderna.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lookarooka/aloha-bimanual-act-policy | 539K | ACT (CVAE + transformer) | Transferencia bimanual de cubo | Apache 2.0 | Repo sin pesos (0.0 GB) |
| ACT original (tonyzhaozh/aloha) | ~80M | ACT (CVAE + transformer) | Manipulación bimanual fina | MIT (código) | Repo completo con código y pesos |
| Diffusion Policy (Chi et al.) | variable | Diffusion model | Manipulación robótica general | MIT | Repo público |

La comparativa se basa en información pública. El modelo de este repo es mucho más pequeño que el ACT original, lo que sugiere que no es una implementación completa. No se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo (tamaño 0.0 GB), por lo que no es posible cargarlo ni ejecutarlo tal como se describe en la model card. Es probable que sea un placeholder o un modelo de prueba.
- El modelo está entrenado para una tarea muy específica (transferencia de cubo) y no es generalizable a otras tareas sin reentrenamiento.
- No se proporcionan datos sobre el dataset de demostraciones, el número de episodios ni la calidad de las mismas, lo que impide evaluar su robustez.
- Al ser un modelo de imitación, hereda los sesgos de las demostraciones humanas; si las demostraciones son limitadas o sesgadas, el comportamiento del robot reflejará esas limitaciones.
- Riesgo de alucinación: en robótica, esto se manifiesta como acciones erráticas o inestables cuando el modelo se enfrenta a observaciones fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos disponibles, el uso práctico es nulo en la actualidad.
- No hay soporte para otros idiomas ni capacidades de lenguaje; es un modelo puramente sensoriomotor.

## Enlaces

- HuggingFace: https://huggingface.co/lookarooka/aloha-bimanual-act-policy
- Paper original ALOHA/ACT: https://tonyzhaozh.github.io/aloha/
- Repo de código ALOHA: https://github.com/tonyzhaozh/aloha
- Framework LeRobot: https://github.com/huggingface/lerobot
