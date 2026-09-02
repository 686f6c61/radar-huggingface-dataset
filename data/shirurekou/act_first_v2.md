# shirurekou/act_first_v2

## Resumen

El modelo `shirurekou/act_first_v2` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que permite a un robot ejecutar tareas de manipulación con alta precisión a partir de datos teleoperados. Este modelo en concreto ha sido entrenado sobre el dataset `shirurekou/first` y está pensado para ser usado con el ecosistema LeRobot, que facilita el entrenamiento, la evaluación y el despliegue de políticas robóticas.

Con 51,7 millones de parámetros, es un modelo relativamente compacto, adecuado para ejecutarse en hardware de consumo o en robots con recursos limitados. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su relevancia actual radica en el creciente interés por la robótica de código abierto y el aprendizaje por imitación como vía para dotar a los robots de habilidades manipulativas sin necesidad de programación explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación y acción especifica del entorno) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder que procesa observaciones del entorno (imágenes, estados del robot) y genera una secuencia de acciones futuras como una sola predicción. El entrenamiento utiliza aprendizaje por imitación sobre demostraciones teleoperadas, minimizando la discrepancia entre las acciones predichas y las reales. El modelo fue entrenado con LeRobot, que gestiona el dataset, el proceso de entrenamiento y el guardado de checkpoints. No se han publicado detalles sobre el número de tokens, composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO; la información disponible solo indica el uso del dataset `shirurekou/first`.

## Capacidades

- Control robótico por aprendizaje por imitación: predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado.
- Ejecución de tareas de manipulación en entornos simulados o físicos, típicamente con brazos robóticos tipo SO-100 o similares.
- Integración con LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Soporte para inferencia en tiempo real durante la ejecución del robot (baja latencia gracias al tamaño compacto).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de pick-and-place: el modelo puede controlar un brazo robótico para recoger y colocar objetos en posiciones definidas, usando las secuencias de acciones aprendidas de demostraciones humanas.
- Ensamblaje de piezas en entornos industriales de baja escala: entrenado sobre demostraciones de ensamblaje, puede repetir la secuencia con alta fiabilidad.
- Robótica educativa e investigación: sirve como base para experimentos de aprendizaje por imitación, permitiendo a estudiantes e investigadores comparar variantes de ACT o probar nuevos datasets.
- Teleoperación asistida: el modelo puede complementar a un operador humano sugiriendo o completando movimientos parciales, reduciendo la carga cognitiva.
- Pruebas de robustez en entornos simulados: se puede evaluar en simuladores (por ejemplo, MuJoCo) para validar la política antes de desplegarla en hardware real.
- Desarrollo de sistemas de manipulación en el hogar: dada su licencia permisiva y su tamaño reducido, puede integrarse en prototipos de robots domésticos para tareas como recoger objetos o abrir puertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. Se recomienda consultar el dataset asociado o la documentación de LeRobot para obtener datos de evaluación si existen.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 51,7 millones de parámetros, una estimación conservadora para inferencia en FP32 (~200 MB) y en FP16 (~100 MB) sugiere que cabe en cualquier GPU con al menos 1-2 GB de VRAM. Sin embargo, el consumo real depende del tamaño de las observaciones y del chunk de acción.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1060 6GB, RTX 2060, RTX 4090) es suficiente para inferencia. El entrenamiento puede requerir algo más de memoria, pero sigue siendo accesible en GPUs de gama media.
- Compatibilidad con hardware de consumo: sí, dado el tamaño compacto.
- Opciones de despliegue: LeRobot proporciona scripts para entrenamiento e inferencia (`lerobot-train`, `lerobot-record`). También se puede integrar con ROS u otros sistemas robóticos mediante la API de LeRobot.
- Latencia y throughput: no disponibles; dependerán del hardware y de la complejidad de las observaciones.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en el Hub con la misma configuración y dataset. Otros modelos basados en ACT (por ejemplo, los publicados por LeRobot) existen, pero no hay datos públicos de rendimiento para establecer una comparación fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al ser entrenado sobre un dataset específico (`shirurekou/first`), el modelo puede no generalizar a otras configuraciones de robot, entornos o tareas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje, por lo que no procesa texto ni instrucciones verbales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia. No hay restricciones adicionales conocidas.
- Advertencia de producción: el modelo es un artefacto de investigación; no se garantiza su seguridad para uso en robots físicos sin validación exhaustiva en entornos controlados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shirurekou/act_first_v2)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [LeRobot (librería de entrenamiento)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
