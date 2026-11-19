# LICDIA-UNLu/Liminar-Gemma-4-31B

## Resumen
Liminar-Gemma-4-31B es un ajuste fino de Gemma 4 31B-it desarrollado por el LICDIA (Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial) de la Universidad Nacional de Luján, Argentina. El modelo está especializado en normativa universitaria argentina, vida académica e instituciones del sistema universitario, y en español formal de Argentina. Forma parte de la familia Liminar, cuyo objetivo es dotar al sistema universitario argentino de modelos abiertos adaptados a su dominio.

El modelo parte de los 31.273.088.876 parámetros de Gemma 4 31B-it y se adapta mediante un LoRA de rango 256 sobre las capas lineales, fusionado posteriormente con el modelo base. El entrenamiento se realizó con FSDP en un nodo de la supercomputadora Clementina XXI (8 tiles de GPU Intel Data Center Max 1550), consumiendo 268 horas de GPU (horas de tile). La licencia es Apache 2.0, la misma del modelo base.

Su relevancia radica en que mejora sustancialmente el rendimiento del modelo base en consultas sobre normativa sin documentos (del 13,3 % al 44,7 % de respuestas correctas) y ofrece un rendimiento prácticamente idéntico al de gpt-4.1-mini en consultas con recuperación (RAG). El modelo está pensado para usarse con RAG sobre fuentes actualizadas, ya que no conoce qué normas siguen vigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 31B-it, ajuste fino con LoRA fusionado) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura transformer de Gemma 4 31B-it, un modelo multimodal de tipo image-text-to-text según las etiquetas del repositorio. El ajuste se realizó mediante un LoRA de rango 256 aplicado sobre las capas lineales y posteriormente fusionado con el modelo base, de modo que el resultado es un checkpoint denso de 31.273 millones de parámetros sin adaptadores separados.

Los datos de entrenamiento combinan normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0), textos públicos sobre vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con su permiso). Sobre ese corpus se generaron datos con el documento a la vista: fragmentos con su ficha, versiones reescritas, preguntas y respuestas, ejemplos de abstención, identidad, respuestas del propio modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento las escribió Qwen 3.5 27B, por lo que el modelo aprende en parte su estilo. El entrenamiento consistió en una época de preguntas y respuestas y cuatro épocas con todos los datos, con FSDP en 8 tiles de GPU Intel Data Center Max 1550 de Clementina XXI, durante 268 horas de GPU (horas de tile).

## Capacidades
- Generación de texto conversacional en español formal de Argentina.
- Respuesta a preguntas sobre normativa universitaria argentina (leyes, decretos, resoluciones del corpus).
- Consulta con documentos (RAG): integración con fragmentos recuperados por un sistema de recuperación real.
- Abstención: capacidad entrenada para no responder cuando no dispone de información suficiente.
- Identidad y consignas generales: mantiene respuestas del modelo base para consultas ajenas al dominio.
- Capacidad multimodal heredada del modelo base (image-text-to-text), según las etiquetas del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al español según la model card.

## Casos de uso
- Asistente de consulta de normativa universitaria: el modelo responde preguntas sobre leyes y resoluciones del corpus con una tasa de acierto del 44,7 % sin documentos, útil como primera capa antes de derivar a RAG.
- Atención al público en secretarías académicas: gestiona conversaciones multi-turno sobre trámites, planes de estudio y reglamentos, con capacidad de abstención cuando la consulta excede el corpus.
- RAG sobre digestos institucionales: integrado con un sistema de recuperación, alcanza un promedio de 4,99 sobre 5 en la rúbrica de utilidad, fidelidad, completitud y claridad, sin datos incorrectos en 60 consultas.
- Generación de resúmenes y reescritura de normativa: produce versiones reescritas de fragmentos normativos para comunicación interna o divulgación, aprovechando los datos de reescritura del entrenamiento.
- Formación y docencia: apoyo a estudiantes y docentes en la interpretación de reglamentos de posgrado, becas y concursos, con la advertencia de verificar vigencia.
- Capa base para adaptaciones institucionales: cada universidad puede aplicar la receta de LICDIA para incorporar sus actos internos, ya que el modelo no los conoce.
- Evaluación de sistemas RAG: sirve como modelo de referencia para medir fidelidad y completitud en pipelines de recuperación sobre dominios jurídico-administrativos.

## Benchmarks y rendimiento

| Evaluación | Modelo base (Gemma 4 31B-it) | Liminar-Gemma-4-31B | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 13,3 % | 44,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,73 | 1,29 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,94 | 4,99 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

Las respuestas abiertas fueron calificadas por Llama 3.3 70B, ajeno a las familias evaluadas. El benchmark de normativa mide cuánto recuerda el modelo del corpus sin documentos; el de RAG usa fragmentos de un sistema de recuperación real y la rúbrica con la que se evaluó con personas el asistente de consulta del digesto de la UNLu.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 31.273 millones de parámetros en safetensors, el checkpoint en precisión completa ocupa aproximadamente 62,6 GB (tamaño del repo), por lo que la inferencia en fp16 requiere del orden de 62 GB de VRAM más overhead.
- GPU recomendadas: el entrenamiento se realizó en 8 tiles de GPU Intel Data Center Max 1550; para inferencia se requieren GPUs de clase数据中心 con al menos 80 GB por dispositivo (A100 80 GB, H100 80 GB) o configuración multi-GPU.
- Cabe en consumer GPU: no en una sola GPU de consumo; requeriría cuantización (no documentada) o reparto multi-GPU.
- Opciones de despliegue: transformers 5 o posterior (requisito explícito de la model card). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Rendimiento en el benchmark del autor |
|---|---|---|---|---|---|
| Liminar-Gemma-4-31B | 31,27 B | No disponible | Apache 2.0 | Normativa universitaria argentina | 44,7 % sin documentos; 4,99 en RAG |
| Gemma 4 31B-it (base) | 31,27 B | No disponible | Apache 2.0 | Generalista multimodal | 13,3 % sin documentos; 4,94 en RAG |
| gpt-4.1-mini | No disponible | No disponible | Propietaria | Generalista | 14,3 % sin documentos; 4,98 en RAG |

No se dispone de datos de otros modelos comparables de la misma categoría (especializados en normativa universitaria argentina) en la información proporcionada.

## Limitaciones y advertencias
- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; puede confundir números de norma, fechas y montos.
- No conoce los actos internos de cada universidad; esa capa debe añadirse con la receta del proyecto.
- Entrenado únicamente en español de Argentina; el rendimiento en otros idiomas o variantes no está documentado.
- Riesgo de alucinación en consultas fuera del corpus o sobre normativa posterior a la fecha de recopilación.
- Las respuestas de entrenamiento fueron generadas por Qwen 3.5 27B, por lo que el modelo puede reproducir parcialmente su estilo.
- Para consultas sobre normas concretas se recomienda usar RAG sobre una fuente actualizada, tal como advierte la model card.
- Licencia Apache 2.0: permite uso comercial, pero se debe verificar el cumplimiento de las licencias de las fuentes de datos (CC BY 4.0, CC BY 2.5 AR) y de los términos del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; es un modelo reciente (creado el 19 de noviembre de 2026) sin validación externa publicada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio: https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
