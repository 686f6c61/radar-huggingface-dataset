# Sanghyang00/ELARSpeech-OmniASR-1B-kichwa-de-chibuleo

## Resumen

ELARSpeech-OmniASR-1B-kichwa-de-chibuleo es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario Sanghyang00 dentro del proyecto ELARSpeech, y publicado en HuggingFace. Se trata de un ajuste fino del modelo base aadel4/omniASR-CTC-1B-v2, un sistema basado en la arquitectura Wav2Vec2 con cabeza CTC (Wav2Vec2ForCTC) de aproximadamente 1.000 millones de parametros (975.677.617 reales, segun safetensors). El modelo resuelve la transcripcion de audio a texto especificamente para el kichwa de Chibuleo, una variedad de la familia linguistica quechua hablada en Ecuador y que no cuenta con codigo ISO 639-3 asignado.

Su relevancia radica en el caracter de bajos recursos de esta lengua: la mayoria de los sistemas ASR comerciales no cubren variedades minoritarias del quechua, de modo que este modelo representa un esfuerzo por dotar de transcripcion automatica a una comunidad linguistica concreta. Al estar construido sobre un backbone de 1B de parametros, ofrece la capacidad del modelo base pero adaptada a un dominio fonetico y ortografico especifico.

El repositorio tiene un tamano de 3,9 GB y se distribuye en formato safetensors, consumible a traves de la libreria transformers. No se declara licencia ni set de idiomas en los metadatos de HuggingFace, y el modelo no registra descargas ni valoraciones en el momento de la consulta, lo que indica que es un artefacto reciente y de difusion muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer convolucional con cabeza de clasificacion CTC) |
| Parametros totales | 975.677.617 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada mono a 16 kHz, sin ventana de contexto de texto declarada) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el repo no lista variantes GGUF, int8 ni fp16) |
| Idiomas soportados | kichwa de Chibuleo (segun la model card); campo de idiomas de HuggingFace: no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | aadel4/omniASR-CTC-1B-v2 |
| Libreria de inferencia | transformers |
| Pipeline declarado | automatic-speech-recognition |
| Tamano del repositorio | 3,9 GB |

## Arquitectura y entrenamiento

La arquitectura es Wav2Vec2ForCTC, es decir, un codificador convolucional y transformer que extrae representaciones del audio crudo y las proyecta mediante una cabeza lineal entrenada con la funcion de perdida CTC (Connectionist Temporal Classification). Este enfoque permite mapear secuencias de audio a secuencias de caracteres o subpalabras sin necesidad de alineaciones forzadas previas. El modelo parte del checkpoint base aadel4/omniASR-CTC-1B-v2 y ha sido ajustado para el kichwa de Chibuleo.

No se dispone en la informacion proporcionada de detalles sobre el corpus de entrenamiento (numero de horas, composicion del dataset, procedencia de los hablantes), sobre si hubo fases de ajuste supervisado adicionales, ni sobre hiperparametros de entrenamiento. La model card solo indica que el artefacto exportado fue verificado contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con resultado de verificacion de transcripcion exacta "PASS", lo que sugiere un proceso de exportacion controlado pero no aporta cifras de rendimiento. Tampoco se documentan innovaciones tecnicas mas alla del propio esquema CTC estandar de Wav2Vec2.

## Capacidades

- Reconocimiento automatico del habla (ASR) mono-idioma: transcripcion de audio en kichwa de Chibuleo a texto.
- Entrada de audio mono a 16 kHz, tal como especifica la model card; es necesario remuestrear cualquier audio que no cumpla este formato.
- Decodificacion CTC mediante argmax sobre los logits y posterior `batch_decode` del procesador, segun el ejemplo de uso oficial.
- Capacidad de inferencia por lotes a traves del pipeline de transformers (`AutoProcessor` + `Wav2Vec2ForCTC`).
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto general, codigo, matematicas, vision ni audio de salida.
- No se documenta soporte multilingue: el modelo esta entrenado para una unica variedad linguistica.

## Casos de uso

- Transcripcion de archivos de audio comunitarios: el modelo permite convertir grabaciones en kichwa de Chibuleo (entrevistas, relatos orales, asambleas) en texto editable, aprovechando que esta ajustado especificamente a esa variedad y no a un quechua generico.
- Documentacion y preservacion linguistica: investigadores pueden transcribir corpus orales para construir archivos textuales alineados con audio, facilitando el analisis fonetico y lexico de una lengua sin codigo ISO 639-3 asignado.
- Subtitulado de material audiovisual en kichwa: integrado en un pipeline con ffmpeg y el procesador de transformers, se pueden generar subtitulos para videos educativos o divulgativos dirigidos a la comunidad.
- Asistencia en entornos educativos bilingues: transcripcion de clases o sesiones grabadas en kichwa de Chibuleo para posterior traduccion o elaboracion de materiales didacticos.
- Indexacion y busqueda de archivos sonoros: convertir un repositorio de grabaciones en un indice de texto buscable, de modo que los hablantes puedan localizar fragmentos por contenido.
- Preanotacion para anotadores humanos: usar la salida del modelo como borrador que despues revisa un hablante nativo, reduciendo el coste temporal de la transcripcion manual frente a hacerlo desde cero.
- Investigacion en ASR de bajos recursos: servir como punto de partida para comparar tecnicas de ajuste fino o de adaptacion de dominio sobre lenguas minoritarias, dado que parte de un backbone de 1B y un checkpoint base reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que el artefacto exportado supero una verificacion de transcripcion exacta ("PASS") contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, sin aportar metricas como WER, CER ni comparaciones cuantitativas.

## Requisitos de hardware

- Parametros: 975.677.617. En precision fp32 el peso ocupa aproximadamente 3,9 GB, coherente con el tamano del repositorio; en fp16/bfloat16 se reduce a unos 2 GB; en int8, a alrededor de 1 GB (aunque el repo no distribuya estas variantes).
- VRAM estimada para inferencia: del orden de 4-5 GB en fp32 contando pesos y activaciones de audio; en torno a 2-3 GB en fp16; aproximadamente 1,5 GB en int8 si se convierte manualmente.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 3070/3080, RTX 4060/4070, RTX 3090 y RTX 4090. En el entorno profesional es adecuado en A100, H100, L4 o T4, aunque para un modelo de este tamano no son necesarias.
- Cabe en GPU de consumo: si; con 6 GB o mas de VRAM se puede ejecutar en fp16 sin problemas. En CPU es viable para transcripciones por lotes, con mayor latencia.
- Opciones de despliegue: transformers (PyTorch) de forma nativa, tal como documenta la model card; exportacion a ONNX Runtime para inferencia optimizada; servidores de inferencia con soporte de transformers como HuggingFace Inference Endpoints (etiqueta endpoints_compatible). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a este tipo de ASR.
- Latencia y throughput estimados: no disponibles. No se aportan cifras de tiempo real (RTF) ni de muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-OmniASR-1B-kichwa-de-chibuleo | 975.677.617 | audio mono 16 kHz | no disponible (solo verificacion PASS) | no disponible | HuggingFace, safetensors |
| aadel4/omniASR-CTC-1B-v2 (modelo base) | ~1B | audio mono 16 kHz | no disponible | consultar repositorio base | HuggingFace |
| Whisper (openai/whisper-large-v3) | ~1.550M | audio 16 kHz, multilingue | ampliamente evaluado (WER publico) | MIT (variante large-v3) | HuggingFace, transformers |
| Meta MMS (facebook/mms-1b-all) | ~965M | audio 16 kHz, mas de 1.100 lenguas | evaluado por los autores en multiples lenguas | CC-BY-NC 4.0 | HuggingFace |

La comparacion es orientativa: no se dispone de datos de rendimiento de este modelo frente a alternativas, y los datos del modelo base tampoco se detallan en la informacion proporcionada. Conviene verificar el rendimiento real sobre el corpus objetivo antes de adoptarlo en produccion.

## Limitaciones y advertencias

- Modelo mono-idioma: esta entrenado exclusivamente para el kichwa de Chibuleo; no es multilingue ni cubre otras variedades del quechua.
- La propia model card advierte de que la precision puede variar segun las condiciones de grabacion, la poblacion de hablantes, la ortografia y el dominio.
- Es obligatorio remuestrear la entrada a 16 kHz y usar audio mono; el incumplimiento de este requisito degrada o invalida la inferencia.
- Riesgo de alucinacion/asignacion erronea de caracteres inherente a la decodificacion CTC, especialmente en audio con ruido, solapamiento de voces o terminologia fuera del dominio de entrenamiento.
- No se declara licencia en los metadatos de HuggingFace: el uso comercial queda indeterminado hasta que se consulte la licencia del modelo base y la documentacion del proyecto ELARSpeech.
- El modelo base tiene sus propios terminos y condiciones de cita; hay que revisarlos antes de redistribuir o desplegar.
- Ausencia de benchmarks publicos: no hay cifras de WER ni CER que permitan estimar el rendimiento en produccion.
- Ausencia de metricas de sesgo: no se documenta la composicion demografica de los hablantes de entrenamiento ni posibles sesgos por acento, edad o genero.
- Huella de adopcion nula (0 descargas y 0 "likes" en el momento de la consulta), lo que implica que no existe validacion externa ni comunidad de usuarios que haya verificado el comportamiento en distintos escenarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-kichwa-de-chibuleo
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- Perfil del autor: https://huggingface.co/Sanghyang00
