# CSI-lab/US-state-law-EmbeddingGemma-2-GGUF

## Resumen

US-State-Law-EmbeddingGemma-2-GGUF es un modelo de embeddings especializado en recuperación de información jurídica (Legal IR) para el estado de Washington, publicado por el Complex Social Interactions Lab (CSI-lab). Se trata de un ajuste fino mediante LoRA sobre google/embeddinggemma-2, el modelo de embeddings multimodal de Google DeepMind, y se distribuye en formato GGUF cuantizado a 4 bits (q4_k_m) para su despliegue en CPU y hardware de consumo.

El modelo resuelve un problema concreto: la brecha semántica entre preguntas en inglés llano (por ejemplo, "¿qué importe convierte un hurto en delito grave de primer grado?") y el lenguaje estatutario formal del Revised Code of Washington (RCW). Los embeddings genéricos rinden por debajo en este dominio, y este ajuste mapea consultas, escenarios jurídicos y borradores de documentos a los artículos correspondientes del RCW.

La arquitectura subyacente combina un codificador de texto de aproximadamente 270 millones de parámetros con codificadores modulares de visión (170 M) y audio (300 M), proyectando todas las modalidades a un espacio vectorial unificado de 768 dimensiones. Esta variante GGUF conserva las capacidades de recuperación del ajuste fino original en un contenedor ligero orientado a entornos con pocos recursos, despliegue solo-CPU y computación en el borde.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder de embeddings) multimodal, base google/embeddinggemma-2 con ajuste fino LoRA |
| Parametros totales | 271.002.648 (pesos safetensors de esta variante); el modelo base completo declara 740 M sumando codificadores de visión y audio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF de 4 bits, variante q4_k_m |
| Idiomas soportados | Inglés (dominio jurídico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,2 GB); existe variante en safetensors sin cuantizar |

## Arquitectura y entrenamiento

El modelo parte de EmbeddingGemma 2, un encoder de embeddings multimodal de Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio, así como combinaciones de estas modalidades, a un único espacio vectorial de 768 dimensiones. El ajuste fino se realizó mediante LoRA sobre el codificador de texto y emplea la función de pérdida MultipleNegativesRankingLoss, típica en el entrenamiento de modelos de similitud de frases con sentence-transformers. La similitud se calcula por coseno.

El conjunto de datos de entrenamiento es CSI-lab/RCW_2025_Positive_Query_Pairs, formado por pares positivos consulta-documento construidos sobre el Revised Code of Washington. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO. La innovación principal no es arquitectónica sino de dominio: el ajuste alinea consultas en lenguaje natural con estatutos formales, y la cuantización q4_k_m reduce la huella de memoria para inferencia en CPU.

## Capacidades

- Generación de representaciones vectoriales (embeddings) de texto para búsqueda semántica y recuperación de información.
- Mapeo de consultas en inglés llano a artículos del Revised Code of Washington (RCW).
- Análisis de preemption legal y comparación semántica entre escenarios jurídicos y estatutos.
- Similitud de frases y oraciones mediante distancia coseno en 768 dimensiones.
- Clasificación y agrupamiento (clustering) de documentos jurídicos.
- Soporte de RAG (retrieval-augmented generation) como recuperador en pipelines de generación.
- Capacidad multimodal heredada del modelo base (texto, imagen, vídeo, audio) según la documentación de EmbeddingGemma 2; no se detalla en la información disponible qué componentes multimodales se conservan tras el ajuste fino y la cuantización.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda jurídica para ciudadanos y profesionales: el modelo traduce preguntas en inglés llano a los artículos del RCW relevantes, gracias al ajuste específico sobre pares consulta-estatuto del dominio de Washington.
- Asistente RAG sobre normativa estatal: se usa como recuperador que alimenta un LLM generativo con los artículos correctos antes de redactar la respuesta, reduciendo alucinaciones normativas.
- Clasificación automática de documentos legales: asignación de borradores, demandas o contratos a las secciones del RCW que les aplican mediante similitud coseno sobre embeddings.
- Agrupamiento de expedientes y consultas: el clustering sobre los vectores de 768 dimensiones permite descubrir patrones temáticos en grandes volúmenes de consultas ciudadanas o expedientes.
- Despliegue en el borde y en dispositivos móviles: el formato GGUF q4_k_m y el repositorio de 0,2 GB permiten ejecutar la búsqueda semántica en portátiles o dispositivos sin GPU, con baja latencia.
- Detección de duplicados y near-duplicates en bases documentales jurídicas: la similitud de embeddings identifica estatutos o cláusulas equivalentes entre versiones.
- Análisis de preemption entre normativa estatal y local: el modelo está entrenado explícitamente para esta tarea según la model card, comparando la semántica de disposiciones de distintos niveles administrativos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto de validación CSI-lab/RCW_2025_Positive_Query_Pairs, tarea de recuperación de información:

| Metrica | Valor |
|---|---|
| Accuracy@1 | 0,3994 |
| Accuracy@3 | 0,2595 |
| Accuracy@5 | 0,7156 |
| Accuracy@10 | 0,8789 |
| Precision@10 | 0,0879 |
| Recall@10 | 0,8789 |
| NDCG@10 | 0,6464 |
| MRR@10 | 0,5709 |
| MAP@100 | 0,5757 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de embeddings ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 0,2 GB, por lo que la inferencia puede ejecutarse enteramente en CPU con un consumo de RAM del orden de cientos de megabytes.
- GPU recomendadas: no requiere GPU; funciona en cualquier GPU con más de 1 GB de VRAM si se desea acelerar. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y portátiles, según declara el autor.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp y con runners basados en GGUF; la model card menciona despliegue en CPU y edge. No se detallan integraciones con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| CSI-lab/US-State-Law-EmbeddingGemma-2-GGUF | 271 M (texto) | No disponible | GGUF q4_k_m | Apache 2.0 | Legal IR Washington, cuantizado |
| CSI-lab/US-State-Law-EmbeddingGemma-2 | 271 M (texto) | No disponible | Safetensors | Apache 2.0 | Legal IR Washington, precisión completa |
| CSI-lab/Washington-state-law-embedding-model-Base | No disponible | No disponible | No disponible | No disponible | Legal IR Washington, 768 dimensiones |
| CSI-lab/Washington-state-law-embedding-model-Large | No disponible | No disponible | No disponible | No disponible | Legal IR Washington, 1024 dimensiones |
| google/embeddinggemma-2 (base) | 740 M (total multimodal) | No disponible | Safetensors | Apache 2.0 | Embeddings multimodales genéricos |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El modelo está ajustado exclusivamente al dominio jurídico del estado de Washington; su rendimiento fuera de ese corpus (otras jurisdicciones, otros dominios) no está garantizado.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La cuantización q4_k_m introduce una pérdida de precisión numérica respecto a la variante en safetensors; para máxima exactitud en recuperación conviene usar la versión sin cuantizar.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- Riesgo de alucinación: aunque es un modelo de embeddings y no genera texto, sus recuperaciones pueden devolver estatutos incorrectos o desactualizados; el corpus RCW 2025 puede no reflejar enmiendas posteriores.
- No se documentan sesgos específicos, pero al entrenarse sobre un único corpus normativo puede infrarepresentar terminología de otras tradiciones jurídicas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base EmbeddingGemma 2 de Google y la licencia del corpus RCW.
- No apto para asesoramiento jurídico directo sin revisión humana: la recuperación semántica no sustituye la interpretación legal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CSI-lab/US-state-law-EmbeddingGemma-2-GGUF
- Variante sin cuantizar: https://huggingface.co/CSI-lab/US-State-Law-EmbeddingGemma-2
- Variante Large: https://huggingface.co/CSI-lab/Washington-state-law-embedding-model-Large
- Variante Base: https://huggingface.co/CSI-lab/Washington-state-law-embedding-model-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CSI-lab/RCW_2025_Positive_Query_Pairs
- GitHub del laboratorio: https://github.com/ComplexSocialInteractionsLab
- Blog de lanzamiento: https://complexsocialinteractionslab.github.io/Initiatives/US-State-Law-EmbeddingGemma-2-GGUF.html
- Documentación de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper de Sentence-BERT (referencia de la pérdida): https://arxiv.org/abs/1908.10084
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper referenciado en la model card: https://arxiv.org/abs/2509.20354
