# richardyoung/CardioEmbed-Qwen2.5-0.5B

## Resumen

CardioEmbed-Qwen2.5-0.5B es un modelo de embeddings de texto especializado en cardiología clínica, desarrollado por Richard Young (DeepNeuro) mediante adaptación LoRA sobre el modelo base Qwen/Qwen2.5-0.5B. Forma parte de un estudio comparativo de 10 arquitecturas de embeddings para representación de texto cardiológico clínico, publicado en arXiv:2511.19739. Su propósito es generar representaciones vectoriales densas de textos médicos del dominio cardiológico, superando a los embeddings generalistas en tareas de similitud semántica dentro de ese ámbito.

El modelo emplea una arquitectura transformer de tipo decoder-only (heredada de Qwen2.5-0.5B) con 0,5 mil millones de parámetros, adaptada para producir embeddings de frase mediante fine-tuning con LoRA (r=16, alpha=32) y función de pérdida Multiple Negatives Ranking Loss (InfoNCE). Se distribuye como adaptador PEFT sobre el modelo base, de modo que su uso requiere cargar primero Qwen2.5-0.5B y aplicar el adaptador encima.

Su relevancia radica en la especialización de dominio: con un modelo de apenas 0,5B de parámetros, ofrece embeddings orientados a terminología y relaciones semánticas cardiológicas, lo que lo hace atractivo para pipelines de recuperación de información clínica, búsqueda semántica en literatura médica y sistemas RAG en entornos sanitarios donde el coste computacional y la privacidad son críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) con adaptador LoRA |
| Parámetros totales | 0,5 mil millones (modelo base); adaptador LoRA adicional |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-0.5B) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-0.5B, un transformer decoder-only de 0,5B parámetros, al que se le aplica un adaptador LoRA con rango r=16 y alpha=32. La adaptación convierte el modelo generativo en un modelo de embeddings de frase, orientado a la tarea de similitud semántica (pipeline sentence-similarity). El entrenamiento utiliza Multiple Negatives Ranking Loss (InfoNCE), una función de pérdida contrastiva estándar para el entrenamiento de embeddings de frase con pares positivos.

El conjunto de entrenamiento está compuesto por 106.535 pares de textos cardiológicos extraídos de libros de texto médicos. No se especifica en la información disponible el número total de tokens, la composición detallada del dataset ni si se aplicaron etapas adicionales de RLHF o DPO (no procede en un modelo de embeddings). El modelo forma parte de un estudio comparativo más amplio de 10 arquitecturas de embeddings para cardiología clínica.

## Capacidades

- Generación de embeddings de texto densos para similitud semántica (pipeline sentence-similarity).
- Representación especializada de terminología cardiológica y textos clínicos en inglés.
- Búsqueda semántica y recuperación de información en corpus médicos cardiológicos.
- Agrupamiento (clustering) y deduplicación de documentos clínicos por similitud vectorial.
- Base para sistemas RAG (retrieval-augmented generation) en dominio cardiológico.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo en su uso previsto.
- Capacidades multilingües limitadas: solo inglés declarado.
- No dispone de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Búsqueda semántica en literatura cardiológica: indexar artículos, guías clínicas y libros de texto en una base vectorial y recuperar los fragmentos más relevantes para una consulta clínica, aprovechando la especialización del modelo en terminología cardiológica.
- Sistemas RAG para asistencia clínica: usar el modelo como codificador de recuperación en un pipeline que alimente a un LLM generativo con contexto cardiológico relevante, reduciendo alucinaciones al fundamentar las respuestas en documentos recuperados.
- Deduplicación y agrupamiento de registros clínicos: agrupar informes de cardiología similares o detectar duplicados en bases de datos hospitalarias mediante similitud de embeddings.
- Clasificación y triaje de documentos médicos: usar los embeddings como características de entrada para clasificadores posteriores (por ejemplo, categorización de informes por patología cardíaca).
- Motor de recomendación de contenido médico: sugerir artículos o casos clínicos relacionados a profesionales sanitarios en función de la similitud semántica con lo que están leyendo.
- Evaluación comparativa de arquitecturas de embeddings: servir como referencia en estudios de dominio (como el propio arXiv:2511.19739) para medir la eficacia de la adaptación LoRA en dominios especializados.
- Anonimización y privacidad: al ser un modelo de 0,5B desplegable en local, permite procesar textos clínicos sensibles sin enviarlos a servicios externos.

## Benchmarks y rendimiento

| Métrica | Puntuación |
|---|---|
| Separation Score | 0,327 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) ni comparativas numéricas con otros modelos del estudio. El único dato reportado es el Separation Score de 0,327, métrica definida en el paper asociado (arXiv:2511.19739).

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1 GB para el modelo base de 0,5B más el adaptador LoRA (muy reducido); en cuantización de 8 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU para cargas moderadas.
- Cabe holgadamente en GPU consumer e incluso en entornos con poca VRAM o en CPU.
- Opciones de despliegue: transformers + PEFT (según el ejemplo de la model card), sentence-transformers, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo (0,5B) se espera baja latencia y alto throughput en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-Qwen2.5-0.5B | 0,5B | no disponible | Cardiología clínica | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B (base) | 0,5B | no disponible | Generalista | Apache 2.0 | Hugging Face |
| Otros modelos del estudio comparativo (arXiv:2511.19739) | no disponible | no disponible | Cardiología clínica | no disponible | no disponible |

No se dispone en la información proporcionada de datos numéricos de rendimiento de los modelos alternativos del estudio para establecer una comparativa cuantitativa. La comparación con el modelo base Qwen2.5-0.5B es cualitativa: CardioEmbed añade especialización de dominio mediante LoRA.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en inglés; no soporta castellano ni otros idiomas de forma declarada.
- Ámbito restringido a cardiología clínica: su rendimiento fuera de ese dominio puede degradarse frente a embeddings generalistas.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el modelo base Qwen2.5-0.5B por separado, lo que añade complejidad de despliegue.
- Riesgo de sesgos: entrenado con pares extraídos de libros de texto médicos, puede reflejar sesgos presentes en esas fuentes (poblaciones, terminología, prácticas clínicas de un contexto concreto).
- Riesgo de alucinación: aunque es un modelo de embeddings (no generativo en su uso previsto), una recuperación deficiente puede propagar errores en pipelines RAG posteriores.
- No apto para uso clínico directo sin validación: no debe emplearse como herramienta de diagnóstico ni sustituir el juicio médico.
- El único benchmark reportado (Separation Score 0,327) carece de contexto comparativo en la información disponible; su interpretación requiere consultar el paper.
- Escaso soporte comunitario: 35 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen2.5-0.5B (también Apache 2.0 según la información disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-Qwen2.5-0.5B
- Paper (arXiv): https://arxiv.org/abs/2511.19739
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Perfil del autor: https://deepneuro.ai/richard
