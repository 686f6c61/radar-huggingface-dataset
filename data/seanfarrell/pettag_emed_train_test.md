# seanfarrell/pettag_emed_train_test

## Resumen

seanfarrell/pettag_emed_train_test es un modelo de embeddings de frases (sentence transformer) obtenido por fine-tuning de sentence-transformers/all-mpnet-base-v2, la variante de 12 capas y 768 dimensiones basada en la arquitectura MPNet. El modelo proyecta entradas de texto a un espacio vectorial denso de 768 dimensiones con similitud coseno, y esta orientado a tareas de similitud semantica y normalizacion de terminologia medica y veterinaria, a juzgar por los ejemplos de la model card (mpox, tetanus, pythiosis, acne rosacea).

El autor (seanfarrell) lo publica como experimento de entrenamiento ("train_test") con solo 12 descargas y 0 likes en el momento de la consulta, lo que lo situa en una fase muy temprana y sin validacion comunitaria. Se ha afinado sobre un dataset de 10.000.000 de pares de frases con la funcion de perdida MultipleNegativesRankingLoss, partiendo de una base preentrenada ampliamente utilizada para retrieval y semantic search.

Su relevancia es limitada y muy especifica: no es un modelo generativo ni un LLM, sino un encoder de frases de 109,5 millones de parametros, con una longitud maxima de secuencia de solo 32 tokens, licencia no especificada e idiomas no declarados. Resulta util unicamente como componente de similitud/busqueda semantica dentro de dominios de terminologia clinica o veterinaria, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNetModel (transformer encoder) como transformer base, mas Pooling (mean) y Normalize; arquitectura SentenceTransformer |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens (Maximum Sequence Length declarada en la model card) |
| Tipos de cuantizacion | no disponible (repo con safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un SentenceTransformer construido en tres modulos: (0) un MPNetModel que actua como extractor de caracteristicas y devuelve last_hidden_state; (1) una capa de Pooling con pooling_mode "mean", embedding_dimension 768 e include_prompt True; y (2) una capa Normalize que produce el embedding final de frase. La similitud se calcula por producto escalar sobre vectores normalizados (equivalente a similitud coseno). El vector de salida es de 768 dimensiones y la longitud maxima de entrada esta fijada en 32 tokens, un limite muy corto que restringe el modelo a frases o etiquetas breves.

El entrenamiento se realizo mediante fine-tuning supervisado desde sentence-transformers/all-mpnet-base-v2, con la perdida MultipleNegativesRankingLoss y un dataset de 10.000.000 de muestras de pares (columnas sentence_0 y sentence_1). Las estadisticas proporcionadas sobre las primeras 100 muestras indican longitudes muy cortas (minimo 5 tokens, media en torno a 11-12 tokens, maximo 27 tokens), coherentes con pares de terminos o etiquetas medicas en distinta capitalizacion (por ejemplo, "baroreflex failure" frente a "Baroreflex failure"). No se documentan fases de RLHF, DPO, ni tecnicas como decodificacion especulativa o atencion lineal. Las etiquetas del repositorio referencian los articulos arXiv 1908.10084 (Sentence-BERT) y arXiv 1807.03748. No se especifica la composicion exacta del dataset ni su procedencia mas alla de las estadisticas citadas.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones para frases y terminos cortos.
- Similitud semantica entre textos (semantic textual similarity) mediante similitud coseno.
- Busqueda semantica y recuperacion (retrieval) sobre corpus de frases cortas.
- Agrupamiento (clustering) y mineria de parafrasis a partir de los embeddings.
- Clasificacion de texto derivada de los vectores generados.
- Normalizacion de terminologia: los ejemplos muestran coincidencia casi perfecta entre variantes en distinta capitalizacion (por ejemplo, "Pythiosis" y "pythiosis" con similitud 1.0000).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se declara soporte de tool calling, function calling ni comportamiento agentico.
- Capacidades multilingues: no disponibles (idiomas no declarados).

## Casos de uso

- Normalizacion de terminologia clinica: dado un termino con mayusculas inconsistentes, el modelo produce embeddings casi identicos para las variantes ("Pythiosis" y "pythiosis"), lo que permite mapear entradas heterogeneas a un termino canonico en un pipeline de limpieza de datos medicos.
- Deduplicacion de catalogos de diagnosticos: al agrupar por similitud coseno los embeddings de etiquetas como "acne rosacea", "Suntan" o "tetanus" (lock-jaw), se puede detectar y unificar entradas duplicadas o equivalentes en bases de datos de codigos.
- Busqueda semantica en historiales de salud: indexar frases cortas de diagnostico y recuperar por similitud las mas cercanas a una consulta breve, como apoyo a sistemas de recuperacion de informacion clinica.
- Enlazado de sinonimos veterinarios: los ejemplos incluyen terminos como "lock-jaw" (tetano) y "pythiosis", utiles para conectar nombres coloquiales con nombres tecnicos en ontologias veterinarias.
- Clasificacion de textos cortos: usar los embeddings como caracteristicas de entrada a un clasificador (regresion logistica o similar) para etiquetar notas o codigos en categorias predefinidas.
- Clustering exploratorio de terminos: agrupar un vocabulario medico no estructurado en clusters tematicos para revision manual o construccion de taxonomias.
- Minería de parafrasis en corpus clinicos: identificar pares de frases equivalentes dentro de un conjunto de descripciones, gracias al entrenamiento con MultipleNegativesRankingLoss sobre pares positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32 y unos 0,22 GB en FP16 para los 109,5 millones de parametros; el tamano del repositorio es de 0,4 GB.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1060 6 GB, RTX 3060, RTX 4090, etc.; tambien puede ejecutarse en CPU sin problema.
- GPU de datacenter (A100, H100) innecesarias por el tamano del modelo, salvo para despliegues de altisima concurrencia.
- Opciones de despliegue: la libreria sentence-transformers (metodo encode), y el tag text-embeddings-inference / endpoints_compatible sugiere compatibilidad con Hugging Face Text Embeddings Inference (TEI). Tambien puede exportarse a ONNX u otros formatos, aunque no se documenta explicitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seanfarrell/pettag_emed_train_test | 109,5 M | 32 tokens | 768 | no disponible | Hugging Face (12 descargas) |
| sentence-transformers/all-mpnet-base-v2 | 109 M aprox. | 384 tokens | 768 | Apache-2.0 (segun el modelo base) | Hugging Face, muy ampliamente usado |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M aprox. | 256 tokens | 384 | Apache-2.0 | Hugging Face, muy ampliamente usado |

Nota: los datos de contexto y licencia del modelo base y de all-MiniLM-L6-v2 se citan como referencia general y pueden diferir de los del modelo aqui descrito; para este ultimo la model card no confirma licencia ni idiomas. No se dispone de resultados de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona ni ejecuta tareas de codigo o matematicas; solo genera embeddings.
- Ventana de contexto muy corta (32 tokens): no admite documentos, parrafos ni conversaciones; solo frases o terminos breves.
- Licencia no disponible: no se puede confirmar la legalidad de un uso comercial sin verificar la licencia con el autor; el modelo base (all-mpnet-base-v2) se distribuye bajo Apache-2.0, pero el autor no especifica la licencia del modelo derivado.
- Idiomas no declarados: no hay garantia de cobertura multilingue ni de comportamiento fuera del ingles medico/veterinario mostrado en los ejemplos.
- Entrenado sobre un dataset de 10 millones de pares no documentado en composicion ni procedencia: riesgo de sesgos y de sobreajuste al dominio (terminologia medica/veterinaria) y a la tarea de normalizacion por capitalizacion.
- Riesgo de falsos positivos en similitud: los ejemplos muestran similitud 1.0000 entre variantes de capitalizacion, lo que puede provocar que terminos distintos pero ortograficamente proximos se agrupen indebidamente.
- Modelo experimental y con validacion practicamente nula (12 descargas, 0 likes): no se han publicado benchmarks, evaluaciones ni revision por parte de la comunidad.
- No se documentan advertencias de uso fuera de alcance ni guias de filtrado de contenido en la model card.
- Fecha de creacion y actualizacion registradas en 2026: puede carecer de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seanfarrell/pettag_emed_train_test
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Articulo referenciado (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Articulo referenciado: https://arxiv.org/abs/1807.03748
