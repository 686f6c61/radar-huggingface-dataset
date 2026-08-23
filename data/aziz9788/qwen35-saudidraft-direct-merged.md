# aziz9788/qwen35-saudidraft-direct-merged

## Resumen

`aziz9788/qwen35-saudidraft-direct-merged` es un modelo de lenguaje de 4.66 mil millones de parámetros (4.659.865.088) creado mediante la fusión directa de los pesos de `unsloth/Qwen3.5-4B` con un adaptador LoRA entrenado específicamente para el árabe, con foco en el dialecto saudí. El autor, `aziz9788`, publica este modelo como parte de una serie de experimentos para construir un LLM saudí de código abierto. La fusión se realiza con el método *direct* de Unsloth, utilizando `lora_alpha=22`, `r=32` y `rsLoRA`, y no se ha aplicado la etapa de *identity SFT* (ajuste fino de identidad). El resultado es un modelo autónomo que no requiere adaptador externo y puede cargarse directamente con Transformers o vLLM.

La relevancia de este modelo radica en ofrecer una alternativa de tamaño medio (4B) orientada al árabe, con licencia Apache 2.0 que permite uso comercial, y que puede ejecutarse en hardware de consumo. Aunque no se publican resultados de evaluación en la información disponible, el modelo está diseñado para tareas conversacionales y generación de texto en árabe, aprovechando la base Qwen3.5-4B, que es un modelo reciente de la serie Qwen3.5 de Alibaba. No se dispone de detalles sobre la arquitectura interna del modelo base, pero se sabe que es un transformer estándar (no MoE) según el tamaño de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B, sin especificación adicional) |
| Parametros totales | 4.659.865.088 (≈4,66B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en BF16) |
| Idiomas soportados | Árabe (principalmente, con foco en dialecto saudí) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión completa de los pesos de `unsloth/Qwen3.5-4B` (un modelo de 4.66B parámetros de la familia Qwen3.5) con un adaptador LoRA entrenado para el proyecto *Saudi-LLM*. El adaptador fue entrenado con `r=32`, `alpha=22` y `rsLoRA`, y se fusionó mediante la receta *direct* de Unsloth, que combina los pesos base y el adaptador sin pasos intermedios. No se ha aplicado la SFT de identidad, lo que significa que el modelo no ha sido ajustado para mostrar un comportamiento específico de "personalidad" o "asistente" en la fase final. El entrenamiento del adaptador se centró en datos en árabe, con énfasis en el dialecto saudí, pero no se proporcionan detalles sobre el volumen de datos, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. La arquitectura subyacente de Qwen3.5-4B no está descrita en la información disponible, pero se asume que es un transformer estándar con atención completa, dado su tamaño.

## Capacidades

- Generación de texto en árabe, especialmente orientada a conversaciones y diálogos en dialecto saudí.
- Modelo conversacional: puede mantener intercambios multi-turno, aunque la ventana de contexto exacta no se especifica.
- No se confirma soporte de *tool calling* ni *function calling* en la documentación proporcionada.
- No se indica capacidad para razonamiento multi-paso ni modo *thinking* (el autor menciona "Thinking off" en la receta).
- El pipeline en HuggingFace indica `image-text-to-text`, lo que sugiere posible entrada multimodal (imágenes + texto), pero no hay evidencia concreta en la model card; se recomienda verificar experimentalmente.
- Multilingüismo: aunque el foco es el árabe, el modelo base Qwen3.5-4B podría soportar otros idiomas, pero no hay confirmación oficial.

## Casos de uso

- Asistentes virtuales para empresas saudíes: el modelo puede gestionar conversaciones en árabe coloquial, ofreciendo respuestas contextuales en un entorno de atención al cliente o soporte técnico.
- Generación de contenido en árabe: redacción de artículos, correos electrónicos o mensajes publicitarios con registro adecuado al dialecto saudí.
- Traducción automática árabe-inglés o viceversa, aunque no está optimizado para ello, puede servir como base con ajuste fino adicional.
- Chatbots de educación y aprendizaje: responder preguntas en árabe para aplicaciones educativas.
- Procesamiento de documentos: extracción y resumen de información en árabe, útil en empresas que manejan textos legales o administrativos.
- Prototipos de agentes conversacionales en entornos de investigación: al ser un modelo de 4B, es ligero para experimentación en entornos con GPU limitada, permitiendo pruebas de sistemas de diálogo en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una suite de evaluación (`full_suite_no_reasoning_saudidraft_direct_20260622_200129_pre_identity`), pero no se incluyen métricas concretas (MMLU, HumanEval, GSM8K, etc.). Por tanto, no se puede comparar objetivamente con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo ocupa aproximadamente 9,3 GB de VRAM solo para los pesos (4.66B × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 12-16 GB de VRAM para ejecución cómoda.
- Con cuantización (si se convierte a GGUF o AWQ), podría reducirse a ~3-5 GB, pero no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A10 (24 GB), A100 (40/80 GB) o cualquier GPU con ≥16 GB VRAM. En tarjetas consumer como RTX 3090 (24 GB) o RTX 4060 Ti (16 GB) podría funcionar con cuantización.
- Opciones de despliegue: compatible con Transformers, vLLM, TGI y llama.cpp (si se convierte a GGUF). También puede usarse con Ollama mediante la conversión.
- Latencia y throughput: no disponibles. En una GPU A100, se espera una generación de 20-30 tokens/s, pero es una estimación genérica.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos árabes o de tamaño similar. El modelo es un merge de Qwen3.5-4B, por lo que podría compararse con otros modelos de 4B de la serie Qwen, como `Qwen3-4B` o `Qwen3.5-4B` base, pero no hay datos de rendimiento. No se conocen alternativas específicas para el dialecto saudí en el ecosistema open source en este momento.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado con datos árabes, puede heredar sesgos culturales y de género presentes en los corpus de entrenamiento. No se ha evaluado la mitigación de sesgos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información inventada, especialmente en contextos de baja frecuencia. Se recomienda verificar en aplicaciones críticas.
- Limitaciones de idioma: el modelo está optimizado para árabe saudí, pero su rendimiento en otros dialectos árabes o en árabe moderno estándar puede ser inferior.
- Contexto: la longitud de contexto no está especificada; se asume la de Qwen3.5-4B, pero no hay confirmación oficial.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales (consultar la licencia de Qwen).
- El modelo no tiene SFT de identidad, lo que significa que no está optimizado para seguir instrucciones de forma robusta; puede requerir ajuste posterior para aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aziz9788/qwen35-saudidraft-direct-merged
- Otros modelos del autor: https://huggingface.co/aziz9788/qwen35-4b-t13-opd-rkl-ckpt50 , https://huggingface.co/aziz9788/qwen35-4b-e11-dpo-v3
- Blog de Qwen3.5 (oficial): https://qwen.ai/blog?id=qwen3.5
- Análisis técnico de Qwen3.5: https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- LLM Explorer del modelo: https://llm-explorer.com/model/aziz9788%2Fqwen35-4b-t13-opd-rkl-ckpt250,4in8gcs5gBQ90mNxPUnqXm (para modelos relacionados)
