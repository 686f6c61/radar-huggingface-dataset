# Agrima11/agrima-whisper-final

## Resumen

Agrima11/agrima-whisper-final es un modelo de reconocimiento automático de voz (ASR) especializado en idioma nepalí, desarrollado por Agrima11. Se trata de un ajuste fino (fine-tune) del modelo Whisper-small de OpenAI, concretamente sobre el modelo base Agrima11/whisper-small-nepali-openslr, que a su vez es un fine-tune de Whisper-small para nepalí. El modelo está publicado bajo licencia MIT y utiliza la arquitectura transformer encoder-decoder característica de la familia Whisper, con aproximadamente 241 millones de parámetros.

La relevancia de este modelo radica en ofrecer una solución de transcripción de voz para un idioma de recursos limitados como el nepalí, donde los modelos multilingües genéricos suelen tener un rendimiento subóptimo. Al estar específicamente ajustado para esta lengua, se espera una mejora en la precisión (WER) en comparación con el modelo base. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni métricas de evaluación, lo que limita la verificación de su rendimiento real.

La ficha técnica que sigue se basa exclusivamente en la información disponible en Hugging Face y en el conocimiento público de la arquitectura Whisper. No se han encontrado datos adicionales de benchmarks, requisitos de hardware o comparativas con otros modelos en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (transformer encoder-decoder) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (Whisper suele usar ventanas de audio de 30 segundos, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | ne (nepalí) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, que consiste en un transformer encoder-decoder entrenado para tareas de reconocimiento de voz, traducción y identificación de idioma. Whisper original se entrenó con más de 680.000 horas de audio débilmente supervisado, pero este fine-tune se ha realizado específicamente para nepalí a partir de un modelo base ya adaptado a ese idioma (Agrima11/whisper-small-nepali-openslr). No se ha divulgado el número de tokens de entrenamiento, la composición del dataset ni el proceso de ajuste (por ejemplo, si se usó RLHF o DPO). Tampoco se indica ninguna innovación técnica adicional más allá del fine-tune estándar sobre el modelo base.

## Capacidades

- Reconocimiento automático de voz en idioma nepalí, convirtiendo audio en texto.
- Especialización en nepalí, lo que puede ofrecer mejor precisión que modelos multilingües genéricos para este idioma.
- Al estar basado en Whisper, es capaz de procesar audio en formato de 30 segundos (aunque no se confirma en la ficha).
- No se menciona soporte para tool calling, agentes ni razonamiento multi-paso; el pipeline es exclusivamente de reconocimiento de voz.
- No se indica soporte de visión ni de audio de entrada más allá del habla.

## Casos de uso

- Transcripción de reuniones y conferencias en nepalí: el modelo puede convertir grabaciones de audio en texto para generar actas o subtítulos automáticos.
- Subtitulado automático de vídeos en nepalí: integrado en herramientas de edición de vídeo para generar subtítulos en tiempo real o de forma diferida.
- Asistentes de voz en aplicaciones móviles: permitir que aplicaciones de chat o asistentes personales comprendan comandos de voz en nepalí.
- Accesibilidad para personas con discapacidad auditiva: convertir audio en texto para facilitar la lectura de contenido hablado en nepalí.
- Análisis de llamadas de atención al cliente: transcribir grabaciones de llamadas en nepalí para análisis de calidad o extracción de información.
- Investigación lingüística: permitir la creación de corpus de texto nepalí a partir de audio, útil para estudios de fonética o procesamiento del lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como WER, MMLU, HumanEval, ni comparativas con otros modelos. Por tanto, no se pueden presentar datos cuantitativos de rendimiento.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Estimación basada en el tamaño de parámetros (241 millones) y en la experiencia con Whisper-small: para inferencia en FP16 se necesitan aproximadamente entre 1 y 2 GB de VRAM, por lo que es viable en GPUs de consumo como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060 o superiores.
- Para inferencia en CPU con llama.cpp o whisper.cpp, se puede ejecutar con un uso moderado de RAM, aunque la latencia será mayor.
- Opciones de despliegue: el modelo está en formato safetensors y se puede cargar con la librería Transformers de Hugging Face. También es compatible con herramientas como vLLM o TGI (aunque no se confirma) y con whisper.cpp si se convierte a formato GGUF (no incluido en el repositorio).
- No se conocen datos de latencia o throughput específicos.

## Comparativa con modelos similares

Dado que no se dispone de información de benchmarks ni de comparaciones oficiales, se puede comparar a nivel de características con otros modelos de ASR para nepalí o con el Whisper-small original. No se han encontrado modelos neón específicos adicionales en la información proporcionada. La siguiente tabla compara características generales:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Agrima11/agrima-whisper-final | 241.734.912 | No disponible | ne | MIT | safetensors |
| OpenAI Whisper-small | 244M | 30 segundos | 99 idiomas | MIT | safetensors |
| OpenAI Whisper-large-v3 | 1550M | 30 segundos | 99 idiomas | MIT | safetensors |

Nota: Whisper-large-v3 es significativamente mayor y cubre más idiomas, pero el modelo nepalí se centra en una lengua concreta. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos específicos, pero al ser un modelo entrenado en un idioma concreto puede presentar sesgos asociados a los acentos, dialectos o registros del nepalí presentes en el conjunto de entrenamiento.
- Riesgo de alucinación en la transcripción, especialmente en audio de baja calidad o con ruido, como ocurre con la mayoría de los modelos ASR.
- Limitación del idioma: solo está entrenado para nepalí, por lo que no reconoce otros idiomas.
- No se dispone de información sobre el conjunto de datos de entrenamiento, por lo que no se puede evaluar la cobertura de variantes regionales del nepalí.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar que el uso no infrinja derechos de los datos de entrenamiento originales (aunque no se conocen detalles).
- Al ser un modelo de tamaño pequeño (Whisper-small), puede tener menor precisión que modelos más grandes en audio muy complejo o con acentos muy particulares.

## Enlaces

- [Hugging Face - Agrima11/agrima-whisper-final](https://huggingface.co/Agrima11/agrima-whisper-final)
- [GitHub - openai/whisper (modelo base)](https://github.com/openai/whisper)
- [Hugging Face - OpenAI Whisper-large-v3 (referencia)](https://huggingface.co/openai/whisper-large-v3)
- [Introducing Whisper - OpenAI](https://openai.com/index/whisper/)
