# JasonYang66/VLAct-Qwen3VL4B-Pretrained

## Resumen

VLAct Qwen3-VL-4B Pretrained es un checkpoint de continual-pretraining para modelos de visión-lenguaje-acción (VLA) desarrollado por JasonYang66. Se basa en el modelo StarVLA/Qwen3-VL-4B-Instruct-Action, que a su vez parte del backbone multimodal Qwen3-VL-4B de Alibaba. Este checkpoint no es una política de robot lista para desplegar, sino una inicialización intermedia de 100.000 pasos de entrenamiento, diseñada para transferir conocimiento a tareas robóticas downstream mediante fine-tuning.

El modelo se enmarca en la línea de investigación de pretraining continuo para VLA multi-embodiment, es decir, capaz de manejar distintos tipos de robots (brazos, pinzas, etc.) con una representación de acción continua y adaptada a cada embodiment. Incorpora tres cabezas de acción simultáneas (OFT, GR00T y PI) y se entrena con una mezcla de datos heterogéneos de AgileX/ALOHA, Franka, OXE DROID y otros, además de supervisión imagen-texto. Su relevancia radica en que permite inicializar políticas robóticas con un conocimiento previo más rico que el entrenamiento desde cero, reduciendo el tiempo y los datos necesarios para adaptarse a nuevas tareas.

El checkpoint está disponible bajo licencia Apache 2.0 y el repositorio incluye los archivos de configuración y estadísticas necesarios para continuar el entrenamiento o transferir la interfaz VLM a nuevas arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StarVLA `QwenHybrid_xrobot_padding` (basado en Qwen3-VL-4B-Instruct-Action) |
| Parametros totales | No disponible (backbone Qwen3-VL-4B, aproximadamente 4B, más cabezas de acción) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-4B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (checkpoint de entrenamiento, no cuantizado) |
| Idiomas soportados | No disponible (el modelo base Qwen3-VL soporta múltiples idiomas, pero no se especifica para este checkpoint) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint `.pt` en `checkpoints/steps_100000_pytorch_model.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura híbrida de StarVLA sobre el backbone Qwen3-VL-4B-Instruct-Action. Se compone de un codificador visual y un modelo de lenguaje congelados (capas 0-17), más una interfaz VLM entrenable y tres cabezas de acción continuas: OFT, GR00T y PI, co-entrenadas con pesos de pérdida 1:1:1. La representación de acción es continua y utiliza un layout con padding específico por embodiment, con dimensiones de acción 20D y estado 14D, y un horizonte de acción de 50 pasos.

El entrenamiento de continual-pretraining se realizó durante 100.000 pasos con un batch de 16 por GPU en 4 nodos de 8 GPUs (32 GPUs en total). La mezcla de datos VLA, identificada como `agilex_franka_5data_manualvel_balance33_66_50`, combina datos de AgileX/ALOHA, RoboCoin, OXE DROID y Franka, con pesos balanceados y prompts adaptados a cada embodiment. Además, se incluyó supervisión imagen-texto de ShareGPT4V-COCO y LLaVA-ReCap CC3M con una escala de pérdida VLM de 0.2. El optimizador fue AdamW con 5.000 pasos de warmup y schedule coseno, con tasas de aprendizaje de 1e-5 para la interfaz Qwen-VL y 1e-4 para las capas de acción/base. Las pérdidas angulares de articulaciones usan diferencias de ángulo mínimo envueltas, con un peso de 0.5 para la pérdida de endpoint wrap.

## Capacidades

- Percepción visual y razonamiento multimodal: al estar basado en Qwen3-VL, hereda capacidades de comprensión de imágenes y texto, aunque el checkpoint está orientado a robótica.
- Generación de acciones continuas para robots: produce comandos de acción (posiciones, velocidades, pares) para múltiples embodiments (brazos, pinzas, etc.).
- Multi-embodiment: entrenado con datos de distintos robots (AgileX, ALOHA, Franka, DROID), lo que permite transferir conocimiento entre plataformas.
- Tres cabezas de acción simultáneas: OFT, GR00T y PI, que ofrecen diferentes representaciones de acción y pueden usarse según la tarea.
- Soporte para fine-tuning downstream: diseñado para inicializar políticas robóticas específicas, restaurando solo la interfaz VLM compartida.
- No es un modelo de chat ni de generación de texto general: su salida son acciones, no texto libre.

## Casos de uso

- Inicialización de políticas robóticas para manipulación: el checkpoint puede usarse como punto de partida para fine-tuning en tareas como agarre, apilado o ensamblaje, reduciendo el tiempo de entrenamiento respecto a partir de cero.
- Transferencia entre embodiments: al haber sido entrenado con datos de múltiples robots, permite adaptar una política a un nuevo robot con menos datos, restaurando la interfaz VLM y reentrenando solo la cabeza de acción.
- Investigación en continual-pretraining VLA: sirve como referencia para estudiar cómo el pretraining continuo afecta al rendimiento downstream en robótica.
- Desarrollo de políticas dual-arm: los pesos de pérdida diferenciados (8.0 para single-arm, 1.0 para dual-arm) permiten experimentar con tareas bimanuales.
- Benchmarking de arquitecturas de acción: al incluir tres cabezas (OFT, GR00T, PI), se puede comparar su eficacia en distintas tareas robóticas.
- Entrenamiento de robots en simulación: el checkpoint puede inicializar políticas en entornos simulados (por ejemplo, MuJoCo o Isaac) antes de transferirlas al mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento en tareas robóticas estándar (como RLBench, LIBERO o simulación) ni comparaciones con otros modelos VLA.

## Requisitos de hardware

- No se especifican requisitos de hardware para inferencia en la model card.
- Al ser un checkpoint de entrenamiento (no un modelo de inferencia optimizado), no está pensado para despliegue directo; requiere fine-tuning y adaptación a un robot concreto.
- El entrenamiento se realizó con 4 nodos de 8 GPUs (32 GPUs en total), lo que sugiere que el pretraining completo requiere hardware de alto rendimiento (probablemente A100 o H100, aunque no se indica).
- Para fine-tuning downstream, se necesitaría al menos una GPU con suficiente VRAM para el modelo de 4B (por ejemplo, 16-24 GB), pero no hay datos oficiales.
- Opciones de despliegue: no aplicable directamente; el checkpoint debe convertirse a un formato de inferencia (por ejemplo, mediante vLLM o TGI) tras el fine-tuning, pero no se documenta.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos VLA en la información proporcionada. Modelos como OpenVLA, RT-2 o π0 podrían ser comparables, pero no hay datos concretos de rendimiento ni especificaciones para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No es una política desplegable directamente: requiere un adaptador de embodiment, normalización, contrato de cámara y layout de acción específicos, como se indica en la model card.
- Los action heads de pretraining (OFT, GR00T, PI) no deben cargarse en cabezas downstream incompatibles: el layout de acción padded de 20D y las dimensiones de atención oculta/cruzada son específicos de este pretraining.
- Riesgo de alucinación visual: al ser un modelo VLA, puede generar acciones incorrectas si la percepción visual falla o si el contexto no es claro.
- Sesgos de los datos de entrenamiento: la mezcla de datos proviene de conjuntos específicos (AgileX, Franka, DROID), lo que puede limitar la generalización a otros robots o entornos no representados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas estándar, por lo que su eficacia debe validarse empíricamente en cada caso de uso.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL tiene su propia licencia (Apache 2.0 también, según la información pública), aunque se recomienda verificar los términos del modelo base.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un lanzamiento reciente o poco difundido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JasonYang66/VLAct-Qwen3VL4B-Pretrained
- Modelo base StarVLA: https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action (referenciado en la model card, no verificado)
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL (referencia del backbone, no específico de este checkpoint)
