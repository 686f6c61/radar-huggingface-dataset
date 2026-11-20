# nlpai-lab/KURE-Sparse-nano

## Resumen

KURE-Sparse-nano es un modelo compacto de recuperación dispersa aprendida (learned sparse retrieval, LSR) para coreano e inglés, desarrollado por el laboratorio nlpai-lab. Con 149.373.778 parámetros (aproximadamente 0,1B), se posiciona como una alternativa eficiente a los recuperadores densos de gran tamano, manteniendo las ventajas de un índice invertido: cada documento se representa como un vector disperso sobre un vocabulario fijo de 36.282 términos, lo que permite inspeccionar qué términos activan la coincidencia entre consulta y documento.

El modelo se construye sobre nlpai-lab/KURE-v2-unsupervised y emplea una arquitectura ModernBERT, empaquetada para su uso con la librería sentence-transformers mediante la clase `SparseEncoder`. Su principal atractivo es la relacion rendimiento/tamano: segun el autor, alcanza un promedio de 0,7716 nDCG@10 en las nueve tareas de recuperación de MTEB(kor, v2), superando en esa métrica a modelos densos mucho mayores como pplx-embed-v1-4b y harrier-oss-v1-27b.

Es relevante ahora porque demuestra que un encoder de 0,1B puede competir en recuperación coreana con alternativas de varios miles de millones de parámetros, abaratando el coste de indexacion y servicio. Ademas, soporta documentos de hasta 8.192 tokens y se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion en producción y su integracion en pipelines RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), adaptado como sparse encoder |
| Parametros totales | 149.373.778 (aproximadamente 0,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de nlpai-lab/KURE-v2-unsupervised, un encoder ModernBERT, y se ajusta como codificador disperso aprendido (LSR) al estilo SPLADE: cada texto se proyecta a un vector de dimensión fija igual al tamano del vocabulario (36.282 términos), donde cada componente representa el peso de un término del vocabulario. Esta representacion es dispersa en ambos extremos: en promedio 147 dimensiones activas por consulta y 843 por documento, lo que permite indexar en un índice invertido clasico y aplicar puntuacion por producto escalar.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no disponibles). Si se especifica que el modelo fue entrenado con marcadores diferenciados de consulta y documento, por lo que es necesario usar `encode_query` y `encode_document` (o el parametro `input_type` en la API) para anadir dichos marcadores. La innovacion principal es la combinacion de un backbone ModernBERT compacto con una cabeza dispersa sobre vocabulario fijo, que habilita coincidencia lexica inspeccionable y recuperacion eficiente con contexto largo.

## Capacidades

- Generacion de representaciones dispersas para recuperacion de informacion (feature-extraction), no es un modelo generativo.
- Recuperacion dispersa aprendida con vocabulario fijo de 36.282 términos e inspeccion de términos activados.
- Codificacion diferenciada de consultas y documentos mediante marcadores entrenados.
- Procesamiento de documentos largos de hasta 8.192 tokens.
- Soporte bilingue coreano-inglés.
- Puntuacion por producto escalar entre vectores dispersos de consulta y documento.
- Compatibilidad con sentence-transformers (`SparseEncoder`) y con text-embeddings-inference.
- Disponibilidad como servicio gestionado mediante la API de KURE con claves de acceso.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) en coreano: el modelo indexa fragmentos de hasta 8.192 tokens en un índice invertido y devuelve documentos relevantes por producto escalar, reduciendo el coste de almacenamiento frente a embeddings densos de gran dimensión.
- Busqueda empresarial sobre documentacion interna en coreano e inglés: al ser disperso e inspeccionable, permite auditar que términos justifican cada coincidencia, lo que facilita la depuracion de resultados en entornos corporativos.
- Atencion al cliente con base de conocimiento: se puede desplegar detras de un servicio de preguntas frecuentes para recuperar articulos relevantes con baja latencia, dado el reducido tamano del modelo (0,1B).
- Busqueda legal y administrativa: las tareas LawIRKo y AutoRAG del benchmark muestran un rendimiento alto (0,7226 y 0,9360 nDCG@10 respectivamente), adecuado para recuperar normativa y expedientes coreanos.
- Verificacion de hechos y salud publica: con 0,7711 nDCG@10 en PubHealthQA, sirve para recuperar evidencia documental en dominios sensibles donde la trazabilidad de términos es valiosa.
- Filtrado y deduplicacion de grandes corpus: la representacion dispersa permite comparar documentos por solapamiento de términos ponderados y construir indices invertidos economicos a gran escala.
- Recuperacion multilingue limitada coreano-inglés: util para corpus mixtos donde se combinan documentos en ambos idiomas dentro de la misma coleccion.

## Benchmarks y rendimiento

Resultados publicados por el autor en las nueve tareas de MTEB(kor, v2) Retrieval (nDCG@10):

| Tarea | nDCG@10 |
|---|---|
| AutoRAG | 0,9360 |
| PubHealthQA | 0,7711 |
| Ko-StrategyQA | 0,7924 |
| LawIRKo | 0,7226 |
| SQuADKorV1 | 0,9774 |
| Belebele (ko-ko) | 0,9608 |
| MrTidy | 0,5618 |
| MLDR | 0,5133 |
| MIRACL | 0,7091 |
| Media (Avg) | 0,7716 |

El autor afirma que supera a modelos densos mayores como pplx-embed-v1-4b y harrier-oss-v1-27b en el promedio de MTEB(kor, v2) Retrieval, aunque la tabla comparativa completa no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,1B parámetros, la inferencia en fp32 requiere aproximadamente 0,6 GB de pesos; en fp16 alrededor de 0,3 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090 o RTX 3090 ofrece margen amplio para lotes grandes. Para servicio de alta concurrencia se pueden usar A100 o H100, aunque el modelo es pequeno para aprovecharlas plenamente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (`SparseEncoder`), text-embeddings-inference y la API gestionada de KURE. No se indica soporte explicito para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Avg nDCG@10 (MTEB kor v2) | Licencia |
|---|---|---|---|---|---|
| KURE-Sparse-nano | Sparse (LSR) | 0,1B | 8.192 | 0,7716 | Apache 2.0 |
| KURE-v3 | Dense | no disponible | no disponible | no disponible | no disponible |
| pplx-embed-v1-4b | Dense | 4B | no disponible | inferior segun el autor | no disponible |
| harrier-oss-v1-27b | Dense | 27B | no disponible | inferior segun el autor | no disponible |

Los datos de KURE-v3, pplx-embed-v1-4b y harrier-oss-v1-27b no se detallan en la informacion disponible mas alla de la afirmacion del autor de que KURE-Sparse-nano los supera en el promedio de MTEB(kor, v2) Retrieval.

## Limitaciones y advertencias

- Modelo especializado en recuperacion: no genera texto ni responde preguntas directamente; debe combinarse con un generador en pipelines RAG.
- Cobertura linguistica limitada a coreano e inglés; el rendimiento en otros idiomas no esta documentado.
- Rendimiento notablemente inferior en tareas de recuperacion multilingue o de dominio abierto: MrTidy (0,5618) y MLDR (0,5133) son las tareas con peores resultados del benchmark.
- Riesgo de sesgo derivado de los datos de entrenamiento, que no se detallan en la model card.
- Al ser un recuperador, puede devolver documentos irrelevantes si la consulta usa vocabulario fuera de la distribucion de entrenamiento; la naturaleza dispersa e inspeccionable ayuda a diagnosticarlo, pero no lo elimina.
- Requiere usar los marcadores de consulta y documento; un uso incorrecto (por ejemplo, `encode` sin distinguir tipo) degrada la calidad de la recuperacion.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de los datos de entrenamiento, no publicadas.
- No se han publicado datos sobre cuantizacion ni sobre latencia en producción, lo que limita la planificacion de capacidad sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/KURE-Sparse-nano
- Modelo base: https://huggingface.co/nlpai-lab/KURE-v2-unsupervised
- Repositorio GitHub del proyecto KURE: https://github.com/nlpai-lab/KURE
- API de KURE: https://kure.kullm.ai/
- Modelo relacionado KURE-v3: https://huggingface.co/nlpai-lab/KURE-v3
