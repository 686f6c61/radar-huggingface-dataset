# adventists-ai/MOSS-Transcribe-Diarize-Whisper-Encoder

## Resumen

MOSS-Transcribe-Diarize-Whisper-Encoder es el encoder de audio del modelo OpenMOSS-Team/MOSS-Transcribe-Diarize, reempaquetado por adventists-ai como un `WhisperModel` estandar de la libreria `transformers` (configuracion con d_model 1024, 24 capas y 80 bins mel). Su funcion no es transcribir texto por si mismo, sino producir representaciones acusticas que alimentan a un LLM congelado a traves de un conector DuplexJev. Los pesos son exactamente los del submodulo `whisper_encoder` del modelo original, sin modificacion alguna: el autor indica que al recargar se obtienen salidas identicas al encoder de origen (diferencia maxima 0).

El modelo tiene 307.216.384 parametros (unos 307 M) y un repositorio de 0,6 GB en formato safetensors bajo licencia Apache-2.0. Se publica en el pipeline `automatic-speech-recognition`, aunque conviene subrayar que es un componente de un sistema mayor, no un sistema ASR completo: el reconocimiento, la diarizacion y la transcripcion final dependen del LLM que recibe las representaciones. Los archivos de tokenizer se copian de `openai/whisper-small` unicamente para que el processor de Whisper pueda cargarse, no porque se usen para decodificar.

Su relevancia actual es la de pieza reutilizable dentro del ecosistema DuplexJev: los conectores `DuplexJev-B[-Para]-MOSS-Transcribe-*` lo recuperan automaticamente mediante `Decider.from_pretrained(...)`. Para quien quiera aprovechar el encoder acustico de MOSS-Transcribe-Diarize sin arrastrar todo el modelo, este repositorio ofrece un formato compatible con `transformers`. El contrapeso es que se trata de una publicacion reciente (creada el 27 de septiembre de 2026) con cero descargas, cero likes y sin resultados de ASR publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo Whisper (configuracion `WhisperModel`), 24 capas, d_model 1024, 80 bins mel |
| Parametros totales | 307.216.384 (unos 307 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica como modelo de lenguaje. Ventana de audio no especificada en la model card; la configuracion con 80 bins mel sigue la convencion de Whisper (ventanas de 30 s), dato no confirmado por el autor |
| Tipos de cuantizacion | No disponible: no se publican variantes cuantizadas ni GGUF. El repositorio contiene safetensors de 0,6 GB, lo que corresponde aproximadamente a 2 bytes por parametro (fp16/bf16) |
| Idiomas soportados | No disponible. Es un encoder acustico; la cobertura linguistica efectiva depende del LLM conector y del modelo original |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`transformers`) |
| Tamano del repositorio | 0,6 GB |
| Modelo base | OpenMOSS-Team/MOSS-Transcribe-Diarize (finetune/repackaging) |
| Autor | adventists-ai |
| Fecha de creacion | 27 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder de Whisper con 24 capas y dimension de modelo 1024, lo que situa el bloque en la escala de Whisper-medium pero unicamente en su mitad encoder. Los pesos se copian sin cambios desde `model.encoder.*` del modelo original MOSS-Transcribe-Diarize, por lo que no hay un entrenamiento nuevo asociado a este repositorio: se trata de un reempaquetado de pesos preexistentes. El autor verifica la equivalencia funcional con el encoder de origen (diferencia maxima 0 al recargar).

No se documenta en la model card el volumen de datos de entrenamiento, la composicion del dataset, ni si el modelo original utilizo RLHF, DPO u otras tecnicas de alineacion. Tampoco se detallan innovaciones propias de este repositorio mas alla del empaquetado: no hay decodificacion especulativa, atencion lineal ni mecanismos de compresion de contexto. La unica pieza diferencial es la integracion con los conectores DuplexJev, que permiten enganchar este encoder congelado a un LLM tambien congelado y evaluar el sistema resultante en tareas de diarizacion y transcripcion. El informe tecnico asociado al modelo original es arXiv:2601.01554 (MOSS Transcribe Diarize Technical Report, MOSI.AI, 2026).

## Capacidades

- Extraccion de representaciones acusticas: genera estados ocultos de ultima capa a partir de caracteristicas mel de 80 bins, listos para pooling y para alimentar una cabeza auxiliar o un conector hacia un LLM.
- Discriminacion de genero del hablante: en una sonda lineal sobre estados con mean pooling alcanza un 99,0 % de precision (3.000 clips de entrenamiento, 800 de test).
- Clasificacion de emociones en cuatro clases: 88,2 % de precision bajo el mismo protocolo de sonda lineal.
- Base para diarizacion y transcripcion: forma parte del sistema MOSS-Transcribe-Diarize, cuyo objetivo declarado es transcribir y diarizar simultaneamente cuando se combina con el LLM conector.
- Integracion con DuplexJev: los conectores `DuplexJev-B[-Para]-MOSS-Transcribe-*` cargan este encoder automaticamente mediante `Decider.from_pretrained`, sin necesidad de gestion manual de pesos.
- Compatibilidad con `transformers`: al exponerse como `WhisperModel`, se puede usar con la API estandar de la libreria y con cualquier utilidad que consuma processors de Whisper.
- Uso como extractor congelado: al ser un encoder de 307 M, es viable entrenar unicamente cabezas o adaptadores ligeros por encima sin ajustar los pesos.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades de agente: no es un modelo de lenguaje y no produce tokens de texto.

## Casos de uso

- Diarizacion de reuniones y llamadas: el encoder produce representaciones por segmento que un conector DuplexJev envia a un LLM congelado, permitiendo etiquetar quien habla en cada turno sin reentrenar el bloque acustico.
- Analisis de emocion en centros de contacto: con 88,2 % de precision en cuatro clases, sirve para detectar clientes frustrados o agentes desbordados y enrutar la llamada a supervision. Conviene validar la sonda con datos propios antes de automatizar decisiones sensibles.
- Moderacion y clasificacion de locutor: los 99,0 % de precision en genero permiten enrutar audio por perfil de voz, aunque esta tarea es sensible y exige revision de sesgos por tipo de voz y acento.
- Preprocesado en pipelines ASR existentes: al cargarse como `WhisperModel` en `transformers`, se puede insertar como extractor de caracteristicas dentro de un pipeline que ya use processors de Whisper, sustituyendo al encoder original por este reempaquetado.
- Investigacion en representaciones acusticas: los estados de ultima capa con mean pooling constituyen una linea base reproducible para comparar sondas de hablante, emocion, idioma o ruido frente a otros encoders como Whisper-large-v3-turbo o Qwen3-ASR-0.6B.
- Sistemas de transcripcion duplex en tiempo real: al formar parte del ecosistema DuplexJev, encaja en arquitecturas que alternan escucha y generacion, donde el encoder congelado reduce el coste de computo y memoria frente a ajustar el sistema completo.
- Subtitulado con atribucion de hablante: combinado con el LLM conector, permite generar subtitulos que marcan turnos de palabra, util en accesibilidad de contenido audiovisual.
- Extraccion de embeddings de audio para busqueda: los vectores pooled pueden indexarse para recuperar fragmentos de audio por similitud, por ejemplo localizar todas las intervenciones de un hablante concreto en un archivo largo.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible provienen de una sonda lineal sobre estados de ultima capa con mean pooling, evaluada con 3.000 clips de entrenamiento y 800 de test. No son resultados de ASR y no deben interpretarse como calidad de transcripcion.

| Modelo | Genero de hablante (precision) | Emocion, 4 clases (precision) |
|---|---|---|
| MOSS-Transcribe-Diarize-Whisper-Encoder | 99,0 % | 88,2 % |
| Qwen3-ASR-0.6B | 99,2 % | 90,9 % |
| Whisper-large-v3-turbo | 88,4 % | 82,8 % |

No se han publicado resultados de benchmarks de reconocimiento de voz (WER/CER), diarizacion (DER) ni de comprension de audio en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el repositorio de pesos ocupa 0,6 GB, lo que sugiere precision de 16 bits. En fp16, el peso del modelo ronda los 0,6 GB y el consumo pico con lotes modestos de audio se situa aproximadamente entre 1 y 2 GB. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria. Una RTX 3060, RTX 4060 o superior es mas que suficiente; para lotes grandes o procesamiento masivo tiene sentido una RTX 4090, L40S, A100 o H100, aunque el cuello de botella real estara en el LLM conector, no en este encoder.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria suficiente, dado el tamano de 307 M parametros.
- Inferencia en CPU: viable por el tamano y por tratarse de un encoder sin generacion autorregresiva, con latencias mayores que en GPU pero funcionales para procesamiento por lotes.
- Opciones de despliegue: `transformers` con `WhisperModel` es la via confirmada por el autor. La integracion con el ecosistema DuplexJev mediante `Decider.from_pretrained` tambien esta confirmada. No se documentan variantes GGUF, ONNX ni compatibilidad con llama.cpp u Ollama, y al no ser un modelo de lenguaje no aplican los flujos habituales de vLLM o TGI para generacion de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento en sondas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize-Whisper-Encoder | 307 M | No especificada (80 bins mel) | 99,0 % genero / 88,2 % emocion | Apache-2.0 | safetensors en HuggingFace |
| OpenMOSS-Team/MOSS-Transcribe-Diarize | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | Modelo original completo |
| Qwen3-ASR-0.6B | Aproximadamente 0,6 B | No disponible | 99,2 % genero / 90,9 % emocion | No disponible en la informacion proporcionada | Referenciado como comparativa en la model card |
| Whisper-large-v3-turbo | No disponible en la informacion proporcionada | No disponible | 88,4 % genero / 82,8 % emocion | No disponible en la informacion proporcionada | Referenciado como comparativa en la model card |

Las cifras de Qwen3-ASR-0.6B y Whisper-large-v3-turbo proceden de la propia model card de este repositorio y corresponden al mismo protocolo de sonda lineal, por lo que son comparables entre si, pero no equivalen a una evaluacion de calidad de transcripcion. No se dispone de datos de parametros, contexto ni licencia de esos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR de extremo a extremo: no genera texto. Sin un conector y un LLM asociado, su salida son representaciones acusticas que no son legibles por si mismas.
- Los archivos de tokenizer se copian de `openai/whisper-small` solo para que el processor de Whisper cargue. No deben usarse para decodificar ni como indicio del vocabulario real del sistema.
- La sonda de genero alcanza el 99,0 % de precision, pero la clasificacion de genero a partir de la voz es una tarea sensible: existen voces que no encajan en el binario esperado y el conjunto de evaluacion no esta descrito, por lo que el sesgo real es desconocido.
- El conjunto de evaluacion (3.000 clips de entrenamiento, 800 de test) no se describe en cuanto a idiomas, acentos, duracion, dominio ni condiciones de ruido. La generalizacion fuera de ese dominio no esta demostrada.
- No se han publicado resultados de WER, DER ni de comprension de audio, de modo que no hay evidencia publica sobre la calidad de transcripcion o diarizacion del sistema completo.
- No se documentan sesgos, composicion del dataset de entrenamiento ni procesos de alineacion del modelo original.
- El repositorio acumula cero descargas y cero likes, y fue creado en septiembre de 2026. Es un artefacto sin validacion independiente por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero exige conservar los avisos de copyright y atribucion. El autor recuerda expresamente que los pesos pertenecen a MOSS-Transcribe-Diarize, desarrollado por MOSI.AI / OpenMOSS, y pide citar el informe tecnico arXiv:2601.01554.
- No se publican variantes cuantizadas ni formatos alternativos, lo que limita su uso en entornos que dependan de GGUF u ONNX.
- La ventana de audio soportada no se especifica de forma explicita; asumir 30 segundos por convencion de Whisper es una inferencia, no un dato confirmado por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/adventists-ai/MOSS-Transcribe-Diarize-Whisper-Encoder
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio de codigo DuplexJev: https://github.com/adventists-ai/duplexjev
- Informe tecnico del modelo original: https://arxiv.org/abs/2601.01554
- Tokenizer de referencia usado para el processor: https://huggingface.co/openai/whisper-small
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; el resto de enlaces disponibles son los indicados arriba.
