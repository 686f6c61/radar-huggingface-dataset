# elabora/wav2vec2-large-xlsr-53-french

## Resumen

Este repositorio, `elabora/wav2vec2-large-xlsr-53-french`, **no contiene un modelo**: es un espejo (mirror) de un unico fichero, `vocab.json` de 560 bytes, que es el vocabulario de caracteres CTC del modelo de reconocimiento automatico del habla en frances `jonatasgrosman/wav2vec2-large-xlsr-53-french`. Lo mantiene Elabora, una herramienta de autoría de modulos de e-learning basada en agentes de IA, que descarga ese fichero en el ordenador del autor y verifica su SHA-256 antes de usarlo. El objetivo es congelar exactamente los bytes con los que se probo el sistema, ante el riesgo de que el repositorio original (propiedad de un particular) se renombre o se elimine.

El modelo subyacente es un wav2vec 2.0 large (XLSR-53) afinado para transcripcion de voz en frances sobre los splits de entrenamiento y validacion de Mozilla Common Voice 6.1, con creditos de GPU de OVHcloud. La arquitectura base la publico Facebook AI como `facebook/wav2vec2-large-xlsr-53` bajo licencia Apache-2.0, y el ajuste fino lo realizo Jonatas Grosman en 2021. Es, por tanto, un sistema CTC no autoregresivo, no un modelo de lenguaje: no genera texto libre ni admite prompts.

Su relevancia practica es la de un ASR ligero y desplegable en local (unos 317 M de parametros en la arquitectura base; el dato no se confirma en la informacion proporcionada) que puede ejecutarse en CPU mediante ONNX, y cuya utilidad depende de obtener los pesos desde el repositorio original o desde el espejo ONNX int8 de Elabora, no desde este repositorio de vocabulario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 large (XLSR-53): codificador convolucional de features + transformer + cabeza CTC lineal; no autoregresiva |
| Parametros totales | del orden de 317 M para la arquitectura wav2vec 2.0 large (dato de la arquitectura base, no confirmado en la informacion proporcionada); este repositorio no incluye pesos |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de los modelos de lenguaje: al ser CTC, procesa el audio en una pasada y el limite practico lo fija el campo receptivo del codificador (decenas de segundos a 16 kHz; valor exacto no disponible) |
| Tipos de cuantizacion | no disponible en este repositorio; existe un espejo ONNX con cuantizacion int8 de Elabora (`elabora/wav2vec2-large-xlsr-53-french-onnx`) |
| Idiomas soportados | frances (`fr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | este repositorio solo contiene `vocab.json` (JSON, 560 bytes, SHA-256 `e83a3c849e480757fabd9fe927b870581e926407bcc7e1b6dcc8bda1e78a8d78`); los pesos PyTorch estan en el repositorio original y el formato ONNX en el espejo de Elabora |

## Arquitectura y entrenamiento

wav2vec 2.0 combina un codificador convolucional que convierte la onda de audio (16 kHz) en una secuencia de representaciones latentes, un transformer que contextualiza esas representaciones y una cabeza lineal con funcion de perdida CTC que emite caracteres. El preentrenamiento de XLSR-53 se hizo de forma autosupervisada sobre audio de 53 idiomas; despues, el ajuste fino para frances utilizo los splits de entrenamiento y validacion de Mozilla Common Voice 6.1 y anadio un vocabulario de caracteres especifico del frances. Al ser un modelo CTC, la alineacion entre audio y texto es implicita (posterior collapse), lo que permite extraer marcas temporales por caracter o por palabra sin un modelo adicional; de ahi la etiqueta `forced-alignment` del repositorio.

La informacion proporcionada no detalla el numero de tokens de audio, la composicion exacta del corpus, ni si hubo etapas de RLHF o DPO (no aplicables, en principio, a un sistema CTC supervisado). Tampoco se documenta ningun mecanismo de decodificacion especulativa ni de atencion lineal. Este repositorio concreto no aporta nada al entrenamiento: solo replica el vocabulario de caracteres con verificacion criptografica, y el autor declara explicitamente que no se convirtio, reentreno, recomprimio ni renombro ningun fichero.

## Capacidades

- Transcripcion de voz a texto en frances a partir de audio muestreado a 16 kHz.
- Salida a nivel de caracter con decodificacion CTC (greedy o beam search con modelo de lenguaje externo).
- Alineacion forzada audio-texto: obtencion de marcas temporales por caracter o palabra aprovechando la matriz CTC.
- Reconocimiento de habla leida y semileida (dominio Common Voice), con vocabulario abierto de caracteres franceses.
- Ejecucion en CPU o GPU sin dependencias de servicios externos, incluida la variante ONNX int8.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio generation ni modo "thinking": no es un modelo generativo de proposito general.
- Capacidad multilingue: no, el ajuste fino es exclusivamente frances (el modelo base XLSR-53 si es multilingue, pero este checkpoint no).

## Casos de uso

- Subtitulado de material formativo en frances: el modelo transcribe las locuciones de un modulo e-learning y, con alineacion forzada, genera subtitulos con tiempos por palabra para incrustarlos en el SCORM o en el reproductor.
- Generacion de transcripciones para busqueda interna: indexar el audio de cursos y webinars en frances para permitir busqueda textual sobre el contenido hablado, ejecutando la inferencia en local para no enviar audio de alumnos a terceros.
- Verificacion de pronunciacion en herramientas de aprendizaje de idiomas: comparar la secuencia de fonemas/caracteres reconocida con el texto esperado y calcular una puntuacion de error, usando las marcas temporales para senalar el fragmento fallido.
- Control de calidad de locuciones grabadas: detectar silencios, omissiones o palabras mal pronunciadas comparando la transcripcion automatica con el guion previsto en un pipeline de produccion de audio.
- Prototipado rapido de interfaces de voz: comandos y dictado en frances dentro de una aplicacion de escritorio, aprovechando la variante ONNX int8 para funcionar en CPU sin GPU dedicada.
- Preetiquetado de corpus para entrenamiento: transcribir grandes volumenes de audio frances y usar el resultado como punto de partida de una revision humana, reduciendo el coste de anotacion.
- Analisis de entrevistas o grupos focales: pasar el audio a texto con marcas temporales para despues segmentar por participante y aplicar analisis cualitativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio original (segun los resultados de busqueda) solo indica el corpus de ajuste fino (Common Voice 6.1, splits de train y validacion) y el requisito de muestreo a 16 kHz; no se incluye la tasa de error de palabra (WER) ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 y unos 0,65 GB en fp16 para ~317 M de parametros; la variante ONNX int8 del espejo de Elabora ocupa del orden de 0,3-0,4 GB (estimaciones aritmeticas a partir del numero de parametros, no medidas publicadas).
- GPU recomendadas: no requiere GPU. Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1660) e incluso en GPU de 4 GB; para lotes grandes conviene una A100 o H100, pero es innecesario para uso interactivo.
- Cabe en GPU consumer: si, sin problemas, y tambien en CPU: la cuantizacion int8 esta pensada precisamente para inferencia en CPU.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), ONNX Runtime con la variante int8, TorchScript/exportaciones propias, o integracion manual en una aplicacion de escritorio. vLLM y TGI no estan orientados a modelos CTC de ASR y no se documentan como soportados.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de este tamano en GPU moderna suele transcribir audio en tiempo real o mas rapido, pero no hay mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Disponibilidad | WER en frances |
|---|---|---|---|---|---|
| Este espejo (vocabulario de `jonatasgrosman/wav2vec2-large-xlsr-53-french`) | no incluye pesos | no aplica | Apache-2.0 | Hugging Face (solo `vocab.json`) | no disponible |
| `jonatasgrosman/wav2vec2-large-xlsr-53-french` (modelo real) | ~317 M (arquitectura base) | CTC, sin ventana fija | Apache-2.0 | Hugging Face, pesos PyTorch | no disponible |
| `facebook/wav2vec2-large-xlsr-53` (base sin ajuste) | ~317 M | CTC, sin ventana fija | Apache-2.0 | Hugging Face | requiere ajuste fino |
| OpenAI Whisper small | ~244 M | 30 s por ventana, autoregresivo | MIT | Hugging Face, `openai-whisper`, `faster-whisper` | no disponible |
| OpenAI Whisper medium | ~769 M | 30 s por ventana, autoregresivo | MIT | Hugging Face, `openai-whisper`, `faster-whisper` | no disponible |

Las cifras de parametros de Whisper corresponden a la arquitectura conocida; no se han contrastado con la informacion proporcionada y no se dispone de WER comparables para ninguna de las opciones.

## Limitaciones y advertencias

- El repositorio perfilado no es un modelo utilizable: contiene unicamente `vocab.json`. Cualquier intento de cargarlo con `from_pretrained` fallara por falta de pesos y configuracion.
- Es un espejo de un unico fichero, no un seguimiento del repositorio original: si el upstream cambia de revision, este espejo no se actualiza automaticamente.
- Solo frances. El audio en otros idiomas, o con fuerte acento no representado en Common Voice, degradara la transcripcion sin aviso.
- Dominio limitado a habla leida de Common Voice 6.1: el rendimiento cae en audio espontaneo, telefonico, con ruido de fondo, solapamiento de hablantes o jerga tecnica.
- Salida CTC a nivel de caracter: sin puntuacion, sin mayusculas reales y sin normalizacion ortografica fiable; requiere postprocesado si se necesita texto formateado.
- Riesgo de alucinacion en el sentido de inserciones plausibles en tramos con ruido, silencio o musica; la decodificacion CTC puede emitir caracteres espurios.
- Requiere audio a 16 kHz mono; el remuestreo mal hecho introduce errores silenciosos.
- La licencia Apache-2.0 permite uso comercial, pero el espejo se distribuye "AS IS" y el upstream no incluye fichero NOTICE; conviene conservar la atribucion a Jonatas Grosman y a Facebook AI (wav2vec 2.0 / XLSR-53).
- El contenido de este repositorio lo ha anadido Elabora (LICENSE y la propia model card); la autoria del modelo no es suya y no reclama ningun merito sobre el.
- Verificar siempre el SHA-256 del fichero descargado antes de usarlo en produccion.

## Enlaces

- Repositorio perfilado (espejo de `vocab.json`): https://huggingface.co/elabora/wav2vec2-large-xlsr-53-french
- Espejo ONNX int8 de Elabora: https://huggingface.co/elabora/wav2vec2-large-xlsr-53-french-onnx
- Modelo original (Jonatas Grosman, revision `7c79e105a6525d38e1e69f640b974b4a679723cc`): https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-french
- Modelo base (Facebook AI, wav2vec 2.0 / XLSR-53): https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Ficha en Inferix: https://inferix.co/models/jonatasgrosman/wav2vec2-large-xlsr-53-french
- Ficha en AIBase: https://model.aibase.com/models/details/1915693118667776002
- Texto de la licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0
- Herramienta de Elabora (mantenedor del espejo): https://elabora.studio
- Cita del modelo (BibTeX, segun la model card): `@misc{grosman2021xlsr53-large-french, title={Fine-tuned XLSR-53 large model for speech recognition in French}, author={Grosman, Jonatas}, year={2021}}`
