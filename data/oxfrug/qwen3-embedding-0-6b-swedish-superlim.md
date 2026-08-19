# oxfrug/qwen3-embedding-0.6b-swedish-superlim

## Resumen

El modelo `oxfrug/qwen3-embedding-0.6b-swedish-superlim` es un fine-tune del modelo de embeddings `Qwen/Qwen3-Embedding-0.6B` (596M parámetros), especializado en sueco y optimizado para las tareas de similitud semántica y recuperación de información de la suite de evaluación SuperLim-2. Desarrollado por el usuario oxfrug, el modelo combina dos fine-tunes distintos mediante una técnica de *weight soup* (mezcla de pesos), logrando superar al modelo de referencia sueco `KBLab/sentence-bert-swedish-cased` en ambas tareas publicadas: SweParaphrase y SweFAQ.

El modelo produce embeddings de 1024 dimensiones, hereda la arquitectura densa del Qwen3-Embedding-0.6B y mantiene la licencia Apache 2.0. Su relevancia radica en ofrecer una alternativa de alto rendimiento para procesamiento de lenguaje en sueco, un idioma con menos recursos que el inglés, utilizando un modelo compacto y eficiente que puede ejecutarse en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-Embedding-0.6B) |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el autor desaconseja cuantizacion de 4 bits) |
| Idiomas soportados | sueco (fine-tune); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del Qwen3-Embedding-0.6B, un transformer denso de 28 capas con embeddings de 1024 dimensiones y una ventana de contexto de 32.000 tokens. Sobre esta base, oxfrug realizó dos fine-tunes secuenciales en sueco: primero un entrenamiento con la función de pérdida CoSENT sobre todos los pares etiquetados del conjunto de entrenamiento de SweParaphrase (escala 1-5), y posteriormente un entrenamiento ligero con MNRL (*Multiple Negative Ranking Loss*) sobre los datos de SweFAQ y pares de preguntas-respuestas del dominio sanitario, usando el prefijo de consulta oficial de Qwen. Finalmente, los pesos de ambos modelos se combinaron mediante *weight soup* con proporciones 0.15 y 0.85 respectivamente, logrando un único checkpoint que mantiene el rendimiento en ambas tareas sin necesidad de ensemble en inferencia.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para similitud semantica, clustering y clasificacion.
- Similitud de frases y parafraseo en sueco, con resultados superiores a los modelos suecos previos en SweParaphrase.
- Recuperacion de informacion y busqueda semantica en sueco, especialmente en dominios de FAQ y atencion al cliente.
- Uso con prefijo de consulta (prompt_name="query") para tareas de retrieval, siguiendo el protocolo oficial de Qwen.
- Compatible con la libreria sentence-transformers y con Text Embeddings Inference (TEI) para despliegue en produccion.
- No requiere prompt para tareas de similitud semantica o clustering; solo para retrieval.

## Casos de uso

- Busqueda semantica en documentacion corporativa en sueco: el modelo puede indexar documentos internos y permitir consultas en lenguaje natural, gracias a su ventana de contexto de 32.000 tokens y embeddings de alta calidad.
- Atencion al cliente automatizada en sueco: integrado en un sistema de FAQ, el modelo recupera la respuesta mas relevante a partir de preguntas de usuarios, superando al modelo KBLab en la tarea SweFAQ (0.6055 frente a 0.5780).
- Deduplicacion y clustering de textos suecos: por ejemplo, agrupar articulos de noticias o comentarios de usuarios por similitud semantica usando los embeddings sin prompt.
- Deteccion de parafraseo en corpus suecos: util para identificar contenido duplicado o variaciones de una misma informacion en bases de datos textuales.
- Sistemas de recomendacion basados en contenido: generar embeddings de descripciones de productos o articulos en sueco para calcular similitudes y sugerir items relacionados.
- Fine-tuning posterior para tareas especificas: al ser un modelo de 0.6B con licencia Apache 2.0, puede adaptarse a dominios concretos (legal, medico, tecnico) con pocos datos etiquetados.

## Benchmarks y rendimiento

Resultados en el conjunto de test de SuperLim-2 (datos no vistos durante el entrenamiento):

| Modelo | SweParaphrase ρ (Spearman) | SweFAQ |
|--------|---------------------------:|-------:|
| KBLab v2.0 (re-ejecucion del autor) | 0.8207 | 0.5780 |
| Qwen3-Embedding-0.6B zero-shot | 0.7294 | 0.5229 |
| CoSENT parent | 0.8279 | 0.5229 |
| CoSENT→FAQ parent | 0.8205 | 0.5963 |
| **Este modelo (weight soup 0.15/0.85)** | **0.8226** | **0.6055** |

El modelo supera al KBLab en ambas tareas, aunque el margen en SweParaphrase es estrecho (+0.002). En dev, los resultados son 0.848 (SweParaphrase) y 0.645 (SweFAQ). El autor indica que usar solo 768 dimensiones reduce el rendimiento a 0.821 y 0.578, por lo que recomienda mantener las 1024 dimensiones completas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en precision fp16 (pesos de 0.6B parámetros), suficiente para cualquier GPU consumer moderna.
- En fp32 se requieren unos 2,4 GB de VRAM, aun viable en GPUs con 4 GB o mas.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, o cualquier GPU con al menos 2 GB de VRAM para inferencia en fp16.
- No se recomienda cuantizacion de 4 bits, ya que degrada el rendimiento en la tarea de similitud semantica.
- Despliegue compatible con sentence-transformers (Python), Text Embeddings Inference (TEI) de Hugging Face, y servidores de embeddings estandar.
- Latencia y throughput estimados: al ser un modelo de 0.6B, puede procesar cientos de frases por segundo en una GPU consumer; no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SweParaphrase ρ | SweFAQ | Licencia |
|--------|-----------:|---------:|----------------:|-------:|----------|
| oxfrug/qwen3-embedding-0.6b-swedish-superlim | 596M | 32k | 0.8226 | 0.6055 | Apache 2.0 |
| KBLab/sentence-bert-swedish-cased | ~124M (BERT base) | 512 | 0.8207 | 0.5780 | Apache 2.0 |
| oxfrug/bge-m3-swedish-superlim | 568M | 8k (BGE-M3) | 0.835 | 0.651 | MIT |

El modelo Qwen supera al KBLab en ambas tareas, pero queda por detras del modelo BGE-M3 fine-tune del mismo autor. La ventaja del Qwen es su mayor ventana de contexto (32k frente a 512 del KBLab) y su compatibilidad con el ecosistema Qwen.

## Limitaciones y advertencias

- El modelo es un fine-tune y weight soup, no una arquitectura nueva; sus capacidades estan limitadas al modelo base Qwen3-Embedding-0.6B.
- Solo ha sido evaluado en dos tareas de SuperLim (SweParaphrase y SweFAQ); no hay resultados publicados en otros benchmarks suecos o multilingues.
- El conjunto de test de SweFAQ tiene solo 109 items, lo que limita la significancia estadistica de la mejora (+3 items frente a la re-ejecucion de KBLab).
- No se recomienda cuantizar a 4 bits; el autor advierte que la ventaja en SweParaphrase se pierde (margen de +0.002).
- El modelo esta especializado en sueco; su rendimiento en otros idiomas no ha sido verificado y probablemente sea inferior al modelo base multilingue.
- Al ser un fine-tune sobre datos de SweParaphrase y SweFAQ, puede heredar sesgos presentes en esos conjuntos (dominio general y sanitario).
- No se ha publicado informacion sobre alucinaciones o comportamientos adversos; al ser un modelo de embeddings, no genera texto directamente, pero los embeddings pueden reflejar sesgos del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxfrug/qwen3-embedding-0.6b-swedish-superlim
- Modelo base Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio oficial Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Modelo comparativo KBLab/sentence-bert-swedish-cased: https://huggingface.co/KBLab/sentence-bert-swedish-cased
- Modelo comparativo oxfrug/bge-m3-swedish-superlim: https://huggingface.co/oxfrug/bge-m3-swedish-superlim
