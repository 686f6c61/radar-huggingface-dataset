# GetmanY1/wav2vec2-base-fi-conf015-filter

## Resumen

wav2vec2-base-fi-conf015-filter es un checkpoint de wav2vec 2.0 Base preentrenado de forma auto-supervisada sobre audio de archivo de television y radio en finlandes. Lo desarrolla Yaroslav Getman junto con Tommi Lehtonen, Tamás Grósz y Mikko Kurimo (grupo de investigación en habla de la Universidad Aalto), y forma parte de la ablación de filtrado por confianza ASR descrita en el articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". El modelo no es un sistema ASR listo para usar: es un extractor de representaciones acusticas sin tokenizer ni cabeza CTC que debe afinarse sobre habla transcrita.

La arquitectura es un transformer wav2vec 2.0 Base de 12 capas con dimension de modelo 768 y dimension de feed-forward 3072, lo que suma 95.044.608 parametros. Se entreno durante 125K actualizaciones con tasa de aprendizaje 6e-4 sobre 512 GPUs, consumiendo aproximadamente 3 minutos de audio por GPU. El contexto de entrada es audio mono a 16 kHz; no aplica una ventana de tokens de texto al uso.

Su relevancia es metodologica: cuantifica el efecto de un umbral concreto de filtrado por confianza ASR (τ = −0.15) sobre los datos de preentrenamiento, reteniendo 588K horas de las 890K horas deduplicadas (66%). El autor recomienda explicitamente usar los modelos principales del paper para produccion y reservar este checkpoint para comparaciones dentro de la ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, 768 / 3072) |
| Parametros totales | 95.044.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio mono a 16 kHz; sin ventana de texto definida) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; el autor no documenta cuantizaciones) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y fairseq/checkpoint.pt (fairseq original) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 Base: un codificador convolucional que transforma la forma de onda en representaciones latentes, seguido de un transformer de 12 capas con dimension 768 y feed-forward 3072. El preentrenamiento es auto-supervisado con el objetivo de enmascaramiento contrastivo propio de wav2vec 2.0, sin cabeza CTC ni tokenizer en este checkpoint.

Los datos de preentrenamiento combinan audio del Archivo de Radio y Television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI) con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Todo el material paso por deteccion de actividad de voz y deduplicacion basada en transcripciones; despues se aplico un filtrado por confianza ASR con umbral τ = −0.15, que retuvo 588K horas de las 890K horas deduplicadas (66%). El entrenamiento consistio en 125K actualizaciones con tasa de aprendizaje 6e-4, a razon de unos 3 minutos de audio por GPU en 512 GPUs. La entrada es audio mono a 16 kHz con `do_normalize=False`. El codigo y las configuraciones estan en el repositorio aalto-speech/large-scale-monolingual-speech-foundation-models.

## Capacidades

- Extraccion de representaciones acusticas auto-supervisadas para audio en finlandes.
- Base para fine-tuning en reconocimiento automatico del habla (ASR) tras anadir cabeza CTC y datos transcritos.
- Aprendizaje de representaciones robusto a ruido de emision: el corpus de origen es audio de television y radio.
- No incluye generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al finlandes; no se documenta transferencia a otras lenguas.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Fine-tuning para ASR en finlandes: se anade una cabeza CTC y se entrena sobre habla transcrita (por ejemplo, Common Voice fi, VoxPopuli fi o Lahjoita puhetta) para obtener un sistema de transcripcion; el preentrenamiento sobre 588K horas de broadcast reduce la necesidad de datos etiquetados.
- Reproduccion de la ablacion de filtrado: sirve como punto de comparacion frente a los demas umbrales de confianza ASR del paper, permitiendo medir el impacto del filtrado en el WER tras fine-tuning.
- Segmentacion y diarizacion asistida: las representaciones latentes sirven como features para clasificadores de hablante o de actividad de voz en pipelines de audio broadcast.
- Investigacion en modelos fundacionales de habla: permite estudiar como el volumen y la calidad del corpus (890K frente a 588K horas) afectan a las representaciones, con un checkpoint de referencia de 95M parametros.
- Clasificacion de audio y deteccion de eventos acusticos en finlandes: reutilizando el encoder con una cabeza ligera para tareas como deteccion de emociones o de habla espontanea frente a leida.
- Prototipado academico con recursos limitados: al tener 95M parametros, cabe en una sola GPU de consumo para fine-tuning y experimentacion, lo que facilita la ensenanza y la validacion de hipotesis antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, MMLU ni otras metricas para este checkpoint; solo referencia la Figura 1 del paper, cuyos valores no se reproducen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB para los pesos (95M parametros), mas activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- Fine-tuning: con batch pequeno y audio de pocos segundos, es viable en GPUs de consumo de 8-12 GB (RTX 3060, RTX 4070); con batches mayores se recomienda A100 o H100.
- Cabe en GPU de consumo: si, en cualquier tarjeta moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (Wav2Vec2Model), fairseq (checkpoint original), y exportacion a ONNX; no se documenta soporte especifico en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf015-filter | 95M | no aplica (audio 16 kHz) | fi | Apache 2.0 | Hugging Face |
| Modelos principales del paper (coleccion GetmanY1/wav2vec2-fi-471k) | no disponible en la informacion | no aplica | fi | no disponible | Hugging Face |
| wav2vec 2.0 Base original (facebook) | 95M | no aplica | multilingue/ingles | MIT (no confirmado en esta informacion) | Hugging Face |

La comparacion cuantitativa de rendimiento con los modelos principales del paper o con wav2vec 2.0 Base original no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR listo para usar: carece de tokenizer y de cabeza CTC; requiere fine-tuning sobre habla transcrita.
- El autor recomienda usar los modelos principales del paper para uso general; este checkpoint existe para comparacion dentro de la ablacion.
- El filtrado por confianza ASR con τ = −0.15 descarta el 34% de las horas deduplicadas, lo que puede introducir sesgos hacia el tipo de habla que el ASR de filtrado transcribe con mayor confianza (posiblemente habla mas limpia o estandar).
- El corpus de origen es audio de television y radio finlandesas: puede haber sesgo hacia registros formales, voces de locutores profesionales y condiciones acusticas de estudio.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero las representaciones pueden degradarse en dominios alejados del broadcast (conversacion telefonica, audio muy ruidoso, acentos no representados).
- Limitacion idiomatica: solo finlandes; no se documenta rendimiento en otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar las condiciones de los corpus de origen (KUVI, VoxPopuli, Parlamento finlandes, Lahjoita puhetta) para usos derivados.
- Para produccion, validar el WER tras fine-tuning en el dominio objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf015-filter
- Coleccion de modelos principales del paper: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
