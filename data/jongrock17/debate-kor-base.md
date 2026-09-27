# jongrock17/DEBATE-kor-base

## Resumen

DEBATE-kor-base es un modelo de clasificacion de secuencias basado en un encoder DeBERTa-v2, desarrollado por jongrock17 (Jong Rock Jeong), que adapta el checkpoint Political DEBATE DeBERTa-base al coreano para inferencia de lenguaje natural (NLI) binaria sobre texto politico. El modelo se inicializa desde mlburnham/Political_DEBATE_DeBERTa_base_v1.1, el checkpoint original de Political DEBATE, y se ajusta despues sobre jongrock17/PolNLI-kor, una traduccion y adaptacion al coreano del corpus PolNLI. La cadena de adaptacion documentada es Political DEBATE DeBERTa-base → PolNLI-kor → DEBATE-kor-base.

El modelo tiene 184.423.682 parametros (aproximadamente 0,2 B) y resuelve una clasificacion binaria con dos etiquetas: `entailment` (1) y `not_entailment` (0), donde la segunda agrupa todos los casos de no implicacion (neutralidad y contradiccion). No es un modelo generativo: su salida es una distribucion de probabilidad sobre dos clases.

Su relevancia radica en que compara empiricamente dos estrategias de adaptacion cross-lingue. Frente a la familia PolNLI-kor-RoBERTa, que parte de encoders preentrenados en coreano (KLUE-RoBERTa), DEBATE-kor transfiere directamente un modelo especializado en NLI politico en ingles y lo lleva al coreano. En el conjunto de test completo de PolNLI-kor (15.366 pares premisa-hipotesis) alcanza 0,9000 de weighted F1, ligeramente por debajo del RoBERTa-base coreano (0,9109), pero por encima de RoBERTa-large (0,8946) y del propio DEBATE-kor-large (0,8750).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder con disentangled attention) |
| Parametros totales | 184.423.682 (aprox. 0,2 B) |
| Longitud de contexto | 256 tokens (longitud maxima usada en la evaluacion documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tipo de tensor F32 segun los metadatos del repositorio) |
| Tarea | Clasificacion de texto / NLI binaria |
| Etiquetas | 0 = `not_entailment`, 1 = `entailment` |
| Tamano del repositorio | 4,4 GB |
| Modelo base | mlburnham/Political_DEBATE_DeBERTa_base_v1.1 |
| Dataset de ajuste | jongrock17/PolNLI-kor |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un encoder DeBERTa-v2, que emplea atencion desacoplada (disentangled attention), donde las representaciones de contenido y posicion se calculan por separado, y un decodificador de mascara mejorado. Sobre esta base, el modelo anade una cabeza de clasificacion de secuencias con dos salidas. El ajuste parte del checkpoint `mlburnham/Political_DEBATE_DeBERTa_base_v1.1`, ya especializado en NLI politico en ingles, y se continua entrenando con la tarea de NLI binaria sobre el dataset `PolNLI-kor`.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion detallada del dataset de ajuste, ni hiperparametros como el learning rate, el numero de epocas o el optimizador. Tampoco consta que se haya aplicado RLHF, DPO ni ninguna fase de alineacion por preferencias; es un ajuste supervisado estandar de clasificacion. La innovacion tecnica del trabajo no esta en la arquitectura, sino en el planteamiento comparativo: medir si conviene partir de un encoder preentrenado en el idioma destino o de un modelo especializado en el dominio pero en otro idioma. La longitud maxima de secuencia empleada en la evaluacion es de 256 tokens.

## Capacidades

- Clasificacion binaria de NLI sobre texto politico en coreano: dada una premisa y una hipotesis, devuelve probabilidad de `entailment` frente a `not_entailment`.
- Extraccion de eventos: 0,9116 de weighted F1 en el subconjunto correspondiente del test (2.864 ejemplos).
- Deteccion de discurso de odio y toxicidad: 0,9173 de weighted F1 (3.002 ejemplos).
- Deteccion de posicionamiento (stance detection): 0,9012 de weighted F1 (4.993 ejemplos).
- Clasificacion tematica: 0,8802 de weighted F1 (4.507 ejemplos).
- Salida de probabilidad calibrada: el modelo reporta Brier Score de 0,0908 y ECE de 0,0857, lo que permite usar el score como senal de confianza.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente: es un clasificador, no un modelo generativo.
- No es multilingue: funciona solo con coreano y no se documenta transferencia a otros idiomas.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Verificacion de afirmaciones politicas (fact-checking): dado un fragmento de un discurso o documento oficial como premisa y una afirmacion como hipotesis, el modelo estima si la afirmacion se sigue del texto original, lo que permite automatizar un primer filtro de comprobacion a escala.
- Deteccion de discurso de odio y toxicidad en foros politicos: el subconjunto de hate speech & toxicity del test da 0,9173 de weighted F1, por lo que el modelo puede usarse como clasificador de moderacion sobre comentarios y publicaciones en coreano.
- Analisis de posicionamiento politico (stance detection): clasificar si un texto apoya o no una proposicion concreta, util para medir orientaciones en medios, redes sociales o declaraciones parlamentarias.
- Extraccion de eventos de noticias politicas: identificar relaciones de implicacion entre titular y cuerpo de la noticia para alimentar bases de datos de eventos, con 0,9116 de weighted F1 en ese subconjunto.
- Clasificacion tematica de corpus legislativos: etiquetar proyectos de ley, actas o prensa por area tematica, sabiendo que es la tarea donde el modelo rinde peor (0,8802), por lo que conviene validarla antes de usarla en produccion.
- Anotacion asistida en investigacion en ciencias politicas: preetiquetar grandes volumenes de texto para que un anotador humano revise solo los casos de baja confianza, aprovechando el ECE de 0,0857 para priorizar la revision.
- Filtrado de datasets y control de calidad: usar la relacion de implicacion entre pares de textos para detectar duplicados, parafrasis o contradicciones internas en corpus en coreano.
- Analisis de coherencia de resumenes o respuestas largas: comprobar si cada frase de un resumen se sigue del documento fuente, aplicable a sistemas de resumen en coreano.
- Construccion de clasificadores de segundo nivel: como extractor de caracteristicas congelado o ajustado, alimentando un modelo posterior en un pipeline de analisis politico.

## Benchmarks y rendimiento

Resultados publicados sobre el conjunto de test completo de PolNLI-kor (15.366 pares premisa-hipotesis):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9009 |
| Balanced Accuracy | 0,8903 |
| Macro F1 | 0,8958 |
| Weighted F1 | 0,9000 |
| Weighted F1 IC 95 % | [0,8954, 0,9047] |
| MCC | 0,7946 |
| AUROC | 0,9620 |
| AUPRC | 0,9523 |
| Brier Score (menor es mejor) | 0,0908 |
| ECE (menor es mejor) | 0,0857 |
| N de test | 15.366 |

Comparativa publicada por el autor frente a modelos alternativos de la misma tarea:

| Modelo | Weighted F1 | IC 95 % |
|---|---|---|
| PolNLI-kor-RoBERTa-base | 0,9109 | [0,9062, 0,9155] |
| DEBATE-kor-base | 0,9000 | [0,8954, 0,9047] |
| PolNLI-kor-RoBERTa-large | 0,8946 | [0,8897, 0,8996] |
| DEBATE-kor-large | 0,8750 | [0,8697, 0,8803] |

Rendimiento desglosado por tarea:

| Tarea | N | Weighted F1 | Macro F1 | MCC |
|---|---:|---:|---:|---:|
| Event extraction | 2.864 | 0,9116 | 0,9111 | 0,8315 |
| Hate speech & toxicity | 3.002 | 0,9173 | 0,8786 | 0,7596 |
| Stance detection | 4.993 | 0,9012 | 0,8979 | 0,7962 |
| Topic classification | 4.507 | 0,8802 | 0,8770 | 0,7596 |

Comparacion pareada con PolNLI-kor-RoBERTa-base sobre los mismos 15.366 ejemplos (test de McNemar con correccion de continuidad):

| Desenlace pareado | Recuento |
|---|---:|
| RoBERTa-base correcto / DEBATE-kor-base incorrecto | 982 |
| DEBATE-kor-base correcto / RoBERTa-base incorrecto | 819 |

| Estadistico | Valor |
|---|---|
| McNemar chi-cuadrado | 14,57 |
| p-valor | 1,35 × 10⁻⁴ |

La diferencia pareada es estadisticamente significativa, pero la diferencia absoluta en weighted F1 es de aproximadamente 1,1 puntos porcentuales.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (184,4 M), no datos publicados por el autor:

- Pesos en F32: aproximadamente 738 MB.
- Pesos en FP16/BF16: aproximadamente 369 MB.
- Pesos en INT8: aproximadamente 184 MB.
- Pesos en 4 bits: aproximadamente 92 MB.
- VRAM estimada para inferencia: entre 1 y 2 GB con FP16 en lotes pequenos, incluyendo activaciones y overhead del runtime.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4070, RTX 4080, RTX 4090, asi como en GPUs de centro de datos como T4, L4, A10, A100 o H100.
- Tambien es viable en CPU para inferencia de baja concurrencia, dado el tamano reducido del modelo.
- Opciones de despliegue: transformers de forma nativa (`AutoModelForSequenceClassification`); el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, por lo que es desplegable en Hugging Face Inference Endpoints. Para alto rendimiento en CPU o GPU conviene exportar a ONNX Runtime o TorchScript. No es un caso de uso de vLLM, orientado a modelos generativos con cache KV.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo ni de latencia por lote. Al ser un encoder de 184 M parametros con secuencias de hasta 256 tokens, la latencia por lote deberia ser del orden de milisegundos en GPU moderna, pero no hay medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Weighted F1 (PolNLI-kor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DEBATE-kor-base | 184,4 M | 256 tokens en evaluacion | 0,9000 | no disponible | Hugging Face (jongrock17) |
| PolNLI-kor-RoBERTa-base | no disponible | no disponible | 0,9109 | no disponible | Hugging Face |
| PolNLI-kor-RoBERTa-large | no disponible | no disponible | 0,8946 | no disponible | Hugging Face |
| DEBATE-kor-large | no disponible (aprox. 0,4 B segun el listado de Hugging Face) | no disponible | 0,8750 | no disponible | Hugging Face |
| Political_DEBATE_DeBERTa_base_v1.1 | no disponible | no disponible | no evaluado en coreano | no disponible | Hugging Face (mlburnham) |

La diferencia clave entre las dos familias es el punto de partida: RoBERTa parte de un encoder preentrenado en coreano y se adapta al dominio politico, mientras que DEBATE-kor parte de un modelo especializado en NLI politico en ingles y se adapta al idioma. En este conjunto de datos, la primera estrategia rinde algo mejor en terminos absolutos.

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible. Antes de cualquier uso comercial hay que contactar con el autor, ya que no se conceden derechos explicitos.
- La tarea es NLI binaria: `not_entailment` agrupa neutralidad y contradiccion en una sola clase, por lo que el modelo no distingue entre "no se sigue" y "se contradice".
- Solo funciona en coreano. No hay evidencia de rendimiento en otros idiomas ni de transferencia cero.
- Esta ajustado sobre texto politico. Puede degradarse en dominios, generos o periodos temporales distintos de los del dataset PolNLI-kor, tal como advierte el propio autor.
- Riesgo de sesgo politico heredado tanto del checkpoint original Political DEBATE (entrenado con datos en ingles) como del corpus PolNLI-kor y de su proceso de traduccion.
- Puede producir falsos positivos o falsos negativos en casos limite; con MCC 0,7946 y ECE 0,0857 la calibracion es razonable, pero no perfecta. En produccion conviene aplicar umbrales y revision humana en casos de baja confianza.
- La tarea de clasificacion tematica es la que peor rinde (0,8802 de weighted F1); hay que validarla especificamente antes de usarla como clasificador tematico.
- La longitud de secuencia documentada en evaluacion es de 256 tokens; textos mas largos requieren truncado o segmentacion, con la consiguiente perdida de informacion.
- El repositorio ocupa 4,4 GB, muy por encima de lo esperable para 184 M parametros en F32 (unos 738 MB). Es probable que incluya registros de TensorBoard y checkpoints intermedios, algo a tener en cuenta al descargarlo.
- No se documentan los datos de entrenamiento ni los hiperparametros, lo que dificulta reproducir el ajuste o auditar su comportamiento.
- Los resultados de la comparacion pareada son estadisticamente significativos, pero la diferencia absoluta frente a RoBERTa-base es de solo 1,1 puntos porcentuales; no conviene sobreinterpretarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jongrock17/DEBATE-kor-base
- Modelo base: https://huggingface.co/mlburnham/Political_DEBATE_DeBERTa_base_v1.1
- Dataset de ajuste: https://huggingface.co/datasets/jongrock17/PolNLI-kor
- Coleccion DEBATE-kor: https://huggingface.co/collections/jongrock17/debate-kor
- Perfil del autor: https://huggingface.co/jongrock17/datasets
- Modelos con la etiqueta debate-kor: https://huggingface.co/models?other=debate-kor
- Modelo relacionado DEBATE-kor-large: https://huggingface.co/jongrock17/DEBATE-kor-large
