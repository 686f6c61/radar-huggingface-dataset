# LuoYiSULIXAY/fastconformer-streaming-lao

## Resumen

`fastconformer-streaming-lao` es un modelo de reconocimiento automático del habla (ASR) para lao, desarrollado por el usuario LuoYiSULIXAY (SULIXAY VILAIPHONE) y publicado en Hugging Face. Se trata de un fine-tuning del modelo `nvidia/stt_en_fastconformer_hybrid_large_streaming_multi` de NVIDIA, adaptado a un idioma de bajos recursos como el lao mediante la librería NeMo. El modelo está pensado para transcripción en streaming, con una arquitectura híbrida RNN-T/CTC y cache-aware que permite procesar audio de forma incremental.

El modelo resuelve el problema de la escasez de sistemas ASR de calidad para lao, un idioma con pocos recursos digitales y una tradición de escritura sin separación de palabras, lo que complica la tokenización y la evaluación. Al partir de un checkpoint inglés grande y aplicar fine-tuning, el autor busca aprovechar el conocimiento acústico previo para reducir la necesidad de datos etiquetados en lao.

Es relevante ahora porque los modelos ASR multilingües de código abierto rara vez cubren idiomas del sudeste asiático con calidad suficiente, y este tipo de adaptaciones de bajo coste (el repositorio ocupa solo 0,5 GB) permiten a desarrolladores e investigadores desplegar transcripción en tiempo real para lao sin depender de servicios propietarios. La licencia CC-BY-4.0 facilita su uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (RNN-T + CTC), cache-aware, streaming |
| Parámetros totales | no disponible (checkpoint base NVIDIA "large"; el repo ocupa 0,5 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio en streaming; look-ahead de 480 ms declarado en benchmarks) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | lao (lo) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repo NeMo, librería `nemo`; tamaño 0,5 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer, una variante del Conformer que reduce el coste computacional mediante downsampling de la secuencia de entrada, combinada con un decodificador híbrido RNN-T y CTC. La variante "streaming multi" del checkpoint base de NVIDIA incorpora mecanismos cache-aware que permiten inferencia incremental con un look-ahead configurable; los benchmarks declarados corresponden a un look-ahead de 480 ms.

El entrenamiento consiste en un fine-tuning supervisado sobre el checkpoint inglés `nvidia/stt_en_fastconformer_hybrid_large_streaming_multi`. No se dispone de información sobre el volumen de datos de entrenamiento en lao, la composición del corpus, el número de tokens de audio ni si se aplicaron técnicas de aumentación o regularización específicas. Tampoco se indica si hubo etapas de destilación, adaptación de vocabulario o ajuste del tokenizador para el lao, un idioma sin separadores de palabra explícitos.

## Capacidades

- Reconocimiento automático del habla en lao, con salida de transcripción en texto.
- Modo streaming con decodificación incremental y look-ahead de 480 ms, adecuado para subtitulado en vivo.
- Decodificación híbrida RNN-T y CTC, lo que permite elegir entre latencia y precisión según el caso.
- Arquitectura cache-aware que mantiene estado entre fragmentos de audio para transcripciones continuas.
- Soporte de inferencia por lotes o en tiempo real a través de la librería NeMo.
- No se ha documentado soporte de tool calling, agentes, visión, audio multimodal ni modos de razonamiento extendido.

## Casos de uso

- Subtitulado en directo de reuniones y eventos en lao: el modo streaming con look-ahead de 480 ms permite generar subtítulos con latencia baja mientras se habla, sin esperar a que termine la intervención.
- Transcripción de reuniones y actas: los benchmarks declarados sobre el conjunto "meeting2" (529 clips, CER 10,62 %) indican que el modelo está ajustado para audio conversacional de reuniones, útil para generar actas automáticas.
- Atención al cliente en centros de contacto lao: transcripción de llamadas para análisis de calidad, búsqueda de palabras clave y cumplimiento normativo, aprovechando el decodificador CTC para transcripción por lotes.
- Indexación y búsqueda de archivos de audio: conversión de grabaciones históricas en lao a texto buscable, con el modelo ejecutándose en modo offline sobre lotes.
- Accesibilidad: generación de subtítulos para vídeo bajo demanda en lao, integrable en pipelines de procesamiento de medios mediante NeMo.
- Investigación en ASR de bajos recursos: el modelo sirve como línea base y punto de partida para fine-tuning adicional en lao o en idiomas relacionados, dado su tamaño reducido (0,5 GB) y licencia permisiva.
- Asistentes de voz locales: integración en aplicaciones de dictado o comandos de voz en lao, con despliegue en servidor mediante NeMo y sin dependencia de APIs propietarias.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de evaluación | Métrica | Valor | Configuración |
|---|---|---|---|
| Lao ASR v1 (meeting2, 529 clips) | CER (sin espacios) | 10,62 % | RNN-T, look-ahead 480 ms |
| Lao ASR v1 (test_blind, 247 clips) | CER (sin espacios) | 3,30 % | RNN-T, look-ahead 480 ms |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval o GSM8K no aplican a un modelo ASR), ni métricas WER, ni resultados para el decodificador CTC.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,5 GB, por lo que la inferencia en FP32 requiere aproximadamente 1-2 GB de VRAM, cifra estimada a partir del tamaño del checkpoint y no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en tiempo real; A100, H100 o RTX 4090 para procesamiento por lotes de alto throughput.
- GPU de consumo: cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: NeMo (librería nativa del modelo), con posibilidad de exportación a ONNX o TensorRT para optimización; no se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no están orientados a ASR.
- Latencia y throughput: no disponibles; el look-ahead de 480 ms acota la latencia algorítmica del modo streaming, pero no se han publicado cifras de RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastconformer-streaming-lao | Lao | FastConformer híbrido RNN-T/CTC | Sí (480 ms look-ahead) | CC-BY-4.0 | Gated en Hugging Face |
| nvidia/stt_en_fastconformer_hybrid_large_streaming_multi | Inglés | FastConformer híbrido RNN-T/CTC | Sí | no disponible en la información | Hugging Face (NVIDIA) |
| LuoYiSULIXAY/whisper-lao-finetuned_laonlp | Lao | Whisper (transformer encoder-decoder) | No documentado | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente para lao; no se ha evaluado su comportamiento en otros idiomas y probablemente degrade en code-switching.
- Los resultados de CER declarados por el autor no están verificados de forma independiente y proceden de conjuntos de evaluación propios ("meeting2", "test_blind"), lo que limita su comparabilidad.
- El lao no separa palabras con espacios; la métrica CER "sin espacios" es sensible a errores de segmentación y puede no reflejar la calidad percibida.
- Riesgo de alucinación y de transcripciones plausibles pero incorrectas en audio con ruido, acentos no representados o vocabulario técnico ausente del corpus de entrenamiento.
- No se documentan sesgos demográficos, dialectales ni de género; al ser un idioma de bajos recursos, es probable que el rendimiento varíe según la variedad dialectal del lao.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige citar al autor y conservar el aviso de licencia; conviene revisar también las condiciones del modelo base de NVIDIA.
- El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatización de pipelines.
- No se dispone de información sobre cuantizaciones oficiales, por lo que el despliegue en entornos con poca memoria requiere validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuoYiSULIXAY/fastconformer-streaming-lao
- Perfil del autor: https://huggingface.co/LuoYiSULIXAY
- Modelos del autor: https://huggingface.co/LuoYiSULIXAY/models
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_hybrid_large_streaming_multi
- Modelo Whisper lao del mismo autor: https://huggingface.co/LuoYiSULIXAY/whisper-lao-finetuned_laonlp
