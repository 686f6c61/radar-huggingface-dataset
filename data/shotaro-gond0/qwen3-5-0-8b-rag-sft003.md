# shotaro-gond0/qwen3.5-0.8b-rag-sft003

## Resumen

qwen3.5-0.8b-rag-sft003 es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario shotaro-gond0 como proyecto final del curso «LLM講座2 2026». El modelo está especializado en tareas de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés: recibe un prompt con los diez fragmentos recuperados y una pregunta, y devuelve un JSON con la respuesta corta y el identificador del fragmento (`chunk_id`) que sirve de evidencia.

El modelo base es un transformer denso de aproximadamente 873 millones de parámetros, publicado bajo licencia Apache-2.0. El ajuste se realizó con LoRA (r=16, alpha=32, dropout=0.05) sobre las proyecciones q/k/v/o/gate/up/down, con los pesos fusionados posteriormente en el checkpoint final. El resultado conserva exactamente la arquitectura, los ficheros de configuración y las formas de los tensores del modelo original.

Su relevancia es acotada pero clara: demuestra un flujo completo de SFT para RAG extractivo en japonés con datos derivados de JEMHopQA y JSQuAD, un formato de salida estructurado (JSON con cita de evidencia) y un tamaño que permite ejecución en hardware modesto. No obstante, se trata de un artefacto académico con 32 descargas, sin benchmarks publicados y con capacidades limitadas al dominio y formato de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), ajustado con LoRA y fusionado |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de 873 millones de parámetros. Sobre él se aplicó un ajuste supervisado (SFT) con LoRA de rango 16 y alpha 32, dropout 0.05, dirigido a las proyecciones q/k/v/o/gate/up/down. Los adaptadores se fusionaron en los pesos finales, de modo que el checkpoint resultante es estructuralmente idéntico al base (mismas claves, formas y tipos, verificado en el guardado). El entrenamiento se ejecutó en una GPU L4 de Google Colab, en fp16, con learning rate 1e-4, scheduler cosine con 5 % de warmup, acumulación de gradiente 8 y una sola época.

La pérdida se calculó exclusivamente sobre el JSON de salida (`{"answer":..., "chunk_id":...}`) y la posición del token de fin, no sobre el prompt de entrada. El conjunto de entrenamiento contiene 2.529 filas con repeticiones (1.647 ejemplos únicos: 231 de JEMHopQA y 1.416 de JSQuAD, semilla 42); las instancias de JEMHopQA se repitieron tres veces y las filas cuyo documento correcto quedaba en segunda posición o inferior en el ranking de recuperación se repitieron cuatro veces. Cada ejemplo se construyó recuperando fragmentos con un pipeline híbrido (BM25 + Ruri v3 + BGE-M3 con fusión RRF, reordenación con Ruri v3 reranker y reranking con pistas) y conservando solo las preguntas cuya respuesta aparecía entre los diez fragmentos recuperados.

## Capacidades

- Generación de respuestas cortas y extractivas a preguntas formuladas sobre un conjunto de diez fragmentos de contexto en japonés.
- Salida estructurada en JSON con dos campos: `answer` (la respuesta) y `chunk_id` (el fragmento usado como evidencia).
- Atribución de evidencia: el modelo aprende a citar el documento concreto del contexto, lo que facilita la verificación de la respuesta.
- Comprensión lectora en japonés sobre texto de Wikipedia, incluyendo preguntas de múltiples saltos (JEMHopQA).
- Integración con pipelines RAG externos: el modelo no recupera documentos por sí mismo, asume que el contexto ya viene en el prompt.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso autónomo, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Respuesta extractiva sobre Wikipedia japonesa: dado un prompt con diez fragmentos recuperados y una pregunta, el modelo devuelve la respuesta y el `chunk_id` de respaldo, lo que permite construir un sistema de QA con trazabilidad de fuentes.
- Verificación de citas en asistentes documentales: al devolver el identificador del fragmento usado, se puede auditar automáticamente si la respuesta está soportada por el contexto recuperado y descartar aquellas sin evidencia válida.
- Prototipado de pipelines RAG en japonés con hardware limitado: sus 873 millones de parámetros permiten ejecutarlo en una GPU de consumo o incluso en CPU con cuantización, útil para pruebas de concepto y entornos de desarrollo.
- Evaluación de recuperadores: al fijar el modelo generador, se puede medir el impacto de distintos retrievers (BM25, embeddings densos, híbridos) sobre la precisión final de la respuesta y la selección correcta de evidencia.
- Extracción de respuestas en bases de conocimiento estructuradas: el formato JSON con `chunk_id` encaja en pipelines que necesitan poblar campos de una base de datos con la respuesta y la referencia de origen.
- Docencia y experimentación en ajuste fino: sirve como ejemplo reproducible de SFT con LoRA para RAG, con datos, hiperparámetros y procedencia documentados en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 sin cuantizar (RTX 3060, RTX 4060, L4, T4); A100 y H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más; también es viable en CPU con cuantización.
- Opciones de despliegue: el autor documenta su uso mediante un notebook de RAG (`rag_submit.ipynb`) que carga el modelo desde Hugging Face con una revisión fija. Al ser un checkpoint con arquitectura Qwen3.5, debería poder servirse con frameworks compatibles con dicha familia (transformers, vLLM, TGI), aunque el autor no documenta configuraciones de despliegue alternativas ni ficheros GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-rag-sft003 | 873 M | No disponible | RAG extractivo en japones con cita de evidencia | Apache-2.0 | Hugging Face (32 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 873 M | No disponible | Modelo generalista multilingue | Apache-2.0 | Hugging Face |
| Modelos RAG japoneses de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros ajustes RAG japoneses comparables en la informacion proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de propósito muy específico: está entrenado exclusivamente para responder preguntas cortas citando un fragmento de un contexto de diez documentos; fuera de ese formato su comportamiento no está garantizado.
- Idioma limitado al japonés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque el formato incluye `chunk_id`, el modelo puede generar una respuesta no soportada por el fragmento citado o citar un fragmento incorrecto; se recomienda validación posterior.
- Sin benchmarks publicados: no hay métricas de exactitud, EM o F1 que permitan estimar su calidad frente al modelo base u otras alternativas.
- Sesgos heredados: al derivar de Qwen3.5-0.8B y entrenarse con Wikipedia japonesa (JEMHopQA, JSQuAD), puede reproducir sesgos presentes en esas fuentes.
- Datos de entrenamiento con licencia CC BY-SA 4.0: aunque los pesos se publican como Apache-2.0, la procedencia de los datos impone obligaciones de atribución y compartir-igual sobre los conjuntos derivados; conviene revisar `DATA_PROVENANCE.md` antes de un uso comercial.
- Contexto máximo no documentado: se desconoce la ventana real del modelo base y si el ajuste la modifica; el prompt de entrenamiento asume diez fragmentos.
- Artefacto académico con escasa adopción (32 descargas, 0 likes): no hay garantías de mantenimiento, soporte ni estabilidad de la revisión.
- Reproducibilidad: se documentan semilla, hiperparámetros y pipeline de recuperación, pero el entrenamiento se realizó en un entorno Colab concreto, lo que puede dificultar la réplica exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shotaro-gond0/qwen3.5-0.8b-rag-sft003
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio JGLUE / JSQuAD: https://github.com/yahoojapan/JGLUE
- Repositorio JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
