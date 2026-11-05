# biniyam882/amharic-bpe-tokenizer

## Resumen

El Amharic BPE Tokenizer es un conjunto de tres tokenizers SentencePiece con codificación BPE (Byte Pair Encoding) entrenados específicamente para amhárico, la lengua oficial de Etiopía escrita en alfabeto ge'ez. Lo desarrolla el usuario biniyam882 (repositorio asociado en GitHub bajo el identificador biniyamsav) y se publica bajo licencia MIT. No es un modelo de lenguaje generativo, sino un componente de tokenización que se integra en la fase de preprocesado de pipelines de entrenamiento e inferencia de modelos de lenguaje.

El problema que aborda es la ineficiencia de los tokenizers multilingües genéricos sobre amhárico: el autor reporta mediciones sobre texto reservado en las que su vocabulario de 32.000 tokens consume 1,31 tokens por palabra, frente a 2,28 de XLM-R, 7,93 de GPT-4o y 10,38 de GPT-4. Esa diferencia se traduce directamente en menor longitud de secuencia efectiva, menor coste computacional por documento y mayor cobertura de contexto útil para una ventana dada.

El paquete ofrece tres tamanos de vocabulario (20.000, 32.000 y 50.000 tokens), lo que permite ajustar el compromiso entre compacidad del vocabulario y granularidad de la segmentación. Es relevante para cualquiera que entrene o adapte modelos para lenguas etíopes, donde los tokenizers estándar fragmentan gravemente el texto y degradan tanto la eficiencia como la calidad del modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece BPE (tokenizer, no modelo neuronal) |
| Parametros totales | no disponible (no aplica: no es un modelo de parametros) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica a un tokenizer) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | amharico (am) |
| Licencia | MIT |
| Formato de pesos | SentencePiece (`.model`); no se listan ficheros `.vocab` ni `.json` en la informacion disponible |

Tabla de vocabularios publicados (datos de la model card):

| Fichero | Vocabulario | Tokens por palabra | Caracteres por token |
|---|---|---|---|
| `am_bpe_20k.model` | 20.000 | 1,40 | 3,30 |
| `am_bpe_32k.model` (por defecto) | 32.000 | 1,31 | 3,52 |
| `am_bpe_50k.model` | 50.000 | 1,25 | 3,69 |

## Arquitectura y entrenamiento

Se trata de tokenizers SentencePiece con algoritmo BPE, no de un transformer ni de un modelo con pesos neuronales. El texto de entrenamiento se compone de Wikipedia en amhárico y un corpus web adicional, con un volumen conjunto de aproximadamente 40 millones de caracteres según la model card. El pipeline de entrenamiento, el código y los benchmarks están publicados en el repositorio de GitHub del autor.

La innovación técnica principal es el preprocesado de normalización aplicado antes del entrenamiento: se fusionan letras de sonido duplicado del alfabeto ge'ez y se separa la puntuación etíope mediante espacios. Esta normalización es deliberadamente con pérdida (lossy) y debe replicarse en inferencia; el autor advierte que el texto en bruto debe pasar por la función `normalize_text` del repositorio, o bien usarse la clase `AmharicTokenizer`, que lo aplica automáticamente. No se documentan en la información disponible detalles sobre el tamaño del vocabulario de caracteres base, la política de muestreo del corpus ni hiperparámetros concretos del entrenamiento BPE.

## Capacidades

- Segmentación de texto amhárico en subpalabras con BPE sobre SentencePiece.
- Tres tamanos de vocabulario intercambiables (20k, 32k, 50k) para distintos compromisos de eficiencia.
- Normalización integrada de variantes ortográficas del ge'ez (fusión de letras homófonas) y separación de puntuación etíope.
- Codificación y decodificación estándar de SentencePiece (`encode`, `decode`, `out_type=str` para ver los tokens).
- Integración directa con `sentencepiece` y descarga vía `huggingface_hub`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: no es un modelo generativo.
- Capacidad multilingüe limitada al amhárico; no se documenta cobertura de otras lenguas etíopes (tigriña, ge'ez litúrgico, oromo).

## Casos de uso

- Entrenamiento de modelos de lenguaje desde cero para amhárico: usar `am_bpe_32k.model` como tokenizer del corpus reduce la longitud de secuencia un 43 % frente a XLM-R (1,31 vs. 2,28 tokens por palabra), lo que permite procesar más documentos por paso y aprovechar mejor la ventana de contexto.
- Adaptación (continued pretraining) de modelos multilingües existentes: sustituir el tokenizer original por este exige reajustar los embeddings de entrada y salida, pero mejora la eficiencia sobre texto amhárico en dominios como noticias o enciclopedia.
- Fine-tuning supervisado con datos etíopes: al disminuir el número de tokens por ejemplo, se reduce el coste de GPU por época y se mitiga el truncamiento en tareas de clasificación o resumen con límites de longitud.
- Pipeline de búsqueda y recuperación (RAG) sobre corpus amháricos: la tokenización compacta abarata la indexación y el cálculo de similitudes sobre representaciones léxicas o dispersas.
- Preprocesado de datos para evaluación de modelos: permite medir de forma controlada la fertilidad de distintos tokenizers sobre el mismo texto reservado, como hace el propio autor con XLM-R, GPT-4o y GPT-4.
- Normalización y limpieza de corpus amháricos: la función `normalize_text` unifica variantes ortográficas y puede usarse como paso previo en tareas de deduplicación o alineamiento de corpus paralelos.
- Sistemas de traducción automática amhárico-castellano o amhárico-inglés: un tokenizer específico reduce la fragmentación del lado fuente y mejora la relación señal-ruido en secuencias largas.

## Benchmarks y rendimiento

La model card solo publica la comparación de fertilidad (tokens por palabra) sobre texto reservado, no benchmarks de tareas downstream:

| Tokenizer | Tokens por palabra |
|---|---|
| `am_bpe_50k` | 1,25 |
| `am_bpe_32k` | 1,31 |
| `am_bpe_20k` | 1,40 |
| XLM-R | 2,28 |
| GPT-4o | 7,93 |
| GPT-4 | 10,38 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K ni equivalentes en amhárico) en la información disponible. El repositorio de GitHub del autor se cita como fuente de un benchmark adicional, pero su contenido no se detalla en la información proporcionada.

## Requisitos de hardware

- Inferencia en CPU: el tokenizer SentencePiece es ligero; el repositorio ocupa 0,0 GB y los ficheros `.model` de 20k a 50k tokens se cargan en memoria principal sin problema.
- VRAM: no requiere GPU para tokenizar; 0 GB de VRAM en uso autónomo.
- GPU recomendadas: no aplica al tokenizer en sí; la GPU la determina el modelo de lenguaje que lo utilice.
- Cabe en cualquier GPU consumer y en entornos sin GPU (Raspberry Pi, contenedores sin acelerador).
- Opciones de despliegue: biblioteca `sentencepiece` (Python, C++), descarga vía `huggingface_hub`, integración en pipelines de Hugging Face `tokenizers`/`transformers` mediante adaptador, y uso dentro de scripts de preprocesado propios.
- Latencia y throughput: no disponibles en la información proporcionada; para un vocabulario de este tamano se espera un coste por token despreciable frente al del modelo neuronal, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Tokenizer | Tipo | Vocabulario | Idiomas | Licencia | Tokens/palabra (amhárico) |
|---|---|---|---|---|---|
| Amharic BPE Tokenizer (32k) | SentencePiece BPE | 32.000 | am | MIT | 1,31 |
| XLM-R (SentencePiece) | SentencePiece unigram/BPE multilingüe | 250.000 | 100 | MIT | 2,28 |
| GPT-4o (tokenizer propietario) | BPE propietario | no disponible | multilingüe | propietaria | 7,93 |
| GPT-4 (tokenizer propietario) | BPE propietario | no disponible | multilingüe | propietaria | 10,38 |

La comparación se limita a la fertilidad sobre amhárico; no hay datos públicos de calidad downstream para ninguno de los tokenizers en esta lengua dentro de la información disponible. Frente a XLM-R, el tokenizer específico ofrece un vocabulario ocho veces menor con casi la mitad de tokens por palabra, a costa de renunciar a cobertura multilingüe.

## Limitaciones y advertencias

- Entrenado solo con Wikipedia en amhárico y un corpus web adicional de unos 40 millones de caracteres; el rendimiento en otros dominios (legal, médico, conversacional, redes sociales) puede degradarse y no se cuantifica.
- La normalización es lossy por diseño: fusiona letras homófonas y altera la puntuación, de modo que la reconstrucción exacta del texto original no es posible tras el preprocesado.
- Es obligatorio aplicar `normalize_text` antes de codificar; usar el tokenizer con texto en bruto produce una segmentación subóptima y resultados inconsistentes con las métricas publicadas.
- Cobertura limitada al amhárico: no se documenta soporte para tigriña, ge'ez, oromo ni otras lenguas etíopes, pese a compartir alfabeto.
- No es un modelo de lenguaje: no genera texto, no razona y no puede usarse como sustituto de un LLM; su utilidad es exclusivamente como componente de preprocesado.
- Sin descargas ni likes en el momento de la consulta y con fecha de creación posterior a la actual, lo que indica un artefacto muy reciente y sin validación comunitaria independiente.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantías; conviene conservar el aviso de copyright.
- Riesgo de sesgo de corpus: al provenir de Wikipedia y web, el vocabulario puede infrarrepresentar registros orales, dialectos regionales y terminología técnica emergente.

## Enlaces

- HuggingFace: https://huggingface.co/biniyam882/amharic-bpe-tokenizer
- Repositorio GitHub (código, pipeline y benchmark): https://github.com/biniyamsav/amharic_tokenizer
