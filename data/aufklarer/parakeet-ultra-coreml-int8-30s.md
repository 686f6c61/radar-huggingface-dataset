# aufklarer/Parakeet-Ultra-CoreML-INT8-30s

## Resumen

Parakeet Ultra CoreML INT8 30s es una exportación a Core ML del modelo de reconocimiento automático del habla (ASR) Parakeet Ultra, desarrollado por Moondream a partir de los pesos post-entrenados de NVIDIA Parakeet TDT v3. El autor de la conversión es aufklarer, que publica el bundle optimizado para Apple Silicon con el objetivo de ofrecer transcripción local, de baja latencia y con soporte para 25 idiomas europeos dentro del ecosistema de Apple (macOS e iOS).

El modelo resuelve el problema de la transcripción de voz en dispositivos Apple sin depender de servicios en la nube. Se distribuye como tres modelos Core ML compilados (encoder FastConformer, predictor LSTM y joint) con el encoder cuantizado a 8 bits mediante palettización, lo que reduce el bundle a 640,6 MB. El contexto de audio de entrada es de 30 segundos (3.000 tramas mel) y la frecuencia de muestreo requerida es de 16 kHz mono.

Su relevancia actual radica en la combinación de un modelo ASR de 0,6B parámetros con una arquitectura TDT (Token-and-Duration Transducer), capacidades de timestamps a nivel de palabra, puntuaciones de confianza y control del idioma en la decodificación, todo ello ejecutable en CPU y Neural Engine de Apple con un factor de tiempo real en caliente de aproximadamente 0,010 y un footprint de proceso de unos 98,7 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con encoder FastConformer, predictor LSTM y joint |
| Parametros totales | 0,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (3.000 tramas mel) por ventana |
| Tipos de cuantizacion | Encoder con palettizacion de 8 bits; predictor y joint en FP16 |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk (25 idiomas europeos) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML compilado (`encoder.mlmodelc`, `decoder.mlmodelc`, `joint.mlmodelc`) |
| Entrada de audio | 16 kHz mono |
| Objetivo de despliegue Core ML | macOS 15 e iOS 18 |
| Tamano del bundle | 640,6 MB (611 MiB) |
| Vocabulario | 8.193 tokens y 5 logits de duracion en el joint |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores que predice conjuntamente tokens y duraciones, lo que permite un alineamiento eficiente y la generación de timestamps. El encoder es un FastConformer que recibe las tramas mel y las longitudes válidas; el predictor es una LSTM con estado recurrente explícito; y el joint expone tanto los logits completos de token (8.193) como cinco logits de duración, habilitando el control del idioma, las puntuaciones de confianza y los timestamps a nivel de palabra.

Los pesos originales fueron entrenados por NVIDIA como Parakeet TDT v3 y posteriormente post-entrenados por Moondream para dar lugar a Parakeet Ultra. Esta distribución concreta realiza la conversión a Core ML, aplica palettización de 8 bits al encoder y reutiliza el tokenizador y la configuración de preprocesamiento de v3. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en 25 idiomas europeos (búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, ruso, eslovaco, esloveno, español, sueco y ucraniano).
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- Control del idioma en la decodificación mediante los logits completos del joint.
- Puntuaciones de confianza por token.
- Timestamps a nivel de palabra.
- Procesamiento de audio en ventanas de 30 segundos, con segmentación automática de audio más largo en ventanas consecutivas de 30 segundos por parte del loader en Swift.
- Ejecución en CPU y Neural Engine de Apple Silicon.
- No se mencionan capacidades de tool calling, agentes, visión ni audio más allá del ASR en la información disponible.

## Casos de uso

- Transcripción de reuniones y notas de voz en macOS e iOS: el modelo procesa audio de 16 kHz mono en ventanas de 30 segundos y devuelve texto con timestamps por palabra, lo que permite generar actas sincronizadas localmente sin enviar datos a la nube.
- Subtitulado automático de vídeo: los timestamps a nivel de palabra y las puntuaciones de confianza facilitan la alineación de subtítulos en 25 idiomas europeos, útil para contenido multilingüe.
- Dictado por voz en aplicaciones nativas de Apple: la integración mediante `ParakeetASRModel` en speech-swift permite añadir dictado con selección de idioma a apps de macOS 15 e iOS 18.
- Transcripción de atención al cliente: llamadas o grabaciones de soporte en varios idiomas europeos pueden transcribirse en local, preservando la privacidad y permitiendo análisis posterior de sentimiento o cumplimiento.
- Investigación lingüística y creación de corpus: la salida de confianza y los timestamps facilitan la anotación y el análisis de grabaciones en lenguas europeas de menor recursos, como maltés, estonio o esloveno.
- Procesamiento por lotes en pipelines de Python: el bundle puede descargarse con `huggingface_hub` e invocarse mediante el CLI local de `speech`, lo que permite integrarlo en scripts de transcripción masiva.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en dispositivos Apple, con un factor de tiempo real de aproximadamente 0,010 en caliente.

## Benchmarks y rendimiento

Resultados locales medidos en un Apple M5 Pro con macOS 26.6.2, mismo CLI y ventana de encoder de 30 segundos. El conjunto limpio usa 80 grabaciones inglesas y 80 francesas de FLEURS; el conjunto ruidoso usa 48 mezclas de 16 grabaciones fuente a 10 o 20 dB de relación señal-ruido.

| Metrica | v3 | Ultra |
|---|---:|---:|
| Word error rate (limpio) | 5,22% | 4,70% |
| Word error rate (ruidoso) | 6,69% | 5,97% |
| Factor de tiempo real en caliente | 0,0101 | 0,0100 |
| Footprint maximo del proceso CLI | 98,6 MB | 98,7 MB |

Además, una prueba de extremo a extremo superada en CPU y Neural Engine con voz en inglés y alemán y timestamps de palabra a través del límite de 30 segundos.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo está pensado para ejecución en Apple Silicon. El bundle ocupa 640,6 MB en disco y el footprint del proceso CLI medido es de 98,7 MB.
- GPU recomendadas: no se especifican GPU discretas; el objetivo es CPU y Neural Engine de Apple Silicon (la medición se hizo en un Apple M5 Pro).
- Compatibilidad con GPU de consumo: no se indica soporte para GPUs NVIDIA o AMD; el formato Core ML limita el despliegue a hardware Apple.
- Opciones de despliegue: Core ML a través del loader `ParakeetASRModel` de speech-swift, el CLI `speech transcribe --engine parakeet --model ultra` y scripts de Python que invocan ese CLI.
- Latencia y throughput: factor de tiempo real en caliente de 0,0100 (aproximadamente 100 veces más rápido que tiempo real en la configuración medida); no se proporcionan cifras de throughput absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet Ultra CoreML INT8 30s (este) | 0,6B | 30 s | 25 europeos | CC BY 4.0 | Core ML |
| Parakeet TDT v3 CoreML INT8 30s | 0,6B | 30 s | no disponible en la informacion | no disponible en la informacion | Core ML |
| moondream/parakeet-ultra (original) | 0,6B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La comparación con alternativas fuera del ecosistema Apple (por ejemplo, Whisper u otros modelos ASR) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está limitado al ecosistema Apple: requiere Core ML con objetivo de despliegue macOS 15 o iOS 18 y no se distribuye en formatos como GGUF, safetensors o PyTorch.
- La ventana de entrada es de 30 segundos; el audio más largo debe segmentarse en ventanas consecutivas, lo que puede introducir errores en las fronteras de segmento.
- Solo admite audio de 16 kHz mono; es necesario remuestrear otras entradas.
- La cobertura lingüística se limita a 25 idiomas europeos; no se indican capacidades para otras lenguas.
- No se han publicado datos sobre sesgos, tasas de alucinación ni comportamiento en dominios específicos (médico, legal, acentos no nativos) en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar a NVIDIA (entrenamiento original), a Moondream (post-entrenamiento) y a esta distribución.
- El rendimiento medido corresponde a un Apple M5 Pro; en hardware Apple menos potente el factor de tiempo real puede diferir.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aufklarer/Parakeet-Ultra-CoreML-INT8-30s)
- [Moondream Parakeet Ultra (modelo base)](https://huggingface.co/moondream/parakeet-ultra/tree/73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b)
- [NVIDIA Parakeet TDT v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/tree/541d1f99c6b0c3cd0b11a95167540bb8edefd82b)
- [speech-swift (repositorio)](https://github.com/soniqo/speech-swift)
- [Getting started](https://soniqo.audio/getting-started)
- [soniqo.audio](https://soniqo.audio)
- [Blog de soniqo.audio](https://soniqo.audio/blog)
- [v3 Core ML bundle](https://huggingface.co/aufklarer/Parakeet-TDT-v3-CoreML-INT8-30s)
- [FLEURS test set](https://huggingface.co/datasets/google/fleurs)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
