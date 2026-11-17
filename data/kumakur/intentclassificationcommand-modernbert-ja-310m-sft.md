# kumakur/intentclassificationcommand-modernbert-ja-310m-sft

## Resumen

El modelo `kumakur/intentclassificationcommand-modernbert-ja-310m-sft` es un checkpoint de la familia ModernBERT publicado en Hugging Face por el usuario kumakur. Por el identificador se deduce que se trata de un modelo de clasificación de intenciones (intent classification) orientado a comandos en japonés (`ja`), construido sobre una base ModernBERT de aproximadamente 310 millones de parámetros y sometido a un ajuste supervisado (SFT). El repositorio contiene pesos en formato safetensors con un total real de 315.298.685 parámetros y un tamaño aproximado de 1,3 GB.

La relevancia de este checkpoint radica en su especialización: frente a los modelos generativos de propósito general, un encoder afinado para clasificación de intenciones ofrece latencia baja, coste de inferencia reducido y una salida determinista sobre un conjunto cerrado de etiquetas, lo que encaja en pipelines de asistentes conversacionales, enrutadores de comandos por voz o sistemas de atención al cliente en japonés. ModernBERT aporta además una ventana de contexto larga y atención con RoPE, lo que permite procesar utterances completas o historiales cortos sin truncamiento agresivo.

No obstante, la información pública es muy escasa: la model card está autogenerada y no documenta datos de entrenamiento, hiperparámetros, conjunto de etiquetas, métricas de evaluación ni licencia. Cualquier evaluación en producción debe partir de una validación propia sobre el dominio objetivo antes de asumir un comportamiento concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional con RoPE y flash attention, según la familia indicada en el nombre) |
| Parametros totales | 315.298.685 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT soporta hasta 8192 tokens en su configuración canónica; el valor efectivo de este checkpoint no está documentado) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantización posterior vía herramientas estándar, sin receta oficial) |
| Idiomas soportados | japonés (deducido del sufijo `-ja` del identificador; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del repositorio indica una base ModernBERT de 310M parámetros, una arquitectura encoder publicada por Answer.AI, LightOn y colaboradores que moderniza el diseño BERT clásico con rotary position embeddings (RoPE), atención local intercalada con atención global, flash attention y un contexto extendido. Al ser un encoder bidireccional, no genera texto libre: produce representaciones contextuales que se alimentan a una cabeza de clasificación. El tamaño de 315.298.685 parámetros es coherente con un ModernBERT base más una cabeza de clasificación lineal sobre la dimensión oculta.

El sufijo `-sft` sugiere un ajuste supervisado sobre un conjunto etiquetado de comandos e intenciones en japonés, presumiblemente con pérdida de entropía cruzada sobre clases discretas. Sin embargo, no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el conjunto de etiquetas, la proporción de datos sintéticos ni si hubo etapas adicionales de preferencia (DPO/RLHF), que en un encoder de clasificación no serían el procedimiento habitual. Tampoco se documentan hiperparámetros, precisión mixta empleada ni hardware de entrenamiento.

## Capacidades

- Clasificación de intenciones sobre texto en japonés: el modelo está orientado a mapear una utterance de entrada a una etiqueta de comando o intención predefinida.
- Codificación contextual bidireccional: al ser un encoder, genera embeddings útiles para similitud semántica, clustering o recuperación, además de la tarea de clasificación para la que fue afinado.
- Procesamiento de secuencias largas: la familia ModernBERT admite contextos de hasta 8192 tokens, lo que permitiría clasificar conversaciones multi-turno o documentos breves, aunque el comportamiento real de este checkpoint en secuencias largas no está verificado.
- Inferencia de baja latencia: al no ser un modelo generativo, el coste por petición es una pasada forward, adecuado para entornos de alto QPS.
- Tool calling / function calling: no disponible como capacidad nativa; el modelo no genera llamadas estructuradas, solo etiquetas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no confirmadas; el identificador apunta exclusivamente a japonés.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Enrutado de comandos en asistentes de voz en japonés: el modelo recibe la transcripción del usuario y devuelve la intención (por ejemplo, "pon música", "consulta el tiempo"), permitiendo despachar a la skill correspondiente con una latencia de milisegundos por petición.
- Clasificación de tickets de soporte: integrado en un sistema de helpdesk, permite etiquetar automáticamente consultas entrantes en japonés por categoría (facturación, incidencias técnicas, cancelaciones) antes de asignarlas a un agente humano.
- Preprocesado en pipelines RAG: usar el encoder para clasificar la intención de la consulta y seleccionar la base de conocimiento o el índice vectorial adecuado antes de invocar un LLM generativo, reduciendo coste y alucinaciones.
- Moderación y triaje de mensajes: detección de intenciones sensibles (quejas, solicitudes de cancelación, lenguaje abusivo) en chats de atención al cliente en japonés, con umbrales de confianza configurables.
- Automatización de formularios conversacionales: clasificar la respuesta libre del usuario en un campo de formulario (tipo de producto, motivo de contacto) para poblar estructuras de datos sin intervención manual.
- Análisis de intención en logs de interacción: procesar por lotes grandes volúmenes de transcripciones para construir métricas de producto sobre qué comandos se usan más y cuáles fallan, alimentando decisiones de diseño de la interfaz de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo de pesos, más activaciones; en la práctica, entre 2 y 3 GB para batches pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,7 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en int8: aproximadamente 0,35 GB de pesos, viable incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 con batch moderado; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son válidas. Para alto throughput, L4 o A10 ofrecen buena relación coste/petición.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más; también en CPU para cargas moderadas.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, Text Embeddings Inference (TEI) para servir encoders, ONNX Runtime o TorchScript para optimización, y FastAPI o Triton como capa de servicio. vLLM y llama.cpp no son la vía natural para un encoder de clasificación.
- Latencia y throughput estimados: no disponibles de forma oficial; para un encoder de 310M en una L4 se espera un throughput del orden de cientos a miles de peticiones por segundo con secuencias cortas, pero debe medirse en el entorno objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kumakur/intentclassificationcommand-modernbert-ja-310m-sft | 315 M | no disponible | Clasificación de intenciones en japonés | no disponible | Hugging Face |
| ModernBERT-base (Answer.AI / LightOn) | ~149 M | 8192 tokens | Encoder generalista | Apache 2.0 | Hugging Face |
| BERT-base-japanese (Tohoku University) | ~110 M | 512 tokens | Encoder japonés generalista | Apache 2.0 | Hugging Face |
| DeBERTa-v3-base | ~184 M | 512 tokens | Encoder generalista | MIT | Hugging Face |

La comparación es aproximada: los tres alternativos son bases generalistas que requerirían un ajuste específico para clasificación de intenciones en japonés, mientras que este checkpoint ya incluye una cabeza afinada, a costa de una licencia y una documentación no verificadas.

## Limitaciones y advertencias

- La model card está autogenerada y no documenta el conjunto de etiquetas, los datos de entrenamiento ni las métricas, por lo que no es posible reproducir ni auditar el ajuste.
- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar los términos antes de desplegar en producción.
- El modelo está orientado a japonés; su comportamiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de sobreajuste al dominio de comandos del dataset de entrenamiento: utterances fuera de distribución pueden clasificarse con alta confianza en etiquetas incorrectas.
- Al ser un clasificador, no genera explicaciones ni texto; la trazabilidad de sus decisiones requiere técnicas externas (SHAP, atención, calibración).
- No hay información sobre sesgos demográficos o lingüísticos; en un dominio de voz y atención al cliente, conviene auditar el rendimiento por subgrupos.
- Solo 7 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente nulo, sin reportes de terceros que confirmen su calidad.
- No se dispone de información sobre calibración de probabilidades; los umbrales de decisión deben ajustarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/kumakur/intentclassificationcommand-modernbert-ja-310m-sft
- Paper de ModernBERT (referencia de la familia): https://arxiv.org/abs/2412.13663
- Repositorio oficial de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Paper citado en los tags (ML Impact calculator, Lacoste et al.): https://arxiv.org/abs/1910.09700
