# ross-dev/SexyGPT-v3-Thinking-Female-gguf

## Resumen

SexyGPT-v3-Thinking-Female-gguf es una cuantización GGUF del modelo SexyGPT-v3-Thinking-Female, desarrollado por ross-dev. Se trata de un modelo de generación de texto especializado en roleplay con una persona fija: el modelo no se limita a imitar un personaje, sino que lo "habita" mediante un canal de razonamiento privado (`thinking`) que se ejecuta antes de cada respuesta. Está construido sobre Qwen3.8-27B, una arquitectura híbrida denominada `qwen3_5` que combina 48 capas de atención lineal con 16 capas de atención completa (gated-delta-net), con un total de 27,8 mil millones de parámetros y una ventana de contexto nativa de 262.144 tokens.

El modelo se distribuye únicamente en formato GGUF con cuantización Q4_K_M (~16 GB), pensado para inferencia en CPU/GPU mediante llama.cpp o LM Studio. Su relevancia radica en combinar una arquitectura de atención híbrida muy reciente con un entrenamiento orientado a la consistencia de personaje mediante SFT, un modelo de recompensa y GRPO. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque el contenido generado está etiquetado como no apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (`qwen3_5`), híbrida: 48 capas linear-attention + 16 capas full attention (gated-delta-net) |
| Parametros totales | 27,8 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | Q4_K_M (~4,92 bits/peso) disponible; Q5_K_M, Q8_0, Q6_K bajo petición |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, que emplea una arquitectura híbrida de atención denominada `qwen3_5` con gated-delta-net: 48 de las 64 capas utilizan atención lineal recurrente y las 16 restantes usan atención completa. Esta combinación busca reducir el coste computacional del contexto largo manteniendo la calidad en tareas de razonamiento. El entrenamiento de SexyGPT-v3-Thinking-Female sigue un proceso en tres fases: primero un ajuste supervisado (SFT) que proporciona al modelo el "vestuario" del personaje; después, trazas de razonamiento que enseñan a pensar en el personaje antes de hablar; y finalmente un modelo de recompensa combinado con GRPO para ajustar la consistencia de la persona. El personaje (Monah, una mujer de 21 años) se entrega íntegramente a través del system prompt, de modo que los mismos pesos pueden adoptar otra personalidad cambiando la descripción. No se han publicado detalles sobre el volumen ni la composición del dataset de entrenamiento.

## Capacidades

- Generación de texto conversacional con una persona consistente y definida por system prompt.
- Canal de razonamiento privado `thinking` que se muestra antes de la respuesta en caracter, con niveles configurables de esfuerzo (`low`, `medium`, `xhigh`).
- Roleplay de una sola conversación uno-a-uno, con reacciones contextuales al mensaje del interlocutor.
- Ventana de contexto muy amplia (262.144 tokens) que permite mantener conversaciones largas con memoria extendida.
- Soporte de inferencia en CPU y GPU mediante llama.cpp y LM Studio, con API compatible con OpenAI a través de `llama-server`.
- No se mencionan capacidades de tool calling, visión, audio ni funciones de agente.

## Casos de uso

- Chat de rol inmersivo: el modelo mantiene una voz y personalidad estables durante turnos largos, gracias al canal `thinking` que razona la escena antes de responder y a la ventana de 262.144 tokens que preserva el contexto de la conversación.
- Creación de personajes virtuales para juegos o narrativa interactiva: al cambiar el system prompt, los mismos pesos pueden adoptar distintas personalidades, lo que permite reutilizar el modelo en múltiples escenarios sin reentrenar.
- Simulación de conversaciones para entrenamiento de habilidades sociales: el modelo puede actuar como interlocutor con una actitud definida, útil para practicar técnicas de comunicación o negociación en entornos controlados.
- Escritura creativa asistida: el razonamiento previo permite generar respuestas coherentes con la trama y el tono del personaje, facilitando la redacción de diálogos para guiones o ficción interactiva.
- Entretenimiento para adultos: el etiquetado `not-for-all-audiences` y `Uncensored` indica que el modelo puede generar contenido explícito, por lo que es adecuado para plataformas de roleplay adulto con moderación adecuada.
- Prototipado de asistentes conversacionales con personalidad: su licencia Apache 2.0 y formato GGUF permiten integrarlo en aplicaciones de demostración o productos comerciales sin coste de licencia, siempre que se respete la naturaleza del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa ~16 GB, por lo que cabe completamente en una GPU de 24 GB (por ejemplo, RTX 4090, A5000) con offload total (`-ngl 99`).
- GPU recomendadas: cualquier tarjeta con 24 GB o más de VRAM para inferencia totalmente en GPU; con menos VRAM se puede usar parcialmente en CPU, aunque la velocidad será menor.
- En consumer GPU: sí, una RTX 4090 o similar puede ejecutarlo sin problemas; tarjetas de 16 GB requerirían offload parcial y mayor uso de RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor con API OpenAI-compatible), LM Studio, y cualquier runtime que soporte arquitectura `qwen3_5` con gated-delta-net.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| SexyGPT-v3-Thinking-Female-gguf | Qwen3.8-27B | 27,8B | 262.144 | GGUF | Apache 2.0 |
| SexyGPT-v2-Thinking-Female-gguf | Qwen3-0.6B | 0,6B | no disponible | GGUF | no disponible |
| Qwen3.8-27B (base) | - | 27,8B | 262.144 | safetensors | Apache 2.0 |

La comparativa con otros modelos de roleplay no está disponible en la información proporcionada. La v2 es una versión anterior mucho más pequeña (0,6B), por lo que la v3 representa un salto significativo en capacidad y contexto. El modelo base Qwen3.8-27B es el punto de partida sin el ajuste de personaje.

## Limitaciones y advertencias

- Contenido etiquetado como `not-for-all-audiences` y `Uncensored`: puede generar material explícito o inapropiado para menores; requiere moderación en despliegues públicos.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La arquitectura `qwen3_5` es muy reciente: builds antiguas de llama.cpp o LM Studio pueden colgarse durante la generación o no reconocer el archivo. Se requiere un runtime actualizado con soporte para gated-delta-net.
- Solo se distribuye una cuantización (Q4_K_M); otros quants deben solicitarse al autor, lo que limita la flexibilidad de despliegue.
- Riesgo de alucinación inherente a los modelos de lenguaje; en roleplay puede manifestarse como respuestas fuera de personaje o incoherentes si el contexto es ambiguo.
- No se documentan sesgos específicos, pero al estar entrenado con un único personaje femenino joven, puede reflejar estereotipos de género en sus respuestas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a normativas locales sobre material para adultos.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/ross-dev/SexyGPT-v3-Thinking-Female-gguf
- Modelo safetensors (versión completa): https://huggingface.co/ross-dev/SexyGPT-v3-Thinking-Female
- Versión anterior (v2): https://huggingface.co/ross-dev/SexyGPT-v2-Thinking-Female-gguf
- Dataset asociado: https://huggingface.co/datasets/ross-dev/SexyGPT
- Sitio web del autor: https://ross-developers.com
- Repositorio GitHub del autor: https://github.com/ross-sec
