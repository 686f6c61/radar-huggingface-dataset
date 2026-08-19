# dxtech-asia/deepx-embedding-v1

## Resumen

DeepX Embedding v1.0 es un modelo de embeddings de 772 millones de parámetros desarrollado por DX Tech Asia, diseñado específicamente para la recuperación de documentos legales en vietnamita. Combina una arquitectura de atención lineal Gated DeltaNet-2 con complejidad O(n) y el esquema de compartición de pesos Hyperloop, lo que le permite procesar secuencias largas (hasta 8.192 tokens validados, con soporte declarado de 128.000 mediante YaRN RoPE) manteniendo un consumo de memoria constante. El modelo está optimizado para búsqueda semántica y recuperación de información en el dominio legal vietnamita, superando el estado del arte anterior en el benchmark Zalo Legal Text Retrieval con un nDCG@10 de 0,8162 frente a 0,7813 del modelo previo.

La relevancia de este modelo radica en su enfoque en un dominio específico (legal vietnamita) con una eficiencia computacional notable: gracias a la atención lineal, procesa 8.000 tokens con el mismo uso de VRAM que 512 tokens en un transformer cuadrático. Además, incorpora embeddings Matryoshka que permiten reducir la dimensionalidad (256 a 1536) con una pérdida de calidad mínima, y una salida dual estilo ColBERT para reranking mediante MaxSim. Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet-2 (atención lineal) con Hyperloop (35 pases de computación, 9 conjuntos de capas únicos) |
| Parametros totales | 772M (286M embedding congelado + 486M backbone entrenable) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens validados; 128.000 tokens soportados (YaRN RoPE) |
| Tipos de cuantizacion | BF16 (entrenamiento), FP16 (inferencia) |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el ejemplo de uso carga un checkpoint .pt con `torch.load`; no se especifica safetensors) |

## Arquitectura y entrenamiento

La arquitectura se basa en Gated DeltaNet-2 (GDN-2), una atención lineal pura con complejidad O(n) que mantiene un estado recurrente actualizado mediante puertas de decaimiento, borrado y escritura. No utiliza KV cache ni sufre el cuello de botella cuadrático de la atención estándar. El modelo emplea el esquema Hyperloop: solo 9 conjuntos de capas únicos se reutilizan en 35 pases de computación, diferenciados por LoRA y RoDE (Rotary Depth Embedding) en cada iteración. La estructura comprende un bloque inicial con 4 capas NarrowA, dos fases de bucle (Phase1 ×2 y Phase2 ×4) y un bloque final, seguido de RMSNorm y atención con pooling para producir un vector de 1536 dimensiones.

El tokenizer es personalizado, con un vocabulario de 186.046 tokens optimizado para vietnamita e inglés. El embedding de tokens está congelado (286M parámetros) mientras que el backbone es entrenable (486M). El entrenamiento se realizó con precisión BF16 en 2 GPU RTX 5070 Ti de 16 GB mediante pipeline parallel, con secuencias de hasta 8.192 tokens, pérdida InfoNCE (τ=0,07) y pérdida Matryoshka en dimensiones 256, 512, 768, 1024 y 1536. El pipeline de entrenamiento incluye fases de entrenamiento conservador, exposición a secuencias largas (4K-8K), hard negative mining y un refuerzo específico del dominio legal. Se emplearon los datasets mmarco, miracl y zalo-ai-legal-text-retrieval-vn, aunque no se especifica el número total de tokens de entrenamiento.

## Capacidades

- Recuperación de documentos legales vietnamitas: optimizado para búsqueda semántica en corpus jurídicos, con resultados superiores a modelos generalistas multilingües.
- Embeddings Matryoshka: permite obtener representaciones de 256, 512, 768, 1024 o 1536 dimensiones desde un mismo modelo, ajustando el equilibrio entre calidad y coste computacional.
- Salida dual estilo ColBERT: además del vector único de 1536 dimensiones, genera vectores por token de 128 dimensiones para reranking mediante MaxSim, mejorando la precisión en recuperación.
- Procesamiento de secuencias largas: gracias a la atención lineal, mantiene un throughput constante independientemente de la longitud de la secuencia, con soporte validado de 8.192 tokens.
- Multilingüe vietnamita-inglés: aunque está especializado en vietnamita, también procesa texto en inglés, lo que facilita la búsqueda cruzada.
- Búsqueda por similitud de frases: adecuado para tareas de similitud semántica, agrupación de textos y deduplicación.
- No es un modelo generativo: no genera texto, solo produce representaciones vectoriales para tareas de recuperación y similitud.

## Casos de uso

- Búsqueda legal en bases de jurisprudencia vietnamita: el modelo puede indexar sentencias, leyes y reglamentos en un corpus vectorial, permitiendo consultas en lenguaje natural como "Mức phạt khi vượt đèn đỏ là bao nhiêu?" y recuperar los documentos más relevantes con alta precisión.
- Asistente legal para despachos de abogados: integrado en un sistema de preguntas y respuestas, permite a los profesionales localizar rápidamente precedentes y normativas aplicables a un caso concreto, reduciendo el tiempo de investigación.
- Reranking de resultados de búsqueda: usando la salida ColBERT dual, se puede implementar una segunda fase de reranking con MaxSim sobre los resultados obtenidos por ANN, mejorando el nDCG en entornos de producción.
- Análisis de contratos y comparación de cláusulas: el modelo puede comparar fragmentos de contratos para detectar similitudes o discrepancias, ayudando en la revisión de documentos legales.
- Chatbots con base de conocimiento jurídico: al integrarse en un pipeline de retrieval-augmented generation (RAG), el modelo proporciona los pasajes legales relevantes que un modelo generativo utiliza para responder consultas de ciudadanos sobre normativa vietnamita.
- Indexación de documentos legales multilingües: aunque está especializado en vietnamita, su capacidad en inglés permite procesar documentos legales bilingües o buscar en corpus mixtos vi-en, útil para organizaciones internacionales.

## Benchmarks y rendimiento

Los siguientes resultados son declarados por el autor en la model card y no han sido verificados de forma independiente. Se refieren al dataset Zalo Legal Text Retrieval (GreenNode/zalo-ai-legal-text-retrieval-vn).

| Modelo | Parámetros | nDCG@10 |
|---|---|---|
| intfloat/multilingual-e5-large | 560M | 0,6660 |
| mainguyen9/vietlegal-e5 | 560M | 0,7310 |
| mainguyen9/vietlegal-harrier-0.6b (SOTA previo) | 600M | 0,7813 |
| **DeepX Embedding v1.0** | **772M** | **0,8162** |

Además, el autor reporta métricas adicionales en el mismo dataset: MRR@10 = 0,7672 y Recall@10 = 0,9537. La tabla de dimensiones Matryoshka muestra el rendimiento relativo:

| Dimensión | nDCG@10 | Calidad vs. completa |
|---|---|---|
| 256 | 0,78 | ~96% |
| 512 | 0,79 | ~97% |
| 768 | 0,80 | ~98% |
| 1024 | 0,81 | ~99% |
| 1536 (completa) | 0,8162 | 100% |

## Requisitos de hardware

- VRAM estimada para inferencia: con 772M parámetros en FP16, el modelo ocupa aproximadamente 1,5 GB de VRAM, más la memoria para el estado de atención lineal y el tokenizer. En la práctica, cabe en GPUs con 4 GB o más, aunque se recomienda al menos 8 GB para secuencias largas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4070, RTX 5070 Ti) es suficiente para inferencia. El entrenamiento se realizó con 2× RTX 5070 Ti de 16 GB en pipeline parallel.
- Compatibilidad con GPU consumer: sí, el modelo es ligero y no requiere GPUs de centro de datos. Un RTX 4090 o similar puede procesar lotes grandes sin problema.
- Opciones de despliegue: el ejemplo oficial usa un pipeline personalizado (`DeepXPipeline`) con PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, dado que es un modelo de embeddings y no un LLM generativo. Se puede servir mediante Hugging Face Inference Endpoints o un servidor Python con FastAPI.
- Latencia y throughput: según el autor, en RTX 5070 Ti con FP16, la latencia para un documento es de ~0,1 s (512 tokens), ~0,2 s (2048 tokens) y ~0,8 s (8192 tokens). El throughput es constante independientemente de la longitud de secuencia gracias a la atención lineal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 (Zalo Legal) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intfloat/multilingual-e5-large | 560M | 512 tokens | 0,6660 | MIT | HuggingFace |
| mainguyen9/vietlegal-e5 | 560M | 512 tokens | 0,7310 | MIT | HuggingFace |
| mainguyen9/vietlegal-harrier-0.6b | 600M | No especificado | 0,7813 | MIT | HuggingFace |
| **DeepX Embedding v1.0** | **772M** | **8K validado, 128K soportado** | **0,8162** | **Apache 2.0** | **HuggingFace** |

DeepX Embedding v1.0 supera a los modelos comparados en el benchmark legal vietnamita, con una ventaja de +4,5% sobre el SOTA anterior. Su principal diferencia es la atención lineal y el soporte de secuencias largas, que no está disponible en los modelos e5 o harrier. La licencia Apache 2.0 es permisiva para uso comercial, similar a MIT.

## Limitaciones y advertencias

- Especialización de dominio: el modelo está optimizado para texto legal vietnamita; su rendimiento en otros dominios (médico, técnico, conversacional) puede ser inferior al de modelos generalistas.
- Sesgos potenciales: al entrenarse con datos legales, puede reflejar sesgos presentes en la jurisprudencia o normativa vietnamita, como desigualdades de género o socioeconómicas en las sentencias.
- Riesgo de alucinación en tareas aguas abajo: aunque el modelo no genera texto, si se usa en un pipeline RAG, las representaciones pueden recuperar pasajes irrelevantes si la consulta es ambigua, lo que podría inducir a errores en el modelo generativo.
- Limitaciones de contexto: aunque se declara soporte de 128K tokens con YaRN, solo se ha validado hasta 8.192 tokens; el uso más allá de ese límite puede degradar la calidad de las representaciones.
- Formato de pesos no estándar: el ejemplo de uso carga un checkpoint .pt con `torch.load` y un mapeo de ids (`id_remap.pt`), lo que sugiere que no se puede usar directamente con la API estándar de sentence-transformers o Transformers sin adaptaciones.
- Sin soporte de cuantización explícito: no se documentan versiones GGUF o INT8/INT4, lo que limita su despliegue en entornos con restricciones de memoria muy estrictas.
- Resultados de benchmark no verificados: los valores de nDCG@10 y demás métricas son declarados por el autor y no han sido confirmados por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dxtech-asia/deepx-embedding-v1
- Blog técnico: https://dxtech.jp/deepx-embedding-v1-0-setting-a-new-sota-in-vietnamese-legal-retrieval/
- Repositorio GitHub: https://github.com/dx-tech-ai/deepx-embed
