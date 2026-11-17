# DiTy/OutlineLM-Gemma4-E4B-v1

## Resumen

OutlineLM-Gemma4-E4B-v1 es un ajuste fino (SFT) de tipo texto de Gemma 4 E4B, desarrollado por DiTy, especializado en una tarea muy concreta: la detección de encabezados en documentos en ruso e inglés y la devolución de una lista ordenada en JSON que sirve como plan de corte para segmentación semántica (chunking). El modelo no es un asistente generalista, sino una herramienta de preprocesado para pipelines RAG: recibe un documento crudo y devuelve los títulos que abren cada bloque, lo que permite dividir el texto respetando su estructura lógica en lugar de hacerlo por longitud fija de tokens.

Arquitectura derivada de Gemma 4 (familia multimodal image-text-to-text), con 7.996.156.490 parámetros totales según los pesos safetensors publicados, aunque el ajuste se ha realizado únicamente sobre texto. El contexto de entrenamiento se organiza en ventanas de hasta 25.000 caracteres por ejemplo, de modo que los documentos largos se parten antes de la inferencia. La decodificación recomendada es greedy (temperatura 0) con el razonamiento desactivado, lo que reduce la latencia y estabiliza la salida estructurada.

Su relevancia actual radica en que resuelve un cuello de botella habitual en sistemas de recuperación de información sobre corpus documentales (normativa, manuales, informes): la detección fiable de estructura. Frente a heurísticas basadas en expresiones regulares, un modelo entrenado para copiar literalmente los encabezados ofrece mejor generalización entre idiomas y formatos. Se publica bajo licencia Apache 2.0, con pesos en safetensors y GGUF, y un script auxiliar (`outline_chunks.py`) para materializar los chunks a partir de la salida JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (familia image-text-to-text); ajuste solo texto |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento por ventanas de hasta 25.000 caracteres) |
| Tipos de cuantizacion | bf16, GGUF (incluye Q4_K_M y Q3_K_M; catálogo completo no disponible) |
| Idiomas soportados | en, ru (la model card menciona ar en los tags de HF, pero la card solo declara en y ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E4B-it`, un checkpoint instruct de la familia Gemma 4 con arquitectura transformer y capacidades multimodales (image-text-to-text) en su versión base. DiTy ha realizado un SFT exclusivamente sobre texto, conservando la arquitectura y el tokenizador del modelo base. El prompt de tarea está embebido en la plantilla de chat del tokenizador (y replicado en cada GGUF), de modo que el usuario solo debe pasar el documento crudo como mensaje de usuario, sin etiquetas `<document>` ni instrucciones adicionales. Un mensaje de sistema sustituye el prompt integrado, y un rol `document` se envuelve igual que `user`.

El entrenamiento se organiza por ventanas de hasta 25.000 caracteres por ejemplo; los documentos más largos se fragmentan antes de entrar al modelo. La tarea aprendida es de extracción literal: el modelo devuelve un array JSON con objetos `{"id", "heading_type", "heading_text"}` en orden de aparición, donde `heading_type` toma uno de cinco valores (`doc_header`, `section`, `article`, `appendix`, `example`). El autor advierte explícitamente que esa etiqueta no debe usarse como clasificador de documentos: sirve para mantener la coherencia del esquema mientras el modelo copia el texto, y lo que debe consumirse aguas abajo es `heading_text`. La inferencia recomendada es decodificación greedy con temperatura 0 y razonamiento desactivado.

## Capacidades

- Detección de encabezados en documentos en inglés y ruso, devolviendo un array JSON ordenado con el texto exacto de cada título.
- Generación de un plan de corte para segmentación semántica: cada encabezado marca el inicio de un bloque que se extiende hasta el siguiente.
- Manejo de jerarquías numéricas: el script auxiliar evita confundir un número corto con parte de uno más largo (por ejemplo, `2.7` dentro de `2.7.1`).
- Descarte de líneas de índice con puntos conductores cuando una copia posterior del mismo encabezado abre el bloque real.
- Procesamiento de documentos de hasta 25.000 caracteres por ventana, con concatenación de ventanas para documentos mayores.
- Salida vacía controlada: un documento vacío devuelve `[]`.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue mediante transformers, vLLM (con `vllm-gguf-plugin` para GGUF) y llama.cpp/Ollama a través de los ficheros GGUF.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni visión en el ajuste publicado.

## Casos de uso

- Segmentación semántica para pipelines RAG: el modelo devuelve los encabezados de un manual o normativa y `outline_chunks.py` construye chunks que respetan la estructura del documento, mejorando la precisión de la recuperación frente a cortes por longitud fija.
- Indexación de documentación técnica y normativa: en corpus como NIST SP 800-61 (incluido como ejemplo en el repositorio), el modelo identifica secciones y subsecciones para generar un índice navegable o un árbol de contenidos.
- Preprocesado de contratos y documentación legal en ruso o inglés: la detección de artículos, anexos y ejemplos permite separar cláusulas y anexos antes de pasarlos a un modelo generativo o a un sistema de búsqueda.
- Construcción de bases de conocimiento con trazabilidad: al conservar el texto literal de cada encabezado y sus offsets (`start`, `end`), se puede citar la sección exacta de origen de cada fragmento recuperado.
- Enriquecimiento de visores y herramientas de lectura: la salida JSON alimenta índices laterales, tablas de contenido automáticas y sistemas de navegación por secciones en aplicaciones de lectura de documentos.
- Limpieza de corpus para entrenamiento: eliminar líneas de índice y duplicados de encabezados antes de tokenizar reduce ruido en datasets de preentrenamiento o ajuste fino.
- Ingesta por lotes en pipelines de CI/CD documental: al ser determinista (temperatura 0) y devolver JSON validable, la salida puede verificarse automáticamente y encolarse para revisión humana solo en los casos con esquema inválido.

## Benchmarks y rendimiento

| Modelo | F1 (34 documentos de test) |
|---|---:|
| OutlineLM Gemma 4 E4B v1 | 0.8438 |
| OutlineLM Gemma 4 E2B v1 | 0.8062 |
| GPT 6.1 Sol | 1.0000 |

El autor indica que una diferencia de uno o dos puntos de F1 en el conjunto de 34 documentos está dentro del ruido muestral. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos bf16: el repositorio ocupa 61,3 GB, por lo que la inferencia en bf16 requiere del orden de 16 GB de VRAM solo para pesos (8.000 millones de parámetros a 2 bytes), más memoria para el contexto y el runtime; en la práctica conviene una GPU de 24 GB o superior (RTX 4090, L40S, A100 40 GB).
- Cuantización Q4_K_M: reduce el peso a aproximadamente 4-5 GB, lo que permite ejecución en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; el autor señala que es el punto donde la validez del JSON empieza a degradarse.
- Cuantización Q3_K_M: no mantiene el esquema de salida según la model card; no se recomienda para producción.
- Despliegue: transformers (referencia), vLLM con `vllm-gguf-plugin` para GGUF (tokenizador y config desde el repositorio del modelo), y llama.cpp/Ollama mediante los ficheros GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OutlineLM Gemma 4 E4B v1 | 7.996.156.490 | no disponible (ventanas de 25.000 caracteres) | 0.8438 | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| OutlineLM Gemma 4 E2B v1 | no disponible | no disponible | 0.8062 | no disponible | Hugging Face |
| GPT 6.1 Sol | no disponible | no disponible | 1.0000 | propietaria | API comercial |

La comparación con GPT 6.1 Sol procede de la propia model card y se refiere únicamente a la tarea de detección de encabezados sobre el conjunto de test del autor; no implica paridad en capacidades generales. No se dispone de comparativas con otros modelos de chunking o detección de estructura en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: no está pensado como asistente general, y su uso fuera de la detección de encabezados no está validado.
- La etiqueta `heading_type` no es un clasificador fiable de tipos de documento; el autor recomienda consumir únicamente `heading_text`.
- Ventana de 25.000 caracteres por ejemplo: los documentos más largos deben fragmentarse y concatenarse, lo que puede introducir errores en las fronteras entre ventanas.
- La cuantización Q3_K_M no preserva el esquema JSON; Q4_K_M es el límite práctico antes de perder validez estructural.
- Idiomas declarados: inglés y ruso. El tag `ar` aparece en los metadatos de Hugging Face, pero la model card no lo respalda; no debe asumirse soporte de árabe.
- Riesgo de alucinación en la copia literal de encabezados: al ser una tarea extractiva, cualquier desviación del texto original invalida los offsets calculados por `outline_chunks.py`.
- Sin datos publicados de sesgos, robustez ante documentos ruidosos (OCR, PDF mal extraídos) ni evaluación fuera del conjunto de 34 documentos del autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede tener términos adicionales que conviene revisar antes de desplegar en producción.
- Solo 4 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DiTy/OutlineLM-Gemma4-E4B-v1
- Modelo emparejado (E2B): https://huggingface.co/DiTy/OutlineLM-Gemma4-E2B-v1
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Paper referenciado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Script de chunking: `outline_chunks.py` en el repositorio del modelo
- Ejemplos incluidos en el repositorio: `examples/nist-sp800-61r2-s1.txt`, `examples/nist-sp800-61r2-s1.headings.json`, `examples/nist-sp800-61r2-s1.chunks.json`
- Plugin GGUF para vLLM: paquete `vllm-gguf-plugin`
