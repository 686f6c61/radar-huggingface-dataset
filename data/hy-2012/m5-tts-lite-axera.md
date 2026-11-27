# HY-2012/M5-TTS-Lite.AXERA

## Resumen

M5-TTS-Lite.AXERA es una variante destilada y optimizada para hardware NPU del modelo de sintesis de voz M5-TTS-50M-VoiceClone, desarrollado originalmente por ASLP-lab. La version Lite, publicada por el usuario HY-2012, reduce el decodificador de profundidad (Depth Decoder) de 5 capas y 19,01 M de parametros a 3 capas y 6,69 M de parametros, manteniendo intactos el backbone LM, los embeddings, las cabezas de audio y el codec de voz del modelo profesor. El resultado es un modelo de 137,5 M de parametros totales que ejecuta inferencia completamente sobre NPU AX650, con soporte de streaming y clonacion de voz zero-shot en chino e ingles.

El modelo resuelve el problema de desplegar TTS de calidad con clonacion de voz en dispositivos de borde con acelerador NPU (familia AX650 de Axera), donde no es viable ejecutar el modelo profesor completo. La destilacion se realizo sobre 1.273 horas de audio real (WenetSpeech4TTS Premium, LibriTTS y AISHELL-3), con 695.413 utterances, y los pesos se exportan a seis ficheros axmodel compilados con Pulsar2 8.0.

Es relevante ahora porque demuestra que un TTS zero-shot con clonacion puede ejecutarse en tiempo real (RTF 0,52 en C++) sobre un SoC NPU de bajo consumo, con latencia al primer audio de 0,63 s, sin depender de GPU en la nube. La contrapartida es que la evaluacion objetiva y subjetiva de calidad (CER con ASR, pruebas de naturalidad y similitud de timbre) aun no se ha completado segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autoregresivo con backbone LM y Depth Decoder destilado; codec RVQ (Qwen3-TTS 12 Hz Tokenizer) |
| Parametros totales | 137,5 M (Depth Decoder: 6,69 M; profesor: 19,01 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (referencia de audio <= 4,8 s; generacion <= 20 s) |
| Tipos de cuantizacion | U16 activaciones / S8 pesos con SmoothQuant (compilacion Pulsar2 8.0) |
| Idiomas soportados | chino (zh) e ingles (en); mezcla zh-en entrenada; otros idiomas no verificados |
| Licencia | no disponible |
| Formato de pesos | safetensors (bundle PyTorch) y axmodel (NPU AX650) |
| Frecuencia de muestreo de audio | 24 kHz |
| Libreria | axera |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de TTS autoregresiva por frames: un backbone LM genera tokens latentes que un Depth Decoder refina en profundidad sobre un codebook RVQ, y un decoder de codec reconstruye la forma de onda a 24 kHz. La innovacion principal es la destilacion del Depth Decoder: se reduce de 5 capas (19,01 M de parametros) a 3 capas con FFN de 1024 (6,69 M, una reduccion del 64,8 %), manteniendo el resto de componentes del profesor. El entrenamiento usa 1.273 horas de audio real (WenetSpeech4TTS Premium 799 h, LibriTTS 474 h, AISHELL-3 4 h) con 695.413 utterances y destilacion por KL con temperatura T=2 respecto al profesor.

La exportacion a NPU usa seis axmodel: lm_prefill (32 MB), lm_decode (32 MB), depth_prefill (7 MB), depth_step (7 MB), codec_encoder (42 MB) y codec_decoder (111 MB). La forma de KV del depth_step del estudiante es [3,2,1,2,16,64] frente a [5,...] del profesor. Se emplea decodificacion en streaming con paquetes de 0,64 s y existe tambien un modo no streaming. El codec reutilizado es el Qwen3-TTS 12 Hz Tokenizer (Apache-2.0).

## Capacidades

- Sintesis de voz (text-to-speech) en chino e ingles, incluyendo lectura mixta zh-en.
- Clonacion de voz zero-shot a partir de una referencia de audio de hasta 4,8 s.
- Generacion en streaming (paquetes de 0,64 s) y en modo no streaming.
- Inferencia completa sobre NPU AX650 mediante seis axmodel compilados.
- SDK en Python (`m5_ax`) y runtime en C++ para despliegue en placa.
- Control de semilla (seed) para reproducibilidad en la generacion.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en dispositivos con SoC AX650 para sintetizar respuestas en tiempo real (RTF 0,52 en C++), sin depender de conectividad a la nube.
- Clonacion de voz personalizada en aplicaciones de accesibilidad: con una referencia de hasta 4,8 s el modelo reproduce el timbre del usuario para lectores de pantalla o interfaces de voz.
- Generacion de locuciones para contenido audiovisual: el modo no streaming permite sintetizar fragmentos de hasta 20 s para narraciones, doblaje o audiolibros en chino e ingles.
- Sistemas de atencion al cliente telefonicos: el streaming con TTFA de 0,63 s permite respuestas de voz naturales en IVR y agentes conversacionales sobre hardware de borde.
- Prototipado e investigacion en TTS: el bundle PyTorch del estudiante y los scripts de conversion permiten experimentar con destilacion y cuantizacion en NPU.
- Dispositivos IoT y wearables con restricciones de energia: al ejecutarse integramente en NPU con modelos de 7-111 MB por componente, encaja en presupuestos de memoria y consumo reducidos.
- Evaluacion comparativa de destilacion: util para estudiar el impacto de reducir capas del Depth Decoder sobre la calidad de sintesis frente al modelo profesor.

## Benchmarks y rendimiento

Metricas de velocidad en placa AX650N (misma referencia de audio, seed=42):

| Metrica | Profesor | M5-TTS-Lite |
|---|---:|---:|
| RTF C++ (streaming) | 0,58 | 0,52 |
| AR C++ (ms/frame) | 38,0 | 26,9 |
| TTFT C++ | 0,30 s | 0,41 s |
| TTFA C++ | 0,61 s | 0,63 s |
| RTF Python | 1,08 | 1,06 |
| Parametros Depth | 19,01 M | 6,69 M |
| Memoria depth_prefill / step | 21 MB | 7,0 MB |

Precision con teacher forcing (mismo conjunto de validacion, 23.021 frames):

| Metrica | Profesor | M5-TTS-Lite (ep39) |
|---|---:|---:|
| CE (nats/codebook) | 5,7549 | 5,6191 |
| Top-1 medio | 7,17 % | 8,13 % |
| Top-1 CB1 | 17,68 % | 19,53 % |
| Top-1 CB15 | 5,10 % | 5,40 % |
| KL (student‖teacher, T=2) | — | 0,1145 |
| Consistencia Top-1 | — | 36,6 % por posicion |

No se han publicado resultados de CER con ASR, similitud de timbre ni evaluacion subjetiva de naturalidad en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: NPU Axera AX650 (AX650N validado); la inferencia usa seis axmodel compilados con Pulsar2 8.0.
- Memoria de modelos: lm_prefill 32 MB, lm_decode 32 MB, depth_prefill 7 MB, depth_step 7 MB, codec_encoder 42 MB, codec_decoder 111 MB; total aproximado 231 MB en NPU mas assets en host.
- No se documenta despliegue en GPU (A100, H100, RTX 4090) ni en consumer GPU; el bundle PyTorch es para conversion y referencia, no para inferencia optimizada.
- Opciones de despliegue: runtime C++ nativo en placa (`bin/`, `build_ax650.sh`) y SDK Python (`python/m5_ax`).
- Latencia y throughput medidos: TTFT 0,41 s, TTFA 0,63 s, RTF 0,52 (C++) y 1,06 (Python) en AX650N; el rendimiento depende de la ocupacion de la NPU y de la cache de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limites | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M5-TTS-Lite.AXERA | 137,5 M totales (Depth 6,69 M) | ref. <= 4,8 s; gen. <= 20 s | RTF 0,52 (C++), TTFA 0,63 s en AX650N | no disponible | Hugging Face + GitHub |
| M5-TTS-50M-VoiceClone (profesor) | Depth 19,01 M | no disponible | RTF 0,58 (C++), TTFA 0,61 s | no disponible | Hugging Face (ASLP-lab) |
| Qwen3-TTS 12 Hz Tokenizer (codec) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos TTS zero-shot comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La referencia de audio para clonacion debe ser de 4,8 s o menos y el texto de prompt debe ser su transcripcion exacta; errores en el prompt degradan la sintesis.
- La generacion individual esta limitada a 20 s de audio.
- Solo chino e ingles (y mezcla) estan verificados; otros idiomas no han sido validados.
- La calidad objetiva (CER con ASR) y subjetiva (naturalidad, similitud de timbre) no se ha evaluado segun la propia model card; los datos de precision son de teacher forcing, no de evaluacion perceptual.
- El rendimiento en placa depende de la ocupacion de la NPU y de la cache de referencia, por lo que las cifras de latencia pueden variar.
- La licencia no esta declarada, lo que impide confirmar condiciones de uso comercial; ademas, los datos de entrenamiento incluyen WenetSpeech4TTS Premium, restringido a investigacion no comercial.
- Riesgo de alucinacion o artefactos en la prosodia no cuantificado; no hay evaluacion de sesgos publicada.
- El modelo esta orientado a NPU AX650; no se ofrecen rutas de despliegue en GPU ni en CPU generica documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/HY-2012/M5-TTS-Lite.AXERA
- GitHub (codigo, scripts de conversion y C++): https://github.com/ZY-2012/M5-TTS-Lite.AXERA
- Modelo profesor: https://huggingface.co/ASLP-lab/M5-TTS-50M-VoiceClone
- Codec de audio: https://huggingface.co/ASLP-lab/M5-TTS-Audio-Tokenizer
