# otherwhere1/Anubis-70B-v1.1-mlx-4Bit

## Resumen

otherwhere1/Anubis-70B-v1.1-mlx-4Bit es una conversión al formato MLX en cuantización de 4 bits del modelo TheDrummer/Anubis-70B-v1.1, un modelo de lenguaje de 70.553.706.496 parámetros (aproximadamente 70,6B) basado en la arquitectura Llama 3.3 y afinado para generación de texto creativo, consistencia de personajes y diálogo dinámico. La conversión la firma el usuario otherwhere1 y se realizó con mlx-lm en su versión 0.31.2, pensando en inferencia local sobre hardware de Apple Silicon mediante el framework MLX.

El problema que resuelve es práctico: el modelo original en precisión completa es demasiado pesado para ejecutarse en equipos de consumo, y esta variante de 4 bits reduce el tamaño del repositorio a 39,7 GB, lo que permite desplegarlo en Macs con memoria unificada suficiente (64 GB o más). No se trata de un modelo nuevo ni de un entrenamiento adicional, sino de una recuantización de pesos de un modelo ya existente.

Es relevante para desarrolladores que trabajan con escritura creativa, roleplay y generación de diálogo en local, y que prefieren el ecosistema MLX para aprovechar el rendimiento de los chips Apple M-series. Su adopción es todavía muy incipiente: acumula 18 descargas y 0 likes, y ni la licencia ni los idiomas soportados están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.3), pesos convertidos a MLX |
| Parametros totales | 70.553.706.496 (70,6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.3, un transformer decoder-only de 70,6B parámetros, según se desprende del modelo base TheDrummer/Anubis-70B-v1.1, que la ficha de Open Laboratory describe como un modelo de 70,6B basado en Llama 3.3 afinado para consistencia de personajes y diálogo dinámico en aplicaciones de texto creativo. Esta versión concreta no introduce ningún entrenamiento nuevo: es una conversión de pesos a MLX en 4 bits realizada con mlx-lm 0.31.2, por lo que conserva las capacidades del modelo original pero con menor huella de memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO en el modelo base. Tampoco hay datos sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de la cuantización de 4 bits que aplica esta conversión.

## Capacidades

- Generación de texto creativo: el modelo base está afinado para escritura narrativa y generación de prosa.
- Consistencia de personajes: diseñado para mantener una persona coherente a lo largo de conversaciones y textos largos.
- Diálogo dinámico: orientado a conversaciones multi-turno y roleplay.
- Generación de texto general: hereda las capacidades del modelo Llama 3.3 subyacente.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa asistida en local: el modelo puede generar narrativa y prosa larga ejecutándose íntegramente en un Mac con memoria unificada suficiente, sin enviar datos a servicios externos.
- Roleplay y personajes conversacionales: gracias a su afinado para consistencia de personajes, es adecuado para construir bots de rol que mantengan una voz estable en conversaciones extendidas.
- Generación de guiones y diálogos: útil para producir borradores de diálogo en guiones, videojuegos o ficción interactiva, iterando sobre el texto con el modelo como copiloto.
- Prototipado de chatbots de personaje para videojuegos: permite probar el comportamiento de un NPC con personalidad definida antes de integrarlo en un motor de juego, todo en hardware de consumo.
- Investigación sobre cuantización en MLX: sirve como caso de estudio para comparar la calidad de una conversión a 4 bits frente al modelo original en precisión completa.
- Experimentación con privacidad de datos: al ejecutarse en local, encaja en flujos donde el contenido del usuario no puede salir del equipo, como redacción creativa confidencial.
- Desarrollo de demos offline: para presentaciones o entornos sin conectividad donde se necesite un modelo grande de generación de texto creativo, siempre que el equipo tenga memoria suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para esta conversión ni, en la información proporcionada, para el modelo base TheDrummer/Anubis-70B-v1.1.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el repositorio pesa 39,7 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible, más margen para el contexto y el runtime (en la práctica, del orden de 45-50 GB o más).
- GPU recomendadas: no disponible para CUDA; este formato MLX está pensado para Apple Silicon.
- Hardware Apple: se requiere un equipo con memoria unificada amplia, típicamente un Mac con chip M-series y 64 GB o más de memoria unificada. No cabe en configuraciones de 16, 24 o 32 GB.
- ¿Cabe en GPU de consumo? No en el sentido habitual de GPU dedicada de consumo (RTX 4090 de 24 GB no es suficiente para 4 bits de un 70B). En Apple Silicon, sí es viable con memoria unificada de 64 GB o superior.
- Opciones de despliegue: mlx-lm (el método documentado en la model card). Para el modelo base existen variantes GGUF (Anubis-70B-v1 GGUF, 41,3 GB) aptas para llama.cpp u otros runners compatibles con GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| otherwhere1/Anubis-70B-v1.1-mlx-4Bit | 70,6B | no disponible | 4-bit MLX / safetensors | no disponible | HuggingFace (18 descargas) |
| TheDrummer/Anubis-70B-v1.1 (base) | 70,6B | no disponible | precision completa / safetensors | no disponible | HuggingFace |
| Anubis-70B-v1 GGUF | 70B | no disponible | GGUF, 41,3 GB | no disponible | HuggingFace / local-ai-zone |
| Llama 3.3 70B Instruct (familia base) | 70B | no disponible | safetensors, GGUF, etc. | licencia Llama 3.3 (no confirmada aquí) | HuggingFace / Meta |

La comparación con la familia Llama 3.3 se incluye únicamente porque Anubis se construye sobre ella; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al derivar de Llama 3.3, hereda los sesgos del modelo base, que no se detallan aquí.
- Riesgo de alucinación: no se documenta explícitamente, pero es esperable en un modelo de generación creativa de este tipo; conviene validar cualquier salida factual.
- Limitaciones de contexto o idioma: no hay datos sobre longitud de contexto ni sobre idiomas soportados. El modelo base está orientado a texto creativo, no a tareas de precisión factual.
- Restricciones de licencia: la licencia no está declarada en la información disponible, por lo que no se puede confirmar el uso comercial. Es imprescindible verificar la licencia del modelo base TheDrummer/Anubis-70B-v1.1 antes de cualquier despliegue en producción.
- Caveat de formato: al ser una conversión MLX, no es directamente utilizable en GPUs NVIDIA ni en runners CUDA; requiere el ecosistema MLX sobre Apple Silicon o una reconversión.
- Adopción mínima: 18 descargas y 0 likes indican que es un artefacto poco probado por la comunidad; no hay validación externa de su calidad frente al modelo original.
- Sin benchmarks: no existe evidencia publicada que cuantifique la pérdida de calidad introducida por la cuantización a 4 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/otherwhere1/Anubis-70B-v1.1-mlx-4Bit
- Discusiones del modelo: https://huggingface.co/otherwhere1/Anubis-70B-v1.1-mlx-4Bit/discussions
- Modelo base: https://huggingface.co/TheDrummer/Anubis-70B-v1.1
- Anubis 70B v1.1 en Open Laboratory: https://openlaboratory.com/models/anubis-70b-v1_1/
- Anubis-70B-v1 en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/anubis-70b-v1-thedrummer
- Anubis 70B V1 GGUF en local-ai-zone: https://local-ai-zone.github.io/models/anubis-70b-v1.html
