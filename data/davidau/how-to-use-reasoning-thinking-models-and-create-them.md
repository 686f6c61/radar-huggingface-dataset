# DavidAU/How-To-Use-Reasoning-Thinking-Models-and-Create-Them

## Resumen

How-To-Use-Reasoning-Thinking-Models-and-Create-Them no es un modelo de lenguaje entrenado, sino un documento técnico vivo publicado en Hugging Face por DavidAU. Su propósito es recopilar métodos, plantillas, parámetros de muestreo y recomendaciones para aprovechar al máximo los modelos de razonamiento ("thinking/reasoning") como los de la familia DeepSeek-R1, así como explicar cómo convertir modelos convencionales en modelos con capacidad de razonamiento mediante adaptadores LoRA. El repositorio se etiqueta como `text-generation` y declara licencia Apache 2.0, pero su contenido es fundamentalmente divulgativo.

El documento se complementa con tres colecciones enlazadas: modelos de razonamiento en formato GGUF, ficheros fuente para generar cuantizaciones (EXL2, AWQ, GPTQ, HQQ) y adaptadores LoRA que dotan de razonamiento a modelos base. Está dirigido a desarrolladores e investigadores que despliegan modelos de razonamiento en entornos locales (LM Studio, Text Generation WebUI, SillyTavern) y necesitan ajustar plantillas de chat, system prompts y samplers.

Es relevante ahora porque la proliferación de modelos con modo "thinking" ha hecho crítica la correcta configuración de plantillas Jinja y parámetros de generación; un uso incorrecto degrada sustancialmente la calidad de la cadena de razonamiento. El documento centraliza buenas prácticas dispersas y ofrece una vía práctica para crear modelos de razonamiento propios sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (documento técnico, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el documento menciona modelos con contexto de 128k) |
| Tipos de cuantizacion | no disponible (el documento referencia GGUF, EXL2, AWQ, GPTQ, HQQ para los modelos que describe) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio documental; los modelos enlazados se distribuyen en GGUF y safetensors) |

## Arquitectura y entrenamiento

El repositorio no contiene pesos de un modelo ni describe un proceso de entrenamiento propio. Es un documento que cubre tres áreas: (1) cómo usar modelos de razonamiento existentes, con énfasis en la elección de plantilla de chat (Llama 3 Instruct/Chat, ChatML, Command-R o la plantilla Jinja autocargada desde `tokenizer_config.json`), (2) cómo ajustar system prompts y roles, y (3) cómo crear modelos de razonamiento mediante adaptadores LoRA aplicados sobre modelos base como Llama 3, Llama 3.1, Mistral y Qwen 2.5.

La innovación técnica que documenta es el uso de plantillas Jinja específicas para modelos con modo thinking, incluyendo el manejo de bloques de tool calls (por ejemplo, los tokens especiales `<｜tool▁calls▁begin｜>` y `<｜tool▁sep｜>` en Qwen 2.5). También enlaza herramientas como mergekit para fusiones de modelos y un motor de autocorrección de generación (AI Auto-Correct Engine) desarrollado por el autor, que opera a nivel de API para modificar el flujo de generación en tiempo real en cuantizaciones GGUF, EXL2 y HQQ.

## Capacidades

- Documentación de uso de modelos de razonamiento y thinking, incluyendo configuración de plantillas y samplers.
- Guía para convertir modelos convencionales en modelos de razonamiento mediante adaptadores LoRA.
- Recomendaciones de system prompts y roles para modelos con cadena de razonamiento.
- Referencia de tokens especiales y plantillas Jinja para tool calling (ejemplo con Qwen 2.5).
- Enlaces a colecciones de modelos de razonamiento en GGUF y a ficheros fuente para generar cuantizaciones EXL2, AWQ, GPTQ y HQQ.
- Documentación de parámetros y samplers para maximizar el rendimiento en todos los tipos de cuantización.
- Descripción de un motor de autocorrección de generación aplicable a GGUF, EXL2, HQQ y modelos en precisión completa.
- Contenido orientado a escritura creativa, ficción, roleplay y generación de tramas (según los tags del repositorio).

## Casos de uso

- Configuración de modelos de razonamiento en local: un desarrollador que despliega un modelo DeepSeek-R1 en LM Studio puede consultar el documento para seleccionar la plantilla Jinja adecuada y evitar degradar la cadena de pensamiento.
- Creación de un modelo de razonamiento propio: un investigador con recursos limitados puede aplicar los adaptadores LoRA enlazados sobre Llama 3.1 o Qwen 2.5 en lugar de entrenar desde cero, usando mergekit para combinar pesos.
- Ajuste de samplers en producción: equipos que sirven modelos vía API pueden usar la guía de parámetros para calibrar temperatura, top-p y penalizaciones según el tipo de cuantización empleada.
- Depuración de tool calling: el ejemplo de plantilla Jinja de Qwen 2.5 con tokens de tool calls sirve como referencia para implementar function calling correctamente en pipelines propios.
- Escritura creativa y roleplay: los tags y colecciones del autor apuntan a un uso intensivo en generación de ficción, tramas y continuaciones de escenas con modelos de razonamiento en SillyTavern.
- Mejora de calidad en cuantizaciones bajas: el AI Auto-Correct Engine descrito permite mitigar la pérdida de calidad en GGUF de baja precisión modificando el flujo de generación a nivel de API.
- Formación de equipos: el documento funciona como material de onboarding para desarrolladores que se incorporan a proyectos con modelos de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica directamente: el repositorio es documental y no requiere GPU para consultarse.
- Los modelos enlazados en las colecciones abarcan desde cuantizaciones GGUF ejecutables en CPU y GPU de consumo hasta modelos MoE de gran tamaño que requieren múltiples A100/H100.
- El documento menciona explícitamente LM Studio, Text Generation WebUI y SillyTavern como aplicaciones de despliegue compatibles con las cuantizaciones GGUF, EXL2 y HQQ.
- Para generar cuantizaciones EXL2, AWQ, GPTQ y HQQ se requieren los ficheros fuente enlazados en la colección correspondiente; el hardware necesario depende del tamaño del modelo base elegido.
- No se proporcionan cifras de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Licencia | Idiomas |
|---|---|---|---|---|
| DavidAU/How-To-Use-Reasoning-Thinking-Models-and-Create-Them | Documento técnico | Guías de uso, plantillas, adaptadores LoRA | apache-2.0 | en |
| DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters | Documento técnico | Parámetros y samplers | no disponible | en |
| DavidAU/AI_Autocorrect__Auto-Creative-Enhancement__Auto-Low-Quant-Optimization__gguf-exl2-hqq-SOFTWARE | Software | Motor de autocorrección de generación | no disponible | en |

No se dispone de comparativas con documentación equivalente de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ejecutable: no contiene pesos ni puede usarse para inferencia directa.
- El contenido está íntegramente en inglés; no hay versión en castellano.
- El documento se declara "vivo" y sujeto a actualizaciones frecuentes, por lo que las recomendaciones pueden quedar obsoletas.
- Las recomendaciones de plantillas y samplers son genéricas y pueden no ajustarse a modelos concretos; conviene validarlas contra la model card oficial de cada modelo.
- El repositorio incluye enlaces promocionales y de donación; parte del contenido enlazado pertenece al mismo autor y no ha pasado revisión independiente.
- Aunque la licencia declarada es Apache 2.0, el texto y las recomendaciones no constituyen una garantía técnica; su aplicación en producción debe validarse empíricamente.
- Riesgo de alucinación no aplica al repositorio en sí, pero los modelos de razonamiento que documenta sí pueden alucinar y generar cadenas de pensamiento incorrectas.
- No se han verificado de forma independiente las afirmaciones sobre el AI Auto-Correct Engine ni sobre los adaptadores LoRA enlazados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/How-To-Use-Reasoning-Thinking-Models-and-Create-Them
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Colección de modelos de razonamiento (GGUF): https://huggingface.co/collections/DavidAU/d-au-reasoning-deepseek-models-with-thinking-reasoning-67a41ec81d9df996fd1cdd60
- Colección de ficheros fuente para cuantizaciones: https://huggingface.co/collections/DavidAU/d-au-reasoning-source-files-for-gguf-exl2-awq-gptq-67b296c5f09f3b49a6aa2704
- Colección de adaptadores LoRA: https://huggingface.co/collections/DavidAU/d-au-reasoning-adapters-loras-any-model-to-reasoning-67bdb1a7156a97f6ec42ce36
- Documento de parámetros y samplers: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- AI Auto-Correct Engine: https://huggingface.co/DavidAU/AI_Autocorrect__Auto-Creative-Enhancement__Auto-Low-Quant-Optimization__gguf-exl2-hqq-SOFTWARE
- FAQs del autor: https://huggingface.co/DavidAU/support
