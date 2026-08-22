# ethicalabs/Echo-DSRN-v0.1.3-Embed-Exp

## Resumen

Echo-DSRN-v0.1.3-Embed-Exp es un modelo experimental de embeddings de frases desarrollado por ethicalabs, basado en la arquitectura recurrente-híbrida Echo-DSRN. Está diseñado para tareas de similitud semántica y representación de textos con complejidad lineal O(N) respecto a la longitud de secuencia, lo que permite una latencia submilisegundo en CPU y GPU y un consumo de memoria reducido. El modelo cuenta con 98,26 millones de parámetros, produce embeddings de 2048 dimensiones y está especializado en inglés.

Este modelo es relevante por su enfoque en eficiencia para entornos con recursos limitados, ya que combina un bloque recurrente (DSRN) con componentes de atención híbrida, logrando rendimientos competitivos en benchmarks de similitud semántica (STS) con una huella de memoria notablemente baja. Sin embargo, se trata de un modelo experimental y el propio autor advierte que no debe usarse en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Echo-DSRN (recurrent-hybrid, 8 capas, hidden dim 512, 4 cabezas de atención, vocab 32017) |
| Parametros totales | 98.264.064 (98,26M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (benchmarks hasta 2048 tokens; secuencias de 4096 tokens producen error fuera de rango) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (según model card; no confirmado en metadatos de HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Echo-DSRN, un diseño recurrente-híbrido que combina bloques recurrentes con mecanismos de atención lineal. Esta combinación permite una complejidad computacional O(N) con la longitud de secuencia, frente al O(N²) de los transformers estándar. La arquitectura consta de 8 capas recurrentes con dimensión oculta de 512, 4 cabezas de atención y un vocabulario de 32.017 tokens. El desglose de parámetros muestra que el 83,32% (81,87M) reside en los bloques recurrentes DSRN, mientras que el 16,68% corresponde a embeddings.

El entrenamiento se realizó en tres fases secuenciales: primero un preentrenamiento contrastivo con datasets de inferencia de lenguaje natural (NLI) para alinear el espacio de representación; después un ajuste fino específico para similitud semántica (STS); y finalmente una fase de generalización multitarea combinando tareas de recuperación NLI y similitud STS. Los datasets utilizados son `sentence-transformers/all-nli` y `mteb/sts-b`.

## Capacidades

- Genera embeddings de frases de 2048 dimensiones, optimizados para similitud semántica (coseno o producto punto).
- Soporta tareas de similitud textual semántica (STS) con rendimiento medido en correlación de Spearman.
- Procesa secuencias de hasta 2048 tokens con latencia lineal en la longitud.
- Funciona tanto en CPU como en GPU con huella de memoria reducida (menos de 1 GB de VRAM para secuencias de 2048 tokens).
- No soporta tool calling, agentes, ni generación de texto; es un modelo puramente de embeddings.

## Casos de uso

- **Búsqueda semántica en documentos**: indexar frases o párrafos de documentos técnicos y recuperar los más relevantes por similitud coseno. La dimensión de 2048 permite representaciones ricas para corpus medianos.
- **Clustering de textos**: agrupar noticias, tickets de soporte o artículos por tema usando los embeddings como características para algoritmos de clustering (K-means, HDBSCAN). La latencia baja permite procesar grandes volúmenes en lote.
- **Deduplicación de contenido**: detectar frases o párrafos duplicados o casi duplicados en bases de datos, útil en limpieza de datos o detección de plagio.
- **Sistemas de recomendación basados en contenido**: representar ítems textuales (productos, artículos, descripciones) y calcular similitudes para recomendar elementos relacionados.
- **Clasificación de intenciones**: como modelo de embeddings previo a un clasificador ligero (regresión logística o SVM) para rutas de intención en chatbots o asistentes, aprovechando su eficiencia en CPU.
- **Análisis de encuestas o feedback**: codificar respuestas abiertas para agrupar opiniones similares y extraer temas recurrentes sin necesidad de etiquetas previas.

## Benchmarks y rendimiento

El modelo reporta resultados en el benchmark MTEB STS (Semantic Textual Similarity), medidos con correlación de Spearman:

| Benchmark Task | Echo-DSRN-v0.1.3-Embed-Exp |
| :--- | :---: |
| STS12 | 0,6667 |
| STS13 | 0,7692 |
| STS14 | 0,7683 |
| STS15 | 0,8227 |
| STS16 | 0,7460 |
| STSBenchmark | 0,7293 |
| SICK-R | 0,7876 |
| **Promedio STS** | **0,7557** |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: entre 516 MB y 933 MB en GPU, dependiendo de la longitud de secuencia (128 a 2048 tokens).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM; funciona en tarjetas consumer como GTX 1080, RTX 2060 o superiores. No requiere GPU de datacenter.
- **CPU**: viable en CPU, con latencias de 48 ms (128 tokens) a 728 ms (2048 tokens) en un entorno no especificado.
- **Opciones de despliegue**: se carga con `sentence-transformers` y `trust_remote_code=True`. No se mencionan integraciones con vLLM, Ollama o TGI, por lo que el despliegue se limita a Python y a bibliotecas compatibles con sentence-transformers.
- **Throughput estimado**: en GPU, procesa secuencias de 512 tokens en ~32 ms, lo que permite decenas de peticiones por segundo en lote.

## Comparativa con modelos similares

La siguiente tabla compara con dos modelos de embeddings de tamaño similar del ecosistema sentence-transformers:

| Modelo | Parámetros | Dimensión embedding | Contexto máx. | Idiomas | Licencia |
| :--- | :---: | :---: | :---: | :--- | :--- |
| Echo-DSRN-v0.1.3-Embed-Exp | 98,26M | 2048 | no disponible (hasta 2048 en benchmarks) | inglés | Apache 2.0 (según model card) |
| all-MiniLM-L6-v2 | 22,7M | 384 | 256 | inglés | Apache 2.0 |
| BGE-small-en-v1.5 | 33,4M | 384 | 512 | inglés | MIT |

Echo-DSRN ofrece una dimensión de embedding mucho mayor (2048 frente a 384) y una complejidad O(N), pero con más parámetros. No hay datos de comparación directa de rendimiento en STS con estos modelos en la información disponible.

## Limitaciones y advertencias

- **Modelo experimental**: el autor advierte explícitamente que no debe desplegarse en entornos comerciales, empresariales o de misión crítica. Está pensado solo para investigación y evaluación académica.
- **Sin garantías**: se distribuye "as-is" sin garantías de ningún tipo; los desarrolladores no asumen responsabilidad por consecuencias derivadas de su uso no autorizado.
- **Solo inglés**: no soporta otros idiomas; el entrenamiento se realizó únicamente con datos en inglés.
- **Contexto limitado**: la longitud máxima efectiva parece estar en torno a 2048 tokens; secuencias de 4096 tokens producen un error fuera de rango.
- **Riesgo de alucinación**: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación es nulo, pero la calidad de la representación puede degradarse en dominios fuera de los datos de entrenamiento.
- **Licencia**: aunque la model card indica Apache 2.0, los metadatos de HuggingFace no la confirman; hay que verificar antes de cualquier uso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ethicalabs/Echo-DSRN-v0.1.3-Embed-Exp)
- [Repositorio GitHub del proyecto](https://github.com/ethicalabs-ai/Echo-DSRN/)
- [Working paper (PAPER.md)](https://github.com/ethicalabs-ai/Echo-DSRN/blob/main/PAPER.md)
- [Colección de modelos Echo-DSRN](https://huggingface.co/collections/ethicalabs/echo-dsrn)
- [Colección de modelos Echo-Hybrid](https://huggingface.co/collections/ethicalabs/echo-dsrn-hybrid)
- [Página de investigación en ethicalabs.ai](https://www.ethicalabs.ai/research/echo-dsrn/)
