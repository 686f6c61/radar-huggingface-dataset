# bi199797/VR-egodex-qwen36-27b-lora-boundary

## Resumen

Este modelo es un adaptador LoRA publicado por el usuario bi199797 que ajusta el modelo base Qwen/Qwen3.6-27B (arquitectura híbrida GatedDeltaNet + atención completa, 27 600 millones de parámetros) para una tarea muy específica: la localización temporal de segmentos de acción en vídeos egocéntricos. A diferencia de otros adaptadores del mismo autor que generan narraciones descriptivas, este modelo predice únicamente los límites temporales de cada segmento (formato `MM:SS.d - MM:SS.d`), sin incluir texto sobre la acción. Se trata de una línea de base puramente visual para la localización temporal, entrenada sobre 19 672 episodios del conjunto de datos EgoDex, con las anotaciones de texto eliminadas de los objetivos de entrenamiento.

La relevancia de este adaptador radica en su enfoque minimalista: al forzar al modelo a ignorar la semántica de las acciones y centrarse solo en los cambios temporales, permite estudiar hasta qué punto la información visual por sí sola es suficiente para segmentar la actividad. El autor reporta una puntuación de timestamp de 0,6048 en una muestra de evaluación durante el entrenamiento, frente a 0,6868 del modelo hermano que recibe también las descripciones de acción, lo que demuestra el impacto de la información textual en esta tarea. El adaptador tiene un tamaño de repositorio de 0,8 GB y se distribuye en formato safetensors compatible con la librería PEFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-27B (híbrida GatedDeltaNet + full-attention) con adaptador LoRA |
| Parametros totales | 27 600 millones (modelo base) + ~200,3 millones entrenables en el adaptador |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40 960 tokens (configuración de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16, el modelo base se carga en bf16) |
| Idiomas soportados | No disponible (los datos de entrenamiento son de vídeos egocéntricos, no se especifican idiomas) |
| Licencia | other (no se especifica una licencia estándar) |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3.6-27B, un modelo de lenguaje y visión de 27 600 millones de parámetros con arquitectura híbrida que combina capas GatedDeltaNet (una variante de atención lineal eficiente) con capas de atención completa. Sobre este modelo se aplica una adaptación LoRA con escalado rsLoRA, con rango 32, alpha 64 y dropout 0,05, dirigida únicamente a los módulos de atención y MLP del modelo de lenguaje (proyecciones q/k/v/o y gate/up/down), sin tocar el codificador visual. Esto implica que solo el 0,73 % de los parámetros totales son entrenables.

El entrenamiento se realizó sobre 19 672 episodios del conjunto EgoDex, con objetivos construidos a partir de los límites temporales de los subtítulos corregidos por QA humana, pero descartando por completo el texto de las acciones. Se usó un prompt específico que pide identificar únicamente los timestamps donde cambia la acción. El entrenamiento duró 2 épocas (1230 pasos) con un tamaño de lote efectivo de 16, tasa de aprendizaje 1e-4 con programación coseno y calentamiento del 3 %, y una longitud máxima de secuencia de 40 960 tokens. El muestreo de vídeo se hizo a 2 fps con un máximo de 128 fotogramas y 272 384 píxeles por fotograma. Todo el proceso se ejecutó en dos NVIDIA H100 de 80 GB con precisión bf16 y `device_map=auto`.

## Capacidades

- Localización temporal de segmentos de acción en vídeo egocéntrico: predice los intervalos de tiempo (`MM:SS.d - MM:SS.d`) en los que ocurre cada acción, sin generar texto descriptivo.
- Procesamiento de vídeo de entrada: acepta vídeo muestreado a 2 fps, hasta 128 fotogramas, con resolución limitada a 272 384 píxeles por fotograma.
- Salida estructurada en líneas: una línea por segmento, con el primer segmento comenzando en `00:00.0` y el último terminando en el último fotograma del vídeo.
- Línea de base visual pura: no utiliza información textual de las acciones, lo que permite aislar la contribución de la señal visual en la segmentación temporal.
- Integración con el ecosistema PEFT: se puede cargar como adaptador sobre el modelo base Qwen3.6-27B usando la API estándar de Hugging Face.

## Casos de uso

- Anotación automática de vídeos egocéntricos: el modelo puede generar automáticamente los intervalos de tiempo de cada acción en grabaciones con cámara en primera persona (por ejemplo, gafas inteligentes o cascos de realidad virtual), ahorrando horas de anotación manual para construir conjuntos de datos de entrenamiento.
- Análisis de actividad en realidad virtual: en aplicaciones de RV, donde se registra la interacción del usuario con el entorno, este adaptador puede segmentar el flujo de vídeo en fases de acción (por ejemplo, coger un objeto, soltarlo, moverse) sin necesidad de transcripciones, útil para estudios de comportamiento o entrenamiento de agentes.
- Preprocesamiento para sistemas de resumen de vídeo: al obtener los límites temporales de las acciones, se pueden extraer los fragmentos clave de un vídeo largo para generar resúmenes o miniaturas representativas de cada segmento.
- Evaluación de modelos de localización temporal: sirve como línea de base comparativa para medir cuánto mejora la precisión cuando se añade información semántica (como en el modelo caption-boundary del mismo autor), útil para investigación en fusión multimodal.
- Indexación y búsqueda de vídeo: los intervalos temporales generados se pueden usar para indexar vídeos egocéntricos en bases de datos, permitiendo búsquedas por rangos de tiempo o por la estructura de segmentos sin necesidad de etiquetas textuales.
- Detección de cambios de actividad en streaming: con una implementación optimizada, el modelo podría procesar vídeo en tiempo real para detectar cuándo cambia la acción del usuario, habilitando sistemas de asistencia contextual en entornos de trabajo o rehabilitación.

## Benchmarks y rendimiento

El autor reporta una evaluación interna durante el entrenamiento, realizada sobre una muestra de 24 episodios del conjunto de validación (de un total de 300/549 episodios). La métrica principal es el `timestamp_score`, que mide el solapamiento IoU entre los límites temporales predichos y los reales, sin considerar el texto de las acciones.

| Paso de entrenamiento | timestamp_score | eval_loss |
|---|---|---|
| 100 | 0,5638 | 0,1612 |
| 600 | 0,6024 | 0,1594 |
| 1000 | 0,5971 | 0,1522 |
| 1230 (final) | 0,6048 | 0,1523 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El autor menciona que una variante con `lora_r=64` alcanzó 0,5994, inferior al r32 elegido. Para contextualizar, el modelo hermano caption-boundary (que recibe el texto de la acción) logra 0,6868 en la misma muestra, lo que indica que la información semántica mejora significativamente la localización temporal.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa unos 0,8 GB, pero requiere cargar el modelo base Qwen3.6-27B en memoria. En bf16, el modelo base ocupa aproximadamente 55 GB de VRAM (27 600 millones de parámetros × 2 bytes), más los pesos del adaptador y el espacio para el procesador de vídeo.
- Para inferencia con el modelo completo en bf16 se recomienda una GPU con al menos 80 GB de VRAM, como una NVIDIA H100 o A100 de 80 GB. Con `device_map=auto` se puede distribuir entre varias GPU.
- En hardware de consumo (por ejemplo, RTX 4090 con 24 GB) no es posible cargar el modelo base en bf16 sin cuantización. Si se cuantiza el modelo base a 8 bits (por ejemplo, con bitsandbytes), la VRAM necesaria baja a ~28 GB, aún por encima de una RTX 4090; con cuantización a 4 bits (~14 GB) podría caber en una GPU de 24 GB, aunque el autor no ha publicado configuraciones de cuantización para este adaptador.
- Opciones de despliegue: el modelo se integra con la librería PEFT y Transformers, por lo que puede servirse con vLLM, TGI o cualquier framework compatible con Qwen3.6-27B. Para uso local, se puede usar llama.cpp si se convierte el modelo a GGUF, aunque no se proporciona dicha conversión.
- No se dispone de datos de latencia o throughput del modelo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Tarea | timestamp_score | Parámetros entrenables | Contexto |
|---|---|---|---|---|---|
| VR-egodex-qwen36-27b-lora-boundary (este) | Qwen3.6-27B | Localización temporal sin texto | 0,6048 | ~200,3M (LoRA r32) | 40 960 |
| VR-egodex-qwen36-27b-lora-caption-boundary | Qwen3.6-27B | Localización temporal con texto de acción | 0,6868 | no disponible | no disponible |
| VR-egodex-narration-qwen36-27b-lora-vision12-lr1e5 | Qwen3.6-27B | Narración de acciones + límites temporales | no disponible | no disponible | no disponible |

Los dos modelos hermanos del mismo autor son las alternativas más directas. El caption-boundary recibe las descripciones de las acciones y solo debe reajustar los tiempos, lo que explica su mejor puntuación. El modelo de narración genera tanto texto como timestamps, pero no se reportan sus métricas de localización. No hay comparación con otros modelos de localización temporal de vídeo en la información disponible.

## Limitaciones y advertencias

- Es un adaptador especializado en una única tarea (localización temporal de vídeo egocéntrico) y no debe usarse como modelo de propósito general; fuera de esta tarea su comportamiento es impredecible.
- La licencia es `other`, lo que implica que no se especifican los términos de uso. Antes de un despliegue comercial es necesario contactar con el autor o verificar la licencia del modelo base Qwen3.6-27B.
- Los datos de entrenamiento provienen exclusivamente de episodios EgoDex, que representan un dominio concreto (actividades egocéntricas en entornos de realidad virtual). El modelo puede no generalizar bien a otros tipos de vídeo (por ejemplo, cámaras de vigilancia o vídeos de tercera persona).
- La evaluación reportada se basa en una muestra pequeña (24 episodios) y no se ha realizado una evaluación completa sobre el conjunto de validación, por lo que la puntuación de 0,6048 podría no reflejar el rendimiento real.
- Al no generar texto, el modelo no proporciona información sobre qué acción ocurre en cada segmento; si se necesita esa semántica, es preferible usar el modelo caption-boundary.
- Riesgo de alucinación en los límites temporales: el modelo puede predecir intervalos que no se corresponden con cambios reales de acción, especialmente en vídeos con transiciones graduales o acciones solapadas.
- No se ha verificado el comportamiento con vídeos de mayor duración o con resoluciones superiores a las usadas en el entrenamiento (máximo 128 fotogramas a 2 fps).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bi199797/VR-egodex-qwen36-27b-lora-boundary
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo hermano caption-boundary: https://huggingface.co/bi199797/VR-egodex-qwen36-27b-lora-caption-boundary
- Modelo hermano narration: https://huggingface.co/bi199797/VR-egodex-narration-qwen36-27b-lora-vision12-lr1e5
- Código de entrenamiento (VR-finetune-VLM): https://github.com/VietnamFoundationRobotics/VR-finetune-VLM
- Blog de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
