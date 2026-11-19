# iamtatsuki05/Mistral-Bi-EN-0.5B-PT-stage2

## Resumen

Mistral-Bi-EN-0.5B-PT-stage2 es un modelo de representaciones de frases (sentence embeddings) en inglés construido a partir del modelo base iamtatsuki05/Mistral-EN-0.5B-PT-stage2. Lo desarrolla el autor iamtatsuki05 dentro de la colección MIREI, y su función es convertir un decoder Mistral de aproximadamente 0,5B parámetros en un encoder bidireccional siguiendo el enfoque LLM2Vec. El resultado es un modelo que genera embeddings de frases y documentos para tareas de recuperación (retrieval), similitud semántica y feature extraction.

Frente a los encoders clásicos tipo BERT, este modelo aprovecha el conocimiento lingüístico de un LLM preentrenado y lo adapta a codificación bidireccional, lo que permite obtener representaciones densas de 1536 dimensiones con una ventana de hasta 8192 tokens. Es relevante para desarrolladores que quieren montar sistemas de búsqueda semántica o RAG sin depender de APIs propietarias, con un modelo pequeño (567.854.592 parámetros reales según safetensors) y licencia MIT.

El modelo está orientado exclusivamente al inglés, se distribuye en formato safetensors con librería transformers y requiere código personalizado (trust_remote_code) para exponer los métodos encode_query y encode_document. Su tamaño de repo es de 2,3 GB y su huella de descargas en Hugging Face es todavía muy reducida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mistral (decoder convertido a encoder bidireccional estilo LLM2Vec) |
| Parámetros totales | 567.854.592 (aprox. 0,5B no-embedding según model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no documentadas) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de embedding | 1536 |
| Tokenizer | Mistral, vocabulario de 32000 tokens |
| Codificación posicional | RoPE |
| Métrica de similitud | coseno |
| Librería | transformers (>= 4.51.0) |

## Arquitectura y entrenamiento

El modelo parte de un decoder Mistral de ~0,5B parámetros y lo transforma en un encoder bidireccional mediante el procedimiento LLM2Vec: se habilita atención bidireccional y se adapta el modelo para producir representaciones de frase en lugar de tokens autoregresivos. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; únicamente indica la conversión a encoder bidireccional y el uso de codificación posicional RoPE, vocabulario de 32000 tokens y dimensión de embedding de 1536.

La innovación principal es precisamente esa conversión de un LLM decoder en encoder de frases con métodos `encode_query` y `encode_document` diferenciados, lo que permite usar el modelo tanto para consultas como para documentos en pipelines de recuperación. No se documentan técnicas adicionales como decodificación especulativa o attention linear; el modelo no genera texto, solo produce embeddings.

## Capacidades

- Generación de embeddings de frases y documentos en inglés con dimensión 1536.
- Codificación diferenciada de consultas (`encode_query`) y documentos (`encode_document`) para retrieval.
- Similitud semántica mediante distancia coseno.
- Feature extraction de representaciones densas para clasificación, clustering o reranking.
- Soporte de contextos largos de hasta 8192 tokens, útil para documentos extensos.
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repo.
- No soporta tool calling, function calling ni agentes multi-step (no es un modelo generativo).
- Capacidades multilingües limitadas al inglés.
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar fragmentos de hasta 8192 tokens con `encode_document` y codificar la consulta del usuario con `encode_query` para recuperar los pasajes más relevantes por similitud coseno.
- RAG (retrieval-augmented generation): usar el modelo como recuperador en pipelines que alimentan un LLM generativo, aprovechando su tamaño reducido para desplegar el retriever en la misma GPU que el generador.
- Deduplicación y clustering de textos: generar embeddings de artículos, tickets o correos y agrupar por similitud para detectar duplicados o temas recurrentes.
- Reranking de resultados de búsqueda: combinar un retriever léxico (BM25) con este encoder para reordenar candidatos por relevancia semántica.
- Moderación y clasificación de contenido: usar los embeddings como features de entrada para clasificadores lineales de spam, toxicidad o categorización temática.
- Sistemas de recomendación de contenido textual: calcular similitud entre perfiles de usuario (documentos agregados) y artículos para sugerir lecturas afines.
- Evaluación de similitud de respuestas: en pipelines de QA, comparar la respuesta generada con la respuesta de referencia mediante similitud coseno de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,1-1,3 GB para los pesos (567,8M parámetros) más overhead de activaciones; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, entre otras, con margen amplio incluso para batches grandes.
- GPU profesionales recomendadas para alto throughput: A100, H100 o L40S para servir grandes volúmenes de embeddings.
- Opciones de despliegue: transformers con `trust_remote_code=True`, `device_map="auto"` y `attn_implementation="flash_attention_2"` (requiere flash-attn >= 2.7.3); text-embeddings-inference por los tags del repo; accelerate >= 1.6.0 y sentencepiece >= 0.2.0 como dependencias.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Bi-EN-0.5B-PT-stage2 | 567,8M | 8192 | 1536 | MIT | Hugging Face (transformers, safetensors) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de modelos comparables verificables; la comparativa se limita a las especificaciones del propio modelo.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- No es un modelo generativo: no produce texto, solo embeddings; no debe usarse para chat, código ni razonamiento.
- Requiere `trust_remote_code=True` y código personalizado del autor, lo que introduce dependencia de la implementación y riesgo en producción si el repo cambia.
- Alucinación: no aplica en sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios muy distintos del entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un LLM preentrenado en inglés, puede heredar sesgos de su corpus original.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base iamtatsuki05/Mistral-EN-0.5B-PT-stage2 y del Mistral original subyacente.
- Comunidad y adopción muy reducidas (5 descargas, 0 likes en el momento de la consulta), con poca validación externa.
- No se documentan cuantizaciones GGUF ni soporte en llama.cpp/Ollama; el despliegue está orientado a transformers y text-embeddings-inference.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/Mistral-Bi-EN-0.5B-PT-stage2
- Modelo base: https://huggingface.co/iamtatsuki05/Mistral-EN-0.5B-PT-stage2
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- GitHub: https://github.com/iamtatsuki05/MIREI
- Licencia MIT: https://opensource.org/license/mit/
- README en japonés: README_JA.md (referenciado en la model card)
