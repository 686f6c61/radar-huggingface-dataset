# kristijonas/kmynas-parakeet-lt-v3

## Resumen

Kmynas v3 es un modelo de reconocimiento automático de voz (ASR) para lituano, desarrollado por Kristijonas (kristijonas) como fine-tune del modelo `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA. El modelo transcribe audio en lituano y, a diferencia de la mayoría de los fine-tunes públicos de Parakeet para este idioma, produce texto con puntuación y capitalización correctas, además de verbalizar números tal como se pronuncian. Está entrenado sobre 1.392 horas efectivas de audio, combinando el dataset LIEPA-3 (1.196 horas con puntuación restaurada por LLM) y 65,4 horas de conferencias y podcasts, estas últimas con un peso triple en el entrenamiento.

Con 600 millones de parámetros, Kmynas v3 es un modelo compacto y rápido, pensado para ejecutarse en hardware de consumo. Su arquitectura hereda el diseño Parakeet TDT (transducer) de NVIDIA, optimizado para transcripción de voz en tiempo real. El modelo se distribuye bajo licencia CC-BY-4.0 y está disponible en Hugging Face con formato NeMo. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para transcripción en lituano, un idioma con escasos recursos ASR de calidad, y en incluir puntuación automática sin necesidad de un modelo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (transducer de audio, basado en `nvidia/parakeet-tdt-0.6b-v3`) |
| Parametros totales | 600 millones (0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado en segmentos de 0,5–15 s) |
| Tipos de cuantizacion | no disponible (pesos en formato NeMo, probablemente FP32/FP16) |
| Idiomas soportados | lituano (lt) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (formato propio de NVIDIA, compatible con la librería NeMo) |

## Arquitectura y entrenamiento

Kmynas v3 es un fine-tune del modelo `nvidia/parakeet-tdt-0.6b-v3`, que pertenece a la familia Parakeet TDT de NVIDIA. Parakeet TDT es un modelo de reconocimiento de voz basado en la arquitectura transducer (también conocida como RNN-T), que combina un codificador acústico con un decodificador que predice tokens de texto y duraciones. El modelo base tiene 600 millones de parámetros y está diseñado para transcripción eficiente en tiempo real. En este fine-tune, se mantiene la arquitectura original y se adaptan los pesos al idioma lituano.

El entrenamiento se realizó sobre 1.392 horas efectivas de audio, compuestas por:
- 1.196 horas del dataset LIEPA-3, con puntuación restaurada mediante un LLM bajo un contrato de preservación de palabras.
- 65,4 horas de conferencias y podcasts, con un peso triple (upweighted ×3) para mejorar el rendimiento en registros de eventos.

El material de eventos se normalizó hacia la ortografía inglesa con inflexión de apóstrofo para préstamos no asimilados (por ejemplo, `podcast'ų`, `live'ą`), aunque solo alrededor del 28% de los préstamos siguen esta convención, lo que provoca inestabilidad en la ortografía de palabras extranjeras. El entrenamiento duró 25.000 pasos con un batch efectivo de 256, una tasa de aprendizaje de 5,5e-4 con decaimiento coseno, y se ejecutó en una única GPU A100-80GB. No se menciona el uso de RLHF o DPO; el ajuste es supervisado sobre las transcripciones con puntuación.

## Capacidades

- Transcripción de voz en lituano a texto con puntuación y capitalización automáticas.
- Verbalización de números: escribe los números tal como se pronuncian (convención LIEPA), en lugar de dígitos.
- Manejo de segmentos de audio de 0,5 a 15 segundos, con soporte para audio largo mediante un harness externo que aplica VAD, deduplicación de costuras y filtro de alucinaciones.
- Salida de texto con mayúsculas y puntuación, a diferencia de otros fine-tunes de Parakeet que producen texto en minúsculas sin puntuar.
- No incluye capacidades de tool calling, agentes, visión ni audio multilingüe; está especializado exclusivamente en ASR para lituano.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede transcribir grabaciones de eventos con puntuación correcta, facilitando la generación de actas o resúmenes. Su bajo coste computacional permite ejecutarlo en un portátil con GPU.
- Subtitulado de vídeos y podcasts: gracias al harness público que genera archivos `.srt` y `.vtt`, es posible producir subtítulos automáticos para contenido en lituano, con sincronización por palabras.
- Atención al cliente y análisis de llamadas: el modelo muestra un WER de 18,49% en llamadas telefónicas reales (evaluación independiente), lo que lo hace útil para transcribir conversaciones de soporte y extraer información de calidad.
- Transcripción de material de archivo y entrevistas: su capacidad para manejar registros variados (dialectos, eventos) lo hace adecuado para digitalizar archivos históricos o entrevistas orales.
- Generación de contenido accesible: transcripción de audiolibros o material educativo para personas con discapacidad auditiva, con puntuación que mejora la legibilidad.
- Investigación lingüística: el modelo puede servir para crear corpus transcritos de lituano, con anotación de puntuación y números verbalizados, útil para estudios de fonética o sociolingüística.

## Benchmarks y rendimiento

Los siguientes resultados son declarados por el autor en la model card. Se presentan tal cual, sin verificación independiente.

**WER en conjuntos held-out (puntuación eliminada y texto en minúsculas):**

| Conjunto | v2 | v3 |
|---|---|---|
| LIEPA validation | 15,13 | 14,19 |
| Telephone | 6,83 | 6,08 |
| Dialect | 26,84 | 24,95 |
| Event register (canales held-out) | 15,06 | 14,28 |
| FLEURS lt (986 clips) | 17,85 | 17,15 |

**Evaluación independiente (489 segmentos de grabaciones reales, referencias Scribe no verificadas por humanos):**

| Segmento | v1 | v2 | v3 |
|---|---|---|---|
| Todos | 21,82 | 18,64 | 16,31 |
| Llamada telefónica | 29,18 | 20,68 | 18,49 |
| Presentación de libro | 16,58 | 12,53 | 11,36 |
| Charla de conferencia | 21,19 | 17,54 | 14,86 |

**Contra referencias humanas** (test split de `meldynamics/liepa-asr`, 240 clips): 7,25% WER en frases y 10,91% en palabras sueltas, con cero tokens basura incluso en 118 clips de menos de 2 segundos. El autor advierte que estos valores son optimistas porque LIEPA probablemente forma parte de los datos de entrenamiento.

**Nota sobre FLEURS:** el 18% de las referencias de FLEURS imprimen números como dígitos que el hablante no pronunció. Este modelo verbaliza números, por lo que se ve penalizado en transcripciones que a menudo son correctas. En el subconjunto sin dígitos, el WER es de 13,11.

## Requisitos de hardware

- VRAM estimada: con 600M de parámetros, en FP32 se necesitan ~2,4 GB; en FP16 ~1,2 GB. Una GPU con al menos 4 GB de VRAM es suficiente para inferencia.
- GPU recomendadas: tarjetas de consumo como RTX 3060, RTX 4060, o superiores. También puede ejecutarse en GPU de datacenter (A100, etc.) para mayor throughput.
- Compatibilidad con CPU: posible, pero con latencia mayor; no se han publicado cifras de rendimiento en CPU.
- Opciones de despliegue: el modelo se usa mediante la librería NeMo (`nemo.collections.asr.ASRModel.from_pretrained`). No se mencionan conversiones a GGUF, ONNX u otros formatos. Para audio largo se recomienda el harness de GitHub (`github.com/kristijonasatpro/kmynas`), que incluye VAD, deduplicación y filtros.
- Latencia y throughput: no se han publicado cifras concretas. Dado el tamaño del modelo y la arquitectura transducer, es adecuado para transcripción en tiempo real en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Puntuación | WER FLEURS lt | Licencia |
|---|---|---|---|---|---|
| kmynas-parakeet-lt-v3 (este) | 600M | lituano | Sí | 17,15 | CC-BY-4.0 |
| kmynas-parakeet-lt-v2 | 600M | lituano | Sí | 17,85 | CC-BY-4.0 |
| kmynas-parakeet-lt-v1 | 600M | lituano | Sí | no disponible | CC-BY-4.0 |
| paprika-whisper-lt-v3 | no disponible (Whisper) | lituano | Sí | no disponible | no disponible |

Los modelos v1 y v2 son versiones anteriores del mismo autor, con el mismo tamaño y arquitectura base. v3 mejora el WER en todos los conjuntos evaluados. Paprika es un modelo basado en Whisper, también del mismo autor, pero no se dispone de métricas comparables en esta información. El modelo base de NVIDIA (`parakeet-tdt-0.6b-v3`) no tiene métricas publicadas para lituano en los datos disponibles.

## Limitaciones y advertencias

- Ortografía inestable de préstamos: solo ~28% de los préstamos siguen la convención de apóstrofo, lo que produce variaciones en palabras como `podcast'ų` o `live'ą`.
- Penalización en FLEURS por verbalización de números: el modelo escribe números como palabras, mientras que las referencias de FLEURS usan dígitos, lo que infla el WER en ese conjunto.
- Sensible al silencio: si se envía silencio digital (todo ceros) al modelo, emite una palabra fantasma ("Mums" en 69 de 169 bloques en una prueba). Se recomienda usar VAD y no enviar silencio.
- Limitado a segmentos de 0,5–15 s: para audio largo es imprescindible usar el harness con VAD y solapamiento; un bucle simple produce errores de costura.
- Riesgo de alucinaciones: aunque el modelo muestra cero tokens basura en clips cortos, el harness incluye un filtro de alucinaciones para mitigar posibles invenciones en audio largo.
- Sesgos y cobertura: el entrenamiento se centra en lituano estándar, con datos de conferencias y podcasts; el rendimiento en dialectos es notablemente peor (WER 24,95 en el conjunto de dialecto).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no hay garantías sobre el uso de los datos de entrenamiento (LIEPA-3) en cuanto a derechos de autor.
- Evaluación independiente con referencias no verificadas: los valores de la evaluación independiente se basan en transcripciones Scribe no revisadas por humanos, por lo que deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v3
- Checkpoints intermedios: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v3-checkpoints
- Versión v2: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v2
- Versión v1: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v1
- Modelo Paprika (Whisper lituano): https://huggingface.co/kristijonas/paprika-whisper-lt-v3
- Repositorio del harness para audio largo: https://github.com/kristijonasatpro/kmynas
- Dataset LIEPA-3: https://huggingface.co/datasets/meldynamics/liepa-3
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
