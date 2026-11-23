# LICDIA-UNLu/Liminar-Ministral-3-8B

## Resumen

Liminar-Ministral-3-8B es un ajuste completo (full fine-tuning) del modelo Ministral 3 8B Instruct de Mistral AI, desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján (Argentina). El modelo está especializado en normativa universitaria argentina, instituciones académicas y español formal rioplatense, y forma parte de la familia Liminar de modelos abiertos del sistema universitario argentino.

El problema que aborda es la baja cobertura del modelo base sobre el corpus normativo universitario argentino: según la evaluación del autor, Ministral 3 8B responde correctamente solo el 7,7 % de 300 preguntas sobre normativa sin documentos, frente al 48,7 % de Liminar. En escenarios con recuperación (RAG) ambos modelos rinden de forma comparable, lo que indica que la ganancia se concentra en el conocimiento memorizado del corpus.

Técnicamente es un transformer multimodal de 8.918.026.240 parámetros (8,9 B) con capacidad image-text-to-text heredada del modelo base, licencia Apache 2.0 y pesos en safetensors y GGUF. La adaptación se realizó con ajuste completo de todos los pesos sobre 8 tiles de GPU Intel Data Center Max 1550 en la supercomputadora Clementina XXI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Mistral 3 / Ministral 3 |
| Parametros totales | 8.918.026.240 (8,9 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits) y Q4_K_M (4 bits); pesos completos en bf16 |
| Idiomas soportados | es (español, con foco en español formal de Argentina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer multimodal Ministral 3 8B Instruct de Mistral AI, con torre de visión incluida. El ajuste fue completo sobre todos los pesos (no LoRA ni adaptadores), distribuido con FSDP en un nodo de 8 tiles de GPU Intel Data Center Max 1550 de la supercomputadora Clementina XXI, con un coste de 69 horas de GPU (horas de tile). El entrenamiento consistió en una época de preguntas y respuestas y cuatro épocas con el conjunto completo de datos.

El corpus de entrenamiento combina normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0) curada manualmente, textos públicos de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con permiso). Sobre ese material se generaron datos sintéticos con el documento a la vista: fragmentos con su ficha, versiones reescritas, pares pregunta-respuesta, ejemplos de abstención, identidad, respuestas del modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento fueron redactadas por Qwen 3.5 27B, por lo que el modelo adopta parcialmente su estilo. No se menciona uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento sobre normativa universitaria argentina, con mejora sustancial frente al modelo base en preguntas sin documentos (48,7 % de respuestas correctas frente a 7,7 %).
- Consulta documental con RAG: responde sobre fragmentos recuperados por un sistema de recuperación real, con nota media de 4,90 sobre 5 según el juez evaluador.
- Capacidad image-text-to-text heredada del modelo base, sin ajuste específico sobre imágenes.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`) y tokenizador `mistral-common`.
- Abstención entrenada: el corpus incluye ejemplos explícitos de abstención ante información no disponible.
- Identidad y estilo institucional: respuestas alineadas con el registro formal del español de Argentina y el contexto universitario.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta soporte explícito de modo thinking ni de audio.

## Casos de uso

- Asistente de consulta normativa universitaria con RAG: desplegado sobre un índice actualizado de normativa (Infoleg, resoluciones, estatutos), responde preguntas de estudiantes y personal administrativo citando los fragmentos recuperados; el modelo está entrenado específicamente para este flujo y obtiene 4,90/5 en la rúbrica del autor.
- Atención al público en secretarías académicas: gestiona consultas sobre inscripciones, equivalencias, regímenes de cursada y becas con el registro formal rioplatense esperado en el ámbito universitario.
- Generación de resúmenes y fichas de normativa: a partir de un documento cargado en contexto, produce síntesis estructuradas con datos de la norma, aprovechando los datos de entrenamiento construidos con el documento a la vista.
- Digestos institucionales: integrado en el asistente de consulta del digesto de la UNLu, con la rúbrica de evaluación ya validada con personas (utilidad, fidelidad, completitud y claridad).
- Despliegue en entornos sin GPU: las versiones GGUF Q4_K_M (5,2 GB) y Q8_0 (9,0 GB) permiten ejecución con llama.cpp, Ollama o LM Studio en hardware de consumo, útil para oficinas universitarias con infraestructura limitada.
- Base para adaptación institucional: cada universidad puede aplicar la receta publicada en el repositorio de GitHub para incorporar sus actos internos, que el modelo no conoce de forma nativa.
- Investigación en PLN aplicada al dominio jurídico-administrativo argentino: punto de partida reproducible (receta, datos y evaluación publicados) para estudiar especialización de modelos abiertos en dominios normativos.

## Benchmarks y rendimiento

| Evaluación | Ministral 3 8B (base) | Liminar-Ministral-3-8B | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 7,7 % | 48,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,78 | 1,35 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,92 | 4,90 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 2 de 60 | 1 de 60 | 0 de 60 |

Las respuestas abiertas fueron calificadas por Llama 3.3 70B, ajeno a las familias evaluadas. La evaluación corresponde al modelo en bf16; las versiones cuantizadas no se evaluaron por separado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- GGUF Q8_0: 9,0 GB de pesos, viable en GPU de 12-16 GB o en CPU con RAM suficiente.
- GGUF Q4_K_M: 5,2 GB de pesos, viable en GPU de consumo de 8 GB y en CPU.
- GPU recomendadas: A100, H100 o L40S para bf16 en producción; RTX 4090 (24 GB) para bf16 en una sola tarjeta; RTX 3090/4080 para Q8_0; RTX 3060/4060 o inferencia en CPU para Q4_K_M.
- Opciones de despliegue: transformers 5 o posterior con `mistral-common`, vLLM o TGI para serving en bf16, llama.cpp, Ollama y LM Studio para GGUF. El modelo está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Ministral-3-8B | 8,9 B | no disponible | Normativa universitaria argentina, español rioplatense | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Ministral 3 8B Instruct | 8 B (aprox.) | no disponible | Propósito general, multilingüe | no disponible en la información | Hugging Face (modelo base) |
| gpt-4.1-mini | no disponible | no disponible | Propósito general | Propietaria | API de OpenAI |

El modelo base Ministral 3 8B queda por debajo de Liminar en conocimiento normativo sin documentos (7,7 % frente a 48,7 %) pero rinde de forma equivalente en RAG (4,92 frente a 4,90). gpt-4.1-mini, usado como referencia externa, supera a Liminar en RAG (4,98 y 0 errores frente a 4,90 y 1 error) pero queda por debajo en conocimiento normativo memorizado (14,3 % frente a 48,7 %). No se dispone de datos de contexto ni de otros benchmarks para una comparación más amplia.

## Limitaciones y advertencias

- No conoce la vigencia de las normas: no sabe qué disposiciones siguen activas ni cuáles cambiaron después de la fecha del corpus. Para producción debe combinarse con RAG sobre una fuente actualizada.
- Puede equivocar números de norma, fechas y montos, incluso con el documento en contexto (1 respuesta con algún dato incorrecto de 60 en la evaluación RAG).
- No conoce los actos internos de cada universidad; esa capa debe añadirse con la receta publicada por institución.
- El ajuste usó solo texto: la torre de visión es la del modelo base, sin adaptación al dominio.
- En respuestas ajenas a normativa puede citar normas irrelevantes, un sesgo inducido por el corpus de entrenamiento.
- El estilo de las respuestas de entrenamiento proviene de Qwen 3.5 27B, lo que puede introducir rasgos estilísticos ajenos al modelo base.
- El modelo está entrenado únicamente en español; el rendimiento en otros idiomas no está evaluado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de la información normativa generada; conviene verificar cualquier dato crítico contra la fuente oficial.
- Las versiones cuantizadas no fueron evaluadas por separado, por lo que su rendimiento puede diferir del reportado en bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Ministral-3-8B
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- LICDIA, Universidad Nacional de Luján: https://licdia.unlu.edu.ar
- Infoleg (base de datos.jus.gob.ar): https://datos.jus.gob.ar
- argentina.gob.ar: https://www.argentina.gob.ar
- CONICET: https://www.conicet.gov.ar
- Consejo Interuniversitario Nacional: https://www.cin.edu.ar
