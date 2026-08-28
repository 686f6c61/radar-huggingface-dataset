# dianavdavidson/indicwav2vec-hindi-indic_voices-61984-normalized-30_70-1e-4-steps-12000-FT

## Resumen

Este modelo es un fine-tuning de `ai4bharat/indicwav2vec-hindi`, un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura Wav2Vec2, adaptado específicamente para el idioma hindi. El autor, `dianavdavidson`, ha entrenado el modelo sobre el dataset IndicVoices (con 61 984 muestras) durante 12 000 pasos, con una tasa de aprendizaje de 1e-4 y normalización de audio. El resultado es un transcriptor de voz a texto en hindi que alcanza una pérdida de validación de 0,4530 y un WER global de 28,65 sobre el conjunto de evaluación.

La relevancia de este modelo radica en que parte de un checkpoint preentrenado multilingüe (IndicWav2Vec, entrenado en 40 lenguas indias) y lo especializa en hindi, lo que permite obtener un ASR funcional con un coste de entrenamiento reducido. Con 315,5 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, y su licencia Apache 2.0 facilita su uso tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer encoder con capas convolucionales) |
| Parametros totales | 315 512 520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | hindi (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2, que combina un extractor de características convolucional con un transformer encoder. El checkpoint base, `ai4bharat/indicwav2vec-hindi`, fue preentrenado de forma autosupervisada sobre 40 lenguas indias mediante el framework fairseq y posteriormente portado a Hugging Face Transformers. Este fine-tuning añade una cabeza de clasificación CTC (Connectionist Temporal Classification) para la tarea de transcripción.

El entrenamiento se realizó con el dataset IndicVoices, con 61 984 muestras de audio normalizado. Se usó un optimizador AdamW con betas (0,9, 0,999), una tasa de aprendizaje constante con warmup de 500 pasos, tamaño de lote efectivo de 8 (4 por dispositivo con acumulación de gradiente de 2) y precisión mixta nativa (AMP). El proceso duró 12 000 pasos, equivalentes a aproximadamente 6,94 épocas, y se evaluó periódicamente la pérdida y el WER global sobre un conjunto de validación.

## Capacidades

- Transcripción de voz a texto en hindi a partir de audio en bruto (formato de onda).
- Reconocimiento de habla continua con manejo de ruido moderado gracias al preentrenamiento multilingüe.
- Soporte para inferencia en tiempo real o por lotes mediante la API de Transformers.
- Compatible con pipelines de Hugging Face para ASR (`automatic-speech-recognition`).
- Capacidad de adaptación a dominios específicos mediante fine-tuning adicional sobre datos propios.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni visión; es un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en hindi: el modelo puede convertir grabaciones de audio en texto con una ventana de contexto amplia (el audio se procesa en segmentos), facilitando la generación de actas o subtítulos.
- Subtitulado automático de vídeos en hindi: integrable en pipelines de postproducción para generar subtítulos sincronizados, reduciendo el coste de transcripción manual.
- Asistentes de voz para aplicaciones móviles: al ser un modelo compacto (315 M parámetros), puede desplegarse en servidores modestos o en dispositivos con aceleración por CPU para comandos de voz en hindi.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas para su posterior análisis de sentimiento o extracción de información, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Creación de corpus de entrenamiento para otros modelos NLP: el ASR puede generar texto transcrito a partir de audio, alimentando bases de datos para entrenar modelos de lenguaje en hindi.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos de radio, televisión o podcasts en hindi para hacerlos indexables y buscables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. La model card reporta únicamente los resultados de evaluación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 0,4530 |
| WER global | 28,65 % |

Estos valores corresponden al conjunto de evaluación utilizado por el autor, que no está especificado. No se dispone de comparaciones con otros modelos ASR para hindi (como Whisper, Google Speech-to-Text o el propio modelo base) en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 315 M parámetros, en FP32 se necesitan aproximadamente 1,3 GB de memoria; en FP16, unos 0,7 GB. Esto permite ejecutar el modelo en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100 o H100 para procesamiento por lotes.
- En CPU: es viable para inferencia en tiempo real con audio corto, aunque la latencia será mayor; se recomienda usar cuantización o compilación con ONNX para mejorar el rendimiento.
- Opciones de despliegue: compatible con Hugging Face Transformers, pipelines de ASR, y puede servirse mediante TGI (Text Generation Inference) o vLLM si se adapta, aunque estos frameworks están más orientados a LLMs. Para ASR, se puede usar el pipeline de Transformers o exportar a ONNX para inferencia en producción.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna (RTX 3090), se estima una latencia de procesamiento de audio en tiempo real (factor de velocidad > 1) para segmentos de hasta 30 segundos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos ASR para hindi en la información proporcionada. El modelo base `ai4bharat/indicwav2vec-hindi` es el punto de referencia natural, pero no se han publicado sus métricas exactas en esta ficha. Alternativas como Whisper (openai/whisper-small, 244 M parámetros) o modelos específicos de Indic ASR podrían ser comparables, pero no hay datos objetivos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El WER global de 28,65 % indica que aproximadamente una de cada cuatro palabras se transcribe incorrectamente, lo que puede ser insuficiente para aplicaciones que requieran alta precisión (p. ej., transcripción médica o legal).
- El modelo se ha fine-tuneado sobre un dataset concreto (IndicVoices) y puede presentar sesgos hacia los acentos, dialectos o condiciones de grabación de ese corpus.
- No se especifica el idioma exacto de entrenamiento más allá del hindi; puede fallar con variantes regionales o con mezclas de hindi e inglés (hinglish).
- La model card no detalla el conjunto de evaluación ni las condiciones de grabación, por lo que la generalización a otros dominios es incierta.
- No se han documentado limitaciones de contexto de audio; el modelo procesa segmentos de audio de longitud variable, pero la duración máxima práctica depende de la memoria disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (IndicWav2Vec) tiene su propia licencia; se recomienda verificar los términos del modelo base antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/indicwav2vec-hindi-indic_voices-61984-normalized-30_70-1e-4-steps-12000-FT
- Modelo base: https://huggingface.co/ai4bharat/indicwav2vec-hindi
- Repositorio IndicWav2Vec: https://github.com/AI4Bharat/IndicWav2Vec
- Plataforma Indic LM: https://www.indiclanguagemodels.com/models/indicwav2vec
