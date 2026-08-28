# ephm3ral/whisper-small-lora-transcribe-WaxalNLP-v0

## Resumen

El modelo `ephm3ral/whisper-small-lora-transcribe-WaxalNLP-v0` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo de reconocimiento automático del habla (ASR) `openai/whisper-small`. Ha sido entrenado por el usuario ephm3ral sobre el dataset `google/WaxalNLP`, un corpus de audio en lengua yoruba, con el objetivo de especializar el modelo base en la transcripción de este idioma. Se distribuye como un adaptador compatible con la librería `adapter-transformers` (o `adapters`), lo que permite cargarlo sobre el checkpoint original de Whisper Small sin necesidad de modificar los pesos completos del modelo.

Este adaptador resulta relevante porque aborda una lengua de bajos recursos (yoruba) mediante una técnica de ajuste eficiente en parámetros, lo que reduce drásticamente los costes de entrenamiento e inferencia frente a un fine-tuning completo. Al estar basado en Whisper Small, hereda la arquitectura encoder-decoder transformer de 244 millones de parámetros, aunque el adaptador en sí solo añade un número reducido de parámetros entrenables (no especificado). La ventana de contexto del modelo base es de 30 segundos de audio, pero no se indica si el adaptador modifica este aspecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Whisper Small (encoder-decoder transformer) |
| Parametros totales | no disponible (el adaptador LoRA añade un número reducido de parámetros; el modelo base tiene 244M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Whisper Small procesa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | no disponible (el adaptador se carga sobre el modelo base, que puede cuantizarse, pero no se especifica) |
| Idiomas soportados | yor (yoruba) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se carga mediante la librería `adapters`; el formato interno no se documenta) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Whisper Small, un modelo encoder-decoder transformer entrenado por OpenAI con supervisión débil sobre 680 000 horas de audio etiquetado. El adaptador LoRA se entrena sobre el dataset `google/WaxalNLP`, que contiene grabaciones de habla en yoruba. La técnica LoRA congela los pesos originales del modelo e introduce matrices de bajo rango en las capas de atención, lo que permite un ajuste eficiente con un coste computacional y de memoria muy inferior al fine-tuning completo. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de LoRA.

## Capacidades

- Transcripción de audio en lengua yoruba: el adaptador está especializado en convertir habla en yoruba a texto, aprovechando las capacidades multilingües de Whisper Small.
- Reconocimiento automático del habla (ASR): al integrarse con Whisper Small, puede transcribir audio de hasta 30 segundos por ventana.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o modo de pensamiento, ya que se trata de un modelo de transcripción de audio.

## Casos de uso

- Transcripción de reuniones y conferencias en yoruba: el adaptador puede procesar grabaciones de audio y generar transcripciones textuales, útil para actas o documentación en entornos corporativos o académicos donde se hable yoruba.
- Subtitulado automático de vídeos en yoruba: integrado en un pipeline de ASR, permite generar subtítulos para contenido audiovisual dirigido a audiencias yorubas.
- Asistencia a la accesibilidad: personas con discapacidad auditiva que hablen yoruba pueden beneficiarse de transcripciones en tiempo real de conversaciones o eventos.
- Análisis de llamadas de atención al cliente: en empresas que operan en regiones yorubas, el adaptador puede transcribir llamadas para su posterior análisis de calidad o extracción de información.
- Creación de corpus lingüísticos: investigadores pueden usar el adaptador para transcribir grandes volúmenes de audio en yoruba y construir datasets etiquetados para otros fines.
- Aplicaciones de dictado por voz: herramientas de escritura por voz en yoruba pueden integrar este adaptador para mejorar la precisión en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate), MMLU, HumanEval u otras comparaciones con modelos alternativos.

## Requisitos de hardware

- Al ser un adaptador LoRA, no requiere recursos adicionales significativos más allá de los del modelo base Whisper Small.
- Whisper Small (244M parámetros) puede ejecutarse en GPUs con al menos 2 GB de VRAM en FP16, o incluso en CPU con mayor latencia.
- Para uso en producción, se recomienda una GPU como NVIDIA T4, RTX 3060 o superior para inferencia en tiempo real.
- El adaptador se carga mediante la librería `adapters` (o `adapter-transformers`), que es compatible con PyTorch y Transformers.
- No se han publicado datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para transcripción en yoruba. Existen adaptadores LoRA para Whisper Small en otros dominios (por ejemplo, para habla disfluente o reconocimiento de emociones), pero no son comparables en tarea ni idioma. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador se ha entrenado únicamente en el dataset WaxalNLP, por lo que su rendimiento puede degradarse en acentos, dialectos o registros del yoruba no representados en ese corpus.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos limitados, puede presentar errores en vocabulario técnico o nombres propios poco frecuentes.
- Riesgo de alucinación: como cualquier modelo de ASR, puede generar transcripciones incorrectas o inventadas en segmentos de audio ambiguos o con ruido.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor antes de utilizarlo en productos comerciales.
- No se dispone de información sobre la robustez del adaptador ante diferentes condiciones de audio (ruido, acentos, velocidad de habla).

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ephm3ral/whisper-small-lora-transcribe-WaxalNLP-v0)
- [Dataset google/WaxalNLP](https://huggingface.co/datasets/google/WaxalNLP/)
- [Librería Adapters](https://github.com/Adapter-Hub/adapters)
