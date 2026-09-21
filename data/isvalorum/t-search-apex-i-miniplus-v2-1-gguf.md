# IsValorum/T-Search-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

T-Search APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF personalizada del modelo t-tech/T-Search, una arquitectura de mezcla de expertos (MoE) de 35,5 mil millones de parámetros diseñada como recuperador agéntico: planifica consultas, ejecuta búsquedas en varias rondas y sintetiza cadenas de evidencia verificables. La cuantización la firma el usuario IsValorum y se distribuye bajo licencia Apache 2.0, con soporte declarado para 13 idiomas (inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe).

El interés de esta publicación no está en el modelo base, sino en la estrategia de cuantización. Frente a los cuantizados comunitarios uniformes que comprimen los expertos a 2 bits y degradan las matrices de enrutamiento, este build aplica una receta tensor por tensor: mantiene los routers (`gate_inp`) en F32 sin comprimir, la cabeza de salida en Q6_K, las puertas de atención en Q8_0 y los expertos centrales en IQ3_XXS. El resultado declarado ocupa 15,23 GB (14,18 GiB) para el GGUF principal, muy por debajo de la referencia Q3_K_M de 16,7 GB, con una perplejidad WikiText-2 de 5,6716 ± 0,12975.

Además, el repositorio incluye un proyector multimodal de visión en Q8_0 (`mmproj`), lo que habilita recuperación visual sin cuantizar los tokens de imagen. El autor afirma que el contexto completo de 256K tokens puede ejecutarse íntegramente en VRAM en estaciones de trabajo de 24 GB, un dato relevante para despliegues de agentes de búsqueda de contexto largo en hardware de gama alta para consumidor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); la etiqueta del repositorio indica `qwen35moe`, 40 capas y 256 micro-expertos según la model card |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) según la model card |
| Tipos de cuantizacion | Mezcla por tensor: IQ3_XXS (expertos centrales), Q3_K (expertos de borde), Q5_K (experto compartido), Q4_K y Q6_K (atención), Q8_0 (puertas de atención y proyector de visión), Q6_K (cabeza de salida), F32 (routers) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal `mmproj` en GGUF Q8_0 distribuido por separado |

Datos adicionales de distribución: el repositorio ocupa 15,8 GB; el GGUF principal pesa 15,23 GB (14,18 GiB) y el conjunto con proyector 15,84 GB (14,75 GiB). El modelo base es [t-tech/T-Search](https://huggingface.co/t-tech/T-Search) y la calibración de importancia (`imatrix`) procede de bartowski, según la model card.

## Arquitectura y entrenamiento

La información disponible describe el modelo base como una arquitectura MoE especializada en recuperación agéntica. La model card de la cuantización menciona 40 capas, 256 micro-expertos y un experto compartido (`shexp`) presente en las 40 capas, con matrices de enrutamiento (`gate_inp`) que dirigen las consultas de búsqueda y los tokens de evidencia. La etiqueta `qwen35moe` del repositorio apunta a una arquitectura de la familia Qwen con enrutamiento disperso, pero la model card no confirma de forma explícita la genealogía arquitectónica, el número de expertos activos por token ni la configuración de atención (GQA, ventana deslizante, etc.). El dato de parámetros activos no está disponible.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o RLVR. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal) en el material proporcionado. Lo que sí se detalla es la intervención de cuantización: auditada tensor por tensor, con routers sin comprimir, protección de la cabeza de salida y de las puertas de atención, y una matriz de importancia para calibrar los expertos. Esta estrategia busca evitar la deriva de enrutamiento y los fallos de sintaxis que el autor atribuye a los cuantizados comunitarios uniformes en 2 bits.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas, con especial atención a inglés y chino por el origen del modelo base.
- Recuperación agéntica: planificación de consultas, ejecución de búsquedas en múltiples rondas y síntesis de cadenas de evidencia con trazabilidad de citas.
- Razonamiento con modo de pensamiento: la model card menciona explícitamente errores de sintaxis en bloques `<think>` como síntoma de cuantizaciones agresivas, lo que implica soporte de modo razonamiento.
- Recuperación multimodal: el proyector `mmproj` en Q8_0 permite procesar tokens visuales, según el autor con latencia cero añadida.
- Capacidades multilingües declaradas para 13 idiomas, incluyendo español, árabe, tailandés y vietnamita.
- Integración con `llama.cpp` y ecosistema GGUF (Ollama, LM Studio y similares).
- El soporte explícito de tool calling o function calling no está documentado en la información disponible, aunque la naturaleza de agente de búsqueda implica algún mecanismo de invocación de herramientas.

## Casos de uso

- Investigación profunda automatizada: el modelo puede encadenar varias rondas de búsqueda sobre un corpus documental y devolver un informe con evidencia citada, aprovechando la ventana de 256K tokens para mantener todo el material recuperado en contexto.
- Asistentes de atención al cliente con base de conocimiento: conversaciones multi-turno con recuperación de artículos internos y respuestas ancladas a fuentes, evitando respuestas sin respaldo.
- Análisis de documentación técnica extensa: ingestión de manuales, normativas o contratos de cientos de miles de tokens y generación de resúmenes con referencias cruzadas verificables.
- Verificación de hechos y periodismo asistido: construcción de cadenas de evidencia a partir de múltiples fuentes y detección de contradicciones entre documentos.
- Recuperación visual en pipelines RAG multimodales: con el `mmproj` incluido, el sistema puede indexar y consultar capturas, diagramas o páginas escaneadas junto a texto.
- Agentes autónomos de monitorización: ejecución periódica de búsquedas sobre fuentes cambiantes y generación de alertas con justificación documental.
- Despliegue local en estaciones de trabajo: el tamaño de 14,18 GiB permite ejecutar un modelo de 35,5 B en una GPU de 24 GB con el contexto completo en VRAM, lo que habilita flujos de trabajo con datos sensibles que no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

La model card solo publica una métrica de fidelidad de cuantización: perplejidad en WikiText-2, evaluada sobre el binario GGUF con 2048 tokens de contexto y 10 fragmentos.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 | 5,6716 ± 0,12975 | GGUF, contexto 2048, 10 chunks |
| Delta frente al baseline sin cuantizar | aproximadamente +0,05 | Según el autor |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K, GPQA ni evaluaciones específicas de recuperación (como BEIR o MTEB). Tampoco hay comparaciones numéricas frente a otros modelos de la misma categoría más allá de la tabla interna de variantes de cuantización descrita a continuación.

Comparativa interna de recetas de cuantización publicada por el autor:

| Especificacion | APEX Mini genérico | MiniPlus V2.1 (esta release) |
|---|---|---|
| Expertos centrales (10-29) | IQ2_S (2,50 bpw) | IQ3_XXS |
| Expertos de borde (0-9, 30-39) | Q3_K en 5 capas | Q3_K en 10 capas |
| Experto compartido | Q4_K / Q3_K | Q5_K en las 40 capas |
| Atención completa | Q3_K | Q4_K en q/k/v y Q6_K en output |
| Puertas de atención | Comprimidas | Q8_0 |
| Cabeza de salida | Q3_K_M | Q6_K |
| Routers | Comprimidos | F32 |
| Tamano aproximado | unos 12,5 GB | 14,18 GiB (15,23 GB) |

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 14,2 GiB para el GGUF principal y 14,75 GiB incluyendo el proyector de visión. Cifras calculadas a partir del tamaño publicado.
- Caché KV para 256K tokens: no disponible en la información proporcionada; el autor afirma que el contexto completo cabe en VRAM en máquinas de 24 GB, lo que implica que la caché debe ser reducida (probablemente por GQA y cuantización de la propia KV), pero no se dan cifras.
- GPU de 24 GB: RTX 3090, RTX 4090, A5000, L4 (esta última con menos margen) permitirían el modelo completo en VRAM según el autor.
- GPU de 32 GB o más: RTX 5090, V100 32GB, A100 40GB, H100, con margen para contexto largo y trabajo concurrente.
- GPU de 16 GB (RTX 4080, 4060 Ti 16GB, A4000): ejecución viable con offload parcial de capas a RAM del sistema, con penalización de velocidad.
- CPU y RAM del sistema: el autor destaca el streaming desde DDR4/DDR5 y la ausencia de bloqueos de descompresión AVX2 cuando se descarga la mayor parte del modelo a memoria del sistema.
- Opciones de despliegue: `llama.cpp` y sus derivados (llama-server, Ollama, LM Studio, koboldcpp) son el entorno natural para GGUF. El soporte de vLLM o TGI para esta arquitectura y formato no está documentado en la información disponible.
- Latencia y throughput: no se publican cifras concretas de tokens por segundo; la model card solo menciona de forma cualitativa un rendimiento alto de streaming desde RAM.

## Comparativa con modelos similares

La información disponible no incluye datos comparativos frente a otros modelos de 35B de terceros, por lo que la comparación se limita al modelo base y a las variantes de cuantización documentadas por el autor.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t-tech/T-Search (base, sin cuantizar) | 35,5 B | 256K según la ficha de la cuantización | safetensors, presumiblemente | no disponible | HuggingFace |
| IsValorum/T-Search-APEX-I-MiniPlus-V2.1-GGUF | 35,5 B | 256K | GGUF mixto, ~14,18 GiB | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| APEX-I-Mini genérico (cuantización comunitaria) | 35,5 B | 256K | GGUF uniforme, ~12,5 GB | no disponible | Referenciado en la model card |

Comparación con alternativas externas de la misma categoría (por ejemplo, otros MoE de ~30-35B orientados a agentes): no disponible.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión inevitable. El autor reporta un delta de perplejidad de aproximadamente +0,05, pero no hay evaluaciones independientes que lo confirmen.
- Los expertos centrales se mantienen en IQ3_XXS (aproximadamente 3 bits), por debajo de Q4. En tareas de razonamiento prolongado o de generación de código con sintaxis estricta puede aparecer degradación frente al modelo sin cuantizar.
- Riesgo de alucinación en cadenas de evidencia: si el enrutamiento falla o el contexto recuperado es irrelevante, el modelo puede generar citas o filtros de búsqueda plausibles pero incorrectos.
- El repositorio registra 0 descargas y 0 likes, y no hay validación de la comunidad ni evaluaciones de terceros. La ficha se basa casi por completo en afirmaciones del propio autor de la cuantización.
- El rendimiento en los 13 idiomas declarados no está verificado; los idiomas con menos presencia en los datos del modelo base probablemente rindan peor.
- Licencia Apache 2.0 declarada para el artefacto GGUF, pero no se detalla la licencia del modelo base t-tech/T-Search en la información disponible. Conviene verificar los términos del modelo original antes de un uso comercial.
- La arquitectura MoE con etiqueta `qwen35moe` requiere una versión de `llama.cpp` que soporte esta arquitectura y los tipos de cuantización mixtos empleados (IQ3_XXS, Q5_K, etc.); versiones antiguas pueden fallar al cargar el modelo.
- El proyector de visión solo funciona en runtimes que soporten `mmproj`; sin él, el modelo queda limitado a texto.
- Los 256K tokens de contexto son una ventana nominal, no una garantía de recuperación efectiva en todo el rango; la degradación en el extremo de la ventana no está documentada.
- La fecha de creación del repositorio indicada por la plataforma (2026-09-21) es posterior a la fecha de consulta habitual de estos datos; conviene verificar la vigencia del artefacto antes de integrarlo en producción.

## Enlaces

- [IsValorum/T-Search-APEX-I-MiniPlus-V2.1-GGUF en HuggingFace](https://huggingface.co/IsValorum/T-Search-APEX-I-MiniPlus-V2.1-GGUF)
- [Modelo base t-tech/T-Search en HuggingFace](https://huggingface.co/t-tech/T-Search)
- Búsqueda web: no se han encontrado resultados relevantes. Las consultas devolvieron únicamente páginas de inicio y formularios de acceso de Facebook, sin relación con el modelo, por lo que no se dispone de papers, blogs, repositorios ni demos adicionales verificables.
