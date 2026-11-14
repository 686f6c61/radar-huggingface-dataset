# ampara-ai/bge-m3-ampara

## Resumen

BGE-M3 AMPARA es un modelo de embeddings densos obtenido mediante fine-tuning contrastivo completo (InfoNCE) de BAAI/bge-m3 sobre un corpus cerrado de legislación peruana en materia de violencia familiar (Ley n.º 30364 y normas relacionadas). Lo desarrolla el equipo ampara-ai (Renato Guillermo Vivas Alejandro, Marco Antonio Fuentes Rivera Onofre y Carlos Adrian Alarcon Delgado, Universidad Peruana de Ciencias Aplicadas) como componente retriever del asistente conversacional RAG AMPARA, orientado a ofrecer información legal a víctimas.

El problema que aborda es el desajuste de dominio y de registro: las consultas reales llegan en lenguaje coloquial y en primera persona ("mi pareja me revisa el celular y me amenaza"), mientras que los fragmentos normativos emplean terminología jurídica formal. El fine-tuning alinea ambos espacios para mejorar la recuperación de artículos relevantes frente al modelo base.

Técnicamente es un transformer XLM-RoBERTa de 567.754.752 parámetros (aproximadamente 568 M), con embeddings de 1.024 dimensiones obtenidos por pooling [CLS] y normalización L2, longitud máxima de 2.048 tokens y licencia MIT. Solo se entrena y se distribuye la cabeza densa; las cabezas sparse y ColBERT de BGE-M3 no están incluidas. Es relevante por su carácter abierto y reproducible en un nicho poco cubierto: retrieval legal en español para un dominio sensible y de alto impacto social.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de BAAI/bge-m3) |
| Parámetros totales | 567.754.752 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (query y passage) |
| Tipos de cuantización | FP16 (pesos publicados); exportación INT8 ONNX con cuantización dinámica (ONNX Runtime) usada en la evaluación |
| Idiomas soportados | español (es); etiquetado oficial limitado a es |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 1,2 GB); exportación ONNX INT8 documentada |
| Dimensión de embedding | 1.024 (pooling [CLS], normalización L2) |
| Librería | sentence-transformers / transformers |
| Modelo base | BAAI/bge-m3 (fine-tuning completo, sin LoRA) |

## Arquitectura y entrenamiento

La arquitectura es la del encoder de BAAI/bge-m3 (familia XLM-RoBERTa), sin modificaciones estructurales: se realiza fine-tuning completo de todos los pesos, no adaptación con LoRA. El embedding de salida es la representación [CLS] normalizada en L2, de 1.024 dimensiones, idéntica a la ruta densa de BGE-M3. No se emplea prefijo ni instrucción de consulta. El modelo no incluye las cabezas sparse (lexical weights) ni ColBERT de BGE-M3.

El entrenamiento usa FlagEmbedding con DeepSpeed ZeRO stage 0, pérdida InfoNCE con temperatura 0,05, precisión mixta FP16 y semilla 42. Se utilizaron 2.057 registros de entrenamiento (1.970 preguntas) agrupados en grupos de 9 (1 positivo y 8 negativos duros minados con BM25), 5 épocas (645 pasos de optimización), batch efectivo de 16 (1 por dispositivo con acumulación de gradiente 16), learning rate 5e-6 con decaimiento lineal y 64 pasos de warmup. El entrenamiento se ejecutó en una única NVIDIA L4 durante aproximadamente 2 h 26 min. El checkpoint seleccionado es checkpoint-256, elegido por mejor NDCG@10 estricto en el conjunto de desarrollo.

Los datos proceden de un corpus cerrado de 893 fragmentos legales. Las preguntas fueron generadas por un LLM (Claude Sonnet 5.5) a partir de sentencias judiciales y de fragmentos individuales del corpus, y los positivos fueron verificados por un juez LLM independiente (GPT-6.1 Sol). Los conjuntos de entrenamiento, desarrollo y test se dividieron por fragmento (semilla 520) antes de generar ninguna pregunta, de modo que ningún fragmento de test aparece en entrenamiento. El repositorio contiene los pesos FP16 del checkpoint seleccionado.

## Capacidades

- Generación de embeddings densos de frases y pasajes para búsqueda semántica y recuperación de información.
- Similitud semántica entre consultas coloquiales en español y fragmentos de texto legal formal.
- Recuperación en un corpus jurídico peruano sobre violencia familiar (Ley n.º 30364 y normas conexas).
- Soporte de consultas y pasajes de hasta 2.048 tokens.
- Integración nativa con sentence-transformers y transformers; compatibilidad con text-embeddings-inference y endpoints compatibles.
- Exportación a ONNX INT8 para inferencia en CPU o entornos con recursos limitados.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un modelo de representación (feature-extraction).
- Capacidad multilingüe no garantizada: el modelo está ajustado y etiquetado únicamente para español.

## Casos de uso

- Recuperación en pipelines RAG legales: el modelo indexa los 893 fragmentos normativos y recupera los artículos relevantes para cada consulta del usuario; su NDCG@10 de 0,545 frente al 0,427 del base justifica su uso en este corpus concreto.
- Asistencia a víctimas de violencia familiar: un asistente conversacional puede transformar preguntas en primera persona y lenguaje coloquial en recuperaciones precisas de artículos aplicables, gracias al entrenamiento explícito con ese registro.
- Búsqueda semántica sobre bases de legislación peruana: sustituye o complementa BM25 (Recall@10 de 0,114) en sistemas de búsqueda documental jurídica, con Recall@100 de 0,970.
- Sistemas de triaje y orientación: clasificación y enrutado de consultas ciudadanas hacia el artículo o procedimiento correcto antes de derivar a un profesional.
- Despliegue en entornos con recursos limitados: la exportación INT8 ONNX (NDCG@10 de 0,480 frente a 0,489 en FP16) permite servir el modelo en CPU manteniendo la calidad de recuperación.
- Investigación en retrieval de dominio especializado: sirve como referencia reproducible (licencia MIT, hiperparámetros y datos documentados) para estudiar adaptación de dominio con negativos duros y datos sintéticos.
- Filtrado y deduplicación semántica de documentación jurídica interna: los embeddings permiten agrupar fragmentos normativos similares o detectar duplicados en un corpus.

## Benchmarks y rendimiento

Evaluación sobre 198 preguntas sintéticas de test reservadas, sobre el corpus de 893 fragmentos, con búsqueda vectorial exacta y juicios de relevancia agrupados. Los resultados del modelo AMPARA corresponden a la exportación INT8 ONNX.

| Retriever | Recall@10 | MRR@10 | NDCG@10 | Recall@100 |
|---|---|---|---|---|
| BM25 | 0,114 | 0,126 | 0,084 | 0,463 |
| BGE-M3 base | 0,503 | 0,520 | 0,427 | 0,855 |
| BGE-M3 AMPARA | 0,651 | 0,635 | 0,545 | 0,970 |

Diferencia emparejada con el modelo base (IC bootstrap del 95 % sobre 114 clústeres de fragmentos fuente): NDCG@10 +0,119 [0,073; 0,166] y Recall@10 +0,148 [0,096; 0,199]. En el conjunto de desarrollo, la versión INT8 alcanza un NDCG@10 estricto de 0,480 frente a 0,489 del checkpoint FP16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP16 (568 M de parámetros) más memoria para activaciones; el repositorio ocupa 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se realizó en una NVIDIA L4, lo que indica que el fine-tuning completo cabe en GPUs de gama media-profesional.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores; también en CPU mediante la exportación ONNX INT8.
- Opciones de despliegue: sentence-transformers, transformers, Text Embeddings Inference (TEI), ONNX Runtime (INT8), y servicios compatibles con endpoints de embeddings.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NDCG@10 (test AMPARA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BGE-M3 AMPARA | 568 M | 2.048 | 0,545 | MIT | Hugging Face |
| BAAI/bge-m3 | 568 M | 8.192 (según modelo original; no confirmado en esta ficha) | 0,427 | MIT | Hugging Face |
| BM25 (referencia léxica) | no aplica | no aplica | 0,084 | no aplica | múltiples implementaciones |

La comparación con otros modelos de embeddings en español (por ejemplo, variantes de E5 o multilingual-e5) no está disponible en la información proporcionada; los únicos datos comparativos publicados son los de la tabla anterior.

## Limitaciones y advertencias

- Dominio único y corpus cerrado: los resultados demuestran adaptación a la Ley n.º 30364 y normas peruanas relacionadas, no generalización a otros corpus legales ni a otras jurisdicciones.
- Consultas sintéticas: tanto las preguntas de entrenamiento como las de test fueron generadas por un LLM con el mismo proceso; no son consultas reales de usuarios ni preguntas redactadas por especialistas.
- Juicios de relevancia generados por LLM: no hubo adjudicación por parte de expertos legales.
- Una única ejecución de entrenamiento: no se midió la variabilidad entre semillas aleatorias.
- Sin validación legal: el modelo recupera texto, no evalúa corrección jurídica; no sustituye el asesoramiento profesional ni los servicios oficiales de ayuda (en Perú, Línea 100).
- El autor advierte que el modelo no está validado por profesionales del derecho y no debe usarse en producción sin evaluación adicional.
- Idiomas: ajustado y etiquetado solo para español; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación en el sistema RAG que lo integra: el modelo en sí no genera texto, pero la calidad de la respuesta final depende del generador y de los fragmentos recuperados.
- Licencia MIT: permite uso comercial, pero la ausencia de validación legal y la naturaleza sensible del dominio exigen revisión humana antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampara-ai/bge-m3-ampara
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Repositorio del proyecto (código y datos): https://github.com/ampara-ai
- Cita académica: Vivas Alejandro, R. G.; Fuentes Rivera Onofre, M. A.; Alarcon Delgado, C. A. (2026). *AMPARA: A Retrieval-Augmented Conversational Agent with Contrastively Fine-Tuned Embeddings for Legal Information on Family Violence in Peru*. Universidad Peruana de Ciencias Aplicadas. Manuscrito.
