# LlamaPal/NVIDIA-Nemotron-3.5-Bolt-E4B-UD-Q4_K_XL-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B es un modelo de lenguaje desarrollado por NVIDIA, descrito en la model card como un reentrenamiento del modelo Gemma 4 E4B de Google orientado a asistentes locales rápidos y a la adopción de personas o roles concretos ("personas"). Según el autor, está optimizado para seguir instrucciones y mantenerse centrado en la tarea a lo largo de conversaciones largas de ida y vuelta. Los datos de entrenamiento de NVIDIA alcanzan hasta mayo de 2026, de acuerdo con la información proporcionada.

La ficha que nos ocupa, sin embargo, no es el modelo original, sino una cuantización GGUF del mismo: `LlamaPal/NVIDIA-Nemotron-3.5-Bolt-E4B-UD-Q4_K_XL-GGUF`, publicada por LlamaPal. Se trata de una copia sin modificar del archivo `NVIDIA-Nemotron-3.5-Bolt-E4B-UD-Q4_K_XL.gguf` procedente del repositorio `unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF`, con el mismo hash SHA-256, empaquetada para su descarga directa desde la aplicación LlamaPal en Android.

El interés de esta publicación es práctico: ofrece un artefacto listo para ejecutarse en el móvil de forma totalmente offline, sin cuenta ni conexión, con un tamaño de repositorio de 5,1 GB. El modelo cuenta con 7.518.069.290 parámetros totales según los datos de safetensors del modelo base, aunque la información disponible no aclara la distribución de parámetros activos ni la arquitectura interna exacta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura; el modelo base es un reentrenamiento de Gemma 4 E4B) |
| Parámetros totales | 7.518.069.290 (según safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_XL (Unsloth Dynamic, UD), GGUF |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo (tipo de transformer, mecanismos de atención, uso de MoE u otras innovaciones). La model card únicamente indica que se trata de un reentrenamiento de NVIDIA sobre Google Gemma 4 E4B, orientado a asistentes locales y a la adopción de personas, con datos de entrenamiento que llegan hasta mayo de 2026. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Respecto a la cuantización, esta ficha corresponde a una versión Q4_K_XL de tipo Unsloth Dynamic (UD), generada con imatrix según las etiquetas del repositorio. El archivo GGUF resultante ocupa 5,1 GB y es una copia byte a byte del publicado por unsloth en el commit `b738967d6da3`, con hash SHA-256 `84ff34f5834b929043f5ae74799e8d562d4056998f6a5923ceb44831e8ad84d6`. El autor de esta ficha no aporta información adicional sobre el proceso de cuantización más allá de identificarla como UD Q4_K_XL.

## Capacidades

- Generación de texto conversacional, con especial énfasis en seguir instrucciones y mantener el hilo en conversaciones multi-turno largas, según la model card.
- Orientación a asistentes locales y a la adopción de personas o roles concretos.
- Ejecución offline en dispositivos Android a través de la aplicación LlamaPal.
- Compatibilidad con llama.cpp y con cualquier aplicación construida sobre él, al ser un GGUF estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente personal offline en Android: el modelo se descarga una vez en la aplicación LlamaPal y funciona sin conexión ni cuenta, de modo que ninguna entrada del usuario sale del dispositivo. Es adecuado para consultas cotidianas y conversaciones privadas.
- Chat con personas o roles definidos: gracias a su orientación a la adopción de personas y a mantenerse en el papel durante conversaciones largas, encaja en aplicaciones de compañía conversacional o simulación de personajes.
- Asistencia en entornos sin conectividad: en aviones, zonas rurales o situaciones de red restringida, el GGUF puede cargarse en llama.cpp o en apps compatibles para tareas de redacción y resumen local.
- Prototipado rápido de aplicaciones móviles de IA: al ser un GGUF estándar de 5,1 GB, sirve como base para desarrolladores que quieran integrar un modelo conversacional en una app Android sin depender de una API en la nube.
- Privacidad y cumplimiento: para casos en los que no se permite enviar datos a terceros (notas personales, borradores sensibles), la inferencia local elimina la exposición de datos a servidores externos.
- Evaluación de cuantizaciones en dispositivo: útil para comparar el comportamiento de una cuantización Q4_K_XL frente a otras variantes del mismo modelo base en hardware móvil, midiendo latencia y calidad de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo GGUF ocupa 5,1 GB, por lo que se necesita al menos esa cantidad de memoria libre para cargarlo, más el espacio adicional para el contexto y el estado de la aplicación. En la práctica, un dispositivo con 6-8 GB de RAM disponible es el mínimo razonable; no se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. El caso de uso declarado es Android con la app LlamaPal, que ejecuta el modelo en el propio dispositivo.
- ¿Cabe en GPU de consumo? No hay datos específicos. Por tamaño (5,1 GB en Q4_K_XL), podría caber en GPUs de consumo con 8 GB o más de VRAM, pero no se ha verificado en la información disponible.
- Opciones de despliegue: llama.cpp y cualquier aplicación construida sobre él; la app LlamaPal para Android. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B (esta ficha, Q4_K_XL) | 7.518.069.290 totales | no disponible | GGUF | OpenMDW 1.1 | Hugging Face (LlamaPal, mirror de unsloth) |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (modelo base) | 7.518.069.290 totales | no disponible | safetensors/BF16 | OpenMDW 1.1 | Hugging Face (nvidia) |
| unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | 7.518.069.290 totales | no disponible | GGUF (varias cuantizaciones) | OpenMDW 1.1 | Hugging Face (unsloth) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como modelo generativo de texto, es susceptible de producir contenido incorrecto, pero no se aportan datos específicos.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Restricciones de licencia: la licencia es OpenMDW 1.1, etiquetada como "other" en Hugging Face. Es imprescindible revisar el texto completo en el enlace de licencia antes de un uso comercial, ya que la model card no resume las condiciones.
- Esta ficha es un mirror sin modificar de un archivo de unsloth; no añade garantías ni soporte por parte de LlamaPal más allá de la distribución del archivo.
- El uso declarado es en dispositivo móvil; el rendimiento en otros entornos (servidor, escritorio) no está documentado.
- La cuantización Q4_K_XL implica pérdida de precisión respecto al modelo BF16 original; no se han publicado evaluaciones de la degradación de calidad.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/LlamaPal/NVIDIA-Nemotron-3.5-Bolt-E4B-UD-Q4_K_XL-GGUF
- Repositorio origen de la cuantización (unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base (NVIDIA, BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
