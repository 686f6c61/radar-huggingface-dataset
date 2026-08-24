# innkl24/shan-stt-v1

## Resumen
El modelo `innkl24/shan-stt-v1` es un sistema de reconocimiento automático de voz (STT) desarrollado por el usuario InnKL, especializado en la lengua shan (tai), hablada en regiones de Myanmar, Tailandia y China. Aunque la model card apenas contiene información, el etiquetado en Hugging Face lo clasifica dentro de la familia Whisper, lo que sugiere un fine-tuning sobre una arquitectura basada en transformer encoder-decoder de OpenAI. Con 241,7 millones de parámetros, se sitúa en el rango de Whisper small/medium, lo que permite su ejecución en hardware de consumo moderado.

Este modelo resuelve un problema concreto: la falta de sistemas de transcripción automática para lenguas minoritarias con escasos recursos lingüísticos. La relevancia actual radica en que la mayoría de los modelos STT comerciales ignoran idiomas como el shan, y este proyecto aporta una alternativa de código abierto con licencia MIT, lo que facilita su integración en aplicaciones de accesibilidad, documentación y preservación lingüística. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni sobre la metodología de ajuste fino, por lo que la información disponible es limitada.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, sin confirmar variante exacta) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de Whisper: ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente shan, según el nombre y el perfil del autor) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura no está documentada en la model card, pero el tag `whisper` y el número de parámetros (241,7 M) apuntan a un modelo de la familia Whisper, concretamente a un tamaño similar al `small` (244 M). Whisper emplea un transformer encoder-decoder entrenado con supervisión débil sobre 680 000 horas de audio en múltiples idiomas, aunque en este caso el ajuste fino se habrá realizado sobre datos específicos de shan. No se dispone de información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco hay datos sobre innovaciones técnicas adicionales (como decodificación especulativa o attention lineal) en el repositorio.

## Capacidades
- Reconocimiento de voz a texto en el idioma shan, presumiblemente a partir de audio en diversos entornos.
- Al estar basado en Whisper, es probable que soporte la transcripción de audio con ruido de fondo y acentos variados, aunque no se han publicado pruebas específicas.
- No se indica soporte para tool calling, agentes, visión, ni otros modos de interacción. Es un modelo de STT puro.
- Capacidades multilingües: no se especifican; el nombre sugiere un enfoque monolingüe en shan.

## Casos de uso
- Transcripción de entrevistas y testimonios orales en shan para documentación histórica y cultural.
- Subtitulado automático de vídeos y podcasts en shan, facilitando el acceso a contenido audiovisual.
- Asistente de accesibilidad para personas con discapacidad auditiva que hablan shan, convirtiendo audio en texto en tiempo real.
- Análisis de contenido en medios de comunicación locales (radio, televisión) para generar resúmenes o bases de datos de noticias.
- Herramienta de aprendizaje de idiomas: práctica de pronunciación y transcripción de ejercicios orales.
- Integración en sistemas de transcripción médica o legal en regiones donde se habla shan, siempre que se verifique la precisión con datos clínicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No existen datos de WER (tasa de error de palabra), ni comparaciones con otros modelos STT en el repositorio de Hugging Face.

## Requisitos de hardware
- VRAM estimada: con 241,7 M de parámetros, en FP32 necesita aproximadamente 1 GB de memoria, en FP16 alrededor de 0,5 GB. Con cuantización INT8 podría reducirse a ~250 MB.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores, así como en CPU con suficiente RAM (al menos 4 GB).
- En una RTX 4090 o A100, la inferencia sería muy rápida (segundos para un audio de 30 s), pero no se han medido latencias específicas.
- Opciones de despliegue: compatible con frameworks que cargan modelos Whisper, como OpenAI Whisper, faster-whisper, o a través de Hugging Face Transformers. También puede exportarse a ONNX para inferencia en CPU.
- No se han publicado mediciones de throughput ni de latencia.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo para comparar con alternativas. Como referencia de tamaño, se puede comparar con otros modelos Whisper de la misma familia:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| shan-stt-v1 | 241,7 M | no disponible | MIT | Hugging Face |
| Whisper small (OpenAI) | 244 M | 30 s audio | MIT | OpenAI, Hugging Face |
| Whisper medium (OpenAI) | 769 M | 30 s audio | MIT | OpenAI, Hugging Face |

La diferencia clave es que `shan-stt-v1` está especializado en el idioma shan, mientras que los Whisper genéricos no lo soportan de forma nativa. No se pueden comparar métricas de rendimiento porque no hay benchmarks públicos.

## Limitaciones y advertencias
- No se ha publicado información sobre sesgos, alucinaciones o errores específicos del modelo. Al ser un modelo de nicho con pocas descargas (2), es probable que el conjunto de entrenamiento sea limitado y que la robustez sea menor que la de modelos multilingües de gran escala.
- Riesgo de alucinación: como todo STT, puede generar texto incorrecto cuando el audio es ruidoso o contiene vocabulario fuera del dominio.
- Limitaciones de contexto: el modelo hereda de Whisper la limitación de ventanas de 30 segundos de audio por pasada, lo que requiere segmentación para audios largos.
- Idiomas: no se confirma oficialmente si solo soporta el shan o si también transcribe otros idiomas. Se debe probar antes de usarlo en producción.
- Licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías de soporte o mantenimiento.
- No se ha especificado si el modelo funciona correctamente con audio de baja calidad o con acentos regionales del shan.

## Enlaces
- [HuggingFace - innkl24/shan-stt-v1](https://huggingface.co/innkl24/shan-stt-v1)
- [Perfil de HuggingFace del autor](https://huggingface.co/innkl24)
- [Repositorio de modelos ONNX (referencia general)](https://github.com/onnx/models)
- [Repositorio de Whisper de OpenAI](https://github.com/openai/whisper)
