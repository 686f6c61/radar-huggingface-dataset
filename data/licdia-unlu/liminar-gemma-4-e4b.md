# LICDIA-UNLu/Liminar-Gemma-4-E4B

## Resumen

Liminar-Gemma-4-E4B es un ajuste fino de dominio del modelo google/gemma-4-E4B-it, desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján (Argentina). Su objetivo es adaptar un modelo multimodal abierto al sistema universitario argentino: normativa nacional, instituciones, vida académica y español formal de Argentina. Resuelve el problema de que un modelo generalista no conoce el corpus normativo universitario ni el registro lingüístico administrativo local.

El modelo parte de la arquitectura Gemma 4 E4B, con 7.941.100.874 parámetros totales según los safetensors del repositorio. Se distribuye con licencia Apache 2.0, la misma del modelo base, y está pensado para consultas sobre normativa y para su uso con recuperación de documentos (RAG) sobre fuentes actualizadas.

Su relevancia radica en dos factores: es un ajuste completo (no un adaptador) sobre una supercomputadora pública argentina (Clementina XXI), y publica una evaluación honesta frente a su modelo base, incluyendo una caída controlada en conocimiento general a cambio de una mejora sustancial en el dominio normativo (31,7 % frente a 5,7 % de respuestas correctas sin documentos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), con tabla de embeddings por capa (`embed_tokens_per_layer`) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones habituales de la familia Gemma) |
| Idiomas soportados | es (español, con foco en español formal de Argentina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base google/gemma-4-E4B-it, un transformer multimodal con capacidad image-text-to-text. El ajuste fue completo sobre todos los pesos salvo la tabla de embeddings por capa (`embed_tokens_per_layer`, 2.820 millones de parámetros), que quedó congelada. El entrenamiento se realizó con FSDP (Fully Sharded Data Parallel) en un nodo de la supercomputadora Clementina XXI, con 8 tiles de GPU Intel Data Center Max 1550, durante 77 horas de GPU (horas de tile): una época de preguntas y respuestas y cuatro épocas con todos los datos.

El corpus de entrenamiento combina normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0), textos públicos sobre vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con permiso). Sobre ese corpus se generaron datos sintéticos con el documento a la vista: fragmentos con su ficha, versiones reescritas, pares pregunta-respuesta, ejemplos de abstención, identidad, respuestas del modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento fueron generadas por Qwen 3.5 27B, por lo que el modelo incorpora parcialmente su estilo. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en español formal de Argentina, orientada a consultas sobre normativa universitaria.
- Conocimiento del corpus normativo universitario nacional incluido en el entrenamiento (Infoleg, CIN, CONICET).
- Consulta con documentos (RAG): el modelo está entrenado con ejemplos de consulta con fragmentos recuperados y responde a partir de ellos.
- Abstención: incluye ejemplos de entrenamiento específicos para no responder cuando no dispone de información.
- Identidad propia de la familia Liminar (modelo del sistema universitario argentino).
- Capacidades multimodales (imagen y audio) heredadas del modelo base, sin ajuste específico: la parte que procesa imágenes y audio es la del modelo base, sin cambios.
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al español según la model card (idioma declarado: es).

## Casos de uso

- Consulta de normativa universitaria con RAG: el modelo está entrenado para responder a partir de fragmentos recuperados por un sistema de recuperación real; en la evaluación con 60 consultas obtuvo una media de 5,00 sobre 5 y 0 respuestas con datos incorrectos. Es el caso de uso principal y el que mejor rinde.
- Asistencia a secretarías académicas y áreas de gestión universitaria: resolución de dudas sobre reglamentos, estatutos y resoluciones del sistema universitario argentino, con la advertencia de verificar vigencia en la fuente oficial.
- Atención al estudiantado: respuestas sobre vida académica, becas, organismos (CONICET, CIN) y trámites descritos en el corpus, en registro formal argentino.
- Generación de borradores administrativos: redacción de textos con terminología normativa universitaria y estilo administrativo argentino, a partir de documentos aportados en contexto.
- Base para adaptaciones institucionales: cada universidad puede partir de esta receta (código y receta públicos en GitHub) para sumar sus actos internos, que el modelo no conoce.
- Evaluación comparativa de modelos en dominio jurídico-administrativo: sirve como referencia de ajuste de dominio con evaluación frente al modelo base y con un juez externo (Llama 3.3 70B).
- Filtro de abstención en pipelines de consulta normativa: el entrenamiento incluye ejemplos de abstención, útil para derivar a revisión humana cuando la consulta queda fuera del corpus.

## Benchmarks y rendimiento

Datos publicados en la model card. Cada modelo se compara con su base; las respuestas abiertas las califica Llama 3.3 70B, ajeno a las familias evaluadas.

| Evaluación | Modelo base (Gemma 4 E4B) | Liminar-Gemma-4-E4B |
|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 5,7 % | 31,7 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,37 | 1,10 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,89 | 5,00 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 |
| MMMLU ES-LA (1.026 preguntas, respuesta redactada): exactitud | 64,3 % | 60,6 % |

Referencia externa citada en la model card: gpt-4.1-mini responde bien el 14,3 % de las preguntas de normativa sin documentos (nota media 0,77), promedia 4,98 en la consulta con documentos y presenta 0 respuestas incorrectas de 60.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7.941.100.874 parámetros, en fp16 requiere del orden de 16 GB de pesos más memoria para el contexto y el procesador multimodal. En cuantización de 8 bits, aproximadamente 8 GB; en 4 bits, aproximadamente 4-5 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: el autor no publica requisitos. Por tamaño, cabe en GPU de centro de datos (A100, H100) y, en cuantización, en GPU de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en fp16 con margen ajustado).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización, aunque el autor no lo confirma.
- Opciones de despliegue: transformers 5 o posterior (requisito explícito de la model card); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este modelo en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento usó 8 tiles de Intel Data Center Max 1550 durante 77 horas, dato de entrenamiento y no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Gemma-4-E4B | 7.941.100.874 | no disponible | Normativa universitaria argentina | Apache 2.0 | Hugging Face (LICDIA-UNLu) |
| google/gemma-4-E4B-it (base) | no disponible en la información | no disponible | Generalista multimodal | Gemma (según modelo base) | Hugging Face (google) |
| gpt-4.1-mini (referencia cerrada) | no disponible | no disponible | Generalista | Propietaria | API |

En la evaluación de dominio, Liminar supera a su base en normativa sin documentos (31,7 % frente a 5,7 % de respuestas correctas) y en nota del juez (1,10 frente a 0,37), y queda por debajo en conocimiento general (60,6 % frente a 64,3 % en MMMLU ES-LA). Frente a gpt-4.1-mini en normativa sin documentos, Liminar obtiene mejor exactitud (31,7 % frente a 14,3 %) y mejor nota media (1,10 frente a 0,77); en RAG ambos quedan prácticamente empatados (5,00 frente a 4,98, con 0 respuestas incorrectas en ambos casos).

## Limitaciones y advertencias

- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas sobre normas concretas debe usarse con RAG sobre una fuente actualizada.
- Puede equivocar números de normas, fechas y montos.
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución con la receta publicada.
- El ajuste usó solo texto: las capacidades de imagen y audio son las del modelo base, sin adaptación al dominio.
- Rinde peor que el modelo base en conocimiento general (60,6 % frente a 64,3 % en MMMLU ES-LA); para tareas ajenas al sistema universitario conviene el modelo base.
- El estilo de las respuestas de entrenamiento proviene de Qwen 3.5 27B, lo que puede introducir sesgos de estilo de ese modelo.
- Sesgos conocidos específicos: no documentados en la información disponible.
- Riesgo de alucinación: presente en consultas fuera del corpus o cuando se le piden datos no cubiertos; el modelo incluye entrenamiento de abstención, pero no garantiza abstenerse siempre.
- Restricciones de licencia: Apache 2.0, permite uso comercial; conviene verificar las condiciones del modelo base Gemma 4 E4B, ya que la model card declara que la licencia es la misma del base.
- Advertencia para producción: validar siempre las respuestas normativas contra la fuente oficial y mantener el corpus de recuperación actualizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio (LICDIA, UNLu): https://licdia.unlu.edu.ar
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
