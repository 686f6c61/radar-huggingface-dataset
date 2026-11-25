# GhaythMahadin/moonshine-base-gguf

## Resumen

Moonshine base es un modelo de reconocimiento automático del habla (ASR) desarrollado por Useful Sensors, especializado en transcripción de audio en inglés. Se trata de un transformer encoder-decoder de 61,5 millones de parámetros que procesa directamente PCM crudo a 16 kHz mediante un stem Conv1d de tres capas, prescindiendo de STFT y de mel-espectrogramas, lo que reduce la latencia de preprocesado y el coste computacional frente a arquitecturas tipo Whisper.

El modelo que nos ocupa es una conversión a formato GGUF realizada por GhaythMahadin para su uso con la librería transcribe.cpp. Se ofrecen tres cuantizaciones (F32, F16 y Q8_0) validadas contra la implementación de referencia en transformers, con un WER de 3,28 % en LibriSpeech test-clean para F32 y F16, y 3,26 % para Q8_0. El repositorio ocupa 0,5 GB y la licencia es MIT, heredada del modelo base.

Su relevancia actual radica en la posibilidad de ejecutar ASR de calidad competitiva en hardware muy modesto —desde CPU y GPU integradas hasta dispositivos embebidos— gracias al reducido tamaño del modelo y a la disponibilidad de cuantización Q8_0 de solo 74 MB, con ratios de tiempo real (RTF) inferiores a 1 en CPU y Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de 3 capas (sin STFT ni mel) |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de generación: 194 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); safetensors en el modelo base |
| Capas encoder / decoder | 8 / 8 |
| Dimensión oculta | 416 |
| RoPE parcial | 0,62 |
| Frecuencia de muestreo de entrada | 16 kHz mono PCM |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

Moonshine base sigue una arquitectura encoder-decoder de tipo transformer con 8 capas en el encoder y 8 en el decoder, dimensión oculta de 416 y RoPE parcial con factor 0,62. La innovación principal respecto a Whisper es el stem de tres capas Conv1d que consume directamente PCM crudo a 16 kHz, eliminando la necesidad de calcular STFT y mel-espectrogramas en el preprocesado. Esto reduce la latencia y el coste de cómputo en tiempo de inferencia, especialmente en dispositivos con recursos limitados. El modelo es más ancho y profundo que moonshine-tiny, y genera únicamente la transcripción, sin etiquetas de idioma ni marcas de tiempo.

No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original referencia el paper de Moonshine (arXiv:2410.15608) para los detalles de entrenamiento y evaluación. La conversión GGUF está fijada al commit 7a73d8d del modelo base y validada contra la referencia de transformers en el commit 07a8a84 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio PCM crudo a 16 kHz mono.
- Procesamiento directo de PCM sin preprocesado STFT/mel, lo que reduce la latencia de entrada.
- Generación de transcripción sin etiquetas de idioma, sin marcas de tiempo y sin traducción.
- Ejecución en CPU, GPU con Metal y GPU con Vulkan a través de transcribe.cpp.
- Cuantización Q8_0 con WER prácticamente idéntico al de F32 (3,26 % frente a 3,28 %).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta streaming (streaming: false en la model card).
- No soporta detección de idioma (lang_detect: false).
- No soporta traducción (translate: false).
- No genera marcas de tiempo (timestamps: none).

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio de 16 kHz mono y produce texto en inglés con un WER de 3,28 % en LibriSpeech test-clean, adecuado para actas y resúmenes posteriores sin enviar audio a la nube.
- Subtitulado offline de vídeos en inglés: dado que no genera timestamps, se usaría para obtener el texto completo y alinear después con herramientas externas de forced alignment; su reducido tamaño (74 MB en Q8_0) permite ejecutarlo en un portátil.
- Asistentes de voz embebidos: con 61,5 M de parámetros y cuantización Q8_0, cabe en dispositivos con poca memoria y puede ejecutarse en CPU con RTF de 22 en un Ryzen 4750U, lo que lo hace viable para comandos de voz locales.
- Transcripción en tiempo casi real en hardware de consumo: los RTF medidos (79,5 en Metal en M4 Max, 80,5 en CPU del mismo equipo, 34,5 en Vulkan y 22 en CPU de Ryzen 4750U) indican que el modelo procesa audio muchas veces más rápido que tiempo real, permitiendo pipelines de transcripción por lotes o cuasi interactivos.
- Procesamiento de archivos de audio en pipelines de CI/CD: la CLI de transcribe.cpp permite integrar la transcripción como un paso más en scripts de automatización, por ejemplo para indexar grabaciones o generar documentación a partir de audio.
- Aplicaciones de accesibilidad: transcripción local de conversaciones para personas con dificultades auditivas, sin dependencia de servicios externos y con licencia MIT que permite su incorporación en productos comerciales.
- Investigación en ASR de bajo coste: como modelo de referencia pequeño y reproducible, sirve para experimentar con cuantización y despliegue en entornos con recursos limitados, comparando WER entre F32, F16 y Q8_0.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Referencia |
|---|---:|---:|---:|---|
| WER LibriSpeech test-clean | 3,28 % | 3,28 % | 3,26 % | 3,27 % (upstream, paper Moonshine, Tabla 2) |

| Métrica de velocidad | Plataforma | RTF |
|---|---|---:|
| RTF m4 max | Metal | 79,5 |
| RTF m4 max | CPU | 80,5 |
| RTF Ryzen 4750U | Vulkan | 34,5 |
| RTF Ryzen 4750U | CPU | 22 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=194). La diferencia entre Q8_0 y F32 (0,02 puntos porcentuales) queda dentro del intervalo de confianza bootstrap del 95 % y se considera ruido. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; F32 ocupa 236 MB, F16 126 MB y Q8_0 74 MB en disco, por lo que la memoria necesaria en ejecución es del mismo orden.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon, incluido M4 Max con RTF 79,5) o Vulkan (por ejemplo, GPU integrada de Ryzen 4750U con RTF 34,5). No se requieren GPU de datacenter como A100 o H100.
- Cabe en cualquier GPU de consumo, incluidas integradas y sistemas embebidos, gracias al reducido tamaño del modelo.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), y el modelo base es compatible con transformers mediante `MoonshineForConditionalGeneration`.
- Latencia y throughput: los RTF medidos indican procesamiento entre 22 y 80 veces más rápido que tiempo real según plataforma; en CPU de Ryzen 4750U el RTF es 22 y en CPU de M4 Max 80,5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| Moonshine base (este) | 61,5 M | PCM 16 kHz, max_length 194 | 3,28 % (F32) | MIT | GGUF, safetensors |
| Whisper base | no disponible en la información | mel-espectrograma | no disponible en la información | MIT | safetensors, GGUF |
| Moonshine tiny | no disponible en la información | PCM 16 kHz | no disponible en la información | MIT | safetensors, GGUF |

No se dispone en la información proporcionada de datos de benchmarks de Whisper base ni de Moonshine tiny que permitan una comparación numérica rigurosa. La model card original indica que Moonshine base es más ancho y profundo que moonshine-tiny (8 capas de encoder y 8 de decoder frente a la configuración de tiny), pero no se aportan cifras de WER de tiny.

## Limitaciones y advertencias

- Solo soporta inglés; no hay traducción, detección de idioma ni soporte multilingüe.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado sincronizado.
- No soporta streaming; la transcripción es por lotes sobre archivos completos.
- Riesgo de alucinación y bucles de generación: la model card original recomienda limitar la longitud máxima de texto generado en función de los tokens esperados por segundo (factor 6,5) para evitarlos.
- Sesgos conocidos: la model card original advierte que, al igual que Whisper, el modelo puede heredar sesgos de los datos de entrenamiento; no se detallan sesgos específicos en la información disponible.
- Restricciones de licencia: MIT permite uso comercial, pero se hereda del modelo base y conviene revisar la model card upstream para términos completos.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopción y validación por la comunidad es aún inexistente.
- La validación se realizó contra un commit concreto de transcribe.cpp (07a8a84) y del modelo base (7a73d8d); cambios posteriores en cualquiera de los dos podrían afectar a la reproducibilidad.

## Enlaces

- Repositorio Hugging Face de la conversión GGUF: https://huggingface.co/GhaythMahadin/moonshine-base-gguf
- Modelo base en Hugging Face: https://huggingface.co/UsefulSensors/moonshine-base
- Commit del modelo base referenciado: https://huggingface.co/UsefulSensors/moonshine-base/commit/7a73d8d
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado en la validación: https://github.com/handy-computer/transcribe.cpp/tree/07a8a84
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-base.md
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
- Blog de presentación de Moonshine: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio de instalación de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Paper de model cards (Mitchell et al.): https://arxiv.org/abs/1810.03993
- Podcast sobre Moonshine: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
