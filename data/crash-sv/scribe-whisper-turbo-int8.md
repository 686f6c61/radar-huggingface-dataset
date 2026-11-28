# crash-sv/scribe-whisper-turbo-int8

## Resumen

scribe-whisper-turbo-int8 es una conversión a CTranslate2 con cuantización int8 de los pesos oficiales de openai/whisper-large-v3-turbo, publicada por el desarrollador Viacheslav Smirnov (crash-sv) para su aplicación de dictado y traducción en Windows llamada Scribe SV. No se ha reentrenado ni ajustado el modelo: se trata de una conversión directa mediante `ct2-transformers-converter` a partir de los pesos originales de OpenAI, pensada para equipos sin GPU CUDA.

El modelo resuelve el problema de ejecutar reconocimiento automático de voz de alta calidad en CPU con un consumo de disco reducido (0,8 GB frente a los aproximadamente 1,5 GB de la variante float16). La arquitectura subyacente es la de Whisper large-v3-turbo, un transformer encoder-decoder con aproximadamente 809 millones de parámetros, de los cuales solo 4 capas del decoder se mantienen activas respecto a large-v3 (32 capas de encoder y 4 de decoder), lo que reduce la latencia de decodificación.

Su relevancia actual radica en que demuestra que la cuantización int8 sobre CTranslate2 apenas degrada la precisión (+0,71 puntos porcentuales de WER en la medición del autor) a cambio de hacer viable la inferencia en CPU. La ficha se centra en los datos publicados en la model card; cualquier dato no incluido allí se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a CTranslate2 |
| Parametros totales | no disponible en la model card (el modelo base Whisper large-v3-turbo tiene aproximadamente 809 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3-turbo admite ventanas de audio de 30 s) |
| Tipos de cuantizacion | int8 (esta variante); float16 disponible en repositorio separado |
| Idiomas soportados | ruso (ru), ingles (en) declarados; el modelo base soporta multilingue |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`, `config.json`, `preprocessor_config.json`, `tokenizer.json`, `vocabulary.json`) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de openai/whisper-large-v3-turbo a CTranslate2 con cuantización int8, sin reentrenamiento ni fine-tuning. Whisper large-v3-turbo es una variante de la familia Whisper en la que el decoder se reduce a 4 capas (frente a las 32 de large-v3), manteniendo el encoder completo; esto acelera la decodificación a costa de una ligera pérdida de calidad respecto a large-v3. El proceso de conversión ejecutado fue:

```
ct2-transformers-converter --model openai/whisper-large-v3-turbo \
    --copy_files tokenizer.json preprocessor_config.json \
    --output_dir . --quantization int8
```

No se documentan en la model card detalles sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO, ya que no hubo entrenamiento adicional por parte del publicador. La innovación destacable es la propia cuantización int8 sobre CTranslate2, que reduce el tamaño del repositorio a 0,8 GB y permite inferencia en CPU con una penalización de precisión medida de +0,71 pp de WER.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio, con salida de segmentos con marcas de tiempo.
- Detección de actividad de voz (VAD) integrada mediante `vad_filter` en faster-whisper.
- Decodificación con beam search (`beam_size` configurable) y condicionamiento en texto previo (`condition_on_previous_text`).
- Soporte de `initial_prompt` para sesgar el reconocimiento hacia vocabulario o estilo concretos.
- Umbral de alucinación en silencios (`hallucination_silence_threshold`) y relleno de silencio (`speech_pad_ms`) configurables.
- Generación de puntuación en la transcripción (medida en la bench del autor: 26,4 marcas por 100 palabras en habla espontánea).
- Idiomas declarados: ruso e inglés; el modelo base es multilingüe, aunque la model card no detalla el rendimiento en otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado por voz en Windows: Scribe SV emplea este modelo para transcribir dictado en tiempo real o por lotes en equipos sin GPU CUDA, aprovechando el tamaño reducido de 0,8 GB y la inferencia int8 en CPU.
- Transcripción de reuniones y notas de voz en ruso e inglés: el modelo maneja audio de varios minutos con VAD y condicionamiento en texto previo, adecuado para actas y resúmenes posteriores.
- Subtitulado de vídeos y podcasts: la salida por segmentos con marcas de tiempo permite generar ficheros de subtítulos; el coste medido de 58,2 s para 194 s de audio en CPU es aceptable para procesamiento por lotes.
- Traducción asistida en la aplicación Scribe SV: la utilidad de dictado y traducción usa el modelo como primer paso de transcripción antes de traducir, con idiomas origen ruso e inglés.
- Procesamiento por lotes en servidores sin GPU: despliegue en máquinas CPU-only con faster-whisper para transcribir colas de audio, priorizando el throughput sobre la latencia interactiva.
- Prototipado y evaluación de pipelines ASR: la variante int8 permite reproducir la comparativa de precisión y latencia frente a float16 sin necesidad de hardware CUDA, útil para decidir el despliegue definitivo.
- Aplicaciones de accesibilidad: transcripción local de voz a texto en equipos modestos, sin depender de servicios en la nube, con la licencia MIT como ventaja para integración comercial.

## Benchmarks y rendimiento

Datos medidos por el autor sobre su propia bench (audio en ruso de 194 s con transcripción de referencia humana; `beam_size=5`, `vad_filter=True`, `condition_on_previous_text=True`, `initial_prompt`, `speech_pad_ms=600`, `hallucination_silence_threshold=2.0`):

| Metrica | float16 en CUDA | int8 en CPU |
|---|---|---|
| WER | 3,54 % | 4,25 % |
| Fichero de 194 s | 3,4 s | 58,2 s |
| Frase corta (3-10 s de audio) | 0,18-0,26 s | 5,2-5,8 s |
| Signos de puntuación por 100 palabras (habla espontánea) | 31,8 | 26,4 |

Observación relevante del autor: en CPU la latencia de una frase corta es aproximadamente constante en torno a 5 s independientemente de su duración (3 s y 10 s de audio tardan lo mismo). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en esta variante; está pensada para CPU. La variante float16 en CUDA se distribuye en un repositorio separado de aproximadamente 1,5 GB.
- GPU recomendadas: no se especifican en la model card; para GPU existe la variante float16 (crash-sv/scribe-whisper-turbo-fp16). No se documentan modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no disponible para esta variante int8; el modelo está orientado a CPU.
- Almacenamiento: 0,8 GB para el repositorio completo (model.bin, config.json, preprocessor_config.json, tokenizer.json, vocabulary.json).
- Opciones de despliegue: faster-whisper con `device="cpu"` y `compute_type="int8"`; descarga mediante `snapshot_download` de huggingface_hub. La librería declarada es ctranslate2.
- Latencia y throughput: 58,2 s para 194 s de audio en CPU (medición del autor); 5,2-5,8 s para frases de 3-10 s; 3,4 s para el mismo fichero de 194 s en float16 sobre CUDA. No se especifica el hardware exacto de la bench.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (bench del autor, ruso) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crash-sv/scribe-whisper-turbo-int8 | no disponible (base ~809 M) | no disponible (ventanas de 30 s en el base) | 4,25 % (int8, CPU) | MIT | Hugging Face, 179 descargas |
| crash-sv/scribe-whisper-turbo-fp16 | no disponible (base ~809 M) | no disponible (ventanas de 30 s en el base) | 3,54 % (float16, CUDA) | MIT | Hugging Face, repositorio separado |
| openai/whisper-large-v3-turbo | ~809 M | ventanas de 30 s | no disponible en la información proporcionada | MIT | Hugging Face (modelo base oficial) |

No se dispone de datos de benchmarks de otros modelos ASR comparables (por ejemplo, variantes de Whisper large-v3 o alternativas de otros autores) en la información proporcionada; la comparativa se limita a las dos variantes del mismo autor y al modelo base.

## Limitaciones y advertencias

- Solo se declaran ruso e inglés como idiomas soportados; el rendimiento en otros idiomas del modelo base no está documentado.
- La cuantización int8 introduce una degradación medible: +0,71 pp de WER y menos puntuación (26,4 frente a 31,8 marcas por 100 palabras en habla espontánea).
- En CPU la latencia de frases cortas es aproximadamente constante (~5 s), lo que penaliza la interacción en tiempo real con fragmentos breves.
- Riesgo de alucinación en silencios o audio de baja calidad; el autor mitiga con `hallucination_silence_threshold=2.0` y VAD, pero no se documenta una evaluación sistemática de este riesgo.
- No se documentan sesgos conocidos del modelo ni evaluaciones de robustez por acento, ruido o dominio.
- Licencia MIT, que permite uso comercial; se conservan las licencias originales de OpenAI y el texto de la licencia se incluye en el repositorio.
- El modelo no ha sido reentrenado; cualquier limitación del modelo base Whisper large-v3-turbo se hereda.
- La model card no documenta el hardware exacto de la bench, por lo que las cifras de latencia deben tomarse como orientativas.
- Orientado a equipos sin GPU CUDA; para GPU debe usarse la variante float16 en repositorio separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crash-sv/scribe-whisper-turbo-int8
- Variante float16 para GPU: https://huggingface.co/crash-sv/scribe-whisper-turbo-fp16
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de la aplicación Scribe SV: https://github.com/Crash-SV
- Licencia de OpenAI Whisper: https://raw.githubusercontent.com/openai/whisper/main/LICENSE
