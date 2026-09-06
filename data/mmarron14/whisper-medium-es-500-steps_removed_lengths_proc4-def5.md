# mmarron14/whisper-medium-es-500-steps_removed_lengths_proc4-def5

## Resumen

El modelo `mmarron14/whisper-medium-es-500-steps_removed_lengths_proc4-def5` es un fine-tuning de Whisper medium para transcripción de audio en español, desarrollado por el usuario mmarron14. Whisper es una arquitectura encoder-decoder de tipo transformer entrenada originalmente por OpenAI para reconocimiento de voz multilingüe y traducción. Este modelo concreto se ha ajustado durante 500 pasos de entrenamiento sobre un conjunto de datos en español, aunque la model card no proporciona detalles sobre el dataset, el proceso de preprocesamiento ni los resultados obtenidos.

El modelo tiene 763.857.920 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. No se han publicado descargas ni evaluaciones que permitan valorar su rendimiento real. Su relevancia radica en ser una opción específica para español dentro del ecosistema Whisper, pero la falta de documentación obliga a tratarlo con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 763.857.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (inferido del nombre del modelo; no confirmado en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la estándar de Whisper medium: un transformer encoder-decoder con 24 capas en el encoder y 24 en el decoder, dimensión oculta de 1024 y 16 cabezas de atención. El modelo original de OpenAI fue entrenado con 680.000 horas de audio multilingüe, pero este fine-tuning se ha realizado específicamente para español. El nombre del modelo indica 500 pasos de entrenamiento y un preprocesado con eliminación de longitudes (`removed_lengths`), sin que se especifique la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Transcripción de audio en español, aprovechando la capacidad base de Whisper para reconocimiento de voz.
- Posible traducción de audio español a inglés, aunque no se confirma en la ficha del modelo.
- Procesamiento de audio en ventanas de 30 segundos, heredado de la arquitectura original.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades de visión ni de texto generativo más allá de la salida de transcripción.
- No se especifican capacidades multilingües más allá del español.

## Casos de uso

- Transcripción de reuniones en español: el modelo puede convertir grabaciones de audio de reuniones a texto, facilitando la generación de actas y búsquedas internas.
- Subtitulación automática de vídeos: adecuado para generar subtítulos en español para contenido audiovisual, siempre que el audio no contenga ruido excesivo.
- Accesibilidad para personas con discapacidad auditiva: permite transcribir contenido hablado en español en tiempo real o en diferido para entornos educativos y corporativos.
- Análisis de llamadas de atención al cliente: puede transcribir conversaciones telefónicas en español para posterior análisis de sentimiento o extracción de intenciones.
- Conversión de notas de voz a texto: útil en aplicaciones móviles y de productividad para usuarios que dictan mensajes en español.
- Documentación de entrevistas y podcasts: permite transcribir entrevistas en español para su publicación, indexación o análisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en fp16, 1 GB en int8 y 3 GB en fp32, basado en el tamaño de los pesos.
- GPU recomendadas: RTX 3060 o superior, A10, A100 o H100 para procesamiento por lotes.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090.
- Opciones de despliegue: HuggingFace Transformers, whisper.cpp, y otros frameworks de inferencia de audio compatibles con safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmarron14/whisper-medium-es-500-steps_removed_lengths_proc4-def5 | 763.857.920 | 30 s de audio | Español (inferido) | Apache 2.0 | HuggingFace |
| openai/whisper-medium | 769.000.000 | 30 s de audio | Multilingüe | MIT | HuggingFace |
| mmarron14/whisper-medium-cv17-es-500-steps | No disponible | 30 s de audio | Español (inferido) | Apache 2.0 | HuggingFace / FriendliAI |

La comparativa se basa en datos disponibles públicamente. El modelo original de Whisper medium tiene una licencia MIT y soporta múltiples idiomas, mientras que este fine-tuning se centra en español y mantiene la licencia Apache 2.0. No se dispone de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- La model card no incluye descripción del entrenamiento, dataset ni métricas, lo que dificulta evaluar su calidad real.
- Whisper es conocido por alucinar contenido cuando el audio es silencioso o tiene ruido de fondo, especialmente en fragmentos cortos.
- El modelo solo ha sido entrenado durante 500 pasos, lo que puede implicar un ajuste insuficiente para dominios específicos.
- No se confirma el soporte para otros idiomas distintos del español.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre sesgos o limitaciones es un riesgo para aplicaciones críticas.
- No se han publicado resultados de benchmarks, por lo que no se puede garantizar un rendimiento comparable al de Whisper original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmarron14/whisper-medium-es-500-steps_removed_lengths_proc4-def5
- Modelo similar en FriendliAI: https://friendli.ai/models/mmarron14/whisper-medium-cv17-es-500-steps
- Modelo relacionado en HuggingFace: https://huggingface.co/mmarron14/whisper-medium-es-500-steps_removed_lengths_sin-proc-def5
