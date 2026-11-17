# LICDIA-UNLu/Liminar-Ministral-3-8B

## Resumen

Liminar-Ministral-3-8B es un ajuste fino completo del modelo Ministral 3 8B Instruct de Mistral AI, desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján, en Argentina. El modelo está especializado en normativa universitaria argentina, instituciones académicas y español formal rioplatense, y forma parte de la familia Liminar de modelos abiertos del sistema universitario argentino.

El modelo parte de una arquitectura Mistral 3 con 8.918.026.240 parámetros totales y se distribuye bajo licencia Apache 2.0, la misma del modelo base. Su pipeline declarado es text-generation, aunque conserva la torre de visión del modelo original (image-text-to-text) sin modificaciones durante el ajuste, que se realizó únicamente sobre texto.

Su relevancia radica en que aborda un dominio muy específico y poco cubierto por los modelos generalistas: el conocimiento de la normativa universitaria argentina. Según la model card, mejora sustancialmente al modelo base en preguntas sobre normativa sin documentos (del 7,7 % al 48,7 % de respuestas correctas), a costa de un descenso en conocimiento general (del 64,5 % al 48,8 % en MMMLU ES-LA). Está pensado para usarse con recuperación de documentos (RAG) sobre fuentes actualizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral 3), multimodal image-text-to-text en el modelo base |
| Parametros totales | 8.918.026.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español, con foco en español formal de Argentina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mistral 3 del modelo base mistralai/Ministral-3-8B-Instruct-2512, con una torre de visión para entrada image-text-to-text que no fue modificada durante el ajuste. El entrenamiento consistió en un ajuste completo de todos los pesos (full fine-tuning), no en un ajuste de adaptadores, utilizando FSDP sobre un nodo de la supercomputadora Clementina XXI con 8 tiles de GPU Intel Data Center Max 1550. El cómputo total empleado fue de 69 horas de GPU (horas de tile), con una época de preguntas y respuestas y cuatro épocas con el conjunto completo de datos.

El corpus de entrenamiento combina normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0) curada manualmente, textos públicos sobre vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con permiso), junto con datos sintéticos generados a partir de ese corpus con el documento a la vista: fragmentos con su ficha, versiones reescritas, pares pregunta-respuesta, ejemplos de abstención, identidad, respuestas del modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento fueron generadas por Qwen 3.5 27B, por lo que el modelo adopta en parte su estilo. No se menciona en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre normativa universitaria argentina, con conocimiento memorizado del corpus de entrenamiento.
- Consulta asistida con documentos (RAG): responde a partir de fragmentos recuperados por un sistema de recuperación.
- Capacidad de abstención ante preguntas fuera de su conocimiento o sin documentos de apoyo.
- Respuestas en español formal de Argentina, adaptadas al registro académico e institucional.
- Conserva la torre de visión del modelo base (image-text-to-text), aunque el ajuste se realizó solo con texto.
- Soporte de conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Consulta de normativa universitaria con RAG: el modelo responde preguntas sobre leyes, decretos y resoluciones a partir de fragmentos recuperados de una fuente actualizada, con una fidelidad media de 4,90 sobre 5 y solo 1 respuesta con datos incorrectos de 60 en la evaluación del autor.
- Asistencia a estudiantes y personal administrativo: resolución de dudas sobre trámites, estatutos y reglamentos académicos en español rioplatense, con registro formal adecuado al ámbito universitario.
- Redacción de documentos institucionales: borradores de notas, informes y comunicaciones internas alineados con la terminología y el estilo del sistema universitario argentino.
- Memoria normativa sin documentos: recuperación de referencias a normas del corpus cuando no hay sistema de recuperación disponible, con una tasa de acierto del 48,7 % (frente al 7,7 % del modelo base).
- Base para adaptación institucional: punto de partida para que cada universidad ajuste el modelo a sus actos internos mediante la receta publicada en el repositorio de GitHub.
- Sistemas de abstención controlada: el modelo fue entrenado con ejemplos de abstención, lo que lo hace adecuado para flujos donde es preferible no responder antes que alucinar una norma inexistente.
- Análisis de documentos académicos con componente visual: al conservar la torre de visión del modelo base, puede procesar imágenes de documentos escaneados, aunque sin garantías de calidad derivadas del ajuste.

## Benchmarks y rendimiento

| Evaluación | Modelo base | Liminar |
|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 7,7 % | 48,7 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,78 | 1,35 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,92 | 4,90 |
| RAG: respuestas con algún dato incorrecto | 2 de 60 | 1 de 60 |
| MMMLU ES-LA (1.026 preguntas, respuesta redactada): exactitud | 64,5 % | 48,8 % |

Como referencia externa, la model card indica que gpt-4.1-mini responde correctamente el 14,3 % de las preguntas de normativa sin documentos (nota media 0,77) y promedia 4,98 en la consulta con documentos, con 0 respuestas incorrectas de 60. Las respuestas abiertas fueron calificadas por Llama 3.3 70B, ajeno a las familias evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de ~8,9 mil millones de parámetros requiere del orden de 18 GB en precisión de 16 bits, cifra no confirmada por el autor.
- GPU recomendadas: el autor no especifica requisitos. El ajuste se realizó sobre Intel Data Center Max 1550 (Clementina XXI), lo que no implica requisitos de inferencia equivalentes.
- Cabe en GPU de consumo: no confirmado por el autor; dependerá de la cuantización empleada, que no está documentada.
- Opciones de despliegue: la model card documenta únicamente `transformers` 5 o posterior con `mistral-common` y `AutoModelForImageTextToText`. No se mencionan vLLM, llama.cpp, Ollama ni TGI. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Ministral-3-8B | 8,9 B | no disponible | Apache 2.0 | Normativa universitaria argentina | Hugging Face |
| Mistral Ministral 3 8B Instruct | no disponible | no disponible | Apache 2.0 (según modelo base) | Generalista, multilingüe | Hugging Face |
| gpt-4.1-mini | no disponible | no disponible | Propietaria | Generalista | API de OpenAI |

La comparación con gpt-4.1-mini se limita a los datos de la model card: el modelo propietario obtiene 14,3 % de acierto sin documentos frente al 48,7 % de Liminar, pero ambos rinden de forma similar con RAG (4,98 frente a 4,90). Frente al modelo base, Liminar gana en normativa y pierde en conocimiento general.

## Limitaciones y advertencias

- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; requiere RAG sobre fuentes actualizadas.
- Puede equivocar números de norma, fechas y montos.
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución con la receta publicada.
- El ajuste se realizó solo con texto: la torre de visión es la del modelo base, sin adaptación.
- Rinde peor que el modelo base en conocimiento general (48,8 % frente a 64,5 % en MMMLU ES-LA); para tareas ajenas al ámbito universitario conviene el modelo base.
- Tiende a citar normas irrelevantes en respuestas que no tratan de normativa: ocurrió en 49 de las 1.026 respuestas de MMMLU ES-LA (el modelo base, en ninguna).
- Riesgo de alucinación en referencias normativas cuando se usa sin documentos de apoyo.
- Sesgos conocidos: no documentados explícitamente en la información disponible; el estilo de respuesta está influido por Qwen 3.5 27B, que generó los datos de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre exactitud normativa en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; su adopción y validación externa son aún inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Ministral-3-8B
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Repositorio de código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio LICDIA: https://licdia.unlu.edu.ar
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
- Fuente normativa Infoleg: https://www.argentina.gob.ar/normativa
- argentina.gob.ar: https://www.argentina.gob.ar
- CONICET: https://www.conicet.gov.ar
- Consejo Interuniversitario Nacional: https://www.cin.edu.ar
