# Aryan1245678/decodeX-audio-detection-V2

## Resumen

decodeX-audio-detection-V2 es un clasificador de audio publicado por el usuario Aryan1245678 en HuggingFace, orientado a la deteccion de voz sintetica o deepfake. No es un modelo generativo: se trata de un fine-tuning de un backbone acustico wav2vec2 (94.569.090 parametros) con una cabeza de clasificacion, entrenado sobre un dataset de tipo `audiofolder` no documentado. El modelo base declarado es `motheecreator/Deepfake-audio-detection`, y la licencia es Apache 2.0.

El modelo resuelve un problema acotado y de creciente interes: decidir si un fragmento de audio corresponde a voz humana real o a voz generada por sintesis. Con 94,5 millones de parametros, su coste de inferencia es muy bajo, lo que lo hace apto para filtrar audio a gran escala o para ejecutarse en CPU en pipelines de verificacion.

La relevancia practica viene acompanada de una advertencia importante: la unica metrica publicada (accuracy 0,9973) se ha calculado sobre el split `train` del dataset, no sobre un conjunto de test independiente, y el valor esta marcado como `verified: false`. La model card, ademas, esta autogenerada por el Trainer de HuggingFace y no documenta composicion de datos, uso previsto ni limitaciones. Por tanto, debe tratarse como un artefacto experimental y no como un detector validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder Transformer) con cabeza de clasificacion de audio; variante de tipo `Wav2Vec2ForAudioClassification` |
| Parametros totales | 94.569.090 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es una senal de audio, no texto. La model card no documenta la duracion maxima de clip admitida |
| Tipos de cuantizacion | No se han publicado versiones cuantizadas. Pesos distribuidos en safetensors (precision no declarada, presumiblemente fp32). Compatibilidad con cuantizacion INT8 via PyTorch/ONNX Runtime no verificada |
| Idiomas soportados | No disponible. La model card no documenta idiomas ni dominio acustico |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea declarada | `audio-classification` (deteccion de audio deepfake / voz sintetica) |
| Modelo base | motheecreator/Deepfake-audio-detection (fine-tune). El tag de HuggingFace lo escribe como `mo-thecreator/Deepfake-audio-detection` |
| Frecuencia de muestreo esperada | No declarada en la model card; la arquitectura wav2vec2 estandar de la que deriva trabaja con audio mono a 16 kHz |
| Tamano del repositorio | 0,4 GB |
| Framework de entrenamiento | Transformers 4.41.2, PyTorch 2.1.2, Datasets 2.19.2, Tokenizers 0.19.1 |
| Fecha de creacion | 2026-09-13 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2, un modelo acustico auto-supervisado que procesa la forma de onda cruda mediante un extractor convolucional de caracteristicas y un encoder Transformer, sobre el que se anade una cabeza de clasificacion. Con 94,5 millones de parametros, el tamano corresponde a la variante *base* de la familia. El modelo parte de `motheecreator/Deepfake-audio-detection`, que a su vez ya era un modelo de deteccion de deepfake, de modo que este repositorio es un fine-tune de segundo nivel.

El entrenamiento se realizo con el `Trainer` de HuggingFace durante 5 epocas, con learning rate 3e-05, batch de entrenamiento 32 (batch total 128 con 4 pasos de acumulacion de gradiente), optimizador Adam (betas 0,9/0,999, epsilon 1e-08), scheduler coseno con warmup ratio 0,1 y semilla 42. La unica indicacion sobre los datos es que el dataset se llama `audiofolder` con split `train`; no se especifica numero de muestras, procedencia, idioma, codecs ni proporcion entre clases reales y sinteticas. Tampoco hay evidencia de RLHF, DPO ni de ninguna innovacion tecnica adicional: es un fine-tuning supervisado convencional de clasificacion. La unica metrica reportada durante el entrenamiento es loss y accuracy de validacion por epoca.

## Capacidades

- Clasificacion binaria (o multiclase, no documentado) de fragmentos de audio para discriminar voz real de voz sintetizada.
- Inferencia sobre forma de onda cruda, sin necesidad de un front-end de caracteristicas manuales (MFCC, espectrogramas) ni de transcripcion previa.
- Procesamiento por lotes: el entrenamiento uso batch de 32 con batch efectivo de 128, lo que indica que admite inferencia por lotes de audio corto.
- Coste computacional bajo (94,5 M de parametros), compatible con CPU para volumenes moderados.
- No es un modelo generativo: no genera texto, codigo ni audio.
- No hay soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- No hay capacidades multimodales: solo audio; no procesa imagen, video ni texto.
- No hay modo *thinking*, vision, audio generation ni capacidades de agente.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Filtrado de audios virales en redaccion periodistica: el modelo actua como primer triaje sobre clips cortos (notas de voz, extractos de entrevistas) para priorizar cuales revisar manualmente con analisis forense completo. Su tamano reducido permite procesar cientos de archivos en minutos.
- Antifraude en atencion telefonica: integrado en un pipeline de VoIP, clasifica segmentos de la llamada para detectar si la voz del interlocutor es sintetica, un vector habitual en fraudes de suplantacion (vishing). La inferencia en CPU evita anadir GPUs al stack de telefonia.
- Verificacion de identidad reforzada: como segunda senal, ademas de la biometria de voz clasica, en procesos de onboarding bancario o concesion de creditos por telefono, donde una voz clonada podria superar un sistema de locutor.
- Moderacion de contenido en plataformas de audio: podcasts, audiolibros y redes sociales pueden usar el clasificador para marcar contenido sospechoso de sintesis antes de su publicacion o para etiquetarlo automaticamente.
- Limpieza de datasets para entrenamiento de TTS y ASR: eliminar muestras de voz sintetica que se hayan colado en corpus de habla, evitando bucles de realimentacion que degradan modelos acusticos posteriores.
- Apoyo a investigacion forense digital: preanalisis de evidencias de audio en investigaciones judiciales o de seguridad, dejando al perito la decision final. La licencia Apache 2.0 permite integrarlo en herramientas internas sin obligacion de liberar el codigo.
- Deteccion de presencia de bots de voz en salas de conferencia o atencion automatizada: marcar intervenciones generadas por agentes de voz sintetica en grabaciones de reuniones para auditoria.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el `model-index` y en la tabla de entrenamiento de la model card. El resultado principal se ha medido sobre el split `train` del dataset `audiofolder`, no sobre un conjunto de test independiente, y esta marcado como no verificado.

| Metrica | Valor | Dataset / split | Verificado |
|---|---|---|---|
| Accuracy | 0,9973 (0,9972843305874898) | `audiofolder`, split `train`, config `default` | No |
| Loss (evaluacion final) | 0,0141 | Conjunto de evaluacion del entrenamiento | No |

Evolucion durante el entrenamiento (segun la model card):

| Training loss | Epoca | Step | Validation loss | Accuracy |
|---|---|---|---|---|
| 0,0503 | 1.0 | 1381 | 0,0514 | 0,9858 |
| 0,0327 | 2.0 | 2762 | 0,0174 | 0,9956 |
| 0,0064 | 3.0 | 4143 | 0,0221 | 0,9950 |
| 0,0003 | 4.0 | 5524 | 0,0174 | 0,9965 |
| 0,0115 | 5.0 | 6905 | 0,0141 | 0,9973 |

No se han publicado resultados sobre MMLU, HumanEval, GSM8K ni sobre benchmarks especificos de deteccion de audio falsificado (ASVspoof, In-the-Wild, FakeAVCeleb), por lo que no es posible comparar el rendimiento con el estado del arte de forma rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 378 MB solo para los pesos en fp32 (94,5 M de parametros x 4 bytes), y del orden de 1 a 1,5 GB contando activaciones y overhead del runtime en lotes pequenos. En fp16 los pesos bajan a unos 190 MB.
- GPU recomendadas: cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, T4). Para lotes grandes o servicio de alto volumen, A100 o H100 aportan margen pero estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, con holgura, en cualquier tarjeta moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable para volumentes moderados, dado el reducido numero de parametros.
- Opciones de despliegue: pipeline `transformers` (`AudioClassificationPipeline`) con PyTorch; exportacion a ONNX Runtime, TorchScript o TensorRT para reducir latencia; servido con FastAPI, Triton Inference Server o BentoML. No aplica vLLM ni TGI (orientados a modelos generativos) ni llama.cpp/Ollama (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles oficialmente. Como orden de magnitud, para clips de pocos segundos sobre GPU moderna cabe esperar latencias de milisegundos a decenas de milisegundos por fragmento, y decenas o cientos de fragmentos por segundo en lotes; son estimaciones no verificadas y dependen de la duracion del audio y de la CPU/GPU de destino.

## Comparativa con modelos similares

La informacion disponible no permite una comparativa cuantitativa fiable: no hay datos verificados de los modelos alternativos. Se recoge la relacion de linaje y las alternativas mas directas.

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decodeX-audio-detection-V2 (este modelo) | 94.569.090 | Clasificacion de audio (deepfake) | Audio; duracion maxima no documentada | apache-2.0 | HuggingFace, 0 descargas |
| motheecreator/Deepfake-audio-detection (modelo base) | No disponible en la informacion proporcionada | Clasificacion de audio (deepfake) | No disponible | No disponible | HuggingFace (referenciado como base) |
| facebook/wav2vec2-base (backbone arquitectonico) | No disponible en la informacion proporcionada (variante *base* de wav2vec2) | Reconocimiento de habla auto-supervisado | Audio; la variante base se preentreno con clips de decenas de segundos | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de otros detectores de deepfake de audio (por ejemplo, fine-tunes de wav2vec2 sobre ASVspoof) dentro de la informacion proporcionada, por lo que la comparativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Metrica no fiable: la accuracy de 0,9973 se ha medido sobre el split `train` del propio dataset `audiofolder`. Esto no mide generalizacion y es compatible con fuga de datos; el propio `model-index` marca el resultado como no verificado.
- Metrica unica: solo se reporta accuracy. Faltan AUC, EER, precision/recall por clase y umbral de decision calibrado, imprescindibles en deteccion de deepfake, donde el coste de un falso positivo y de un falso negativo es distinto.
- Dataset opaco: se desconoce el numero de muestras, su procedencia, los idiomas, los codecs, la relacion entre clases y que generadores de voz se usaron. Sin esa informacion no se puede estimar la robustez frente a modelos de sintesis nuevos o ante ruido, musica o audio telefónico.
- Riesgo de sobreajuste a un dominio concreto: los clasificadores de deepfake de audio suelen degradarse ante cambios de canal, sample rate, compresion o idioma.
- Falsos positivos sobre voz humana atipica: voces con patologia, susurros, locutores sintetizados por accesibilidad o audio muy procesado pueden clasificarse como sinteticos.
- Documentacion practicamente inexistente: la model card esta autogenerada y deja "More information needed" en descripcion, usos previstos y datos de entrenamiento. No hay instrucciones de uso, ni ficha de sesgos, ni umbral recomendado.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero no cubre los derechos sobre el modelo base ni sobre los datos de entrenamiento, cuya licencia no se declara. Conviene verificar la licencia de `motheecreator/Deepfake-audio-detection` antes de explotarlo comercialmente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion por terceros. No debe desplegarse en produccion sin una evaluacion propia sobre datos representativos.
- Uso responsable: un detector de voz sintetica no debe ser la unica prueba para acusar a alguien de fraude o de difundir contenido manipulado; los resultados deben presentarse como indicio y revisarse por un analista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aryan1245678/decodeX-audio-detection-V2
- Modelo base declarado: https://huggingface.co/motheecreator/Deepfake-audio-detection (el tag del repositorio lo referencia como https://huggingface.co/mo-thecreator/Deepfake-audio-detection)
- Paper de la arquitectura wav2vec2 (Baevski et al., 2020): https://arxiv.org/abs/2006.11477
- Documentacion de HuggingFace Transformers sobre clasificacion de audio: https://huggingface.co/docs/transformers/tasks/audio_classification
- Documentacion de modelos Wav2Vec2 en Transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a paginas de soporte de Google Play Store y no guardan relacion con el modelo.
