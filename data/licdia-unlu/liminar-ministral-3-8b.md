# LICDIA-UNLu/Liminar-Ministral-3-8B

## Resumen

Liminar-Ministral-3-8B es un ajuste fino completo (full fine-tuning) del modelo Ministral 3 8B Instruct de Mistral AI, desarrollado por LICDIA, el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial de la Universidad Nacional de Luján (Argentina). El modelo está especializado en normativa universitaria argentina, instituciones académicas y español formal rioplatense, y resuelve el problema de que los modelos generalistas desconocen el corpus regulatorio específico del sistema universitario argentino.

Con 8.918.026.240 parámetros y una arquitectura multimodal Mistral3 (image-text-to-text), el modelo parte de una base instruct ya capaz de procesar texto e imágenes, y sobre ella se ha realizado un ajuste completo de todos los pesos para incorporar conocimiento normativo. La licencia Apache 2.0, idéntica a la del modelo base, permite uso comercial sin restricciones adicionales.

Su relevancia práctica radica en que demuestra una mejora sustancial en recuperación de normativa sin documentos externos: pasa del 7,7 % al 48,7 % de respuestas correctas en un benchmark de 300 preguntas, y mantiene el rendimiento en escenarios RAG con documentos (4,90 frente a 4,92 del base sobre 5). Es un caso de estudio de adaptación de dominio sobre un modelo abierto con recursos universitarios públicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mistral3 (transformer multimodal, image-text-to-text) |
| Parámetros totales | 8.918.026.240 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | bf16 (original), Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | español (es), con foco en español formal de Argentina |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mistral3 del base Ministral 3 8B Instruct, un transformer multimodal que procesa texto e imágenes mediante `AutoModelForImageTextToText`. El ajuste fino fue completo sobre todos los pesos, distribuido con FSDP en un nodo de la supercomputadora Clementina XXI (8 tiles de GPU Intel Data Center Max 1550), con una época inicial de preguntas y respuestas seguida de cuatro épocas con el conjunto de datos completo. El cómputo total ascendió a 69 horas de GPU (horas de tile).

El corpus de entrenamiento combina normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0) curada manualmente, textos públicos sobre vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con permiso), junto con datos sintéticos generados a partir de ese corpus con el documento a la vista: fragmentos con ficha, versiones reescritas, pares pregunta-respuesta, ejemplos de abstención, identidad, respuestas del modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento las redactó Qwen 3.5 27B, por lo que el modelo adopta parcialmente su estilo. No se menciona uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en español formal de Argentina, con registro académico e institucional.
- Recuperación y aplicación de normativa universitaria argentina (leyes, decretos, resoluciones del corpus Infoleg).
- Razonamiento sobre consultas regulatorias, incluyendo abstención cuando no dispone de información suficiente.
- Procesamiento de imágenes heredado del modelo base (la parte visual no fue reentrenada).
- Integración con pipelines RAG: el modelo está optimizado para responder a partir de fragmentos documentales recuperados.
- Soporte de chat multi-turno mediante plantilla `apply_chat_template` con tokenizador `mistral-common`.
- Capacidades generales de instrucción heredadas de Ministral 3 8B Instruct (no verificadas específicamente en esta ficha).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al español según la model card; no se declara soporte de otros idiomas.

## Casos de uso

- Consulta normativa universitaria con RAG: el modelo responde preguntas sobre leyes y resoluciones usando fragmentos recuperados de un digesto actualizado, escenario en el que obtuvo 4,90/5 de media en la rúbrica del juez (utilidad, fidelidad, completitud y claridad) sobre 60 consultas.
- Asistente de digesto institucional: despliegue sobre el corpus jurídico de una universidad concreta para que estudiantes, docentes y personal administrativo consulten normativa interna, complementando la capa base con los actos propios de cada institución mediante la receta publicada.
- Evaluación de comprensión normativa sin documentos: útil para medir cuánto conocimiento regulatorio ha internalizado realmente el modelo en tareas de examen o autoevaluación, dado que supera al base (48,7 % frente a 7,7 % de respuestas correctas).
- Atención al público en secretarías académicas: gestionar consultas sobre trámites, plazos y requisitos con respuestas en español formal argentino, apoyándose en RAG sobre la reglamentación vigente.
- Generación de resúmenes y explicaciones de normativa: transformar textos legales densos en explicaciones accesibles para estudiantes o para comunicación institucional.
- Investigación en adaptación de dominio: servir como referencia metodológica para equipos que quieran replicar el ajuste completo sobre un modelo abierto con corpus público y recursos universitarios, con receta, código y documentación disponibles.
- Despliegue en entornos sin GPU: las versiones GGUF Q4_K_M (5,2 GB) y Q8_0 (9,0 GB) permiten ejecutar el modelo con llama.cpp, Ollama o LM Studio en hardware modesto, útil para oficinas universitarias con equipos de escritorio.

## Benchmarks y rendimiento

| Evaluación | Ministral 3 8B (base) | Liminar-Ministral-3-8B | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 7,7 % | 48,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,78 | 1,35 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,92 | 4,90 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 2 de 60 | 1 de 60 | 0 de 60 |

Las respuestas abiertas fueron calificadas por Llama 3.3 70B, modelo ajeno a las familias evaluadas. La rúbrica de RAG (utilidad, fidelidad, completitud y claridad) es la empleada en la evaluación humana del asistente de consulta del digesto de la UNLu. Las versiones cuantizadas GGUF no fueron evaluadas por separado.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda GPU con 24 GB o más.
- VRAM estimada con Q8_0 GGUF: unos 9,0 GB de pesos, viables en GPU de 12-16 GB.
- VRAM estimada con Q4_K_M GGUF: unos 5,2 GB de pesos, ejecutable incluso en CPU sin GPU.
- GPU recomendadas: A100, H100 o L40S para bf16 en producción; RTX 4090 (24 GB) para bf16 en single-GPU; RTX 3090/4080 (16-24 GB) para Q8_0.
- Cabe en GPU consumer: sí, en RTX 4090 con bf16 y en GPUs de 12 GB o más con Q8_0; en Q4_K_M funciona en CPU.
- Opciones de despliegue: transformers ≥ 5 con `mistral-common`, llama.cpp (`llama-server`), Ollama (`ollama run hf.co/LICDIA-UNLu/Liminar-Ministral-3-8B:Q4_K_M`), LM Studio. No se menciona vLLM ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento consumió 69 horas de GPU (horas de tile) en Intel Data Center Max 1550, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento normativo (sin docs) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Ministral-3-8B | 8,9 B | no disponible | 48,7 % correctas; nota 1,35 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Ministral 3 8B Instruct (base) | ~8,9 B | no disponible | 7,7 % correctas; nota 0,78 | Apache 2.0 | Hugging Face |
| gpt-4.1-mini | no disponible | no disponible | 14,3 % correctas; nota 0,77 | propietaria | API OpenAI |

La comparativa con gpt-4.1-mini solo cubre el benchmark de normativa y RAG publicado por el autor; no hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible para ninguno de los tres modelos, por lo que no se puede establecer una comparación de capacidades generales.

## Limitaciones y advertencias

- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; requiere RAG sobre fuente actualizada para consultas regulatorias reales.
- Puede equivocar números de normas, fechas y montos, incluso con documentos a la vista (1 de 60 respuestas con algún dato incorrecto en la evaluación RAG).
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución siguiendo la receta publicada.
- El ajuste fue solo textual: la rama de procesamiento de imágenes corresponde al modelo base sin cambios, por lo que las capacidades visuales no están adaptadas al dominio.
- En respuestas ajenas a normativa, a veces cita normas que no vienen al caso (alucinación de citas).
- Las respuestas de entrenamiento las escribió Qwen 3.5 27B, lo que puede introducir sesgos estilísticos heredados de ese modelo.
- Idiomas: solo español declarado; no se garantiza comportamiento en otras lenguas.
- Las cuantizaciones GGUF no fueron evaluadas por separado; su rendimiento puede diferir del bf16 reportado.
- Licencia Apache 2.0 permite uso comercial, pero persisten las obligaciones de atribución del modelo base Ministral 3 8B.
- No hay información sobre sesgos demográficos, políticos o institucionales específicos más allá de los límites declarados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Ministral-3-8B
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Repositorio de código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio LICDIA: https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
- Corpus normativo Infoleg: https://www.argentina.gob.ar/normativa (base de datos.jus.gob.ar, CC BY 4.0)
