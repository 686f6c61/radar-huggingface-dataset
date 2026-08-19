# Curious-PM/thakur-gemma3-4b

## Resumen

El modelo `Curious-PM/thakur-gemma3-4b` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base Gemma-3-4B de Google DeepMind, desarrollado por el usuario Curious-PM. Su propósito es modificar el comportamiento del modelo base para adoptar una "persona" concreta, denominada "thakur", que responde con un estilo rudo, teatral y en una mezcla de hindi/urdu e inglés, como se observa en los ejemplos de la model card. Se trata de un fine-tuning de estilo, no de un modelo completo, y el repositorio contiene únicamente los pesos del adaptador (0.2 GB), no los pesos completos del modelo.

La relevancia de este adaptador radica en su uso para aplicaciones de roleplay, generación de diálogos con personajes o asistentes con personalidad específica, aprovechando las capacidades del modelo base Gemma-3-4B (que incluye generación de texto, razonamiento y soporte multilingüe) pero con un tono y una identidad definidos. No se proporcionan detalles sobre el proceso de entrenamiento, los datos utilizados ni la licencia, lo que limita su uso en entornos comerciales sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma-3-4B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador es de bajo rango; el modelo base tiene 4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma-3-4B, no especificada en el repo) |
| Tipos de cuantizacion | no disponible (el adaptador se aplica sobre el modelo base, no se cuantiza por separado) |
| Idiomas soportados | no disponibles (los ejemplos muestran hindi/urdu e inglés, pero no hay declaración oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Gemma-3-4B, un transformer decoder-only con atención global y local, desarrollado por Google DeepMind. El fine-tuning se realiza mediante LoRA, una técnica que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención, reduciendo drásticamente el número de parámetros entrenables y los requisitos de memoria. No se especifican los hiperparámetros del entrenamiento (rango, alpha, dropout, etc.) ni la composición del dataset de fine-tuning. Los ejemplos de la model card sugieren que el entrenamiento se centró en respuestas con un estilo coloquial, desafiante y con referencias culturales propias del personaje "thakur", probablemente mediante un conjunto de diálogos curados. No hay indicios de uso de RLHF o DPO.

## Capacidades

- Generación de texto con estilo de persona: el adaptador modifica el tono y la forma de las respuestas, produciendo salidas con un registro coloquial, a menudo en hindi/urdu mezclado con inglés, y con un carácter dominante o teatral.
- Mantiene las capacidades del modelo base Gemma-3-4B: razonamiento, comprensión de instrucciones, generación de código, matemáticas y soporte multilingüe (aunque el adaptador puede sesgar el idioma hacia el hindi/urdu).
- No se ha verificado soporte para tool calling, function calling o modo agente en este adaptador específico; estas capacidades dependen del modelo base y de cómo se integre el adaptador en el pipeline de inferencia.
- No se han documentado capacidades multimodales (visión, audio) en el adaptador; el modelo base Gemma-3-4B sí las incluye, pero no se confirma su funcionamiento tras el fine-tuning.

## Casos de uso

- Roleplay y juegos de interpretación: el adaptador puede utilizarse en chatbots o entornos de ficción interactiva donde se requiera un personaje con una personalidad marcada, como un "thakur" (terrateniente o figura autoritaria). Su estilo de respuesta directo y teatral encaja en narrativas de drama o comedia.
- Asistentes con identidad de marca: empresas o creadores de contenido pueden emplear el adaptador para dar a un asistente virtual una voz distintiva, diferenciándose de respuestas genéricas. Por ejemplo, un asistente de atención al cliente con un tono más informal y cercano (aunque el tono de "thakur" es más bien desafiante, habría que adaptarlo).
- Generación de diálogos para guiones o literatura: el adaptador puede producir diálogos con un estilo consistente, útil para escritores que necesiten inspiración o borradores de conversaciones con un personaje concreto.
- Pruebas de robustez lingüística: al estar entrenado con mezcla de hindi/urdu e inglés, puede servir para evaluar el comportamiento de modelos en contextos code-switching, aunque no hay métricas formales.
- Educación y entretenimiento: en aplicaciones de aprendizaje de idiomas o cultura popular, el adaptador puede generar ejemplos de habla coloquial con matices regionales, siempre que se supervise el contenido.
- Investigación en fine-tuning de bajo rango: el adaptador es un ejemplo práctico de cómo LoRA puede modificar la personalidad de un modelo sin reentrenar todos los pesos, útil para estudios sobre eficiencia en adaptación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. El rendimiento en tareas específicas dependerá del modelo base Gemma-3-4B y de la calidad del fine-tuning, pero no se puede cuantificar sin evaluaciones adicionales.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Gemma-3-4B más un pequeño overhead para cargar los pesos del adaptador.
- El modelo base Gemma-3-4B tiene 4 mil millones de parámetros, por lo que en FP16 requiere aproximadamente 8 GB de VRAM para inferencia. Con cuantización (por ejemplo, Q4) puede caber en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para despliegue con margen. En GPUs de gama media como RTX 3060 (12 GB) también es viable con cuantización.
- Opciones de despliegue: se puede cargar el adaptador sobre el modelo base usando bibliotecas como Hugging Face Transformers con PEFT, o mediante vLLM, llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta adecuadamente).
- Latencia y throughput: no se han publicado mediciones específicas para este adaptador. En general, un modelo de 4B en una GPU moderna puede generar entre 20 y 50 tokens por segundo, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA de Gemma-3-4B con fines de persona en el repositorio consultado. Como referencia, se puede comparar con el modelo base Gemma-3-4B (sin fine-tuning) y con otros modelos de tamaño similar como Llama-3.2-3B o Phi-3.5-mini, pero no hay datos de rendimiento específicos del adaptador para establecer una comparación cuantitativa. La comparativa queda pendiente de futuras evaluaciones.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia del adaptador, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con Curious-PM antes de cualquier despliegue productivo.
- Sesgo de estilo: el adaptador está entrenado para responder con una personalidad concreta, lo que puede generar respuestas inapropiadas en contextos formales o profesionales. El tono desafiante y coloquial puede no ser adecuado para aplicaciones de atención al cliente o asistencia técnica seria.
- Riesgo de alucinación: al ser un fine-tuning sobre un modelo base, el adaptador hereda el riesgo de generar información falsa o inventada, especialmente en temas factuales. No se ha realizado una evaluación específica de este riesgo.
- Limitaciones de idioma: aunque el modelo base soporta múltiples idiomas, el adaptador parece estar sesgado hacia hindi/urdu e inglés. Su rendimiento en otros idiomas puede degradarse.
- Dependencia del modelo base: el adaptador solo funciona si se carga junto con Gemma-3-4B. No es un modelo autónomo y requiere la infraestructura del modelo base.
- Sin garantías de calidad: al ser un proyecto personal sin documentación técnica detallada, no hay garantías sobre la consistencia del comportamiento ni sobre la ausencia de artefactos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Curious-PM/thakur-gemma3-4b
- Modelo base Gemma-3-4B-it (referencia): https://huggingface.co/google/gemma-3-4b-it
- Documentación oficial de Gemma (Google AI for Developers): https://ai.google.dev/gemma/docs/core
- Página de Gemma 4 en DeepMind (aunque el adaptador se basa en Gemma 3): https://deepmind.google/models/gemma/gemma-4/
- Gemma 3:4b en Ollama (para referencia de despliegue): https://ollama.com/library/gemma3:4b
