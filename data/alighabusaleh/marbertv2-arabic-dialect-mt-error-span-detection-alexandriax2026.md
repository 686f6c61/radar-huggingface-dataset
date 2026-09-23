# alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026

## Resumen

El modelo `marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026` es un clasificador de tokens (token classification) desarrollado por el autor `alighabusaleh` (TTLab) y afinado a partir del backbone `UBC-NLP/MARBERTv2`. Su tarea es detectar y clasificar tramos de error (span detection) a nivel de caracter en traducciones automaticas del ingles a dialectos arabes, asignando a cada span una categoria de error inspirada en el marco LQM/MQM. Es, por tanto, un modelo de estimacion de calidad de traduccion automatica (MT quality estimation) orientado a dialectos arabes, un nicho con muy pocos recursos publicos.

El modelo resuelve un problema concreto: dado un texto de salida de un sistema de traduccion automatica en arabe dialectal, identificar que fragmentos contienen errores y de que tipo son (morfosintaxis, semantica, sociolinguistica u otros). Se corresponde con la Subtask 3 de la competicion AlexandriaX-2026, donde el sistema quedo en tercera posicion con un Overall Score oficial de 40.91 puntos en el conjunto de test.

Tecnicamente es una arquitectura transformer encoder tipo BERT con cabeza lineal de clasificacion de tokens (`BertForTokenClassification`), con 162.254.597 parametros totales y una longitud maxima de entrada de 192 subtokens. Su relevancia actual radica en que aborda la evaluacion automatica de calidad en variantes dialectales del arabe (egipcio, mauritano, marroqui, palestino y emirati), un escenario donde los modelos estandar de arabe moderno estandar rinden peor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (`BertForTokenClassification`) sobre `UBC-NLP/MARBERTv2` |
| Parametros totales | 162.254.597 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 subtokens como maximo de secuencia de entrenamiento; las salidas mas largas se truncan |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | arabe (dialectos egipcio, mauritano, marroqui, palestino y emirati) e ingles (solo como idioma de origen, no como entrada del modelo) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Etiquetas de salida | `O`, `morphosyntax`, `semantics`, `sociolinguistics`, `other` |
| Tamano del repositorio | 0.6 GB |
| Modelo base | UBC-NLP/MARBERTv2 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `UBC-NLP/MARBERTv2`, un encoder tipo BERT preentrenado sobre grandes volumenes de texto arabe, y se afina de extremo a extremo anadiendo una cabeza lineal de clasificacion de tokens con dropout de 0.1. La entrada es unicamente la salida de traduccion al arabe dialectal; el texto fuente en ingles no se utiliza como entrada. Cada subtoken recibe una etiqueta entre `O` (sin error), `morphosyntax`, `semantics`, `sociolinguistics` y `other`. En decodificacion, un token se marca como error cuando `1 - P(O)` supera un umbral especifico por dialecto (τ_d); los tokens contiguos de la misma categoria se fusionan, se reasignan a offsets de caracter mediante el offset mapping del tokenizer, se recortan espacios y puntuacion, y se descartan los spans de menos de 2 caracteres.

El entrenamiento utilizo el conjunto completo de entrenamiento de AlexandriaX Subtask 3 (1.125 frases, con 138 frases de desarrollo), con perdida focal (γ = 2) y peso α = 0.3 para la clase `O`, optimizador AdamW con learning rate 2e-5, batch de 16, 12 epocas, grad-clip 1.0 y semilla 42. Las direcciones de dialecto cubiertas son `ENG_EGY`, `ENG_MAU`, `ENG_MOR`, `ENG_PAL` y `ENG_UAE`. El umbral por dialecto se ajusto sobre predicciones out-of-fold de 5 particiones, con una rejilla de 0.20 a 0.70 en pasos de 0.025: 0.225 (`ENG_EGY`), 0.4 (`ENG_MAU`), 0.4 (`ENG_MOR`), 0.25 (`ENG_PAL`) y 0.3 (`ENG_UAE`). Para una direccion no vista, el decodificador usa un valor de reserva τ = 0.4. Como decision de diseno, las tres categorias mas raras (ortografia, pragmatica y grafetica) se colapsaron durante el entrenamiento en `other`, y en decodificacion `other` se reasigna a `orthography_writing_conventions` mediante `label_map` en `span_decoding.json`.

## Capacidades

- Deteccion de spans de error a nivel de caracter en traducciones automaticas hacia arabe dialectal, con offsets de inicio y fin.
- Clasificacion de cada span en categorias de error estilo MQM/LQM: `morphosyntax`, `semantics`, `sociolinguistics` y `orthography_writing_conventions` (via el colapso de `other`).
- Estimacion de calidad de traduccion automatica (quality estimation) sin necesidad de referencia (reference-free), ya que solo consume la hipotesis traducida.
- Soporte multidioma limitado: cubre cinco direcciones de dialecto arabe (`ENG_EGY`, `ENG_MAU`, `ENG_MOR`, `ENG_PAL`, `ENG_UAE`), con umbrales calibrados por direccion.
- Uso por lotes: el repositorio incluye `inference.py`, que procesa archivos JSONL con campos `id, direction, source, model_prediction` y produce el formato Codabench `LQM_prediction_tagged_errors`.
- Acceso a probabilidades por token: el checkpoint se carga como `BertForTokenClassification` estandar, lo que permite obtener probabilidades brutas y aplicar umbrales propios.
- No dispone de tool calling, function calling, modo de razonamiento explicito, capacidades de agente, vision ni audio: es un clasificador de tokens puro.

## Casos de uso

- Evaluacion automatica de sistemas de traduccion en dialectos arabes: el modelo permite medir la calidad de salidas de un motor de traduccion ingles→arabe dialectal sin referencias humanas, etiquetando los tramos problematicos y su tipologia, lo que resulta util para comparar versiones de un motor.
- Control de calidad en pipelines de localizacion: integrado tras un motor de traduccion, puede marcar automaticamente las frases con errores sociolinguisticos o morfosintacticos para revision humana, reduciendo el volumen de texto que un revisor debe inspeccionar.
- Analisis de errores por dialecto: al disponer de umbrales por direccion (`ENG_EGY`, `ENG_MAU`, `ENG_MOR`, `ENG_PAL`, `ENG_UAE`), permite estudiar que tipo de errores comete un sistema en cada variante dialectal y priorizar mejoras.
- Investigacion en quality estimation y metricas MQM: sirve como baseline reproducible, con el script de inferencia incluido, para trabajos academicos que necesiten un etiquetador de spans de error en arabe dialectal.
- Generacion de datos de entrenamiento para correctores o rerankers: los spans etiquetados pueden usarse para construir conjuntos de datos supervisados destinados a modelos de reescritura o de seleccion de hipotesis.
- Monitorizacion continua de un servicio de traduccion: desplegado sobre un subconjunto de trafico, permite detectar degradaciones de calidad por direccion dialectal y disparar alertas cuando el volumen de spans marcados aumenta.
- Filtrado previo a publicacion de contenido multilingue: aplicado a textos traducidos antes de su publicacion, ayuda a retener automaticamente los fragmentos con mayor probabilidad de error para una ultima pasada editorial.

## Benchmarks y rendimiento

| Split | Overall | Notas |
|---|---|---|
| Test oficial (Codabench) | 40.91 | Metrica oficial; posicion 3 en AlexandriaX-2026 Subtask 3 |
| Desarrollo (138 frases, scorer propio) | 37.5 | Overlap F1 44.3, category micro-F1 30.8 |
| Desarrollo en el articulo | 40.8 | Procede de la ejecucion de seleccion de modelo en el cuaderno de desarrollo |

La metrica oficial Overall se define como (overlap-span F1 + category F1) / 2, en porcentaje, con medias macro sobre direcciones. El valor de desarrollo propio usa character-overlap F1 + category micro-F1 y no es directamente comparable. El checkpoint publicado reproduce exactamente las predicciones enviadas sobre el conjunto de test liberado (145/145 frases).

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible, ya que la tarea es de etiquetado de spans y no de generacion.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 1,3 GB solo para pesos (162 M de parametros), mas activaciones y overhead del runtime; en fp16/bf16 se reduce aproximadamente a 0,65 GB.
- Cabe con holgura en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutar inferencia por lotes sin problema.
- Ejecucion en CPU viable para volumentes moderados, dado el tamano reducido del modelo (repositorio de 0.6 GB).
- Opciones de despliegue: `transformers` (carga directa como `AutoModelForTokenClassification`), `inference.py` incluido en el repositorio para procesamiento por lotes, y servidores compatibles con `endpoints_compatible`. Tambien es desplegable con vLLM o TGI en modo clasificacion, aunque el caso de uso natural es inferencia por lotes o un microservicio ligero.
- Latencia y throughput: no disponibles en la informacion proporcionada. La longitud maxima de 192 subtokens acota el coste por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026` | 162.254.597 | 192 subtokens | cc-by-4.0 | HuggingFace | Variante con colapso de categorias; Overall oficial 40.91 |
| `alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026-nocollapse` | no disponible | no disponible | no disponible | HuggingFace | Variante sin colapso de categorias, con mejor puntuacion post-hoc segun el autor |
| `UBC-NLP/MARBERTv2` | no disponible | no disponible | no disponible | HuggingFace | Modelo base preentrenado; no es un etiquetador de spans de error por si mismo |

No se dispone de datos de otros sistemas comparables de la misma competicion en la informacion proporcionada.

## Limitaciones y advertencias

- Datos de entrenamiento muy reducidos y desbalanceados: aproximadamente el 80% de los tokens no llevan error, la categoria `sociolinguistics` concentra el 58% de los spans y `graphetics` solo cuenta con 2 ejemplos de entrenamiento.
- Las categorias `pragmatics` y `graphetics` nunca se predicen, porque se colapsaron en `other` durante el entrenamiento y en decodificacion se reasignan a `orthography_writing_conventions`.
- Truncamiento: las salidas de traduccion de mas de 192 subtokens se recortan, por lo que los errores situados mas alla de ese limite no se detectaran.
- El modelo solo consume la hipotesis traducida; no utiliza el texto fuente en ingles, de modo que los errores que solo son detectables comparando con la fuente pueden pasar desapercibidos.
- Los umbrales de decodificacion estan calibrados para cinco direcciones dialectales concretas; para una direccion no vista se aplica un valor de reserva (τ = 0.4) que puede no ser optimo.
- Riesgo de alucinacion en el sentido de falsos positivos: al tratarse de una tarea de etiquetado, el modelo puede marcar spans inexistentes o asignar categorias incorrectas, especialmente en categorias poco representadas.
- Sesgos potenciales derivados del corpus AlexandriaX Subtask 3, que no necesariamente representa todos los registros ni variedades del arabe dialectal.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero conviene revisar las condiciones de los datos de origen (`UBC-NLP/AlexandriaX_Subtask_3`) y del modelo base antes de un despliegue en produccion.
- El valor de Overall (40.91) es bajo en terminos absolutos, lo que refleja la dificultad de la tarea; no se recomienda su uso como unico criterio de calidad sin supervision humana.
- Los numeros de desarrollo publicados en el articulo (40.8) y los del scorer propio (37.5) no son directamente comparables con la metrica oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026
- Variante sin colapso de categorias: https://huggingface.co/alighabusaleh/marbertv2-arabic-dialect-mt-error-span-detection-alexandriax2026-nocollapse
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Codigo: https://github.com/aliabusaleh/arabic-dialectal-mt-error-span-detection
- Dataset: https://huggingface.co/datasets/UBC-NLP/AlexandriaX_Subtask_3
- Competicion AlexandriaX-2026: https://alexandriax.dlnlp.ai/
- Articulo: Abusaleh, Verma & Mehler, "TTLab at AlexandriaX-2026: A Fine-Tuned Surface Tagger for Arabic Machine-Translation Error-Span Detection and Classification", ArabicNLP 2026 (enlace directo no disponible)
