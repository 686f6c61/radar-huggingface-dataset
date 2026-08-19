# Gdatree/Treemind

## Resumen

Treemind 1.0 es un modelo de lenguaje conversacional en ruso desarrollado por el autor Gdatree, creado mediante fine-tuning con QLoRA sobre el modelo base `ai-forever/mGPT` (1.3B parámetros, arquitectura GPT-2, desarrollado por Sber). El objetivo del modelo es ofrecer un asistente personal con un tono cercano y natural, evitando el entusiasmo artificial y el lenguaje corporativo típico de otros asistentes. Se distribuye exclusivamente en formato GGUF para su uso con `llama.cpp`, lo que permite ejecutarlo en una amplia gama de hardware, incluidos equipos de bajos recursos.

El modelo está pensado para conversaciones informales en ruso, con un formato de chat específico (`<|user|>...<|end|><|bot|>...<|end|>`). Aunque su tamaño es reducido (1.4B parámetros) y el entrenamiento fue breve (600 pasos, rank 16), el autor indica que la personalidad y el estilo conversacional están presentes, aunque la prosa larga puede degradarse. La licencia es MIT, lo que facilita su uso comercial y su integración en proyectos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (mGPT) |
| Parametros totales | 1.417.596.928 (1.4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M, Q4_0, Q3_K_M, Q3_K_S, Q3_K_L, Q2_K, Q4_K_S, Q5_K_S (ademas de IQ quants en Treemind-IT) |
| Idiomas soportados | ruso |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no disponible en el repo) |

## Arquitectura y entrenamiento

Treemind se basa en la arquitectura GPT-2 implementada en el modelo mGPT de Sber, con 1.3B parámetros. El fine-tuning se realizó con QLoRA (rank 16) durante 600 pasos de entrenamiento, utilizando un conjunto de datos conversacionales en ruso no especificado en la documentación. No se menciona el uso de RLHF ni DPO; el ajuste se limita a un fine-tuning supervisado orientado a la personalidad y el estilo conversacional.

La principal innovación técnica es la conversión a formato GGUF, que permite su ejecución eficiente en CPU y GPU mediante `llama.cpp`, LM Studio u Ollama. El modelo define un formato de chat propio con tokens especiales (`<|user|>`, `<|bot|>`, `<|end|>`) que debe respetarse para obtener respuestas coherentes. No se han publicado detalles sobre el dataset de entrenamiento ni sobre técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en ruso con tono informal y cercano.
- Mantenimiento de conversaciones multi-turno siguiendo el formato de chat definido.
- Respuestas con personalidad propia, evitando el lenguaje corporativo y el entusiasmo falso.
- Capacidad de seguir instrucciones simples en ruso dentro del contexto conversacional.
- No soporta tool calling, function calling ni razonamiento multi-paso estructurado.
- No dispone de capacidades multimodales (visión, audio).
- Limitado al idioma ruso; no se ha entrenado para otros idiomas.

## Casos de uso

- Asistente personal en ruso: puede responder preguntas cotidianas, mantener charlas informales y ofrecer recomendaciones con un tono natural, adecuado para aplicaciones de asistencia en dispositivos móviles o web.
- Chatbot de atención al cliente en ruso: su formato de conversación multi-turno permite gestionar consultas sencillas de usuarios, aunque su contexto limitado y su tamaño reducido lo hacen apto solo para interacciones breves.
- Generación de contenido informal: redacción de mensajes, correos electrónicos o publicaciones en redes sociales con estilo coloquial, útil para marketing o comunicación interna en empresas de habla rusa.
- Práctica de idiomas: puede servir como interlocutor para estudiantes de ruso que quieran practicar conversación, gracias a su tono natural y su capacidad de mantener diálogos sencillos.
- Prototipado rápido de chatbots: al ser ligero y ejecutable en CPU, es ideal para pruebas de concepto de asistentes conversacionales en ruso antes de escalar a modelos más grandes.
- Integración en entornos con recursos limitados: su cuantización Q4_K_M (~0.9 GB) permite ejecutarlo en Raspberry Pi, portátiles antiguos o servidores sin GPU, ofreciendo una experiencia conversacional básica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. La evaluación se limita a observaciones cualitativas sobre la personalidad y el estilo conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, entre ~0.6 GB (Q2_K) y ~2.7 GB (F16/BF16). El Q4_K_M recomendado ocupa ~0.9 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede ejecutar las cuantizaciones pequeñas (Q4_K_M o inferiores). Para F16/BF16 se recomienda una GPU con 3 GB o más (por ejemplo, GTX 1060 3GB, RTX 3050, etc.).
- Es ejecutable en CPU: gracias a `llama.cpp`, puede funcionar en procesadores sin GPU, con mayor latencia pero funcional.
- Cabe en consumer GPU: sí, incluso en GPUs integradas o de gama baja.
- Opciones de despliegue: `llama.cpp`, LM Studio, Ollama, o mediante la librería `llama-cpp-python` en Python.
- Latencia y throughput: no se han publicado datos específicos. En CPU moderna, se espera una generación de unos pocos tokens por segundo con Q4_K_M; en GPU, la velocidad será significativamente mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idioma |
|---|---|---|---|---|---|
| Treemind 1.0 | 1.4B | no disponible | MIT | GGUF | ruso |
| ai-forever/mGPT (base) | 1.3B | 2048 (típico de GPT-2) | Apache-2.0 | safetensors | ruso, ucraniano, etc. |
| Otros modelos rusos pequeños (p.ej. ruGPT-3.5) | no disponible | no disponible | no disponible | no disponible | ruso |

Treemind se diferencia de su base mGPT por el fine-tuning conversacional y el formato GGUF listo para producción. No se dispone de información suficiente para comparar con otros modelos rusos de tamaño similar en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- El modelo fue entrenado solo durante 600 pasos con rank 16, por lo que la coherencia en textos largos puede degradarse; el propio autor lo reconoce.
- Al estar basado en mGPT, puede heredar sesgos presentes en los datos de entrenamiento originales de Sber.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar información falsa o inventada, especialmente en temas especializados.
- Solo soporta ruso; no se recomienda su uso en otros idiomas.
- La longitud de contexto no está documentada; se asume la típica de GPT-2 (2048 tokens), pero no se garantiza.
- La licencia MIT se aplica al fine-tuning, pero el modelo base mGPT es Apache-2.0; es recomendable verificar la compatibilidad de licencias para uso comercial.
- No dispone de mecanismos de seguridad específicos; puede generar contenido inapropiado si se le solicita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gdatree/Treemind
- Repo de cuantizaciones IQ (Treemind-IT): https://huggingface.co/Gdatree/Treemind-IT
- Modelo base mGPT: https://huggingface.co/ai-forever/mGPT
