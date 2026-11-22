# nebhailema/afrixir-afro-xlmr-mini

## Resumen

AfriXIR Afro-XLM-R Mini es un modelo de embeddings de frases (sentence transformer) especializado en recuperación de información multilingüe para lenguas africanas. Lo desarrolla el usuario nebhailema y se construye mediante fine-tuning del modelo base Davlan/afro-xlmr-mini, un XLM-RoBERTa en miniatura preentrenado específicamente sobre lenguas africanas. El modelo resuelve el problema de la baja calidad de recuperación semántica en idiomas africanos de bajos recursos, donde los embeddings multilingües genéricos rinden de forma deficiente por la escasa representación de estas lenguas en los corpus de entrenamiento.

El modelo cubre ocho idiomas: amárico (am), hausa (ha), oromo (om), shona (sn), somalí (so), suajili (sw), yoruba (yo) y zulú (zu). Con 117,6 millones de parámetros y un repositorio de 0,5 GB, es un modelo compacto pensado para despliegue en entornos con recursos limitados. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que la mayoría de los sistemas RAG y de búsqueda semántica están optimizados para inglés y lenguas europeas, dejando desatendida la recuperación documental en lenguas africanas. Este modelo ofrece una alternativa ligera y específica para pipelines de information retrieval en esos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), sentence-transformers |
| Parametros totales | 117.640.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa en su variante mini (afro-xlmr-mini), un transformer encoder de 117,6 millones de parámetros. Sobre esa base se aplicó fine-tuning con la librería sentence-transformers para producir embeddings de frases optimizados para similitud semántica y recuperación de información.

El entrenamiento utilizó el dataset nebhailema/AfriXIR, con 112.864 ejemplos, y combinó dos funciones de pérdida: MultipleNegativesRankingLoss, estándar en el entrenamiento de embeddings de recuperación con pares positivos y negativos en el lote, y MatryoshkaLoss, que permite truncar las dimensiones del embedding resultante manteniendo calidad decreciente, lo que facilita el almacenamiento y la búsqueda eficiente a distintas dimensiones. El modelo se generó con el Trainer de sentence-transformers (tag generated_from_trainer). No se dispone de información detallada sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de su tamaño.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Feature extraction a nivel de token y de frase.
- Recuperación de información multilingüe en ocho lenguas africanas.
- Soporte de embeddings Matryoshka: permite truncar dimensiones para búsqueda aproximada más eficiente.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Capacidades multilingües limitadas a los ocho idiomas declarados.

## Casos de uso

- Búsqueda semántica en corpus de lenguas africanas: indexar documentos en suajili, hausa o amárico y recuperar pasajes relevantes mediante similitud coseno, aprovechando el fine-tuning específico frente a embeddings multilingües genéricos.
- Pipelines RAG para asistentes en idiomas africanos: usar el modelo como retriever en un sistema de generación aumentada, recuperando contexto en la lengua del usuario antes de pasarlo a un LLM generativo.
- Deduplicación y agrupamiento de documentos multilingües: calcular embeddings de artículos o registros y agrupar por similitud para eliminar duplicados en bases de datos de baja calidad lingüística.
- Moderación y clasificación semántica de contenido: comparar mensajes entrantes contra un conjunto de referencia de textos etiquetados para detectar categorías por proximidad semántica.
- Búsqueda en centros de atención al cliente: indexar FAQs y artículos de ayuda en suajili o zulú para responder consultas por recuperación semántica en lugar de coincidencia exacta de palabras clave.
- Detección de paráfrasis y similitud entre pares de frases: evaluar si dos oraciones en yoruba u oromo expresan la misma idea, útil en control de calidad de traducciones o en datasets de evaluación.
- Sistemas de recomendación de contenido textual: representar artículos o publicaciones y recomendar elementos similares a usuarios según su historial de lectura en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los pesos (117,6 M de parámetros); en fp16 alrededor de 0,25 GB, más overhead de activaciones y batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 no suponen cuello de botella para este tamaño.
- Cabe holgadamente en GPU consumer, incluso en tarjetas con 4-6 GB de VRAM, y puede ejecutarse en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, Hugging Face Text Embeddings Inference (TEI), vLLM no aplica (no es generativo), llama.cpp no aplica (no hay GGUF publicado), integración vía endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AfriXIR Afro-XLM-R Mini | 117,6 M | no disponible (base 512) | 8 lenguas africanas | Apache 2.0 | Fine-tuning específico en AfriXIR con MatryoshkaLoss |
| Davlan/afro-xlmr-mini (base) | 117,6 M | 512 | Lenguas africanas (amplio) | no disponible en la informacion | Modelo base sin fine-tuning para retrieval |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128-512 | Multilingüe general | Apache 2.0 | No especializado en lenguas africanas |
| BAAI/bge-m3 | ~568 M | 8192 | Multilingüe amplio | MIT | Mayor tamaño y contexto, cobertura africana no específica |

La comparativa se limita a alternativas de la misma categoría (embeddings de recuperación); los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni mantiene conversaciones; no debe usarse como LLM.
- Cobertura lingüística restringida a ocho idiomas; fuera de ellos el rendimiento no está garantizado.
- No hay benchmarks publicados que permitan validar la calidad frente a alternativas; conviene evaluar en el dominio concreto antes de producción.
- Riesgo de sesgos heredados del corpus de preentrenamiento de afro-xlmr-mini y del dataset AfriXIR, cuya composición no está detallada.
- La longitud de contexto efectiva no está declarada; para documentos largos será necesario trocear en pasajes.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y el dataset pueden tener condiciones propias que conviene verificar.
- Con solo 17 descargas y 0 likes, es un modelo de reciente publicación y escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/nebhailema/afrixir-afro-xlmr-mini
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-mini
- Dataset: https://huggingface.co/datasets/nebhailema/AfriXIR
- Paper XLM-R (arXiv 1908.10084): https://arxiv.org/abs/1908.10084
- Paper Matryoshka Representation Learning (arXiv 2205.13147): https://arxiv.org/abs/2205.13147
- Paper Sentence-BERT (arXiv 1807.03748): https://arxiv.org/abs/1807.03748
