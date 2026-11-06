# Eranex-Tech/eranex-embed-v1.0-base

## Resumen

eranex-embed-v1.0-base es un encoder de frases multilingüe de tipo backbone, desarrollado por Eranex-Tech, construido sobre una arquitectura de modelo de espacio de estados (SSM) Mamba bidireccional en lugar del transformer clásico. Con 14,5 millones de parámetros y representaciones densas de 128 dimensiones, está diseñado como base para ajuste fino posterior en tareas de clasificación, análisis de sentimiento, adaptación de dominio y extracción de características, no como modelo listo para búsqueda semántica zero-shot. Cubre cuatro idiomas: turco, inglés, español y alemán.

El modelo se preentrenó en dos fases: primero con enmascaramiento de lenguaje (MLM) sobre aproximadamente un millón de documentos filtrados por idioma de mC4, y después con Translation Language Modeling (TLM) sobre pares paralelos de OPUS-100 para alinear los espacios de representación entre idiomas. La innovación principal es el uso de capas Mamba bidireccionales con complejidad lineal O(N) en lugar de la atención cuadrática, lo que reduce el coste computacional en secuencias largas y permite despliegue en CPU, GPU de gama baja e incluso entornos de navegador mediante ONNX.

Su relevancia actual radica en dos factores: la ventana de contexto de 1024 tokens con coste lineal y el tamaño reducido (0,1 GB de repo), que lo sitúan como alternativa ligera a encoders transformer de tamaño similar para escenarios con restricciones de memoria o latencia. No obstante, el propio autor advierte que las representaciones sin ajuste contrastivo presentan anisotropía, por lo que para búsqueda semántica o RAG recomienda su variante `Eranex-Embedding-Search`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba SSM bidireccional (modelo de espacio de estados) |
| Parametros totales | 14.534.017 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (no se especifican en la model card; al ser un modelo de 14,5M es viable fp32/fp16/bf16 e int8) |
| Idiomas soportados | turco (tr), inglés (en), español (es), alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con `custom_code`, requiere `trust_remote_code=True`) |
| Dimension de embedding | 128 |
| Libreria | transformers |
| Pipeline | feature-extraction |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El backbone emplea capas Mamba bidireccionales, un tipo de modelo de espacio de estados con complejidad lineal respecto a la longitud de secuencia, en contraposición a la atención cuadrática de los transformers. La salida es un vector pooled de 128 dimensiones por secuencia, pensado para alimentar cabezas de clasificación o índices vectoriales compactos. El modelo requiere código personalizado (`custom_code`) y se carga con `AutoModel.from_pretrained(..., trust_remote_code=True)`.

El entrenamiento se organizó en dos fases. La primera, MLM multilingüe, usó aproximadamente 1.000.000 de documentos curados por idioma procedentes de mC4, con filtros de longitud (150 a 5.000 caracteres) y ratio alfanumérico mínimo del 60 %. La segunda fase aplicó Translation Language Modeling sobre pares de frases paralelas de OPUS-100 para alinear los espacios de representación entre los cuatro idiomas. La optimización empleó precisión mixta bfloat16, optimizador AdamW de 8 bits y streaming con memory-mapping desde disco. No se documenta uso de RLHF ni DPO, lo cual es coherente con un encoder MLM.

## Capacidades

- Extracción de características densas y representaciones de frase de 128 dimensiones.
- Modelado de lenguaje enmascarado (MLM) multilingüe sobre tr, en, es y de.
- Alineación cross-lingual mediante TLM, con espacio de representación compartido entre los cuatro idiomas.
- Ajuste fino para clasificación de intención, análisis de sentimiento, detección de temas y adaptación de dominio.
- Inferencia con coste lineal en longitud de secuencia gracias a las capas Mamba.
- Despliegue en CPU, GPU y entornos de navegador vía ONNX (según la model card).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de intención en asistentes conversacionales: se añade una cabeza lineal sobre el vector de 128 dimensiones y se ajusta con datos propios del dominio; el tamaño reducido permite ejecutar el encoder en CPU con latencia baja.
- Análisis de sentimiento multilingüe: el espacio alineado tr/en/es/de permite entrenar una única cabeza de clasificación que funcione sobre reseñas en los cuatro idiomas sin duplicar modelos.
- Deduplicación y clustering de documentos: los embeddings de 128 dimensiones ocupan poco en un índice vectorial (512 bytes en fp32 por vector), lo que abarata el almacenamiento en comparación con embeddings de 768 o 1024 dimensiones.
- Filtrado previo en pipelines de datos: extracción de características sobre grandes volúmenes de texto mC4-like para clasificar calidad o temática antes de un procesamiento más caro, aprovechando el coste lineal en secuencias de hasta 1024 tokens.
- Detección de similitud entre pares de frases bilingües: útil para minería de bitextos y control de calidad de memorias de traducción, aunque con las precisiones Top-1 documentadas (10,7 %–27,1 %), que limitan su uso a etapas de prefiltrado.
- Extracción de características para modelos downstream ligeros: servir como encoder congelado en sistemas de clasificación de bajo consumo en dispositivos edge o en el navegador mediante ONNX.
- Base para ajuste fino con objetivos contrastivos propios: punto de partida para quien quiera construir su propio modelo de búsqueda semántica con datos de dominio, en lugar de usar la variante ya calibrada del autor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre splits de validación holdout.

MLM (enmascaramiento de lenguaje):

| Idioma | Accuracy | Loss | Perplexity | Tokens enmascarados |
|---|---|---|---|---|
| Turco (tr) | 57,56 % | 2,1761 | 8,81 | 443.530 |
| Inglés (en) | 53,30 % | 2,4346 | 11,41 | 382.107 |
| Español (es) | 57,91 % | 2,1194 | 8,33 | 499.195 |
| Alemán (de) | 56,70 % | 2,2341 | 9,34 | 501.900 |
| Global | 56,53 % | 2,2411 | 9,40 | 1.826.732 |

Similitud semántica textual (correlación de Spearman):

| Idioma | Spearman | p-valor | Pares de frases |
|---|---|---|---|
| Turco (tr) | 0,5202 | p < 0,001 | 1.379 |
| Inglés (en) | 0,5743 | p < 0,001 | 1.379 |
| Español (es) | 0,5612 | p < 0,001 | 1.379 |
| Alemán (de) | 0,5938 | p < 0,001 | 1.379 |
| Global | 0,5550 | p < 0,001 | 5.516 |

Minería de bitextos cross-lingual (Top-1 accuracy):

| Par de idiomas | Top-1 | MRR | Pares |
|---|---|---|---|
| tr → en | 10,70 % | 0,1767 | 1.000 |
| es → en | 23,60 % | 0,3294 | 1.000 |
| de → en | 27,10 % | 0,3676 | 1.000 |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (14,5M parámetros ≈ 58 MB de pesos) y en torno a 30 MB en fp16/bf16; el cuello de botella es el estado de activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o una T4 quedan sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo (GTX 1050, RTX 3050, RTX 4060) y en iGPU modernas.
- Despliegue: transformers con `trust_remote_code=True`; conversión a ONNX viable para navegador y edge; no se documenta soporte nativo en vLLM, llama.cpp u Ollama, y al ser un encoder no es el objetivo de esas herramientas.
- Latencia y throughput: no se han publicado mediciones concretas; la model card solo afirma complejidad lineal O(N) frente a atención cuadrática en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Arquitectura | Disponibilidad |
|---|---|---|---|---|---|---|
| eranex-embed-v1.0-base | 14,5M | 1024 | 128 | Apache 2.0 | Mamba SSM bidireccional | Hugging Face |
| all-MiniLM-L6-v2 | 22,7M | 256 | 384 | Apache 2.0 | Transformer | Hugging Face |
| paraphrase-multilingual-MiniLM-L12-v2 | 118M | 128 | 384 | Apache 2.0 | Transformer | Hugging Face |
| multilingual-e5-small | 118M | 512 | 384 | MIT | Transformer | Hugging Face |

La comparación es orientativa: los tres modelos transformer citados son encoders ya calibrados con objetivos contrastivos, mientras que eranex-embed-v1.0-base es un backbone MLM que requiere ajuste fino para búsqueda semántica. En tamaño, es el más pequeño de la lista; en contexto, supera a MiniLM y a multilingual-e5-small, pero queda por debajo de muchos encoders modernos de 512–8192 tokens. No hay datos públicos que permitan comparar Spearman en STS entre estos modelos y eranex-embed-v1.0-base en condiciones equivalentes.

## Limitaciones y advertencias

- Anisotropía de embeddings: el autor advierte explícitamente que, al ser un backbone MLM sin alineación contrastiva, las representaciones no son adecuadas para búsqueda semántica zero-shot ni RAG directo; para ello debe usarse `Eranex-Embedding-Search`.
- Rendimiento en bitext mining bajo: Top-1 de 10,7 % en tr→en y MRR de 0,1767, lo que limita su uso en minería de traducciones sin una etapa posterior de reordenación.
- Cobertura lingüística restringida a cuatro idiomas; no se documenta comportamiento en otros idiomas.
- Contexto máximo de 1024 tokens; textos más largos requieren truncado o segmentación.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de representaciones pobres o sesgadas en dominios alejados de mC4 y OPUS-100.
- Sin datos publicados sobre sesgos demográficos, de género o culturales; el preentrenamiento en mC4 puede heredar sesgos de la web.
- Licencia Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `custom_code` antes de desplegar en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa inexistentes, lo que aumenta el riesgo de bugs no detectados.
- No hay soporte documentado para cuantización GGUF ni para inferencia con llama.cpp/Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eranex-Tech/eranex-embed-v1.0-base
- Dataset mC4 (allenai): https://huggingface.co/datasets/allenai/c4
- Dataset OPUS-100 (Helsinki-NLP): https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Dataset STS Benchmark (sentence-transformers): https://huggingface.co/datasets/sentence-transformers/stsb
- Dataset STS Turkish (emrecan): https://huggingface.co/datasets/emrecan/stsb-mt-turkish
- Dataset STS multi (mteb): https://huggingface.co/datasets/mteb/stsb_multi_mt
