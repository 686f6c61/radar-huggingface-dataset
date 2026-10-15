# Sanghyang00/ELARSpeech-Whisper-Large-v3-beg

## Resumen

ELARSpeech-Whisper-Large-v3-beg es un modelo de reconocimiento automatico del habla (ASR) obtenido por ajuste fino de openai/whisper-large-v3 sobre el idioma belait (codigo ISO 639-3: beg), una lengua de bajos recursos. Lo publica el usuario Sanghyang00 dentro del proyecto ELARSpeech, cuyo objetivo es exportar checkpoints ASR para lenguas con poca presencia en los corpus multilingues habituales. El modelo conserva la arquitectura original de Whisper (encoder-decoder transformer) con 1.543.491.840 parametros reales en safetensors y un tamano de repositorio de 6,2 GB.

Su relevancia es doble. Por un lado, cubre una lengua para la que practicamente no existen sistemas ASR publicos, de modo que permite transcripcion automatica alli donde antes solo habia trabajo manual. Por otro, mantiene la interfaz estandar de transformers (WhisperForConditionalGeneration mas WhisperProcessor), lo que facilita su integracion en pipelines existentes construidos alrededor de Whisper.

El detalle practico mas importante es que el modelo espera un token de idioma explicito en el prompt del decodificador ("<|beg|>") en lugar del parametro language= de la API de generacion. La model card indica que el artefacto exportado se verifico contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con resultado PASS en transcripcion exacta, aunque no se publican cifras de error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s (128 canales mel, 3000 frames reducidos a 1500 posiciones en el encoder); contexto del decodificador de 448 tokens |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo contiene pesos safetensors (FP32/BF16). Compatible con cuantizacion posterior a int8/int4 mediante CTranslate2 o GGML/GGUF tras conversion |
| Idiomas soportados | Belait (beg), monolingue |
| Licencia | no disponible (la model card remite a las condiciones del proyecto ELARSpeech y a la licencia del modelo base) |
| Formato de pesos | safetensors (repositorio de 6,2 GB) |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Modelo base | openai/whisper-large-v3 |
| Fecha de publicacion | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un encoder transformer que consume espectrogramas mel de 128 canales sobre ventanas de 30 segundos y un decoder autorregresivo que genera tokens de transcripcion condicionados por tokens especiales de tarea e idioma. El cambio respecto al modelo base es el vocabulario efectivo de idioma: el ajuste introduce y entrena el token "<|beg|>", de modo que la generacion debe forzarse con un prompt explicito de decodificador que contenga ese token junto a "<|transcribe|>" y "<|notimestamps|>".

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus de belait, el numero de pasos ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado clasico. El unico dato de validacion publicado es cualitativo: la verificacion de transcripcion exacta contra el checkpoint original de ELARSpeech sobre un conjunto de evaluacion fijo arroja estado PASS. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion) mas alla del ajuste de dominio linguistico.

## Capacidades

- Transcripcion de voz a texto monolingue en belait, con audio de entrada mono a 16 kHz.
- Generacion de transcripciones sin marcas de tiempo gracias al token "<|notimestamps|>" en el prompt de decodificacion.
- Control explicito del idioma de salida mediante el token "<|beg|>" en el decodificador, lo que permite reproducir exactamente el comportamiento del checkpoint exportado.
- Segmentacion por ventanas de 30 segundos, lo que permite procesar audios de duracion arbitraria mediante concatenacion de ventanas.
- Compatibilidad con el ecosistema transformers (WhisperProcessor, batch_decode) y con las herramientas de inferencia que aceptan WhisperForConditionalGeneration.
- No se documenta soporte de traduccion a otros idiomas, tool calling, function calling, razonamiento multi-paso, vision ni audio con hablantes multiples (diarizacion).

## Casos de uso

- Transcripcion de archivos orales en belait: digitalizacion de grabaciones de campo, entrevistas o tradicion oral con un unico modelo, evitando el trabajo manual alli donde no existen sistemas comerciales que cubran esta lengua.
- Documentacion linguistica: generacion de transcripciones base que el investigador corrige despues, reduciendo el tiempo de anotacion de corpus en una lengua de bajos recursos.
- Subtitulado de video en belait: procesado por ventanas de 30 s con salida sin marcas de tiempo y posterior alineacion con herramientas externas de segmentacion.
- Busqueda por palabras clave sobre archivos de audio: transcripcion en lote de una fonoteca y indexacion del texto resultante para recuperacion de fragmentos concretos.
- Asistentes de voz o interfaces habladas de ambito local: entrada de comandos por voz en belait integrada en aplicaciones comunitarias o educativas.
- Accesibilidad en servicios publicos: transcripcion de atenciones grabadas o de mensajes de voz de usuarios que se expresan en belait.
- Investigacion comparativa en ASR de bajos recursos: punto de partida para experimentos de ajuste fino adicional, destilacion o evaluacion de tecnicas de adaptacion sobre lenguas austronesias poco representadas.
- Preanotacion en proyectos de crowdsourcing: generacion de borradores automaticos que despues se validan por hablantes nativos, con el consiguiente ahorro de coste por hora de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni comparaciones numericas con otros sistemas; solo indica que la verificacion de transcripcion exacta frente al checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion tiene estado PASS, sin detallar el tamano de ese conjunto ni su composicion.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 3,1 GB solo para pesos, mas memoria de activaciones y cache del decodificador; en la practica cabe con comodidad en GPUs de 6-8 GB.
- VRAM estimada en FP32: aproximadamente 6,2 GB de pesos; en GPUs de 8 GB conviene usar FP16 o cuantizacion.
- VRAM estimada con cuantizacion int8 (tras conversion a CTranslate2): del orden de 1,6-2 GB, lo que permite despliegue en GPUs de gama baja o en CPU.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia en tiempo real con lotes; A100 o H100 solo resultan utiles para procesado masivo en lote, no por requisito de memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas en FP16, y en GPUs de 4 GB si se cuantiza.
- Opciones de despliegue: transformers (ruta oficial documentada en la model card), vLLM para servir WhisperForConditionalGeneration, y CTranslate2/faster-whisper o whisper.cpp/GGML previa conversion del checkpoint. La conversion a formatos que dependen de una lista fija de idiomas exige comprobar que el token "<|beg|>" se conserva, ya que el prompt de decodificacion explicito es imprescindible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del hardware, de num_beams y del uso de cuantizacion; num_beams=1, como en el ejemplo de la model card, es la configuracion mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Notas |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-beg | 1.543.491.840 | Belait (beg) | Ventana de 30 s | no disponible | Ajuste fino monolingue sobre whisper-large-v3; requiere prompt con "<|beg|>" |
| openai/whisper-large-v3 | ~1.550 M | 99 idiomas, con traduccion a ingles | Ventana de 30 s | la del repositorio del modelo base | Modelo generalista; el belait no figura entre sus idiomas soportados de forma explicita |
| openai/whisper-large-v3-turbo | ~809 M | 99 idiomas | Ventana de 30 s | la del repositorio del modelo base | Version destilada del decoder, mas rapida y con menos parametros |
| facebook/mms-1b-all | ~1.000 M | mas de 1100 idiomas, con adaptadores por lengua | Ventana corta por adaptador | CC-BY-NC 4.0 (uso no comercial) | Alternativa para lenguas de bajos recursos, con restricciones de licencia para produccion |

No se dispone de comparaciones de WER entre estos modelos y ELARSpeech-Whisper-Large-v3-beg; la tabla recoge unicamente caracteristicas estructurales y de licencia. La cifra de parametros del modelo base se incluye como referencia de catalogo.

## Limitaciones y advertencias

- Modelo monolingue: no traduce ni transcribe idiomas distintos del belait; forzar otros idiomas degrada la salida.
- La exactitud varia segun las condiciones de grabacion, la poblacion de hablantes, la ortografia empleada y el dominio; asi lo advierte la propia model card.
- Es obligatorio remuestrear el audio a 16 kHz mono antes de la inferencia.
- El parametro language= de generate() no reproduce el comportamiento del checkpoint exportado; hay que usar el prompt explicito con "<|beg|>", "<|transcribe|>" y "<|notimestamps|>".
- Riesgo de alucinacion: como cualquier modelo de la familia Whisper, puede generar texto plausible en tramos con ruido, silencio o audio fuera de dominio, especialmente en lenguas con pocos datos de entrenamiento.
- Sesgos: no se documenta la composicion demografica ni dialectal del corpus de ajuste, por lo que se desconoce el sesgo respecto a variedades, edad o genero de los hablantes.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Antes de un despliegue en produccion hay que verificar las condiciones del proyecto ELARSpeech y la licencia del modelo base.
- El modelo apenas tiene traccion en el repositorio (0 descargas, 0 likes en el momento de redactar esta ficha), de modo que no existe validacion independiente por parte de la comunidad.
- No se documentan soporte de diarizacion, marcas de tiempo fiables ni transcripcion en streaming; el procesado es por ventanas de 30 segundos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-beg
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- No se han encontrado enlaces al paper, blog, repositorio o demo del proyecto ELARSpeech en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo ni con el reconocimiento automatico del habla.
