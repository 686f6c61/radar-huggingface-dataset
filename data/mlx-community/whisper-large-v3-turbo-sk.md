# mlx-community/whisper-large-v3-turbo-sk

## Resumen

mlx-community/whisper-large-v3-turbo-sk es una conversión de formato del modelo KInIT/whisper-large-v3-turbo-sk al layout que carga nativamente mlx-whisper en Apple Silicon. No se trata de un reentrenamiento ni de una cuantización: los pesos se mantienen en fp16 y el único trabajo realizado por mlx-community es el reempaquetado de los ficheros para que el loader de MLX los reconozca. Todo el mérito del modelo subyacente corresponde a KInIT (Instituto Kempelen de Tecnologías Inteligentes, Eslovaquia), que afinó Whisper large-v3 turbo para eslovaco.

El modelo resuelve un problema práctico: mlx-whisper no puede cargar directamente checkpoints en formato transformers, de modo que hasta ahora no existía una vía sencilla para ejecutar el Whisper eslovaco de KInIT en Macs con chip Apple. Esta conversión cubre ese hueco y permite transcribir audio en eslovaco con una tasa de error muy inferior a la del Whisper large-v3 original de OpenAI.

Es relevante para desarrolladores que despliegan ASR en local sobre hardware Apple, para equipos que trabajan con contenido en eslovaco y para cualquiera que necesite transcripción privada sin depender de APIs en la nube. El repo ocupa 1,6 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) large-v3 turbo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s (estandar en Whisper) |
| Tipos de cuantizacion | fp16 (pesos originales, sin cuantizar) |
| Idiomas soportados | eslovaco (sk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (weights.safetensors) y npz (weights.npz) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 turbo: un transformer encoder-decoder con atención estándar que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. El modelo base procede de OpenAI; KInIT realizó un fine-tuning sobre él para eslovaco. Esta conversión concreta no modifica ni los pesos ni la arquitectura, solo el empaquetado de los ficheros para MLX.

Los detalles de datos de entrenamiento, número de tokens de audio y composición del dataset del fine-tuning original no están disponibles en la información proporcionada; deben consultarse en la model card de kinit/whisper-large-v3-turbo-sk. Tampoco se documenta si hubo etapas de RLHF o DPO, algo poco habitual en modelos ASR. La innovación técnica de esta publicación es exclusivamente de formato: ofrece los pesos en fp16 en dos ficheros equivalentes (safetensors como preferido por el loader y npz como fallback).

## Capacidades

- Reconocimiento automático de voz (ASR) en eslovaco, con salida de transcripción en texto.
- Transcripción de audio de cualquier duración mediante segmentación en ventanas de 30 s.
- Generación de marcas de tiempo a nivel de palabra mediante la opción `--word-timestamps True`.
- Ejecución local en Apple Silicon a través de mlx-whisper.
- No soporta tool calling, function calling ni razonamiento multi-step; es un modelo puramente ASR.
- No incluye capacidades de visión, audio generativo ni thinking mode.
- Multilingüismo limitado al eslovaco según los metadatos del repo.

## Casos de uso

- Transcripción de reuniones en eslovaco en local: el modelo procesa audio de cualquier longitud con `mlx_whisper` y permite mantener los datos en el dispositivo, sin enviar grabaciones a servicios externos.
- Generación de subtítulos: con `--word-timestamps True` se obtienen marcas temporales por palabra que pueden re-segmentarse en bloques de subtítulo; la model card advierte que el fine-tune tiende a emitir ventanas completas de 30 s sin límites de palabra, por lo que conviene post-procesar.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de podcasts, entrevistas o clases en eslovaco para indexación y búsqueda textual posterior.
- Investigación en ASR eslovaco: servir como referencia local para comparar con otros sistemas, dado su WER de 7,52 % en los test sets congelados de Gaston (octubre de 2026).
- Prototipado en Mac: desarrolladores que iteran sobre pipelines de voz en Apple Silicon pueden validar la calidad del modelo de KInIT sin montar infraestructura GPU.
- Accesibilidad: generación de transcripciones para contenido en eslovaco destinado a personas con discapacidad auditiva, ejecutándose en hardware de sobremesa.
- Procesamiento por lotes en CI o scripts: integración vía CLI (`mlx_whisper audio.mp3 --model ... --language sk`) en pipelines automatizados de transcripción.

## Benchmarks y rendimiento

| Modelo | WER en eslovaco (test sets congelados de Gaston, octubre 2026) |
|---|---|
| KInIT whisper-large-v3-sk (familia) | 7,52 % |
| OpenAI Whisper large-v3 | 13,47 % |

Los datos proceden de la model card de esta conversión y se refieren a la línea whisper-large-v3-sk de KInIT. No se han publicado en la información disponible resultados desglosados por conjunto de test ni métricas de latencia o throughput para la versión MLX.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo pesa 1,6 GB en fp16, por lo que se necesita al menos ese espacio en memoria unificada más el overhead del runtime y del audio procesado; en la práctica, un margen de 3-4 GB es razonable.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está pensado para Apple Silicon (series M1, M2, M3, M4 y superiores).
- Cabe en cualquier Mac con chip Apple y memoria unificada suficiente (8 GB en adelante, con holgura a partir de 16 GB).
- Opciones de despliegue: mlx-whisper (CLI y API Python). No está empaquetado para vLLM, TGI, llama.cpp ni Ollama, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER eslovaco | Licencia | Formato |
|---|---|---|---|---|---|
| mlx-community/whisper-large-v3-turbo-sk | no disponible (large-v3 turbo) | ventanas de 30 s | 7,52 % (familia KInIT) | Apache 2.0 | safetensors/npz (MLX) |
| kinit/whisper-large-v3-turbo-sk | no disponible (large-v3 turbo) | ventanas de 30 s | 7,52 % (familia KInIT) | no disponible | transformers |
| openai/whisper-large-v3 | 1.550 M (aprox., large-v3) | ventanas de 30 s | 13,47 % | MIT/Apache 2.0 (según distribución) | safetensors, transformers |

La comparación con openai/whisper-large-v3 en parámetros exactos y licencia debe verificarse en su model card; los datos de WER proceden de la medición citada por mlx-community. La ventaja principal de esta conversión frente al checkpoint de KInIT es la compatibilidad directa con mlx-whisper.

## Limitaciones y advertencias

- Solo eslovaco: los metadatos declaran únicamente `sk`; no debe esperarse buen rendimiento en otros idiomas.
- Riesgo de colapso en grabaciones largas: la model card advierte que una ventana silenciosa puede arrastrar el resto de la transcripción; se recomienda `--condition-on-previous-text False`.
- Segmentación deficiente: el fine-tune tiende a emitir ventanas completas de 30 s sin límites de palabra, lo que complica la generación directa de subtítulos.
- Es una conversión de formato sin validación adicional publicada: no hay benchmarks propios de la versión MLX que confirmen paridad exacta con el modelo original, aunque los pesos son idénticos en fp16.
- Riesgo de alucinación inherente a Whisper en audio ruidoso, con música o con silencios prolongados.
- Sesgos: no documentados en la información disponible; dependen del dataset de fine-tuning de KInIT.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base original de OpenAI y las condiciones del fine-tune de KInIT.
- Repo con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/whisper-large-v3-turbo-sk
- Modelo base (KInIT): https://huggingface.co/kinit/whisper-large-v3-turbo-sk
- KInIT: https://kinit.sk/
- mlx-whisper (ejemplos MLX): https://github.com/mlx-community/mlx-examples/tree/main/whisper
