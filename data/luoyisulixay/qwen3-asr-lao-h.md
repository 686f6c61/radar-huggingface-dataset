# LuoYiSULIXAY/qwen3-asr-lao-H

## Resumen

Qwen3-ASR Lao (H) es un modelo de reconocimiento automático del habla (ASR) especializado en lao (ພາສາລາວ), desarrollado por VILAIPHONE Sulixay, Savath Saypadith, Makmeephon Xaysana y SOUNAKHEN Phonesavanh (CEIT), en colaboración con Laligence. Se trata de un ajuste fino mediante LoRA del modelo Qwen/Qwen3-ASR-1.7B de Alibaba, con 2.038.052.480 parámetros, posteriormente fusionado en un único checkpoint fp16.

El modelo resuelve un problema concreto: el modelo base no incluye el lao entre sus idiomas soportados, por lo que este ajuste habilita la transcripción de habla lao a escritura lao sin espacios entre palabras, siguiendo una política ortográfica explícita. Es relevante para la comunidad de procesamiento de lenguas de bajos recursos, ya que el lao dispone de pocos sistemas ASR abiertos y este trabajo documenta con transparencia su pipeline de datos, que combina habla leída, reuniones revisadas por nativos y una proporción significativa de habla sintética.

La licencia Apache-2.0 y el formato safetensors nativo de Transformers facilitan su integración en pipelines existentes. El modelo está pensado para investigación, accesibilidad, borradores de subtitulado y recolección de datos, siempre con revisión humana en contextos donde la precisión sea crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-ASR), ajuste fino LoRA fusionado en fp16 |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; se recomiendan clips de hasta ~15 segundos |
| Tipos de cuantizacion | no disponible (checkpoint publicado en fp16) |
| Idiomas soportados | lao (lo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B, un modelo ASR de la familia Qwen3 basado en transformer, y se ajusta mediante LoRA sobre dicho modelo base. El entrenamiento se realizó con batch 60 en 3 GPUs, con parada temprana según el CER de validación (mejor checkpoint en el paso 4.000). Posteriormente, el adaptador se fusionó en los pesos base en fp16.

Los datos de entrenamiento combinan cuatro fuentes: 15,4 horas de habla leída lao (laoCorectVoice) con transcripciones humanas de hablantes del norte, centro y sur de Laos; 15,0 horas de habla leída pública (hg_shunya, incluyendo FLEURS); 5,0 horas de habla de reuniones lao procedentes de vídeos públicos, con 3.031 clips y cada etiqueta revisada por un hablante nativo; y 106,9 horas de habla sintética lao generada con clonación de voz VoxCPM2 (frases de noticias y legales, con voces de referencia únicamente de hablantes de entrenamiento). El total de habla real asciende a 35,7 horas, con una proporción sintético-real de aproximadamente 3:1. No se publican los audios ni las etiquetas de los vídeos públicos, y ningún registro de los conjuntos de evaluación aparece en entrenamiento.

## Capacidades

- Reconocimiento automático del habla en lao, con salida en escritura lao sin espacios entre palabras.
- Transcripción de habla leída y de reuniones formales en lao.
- Normalización ortográfica conforme a una política definida: uso de ຳ (no ໍາ), ໜ, ໝ, ຫຼ (no ຫນ, ຫມ, ຫລ, salvo abreviaturas como ທຫລ), colapso de marcas repetidas y desarrollo de ໆ.
- Procesamiento de audio mono a 16 kHz (recomendado), con carga mediante el paquete `qwen_asr`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo ASR).
- Capacidades multilingües: únicamente lao; el modelo base no lista lao como idioma soportado, por lo que es necesario añadirlo a `SUPPORTED_LANGUAGES` antes de transcribir.
- Capacidades especiales: no disponible (sin visión, audio de entrada únicamente, sin modo thinking documentado).

## Casos de uso

- Subtitulado y accesibilidad de contenido audiovisual en lao: el modelo transcribe clips de hasta ~15 segundos, por lo que se puede segmentar el audio con VAD (por ejemplo Silero VAD) y generar borradores de subtítulos que después revise un hablante nativo.
- Documentación de reuniones formales: con un CER de 8,77 en el conjunto meeting2 (1.529 clips de reuniones formales lao), es adecuado para generar actas preliminares de reuniones que luego se corrigen manualmente.
- Investigación en lenguas de bajos recursos: sirve como línea base reproducible para ASR lao y como punto de partida para experimentos con datos sintéticos, dado que documenta la proporción sintético-real (3:1) y el efecto de 5 horas de habla de reuniones revisada.
- Recolección y anotación de datos: puede transcribir grandes volúmenes de audio lao para preanotar corpus que después se revisan, reduciendo el coste de anotación manual.
- Transcripción de habla leída para aplicaciones de dictado: entrenado sobre 30,4 horas de habla leída (laoCorectVoice y hg_shunya), es apropiado para dictado de frases y lectura de textos.
- Evaluación comparativa de sistemas ASR lao: los conjuntos meeting2 y test_blind y la política ortográfica documentada permiten comparar modelos bajo criterios homogéneos de CER sin espacios.
- Integración en pipelines de Transformers: al cargarse con la librería `transformers` y pesos safetensors, se puede desplegar en servicios de transcripción por lotes o en tiempo casi real con GPUs convencionales.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (CER sin espacios, tras normalizar referencia y salida a la política ortográfica):

| Conjunto de prueba | Clips | Dominio | CER (sin espacios) |
|---|---:|---|---:|
| meeting2 | 1.529 | reuniones formales lao (3 vídeos) | 8,77 |
| test_blind | 247 | mixto; transcrito por un revisor que no vio la salida del modelo | 2,56 |

En meeting2, el modelo mejora en 1,15 puntos de CER respecto a la misma receta sin las 5 horas de habla de reuniones revisada (intervalo de confianza bootstrap del 95 %: 0,87–1,43). Los clips de test_blind se seleccionaron con un modelo anterior, por lo que ese conjunto lo favorece y las diferencias allí no son significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se publica en fp16 con 2.038.052.480 parámetros, lo que supone aproximadamente 4,1 GB de pesos; se recomienda reservar al menos 6–8 GB de VRAM para activaciones y audio de entrada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el modelo se ha probado con `device_map="cuda:0"` y `dtype=torch.float16`.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: paquete `qwen_asr` del proyecto Qwen3-ASR sobre Transformers; el repositorio incluye la etiqueta `endpoints_compatible` para despliegue en endpoints de Hugging Face. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles. El modelo está configurado con `max_inference_batch_size=1` y `max_new_tokens=256`, y se recomiendan clips de hasta ~15 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (meeting2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-asr-lao-H | 2.038.052.480 | no disponible | 8,77 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B (base) | ~1,7 B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Receta sin habla de reuniones revisada (ablación del autor) | no disponible | no disponible | 9,92 (1,15 puntos peor) | no aplica | no aplica |

No se dispone de datos de otros sistemas ASR lao comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado mayoritariamente con habla leída y reuniones formales; se espera un mayor error en conversación informal, acentos regionales marcados, hablantes solapados, música o ruido.
- Los errores más frecuentes se producen en texto lao mezclado con palabras tailandesas o inglesas, nombres propios y de lugar, y números.
- Parte de las referencias de meeting2 fueron elaboradas por revisores que editaron un borrador del modelo; esas etiquetas pueden favorecer al modelo que generó el borrador, por lo que las diferencias pequeñas en meeting2 deben interpretarse con cautela.
- El modelo puede repetir ocasionalmente una frase en entradas largas o con ruido.
- El modelo base no lista el lao como idioma soportado; es necesario añadirlo manualmente a `SUPPORTED_LANGUAGES` antes de transcribir.
- Textos con convenciones ortográficas distintas a la política documentada mostrarán "errores" que son solo diferencias de grafía.
- Uso previsto limitado a investigación, accesibilidad, borradores de subtitulado y recolección de datos, con revisión humana donde la precisión importe. No debe usarse para identificar o vigilar personas ni como único registro en contextos legales, médicos o de alto riesgo.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las condiciones de atribución de la licencia.
- No se publican los audios ni las etiquetas de los vídeos públicos utilizados en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuoYiSULIXAY/qwen3-asr-lao-H
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio del proyecto Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Paper del pipeline de datos: en preparación (no disponible)
