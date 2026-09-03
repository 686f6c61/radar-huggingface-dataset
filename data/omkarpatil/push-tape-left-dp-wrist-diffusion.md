# omkarpatil/push-tape-left-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/push-tape-left-dp-wrist-diffusion` es una política de difusión (diffusion policy) entrenada para control robótico, específicamente para la tarea de empujar cinta adhesiva hacia la izquierda (`push-tape-left`) con el robot ROBOTIS FFW SG2 Rev1. Ha sido desarrollado por Omkar Patil y publicado bajo licencia Apache 2.0, utilizando la librería LeRobot en su versión 0.6.1 con un fork específico para ROBOTIS (`lerobot-cyclo`).

El modelo emplea exclusivamente las cámaras de muñeca (izquierda y derecha) a resolución nativa de 424x240, evitando la necesidad de re-encuadrar las vistas a una resolución común, como sí requiere la variante de tres cámaras. Se trata de un modelo de 278,8 millones de parámetros, entrenado durante 100 000 pasos con un optimizador Adam y scheduler de ruido DDPM, alcanzando una pérdida final de entrenamiento de 0,002.

La relevancia de este modelo radica en su enfoque de normalización compartida: las estadísticas de normalización se agruparon sobre 5 768 fotogramas de los miembros del grupo de composición A (`push-tape-left` y `push-tape-right`), lo que permite componer políticas entre tareas similares siempre que compartan el mismo hash de verificación. Este enfoque es útil para la robótica de imitación y el aprendizaje por demostración en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 278 792 848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; usa ventanas de observación y acción) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Diffusion Policy implementada en LeRobot, que modela la distribución de acciones condicionada a observaciones mediante un proceso de difusión denoising. El scheduler de ruido es DDPM (Denoising Diffusion Probabilistic Models), y el entrenamiento se realizó con un optimizador Adam con tasa de aprendizaje 1e-4, betas (0.95, 0.999) y weight decay 1e-6, con un batch size de 8 y 100 000 pasos. La tasa de datos es de 15 fps.

El entrenamiento se llevó a cabo sobre el dataset `push-tape-left` en formato LeRobot v3.0, convertido desde v2.1. Durante la conversión, las estadísticas de normalización agrupadas se restauraron manualmente, ya que el conversor v2.1→v3.0 regenera estadísticas por tarea y habría reemplazado los valores agrupados. El modelo utiliza normalización min/max para estado y acción (por defecto en Diffusion Policy), mientras que las políticas GR00T para las mismas tareas usan percentiles q01/q99, por lo que la composición cruzada entre arquitecturas no es posible.

Las observaciones provienen de dos cámaras de muñeca (`cam_left_wrist` y `cam_right_wrist`) a resolución nativa 424x240. No se incluye la cámara de cabeza, lo que simplifica el pipeline de datos al mantener una resolución uniforme entre todas las vistas.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones para la tarea de empujar cinta hacia la izquierda, condicionadas a observaciones visuales de las cámaras de muñeca.
- Aprendizaje por demostración: entrenado mediante comportamiento clonado a partir de demostraciones humanas o teleoperadas, sin necesidad de recompensas explícitas.
- Composición entre tareas: al compartir estadísticas de normalización agrupadas con `push-tape-right`, puede componerse con otras políticas del mismo grupo (mismo hash de verificación) para transferencia entre tareas similares.
- Procesamiento visual de baja resolución: opera con imágenes de 424x240, lo que reduce el coste computacional frente a resoluciones mayores.
- Generación de trayectorias suaves: la naturaleza generativa de la difusión permite producir acciones coherentes y multimodales, adecuadas para manipulación robótica.
- Sin capacidades de lenguaje, visión general ni tool calling: es un modelo puramente motor, no un modelo fundacional.

## Casos de uso

- Automatización de tareas de empuje en líneas de montaje: el modelo puede controlar un brazo robótico para empujar componentes (como cintas adhesivas) hacia una posición objetivo, útil en entornos de fabricación repetitiva.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la composición de políticas entre tareas relacionadas, gracias a su esquema de normalización agrupada.
- Validación de pipelines de datos robóticos: al usar exclusivamente cámaras de muñeca, permite evaluar el impacto de la selección de cámaras en el rendimiento de políticas de difusión.
- Desarrollo de sistemas de control con realimentación visual: puede integrarse en arquitecturas de control en bucle cerrado donde las observaciones visuales de muñeca guían la acción en tiempo real.
- Benchmark de robótica en el robot ROBOTIS FFW SG2 Rev1: útil para comparar el rendimiento de Diffusion Policy frente a otras arquitecturas (p. ej., GR00T) en la misma tarea y hardware.
- Entrenamiento de políticas transferibles entre tareas similares: dado el grupo de composición A, puede servir para probar estrategias de fine-tuning o adaptación rápida a `push-tape-right` u otras tareas del mismo grupo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento de 0,002, que no es comparable con métricas estándar de robótica como tasa de éxito o precisión de tarea. No se dispone de comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 278,8 millones de parámetros y pesos en safetensors, una estimación orientativa sería de ~1,1 GB en FP32 (el tamaño del repo es 1,1 GB), pero el consumo real depende del tamaño de lote, resolución de imagen y número de pasos de denoising.
- GPU recomendadas: no se especifican. Dado el tamaño moderado, una GPU de consumo con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) podría ser suficiente para inferencia, aunque no hay confirmación oficial.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del modelo, pero no está verificado.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, por lo que se ejecuta en el entorno de inferencia de LeRobot (Python/PyTorch). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son específicas para modelos de lenguaje.
- Latencia y throughput: no disponibles. La inferencia de diffusion policy requiere múltiples pasos de denoising (típicamente entre 10 y 100), lo que puede limitar la frecuencia de control en tiempo real.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea o con la misma arquitectura dentro del ecosistema LeRobot. El propio autor menciona que las políticas GR00T para las mismas tareas existen, pero no se proporcionan detalles de rendimiento ni parámetros. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado por imitación, hereda los sesgos de las demostraciones utilizadas (p. ej., variabilidad en la forma de ejecutar la tarea).
- Riesgo de alucinación: en el contexto robótico, el equivalente sería generar acciones no seguras o incoherentes fuera de la distribución de entrenamiento. No se han evaluado formalmente estos fallos.
- Limitaciones de contexto: el modelo solo utiliza cámaras de muñeca; no tiene acceso a la cámara de cabeza ni a otras modalidades sensoriales, lo que puede limitar su robustez en entornos con oclusiones o cambios de iluminación.
- Composición restringida: solo puede componerse con políticas que compartan el mismo hash de normalización (`839f172565ff`). No es compatible con políticas GR00T ni con otras arquitecturas que usen estadísticas diferentes.
- Resolución fija: las imágenes de entrada deben ser de 424x240; cualquier cambio de resolución requeriría reentrenamiento o adaptación.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y del fork `lerobot-cyclo`, cuyas licencias deben verificarse por separado.
- Datos de entrenamiento: no se especifica el número total de demostraciones ni la diversidad de los datos, lo que limita la evaluación de su generalización.
- Sin soporte para tareas fuera del grupo de composición: el modelo está especializado en `push-tape-left` y no se ha demostrado su capacidad para otras tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/push-tape-left-dp-wrist-diffusion
- Dataset asociado (discusiones): https://huggingface.co/datasets/omkarpatil/push-tape-left/discussions
- Perfil del autor: https://huggingface.co/omkarpatil/models
- LeRobot (librería de referencia): https://github.com/huggingface/lerobot
- Paper relacionado sobre Diffusion Policy (referencia general): https://arxiv.org/abs/2303.04137 (no confirmado en la información proporcionada, se incluye como referencia estándar de la arquitectura)
