# orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF

## Resumen

OrcaSAQ-2-Cyber-27B-Uncensored-GGUF es una cuantización de precisión mixta del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el propio autor orcarouter. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y derivados, e incorpora una estrategia de cuantización denominada SAQ-2 (mixed-precision) con calibración mediante imatrix. El modelo base parte de la familia Qwen3.8 (también etiquetada como qwen3_5 en los tags) y ha sido sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo, de ahí la etiqueta uncensored.

Con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones) y un repositorio de 15,7 GB, se posiciona en la franja de modelos densos de gran tamaño aptos para despliegue en una sola GPU de 80 GB o en configuraciones multi-GPU consumer. Los tags declaran soporte de razonamiento, function calling, contexto largo y una variante de decodificación denominada dflash2, además de compatibilidad con endpoints.

Su relevancia actual radica en la combinación de tres factores poco habituales: cuantización mixta optimizada por capas, eliminación de restricciones de contenido y soporte declarado de tool calling y razonamiento multi-paso, lo que lo hace atractivo para entornos de investigación que requieren modelos sin filtros y para pipelines de agentes que necesitan contexto extendido. El acceso es restringido (gated) y requiere aceptar las condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8 / qwen3_5); detalles de capas y atención no disponibles |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el tag long-context confirma soporte extendido, sin cifra publicada) |
| Tipos de cuantizacion | GGUF con esquema mixto SAQ-2 (mixed-precision) calibrado con imatrix; niveles concretos (Q4_K_M, Q5_K_M, etc.) no disponibles |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exclusivamente; no se distribuyen safetensors en este repo) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint orcarouter/Qwen3.8-27B-Uncensored, que a su vez deriva de la familia Qwen3.8 de Alibaba. La arquitectura subyacente es un transformer denso de 27,3 mil millones de parámetros; no se dispone de información detallada sobre número de capas, dimensión oculta, configuración de atención (GQA/MHA) ni tipo de positional encoding en la información proporcionada.

El proceso de entrenamiento del modelo base incluye un paso de abliteration, técnica que identifica y neutraliza las direcciones de activación asociadas a la negativa a responder, dando lugar a la variante "Uncensored". Sobre el checkpoint resultante, orcarouter aplicó una cuantización de precisión mixta SAQ-2 con calibración imatrix, que asigna distintos bits por capa o tensor según su sensibilidad, preservando mayor precisión en las capas críticas. Los tags mencionan "dflash2", presumiblemente una variante de decodificación especulativa o acelerada, aunque no se documenta su funcionamiento. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito (tag reasoning), con soporte de modo de pensamiento.
- Function calling / tool calling, según los tags del repositorio.
- Razonamiento multi-paso orientado a agentes.
- Contexto largo (tag long-context), adecuado para documentos extensos y conversaciones prolongadas.
- Respuestas sin filtros de contenido (abliterated/uncensored): no aplica rechazo por políticas de seguridad del modelo base.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue tras APIs compatibles con OpenAI.
- Inferencia vía llama.cpp y ecosistema GGUF.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar comportamientos sin filtros, generar conjuntos de datos de red teaming y analizar cómo la abliteration afecta a la calidad y coherencia de las respuestas en comparación con el modelo original.
- Agentes autónomos con tool calling: gracias al soporte declarado de function calling y razonamiento multi-paso, puede integrarse en bucles de agente que consultan APIs, ejecutan código o recuperan información de bases de datos, con el contexto largo como ventaja para mantener el estado de la conversación.
- Análisis de documentos extensos en inglés y chino: el tag long-context permite procesar contratos, informes técnicos o expedientes completos en una sola pasada, resumiendo y extrayendo entidades sin fragmentación.
- Asistencia a la escritura creativa sin restricciones: útil para guionistas e investigadores que necesitan explorar narrativas que los modelos alineados rechazan, en un entorno controlado y con revisión humana.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU consumer de gama alta, sin depender de servicios en la nube ni de conectividad.
- Generación de código y explicaciones técnicas: el modelo base Qwen tiene buen desempeño en código; esta variante puede emplearse en asistentes de programación internos donde se requiera ausencia de filtros en las respuestas.
- Evaluación comparativa de cuantizaciones: el esquema SAQ-2 con imatrix permite a investigadores medir la degradación de precisión frente al modelo en fp16/bf16 en tareas de razonamiento y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,3 B parámetros, en Q4 aproximadamente 15-16 GB, en Q5 en torno a 19-20 GB, en Q8 cerca de 29 GB y en fp16 unos 55 GB. Los niveles exactos del esquema SAQ-2 no están publicados.
- GPU recomendadas: A100 80 GB o H100 para fp16 sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para Q8; RTX 4090 (24 GB) para Q4/Q5 con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y RTX 4080 (16 GB) con cuantizaciones Q4 y contexto reducido; en GPUs de 12 GB solo con cuantizaciones agresivas y contexto muy limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI que acepten GGUF.
- Latencia y throughput: no disponibles; dependerán de la cuantización, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OrcaSAQ-2-Cyber-27B-Uncensored-GGUF | 27,3 B | No disponible (long-context) | Apache 2.0 | GGUF | Abliterated, cuantización mixta SAQ-2, tool calling |
| Qwen3.8-27B-Uncensored (base) | 27,3 B | No disponible | Apache 2.0 | Safetensors | Checkpoint original sin cuantizar |
| Qwen3 (modelos densos de la familia) | Variable (hasta ~32 B) | Hasta 128K en algunas variantes | Apache 2.0 | Safetensors, GGUF | Alineados, con filtros de seguridad |
| Llama 3.x 27-32B (referencia de categoría) | 27-32 B | 128K en variantes recientes | Llama Community License | Safetensors, GGUF | Ecosistema amplio, licencia no Apache |

## Limitaciones y advertencias

- El proceso de abliteration puede degradar la coherencia, la precisión factual y la capacidad de seguir instrucciones complejas; conviene validar el modelo en la tarea concreta antes de usarlo en producción.
- Riesgo elevado de alucinación, especialmente en dominios especializados y con contexto largo; no se han publicado evaluaciones de fidelidad.
- Ausencia de filtros de seguridad: puede generar contenido dañino, ilegal o sesgado; el despliegue exige moderación externa y revisión humana.
- Sesgos heredados del corpus de entrenamiento de Qwen, con posible infrarrepresentación de culturas distintas de la china y la anglosajona.
- Soporte limitado a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Licencia Apache 2.0 permite uso comercial, pero el acceso al repositorio es restringido (gated) y requiere aceptar condiciones en Hugging Face.
- No se dispone de información sobre la longitud exacta de contexto soportada ni sobre el impacto de la cuantización mixta en tareas de razonamiento largo.
- La etiqueta "Cyber" en el nombre sugiere un enfoque hacia seguridad ofensiva o análisis de ciberseguridad, pero no se documenta qué ajuste específico se aplicó; no debe asumirse una especialización real sin verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Familia Qwen (referencia): https://huggingface.co/Qwen
- Paper de abliteration (referencia metodológica): no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
