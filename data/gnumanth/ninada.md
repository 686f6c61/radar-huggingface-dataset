# gnumanth/ninada

## Resumen

Ninada (निनाद, "sonido resonante profundo" en sánscrito) v2.0 es una suite de síntesis de voz neuronal (text-to-speech) en streaming, centrada en sánscrito clásico y lenguas índicas, desarrollada por el usuario `gnumanth` (repositorios asociados a `hemanth`). El modelo resuelve un problema real: la falta de TTS de calidad para sánscrito védico y clásico, así como para lenguas índicas mal servidas por los sistemas genéricos multilingües, con una huella lo bastante pequeña para ejecutarse íntegramente en el navegador mediante WebAssembly y ONNX Runtime Web.

Técnicamente, se trata de una flota de seis especialistas VITS + HiFi-GAN (uno por idioma: sánscrito, kannada, hindi, tamil, telugu y malayalam), cada uno con aproximadamente 36,3 millones de parámetros. La innovación principal es su arquitectura de streaming "halo-crossfaded": la inferencia se divide en un codificador con predictor de duración estocástico (~27,3 MB) y un vocoder HiFi-GAN troceado (~27,4 MB), con crossfade de coseno elevado en los bordes de los chunks, logrando una latencia mediana hasta el primer audio (TTFA) de 180,1 ms y una separación de costuras de 123,7 dB SNR.

Su relevancia actual radica en la combinación de tres factores: cobertura total de 9 escrituras Brahmi además de ISO-15919/IAST, ejecución offline en navegador con caché en `CacheStorage` (cero peticiones de red tras la primera carga) y licencia MIT, que permite uso comercial sin restricciones. Es especialmente valioso para aplicaciones educativas, de recitación védica y de accesibilidad en lenguas índicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (encoder + Stochastic Duration Predictor + normalizing flow) + vocoder HiFi-GAN troceado ("Halo-Chunked") |
| Parametros totales | 36.268.848 (por especialista, dato de safetensors) |
| Parametros activos | No aplicable (no es MoE; todos los parametros estan activos en cada especialista) |
| Longitud de contexto | No disponible (TTS; limitado por memoria de inferencia, no por ventana de contexto) |
| Tipos de cuantizacion | FP16 y cuantizada (ONNX quantized); FP32 en la variante Tier-1A GCP L4 |
| Idiomas soportados | Sanscrito (sa), kannada (kn), hindi (hi), tamil (ta), telugu (te), malayalam (ml); 9 escrituras Brahmi + ISO-15919/IAST |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder y vocoder separados por idioma) y safetensors |

## Arquitectura y entrenamiento

Ninada v2.0 no es un modelo único sino una flota de seis especialistas VITS + HiFi-GAN, uno por idioma (`specialists/{sa,kn,hi,ta,te,ml}`). VITS es una arquitectura text-to-speech end-to-end que combina un encoder con un Stochastic Duration Predictor (SDP) y un normalizing flow para mapear fonemas a espectrogramas, con un vocoder HiFi-GAN que genera la forma de onda. El entrenamiento alternó las perdidas MPD + MRD (discriminadores multi-periodo y multi-resolucion con LSGAN y feature-matching multicapa), Flow KL y MLE del SDP de forma compatible con ONNX, mas un ajuste WiSE-FT validado solo end-to-end. Todo el entrenamiento se realizo en una GPU NVIDIA L4 de 24 GB en Google Cloud.

Los datos de entrenamiento proceden de un corpus de estudio masculino anecoico de 1.438 clips (127,55 minutos a 16 kHz; 1.150 train / 144 val / 144 test). Para sanscrito se usaron 388 clips de narracion de estudio neutral de `ai4bharat/Rasa` mas datos de recitacion y eruditos de `prathoshap/sushrota-sanskrit-asr-data` (con CER de alineacion de estudio <= 5,0 %, excluyendo aumentos sinteticos `tts_aug`). Para las demas lenguas, 1.050 clips (210 por idioma) de grabaciones en cabina anecoica de `ai4bharat/Rasa`, remuestreadas de 48 kHz a 16 kHz.

La innovacion destacable es el streaming halo-crossfaded: la inferencia se divide en `encoder_flow_quantized.onnx` (~27,3 MB, con SDP nativo y flow) y `vocoder_quantized.onnx` (~27,4 MB, con campo receptivo de 16 frames de "halo" y crossfade de coseno elevado de 256 muestras en los bordes de chunk). Ello permite streaming sub-segundo con separacion de costuras de 123,7 dB SNR y persistencia de los pesos en `CacheStorage` del navegador, de modo que recargas o cambios de idioma no generan peticiones de red.

## Capacidades

- Sintesis de voz neuronal en streaming con TTFA mediano de 180,1 ms (variante ONNX streaming) y 150,8 ms (FP32 en L4).
- Soporte de 6 lenguas indicas: sanscrito, kannada, hindi, tamil, telugu y malayalam.
- Cobertura de 9 escrituras Brahmi ademas de transliteracion ISO-15919/IAST.
- G2P (grapheme-to-phoneme) propio, que mejora la cobertura al 100 % frente al 43,1 % del modelo base MMS.
- Ejecucion integramente en navegador via ONNX Runtime Web y WebAssembly, con Web Worker fuera del hilo principal.
- SDKs de streaming en JavaScript y Python (generadores async que emiten chunks de PCM a 16 kHz).
- Voz masculina de estudio (corpus anecoico), con prosodia apta para recitacion sanscrita clasica.
- Caché local de modelos en `CacheStorage` para uso offline tras la primera carga.

## Casos de uso

- Ensenanza y divulgacion del sanscrito: puede generar audio de frases y slokas clasicos con pronunciacion fiel (CER de 16,65 % frente al 19,48 % de MMS), util para apps de aprendizaje de sanscrito y recitacion védica.
- Accesibilidad en lenguas indicas: lectura en voz alta de contenidos web en kannada, tamil, telugu, hindi o malayalam directamente en el navegador, sin backend ni coste de servidor.
- Aplicaciones web offline-first: al persistir los pesos en `CacheStorage`, una PWA puede ofrecer TTS sin conectividad, adecuado para zonas con conectividad intermitente.
- Agentes de voz en idiomas indicos: la baja latencia (TTFA de ~180 ms) permite integrarlo en pipelines conversacionales de streaming donde el audio debe empezar a reproducirse casi inmediatamente.
- Prototipado y demos de TTS sin infraestructura: el SDK JavaScript permite montar un studio de voz en una pagina estatica (como la demo oficial en GitHub Pages) sin desplegar GPUs.
- Digitalizacion de contenido educativo y cultural: generacion de audiencia para textos en escrituras Brahmi y transliteraciones IAST, util para archivos y bibliotecas digitales.
- Integracion en apps Python de procesamiento de audio: el SDK Python emite chunks de PCM con sample rate, facilitando encadenamiento con pipelines de postprocesado o grabacion.

## Benchmarks y rendimiento

Resultados publicados en la model card (held-out test, N = 144 enunciados, intervalos de confianza bootstrap 95 % con B = 1.000):

| System | Footprint activo | Cobertura | TTFA p50 (ms) | MCD (dB) | Log-F0 RMSE (c) | Dur MAE (s) | Sanscrito CER (%) | Sanscrito WER (%) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Audio humano de estudio (topline) | — | 100,0 % | — | — | — | — | 1,78 [1,14, 2,46] | 19,06 [12,81, 25,70] |
| Base `facebook/mms-tts-hin` (raw) | 138,8 MB | 43,1 % | 0,6 | 6,50 [6,30, 6,71] | 961,1 | 3,10 | 19,48 [16,51, 22,60] | 70,30 [60,81, 79,41] |
| Base `mms-tts-hin` + G2P de Ninada | 138,8 MB | 100,0 % | 463,4 | 5,49 [5,40, 5,58] | 654,8 | 0,89 | 20,27 [17,07, 23,62] | 70,83 [60,99, 80,35] |
| Flota MMS de 5 especialistas (5x modelos) | 694,0 MB | 100,0 % | 507,5 | 5,09 [5,02, 5,17] | 663,7 | 1,31 | 19,48 [16,51, 22,60] | 70,30 [60,81, 79,41] |
| **Ninada v2.0 Tier-1A (GCP L4 FP32)** | 138,4 MB | 100,0 % | 150,8 | 4,70 [4,63, 4,77] | 628,0 | 0,72 | 16,65 [13,17, 20,36] | 57,95 [49,77, 66,54] |
| **Ninada v2.0 Tier-1B (Streaming ONNX)** | 54,7 MB | 100,0 % | 180,1 | 4,69 [4,61, 4,76] | 626,4 | 0,73 | 16,95 [13,46, 20,28] | 58,79 [49,94, 67,29] |

Ninada supera al modelo base MMS y a la flota de 5 especialistas de Meta en todas las metricas de calidad (MCD, Log-F0 RMSE, Dur MAE, CER y WER en sanscrito), con una huella de 54,7 MB frente a los 694 MB de la flota MMS. No se han publicado benchmarks estandar tipo MOS (Mean Opinion Score) en la informacion disponible.

## Requisitos de hardware

- Inferencia en navegador: no requiere GPU; los pesos ONNX cuantizados (~54,7 MB por especialista) se ejecutan via ONNX Runtime Web con WebAssembly en Web Worker, fuera del hilo principal.
- Inferencia en servidor/Python: no se especifican requisitos de VRAM; dada la huella de ~36 M de parametros (138,4 MB en FP32), cualquier GPU de consumo moderna o incluso CPU es suficiente.
- Entrenamiento: se realizo en una NVIDIA L4 de 24 GB en Google Cloud; no es necesario para inferencia.
- Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en portatiles sin GPU dedicada.
- Despliegue: SDK JavaScript (navegador, ONNX Runtime Web/WASM), SDK Python, o descarga directa de los ONNX por idioma desde HuggingFace para usar con onnxruntime. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable, al no ser un LLM).
- Latencia: TTFA mediano de 180,1 ms en streaming ONNX y 150,8 ms en FP32 sobre L4; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Footprint | TTFA p50 | Sanscrito CER | Licencia |
|---|---|---|---:|---:|---:|---|
| **Ninada v2.0 (Tier-1B streaming)** | VITS + HiFi-GAN (6 especialistas) | 6 indicas + IAST | 54,7 MB | 180,1 ms | 16,95 % | MIT |
| Meta MMS 5-Specialist Fleet | VITS (MMS) | Hindi (base) + flota | 694,0 MB | 507,5 ms | 19,48 % | CC-BY-NC 4.0 |
| `facebook/mms-tts-hin` (base) | VITS (MMS) | Hindi | 138,8 MB | 0,6 ms (sin G2P) | 19,48 % | CC-BY-NC 4.0 |

Ninada ofrece mejor calidad acustica (MCD 4,69 dB frente a 5,09 dB de la flota MMS), menor latencia de arranque que la flota MMS con G2P, una huella ~12 veces menor y una licencia MIT sin restricciones de uso no comercial, frente a la licencia CC-BY-NC de los modelos MMS de Meta. Otros TTS indicos comparables (por ejemplo, los modelos de AI4Bharat) no disponen de datos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Voz unica masculina: el corpus de entrenamiento es exclusivamente de un locutor masculino de estudio; no hay voces femeninas ni multiples speakers.
- Calidad de pronunciacion en sanscrito todavia lejos del topline humano: CER de 16,65-16,95 % frente al 1,78 % del audio humano de estudio; el WER de ~58 % indica que la inteligibilidad automatica sigue siendo limitada en sanscrito.
- Corpus de entrenamiento reducido: 127,55 minutos en total (388 clips de sanscrito, 210 por lengua indica), lo que puede limitar la naturalidad y la robustez ante textos fuera de dominio.
- Riesgo de errores de pronunciacion (alucinacion fonetica) en palabras fuera del vocabulario o en compuestos sanscritos complejos; se recomienda validacion humana en usos criticos.
- Los pesos MMS de Meta con los que se compara estan bajo CC-BY-NC; Ninada en cambio es MIT, pero conviene verificar la procedencia de los datasets de entrenamiento (ai4bharat/Rasa) para usos comerciales sensibles.
- Solo 9 descargas y 1 like en HuggingFace en el momento de la ficha: adopcion muy temprana, documentacion y comunidad limitadas, y posible inestabilidad de la API.
- La muestra de audio es a 16 kHz, por debajo de la calidad de TTS modernos a 22-48 kHz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gnumanth/ninada
- Demo web (studio en Web Worker): https://hemanth.github.io/ninada/
- Repositorio GitHub y SDKs (JS + Python): https://github.com/hemanth/ninada
- Dataset de metadatos de clips (1.438 clips): https://huggingface.co/datasets/gnumanth/ninada-sanskrit-indic
- Dataset de entrenamiento sanscrito: https://huggingface.co/datasets/prathoshap/sushrota-sanskrit-asr-data
- Dataset de entrenamiento pan-indico: https://huggingface.co/datasets/ai4bharat/Rasa
