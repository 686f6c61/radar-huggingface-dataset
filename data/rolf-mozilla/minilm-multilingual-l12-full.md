# rolf-mozilla/minilm-multilingual-l12-full

## Resumen

MiniLM multilingual (checkpoint `rolf-mozilla/minilm-multilingual-l12-full`) es una reimplementacion del modelo **Multilingual-MiniLM-L12-H384** original de Microsoft, publicado bajo licencia MIT. Se trata de un codificador transformer tipo BERT de 12 capas y 384 dimensiones ocultas, con 12 cabezas de atencion, destilado a partir de XLM-R Base. Su proposito es ofrecer comprension de lenguaje multilingue con un coste computacional muy reducido: 21M de parametros en el transformer mas 96M en la matriz de embeddings, frente a los 85M del transformer de XLM-R Base y mBERT.

El modelo resuelve tareas de **entendimiento del lenguaje** (clasificacion de texto, inferencia de lenguaje natural, question answering extractivo, sentence embeddings) en mas de 100 idiomas, manteniendo una calidad cercana a modelos tres o cuatro veces mas grandes. Es relevante porque permite desplegar clasificadores multilingues en CPU o en GPUs de gama baja con latencias de milisegundos, algo critico para sistemas de moderacion de contenido, enrutado de tickets o busqueda semantica a gran escala.

La arquitectura es un transformer encoder estandar de 12 capas, entrenado mediante destilacion de auto-atencion (deep self-attention distillation) desde XLM-R Base, con el objetivo de replicar las distribuciones de atencion del profesor. El tokenizador es el de XLM-R (SentencePiece), lo que implica que `AutoTokenizer` no funciona directamente con este checkpoint: es necesario cargar `XLMRobertaTokenizer` explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM v1 con destilacion de auto-atencion) |
| Parametros totales | ~117M (21M en el transformer + 96M en los embeddings) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; la arquitectura BERT permite hasta 512 tokens (los ejemplos de fine-tuning usan `max_seq_length` 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingual, en, ar, bg, de, el, es, fr, hi, ru, sw, th, tr, ur, vi, zh (16 declarados; el tokenizador XLM-R cubre ~100 idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch, TensorFlow y JAX (tags del repositorio: `pytorch`, `tf`, `jax`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 12 capas con representacion oculta de 384 dimensiones y 12 cabezas de atencion (12x384). Internamente usa la misma estructura que BERT, pero se entrena mediante **destilacion de auto-atencion** desde XLM-R Base, segun el articulo "MiniLM: Deep Self-Attention Distillation for Task-Agnostic Compression of Pre-Trained Transformers". La innovacion clave de MiniLM es que el alumno aprende a imitar las matrices de auto-atencion (no solo las salidas) del profesor, lo que permite reducir drasticamente el numero de capas y la dimension oculta manteniendo buena parte del rendimiento.

Los datos de entrenamiento corresponden al corpus multilingue de XLM-R (CommonCrawl filtrado), heredado a traves del proceso de destilacion. El modelo no incluye un cabezal de generacion: es un encoder puro, por lo que se utiliza para extraccion de caracteristicas, clasificacion y tareas de comprension. El repositorio incluye utilidades en `github.com/microsoft/unilm` para el fine-tuning en XNLI y MLQA. No se especifica en la informacion disponible si se aplicaron etapas de RLHF o DPO (no procede en un encoder de este tipo).

## Capacidades

- **Clasificacion de texto multilingue**: sentimiento, toxicidad, intencion, topicos, en 16 idiomas declarados y potencialmente en mas de 100 gracias al tokenizador XLM-R.
- **Inferencia de lenguaje natural (NLI) y clasificacion zero-shot**: mediante fine-tuning en MNLI/XNLI puede realizar clasificacion por entailment en multitud de idiomas.
- **Question answering extractivo**: localizacion de respuestas en fragmentos de contexto (evaluado en MLQA).
- **Extraccion de representaciones / sentence embeddings**: util para busqueda semantica, clustering y deduplicacion de texto.
- **Transferencia cross-lingual**: permite entrenar en ingles y aplicar a otros idiomas sin datos etiquetados locales.
- **No soporta generacion de texto**: es un encoder, no un modelo autorregresivo.
- **Soporte de tool calling / function calling**: no disponible (no es una capacidad de este tipo de modelo).
- **Soporte de agentes**: no disponible.
- **Vision, audio, thinking mode**: no disponibles.

## Casos de uso

- **Moderacion de contenido multilingue**: entrenar un clasificador de toxicidad sobre los embeddings del modelo y ejecutarlo en tiempo real en servidores CPU. Sus 21M de parametros en el transformer permiten procesar miles de peticiones por segundo con coste minimo.
- **Enrutado de tickets de soporte**: clasificar tickets entrantes en categorias (facturacion, tecnico, comercial) en varios idiomas con un unico modelo, evitando mantener un clasificador por idioma.
- **Busqueda semantica ligera**: generar embeddings de preguntas frecuentes y respuestas para un motor de retrieval sobre bases de datos vectoriales, con latencia inferior a 10 ms por documento en GPU consumer.
- **Analisis de sentimiento en redes sociales**: procesar grandes volumenes de comentarios en espanol, arabe, hindi o chino con un unico modelo destilado, reduciendo costes de inferencia frente a XLM-R Base.
- **Deduplicacion y clustering de documentos**: usar las representaciones del encoder para agrupar textos similares en corpus multilingues de gran tamano (por ejemplo, pipelines de curacion de datasets).
- **Filtrado previo en pipelines RAG**: actuar como reranker ligero o filtro de relevancia antes de un modelo generativo grande, reduciendo el numero de llamadas al LLM principal.
- **Deteccion de idioma y normalizacion**: aunque no esta disenado especificamente para ello, sus representaciones permiten clasificar el idioma de entrada en sistemas de atencion al cliente.
- **Investigacion en destilacion**: servir como referencia para experimentos de compresion de transformers multilingues y comparacion con arquitecturas de mayor tamano.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre XNLI (cross-lingual natural language inference, precision media) y MLQA (F1 en question answering cross-lingual):

| Modelo | Capas | Ocultas | Parametros transformer | XNLI (media) | MLQA F1 (media) |
|---|---|---|---|---|---|
| mBERT | 12 | 768 | 85M | 66.3 | 57.7 |
| XLM-100 | 16 | 1280 | 315M | 70.7 | no disponible |
| XLM-15 | 12 | 1024 | 151M | no disponible | 61.6 |
| XLM-R Base | 12 | 768 | 85M | 74.5 | 62.9 (reportado) / 64.9 (fine-tuned propio) |
| **mMiniLM-L12xH384** | 12 | 384 | 21M | 71.1 | 63.2 |

Detalle por idioma en XNLI (mMiniLM-L12xH384): en 81.5, fr 74.8, es 75.7, de 72.9, el 73.0, bg 74.5, ru 71.3, tr 69.7, ar 68.8, vi 72.1, th 67.8, zh 70.0, hi 66.2, sw 63.3, ur 64.2.

Detalle por idioma en MLQA (F1, mMiniLM-L12xH384): en 79.4, es 66.1, de 61.2, ar 54.9, hi 58.5, vi 63.1, zh 59.0.

## Requisitos de hardware

- **VRAM estimada**: ~0.47 GB en fp32 (117M parametros x 4 bytes), ~0.24 GB en fp16. Con overhead de activaciones, menos de 1 GB en la mayoria de escenarios de inferencia.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, T4, A10 e incluso GPUs integradas modernas.
- **Consumer GPU**: si, cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050 Ti o superiores. Tambien es completamente viable en CPU.
- **Opciones de despliegue**: PyTorch (`transformers`), TensorFlow, JAX/Flax, ONNX Runtime, `sentence-transformers` (para embeddings), TorchScript, y servidores de inferencia como Triton o FastAPI con batching. No aplica a motores de generacion como vLLM o llama.cpp, ya que no es un modelo autorregresivo.
- **Latencia y throughput**: no disponible de forma explicita en la informacion proporcionada. Al ser un transformer de 12 capas y 384 dimensiones ocultas, la latencia esperada es de pocos milisegundos por secuencia en GPU y decenas de milisegundos en CPU, muy inferior a XLM-R Base.

## Comparativa con modelos similares

| Modelo | Parametros transformer | Capas | Ocultas | XNLI (media) | MLQA F1 (media) | Licencia |
|---|---|---|---|---|---|---|
| mMiniLM-L12xH384 | 21M | 12 | 384 | 71.1 | 63.2 | MIT |
| mBERT | 85M | 12 | 768 | 66.3 | 57.7 | Apache 2.0 (repositorio BERT de Google) |
| XLM-R Base | 85M | 12 | 768 | 74.5 | 62.9-64.9 | MIT |
| XLM-15 | 151M | 12 | 1024 | no disponible | 61.6 | CC-BY-NC 4.0 (uso no comercial) |

MiniLM ofrece un rendimiento en XNLI superior a mBERT pese a tener cuatro veces menos parametros en el transformer, y en MLQA supera a XLM-R Base en la medicion reportada por el autor, aunque queda por debajo de XLM-R Base en XNLI. Su principal ventaja es el coste de inferencia: el modelo completo ocupa menos de 0.5 GB en fp32.

## Limitaciones y advertencias

- **No es un modelo generativo**: aunque la model card original menciona "Language Understanding and Generation", este checkpoint concreto es un encoder BERT y no puede generar texto de forma autorregresiva.
- **Compatibilidad de tokenizador**: `AutoTokenizer` no funciona correctamente con este checkpoint; es obligatorio usar `XLMRobertaTokenizer` combinado con `BertModel`, un detalle que puede provocar errores silenciosos si se ignora.
- **Riesgo de alucinacion**: bajo para tareas de clasificacion, pero presente en tareas extractivas (MLQA) en idiomas de bajos recursos como arabe (54.9 F1) o hindi (58.5 F1) frente al ingles (79.4).
- **Sesgos**: al entrenarse sobre CommonCrawl multilingue, hereda sesgos de genero, religion, nacionalidad y representacion desigual entre idiomas. No se documenta en la informacion disponible un analisis de sesgos especifico.
- **Idiomas**: el rendimiento esta desbalanceado; el rendimiento en swahili (63.3 en XNLI) o urdu (64.2) es notablemente inferior al del ingles (81.5).
- **Contexto limitado**: la arquitectura BERT no maneja secuencias largas de forma nativa (limite estandar de 512 tokens).
- **Licencia**: MIT permite uso comercial sin restricciones de atribucion mas alla del mantenimiento del aviso de copyright, pero se recomienda verificar la procedencia del checkpoint de terceros (`rolf-mozilla`) y contrastarlo con el original de Microsoft.
- **Repositorio de terceros**: este checkpoint es una copia alojada por `rolf-mozilla` con 0 descargas y 0 likes; para produccion se recomienda preferir el repositorio oficial `microsoft/Multilingual-MiniLM-L12-H384`.

## Enlaces

- Repositorio HuggingFace (este checkpoint): https://huggingface.co/rolf-mozilla/minilm-multilingual-l12-full
- Modelo original de Microsoft: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Paper MiniLM: https://arxiv.org/abs/2002.10957
- Paper XNLI: https://arxiv.org/abs/1809.05053
- Paper XLM-R: https://arxiv.org/abs/1911.02116
- Paper MLQA: https://arxiv.org/abs/1910.07475
- Repositorio oficial UniLM (codigo y fine-tuning): https://github.com/microsoft/unilm/blob/master/minilm/
- Script de fine-tuning en XNLI: https://github.com/microsoft/unilm/blob/master/minilm/examples/run_xnli.py
- Modelo MiniLMv2 multilingue (referencia relacionada): https://huggingface.co/MoritzLaurer/multilingual-MiniLMv2-L12-mnli-xnli
