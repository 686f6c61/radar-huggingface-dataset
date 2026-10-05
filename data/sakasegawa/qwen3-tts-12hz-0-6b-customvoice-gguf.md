# sakasegawa/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF es una conversion a formato GGUF del modelo de sintesis de voz Qwen3-TTS en su variante de 12 Hz y 0,6B de parametros, publicada por el usuario sakasegawa. El modelo original lo desarrolla el equipo Qwen, y esta version es una cuantizacion orientada exclusivamente a speech.cpp, una implementacion en C++ sobre ggml que funciona con Metal, Vulkan y CPU. El repositorio incluye dos ficheros: el "talker" con el predictor de codigos, los embeddings de texto y el tokenizer en Q8_0, y el decoder del codec de 12 Hz en F16.

La relevancia de esta publicacion esta en que permite ejecutar un sistema TTS de casi 906 millones de parametros en hardware modesto (se miden 1,6 GB de VRAM en una RTX 2080) con un factor de tiempo real inferior a 0,4, lo que habilita sintesis mas rapida que el tiempo real incluso en CPU. Frente a la implementacion oficial en Python, el autor documenta que con pesos F32 los logits y los codigos generados coinciden con la referencia, y que la cuantizacion Q8_0 introduce una desviacion de entre el 2 y el 5 por ciento en los logits.

El modelo soporta diez idiomas (aleman, ingles, espanol, frances, italiano, japones, coreano, portugues, ruso y chino) mas un modo automatico, y ofrece nueve voces predefinidas. Su licencia Apache 2.0, heredada del checkpoint oficial, permite uso comercial. El principal caveat es que estos ficheros solo funcionan en speech.cpp: no son compatibles con llama.cpp, LM Studio, Ollama ni otros lectores de GGUF, porque su disposicion interna es especifica de esa herramienta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en "talker" con predictor de codigos y decoder de codec a 12 Hz (segun la model card y los ficheros publicados); no se detalla la topologia interna completa |
| Parametros totales | 905.788.672 (dato de safetensors del modelo base); el nombre comercial indica 0,6B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (modelo de sintesis de voz; la model card no documenta ventana de contexto textual) |
| Tipos de cuantizacion | Q8_0 en las matrices del talker y el predictor de codigos; F32 en normas, sesgos y codebooks del codec; F16 en el decoder del codec |
| Idiomas soportados | de, en, es, fr, it, ja, ko, pt, ru, zh y auto (etiquetas BCP 47) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en dos ficheros con disposicion especifica de speech.cpp |

Ficheros del repositorio:

| Fichero | Contenido | Tamano | SHA-256 |
|---|---|---|---|
| qwen3-tts-0.6b-customvoice-q8_0.gguf | Talker 0,6B, predictor de codigos, embedding de texto y tokenizer, Q8_0 | 968 MB | 4a819d1c9d9c6358bd5dc1ded15f93db970fbaeac9f0a021dfae62c242682baf |
| qwen3-tts-codec-12hz-f16.gguf | Decoder del codec de 12 Hz, F16 | 246 MB | 38763be32099ad36b7b4345fc852ac379fb4fde0782ff85929d2b984b4bc22c1 |

Ambos ficheros son necesarios para cualquier sintesis. El fichero del codec es el mismo que se usa en el repositorio de la variante de 1,7B.

## Arquitectura y entrenamiento

No se documenta en la informacion disponible el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se detalla es la estructura de la conversion: el sistema se compone de un "talker" de 0,6B con un predictor de codigos que genera codigos de audio, y de un decoder de codec que opera a 12 Hz, es decir, 12 tramas de audio por segundo. La conversion se realizo con el script reference/qwen3-tts/convert.py de speech.cpp a partir del checkpoint oficial Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice en el commit 85e237c12c027371202489a0ec509ded67b5e4b5, y el decoder del codec procede del speech_tokenizer del checkpoint, compartido entre las variantes de 0,6B y 1,7B.

La innovacion tecnica relevante de esta publicacion es la implementacion en ggml con decodificacion frame a frame que produce las mismas muestras que decodificar la locucion completa. Se ha verificado en Metal, en Vulkan sobre NVIDIA y en CPU. En cuanto a precision, las matrices del talker y del predictor de codigos se cuantizan a Q8_0, mientras que las normas, los sesgos y los codebooks del codec se mantienen en F32 y el decoder del codec en F16; en Metal esa eleccion de F16 produce las mismas muestras que F32 porque los productos matriciales se ejecutan igualmente en media precision. Como referencia de fidelidad, el decoder del codec iguala a la implementacion oficial con 114 dB de SNR en CPU con pesos F32.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, con salida a fichero WAVE o por streaming frame a frame.
- Nueve voces predefinidas: aiden, dylan, eric, ono_anna, ryan, serena, sohee, uncle_fu y vivian.
- Diez idiomas: aleman, ingles, espanol, frances, italiano, japones, coreano, portugues, ruso y chino, ademas del modo auto para delegar la deteccion en el modelo.
- Dialectos: las voces dylan y eric hablan el dialecto de Pekin y el de Sichuan cuando el idioma es zh o auto, igual que en la implementacion oficial.
- Decodificacion por tramas: speech.cpp decodifica el audio trama a trama obteniendo las mismas muestras que una decodificacion completa.
- Integracion como servicio: speech-server expone la API de audio de OpenAI mediante POST /v1/audio/speech.
- Procesamiento por lotes: speech-worker implementa un trabajador basado en JSON Lines.
- No se documentan capacidades de clonacion de voz, controlemocional, tool calling, agentes ni multimodalidad mas alla del propio audio de sintesis.

## Casos de uso

- Lectura por voz de articulos y documentacion en aplicaciones de accesibilidad: el modelo cubre diez idiomas con voces estables y un factor de tiempo real de 0,31 en una RTX 2080, por lo que puede generar parrafos completos sin esperas perceptibles.
- Asistentes conversacionales con respuesta hablada: gracias a que speech.cpp decodifica trama a trama y el primer audio aparece en 0,04-0,07 segundos, el modelo encaja en bucles de dialogo donde se necesita empezar a reproducir antes de tener la frase completa.
- Generacion de audiolibros y podcasts en varios idiomas: las nueve voces permiten repartir narradores distintos entre secciones, y los ficheros de 968 MB y 246 MB caben en cualquier portatil actual.
- Doblaje y localizacion de contenidos: con soporte para de, en, es, fr, it, ja, ko, pt, ru y zh y modo auto, se puede sintetizar un mismo guion en varios idiomas sin cambiar de herramienta.
- Prototipado de interfaces de voz en local: al ejecutarse en CPU y en Metal sin dependencias de Python, se integra en entornos de desarrollo sin GPU dedicada.
- Servicio interno de TTS autoconsumo: speech-server expone un endpoint compatible con la API de audio de OpenAI, de modo que el modelo puede sustituir a proveedores externos en aplicaciones que ya hablan ese contrato.
- Generacion de avisos y notificaciones habladas en sistemas embebidos o de escritorio: el consumo de VRAM medido es de 1,6 GB con Vulkan y el binario Linux x64 puede ejecutarse solo con CPU.
- Pruebas automatizadas de pipelines de audio: speech-worker con protocolo JSON Lines permite encolar sintesis de forma desacoplada en un flujo de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de sintesis de voz. La model card si incluye mediciones de fidelidad frente a la implementacion oficial y de velocidad.

Fidelidad:

| Prueba | Resultado |
|---|---|
| Logits del talker y del predictor de codigos con pesos F32 | Coinciden con la implementacion oficial |
| Codigos generados con pesos F32 y decodificacion greedy | Identicos en cada trama de la locucion de prueba |
| Decoder del codec con pesos F32 en CPU | 114 dB de SNR frente al oficial |
| Decodificacion trama a trama frente a locucion completa | 133 dB |
| Desviacion de logits con Q8_0 | Entre 2 y 5 por ciento; la decodificacion greedy se separa de los codigos oficiales tras unas pocas tramas |

Velocidad (pesos Q8_0, frases en japones, despues de compilar los shaders):

| Dispositivo | Primer audio | Factor de tiempo real | VRAM |
|---|---|---|---|
| Apple M5, Metal | 0,04 s | 0,38 | no disponible |
| RTX 2080, Vulkan | 0,07 s | 0,31 | 1,6 GB |

## Requisitos de hardware

- Almacenamiento: 968 MB para el fichero del talker en Q8_0 y 246 MB para el decoder del codec en F16, unos 1,2 GB en total (coincide con el tamano del repositorio).
- VRAM: 1,6 GB medidos en una RTX 2080 con backend Vulkan. La cifra no se publica para Metal.
- GPU compatibles: cualquier GPU con soporte de Vulkan (probado en NVIDIA) o Metal en Apple Silicon (probado en un M5). No se documentan requisitos minimos de generacion.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo actual, dado el consumo de 1,6 GB. Se ha verificado en una RTX 2080.
- CPU: soportada de forma nativa mediante el backend ggml; el binario de Linux x64 puede funcionar solo con CPU.
- Latencia y throughput: primer audio en 0,04 s en Apple M5 con Metal y 0,07 s en RTX 2080 con Vulkan; factor de tiempo real de 0,38 y 0,31 respectivamente, es decir, entre 2,6 y 3,2 veces mas rapido que el tiempo real en esos equipos.
- Opciones de despliegue: exclusivamente speech.cpp (version 0.3.0 o posterior; las herramientas speech-tts y speech-server y los binarios de Linux llegaron con la 0.5.0). Incluye CLI speech-tts, trabajador speech-worker con protocolo JSON Lines, servidor HTTP speech-server con endpoint compatible con la API de audio de OpenAI y una API en C.
- Incompatibilidades: no funciona en llama.cpp, LM Studio, Ollama ni otros programas que lean GGUF, porque la disposicion de los ficheros es especifica de speech.cpp.
- Binarios precompilados disponibles para macOS arm64 (Metal), Windows x64 (Vulkan) y Linux x64 (Vulkan o CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frecuencia | Idiomas | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF (este) | 905.788.672 (etiquetado como 0,6B) | Codec a 12 Hz; contexto textual no disponible | 10 idiomas + auto | Apache 2.0 | GGUF en dos ficheros para speech.cpp; 0 descargas y 0 likes en el momento de la consulta |
| Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF | no disponible en la informacion proporcionada | Codec a 12 Hz; comparte el fichero de codec con la variante de 0,6B | 10 idiomas + auto (misma familia) | Apache 2.0 | GGUF para speech.cpp; repositorio sakasegawa/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (checkpoint oficial) | 905.788.672 (safetensors) | Codec a 12 Hz | 10 idiomas | Apache 2.0 | Pesos originales; requiere la implementacion oficial en Python |
| Otras alternativas TTS de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se ha proporcionado informacion de otros modelos comparables |

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros solo se ejecutan en speech.cpp. No funcionan en llama.cpp, LM Studio, Ollama ni en cualquier otro lector de GGUF generico.
- Version minima de runtime: se requiere speech.cpp 0.3.0 o superior, porque los nombres de idioma usan etiquetas BCP 47 que las versiones anteriores no interpretan.
- Desviacion por cuantizacion: con Q8_0 los logits se desvian entre un 2 y un 5 por ciento respecto a F32, y una decodificacion greedy se aleja de los codigos oficiales tras unas pocas tramas. El autor indica que con el muestreo por defecto (temperatura 0,9 y top-k 50) la calidad del habla es equivalente.
- Dependencia de dos ficheros: cualquier sintesis necesita tanto el fichero del talker como el del codec; no se puede usar uno solo.
- Adopcion no validada por la comunidad: el repositorio registra 0 descargas y 0 likes en la informacion consultada, por lo que no existe retroalimentacion publica sobre su comportamiento en produccion.
- Voces fijas: la model card solo documenta nueve voces predefinidas. No se describe clonacion de voz ni control emocional o de prosodia, pese a la denominacion "CustomVoice" del modelo base.
- Idioma y dialectos: el soporte de dialectos de Pekin y Sichuan esta limitado a las voces dylan y eric y a los modos zh o auto. No se documenta el comportamiento en idiomas distintos de los diez listados.
- Riesgo de uso indebido: al ser un sistema de sintesis de voz, existe riesgo de suplantacion o de generacion de audio enganoso si se emplean las voces predefinidas sin consentimiento ni trazabilidad.
- Licencia: los pesos son del equipo Qwen bajo Apache 2.0, la misma que el checkpoint oficial. El autor remite a Qwen3-TTS para consultar el modelo, su paper y sus terminos, por lo que conviene revisar esas condiciones antes de un despliegue comercial.
- Ausencia de benchmarks estandar: no hay resultados de evaluacion subjetiva (MOS) ni comparativas con otros sistemas TTS en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sakasegawa/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Variante de 1,7B en GGUF: https://huggingface.co/sakasegawa/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF
- Repositorio oficial Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Implementacion speech.cpp: https://github.com/nyosegawa/speech.cpp
- Binarios de speech.cpp: https://github.com/nyosegawa/speech.cpp/releases
- Tabla de modelos soportados por speech.cpp: https://github.com/nyosegawa/speech.cpp#readme
