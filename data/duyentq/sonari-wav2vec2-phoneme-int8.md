# duyentq/sonari-wav2vec2-phoneme-int8

## Resumen

Sonari-wav2vec2-phoneme-int8 es una version cuantizada a int8 y exportada a ONNX del modelo facebook/wav2vec2-lv-60-espeak-cv-ft, un wav2vec 2.0 afinado con CTC que produce etiquetas de fonemas en IPA segun el inventario de espeak, no palabras. Lo publica el usuario duyentq como artefacto de infraestructura para el servicio de voz de Sonari, un curso de ingles para estudiantes vietnamitas que puntua la pronunciacion en CPU mediante alineamiento forzado CTC y una puntuacion GOP (goodness of pronunciation) por fonema.

El repositorio no aporta entrenamiento nuevo: solo cambia el formato y la precision de los pesos. Parte del checkpoint PyTorch original (revision ae45363bf3413b374fecd9dc8bc1df0e24c3b7f4), lo exporta a ONNX en fp32 y despues aplica cuantizacion dinamica int8 con onnxruntime, dejando un unico fichero de 355.352.992 bytes. El resultado reduce el peso del modelo de 1.264 MB a 355 MB y el pico de memoria residente de 2.148-2.308 MB a 811-1.060 MB, con una degradacion de las log-posteriores de hasta 2,8 nats.

Su relevancia es practica: demuestra que un modelo de reconocimiento fonetico multilingue de la familia wav2vec 2.0 se puede servir en CPU con latencias de 280-609 ms para clips de 3 segundos, sin GPU y con una sola sesion de onnxruntime. Es util para quien necesite evaluacion de pronunciacion, alineamiento fonetico o investigacion linguistica en entornos sin acelerador, aunque sus umbrales de decision deben recalibrarse sobre este fichero concreto por el sesgo introducido en la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (transformer con cabecera CTC, Wav2Vec2ForCTC, atencion eager) |
| Parametros totales | No disponible en la model card (el modelo base es la variante large de wav2vec 2.0) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: entrada de audio a 16 kHz con eje dinamico de muestras; salida de un frame cada 320 muestras (20 ms) |
| Tipos de cuantizacion | int8 dinamico (weight_type=QInt8, op_types_to_quantize=["MatMul"]); existe un export intermedio en fp32 de 1.263.740.983 bytes |
| Idiomas soportados | Multilingue (modelo base afinado sobre Common Voice multilingue; etiquetas foneticas espeak compartidas entre idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (wav2vec2_int8.onnx); el modelo base se distribuye como pytorch_model.bin |
| Tamano del fichero | 355.352.992 bytes (SHA-256 cd51f95340d31f72ffefc1b734bb6fae91f2f8b0964eb450a838ef7344a72876) |
| Tamano del repositorio | 0,4 GB |
| Vocabulario | 392 tokens, tomados del vocab.json de la revision upstream (SHA-256 d732ab2456c0c017930001dc9af0b41b3b93d25b2eb9740bf9d925508d7d87d0); token de blank CTC = \<pad\> (id 0) |
| Entrada | input_values: float32 [batch, samples], 16 kHz mono, normalizado por enunciado a media cero y varianza unitaria ((x - mean) / sqrt(var + 1e-7)) |
| Salida | logits: float32 [batch, frames, 392], sin log-softmax incorporado |
| Runtime | onnxruntime con CPUExecutionProvider |

## Arquitectura y entrenamiento

La arquitectura es wav2vec 2.0, un codificador convolucional de caracteristicas seguido de un transformer con atencion y una cabecera CTC. El modelo base, facebook/wav2vec2-lv-60-espeak-cv-ft, procede del trabajo de Xu, Baevski y Auli (2021) sobre reconocimiento fonetico zero-shot entre idiomas: se parte de un preentrenamiento autosupervisado sobre audio sin etiquetar y se afina con CTC sobre Common Voice multilingue usando un vocabulario de simbolos foneticos de espeak, lo que permite reconocer fonemas en idiomas no vistos durante el afinado. Este repositorio no entrena ni afina nada: la model card indica explicitamente que solo cambiaron el formato y la precision de los pesos.

El proceso de conversion tiene dos pasos documentados. Primero, la exportacion a ONNX del modulo Wav2Vec2ForCTC con atencion eager, trazado con PyTorch 2.14.0 mediante el exportador legacy TorchScript (dynamo=False) sobre 3 segundos de ruido, opset 20 y pesos en linea; el grafo tiene una unica salida, logits, con ejes dinamicos para el lote y las muestras de entrada. Despues, la cuantizacion dinamica int8 con onnxruntime.quantization.quantize_dynamic (onnxruntime 1.30.0, onnx 1.23.1), con per_channel=False, reduce_range=False y sin preprocesado porque la inferencia simbolica de formas falla en este grafo. El grafo resultante contiene 146 nodos MatMulInteger, 98 DynamicQuantizeLinear y 292 tensores de pesos int8; 48 nodos MatMul y los 8 nodos Conv de la feature encoder y las convoluciones posicionales permanecen en fp32, porque cuantizar la convolucion posicional con normalizacion de pesos rompe el modelo. Al ser cuantizacion dinamica, no se uso conjunto de calibracion: las escalas de activacion se calculan en tiempo de ejecucion. Solo se emplearon cuatro clips de LibriSpeech dev-clean (CC BY 4.0) para verificar el resultado, no para ajustarlo.

## Capacidades

- Reconocimiento de fonemas: genera etiquetas de fonemas en notacion IPA de espeak a partir de audio, con un vocabulario de 392 tokens. No transcribe palabras ni produce texto ortografico.
- Alineamiento forzado CTC: permite alinear una grabacion contra una secuencia de fonemas de referencia, que es la base del calculo de la puntuacion GOP por fonema.
- Puntuacion de pronunciacion: el flujo previsto compara la produccion del hablante con los fonemas esperados y asigna una puntuacion de bondad por fonema.
- Cobertura multilingue: el modelo base se afino sobre Common Voice multilingue y el articulo de referencia describe reconocimiento fonetico zero-shot entre idiomas; el inventario de simbolos es compartido, no especifico de un idioma.
- Inferencia en CPU: se ejecuta con CPUExecutionProvider de onnxruntime; la configuracion de Sonari usa un hilo intra-op por peticion.
- Ejecucion sin GPU y con huella de memoria reducida: pico de RSS de 811-1.060 MB frente a 2.148-2.308 MB del fp32.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento: es un modelo acustico-fonetico de una sola tarea.
- Sin generacion de texto libre: las log-posteriores deben convertirse a etiquetas mediante decodificacion voraz o alineamiento.

## Casos de uso

- Correccion de pronunciacion en aplicaciones de aprendizaje de idiomas: el modelo puntua que fonemas ha producido realmente el alumno al alinearlos contra una referencia conocida mediante CTC, y la puntuacion GOP resultante sirve para dar retroalimentacion por fonema. Es exactamente el uso que le da Sonari en su curso de ingles para hablantes de vietnamita.
- Evaluacion automatica de la pronunciacion (CAPT) en plataformas educativas: con un coste de 280-609 ms por clip de 3 segundos y 4 hilos en un portatil, se puede desplegar en servidores sin GPU para calificar cientos de grabaciones por minuto.
- Investigacion fonetica y linguistica comparada: al emitir simbolos IPA de espeak y funcionar entre idiomas sin reentrenamiento, permite analizar la produccion fonetica de hablantes de distintos idiomas sobre un mismo inventario de simbolos.
- Validacion de sistemas de sintesis de voz (TTS): se puede verificar que el audio generado contiene los fonemas previstos, comparando la secuencia esperada con la reconocida por el modelo.
- Alineamiento forzado de corpus de habla: util para generar anotaciones a nivel de fonema sobre grabaciones existentes, paso previo a entrenar otros modelos o a construir datasets foneticos.
- Deteccion de errores de pronunciacion en lectura en voz alta: en aplicaciones de lectura guiada, el modelo puede localizar la palabra o el fonema donde el lector se desvia de la referencia, con la ventaja de que los umbrales son por fonema y no globales.
- Filtrado y control de calidad de datos de audio: descartar grabaciones cuyo contenido fonetico no coincide con el guion previsto antes de incorporarlas a un pipeline de entrenamiento.
- Despliegue en dispositivos o servicios de borde: el fichero de 355 MB y una sesion que carga en 1,0-1,4 s permiten servir el modelo en una maquina modesta o empaquetarlo en un contenedor ligero sin dependencias de CUDA.

## Benchmarks y rendimiento

La model card no reporta resultados sobre benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo fonetico. Si publica una comparacion de las log-posteriores frente al modelo PyTorch original sobre el mismo audio:

| Clip | Diferencia maxima absoluta (nats) | Diferencia media absoluta | Frames con el mismo argmax | Misma decodificacion voraz CTC |
|---|---|---|---|---|
| Palabra de 0,78 s | 2,3 | 0,40 | 100,0 % | si |
| Palabra de 0,76 s | 1,4 | 0,30 | 100,0 % | si |
| Habla de 3 s | 2,8 | 0,37 | 99,3 % | si |
| Habla de 8 s | 2,6 | 0,30 | 99,0 % | si |

El export intermedio en fp32 coincide con PyTorch con un error de 3,3e-4 nats, de modo que la practica totalidad de la desviacion procede de la cuantizacion int8. La model card advierte que las log-posteriores de un mismo frame pueden moverse hasta 2,8 nats, por lo que los umbrales de decision deben calibrarse sobre este fichero exacto y no sobre el modelo fp32. Como referencia de esa deriva, en el par de palabras usado como puerta de control el GOP de /θ/ en el clip correcto paso de +3,886 (PyTorch) a +3,596, y el GOP de /t/ cuando la referencia era /θ/ paso de -5,713 a -5,537; el mayor cambio de GOP de cualquier fonema fue de 0,375 nats.

Coste en CPU sobre un portatil con i5-11400H bajo WSL2 y onnxruntime 1.30.0:

| Metrica | int8 | fp32 |
|---|---|---|
| Tamano del fichero | 355 MB | 1.264 MB |
| Pico de RSS | 811-1.060 MB | 2.148-2.308 MB |
| Carga de sesion | 1,0-1,4 s | 3,1-4,5 s |
| Clip de 3 s, p50, 1 hilo | 609 ms | 1.336 ms |
| Clip de 3 s, p50, 2 hilos | 372 ms | 797 ms |
| Clip de 3 s, p50, 4 hilos | 280 ms | 568 ms |

La propia model card aclara que son cifras de portatil, no de servidor.

## Requisitos de hardware

- VRAM: no aplica, el modelo esta pensado para ejecutarse en CPU con onnxruntime. No se publican requisitos de VRAM para GPU.
- Memoria RAM: pico de RSS de 811-1.060 MB en int8, frente a 2.148-2.308 MB en fp32. El proceso de cuantizacion dinamica alcanza unos 4 GB de memoria en este modelo.
- GPU: no son necesarias ni se documentan. Al ser un grafo ONNX con proveedor CPUExecutionProvider, el despliegue no depende de CUDA.
- GPU de consumo: irrelevante para el caso de uso; cualquier CPU moderna sirve. La referencia medida es un i5-11400H de portatil.
- Opciones de despliegue: onnxruntime (probado con 1.30.0) como unica ruta documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: p50 de 609 / 372 / 280 ms para un clip de 3 segundos con 1 / 2 / 4 hilos intra-op respectivamente; 1.336 / 797 / 568 ms en la version fp32.
- Rendimiento: las dos tablas de la model card permiten estimar el throughput por hilo a partir de la duracion del audio; no se publica una cifra agregada de peticiones por segundo en servidor.
- Carga de modelo: 1,0-1,4 s por sesion en int8, 3,1-4,5 s en fp32.

## Comparativa con modelos similares

La comparacion mas directa es contra el propio modelo base y su export en fp32, ya que en la informacion disponible no se detallan alternativas equivalentes de reconocimiento fonetico.

| Modelo | Parametros | Contexto | Formato y tamano | Rendimiento | Licencia |
|---|---|---|---|---|---|
| duyentq/sonari-wav2vec2-phoneme-int8 | No disponible (base wav2vec 2.0 large) | Entrada de audio a 16 kHz, frames de 20 ms | ONNX int8, 355 MB | Del 99,0 al 100,0 % de frames con el mismo argmax que PyTorch; carga de sesion de 1,0-1,4 s | Apache-2.0 |
| Export ONNX fp32 del mismo modelo | No disponible (base wav2vec 2.0 large) | Igual | ONNX fp32, 1.264 MB | Coincide con PyTorch a 3,3e-4 nats; carga de sesion de 3,1-4,5 s | Apache-2.0 |
| facebook/wav2vec2-lv-60-espeak-cv-ft (PyTorch) | No disponible en la informacion proporcionada | Igual | pytorch_model.bin | Referencia de comparacion usada en las tablas anteriores | Apache-2.0 |

No se dispone de datos de benchmarks comparativos frente a otros modelos de reconocimiento fonetico como Wav2Vec2Phoneme de otros autores o alternativas basadas en XLS-R, por lo que no se incluye comparacion de rendimiento con ellos.

## Limitaciones y advertencias

- No es un modelo de transcripcion: emite simbolos foneticos IPA de espeak, no palabras. Usarlo como ASR convencional produce resultados incorrectos.
- Umbrales dependientes del fichero: las log-posteriores se desplazan hasta 2,8 nats respecto al modelo PyTorch, por lo que cualquier umbral de decision debe recalibrarse sobre este ONNX concreto y no reutilizarse desde el modelo fp32. Sonari fija el fichero por SHA-256 y rechaza cualquier otra version precisamente por este motivo.
- Deriva del GOP: en el control publicado, el GOP de /θ/ cambio en 0,31 nats y el de /t/ en 0,18 nats; el mayor cambio observado en cualquier fonema fue de 0,375 nats. En aplicaciones de evaluacion con umbrales ajustados, esa variacion puede alterar la clasificacion de un fonema como correcto o incorrecto.
- Alucinacion y ruido: como cualquier modelo CTC, puede producir etiquetas espurias en audio ruidoso, con musica o con habla solapada; no se documentan tasas de error por tipo de ruido.
- Sesgos: no se publica informacion sobre sesgos por acento, genero, edad o variedad dialectal. El modelo base se afino sobre Common Voice multilingue, cuya composicion y desequilibrios no se detallan en la ficha.
- Cobertura idiomatica: la etiqueta es multilingue, pero no se especifica una lista cerrada de idiomas ni la calidad esperada por idioma; el inventario de simbolos es el de espeak y puede no coincidir con otras convenciones foneticas.
- Limitaciones de entrada: solo se documenta audio a 16 kHz mono, normalizado por enunciado a media cero y varianza unitaria; otros formatos o frecuencias de muestreo requieren conversion previa.
- Concurrencia: la configuracion descrita usa un hilo intra-op por peticion; no se publican datos de rendimiento con multiples peticiones simultaneas, por lo que el dimensionado en produccion debe medirse aparte.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card no redistribuye el vocab.json, que debe tomarse de la revision upstream indicada; conviene verificar la trazabilidad de ese fichero.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el 3 de octubre de 2026, sin documentacion sobre mantenimiento posterior. Estilos de integracion como vLLM, llama.cpp, Ollama o TGI no estan soportados ni mencionados.
- Los scripts de exportacion y cuantizacion (export.py y quantize.py --ops MatMul) se encuentran bajo spikes/gop/onnx/ en el repositorio de Sonari, que no se enlaza en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/duyentq/sonari-wav2vec2-phoneme-int8
- Fichero ONNX fijado por commit: https://huggingface.co/duyentq/sonari-wav2vec2-phoneme-int8/resolve/f0652c415244e59f472e23fe3c629cea1e694a11/wav2vec2_int8.onnx
- Modelo base: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Documentacion de Wav2Vec2Phoneme en Transformers (v4.49.0): https://huggingface.co/docs/transformers/v4.49.0/model_doc/wav2vec2_phoneme
- Documentacion de Wav2Vec2Phoneme en Transformers (version actual): https://huggingface.co/docs/transformers/model_doc/wav2vec2_phoneme
- Fuente de la documentacion en GitHub: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/wav2vec2_phoneme.md
- Articulo de referencia (Xu, Baevski, Auli, 2021), segun el tag arxiv:2109.11680 del repositorio: https://arxiv.org/abs/2109.11680
- Repositorio de ejemplo de reconocimiento fonetico con Wav2Vec2 e IPA: https://github.com/Srinath-N-R/IPA-Wav2Vec2-Phoneme-Recognition
- Vision general de wav2vec 2.0 (GeeksforGeeks): https://www.geeksforgeeks.org/nlp/wav2vec2-self-a-supervised-learning-technique-for-speech-representations/
