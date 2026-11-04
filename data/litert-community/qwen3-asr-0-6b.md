# litert-community/Qwen3-ASR-0.6B

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla (ASR) de 600 millones de parámetros construido sobre Qwen3-Omni y publicado originalmente por el equipo Qwen. La versión aquí descrita es un empaquetado comunitario de `litert-community` que convierte el modelo en un bundle autocontenido `.litertlm` para LiteRT-LM Omni, el runtime de inferencia on-device de Google AI Edge, con variantes adicionales en `.tflite` y compilaciones AOT para NPU de Qualcomm y MediaTek.

El modelo resuelve el problema de la transcripción de voz multilingüe completamente en dispositivo: reconocimiento de 30 idiomas y 22 dialectos chinos con identificación automática de idioma, puntuación y capitalización, sin necesidad de Python ni de conexión de red en tiempo de ejecución. La arquitectura combina un front-end log-mel estilo Whisper de 128 bins, un codificador de audio y un decodificador autorregresivo Qwen3 de 28 capas con caché KV con estado.

Su relevancia actual radica en que ofrece una alternativa de código abierto (Apache 2.0) para ASR en Android, iOS, macOS y Linux con un único fichero de 960 MB en INT8, lo que lo hace desplegable en dispositivos móviles de gama alta y en NPUs integradas, un espacio tradicionalmente dominado por servicios en la nube o por modelos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front-end log-mel Slaney de 128 bins estilo Whisper + codificador de audio (`tf_lite_audio_encoder_hw`) + decodificador autorregresivo Qwen3 de 28 capas (`tf_lite_prefill_decode` + `tf_lite_embedder`) con caché KV con estado (`LmDecoder`) |
| Parametros totales | 600 M (0,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de streaming de 5 s con solapamiento configurable de 0,4 a 0,75) |
| Tipos de cuantizacion | INT8 de rango dinámico (variante `_i8`); FP32 sin cuantizar (variante `_f32` de referencia) |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle para LiteRT-LM Omni), `.tflite` (LiteRT SDK), `.tflite` AOT para NPU por SoC |

## Arquitectura y entrenamiento

El modelo sigue un esquema audio-lenguaje: un front-end acústico que convierte la señal de audio a log-mel de 128 bins al estilo Whisper, un codificador de audio que produce las representaciones acústicas y un decodificador de lenguaje autorregresivo Qwen3 de 28 capas que genera el texto. El bundle `.litertlm` integra además la tabla de embeddings, el tokenizador BPE de Qwen3 y los metadatos `LlmMetadata` / `ExecutorMetadata`, de modo que el runtime no necesita dependencias externas ni scripts de Python.

El modelo base es `Qwen/Qwen3-ASR-0.6B`, construido sobre Qwen3-Omni; la model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación destacable del empaquetado es el streaming por ventanas deslizantes de 5 segundos con solapamiento configurable (`overlap_ratio` entre 0,4 y 0,75), emisión temprana del primer fragmento mediante warm-start y alineación de costuras entre ventanas solapadas, lo que permite transcribir audio de duración arbitraria. La cuantización INT8 de rango dinámico reduce el tamaño en disco de 3,13 GB a 960 MB (factor 3,3) y acelera la inferencia en CPU ARM64 y GPU móviles.

## Capacidades

- Transcripción de voz a texto (speech-to-text) en 30 idiomas y 22 dialectos chinos.
- Identificación automática de idioma dentro del audio.
- Puntuación y capitalización automáticas en la salida.
- Procesamiento de audio de duración arbitraria mediante streaming por ventanas de 5 s con solapamiento y alineación de costuras.
- Emisión de segmentos confirmados y no confirmados en tiempo real (streaming de resultados parciales).
- Acepta WAV mono o multicanal a cualquier frecuencia de muestreo, con remuestreo automático a 16 kHz mono.
- Despliegue on-device sin red y sin Python: Android, iOS, macOS, Linux y C++.
- Aceleración por NPU mediante variantes AOT compiladas para SoC Qualcomm Snapdragon y MediaTek Dimensity.
- No dispone de tool calling, function calling, capacidades de agente ni modo thinking: es un modelo especializado en ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en movil: el modelo procesa audio de duración arbitraria mediante ventanas deslizantes de 5 s con solapamiento, por lo que puede transcribir grabaciones largas íntegramente en el dispositivo sin enviar audio a la nube.
- Subtitulado en tiempo real de vídeo o streaming: la emisión temprana del primer fragmento y el streaming de segmentos confirmados y no confirmados permiten generar subtítulos con baja latencia en apps de vídeo.
- Asistentes de voz offline para Android e iOS: el bundle `.litertlm` de 960 MB se integra con LiteRT-LM Omni y funciona sin conectividad, adecuado para aplicaciones en entornos sin red o con requisitos de privacidad estrictos.
- Dictado multilingüe en aplicaciones de productividad: con identificación automática de idioma entre 30 lenguas, el modelo permite dictar en el idioma del usuario sin configuración manual previa.
- Transcripción de contenido en dialectos chinos: los 22 dialectos chinos soportados cubren un caso que muchos ASR comerciales no resuelven, útil para aplicaciones dirigidas al mercado chino.
- Procesamiento de audio en el borde (edge computing) con NPU: las variantes AOT para Snapdragon y Dimensity permiten ejecutar la transcripción en dispositivos embebidos o industriales con aceleración por NPU y sin GPU dedicada.
- Indexación y búsqueda de archivos de audio locales: la transcripción on-device permite generar transcripciones buscables de bibliotecas de audio personales sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 960 MB en disco para el bundle INT8 `.litertlm`; 794 MB para el `.tflite` INT8; 3,13 GB para el `.tflite` FP32 de referencia; 1,88–2,19 GB para las variantes AOT con NPU.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el modelo está orientado a CPU ARM64, GPU móviles y NPU integradas en SoC.
- Cabe en GPU de consumo: no disponible como dato explícito; el diseño está pensado para dispositivos móviles y edge, no para GPUs de escritorio.
- SoC soportados para NPU (variantes AOT): Qualcomm Snapdragon `SM8450` (8 Gen 1), `SM8550` (8 Gen 2), `SM8650` (8 Gen 3), `SM8750` (8 Elite), `SM8850` (8 Elite Gen 5), `SA8255`, `SA8295`; MediaTek Dimensity `MT6877`, `MT6878`, `MT6879`, `MT6897`, `MT6983` (9000), `MT6985` (9200), `MT6989` (9300), `MT6991` (9400), `MT6993`, `MT8171`, `MT8188`, `MT8189`.
- Opciones de despliegue: LiteRT-LM Omni (`OmniEngine` / `omni_runner`) con `--backend=cpu` o `--backend=gpu` en Android, iOS, macOS, Linux y C++; LiteRT SDK directo con los ficheros `.tflite`; compilaciones AOT para NPU vía compiladores LiteRT NeuroPilot / QNN.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue on-device |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (LiteRT) | 0,6 B | no disponible (ventana 5 s en streaming) | 30 idiomas + 22 dialectos chinos | Apache 2.0 | Sí (Android, iOS, macOS, Linux, NPU) |
| Whisper (variantes small/base) | 0,244 B / 0,074 B | 30 s por ventana | ~99 idiomas | MIT | Parcial (requiere runtime adicional) |
| Qwen3-ASR-0.6B original (HuggingFace) | 0,6 B | no disponible | 30 idiomas + 22 dialectos chinos | Apache 2.0 | No (requiere Python/PyTorch) |

La comparación con Whisper se ofrece como referencia de categoría; no se dispone de datos de benchmarks comparativos en la información proporcionada. El modelo original de Qwen y esta versión LiteRT comparten pesos base, pero difieren en el empaquetado y en el runtime de ejecución.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo en la información disponible; como todo ASR, puede presentar diferencias de precisión entre idiomas, acentos y dialectos.
- Riesgo de alucinación: los decodificadores autorregresivos de ASR pueden generar texto plausible en segmentos con ruido, silencio o audio de baja calidad; se recomienda validación en producción.
- El modelo está especializado exclusivamente en ASR: no soporta tool calling, agentes, visión ni razonamiento general.
- La ventana de streaming es de 5 s con solapamiento; la calidad en audio de duración arbitraria depende de la configuración de `overlap_ratio` y de la alineación de costuras entre ventanas.
- Las variantes AOT para NPU están compiladas para SoC concretos; no son portables entre familias de chips y requieren recompilación para nuevos hardware.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de las dependencias del runtime LiteRT-LM Omni y de los compiladores NeuroPilot / QNN.
- El repositorio ocupa 63,0 GB por incluir todas las variantes; conviene descargar solo el fichero necesario.
- No se dispone de información sobre el proceso de entrenamiento (tokens, dataset, RLHF/DPO), lo que limita la evaluación de su robustez en dominios específicos.

## Enlaces

- [HuggingFace: litert-community/Qwen3-ASR-0.6B](https://huggingface.co/litert-community/Qwen3-ASR-0.6B)
- [Modelo base: Qwen/Qwen3-ASR-0.6B](https://huggingface.co/Qwen/Qwen3-ASR-0.6B)
- [LiteRT-LM Omni (GitHub)](https://github.com/google-ai-edge/LiteRT-LM/tree/main/omni)
- [LiteRT (GitHub)](https://github.com/google-ai-edge/LiteRT)
- [Guía de compilación y ejecución de LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/getting-started/build-and-run.md)
- [Ejemplos ASR de LiteRT SDK](https://github.com/google-ai-edge/LiteRT/tree/main/litert/samples/asr)
- [Issue LiteRT-LM #4360 (contexto/sistema en Qwen3-ASR)](https://github.com/google-ai-edge/LiteRT-LM/issues/4360)
- [Issue litert-samples #144 (integración macOS/Swift)](https://github.com/google-ai-edge/litert-samples/issues/144)
- [Colección GenAI de litert-community](https://huggingface.co/collections/litert-community/genai)
