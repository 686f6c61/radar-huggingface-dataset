# hamzah0asadullah/ORP-0.8B

## Resumen

ORP-0.8B es un modelo de lenguaje de 852 millones de parámetros desarrollado por hamzah0asadullah, resultado de un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-0.8B sobre el dataset PygmalionAI/PIPPA. Este dataset recopila conversaciones con el bot de Character.AI de 2023, lo que convierte al modelo en una herramienta especializada en roleplay y simulación de personajes, con un estilo de respuesta breve y coherente.

El autor diseñó el modelo para probar si un modelo pequeño puede mantener coherencia generando respuestas cortas, evitando el contenido vacío que caracteriza a los modelos gratuitos actuales de Character.AI. Aunque el modelo logra respuestas coherentes, el propio autor reconoce que pierde profundidad en comparación con modelos más grandes. ORP-0.8B está pensado para ejecutarse en entornos con recursos limitados, como dispositivos móviles o GPUs de consumo, manteniendo una experiencia de roleplay fluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ORP-0.8B es un ajuste fino completo (full-parameter SFT) del modelo Qwen/Qwen3.5-0.8B. La arquitectura subyacente es la de un transformer estándar, tal como se define en la familia Qwen3.5. El entrenamiento se realizó sobre el dataset PygmalionAI/PIPPA, que contiene conversaciones extraídas de Character.AI de 2023. No se ha documentado el uso de RLHF, DPO ni otras técnicas de alineación más allá del SFT.

La innovación principal del proyecto no es arquitectónica, sino de enfoque: el autor entrenó el modelo para generar respuestas cortas y directas, con el objetivo de mantener la coherencia en un modelo de menos de mil millones de parámetros. Esto implica que el modelo prioriza la concisión sobre el desarrollo extenso de ideas, lo que resulta en respuestas fluidas pero con menor profundidad temática.

## Capacidades

- Generación de texto conversacional especializado en roleplay y simulación de personajes.
- Mantiene coherencia en diálogos multi-turno, especialmente cuando se usa con un system prompt que define el personaje y el contexto.
- Produce respuestas breves y directas, reduciendo el relleno vacío.
- Soporta la incorporación de acciones entre asteriscos (formato de roleplay), como se muestra en los ejemplos de uso.
- Capacidades multilingües limitadas al inglés según la información disponible.
- No se ha documentado soporte de tool calling, function calling, visión, audio ni razonamiento multi-step explícito.

## Casos de uso

- Chatbots de personajes para entretenimiento: el modelo puede interpretar personajes definidos en un system prompt, permitiendo a los usuarios interactuar con figuras ficticias en conversaciones largas y coherentes.
- Juegos de rol por texto: ideal para partidas de rol en las que el modelo actúa como narrador o como personajes no jugadores, generando respuestas cortas que mantienen el ritmo de la historia.
- Simulación de diálogos para escritura creativa: los autores pueden usar el modelo para explorar interacciones entre personajes antes de escribir, aprovechando su estilo conciso.
- Prototipos de asistentes conversacionales con personalidad: se puede integrar en aplicaciones de chat donde se necesita una voz distintiva y respuestas rápidas, sin requerir un gran despliegue de hardware.
- Demostraciones educativas de fine-tuning: sirve como ejemplo práctico de cómo ajustar un modelo pequeño para una tarea específica, mostrando el proceso completo desde el dataset hasta la inferencia.
- Aplicaciones móviles de roleplay: gracias a su tamaño reducido, puede ejecutarse en dispositivos con recursos limitados, ofreciendo una experiencia de conversación sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852 millones de parámetros en FP16, el modelo ocupa aproximadamente 1,7 GB, por lo que puede ejecutarse en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU de consumo moderna, como RTX 3060, RTX 4060 o inferiores, es suficiente. También es viable el uso de CPUs con suficiente RAM para inferencia lenta.
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para ejecutarse en hardware modesto, incluso en dispositivos móviles.
- Opciones de despliegue: al ser un modelo de la librería Transformers, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se han documentado configuraciones específicas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ORP-0.8B | 852 M | No disponible | Apache 2.0 | Roleplay con respuestas cortas |
| TinyRP-0.8B (mismo autor) | No disponible | No disponible | No disponible | Roleplay en modelos pequeños, preservando cualidades de asistente general |
| Qwen3.5-0.8B (base) | 852 M | No disponible | Apache 2.0 | Modelo generalista sin ajuste específico |

La comparativa se basa en los datos disponibles. TinyRP-0.8B, del mismo autor, persigue un objetivo similar pero con un enfoque distinto: mantener las capacidades de asistente general mientras se añade roleplay. No hay datos de rendimiento publicados para ninguno de los modelos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que su rendimiento en otros idiomas es nulo o muy limitado.
- Al ser un modelo pequeño, genera respuestas con menor profundidad y matiz que modelos de mayor tamaño, como reconoce el autor.
- No se han documentado sesgos específicos, pero el dataset de Character.AI puede contener contenido problemático o estereotipos que el modelo puede reproducir.
- Existe riesgo de alucinación, especialmente en contextos donde se espera información factual.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede producir contenido inapropiado o no deseado en entornos de producción sin supervisión.
- No se ha documentado soporte para tool calling, agentes ni razonamiento multi-step, lo que limita su uso en aplicaciones que requieran estas capacidades.
- La longitud de contexto no está especificada, por lo que no se puede garantizar un rendimiento óptimo en conversaciones muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hamzah0asadullah/ORP-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/PygmalionAI/PIPPA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo similar del mismo autor: https://huggingface.co/hamzah0asadullah/TinyRP-0.8B
