# inclusionAI/Ling-3.0-flash-Sante

## Resumen

Ling-3.0-flash-Sante es un modelo de lenguaje especializado en salud desarrollado por inclusionAI, la iniciativa de IA de código abierto vinculada a Ant Group. Se construye sobre Ling-3.0-flash y conserva su arquitectura híbrida de mezcla de expertos (MoE): 124B parámetros totales declarados en la model card —127.486.405.600 según los pesos safetensors— con 5,1B parámetros activos por token.

El modelo está orientado a razonamiento médico, investigación sanitaria, deep research y flujos de trabajo con herramientas. Entrena y opera con una ventana de 256K tokens, activa el modo de razonamiento por defecto y soporta tool calling a través de frameworks de serving compatibles. Su relevancia actual reside en combinar una arquitectura eficiente (Kimi Delta Attention, gated MLA y capas MoE dispersas) con licencia MIT, algo poco frecuente en modelos sanitarios de esta escala y que facilita el despliegue en infraestructura propia.

Se distribuye explícitamente como modelo de investigación, no como dispositivo médico. La propia model card exige revisión humana cualificada, verificación independiente y cumplimiento normativo para cualquier uso de alto riesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y MoE dispersa: Kimi Delta Attention (KDA), gated MLA y capas MoE (tag `bailing_hybrid`) |
| Parámetros totales | 127.486.405.600 (~127,5B) según safetensors; la model card declara 124B |
| Parámetros activos | 5,1B por token |
| Longitud de contexto | 262.144 tokens (256K), en entrenamiento y en despliegue |
| Tipos de cuantización | No disponible; solo se publican pesos safetensors, sin GGUF, AWQ, GPTQ ni FP8 oficiales |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con `custom_code` (requiere implementación compatible) |
| Tamaño del repositorio | 255,0 GB |
| Pipeline | text-generation |
| Descargas / likes | 5 / 29 (metadatos de Hugging Face) |
| Fechas de publicación | Creado el 2026-10-19; actualizado el 2026-10-22 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina Kimi Delta Attention (KDA), una forma de atención lineal con decaimiento, con gated MLA y capas de mezcla de expertos dispersas. El resultado es un modelo de 124B parámetros declarados que solo activa 5,1B por token, lo que reduce el coste computacional por paso frente a un modelo denso equivalente. La atención lineal y la compresión de caché de MLA están pensadas para sostener contextos largos sin que el coste de KV cache crezca al ritmo de la atención completa. El tag `bailing_hybrid` identifica esta familia de implementaciones.

El entrenamiento se extiende hasta 256K tokens y el ajuste está orientado a tareas sanitarias, razonamiento profundo y uso de herramientas, conservando las capacidades generales del modelo base Ling-3.0-flash. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF, DPO u otras optimizaciones por preferencias. Tampoco se documentan innovaciones de decodificación más allá del soporte de decodificación especulativa NEXTN en SGLang y de MTP en vLLM, que son mecanismos de inferencia y no del entrenamiento.

## Capacidades

- Razonamiento médico y conocimiento sanitario: la model card reporta buen rendimiento en tareas profesionales de salud, razonamiento médico complejo y seguridad clínica.
- Modo de pensamiento activado por defecto mediante la plantilla de chat, desactivable por petición con `{"chat_template_kwargs": {"enable_thinking": false}}`.
- Tool calling y function calling a través de frameworks de serving compatibles (SGLang, vLLM).
- Flujos agénticos de varios pasos y colaboración multiagente; la evaluación incluye un arnés interno capaz de despachar hasta 64 subagentes por tarea.
- Deep research y síntesis de evidencia sobre documentos largos gracias a la ventana de 256K tokens.
- Análisis de documentación clínica extensa: historiales, guías de práctica clínica, literatura científica y resúmenes de ensayos.
- Conserva las capacidades generales de Ling-3.0-flash, por lo que puede emplearse en generación de texto y conversación fuera del dominio sanitario.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Síntesis de evidencia clínica: introducir guías de práctica clínica, revisiones sistemáticas y resúmenes de ensayos en una única ventana de 256K tokens para obtener una síntesis con trazabilidad de las fuentes citadas.
- Investigación profunda con herramientas: encadenar búsquedas, lectura de documentos y verificación de hipótesis en flujos de deep research, un escenario evaluado con BrowseComp y DeepSearchQA en contexto de 256K.
- Seguridad farmacológica: revisión asistida de contraindicaciones e interacciones medicamentosas, el caso que cubre el benchmark AFUMED-Drug de la model card; siempre con validación por un farmacéutico o clínico.
- Documentación clínica y triaje administrativo: resumir notas de consulta, estructurar antecedentes y generar borradores de derivación, manteniendo la decisión final en personal sanitario cualificado.
- Agentes multi-paso para revisión de literatura: orquestar subagentes que consulten bases bibliográficas, extraigan resultados y consoliden una tabla comparativa de estudios.
- Automatización con tool calling en entornos regulados: integración vía API compatible con OpenAI para consultar sistemas internos del hospital con datos previamente anonimizados y registro de auditoría.
- Formación y evaluación médica: generación de preguntas y explicaciones razonadas sobre casos, con el estilo de MedMCQA, para plataformas de estudio dirigidas a profesionales.
- Auditoría de respuestas sanitarias: uso como evaluador de seguridad de otros sistemas, alineado con la métrica AFUSAFE-MedSCE de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una figura con los resultados, pero los valores numéricos no están accesibles en el material proporcionado, por lo que no se reproducen.

| Benchmark | Qué mide | Resultado |
|---|---|---|
| AFUMED-Drug | Seguridad de medicación y precisión en contraindicaciones | No disponible |
| AFUSAFE-MedSCE | Estándar general de seguridad en respuestas sanitarias | No disponible |
| MedMCQA (validación) | Conocimiento médico tipo examen | No disponible |
| BrowseComp | Investigación profunda con navegación y contexto de 256K | No disponible |
| HLE with tools | Razonamiento con herramientas y contexto de 256K | No disponible |
| DeepSearchQA | Búsqueda profunda y síntesis | No disponible |
| Tau3-Banking (`terminal_use`) | Uso de herramientas y agentes | No disponible |

Condiciones de evaluación declaradas: `temperature=1.0` y `top_p=0.95` salvo indicación contraria, esfuerzo de razonamiento en el nivel máximo para todos los modelos comparados, hasta 1.000 turnos en BrowseComp y gestión de contexto con descarte total al 40% de ocupación en el modo monagente.

## Requisitos de hardware

- Pesos en precisión de referencia: el repositorio ocupa 255,0 GB, coherente con ~127,5B parámetros en 16 bits. Solo los pesos ya superan la capacidad de cualquier GPU de consumo.
- Despliegue oficial recomendado: 4 GPUs de clase 141 GB (H200, B200 o nodo Blackwell equivalente) con `--tp 4`, o 8 GPUs de 80 GB (H100/H800) con `--tp 8`.
- VRAM estimada para cuantización de 8 bits: ~128 GB solo en pesos, más caché KV y activaciones; no hay pesos cuantizados oficiales publicados.
- VRAM estimada para cuantización de 4 bits: ~64 GB solo en pesos; requeriría una GPU de 80 GB y contexto reducido, y tampoco existen artefactos oficiales.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) ni configuraciones similares, ni siquiera en 4 bits. El offload a CPU resulta inviable por latencia en un modelo de este tamaño.
- Opciones de despliegue: SGLang con la imagen `lmsysorg/sglang:dev-Ling-3.0-flash`, vLLM con soporte de Ling-3.0 (compilación editable con `VLLM_USE_PRECOMPILED=1`) y endpoint compatible con la API de OpenAI. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Optimizaciones de inferencia: decodificación especulativa NEXTN en SGLang y MTP en vLLM para reducir latencia. La configuración de referencia usa `--mem-fraction-static 0.8`, `--shm-size 32g` y `--context-length 262144`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros (total / activos) | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-flash-Sante | ~127,5B / 5,1B (124B declarados) | 256K | MIT | Salud, deep research, herramientas | Hugging Face, ModelScope, Vercel AI Gateway |
| Ling-3.0-flash | 124B / 5,1B según la model card de Sante | No disponible | No disponible | Generalista; base de Sante | Hugging Face |
| Otras alternativas sanitarias abiertas de escala similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos verificables de parámetros, contexto, licencia o rendimiento de otros modelos sanitarios abiertos comparables, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card lo califica como modelo de investigación y advierte de que las salidas pueden ser incompletas o incorrectas. No sustituye el consejo, diagnóstico o tratamiento profesional.
- Riesgo de alucinación especialmente crítico en dosis, contraindicaciones, interacciones farmacológicas y recomendaciones terapéuticas; cualquier salida debe verificarse contra fuentes primarias.
- Uso de alto riesgo: requiere revisión humana cualificada, verificación independiente y cumplimiento de la normativa aplicable de privacidad, seguridad y sanidad (RGPD, normativa de productos sanitarios, HIPAA en su ámbito).
- Idiomas soportados no declarados; se desconoce el grado de cobertura y calidad fuera de los idiomas mayoritarios del entrenamiento.
- Sesgos conocidos: no documentados en la información disponible. La composición del corpus de entrenamiento tampoco se detalla, lo que dificulta evaluar sesgos demográficos o geográficos.
- La licencia MIT permite uso comercial y modificación, pero no exime de las obligaciones regulatorias del sector sanitario ni de las responsabilidades sobre las decisiones clínicas.
- Dependencia de implementaciones personalizadas: el tag `custom_code` y la necesidad de builds específicos de SGLang o vLLM complican el despliegue estándar.
- Ausencia de cuantizaciones oficiales (GGUF, AWQ, GPTQ, FP8), lo que limita el despliegue en hardware modesto y obliga a cuantizar por cuenta propia con el riesgo de degradación que ello implica.
- Adopción muy temprana: 5 descargas y 29 likes en Hugging Face en el momento de la consulta, con poca validación externa independiente disponible.
- El coste de caché KV a 256K tokens es elevado incluso con gated MLA; conviene limitar la longitud de contexto a la estrictamente necesaria en producción.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.0-flash-Sante
- Modelo base Ling-3.0-flash: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- Vercel AI Gateway: https://vercel.com/ai-gateway/models/ling-3.0-flash-sante
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Ficha en AI Wiki: https://aiwiki.ai/wiki/ling_3_0_flash_sante
- Ficha en Neura Market: https://www.neura.market/models/inclusionai-ling-3-0-flash-sante
- Ficha en Zeplik: https://zeplik.ai/models/ling-3-0-flash-sante
