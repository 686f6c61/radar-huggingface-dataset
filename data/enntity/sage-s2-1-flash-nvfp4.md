# Enntity/Sage-S2.1-Flash-NVFP4

## Resumen

Sage-S2.1-Flash-NVFP4 es una cuantización calibrada de 4 bits del modelo internlm/Sage-S2.1-Flash, publicada por Enntity. El checkpoint reduce el peso de 643 GB en BF16 a 179 GB, manteniendo una divergencia KL de 0.0531 y un 94.5% de acuerdo top-1 respecto al modelo original. Está diseñado específicamente para cargarse en SparkGLM sobre dos o cuatro NVIDIA DGX Sparks, un motor de inferencia propio del autor.

El modelo base es un transformer multimodal (texto, imagen y vídeo) con arquitectura híbrida: 34 capas de atención lineal y 11 capas de atención indexada, además de una capa de predicción multi-token (MTP). La cuantización emplea NVFP4 para los expertos enrutados (42 capas de 288 expertos), MXFP8 para las proyecciones de atención lineal y el MLP denso, y FP8 para las proyecciones de atención indexada y los expertos compartidos. La torre de visión, embeddings, normas y routers permanecen en BF16.

La relevancia de esta ficha radica en que documenta un proceso de cuantización con calibración por experto (GPTQ con un Hessiano por experto) y validación estadística rigurosa (intervalos bootstrap del 95%), algo poco habitual en checkpoints cuantizados. No obstante, su utilidad práctica está muy acotada al ecosistema SparkGLM y DGX Spark: no se ha probado en vLLM, SGLang ni llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 34 capas de atención lineal + 11 capas de atención indexada, con capa MTP; multimodal (texto, imagen, vídeo) |
| Parametros totales | no disponible (peso del checkpoint: 179 GB en NVFP4/MXFP8/FP8) |
| Parametros activos | no disponible (la model card menciona 288 expertos enrutados por capa en 42 capas, lo que sugiere arquitectura MoE, pero no se indica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 1×32 (atención lineal, MLP denso, lm_head, MTP), FP8 128×128 (atención indexada, expertos compartidos), BF16 (visión, embeddings, normas, routers, kv_b_proj) |
| Idiomas soportados | no disponible (la calibración incluyó prosa en inglés y multilingüe, y evaluación en japonés) |
| Licencia | MIT |
| Formato de pesos | no disponible (diseñado para SparkGLM; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Sage-S2.1-Flash emplea una arquitectura transformer híbrida que combina 34 capas de atención lineal con 11 capas de atención indexada, e incorpora una capa de predicción multi-token (MTP). La componente de mezcla de expertos (MoE) se distribuye en 42 capas con 288 expertos enrutados cada una. El checkpoint cuantizado conserva la torre de visión en BF16, lo que habilita entrada de imagen y vídeo, aunque los proyectores de entrada científica del repositorio original (moléculas, estructuras cristalinas, proteínas) no están incluidos.

La cuantización se realizó mediante GPTQ con un Hessiano independiente por experto, calibrado a partir de los pesos BF16 originales (sin partir de otro checkpoint cuantizado). Se usaron 2.229 secuencias de datasets públicos (razonamiento, chat, tool calling, código, prosa en inglés y multilingüe, ciencia y matemáticas), con 600.000 tokens para los expertos y 200.000 para las matrices de 8 bits. Las matrices de 8 bits se recalibraron contra las entradas de capa para recuperar precisión (KL de 0.0625 a 0.0531). La capa MTP se redondeó a nearest, sin calibración.

## Capacidades

- Generación de texto y razonamiento multi-turno, con evaluación específica en chat de razonamiento (KL 0.0573, top-1 95.35%).
- Generación de código (KL 0.0276, top-1 96.84% en la categoría Code).
- Razonamiento matemático (KL 0.0199, top-1 96.35% en Math; sonda aritmética 39/40).
- Comprensión de imágenes: 3 de 3 preguntas de imagen respondidas correctamente en la validación del autor.
- Comprensión de vídeo: 2 de 2 preguntas de vídeo respondidas correctamente.
- Tool calling / function calling: 21 de 21 llamadas correctas en la suite de validación; categoría con KL 0.2772 y top-1 85.93% (la más degradada por la cuantización).
- Tareas agénticas multi-paso: 20 de 20 tareas completadas en la validación.
- Recuperación en contexto largo: 12 de 12 aciertos en la prueba de long-context retrieval.
- Soporte multilingüe parcial: la calibración incluyó prosa multilingüe y se evaluó prosa en japonés (KL 0.0265, top-1 94.04%).
- Salida estructurada: decodificación a 89.7 tok/s en la prueba de structured output.

## Casos de uso

- Despliegue en clúster DGX Spark: el caso de uso principal y documentado. Con dos Sparks en tensor parallel 2 y SparkGLM 0.3.5, el modelo alcanza 38.4 tok/s en decodificación de prosa y 67.4 tok/s en código, lo que lo hace adecuado para servir un modelo multimodal de gran tamaño en hardware de borde con un consumo energético contenido.
- Asistente de código en producción: la categoría Code mantiene un top-1 del 96.84% respecto a BF16 y una decodificación de 67.4 tok/s, suficiente para autocompletado y generación de parches en pipelines de CI/CD donde la latencia importa.
- Automatización de tool calling en agentes: con 21 de 21 llamadas correctas en la suite del autor, el modelo puede orquestar APIs y funciones en flujos agénticos. Requiere la corrección del motor (Enntity/atlas#33) si se usa `tool_choice` forzado.
- Análisis de documentos con imágenes y vídeo: la torre de visión en BF16 y las 3/3 y 2/2 respuestas correctas en imagen y vídeo permiten usarlo para inspección visual, extracción de información de capturas o resumen de clips cortos.
- Razonamiento matemático y científico asistido: la categoría Science mantiene KL 0.0159 y top-1 95.18%, y Math KL 0.0199, lo que lo hace apto para tutoría o verificación de cálculos, aunque sin los proyectores de entrada científica del modelo original.
- Recuperación aumentada con contexto largo: 12 de 12 aciertos en long-context retrieval lo habilitan para RAG sobre corpus extensos, siempre que el motor soporte la ventana de contexto del modelo base (no documentada en esta ficha).
- Salida estructurada y extracción de datos: 89.7 tok/s en structured output decode lo hacen viable para generar JSON validado en pipelines de ingestión de datos.

## Benchmarks y rendimiento

Fidelidad frente a BF16, medida en PyTorch sobre 224 documentos retenidos (239.711 posiciones), con intervalos bootstrap del 95%:

| Metrica | Este checkpoint | Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4 |
|---|---|---|
| KL divergence | 0.0531 [0.0441, 0.0631] | 0.0676 [0.0548, 0.0819] |
| Acuerdo top-1 | 94.50% [94.10, 94.88] | 93.89% |
| Incremento de NLL | +0.64% | +0.66% |

Por categoría (32 documentos cada una):

| Categoria | Este checkpoint (KL, top-1) | Bizuayeu Mixed-NVFP4 (KL, top-1) |
|---|---|---|
| Reasoning chat | 0.0573, 95.35% | 0.0679, 94.35% |
| Code | 0.0276, 96.84% | 0.0263, 96.92% |
| Math | 0.0199, 96.35% | 0.0234, 96.11% |
| English prose | 0.0424, 94.25% | 0.0415, 94.40% |
| Japanese prose | 0.0265, 94.04% | 0.0280, 93.64% |
| Science | 0.0159, 95.18% | 0.0163, 95.11% |
| Tool calling | 0.2772, 85.93% | 0.4176, 81.53% |

Rendimiento de servicio en SparkGLM 0.3.5, dos Sparks (tensor parallel 2), modo Spark:

| Metrica | Sage S2.1 Flash NVFP4 | GLM-5.3-Flash FP4-Local (misma pareja) |
|---|---|---|
| Decodificacion de prosa | 38.4 tok/s | 37.8 tok/s |
| Decodificacion de codigo | 67.4 tok/s | 66.2 tok/s |
| Decodificacion de salida estructurada | 89.7 tok/s | 83.8 tok/s |

Pruebas funcionales del autor: aritmética 39/40, long-context retrieval 12/12, tool calls 21/21, tareas agénticas 20/20, imagen 3/3, vídeo 2/2. Suite de calificación de SparkGLM: 97/109 en 0.3.5 tal cual, 109/109 con la corrección del motor.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 179 GB, por lo que requiere al menos esa capacidad total, distribuida entre GPUs. En BF16 el modelo base pesa 643 GB.
- Configuración probada: dos NVIDIA DGX Spark en tensor parallel 2 con SparkGLM 0.3.5 en modo Spark.
- Configuración no medida: tensor parallel 4 (cuatro Sparks). No hay datos de rendimiento para esta topología.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en una única GPU profesional estándar (A100 80 GB, H100 80 GB) sin sharding en múltiples dispositivos.
- Opciones de despliegue: únicamente SparkGLM 0.3.5 ha sido probado. vLLM, SGLang, llama.cpp, Ollama y TGI no han sido validados; el layout sigue el checkpoint FP4-Local de NVIDIA para GLM-5.3-Flash, pero no se garantiza compatibilidad.
- Latencia y throughput: 38.4 tok/s (prosa), 67.4 tok/s (código) y 89.7 tok/s (salida estructurada) en dos Sparks con tensor parallel 2.
- Configuración de despliegue: definir `CHECKPOINT_REPO=Enntity/Sage-S2.1-Flash-NVFP4` y `CHECKPOINT_REVISION` con el commit fijado en el `.env` de SparkGLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento relativo |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-NVFP4 (este) | no disponible (179 GB) | no disponible | MIT | no disponible (SparkGLM) | KL 0.0531, top-1 94.50% |
| Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4 | no disponible | no disponible | no disponible | no disponible | KL 0.0676, top-1 93.89%; mantiene atención lineal y lm_head en BF16 |
| GLM-5.3-Flash FP4-Local | no disponible | no disponible | no disponible | FP4-Local (NVIDIA) | 37.8 tok/s prosa, 66.2 tok/s código, 83.8 tok/s structured (misma pareja de Sparks) |
| internlm/Sage-S2.1-Flash (BF16) | no disponible (643 GB) | no disponible | MIT | BF16 | Referencia de fidelidad (KL 0, top-1 100%) |

La comparación con GLM-5.3-Flash FP4-Local se limita a throughput en el mismo hardware; no hay datos de calidad comparables. La comparación con Bizuayeu Mixed-NVFP4 no es estrictamente equivalente porque ese checkpoint conserva más capas en BF16 y usa un conjunto de documentos distinto para sus métricas.

## Limitaciones y advertencias

- Entradas científicas no soportadas: moléculas, estructuras cristalinas, proteínas y otras entradas de Sage SciPerception requieren los proyectores del repositorio original, ausentes en este checkpoint.
- Compatibilidad de motores muy restringida: solo SparkGLM 0.3.5 ha sido probado. vLLM, SGLang y otros motores no se han validado, lo que limita su adopción fuera del ecosistema Enntity.
- Tool calling forzado defectuoso en SparkGLM 0.3.5: las peticiones con `tool_choice` nombrando una herramienta, `required` o `any` pueden devolver la llamada como texto en lugar de como tool call. La corrección está en Enntity/atlas#33 y no se ha incluido en ninguna release de SparkGLM. Las peticiones con elección automática no se ven afectadas.
- Tokenizer: la regla del tokenizer original codifica cadenas de control como `<tool_call>` dentro del contenido del mensaje como texto plano. SparkGLM tiene su propio manejo de markup literal; sus tests pasan con este checkpoint, pero no es la ruta de código original.
- Capa MTP redondeada a nearest, no calibrada: puede degradar ligeramente la decodificación especulativa.
- Borrador de decodificación especulativa no adaptado: el drafter que usa SparkGLM fue entrenado sobre GLM-5.3-Flash, no sobre Sage, lo que puede reducir la eficacia de la decodificación especulativa.
- Tensor parallel 4 no medido: no hay datos de rendimiento ni de estabilidad en cuatro Sparks.
- Degradación desigual por categoría: tool calling es la más afectada (KL 0.2772, top-1 85.93%), seguida de reasoning chat (KL 0.0573). Code y prosa inglesa quedan ligeramente por detrás del checkpoint de Bizuayeu.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; debe evaluarse empíricamente antes de uso en producción.
- Idiomas: no se especifica la lista completa de idiomas soportados; solo hay evidencia de calibración multilingüe y evaluación en japonés.
- Licencia MIT: permite uso comercial, pero el modelo base y los datasets de calibración pueden tener sus propias condiciones que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/Enntity/Sage-S2.1-Flash-NVFP4
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Checkpoint alternativo comparado: https://huggingface.co/Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4
- Motor de inferencia SparkGLM: https://github.com/Enntity/sparkglm
- Corrección del motor para tool choice forzado: https://github.com/Enntity/atlas/pull/33
