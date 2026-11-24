# litert-community/PiVo-1.4M

## Resumen
PiVo-1.4M para LiteRT es la conversion al formato LiteRT (TFLite) del modelo de sintesis de voz `empero-ai/PiVo-1.4M`, realizada por la comunidad `litert-community`. Se trata de un modelo TTS en ingles de dos voces (Pi y Vo) con solo 1.401.562 parametros, vocoder incluido, pensado para inferencia en dispositivo (on-device) sobre CPU de moviles Android. La conversion se hizo con litert-torch 0.10.0 para LiteRT 2.3.0.

El modelo original publica grafos ONNX sin codigo PyTorch, por lo que la conversion requirio reescribir en PyTorch los cuatro grafos (encoder, decoder, conditioning y vocoder), cargar los pesos ONNX y convertir todo a float32. El resultado son grafos de formas fijas: encoder en cinco tamanos (hasta 32, 64, 128, 256 y 512 tokens), decoder que genera 16 tramas (160 ms) por llamada y vocoder que produce una trama de 10 ms por llamada.

Es relevante porque demuestra que un TTS de calidad razonable puede ejecutarse en tiempo real en un solo hilo de CPU de un movil moderno: en un Galaxy S26 genera un segundo de audio en 27,5-28,6 ms, muy por debajo del tiempo real. El repositorio incluye un host en Python y un runner en C++ para Android, aunque no hay aplicacion Android publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Acustica + vocoder derivado de FARGAN (grafos LiteRT: encoder, decoder, conditioning, vocoder) |
| Parametros totales | 1.401.562 (vocoder incluido) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; limites de entrada: 2.000 caracteres, 512 tokens, 30 s por locucion |
| Tipos de cuantizacion | float32 (unico formato publicado en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT / TFLite (grafos float32); modelo base en ONNX |

## Arquitectura y entrenamiento
El modelo es un sistema TTS en dos etapas. El modelo acustico predice cada 10 ms 18 coeficientes cepstrales, el pitch y la correlacion de pitch; un vocoder derivado de FARGAN convierte esas predicciones en audio mono a 16 kHz. La conversion a LiteRT reescribio los cuatro grafos en PyTorch (encoder, decoder, conditioning y vocoder) a partir de los pesos ONNX del modelo original, con formas fijas para permitir la ejecucion en LiteRT.

No se dispone de informacion sobre los datos de entrenamiento del modelo original (numero de tokens, composicion del corpus, uso de RLHF/DPO) en la informacion proporcionada. El frontend de texto del host usa el diccionario de pronunciacion CMU, admite numeros, importes monetarios, ordinales y fechas ISO, y permite anadir pronunciaciones en ARPAbet mediante overrides. La velocidad de habla es configurable entre 0.5 y 2.0.

## Capacidades
- Sintesis de voz en ingles a 16 kHz mono con dos voces: Pi y Vo.
- Generacion por tramas de 10 ms mediante el vocoder y por bloques de 160 ms mediante el decoder.
- Control de velocidad de habla (0.5 a 2.0).
- Entrada de texto con normalizacion basica: numeros, moneda, ordinales y fechas ISO.
- Soporte de pronunciacion personalizada mediante overrides en ARPAbet.
- Ejecucion on-device en CPU de un solo hilo, sin GPU.
- API Python (`PiVoLiteRT`) con metodos `save`, `synthesize` e `iter_audio` (streaming por tramas).
- Runner en C++ usando la API C de LiteRT para Android.
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente TTS.

## Casos de uso
- Lectura por voz en aplicaciones Android: el modelo cabe en un movil y genera audio mas rapido que tiempo real en un solo hilo de CPU, lo que permite sintetizar frases bajo demanda sin conexion.
- Accesibilidad para personas con discapacidad visual: lectura de notificaciones, mensajes y contenido de pantalla con latencia de decenas de milisegundos por segundo de audio.
- Asistentes de voz offline: integracion del runner C++ en un servicio Android para respuestas habladas sin enviar texto a la nube.
- Generacion de avisos y alertas en dispositivos embebidos: el tamano reducido (1,4 M de parametros) y el formato TFLite permiten desplegarlo en hardware con recursos limitados.
- Prototipado de interfaces conversacionales: el host Python con `iter_audio` facilita la reproduccion en streaming trama a trama para pruebas de UX.
- Dooblaje o locucion automatizada de contenido corto en ingles: con el control de velocidad y las dos voces disponibles para alternar narradores.
- Pruebas de regresion de pipelines TTS: el flag `--check` compara la salida LiteRT con la del modelo ONNX original usando WER, similitud de hablante y correlacion log-mel.

## Benchmarks y rendimiento
La model card no publica benchmarks clasicos (MMLU, HumanEval, GSM8K), pero si mediciones de velocidad y fidelidad frente al modelo original en ONNX Runtime.

| Medicion | Resultado |
|---|---|
| Velocidad en Galaxy S26 (CPU, 1 hilo) | 27,5 ms y 28,6 ms por segundo de audio (dos ejecuciones, 2026-11-08) |
| Formato de audio | 16 kHz mono, tramas de 10 ms |
| Correlacion log-mel Pi (Galaxy S26 vs ONNX Runtime) | 0,9999993 |
| Correlacion log-mel Vo (Galaxy S26 vs ONNX Runtime) | 0,9999997 |
| WER (54 locuciones, Whisper large-v3-turbo) | 0,73 % (0 transcripciones distintas de la referencia) |
| Similitud de hablante minima (ECAPA) | 0,99983 |
| Correlacion log-mel minima | 0,99982 |
| Locuciones con la misma longitud que la referencia | 54 de 54 |
| Medicion en Pixel 11 Pro | mencionada en la model card, sin cifras en la informacion disponible |

## Requisitos de hardware
- Inferencia en CPU de un solo hilo; no requiere GPU ni aceleradores dedicados.
- VRAM estimada: no aplica; el modelo pesa 1,4 M de parametros en float32 (unos pocos MB) y el repo ocupa 0,0 GB.
- Dispositivos probados: Galaxy S26 y Pixel 11 Pro (Android).
- Tambien ejecutable en CPU de escritorio: las comprobaciones se hicieron en un Apple M4 Max con un hilo de CPU.
- Despliegue: LiteRT 2.3.0 (API C++ para Android), host Python con `litert-torch` y paquetes fijados en `host/requirements.txt` (Python 3.12).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un TTS).
- Latencia: aproximadamente 28 ms por segundo de audio en Galaxy S26, es decir, unas 35 veces mas rapido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| PiVo-1.4M (LiteRT) | 1.401.562 | en | LiteRT/TFLite | apache-2.0 | TTS on-device, 2 voces |
| empero-ai/PiVo-1.4M | 1.401.562 | en | ONNX | no disponible en la informacion proporcionada | Modelo base del que deriva esta conversion |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa con otras alternativas TTS.

## Limitaciones y advertencias
- Solo admite ingles; el frontend lanza error ante palabras ausentes del diccionario CMU salvo que se aporte una pronunciacion en ARPAbet.
- Limites estrictos de entrada: 2.000 caracteres, 512 tokens y 30 segundos por locucion.
- Solo hay dos voces (Pi y Vo); no hay clonacion de voz ni control de estilo o emocion.
- Los grafos tienen formas fijas; el encoder debe elegirse entre los cinco tamanos disponibles (hasta 32, 64, 128, 256 y 512 tokens).
- Solo se publican pesos en float32; no hay variantes cuantizadas en este repositorio.
- No hay aplicacion Android publicada; el uso en dispositivo requiere compilar el runner C++.
- No se documentan sesgos del modelo ni tasas de alucinacion en la informacion proporcionada; al ser TTS, el riesgo principal es de pronunciacion incorrecta o prosodia degradada en textos fuera del dominio.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los componentes (diccionario CMU, vocoder FARGAN) antes de produccion.
- El rendimiento medido corresponde a un Galaxy S26 y un Apple M4 Max; en dispositivos de gama baja la latencia puede ser mayor.

## Enlaces
- Repositorio LiteRT: https://huggingface.co/litert-community/PiVo-1.4M
- Modelo base: https://huggingface.co/empero-ai/PiVo-1.4M
- Instrucciones de compilacion del runner: `runner/README.md` dentro del repositorio
- Muestras de audio: `samples/pi_litert.wav`, `samples/vo_litert.wav`, `samples/pi_reference.wav`, `samples/vo_reference.wav`
- Espectrogramas: `samples/spectrogram.png`
