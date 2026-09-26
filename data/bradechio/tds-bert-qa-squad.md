# BradechiO/tds-bert-qa-squad

# tds-bert-qa-squad

## Resumen

tds-bert-qa-squad es un modelo de respuesta a preguntas extractiva (extractive question answering) en inglés, publicado por el usuario BradechiO en Hugging Face. Se trata de un ajuste fino completo (full fine-tuning) de bert-base-uncased sobre un subconjunto de 15.000 ejemplos de entrenamiento del dataset SQuAD v1.1, con el objetivo de predecir el span de texto que responde a una pregunta dada un contexto. El modelo tiene 108.893.186 parámetros y un tamaño de repositorio de 0,4 GB.

El problema que resuelve es acotado y clásico: dado un párrafo en inglés y una pregunta, localizar los tokens de inicio y fin de la respuesta dentro del propio contexto. No genera texto libre ni razona fuera de la evidencia presente en el contexto, por lo que su utilidad está restringida a pipelines de extracción sobre documentos en inglés. Según su propia model card, fue desarrollado como trabajo de una asignatura académica y no está pensado para aplicaciones críticas de producción sin validación específica de dominio.

Su relevancia actual es fundamentalmente metodológica: sirve como referencia de bajo coste para estudiar estrategias de ajuste (learning rates discriminativos entre encoder y cabeza de QA, alineación de fronteras de respuesta a nivel de subtoken mediante offset_mapping) y como línea base frente a variantes de ajuste parcial. El autor reporta una validation loss de 1,322171 frente a 2,135518 de un ajuste parcial de las dos capas superiores más la cabeza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT base (encoder-only), con cabeza de QA extractiva para prediccion de span inicio/fin |
| Parametros totales | 108.893.186 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens de posicion (limite arquitectonico de BERT base); en la practica el autor indica que las secuencias de mas de 384 tokens se truncan |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers) |
| Modelo base | bert-base-uncased |
| Tarea | question-answering (extractive QA) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 7 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de tipo BERT base: 12 capas, atencion multi-cabeza completa y embeddings WordPiece, sobre el que se anade una cabeza de respuesta a preguntas que produce dos distribuciones (inicio y fin del span). El modelo parte de los pesos de bert-base-uncased y se ajusta de forma completa (todas las capas), no mediante adaptadores ni LoRA.

El entrenamiento usa el dataset rajpurkar/squad (SQuAD v1.1) submuestreado a 15.000 ejemplos, con semilla aleatoria 42, 2 epocas y tamano de lote 16. La configuracion del optimizador emplea learning rates discriminativos: 2e-5 para el encoder y 1e-3 para la cabeza de QA. La alineacion de etiquetas se realizo con offset_mapping, mapeando las fronteras de la respuesta a nivel de caracter a los subtokens WordPiece correspondientes. La evaluacion se hizo sobre un subconjunto de validacion de 2.000 ejemplos. El autor compara este ajuste completo contra un ajuste parcial de las dos capas superiores mas la cabeza, con una mejora de la loss de validacion de 2,135518 a 1,322171. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Respuesta a preguntas extractiva en ingles: devuelve el fragmento del contexto que responde a una pregunta.
- Prediccion de span a nivel de subtoken con alineacion por offset_mapping, lo que permite recuperar la respuesta exacta en el texto original.
- Manejo de contextos de hasta 384 tokens efectivos (por encima se trunca, con perdida potencial de la respuesta).
- Integracion directa con el pipeline question-answering de Hugging Face Transformers.
- Util como linea base reproducible para experimentos de ajuste (comparacion ajuste completo frente a ajuste parcial).
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; solo ingles.

## Casos de uso

- Prototipado academico y docencia: el modelo esta pensado para un trabajo de asignatura; permite demostrar el ciclo completo de ajuste de BERT para QA extractiva con un coste de computo minimo (menos de 2.000 pasos de optimizacion).
- Linea base en experimentos de ablation: al existir una comparacion declarada entre ajuste completo (loss 1,322171) y ajuste parcial de dos capas mas cabeza (loss 2,135518), sirve como referencia para estudiar estrategias de congelacion de capas y learning rates diferenciados.
- Extraccion de respuestas sobre documentacion tecnica en ingles: dado un manual o articulo en ingles, localizar valores, nombres de funciones o parametros concretos, siempre que la respuesta aparezca literalmente en el texto y el fragmento no supere los 384 tokens.
- Componente de post-procesado en pipelines RAG: usar el modelo para anclar la respuesta generada a un span verificado del contexto recuperado, reduciendo el riesgo de afirmaciones sin evidencia en el documento fuente.
- Pre-anotacion de datasets de QA: generar spans candidatos sobre corpus en ingles para revision humana posterior, reduciendo el coste de anotacion en tareas de anotacion activa.
- Busqueda de respuestas en bases de conocimiento internas en ingles: sobre fichas de producto, FAQs o wikis internas, devolviendo el fragmento exacto y no una sintesis generada.
- Extraccion de campos en documentos semiestructurados en ingles: preguntas del tipo "cual es la fecha de entrada en vigor" sobre contratos o formularios, con la salvedad de que el modelo no gestiona preguntas sin respuesta (fue entrenado en SQuAD v1.1).
- Validacion de tecnicas de alineacion de subtokens: por su uso explicito de offset_mapping, es util para comparar metodologias de mapeo caracter-subtoken en la frontera de la respuesta.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card. Todos los valores estan marcados como no verificados (`verified: false`) y corresponden a un subconjunto de validacion de 2.000 ejemplos, no al conjunto de validacion completo de SQuAD v1.1.

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| tds-bert-qa-squad (ajuste completo) | SQuAD v1.1 | Validation Loss | 1,322171 | no |
| Variante de ajuste parcial (2 capas superiores + cabeza) | SQuAD v1.1 | Validation Loss | 2,135518 | no |

No se han publicado valores de Exact Match (EM) ni de F1 en la informacion disponible, que son las metricas estandar para evaluar QA extractiva. Tampoco se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16/bf16 solo para los pesos; con overhead de activaciones y lotes pequenos, el consumo real se situa en torno a 1-2 GB para secuencias de hasta 384 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (por ejemplo GTX 1650, RTX 3060, RTX 4090, T4, L4). Para alto throughput en servidor, A100 o H100 estan sobredimensionadas para este modelo, pero permiten lotes muy grandes.
- Inferencia en CPU: viable con latencias de decenas de milisegundos por consulta en procesadores modernos, dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos, e incluso en entornos sin GPU.
- Opciones de despliegue: Hugging Face Transformers (pipeline question-answering), ONNX Runtime y TorchScript para optimizacion de latencia, NVIDIA Triton o FastAPI para servicio HTTP. Ollama y llama.cpp no estan orientados a este tipo de cabeza de QA extractiva sobre BERT. vLLM y Text Embeddings Inference tampoco cubren de forma estandar la tarea de QA extractiva con prediccion de span.
- Latencia y throughput estimados: no disponible; no se aportan mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tds-bert-qa-squad | 108,9 M | 512 (truncado a 384 por el autor) | en | no disponible | Ajuste completo sobre 15.000 ejemplos de SQuAD v1.1; SQuAD v1.1 (sin preguntas sin respuesta); 7 descargas |
| bert-base-uncased ajustado en SQuAD (por ejemplo deepset/bert-base-cased-squad2) | ~110 M | 512 | en | no disponible en esta ficha (consultar su model card) | Ajuste sobre SQuAD v2.0, que si incluye preguntas sin respuesta; uso extendido en produccion |
| distilbert-base-uncased-distilled-squad | 66,4 M | 512 | en | Apache-2.0 | Version destilada, aproximadamente un 40 % menos de parametros y mayor velocidad de inferencia |
| deepset/roberta-base-squad2 | ~125 M | 512 (roberta-base admite 514) | en | no disponible en esta ficha (consultar su model card) | Entrenado sobre SQuAD v2.0; habitualmente mas robusto en contextos largos y texto informal |

No se dispone de valores comparables de EM ni F1 para tds-bert-qa-squad, por lo que no es posible establecer una comparacion cuantitativa de rendimiento con las alternativas. La unica metrica publicada (validation loss de 1,322171 sobre un subconjunto de 2.000 ejemplos) no es directamente comparable con las metricas publicadas por los otros modelos en sus respectivas model cards. Las licencias de las alternativas deben verificarse en sus repositorios antes de cualquier uso comercial.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto de 15.000 ejemplos de SQuAD v1.1, no sobre el dataset completo (aproximadamente 87.600 ejemplos de entrenamiento), lo que limita la cobertura y la generalizacion.
- SQuAD v1.1 no contiene preguntas sin respuesta: el modelo siempre devuelve un span, incluso cuando la respuesta no existe en el contexto, lo que produce extracciones incorrectas presentadas con confianza. No equivale a los modelos ajustados en SQuAD v2.0.
- Truncado a 384 tokens: si la respuesta se encuentra mas alla de ese limite, el modelo no puede recuperarla.
- Solo ingles. El rendimiento se degrada con texto no ingles, con texto informal de web y con dominios alejados de los articulos de Wikipedia de SQuAD.
- Licencia no disponible: al no declararse una licencia en el repositorio, el uso comercial queda en situacion juridica indeterminada y requiere contacto con el autor.
- Metricas incompletas: solo se publica validation loss sobre un subconjunto de 2.000 ejemplos, sin Exact Match ni F1, y el valor figura como no verificado. La loss no permite estimar la calidad real de las respuestas.
- Riesgo de alucinacion de span: en ausencia de una respuesta explicita, el modelo puede seleccionar fragmentos irrelevantes del contexto, lo que en un sistema de atencion al cliente o de soporte puede generar respuestas incorrectas.
- Senales de adopcion muy bajas (7 descargas, 0 likes) y ausencia de validacion externa o de evaluacion por terceros.
- La model card indica explicitamente que no esta pensado para aplicaciones NLP criticas de produccion sin validacion especifica de dominio.
- Sesgos heredados de bert-base-uncased y del corpus de Wikipedia sobre el que se construyo SQuAD, no evaluados ni documentados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BradechiO/tds-bert-qa-squad
- Modelo base bert-base-uncased: https://huggingface.co/bert-base-uncased
- Dataset rajpurkar/squad: https://huggingface.co/datasets/rajpurkar/squad
- Rajpurkar et al. (2016), SQuAD: 100,000+ Questions for Machine Comprehension of Text: https://arxiv.org/abs/1606.05250
- Devlin et al. (2019), BERT: Pre-training of Deep Bidirectional Transformers: https://arxiv.org/abs/1810.04805
- Documentacion de Hugging Face Transformers: https://huggingface.co/docs/transformers/index
