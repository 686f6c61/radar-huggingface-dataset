# CMSManhattan/JiRackDeltaNetTokenizer

## Resumen

JiRackDeltaNetTokenizer es un tokenizer de tipo Byte-Level BPE desarrollado por CMSManhattan, una organización vinculada a JiRack Technology. A diferencia de un modelo de lenguaje completo, este artefacto se centra exclusivamente en la tokenización, pero incorpora un amplio conjunto de etiquetas (tags) especializadas para dominios como robótica, routing en sistemas RAG, tool calling, y soporte multimodal (imagen, vídeo, sonido). Está diseñado para ser compatible con modelos de la familia Qwen (menciona Qwen 3.8 y Qwen 2.5) y con arquitecturas basadas en DeepSeek R1, aunque no se proporcionan detalles técnicos sobre el entrenamiento del propio tokenizer.

La relevancia de este tokenizer radica en su enfoque en aplicaciones de robótica y sistemas de routing para mezclas de expertos (MoE), así como en su integración con datasets de código como The Stack o StarCoder. Su licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para empresas que necesitan control sobre la tokenización en entornos de producción. Sin embargo, la documentación presenta inconsistencias notables, como valores contradictorios del tamaño del vocabulario, lo que obliga a una verificación cuidadosa antes de su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE |
| Parametros totales | No aplica (tokenizer) |
| Parametros activos | No aplica (tokenizer) |
| Longitud de contexto | No disponible (el tokenizer no define contexto; depende del modelo al que se integre) |
| Tipos de cuantizacion | No aplica (tokenizer) |
| Idiomas soportados | Multilingue (segun la model card) |
| Licencia | MIT |
| Formato de pesos | No disponible (se esperan archivos de tokenizer como tokenizer.json o vocab.json, pero no se especifica) |

Nota: La model card indica un tamaño de vocabulario de 248191 tokens en la seccion "SIZE", pero en "Key Features" menciona 128,000 tokens. Esta discrepancia no esta resuelta en la documentacion.

## Arquitectura y entrenamiento

El tokenizer emplea el algoritmo Byte-Level BPE, que opera sobre bytes en lugar de caracteres Unicode completos, lo que permite manejar cualquier idioma y símbolo sin pérdida de información. La model card no proporciona detalles sobre el corpus de entrenamiento, el número de tokens procesados ni el procedimiento de entrenamiento (por ejemplo, si se usó algún método de subword regularization). Tampoco se especifica la versión exacta de BPE ni si se aplicaron técnicas como byte fallback.

La innovación principal de este tokenizer es la incorporación de cientos de etiquetas especiales (tags) organizadas por dominios: robótica (acciones, trayectorias, sensores, comandos), routing para RAG (categorías como ciencia, código, medicina, etc.), tool calling (inicio y fin de llamadas a herramientas), estados emocionales humanos, y soporte multimodal (imagen, vídeo, sonido). Estas etiquetas se añaden al vocabulario estándar, lo que permite que los modelos que lo utilicen puedan generar o interpretar estas señales de forma estructurada. No se indica si el tokenizer fue entrenado desde cero o si se basa en un tokenizer existente (por ejemplo, el de Qwen o DeepSeek) con extensiones.

## Capacidades

- Tokenización byte-level BPE con vocabulario ampliado (248191 tokens según la sección SIZE, aunque hay discrepancia con 128000).
- Soporte de etiquetas para routing en sistemas RAG y MoE, con categorías predefinidas como `__SCIENCE__`, `__CODING__`, `__ROBOTICS__`, `__MEDICINE__`, etc.
- Etiquetas para tool calling: `<|tool_call_start|>`, `<|tool_call_end|>`, `<|tool_result_start|>`, `<|tool_result_end|>`.
- Etiquetas para robótica y embodiment: acciones, trayectorias, sensores, comandos, estados, etc. (por ejemplo, `<|action_start|>`, `<|trajectory_start|>`, `<|joint_start|>`, `<|sensor_start|>`).
- Etiquetas para soporte multimodal: `<|image|>`, `<|video|>`, `<|sound|>`, `<|voice|>`, `<|vision|>`.
- Etiquetas para estados emocionales humanos: `<|mood_happy|>`, `<|mood_sad|>`, `<|mood_angry|>`, `<|mood_neutral|>`.
- Marcadores FIM (fill-in-the-middle) para generación de código: `<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`.
- Compatibilidad declarada con modelos Qwen (2.5 y 3.8) y DeepSeek R1, así como con datasets de código de Microsoft (The Stack, StarCoder, NextCoder).
- Diseñado para permitir la integración de tool calling a nivel de tokenizer, lo que según el autor mejora la precisión y reduce la latencia frente a la inyección dinámica de esquemas en el contexto.

## Casos de uso

- Entrenamiento de modelos de lenguaje para robótica: el tokenizer incluye etiquetas específicas para acciones, trayectorias, sensores y comandos, lo que permite entrenar modelos que generen secuencias de control para robots humanoides o brazos manipuladores. Por ejemplo, un modelo podría generar `<|action_start|>` seguido de coordenadas y `<|action_end|>` para indicar una instrucción de movimiento.
- Sistemas RAG con routing por dominio: las etiquetas `__SCIENCE__`, `__CODING__`, `__MEDICINE__`, etc., permiten que un modelo clasifique consultas y las enrute al índice o base de conocimiento adecuado. Esto es útil en asistentes empresariales que manejan múltiples dominios.
- Integración de tool calling en asistentes conversacionales: al tener etiquetas nativas para inicio y fin de llamadas a herramientas, el tokenizer facilita que el modelo genere llamadas estructuradas a APIs sin necesidad de inyectar esquemas JSON en el prompt, reduciendo el consumo de tokens y la latencia.
- Generación de código con relleno (FIM): los marcadores `<|fim_prefix|>`, `<|fim_middle|>` y `<|fim_suffix|>` permiten entrenar modelos para completar código en medio de un fragmento, útil en editores con autocompletado inteligente.
- Desarrollo de modelos de IA para banca y fintech: el autor menciona que el tokenizer está diseñado para que instituciones financieras construyan modelos soberanos desde cero, manteniendo la privacidad de los datos. Las etiquetas de routing pueden clasificar transacciones o consultas regulatorias.
- Sistemas de control de robots en tiempo real: las etiquetas de sensores (`<|imu|>`, `<|lidar|>`, `<|camera|>`) y de control (`<|control_loop|>`, `<|feedback|>`) permiten representar estados y comandos en un formato tokenizable, facilitando el entrenamiento de políticas de control con modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre rendimiento en tareas de tokenización (como perplexity o velocidad de tokenización) ni comparaciones con otros tokenizers.

## Requisitos de hardware

- Al ser un tokenizer, no requiere GPU ni VRAM para su uso. Solo necesita cargar el archivo de vocabulario (probablemente de unos pocos cientos de MB) en memoria RAM.
- Puede ejecutarse en cualquier CPU moderna; el coste computacional de tokenizar es mínimo en comparación con la inferencia de un modelo.
- Para integrarlo en un modelo, se necesita el framework correspondiente (Hugging Face Transformers, vLLM, etc.) que soporte tokenizers personalizados.
- No se dispone de datos sobre latencia o throughput específicos, pero al ser una operación de preprocesado, su impacto es despreciable frente al coste del modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros tokenizers. Sin embargo, se puede comparar cualitativamente con tokenizers estándar:

| Tokenizer | Vocabulario | Etiquetas especiales | Licencia | Compatibilidad |
|---|---|---|---|---|
| JiRackDeltaNetTokenizer | 248191 (según SIZE) o 128000 (según Key Features) | Robótica, routing, tool calls, multimodal, emociones | MIT | Qwen, DeepSeek R1 |
| Tokenizer de Qwen2.5 | ~151000 (aprox.) | Solo tokens estándar y de chat | Apache 2.0 | Modelos Qwen |
| Tokenizer de Llama 3 | ~128000 | Solo tokens estándar | Llama 3 License | Modelos Llama |

La principal diferencia es la inclusión de etiquetas especializadas, que no están presentes en los tokenizers estándar. No obstante, la falta de documentación sobre el entrenamiento y las inconsistencias en el tamaño del vocabulario dificultan una evaluación objetiva.

## Limitaciones y advertencias

- Inconsistencias en la documentación: el tamaño del vocabulario se indica como 248191 en una sección y como 128000 en otra, lo que genera confusión sobre el valor real.
- No se especifica el proceso de entrenamiento del tokenizer (corpus, método, hiperparámetros), lo que impide evaluar su calidad frente a alternativas establecidas.
- La compatibilidad declarada con Qwen 3.8 y DeepSeek R1 no está verificada con pruebas públicas; se basa únicamente en afirmaciones del autor.
- Aunque la licencia es MIT, el autor menciona una "suscripción" para actualizaciones del tokenizer, lo que podría implicar restricciones adicionales no reflejadas en la licencia.
- El tokenizer está diseñado para un uso específico (robótica, routing, tool calls), por lo que su vocabulario ampliado puede aumentar el número de tokens en textos generales, afectando la eficiencia en tareas estándar.
- No hay evidencia de que las etiquetas personalizadas sean interpretadas correctamente por los modelos existentes; se requeriría un entrenamiento o fine-tuning específico para aprovecharlas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopción muy limitada y poca validación por parte de la comunidad.

## Enlaces

- [HuggingFace - CMSManhattan/JiRackDeltaNetTokenizer](https://huggingface.co/CMSManhattan/JiRackDeltaNetTokenizer)
- [README de JiRackUltra_14b (menciona el tokenizer)](https://huggingface.co/CMSManhattan/JiRackUltra_14b/blob/main/README.md)
- [JiRack-Ultra-Tokenizer-256K](https://huggingface.co/CMSManhattan/JiRack-Ultra-Tokenizer-256K)
- [JiRack-UltraPro-Tokenizer-512K](https://huggingface.co/CMSManhattan/JiRack-UltraPro-Tokenizer-512K)
- [JiRackUltra_7b (incluye tokenizer.json)](https://huggingface.co/CMSManhattan/JiRackUltra_7b/blob/main/tokenizer.json)
- [JiRackUltra_1b](https://huggingface.co/CMSManhattan/JiRackUltra_1b/tree/main)
