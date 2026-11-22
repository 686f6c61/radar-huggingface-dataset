# azuki-digital/llm2026-qwen35-sft-v1

## Resumen

`llm2026-qwen35-sft-v1` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario azuki-digital en el contexto del curso «LLM講座2 2026». Se trata de un modelo de 873 millones de parámetros (0,8B) entrenado mediante LoRA sobre el modelo original y posteriormente fusionado en los pesos base, de modo que la arquitectura resultante es idéntica a la del modelo Qwen3.5-0.8B original.

El modelo está especializado en tareas de question answering sobre documentación en japonés, concretamente en escenarios de recuperación aumentada (RAG): el conjunto de entrenamiento se construyó pasando preguntas de varios corpus japoneses por un pipeline de búsqueda (BM25 + embeddings `ruri-v3-310m` + reranker `ruri-v3-310m`) y conservando únicamente los ejemplos en los que el chunk recuperado contenía la respuesta correcta. Por tanto, el modelo está afinado para responder preguntas a partir de contexto documental en japonés.

Es relevante como ejemplo de modelo pequeño y ligero (menos de 1B de parámetros, 1,8 GB en safetensors) orientado a un dominio concreto y a un único idioma, con licencia Apache-2.0, lo que facilita su despliegue en entornos con recursos limitados. No obstante, se trata de un artefacto académico con cero descargas y cero «likes» en el momento de la consulta, sin benchmarks publicados ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; no se detalla en la model card) |
| Parámetros totales | 873.438.784 (0,87B) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica explícitamente que la estructura del modelo es idéntica a la del modelo base `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`, Apache-2.0): se aplicó un ajuste fino con LoRA y posteriormente se fusionaron los adaptadores en los pesos originales. No se especifican en la documentación disponible detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni innovaciones arquitectónicas del modelo base.

El entrenamiento se realizó sobre datos derivados de cuatro fuentes en japonés: JEMHopQA, JSQuAD (JGLUE), `cl-nagoya/auto-wiki-qa` y un conjunto de chunks procedentes de Wikipedia en japonés. El proceso de curación consistió en pasar las preguntas por un pipeline de recuperación (BM25, `cl-nagoya/ruri-v3-310m` como modelo de embeddings y `cl-nagoya/ruri-v3-reranker-310m` como reranker) y retener mecánicamente solo aquellos ejemplos en los que el chunk recuperado contenía la cadena de respuesta. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros de LoRA ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas en japonés a partir de contexto documental (orientación RAG).
- Extracción de respuestas a partir de pasajes recuperados, gracias al entrenamiento sobre ejemplos filtrados por presencia de la respuesta en el chunk.
- Manejo de preguntas de tipo multi-hop y de comprensión lectora, derivadas de JEMHopQA y JSQuAD.
- Cobertura de temática enciclopédica en japonés por el uso de `auto-wiki-qa` y chunks de Wikipedia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según el campo `language: ja`.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- **Sistemas RAG sobre documentación interna en japonés**: el modelo está entrenado específicamente para responder a partir de chunks recuperados, por lo que encaja como generador final en un pipeline de recuperación (BM25 + embeddings + reranker) para bases de conocimiento corporativas en japonés.
- **Búsqueda de respuestas en Wikipedia japonesa**: dado que parte del entrenamiento proviene de chunks de Wikipedia en japonés y de `auto-wiki-qa`, puede emplearse para responder preguntas enciclopédicas a partir de pasajes de Wikipedia recuperados en tiempo de inferencia.
- **Asistentes de atención al cliente en japonés con base documental**: con menos de 1B de parámetros y 1,8 GB de pesos, puede desplegarse en infraestructura modesta para responder consultas frecuentes ancladas a manuales o FAQ recuperados.
- **Prototipado académico y docencia**: su tamaño reducido y licencia Apache-2.0 lo hacen adecuado como material de prácticas en cursos de LLM (es precisamente el contexto en el que se creó), para experimentar con pipelines RAG de extremo a extremo.
- **Evaluación de pipelines de recuperación**: al haber sido entrenado con ejemplos filtrados por la calidad de la recuperación, sirve para medir de forma indirecta el impacto del retriever y del reranker en la calidad de la respuesta final.
- **Despliegue en el borde o en CPU**: con 0,87B de parámetros, es viable ejecutarlo en entornos sin GPU dedicada o en GPUs de consumo, para tareas de QA en japonés con baja concurrencia.
- **Generación de respuestas extractivas sobre JEMHopQA/JSQuAD**: útil para tareas de comprensión lectora y QA multi-hop en japonés en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Como referencia orientativa por tamaño (0,87B de parámetros), en FP16 serían necesarios aproximadamente 1,8 GB solo para los pesos, más overhead de memoria KV; en cuantizaciones de 8 o 4 bits el peso se reduciría a alrededor de 0,9 GB y 0,5 GB respectivamente (estimaciones por tamaño, no publicadas por el autor).
- **GPU recomendadas**: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría alojar el modelo en precisión reducida.
- **GPU de consumo**: por el número de parámetros, es plausible que quepa en GPUs de consumo tipo RTX 3060/4060 o superiores, aunque el autor no lo documenta.
- **Opciones de despliegue**: no disponible. Solo se publican pesos en safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI ni variantes GGUF.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `azuki-digital/llm2026-qwen35-sft-v1` | 0,87B | no disponible | ja | Apache-2.0 | SFT con LoRA fusionado sobre Qwen3.5-0.8B; especializado en QA documental en japonés |
| `Qwen/Qwen3.5-0.8B` (modelo base) | 0,8B | no disponible | no disponible | Apache-2.0 | Modelo generalista sin el ajuste específico de QA en japonés |
| Otros modelos pequeños para QA en japonés | no disponible | no disponible | ja | no disponible | No se dispone de datos de comparación en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible, ya que no se han publicado benchmarks del modelo ni se han identificado en la información proporcionada modelos comparables con datos verificables.

## Limitaciones y advertencias

- **Idioma restringido**: el modelo declara únicamente japonés (`language: ja`); su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Especialización estrecha**: el entrenamiento se limita a QA sobre pasajes recuperados; puede degradarse en tareas generativas abiertas, código, matemáticas o diálogo general.
- **Riesgo de alucinación**: como todo modelo generativo de pequeño tamaño, puede producir respuestas plausibles pero incorrectas, especialmente si el contexto recuperado no contiene la respuesta.
- **Dependencia del pipeline de recuperación**: al haberse entrenado con ejemplos filtrados por un retriever y reranker concretos (BM25 + ruri-v3-310m + ruri-v3-reranker-310m), su comportamiento puede no transferir bien a otros pipelines de recuperación.
- **Sesgos**: no documentados por el autor; los corpus de origen (Wikipedia, JGLUE, JEMHopQA) pueden introducir sesgos propios de sus fuentes.
- **Licencia**: Apache-2.0 permite uso comercial, pero los datos de entrenamiento derivan de fuentes con licencia CC BY-SA 4.0 (JEMHopQA, JSQuAD, auto-wiki-qa, Wikipedia), lo que conviene revisar antes de un uso comercial de los pesos resultantes.
- **Madurez**: modelo con cero descargas y cero «likes» en el momento de la consulta, sin benchmarks ni pipeline declarado; no recomendable para producción sin una evaluación propia previa.
- **Contexto**: la longitud de contexto no está documentada, lo que impide planificar su uso con documentos largos sin verificarla empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/azuki-digital/llm2026-qwen35-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD (JGLUE): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Modelo de embeddings ruri-v3-310m: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Reranker ruri-v3-reranker-310m: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
