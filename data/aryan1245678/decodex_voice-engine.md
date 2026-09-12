# Aryan1245678/DecodeX_Voice-Engine

## Resumen

DecodeX_Voice-Engine es un clasificador binario de audio publicado en HuggingFace por el usuario Aryan1245678, cuyo objetivo es distinguir voz humana real (bonafide) de voz sintetica o manipulada (deepfake, TTS, conversion de voz). El pipeline declarado es `audio-classification` y la entrada es un unico clip de 4 segundos a 16 kHz en mono, del que se devuelve una probabilidad de la clase "fake" junto con una etiqueta binaria y un nivel de confianza. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

El repositorio presenta una discrepancia importante que conviene senalar antes de cualquier evaluacion: los pesos en formato safetensors contienen 6.134.849 parametros, mientras que el contenido de la model card describe una arquitectura wav2vec2-base (encoder CNN + Transformer congelado) con un BiGRU de 2 capas y atencion multi-cabeza, y declara aproximadamente 98,5 millones de parametros. Ademas, el texto de la model card referencia otro repositorio (`koyelog/deepfake-voice-detector-sota`) y otra fecha de actualizacion (2025-10-31) distintos de los metadatos del modelo, por lo que es probable que se trate de una tarjeta copiada o parcialmente reutilizada.

La relevancia de este tipo de modelos esta en el aumento de estafas por suplantacion de voz y de contenido generado sinteticamente: un detector ligero, ejecutable en CPU o en GPU de consumo, permite filtrar datasets de habla, moderar plataformas de audio y prefiltrar sistemas antifraude en telefonia. Ahora bien, el modelo no tiene descargas ni "likes", el repositorio figura con 0.0 GB de tamano y sus metricas son rangos autoinformados, sin validacion externa ni evaluacion por subconjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder wav2vec2-base (feature extractor con capas CNN congeladas) + BiGRU de 2 capas (256 unidades por direccion, 512 en total) + Multi-Head Attention (8 cabezas, 512 dimensiones) + cabeza de clasificacion binaria (segun model card). Discrepancia: el recuento real de parametros en safetensors no cuadra con la arquitectura descrita |
| Parametros totales | 6.134.849 segun los pesos safetensors publicados; la model card declara ~98,5 M |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica: entrada de longitud fija, clip de 4 segundos a 16 kHz (64.000 muestras), con relleno o truncado |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | En (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe un esquema de transfer learning en dos etapas: se parte de `facebook/wav2vec2-base` como extractor de caracteristicas de habla con las capas convolucionales congeladas, y sobre sus representaciones se anade un clasificador temporal compuesto por un BiGRU de 2 capas (256 unidades ocultas por direccion), una capa de atencion multi-cabeza de 8 cabezas sobre embeddings de 512 dimensiones, y una cabeza densa con tres capas lineales (512 a 512, 512 a 128, 128 a 1) con ReLU, BatchNorm y dropout de 0,4 y 0,3, terminada en sigmoide. El entrenamiento se realizo con PyTorch y Transformers, optimizador AdamW con learning rate 5e-5, weight decay 0,01, batch size 24 con acumulacion de gradiente 2 (batch efectivo 48), 20 epocas, scheduler de Cosine Annealing con Warm Restarts (T_0=5, T_mult=2), perdida de entropia cruzada binaria y precision mixta, sobre una unica GPU Tesla P100-PCIE de 16 GB durante unas 16 horas.

Los datos declarados suman 822.166 muestras agregadas de 19 conjuntos (ASVspoof 2021, WaveFake, Audio-Deepfake, Fake-Real-Audio, Deepfake-Audio, Combined-Real-Voices, Scenefake, Gender-Balanced-Audio-Deepfake, Synthetic-Speech-Commands y otros), con un reparto de 387.422 muestras reales (47,1%) y 434.744 falsas (52,9%), y una division 80/20 entre entrenamiento (657.732) y validacion (164.434). El preprocesado consiste en remuestreo a 16 kHz, segmentacion de longitud fija de 4 segundos (relleno o truncado) y extraccion de caracteristicas wav2vec2, con aumentacion estandar (ruido y perturbacion de velocidad) donde se considero aplicable. El etiquetado se baso en metadatos de los proveedores de los datasets y en palabras clave de nombres de fichero (`bonafide`, `real`, `genuine` frente a `spoof`, `fake`, `synthetic`, `generated`), lo que constituye un punto debil metodologico relevante. No se documentan fases de RLHF ni DPO, algo esperable en un clasificador.

## Capacidades

- Clasificacion binaria de audio: devuelve un logit, una probabilidad en [0,1] de la clase "fake", una etiqueta final (0 = real/bonafide, 1 = fake/deepfake/sintetico) y una confianza, con umbral por defecto 0,5.
- Deteccion de voz sintetica generada por TTS, conversion de voz y otras tecnicas de spoofing presentes en los datasets de entrenamiento.
- Procesamiento de clips de exactamente 4 segundos a 16 kHz mono; clips mas largos o cortos deben truncarse o rellenarse antes de la inferencia.
- Inferencia no autorregresiva: una unica pasada forward por clip, sin generacion de texto ni decodificacion por tokens.
- Capacidades multilingues: no. El unico idioma declarado es el ingles.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Vision, audio generativo, transcripcion o diarizacion: no soportado. Es exclusivamente un clasificador.
- Modelo de investigacion lanzado sin demo, sin Space y sin pesos alternativos de cuantizacion.

## Casos de uso

- Moderacion de contenido en plataformas de audio y podcast: integrado como paso previo a la revision humana, permite marcar clips de 4 segundos sospechosos de ser voz sintetica y reducir la carga de moderadores. Adecuado por su bajo coste computacional y su salida de probabilidad, que admite umbrales ajustables segun la tolerancia a falsos positivos.
- Prevencion de fraude en telefonia y banca: en una llamada con un agente o en un proceso de verificacion de identidad, se pueden analizar ventanas consecutivas de 4 segundos y activar alertas o pasos adicionales de verificacion cuando la probabilidad de "fake" supera un umbral. Requiere validacion previa en el dominio concreto (codecs telefonicos, ruido) antes de produccion.
- Limpieza de datasets de habla: antes de entrenar sistemas ASR o TTS, el clasificador puede filtrar muestras sinteticas que hayan contaminado corpus etiquetados como reales, ejecutandose en lote sobre cientos de miles de clips en CPU o GPU de consumo.
- Analisis forense y peritaje digital: como herramienta de triaje en investigaciones sobre grabaciones aportadas como prueba, generando un indicio cuantitativo (probabilidad) que despues debe confirmarse con analisis especializados. Nunca deberia usarse como prueba unica.
- Investigacion en seguridad de sistemas de verificacion de hablante: sirve como baseline ligero para comparar contra detectores especificos de retos como ASVspoof, y para estudiar generalizacion frente a ataques no vistos.
- Monitorizacion de medios y fact-checking: deteccion rapida de audio sintetico en piezas informativas o clips virales, como primer filtro antes de una verificacion manual con herramientas forenses.
- Filtrado en tiempo casi real sobre streams: al operar sobre clips de 4 segundos sin dependencias de generacion, puede desplegarse sobre segmentos solapados para emitir una señal continua de riesgo durante una emision o una llamada.
- Investigacion academica sobre aprendizaje por transferencia en deteccion de deepfakes de voz: la combinacion wav2vec2 congelado mas BiGRU y atencion es una receta reproducible y barata de reentrenar, util como punto de partida en experimentos controlados.

## Benchmarks y rendimiento

Los unicos datos disponibles son los rangos autoinformados por el autor en la model card, agregados sobre la particion de validacion combinada (164.434 muestras). No hay metricas por dataset, no hay evaluacion en ASVspoof 2021 como conjunto de test oficial y no hay verificacion independiente.

| Metrica | Valor declarado (rango) |
|---|---|
| Exactitud de validacion | 95%-97% |
| Precision | ~0,95 |
| Recall | ~0,94 |
| F1-score | ~0,94 |
| AUC-ROC | ~0,96 |

No se han publicado resultados de benchmarks por subconjunto (ASVspoof frente a WaveFake, por ejemplo) en la informacion disponible. Tampoco se aportan metricas de equal error rate (EER), que es la metrica estandar en la literatura de deteccion de spoofing, ni resultados sobre ataques no vistos.

## Requisitos de hardware

- VRAM segun los pesos publicados (6.134.849 parametros): aproximadamente 25 MB en fp32 y 12 MB en fp16, mas las activaciones del extractor de caracteristicas y del clasificador para 4 segundos de audio; en la practica cabe holgadamente por debajo de 1 GB.
- VRAM segun lo declarado en la model card (~98,5 M de parametros): aproximadamente 394 MB en fp32 y 197 MB en fp16, mas activaciones; estimacion total por debajo de 2 GB. Estas cifras son estimaciones propias a partir del recuento de parametros declarado, no mediciones publicadas.
- GPU recomendadas: practicamente cualquier GPU moderna sirve. Una RTX 4090, RTX 3060, T4 o incluso una GPU integrada son suficientes; tambien es viable la inferencia en CPU, dado el tamano del modelo y que la entrada es un unico clip de 4 segundos.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos 2 GB de memoria, y con margen amplio si se ejecuta en CPU.
- Opciones de despliegue: PyTorch con la libreria Transformers (es el formato documentado), exportacion a TorchScript u ONNX Runtime para servir en produccion, y empaquetado detras de FastAPI, Triton Inference Server o un microservicio propio. No es compatible con llama.cpp, Ollama ni vLLM: son herramientas para modelos generativos de lenguaje y no soportan de forma nativa este clasificador de audio. No se publican pesos en GGUF ni cuantizaciones alternativas.
- Latencia y throughput: no se han publicado mediciones. Al ser un modelo no autorregenerativo que procesa un unico clip en una pasada forward, la latencia esperada es baja, pero no se aporta ningun dato de milisegundos por clip ni de clips por segundo, por lo que no se incluye ninguna cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecodeX_Voice-Engine (este modelo) | 6,13 M segun safetensors; ~98,5 M declarados | Clip fijo de 4 s a 16 kHz | 95%-97% de exactitud en validacion, autoinformado | Apache-2.0 | Pesos safetensors en HuggingFace, 0 descargas, 0 likes |
| AASIST (referencia academica en deteccion de spoofing) | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible | Codigo de investigacion asociado a retos ASVspoof; sin checkpoint oficial en HuggingFace |
| RawNet2 (referencia academica, entrada de forma de onda cruda) | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible | Codigo de investigacion; sin checkpoint oficial en HuggingFace |
| facebook/wav2vec2-base ajustado de extremo a extremo | Aproximadamente 95 M (dato publico del modelo base) | Habla a 16 kHz, longitud variable | No disponible para la tarea de deteccion de deepfake | Apache-2.0 (modelo base) | Ampliamente disponible como modelo base; requiere ajuste especifico |

No se dispone de valores numericos verificables de EER ni de exactitud de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La principal diferencia de planteamiento es que este modelo congela el extractor wav2vec2 y anade un clasificador temporal, mientras que las alternativas academicas suelen entrenarse de extremo a extremo sobre la forma de onda o sobre representaciones espectrales.

## Limitaciones y advertencias

- Discrepancia no resuelta entre el recuento real de parametros (6.134.849 en safetensors) y el declarado en la model card (~98,5 M). Esto impide verificar que la arquitectura descrita corresponde a los pesos publicados.
- La model card referencia otro repositorio (`koyelog/deepfake-voice-detector-sota`) y una fecha distinta a la del modelo publicado, lo que sugiere una tarjeta copiada o parcialmente desactualizada.
- Etiquetado basado en metadatos y palabras clave de los datasets, no en verificacion manual. Este enfoque es propenso a aprendizaje de atajos (por ejemplo, caracteristicas del canal de grabacion o del codec) en lugar de artefactos genuinos de sintesis.
- Metricas autoinformadas y agregadas, sin evaluacion por dataset, sin EER y sin resultados sobre ataques no vistos. La generalizacion a sintetizadores nuevos es la principal incognita en este tipo de sistemas.
- Entrada restringida: solo ingles y solo clips de 4 segundos a 16 kHz. Voces en otros idiomas, audio musical, habla con solapamiento fuerte o grabaciones telefonicas con codecs agresivos pueden degradar gravemente el rendimiento.
- Umbral por defecto de 0,5 sin calibracion documentada. En produccion conviene ajustar el umbral segun el coste relativo de falsos positivos (acusar a una persona real) y falsos negativos (dejar pasar un deepfake).
- Riesgo de sesgo: el reparto de datos depende de la composicion de los 19 datasets agregados, que no se detalla por genero, acento, edad ni canal; no se aporta analisis de equidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto, pero si existe riesgo de clasificaciones erróneas con alta confianza, especialmente sobre voces sinteticas de sistemas no representados en el entrenamiento.
- Repositorio sin traccion: 0 descargas, 0 likes, 0.0 GB de tamano registrado y sin demo publica. No hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y no se ofrece ninguna garantia. Dado el contexto de deteccion antifraude, el uso como unica prueba o filtro automatico sin supervision humana es desaconsejable.
- Fecha de creacion del repositorio (2026-09-12) es posterior a la fecha indicada en la model card (2025-10-31), lo que refuerza la incoherencia documental.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Aryan1245678/DecodeX_Voice-Engine
- Repositorio referenciado en la model card: https://huggingface.co/koyelog/deepfake-voice-detector-sota
- Modelo base del extractor de caracteristicas: `facebook/wav2vec2-base` (referenciado en la model card; no se proporciona URL completa)
- Datasets referenciados en la model card (nombres tal cual, sin URL en la informacion disponible): ASVspoof 2021, WaveFake, Audio-Deepfake, Fake-Real-Audio, Deepfake-Audio, Combined-Real-Voices, Scenefake, Gender-Balanced-Audio-Deepfake, Synthetic-Speech-Commands, y otros 10 conjuntos de Kaggle y academicos
- Resultados de la busqueda web: no contienen informacion util sobre este modelo; los enlaces devueltos son consultas de ejemplo de relleno y documentacion de librerias no relacionadas, por lo que no se incluyen
