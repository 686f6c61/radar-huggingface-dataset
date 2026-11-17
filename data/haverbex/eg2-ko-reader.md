# Haverbex/eg2-ko-reader

## Resumen

EG2-KO Reader es un modelo de reconocimiento automatico del habla (ASR) para coreano que se construye sobre el codificador de audio congelado de EmbeddingGemma 2 (EG2) de Google. Lo desarrolla el autor independiente Haverbex y su planteamiento es deliberadamente minimalista: en lugar de entrenar un sistema ASR completo, se entrena unicamente un "reader" de aproximadamente 19,7 millones de parametros (79 MB en fp32) que lee las representaciones que produce el codificador de EG2 (25 vectores por segundo, de 512 dimensiones cada uno) y elige, para cada vector, uno de 1.035 silabos hangul o el simbolo blank.

El modelo resuelve un problema de integracion concreto: aplicaciones que ya embeben el codificador de audio de EG2 pueden anadir transcripcion en coreano sin cargar un segundo codificador, ya que el reader es muy ligero. La arquitectura del reader es un transformer bidireccional de 6 capas con salida CTC codiciosa, sin decodificador autorregresivo ni modelo de lenguaje, de modo que toda la transcripcion se resuelve en un unico pase de calculo.

Es relevante ahora por su eficiencia y por su estrategia de reutilizacion de un codificador multimodal ya existente, aunque su alcance es limitado: solo evaluado en habla leida, solo salida en silabos hangul y espacios, y con una licencia que no es de codigo abierto segun la definicion de la OSI. El repositorio ocupa 1,6 GB porque incluye una copia sin modificar del codificador (1,49 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reader: transformer bidireccional de 6 capas con cabeza CTC sobre el codificador de audio congelado de EmbeddingGemma 2 |
| Parametros totales | Reader: ~19,7 M (79 MB en fp32); el repositorio incluye ademas el codificador EG2 sin modificar (1,49 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Sin limite de longitud de entrada: se procesa en ventanas de 30 s con solapamiento de 3,84 s |
| Tipos de cuantizacion | fp32 (reader en safetensors) y fp16 (bundle Core AI de 40 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Coreano (ko) |
| Licencia | EG2-KO Reader License 1.0 para reader, codigo y bundle Core AI (source-available, no OSI); encoder/ bajo Apache-2.0 |
| Formato de pesos | safetensors (reader), bundle .aimodel para Core AI (fp16); codificador en el formato original de google/embeddinggemma-2 |

## Arquitectura y entrenamiento

El pipeline es el siguiente: la entrada de audio a 16 kHz se convierte en log-mel, pasa por el codificador de audio de EG2 (congelado, sin modificaciones) que emite un vector de 512 dimensiones cada 40 ms, y esos vectores alimentan un reader de 6 capas transformer bidireccional que produce, para cada vector, una distribucion sobre 1.035 silabos hangul mas blank. La decodificacion es CTC codiciosa: se eliminan blanks y silabos repetidos en las zonas solapadas. No hay decodificador autorregresivo ni modelo de lenguaje, por lo que la inferencia completa se resuelve en un solo pase.

El entrenamiento uso aproximadamente 47 horas de Zeroth-Korean y FLEURS ko (ambos CC BY 4.0) mas unas 460 horas de YODAS2 coreano (videos de YouTube con licencia CC BY, CC BY 3.0), filtradas por un CER inferior al 10 % entre la retranscripcion automatica (generada con Qwen3-Omni) y los subtitulos originales. El autor advierte que no hubo revision legal sobre el uso de audio de YouTube ni de las etiquetas generadas por maquina. Se entreno con una unica semilla y no se reportan intervalos de confianza para los conjuntos de test. No se documenta uso de RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en coreano, salida en silabos hangul y espacios.
- Procesamiento de audio de duracion ilimitada mediante ventanas de 30 s con solapamiento de 3,84 s.
- Entrada de audio en formatos leidos por libsndfile: wav, flac, ogg y mp3 (remuestreado a 16 kHz mono).
- Inferencia en un unico pase CTC, sin generacion token a token.
- Ejecucion en CPU, GPU CUDA, Apple MPS y Core AI (macOS/iOS) mediante el bundle .aimodel.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio generativo ni modo thinking.
- No produce puntuacion, digitos ni letras latinas (los numeros y el ingles se emiten como pronunciacion hangul).
- No hace streaming ni diarizacion de hablantes.

## Casos de uso

- Integracion en aplicaciones que ya usan EG2: al reutilizar el codificador de audio ya cargado, solo se anade el reader de 79 MB, evitando duplicar un codificador de 1,49 GB en memoria.
- Transcripcion por lotes de habla leida en coreano: audios de narracion, audiolibros o locuciones pueden transcribirse con un CER de 7,26 % en Zeroth-Korean test, adecuado para generar subtitulos en hangul que luego se postprocesan.
- Generacion de subtitulos en hangul para contenido en coreano: aunque no emite puntuacion ni digitos, la salida sirve como base para un postprocesado con puntuacion y normalizacion numerica.
- Despliegue en Mac y dispositivos iOS: el bundle Core AI en fp16 (40 MB) permite transcripcion local en el dispositivo con un consumo maximo de 3,4 GB y un rendimiento de 60 minutos de audio en 5,50 s en un M5 Pro.
- Investigacion en ASR de bajo coste: sirve como referencia para estudiar la reutilizacion de codificadores multimodales congelados en tareas de reconocimiento del habla.
- Prototipado rapido en CPU o GPU de consumo: el reader es pequeno y la decodificacion CTC no requiere generacion autorregresiva, lo que simplifica el despliegue en entornos con recursos limitados.
- Evaluacion comparativa de codificadores congelados: el modelo permite medir cuanto rendimiento ASR se obtiene solo con un reader ligero sobre representaciones preentrenadas de EG2.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Utterances | CER (greedy, sin espacios) |
|---|---|---|
| Zeroth-Korean test (hablantes y frases no vistos) | 457 | 7,26 % |
| FLEURS ko test (excluidas 125 no normalizables) | 257 | 5,59 % |
| Zeroth-Korean dev (hablantes solapados con entrenamiento) | 965 | 6,23 % |
| FLEURS ko dev | 157 | 4,68 % |

Con un modelo de lenguaje de silabos anadido, el CER en Zeroth test baja al 6,75 %, pero ese modelo de lenguaje no se ha publicado y no se reproduce con este repositorio. El autor no reporta intervalos de confianza ni multiples semillas. En velocidad, con Core AI en un Apple M5 Pro se transcribieron 60 minutos de audio en 5,50 s (654 veces tiempo real, pico de 3,4 GB de memoria); con PyTorch MPS en el mismo equipo fueron 21,7 s. Estas cifras se midieron con pesos anteriores de la misma arquitectura y mismo tamano de salida.

## Requisitos de hardware

- VRAM estimada: el reader en fp32 ocupa 79 MB; el bundle Core AI en fp16, 40 MB. El codificador EG2 (1,49 GB en disco) domina el consumo; no se publica una cifra exacta de VRAM para el codificador.
- GPU recomendadas: no se especifican modelos concretos; el autor documenta ejecucion en CUDA (load(device="cuda")), Apple MPS y Core AI.
- GPU de consumo: por el tamano del reader es plausible en GPU de consumo, pero no se aportan mediciones de VRAM ni de latencia en GPUs consumer.
- Despliegue: script Python de un solo archivo (eg2_ko_reader.py) con PyTorch; bundle Core AI para macOS/iOS; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo CTC de este tipo).
- Latencia y throughput: 60 min de audio en 5,50 s con Core AI en M5 Pro y 21,7 s con PyTorch MPS en el mismo equipo; no hay datos para CUDA.
- Memoria: pico de 3,4 GB en la medicion con Core AI en M5 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | CER coreano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EG2-KO Reader | Reader ~19,7 M sobre codificador EG2 congelado | Audio sin limite (ventanas de 30 s) | 7,26 % (Zeroth test), 5,59 % (FLEURS test) | EG2-KO Reader License 1.0 (source-available, no OSI) | Hugging Face |
| Whisper (variantes de OpenAI) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| Qwen3-Omni (usado para etiquetar el corpus) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable. La unica referencia cruzada es que Qwen3-Omni se uso para generar las transcripciones automaticas del corpus de entrenamiento, no como modelo comparable evaluado.

## Limitaciones y advertencias

- Solo se evaluo en habla leida; no se midio calidad en conversacion, ruido de fondo ni multiples hablantes simultaneos.
- La salida se limita a silabos hangul y espacios: no hay puntuacion, digitos ni letras latinas; numeros e ingles aparecen como pronunciacion hangul.
- Los silabos fuera del vocabulario (0,33 % en Zeroth test, 0,36-0,41 % en otros splits) no se pueden acertar y se emiten como <unk>.
- No hace subtitulado en tiempo real (streaming) ni diarizacion de hablantes.
- Entrenado con una unica semilla y sin intervalos de confianza en los conjuntos de test.
- Riesgo de alucinacion y errores en las etiquetas: parte del corpus usa transcripciones generadas por maquina (Qwen3-Omni) que pueden contener errores.
- El entrenamiento uso audio de YouTube y etiquetas automaticas sin revision legal, lo que introduce riesgo en cuanto a derechos de autor y condiciones de uso de los datos.
- Licencia EG2-KO Reader License 1.0: particulares pueden usar, modificar y redistribuir sin restriccion de proposito; las organizaciones solo pueden usarlo con fines no comerciales (investigacion, evaluacion, educacion) y necesitan permiso escrito para uso comercial. No es una licencia de codigo abierto segun la OSI.
- El codificador se distribuye bajo Apache-2.0, pero la model card de EmbeddingGemma 2 remite a la Gemma Prohibited Use Policy, que debe respetarse.
- El repositorio incluye el codificador completo (1,49 GB), aunque para ASR solo se usa su parte de audio, lo que aumenta el coste de descarga y almacenamiento.
- No se documenta soporte de cuantizaciones adicionales ni de frameworks de servido de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haverbex/eg2-ko-reader
- Demo Space: https://huggingface.co/spaces/topabaem/eg2-ko-reader-demo
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Bundle Core AI del codificador (referenciado por el autor): https://huggingface.co/mlboydaisuke/EmbeddingGemma-2-Transcribe-CoreAI
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Consultas de uso comercial (discussions del repositorio): https://huggingface.co/Haverbex/eg2-ko-reader/discussions/new
- Licencia del reader (archivo LICENSE en el repositorio): https://huggingface.co/Haverbex/eg2-ko-reader/blob/main/LICENSE
- Atribuciones del corpus (archivo NOTICE en el repositorio): https://huggingface.co/Haverbex/eg2-ko-reader/blob/main/NOTICE
