# palli23/whisper-large-spjallromur-v2

## Resumen
whisper-large-spjallromur-v2 es un modelo de reconocimiento automático del habla (ASR) especializado en islandés conversacional, desarrollado por el usuario palli23. Se trata de un ajuste fino (fine-tuning) del modelo language-and-voice-lab/whisper-large-icelandic-62640-steps-967h, que a su vez parte de la arquitectura Whisper large de OpenAI y fue preentrenado con aproximadamente 967 horas de audio islandés, incluyendo el corpus Samrómur Milljón. El ajuste se ha realizado sobre el corpus palli23/spjallromur-v2, un conjunto de habla conversacional islandesa de dos canales creado para el artículo científico "Spjallrómur: A Dual-Channel Corpus of Conversational Icelandic with Mixing Pipeline and ASR Baselines".

El modelo aborda un problema concreto: la transcripción de habla espontánea y conversacional en islandés, un dominio tradicionalmente menos cubierto que el habla leída o de laboratorio. Con 1.543.304.960 parámetros (aproximadamente 1,54 mil millones), mantiene la arquitectura encoder-decoder transformer propia de Whisper large y se distribuye en formato safetensors con un tamaño de repositorio de 12,3 GB.

Su relevancia radica en que el islandés es un idioma de bajos recursos, y este modelo aporta una variante ajustada específicamente a diálogo real, con métricas publicadas sobre un conjunto de test de 3.450 enunciados. La licencia cc-by-sa-4.0 permite uso y adaptación con atribución y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large (encoder-decoder transformer) |
| Parametros totales | 1.543.304.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | islandés (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura Whisper large, un transformer encoder-decoder diseñado para transcripción de audio a texto, con entrada de audio segmentada en ventanas de hasta 30 segundos. El ajuste fino se realizó durante 8 épocas en precisión fp16 sobre el corpus palli23/spjallromur-v2, un conjunto de habla conversacional islandesa de dos canales.

El procedimiento de entrenamiento empaquetó el split de entrenamiento en segmentos de menos de 30 segundos, con 0,3 segundos de silencio entre enunciados, mientras que los splits de desarrollo y test se evaluaron enunciado a enunciado sin empaquetado. Las etiquetas de anotación (marcas del tipo `<...>` y `[...]`) se eliminaron antes de usarlas como objetivos de entrenamiento. No se documentan en la información disponible detalles sobre el número total de tokens de audio, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades
- Reconocimiento automático del habla en islandés, con especial énfasis en habla conversacional y espontánea.
- Transcripción de audio a texto con segmentación en ventanas de hasta 30 segundos.
- Generación controlada de repeticiones mediante parámetros de decodificación (`repetition_penalty=1.2`, `no_repeat_ngram_size=3`, `max_new_tokens=225`) según la configuración de evaluación del autor.
- Manejo de etiquetas de anotación en el corpus de entrenamiento, que se eliminan antes de la transcripción.
- No se documentan capacidades de tool calling, agentes, visión, audio adicional ni modo de razonamiento explícito.

## Casos de uso
- Transcripción de conversaciones telefónicas o de atención al cliente en islandés: el modelo está ajustado sobre habla conversacional de dos canales, por lo que es adecuado para diarización y transcripción de diálogos reales.
- Generación de subtítulos para contenido audiovisual islandés: permite transcribir audio de hasta 30 segundos por ventana, útil para subtitulado automático de vídeos y podcasts.
- Análisis de entrevistas y reuniones: su entrenamiento en habla espontánea lo hace apropiado para transcribir entrevistas de investigación o reuniones de trabajo en islandés.
- Investigación lingüística y corpus orales: sirve como base para estudios de habla conversacional y para la anotación automática de corpus de islandés.
- Accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva en contenido en islandés.
- Prototipado de asistentes de voz en islandés: puede integrarse como componente ASR en pipelines de voz a texto para aplicaciones de dominio limitado.

## Benchmarks y rendimiento
Resultados publicados por el autor sobre el split de test de palli23/spjallromur-v2 (3.450 enunciados, evaluados individualmente, texto en minúsculas y sin puntuación antes de puntuar; desviación estándar por bootstrap con n=1000 remuestreos, semilla 42):

| Split | n | WER | CER |
|---|---|---|---|
| spjallromur-v2 test | 3.450 | 31,62% ± 0,53 | 19,23% ± 0,41 |

El autor indica además que se escanearon las predicciones en busca de tokens entre corchetes (por ejemplo `<unk>`) como control de contaminación: 1 de cada 3.450 enunciados contenía uno, correspondiente a tokens de control de generación de Whisper (`<|pl|>`, `<|notimestamps|>`) que se filtraron al texto decodificado una vez, no a un artefacto de transcripción.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 1,54 mil millones de parámetros, la inferencia en fp16 requiere aproximadamente 3 GB de pesos, más memoria para activaciones y audio.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, así como en A100 o H100 para despliegues de mayor volumen.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 6 GB o más de VRAM en fp16.
- Opciones de despliegue: no disponible en la información proporcionada; al ser un modelo Whisper, es compatible con los ecosistemas habituales de la familia (transformers, whisper.cpp, etc.), aunque el autor no lo documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparativos en la información proporcionada. Como referencia de categoría, el modelo parte de language-and-voice-lab/whisper-large-icelandic-62640-steps-967h (preentrenado con ~967 h de islandés), del cual este es un ajuste fino sobre habla conversacional; sin embargo, no se han publicado métricas comparativas entre ambos en la información disponible.

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/whisper-large-spjallromur-v2 | 1.543.304.960 | ventanas de 30 s | islandés | cc-by-sa-4.0 | Hugging Face |
| language-and-voice-lab/whisper-large-icelandic-62640-steps-967h | no disponible | ventanas de 30 s | islandés | no disponible | Hugging Face |
| Whisper large (OpenAI, base) | no disponible | ventanas de 30 s | multilingüe | no disponible | Hugging Face / OpenAI |

## Limitaciones y advertencias
- El modelo está especializado exclusivamente en islandés; no se documenta soporte para otros idiomas.
- El WER en el conjunto de test es del 31,62%, lo que indica un margen de error considerable en habla conversacional; no es adecuado para transcripción de alta precisión sin revisión humana.
- Riesgo de alucinación y de generación de repeticiones; el autor aplica parámetros de control de repetición en la evaluación, lo que sugiere que sin ellos el modelo puede repetir texto.
- Se detectaron tokens de control de Whisper filtrándose en el texto decodificado en 1 de cada 3.450 enunciados, un caveat menor para producción.
- La licencia cc-by-sa-4.0 exige atribución y compartir igual; puede condicionar el uso comercial y la distribución de derivados.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus conversacional islandés puede reflejar sesgos demográficos y lingüísticos de ese corpus.
- No se dispone de información sobre cuantizaciones ni sobre latencia en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/palli23/whisper-large-spjallromur-v2
- Modelo base: https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h
- Dataset de ajuste: https://huggingface.co/datasets/palli23/spjallromur-v2
- Almannarómur: https://almannaromur.is
- Glóð: https://glod.ai
