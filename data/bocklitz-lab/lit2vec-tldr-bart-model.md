# Bocklitz-Lab/lit2vec-tldr-bart-model

## Resumen

lit2vec-tldr-bart es un modelo de resumen abstractivo derivado de DistilBART (`sshleifer/distilbart-cnn-12-6`), ajustado por el Bocklitz Lab (Leibniz IPHT y Universidad Friedrich Schiller de Jena) para generar resúmenes TL;DR de una o dos frases a partir de abstracts científicos de química. Forma parte del flujo de trabajo Lit2Vec, orientado a la construcción de corpus de química legalmente cribados a partir de S2ORC para recuperación semántica y minería de textos.

El modelo resuelve un problema muy concreto: producir resúmenes cortos y homogéneos de abstracts de química que sirvan como campo TL;DR en índices semánticos, motores de recuperación y grafos de conocimiento. Con 305,6 millones de parámetros y una ventana de entrada de 1.024 tokens, es lo bastante pequeño para ejecutarse en una única GPU de consumo, lo que lo hace adecuado para procesar corpus de decenas de miles de documentos.

Es relevante ahora porque demuestra un patrón reproducible de destilación de resúmenes generados por GPT-4o hacia un modelo pequeño y desplegable localmente, con licencia Apache-2.0 y pesos en safetensors, PyTorch y ONNX. El autor advierte explícitamente de que el modelo imita el estilo de GPT-4o y no está diseñado para ser fiel por construcción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART destilado, 12 capas en encoder y 6 en decoder) |
| Parametros totales | 305.560.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrada hasta 1.024 tokens; salida objetivo de 128 tokens (max_length de decodificacion 142) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 305 M, la cuantizacion a fp16/int8 es viable con herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, pytorch_model.bin, ONNX (onnx/model.onnx) |

## Arquitectura y entrenamiento

El modelo es un DistilBART basado en `sshleifer/distilbart-cnn-12-6`: un transformer encoder-decoder con 12 capas en el encoder y 6 en el decoder, 305,6 millones de parámetros y atención completa estándar. La tarea es text2text-generation con pipeline de summarization. El tokenizador es el BART estándar (vocab.json, merges.txt) con tokens especiales forzados en la generación (`forced_bos_token_id` 0, `forced_eos_token_id` 2).

El ajuste fino se realizó sobre 19.992 abstracts de química con licencia CC-BY procedentes de S2ORC, cuyos resúmenes TL;DR fueron generados por GPT-4o. Los splits son 17.992 de entrenamiento, 999 de validación y 1.001 de test. La configuración de entrenamiento incluye AdamW con learning rate 2e-5, batch size efectivo de 16 (4 por dispositivo con 4 pasos de acumulación de gradiente), 5 épocas, precisión mixta fp16 en CUDA, semilla 42 y una única NVIDIA RTX 3090. La longitud máxima es de 1.024 tokens de entrada y 128 de salida. No se documenta RLHF ni DPO; el aprendizaje es supervisado sobre las salidas de GPT-4o, lo que constituye la innovación principal del trabajo: destilar resúmenes de un LLM grande en un modelo pequeño desplegable localmente. Los parámetros de decodificación por defecto (beam search con 4 haces, `length_penalty` 2.0, `no_repeat_ngram_size` 3, `min_length` 56, `max_length` 142) se distribuyen en `generation_config.json`.

## Capacidades

- Generación de resúmenes abstractivos cortos (una o dos frases) de abstracts de química y áreas afines (ciencia de materiales, ingeniería química, ciencias ambientales).
- Procesamiento de entradas de hasta 1.024 tokens, suficiente para abstracts científicos completos.
- Generación por lotes (batch inference) con padding y truncamiento, adecuada para procesar corpus completos.
- Decodificación configurable mediante beam search y parámetros guardados en `generation_config.json`.
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se declara soporte de otros idiomas.

## Casos de uso

- Indexación semántica de corpus de química: generar el campo TL;DR de cada abstract para enriquecer embeddings y metadatos en un motor de búsqueda vectorial, aprovechando que el modelo procesa 1.024 tokens de entrada y produce salidas de longitud fija y homogénea.
- Población de grafos de conocimiento: usar los resúmenes cortos como descripciones de nodos de publicaciones o entidades químicas, tal como plantea el flujo Lit2Vec, con generación por lotes sobre miles de abstracts.
- Recuperación de literatura (retrieval): producir resúmenes normalizados que mejoren la coincidencia entre consultas y documentos en sistemas de búsqueda académica, gracias a la consistencia estilística derivada del entrenamiento con salidas de GPT-4o.
- Cribado y triaje de publicaciones: resumir abstracts entrantes para que revisores humanos decidan rápidamente su relevancia, ejecutando el modelo en una única GPU de consumo.
- Enriquecimiento de pipelines de minería de textos: integrar el modelo como paso previo a la extracción de entidades y relaciones, generando descripciones breves que reduzcan el ruido de los abstracts completos.
- Despliegue en entornos con recursos limitados: servir el modelo vía ONNX o transformers en CPU o GPU modesta para procesar lotes nocturnos de abstracts sin depender de APIs externas de LLM.
- Reproducción de investigación: reentrenar o evaluar el flujo con el código y dataset publicados, usando el modelo como línea base de resumen científico especializado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test (1.001 abstracts) del dataset Lit2Vec TL;DR Chemistry, calculados con `evaluate` (ROUGE con NLTK y `use_stemmer=True`). No están verificados de forma independiente (`verified: false`).

| Metrica | Test (1.001) | Test sin resúmenes vacios (997) | Validacion |
|---|---:|---:|---:|
| ROUGE-1 | 56,11 | 56,34 | no disponible |
| ROUGE-2 | 30,78 | 30,90 | no disponible |
| ROUGE-Lsum | 45,43 | 45,62 | 46,05 |

El autor indica que la comparación con otras líneas base de resumen aparece en el paper de Lit2Vec; no se proporcionan en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp32 (305,6 M de parámetros) y unos 0,6 GB en fp16, más el overhead de activaciones y del beam search con 4 haces; en la práctica, menos de 2-3 GB en la mayoría de configuraciones.
- GPU recomendadas: el modelo se entrenó en una NVIDIA RTX 3090; para inferencia es suficiente cualquier GPU con 4 GB o más, como RTX 3060, RTX 4060, RTX 4090, A100 o H100 (estas últimas muy sobredimensionadas para este tamaño).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más de VRAM; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), ONNX Runtime con el export incluido, y herramientas compatibles con modelos seq2seq de Hugging Face. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El uso de beam search con 4 haces y salidas de hasta 142 tokens implica varias pasadas del decoder por muestra; el procesamiento por lotes es la vía recomendada por el autor para corpus grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lit2vec-tldr-bart | 305,6 M | 1.024 tokens de entrada | Resumen TL;DR de abstracts de química | Apache-2.0 | Hugging Face, ONNX, demo Space |
| sshleifer/distilbart-cnn-12-6 (base) | 305,6 M | 1.024 tokens de entrada | Resumen general (CNN/DailyMail) | Apache-2.0 | Hugging Face |
| facebook/bart-large-cnn | 406 M | 1.024 tokens de entrada | Resumen general de noticias | Apache-2.0 | Hugging Face |

La comparación cuantitativa de rendimiento con estos modelos no está disponible en la información proporcionada; el autor remite al paper de Lit2Vec para la comparación con otras líneas base de resumen.

## Limitaciones y advertencias

- El modelo imita los resúmenes de GPT-4o con los que fue entrenado; no garantiza fidelidad al contenido del abstract por construcción, según advierte el propio autor.
- Riesgo de alucinación: al ser un modelo generativo abstractivo, puede introducir afirmaciones o matices ausentes en el texto original.
- Dominio restringido: está pensado para abstracts de química y campos afines; su comportamiento fuera de ese dominio no está evaluado.
- Solo inglés: no se declara ni evalúa soporte de otros idiomas.
- Ventana de entrada limitada a 1.024 tokens; abstracts más largos se truncan.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia del modelo Apache-2.0, pero el dataset de entrenamiento es CC BY 4.0 y sus resúmenes se generaron con GPT-4o; si se usan esos datos para entrenar otros modelos, deben revisarse los términos de uso de OpenAI.
- Los resultados de ROUGE son declarados por el autor y no están verificados de forma independiente.
- Cuatro registros del test tienen resumen de referencia vacío, lo que afecta ligeramente a las métricas globales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación externa muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bocklitz-Lab/lit2vec-tldr-bart-model
- Dataset de entrenamiento: https://huggingface.co/datasets/Bocklitz-Lab/lit2vec-tldr-bart-dataset
- Modelo base: https://huggingface.co/sshleifer/distilbart-cnn-12-6
- Demo Space: https://huggingface.co/spaces/Bocklitz-Lab/lit2vec-tldr-bart-space
- Codigo de entrenamiento: https://github.com/Bocklitz-Lab/lit2vec-tldr-bart
- Codigo del flujo Lit2Vec: https://github.com/Bocklitz-Lab/Lit2Vec-code
- Paper Lit2Vec (arXiv): https://arxiv.org/abs/2604.12498
- DOI del paper: https://doi.org/10.48550/arXiv.2604.12498
