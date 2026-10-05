# samuelolubukun/moonshine-tiny-yoruba-openbible

## Resumen
El modelo `samuelolubukun/moonshine-tiny-yoruba-openbible` es un ajuste fino del modelo de reconocimiento automático del habla (ASR) `UsefulSensors/moonshine-tiny`, desarrollado por el usuario samuelolubukun. Se trata de un transformer encoder-decoder de aproximadamente 27 millones de parámetros, adaptado específicamente para transcribir audio en yoruba (`yo`), una lengua tonal de bajos recursos. El modelo amplía el vocabulario del tokenizador original con 29 tokens especializados para diacríticos y marcas tonales yoruba (`ẹ, ọ, ṣ`, tonos alto/medio/bajo), y se entrena sobre el corpus `multilingual-tts/open-bible` en su configuración yoruba, compuesto por 30.612 segmentos de audio de 16 kHz grabados en estudio.

La relevancia de este modelo radica en su enfoque en una lengua africana con escasez de recursos ASR, logrando un WER del 37,37% y un CER del 14,83% en la evaluación con normalización de diacríticos y tonos, sobre 100 muestras no vistas de hablantes y capítulos distintos. Aunque el rendimiento aún está lejos de ser perfecto, representa un avance significativo para la transcripción de yoruba, especialmente en dominios de audio limpio y narración religiosa. Su licencia Apache-2.0 permite uso comercial, y su pequeño tamaño facilita el despliegue en hardware modesto.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine) |
| Parámetros totales | 27.097.344 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo ASR, procesa audio) |
| Tipos de cuantización | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | Yoruba (`yo`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 16.000 Hz (mono) |
| Vocabulario extendido | 29 tokens diacríticos yoruba |
| Dataset de entrenamiento | multilingual-tts/open-bible (configuración yoruba) |
| Tamaño del dataset | 30.612 segmentos WAV de 16 kHz |
| Pasos de entrenamiento | 5.000 base + 2.000 refinamiento = 7.000 |
| Precisión de entrenamiento | FP16 mixed precision |
| Hardware de entrenamiento | NVIDIA A10G (24 GB VRAM) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Moonshine de Useful Sensors, un transformer encoder-decoder diseñado para ASR de baja latencia. El ajuste fino parte del checkpoint `UsefulSensors/moonshine-tiny` (~27M parámetros) y añade un vocabulario extendido de 29 tokens para representar adecuadamente los diacríticos y tonos del yoruba. El entrenamiento se realizó en dos fases: una primera de 5.000 pasos sobre el corpus OpenBible yoruba, seguida de un refinamiento de 2.000 pasos con una tasa de aprendizaje suave (3e-5) para corregir artefactos de fronteras morfológicas. Se empleó un tamaño de lote efectivo de 16, precisión FP16 y una GPU NVIDIA A10G. La pérdida de entropía cruzada descendió de 2,2140 a 0,2540, mostrando una convergencia estable.

La innovación principal radica en el saneamiento ortográfico automático: se aplicaron expresiones regulares para reparar pronombres y clíticos pegados (p. ej., `taniọba` → `tani ọba`) y morfemas fragmentados (p. ej., `ọlọ́gbọ́ n` → `ọlọ́gbọ́n`). Este proceso permitió al modelo generar límites de palabra gramaticales sin perder el conocimiento acústico de los tonos. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado con datos de audio-texto alineados.

## Capacidades
- Reconocimiento automático del habla (ASR) para yoruba, transcribiendo audio a texto.
- Manejo de diacríticos y marcas tonales yoruba (`ẹ, ọ, ṣ`, tonos alto/medio/bajo) gracias a la extensión del tokenizador.
- Generación de texto con puntuación y mayúsculas (evaluación raw/verbatim), aunque también puede normalizarse.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe; únicamente reconoce yoruba.
- No dispone de capacidades de visión, audio más allá de ASR, ni modos de pensamiento.
- La salida puede incluir alucinaciones de citas según la model card, aunque se reporta un 0% en las pruebas realizadas.

## Casos de uso
- Transcripción de sermones y estudios bíblicos en yoruba: el modelo está entrenado con narración de estudio de OpenBible, por lo que ofrece alta precisión en este dominio, permitiendo convertir grabaciones religiosas en texto editable.
- Subtitulado automático de vídeos y pódcast en yoruba: se puede integrar en pipelines de generación de subtítulos para contenido audiovisual, aprovechando su capacidad para manejar tonos y diacríticos.
- Asistentes de voz para yorubaparlantes: al ser un modelo ASR ligero, puede incrustarse en aplicaciones de voz para comandos y dictado en yoruba, facilitando la interacción en lengua local.
- Digitalización de archivos de audio históricos en yoruba: permite transcribir grabaciones antiguas, aunque el rendimiento puede degradarse con ruido de fondo o baja calidad.
- Aplicaciones de aprendizaje de idiomas: ayuda a estudiantes de yoruba a practicar la pronunciación, transcribiendo su voz y mostrando los tonos y diacríticos correctos.
- Investigación lingüística: facilita el análisis de patrones fonéticos y tonales del yoruba al transcribir grandes corpus orales de forma automática.
- Atención al cliente en yoruba: puede transcribir llamadas o mensajes de voz para su posterior análisis, aunque se recomienda para audio limpio y sin solapamientos.

## Benchmarks y rendimiento
Evaluación sobre 100 muestras de prueba no vistas, con búsqueda de haz optimizada (`num_beams=5`, `repetition_penalty=1.05`, `length_penalty=1.0`, `no_repeat_ngram_size=4`):

| Normalización | WER | CER |
|---|---:|---:|
| Raw / Verbatim | 53,25% | 21,32% |
| Clean / Standardized | 41,20% | 17,46% |
| Diacritic & Tone-Neutralized | 37,37% | 14,83% |

La model card reporta además un 0% de alucinaciones de citas en las tres configuraciones. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP16 (los pesos ocupan ~54 MB, más activaciones), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con más de 1 GB de VRAM; el entrenamiento utilizó una NVIDIA A10G de 24 GB, pero la inferencia es mucho más ligera.
- Cabe en GPU consumer: sí, en modelos como GTX 1050, RTX 3060, RTX 4090, etc.
- Opciones de despliegue: Hugging Face Transformers (PyTorch); potencialmente ONNX Runtime si se exporta el modelo (Moonshine soporta ONNX, pero no se proporciona conversión oficial en este repositorio). También puede ejecutarse en CPU con PyTorch.
- Latencia y throughput estimados: no disponible (dependen del hardware y de la longitud del audio).

## Comparativa con modelos similares
No se dispone de otros modelos ASR para yoruba en la información proporcionada. Como referencia, se compara con el modelo base del que deriva:

| Modelo | Parámetros | Idiomas | Licencia | WER en yoruba |
|---|---:|---|---|---:|
| Moonshine-tiny (base) | ~27M | Inglés | MIT | no disponible |
| Moonshine-tiny-yoruba-openbible | 27.097.344 | Yoruba | Apache-2.0 | 37,37% (normalizado) |

No se han encontrado en la búsqueda otros modelos comparables específicos para yoruba.

## Limitaciones y advertencias
- Entrenado con narración de estudio (OpenBible), por lo que su rendimiento puede degradarse significativamente con ruido de fondo, llamadas telefónicas de baja calidad, conversaciones superpuestas o audio de baja fidelidad.
- El WER en el mejor caso (37,37%) sigue siendo alto para aplicaciones que requieran transcripción precisa; se recomienda validar en el dominio de uso.
- Solo soporta yoruba; no es multilingüe y no reconoce otros idiomas.
- Puede heredar sesgos del corpus bíblico, tanto en vocabulario como en temática, lo que limita su generalización a otros contextos.
- Riesgo de alucinación: aunque se reporta 0% de alucinaciones de citas, en ASR puede generar texto plausible pero incorrecto, especialmente en pasajes ambiguos.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del dataset subyacente (`multilingual-tts/open-bible`) para asegurar el cumplimiento en producción.
- No se proporcionan pesos cuantizados (GGUF, etc.), lo que puede limitar el despliegue en dispositivos con restricciones extremas de memoria.
- La tokenización extendida con 29 tokens diacríticos puede causar problemas de compatibilidad si se intenta usar con tokenizadores estándar de Moonshine.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/samuelolubukun/moonshine-tiny-yoruba-openbible)
- [Modelo base UsefulSensors/moonshine-tiny](https://huggingface.co/UsefulSensors/moonshine-tiny)
- [Dataset multilingual-tts/open-bible](https://huggingface.co/datasets/multilingual-tts/open-bible)
- [Repositorio GitHub de Moonshine](https://github.com/moonshine-ai/moonshine)
- [Documentación de Moonshine Voice (modelos disponibles)](https://moonshine-voice.readthedocs.io/en/stable/models/available-models/)
- [Modelo similar en hausa del mismo autor](https://huggingface.co/samuelolubukun/moonshine-tiny-hausa-openbible)
- [Página de Inferix sobre moonshine-tiny](https://inferix.co/models/UsefulSensors/moonshine-tiny)
