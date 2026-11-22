# nebhailema/afrixir-multivector-mini

## Resumen

AfriXIR multi-vector mini es un modelo de recuperación de información (retrieval) de tipo multi-vector encoder, desarrollado por el usuario nebhailema y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base Davlan/afro-xlmr-mini, un transformer XLM-RoBERTa de 117.640.704 parámetros, especializado en ocho lenguas africanas: amárico (am), hausa (ha), oromo (om), shona (sn), somalí (so), suajili (sw), yoruba (yo) y zulú (zu).

El modelo resuelve el problema de la búsqueda semántica y el passage retrieval en lenguas africanas de bajos recursos, un ámbito donde los retrievers densos convencionales tienen un rendimiento limitado por la escasez de datos de entrenamiento. Para ello emplea late interaction (MaxSim) sobre secuencias de vectores token-level de 128 dimensiones, una arquitectura inspirada en ColBERT que permite una puntuación más fina que la similitud de un único vector por pasaje.

Es relevante ahora porque combina un modelo base multilingüe ya consolidado para lenguas africanas con un corpus de entrenamiento específico (AfriXIR, 112.864 ejemplos) y una interfaz estándar de sentence-transformers, lo que facilita su integración en pipelines de RAG y motores de búsqueda para mercados africanos. La ventana de contexto es corta (180 tokens para documentos, 32 para consultas), lo que lo orienta a fragmentos cortos y no a documentos largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-Vector Encoder (XLM-RoBERTa + capa densa 384→128 + MaxSim) |
| Parámetros totales | 117.640.704 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 180 tokens (documento); 32 tokens (consulta) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `MultiVectorEncoder` compuesto por cuatro módulos: un transformer `XLMRobertaModel` en modo feature-extraction que produce `last_hidden_state`; una capa densa sin sesgo que proyecta de 384 a 128 dimensiones con activación identidad; una `MultiVectorMask` que filtra tokens de puntuación en documentos mediante una skiplist de símbolos; y una normalización final de los embeddings token-level. La similitud se calcula con MaxSim, la función de late interaction característica de ColBERT, que suma las similitudes máximas entre cada token de la consulta y todos los tokens del documento.

El fine-tuning se realizó sobre el dataset AfriXIR (112.864 ejemplos) con la pérdida `CachedMultiVectorMultipleNegativesRankingLoss`, una variante de contrastive learning con negativos en batch cacheada para eficiencia de memoria. El modelo base, afro-xlmr-mini, aporta el conocimiento multilingüe previo sobre las ocho lenguas objetivo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a retrievers).

## Capacidades

- Generación de embeddings token-level de 128 dimensiones para consultas y documentos, con puntuación por late interaction (MaxSim).
- Recuperación de pasajes (passage retrieval) en ocho lenguas africanas: amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú.
- Búsqueda semántica multilingüe dentro del conjunto de lenguas soportadas.
- Filtrado de tokens de puntuación en documentos mediante máscara configurable (skiplist).
- Integración nativa con la librería sentence-transformers mediante la clase `MultiVectorEncoder`.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de extracción de features para retrieval.

## Casos de uso

- Motor de búsqueda documental en suajili: indexar fragmentos de hasta 180 tokens de artículos, actas o prensa y recuperar los pasajes relevantes para consultas cortas de hasta 32 tokens, usando MaxSim para mayor precisión que un bi-encoder denso.
- RAG sobre corpus africanos: servir como retriever en un pipeline de generación aumentada, donde el LLM generador recibe los pasajes recuperados por AfriXIR; su ventana corta encaja con la fragmentación típica de un índice vectorial.
- Atención al cliente en hausa o yoruba: buscar respuestas en una base de conocimiento FAQ fragmentada y devolver los pasajes más similares a la consulta del usuario.
- Búsqueda en archivos periodísticos multilingües: indexar noticias en amárico, somalí o zulú y permitir consultas cruzadas dentro del mismo índice, aprovechando que el espacio de embeddings es compartido entre las ocho lenguas.
- Deduplicación y clustering de pasajes: usar los embeddings token-level para detectar duplicados o agrupar documentos temáticamente en corpus de bajos recursos.
- Evaluación de sistemas de recuperación: emplearlo como baseline multilingüe africano en experimentos de IR, comparándolo con bi-encoders como los de la familia multilingual-e5.
- Filtrado de candidatos en pipelines de moderación o curación de datos: recuperar pasajes similares a patrones definidos para revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 117,6 millones de parámetros, los pesos en fp32 ocupan aproximadamente 470 MB; en fp16 unos 235 MB; en int8 unos 118 MB. A ello hay que sumar el overhead de activaciones y del índice multi-vector (cada documento genera hasta 180 vectores de 128 dimensiones, lo que incrementa el almacenamiento del índice).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para el modelo; una RTX 3060, RTX 4090, A100 o H100 lo ejecutan sin problema. Para indexación a gran escala conviene una GPU con buen ancho de banda (A100/H100).
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: sentence-transformers (nativo, clase `MultiVectorEncoder`), text-embeddings-inference (soportado según tags), y endpoints de Hugging Face. El soporte en vLLM, llama.cpp u Ollama no está indicado en la información disponible y es poco probable para un encoder multi-vector de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Idiomas | Licencia |
|---|---|---|---|---|---|
| AfriXIR multi-vector mini | 117,6 M | 180 tokens (doc) / 32 (query) | Multi-vector (ColBERT) | 8 lenguas africanas | Apache 2.0 |
| Davlan/afro-xlmr-mini (base) | ~117,6 M | 512 tokens (típico XLM-R) | Encoder denso | Lenguas africanas | no disponible en esta ficha |
| ColBERTv2 (inglés) | ~110 M | 180/32 tokens | Multi-vector | Inglés | BSD-3 / MIT según variante |
| multilingual-e5-small | ~118 M | 512 tokens | Bi-encoder denso | Multilingüe (incluye algunas africanas) | MIT |

La comparación con ColBERTv2 y multilingual-e5-small se ofrece como referencia de categoría; no se dispone de métricas de rendimiento comparadas en la información proporcionada. La principal diferencia de AfriXIR frente a los bi-encoders es el esquema de late interaction, que mejora la precisión a costa de un índice mucho mayor (un vector por token en lugar de uno por documento).

## Limitaciones y advertencias

- Ventana de contexto muy corta: 180 tokens por documento y 32 por consulta. No es adecuado para documentos largos sin fragmentación previa.
- Solo cubre ocho lenguas africanas; fuera de ellas el rendimiento no está garantizado ni documentado.
- El índice multi-vector ocupa mucho más espacio que un bi-encoder: hasta 180 vectores de 128 dimensiones por documento, lo que encarece el almacenamiento y la búsqueda a gran escala.
- No se han publicado benchmarks ni métricas de evaluación en la información disponible, por lo que el rendimiento real frente a alternativas no está cuantificado.
- Riesgo de sesgos heredados del corpus AfriXIR y del modelo base afro-xlmr-mini; no se documentan análisis de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset AfriXIR y del modelo base.
- El repositorio tiene muy poca tracción (1 descarga, 0 likes) y fue creado recientemente; no hay evidencia de uso en producción ni de mantenimiento continuado.
- No es un modelo generativo: no puede responder preguntas ni producir texto, solo embeddings para recuperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebhailema/afrixir-multivector-mini
- Dataset AfriXIR: https://huggingface.co/datasets/nebhailema/AfriXIR
- Modelo base Davlan/afro-xlmr-mini: https://huggingface.co/Davlan/afro-xlmr-mini
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Multi-Vector Encoder: https://www.sbert.net/docs/multi_vector_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos multi-vector en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=multi-vector
- Paper XLM-R (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper ColBERTv2 (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
