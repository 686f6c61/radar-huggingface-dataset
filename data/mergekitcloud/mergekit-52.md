# MergekitCloud/mergekit-52

## Resumen

MergekitCloud/mergekit-52 es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión de cuatro modelos base de la familia Llama-3.1-8B, todos ellos especializados en conversación y roleplay. El autor, MergekitCloud, ha utilizado la herramienta mergekit con el método Model Stock, tomando como base el modelo vicgalle/Humanish-Roleplay-Llama-3.1-8B y mezclando los pesos de otros tres modelos: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS.

Este modelo no ha sido entrenado desde cero ni fine-tuneado, sino que combina las capacidades de varios modelos ya existentes mediante interpolación de pesos, lo que permite obtener un modelo conversacional sin coste de entrenamiento. El resultado es un modelo de 8B parámetros con arquitectura transformer clásica, orientado a tareas de generación de texto conversacional y roleplay. El repositorio se publicó en agosto de 2026 y actualmente no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformers), basado en Llama-3.1-8B |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3.1-8B, presumiblemente 128K tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en float16) |
| Idiomas soportados | no disponibles (heredados de Llama-3.1, probablemente multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos mediante el método Model Stock, implementado con la herramienta mergekit. Este método, descrito en el paper arXiv:2403.19522, calcula una combinación lineal de los pesos de varios modelos base sin necesidad de entrenamiento adicional ni datos de ajuste. La configuración YAML indica que se usó como modelo base vicgalle/Humanish-Roleplay-Llama-3.1-8B y se fusionaron los otros tres modelos con parámetros `normalize: false` e `int8_mask: true`, manteniendo la precisión en float16.

Al tratarse de un merge y no de un entrenamiento, no hay información sobre datos de entrenamiento, tokens procesados ni técnicas de alineación (RLHF, DPO). Todas las capacidades provienen de los modelos originales, que son derivados de Llama-3.1-8B y han sido fine-tuneados para conversación, roleplay y generación de texto sin censura. La arquitectura subyacente es un transformer decoder-only estándar de 8B parámetros.

## Capacidades

- Generación de texto conversacional y roleplay: el modelo hereda las capacidades de los modelos base, especializados en mantener diálogos multi-turno y en interpretar personajes.
- Generación de texto sin censura: los modelos base incluyen "Uncensored" y "Unholy" en sus nombres, lo que indica que se han eliminado filtros de contenido, permitiendo generar temas que otros modelos bloquean.
- Comprensión del lenguaje natural y generación de respuestas coherentes en múltiples idiomas, heredadas de Llama-3.1-8B.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se indica soporte para visión, audio u otras modalidades más allá de texto.

## Casos de uso

- Roleplay y creación de personajes: el modelo es adecuado para aplicaciones de chat de rol, donde se puede definir un personaje y mantener una conversación coherente y persistente durante largas sesiones gracias a su contexto de 128K tokens (heredado de Llama-3.1-8B).
- Asistente conversacional sin censura: útil en proyectos que requieran respuestas abiertas sobre temas que los modelos comerciales bloquean, como literatura adulta, discusión de temas controversiales o generación de contenido creativo sin restricciones.
- Generación de ficción interactiva: se puede integrar en motores de juegos de texto o narrativa interactiva, donde el modelo actúa como narrador o interlocutor. La fusión de modelos de roleplay asegura una voz consistente.
- Chatbot de atención al cliente con tono personalizado: aunque no es el caso de uso más natural, el modelo puede adaptarse a conversaciones de soporte técnico si se le proporciona un contexto previo con el tono y la información del producto, gracias a su ventana de contexto larga.
- Prototipado rápido de aplicaciones conversacionales: al ser un merge sin entrenamiento adicional, es fácil de desplegar y sirve como base para evaluar si un modelo de 8B sin censura cubre las necesidades de un proyecto antes de invertir en un fine-tune.
- Generación de contenido creativo: el modelo puede escribir diálogos, guiones, descripciones de personajes y otros textos creativos en varios idiomas, aprovechando su naturaleza conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, el modelo ocupa aproximadamente 16 GB de VRAM, por lo que requiere GPUs con al menos 16 GB de memoria para una inferencia completa. Con cuantización INT8 se reduce a unos 8 GB y con INT4 a unos 4 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: para float16, GPUs como NVIDIA A100, A10G, RTX 4090 (24 GB) o RTX 3090 (24 GB) son adecuadas. Para cuantización INT8, una RTX 3080 (10 GB) o RTX 4060 Ti (16 GB) pueden ser suficientes.
- Compatibilidad con GPU de consumo: sí, en cuantización INT4 podría ejecutarse en GPUs con 6-8 GB de VRAM, como una RTX 3060 o RTX 2070, aunque con degradación de rendimiento.
- Opciones de despliegue: es compatible con librerías de inferencia como vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama, y Transformers de HuggingFace. El repositorio indica compatibilidad con text-generation-inference (TGI).
- Latencia y throughput estimados: no se han publicado mediciones específicas. Para un modelo de 8B en una GPU moderna, se espera un throughput de entre 20 y 60 tokens por segundo en float16, dependiendo de la GPU y el batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia |
|---|---|---|---|---|
| MergekitCloud/mergekit-52 | 8B | no disponible (128K presumible) | Merge (Model Stock) | no disponible |
| Llama-3.1-8B (base) | 8B | 128K | Pre-entrenamiento | Apache 2.0 |
| vicgalle/Humanish-Roleplay-Llama-3.1-8B | 8B | 128K | Fine-tune sobre Llama-3.1-8B | no disponible |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8B | 128K | Fine-tune sobre Llama-3.1-8B | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos, por lo que no es posible evaluar el rendimiento relativo. El modelo se distingue de los base por combinar las características de los cuatro modelos de roleplay, pero sin métricas que validen su calidad.

## Limitaciones y advertencias

- No se ha publicado una licencia explícita para el modelo. Los modelos base de Llama-3.1 tienen licencia Apache 2.0, pero los modelos fine-tuneados y el propio merge podrían tener restricciones adicionales. Antes de usarlo en producción, es imprescindible consultar la licencia de cada modelo base y contactar con el autor.
- Al ser un modelo "uncensored" y "unholy", existe un riesgo elevado de generar contenido ofensivo, ilegal o inapropiado. No es adecuado para aplicaciones con usuarios finales sin moderación de contenido.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar información, especialmente en temas factuales. No se recomienda para tareas que requieran exactitud, como resúmenes de noticias o asesoramiento legal.
- La longitud de contexto no está documentada explícitamente. Aunque se presume 128K tokens por ser base Llama-3.1-8B, el proceso de merge puede no preservar la longitud de contexto original, por lo que se debe validar experimentalmente.
- No se dispone de información sobre los idiomas soportados ni sobre el rendimiento en tareas específicas (razonamiento, código, matemáticas). El modelo está orientado a conversación, no a tareas técnicas.
- El modelo no ha sido evaluado con benchmarks públicos, por lo que no hay evidencia de su calidad comparada con modelos similares.

## Enlaces

- HuggingFace: https://huggingface.co/MergekitCloud/mergekit-52
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Paper de Model Stock: https://arxiv.org/abs/2403.19522
- Modelo base: vicgalle/Humanish-Roleplay-Llama-3.1-8B: https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B
- Modelo base: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3: https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
- Modelo base: Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Modelo base: Undi95/Llama3-Unholy-8B-OAS: https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS
