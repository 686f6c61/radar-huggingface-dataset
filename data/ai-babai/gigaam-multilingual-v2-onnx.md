# ai-babai/gigaam-multilingual-v2-onnx

## Resumen

GigaAM Multilingual-v2 ONNX es una distribución optimizada del modelo de reconocimiento automático del habla (ASR) GigaAM-Multilingual-v2, desarrollado originalmente por el equipo GigaAM de Sber (SaluteDevices) y empaquetado en formato ONNX por el usuario ai-babai. El paquete resuelve la necesidad de ejecutar ASR multilingüe de alta calidad en CPU, sin GPU y completamente offline, algo crítico para despliegues en dispositivos de borde, aplicaciones de escritorio y entornos con requisitos estrictos de privacidad. La arquitectura subyacente es un modelo RNN-T (transducer) con encoder cuantizado, derivado del checkpoint original en safetensors de 1,575 GB.

El paquete por defecto ocupa 811 MB y combina un encoder INT8, un decodificador RNN-T en coma flotante y tokenizadores para texto plano y formateado. Existe una variante INT4 opcional de 519,4 MB que reduce el pico de memoria de 1,81 GiB a 1,36 GiB a costa de throughput (12,46× frente a 16,34× tiempo real en un Apple M4 Pro). El modelo cubre 21 idiomas, con especial énfasis en ruso, kazajo, uzbeko, kirguís e inglés, e incluye lenguas minoritarias como bashkir, tártaro, georgiano, armenio o tayiko.

Su relevancia actual radica en la combinación de licencia MIT, compatibilidad verificada con ONNX Runtime 1.23.2 en macOS (Apple Silicon) y Ubuntu (x86-64), y un WER de corpus del 5,20% en INT8 frente al 4,99% del modelo original sobre 80 clips de Google FLEURS. Es, por tanto, una opción práctica para transcripción offline multilingüe en producción sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN-T (transducer) con encoder cuantizado, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | clips de hasta 30 segundos por inferencia |
| Tipos de cuantizacion | INT8 (encoder, paquete por defecto), INT4 (paquete opcional), decodificador en coma flotante |
| Idiomas soportados | ru, en, kk, ky, uz, be, fr, es, ba, ka, hy, ro, tk, az, tg, de, it, nl, pl, pt, tt (21 idiomas) |
| Licencia | MIT (pesos y código de conversión); componentes del encoder upstream con términos Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`), tokenizadores SentencePiece (`.model`), features mel en `.npz`, `config.json`, `manifest.json` |

## Arquitectura y entrenamiento

El modelo original es un sistema ASR end-to-end basado en RNN-T (Recurrent Neural Network Transducer), una arquitectura que combina un encoder acústico con un predictor y una red conjunta para alinear secuencias de audio y texto sin necesidad de segmentación previa. La distribución ONNX mantiene el encoder cuantizado a INT8 (o INT4 en la variante de baja memoria) mientras conserva el decodificador RNN-T en coma flotante, lo que preserva la precisión de la decodificación. El paquete incluye dos tokenizadores SentencePiece: uno para transcripción plana (`raw`) y otro para texto formateado (`e2e`), además de un fichero `.npz` con los parámetros de extracción de features mel.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card cita el dataset `google/fleurs` como referencia de evaluación, no necesariamente como corpus de entrenamiento. La innovación técnica destacable de esta distribución es la conversión a ONNX con cuantización selectiva: el encoder se cuantiza mientras el decodificador permanece en FP, logrando que INT8 sea 2,89× más rápido que ONNX FP32 y 1,09× más rápido que el modelo PyTorch original en un M4 Pro con tres hilos de CPU. El proceso de conversión es reproducible y está documentado en el repositorio del autor.

## Capacidades

- Reconocimiento automático del habla offline en 21 idiomas, con detección automática de idioma (`auto`) o pista explícita de idioma.
- Transcripción dual: salida `raw` (texto plano) y `e2e` (texto formateado con puntuación y mayúsculas).
- Procesamiento de clips de hasta 30 segundos por inferencia; se recomienda dividir grabaciones largas en pausas.
- Ejecución en CPU sin GPU, con soporte para Apple Silicon y x86-64.
- Compatibilidad verificada con ONNX Runtime 1.23.2 y con la API de GigaAM en Mac mediante alias de nombre de fichero.
- Dos perfiles de memoria: INT8 (811 MB, mayor throughput) e INT4 (519,4 MB, menor pico de memoria).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción ASR.

## Casos de uso

- Transcripción offline en aplicaciones de escritorio: el paquete INT8 de 811 MB puede integrarse en apps nativas de macOS o Linux que transcriban notas de voz sin enviar audio a la nube, usando ONNX Runtime como backend y clips de hasta 30 segundos.
- Subtitulado y actas de reuniones en ruso y lenguas de Asia Central: el modelo cubre ru, kk, ky, uz, tk y tg con WER entre 1,81% y 8,49% en FLEURS, adecuado para generar actas automáticas en organizaciones que operan en esos mercados.
- Despliegue en dispositivos de borde con memoria limitada: la variante INT4 (519,4 MB, pico de 1,36 GiB) permite ejecutar ASR en equipos con poca RAM, como mini-PC o portátiles antiguos, manteniendo 12,46× tiempo real en M4 Pro.
- Cumplimiento y privacidad de datos: al ser completamente offline y con licencia MIT, encaja en sectores regulados (sanidad, legal, administración pública) donde el audio no puede salir del perímetro de la organización.
- Investigación lingüística y documentación de lenguas minoritarias: el soporte de bashkir, tártaro, georgiano, armenio y azerí permite transcribir corpus orales para proyectos de preservación lingüística con un único modelo.
- Pipelines de transcripción por lotes en servidores CPU: con throughput de 15-16× tiempo real en INT8 sobre tres hilos, un servidor x86-64 sin GPU puede procesar horas de audio en minutos, integrándose en flujos de post-procesado con FFmpeg.
- Prototipado rápido de ASR multilingüe: el cliente de referencia `multi_client.py` devuelve JSON con `raw` y `e2e`, lo que facilita la integración en scripts de evaluación o demos sin escribir código de inferencia propio.

## Benchmarks y rendimiento

Evaluación sobre 80 clips de Google FLEURS (16 por idioma) con pistas explícitas de idioma. WER de corpus: 4,99% para el modelo original y 5,20% para INT8 (71 y 74 errores sobre 1.422 palabras).

| Idioma | Palabras de referencia | WER PyTorch FP32 | WER ONNX INT8 | Δ WER (pp) [IC 95%] | Throughput INT8 |
|---|---:|---:|---:|---:|---:|
| Ruso | 277 | 1,81% | 1,81% | +0,00 [+0,00, +0,00] | 16,1× |
| Kazajo | 241 | 4,56% | 4,56% | +0,00 [+0,00, +0,00] | 15,4× |
| Uzbeko | 271 | 7,75% | 8,49% | +0,74 [+0,00, +1,69] | 15,4× |
| Kirguís | 252 | 6,35% | 6,75% | +0,40 [+0,00, +1,37] | 15,4× |
| Inglés | 381 | 4,72% | 4,72% | +0,00 [+0,00, +0,00] | 15,3× |

Rendimiento agregado en Apple M4 Pro con tres hilos de CPU: 836,54 segundos de audio procesados en 53,93 segundos tras el calentamiento. INT8 resultó 2,89× más rápido que ONNX FP32 y 1,09× más rápido que el modelo PyTorch original. La variante INT4 alcanzó 12,46× tiempo real con un pico de memoria de 1,36 GiB, frente a 16,34× y 1,81 GiB de INT8.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. El pico de memoria RAM es de 1,81 GiB en INT8 y 1,36 GiB en INT4 en la referencia M4 Pro.
- GPU recomendadas: no se documentan requisitos de GPU; la distribución está pensada para ejecución en CPU vía ONNX Runtime.
- Compatibilidad con GPU de consumo: no se han publicado pruebas con RTX 4090, A100 ni H100 en la información disponible.
- Cabe en cualquier equipo con al menos 2 GiB de RAM libre para INT8 y 1,5 GiB para INT4, incluyendo portátiles y mini-PC.
- Opciones de despliegue: ONNX Runtime 1.23.2 (verificado), cliente de referencia `multi_client.py` del repositorio ai-babai/gigaam-onnx, y API de GigaAM en Mac. Los loaders integrados de onnx-asr 0.12.0 no soportan el RNN-T de Multilingual-v2. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a ASR).
- Latencia y throughput: 15-16× tiempo real en INT8 y 12,46× en INT4 sobre Apple M4 Pro con tres hilos; 836,54 s de audio en 53,93 s tras calentamiento.
- Sistemas verificados: macOS 15.8.1 (Apple Silicon) y Ubuntu 26.04.1 (x86-64), con Python 3.12 y FFmpeg 8.1 / n9.0.2.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Despliegue CPU |
|---|---|---|---|---|---|---|
| GigaAM Multilingual-v2 ONNX (este) | RNN-T + encoder ONNX INT8/INT4 | 21 | clips de 30 s | MIT (encoder upstream Apache-2.0) | ONNX | Sí, verificado |
| Whisper (variantes ONNX de la comunidad) | Transformer encoder-decoder | ~99 | 30 s | MIT (pesos) | ONNX, GGUF | Sí, con cuantización |
| Vosk | Kaldi-based | decenas | variable | Apache-2.0 | Kaldi | Sí |
| wav2vec 2.0 / MMS (Meta) | CTC | ~1.100 en MMS | variable | MIT / CC-BY-NC | PyTorch, ONNX | Parcial |

No se dispone de resultados de benchmarks comparativos directos entre este modelo y las alternativas en la información proporcionada; la comparación se limita a características estructurales. Whisper ofrece mayor cobertura de idiomas pero su encoder-decoder es más pesado en CPU; Vosk es más ligero pero con menor precisión en lenguas de Asia Central; MMS cubre más idiomas pero con licencias y calidades variables.

## Limitaciones y advertencias

- El decodificador puede perder parte del habla tras pausas largas: en una prueba con dos enunciados, se omitió audio después de una pausa de tres segundos. Se recomienda dividir las grabaciones en las pausas, incluso en clips de menos de 30 segundos.
- Los clips deben tener una duración máxima de 30 segundos por inferencia; no se documenta procesamiento de audio más largo sin segmentación previa.
- Los loaders integrados de onnx-asr 0.12.0 no soportan el RNN-T de Multilingual-v2; es necesario usar el cliente de referencia o la API de GigaAM.
- El WER varía notablemente por idioma: 1,81% en ruso frente a 8,49% en uzbeko, lo que condiciona su idoneidad en función del idioma objetivo.
- No se han publicado datos sobre sesgos demográficos, acentos o ruido ambiental en la información disponible.
- Riesgo de alucinación inherente a los sistemas ASR: el modelo puede generar texto plausible en segmentos con audio ininteligible o ruidoso.
- La licencia es MIT para pesos y código de conversión, pero los componentes del encoder upstream arrastran términos Apache-2.0; conviene revisar el fichero NOTICE antes de un uso comercial.
- Compatibilidad verificada limitada a macOS 15.8.1 (Apple Silicon) y Ubuntu 26.04.1 (x86-64) con ONNX Runtime 1.23.2; otros entornos no están validados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún incipiente y menor escrutinio de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-babai/gigaam-multilingual-v2-onnx
- Ficheros del modelo (v0.2.0): https://huggingface.co/ai-babai/gigaam-multilingual-v2-onnx/tree/v0.2.0
- Ficheros INT4 (v0.2.1): https://huggingface.co/ai-babai/gigaam-multilingual-v2-onnx/tree/v0.2.1/int4
- Resultados por clip: https://huggingface.co/ai-babai/gigaam-multilingual-v2-onnx/tree/v0.2.0/evaluation
- Guía de conversión: https://huggingface.co/ai-babai/gigaam-multilingual-v2-onnx/blob/main/conversion/README.md
- Licencia: https://huggingface.co/ai-babai/gigaam-multilingual-v2-onnx/blob/v0.2.0/LICENSE
- Avisos legales: https://huggingface.co/ai-babai/gigaam-multilingual-v2-onnx/blob/v0.2.0/NOTICE
- Cliente de inferencia: https://github.com/ai-babai/gigaam-onnx/blob/v0.2.1/multi_client.py
- Benchmarks: https://github.com/ai-babai/gigaam-onnx/blob/main/benchmarks/README.md
- Comparativa INT4: https://github.com/ai-babai/gigaam-onnx/blob/v0.2.1/benchmarks/multilingual-v2/int4/README.md
- Matriz de compatibilidad modelo × runtime: https://github.com/ai-babai/gigaam-onnx/blob/main/benchmarks/compatibility/README.md
- Controles de calidad de la release: https://github.com/ai-babai/gigaam-onnx/blob/main/quality/README.md
- GigaAM-v4 streaming: https://huggingface.co/ai-babai/gigaam-v4-onnx
- Colección en Hugging Face: https://huggingface.co/collections/ai-babai/gigaam-onnx-offline-and-streaming-speech-recognition-6b0973ce369990a8a4c53c43
- Repositorio original GigaAM: https://github.com/salute-developers/GigaAM
- Anuncio de la release v4 y Multilingual-v2: https://habr.com/ru/companies/sberbank/articles/1112846/
