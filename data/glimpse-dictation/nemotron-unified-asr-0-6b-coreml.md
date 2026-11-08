# Glimpse-Dictation/Nemotron-Unified-ASR-0.6B-coreml

## Resumen

Nemotron Unified ASR 0.6B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por NVIDIA que unifica transcripcion de archivo completo e inferencia en streaming en un unico checkpoint de 0,6 mil millones de parametros. Es la version multilingue de Parakeet Unified EN 0.6B y cubre 25 idiomas europeos con un input opcional de idioma. Esta ficha describe en concreto la conversion publicada por Glimpse-Dictation, que empaqueta los pesos originales en formato GGUF Q8_0 y anade un encoder en Core ML cuantizado a int8 para ejecucion en la Neural Engine de Apple Silicon.

El modelo resuelve el problema de mantener una sola arquitectura para dos regimenes de uso (offline y streaming) sin duplicar pesos ni degradar la calidad de forma significativa. La latencia algoritmica minima en streaming es de 160 ms segun NVIDIA, y la conversion de Glimpse permite dictado en dispositivo con latencias medianas de 27 ms en clips cortos sobre un M2 Pro.

La relevancia actual radica en su caracter practico: licencia OpenMDW 1.1 que permite uso comercial, soporte de 25 idiomas, pesos disponibles en GGUF y Core ML, y un rendimiento en FLEURS (9,47 % WER en 20 idiomas compartidos) que mejora sustancialmente al modelo anterior de Glimpse (17,12 % WER). No es un modelo oficial de NVIDIA: es una conversion de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN-T (transducer) unificado para ASR offline y streaming; encoder convertido a Core ML |
| Parametros totales | 626.702.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventanas de audio de 15 s, 10,24 s y 5,12 s en el encoder Core ML |
| Tipos de cuantizacion | Q8_0 (GGUF); encoder int8 (Core ML) |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW 1.1 (permite uso comercial) |
| Formato de pesos | GGUF (Q8_0) y Core ML (.mlmodelc empaquetado en zip) |

## Arquitectura y entrenamiento

El modelo base es un RNN-T (recurrent neural network transducer) de NVIDIA que combina un encoder acustico con un predictor y un joint network. Su innovacion principal es que un mismo checkpoint sirve tanto para transcripcion offline de archivo completo como para streaming con una latencia algoritmica minima de 160 ms, evitando la necesidad de mantener dos modelos separados. Acepta un input opcional de idioma; si se deja vacio, el modelo detecta el idioma automaticamente.

La conversion de Glimpse-Dictation se realizo con `convert-parakeet.py` del proyecto transcribe.cpp (perfil `nemotron-labs-unified-asr-0.6b`) y cuantizacion a Q8_0. Los encoders Core ML se generaron desde ese mismo GGUF con `convert-parakeet-gguf-to-coreml.py --int8`, anadiendo `--extra-frames 1024 512` para la variante de macOS 15. Segun la model card, la salida offline y de streaming con buffer del GGUF F32 coincide con la referencia NeMo de NVIDIA en clips de prueba en ingles y aleman. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automatico del habla multilingue en 25 idiomas europeos (eslavos, germanicos, romanicos, balticos, griego y maltes).
- Transcripcion offline de archivo completo con una sola pasada.
- Streaming en vivo con chunks de 0,56 s y lookahead de 0,56 s, con una latencia algoritmica minima de 160 ms.
- Deteccion automatica de idioma si no se proporciona el codigo de idioma.
- Entrada opcional de idioma para forzar la decodificacion en una lengua concreta.
- Ejecucion del encoder en la Neural Engine de Apple Silicon mediante Core ML, con el decodificador RNN-T y el prompt de idioma en transcribe.cpp.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Dictado en dispositivo en macOS y Windows: la app Glimpse usa estos pesos para transcripcion en tiempo real sin enviar audio a la nube, con latencias medianas de 27 ms en clips cortos y 1,41 s para una grabacion de 554 s en un M2 Pro.
- Subtitulado y transcripcion de reuniones multilingues: el modelo cubre 25 idiomas europeos y permite fijar el idioma de entrada o dejar que lo detecte, lo que simplifica pipelines de transcripcion para equipos distribuidos.
- Asistentes de voz con streaming de baja latencia: los chunks de 0,56 s con lookahead de 0,56 s y la latencia minima de 160 ms lo hacen adecuado para interfaces conversacionales que necesitan texto parcial mientras el usuario habla.
- Procesamiento por lotes de archivos de audio: la variante offline transcribe grabaciones completas con una sola pasada; en el benchmark de Glimpse, 554 s de audio se procesan en 1,41 s en un M2 Pro.
- Aplicaciones de accesibilidad: dictado por voz en sistemas operativos de escritorio con ejecucion local, sin dependencia de servicios externos y con licencia que permite uso comercial.
- Investigacion en ASR multilingue: el par GGUF + Core ML permite comparar el mismo checkpoint en CPU, Metal y Neural Engine, y el encoder int8 facilita experimentos de cuantizacion en hardware Apple.
- Integracion en pipelines de transcripcion con transcribe.cpp: el proyecto `glimpse-hq/transcribe.cpp` expone el soporte del perfil `nemotron-labs-unified-asr-0.6b` para incrustar el modelo en herramientas propias.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con el motor de Glimpse en un M2 Pro (Neural Engine, encoder int8), con WER tras normalizar mayusculas, puntuacion y numeros:

| Prueba | Nemotron 3.5 Streaming | Parakeet Unified EN | Nemotron Unified |
|---|---:|---:|---:|
| FLEURS, 20 idiomas compartidos (2000 clips) | 17,12 % | no disponible | 9,47 % |
| FLEURS ingles (100 clips) | 7,26 % | 4,25 % | 4,90 % |
| LibriSpeech test-clean (500 clips) | 3,14 % | 1,82 % | 2,08 % |
| LibriSpeech test-other (500 clips) | 6,92 % | 3,40 % | 3,41 % |
| Grabacion de 554 s, tiempo de transcripcion | 25,6 s | 1,50 s | 1,41 s |
| Clips cortos de dictado, mediana | 316 ms | 39 ms | 27 ms |

En streaming en vivo con chunks de 0,56 s y lookahead de 0,56 s, el coste es de aproximadamente 3,5 puntos de WER (ejemplo: hungaro FLEURS, 17,1 % offline frente a 20,6 % en streaming), tanto en Metal como en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q8_0 ocupa 740 MB en disco; la memoria en ejecucion no se detalla en la informacion disponible, pero por el tamano del checkpoint (0,6B en Q8_0) es previsible que quepa en menos de 2 GB.
- Encoder Core ML: 529 MB (macOS 15 o superior, Apple Silicon) o 523 MB (macOS 14, Apple Silicon), ambos int8.
- GPU recomendadas: Apple Silicon (M1 o posterior) para la ruta Core ML con Neural Engine; para la ruta GGUF en otras plataformas no se especifican GPU concretas en la informacion disponible.
- Cabe en GPU de consumo: si, por el tamano del modelo; en Apple Silicon se ejecuta en la Neural Engine y en CPU/Metal mediante transcribe.cpp.
- Opciones de despliegue: transcribe.cpp (fork `glimpse-hq/transcribe.cpp` con soporte del perfil `nemotron-labs-unified-asr-0.6b`), Core ML para el encoder en Apple Silicon, y la app Glimpse (Mac y Windows, codigo abierto en GitHub). No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: mediana de 27 ms en clips cortos de dictado y 1,41 s para 554 s de audio en un M2 Pro; en streaming, chunks de 0,56 s con 0,56 s de lookahead.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER FLEURS (20 idiomas) | WER LibriSpeech test-clean | Licencia | Formatos |
|---|---:|---|---:|---:|---|---|
| Nemotron Unified 0.6B (esta conversion) | 626,7 M | 25 europeos | 9,47 % | 2,08 % | OpenMDW 1.1 | GGUF, Core ML |
| Nemotron 3.5 Streaming | no disponible | no disponible | 17,12 % | 3,14 % | no disponible | no disponible |
| Parakeet Unified EN 0.6B | no disponible | solo ingles | no disponible | 1,82 % | no disponible | no disponible |

La comparativa se limita a los modelos usados como referencia en la model card; no se dispone de datos de otros sistemas ASR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es una release oficial de NVIDIA: el repositorio solo convierte el checkpoint original y la responsabilidad de soporte recae en Glimpse-Dictation.
- El streaming en vivo penaliza aproximadamente 3,5 puntos de WER frente a la transcripcion offline.
- El idioma portugues no mejora respecto a Nemotron 3.5 Streaming (mismo WER); el resto de idiomas compartidos si mejora.
- La ruta Core ML esta limitada a Apple Silicon con macOS 14 o superior; la variante para macOS 14 solo expone una funcion de 15 s, mientras que la de macOS 15 anade ventanas de 10,24 s y 5,12 s.
- El encoder Core ML solo cubre el encoder; el prompt de idioma y el decodificador RNN-T requieren transcribe.cpp con soporte especifico del perfil, por lo que no basta con un runtime Core ML generico.
- No se documentan en la informacion disponible sesgos conocidos, tasas de alucinacion ni notas de privacidad del modelo base; la model card remite a la ficha de NVIDIA para esos detalles.
- La licencia OpenMDW 1.1 permite uso comercial, pero se debe consultar el texto completo de la licencia para condiciones adicionales.
- El modelo esta orientado a ASR; no se documentan capacidades de razonamiento, codigo, vision ni tool calling.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Glimpse-Dictation/Nemotron-Unified-ASR-0.6B-coreml
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Conversion alternativa en Hugging Face: https://huggingface.co/FluidInference/nemotron-labs-unified-asr-0.6b-coreml
- Proyecto transcribe.cpp: https://github.com/glimpse-hq/transcribe.cpp
- App Glimpse (codigo abierto): https://github.com/glimpse-hq/Glimpse
- Sitio de Glimpse: https://tryglimpse.cc
- Licencia OpenMDW 1.1: incluida en el repositorio como archivo LICENSE
