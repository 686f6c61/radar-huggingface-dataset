# KairSun/kairsun-270m

## Resumen
El modelo KairSun/kairsun-270m es un modelo de lenguaje de 268.098.176 parámetros publicado por el usuario KairSun en HuggingFace. Se distribuye en formato GGUF bajo licencia Gemma y está etiquetado como conversacional, lo que sugiere su uso previsto para tareas de diálogo. No se dispone de una model card detallada: el README únicamente contiene la licencia, sin descripción de arquitectura, datos de entrenamiento, contexto o idiomas soportados.

Por su tamaño, se sitúa en la categoría de modelos compactos adecuados para inferencia en dispositivos con recursos limitados, como CPU, móviles o sistemas embebidos. El repositorio ocupa 0,3 GB, lo que facilita su despliegue en entornos con poca memoria. Sin embargo, la ausencia de documentación y de resultados de evaluación impide conocer su calidad real, su ventana de contexto o sus capacidades más allá de la generación de texto conversacional.

La relevancia actual de este tipo de modelos radica en la demanda de asistentes ligeros que puedan ejecutarse localmente sin depender de la nube. No obstante, al no haber benchmarks publicados ni información sobre el proceso de entrenamiento, cualquier evaluación debe realizarse de forma empírica antes de considerarlo para producción.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 268.098.176 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (variantes no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo. La model card no incluye detalles sobre si se trata de un transformer, MoE, SSM o una arquitectura híbrida, ni sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO. El único dato técnico disponible es el número de parámetros (268.098.176) y el formato de pesos (GGUF).

La licencia Gemma y el tamaño sugieren una posible relación con la familia Gemma 3 270M de Google, pero esto no está confirmado por el autor. Cualquier afirmación sobre innovaciones técnicas como decodificación especulativa o atención lineal carece de respaldo en la información proporcionada.

## Capacidades
- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a diálogos, aunque no se detalla su calidad ni el tipo de conversaciones.
- No se dispone de información sobre soporte de tool calling o function calling.
- No se dispone de información sobre capacidades de agente o razonamiento multi-paso.
- No se dispone de información sobre capacidades multilingües.
- No se dispone de información sobre visión, audio u otras modalidades.
- No se dispone de información sobre modos especiales como "thinking mode".

## Casos de uso
- Asistente conversacional local en aplicaciones móviles: al ocupar 0,3 GB en GGUF, puede integrarse en apps Android o iOS mediante runners como llama.cpp, ofreciendo respuestas básicas sin conexión. Adecuado por su bajo consumo de memoria, aunque se desconoce su calidad de respuesta.
- Chatbot de preguntas frecuentes en sitios web: podría gestionar consultas simples con respuestas predefinidas o generadas, ejecutándose en un servidor de bajos recursos. Su tamaño reducido permite baja latencia, pero no hay datos sobre su contexto máximo.
- Prototipado rápido de interfaces conversacionales: útil para desarrolladores que necesitan un modelo ligero para probar flujos de diálogo antes de invertir en modelos mayores. La licencia Gemma permite uso comercial con restricciones.
- Generación de textos breves en entornos embebidos: por ejemplo, respuestas automáticas en dispositivos IoT con pantalla, donde no cabe un modelo mayor. El formato GGUF facilita su ejecución en CPU.
- Tutor educativo básico para preguntas cerradas: podría emplearse en aplicaciones de aprendizaje de idiomas o repaso de conceptos, siempre que se valide su precisión. No hay información sobre idiomas soportados.
- Generación de diálogos en videojuegos o simulaciones: para NPCs con conversaciones simples, aprovechando su bajo coste computacional. Requiere evaluar la coherencia y evitar alucinaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada (teórica, sin overhead): ~0,54 GB en FP16, ~0,27 GB en int8 y ~0,14 GB en int4 para 268M parámetros. Al estar en GGUF, es probable que existan variantes cuantizadas de 4 y 8 bits, pero no se especifican.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050, RTX 4090) o incluso CPU. También puede ejecutarse en GPUs integradas.
- Cabe en GPU consumer: sí, prácticamente en cualquier GPU moderna e incluso en Raspberry Pi 4/5 con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM no soporta GGUF de forma nativa; requeriría conversión a safetensors.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| KairSun/kairsun-270m | 268M | no disponible | Gemma | GGUF | no disponible |
| Gemma 3 270M (Google) | 270M | no disponible | Gemma | safetensors (y GGUF vía conversiones) | no disponible |
| FunctionGemma 270M (Google) | 270M | no disponible | Gemma | safetensors | no disponible |
| SmolLM2-360M (HuggingFace) | 360M | no disponible | Apache 2.0 | safetensors, GGUF | no disponible |

No se dispone de datos de rendimiento comparables para ninguno de los modelos en la información proporcionada.

## Limitaciones y advertencias
- Model card prácticamente vacía: solo incluye la licencia. No hay información sobre sesgos, datos de entrenamiento, evaluaciones de seguridad o limitaciones conocidas.
- Riesgo de alucinación: en modelos de 268M parámetros es habitual que generen información incorrecta o incoherente, especialmente en dominios especializados. No se ha evaluado este aspecto.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto máxima y los idiomas soportados. El tag no especifica idiomas.
- Licencia Gemma: permite uso comercial sujeto a los términos de uso de Gemma, que incluyen restricciones de uso aceptable. Es responsabilidad del usuario revisar dichos términos.
- Modelo sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que sugiere que no ha sido validado por la comunidad.
- No apto para producción sin una evaluación exhaustiva: al no haber benchmarks ni documentación, no se puede garantizar su calidad, robustez o seguridad.

## Enlaces
- HuggingFace: https://huggingface.co/KairSun/kairsun-270m
- Artículo sobre FunctionGemma y Gemma 3 270M: https://www.marktechpost.com/2025/12/26/from-gemma-3-270m-to-functiongemma-how-google-ai-built-a-compact-function-calling-specialist-for-edge-workloads/
- Modelo FunctionGemma en HuggingFace: https://huggingface.co/google/functiongemma-270m-it
- Devpost de KairSun (posiblemente no relacionado con el modelo): https://devpost.com/software/kairsun
- GitHub de KairSun (posiblemente no relacionado): https://github.com/KairSun
- Calendario de lanzamientos de modelos IA (contexto): https://www.scriptbyai.com/ai-model-release-calendar/
