# mradermacher/OTel-2.0-LLM-31B-IT-GGUF

## Resumen

OTel-2.0-LLM-31B-IT es un modelo de lenguaje de 30.697.345.596 parámetros (aproximadamente 31B) especializado en el dominio de las telecomunicaciones, desarrollado por Red Hat AI en el marco de la iniciativa Open Telco AI, con la participación de organizaciones como GSMA, AT&T, Microsoft, Dell, AMD y Red Hat. El modelo parte de una base tipo Gemma 4 (según el enlace de licencia de la model card) y ha sido post-entrenado mediante OSFT (Orthogonal Subspace Fine-Tuning) para adaptación de dominio y aprendizaje continuo, orientado a tareas de instrucciones, RAG y tool calling en el sector telco.

Este repositorio concreto, publicado por mradermacher, no contiene los pesos originales sino cuantizaciones estáticas en formato GGUF del modelo base `RedHatAI/OTel-2.0-LLM-31B-IT`, lo que permite ejecutar el modelo en hardware de consumo y en entornos de inferencia locales mediante llama.cpp y herramientas compatibles. La relevancia actual radica en la combinación de un modelo de tamaño medio (31B) con especialización vertical en telecomunicaciones y una licencia Apache 2.0 que facilita su adopción comercial, además de soporte declarado para vLLM y capacidades multimodales.

La model card del repositorio es escueta y se centra en los detalles de las cuantizaciones; no incluye información sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base tipo Gemma 4, según license_link); detalles internos no disponibles |
| Parametros totales | 30.697.345.596 (~31B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas, sin imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (license_link apunta a Gemma 4 license) |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer y de la referencia a Gemma 4 en el enlace de licencia. El modelo ha sido post-entrenado con OSFT (Orthogonal Subspace Fine-Tuning), una técnica de ajuste fino que preserva el conocimiento previo del modelo mientras se adapta a un nuevo dominio, en este caso el de las telecomunicaciones. Los tags indican también aprendizaje continuo (continual-learning), adaptación de dominio (domain-adaptation) y ajuste orientado a instrucciones, RAG y tool calling.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Las cuantizaciones de este repositorio son estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no se han publicado variantes con imatrix.

## Capacidades

- Generación de texto conversacional en inglés con formato de instrucciones (instruction-following).
- Soporte de tool calling / function calling, según los tags del modelo.
- Capacidades multimodales declaradas en los tags (multimodal), aunque no se detalla qué modalidades adicionales cubre.
- Orientado a RAG (retrieval-augmented generation) sobre documentación técnica de telecomunicaciones.
- Especialización en dominio telco: terminología, estándares GSMA y contextos de operadores.
- Compatibilidad con vLLM y con el ecosistema transformers para el modelo base.
- Capacidades de agentes y razonamiento multi-paso: no confirmadas explícitamente en la información disponible.

## Casos de uso

- Asistencia técnica a operadores de red: el modelo puede responder consultas sobre configuración, normativa y procedimientos telco apoyándose en su especialización de dominio y en RAG sobre manuales internos.
- Automatización de atención al cliente en telecomunicaciones: gestión de conversaciones multi-turno sobre facturación, planes tarifarios e incidencias, con soporte de tool calling para consultar sistemas internos.
- Generación de documentación técnica: redacción y resumen de especificaciones GSMA, guías de despliegue y procedimientos operativos a partir de fuentes internas.
- Integración en pipelines de soporte de nivel 2: el modelo puede clasificar tickets, extraer entidades (IMSI, APN, celdas) y proponer resoluciones mediante llamadas a herramientas.
- Despliegue en entornos con hardware limitado: gracias a las cuantizaciones GGUF (desde 12,0 GB en Q2_K), puede ejecutarse en estaciones de trabajo o servidores sin GPUs de gran capacidad para prototipos y pruebas.
- Análisis de logs y alarmas de red: uso del modelo para interpretar trazas y correlacionar eventos, con salida estructurada mediante function calling.
- Investigación en adaptación de dominio: el modelo sirve como referencia para estudiar técnicas OSFT y aprendizaje continuo aplicadas a un vertical concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización): Q2_K ~12,0 GB; Q3_K_S ~13,9 GB; Q3_K_M ~15,4 GB; Q3_K_L ~16,7 GB; Q4_K_S ~17,9 GB; Q4_K_M ~18,8 GB; Q5_K_S ~21,4 GB; Q5_K_M ~21,9 GB; Q6_K ~25,3 GB; Q8_0 ~32,7 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se recomienda A100 40 GB, H100 o RTX 6000 Ada (48 GB).
- Cabe en GPU de consumo: sí, en GPUs con 16 GB o más usando cuantizaciones Q2_K a Q3_K_L; con 24 GB se pueden usar Q4_K_M y Q5_K_M con margen para contexto.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), vLLM (para el modelo base en safetensors), transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OTel-2.0-LLM-31B-IT (este) | ~31B | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en telecomunicaciones, tool calling, multimodal |
| Gemma 4 (base referenciada) | No disponible | No disponible | Gemma 4 license | safetensors | Modelo generalista del que deriva la licencia |
| Modelos generalistas de ~30B | ~30B | Variable | Variable | Variable | No se dispone de comparativa cuantitativa por falta de benchmarks publicados |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas telco, RAG o tool calling no puede verificarse a priori.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios técnicos regulados donde una respuesta incorrecta puede tener consecuencias operativas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- El repositorio contiene únicamente cuantizaciones estáticas; no hay variantes imatrix disponibles, lo que puede afectar a la calidad en comparación con cuantizaciones ponderadas.
- La licencia Apache 2.0 del repositorio convive con un license_link a la licencia de Gemma 4; conviene revisar los términos del modelo base antes de un uso comercial.
- El modelo base es de Red Hat AI y este repositorio es una conversión de terceros (mradermacher); no hay garantía de soporte oficial.
- Capacidades multimodales y de contexto largo declaradas en tags pero no documentadas en detalle; verificar antes de depender de ellas.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/OTel-2.0-LLM-31B-IT-GGUF
- Modelo base: https://huggingface.co/RedHatAI/OTel-2.0-LLM-31B-IT
- Página de descargas del cuantizador: https://hf.tst.eu/model#OTel-2.0-LLM-31B-IT-GGUF
- Licencia Gemma 4 referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
