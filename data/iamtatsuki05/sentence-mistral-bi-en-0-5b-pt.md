# iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT

## Resumen

Sentence-Mistral-Bi-EN-0.5B-PT es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 (proyecto MIREI) que envuelve el modelo base iamtatsuki05/Mistral-Bi-EN-0.5B-PT-stage2 mediante entrenamiento contrastivo débilmente supervisado. Su función es transformar texto en vectores densos de 1.536 dimensiones, pensados para tareas de similitud semántica, recuperación de información (retrieval) y búsqueda semántica. No es un modelo generativo: es un encoder bi-encoder que produce una única representación por secuencia.

La arquitectura subyacente es Mistral (transformer decoder adaptado a extracción de características con pooling de medias), con 518.702.592 parámetros totales (469M sin contar embeddings) y una longitud máxima de secuencia de 8.192 tokens. El vocabulario es el tokenizer de Mistral con 32.000 entradas y la codificación posicional es RoPE. Está entrenado exclusivamente en inglés y se distribuye bajo licencia MIT.

Su relevancia radica en formar parte de una serie homogénea de encoders de ~0,5B parámetros (ModernBERT, Llama, Sarashina, Qwen2.5, InstructLM y Mistral) entrenados con la misma receta sobre aproximadamente 16,1 millones de pares de entrenamiento, lo que permite comparar arquitecturas en condiciones controladas. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopción en producción es todavía marginal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer decoder adaptado a embeddings, pooling de medias) |
| Parametros totales | 518.702.592 (469M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers, requiere trust_remote_code) |
| Dimension del embedding | 1.536 |
| Metrica de similitud | coseno |
| Tokenizer | Mistral, vocabulario de 32.000 |
| Codificacion posicional | RoPE |
| Modelo base | iamtatsuki05/Mistral-Bi-EN-0.5B-PT-stage2 |
| Tamano del repo | 2,1 GB |

## Arquitectura y entrenamiento

El modelo parte de un backbone Mistral de ~0,5B parámetros y se convierte en un bi-encoder de frases mediante pooling de medias sobre las representaciones del transformer, generando un vector de 1.536 dimensiones por secuencia. La longitud máxima de entrada es de 8.192 tokens, con RoPE como codificación posicional, lo que permite manejar documentos largos sin truncamiento agresivo. El tokenizer es el nativo de Mistral con 32.000 tokens.

El entrenamiento consiste en ajuste contrastivo débilmente supervisado sobre los subconjuntos débilmente supervisados del dataset sentence-transformers/embedding-training-data, con aproximadamente 16,1 millones de pares. No se documenta en la información disponible el uso de RLHF, DPO ni una fase de instrucción específica; el autor describe la receta como "weakly supervised contrastive training". La serie MIREI aplica exactamente la misma receta a siete arquitecturas distintas para analizar el efecto de la arquitectura encoder/decoder en la calidad de los embeddings de frase, trabajo publicado en NLP2026.

## Capacidades

- Generación de embeddings de frase en inglés de 1.536 dimensiones con normalización opcional y similitud coseno.
- Recuperación de información (retrieval) densa: codificación independiente de consultas y documentos para búsqueda semántica.
- Similitud semántica entre pares de textos y clustering de documentos.
- Extracción de características (feature-extraction) mediante pipeline de transformers.
- Soporte de secuencias de hasta 8.192 tokens, adecuado para pasajes largos.
- Compatible con text-embeddings-inference y endpoints de Hugging Face (tag endpoints_compatible).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder, no un modelo generativo.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y código en una base vectorial usando los embeddings de 1.536 dimensiones y recuperar pasajes relevantes por similitud coseno, aprovechando la ventana de 8.192 tokens para fragmentos largos.
- Motor de preguntas y respuestas sobre base documental (RAG): codificar los chunks de conocimiento y las consultas del usuario por separado para alimentar un LLM generativo con el contexto recuperado.
- Deduplicación y clustering de textos: agrupar artículos, tickets o reseñas similares calculando la matriz de similitud coseno entre embeddings normalizados.
- Recomendación de contenido: emparejar descripciones de productos o artículos con perfiles de usuario representados como texto, usando la similitud entre embeddings.
- Clasificación zero-shot por prototipos: construir embeddings de etiquetas descriptivas y asignar la clase más cercana a cada documento, útil cuando no hay datos etiquetados.
- Filtrado de spam o contenido duplicado en pipelines de ingesta: comparar cada documento entrante contra un corpus de referencia con umbral de similitud coseno.
- Evaluación comparativa de arquitecturas: al compartir receta con la serie MIREI, sirve como baseline controlado para experimentos sobre encoders de ~0,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,1 GB solo para pesos (518M parámetros × 2 bytes), más overhead de activaciones y del runtime; en la práctica, entre 1,5 y 3 GB según el tamaño de lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños; A100, H100 o L40S para indexación masiva con alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; también en GPUs de 8 GB con lotes moderados.
- Opciones de despliegue: sentence-transformers (librería nativa), transformers con trust_remote_code, text-embeddings-inference (tag endpoints_compatible), vLLM no aplica por ser encoder; llama.cpp/Ollama no tienen pesos GGUF publicados.
- Requisitos de software declarados: sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3 (este último para la ruta de atención con flash_attention_2).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentence-Mistral-Bi-EN-0.5B-PT (este) | Mistral | 518M (469M sin emb.) | 8.192 | MIT | Hugging Face, 0 descargas |
| Sentence-ModernBERT-EN-0.5B-PT | ModernBERT | 677M (546M sin emb.) | no disponible | MIT (misma serie) | Hugging Face |
| Sentence-Llama-Bi-EN-0.5B-PT | Llama | 661M (530M sin emb.) | no disponible | MIT (misma serie) | Hugging Face |
| Sentence-Qwen2.5-Bi-EN-0.5B-PT | Qwen2.5 | 494M (357M sin emb.) | no disponible | MIT (misma serie) | Hugging Face |

Los cuatro modelos comparten la misma receta de entrenamiento débilmente supervisado sobre ~16,1M pares, por lo que la comparación aísla el efecto de la arquitectura. No se dispone de resultados de benchmarks que permitan ordenar su rendimiento relativo.

## Limitaciones y advertencias

- Solo inglés: no se declara soporte de otros idiomas, por lo que su uso en castellano produciría embeddings de baja calidad.
- Es un encoder, no un generador: no puede responder preguntas ni producir texto; debe combinarse con un LLM para tareas de RAG.
- Riesgo de sesgos heredados del corpus de entrenamiento (sentence-transformers/embedding-training-data) y del modelo base Mistral, sin documentación de mitigación en la model card.
- Riesgo de falsos positivos en similitud cuando los textos comparten vocabulario pero difieren en significado; conviene calibrar umbrales con datos propios.
- La longitud efectiva de contexto puede degradarse en los extremos de la ventana de 8.192 tokens; no hay evaluación publicada al respecto.
- Requiere trust_remote_code=True y código personalizado (tag custom_code), lo que implica revisar el código remoto antes de desplegar en producción.
- No hay pesos GGUF ni quantizaciones publicadas, lo que limita el despliegue en CPU o en GPUs de gama muy baja.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes): sin validación comunitaria ni informes de terceros.
- Licencia MIT permite uso comercial sin restricciones adicionales, pero no exime de las obligaciones de atribución de las licencias del modelo base y del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT
- Modelo base (stage2): https://huggingface.co/iamtatsuki05/Mistral-Bi-EN-0.5B-PT-stage2
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- README en japonés: README_JA.md (en el repositorio del modelo)
- Cita académica: Okada, R. y Sugimoto, T., "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", NLP2026 (言語処理学会第32回年次大会)
- Licencia MIT: https://opensource.org/license/mit/
