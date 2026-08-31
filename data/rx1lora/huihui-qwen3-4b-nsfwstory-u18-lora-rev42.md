# rx1lora/huihui-qwen3-4b-nsfwstory-u18-lora-rev42

## Resumen

Este modelo es un adaptador LoRA de 0,3 GB desarrollado por el usuario rx1lora, diseñado para ajustar el modelo base huihui-ai/Huihui-Qwen3-4B-abliterated-v2, una versión "abliterada" (sin censura) del Qwen3 de 4B parámetros de Alibaba. El adaptador está especializado en la generación de historias de temática NSFW (contenido explícito para adultos), con la restricción explícita de excluir contenido relacionado con menores de edad (indicado por la etiqueta "u18" en el nombre). El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning, y el modelo resultante se distribuye en formato safetensors compatible con text-generation-inference.

La relevancia de este modelo radica en que ofrece una vía para personalizar un LLM de tamaño medio (4B) hacia un dominio muy específico de generación de ficción adulta, aprovechando la base abliterada que elimina los rechazos habituales de los modelos comerciales. Al ser un LoRA, no sustituye al modelo base sino que se carga como un adaptador, lo que permite cambiar de especialización sin duplicar el almacenamiento. La licencia Apache 2.0 permite uso comercial, aunque el contenido generado puede estar sujeto a restricciones legales según la jurisdicción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, basada en el modelo base huihui-ai/Huihui-Qwen3-4B-abliterated-v2) |
| Parametros totales | no disponible (el adaptador LoRA tiene un número reducido de parámetros, pero no se especifica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B, típicamente 32 768 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors, sin cuantizaciones GGUF o similares) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base huihui-ai/Huihui-Qwen3-4B-abliterated-v2. Este modelo base es una versión del Qwen3 de 4B parámetros de Alibaba a la que se le ha aplicado la técnica de "abliteración", que elimina selectivamente las capas responsables de rechazar contenido no deseado, permitiendo así generar respuestas sin las restricciones habituales de seguridad. El adaptador LoRA se entrenó con la librería Unsloth, que optimiza el proceso de fine-tuning mediante kernels de atención y backpropagation más eficientes, logrando un entrenamiento aproximadamente 2 veces más rápido que con métodos convencionales. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, el rank del LoRA ni si se utilizaron técnicas como RLHF o DPO. El resultado es un adaptador que modifica el comportamiento del modelo base hacia la generación de narrativa NSFW, manteniendo el resto de capacidades del Qwen3.

## Capacidades

- Generación de historias de ficción con contenido explícito para adultos (NSFW), excluyendo temáticas relacionadas con menores de edad.
- Hereda las capacidades generales del modelo base Qwen3-4B, incluyendo generación de texto, razonamiento básico y comprensión de instrucciones en inglés.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentación, aunque el modelo base Qwen3 sí lo soporta).
- Soporte de agentes y multi-step reasoning: no disponible (no se documenta específicamente).
- Capacidades multilingües: limitadas al inglés, según la etiqueta de idioma del repositorio.
- Capacidades especiales: no se documentan modos de pensamiento, visión o audio.

## Casos de uso

- Escritura creativa de ficción erótica: el modelo puede generar relatos extensos con descripciones detalladas, manteniendo coherencia narrativa gracias a la ventana de contexto del Qwen3 base. Es adecuado para autores que buscan un asistente de escritura sin filtros de contenido.
- Generación de diálogos para juegos de rol adultos: permite crear personajes y conversaciones con temática explícita, útil para comunidades de rol por texto o para desarrolladores de juegos independientes.
- Prototipado de aplicaciones de entretenimiento para adultos: los desarrolladores pueden integrar el modelo en aplicaciones de chat o narrativa interactiva, aprovechando la licencia Apache 2.0 para uso comercial.
- Fine-tuning adicional sobre dominios específicos: al ser un LoRA, se puede combinar con otros adaptadores o continuar el entrenamiento para ajustar el estilo de escritura a preferencias concretas.
- Investigación sobre alineación y desalineación de modelos: el modelo sirve como caso de estudio para analizar cómo la abliteración y el fine-tuning dirigido afectan al comportamiento de un LLM en dominios sensibles.
- Generación de contenido para audiencias adultas en plataformas de suscripción: escritores y creadores pueden usar el modelo para producir borradores de historias que luego revisan y publican, reduciendo el tiempo de escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un LoRA, la VRAM necesaria depende del modelo base. El Qwen3-4B en FP16 requiere aproximadamente 8 GB de VRAM; con cuantización (por ejemplo, 4 bits) puede reducirse a unos 4-5 GB. El adaptador LoRA añade un consumo marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3070, RTX 4060 Ti, A10) o 4-6 GB para cuantización (RTX 3060, RTX 4060). Para uso en servidores, una A100 o H100 es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090 (24 GB) con cuantización.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no disponible. Depende del hardware y del formato de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| rx1lora/huihui-qwen3-4b-nsfwstory-u18-lora-rev42 | 4B (base) + LoRA | no disponible | Apache 2.0 | NSFW storytelling (sin menores) |
| huihui-ai/Huihui-Qwen3-4B-abliterated-v2 | 4B | 32 768 (típico) | Apache 2.0 | Modelo base sin censura |
| rx1lora/huihui-qwen3-8b-nsfwstory-u18-lora | 8B (base) + LoRA | no disponible | Apache 2.0 | NSFW storytelling (sin menores) |

La comparativa se limita a los modelos relacionados encontrados en la búsqueda. No se dispone de datos de rendimiento para comparar objetivamente. El modelo de 8B probablemente ofrezca mejor calidad narrativa pero con mayores requisitos de hardware.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar contenido NSFW, lo que puede resultar inapropiado en entornos profesionales o educativos. Debe usarse con responsabilidad y cumpliendo las leyes locales.
- Riesgo de alucinación: como cualquier LLM, puede inventar información o producir narrativas incoherentes, especialmente en contextos largos.
- Sesgos: el modelo base puede contener sesgos presentes en sus datos de entrenamiento, que el fine-tuning NSFW no corrige y podría amplificar.
- Restricciones de idioma: solo se garantiza el inglés; el rendimiento en otros idiomas es impredecible.
- Limitaciones de contexto: la longitud de contexto no está documentada en el repositorio; se recomienda verificar la del modelo base.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones sobre pornografía o material explícito en ciertos países.
- Sin garantías de seguridad: al ser un modelo abliterado, no tiene los mecanismos de seguridad habituales, por lo que puede generar contenido ofensivo o dañino si se le solicita.

## Enlaces

- Repositorio del modelo: https://huggingface.co/rx1lora/huihui-qwen3-4b-nsfwstory-u18-lora-rev42
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3-4B-abliterated-v2
- Variante de 8B: https://huggingface.co/rx1lora/huihui-qwen3-8b-nsfwstory-u18-lora
- Variante de prueba rev1: https://huggingface.co/rx1lora/huihui-qwen3-4b-nsfwstory-u18-lora-rev1-test
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
