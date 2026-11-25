# GhaythMahadin/moonshine-base-vi-gguf

## Resumen

moonshine-base-vi-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla UsefulSensors/moonshine-base-vi, publicada por GhaythMahadin para su uso con la librería transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 61.513.920 parámetros (aproximadamente 62M), especializado en transcripción de audio en vietnamita, que hereda la arquitectura Moonshine base de Useful Sensors.

El modelo consume PCM crudo a 16 kHz directamente mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y emite únicamente la transcripción. Es un modelo monolingüe (vietnamita) que no realiza traducción, detección de idioma ni marcas de tiempo. Su relevancia radica en ofrecer una alternativa ligera y de baja latencia para ASR en vietnamita, empaquetada en cuantizaciones que van desde 74 MB (Q8_0) hasta 236 MB (F32), lo que permite desplegarla en hardware modesto.

La conversión está validada contra la referencia de transformers en el commit 90bf720 de transcribe.cpp, con un WER de 9,66-9,79 % en el split de test de FLEURS-vi según la cuantización. La licencia MIT facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine base) con stem Conv1d de tres capas |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; max_length de decodificación 192) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp); pesos originales en safetensors en el modelo base |
| Entrada de audio | PCM crudo mono a 16 kHz |
| Salida | solo transcripción (sin timestamps) |
| Streaming | no |
| Traducción | no |
| Detección de idioma | no |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine base: un transformer encoder-decoder de aproximadamente 62M parámetros. A diferencia de los pipelines ASR clásicos basados en Whisper, la entrada de audio se procesa mediante un stem de tres capas Conv1d que consume directamente PCM crudo a 16 kHz, eliminando la necesidad de STFT y banco de filtros mel. Esta elección reduce el preprocesado y el coste computacional asociado.

El modelo es un fine-tuning de UsefulSensors sobre el Moonshine base para vietnamita, según indica la model card. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF fue realizada por GhaythMahadin a partir del commit 0ee9ce9 del modelo base (fijado el 2026-05-12) y validada numéricamente contra la referencia de transformers en el commit 90bf720 de transcribe.cpp.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita, con salida de solo transcripción.
- Procesamiento de audio PCM crudo mono a 16 kHz sin preprocesado mel.
- Decodificación greedy (num_beams=1, max_length=192) por defecto, coincidiendo con la generation_config del modelo original.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta streaming.
- No realiza traducción.
- No realiza detección de idioma.
- No genera marcas de tiempo.
- Capacidad monolingüe: únicamente vietnamita.

## Casos de uso

- Transcripción de reuniones y entrevistas en vietnamita: el modelo convierte audio mono a 16 kHz en texto plano, adecuado para actas y resúmenes posteriores en un pipeline de NLP.
- Subtitulado de contenido audiovisual vietnamita: aunque no genera timestamps, puede integrarse con un alineador externo para producir subtítulos sincronizados.
- Atención al cliente automatizada en vietnamita: la transcripción de llamadas permite alimentar sistemas de análisis de sentimiento o enrutamiento de tickets.
- Dictado y notas de voz: el tamaño reducido (74 MB en Q8_0) permite desplegarlo en aplicaciones de escritorio o móviles con transcripción local.
- Indexación y búsqueda de archivos de audio: transcripción masiva de grabaciones para construir índices de texto consultables.
- Investigación en ASR de bajos recursos: como modelo ligero de referencia para experimentos con vietnamita, con WER conocido en FLEURS-vi (9,66-9,79 %).
- Procesamiento en el borde (edge): su bajo coste computacional (RTF de 22-80 según plataforma) permite ejecución en CPU y GPU integradas sin aceleradores dedicados.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS-vi test (857 utterances) | 9,67 % | 9,66 % | 9,79 % |
| Tamaño | 236 MB | 126 MB | 74 MB |

Referencia transformers F32 sobre MPS: 9,66 % WER en el mismo manifiesto.

Rendimiento (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 79,5 |
| Apple M4 Max | CPU | 80,5 |
| AMD Ryzen 4750U | Vulkan | 34,5 |
| AMD Ryzen 4750U | CPU | 22 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (74 MB Q8_0, 126 MB F16, 236 MB F32), más overhead del runtime.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon (Metal) y GPUs AMD/Intel vía Vulkan.
- Cabe en cualquier GPU de consumo e incluso en CPU: el RTF de 22 en un Ryzen 4750U (CPU) indica ejecución más rápida que tiempo real.
- Opciones de despliegue: transcribe.cpp (librería nativa con CLI `transcribe-cli`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 22-80,5 según plataforma y backend; en M4 Max con Metal el RTF es 79,5, en Ryzen 4750U con Vulkan 34,5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---:|---|---|---|
| moonshine-base-vi-gguf | 61,5M | PCM 16 kHz, max_length 192 | vi | MIT | GGUF |
| moonshine-base (original) | ~62M | PCM 16 kHz | en (principal) | MIT | safetensors |
| Whisper small | ~244M | 30 s ventana, mel | multilingüe | MIT | safetensors, GGUF |
| Whisper tiny | ~39M | 30 s ventana, mel | multilingüe | MIT | safetensors, GGUF |

No se dispone de datos comparativos de WER entre estos modelos en la información proporcionada; los valores de Whisper y moonshine-base no están publicados en el material de referencia. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe vietnamita; no traduce ni detecta idioma.
- Sin marcas de tiempo: no apto por sí solo para subtitulado sincronizado sin un alineador externo.
- Sin streaming: requiere audio completo o segmentado manualmente antes de la inferencia.
- Riesgo de alucinación inherente a modelos ASR, especialmente en audio con ruido, acentos no estándar o vocabulario técnico.
- No se documentan sesgos específicos del modelo en la información disponible; al ser un fine-tuning sobre datos no detallados, se desconoce la composición del corpus de entrenamiento.
- Requiere audio mono a 16 kHz; es necesario remuestrear previamente con herramientas como ffmpeg.
- La licencia MIT permite uso comercial, pero se recomienda revisar la model card del modelo base (UsefulSensors/moonshine-base-vi) para términos completos.
- El WER de referencia (9,66-9,79 %) procede de FLEURS-vi; el rendimiento en dominios distintos (conversacional, telefónico, ruidoso) no está caracterizado.
- La cuantización Q8_0 introduce una deriva adicional de aproximadamente 0,1 puntos porcentuales respecto a F16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-base-vi-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-vi
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-base-vi/commit/0ee9ce9
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-Q8_0.gguf
- Paper referenciado (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
