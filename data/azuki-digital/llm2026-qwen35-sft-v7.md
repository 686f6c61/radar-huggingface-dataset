# azuki-digital/llm2026-qwen35-sft-v7

## Resumen

llm2026-qwen35-sft-v7 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por azuki-digital como trabajo final del curso "LLM講座2 2026". El modelo parte de la arquitectura original de Qwen3.5-0.8B y aplica un entrenamiento LoRA posteriormente fusionado con los pesos base, por lo que la estructura resultante es idéntica a la del modelo original. Con 873.438.784 parámetros totales, se posiciona como un modelo compacto orientado a tareas de comprensión lectora y respuesta a preguntas sobre documentación en japonés.

El problema que aborda es específico: el modelo ha sido entrenado para resolver preguntas que requieren razonamiento sobre resultados de un pipeline de recuperación (BM25 más los modelos de embeddings y reranking ruri-v3 de cl-nagoya). Además de responder preguntas, aprende una tarea auxiliar de selección del siguiente artículo a consultar dentro de un proceso de búsqueda multi-hop. Esto lo hace relevante para experimentos de RAG (retrieval-augmented generation) en japonés, aunque su alcance es deliberadamente limitado y académico.

Su relevancia actual es acotada: se trata de un modelo de 0,8 mil millones de parámetros, con licencia Apache-2.0, publicado sin descargas ni interacciones en el momento de la consulta, y entrenado exclusivamente sobre datos en japonés. No está pensado como un modelo de propósito general, sino como un artefacto didáctico que demuestra un flujo completo de ajuste fino con LoRA sobre un modelo base pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; la model card indica que la estructura es idéntica al modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-0.8B original; el autor declara explícitamente que la estructura es la misma que la del modelo base y que el ajuste se realizó mediante LoRA, cuyos pesos se fusionaron posteriormente con los pesos originales. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo describe el proceso de construcción de los datos.

Los datos de entrenamiento provienen de tres fuentes principales: JEMHopQA, JSQuAD (de JGLUE) y cl-nagoya/auto-wiki-qa, todas ellas bajo licencia CC BY-SA 4.0, además de un conjunto de chunks derivados de Wikipedia en japonés. El proceso de filtrado es mecánico: las preguntas se pasan por un pipeline de recuperación compuesto por BM25, el modelo de embeddings cl-nagoya/ruri-v3-310m y el reranker cl-nagoya/ruri-v3-reranker-310m, y solo se conservan los problemas cuyo chunk de contexto contiene la cadena de respuesta. A partir de los mismos datos se generó una tarea auxiliar de selección del siguiente artículo a consultar, y se incluyeron preguntas de dos saltos (2-hop) construidas mediante reglas a partir de auto-wiki-qa.

## Capacidades

- Generación de respuestas a preguntas en japonés fundamentadas en contextos recuperados por un pipeline de búsqueda.
- Comprensión lectora sobre documentación: el modelo fue entrenado con pares pregunta-contexto donde el contexto contiene la respuesta.
- Selección del siguiente paso en un proceso de búsqueda multi-hop: dada una pregunta y los resultados de recuperación, elegir el siguiente artículo candidato a consultar.
- Razonamiento de dos saltos sobre preguntas compuestas construidas a partir de auto-wiki-qa.
- No se documenta soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingüe limitada al japonés según el campo `language` de la model card.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia en japonés en un sistema RAG: el modelo recibe la pregunta del usuario junto con los chunks recuperados por BM25 y ruri-v3, y genera la respuesta extrayendo y sintetizando la información del contexto. Es adecuado porque fue entrenado exactamente con ese formato de entrada.
- Evaluación de pipelines de recuperación: al estar entrenado solo con ejemplos donde el contexto contiene la respuesta, sirve como componente de un banco de pruebas para medir si un cambio en el retriever o el reranker mejora la calidad final de las respuestas.
- Navegación multi-hop en bases documentales: la tarea auxiliar de selección del siguiente artículo permite integrar el modelo como planificador de consultas sucesivas en un agente de búsqueda sobre corpus japoneses.
- Prototipado académico y docencia: su tamaño de 0,8 B parámetros y licencia Apache-2.0 lo hacen apropiado para experimentos de ajuste fino en entornos con recursos limitados, como cursos o trabajos de fin de máster.
- Extracción de respuestas en dominios con documentación estructurada en japonés, como manuales internos o bases de conocimiento, siempre que se le proporcione el contexto recuperado.
- Filtrado y validación de datasets de QA: puede usarse para comprobar de forma automática si un par pregunta-contexto contiene la respuesta esperada, replicando el criterio con el que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en FP16 se requieren aproximadamente 1,7 GB solo para los pesos; en BF16 o FP16 con overhead de activaciones y caché KV, un entorno de 4-6 GB de VRAM es suficiente para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. Las GPU de datacenter permiten mayor paralelización y throughput, pero no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM en precisión completa; con cuantización a 8 bits o 4 bits cabría en GPUs de 4 GB, aunque no se publican pesos cuantizados oficiales.
- Opciones de despliegue: al publicarse únicamente en safetensors, es compatible con frameworks que carguen pesos de Hugging Face Transformers, como vLLM, TGI o Text Generation Inference. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm2026-qwen35-sft-v7 | 873.438.784 | no disponible | ja | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en la informacion | no disponible en la informacion | apache-2.0 | Hugging Face |
| Otros ajustes SFT de Qwen3.5-0.8B para japonés | no disponible | no disponible | ja | variable | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El modelo base Qwen3.5-0.8B es la referencia natural, del que este ajuste hereda arquitectura y licencia, pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre datos en japonés y su campo `language` declara solo `ja`; el rendimiento en otros idiomas no está garantizado.
- El entrenamiento se limita a tareas de QA sobre contextos recuperados y selección de artículos; no se documenta capacidad de conversación general, código, matemáticas ni instrucciones abiertas.
- Riesgo de alucinación: al ser un modelo pequeño ajustado con SFT, puede generar respuestas plausibles pero no fundamentadas cuando el contexto no contiene la información, especialmente fuera del dominio de Wikipedia japonesa.
- Sesgos conocidos: no se documentan análisis de sesgo; al derivar de Wikipedia y datasets de QA en japonés, puede heredar los sesgos de esas fuentes.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, pero los datos de entrenamiento (JEMHopQA, JSQuAD, auto-wiki-qa y chunks de Wikipedia) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir igual si se redistribuyen derivados de esos datos.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en escenarios con documentos largos.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en producción ni validación externa.
- No se publican pesos cuantizados ni instrucciones de conversión a GGUF, lo que limita su despliegue en entornos de inferencia en CPU o en hardware de consumo muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azuki-digital/llm2026-qwen35-sft-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JSQuAD (JGLUE): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Modelo de embeddings ruri-v3-310m: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Modelo reranker ruri-v3-reranker-310m: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
