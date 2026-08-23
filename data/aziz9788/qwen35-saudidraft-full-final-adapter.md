# aziz9788/qwen35-saudidraft-full-final-adapter

## Resumen

El modelo `aziz9788/qwen35-saudidraft-full-final-adapter` es un adaptador LoRA (Low-Rank Adaptation) para el modelo base `unsloth/Qwen3.5-4B`, publicado por el usuario aziz9788 en HuggingFace. Se trata de un adaptador PEFT (Parameter-Efficient Fine-Tuning) que no incluye los pesos fusionados, sino únicamente los parámetros del adaptador, con un tamaño de repositorio de 0,3 GB. El adaptador se creó el 22 de agosto de 2026 y se presenta como un ajuste fino destinado a un proyecto de LLM en árabe saudí (etiqueta `saudi-llm`), aunque no se detalla el corpus de entrenamiento.

El modelo base, Qwen3.5-4B, pertenece a la serie Qwen3.5 de Alibaba, que según la documentación disponible ofrece ventanas de contexto de hasta 256K tokens y arquitectura híbrida con atención lineal. Sin embargo, la información específica sobre el adaptador es muy limitada: solo se indica que continúa el entrenamiento desde el checkpoint 1650 de `SaudF/qwen35-4b-sft-rebuild-v1` y que se comparan dos recetas de fusión (directa y apilada) con distintos valores de `lora_alpha`. No se publican métricas de rendimiento ni detalles del proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre `unsloth/Qwen3.5-4B` (base: Qwen3.5-4B, arquitectura híbrida con atención lineal y MTP) |
| Parámetros totales | No disponible (el adaptador ocupa 0,3 GB; el modelo base tiene 4B parámetros) |
| Parámetros activos | No disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base Qwen3.5 soporta hasta 256K tokens según la documentación de la serie |
| Tipos de cuantización | No especificado (formato de pesos safetensors) |
| Idiomas soportados | No disponibles (la etiqueta `saudi-llm` sugiere árabe, pero no se confirma) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango `r=32` y `lora_alpha=32`, con `use_rslora=True` (RS-LoRA). El modelo base es `unsloth/Qwen3.5-4B`, que forma parte de la serie Qwen3.5 con arquitectura híbrida: alterna capas de atención completa (transformer estándar) con capas de atención lineal (GDN/DeltaNet) e incluye cabezas de predicción multi-token (MTP). No se proporciona información sobre los datos de entrenamiento del adaptador (número de tokens, composición del dataset, técnicas de RLHF/DPO). Se indica que el entrenamiento continúa desde el checkpoint 1650 de `SaudF/qwen35-4b-sft-rebuild-v1`, y que en el punto de evaluación anterior se sobreescribió el `lora_alpha` a 22 en el momento de la fusión. Se comparan dos recetas de ensión: `direct` (adaptador con alpha 22) y `stacked` (checkpoint-1650 con alpha 22 + adaptador con alpha 32 apilado), pero no se publican resultados.

## Capacidades

Al ser un adaptador sobre Qwen3.5-4B, hereda las capacidades generales del modelo base, aunque el adaptador no aporta documentación específica. Las capacidades listadas a continuación se basan en las características conocidas de la serie Qwen3.5:

- Generación de texto en lenguaje natural y conversación multi-turno.
- Razonamiento lógico y matemático básico (típico de modelos de 4B parámetros).
- Generación de código y asistencia en programación (probable, dada la familia Qwen).
- Soporte de tool calling y function calling (según la serie Qwen3.5, aunque no se confirma para este adaptador).
- Capacidades multilingües (el modelo base soporta varios idiomas; el adaptador parece orientado al árabe, pero no hay confirmación).
- No se documentan capacidades específicas del adaptador (p. ej., modo thinking, visión, audio).

## Casos de uso

Dado que el adaptador no tiene documentación de uso ni ejemplos, los casos de uso son hipotéticos y dependen de las capacidades del modelo base. No se recomienda utilizarlo en producción sin validación previa.

- Desarrollo de chatbots en árabe saudí: el adaptador está etiquetado como `saudi-llm`, lo que sugiere un ajuste para el dialecto o registro del árabe de Arabia Saudí. Se podría usar para construir asistentes conversacionales en ese idioma, aunque no hay evidencia de resultados.
- Fine-tuning continuado sobre tareas específicas: al ser un adaptador LoRA, se puede cargar sobre el modelo base para realizar tareas de generación de texto, siempre que se valide su comportamiento.
- Prototipado de aplicaciones de chat con bajo coste: al ser un adaptador de solo 0,3 GB, se puede desplegar sobre el modelo base con recursos moderados.
- Investigación sobre ajuste de LoRA en modelos árabes: sirve como ejemplo de adaptación de un modelo Qwen3.5 a un idioma regional.
- Comparación de recetas de fusión de adaptadores: el autor documenta dos recetas (direct y stacked) que pueden reproducirse para estudiar el impacto del apilamiento de adaptadores.
- Integración en pipelines de generación de texto con PEFT: se puede usar como punto de partida para experimentos con la biblioteca Unsloth y PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K u otros conjuntos de evaluación, ni comparaciones con modelos similares.

## Requisitos de hardware

- Al ser un adaptador LoRA, no es necesario cargarlo de forma independiente; se fusiona con el modelo base `unsloth/Qwen3.5-4B` (4B parámetros). El adaptador ocupa 0,3 GB en disco.
- Para inferencia con el modelo base en precisión FP16, se estima una VRAM de aproximadamente 8 GB (típico para 4B parámetros). Con cuantización INT8 o INT4, la VRAM puede reducirse a 4-5 GB, pero no se especifica para este adaptador.
- GPUs recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060, RTX 4060 Ti, RTX 4090, o GPUs de datacenter como A10, A100 o H100.
- Es viable en GPUs de consumo (consumer) como RTX 3090 o RTX 4090 si se usa cuantización.
- Opciones de despliegue: se puede usar con la biblioteca PEFT y Unsloth para cargar el adaptador sobre el modelo base, o fusionar los pesos y exportar a formatos GGUF para su uso con llama.cpp, Ollama o vLLM. No se proporcionan detalles de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables del mismo autor o de la misma familia. La comparativa no está disponible. Se puede mencionar que la serie Qwen3.5 incluye modelos de 27B, 35B-A3B y 122B-A10B, pero no son adaptadores sino modelos completos.

## Limitaciones y advertencias

- El adaptador no incluye pesos fusionados; es necesario descargar también el modelo base `unsloth/Qwen3.5-4B` para su uso.
- No hay información sobre el proceso de entrenamiento (datos, cantidad de tokens, técnicas de alineación). El comportamiento puede ser impredecible.
- La etiqueta `saudi-llm` sugiere un ajuste para el árabe, pero no se confirma el idioma ni la calidad de la adaptación.
- Al ser un adaptador de solo 0.3 GB, es probable que el ajuste sea limitado y no mejore significativamente las capacidades del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (Qwen3.5 también es Apache-2.0 según la documentación).
- No se han publicado evaluaciones de sesgos o alucinaciones. No se recomienda su uso en producción sin pruebas exhaustivas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/aziz9788/qwen35-saudidraft-full-final-adapter)
- [Guía de la serie Qwen3.5 (a2aprotocol.ai)](https://a2aprotocol.ai/insights/2026-qwen35-models-guide)
- [Repositorio GitHub de Qwen3.5 (ABDtmx)](https://github.com/ABDtmx/Qwen3.5)
- [Repositorio GitHub de soporte AutoAWQ para Qwen3.5](https://github.com/quivent/autoawq-qwen35)
- [Modelo base en HuggingFace: unsloth/Qwen3.5-4B](https://huggingface.co/unsloth/Qwen3.5-4B) (enlace no incluido en la información original, pero se deduce del campo `base_model`; se recomienda verificar la URL)
