# DariusTheGeek/waxal-sna-omniasr-llm-1b

## Resumen

El modelo `waxal-sna-omniasr-llm-1b` es un sistema de reconocimiento automático de voz (ASR) especializado en el idioma shona, desarrollado por DariusTheGeek como parte de la solución WAXAL ASR. Se trata de un fine-tuning del modelo base `facebook/omniASR-LLM-1B-v2` sobre el subconjunto supervisado de shona del dataset `google/WaxalNLP`. Su objetivo es abordar la escasez de sistemas ASR de calidad para lenguas africanas de bajos recursos, ofreciendo una alternativa de código abierto con licencia Apache 2.0.

El modelo se distribuye como un checkpoint de fairseq2 con un peso de 9,12 GB, y está diseñado para integrarse en un pipeline de ensamblaje más amplio (routing, decodificación, fusión y post-procesado) que se publica en el repositorio de la solución WAXAL. No se recomienda su uso de forma aislada, sino como componente de un sistema completo de transcripción para shona.

La relevancia de este modelo radica en que demuestra cómo un modelo ASR multilingüe de última generación puede adaptarse eficazmente a una lengua con pocos recursos mediante fine-tuning supervisado, y en que libera el proceso completo de reproducción (entorno, configuraciones, decodificación) para que otros desarrolladores puedan replicar o extender el trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en OmniASR-LLM-1B-v2 (arquitectura encoder-decoder, no se especifican más detalles) |
| Parametros totales | No disponible (nombre sugiere ~1B, pero no se confirma) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Shona (sn) |
| Licencia | Apache-2.0 |
| Formato de pesos | Fairseq2 (archivo `model.pt` de 9,12 GB, tokenizer `omniASR_tokenizer_written_v2.model`) |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/omniASR-LLM-1B-v2`, un sistema ASR multilingüe de la familia OmniASR desarrollado por Meta. Aunque no se detallan los componentes internos de esta arquitectura en la información proporcionada, se sabe que está diseñada para manejar múltiples idiomas con un único modelo, probablemente combinando un encoder de audio con un decodificador basado en transformer. El fine-tuning se realizó sobre el subconjunto supervisado de shona del dataset `google/WaxalNLP`, con semilla 42. El artefacto liberado es un promedio de los pesos de los tres mejores checkpoints (top-3 equal-weight parameter average), y la decodificación se realiza con beam search de tamaño 5 y normalización de longitud activada.

No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se enmarca en el contexto de la competición WAXAL (organizada por Zindi), orientada a crear soluciones ASR para lenguas africanas.

## Capacidades

- Reconocimiento automático de voz para el idioma shona, transcribiendo audio a texto.
- Integración en un pipeline de ensamblaje con otros tres modelos de la misma familia (cada uno especializado en un idioma o variante) mediante fusión por medoide de palabras (word-medoid MBR).
- Decodificación con beam search (beam 5) y normalización de longitud.
- Soporte de entrada de audio en formato de archivos WAV (según el ejemplo de uso).
- No se mencionan capacidades de generación de texto general, tool calling, agentes o razonamiento; es un modelo puramente ASR.
- Multilingüismo limitado: solo shona en este checkpoint, aunque el modelo base OmniASR es multilingüe.

## Casos de uso

- Transcripción de reuniones y entrevistas en shona: el modelo puede convertir grabaciones de audio en texto para su posterior análisis, archivado o búsqueda, aprovechando su especialización en este idioma.
- Generación de subtítulos automáticos para vídeos en shona: integrado en un pipeline de post-procesado, permite subtitular contenido audiovisual de forma automática, facilitando el acceso a medios en esta lengua.
- Asistentes de voz en shona: combinado con un sistema de síntesis de voz y un gestor de diálogo, puede servir como componente de reconocimiento en aplicaciones de asistente virtual para hablantes de shona.
- Documentación médica y legal: transcripción de dictados o entrevistas en entornos profesionales donde el shona es la lengua principal, reduciendo la carga de trabajo manual de transcripción.
- Archivado de patrimonio oral: digitalización y transcripción de grabaciones históricas o culturales en shona, preservando el contenido en formato textual buscable.
- Investigación lingüística: análisis de corpus orales en shona, permitiendo a investigadores estudiar patrones fonéticos, sintácticos o de uso de la lengua a partir de transcripciones automáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como parte de una solución de competición (WAXAL/Zindi), pero no se incluyen métricas como WER (Word Error Rate) o comparaciones con otros sistemas en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible, pero dado el tamaño del checkpoint (9,12 GB) y que la decodificación se realiza con batch size 1, se estima que al menos 10-12 GB de VRAM son necesarios para cargar el modelo en FP16 o BF16.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. No se menciona compatibilidad con GPUs de consumo más modestas.
- En consumer GPU: probablemente sí en una RTX 3090/4090 con suficiente memoria, pero no está confirmado.
- Opciones de despliegue: el modelo se usa a través del CLI proporcionado en el repositorio `waxal-asr-solution`, que gestiona el entorno (fairseq2) y la decodificación. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM generativo estándar.
- Latencia y throughput: no disponibles; la decodificación con beam 5 y batch size 1 sugiere un uso enfocado a precisión más que a velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `waxal-sna-omniasr-llm-1b` (este) | ~1B (no confirmado) | No disponible | Shona | Apache-2.0 | Fairseq2 | Fine-tune de OmniASR-LLM-1B-v2 |
| `facebook/omniASR-LLM-1B-v2` | ~1B (no confirmado) | No disponible | Multilingüe | Apache-2.0 (heredada) | Fairseq2 | Modelo base, cubre múltiples idiomas |
| `DariusTheGeek/waxal-lin-omniasr-llm-1b` | ~1B (no confirmado) | No disponible | Lingala | Apache-2.0 | Fairseq2 | Hermano del modelo, fine-tune para lingala |

No se dispone de datos de rendimiento comparativos (WER, etc.) entre estos modelos. Otros sistemas ASR para lenguas africanas podrían incluir Whisper (fine-tuneado) o modelos específicos de la zona, pero no hay información suficiente para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para shona; su uso con otros idiomas no está soportado y probablemente produzca resultados incorrectos.
- No debe usarse de forma aislada; el autor indica explícitamente que es un componente de un ensamblaje y que el pipeline completo es necesario para obtener transcripciones fiables.
- No se han publicado métricas de rendimiento (WER, etc.), por lo que la calidad real en producción es desconocida.
- El tamaño del checkpoint (9,12 GB) puede suponer una barrera para despliegues en entornos con recursos limitados.
- No se especifican limitaciones de contexto de audio (duración máxima de las grabaciones) ni de calidad de audio (ruido, acentos).
- Aunque la licencia es Apache-2.0, el modelo base tiene su propia licencia; se hereda la del padre, pero conviene verificar las condiciones de uso del dataset `google/WaxalNLP`.
- El modelo fue entrenado con un subconjunto supervisado del dataset WaxalNLP; puede presentar sesgos hacia las variedades dialectales o condiciones de grabación representadas en ese dataset.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/DariusTheGeek/waxal-sna-omniasr-llm-1b
- Repositorio de la solución WAXAL ASR: https://github.com/DariusTheGeek/waxal-asr-solution
- Dataset `google/WaxalNLP`: https://huggingface.co/datasets/google/WaxalNLP
- Modelo base `facebook/omniASR-LLM-1B-v2`: https://huggingface.co/facebook/omniASR-LLM-1B-v2
- Modelo hermano para lingala: https://huggingface.co/DariusTheGeek/waxal-lin-omniasr-llm-1b
