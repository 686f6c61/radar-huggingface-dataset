# CMSManhattan/JiRackPrecisionTokenizer

## Resumen

JiRackPrecisionTokenizer es un tokenizer de byte-level BPE desarrollado por CMSManhattan (inventor: Konstantin Vladimirovich Grabko), diseñado como una extensión del vocabulario de Qwen2.5 y DeepSeek R1. Su propósito es añadir tokens especializados para dominios concretos: robótica y embodiment, tool calling, routing en sistemas RAG con arquitectura MoE, y marcadores de razonamiento estilo DeepSeek R1. El tokenizer amplía el vocabulario base hasta 151.779 tokens, incorporando etiquetas como `<|tool_call_start|>`, `<|action_start|>`, `__SCIENCE__` o `<|fim_prefix|>`, entre otras.

La relevancia de este tokenizer radica en que permite adaptar modelos Qwen2.5 o DeepSeek R1 a tareas específicas sin necesidad de rediseñar el vocabulario completo, facilitando el entrenamiento eficiente en dominios como código (compatible con datasets de Microsoft BigCode), robótica y sistemas de atención al cliente con integración de herramientas. El autor lo comercializa como una solución para instituciones financieras que requieren soberanía de modelo y privacidad de datos.

El repositorio tiene un tamaño de 0.0 GB, lo que indica que solo contiene los archivos del tokenizer (vocab, merges, config) y no pesos de modelo. La licencia es MIT, permitiendo uso comercial y modificación. No se proporcionan métricas de rendimiento ni benchmarks, y la documentación es escasa y con errores tipográficos notables (p. ej., "DeekSeek", "resize function").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer, no modelo completo) |
| Parametros totales | no disponible (no es un modelo, es un tokenizer) |
| Parametros activos | no disponible |
| Longitud de contexto | no especificada; el autor recomienda iniciar con 4K y escalar a 8K |
| Tipos de cuantizacion | no aplicable (tokenizer) |
| Idiomas soportados | multilingual (sin lista detallada) |
| Licencia | MIT |
| Formato de pesos | no aplicable; archivos de tokenizer (vocab.json, merges.txt, tokenizer_config.json) |

## Arquitectura y entrenamiento

El tokenizer utiliza el algoritmo byte-level BPE, el mismo que emplean los modelos Qwen2.5 y DeepSeek R1. Su vocabulario se amplía de los 128.000 tokens base (presumiblemente heredados de Qwen2.5) a 151.779 tokens, añadiendo categorías de tokens especiales:

- Marcadores de razonamiento estilo DeepSeek R1 (no se listan explícitamente, pero se menciona "Added DeekSeek resoning tags").
- Tokens de tool calling: `<|tool_call_start|>`, `<|tool_call_end|>`, `<|tool_result_start|>`, `<|tool_result_end|>`.
- Tokens de robótica y embodiment: `<|action_start|>`, `<|trajectory_start|>`, `<|joint_start|>`, `<|sensor_start|>`, `<|command_start|>`, `<|state_start|>`, `<|pose|>`, `<|velocity|>`, `<|force|>`, `<|torque|>`, `<|gripper|>`, `<|navigation|>`, `<|obstacle|>`, `<|task_start|>`, `<|plan_start|>`, `<|behavior_start|>`, `<|skill_start|>`, `<|motor|>`, `<|servo|>`, `<|imu|>`, `<|lidar|>`, `<|camera|>`, `<|depth|>`, `<|waypoint|>`, `<|path|>`, `<|collision|>`, `<|grasp|>`, `<|release|>`, `<|homing|>`, `<|emergency_stop|>`, `<|calibration|>`, `<|manipulation|>`, `<|locomotion|>`, `<|feedback|>`, `<|control_loop|>`.
- Tokens multimodales: `<|image|>`, `<|video|>`, `<|sound|>`, `<|voice|>`, `<|listening|>`, `<|vision|>`.
- Tokens de estado emocional humano: `<|mood_happy|>`, `<|mood_sad|>`, `<|mood_angry|>`, `<|mood_neutral|>`.
- Tokens de routing RAG para sistemas MoE: `__SCIENCE__`, `__CODING__`, `__STOCK_EXCHANGE__`, `__MEDICINE__`, `__GOVERNMENT__`, `__NEWS__`, `__GENERAL__`, `__MATERIAL_SCIENCE__`, `__ELECTRONICS__`, `__MICROELECTRONICS__`, `__ENGINEERING__`, `__ROBOTICS__`, `__ENERGY__`, `__AUTOMOTIVE__`, `__AVIATION__`, `__MATH__`, `__PYTHON__`, `__C__`, `__CPP__`, `__C_SHARP__`, `__JAVA__`, `__JAVASCRIPT__`, `__TYPESCRIPT__`, `__RUST__`, `__GO__`, `__RUBY__`, `__PHP__`, `__SWIFT__`, `__KOTLIN__`, `__BASH__`, `__SQL__`, `__ASSEMBLY__`, `__PHILOSOPHY__`, `__LITERATURE__`, `__SOCIOLOGY__`, `__PSYCHOLOGY__`, `__POLITICAL_SCIENCE__`, `__CULTURAL_STUDIES__`, `__ETHNOGRAPHY__`, `__HUMAN_RIGHTS__`, `__COMPLIANCE__`, `__MILITARY__`, `__BANKING__`, `__OIL_INDUSTRY__`, `__LIGHT_INDUSTRY__`, `__NATURE__`, `__OCEAN__`, `__SPORT__`, `__CULINARY__`, `__TRAVEL__`, `__HOBBY__`.
- Marcadores FIM (fill-in-the-middle): `<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>` (aunque en el README aparece escrito `<f|im_suffix|>` por error).

No se proporciona información sobre el proceso de entrenamiento del tokenizer (datos, número de tokens, metodología). El autor menciona que "necesita 100k example to fully adapt routing features", lo que sugiere que el tokenizer está diseñado para ser usado como base y luego adaptado mediante entrenamiento adicional con datos específicos.

## Capacidades

- Tokenización byte-level BPE compatible con Qwen2.5 y DeepSeek R1, permitiendo su uso como reemplazo directo del tokenizer original en estos modelos.
- Soporte de tokens especiales para tool calling, lo que permite al modelo generar llamadas a funciones de forma estructurada sin necesidad de inyectar esquemas dinámicos en el contexto.
- Tokens de routing para sistemas RAG con arquitectura MoE, que permiten clasificar consultas por dominio (ciencia, código, finanzas, medicina, etc.) y dirigirlas a expertos específicos.
- Tokens de robótica y embodiment para representar acciones, trayectorias, estados de sensores, comandos de control, etc., facilitando el entrenamiento de modelos de control robótico.
- Marcadores FIM para tareas de completado de código en medio (fill-in-the-middle), compatible con datasets de Microsoft BigCode (The Stack, StarCoder, NextCoder).
- Tokens multimodales (imagen, video, sonido, voz, visión) que podrían servir para futuras extensiones multimodales, aunque no se especifica su uso concreto.
- Tokens de estado emocional para modelar el tono o humor del usuario en conversaciones.

## Casos de uso

- Atención al cliente automatizada con integración de herramientas: el tokenizer incluye tokens de tool calling que permiten al modelo invocar APIs externas (consultas de saldo, reservas, etc.) de forma estructurada, reduciendo la latencia frente a la inyección dinámica de esquemas en el contexto.
- Sistemas RAG con enrutamiento por dominio: los tokens `__SCIENCE__`, `__CODING__`, `__MEDICINE__`, etc. permiten clasificar la consulta del usuario y dirigirla al índice o experto MoE correspondiente, mejorando la precisión de la recuperación.
- Generación de código en producción: los marcadores FIM y la compatibilidad con datasets de código (The Stack, StarCoder) hacen que el tokenizer sea adecuado para entrenar modelos de autocompletado de código en entornos corporativos con requisitos de privacidad.
- Control robótico y planificación de movimientos: los tokens de robótica (`<|action_start|>`, `<|trajectory_start|>`, `<|joint_start|>`, etc.) permiten representar secuencias de acciones y estados de sensores, facilitando el entrenamiento de políticas de control para robots humanoides (Unitree G1, LimX Oli, etc.).
- Modelos financieros soberanos: el autor posiciona el tokenizer como base para que bancos y fintech construyan modelos internos desde cero, manteniendo la privacidad de los datos y la soberanía del modelo.
- Asistentes de voz o multimodalidad: los tokens de audio y visión (`<|voice|>`, `<|image|>`, `<|video|>`) podrían usarse en pipelines que combinen texto con otras modalidades, aunque no hay documentación que detalle su implementación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye comparativas de rendimiento del tokenizer (p. ej., tasa de compresión, precisión de enrutamiento, etc.) ni de modelos entrenados con él.

## Requisitos de hardware

- No aplicable: al tratarse de un tokenizer, no requiere GPU para su uso. La inferencia se realiza sobre el modelo base (Qwen2.5 o DeepSeek R1) al que se acople.
- Para entrenar o adaptar un modelo con este tokenizer, se necesitarían los requisitos de hardware del modelo base elegido (p. ej., Qwen2.5-7B requiere ~16 GB de VRAM en fp16 para inferencia, más para entrenamiento).
- El despliegue se realiza mediante las herramientas estándar de Hugging Face (transformers, tokenizers) o frameworks como vLLM, siempre que soporten el tokenizer personalizado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros tokenizers especializados. Los tokenizers de referencia en el ecosistema son:

| Tokenizer | Vocabulario | Especialización | Licencia |
|---|---|---|---|
| Qwen2.5 tokenizer | ~151.000 (aprox.) | Multilingüe, código, chat | Apache 2.0 |
| DeepSeek R1 tokenizer | ~128.000 | Multilingüe, razonamiento | MIT |
| JiRackPrecisionTokenizer | 151.779 | Robótica, routing RAG, tool calls | MIT |

La principal diferencia es la adición de tokens de dominio específico, pero no hay datos objetivos que demuestren una ventaja cuantitativa sobre los tokenizers base.

## Limitaciones y advertencias

- La documentación es deficiente: el README contiene errores tipográficos (p. ej., "DeekSeek", "resize function") y no explica el proceso de entrenamiento del tokenizer ni cómo se generaron los merges adicionales.
- No se proporcionan métricas de rendimiento ni evidencia empírica de que los tokens añadidos mejoren la precisión en las tareas objetivo.
- El autor recomienda entrenar con "100k example" para adaptar las características de routing, pero no especifica qué datos usar ni cómo evaluar la calidad del enrutamiento.
- El tokenizer está diseñado para ser compatible con Qwen2.5 y DeepSeek R1, pero no se garantiza que funcione correctamente con otras arquitecturas sin modificaciones.
- La licencia MIT permite uso comercial, pero el autor menciona "fix price for FinTech", lo que sugiere que puede haber acuerdos comerciales adicionales fuera del repositorio.
- El repositorio tiene muy pocas descargas (18) y ningún like, lo que indica una adopción comunitaria muy limitada y poca validación externa.
- No hay información sobre sesgos o riesgos de alucinación, aunque al ser solo un tokenizer, estos riesgos recaen en el modelo base al que se acople.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Sitio oficial del autor: http://www.cmsmanhattan.com
- Plataformas de robótica mencionadas (referencias externas):
  - Tiangong: https://english.www.gov.cn/english.www.gov.cn/news/202411/13/content_WS673406e2c6d0868f4e8ece33.html
  - Unitree G1: https://a.co/d/0e4A8YVc
  - LimX Oli: https://www.limxdynamics.com/en/products/oli?channel=option_google_advertising__c-
  - UBT Robot: https://www.ubtrobot.com/en/
  - X-Humanoid: https://www.x-humanoid.com/detail/hskw.html
  - Drone Arrow Air: https://arrowair.com/quiver/
