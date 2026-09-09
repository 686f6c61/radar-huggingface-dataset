# fm-dev/pi05-pick3-uniform32-lora-5000

## Resumen

El modelo `fm-dev/pi05-pick3-uniform32-lora-5000` es un adaptador LoRA del modelo de visión-lenguaje-acción (VLA) `physical-intelligence/pi05_base`, desarrollado por `fm-dev` para una tarea concreta de manipulación robótica con un brazo Franka. El escenario es un pick-and-place repetitivo: el robot debe recoger un cubo y colocarlo sobre un plato exactamente tres veces, levantándolo entre cada colocación. Se trata de un checkpoint intermedio, subido a los 5.000 updates de optimizador mientras el entrenamiento continúa hasta los 6.250, por lo que el autor declara explícitamente que no se reivindica ninguna evaluación de calidad de política.

Arquitectónicamente, es una adaptación Cartesiana de 8 dimensiones de π0.5, con LoRA sobre el backbone de lenguaje Gemma 2B y un módulo de 300M, y con las proyecciones Cartesianas y opcionales módulos de historia entrenables. El modelo acepta como entrada imágenes RGB de base y muñeca, el estado actual del flange (xyz + cuaternión) y la apertura medida de la pinza, junto con el prompt de tarea. Incluye un módulo de historia que procesa 32 frames uniformemente espaciados del prefijo observado, con 16 tokens espaciales pooled por frame. La salida consiste en 20 poses objetivo absolutas de flange y comandos de pinza (0 cerrado, 1 abierto). El repositorio contiene pesos de servicio EMA, estado de entrenamiento reanudable, código de inferencia y dependencias exactas.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en π0.5 (`physical-intelligence/pi05_base`) con adaptación LoRA Cartesiano8. LoRA sobre Gemma 2B y módulo de 300M; backbones congelados y time MLPs congelados; proyecciones Cartesianas y módulos de historia entrenables. |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (límites conocidos: max 128 tokens para estado actual; 32 frames de historia × 16 tokens espaciales = 512 tokens de historia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de tarea está en inglés; no se documentan otros idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (EMA serving weights en `params/`; `resume_state/` con optimizador, no-EMA, RNG y cursor de muestreo; incluye código de inferencia y requirements) |

## Arquitectura y entrenamiento

La arquitectura parte del modelo base π0.5 de Physical Intelligence, un VLA de gran tamaño que aúna visión, lenguaje y acción. Sobre él, `fm-dev` aplica una adaptación LoRA en un espacio de acción Cartesiano de 8 dimensiones. Según la información del autor, se entrenan LoRA sobre los backbones de Gemma 2B y un módulo de 300M, mientras que los backbones preentrenados y los MLPs temporales permanecen congelados. Se añaden proyecciones Cartesianas nuevas y un módulo de historia opcional, ambos entrenables. El módulo de historia utiliza 32 frames uniformemente espaciados a lo largo del prefijo observado completo, solo cámara base, 16 tokens espaciales pooled por frame y modulación; en prefijos cortos se usa padding enmascarado. No se emplean ni Writer, ni Status head, ni subgoal, ni entradas de memoria semántica.

La entrada del modelo incluye imágenes RGB de base y muñeca, el estado actual del flange (xyz + cuaternión unitario XYZW, según la convención de qx positiva), la apertura medida de pinza dividida por 0.08 y el texto de tarea. La salida son 20 poses absolutas de flange y comandos de pinza. Los estados y acciones numéricos usan normalización STD solo de entrenamiento, y los tokens de estado actual usan una ventana separada basada en percentiles q01/q99, con un máximo de 128 tokens.

El entrenamiento se realizó localmente en cuatro NVIDIA RTX A6000. Se utilizó AdamW con batch global de 4 (una muestra por GPU, sin acumulación), warmup de 250 pasos y decaimiento coseno de 5e-5 a 5e-6 hasta el paso 6.250. El EMA aplicado es 0.999^4 = 0.996005996001. El checkpoint actual corresponde al paso 5.000, mientras el run completo alcanza los 6.250 updates. Las particiones de episodios son: train 40, validation 5, test 5, con ventanas aceptadas de 12.857, 1.915 y 1.600 ejemplos respectivamente. Se mantienen los filtros originales de sincronización de 40 ms y de gap máximo de 100 ms. Las etiquetas de comandos de pinza requieren bordes Joy a frecuencia completa guardados y límites de reloj; los objetivos desconocidos son NaN/false en disco y se enmascaran tanto en el condicionamiento de flujo como en la pérdida. El autor indica que las métricas con etiquetas desconocidas son null, no cero, y que la evaluación reporta errores offline de componentes conocidos, no tasas de éxito reales.

## Capacidades

- Manipulación robótica de precisión: el modelo genera 20 pasos de acción de 8 dimensiones (poses de flange y comandos de pinza) a partir de imágenes RGB de base y muñeca, estado del robot y prompt de tarea. Es capaz de ejecutar una secuencia de tres pick-and-place con despeje entre colocaciones.

- Comprensión multimodal condicionada: integra visión (dos cámaras RGB), estado numérico del robot (posición, orientación, apertura de pinza) y lenguaje natural en una única política VLA. El prompt actúa como condición semántica de la tarea.

- Memoria temporal mediante historial: procesa 32 frames uniformemente espaciados del prefijo observado, con 16 tokens espaciales pooled por frame y modulación. Esto le permite tener cierta noción de la trayectoria previa, aunque no usa subgoales ni memoria semántica.

- Generación de secuencias de acción: la salida no es texto, sino una matriz de 20×8 con poses absolutas de flange y comandos de pinza. Especificar 20 pasos futuros permite al modelo anticipar la trayectoria completa, no solo el siguiente movimiento.

- No soporta tool calling, function calling ni generación de código: no es un modelo conversacional ni de lenguaje general; no produce explicaciones textuales, ni ejecuta herramientas, ni genera código.

- Capacidades multilingües: no documentadas. El prompt de tarea está fijado en inglés, por lo que no se puede asumir robustez en otros idiomas.

- Soporte de agentes y razonamiento multi-paso: limitado. El prompt define una tarea repetitiva en tres pasos, pero la política genera la trayectoria completa de forma directa; no implementa un bucle de agente con re-planificación iterativa.

## Casos de uso

- Automatización de pick-and-place en una celda robótica de laboratorio: se puede integrar el modelo en un controlador de brazo Franka para que ejecute la tarea específica de recoger un cubo y colocarlo tres veces en un plato. La política genera directamente las 20 poses de flange y los comandos de pinza, por lo que puede sustituir a un planificador clásico con visión. Es adecuado porque el prompt ya está fijado y el modelo ha sido entrenado para esa dinámica.

- Investigación en aprendizaje por imitación (IL) y fine-tuning de VLA: el checkpoint intermedio permite a investigadores reproducir el pipeline de LoRA sobre π0.5 con cuatro RTX A6000 y estudiar el efecto de 5.000 versus 6.250 actualizaciones. El repositorio incluye `resume_state/` con optimizador, no-EMA, RNG y cursor de muestreo, lo que permite reanudar el entrenamiento exactamente donde quedó.

- Evaluación de robustez perceptiva: al usar imágenes de base y muñeca, se puede probar la política frente a cambios de iluminación, oclusiones o posiciones de cámara. El evaluador offline en `code/integrations/robomme/franka_release.py` muestra cómo procesar features cacheadas y obtener errores de componentes conocidos, sin necesidad de robot físico.

- Desarrollo de pipelines de captura de datos de manipulación: los filtros de sincronización de 40 ms y de gap máximo de 100 ms, junto con el etiquetado de eventos Joy para la pinza, sirven como referencia para construir datasets de demostración en tareas similares. Las etiquetas desconocidas se enmascaran, lo que evita contaminar la pérdida en los pasos donde la pinza no tiene evidencia válida.

- Comparación de configuraciones de adaptadores LoRA: el modelo se puede usar como referencia para comparar el rendimiento de distintas variantes, por ejemplo con o sin módulo de historia o con distintos rangos de LoRA. Al ofrecer tanto pesos EMA como el estado completo de entrenamiento, se pueden realizar ablaciones de forma controlada.

- Pruebas de concepto en simulación: dado que el modelo requiere Python 3.10 y un entorno CUDA 12, se puede integrar en simuladores robóticos (como MuJoCo, Isaac Sim o el entorno Franka de RoboMme) para validar la reproducibilidad de las secuencias de acciones sin necesidad de hardware físico. La interfaz de carga (`load_model.py`) y la función `observe` facilitan la integración en scripts de simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reivindica ninguna evaluación de calidad de política para este checkpoint intermedio. Además, la evaluación reporta errores offline de componentes conocidos, no tasas de éxito de robot, y las métricas con etiquetas desconocidas son null, no cero. Por tanto, no existen cifras comparables (MMLU, HumanEval, GSM8K, etc.) que se puedan presentar sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio tiene un tamaño de 12.8 GB, pero el autor no proporciona requisitos de VRAM ni cuantizaciones. Para inferencia se incluye un cargador (`load_model.py`), pero no se documenta su consumo exacto.

- GPU recomendadas: el entrenamiento se realizó en cuatro NVIDIA RTX A6000 (48 GB VRAM cada una). Para inferencia no hay especificación oficial; se requiere al menos una GPU CUDA 12 y Python 3.10 según las instrucciones de carga.

- Consumer GPU: no documentado. El modelo base π0.5 es grande, por lo que es improbable que quepa en GPUs de consumo (por ejemplo, RTX 4090) sin cuantización. Dado que no se incluyen pesos cuantizados, se recomienda una GPU de estación de trabajo o servidor.

- Opciones de despliegue: solo el cargador de inferencia incluido (`load_model.py`) y el evaluador offline. No se mencionan vLLM, Ollama, TGI ni llama.cpp. No se han publicado instrucciones para servir el modelo mediante API externa.

- Latencia y throughput: no disponibles. No se ofrecen datos de tiempo de inferencia ni de velocidad de procesamiento.

## Comparativa con modelos similares

No se dispone de datos en la información proporcionada para comparar con modelos similares de la misma categoría. El único modelo directamente relacionado es el base `physical-intelligence/pi05_base`, del cual este checkpoint es un adaptador LoRA intermedio. No se ha podido obtener información técnica del modelo base (parámetros, contexto, licencia) a partir de los datos disponibles.

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fm-dev/pi05-pick3-uniform32-lora-5000 | Adaptador LoRA intermedio | no disponible | no disponible | no disponible | HuggingFace (repo 12.8 GB) |
| physical-intelligence/pi05_base | Modelo base VLA | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor declara explícitamente que no se reivindica ninguna evaluación de calidad de política para este checkpoint intermedio. No debe utilizarse como modelo de producción sin una evaluación externa sólida.

- Las métricas disponibles son errores offline de componentes conocidos, no tasas de éxito de robot. Las métricas con etiquetas desconocidas son null, no cero, lo que impide hacer lecturas sencillas de rendimiento.

- Los comandos de pinza dependen de etiquetas de bordes Joy a alta frecuencia y de límites de reloj. Los objetivos desconocidos se enmascaran (NaN/false), por lo que el aprendizaje de la pinza puede verse afectado en los tramos sin evidencia válida.

- El prompt de tarea está fijado en inglés: «Pick up the cube and place it on the plate exactly three times, lifting it clear between placements». El modelo no ha sido probado con otros prompts según la información disponible.

- Solo es aplicable a la convención de frame Cartesiano y de herramienta del brazo Franka utilizada en los datos de entrenamiento. Un cambio de robot, de cámara o de sistema de coordenadas requiere readaptar la política.

- El repositorio no incluye imágenes de demostración ni evidencia raw del workspace, lo que limita la depuración visual y la inspección de los datos de entrenamiento.

- La licencia no está disponible. No se puede garantizar el uso comercial ni la redistribución del modelo y sus pesos.

- No es un modelo conversacional: no genera texto, código ni respuestas en lenguaje natural. Su salida son poses de flange y comandos de pinza. Un error de predicción se traduce en una trayectoria robótica incorrecta, no en una alucinación textual.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fm-dev/pi05-pick3-uniform32-lora-5000
