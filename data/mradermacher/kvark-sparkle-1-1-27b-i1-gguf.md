# mradermacher/Kvark-Sparkle-1.1-27B-i1-GGUF

## Resumen

Kvark-Sparkle-1.1-27B-i1-GGUF es la versión cuantizada con imatrix del modelo Egzakta/Kvark-Sparkle-1.1-27B, un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a razonamiento eficiente, RAG agéntico y question answering sobre documentos. La cuantización la firma mradermacher, un publicador habitual de GGUF en Hugging Face, y se distribuye en el repositorio con licencia Apache 2.0. El modelo base está etiquetado internamente con la referencia "qwen3.8", lo que sugiere una arquitectura derivada de la familia Qwen, aunque esta ficha no puede confirmar detalles de diseño que no aparecen en la información disponible.

El interés de esta publicación es doble. Por un lado, ofrece el modelo en formatos GGUF de 11,0 GB (i1-Q2_K) a 22,5 GB (i1-Q6_K), lo que permite ejecutarlo en hardware de consumo con cuantizaciones de 4 bits de unos 16-17 GB. Por otro, la model card declara capacidades específicas de razonamiento agéntico y de recuperación documental, con soporte de inglés y serbio como idiomas, y menciona "mtp" (multi-token prediction) entre sus etiquetas.

La relevancia actual radica en que combina un tamaño de 27B —que suele requerir GPU de 24 GB o más en cuantizaciones medias— con un conjunto de cuantizaciones estáticas e imatrix que cubren desde 11 GB hasta 22,5 GB. No se han publicado en la información disponible resultados de benchmarks, longitud de contexto ni detalles del dataset de entrenamiento, por lo que las secciones correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta interna "qwen3.8"; probable familia transformer derivada de Qwen, sin confirmar) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); estáticos en el repo hermano Kvark-Sparkle-1.1-27B-GGUF |
| Idiomas soportados | en (inglés), sr (serbio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix y estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base Egzakta/Kvark-Sparkle-1.1-27B: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de capas, cabezas de atención o dimensión oculta. La etiqueta "qwen3.8" en la model card sugiere una base de la familia Qwen, y la etiqueta "mtp" apunta a multi-token prediction como técnica de decodificación, pero ninguno de estos extremos se confirma con documentación técnica en la información disponible.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o similares. Lo que sí consta es el proceso de cuantización: mradermacher ha generado cuantizaciones i1 (imatrix) a partir de la matriz de importancia incluida en el repositorio (Kvark-Sparkle-1.1-27B.imatrix.gguf, 0,1 GB) y ofrece además cuantizaciones estáticas en un repositorio separado. La model card indica que se trata de un modelo de visión y que los ficheros mmproj, si existen, se alojan en el repositorio estático, aunque no se confirma que esta variante incluya proyección multimodal.

## Capacidades

- Generación de texto conversacional y razonamiento, con etiquetas explícitas de "reasoning" y "efficient-reasoning" en la model card.
- RAG agéntico (agentic-rag): el modelo está etiquetado para su uso en pipelines de recuperación aumentada con agentes.
- Question answering sobre documentos (document-qa).
- Soporte declarado de tool calling / function calling: no se detalla explícitamente en la información disponible, pero las etiquetas de agentic-rag y endpoints_compatible apuntan a integración con APIs compatibles.
- Capacidades multilingües limitadas a inglés y serbio según el campo `language` de la model card.
- Posible capacidad de visión: la model card indica "This is a vision model", aunque los ficheros mmproj no se incluyen en este repositorio.
- Modo de razonamiento eficiente ("efficient-reasoning") y posible decodificación con multi-token prediction ("mtp"), sin documentación adicional.

## Casos de uso

- RAG agéntico sobre corpus documentales: el modelo está etiquetado específicamente para agentic-rag, por lo que encaja en pipelines donde un agente formula consultas, recupera fragmentos y sintetiza respuestas con trazabilidad de fuentes.
- Question answering sobre documentación técnica interna: con cuantización i1-Q4_K_M (16,9 GB) puede desplegarse en una única GPU de 24 GB para responder preguntas sobre manuales, contratos o bases de conocimiento.
- Asistente conversacional multilingüe inglés-serbio: útil para organizaciones que operan en los Balcanes y necesitan un modelo que cubra ambos idiomas con licencia Apache 2.0.
- Generación de código y razonamiento paso a paso: aunque no hay benchmarks publicados, las etiquetas de reasoning permiten su uso en tareas de análisis y explicación de código, con verificación humana obligatoria.
- Despliegue en hardware de consumo: la cuantización i1-IQ3_M (12,9 GB) o i1-Q4_K_S (15,9 GB) permite ejecución local en GPUs de 16-24 GB mediante llama.cpp u Ollama, útil para prototipado y entornos con requisitos de privacidad.
- Extracción estructurada de información de documentos largos: adecuado para pipelines de procesamiento por lotes donde se prioriza coste por token bajo frente a latencia interactiva.
- Evaluación comparativa de cuantizaciones: el repositorio incluye la matriz de importancia y varias familias de cuantización, lo que permite medir la degradación de calidad entre i1-Q2_K y i1-Q6_K en un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): 11,0 GB (i1-Q2_K), 12,4-12,9 GB (i1-Q3_K_S a i1-IQ3_M), 13,6-14,7 GB (i1-Q3_K_M a i1-Q3_K_L), 15,4-17,4 GB (i1-IQ4_XS a i1-Q4_1), 19,1-19,6 GB (i1-Q5_K_S y i1-Q5_K_M), 22,5 GB (i1-Q6_K).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para las cuantizaciones más altas con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para i1-Q4_K_M e i1-Q5_K_M con margen ajustado; RTX 4080 (16 GB) para i1-IQ3_M o i1-Q4_K_S.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantizaciones de 4-5 bits; en RTX 4080/4070 Ti Super (16 GB) con cuantizaciones de 3-4 bits; en GPUs de 12 GB solo con i1-Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI (la etiqueta endpoints_compatible lo indica). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda verificar compatibilidad antes de producción.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kvark-Sparkle-1.1-27B (i1-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Hugging Face (este repo) |
| Kvark-Sparkle-1.1-27B (estático GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Hugging Face (repo hermano de mradermacher) |
| Egzakta/Kvark-Sparkle-1.1-27B (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Hugging Face |

No se dispone de información sobre modelos comparables de otros autores (por ejemplo, Qwen2.5-32B, Gemma-2-27B o Mistral-Small) en los datos proporcionados, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad real del modelo en razonamiento, código o QA documental no puede verificarse con datos objetivos.
- Idiomas limitados: solo inglés y serbio declarados; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en documentos largos ni en conversaciones multi-turno extensas.
- Riesgo de alucinación: como cualquier LLM de 27B sin datos de evaluación publicados, puede generar contenido plausible pero falso, especialmente en QA documental.
- La model card indica que es un modelo de visión, pero los ficheros mmproj no están en este repositorio; si se necesita multimodalidad, hay que acudir al repositorio estático y verificar su disponibilidad.
- Las cuantizaciones de 2-3 bits (i1-Q2_K, i1-IQ3_S) degradan la calidad de forma notable; para producción se recomienda i1-Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es de un autor tercero (Egzakta) y conviene revisar su model card original por si añade restricciones adicionales.
- El repositorio ocupa 218,6 GB en total; la descarga selectiva de una sola cuantización es posible, pero requiere conocer el nombre exacto del fichero.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineación, lo que dificulta evaluar riesgos de contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Kvark-Sparkle-1.1-27B-i1-GGUF
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Kvark-Sparkle-1.1-27B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Kvark-Sparkle-1.1-27B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
