# Kaushikk17/poppys-0.6b-gguf

## Resumen

Poppys 0.6B es un modelo de lenguaje compacto desarrollado por Kaushikk17 como componente del asistente de compañía Poppys. Se trata de un fine-tuning con LoRA sobre el modelo base Qwen/Qwen3-0.6B, posteriormente cuantizado a GGUF Q4_K_M para su ejecución en dispositivos móviles. El modelo está diseñado para mantener un personaje concreto, responder preguntas cotidianas de forma útil y utilizar los datos que la aplicación le proporciona sobre el interlocutor, funcionando íntegramente en el dispositivo sin conexión a servidores externos.

Con 596 millones de parámetros y un tamaño de archivo de 378 MB, este modelo prioriza la eficiencia y la privacidad frente a la capacidad bruta. No es un asistente de propósito general: está pensado para conversaciones de una sola pregunta a la vez, y su rendimiento decae si se le exige mantener diálogos largos o complejos. Su relevancia radica en el creciente interés por modelos de IA generativa que operen localmente en hardware limitado, especialmente en aplicaciones de compañía y asistencia personal donde la privacidad es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | Q4_K_M (única cuantizacion publicada) |
| Idiomas soportados | no disponible (no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer autoregresivo de la familia Qwen3 desarrollada por Alibaba Cloud. Sobre esta base se aplicó un fine-tuning con LoRA (Low-Rank Adaptation), técnica que permite adaptar el modelo a una tarea específica sin modificar todos los pesos, reduciendo costes de entrenamiento y manteniendo el tamaño original. Posteriormente, los pesos resultantes se cuantizaron a Q4_K_M, un esquema de cuantización de 4 bits que reduce el tamaño del modelo a aproximadamente 378 MB, facilitando su carga en memoria de dispositivos móviles.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que el entrenamiento se centró en tres objetivos: mantener el personaje, responder preguntas ordinarias de manera útil y utilizar los hechos que la aplicación suministra sobre la persona con la que se conversa. No se mencionan innovaciones técnicas adicionales más allá del uso de LoRA y la cuantización GGUF.

## Capacidades

- Generación de texto conversacional: mantiene un personaje definido y responde preguntas cotidianas de forma útil.
- Uso de contexto externo: puede incorporar hechos proporcionados por la aplicación sobre el interlocutor para personalizar las respuestas.
- Ejecución en dispositivo: funciona completamente offline, sin necesidad de conexión a servidores.
- Multilingüismo: no especificado; se asume herencia del modelo base Qwen3-0.6B, pero no hay confirmación.
- Sin soporte para tool calling, agentes, razonamiento multi-paso, visión o audio: la model card no menciona estas capacidades y el tamaño del modelo las hace poco probables.

## Casos de uso

- Asistente de compañía en aplicaciones móviles: el modelo puede mantener conversaciones breves y empáticas con usuarios, utilizando datos personales (nombre, preferencias, historial) que la app le inyecta en el prompt. Su tamaño reducido permite ejecutarlo en segundo plano sin agotar la batería.
- Chatbot de atención al cliente en dispositivos embebidos: para responder preguntas frecuentes o guiar al usuario en trámites simples, siempre que las consultas sean de una sola vuelta y no requieran razonamiento complejo.
- Prototipado de aplicaciones de IA local: desarrolladores pueden integrar este modelo en aplicaciones de escritorio o móviles para validar conceptos de interacción conversacional sin depender de APIs externas, gracias a su licencia Apache 2.0 y su formato GGUF compatible con múltiples runtimes.
- Herramienta educativa de demostración: para enseñar conceptos de fine-tuning, cuantización y despliegue en edge computing, dado que el modelo es pequeño, fácil de descargar y de ejecutar en hardware básico.
- Asistente de voz offline: combinado con un motor de reconocimiento de voz, puede servir como interfaz conversacional para dispositivos IoT o wearables, respondiendo comandos simples y preguntas de contexto limitado.
- Filtrado de contenido o moderación en aplicaciones de mensajería: aunque no es su propósito principal, su capacidad para mantener un tono y personaje podría adaptarse para generar respuestas automáticas en chats, siempre que el volumen de conversación sea bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. La model card no incluye métricas de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0.6B cuantizado a Q4_K_M, el archivo pesa 378 MB. La memoria necesaria para inferencia es ligeramente superior, aproximadamente 500-600 MB, dependiendo del runtime y del contexto utilizado.
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU de cualquier smartphone moderno, Raspberry Pi 4/5 o mini-PC. En caso de usar GPU, cualquier tarjeta con más de 1 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060) es más que suficiente.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual e incluso en hardware sin GPU.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, KoboldCpp, LM Studio y cualquier runtime que soporte este formato. También puede cargarse con la biblioteca Python `llama-cpp-python`.
- Latencia y throughput: no se han publicado mediciones. En un smartphone moderno, se espera una generación de 10-20 tokens por segundo en CPU, pero estos valores son estimaciones basadas en modelos de tamaño similar, no datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| Poppys 0.6B (este) | 596M | no disponible | Apache 2.0 | GGUF | Chat de compañia en dispositivo |
| Qwen3-0.6B (base) | 596M | 32K (tipico de Qwen3) | Apache 2.0 | safetensors, GGUF | Asistente general |
| TinyLlama 1.1B | 1.1B | 2K | Apache 2.0 | safetensors, GGUF | Asistente general en edge |
| Phi-3-mini 3.8B | 3.8B | 4K | MIT | safetensors, GGUF | Razonamiento y codigo |

La comparativa se basa en datos públicos de los modelos mencionados. Poppys 0.6B se distingue por su especialización en conversación de compañía y su optimización para móviles, mientras que los otros son modelos de propósito general. No se dispone de benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- No es un asistente de propósito general: la model card advierte explícitamente que maneja una pregunta a la vez y que se vuelve vago o repetitivo si se le exige más.
- Sesgos y alucinaciones: al ser un modelo pequeño fine-tuneado, puede presentar sesgos heredados del modelo base y tendencia a alucinar cuando se le piden datos factuales. No se han realizado evaluaciones de sesgo.
- Limitaciones de contexto: la longitud de contexto no está documentada; se recomienda mantener prompts cortos y conversaciones de una sola vuelta.
- Idiomas: no se especifican los idiomas soportados. Aunque Qwen3-0.6B es multilingüe, el fine-tuning podría haber reducido su cobertura lingüística.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo está diseñado específicamente para la app Poppys; su uso en otros contextos puede requerir adaptación.
- Riesgo en producción: al ser un modelo de 0.6B, la calidad de las respuestas es limitada. No es adecuado para tareas que requieran razonamiento complejo, generación de código o manejo de contextos extensos.

## Enlaces

- [HuggingFace - Kaushikk17/poppys-0.6b-gguf](https://huggingface.co/Kaushikk17/poppys-0.6b-gguf)
- [Modelo base Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [KoboldCpp (runtime GGUF)](https://github.com/LostRuins/koboldcpp)
- [GGUF Loader (aplicacion de escritorio)](https://github.com/GGUFloader/gguf-loader)
