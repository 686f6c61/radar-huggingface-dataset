# egck/fortunetelling

## Resumen

El modelo `egck/fortunetelling` es un finetune conversacional del modelo **DeepSeek-R1-Distill-Qwen-7B**, convertido a formato GGUF mediante el framework Unsloth para su ejecución eficiente con llama.cpp. El autor, `egck`, publica este checkpoint con el propósito de ofrecer un modelo orientado a conversación y razonamiento, aunque la model card no especifica el dataset ni la tarea concreta de ajuste fino.

El modelo tiene aproximadamente **7.616 millones de parámetros** y se distribuye únicamente en cuantización Q8_0, lo que lo hace adecuado para inferencia en GPUs de consumo y entornos de servidor con memoria moderada. Al estar basado en la arquitectura Qwen2, hereda las capacidades de razonamiento y generación de texto de dicha familia, pero con el enfoque de razonamiento del destilado de DeepSeek-R1 (cadena de pensamiento, razonamiento matemático y lógico).

La relevancia actual de este modelo reside en su formato GGUF y su compatibilidad con llama.cpp, lo que permite desplegarlo localmente sin dependencias pesadas, en herramientas como Ollama, LM Studio o interfaces propias. Su naturaleza conversacional lo hace apto para chatbots, asistentes y tareas de razonamiento, aunque no se dispone de documentación adicional sobre su entrenamiento o licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, basado en Qwen2) |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo: `DeepSeek-R1-Distill-Qwen-7B.Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Qwen2**, un transformer denso con atención causal estándar, y ha sido ajustado a partir del checkpoint `DeepSeek-R1-Distill-Qwen-7B`. Este checkpoint combina las capacidades de razonamiento del modelo DeepSeek-R1 (que utiliza cadenas de pensamiento extensas) con la base de Qwen2-7B. El finetune fue realizado con la librería **Unsloth**, que optimiza el entrenamiento y la conversión a GGUF, y el archivo resultante está cuantizado en Q8_0.

La model card indica que el comportamiento del token BOS (begin-of-sequence) fue ajustado para garantizar compatibilidad con GGUF y llama.cpp. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El proceso de entrenamiento se describe como "2 veces más rápido" gracias a Unsloth, pero sin más especificaciones.

## Capacidades

- **Razonamiento estructurado**: al estar basado en DeepSeek-R1-Distill, el modelo genera cadenas de pensamiento (chain-of-thought) antes de responder, lo que mejora la precisión en problemas lógicos y matemáticos.
- **Generación de texto conversacional**: está orientado a tareas de diálogo y asistencia, con un tono natural y respuestas contextuales.
- **Soporte de instrucciones**: acepta prompts en formato conversacional y sigue instrucciones de manera adecuada (inferido de su naturaleza finetune).
- **Ejecución local**: al ser GGUF, se puede ejecutar en CPU o GPU con llama.cpp, Ollama, LM Studio, etc.
- **Compatibilidad con plantillas**: incluye soporte para el sistema de plantillas de llama.cpp (`--jinja`).
- **Capacidades de razonamiento matemático y lógico**: heredadas del destilado de R1, aunque no hay benchmarks publicados que lo confirmen en esta versión finetune.

## Casos de uso

- **Chatbot de asistencia personal**: el modelo puede mantener conversaciones multi-turno con un estilo conversacional, aunque su contexto no está documentado; sería adecuado para tareas de ayuda, consulta y acompañamiento.
- **Razonamiento y análisis de problemas**: gracias a su herencia de DeepSeek-R1, puede descomponer problemas complejos (lógicos, matemáticos, de planificación) en pasos intermedios antes de dar la respuesta final.
- **Generación de contenido creativo**: el modelo puede escribir historias, guiones o diálogos, aprovechando su capacidad de generación de texto fluida.
- **Asistente de programación**: aunque no se ha verificado su rendimiento en código, al ser una base Qwen-7B puede ayudar con generación de código, explicaciones y depuración (requiere prueba empírica).
- **Análisis de documentos**: con un contexto largo (aunque no documentado), podría resumir textos o extraer información de documentos extensos si se configura adecuadamente.
- **Prototipado de aplicaciones de IA**: por su formato GGUF y su tamaño moderado, es útil para desarrolladores que quieren probar modelos de razonamiento en entornos locales o de bajo coste sin depender de APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El rendimiento real en tareas específicas debe ser evaluado por el usuario.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el archivo Q8_0 de 7,6 B de parámetros ocupa aproximadamente 8,1 GB en disco. Para inferencia en GPU, se recomienda al menos **10-12 GB de VRAM** para la carga del modelo y los estados de la atención.
- **GPU recomendadas**: una RTX 3060 12 GB, RTX 4070 12 GB, RTX 4090 24 GB o superior. También puede ejecutarse en GPU de 8 GB (como RTX 3070) con contexto corto, pero puede haber riesgo de OOM.
- **CPU**: es posible ejecutarlo en CPU con llama.cpp, aunque la velocidad será menor. Se recomienda un procesador moderno con al menos 16 GB de RAM.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python, vLLM (si se convierte a otro formato), o servidores compatibles con GGUF.
- **Latencia y throughput**: no hay datos publicados. En una RTX 4090, se puede esperar una velocidad de generación de unos 30-50 tokens/segundo (estimación basada en modelos similares de 7B en Q8), pero no está verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| **egck/fortunetelling** | 7,6 B | No disponible | GGUF (Q8) | No disponible | Finetune de DeepSeek-R1-Distill-Qwen-7B |
| **DeepSeek-R1-Distill-Qwen-7B** | 7,6 B | 32k (típico de Qwen2) | Safetensors, GGUF | MIT (DeepSeek) | Modelo base sin finetune, con razonamiento |
| **Qwen2.5-7B-Instruct** | 7,6 B | 32k | Safetensors, GGUF | Apache 2.0 | Modelo instruct generalista de Alibaba |

La comparativa es limitada porque no se dispone de benchmarks ni del dataset de finetune del modelo. El modelo base (DeepSeek-R1-Distill-Qwen-7B) tiene una licencia MIT y contexto de 32k, pero este finetune puede haber modificado esos parámetros, por lo que no se puede afirmar con certeza.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo, lo que impide conocer si es apto para uso comercial. Se debe contactar con el autor antes de usar en producción.
- **Sin documentación de sesgos**: no hay información sobre el dataset de entrenamiento, por lo que los sesgos y alucinaciones son desconocidos. El modelo puede generar contenido incorrecto o sesgado.
- **Riesgo de alucinación**: como todo LLM, puede inventar hechos o dar respuestas plausibles pero erróneas, especialmente en temas de conocimiento factual.
- **Contexto no documentado**: la longitud de contexto no se especifica. Si no se configura correctamente en llama.cpp, puede haber cortes de contexto inesperados.
- **Sin verificación de capacidades**: las capacidades de razonamiento se infieren del modelo base, pero el finetune puede haber degradado o alterado el comportamiento.
- **Uso en producción**: la falta de documentación técnica (dataset, hiperparámetros, evaluación) dificulta su uso en entornos críticos sin una evaluación previa exhaustiva.

## Enlaces

- **HuggingFace**: [https://huggingface.co/egck/fortunetelling](https://huggingface.co/egck/fortunetelling)
- **Unsloth (framework de entrenamiento)**: [https://github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)
- **Modelo similar**: [https://huggingface.co/lccwz-ai/fortunetelling](https://huggingface.co/lccwz-ai/fortunetelling)
- **Documentación de llama.cpp**: [https://github.com/ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)

Nota: la información proporcionada es insuficiente para una evaluación técnica completa. Se recomienda descargar el modelo y realizar pruebas empíricas antes de cualquier uso.
