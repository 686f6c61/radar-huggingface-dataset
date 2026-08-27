# Echoo113/gemma-3-4b-it-immigration_prompted-ft4.42

## Resumen

El modelo `Echoo113/gemma-3-4b-it-immigration_prompted-ft4.42` es un ajuste fino (fine-tuning) del modelo `google/gemma-3-4b-it`, desarrollado por el usuario Echoo113. Se trata de una adaptación mediante aprendizaje supervisado (SFT) orientada a responder consultas relacionadas con inmigración, probablemente con prompts específicos de ese dominio. El modelo base, Gemma 3 4B, es un transformer multimodal de 4 mil millones de parámetros desarrollado por Google DeepMind, con una ventana de contexto de 128 000 tokens y soporte multilingüe para más de 140 idiomas.

La relevancia de este fine-tuning radica en que permite especializar un modelo generalista en un ámbito concreto (inmigración) sin necesidad de entrenar desde cero, aprovechando las capacidades del modelo base. Sin embargo, la documentación publicada es muy escasa: no se especifican los datos de entrenamiento, el número de pasos, ni se aportan métricas de evaluación. El repositorio tiene un tamaño de 0,2 GB, lo que sugiere que se distribuyen pesos en formato `safetensors` (probablemente cuantizados o con precisión reducida).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3, multimodal texto e imagen) |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors, sin indicacion de cuantizacion) |
| Idiomas soportados | no disponible (el modelo base soporta 140+ idiomas, pero el fine-tune no especifica) |
| Licencia | no disponible (el modelo base usa la licencia Gemma de Google, pero el fine-tune no declara una) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3 4B, un transformer decoder con atención de múltiples cabezas, diseñado para procesar tanto texto como imágenes. El fine-tuning se realizó mediante aprendizaje supervisado (SFT) utilizando la librería TRL (Transformers Reinforcement Learning) de Hugging Face, con el framework Transformers 4.54.0 y PyTorch 2.7.1. No se han publicado detalles sobre el dataset de entrenamiento, el número de épocas, la tasa de aprendizaje ni otras hiperparámetros. El nombre del modelo sugiere que se emplearon prompts específicos sobre inmigración, pero no hay información adicional sobre la composición de los datos ni sobre técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en formato conversacional, siguiendo el formato de chat del modelo base (roles `user` y `assistant`).
- Respuesta a preguntas sobre inmigración, probablemente adaptada a un conjunto de prompts específicos de ese dominio.
- Hereda del modelo base la capacidad de procesar imágenes (multimodal), aunque no se ha verificado si el fine-tuning conserva esta funcionalidad.
- Soporte multilingüe en teoría, pero sin confirmación para el fine-tune.
- No se documenta soporte explícito para tool calling, function calling ni razonamiento multi-paso más allá de lo que ofrece el modelo base.

## Casos de uso

- Asesoramiento automatizado sobre trámites de inmigración: el modelo puede responder preguntas frecuentes sobre visados, residencia o requisitos legales, aprovechando su contexto largo para manejar conversaciones extensas.
- Generación de contenido informativo para organismos de ayuda al inmigrante: redacción de guías o respuestas a consultas comunes en portales web.
- Filtrado y clasificación de consultas de inmigración: dado un texto de entrada, el modelo puede categorizar el tipo de consulta y sugerir respuestas estandarizadas.
- Chatbot para ONGs o servicios públicos: integración en sistemas de atención al ciudadano para resolver dudas iniciales antes de derivar a un especialista.
- Análisis de sentimiento o detección de necesidades en relatos de inmigrantes: el modelo puede extraer información relevante de narraciones personales.
- Entrenamiento de modelos más pequeños mediante destilación: el fine-tune puede servir como profesor para generar datos sintéticos etiquetados en el dominio de inmigración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio de inmigración. Tampoco se comparan con el modelo base ni con otros fine-tunes.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B parámetros en FP16 se requieren aproximadamente 8 GB de VRAM. Con cuantización a 8 bits (INT8) se reduce a unos 4-5 GB, y a 4 bits a unos 2-3 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo sin problemas. También es viable en GPUs de datacenter como A10G o L4.
- Es compatible con GPUs consumer de gama media si se aplica cuantización.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, TGI (Text Generation Inference), o mediante `pipeline` de Hugging Face. También es posible usar llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan dichos formatos.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090, un modelo de 4B en FP16 suele generar entre 50 y 100 tokens por segundo, pero esto depende de la implementación y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Echoo113/gemma-3-4b-it-immigration_prompted-ft4.42 | 4B | 128K | no disponible | Hugging Face |
| Echoo113/Qwen3.5-4B-immigration_prompted-ft4.42 | 4B | no disponible | no disponible | Hugging Face |
| Echoo113/deepseek-llm-7b-chat-immigration_prompted-ft4.42 | 7B | no disponible | no disponible | Hugging Face |
| google/gemma-3-4b-it (base) | 4B | 128K | Gemma license | Hugging Face |

Los tres fine-tunes del mismo autor comparten el mismo propósito (inmigración) pero difieren en el modelo base. El de DeepSeek tiene más parámetros (7B) y probablemente mayor capacidad, pero también mayor coste de inferencia. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican los datos de entrenamiento, el proceso de ajuste ni las métricas de evaluación, lo que dificulta evaluar su fiabilidad.
- Riesgo de alucinación: al ser un fine-tune sin validación publicada, puede generar respuestas incorrectas o inventadas sobre temas legales de inmigración, lo que es especialmente peligroso en un dominio con implicaciones legales.
- Sesgos potenciales: el dataset de entrenamiento no está documentado, por lo que puede contener sesgos demográficos, culturales o políticos.
- Licencia no declarada: aunque el modelo base tiene una licencia Gemma (que permite uso comercial con restricciones), el fine-tune no especifica su propia licencia, lo que genera incertidumbre legal para uso en producción.
- Limitaciones de idioma: aunque el base soporta 140+ idiomas, el fine-tune puede haber sido entrenado solo en inglés u otros idiomas, sin confirmación.
- Sin soporte garantizado para tool calling ni agentes: no se ha verificado que el fine-tuning conserve estas capacidades del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Echoo113/gemma-3-4b-it-immigration_prompted-ft4.42
- Modelo base Gemma 3 4B IT: https://huggingface.co/google/gemma-3-4b-it
- Página oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Fine-tune similar de Qwen3.5-4B: https://huggingface.co/Echoo113/Qwen3.5-4B-immigration_prompted-ft4.42
- Fine-tune similar de DeepSeek 7B: https://huggingface.co/Echoo113/deepseek-llm-7b-chat-immigration_prompted-ft4.42
