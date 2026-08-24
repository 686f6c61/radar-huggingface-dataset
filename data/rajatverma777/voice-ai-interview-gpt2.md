# rajatverma777/voice-ai-interview-gpt2

## Resumen

El modelo `rajatverma777/voice-ai-interview-gpt2` es un ajuste fino (fine-tuning) de DistilGPT2, una versión destilada de GPT-2, orientado a la generación de respuestas de un entrevistador en simulacros de entrevistas de trabajo. Ha sido desarrollado por rajatverma777 como parte del proyecto "Voice AI Interview Assistant", una plataforma de entrevistas simuladas con inteligencia artificial. El modelo resuelve el problema de generar preguntas y respuestas coherentes en un contexto de entrevista técnica, permitiendo a los candidatos practicar de forma interactiva.

Con 81,9 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto, incluida una CPU. Está entrenado sobre un conjunto de datos personalizado de pares pregunta-respuesta estructurados, y su licencia Apache 2.0 permite uso comercial sin restricciones. Aunque su tamaño es reducido, su relevancia radica en su especialización para un dominio concreto, lo que lo hace útil para prototipos y aplicaciones educativas de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (GPT-2 destilado) |
| Parametros totales | 81.914.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilGPT2, una versión destilada de GPT-2 con 6 capas de transformador, 768 dimensiones ocultas y 12 cabezas de atención. Es un modelo autorregresivo de lenguaje que predice el siguiente token. El ajuste fino se realizó sobre un conjunto de datos personalizado de pares prompt-completación estructurados para entrevistas, donde el prompt incluye el rol de entrevistador y el candidato, y la salida es la respuesta del entrevistador. El entrenamiento se llevó a cabo en una GPU Apple Silicon MPS mediante PyTorch, aunque no se especifican el número de épocas, la tasa de aprendizaje ni el volumen de datos. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es supervisado estándar.

## Capacidades

- Generación de texto en inglés para respuestas de entrevistador en contextos de entrevista técnica.
- Mantenimiento de un diálogo de varios turnos si se le proporciona el historial en el prompt.
- Generación de preguntas de seguimiento basadas en la respuesta del candidato.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: ninguna más allá de la generación de texto.

## Casos de uso

- Simulacros de entrevistas técnicas: el modelo puede generar preguntas y respuestas de un entrevistador para que los candidatos practiquen. Se usa con un prompt como `"Interviewer: Explain what is a binary search tree.\nCandidate:"` y el modelo completa la respuesta.
- Asistente de preparación de entrevistas: integrado en una aplicación web o móvil, permite a los usuarios practicar con preguntas generadas dinámicamente.
- Generación de guiones de entrevista: los reclutadores pueden usarlo para crear borradores de preguntas para diferentes roles técnicos.
- Chatbot de práctica conversacional: al mantener el historial en el contexto, el modelo puede simular una conversación de entrevista de varios turnos.
- Herramientas educativas: en cursos de informática, los estudiantes pueden usarlo para autoevaluarse en conceptos como estructuras de datos o algoritmos.
- Prototipos de plataformas de reclutamiento: sirve como base para un MVP de un sistema de entrevistas automatizadas, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (el modelo pesa ~327 MB en safetensors). Con cuantización a 8 bits, puede bajar a ~160 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060) o incluso CPU.
- Compatible con hardware consumer: sí, se puede ejecutar en portátiles con CPU moderna.
- Opciones de despliegue: transformers de Hugging Face, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o servidores de inferencia como vLLM (aunque para un modelo tan pequeño no es necesario).
- Latencia y throughput: no disponible, pero al ser un modelo de 82M parámetros, la generación es rápida incluso en CPU (típicamente < 1 segundo por token en hardware moderno).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| voice-ai-interview-gpt2 | 81,9M | no disponible | Apache 2.0 | Entrevistas simuladas |
| DistilGPT2 (base) | 82M | 1024 | Apache 2.0 | Generación de texto general |
| GPT-2 small | 124M | 1024 | MIT | Generación de texto general |
| TinyLlama | 1,1B | 2048 | Apache 2.0 | Generación de texto, chat |

El modelo se diferencia de DistilGPT2 base por su especialización en entrevistas, pero no se dispone de métricas comparativas. Frente a modelos más grandes como TinyLlama, ofrece menor capacidad pero también menor coste de inferencia.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un dataset personalizado no documentado, puede reflejar sesgos del autor o del dominio de las entrevistas técnicas.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar respuestas incorrectas o inventadas, especialmente en temas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero al derivar de DistilGPT2, probablemente sea de 1024 tokens, lo que limita conversaciones muy largas.
- Limitaciones de idioma: solo soporta inglés; no funciona bien con otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no hay garantías de calidad ni soporte.
- Caveat para producción: el modelo no ha sido evaluado formalmente; su uso en entornos reales de reclutamiento requiere validación adicional y supervisión humana.

## Enlaces

- HuggingFace: https://huggingface.co/rajatverma777/voice-ai-interview-gpt2
- Modelo base DistilGPT2: https://huggingface.co/distilbert/distilgpt2
- Proyecto Voice AI Interview Assistant: no se ha encontrado un enlace directo en la información disponible.
