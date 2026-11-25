# LICDIA-UNLu/Liminar-Mistral-Small-3.2-24B

## Resumen

Liminar-Mistral-Small-3.2-24B es un ajuste fino (finetune) del modelo Mistral Small 3.2 24B Instruct de Mistral AI, desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján (Argentina). El modelo está especializado en normativa universitaria argentina, instituciones del sistema universitario y español formal de Argentina, y forma parte de la familia Liminar de modelos abiertos del sistema universitario argentino.

El modelo parte de una arquitectura transformer multimodal (mistral3, pipeline image-text-to-text) con 24.011.361.280 parámetros totales y se distribuye bajo licencia Apache 2.0, la misma del modelo base. La adaptación se realizó mediante un LoRA de rango 256 sobre las capas lineales, fusionado posteriormente con el modelo base, entrenado con FSDP en la supercomputadora Clementina XXI.

Su relevancia radica en que aborda un dominio muy específico y poco cubierto por los modelos generalistas: el conocimiento de normativa universitaria argentina. Según la evaluación del autor, mejora sustancialmente el recuerdo de normas frente al modelo base (46,3 % de respuestas correctas frente a 9,7 %) y ofrece un rendimiento comparable en tareas de consulta con documentos (RAG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (mistral3, image-text-to-text) |
| Parametros totales | 24.011.361.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales), GGUF Q8_0 (8 bits) y Q4_K_M (4 bits) |
| Idiomas soportados | es (español, con orientación al español formal de Argentina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Mistral Small 3.2 24B Instruct (familia mistral3), un transformer multimodal capaz de procesar texto e imágenes. El ajuste fino se realizó mediante un LoRA de rango 256 aplicado sobre las capas lineales, que posteriormente se fusionó con el modelo base. El entrenamiento se llevó a cabo con FSDP en un nodo de la supercomputadora Clementina XXI (8 tiles de GPU Intel Data Center Max 1550), con un coste de 114 horas de GPU (horas de tile). El proceso consistió en una época de preguntas y respuestas y cuatro épocas con todos los datos.

Los datos de entrenamiento provienen de normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0) curada manualmente, textos públicos sobre la vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con su permiso). A partir de ese corpus se generaron datos sintéticos con el documento a la vista: fragmentos con su ficha, versiones reescritas, preguntas y respuestas, ejemplos de abstención, identidad, respuestas del propio modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento las redactó Qwen 3.5 27B, por lo que el modelo aprende en parte su estilo. No se menciona en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto en español formal de Argentina, con especialización en normativa universitaria argentina.
- Respuesta a preguntas sobre normas, instituciones y vida académica del sistema universitario argentino.
- Capacidad de abstención: el modelo fue entrenado con ejemplos de abstención para reconocer cuándo no dispone de información.
- Consulta con documentos (RAG): responde utilizando fragmentos recuperados de un sistema de recuperación.
- Procesamiento de imágenes heredado del modelo base (la parte visual no fue ajustada).
- Soporte de conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Capacidades multilingües limitadas al español según la model card (idioma declarado: es).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Consulta de normativa universitaria: el modelo puede responder preguntas sobre leyes, decretos y resoluciones del sistema universitario argentino, aprovechando su ajuste específico sobre el corpus de Infoleg y su mejora medida en recuerdo de normas (46,3 % de respuestas correctas frente a 9,7 % del base).
- Asistente de digesto jurídico con RAG: integrado con un sistema de recuperación de documentos, puede responder consultas sobre normativa vigente citando los fragmentos recuperados; la evaluación reporta 0 respuestas con datos incorrectos de 60 consultas.
- Atención al público en dependencias universitarias: puede gestionar consultas de estudiantes y personal sobre trámites, reglamentos y vida académica en español formal argentino.
- Generación de material divulgativo institucional: redacción de resúmenes y explicaciones de normativa para comunicación interna de universidades.
- Apoyo a la docencia y a la investigación administrativa: respuestas sobre estructura institucional, organismos (CONICET, CIN) y marcos normativos.
- Despliegue en entornos sin GPU: mediante las versiones GGUF Q4_K_M (14,3 GB) o Q8_0 (25,1 GB) puede ejecutarse con llama.cpp, Ollama o LM Studio en hardware de consumo.
- Base para ajustes institucionales: cada universidad puede partir de este modelo y añadir sus actos internos mediante la receta publicada por LICDIA.

## Benchmarks y rendimiento

| Evaluación | Modelo base | Liminar | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 9,7 % | 46,3 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,76 | 1,26 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,94 | 4,92 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 1 de 60 | 0 de 60 | 0 de 60 |

Las respuestas abiertas las calificó Llama 3.3 70B como juez. La evaluación corresponde al modelo en bf16; las versiones cuantizadas no se evaluaron por separado. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 48 GB (24 011 millones de parámetros × 2 bytes); el repositorio completo pesa 87,4 GB. En Q8_0 el archivo GGUF es de 25,1 GB y en Q4_K_M de 14,3 GB.
- GPU recomendadas: para bf16 se requiere al menos una GPU de 48 GB o varias en paralelo (A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`). Para Q8_0 basta una GPU de 24-32 GB (RTX 3090, RTX 4090, A10G). Para Q4_K_M cabe en GPUs de 16-24 GB.
- Cabe en consumer GPU: sí, en versiones cuantizadas. Q4_K_M (14,3 GB) cabe en RTX 4080/4090 (16-24 GB) y Q8_0 (25,1 GB) en RTX 3090/4090 de 24 GB con margen ajustado.
- Opciones de despliegue: transformers 5 o posterior con `mistral-common` (requerido para el tokenizador), llama.cpp (`llama-server`), Ollama (`ollama run hf.co/LICDIA-UNLu/Liminar-Mistral-Small-3.2-24B:Q4_K_M`) y LM Studio. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Liminar-Mistral-Small-3.2-24B | 24,0 B | no disponible | Normativa universitaria argentina, español de Argentina | Apache 2.0 | safetensors, GGUF |
| Mistral Small 3.2 24B Instruct (base) | 24,0 B | no disponible | Propósito general, multimodal | Apache 2.0 | safetensors |
| gpt-4.1-mini (referencia propietaria) | no disponible | no disponible | Propósito general | propietaria | API |

En la evaluación del autor, Liminar supera al modelo base en recuerdo de normativa sin documentos (46,3 % frente a 9,7 % de respuestas correctas) y también a gpt-4.1-mini en esa misma tarea (46,3 % frente a 14,3 %), mientras que en consulta con documentos los tres modelos se sitúan en un rango muy próximo (4,92-4,98 sobre 5). No se dispone de datos de benchmarks estándar que permitan una comparación más amplia con otras alternativas.

## Limitaciones y advertencias

- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas sobre normas concretas conviene usar RAG sobre una fuente actualizada.
- Puede equivocar números de normas, fechas y montos.
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución con la receta publicada.
- El ajuste se realizó solo con texto: la parte que procesa imágenes es la del modelo base, sin cambios.
- El modelo fue entrenado con respuestas generadas por Qwen 3.5 27B, por lo que puede reproducir en parte su estilo.
- El idioma declarado es únicamente español; no se documenta rendimiento en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en datos numéricos y referencias normativas.
- La evaluación se realizó solo sobre el modelo en bf16; las versiones cuantizadas no se evaluaron por separado, por lo que su rendimiento puede diferir.
- No se documentan sesgos específicos conocidos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las fuentes de datos (algunas con licencias CC BY y una con permiso expreso del CIN).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Mistral-Small-3.2-24B
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio LICDIA (UNLu): https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
- Fuente de normativa (Infoleg): https://datos.jus.gob.ar
- Portal del Estado argentino: https://www.argentina.gob.ar
- CONICET: https://www.conicet.gov.ar
- Consejo Interuniversitario Nacional: https://www.cin.edu.ar
