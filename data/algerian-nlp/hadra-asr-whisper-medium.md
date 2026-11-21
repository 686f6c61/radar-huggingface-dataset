# algerian-nlp/Hadra-ASR-whisper-medium

## Resumen

EL-ANKA es un adaptador LoRA para reconocimiento automático del habla (ASR) especializado en dariya argelina (`arq`), desarrollado por el colectivo Algerian NLP (Kamel Touati). Se construye sobre el backbone encoder-decoder de `openai/whisper-medium` (763,9 M de parámetros congelados) al que se añaden 69,2 M de parámetros entrenables (rango 64, alpha 128), alcanzando un total de 833,1 M de parámetros. El modelo resuelve un problema concreto: la baja cobertura de las variantes magrebíes del árabe en los sistemas ASR multilingües, que suelen degradarse notablemente fuera del árabe estándar moderno.

El adaptador se entrenó con un currículo de tres fases sobre 77.150 enunciados de audio argelino (31.661 pasos acumulados), empleando los corpus OddAdmix de Kahwa Podcast, Loubna Stories y Rawi Stories. La entrada es audio mono a 16 kHz procesado en ventanas de 30 segundos, el formato nativo de Whisper.

La relevancia actual del modelo reside en su especialización estrecha y en el reducido coste de despliegue: al ser un adaptador PEFT sobre un backbone congelado, el repositorio ocupa 0,3 GB y permite servir ASR de dariya sobre infraestructura modesta. La licencia MIT del adaptador facilita su integración comercial, aunque los pesos del backbone Whisper mantienen su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-medium encoder-decoder (transformer) + adaptador LoRA (r=64, alpha=128) |
| Parametros totales | 833,1 M (763,9 M backbone congelado + 69,2 M LoRA entrenables, 8,31 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio de 30 s, limite nativo de Whisper) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el backbone admite las cuantizaciones de Whisper en el runtime elegido) |
| Idiomas soportados | dariya argelina (`arq`); se recomienda forzar `language="arabic"` en la generacion |
| Licencia | MIT (adaptador) |
| Formato de pesos | safetensors (adaptador PEFT); backbone en safetensors desde el repositorio base |
| Entrada de audio | 16 kHz mono float32, chunks de 30 s, 80 mel bins x 3000 frames |
| Libreria | peft (compatible con transformers) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | openai/whisper-medium |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-medium: un transformer encoder-decoder con atención completa, preprocesado log-Mel de 80 canales y decodificación autorregresiva condicionada por tokens de idioma y tarea. Sobre el backbone congelado se aplica un adaptador LoRA de rango 64 y alpha 128, que inyecta 69,2 M de parámetros entrenables en las proyecciones del modelo. No se modifica la arquitectura base ni se introduce decodificación especulativa ni atención lineal.

El entrenamiento siguió un currículo de tres fases sobre 77.150 enunciados argelinos, con 31.661 pasos acumulados. Los datos provienen de tres colecciones OddAdmix: Kahwa Podcast (23.264 filas de entrenamiento), Loubna Stories (48.590 filas) y Rawi Stories (5.296 filas). No se documentan en la información disponible el volumen total de horas, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (poco habituales en ASR). Tampoco se detallan los hiperparámetros de entrenamiento más allá del currículo y el rango LoRA.

## Capacidades

- Transcripción de voz a texto en dariya argelina (`arq`) sobre audio de 16 kHz mono.
- Procesamiento de audio en ventanas de 30 segundos con `chunk_length_s=30`, lo que permite transcripciones de duración arbitraria mediante troceado.
- Generación de subtítulos y transcripción de contenido largo (podcasts, entrevistas, narraciones, vídeos de YouTube).
- Salida de texto en escritura árabe, con normalización de diacríticos, tatweel y variantes alif/ya documentada por el autor.
- Adaptación de dominio adicional: al ser un adaptador PEFT, sirve como punto de partida para especializaciones regionales o temáticas posteriores.
- No soporta síntesis de voz, generación de audio, traducción automática ni idiomas distintos de la dariya argelina.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo ASR).

## Casos de uso

- Transcripción de podcasts argelinos: el modelo se entrenó específicamente sobre el corpus Kahwa Podcast y transcribe episodios completos troceando el audio en ventanas de 30 s con `chunk_length_s=30`, lo que lo hace adecuado para productoras que necesitan texto buscable de su catálogo.
- Subtitulado de vídeo para creadores de contenido: la salida en escritura árabe normalizada permite generar ficheros SRT a partir de audio de YouTube o redes sociales, reduciendo el coste frente a servicios comerciales que cubren mal la dariya.
- Archivística y documentación oral: digitalización de entrevistas y testimonios en dariya (por ejemplo, corpus de historias como Loubna o Rawi) para su indexación y consulta posterior mediante búsqueda textual.
- Entrada de voz en aplicaciones locales: integración del adaptador en asistentes o apps argelinas que necesitan dictado en dariya, con un footprint de 0,3 GB que permite su despliegue en servidores modestos o incluso en estaciones de trabajo con GPU de gama media.
- Investigación lingüística y sociolingüística: generación de transcripciones masivas para análisis de léxico, variación dialectal o estudios de corpus, usando el modelo como anotador automático previo a revisión humana.
- Base para adaptación a dominios específicos: al ser un adaptador LoRA sobre Whisper-medium, equipos con datos propios (por ejemplo, llamadas de atención al cliente o terminología médica) pueden continuar el entrenamiento sin partir del backbone completo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Las cifras corresponden a una única ejecución, con semilla no registrada y decodificación no documentada; el propio autor indica que la reproducción independiente multi-semilla está pendiente.

| Sistema | Kahwa Podcast (WER) | Loubna Stories (WER) | Rawi Stories (WER) |
|---|---:|---:|---:|
| EL-ANKA (LoRA) | 0,68 % | 0,34 % | 0,95 % |
| EL-ANKA-Lite (LoRA) | 34,85 % | 14,87 % | 27,54 % |

Las métricas se calcularon tras aplicar el normalizador `normalize_darja_text` (eliminación de diacríticos árabes, tatweel, unificación de alif y ya, y eliminación de puntuación). Los recuentos de filas de los splits de test no están documentados por el proveedor de los datasets. No se han publicado resultados en benchmarks estándar de ASR (Common Voice, FLEURS, MLS) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade 69,2 M de parámetros sobre un backbone de 763,9 M. En fp16, el conjunto completo ronda los 1,7 GB de pesos; en fp32, unos 3,3 GB. Con cuantización int8 del backbone, el uso de pesos baja a aproximadamente 0,9-1 GB, más el espacio de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en inferencia por lotes pequeños; A100, H100 o L4 para despliegues con concurrencia y throughput alto.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de portátil con 6-8 GB.
- Opciones de despliegue: `transformers` + `peft` con el pipeline `automatic-speech-recognition`, o servidores compatibles con Whisper (por ejemplo, implementaciones basadas en Faster-Whisper o vLLM con soporte de audio, sujeto a la compatibilidad del adaptador). No se documenta soporte nativo en llama.cpp ni Ollama para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, el coste por segundo de audio es el de Whisper-medium con un adaptador LoRA de bajo rango, es decir, muy próximo al del backbone sin adaptar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | WER dariya argelina |
|---|---|---|---|---|---|
| EL-ANKA (este modelo) | 833,1 M (69,2 M entrenables) | Ventanas de 30 s | `arq` | MIT (adaptador) | 0,68 / 0,34 / 0,95 % (declarado, ejecución única) |
| EL-ANKA-Lite | no disponible | Ventanas de 30 s | `arq` | no disponible | 34,85 / 14,87 / 27,54 % (declarado) |
| openai/whisper-medium (base) | 763,9 M | Ventanas de 30 s | 99 idiomas, sin dariya específica | MIT (pesos originales) | no disponible para dariya en la información proporcionada |
| Whisper-large-v3 | 1.550 M | Ventanas de 30 s | 99 idiomas, sin dariya específica | MIT | no disponible para dariya en la información proporcionada |

La comparación con Whisper base y Whisper-large-v3 se ofrece como referencia de categoría (ASR multilingüe de código abierto); no se dispone de cifras de WER en dariya argelina para esos modelos en la información proporcionada, por lo que no puede cuantificarse la mejora relativa.

## Limitaciones y advertencias

- Los WER declarados (0,34-0,95 %) proceden de una única ejecución, con semilla no registrada, decodificación no documentada y recuentos de test no publicados. Son cifras excepcionalmente bajas para ASR en un dialecto y deben tratarse como no verificadas hasta su reproducción independiente.
- El modelo está entrenado exclusivamente para dariya argelina; su uso con árabe estándar, otros dialectos magrebíes o árabe oriental no está validado y probablemente degrade el rendimiento.
- Riesgo de alucinación en pasajes de audio con ruido, música o silencios largos, comportamiento conocido en la familia Whisper; se recomienda filtrado de VAD y revisión humana en producción.
- Sesgos derivados del corpus: los tres datasets de entrenamiento son podcasts, narraciones y contenido oral, por lo que la cobertura de habla espontánea, acentos rurales o vocabulario técnico puede ser limitada.
- Problema de compatibilidad documentado: en `transformers 4.57.6`, `WhisperProcessor.from_pretrained` y, por tanto, `pipeline(...)` fallan con `AttributeError: 'list' object has no attribute 'keys'` porque `tokenizer_config.json` almacena `extra_special_tokens` como lista en lugar de mapping. El extractor de características y los pesos del adaptador no se ven afectados.
- Licencia: el adaptador es MIT, pero los pesos del backbone Whisper-medium conservan la licencia de OpenAI; conviene revisar los términos del modelo base antes de un uso comercial.
- No apto para síntesis de voz, generación de audio, traducción automática ni reconocimiento de idiomas fuera del ámbito argelino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/algerian-nlp/Hadra-ASR-whisper-medium
- Modelo base: https://huggingface.co/openai/whisper-medium
- Variante ligera: https://huggingface.co/algerian-nlp/EL-ANKA-Lite
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Dataset Kahwa Podcast: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-kahwa-postcast
- Dataset Loubna Stories: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-loubna-stories
- Dataset Rawi Stories: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-rawi
- Libreria PEFT: https://github.com/huggingface/peft
