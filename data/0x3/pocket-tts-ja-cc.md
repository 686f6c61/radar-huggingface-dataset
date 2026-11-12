# 0x3/pocket-tts-ja-cc

## Resumen

Pocket TTS Japanese (CC BY) es un modelo de síntesis de voz (text-to-speech) para japonés, desarrollado por el usuario 0x3 como fine-tuning del modelo Pocket TTS de Kyutai. El modelo parte del checkpoint inglés de 24 capas y se ha reentrenado con el código oficial de entrenamiento utilizando exclusivamente datos con licencia CC BY, lo que permite su uso comercial con atribución. Se distribuye en dos configuraciones: una de 6 capas (110M parámetros con el códec, 219 MB) y otra de 24 capas (336M parámetros, 1,3 GB).

La relevancia de este modelo radica en su licencia permisiva (CC BY 4.0) frente a su hermano `takuma104/pocket-tts-ja`, entrenado con datos adicionales de Emilia (no comercial) y publicado bajo CC BY-NC 4.0. Esto lo convierte en una opción viable para productos comerciales que necesiten TTS en japonés con clonación de voz zero-shot. El modelo funciona con el paquete estándar `pocket-tts` (versión 3.3.0 o superior) en CPU sin cambios de código, y acepta texto japonés plano (kanji y kana) sin necesidad de un front-end G2P, ya que el propio modelo resuelve la lectura de los kanji.

La arquitectura subyacente es la de Pocket TTS, un modelo compacto orientado a inferencia en CPU, con un decodificador de códec fine-tuneado y guidance sin clasificador destilada en los pesos. El contexto de audio se genera a 24 kHz y la clonación de voz se realiza a partir de unos segundos de audio de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (transformer con FlowLM y códec Mimi fine-tuneado) |
| Parametros totales | 110M (config `japanese`, 6 capas) / 336M (config `japanese_24l`, 24 capas), incluyendo el códec |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 segun la model card) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Pocket TTS de Kyutai, un sistema de síntesis de voz compacto que combina un transformer (FlowLM) con un códec de audio. La variante `japanese` usa 6 capas y la `japanese_24l` usa 24 capas, esta última fine-tuneada directamente desde el modelo inglés de 24 capas. El decodificador del códec (Mimi) también se ha fine-tuneado, lo que según la model card mejora principalmente la similitud con el hablante de referencia (0.650 en ECAPA frente a 0.560 con el decodificador original). La guidance sin clasificador (escala 2.0) está destilada en los pesos, por lo que no requiere pasos adicionales en inferencia.

El entrenamiento se realizó con el código oficial de Pocket TTS sobre datos exclusivamente CC BY, concretamente los datasets `espnet/yodas3` y `amphion/Emilia-Dataset` (este último filtrado para quedarse solo con las porciones compatibles con CC BY). El modelo no usa un front-end G2P: procesa directamente texto con kanji y kana y decide la lectura de los kanji por sí mismo. La temperatura de muestreo configurada es 0.3, valor con el que se midieron todos los resultados publicados.

## Capacidades

- Síntesis de voz en japonés a partir de texto plano con kanji y kana, sin necesidad de conversión G2P.
- Clonación de voz zero-shot a partir de unos segundos de audio de referencia limpio.
- Lectura de kanji con una precisión del 94,77% en el benchmark JKYB-Parakeet (config `japanese`, prompts rotativos de 4 hablantes JVS).
- Generación de audio a 24 kHz como tensor de PyTorch.
- Ejecución en CPU con el paquete estándar `pocket-tts` 3.3.0 o superior, sin modificar código.
- Incluye diez voces sintéticas predefinidas (cinco femeninas, cinco masculinas) generadas con Irodori-TTS-v4.1-Small, que no corresponden a ninguna persona real.
- Soporte de textos cortos (2-8 tokens) con baja tasa de fallos de parada (0 de 172 en GPU, 1 de 172 en CPU).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modos de razonamiento.

## Casos de uso

- Audiolibros y narración automatizada en japonés: el modelo lee texto con kanji y kana de forma directa (sin G2P) con una precisión de lectura de kanji del 94,77% en JKYB, adecuada para contenido literario y divulgativo. La clonación de voz permite mantener un narrador consistente a lo largo de capítulos.
- Atención al cliente con voz sintética en japonés: al ejecutarse en CPU con el paquete estándar, se puede desplegar en servidores sin GPU para generar respuestas de voz en tiempo real en sistemas de IVR o asistentes telefónicos.
- Doblaje y localización de contenido: la clonación zero-shot a partir de pocos segundos de referencia permite generar voces que imitan a un hablante concreto para vídeos, tutoriales o material formativo, con la ventaja de la licencia CC BY para uso comercial.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad en japonés, con voces sintéticas predefinidas que no plantean problemas de derechos de imagen.
- Prototipado de productos de voz: al ser un modelo de 110M-336M parámetros y 219 MB-1,3 GB, se puede integrar en aplicaciones de escritorio o móviles con requisitos de hardware modestos y licencia permisiva.
- Generación de datasets de audio sintético: las diez voces sintéticas incluidas permiten generar corpus de voz en japonés para entrenar otros modelos o para pruebas de sistemas ASR, sin depender de grabaciones de personas reales.
- Investigación en TTS multilingüe: sirve como punto de partida para fine-tuning a otros idiomas o para estudiar la destilación de CFG y el fine-tuning del decodificador Mimi, con receta y logs publicados en el repositorio de GitHub.

## Benchmarks y rendimiento

Lectura de kanji en JKYB-Parakeet (13.536 frases, protocolo oficial kana-whisper, precisión de la palabra objetivo):

| Modelo | Prompts: 4 hablantes JVS rotativos | Prompt: jvs001 |
|---|---:|---:|
| `japanese` | 94,77% | 94,49% |
| `japanese_24l` | 94,36% | 94,85% |
| *Decodificador Mimi original:* `japanese` | 93,93% | 93,96% |
| *Decodificador Mimi original:* `japanese_24l` | 93,34% | 94,08% |
| *Profesor de 24 capas antes de destilar CFG (no publicado)* | 92,82% | 93,82% |
| *Hermano CC BY-NC (`pocket-tts-ja`):* `japanese` | 94,75% | 94,84% |
| *Hermano CC BY-NC:* `japanese_24l` | 94,32% | 94,49% |

Otros conjuntos, config `japanese` con el paquete estándar en CPU frente a evaluación en GPU del mismo checkpoint:

| Conjunto | Métrica | GPU | Paquete estándar, CPU |
|---|---|---:|---:|
| JKYB-mini (1.500 frases) | precisión | 94,9% | 95,1% |
| Aozora Bunko ruby (1.000 frases) | precisión de lectura objetivo | 70,7% | no disponible |
| JSUT (1.000 frases) | Kana-CER | 2,14% | 2,23% |
| JVS zero-shot (5 hombres + 5 mujeres, 10 frases cada uno) | Kana-CER | 2,18% | 2,09% |
| JVS zero-shot | similitud ECAPA con la grabación del hablante | 0,651 | 0,650 |
| Textos cortos (172 textos de 2-8 tokens) | no paró / habla extra | 0 / 2 | 0 / 1 |

Para `japanese_24l` (3 frames tras el fin del habla): JKYB-mini 94,9%, Aozora Bunko 70,3%, JSUT 2,13%, JVS 2,47% / 0,645, textos cortos 0 / 0 en GPU; con el paquete estándar en CPU, JKYB-mini 94,1% y JSUT 2 (dato truncado en la información disponible).

Con el decodificador Mimi original, el paquete estándar da JKYB-mini 94,4%, JSUT 2,49% y JVS 2,15% / 0,560; el decodificador fine-tuneado eleva principalmente la similitud con el hablante (el hermano CC BY-NC: 0,575).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo está diseñado para ejecutarse en CPU. El fichero de 24 capas ocupa 1,3 GB en bfloat16 y el de 6 capas 219 MB.
- GPU recomendadas: no se especifican; la model card reporta resultados tanto en GPU como en CPU con el paquete estándar.
- Cabe en cualquier consumer GPU con al menos 2 GB de VRAM para la variante de 24 capas; la de 6 capas es aún más ligera.
- Despliegue: paquete oficial `pocket-tts` (versión 3.3.0 o superior), invocable mediante CLI (`uvx pocket-tts generate`) o API de Python (`TTSModel.load_model`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| `0x3/pocket-tts-ja-cc` (este) | 110M / 336M | no disponible | CC BY 4.0 | ja | Solo datos CC BY; uso comercial |
| `takuma104/pocket-tts-ja` | 110M / 336M | no disponible | CC BY-NC 4.0 | ja | Entrenado con Emilia (no comercial); JKYB 94,75% / 94,32% |
| `kyutai/pocket-tts` (base) | no disponible | no disponible | no disponible | en (principalmente) | Modelo original inglés de Kyutai |
| `Aratako/Irodori-TTS-v4.1-Small` | no disponible | no disponible | no disponible | ja | Usado para generar las voces sintéticas del repo; no es un competidor directo documentado |

## Limitaciones y advertencias

- El modelo solo soporta japonés; no se ha entrenado para otros idiomas.
- La precisión de lectura en textos con ruby de Aozora Bunko baja al 70,7%, lo que indica dificultades con lecturas poco frecuentes o contextos literarios complejos.
- Riesgo de alucinación de audio: en textos cortos se observaron casos aislados de habla extra (2 de 172 en GPU, 1 de 172 en CPU para la config de 6 capas).
- La variante de 24 capas puede emitir un sonido breve en los últimos frames tras el fin del habla; su configuración lo mitiga terminando el audio 3 frames (240 ms) después de la decisión de parada.
- Las voces predefinidas son sintéticas y no se pueden seleccionar por nombre (`--voice alba` no funciona); son embeddings calculados con los pesos oficiales.
- La clonación de voz zero-shot plantea riesgos de suplantación de identidad y uso indebido; la licencia CC BY exige atribución, pero no impone restricciones éticas adicionales sobre el uso de voces clonadas.
- El modelo base es inglés y el fine-tuning se ha hecho con datos CC BY exclusivamente, lo que puede limitar la cobertura de acentos y estilos frente al hermano entrenado con más datos.
- No se documentan resultados de benchmarks para contextos largos ni para habla espontánea fuera de los conjuntos JVS y JSUT.

## Enlaces

- Hugging Face: https://huggingface.co/0x3/pocket-tts-ja-cc
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Hermano CC BY-NC: https://huggingface.co/takuma104/pocket-tts-ja
- Repositorio de código y receta: https://github.com/takuma104/pocket-tts-ja
- Informe técnico (inglés): https://github.com/takuma104/pocket-tts-ja/blob/main/docs/report/pocket_tts_ja_report_en.pdf
- Informe técnico (japonés): https://github.com/takuma104/pocket-tts-ja/blob/main/docs/report/pocket_tts_ja_report_ja.pdf
- Repositorio de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Benchmark JKYB-Parakeet: https://github.com/Parakeet-Inc/Joyo-Kanji-Yomi-Benchmark-Parakeet-Edition
- Voces sintéticas (Irodori-TTS-v4.1-Small): https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Dataset espnet/yodas3: https://huggingface.co/datasets/espnet/yodas3
- Dataset amphion/Emilia-Dataset: https://huggingface.co/datasets/amphion/Emilia-Dataset
- Paper arXiv 2509.06926: https://arxiv.org/abs/2509.06926
- Paper arXiv 2501.15907: https://arxiv.org/abs/2501.15907
