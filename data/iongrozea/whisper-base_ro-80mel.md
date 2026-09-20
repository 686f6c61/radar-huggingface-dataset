# IonGrozea/whisper-base_ro-80mel

## Resumen

whisper-base_ro-80mel es un ajuste fino (fine-tune) del modelo `openai/whisper-base` para reconocimiento automático del habla (ASR) en rumano. Lo publica el usuario IonGrozea en HuggingFace y parte del checkpoint base de OpenAI, un transformer encoder-decoder de 72.593.920 parámetros (aproximadamente 74 M) especializado en transcripción de audio con ventanas de 30 segundos y espectrogramas log-Mel de 80 bandas. El modelo resuelve el problema clásico de ASR en un idioma con menos recursos que el inglés: adaptar un modelo multilingüe genérico a las particularidades fonéticas, léxicas y de puntuación del rumano.

La relevancia práctica del modelo está en su tamaño reducido: con menos de 75 M de parámetros se puede ejecutar en CPU y en GPU de consumo con un consumo de VRAM inferior a 1 GB en fp16, lo que lo hace apto para despliegues en edge, transcripción de grandes volúmenes de audio o prototipado rápido sin infraestructura dedicada. El autor declara un WER de 0,1512 (normalizado) y un CER de 0,0524 sobre un corpus rumano combinado propio, evaluado con beam search de 5 sobre 2000 muestras de validación.

La ficha del modelo se generó automáticamente al subir un checkpoint sin README, por lo que la configuración completa de entrenamiento (composición exacta del dataset, número de pasos, hiperparámetros, si hubo aumentación de datos) no está documentada públicamente. El repo ocupa 4,9 GB, muy por encima de los ~290 MB de pesos en fp32, lo que sugiere que contiene checkpoints intermedios además del modelo final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con entradas de espectrograma log-Mel de 80 bandas |
| Parametros totales | 72.593.920 (pesos reales en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos por pasada (formato nativo de Whisper); la transcripción de audios más largos requiere segmentación externa |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales en el repo; el modelo es convertible a int8/int16 mediante CTranslate2 (faster-whisper) y a GGUF (whisper.cpp) |
| Idiomas soportados | rumano (ro), único idioma documentado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y checkpoints de PyTorch (tags: pytorch, safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un encoder Transformer que consume la representación log-Mel del audio (80 bandas, ventana de 30 s, muestreo esperado de 16 kHz) y un decoder autorregresivo que genera tokens de texto condicionados por tokens especiales de idioma y tarea (`language="romanian"`, `task="transcribe"`). El checkpoint base tiene 6 capas en encoder y 6 en decoder, con dimensión de modelo 512 y 8 cabezas de atención; el fine-tune no altera la topología, solo los pesos. El sufijo "80mel" del nombre hace referencia al uso de características de 80 bandas Mel, el formato estándar de Whisper base y small (frente a las 128 bandas de large-v3).

El entrenamiento consiste en un fine-tune supervisado sobre un corpus rumano combinado ("Romanian merged corpus", de tipo custom y sin detalle público de composición ni horas de audio) partiendo de `openai/whisper-base`. No hay información publicada sobre uso de RLHF, DPO, decodificación especulativa ni técnicas de atención lineal. La evaluación declarada se hizo con beam search de 5 y se reportan métricas normalizadas (texto en minúsculas y sin puntuación, comparable con los papers de Whisper) y métricas en crudo.

## Capacidades

- Transcripción de voz a texto en rumano a partir de audio de hasta 30 segundos por inferencia.
- Procesamiento de audio en formato log-Mel de 80 bandas, con `WhisperProcessor` para el preprocesado (remuestreo a 16 kHz y extracción de características).
- Decodificación con beam search (el autor reporta resultados con `num_beams=5`), lo que mejora la precisión frente a la decodificación greedy a costa de mayor latencia.
- Selección explícita de idioma y tarea mediante tokens de control (`language="romanian"`, `task="transcribe"`).
- Integración directa con la librería `transformers` (`WhisperForConditionalGeneration`), lo que facilita el uso en pipelines de HuggingFace.
- No hay evidencia publicada de soporte de tool calling, function calling, capacidades de agente, multi-step reasoning, visión, audio generation ni traducción (task="translate") en este fine-tune.
- Al derivar de Whisper base multilingüe, es plausible que conserve parte de las capacidades del modelo original, pero el autor no documenta ningún idioma distinto del rumano.

## Casos de uso

- Transcripción de reuniones y notas de voz en rumano: el modelo convierte audio de hasta 30 segundos por segmento en texto; con una capa de segmentación (por ejemplo, VAD o chunking fijo) se pueden procesar reuniones completas y generar actas automáticas sin depender de servicios en la nube.
- Subtitulado de contenido audiovisual en rumano: integrado en un pipeline de segmentación de audio, permite generar pistas de subtítulos para vídeo, pódcast o material educativo; conviene validar el comportamiento con marcas de tiempo, ya que el autor no documenta el uso de `return_timestamps`.
- Analítica de contact center en Rumanía: transcripción masiva de llamadas para posterior análisis de sentimiento, detección de motivos de contacto o control de calidad; el tamaño reducido del modelo permite escalar horizontalmente con GPUs de gama media o incluso CPU.
- Indexación y búsqueda de archivos sonoros: transcripción de archivos de radio, pódcast o fondos documentales en rumano para construir un índice de texto buscable; el modelo cabe en memoria de sobra y se puede ejecutar en lote con coste bajo.
- Dictado y asistentes de voz en aplicaciones rumanas: al ocupar menos de 1 GB de VRAM en fp16, se puede incrustar en aplicaciones de escritorio o en servidores modestos para dictado en tiempo (casi) real con cuantización int8.
- Preprocesado para pipelines de NLP en rumano: la transcripción alimenta tareas posteriores como resumen, clasificación de documentos, traducción automática o extracción de entidades en un idioma con menos herramientas específicas.
- Anotación semi-automática de corpus de voz: generar transcripciones iniciales que después revisa un anotador humano, reduciendo drásticamente el coste de crear datasets en rumano; el CER de 0,0524 declarado sugiere un número bajo de correcciones por palabra.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el `model-index` de la model card (métricas no verificadas de forma independiente, `verified: false`):

| Metrica | Valor normalizado | Valor en crudo | Conjunto de evaluacion | Condiciones |
|---|---|---|---|---|
| WER | 0,1512 | 0,1555 | Romanian merged corpus (custom) | 2000 muestras de validación, beam=5 |
| CER | 0,0524 | 0,0536 | Romanian merged corpus (custom) | 2000 muestras de validación, beam=5 |

No se han publicado resultados de benchmarks en la informacion disponible para conjuntos estándar (Common Voice, Fleurs, MLS, VoxPopuli) ni comparaciones con otros modelos de ASR en rumano.

## Requisitos de hardware

- Peso de los pesos: ~290 MB en fp32, ~145 MB en fp16/bf16, ~75-90 MB en int8. Son estimaciones calculadas a partir de los 72,6 M de parámetros.
- VRAM estimada para inferencia: menos de 1 GB en fp16 incluyendo activaciones para una ventana de 30 s; en torno a 1,5-2 GB si se usa fp32 con beam search de 5.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3050/3060, RTX 4090, e incluso en GPU integradas con memoria compartida. También es viable en CPU, con latencia mayor.
- GPU recomendadas para producción en lote: cualquier GPU con tensor cores a partir de la generación Turing (T4, L4, A10, A100, H100) siempre que el throughput agregado lo justifique; el modelo es lo bastante pequeño como para que el cuello de botella sea el preprocesado de audio y no el cómputo del transformer.
- Opciones de despliegue: `transformers` (referencia y más flexible), `faster-whisper`/CTranslate2 para int8 con buena relación velocidad-precisión, `whisper.cpp` para GGUF en CPU y edge, servidores compatibles con Whisper en vLLM, y contenedores con WhisperX si se necesita alineación temporal.
- Latencia y throughput: no disponibles en la documentación del modelo. Como referencia orientativa, un modelo Whisper base suele transcribir muy por encima de tiempo real en GPU moderna, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Metricas en rumano |
|---|---|---|---|---|---|
| IonGrozea/whisper-base_ro-80mel | 72,6 M | 30 s | ro | Apache 2.0 | WER 0,1512 / CER 0,0524 (corpus propio, no verificado) |
| openai/whisper-base | ~74 M | 30 s | multilingüe (99 idiomas) | Apache 2.0 | no disponible |
| openai/whisper-small | ~244 M | 30 s | multilingüe (99 idiomas) | Apache 2.0 | no disponible |
| openai/whisper-large-v3 | ~1550 M | 30 s | multilingüe | Apache 2.0 | no disponible |

Los recuentos de parámetros de los modelos originales de OpenAI proceden de su documentación pública; el resto de comparativas en rumano no se han publicado en la información disponible. Este fine-tune sacrifica cobertura multilingüe a cambio de especialización en un único idioma y mantiene un coste computacional muy bajo.

## Limitaciones y advertencias

- Cobertura de idioma restringida: solo se documenta rumano. El fine-tune puede haber degradado el rendimiento en otros idiomas respecto al modelo base multilingüe.
- Métricas no verificadas: los valores de WER y CER proceden del propio autor (`verified: false`) y se calcularon sobre un corpus privado ("Romanian merged corpus") cuya composición, dominio y horas de audio no se detallan; no son directamente comparables con resultados publicados sobre Common Voice u otros conjuntos estándar.
- Riesgo de sobreajuste al dominio: un corpus combinado sin documentar puede no representar audio telefónico, ruidoso, con acentos regionales o con solapamiento de hablantes, donde el WER real será previsiblemente superior al 15 % declarado.
- Alucinaciones: como cualquier modelo de la familia Whisper, puede generar texto plausible en tramos de silencio, música o ruido, e incluso repetir frases en bucle; es recomendable aplicar detección de voz (VAD) y filtros de repetición en producción.
- Límite de 30 segundos por inferencia: audios más largos requieren segmentación externa, lo que introduce riesgo de cortes en mitad de palabra y de pérdida de contexto entre segmentos.
- Ficha incompleta: la model card se autogeneró desde un checkpoint sin README; no hay información sobre dataset, hiperparámetros, semillas ni proceso de evaluación reproducible, lo que dificulta auditar el modelo.
- Sin datos de robustez: no hay evaluaciones publicadas sobre ruido, reverberación, códigos de audio comprimidos (teléfono, VoIP) ni sobre sesgo de género, edad o acento.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios; no se exige compartir derivados bajo la misma licencia.
- Popularidad muy baja: 42 descargas y 0 "likes" en el momento de la consulta, con ausencia de validación por parte de la comunidad; conviene tratarlo como un checkpoint experimental antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IonGrozea/whisper-base_ro-80mel
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- faster-whisper (CTranslate2, cuantización int8/int16): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp (GGUF, inferencia en CPU): https://github.com/ggerganov/whisper.cpp
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados estaban dominados por contenido no relacionado); no se dispone de paper, blog ni demo asociados.
