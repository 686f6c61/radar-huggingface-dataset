# galakenya/JapanRailwayGuideWatcher

## Resumen

JapanRailwayGuideWatcher es un ajuste fino mediante QLoRA sobre el modelo base google/gemma-4-E4B-it, desarrollado por el autor independiente galakenya. Está especializado en ingeniería y tecnología ferroviaria japonesa: obra civil ferroviaria, estructuras, vía, señalización y sistemas de seguridad, catenaria, edificación ferroviaria, material rodante, sistemas y mantenimiento. El modelo resuelve el problema de la falta de conocimiento técnico especializado y en japonés en los modelos generalistas, actuando como asistente experto para consultas de dominio.

El repositorio combina pesos en safetensors y GGUF, con un total de 7.463.013.674 parámetros y un tamaño de 33,6 GB. El entrenamiento se realizó con aproximadamente 11.500 registros de documentación técnica ferroviaria japonesa, usando QLoRA, Unsloth y Hugging Face Transformers. Se publican los checkpoints checkpoint-7000 y checkpoint-7250, siendo este último el recomendado por el autor para uso general y para combinación con RAG.

Su relevancia actual radica en que demuestra un patrón habitual en el ecosistema open source: adaptaciones LoRA de bajo coste sobre modelos base recientes para nichos técnicos muy concretos, con soporte declarado de ocho idiomas (aunque el japonés es el idioma de máxima precisión) y orientación explícita a flujos de recuperación aumentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base google/gemma-4-E4B-it); adaptación mediante LoRA/QLoRA |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (pesos completos) y GGUF; niveles concretos de cuantizacion GGUF no disponibles |
| Idiomas soportados | ja, en, zh (chino tradicional), ko, fr, es, pt (portugués de Brasil), de |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4 en su variante E4B orientada a instrucciones. Sobre esa base se aplica un ajuste fino con QLoRA (cuantización del modelo base más adaptadores de bajo rango), utilizando Unsloth y Hugging Face Transformers como herramientas de entrenamiento. El repositorio contiene tanto los pesos resultantes en safetensors como versiones GGUF para inferencia local.

El corpus de entrenamiento consta de aproximadamente 11.500 registros centrados en documentación técnica ferroviaria japonesa: materiales de ingeniería civil ferroviaria, estructuras, ingeniería de vía, señalización y dispositivos de seguridad, instalaciones de catenaria, arquitectura ferroviaria, tecnología de material rodante, sistemas ferroviarios y técnicas de mantenimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales. Se publican los checkpoints checkpoint-7000 y checkpoint-7250; el autor indica que este último presenta la mayor consolidación del conocimiento ferroviario y es el más adecuado para combinar con RAG.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas técnicas sobre ingeniería ferroviaria japonesa.
- Conocimiento especializado en obra civil ferroviaria, estructuras, vía, señalización y seguridad, catenaria, edificación ferroviaria, material rodante, sistemas y mantenimiento.
- Soporte multilingüe declarado en ocho idiomas: japonés, inglés, chino tradicional, coreano, francés, español, portugués de Brasil y alemán, con el japonés como idioma de máxima precisión.
- Integración con flujos de Retrieval-Augmented Generation (RAG): el repositorio incluye recursos orientados a RAG y el autor recomienda el checkpoint-7250 para esta combinación.
- Capacidad conversacional multi-turno heredada del modelo base instruct.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente técnico para ingeniería ferroviaria: consultas sobre diseño de vía, estructuras o catenaria respondidas con vocabulario y conceptos del dominio, usando el checkpoint-7250 como base de un chatbot interno para equipos de ingeniería.
- Sistema RAG documental: indexar normativa, manuales de mantenimiento y documentación de señalización en un almacén vectorial y usar el modelo como generador final, aprovechando que el autor lo recomienda explícitamente para esta combinación.
- Formación técnica interna: generación de explicaciones y material didáctico sobre sistemas de seguridad y mantenimiento ferroviario para programas de capacitación de personal.
- Soporte a la investigación: resumen y exploración de literatura técnica ferroviaria japonesa, con la advertencia de verificar siempre contra fuentes oficiales.
- Desarrollo de videojuegos y simuladores ferroviarios: generación de diálogos, descripciones de material rodante y contenido contextual para simuladores de conducción o gestión de líneas.
- Aplicaciones de divulgación y aficionados: asistentes conversacionales sobre historia y tecnología del ferrocarril japonés, con respuestas en el idioma del usuario.
- Preprocesamiento y enriquecimiento de datos: etiquetado y generación de descripciones técnicas a partir de documentación ferroviaria en japonés antes de su incorporación a otros pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (7,46 mil millones de parámetros), en FP16 se requiere del orden de 15-16 GB de VRAM; en cuantizaciones GGUF de 8 bits, aproximadamente 8-9 GB; en 4 bits, aproximadamente 4-5 GB. Estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar funcionamiento en GPU de consumo de gama alta con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en FP16, y en GPU de consumo de gama media en cuantización 4 bits.
- Cabe en GPU de consumo: sí, previsiblemente en cuantizaciones GGUF reducidas, aunque el fabricante no lo confirma.
- Opciones de despliegue: llama.cpp y Ollama mediante los ficheros GGUF del repositorio; vLLM o TGI con los pesos safetensors; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia alojados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JapanRailwayGuideWatcher | 7,46 B | no disponible | Ingeniería ferroviaria japonesa (QLoRA) | gemma | Hugging Face (safetensors + GGUF) |
| JapanRailwayLLM (galakenya) | no disponible | no disponible | Conocimiento ferroviario japonés (modelo hermano) | no disponible | Hugging Face |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Propósito general, instrucciones | gemma | Hugging Face |

La comparación con modelos de propósito general del mismo tamaño no está disponible con datos verificables en la información proporcionada; la alternativa más directa documentada es el modelo hermano JapanRailwayLLM del mismo autor, sin especificaciones técnicas publicadas en esta ficha.

## Limitaciones y advertencias

- El corpus de entrenamiento es exclusivamente japonés y de dominio muy concreto; fuera de la ingeniería ferroviaria japonesa el rendimiento puede degradarse respecto al modelo base.
- La máxima precisión se obtiene con prompts en japonés; en el resto de idiomas declarados las respuestas pueden ser menos completas o contener imprecisiones terminológicas.
- Riesgo de alucinación en datos técnicos concretos (normativas, dimensiones, procedimientos de seguridad); el propio autor exige verificar las respuestas contra publicaciones oficiales de las compañías ferroviarias, estándares de ingeniería y documentación de seguridad.
- No está destinado a sustituir el juicio de ingeniería oficial ni los procedimientos de seguridad ferroviaria; su uso operativo requiere validación humana.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen obligaciones de atribución y restricciones de uso aceptable; conviene revisar los términos antes de desplegar en producción.
- El modelo tiene 0 likes y un volumen de descargas moderado (1.336), lo que sugiere una validación comunitaria limitada; no hay benchmarks publicados que respalden su calidad frente a alternativas.
- No se documentan sesgos específicos ni evaluación de seguridad; al ser un ajuste LoRA sobre un modelo base, hereda los sesgos y limitaciones de este.
- El contexto máximo no está documentado en la ficha, por lo que no se puede garantizar el manejo de documentos largos sin verificación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/galakenya/JapanRailwayGuideWatcher
- Modelo hermano JapanRailwayLLM: https://huggingface.co/galakenya/JapanRailwayLLM
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Blog del autor (GalaKenya): https://galakenya.blogspot.com/search/label/パソコンネタ
