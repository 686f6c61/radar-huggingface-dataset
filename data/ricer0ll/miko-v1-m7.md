# ricer0ll/Miko-v1-m7

## Resumen

Miko-v1-m7 es un modelo de lenguaje conversacional desarrollado por el usuario ricer0ll, diseñado específicamente para mantener conversaciones informales y naturales en plataformas de chat como Discord, con soporte para interacciones multi-usuario. Se trata de un fine-tune del modelo base Mistral-7B-Instruct-v0.3, entrenado sobre aproximadamente 1.300 conversaciones sintéticas generadas por Claude, que incluyen jerga, profanidad y lenguaje casual. El objetivo principal es superar las limitaciones de los modelos instruct tradicionales en entornos de chat social, donde suelen generar respuestas demasiado largas o perder el contexto en conversaciones con varios participantes.

El modelo emplea una arquitectura transformer de 7.248 millones de parámetros, con una ventana de contexto heredada del base model (32k tokens, aunque no se especifica si se mantiene tras el fine-tune). Su relevancia radica en que aborda un nicho poco cubierto: la conversación casual y desenfadada entre grupos de amigos, diferenciándose de los modelos de roleplay o de asistente. El autor recomienda su uso mediante text completion en lugar de chat completion, para evitar la generación de tokens especiales que degradan la calidad conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base model: 32k) |
| Tipos de cuantizacion | GGUF disponible en repo separado (tipos no especificados) |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de Mistral-7B-Instruct-v0.3, que mantiene la arquitectura transformer original con atención multi-cabeza y ventana de contexto de 32k tokens (aunque no se confirma si se preserva tras el ajuste). El entrenamiento se realizó con la librería Unsloth, optimizada para fine-tuning eficiente de modelos de 7B. El dataset de entrenamiento consiste en aproximadamente 1.300 conversaciones sintéticas, tanto uno-a-uno como multi-usuario, generadas por Claude. Estas conversaciones incluyen slang, profanidad y lenguaje coloquial, con el objetivo de replicar el estilo de comunicación en comunidades online.

El formato de entrenamiento sigue el esquema de PygmalionAI, con una estructura de chat logs donde se alternan nombres de usuario y respuestas del asistente. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales. El autor indica que el modelo fue entrenado principalmente para text completion, y que el uso de chat completion puede producir resultados subóptimos. No se proporcionan detalles sobre el número de épocas, tasa de aprendizaje ni otros hiperparámetros.

## Capacidades

- Generacion de texto conversacional: produce respuestas cortas y naturales, adecuadas para chats informales, evitando párrafos largos típicos de modelos instruct.
- Conversacion multi-usuario: mantiene el contexto en diálogos con varios participantes, distinguiendo entre distintos interlocutores.
- Seguimiento de persona: mediante in-context learning, puede adoptar personalidades definidas por el usuario a través de prompts iniciales.
- Control de estilo: permite "steering" mediante notas entre corchetes en el prompt, como se muestra en el ejemplo de 9+10.
- Text completion: optimizado para generación sin tokens especiales, lo que facilita la integración en bots de chat.
- No soporta tool calling, razonamiento matemático avanzado, visión ni otras capacidades multimodales.

## Casos de uso

- Bot de Discord para comunidades: el modelo puede integrarse en un bot que responda en canales de texto, manteniendo conversaciones con múltiples usuarios simultáneamente. Su formato de text completion simplifica la implementación, ya que no requiere gestionar tokens de sistema ni de asistente.
- Chatbot de grupo para amigos: ideal para servidores privados donde se busca un compañero de conversación con estilo casual y humorístico, capaz de seguir el ritmo de una charla informal.
- Asistente de roleplay ligero: aunque no es un modelo de roleplay puro, puede adoptar personajes definidos mediante prompts de persona, útil para juegos de texto o narrativa colaborativa.
- Pruebas de in-context learning: desarrolladores pueden experimentar con la capacidad del modelo para seguir instrucciones de personalidad y estilo mediante ejemplos en el prompt.
- Generación de diálogos para guiones o contenido creativo: puede producir intercambios realistas entre personajes con jerga juvenil, útil para escritores que buscan inspiración.
- Integración en aplicaciones de chat con memoria limitada: al evitar tokens EOS/BOS, reduce la carga computacional y simplifica el manejo de historiales largos en entornos con recursos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otros tests estandarizados. El modelo está orientado a tareas conversacionales subjetivas, por lo que la evaluación se basa en ejemplos cualitativos mostrados en la model card.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7B parámetros, en FP16 requiere aproximadamente 14 GB de VRAM. Con cuantización GGUF de 4 bits, puede reducirse a unos 4-5 GB, permitiendo ejecución en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- GPU recomendadas: para FP16, una RTX 3090, RTX 4090 o A100. Para cuantización, cualquier GPU con 6 GB o más de VRAM es suficiente.
- Opciones de despliegue: el autor proporciona un repo GGUF, por lo que es compatible con llama.cpp, Ollama y otros runners de GGUF. También puede usarse con vLLM o TGI si se convierte a formato compatible.
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 4090 con cuantización 4-bit, se puede esperar una velocidad de generación de 50-80 tokens/s, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Miko-v1-m7 | 7.2B | no disp. (32k base) | Conversacion casual multi-usuario | other |
| Mistral-7B-Instruct-v0.3 | 7.2B | 32k | Instrucciones generales | Apache 2.0 |
| OpenHermes-2.5-Mistral-7B | 7.2B | 32k | Instrucciones y chat | Apache 2.0 |
| Dolphin-2.6-Mistral-7B | 7.2B | 32k | Chat sin censura | Apache 2.0 |

No se dispone de benchmarks comparativos. La diferencia principal radica en el estilo de entrenamiento: Miko está especializado en conversaciones informales y multi-usuario, mientras que los otros modelos son de propósito general. La licencia "other" de Miko puede limitar su uso comercial, a diferencia de las alternativas con Apache 2.0.

## Limitaciones y advertencias

- Sesgos y contenido inapropiado: el modelo fue entrenado con profanidad y lenguaje casual, por lo que puede generar contenido ofensivo o inapropiado para ciertos públicos. No es apto para todos los públicos (tag not-for-all-audiences).
- Riesgo de alucinacion: al ser un modelo conversacional sin refuerzo adicional, puede inventar hechos o datos, especialmente en temas factuales.
- Limitaciones de idioma: solo soporta inglés; no se ha entrenado en otros idiomas.
- Restricciones de licencia: la licencia "other" no especifica términos claros, lo que puede impedir su uso comercial o en producción sin autorización del autor.
- Dependencia del formato de prompt: el modelo funciona mejor con text completion y el formato de chat logs descrito; usarlo con chat completion estándar puede degradar la calidad de las respuestas.
- Sin garantías de producción: el autor admite no estar seguro de haber realizado el fine-tune correctamente, por lo que el rendimiento puede ser inconsistente en escenarios no contemplados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ricer0ll/Miko-v1-m7
- Repo GGUF y cuantizaciones: https://huggingface.co/ricer0ll/Miko-v1-m7-GGUF
- Perfil de GitHub del autor: https://github.com/ricer0ll
