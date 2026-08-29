# devrim/reign-tiny-l1_gn-bge-base_val-selected

## Resumen

REIGN `tiny-l1` es un codificador ligero de tipo *cross-chunk* desarrollado por Devrim Cavusoglu y Emre Akbas, presentado en el artículo *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling* (Findings of EMNLP 2026, en prensa). El modelo resuelve el problema de generar embeddings para documentos largos sin necesidad de procesar todos los tokens de una vez: en lugar de leer tokens, agrega una secuencia de embeddings de fragmentos (chunks) producidos por una red guía congelada, en este caso `BAAI/bge-base-en-v1.5` (110M parámetros). El codificador REIGN en sí es muy pequeño, con 631.104 parámetros entrenables, organizados en una única capa transformer de dimensión 192 y 3 cabezas de atención.

La relevancia de este modelo radica en su enfoque de escalado de contexto: al operar sobre embeddings de chunks en lugar de tokens, permite manejar documentos arbitrariamente largos con un coste computacional reducido y sin modificar la ventana de contexto del modelo base. Está pensado principalmente para recuperación de documentos (document-to-document retrieval) y tareas de búsqueda semántica sobre corpus extensos. El checkpoint liberado corresponde a una configuración de barrido experimental, por lo que no aparece en las tablas principales del artículo, pero se publica para completitud de la exploración de configuraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (1 capa transformer, d=192, 3 cabezas, FFN 768) + red guía BGE-base congelada (110M) |
| Parametros totales | 631.104 (solo el encoder REIGN; la red guía se carga por separado y permanece congelada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Depende del número de chunks; cada chunk corresponde a 512 tokens de la red guía, con stride de entrenamiento 384 (evaluación configurable) |
| Tipos de cuantizacion | No disponible (pesos en float32, safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura REIGN: un codificador ligero que recibe como entrada una secuencia de embeddings de chunks, previamente generados por una red guía congelada (BGE-base). El codificador REIGN es una única capa transformer con dimensión 192, 3 cabezas de atención y FFN de 768 unidades, que agrega la secuencia mediante *mean pooling*. No incorpora señal de posición de chunk, por lo que se comporta como una función simétrica sobre el conjunto de embeddings. La red guía, `BAAI/bge-base-en-v1.5`, se mantiene congelada y se carga por separado en tiempo de construcción.

El entrenamiento se realizó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir`, con una pérdida de coseno de tres vías (positivo, parcial, negativo) con peso parcial λ = 0.5. Se usó AdamW con lr 1e-5, weight decay 1e-4, annealing coseno, 50 épocas con validación cada 4, y selección del checkpoint por mejor nDCG@10 en validación. El entrenamiento se ejecutó en una GPU de consumo de 24 GB, con precisión mixta de 16 bits y embeddings de la red guía precomputados y cacheados. No se empleó RLHF ni DPO; el objetivo es puramente contrastivo.

## Capacidades

- Generación de embeddings de documentos largos: procesa documentos de longitud arbitraria dividiéndolos en chunks de 512 tokens (ventana de la red guía) y agregando sus embeddings.
- Recuperación de documentos (document-to-document retrieval): devuelve vectores L2-normalizados, de modo que la similitud coseno se calcula como producto escalar.
- Búsqueda semántica sobre corpus extensos: adecuado para indexar y consultar colecciones de documentos completos.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un encoder para retrieval.
- Multilingüe: no, solo inglés (la red guía BGE-base-en-v1.5 está entrenada para inglés).

## Casos de uso

- Recuperación de documentos legales o académicos: indexar contratos, patentes o artículos largos y buscar pasajes relevantes mediante similitud coseno, aprovechando la capacidad de manejar documentos completos sin truncamiento.
- Búsqueda semántica en bases de conocimiento internas: integrar el modelo en un pipeline de RAG para recuperar secciones de manuales o documentación técnica extensa.
- Deduplicación de documentos: comparar embeddings de documentos completos para detectar duplicados o versiones casi idénticas en grandes repositorios.
- Clasificación de documentos por similitud temática: agrupar informes, noticias o expedientes según su contenido semántico global.
- Sistemas de recomendación basados en contenido: generar embeddings de artículos o productos largos y recomendar elementos similares por proximidad vectorial.
- Indexación de archivos históricos o bibliotecas digitales: procesar libros o manuscritos digitalizados completos para permitir búsquedas por significado, no solo por palabras clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el artículo no reporta una fila para este checkpoint exacto, ya que se libera para completitud del barrido de configuraciones. Para los números de los checkpoints reportados, se remite al *model zoo* del repositorio y al artículo.

## Requisitos de hardware

- El encoder REIGN es extremadamente ligero (0.6M parámetros), pero requiere la red guía BGE-base (110M) para generar los embeddings de chunks. En total, la inferencia necesita cargar ambos modelos.
- VRAM estimada: BGE-base en float32 ocupa aproximadamente 440 MB; el encoder REIGN añade unos 2.5 MB. Con cuantización de la red guía (por ejemplo, int8) se puede reducir a ~220 MB. En total, cabe en GPUs con 4 GB o menos.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, T4). También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el código oficial (`pip install git+https://github.com/devrimcavusoglu/reign.git`) proporciona la clase `ReignBaselineEncoder`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el pequeño tamaño del encoder, la latencia estará dominada por la generación de embeddings de chunks con BGE-base.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría. El enfoque de REIGN (agregar embeddings de chunks de una red guía congelada) es relativamente novedoso y no se han publicado comparaciones directas con otros modelos de retrieval de documentos largos en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para otros idiomas.
- No debe usarse para inputs cortos (menos de un chunk de 512 tokens): en ese régimen, el codificador cross-chunk no tiene nada que agregar y el modelo no aporta valor; se recomienda usar la red guía directamente.
- No se han publicado benchmarks para este checkpoint concreto, por lo que su rendimiento real no está validado externamente.
- El entrenamiento con precisión mixta no es bit-reproducible; una reentrenamiento no producirá pesos idénticos.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (`goodwiki_long_synthetic_ir`) está bajo CC BY-SA 4.0, lo que puede imponer restricciones de atribución y share-alike si se redistribuyen derivados del dataset.
- Riesgo de alucinación: no aplica, al ser un modelo de embeddings y no generativo.
- Sesgos: al estar entrenado sobre Wikipedia (vía GoodWiki), puede reflejar sesgos presentes en ese corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-tiny-l1_gn-bge-base_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Red guía (BGE-base-en-v1.5): https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (en prensa).
