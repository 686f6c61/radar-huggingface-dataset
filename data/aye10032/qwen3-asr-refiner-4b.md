# Aye10032/Qwen3-ASR-Refiner-4B

## Resumen

Qwen3-ASR-Refiner-4B es un modelo de lenguaje especializado en la conversión de transcripciones de reconocimiento automático del habla (ASR) en chino a texto escrito formal y natural. Desarrollado por Aye10032, este modelo parte del base Qwen3-4B de Alibaba y se ha afinado mediante LoRA fusionada con el dataset propio `WenetSpeech-Formal-Text`. Su propósito es resolver el problema de que las salidas de los sistemas ASR suelen contener muletillas, repeticiones, errores de puntuación y estructuras propias del habla oral, que no son adecuadas para su uso directo en documentos, subtítulos o registros formales.

Con 4.022 millones de parámetros y arquitectura transformer densa (no es MoE), el modelo hereda las capacidades de razonamiento y generación del Qwen3-4B original. Está diseñado específicamente para el idioma chino (zh) y se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones adicionales. La relevancia actual radica en la creciente demanda de pipelines de ASR que necesiten un post-procesado de alta calidad para integrar la voz en flujos de trabajo documentales, subtitulado o atención al cliente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la información proporcionada (heredada del base Qwen3-4B, típicamente 32 768 tokens, pero no confirmado) |
| Tipos de cuantización | No especificado (se distribuyen pesos BF16 completos) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo es un fine-tuning del Qwen3-4B, un transformer causal denso con atención de escala completa y mecanismo de mezcla de expertos desactivado (no es MoE). El adaptador LoRA se ha fusionado con los pesos base, de modo que el repositorio contiene pesos completos en BF16 que se pueden cargar directamente con la librería Transformers sin necesidad de PEFT.

El entrenamiento se realizó sobre el dataset `Aye10032/WenetSpeech-Formal-Text`, que contiene pares de transcripciones ASR y su versión formal escrita en chino. La tarea se define como una transformación de estilo: el modelo recibe el texto hablado y debe producir una versión escrita natural, concisa y que preserve el significado original sin añadir información nueva. No se ha publicado información sobre el número de tokens de entrenamiento, la proporción del dataset ni si se aplicaron técnicas de RLHF o DPO; lo único documentado es el uso de LoRA con la misma receta para todas las variantes de la familia.

## Capacidades
- Conversión de texto hablado (transcripciones ASR) a texto escrito formal y natural en chino.
- Normalización de muletillas, repeticiones, interjecciones y estructuras propias de la oralidad.
- Preservación del significado original sin añadir información no presente en el texto de entrada.
- Generación de texto con estilo formal, adecuado para documentos, subtítulos o informes.
- Soporte de formato de chat mediante el patrón de Transformers con system prompt y enable_thinking=False (modo no razonamiento).
- No se ha documentado soporte de tool calling, agentes, visión ni audio; es un modelo de texto puro.

## Casos de uso
- **Post-procesado de transcripciones de reuniones y entrevistas**: las transcripciones ASR crudas se limpian y formalizan para su uso en actas, resúmenes o informes profesionales.
- **Subtitulado de vídeo**: los subtítulos generados automáticamente se refinan para que sean legibles y formales, eliminando muletillas y errores de puntuación.
- **Generación de actas de juntas**: a partir de la transcripción de una reunión, el modelo produce una versión escrita concisa y estructurada, lista para archivo.
- **Accesibilidad de contenidos**: conversión de transcripciones de podcasts o conferencias en texto formal para su publicación en blogs o artículos.
- **Preparación de datos para entrenamiento de otros modelos**: se puede usar para limpiar y normalizar corpus de texto oral y convertirlos en texto escrito de calidad, útil para generar datasets de entrenamiento.
- **Integración en pipelines de atención al cliente**: las conversaciones grabadas y transcritas se formalizan para análisis de calidad o para generar resúmenes de interacción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación sobre conjuntos de prueba estándar (p. ej., MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos de post-procesado ASR. No se puede aportar una tabla de rendimiento numérico.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 8,1 GB de pesos (según tamaño del repositorio), más memoria para activaciones y tokens de entrada/salida. Con cuantización a 8 bits o 4 bits se puede reducir notablemente.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM para ejecución en BF16 (p. ej., RTX 3060 12 GB, RTX 4070, A10), o GPUs con menos VRAM si se usa cuantización (p. ej., RTX 4090, A100).
- Es viable en GPUs de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutar el modelo en BF16 con comodidad.
- Opciones de despliegue: es compatible con Transformers, vLLM (si se adapta), llama.cpp con cuantización GGUF, y otros servidores de inferencia que soporten modelos de la familia Qwen3.
- Latencia y throughput: no se dispone de datos concretos, pero al ser un modelo de 4B de parámetros, en una GPU moderna se espera una generación de decenas de tokens por segundo en modo greedy.

## Comparativa con modelos similares
No se dispone de información suficiente para establecer una comparativa cuantitativa con otras alternativas de post-procesado ASR para chino. La familia Qwen3-ASR-Refiner incluye variantes de 0.6B, 1.7B y 4B, pero no hay benchmarks comparativos publicados en la información disponible. Otros enfoques como la normalización de texto basada en reglas o modelos más pequeños (p. ej., modelos de traducción o de estilo) no se han comparado aquí.

## Limitaciones y advertencias
- El modelo está entrenado específicamente para chino; no soporta otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo afinado sobre un dataset de transcripciones ASR, puede heredar sesgos de los datos de entrenamiento de WenetSpeech.
- Riesgo de alucinación: aunque la tarea está diseñada para no añadir información, el modelo podría introducir cambios sutiles de significado en casos ambiguos; se recomienda validación humana en contextos críticos.
- No se especifican restricciones adicionales más allá de la licencia Apache-2.0, que permite uso comercial y modificación.
- Para producción, se recomienda evaluar el modelo con un conjunto de pruebas propio para medir la fidelidad de la transformación, dado que no hay benchmarks públicos.
- El contexto máximo no está documentado en la información proporcionada, aunque hereda del base Qwen3-4B; se aconseja no superar los 32 768 tokens sin verificación.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/Aye10032/Qwen3-ASR-Refiner-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Aye10032/WenetSpeech-Formal-Text
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3-ASR (familia de ASR, no este modelo concreto): https://github.com/QwenLM/Qwen3-ASR
- Documentación de Qwen3 ASR en Transformers: https://huggingface.co/docs/transformers/main/model_doc/qwen3_asr
- Informe técnico de Qwen3-ASR (arXiv): https://arxiv.org/html/2601.21337v1

Nota: el repositorio GitHub y el informe técnico se refieren a la serie Qwen3-ASR de Alibaba, que es distinta de este modelo de post-procesado, pero se incluyen como referencia relacionada.</think>## Resumen
Qwen3-ASR-Refiner-4B es un modelo de lenguaje especializado en la conversión de transcripciones de reconocimiento automático del habla (ASR) en chino a texto escrito formal y natural. Desarrollado por Aye10032, se basa en el modelo Qwen3-4B de Alibaba y se ha afinado mediante LoRA fusionada sobre el dataset propio `WenetSpeech-Formal-Text`. Su objetivo es resolver el problema de que las salidas de los sistemas ASR suelen contener muletillas, repeticiones, fragmentos de estructura oral y errores de normalización que resultan inadecuados para documentos, subtítulos o informes profesionales.

Con 4.022 millones de parámetros y una arquitectura transformer densa, el modelo conserva las capacidades de generación y razonamiento del base Qwen3-4B, pero está orientado exclusivamente a la tarea de transformación de estilo: convertir texto hablado en texto escrito conciso, natural y fiel al significado original. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones, y está disponible en pesos BF16 completos que se cargan directamente con la librería Transformers.

La relevancia actual del modelo radica en la creciente demanda de pipelines de ASR que requieren un post-procesado de calidad para integrar la voz en flujos de trabajo documentales, de subtitulado o de atención al cliente. Aunque la familia incluye variantes de 0.6B y 1.7B, la versión de 4B ofrece un equilibrio entre calidad de generación y coste computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificado en la información (se hereda del base Qwen3-4B, típicamente 32 768 tokens, no confirmado) |
| Tipos de cuantización | No especificado (se distribuyen pesos BF16) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo es un fine-tuning del Qwen3-4B, que emplea una arquitectura transformer densa con mecanismo de atención global y sin mezcla de expertos. El adaptador LoRA se ha fusionado con los pesos base, por lo que el repositorio contiene los parámetros completos en BF16 y puede cargarse directamente con `AutoModelForCausalLM` sin necesidad de PEFT.

El entrenamiento se realizó sobre el dataset `Aye10032/WenetSpeech-Formal-Text`, que contiene pares de transcripciones ASR y sus correspondientes versiones formales en chino. La tarea se define como una conversión de estilo: el modelo recibe el texto hablado y debe generar una versión formalizada, concisa y sin información añadida. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La model card indica que todas las variantes de la familia se entrenaron con la misma receta y definición de tarea.

## Capacidades
- Conversión de texto hablado (transcripciones ASR) a texto escrito formal y natural en chino.
- Eliminación de muletillas, repeticiones, interjecciones y estructuras propias de la oralidad.
- Preservación del significado original sin añadir información no presente en la entrada.
- Generación de texto conciso y estructurado, apto para documentos, subtítulos o informes.
- Soporte de formato de chat mediante el sistema de Transformers, con roles de system y user, y modo de no razonamiento (`enable_thinking=False`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo; es un modelo de texto puro.

## Casos de uso
- **Post-procesado de transcripciones de reuniones**: las transcripciones ASR crudas se transforman en actas formales y estructuradas, listas para archivo o distribución.
- **Subtitulado de vídeos**: los subtítulos automáticos se normalizan para eliminar muletillas y mejorar la legibilidad, sin alterar el contenido.
- **Generación de documentación a partir de conferencias**: transcripciones de charlas o seminarios se convierten en texto escrito adecuado para publicaciones o resúmenes.
- **Preparación de datasets de NLP**: el modelo puede limpiar y normalizar corpus de texto ASR para crear datos de entrenamiento de alta calidad.
- **Análisis de atención al cliente**: las conversaciones grabadas y transcritas se transforman en texto formal para su posterior análisis de sentimiento o extracción de información.
- **Traducción de contenido oral a escrito**: cualquier flujo que requiera convertir voz en texto escrito profesional, como podcasts o entrevistas, puede integrar este modelo como etapa de refinado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas sobre conjuntos de prueba estándar (MMLU, HumanEval, GSM8K) ni sobre métricas específicas de post-procesado ASR (como WER o BLEU). No se pueden aportar datos numéricos de rendimiento sin inventar información.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 8,1 GB de pesos (según el tamaño del repositorio), más memoria para activaciones y caché de tokens. Con cuantización de 8 bits o 4 bits, el consumo se reduce significativamente.
- GPU recomendadas: una RTX 3060 de 12 GB, RTX 3080 de 12 GB, RTX 4090 (24 GB) o una A100 de 40 GB pueden ejecutar el modelo en BF16 sin problema. Para cuantización, una GPU de 8 GB podría ser suficiente.
- Es compatible con GPUs de consumo: una RTX 4090 o RTX 3090 ejecuta el modelo con comodidad.
- Opciones de despliegue: Transformers, vLLM (si se convierte a formato compatible), llama.cpp con cuantización GGUF, y otros servidores de inferencia que soporten modelos Qwen3.
- Latencia y throughput: no hay datos concretos, pero al ser un modelo de 4B de parámetros, en una GPU moderna se espera una generación de decenas de tokens por segundo en modo no razonamiento.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye comparativas con otros modelos de post-procesado ASR. La familia Qwen3-ASR-Refiner incluye variantes de 0.6B y 1.7B, pero no hay datos de rendimiento relativo publicados. Otros modelos de normalización de texto (p. ej., modelos de traducción o de estilo) no se han comparado con este.

## Limitaciones y advertencias
- El modelo está entrenado exclusivamente para chino; no es útil para otros idiomas.
- No se han documentado sesgos específicos, pero al ser un fine-tuning sobre datos de WenetSpeech, puede heredar sesgos de dominio o de registro presentes en el dataset.
- Riesgo de alucinación: aunque la tarea está diseñada para no añadir información, el modelo podría introducir cambios sutiles de significado en entradas complejas o ambiguas; se recomienda validación humana en contextos críticos.
- No se especifica la longitud de contexto máxima real en la información; se hereda del base Qwen3-4B, pero se debe verificar experimentalmente.
- Para producción, es recomendable evaluar el modelo con un conjunto de validación propio para medir la fidelidad de la transformación, dado que no hay benchmarks públicos.
- La licencia Apache-2.0 permite uso comercial y modificación, sin restricciones adicionales.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/Aye10032/Qwen3-ASR-Refiner-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Aye10032/WenetSpeech-Formal-Text
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de la familia Qwen3-ASR (ASR de Alibaba, distinto de este modelo): https://github.com/QwenLM/Qwen3-ASR
- Documentación de Qwen3 ASR en Transformers: https://huggingface.co/docs/transformers/main/model_doc/qwen3_asr
- Informe técnico de Qwen3-ASR (arXiv): https://arxiv.org/html/2601.21337v1
