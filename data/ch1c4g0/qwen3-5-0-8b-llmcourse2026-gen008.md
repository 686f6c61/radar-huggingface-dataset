# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen008

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen008 es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-0.8B de Alibaba Cloud, desarrollado por el usuario Ch1c4g0 como entrega final del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en generación de respuestas para un sistema RAG (Retrieval-Augmented Generation) sobre Wikipedia en japonés: recibe una pregunta junto con cinco fragmentos de documentación recuperados y devuelve un JSON con la respuesta y el identificador del fragmento que la sustenta.

Técnicamente se trata de un modelo transformer de 873.438.784 parámetros (aproximadamente 0,87 mil millones) obtenido mediante LoRA con r=16 y alpha=32 sobre las capas lineales del modelo base, con posterior fusión de los pesos adaptados en los pesos originales. La arquitectura, configuración, tokenizador y plantilla de chat son idénticos a los del modelo base; solo cambian los valores de los pesos.

Su relevancia es acotada: es un modelo de investigación educativa, con cero descargas y cero "likes" en el momento de la consulta, entrenado exclusivamente con datos en japonés y orientado a una tarea muy concreta (question answering con citación de fuentes). No está pensado como modelo de propósito general ni dispone de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles internos del base no disponibles en la información proporcionada) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) |
| Tamaño del repositorio | 1,8 GB |
| Pipeline declarado | question-answering |
| Fecha de creación | 2026-11-18 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y aplica un ajuste fino con LoRA (Low-Rank Adaptation) de rango 16, alpha 32 y dropout 0,05 sobre las capas lineales del modelo de lenguaje: down_proj, gate_proj, in_proj_a, in_proj_b, in_proj_qkv, in_proj_z, k_proj, o_proj, out_proj, q_proj, up_proj y v_proj. El entrenamiento se prolongó durante 3 épocas y, una vez finalizado, los deltas de LoRA se fusionaron directamente en los ficheros de pesos originales ("peso original + delta LoRA"), de modo que el checkpoint resultante no requiere cargar adaptadores adicionales. La estructura, config, tokenizador, plantilla de chat y los nombres, formas y tipos de los tensores coinciden con los del modelo base.

La tarea de entrenamiento consiste en recibir una pregunta y cinco documentos recuperados, y producir una salida JSON con el esquema `{"answer": <respuesta>, "chunk_id": <número del fragmento que sirve de evidencia>}`. El conjunto de entrenamiento consta de 1119 ejemplos construidos a partir de JEMHopQA (split train, ver1.2) y JSQuAD (split train, v1.3, subconjunto aleatorio de 1000 preguntas), ambos bajo licencia CC BY-SA 4.0; se descartaron las preguntas sin evidencia en los documentos recuperados y se reformateó todo al esquema JSON. Los fragmentos de Wikipedia en japonés empleados como contexto provienen del dataset del concurso bumbuboon/llm-course-final-2026. Todo el proceso (preparación de datos y entrenamiento) se ejecutó en Google Colab, sin APIs externas ni otros LLM. No se documenta uso de RLHF, DPO ni datos sintéticos generados por modelos.

## Capacidades

- Generación de respuestas extractivas y abstractivas en japonés a partir de contexto documental recuperado.
- Citación de la fuente: emite el campo `chunk_id` con el índice del fragmento que respalda la respuesta, lo que permite trazabilidad en pipelines RAG.
- Salida estructurada en JSON con un esquema fijo (`answer` + `chunk_id`), adecuada para parseo programático.
- Manejo de hasta cinco documentos de contexto por consulta (según el formato de entrenamiento).
- Capacidad de responder preguntas de tipo multi-hop, dado que JEMHopQA incluye preguntas que requieren combinar información de varias entidades.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: limitadas al japonés según la etiqueta de idioma del modelo; no se declara soporte de otros idiomas.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia en japonés con trazabilidad: el modelo devuelve el `chunk_id` del fragmento que sustenta la respuesta, lo que permite construir interfaces que enlacen la respuesta a la fuente original y faciliten la verificación por parte del usuario.
- Componente de generación en un pipeline RAG educativo o de prototipado: al haberse entrenado específicamente con el formato pregunta + 5 documentos + JSON, se integra directamente como etapa final de un recuperador (por ejemplo, búsqueda BM25 o embeddings sobre Wikipedia japonesa) sin necesidad de ingeniería de prompts adicional.
- Evaluación comparativa de técnicas de ajuste fino: sirve como referencia reproducible (LoRA r=16, 3 épocas, Colab) para comparar con otras estrategias de fine-tuning sobre el mismo modelo base en tareas de QA con citación.
- Sistemas de preguntas y respuestas sobre documentación interna en japonés: el esquema de salida con `chunk_id` es reutilizable para corpus corporativos, siempre que se adapte el formato de los fragmentos de contexto.
- Filtrado y verificación de respuestas: el campo `chunk_id` permite descartar automáticamente respuestas cuyo fragmento citado no contenga la información, como paso de control de calidad en producción.
- Docencia y experimentación con modelos pequeños: con 0,87 mil millones de parámetros y pesos en safetensors de 1,8 GB, es viable ejecutarlo en entornos con recursos limitados (por ejemplo, GPU de consumo o Colab) para prácticas de RAG y evaluación de QA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 2-3 GB para contextos moderados (estimación, no dato del autor).
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimación orientativa, no confirmada por el autor; no se publican variantes cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060/4060, RTX 4090, A100 o H100 son sobradamente suficientes. Cabe en GPU de consumo.
- Opciones de despliegue: al conservar la estructura del modelo base Qwen3.5-0.8B, es compatible con frameworks que soporten dicha arquitectura (transformers, vLLM, TGI, llama.cpp/Ollama si se genera una conversión GGUF, que no se proporciona en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen008 | 873 M | No disponible | Japonés | Apache 2.0 | QA con citación sobre Wikipedia japonesa (RAG) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B (según denominación; no confirmado en la información) | No disponible | Multilingüe (no confirmado) | Apache 2.0 | Propósito general |
| Otros fine-tunes del curso LLM講座2 2026 | No disponible | No disponible | Japonés | No disponible | QA RAG (variantes del mismo concurso) |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Modelo de ámbito educativo: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de validación externa ni de uso en producción.
- Entrenado exclusivamente con datos en japonés (JEMHopQA y JSQuAD); el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Formato de salida rígido: espera exactamente una pregunta y cinco fragmentos como entrada y produce un JSON con `answer` y `chunk_id`; usos fuera de ese esquema pueden degradar la calidad.
- Riesgo de alucinación: al ser un modelo de 0,87 B parámetros ajustado con solo 1119 ejemplos, la probabilidad de respuestas incorrectas o de citar un `chunk_id` no relevante es significativa; se recomienda validación posterior del fragmento citado.
- Sesgos: no documentados por el autor; los datos de origen (Wikipedia, JEMHopQA, JSQuAD) pueden introducir sesgos propios de su composición.
- Longitud de contexto: no documentada; el entrenamiento usa cinco fragmentos, por lo que contextos mucho mayores pueden quedar fuera de distribución.
- Licencia Apache 2.0 para el modelo, pero los datos de entrenamiento son CC BY-SA 4.0 (JEMHopQA, JSQuAD, Wikipedia japonesa), lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar antes de uso comercial.
- No se proporcionan pesos cuantizados ni scripts de conversión; el despliegue eficiente requiere trabajo adicional.
- Sin información sobre tool calling, agentes o modo de razonamiento extendido; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen008
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset del concurso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
