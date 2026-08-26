# cgcristi0/gemnard3-4b

## Resumen

Gemnard3-4b es un ajuste fino (fine-tune) del modelo `google/gemma-3-4b-it` realizado por el autor cgcristi0. El objetivo es transformar el modelo base en una "persona" conversacional divertida y natural, entrenada sobre un dataset propio llamado Gemnard3 que enfatiza chistes, longitudes de respuesta variadas, formato natural y uso moderado de emojis. Se trata de un modelo de chat pensado para entornos informales y de entretenimiento, no para tareas técnicas de alto riesgo.

El modelo se distribuye en tres formatos: el adaptador LoRA, los pesos fusionados en safetensors y una versión cuantizada GGUF Q4_K_M. Con 4.551.515.648 parámetros (aproximadamente 4,55 mil millones), hereda la arquitectura y la ventana de contexto de Gemma 3 4B, que alcanza 128.000 tokens. La licencia es Gemma, la misma que el modelo base, lo que condiciona su uso comercial según los términos de Google.

Aunque el modelo base Gemma 3 4B es multimodal y multilingüe, la model card del fine-tune no especifica si estas capacidades se conservan tras el ajuste. El autor incluye "smoke tests" grabados como ejemplos de uso, pero aclara que no constituyen una certificación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 4B) |
| Parametros totales | 4.551.515.648 (4,55 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | Q4_K_M (GGUF), safetensors (FP16/BF16) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero el fine-tune no lo especifica) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors, GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only con atención multi-query y 4,55 mil millones de parámetros. El fine-tune se realizó mediante un adaptador LoRA (Low-Rank Adaptation), que permite ajustar el comportamiento del modelo con un coste computacional reducido. El dataset Gemnard3, según la model card, se centra en generar respuestas con un tono humorístico, longitudes variables, formato natural y uso "ganado" de emojis (es decir, emojis que aparecen de forma justificada en el contexto).

No se proporcionan detalles sobre el número de tokens de entrenamiento, el número de épocas, la tasa de aprendizaje ni el método de alineación (RLHF, DPO, etc.). El autor indica que el lanzamiento incluye el adaptador LoRA, los pesos fusionados, el GGUF Q4_K_M y pruebas de humo grabadas, pero no hay información sobre innovaciones técnicas adicionales más allá del ajuste de personalidad.

## Capacidades

- Generacion de texto conversacional con tono humoristico y natural, orientado a interacciones informales.
- Variacion en la longitud de las respuestas, adaptandose al contexto del dialogo.
- Uso de emojis de forma contextual y moderada, segun el dataset de entrenamiento.
- Soporte de tool calling / function calling: no especificado en el fine-tune, aunque el modelo base Gemma 3 4B si lo incluye.
- Capacidades multilingues: no confirmadas en el fine-tune; el modelo base soporta multiples idiomas, pero no hay evidencia de que el ajuste las preserve.
- Capacidades de vision: el modelo base es multimodal, pero el fine-tune no menciona si se mantiene el procesamiento de imagenes.
- Modo de razonamiento (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Chatbot de entretenimiento en redes sociales o aplicaciones de mensajeria: el modelo puede mantener conversaciones ligeras y divertidas con usuarios, gracias a su tono humoristico y a la variabilidad en la longitud de las respuestas.
- Asistente virtual con personalidad para comunidades de Discord o Twitch: su capacidad para generar respuestas naturales y con emojis lo hace adecuado para moderar o animar chats en vivo.
- Generacion de contenido creativo: puede producir dialogos, micro-relatos o respuestas ingeniosas para campañas de marketing o redes sociales, aprovechando su entrenamiento en chistes y formato natural.
- Prototipado rapido de agentes conversacionales: al ser un modelo de 4,55 B con soporte GGUF, puede desplegarse en entornos de desarrollo para probar interacciones humoristicas antes de escalar a modelos mayores.
- Educacion informal: puede utilizarse como herramienta de practica de conversacion en idiomas, aunque su enfoque humoristico limita su utilidad en contextos academicos serios.
- Integracion en aplicaciones de escritorio o moviles con recursos limitados: gracias a la cuantizacion Q4_K_M, puede ejecutarse en GPUs de consumo medio, permitiendo asistentes locales con personalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este fine-tune. Los "smoke tests" mencionados son ejemplos de uso, no mediciones de rendimiento. Para referencia, el modelo base Gemma 3 4B obtiene resultados competitivos en tareas de razonamiento y codigo, pero estos datos no son extrapolables al fine-tune sin verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16, el modelo ocupa aproximadamente 9,1 GB (4,55 B x 2 bytes). Con cuantizacion Q4_K_M, el peso se reduce a unos 3,5 GB, mas overhead de contexto y activaciones.
- GPU recomendadas: para FP16, una RTX 3090, RTX 4090 o A10 con 24 GB de VRAM es suficiente. Para Q4_K_M, una RTX 3060 con 12 GB o una RTX 4060 Ti con 16 GB pueden ejecutarlo comodamente.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo medio-alto, especialmente en cuantizacion GGUF.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con safetensors o GGUF.
- Latencia y throughput: no se han publicado mediciones especificas. Como referencia, un modelo de 4,55 B en Q4_K_M puede generar entre 20 y 40 tokens por segundo en una RTX 4090 con llama.cpp, dependiendo del tamaño del contexto y del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| cgcristi0/gemnard3-4b | 4,55 B | 128K | Chat humoristico | Gemma | safetensors, GGUF |
| cgcristi0/qwenard3-4b | 4,55 B (estimado) | No disponible | Chat humoristico (mismo autor) | No disponible | No disponible |
| google/gemma-3-4b-it | 4,55 B | 128K | Modelo base multimodal y multilingue | Gemma | safetensors |
| Qwen2.5-3B | 3,09 B | 32K | Chat generalista | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en caracteristicas generales, ya que no hay datos de rendimiento publicados para el fine-tune. Gemnard3-4b se diferencia del modelo base por su personalidad humoristica, pero pierde (o al menos no documenta) las capacidades multimodales y multilingues del original. Frente a Qwen2.5-3B, ofrece un contexto mucho mayor (128K frente a 32K) y un tono mas especializado, aunque con una licencia mas restrictiva.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del modelo base Gemma 3 4B, que pueden incluir estereotipos de genero, raza o cultura. El fine-tune sobre un dataset humoristico podria amplificar ciertos sesgos en el tono de las respuestas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos donde se le piden datos factuales. Su entrenamiento orientado al humor aumenta la probabilidad de respuestas no literales.
- Limitaciones de contexto: aunque la ventana es de 128K tokens, el fine-tune no especifica si el entrenamiento con LoRA afecta a la coherencia en contextos muy largos. Se recomienda probar con secuencias extensas antes de usarlo en produccion.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para ciertos casos de uso (por ejemplo, no utilizar para vigilancia masiva). Es obligatorio revisar los terminos completos antes de un despliegue comercial.
- Falta de certificacion de seguridad: el autor indica que los smoke tests son ejemplos, no una certificacion. No hay evaluacion de robustez frente a prompts maliciosos o jailbreaks.
- Idiomas y multimodalidad no confirmados: si se necesita soporte multilingue o procesamiento de imagenes, este fine-tune no garantiza que esas capacidades del modelo base se mantengan tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgcristi0/gemnard3-4b
- Modelo similar del mismo autor (qwenard3-4b): https://huggingface.co/cgcristi0/qwenard3-4b
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-4b-pt
- Pagina de Gemma 3 4B en Together AI: https://www.together.ai/models/gemma-3-4b
- Ficha de Gemma 3 4B en Ollama: https://ollama.com/library/gemma3:4b
- Descripcion de Gemma 3 4B en ValorGPT: https://www.valorgpt.com/models/google-gemma-3-4b-it
