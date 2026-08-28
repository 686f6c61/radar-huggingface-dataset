# Orellius/cube-out-of-box-smolvla-trainonly

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) para robótica, entrenado específicamente para la tarea de sacar un cubo de una caja con el brazo robótico SO-101. Lo ha desarrollado el usuario Orellius utilizando el framework LeRobot y el dataset `hubnemo/cube_out_of_box_dataset`, limitándose a los episodios 0 a 31. El checkpoint guardado corresponde al paso 29200 de entrenamiento.

SmolVLA es una arquitectura que combina un codificador visual SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que genera comandos de control. En este fine-tuning solo se actualizan las proyecciones y el action expert (aproximadamente 50 millones de parámetros), mientras que el resto del modelo permanece congelado. El modelo completo tiene 450.046.176 parámetros, lo que lo sitúa en la gama de los 500M, y ocupa 0,9 GB en formato safetensors.

La relevancia de este modelo radica en demostrar que es posible adaptar un VLA preentrenado a una tarea robótica concreta con un número reducido de episodios (32) y con recursos modestos, ya que el autor indica que puede ejecutarse en un portátil con aceleración MPS (Apple Silicon) o incluso en CPU. Es un ejemplo práctico de aprendizaje por imitación aplicado a manipulación real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (SigLIP + SmolLM2 + action expert) |
| Parametros totales | 450.046.176 |
| Parametros activos | ~50M (solo action expert y proyecciones durante el fine-tuning) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo usa instrucciones en inglés, p. ej. "take cube out of box") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que parte de un VLM preentrenado. El codificador visual es SigLIP, que procesa imágenes de la cámara frontal (480×640 píxeles), y el modelo de lenguaje es SmolLM2, que interpreta la instrucción en lenguaje natural. Sobre esta base se añade un "action expert" que predice las posiciones articulares del robot a una frecuencia de control de 10 Hz, con ángulos en grados (`use_degrees=true`).

El entrenamiento se realizó sobre el dataset `cube_out_of_box_dataset` de LeRobot, utilizando únicamente los episodios 0 a 31. Las estadísticas de normalización se calcularon exclusivamente con el conjunto de entrenamiento, evitando fugas de validación. El checkpoint guardado corresponde al paso 29200. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refuerzo como RLHF o DPO.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de posición articular para el brazo SO-101, permitiendo ejecutar la tarea de sacar un cubo de una caja.
- Comprensión de instrucciones en lenguaje natural: la tarea se especifica mediante la cadena "take cube out of box".
- Percepción visual: procesa imágenes de una cámara frontal a 480×640 píxeles para guiar la acción.
- Ejecución en tiempo real: opera a 10 Hz, suficiente para tareas de manipulación sencillas.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o soporte multilingüe.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo un VLA preentrenado se adapta a una tarea específica con pocos datos, comparando con métodos como ACT.
- Automatización de tareas de pick-and-place en laboratorio: el modelo puede integrarse en un setup con SO-101 para realizar la tarea de forma autónoma, reduciendo la necesidad de programación manual.
- Evaluación de políticas robóticas en entornos controlados: al ser un checkpoint de entrenamiento, permite analizar el efecto de la normalización train-only y la transferencia de SmolVLA a dominios concretos.
- Prototipado rápido de control robótico: con los comandos de LeRobot, un desarrollador puede desplegar el modelo en un portátil con MPS o CPU para probar la viabilidad de la tarea antes de escalar a hardware más potente.
- Benchmarking de eficiencia de fine-tuning: al congelar la mayor parte del modelo, se puede medir el coste computacional y la calidad de la adaptación frente a entrenamientos completos.
- Educación en robótica y VLA: el modelo y su documentación sirven como ejemplo didáctico de cómo entrenar y desplegar un VLA en un robot real con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni de evaluaciones específicas de robótica (tasa de éxito, precisión de agarre, etc.) para este modelo concreto.

## Requisitos de hardware

- El autor indica que el rollout puede ejecutarse en un portátil con aceleración MPS (Apple Silicon) o en CPU si hay problemas de memoria.
- No se especifica la VRAM necesaria, pero al ser un modelo de ~450M parámetros en safetensors (0,9 GB), es plausible que quepa en GPUs de consumo como una RTX 3060 o superior, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot proporciona los comandos `lerobot-rollout` y `lerobot-calibrate` para ejecutar el modelo en el robot SO-101.
- No se indican latencias ni throughput estimados.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA como OpenVLA, RT-2 o el propio SmolVLA base. Este modelo es un fine-tuning específico, por lo que su comparación directa dependería de métricas de éxito en la tarea, que no están publicadas. Se puede señalar que, frente a ACT (otra política de imitación mencionada en el blog de ggando.com), SmolVLA tiene más parámetros pero solo fine-tunea una fracción, lo que reduce el coste de adaptación.

## Limitaciones y advertencias

- Entrenado con solo 32 episodios, la generalización a variaciones de la tarea o a entornos no vistos es limitada.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere consultar al autor.
- No se documentan sesgos conocidos, pero al ser un modelo de robótica física, existe riesgo de movimientos inseguros; el propio autor recomienda mantener un botón de parada de emergencia (e-stop) durante el rollout.
- El modelo está diseñado para una tarea muy concreta ("take cube out of box") y no es un asistente generalista; no admite conversación ni generación de texto libre.
- La frecuencia de control de 10 Hz puede ser insuficiente para tareas dinámicas o de alta precisión.
- No se han publicado evaluaciones de robustez frente a cambios de iluminación, oclusiones o variaciones en la posición del cubo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Orellius/cube-out-of-box-smolvla-trainonly
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de HuggingFace sobre SmolVLA: https://huggingface.co/blog/smolvla
- Modelo base SmolVLA en HuggingFace: https://huggingface.co/lerobot/smolvla_base
- Blog de fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
