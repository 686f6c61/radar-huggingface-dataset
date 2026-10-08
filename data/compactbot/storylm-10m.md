# Compactbot/storylm-10m

## Resumen

StoryLM-10M es un modelo de lenguaje causal de tipo LLaMA entrenado desde cero por el usuario Compactbot sobre el dataset TinyStories. Se trata de un modelo deliberadamente diminuto: 12.603.648 parámetros (~12,6 M), 8 capas, d_model de 256, 8 cabezas de atención y una ventana de contexto de 512 tokens. La arquitectura sigue el patrón habitual de los transformers decoder-only modernos, con RoPE para las posiciones, SwiGLU en la FFN y RMSNorm, además de embeddings atados entre entrada y salida.

El modelo se posiciona en la categoría de SLM (small language models) con fines de investigación y demostración, no de producción. Su único dominio es la generación de narrativa infantil sencilla en inglés, y fue entrenado con 24.400 pasos (batch 4, secuencia 512) sobre TinyStories, lo que equivale a unos 50 millones de tokens procesados, aproximadamente el 9,4 % de una única época sobre los 533,7 millones de tokens del corpus. El entrenamiento completo se realizó en una única RTX 5090 (32 GB) en unos 281 segundos.

Su relevancia es fundamentalmente pedagógica: permite reproducir de principio a fin un pipeline de entrenamiento de un LLM (tokenizador, arquitectura, bucle de entrenamiento, validación) con un coste de cómputo ínfimo y sin depender de pesos preentrenados. Como contrapartida, los ejemplos de generación publicados por el propio autor reproducen literalmente el prompt, y los pesos se distribuyen como un checkpoint PyTorch personalizado que no es compatible con transformers de forma directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only tipo LLaMA (RoPE, SwiGLU, RMSNorm) |
| Parámetros totales | 12.603.648 (~12,6 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (solo se publica el checkpoint en precisión de entrenamiento) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch único (`model.pt`); no safetensors ni GGUF |
| d_model | 256 |
| Capas | 8 |
| Cabezas de atención | 8 (MHA), 8 cabezas KV, head_dim 32 |
| Dimensión de la FFN | 1024 (SwiGLU, factor de expansión 4x) |
| Tamaño de vocabulario | 8192 tokens |
| Embeddings atados | Sí |
| Compatibilidad con transformers | No de serie; la model card indica que es una implementación propia |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con normalización RMSNorm, activación SwiGLU en la red feed-forward y embeddings de posición rotatorios (RoPE). No se documenta el uso de GQA/MQA (las 8 cabezas de query y las 8 de clave/valor coinciden), ni de atención lineal, ventana deslizante o decodificación especulativa. El vocabulario es de 8192 tokens, muy reducido en comparación con los 50.257 del tokenizador GPT-Neo que usan los modelos TinyStories originales, y los embeddings están atados, lo que reduce el recuento total de parámetros.

El entrenamiento se realizó exclusivamente sobre TinyStories (2.119.719 historias, 533,7 millones de tokens), con AdamW, learning rate de 3e-4, scheduler coseno y 500 pasos de warmup. Se ejecutaron 24.400 pasos con batch de 4 y secuencia de 512, lo que arroja unos 49.971.200 tokens vistos, es decir, cerca de 0,09 épocas del corpus: el modelo ha visto menos de una décima parte de los datos disponibles. No hay evidencia de fases de ajuste posteriores (SFT, RLHF, DPO) ni de alineación. La mejor pérdida de validación reportada es 1,8635, con una perplejidad de 6,45. El coste total de entrenamiento fue de aproximadamente 281 segundos en una RTX 5090, equivalente a unos 178.000 tokens por segundo incluyendo el paso hacia atrás.

## Capacidades

- Generación de texto narrativo muy simple en inglés, limitada al registro de cuentos infantiles (TinyStories): frases cortas, vocabulario básico y tramas elementales.
- Continuación de prompts (completion), no conversación: el modelo no está ajustado para formatos de instrucciones ni de chat.
- Modelado de lenguaje puro: sirve como banco de pruebas para perplejidad, tokenización y dinámicas de entrenamiento a pequeña escala.
- Sin soporte de tool calling ni function calling: no se documenta plantilla de herramientas ni entrenamiento asociado.
- Sin capacidades de agente ni razonamiento multi-paso: no hay modo "thinking", ni cadenas de razonamiento, ni uso de memoria externa.
- Sin capacidades matemáticas, de código o de recuperación aumentada documentadas.
- Sin visión, audio ni cualquier otra modalidad: es estrictamente texto a texto.
- Multilingüismo nulo: el modelo se declara únicamente para inglés.
- Vocabulario de 8192 tokens: palabras poco frecuentes y nombres propios se fragmentan en múltiples subtokens, un artefacto visible en los propios ejemplos del autor ("ro bot").

## Casos de uso

- Material docente para cursos de LLM: permite mostrar en clase, de forma completa y en menos de cinco minutos de cómputo, el ciclo tokenizador, definición de arquitectura, bucle de entrenamiento y evaluación de perplejidad sin depender de pesos externos.
- Investigación sobre el corpus TinyStories: sirve como punto de comparación reproducible para estudiar cómo varían la perplejidad y la coherencia en función de la arquitectura y del número de épocas sobre un corpus sintético controlado.
- Ablaciones arquitectónicas de bajo coste: con 12,6 M de parámetros se pueden probar variantes de RoPE, SwiGLU, RMSNorm o atención (MHA frente a GQA) en minutos por experimento, algo inviable a mayor escala.
- Pruebas de infraestructura y CI: utilizable como modelo "de humo" en pipelines de entrenamiento distribuido, conversión de checkpoints, exportación a GGUF o validación de scripts de evaluación, ya que cabe entero en memoria y no consume GPU de gama alta.
- Experimentos de tokenización: su vocabulario de 8192 tokens frente a los 50.257 del tokenizador GPT-Neo de la familia TinyStories lo convierten en un caso de estudio para medir el impacto del tamaño de vocabulario en la calidad de la generación con presupuestos de parámetros fijos.
- Evaluación de compresión y cuantización: por su tamaño (~25 MB en FP16, ~7 MB a 4 bits) es un banco de pruebas ideal para medir pérdida de perplejidad al cuantizar, sin necesidad de infraestructura especializada.
- Demostraciones en dispositivo (edge): puede ejecutarse en CPU o en placas tipo Raspberry Pi para ilustrar latencia y consumo de un SLM, siempre con expectativas de calidad muy bajas y solo en inglés.
- Generación de cuentos sintéticos para aumentar datos: con la advertencia de que, según los ejemplos publicados, la calidad de generación es dudosa y requeriría validación y filtrado previos a cualquier uso como dato de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K, HellaSwag ni evaluaciones equivalentes). Las únicas métricas reportadas son de validación durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Mejor pérdida de validación | 1,8635 |
| Perplejidad de validación | 6,45 |
| Pasos de entrenamiento | 24.400 |
| Tokens procesados (derivado: 24.400 × 4 × 512) | ~49.971.200 (~50 M) |
| Épocas sobre TinyStories (derivado de 533,7 M tokens) | ~0,09 |
| Tiempo total de entrenamiento | ~281 s en una RTX 5090 (32 GB) |
| Throughput de entrenamiento (derivado) | ~178.000 tokens/s, incluyendo paso hacia atrás |

Conviene señalar que la perplejidad de 6,45 en el dominio TinyStories no es extrapolable a texto general: el corpus es sintético, con vocabulario y sintaxis muy restringidos, por lo que una perplejidad baja no implica competencia lingüística fuera de ese registro.

## Requisitos de hardware

- VRAM para inferencia (solo pesos): ~50 MB en FP32, ~25 MB en FP16/BF16, ~13 MB en int8 y ~7 MB a 4 bits. Con activaciones, caché KV (8 capas × 8 cabezas KV × head_dim 32 × 512 tokens) y overhead del runtime, el consumo real se mantiene por debajo de 1 GB en cualquier configuración.
- GPU recomendadas: ninguna en particular. El modelo cabe holgadamente en cualquier GPU con más de 1 GB de VRAM, incluidas GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100. Usar una A100 o H100 para inferencia sería un desperdicio de recursos salvo por motivos de agregación de carga.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo de la última década y también en iGPU y CPU (inferencia en CPU perfectamente viable).
- La RTX 5090 (32 GB) que menciona el autor se empleó para el entrenamiento, no es un requisito de inferencia.
- Opciones de despliegue: no hay una ruta directa. Los pesos se publican como `model.pt` de una implementación propia, por lo que herramientas como vLLM, TGI, llama.cpp u Ollama no pueden cargarlos sin un trabajo previo de conversión (exportación a safetensors con una clase de configuración equivalente, o conversión a GGUF). La model card indica explícitamente que no es compatible con transformers "out of the box".
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en inferencia.

## Comparativa con modelos similares

La comparación natural es con la familia TinyStories de Ronen Eldan, entrenada sobre el mismo corpus, y con GPT-2 small como referencia de la generación anterior de modelos pequeños. Los datos de las alternativas deben verificarse en sus respectivos repositorios; aquí se marcan como no verificados los campos que no se han podido confirmar.

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| StoryLM-10M | 12,6 M | 512 | TinyStories, ~0,09 épocas (50 M tokens) | Apache 2.0 | Checkpoint `model.pt`, implementación propia |
| TinyStories-1M | ~1 M | No verificado | TinyStories | No verificada | Pesos compatibles con transformers/safetensors |
| TinyStories-8M | ~8 M | No verificado | TinyStories | No verificada | Pesos compatibles con transformers/safetensors |
| TinyStories-28M | ~28 M | No verificado | TinyStories | No verificada | Pesos compatibles con transformers/safetensors |
| GPT-2 small | 124 M | 1024 | WebText | Licencia de OpenAI (MIT modificada) | Pesos compatibles con transformers/safetensors |

Diferencias clave frente a la familia TinyStories: StoryLM-10M usa un vocabulario de 8192 tokens frente a los 50.257 del tokenizador GPT-Neo de aquellos, y se ha entrenado durante una fracción muy pequeña de una época, mientras que los modelos de referencia suelen completar varios epochs sobre el mismo corpus. La ventaja de StoryLM-10M es su licencia Apache 2.0 explícita; su desventaja es la falta de compatibilidad con el ecosistema estándar y la ausencia de resultados comparables publicados.

## Limitaciones y advertencias

- Modelo severamente subentrenado: con ~50 M tokens procesados sobre un corpus de 533,7 M, ha visto menos del 10 % de una época.
- Los ejemplos de generación publicados en la propia model card muestran una salida idéntica al prompt en los cinco casos (por ejemplo, "Once upon a time, there was a little" como entrada y como salida), lo que sugiere un comportamiento degenerado de copia del contexto más que una generación genuina. Un caso muestra además el artefacto de tokenización "a small ro bot named".
- Riesgo alto de alucinación y de incoherencia: no hay alineación (ni SFT, ni RLHF, ni DPO) ni filtros de seguridad.
- Sesgos: no se ha documentado ningún análisis de sesgos. El corpus TinyStories es sintético y de temática infantil, lo que limita los sesgos de contenido pero no los elimina.
- Idiomas: únicamente inglés. No hay soporte multilingüe, y el vocabulario de 8192 tokens degrada especialmente el texto en otros idiomas.
- Contexto máximo de 512 tokens, insuficiente para conversaciones multi-turno largas, resúmenes de documentos o análisis de código.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución, pero la utilidad práctica del modelo para producto es prácticamente nula.
- Deuda técnica: al no ser compatible con transformers, vLLM, llama.cpp, Ollama ni TGI, cualquier integración exige escribir o adaptar código de carga y, previsiblemente, convertir los pesos.
- Sin benchmarks publicados y sin métricas de inferencia: no hay base objetiva para comparar su calidad con alternativas.
- Repositorio sin validación social: 0 descargas y 0 likes en el momento de la consulta, y una fecha de creación registrada (2026-10-07) poco habitual, lo que apunta a posibles inconsistencias en los metadatos.
- Inconsistencia de metadatos: el tamaño del repositorio figura como 0,0 GB, aunque la model card describe un checkpoint `model.pt` que en FP32 rondaría los 50 MB.
- No recomendado para producción ni para tareas que requieran fiabilidad, razonamiento o exactitud factual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/storylm-10m
- Dataset TinyStories (referenciado en la model card): https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories, "TinyStories: How Small Can Language Models Be and Still Speak Coherent English?" (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
- Colección de modelos de referencia TinyStories: https://huggingface.co/roneneldan
- No se han encontrado otros enlaces (repositorio de código, demo, blog del autor o paper propio) en la información disponible.
