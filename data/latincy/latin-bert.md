# latincy/latin-bert

## Resumen

Latin BERT es un modelo de lenguaje contextual especializado en latin clasico, desarrollado originalmente por David Bamman y Patrick J. Burns (2020) y reempaquetado para Hugging Face por el proyecto latincy. Se trata de un BERT-base de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con aproximadamente 111 millones de parametros, entrenado sobre un corpus de textos latinos. Su proposito es proporcionar representaciones contextuales y capacidad de enmascarado (fill-mask) para tareas de filologia clasica, procesamiento de texto latino y humanidades digitales.

El modelo resuelve un problema concreto: los modelos multilingues genericos rinden por debajo en latin debido a la baja representacion de esta lengua en sus corpus y a la morfologia flexiva del latin. Latin BERT, al entrenarse exclusivamente sobre latin, captura mejor las dependencias sintacticas y la polisemia lexica del idioma. Es relevante para investigadores que necesitan etiquetado morfosintactico, desambiguacion de sentidos o busqueda de similitud contextual en corpus clasicos.

La version empaquetada por latincy (v1.2.1) incluye un tokenizer JSON nativo que replica el `SubwordTextEncoder` original de tensor2tensor sin necesidad de `trust_remote_code`, lo que facilita su integracion en pipelines modernos de `transformers`, spaCy, ONNX y Text Embeddings Inference. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder, 12 capas, 768 ocultas, 12 cabezas) |
| Parametros totales | 111.935.110 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX oficiales) |
| Idiomas soportados | latin (la) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

Latin BERT sigue la arquitectura BERT-base estandar: un transformer encoder con 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y una longitud maxima de secuencia de 512 tokens. El vocabulario consta de 32.900 subtokens generados con un `SubwordTextEncoder` de tensor2tensor, en lugar del WordPiece habitual de BERT. El modelo se entreno con el objetivo de masked language modeling (MLM) sobre un corpus de textos latinos; la model card remite al paper original para el detalle de la composicion y el volumen del dataset de entrenamiento.

La innovacion tecnica destacable del reempaquetado es la conversion del tokenizer original a un `tokenizer.json` puro de la libreria `tokenizers`, que replica exactamente los IDs del encoder de tensor2tensor sin requerir codigo remoto. Se documentan dos divergencias menores no alcanzables con texto real: los caracteres fuera del alfabeto de 2.187 simbolos se mapean a `[UNK]` en lugar de a escapes ordinales, y el caracter de control U+0001 se elimina de la entrada. No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de representaciones contextuales (embeddings) de 768 dimensiones por token, aptas para feature extraction.
- Rellenado de mascaras (fill-mask) para prediccion de palabras enmascaradas en contexto.
- Etiquetado morfosintactico (POS tagging) mediante fine-tuning, con resultados reproducidos en los treebanks Perseus, PROIEL e ITTB.
- Desambiguacion de sentidos (word sense disambiguation) mediante representaciones contextuales.
- Busqueda de vecinos mas cercanos contextuales (contextual nearest neighbors) para explorar usos de una palabra en distintos pasajes.
- Integracion con spaCy mediante `spacy-transformers`.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito; es un encoder MLM, no un modelo generativo instruido.
- Capacidad multilingue limitada al latin; el alfabeto cubre caracteres latinos, griegos y cirilicos, pero el entrenamiento es monolingue.

## Casos de uso

- Etiquetado morfosintactico de corpus clasicos: fine-tuning sobre treebanks como Perseus, PROIEL o ITTB para anotar automaticamente textos latinos con categorias gramaticales; el modelo alcanza el 95,2-99,2 % de exactitud segun el treebank, lo que lo hace adecuado para proyectos de anotacion a gran escala.
- Desambiguacion de sentidos en lexicografia: usar los embeddings contextuales para distinguir acepciones de una misma palabra en pasajes distintos, con una exactitud documentada de 0,764 en la tarea del paper.
- Busqueda de similitud contextual en corpus: indexar representaciones de tokens y recuperar instancias del mismo sentido de una palabra (por ejemplo, *in* en Cesar o *audentes* en Virgilio) mediante similitud coseno, con valores de hasta 0,919 en los ejemplos reproducidos.
- Prediccion de palabras perdidas en textos con lagunas: aplicar fill-mask para reconstruir fragmentos danados o ilegibles en ediciones criticas, con P@1 del 33,1 %, P@10 del 62,2 % y P@50 del 74,0 %.
- Preprocesamiento para pipelines de humanidades digitales: generar embeddings de pasajes latinos como entrada para clasificadores de genero, autor o periodo, o para sistemas de recuperacion de informacion en bibliotecas digitales clasicas.
- Integracion en spaCy para anotacion de pipelines NLP: configurar `spacy-transformers.TransformerModel.v3` con `latincy/latin-bert` para obtener un pipeline de NLP latino con tokenizacion, POS y dependencias.
- Analisis de variacion lexica y morfologica: comparar variantes como *audentis*, *audaces* y *audentem* mediante vecinos contextuales para estudiar flexión y variacion ortografica en corpus.

## Benchmarks y rendimiento

Resultados reproducidos por el reempaquetado mediante el pipeline nativo de Hugging Face, que coinciden con Bamman & Burns (2020):

| Tarea | Metrica | Resultado |
|---|---|---|
| POS tagging (Perseus) | Exactitud | 95,2 % |
| POS tagging (PROIEL) | Exactitud | 98,2 % |
| POS tagging (ITTB) | Exactitud | 99,2 % |
| Prediccion de palabra enmascarada | P@1 | 33,1 % |
| Prediccion de palabra enmascarada | P@10 | 62,2 % |
| Prediccion de palabra enmascarada | P@50 | 74,0 % |
| Desambiguacion de sentidos | Exactitud | 0,764 |
| Vecinos contextuales (*in*, Caes. *BG* 1.1) | Similitud coseno | 0,835 |
| Vecinos contextuales (*audentes*, Verg. *Aen.* 10.284) | Similitud coseno | 0,919 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un encoder MLM monolingue de latin.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32 (111 M de parametros x 4 bytes), alrededor de 0,22 GB en fp16 y del orden de 0,11-0,15 GB en cuantizacion de 8 o 4 bits, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090, RTX 2080 o T4 funcionan sin problema. Tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 3050 o incluso iGPU con suficiente memoria compartida; el cuello de botella es la longitud de secuencia (512 tokens), no el tamano del modelo.
- Opciones de despliegue: `transformers` (PyTorch), `spacy-transformers`, Text Embeddings Inference (TEI) gracias al `tokenizer.json` nativo, y runtimes que consuman `tokenizer.json` (Rust, JavaScript, ONNX). No se documentan pesos GGUF ni soporte oficial en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| Latin BERT (latincy/latin-bert) | 111 M | 512 | Latin | MIT | BERT-base MLM especializado en latin |
| PhilBERTa | no disponible en la informacion | no disponible | Latin | no disponible | RoBERTa especializado en latin |
| LaBerta | no disponible en la informacion | no disponible | Latin | no disponible | BERT especializado en latin |
| BERT multilingual (base) | 178 M | 512 | 104 idiomas | Apache 2.0 | Multilingue generico, cobertura limitada de latin |

No se dispone en la informacion proporcionada de datos de rendimiento de PhilBERTa o LaBerta que permitan una comparacion cuantitativa directa; la comparativa se limita a parametros, contexto, licencia y enfoque.

## Limitaciones y advertencias

- Modelo monolingue de latin: no debe esperarse un rendimiento util en otras lenguas, ni siquiera en lenguas romances derivadas.
- Es un encoder MLM, no un modelo generativo instruido: no soporta instrucciones, tool calling ni razonamiento multi-paso; usarlo para generacion abierta produce resultados pobres.
- Ventana de contexto limitada a 512 tokens, insuficiente para pasajes largos sin segmentacion previa.
- Riesgo de alucinacion en la tarea fill-mask: las predicciones son distribuciones sobre el vocabulario y pueden producir formas morfologicamente plausibles pero historicamente incorrectas; requiere validacion filologica.
- Sesgos derivados del corpus de entrenamiento: la composicion del dataset (autores, generos, periodos) puede infrarepresentar latin tardio, medieval o tecnico; no se documenta un analisis de sesgos en la informacion disponible.
- Tokenizer con divergencias documentadas respecto al original en caracteres fuera del alfabeto de 2.187 simbolos (mapeo a `[UNK]`) y en el caracter U+0001 (eliminado); no afecta a texto real segun el autor, pero conviene verificarlo en pipelines con Unicode exotico.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, el modelo se distribuye como reempaquetado experimental y el autor recomienda abrir un hilo en la pestana de discusiones ante cualquier problema.
- El repo tiene un tamano de 0,9 GB y solo 803 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/latincy/latin-bert
- Paper original: https://arxiv.org/abs/2009.10053
- Repositorio original y codigo de entrenamiento: https://github.com/dbamman/latin-bert
- Discusiones del repo (incidencias del reempaquetado): https://huggingface.co/latincy/latin-bert/discussions
- Hilo sobre tokenizers 0.23: https://huggingface.co/latincy/latin-bert/discussions/4
- spaCy transformers: https://github.com/explosion/spacy-transformers
