# aletta2206/legal-chatbot-finetuned

## Resumen

legal-chatbot-finetuned es un ajuste fino de tipo instruct orientado a conversación de dominio legal, publicado por el usuario aletta2206 en HuggingFace. El modelo parte de unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit, la versión del Qwen2.5-1.5B-Instruct ya cuantizada a 4 bits por Unsloth, y se ha entrenado con la librería Unsloth junto a TRL, según declara la propia model card. Cuenta con 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) en formato safetensors, con un repositorio de 3,1 GB.

El modelo resuelve, en principio, la tarea de generar respuestas conversacionales en inglés sobre temática jurídica, aunque la model card no documenta ni el dataset de ajuste ni el proceso de alineación. La arquitectura es la de Qwen2, un transformer decoder-only denso con atención causal, y hereda de la familia Qwen2.5 una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 con YaRN), dato que proviene de la documentación pública del modelo base y no de la ficha del autor.

Su relevancia actual es limitada pero ilustrativa: es un ejemplo de fine-tuning ligero con QLoRA sobre un modelo de 1,5B que puede ejecutarse en hardware de consumo, y sirve como plantilla reproducible para adaptar un modelo pequeño a un dominio vertical. No obstante, carece de benchmarks publicados, de documentación del dataset y de comunidad (0 descargas y 0 likes en el momento de la consulta), por lo que debe tratarse como un experimento y no como un sistema listo para producción legal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso, atención causal |
| Parámetros totales | 1.543.714.304 (≈1,54B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según la familia Qwen2.5 (no confirmado en la model card); extensible a 131.072 con YaRN según documentación de Qwen |
| Tipos de cuantización | No se publican cuantizaciones propias; el repositorio contiene safetensors. El modelo base de partida estaba cuantizado a 4 bits (bnb-4bit). Compatible con GPTQ, AWQ, GGUF/llama.cpp previa conversión |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen2, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query/key/value bias. El modelo es denso, sin mezcla de expertos, con 1,54B parámetros, lo que lo sitúa en la gama baja de la familia Qwen2.5. El contexto declarado por el modelo base es de 32.768 tokens, con soporte de extensión por YaRN hasta 131.072 tokens según la documentación de Qwen, aunque la model card del fine-tune no confirma ni la ventana efectiva ni si se modificó la configuración de RoPE durante el ajuste.

En cuanto al entrenamiento, la única información disponible indica que se realizó con Unsloth y TRL, con una velocidad declarada de 2x respecto a un entrenamiento convencional. El punto de partida es la versión bnb-4bit del modelo base, lo que implica un esquema de QLoRA: cuantización a 4 bits de los pesos congelados y entrenamiento de adaptadores de bajo rango. No se especifica el número de tokens de entrenamiento, la composición del dataset legal, la existencia de etapas de RLHF, DPO o SFT supervisado, ni los hiperparámetros (rango LoRA, learning rate, épocas). Tampoco se indica si los adaptadores se fusionaron con los pesos base, aunque el tamaño del repositorio (3,1 GB, coherente con 1,54B parámetros en fp16) sugiere que se publicaron los pesos fusionados en precisión de 16 bits.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat instruct heredado de Qwen2.5-1.5B-Instruct.
- Respuestas orientadas a dominio legal, presumiblemente a partir del dataset de ajuste no documentado.
- Razonamiento básico y resolución de problemas sencillos, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas elementales, capacidades heredadas del modelo base, no verificadas tras el ajuste.
- Soporte de tool calling y function calling: no confirmado en la ficha; el modelo base Qwen2.5-1.5B-Instruct sí lo soporta, pero no hay evidencia de que se preserve tras el fine-tune.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no; la ficha declara únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.
- Formato de prompt: conversacional (chat template de Qwen2), no detallado en la model card.

## Casos de uso

- Prototipado de asistentes legales en inglés: el modelo puede generar respuestas conversacionales multi-turno sobre consultas jurídicas genéricas, aunque sin garantía de exactitud normativa y sin citar fuentes verificables.
- Clasificación y resumen de documentos legales: con 32.768 tokens de contexto heredados, permite procesar contratos o cláusulas extensas y devolver resúmenes en inglés, siempre con revisión humana.
- Extracción de entidades en textos jurídicos: nombres de partes, fechas, importes y jurisdicciones, como paso previo a un pipeline de indexación documental.
- Educación y formación jurídica: generación de explicaciones introductorias o preguntas de autoevaluación para estudiantes, con la advertencia explícita de que no constituye asesoramiento legal.
- Base para investigación en fine-tuning de dominio: sirve como referencia reproducible de QLoRA con Unsloth sobre Qwen2.5-1.5B para estudiar el efecto del ajuste en dominios especializados.
- Despliegue en edge o entornos sin GPU: al ser un modelo de 1,5B, puede ejecutarse en CPU o en GPU de gama baja para tareas de baja latencia y bajo coste, como chatbots internos de preclasificación de consultas.
- Filtrado previo en pipelines legales: primera capa de triaje que deriva consultas a un modelo mayor o a un abogado humano cuando la confianza es baja.
- Generación de borradores de cláusulas estándar: plantillas repetitivas en inglés que después revisa un profesional cualificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna evaluación específica de dominio legal, y no existe ningún informe técnico asociado al repositorio.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,1 GB solo para pesos, más caché KV; en la práctica unos 4-6 GB para contextos moderados (4.096-8.192 tokens).
- VRAM estimada en cuantización int8: en torno a 1,6-2 GB de pesos.
- VRAM estimada en cuantización int4 (GGUF Q4_K_M): en torno a 1-1,2 GB de pesos, ejecutable incluso en CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente; RTX 3060 12 GB, RTX 4060, RTX 4070 y RTX 4090 lo ejecutan con margen amplio. GPU de datacenter como A100, H100 o L40S están sobredimensionadas para este tamaño.
- ¿Cabe en GPU de consumo? Sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada si se usa cuantización de 4 bits.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (etiqueta endpoints_compatible), vLLM, y llama.cpp u Ollama previa conversión a GGUF con herramientas como llama.cpp o Unsloth.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de su documentación pública y no de la información proporcionada en esta búsqueda; conviene verificarlos en la fecha de uso.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aletta2206/legal-chatbot-finetuned | 1,54B | 32.768 (heredado, sin confirmar) | Apache 2.0 | HuggingFace, safetensors |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente soportado |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | HuggingFace |
| Gemma-2-2B-it | 2,6B | 8.192 | Gemma Terms (uso comercial permitido con condiciones) | HuggingFace |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | Apache 2.0 | HuggingFace |

Comparativa de rendimiento: no disponible. No existen benchmarks publicados del modelo ajustado y no se puede asumir que el fine-tune preserve las capacidades del Qwen2.5-1.5B-Instruct original; el ajuste con QLoRA sobre datasets pequeños suele producir olvido catastrófico parcial.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifica el dataset de entrenamiento, su origen, su licencia ni su tamaño, lo que impide auditar sesgos o legalidad de los datos.
- Riesgo alto de alucinación jurídica: un modelo de 1,5B ajustado sin etapas de RLHF verificadas puede inventar artículos, plazos procesales, jurisprudencia o normativa inexistente.
- No constituye asesoramiento legal: cualquier salida debe ser revisada por un profesional cualificado antes de usarse en un contexto real.
- Sesgos conocidos: no documentados por el autor; los sesgos heredados de Qwen2.5-1.5B-Instruct, entrenado mayoritariamente con datos web en inglés y chino, probablemente persisten e incluso se acentúan tras el ajuste.
- Limitación de idioma: solo se declara inglés. El castellano no está soportado oficialmente y su rendimiento en español no ha sido evaluado.
- Limitación de contexto: aunque el modelo base soporta 32.768 tokens, el ajuste puede haber degradado el rendimiento en contextos largos; no hay evaluación al respecto.
- Capacidad limitada por tamaño: 1,54B parámetros restringen el razonamiento complejo, el seguimiento de instrucciones largas y la coherencia en cadenas multi-paso.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y los atributos correspondientes. El modelo base Qwen2.5-1.5B-Instruct también se distribuye bajo Apache 2.0, por lo que no hay conflicto conocido de licencias.
- Advertencia sobre la fecha: la ficha registra fecha de creación y actualización en octubre de 2026, posterior a la fecha habitual de publicación de la familia Qwen2.5; conviene verificar la integridad y procedencia del repositorio.
- Madurez: 0 descargas y 0 likes, sin issues ni mantenimiento conocido. No hay garantía de soporte ni de corrección de errores.
- Formato: al publicarse únicamente en safetensors sin cuantizaciones oficiales, su despliegue en entornos ligeros requiere una conversión previa (GGUF, AWQ o GPTQ).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aletta2206/legal-chatbot-finetuned
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Documentación de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de llama.cpp para conversión a GGUF: https://github.com/ggerganov/llama.cpp
