# serendipitylabs/dulu-malayalam-asr

## Resumen

Dulu Malayalam ASR v0.1 es un modelo de reconocimiento automático del habla (ASR) especializado en malayalam, una lengua dravídica hablada en el estado indio de Kerala. Lo publica Serendipity Labs como una versión de investigación temprana y está construido mediante ajuste fino (*finetune*) sobre el modelo de embeddings de texto `google/embeddinggemma-2`, con una arquitectura de salida CTC y una implementación inspirada en el proyecto `qnguyen3/gemma-asr`.

El modelo convierte audio en texto transcrito en malayalam y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones de royalties. El repositorio ocupa 1,3 GB e incluye todos los pesos, de modo que no es necesario descargar el modelo base por separado. Admite inferencia tanto en CPU como en GPU CUDA con soporte de BF16.

Su relevancia radica en la escasez de modelos abiertos específicos para malayalam y en que su autor hace pública una auditoría detallada de métricas, procedencia del checkpoint y limitaciones. Los resultados declarados son modestos (44,13 % de WER en FLEURS Malayalam), por lo que el propio autor lo posiciona como un modelo de investigación y no como un servicio de transcripción listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con cabecera CTC sobre el modelo base `google/embeddinggemma-2` (etiquetas del repositorio: `ctc`, `gemma`) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de ASR); no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el autor solo indica pesos de aproximadamente 1,3 GB y soporte de BF16 en CUDA) |
| Idiomas soportados | malayalam (`ml`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; pesos PyTorch incluidos en el repositorio (`library_name: pytorch`) |

Otros datos del repositorio: 1,3 GB de tamano, 0 descargas y 0 *likes* en el momento de la consulta, creado el 15 de octubre de 2026 y actualizado el mismo dia. Version declarada 0.1.0.

## Arquitectura y entrenamiento

El modelo parte de `google/embeddinggemma-2`, un modelo derivado de la familia Gemma orientado originalmente a la generacion de embeddings de texto, y lo adapta mediante ajuste fino a una tarea de reconocimiento de voz con una cabecera de Connectionist Temporal Classification (CTC). La implementacion se inspira en `qnguyen3/gemma-asr`. El pipeline declarado en HuggingFace es `automatic-speech-recognition` y el formato de audio de entrada se convierte automaticamente a mono a 16 kHz. No se especifican en la informacion disponible el numero de parametros, la profundidad de la red ni los detalles del adaptador acustico, por lo que esos datos quedan como no disponibles.

El entrenamiento utilizo 134,1 horas de audio en malayalam procedentes del corpus Kathbath de AI4Bharat. La seleccion del checkpoint se hizo con datos de validacion de Kathbath y el modelo publicado corresponde a la epoca 4 de una ejecucion de 12 epocas, elegida por ser la de mejor validacion. Las metricas declaradas se obtuvieron con decodificacion greedy, sin modelo de lenguaje y con texto normalizado, en una unica ejecucion. No se documenta en la informacion proporcionada el uso de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones del tipo decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion de voz a texto en malayalam a partir de audio mono a 16 kHz.
- Inferencia en CPU y en GPU CUDA con precision BF16.
- Ejecucion mediante script de linea de comandos (`python dulu_asr.py recording.wav --device cpu`) o desde Python con la clase `DuluASR.from_pretrained`.
- Funcionamiento sin descarga adicional del modelo base: todos los pesos estan incluidos en el repositorio.
- Control del numero de hilos de CPU mediante `torch.set_num_threads`.
- No soporta *tool calling*, *function calling* ni flujos de agentes: no es un modelo de lenguaje conversacional.
- No anade puntuacion, no identifica hablantes, no genera marcas de tiempo y no permite streaming de audio en vivo.
- No se han validado capacidades multilingues, mezcla malayalam-ingles, dialectos, audio con ruido ni grabaciones largas.

## Casos de uso

- Transcripcion de entrevistas y material oral en malayalam con revision humana posterior: el modelo entrega un borrador de transcripcion adecuado para edicion manual, aunque el autor recomienda verificar nombres, numeros y palabras poco frecuentes.
- Digitalizacion de archivos de audio etnograficos o linguisticos: util para investigadores que necesitan un primer volcado de texto sobre corpus en malayalam antes de anotacion fina.
- Generacion de subtitulos base para videos en malayalam: el texto resultante requiere una pasada de correccion y la adicion externa de puntuacion y marcas de tiempo, ya que el modelo no las produce.
- Prototipado de asistentes de voz en malayalam: sirve como componente ASR en una demo o prueba de concepto, siempre que se asuma un WER en torno al 44 %.
- Evaluacion comparativa de arquitecturas ASR sobre base Gemma: al ser un modelo abierto con metricas y auditoria publicadas, resulta util como punto de referencia en experimentos academicos.
- Preanotacion de datasets de habla: el transcriptor puede generar etiquetas iniciales que despues se corrigen manualmente, reduciendo el coste frente a la transcripcion desde cero.
- Despliegue en entornos sin GPU: al soportar inferencia en CPU con pesos de 1,3 GB, puede ejecutarse en portatiles o servidores modestos para tareas por lotes de baja prioridad.
- Docencia y formacion en procesamiento de voz: el repositorio incluye detalles de entrenamiento, metricas y procedencia del checkpoint, lo que lo hace adecuado como material didactico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* y el *model-index*. Todos los valores son de una unica ejecucion, con decodificacion greedy sin modelo de lenguaje y con texto normalizado. Menos es mejor.

| Conjunto de evaluacion | Grabaciones | WER (%) | CER (%) |
|---|---:|---:|---:|
| Kathbath validacion | 1.767 | 41,07 | 7,15 |
| FLEURS Malayalam test (ml_in) | 958 | 44,13 | 11,15 |
| FLEURS Malayalam, subconjunto propio sin contenido inspeccionado previamente | 887 | 44,14 | 11,28 |

Notas de auditoria facilitadas por el autor: la validacion de Kathbath incluye hablantes que tambien aparecen en entrenamiento; FLEURS no se uso para actualizaciones de entrenamiento, pero su conjunto de validacion si se habia empleado en desarrollo anterior; el subconjunto de 887 grabaciones es una particion propia y no el benchmark oficial. Las metricas de FLEURS no estan verificadas de forma independiente (`verified: false`).

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos ASR en malayalam.

## Requisitos de hardware

- Pesos: aproximadamente 1,3 GB en disco, sin necesidad de descargar el modelo base.
- VRAM estimada para inferencia: no disponible de forma oficial. Con pesos de 1,3 GB se puede asumir un consumo en GPU del orden de 2 a 3 GB contando activaciones y sobrecarga del entorno, pero esta cifra no esta confirmada por el autor y debe tratarse como estimacion orientativa.
- Memoria RAM: el autor indica que "ejecutar el modelo necesita memoria adicional" a los 1,3 GB de pesos; no se especifica una cifra concreta.
- GPU recomendadas: no disponible. El unico requisito documentado es una GPU CUDA con soporte de BF16.
- GPU de consumo: no confirmado oficialmente, pero por tamano de pesos es plausible su ejecucion en tarjetas con 4 GB o mas de VRAM, siempre que soporten BF16.
- CPU: soportada de forma explicita; el ejemplo oficial usa `--device cpu` y fija `torch.set_num_threads(4)`, por lo que funciona con 4 hilos.
- Opciones de despliegue: no disponible. La documentacion solo cubre el script `dulu_asr.py` y el uso desde Python con `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y ningun formato GGUF esta declarado.
- Latencia y throughput: no disponible. El autor senala unicamente que las salidas en CPU y GPU pueden diferir ligeramente y que las metricas reportadas proceden de la evaluacion original en GPU.
- Dependencias: Python 3.12 o 3.13, `huggingface_hub==2.2.0` y las dependencias listadas en `requirements.txt` del repositorio.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos de ASR en malayalam, por lo que no es posible establecer una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | WER FLEURS Malayalam | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dulu Malayalam ASR v0.1 | no disponible | no aplicable | 44,13 % (declarado por el autor, no verificado) | Apache 2.0 | HuggingFace, 1,3 GB |
| OpenAI Whisper (variantes) | no disponible | no disponible | no disponible | no disponible | no disponible |
| AI4Bharat IndicWav2Vec / IndicConformer | no disponible | no disponible | no disponible | no disponible | no disponible |

Se citan estos nombres unicamente como familias de referencia del mismo ambito (ASR multilingue e indio); los valores de la tabla no proceden de la informacion suministrada. El propio autor advierte que sus cifras "no son una afirmacion de que Dulu sea estado del arte".

## Limitaciones y advertencias

- Es una publicacion de investigacion, no un servicio de transcripcion listo para produccion; el autor lo declara explicitamente.
- WER del 44,13 % en FLEURS Malayalam: aproximadamente una de cada dos palabras y media se transcribe de forma incorrecta, lo que obliga a revision humana.
- Mayor tasa de error en nombres propios, numeros y vocabulario poco frecuente.
- No se han probado conversaciones, dialectos, mezcla de malayalam e ingles, audio con ruido ni grabaciones largas.
- No genera puntuacion, no hace diarizacion de hablantes, no produce marcas de tiempo y no soporta streaming en tiempo real.
- Las salidas pueden diferir ligeramente entre CPU y GPU.
- La validacion de Kathbath incluye hablantes presentes en el entrenamiento, lo que puede inflar las metricas de ese conjunto.
- Parte del contenido de FLEURS ya se habia inspeccionado en un experimento anterior; el subconjunto de 887 grabaciones usado como control es una particion propia y no el benchmark oficial.
- Las metricas de FLEURS estan marcadas como no verificadas (`verified: false`) y son resultados de una sola ejecucion.
- Riesgo de alucinacion no cuantificado en la informacion disponible, pero plausible en cualquier sistema CTC ante audio ambiguo o fuera de dominio.
- Sesgos: no se documenta ningun analisis de sesgo por genero, acento, edad o procedencia dialectal.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de atribucion (el repositorio incluye `LICENSE` y `NOTICE`). Es una version independiente de Serendipity Labs, no un producto de Google ni de AI4Bharat.
- El autor pide no compartir grabaciones privadas sin permiso al enviar ejemplos reproducibles en la pestana Community.
- Fecha de publicacion declarada: octubre de 2026, version 0.1.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/serendipitylabs/dulu-malayalam-asr
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Implementacion de referencia: https://github.com/qnguyen3/gemma-asr/tree/343c86faab52fdd09c312945ad21b8f8f15e76ee
- Documentacion de entrenamiento, evaluacion y limitaciones: `MODEL_DETAILS.md` (incluido en el repositorio)
- Metricas exactas y auditoria de particiones: `evaluation.json` (incluido en el repositorio)
- Procedencia del checkpoint: `provenance.json` (incluido en el repositorio)
- Verificaciones de la release: `verification.json` (incluido en el repositorio)
- Licencia: `LICENSE` (Apache 2.0) y `NOTICE` (atribucion), incluidos en el repositorio
- Dataset de entrenamiento Kathbath (AI4Bharat): https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset de evaluacion FLEURS (Google), configuracion `ml_in`, split `test`, revision `70bb2e84b976b7e960aa89f1c648e09c59f894dd`: https://huggingface.co/datasets/google/fleurs
