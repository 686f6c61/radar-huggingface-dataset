# onnx-community/F2LLM-v2-160M-ONNX

## Resumen

F2LLM-v2-160M-ONNX es la conversión a formato ONNX del modelo de embeddings multilingüe `codefuse-ai/F2LLM-v2-160M`, desarrollado por el equipo CodeFuse de Alibaba. Forma parte de la familia F2LLM-v2, una colección de modelos de embeddings de propósito general en ocho tamaños distintos, desde 80M hasta 14B de parámetros, entrenados sobre un conjunto curado de 60 millones de muestras públicas de alta calidad. El modelo soporta más de 200 idiomas, con especial atención a lenguas de media y baja disponibilidad de recursos, un aspecto diferencial frente a otras soluciones del mercado.

Esta versión ONNX está pensada para su uso con Transformers.js y entornos de inferencia que soporten el formato ONNX, como `text-embeddings-inference` o `ONNX Runtime`. Al tratarse de un modelo de 160M de parámetros, es ligero y puede ejecutarse en CPU o GPUs de gama baja, lo que lo convierte en una opción atractiva para despliegues en producción con requisitos de latencia y coste reducidos. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 (segun tags del repositorio) |
| Parametros totales | 160M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato ONNX, puede incluir FP32/FP16) |
| Idiomas soportados | Mas de 200, incluyendo en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

F2LLM-v2-160M es un modelo de embeddings basado en la arquitectura transformer, concretamente derivado de Qwen3 segun los tags del repositorio. Los tres modelos mas pequenos de la familia (80M, 160M y 330M) se obtienen mediante poda y entrenamiento adicional a partir del modelo base de 0.6B, lo que permite reducir el tamano manteniendo un rendimiento competitivo. El entrenamiento se realizo sobre un conjunto de datos curado de 60 millones de muestras publicas, con un enfasis especial en lenguas de media y baja disponibilidad de recursos, lo que explica su amplia cobertura multilingue.

El modelo esta disenado para generar embeddings de texto de 640 dimensiones (segun el ejemplo de uso en la model card). No se menciona el uso de tecnicas como RLHF o DPO en la informacion disponible; el entrenamiento se centra en la calidad de las representaciones vectoriales para tareas de recuperacion y clasificacion. La version ONNX se genero automaticamente mediante la herramienta de conversion de Hugging Face, lo que garantiza compatibilidad con el ecosistema Transformers.js y ONNX Runtime.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica, recuperacion de informacion y clasificacion de texto.
- Soporte multilingue extenso: mas de 200 idiomas, con cobertura destacada de lenguas minoritarias y de bajos recursos.
- Compatible con la libreria Sentence Transformers, permitiendo usar metodos `encode_query` y `encode_document` con prompts especificos para consultas y documentos.
- Integracion con Transformers.js para ejecucion en navegador o entornos JavaScript.
- Formato ONNX compatible con `text-embeddings-inference` y otros motores de inferencia estandar.
- Dimension de embeddings de 640, adecuada para indices vectoriales eficientes.

## Casos de uso

- Busqueda semantica en bases de conocimiento multilingue: el modelo puede indexar documentos en decenas de idiomas y recuperar pasajes relevantes a partir de consultas en cualquier idioma soportado, gracias a su entrenamiento multilingue.
- Sistemas RAG (Retrieval-Augmented Generation): al generar embeddings de alta calidad para consultas y documentos, se puede integrar en pipelines de generacion aumentada por recuperacion para chatbots o asistentes virtuales.
- Clasificacion de texto y analisis de sentimiento: las representaciones vectoriales pueden alimentar clasificadores lineales o redes neuronales ligeras para tareas de categorizacion en multiples idiomas.
- Deduplicacion de documentos: comparar embeddings de documentos para detectar duplicados o contenido similar en grandes corpus multilingues.
- Motores de recomendacion: calcular similitud entre items (productos, articulos, noticias) basandose en sus descripciones textuales en diferentes idiomas.
- Moderacion de contenido: clasificar comentarios o publicaciones en multiples idiomas para detectar spam o contenido inapropiado, aprovechando la cobertura de lenguas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original no incluye tablas comparativas con otros modelos de embeddings, y la version ONNX no anade datos adicionales. Se recomienda consultar el paper asociado (arxiv:2603.19223) para obtener metricas detalladas si estan disponibles.

## Requisitos de hardware

- VRAM estimada: con 160M de parametros, el modelo en FP32 ocupa aproximadamente 640 MB, y en FP16 unos 320 MB. Esto permite ejecutarlo en GPUs con 1 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente. Tambien puede ejecutarse en CPU sin problemas.
- Compatible con consumer GPU: si, es un modelo muy ligero que cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: al ser formato ONNX, se puede servir con ONNX Runtime, `text-embeddings-inference`, o mediante Transformers.js en el navegador. Tambien es compatible con Sentence Transformers si se convierte a PyTorch.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamano se espera una latencia de pocos milisegundos por lote en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Como alternativas en la misma categoria de modelos de embeddings pequenos y multilingues se pueden considerar:

| Modelo | Parametros | Idiomas | Contexto | Licencia |
|---|---|---|---|---|
| F2LLM-v2-160M | 160M | >200 | No disponible | Apache 2.0 |
| all-MiniLM-L6-v2 | 22M | ~50 | 256 tokens | Apache 2.0 |
| bge-small-en-v1.5 | 33M | Ingles | 512 tokens | MIT |
| multilingual-e5-small | 118M | 100 | 512 tokens | MIT |

La comparacion directa no es posible sin datos de benchmarks, pero F2LLM-v2-160M destaca por su cobertura de idiomas significativamente mayor que las alternativas mencionadas.

## Limitaciones y advertencias

- Al ser un modelo de 160M, su rendimiento en tareas complejas de recuperacion puede ser inferior al de modelos mas grandes de la misma familia (0.6B, 1.7B, etc.).
- La longitud de contexto no esta documentada en la informacion disponible; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en produccion.
- Aunque soporta mas de 200 idiomas, la calidad de los embeddings puede variar entre idiomas, especialmente en lenguas con menos datos de entrenamiento.
- No se han publicado benchmarks oficiales, por lo que el rendimiento relativo frente a otros modelos no esta validado externamente.
- La version ONNX puede tener ligeras diferencias numericas respecto al modelo original en PyTorch debido a la conversion, aunque en la practica suelen ser despreciables.
- El modelo esta disenado para embeddings; no es un modelo generativo y no puede producir texto.

## Enlaces

- Repositorio HuggingFace de la version ONNX: https://huggingface.co/onnx-community/F2LLM-v2-160M-ONNX
- Modelo original: https://huggingface.co/codefuse-ai/F2LLM-v2-160M
- Paper asociado: arxiv:2603.19223
- Dataset de entrenamiento: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Version ONNX del modelo 0.6B: https://huggingface.co/onnx-community/F2LLM-v2-0.6B-ONNX
