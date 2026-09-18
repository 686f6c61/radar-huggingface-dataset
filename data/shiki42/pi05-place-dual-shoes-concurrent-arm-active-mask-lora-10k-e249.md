# Shiki42/pi05-place-dual-shoes-concurrent-arm-active-mask-lora-10k-e249

## Resumen

Shiki42/pi05-place-dual-shoes-concurrent-arm-active-mask-lora-10k-e249 es un ajuste fino con LoRA del modelo base PI0.5, un modelo visión-lenguaje-acción (VLA) orientado a control robótico, publicado por el usuario Shiki42 dentro del ecosistema de la librería openpi. El checkpoint está especializado en una única tarea de manipulación bimanual denominada place_dual_shoes (colocación de dos zapatos con dos brazos), y se distribuye como parámetros de inferencia listos para evaluar, no como un modelo conversacional de propósito general.

El entrenamiento consistió en 10.000 actualizaciones del optimizador con tamaño de lote 16 y semilla 87431, partiendo de los pesos PI0.5 Base en JAX fijados como referencia. El conjunto de datos empleado es Shiki42/ctr-place-dual-shoes-concurrent-20260916, con 50 episodios, y la innovación concreta del ajuste es el uso de observation.arm_active_mask como peso de supervisión por brazo: valor 1 para brazo activo, 0 para brazo enmascarado, aplicado a los siete canales de acción de cada brazo.

Es relevante ahora porque ejemplifica el patrón actual de especialización de políticas robóticas mediante LoRA sobre un modelo base grande, con artefactos de normalización, configuración resuelta y hashes SHA-256 publicados para trazabilidad. Su pareja de evaluación es el checkpoint E250 sobre la suite congelada de 100 escenas de place_dual_shoes, cuyos resultados siguen pendientes de auditoría y no deben inferirse de la publicación del modelo. No declara licencia ni idiomas, y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) PI0.5 con adaptadores LoRA de un solo experto; detalle interno de la base no disponible |
| Parámetros totales | no disponible (el repositorio ocupa 6,3 GB e incluye parámetros de inferencia, activos de normalización, configuración resuelta, procedencia y hashes SHA-256) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no disponible; el repositorio contiene parámetros de inferencia para la librería openpi |
| Tarea | place_dual_shoes (manipulación bimanual concurrente) |
| Dataset de ajuste | Shiki42/ctr-place-dual-shoes-concurrent-20260916 (50 episodios), commit 6f4810ae8d8a09b0820ac104277c0bad3d884b55 |
| Actualizaciones del optimizador | 10.000 |
| Tamaño de lote | 16 |
| Semilla | 87431 |
| Pipeline declarado | robotics |
| Librería | openpi |
| Estado del repositorio | 0 descargas, 0 likes; creado el 2026-09-18, actualizado el 2026-09-18 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA de un solo experto sobre PI0.5, inicializado desde los pesos PI0.5 Base en JAX fijados por versión. PI0.5 pertenece a la familia de políticas VLA, que consumen observaciones visuales y producen secuencias de acciones; la model card no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el tamaño del componente lingüístico, por lo que esos datos quedan como no disponibles. El repositorio publica únicamente parámetros de inferencia junto con los activos de normalización correspondientes, la configuración resuelta, la procedencia y hashes SHA-256; no incluye estado del optimizador ni del cargador, de modo que no constituye una instantánea reanudable de entrenamiento.

El elemento técnico diferencial es el enmascaramiento por brazo activo. La señal observation.arm_active_mask publicada se usa directamente como peso de supervisión izquierda/derecha: valor 1 para activo y 0 para enmascarado, sobre los siete canales de acción de cada brazo. Los horizontes de acción conservan la máscara de relleno de episodio original del pipeline, de forma que se enmascaran las esperas marcadas como inactivas por el campo de brazo activo. Este ajuste no utiliza los campos retime.*_idle. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de los 50 episodios, ni si hubo fases de RLHF o DPO, que en el caso de una política de acción no serían el procedimiento habitual.

## Capacidades

- Generación de acciones de manipulación bimanual: produce secuencias de acción para la tarea place_dual_shoes con los dos brazos.
- Supervisión asimétrica por brazo: incorpora el enmascaramiento arm_active_mask, de modo que un brazo puede quedar inactivo mientras el otro ejecuta acción, en los siete canales de acción por brazo.
- Coordinación concurrente: el ajuste está diseñado específicamente para episodios en los que los dos brazos actúan de forma concurrente, no meramente secuencial.
- Ejecución de política visual-motora: consume observaciones del entorno (imágenes y estado) y emite acciones, con normalización publicada junto al checkpoint.
- Tool calling o function calling: no aplica ni está documentado para esta política robótica.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no se distribuye como agente conversacional.
- Capacidades multilingües: no disponibles; los idiomas declarados no están especificados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. La entrada visual es implícita en la tarea robótica, pero no se documentan detalles de procesamiento de visión, ni soporte de audio.

## Casos de uso

- Manipulación bimanual en simulación RoboTwin: el checkpoint se etiqueta con robotwin y está entrenado sobre una tarea concreta, por lo que su uso natural es reproducir y comparar el rendimiento de place_dual_shoes en dicho simulador con la suite congelada de 100 escenas.
- Estudio del enmascaramiento por brazo activo: sirve como referencia experimental para investigar cómo influye la supervisión asimétrica por brazo (1 activo, 0 enmascarado) en políticas bimanuales frente a un enmascaramiento uniforme.
- Base para comparativas de ajuste fino con LoRA: al publicar pasos, lote, semilla y commit del dataset, permite replicar el ajuste y medir la varianza introducida por la semilla o el número de actualizaciones.
- Transferencia sim-a-real como línea de investigación: una política de colocación de objetos con dos brazos puede evaluarse en un banco real de dos brazos, aunque requiere validación previa y ajuste de dominio, ya que no se publican resultados de transferencia.
- Auditoría y trazabilidad de artefactos de aprendizaje robótico: la inclusión de configuración resuelta y hashes SHA-256 lo convierte en un caso útil para pipelines de verificación de procedencia de checkpoints.
- Docencia y formación en robótica: sirve como ejemplo práctico de especialización de un modelo VLA fundacional mediante LoRA, con un conjunto de datos pequeño y bien delimitado.
- Generación de datos sintéticos de manipulación: las trayectorias producidas pueden emplearse como referencia o línea base para comparar contra otras políticas en la misma tarea, siempre que se registre el checkpoint y su configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación emparejada corresponde al checkpoint E250 sobre la suite histórica congelada de 100 escenas de place_dual_shoes, que los resultados se registran por separado, que no deben inferirse de una subida correcta del repositorio y que permanecen en estado "reported / audit pending" hasta la aprobación explícita del archivo. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de tasa de éxito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 6,3 GB, lo que establece un límite inferior para cargar los pesos; a ello hay que sumar activaciones, buffers de imágenes y estado de la política. Cualquier cifra concreta de VRAM sería una estimación no verificada, no un requisito publicado.
- GPU recomendadas: no disponibles. No se documentan GPU de referencia (A100, H100, RTX 4090 u otras) para este checkpoint.
- Viabilidad en GPU de consumo: no confirmada. Dado el tamaño del repositorio, un acelerador con 16-24 GB de memoria es el rango en el que cabría esperar la carga de pesos y activaciones, pero se trata de una estimación orientativa que debe validarse en la práctica.
- Opciones de despliegue: la model card declara library_name: openpi, por lo que el camino previsto es la inferencia mediante dicha librería. No se publican conversiones a GGUF, ONNX, TensorRT, vLLM, TGI, llama.cpp ni Ollama, y estos formatos no son de aplicación directa a una política de acción.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo por paso de inferencia ni número de acciones generadas por llamada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados ni especificaciones de modelos alternativos de la misma categoría con los que comparar parámetros, contexto, licencia o disponibilidad. El único punto de referencia citado es el propio PI0.5 Base en JAX, empleado como inicialización, y el checkpoint pareja E250 del mismo autor, que no constituye una alternativa externa.

## Limitaciones y advertencias

- Alcance funcional muy restringido: el ajuste está especializado en una única tarea, place_dual_shoes, y no debe esperarse generalización a otras tareas de manipulación sin un nuevo ajuste.
- Dataset pequeño: 50 episodios de entrenamiento, lo que incrementa el riesgo de sobreajuste a las condiciones de recogida y de baja robustez ante variaciones de iluminación, posiciones de objeto o dinámica.
- Evaluación no cerrada: los resultados de la evaluación pareja (E250) están pendientes de auditoría y no deben darse por válidos ni citarse como confirmados.
- Ausencia de licencia: la model card no declara licencia, por lo que no hay base explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados: no hay información sobre el comportamiento lingüístico del modelo base subyacente ni sobre soporte multilingüe.
- Artefacto no reanudable: no se publican estado del optimizador ni del cargador, de modo que no es posible continuar el entrenamiento desde este repositorio.
- Riesgo de alucinación: en el sentido de modelos de lenguaje no aplica directamente, pero sí existe el riesgo equivalente de generar acciones incorrectas o inestables fuera de la distribución de entrenamiento, con consecuencias físicas si se despliega en hardware real.
- Brecha simulación-realidad: no se documentan resultados de transferencia a un robot físico, y la tarea parece vinculada a un entorno simulado, lo que exige validación y ajuste de dominio antes de cualquier prueba con hardware.
- Dependencia de la máscara arm_active_mask: el comportamiento del modelo depende de que dicha señal se proporcione correctamente en inferencia; una máscara mal formada puede producir acciones incoherentes entre brazos.
- Sin señales de adopción: 0 descargas y 0 likes, lo que implica ausencia de validación por parte de terceros.
- Riesgos de sesgo: no evaluados ni documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiki42/pi05-place-dual-shoes-concurrent-arm-active-mask-lora-10k-e249
- Dataset de ajuste citado en la model card: https://huggingface.co/datasets/Shiki42/ctr-place-dual-shoes-concurrent-20260916
- Commit del dataset indicado en la model card: 6f4810ae8d8a09b0820ac104277c0bad3d884b55
- Librería openpi (declarada como library_name y etiqueta del modelo): repositorio openpi de Physical Intelligence, referenciado a través de las etiquetas del modelo; no se incluye URL explícita en la model card
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las únicas entradas devueltas corresponden al sitio de anuncios leboncoin.fr y no guardan relación con el modelo. No se dispone de paper, blog, demo ni repositorio adicional documentado por el autor.
