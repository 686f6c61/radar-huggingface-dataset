# axonlabsai/Terra-59B

## Resumen

Terra-59B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Axon Labs, que continúa el pre-entrenamiento de JoyAI-LLM-Flash, un modelo basado en la arquitectura DeepSeek-V3. Con aproximadamente 59 mil millones de parámetros totales y unos 3,28 mil millones activos por token, Terra amplía la capacidad de expertos de 256 a 311 por capa, manteniendo la misma profundidad de enrutamiento (top-8). Esta expansión se realizó mediante una técnica de "upcycling", inicializando los nuevos expertos a partir de la distribución existente, lo que permite crecer la capacidad del modelo sin un entrenamiento desde cero.

El modelo está diseñado para ofrecer un rendimiento eficiente en tareas de generación de lenguaje, razonamiento y código, aprovechando la arquitectura MoE para activar solo una fracción de sus parámetros en cada token. Su tamaño y cuantización INT4 (36,55 GB en disco) lo hacen adecuado para despliegues en entornos con GPUs de alta capacidad, aunque requiere gestión cuidadosa de memoria. La licencia es "modified-mit", lo que implica términos personalizados que deben revisarse antes de uso comercial.

Actualmente, Terra-59B se encuentra en una fase temprana de adopción (80 descargas), y no se han publicado benchmarks ni especificaciones detalladas de contexto o idiomas. Sin embargo, su base en DeepSeek-V3 sugiere capacidades avanzadas de razonamiento y generación multilingüe, aunque esto no está confirmado por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en DeepSeek-V3, con 311 expertos enrutados por capa (top-8) |
| Parametros totales | 59.411.869.537 (59,0B) |
| Parametros activos | ~3,28 mil millones por token (top-8 de 311) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (mencionado en la model card), otros no disponibles |
| Idiomas soportados | no disponible |
| Licencia | modified-mit |
| Formato de pesos | safetensors (con código personalizado, custom_code) |

## Arquitectura y entrenamiento

Terra-59B se basa en la arquitectura DeepSeek-V3, un modelo MoE con atención multi-cabeza y enrutamiento de expertos. El modelo original JoyAI-LLM-Flash tiene 256 expertos por capa, y Terra los expande a 311, añadiendo 55 expertos por capa en las 39 capas MoE. Esta expansión se realiza mediante un proceso de "upcycling": los nuevos expertos se inicializan a partir de la distribución de los expertos existentes y se adaptan mediante pasos adicionales de entrenamiento, en lugar de inicializarlos aleatoriamente. También se extienden los pesos del router (gate weight y score-correction bias) para acomodar el nuevo número de expertos. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO.

## Capacidades

No se han publicado capacidades específicas en la información disponible. Al estar basado en DeepSeek-V3, se espera que herede capacidades generales de generación de texto, razonamiento, codificación y posiblemente soporte multilingüe, aunque esto no está confirmado. No se menciona soporte para tool calling, agentes, visión, audio, ni modos de pensamiento especiales.

## Casos de uso

Dado que es un modelo de lenguaje grande con arquitectura MoE, puede aplicarse a tareas típicas de LLMs, aunque no se dispone de confirmación oficial de características específicas:

- Asistencia en programación: puede ayudar a generar, revisar y depurar código, aunque no se ha confirmado soporte para tool calling o integración con entornos de desarrollo.
- Análisis y resumen de documentos: puede procesar y resumir textos extensos, aunque la longitud de contexto no está especificada.
- Chatbots y asistentes virtuales: puede mantener conversaciones multi-turno, aunque no se detalla su capacidad de diálogo ni su sistema de prompt.
- Generación de contenido creativo: puede redactar artículos, historias, guiones o material publicitario.
- Razonamiento y resolución de problemas: su arquitectura MoE con muchos expertos sugiere buena capacidad para tareas de razonamiento complejo, como matemáticas o lógica.
- Traducción automática: si soporta múltiples idiomas, podría utilizarse para traducción, aunque no hay confirmación de idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo en cuantización INT4 ocupa 36,55 GB en disco, por lo que se necesita al menos una GPU con 40 GB de VRAM (por ejemplo, A100 40GB, A100 80GB, H100) o varias GPUs de menor capacidad.
- En precisión bf16, el tamaño estimado sería de ~118 GB, requiriendo múltiples GPUs (por ejemplo, 4x A100 80GB o 8x RTX 4090 24GB).
- Se recomienda usar `device_map="auto"` con `max_memory` para evitar errores de memoria en GPUs de 16 GB, como se indica en la model card.
- Requiere `transformers>=4.53.0` y `compressed-tensors>=0.15.0`.
- Opciones de despliegue: se puede cargar con Hugging Face Transformers, pero no se mencionan integraciones con vLLM, TGI o llama.cpp.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos. A continuación se presenta una comparación básica basada en parámetros y arquitectura, aunque no se conocen detalles de rendimiento.

| Modelo | Parámetros totales | Parámetros activos | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|---|
| Terra-59B | 59,0B | ~3,28B | MoE (DeepSeek-V3) | no disponible | modified-mit |
| JoyAI-LLM-Flash (base) | 48,9B | ~3,28B | MoE (DeepSeek-V3) | no disponible | no disponible |
| DeepSeek-V3 (referencia) | 671B | ~37B | MoE | 128K | MIT (según versión) |

Nota: los datos de DeepSeek-V3 son de conocimiento general, no de la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- Al ser un modelo continuado pre-entrenado, puede heredar sesgos y limitaciones del modelo base JoyAI-LLM-Flash/DeepSeek-V3.
- La licencia "modified-mit" no es una licencia estándar; se deben revisar los términos exactos antes de uso comercial o redistribución.
- El modelo requiere código personalizado (`custom_code`), lo que implica un riesgo de seguridad potencial al ejecutar código no verificado.
- El tamaño del modelo (59B parámetros) requiere hardware de gama alta; en GPUs de consumo (16 GB) puede no caber sin técnicas de offloading a CPU.
- No se han publicado benchmarks, por lo que el rendimiento real es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axonlabsai/Terra-59B
- Modelo base (JoyAI-LLM-Flash): https://huggingface.co/jdopensource/JoyAI-LLM-Flash
