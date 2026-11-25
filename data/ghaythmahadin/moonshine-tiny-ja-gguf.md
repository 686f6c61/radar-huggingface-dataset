# GhaythMahadin/moonshine-tiny-ja-gguf

## Resumen

moonshine-tiny-ja-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-ja, afinado específicamente para japonés. Lo publica el usuario GhaythMahadin y está pensado para ejecutarse con transcribe.cpp, una implementación en C++ de inferencia ASR orientada a dispositivos de borde. El modelo original lo desarrolla Moonshine AI (antes Useful Sensors) y forma parte de la familia "Flavors of Moonshine", una línea de modelos ASR especializados por idioma y tamaño para hardware con recursos limitados.

La arquitectura es un transformer encoder-decoder de 27.092.736 parámetros (unos 27M), la misma que moonshine-tiny pero con ajuste fino sobre japonés. Consume PCM en bruto a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y emite únicamente la transcripción. Es un modelo monolingüe (ja) que no traduce, no detecta idioma y no genera marcas de tiempo.

Su relevancia actual radica en que ofrece transcripción en japonés con un peso de entre 34 MB (Q8_0) y 105 MB (F32), lo que permite desplegarlo en CPU, GPU integradas o dispositivos móviles con latencias muy bajas. La licencia MIT facilita su integración comercial y la disponibilidad en GGUF simplifica su uso fuera del ecosistema Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Moonshine tiny), stem Conv1d de 3 capas sobre PCM 16 kHz |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación por defecto: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors vía Transformers |
| Tamaño del repo | 0,2 GB |
| Entrada de audio | PCM mono a 16 kHz |
| Salida | Solo transcripción (sin timestamps, sin traducción, sin detección de idioma) |
| Streaming | No |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine tiny: un encoder-decoder transformer de aproximadamente 27M parámetros que procesa audio en bruto a 16 kHz. A diferencia de Whisper, no aplica STFT ni banco de filtros mel; en su lugar, un stem de tres capas Conv1d aprende directamente representaciones del PCM. Esta decisión reduce el coste computacional y la latencia, y hace que el modelo sea adecuado para hardware de borde. La variante ja se obtiene por ajuste fino del moonshine-tiny base sobre datos en japonés; el autor original no detalla en la información disponible la composición exacta del dataset de ajuste ni el número de tokens de audio utilizados.

La conversión a GGUF la realiza GhaythMahadin a partir del commit 02ca41b del modelo upstream (fijado el 2026-05-12) y se valida contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp. Los pesos se ofrecen en F32, F16 y Q8_0. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; la decodificación por defecto es greedy con num_beams=1 y max_length=192, coherente con la generation_config upstream.

## Capacidades

- Transcripción de voz a texto en japonés a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio en bruto sin preprocesado espectral (sin STFT ni mel), lo que simplifica el pipeline.
- Inferencia en CPU y GPU mediante transcribe.cpp, con soporte de Metal (Apple) y Vulkan.
- Modelo monolingüe: no traduce, no detecta idioma y no genera marcas de tiempo.
- No soporta streaming (streaming: false en la configuración de transcribe.cpp).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.
- Sin capacidades de visión, audio generativo ni razonamiento multi-paso.

## Casos de uso

- Subtitulado de vídeo en japonés: el modelo transcribe audio de 16 kHz y permite generar subtítulos en pipelines de postproducción; su tamaño reducido (34 MB en Q8_0) facilita procesar lotes grandes en CPU sin GPU dedicada.
- Transcripción en dispositivos de borde: al ejecutarse con transcribe.cpp en CPU y con un RTF de 45,5 en un Ryzen 4750U, puede integrarse en aplicaciones de escritorio o embebidas que graban y transcriben localmente sin conexión.
- Notas de voz en aplicaciones móviles o de escritorio: con 27M parámetros y pesos de 34 MB, cabe en memoria de dispositivos con recursos limitados y permite dictado offline en japonés.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones japonesas para su posterior indexación y búsqueda; la licencia MIT permite integrarlo en productos comerciales.
- Accesibilidad para personas con discapacidad auditiva: generación de texto a partir de audio en tiempo casi real en hardware modesto, con la salvedad de que no soporta streaming nativo y requiere segmentar el audio.
- Investigación en ASR de bajo consumo: punto de partida para experimentos de cuantización y despliegue en C++ gracias a los tres formatos GGUF disponibles y a la validación numérica frente a la referencia de Transformers.
- Prototipado rápido en Mac con Metal: el RTF de 127 en un M4 Max permite transcribir audio más rápido que tiempo real en portátiles Apple.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el split de test de FLEURS-ja (650 enunciados) con decodificación greedy, num_beams=1 y max_length=192:

| Cuantización | Tamaño | CER (FLEURS ja test) |
|---|---:|---:|
| F32 | 105 MB | 13,20 % |
| F16 | 57 MB | 13,20 % |
| Q8_0 | 34 MB | 13,36 % |
| Referencia Transformers F32 (MPS) | — | 13,23 % |

Rendimiento (RTF, menor es mejor) según la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con Whisper u otros modelos ASR) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 105 MB en F32, 57 MB en F16 y 34 MB en Q8_0, más el overhead del runtime de transcribe.cpp.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Se ha validado en Apple M4 Max con Metal y en AMD Ryzen 4750U con Vulkan y CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos; no necesita A100 ni H100.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), y la versión original vía Transformers con `MoonshineForConditionalGeneration` y `AutoProcessor`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 127 (Metal, M4 Max), 153,5 (CPU, M4 Max), 56 (Vulkan, Ryzen 4750U) y 45,5 (CPU, Ryzen 4750U). El audio debe convertirse previamente a WAV mono a 16 kHz con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto/entrada | Licencia | Formato | CER FLEURS-ja |
|---|---|---:|---|---|---|---|
| moonshine-tiny-ja-gguf | 27M | ja | PCM 16 kHz | MIT | GGUF | 13,20 % (F32/F16), 13,36 % (Q8_0) |
| moonshine-tiny (base) | 27M | en | PCM 16 kHz | MIT | safetensors | no disponible |
| Whisper tiny | 39M | multilingüe | mel 80 canales | MIT | safetensors, GGUF (vía terceros) | no disponible en esta información |
| Whisper base | 74M | multilingüe | mel 80 canales | MIT | safetensors, GGUF (vía terceros) | no disponible en esta información |

La comparación con Whisper se ofrece a título orientativo por categoría (ASR de pequeño tamaño); no se dispone en la información proporcionada de cifras de CER comparables para Whisper en FLEURS-ja.

## Limitaciones y advertencias

- Modelo monolingüe en japonés: no transcribe otros idiomas ni detecta el idioma de entrada.
- No genera marcas de tiempo ni traducción; la salida es únicamente texto transcrito.
- No soporta streaming nativo, por lo que para audio en vivo hay que segmentar manualmente.
- Riesgo de bucles de alucinación en pasajes silenciosos o ruidosos; la model card upstream recomienda limitar la longitud máxima de generación en función de la duración del audio.
- CER de referencia del 13,2 % en FLEURS-ja: aceptable para dictado y notas, pero puede ser insuficiente para transcripción legal o médica sin revisión humana.
- La cuantización Q8_0 introduce una deriva pequeña frente a F16 (típicamente por debajo de 0,1 puntos porcentuales de CER), aunque conviene validar en el dominio de uso.
- El modelo no ha sido evaluado en la información disponible para sesgos demográficos, acentos regionales del japonés ni audio con ruido de fondo intenso.
- Licencia MIT heredada del modelo base, que permite uso comercial; aun así, conviene revisar los términos del modelo upstream para obligaciones de atribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; la conversión es reciente y no cuenta con validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-tiny-ja-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ja
- Commit upstream de referencia: https://huggingface.co/UsefulSensors/moonshine-tiny-ja/commit/02ca41b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Paper de Flavors of Moonshine: https://huggingface.co/papers/2509.02523
- Código de Moonshine AI: https://github.com/moonshine-ai/moonshine
- Instrucciones de instalación de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Descarga directa F32: https://huggingface.co/handy-computer/moonshine-tiny-ja-gguf/resolve/main/moonshine-tiny-ja-F32.gguf
- Descarga directa F16: https://huggingface.co/handy-computer/moonshine-tiny-ja-gguf/resolve/main/moonshine-tiny-ja-F16.gguf
- Descarga directa Q8_0: https://huggingface.co/handy-computer/moonshine-tiny-ja-gguf/resolve/main/moonshine-tiny-ja-Q8_0.gguf
