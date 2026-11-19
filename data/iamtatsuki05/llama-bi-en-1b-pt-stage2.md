# iamtatsuki05/Llama-Bi-EN-1B-PT-stage2

## Resumen

Llama-Bi-EN-1B-PT-stage2 es un modelo de representaciones de frases (sentence embeddings) en ingles construido a partir de iamtatsuki05/Llama-EN-1B-PT-stage2, un modelo base de tipo Llama de aproximadamente 1.224 millones de parametros totales. El autor, iamtatsuki05, lo convierte en un encoder bidireccional siguiendo el enfoque LLM2Vec, de modo que el modelo deja de ser un generador autoregresivo y pasa a producir embeddings de oraciones y documentos aptos para recuperacion y similitud semantica.

La relevancia de esta ficha esta en que ejemplifica una tendencia concreta: reciclar modelos base de tipo decoder (Llama) como encoders bidireccionales para tareas de retrieval, sin entrenar un encoder desde cero. El modelo expone una API diferenciada con `encode_query` y `encode_document`, lo que sugiere un entrenamiento asimetrico orientado a recuperacion, y utiliza similitud coseno como metrica.

Se distribuye bajo licencia MIT, con pesos en safetensors dentro del ecosistema transformers, soporte de flash-attention 2 y una dimension de embedding de 1792 con un contexto maximo de 8192 tokens. El vocabulario es amplio (102.400 tokens, SentencePiece) y el modelo esta declarado exclusivamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder adaptado a encoder bidireccional estilo LLM2Vec) |
| Parametros totales | 1.224.038.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (la model card no lista cuantizaciones publicadas) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code`) |
| Dimension de embedding | 1.792 |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | Coseno |
| Modelo base | iamtatsuki05/Llama-EN-1B-PT-stage2 |
| Tamano del repo | 4,9 GB |
| Requisitos | transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0, flash-attn>=2.7.3 |

## Arquitectura y entrenamiento

El modelo parte de un transformer de tipo Llama y lo transforma en un encoder bidireccional siguiendo la receta LLM2Vec: se habilita la atencion bidireccional sobre el decoder original y se anade una capa de pooling para obtener una unica representacion vectorial por secuencia. El resultado es un modelo de 1B de parametros (excluyendo embeddings) con dimension oculta de 1792, contexto de 8192 tokens y RoPE como codificacion posicional. La model card indica que se trata de la etapa 2 (stage2) del pipeline, aunque no detalla la composicion exacta de los datos de entrenamiento ni el numero de tokens utilizados.

La innovacion principal es la exposicion de funciones separadas `encode_query` y `encode_document`, lo que implica un entrenamiento con pares asimetricos query-documento orientado a retrieval, en lugar de un unico encoder simetrico. No se especifican en la informacion disponible detalles sobre el uso de RLHF, DPO, decodificacion especulativa ni tecnicas adicionales de atencion lineal. La implementacion requiere codigo personalizado (`custom_code` y `trust_remote_code=True`), lo que indica que la logica de pooling y de encoding no esta en el core de transformers.

## Capacidades

- Generacion de embeddings de frases y documentos en ingles para similitud semantica y recuperacion de informacion.
- API asimetrica con `encode_query` y `encode_document`, adecuada para motores de busqueda y sistemas RAG.
- Similitud coseno como metrica nativa entre queries y documentos.
- Contexto de hasta 8192 tokens, lo que permite embeber documentos de varias paginas en una sola pasada.
- Compatible con text-embeddings-inference y endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de flash-attention 2 para inferencia eficiente en GPU.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Recuperacion aumentada (RAG): el modelo genera embeddings de chunks de documentacion y de la pregunta del usuario con `encode_query`/`encode_document`; con 8192 tokens de contexto se pueden indexar fragmentos largos sin trocear en exceso.
- Busqueda semantica en bases de conocimiento internas: indexar articulos, tickets o wikis en ingles y recuperar por similitud coseno, aprovechando la dimension 1792 para un equilibrio razonable entre calidad y coste de almacenamiento.
- Deduplicacion y clustering de textos: calcular embeddings de un corpus de noticias o resenas y agrupar por similitud para detectar duplicados o temas recurrentes.
- Filtrado de candidatos en pipelines de moderacion o clasificacion: usar la similitud con prototipos textuales para prefiltrar contenido antes de un modelo generativo mas caro.
- Evaluacion de similitud entre pares de frases en tareas de NLP: benchmarks de sentence similarity, paraphrase detection y entailment ligero sobre textos en ingles.
- Sistemas de recomendacion basados en contenido: embeber descripciones de productos o articulos y recomendar por cercania semantica al historial del usuario.
- Cache semantica de respuestas: comparar la query entrante con queries previas mediante coseno para reutilizar respuestas y reducir llamadas a un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 2,4-2,5 GB solo para pesos (1.224 millones de parametros a 2 bytes); con overhead de activaciones y contexto de 8192 tokens, prever 4-6 GB.
- En fp32: unos 4,9 GB solo de pesos, con picos superiores a 8 GB en contextos largos.
- GPU recomendadas para produccion: A100, H100 o L40S para alto throughput; RTX 4090 o A10G para despliegues de volumen medio.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 8 GB o mas en bf16/fp16; en GPUs de 6 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` y flash-attention 2; text-embeddings-inference (tag `text-embeddings-inference`); endpoints de Hugging Face. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---|---|---|---|---|
| Llama-Bi-EN-1B-PT-stage2 | 1,22 B | 8.192 | 1.792 | MIT | LLM2Vec sobre Llama, ingles |
| BGE-large-en-v1.5 | 0,335 B | 512 | 1.024 | MIT | Encoder BERT, ingles |
| E5-large-v2 | 0,335 B | 512 | 1.024 | MIT | Encoder BERT, multilingue |
| GTE-large-en-v1.5 | 0,435 B | 8.192 | 1.024 | Apache 2.0 | Encoder, contexto largo |

La comparativa se limita a parametros, contexto, dimension y licencia, ya que no hay datos de benchmarks publicados para este modelo que permitan contrastar calidad de retrieval. Frente a los encoders BERT clasicos, la ventaja declarada es el contexto de 8192 tokens y el mayor numero de parametros; la desventaja es la dependencia de `custom_code` y la ausencia de resultados publicados.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no se garantiza calidad en otros idiomas.
- No es un modelo generativo; no debe usarse para completar texto, razonar ni hacer tool calling.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar el repositorio antes de desplegar en produccion.
- Dependencia de flash-attention 2 y de versiones concretas de transformers y accelerate; puede complicar el despliegue en entornos con versiones fijas.
- No se han publicado benchmarks: la calidad real de retrieval es desconocida y debe validarse en el dominio objetivo antes de adoptarlo.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base, no documentado en la model card.
- Riesgo de alucinacion no aplica directamente al no generar texto, pero los embeddings pueden producir similitudes espurias en dominios alejados del entrenamiento.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El modelo tiene un numero muy bajo de descargas y likes, lo que sugiere poca validacion externa; tratarlo como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Llama-Bi-EN-1B-PT-stage2
- Modelo base: https://huggingface.co/iamtatsuki05/Llama-EN-1B-PT-stage2
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Licencia MIT: https://opensource.org/license/mit/
- Paper de referencia (NLP2026, en japones): titulo "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", autores 岡田 龍樹 y 杉本 徹; no se proporciona URL en la informacion disponible.
