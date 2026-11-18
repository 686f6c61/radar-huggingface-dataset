# LICDIA-UNLu/Liminar-Qwen3.5-9B

## Resumen

Liminar-Qwen3.5-9B es un ajuste fino completo del modelo Qwen 3.5 9B, desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján, en Argentina. El modelo está especializado en normativa universitaria argentina, instituciones académicas y español formal de Argentina, y forma parte de la familia Liminar de modelos abiertos del sistema universitario argentino.

El modelo parte de los 9.409.813.744 parámetros del Qwen 3.5 9B original y se entrena mediante un ajuste completo de todos los pesos, sin modo de razonamiento. Su propósito es responder consultas sobre legislación universitaria nacional (Infoleg), vida académica y organismos como CONICET o el Consejo Interuniversitario Nacional, un dominio en el que los modelos generalistas rinden mal: el modelo base acierta solo un 6,0 % de las preguntas de normativa sin documentos, frente al 36,7 % de Liminar.

La relevancia actual del modelo radica en dos factores: por un lado, demuestra que un ajuste fino dirigido sobre un modelo de 9B puede multiplicar por seis la precisión en un dominio vertical regulado; por otro, se distribuye con licencia Apache 2.0 en safetensors y GGUF, lo que permite desplegarlo tanto en infraestructura con GPU como en equipos de consumo mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5 9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales), Q8_0 (8 bits), Q4_K_M (4 bits) |
| Idiomas soportados | Español (es), con foco en español formal de Argentina |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer del Qwen 3.5 9B y se somete a un ajuste completo de todos los pesos (full fine-tuning), no a un ajuste parametrizado eficiente. El entrenamiento se ejecutó con FSDP en un nodo de la supercomputadora Clementina XXI, equipado con 8 tiles de GPU Intel Data Center Max 1550, durante 191 horas de GPU (horas de tile). Se realizó una época sobre datos de preguntas y respuestas y cuatro épocas adicionales con el conjunto completo de datos.

El corpus de entrenamiento combina normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0), textos públicos de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con permiso). Sobre ese material se generaron datos sintéticos con el documento a la vista: fragmentos con su ficha, versiones reescritas, pares de pregunta y respuesta, ejemplos de abstención, identidad, respuestas del modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento las redactó Qwen 3.5 27B, de modo que el modelo adopta parcialmente su estilo. El ajuste se realizó sin el modo de razonamiento de Qwen 3.5 y la plantilla de chat lo deja desactivado por omisión.

## Capacidades

- Generación de texto conversacional en español formal de Argentina, con registro académico e institucional.
- Respuesta a preguntas sobre normativa universitaria nacional argentina (leyes, decretos, resoluciones del corpus de Infoleg).
- Consulta con documentos mediante RAG: el modelo integra fragmentos recuperados y responde sobre ellos con fidelidad alta.
- Abstención explícita cuando la información no está en el corpus o en los documentos aportados.
- Identidad y contexto institucional del sistema universitario argentino (CONICET, CIN, universidades nacionales).
- Procesamiento de entradas de imagen y texto según la etiqueta `image-text-to-text` del repositorio, heredada del modelo base.
- Compatibilidad con endpoints y plantillas de chat estándar de `transformers` 5 o posterior.
- No dispone de modo de razonamiento activable en la plantilla de chat distribuida.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en oficinas de alumnado y secretarías académicas: el modelo responde consultas sobre trámites, requisitos y plazos citando la normativa correspondiente, con abstención cuando la consulta excede el corpus. Es adecuado porque su entrenamiento incluye ejemplos de abstención y de consulta con documentos.
- Asistente de normativa para gestores universitarios: integrado en un sistema RAG sobre el digesto normativo actualizado de cada institución, ayuda a localizar la norma aplicable a un caso concreto (concursos docentes, equivalencias, régimen de alumnado).
- Generación de borradores de resoluciones y notas internas: el modelo produce texto administrativo en español formal argentino, que el personal revisa y adapta; su estilo se alinea con el registro institucional del corpus.
- Formación y divulgación: responde preguntas de estudiantes y público general sobre el funcionamiento del sistema universitario argentino, la autonomía universitaria o el régimen de becas, con un tono accesible y formal.
- Despliegue en equipos sin GPU: la cuantización Q4_K_M (5,6 GB) permite ejecutar el modelo en portátiles mediante Ollama o LM Studio, útil para oficinas con infraestructura limitada.
- Capa base para ajustes institucionales: cada universidad puede partir de este modelo y aplicar la receta publicada en el repositorio de GitHub para incorporar sus actos internos, que el modelo no conoce de serie.
- Investigación en adaptación de dominio: sirve como caso de estudio reproducible de ajuste completo sobre hardware no convencional (Intel Data Center Max 1550) con receta y datos documentados.

## Benchmarks y rendimiento

| Evaluación | Modelo base (Qwen 3.5 9B) | Liminar-Qwen3.5-9B | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 6,0 % | 36,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,61 | 1,08 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,99 | 4,97 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

Las respuestas abiertas fueron calificadas por Llama 3.3 70B, un modelo ajeno a las familias evaluadas. El benchmark de normativa mide cuánto recuerda el modelo del corpus sin documentos; la consulta con documentos emplea fragmentos de un sistema de recuperación real y la rúbrica de evaluación humana de ChatDigesto (utilidad, fidelidad, completitud y claridad). Las versiones cuantizadas en GGUF no se evaluaron por separado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 19-20 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB.
- VRAM estimada con Q8_0 (9,5 GB): aproximadamente 11-12 GB en total, apto para GPU de 16 GB.
- VRAM estimada con Q4_K_M (5,6 GB): aproximadamente 7-8 GB en total, apto para GPU de 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16; RTX 4090 (24 GB) para bf16 justo o Q8_0 con holgura; RTX 4080/4070 Ti Super (16 GB) para Q8_0; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q4_K_M.
- Cabe en GPU de consumo: sí, en bf16 con una RTX 4090 o superior; en Q4_K_M en tarjetas de 8 GB o más.
- Opciones de despliegue: `transformers` 5 o posterior con `device_map="auto"`, llama.cpp (`llama-server`), Ollama (`ollama run hf.co/LICDIA-UNLu/Liminar-Qwen3.5-9B:Q4_K_M`), LM Studio. Compatible con endpoints estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Qwen3.5-9B | 9,41 B | No disponible | Normativa universitaria argentina | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen 3.5 9B (base) | 9,41 B | No disponible | Propósito general | Apache 2.0 | Hugging Face |
| gpt-4.1-mini | No disponible | No disponible | Propósito general (API) | Propietaria | API de OpenAI |
| Llama 3.3 70B | 70 B | No disponible | Propósito general | Licencia comunitaria de Meta | Hugging Face |

Frente a su modelo base, Liminar multiplica por seis la tasa de respuestas correctas en normativa sin documentos (6,0 % a 36,7 %) y casi duplica la nota media del juez (0,61 a 1,08), manteniendo un rendimiento equivalente en consulta con documentos (4,97 frente a 4,99). Frente a gpt-4.1-mini, supera ampliamente al modelo propietario en conocimiento de normativa sin documentos (36,7 % frente a 14,3 %) y empata en la consulta con documentos (4,97 frente a 4,98). Llama 3.3 70B se emplea únicamente como juez en la evaluación, no como modelo comparable en tarea.

## Limitaciones y advertencias

- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas sobre normas concretas debe usarse con RAG sobre una fuente actualizada.
- Puede equivocar números de norma, fechas y montos, incluso cuando el tema es correcto.
- No conoce los actos internos de cada universidad; esa capa debe añadirse con la receta publicada por el autor.
- El ajuste se hizo sin modo de razonamiento y la plantilla de chat lo deja apagado; no debe esperarse comportamiento de cadena de pensamiento.
- El modelo se entrenó con respuestas generadas por Qwen 3.5 27B, por lo que hereda parcialmente su estilo y posibles sesgos.
- El corpus cubre normativa y vida universitaria argentina; su utilidad fuera de ese dominio o en otros países es limitada.
- Las versiones cuantizadas en GGUF no se evaluaron por separado, por lo que su rendimiento puede diferir del bf16 medido.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de verificar la exactitud de las respuestas en contextos regulados.
- Riesgo de alucinación en preguntas fuera del corpus o cuando se le pide información posterior a la fecha de recopilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Qwen3.5-9B
- Modelo base Qwen 3.5 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- LICDIA, Universidad Nacional de Luján: https://licdia.unlu.edu.ar
- Infoleg (base de datos.jus.gob.ar): https://datos.jus.gob.ar
- argentina.gob.ar: https://www.argentina.gob.ar
- CONICET: https://www.conicet.gov.ar
- Consejo Interuniversitario Nacional: https://www.cin.edu.ar
