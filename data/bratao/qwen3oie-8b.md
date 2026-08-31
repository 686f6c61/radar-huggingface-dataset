# bratao/Qwen3OIE-8B

## Resumen

Qwen3OIE-8B es un modelo de extracción de información abierta (Open Information Extraction, OpenIE) en portugués, desarrollado por Bruno Souza Cabral en el marco de su tesis doctoral en la Universidade Federal da Bahia. Se trata de un fine-tuning del modelo base Qwen/Qwen3-8B, un transformer causal decoder-only de 8.190 millones de parámetros, especializado en generar extracciones binarias abstractivas en formato JSON con los campos `ARG0`, `V` y `ARG1`. El modelo resuelve el problema de extraer relaciones semánticas de frases en portugués sin depender de esquemas predefinidos, produciendo tripletas que pueden no ser subcadenas literales del texto original.

Su relevancia radica en que es uno de los pocos modelos públicos de OpenIE abstractiva para portugués, un idioma con escasos recursos en esta tarea. El entrenamiento se realizó sobre 29.026 frases portuguesas y 102.788 extracciones sintéticas generadas con Gemini 2.5 Flash a partir de 2.015 párrafos de Wikipedia. El modelo obtuvo un F1 de coincidencia léxica de 0,5612 en la evaluación de la tesis, siendo el mejor resultado reportado en ese estudio. La licencia Apache-2.0 y el tamaño de 8B lo hacen accesible para investigación y despliegue en entornos con GPUs de gama alta o mediante cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (configuración base); 2.048 tokens usados en fine-tuning, contextos mayores no evaluados para OpenIE |
| Tipos de cuantizacion | bfloat16 (oficial); GGUF de terceros disponible (mradermacher) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 (con términos adicionales de Qwen base) |
| Formato de pesos | safetensors (bfloat16); GGUF de terceros |

## Arquitectura y entrenamiento

Qwen3OIE-8B es un fine-tuning supervisado del modelo Qwen3-8B, un transformer causal decoder-only con atención completa y 8.190 millones de parámetros. La arquitectura base incluye soporte nativo de chat y un modo de razonamiento opcional, aunque el fine-tuning para OpenIE se realizó con el modo de pensamiento desactivado (`enable_thinking=False`). El entrenamiento se llevó a cabo durante 2 epochs sobre 29.026 frases en portugués y 102.788 extracciones sintéticas de OpenIE, generadas con Gemini 2.5 Flash a partir de 2.015 párrafos de Wikipedia en portugués. El dataset no está publicado ni declarado en Hugging Face.

El proceso de entrenamiento utilizó una longitud de secuencia de 2.048 tokens. El `trainer_state.json` publicado registra el paso 1.572 de un total nominal de 2.358 pasos para tres epochs, lo que sugiere que el entrenamiento pudo haberse interrumpido antes de completarse. El repositorio no contiene suficiente evidencia para resolver esta ambigüedad, por lo que el modelo debe tratarse como un checkpoint de investigación y fijarse una revisión concreta en trabajos reproducibles. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Extracción de información abierta abstractiva en portugués: genera una o más tripletas binarias en JSON con los campos `ARG0`, `V` y `ARG1` a partir de una frase dada.
- Generación de texto conversacional: hereda la capacidad de chat del modelo base Qwen3-8B, aunque el fine-tuning se centra en la tarea de OpenIE.
- Formato estructurado de salida: produce extracciones en JSON siguiendo el esquema solicitado en el prompt de sistema.
- Compatibilidad con el ecosistema Transformers: se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` estándar.
- Integración con la librería `portuguese-openie`: ofrece una API de alto nivel para extraer tripletas sin necesidad de gestionar el prompt manualmente.
- Soporte de cuantización de terceros: existen artefactos GGUF generados por la comunidad para despliegue en entornos con menos recursos.

## Casos de uso

- Construcción de bases de conocimiento a partir de textos en portugués: el modelo puede procesar párrafos enciclopédicos o técnicos y extraer relaciones binarias que alimenten un grafo de conocimiento. Es adecuado porque produce tripletas normalizadas en JSON, listas para insertar en una base de datos de grafos.
- Análisis de documentos académicos y científicos: investigadores pueden extraer automáticamente las afirmaciones principales de artículos en portugués, facilitando la revisión sistemática de literatura. La capacidad abstractiva permite capturar relaciones que no aparecen literalmente en el texto.
- Automatización de tareas de procesamiento del lenguaje natural en portugués: integración en pipelines de NLP que requieran extracción de relaciones, como sistemas de respuesta a preguntas o resumen estructurado.
- Asistencia a la investigación en lingüística computacional: el modelo sirve como herramienta para anotar corpus con tripletas semánticas, reduciendo el esfuerzo manual de anotación. Su salida JSON facilita la validación y corrección posterior.
- Enriquecimiento de sistemas de recuperación de información: las tripletas extraídas pueden indexarse para mejorar la búsqueda semántica en colecciones de documentos en portugués, permitiendo consultas basadas en relaciones.
- Generación de datos de entrenamiento para otros modelos: las extracciones del modelo pueden usarse como pseudo-etiquetas para entrenar modelos más pequeños o especializados en OpenIE, siempre que se valide la calidad con una muestra manual.

## Benchmarks y rendimiento

La evaluación reportada en la tesis doctoral se realizó sobre 100 frases en portugués y 238 extracciones de referencia del conjunto WikiPUD-Portuguese-Abstractive. Este conjunto es de estándar plata (silver-standard), ya que las referencias fueron generadas con un LLM y revisadas manualmente de forma parcial. No se han publicado comparaciones con otros modelos de OpenIE en portugués.

| Criterio | Precision | Recall | F1 |
|---|---:|---:|---:|
| Coincidencia perfecta | 0.3412 | 0.3025 | 0.3207 |
| Coincidencia léxica | 0.5972 | 0.5294 | 0.5612 |

La coincidencia perfecta exige que la tripleta generada coincida exactamente con la referencia; la coincidencia léxica otorga crédito parcial por solapamiento de tokens. No hay datos de benchmarks estándar como MMLU, HumanEval o GSM8K para este fine-tuning, ya que la evaluación se centra exclusivamente en la tarea de OpenIE.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB o más para inferencia sin cuantizar en bfloat16 (el repositorio pesa 16,4 GB, más overhead de activaciones).
- GPU recomendadas: NVIDIA A100 40 GB, RTX 4090 24 GB, L40S, o GPUs profesionales con al menos 24 GB de VRAM para ejecución cómoda.
- En GPUs de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) sin cuantizar; con cuantización GGUF de 4 bits podría ejecutarse en GPUs de 12-16 GB, aunque la calidad de extracción no ha sido re-evaluada tras la cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp (con GGUF), Ollama (si se convierte), y FriendliAI (ofrece endpoint de inferencia gestionado para este modelo).
- Latencia y throughput: no disponibles en la información publicada. Como referencia, el modelo base Qwen3-8B tiene una velocidad de generación típica de 20-40 tokens/s en una A100, pero no hay datos específicos de este fine-tuning.

## Comparativa con modelos similares

No se han encontrado modelos comparables de OpenIE abstractiva específicamente entrenados para portugués con el mismo enfoque y tamaño. La comparativa con el modelo base Qwen3-8B es la siguiente:

| Modelo | Parámetros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| Qwen3OIE-8B | 8,19B | 32.768 tokens (base) | OpenIE abstractiva en portugués | Apache-2.0 |
| Qwen3-8B | 8,19B | 32.768 tokens | Generación de texto general y razonamiento | Apache-2.0 |
| otros modelos OpenIE para portugués | no disponible | no disponible | no disponible | no disponible |

El modelo se distingue del base por su especialización en la tarea de OpenIE, pero hereda las capacidades generales de generación de texto de Qwen3-8B. No se dispone de información sobre alternativas comerciales o de código abierto con el mismo propósito y idioma.

## Limitaciones y advertencias

- La salida generativa puede omitir, duplicar o alucinar relaciones, y puede no respetar el esquema JSON solicitado en algunos casos.
- Los campos abstractivos (`ARG0`, `V`, `ARG1`) no son necesariamente subcadenas literales de la frase original, lo que dificulta la verificación automática.
- El conjunto de evaluación es pequeño (100 frases) y mayoritariamente enciclopédico; el rendimiento en portugués dialectal, conversacional, especializado, con textos largos o adversarios es desconocido.
- El estado de publicación no establece con certeza que el entrenamiento se completara (el `trainer_state.json` registra 1.572 de 2.358 pasos nominales); se recomienda fijar la revisión `5327c23f603944851f94df9cf0b3580dcf70de19` en trabajos reproducibles.
- Las extracciones del modelo no deben usarse como verificación de hechos ni como única fuente para decisiones de alto impacto.
- La licencia Apache-2.0 se aplica al repositorio, pero los usuarios deben cumplir también los términos del modelo base Qwen3-8B y las restricciones aplicables a sus propios datos de entrada.
- El dataset de entrenamiento no está incluido ni publicado, lo que limita la reproducibilidad completa del fine-tuning.
- No hay cuantizaciones oficiales; las versiones GGUF de terceros no han sido evaluadas para la tarea de OpenIE y podrían degradar la calidad de las extracciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bratao/Qwen3OIE-8B
- Página de despliegue en FriendliAI: https://friendli.ai/models/bratao/Qwen3OIE-8B
- Artefacto GGUF de terceros (mradermacher): https://alphaneural.io/assets/mradermacher/Qwen3OIE-8B-GGUF
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Tesis doctoral asociada: Cabral, Bruno Souza. "Evolving Open Information Extraction for Portuguese employing Language Models", Universidade Federal da Bahia, 2025 (referencia citada en la model card; no se ha encontrado un enlace directo).
