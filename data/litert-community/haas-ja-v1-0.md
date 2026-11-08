# litert-community/Haas-ja-v1.0

## Resumen

Haas-ja-v1.0 es un modelo de reconocimiento automatico del habla (ASR) para japones desarrollado por Third Intelligence. Sigue el diseno Parakeet-TDT de NVIDIA: un codificador FastConformer de 24 capas con tamano oculto de 1.024 y un decodificador Token-and-Duration Transducer (TDT) cuya red de prediccion sustituye la LSTM habitual por dos capas de Kimi Delta Attention (KDA). El checkpoint original almacena los pesos en bfloat16 y se distribuye bajo licencia Apache 2.0.

La ficha que nos ocupa, `litert-community/Haas-ja-v1.0`, no es el modelo original sino una conversion del mismo a LiteRT (`.tflite`) realizada con litert-torch 0.9.4 y ai-edge-quantizer 0.10.0 para LiteRT 2.3.0, orientada a ejecucion en dispositivos Android con aceleracion por NPU, GPU y CPU. La conversion incluye grafos de codificador en int8 (para CPU) y float16 (para GPU y NPU) en tres ventanas de 10, 20 y 30 segundos, ademas del front end log-mel, el decodificador TDT cuantizado y el tokenizer SentencePiece original.

Su relevancia radica en que demuestra ASR japones de alta precision ejecutandose integramente en un telefono movil: en un Galaxy S26 los codificadores float16 alcanzan 134x tiempo real sobre NPU y los int8 46x sobre CPU, con un CER estricto del 3,7009 % en el conjunto de test FLEURS japones (650 enunciados), practicamente identico al 3,6886 % de la referencia float32 en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (24 capas, hidden size 1.024) + decodificador TDT con red de prediccion de 2 capas Kimi Delta Attention |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (480.000 muestras a 16 kHz); grafos de 10, 20 y 30 s |
| Tipos de cuantizacion | int8 (pesos y activaciones en capas lineales y convoluciones 1x1 del subsampling; convoluciones depthwise y tablas de posicion relativa en float32) y float16 (pesos en capas lineales y convoluciones; entradas de LayerNorm reescaladas) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) para LiteRT; el modelo base original usa `.nemo` en bfloat16 |

## Arquitectura y entrenamiento

El modelo base sigue la receta Parakeet-TDT de NVIDIA: un codificador FastConformer de 24 capas con dimension oculta de 1.024 y un decodificador Token-and-Duration Transducer que predice simultaneamente tokens y duraciones, lo que permite decodificacion no autorregresiva por saltos. La innovacion principal respecto al TDT original es la red de prediccion, compuesta por dos capas de Kimi Delta Attention en lugar de una LSTM, lo que facilita el mantenimiento de estado entre pasos y su exportacion a grafos moviles.

La conversion a LiteRT reutiliza el codigo de generacion de grafos de `litert-community/parakeet-ultra`, plegando la escala de entrada del codificador (32) en la capa lineal del subsampling. El front end log-mel reproduce el `AudioToMelSpectrogramPreprocessor` de NeMo tal como lo configura el checkpoint: pre-enfasis 0,97, STFT de 512 puntos, ventana de 400 muestras, hop de 160, 128 bins mel, logaritmo con guarda 2^-24 y normalizacion por bin sobre los frames validos, usando los valores de ventana y banco de filtros almacenados en el checkpoint. No se dispone de informacion sobre el volumen ni la composicion del dataset de entrenamiento, ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en japones a partir de audio mono a 16 kHz.
- Procesamiento por ventanas de hasta 30 s, con grafos especificos de 10, 20 y 30 s que evitan el trabajo de padding en audios cortos.
- Decodificacion greedy TDT con prediccion conjunta de tokens y duraciones.
- Ejecucion en dispositivo (on-device) en Android mediante LiteRT, con backends NPU, GPU y CPU.
- Front end log-mel integrado como grafo TFLite independiente, sin dependencias de NeMo en tiempo de inferencia.
- Tokenizacion SentencePiece compatible byte a byte con la del modelo original.
- No soporta tool calling, agentes, vision ni audio mas alla del ASR; no dispone de modo thinking.

## Casos de uso

- Subtitulado y transcripcion en tiempo real en aplicaciones Android: los codificadores float16 sobre NPU transcriben 134x mas rapido que tiempo real en un Galaxy S26, lo que permite procesar audio en directo por ventanas de 30 s sin conexion.
- Dictado por voz offline en moviles: el conjunto int8 (1,94 GB con mel y decodificador) corre a 46x tiempo real sobre CPU, adecuado para teclados y asistentes que deben funcionar sin red.
- Transcripcion de reuniones y notas de voz: la segmentacion en ventanas de 30 s y la union de textos sin separador permiten procesar grabaciones largas de forma secuencial en el dispositivo.
- Indexacion y busqueda de archivos de audio japoneses: al ejecutarse localmente, permite generar transcripciones masivas sin enviar datos a servicios en la nube, relevante por privacidad.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en directo en terminales Android con aceleracion NPU/GPU.
- Prototipado e investigacion en ASR japones: la licencia Apache 2.0 y la disponibilidad de grafos separados (mel, codificador, decodificador) facilitan experimentos con cuantizacion y comparacion de backends.
- Integracion en pipelines de evaluacion: el runner de linea de comandos (`haas_asr_runner.cc`) y `tdt_text.py` permiten medir CER sobre corpus como FLEURS de forma reproducible.

## Benchmarks y rendimiento

| Metrica | Valor | Entorno |
|---|---|---|
| CER estricto (FLEURS ja, 650 enunciados) | 3,7009 % | Galaxy S26, NPU, codificador float16 |
| CER estricto (referencia) | 3,6886 % | PyTorch float32, mismo audio |
| Velocidad relativa | 134x tiempo real | Galaxy S26, NPU, float16, pipeline host activo |
| Velocidad relativa | 63x tiempo real | Galaxy S26, GPU, float16, serie en telefono caliente |
| Velocidad relativa | 46x tiempo real | Galaxy S26, CPU, int8, serie en telefono caliente |
| CER reportado por terceros | 6,12 % | Modelo original, fuente externa (tech-insider.org) |

## Requisitos de hardware

- VRAM/RAM: el conjunto int8 ocupa 1,94 GB en disco (mel + codificador + decodificador); el conjunto float16 ocupa 3,67 GB.
- Tamano por fichero: codificadores int8 de 616 MB (10 s), 641 MB (20 s) y 665 MB (30 s); codificadores float16 de 1,19 GB (10 s), 1,22 GB (20 s) y 1,24 GB (30 s); decodificador int8 de 6,5 MB; mel de 1,6 a 2,9 MB.
- GPU recomendadas: no aplica para servidor; el objetivo son SoC moviles Android con NPU y GPU integradas (validado en Galaxy S26).
- Cabe en dispositivos consumer moviles: si, con los grafos int8 en CPU o float16 en GPU/NPU.
- Opciones de despliegue: LiteRT 2.3.0 mediante su API C (runner incluido `haas_asr_runner.cc` y `build_android.sh`); no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: 134x, 63x y 46x tiempo real segun backend (NPU float16, GPU float16, CPU int8) en Galaxy S26; el rendimiento esta en ajuste continuo segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER japones | Licencia | Formato |
|---|---|---|---|---|---|
| Haas-ja-v1.0 (LiteRT) | no disponible | ventanas de 30 s | 3,7009 % (NPU, FLEURS) | Apache 2.0 | TFLite |
| third-intelligence/Haas-ja-v1.0 | no disponible | ventanas de 30 s | 3,6886 % (float32, FLEURS); 6,12 % reportado por terceros | Apache 2.0 | NeMo (.nemo) |
| litert-community/parakeet-ultra | no disponible | ventanas de 30 s | no disponible (modelo para ingles) | no disponible | TFLite |

No se dispone de datos de benchmarks de otros modelos ASR japoneses comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta japones; no es multilingue.
- La segmentacion de audio largo se hace en cortes fijos de 30 s, no en pausas; el autor no ha medido el efecto en palabras que cruzan un corte (el codigo original `transcribe_longform` corta en puntos de silencio).
- Las ventanas de menos de 320 muestras se descartan sin generar texto.
- El CER de referencia se midio solo en enunciados de hasta 30 s (el mas largo de FLEURS es de 28,2 s), por lo que la precision en audio mas largo no esta validada.
- Riesgo de alucinacion y errores en nombres propios, numeros y dominios especializados no cuantificado en la informacion disponible.
- Los sesgos del modelo original no estan documentados en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y la conversion son responsabilidad de sus respectivos autores; verificar la cadena de atribucion.
- Las velocidades reportadas corresponden exclusivamente a los ficheros `.tflite` de este repositorio con la API C de LiteRT 2.3.0, no a LiteRT-LM ni a otras conversiones.
- El rendimiento esta en proceso de ajuste segun el autor; las cifras pueden variar entre dispositivos y versiones de LiteRT.

## Enlaces

- Repositorio LiteRT: https://huggingface.co/litert-community/Haas-ja-v1.0
- Modelo base original: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Conversion de referencia (parakeet-ultra): https://huggingface.co/litert-community/parakeet-ultra
- Analisis externo con CER del 6,12 %: https://tech-insider.org/haas-ja-v1-0-japanese-asr-6-12-percent-cer-open-model-2026/
