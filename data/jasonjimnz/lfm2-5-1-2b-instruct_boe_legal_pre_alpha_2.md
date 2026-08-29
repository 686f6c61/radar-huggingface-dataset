# jasonjimnz/LFM2.5-1.2B-Instruct_boe_legal_pre_alpha_2

## Resumen

LFM2.5-1.2B-Instruct_boe_legal_pre_alpha_2 es un ajuste fino (fine-tune) del modelo LFM2.5-1.2B-Instruct de Liquid AI, orientado a dominios legales en español, concretamente al Boletín Oficial del Estado (BOE). El autor, jasonjimnz, ha entrenado el modelo con un conjunto de datos ampliado de 20 000 entradas y lo ha convertido a formato GGUF mediante Unsloth para su uso con llama.cpp. Se encuentra en fase pre-alpha y aún no ha sido probado, por lo que su rendimiento real no está verificado.

El modelo base, LFM2.5-1.2B-Instruct, es un modelo compacto de 1,17 mil millones de parámetros con arquitectura híbrida de convolución y atención, ventana de contexto de 32 000 tokens y soporte para tool calling. Este fine-tune hereda dichas capacidades, aunque la adaptación específica a terminología legal española es su principal propuesta de valor. Su tamaño reducido permite ejecutarlo en hardware de consumo, lo que lo hace atractivo para aplicaciones de procesamiento de documentos legales en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida conv+attention (LFM2.5) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | F16, Q4_K_M |
| Idiomas soportados | no disponible (el fine-tune sugiere español legal, pero no está confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2.5 de Liquid AI, que combina capas de convolución con mecanismos de atención, un diseño híbrido que busca eficiencia computacional sin sacrificar la calidad en tareas de razonamiento y generación. El modelo original fue preentrenado con un corpus extenso y posteriormente ajustado con instrucciones y refuerzo, según la documentación de Liquid AI.

El fine-tune realizado por jasonjimnz añade una capa de adaptación a dominios legales españoles, utilizando un dataset de 20 000 entradas (según la model card). No se especifican los detalles del entrenamiento (épocas, método de ajuste, etc.). El proceso de conversión a GGUF se realizó con Unsloth, que optimiza la velocidad de entrenamiento e inferencia. El modelo se encuentra en fase pre-alpha y no ha sido evaluado formalmente.

## Capacidades

- Generación de texto y chat conversacional, heredadas del modelo base LFM2.5-1.2B-Instruct.
- Soporte de tool calling / function calling, según la documentación del modelo base.
- Ventana de contexto de 32 000 tokens, adecuada para documentos legales extensos.
- Capacidades multilingües del modelo base (no confirmadas para este fine-tune).
- Adaptación potencial a terminología legal española (BOE), aunque sin validación.
- Compatible con llama.cpp y endpoints compatibles (según tags del repositorio).

## Casos de uso

- Análisis de documentos legales: el modelo puede procesar textos del BOE, resoluciones o contratos, extrayendo cláusulas relevantes o resumiendo contenido jurídico, gracias a su ventana de 32 000 tokens.
- Asistente legal para consultas ciudadanas: integrado en un chatbot, puede responder preguntas sobre trámites administrativos o normativa vigente, aunque su precisión no está verificada.
- Clasificación de sentencias o disposiciones: mediante fine-tune adicional o prompting, podría categorizar documentos legales por tipo, materia o jurisdicción.
- Generación de borradores de escritos legales: el modelo puede redactar textos preliminares de demandas, recursos o informes, que luego un profesional revisaría.
- Búsqueda semántica en corpus legales: combinado con embeddings, puede ayudar a localizar pasajes relevantes en grandes volúmenes de normativa.
- Educación jurídica: como herramienta de estudio para estudiantes de derecho, generando explicaciones simplificadas de artículos o resoluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo no ha sido probado aún, por lo que no existen métricas de rendimiento (MMLU, HumanEval, etc.) para este fine-tune específico. Los benchmarks del modelo base LFM2.5-1.2B-Instruct están disponibles en la documentación de Liquid AI, pero no son aplicables directamente a esta adaptación.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, los pesos ocupan aproximadamente 0,7 GB, por lo que la VRAM total necesaria (incluyendo activaciones y overhead) ronda 1-2 GB. La versión F16 requiere unos 2,3 GB de pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente memoria compartida). Para uso cómodo, una RTX 3060 o superior es suficiente.
- Cabe en GPUs de consumo: sí, es un modelo de 1,2B pensado para edge y dispositivos locales.
- Opciones de despliegue: llama.cpp (con `llama-cli`), Ollama, vLLM (con soporte para LFM2.5), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles para este fine-tune. En el modelo base, se espera una generación de 20-40 tokens/s en una GPU consumer media, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (base) | 1,17B | 32K | Apache 2.0 (según Liquid AI) | safetensors, GGUF | Modelo original, con benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa popular para tareas generales |
| Llama-3.2-1B-Instruct | 1,23B | 128K | Llama 3.2 Community | safetensors, GGUF | Buen rendimiento en chat, contexto muy largo |

Este fine-tune se diferencia por su adaptación a legal español, pero carece de validación y licencia clara. El modelo base de Liquid AI tiene una licencia Apache 2.0, pero no se confirma que el fine-tune la herede.

## Limitaciones y advertencias

- Modelo en fase pre-alpha: no ha sido probado, por lo que su calidad y fiabilidad son inciertas.
- Sin licencia especificada: no se puede garantizar su uso comercial o redistribución sin permiso del autor.
- Sesgos potenciales: al estar entrenado con datos legales del BOE, puede reflejar sesgos del corpus original o de la selección de 20 000 entradas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información legal incorrecta o inventada, lo que es especialmente peligroso en contextos jurídicos.
- Limitaciones de idioma: aunque el fine-tune sugiere español, no hay confirmación de cobertura multilingüe.
- Sin benchmarks: no se puede comparar objetivamente con otros modelos.
- Dependencia del modelo base: las capacidades de tool calling y contexto largo dependen de LFM2.5, pero no se ha verificado que el fine-tune las conserve íntegramente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jasonjimnz/LFM2.5-1.2B-Instruct_boe_legal_pre_alpha_2
- Modelo base LFM2.5-1.2B-Instruct: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Receta vLLM: https://recipes.vllm.ai/LiquidAI/LFM2.5-1.2B-Instruct
- OpenRouter (precios y benchmarks del base): https://openrouter.ai/liquid/lfm-2.5-1.2b-instruct
