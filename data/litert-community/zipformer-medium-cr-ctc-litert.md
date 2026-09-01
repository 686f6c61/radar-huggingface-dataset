# litert-community/Zipformer-medium-CR-CTC-LiteRT

## Resumen

Zipformer-medium-CR-CTC-LiteRT es un modelo de reconocimiento automático de voz (ASR) en inglés, desarrollado por la comunidad LiteRT (antes TFLite) de Google AI Edge. Se basa en el encoder Zipformer, una arquitectura eficiente de k2/icefall, y se distribuye como un grafo TFLite/LiteRT optimizado para ejecutarse íntegramente en la GPU de dispositivos Android, sin necesidad de CPU fallback ni de cálculo de FFT dentro del modelo. El checkpoint corresponde a la receta oficial de LibriSpeech de icefall, con 64 millones de parámetros y una ventana de contexto fija de 16 segundos.

El modelo resuelve el problema de la transcripción de voz en tiempo real en hardware móvil, ofreciendo un factor de tiempo real (RTF) de aproximadamente 0.01 en un Pixel 8a (156 ms para procesar 16 segundos de audio). Su relevancia actual radica en que demuestra que es posible ejecutar un sistema ASR de calidad (WER 2.12 en test-clean) completamente en GPU móvil, con una única compilación del grafo y sin dependencias externas de FFT. Se distribuye bajo licencia Apache 2.0 y está pensado para integración en aplicaciones Android mediante la API CompiledModel de LiteRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (6 stacks) + capa lineal CTC, con submuestreo convolucional (Conv2dSubsampling) |
| Parametros totales | 64 M (variante medium) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16 segundos fijos (1600 frames de fbank a 100 Hz) |
| Tipos de cuantizacion | fp16 (archivo .tflite con pesos en half precision) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite / LiteRT (archivo .tflite) |

## Arquitectura y entrenamiento

El modelo emplea el encoder Zipformer, presentado en el articulo "Zipformer: A faster and better encoder for automatic speech recognition" (arXiv:2310.11230). Zipformer es una variante de transformer con atencion eficiente que reduce el coste computacional mediante un mecanismo de atencion con sesgo relativo y una estructura de bloques apilados con diferentes tasas de muestreo interno. En esta implementacion concreta, el encoder se compone de 6 stacks de Zipformer2, precedidos de una capa de submuestreo convolucional que reduce la resolucion temporal. La salida se proyecta a logits CTC sobre un vocabulario BPE de 500 tokens, con un token de blank en la posicion 0.

El entrenamiento se realizo siguiendo la receta oficial de icefall para LibriSpeech, que utiliza las 960 horas de audio de audiolibros publicos. No se aplicaron tecnicas de RLHF ni DPO; es un entrenamiento supervisado clasico con funcion de perdida CTC. La conversion a LiteRT implico reescrituras numericamente exactas del grafo de evaluacion: la funcion de activacion Swoosh se implemento mediante una softplus estable sin guardas, el desplazamiento de posiciones relativas se reautorizo con operaciones pad-reshape-slice, y las mascaras de padding se plegaron como sesgos aditivos de atencion y puertas convolucionales. El resultado es un grafo donde todas las operaciones son compatibles con GPU, sin FFT interna (el calculo de fbank se realiza en el host).

## Capacidades

- Reconocimiento de voz en ingles con salida de texto plano, mediante decodificacion CTC greedy (argmax por frame, eliminacion de repetidos y de tokens blank).
- Procesamiento de audio de hasta 16 segundos por ventana, con relleno de frames de silencio (log(1e-10)) para audios mas cortos.
- Ejecucion completamente en GPU movil a traves de la API CompiledModel de LiteRT, sin necesidad de CPU fallback.
- Entrada de audio en formato PCM mono de 16 kHz, con valores en el rango [-1, 1] (no escalados a int16).
- Salida de logits CTC crudos a 25 Hz, con el log_softmax movido al lado del host para simplificar el grafo.
- Compatibilidad drop-in entre las tres variantes del modelo (small, medium, large) gracias a firmas de entrada/salida identicas.
- Soporte para aceleracion NPU (Snapdragon Hexagon) en la variante small, aunque con peor rendimiento que la GPU en las pruebas realizadas.

## Casos de uso

- Transcripcion de voz en tiempo real en aplicaciones Android: el modelo puede transcribir frases de hasta 16 segundos con una latencia de 156 ms en un Pixel 8a, lo que permite dictado continuo por ventanas deslizantes. Es adecuado porque su RTF de 0.01 deja margen para procesar audio en bucle sin acumular retraso.
- Subtitulado automatico de videos cortos o clips: al aceptar ventanas fijas de 16 s, se puede segmentar un video en bloques y transcribir cada uno de forma independiente. La salida CTC greedy es suficiente para generar subtitulos sin puntuacion, y el bajo consumo de GPU permite ejecutarlo en segundo plano.
- Asistentes de voz embebidos: integrado en un asistente local, el modelo puede convertir comandos de voz en texto sin enviar audio a la nube. Su licencia Apache 2.0 y su tamano de 132 MB lo hacen viable para distribucion en APK.
- Accesibilidad para personas con discapacidad auditiva: como herramienta de transcripcion en tiempo real en moviles, mostrando el texto de conversaciones o reuniones. La ejecucion local garantiza privacidad, un requisito habitual en este tipo de aplicaciones.
- Pruebas de calidad de audio en produccion: al ser un modelo determinista (sin muestreo), se puede usar para verificar la inteligibilidad de grabaciones en pipelines de control de calidad, comparando transcripciones con referencias.
- Investigacion en ASR eficiente: al estar disponible el codigo de conversion y las recetas en el repositorio litert-samples, sirve como punto de partida para experimentar con cuantizacion, poda o adaptacion a otros idiomas.

## Benchmarks y rendimiento

La model card proporciona resultados de WER (Word Error Rate) para las tres variantes del modelo, evaluados en los conjuntos test-clean y test-other de LibriSpeech con decodificacion CTC greedy. No se incluyen comparaciones con otros modelos ASR en la informacion disponible.

| Variante | Parametros | Tamano (fp16) | WER test-clean | WER test-other | Latencia Pixel 8a (16 s) |
|---|---|---|---|---|---|
| small | 23 M | 46 MB | 2.57 | 5.95 | 124 ms |
| medium | 64 M | 132 MB | 2.12 | 4.62 | 156 ms |
| large | 148 M | 298 MB | 2.03 | 4.37 | 220 ms |

Ademas, se reporta una correlacion de 0.9993 entre los logits del dispositivo y una referencia float de escritorio, con un 99.2 % de concordancia en el argmax por frame y transcripciones identicas en la prueba de barrido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 132 MB para los pesos fp16 del modelo medium, mas el overhead de activaciones y buffers de entrada/salida. En la practica, cabe en cualquier GPU movil con al menos 512 MB de memoria grafica.
- GPU recomendadas: cualquier GPU compatible con LiteRT CompiledModel en Android (Adreno, Mali, etc.). En el ejemplo se usa un Pixel 8a (Adreno 740). Tambien puede ejecutarse en GPU de escritorio via LiteRT, aunque no se aportan datos de rendimiento.
- En consumer GPU: si, cabe en GPUs de escritorio de gama baja (por ejemplo, una GTX 1650 con 4 GB) sin problemas, aunque el modelo esta disenado para moviles.
- Opciones de despliegue: LiteRT (TFLite) con la API CompiledModel para GPU, o el interprete clasico de LiteRT. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo ASR especifico.
- Latencia y throughput: en Pixel 8a, 156 ms por ventana de 16 s (RTF 0.01), con 19 ms de tiempo de enqueue. La compilacion del grafo tarda 1.8 s en la primera carga.

## Comparativa con modelos similares

Dentro de la misma familia Zipformer-CR-CTC, las tres variantes comparten arquitectura y firma de entrada/salida, diferenciandose en tamano y precision. No se dispone de datos de otros modelos ASR comparables (como Whisper o Wav2Vec2) en la informacion proporcionada.

| Modelo | Parametros | Contexto | WER test-clean | WER test-other | Licencia |
|---|---|---|---|---|---|
| Zipformer small CR-CTC | 23 M | 16 s fijo | 2.57 | 5.95 | Apache 2.0 |
| Zipformer medium CR-CTC | 64 M | 16 s fijo | 2.12 | 4.62 | Apache 2.0 |
| Zipformer large CR-CTC | 148 M | 16 s fijo | 2.03 | 4.37 | Apache 2.0 |

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidad multilingue ni adaptacion a otros idiomas sin reentrenamiento.
- La ventana de contexto es fija de 16 segundos. Audios mas largos deben segmentarse, y no se proporciona un mecanismo de streaming continuo con solapamiento.
- El calculo de fbank se realiza en el host (CPU), no dentro del modelo. Esto implica que la aplicacion debe implementar ese paso, y que el rendimiento global depende tambien de la CPU.
- El modelo fue entrenado con LibriSpeech, que contiene audio de audiolibros leidos en condiciones limpias. Puede degradarse significativamente con ruido de fondo, acentos no estandar o habla espontanea.
- La salida es texto sin puntuacion ni mayusculas, al ser una decodificacion CTC greedy sobre un vocabulario BPE. No se incluye un modelo de lenguaje para mejorar la fluidez.
- No se han publicado resultados de sesgos especificos, pero al entrenarse con audiolibros publicos, es probable que tenga un rendimiento inferior con voces infantiles, dialectos regionales o registros coloquiales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (icefall) y el codigo de conversion estan sujetos a sus propias licencias; se recomienda revisar los repositorios originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Zipformer-medium-CR-CTC-LiteRT
- Repositorio de recetas y conversion (litert-samples): https://github.com/google-ai-edge/litert-samples/tree/main/models/zipformer/zipformer_ctc
- Paper de Zipformer: https://arxiv.org/abs/2310.11230
- Modelo base en Hugging Face: https://huggingface.co/Zengwei/icefall-asr-librispeech-zipformer-medium-cr-ctc-20241018
