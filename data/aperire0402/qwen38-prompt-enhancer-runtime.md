# aperire0402/qwen38-prompt-enhancer-runtime

## Resumen

Este repositorio es un mirror de despliegue inmutable creado por el usuario aperire0402 para el worker de prompt enhancement de Gingerlabs en Runpod. No es un modelo independiente, sino un paquete de artefactos que contiene únicamente dos ficheros GGUF: el modelo objetivo en cuantización Q6_K_P y un sidecar FastMTP de vocabulario de borrador de 32K. El modelo base es HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, un modelo de 27 mil millones de parámetros aparentemente basado en la familia Qwen, aunque no se dispone de documentación oficial que confirme su arquitectura exacta.

La finalidad de este mirror es permitir que Runpod Cached Models prepare únicamente los ficheros necesarios para el worker, omitiendo otras cuantizaciones y el proyector de visión. El worker es exclusivamente de texto, y el "32K" del sidecar se refiere al vocabulario de borrador, no a la longitud de contexto de servicio. El repositorio incluye la procedencia firmada de la revisión upstream y el parche de runtime FastMTP, así como avisos de terceros y licencia.

Aunque el nombre sugiere un modelo de 27B, el dato de parámetros totales en safetensors es de 1.863.907.840, lo que resulta inconsistente. Esta discrepancia no se explica en la documentación disponible, por lo que se tratará con cautela en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere Qwen, sin confirmar) |
| Parametros totales | no disponible (inconsistencia: safetensors indica 1,86B, el nombre indica 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el "32K" del sidecar es vocabulario de borrador, no contexto) |
| Tipos de cuantizacion | Q6_K_P (único incluido en el mirror) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. El nombre "Qwen3.8-27B" sugiere una variante de la familia Qwen con 27 mil millones de parámetros, pero no hay documentación que lo confirme. El mirror incluye un sidecar FastMTP, lo que indica que el modelo emplea decodificación especulativa con predicción multi-token (MTP), una técnica que acelera la generación al predecir varios tokens a la vez. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

El repositorio es una copia byte-idéntica de la revisión `993a5971fda8f30dd1b7eb2654792ba4415c7460` del modelo base, con la particularidad de que solo se incluyen los dos artefactos necesarios para el worker de Runpod. No se proporciona información sobre el proceso de entrenamiento ni sobre las innovaciones técnicas más allá del uso de MTP.

## Capacidades

- Generación de texto: el modelo base es un modelo de lenguaje de 27B, por lo que puede generar texto coherente, aunque no se han publicado evaluaciones específicas.
- Mejora de prompts: su función principal en este mirror es actuar como potenciador de prompts, reestructurando entradas simples en instrucciones detalladas y optimizadas.
- Soporte de decodificación especulativa: el sidecar FastMTP permite acelerar la inferencia mediante predicción multi-token.
- Texto solamente: el worker es exclusivamente de texto, sin capacidades de visión ni audio.
- No se ha confirmado soporte de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Despliegue en Runpod como worker de prompt enhancement: el mirror está diseñado específicamente para ser utilizado con Runpod Cached Models, permitiendo que el worker cargue únicamente los ficheros necesarios y reduzca el tiempo de preparación.
- Mejora de prompts para modelos de generación de imágenes: un prompt enhancer puede transformar descripciones breves en instrucciones detalladas para modelos T2I, mejorando la calidad de las imágenes generadas.
- Optimización de prompts para modelos de texto a vídeo: similar al caso anterior, pero orientado a generación de vídeo, donde los prompts detallados son cruciales.
- Refinamiento de prompts para chatbots: el modelo puede reescribir preguntas o instrucciones para obtener respuestas más precisas y contextualizadas de otros LLM.
- Automatización de flujos de trabajo con LLM: integrar el worker en pipelines que requieran mejorar prompts antes de enviarlos a un modelo de producción.
- Entornos con restricciones de VRAM: al ser una cuantización Q6_K_P, el modelo puede ejecutarse en GPUs con 24-32 GB de VRAM, aunque no es ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- El repositorio ocupa 26.8 GB, por lo que se necesita al menos esa cantidad de almacenamiento y VRAM suficiente para cargar el modelo en Q6_K_P.
- Para un modelo de 27B en Q6_K_P, se estima una VRAM mínima de 24-32 GB, dependiendo de la longitud de contexto y el batch.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), RTX 4090 (24 GB), RTX A6000 (48 GB), o GPUs con 32 GB o más.
- No cabe en GPUs de consumo con menos de 24 GB, como RTX 3080 o RTX 4060.
- Opciones de despliegue: Runpod Cached Models, vLLM (si soporta GGUF), llama.cpp, Ollama (si se convierte a formato compatible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas específicas. El mirror es un artefacto de despliegue, no un modelo independiente. Como referencia, existen otros prompt enhancers basados en modelos más pequeños, como RebelsPromptEnhancer, que utiliza un Qwen 3.5-4b GGUF para entornos de baja VRAM. Sin embargo, no hay datos comparativos de rendimiento.

## Limitaciones y advertencias

- El mirror no es un modelo completo: solo contiene la cuantización Q6_K_P y el sidecar FastMTP, por lo que no se pueden usar otras cuantizaciones ni el proyector de visión.
- La inconsistencia en el número de parámetros (1,86B vs 27B) no está aclarada, lo que genera incertidumbre sobre el tamaño real del modelo.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar el fichero `THIRD_PARTY_NOTICES.md` y `LICENSE` antes de redistribuir.
- El worker es solo de texto; no se pueden utilizar capacidades multimodales aunque el modelo base pudiera tenerlas.
- Al ser un mirror de despliegue, no se garantiza soporte ni mantenimiento por parte del autor original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aperire0402/qwen38-prompt-enhancer-runtime
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Herramienta Promhance (referencia de prompt enhancer): https://www.promhance.com/
- AI Prompt Enhancer (herramienta online): https://www.prompt-enhancer.ai/
- RebelsPromptEnhancer (proyecto similar en GitHub): https://github.com/RealRebelAI/RebelsPromptEnhancer
- AI Prompt Converter: https://www.aipromptconverter.com/prompt-enhancer
- Prompt Generators: https://prompt-generators.com/ai-prompt-enhancer
