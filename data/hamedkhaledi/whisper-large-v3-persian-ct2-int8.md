# hamedkhaledi/whisper-large-v3-persian-ct2-int8

## Resumen

El modelo `hamedkhaledi/whisper-large-v3-persian-ct2-int8` es una conversión del sistema de reconocimiento automático de voz (ASR) Whisper Large V3 de OpenAI al formato CTranslate2 con cuantización de 8 bits (INT8). El autor, hamedkhaledi, publica esta versión optimizada para facilitar el despliegue de transcripción de audio en persa (farsi) con menores requisitos de memoria y mayor velocidad de inferencia en comparación con el modelo original en punto flotante. Aunque el nombre sugiere una adaptación al persa, la model card no documenta ningún proceso de fine-tuning; se trata, por tanto, de una conversión técnica del modelo base.

La arquitectura subyacente es la de Whisper Large V3, un transformer encoder-decoder con aproximadamente 1550 millones de parámetros, diseñado para procesar audio de hasta 30 segundos por ventana. La conversión a CTranslate2 e INT8 reduce el tamaño del repositorio a 1,6 GB, lo que lo hace viable para entornos con recursos limitados. Este modelo se integra con el ecosistema faster-whisper, lo que permite su uso en aplicaciones de transcripción en tiempo real o por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Large V3 (encoder-decoder transformer) |
| Parametros totales | no disponible (el modelo base tiene 1550M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base procesa ventanas de 30 s de audio) |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | fa (persa) |
| Licencia | no disponible |
| Formato de pesos | CTranslate2 (binario propio) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Large V3 de OpenAI, un transformer encoder-decoder entrenado con 680 000 horas de audio débilmente supervisado en múltiples idiomas. La versión aquí presentada no incorpora ningún entrenamiento adicional documentado; se trata de una conversión del modelo original al formato CTranslate2 con cuantización INT8, realizada mediante las herramientas de conversión de faster-whisper. Esta conversión reduce el tamaño de los pesos y acelera la inferencia en CPU y GPU, manteniendo una precisión cercana a la del modelo en FP16. No se especifican detalles sobre el dataset de entrenamiento ni sobre técnicas de alineamiento como RLHF o DPO, ya que no se ha realizado fine-tuning.

## Capacidades

- Transcripción de audio en persa (farsi) con alta precisión, heredada del modelo Whisper Large V3.
- Reconocimiento de voz automático (ASR) para archivos de audio y flujos en tiempo real.
- Soporte para múltiples tareas de audio, como traducción a inglés (aunque el modelo está etiquetado solo para persa, la arquitectura base lo permite).
- Integración con la librería faster-whisper, que ofrece decodificación optimizada y gestión de lotes.
- No se documentan capacidades adicionales como tool calling, agentes o visión, ya que es un modelo puramente de audio.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de audio en persa y generar texto con marcas de tiempo, gracias a la eficiencia de CTranslate2 en CPU.
- Subtitulado automático de vídeos: al convertir el audio a texto, se pueden generar subtítulos en persa para plataformas de vídeo, con una latencia aceptable en hardware moderado.
- Asistentes de voz para aplicaciones de atención al cliente: la cuantización INT8 permite ejecutar el modelo en servidores con GPUs de gama media, respondiendo a comandos de voz en persa.
- Archivado y búsqueda de contenido audiovisual: transcribir grandes volúmenes de audio para indexación y búsqueda posterior, aprovechando el procesamiento por lotes de faster-whisper.
- Herramientas de accesibilidad: conversión de contenido hablado en persa a texto para personas con discapacidad auditiva, desplegable en dispositivos con recursos limitados.
- Investigación lingüística: análisis de corpus orales en persa, donde la transcripción automática reduce el trabajo manual y permite procesar cientos de horas de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER (Word Error Rate) o comparativas con otros modelos ASR en persa.

## Requisitos de hardware

- Tamaño del repositorio: 1,6 GB, lo que sugiere que los pesos en INT8 ocupan aproximadamente 1,5 GB, más overhead de ejecución.
- VRAM estimada para inferencia: alrededor de 2-3 GB en GPU, dependiendo del tamaño de lote y la longitud del audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También funciona en CPU con 8 GB de RAM.
- Compatible con consumer GPUs: sí, especialmente en cuantización INT8.
- Opciones de despliegue: faster-whisper (Python), CTranslate2 directamente, o servidores de inferencia como Triton Inference Server.
- Latencia y throughput: no se proporcionan datos específicos, pero la cuantización INT8 suele ofrecer una aceleración de 2-4x frente a FP16 en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| hamedkhaledi/whisper-large-v3-persian-ct2-int8 | no disponible (base 1550M) | no disponible (30 s base) | INT8 | no disponible | CTranslate2 |
| AmirMohseni/whisper-large-v3-persian-ct2-int8 | no disponible (base 1550M) | no disponible (30 s base) | INT8 | no disponible | CTranslate2 |
| openai/whisper-large-v3 | 1550M | 30 s | FP16/FP32 | MIT | PyTorch, safetensors |

Ambos modelos persas en CT2 INT8 son conversiones del mismo modelo base y presentan características idénticas en cuanto a arquitectura y cuantización. La diferencia principal radica en el autor y posiblemente en la configuración de conversión, aunque no se documentan diferencias. El modelo original de OpenAI ofrece mayor flexibilidad de uso (licencia MIT) y soporte nativo en Transformers, pero requiere más recursos.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o comportamientos específicos en persa; el modelo hereda las limitaciones del Whisper Large V3, que puede tener un rendimiento inferior en dialectos o acentos poco representados.
- Riesgo de alucinación en transcripciones: como todo modelo ASR, puede generar texto incorrecto en audio con ruido o solapamiento de voces.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor o verificar la licencia del modelo base (MIT) antes de desplegarlo en producción.
- El modelo solo está etiquetado para persa; aunque la arquitectura base soporta otros idiomas, no se garantiza su rendimiento fuera del persa.
- Al ser una conversión sin fine-tuning, la precisión en persa puede ser inferior a la de modelos específicamente entrenados con datos persas, como los basados en Common Voice.

## Enlaces

- [HuggingFace: hamedkhaledi/whisper-large-v3-persian-ct2-int8](https://huggingface.co/hamedkhaledi/whisper-large-v3-persian-ct2-int8)
- [HuggingFace: openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- [HuggingFace: AmirMohseni/whisper-large-v3-persian-ct2-int8](https://huggingface.co/AmirMohseni/whisper-large-v3-persian-ct2-int8)
- [GitHub: openai/whisper](https://github.com/openai/whisper)
- [Discusión sobre large-v3 en GitHub](https://github.com/openai/whisper/discussions/1762)
- [Modelo whisper-large-v3-persian-common-voice-17 en AIBase](https://model.aibase.com/en/models/details/1915730736566657026)
