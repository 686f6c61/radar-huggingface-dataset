# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen014

## Resumen

`Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen014` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-0.8B` de Alibaba Cloud, desarrollado por el usuario Ch1c4g0 para el trabajo final del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa. El modelo está especializado en generación de respuestas para sistemas RAG (Retrieval-Augmented Generation) sobre Wikipedia en japonés: recibe una pregunta y cinco fragmentos de contexto recuperados, y devuelve un JSON con la respuesta y el identificador del fragmento que la respalda.

Técnicamente se trata de un transformer decoder-only de aproximadamente 873 millones de parámetros (0,8B), sobre el que se aplicó un LoRA (r=16, alpha=32, dropout=0,05) en todas las capas lineales del modelo de lenguaje durante 3 épocas, fusionando después los pesos adaptados con los originales. El resultado conserva exactamente la arquitectura, el tokenizador, la plantilla de chat y el contexto del modelo base, pero incorpora la capacidad específica de responder con citación de fuente en formato JSON.

Su relevancia es acotada pero clara: demuestra un flujo completo de ajuste fino de bajo coste (todo el entrenamiento se realizó en Google Colab, sin APIs externas ni otros LLM) para una tarea concreta de question answering con atribución de evidencia, un patrón cada vez más demandado en pipelines RAG en producción. Está publicado bajo licencia Apache 2.0 y solo declara soporte para japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con LoRA fusionado en las capas lineales |
| Parámetros totales | 873.438.784 (~0,87B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-0.8B) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y conserva íntegramente su arquitectura, configuración, tokenizador, plantilla de chat y nombres, formas y tipos de los tensores. Sobre esa base se aplicó un LoRA con rango 16, alpha 32 y dropout 0,05 en las capas lineales `down_proj`, `gate_proj`, `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj` y `v_proj`, durante 3 épocas. Los deltas aprendidos se fusionaron posteriormente en los pesos originales ("peso original + delta LoRA"), de modo que el artefacto publicado es un modelo denso estándar sin adaptadores separados.

El entrenamiento se realizó íntegramente en Google Colab, sin uso de APIs externas ni de otros LLM. La tarea aprendida es: dada una pregunta y cinco documentos recuperados, emitir `{"answer": ..., "chunk_id": ...}`. El conjunto de entrenamiento (1.500 ejemplos) se construyó a partir de cuatro fuentes: JEMHopQA train v1.2 (preguntas y respuestas, filtradas para eliminar aquellas sin evidencia en los documentos recuperados), 1.000 preguntas muestreadas de JSQuAD train v1.3 (JGLUE), 894 preguntas multi-salto derivadas de `auto-wiki-qa` mediante reglas de sustitución de cadenas entre artículos, y los fragmentos de Wikipedia japonesa del dataset de la competición `bumbuboon/llm-course-final-2026` usados como contexto de recuperación. Todas las fuentes de datos son CC BY-SA 4.0; no se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de respuestas extractivas y abstractivas en japonés a partir de contexto recuperado.
- Question answering con atribución de evidencia: devuelve el `chunk_id` del documento que respalda la respuesta.
- Salida estructurada en JSON con las claves `answer` y `chunk_id`.
- Razonamiento multi-salto limitado: parte del entrenamiento incluye preguntas que requieren encadenar dos artículos de Wikipedia.
- Filtrado implícito de preguntas sin respuesta en el contexto (el dataset de entrenamiento excluyó ejemplos sin evidencia).
- Integración en pipelines RAG como generador final tras la fase de retrieval.
- Soporte multilingüe: no disponible más allá del japonés declarado.
- Tool calling / function calling: no disponible (no documentado).
- Modo thinking, visión o audio: no disponible (no documentado).

## Casos de uso

- Generación de respuestas en sistemas RAG sobre Wikipedia japonesa: el modelo recibe la pregunta y los cinco fragmentos recuperados y devuelve la respuesta junto al identificador del fragmento fuente, lo que permite mostrar citas verificables al usuario final.
- Asistentes de búsqueda documental con atribución: en entornos donde es obligatorio indicar de qué documento procede cada afirmación, el campo `chunk_id` de la salida permite enlazar directamente al pasaje original.
- Question answering multi-salto en bases de conocimiento enciclopédicas: el ajuste con preguntas derivadas de `auto-wiki-qa` entrena al modelo para responder cuestiones que requieren combinar información de dos artículos distintos.
- Evaluación y benchmarking de pipelines RAG: al ser un modelo pequeño y de licencia permisiva, sirve como generador de referencia de bajo coste para comparar estrategias de recuperación (número de chunks, reranking, etc.).
- Prototipado rápido en local: con menos de 1B de parámetros y pesos en safetensors, puede desplegarse en una sola GPU de consumo para iterar sobre prompts y plantillas de contexto sin coste de API.
- Filtrado de preguntas no respondibles: al haber sido entrenado excluyendo preguntas sin evidencia en el contexto, puede emplearse para detectar cuándo la recuperación ha fallado y derivar a un humano o reformular la consulta.
- Educación e investigación en ajuste fino: el modelo documenta de forma reproducible un flujo LoRA completo en Colab, útil como referencia para cursos y experimentos de fine-tuning de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, en torno a 0,5 GB (no documentado por el autor, estimación a partir del número de parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe holgadamente en GPU de consumo: sí, en tarjetas como GTX 1660 Super (6 GB), RTX 3050, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; conversión a GGUF para llama.cpp u Ollama; vLLM y TGI para servir en producción; el autor no documenta ninguna de estas integraciones explícitamente.
- Latencia y throughput estimados: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen014 | ~0,87B | no disponible | QA con citación en japonés (RAG) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Modelo generalista multilingüe | Apache 2.0 | Hugging Face |
| Modelos QA japoneses de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: este ajuste hereda su arquitectura y licencia, pero sustituye la generación libre por una salida JSON con atribución de evidencia, a costa de perder generalidad y de restringirse al japonés. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para la tarea de QA con cinco documentos de contexto y salida JSON; su uso fuera de ese formato puede degradar gravemente la calidad.
- Idioma: solo declara soporte para japonés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos: los datos de entrenamiento provienen de Wikipedia japonesa, JEMHopQA, JSQuAD y auto-wiki-qa, por lo que hereda los sesgos de cobertura y sesgo editorial de esas fuentes.
- Riesgo de alucinación: aunque el entrenamiento excluyó preguntas sin evidencia, el modelo puede generar respuestas no respaldadas por los fragmentos o citar un `chunk_id` incorrecto; conviene validar la atribución en producción.
- Contexto: la longitud máxima de contexto no está documentada; superar el límite del modelo base puede truncar la entrada o producir respuestas incoherentes.
- Licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un despliegue comercial.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado el mismo día y no incluye evaluación publicada; no debe considerarse listo para producción sin validación propia.
- Reproducibilidad: el autor no publica hiperparámetros completos (tasa de aprendizaje, batch size, semilla) ni scripts de entrenamiento, solo la descripción del proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen014
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset de la competición: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
