# bunnycore/LMF-2.5-2B-Code-Lora

## Resumen

El modelo `bunnycore/LMF-2.5-2B-Code-Lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario bunnycore, diseñado para especializar el modelo base `LiquidAI/LFM2.5-2.6B` de Liquid AI en tareas de generación de código. El adaptador añade únicamente 1.179.648 parámetros entrenables sobre el modelo base congelado, lo que permite una adaptación eficiente sin necesidad de reentrenar toda la arquitectura. Se entrenó con el dataset `faunix/Qwen3.8-27B-Distillation-40K`, un conjunto de 40.000 muestras de destilación procedentes de un modelo Qwen de 27B, y se utilizó la librería Unsloth para acelerar el proceso de entrenamiento.

La relevancia de este modelo radica en su enfoque de eficiencia: en lugar de desplegar un modelo completo de 2.6B parámetros, se puede cargar el adaptador sobre el base y obtener una especialización en código con un coste computacional mínimo. Sin embargo, la información pública es muy limitada: no se especifica la licencia, los idiomas soportados, ni se han publicado resultados de benchmarks. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que solo contiene los pesos del adaptador en formato safetensors, aunque el tag `gguf` indica que podría existir una versión cuantizada para inferencia ligera.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM2.5-2.6B (arquitectura del base no especificada) |
| Parametros totales | 1.179.648 (solo adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (tag `gguf` presente, sin detalles) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (posible GGUF según tag) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una técnica de fine-tuning eficiente que introduce matrices de baja dimensión en las capas del modelo base, congelando los pesos originales. Esto reduce drásticamente el número de parámetros entrenables (1,18M frente a los 2.600M del base) y el coste de entrenamiento. El adaptador se entrenó sobre `LiquidAI/LFM2.5-2.6B`, un modelo de la familia LFM (Liquid Foundation Models) de Liquid AI, conocida por su enfoque en eficiencia computacional y despliegue en dispositivos con recursos limitados.

El dataset de entrenamiento, `faunix/Qwen3.8-27B-Distillation-40K`, consiste en 40.000 ejemplos de destilación generados por un modelo Qwen de 27B parámetros, probablemente orientados a tareas de código y conversación. Se utilizó la librería Unsloth, que optimiza el entrenamiento de modelos transformer mediante kernels personalizados y gestión eficiente de memoria. No se han publicado hiperparámetros concretos (tasa de aprendizaje, épocas, rango del LoRA, etc.) ni detalles sobre el proceso de preprocesamiento.

## Capacidades

- Generación de texto y código: el nombre del modelo y el dataset de destilación indican que está especializado en tareas de programación, aunque no se especifican los lenguajes soportados.
- Conversación: el tag `conversational` sugiere que puede mantener diálogos multi-turno, probablemente con instrucciones de código.
- Fine-tuning eficiente: al ser un adaptador LoRA, se puede combinar con el modelo base para obtener una especialización sin necesidad de cargar un modelo completo adicional.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, capacidades multimodales o modos de pensamiento extendido.

## Casos de uso

- Asistente de autocompletado de código en editores: el adaptador puede integrarse en herramientas como VS Code o Jupyter para sugerir fragmentos de código, aprovechando la eficiencia del modelo base LFM2.5-2.6B para ejecutarse en equipos con poca VRAM.
- Generación de funciones y scripts en pipelines de CI/CD: dado su enfoque en código, podría utilizarse para generar tests unitarios, documentación o scripts de automatización, siempre que se valide su rendimiento con benchmarks propios.
- Chatbot técnico de soporte: al ser conversacional, puede responder preguntas sobre programación, aunque su conocimiento estará limitado por el dataset de destilación y el modelo base.
- Prototipado rápido de aplicaciones de generación de código: al ser un adaptador pequeño, se puede experimentar con diferentes configuraciones de LoRA sin grandes costes de cómputo.
- Fine-tuning adicional sobre dominios específicos: el adaptador puede servir como punto de partida para especializaciones posteriores (por ejemplo, SQL, Python, etc.) con datasets propios.
- Despliegue en entornos edge: gracias al tag `gguf`, es posible cuantizar el modelo base y el adaptador para ejecutarlo en dispositivos con recursos limitados, como Raspberry Pi o smartphones, para asistentes de código offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con otros modelos. Se recomienda evaluar el modelo en tareas específicas de código antes de usarlo en producción.

## Requisitos de hardware

- El adaptador en sí ocupa menos de 5 MB (1,18M parámetros en fp32), por lo que el requisito principal es el modelo base `LiquidAI/LFM2.5-2.6B`.
- Para inferencia con el modelo base en fp16, se estiman entre 5 y 6 GB de VRAM (2.6B parámetros × 2 bytes). Con cuantización 8-bit, ~3 GB; con 4-bit, ~2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantización 4-bit (por ejemplo, RTX 3050, RTX 4060, GTX 1660). Para fp16, se necesitan 6 GB o más (RTX 3060, RTX 4070, etc.).
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. Para GGUF, se puede usar `llama.cpp` u Ollama. También es compatible con vLLM si se fusiona el adaptador con el base.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros (adaptador) | Modelo base | Licencia | Contexto | Enfoque |
|---|---|---|---|---|---|
| bunnycore/LMF-2.5-2B-Code-Lora | 1,18M | LiquidAI/LFM2.5-2.6B | No disponible | No disponible | Código |
| bunnycore/Gemma2-2b-code-lora | No disponible | IlyaGusev/gemma-2-2b-it-abliterated | Apache 2.0 | No disponible | Código |
| bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled | No disponible | LiquidAI/LFM2.5-2.6B | No disponible | No disponible | Destilación general |

No se dispone de datos de rendimiento para comparar. La principal diferencia es la licencia: el adaptador Gemma2 tiene licencia Apache 2.0, mientras que el modelo evaluado no especifica licencia, lo que limita su uso comercial sin verificación.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es de código abierto, si permite uso comercial o si tiene restricciones. Esto es un riesgo importante para producción.
- Sin benchmarks: no hay evidencia de rendimiento en tareas de código. El modelo podría no superar a modelos base genéricos.
- Dependencia del modelo base: las capacidades finales dependen de `LiquidAI/LFM2.5-2.6B`, cuyas limitaciones (sesgos, idiomas, contexto) no están documentadas en esta ficha.
- Dataset de destilación: al entrenarse con datos generados por un modelo Qwen de 27B, puede heredar sesgos o errores del modelo profesor.
- Repositorio sin contenido visible: el tamaño de 0.0 GB sugiere que el adaptador podría no estar completo o que los pesos están en un formato no estándar. Se recomienda verificar la integridad antes de su uso.
- Sin información sobre idiomas: no se sabe si el modelo funciona bien en español o solo en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bunnycore/LMF-2.5-2B-Code-Lora
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B (no verificado en la búsqueda, pero se infiere de los metadatos)
- Dataset de entrenamiento: https://huggingface.co/datasets/faunix/Qwen3.8-27B-Distillation-40K (no verificado)
- Otro adaptador del mismo autor: https://huggingface.co/bunnycore/Gemma2-2b-code-lora
- Modelo relacionado del autor: https://huggingface.co/bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled
- Web de Liquid AI: https://www.liquid.ai/
- Cookbook de Liquid AI en GitHub: https://github.com/Liquid4All/cookbook
