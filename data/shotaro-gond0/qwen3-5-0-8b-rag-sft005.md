# shotaro-gond0/qwen3.5-0.8b-rag-sft005

## Resumen
qwen3.5-0.8b-rag-sft005 es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B (Apache-2.0), desarrollado por el usuario shotaro-gond0 para el trabajo final del curso "LLM講座2 2026". El modelo está especializado en tareas de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés: recibe una pregunta junto con los diez fragmentos recuperados de mayor relevancia y devuelve un JSON con la respuesta breve y el identificador del fragmento usado como evidencia. Los pesos LoRA se han fusionado con el modelo base, por lo que la arquitectura, los nombres de pesos, las formas y los tipos coinciden exactamente con Qwen3.5-0.8B.

El modelo resuelve un problema acotado pero útil: extraer respuestas concisas y atribuibles a una fuente a partir de contexto recuperado, en lugar de generar texto libre. Con 873 millones de parámetros, es lo bastante pequeño para entrenarse y desplegarse en hardware modesto (el autor lo entrenó en una GPU L4 de Google Colab), lo que lo convierte en un caso práctico de RAG especializado en japonés. Su relevancia actual radica en que demuestra un pipeline completo de SFT con datos derivados de JEMHopQA y JSQuAD, con formato de salida estructurado y control de atribución mediante chunk_id.

La información pública disponible es escasa: no hay pipeline declarado, cero likes, trece descargas y no se han publicado resultados de benchmarks. Esta ficha refleja exclusivamente los datos presentes en la model card y en los metadatos de Hugging Face; cualquier dato no documentado se indica como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; estructura, configuración y nombres de pesos idénticos al base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 (modelo base y ajuste); datos de entrenamiento bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors (LoRA fusionado con el modelo base) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-0.8B, un transformer de aproximadamente 873 millones de parámetros. Sobre él se aplicó un ajuste supervisado (SFT) con LoRA de rango r=16, alpha=32 y dropout=0.05, dirigido a las proyecciones q/k/v/o/gate/up/down_proj. Los adaptadores se fusionaron posteriormente con los pesos base, de modo que el checkpoint final no requiere cargar un adaptador aparte.

El entrenamiento usó 1.649 ejemplos (234 de JEMHopQA y 1.415 de JSQuAD, con 50 reservados para validación, semilla 42), tras eliminar duplicados. La pérdida se calculó únicamente sobre la salida JSON (`{"answer":..., "chunk_id":...}`) y la posición del token de fin, no sobre el prompt. Se emplearon learning rate 1e-4 con schedule cosine y 5 % de warmup, acumulación de gradiente 8, una época y precisión fp16, todo en una GPU L4 de Google Colab. Las filas de JEMHopQA se ponderaron ×3 y las filas cuyo fragmento correcto aparecía en segunda posición o inferior ×4. El contexto de entrada lo forman los diez fragmentos recuperados por un pipeline híbrido (BM25 + Ruri v3 + BGE-M3 con fusión RRF, reranking con Ruri v3 reranker y seguimiento de títulos de artículos). No consta uso de RLHF ni DPO.

## Capacidades
- Generación de respuestas cortas y extractivas a partir de contexto recuperado, en japonés.
- Salida estructurada en JSON con dos campos: `answer` (respuesta breve) y `chunk_id` (fragmento de evidencia).
- Atribución de la respuesta a un fragmento concreto, útil para verificación de fuentes.
- RAG sobre Wikipedia en japonés con hasta diez fragmentos de contexto en el prompt.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo japonés declarado; otros idiomas no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso
- Atención al cliente sobre base documental japonesa: el modelo puede recibir los diez fragmentos recuperados de un manual o FAQ y devolver la respuesta con el identificador del fragmento, lo que permite mostrar la fuente al usuario.
- Verificación de respuestas con trazabilidad: al devolver `chunk_id`, un sistema posterior puede enlazar la respuesta a la sección exacta del documento, facilitando auditoría y corrección de errores.
- Búsqueda aumentada en enciclopedias internas: integrado en un pipeline BM25 + embeddings, responde preguntas factuales sobre entradas de Wikipedia japonesa con respuestas concisas.
- Extracción de respuestas para QA extractivo: útil en evaluación de sistemas RAG sobre conjuntos como JEMHopQA o JSQuAD, donde se requiere una cadena corta y una referencia.
- Generación de pares pregunta-respuesta anotados: el JSON estructurado permite construir datasets de entrenamiento o evaluación con evidencia asociada.
- Despliegue en hardware modesto para prototipos: con 873 M de parámetros, puede ejecutarse en GPU de consumo o incluso CPU para pruebas de pipeline antes de escalar a modelos mayores.
- Filtrado de respuestas no respaldadas: al exigir chunk_id, el sistema puede rechazar respuestas sin evidencia válida, reduciendo alucinaciones en producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 873 M de parámetros en fp16, el checkpoint completo ronda 1,7 GB, por lo que la inferencia en fp16 requiere en torno a 2-3 GB de VRAM incluyendo activaciones; en cuantización de 8 bits o 4 bits sería inferior, aunque no se publican pesos cuantizados.
- GPU recomendadas: el autor entrenó en una NVIDIA L4 (24 GB). Para inferencia son suficientes GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090; A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, con cualquier GPU con al menos 4 GB de VRAM en fp16, sujeto a verificación empírica no documentada.
- Opciones de despliegue: al ser un transformer estándar con pesos safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). El autor indica uso con su notebook `rag_submit.ipynb` mediante el campo `GENERATOR`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-rag-sft005 | 873 M | no disponible | Apache-2.0 | RAG japonés con salida JSON | Hugging Face (13 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | Apache-2.0 | Modelo generalista | Hugging Face (oficial) |
| Otros ajustes RAG japoneses de tamaño similar | no disponible | no disponible | no disponible | RAG japonés | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- Entrenado exclusivamente para japonés; su comportamiento en otros idiomas no está documentado.
- Diseñado para responder con una frase corta y un chunk_id; no es adecuado para generación de texto largo, código o razonamiento abierto.
- Depende de la calidad del pipeline de recuperación: si los diez fragmentos no contienen la respuesta, el modelo no puede generarla correctamente.
- Riesgo de alucinación no evaluado: no se han publicado métricas de fidelidad ni de exactitud en benchmarks.
- El chunk_id devuelto puede ser incorrecto si la evidencia está mal posicionada o si hay fragmentos duplicados.
- Sesgos conocidos: no documentados; al derivar de Wikipedia japonesa, puede heredar sesgos de cobertura y redacción de esa fuente.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datos de entrenamiento derivan de JSQuAD/JGLUE y JEMHopQA (CC BY-SA 4.0) y de fragmentos de Wikipedia japonesa (CC BY-SA 4.0); la redistribución debe respetar la atribución y el share-alike de esas fuentes.
- El entrenamiento se realizó en una sola época con 1.649 ejemplos, lo que limita la generalización a distribuciones distintas de preguntas.
- No hay pipeline declarado ni demo pública; el uso requiere replicar el notebook del autor y fijar la revisión `e5e46854960dd4703cc2b4161d6ce91423aedc48`.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/shotaro-gond0/qwen3.5-0.8b-rag-sft005
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Documento de procedencia de datos mencionado en la model card: `DATA_PROVENANCE.md` (en el repositorio del modelo)
- Notebook de uso mencionado: `rag_submit.ipynb` (en el repositorio del modelo)
