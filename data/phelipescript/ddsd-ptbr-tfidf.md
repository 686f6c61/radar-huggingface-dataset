# phelipescript/ddsd-ptbr-tfidf

## Resumen

DDSD PT-BR TF-IDF es un par de clasificadores de texto para deteccion de habla dirigida al dispositivo (device-directed speech detection, DDSD) en portugues de Brasil. Dado el transcript de un enunciado, el modelo predice si la frase se dirigio al ordenador (DD) o no (NDD), un problema central en asistentes de voz para evitar falsas activaciones. Lo desarrolla el autor de Hugging Face `phelipescript` como parte de su trabajo de fin de carrera (TCC) y se publica como baseline frente a un clasificador neuronal basado en BERTimbau.

Tecnicamente no es una red neuronal: son dos pipelines de scikit-learn sobre TF-IDF de palabras (1 a 3-gramas, 50.000 terminos, tf sublinear, normalizacion L2), uno con regresion logistica y otro con SVM lineal calibrado. Su relevancia actual radica en que ofrece una alternativa extremadamente ligera y rapida para el modulo de decision de un asistente de voz, con metricas competitivas en el corpus de evaluacion y sin necesidad de GPU.

El modelo se distribuye como ficheros `joblib` (pickles) y esta pensado para integrarse en un sistema en tiempo real que encadena detector de voz, Whisper large-v3-turbo para transcripcion y este clasificador para la decision final. Su licencia MIT y su bajo coste computacional lo hacen atractivo como componente de produccion o como referencia de comparacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (1-3 gramas de palabras, 50.000 terminos) + regresion logistica o SVM lineal calibrado |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende del vocabulario de 50.000 terminos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF sobre el enunciado completo; sin ventana fija documentada) |
| Tipos de cuantizacion | no aplica (no es una red neuronal; los ficheros joblib no se cuantizan) |
| Idiomas soportados | portugues de Brasil (pt) |
| Licencia | MIT |
| Formato de pesos | joblib (pickle de scikit-learn) con diccionario `vectorizer`, `model`, `threshold` y `kind`; parametros adicionales en JSON |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clasico sobre representacion TF-IDF, no un transformer. El vectorizador construye 1 a 3-gramas de palabras con 50.000 terminos, frecuencia de termino sublinear y normalizacion L2. Sobre esa representacion se entrenan dos estimadores: una `LogisticRegression` con C=10 y un `CalibratedClassifierCV` que envuelve un SVM lineal con C=1. El hiperparametro C se selecciono mediante busqueda en rejilla con validacion cruzada de 5 particiones sobre el split de entrenamiento del corpus `phelipescript/ddsd-ptbr-corpus`, en su configuracion `com_correcao` (correccion de longitud).

El entrenamiento se realizo sobre un corpus 100% sintetico generado por LLMs, con frases etiquetadas como DD o NDD. Cada fichero incluye un umbral de decision ajustado en validacion (0,48 para regresion logistica y 0,46 para SVM), que debe aplicarse sobre la probabilidad de la clase DD. El preprocesado de texto es parte del contrato del modelo: normalizacion NFKD sin acentos, conversion a minusculas, sustitucion de puntuacion y simbolos por espacio y colapso de espacios. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Clasificacion binaria de texto: predice si un enunciado transcrito va dirigido al dispositivo (DD) o no (NDD).
- Salida de probabilidad calibrada para la clase DD, con umbral de decision almacenado en cada fichero.
- Dos variantes intercambiables: regresion logistica y SVM calibrado, con metricas muy similares.
- Normalizacion de texto especifica para portugues de Brasil (sin acentos, minusculas, puntuacion eliminada).
- Integracion sencilla en pipelines de Python via scikit-learn y `joblib`.
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso: es un clasificador de texto puro.
- Capacidad multilingue limitada al portugues de Brasil; no se documenta soporte de otros idiomas.

## Casos de uso

- Deteccion de falsas activaciones en asistentes de voz: el clasificador recibe el transcript de Whisper y decide si la frase se dirigio al asistente, reduciendo activaciones no deseadas con tasas de falsa activacion del 4-9% en los conjuntos evaluados.
- Filtro previo a un LLM en produccion: al ser un modelo lineal de coste minimo, puede descartar enunciados NDD antes de invocar un modelo generativo, ahorrando latencia y coste de inferencia.
- Sistema de voz en tiempo real en hardware modesto: al no requerir GPU, puede ejecutarse en CPU junto al detector de voz y el transcriber, como se describe en el sistema completo del TCC.
- Baseline de investigacion en DDSD para portugues: sirve como referencia de comparacion frente a modelos neuronales como BERTimbau, con metricas reproducibles sobre el corpus sintetico y sobre transcripciones reales.
- Moderacion o enrutado de comandos en aplicaciones de dictado: distinguir entre texto dictado para la aplicacion y conversacion ambiental captada por error por el microfono.
- Evaluacion de robustez de pipelines ASR: al combinarse con Whisper large-v3-turbo, permite medir el impacto de errores de transcripcion en la decision DD/NDD en distintos escenarios de ruido y distancia al microfono.
- Prototipado rapido de asistentes en portugues: su instalacion via scikit-learn y su licencia MIT permiten integrarlo en demos y pruebas de concepto sin infraestructura de GPU.

## Benchmarks y rendimiento

Test interno sobre 11.616 frases sinteticas del split `com_correcao` (mitad DD, mitad NDD), con umbral congelado:

| Metrica | Regresion logistica | SVM |
|---|---|---|
| Exactitud | 96,09% | 96,15% |
| F1 macro | 0,9609 | 0,9615 |
| ROC-AUC | 0,9913 | 0,9906 |
| EER | 3,93% | 4,01% |

Falsas activaciones sobre transcripciones de conversaciones reales (todas NDD):

| Corpus | Frases | Regresion logistica | SVM |
|---|---|---|---|
| CORAA | 1.000 | 6,3% | 6,8% |
| NURC-SP | 1.000 | 6,3% | 6,6% |
| TAGARELA | 912 | 5,6% | 6,4% |
| Total | 2.912 | 6,1% | 6,6% |

Sistema completo (audio, detector de voz, Whisper large-v3-turbo y clasificador):

| Conjunto | Etiqueta | Regresion logistica | SVM |
|---|---|---|---|
| Voz real | pedidos atendidos (DD) | 87,5% (70 de 80) | 87,5% (70 de 80) |
| Voz real | falsas activaciones (NDD) | 5,8% (6 de 104) | 8,7% (9 de 104) |
| Voz sintetica | pedidos atendidos (DD) | 93,2% (345 de 370) | 94,3% (349 de 370) |
| Voz sintetica | falsas activaciones (NDD) | 4,1% (15 de 370) | 5,1% (19 de 370) |
| Audio de corpus publicos | falsas activaciones (NDD) | 8,5% (51 de 600) | 8,7% (52 de 600) |

Validacion cruzada de 5 particiones en entrenamiento: F1 macro de 0,9585 para regresion logistica y 0,9608 para SVM.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU con scikit-learn.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el modelo lineal es de tamano reducido.
- Opciones de despliegue: Python con scikit-learn 1.9.1 y joblib 1.6.0; descarga via `huggingface_hub` (`snapshot_download`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de pesos neuronales.
- Latencia y throughput: no se publican cifras concretas, pero al ser un modelo lineal sobre TF-IDF la inferencia es de orden de microsegundos a milisegundos por frase en CPU, adecuada para sistemas en tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DDSD PT-BR TF-IDF (este) | TF-IDF + lineal | no disponible | no disponible | pt-BR | MIT | Hugging Face, joblib |
| BERTimbau (mencionado como alternativa en el TCC) | Transformer encoder | no disponible en la informacion | no disponible | pt-BR | no disponible en la informacion | Hugging Face |
| Whisper large-v3-turbo (componente del sistema) | Transformer encoder-decoder (ASR) | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; el TCC menciona BERTimbau como clasificador alternativo del sistema en tiempo real, pero no se aportan sus metricas.

## Limitaciones y advertencias

- Corpus de entrenamiento 100% sintetico: las frases fueron generadas por LLMs y su estilo difiere del habla espontanea transcrita, lo que puede degradar el rendimiento en conversaciones reales.
- Tasa de falsas activaciones del 5-7% sobre transcripciones reales de conversacion (CORAA, NURC-SP, TAGARELA), superior a la del test sintetico.
- Dependencia del ASR: el rendimiento del sistema completo cae respecto al test de texto (87,5% de pedidos atendidos en voz real frente a 96% en texto).
- Solo portugues de Brasil; no hay soporte documentado de otros idiomas ni de variantes de portugues europeo.
- Los ficheros `.joblib` son pickles: cargarlos ejecuta codigo. Solo deben cargarse desde fuentes de confianza.
- Requiere scikit-learn 1.9.1; otras versiones pueden no abrir los ficheros o alterar los resultados.
- Es imprescindible replicar la normalizacion de texto del entrenamiento y usar el umbral almacenado (0,48 o 0,46); omitirlo invalida las metricas publicadas.
- Licencia MIT: permite uso comercial, pero no se documentan garantias ni sesgos especificos mas alla de los derivados del corpus sintetico.
- Riesgo de alucinacion no aplica en sentido estricto (no es generativo), pero si existe riesgo de clasificacion erronea en frases ambiguas o con estilo conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phelipescript/ddsd-ptbr-tfidf
- Dataset del corpus: https://huggingface.co/datasets/phelipescript/ddsd-ptbr-corpus
- Repositorio de scikit-learn: https://scikit-learn.org
- Documentacion de joblib: https://joblib.readthedocs.io
- Documentacion de huggingface_hub: https://huggingface.co/docs/huggingface_hub
