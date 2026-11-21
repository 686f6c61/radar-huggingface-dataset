# Etherll/voice-isolator-GGUF

## Resumen

Voice Isolator v1 GGUF es una conversión al formato GGUF del modelo Voice Isolator v1 de Inworld, un sistema de aislamiento y mejora de voz (speech enhancement) diseñado para separar la voz humana del ruido de fondo en grabaciones de audio. Esta versión, publicada por el usuario Etherll, no modifica los pesos originales (se mantienen en F32) y añade la configuración y especificación del modelo embebidas en cada archivo, con el objetivo de hacerlo ejecutable directamente en audio.cpp.

El modelo resuelve un problema clásico en producción de audio: limpiar pistas de voz contaminadas por ruido ambiental, reverberación o fuentes sonoras no deseadas, sin requerir un pipeline externo de procesamiento de señal. Con 64.047.112 parámetros (aproximadamente 64 millones), es un modelo compacto que puede ejecutarse en CPU y en GPU de gama consumer, lo que lo hace adecuado para aplicaciones en tiempo real o en dispositivos con recursos limitados.

La relevancia actual de esta conversión radica en su integración con audio.cpp, un runtime de inferencia de audio que busca ofrecer una alternativa ligera a los frameworks de deep learning tradicionales. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque la información disponible sobre idiomas, contexto y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de speech enhancement; pesos F32) |
| Parametros totales | 64.047.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (los archivos publicados son F32; no se listan otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos variantes: realtime y offline) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base `inworld/voice-isolator`. Se trata de un modelo de mejora de voz (speech enhancement) orientado a la separación de voz y ruido, con 64 millones de parámetros. La conversión publicada mantiene los pesos en precisión F32 sin alterarlos y embebe en cada archivo GGUF la configuración y la especificación del modelo, de modo que el runtime audio.cpp pueda cargarlo de forma autocontenida.

Se ofrecen dos checkpoints diferenciados: `denoiser_realtime.safetensors`, orientado a streaming o procesamiento offline sobre un archivo completo, y `denoiser.safetensors`, orientado exclusivamente a procesamiento offline. No se dispone de información sobre el número de tokens de audio, la composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Aislamiento de voz: separación de la voz humana respecto al ruido de fondo en señales de audio.
- Mejora de voz (speech enhancement): limpieza de grabaciones contaminadas por ruido ambiental o reverberación.
- Procesamiento en streaming: la variante `realtime` permite procesar audio de forma continua.
- Procesamiento offline: ambas variantes permiten procesar un archivo completo.
- Ejecución mediante audio.cpp: integración con el runtime de inferencia de audio indicado por el autor.
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multilingües, visión, audio generativo ni modos de razonamiento.

## Casos de uso

- Limpieza de pistas de voz en producción audiovisual: usar la variante offline para procesar archivos completos de entrevistas o podcasts y eliminar ruido de fondo antes de la edición.
- Preprocesado para ASR: aplicar el modelo antes de un sistema de reconocimiento de voz para reducir la tasa de error en entornos ruidosos, aprovechando su tamaño compacto para ejecutarse en el mismo host.
- Videollamadas y conferencias en tiempo real: la variante realtime permite filtrar el ruido del micrófono en streaming con baja latencia, ejecutándose en CPU o GPU consumer.
- Grabación en dispositivos con recursos limitados: sus 64 millones de parámetros y el formato GGUF permiten desplegarlo en portátiles o equipos sin GPU dedicada mediante audio.cpp.
- Postproducción de audio para creadores de contenido: limpiar grabaciones domésticas con ruido de ventiladores, tráfico o teclado antes de publicarlas.
- Investigación en procesamiento de audio: servir como referencia reproducible para comparar pipelines de speech enhancement en formato GGUF frente a implementaciones en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 64 millones de parámetros en F32, el peso de los archivos ronda los 256 MB (el repositorio completo ocupa 0,5 GB con dos variantes), por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1 GB de VRAM libre es suficiente, incluidas RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer actuales.
- Opciones de despliegue: audio.cpp (runtime indicado por el autor); no se confirma soporte en vLLM, llama.cpp, Ollama o TGI, dado que es un modelo de audio y no de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Etherll/voice-isolator-GGUF | 64.047.112 | no disponible | Apache-2.0 | GGUF | Hugging Face |
| inworld/voice-isolator (base) | 64.047.112 (mismo modelo) | no disponible | Apache-2.0 | safetensors | Hugging Face |
| Alternativas de speech enhancement | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La información sobre arquitectura, idiomas, contexto y benchmarks no está disponible; cualquier evaluación de calidad requiere pruebas propias.
- Al ser un modelo de mejora de voz, puede introducir artefactos o distorsión en la voz procesada, especialmente en condiciones de ruido extremo.
- No se documentan sesgos conocidos ni el comportamiento del modelo con acentos, idiomas o tipos de voz distintos de los del dataset de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE del repositorio upstream.
- La conversión GGUF está vinculada al runtime audio.cpp; no se garantiza compatibilidad con otros motores de inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Los archivos publicados son F32; no se ofrecen cuantizaciones de menor precisión que reduzcan aún más el uso de memoria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Etherll/voice-isolator-GGUF
- Modelo base: https://huggingface.co/inworld/voice-isolator
- Checkpoint base referenciado: https://huggingface.co/inworld/voice-isolator/tree/9b0285b3fe8403aa8e2f1dbb2165a80a4294c970
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
