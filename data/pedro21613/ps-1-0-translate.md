# Pedro21613/PS-1.0-translate

## Resumen

PS-1.0-translate (identificado en la model card como «PS 1.0 Translate — v1.1») es un modelo de reconocimiento automatico del habla con modulo de traduccion, desarrollado desde cero en PyTorch por el usuario Pedro21613 y publicado en HuggingFace. No se basa en Whisper ni en ningun checkpoint previo: implementa su propio frontend log-Mel de 80 dimensiones, un subsampling convolucional x4, un encoder Conformer-lite de 6 capas con dimension 256 y un tokenizer de caracteres multilingue propio de 73 tokens. El conjunto completo ocupa aproximadamente 9 millones de parametros y unos 37 MB en disco.

El modelo se presenta como ligero y orientado a inferencia en tiempo real (streaming desde microfono), con etiquetas que declaran soporte para portugues, ingles, espanol, frances, aleman e italiano. El pipeline declarado en HuggingFace es `automatic-speech-recognition`, aunque la model card describe tambien un decodificador de traduccion y una funcion de perdida CTC con decodificacion greedy.

Su relevancia actual es mas didactica y de investigacion que productiva: el propio autor declara que la version v1.1 se entreno con solo 93 muestras (73 audios reales en ingles y 20 frases sinteticas en portugues generadas con MMS-TTS) durante 600 pasos en una GPU T4, y reconoce explicitamente que el modelo «memorizo» esas frases con overfitting intencionado. Es, por tanto, una prueba de concepto de arquitectura end-to-end, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PS10Translate: encoder Conformer-lite (6 capas, 256 dim) con frontend log-Mel de 80 dims y subsampling convolucional x4, mas decodificador de traduccion y cabeza CTC |
| Parametros totales | ~9 millones (segun model card; no se especifica el desglose exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el codigo incluye posiciones hasta 2000 para audios largos, segun la model card; no se declara una ventana de contexto formal) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint `pytorch_model.bin`, presumiblemente fp32) |
| Idiomas soportados | pt, en, es, fr, de, it (declarados en las etiquetas; el entrenamiento efectivo descrito es ingles real y portugues sintetico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`); no se publican safetensors ni GGUF |
| Tamano del repositorio | 0,1 GB |
| Libreria | PyTorch |
| Pipeline declarado | automatic-speech-recognition |
| Tokenizer | propio, de caracteres, multilingue, 73 tokens |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura `PS10Translate` esta implementada integramente en PyTorch sin dependencia de Whisper. El pipeline de entrada parte de un frontend log-Mel de 80 dimensiones construido desde cero, seguido de un subsampling convolucional con factor de reduccion x4 que disminuye la longitud temporal antes de entrar al encoder. El encoder es un Conformer-lite de 6 capas con dimension de modelo 256, una configuracion muy compacta que explica el reducido numero de parametros (~9M). La model card menciona ademas un decodificador de traduccion y el uso de una funcion de perdida CTC con decodificacion greedy en evaluacion; conviene senalar que la card no detalla como se combinan ambos elementos (decodificador autorregresivo y CTC), por lo que ese punto queda sin especificar.

En cuanto a los datos, la version v1.1 se entreno en una GPU T4 durante 600 pasos con un total de 93 muestras: 73 audios reales en ingles descritos como «Librispeech dummy» y 20 frases sinteticas en portugues generadas con el modelo TTS `facebook/mms-tts-por`. La perdida CTC descendio de 7,19 a 0,007 durante el entrenamiento. No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion; tampoco se describe composicion de dataset a mayor escala, tecnicas de aumento de datos ni regularizacion. La innovacion tecnica destacable es precisamente el caracter from-scratch del stack completo (frontend, encoder, tokenizer y decodificacion) y la inclusion de un componente de streaming (`PS10Streamer`) para consumo desde microfono.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio de entrada, con salida de texto.
- Traduccion integrada: la model card describe un decodificador de traduccion, aunque no se documenta el par de idiomas origen-destino ni la calidad del componente.
- Procesamiento en tiempo real: el repositorio incluye la clase `PS10Streamer` con metodo `stream_microphone()`, y el script de inferencia admite entrada por microfono (`python inference_ps10.py mic`).
- Inferencia sobre ficheros de audio (`python inference_ps10.py audio.wav`).
- Tokenizacion de caracteres multilingue mediante `CharMultilingualTokenizer` (73 tokens), disenada para los seis idiomas declarados.
- Modelo de bajo coste computacional: ~9M de parametros y ~37 MB de checkpoint, apto para ejecucion en CPU.
- Idiomas declarados: portugues, ingles, espanol, frances, aleman e italiano. Advertencia: el entrenamiento descrito solo cubre ingles real y portugues sintetico, por lo que el soporte efectivo de es, fr, de e it no esta demostrado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de salida ni modo «thinking».
- No se documenta ninguna capacidad de vision por computador ni de generacion de texto general.

## Casos de uso

- Prueba de concepto de pipeline ASR end-to-end: sirve para validar una cadena completa (frontend log-Mel, encoder, tokenizer, decodificacion) sin depender de pesos preentrenados, util en entornos de investigacion donde se quiere controlar cada componente.
- Demostracion de transcripcion en tiempo real en local: gracias a `PS10Streamer` y a sus ~9M de parametros, puede ejecutarse desde microfono en un portatil sin GPU, como demo educativa o prueba de latencia en streaming.
- Material docente para cursos de speech processing: permite mostrar de forma tangible como se construye un tokenizer de caracteres, un encoder Conformer y un entrenamiento CTC con un coste de computo minimo.
- Base para fine-tuning a mayor escala: el repositorio incluye `train_ps10_real.py`, pensado como punto de partida para reentrenar con corpus como Common Voice, LibriSpeech o VoxPopuli, segun indica el propio autor.
- Validacion de arquitecturas compactas en dispositivos con recursos limitados: con ~37 MB de checkpoint es viable probar despliegues en CPU o en hardware embebido antes de escalar a modelos mayores.
- Prototipado de traduccion de voz: el decodificador de traduccion permite experimentar con pipelines de speech-to-text-to-text en un entorno controlado y de bajo coste, aunque sin garantias de calidad fuera del conjunto de entrenamiento.
- Generacion de datos sinteticos para ASR: el flujo descrito (audios reales + frases sintetizadas con MMS-TTS) puede reutilizarse como receta para aumentar datos en idiomas con pocos recursos.
- Benchmark interno de decodificacion CTC: el script `eval_ps10.txt` y la medicion de CER permiten comparar variantes de tokenizer, tasa de subsampling o profundidad del encoder a coste muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son internos y medidos sobre el propio conjunto de entrenamiento, por lo que no deben interpretarse como capacidad de generalizacion.

| Metrica | Conjunto | Valor declarado |
|---|---|---|
| Perdida CTC (inicio de entrenamiento) | 93 muestras de entrenamiento | 7,19 |
| Perdida CTC (final de entrenamiento, 600 pasos) | 93 muestras de entrenamiento | 0,007 |
| CER (decodificacion greedy CTC) | Conjunto de entrenamiento | ~0,00-0,02 |
| Ejemplo de transcripcion | «o livro esta na mesa» | Salida identica a la referencia |
| Ejemplo de transcripcion | «the king has fled in disgrace...» | Salida identica a la referencia |

No se aportan resultados sobre conjuntos de validacion o test independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El checkpoint ocupa ~37 MB (fp32, ~9M de parametros) y el grafo de activaciones es minimo por la dimension 256 y solo 6 capas; cualquier GPU con 1-2 GB de memoria es suficiente. Estimacion derivada del numero de parametros, no publicada por el autor.
- GPU recomendadas: no se especifica ninguna. El autor no publica requisitos; para entrenamiento menciona una T4, que es suficiente para el regimen descrito (600 pasos). Para inferencia, practicamente cualquier GPU moderna (GTX 1050 en adelante) sirve.
- Cabe en GPU de consumo: si, con enorme margen. Tambien es viable en CPU y previsiblemente en dispositivos embebidos, dado el tamano del modelo.
- Opciones de despliegue: inferencia nativa en PyTorch mediante los scripts `inference_ps10.py` y la clase `PS10Streamer`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime en la informacion disponible.
- Latencia y throughput: no disponibles. La model card etiqueta el modelo como «realtime» y ofrece modo microfono, pero no publica mediciones de latencia ni de tokens por segundo.
- Requisitos de software: `pip install -r requirements_ps10.txt`, segun el autor. No se detalla el contenido de ese fichero.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas con otros modelos. A modo de referencia de categoria (modelos ASR multilingues ligeros), se incluye la siguiente tabla; los datos de los modelos alternativos proceden de documentacion publica de esos proyectos y no de la informacion proporcionada para este modelo, por lo que deben verificarse antes de usarse.

| Modelo | Parametros | Idiomas | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| PS-1.0-translate (este modelo) | ~9M | pt, en, es, fr, de, it (declarados; entrenamiento efectivo en en y pt) | no disponible | PyTorch (`pytorch_model.bin`) | HuggingFace, 0 descargas |
| Whisper tiny (referencia externa) | ~39M | multilingue (99 idiomas) | MIT | safetensors, PyTorch, entre otros | Ampliamente desplegado |
| Whisper base (referencia externa) | ~74M | multilingue (99 idiomas) | MIT | safetensors, PyTorch, entre otros | Ampliamente desplegado |
| MMS-TTS por (`facebook/mms-tts-por`) | no disponible | portugues | no disponible en la informacion | no disponible | HuggingFace; usado aqui como generador de datos sinteticos, no como ASR |

No se dispone de datos comparativos de CER, WER ni latencia entre este modelo y las alternativas citadas.

## Limitaciones y advertencias

- Overfitting declarado por el propio autor: la version v1.1 «decoro 93 frases» de forma intencionada. No se puede esperar generalizacion fuera de ese conjunto.
- Volumen de entrenamiento extremadamente reducido: 93 muestras (73 audios reales en ingles y 20 frases sinteticas en portugues) durante 600 pasos. Cualquier uso sobre audio real diverso producira resultados poco fiables.
- Idiomas: las etiquetas declaran seis idiomas, pero el entrenamiento descrito solo cubre ingles y portugues. El soporte de espanol, frances, aleman e italiano no esta respaldado por datos de entrenamiento ni de evaluacion.
- Riesgo de alucinacion y de transcripcion inventada: al estar fuertemente sobreajustado, el modelo puede emitir salidas memorizadas que no correspondan al audio de entrada.
- Licencia no disponible: al no especificarse licencia, no hay autorizacion explicita de uso comercial. Se debe contactar con el autor antes de cualquier uso productivo o redistribucion.
- Ausencia de cuantizaciones publicadas: no hay GGUF, GPTQ, AWQ ni versiones ONNX, lo que limita su integracion en runtimes de inferencia habituales.
- Sin datos de benchmarks publicos ni de evaluacion en conjuntos independientes: no hay evidencia de calidad medible mas alla del conjunto de entrenamiento.
- Ambiguedad arquitectonica en la documentacion: la model card menciona simultaneamente un decodificador de traduccion y decodificacion greedy CTC, sin detallar como se articulan. Conviene revisar el codigo antes de asumir un comportamiento concreto.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso por terceros ni de validacion externa.
- No apto para produccion en su estado actual, tal como reconoce el propio autor, que recomienda reentrenar con miles de horas de Common Voice, LibriSpeech o VoxPopuli.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-1.0-translate
- Modelo TTS citado como generador de datos sinteticos: https://huggingface.co/facebook/mms-tts-por
- Corpus mencionados por el autor como base para un reentrenamiento robusto: Common Voice, LibriSpeech y VoxPopuli (no se proporcionan enlaces concretos en la informacion disponible)
- No se han encontrado en la informacion proporcionada articulos academicos, blogs tecnicos, repositorios adicionales ni demos en linea.
