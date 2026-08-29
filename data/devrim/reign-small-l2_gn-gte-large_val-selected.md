# devrim/reign-small-l2_gn-gte-large_val-selected

## Resumen

REIGN small-l2 es un cross-chunk encoder para recuperación de documentos largos, desarrollado por Devrim Cavusoglu y Emre Akbas y presentado en Findings of EMNLP 2026. El modelo aborda el problema de escalar la longitud de contexto en bi-encoders de embeddings: en lugar de procesar tokens directamente, lee una secuencia de embeddings de chunks previamente generados por una red guía congelada (GTE-large, 335M de parámetros) y los agrega mediante mean pooling. El encoder REIGN es un transformer pequeño de 2 capas, dimensión 384, 6 cabezas y 3,85M de parámetros entrenables, lo que lo hace extremadamente ligero en comparación con la red guía. El checkpoint publicado contiene únicamente los pesos del encoder REIGN (4.092.416 parámetros en float32), y debe combinarse con GTE-large en tiempo de inferencia. Su relevancia radica en permitir retrieval documento-a-documento con contextos largos a un coste computacional reducido, ya que los embeddings de chunks se calculan una sola vez y se cachean.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 2 capas (d=384, 6 cabezas, FFN 1536) sobre red guía congelada GTE-large (335M) |
| Parametros totales | 4.092.416 (encoder REIGN, float32); 3,85M entrenables |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana de chunk de 512 tokens; secuencia de chunks ilimitada en la practica (el encoder agrega embeddings de chunks) |
| Tipos de cuantizacion | No disponible (solo safetensors float32) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN small-l2 es un cross-chunk encoder que opera sobre una secuencia de embeddings de chunks generados por la red guía GTE-large, la cual permanece congelada durante el entrenamiento. El encoder es una funcion simetrica de conjunto (sin señal de posicion) que aplica mean pooling sobre la secuencia de embeddings de chunks para producir un vector final L2-normalizado. El entrenamiento utiliza una funcion de perdida de embedding coseno de tres vias con objetivos graduados s ∈ {1, 0, −1} (positivo, parcial, negativo) y peso parcial λ = 0,5. Cada paso procesa 18 anclas × (1 positivo + 2 parciales + 17 negativos dentro del lote) = 360 pares. Se usa AdamW con lr 1e-5, weight decay 1e-4 y annealing coseno, durante 50 epocas con validacion cada 4 y seleccion por mejor nDCG@10 en el split de validacion. La precision es mixta de 16 bits, con seed 42 y embeddings de la red guia precomputados y cacheados. El entrenamiento se realizo en una unica GPU consumer de 24 GB. El dataset de entrenamiento es `devrim/goodwiki_long_synthetic_ir`, un corpus sintetico de documentos largos de Wikipedia.

## Capacidades

- Generacion de embeddings L2-normalizados para similitud coseno en tareas de retrieval documento-a-documento.
- Procesamiento de secuencias de chunks (multi-chunk) de longitud arbitraria, agregando embeddings de chunks mediante mean pooling.
- Recuperacion de documentos largos completos, no solo pasajes cortos.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio. Es exclusivamente un modelo de feature extraction.
- Capacidad multilingue limitada al ingles (unico idioma en el dataset y en la configuracion).

## Casos de uso

- Busqueda semantica en corpus de documentos cientificos: el modelo puede indexar articulos completos (por ejemplo, PDFs de varias paginas) dividiendolos en chunks de 512 tokens, generando embeddings por chunk con GTE-large y agregandolos con REIGN. Permite recuperar el documento completo mas relevante para una consulta, en lugar de solo un fragmento.
- Deduplicacion de documentos legales o tecnicos: al comparar embeddings de documentos largos, se pueden identificar versiones duplicadas o casi duplicadas en bases de datos corporativas, gracias a la capacidad de manejar contextos extensos sin perder informacion global.
- Clustering tematico de informes largos: agrupacion de documentos por similitud semantica global, util para organizar bibliotecas de informes anuales, patentes o expedientes.
- Sistemas RAG (Retrieval-Augmented Generation): como recuperador de documentos completos para alimentar un LLM generativo, el modelo proporciona contexto largo y coherente, mejorando la calidad de las respuestas en dominios especializados.
- Recomendacion de documentos relacionados: en plataformas de publicaciones academicas o prensa, se pueden sugerir articulos similares calculando la similitud coseno entre embeddings de documentos completos.
- Analisis de similitud entre versiones de documentos: comparacion de borradores o revisiones de contratos, normativas o especificaciones tecnicas para detectar cambios sustanciales a nivel global.

## Benchmarks y rendimiento

Los siguientes resultados son los reportados en el paper para este checkpoint exacto (no re-derivados):

| Benchmark | Metrica | Eval stride | Valor |
|---|---|---|---|
| LoCo (macro-avg, zero-shot) | nDCG@10 | s384 | 70,97 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s512 | 70,42 |
| DAPFAM test (zero-shot) | nDCG@100 | s384 | 32,55 |
| DAPFAM test (zero-shot) | nDCG@100 | s512 | 32,64 |

Nota: el valor de GoodWiki-Long in-distribution (67,27) reportado en la Tabla 7 del paper corresponde al checkpoint hermano `reign-small-l2_gn-gte-large_st-512_val-selected`, no a este.

## Requisitos de hardware

- Inferencia: requiere cargar tanto el encoder REIGN (4M parametros, ~16 MB en float32) como la red guia GTE-large (335M parametros, ~1,3 GB en float32 o ~670 MB en float16). La VRAM total estimada es de 1,5 a 2 GB, por lo que cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super). Para despliegues de alto rendimiento, GPUs de datacenter como A10 o A100 son adecuadas.
- Opciones de despliegue: no hay integracion con vLLM, Ollama o TGI. El unico metodo de uso es mediante el paquete `reign` instalado desde GitHub (`pip install git+https://github.com/devrimcavusoglu/reign.git`), que proporciona la clase `ReignBaselineEncoder`.
- Latencia y throughput: no disponibles en la informacion proporcionada. Depende del numero de chunks y de la GPU utilizada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (cross-chunk encoders para retrieval de documentos largos) en la informacion proporcionada. El modelo base GTE-large actua como red guia, pero no se reportan resultados de GTE-large solo en los benchmarks LoCo y DAPFAM. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con datos en ingles y solo soporta ese idioma.
- No es adecuado para inputs de un solo chunk (menos de 512 tokens): en ese regimen, el encoder REIGN no tiene nada que agregar y se debe usar la red guia directamente.
- El checkpoint solo contiene el encoder REIGN; la red guia GTE-large debe cargarse por separado y permanece congelada. Ambos son necesarios para la inferencia.
- El entrenamiento se realizo sobre datos sinteticos de Wikipedia (GoodWiki-Long-Synthetic), por lo que puede presentar sesgos hacia ese dominio y no generalizar perfectamente a otros tipos de documentos.
- Al ser un modelo de embeddings, no genera texto y no presenta riesgo de alucinacion, pero la calidad de los embeddings depende de la calidad de la red guia y de la coherencia de los chunks.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.
- La precision mixta de 16 bits durante el entrenamiento impide la reproducibilidad bit a bit; se deben comparar metricas, no pesos.

## Enlaces

- HuggingFace: https://huggingface.co/devrim/reign-small-l2_gn-gte-large_val-selected
- Codigo: https://github.com/devrimcavusoglu/reign
- Pagina del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of the Association for Computational Linguistics: EMNLP 2026 (to appear).
