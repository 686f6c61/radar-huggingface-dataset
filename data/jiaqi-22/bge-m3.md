# jiaqi-22/bge-m3

## Resumen

BGE-M3 es un modelo de embeddings textuales desarrollado por BAAI (Beijing Academy of Artificial Intelligence), presentado en el paper "BGE-M3: Multi-Lingual, Multi-Functionality, Multi-Granularity" (arXiv:2402.03216). Se trata de un modelo de recuperación de información que unifica tres funcionalidades de retrieval en un único sistema: dense retrieval, sparse retrieval y multi-vector retrieval (ColBERT). Esta versión concreta (`jiaqi-22/bge-m3`) es una réplica publicada por un usuario, con las mismas especificaciones que el modelo original de BAAI.

El modelo se basa en la arquitectura XLM-RoBERTa, extendida para soportar una longitud de contexto de hasta 8192 tokens, lo que permite procesar desde frases cortas hasta documentos largos. Es capaz de trabajar con más de 100 idiomas, lo que lo convierte en una opción de referencia para sistemas de recuperación multilingüe y RAG (Retrieval-Augmented Generation). Su licencia MIT permite uso comercial sin restricciones, y su formato de pesos es compatible con sentence-transformers, ONNX y text-embeddings-inference.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) |
| Parametros totales | no disponible (basado en XLM-RoBERTa-large, ~560M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (suele utilizarse FP16/BF16) |
| Idiomas soportados | más de 100 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, PyTorch |

## Arquitectura y entrenamiento

BGE-M3 se basa en XLM-RoBERTa-large, un modelo transformer encoder pre-entrenado sobre 100+ idiomas. Para extender la longitud de contexto a 8192 tokens, los autores utilizaron una fase de pre-entrenamiento adicional con RetroMAE (Retrogressive Masked Auto-Encoder), que permite adaptar el modelo a secuencias más largas. Posteriormente, se realizó un fine-tuning unificado con datos de recuperación multilingüe (`bge-m3-data`), combinando técnicas de dense retrieval, sparse retrieval y multi-vector retrieval en un solo entrenamiento.

El modelo no utiliza mecanismos de atención lineal ni decodificación especulativa; es un encoder puro orientado a la generación de embeddings. La innovación principal reside en su capacidad de producir simultáneamente tres tipos de representaciones: un vector denso (para búsqueda semántica), un vector sparse (similar a BM25, para coincidencia léxica) y múltiples vectores por token (para búsqueda multi-vector tipo ColBERT). Esto permite implementar recuperación híbrida sin necesidad de modelos adicionales.

## Capacidades

- Generación de embeddings para texto en más de 100 idiomas, con soporte multilingüe real.
- Dense retrieval: produce un vector de 1024 dimensiones para búsqueda semántica.
- Sparse retrieval: genera pesos de tokens (similares a BM25) para coincidencia léxica, sin coste adicional.
- Multi-vector retrieval (ColBERT): genera embeddings por token para búsqueda de precisión.
- Longitud de contexto de 8192 tokens, adecuada para documentos largos.
- Compatible con bibliotecas de recuperación como Vespa, Milvus y PySerini.
- Permite fine-tuning unificado con datos propios para tareas específicas.

## Casos de uso

- **Sistemas de recuperación híbrida en RAG**: combinar dense y sparse retrieval para mejorar la precisión en la recuperación de documentos. BGE-M3 puede generar ambos tipos de representaciones en una sola pasada, simplificando la implementación de pipelines híbridos.
- **Búsqueda multilingüe en bases de conocimiento**: recuperar pasajes en diferentes idiomas a partir de consultas en cualquier idioma, gracias a su soporte de más de 100 lenguas y su contexto de 8192 tokens.
- **Procesamiento de documentos legales y técnicos**: al aceptar entradas de hasta 8192 tokens, puede indexar y buscar en contratos, patentes o informes extensos sin necesidad de fragmentar el texto en trozos pequeños.
- **Clasificación y clustering de textos**: generar embeddings para agrupar o clasificar textos en múltiples idiomas, por ejemplo en análisis de encuestas o soporte al cliente.
- **Búsqueda semántica en motores de recomendación**: indexar productos o artículos y realizar búsquedas basadas en similitud semántica, con la ventaja de que también se pueden usar pesos sparse para filtros léxicos.
- **Fine-tuning para dominios específicos**: dado que el modelo está disponible con licencia MIT, se puede adaptar a dominios concretos (biomédico, legal, etc.) mediante entrenamiento con datos propios, manteniendo la capacidad multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. La model card menciona que en un benchmark independiente (realizado por @Yannael) BGE-M3 obtuvo el mejor rendimiento en inglés y otros idiomas, superando a modelos de OpenAI, pero no se incluyen métricas concretas. Se recomienda consultar el paper original (arXiv:2402.03216) para los resultados de evaluación en datasets como MIRACL, MLDR y otros.

## Requisitos de hardware

No se indican requisitos específicos en la información proporcionada. Dado que el modelo es un encoder transformer de tamaño similar a XLM-RoBERTa-large (aproximadamente 560 millones de parámetros), se estima que:

- Para inferencia en CPU: es posible con RAM suficiente (al menos 16 GB) y tiempo de procesamiento elevado para secuencias largas.
- Para inferencia en GPU: se recomienda al menos 8 GB de VRAM para batch pequeño y secuencias de 8192 tokens; una GPU como RTX 3090/4090 o A100 es adecuada.
- Opciones de despliegue: compatible con `sentence-transformers`, `text-embeddings-inference`, `ONNX Runtime`, y se puede usar en frameworks como Vespa y Milvus.
- No se dispone de datos de latencia o throughput concretos.

## Comparativa con modelos similares

| Modelo | Dimensión | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BGE-M3 | 1024 | 8192 | 100+ | MIT | safetensors, ONNX |
| BGE-large-en-v1.5 | 1024 | 512 | Inglés | MIT | safetensors |
| OpenAI text-embedding-3-large | 3072 | 8191 (aprox.) | 100+ | Propietaria | API |

BGE-M3 se diferencia de BGE-large-en-v1.5 por su soporte multilingüe y su contexto mucho más largo. Frente a OpenAI, ofrece la ventaja de ser open source y de generar múltiples tipos de embeddings (dense, sparse, multi-vector) en un solo modelo. No se dispone de comparativas numéricas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos lingüísticos**: aunque soporta más de 100 idiomas, el rendimiento puede variar considerablemente entre ellos; los idiomas con menos datos de entrenamiento pueden tener peores resultados.
- **Riesgo de alucinación**: al ser un modelo de embeddings, no genera texto, pero sus representaciones pueden reflejar sesgos presentes en los datos de entrenamiento.
- **Contexto largo**: aunque soporta 8192 tokens, el rendimiento en documentos extremadamente largos puede degradarse; se recomienda evaluar la calidad en el dominio de aplicación.
- **Licencia**: licencia MIT permite uso comercial, pero no se garantiza la exactitud de las representaciones en todos los contextos.
- **Repositorio**: el repositorio `jiaqi-22/bge-m3` no es el oficial (el oficial es `BAAI/bge-m3`). Se recomienda usar el modelo original para producción, ya que esta réplica puede no estar mantenida.

## Enlaces

- [Modelo original en HuggingFace: BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [Repositorio de esta réplica: jiaqi-22/bge-m3](https://huggingface.co/jiaqi-22/bge-m3)
- [Paper: BGE-M3](https://arxiv.org/pdf/2402.03216.pdf)
- [Código oficial: FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3)
- [Dataset MLDR](https://huggingface.co/datasets/Shitao/MLDR)
- [Dataset de fine-tuning bge-m3-data](https://huggingface.co/datasets/Shitao/bge-m3-data)
