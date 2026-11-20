# miscovery/arabic-egyptian-to-english-77m-ct2-int8

## Resumen

El modelo `miscovery/arabic-egyptian-to-english-77m-ct2-int8` es una exportación cuantizada a INT8 del modelo de traducción `miscovery/arabic-egyptian-to-english-77m`, un encoder-decoder Marian de 76.833.792 parámetros afinado a partir de `Helsinki-NLP/opus-mt-ar-en`. Traduce árabe estándar moderno (ar) y árabe egipcio (arz) a inglés, y se distribuye específicamente en formato CTranslate2 para inferencia eficiente en CPU. El repositorio ocupa 0,1 GB y el fichero de pesos cuantizado pesa 78,44 MB frente a los 305,52 MB del safetensors original.

El modelo resuelve un problema concreto: la traducción de dialecto egipcio, habitualmente infrarrepresentado en los corpus paralelos estándar, a inglés. El autor reporta mejoras sustanciales frente al modelo base en los conjuntos de evaluación de egipcio (chrF++ de 34,83 a 63,11; BLEU de 15,37 a 45,25) y de hechos (chrF++ de 50,88 a 65,57), manteniendo el rendimiento en árabe estándar. La cuantización INT8 apenas degrada la calidad (diferencias de entre -0,15 y +0,86 puntos de chrF++ según el conjunto) mientras reduce la latencia mediana en CPU de 193,15 ms a 48,84 ms.

Es relevante para desarrolladores que necesitan traducción árabe-inglés en entornos sin GPU, con requisitos de memoria contenidos y licencia Apache 2.0, que permite uso comercial. No es un modelo generativo de propósito general: es un traductor seq2seq puro que recibe texto plano y no requiere formato de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian encoder-decoder (transformer seq2seq) |
| Parametros totales | 76.833.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana formal; el ejemplo del autor limita la entrada a 256 tokens y recomienda dividir frases más largas |
| Tipos de cuantizacion | INT8 (`int8_float32` en CTranslate2); el repo original ofrece FP32 en safetensors |
| Idiomas soportados | ar (árabe estándar), arz (árabe egipcio), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (INT8); el modelo original en safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de la familia Marian, con 76.833.792 parámetros, afinado desde `Helsinki-NLP/opus-mt-ar-en`. La model card indica explícitamente que esta release es Marian y no SmolLM2, y que la entrada es texto árabe plano sin necesidad de prompt de chat. La exportación usa CTranslate2 con tipo de cómputo `int8_float32`, pensada para ejecución en CPU.

Los datos de entrenamiento citados en la model card son tres conjuntos: `Helsinki-NLP/opus-100`, `oddadmix/egyptian-translation-dataset-2.9-openai-batch` y `miscovery/arabic_egypt_english_world_facts`. No se detalla el número de tokens ni la composición exacta del dataset. El split de test contiene 2.966 pares repartidos entre los dominios OPUS, egipcio y facts. No se menciona RLHF ni DPO, lo cual es coherente con un modelo de traducción supervisada. La innovación destacable no está en la arquitectura sino en el pipeline de validación de la cuantización: el autor compara Transformers FP32, CTranslate2 FP32 e INT8 con decodificación greedy idéntica sobre los mismos ejemplos fijos, separando la conversión en tiempo de ejecución de la cuantización.

## Capacidades

- Traducción de árabe estándar moderno a inglés.
- Traducción de árabe egipcio (dialecto, arz) a inglés, con mejora notable frente al modelo base.
- Traducción de frases con contenido factual (dominio "facts").
- Procesamiento de texto plano sin formato de prompt ni plantilla de chat.
- Inferencia en CPU con CTranslate2, incluyendo `translate_batch` con beam search configurable.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a los tres idiomas declarados (ar, arz, en) en la dirección árabe→inglés.

## Casos de uso

- Traducción de contenido generado por usuarios en plataformas de países árabes: el modelo maneja tanto árabe estándar como egipcio coloquial, lo que permite normalizar comentarios, reseñas y mensajes a inglés sin un paso previo de detección de dialecto.
- Localización de documentación y soporte técnico: con 78,44 MB de pesos INT8 y unos 677 MiB de RSS en proceso, puede desplegarse en el mismo servidor de aplicaciones sin GPU dedicada para traducir artículos de ayuda o tickets.
- Subtitulado y transcripción: al procesar frases cortas (el autor recomienda dividir entradas de más de 256 tokens), encaja en pipelines que segmentan audio transcrito en oraciones antes de traducir.
- Análisis de opinión y moderación de contenido: traducción por lotes de mensajes egipcios a inglés para alimentar clasificadores entrenados solo en inglés, aprovechando el throughput de 19,43 frases por segundo en 2 hilos de CPU.
- Investigación en dialectología y NLP árabe: el modelo sirve como línea base reproducible para experimentos de traducción de dialecto, con métricas chrF++ y BLEU documentadas y conjuntos de evaluación publicados en el repositorio.
- Procesamiento por lotes en entornos con restricciones de memoria: la reducción de 305,52 MB a 78,44 MB permite ejecutar la traducción en contenedores pequeños o dispositivos de borde donde el modelo FP32 no cabría con holgura.
- Enriquecimiento de datasets: traducción de corpus egipcios a inglés para construir conjuntos paralelos o para aumentar datos de entrenamiento de otros sistemas.

## Benchmarks y rendimiento

Calidad de traducción (chrF++ y BLEU, referencia única):

| Conjunto de evaluacion | chrF++ antes | chrF++ despues | BLEU antes | BLEU despues |
|---|---|---|---|---|
| opus | 59,50 | 59,68 | 39,79 | 40,00 |
| egyptian | 34,83 | 63,11 | 15,37 | 45,25 |
| facts | 50,88 | 65,57 | 28,14 | 45,72 |
| everyday/ar | 73,50 | 76,39 | 56,01 | 58,86 |
| everyday/ar_eg | 41,85 | 67,03 | 20,83 | 46,59 |

Impacto de la cuantización (chrF++):

| Conjunto de evaluacion | Transformers FP32 | CTranslate2 FP32 | INT8 | INT8 menos original |
|---|---|---|---|---|
| test/domain/opus | 59,67 | 59,69 | 59,59 | -0,09 |
| test/domain/egyptian | 63,09 | 63,07 | 62,99 | -0,10 |
| test/domain/facts | 65,57 | 65,51 | 65,42 | -0,15 |
| everyday/language/ar | 77,15 | 77,15 | 78,01 | +0,86 |
| everyday/language/ar_eg | 67,03 | 67,67 | 67,40 | +0,37 |

Rendimiento en CPU (Kaggle Linux CPU, 2 hilos, batch size 1, 3 calentamientos, 40 ejemplos repetidos dos veces, tokenización y decodificación incluidas):

| Runtime | Latencia mediana (ms) | Frases/segundo | RSS estable (MiB) |
|---|---|---|---|
| transformers_fp32 | 193,15 | 4,91 | 1053,5 |
| ct2_fp32 | 123,54 | 7,63 | 911,9 |
| ct2_int8 | 48,84 | 19,43 | 676,9 |

El autor advierte que BLEU y chrF++ se comparan contra una única referencia y no son porcentajes de traducciones correctas. La revisión de preservación de significado cubre los 40 ejemplos cotidianos y es una revisión asistida, no una evaluación humana independiente.

## Requisitos de hardware

- VRAM para inferencia: no aplica en la configuración documentada; el modelo está pensado para CPU. En GPU, el peso INT8 de 78,44 MB es despreciable, pero no se publican cifras de VRAM ni de rendimiento en GPU.
- GPU recomendadas: no disponible; no se han publicado benchmarks en GPU ni en Mac GPU.
- ¿Cabe en GPU de consumo? Sí por tamaño de pesos (menos de 100 MB), pero no hay datos de rendimiento que lo confirmen.
- Memoria en CPU: RSS estable de 676,9 MiB con CTranslate2 INT8, incluyendo librerías importadas; 911,9 MiB con CTranslate2 FP32 y 1053,5 MiB con Transformers FP32.
- Opciones de despliegue: CTranslate2 4.9.0 (documentado), con Transformers 5.23.0, huggingface_hub 2.4.0, sentencepiece 0.2.2 y sacremoses 0.1.1. Para `AutoModelForSeq2SeqLM` debe usarse el repositorio original en safetensors.
- Latencia y throughput: 48,84 ms de mediana y 19,43 frases por segundo con `int8_float32`, 2 hilos y batch size 1 en CPU Linux; el autor indica que el rendimiento variará en otras CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| miscovery/arabic-egyptian-to-english-77m-ct2-int8 | 76.833.792 | no disponible (entrada limitada a 256 tokens en el ejemplo) | Apache 2.0 | CTranslate2 INT8 | Afinado para egipcio; chrF++ 63,11 en dominio egipcio |
| Helsinki-NLP/opus-mt-ar-en (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | safetensors (Transformers) | chrF++ 34,83 en egipcio y 59,50 en OPUS antes del afinado |
| miscovery/arabic-egyptian-to-english-77m (original) | 76.833.792 | no disponible | Apache 2.0 | safetensors | Mismo modelo en FP32, 305,52 MB; sirve para `AutoModelForSeq2SeqLM` |

No se dispone de datos de otros modelos comparables de traducción árabe-egipcio a inglés en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo; al entrenarse con OPUS y datasets generados, puede heredar sesgos de dominio y de registro de esas fuentes.
- Alucinación: es un modelo seq2seq de traducción, no generativo abierto, pero puede producir traducciones plausibles incorrectas en entradas ambiguas o fuera de dominio; las métricas se calculan contra una única referencia y no miden corrección absoluta.
- Longitud de entrada: el ejemplo del autor lanza un error si la entrada supera 256 tokens y recomienda dividir en frases más cortas; no hay una ventana de contexto formal declarada.
- Cobertura de idiomas: solo traduce árabe (estándar y egipcio) a inglés; no soporta la dirección inversa ni otros dialectos árabes de forma explícita.
- Evaluación limitada: los conjuntos "everyday" son 40 ejemplos escritos por el autor, retenidos del afinado pero no un benchmark independiente; la revisión de significado es asistida por un asistente, no humana.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las licencias de los datasets de entrenamiento citados.
- Producción: el rendimiento medido corresponde a una CPU Linux concreta con 2 hilos; no hay datos de GPU, Mac GPU ni de escalado con más hilos o batch mayor.
- Este repositorio es solo para CTranslate2; cargarlo con `AutoModelForSeq2SeqLM` requiere el repositorio original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miscovery/arabic-egyptian-to-english-77m-ct2-int8
- Modelo original en FP32: https://huggingface.co/miscovery/arabic-egyptian-to-english-77m
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-en
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Dataset egipcio: https://huggingface.co/datasets/oddadmix/egyptian-translation-dataset-2.9-openai-batch
- Dataset de hechos: https://huggingface.co/datasets/miscovery/arabic_egypt_english_world_facts
- Informe de cuantización: reports/quantization_summary.json (dentro del repositorio)
- Comparación de cuantización de 40 casos: reports/everyday_quantization_comparison.csv (dentro del repositorio)
- Revisión de preservación de significado: reports/meaning_review.json (dentro del repositorio)
