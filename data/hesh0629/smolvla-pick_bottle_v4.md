# hesh0629/smolvla-pick_bottle_v4

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. Su objetivo es ofrecer un rendimiento competitivo en tareas de control robótico con un coste computacional reducido, permitiendo su despliegue en hardware de consumo. Este repositorio concreto, `hesh0629/smolvla-pick_bottle_v4`, es un fine-tune del modelo base `lerobot/smolvla_base` sobre el dataset `hesh0629/pick_bottle_v4`, especializado en la tarea de recoger botellas.

El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 1,2 GB. Está entrenado con la librería LeRobot, lo que facilita su integración en pipelines de robótica. La licencia es Apache-2.0, lo que permite uso comercial y modificación. Su relevancia radica en que demuestra cómo un VLA de tamaño reducido puede adaptarse a tareas específicas de manipulación con un coste de entrenamiento e inferencia asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acción para generar comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. El modelo base `lerobot/smolvla_base` fue preentrenado con un enfoque de eficiencia computacional, y este fine-tune se ha realizado sobre el dataset `hesh0629/pick_bottle_v4` utilizando la librería LeRobot. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. El entrenamiento se realizó con el framework LeRobot, que gestiona el pipeline de datos, el entrenamiento y la evaluación.

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de posición y orientación del efector final a partir de imágenes y texto.
- Seguimiento de instrucciones en lenguaje natural: puede interpretar comandos como "coge la botella" y traducirlos en secuencias de movimiento.
- Especialización en tareas de pick-and-place: el fine-tune sobre `pick_bottle_v4` lo hace particularmente adecuado para recoger botellas en entornos controlados.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de LeRobot, incluyendo robots como SO-100.
- Eficiencia computacional: al tener solo 450M de parámetros, es viable para hardware de consumo, aunque no se especifican requisitos exactos.

## Casos de uso

- Automatización de picking en almacenes: el modelo puede controlar un brazo robótico para recoger botellas de una cinta transportadora, reduciendo costes de hardware al requerir GPUs de gama media.
- Investigación en robótica de bajo coste: permite a laboratorios con presupuesto limitado experimentar con VLA sin necesidad de clústeres de GPUs.
- Prototipado rápido de tareas de manipulación: gracias a LeRobot, se puede entrenar y evaluar el modelo en pocas horas para validar nuevas tareas.
- Educación en robótica: sirve como ejemplo didáctico de fine-tuning de un VLA sobre un dataset específico, con documentación accesible.
- Integración en sistemas de control en tiempo real: su tamaño reducido facilita la inferencia en bucle cerrado con latencias aceptables, aunque no se proporcionan cifras concretas.
- Desarrollo de asistentes robóticos domésticos: podría adaptarse a tareas como recoger objetos en entornos domésticos, siempre que se entrene con datos adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de SmolVLA (arXiv:2506.01844) reporta métricas comparativas, pero no se incluyen en la model card de este repositorio.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible.
- Dado el tamaño de 450M de parámetros, se estima que la inferencia en FP32 requeriría alrededor de 1,8 GB de VRAM, y en cuantización de 8 bits menos de 1 GB, pero estos valores son estimaciones técnicas y no datos oficiales.
- El paper de SmolVLA indica que puede desplegarse en hardware de consumo, como GPUs de gama media (por ejemplo, RTX 3060 o superiores), pero no se confirma para este fine-tune concreto.
- Opciones de despliegue: LeRobot soporta inferencia con PyTorch y CUDA; también podría convertirse a formatos como ONNX o GGUF, aunque no se documenta en el repositorio.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos VLA como OpenVLA o RT-2. Se recomienda consultar el paper de SmolVLA para comparaciones con modelos de tamaño similar.

## Limitaciones y advertencias

- El modelo es un fine-tune específico para la tarea de recoger botellas; su rendimiento en otras tareas de manipulación no está garantizado.
- No se han documentado sesgos, pero al ser un modelo entrenado con un dataset limitado, puede presentar sobreajuste a las condiciones del dataset (iluminación, fondo, tipo de botella).
- Riesgo de alucinación en la interpretación de instrucciones complejas o ambiguas, aunque al ser un modelo de acción, el impacto se traduce en movimientos incorrectos.
- No se especifican limitaciones de contexto o idioma; el modelo probablemente funciona mejor con instrucciones en inglés, pero no se confirma.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del dataset `hesh0629/pick_bottle_v4` si se utiliza en producción.
- Para producción, es necesario validar el modelo en el robot real y considerar la seguridad del sistema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hesh0629/smolvla-pick_bottle_v4
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot GitHub: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
