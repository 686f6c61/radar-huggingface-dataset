# nebhailema/afrixir-multivector-e5-base

## Resumen

AfriXIR multi-vector retriever es un modelo de recuperación de información (retrieval) basado en late interaction, desarrollado por el usuario nebhailema y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning de `intfloat/multilingual-e5-base` sobre el dataset AfriXIR, un corpus de 112.864 ejemplos orientado a lenguas africanas. El modelo sigue el paradigma ColBERT: cada entrada se proyecta en una secuencia de vectores por token de 128 dimensiones que se puntúan mediante MaxSim, en lugar de un único vector por pasaje.

La relevancia del modelo reside en su enfoque multilingüe específico para ocho lenguas africanas (amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú), un ámbito donde la mayoría de retrievers multilingües genéricos rinden por debajo de lo deseable. Al partir de un encoder XLM-RoBERTa de 278 millones de parámetros y aplicar una cabeza densa de 768 a 128 dimensiones, ofrece un equilibrio entre coste computacional y calidad de recuperación en dominios de bajos recursos.

El modelo está pensado para passage retrieval en pipelines RAG y motores de búsqueda semántica. Su formato multi-vector permite una mayor expresividad que los bi-encoders clásicos, a costa de un mayor almacenamiento por documento. La ventana de contexto está limitada a 512 tokens tanto para consultas como para documentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-Vector Encoder (XLM-RoBERTa base + cabeza densa 768→128 + MaxSim) |
| Parámetros totales | 278.043.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (consulta y documento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión de salida | 128 por token |
| Función de similitud | MaxSim (late interaction) |
| Modelo base | intfloat/multilingual-e5-base |
| Dataset de entrenamiento | nebhailema/AfriXIR (112.864 ejemplos) |
| Función de pérdida | CachedMultiVectorMultipleNegativesRankingLoss |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo es un `MultiVectorEncoder` compuesto por cuatro módulos secuenciales: un transformer `XLMRobertaModel` que extrae `last_hidden_state` (768 dimensiones por token), una capa densa sin sesgo que proyecta de 768 a 128 dimensiones, una `MultiVectorMask` que elimina tokens de puntuación del skiplist en documentos, y una normalización final. La puntuación se realiza mediante MaxSim entre los vectores de consulta y documento, el esquema clásico de ColBERT (Khattab y Zaharia, 2020).

El entrenamiento se realizó con la librería sentence-transformers usando `CachedMultiVectorMultipleNegativesRankingLoss`, una variante de la pérdida de ranking con negativos en caché adaptada al paradigma multi-vector. El dataset AfriXIR contiene 112.864 ejemplos y el fine-tuning parte del checkpoint `d128750597153bb5987e10b1c3493a34e5a4502a` de `intfloat/multilingual-e5-base`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente a retrievers).

## Capacidades

- Recuperación de pasajes (passage retrieval) mediante late interaction con puntuación MaxSim.
- Generación de embeddings multi-vector a nivel de token, con 128 dimensiones por token.
- Búsqueda semántica multilingüe en ocho lenguas africanas: amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú.
- Codificación de consultas y documentos con ventana de 512 tokens.
- Filtrado de puntuación en documentos mediante skiplist de tokens no alfanuméricos.
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints de Hugging Face (tag `endpoints_compatible`).
- Integración nativa con sentence-transformers (`MultiVectorEncoder`).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento explícito: es un modelo puramente de representación para recuperación.

## Casos de uso

- **RAG sobre corpus en lenguas africanas**: indexar documentos en suajili, amárico o hausa y recuperar pasajes relevantes para alimentar a un LLM generador. La naturaleza multi-vector captura matices léxicos que un bi-encoder de un solo vector tiende a diluir, útil cuando el vocabulario es rico morfológicamente.
- **Búsqueda semántica en medios de comunicación locales**: construir un motor de búsqueda sobre archivos periodísticos en yoruba, zulú o somalí, aprovechando que el modelo fue entrenado sobre AfriXIR y no depende de traducción previa al inglés.
- **Atención al cliente multilingüe en África oriental y occidental**: recuperar respuestas de una base de conocimiento en suajili, amárico u oromo para asistentes conversacionales, con 512 tokens suficientes para fragmentos de FAQ y respuestas.
- **Sistemas de preguntas y respuestas sobre documentación técnica**: indexar manuales o guías en hausa y suajili y recuperar el pasaje exacto que responde a la consulta del usuario, usando MaxSim para alinear términos específicos.
- **Moderación y clasificación de contenido asistida por recuperación**: dado un texto entrante, recuperar casos previos similares de una base etiquetada en lenguas africanas para apoyar decisiones de moderación o triaje.
- **Investigación lingüística comparada**: usar los embeddings por token para estudiar alineamientos léxicos entre lenguas del mismo corpus, ya que la representación a nivel de token permite inspeccionar correspondencias más finas que un vector de frase.
- **Búsqueda federada en repositorios académicos africanos**: desplegar el modelo en TEI para servir consultas sobre tesis y artículos en lenguas locales, con una huella de 278 M de parámetros manejable en infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp32, aproximadamente 1,1 GB de pesos; en fp16, unos 0,6 GB. El coste real depende del batch y de la longitud de secuencia, ya que la salida multi-vector crece con el número de tokens.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16 con batches moderados. Para indexación a gran escala se recomiendan A100, H100 o L40S por throughput.
- **GPU de consumo**: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU para volúmenes pequeños.
- **Opciones de despliegue**: sentence-transformers (nativo), Text Embeddings Inference (TEI, tag `text-embeddings-inference`), endpoints de Hugging Face. No se documenta soporte GGUF ni llama.cpp en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia cualitativa, el coste de almacenamiento es mayor que un bi-encoder porque cada documento genera un vector por token en lugar de uno solo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Idiomas | Licencia |
|---|---|---|---|---|---|
| AfriXIR multi-vector e5-base | 278 M | 512 | Multi-vector (ColBERT/MaxSim) | 8 lenguas africanas | Apache 2.0 |
| intfloat/multilingual-e5-base | 278 M | 512 | Bi-encoder (un vector) | ~100 idiomas | MIT |
| BGE-M3 | ~568 M | 8192 | Híbrido (denso + sparse + multi-vector) | ~100 idiomas | MIT |
| jina-embeddings-v3 | ~570 M | 8192 | Bi-encoder con task LoRA | multilingüe | CC BY-NC 4.0 |

La comparación con benchmarks de recuperación en lenguas africanas no está disponible en la información proporcionada. Frente a `multilingual-e5-base`, AfriXIR añade especialización multi-vector y fine-tuning sobre AfriXIR; frente a BGE-M3 y jina-v3, ofrece menor contexto y menor cobertura idiomática, pero está específicamente ajustado para las ocho lenguas objetivo y con licencia permisiva para uso comercial.

## Limitaciones y advertencias

- **Contexto limitado a 512 tokens**: documentos más largos deben fragmentarse, lo que puede romper la coherencia semántica de pasajes extensos.
- **Cobertura idiomática restringida**: solo se declaran ocho lenguas africanas; el rendimiento fuera de ellas no está garantizado ni documentado.
- **Riesgo de sesgo**: el dataset AfriXIR puede reflejar sesgos de las fuentes de origen (medios, corpus web), y no se documentan análisis de sesgo en la model card.
- **Alucinación**: al ser un modelo de recuperación, no genera texto, pero puede devolver pasajes irrelevantes si la consulta cae fuera de distribución; conviene combinar con reranking o umbrales de similitud.
- **Coste de almacenamiento**: la representación multi-vector genera un vector de 128 dimensiones por token, lo que incrementa el espacio de índice frente a bi-encoders.
- **Madurez y adopción**: el modelo tiene 3 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados; para producción conviene validar su calidad sobre el corpus concreto antes de adoptarlo.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar la licencia del modelo base (`intfloat/multilingual-e5-base`, MIT) y del dataset AfriXIR antes de redistribuir derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebhailema/afrixir-multivector-e5-base
- Dataset AfriXIR: https://huggingface.co/datasets/nebhailema/AfriXIR
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Documentación de sentence-transformers: https://sbert.net
- Documentación de Multi-Vector Encoder: https://www.sbert.net/docs/multi_vector_encoder/usage/usage.html
- Repositorio de sentence-transformers: https://github.com/huggingface/sentence-transformers
- Multi-Vector Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=multi-vector
- Paper ColBERT (Khattab y Zaharia): https://arxiv.org/abs/2004.12832
- Paper E5 (Wang et al.): https://arxiv.org/abs/2212.03533
- Paper XLM-R (Conneau et al.): https://arxiv.org/abs/1911.02116
