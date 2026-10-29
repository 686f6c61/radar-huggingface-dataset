# BGI-HangzhouAI/Genos-1.2B

## Resumen

Genos-1.2B es un modelo fundacional de genómica humana desarrollado por BGI-HangzhouAI (BGI Research, Hangzhou). No es un modelo de lenguaje natural: opera directamente sobre el alfabeto de nucleótidos con un vocabulario de 128 entradas (con padding) y aprende a resolver la secuencia base a base, con el objetivo de identificar patrones profundos y features funcionales ocultos en el genoma. Su propuesta central es el modelado contextual de secuencias de ADN de hasta un millón de pares de bases, una ventana que en la práctica cubre regiones reguladoras, haplotipos y bloques de variación estructural que los modelos con contextos de unos pocos miles de bases no pueden relacionar.

Arquitectónicamente es un transformer con mezcla de expertos (MoE): 1.246.094.336 parámetros totales repartidos en 8 expertos, de los que se activan 2 por token, lo que da unos 0,33 B de parámetros activos. Tiene 12 capas, dimensión oculta de atención 1024 con 16 cabezas y dimensión oculta de 4096 por experto. El entrenamiento declarado asciende a 1600 B de tokens (bases) sobre "cientos de genomas de referencia de alta calidad".

Su relevancia ahora es doble: por un lado publica pesos abiertos bajo licencia MIT, algo poco habitual en modelos fundacionales de genómica de esta escala; por otro, la relación parámetros totales/activos (3,8:1) hace que el coste de inferencia en FLOPs se acerque al de un modelo denso de 0,33 B, mientras la memoria de pesos ronda los 2,5 GB en bf16. Existe una variante mayor, Genos-10B, con la misma arquitectura de 8 expertos y 2 activos pero con dimensión de atención de 4096 y 2,87 B de parámetros activos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 8 expertos, 2 seleccionados por token (tag `mixtral` en el repo) |
| Parámetros totales | 1.246.094.336 (~1,2 B) |
| Parámetros activos | ~0,33 B |
| Longitud de contexto | Hasta 1.000.000 de pares de bases (1M pb), según model card |
| Tipos de cuantización | No disponible: no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones oficiales; solo pesos en safetensors |
| Idiomas soportados | No aplica: opera sobre alfabeto de nucleótidos; la model card no declara idiomas naturales |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoints nativos y variantes entrenadas con Megatron-LM) |
| Capas | 12 |
| Dimensión oculta de atención | 1024 |
| Cabezas de atención | 16 |
| Dimensión oculta MoE por experto | 4096 |
| Tamaño de vocabulario | 128 (con padding) |
| Tokens de entrenamiento | 1600 B (bases) |
| Tamaño del repositorio | 5,0 GB |
| Pipeline de HuggingFace | No disponible |
| Descargas / likes | 61 / 17 |

## Arquitectura y entrenamiento

Genos-1.2B es un transformer decoder-only con capas MoE de 8 expertos y enrutado top-2, distribuido en 12 capas. La dimensión de atención es 1024 con 16 cabezas (64 dimensiones por cabeza) y cada experto proyecta a 4096 dimensiones. El vocabulario de 128 entradas confirma la tokenización a resolución de base única: el modelo consume directamente la secuencia de nucleótidos en lugar de k-mers agregados, lo que le permite aprender representaciones a nivel de base y detectar señales que se diluyen con tokenizaciones más gruesas. La model card declara contexto de hasta 1M pb, coherente con el objetivo de capturar dependencias de largo alcance entre elementos reguladores distales.

El entrenamiento reportado consume 1600 B de tokens (bases) sobre cientos de genomas de referencia de alta calidad. No se documentan en la información disponible ni la composición exacta del dataset, ni las fases de alineación (RLHF/DPO), ni detalles del esquema de atención para contextos de un millón de bases (si se usa atención completa, sparse o alguna variante lineal). Sí se indica que existen checkpoints entrenados bajo el framework Megatron-LM, lo que sugiere entrenamiento distribuido a gran escala con paralelismo tensorial y de expertos. El repositorio de GitHub describe además un mecanismo de adaptación: se sustituye la cabeza de salida original por un módulo convolucional específico de tarea sobre el modelo preentrenado, de modo que las tareas downstream se abordan con cabezas ligeras en lugar de reentrenar el backbone completo.

## Capacidades

- Modelado contextual de secuencias de ADN a resolución de base única, con ventana de hasta 1M pb.
- Identificación de patrones profundos y features funcionales en el genoma (según la descripción del autor).
- Extracción de representaciones internas (embeddings) de secuencias genómicas para tareas downstream.
- Adaptación por fine-tuning mediante sustitución de la cabeza de salida por módulos convolucionales específicos de tarea.
- Inferencia eficiente en cómputo gracias al enrutado MoE: ~0,33 B de parámetros activos por token.
- Compatibilidad con el ecosistema Megatron-LM para entrenamiento y despliegue a escala.
- No soporta tool calling ni function calling: no es un modelo instruccional ni expone interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; no hay modo "thinking" documentado.
- No hay capacidades multimodales, de visión, audio ni generación de lenguaje natural declaradas.

## Casos de uso

- Predicción de efectos de variantes: fine-tuning con una cabeza convolucional sobre Genos-1.2B para clasificar variantes puntuales e indel en regiones codificantes y no codificantes, aprovechando que el modelo ya contextualiza el entorno de hasta 1M pb alrededor de la variante.
- Anotación de elementos reguladores: clasificación de promotores, enhancers y regiones de unión de factores de transcripción usando ventanas largas, de forma que el modelo pueda integrar la información del gen y sus elementos distales en una sola pasada.
- Segmentación de regiones genómicas: adaptación con cabeza por posición para delimitar dominios cromosómicos, islas CpG o fronteras de dominios topológicamente asociados, tareas en las que el contexto de 1M pb evita truncar la señal.
- Extracción de embeddings para búsqueda y agrupamiento de secuencias: uso del backbone congelado para generar representaciones de fragmentos genómicos y construir índices de similitud o clusters de familias de secuencias sin entrenamiento adicional.
- Análisis de haplotipos y variación estructural: comparación de regiones largas entre genomas de referencia y muestras, aprovechando la ventana de 1M pb para cubrir bloques de desequilibrio de ligamiento completos.
- Preentrenamiento continuo o dominio-específico: partir de los checkpoints Megatron-LM (1.2B) para seguir entrenando sobre cohortes propias con paralelismo de expertos ya soportado por el framework.
- Filtrado y priorización en pipelines de secuenciación: scoring de candidatos en estudios de asociación a gran escala antes de la validación experimental, con un coste por token bajo gracias a los 0,33 B de parámetros activos.
- Investigación metodológica en modelos fundacionales de genómica: el modelo sirve como referencia abierta (MIT) para estudiar tokenización a resolución de base, enrutado MoE y escalado de contexto en secuencias biológicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda consultados no incluyen métricas de evaluación (ni de tareas genómicas como predicción de variantes o anotación regulatoria, ni comparaciones numéricas con otros modelos), y tampoco se han facilitado cifras de latencia o throughput.

## Requisitos de hardware

- Pesos en bf16: ~2,5 GB (1.246 M de parámetros × 2 bytes), coherente con un repo de 5,0 GB que probablemente incluye más de una precisión o estados adicionales.
- Pesos en fp32: ~5 GB.
- Cuantización a int8: ~1,25 GB; a int4: ~0,65 GB (estimación aritmética; no hay cuantizaciones oficiales publicadas).
- Caché KV para contexto de 1M pb: con 12 capas, 16 cabezas y 64 dimensiones por cabeza, se necesitan ~24.576 elementos por base, es decir, unos 48 GB en bf16 solo para KV. Esto hace inviable el contexto completo en una GPU consumer y exige atención eficiente (FlashAttention, KV paginado) y/o paralelismo entre GPUs.
- GPU consumer: para contextos cortos (decenas de miles de bases) los pesos caben en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB. Para contextos de 1M pb no es suficiente ninguna GPU consumer ni una única A100 80 GB con atención completa.
- GPU de datacenter recomendadas: A100 80 GB, H100 80 GB, y configuraciones multi-GPU para contextos de cientos de miles a un millón de bases.
- Despliegue: checkpoints nativos vía PyTorch/Transformers y checkpoints específicos para Megatron-LM. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, ni ficheros GGUF publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Arquitectura | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| Genos-1.2B | ~1,2 B | ~0,33 B | Hasta 1M pb | MoE, 8 expertos / 2 activos, 12 capas | MIT | No disponibles |
| Genos-10B | ~10 B | ~2,87 B | Hasta 1M pb | MoE, 8 expertos / 2 activos, 12 capas | MIT (según el mismo repositorio) | No disponibles |
| Otros modelos fundacionales de genómica (familias tipo Nucleotide Transformer, DNABERT, Evo, GENA-LM) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han facilitado especificaciones ni resultados de benchmarks de modelos alternativos, por lo que no es posible establecer una comparación numérica rigurosa con otras familias de modelos genómicos. La única comparación interna verificable es con Genos-10B, que escala la dimensión de atención a 4096, la dimensión MoE por experto a 8192, el vocabulario a 256 y los tokens de entrenamiento a 2200 B.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no mantiene conversaciones, no sigue instrucciones y no genera texto. Cualquier uso tipo chat requeriría un LLM adicional.
- El entrenamiento declarado se apoya en genomas de referencia "de alta calidad"; las referencias humanas sobrerrepresentan determinadas poblaciones, por lo que el modelo puede modelar peor la variación de poblaciones infrarrepresentadas en esas referencias.
- Riesgo de predicciones plausibles pero incorrectas en tareas funcionales: los patrones aprendidos son correlacionales y requieren validación experimental (qPCR, reporteros, CRISPR) antes de cualquier conclusión biológica.
- Los detalles de entrenamiento (composición del dataset, fases de alineación, esquema de atención para 1M pb, recetas de fine-tuning) no están documentados en la información disponible, lo que dificulta la reproducibilidad.
- La ventana de 1M pb tiene un coste de memoria de caché KV muy alto (~48 GB en bf16 según estimación), por lo que en la práctica muchos despliegues operarán con contextos truncados.
- No hay cuantizaciones oficiales ni soporte declarado en motores de inferencia habituales (vLLM, llama.cpp, Ollama), lo que limita el despliegue en hardware modesto.
- Licencia MIT: permite uso comercial y modificación, pero la licencia no implica validez clínica ni regulatoria; el modelo no es un dispositivo médico ni debe usarse para diagnóstico sin validación y certificación independientes.
- Ecosistema muy incipiente: 61 descargas y 17 likes en el momento de la consulta, con pocas referencias independientes de terceros.
- Al ser MoE con enrutado top-2, el comportamiento puede variar entre entradas y no hay documentación publicada sobre análisis de carga o colapso de expertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BGI-HangzhouAI/Genos-1.2B
- Modelo Genos-10B: https://huggingface.co/BGI-HangzhouAI/Genos-10B
- Checkpoint Megatron-LM 1.2B: https://huggingface.co/BGI-HangzhouAI/Genos-Megatron-1.2B
- Checkpoint Megatron-LM 10B: https://huggingface.co/BGI-HangzhouAI/Genos-Megatron-10B
- Repositorio GitHub: https://github.com/BGI-HangzhouAI/Genos
- README en inglés del repositorio: https://github.com/BGI-HangzhouAI/Genos/blob/main/README_en.md
- Artículo en GigaScience: https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf132/8296738
- Organización en HuggingFace: https://huggingface.co/BGI-HangzhouAI
- Organización en ModelScope: https://modelscope.cn/organization/BGI-HangzhouAI
- Framework Megatron-LM: https://github.com/NVIDIA/Megatron-LM
