# sachinyerrawar/bert-base-nli-fin-triplets-qlora

## Resumen

`sachinyerrawar/bert-base-nli-fin-triplets-qlora` es un modelo de embeddings de frases publicado en Hugging Face por el usuario sachinyerrawar. Se trata de un ajuste fino derivado de la familia Sentence-BERT, construido sobre una base BERT-base y entrenado —según el nombre del repositorio— con tripletas del dominio financiero ("fin-triplets") mediante QLoRA (cuantización de 4 bits con adaptadores de bajo rango). El resultado es un encoder que proyecta frases y párrafos a un espacio vectorial denso de 768 dimensiones, pensado para tareas de similitud semántica, clustering y búsqueda semántica.

El modelo cuenta con 109.482.240 parámetros totales (compatible con la configuración estándar de BERT-base, 12 capas y 768 dimensiones ocultas) y un tamaño de repositorio de 0,4 GB en formato safetensors. La longitud máxima de secuencia documentada en la arquitectura es de 128 tokens, con pooling de media (mean pooling) sobre las representaciones contextuales.

Es relevante ahora por dos motivos contrapuestos. Por un lado, los embeddings especializados en dominios verticales (finanzas, legal, biomédico) son cada vez más demandados para sistemas RAG y motores de búsqueda internos. Por otro, la model card incluida en el repositorio es una copia literal de la de `sentence-transformers/bert-base-nli-mean-tokens`, que el propio SBERT marca como **deprecada** por producir embeddings de baja calidad. El repositorio no documenta el proceso de entrenamiento ni publica métricas, por lo que su calidad real no está verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con pooling de media (SentenceTransformer) |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_seq_length documentada) |
| Tipos de cuantizacion | no disponible (el nombre sugiere entrenamiento con QLoRA, pero no se documentan pesos cuantizados publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |
| Dimension del embedding | 768 |
| Pooling | mean tokens |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder tipo BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~110 M de parámetros) envuelto en la clase `SentenceTransformer` con una capa de pooling de media. El pipeline declarado es `sentence-similarity` y la salida es un vector denso de 768 dimensiones por frase, normalizable para similitud coseno.

El entrenamiento, según indica el identificador del repositorio, habría utilizado tripletas del dominio financiero y la técnica QLoRA: congelación de los pesos base en 4 bits y entrenamiento de adaptadores de bajo rango. Sin embargo, la model card no describe el dataset, el número de tripletas, la función de pérdida (probablemente `TripletLoss` o `MultipleNegativesRankingLoss`, no confirmado), ni si los adaptadores se fusionaron con los pesos base. Tampoco se documenta ninguna innovación técnica adicional. La información disponible no permite verificar la composición ni el volumen de datos de entrenamiento.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio denso de 768 dimensiones.
- Similitud semántica entre pares de textos (pipeline `sentence-similarity`).
- Búsqueda semántica y recuperación de información mediante vecinos más cercanos.
- Clustering de documentos por similitud de representación.
- Extracción de características (`feature-extraction`) para pipelines posteriores.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un encoder de embeddings.
- Capacidad multilingüe: no disponible; el modelo base BERT es predominantemente inglés y no se documenta entrenamiento en otros idiomas.

## Casos de uso

- Búsqueda semántica en corpus financieros: indexar informes, notas de prensa o filings en una base vectorial y recuperar fragmentos relevantes por similitud coseno sobre los embeddings de 768 dimensiones. Adecuado si el corpus es mayoritariamente en inglés y las consultas son cortas (≤128 tokens).
- Deduplicación de noticias o comunicados: agrupar documentos casi idénticos calculando distancias entre embeddings y aplicando clustering (por ejemplo, HDBSCAN) sobre los vectores.
- Enrutado de tickets de soporte: clasificar consultas entrantes comparando su embedding con prototipos por categoría, siempre que las frases no superen la ventana de 128 tokens.
- Filtrado previo en pipelines RAG: usar el modelo como recuperador de primera etapa (bi-encoder) y un cross-encoder como re-ranker posterior, aprovechando su bajo coste computacional (~110 M de parámetros).
- Detección de similitud entre cláusulas o titulares: comparar pares de frases financieras para señalar duplicados o relaciones semánticas en herramientas de análisis.
- Prototipado rápido en CPU: al ser un modelo pequeño, permite experimentar con sentence-transformers en portátiles sin GPU, aunque con la advertencia de calidad indicada más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MTEB, STS, recuperación ni evaluación alguna del ajuste fino con tripletas financieras.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,45 GB de pesos más activaciones; en la práctica cabe holgadamente en cualquier GPU con ≥2 GB.
- VRAM en fp16/bf16: ~0,22 GB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A10G, L4, A100 o H100 con batching; para uso individual, RTX 3060/4060 en adelante.
- Cabe en GPU de consumo: sí, en cualquier GPU con ≥4 GB e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers`, `transformers` con mean pooling manual, Hugging Face Text Embeddings Inference (TEI), y servidores de embeddings compatibles con la API de OpenAI si se envuelve adecuadamente. No se documenta soporte GGUF/llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (~110 M de parámetros) se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Estado |
|---|---|---|---|---|---|
| sachinyerrawar/bert-base-nli-fin-triplets-qlora | 109,5 M | 128 tokens | 768 | Apache 2.0 | Publicado, sin métricas |
| sentence-transformers/bert-base-nli-mean-tokens | ~110 M | 128 tokens | 768 | Apache 2.0 | Deprecado por SBERT |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | Apache 2.0 | Recomendado por SBERT |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | 768 | MIT | Activo, con benchmarks MTEB |

La comparación con `all-MiniLM-L6-v2` y `bge-base-en-v1.5` es pertinente por categoría (bi-encoders para similitud y recuperación), pero no se dispone de métricas del modelo evaluado que permitan afirmar superioridad o inferioridad en tareas concretas.

## Limitaciones y advertencias

- La model card del repositorio es una copia de la de `sentence-transformers/bert-base-nli-mean-tokens`, que SBERT marca explícitamente como **deprecada** por generar embeddings de baja calidad. El autor no ha sustituido ese aviso ni ha aportado evaluación propia.
- No hay métricas publicadas: se desconoce si el ajuste fino con tripletas financieras mejora o degrada la calidad respecto al modelo base.
- Ventana de contexto muy corta (128 tokens): los textos largos se truncan y pierden información; no es adecuado para documentos completos sin chunking previo.
- Idiomas no documentados: el modelo base BERT es principalmente inglés; no se garantiza buen comportamiento en castellano.
- Riesgo de alucinación no aplica en sentido generativo (es un encoder), pero sí existe riesgo de recuperaciones semánticamente erróneas si los embeddings no están bien calibrados.
- Sesgos: no documentados; al derivar de BERT-base entrenado con datos web en inglés, es probable que herede sesgos de género, raza y dominio, sin que el autor los haya analizado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace recomendable validar el modelo en el dominio objetivo antes de desplegarlo en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El nombre sugiere entrenamiento con QLoRA, pero no se especifica si los adaptadores están fusionados en los pesos safetensors publicados; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachinyerrawar/bert-base-nli-fin-triplets-qlora
- Modelo base referenciado en la model card: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Documentación de Sentence-Transformers / SBERT: https://www.sbert.net
- Modelos recomendados por SBERT: https://www.sbert.net/docs/pretrained_models.html
