# Obotu/lfm2.5-yoruba-sft-GGUF

## Resumen

El modelo `Obotu/lfm2.5-yoruba-sft-GGUF` es una adaptación en formato GGUF de un finetune del modelo LFM2.5 de Liquid AI, especializado en el idioma yoruba. Ha sido creado por el usuario Obotu mediante la librería Unsloth, que permite entrenar y convertir modelos de forma eficiente. El modelo base pertenece a la familia LFM2.5, diseñada por Liquid AI para despliegue en dispositivos edge, con un enfoque en eficiencia y capacidades de agente.

Con aproximadamente 2,7 mil millones de parámetros, este modelo se presenta en una única cuantización Q8_0, lo que lo hace adecuado para ejecutarse en hardware de consumo. Su relevancia radica en ofrecer una opción de procesamiento de lenguaje natural en yoruba, un idioma con escasa representación en modelos de código abierto, y en su compatibilidad con herramientas como llama.cpp y Ollama. Aunque la información pública es limitada, su origen en la arquitectura LFM2.5 sugiere un diseño optimizado para inferencia en dispositivos con recursos restringidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente híbrida, basada en LFM2.5 de Liquid AI) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo GGUF) |
| Idiomas soportados | yoruba (finetune), otros no especificados |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LFM2.5 en la documentación proporcionada. Según el blog de Liquid AI, la familia LFM2.5 está diseñada para edge AI, con una arquitectura optimizada para eficiencia y capacidades de agente, pero no se especifican detalles como el tipo de atención o si es un modelo denso o MoE. El finetune fue realizado con Unsloth, una herramienta que acelera el entrenamiento y la conversión a GGUF, pero no se indican los datos de entrenamiento, el número de tokens ni el método de alineación (RLHF, DPO, etc.). Tampoco se mencionan innovaciones técnicas específicas en el proceso de finetune.

## Capacidades

- Generación de texto en yoruba: el modelo está específicamente finetuneado para este idioma, por lo que puede generar y comprender texto en yoruba con mayor fluidez que un modelo genérico.
- Conversación multi-turno: al ser un modelo de lenguaje, es capaz de mantener diálogos, aunque no se especifica si tiene soporte explícito para tool calling o agentes.
- Compatibilidad con llama.cpp: el formato GGUF permite su uso con herramientas como llama-cli, llama-mtmd-cli y otras que soporten este formato.
- Multilingüismo parcial: aunque el finetune se centra en yoruba, el modelo base LFM2.5 probablemente conserva capacidades en otros idiomas, pero no hay datos confirmados.

## Casos de uso

- Asistente de atención al cliente en yoruba: el modelo puede gestionar consultas y respuestas en este idioma, integrándose en sistemas de chat mediante llama.cpp o servidores compatibles con GGUF.
- Traducción automática yoruba-español u otros idiomas: aunque no está específicamente entrenado para traducción, su capacidad de generación en yoruba permite usarlo como base para tareas de traducción con ajuste adicional.
- Transcripción y resumen de textos en yoruba: puede procesar documentos o conversaciones en yoruba para generar resúmenes o extraer información clave.
- Educación y aprendizaje de idiomas: útil para crear aplicaciones de práctica de yoruba, generando ejercicios, correcciones o diálogos simulados.
- Procesamiento de contenido en redes sociales: análisis de sentimiento o moderación de comentarios en yoruba, aprovechando su capacidad de comprensión del idioma.
- Desarrollo de agentes conversacionales en entornos con recursos limitados: al ser un modelo de 2,7B en Q8_0, cabe en GPUs de consumo, lo que permite desplegarlo en dispositivos edge o portátiles para aplicaciones de voz o texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este finetune específico.

## Requisitos de hardware

- VRAM estimada: un modelo de 2,7B parámetros en Q8_0 ocupa aproximadamente 2,7 GB de pesos, más overhead de contexto y activaciones. Con una ventana de contexto moderada (por ejemplo, 2048 tokens), se estima un uso de VRAM entre 3 y 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso GPUs integradas con suficiente memoria compartida. También puede ejecutarse en CPU con llama.cpp, aunque con menor velocidad.
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, o servidores compatibles con GGUF como text-generation-webui. También puede usarse con vLLM si se convierte a otro formato, aunque no es el caso actual.
- Latencia y throughput: no se dispone de mediciones específicas. En una GPU como RTX 4060, se espera una generación de 20-40 tokens por segundo, dependiendo de la longitud de contexto y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (finetunes de yoruba o modelos de 2,7B). No hay datos de rendimiento ni de características de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un finetune de tamaño pequeño, puede presentar alucinaciones y sesgos presentes en los datos de entrenamiento, aunque no se han documentado específicamente.
- Limitaciones de contexto: no se conoce la longitud máxima de contexto, por lo que puede ser limitada para tareas que requieran ventanas largas.
- Cobertura lingüística: el finetune se centra en yoruba, por lo que su rendimiento en otros idiomas puede ser inferior al de modelos multilingües más grandes.
- Licencia y uso comercial: la licencia no está especificada, lo que genera incertidumbre sobre su uso en aplicaciones comerciales. Se recomienda contactar al autor antes de utilizarlo en producción.
- Falta de documentación: no hay información sobre el proceso de entrenamiento, los datos utilizados ni las evaluaciones, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- [HuggingFace - Obotu/lfm2.5-yoruba-sft-GGUF](https://huggingface.co/Obotu/lfm2.5-yoruba-sft-GGUF)
- [Blog de Liquid AI - Introducing LFM2.5](https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai)
- [Colección LFM2.5 en HuggingFace](https://huggingface.co/collections/LiquidAI/lfm25)
- [Página de modelos de Liquid AI](https://www.liquid.ai/models)
- [Cookbook de Liquid AI en GitHub](https://github.com/Liquid4All/cookbook)
