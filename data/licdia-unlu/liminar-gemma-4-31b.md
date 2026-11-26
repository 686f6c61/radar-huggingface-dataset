# LICDIA-UNLu/Liminar-Gemma-4-31B

## Resumen

Liminar-Gemma-4-31B es un ajuste fino (finetune) del modelo multimodal Gemma 4 31B IT de Google, desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján (Argentina). El modelo está especializado en normativa universitaria argentina, instituciones académicas, vida universitaria y español formal de la Argentina, y forma parte de la familia Liminar, una iniciativa de modelos abiertos del sistema universitario argentino.

El modelo parte de una arquitectura transformer multimodal (image-text-to-text) de 31.273.088.876 parámetros y se distribuye bajo licencia Apache 2.0, la misma del modelo base. Se ofrece tanto en formato safetensors para transformers como en cuantizaciones GGUF (Q8_0 y Q4_K_M) para su uso con llama.cpp, Ollama o LM Studio, incluso sin GPU.

Su relevancia radica en dos aspectos: por un lado, adapta un modelo generalista a un dominio muy específico (normativa y vida universitaria argentina) con una mejora sustancial en la recuperación de conocimiento normativo sin documentos (del 13,3 % al 44,7 % de respuestas correctas frente al modelo base); por otro, publica la receta completa de entrenamiento y evaluación, lo que permite a otras instituciones replicar o extender el trabajo con sus propios actos internos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 31B IT |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales), Q8_0 (8 bits), Q4_K_M (4 bits) |
| Idiomas soportados | es (español, con foco en español formal de Argentina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma 4 31B IT, un transformer multimodal con capacidad de entrada de imagen y texto. El ajuste se realizó mediante un LoRA de rango 256 aplicado sobre las capas lineales, posteriormente fusionado con el modelo base. El entrenamiento se ejecutó con FSDP en un nodo de la supercomputadora Clementina XXI (8 tiles de GPU Intel Data Center Max 1550), con un coste de 268 horas de GPU (horas de tile). Se realizó una época de preguntas y respuestas y cuatro épocas con todos los datos.

Los datos de entrenamiento combinan normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0) curada manualmente, textos públicos sobre vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con su permiso). A partir de ese corpus se generaron datos sintéticos con el documento a la vista: fragmentos con su ficha, versiones reescritas, preguntas y respuestas, ejemplos de abstención, identidad, respuestas del propio modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento las escribió Qwen 3.5 27B, por lo que el modelo aprende en parte su estilo.

## Capacidades

- Generación de texto conversacional en español formal de Argentina.
- Entrada multimodal image-text-to-text (heredada del modelo base Gemma 4 31B IT).
- Conocimiento especializado de normativa universitaria argentina (Infoleg, CIN, CONICET).
- Comprensión de la vida académica y las instituciones universitarias argentinas.
- Capacidad de abstención ante preguntas fuera de su dominio o sin información suficiente.
- Consulta asistida con documentos (RAG) sobre fuentes actualizadas.
- Razonamiento desactivado por defecto en la plantilla de chat de los GGUF, coherente con el entrenamiento.
- Compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistencia a estudiantes y personal sobre normativa universitaria: el modelo responde preguntas sobre la Ley de Educación Superior, estatutos y reglamentos con un conocimiento específico del dominio, útil en oficinas de alumnado y secretarías académicas.
- Consulta del digesto universitario con RAG: integrado con un sistema de recuperación sobre documentos actualizados, el modelo responde consultas con alta fidelidad (4,99/5 en la evaluación con documentos), adecuado para portales de transparencia institucional.
- Atención al público en universidades: gestión de conversaciones multi-turno sobre trámites, becas y vida académica en español rioplatense formal.
- Apoyo a la redacción administrativa: generación de borradores de comunicaciones, resoluciones y respuestas formales adaptadas al registro del español argentino.
- Formación y divulgación: explicación de conceptos normativos y académicos a partir de fragmentos documentales, útil en materiales de capacitación interna.
- Despliegue en entornos sin GPU: las versiones GGUF Q4_K_M (18,7 GB) permiten ejecución en portátiles y equipos de escritorio con llama.cpp u Ollama, facilitando su adopción en instituciones con recursos limitados.
- Investigación y replicación: la receta publicada permite a otras universidades añadir sus actos internos y adaptar el modelo a su propia normativa.

## Benchmarks y rendimiento

| Evaluación | Modelo base | Liminar | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 13,3 % | 44,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,73 | 1,29 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,94 | 4,99 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

Las respuestas abiertas fueron calificadas por Llama 3.3 70B, ajeno a las familias evaluadas. El benchmark de normativa mide la recuperación de conocimiento sin documentos; la consulta con documentos usa fragmentos de un sistema de recuperación real y la rúbrica empleada en la evaluación humana del asistente de consulta del digesto de la UNLu (utilidad, fidelidad, completitud y claridad). Las versiones cuantizadas no se evaluaron por separado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y caché KV (no disponible el dato exacto).
- GGUF Q8_0: 32,6 GB de peso, requiere en torno a 34-40 GB de VRAM o RAM para ejecución cómoda.
- GGUF Q4_K_M: 18,7 GB de peso, viable en GPUs consumer de 24 GB (RTX 3090, RTX 4090) o en CPU con suficiente RAM.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o múltiples GPUs de 40-48 GB (A6000, L40S) con sharding.
- Cabe en GPU consumer: sí, en formato Q4_K_M en RTX 3090/4090 (24 GB); en Q8_0 requiere 48 GB o más.
- Opciones de despliegue: transformers 5 o posterior (safetensors), llama.cpp, Ollama, LM Studio (GGUF). No se mencionan vLLM ni TGI en la documentación disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Gemma-4-31B | 31,3 B | no disponible | Normativa universitaria argentina, español rioplatense | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| google/gemma-4-31B-it | 31,3 B | no disponible | Generalista multimodal | Gemma (uso permitido con condiciones) | Hugging Face |
| gpt-4.1-mini | no disponible | no disponible | Generalista propietario | Propietaria | API de OpenAI |

Frente al modelo base, Liminar mejora notablemente el conocimiento normativo sin documentos (44,7 % frente a 13,3 %) y mantiene el rendimiento en consulta con documentos. Frente a gpt-4.1-mini, Liminar supera ampliamente en conocimiento normativo sin documentos (44,7 % frente a 14,3 %) y queda prácticamente igual en consulta con documentos (4,99 frente a 4,98). No se dispone de comparativas con otros modelos especializados en normativa argentina.

## Limitaciones y advertencias

- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas normativas conviene usarlo con RAG sobre fuentes actualizadas.
- Puede equivocar números de normas, fechas y montos.
- No conoce los actos internos de cada universidad; esa capa debe añadirse con la receta publicada.
- El modelo aprende en parte el estilo de Qwen 3.5 27B, que generó las respuestas de entrenamiento, lo que puede introducir sesgos estilísticos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en preguntas fuera del dominio normativo.
- Idiomas soportados limitados al español; no se documenta rendimiento en otras lenguas.
- La evaluación de las versiones cuantizadas no se realizó por separado; su comportamiento puede diferir del bf16.
- Aunque la licencia es Apache 2.0, el modelo base Gemma 4 31B IT tiene sus propias condiciones de uso que conviene revisar antes de un despliegue comercial.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio LICDIA: https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
