# prince4332/AfriE5-twi-query-encoder-v3

## Resumen

AfriE5-twi-query-encoder-v3 es un codificador de consultas (*query encoder*) especializado en recuperación de información Twi → inglés, desarrollado por el usuario prince4332 y publicado en HuggingFace bajo licencia MIT. Se construye mediante destilación de conocimiento a partir de `McGill-NLP/AfriE5-Large-instruct`, un modelo multilingüe basado en arquitectura XLM-RoBERTa. Su función es codificar preguntas en Twi (akan) en el mismo espacio vectorial que los pasajes en inglés generados por el modelo base, de modo que la búsqueda semántica funcione entre idiomas sin necesidad de traducir la consulta.

El modelo resuelve un problema concreto: la brecha de rendimiento en recuperación cross-lingual para lenguas africanas de bajos recursos. En lugar de entrenar un codificador bilingüe completo, congela el espacio de pasajes del modelo base y aprende únicamente a mapear consultas en Twi a ese espacio, lo que reduce drásticamente los requisitos de datos y cómputo. Con 559,9 millones de parámetros, se posiciona como una alternativa ligera y desplegable para sistemas de búsqueda y RAG en contextos donde el Twi es la lengua de consulta.

Es relevante ahora porque demuestra una técnica de destilación listwise KL aplicada a un par de lenguas con pocos recursos, con mejoras medibles en nDCG@10 sobre el modelo base (de 67,5 a 71,7 en Twi→Eng estricto) y un rendimiento cercano a la referencia de Gemini en el benchmark AfriQA. El modelo está pensado para investigación, dado que parte de los datos de entrenamiento derivan de NLLB-200 (CC BY-NC 4.0).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de AfriE5-Large-instruct) |
| Parámetros totales | 559.890.432 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; XLM-RoBERTa soporta hasta 512 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de sentence-transformers) |
| Idiomas soportados | tw (Twi/akan), en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Librería | sentence-transformers |
| Tamaño del repo | 1,1 GB |
| Modelo base | McGill-NLP/AfriE5-Large-instruct |
| Dimensión de embedding | no disponible |

## Arquitectura y entrenamiento

El modelo es un codificador bi-encoder basado en la arquitectura XLM-RoBERTa del modelo `McGill-NLP/AfriE5-Large-instruct`. La innovación principal no reside en la arquitectura, sino en el esquema de entrenamiento: el espacio de pasajes del modelo base permanece congelado y solo se entrena el codificador de consultas para que, dada una pregunta en Twi, produzca un embedding alineado con el del pasaje en inglés que responde a esa pregunta. Se trata de una destilación listwise con divergencia KL: el modelo base, recibiendo la pregunta en inglés, puntúa el pasaje correcto y siete negativos duros, y el modelo entrenado aprende a reproducir esas puntuaciones a partir de la pregunta en Twi.

Los datos de entrenamiento provienen de preguntas en inglés de Natural Questions, TriviaQA, SQuAD y GooAQ, muestreadas para favorecer un bajo solapamiento de palabras clave, traducidas a Asante Twi con `facebook/nllb-200-3.3B` y filtradas mediante back-translation. Se añade un término ligero de alineación Twi–inglés sobre el corpus de GhanaNLP. Los pesos finales son una mezcla 1.0 × entrenado + 0.0 × base. No se utilizó ningún dato de AfriQA para entrenamiento ni selección del modelo. Cabe señalar que NLLB-200 tiene licencia CC BY-NC 4.0, lo que restringe el uso a investigación.

## Capacidades

- Codificación de consultas en Twi para recuperación cross-lingual Twi → inglés.
- Generación de embeddings normalizados aptos para similitud coseno y búsqueda vectorial.
- Alineación semántica entre preguntas en Twi y pasajes en inglés sin traducción intermedia.
- Soporte de instrucciones mediante prompt (`Instruct: Given a question, retrieve Wikipedia passages that answer the question\nQuery: `).
- Robustez ante variantes ortográficas del Twi: mantiene rendimiento alto con y sin caracteres especiales ɛ/ɔ (70,2 y 72,0 nDCG@10 respectivamente).
- Integración nativa con `sentence-transformers` y pipelines de recuperación densa.
- No soporta tool calling, agentes, visión ni audio (es un encoder de recuperación, no un modelo generativo).
- Capacidad multilingüe limitada a tw y en.

## Casos de uso

- Búsqueda semántica en Wikipedia para hablantes de Twi: el modelo codifica la consulta en Twi y recupera pasajes en inglés del índice del modelo base, permitiendo acceso a contenido enciclopédico sin traducir la pregunta. Adecuado por su nDCG@10 de 71,7 en AfriQA Twi→Eng.
- Sistemas RAG (generación aumentada por recuperación) para lenguas akan: se usa como recuperador de pasajes en inglés a partir de preguntas en Twi, alimentando un LLM generativo que responde en Twi o inglés. La separación entre encoder de consulta y de pasajes permite reutilizar índices existentes del modelo base.
- Atención al cliente en Ghana: recuperación de respuestas de una base de conocimiento en inglés a partir de consultas de usuarios en Twi, con un coste de inferencia bajo (559M parámetros) y despliegue en CPU o GPU consumer.
- Búsqueda documental en archivos y bibliotecas: indexación de documentos en inglés y consulta en Twi por parte de investigadores o estudiantes, aprovechando la robustez ante ortografías sin ɛ/ɔ (nDCG@10 de 70,2).
- Evaluación de sistemas de recuperación cross-lingual: sirve como componente de referencia para medir la brecha entre recuperación monolingüe inglesa (87,3 nDCG@10) y cross-lingual en lenguas de bajos recursos.
- Filtrado y deduplicación de corpus bilingües: el encoder puede puntuar la relevancia entre pares pregunta–pasaje en Twi e inglés para construir datasets de entrenamiento o validación.
- Investigación en destilación cross-lingual: el esquema de destilación listwise con espacio de pasajes congelado es replicable para otras lenguas africanas, y este modelo sirve como caso de estudio reproducible.

## Benchmarks y rendimiento

Resultados en el test AfriQA Twi (nDCG@10, estricto; pasajes codificados por el modelo base AfriE5):

| Configuración | Base | Entrenado | Referencia Gemini |
|---|---:|---:|---:|
| Twi→Eng | 67,5 | 71,7 | 68 |
| Twi (estándar ɛ/ɔ)→Eng | 68,3 | 72,0 | 70 |
| Twi (sin ɛ/ɔ)→Eng | 63,4 | 70,2 | 63 |
| Eng→Eng (referencia) | 87,7 | 87,3 | 89,6 |

El modelo entrenado supera al base en las tres configuraciones Twi→Eng y se aproxima o supera la referencia de Gemini en dos de ellas. La ligera caída en Eng→Eng (87,3 frente a 87,7) es esperable al especializar el codificador de consultas en Twi.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB (559,9M parámetros × 4 bytes).
- VRAM estimada en fp16: aproximadamente 1,1 GB; en int8: aproximadamente 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4090, A100 o H100 para lotes grandes y alto throughput.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Despliegue: `sentence-transformers`, `transformers`, `vLLM` (no aplica para embeddings puros), `TGI` con soporte de embeddings, `FastAPI` + `sentence-transformers` para servicios de recuperación, `FAISS` o `Qdrant` para el índice vectorial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| AfriE5-twi-query-encoder-v3 | 559,9M | no disponible (≤512) | tw, en | MIT | Query encoder destilado para Twi→Eng |
| McGill-NLP/AfriE5-Large-instruct | 559,9M | no disponible (≤512) | multilingüe (africanas) | no disponible | Bi-encoder multilingüe completo |
| BAAI/bge-m3 | 568M | 8192 | multilingüe (100+) | MIT | Bi-encoder multilingüe denso |
| intfloat/multilingual-e5-large | 560M | 512 | multilingüe (100+) | MIT | Bi-encoder multilingüe |

La ventaja específica de este modelo frente a los multilingües genéricos es su especialización en Twi, con un espacio de pasajes compatible con AfriE5. No se dispone de comparativas directas de nDCG@10 entre estos modelos en AfriQA en la información proporcionada.

## Limitaciones y advertencias

- Solo codifica consultas; los pasajes deben codificarse con `McGill-NLP/AfriE5-Large-instruct`. Usar otro encoder de pasajes rompe la alineación.
- Restricción de licencia en datos: NLLB-200 es CC BY-NC 4.0, por lo que el uso comercial del modelo entrenado requiere revisión legal, pese a que la licencia del modelo sea MIT.
- No se usó AfriQA en entrenamiento ni selección, pero el benchmark es el principal referente de evaluación; puede no reflejar dominios fuera de Wikipedia.
- Riesgo de alucinación no aplica directamente (no es generativo), pero puede recuperar pasajes irrelevantes en dominios muy alejados del entrenamiento (NQ, TriviaQA, SQuAD, GooAQ).
- Cobertura limitada a Twi y inglés; no soporta otras lenguas akan ni variantes dialectales distintas del Asante Twi.
- Sensibilidad ortográfica: aunque robusto, el rendimiento baja de 72,0 a 70,2 sin caracteres ɛ/ɔ.
- Longitud de contexto limitada a la del modelo base (≤512 tokens); pasajes largos deben truncarse.
- Modelo con muy pocas descargas (14) y sin likes; no hay validación comunitaria extensa.
- No disponible información sobre sesgos demográficos o geográficos específicos más allá de los derivados de los corpus de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/prince4332/AfriE5-twi-query-encoder-v3
- Modelo base: https://huggingface.co/McGill-NLP/AfriE5-Large-instruct
- NLLB-200 (herramienta de traducción usada): https://huggingface.co/facebook/nllb-200-3.3B
- GhanaNLP (corpus de alineación): no disponible enlace directo en la información proporcionada
- AfriQA (benchmark de evaluación): no disponible enlace directo en la información proporcionada
