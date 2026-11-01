# ASRISEx/parakeet-tdt_ctc-0.6b-ja-gguf

## Resumen

Parakeet TDT-CTC 0.6B Japanese es un modelo de reconocimiento automático del habla (ASR) para japonés, desarrollado originalmente por NVIDIA y convertido a formato GGUF por el usuario ASRISEx. Se trata de una adaptación del modelo `nvidia/parakeet-tdt_ctc-0.6b-ja`, que emplea la arquitectura FastConformer con una cabeza híbrida TDT (Token-and-Duration Transducer) y CTC. El modelo resuelve la transcripción de audio a texto en japonés con un tamaño compacto de 619 millones de parámetros, lo que lo hace viable en hardware de consumo.

La conversión a GGUF está pensada para el motor `transcribe.cpp`, utilizado por aplicaciones como Handy y Koeboard. Esta versión elimina la cabeza CTC auxiliar y conserva únicamente la cabeza TDT, siguiendo el patrón de otras conversiones de modelos Parakeet híbridos en dicho motor. El resultado es un único archivo cuantizado en Q8_0 de 733 MB que reproduce la salida del modelo original en F32.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de NVIDIA en entornos locales sin depender de CUDA ni de infraestructura de servidor, gracias a la cuantización y al soporte de Metal en Apple Silicon. No obstante, el modelo está especializado exclusivamente en japonés y no dispone de benchmarks publicados sobre conjuntos de datos abiertos en esta conversión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabeza híbrida TDT/CTC (en esta conversión solo TDT) |
| Parametros totales | 619.362.950 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, ventana de audio no especificada) |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (GGML) |

## Arquitectura y entrenamiento

El modelo original emplea la arquitectura FastConformer, una variante eficiente del Conformer con atención subsampleada que reduce el coste computacional en secuencias de audio largas. Sobre el encoder se sitúa una cabeza híbrida que combina TDT (Token-and-Duration Transducer) y CTC. La conversión a GGUF conserva únicamente la cabeza TDT y descarta la CTC auxiliar, tal y como se hace con otros modelos Parakeet híbridos en `transcribe.cpp`.

Según la model card, el modelo original fue entrenado sobre ReazonSpeech v2.0, un corpus de audio japonés. No se especifican en la información disponible el número de tokens de audio, la composición detallada del dataset ni si hubo etapas de ajuste fino con RLHF o DPO. La conversión se realizó con el script `convert-parakeet.py` de `transcribe.cpp`, añadiendo un perfil específico para esta variante con un vocabulario SentencePiece japonés de 3.072 tokens, y se cuantizó desde F32 con `transcribe-quantize --quant Q8_0`.

## Capacidades

- Transcripción de audio a texto en japonés (ASR).
- Ejecución local mediante el motor `transcribe.cpp`.
- Soporte de aceleración por Metal en Apple Silicon (probado en Apple M4).
- Salida idéntica a la del modelo F32 original tras la cuantización Q8_0.
- Integración con aplicaciones de dictado y transcripción como Handy y Koeboard.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado por voz en japonés en escritorio: el modelo puede integrarse en aplicaciones como Koeboard o Handy para convertir voz en texto en tiempo real, gracias a su tamaño compacto y a la latencia baja medida en Apple M4 (0,22 s para un clip de 7,8 s).
- Transcripción de reuniones y notas de voz: al ejecutarse localmente con `transcribe.cpp`, permite procesar audio confidencial sin enviarlo a servicios en la nube.
- Subtitulado de contenido audiovisual en japonés: la velocidad de inferencia observada hace viable la generación de subtítulos en lotes sobre clips cortos.
- Asistentes de voz embebidos: el archivo Q8_0 de 733 MB cabe en dispositivos con recursos limitados, lo que permite desplegar ASR japonés en entornos sin GPU dedicada.
- Investigación en ASR japonés: sirve como referencia cuantizada para comparar el impacto de la cuantización Q8_0 frente al modelo F32 original.
- Prototipado de pipelines de transcripción: al estar en formato GGUF y ser compatible con `transcribe.cpp`, facilita pruebas rápidas en CI o entornos de desarrollo sin dependencias de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que NVIDIA reporta aproximadamente un 9 % de CER en JSUT basic5000 para el modelo original, pero no se ha ejecutado ninguna evaluación sobre un conjunto de datos público para esta conversión GGUF. El único dato de rendimiento medido es la latencia: 0,22 segundos para un clip japonés de 7,8 segundos en un Apple M4 con Metal.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el archivo Q8_0 ocupa 733 MB, por lo que la huella en memoria es del orden de 1 GB o inferior en inferencia.
- GPU recomendadas: no se especifican; la model card solo documenta pruebas en Apple M4 con Metal.
- Compatibilidad con GPU de consumo: el tamaño del archivo sugiere que cabe en GPU de consumo, pero no se han publicado pruebas en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: `transcribe.cpp` (motor principal), con integración en Handy y Koeboard. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,22 s para un clip de 7,8 s en Apple M4 (Metal), equivalente a un factor de tiempo real aproximado de 35x. No hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ASRISEx/parakeet-tdt_ctc-0.6b-ja-gguf | 619 M | no disponible | ja | CC-BY-4.0 | GGUF | Conversión Q8_0 para transcribe.cpp |
| nvidia/parakeet-tdt_ctc-0.6b-ja | 619 M | no disponible | ja | CC-BY-4.0 | safetensors (original) | Modelo base, CER ~9 % en JSUT basic5000 según NVIDIA |
| Otras conversiones Parakeet en transcribe.cpp | no disponible | no disponible | según variante | según modelo base | GGUF | Mismo pipeline de conversión, sin datos comparativos publicados |

No se dispone de información suficiente para comparar con alternativas ASR japonesas de otros autores (por ejemplo, Whisper o modelos de la familia ReazonSpeech) en términos de parámetros, contexto o rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en japonés; no soporta otros idiomas.
- Solo se publica una cuantización Q8_0; no hay variantes Q4, Q5 ni F16 en el repositorio.
- La cabeza CTC auxiliar se descarta en esta conversión, por lo que no se puede usar el modo CTC del modelo original.
- No hay benchmarks públicos sobre esta conversión; el único dato de referencia es el CER del modelo original reportado por NVIDIA.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o vocabulario técnico no cubierto por ReazonSpeech v2.0.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero requiere citar al autor original y respetar los términos de la licencia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de uso en producción ni validación comunitaria.
- La latencia documentada corresponde únicamente a Apple M4 con Metal; no hay datos para otras plataformas.

## Enlaces

- HuggingFace: https://huggingface.co/ASRISEx/parakeet-tdt_ctc-0.6b-ja-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicación Handy: https://github.com/cjpais/handy
- Aplicación Koeboard: https://github.com/ASRISE/koeboard
