# Ahmed-Tarek0/ner-distilbert-conll2003

## Resumen
`ner-distilbert-conll2003` es un modelo de reconocimiento de entidades nombradas (NER) resultado del ajuste fino de `distilbert-base-cased` sobre el corpus CoNLL-2003. Lo desarrolla Ahmed-Tarek0 como parte de un proyecto comparativo entre arquitecturas secuenciales (LSTM, BiLSTM, BiLSTM+CRF) y un transformer destilado, evaluadas sobre los mismos datos y particiones. El modelo resuelve la tarea de etiquetado de tokens con cuatro tipos de entidad: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC), usando el esquema IOB2.

La arquitectura es un transformer encoder destilado de 6 capas y 65.197.833 parametros, con un repositorio de 0,3 GB en formato safetensors. Al estar basado en DistilBERT, ofrece una inferencia sensiblemente mas rapida y ligera que BERT-base manteniendo una calidad competitiva en tareas de clasificacion de tokens. Su relevancia practica radica en que permite desplegar extraccion de entidades en entornos con recursos limitados (CPU, GPUs de consumo) sin renunciar a un F1 micro de 0,892 en el split de test de CoNLL-2003.

El modelo esta pensado para texto corto en ingles de estilo periodistico y no cubre otros idiomas ni dominios especializados. Es una pieza util para pipelines de extraccion de informacion, preprocesamiento de documentos y enriquecimiento de datos, siempre que se respeten sus condiciones de uso (agregacion `first`, texto con capitalizacion y distribucion linguistica similar a la de entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder destilado (DistilBERT, 6 capas) |
| Parametros totales | 65.197.833 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via PyTorch/ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento
El modelo parte de `distilbert-base-cased`, un transformer encoder de 6 capas obtenido por destilacion de BERT-base. Sobre esa base se anade una cabeza de clasificacion de tokens (`token-classification`) y se ajusta de extremo a extremo para la tarea NER con etiquetas IOB2. El ajuste fino se realizo durante 3 epocas con una tasa de aprendizaje de 5e-5 y un tamano de lote de 32 sobre el dataset CoNLL-2003, un corpus de noticias en ingles anotado con las cuatro categorias PER, ORG, LOC y MISC.

Una decision tecnica destacable es la alineacion de etiquetas: solo se supervisa el primer sub-token de cada palabra, mientras que el resto se enmascara con `-100` en la funcion de perdida. Esto evita que la perdida se vea dominada por sub-tokens sin etiqueta, pero obliga a usar `aggregation_strategy="first"` en el pipeline de Hugging Face para reconstruir entidades correctamente. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el entrenamiento es un ajuste fino supervisado convencional.

## Capacidades
- Reconocimiento de entidades nombradas en ingles con cuatro tipos: PER (persona), ORG (organizacion), LOC (localizacion) y MISC (miscelanea).
- Etiquetado a nivel de token con esquema IOB2 y agregacion de sub-tokens mediante `aggregation_strategy="first"`.
- Integracion directa con el pipeline `token-classification` de Hugging Face Transformers.
- Extraccion de entidades en texto corto de estilo periodistico (noticias, comunicados, notas de prensa).
- Capacidad multilingue: no disponible (solo ingles).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Extraccion de entidades en articulos de noticias: el modelo identifica personas, organizaciones y localizaciones en textos periodisticos en ingles, lo que permite construir indices de entidades para motores de busqueda o sistemas de recomendacion de contenido.
- Enriquecimiento de bases de datos documentales: se puede ejecutar sobre lotes de documentos cortos para poblar campos estructurados (autor, organizacion mencionada, lugar) y alimentar un grafo de conocimiento.
- Preprocesamiento en pipelines de analisis de sentimiento o resumen: al aislar las entidades antes de tareas posteriores, se mejora la trazabilidad de las menciones y se facilita la desambiguacion manual.
- Moderacion y monitorizacion de contenidos: deteccion de menciones a personas u organizaciones en comentarios o tickets, util para clasificar y enrutar incidencias.
- Extraccion de informacion en entornos con recursos limitados: al tener 65 millones de parametros, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace adecuado para prototipos, demos y despliegues en el borde.
- Anotacion asistida (human-in-the-loop): el modelo propone etiquetas que un revisor humano valida, acelerando la creacion de corpus NER en dominios cercanos al periodistico.
- Baseline academico: sirve como referencia para comparar arquitecturas secuenciales (LSTM, BiLSTM, BiLSTM+CRF) frente a transformers destilados en la misma particion de CoNLL-2003.

## Benchmarks y rendimiento
Evaluacion micro-promediada en el split de test de CoNLL-2003, segun la model card:

| Metrica | Valor |
|---|---|
| F1 (micro) | 0,892 |

F1 por tipo de entidad:

| Entidad | F1 |
|---|---|
| PER | 0,953 |
| ORG | 0,863 |
| LOC | no disponible |
| MISC | 0,764 |

No se han publicado resultados de precision y recall desglosados, ni comparaciones numericas con otros modelos en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP32 (65 millones de parametros, ~260 MB de pesos); en FP16 aproximadamente 130 MB, y en cuantizacion INT8 alrededor de 65 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100, aunque el modelo no aprovecha la capacidad de estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), TorchScript/ONNX Runtime para optimizacion, y servidores de inferencia compatibles con modelos de Hugging Face (por ejemplo, Text Embeddings Inference no aplica; para NER se usa el pipeline estandar o un servidor FastAPI propio). vLLM, llama.cpp, Ollama y TGI no estan orientados a este tipo de modelo de clasificacion de tokens.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia de milisegundos por frase corta en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CoNLL-2003 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ner-distilbert-conll2003 (este) | 65,2 M | no disponible (hasta 512 en DistilBERT-base) | 0,892 (micro) | MIT | Hugging Face |
| `dslim/bert-base-NER` | ~110 M | 512 | no disponible en la informacion | MIT | Hugging Face |
| `dbmdz/bert-large-cased-finetuned-conll03-english` | ~335 M | 512 | no disponible en la informacion | MIT | Hugging Face |
| BiLSTM+CRF sobre CoNLL-2003 (referencia del proyecto) | no disponible | no aplica | no disponible | no disponible | codigo en repositorio del autor |

La comparativa se limita a caracteristicas estructurales; no se dispone de resultados numericos de los modelos alternativos en la informacion proporcionada, por lo que no se establece una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias
- Solo se superviso el primer sub-token de cada palabra; es obligatorio usar `aggregation_strategy="first"` en el pipeline, ya que `"simple"` fragmenta palabras multipalabra en entidades separadas.
- Entrenado principalmente con texto periodistico en ingles de distribucion occidental; nombres y organizaciones fuera de esa distribucion pueden clasificarse mal (por ejemplo, el club egipcio "Al Ahly" aparece ocasionalmente como PER en lugar de ORG).
- El rendimiento cae de forma acusada en texto sin mayusculas, ya que la capitalizacion es una senal fuerte para el modelo.
- No soporta otros idiomas distintos del ingles.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la deteccion de entidades, especialmente en las categorias ORG y MISC (F1 0,863 y 0,764 respectivamente).
- Sesgos derivados del corpus CoNLL-2003: sobrerrepresentacion de entidades occidentales y de determinados tipos de organizaciones.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda citar el trabajo original de CoNLL-2003 y verificar la procedencia de los datos de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente del rendimiento declarado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Ahmed-Tarek0/ner-distilbert-conll2003
- Dataset CoNLL-2003 en Hugging Face: https://huggingface.co/datasets/eriktks/conll2003
- Paper de CoNLL-2003: Tjong Kim Sang, E. F. y De Meulder, F. (2003), "Introduction to the CoNLL-2003 Shared Task: Language-Independent Named Entity Recognition", Proceedings of CoNLL-2003.
- Repositorio GitHub del proyecto comparativo (LSTM, BiLSTM, BiLSTM+CRF y transformer): enlace no disponible en la informacion proporcionada (la model card contiene un marcador de posicion sin URL).
- Demo desplegada: no disponible en la informacion proporcionada.
