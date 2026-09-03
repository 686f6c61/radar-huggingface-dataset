# ProjectMosiacAI/Hades-2.0-Night2-GGUF

## Resumen

Hades-2.0-Night2-GGUF es un modelo de lenguaje finetuneado a partir de Llama-3.2-3B-Instruct y convertido al formato GGUF mediante la librería Unsloth. Ha sido publicado por el usuario ProjectMosiacAI en Hugging Face, con el objetivo de ofrecer una versión cuantizada y optimizada para inferencia local en entornos con recursos limitados. El repositorio contiene un único archivo GGUF con cuantización Q4_K_M, lo que lo hace adecuado para ejecutarse en CPU o GPU de gama media.

El modelo hereda las capacidades del base Llama 3.2 3B Instruct, que incluye generación de texto, razonamiento y soporte conversacional, aunque no se proporcionan detalles específicos sobre el proceso de finetuning ni sobre los datos utilizados. Su relevancia radica en la facilidad de despliegue gracias al formato GGUF, compatible con herramientas como llama.cpp, Ollama o KoboldCpp, y en su tamaño reducido que permite ejecutarlo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 3B Instruct (transformer decoder) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 soporta 128k, pero no se confirma para este finetune) |
| Tipos de cuantizacion | Q4_K_M (unico archivo incluido) |
| Idiomas soportados | no disponible (se asume multilingue por el base, sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Llama 3.2 3B Instruct, con atención causal estándar y capas de normalización RMSNorm. El finetuning se realizó con la librería Unsloth, que optimiza el entrenamiento mediante kernels de atención y técnicas de reducción de memoria, logrando un entrenamiento aproximadamente 2 veces más rápido que los métodos convencionales. Posteriormente, el modelo fue convertido a formato GGUF con cuantización Q4_K_M, que reduce el tamaño del archivo a aproximadamente 2 GB manteniendo una calidad razonable.

No se dispone de información sobre el dataset de finetuning, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del uso de Unsloth para la conversión.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Llama 3.2 Instruct.
- Razonamiento básico y resolución de problemas simples, aunque limitado por el tamaño de 3B parámetros.
- Soporte de instrucciones y seguimiento de prompts en formato chat (template Jinja incluida).
- Capacidades multilingües presumibles del base, aunque no confirmadas para este finetune.
- No se indica soporte de tool calling, function calling, ni capacidades multimodales (el modelo es solo texto).
- No se menciona modo de razonamiento extendido (thinking mode) ni generación de código especializada.

## Casos de uso

- Chatbot local para asistencia personal: al ser un GGUF de 3B parámetros, puede ejecutarse en una Raspberry Pi o en un portátil sin GPU dedicada, ofreciendo respuestas conversacionales básicas con baja latencia.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden integrarlo en entornos de desarrollo con llama.cpp o Ollama para probar flujos de conversación antes de escalar a modelos mayores.
- Generación de texto creativo en entornos sin conexión: adecuado para redactar borradores, correos o contenido breve en aplicaciones de escritorio.
- Asistente de documentación técnica: puede resumir o reformular textos cortos, aunque su capacidad de razonamiento profundo es limitada.
- Educación y experimentación: útil para estudiantes que quieran entender el funcionamiento de modelos cuantizados y su despliegue en hardware modesto.
- Automatización de tareas simples de NLP: clasificación de texto, extracción de entidades o generación de respuestas plantilla, siempre que el prompt sea claro y la tarea no requiera contexto extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar para este finetune específico. Se recomienda evaluar el modelo en las tareas concretas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M, el modelo ocupa aproximadamente 2 GB en memoria. Para inferencia en GPU se recomienda al menos 4 GB de VRAM para dejar margen al contexto y a los cálculos intermedios.
- GPU recomendadas: cualquier GPU con 4 GB o más, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso iGPUs modernas con suficiente memoria compartida. También puede ejecutarse en CPU con 8 GB de RAM.
- Compatibilidad con hardware de consumo: sí, es uno de los puntos fuertes del formato GGUF. Funciona en ordenadores personales, portátiles y SBC como Raspberry Pi 5 (aunque con menor velocidad).
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (incluye Modelfile), KoboldCpp, LM Studio, o servidores compatibles con la API de OpenAI mediante endpoints de llama.cpp.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 3060) se espera una generación de 20-40 tokens por segundo; en CPU, entre 5-15 tokens por segundo dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hades-2.0-Night2-GGUF | 3.2B | no disponible | Q4_K_M | no disponible | Hugging Face |
| Llama-3.2-3B-Instruct (original) | 3.2B | 128k | no aplica (safetensors) | Llama 3.2 Community License | Hugging Face |
| Phi-3-mini-4k-instruct | 3.8B | 4k | GGUF disponible | MIT | Hugging Face |
| Qwen2.5-3B-Instruct | 3.1B | 32k | GGUF disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La elección dependerá de la licencia, el contexto y las capacidades específicas que necesite el usuario. Hades-2.0-Night2-GGUF se distingue por su formato GGUF listo para usar, pero carece de documentación sobre el finetuning.

## Limitaciones y advertencias

- No se ha publicado información sobre el proceso de finetuning, los datos utilizados ni la licencia, lo que impide evaluar su seguridad y legalidad para uso comercial.
- Al ser un modelo de 3B parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas o generación de código extenso es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinaciones y respuestas inexactas, especialmente en temas especializados o con prompts ambiguos.
- La longitud de contexto no está confirmada; aunque el base soporta 128k, el finetune podría haber reducido la ventana efectiva.
- No se garantiza el soporte multilingüe real; se recomienda probar con los idiomas de interés.
- La ausencia de benchmarks y de una model card detallada dificulta la comparación objetiva con otras alternativas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ProjectMosiacAI/Hades-2.0-Night2-GGUF
- Repositorio de la versión anterior (Night1): https://huggingface.co/ProjectMosiacAI/Hades-2.0-Night1
- Librería Unsloth: https://github.com/unslothai/unsloth
- KoboldCpp (cliente GGUF): https://github.com/LostRuins/koboldcpp
