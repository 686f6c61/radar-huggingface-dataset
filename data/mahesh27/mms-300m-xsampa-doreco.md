# mahesh27/mms-300m-xsampa-doreco

## Resumen

El modelo `mahesh27/mms-300m-xsampa-doreco` es un checkpoint de reconocimiento automático de voz (ASR) basado en la arquitectura wav2vec2, derivado del modelo Massively Multilingual Speech (MMS-300M) de Meta. Ha sido adaptado por el usuario mahesh27 para transcribir audio en notación X-SAMPA, un alfabeto fonético codificado en ASCII, utilizando como base de entrenamiento el corpus DoReCo (Language DOcumentation REference COrpus), que recopila grabaciones de campo de lenguas minoritarias y en peligro de extinción.

El modelo cuenta con 316.639.564 parámetros y se distribuye bajo licencia Apache 2.0 en formato safetensors. Su relevancia radica en que aborda un nicho concreto: la transcripción fonética de lenguas con pocos recursos documentales, un ámbito donde los ASR comerciales no suelen ofrecer cobertura. Al emplear X-SAMPA como vocabulario de salida, facilita la labor de lingüistas y documentalistas que necesitan transcripciones fonéticas precisas sin depender de ortografías normalizadas.

El repositorio no incluye una model card detallada más allá de la licencia, por lo que gran parte de la información técnica debe inferirse del modelo base MMS-300M y de las características del corpus DoReCo. El modelo se publicó en agosto de 2026 y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer encoder convolucional) |
| Parametros totales | 316.639.564 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de extraccion de features) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | 53 lenguas del corpus DoReCo (lista completa no publicada en el repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, un encoder transformer con una etapa convolucional previa que procesa audio crudo a 16 kHz. El checkpoint original MMS-300M fue preentrenado de forma autosupervisada con el objetivo de contraste wav2vec2 sobre aproximadamente 500.000 horas de audio en más de 1.400 lenguas. Sobre esa base, el autor del repositorio ha realizado un ajuste fino (fine-tuning) supervisado para la tarea de transcripción fonética en notación X-SAMPA, utilizando los datos del corpus DoReCo.

El corpus DoReCo reúne grabaciones de campo de 53 lenguas, muchas de ellas minoritarias o en peligro de extinción, con anotaciones lingüísticas de alta calidad. El vocabulario de salida del modelo está restringido a símbolos X-SAMPA, lo que permite representar fonemas de cualquier lengua sin depender de un sistema ortográfico concreto. No se dispone de información sobre el número exacto de horas de entrenamiento, la estrategia de aumentación de datos ni si se aplicaron técnicas adicionales como decodificación con beam search o language model externo.

## Capacidades

- Transcripción fonética de audio en notación X-SAMPA, orientada a lenguas con documentación escasa.
- Procesamiento de audio muestreado a 16 kHz, requisito estándar de los modelos wav2vec2.
- Cobertura multilingüe restringida a las 53 lenguas representadas en DoReCo, con posible generalización limitada a lenguas fuera del corpus.
- No se ha documentado soporte para tool calling, generación de texto libre ni razonamiento multi-paso, ya que es un modelo puramente de reconocimiento de voz.
- No incluye capacidades de visión ni de síntesis de voz.

## Casos de uso

- Documentación lingüística de campo: los investigadores pueden transcribir automáticamente grabaciones de hablantes nativos de lenguas minoritarias a notación fonética X-SAMPA, reduciendo horas de trabajo manual de anotación.
- Creación de corpus fonéticos: el modelo permite generar transcripciones fonéticas alineadas con el audio para construir o ampliar corpus de entrenamiento de otros sistemas de procesamiento de voz.
- Estudios de fonología comparada: al unificar la salida en X-SAMPA, facilita la comparación sistemática de inventarios fonéticos entre lenguas del corpus DoReCo.
- Archivado y preservación digital: instituciones que digitalizan archivos sonoros de lenguas en peligro pueden usar el modelo para generar transcripciones fonéticas que acompañen a las grabaciones originales.
- Evaluación de inteligibilidad y dialectología: los lingüistas pueden analizar variaciones fonéticas entre hablantes o regiones a partir de las transcripciones automáticas.
- Desarrollo de ASR para lenguas de bajos recursos: las transcripciones generadas pueden servir como pseudo-etiquetas para entrenar otros modelos con vocabularios ortográficos o fonéticos más amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) o PER (Phoneme Error Rate) sobre conjuntos de evaluación estándar, ni comparaciones con otros modelos de transcripción fonética.

## Requisitos de hardware

- VRAM estimada para inferencia: con 316 millones de parámetros en precisión fp32, el modelo requiere aproximadamente 1,3 GB de VRAM. Con cuantización a int8, podría reducirse a unos 350-400 MB, aunque no se ofrecen pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lotes pequeños. Una NVIDIA GTX 1650 o superior podría ejecutar el modelo sin problemas. Para fine-tuning adicional, se recomienda una GPU con 8-12 GB de VRAM (RTX 3060, RTX 3080, A10).
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo desde 4 GB de VRAM.
- Opciones de despliegue: al ser un modelo wav2vec2 estándar, puede ejecutarse con Hugging Face Transformers, así como con librerías de inferencia optimizada como vLLM (aunque no es el caso de uso típico) o mediante ONNX Runtime si se exporta el modelo. También es compatible con pipelines de Hugging Face para ASR.
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo wav2vec2 de 300M parámetros en una GPU moderna procesa audio en tiempo real o más rápido (factor de 5-10x sobre la duración del audio) con batch size 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Idiomas | Licencia |
|---|---|---|---|---|---|
| mahesh27/mms-300m-xsampa-doreco | 316M | no disponible | X-SAMPA | 53 (DoReCo) | Apache 2.0 |
| facebook/mms-300m | 300M | 20 s aprox. | vocabulario por idioma | 1.400+ | CC-BY-NC 4.0 (no comercial) |
| facebook/mms-300m-1130-forced-aligner | 300M | no disponible | CTC alignments | 158 | CC-BY-NC 4.0 |

El modelo de mahesh27 se diferencia del MMS-300M original en dos aspectos clave: la salida está restringida a X-SAMPA (frente a vocabularios ortográficos por idioma) y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones. Frente al forced aligner de Meta, este modelo no está diseñado para alineación forzada sino para transcripción directa, aunque ambos comparten base arquitectónica.

## Limitaciones y advertencias

- La cobertura lingüística está limitada a las 53 lenguas del corpus DoReCo; el rendimiento en lenguas fuera de ese conjunto probablemente sea deficiente o nulo.
- No se ha publicado información sobre la cantidad de datos de entrenamiento, la división de validación ni las métricas de calidad, lo que impide evaluar su fiabilidad de forma objetiva.
- El modelo no incluye un mecanismo de corrección ortográfica ni un modelo de lenguaje externo, por lo que las transcripciones pueden contener errores fonéticos que requieran revisión manual.
- Al ser un modelo de transcripción fonética, no genera texto legible para usuarios no especializados; su uso requiere conocimientos de X-SAMPA.
- El repositorio no ofrece pesos cuantizados ni documentación de uso, lo que puede dificultar su adopción en entornos de producción.
- No se han realizado evaluaciones de sesgo o robustez ante ruido, acentos o condiciones acústicas adversas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mahesh27/mms-300m-xsampa-doreco
- Modelo base MMS-300M: https://huggingface.co/facebook/mms-300m
- Corpus DoReCo: https://doreco.huma-num.fr/
- Proyecto MMS de Meta: https://huggingface.co/facebook/mms-300m/blob/main/README.md
