# outprime/gasztold-0.3B

## Resumen

Gasztold-0.3B es un modelo de lenguaje causal de 294,9 millones de parámetros entrenado desde cero (from scratch) por OutprimeAI Sp. z o.o. para la generación y análisis de texto legal en polaco. A diferencia de los modelos generalistas que se adaptan mediante fine-tuning, este modelo se construyó específicamente sobre un corpus de normativa y lenguaje estatutario polaco, lo que lo convierte en una herramienta de investigación para el procesamiento de lenguaje natural jurídico (legal NLP). Su arquitectura sigue el diseño Llama, con un vocabulario de 50 000 tokens, y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas.

El modelo está pensado para experimentación y prototipado, no para producción legal directa. Sus capacidades declaradas incluyen continuación de texto legal, resumen de fragmentos normativos, análisis de lenguaje estatutario y soporte para asistentes legales con recuperación aumentada (RAG). Con solo 0,3B de parámetros, es ligero y ejecutable en hardware modesto, lo que facilita su integración en entornos de investigación o en pipelines donde el coste computacional es un factor crítico.

Aunque el modelo es reciente (publicado en mayo de 2026) y cuenta con pocas descargas, su enfoque especializado en derecho polaco lo hace relevante para desarrolladores que trabajan con corpus jurídicos de Polonia, especialmente si buscan un modelo base pequeño, transparente y sin dependencias de modelos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (causal LM) |
| Parametros totales | 294 908 928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (original); version GGUF de terceros (mradermacher) |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2,4 GB) |

## Arquitectura y entrenamiento

Gasztold-0.3B adopta la arquitectura Llama, un transformer causal estándar con normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El tamaño de vocabulario es de 50 000 tokens, lo que permite una representación eficiente del lenguaje polaco, caracterizado por su morfología rica y flexión nominal y verbal. El modelo fue entrenado desde cero, sin partir de pesos preentrenados, sobre un corpus de texto legal polaco, incluyendo estatutos, normativas y posiblemente jurisprudencia, aunque el autor no detalla la composición exacta del dataset ni el número de tokens de entrenamiento.

No se menciona el uso de técnicas de alineación como RLHF o DPO. El entrenamiento parece ser de modelado de lenguaje puro (causal LM), sin etapa de instrucción supervisada ni ajuste fino por preferencias humanas. Esto implica que el modelo genera texto continuando el contexto dado, pero no está optimizado para seguir instrucciones complejas ni para mantener diálogos multi-turno de forma natural.

El autor indica que el modelo está diseñado para "experimentación" y "prototipado", lo que sugiere que aún no ha pasado por un proceso de refinamiento orientado a tareas específicas más allá de la generación de lenguaje. La ausencia de detalles sobre hiperparámetros, configuración de entrenamiento o hardware utilizado limita la reproducibilidad, aunque la elección de una arquitectura conocida facilita su implementación en frameworks estándar como Transformers.

## Capacidades

- Generación de texto legal en polaco: puede continuar fragmentos de normativa, redactar cláusulas o completar textos jurídicos con estilo estatutario.
- Resumen de fragmentos legales: mediante prompting, puede condensar pasajes de actos normativos, aunque sin garantías de fidelidad.
- Análisis de lenguaje estatutario: útil para tareas de clasificación, extracción de entidades o detección de estructuras sintácticas propias del lenguaje legal.
- Soporte para recuperación aumentada (RAG): al ser un modelo base de generación, puede integrarse en sistemas que combinen recuperación de documentos legales con generación de respuestas.
- Multilingüismo: limitado al polaco; no se mencionan capacidades en otros idiomas.
- Sin soporte declarado para tool calling, function calling, agentes, vision ni audio. El pipeline es exclusivamente text-generation.

## Casos de uso

- Investigación en PLN jurídico: el modelo sirve como base para estudiar la generación de lenguaje legal polaco, comparar arquitecturas o evaluar técnicas de adaptación a dominios específicos sin depender de modelos cerrados.
- Prototipado de asistentes legales con RAG: se puede combinar con un índice de documentos legales polacos para generar respuestas contextualizadas, útil en entornos de prueba donde la precisión no es crítica.
- Continuación de texto normativo: para generar borradores de cláusulas o completar artículos en proyectos de redacción asistida, siempre con revisión humana posterior.
- Resumen automático de sentencias o estatutos: aunque sin fine-tuning específico, el modelo puede producir resúmenes preliminares que un jurista debe verificar.
- Análisis de corpus legales: para tareas de clasificación de documentos, detección de temas o segmentación de textos normativos, aprovechando su vocabulario especializado.
- Educación y formación: como herramienta didáctica para estudiantes de derecho que quieran experimentar con IA aplicada a textos legales, dado su bajo coste de ejecución.
- Evaluación de modelos pequeños en dominios especializados: sirve como punto de referencia para comparar el rendimiento de modelos de 0,3B frente a alternativas mayores en tareas legales polacas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o tareas específicas de PLN jurídico polaco. Tampoco existen evaluaciones independientes documentadas en los resultados de búsqueda. Se recomienda al usuario realizar sus propias pruebas para validar el rendimiento en sus casos de uso concretos.

## Requisitos de hardware

- Inferencia en CPU: viable para tareas de baja latencia o procesamiento por lotes, dado el tamaño de 0,3B parámetros. Con cuantización (por ejemplo, GGUF Q4_K_M) puede ejecutarse en máquinas con 4-8 GB de RAM.
- Inferencia en GPU: cabe en GPUs de consumo como RTX 3060 (12 GB) o superiores. En fp16, la VRAM estimada es de aproximadamente 0,6 GB para los pesos, más overhead de activaciones, por lo que incluso GPUs con 4 GB podrían ejecutarlo.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; en servidores, una T4 o A10 es suficiente para despliegues concurrentes.
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Generation Inference (TGI), vLLM (si se adapta a la arquitectura Llama), llama.cpp (mediante la versión GGUF de terceros) y Ollama (si se convierte a formato GGUF).
- Latencia y throughput: no se han publicado mediciones oficiales. Como estimación orientativa, en una GPU consumer (RTX 3070) se pueden esperar decenas de tokens por segundo para generación, pero depende del tamaño del prompt y del batch.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo es único en su nicho (0,3B, from scratch, dominio legal polaco). Alternativas genéricas de tamaño similar como GPT-2 (124M) o TinyLlama (1,1B) no son directamente comparables por su dominio y entrenamiento. Se recomienda evaluar el modelo frente a otros modelos polacos pequeños (como los basados en BERT para clasificación) o frente a modelos generalistas con fine-tuning legal, pero no hay métricas públicas disponibles para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no es un asesor legal: el propio autor advierte que no proporciona asesoramiento jurídico y que las salidas pueden ser incompletas, desactualizadas o incorrectas. Cualquier interpretación legal debe ser verificada por un profesional cualificado.
- Riesgo de alucinación: al ser un modelo causal sin alineación por instrucciones, puede generar texto fluido pero factualmente erróneo, especialmente en dominios donde la precisión es crítica.
- Limitaciones de idioma: solo soporta polaco; no se recomienda su uso en otros idiomas.
- Sin contexto documentado: la longitud de contexto no está especificada, lo que dificulta predecir su comportamiento en entradas largas.
- Sin fine-tuning para tareas específicas: el modelo base no está optimizado para resúmenes, extracción de entidades ni diálogo; requerirá ajuste fino para aplicaciones concretas.
- Baja adopción: con solo 13 descargas y 0 likes, la comunidad no ha validado su calidad; se recomienda precaución antes de integrarlo en proyectos críticos.
- Disponibilidad de cuantizaciones: la versión GGUF es de un tercero (mradermacher) y su calidad no está verificada por el autor original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/outprime/gasztold-0.3B
- Perfil de la organización Outprime: https://huggingface.co/outprime
- Página de análisis del modelo GGUF (datos incompletos): https://free2aitools.com/model/mradermacher/gasztold-0.3b-gguf
- Mirror de Hugging Face con filtro de modelos 0.3B: https://d6108366.hf-mirror.com/models?other=0.3b
