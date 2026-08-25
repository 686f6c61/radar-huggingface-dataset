# jasonjimnz/LFM2.5-1.2B-Instruct_boe_legal_pre_alpha

## Resumen

LFM2.5-1.2B-Instruct_boe_legal_pre_alpha es un modelo de lenguaje pequeño (1.170 millones de parámetros) desarrollado por el usuario jasonjimnz como un fine-tuning del modelo base LFM2.5-1.2B-Instruct de Liquid AI, especializado en texto jurídico español procedente del Boletín Oficial del Estado (BOE). Se distribuye únicamente en formato GGUF cuantizado Q4_K_M, preparado para su uso con llama.cpp y herramientas compatibles como Ollama o vLLM.

El modelo parte de la arquitectura híbrida LFM2.5 de Liquid AI, que combina mecanismos de atención con capas de espacio de estados, diseñada para despliegue en dispositivos de bajo consumo. El fine-tuning se ha realizado con Unsloth y se encuentra en fase pre-alpha, lo que indica que es una versión experimental sin validación formal. Su interés radica en ofrecer una alternativa compacta y rápida para tareas de comprensión y generación de texto legal español, aunque su estado temprano y la falta de licencia clara limitan su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención + espacio de estados, basada en LFM2.5) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base LFM2.5 soporta contexto largo, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (el modelo base soporta multilingüe, pero el fine-tuning se enfoca en español jurídico) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct de Liquid AI usa una arquitectura híbrida que combina mecanismos de atención tradicionales con capas de espacio de estados (SSM), diseñada para eficiencia en inferencia y bajo uso de memoria. Fue preentrenado con 28 billones de tokens y refinado con aprendizaje por refuerzo en múltiples etapas, incluyendo soporte para tool calling y ChatML. El fine-tuning aquí presentado se realizó sobre ese modelo base utilizando Unsloth, con un dataset de textos legales del BOE (Boletín Oficial del Estado), aunque no se detallan la composición exacta del dataset ni el proceso de entrenamiento. El resultado se convirtió a GGUF para su uso con llama.cpp.

## Capacidades

- Generación de texto y chat conversacional en español, con foco en contenido jurídico-administrativo.
- Comprensión y procesamiento de documentos legales (normas, resoluciones, disposiciones) del BOE.
- Instrucción y seguimiento de órdenes (instruction following) heredadas del modelo base.
- Soporte de tool calling y function calling (según el modelo base), aunque no verificado en este fine-tuning.
- Capacidades multilingües limitadas, pero el fine-tuning está orientado a español.
- Razonamiento multi-step y capacidades de agente heredadas del modelo base, aunque degradadas por el tamaño reducido.
- No se han documentado capacidades multimodales (visión, audio) para este modelo.

## Casos de uso

- Análisis de normativa del BOE: el modelo puede extraer artículos, fechas, obligaciones y sanciones de documentos oficiales, facilitando la revisión legal automatizada.
- Resumen de disposiciones legales: genera resúmenes concisos de textos largos del BOE para consulta rápida por parte de abogados o funcionarios.
- Búsqueda semántica en corpus legales: gracias a su capacidad de comprensión, puede indexar y recuperar pasajes relevantes en una base de documentos BOE.
- Asistente de redacción de documentos legales: ayuda a redactar borradores de escritos, alegaciones o informes basados en plantillas y referencias normativas.
- Extracción de entidades jurídicas: identifica fechas, órganos, numeraciones de artículos y referencias cruzadas dentro de textos del BOE.
- Chatbot de consulta ciudadana: permite a ciudadanos preguntar sobre procedimientos administrativos descritos en el BOE, con respuestas contextualizadas.
- Automatización de procesos de compliance: verifica que contratos o memorandos cumplan con las disposiciones recientes publicadas en el BOE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning (LFM2.5-1.2B-Instruct_boe_legal_pre_alpha). El modelo base LFM2.5-1.2B-Instruct presenta métricas en plataformas como OpenRouter, pero no se dispone de datos contrastados para esta versión adaptada. No se inventarán cifras.

## Requisitos de hardware

- El archivo GGUF Q4_K_M ocupa aproximadamente 0.7 GB, por lo que cabe en GPUs con 2 GB de VRAM o incluso en CPU con 4 GB de RAM.
- Puede ejecutarse en GPUs consumer como GTX 1060 (6 GB), RTX 2060, RTX 3060 o superiores, sin problemas.
- En CPU, el modelo base alcanza 239 tok/s en un AMD EPYC y 82 tok/s en NPU móvil; se espera rendimiento similar en este fine-tuning.
- Despliegue recomendado con llama.cpp (llama-cli), Ollama, o vLLM (si se convierte a safetensors).
- La latencia para generación de texto será muy baja, del orden de milisegundos por token en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos de este fine-tuning específico. El modelo base LFM2.5-1.2B-Instruct se puede comparar con otros modelos pequeños (por ejemplo, Qwen2.5-1.5B-Instruct o Llama-3.2-1B), pero no hay información pública sobre cómo este fine-tuning se posiciona frente a ellos. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está marcado como "pre_alpha", lo que indica una versión temprana sin evaluación exhaustiva ni garantías de estabilidad.
- No se dispone de información sobre la licencia, por lo que el uso comercial es incierto y se recomienda contactar con el autor antes de cualquier despliegue en producción.
- El fine-tuning se ha realizado sobre un corpus específico (BOE legal) y puede mostrar degradación en dominios fuera del ámbito jurídico-administrativo.
- Riesgo de alucinación: como cualquier modelo pequeño, puede generar referencias legales o citas inexistentes; se requiere verificación manual en contextos críticos.
- El contexto máximo no está documentado, lo que limita su uso en documentos muy extensos sin estrategias de chunking.
- No se han evaluado sesgos específicos, pero es probable que herede sesgos del corpus de entrenamiento base y del propio BOE.
- No soporta vision ni multimodalidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jasonjimnz/LFM2.5-1.2B-Instruct_boe_legal_pre_alpha
- Modelo base LFM2.5-1.2B-Instruct: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación oficial de Liquid AI para LFM2.5-1.2B-Instruct: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Página del modelo en OpenRouter (API y benchmarks): https://openrouter.ai/liquid/lfm-2.5-1.2b-instruct
- Página en ModelScope: https://www.modelscope.cn/models/LiquidAI/LFM2.5-1.2B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
