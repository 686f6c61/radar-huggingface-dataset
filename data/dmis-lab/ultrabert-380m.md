# dmis-lab/UltraBERT-380M

## Resumen

UltraBERT-380M es un codificador bidireccional (encoder) en ingles desarrollado por el laboratorio dmis-lab, disenado para cubrir simultaneamente dos familias de tareas que historicamente obligaban a elegir: clasificacion (GLUE, SQuAD, NER, Reward-Bench) y recuperacion de informacion (BEIR, MLDR, LongEmbed). El modelo forma parte de la familia UltraBERT, que incluye tambien UltraBERT-150M y UltraBERT-Embed-150M, y se distribuye bajo licencia Apache 2.0 con pesos en safetensors.

Tecnicamente es un transformer de 24 capas, tamano oculto 1.024 y 8 cabezas de atencion, con 429.966.336 parametros reales en el checkpoint (aunque el nombre comercial sea 380M). Su rasgo mas distintivo es el contexto nativo de 32.768 tokens (32K), muy por encima de los 512-8.192 tokens tipicos de BERT, RoBERTa o incluso ModernBERT. El modelo se entreno inicialmente a 2K tokens y se extendio despues a 32K, manteniendo un 99% de precision en la prueba passkey de LongEmbed a todas las longitudes hasta 32K.

Su relevancia actual radica en que es el primer encoder del segmento que iguala o supera a Ettin Encoder y ModernBERT en clasificacion y, a la vez, supera ampliamente a ambos en recuperacion (BEIR, MLDR, RARb Code y RARb Math), lo que permite usar un unico backbone para pipelines de busqueda y de clasificacion en lugar de mantener dos modelos separados. Esta pensado como modelo base para fine-tuning, no como modelo generativo ni conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (arquitectura "ultrabert" con codigo personalizado; 24 capas, hidden size 1.024, 8 cabezas de atencion) |
| Parametros totales | 429.966.336 (429,97 M) segun safetensors; el autor lo comercializa como 380M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (32K) nativo; entrenado a 2K y extendido a 32K |
| Tipos de cuantizacion | no disponible; el autor solo publica el checkpoint en safetensors (carga recomendada en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 1,7 GB) |

## Arquitectura y entrenamiento

UltraBERT-380M es un encoder bidireccional tipo transformer con atencion multi-cabeza estandar (8 cabezas sobre un hidden size de 1.024, es decir, dimension de cabeza 128) repartido en 24 capas. Soporta tres backends de atencion: FlashAttention 2 (recomendado para entradas largas), SDPA y eager. Requiere `transformers >= 5` (probado con 5.16.1) y `trust_remote_code=True`, ya que la implementacion no es la de un BERT estandar.

La innovacion central es el uso de cabezas LM desacopladas ("decoupled LM heads"): cada lote de preentrenamiento mezcla secuencias enmascaradas al 5% y al 50%, y cada ratio de enmascaramiento tiene su propia cabeza de modelado de lenguaje enmascarado. Segun el autor, los ratios bajos favorecen la clasificacion y los altos la recuperacion, de modo que separar las cabezas evita la interferencia que provocaria una cabeza compartida y permite a un mismo encoder aprender ambas familias de tareas. El modelo se obtuvo mediante poda de anchura ("width pruning") a partir de un teacher de 1.3B y destilacion con perdida KL aplicada unicamente a las secuencias enmascaradas al 5%, mientras que las secuencias al 50% usan la perdida MLM estandar. Se sigue un esquema de destilacion en cascada (Cascade Distillation): del 1.3B se poda a 380M, se destila, y despues se poda el 380M destilado a 150M y se vuelve a destilar, aprendiendo ambos estudiantes directamente del teacher de 1.3B.

Los datos de preentrenamiento declarados son una mezcla de corpus publicos: `mlfoundations/dclm-baseline-1.0`, `HuggingFaceFW/fineweb-edu`, `HuggingFaceTB/stack-edu`, `allenai/peS2o`, `LLM360/MegaMath`, `HuggingFaceTB/finemath`, `HuggingFaceTB/smollm-corpus`, `allenai/dolma`, `Open-Orca/FLAN` y `facebook/natural_reasoning`. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; al tratarse de un encoder bidireccional no generativo, no se aplican tecnicas de alineacion conversacional.

## Capacidades

- Relleno de mascara (masked language modeling): tarea principal del pipeline declarado (`fill-mask`), con token de mascara estandar.
- Clasificacion de secuencias: el checkpoint se carga con `AutoModelForSequenceClassification` para tareas como analisis de sentimiento, deteccion de toxicidad o clasificacion de topicos.
- Recuperacion densa de informacion: fine-tuning con mean pooling y perdida contrastiva para producir embeddings de frases y documentos; el autor publica ademas UltraBERT-Embed-150M especificamente orientado a embeddings.
- Reconocimiento de entidades nombradas (NER): evaluado en MultiCoNER v2 y Few-NERD.
- Comprension lectora extractiva: evaluado en SQuAD 2.0.
- Modelado de recompensas: evaluado en Reward-Bench, lo que indica utilidad como backbone para preferencia humana.
- Contexto largo real: 32K tokens con 99% de precision en la prueba passkey de LongEmbed en todas las longitudes hasta 32K.
- Capacidades multilingues: no disponibles; solo ingles.
- Tool calling / function calling: no disponible (no es un modelo generativo ni esta entrenado para ello).
- Soporte de agentes y multi-step reasoning: no disponible.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Busqueda semantica en documentacion tecnica: con 32K tokens de contexto se puede indexar un documento completo (un README extenso, un RFC o un manual de API) en un unico embedding sin chunking agresivo, reduciendo la perdida de contexto entre fragmentos y utilizando mean pooling con perdida contrastiva como recomienda el autor.
- Clasificacion de tickets de soporte de gran longitud: hilos completos de conversacion o correos con historiales citados caben en una sola pasada, lo que simplifica pipelines que con encoders de 512 tokens requerian truncado o sumarizacion previa.
- Reranking en pipelines RAG: al ser fuerte tanto en BEIR como en clasificacion, puede actuar como reranker sobre los candidatos de un retriever rapido, mejorando la precision final sin cambiar de arquitectura ni de tokenizer.
- Extraccion de entidades en contratos y documentos legales: el modelo esta evaluado en MultiCoNER v2 y Few-NERD y soporta secuencias de 32K, lo que permite procesar clausulas largas y detectar entidades con su contexto completo.
- Deteccion de toxicidad y moderacion de contenido en ingles: mediante fine-tuning de clasificacion con `AutoModelForSequenceClassification`, aprovechando GLUE y Reward-Bench como indicativos de calidad en tareas de juicio.
- Filtrado y deduplicacion en curacion de datasets: al rendir bien en RARb Code y RARb Math, puede usarse para puntuar similitud entre fragmentos de codigo o de contenido matematico dentro de pipelines de construccion de corpus.
- Modelado de recompensa para RLHF ligero: con 73,0 en Reward-Bench en la variante de 152M, la version de 380M es un candidato razonable como reward model de bajo coste o como inicializacion para un reward model mayor.
- Analisis de similitud semantica y clustering de corpus academicos: con contexto de 32K se pueden comparar resumenes o articulos completos en una sola representacion, util para deduplicacion de literatura cientifica.

## Benchmarks y rendimiento

La model card incluye dos tablas de evaluacion. La tabla de tamano base (hasta 200M) esta completa; la tabla de tamano medio (hasta 500M), que es la que corresponde a UltraBERT-380M, aparece truncada en la informacion disponible.

Tamano base (hasta 200M parametros), resultados por modelo:

| Modelo | Parametros | GLUE | SQuAD 2.0 | MultiCoNER v2 | Few-NERD | Reward-Bench | BEIR | RARb Code | RARb Math | MLDR | LongEmbed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT | 110M | 84,7 | 76,3 | 53,8 | 66,6 | 59,4 | 36,7 | 6,6 | 27,5 | 29,0 | 29,3 |
| RoBERTa | 125M | 86,4 | 83,7 | 56,5 | 67,1 | 63,2 | 39,6 | 11,7 | 33,4 | 28,7 | 33,8 |
| MosaicBERT | 137M | 85,4 | 79,4 | 57,8 | 65,7 | 62,5 | 41,4 | 12,7 | 30,9 | 29,6 | 40,5 |
| NomicBERT | 137M | 84,0 | 82,7 | 60,1 | 66,9 | 64,1 | 42,0 | 13,8 | 30,2 | 29,9 | 45,0 |
| GTE-en-MLM | 137M | 85,6 | 82,7 | 59,2 | 66,4 | 63,4 | 42,4 | 12,0 | 33,6 | 37,1 | 58,5 |
| ModernBERT | 149M | 88,4 | 86,7 | 57,4 | 66,7 | 68,0 | 42,6 | 29,6 | 46,1 | 37,7 | 63,2 |
| Ettin Encoder | 149M | 88,9 | 87,4 | 57,4 | 66,5 | 70,3 | 42,4 | 31,8 | 47,1 | 35,9 | 60,1 |
| UltraBERT (version 150M) | 152M | 89,5 | 89,2 | 57,9 | 67,4 | 73,0 | 45,2 | 39,1 | 55,4 | 43,5 | 72,0 |

Tamano medio (hasta 500M parametros), fila de referencia disponible:

| Modelo | Parametros | GLUE | SQuAD 2.0 | MultiCoNER v2 | Few-NERD | Reward-Bench | BEIR | RARb Code | RARb Math | MLDR | LongEmbed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT | 334M | 85,2 | 81,8 | 57,7 | 67,8 | 62,6 | 38,6 | no disponible | no disponible | no disponible | no disponible |
| UltraBERT-380M | 429,97M | no disponible (tabla truncada en la informacion proporcionada) | | | | | | | | | |

Dato adicional recogido del paper (arXiv:2610.15028): el articulo compara UltraBERT-380M con DeBERTaV3-large, que obtiene 78,1 y 25,8 frente a los 78,5 y 48,7 de UltraBERT-380M en dos metricas que el fragmento citado no identifica explicitamente. El paper senala ademas una brecha de 24,6 y 22,9 puntos a favor de clasificacion sobre recuperacion en los dos tamanos evaluados, es decir, la recuperacion sigue siendo la tarea mas dificil incluso para este modelo.

Metodologia de evaluacion declarada: cada modelo se ajusta por tarea con la misma busqueda en rejilla; en recuperacion se ajusta sobre un subconjunto de MS MARCO o MLDR, por lo que las cifras reflejan el potencial de recuperacion del encoder y no el de un modelo de embeddings dedicado entrenado con cientos de millones de pares.

## Requisitos de hardware

- VRAM en bfloat16/fp16: aproximadamente 0,9 GB solo para pesos (429,97 M x 2 bytes). Sumando activaciones, el modelo cabe comodamente en cualquier GPU con 4 GB o mas para secuencias cortas.
- VRAM en fp32: aproximadamente 1,72 GB para pesos; sigue siendo viable en GPUs de gama baja.
- VRAM con contexto de 32K: el consumo crece de forma marcada por las activaciones de atencion. Con FlashAttention 2 el incremento es lineal en lugar de cuadratico; con SDPA o eager y 32K tokens el uso de memoria puede multiplicarse varias veces, por lo que se recomienda FlashAttention 2 para entradas largas.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y fine-tuning con lotes grandes y 32K tokens. Para inferencia, cualquier GPU consumer moderna sirve: RTX 4090, RTX 4080, RTX 3090, RTX 3060 (12 GB) e incluso GPUs con 6-8 GB para secuencias moderadas.
- Cabe en GPU consumer: si, y con margen amplio. Es un modelo de ~0,43B parametros en el rango de los encoders ligeros; en cuantizacion de 8 bits ocuparia unos 0,43 GB y en 4 bits unos 0,21 GB, aunque el autor no publica checkpoints cuantizados oficiales.
- CPU: la inferencia en CPU es viable por el tamano del modelo, especialmente con secuencias cortas; el cuello de botella aparece con 32K tokens.
- Opciones de despliegue: la ruta soportada oficialmente es HuggingFace Transformers >= 5 con `trust_remote_code=True`. No hay informacion disponible sobre soporte en vLLM, TGI, llama.cpp u Ollama; al tratarse de un encoder con codigo personalizado y pipeline `fill-mask`, no es un candidato directo para servidores de generacion tipo vLLM u Ollama, y llama.cpp no dispone de soporte confirmado para esta arquitectura.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GLUE | BEIR | LongEmbed | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| UltraBERT-380M | 429,97 M | 32K | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace, requiere `transformers >= 5` y `trust_remote_code` |
| UltraBERT-150M | 152 M | 32K | 89,5 | 45,2 | 72,0 | Apache 2.0 | HuggingFace, misma familia |
| ModernBERT | 149 M | 8K | 88,4 | 42,6 | 63,2 | Apache 2.0 | HuggingFace, soporte nativo en Transformers |
| Ettin Encoder | 149 M | 8K | 88,9 | 42,4 | 60,1 | Apache 2.0 | HuggingFace |
| BERT-large | 334 M | 512 | 85,2 | 38,6 | no disponible | Apache 2.0 (checkpoint original de Google con licencia aparte) | HuggingFace, soporte nativo |
| DeBERTaV3-large | ~435 M (no confirmado en la informacion disponible) | 512 | no disponible en el fragmento citado | no disponible | no disponible | MIT | HuggingFace |

La comparacion directa mas util es contra ModernBERT y Ettin Encoder en el segmento de 150M: UltraBERT-150M lidera GLUE, BEIR y LongEmbed con un contexto cuatro veces mayor. Para el tamano de 380M no hay cifras publicadas en la informacion disponible, solo la referencia cualitativa del paper frente a DeBERTaV3-large.

## Limitaciones y advertencias

- Solo ingles. No hay soporte multilingue declarado, por lo que su uso en castellano u otros idiomas daria rendimientos degradados y no evaluados.
- No es un modelo generativo. Es un encoder bidireccional: no produce texto libre, no soporta chat, ni tool calling, ni razonamiento multi-paso, ni agentes.
- Requiere `trust_remote_code=True`. Cargar el modelo implica ejecutar codigo personalizado del repositorio del autor; conviene auditar el codigo antes de usarlo en entornos de produccion o con datos sensibles.
- Requiere `transformers >= 5`, una version mayor reciente. Esto puede romper entornos con dependencias fijadas a la serie 4.x y complicar la integracion en stacks existentes.
- Riesgo de alucinacion: aunque no genera texto, si puede producir predicciones de token incorrectas en `fill-mask`, embeddings poco discriminativos fuera de dominio y clasificaciones erroneas con alta confianza cuando se aplica fuera de la distribucion de entrenamiento.
- Sesgos: el preentrenamiento se apoya en corpus web a gran escala (dclm-baseline, fineweb-edu, dolma, smollm-corpus), con los sesgos de genero, raza, nacionalidad e ideologia habituales en este tipo de datos. El autor no documenta analisis de sesgo ni mitigaciones.
- Benchmarks incompletos para el tamano de 380M. La tabla de tamano medio de la model card aparece truncada en la informacion disponible y no se publican las cifras de GLUE, BEIR, MLDR ni LongEmbed de este checkpoint concreto; las cifras de la version de 150M no son extrapolables.
- Tasas de aprendizaje inusualmente bajas. El autor advierte que UltraBERT prefiere learning rates hasta 10 veces menores que otros encoders (5e-5 para el 150M y 3e-5 para el 380M, frente a los 3e-4 o 5e-4 tipicos). Reutilizar hiperparametros de BERT o ModernBERT dara resultados pobres.
- Memoria en contexto largo. Aunque el modelo soporte 32K tokens, procesar esa longitud sin FlashAttention 2 dispara el consumo de memoria; el soporte de 32K no equivale a coste constante.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion sin royalties, siempre que se conserve el aviso de licencia y se atribuya la autoria. No hay clausulas de uso aceptable adicionales documentadas.
- Modelo orientado a fine-tuning. Los resultados publicados corresponden a ajuste por tarea con busqueda en rejilla; usarlo en modo zero-shot para clasificacion o recuperacion dara rendimientos muy inferiores a los de las tablas.
- Recuperacion aun por debajo de la clasificacion. El propio paper reconoce brechas de 24,6 y 22,9 puntos entre ambas familias de tareas, por lo que no conviene asumir paridad de calidad en pipelines exclusivamente de retrieval.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dmis-lab/UltraBERT-380M
- Modelo hermano UltraBERT-150M: https://huggingface.co/dmis-lab/UltraBERT-150M
- Modelo de embeddings UltraBERT-Embed-150M: https://huggingface.co/dmis-lab/UltraBERT-Embed-150M
- Blog del autor "UltraBERT: One Encoder for Classification and Retrieval": https://huggingface.co/blog/dmis-lab/ultrabert
- Paper "UltraBERT: Beyond the Limit of BERT Pre-Training" (arXiv:2610.15028): https://arxiv.org/html/2610.15028v1
- Grafo de arquitectura en hfviewer: https://hfviewer.com/dmis-lab/UltraBERT-380M
- Ficha de terceros en Free2AITools: https://free2aitools.com/model/dmis-lab/ultrabert-380m
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Demo interactiva: no disponible en la informacion proporcionada
