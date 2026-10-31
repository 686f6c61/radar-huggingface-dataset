# prakharkhatri/IndiCodec

## Resumen

IndiCodec es un códec neuronal de voz de muy baja tasa de bits (1,09 kbps) desarrollado por Prakhar Khatri (prakharkhatri), diseñado para servir como tokenizador de audio en modelos de lenguaje de voz (speech language models) y sistemas TTS. Convierte la voz en dos flujos de tokens enteros —uno de contenido a 25 Hz y otro acústico a 50 Hz— y los reconstruye en audio a 24 kHz.

Su relevancia radica en el enfoque en lenguas índicas: entre los códecs en torno a 1 kbps, es el que mejor conserva la inteligibilidad de las palabras en las 10 lenguas indias evaluadas (hindi, bengalí, gujarati, canarés, malayalam, maratí, odia, panyabí, tamil y télugu), además de funcionar bien en inglés. La arquitectura se basa en NeuCodec de Neuphonic, con un cuantizador de dos flujos FSQ (en lugar de RVQ) como innovación principal.

El modelo tiene 624 M de parámetros (387 M corresponden al extractor de características w2v-BERT 2.0; la decodificación aislada usa 186 M) y se distribuye en un único archivo `model.safetensors` de 2,5 GB bajo licencia Apache 2.0, con todos los datos de entrenamiento bajo licencias abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador w2v-BERT 2.0 + codificador CNN + cuantizadores FSQ de dos flujos + decodificador transformer con cabeza iSTFT (Vocos) |
| Parametros totales | 623.654.848 (624 M) |
| Parametros activos | 186 M en decodificacion; 387 M corresponden a w2v-BERT 2.0 (no es MoE) |
| Longitud de contexto | no disponible (el codificador y decodificador atienden sobre el clip completo; no es streaming) |
| Tipos de cuantizacion | FSQ (Finite Scalar Quantization): contenido FSQ 8x3 niveles (6.561 ids), acustico FSQ 6x6 niveles (46.656 ids) |
| Idiomas soportados | Ingles, hindi, bengali, gujarati, canares, malayalam, marati, odia, panyabi, tamil y telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo unico `model.safetensors`, 2,5 GB) |

## Arquitectura y entrenamiento

IndiCodec emplea un esquema de cuantizacion de dos flujos basado en FSQ, no en RVQ (residual vector quantization). El flujo de contenido (25 Hz) cuantiza las caracteristicas de la capa 16 de w2v-BERT 2.0 en una rejilla FSQ de 8 dimensiones con 3 niveles por dimension (6.561 identificadores, 317 bps) y transporta la informacion linguistica. El flujo acustico (50 Hz) cuantiza, mediante un codificador CNN, aquello que el flujo de contenido no captura: voz y detalle sonoro. Usa una rejilla FSQ de 6 dimensiones con 6 niveles (46.656 ids, 775 bps). Cada fotograma es un identificador por flujo, sin codebook aprendido. Un decodificador transformer con cabeza iSTFT (estilo Vocos) reconstruye el audio a 24 kHz a partir de la suma de ambos flujos; cualquier entrada se remuestrea a 16 kHz.

El modelo parte de los pesos publicados de NeuCodec de Neuphonic, reutilizando su arquitectura, aunque el cuantizador de dos flujos, el entrenamiento del codificador y la receta de entrenamiento son nuevos. Los datos de entrenamiento incluyen, para ingles, Emilia-YODAS (parte inglesa), LibriTTS, LibriTTS-R y VCTK; para las lenguas indias, Rasa, IndicVoices-R e IndicVoices de AI4Bharat; mas unas 15 horas de risas, suspiros y tos de VocalSound. Todas las licencias son abiertas (CC BY 4.0, salvo VocalSound con CC BY-SA 4.0). No se especifica el numero total de tokens/horas ni procesos tipo RLHF (no aplicables a un códec).

## Capacidades

- Tokenizacion de voz en dos flujos discretos: contenido (25 Hz, 6.561 ids) y acustico (50 Hz, 46.656 ids), a 75 tokens por segundo en total.
- Reconstruccion de audio a 24 kHz a partir de los tokens, con entrada remuestreada a 16 kHz.
- Compresion de voz a 1,09 kbps manteniendo inteligibilidad (WER 2,5 % en ingles tras ida y vuelta; CER 6,3 % en lenguas indias).
- Preservacion de la identidad del hablante (similitud de 0,964 en Seed-TTS eval).
- Idiomas: ingles y 10 lenguas indias, con rendimiento destacado en estas ultimas frente a códecs comparables.
- Uso como tokenizador para speech language models y TTS.
- Codificacion y decodificacion mediante una API Python sencilla (`codec.encode` / `codec.decode`).
- No soporta streaming: el codificador y el decodificador atienden sobre el clip completo.
- No apto para musica, solo voz.

## Casos de uso

- Tokenizador para speech language models: los dos flujos de tokens (contenido y acustico) permiten entrenar LLMs de voz con una tasa de 75 tokens/s, inferior a la de Mimi (100) o SNAC (82), reduciendo el coste computacional por segundo de audio.
- TTS de baja latencia de red: como decodificador de tokens a voz, reconstruye audio a 24 kHz con alta similitud de hablante (0,964), util en pipelines de sintesis con clonacion de voz.
- Compresion de voz para almacenamiento o transmision: a 1,09 kbps reduce drasticamente el ancho de banda frente a formatos convencionales, util en sistemas de mensajeria de voz o archivado masivo de grabaciones.
- Sistemas de voz para lenguas indias: es el códec que mejor preserva las palabras en las 10 lenguas indias evaluadas (CER 6,3 % frente al 14,3 % de Mimi), adecuado para asistentes y servicios de voz en India.
- Anotacion y analisis de corpus de voz: la separacion contenido/acustico permite manipular de forma independiente el mensaje linguistico y la voz, util en investigacion de prosodia o anonimizacion parcial.
- Preprocesamiento para ASR y pipelines de datos de voz: la alta inteligibilidad tras el round-trip (WER 2,5 % con Whisper large-v3) lo hace viable para aumentar datos de entrenamiento de reconocedores de habla.
- Modelado de eventos no verbales: el entrenamiento con risas, suspiros y tos (VocalSound) permite representar paralinguistica basica en flujos de conversacion.

## Benchmarks y rendimiento

PESQ-WB (mayor es mejor), hablantes no vistos en entrenamiento:

| Test set | IndiCodec 1,09 kbps | Mimi, 8 codebooks 1,10 kbps | SNAC 24 kHz 0,98 kbps | NeuCodec 0,80 kbps |
|---|---|---|---|---|
| LibriTTS-R test (ingles) | **2,41** | 2,32 | 2,29 | 2,19 |
| CMU-Arctic (ingles) | **2,30** | 2,28 | 2,17 | 2,06 |
| Seed-TTS eval (ingles) | 1,99 | **2,07** | 1,82 | 1,81 |
| FLEURS, 10 lenguas indias | **1,90** | 1,84 | 1,69 | 1,69 |

Inteligibilidad y voz (mayor es mejor):

| Metrica | IndiCodec | Mimi | SNAC | NeuCodec |
|---|---|---|---|---|
| ESTOI, CMU-Arctic (ingles) | **0,855** | 0,848 | 0,835 | 0,824 |
| ESTOI, Seed-TTS eval (ingles) | 0,786 | **0,794** | 0,762 | 0,758 |
| ESTOI, FLEURS, 10 lenguas indias | **0,640** | 0,613 | 0,595 | 0,591 |
| Similitud de hablante, Seed-TTS eval (ingles) | **0,964** | **0,964** | 0,946 | 0,957 |

Palabras tras ida y vuelta (menor es mejor):

| Metrica | IndiCodec | Mimi | SNAC | NeuCodec |
|---|---|---|---|---|
| WER ingles, Seed-TTS eval | **2,5 %** | 3,6 % | 4,9 % | 3,5 % |
| WER ingles, CMU-Arctic | **2,3 %** | 3,2 % | 3,8 % | 2,8 % |
| CER lenguas indias, FLEURS | **6,3 %** | 14,3 % | 13,3 % | 8,9 % |
| Tokens por segundo | 75 | 100 | 82 | 50 |

El WER en ingles se mide con Whisper large-v3; el CER en lenguas indias con IndicConformer 600M (las grabaciones originales puntuan 5,2 %, por lo que IndiCodec anade 1,0 punto). La similitud de hablante es la coseno entre x-vectors de WavLM-base-plus-sv.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explicitamente; con 624 M de parametros en fp32, el modelo completo cabe teoricamente en unas 2,5-3 GB de VRAM, y la decodificacion aislada (186 M) en menos de 1 GB.
- GPU recomendadas: no disponible; cualquier GPU moderna con soporte de PyTorch 2.6 deberia ser suficiente dado el tamano del modelo.
- Consumer GPU: dado el tamano (624 M, archivo de 2,5 GB), es razonable que funcione en GPUs de consumo como una RTX 3060 de 12 GB o superior; no hay confirmacion oficial.
- Despliegue: via Python con PyTorch 2.6.0, torchaudio 2.6.0, transformers 4.51.x, vector-quantize-pytorch 1.17.8, torchtune 0.5.0, torchao 0.9.0 y el paquete neucodec de Neuphonic (sin dependencias, commit `ed3e6cd`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable, al no ser un LLM).
- Latencia y throughput: no disponible; el modelo no es streaming, por lo que la latencia crece con la duracion del clip.

## Comparativa con modelos similares

| Modelo | Bitrate | Tokens/s | Parametros | Licencia | Fortaleza principal |
|---|---|---|---|---|---|
| IndiCodec | 1,09 kbps | 75 | 624 M | Apache 2.0 | Lenguas indias (CER 6,3 %) y WER en ingles (2,5 %) |
| Mimi (Kyutai, 8 codebooks) | 1,10 kbps | 100 | no disponible | no disponible | Mejor PESQ en Seed-TTS eval (2,07) y ESTOI |
| SNAC 24 kHz | 0,98 kbps | 82 | no disponible | no disponible | Menor bitrate entre los comparados con salida a 24 kHz |
| NeuCodec | 0,80 kbps | 50 | no disponible | Apache 2.0 | Menor bitrate y base arquitectonica de IndiCodec |

IndiCodec supera a los tres comparadores en lenguas indias por margen amplio y lidera la mayoria de metricas en ingles, a cambio de un numero de tokens por segundo ligeramente superior a NeuCodec.

## Limitaciones y advertencias

- Solo voz: no esta pensado para musica ni para otro tipo de senales de audio.
- Sin soporte streaming: el codificador y el decodificador atienden sobre el clip completo, lo que limita su uso en conversacion en tiempo real.
- Cobertura linguistica limitada a ingles y 10 lenguas indias; el rendimiento en otras lenguas no esta evaluado y puede degradarse.
- En lenguas indias anade 1,0 puntos de CER sobre el audio original (6,3 % frente a 5,2 %), relevante para aplicaciones que exijan maxima inteligibilidad.
- El flujo de contenido usa solo 6.561 identificadores (317 bps), lo que puede perder matices linguisticos finos en tareas de generacion basada solo en contenido.
- Licencia Apache 2.0, sin restricciones de uso comercial; los datos de entrenamiento son abiertos (CC BY 4.0 y CC BY-SA 4.0), y los pesos de w2v-BERT 2.0 incluidos son de Meta bajo MIT.
- Proyecto individual con pocas descargas (36) y pocos likes (3) en el momento de la ficha: comunidad reducida, sin garantia de mantenimiento a largo plazo.
- Riesgo de alucinacion no aplicable al ser un códec; el riesgo relevante es la degradacion de calidad en hablantes o acentos no vistos en entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/prakharkhatri/IndiCodec
- Muestras de audio: https://codeprakhar25.github.io/IndiCodec/
- Codigo en GitHub: https://github.com/codeprakhar25/IndiCodec
- NeuCodec (base del modelo): https://huggingface.co/neuphonic/neucodec
- Datasets de entrenamiento: https://huggingface.co/datasets/amphion/Emilia-Dataset, https://huggingface.co/datasets/mythicinfinity/libritts, https://huggingface.co/datasets/mythicinfinity/libritts_r, https://huggingface.co/datasets/CSTR-Edinburgh/vctk, https://huggingface.co/datasets/ai4bharat/Rasa, https://huggingface.co/datasets/ai4bharat/indicvoices_r, https://huggingface.co/datasets/ai4bharat/IndicVoices
