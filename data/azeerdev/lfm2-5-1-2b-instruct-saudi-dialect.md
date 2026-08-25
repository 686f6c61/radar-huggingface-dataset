# AzeerDev/LFM2.5-1.2B-Instruct-Saudi-Dialect

## Resumen

LFM2.5-1.2B-Instruct-Saudi-Dialect es un modelo de lenguaje afinado por AzeerDev sobre el modelo base LFM2.5-1.2B-Instruct de Liquid AI, especializado en la generación de conversaciones en dialecto saudí del árabe. El modelo base pertenece a la familia LFM2.5, que combina arquitectura híbrida de espacio de estados y atención, diseñada para inferencia rápida en dispositivos con recursos limitados. Con aproximadamente 1,17 mil millones de parámetros y una ventana de contexto de 32 768 tokens, este afinamiento busca mejorar la fluidez, autenticidad dialectal y el seguimiento de instrucciones en árabe regional.

La relevancia de este modelo radica en su capacidad para abordar un nicho específico: el árabe dialectal, que difiere significativamente del árabe estándar moderno (MSA). Los modelos multilingües generalistas suelen mostrar deriva hacia el MSA, por lo que un afinamiento con datos conversacionales del dialecto saudí permite obtener respuestas más naturales y contextualmente apropiadas para aplicaciones de chatbot, atención al cliente y asistentes conversacionales en la región. Al estar basado en un modelo compacto, puede ejecutarse en CPU, dispositivos móviles y entornos edge, lo que facilita su despliegue en producción con costes reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida state-space + atención (LFM2.5) |
| Parametros totales | ~1,17 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | No disponible (se menciona inferencia en CPU con <1 GB, pero sin especificar formatos) |
| Idiomas soportados | Árabe (dialecto saudí) y multilingüe (heredado del base) |
| Licencia | No disponible (se indica "misma que el modelo base", pero no se especifica cuál) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct emplea una arquitectura híbrida que combina capas de espacio de estados (state-space) con mecanismos de atención, optimizada para inferencia eficiente en dispositivos edge. El preentrenamiento del base se realizó con aproximadamente 28 billones de tokens, cubriendo múltiples idiomas, incluido el árabe. Sobre esta base, el afinamiento se llevó a cabo mediante Supervised Fine-Tuning (SFT) con la técnica LoRA, utilizando el dataset `HeshamHaroon/saudi-dialect-conversations`, compuesto por pares instrucción-respuesta en dialecto saudí. La configuración de entrenamiento incluyó 4 épocas, una tasa de aprendizaje de 2e-4, tamaño de lote de 16, acumulación de gradientes de 4, optimizador AdamW, programador lineal con warmup del 3 %, longitud de secuencia de 8096 tokens y precisión FP16. El entrenamiento se realizó en una GPU NVIDIA A100 de 40 GB.

## Capacidades

- Generación de texto conversacional en dialecto saudí con alta autenticidad léxica y fluidez.
- Seguimiento de instrucciones en árabe dialectal, adaptado a patrones conversacionales regionales.
- Soporte de tool calling y function calling, heredado del modelo base LFM2.5-1.2B-Instruct.
- Capacidad para tareas de agente y razonamiento multi-paso, aunque limitada por el tamaño del modelo.
- Multilingüismo básico: conserva las capacidades multilingües del base, pero con sesgo hacia el árabe saudí.
- Inferencia rápida y de bajo consumo, apta para entornos con recursos restringidos.

## Casos de uso

- Chatbots de atención al cliente en Arabia Saudí: el modelo puede gestionar conversaciones multi-turno en dialecto saudí, reduciendo la fricción con usuarios que prefieren su variedad local frente al árabe estándar. Su ventana de 32 768 tokens permite mantener contexto en diálogos largos.
- Asistentes virtuales para comercio electrónico: integrado en plataformas de venta online, puede responder consultas sobre productos, envíos y devoluciones en un tono natural y cercano al cliente saudí.
- Sistemas de generación de diálogos para investigación en PLN: útil para crear datasets sintéticos o simular conversaciones en dialecto saudí, facilitando el desarrollo de otros modelos o sistemas de análisis.
- Pipelines de RAG (Retrieval-Augmented Generation) con conciencia dialectal: al combinarse con un buscador, puede responder preguntas sobre documentos locales (normativas, servicios) en dialecto saudí, mejorando la accesibilidad.
- Aplicaciones educativas de aprendizaje de árabe dialectal: el modelo puede generar ejemplos de conversación auténticos para estudiantes o hablantes no nativos que deseen practicar el dialecto saudí.
- Prototipos de agentes conversacionales en dispositivos móviles: gracias a su tamaño reducido, puede ejecutarse en smartphones o dispositivos edge, ofreciendo asistencia sin conexión o con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La model card solo menciona una evaluación cualitativa que indica mejoras en fluidez dialectal, reducción de la deriva hacia el árabe estándar, mejor tono conversacional y mayor autenticidad léxica. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este afinamiento específico.

## Requisitos de hardware

- Inferencia en CPU: posible con menos de 1 GB de memoria si se cuantiza, según la model card.
- Dispositivos móviles y NPUs: el modelo está diseñado para ejecutarse en edge, por lo que es compatible con smartphones y hardware de bajo consumo.
- GPU recomendada para inferencia: no se especifica, pero por su tamaño (~1,17B parámetros) puede ejecutarse en GPUs de consumo como RTX 3060 o superiores con cuantización.
- Entrenamiento: se utilizó 1 × NVIDIA A100 de 40 GB, 8 cores de CPU y 16 GiB de RAM.
- Opciones de despliegue: compatible con transformers, TRL, y potencialmente con vLLM, llama.cpp u Ollama, aunque no se mencionan explícitamente.
- Latencia y throughput: no se proporcionan datos concretos, pero la arquitectura híbrida del base está optimizada para baja latencia en dispositivos edge.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (base) | ~1,17B | 32 768 | Multilingüe, instrucciones, tool calling | No disponible |
| LFM2.5-1.2B-Instruct-Saudi-Dialect (este) | ~1,17B | 32 768 | Dialecto saudí conversacional | No disponible |
| AyoubChLin/lfm2.5-saudi-dialect | ~1,17B | 32 768 | Dialecto saudí (afinamiento similar) | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos. El afinamiento específico para dialecto saudí es una diferenciación clave frente al base, pero no hay métricas objetivas que cuantifiquen la mejora.

## Limitaciones y advertencias

- Sesgo dialectal: el modelo está especializado en el dialecto saudí, por lo que puede no ser adecuado para otros dialectos árabes (egipcio, marroquí, etc.) y puede mostrar un rendimiento inferior en árabe estándar.
- Alucinaciones: al ser un modelo pequeño (~1,17B), tiene una profundidad factual limitada y puede generar información inventada, especialmente en tareas de conocimiento sin recuperación externa.
- Razonamiento complejo: su capacidad para tareas de razonamiento multi-paso o matemáticas avanzadas es limitada en comparación con modelos más grandes.
- Sesgos culturales: el dataset de entrenamiento puede introducir sesgos culturales específicos de la región saudí, lo que debe tenerse en cuenta en aplicaciones sensibles.
- Licencia no especificada: no se indica la licencia exacta, lo que puede generar incertidumbre para uso comercial. Se recomienda consultar la licencia del modelo base de Liquid AI.
- Riesgo de contenido tóxico: como cualquier modelo de lenguaje, puede generar respuestas inapropiadas si se le provoca maliciosamente; se recomienda añadir capas de moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AzeerDev/LFM2.5-1.2B-Instruct-Saudi-Dialect
- Modelo base LFM2.5-1.2B-Instruct: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación oficial de LFM2.5-1.2B-Instruct: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Dataset utilizado: https://huggingface.co/datasets/HeshamHaroon/saudi-dialect-conversations
- Afinamiento similar de otro autor: https://huggingface.co/AyoubChLin/lfm2.5-saudi-dialect
