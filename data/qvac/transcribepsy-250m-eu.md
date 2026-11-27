# qvac/TranscribePsy-250M-EU

## Resumen

TranscribePsy-250M-EU es un modelo compacto de reconocimiento automatico del habla (ASR) multilingue de 254 millones de parametros, desarrollado por qvac (Tether) y destilado a partir de nvidia/parakeet-tdt-0.6b-v3. Esta disenado especificamente para su despliegue en dispositivos de borde (portatiles y telefonos moviles), cubriendo 25 lenguas europeas entre las que se incluyen el espanol, el aleman, el frances, el italiano, el portugues y el neerlandes, ademas de lenguas eslavas, balticas y el maltes.

El modelo emplea una arquitectura FastConformer con decodificador de tipo transducer (TDT) y un diseno de adaptadores enrutados por idioma denominado CAFE, descrito en el paper arXiv:2610.19134. Con solo 254M de parametros, el autor reporta que supera en precision a modelos de tres a cuatro veces su tamano en las suites de evaluacion Multilingual LibriSpeech y Common Voice, y que lidera la categoria de ~250M en las tres suites probadas (Open ASR Leaderboard, MLS y Common Voice).

Su relevancia actual radica en la combinacion de tres factores: pesos abiertos bajo licencia Apache 2.0, un rendimiento en error por palabra que compite con modelos mucho mayores, y un ecosistema de despliegue ya publicado (GGUF de 8 bits para CPUs de telefono y Core ML para el Apple Neural Engine), lo que lo convierte en una opcion realista para transcripcion on-device en produccion sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador transducer TDT y adaptadores enrutados por idioma (CAFE) |
| Parametros totales | 253.954.838 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (build GGUF de la variante EU-sub); Core ML (variante EU-sub); pesos PyTorch originales |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint PyTorch/NeMo); variantes GGUF y Core ML en repos separados |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer, una variante eficiente del Conformer con atencion submuestreada, acoplada a un decodificador transducer TDT (Token-and-Duration Transducer). Sobre esta base, el autor incorpora CAFE, un diseno de adaptadores enrutados por idioma que permite cubrir 25 lenguas europeas manteniendo un tamano compacto. El modelo es un finetune destilado de nvidia/parakeet-tdt-0.6b-v3, que actua como profesor.

No se dispone en la informacion proporcionada de datos sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (procedimientos no habituales en ASR). El paper asociado (arXiv:2610.19134) describe el diseno CAFE y es la referencia tecnica para los detalles de entrenamiento. La familia incluye una variante EU-sub entrenada sobre los ocho idiomas de Multilingual LibriSpeech, con menor error en esos idiomas, y builds GGUF (Q8_0) y Core ML de dicha variante para despliegue en CPU de telefono y en el Apple Neural Engine respectivamente.

## Capacidades

- Reconocimiento automatico del habla multilingue en 25 lenguas europeas con un unico modelo.
- Transcripcion de audio de formato corto y largo (la variante Core ML procesa 10 minutos de audio en 1,65 segundos en un iPhone 17 Pro Max).
- Enrutamiento implicito por idioma mediante adaptadores CAFE, sin necesidad de especificar el idioma en inferencia.
- Despliegue on-device: builds para CPU de telefono (GGUF Q8_0 via qvac-fabric-speech.cpp) y para Apple Neural Engine (Core ML).
- Inferencia de baja latencia: factor de tiempo real de 0,052 y arranque en frio de 252 ms en el build GGUF.
- Consumo de memoria reducido: 534 MiB de pico a 10 segundos de audio en el build GGUF.
- No se documentan capacidades de traduccion, diarizacion, deteccion de emociones ni tool calling; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en el dispositivo: el modelo procesa audio localmente con 534 MiB de pico de memoria, lo que permite transcribir conversaciones en portatiles y telefonos sin enviar datos a la nube, relevante por privacidad y por coste de infraestructura.
- Subtitulado automatico de video en produccion: con un factor de tiempo real de 0,052, un minuto de audio se transcribe en aproximadamente tres segundos en CPU de telefono, lo que hace viable generar subtitulos en lote para catalogos multilingues europeos.
- Asistentes de voz embebidos en aplicaciones moviles: el build Core ML sobre el Apple Neural Engine procesa 10 minutos de audio en 1,65 segundos con menos de la mitad de disco y 1,7x menos memoria que otro modelo Core ML de ASR, adecuado para dictado y comandos de voz.
- Atencion al cliente y centros de contacto: la cobertura de 25 lenguas europeas permite transcribir llamadas y chats de voz en mercados como Espana, Alemania, Francia, Italia, Polonia o los paises nordicos con un unico modelo, simplificando el pipeline de analitica de voz.
- Cumplimiento y archivado de audio regulado: al ejecutarse on-device con licencia Apache 2.0, permite transcribir grabaciones sensibles (sanitario, legal, administracion publica) sin salida de datos a terceros.
- Investigacion en linguistica computacional: la disponibilidad de pesos, scripts de evaluacion y el paper CAFE facilita reproducir experimentos de ASR multilingue y comparar estrategias de adaptadores por idioma.
- Accesibilidad: transcripcion en tiempo real de clases, conferencias y contenido audiovisual para personas con discapacidad auditiva, con latencia compatible con subtitulado en directo.

## Benchmarks y rendimiento

Resultados de error por palabra (WER, menor es mejor) reportados por el autor:

| Suite | TranscribePsy-250M-EU | Whisper-small (242M) | omniASR-CTC-300M-v2 (326M) | OWSM v4 small (370M) |
|---|---|---|---|---|
| Open ASR Leaderboard | 8,02 | 12,34 | 15,31 | 9,72 |
| Multilingual LibriSpeech (media 8 idiomas) | 6,58 | 11,51 | 11,89 | 11,84 |
| Common Voice | 21,56 | 38,17 | 32,23 | 37,74 |

Comparacion con modelos de mayor tamano en Multilingual LibriSpeech y Common Voice:

| Modelo | Parametros | MLS | Common Voice |
|---|---|---|---|
| TranscribePsy-250M-EU | 254M | 6,58 | 21,56 |
| Qwen3-ASR-0.6B | 782M | 12,60 | no disponible |
| omniASR-CTC-1B-v2 | 976M | 7,71 | 20,07 |
| Whisper-Medium | 764M | 7,76 | no disponible |
| OWSM-CTC-v4 | 1,01B | 10,65 | no disponible |

Metricas de despliegue on-device (build GGUF de EU-sub, media de seis telefonos): factor de tiempo real 0,052, pico de memoria 534 MiB a 10 s, arranque en frio 252 ms. La latencia es 2,6x menor que omniASR-CTC-300M-v2, 5,7x menor que Whisper-small y entre 7,5x y 15x menor que los tres modelos mayores comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 254M de parametros en fp16 el peso ronda los 0,5 GB y en Q8_0 aproximadamente 0,25 GB, mas el pico de memoria de trabajo reportado de 534 MiB a 10 s de audio.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo esta orientado a CPU y aceleradores de borde.
- Cabe en GPU de consumo: si, cualquier GPU consumer moderna puede alojar el modelo completo en memoria; no se publican cifras de throughput por GPU.
- Despliegue: NeMo (checkpoint PyTorch), qvac-fabric-speech.cpp con GGUF Q8_0 para CPU de telefono, Core ML para Apple Neural Engine. No se mencionan vLLM, llama.cpp ni TGI (no aplicables a ASR).
- Latencia y throughput: factor de tiempo real de 0,052 en CPU de telefono (build GGUF); 10 minutos de audio en 1,65 s en un iPhone 17 Pro Max (build Core ML).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | WER MLS |
|---|---|---|---|---|---|
| TranscribePsy-250M-EU | 254M | 25 europeas | Apache 2.0 | safetensors, GGUF, Core ML | 6,58 |
| Whisper-small | 242M | multilingue amplio | MIT (según modelo original de OpenAI) | PyTorch, GGUF via terceros | 11,51 |
| omniASR-CTC-300M-v2 | 326M | multilingue | no disponible en la informacion | no disponible | 11,89 |
| OWSM v4 small | 370M | multilingue | no disponible en la informacion | no disponible | 11,84 |

TranscribePsy-250M-EU es el unico de la comparativa con builds oficiales para CPU de telefono y Apple Neural Engine publicados por el propio autor, y el de menor WER en MLS entre los modelos de tamano similar.

## Limitaciones y advertencias

- Cobertura limitada a 25 lenguas europeas; no soporta arabe, chino, japones, coreano ni lenguas africanas o indigenas.
- El WER en Common Voice (21,56) es notablemente superior al de MLS (6,58), lo que sugiere menor robustez ante audio espontaneo, ruidoso o con acentos marcados.
- No se publican datos sobre sesgos por acento, genero, edad o dialecto dentro de cada idioma.
- Riesgo de alucinacion y de transcripciones erroneas en audio con ruido, solapamiento de hablantes o dominio muy especializado (terminologia medica, juridica, jerga).
- El modelo es exclusivamente ASR: no realiza traduccion, diarizacion ni comprension semantica.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets de entrenamiento subyacentes (no detalladas en la informacion disponible).
- La variante EU-sub tiene menor error en sus ocho idiomas, pero cubre menos lenguas; elegir en funcion del caso de uso.
- No se dispone de informacion sobre el comportamiento con audio de muy larga duracion mas alla del ejemplo de 10 minutos en Core ML.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/TranscribePsy-250M-EU
- Variante EU-sub: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub
- Build GGUF: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-gguf
- Build Core ML: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-coreml
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Paper CAFE: https://arxiv.org/abs/2610.19134
- Motor de inferencia: https://github.com/tetherto/qvac-fabric-speech.cpp
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Catalogo QVAC: https://qvac.tether.io/products/models
