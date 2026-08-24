# dehanns/whisper-small-sinhala

## Resumen

`dehanns/whisper-small-sinhala` es un modelo de reconocimiento automático del habla (ASR) especializado en cingalés (sinhala), derivado del modelo `openai/whisper-small` mediante ajuste fino. El cingalés es un idioma con escasos recursos en el ámbito del ASR, por lo que este tipo de adaptaciones busca mejorar la precisión de transcripción frente al modelo base multilingüe. El repositorio contiene los pesos en formato safetensors con precisión F32, con un total de 241,7 millones de parámetros, coherente con la arquitectura whisper-small.

La ficha del modelo en Hugging Face es mínima: no incluye tarjeta de modelo, licencia, ni descripción detallada. Los proyectos relacionados en GitHub (como `sandun131/Sinhala-ASR-Whisper-Small`) sugieren que el fine-tuning se realizó sobre audio de estilo periodístico curado, un enfoque habitual para dominios específicos. La relevancia de este modelo radica en abordar el reconocimiento de voz para un idioma subrepresentado, aunque su estado de mantenimiento y documentación son limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (Transformer encoder-decoder) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (estandar Whisper-small) |
| Tipos de cuantizacion | F32 (safetensors); cuantizaciones adicionales no disponibles |
| Idiomas soportados | Cingales (objetivo del fine-tuning); idiomas adicionales no documentados |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper-small de OpenAI: un transformer encoder-decoder con atención de escala de contexto de audio de 30 segundos, que procesa espectrogramas log-Mel de 80 canales. El fine-tuning específico para cingalés no está documentado en la tarjeta del modelo, pero proyectos relacionados en GitHub indican que se emplearon datos de audio de estilo noticias en cingalés, un dominio con vocabulario controlado y dicción clara. No se dispone de información sobre el número de tokens de entrenamiento, el método de alineación (RLHF, DPO) ni otras innovaciones técnicas específicas de este ajuste.

## Capacidades

- Transcripción de voz en cingalés a texto, adaptada a dominios de noticias y habla clara.
- Hereda las capacidades generales de Whisper-small para detección de idioma y traducción, aunque el fine-tuning puede degradar el rendimiento en idiomas distintos del cingalés.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso; es un modelo puramente de ASR.
- La ventana de contexto de 30 segundos permite procesar clips de audio de esa duración de una sola vez.

## Casos de uso

- Transcripción de noticias y contenidos audiovisuales en cingalés: el fine-tuning con datos de noticias lo hace adecuado para subtitulado de informativos o archivos de medios.
- Archivado de reuniones o conferencias en cingalés: puede transcribir audio de reuniones grabadas con calidad razonable.
- Accesibilidad para hablantes de cingalés: conversión de contenido hablado a texto para personas con discapacidad auditiva.
- Investigación lingüística: análisis de corpus orales en cingalés mediante transcripción automatizada.
- Integración en aplicaciones de dictado por voz para usuarios de cingalés.
- Generación de subtítulos para vídeos educativos o de divulgación en cingalés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER, MMLU o HumanEval para este modelo específico.

## Requisitos de hardware

- Con 241,7 millones de parámetros en F32, la inferencia requiere aproximadamente 1 GB de VRAM en FP32 (0,97 GB para los pesos, más overhead de activaciones).
- En cuantizaciones de 8 bits (INT8), el modelo puede ejecutarse en GPUs con 1-2 GB de VRAM; en 4 bits, cabe en GPUs de 1 GB, aunque no se han publicado cuantizaciones para este modelo concreto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, o superiores. En CPU, la inferencia es lenta pero factible.
- Opciones de despliegue: transformers de HuggingFace para Python, o mediante la librería `whisper` de OpenAI con pesos locales. No está desplegado en ningún Inference Provider de HuggingFace.
- La latencia típica para Whisper-small en GPU es de segundos por clip de 30 segundos, pero no se ha medido específicamente para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas específicas de ASR en cingalés. Como referencia general del modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `dehanns/whisper-small-sinhala` | 241,7M | 30 s audio | no disponible | HuggingFace |
| `openai/whisper-small` | 244M | 30 s audio | MIT | HuggingFace |
| `openai/whisper-base` | 74M | 30 s audio | MIT | HuggingFace |

No se han encontrado otros modelos ASR específicos para cingalés en la información disponible para una comparativa más detallada.

## Limitaciones y advertencias

- No hay licencia especificada en la tarjeta de HuggingFace, lo que impide conocer las restricciones de uso comercial; se debe contactar al autor antes de usar en producción.
- La documentación es inexistente: no hay tarjeta de modelo, no se detalla el dataset de entrenamiento ni los métodos de evaluación.
- El fine-tuning con datos de noticias puede limitar el rendimiento en otros dominios (conversaciones informales, dialectos, ruido de fondo).
- Riesgo de alucinación o errores de transcripción en audio con ruido, acentos no representados o vocabulario técnico fuera del corpus de entrenamiento.
- El modelo está en F32, lo que incrementa el uso de memoria frente a cuantizaciones más ligeras no publicadas.
- La fecha de creación (2026-07-31) es futura, lo que sugiere que la información puede ser incompleta o el modelo puede estar en fase experimental.

## Enlaces

- [HuggingFace: dehanns/whisper-small-sinhala](https://huggingface.co/dehanns/whisper-small-sinhala)
- [openai/whisper-small en HuggingFace](https://huggingface.co/openai/whisper-small)
- [whisper-small-sinhala en model.aibase.com](https://model.aibase.com/models/details/1915753626762633218)
- [GitHub: sandun131/Sinhala-ASR-Whisper-Small - load_the_whisper_sinhala_small_for_inference.py](https://github.com/sandun131/Sinhala-ASR-Whisper-Small/blob/main/load_the_whisper_sinhala_small_for_inference.py)
- [GitHub: kaan84k/whisper-small-sinhala-proto](https://github.com/kaan84k/whisper-small-sinhala-proto)## Resumen

`dehanns/whisper-small-sinhala` es un modelo de reconocimiento automático del habla (ASR) especializado en cingalés, obtenido mediante ajuste fino del modelo `openai/whisper-small`. El cingalés es un idioma de bajos recursos en el ámbito del ASR, por lo que este tipo de adaptaciones busca mejorar la precisión de transcripción frente al modelo base multilingüe, que suele rendir peor en lenguas minoritarias. El repositorio contiene los pesos en formato safetensors con tensorizado F32 y un total de 241.734.912 parámetros, coherente con la arquitectura whisper-small.

La tarjeta del modelo en Hugging Face es mínima: no incluye descripción, licencia, ni información sobre el proceso de entrenamiento. Los proyectos relacionados en GitHub sugieren que el ajuste se realizó con audio de estilo noticias en cingal, un enfoque habitual para dominios específicos. El modelo está disponible desde julio de 2026 y acumula pocas descargas, lo que indica que es un proyecto en fase inicial o de uso limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (transformer encoder-decoder) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (estandar Whisper-small) |
| Tipos de cuantizacion | F32 (safetensors); otras cuantizaciones no disponibles |
| Idiomas soportados | Cingal (objetivo del ajuste); no se documentan otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper-small de OpenAI: un transformer encoder-decoder que procesa espectrogramas log-Mel de 80 canales con ventanas de 30 segundos de audio. El ajuste fino se ha realizado para adaptar el modelo al cingal, aunque no se ha publicado información detallada sobre el conjunto de datos de entrenamiento, el número de tokens, ni el método de alineación (RLHF, DPO, etc.). Los repositorios en GitHub vinculados a este modelo indican que el entrenamiento se hizo con audio de estilo noticias, lo que sugiere un dominio específico de habla clara y formal. No hay evidencia de innovaciones técnicas adicionales más allá del ajuste fino.

## Capacidades

- Transcripción de voz en cingal a texto, adaptada a habla clara y dominio de noticias.
- Hereda las capacidades generales de Whisper-small para detección de idioma y transcripción multilingüe, aunque el ajuste fino puede degradar el rendimiento en idiomas fuera del cingal.
- No se ha documentado soporte para tool calling, agentes, ni razonamiento multi-paso; es un modelo puramente de ASR.
- La ventana de contexto de 30 segundos permite procesar clips de audio de esa duración de una sola pasada.

## Casos de uso

- **Subtitulado de noticias en cingal**: el modelo está ajustado con datos de estilo noticias, por lo que es adecuado para transcribir informativos o vídeos de medios cingaleses y generar subtítulos automáticos.
- **Archivo de reuniones y conferencias**: puede transcribir grabaciones de reuniones o ponencias en cingal, siempre que el audio sea razonablemente claro.
- **Accesibilidad para hablantes de cingal**: conversión de contenido hablado a texto para personas con discapacidad auditiva o para facilitar la lectura de materiales audiovisuales.
- **Investigación lingüística**: transcripción de corpus orales en cingal para análisis de dialectos, fonética o sociolingüística.
- **Dictado por voz**: integración en aplicaciones de dictado para usuarios de cingal, aunque la calidad dependerá del dominio del audio.
- **Documentación de eventos**: transcripción de discursos o presentaciones en cingal para actas o resúmenes escritos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER, CER u otros indicadores de rendimiento para este modelo específico.

## Requisitos de hardware

- **VRAM estimada**: con 241,7 millones de parámetros en F32, los pesos ocupan aproximadamente 0,97 GB. Con overhead de activación, se recomienda al menos 2 GB de VRAM para inferencia en FP32.
- **GPU recomendadas**: cualquier GPU con 2-4 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 2060 o superiores. En CPU, la inferencia es posible pero lenta.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo modernas, incluso en las de gama de entrada.
- **Opciones de despliegue**: se puede usar con la librería `transformers` de Hugging Face, `whisper` de OpenAI, o vLLM/TGI si se convierte a formatos compatibles (aunque no está documentado).
- **Latencia y throughput**: no se dispone de datos específicos; en una GPU de gama media, un clip de 30 segundos se procesa típicamente en unos pocos segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `dehanns/whisper-small-sinhala` | 241,7M | 30 s audio | no disponible | Hugging Face |
| `openai/whisper-small` | 244M | 30 s audio | MIT | Hugging Face |
| `openai/whisper-base` | 74M | 30 s audio | MIT | Hugging Face |

No se dispone de información sobre otros modelos ASR específicos para cingal con los que comparar directamente. El modelo base `whisper-small` es el punto de partida lógico para evaluar la mejora del ajuste fino, pero no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- **Licencia no especificada**: el uso comercial puede ser problemático; se debe contactar con el autor antes de desplegar en producción.
- **Documentación insuficiente**: no hay tarjeta de modelo, ni detalles sobre el dataset de entrenamiento, ni evaluación.
- **Dominio limitado**: el ajuste fino con datos de noticias puede degradar el rendimiento en audio conversacional, con ruido o con acentos no representados.
- **Riesgo de alucinación**: como todos los modelos ASR, puede generar texto que no corresponde al audio, especialmente en condiciones de baja calidad.
- **Soporte de idiomas**: el ajuste fino puede reducir la capacidad del modelo para transcribir otros idiomas que el cingal, aunque no se ha verificado.
- **Formato F32**: el modelo solo está disponible en precisión completa, lo que aumenta el uso de memoria frente a cuantizaciones como INT8 o FP16.
- **Mantenimiento**: el modelo tiene pocas descargas y sin actualizaciones recientes, lo que sugiere que no hay soporte activo.

## Enlaces

- [Hugging Face - dehanns/whisper-small-sinhala](https://huggingface.co/dehanns/whisper-small-sinhala)
- [Hugging Face - openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Model AIbase - whisper-small-sinhala](https://model.aibase.com/models/details/1915753626762633218)
- [GitHub - sandun131/Sinhala-ASR-Whisper-Small](https://github.com/sandun131/Sinhala-ASR-Whisper-Small/blob/main/load_the_whisper_sinhala_small_for_inference.py)
- [GitHub - kaan84k/whisper-small-sinhala-proto](https://github.com/kaan84k/whisper-small-sinhala-proto)
