# inclusionAI/SingVL_S1_4B

## Resumen

Sing VL S1 4B es un modelo multimodal de decisión desarrollado por inclusionAI y construido sobre la arquitectura Qwen3.5. A diferencia de los modelos generativos convencionales, no produce texto libre: responde a preguntas nombradas y tipadas sobre entradas de texto o JSON y hasta cuatro imágenes, devolviendo distribuciones de probabilidad sobre opciones predefinidas. El modelo implementa tres tipos de decisión: *choice* (selecciona una opción entre candidatos y devuelve la probabilidad de cada una), *noul* (probabilidad de que una proposición sí/no sea verdadera) y *score* (puntuación sobre 2–10 niveles ordenados, con probabilidad por nivel y nivel esperado).

El modelo cuenta con 4.539.265.536 parámetros (~4,5 mil millones) y un repositorio de 9,1 GB en formato safetensors. Cada pregunta se codifica como un prompt completo y, en peticiones de texto con múltiples preguntas, el motor agrupa esos prompts por longitud con un presupuesto de 65.536 tokens con padding por pasada forward. Esta orientación a "decisiones tipadas" lo posiciona como componente de enrutamiento, clasificación y verificación dentro de pipelines de agentes, más que como chatbot de propósito general.

Su relevancia actual radica en el índice público de decisión (Public Decision Index 0.3), donde obtiene 69,75 en Texto (140.178 peticiones) y 73,7495 en Visión (12.210 peticiones), superando a alternativas de la misma categoría como TypeSafe Jev 1.14, StartLux-Decision v1.1 4B y Perplexity Decider Flash v1.2. La información pública disponible sobre licencia, idiomas y detalles de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (image-text-to-text; decision-model con decisiones tipadas) |
| Parametros totales | 4.539.265.536 (~4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como ventana nominal; el motor agrupa prompts con un presupuesto de 65.536 tokens con padding por forward pass |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card indica que Sing VL S1 se construye sobre Qwen3.5 y que es un modelo multimodal de decisión (tags `decision-model`, `typed-decisions`, `multimodal`). El modelo procesa texto o JSON junto con hasta cuatro imágenes y devuelve respuestas estructuradas por pregunta: para *choice*, una probabilidad por cada candidato; para *noul*, la probabilidad de veracidad de una proposición sí/no; y para *score*, la probabilidad de cada nivel en una escala ordenada de 2 a 10, junto con el nivel esperado calculado como la suma del índice del nivel (base cero) multiplicado por su probabilidad.

El detalle técnico más destacable documentado es el motor de batching: cada pregunta se codifica como un prompt completo y, en peticiones de texto con varias preguntas, los prompts se agrupan por longitud con un presupuesto de 65.536 tokens con padding por pasada forward. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Decisión tipada sobre texto y JSON: responde a preguntas nombradas con esquemas predefinidos (`choice`, `noul`, `score`).
- Salida probabilística calibrada: probabilidad por candidato en *choice*, probabilidad de veracidad en *noul* y distribución sobre niveles más nivel esperado en *score*.
- Procesamiento multimodal: acepta hasta cuatro imágenes por petición, con orden de imágenes configurable (por ejemplo, orden azul-luego-rojo en los ejemplos de la model card).
- Preguntas múltiples por petición: el motor agrupa prompts por longitud con presupuesto de 65.536 tokens con padding.
- Evaluación en tareas de tool calling y enrutamiento: BFCL (96,81 de exactitud de caso), API-Bank (84,45), ToolRet (nDCG@10 de 67,96), When2Call MCQ (90,61).
- Clasificación de intención: BANKING77 (Macro-F1 94,00) y CLINC150+OOS (Macro-F1 97,03).
- Verificación de afirmaciones y NLI: ContractNLI (84,05), ANLI (78,29), NLI4CT (86,41), HoVer (89,25).
- Detección de alucinación en RAG: RAGTruth con F1 de clase alucinada de 83,49.
- Razonamiento y conocimiento: MMLU (82,93), ARC-Challenge (96,25), HellaSwag (96,48), BBH (88,61), GPQA Diamond (53,06).
- Matemáticas: GSM8K (73,84) y CLadder (94,72).
- Comprensión de documentos e infografías: InfographicVQA (96,31), KIE CORD+FUNSD (95,82), CharXiv (86,65).
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).

## Casos de uso

- Enrutamiento de peticiones en pipelines de agentes: usar decisiones `choice` para seleccionar la herramienta o el subagente adecuado, con probabilidad por candidato que permite aplicar umbrales de confianza y fallback; los resultados en BFCL (96,81) y API-Bank (84,45) respaldan este uso.
- Clasificación de intención en atención al cliente: decisiones `choice` sobre categorías predefinidas para dirigir tickets o conversaciones al flujo correcto, apoyándose en BANKING77 (Macro-F1 94,00) y CLINC150+OOS (Macro-F1 97,03).
- Verificación de respuestas en sistemas RAG: decisiones `noul` para comprobar si una afirmación está respaldada por el contexto recuperado, con RAGTruth (F1 de clase alucinada 83,49) y HoVer (89,25) como referencias.
- Moderación de contenido multimodal: decisión `noul` sobre memes e imágenes (Hateful Memes, 71,64 en precisión no-skill) para marcar contenido potencialmente dañino antes de la revisión humana.
- Extracción y validación de documentos: `choice` y `score` sobre imágenes de recibos, formularios e infografías (KIE 95,82, InfographicVQA 96,31) para clasificar campos y puntuar la calidad de la extracción.
- Puntuación de relevancia en búsqueda y recomendación: decisión `score` sobre 2–10 niveles para ordenar resultados, con referencias en Amazon ESCI (Macro-F1 60,74) y BRIGHT (nDCG@10 de 47,51).
- Control de calidad de datos sintéticos: `score` para puntuar pares instrucción-respuesta o ediciones (Humicroedit, 67,16) y filtrar muestras de baja calidad antes del entrenamiento.
- Selección de modelo en cascadas de inferencia: `choice` para decidir qué modelo (pequeño o grande) debe atender una consulta; la model card reporta RouterBench (79,83 de calidad seleccionada) como referencia de esta tarea.

## Benchmarks y rendimiento

Resultados del Public Decision Index 0.3 reportados en la model card (índices agregados y comparativa entre modelos):

| Panel | Sing VL S1 | TypeSafe Jev 1.14 | StartLux-Decision v1.1 4B | Perplexity Decider Flash v1.2 (4B) |
| :---: | ---: | ---: | ---: | ---: |
| Text | 69,76 | 60,70 | 67,8 | 60,1 |
| Vision | 73,75 | — | 67,90 | 72,5 |

Desglose de Visión (11 datasets; ejecución histórica con presupuesto de imagen mayor, índice 73,94; la ejecución enviada con tope de 1.638.400 píxeles obtiene 73,7495):

| Dataset | Non-Skill (Accuracy) | Skill |
| --- | ---: | ---: |
| CV-Bench | 87,34 | 79,12 |
| BLINK | 72,11 | 56,83 |
| RealWorldQA | 82,17 | 70,87 |
| CharXiv | 86,65 | 82,21 |
| InfographicVQA | 96,31 | 95,08 |
| Mind2Web | 87,67 | 83,56 |
| Winoground | 93,12 | 86,25 |
| KIE (CORD+FUNSD) | 95,82 | 93,12 |
| Moderation (Hateful Memes) | 71,64 | 43,28 |
| R-Bench-M | 49,77 | 39,72 |
| MMMU-Pro vision | 50,17 | 42,85 |
| Public Vision Index | — | 73,94 |

Desglose de Texto (43 datasets; se muestran los valores Non-Skill y Skill más relevantes):

| Dataset | Metrica original | Non-Skill | Skill |
| --- | --- | ---: | ---: |
| BFCL | Exactitud de caso | 96,81 | 95,70 |
| ToolRet | nDCG@10 | 67,96 | 63,00 |
| API-Bank | Accuracy | 84,45 | 84,15 |
| BANKING77 | Macro-F1 | 94,00 | 93,92 |
| CLINC150+OOS | Macro-F1 | 97,03 | 97,01 |
| RouterBench † | Calidad seleccionada | 79,83 | 52,71 |
| ContractNLI | Macro-F1 | 84,05 | 76,94 |
| ANLI | Macro-F1 | 78,29 | 67,48 |
| MMLU † | Accuracy | 82,93 | 77,24 |
| GPQA Diamond | Accuracy | 53,06 | 37,41 |
| ARC-Challenge † | Accuracy | 96,25 | 95,00 |
| HellaSwag | Accuracy | 96,48 | 95,31 |
| GSM8K | Accuracy | 73,84 | 68,68 |
| MuSR | Accuracy | 65,82 | 45,66 |
| BRIGHT | nDCG@10 | 47,51 | 40,62 |
| Amazon ESCI | Macro-F1 | 60,74 | 50,75 |
| FinEntity | Macro-F1 | 95,19 | 92,93 |
| NLI4CT | Macro-F1 | 86,41 | 73,56 |
| CRUXEval | Accuracy | 78,07 | 65,21 |
| CLadder | Accuracy | 94,72 | 89,44 |
| HLE | Accuracy | 12,77 | 0,00 |
| MMLU-Pro | Accuracy | 68,40 | 64,46 |
| BBH | Accuracy | 88,61 | 83,49 |
| RAGTruth | F1 de clase alucinada | 83,49 | 65,77 |
| HoVer | Accuracy | 89,25 | 78,50 |
| When2Call MCQ | Accuracy | 90,61 | 87,48 |
| Public Text Index | Agregado ponderado | 77,26 | 69,76 |

† La model card indica que el Decision Index reporta estos datasets por separado y los excluye del Text Index.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 4,539 mil millones de parámetros, la inferencia en precisión nativa (bf16/fp16) requiere aproximadamente 9 GB solo para pesos, más overhead de activaciones y del procesador de imágenes; en cuantización de 8 bits se situaría en torno a 4,5–5 GB y en 4 bits en torno a 2,5–3 GB, aunque estas cifras son estimaciones de referencia y no datos publicados por el autor.
- GPU recomendadas: no disponible. No se documentan GPU concretas (A100, H100, RTX 4090) en la model card.
- Compatibilidad con GPU de consumo: no disponible como dato oficial; por tamaño de pesos, un checkpoint bf16 completo no cabría en GPU de 8 GB, pero sí en GPUs de 12–16 GB o superiores, y las variantes cuantizadas podrían caber en GPUs de 8 GB.
- Opciones de despliegue: la model card documenta exclusivamente el uso mediante la librería `transformers` con Python 3.12, PyTorch y torchvision compatibles con el hardware, ejecutando los ejemplos desde el directorio `inference/` del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El único dato de rendimiento publicado es el batching por longitud con presupuesto de 65.536 tokens con padding por forward pass en peticiones de texto multi-pregunta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Public Text Index | Public Vision Index | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Sing VL S1 4B | 4,539 B | Presupuesto de 65.536 tokens con padding por forward pass | 69,76 | 73,75 | no disponible | Hugging Face (inclusionAI/SingVL_S1_4B) |
| TypeSafe Jev 1.14 | no disponible | no disponible | 60,70 | — | no disponible | mencionado en la model card; disponibilidad pública no confirmada |
| StartLux-Decision v1.1 4B | ~4 B (según nombre) | no disponible | 67,8 | 67,90 | no disponible | mencionado en la model card; disponibilidad pública no confirmada |
| Perplexity Decider Flash v1.2 (4B) | ~4 B (según nombre) | no disponible | 60,1 | 72,5 | no disponible | mencionado en la model card; disponibilidad pública no confirmada |

Los tres comparadores pertenecen a la misma categoría de modelos de decisión y sus cifras proceden del Public Decision Index 0.3 reportado por el autor de Sing VL S1; no se dispone de verificación independiente de esos resultados ni de sus especificaciones técnicas completas.

## Limitaciones y advertencias

- No es un modelo generativo de texto libre: solo responde a preguntas nombradas con esquemas `choice`, `noul` o `score`; no puede usarse como chatbot conversacional general.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar los términos antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe fuera del inglés, y varios benchmarks del índice (iSarcasmEval, New Yorker caption matching) están etiquetados como ingleses.
- Riesgo de alucinación: aunque obtiene 83,49 de F1 en la clase alucinada de RAGTruth, en configuraciones con skill baja a 65,77; en tareas de conocimiento profundo el rendimiento cae (HLE 12,77, GPQA Diamond 53,06), lo que limita su uso como verificador de hechos complejos.
- Sesgos conocidos: no documentados en la información disponible. Los resultados en moderación (Hateful Memes 71,64 en no-skill frente a 43,28 en skill) sugieren sensibilidad a la formulación de la pregunta, no sesgos de contenido documentados.
- Dependencia de la formulación del prompt: la brecha entre métricas Non-Skill y Skill es grande en varios datasets (SGD/SGD-X 8,33 frente a 0,00; Humicroedit 67,16 frente a 34,32; cfcolor 70,14 frente a 44,04), lo que indica fragilidad ante cambios en el formato de las preguntas.
- Cobertura de imagen limitada: la ejecución enviada usa un tope de 1.638.400 píxeles; con presupuestos mayores el índice histórico sube a 73,94, pero el resultado oficial es 73,7495.
- Resultados en tareas de razonamiento abstracto débiles: ChessBench 26,88, SimpleBench 50,00 y SATA-Bench 53,88.
- Dependencia de código de inferencia propio: los ejemplos requieren ejecutar desde el directorio `inference/` del repositorio con Python 3.12 y builds de PyTorch/torchvision compatibles; no se documentan integraciones con servidores de inferencia estándar.
- Fecha de creación del repositorio (2026-11-11) y actualización (2026-11-18): verificar la vigencia de los resultados y posibles revisiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/SingVL_S1_4B
- Resultados de visión fijados (vision-scores.json): https://huggingface.co/datasets/echoxvf/SingVL_S1_4B-DI-results/blob/90ec7e159da6fa21d762f1f75876ea79049d0f4a/runs/singvl-s1-4b-vision/vision-scores.json
- Paper: no disponible en la información proporcionada
- Blog: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada (la model card menciona un directorio `inference/` dentro del repositorio del modelo)
- Demo: no disponible en la información proporcionada
