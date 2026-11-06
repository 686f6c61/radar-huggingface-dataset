# liftkkkk/ask-the-author-0.8b

## Resumen

ask-the-author-0.8b es un ajuste fino (fine-tune) de Qwen3.5-0.8B publicado por el usuario liftkkkk en Hugging Face. No es un modelo de propósito general: es un "Live Book" o memoria entrenada del libro «图原生智能体：Graph × LLM × Agent 技术详解» (algo así como "Agentes nativos de grafo: tecnología Graph × LLM × Agent explicada"), un texto técnico sobre GraphRAG, grafos de conocimiento y agentes basados en grafos, cuya publicación está prevista para enero de 2027. El modelo responde preguntas sobre el contenido del libro y, según el autor, reproduce pasajes del manuscrito.

El modelo parte de la arquitectura de Qwen3.5 (tag `qwen3_5_text` en Hugging Face) y cuenta con 752.393.024 parámetros reales según los pesos en safetensors, lo que se aproxima a la denominación comercial de 0,8B. El repositorio ocupa 1,5 GB, lo que sugiere pesos en bfloat16 o float16 sin cuantizar. La model card menciona el uso de LoRA en los tags, aunque no detalla la configuración del ajuste.

Su relevancia es acotada y experimental: se trata de un caso de estudio de "libro conversacional" entrenado sobre un corpus cerrado y especializado, con licencia Apache 2.0 declarada. No está pensado como modelo generalista, sino como demostración de la técnica de destilar un documento extenso en los pesos de un modelo pequeño ejecutable en GPU de consumo. A fecha de la información disponible no registra descargas ni likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen. La model card lo etiqueta con el tag `qwen3_5_text` y lo declara como `base_model: Qwen3.5-0.8B`, pero no aporta detalles sobre número de capas, dimensión oculta, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.).

En cuanto al entrenamiento, la información disponible es mínima: los tags incluyen `lora`, lo que indica que el ajuste se realizó mediante Low-Rank Adaptation sobre el modelo base, presumiblemente con un corpus compuesto por el manuscrito del libro y pares pregunta-respuesta derivados de él. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El prompt de sistema que aparece en la model card instruye al modelo a "reproducir fielmente el contenido original del libro según el número y título de capítulo", lo que sugiere un entrenamiento orientado a memorización y recuperación de pasajes concretos más que a razonamiento general. El modelo emplea un modo de pensamiento explícito mediante etiquetas `<think>`.

## Capacidades

- Generación de texto en chino e inglés, orientada a la recuperación y explicación del contenido del libro sobre el que fue entrenado.
- Modo de razonamiento explícito: genera un bloque `<think>` antes de la respuesta final, en el que localiza la sección relevante del manuscrito.
- Localización de secciones a partir de una sola palabra clave (por ejemplo, `graphrag`, `lom`, `zep`), asociándola a un apartado concreto de la obra.
- Explicación de conceptos técnicos cubiertos en el libro: GraphRAG, detección de comunidades, modularidad, Louvain/Leiden, GNN-RAG, SubgraphRAG, HyperGraphRAG, memoria de agentes basada en grafos.
- Respuesta a preguntas sobre metadatos del libro (autoría, estructura, capítulos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el uso previsto es de pregunta-respuesta de un solo turno.
- Capacidades multilingües: limitadas a chino e inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Consulta interactiva del libro: un lector puede preguntar por un concepto concreto (por ejemplo, "¿qué papel juega la modularidad en la detección de comunidades?") y obtener una explicación alineada con el texto del manuscrito, sin necesidad de releer capítulos completos.
- Navegación por índice temático: introducir una palabra clave suelta y obtener la sección correspondiente con su contexto, lo que funciona como un índice semántico conversacional del contenido.
- Material de estudio para cursos sobre GraphRAG y agentes: el modelo puede servir como tutor acotado al temario del libro para estudiantes que preparan las tareas prácticas descritas en cada capítulo.
- Demostración técnica de "libro destilado en pesos": útil para investigadores interesados en evaluar hasta qué punto un modelo de 0,8B puede memorizar y recuperar un corpus cerrado de decenas o cientos de miles de tokens mediante LoRA.
- Asistente de documentación interna: el mismo enfoque (fine-tune LoRA sobre un corpus cerrado) puede replicarse para manuales técnicos, normativas o documentación de producto, usando este modelo como referencia de implementación.
- Prototipado en GPU de consumo: con 1,5 GB de pesos, cabe en tarjetas domésticas y permite experimentar con recuperación de conocimiento especializado sin infraestructura dedicada.
- Evaluación de alineación con fuente: sirve para estudiar la fidelidad de las respuestas de un modelo pequeño cuando se le fuerza a ceñirse a un documento, incluyendo la detección de alucinaciones fuera del corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,5-2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 3-4 GB de VRAM son suficientes para contextos moderados.
- Cuantización a 8 bits: en torno a 0,8 GB de pesos; a 4 bits (GGUF Q4), alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Una RTX 3060, RTX 4060, RTX 4090 o una A100 funcionan sin problema; el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers (según el ejemplo de la model card), y previsiblemente llama.cpp, Ollama o vLLM si se generan pesos GGUF (no se confirma su disponibilidad en el repositorio).
- Latencia y throughput estimados: no disponibles. Por el tamaño, la generación de 900 tokens debería completarse en pocos segundos en una GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ask-the-author-0.8b | 752 M | no disponible | Libro técnico cerrado (GraphRAG/agentes) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Propósito general | no disponible en esta ficha | Hugging Face |
| Qwen3-0.6B | 0,6 B | 32 768 tokens (según familia Qwen3) | Propósito general | Apache 2.0 | Hugging Face |
| Llama 3.2 1B | 1,2 B | 128 000 tokens | Propósito general | Llama 3.2 Community License | Hugging Face |

La comparación con modelos de propósito general es poco informativa: ask-the-author-0.8b no compite en capacidades generales, sino que es un artefacto especializado en un único documento. Frente a alternativas como RAG sobre el mismo libro con un modelo base, la ventaja declarada es la respuesta directa sin recuperación externa; la desventaja es la falta de actualización y la escasa generalización fuera del corpus.

## Limitaciones y advertencias

- Alcance muy restringido: el propio autor advierte que dentro del libro el modelo es fiable, pero fuera de él su conocimiento general es limitado.
- Multiturno frágil: se recomienda no superar los 3 turnos de conversación; el modelo está diseñado para pregunta-respuesta de un solo turno.
- Riesgo de degradación en generaciones largas: con `max_new_tokens` superior a 1500 la cola de la respuesta puede "descontrolarse" según la model card.
- Sensibilidad al formato de la consulta: las preguntas en lenguaje natural funcionan mejor que las palabras sueltas, aunque el modelo soporta ambas.
- Riesgo de alucinación: al estar entrenado para "reproducir" pasajes, puede generar contenido plausible pero no presente en el manuscrito, especialmente en preguntas fuera de alcance.
- Idiomas: solo chino e inglés; no se garantiza un comportamiento correcto en castellano.
- Licencia Apache 2.0 declarada, pero al derivar de Qwen3.5 conviene verificar que la licencia del modelo base lo permita; la model card no incluye los términos del modelo base.
- Sin métricas publicadas: no hay benchmarks, evaluaciones de fidelidad ni estudios de sesgo, lo que impide valorar su calidad de forma objetiva.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- El snippet de la model card contiene un ID incorrecto (`YOUR_NAME/ask-the-author-0.8b`), lo que puede confundir a quien intente reproducir el ejemplo tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liftkkkk/ask-the-author-0.8b
- Modelo base referenciado: Qwen3.5-0.8B (no se proporciona URL directa en la información disponible)
- Libro de referencia: «图原生智能体：Graph × LLM × Agent 技术详解», publicación prevista para enero de 2027 (sin URL disponible)
- Paper, blog o repositorio adicional: no disponible
