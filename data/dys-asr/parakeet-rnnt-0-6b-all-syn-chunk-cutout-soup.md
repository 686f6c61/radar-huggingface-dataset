# dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup

## Resumen

El modelo `dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup` es un sistema de reconocimiento automático del habla (ASR) especializado en habla disártrica, desarrollado por el colectivo `dys-asr` dentro del marco del Speech Accessibility Project (SAP). Se trata de un "checkpoint soup": una media de pesos de igual ponderacion (1/5 cada uno) de los cinco ultimos checkpoints (epocas 6 a 10) de un unico entrenamiento previo, `dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout`. No se ha realizado entrenamiento adicional; el coste de inferencia es identico al de un solo modelo.

El modelo parte de `extraordinarylab/parakeet-unified-en-0.6b` y emplea una arquitectura de transductor RNN-T (encoder mas red de prediccion con LSTM mas red conjunta) con 618.314.241 parametros. Su proposito es transcribir el habla de personas con trastornos del habla (disartria) con mayor precision que un ASR generico, un nicho donde los modelos convencionales degradan severamente su WER.

Su relevancia radica en que demuestra una mejora medible mediante una tecnica de coste nulo: el promedio de epocas consecutivas de una misma trayectoria de optimizacion reduce el CER de 6,33 % (mejor epoca individual) a 6,06 % sobre un subconjunto de validacion de SAPC2. Todos los ingredientes fueron generados por el propio entrenamiento, sin necesidad de una segunda ejecucion ni de asignacion adicional de computo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor RNN-T (Parakeet), con red de prediccion LSTM; encoder de la familia Parakeet (detalle no especificado en la model card) |
| Parametros totales | 618.314.241 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como contexto de tokens; ventana de audio de entrenamiento limitada a 45 s |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente float32 dado el tamano de repo de 2,5 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Biblioteca | transformers (requiere transformers>=5.9) |
| Entrada | audio mono a 16 kHz |
| Modelo base | extraordinarylab/parakeet-unified-en-0.6b |

## Arquitectura y entrenamiento

La arquitectura es un transductor RNN-T de la familia Parakeet (NVIDIA), compuesto por un encoder acustico, una red de prediccion con capas LSTM (los pesos `decoder.lstm.weight_ih_l0` y similares se mencionan explicitamente en la model card) y una red conjunta. El modelo hereda la base `parakeet-unified-en-0.6b`, adaptada al dominio del habla disartrica.

El "entrenamiento" de este checkpoint concreto consiste unicamente en una media de pesos. Los cinco ingredientes son las epocas 6 a 10 de la ejecucion `parakeet-rnnt-0.6b-all-syn-chunk-cutout`, entrenada sobre 468.435 registros y 1.086,5 horas antes de filtrado, procedentes de SAPC1 train y dev, SAPC2 train, 103,1 horas de habla sintetica generada con CosyVoice y 78,8 horas de fragmentos alineados forzosamente extraidos de grabaciones que superan el limite de 45 segundos por muestra. La receta de aumento incluye SpecCutout, que esta ejecucion fue disenada especificamente para evaluar. Los ingredientes se entrenan exclusivamente con datos del Speech Accessibility Project y habla sintetica derivada de ellos (pista restringida, sin datos externos al reto).

Detalles tecnicos de la construccion del soup: los tensores en coma flotante se promedian en float64 y se vuelven a convertir; el contador entero `num_batches_tracked` de BatchNorm se propaga como maximo en lugar de promediarse (no tiene media significativa y la division entera lo truncaria); el promedio se construye y guarda en CPU de forma deliberada, porque cuDNN aplana los pesos de la LSTM de la red de prediccion en un unico buffer en CUDA, dejando `decoder.lstm.weight_ih_l0` y sus hermanos compartiendo almacenamiento, lo que safetensors escribe pero no puede releer.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en habla disartrica (deterioro motor del habla).
- Transcripcion de audio mono a 16 kHz mediante decodificacion greedy.
- Manejo de grabaciones largas: se entreno con fragmentos forzados de grabaciones superiores a 45 segundos, aunque la ventana de entrenamiento por muestra esta limitada a ese valor.
- Salida de transcripcion normalizada a nivel de proyecto (el normalizador de transcripciones se aplica conjuntamente a referencias e hipotesis en la evaluacion).
- Extraccion de caracteristicas (`feature-extraction` figura entre las etiquetas del modelo).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio multimodal ni modo de razonamiento explicito; es un modelo puramente acustico-a-texto.
- Capacidad multilingue: no; solo ingles (`en`).

## Casos de uso

- Accesibilidad y subtitulado para personas con disartria: el modelo transcribe habla con deterioro motor con 9,91 % de WER y 6,06 % de CER en hablantes de SAPC2 no vistos durante el entrenamiento, frente al 11,32 % de WER de un RNN-T anterior de la misma familia.
- Dictado asistido en entornos clinicos o de rehabilitacion: puede integrarse en aplicaciones que conviertan el habla del paciente en texto para historiales o notas, aprovechando su tolerancia a pronunciacion degradada.
- Investigacion en tecnologias de accesibilidad: sirve como referencia (baseline) reproducible para comparar tecnicas de aumento de datos (por ejemplo, SpecCutout) y estrategias de promediado de pesos.
- Transcripcion de conjuntos de datos de habla atipica: dado su origen en SAPC1/SAPC2, es adecuado para procesar corpus con caracteristicas acusticas similares y comparar con metricas WER/CER normalizadas.
- Prototipado rapido en pipelines de ASR en ingles: con 618 M de parametros y decodificacion greedy sin modelo de lenguaje, es ligero y desplegable en una sola GPU o incluso en CPU.
- Evaluacion de tecnicas de model soup: este checkpoint es un caso de estudio para medir si promediar epocas consecutivas de una unica ejecucion aporta ganancia frente a seleccionar el mejor checkpoint (0,27 puntos de CER en este caso).
- Control por voz accesible en ingles: interfaz de comandos para usuarios con habla disartrica, aunque requiere validacion previa en produccion por la variabilidad entre hablantes.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre SAPC2 dev, `validation`, con los hablantes excluidos del conjunto de desarrollo de SAPC1. Decodificacion greedy, sin modelo de lenguaje, con normalizador de transcripciones aplicado a referencias e hipotesis. Las 17.582 emisiones de los 48 hablantes de SAPC2 dev que no aparecen en los datos de entrenamiento.

| Modelo | WER | CER |
|---|---:|---:|
| dys-asr/parakeet-rnnt-0.6b-sapc12-syn (RNN-T anterior) | 11,32 % | 7,16 % |
| dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout (epoca 9) | 10,21 % | 6,33 % |
| **este soup** | **9,91 %** | **6,06 %** |

Desglose de los cinco ingredientes sobre el subconjunto de ranking (CER):

| Slot | Epoca | Paso | CER |
|---|---:|---:|---:|
| last-5 | 6 | 86.850 | 6,70 % |
| last-4 | 7 | 101.325 | 6,41 % |
| last-3 | 8 | 115.800 | 6,28 % |
| last-2 | 9 | 130.275 | 6,06 % |
| last-1 | 10 | 144.750 | 6,09 % |

La epoca 9 fue el mejor checkpoint individual (6,33 % de CER en la evaluacion final); la epoca 10 ya empeoro levemente (6,36 %). La media de los cinco supera al mejor de los cinco, patron atribuido a la cancelacion de ruido. Nota del autor: la fila intermedia obtuvo 0,13 puntos de WER peor aqui que en su propia model card (10,08 %) porque el bucle de entrenamiento evalua bajo autocast bf16 y el evaluador independiente carga en float32; ambas filas comparadas pasaron por el mismo evaluador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en float32 (el repo pesa 2,5 GB), alrededor de 1,2-1,3 GB en fp16/bf16 y en torno a 0,6-0,7 GB en int8 (estimaciones derivadas del recuento de parametros; el autor no publica cifras de cuantizacion).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares.
- Cabe en GPU de consumo: si, con amplio margen; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers>=5.9` con `ParakeetForRNNT` y `AutoProcessor` (uso oficial documentado). Otros backends (vLLM, TGI, llama.cpp, Ollama, ONNX) no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | WER (SAPC2 dev) | CER (SAPC2 dev) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup (este) | 618 M | 9,91 % | 6,06 % | cc-by-4.0 | HuggingFace |
| parakeet-rnnt-0.6b-all-syn-chunk-cutout (epoca 9) | 618 M | 10,21 % | 6,33 % | no disponible | HuggingFace |
| parakeet-rnnt-0.6b-sapc12-syn | 618 M | 11,32 % | 7,16 % | no disponible | HuggingFace |
| extraordinarylab/parakeet-unified-en-0.6b (base) | 618 M | no disponible | no disponible | no disponible | HuggingFace |

La comparacion con modelos ASR genericos (Whisper, otros Parakeet) no esta disponible en la informacion proporcionada; los unicos datos cuantitativos son los de la propia familia `dys-asr`.

## Limitaciones y advertencias

- Solo ingles: el modelo declara `en` como unico idioma soportado.
- El conjunto de evaluacion no contiene habla con Parkinson: segun la model card, ninguna de las muestras de SAPC2 dev empleadas en la evaluacion corresponde a hablantes con Parkinson, por lo que el rendimiento en ese subgrupo no esta medido.
- Sin test de significancia pareado: sobre unas 141.000 palabras de referencia, el error estandar de un WER de este tipo es de aproximadamente 0,08 puntos, pero los errores por palabra correlacionan dentro de una emision, lo que amplia el intervalo real. La ventaja de 0,27-0,30 puntos debe tratarse con cautela.
- Una sola ejecucion y una sola semilla: promediar cinco epocas de una misma trayectoria no equivale a promediar cinco semillas y no dice nada sobre este ultimo caso.
- Riesgo de alucinacion/insercion propio de los sistemas ASR: la decodificacion greedy sin modelo de lenguaje puede producir sustituciones, inserciones u omisiones, especialmente en audio ruidoso o fuera de dominio.
- Sesgo de dominio: entrenado exclusivamente con datos de SAPC1/SAPC2 y habla sintetica derivada; su comportamiento en otras variedades de habla disartrica o acentos distintos a los de esos corpus no esta validado.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribucion; es obligatorio citar al autor.
- Caveat de despliegue: los pesos se guardaron en CPU por la comparticion de almacenamiento de los pesos LSTM bajo cuDNN; deben cargarse con la API oficial de transformers para evitar problemas de lectura.
- Resultados no verificados: las metricas declaradas en el model-index tienen `verified: false`, es decir, son datos del autor sin validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup
- Checkpoint ingrediente: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout
- Modelo base: https://huggingface.co/extraordinarylab/parakeet-unified-en-0.6b
- Dataset SAPC1: https://huggingface.co/datasets/dys-asr/sapc1
- Dataset SAPC2: https://huggingface.co/datasets/dys-asr/sapc2

Nota: la busqueda web no devolvio enlaces relacionados con este modelo. Los resultados obtenidos corresponden a organizaciones y recursos sobre trastornos "dys" (Federacion Francesa des DYS, DYS-POSITIF, Les Dys), tematicamente afines por la palabra clave pero sin relacion con el modelo de IA descrito.
