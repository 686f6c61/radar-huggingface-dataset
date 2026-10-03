# allenai/AstaBrief_8B_SFT

## Resumen

AstaBrief_8B_SFT es un checkpoint intermedio de ajuste supervisado (SFT) del modelo AstaBrief-8B, desarrollado por el Allen Institute for AI (Ai2, organización responsable del repositorio allenai en HuggingFace). El modelo transforma una pregunta de investigación junto con extractos de literatura científica recuperada en un informe con citas, es decir, resuelve la fase final de generación de un pipeline de "deep research" sobre corpus académicos. Se inicializa desde Qwen/Qwen3-8B y se ajusta sobre el dataset allenai/AstaBrief_SFT_Mix, compuesto por consultas reales de usuarios emparejadas con informes producidos por el pipeline multi-paso Asta ScholarQA.

Arquitectónicamente hereda la familia Qwen3 en su variante densa de 8B, con licencia Apache 2.0, y se entrenó con una longitud máxima de secuencia de 32.768 tokens en BF16 sobre 8 GPU H100. La relevancia actual reside en que es un modelo de 8B parámetros, abierto y desplegable en infraestructura propia, especializado en una tarea donde los modelos generalistas suelen fallar: mantener precisión y recall de citas sobre material recuperado. Según la model card, el SFT eleva la media de 77,3 a 83,7 en el conjunto ScholarQA-CS2, con una mejora especialmente marcada en precisión de citas (76,2 a 87,7).

Se trata, no obstante, de un checkpoint intermedio: la versión final del proyecto es allenai/AstaBrief_8B, entrenada adicionalmente con DPO. Este checkpoint está pensado para su uso con un formato de prompt específico publicado por Ai2, y su comportamiento se degrada si se emplea con un formato de interacción distinto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada del modelo base Qwen/Qwen3-8B |
| Parametros totales | 8B (aproximadamente 8.000 millones, heredados de Qwen3-8B; la model card no detalla la cifra exacta) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens de secuencia máxima durante el SFT; la ventana nativa del modelo base no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | No disponible: no se publican cuantizaciones oficiales (GGUF, GPTQ, AWQ, FP8) en la informacion proporcionada. El repositorio ocupa 106,5 GB |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch / safetensors (etiqueta pytorch), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only denso de 8B parámetros. No se introduce ningún cambio arquitectónico respecto al modelo base: el trabajo se limita al ajuste supervisado sobre datos de la tarea. La model card no desglosa detalles internos (número de capas, cabezas de atención, tipo de normalización o estrategia de atención) más allá de la referencia a Qwen3-8B.

El entrenamiento se realizó con la herramienta open-instruct de Ai2 sobre 8 GPU H100, con los siguientes hiperparámetros: 5 épocas, learning rate 5e-06 con scheduler lineal y warmup ratio 0,03, batch size por dispositivo de 1 con 4 pasos de acumulación de gradiente, longitud máxima de secuencia de 32.768 tokens y precisión BF16. El dataset AstaBrief_SFT_Mix combina consultas reales de usuarios con informes generados por el pipeline Asta ScholarQA, usando como modelos de respaldo Claude 3.5 Sonnet, Claude 3.7 Sonnet, o3, o4-mini y GPT-4.1; se trata, por tanto, de un proceso de destilación de salidas de modelos propietarios hacia un modelo abierto. No se menciona en la información disponible el uso de RLHF, DPO ni otras fases de alineación en este checkpoint concreto; la fase DPO corresponde al checkpoint final AstaBrief_8B.

## Capacidades

- Generación de informes científicos con citas: produce texto a partir de una consulta y extractos de literatura recuperada, manteniendo referencias a las secciones o ingredientes proporcionados.
- Razonamiento sobre literatura científica: sintetiza y contrasta información de múltiples extractos para construir una respuesta estructurada.
- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo incluye la etiqueta conversational.
- Modo de prompt específico: la model card recomienda explícitamente usar el prompt SFT publicado por Ai2 con la consulta y las referencias por secciones.
- Integración con tool calling / function calling: no disponible en la información proporcionada; el modelo se presenta como componente de un pipeline externo de recuperación, no como agente autónomo.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponible en la información proporcionada; la recuperación de literatura la realiza el pipeline Asta ScholarQA, no este checkpoint.
- Multilingüismo: limitado a inglés según la model card.
- Capacidades especiales: no se documentan modos de pensamiento explícito, visión ni audio.

## Casos de uso

- Generación de informes de investigación citados: el modelo recibe una pregunta de investigación y un conjunto de extractos recuperados, y devuelve un informe con citas. Es su tarea de entrenamiento directa y donde muestra mejores métricas (precisión de citas 87,7 en ScholarQA-CS2).
- RAG privado sobre literatura corporativa: al ser un modelo de 8B con licencia Apache 2.0, puede desplegarse con vLLM en infraestructura propia para procesar documentación científica que no puede salir de la organización, evitando llamadas a APIs de terceros.
- Aceleración de revisiones sistemáticas: investigadores que necesitan cribar y sintetizar decenas de artículos pueden usar el modelo para generar borradores de síntesis con trazabilidad de citas, que después verifican manualmente.
- Redacción asistida de secciones de trabajos relacionados: dado un conjunto de referencias seleccionadas por el autor, el modelo produce un borrador con las citas ya insertadas, reduciendo el trabajo mecánico previo a la revisión humana.
- Vigilancia tecnológica y análisis de estado del arte: equipos de I+D pueden alimentar el modelo con abstracts recientes de un área concreta para obtener informes periódicos del estado de la cuestión.
- Evaluación y benchmarking reproducible de sistemas de deep research: al tratarse de un checkpoint abierto de 8B, sirve como componente local y auditable en experimentos académicos, sin depender de modelos propietarios.
- Periodismo científico y divulgación técnica: convertir un conjunto de extractos técnicos en un texto divulgativo con fuentes explícitas, siempre con revisión editorial posterior.
- Enriquecimiento de pipelines RAG existentes: sustituir la etapa de generación de un sistema RAG documental por este modelo cuando el requisito principal es la fidelidad de las citas y no la creatividad del texto.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden al conjunto de test ScholarQA-CS2, formado por 100 preguntas de investigación en informática escritas por usuarios. La comparación es contra el modelo base Qwen3-8B.

| Modelo | Media | Ingredient recall | Answer precision | Citation precision | Citation recall |
|---|---:|---:|---:|---:|---:|
| Qwen3-8B | 77,3 | 77,8 | 90,6 | 76,2 | 64,6 |
| AstaBrief-8B-SFT | 83,7 | 85,2 | 90,4 | 87,7 | 71,3 |

El ajuste supervisado mejora la media en 6,4 puntos, el recall de ingredientes en 7,4, la precisión de citas en 11,5 y el recall de citas en 6,7; la precisión de respuesta se mantiene prácticamente igual (descenso de 0,2 puntos). No hay resultados publicados para MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la información disponible.

## Requisitos de hardware

- Entrenamiento: 8 GPU H100, según la model card (SFT con open-instruct, BF16, secuencias de hasta 32.768 tokens).
- Inferencia en BF16: los pesos de un modelo de 8B ocupan aproximadamente 16 GB, más el caché KV, que crece con la longitud de contexto. Con contexto largo (32.768 tokens) la memoria adicional puede ser considerable.
- Inferencia en cuantización de 4 bits: alrededor de 5-6 GB de pesos, lo que permitiría ejecución en GPU de consumo con contexto moderado. No hay cuantizaciones oficiales publicadas; sería necesario convertir los pesos.
- GPU recomendadas: A100 80 GB o H100 para contexto completo sin cuantizar y despliegue multi-usuario; RTX 4090 (24 GB) para BF16 con contexto reducido o cuantizado; GPU de 16 GB solo con cuantización agresiva y contexto corto.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 / RTX 3090 con cuantización a 4 bits o con BF16 y contexto limitado. No hay cifras confirmadas en la información proporcionada.
- Opciones de despliegue: vLLM aparece en el ejemplo de código de la propia model card, con parámetros de muestreo temperature 0,7, top_p 0,95 y max_tokens 4096. También es compatible con transformers. Para llama.cpp u Ollama sería necesario generar un GGUF propio, al no publicarse versiones oficiales.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (ScholarQA-CS2, media) | Disponibilidad |
|---|---|---|---|---|---|
| AstaBrief_8B_SFT | 8B (denso) | 32.768 tokens en SFT | Apache 2.0 | 83,7 | HuggingFace (allenai) |
| AstaBrief_8B (checkpoint DPO) | 8B (denso) | No disponible | Apache 2.0 | No disponible | HuggingFace (allenai) |
| Qwen3-8B (modelo base) | 8B (denso) | No detallado en la información proporcionada | Apache 2.0 | 77,3 | HuggingFace (Qwen) |

No se dispone de datos comparativos frente a otros modelos especializados en generación de informes con citas dentro de la información proporcionada; por tanto, la comparación con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio de SFT, no la versión final del proyecto: para producción se recomienda evaluar el checkpoint DPO AstaBrief_8B.
- Sensibilidad al formato de prompt: la model card advierte de que usar un formato distinto al prompt SFT recomendado puede degradar o volver inconsistente el comportamiento.
- Idioma: únicamente inglés; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Evaluación limitada: los únicos resultados publicados proceden de ScholarQA-CS2, 100 preguntas de informática. No hay evidencia de generalización a otras disciplinas ni a otros dominios, y no se publican benchmarks generalistas.
- Riesgo de alucinación: como todo modelo generativo, puede producir afirmaciones no sustentadas por los extractos proporcionados. Aunque la precisión de citas es alta (87,7), el recall de citas es 71,3, lo que implica que aproximadamente tres de cada diez citas relevantes pueden quedar sin recoger.
- Dependencia del pipeline de recuperación: la calidad del informe depende de la calidad de los extractos suministrados; el modelo no recupera literatura por sí mismo.
- Sesgos: no se documenta en la información proporcionada ningún análisis de sesgos, toxicidad o comportamiento diferencial por subgrupo.
- Procedencia de los datos de entrenamiento: el dataset SFT se generó con salidas de modelos propietarios (Claude 3.5 Sonnet, Claude 3.7 Sonnet, o3, o4-mini, GPT-4.1); conviene revisar las condiciones de uso de dichos proveedores antes de un despliegue comercial.
- Licencia: Apache 2.0 permite uso comercial, pero Ai2 remite a sus Responsible Use Guidelines y el modelo se declara destinado a investigación y educación.
- Estado del repositorio: 0 descargas y 2 "likes" en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allenai/AstaBrief_8B_SFT
- Checkpoint final con DPO: https://huggingface.co/allenai/AstaBrief_8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de SFT: https://huggingface.co/allenai/AstaBrief_SFT_Mix
- Prompt SFT recomendado: https://huggingface.co/datasets/allenai/AstaBrief_prompts/blob/main/sft_prompt.txt
- Blog del proyecto: https://allenai.org/blog/astabrief
- Repositorio de entrenamiento (open-instruct): https://github.com/allenai/open-instruct
- Paper del pipeline Asta ScholarQA (ACL demo): https://aclanthology.org/2025.acl-demo.49.pdf
- Paper del conjunto de evaluación ScholarQA-CS2: https://openreview.net/pdf?id=M7TNf5J26u
- Directrices de uso responsable de Ai2: https://allenai.org/responsible-use
- Organización allenai en HuggingFace: https://huggingface.co/allenai
- Cobertura en prensa especializada (DIY AI): https://diyai.io/news/ai2-astabrief-open-research-report-model/
- Guía de despliegue local con vLLM para RAG privado (AIReiter): https://aireiter.com/blog/astabrief-8b-vllm-local-deployment
