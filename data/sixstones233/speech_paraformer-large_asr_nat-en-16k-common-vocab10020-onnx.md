# SixStones233/speech_paraformer-large_asr_nat-en-16k-common-vocab10020-onnx

## Resumen

`speech_paraformer-large_asr_nat-en-16k-common-vocab10020-onnx` es un espejo en Hugging Face del modelo Paraformer-large para reconocimiento automático del habla (ASR) en inglés, publicado originalmente en ModelScope por el grupo `iic` (Institute for Intelligent Computing de Alibaba). El repositorio, alojado por el usuario `SixStones233`, replica de forma literal los ficheros del modelo original en formato ONNX, con un tamaño total de repositorio de 0,2 GB. No se trata de un modelo de lenguaje generativo, sino de un sistema ASR no autorregresivo (non-autoregressive) diseñado para transcribir audio de 16 kHz a texto.

El interés de esta ficha radica en que ofrece una vía de despliegue del ASR Paraformer sin depender de ModelScope ni de frameworks propietarios, usando ONNX Runtime, lo que facilita su integración en pipelines de producción en entornos con requisitos de portabilidad. El modelo emplea un vocabulario de 10 020 tokens y está entrenado específicamente para inglés (`en`). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las de dicha licencia.

No se dispone de información sobre arquitectura detallada, número de parámetros, datos de entrenamiento ni benchmarks en la información proporcionada; esta ficha documenta lo que es verificable y marca explícitamente como «no disponible» el resto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paraformer (ASR no autorregresivo), exportado a ONNX; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual; ventana de audio no especificada) |
| Tipos de cuantizacion | no disponible (los ficheros distribuidos son ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (`en`, segun el nombre del modelo); lista oficial no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Frecuencia de muestreo de audio | 16 kHz |
| Vocabulario | 10 020 tokens |
| Tamano del repositorio | 0,2 GB |
| Autor original | iic (ModelScope) |
| Espejo en Hugging Face | SixStones233 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Paraformer, un esquema de ASR no autorregresivo que predice la secuencia de tokens de forma paralela en lugar de token a token, lo que reduce la latencia de decodificación frente a arquitecturas autorregresivas tipo Transformer encoder-decoder convencional. El nombre del repositorio indica que se trata de la variante `large`, entrenada para inglés a 16 kHz con un vocabulario de 10 020 unidades. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, mecanismo de atención, predictor de duración ni composición del corpus de entrenamiento.

El repositorio de Hugging Face es un espejo byte a byte del modelo publicado en ModelScope: el autor declara que los ficheros tienen el mismo tamaño y SHA-256 que el original y que no se ha modificado nada. Por tanto, las características de entrenamiento (posible uso de datos sintéticos, técnicas de alineación, regularización, etc.) deben consultarse en la model card original de ModelScope, que no se ha incluido en la información disponible. La exportación a ONNX implica que el grafo está congelado para inferencia y que no se distribuyen pesos en formato entrenable (safetensors o PyTorch).

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio de 16 kHz.
- Transcripción no autorregresiva, con decodificación paralela de la secuencia de tokens.
- Vocabulario cerrado de 10 020 tokens, adecuado para inglés general.
- Ejecución mediante ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencia de PyTorch.
- No se documentan capacidades de puntuación, diarización, detección de idioma, traducción, tool calling ni razonamiento multi-paso; es un modelo puramente ASR.
- No se documentan modos de «pensamiento», visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés: el modelo convierte audio de 16 kHz en texto plano, adecuado para generar actas o resúmenes posteriores con un LLM.
- Subtitulado automático de vídeo en inglés: al ser un modelo ASR ligero (repositorio de 0,2 GB) y ejecutable en ONNX Runtime, puede integrarse en pipelines de procesamiento por lotes de vídeos.
- Búsqueda sobre archivos de audio: transcripción previa de grabaciones para indexar y permitir búsqueda textual en un corpus de llamadas o podcasts en inglés.
- Atención al cliente con análisis de llamadas: transcripción de conversaciones telefónicas en inglés para su clasificación, análisis de sentimiento o control de calidad.
- Accesibilidad: generación de subtítulos en tiempo casi real para contenido audiovisual en inglés en aplicaciones de escritorio o web.
- Preprocesamiento para pipelines de voz a texto en entornos embebidos o sin GPU: la exportación ONNX permite ejecutar la inferencia en CPU con ONNX Runtime, útil en servidores sin acelerador dedicado.
- Evaluación de calidad de audio o verificación de transcripciones en herramientas internas de investigación, dado que el modelo es un espejo fiel del original y puede compararse contra él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que el modelo es muy ligero y probablemente quepa en GPU consumer con pocos GB de VRAM, pero no se confirma en la información.
- GPU recomendadas: no disponibles. Al ser un modelo ONNX de 0,2 GB, es plausible su ejecución en GPUs de gama baja o incluso en CPU, pero no se aportan datos de latencia ni throughput.
- Compatibilidad con GPU consumer: probable por tamaño, sin datos oficiales que lo confirmen.
- Opciones de despliegue: ONNX Runtime (CPU y GPU); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Paraformer-large ASR en, ONNX) | ASR no autorregresivo | Inglés | ONNX | Apache 2.0 | Hugging Face (espejo) y ModelScope |
| Whisper (OpenAI) | ASR encoder-decoder | Multilingüe | PyTorch, ONNX, GGML | MIT | Hugging Face, OpenAI |
| Wav2Vec 2.0 (Meta) | ASR auto-supervisado | Multilingüe (fine-tunes) | PyTorch | MIT / Apache 2.0 según variante | Hugging Face |
| Paraformer original (iic, ModelScope) | ASR no autorregresivo | Inglés | PyTorch / ONNX | Apache 2.0 | ModelScope |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo especializado únicamente en ASR en inglés; no es un modelo de lenguaje y no genera respuestas, razona ni ejecuta tool calling.
- No se documentan sesgos conocidos, pero al ser un ASR entrenado con un corpus no especificado, puede presentar sesgos de acento, género o dominio.
- Riesgo de errores de transcripción (sustituciones, omisiones) ante ruido, acentos no vistos o audio que no sea de 16 kHz; no se aportan métricas de WER.
- El repositorio es un espejo no oficial: la autoría y el mantenimiento corresponden a iic/ModelScope; posibles actualizaciones o correcciones no se reflejarán automáticamente.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- No se documentan limitaciones de longitud de audio ni de contexto; conviene validar el comportamiento con audios largos antes de usarlo en producción.
- Al estar exportado a ONNX, no es posible un ajuste fino directo sobre estos ficheros sin volver al modelo original en PyTorch.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SixStones233/speech_paraformer-large_asr_nat-en-16k-common-vocab10020-onnx
- Modelo original en ModelScope: https://www.modelscope.cn/models/iic/speech_paraformer-large_asr_nat-en-16k-common-vocab10020-onnx
