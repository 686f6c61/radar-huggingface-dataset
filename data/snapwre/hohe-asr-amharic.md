# snapwre/hohe-asr-amharic

## Resumen

hohe-asr-amharic es un modelo de reconocimiento automatico del habla (ASR) especializado en amharico, publicado por el usuario snapwre en HuggingFace. Se trata de un ajuste fino con cabeza CTC sobre badrex/Ethio-ASR-multilingual-600M, un encoder wav2vec2-BERT de 606.104.800 parametros. El modelo convierte audio de amharico en texto en una sola pasada sobre la señal, sin generacion autoregresiva palabra a palabra, lo que segun su autor lo hace aproximadamente cinco veces mas rapido que un Whisper de precision similar y elimina las alucinaciones tipicas de los decodificadores generativos cuando no hay voz.

El entrenamiento se realizo sobre 880 horas de audio en amharico que cubren habla dialectal de cinco regiones, habla leida, broadcast y entrevistas, grabaciones telefonicas y conversacion espontanea. El modelo esta pensado para audio real: se entreno atravesando ruido, reverberacion de sala y conversiones a lineas telefonicas de 8 kHz tipo A-law, con clips de hasta un minuto. El autor declara un 16,11 % de WER y un 5,37 % de CER en su conjunto de test interno (hablantes no vistos en entrenamiento) usando el modelo de lenguaje de 5-gramos incluido en el repositorio.

Su relevancia actual es doble. Por un lado, es uno de los pocos modelos abiertos especificamente orientados al amharico, un idioma con recursos limitados y habitualmente mal cubierto por los sistemas ASR multilingues. Por otro lado, sus numeros en habla dialectal (16,06 % de WER) y en audio telefonico de 8 kHz (16,87 %) lo situan por delante del modelo abierto de amharico mas fuerte que el autor pudo localizar (27,70 % de WER y 31,00 % en dialecto en el mismo conjunto de evaluacion), con la salvedad de que en conversacion espontanea de podcast el modelo rival es algo mejor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-BERT (extractor convolucional de audio mas encoder transformer) con cabeza de clasificacion CTC |
| Parametros totales | 606.104.800 (unos 606 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | clips de audio de hasta 60 segundos; ventana de atencion del encoder no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, int8 ni int4 |
| Idiomas soportados | amharico (codigo `am`) unicamente |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (libreria `transformers`, clase `AutoModelForCTC`); incluye un modelo de lenguaje de 5-gramos en el directorio `lm/` |
| Entrada de audio | 16 kHz mono, sin puntuacion ni capitalizacion en la salida |
| Modelo base | badrex/Ethio-ASR-multilingual-600M |
| Tamano del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `badrex/Ethio-ASR-multilingual-600M`, un encoder wav2vec2-BERT de 600 M de parametros, al que se anade una cabeza lineal CTC. No hay decodificacion autoregresiva ni vocabulario de generacion: la red produce directamente una secuencia de etiquetas por fotograma y el texto se obtiene con decodificacion greedy o con decodificacion por haz apoyada en un modelo de lenguaje. Sobre el checkpoint base se aplico un ajuste fino continuado, es decir, partiendo de un ajuste anterior del mismo autor en lugar de reiniciar desde el modelo original. El entrenamiento consistio en dos epocas sobre un 60 % fresco del conjunto de entrenamiento en cada pasada, repitiendo ademas los datos conversacionales, con tasa de aprendizaje 2e-5 y 300 pasos de calentamiento. La seleccion de checkpoints se hizo sobre datos de desarrollo combinando habla leida y conversacion.

Los datos suman 880 horas de amharico, filtradas previamente por ancho de banda, sonoridad, recorte (clipping), silencio y acuerdo entre la transcripcion original y la de un modelo independiente. La composicion declarada es: 477 horas de habla dialectal de cinco regiones, 283 horas de habla leida, 34 horas de broadcast y entrevistas, 38 horas grabadas por colaboradores mediante un bot de Telegram, 25 horas de conversacion con transcripciones acordadas por dos modelos independientes y 2 horas de conversacion corregida manualmente. Se mantuvieron deliberadamente ruido de fondo, eco de sala, audio telefonico de 8 kHz, dialectos y clips de hasta un minuto; se descarto audio demasiado limitado en banda, grabaciones recortadas, clips con poca voz y transcripciones claramente incorrectas. Un 30 % de los clips de entrenamiento pasaron por una ida y vuelta de 8 kHz A-law, lo que explica que el resultado en linea telefonica (16,87 % de WER con LM) quede cerca del conjunto limpio (16,11 %).

El repositorio incluye un modelo de lenguaje de 5-gramos entrenado sobre texto amharico que, segun el autor, aporta alrededor del 14 % de la reduccion de errores de palabra. Sus dos pesos de interpolacion (`alpha` y `beta`) se ajustaron solo sobre datos de desarrollo y estan en `lm/decoder.json`. La decodificacion con el LM se realiza con `pyctcdecode` y requiere el binario de KenLM. El modelo emite una etiqueta `[AMH]` al inicio de la salida que debe eliminarse antes de usar el texto.

## Capacidades

- Reconocimiento de voz en amharico con salida en escritura ge'ez, en una sola pasada sobre el audio completo del clip.
- Robustez a audio telefónico de 8 kHz (A-law), ruido de fondo y reverberacion de sala, condiciones incluidas explicitamente en el entrenamiento.
- Cobertura de habla dialectal de cinco regiones de Etiopia; el subconjunto evaluado de Addis Ababa, Gojjam y Wello obtiene 4,16 % de CER y 16,06 % de WER con LM.
- Procesamiento de clips de hasta un minuto de duracion, lo que permite transcribir fragmentos largos sin segmentacion externa agresiva.
- Decodificacion greedy sin modelo de lenguaje o decodificacion por haz con el 5-gramos incluido, con reduccion medible del error (por ejemplo, de 18,70 % a 16,11 % de WER en el test interno).
- Comportamiento conservador ante silencio: al no ser autoregresivo, no genera frases inventadas cuando nadie habla.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generation ni modo de razonamiento. Es exclusivamente un modelo de transcripcion.
- No realiza puntuacion, mayusculas ni conversion de numeros a digitos: los numeros se escriben con letras (por ejemplo, «12» se devuelve como አስራ ሁለት), por lo que requieren postprocesado.
- No gestiona hablantes solapados: asume una sola voz en cada instante.

## Casos de uso

- Atencion al cliente por telefonia (IVR): el modelo esta entrenado con un 30 % de clips pasados por un codec 8 kHz A-law y rinde un 16,87 % de WER en esa condicion, por lo que puede transcribir llamadas entrantes para clasificarlas, enrutarlas o alimentar busquedas internas sin necesidad de un modelo distinto para telefonia.
- Transcripcion de broadcast y entrevistas: las 34 horas de broadcast y entrevista del entrenamiento y los 4,16 % de CER en habla dialectal lo hacen adecuado para generar subtitulos y archivos indexables de radio y television etiope.
- Generacion de conjuntos de datos ASR: al ser un modelo abierto con licencia CC-BY-4.0, puede usarse para pseudo-etiquetar horas de audio amharico y alimentar el entrenamiento de otros sistemas, revisando despues las transcripciones con el filtro de calidad correspondiente.
- Busqueda por voz sobre archivos de audio: con decodificacion greedy y sin LM, la transcripcion es rapida y suficiente para indexar y buscar palabras clave en archivos historicos o periodisticos, donde no se requiere transcripcion literal perfecta.
- Sistemas de dictado y captura de notas en campo: los clips de hasta un minuto permiten dictar informes breves en entornos con ruido, y el modelo devuelve texto en ge'ez que puede postprocesarse para eliminar la etiqueta `[AMH]` y convertir numeros.
- Accesibilidad y documentacion de contenido oral: transcripcion de entrevistas, charlas y material educativo en amharico para publicar versiones textuales, con la ventaja de que el modelo no inventa contenido durante los silencios y genera menos texto espurio que un modelo generativo.
- Borradores de transcripcion de podcast con revision humana: en conversacion espontanea el WER ronda el 47 %, lo que descarta el uso sin supervision, pero sigue siendo util para producir un borrador que una persona corrige, tarea en la que ahorra tiempo frente a la transcripcion manual.
- Despliegue en el borde o en CPU: con 606 M de parametros y pesos de unos 2,4 GB en fp32, el modelo puede ejecutarse en servidores sin GPU para cargas por lotes de baja concurrencia.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor. Las metricas estan calculadas a nivel de corpus, tras la normalizacion habitual del amharico (homonimos ge'ez plegados y puntuacion eliminada). La columna greedy corresponde al modelo sin modelo de lenguaje; la columna +LM, con el 5-gramos incluido. El model-index declara los valores de FLEURS como no verificados.

| Conjunto de test | Descripcion | CER | WER | CER +LM | WER +LM |
|---|---|---|---|---|---|
| Test interno del autor | 1.548 clips, 105 hablantes, ninguno en entrenamiento | 0,0589 | 0,1870 | 0,0537 | 0,1611 |
| El mismo, por linea telefonica | 8 kHz A-law, condicion de IVR | 0,0633 | 0,1987 | 0,0573 | 0,1687 |
| Dialecto | Addis Ababa, Gojjam, Wello | 0,0433 | 0,1732 | 0,0416 | 0,1606 |
| FLEURS am_et | benchmark publico, habla leida | 0,0628 | 0,1786 | 0,0599 | 0,1604 |
| Podcast corregido a mano | conversacion espontanea | 0,2991 | 0,4964 | 0,2979 | 0,4707 |
| Conversacion reservada | episodios de podcast no vistos en entrenamiento | 0,0659 | 0,1959 | 0,0660 | 0,1811 |

Valores de referencia declarados por el autor en el mismo conjunto de test y con el mismo sistema de puntuacion: el modelo abierto de amharico mas fuerte que pudo localizar obtiene 0,1052 de CER y 0,2770 de WER en el test interno, y 0,1327 de CER y 0,3100 de WER en dialecto. En conversacion espontanea de podcast ese modelo rival baja a 0,2865 de CER, ligeramente por delante de este. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,5-3 GB en fp32 con un clip corto, alrededor de 1,3-1,8 GB en fp16 y por debajo de 1 GB si se aplica cuantizacion dinamica int8. El repositorio ocupa 3,0 GB en disco.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, asi como en tarjetas de 4-6 GB (GTX 1650, RTX 3050) si se usa fp16 o int8.
- GPU de centro de datos recomendadas para lotes grandes o alta concurrencia: A100 40/80 GB, H100, L40S, A10G. Para una sola peticion no son necesarias; su ventaja es el throughput agregado.
- Inferencia en CPU viable para cargas por lotes de baja concurrencia, con latencias mayores pero sin requisitos de VRAM.
- Opciones de despliegue: `transformers` con `AutoModelForCTC` y `AutoProcessor` (ruta oficial documentada), `pyctcdecode` mas KenLM para decodificacion con el 5-gramos, PyTorch o `torch.inference_mode`, y exportacion a ONNX o TorchScript, que no esta documentada pero es factible en un encoder de este tipo. La model card incluye la etiqueta `endpoints_compatible`, por lo que deberia poder desplegarse en HuggingFace Inference Endpoints. No hay soporte documentado en llama.cpp, Ollama, vLLM ni TGI, formatos y motores orientados a decodificadores generativos.
- Latencia y throughput: el autor indica que el modelo es aproximadamente cinco veces mas rapido que un Whisper de precision similar por su decodificacion en una sola pasada. No se publican medidas de RTF, latencia por clip ni throughput en clips por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Resultados declarados |
|---|---|---|---|---|---|
| hohe-asr-amharic | 606 M | clips de hasta 60 s | amharico | CC-BY-4.0 | 16,11 % WER / 5,37 % CER en test interno con 5-gramos |
| badrex/Ethio-ASR-multilingual-600M (modelo base) | 600 M | no disponible | multilingue etiope | no disponible | no disponible |
| Whisper large-v3 | 1.550 M | ventanas de 30 s | multilingue, incluye amharico | licencia abierta de OpenAI | no disponible en la informacion proporcionada |
| Mejor modelo abierto de amharico consultado por el autor (sin nombrar) | no disponible | no disponible | amharico | no disponible | 27,70 % WER / 10,52 % CER en el test interno; 31,00 % WER / 13,27 % CER en dialecto |

La comparacion no puede cerrarse con datos homogeneos: el autor no publica los resultados de Whisper ni del modelo base en su propio conjunto de evaluacion, y las cifras del modelo rival solo se citan de forma agregada, sin nombre ni configuracion. Todo lo anterior procede de la model card y no esta verificado de forma independiente.

## Limitaciones y advertencias

- Conversacion espontanea: alrededor del 47 % de WER en audio de podcast. Es util para busqueda o para borradores que una persona corrige, no para transcripcion sin supervision.
- Numeros: se escriben con letras por influencia del texto de entrenamiento. Cualquier sistema que necesite cifras debe convertirlas en un paso posterior.
- Puntuacion y mayusculas: no las genera. Las frases vuelven como secuencias de palabras sin estructura grafica.
- Hablantes solapados: el modelo asume una sola voz por instante. Dos personas hablando a la vez producen salidas degradadas.
- Idioma: solo amharico. Audio en oromo, tigrinya o ingles no produce un error explicito, sino texto con apariencia amharica sin sentido, lo que complica la deteccion automatica de idioma incorrecto.
- Alucinacion: el riesgo es bajo, ya que el modelo no es autoregresivo y no inventa frases durante el silencio, pero si puede producir salidas incorrectas en audio muy degradado o fuera de dominio.
- Etiqueta de salida: el modelo escribe `[AMH]` al inicio del texto; hay que eliminarla antes de mostrar o almacenar la transcripcion.
- Decodificacion con LM: requiere `pyctcdecode` y el binario de KenLM, lo que anade dependencias y complica un despliegue minimo; los pesos `alpha` y `beta` estan en `lm/decoder.json`.
- Licencia: CC-BY-4.0 permite uso comercial, pero obliga a atribuir la autoria y a indicar la licencia, y no concede garantias.
- Metricas sin verificar: el model-index marca los resultados de FLEURS como `verified: false` y todos los numeros proceden del propio autor.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, es el primer modelo de la familia Hohe y no se ha publicado todavia validacion externa.
- La busqueda web realizada no devolvio ninguna fuente relacionada con este modelo; los resultados obtenidos trataban de psicologia del desarrollo y no aportan informacion tecnica.

## Enlaces

- HuggingFace: https://huggingface.co/snapwre/hohe-asr-amharic
- Modelo base: https://huggingface.co/badrex/Ethio-ASR-multilingual-600M
- Conjunto de evaluacion publico citado: https://huggingface.co/datasets/google/fleurs (configuracion `am_et`)
- Herramienta de decodificacion con modelo de lenguaje: pyctcdecode (biblioteca de Python, disponible en PyPI y en GitHub)
- Resultados de evaluacion reproducibles: archivo `eval/results.json` dentro del repositorio del modelo
- Configuracion del 5-gramos: archivo `lm/decoder.json` dentro del repositorio del modelo
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.
