# faiisu/moss-asr-th-finetuned-subway

## Resumen
El modelo `faiisu/moss-asr-th-finetuned-subway` es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla MOSS, publicado en HuggingFace por el usuario faiisu bajo licencia Apache 2.0. Se trata de un modelo de aproximadamente 908 millones de parámetros (908.513.280 según los pesos en safetensors) orientado a la transcripción y diarización de audio, tal y como indica la etiqueta de arquitectura `moss_transcribe_diarize`. El nombre sugiere un ajuste específico para tailandés ("th") en un dominio concreto ("subway"), probablemente grabaciones de megafonía o anuncios en el metro.

La relevancia de este modelo es limitada y muy específica: se trata de un fine-tuning de nicho, con cero descargas y cero likes en el momento de la consulta, y con una model card prácticamente vacía que solo declara la licencia. No hay información publicada sobre el conjunto de datos de ajuste, los idiomas soportados oficialmente ni los resultados de evaluación.

A pesar de su reducido tamaño (menos de mil millones de parámetros), la presencia de código personalizado (`custom_code`) implica que su carga requiere confiar en la implementación remota del autor, lo que añade un riesgo operativo para su uso en producción. Es un modelo que debe evaluarse con cautela y validación empírica propia antes de considerarlo para cualquier flujo de trabajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `moss_transcribe_diarize` (transcripción y diarización de audio, según etiqueta del repo) |
| Parámetros totales | 908.513.280 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere tailandés, sin confirmación oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de la etiqueta `moss_transcribe_diarize`, que apunta a un modelo de audio con capacidad de transcripción y diarización (identificación de hablantes). El recuento de parámetros (908,5 M) es coherente con un encoder de audio de tamaño medio combinado con un decoder de texto, pero no se especifica la composición exacta ni el tipo de atención.

No se han publicado datos sobre el volumen de tokens o horas de audio empleadas en el ajuste fino, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio tiene un tamaño de 1,8 GB y contiene pesos en safetensors junto con código personalizado, lo que sugiere que el modelo depende de una implementación propia del autor para su ejecución.

## Capacidades
- Transcripción de audio a texto (ASR), según la etiqueta de arquitectura del repositorio.
- Diarización de hablantes (identificación de quién habla en cada segmento), según la misma etiqueta.
- Especialización probable en tailandés y en el dominio de anuncios o grabaciones de metro ("subway"), inferida del nombre del modelo, no confirmada por documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no hay lista oficial de idiomas.
- Capacidades especiales (modo thinking, visión, audio adicional): no disponibles.

## Casos de uso
- Transcripción de megafonía en estaciones de metro: el modelo podría transcribir anuncios pregrabados o en directo en tailandés, aprovechando su ajuste específico al dominio "subway". Requiere validación previa con audio real de la estación.
- Generación de subtítulos para vídeos de transporte público: útil para accesibilidad en contenidos grabados en estaciones o trenes, siempre que la calidad de transcripción se confirme empíricamente.
- Análisis de calidad de anuncios: comparar la transcripción automática con el guion oficial para detectar anomalías en la emisión de mensajes pregrabados.
- Diarización en grabaciones de atención al viajero: separar las intervenciones de operadores y usuarios en cabinas o puntos de información, si la diarización funciona en audio real.
- Prototipos de investigación en ASR de dominio específico: servir como punto de partida para experimentos de adaptación al dominio con datasets propios, dado su tamaño manejable y licencia permisiva.
- Evaluación comparativa de fine-tunings de MOSS: usar este modelo como referencia en estudios sobre el impacto del ajuste fino en dominios acústicamente ruidosos como el metro.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 1,8 GB solo para pesos (908,5 M de parámetros × 2 bytes), más overhead de activaciones y del código personalizado; en la práctica, se recomienda al menos 4-6 GB de VRAM.
- En cuantización de 8 bits, los pesos ocuparían en torno a 0,9 GB; en 4 bits, alrededor de 0,45 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería poder cargar el modelo; para producción con concurrencia, se recomiendan A10, L4 o A100.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 6 GB o más de VRAM, sujeto a verificación.
- Opciones de despliegue: no se documentan; al requerir `custom_code`, es probable que necesite `transformers` con `trust_remote_code=True`. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y estos últimos no soportan modelos de audio con código personalizado de forma genérica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| faiisu/moss-asr-th-finetuned-subway | 908,5 M | no disponible | no disponible (probable tailandés) | Apache 2.0 | HuggingFace, 0 descargas |
| Whisper large-v3 (OpenAI) | 1.550 M | 30 s de audio por ventana | 99 idiomas | MIT | Ampliamente disponible |
| Whisper medium (OpenAI) | 769 M | 30 s de audio por ventana | 99 idiomas | MIT | Ampliamente disponible |
| MOSS ASR base (modelo original) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparación con Whisper es la más natural por tamaño y tarea, pero debe tomarse con cautela: Whisper es un modelo genérico multilingüe con evaluación pública extensa, mientras que este fine-tuning carece de benchmarks y de documentación sobre idiomas. No se dispone de datos para comparar rendimiento numérico.

## Limitaciones y advertencias
- Model card prácticamente vacía: solo declara la licencia, sin información sobre datos de entrenamiento, evaluación o uso previsto.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Requiere código personalizado (`custom_code`): es necesario confiar en la implementación del autor y usar `trust_remote_code=True`, lo que implica riesgos de seguridad y de mantenimiento.
- Riesgo de alucinación en la transcripción: sin benchmarks, no se puede estimar la tasa de errores de palabra (WER) ni el comportamiento en audio ruidoso.
- Idiomas no confirmados: el sufijo "th" sugiere tailandés, pero no hay documentación oficial; no debe asumirse soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo puede incorporar dependencias o código con otras condiciones no declaradas.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó el mismo día (2 de noviembre de 2026), sin historial posterior.
- Para producción, se recomienda validar con un conjunto propio de audio del dominio y comparar contra alternativas consolidadas como Whisper antes de adoptarlo.

## Enlaces
- [HuggingFace: faiisu/moss-asr-th-finetuned-subway](https://huggingface.co/faiisu/moss-asr-th-finetuned-subway)
