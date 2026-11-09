# much1na/ettin-400m-squadv2

## Resumen

`much1na/ettin-400m-squadv2` es un modelo de question answering extractivo (QA) obtenido por fine-tuning del encoder `jhu-clsp/ettin-encoder-400m` sobre el split de entrenamiento de SQuAD 2.0. Dado un par pregunta-pasaje, el modelo devuelve los índices de inicio y fin del fragmento del pasaje que responde a la pregunta, o predice ausencia de respuesta en el caso de preguntas sin respuesta (característica propia de SQuAD 2.0). Lo publica el usuario `much1na` y no debe confundirse con el modelo base original de JHU CLSP.

El modelo base Ettin es un encoder de arquitectura ModernBERT de aproximadamente 396 millones de parámetros, entrenado sobre 2 billones de tokens y diseñado para permitir una comparación controlada entre arquitecturas encoder y decoder con datos de entrenamiento idénticos. Este fine-tuning concreto añade la cabeza de QA extractiva sobre esa representación.

Su relevancia práctica es acotada pero concreta: es un checkpoint pequeño, con licencia MIT, que ofrece un rendimiento alto en SQuAD 2.0 (86,63 de Exact Match y 90,01 de F1 en validación, según el autor) con un coste de inferencia bajo. Resulta útil como componente de pipelines de búsqueda de respuestas sobre documentos, sistemas de FAQ o como baseline reproducible de QA extractivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), con cabeza de question answering extractiva (start/end logits) |
| Parametros totales | 395.833.346 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens en entrenamiento (max_seq_len = 384, doc_stride = 128); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en fp32/fp16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible (entrenado sobre SQuAD 2.0, que es mayoritariamente inglés; el autor no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/ettin-encoder-400m`, un encoder ModernBERT de unos 396 millones de parámetros. ModernBERT incorpora mejoras sobre el transformer encoder clásico: atención con RoPE, alternancia de capas con atención global y local, y kernels optimizados para secuencias largas. Sobre esta base se añade una cabeza de QA extractiva que produce logits de inicio y fin sobre los tokens del contexto.

El fine-tuning se realizó únicamente sobre el split de entrenamiento de SQuAD 2.0 (130.319 preguntas) y se evaluó sobre el split de validación (11.873 preguntas). Los hiperparámetros declarados son: learning rate 5e-5, batch global de 32 (8 por GPU con 4 pasos de acumulación), optimizador AdamW (`adamw_torch`), gradient checkpointing activado, 2 épocas, longitud máxima de secuencia 384, `doc_stride` de 128, warmup ratio 0,1, weight decay 0,01, semilla 42 y precisión fp16. No se documenta uso de RLHF ni DPO, algo esperable en un modelo encoder de QA extractivo.

## Capacidades

- Question answering extractivo: localiza el span de respuesta dentro de un pasaje dado.
- Manejo de preguntas sin respuesta: al estar entrenado con SQuAD 2.0, aprende a predecir ausencia de respuesta (el pipeline debe mapear el span nulo o usar el score de "no answer").
- Procesamiento de contextos de hasta 384 tokens por ventana, con solapamiento de 128 tokens entre ventanas para pasajes más largos.
- Extracción de respuestas sobre documentos en inglés (idioma predominante de SQuAD 2.0).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene modo thinking, visión ni audio.
- No es un modelo generativo: no produce texto libre, solo índices de span.

## Casos de uso

- Búsqueda de respuestas sobre documentación técnica: se indexa la documentación en fragmentos de hasta 384 tokens y se ejecuta el modelo sobre los fragmentos recuperados por un retriever para devolver el span exacto que responde a la consulta del usuario.
- Sistemas de FAQ automatizados: dada una base de preguntas frecuentes con sus respuestas, el modelo localiza la respuesta concreta dentro del texto de cada entrada, reduciendo la necesidad de coincidencia exacta de plantillas.
- Extracción de campos en documentos estructurados semiestructurados: por ejemplo, localizar importes, fechas o nombres dentro de contratos o facturas en inglés formulando cada extracción como una pregunta.
- Componente de un pipeline RAG (retrieval-augmented generation): actúa como extractor de evidencia antes de pasar el fragmento a un modelo generativo, lo que reduce el coste y el riesgo de alucinación al acotar la respuesta a texto literal del documento.
- Análisis de transcripciones o artículos: extracción de respuestas concretas sobre corpus textuales largos divididos en ventanas con solapamiento.
- Baseline de investigación en QA extractivo: por su tamaño reducido y su licencia MIT, sirve como referencia reproducible para comparar técnicas de fine-tuning, cuantización o destilación en tareas de QA.
- Servicio de bajo coste en CPU: con 396 millones de parámetros, es viable ejecutarlo en CPU para cargas moderadas, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Split | Exact Match | F1 | Training loss |
|---|---|---|---|---|
| SQuAD 2.0 | validation | 86,63 | 90,01 | 0,5903 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp16 (396 M de parámetros × 2 bytes); en fp32, unos 3,2 GB. El tamaño del repo es de 1,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece holgura para lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con al menos 4 GB de VRAM).
- También es viable en CPU para cargas moderadas, dado el reducido número de parámetros.
- Opciones de despliegue: transformers (`AutoModelForQuestionAnswering`), ONNX Runtime, o servidores de inferencia compatibles con modelos de la librería transformers (el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints). No se publican pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SQuAD 2.0 (EM / F1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| much1na/ettin-400m-squadv2 | 396 M | 384 (entrenamiento) | 86,63 / 90,01 (declarado) | MIT | Hugging Face |
| jhu-clsp/ettin-encoder-400m (base) | 396 M | No disponible | No aplica (sin fine-tuning de QA) | No disponible | Hugging Face |
| tomaarsen/ettin-encoder-400m-multivector-msmarco32k-1e-4-20261014 | 396 M | No disponible | No disponible (tarea de retrieval, no QA) | No disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (QA extractivo sobre SQuAD 2.0) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas como RoBERTa-base o DeBERTa-v3.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre SQuAD 2.0, hereda los sesgos del corpus de Wikipedia en inglés del que procede.
- Riesgo de alucinación: bajo en sentido estricto, ya que el modelo solo devuelve spans literales del pasaje; sin embargo, puede seleccionar un span incorrecto o responder a preguntas sin respuesta si el umbral de "no answer" no se calibra adecuadamente.
- Limitaciones de contexto: la ventana de entrenamiento es de 384 tokens, con `doc_stride` de 128; pasajes más largos requieren segmentación en ventanas y agregación de resultados.
- Limitaciones de idioma: entrenado sobre SQuAD 2.0, predominantemente en inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será bajo.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; conviene revisar igualmente la licencia del modelo base `jhu-clsp/ettin-encoder-400m`, no disponible en la información proporcionada.
- Caveat de producción: el pipeline `question-answering` de transformers no está disponible en transformers 5 según la model card; es necesario usar `AutoModelForQuestionAnswering` y gestionar manualmente los offsets y la lógica de "no answer".
- Los resultados de benchmarks están declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- El modelo tiene 1 descarga y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/much1na/ettin-400m-squadv2
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Dataset SQuAD 2.0: https://huggingface.co/datasets/rajpurkar/squad_v2
- Fine-tuning relacionado del mismo base (multivector MS MARCO): https://huggingface.co/tomaarsen/ettin-encoder-400m-multivector-msmarco32k-1e-4-20261014
