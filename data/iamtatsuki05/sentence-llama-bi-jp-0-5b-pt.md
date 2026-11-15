# iamtatsuki05/Sentence-Llama-Bi-JP-0.5B-PT

## Resumen

Sentence-Llama-Bi-JP-0.5B-PT es un modelo de embeddings de frases (sentence embeddings) para japones, desarrollado por iamtatsuki05 dentro de la coleccion MIREI. Se construye a partir del modelo base iamtatsuki05/Llama-Bi-JP-0.5B-PT-stage2, un transformer de arquitectura Llama de aproximadamente 0,66 mil millones de parametros, sobre el que se aplica aprendizaje contrastivo debilmente supervisado con el dataset cl-nagoya/ruri-dataset-v2-pt. El resultado es un encoder bidireccional que produce representaciones densas de 1.280 dimensiones mediante mean pooling, pensadas para tareas de retrieval y similitud semantica en japones.

El modelo resuelve el problema de obtener embeddings de alta calidad para japones reutilizando la arquitectura Llama en configuracion bi-encoder, en lugar de depender exclusivamente de encoders tipo BERT. Su contexto maximo de 8.192 tokens y su vocabulario SentencePiece de 102.400 entradas lo hacen adecuado para documentos largos y vocabulario japones amplio. Forma parte de una serie comparativa (junto a variantes ModernBERT y Sarashina) entrenada bajo condiciones homogeneas, lo que permite analizar el rendimiento de arquitecturas encoder frente a decoder en tareas de sentence embedding.

Es relevante ahora porque el ecosistema de embeddings japoneses de codigo abierto esta creciendo y este modelo ofrece una alternativa ligera (0,5B) con licencia MIT, integrable en sentence-transformers y compatible con text-embeddings-inference, lo que facilita su despliegue en pipelines de busqueda semantica y RAG para contenido en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder adaptado a bi-encoder con LLM2Vec) |
| Parametros totales | 661.976.320 (661M; 530M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.280 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama, con codificacion posicional RoPE y un tokenizer SentencePiece de vocabulario 102.400. Sobre el checkpoint base iamtatsuki05/Llama-Bi-JP-0.5B-PT-stage2 se aplica aprendizaje contrastivo debilmente supervisado utilizando el dataset cl-nagoya/ruri-dataset-v2-pt, siguiendo el paradigma LLM2Vec para convertir un modelo decoder en un encoder de frases. La representacion final se obtiene mediante mean pooling, produciendo vectores de 1.280 dimensiones comparables por similitud coseno.

Segun la model card, cada encoder de la serie MIREI se entrena con aproximadamente dos millones de pares debilmente supervisados por subconjunto del dataset ruri-dataset-v2-pt. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO; estos datos deben considerarse no disponibles. La innovacion principal es la comparacion sistematica de arquitecturas (ModernBERT, Llama y Sarashina) bajo condiciones de entrenamiento homogeneas para analizar el rendimiento de embeddings de frases, segun la publicacion asociada (NLP2026).

## Capacidades

- Generacion de embeddings de frases en japones para similitud semantica y retrieval.
- Extraccion de caracteristicas (feature-extraction) mediante mean pooling sobre representaciones de 1.280 dimensiones.
- Soporte de documentos largos gracias a una ventana de contexto de 8.192 tokens.
- Busqueda semantica y ranking de documentos por similitud coseno.
- Integracion nativa con sentence-transformers (version >= 4.1.0) y con text-embeddings-inference.
- Compatibilidad con endpoints (tag endpoints_compatible) y despliegue via transformers (>= 4.51.0) y accelerate (>= 1.6.0).
- Capacidad monolingue: disenado especificamente para japones; no se documenta soporte multilingue.
- No es un modelo generativo: no realiza tool calling, function calling ni razonamiento multi-paso; su funcion es exclusivamente de encoding.

## Casos de uso

- Busqueda semantica en japones: indexar documentos con embeddings de 1.280 dimensiones y recuperar los mas relevantes por similitud coseno, aprovechando el contexto de 8.192 tokens para fragmentos largos.
- RAG (generacion aumentada por recuperacion) sobre corpus japoneses: usar el modelo como retriever en pipelines que alimenten a un LLM generativo, dado su bajo coste computacional (0,5B) y su compatibilidad con text-embeddings-inference.
- Deduplicacion y agrupamiento de documentos: calcular similitudes entre pares de textos japoneses para detectar duplicados o agrupar contenido tematicamente.
- Sistemas de recomendacion de contenido: comparar la representacion de consultas de usuario con la de articulos o productos en japones para ordenar resultados.
- Clasificacion y filtrado por similitud: usar los embeddings como features de entrada para clasificadores ligeros en tareas de moderacion o enrutamiento de tickets de soporte escritos en japones.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud semantica entre una referencia y una hipotesis en japones mediante cosine similarity.
- Analisis de conversaciones multi-turno: codificar historiales largos (hasta 8.192 tokens) para tareas de recuperacion de contexto en asistentes conversacionales en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo de 661M parametros requiere aproximadamente 1,3-1,5 GB de pesos; con overhead de activaciones y batch, se recomienda al menos 4 GB de VRAM para uso comodo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; para alto throughput en servidor, A100 o H100 resultan sobredimensionadas pero validas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: sentence-transformers, transformers con accelerate, text-embeddings-inference (compatible segun tags), y llama.cpp/Ollama no estan documentados para este modelo de embeddings.
- Requisitos de software: sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3 para atencion optimizada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentence-Llama-Bi-JP-0.5B-PT (este) | Llama | 661M (530M sin emb.) | 8.192 | MIT | Hugging Face |
| Sentence-ModernBERT-JP-0.5B-PT | ModernBERT | 679M (548M sin emb.) | no disponible | MIT (misma serie) | Hugging Face |
| Sentence-Sarashina-Bi-0.5B-PT | Llama | 661M (530M sin emb.) | no disponible | MIT (misma serie) | Hugging Face |

Las tres variantes pertenecen a la misma coleccion MIREI y se entrenan con aproximadamente dos millones de pares debilmente supervisados por subconjunto del dataset ruri-dataset-v2-pt, lo que permite comparar arquitecturas bajo condiciones homogeneas. No se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monolingue: optimizado exclusivamente para japones; su rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- No es un modelo generativo: no debe usarse para tareas de generacion de texto, razonamiento, codigo o tool calling.
- Riesgo de sesgos: al entrenarse con un dataset debilmente supervisado (ruri-dataset-v2-pt), puede heredar sesgos presentes en los datos; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: no aplica en sentido generativo, pero la similitud coseno puede producir falsos positivos en retrieval si los textos comparten vocabulario superficial.
- Limitacion de contexto: aunque soporta 8.192 tokens, textos mas largos requieren truncado o fragmentacion, con posible perdida de informacion.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero se recomienda revisar los terminos del modelo base y del dataset de entrenamiento.
- Dependencia de `trust_remote_code=True`: el modelo requiere codigo personalizado, lo que implica ejecutar codigo del autor y revisar su procedencia en entornos de produccion.
- Requisitos de version: necesita sentence-transformers >= 4.1.0 y flash-attn >= 2.7.3, lo que puede complicar la integracion en stacks antiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-0.5B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/Llama-Bi-JP-0.5B-PT-stage2
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/ruri-dataset-v2-pt
- Variante ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-0.5B-PT
- Variante Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-0.5B-PT
- README en japones: README_JA.md (en el repositorio del modelo)
- Licencia MIT: https://opensource.org/license/mit/
