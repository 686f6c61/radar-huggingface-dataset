# nebhailema/afrixir-e5-large

## Resumen
AfriXIR-e5-large es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario nebhailema, obtenido mediante fine-tuning del modelo base intfloat/multilingual-e5-large sobre el dataset AfriXIR. Su propósito es la recuperación de información (information retrieval) y la similitud semántica en lenguas africanas, un ámbito tradicionalmente desatendido por los modelos multilingües de propósito general. Se distribuye bajo licencia Apache 2.0 y con pesos en formato safetensors.

El modelo cuenta con 559.890.432 parámetros totales, lo que lo sitúa en la categoría de modelos de embeddings de tamaño grande (aproximadamente 560M), coherente con su base XLM-RoBERTa. Está entrenado específicamente para ocho idiomas africanos: amárico (am), hausa (ha), oromo (om), shona (sn), somalí (so), suajili (sw), yoruba (yo) y zulú (zu). Su relevancia actual radica en que cubre un hueco real en la infraestructura de búsqueda semántica y RAG para lenguas africanas, donde la mayoría de los embeddings multilingües rinden de forma deficiente.

La ficha se basa exclusivamente en la información publicada en Hugging Face; no se dispone de resultados de benchmarks ni de detalles completos del proceso de entrenamiento más allá de los metadatos de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), sentence-transformers |
| Parámetros totales | 559.890.432 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se construye sobre intfloat/multilingual-e5-large, un encoder transformer de tipo XLM-RoBERTa large con 559.890.432 parámetros, adaptado como sentence transformer para producir embeddings densos de frases. El fine-tuning se realizó con la librería sentence-transformers y se marca como `generated_from_trainer`, lo que indica un proceso de entrenamiento supervisado a partir del modelo base.

El entrenamiento empleó el dataset nebhailema/AfriXIR, con un tamaño declarado de 112.864 ejemplos, y combinó dos funciones de pérdida: MultipleNegativesRankingLoss (aprendizaje contrastivo con negativos en el lote) y MatryoshkaLoss (embeddings truncables a distintas dimensiones). La combinación de ambas es habitual en modelos de recuperación modernos: la primera optimiza la separación entre consultas y pasajes relevantes, y la segunda permite obtener representaciones de menor dimensión con pérdida mínima de rendimiento, lo que facilita el almacenamiento y la búsqueda vectorial a escala. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a modelos de embeddings).

## Capacidades
- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Búsqueda semántica y reranking en ocho lenguas africanas (am, ha, om, sn, so, sw, yo, zu).
- Extracción de características (feature-extraction) para pipelines de NLP.
- Soporte del prefijo `query:` y `passage:` heredado del modelo E5, tal como muestran los ejemplos de la model card.
- Embeddings Matryoshka: representaciones truncables a dimensiones menores, útiles para indexación eficiente.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es un modelo exclusivamente de representación.

## Casos de uso
- Búsqueda semántica multilingüe en lenguas africanas: indexar un corpus de documentos en suajili, amárico o yoruba y recuperar pasajes relevantes ante consultas en el mismo idioma, usando los prefijos `query:` y `passage:` para maximizar la calidad de la recuperación.
- RAG (generación aumentada por recuperación) para asistentes en lenguas africanas: el modelo actúa como recuperador en un pipeline que alimenta a un LLM generativo, permitiendo construir chatbots documentales sobre normativa, salud o agricultura en idiomas locales.
- Deduplicación y clustering de documentos: calcular similitudes entre embeddings para agrupar noticias, informes o registros administrativos en hausa, somalí o zulú.
- Moderación y clasificación semántica de contenido: comparar mensajes de usuarios contra taxonomías de referencia mediante similitud coseno.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial para sugerir contenidos afines.
- Investigación lingüística comparada: medir proximidad semántica entre frases de distintas lenguas africanas para estudios de traducción o análisis de corpus paralelos.
- Búsqueda en bases de conocimiento locales: integrar el modelo en motores de búsqueda internos de ONG o administraciones que operan en varios idiomas africanos, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP32: aproximadamente 2,2 GB solo para pesos (559,9M parámetros × 4 bytes), más overhead de activaciones; en FP16/BF16 se reduce a unos 1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100 o L4 para despliegues de alto throughput con text-embeddings-inference.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, incluso en FP32.
- Opciones de despliegue: text-embeddings-inference (soportado explícitamente), sentence-transformers, Hugging Face Inference Endpoints; el soporte de vLLM, llama.cpp u Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| afrixir-e5-large | 559,9M | no disponible | 8 lenguas africanas | Apache 2.0 | Fine-tune específico para AfriXIR |
| intfloat/multilingual-e5-large | 559,9M | no disponible | multilingüe (≈100) | MIT (según modelo base) | Modelo base; cobertura amplia pero sin especialización africana |
| Sentence-transformers paraphrase-multilingual-mpnet-base-v2 | ≈278M | no disponible | multilingüe | Apache 2.0 | Alternativa más ligera para similitud multilingüe general |

La comparación se limita a los datos disponibles; no se dispone de métricas de rendimiento comparadas entre estos modelos.

## Limitaciones y advertencias
- Modelo exclusivamente de embeddings: no genera texto ni mantiene conversaciones.
- Riesgo de sesgos heredados del corpus AfriXIR y del modelo base, cuya composición no se detalla.
- Cobertura limitada a ocho idiomas; el rendimiento fuera de ellos no está documentado.
- No se especifica la longitud máxima de contexto, lo que obliga a validar el truncado en producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del dataset AfriXIR y del modelo base.
- Con solo 3 descargas y 0 likes en el momento de la consulta, la validación comunitaria es mínima; conviene evaluar el modelo en el dominio concreto antes de desplegarlo.
- No hay benchmarks publicados que permitan estimar su calidad frente a alternativas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nebhailema/afrixir-e5-large
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Dataset AfriXIR: https://huggingface.co/datasets/nebhailema/AfriXIR
- Paper E5 (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper SimCSE (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
